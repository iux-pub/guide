#!/usr/bin/env node

// check-html-structure.js — info-design HTML 구조 컨트랙트 자동 검출
// R-15: 기존 인포마인드 HTML 패턴을 우선 유지하되 시맨틱 보강이 필요한지 점검
// R-16: 인터랙티브 컴포넌트의 필수 ARIA 속성 누락
// R-17: 비-BEM 상태 클래스 (.is-*, .has-*)
// R-18: 시각적 단어 modifier (--blue, --big, --rounded 등)
//
// 단일 소스: skill/references/html-semantics.md
// 종료 코드: 0 = 통과 또는 경고만, 2 = 오류
//   STRICT=1 시 경고도 1로 실패 처리

const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const SNIPPETS_DIR = path.join(ROOT, 'src/snippets')
const PLAYGROUND_DIR = path.join(ROOT, 'src/playground')
const SITE_DIR = path.join(ROOT, 'site')

const TARGET_FILES = process.argv.slice(2)

// ─── 출력 헬퍼 ─────────────────────────────────────────

const RESET = '\x1b[0m'
const RED = '\x1b[31m'
const YELLOW = '\x1b[33m'
const GREEN = '\x1b[32m'
const DIM = '\x1b[2m'

let errorCount = 0
let warnCount = 0

function error(file, line, msg, code, rule) {
  const loc = line ? `${file}:${line}` : file
  console.error(`${RED}[${rule}]${RESET} ${loc}\n  ${msg}${code ? `\n  ${DIM}${code}${RESET}` : ''}`)
  errorCount++
}

function warn(file, line, msg, code, rule) {
  const loc = line ? `${file}:${line}` : file
  console.warn(`${YELLOW}[${rule}]${RESET}  ${loc}\n  ${msg}${code ? `\n  ${DIM}${code}${RESET}` : ''}`)
  warnCount++
}

const rel = (p) => path.relative(ROOT, p)

// ─── R-15: 컴포넌트 root 태그 매핑 참고 (html-semantics.md 기준) ──────────────────────
//
// allowedTags: 허용 태그(또는 태그 + 필수 속성)
//   - 문자열: 해당 태그
//   - 객체: { tag, role, requiredAttrs } — 태그 + 필수 속성 같이 검증
//
// 예: card는 article/section/a 어느 것이든 OK
//     modal은 dialog 또는 div with role="dialog"
//     breadcrumb은 nav이고 aria-label 필요

const COMPONENT_ROOT_MAPPING = {
  // 그룹 A — 폼/액션
  'btn': { allowedTags: ['button', 'a'], note: 'a 사용 시 href 필수, button은 type 권장' },
  'check': { allowedTags: ['label'], note: 'input을 감싸는 label' },
  'radio': { allowedTags: ['label'], note: 'input을 감싸는 label' },
  'file-upload': { allowedTags: ['label'], note: 'input[type=file]을 감싸는 label' },
  'form-field': { allowedTags: ['div', 'fieldset'], note: 'fieldset은 그룹 시' },
  'select': { allowedTags: ['div', 'select'], note: 'div(form-field로 감쌈) 또는 select 직접' },
  'switch': { allowedTags: ['label'], note: 'input[type=checkbox role=switch]을 감싸는 label' },

  // 그룹 B — 컨테이너/레이아웃
  'accordion': { allowedTags: ['div'], note: '내부는 details 또는 button+aria 패턴' },
  'card': { allowedTags: ['article', 'section', 'a'], note: '독립 콘텐츠는 article, 관련 그룹은 section, 전체 링크는 a' },
  'disclosure': { allowedTags: ['button'], note: '트리거 자체가 root' },
  'modal': { allowedTags: ['dialog', 'div'], requireRoleDialog: true, note: 'div 사용 시 role="dialog" aria-modal="true" 필수' },
  'side-panel': { allowedTags: ['aside'], note: 'role="dialog" aria-labelledby 필수' },
  'tab': { allowedTags: ['div'], note: '내부 tablist는 role="tablist"' },

  // 그룹 C — 내비게이션
  'breadcrumb': { allowedTags: ['nav'], requireAriaLabel: true, note: 'nav에 aria-label="페이지 경로"' },
  'site-header': { allowedTags: ['header'], note: '사이트 헤더' },
  'main-menu': { allowedTags: ['nav'], requireAriaLabel: true, note: 'nav에 aria-label="주 메뉴"' },
  'pagination': { allowedTags: ['nav'], requireAriaLabel: true, note: 'nav에 aria-label="페이지 내비게이션"' },

  // 그룹 D — 피드백
  'alert': { allowedTags: ['div'], requireRoleAlertOrStatus: true, note: 'role="alert" 또는 role="status"' },
  'badge': { allowedTags: ['span'], note: 'dot(텍스트 없음)은 aria-label 필수' },
  'progress': { allowedTags: ['div'], note: '내부 progress 또는 div[role=progressbar]' },
  'spinner': { allowedTags: ['span'], requireRoleStatus: true, note: 'role="status" + aria-label' },
  'step-indicator': { allowedTags: ['ol'], requireAriaLabel: true, note: 'ol에 aria-label="진행 단계"' },
  'tag': { allowedTags: ['span', 'button', 'a'], note: '인터랙티브일 때만 button/a' },
  'toast-stack': { allowedTags: ['div'], note: '토스트 컨테이너' },
  'toast': { allowedTags: ['div'], requireRoleAlertOrStatus: true, note: 'role="status"(polite) 또는 role="alert"(긴급)' },
  'tooltip': { allowedTags: ['div', 'span'], requireRoleTooltip: true, note: 'role="tooltip" + 트리거에 aria-describedby' },
  'tooltip-trigger': { allowedTags: ['button', 'a'], note: 'aria-describedby로 tooltip 연결' },

  // 그룹 E — 콘텐츠/표현
  'calendar': { allowedTags: ['div'], requireRoleApplication: true, note: 'role="application" aria-label' },
  'carousel': { allowedTags: ['div'], requireAriaRoledescription: true, note: 'aria-roledescription="carousel" aria-label' },
  'list': { allowedTags: ['ul', 'ol', 'dl'], note: '의미에 따라 ul/ol/dl' },
  'table-wrap': { allowedTags: ['div'], note: '반응형 스크롤 래퍼' },
  'table': { allowedTags: ['table'], note: 'caption 또는 aria-label 필수' }
}

// ─── R-16: 인터랙티브 위젯의 필수 ARIA 속성 ───────────────────────────
//
// 키: 클래스명에 해당하는 BEM Block
// 값: 해당 컴포넌트 root에 반드시 있어야 하는 속성 (정규식 매칭)

const REQUIRED_ARIA = {
  'modal': {
    requireAny: [
      { attrs: ['role="dialog"', 'aria-modal="true"', /aria-labelledby=|aria-label=/] }
    ],
    desc: 'role="dialog" + aria-modal="true" + aria-labelledby/aria-label (또는 네이티브 <dialog>)',
    nativeDialogOk: true // <dialog> 태그는 자체적으로 role=dialog 동등
  },
  'side-panel': {
    requireAll: ['role="dialog"', /aria-labelledby=|aria-label=/],
    desc: 'role="dialog" + aria-labelledby/aria-label'
  },
  'tooltip': {
    requireAll: ['role="tooltip"'],
    desc: 'role="tooltip"'
  },
  'disclosure': {
    requireAll: [/aria-expanded=/, /aria-controls=/],
    desc: 'aria-expanded + aria-controls'
  },
  'breadcrumb': {
    requireAll: [/aria-label=/],
    desc: 'aria-label (페이지 경로 설명)'
  },
  'main-menu': {
    requireAll: [/aria-label=/],
    desc: 'aria-label (메뉴 설명)'
  },
  'pagination': {
    requireAll: [/aria-label=/],
    desc: 'aria-label (페이지 내비게이션 설명)'
  },
  'carousel': {
    requireAll: [/aria-roledescription="carousel"/],
    desc: 'aria-roledescription="carousel"'
  },
  'calendar': {
    requireAll: [/role="application"/, /aria-label=/],
    desc: 'role="application" + aria-label'
  },
  'step-indicator': {
    requireAll: [/aria-label=/],
    desc: 'aria-label (진행 단계 설명)'
  }
}

// ─── R-17: 비-BEM 상태 클래스 ───────────────────────────────────
// .is-active, .has-error, .is-open 같은 패턴 검출
// 단, 일부는 라이브러리 호환(.is-* 가 React/Vue lib에서 사용)이라 예외 가능
// 1차는 warn으로 시작 — 1개월 운영 후 error 승급

const NON_BEM_STATE_CLASS = /\bclass\s*=\s*["'][^"']*?\b(is|has)-[a-z][\w-]*/g

// ─── R-18: 시각적 단어 modifier 블랙리스트 ───────────────────────
// modifier 부분(--xxx)에서 시각적 단어 사용 검출

const FORBIDDEN_MODIFIER_WORDS = [
  // 크기 — 시각적 표현
  'big', 'huge', 'tiny', 'mini',
  // 색상 — 시각적 표현
  'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink',
  'black', 'white', 'gray', 'grey', 'dark', 'light',
  // 장식 — 시각적 표현
  'rounded', 'circle', 'square', 'shadow', 'glow', 'flat',
  'bold', 'italic', 'underline',
  // 기타
  'wide', 'narrow', 'thick', 'thin'
]
// 주의: --xl, --xxl은 KRDS 정의가 아님 (KRDS는 xsmall/small/medium/large/xlarge 표준)
// 단, --xl/--xxl 이미 사용 중이면 별도 정리 필요. 일단 미검출(false negative 허용).

const FORBIDDEN_MODIFIER_RE = new RegExp(
  `\\b([a-z][\\w-]*?)--(${FORBIDDEN_MODIFIER_WORDS.join('|')})\\b`,
  'g'
)

// ─── HTML 코드 블록 추출 ────────────────────────────────────
// Markdown 파일에서 ```html 블록 추출
function extractHtmlBlocks(content) {
  const blocks = []
  const re = /```html\s*\n([\s\S]*?)\n```/g
  let m
  while ((m = re.exec(content)) !== null) {
    const blockText = m[1]
    const startLine = content.slice(0, m.index).split('\n').length
    blocks.push({ text: blockText, startLine })
  }
  return blocks
}

// HTML 태그 추출 — 정규식 기반 (간단 케이스만)
// 더 견고하려면 node-html-parser 권장 (현 시점에선 정규식 충분)
function findClassUsage(html, className) {
  // class="...className..." 매치
  const re = new RegExp(`<(\\w+)\\b[^>]*\\bclass\\s*=\\s*["'][^"']*\\b${className.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\b[^"']*["'][^>]*>`, 'g')
  const matches = []
  let m
  while ((m = re.exec(html)) !== null) {
    matches.push({
      tag: m[1],
      fullMatch: m[0],
      index: m.index
    })
  }
  return matches
}

// ─── 검사 본체 ─────────────────────────────────────────────

function checkHtml(html, filePath, baseLineNum = 1) {
  const lines = html.split('\n')

  // R-17: 비-BEM 상태 클래스
  lines.forEach((line, idx) => {
    NON_BEM_STATE_CLASS.lastIndex = 0
    let m
    while ((m = NON_BEM_STATE_CLASS.exec(line)) !== null) {
      const lineNum = baseLineNum + idx
      const stateName = m[1]
      warn(
        rel(filePath),
        lineNum,
        `[R-17] 비-BEM 상태 클래스 "${stateName}-*" 발견. BEM modifier + ARIA 속성으로 표현하세요.`,
        line.trim().slice(0, 120),
        'R-17'
      )
    }
  })

  // R-18: 시각적 단어 modifier
  lines.forEach((line, idx) => {
    FORBIDDEN_MODIFIER_RE.lastIndex = 0
    let m
    while ((m = FORBIDDEN_MODIFIER_RE.exec(line)) !== null) {
      const lineNum = baseLineNum + idx
      const block = m[1]
      const word = m[2]
      error(
        rel(filePath),
        lineNum,
        `[R-18] 시각적 단어 modifier "${block}--${word}" 발견. KRDS 의미적 어휘 사용 (예: --primary, --large, --info).`,
        line.trim().slice(0, 120),
        'R-18'
      )
    }
  })

  // R-15 + R-16: 컴포넌트별 root 태그 + ARIA 검증
  for (const [blockName, mapping] of Object.entries(COMPONENT_ROOT_MAPPING)) {
    const matches = findClassUsage(html, blockName)
    for (const match of matches) {
      // class 안에 element ('__')나 modifier ('--') 포함된 건 root가 아니므로 스킵
      const isBlockRoot = new RegExp(`class\\s*=\\s*["'][^"']*\\b${blockName.replace(/-/g, '\\-')}(?![_-])`).test(match.fullMatch)
      if (!isBlockRoot) continue

      // R-15: root 태그 점검
      const allowed = mapping.allowedTags
      if (!allowed.includes(match.tag)) {
        // 라인 번호 추정
        const beforeMatch = html.slice(0, match.index)
        const lineNum = baseLineNum + beforeMatch.split('\n').length - 1
        warn(
          rel(filePath),
          lineNum,
          `[R-15] "${blockName}" root 태그 확인: <${match.tag}> 사용. 기존 인포마인드 패턴을 우선하되, 시맨틱 보강이 필요하면 참고 태그(${allowed.map(t => `<${t}>`).join(', ')})를 검토. ${mapping.note || ''}`,
          match.fullMatch.slice(0, 120),
          'R-15'
        )
        continue
      }

      // R-16: 필수 ARIA 검증
      const ariaReq = REQUIRED_ARIA[blockName]
      if (ariaReq) {
        const tagAttrs = match.fullMatch
        let allOk = true

        // 네이티브 <dialog>는 ARIA 자동 부여 — modal에서 예외 인정
        if (ariaReq.nativeDialogOk && match.tag === 'dialog') {
          continue
        }

        if (ariaReq.requireAll) {
          for (const req of ariaReq.requireAll) {
            const ok = (req instanceof RegExp) ? req.test(tagAttrs) : tagAttrs.includes(req)
            if (!ok) { allOk = false; break }
          }
        }

        if (ariaReq.requireAny) {
          allOk = ariaReq.requireAny.some(group => {
            return group.attrs.every(req => {
              return (req instanceof RegExp) ? req.test(tagAttrs) : tagAttrs.includes(req)
            })
          })
        }

        if (!allOk) {
          const beforeMatch = html.slice(0, match.index)
          const lineNum = baseLineNum + beforeMatch.split('\n').length - 1
          error(
            rel(filePath),
            lineNum,
            `[R-16] "${blockName}" 필수 ARIA 누락: ${ariaReq.desc || '필수 속성 확인 필요'}`,
            tagAttrs.slice(0, 120),
            'R-16'
          )
        }
      }
    }
  }
}

// ─── 파일 순회 ─────────────────────────────────────────────

// 의도적으로 잘못된 예시를 포함하는 파일/경로 — 검사 제외
const SKIP_PATTERNS = [
  /\/site\/conventions\//, // 규칙 문서 — ❌ 금지 예시 포함
  /\/site\/accessibility\//, // 접근성 가이드 — "Don't" 예시 포함
  /\/src\/playground\/index\.html$/ // 색상/토큰 스케일 데모 — pg__swatch-color--gray-* 의도적 사용
]

function isSkipped(filePath) {
  return SKIP_PATTERNS.some(re => re.test(filePath))
}

function walk(dir, exts, accumulator) {
  if (!fs.existsSync(dir)) return
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === '_site' || entry.name === 'dist') continue
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walk(fullPath, exts, accumulator)
    } else if (exts.some(ext => entry.name.endsWith(ext))) {
      if (isSkipped(fullPath)) continue
      accumulator.push(fullPath)
    }
  }
}

function getTargetFiles() {
  if (TARGET_FILES.length > 0) {
    return TARGET_FILES.map(f => path.resolve(f))
  }
  const files = []
  walk(SNIPPETS_DIR, ['.md'], files)
  walk(PLAYGROUND_DIR, ['.html'], files)
  walk(SITE_DIR, ['.md', '.njk', '.html'], files)
  return files
}

// ─── 메인 ─────────────────────────────────────────────────

function main() {
  const files = getTargetFiles()
  console.log(`${DIM}HTML 구조 검사 시작 — ${files.length}개 파일${RESET}`)

  for (const filePath of files) {
    const content = fs.readFileSync(filePath, 'utf-8')
    const ext = path.extname(filePath)

    if (ext === '.md') {
      // 마크다운: ```html 블록만 검사
      const blocks = extractHtmlBlocks(content)
      for (const block of blocks) {
        checkHtml(block.text, filePath, block.startLine)
      }
    } else {
      // HTML/Nunjucks: 전체 검사
      checkHtml(content, filePath, 1)
    }
  }

  // 결과 요약
  console.log('')
  if (errorCount === 0 && warnCount === 0) {
    console.log(`${GREEN}✓ HTML 구조 위반 없음${RESET}`)
    process.exit(0)
  } else {
    console.log(`${YELLOW}경고:${RESET} ${warnCount}건${errorCount > 0 ? ` · ${RED}오류:${RESET} ${errorCount}건` : ''}`)
    const strict = process.env.STRICT === '1'
    if (errorCount > 0 || (strict && warnCount > 0)) {
      process.exit(2)
    }
    process.exit(0)
  }
}

main()
