// 가벼운 HTML 트리 — 카피 규칙(R-23·R-43)처럼 형제·조상·텍스트를 봐야 하는 검사가 쓴다.
// 의존성이 없다(파생 프로젝트·스타터에는 htmlparser2가 없다). 브라우저 수준의 오류 복구는 하지 않지만,
// 검사 판정에 영향을 주는 복구는 따른다 — 종료 태그를 생략한 li·dt·dd·option·tr·td(암묵 종료),
// 다른 단계의 제목 종료 태그(<h2>…</h3>), 따옴표 값 뒤에 공백 없이 붙은 속성, 중첩 template.
// 주석·doctype은 버리고, 템플릿 식({{ }}·{% %}·{# #})은 줄 번호가 유지되도록 공백으로 지운다.
// script·style·textarea·template 안은 원문 텍스트 노드 하나로 둔다. svg·math 아래 노드에는 foreign을 단다
// (svg <title>은 문서 제목이 아니다).

const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'])
const RAW_TEXT = new Set(['script', 'style', 'textarea', 'template'])
// 문구 흐름 안의 인라인 요소 — 문구 덩어리·텍스트를 이을 때 경계로 보지 않는다
const INLINE = new Set(['a', 'abbr', 'b', 'bdi', 'bdo', 'br', 'cite', 'code', 'data', 'del', 'dfn', 'em', 'font', 'i', 'img', 'input', 'ins', 'kbd', 'mark', 'q', 's', 'samp', 'small', 'span', 'strong', 'sub', 'sup', 'time', 'u', 'var', 'wbr'])

// 종료 태그를 생략해도 되는 요소 — 새 시작 태그가 앞 형제를 닫는다(경계 요소를 넘지 않는다)
const IMPLIED_END = {
  li: { close: ['li'], stop: ['ul', 'ol', 'menu'] },
  dt: { close: ['dt', 'dd'], stop: ['dl'] },
  dd: { close: ['dt', 'dd'], stop: ['dl'] },
  option: { close: ['option'], stop: ['select', 'datalist', 'optgroup'] },
  optgroup: { close: ['option', 'optgroup'], stop: ['select'] },
  tr: { close: ['tr', 'td', 'th'], stop: ['table', 'thead', 'tbody', 'tfoot'] },
  td: { close: ['td', 'th'], stop: ['tr', 'table'] },
  th: { close: ['td', 'th'], stop: ['tr', 'table'] },
  thead: { close: ['thead', 'tbody', 'tfoot', 'tr', 'td', 'th'], stop: ['table'] },
  tbody: { close: ['thead', 'tbody', 'tfoot', 'tr', 'td', 'th'], stop: ['table'] },
  tfoot: { close: ['thead', 'tbody', 'tfoot', 'tr', 'td', 'th'], stop: ['table'] }
}

const NAMED_ENTITIES = {
  nbsp: ' ', ensp: ' ', emsp: ' ', thinsp: ' ', shy: '', zwnj: '', zwj: '',
  lt: '<', gt: '>', amp: '&', quot: '"', apos: "'", excl: '!', quest: '?', num: '#', percnt: '%', colon: ':', semi: ';', comma: ',', period: '.', lpar: '(', rpar: ')', sol: '/',
  ldquo: '“', rdquo: '”', lsquo: '‘', rsquo: '’', sbquo: '‚', bdquo: '„', laquo: '«', raquo: '»', lsaquo: '‹', rsaquo: '›',
  ndash: '–', mdash: '—', hellip: '…', middot: '·', bull: '•', prime: '′', Prime: '″',
  times: '×', divide: '÷', plusmn: '±', deg: '°', micro: 'µ', para: '¶', sect: '§', cent: '¢', pound: '£', yen: '¥', euro: '€',
  copy: '©', reg: '®', trade: '™',
  larr: '←', rarr: '→', uarr: '↑', darr: '↓', harr: '↔', check: '✓', star: '☆', starf: '★'
}
const safeCodePoint = n => (Number.isFinite(n) && n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : ' ')

// 한 번에 푼다 — '&#38;lt;'를 '<'로 이중 해석하지 않는다. 이름 엔티티는 ';'까지 있어야 푼다('AT&T'는 그대로)
function decodeEntities(s) {
  return s.replace(/&(?:#x([0-9a-f]+);?|#(\d+);?|([a-zA-Z][a-zA-Z0-9]*);)/gi, (whole, hex, dec, name) => {
    if (hex) return safeCodePoint(parseInt(hex, 16))
    if (dec) return safeCodePoint(parseInt(dec, 10))
    return NAMED_ENTITIES[name] ?? whole
  })
}

const blank = m => m.replace(/[^\n]/g, ' ')
const stripTemplates = s => s.replace(/\{\{[\s\S]*?\}\}|\{%[\s\S]*?%\}|\{#[\s\S]*?#\}/g, blank)

function parseAttrs(text) {
  const attrs = {}
  const re = /([:@\w.-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g
  let m
  while ((m = re.exec(text || ''))) attrs[m[1].toLowerCase()] = decodeEntities(m[2] ?? m[3] ?? m[4] ?? '')
  return attrs
}

function makeLineAt(src) {
  const idx = [0]
  for (let i = 0; i < src.length; i++) if (src.charCodeAt(i) === 10) idx.push(i + 1)
  return offset => {
    let lo = 0
    let hi = idx.length - 1
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1
      if (idx[mid] <= offset) lo = mid
      else hi = mid - 1
    }
    return lo + 1
  }
}

// 속성 하나 — 따옴표 값 바로 뒤에서는 공백 없이 다음 속성이 붙어도 받는다(<a href="/x"class="btn">)
const ATTR_SRC = `[^\\s=<>"'/]+(?:\\s*=\\s*(?:"[^"]*"|'[^']*'|[^\\s"'=<>\`]+))?`
const TAG_RE_SRC = `<!--[\\s\\S]*?-->|<![^>]*>|<\\/([a-zA-Z][\\w:-]*)\\s*>|<([a-zA-Z][\\w:-]*)((?:(?:\\s+|(?<=["']))${ATTR_SRC})*)\\s*(\\/?)>`
const HEADING = /^h[1-6]$/

// 블록 시작 태그는 열린 <p>를 닫는다 — </p>를 생략한 문단 수천 개가 트리를 그만큼 깊게 만들지 않게(스택 넘침)
const CLOSES_P = new Set(['address', 'article', 'aside', 'blockquote', 'center', 'details', 'dialog', 'dir', 'div', 'dl', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hgroup', 'hr', 'main', 'menu', 'nav', 'ol', 'p', 'pre', 'search', 'section', 'summary', 'table', 'ul', 'li', 'dd', 'dt'])
const P_SCOPE = new Set(['button', 'caption', 'html', 'table', 'td', 'th', 'object', 'template'])
function closeP(stack, tag) {
  if (!CLOSES_P.has(tag)) return
  for (let i = stack.length - 1; i > 0; i--) {
    const n = stack[i]
    if (n.foreign || P_SCOPE.has(n.tag)) return
    if (n.tag === 'p') { stack.length = i; return }
  }
}

function applyImpliedEnd(stack, tag) {
  const rule = IMPLIED_END[tag]
  if (!rule) return
  let cut = -1
  for (let i = stack.length - 1; i > 0; i--) {
    const t = stack[i].tag
    if (rule.stop.includes(t)) break
    if (rule.close.includes(t)) cut = i
  }
  if (cut > 0) stack.length = cut
}

// 중첩 template의 짝이 맞는 닫는 태그 위치
function findTemplateEnd(html, from) {
  // 주석·script·style·textarea 안의 '<template' 글자는 세지 않는다
  const re = /<!--[\s\S]*?(?:-->|$)|<(script|style|textarea)\b[^>]*>[\s\S]*?(?:<\/\1\s*>|$)|<(\/?)template(?=[\s/>])[^>]*>/ig
  re.lastIndex = from
  let depth = 0
  let m
  while ((m = re.exec(html))) {
    if (m[0].startsWith('<!--') || m[1]) continue
    if (!m[2]) depth++
    else if (depth === 0) return { index: m.index, end: m.index + m[0].length }
    else depth--
  }
  return null
}

// html → { tag: '#root', children, lineAt }
//   요소 { tag, attrs, children, parent, line, start, src, foreign }
//   텍스트 { tag: '#text', text(엔티티 해석), raw, parent, line(첫 글자 줄), lineStart(raw 시작 줄), rawText? }
function parseHtml(input) {
  const html = stripTemplates(input)
  const lineAt = makeLineAt(html)
  const root = { tag: '#root', attrs: {}, children: [], parent: null, line: 1, start: 0, src: '', foreign: false, lineAt }
  const stack = [root]
  const re = new RegExp(TAG_RE_SRC, 'g')
  let last = 0
  let m
  const top = () => stack[stack.length - 1]
  const pushText = (from, to) => {
    if (to <= from) return
    const raw = html.slice(from, to)
    // 공백만 있는 글도 노드로 둔다 — '<em>제주</em> <em>당신</em>'의 사이 공백이 문구 덩어리에서 사라지지 않게
    const lead = raw.match(/^\s*/)[0]
    top().children.push({ tag: '#text', text: decodeEntities(raw), raw, parent: top(), line: lineAt(from + lead.length), lineStart: lineAt(from) })
  }
  while ((m = re.exec(html))) {
    pushText(last, m.index)
    last = re.lastIndex
    if (m[0].startsWith('<!')) continue
    if (m[1]) {
      const tag = m[1].toLowerCase()
      // </h3>은 열린 h1~h6 어느 것이든 닫는다(HTML 명세)
      const same = HEADING.test(tag) ? x => HEADING.test(x.tag) : x => x.tag === tag
      for (let i = stack.length - 1; i > 0; i--) if (same(stack[i])) { stack.length = i; break }
      continue
    }
    const tag = m[2].toLowerCase()
    closeP(stack, tag)
    applyImpliedEnd(stack, tag)
    const parent = top()
    const node = { tag, attrs: parseAttrs(m[3]), children: [], parent, line: lineAt(m.index), start: m.index, src: m[0], foreign: parent.foreign || tag === 'svg' || tag === 'math' }
    parent.children.push(node)
    if (RAW_TEXT.has(tag) && !m[4]) {
      // 원문 요소는 닫는 태그까지 통째로 텍스트 하나로(template은 중첩 짝을 맞춘다)
      let close
      if (tag === 'template') close = findTemplateEnd(html, re.lastIndex)
      else {
        const cre = new RegExp(`</${tag}\\s*>`, 'ig')
        cre.lastIndex = re.lastIndex
        const cm = cre.exec(html)
        close = cm ? { index: cm.index, end: cm.index + cm[0].length } : null
      }
      const end = close ? close.index : html.length
      const raw = html.slice(re.lastIndex, end)
      if (raw.trim()) node.children.push({ tag: '#text', text: raw, raw, parent: node, line: lineAt(re.lastIndex), lineStart: lineAt(re.lastIndex), rawText: true })
      re.lastIndex = close ? close.end : html.length
      last = re.lastIndex
      continue
    }
    if (!(m[4] || VOID.has(tag))) stack.push(node)
  }
  pushText(last, html.length)
  return root
}

const classesOf = n => (n.attrs?.class || '').split(/\s+/).filter(Boolean)
function ancestors(n) {
  const out = []
  let c = n.parent
  while (c && c.tag !== '#root') { out.push(c); c = c.parent }
  return out
}
function walk(n, fn) {
  fn(n)
  for (const c of n.children || []) walk(c, fn)
}
// 첫 번째로 조건에 맞는 자손(자신 포함)
function find(n, pred) {
  if (pred(n)) return n
  for (const c of n.children || []) {
    const hit = find(c, pred)
    if (hit) return hit
  }
  return null
}

const HIDDEN_CLASS = /(?:^|\s)(?:sr-only|blind|visually-hidden|screen-out|hide|hidden)(?:\s|$)/
// 반응형으로 다시 보이게 하는 클래스(hidden laptop:inline-flex, sr-only laptop:not-sr-only)는 숨김이 아니다
const RESPONSIVE_SHOW = /(?:^|\s)[\w-]+:(?:block|inline|inline-block|inline-flex|flex|grid|inline-grid|table|contents|flow-root|not-sr-only)(?=\s|$)/
const isHiddenEl = n => {
  if (!n.attrs) return false
  const cls = n.attrs.class || ''
  return (HIDDEN_CLASS.test(cls) && !RESPONSIVE_SHOW.test(cls)) || 'hidden' in n.attrs || n.attrs['aria-hidden'] === 'true'
}

// 텍스트 내용 — opts.visible: 숨김(sr-only·hidden·aria-hidden) 하위는 뺀다, opts.accessible: aria-hidden 하위만 뺀다.
// br은 공백, 블록 요소 앞뒤에도 공백을 둔다('질문 1'+'답변' → '질문 1 답변')
function textOf(n, opts = {}) {
  if (n.tag === '#text') return n.rawText ? '' : n.text
  if (n.tag === 'br') return ' '
  if (opts.visible && isHiddenEl(n)) return ''
  if (opts.accessible && n.attrs && n.attrs['aria-hidden'] === 'true') return ''
  if (n.tag === 'input') return n.attrs.value || ''
  return (n.children || []).map(c => {
    const t = textOf(c, opts)
    return c.tag !== '#text' && !INLINE.has(c.tag) ? ` ${t} ` : t
  }).join('')
}

const norm = s => s.replace(/\s+/g, ' ').trim()

// 요소 속성의 줄 — 여러 줄로 쓴 태그에서 속성이 실제로 있는 줄
const escapeRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
function attrLine(el, name) {
  if (!el.src) return el.line
  const i = el.src.search(new RegExp('(?:^|[\\s"\'])' + escapeRe(name) + '\\s*=', 'i'))
  if (i < 0) return el.line
  return el.line + (el.src.slice(0, i).match(/\n/g) || []).length
}

module.exports = { parseHtml, walk, find, ancestors, classesOf, textOf, norm, isHiddenEl, decodeEntities, makeLineAt, attrLine, INLINE }
