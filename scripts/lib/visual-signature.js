// 시각 서명 규칙 — AI 슬롭의 겉모양을 기계로 막는다 (안티슬롭 명세, 새 번호)
//   R-01 색은 어디에 쓰든 var(--color-*)만 — 선언 값 전체, Tailwind 팔레트·흑백·임의값, style 속성 안까지
//   R-34 장식 효과 금지 — 장식 그라데이션·그라데이션 글자·글래스(backdrop)·큰 블러·컬러 글로우 그림자
//   R-36 이모지를 아이콘·불릿·배지·제목 장식으로 쓰지 않는다
//   R-37 62.5% 루트(1rem=10px)에서 37.5% 작아지는 Tailwind 기본 타입·행간·간격·컨테이너 스케일 금지
//
// check-violations.js가 파일 종류별로 scanCss·scanHtml·scanMarkdown을 부른다. 여기 함수는 파일을 읽지 않는
// 순수 함수라 단위 테스트(__tests__/visual-signature.test.js)가 직접 부른다.
// 결과: { rule, severity: 'error'|'warn', line, message, code }

const RGI_EMOJI = new RegExp('\\p{RGI_Emoji}', 'gv')

// ─── 공통 파싱 ─────────────────────────────────────────

// 줄 번호 — 원문마다 줄 시작 위치 색인을 한 번 만들고 이진 탐색한다(큰 납품 페이지에서 매치마다 앞부분을 다시 세면 제곱 시간이 된다)
const LINE_INDEX_CACHE = new Map()
function lineIndex(src) {
  let idx = LINE_INDEX_CACHE.get(src)
  if (idx) return idx
  idx = [0]
  for (let i = 0; i < src.length; i++) if (src.charCodeAt(i) === 10) idx.push(i + 1)
  if (LINE_INDEX_CACHE.size > 16) LINE_INDEX_CACHE.clear()
  LINE_INDEX_CACHE.set(src, idx)
  return idx
}
function lineAt(src, offset) {
  const idx = lineIndex(src)
  let lo = 0
  let hi = idx.length - 1
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1
    if (idx[mid] <= offset) lo = mid
    else hi = mid - 1
  }
  return lo + 1
}

// 줄 번호가 유지되도록 줄바꿈만 남기고 지운다
const blank = m => m.replace(/[^\n]/g, ' ')
const stripCssComments = css => css.replace(/\/\*[\s\S]*?\*\//g, blank)
// HTML 주석·Nunjucks 주석({# #})
const stripHtmlComments = html => html.replace(/<!--[\s\S]*?-->|\{#[\s\S]*?#\}/g, blank)

// CSS를 ; 또는 } 로 끝나는 문장으로 나눈다(괄호·대괄호·따옴표 안은 무시, { 앞 프렐류드는 버린다)
function parseStatements(css) {
  const out = []
  let start = 0
  let paren = 0
  let bracket = 0
  let quote = null
  for (let i = 0; i < css.length; i++) {
    const c = css[i]
    if (quote) {
      if (c === '\\') { i++; continue }
      if (c === quote) quote = null
      continue
    }
    if (c === '"' || c === "'") { quote = c; continue }
    if (c === '(') { paren++; continue }
    if (c === ')') { paren = Math.max(0, paren - 1); continue }
    if (c === '[') { bracket++; continue }
    if (c === ']') { bracket = Math.max(0, bracket - 1); continue }
    if (paren || bracket) continue
    if (c === '{') { start = i + 1; continue }
    if (c === ';' || c === '}') {
      const text = css.slice(start, i)
      if (text.trim()) out.push({ text, offset: start + (text.length - text.trimStart().length) })
      start = i + 1
    }
  }
  const tail = css.slice(start)
  if (tail.trim()) out.push({ text: tail, offset: start + (tail.length - tail.trimStart().length) })
  return out
}

// 최상위 구분자로 나눈다(괄호 안은 그대로)
function splitTopLevel(value, sep = ',') {
  const parts = []
  let depth = 0
  let quote = null
  let cur = ''
  for (const c of value) {
    if (quote) { cur += c; if (c === quote) quote = null; continue }
    if (c === '"' || c === "'") { quote = c; cur += c; continue }
    if (c === '(' || c === '[') depth++
    if (c === ')' || c === ']') depth = Math.max(0, depth - 1)
    if (c === sep && depth === 0) { parts.push(cur); cur = ''; continue }
    cur += c
  }
  parts.push(cur)
  return parts.map(p => p.trim()).filter(Boolean)
}

// 변형 접두(hover:·pc:·[&>li]:)와 !를 뗀 유틸 본체. 음수 부호는 neg로 따로 돌려준다
function baseOfToken(token) {
  let depth = 0
  let last = 0
  for (let i = 0; i < token.length; i++) {
    const c = token[i]
    if (c === '[' || c === '(') depth++
    else if (c === ']' || c === ')') depth--
    else if (c === ':' && depth === 0) last = i + 1
  }
  let base = token.slice(last).replace(/^!/, '').replace(/!$/, '')
  const neg = base.startsWith('-')
  if (neg) base = base.slice(1)
  return { base, neg }
}

const MODIFIER_RE = /^\/(?:\d+(?:\.\d+)?|\[[^\]]*\]|\([^)]*\))$/
const TYPE_HINT_RE = /^(color|length|percentage|number|url|image|position|size|line-width|family-name|absolute-size|relative-size|shadow|bg-size|vector):/

// 'prefix-[값]' 또는 'prefix-[값]/투명도' — 대괄호 깊이를 세어 값을 정확히 자른다.
// 밑줄→공백(url() 안 밑줄은 그대로), 타입 힌트(color: 등)는 hint로 따로 돌려준다
function arbitraryValue(base) {
  const m = base.match(/^([a-z][\w-]*?)-\[/)
  if (!m) return null
  let depth = 0
  let i = m[0].length - 1
  for (; i < base.length; i++) {
    if (base[i] === '[') depth++
    else if (base[i] === ']') { depth--; if (depth === 0) break }
  }
  if (depth !== 0) return null
  const rest = base.slice(i + 1)
  if (rest && !MODIFIER_RE.test(rest)) return null
  let inner = base.slice(m[0].length, i)
  const urls = []
  inner = inner.replace(/url\([^)]*\)/g, u => { urls.push(u); return `@@URL${urls.length - 1}@@` })
  inner = inner.replace(/_/g, ' ').replace(/@@URL(\d+)@@/g, (_, n) => urls[n])
  const hint = inner.match(TYPE_HINT_RE)?.[1] || null
  return { prefix: m[1], value: hint ? inner.slice(hint.length + 1) : inner, hint }
}

// '[속성:값]' 임의 속성 → 선언
function arbitraryProperty(base) {
  const m = base.match(/^\[([a-z-][\w-]*):(.*)\]$/i)
  if (!m) return null
  return { prop: m[1].toLowerCase(), value: m[2].replace(/_/g, ' ') }
}

// ─── 색 판정 (R-01) ─────────────────────────────────────

const NAMED_COLORS = ('aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan darkgoldenrod darkgray darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite gold goldenrod gray green greenyellow grey honeydew hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue lightslategray lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream mistyrose moccasin navajowhite navy oldlace olive olivedrab orange orangered orchid palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru pink plum powderblue purple rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown seagreen seashell sienna silver skyblue slateblue slategray slategrey snow springgreen steelblue tan teal thistle tomato turquoise violet wheat white whitesmoke yellow yellowgreen').split(' ')
// 시스템 색(CanvasText 등)은 forced-colors 대응에 정당하게 쓰므로 이름 색에 넣지 않는다
const NAMED_RE = new RegExp(`(?:^|[^\\w-])(${NAMED_COLORS.join('|')})(?![\\w-])`, 'i')
const COLOR_PROP = /^(?:color|background(?:-color|-image)?|border(?:-(?:top|right|bottom|left|block|inline)(?:-(?:start|end))?)?(?:-color)?|outline(?:-color)?|box-shadow|text-shadow|fill|stroke|caret-color|accent-color|text-decoration(?:-color)?|column-rule(?:-color)?|scrollbar-color|-webkit-text-fill-color|stop-color|flood-color|lighting-color|text-emphasis(?:-color)?)$/i
const HEX_RE = /(?:^|[^\w&#-])#([0-9a-f]{3,8})(?![\w-])/gi
const COLOR_FN_RE = /(?:^|[^\w-])(rgba?|hsla?|oklch|oklab|lab|lch|hwb|color)\s*\(/gi
const KRDS_ALPHA_SHADOW = new Set(['#0000000d', '#00000014', '#0000001f'])
const TW_PALETTE = 'slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose'
const COLOR_UTIL_PREFIX = 'bg|text|border(?:-[trblxyse])?|ring|ring-offset|inset-ring|divide|from|via|to|shadow|inset-shadow|drop-shadow|text-shadow|fill|stroke|outline|decoration|accent|caret|placeholder'
const MOD = '(?:/(?:\\d+(?:\\.\\d+)?|\\[[^\\]]*\\]|\\([^)]*\\)))?'
const TW_PALETTE_RE = new RegExp(`^(${COLOR_UTIL_PREFIX})-(${TW_PALETTE})-(\\d{2,3})${MOD}$`)
const TW_BW_RE = new RegExp(`^(${COLOR_UTIL_PREFIX})-(white|black)${MOD}$`)

// var(--x)를 지우고 var(--x, 폴백)은 폴백만 남긴다(폴백의 raw 색도 검사 대상이다)
function replaceVars(value) {
  let out = ''
  let i = 0
  while (i < value.length) {
    const at = value.indexOf('var(', i)
    if (at === -1) { out += value.slice(i); break }
    out += value.slice(i, at)
    let depth = 0
    let j = at + 3
    let comma = -1
    for (; j < value.length; j++) {
      const c = value[j]
      if (c === '(') depth++
      else if (c === ')') { depth--; if (depth === 0) break }
      else if (c === ',' && depth === 1 && comma === -1) comma = j
    }
    out += comma === -1 ? ' ' : ` ${replaceVars(value.slice(comma + 1, j))} `
    i = j + 1
  }
  return out
}

// 주석·따옴표 문자열·url()·!important를 지우고 var를 정리한 값
function cleanColorValue(value) {
  let v = value.replace(/\/\*[\s\S]*?\*\//g, ' ')
  v = v.replace(/(["'])(?:\\.|(?!\1)[^\\])*\1/g, ' ')
  v = v.replace(/url\((?:[^()]|\([^()]*\))*\)/gi, ' ')
  v = v.replace(/!important/gi, ' ')
  return replaceVars(v)
}

function hexesIn(v) {
  return [...v.matchAll(HEX_RE)].map(m => `#${m[1].toLowerCase()}`).filter(h => [4, 5, 7, 9].includes(h.length))
}

// 선언 하나의 raw 색 목록. allowKrdsShadow: 그림자에서 KRDS 검정 알파 3값만 쓴 경우 통과(한시)
function rawColorsInDecl(prop, value, { allowKrdsShadow = false } = {}) {
  const v = cleanColorValue(value)
  const hexes = hexesIn(v)
  const fns = [...v.matchAll(COLOR_FN_RE)].map(m => `${m[1]}(`)
  const namedMatch = COLOR_PROP.test(prop) ? v.match(NAMED_RE) : null
  const named = namedMatch ? [namedMatch[1]] : []
  if (allowKrdsShadow && hexes.length > 0 && fns.length === 0 && named.length === 0 && hexes.every(h => KRDS_ALPHA_SHADOW.has(h))) return []
  return [...hexes, ...fns, ...named]
}

function colorFindingsForDecl(prop, value) {
  const isShadow = /^(?:box-shadow|--[\w-]*shadow[\w-]*)$/i.test(prop)
  const raw = rawColorsInDecl(prop, value, { allowKrdsShadow: isShadow })
  if (raw.length === 0) return []
  return [{
    rule: 'R-01',
    severity: 'error',
    message: `raw 색 ${[...new Set(raw)].join(', ')} — 색은 var(--color-*) 토큰만 쓴다${isShadow ? '(그림자는 KRDS 검정 알파 #0000000d·#00000014·#0000001f만 한시 허용)' : ''}.`
  }]
}

function colorFindingsForToken(token) {
  const { base } = baseOfToken(token)
  if (!base) return []
  const out = []
  if (TW_PALETTE_RE.test(base)) {
    out.push(`Tailwind 팔레트 유틸 \`${token}\` — 이 프로젝트는 @theme의 Tailwind 팔레트를 비워 CSS가 생성되지 않거나(text-violet-600) KRDS 단계와 명도가 다르다(bg-gray-50=#6d7882). 의미 토큰(bg-[var(--color-bg-subtle)] 등)을 쓴다.`)
  }
  if (TW_BW_RE.test(base)) out.push(`흑백 유틸 \`${token}\` — CSS가 생성되지 않는다. text-[var(--color-text-inverse)]·bg-[var(--color-bg)]처럼 토큰을 쓴다.`)
  const prop = arbitraryProperty(base)
  if (prop) {
    for (const f of colorFindingsForDecl(prop.prop, prop.value)) out.push(`\`${token}\`: ${f.message}`)
  } else {
    const arb = arbitraryValue(base)
    if (arb) {
      const isShadow = /^(?:shadow|inset-shadow|drop-shadow|text-shadow)$/.test(arb.prefix)
      const isColorish = new RegExp(`^(?:${COLOR_UTIL_PREFIX})$`).test(arb.prefix) || arb.hint === 'color'
      const raw = rawColorsInDecl(isColorish ? 'color' : 'x', arb.value, { allowKrdsShadow: isShadow })
      if (raw.length) out.push(`\`${token}\`: raw 색 ${[...new Set(raw)].join(', ')} — 임의값 안에서도 var(--color-*)만 쓴다.`)
    }
  }
  return out.map(message => ({ rule: 'R-01', severity: 'error', message }))
}

// ─── 색 해석 (R-34 보라·무채색 판정용) ───────────────────

function hexToRgb(hex) {
  let h = hex.replace('#', '')
  if (h.length === 3 || h.length === 4) h = h.split('').map(c => c + c).join('')
  const n = parseInt(h.slice(0, 6), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function rgbToHsl([r, g, b]) {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return { h: 0, s: 0, l }
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0)
  else if (max === g) h = (b - r) / d + 2
  else h = (r - g) / d + 4
  return { h: h * 60, s, l }
}

// 토큰 CSS(tokens/build/tokens.css 형태)에서 --color-* → hex 지도(첫 정의 = 라이트 모드)
function buildTokenColorMap(tokensCss) {
  const raw = new Map()
  for (const m of (tokensCss || '').matchAll(/(--color-[a-z0-9-]+)\s*:\s*([^;]+);/gi)) {
    if (!raw.has(m[1])) raw.set(m[1], m[2].trim())
  }
  const resolved = new Map()
  const resolve = (name, seen = new Set()) => {
    if (resolved.has(name)) return resolved.get(name)
    if (seen.has(name)) return null
    seen.add(name)
    const v = raw.get(name)
    if (!v) return null
    const hex = v.match(/^#[0-9a-f]{3,8}$/i)
    const ref = v.match(/^var\(\s*(--color-[a-z0-9-]+)\s*\)$/i)
    const out = hex ? v.toLowerCase() : ref ? resolve(ref[1], seen) : null
    resolved.set(name, out)
    return out
  }
  for (const name of raw.keys()) resolve(name)
  return resolved
}

// ─── 장식 효과 (R-34) ────────────────────────────────────

const GRADIENT_RE = /(repeating-)?(linear|radial|conic)-gradient\(/gi
const VIOLET = { min: 225, max: 300, sat: 0.25 }
const HUE_WORD = /primary|secondary|point|information|info|success|warning|danger|error|accent|brand/
// 이름만으로 무채색이라 볼 수 있는 토큰(실제 색을 못 풀 때만 쓰는 대체 판정)
const ACHROMATIC_NAME = /^--color-(?:gray|grey|alpha-black|alpha-white)(?:-|$)/
const NEUTRAL_SURFACE_NAME = /^--color-(?:bg|surface)(?:-|$)/

function gradientBodies(value) {
  const out = []
  for (const m of value.matchAll(GRADIENT_RE)) {
    let depth = 0
    let j = m.index + m[0].length - 1
    for (; j < value.length; j++) {
      if (value[j] === '(') depth++
      else if (value[j] === ')') { depth--; if (depth === 0) break }
    }
    out.push({ type: m[2].toLowerCase(), body: value.slice(m.index + m[0].length, j) })
  }
  return out
}

// 정지점 색 하나 → { kind, name?, hex? }
function stopColor(text) {
  const t = text.trim()
  const v = t.match(/var\(\s*(--[\w-]+)/i)
  if (v) return { kind: 'token', name: v[1] }
  if (/(?:^|\s)transparent(?:\s|$)/i.test(t)) return { kind: 'transparent' }
  if (/(?:^|\s)currentcolor(?:\s|$)/i.test(t)) return { kind: 'current' }
  const hex = t.match(/#([0-9a-f]{3,8})(?![\w-])/i)
  if (hex) return { kind: 'raw', hex: `#${hex[1].toLowerCase()}` }
  const fn = t.match(/(rgba?|hsla?)\(([^)]*)\)/i)
  if (fn) {
    const nums = fn[2].split(/[\s,/]+/).filter(Boolean).map(parseFloat)
    if (/^rgb/i.test(fn[1]) && nums.length >= 3) {
      const hx = '#' + nums.slice(0, 3).map(n => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0')).join('')
      return { kind: 'raw', hex: hx, alpha: nums[3] }
    }
    if (/^hsl/i.test(fn[1]) && nums.length >= 3) return { kind: 'hsl', h: nums[0], s: nums[1] / 100, alpha: nums[3] }
  }
  const named = t.match(NAMED_RE)
  if (named) return { kind: 'named', name: named[1].toLowerCase() }
  return null
}

function resolvedHsl(stop, tokenColors) {
  if (stop.kind === 'raw') return rgbToHsl(hexToRgb(stop.hex))
  if (stop.kind === 'hsl') return { h: stop.h, s: stop.s }
  if (stop.kind === 'token') {
    const hex = tokenColors?.get(stop.name)
    return hex ? rgbToHsl(hexToRgb(hex)) : null
  }
  return null
}

function isViolet(stop, tokenColors) {
  if (stop.kind === 'palette') return /violet|purple|indigo|fuchsia/.test(stop.name)
  if (stop.kind === 'named') return /violet|purple|indigo|fuchsia|magenta|orchid|plum|lavender|slateblue/.test(stop.name)
  if (stop.kind === 'token' && /violet|purple|indigo|fuchsia/.test(stop.name)) return true
  const hsl = resolvedHsl(stop, tokenColors)
  return !!hsl && hsl.h >= VIOLET.min && hsl.h <= VIOLET.max && hsl.s >= VIOLET.sat
}

// 무채색 — 토큰은 실제 색을 먼저 풀어 채도로 본다. 못 풀 때만 이름(gray·alpha-black·색 이름 없는 bg/surface)
function isAchromatic(stop, tokenColors) {
  const hsl = resolvedHsl(stop, tokenColors)
  if (hsl) return hsl.s < 0.1
  if (stop.kind === 'token') return ACHROMATIC_NAME.test(stop.name) || (NEUTRAL_SURFACE_NAME.test(stop.name) && !HUE_WORD.test(stop.name))
  if (stop.kind === 'palette') return /^(slate|gray|zinc|neutral|stone)$/.test(stop.name)
  if (stop.kind === 'named') return /^(black|white|gray|grey|silver|gainsboro|whitesmoke|dimgray|dimgrey|darkgray|darkgrey|lightgray|lightgrey)$/.test(stop.name)
  return false
}

function isAlphaBlack(stop) {
  return stop.kind === 'token' && /^--color-alpha-black(?:-|$)/.test(stop.name)
}

// 검정 계열(그림자 색으로 허용) — 검정 알파 토큰, #000…, rgb(0 0 0 / a), black
function isBlackish(stop) {
  if (isAlphaBlack(stop)) return true
  if (stop.kind === 'raw') return /^#0{3,6}(?:[0-9a-f]{1,2})?$/.test(stop.hex)
  return stop.kind === 'named' && stop.name === 'black'
}

// 스크림 색 — 검정 계열, 또는 무채색인 바탕·표면 토큰(가로 스크롤 힌트·밝은 스크림)
function isScrimColor(stop, tokenColors) {
  if (isBlackish(stop)) return true
  if (stop.kind === 'token' && NEUTRAL_SURFACE_NAME.test(stop.name)) {
    const hsl = resolvedHsl(stop, tokenColors)
    return hsl ? hsl.s < 0.1 : !HUE_WORD.test(stop.name)
  }
  return false
}

const stopKey = s => s.name || s.hex || (s.kind === 'hsl' ? `hsl${s.h}-${s.s}` : s.kind)

// 정지점 목록 → 판정. gradientType: 'linear'|'radial'|'conic'
function judgeGradient(type, stops, ctx) {
  const colored = stops.filter(s => s && s.kind !== 'transparent' && s.kind !== 'current')
  if (colored.some(s => isViolet(s, ctx.tokenColors))) {
    return { severity: 'error', why: '보라·남색 계열 그라데이션(AP-3) — 등급과 상관없이 쓰지 않는다' }
  }
  const hasTransparent = stops.some(s => s && (s.kind === 'transparent' || s.kind === 'current'))
  const unique = new Set(colored.map(stopKey))
  // 한 색만 이어 칠한 그라데이션(밑줄 애니메이션 등)은 단색 면과 같다
  if (unique.size === 1 && !hasTransparent && !colored.some(s => s.kind === 'unknown')) return null
  if (type === 'linear') {
    // 선형 단색 페이드(투명 → 검정 알파·바탕 한 색), 여러 단계 검정 알파 스크림
    if (colored.length === 0) return null
    if (colored.every(isAlphaBlack)) return null
    if (unique.size === 1 && colored.every(s => isScrimColor(s, ctx.tokenColors))) return null
  }
  if (colored.length > 0 && colored.every(s => isAchromatic(s, ctx.tokenColors))) {
    return { severity: 'warn', why: '무채색 그라데이션 — 스켈레톤 반짝임 같은 기능이 아니면 단색 면을 쓴다' }
  }
  const grade = ctx.grade || 'restrained'
  return grade === 'expressive'
    ? { severity: 'warn', why: '장식 그라데이션 — expressive 등급에서도 단색 면·사진·타이포로 먼저 해결한다' }
    : { severity: 'error', why: `장식 그라데이션 — ${grade} 등급은 단색 면을 쓴다(스크림만 허용)` }
}

function lengthPx(token) {
  const m = token.match(/^(-?\d*\.?\d+)(px|rem|em)?$/)
  if (!m) return null
  const n = parseFloat(m[1])
  return m[2] === 'rem' || m[2] === 'em' ? n * 10 : n
}

// 그림자 하나: 길이 2~4개 + 색. blur>0이고 색이 검정 계열이 아니면 글로우.
// strictColor: 커스텀 속성처럼 그림자인지 모를 때는 색이 분명한 것(raw·이름 색·--color-* 토큰)만 센다
function glowsInShadowValue(value, { strictColor = false } = {}) {
  const found = []
  for (const shadow of splitTopLevel(value)) {
    const parts = splitTopLevel(shadow.replace(/\binset\b/g, ' '), ' ').filter(Boolean)
    const lengths = []
    const colorParts = []
    for (const p of parts) {
      const px = lengthPx(p)
      if (px !== null) lengths.push(px)
      else colorParts.push(p)
    }
    if (lengths.length < 3 || lengths[2] <= 0) continue
    const colorText = colorParts.join(' ')
    if (!colorText) continue
    const stop = stopColor(colorText)
    if (!stop) continue
    if (strictColor && stop.kind === 'token' && !/^--color-/.test(stop.name)) continue
    if (!isBlackish(stop)) found.push(shadow)
  }
  return found
}

const BACKGROUND_PROPS = /^(?:background|background-image|border-image|border-image-source|list-style-image|--[\w-]+)$/

function effectFindingsForDecl(prop, value, ctx) {
  const p = prop.toLowerCase()
  const out = []
  const v = value.replace(/\/\*[\s\S]*?\*\//g, ' ')
  if (BACKGROUND_PROPS.test(p)) {
    for (const g of gradientBodies(v)) {
      const stops = splitTopLevel(g.body).map(stopColor).filter(Boolean)
      const judged = judgeGradient(g.type, stops, ctx)
      if (judged) out.push({ rule: 'R-34', severity: judged.severity, message: judged.why })
    }
  }
  if (/^(?:-webkit-)?background-clip$/.test(p) && /\btext\b/.test(v)) {
    out.push({ rule: 'R-34', severity: 'error', message: '그라데이션 글자(background-clip: text) 금지 — 글자는 토큰 단색으로 쓴다.' })
  }
  if (/^(?:-webkit-)?backdrop-filter$/.test(p) && !/^\s*none\s*$/i.test(v)) {
    out.push({ rule: 'R-34', severity: 'error', message: '글래스(backdrop-filter) 금지 — KRDS에 없는 효과다. 불투명한 토큰 면(var(--color-surface))을 쓴다.' })
  }
  if (p === 'filter') {
    for (const m of v.matchAll(/blur\(\s*([^)]+)\)/gi)) {
      const px = lengthPx(m[1].trim())
      if (px !== null && px >= 4) out.push({ rule: 'R-34', severity: 'error', message: `큰 블러 blur(${m[1].trim()}) 금지 — 장식 블롭·흐린 배경을 만들지 않는다.` })
    }
  }
  const shadowSources = []
  if (/^(?:box-shadow|text-shadow)$/.test(p)) shadowSources.push({ src: v })
  if (p === 'filter') for (const m of v.matchAll(/drop-shadow\(((?:[^()]|\([^()]*\))*)\)/gi)) shadowSources.push({ src: m[1] })
  // --glow: 0 0 4rem var(--color-primary-40) — 그림자 모양 커스텀 속성(이름이 그림자류가 아니면 색이 분명할 때만)
  if (/^--/.test(p) && /\d/.test(v) && !/gradient\(/i.test(v)) shadowSources.push({ src: v, strictColor: !/shadow|glow|elevation|ring/i.test(p) })
  for (const { src, strictColor } of shadowSources) {
    for (const glow of glowsInShadowValue(src, { strictColor })) {
      out.push({ rule: 'R-34', severity: 'error', message: `컬러 글로우 그림자 \`${glow}\` 금지 — 그림자는 검정 알파(KRDS 3단계)만 쓴다.` })
    }
  }
  return out
}

const GRADIENT_CLASS = /^bg-(?:gradient-to-[a-z]+|linear-.+|radial(?:-.+)?|conic(?:-.+)?)$/
const STOP_CLASS = /^(from|via|to)-(.+)$/
const BLUR_CLASS = /^blur(?:-(xs|sm|md|lg|xl|2xl|3xl))?$/
const SHADOW_SIZE = /^(?:2xs|xs|sm|md|lg|xl|2xl|inner|none)$/
const HAS_COLOR_STOP = /var\(\s*--|#[0-9a-f]{3,8}(?![\w-])|\b(?:rgba?|hsla?|oklch|oklab|lab|lch|hwb|color)\(|(?:^|[\s,])(?:transparent|currentcolor)(?:[\s,]|$)/i

// from-/via-/to- 뒤 → 정지점. 위치 유틸(from-10%)은 null, 해석 못 하는 색은 unknown(색이 있는 것으로 센다)
function stopFromClass(rest) {
  if (/^\d+(?:\.\d+)?%$/.test(rest) || /^\[\d[^\]]*%\]$/.test(rest)) return null
  const r = rest.replace(/\/(?:\d+(?:\.\d+)?|\[[^\]]*\]|\([^)]*\))$/, '') // 투명도 수식어
  if (r === 'transparent') return { kind: 'transparent' }
  if (r === 'current') return { kind: 'current' }
  if (r === 'white' || r === 'black') return { kind: 'named', name: r }
  const pal = r.match(new RegExp(`^(${TW_PALETTE})-\\d{2,3}$`))
  if (pal) return { kind: 'palette', name: pal[1] }
  const v4var = r.match(/^\((?:color:)?(--[\w-]+)\)$/)
  if (v4var) return { kind: 'token', name: v4var[1] }
  const arb = r.match(/^\[(.*)\]$/)
  if (arb) return stopColor(arb[1].replace(/_/g, ' ')) || { kind: 'unknown' }
  const tok = r.match(/^([a-z][\w-]*)$/)
  return tok ? { kind: 'token', name: `--color-${tok[1]}` } : { kind: 'unknown' }
}

// 한 요소(class 속성) 또는 한 @apply의 토큰 묶음
function effectFindingsForTokens(tokens, ctx) {
  const bases = tokens.map(t => ({ token: t, base: baseOfToken(t).base }))
  const out = []
  const gradientToken = bases.find(b => GRADIENT_CLASS.test(b.base))
  if (gradientToken) {
    const g = gradientToken.base
    const type = /radial/.test(g) ? 'radial' : /conic/.test(g) ? 'conic' : 'linear'
    const arb = arbitraryValue(g)
    if (arb && /^bg-(?:linear|radial|conic)$/.test(arb.prefix) && HAS_COLOR_STOP.test(arb.value)) {
      // bg-linear-[to_right,var(--a),var(--b)] — 대괄호 안이 정지점 목록이다
      for (const f of effectFindingsForDecl('background-image', `${type}-gradient(${arb.value})`, ctx)) out.push({ ...f, message: `${f.message} (${gradientToken.token})` })
    } else {
      const stops = bases.map(b => b.base.match(STOP_CLASS)).filter(Boolean).map(m => stopFromClass(m[2])).filter(Boolean)
      const judged = judgeGradient(type, stops, ctx)
      if (judged) out.push({ rule: 'R-34', severity: judged.severity, message: `${judged.why} (${gradientToken.token})` })
    }
  }
  for (const { token, base } of bases) {
    if (base === 'bg-clip-text') out.push({ rule: 'R-34', severity: 'error', message: `그라데이션 글자 \`${token}\` 금지.` })
    if (/^backdrop-/.test(base) && !/-none$/.test(base)) out.push({ rule: 'R-34', severity: 'error', message: `글래스 \`${token}\` 금지 — KRDS에 없는 효과다.` })
    if (BLUR_CLASS.test(base)) out.push({ rule: 'R-34', severity: 'error', message: `큰 블러 \`${token}\` 금지.` })
    const arbBlur = base.match(/^blur-\[(.+)\]$/)
    if (arbBlur) {
      const px = lengthPx(arbBlur[1])
      if (px !== null && px >= 4) out.push({ rule: 'R-34', severity: 'error', message: `큰 블러 \`${token}\` 금지.` })
    }
    const arb = arbitraryValue(base)
    // bg-[linear-gradient(…)]·bg-[image:radial-gradient(…)] — 임의값 그라데이션
    if (arb && arb.prefix === 'bg' && /gradient\(/i.test(arb.value)) {
      for (const f of effectFindingsForDecl('background-image', arb.value, ctx)) out.push({ ...f, message: `\`${token}\`: ${f.message}` })
    }
    if (arb && /^(?:shadow|inset-shadow|drop-shadow|text-shadow)$/.test(arb.prefix)) {
      const colorOnly = arb.hint === 'color' || (!/\d/.test(arb.value.replace(/var\([^)]*\)/g, '')) && stopColor(arb.value))
      if (colorOnly) {
        const stop = stopColor(arb.value)
        if (stop && !isBlackish(stop) && stop.kind !== 'transparent') out.push({ rule: 'R-34', severity: 'error', message: `컬러 그림자 \`${token}\` 금지 — 그림자는 검정 알파만 쓴다.` })
      } else {
        for (const glow of glowsInShadowValue(arb.value)) out.push({ rule: 'R-34', severity: 'error', message: `컬러 글로우 그림자 \`${token}\`(${glow}) 금지.` })
      }
    }
    const shadowColor = base.match(/^(?:shadow|drop-shadow|inset-shadow|text-shadow)-([a-z][\w-]*)(?:\/\S+)?$/)
    if (shadowColor && !SHADOW_SIZE.test(shadowColor[1]) && !/^(black|transparent|alpha-black)/.test(shadowColor[1])) {
      out.push({ rule: 'R-34', severity: 'error', message: `컬러 그림자 \`${token}\` 금지 — 그림자는 검정 알파만 쓴다.` })
    }
    const prop = arbitraryProperty(base)
    if (prop) for (const f of effectFindingsForDecl(prop.prop, prop.value, ctx)) out.push({ ...f, message: `\`${token}\`: ${f.message}` })
  }
  return out
}

// ─── Tailwind 기본 스케일 (R-37) ─────────────────────────

const TEXT_SIZES = { xs: 0.75, sm: 0.875, base: 1, lg: 1.125, xl: 1.25, '2xl': 1.5, '3xl': 1.875, '4xl': 2.25, '5xl': 3, '6xl': 3.75, '7xl': 4.5, '8xl': 6, '9xl': 8 }
const CONTAINERS = { '3xs': 16, '2xs': 18, xs: 20, sm: 24, md: 28, lg: 32, xl: 36, '2xl': 42, '3xl': 48, '4xl': 56, '5xl': 64, '6xl': 72, '7xl': 80 }
const SPACING_PREFIX = [
  'p', 'px', 'py', 'pt', 'pr', 'pb', 'pl', 'ps', 'pe', 'pbs', 'pbe',
  'm', 'mx', 'my', 'mt', 'mr', 'mb', 'ml', 'ms', 'me', 'mbs', 'mbe',
  'gap', 'gap-x', 'gap-y', 'space-x', 'space-y',
  'w', 'h', 'min-w', 'min-h', 'max-w', 'max-h', 'size',
  'inline', 'min-inline', 'max-inline', 'block', 'min-block', 'max-block',
  'inset', 'inset-x', 'inset-y', 'inset-s', 'inset-e', 'inset-bs', 'inset-be',
  'top', 'right', 'bottom', 'left', 'start', 'end',
  'translate', 'translate-x', 'translate-y', 'translate-z',
  'scroll-m', 'scroll-mx', 'scroll-my', 'scroll-mt', 'scroll-mr', 'scroll-mb', 'scroll-ml', 'scroll-ms', 'scroll-me', 'scroll-mbs', 'scroll-mbe',
  'scroll-p', 'scroll-px', 'scroll-py', 'scroll-pt', 'scroll-pr', 'scroll-pb', 'scroll-pl', 'scroll-ps', 'scroll-pe', 'scroll-pbs', 'scroll-pbe',
  'indent', 'basis', 'border-spacing', 'border-spacing-x', 'border-spacing-y'
].join('|')
const SCALE_TEXT_RE = /^text-(xs|sm|base|lg|xl|[2-9]xl)(?:\/\S+)?$/
const SCALE_TEXT_LH_RE = /^text-(?:\[[^\]]*\]|\([^)]*\)|[a-z][\w-]*)\/(\d+(?:\.\d+)?)$/
const SCALE_LEADING_RE = /^leading-(\d+(?:\.\d+)?)$/
const SCALE_SPACING_RE = new RegExp(`^(${SPACING_PREFIX})-(0\\.(?:25|5|75)|[1-9]\\d*(?:\\.(?:25|5|75))?)$`)
const SCALE_CONTAINER_RE = /^(w|min-w|max-w|inline|min-inline|max-inline|basis|columns)-(3xs|2xs|xs|sm|md|lg|xl|[2-7]xl)$/

const px = n => `${+(n * 10).toFixed(2)}px`

function scaleFindingsForToken(token) {
  const { base } = baseOfToken(token)
  let message = null
  let m
  if ((m = base.match(SCALE_TEXT_RE))) {
    const rem = TEXT_SIZES[m[1]]
    message = `\`${token}\`는 ${rem}rem = ${px(rem)}로 렌더된다(62.5% 루트). 글자 크기는 text-[1.7rem]처럼 rem 임의값으로 쓴다.`
  } else if ((m = base.match(SCALE_TEXT_LH_RE))) {
    const rem = parseFloat(m[1]) * 0.25
    message = `\`${token}\`의 /${m[1]}은 행간 ${rem}rem = ${px(rem)} 고정값이다. 행간은 leading-[1.6]처럼 비율로 쓴다.`
  } else if ((m = base.match(SCALE_LEADING_RE))) {
    const rem = parseFloat(m[1]) * 0.25
    message = `\`${token}\`는 행간 ${rem}rem = ${px(rem)} 고정값이다. 행간은 leading-[1.6]처럼 비율로 쓴다.`
  } else if ((m = base.match(SCALE_SPACING_RE))) {
    const rem = parseFloat(m[2]) * 0.25
    message = `\`${token}\`는 ${rem}rem = ${px(rem)}로 렌더된다(62.5% 루트, Tailwind 기본의 62.5%). ${px(rem * 1.6)}를 의도했다면 ${m[1]}-[${+(rem * 1.6).toFixed(2)}rem]처럼 rem 임의값으로 쓴다(KRDS gap-3=8px → gap-[0.8rem]).`
  } else if ((m = base.match(SCALE_CONTAINER_RE))) {
    const rem = CONTAINERS[m[2]]
    message = `\`${token}\`는 ${rem}rem = ${px(rem)}로 렌더된다(62.5% 루트). 폭은 ${m[1]}-[${+(rem * 1.6).toFixed(1)}rem]처럼 rem 임의값이나 .container를 쓴다.`
  }
  return message ? [{ rule: 'R-37', severity: 'error', message }] : []
}

// 행간 하한(R-24) — 이름 행간 중 1.5 미만(leading-tight 1.25, leading-snug 1.375)
function leadingFloorFindingsForToken(token) {
  const { base } = baseOfToken(token)
  const m = base.match(/^leading-(tight|snug)$/)
  if (!m) return []
  return [{ rule: 'R-24', severity: 'warn', message: `\`${token}\`(${m[1] === 'tight' ? '1.25' : '1.375'})는 한글 조판 하한 1.5 미만이다. 제목은 leading-[1.5], 본문은 leading-[1.6]~[1.7].` }]
}

// ─── 이모지 (R-36) ──────────────────────────────────────

const safeCodePoint = n => (Number.isFinite(n) && n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : '\uFFFD')
const NAMED_ENTITIES = { rarr: '→', larr: '←', raquo: '»', laquo: '«', rsaquo: '›', lsaquo: '‹', rArr: '⇒', amp: '&', nbsp: ' ', quot: '"', apos: "'", lt: '<', gt: '>' }

function decodeHtmlEntities(s) {
  return s
    .replace(/&#x([0-9a-f]+);?/gi, (_, h) => safeCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);?/g, (_, d) => safeCodePoint(parseInt(d, 10)))
    .replace(/&([a-zA-Z]+);/g, (whole, name) => NAMED_ENTITIES[name] ?? whole)
}

function decodeCssEscapes(s) {
  return s.replace(/\\([0-9a-f]{1,6})\s?/gi, (_, h) => safeCodePoint(parseInt(h, 16)))
}

function emojisIn(text) {
  return [...decodeHtmlEntities(text).matchAll(RGI_EMOJI)].map(m => m[0])
}

function onlyEmoji(text) {
  const t = decodeHtmlEntities(text).replace(RGI_EMOJI, '').replace(/[\s\uFE0F\u200D]/g, '')
  return t === '' && emojisIn(text).length > 0
}

function emojiFindingsForContent(value) {
  const strings = [...value.matchAll(/(["'])((?:\\.|(?!\1)[^\\])*)\1/g)].map(m => decodeCssEscapes(m[2]))
  const found = strings.flatMap(emojisIn)
  return found.length ? [{ rule: 'R-36', severity: 'error', message: `CSS content의 이모지 ${found.join(' ')} — 장식 기호는 아이콘 카탈로그(R-27)에서 가져온다.` }] : []
}

const ERROR_ANCESTORS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'button', 'a', 'label', 'summary', 'th', 'li', 'legend', 'caption', 'dt', 'option'])
const SKIP_TEXT = new Set(['code', 'pre', 'kbd', 'samp', 'textarea', 'script', 'style', 'template'])
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr'])
// 꼬리 화살표 — ‹ ›는 페이지네이션 이전·다음 버튼(aria-label 동반)의 정본 표기라 넣지 않는다
const TRAILING_ARROW = /(?:→|➜|➔|»|▶)\s*$/

function isErrorPlace(stack) {
  return stack.some(el => ERROR_ANCESTORS.has(el.tag) || el.classes.some(c => /^(?:badge|tag)(?:--|$)/.test(c) || /__(?:title|label|icon)(?:--|$)/.test(c)))
}

// HTML의 텍스트·접근성 속성에서 이모지와 링크·버튼 끝 화살표를 찾는다
function emojiFindingsForHtml(html, baseLine = 0) {
  const out = []
  const stack = []
  const src = stripHtmlComments(html)
  const re = /<(\/?)([a-zA-Z][\w-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>|([^<]+)/g
  let skipUntil = null
  const closeArrowCheck = el => {
    if ((el.tag === 'a' || el.tag === 'button') && TRAILING_ARROW.test(decodeHtmlEntities(el.text || ''))) {
      out.push({ rule: 'R-36', severity: 'warn', line: baseLine + el.line, message: '링크·버튼 끝의 화살표 글자 — 카탈로그 chevron 아이콘 + aria-hidden을 쓴다.', code: (el.text || '').trim().slice(0, 120) })
    }
  }
  for (const m of src.matchAll(re)) {
    const [whole, closing, rawTag, attrs, text] = m
    const line = lineAt(src, m.index)
    if (skipUntil) {
      if (closing && rawTag && rawTag.toLowerCase() === skipUntil) skipUntil = null
      continue
    }
    if (rawTag) {
      const tag = rawTag.toLowerCase()
      if (closing) {
        const idx = stack.map(e => e.tag).lastIndexOf(tag)
        if (idx !== -1) {
          for (let k = stack.length - 1; k >= idx; k--) closeArrowCheck(stack[k])
          stack.length = idx
        }
        continue
      }
      const classMatch = attrs.match(/\bclass\s*=\s*(?:"([^"]*)"|'([^']*)')/)
      const classes = classMatch ? (classMatch[1] ?? classMatch[2]).split(/\s+/).filter(Boolean) : []
      const el = { tag, classes, text: '', line }
      for (const am of attrs.matchAll(/\b(aria-label|title|alt|placeholder)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi)) {
        const found = emojisIn(am[2] ?? am[3])
        if (!found.length) continue
        const attrName = am[1].toLowerCase()
        const severity = attrName === 'alt' ? 'warn' : (isErrorPlace([...stack, el]) ? 'error' : 'warn')
        out.push({ rule: 'R-36', severity, line: baseLine + line, message: `${tag}[${attrName}]의 이모지 ${found.join(' ')} — 이모지를 아이콘·장식으로 쓰지 않는다${attrName === 'alt' ? '(이미지 속 글자를 옮긴 것이면 과업 예외로 기록한다)' : ''}.`, code: whole.slice(0, 120) })
      }
      const selfClosing = /\/\s*$/.test(attrs)
      if (SKIP_TEXT.has(tag) && !selfClosing) { skipUntil = tag; continue }
      if (!VOID.has(tag) && !selfClosing) stack.push(el)
      continue
    }
    if (text) {
      for (const el of stack) if (el.tag === 'a' || el.tag === 'button') el.text += text
      const found = emojisIn(text)
      if (found.length) {
        const severity = onlyEmoji(text) || isErrorPlace(stack) ? 'error' : 'warn'
        out.push({ rule: 'R-36', severity, line: baseLine + line, message: `이모지 ${found.join(' ')} — 아이콘·불릿·배지·제목 장식으로 쓰지 않는다. 아이콘은 카탈로그(R-27)에서 가져와 aria-hidden을 붙인다.`, code: text.trim().slice(0, 120) })
      }
    }
  }
  return out
}

const TABLE_SEPARATOR = /^\s*\|?\s*:?-{3,}:?\s*(?:\|\s*:?-{3,}:?\s*)*\|?\s*$/

// 마크다운 본문(펜스 밖) — 제목·목록·표 머리·링크 글자·이모지만 있는 줄은 error, 그 밖은 warn,
// 이미지 alt는 warn. 연속된 원시 HTML 줄(빈 줄까지)은 한 HTML 블록으로 본다
function emojiFindingsForMarkdownProse(text, startLine) {
  const out = []
  const src = stripHtmlComments(text)
    .replace(/`[^`\n]*`/g, blank)
    .replace(/<(code|kbd|samp)\b[^>]*>[\s\S]*?<\/\1>/gi, blank)
  const lines = src.split('\n')
  let i = 0
  while (i < lines.length) {
    if (/^\s*<[a-zA-Z/]/.test(lines[i])) {
      let j = i
      while (j < lines.length && lines[j].trim() !== '') j++
      out.push(...emojiFindingsForHtml(lines.slice(i, j).join('\n'), startLine + i - 1))
      i = j
      continue
    }
    const raw = lines[i]
    const next = lines[i + 1] || ''
    const line = raw.replace(/^\s*(?:>\s*)+/, '')
    const images = [...line.matchAll(/!\[([^\]]*)\]\([^)]*\)/g)]
    const withoutImages = line.replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    if (images.some(im => emojisIn(im[1]).length)) {
      out.push({ rule: 'R-36', severity: 'warn', line: startLine + i, message: `이미지 대체 텍스트의 이모지 ${images.flatMap(im => emojisIn(im[1])).join(' ')} — 이미지 속 글자 전사가 아니면 빼고, 아이콘은 카탈로그를 쓴다.`, code: line.trim().slice(0, 120) })
    }
    const found = emojisIn(withoutImages)
    if (found.length) {
      const isHeading = /^\s{0,3}#{1,6}\s/.test(line) || /^\s*(?:=+|-+)\s*$/.test(next) && line.trim() !== ''
      const isList = /^\s*(?:[-*+]|\d+[.)])\s/.test(line)
      const isTableHead = TABLE_SEPARATOR.test(next) && /\S/.test(line)
      const linkTexts = [...withoutImages.matchAll(/\[([^\]]*)\](?:\([^)]*\)|\[[^\]]*\])/g)].map(m => m[1])
      const inLink = linkTexts.some(t => emojisIn(t).length)
      const severity = isHeading || isList || isTableHead || inLink || onlyEmoji(withoutImages) ? 'error' : 'warn'
      out.push({ rule: 'R-36', severity, line: startLine + i, message: `이모지 ${found.join(' ')} — 제목·목록·표·링크를 이모지로 꾸미지 않는다.`, code: line.trim().slice(0, 120) })
    }
    i++
  }
  return out
}

// ─── 스캐너 ─────────────────────────────────────────────

const TEMPLATE_FRAGMENT = /\{\{|\}\}|\{%|%\}|\$\{|\{#|#\}/

// CSS 원문 → 결과(줄 번호는 css 기준). ctx: { grade, tokenColors, exemptDecl(prop, value), exemptEffects, emoji }
function scanCss(css, ctx = {}) {
  const out = []
  const clean = stripCssComments(css)
  for (const st of parseStatements(clean)) {
    const t = st.text.trim()
    const line = lineAt(clean, st.offset)
    const code = t.replace(/\s+/g, ' ').slice(0, 160)
    if (/^@apply\b/.test(t)) {
      const tokens = t.replace(/^@apply\s+/, '').split(/\s+/).filter(Boolean)
      for (const tok of tokens) {
        for (const f of [...colorFindingsForToken(tok), ...scaleFindingsForToken(tok), ...leadingFloorFindingsForToken(tok)]) out.push({ ...f, line, code })
        if (ctx.emoji !== false) for (const f of contentEmojiForToken(tok)) out.push({ ...f, line, code })
      }
      if (!ctx.exemptEffects) for (const f of effectFindingsForTokens(tokens, ctx)) out.push({ ...f, line, code })
      continue
    }
    if (t.startsWith('@')) continue
    const m = t.match(/^(--[\w-]+|-?[a-zA-Z][\w-]*)\s*:([\s\S]*)$/)
    if (!m) continue
    const prop = m[1]
    const value = m[2]
    if (ctx.exemptDecl && ctx.exemptDecl(prop, value)) continue
    for (const f of colorFindingsForDecl(prop, value)) out.push({ ...f, line, code })
    if (!ctx.exemptEffects) for (const f of effectFindingsForDecl(prop, value, ctx)) out.push({ ...f, line, code })
    if (ctx.emoji !== false && prop.toLowerCase() === 'content') for (const f of emojiFindingsForContent(value)) out.push({ ...f, line, code })
  }
  return out
}

// content-['…']·[content:"…"] 클래스의 이모지
function contentEmojiForToken(tok) {
  const { base } = baseOfToken(tok)
  const arb = arbitraryValue(base)
  if (arb && arb.prefix === 'content') return emojiFindingsForContent(arb.value)
  const prop = arbitraryProperty(base)
  if (prop && prop.prop === 'content') return emojiFindingsForContent(prop.value)
  return []
}

// class 속성 값의 토큰들 → 결과
function scanClassValue(value, ctx) {
  // 템플릿 식 조각({{ }}·{% %}·${ })만 뺀다 — '%'만으로는 빼지 않는다(color-mix 10%, 그라데이션 정지점 0% 등)
  const tokens = value.split(/\s+/).filter(Boolean).filter(t => !TEMPLATE_FRAGMENT.test(t))
  const out = []
  for (const tok of tokens) {
    out.push(...colorFindingsForToken(tok), ...scaleFindingsForToken(tok), ...leadingFloorFindingsForToken(tok))
    if (ctx.emoji !== false) out.push(...contentEmojiForToken(tok))
  }
  out.push(...effectFindingsForTokens(tokens, ctx))
  return out
}

// HTML 원문 → 결과. ctx.emoji=false면 이모지 검사를 하지 않는다
function scanHtml(html, ctx = {}) {
  const out = []
  const src = stripHtmlComments(html)
  for (const m of src.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) {
    const base = lineAt(src, m.index + m[0].indexOf('>') + 1) - 1
    for (const f of scanCss(m[1], ctx)) out.push({ ...f, line: base + f.line })
  }
  for (const m of src.matchAll(/(?<![\w:-])class\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) {
    const line = lineAt(src, m.index)
    for (const f of scanClassValue(m[1] ?? m[2], ctx)) out.push({ ...f, line, code: m[0].slice(0, 160) })
  }
  for (const m of src.matchAll(/(?<![\w:-])style\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) {
    const line = lineAt(src, m.index)
    for (const st of parseStatements(m[1] ?? m[2])) {
      const dm = st.text.trim().match(/^(--[\w-]+|-?[a-zA-Z][\w-]*)\s*:([\s\S]*)$/)
      if (!dm) continue
      for (const f of [...colorFindingsForDecl(dm[1], dm[2]), ...effectFindingsForDecl(dm[1], dm[2], ctx)]) out.push({ ...f, line, code: m[0].slice(0, 160) })
    }
  }
  if (ctx.emoji !== false) out.push(...emojiFindingsForHtml(html))
  return out
}

// 금지 예시 펜스 — 첫 줄이 주석으로 시작하고 곧바로 반례 표시가 온다(::before·금지어·안티앨리어싱 같은 일반 단어는 아니다)
const COUNTER_FENCE = /^\s*(?:<!--|\/\*|\/\/)\s*(?:❌|✗|금지\s*예|잘못된\s*예|나쁜\s*예|bad\b|don'?t\b|before\s*(?:--|—|–|:))/i
function isCounterFenceStart(firstLine) {
  return COUNTER_FENCE.test(firstLine || '')
}

// 마크다운 → 펜스·본문 조각. 금지 예시 펜스는 counter=true
function splitMarkdown(md) {
  const lines = md.split('\n')
  const segs = []
  let inFence = false
  let lang = ''
  let marker = ''
  let buf = []
  let bufStart = 1
  const flush = (l, end) => { segs.push({ lang: l, text: buf.join('\n'), startLine: bufStart }); buf = []; bufStart = end }
  for (let i = 0; i < lines.length; i++) {
    const L = lines[i]
    const fm = L.match(/^\s*(`{3,}|~{3,})\s*([\w-]*)/)
    if (!inFence && fm) { flush('prose', i + 2); inFence = true; lang = (fm[2] || '').toLowerCase(); marker = fm[1]; continue }
    if (inFence && L.trim().startsWith(marker) && L.trim().replace(/[`~]/g, '') === '') { flush(lang, i + 2); inFence = false; continue }
    buf.push(L)
  }
  flush(inFence ? lang : 'prose', lines.length + 1)
  for (const s of segs) {
    if (s.lang === 'prose') continue
    s.counter = isCounterFenceStart(s.text.split('\n').find(l => l.trim()))
  }
  return segs
}

// 마크다운 → 결과. ctx.prose=false면 본문(펜스 밖)은 보지 않는다(스니펫은 코드 블록만)
function scanMarkdown(md, ctx = {}) {
  const out = []
  for (const seg of splitMarkdown(md)) {
    const shift = f => ({ ...f, line: seg.startLine + (f.line || 1) - 1 })
    if (seg.lang === 'prose') {
      if (ctx.prose === false) continue
      // 본문 속 원시 HTML의 class·style은 본다(인라인 코드는 지운다)
      const raw = seg.text.replace(/`[^`\n]*`/g, blank)
      out.push(...scanHtml(raw, { ...ctx, emoji: false }).map(shift))
      if (ctx.emoji !== false) out.push(...emojiFindingsForMarkdownProse(raw, seg.startLine))
      continue
    }
    if (seg.counter) continue
    if (seg.lang === 'css') out.push(...scanCss(seg.text, ctx).map(shift))
    else if (seg.lang === 'html' || seg.lang === 'njk' || seg.lang === 'nunjucks') out.push(...scanHtml(seg.text, ctx).map(shift))
  }
  return out
}

module.exports = {
  // 스캐너
  scanCss, scanHtml, scanMarkdown, splitMarkdown, isCounterFenceStart,
  // 규칙 단위(테스트용)
  colorFindingsForDecl, colorFindingsForToken, effectFindingsForDecl, effectFindingsForTokens,
  scaleFindingsForToken, leadingFloorFindingsForToken, emojiFindingsForHtml, emojiFindingsForContent, emojiFindingsForMarkdownProse,
  // 도구
  baseOfToken, arbitraryValue, buildTokenColorMap, parseStatements, stripCssComments, rgbToHsl, hexToRgb, emojisIn, lineAt
}
