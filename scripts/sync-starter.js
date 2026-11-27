#!/usr/bin/env node
/**
 * guide → starter 로컬 동기화 (INFOUX + Tailwind v4 시스템)
 *
 * 단일 원본: 이 저장소의 src/·tokens/·assets/·scripts/·contracts/·prompts/ 와 아래 복사 목록.
 * 생성 대상: starter/ (iux-pub/starter 저장소로 나가는 사본 — 직접 고치지 않는다)
 *
 * 사용법:
 *   npm run sync:starter        # 로컬 starter/만 갱신 (이 스크립트 — Windows·macOS·Linux 공통)
 *   npm run sync:starter:push   # scripts/sync-starter.sh --push — 이 스크립트로 로컬을 갱신한 뒤 원격에 푸시(bash)
 *
 * 복사 목록은 여기 한 곳에만 둔다. bash 스크립트는 목록을 갖지 않고 이 스크립트를 부른다.
 * 스크립트 라이브러리(scripts/lib/*.js)는 목록을 손으로 적지 않는다 — 스타터로 가는 스크립트가
 * require로 부르는 파일을 따라가며 모은다(template-signature.js가 목록에서 빠져 스타터의 R-51 검사가
 * 조용히 꺼져 있던 결함). check-harness.js가 같은 함수로 스타터 사본을 대조한다.
 *
 * starter/AGENTS.md, starter/CLAUDE.md, starter/.cursorrules, starter/package.json,
 * starter/README.md, starter/index.html은 starter 전용으로 별도 관리한다.
 */

const fs = require('node:fs')
const path = require('node:path')

const GUIDE_DIR = path.resolve(__dirname, '..')

// 스타터로 가는 진입 스크립트 — 여기에 적은 파일이 부르는 lib은 자동으로 따라간다.
// 반입·빌드(import-icons·build-icons)와 가이드 전용 빌드(build-rules·build-mcp…)는 원본 저장소의 일이라 넘기지 않는다.
const STARTER_SCRIPTS = [
  'build-tokens.js',
  'check-violations.js',
  'check-html-structure.js',
  'check-contrast.js',
  // 납품 게이트(CT-03 contentSources·자리 표기·예외 만료, CT-04 디자인 계획)와 R-47 법령 예외 판독
  'check-contract.js',
  // 아이콘 — 검사와 검수 시트는 프로젝트에서도 돌려야 한다
  'check-icons.js',
  'build-icon-sheet.js',
  // 렌더 비평 캡처(그래픽 가속·화면 단위 스크롤·흰 바탕 → 투명 PNG) — 프로젝트가 자기 화면을 찍는다(design-intelligence §8-1). puppeteer는 프로젝트가 설치한다
  'capture.js'
]

// 폴더째 바꾸는 것(스타터 쪽을 지우고 다시 복사한다)
const REPLACED_DIRS = [
  'src/styles',
  'src/snippets',
  // 블록 카탈로그 정본(메타데이터·마크업 틀) — 스타일은 src/styles에 실려 간다. 폐쇄망 프로젝트도 블록을 읽을 수 있어야 한다
  'src/blocks',
  // 서체 — fonts.css(@font-face)·woff2·LICENSE를 폴더째 옮긴다. fonts.css가 상대 경로로 가리킨다
  'assets/fonts',
  // 렌더 비평의 기준 견본 — 색인(index.json)과 캡처(shots/). 짝 비교 상대라 프로젝트에 함께 있어야 한다(design-intelligence §8-8)
  'assets/exemplars',
  // 편집 직후 검사 훅(HX-06)
  'scripts/hooks',
  'prompts',
  // 도구별 경로 지시 — 스킬은 폐기했다. 작업 절차·레퍼런스는 infoUX MCP가 제공한다
  '.github/instructions'
]

// 파일 하나씩 옮기는 것
const COPIED_FILES = [
  // tokens — build/는 스타터에서 자체 빌드한다. brand.json은 프로젝트가 갈아끼우는 파일이지만
  // 스타터에는 INFOMIND 기본값을 실어 보낸다
  'tokens/foundation.json',
  'tokens/brand.json',
  'tokens/contrast-baseline.json',
  'tokens/README.md',
  'tokens/AGENTS.md',
  // 루트와 같은 훅 설정 — check-harness가 정합을 본다
  '.claude/settings.json',
  '.codex/hooks.json',
  // 설정
  'postcss.config.mjs',
  '.stylelintrc.json',
  '.npmrc'
]

// 스크립트 파일이 부르는 상대 경로 모듈(require('./lib/x')·require('../lib/x')) → scripts/ 기준 상대 경로 목록.
// try/catch로 감싼 선택 모듈도 포함한다 — 빠지면 그 검사가 조용히 꺼진다.
function relativeRequires(scriptsDir, relFile) {
  const source = fs.readFileSync(path.join(scriptsDir, relFile), 'utf8')
  const out = []
  for (const m of source.matchAll(/require\(\s*['"](\.{1,2}\/[^'"]+)['"]\s*\)/g)) {
    let target = path.posix.normalize(path.posix.join(path.posix.dirname(relFile), m[1]))
    if (target.startsWith('..')) continue // scripts/ 밖(contracts·package.json)은 다른 목록이 맡는다
    if (!path.posix.extname(target)) target += '.js'
    if (target.endsWith('.js')) out.push(target)
  }
  return out
}

// 진입 스크립트에서 require를 따라가며 모은 파일 전체(진입 스크립트 포함, scripts/ 기준 상대 경로, 정렬).
// 없는 파일은 missing에 모은다(선택 모듈이 그 저장소에 없는 경우).
function requireClosure(scriptsDir, entries) {
  const seen = new Set()
  const missing = new Set()
  const queue = [...entries]
  while (queue.length) {
    const rel = queue.shift()
    if (seen.has(rel) || missing.has(rel)) continue
    if (!fs.existsSync(path.join(scriptsDir, rel))) { missing.add(rel); continue }
    seen.add(rel)
    queue.push(...relativeRequires(scriptsDir, rel))
  }
  return { files: [...seen].sort(), missing: [...missing].sort() }
}

// scripts/ 아래 한 폴더의 .js 파일(scripts/ 기준 상대 경로)
function scriptFilesIn(scriptsDir, sub) {
  const dir = path.join(scriptsDir, sub)
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir).filter(name => name.endsWith('.js')).sort().map(name => (sub ? `${sub}/${name}` : name))
}

// 스타터로 가는 스크립트 전체 — 진입 스크립트 + 훅 + 그들이 부르는 lib (scripts/ 기준 상대 경로)
function starterScriptFiles(guideDir = GUIDE_DIR) {
  const scriptsDir = path.join(guideDir, 'scripts')
  const { files, missing } = requireClosure(scriptsDir, [...STARTER_SCRIPTS, ...scriptFilesIn(scriptsDir, 'hooks')])
  const lost = missing.filter(rel => STARTER_SCRIPTS.includes(rel))
  if (lost.length) throw new Error(`스타터로 보낼 스크립트가 없다: ${lost.join(', ')}`)
  return files
}

function copyFile(guideDir, starterDir, rel) {
  const to = path.join(starterDir, rel)
  fs.mkdirSync(path.dirname(to), { recursive: true })
  fs.copyFileSync(path.join(guideDir, rel), to)
}

function replaceDir(guideDir, starterDir, rel) {
  const to = path.join(starterDir, rel)
  fs.rmSync(to, { recursive: true, force: true })
  fs.mkdirSync(path.dirname(to), { recursive: true })
  fs.cpSync(path.join(guideDir, rel), to, { recursive: true })
}

// 한 폴더의 파일 가운데 조건에 맞는 것만 옮긴다(하위 폴더는 넘기지 않는다)
function copyMatching(guideDir, starterDir, rel, test) {
  const from = path.join(guideDir, rel)
  if (!fs.existsSync(from)) return 0
  const names = fs.readdirSync(from, { withFileTypes: true }).filter(e => e.isFile() && test(e.name)).map(e => e.name)
  for (const name of names) copyFile(guideDir, starterDir, `${rel}/${name}`)
  return names.length
}

// 로컬 starter/ 갱신 — log는 진행 줄을 받는 함수(테스트는 조용히 돌린다)
function syncStarter({ guideDir = GUIDE_DIR, starterDir = path.join(guideDir, 'starter'), log = console.log } = {}) {
  log('=== guide → starter 동기화 (INFOUX + Tailwind v4) ===')

  log(`[1/5] 폴더 교체 — ${REPLACED_DIRS.join(', ')}`)
  for (const rel of REPLACED_DIRS) replaceDir(guideDir, starterDir, rel)

  log('[2/5] 파일 — tokens · 훅 설정 · 설정 파일 · src/js · 팔레트 프리셋')
  for (const rel of COPIED_FILES) copyFile(guideDir, starterDir, rel)
  copyMatching(guideDir, starterDir, 'src/js', name => name.endsWith('.js'))
  // 팔레트 프리셋 — brand.json 자리에 그대로 복사해 쓰는 완전 동형 파일
  fs.rmSync(path.join(starterDir, 'tokens', 'presets'), { recursive: true, force: true })
  copyMatching(guideDir, starterDir, 'tokens/presets', name => name.endsWith('.json'))

  // 아이콘 자산 — 프로젝트 소스 안에 통째로 들어간다(self-contained). 폐쇄망에서도 그대로 떠야 한다.
  // 스프라이트는 표정마다 하나씩이다(sprite.svg·sprite-slim.svg…) — 기본만 옮기면 표정 클래스는 오는데
  // 그림이 안 와서 프로젝트에서 빈 네모가 나온다. 폰트는 있을 때만(빌드 환경에 폰트 도구가 없으면 생성되지 않는다)
  log('[3/5] assets/icons')
  fs.rmSync(path.join(starterDir, 'assets', 'icons'), { recursive: true, force: true })
  fs.mkdirSync(path.join(starterDir, 'assets', 'icons'), { recursive: true })
  fs.cpSync(path.join(guideDir, 'assets', 'icons', 'svg'), path.join(starterDir, 'assets', 'icons', 'svg'), { recursive: true })
  copyMatching(guideDir, starterDir, 'assets/icons', name =>
    name === 'icons.css' || name === 'LICENSE-NOTICE.txt' || /^sprite.*\.svg$/.test(name) || /^infoux-icons.*\.woff2$/.test(name))

  // 검사·빌드 스크립트 — 진입 스크립트가 부르는 lib을 따라가며 모두 옮긴다
  const scripts = starterScriptFiles(guideDir)
  log(`[4/5] scripts ${scripts.length}개 — 진입 ${STARTER_SCRIPTS.length}개와 훅, 그들이 require로 부르는 lib`)
  for (const rel of scripts) copyFile(guideDir, starterDir, `scripts/${rel}`)

  log('[5/5] contracts')
  copyMatching(guideDir, starterDir, 'contracts', () => true)

  log('')
  log('✓ 로컬 starter/ 동기화 완료')
  return { scripts }
}

module.exports = { STARTER_SCRIPTS, REPLACED_DIRS, COPIED_FILES, relativeRequires, requireClosure, scriptFilesIn, starterScriptFiles, syncStarter }

if (require.main === module) {
  if (process.argv.includes('--push')) {
    console.error('원격 푸시는 npm run sync:starter:push (bash scripts/sync-starter.sh --push)로 실행한다.')
    process.exit(1)
  }
  try {
    syncStarter()
  } catch (error) {
    console.error(`✗ 스타터 동기화 실패: ${error.message}`)
    process.exit(1)
  }
  // sync-starter.sh --push가 부를 때(--before-push)는 이어서 푸시하므로 이 안내를 내지 않는다
  if (!process.argv.includes('--before-push')) {
    console.log('')
    console.log('원격 배포는 실행하지 않았습니다. 배포 시 npm run sync:starter:push 사용.')
  }
}
