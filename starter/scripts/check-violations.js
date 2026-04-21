#!/usr/bin/env node

// check-violations.js — 인포마인드 UX 규칙 위반 패턴 탐지
// 훅(PostToolUse)과 CI 모두에서 호출된다.
// 종료 코드: 0 = 통과, 1 = 경고(warning), 2 = 오류(error)

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const ROOT = path.resolve(__dirname, '..')
const SCSS_DIR = path.join(ROOT, 'src/scss')
const SNIPPETS_DIR = path.join(ROOT, 'src/snippets')
const PLAYGROUND_DIR = path.join(ROOT, 'src/playground')
const SITE_DIR = path.join(ROOT, 'site')

// 단일 파일 모드: node check-violations.js [파일경로]
const TARGET_FILE = process.argv[2] || null

// ─── 출력 헬퍼 ───

const RESET = '\x1b[0m'
const RED = '\x1b[31m'
const YELLOW = '\x1b[33m'
const GREEN = '\x1b[32m'
const CYAN = '\x1b[36m'
const DIM = '\x1b[2m'

let errorCount = 0
let warnCount = 0

function error(file, line, msg, code) {
  const loc = line ? `${file}:${line}` : file
  console.error(`${RED}[ERROR]${RESET} ${loc}\n  ${msg}${code ? `\n  ${DIM}${code}${RESET}` : ''}`)
  errorCount++
}

function warn(file, line, msg, code) {
  const loc = line ? `${file}:${line}` : file
  console.warn(`${YELLOW}[WARN]${RESET}  ${loc}\n  ${msg}${code ? `\n  ${DIM}${code}${RESET}` : ''}`)
  warnCount++
}

function rel(p) {
  return path.relative(ROOT, p)
}

// ─── SCSS 위반 체크 ───

// 토큰으로 대체해야 하는 하드코딩 패턴
const HARDCODED_COLOR = /(?:color|background|border-color|fill|stroke|box-shadow|outline-color)\s*:\s*(#[0-9a-fA-F]{3,8}|rgb\(|rgba\()/
const HARDCODED_SPACING = /(?:^|\s)(?:padding|margin|gap|top|right|bottom|left|width|height|font-size|border-radius)\s*:\s*(\d+px)/
const IMPORT_USED = /@import\s/
const BEM_DOUBLE_ELEMENT = /\.([\w-]+)__([\w-]+)__([\w-]+)/
const VISUAL_MODIFIER = /--(?:gray|blue|red|green|yellow|white|black|dark|light)\b/
const IMPORTANT_USED = /!important/

// 토큰 스케일 예외: 1px, 2px, 3px (보더 등은 허용)
const ALLOWED_PX = /^(?:1|2|3)px$/

function checkScssFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')
  const relPath = rel(filePath)

  // 자동 생성 파일 제외
  if (lines[0] && lines[0].includes('자동 생성')) return

  // 토큰 정의 파일 / docs 스타일시트 / 프로젝트 오버라이드 제외
  // docs.scss는 문서 전용이라 컴포넌트 토큰 규칙 적용 불필요
  const isTokenFile = filePath.includes('1-settings') || filePath.includes('_project-overrides')
  const isDocsFile = path.basename(filePath) === 'docs.scss'

  lines.forEach((line, i) => {
    const lineNum = i + 1
    const trimmed = line.replace(/\/\/.*$/, '').trim() // 주석 제거

    if (!trimmed) return

    // @import 금지
    if (IMPORT_USED.test(trimmed)) {
      error(relPath, lineNum, '@import 금지. @use 또는 @forward를 사용하라', trimmed)
    }

    // BEM 2단계 element 중첩
    if (BEM_DOUBLE_ELEMENT.test(trimmed)) {
      const match = trimmed.match(BEM_DOUBLE_ELEMENT)
      error(relPath, lineNum, `BEM 2단계 element 중첩 금지: .${match[1]}__${match[2]}__${match[3]}`, trimmed)
    }

    // 시각적 modifier
    if (VISUAL_MODIFIER.test(trimmed) && trimmed.includes('&--')) {
      warn(relPath, lineNum, '시각적 modifier 이름 지양. 의미적 이름 사용 (--primary, --secondary 등)', trimmed)
    }

    // !important 금지 (utility 레이어 / docs 제외)
    if (IMPORTANT_USED.test(trimmed) && !filePath.includes('7-utilities') && !isDocsFile) {
      warn(relPath, lineNum, '!important 사용 지양. z-index나 우선순위를 검토하라', trimmed)
    }

    // 토큰 파일 / docs 제외 하드코딩 검사
    if (!isTokenFile && !isDocsFile) {
      // CSS 점진적 개선(progressive enhancement) 패턴 감지:
      // rgb/rgba 하드코딩 바로 다음 줄에 color-mix() 토큰 버전이 있으면 허용
      const nextTrimmed = (lines[i + 1] || '').replace(/\/\/.*$/, '').trim()
      const isProgressiveFallback = HARDCODED_COLOR.test(trimmed) && nextTrimmed.includes('color-mix(')

      if (HARDCODED_COLOR.test(trimmed) && !isProgressiveFallback) {
        error(relPath, lineNum, '하드코딩 색상 금지. var(--color-*) 토큰을 사용하라', trimmed)
      }

      // 하드코딩 간격/크기
      if (HARDCODED_SPACING.test(trimmed)) {
        const pxMatch = trimmed.match(/(\d+px)/)
        const px = pxMatch ? pxMatch[1] : ''
        if (px && !ALLOWED_PX.test(px)) {
          warn(relPath, lineNum, `하드코딩 px 값 (${px}). var(--spacing-*) 또는 rem 토큰을 사용하라`, trimmed)
        }
      }
    }
  })
}

// ─── HTML 위반 체크 ───

const INLINE_STYLE = /\bstyle\s*=/
// CSS 커스텀 프로퍼티만 있는 style 속성은 허용: style="--var: value" 패턴
const INLINE_STYLE_CUSTOM_PROP_ONLY = /\bstyle\s*=\s*["'][^"']*--[\w-]+:[^"']*["']/
const BEM_DOUBLE_ELEMENT_CLASS = /class="[^"]*[\w-]+__[\w-]+__[\w-]+/
const MISSING_ALT = /<img(?![^>]*\balt\s*=)[^>]*>/
const CLICK_ON_DIV = /<(?:div|span)[^>]+onclick/

function checkHtmlFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')
  const relPath = rel(filePath)

  lines.forEach((line, i) => {
    const lineNum = i + 1
    const trimmed = line.trim()

    if (!trimmed) return

    // 인라인 스타일 — CSS 커스텀 프로퍼티(--var: value)만 있는 경우는 허용
    if (INLINE_STYLE.test(trimmed) && !INLINE_STYLE_CUSTOM_PROP_ONLY.test(trimmed)) {
      warn(relPath, lineNum, '인라인 style 금지. BEM 클래스 + SCSS를 사용하라', trimmed.slice(0, 80))
    }

    // BEM 2단계 element
    if (BEM_DOUBLE_ELEMENT_CLASS.test(trimmed)) {
      warn(relPath, lineNum, 'BEM 2단계 element 중첩 클래스 금지', trimmed.slice(0, 80))
    }

    // alt 누락
    if (MISSING_ALT.test(trimmed)) {
      error(relPath, lineNum, '<img>에 alt 속성 누락. 장식용이면 alt=""를 명시하라', trimmed.slice(0, 80))
    }

    // div/span에 onclick
    if (CLICK_ON_DIV.test(trimmed)) {
      warn(relPath, lineNum, '<div>/<span>에 onclick 금지. <button> 또는 <a>를 사용하라', trimmed.slice(0, 80))
    }
  })
}

// ─── 컴포넌트 인덱스 일관성 체크 ───

function checkComponentIndex() {
  const indexPath = path.join(SCSS_DIR, '6-components', '_index.scss')
  if (!fs.existsSync(indexPath)) return

  const indexContent = fs.readFileSync(indexPath, 'utf-8')
  const componentsDir = path.join(SCSS_DIR, '6-components')

  const scssFiles = fs.readdirSync(componentsDir)
    .filter(f => f.startsWith('_') && f.endsWith('.scss') && f !== '_index.scss')
    .map(f => f.replace(/^_/, '').replace(/\.scss$/, ''))

  const forwardedNames = []
  indexContent.split('\n').forEach(line => {
    const match = line.match(/@forward\s+['"]([^'"]+)['"]/)
    if (match) forwardedNames.push(match[1])
  })

  scssFiles.forEach(name => {
    if (!forwardedNames.includes(name)) {
      error(rel(indexPath), null, `_${name}.scss가 존재하지만 _index.scss에 @forward '${name}'이 없다`)
    }
  })
}

// ─── 파일 수집 ───

function collectFiles(dir, ext, excludes = []) {
  if (!fs.existsSync(dir)) return []
  const results = []

  function walk(current) {
    fs.readdirSync(current).forEach(name => {
      const full = path.join(current, name)
      const stat = fs.statSync(full)
      if (stat.isDirectory()) {
        walk(full)
      } else if (name.endsWith(ext) && !excludes.some(e => full.includes(e))) {
        results.push(full)
      }
    })
  }

  walk(dir)
  return results
}

// ─── 메인 ───

function main() {
  console.log(`${CYAN}[check-violations]${RESET} 인포마인드 UX 위반 패턴 검사 시작...\n`)

  if (TARGET_FILE) {
    // 단일 파일 모드
    const abs = path.resolve(TARGET_FILE)
    if (!fs.existsSync(abs)) {
      console.error(`파일을 찾을 수 없음: ${TARGET_FILE}`)
      process.exit(1)
    }
    if (abs.endsWith('.scss')) checkScssFile(abs)
    if (abs.endsWith('.html')) checkHtmlFile(abs)
  } else {
    // 전체 스캔 모드
    const scssFiles = collectFiles(SCSS_DIR, '.scss', ['node_modules'])
    scssFiles.forEach(checkScssFile)

    // playground는 데모용이라 인라인 style 등 위반 체크 제외
    const htmlFiles = [
      ...collectFiles(SNIPPETS_DIR, '.html'),
      ...collectFiles(SITE_DIR, '.html', ['_site', 'node_modules']),
    ]
    htmlFiles.forEach(checkHtmlFile)

    checkComponentIndex()
  }

  console.log('')

  if (errorCount === 0 && warnCount === 0) {
    console.log(`${GREEN}✓ 위반 없음${RESET}`)
    process.exit(0)
  }

  if (errorCount > 0) {
    console.error(`${RED}오류 ${errorCount}개${RESET}${warnCount > 0 ? `, ${YELLOW}경고 ${warnCount}개${RESET}` : ''}`)
    process.exit(2)
  }

  // 경고만 있을 때
  console.warn(`${YELLOW}경고 ${warnCount}개${RESET} (오류 없음)`)
  process.exit(1)
}

main()
