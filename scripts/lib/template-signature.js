// 템플릿 장식 서명 — R-51 (경고 전용, 오탐 위험 때문에 오류로 올리지 않는다)
//   근거: Impeccable(pbakaus/impeccable, Apache 2.0) craft-floor 금지 목록,
//         Anthropic frontend-design 스킬의 '생성 페이지의 흔한 서명'.
//   (1) 제목 위 분류 표지(eyebrow·kicker) — class 조각에 eyebrow·kicker·pretitle·suptitle(__overline 같은 변형 포함),
//       또는 h2~h3 바로 앞 형제가 20자 이하 짧은 글만 든 p·span이고 class가 __label·__category로 끝날 때
//   (2) 순서가 아닌 장식 번호 — 글이 01~09(뒤에 공백·끝·마침표)로 시작하는 요소,
//       class에 __index·__number·__num이 있고 글이 한두 자리 번호(1·01·12)인 요소.
//       stat__number(1,234건)·contact__number(전화)·input.form__number처럼 번호가 아닌 것은 class만으로 걸지 않는다.
//       ol·li 안, step-indicator·pagination·calendar 블록, 표 칸, time·code·option, 날짜 블록(__date·__day…)은 뺀다
//   (3) 모든 섹션 등장 효과 — main 안 section 3개 이상에 data-reveal·data-aos·data-animate 또는
//       reveal·fade-up·animate-on-scroll class(섹션 자신이나 자손)가 있으면 문서당 1건
//   (4) 링크·버튼 끝 화살표 글리프는 R-36(visual-signature.js)이 이미 경고한다 — 여기서 다시 보지 않는다
//   (5) 색 있는 굵은 옆선 — border-left·border-right(·inline-start·inline-end) 폭 1px 초과 + 색 지정,
//       border-width: 0 0 0 4px 단축(옆만 굵은 것) + 색, box-shadow: inset 4px 0 0 색(번짐 없는 옆 그림자),
//       Tailwind border-l-2~8·border-l-[…]·border-r-*·border-s-*·border-e-*·[border-left:…]·shadow-[inset_4px_0_0_…],
//       style 속성의 같은 선언. 현재 위치 표시(tab·main-menu·side-navigation·breadcrumb…·aria-current·--current),
//       입력 오류 표시(form-field·input·aria-invalid·--error), blockquote, 표 칸 구분선(td·th·table 블록),
//       투명색(border-transparent — 상태에서만 색이 켜지는 자리 잡기), 셰브런 그리기(회전·두 변)는 뺀다
//   (6) 아이콘 타일 바로가기 — 같은 부모 아래 형제 4개 이상이 각각 링크·버튼 하나이고(또는 하나만 갖고),
//       그 첫 요소 자식이 아이콘 하나만 감싼 span·div(배경 상자)이며 뒤에 글 레이블이 오는 구조. 문서당 1건.
//       한국 공공 메인의 전형 조립 서명이다(references/design-intelligence.md §7-1 B). header·footer·메뉴 블록은 뺀다
// 결과: { rule, severity, line, message, code }

const T = require('./html-tree')
const { cssBlocks } = require('./type-floor')

const RULE = 'R-51'
const code = n => (n.src || '').replace(/\s+/g, ' ').slice(0, 120)
const warn = (line, message, c) => ({ rule: RULE, severity: 'warn', line, message, code: c })
const isEl = n => n && n.tag && !n.tag.startsWith('#')
const classTokens = n => T.classesOf(n)
const blockOf = cls => cls.split(/__|--/)[0]

// ─── (1) eyebrow·kicker ─────────────────────────────
// overline은 Tailwind 유틸(text-decoration)과 겹친다 — BEM element·접미(__overline·-overline)일 때만 본다
const EYEBROW_TOKEN = /(?:^|[_-])(?:eyebrow|kicker|pretitle|pre-title|suptitle|supertitle|overtitle)(?:$|[_-])|(?:__|[a-z0-9]-)overline(?:$|[_-])/
const LABEL_TOKEN = /__(?:label|category)$/
const EYEBROW_MAX = 20

// 앞 형제 요소(공백 글은 건너뛰고, 글이 있으면 형제가 아니다)
function prevElementSibling(n) {
  const sibs = n.parent?.children || []
  for (let i = sibs.indexOf(n) - 1; i >= 0; i--) {
    const s = sibs[i]
    if (s.tag === '#text') {
      if (s.rawText || s.text.trim()) return null
      continue
    }
    return s
  }
  return null
}

const onlyText = n => (n.children || []).every(c => c.tag === '#text' || T.INLINE.has(c.tag))

// ─── (2) 장식 번호 ──────────────────────────────────
const DECOR_NUMBER_TEXT = /^0[1-9](?=$|\s+(?!\d)|\.(?!\d))/
const NUMBER_CLASS = /__(?:index|number|num)(?:$|--)/
// class만으로는 번호라고 할 수 없다(통계 수치·전화번호·입력칸) — 글이 한두 자리 번호일 때만 번호로 본다
const SHORT_NUMBER_TEXT = /^0?\d{1,2}$/
// 날짜 배지(일·월을 따로 크게 쓴 05·11)는 순서 번호가 아니다
const DATE_BLOCK = /(?:^|[_-])(?:date|day|days|month|year|time|calendar|schedule|dday|d-day|deadline|period)(?:$|[_-])/
const ORDERED_BLOCK = /^(?:step-indicator|pagination|calendar|table|stepper|progress)$/
const NUMBER_EXEMPT_TAG = new Set(['ol', 'li', 'td', 'th', 'time', 'code', 'pre', 'kbd', 'samp', 'option', 'select', 'textarea', 'script', 'style', 'svg', 'math'])
function inOrderedContext(n) {
  return [n, ...T.ancestors(n)].some(a => NUMBER_EXEMPT_TAG.has(a.tag) || a.foreign || 'datetime' in (a.attrs || {}) ||
    classTokens(a).some(c => ORDERED_BLOCK.test(blockOf(c)) || DATE_BLOCK.test(c)))
}
// 요소가 직접 가진 첫 글(자식 요소 안의 글은 그 요소가 따로 본다)
function leadingOwnText(n) {
  for (const c of n.children || []) {
    if (c.tag === '#text') {
      if (c.rawText) return ''
      if (c.text.trim()) return c.text.trim()
      continue
    }
    return ''
  }
  return ''
}

// ─── (3) 등장 효과 ──────────────────────────────────
const REVEAL_ATTR = ['data-reveal', 'data-aos', 'data-animate']
const REVEAL_CLASS = /^(?:js-)?(?:reveal(?:--[\w-]+)?|fade-up|fade-in-up|animate-on-scroll)$/
const hasReveal = n => REVEAL_ATTR.some(a => a in n.attrs) || classTokens(n).some(c => REVEAL_CLASS.test(c))
function sectionHasReveal(section) {
  return !!T.find(section, x => isEl(x) && hasReveal(x))
}

// ─── (5) 굵은 옆선 ──────────────────────────────────
// 현재 위치·입력 오류를 옆선으로 알리는 블록 — KRDS 탭·메뉴·LNB·브레드크럼·폼 오류
const SIDE_EXEMPT_BLOCK = /^(?:tab|tabs|main-menu|side-navigation|side-menu|side-nav|lnb|gnb|breadcrumb|step-indicator|pagination|form-field|form|input|textarea|select|text-field|table|data-table|calendar)$/
const SIDE_EXEMPT_STATE = /--(?:current|active|selected|error|invalid)\b|aria-(?:current|selected|invalid)|:focus|\[open\]|\[aria-expanded/
const SIDE_EXEMPT_SELECTOR = new RegExp(
  String.raw`(?:^|[\s>+~,(])(?:blockquote|td|th)\b|\.(?:${SIDE_EXEMPT_BLOCK.source.slice(4, -2)})(?=$|[\s.:\[>+~,)]|__|--)`
)
const SIDE_PROPS = /^border-(?:left|right|inline-start|inline-end)$/
const SIDE_WIDTH_PROPS = /^border-(?:left|right|inline-start|inline-end)-width$/
const SIDE_COLOR_PROPS = /^border-(?:(?:left|right|inline-start|inline-end)-)?color$/
const TRANSPARENT = /^(?:transparent|rgba?\([^)]*,\s*0\s*\)|#[0-9a-f]{6}00|#[0-9a-f]{3}0)$/i
const NAMED_WIDTH = { thin: 1, medium: 3, thick: 5 }
const COLOR_WORD = /(?:var\(\s*--color-|#[0-9a-f]{3,8}\b|\b(?:rgb|rgba|hsl|hsla|oklch|oklab|lab|lch|color-mix)\(|\bcurrentcolor\b|\b(?:red|blue|green|orange|purple|yellow|teal|navy|gray|grey|black|white|pink|indigo|violet|cyan|magenta)\b)/i

// 폭 → px(62.5% 루트: 1rem = 10px). 길이가 아니면 null
function widthPx(raw) {
  const v = String(raw).trim().toLowerCase()
  if (v in NAMED_WIDTH) return NAMED_WIDTH[v]
  const m = v.match(/^(\d*\.?\d+)(px|rem|em)$/)
  if (!m) return null
  return m[2] === 'px' ? +m[1] : m[2] === 'rem' ? +m[1] * 10 : +m[1] * 16
}
// 단축 값(4px solid var(--color-primary)) → { px, colored, none }
function parseSideShorthand(value) {
  const v = String(value).replace(/!important/i, '').trim()
  const parts = v.split(/\s+(?![^(]*\))/)
  let px = null
  for (const p of parts) {
    const w = widthPx(p)
    if (w !== null) { px = w; break }
  }
  const none = /\b(?:none|hidden)\b/i.test(v) || /^0(?:px|rem)?$/.test(v)
  return { px, colored: COLOR_WORD.test(v), none }
}

// 길이 → px(부호 포함, 단위 없는 0도 받는다). 길이가 아니면 null
function lenPx(raw) {
  const v = String(raw).trim().toLowerCase()
  if (/^[-+]?0$/.test(v)) return 0
  const w = widthPx(v.replace(/^[-+]/, ''))
  return w === null ? null : v.startsWith('-') ? -w : w
}
// border-width 단축(위 오른쪽 아래 왼쪽) → 옆만 굵은 폭 px. 네 변이 같은 테두리는 옆선이 아니다
function sideWidthFromShorthand(value) {
  const parts = String(value).replace(/!important/i, '').trim().split(/\s+/).map(lenPx)
  if (parts.length < 2 || parts.length > 4 || parts.some(x => x === null)) return null
  const [top, right, bottom = top, left = right] = parts
  const side = Math.max(left, right)
  return side > 1 && side > Math.max(top, bottom) ? side : null
}
// box-shadow 값 → 번짐 없는 옆 inset 그림자(inset 4px 0 0 색)의 폭 px. 색이 없거나 번지면 null
function insetSidePx(value) {
  for (const layer of String(value).replace(/!important/i, '').split(/,(?![^(]*\))/)) {
    if (!/\binset\b/i.test(layer) || !COLOR_WORD.test(layer)) continue
    const lens = layer.split(/\s+(?![^(]*\))/).map(lenPx).filter(x => x !== null)
    const [x = 0, y = 0, blur = 0, spread = 0] = lens
    if (Math.abs(x) > 1 && y === 0 && blur === 0 && spread === 0) return Math.abs(x)
  }
  return null
}

// Tailwind 토큰 → 옆선 폭 px(옆선이 아니면 null). [border-left:4px_solid_…] 임의 속성도 읽는다
const variantsOf = tok => (tok.match(/^((?:[^\s:[\]]+:|\[[^\]]*\]:)*)/) || ['', ''])[1]
const baseOf = tok => tok.slice(variantsOf(tok).length).replace(/^!/, '')
const STATE_VARIANT = /(?:aria-|data-|current|selected|active|invalid|focus|open|checked|hover|group-|peer-)/
function sideTokenPx(tok) {
  if (STATE_VARIANT.test(variantsOf(tok))) return null
  const b = baseOf(tok)
  let m = b.match(/^border-(?:l|r|s|e)-(\d+)$/)
  if (m) return +m[1]
  m = b.match(/^border-(?:l|r|s|e)-\[([^\]]+)\]$/)
  if (m) return widthPx(m[1].replace(/^length:/, ''))
  m = b.match(/^\[border-(?:left|right|inline-start|inline-end)(-width)?:([^\]]+)\]$/)
  if (m) {
    const val = m[2].replace(/_/g, ' ')
    if (m[1]) return widthPx(val)
    const p = parseSideShorthand(val)
    return p.none ? null : p.px
  }
  m = b.match(/^\[border-width:([^\]]+)\]$/)
  if (m) return sideWidthFromShorthand(m[1].replace(/_/g, ' '))
  m = b.match(/^(?:shadow-\[|\[box-shadow:)([^\]]+)\]$/)
  if (m) return insetSidePx(m[1].replace(/_/g, ' '))
  return null
}
// 옆선 색을 투명으로 둔 토큰 묶음 — 상태(aria-current·hover)에서만 색이 켜지는 자리 잡기다.
// 상태 변형이 없는 옆선 색 토큰(border-l-[var(--color-primary)])이 함께 있으면 투명이 아니다
function transparentSide(tokens) {
  const plain = tokens.filter(t => !STATE_VARIANT.test(variantsOf(t))).map(baseOf)
  if (!plain.some(b => /^border(?:-[lrsex])?-transparent$/.test(b))) return false
  return !plain.some(b => {
    const m = b.match(/^border-[lrsex]-(.+)$/)
    if (!m || m[1] === 'transparent') return false
    // 폭(border-l-4·border-l-[0.4rem])은 색이 아니다
    return !/^\d+$/.test(m[1]) && !/^\[(?:length:)?[\d.]+(?:px|rem|em)\]$/.test(m[1])
  })
}
const maxSidePx = tokens => (transparentSide(tokens) ? 0 : Math.max(0, ...tokens.map(sideTokenPx).filter(x => x !== null)))
const isChevronTokens = tokens => tokens.some(t => /(?:^|:)(?:-?rotate-|\[transform:rotate)/.test(t)) && tokens.some(t => /(?:^|:)(?:border-[bt]-|\[border-(?:bottom|top):)/.test(t))

const sideMsg = px => `색 있는 굵은 옆선(${Math.round(px * 10) / 10}px) — 카드·목록·인용·알림의 왼쪽 강조선은 생성 페이지의 흔한 서명이다. 위계는 제목·여백·배경 면으로 세우고, 옆선은 현재 위치(탭·메뉴·LNB)와 입력 오류 표시에만 쓴다.`

function exemptElement(n) {
  if (n.tag === 'td' || n.tag === 'th') return true // 표 칸 구분선
  return [n, ...T.ancestors(n)].some(a => a.tag === 'blockquote' || 'aria-current' in (a.attrs || {}) || a.attrs?.['aria-invalid'] === 'true' ||
    classTokens(a).some(c => SIDE_EXEMPT_BLOCK.test(blockOf(c)) || SIDE_EXEMPT_STATE.test(c)))
}

// ─── (6) 아이콘 타일 바로가기 ───────────────────────
const TILE_MIN = 4
const TILE_EXEMPT_TAG = new Set(['header', 'footer', 'table', 'select', 'ol'])
const TILE_EXEMPT_BLOCK = /^(?:tab|tabs|main-menu|mobile-menu|side-navigation|side-menu|lnb|gnb|breadcrumb|pagination|step-indicator|toolbar|site-header|site-footer|header|footer)$/
const elementChildren = n => (n.children || []).filter(isEl)
const hasOwnText = n => (n.children || []).some(c => c.tag === '#text' && !c.rawText && c.text.trim())
const isIcon = n => n.tag === 'svg' || classTokens(n).some(c => /^(?:icon|icon-font)(?:$|--)/.test(c))
// 링크·버튼 하나가 아이콘 타일인가 — 첫 요소 자식이 아이콘 하나만 감싼 span·div이고, 그 뒤에 보이는 글 레이블이 온다
function isIconTile(link) {
  const kids = elementChildren(link)
  const box = kids[0]
  if (!box || !['span', 'div', 'i'].includes(box.tag) || isIcon(box) || hasOwnText(box)) return false
  // 상자 앞에 글이 있으면 아이콘이 앞머리가 아니다(글 + 뒤 아이콘 꼴)
  const before = link.children.slice(0, link.children.indexOf(box))
  if (before.some(c => c.tag === '#text' && c.text.trim())) return false
  const inner = elementChildren(box)
  if (inner.length !== 1 || !isIcon(inner[0])) return false
  const label = link.children.slice(link.children.indexOf(box) + 1).map(c => T.textOf(c, { visible: true })).join(' ')
  return T.norm(label).length > 0
}
// 형제 요소 → 그 요소가 나타내는 링크·버튼(자신이거나, 유일한 요소 자식)
function tileLinkOf(item) {
  if (item.tag === 'a' || item.tag === 'button') return item
  const kids = elementChildren(item)
  return kids.length === 1 && (kids[0].tag === 'a' || kids[0].tag === 'button') && !hasOwnText(item) ? kids[0] : null
}
// 문서에서 처음 나오는 타일 묶음 → { first, count } (없으면 null)
function findIconTileGroup(root) {
  let found = null
  T.walk(root, n => {
    if (found || !isEl(n) || n.foreign) return
    if ([n, ...T.ancestors(n)].some(a => TILE_EXEMPT_TAG.has(a.tag) || classTokens(a).some(c => TILE_EXEMPT_BLOCK.test(blockOf(c))))) return
    const tiles = elementChildren(n).map(tileLinkOf).filter(l => l && isIconTile(l))
    if (tiles.length >= TILE_MIN) found = { first: tiles[0], count: tiles.length }
  })
  return found
}

// CSS 원문 → (5)
function scanCssTemplate(css) {
  const out = []
  for (const b of cssBlocks(css)) {
    if (b.selectors.every(s => SIDE_EXEMPT_SELECTOR.test(s) || SIDE_EXEMPT_STATE.test(s))) continue
    const sel = b.selectors[0]
    const applyTokens = b.decls.filter(d => d.prop === '@apply').flatMap(d => d.value.split(/\s+/))
    // 셰브런·화살표 그리기(두 변 + 회전)는 옆선이 아니다
    const rotated = b.decls.some(d => (d.prop === 'transform' || d.prop === 'rotate') && /rotate|deg/.test(d.value)) || isChevronTokens(applyTokens)
    const hasOtherSide = b.decls.some(d => /^border-(?:top|bottom)(?:-width)?$/.test(d.prop))
    if (rotated && (hasOtherSide || isChevronTokens(applyTokens) || applyTokens.some(t => /border-[bt]-|\[border-(?:bottom|top)/.test(t)))) continue
    const blockColored = b.decls.some(d => (SIDE_COLOR_PROPS.test(d.prop) || d.prop === 'border') && COLOR_WORD.test(d.value) && !TRANSPARENT.test(d.value.trim()))
    for (const d of b.decls) {
      let px = null
      if (SIDE_PROPS.test(d.prop)) {
        const p = parseSideShorthand(d.value)
        if (!p.none && p.colored) px = p.px
      } else if (SIDE_WIDTH_PROPS.test(d.prop) && blockColored) {
        px = widthPx(d.value.replace(/!important/i, ''))
      } else if (d.prop === 'border-width' && blockColored) {
        px = sideWidthFromShorthand(d.value)
      } else if (d.prop === 'box-shadow') {
        px = insetSidePx(d.value)
      } else if (d.prop === '@apply') {
        px = maxSidePx(d.value.split(/\s+/).filter(Boolean)) || null
      }
      if (px !== null && px > 1) {
        out.push(warn(d.line, sideMsg(px), `${sel} { ${d.prop === '@apply' ? '@apply ' : d.prop + ': '}${d.value} }`.replace(/\s+/g, ' ').slice(0, 120)))
      }
    }
  }
  return out
}

// HTML 원문 → (1)(2)(3)(5: class·<style>)
function scanHtmlTemplate(html) {
  const out = []
  const root = T.parseHtml(html)
  const reportedNumber = new Set()
  T.walk(root, n => {
    if (n.tag === '#root') return
    if (n.tag === '#text') {
      if (n.rawText && n.parent.tag === 'style') for (const f of scanCssTemplate(n.text)) out.push({ ...f, line: n.lineStart + f.line - 1 })
      return
    }
    if (n.foreign) return
    const cls = classTokens(n)

    // (1) eyebrow·kicker
    if (cls.some(c => EYEBROW_TOKEN.test(c))) {
      out.push(warn(n.line, `제목 위 분류 표지(eyebrow) "${T.norm(T.textOf(n, { visible: true })).slice(0, 30)}" — 생성 페이지의 흔한 서명이다. 제목이 스스로 무게를 갖게 쓰고, 분류가 정보라면 브레드크럼·배지·메타 줄로 준다.`, code(n)))
    } else if (/^h[23]$/.test(n.tag)) {
      const prev = prevElementSibling(n)
      if (prev && ['p', 'span'].includes(prev.tag) && onlyText(prev) && classTokens(prev).some(c => LABEL_TOKEN.test(c))) {
        const t = T.norm(T.textOf(prev, { visible: true }))
        if (t && [...t].length <= EYEBROW_MAX && !classTokens(prev).some(c => EYEBROW_TOKEN.test(c))) {
          out.push(warn(prev.line, `제목 바로 위 짧은 분류 표지 "${t}" — eyebrow와 같은 템플릿 서명이다. 제목이 스스로 무게를 갖게 쓰고, 분류는 정보일 때만 메타·배지로 준다.`, code(prev)))
        }
      }
    }

    // (2) 장식 번호
    if (!inOrderedContext(n)) {
      const byClass = cls.some(c => NUMBER_CLASS.test(c)) && SHORT_NUMBER_TEXT.test(T.norm(T.textOf(n, { visible: true })))
      const lead = leadingOwnText(n)
      const byText = DECOR_NUMBER_TEXT.test(lead)
      if ((byClass || byText) && !reportedNumber.has(n)) {
        reportedNumber.add(n)
        const what = byText ? `"${lead.slice(0, 12)}"` : `class "${cls.find(c => NUMBER_CLASS.test(c))}"`
        out.push(warn(n.line, `순서가 아닌 장식 번호 ${what} — 01·02·03 번호는 생성 페이지의 흔한 서명이다. 번호는 순서가 정보일 때만 ol(또는 step-indicator)로 쓴다.`, code(n)))
      }
    }

    // (5) Tailwind 옆선
    const sidePx = maxSidePx(cls)
    if (sidePx > 1 && !isChevronTokens(cls) && !exemptElement(n)) out.push(warn(T.attrLine(n, 'class'), sideMsg(sidePx), code(n)))
    // (5) style 속성의 옆선 — CSS와 같은 판정을 쓴다(선택자 예외 대신 요소 예외)
    if (n.attrs.style && !exemptElement(n)) {
      for (const f of scanCssTemplate(`x { ${n.attrs.style} }`)) out.push(warn(T.attrLine(n, 'style'), f.message, code(n)))
    }
  })

  // (6) 아이콘 타일 바로가기 — 문서당 1건
  const tiles = findIconTileGroup(root)
  if (tiles) {
    out.push(warn(tiles.first.line, `아이콘 타일 바로가기 ${tiles.count}개 — 링크마다 아이콘을 배경 상자에 넣고 아래에 레이블을 둔 항목을 같은 크기로 늘어놓는 형식은 한국 공공 메인의 전형 조립 서명이다(design-intelligence §7-1 B). 글자를 키운 목록·대표 칸·색 띠·검색 결합(§6-2 Q1~Q4)을 먼저 비교한다. 의도한 선택이면 docs/design-plan.md에 이유를 적는다.`, code(tiles.first)))
  }

  // (3) 모든 섹션 등장 효과 — 문서당 1건
  const mains = []
  T.walk(root, n => { if (n.tag === 'main') mains.push(n) })
  const scopes = mains.length ? mains : [root]
  const sections = []
  for (const s of scopes) T.walk(s, n => { if (n.tag === 'section') sections.push(n) })
  const revealed = sections.filter(sectionHasReveal)
  if (revealed.length >= 3) {
    const at = revealed[2]
    out.push(warn(at.line, `섹션 ${revealed.length}개(전체 ${sections.length}개 중)에 스크롤 등장 효과 — 모든 섹션이 떠오르는 화면은 생성 페이지의 흔한 서명이다. 등장 효과는 한 화면에 한 번, 의도한 순간에만 둔다.`, code(at)))
  }
  return out
}

module.exports = { scanHtmlTemplate, scanCssTemplate, widthPx, sideTokenPx, insetSidePx, sideWidthFromShorthand, isIconTile }
