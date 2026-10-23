#!/usr/bin/env node

// check-violations.js — info-design 컨트랙트 자동 검출
// raw 색상, 옛 시스템 흔적, 옛 variant, SCSS 잔재, 접근성 누락,
// 가짜 콘텐츠(R-23), 한글 조판 하한(R-24) 검출.
// 시각 서명(lib/visual-signature.js): R-01 색 확장(선언 단위·Tailwind·style 속성), R-34 장식 효과,
// R-36 이모지, R-37 Tailwind 기본 스케일 — CSS·class·style·<style>·마크다운 펜스와 본문.
// 카피(lib/copy-rules.js): R-23 가짜·자리 콘텐츠, R-43 카피 톤 — 요소 트리로 보고 범위(납품·템플릿·스니펫·문서)별 심각도.
//
// 종료 코드: 0 = 통과 또는 경고만, 2 = 오류
//   STRICT=1 환경변수 설정 시 경고도 1로 실패 처리

const fs = require('fs')
const path = require('path')
const { loadTokenSource } = require('./lib/token-source')
const { buildTokensCss } = require('./lib/build-tokens-css')
// 시각 서명(R-01 색 확장·R-34 장식 효과·R-36 이모지·R-37 기본 스케일) — 없으면(오래된 파생 프로젝트) 이 검사만 건너뛴다
let VISUAL = null
try {
  VISUAL = require('./lib/visual-signature')
} catch (e) {
  if (e.code !== 'MODULE_NOT_FOUND') throw e
}
// 글자 크기 하한(R-31 루트 글자 크기·R-38 최소 글자) — 없으면 건너뛴다
let TYPE = null
try {
  TYPE = require('./lib/type-floor')
} catch (e) {
  if (e.code !== 'MODULE_NOT_FOUND') throw e
}
// 모양·움직임(R-35 반경·그림자, R-33 마키 애니메이션) — 원형 허용 블록은 contracts/art-direction.json shape.pillBlocks
let SHAPE = null
let SHAPE_OPTS = {}
// 한글 조판(R-24) 단행 예외 선택자 — contracts/art-direction.json hangul.singleLineSelectors
let HANGUL_OPTS = {}
// 폰트 스택(R-26 확장 — font-family 허용값·font-serif·외부 폰트 호스트) — 없으면 건너뛴다
let FONT = null
try {
  FONT = require('./lib/font-rules')
} catch (e) {
  if (e.code !== 'MODULE_NOT_FOUND') throw e
}
try {
  SHAPE = require('./lib/shape-motion')
  try {
    const ad = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'contracts', 'art-direction.json'), 'utf8'))
    if (Array.isArray(ad.shape?.pillBlocks)) SHAPE_OPTS = { pillBlocks: ad.shape.pillBlocks }
    if (ad.hangul?.singleLineSelectors) HANGUL_OPTS = { singleLine: ad.hangul.singleLineSelectors }
  } catch {
    // 계약이 없으면 기본 허용 블록(switch·avatar)
  }
} catch (e) {
  if (e.code !== 'MODULE_NOT_FOUND') throw e
}
// 모바일 우선(R-48 고정 폭·모바일 다열 그리드)
let LAYOUT = null
try {
  LAYOUT = require('./lib/layout-rules')
} catch (e) {
  if (e.code !== 'MODULE_NOT_FOUND') throw e
}
// 템플릿 장식 서명(R-51 색 있는 굵은 옆선, 경고) — 마크업 쪽(eyebrow·장식 번호·등장 효과)은 check-html-structure.js
let TEMPLATE = null
try {
  TEMPLATE = require('./lib/template-signature')
} catch (e) {
  if (e.code !== 'MODULE_NOT_FOUND') throw e
}
// 카피 규칙(R-23 가짜·자리 콘텐츠, R-43 카피 톤) — 없으면 옛 줄 단위 R-23 검사로 돌아간다
let COPY = null
try {
  COPY = require('./lib/copy-rules')
} catch (e) {
  if (e.code !== 'MODULE_NOT_FOUND') throw e
}

const ROOT = path.resolve(__dirname, '..')
const STYLES_DIR = path.join(ROOT, 'src/styles')
const SNIPPETS_DIR = path.join(ROOT, 'src/snippets')
const SITE_DIR = path.join(ROOT, 'site')

const TARGET_FILES = process.argv.slice(2)

// 클래스 명명 계약 (R-18 어휘) — 없으면(오래된 파생 프로젝트) 어휘 검사를 건너뛴다
const NAMING = (() => {
  const file = path.join(ROOT, 'contracts', 'class-naming.json')
  if (!fs.existsSync(file)) return null
  const spec = JSON.parse(fs.readFileSync(file, 'utf-8'))
  return {
    vocabulary: new Set((spec.vocabulary || []).flatMap(axis => axis.words)),
    byBlock: new Map(Object.entries(spec.blockModifiers || {}).map(([block, v]) => [block, new Set(v.words)])),
    forbidden: new Set(spec.forbiddenWords || []),
    deprecated: new Set((spec.deprecated || []).map(d => d.class)),
    exempt: spec.exemptBlockPrefixes || []
  }
})()
// 선택자 안의 .block--mod / .block__el--mod (값·주석이 아니라 클래스 선택자만)
const CSS_MODIFIER_SELECTOR = /\.([a-z][a-z0-9]*(?:-[a-z0-9]+)*)(__[a-z0-9]+(?:-[a-z0-9]+)*)?--([a-z0-9]+(?:-[a-z0-9]+)*)/g
// 네이티브 CSS nesting은 &__el·&--mod를 이어 붙이지 않는다 — .a{&__b{}}는 .a__b가 아니라 __b.a가 된다
const NESTED_BEM_SUFFIX = /&(__|--)[a-z]/

// ─── 출력 헬퍼 ─────────────────────────────────────────

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

const rel = (p) => path.relative(ROOT, p)
// 경로 판정 정규식은 '/' 구분자를 가정한다. Windows의 '\' 경로도 같은 판정을 받게 한다.
const toPosix = (p) => p.split(path.sep).join('/')
// 경로 판정은 프로젝트 루트 기준 상대 경로로 한다 — 상위 폴더 이름(…/references/프로젝트)이 판정을 바꾸지 않게
const relPosix = (p) => '/' + toPosix(path.relative(ROOT, p))

// ─── 패턴 정의 ────────────────────────────────────────

// 1. SCSS 잔재 — info-design은 Tailwind v4 + CSS만 허용
const SCSS_USE = /@use\s+['"]/
const SCSS_FORWARD = /@forward\s+['"]/
const SCSS_VAR = /^\s*\$[\w-]+\s*:/

// 2. 옛 토큰명 — KRDS 마이그레이션 전 사용되던 이름 (사용 시 경고)
//   주의: --color-text-disabled, --color-border-light는 KRDS 신규 시스템에도 존재 — 제외
const OLD_TOKEN_NAMES = [
  '--color-primary-light', '--color-primary-dark',
  '--color-text-secondary',
  '--color-bg-secondary',
  '--color-primary-alpha-8', '--color-primary-alpha-6', '--color-black-alpha-50',
  '--font-size-2xl', '--font-size-xl', '--font-size-lg', '--font-size-md',
  '--font-size-base', '--font-size-sm', '--font-size-xs',
  '--font-family-base',
  '--font-weight-medium', '--font-weight-semibold',
  '--leading-tight', '--leading-loose',
  '--spacing-xs', '--spacing-sm', '--spacing-md', '--spacing-lg', '--spacing-xl',
  '--spacing-2xl', '--spacing-3xl',
  '--radius-sm', '--radius-base', '--radius-lg', '--radius-xl', '--radius-full',
  '--shadow-sm', '--shadow-base', '--shadow-lg',
  '--transition-fast', '--transition-base', '--transition-slow'
]

// 3. 옛 버튼 variant — KRDS 변환 필요
const OLD_BTN_VARIANTS = ['btn--ghost', 'btn--outline', 'btn--link', 'btn--sm', 'btn--lg', 'btn--hero']

// 4. Tailwind raw 컬러 유틸리티 — KRDS 시맨틱 토큰 대체 필요
// gray/slate/red/blue/green/amber/yellow + bg/text/border/ring/divide
const TW_RAW_COLOR = /\b(?:bg|text|border|ring|divide|hover:bg|hover:text|hover:border)-(?:gray|slate|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d+\b/

// 5. Tailwind 기본 폰트/사이즈/그림자/z-index/반경
const TW_DEFAULT_TEXT_SIZE = /\btext-(?:xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)\b/
const TW_DEFAULT_FONT_WEIGHT = /\bfont-(?:thin|extralight|light|medium|semibold|extrabold|black)\b/
// 끝 경계는 '-'·'['까지 막는다 — rounded-[0.6rem](임의값)이 bare rounded로 잡히던 오탐
const TW_DEFAULT_RADIUS = /\brounded(?:-(?:sm|md|lg|xl|2xl|3xl|none))?(?![\w[-])/
const TW_DEFAULT_SHADOW = /\bshadow(?:-(?:xs|sm|md|lg|xl|2xl|inner|none))\b/
const TW_DEFAULT_ZINDEX = /\bz-(?:0|10|20|30|40|50|auto)\b/
const TW_DEFAULT_BREAKPOINT = /\b(?:sm|md|lg|xl|2xl):/

// 6. CSS hardcoded values
const HARDCODED_HEX = /:\s*#[0-9a-fA-F]{3,8}\b/
const HARDCODED_RGB = /:\s*rgba?\s*\(/
const HARDCODED_HSL = /:\s*hsla?\s*\(/
// 색상 외 단순 px값 (border 1~3px 예외)
const HARDCODED_PX = /(?:^|\s)(?:padding|margin|gap|top|right|bottom|left|width|height|min-width|min-height|max-width|max-height|font-size)\s*:\s*(\d+px)/
const ALLOWED_PX = /^(?:0|1|2|3|44|1px|2px|3px)$/

// 7. CSS 시스템 우회
const IMPORTANT_USED = /!important/
// :focus { outline: none } — 단, :focus:not(:focus-visible) 패턴은 legitimate fallback이라 제외
// 매치는 ":focus" 직후에 공백 또는 "{"가 와야 함 ":focus:" 같은 후속 의사 클래스 제외
const FOCUS_OUTLINE_NONE = /:focus(?![-:\w])\s*\{[^}]*outline\s*:\s*(?:none\b|0\s*(?:!important)?\s*(?:;|}))/

// 8. 호환성 위험 CSS 선택자 — 공공/기관 납품물은 폴백 없는 최신 선택자 의존 금지
const CSS_HAS_SELECTOR = /:has\(/

// 8-1. 모션 접근성 — animation/@keyframes는 reduced-motion 가드 필요 (R-22)
//   transition은 hover 효과 등 오탐이 많아 제외하고, 자동/반복 모션 신호인 animation·@keyframes만 검출한다.
const CSS_ANIMATION = /(?:^|[\s;{])animation(?:-name)?\s*:\s*(?!none\b)/
const CSS_KEYFRAMES = /@keyframes\s/
const REDUCED_MOTION = /prefers-reduced-motion/

// 9. BEM 위반
const BEM_DOUBLE_ELEMENT = /\.([\w-]+)__([\w-]+)__([\w-]+)/

// 10. HTML 위반
const INLINE_STYLE = /\bstyle\s*=/
const INLINE_STYLE_CUSTOM_PROP = /\bstyle\s*=\s*["'][^"']*--[\w-]+:[^"']*["']/
// 실제 <img> 태그만 검출 — src= 필수 (마크다운 안 인라인 `<img>` 같은 문서적 언급 제외)
const MISSING_ALT = /<img(?![^>]*\balt\s*=)[^>]*\bsrc\s*=[^>]*>/
const CLICK_ON_DIV = /<(?:div|span)[^>]+onclick/

// 11. 가짜 콘텐츠 (R-23) — 시안·납품물에 채움 콘텐츠 잔존 금지
//   placeholder 핫링크는 외부 서비스 의존이라 납품 self-contained 정책과 이중 실격이다.
const FAKE_LOREM = /lorem\s+ipsum/i
const FAKE_FILLER_KO = /(내용|텍스트|설명)[이가]?\s*(여기에\s*)?들어갑니다/
const FAKE_IMG_HOTLINK = /(placehold\.co|via\.placeholder\.com|picsum\.photos|placekitten|dummyimage\.com|source\.unsplash\.com|loremflickr)/i

// 12. 한글 조판 하한 (R-24) — 임계값 정본은 contracts/art-direction.json hangul.bodyLineHeight.lintFloor.
//   단위 테스트(naturalness.test.js)가 아래 상수와 lintFloor의 동일성을 강제한다.
const HANGUL_LINE_HEIGHT_FLOOR = 1.5
const KEEP_ALL_DECL = /word-break\s*:\s*keep-all/
const LEADING_NONE = /\bleading-none\b/
const LINE_HEIGHT_DECL = /(?:^|[^-\w])line-height\s*:\s*(\d*\.?\d+)\s*(?:[;}\]]|$)/
// 단행(한 줄 고정) 컴포넌트는 낮은 line-height가 정상이다 — 하한 검사 예외 파일 목록
const R24_EXEMPT_CSS = /(?:^|\/)(?:badge|tag|btn)\.css$/

// ─── 시각 서명 문맥 ───────────────────────────────────
// 표현 등급: infoux.json profile → contracts/profiles.json expression. 없으면 restrained(공공 기본값).
// 토큰 색 지도: R-34 보라 판정이 var(--color-*)를 실제 색으로 풀어 본다.
let visualCtxCache = null
function getVisualCtx() {
  if (visualCtxCache) return visualCtxCache
  let grade = 'restrained'
  let gradeKnown = false
  try {
    const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'infoux.json'), 'utf8').replace(/^\uFEFF/, ''))
    const profiles = JSON.parse(fs.readFileSync(path.join(ROOT, 'contracts', 'profiles.json'), 'utf8'))
    const profile = (profiles.profiles || []).find(p => p.id === config.profile)
    if (profile?.expression) { grade = profile.expression; gradeKnown = true }
  } catch {
    // infoux.json·profiles.json이 없으면 기본 등급
  }
  let tokenColors = new Map()
  try {
    tokenColors = VISUAL.buildTokenColorMap(buildTokensCss(loadTokenSource(ROOT)))
  } catch {
    // 토큰 소스를 못 읽으면 이름(violet·purple…)으로만 판정한다
  }
  visualCtxCache = { grade, gradeKnown, tokenColors }
  return visualCtxCache
}

// 카피 문맥: 사이트 유형(공공서비스는 느낌표 error)과 프로젝트가 허용한 고유 문구(infoux.json copyAllow)
let copyCtxCache = null
// 섹션 여백 밀도 기준(R-49) — 공공·관리자 프로필만. infoux.json profile → profiles.json density 프리셋(모바일·PC rem)
let densityCache
function getDensityBase() {
  if (densityCache !== undefined) return densityCache
  densityCache = null
  try {
    const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'infoux.json'), 'utf8').replace(/^\uFEFF/, ''))
    if (!['public-service', 'public-institution', 'cms-admin'].includes(config.profile)) return densityCache
    const spec = JSON.parse(fs.readFileSync(path.join(ROOT, 'contracts', 'profiles.json'), 'utf8'))
    const preset = (spec.densityPresets || spec.density || {})[(spec.profiles || []).find(x => x.id === config.profile)?.density]
    if (preset) densityCache = { mobile: parseFloat(preset.sectionPaddingMobile), pc: parseFloat(preset.sectionPaddingPc) }
  } catch {
    // 프로필이 없으면 보지 않는다
  }
  return densityCache
}

function getCopyCtx() {
  if (copyCtxCache) return copyCtxCache
  let profile = null
  let copyAllow = []
  try {
    const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'infoux.json'), 'utf8').replace(/^\uFEFF/, ''))
    if (typeof config.profile === 'string') profile = config.profile
    if (Array.isArray(config.copyAllow)) copyAllow = config.copyAllow.filter(s => typeof s === 'string' && s.trim())
  } catch {
    // infoux.json이 없으면 사이트 유형 미정 — 느낌표는 제목·버튼만 경고한다
  }
  copyCtxCache = { profile, copyAllow, copy: COPY.loadCopyContracts(ROOT) }
  for (const name of copyCtxCache.copy.missing) {
    warn(`contracts/${name}`, null, '[R-23] 카피 규칙 계약 파일을 읽지 못해 기본값으로 검사했다(번역투 어휘 R-43 없음) — 스타터를 갱신한다.')
  }
  return copyCtxCache
}

function reportVisual(relPath, findings, baseLine = 0) {
  for (const f of findings) {
    const line = f.line ? baseLine + f.line : null
    const msg = `[${f.rule}] ${f.message}`
    if (f.severity === 'error') error(relPath, line, msg, f.code)
    else warn(relPath, line, msg, f.code)
  }
}

// ─── 검사 함수 ────────────────────────────────────────

// 토큰 이름이 지켜야 하는 접두 — 이 접두의 var(--…)는 토큰 소스에 실제로 있어야 한다.
// 문서의 표기가 틀렸거나 이름을 지어내도 var() 형식은 맞으므로 R-01 만으로는 통과한다.
// 그러면 값이 비어 렌더만 조용히 깨진다(2026-10-05 공지 띠: --color-info-60 은 없고 --color-information-60 이 실제).
const TOKEN_NAMESPACES = /^--(?:color|font|breakpoint)-/
const VAR_REF = /var\(\s*(--[a-z0-9-]+)\s*([,)])/gi
let definedTokensCache = null

/** 토큰 소스에서 만든 CSS 의 정의 + src/styles 안의 지역 선언을 합친 집합 */
function getDefinedTokens() {
  if (definedTokensCache) return definedTokensCache
  const defined = new Set()
  try {
    const css = buildTokensCss(loadTokenSource(ROOT))
    for (const m of css.matchAll(/(--[a-z0-9-]+)\s*:/gi)) defined.add(m[1])
  } catch {
    // 토큰 소스를 못 읽으면 이 검사만 건너뛴다(null). 다른 검사는 계속한다.
    definedTokensCache = null
    return null
  }
  const stack = [STYLES_DIR]
  while (stack.length) {
    const dir = stack.pop()
    if (!fs.existsSync(dir)) continue
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) stack.push(full)
      else if (entry.name.endsWith('.css')) {
        for (const m of fs.readFileSync(full, 'utf-8').matchAll(/(--[a-z0-9-]+)\s*:/gi)) defined.add(m[1])
      }
    }
  }
  definedTokensCache = defined
  return defined
}

// 토큰 소스(foundation + brand)에 정의된 이름만 — 설정 계층의 재정의 판정용
let sourceTokensCache
function getDefinedTokensFromSource() {
  if (sourceTokensCache !== undefined) return sourceTokensCache
  try {
    const css = buildTokensCss(loadTokenSource(ROOT))
    sourceTokensCache = new Set([...css.matchAll(/(--color-[a-z0-9-]+)\s*:/gi)].map(m => m[1]))
  } catch {
    sourceTokensCache = null
  }
  return sourceTokensCache
}

function checkCssFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')
  const relPath = rel(filePath)

  // 토큰 빌드 산출물은 정의 자체가 raw다 — 자동 생성 표시로 건너뛰는 것도 이 경로에만 허용한다
  //   (예전에는 1-settings·_project-style 경로 전체와 '자동 생성' 첫 줄만으로 raw 색이 통과했다 — brand.json·대비 검사 우회 구멍)
  const posixPath = relPosix(filePath)
  if (posixPath.includes('/tokens/build/')) return

  // 설정 계층(1-settings)은 @apply 대상이 아니다. raw 색은 문서 코드 테마의 --color-code-*만 허용한다
  const isTokenFile = posixPath.includes('/1-settings/')

  if (VISUAL) {
    const ctx = getVisualCtx()
    const defined = getDefinedTokensFromSource()
    reportVisual(relPath, VISUAL.scanCss(content, {
      ...ctx,
      // 문서 사이트 크롬(터미널 점 등)은 장식 효과 검사에서 뺀다
      exemptEffects: /(^|\/)src\/styles\/docs\.css$/.test(posixPath),
      exemptDecl: (prop, value) => {
        if (!isTokenFile) return false
        if (/\/1-settings\/docs-code-theme\.css$/.test(posixPath) && /^--color-code-/.test(prop)) return true
        if (defined && defined.has(prop)) {
          error(relPath, null, `[R-01] 설정 계층에서 토큰 ${prop}을 다시 정의했다 — 색은 tokens/brand.json으로만 바꾼다(대비 검사를 우회한다).`, `${prop}:${value}`.slice(0, 120))
          return true
        }
        return false
      }
    }))
  }

  // 글자 크기 하한(R-31·R-38) — 문서 사이트 크롬(docs.css)은 뺀다
  if (TYPE && !/(^|\/)src\/styles\/docs\.css$/.test(posixPath)) reportVisual(relPath, TYPE.scanCssType(content))
  // 한글 조판(R-24) 행간·자간·줄바꿈 — docs.css는 행간(a)만 면제하고 자간·줄바꿈은 본다
  if (TYPE?.scanCssHangul) reportVisual(relPath, TYPE.scanCssHangul(content, { ...HANGUL_OPTS, exemptLeading: /(^|\/)src\/styles\/docs\.css$/.test(posixPath) }))
  // 반경·그림자(R-35)·마키(R-33) — 파일 이름이 블록 이름이다(switch.css → .switch)
  if (SHAPE && !/(^|\/)src\/styles\/docs\.css$/.test(posixPath)) reportVisual(relPath, SHAPE.scanCssShape(content, { ...SHAPE_OPTS, file: posixPath }))
  // 폰트 스택(R-26) — 아이콘 폰트 생성물(assets/icons/icons.css, 생성원 scripts/build-icons.js)은 자기 패밀리를 선언한다
  if (FONT && !/\/assets\/icons\/icons\.css$/.test(posixPath)) reportVisual(relPath, FONT.scanCssFont(content))
  // 모션 예산(R-22) — 가이드 저장소의 공용 카탈로그(src/styles)는 모든 유형이 쓰므로 기능형(utility) 기준
  if (SHAPE?.scanCssMotion && !/(^|\/)src\/styles\/docs\.css$/.test(posixPath)) {
    const { grade, gradeKnown } = getVisualCtx()
    const catalog = !gradeKnown && fs.existsSync(path.join(ROOT, 'starter')) && /^\/src\/styles\//.test(posixPath)
    reportVisual(relPath, SHAPE.scanCssMotion(content, catalog ? { grade: 'utility', gradeKnown: true, file: posixPath } : { grade, gradeKnown, file: posixPath }))
  }
  // 모바일 우선(R-48)
  if (LAYOUT && !/(^|\/)src\/styles\/docs\.css$/.test(posixPath)) {
    reportVisual(relPath, LAYOUT.scanCssLayout(content))
    // 섹션 세로 여백(R-49)
    if (getDensityBase()) reportVisual(relPath, LAYOUT.sectionPaddingCss(content, getDensityBase()))
  }
  // 템플릿 장식 서명(R-51) — 색 있는 굵은 옆선. 문서 사이트 크롬(docs.css)은 뺀다
  if (TEMPLATE && !/(^|\/)src\/styles\/docs\.css$/.test(posixPath)) reportVisual(relPath, TEMPLATE.scanCssTemplate(content))

  // placeholder 이미지 핫링크(R-23) — background: url(https://picsum.photos/…) 같은 외부 의존
  if (COPY) {
    const noComments = VISUAL ? VISUAL.stripCssComments(content) : content
    reportVisual(relPath, COPY.scanTextHotlinks(noComments, getCopyCtx()))
  }

  const isEntryFile =/\/src\/styles\/(?:style|docs)\.css$/.test(posixPath) ||
                      /\/src\/styles\/6-components\/index\.css$/.test(posixPath) ||
                      /\/src\/styles\/3-generic\/reset\.css$/.test(posixPath)

  if (!isTokenFile && !isEntryFile && !content.includes('@apply')) {
    error(relPath, null, '[R-19] 스타일 CSS는 Tailwind v4 @apply를 우선 사용해야 한다. 토큰이 필요한 값은 var(--token)으로 유지하되 레이아웃/상태 유틸은 @apply로 작성.')
  }

  // 이 파일 안에서 직접 선언한 커스텀 프로퍼티는 정의된 것으로 본다
  const localDeclared = new Set([...content.matchAll(/(--[a-z0-9-]+)\s*:/gi)].map(m => m[1]))

  lines.forEach((line, i) => {
    const lineNum = i + 1
    const trimmed = line.replace(/\/\*.*?\*\//g, '').trim()
    if (!trimmed) return

    // SCSS 문법 — 폐기됨 (R-03)
    if (SCSS_USE.test(trimmed)) {
      error(relPath, lineNum, '[R-03] SCSS @use 사용 금지. CSS @import 또는 Tailwind v4 @theme 사용.', trimmed)
    }
    if (SCSS_FORWARD.test(trimmed)) {
      error(relPath, lineNum, '[R-03] SCSS @forward 사용 금지.', trimmed)
    }
    if (SCSS_VAR.test(trimmed)) {
      error(relPath, lineNum, '[R-03] SCSS 변수 ($var) 금지. CSS 커스텀 프로퍼티 사용.', trimmed)
    }

    // modifier 어휘 (R-18) — CSS에 정의하는 변형 이름은 class-naming 계약의 어휘에서 고른다
    // 여러 줄 주석의 본문 줄(* …)은 예시 설명이라 검사하지 않는다
    if (NAMING && !trimmed.startsWith('@apply') && !trimmed.startsWith('*') && !trimmed.startsWith('/*')) {
      // 한 줄 주석과 문자열(content:'…', url("…"))은 선택자가 아니다
      const selectorText = trimmed.replace(/\/\*.*?\*\//g, '').replace(/(["'])(?:\\.|(?!\1).)*\1/g, '')
      for (const m of selectorText.matchAll(CSS_MODIFIER_SELECTOR)) {
        const block = m[1]
        const element = m[2] || ''
        const word = m[3]
        const cls = `${block}${element}--${word}`
        if (NAMING.exempt.some(p => block.startsWith(p))) continue
        if (NAMING.deprecated.has(cls)) continue // 이행 기간 별칭 — 마크업에서 쓰면 HTML 검사가 경고한다
        // 조각 중 하나라도 금지어면 오류 — HTML 검사(check-html-structure.js)와 같은 판정
        const forbiddenWord = word.split('-').find(seg => NAMING.forbidden.has(seg))
        if (forbiddenWord) {
          error(relPath, lineNum, `[R-18] 시각적 단어 modifier ".${cls}"("${forbiddenWord}"). contracts/class-naming.json 어휘(크기·위계·상태색 등)에서 고른다.`, trimmed)
        } else if (!NAMING.vocabulary.has(word) && !NAMING.byBlock.get(block)?.has(word)) {
          warn(relPath, lineNum, `[R-18] 허용 어휘 밖 modifier ".${cls}". contracts/class-naming.json의 어휘를 쓰거나, 블록 고유 변형이면 blockModifiers에 등록한다.`, trimmed)
        }
      }
    }

    // BEM 접미 nesting (R-05) — &__el / &--mod는 네이티브 nesting에서 깨진 선택자가 된다
    if (!trimmed.startsWith('*') && !trimmed.startsWith('/*') && NESTED_BEM_SUFFIX.test(trimmed)) {
      error(relPath, lineNum, '[R-05] &__element·&--modifier nesting 금지. 네이티브 CSS nesting은 이름을 이어 붙이지 않는다(.a{&__b{}} → __b.a). 전체 선택자(.block__element, .block--modifier)를 쓴다.', trimmed)
    }

    // 정의되지 않은 토큰 참조 (R-01) — 대체값(var(--x, 값))이 있으면 없을 수 있음을 알고 쓴 것이므로 넘긴다
    const defined = getDefinedTokens()
    if (defined) {
      for (const m of trimmed.matchAll(VAR_REF)) {
        const name = m[1]
        if (m[2] === ',' || !TOKEN_NAMESPACES.test(name) || defined.has(name) || localDeclared.has(name)) continue
        error(relPath, lineNum, `[R-01] 정의되지 않은 토큰 var(${name}). tokens/ 에 없는 이름이다 — get_tokens 문서가 아니라 tokens/build/tokens.css 의 실제 이름을 확인한다.`, trimmed)
      }
    }

    // 옛 토큰명 — info-design 컨트랙트 점검 (R-01: 토큰 시스템)
    for (const oldName of OLD_TOKEN_NAMES) {
      if (trimmed.includes(`var(${oldName})`)) {
        warn(relPath, lineNum, `[R-01] 옛 토큰명 \`${oldName}\` 사용. 현행 토큰으로 교체 권장.`, trimmed)
      }
    }

    // 옛 btn variant — 카탈로그 위반 (R-06: 시각적 modifier 금지와 같은 맥락)
    for (const oldVar of OLD_BTN_VARIANTS) {
      if (trimmed.match(new RegExp(`\\.${oldVar.replace(/--/g, '\\-\\-')}\\b`))) {
        warn(relPath, lineNum, `[R-06] 옛 버튼 variant \`.${oldVar}\` 사용. KRDS 4 variant(--primary/--secondary/--tertiary/--text) + 5 size(--xsmall..--xlarge)로 교체.`, trimmed)
      }
    }

    if (!isTokenFile) {
      // raw 색(R-01)은 위의 시각 서명 검사가 선언 단위로 본다(값 전체·@apply 임의값·var 폴백까지).
      // 시각 서명 모듈이 없는 오래된 파생 프로젝트만 예전 줄 단위 판정을 쓴다.
      if (!VISUAL && (HARDCODED_HEX.test(trimmed) || HARDCODED_RGB.test(trimmed) || HARDCODED_HSL.test(trimmed))) {
        error(relPath, lineNum, '[R-01] Raw 색상 금지. var(--color-*) 토큰 사용.', trimmed)
      }
      // hardcoded px (R-01) — 간격/크기는 프로젝트 맥락에 따라 허용하되 반복 패턴은 토큰 권장
      const pxMatch = trimmed.match(HARDCODED_PX)
      if (pxMatch && !ALLOWED_PX.test(pxMatch[1])) {
        warn(relPath, lineNum, `[R-01] 하드코딩 \`${pxMatch[1]}\`. 반복되는 간격/크기라면 토큰화 권장.`, trimmed)
      }
    }

    // !important (R-02) — components/utilities 외 금지
    if (IMPORTANT_USED.test(trimmed) && !filePath.includes('7-utilities')) {
      // 외부 라이브러리 오버라이드 사유 주석이 있으면 허용
      const hasJustification = trimmed.includes('/* ') || (lines[i - 1] || '').includes('/*')
      if (!hasJustification) {
        warn(relPath, lineNum, '[R-02] !important 사용 시 사유 주석 필수.', trimmed)
      }
    }

    // 폴백 없는 :has() 의존 (R-20)
    if (CSS_HAS_SELECTOR.test(trimmed)) {
      error(relPath, lineNum, '[R-20] 핵심 CSS에서 :has() 선택자 사용 금지. sibling selector, 상태 class, ARIA 속성 selector로 대체.', trimmed)
    }

    // BEM 2단계 element (R-05)
    const bemMatch = trimmed.match(BEM_DOUBLE_ELEMENT)
    if (bemMatch) {
      error(relPath, lineNum, `[R-05] BEM 2단계 element 중첩 금지: .${bemMatch[1]}__${bemMatch[2]}__${bemMatch[3]}`, trimmed)
    }

    // 한글 본문 조판 하한 (R-24) — 단행 컴포넌트(badge·tag·btn) 파일은 예외
    const lhMatch = trimmed.match(LINE_HEIGHT_DECL)
    // (선언 단위 판정 scanCssHangul이 없는 오래된 파생 프로젝트만 줄 단위로 본다)
    if (!TYPE?.scanCssHangul && lhMatch && parseFloat(lhMatch[1]) < HANGUL_LINE_HEIGHT_FLOOR && !R24_EXEMPT_CSS.test(posixPath)) {
      warn(relPath, lineNum, `[R-24] line-height ${lhMatch[1]} — 한글 조판 하한 ${HANGUL_LINE_HEIGHT_FLOOR} 미만. 본문 1.6~1.7, 제목 1.5(KRDS 150%) 기준은 contracts/art-direction.json hangul 참조.`, trimmed)
    }
  })

  // focus outline none 패턴 (R-11) — 멀티라인 스캔
  const contentNoComments = content.replace(/\/\*[\s\S]*?\*\//g, '')
  if (FOCUS_OUTLINE_NONE.test(contentNoComments)) {
    const matchLine = lines.findIndex(l => l.match(/:focus(?![-:\w])\s*\{/))
    error(relPath, matchLine + 1, '[R-11] :focus { outline: none } 금지. KRDS 4px primary outline 유지.', '')
  }

  // R-22: animation/@keyframes 사용 시 prefers-reduced-motion 가드 필요 — 파일 단위 멀티라인 스캔
  //   전정기관 장애·멀미 민감 사용자를 위해 자동/반복 모션은 모션 최소화 선호를 존중해야 한다.
  const hasAnimation = CSS_ANIMATION.test(contentNoComments) || CSS_KEYFRAMES.test(contentNoComments)
  if (hasAnimation && !REDUCED_MOTION.test(contentNoComments)) {
    const animLine = lines.findIndex(l => CSS_ANIMATION.test(l) || CSS_KEYFRAMES.test(l))
    warn(relPath, animLine + 1, '[R-22] animation/@keyframes 사용 파일에 @media (prefers-reduced-motion: reduce) 가드가 없다. 모션 최소화 선호 시 애니메이션을 축소·정지해야 한다.', '')
  }

  // R-24 ①: 본문 조판 기본값을 소유한 reset 계층 — word-break: keep-all 존재 필수 (파일 단위 멀티라인 스캔)
  //   한글 단어 중간 줄바꿈을 막는 기본값은 3-generic/reset.css 소유다. 빠지면 파생 사이트 전체가 깨진다.
  if (/3-generic\/reset\.css$/.test(posixPath) && !KEEP_ALL_DECL.test(contentNoComments)) {
    error(relPath, null, '[R-24] reset 계층에 word-break: keep-all이 없다. 한글 조판 기본값(keep-all + overflow-wrap: break-word)은 3-generic/reset.css가 소유한다.', '')
  }
}

// 의도적으로 잘못된 예시(❌ 금지)를 포함하는 자동 생성 문서 — 검사 제외
const HTML_SKIP_PATTERNS = [
  /\/site\/conventions\//, // rules.json → build:rules가 생성한 규칙 문서
  /\/site\/accessibility\//, // 접근성 가이드 — "Don't" 예시 포함
  /\/site\/design\//, // 디자인 기준 문서 — microcopy "잘못된 예" 표 등 의도적 반례 포함
  /\/references\// // 기준 본체 — 안티패턴·금지 예시를 문서로 싣는다
]

function shouldSkipHtmlFile(filePath) {
  return HTML_SKIP_PATTERNS.some(re => re.test(relPosix(filePath)))
}

// opts.isPage: page-scope가 모은 납품 페이지(루트 *.html·pages/**·infoux.json pages) — 카피 규칙을 가장 엄격하게 본다
function checkHtmlFile(filePath, opts = {}) {
  if (shouldSkipHtmlFile(filePath)) return

  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')
  const relPath = rel(filePath)

  // R-14: 페이지 진입점(<body> 포함)에 skip-to-content 필수
  // 면제: partial(_includes), playground(내부 데모), snippet(컴포넌트 마크업 조각)
  const hasBody = /<body\b/.test(content)
  const posixPath = relPosix(filePath)
  const isPartial = /\/_includes\/partials\//.test(posixPath) || /\/_includes\/components\//.test(posixPath)
  const isPlayground = /\/src\/playground\//.test(posixPath)
  const isSnippet = /\/src\/snippets\//.test(posixPath)
  if (hasBody && !isPartial && !isPlayground && !isSnippet) {
    if (!/skip-to-content/.test(content)) {
      error(relPath, null, '[R-14] 건너뛰기 링크 누락. <body> 진입 직후 <a href="#main" class="skip-to-content"> 추가 필요.')
    }
  }

  // 시각 서명(R-01·R-34·R-36·R-37) — class·style 속성, <style> 블록, 마크다운 html·css 펜스와 본문
  //   <style> 블록의 raw 색은 2026-07-29 플레이그라운드 12개 파일이 새어 나간 경로다.
  //   이모지(R-36)는 웹 콘텐츠(사이트 문서·플레이그라운드·스니펫 코드 블록·납품 페이지)에만 적용한다.
  if (VISUAL) {
    const ctx = getVisualCtx()
    if (filePath.endsWith('.md')) {
      const isSite = /^\/site\//.test(posixPath)
      reportVisual(relPath, VISUAL.scanMarkdown(content, {
        ...ctx,
        prose: isSite, // 스니펫은 코드 블록만 본다
        emoji: isSite || isSnippet
      }))
    } else {
      reportVisual(relPath, VISUAL.scanHtml(content, ctx))
    }
  } else {
    for (const block of content.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) {
      const startLine = content.slice(0, block.index).split('\n').length
      block[1].split('\n').forEach((styleLine, offset) => {
        const t = styleLine.trim()
        if (t && (HARDCODED_HEX.test(t) || HARDCODED_RGB.test(t) || HARDCODED_HSL.test(t))) {
          error(relPath, startLine + offset, '[R-01] <style> 블록 raw 색상 금지. var(--color-*) 토큰 사용.', t)
        }
      })
    }
  }

  // 마크다운에서 마크업 규칙(R-07·R-08·Tailwind 기본 경고)은 코드 펜스와 원시 HTML 줄에만 적용한다.
  // 본문 문장('`rounded-lg`는 쓰지 않는다')이 경고로 걸리지 않게.
  const isMarkdown = filePath.endsWith('.md')

  // 글자 크기 하한(R-31·R-38) — HTML의 <style>·class·style 속성, 마크다운은 html·css 펜스(금지 예시 펜스 제외)
  if (TYPE) {
    const density = getDensityBase()
    const shapeCss = t => [...(SHAPE ? SHAPE.scanCssShape(t, SHAPE_OPTS) : []), ...(LAYOUT ? LAYOUT.scanCssLayout(t) : []), ...(LAYOUT && density ? LAYOUT.sectionPaddingCss(t, density) : [])]
    const shapeHtml = t => [...(SHAPE ? SHAPE.scanHtmlShape(t, SHAPE_OPTS) : []), ...(LAYOUT ? LAYOUT.scanHtmlLayout(t) : []), ...(LAYOUT && density ? LAYOUT.sectionPaddingHtml(t, density) : [])]
    // 한글 조판(R-24) — 플레이그라운드 데모 크롬(.pg*)의 행간은 면제
    const hangulOpts = { ...HANGUL_OPTS, exemptLeadingSel: isPlayground ? /\.pg(?:__|-|$|[^\w-])/ : null }
    const hangulCss = t => [...(TYPE.scanCssHangul ? TYPE.scanCssHangul(t, hangulOpts) : []), ...(FONT ? FONT.scanCssFont(t) : [])]
    const motionCtx = (({ grade, gradeKnown }) => ({ grade, gradeKnown }))(getVisualCtx())
    const hangulHtml = t => [...(TYPE.scanHtmlHangul ? TYPE.scanHtmlHangul(t, hangulOpts) : []), ...(SHAPE?.scanHtmlMotion ? SHAPE.scanHtmlMotion(t, motionCtx) : []), ...(FONT ? FONT.scanHtmlFont(t) : [])]
    if (!isMarkdown) reportVisual(relPath, [...TYPE.scanHtmlType(content), ...shapeHtml(content), ...hangulHtml(content)])
    else if (VISUAL) {
      for (const seg of VISUAL.splitMarkdown(content)) {
        if (seg.counter) continue
        // 템플릿 장식 서명(R-51) css 펜스는 스니펫만 — 마크업 펜스는 check-html-structure.js가 본다
        const templateCss = t => (TEMPLATE && isSnippet ? TEMPLATE.scanCssTemplate(t) : [])
        const found = seg.lang === 'css' ? [...TYPE.scanCssType(seg.text), ...shapeCss(seg.text), ...hangulCss(seg.text), ...templateCss(seg.text)] : ['html', 'njk', 'nunjucks'].includes(seg.lang) ? [...TYPE.scanHtmlType(seg.text), ...shapeHtml(seg.text), ...hangulHtml(seg.text)] : []
        reportVisual(relPath, found.map(f => ({ ...f, line: seg.startLine + (f.line || 1) - 1 })))
      }
    }
  }

  // 카피(R-23 가짜·자리 콘텐츠, R-43 카피 톤) — 요소 트리로 형제·조상·숨김을 보고 범위별 심각도를 준다
  //   납품 페이지 > 템플릿(infoux:template 표시) > 스니펫·플레이그라운드 > 문서 순으로 엄격하다
  if (COPY) {
    const copyCtx = getCopyCtx()
    // 카피 검사가 한 파일에서 실패해도 전체 검사를 멈추지 않는다 — 그 파일만 오류로 알린다
    try {
      const scope = COPY.copyScopeOf(posixPath, content, { isPage: !!opts.isPage, copy: copyCtx.copy })
      const ctx = { ...copyCtx, scope }
      reportVisual(relPath, isMarkdown ? COPY.scanMarkdownCopy(content, ctx) : COPY.scanHtmlCopy(content, ctx))
    } catch (e) {
      error(relPath, null, `[R-23·R-43] 카피 검사를 끝내지 못했다(${e.message}) — 이 파일의 문구는 검사되지 않았다.`)
    }
  }
  const markupLines = new Set()
  const counterLines = new Set() // 금지 예시 펜스(첫 줄 주석에 ❌·금지 예시·DON'T 등) — 마크업 규칙을 적용하지 않는다
  if (isMarkdown) {
    // 프롬프트 문서는 본문 전체를 ```markdown 펜스로 싸므로, 마크업 언어(또는 언어 표기 없음) 펜스만 마크업으로 본다
    const PROSE_FENCE = /^(markdown|md|text|txt|plain|bash|sh|shell|console|powershell|ps1|json|jsonc|yaml|yml|diff)$/i
    let fence = null
    let htmlBlock = false // 원시 HTML 블록은 빈 줄까지 이어진다(CommonMark)
    lines.forEach((l, i) => {
      const fm = l.match(/^\s*(`{3,}|~{3,})\s*([\w-]*)/)
      if (fm && !fence) {
        const first = lines.slice(i + 1).find(x => x.trim()) || ''
        fence = { marker: fm[1], prose: PROSE_FENCE.test(fm[2] || ''), counter: VISUAL ? VISUAL.isCounterFenceStart(first) : false }
        htmlBlock = false
        return
      }
      if (fence && l.trim().startsWith(fence.marker) && l.trim().replace(/[`~]/g, '') === '') { fence = null; return }
      if (fence) {
        if (fence.counter) counterLines.add(i + 1)
        else if (!fence.prose) markupLines.add(i + 1)
        return
      }
      if (l.trim() === '') { htmlBlock = false; return }
      if (/^\s*<[a-zA-Z!/]/.test(l)) htmlBlock = true
      if (htmlBlock) markupLines.add(i + 1)
    })
  }

  lines.forEach((line, i) => {
    const lineNum = i + 1
    const raw = line.trim()
    if (!raw) return
    if (counterLines.has(lineNum)) return
    const isMarkup = !isMarkdown || markupLines.has(lineNum)
    // 마크다운 본문 줄은 인라인 코드(`<img src>` 같은 설명 속 인용)를 빼고 본다
    const trimmed = isMarkup ? raw : raw.replace(/`[^`]*`/g, ' ')

    // 인라인 스타일 (R-07) — CSS 변수 주입은 허용
    if (isMarkup && INLINE_STYLE.test(trimmed) && !INLINE_STYLE_CUSTOM_PROP.test(trimmed)) {
      warn(relPath, lineNum, '[R-07] 인라인 style 금지. BEM 클래스 또는 Tailwind 유틸 사용.', trimmed.slice(0, 100))
    }

    // BEM 2단계 HTML (R-08)
    const bemMatch = isMarkup && trimmed.match(BEM_DOUBLE_ELEMENT)
    if (bemMatch) {
      warn(relPath, lineNum, '[R-08] BEM 2단계 element 중첩 클래스 금지.', trimmed.slice(0, 100))
    }

    // alt 누락 (R-09)
    if (MISSING_ALT.test(trimmed)) {
      error(relPath, lineNum, '[R-09] <img> alt 속성 누락. 장식이면 alt="".', trimmed.slice(0, 100))
    }

    // div onclick (R-10)
    if (CLICK_ON_DIV.test(trimmed)) {
      error(relPath, lineNum, '[R-10] <div>/<span> onclick 금지. <button> 또는 <a> 사용.', trimmed.slice(0, 100))
    }

    // 가짜 콘텐츠 (R-23) — 카피 규칙 라이브러리가 없을 때(오래된 파생 프로젝트)만 줄 단위로 본다
    //   마크다운 본문에서는 인라인 코드(`Lorem ipsum` 같은 규칙 설명 속 인용)를 빼고 본다
    if (!COPY) {
      if (FAKE_LOREM.test(trimmed)) {
        error(relPath, lineNum, '[R-23] lorem ipsum 채움 텍스트 금지. 실제 서비스 문안 또는 task contract contentSources 기반 카피를 사용한다.', trimmed.slice(0, 100))
      }
      if (FAKE_FILLER_KO.test(trimmed)) {
        error(relPath, lineNum, '[R-23] 자리 채움 문구 금지. 실제 콘텐츠를 넣거나 contentSources에서 실제 용어를 가져온다.', trimmed.slice(0, 100))
      }
      if (FAKE_IMG_HOTLINK.test(trimmed)) {
        error(relPath, lineNum, '[R-23] placeholder 이미지 핫링크 금지. 실제 자산 경로 또는 실제 비율의 data-uri 표기를 사용한다(납품 self-contained 정책).', trimmed.slice(0, 100))
      }
    }

    // 한글 조판 하한 (R-24) — leading-none은 한글 본문에서 글줄 겹침을 만든다(클래스 이름이라 마크업 줄만)
    if (!TYPE?.scanHtmlHangul && isMarkup && LEADING_NONE.test(trimmed)) {
      error(relPath, lineNum, '[R-24] leading-none 클래스 금지. 본문은 1.6~1.7을 지키고, 단행 UI의 행간은 컴포넌트 CSS(badge·tag·btn)가 소유한다.', trimmed.slice(0, 100))
    }

    // 아래는 마크업 유틸 이름 경고다 — 마크다운 본문 문장에는 적용하지 않는다
    if (!isMarkup) return

    // Tailwind 팔레트 유틸(R-01)·기본 글자 크기(R-37)
    //   class 속성·@apply 안은 시각 서명 검사가 토큰 단위로 본다. 그 밖(classList.add('bg-gray-50'), :class 바인딩)은
    //   줄 단위로 보되, class 속성 값과 @apply를 지운 뒤에 봐서 같은 토큰을 두 번 알리지 않는다
    const outsideClassAttr = VISUAL
      ? trimmed.replace(/(?<![\w:-])class\s*=\s*(?:"[^"]*"|'[^']*')/g, ' ').replace(/@apply\b[^;]*;?/g, ' ')
      : trimmed
    if (TW_RAW_COLOR.test(outsideClassAttr)) {
      const match = outsideClassAttr.match(TW_RAW_COLOR)
      error(relPath, lineNum, `[R-01] Tailwind raw 컬러 유틸 \`${match[0]}\` 금지. KRDS 시맨틱(bg-[var(--color-primary)] 등) 사용.`, trimmed.slice(0, 100))
    }
    if (TW_DEFAULT_TEXT_SIZE.test(outsideClassAttr)) {
      const match = outsideClassAttr.match(TW_DEFAULT_TEXT_SIZE)
      if (VISUAL) error(relPath, lineNum, `[R-37] Tailwind 기본 \`${match[0]}\` — 62.5% 루트에서 37.5% 작게 렌더된다. text-[1.7rem]처럼 rem 임의값으로 쓴다.`, trimmed.slice(0, 100))
      else warn(relPath, lineNum, `[R-01] Tailwind 기본 \`${match[0]}\` 사용. 반복되는 타입 계층이면 프로젝트/INFOMIND 스케일 사용 권장.`, trimmed.slice(0, 100))
    }

    // Tailwind 기본 폰트 두께 (R-01)
    if (TW_DEFAULT_FONT_WEIGHT.test(trimmed)) {
      const match = trimmed.match(TW_DEFAULT_FONT_WEIGHT)
      warn(relPath, lineNum, `[R-01] \`${match[0]}\` 사용. 제품 내 타입 위계와 일관되는지 확인 필요.`, trimmed.slice(0, 100))
    }

    // Tailwind 기본 반경 (R-01)
    if (TW_DEFAULT_RADIUS.test(trimmed)) {
      const match = trimmed.match(TW_DEFAULT_RADIUS)
      // rounded-full은 rounded-max로 교체
      if (match[0] !== 'rounded-none') {
        warn(relPath, lineNum, `[R-01] Tailwind 기본 \`${match[0]}\` 사용. 반복되는 컴포넌트 반경이면 공통 토큰 사용 권장.`, trimmed.slice(0, 100))
      }
    }

    // Tailwind 기본 그림자 (R-01)
    if (TW_DEFAULT_SHADOW.test(trimmed)) {
      const match = trimmed.match(TW_DEFAULT_SHADOW)
      warn(relPath, lineNum, `[R-01] Tailwind 기본 \`${match[0]}\` 사용. 반복되는 elevation이면 INFOMIND shadow 토큰 사용 권장.`, trimmed.slice(0, 100))
    }

    // Tailwind 기본 z-index (R-01)
    if (TW_DEFAULT_ZINDEX.test(trimmed)) {
      const match = trimmed.match(TW_DEFAULT_ZINDEX)
      warn(relPath, lineNum, `[R-01] Tailwind 기본 \`${match[0]}\` 사용 지양. INFOMIND z-{dropdown|modal|toast 등} 사용.`, trimmed.slice(0, 100))
    }

    // Tailwind 기본 브레이크포인트 (R-01)
    if (TW_DEFAULT_BREAKPOINT.test(trimmed)) {
      const match = trimmed.match(TW_DEFAULT_BREAKPOINT)
      warn(relPath, lineNum, `[R-01] Tailwind 기본 \`${match[0]}\` 사용. INFOUX 브레이크포인트 \`mobile:\` / \`tablet:\` / \`laptop:\` / \`pc:\` 사용.`, trimmed.slice(0, 100))
    }

    // 옛 btn variant (R-06: 시각적/구형 modifier)
    for (const oldVar of OLD_BTN_VARIANTS) {
      if (trimmed.match(new RegExp(`\\b${oldVar.replace(/--/g, '\\-\\-')}\\b`))) {
        warn(relPath, lineNum, `[R-06] 옛 버튼 variant \`${oldVar}\` 사용. KRDS variant로 교체.`, trimmed.slice(0, 100))
      }
    }
  })
}

// ─── 스크립트의 자리 콘텐츠 (R-23) ───────────────────────
// img.src = 'https://picsum.photos/…' 처럼 스크립트가 넣는 자리 이미지는 외부 의존이라 오류다(주석은 빼고 본다).
// 문자열 리터럴의 lorem은 오류, 그 밖의 채움 문구·지어낸 연락처는 경고 — JS에는 페이지 범위가 없다
function checkJsFile(filePath) {
  if (!COPY) return
  reportVisual(rel(filePath), COPY.scanJsCopy(fs.readFileSync(filePath, 'utf-8'), getCopyCtx()))
}

// ─── SCSS 파일 잔재 검출 ──────────────────────────────

function checkScssRemnants() {
  const dirs = [path.join(ROOT, 'src'), path.join(ROOT, 'starter', 'src')]
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue
    const found = collectFiles(dir, '.scss', ['node_modules'])
    for (const f of found) {
      error(rel(f), null, '[R-03] SCSS 파일 잔재. info-design은 CSS만 허용. 파일 삭제 또는 마이그레이션 필요.')
    }
  }
}

// ─── 컴포넌트 인덱스 일관성 ───────────────────────────

function checkComponentIndex() {
  const indexPath = path.join(STYLES_DIR, '6-components', 'index.css')
  if (!fs.existsSync(indexPath)) return

  const indexContent = fs.readFileSync(indexPath, 'utf-8')
  const componentsDir = path.join(STYLES_DIR, '6-components')

  const cssFiles = fs.readdirSync(componentsDir)
    .filter(f => f.endsWith('.css') && f !== 'index.css')
    .map(f => f.replace(/\.css$/, ''))

  const importedNames = []
  indexContent.split('\n').forEach(line => {
    const match = line.match(/@import\s+["']\.\/([^"']+)\.css["']/)
    if (match) importedNames.push(match[1])
  })

  cssFiles.forEach(name => {
    if (!importedNames.includes(name)) {
      error(rel(indexPath), null, `${name}.css가 존재하지만 index.css에 @import 누락.`)
    }
  })
}

// ─── 파일 수집 ────────────────────────────────────────

function collectFiles(dir, ext, excludes = []) {
  if (!fs.existsSync(dir)) return []
  const results = []
  function walk(current) {
    fs.readdirSync(current).forEach(name => {
      const full = path.join(current, name)
      const stat = fs.statSync(full)
      if (stat.isDirectory()) walk(full)
      else if (full.endsWith(ext) && !excludes.some(e => full.includes(e))) {
        results.push(full)
      }
    })
  }
  walk(dir)
  return results
}

// ─── 메인 ──────────────────────────────────────────────

function main() {
  console.log(`${CYAN}[check-violations]${RESET} info-design 컨트랙트 검사 시작...\n`)

  if (TARGET_FILES.length > 0) {
    let isPagePath = () => false
    try {
      isPagePath = require('./lib/page-scope').isPagePath
    } catch (e) {
      if (e.code !== 'MODULE_NOT_FOUND') throw e
    }
    for (const target of TARGET_FILES) {
      const abs = path.resolve(target)
      if (!fs.existsSync(abs)) {
        console.error(`파일을 찾을 수 없음: ${target}`)
        process.exit(1)
      }
      if (abs.endsWith('.css')) checkCssFile(abs)
      if (abs.endsWith('.html') || abs.endsWith('.njk') || abs.endsWith('.md')) {
        checkHtmlFile(abs, { isPage: isPagePath(ROOT, toPosix(path.relative(ROOT, abs))) })
      }
      if (abs.endsWith('.js') && /^\/src\/js\//.test(relPosix(abs))) checkJsFile(abs)
    }
  } else {
    const cssFiles = collectFiles(STYLES_DIR, '.css', ['node_modules'])
    cssFiles.forEach(checkCssFile)
    collectFiles(path.join(ROOT, 'src', 'js'), '.js', ['node_modules']).forEach(checkJsFile)

    // SCSS 잔재
    checkScssRemnants()

    // HTML/NJK/스니펫 (Markdown 안 HTML 포함)
    const htmlFiles = [
      ...collectFiles(SNIPPETS_DIR, '.md'),
      ...collectFiles(SITE_DIR, '.html', ['_site', 'node_modules']),
      ...collectFiles(SITE_DIR, '.njk', ['_site', 'node_modules']),
      // 사이트 문서의 예시 코드·원시 HTML도 시각 서명 대상이다(반례 폴더는 HTML_SKIP_PATTERNS로 빠진다)
      ...collectFiles(SITE_DIR, '.md', ['_site', 'node_modules']),
      ...collectFiles(path.join(ROOT, 'src/playground'), '.html')
    ]
    // 납품 페이지(루트 *.html·pages/**·infoux.json pages) — 파생 프로젝트의 실제 화면도 검사한다(HX-06)
    let pageScope
    try {
      pageScope = require('./lib/page-scope').collectPageFiles(ROOT)
    } catch (e) {
      if (e.code !== 'MODULE_NOT_FOUND') throw e
      pageScope = { files: [], problems: ['scripts/lib/page-scope.js가 없어 납품 페이지를 검사하지 못했다 — 스타터를 갱신한다'], notices: [] }
    }
    for (const problem of pageScope.problems) error('infoux.json', null, `[HX-06] ${problem}`)
    for (const notice of pageScope.notices) warn('infoux.json', null, `[HX-06] ${notice}`)
    const pages = new Set(pageScope.files)
    for (const page of pageScope.files) {
      if (!htmlFiles.includes(page)) htmlFiles.push(page)
    }
    htmlFiles.forEach(file => checkHtmlFile(file, { isPage: pages.has(file) }))

    checkComponentIndex()
  }

  console.log('')

  if (errorCount === 0 && warnCount === 0) {
    console.log(`${GREEN}✓ info-design 컨트랙트 위반 없음${RESET}`)
    process.exit(0)
  }

  if (errorCount > 0) {
    console.error(`${RED}오류 ${errorCount}개${RESET}${warnCount > 0 ? `, ${YELLOW}경고 ${warnCount}개${RESET}` : ''}`)
    process.exit(2)
  }

  console.warn(`${YELLOW}경고 ${warnCount}개${RESET} (오류 없음)`)
  // 경고는 CI/Git hook을 차단하지 않는다 (오류만 차단). 경고를 차단하려면 STRICT=1 환경변수.
  process.exit(process.env.STRICT === '1' ? 1 : 0)
}

main()
