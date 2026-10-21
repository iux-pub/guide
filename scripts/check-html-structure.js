#!/usr/bin/env node

// check-html-structure.js — info-design HTML 구조 컨트랙트 자동 검출
// R-15: 기존 인포마인드 HTML 패턴을 우선 유지하되 시맨틱 보강이 필요한지 점검
// R-16: 인터랙티브 컴포넌트의 필수 ARIA 속성 누락
// R-17: 비-BEM 상태 클래스 (.is-*, .has-*)
// R-18: 시각적 단어 modifier (--blue, --big, --rounded 등)
// R-25: 섹션 리듬 — 동일 archetype 3연속·카드 중첩·카드 그리드 남발
//
// 단일 소스: references/html-semantics.md
// 종료 코드: 0 = 통과 또는 경고만, 2 = 오류
//   STRICT=1 시 경고도 1로 실패 처리

const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const SNIPPETS_DIR = path.join(ROOT, 'src/snippets')
const PLAYGROUND_DIR = path.join(ROOT, 'src/playground')
const SITE_DIR = path.join(ROOT, 'site')
// AI가 직접 읽는 컨텍스트 — MCP 번들(references)과 손으로 쓴 프롬프트(prompts)도 같은 기준으로 본다
const REFERENCES_DIR = path.join(ROOT, 'references')
const PROMPTS_DIR = path.join(ROOT, 'prompts')
const PAGE_CONTRACT_PATH = path.join(ROOT, 'contracts', 'html-page-contract.json')

const TARGET_FILES = process.argv.slice(2)
const HAS_EXPLICIT_TARGETS = TARGET_FILES.length > 0
const PAGE_CONTRACT = fs.existsSync(PAGE_CONTRACT_PATH)
  ? JSON.parse(fs.readFileSync(PAGE_CONTRACT_PATH, 'utf-8'))
  : null

// 납품 페이지(루트 *.html·pages/**·infoux.json pages) — 인자 없이 돌 때도 page 계약으로 검사한다(HX-06)
const PAGE_SCOPE = (() => {
  if (HAS_EXPLICIT_TARGETS) return { files: [], problems: [], notices: [] }
  try {
    return require('./lib/page-scope').collectPageFiles(ROOT)
  } catch (e) {
    if (e.code !== 'MODULE_NOT_FOUND') throw e
    return { files: [], problems: ['scripts/lib/page-scope.js가 없어 납품 페이지를 검사하지 못했다 — npm run sync:starter(또는 스타터 갱신)로 받는다'], notices: [] }
  }
})()
const PAGE_FILES = new Set(PAGE_SCOPE.files)

// 한국형 페이지 골격(R-32 푸터 개인정보 처리방침·R-40 공공 통합검색·R-41 서브 골격) — 없으면(오래된 파생 프로젝트) 건너뛴다
let PAGE_RULES = null
let isPagePath = () => false
let pageTypeOf = () => null
try {
  PAGE_RULES = require('./lib/page-rules')
  isPagePath = require('./lib/page-scope').isPagePath
  pageTypeOf = require('./lib/page-scope').pageTypeOf
} catch (e) {
  if (e.code !== 'MODULE_NOT_FOUND') throw e
}
// 이름의 질(R-09 alt·R-30 링크 이름·R-50 placeholder) — 없으면(오래된 파생 프로젝트) 건너뛴다
let QUALITY = null
try {
  QUALITY = require('./lib/content-quality')
} catch (e) {
  if (e.code !== 'MODULE_NOT_FOUND') throw e
}
// 아이콘 사용처(R-27 — 대장 이름·스프라이트·aria-hidden·직접 그린 svg·표정 혼용) — 없으면 건너뛴다
let ICONS = null
let ICON_CATALOG = null
try {
  ICONS = require('./lib/icon-usage')
  ICON_CATALOG = ICONS.loadIconCatalog(ROOT)
} catch (e) {
  if (e.code !== 'MODULE_NOT_FOUND') throw e
}
// 사이트 유형 — infoux.json profile. 없으면 유형별 판정(공공 통합검색·커머스 사업자 정보)을 하지 않는다
const PROFILE = (() => {
  try {
    const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'infoux.json'), 'utf8').replace(/^\uFEFF/, ''))
    return typeof config.profile === 'string' ? config.profile : null
  } catch {
    return null
  }
})()
// 공식 아이덴티티(공식 배너·정부 상징 허용) — infoux.json publicIdentity만 권한이 있다. 없으면 unconfirmed(R-46)
const PUBLIC_IDENTITY = (() => {
  try {
    const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'infoux.json'), 'utf8').replace(/^\uFEFF/, ''))
    return typeof config.publicIdentity === 'string' ? config.publicIdentity : 'unconfirmed'
  } catch {
    return 'unconfirmed'
  }
})()
// 표현 등급 — 프로필 기본값(contracts/profiles.json expression). 프로필이 없으면 null(히어로 높이는 경고로만)
const EXPRESSION = (() => {
  if (!PROFILE) return null
  try {
    const spec = JSON.parse(fs.readFileSync(path.join(ROOT, 'contracts', 'profiles.json'), 'utf8'))
    return (spec.profiles || []).find(p => p.id === PROFILE)?.expression || null
  } catch {
    return null
  }
})()

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
// 경로 판정 정규식은 '/' 구분자를 가정한다. Windows의 '\' 경로도 같은 판정을 받게 한다.
const toPosix = (p) => p.split(path.sep).join('/')
// 경로 판정은 프로젝트 루트 기준 상대 경로로 한다 — 상위 폴더 이름(…/references/프로젝트)이 판정을 바꾸지 않게
const relPosix = (p) => '/' + toPosix(path.relative(ROOT, p))

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
  'breadcrumb': { allowedTags: ['nav'], requireAriaLabel: true, note: 'nav에 aria-label="브레드크럼"(KRDS)' },
  'site-header': { allowedTags: ['header'], note: '사이트 헤더' },
  'site-footer': { allowedTags: ['footer'], note: '페이지 shell의 footer#footer 랜드마크' },
  'main-menu': { allowedTags: ['nav'], requireAriaLabel: true, note: 'nav에 aria-label="메인 메뉴"' },
  'mobile-menu': { allowedTags: ['div', 'dialog'], note: 'div 사용 시 role="dialog" aria-modal="true" aria-labelledby 필수' },
  'pagination': { allowedTags: ['nav'], requireAriaLabel: true, note: 'nav에 aria-label="페이지 내비게이션"' },

  // 그룹 D — 피드백
  'alert': { allowedTags: ['div'], requireRoleAlertOrStatus: true, note: 'role="alert" 또는 role="status"' },
  'notice-bar': { allowedTags: ['section'], requireAriaLabel: true, note: 'section에 aria-label="사이트 공지" — KRDS 긴급 공지: main#main의 첫 section(header 다음, 히어로 앞), 닫기 버튼 없음, 링크 1개, 라이브 영역(role/aria-live)은 쓰지 않는다' },
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
  'error-page': { allowedTags: ['div'], note: 'main > section > .container 안의 컴포넌트 루트. h1은 오류 제목 하나' },
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
    desc: 'aria-label="브레드크럼" (KRDS)'
  },
  'main-menu': {
    requireAll: [/aria-label=/],
    desc: 'aria-label (메뉴 설명)'
  },
  'mobile-menu': {
    requireAll: ['role="dialog"', 'aria-modal="true"', /aria-labelledby=|aria-label=/],
    desc: 'role="dialog" + aria-modal="true" + aria-labelledby/aria-label'
  },
  'notice-bar': {
    requireAll: [/aria-label=/],
    desc: 'aria-label (공지 영역 이름)'
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
// 절대 금지 규칙으로 error 처리

const NON_BEM_STATE_CLASS = /\bclass\s*=\s*["'][^"']*?\b(is|has)-[a-z][\w-]*/g

// ─── R-18: 시각적 단어 modifier 블랙리스트 ───────────────────────
// modifier 부분(--xxx)에서 시각적 단어 사용 검출

// 클래스 명명 계약 — 금지어·폐기 대응·면제 접두어의 정본. 없으면(오래된 파생 프로젝트) 아래 기본값을 쓴다.
const CLASS_NAMING_PATH = path.join(ROOT, 'contracts', 'class-naming.json')
const CLASS_NAMING = fs.existsSync(CLASS_NAMING_PATH)
  ? JSON.parse(fs.readFileSync(CLASS_NAMING_PATH, 'utf-8'))
  : null

const FORBIDDEN_MODIFIER_WORDS = CLASS_NAMING?.forbiddenWords || [
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
const FORBIDDEN_WORD_SET = new Set(FORBIDDEN_MODIFIER_WORDS)
const DEPRECATED_CLASSES = new Map((CLASS_NAMING?.deprecated || []).map(d => [d.class, d.replacement]))
const EXEMPT_BLOCK_PREFIXES = CLASS_NAMING?.exemptBlockPrefixes || ['docs-', 'pg']

// 파일 이름 ≠ 블록 이름인 컴포넌트와 흔한 오기 — AI가 header__*, form__*, table-wrapper처럼 지어내는 블록.
// CSS에 그 이름의 블록이 없을 때만 실제 블록 이름을 알려 준다(프로젝트가 같은 이름을 정의했으면 건드리지 않는다).
const BLOCK_ALIASES = (() => {
  const map = new Map()
  for (const fb of CLASS_NAMING?.fileBlocks || []) {
    if (!fb.blocks.includes(fb.component)) map.set(fb.component, fb.blocks)
  }
  for (const a of CLASS_NAMING?.blockAliases || []) map.set(a.alias, [a.block])
  return map
})()

// modifier를 '-'로 나눈 조각 중 금지어가 있으면 그 단어를 돌려준다(--gray-dark, --dark-mode 모두 잡는다)
function forbiddenSegment(modifier) {
  return modifier.split('-').find(seg => FORBIDDEN_WORD_SET.has(seg)) || null
}

// ─── R-29: 마크업의 BEM 클래스는 CSS에 실재해야 한다 ─────────────────
// src/styles와 아이콘 CSS에 정의된 클래스를 모은다. 이 색인의 블록에 속한 클래스만 검사한다
// (프로젝트 고유 블록·외부 라이브러리 클래스는 대상이 아니다).
function collectCssClasses() {
  const classes = new Set()
  const files = []
  const walk = (dir) => {
    if (!fs.existsSync(dir)) return
    for (const name of fs.readdirSync(dir)) {
      const full = path.join(dir, name)
      if (fs.statSync(full).isDirectory()) walk(full)
      else if (name.endsWith('.css')) files.push(full)
    }
  }
  walk(path.join(ROOT, 'src', 'styles'))
  const iconsCss = path.join(ROOT, 'assets', 'icons', 'icons.css')
  if (fs.existsSync(iconsCss)) files.push(iconsCss)
  for (const file of files) {
    const css = fs.readFileSync(file, 'utf-8').replace(/\/\*[\s\S]*?\*\//g, '')
    for (const m of css.matchAll(/\.([a-z][a-z0-9]*(?:-[a-z0-9]+)*(?:__[a-z0-9]+(?:-[a-z0-9]+)*)?(?:--[a-z0-9]+(?:-[a-z0-9]+)*)?)/g)) {
      classes.add(m[1])
    }
  }
  const blocks = new Set([...classes].map(c => c.split(/__|--/)[0]))
  return { classes, blocks }
}
const CSS_INDEX = collectCssClasses()
// 주의: --xl, --xxl은 KRDS 정의가 아님 (KRDS는 xsmall/small/medium/large/xlarge 표준)
// 단, --xl/--xxl 이미 사용 중이면 별도 정리 필요. 일단 미검출(false negative 허용).

// 블록(·element)과 modifier 전체를 잡는다. 판정은 forbiddenSegment()가 조각 단위로 한다.
const MODIFIER_TOKEN_RE = /\b([a-z][a-z0-9]*(?:-[a-z0-9]+)*(?:__[a-z0-9]+(?:-[a-z0-9]+)*)?)--([a-z0-9]+(?:-[a-z0-9]+)*)\b/g

// 블록별 예외 — 그 블록에서는 정의된 축 이름이라 시각적 작명이 아니다.
//
// 아이콘의 icon-font--bold는 font-weight: bold와 같은 성격이다. 굵기 축의 이름이
// 계약(icon-contract.json)에 값으로 박혀 있고 폰트 파일이 그 이름으로 갈린다.
// 목록을 여기 적지 않고 계약에서 읽는 이유: 축이 바뀌면 예외도 같이 움직여야 한다.
// 계약에 없는 이름은 그대로 걸린다.
const ALLOWED_MODIFIER_BY_BLOCK = (() => {
  const map = new Map()
  try {
    const contract = JSON.parse(
      fs.readFileSync(path.join(__dirname, '..', 'contracts/icon-contract.json'), 'utf8')
    )
    const ids = (contract.variants?.combinations || []).map((c) => c.id)
    if (ids.length > 0) map.set('icon-font', new Set(ids))
  } catch {
    // 계약이 없으면 예외도 없다 — 금지어가 그대로 적용된다
  }
  return map
})()

// ─── HTML 코드 블록 추출 ────────────────────────────────────
// Markdown 파일에서 ```html 블록 추출
function extractHtmlBlocks(content) {
  const blocks = []
  const re = /```html\s*\n([\s\S]*?)\n```/g
  let m
  while ((m = re.exec(content)) !== null) {
    const blockText = m[1]
    // 펜스(```html) 다음 줄이 블록 1행이다
    const startLine = content.slice(0, m.index).split('\n').length + 1
    blocks.push({ text: blockText, startLine })
  }
  return blocks
}

const VOID_TAGS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr'
])

function parseAttrs(attrText) {
  const attrs = {}
  const re = /([:@\w-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g
  let m
  while ((m = re.exec(attrText)) !== null) {
    attrs[m[1].toLowerCase()] = m[2] ?? m[3] ?? m[4] ?? ''
  }
  return attrs
}

function classList(node) {
  return (node.attrs.class || '').split(/\s+/).filter(Boolean)
}

function hasClass(node, className) {
  return classList(node).includes(className)
}

function parseHtmlTree(html) {
  const root = { tag: '#root', attrs: {}, children: [], parent: null, line: 1, raw: '' }
  const stack = [root]
  const tagRe = /<\/?([a-zA-Z][\w:-]*)(\s[^<>]*?)?\/?>/g
  let m

  while ((m = tagRe.exec(html)) !== null) {
    const raw = m[0]
    const tag = m[1].toLowerCase()
    if (raw.startsWith('<!')) continue

    const isClosing = raw.startsWith('</')
    if (isClosing) {
      for (let i = stack.length - 1; i > 0; i--) {
        if (stack[i].tag === tag) {
          stack.length = i
          break
        }
      }
      continue
    }

    const line = html.slice(0, m.index).split('\n').length
    const attrs = parseAttrs(m[2] || '')
    const node = {
      tag,
      attrs,
      children: [],
      parent: stack[stack.length - 1],
      line,
      raw
    }
    stack[stack.length - 1].children.push(node)

    const selfClosing = raw.endsWith('/>') || VOID_TAGS.has(tag)
    if (!selfClosing) stack.push(node)
  }

  return root
}

function findNodes(node, predicate, out = []) {
  if (predicate(node)) out.push(node)
  for (const child of node.children || []) findNodes(child, predicate, out)
  return out
}

function findById(root, id) {
  return findNodes(root, node => node.attrs && node.attrs.id === id)[0]
}

function directElementChildren(node) {
  return (node.children || []).filter(child => child.tag !== 'script' && child.tag !== 'template')
}

function ancestor(node, predicate) {
  let current = node.parent
  while (current) {
    if (predicate(current)) return current
    current = current.parent
  }
  return null
}

function checkFormLabels(root, filePath, baseLineNum) {
  const controls = findNodes(root, node => {
    if (!['input', 'select', 'textarea'].includes(node.tag)) return false
    if (node.tag !== 'input') return true
    return !['hidden', 'button', 'submit', 'reset', 'image'].includes(node.attrs.type || 'text')
  })

  for (const control of controls) {
    const id = control.attrs.id
    const hasExplicitLabel = id && findNodes(root, node =>
      node.tag === 'label' && node.attrs.for === id
    ).length > 0
    const hasWrappingLabel = Boolean(ancestor(control, node => node.tag === 'label'))
    const hasAriaLabel = Boolean(control.attrs['aria-label'])
    const labelledBy = control.attrs['aria-labelledby']
    const hasAriaLabelledBy = Boolean(labelledBy && findById(root, labelledBy))

    if (!hasExplicitLabel && !hasWrappingLabel && !hasAriaLabel && !hasAriaLabelledBy) {
      error(
        rel(filePath),
        nodeLine(baseLineNum, control),
        '[R-16] 폼 컨트롤에 접근 가능한 이름이 없습니다. label[for], 감싸는 label, aria-label 또는 유효한 aria-labelledby를 사용하세요.',
        control.raw.slice(0, 120),
        'R-16'
      )
    }
  }
}

function checkTabPattern(root, filePath, baseLineNum) {
  const tabRoots = findNodes(root, node => hasClass(node, 'tab'))

  for (const tabRoot of tabRoots) {
    const tablists = findNodes(tabRoot, node => node.attrs.role === 'tablist')
    const tabs = findNodes(tabRoot, node => node.attrs.role === 'tab')
    const panels = findNodes(tabRoot, node => node.attrs.role === 'tabpanel')

    if (tablists.length !== 1 || tabs.length === 0 || panels.length === 0) {
      error(
        rel(filePath),
        nodeLine(baseLineNum, tabRoot),
        '[R-16] tab은 role="tablist", role="tab", role="tabpanel" 구조를 모두 포함해야 합니다.',
        tabRoot.raw.slice(0, 120),
        'R-16'
      )
      continue
    }

    let selectedCount = 0
    for (const tab of tabs) {
      const selected = tab.attrs['aria-selected']
      const controls = tab.attrs['aria-controls']
      if (selected === 'true') selectedCount++
      if (!tab.attrs.id || !['true', 'false'].includes(selected) || !controls) {
        error(
          rel(filePath),
          nodeLine(baseLineNum, tab),
          '[R-16] 각 tab에는 id, aria-selected="true|false", aria-controls가 필요합니다.',
          tab.raw.slice(0, 120),
          'R-16'
        )
        continue
      }
      const panel = findById(root, controls)
      if (!panel || panel.attrs.role !== 'tabpanel' || panel.attrs['aria-labelledby'] !== tab.attrs.id) {
        error(
          rel(filePath),
          nodeLine(baseLineNum, tab),
          '[R-16] tab의 aria-controls 대상은 role="tabpanel"이며 해당 패널은 tab id를 aria-labelledby로 참조해야 합니다.',
          tab.raw.slice(0, 120),
          'R-16'
        )
      }
    }

    if (selectedCount !== 1) {
      error(
        rel(filePath),
        nodeLine(baseLineNum, tabRoot),
        '[R-16] tab 그룹에는 aria-selected="true"인 탭이 정확히 하나 필요합니다.',
        tabRoot.raw.slice(0, 120),
        'R-16'
      )
    }
  }
}

function checkAccordionPattern(root, filePath, baseLineNum) {
  const accordionRoots = findNodes(root, node => hasClass(node, 'accordion'))

  for (const accordionRoot of accordionRoots) {
    const details = findNodes(accordionRoot, node => node.tag === 'details')
    if (details.length > 0) {
      for (const item of details) {
        const firstChild = directElementChildren(item)[0]
        if (!firstChild || firstChild.tag !== 'summary') {
          error(
            rel(filePath),
            nodeLine(baseLineNum, item),
            '[R-16] native accordion의 details 첫 자식은 summary여야 합니다.',
            item.raw.slice(0, 120),
            'R-16'
          )
        }
      }
      continue
    }

    const triggers = findNodes(accordionRoot, node => hasClass(node, 'accordion__trigger'))
    if (triggers.length === 0) {
      error(
        rel(filePath),
        nodeLine(baseLineNum, accordionRoot),
        '[R-16] accordion은 details/summary 또는 accordion__trigger 기반 ARIA 패턴을 사용해야 합니다.',
        accordionRoot.raw.slice(0, 120),
        'R-16'
      )
      continue
    }

    for (const trigger of triggers) {
      const controls = trigger.attrs['aria-controls']
      if (trigger.tag !== 'button' || !['true', 'false'].includes(trigger.attrs['aria-expanded']) || !controls || !findById(root, controls)) {
        error(
          rel(filePath),
          nodeLine(baseLineNum, trigger),
          '[R-16] custom accordion trigger는 button이며 aria-expanded="true|false", aria-controls와 유효한 패널 id가 필요합니다.',
          trigger.raw.slice(0, 120),
          'R-16'
        )
      }
    }
  }
}

// ─── R-16: disclosure 내비게이션 (메가·드롭다운 토글, 모바일 메뉴 햄버거) ───
// 링크 목록을 열고 닫는 버튼은 disclosure 패턴이다 — aria-expanded + aria-controls.
// role="menu"/aria-haspopup 은 애플리케이션 메뉴 위젯 선언이라 화살표 키 운용을 기대하게 만든다.

function checkDisclosureNavPattern(root, filePath, baseLineNum) {
  const toggles = findNodes(root, node => hasClass(node, 'main-menu__toggle'))

  for (const toggle of toggles) {
    const controls = toggle.attrs['aria-controls']
    if (toggle.tag !== 'button' || !['true', 'false'].includes(toggle.attrs['aria-expanded']) || !controls || !findById(root, controls)) {
      error(
        rel(filePath),
        nodeLine(baseLineNum, toggle),
        '[R-16] main-menu__toggle 은 button이며 aria-expanded="true|false", aria-controls와 유효한 패널 id가 필요합니다.',
        toggle.raw.slice(0, 120),
        'R-16'
      )
    }
    if (toggle.attrs['aria-haspopup'] || toggle.attrs.role === 'menu') {
      warn(
        rel(filePath),
        nodeLine(baseLineNum, toggle),
        '[R-16] disclosure 토글에 aria-haspopup/role="menu"를 쓰지 않습니다. 링크 목록을 여는 버튼은 aria-expanded + aria-controls만으로 충분합니다.',
        toggle.raw.slice(0, 120),
        'R-16'
      )
    }
  }

  // 모바일 메뉴 햄버거: aria-expanded 와 aria-controls(= data-mobile-menu-open 값)가 짝이어야 한다.
  // 패널은 헤더 바깥에 있어 같은 코드 블록에 없을 수 있으므로 패널 존재는 요구하지 않는다.
  const openers = findNodes(root, node => node.attrs['data-mobile-menu-open'] !== undefined)
  for (const opener of openers) {
    const target = opener.attrs['data-mobile-menu-open']
    if (
      opener.tag !== 'button' ||
      !['true', 'false'].includes(opener.attrs['aria-expanded']) ||
      !target ||
      opener.attrs['aria-controls'] !== target
    ) {
      error(
        rel(filePath),
        nodeLine(baseLineNum, opener),
        '[R-16] 모바일 메뉴 햄버거는 button이며 aria-expanded="true|false"와, data-mobile-menu-open 값과 같은 aria-controls가 필요합니다.',
        opener.raw.slice(0, 120),
        'R-16'
      )
    }
  }
}

// ─── R-25: 섹션 리듬 ────────────────────────────────────────
// "중앙 제목 + 카드 그리드" 반복이 규정 준수형 무개성의 최빈 패턴이다.
// ① 형제 section 시퀀스에서 동일 archetype(section--X) 3연속 — error
// ② .card 내부 .card 중첩 — error
// ③ 카드 그리드 섹션(같은 부모 아래 직계 .card 3개 이상)이 페이지당 3개 이상 또는 연속 배치 — warn
// 대체 패턴 공급: src/styles/5-objects/section-media.css·hero-bleed.css + src/snippets/signature.md

function sectionArchetype(section) {
  const modifier = classList(section).find(name => /^section--[\w-]+$/.test(name))
  return modifier ? modifier.slice('section--'.length) : null
}

// 카드형 — card 토큰, 또는 BEM 블록 토큰(__·-- 없음)이 -card·-tile로 끝나는 요소(구획 태그 제외)
const CARD_SUFFIX_EXEMPT_TAGS = new Set(['section', 'main', 'ul', 'ol', 'nav', 'header', 'footer'])
function isCardLike(node) {
  const names = classList(node)
  if (names.includes('card')) return true
  return !CARD_SUFFIX_EXEMPT_TAGS.has(node.tag) && names.some(name => /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*-(?:card|tile)$/.test(name))
}

// 자식이 하나인 래퍼 사슬(li > div > article.card)을 2단까지 따라가 카드형에 닿는가 — 탭 패널·숨김 래퍼는 세지 않는다
function wrapsCard(node, depth = 0) {
  if (isCardLike(node)) return true
  if (depth >= 2 || node.attrs?.role === 'tabpanel' || 'hidden' in (node.attrs || {})) return false
  const kids = directElementChildren(node)
  return kids.length === 1 && wrapsCard(kids[0], depth + 1)
}

function isCardGridSection(section) {
  return findNodes(section, node =>
    directElementChildren(node).filter(child => wrapsCard(child)).length >= 3
  ).length > 0
}

function checkSectionRhythm(root, filePath, baseLineNum) {
  // 납품 페이지는 그리드 섹션 3연속·페이지당 3개 이상을 오류로 본다(연속 2개는 경고)
  const deliverable = PAGE_FILES.has(filePath)
  // ② 카드 중첩 — 위치 무관 전역 검사
  for (const card of findNodes(root, node => isCardLike(node))) {
    if (ancestor(card, node => isCardLike(node))) {
      error(
        rel(filePath),
        nodeLine(baseLineNum, card),
        '[R-25] 카드 안에 카드를 중첩하지 마세요. 내부 콘텐츠는 목록·정의형 마크업으로 평탄화합니다.',
        card.raw.slice(0, 120),
        'R-25'
      )
    }
  }

  // 형제 section 시퀀스 단위로 리듬을 판정한다 (main 직계 포함, 래퍼 무관)
  const parents = findNodes(root, node =>
    (node.children || []).filter(child => child.tag === 'section').length > 0)

  const gridSections = []
  for (const parent of parents) {
    const sections = directElementChildren(parent).filter(child => child.tag === 'section')

    // ① 동일 archetype 3연속
    let streakName = null
    let streak = 0
    for (const section of sections) {
      const archetype = sectionArchetype(section)
      if (archetype && archetype === streakName) {
        streak++
      } else {
        streakName = archetype
        streak = archetype ? 1 : 0
      }
      if (streak >= 3) {
        error(
          rel(filePath),
          nodeLine(baseLineNum, section),
          `[R-25] 동일 archetype "section--${archetype}" 3연속 — 연속 상한은 2입니다. section-media(이미지-텍스트 교차)·시그니처 요소 같은 변주 패턴을 사이에 끼우세요(hero-bleed는 첫 섹션 전용 — R-42).`,
          section.raw.slice(0, 120),
          'R-25'
        )
        streakName = null
        streak = 0
      }
    }

    // ③ 카드 그리드 섹션 — 연속 배치 판정 (형제 시퀀스 기준)
    let gridStreak = 0
    for (const section of sections) {
      const grid = isCardGridSection(section)
      if (grid) gridSections.push(section)
      gridStreak = grid ? gridStreak + 1 : 0
      if (gridStreak >= 2) {
        const report = gridStreak >= 3 && deliverable ? error : warn
        report(
          rel(filePath),
          nodeLine(baseLineNum, section),
          `[R-25] 카드 그리드 섹션이 ${gridStreak}개 연속 배치됐습니다. 사이에 section-media 같은 변주 패턴이나 목록·표 섹션을 끼우세요.`,
          section.raw.slice(0, 120),
          'R-25'
        )
      }
    }
  }

  // ③ 카드 그리드 섹션 페이지당 3개 이상
  if (gridSections.length > 2) {
    const report = deliverable ? error : warn
    report(
      rel(filePath),
      nodeLine(baseLineNum, gridSections[2]),
      `[R-25] 카드 그리드 섹션이 페이지당 ${gridSections.length}개 — 2개 이하를 권장합니다. 카드가 아니어도 되는 콘텐츠는 목록·표로 풉니다.`,
      gridSections[2].raw.slice(0, 120),
      'R-25'
    )
  }
}

function isPageLikeHtml(html) {
  return /<!doctype html/i.test(html) ||
    /<body\b/i.test(html) ||
    /<main\b/i.test(html) ||
    /skip-to-content/.test(html)
}

function shouldCheckPageContract(html, filePath) {
  if (!isPageLikeHtml(html)) return false

  // 플레이그라운드는 컴포넌트 하나만 띄우는 내부 데모다. page shell(헤더·본문·푸터·
  // 건너뛰기 링크)을 요구할 대상이 아니며, check-violations.js도 같은 이유로 R-14를
  // 면제한다. 명시적으로 파일을 넘겨받는 경로(pre-commit 훅)에서도 같게 판단해야
  // 두 검사기가 어긋나지 않는다.
  if (/\/src\/playground\//.test(relPosix(filePath))) return false

  // Nunjucks 레이아웃·파셜(site/_includes)은 페이지가 아니라 조각이다. 완성된 shell 은 렌더 결과(_site)가 갖는다.
  // 전체 검사(walk) 모드에서는 원래 page shell 을 요구하지 않았는데, 파일을 지정하면(pre-commit 훅)
  // <main>·skip-to-content 가 든 레이아웃이 완전한 페이지로 판정돼 레이아웃을 고칠 때마다 커밋이 막혔다.
  if (/\/site\/_includes\//.test(relPosix(filePath))) return false

  if (HAS_EXPLICIT_TARGETS) return true

  // 인자 없는 검사: 납품 페이지와 페이지 골격 스니펫만 page 계약을 받는다
  if (PAGE_FILES.has(path.resolve(filePath))) return true
  const relative = toPosix(rel(filePath))
  return relative === 'src/snippets/boilerplate.md'
}

function nodeLine(baseLineNum, node) {
  return baseLineNum + node.line - 1
}

function hasAccessibleSectionName(root, section) {
  if (section.attrs['aria-label']) return true
  const labelledBy = section.attrs['aria-labelledby']
  if (labelledBy && findById(root, labelledBy)) return true
  return findNodes(section, node => /^h[1-6]$/.test(node.tag)).length > 0
}

function allowedSectionModifiers() {
  return new Set((PAGE_CONTRACT?.sectionArchetypes || []).map(name => `section--${name}`))
}

function checkPageContract(html, filePath, baseLineNum = 1) {
  if (!shouldCheckPageContract(html, filePath)) return

  const root = parseHtmlTree(html)
  const bodies = findNodes(root, node => node.tag === 'body')
  const body = bodies[0]
  const skipLinks = findNodes(root, node =>
    node.tag === 'a' &&
    hasClass(node, 'skip-to-content') &&
    node.attrs.href === '#main'
  )
  const headers = findNodes(root, node => node.tag === 'header' && node.attrs.id === 'header')
  const mains = findNodes(root, node => node.tag === 'main')
  const main = mains[0]
  const footers = findNodes(root, node => node.tag === 'footer' && node.attrs.id === 'footer')

  if (skipLinks.length === 0) {
    error(
      rel(filePath),
      baseLineNum,
      '[R-14] page shell에 본문 바로가기 링크가 없습니다. body 첫 요소로 <a href="#main" class="skip-to-content">본문 바로가기</a>를 배치하세요.',
      '',
      'R-14'
    )
  }

  if (body && skipLinks[0]) {
    const firstChild = directElementChildren(body)[0]
    if (firstChild !== skipLinks[0]) {
      error(
        rel(filePath),
        nodeLine(baseLineNum, firstChild || body),
        '[R-14] .skip-to-content는 body의 첫 의미 요소여야 합니다.',
        firstChild ? firstChild.raw.slice(0, 120) : body.raw.slice(0, 120),
        'R-14'
      )
    }
  }

  if (headers.length === 0) {
    error(rel(filePath), baseLineNum, '[R-15] page shell에 header#header가 없습니다.', '', 'R-15')
  }

  if (mains.length !== 1 || !main || main.attrs.id !== (PAGE_CONTRACT?.main?.id || 'main')) {
    const line = main ? nodeLine(baseLineNum, main) : baseLineNum
    error(rel(filePath), line, '[R-15] page shell에는 main#main이 정확히 1개 필요합니다.', main ? main.raw.slice(0, 120) : '', 'R-15')
  }

  if (footers.length === 0) {
    error(rel(filePath), baseLineNum, '[R-15] page shell에 footer#footer가 없습니다.', '', 'R-15')
  }

  // 한국형 골격은 실제 페이지(납품 페이지·boilerplate 스니펫)만 — 사이트 문서의 '...' 생략 골격은 대상이 아니다
  const relative = toPosix(rel(filePath))
  if (PAGE_RULES && (PAGE_FILES.has(path.resolve(filePath)) || isPagePath(ROOT, relative) || relative === 'src/snippets/boilerplate.md')) {
    // 페이지 유형(K-16)은 infoux.json pageTypes 선언에서만 — boilerplate 스니펫은 유형이 없다
    for (const f of PAGE_RULES.scanPageRules(html, { profile: PROFILE, expression: EXPRESSION, publicIdentity: PUBLIC_IDENTITY, pageType: pageTypeOf(ROOT, relative) })) {
      const report = f.severity === 'error' ? error : warn
      report(rel(filePath), baseLineNum + (f.line || 1) - 1, `[${f.rule}] ${f.message}`, f.code, f.rule)
    }
  }

  if (!main) return

  const mainChildren = directElementChildren(main)
  for (const child of mainChildren) {
    if (child.tag !== (PAGE_CONTRACT?.main?.directChildTag || 'section')) {
      error(
        rel(filePath),
        nodeLine(baseLineNum, child),
        '[R-15] main의 직계 자식은 section이어야 합니다. 페이지 전체가 아니라 main 내부 section 단위로 컴포넌트화하세요.',
        child.raw.slice(0, 120),
        'R-15'
      )
    }
  }

  const sections = mainChildren.filter(child => child.tag === 'section')
  const sectionModifierSet = allowedSectionModifiers()
  for (const section of sections) {
    const hasDirectContainer = directElementChildren(section).some(child => hasClass(child, 'container'))
    if (!hasDirectContainer) {
      error(
        rel(filePath),
        nodeLine(baseLineNum, section),
        '[R-15] section은 직계 자식으로 .container를 포함해야 합니다.',
        section.raw.slice(0, 120),
        'R-15'
      )
    }

    if (!hasAccessibleSectionName(root, section)) {
      error(
        rel(filePath),
        nodeLine(baseLineNum, section),
        '[R-15] section에는 heading 또는 aria-labelledby/aria-label로 접근 가능한 이름이 필요합니다.',
        section.raw.slice(0, 120),
        'R-15'
      )
    }

    for (const modifier of classList(section).filter(name => name.startsWith('section--'))) {
      if (!sectionModifierSet.has(modifier)) {
        error(
          rel(filePath),
          nodeLine(baseLineNum, section),
          `[R-18] section modifier "${modifier}"는 등록된 section archetype이 아닙니다. ${Array.from(sectionModifierSet).join(', ')} 중 하나를 사용하세요.`,
          section.raw.slice(0, 120),
          'R-18'
        )
      }
    }

    // R-25 archetype 선언 — main 직계 section은 등록된 archetype을 정확히 하나 가진다.
    // 빼면 동일 archetype 연속 판정을 우회한다. 납품 페이지는 오류, 그 밖은 경고, 플레이그라운드는 면제
    if (!/^\/src\/playground\//.test(relPosix(filePath))) {
      const declared = classList(section).filter(name => sectionModifierSet.has(name))
      if (declared.length !== 1) {
        const report = declared.length === 0 && PAGE_FILES.has(filePath) ? error : warn
        report(
          rel(filePath),
          nodeLine(baseLineNum, section),
          declared.length === 0
            ? `[R-25] section에 archetype이 없습니다 — ${Array.from(sectionModifierSet).join(', ')} 중 하나를 붙여 섹션 리듬을 선언합니다.`
            : `[R-25] section에 archetype이 ${declared.length}개(${declared.join(' ')}) — 하나만 둡니다.`,
          section.raw.slice(0, 120),
          'R-25'
        )
      }
    }
  }
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

// ─── R-21: <html> lang 속성 ───────────────────────────────────
function checkHtmlLang(html, filePath, baseLineNum) {
  const m = /<html\b([^>]*)>/i.exec(html)
  if (!m) return // <html> 태그가 없는 조각은 대상 아님
  if (/\blang\s*=\s*["'][^"']+["']/i.test(m[1])) return
  const lineNum = baseLineNum + html.slice(0, m.index).split('\n').length - 1
  error(
    rel(filePath),
    lineNum,
    '[R-21] <html>에 lang 속성이 없습니다. 문서 기본 언어를 명시하세요 (예: <html lang="ko">).',
    m[0].slice(0, 120),
    'R-21'
  )
}

// ─── R-28: viewport 확대 차단 ─────────────────────────────────
// WCAG 1.4.4 — 200% 확대가 가능해야 한다. user-scalable=no·0 또는 maximum-scale 2 미만은 오류,
// 2 이상 5 미만은 경고(지정하지 않는 것이 가장 낫다).
const VIEWPORT_META_RE = /<meta\b[^>]*\bname\s*=\s*["']viewport["'][^>]*>/gi
const ZOOM_WARN_CEILING = 5
const ZOOM_MIN_SCALE = 2

function parseViewportContent(tag) {
  const m = /\bcontent\s*=\s*(["'])([\s\S]*?)\1/i.exec(tag)
  if (!m) return {}
  const props = {}
  for (const part of m[2].split(/[,;]/)) {
    const [key, value] = part.split('=').map(s => (s || '').trim().toLowerCase())
    if (key) props[key] = value
  }
  return props
}

function checkViewportZoom(html, filePath, baseLineNum) {
  VIEWPORT_META_RE.lastIndex = 0
  let m
  while ((m = VIEWPORT_META_RE.exec(html)) !== null) {
    const props = parseViewportContent(m[0])
    const lineNum = baseLineNum + html.slice(0, m.index).split('\n').length - 1
    const code = m[0].slice(0, 160)
    const scalable = props['user-scalable']
    const maxScale = props['maximum-scale'] !== undefined ? parseFloat(props['maximum-scale']) : NaN
    if (scalable === 'no' || scalable === '0') {
      error(rel(filePath), lineNum, '[R-28] viewport가 확대를 막습니다(user-scalable). 저시력 사용자가 200% 확대할 수 있게 user-scalable을 지우세요.', code, 'R-28')
    } else if (!Number.isNaN(maxScale) && maxScale < ZOOM_MIN_SCALE) {
      error(rel(filePath), lineNum, `[R-28] viewport maximum-scale=${props['maximum-scale']} — 200% 확대가 불가능합니다. maximum-scale을 지우세요.`, code, 'R-28')
    } else if (!Number.isNaN(maxScale) && maxScale < ZOOM_WARN_CEILING) {
      warn(rel(filePath), lineNum, `[R-28] viewport maximum-scale=${props['maximum-scale']} — 확대 상한을 두지 않는 것이 가장 낫습니다.`, code, 'R-28')
    }
  }
}

// R-29 + R-18(폐기): 카탈로그 블록의 클래스가 CSS에 없거나 폐기 예정이면 알린다.
// modifier는 모양을 바꾸려고 있는 것이라 CSS가 없으면 무의미하거나 지어낸 것이다 → error.
// element는 스타일 없는 구조 표시일 수 있어 warn — 스타일이 필요 없으면 클래스를 달지 않는다.
// R-17 보조: ARIA·네이티브 대응이 있는 상태 modifier는 그 속성과 함께 써야 한다(색만으로 상태를 보이지 않게).
// 키는 modifier 마지막 조각, 값은 같은 요소에 있어야 하는 속성 중 하나.
const STATE_MODIFIER_ATTRS = {
  current: ['aria-current'],
  selected: ['aria-selected', 'aria-current', 'aria-pressed', 'checked'],
  disabled: ['disabled', 'aria-disabled']
}

function checkClassExistence(html, filePath, baseLineNum) {
  const local = new Set()
  for (const s of html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)) {
    for (const m of s[1].matchAll(/\.([a-z][\w-]*)/g)) local.add(m[1])
  }
  const archetypes = new Set((PAGE_CONTRACT?.sectionArchetypes || []).map(a => `section--${a}`))
  const reported = new Set()
  // 이스케이프된 코드 예시(&lt;div class="…"&gt;)의 클래스도 검사하도록 class 속성 단위로 훑는다.
  // ARIA 짝 검사만 실제 태그(<…>) 안에 있을 때 그 태그의 속성을 본다.
  for (const m of html.matchAll(/\bclass\s*=\s*(["'])([^"']*)\1/g)) {
    const lineNum = baseLineNum + html.slice(0, m.index).split('\n').length - 1
    const open = html.lastIndexOf('<', m.index)
    const close = html.indexOf('>', m.index)
    const tagText = open !== -1 && close !== -1 && !html.slice(open, m.index).includes('>') ? html.slice(open, close + 1) : null
    for (const cls of m[2].split(/\s+/).filter(Boolean)) {
      // 템플릿 식(Nunjucks {{ }}, JS ${ }) 조각은 실제 클래스 이름이 아니다
      if (!/^[a-z][a-z0-9_-]*$/.test(cls)) continue
      const block = cls.split(/__|--/)[0]
      if (EXEMPT_BLOCK_PREFIXES.some(p => block.startsWith(p))) continue
      if (archetypes.has(cls) || local.has(cls)) continue
      const key = `${lineNum}:${cls}`
      if (reported.has(key)) continue
      reported.add(key)
      // 파일 이름·오기로 지은 블록 — CSS에 그 블록이 없으면 실제 블록 이름을 알려 준다
      const aliasTarget = BLOCK_ALIASES.get(block)
      const aliasApplies = aliasTarget && !CSS_INDEX.blocks.has(block) && (/__|--/.test(cls) || block.includes('-'))
      if (aliasApplies) {
        error(rel(filePath), lineNum, `[R-29] CSS에 없는 블록 "${cls}". 이 컴포넌트의 블록은 ${aliasTarget.map(b => `.${b}`).join(' · ')}다(references/class-naming.md 파일↔블록 대응).`, cls, 'R-29')
        continue
      }
      if (!/__|--/.test(cls)) continue
      if (DEPRECATED_CLASSES.has(cls)) {
        warn(rel(filePath), lineNum, `[R-18] 폐기 예정 modifier "${cls}" — ${DEPRECATED_CLASSES.get(cls)}로 바꾼다.`, cls, 'R-18')
        continue
      }
      const stateWord = cls.includes('--') ? cls.split('--').pop().split('-').pop() : null
      const needed = stateWord && STATE_MODIFIER_ATTRS[stateWord]
      if (needed && tagText && !needed.some(attr => new RegExp(`\\s${attr}(\\s|=|>|/)`).test(tagText))) {
        warn(rel(filePath), lineNum, `[R-17] 상태 modifier "${cls}"에 대응 속성(${needed.join(' / ')})이 없다. 상태는 속성으로 먼저 알린다 — 클래스만으로는 색으로만 보인다.`, cls, 'R-17')
      }
      if (!CSS_INDEX.blocks.has(block) || CSS_INDEX.classes.has(cls)) continue
      if (cls.includes('--')) {
        error(rel(filePath), lineNum, `[R-29] CSS에 없는 modifier "${cls}". 카탈로그 CSS에 정의된 변형만 쓴다 — 없는 변형을 지어내지 않는다. 필요하면 contracts/class-naming.json 어휘로 CSS부터 정의한다.`, cls, 'R-29')
      } else {
        warn(rel(filePath), lineNum, `[R-29] CSS에 없는 element "${cls}". 스타일이 필요 없는 구조 요소에는 클래스를 달지 않고, 필요하면 컴포넌트 CSS에 정의한다.`, cls, 'R-29')
      }
    }
  }
}

function checkHtml(html, filePath, baseLineNum = 1) {
  const lines = html.split('\n')
  const root = parseHtmlTree(html)

  checkPageContract(html, filePath, baseLineNum)
  // R-30 실제 목적지 없는 링크 — 스니펫·플레이그라운드·문서 예시까지 모든 마크업
  if (PAGE_RULES) {
    // R-33 자동 전환 정지·자동 재생 영상·marquee도 모든 마크업
    // R-47 개인정보 수집 폼(고지·미리 체크·주민등록번호)도 모든 마크업
    for (const f of [...PAGE_RULES.deadLinkFindings(html), ...PAGE_RULES.motionFindings(html), ...PAGE_RULES.privacyFormFindings(html), ...PAGE_RULES.langFindings(html, { docs: /^\/site\//.test(relPosix(filePath)) })]) {
      const report = f.severity === 'error' ? error : warn
      report(rel(filePath), baseLineNum + f.line - 1, `[${f.rule}] ${f.message}`, f.code, f.rule)
    }
  }
  // 이름의 질(R-09 alt·R-30 링크 이름·R-50 placeholder) — 스니펫·플레이그라운드·납품 페이지만.
  // 문서(site·references·prompts)는 ❌ 반례를 DO 예시와 같은 블록에 싣는다
  if (QUALITY && !/^\/(?:site|references|prompts)\//.test(relPosix(filePath))) {
    for (const f of [...QUALITY.altFindings(html), ...QUALITY.linkNameFindings(html), ...QUALITY.placeholderFindings(html)]) {
      const report = f.severity === 'error' ? error : warn
      report(rel(filePath), baseLineNum + f.line - 1, `[${f.rule}] ${f.message}`, f.code, f.rule)
    }
  }
  // 아이콘 사용처(R-27) — 이름·스프라이트·aria-hidden은 모든 마크업, 직접 그린 svg 경고는 문서·아이콘 시연 밖
  if (ICONS) {
    const docs = /^\/(?:site|references|prompts)\//.test(relPosix(filePath)) || /\/src\/playground\/icon\.html$/.test(relPosix(filePath))
    for (const f of ICONS.iconFindings(html, ICON_CATALOG, { inlineSvg: !docs })) {
      const report = f.severity === 'error' ? error : warn
      report(rel(filePath), baseLineNum + f.line - 1, `[${f.rule}] ${f.message}`, f.code, f.rule)
    }
  }
  checkHtmlLang(html, filePath, baseLineNum)
  checkViewportZoom(html, filePath, baseLineNum)
  checkClassExistence(html, filePath, baseLineNum)
  checkFormLabels(root, filePath, baseLineNum)
  checkTabPattern(root, filePath, baseLineNum)
  checkAccordionPattern(root, filePath, baseLineNum)
  checkDisclosureNavPattern(root, filePath, baseLineNum)
  checkSectionRhythm(root, filePath, baseLineNum)

  // R-17: 비-BEM 상태 클래스
  lines.forEach((line, idx) => {
    NON_BEM_STATE_CLASS.lastIndex = 0
    let m
    while ((m = NON_BEM_STATE_CLASS.exec(line)) !== null) {
      const lineNum = baseLineNum + idx
      const stateName = m[1]
      error(
        rel(filePath),
        lineNum,
        `[R-17] 비-BEM 상태 클래스 "${stateName}-*" 발견. 상태는 ARIA·hidden 속성(aria-expanded, aria-current, aria-selected, hidden, disabled)으로 표현하고, ARIA로 표현할 수 없을 때만 BEM modifier(예: --done)를 쓰세요.`,
        line.trim().slice(0, 120),
        'R-17'
      )
    }
  })

  // R-18: 시각적 단어 modifier — modifier를 조각으로 나눠 금지어가 하나라도 있으면 오류
  lines.forEach((line, idx) => {
    MODIFIER_TOKEN_RE.lastIndex = 0
    let m
    while ((m = MODIFIER_TOKEN_RE.exec(line)) !== null) {
      const lineNum = baseLineNum + idx
      const block = m[1]
      const modifier = m[2]
      const word = forbiddenSegment(modifier)
      if (!word) continue
      if (EXEMPT_BLOCK_PREFIXES.some(p => block.startsWith(p))) continue
      if (ALLOWED_MODIFIER_BY_BLOCK.get(block)?.has(modifier)) continue
      // 폐기 예정 별칭(클래스 전체가 같을 때만)은 checkClassExistence가 대체 이름과 함께 경고한다
      if (DEPRECATED_CLASSES.has(`${block}--${modifier}`)) continue
      error(
        rel(filePath),
        lineNum,
        `[R-18] 시각적 단어 modifier "${block}--${modifier}" 발견("${word}"). 허용 어휘(contracts/class-naming.json)에서 의미로 짓는다 (예: --primary, --large, --info, --neutral).`,
        line.trim().slice(0, 120),
        'R-18'
      )
    }
  })

  // R-15 + R-16: 컴포넌트별 root 태그 + ARIA 검증
  for (const [blockName, mapping] of Object.entries(COMPONENT_ROOT_MAPPING)) {
    const matches = findClassUsage(html, blockName)
    for (const match of matches) {
      // class를 토큰으로 쪼개 정확히 비교한다. 부분 문자열로 보면 다른 블록의 modifier가
      // 걸린다 — icon-font--calendar가 calendar 컴포넌트로 잡혔다(2026-08-23).
      // element('__')나 다른 블록의 modifier는 root가 아니므로 자연히 빠진다.
      const classAttr = match.fullMatch.match(/class\s*=\s*["']([^"']*)["']/)
      const tokens = classAttr ? classAttr[1].trim().split(/\s+/) : []
      const isBlockRoot = tokens.some((t) => t === blockName || t.startsWith(`${blockName}--`))
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
  /\/site\/testing\//, // 테스트 가이드 — 확대 차단 viewport 등 "DON'T" 예시 포함
  /\/references\/forbidden-patterns\.md$/, // 금지 패턴 사전 — ❌ 예시가 본문
  /\/references\/accessibility\.md$/, // 접근성 기준 — "Don't" 예시·조각 마크업 포함
  /\/src\/playground\/index\.html$/ // 색상/토큰 스케일 데모 — pg__swatch-color--gray-* 의도적 사용
]

function isSkipped(filePath) {
  return SKIP_PATTERNS.some(re => re.test(relPosix(filePath)))
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
    // 명시적 인자(lint-staged 등)도 SKIP_PATTERNS를 적용한다.
    // 규칙 문서(site/conventions 등)는 의도된 ❌ 금지 예시를 포함하므로 walk 모드와 동일하게 제외한다.
    return TARGET_FILES.map(f => path.resolve(f)).filter(f => !isSkipped(f))
  }
  const files = []
  walk(SNIPPETS_DIR, ['.md'], files)
  walk(PLAYGROUND_DIR, ['.html'], files)
  walk(SITE_DIR, ['.md', '.njk', '.html'], files)
  walk(REFERENCES_DIR, ['.md'], files)
  walk(PROMPTS_DIR, ['.md'], files)
  for (const page of PAGE_SCOPE.files) {
    if (!files.includes(page) && !isSkipped(page)) files.push(page)
  }
  return files
}

// ─── 메인 ─────────────────────────────────────────────────

function main() {
  const files = getTargetFiles()
  const checkedPages = files.filter(f => PAGE_FILES.has(f)).length
  const pageNote = checkedPages > 0 ? ` (납품 페이지 ${checkedPages}개 포함)` : ''
  console.log(`${DIM}HTML 구조 검사 시작 — ${files.length}개 파일${pageNote}${RESET}`)
  for (const problem of PAGE_SCOPE.problems) error('infoux.json', null, problem, null, 'HX-06')
  for (const notice of PAGE_SCOPE.notices) warn('infoux.json', null, notice, null, 'HX-06')

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
