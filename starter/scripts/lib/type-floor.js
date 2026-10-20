// 글자 크기 하한 — 62.5% 루트(1rem = 10px)에서 KRDS 단계를 지킨다 (안티슬롭 명세, 새 번호)
//   R-31 루트 글자 크기 고정 — html·:root의 font-size는 62.5%. 다른 값·vw는 사용자 글자 크기 설정을 무력화한다(경고).
//        글자 크기 조절 기능(html[data-font-scale])은 예외
//   R-38 최소 글자 — 1.3rem(KRDS 최소 단계) 미만 오류, body 1.6rem 미만 오류, 본문 성격 element(__desc·__body…) 1.5rem 미만 오류,
//        1.3~1.5rem 사이(KRDS 단계 밖)는 경고, p·li·td·dd·blockquote의 1.3rem은 주석·각주 허용이라 경고
// 보는 곳: CSS 선언(font-size·font 단축), @apply의 text-[N]·[font-size:N], HTML class의 text-[N], style 속성.
// 빼는 것: 아이콘 글리프(__icon·__close·__remove·__arrow·__mark·__dot, .icon, icon-font), 기호만 그리는 ::before·::after,
//          코드(pre·code·kbd·samp, monospace), em·%·vw처럼 rem으로 바꿀 수 없는 값(clamp는 최솟값으로 본다).
// 결과: { rule, severity, line, message, code }

const T = require('./html-tree')

const blank = s => s.replace(/[^\n]/g, ' ')
const stripComments = css => css.replace(/\/\*[\s\S]*?\*\//g, blank)

// 값 → rem(px는 ÷10). 판정할 수 없으면 null
function toRem(raw) {
  let v = String(raw).trim()
  const clamp = v.match(/^clamp\(\s*([^,]+),/i)
  if (clamp) v = clamp[1].trim()
  const m = v.match(/^(-?\d*\.?\d+)(rem|px)$/i)
  if (!m) return null
  return m[2].toLowerCase() === 'px' ? +m[1] / 10 : +m[1]
}
// font 단축 속성의 크기 — 'bold 1.2rem/1.5 var(--font-sans)'
function sizeFromShorthand(v) {
  const m = String(v).match(/(?:^|\s)(-?\d*\.?\d+(?:rem|px))(?:\s*\/\s*[\d.]+[a-z%]*)?(?=\s|$)/i)
  return m ? m[1] : null
}
// @apply·class 토큰 → 크기 값
function sizeFromToken(tok) {
  const base = tok.replace(/^(?:[\w-]+:)+/, '').replace(/^!/, '')
  let m = base.match(/^text-\[(?:length:)?([^\]]+)\]$/)
  if (m && /^(?:\d*\.?\d+(?:rem|px)|clamp\()/.test(m[1])) return m[1].replace(/_/g, ' ')
  m = base.match(/^\[font-size:([^\]]+)\]$/)
  return m ? m[1].replace(/_/g, ' ') : null
}

const GLYPH = /__(?:icon|close|remove|arrow|mark|dot)\b|(?:^|[\s.])icon(?=$|[\s.:[#>+~])|icon-font/
const BODYISH_ELEMENT = /__(?:desc|description|body|lead|excerpt|content)\b/
const PROSE_TAG = /^(?:p|li|td|dd|blockquote)$/

// 선택자의 주어(마지막 복합 선택자)
const subjectOf = sel => sel.trim().split(/\s*[\s>+~]\s*/).filter(Boolean).pop() || ''
const tagOf = subject => (subject.match(/^[a-z][\w-]*/i) || [''])[0].toLowerCase()

// 크기 하나를 판정한다. ctx: { selector(주어 판정용), tag, classes, content(같은 블록 content 값), mono }
function judgeSize(rem, ctx) {
  const sel = ctx.selector || ''
  const subject = subjectOf(sel)
  const tag = ctx.tag || tagOf(subject)
  const classes = ctx.classes || ''
  if (/^(?:html|:root)\b/i.test(subject)) return null // R-31 소관
  if (GLYPH.test(sel) || GLYPH.test(` ${classes}`)) return null
  if (/::?(?:before|after)\b/.test(subject)) {
    const content = String(ctx.content || '').replace(/^["']|["']$/g, '')
    if (!/[가-힣]/.test(content) && content.replace(/\\[0-9a-f]+\s?/gi, 'x').length < 2) return null
  }
  if (ctx.mono || /^(?:pre|code|kbd|samp)$/.test(tag)) return null
  const shown = `${Math.round(rem * 100) / 100}rem`
  if (tag === 'body' && rem < 1.6) return { severity: 'error', message: `body 글자 크기 ${shown} — KRDS 본문 최소 16px(1.6rem)이다.` }
  if (rem < 1.3) return { severity: 'error', message: `글자 크기 ${shown} — KRDS 최소 단계 1.3rem(13px)보다 작다. 62.5% 루트라 1rem = 10px다.` }
  if (BODYISH_ELEMENT.test(sel) || BODYISH_ELEMENT.test(classes)) {
    if (rem < 1.5) return { severity: 'error', message: `본문 성격 요소의 글자 크기 ${shown} — 설명·본문은 1.5rem(15px) 이상이다(KRDS body-small).` }
    return null
  }
  if (PROSE_TAG.test(tag) && rem === 1.3) return { severity: 'warn', message: `${tag} 글자 크기 1.3rem — 주석·각주가 아니면 본문은 1.5rem 이상으로 쓴다.` }
  if (rem > 1.3 && rem < 1.5) return { severity: 'warn', message: `글자 크기 ${shown} — KRDS 단계 밖이다(1.3·1.5·1.6·1.7·1.9rem…). 가까운 단계로 맞춘다.` }
  return null
}

// R-31 — html·:root의 font-size
function judgeRoot(selector, value) {
  const subject = subjectOf(selector)
  if (!/^(?:html|:root)\b/i.test(subject) || /\[data-font-scale/.test(subject)) return null
  const v = String(value).trim().replace(/\s*!important$/, '')
  if (v === '62.5%') return null
  return { rule: 'R-31', severity: 'warn', message: `루트 글자 크기 "${v}" — 62.5%로 고정한다. 다른 값·vw는 사용자 글자 크기 설정과 rem 단계(1rem = 10px)를 무너뜨린다. 글자 크기 조절은 html[data-font-scale]로 둔다.` }
}

// CSS → 블록 목록 { selectors: [...], decls: [{ prop, value, line }] } (중첩·@media·@layer를 펼친다)
function cssBlocks(css) {
  const src = stripComments(css)
  const lineAt = T.makeLineAt(src)
  const blocks = []
  const stack = [{ selectors: [''], decls: [], at: true }]
  let buf = ''
  let bufStart = 0
  const resolve = (header, parents) => {
    const parts = header.split(/,(?![^(]*\))/).map(s => s.trim()).filter(Boolean)
    const out = []
    for (const p of parents) {
      for (const c of parts) out.push(c.includes('&') ? c.replace(/&/g, p) : p ? `${p} ${c}` : c)
    }
    return out
  }
  const pushDecl = () => {
    const t = buf.trim()
    if (t) {
      const top = stack[stack.length - 1]
      const m = t.match(/^(@apply)\s+([\s\S]+)$/) || t.match(/^(--[\w-]+|-?[a-zA-Z][\w-]*)\s*:([\s\S]*)$/)
      if (m) top.decls.push({ prop: m[1].toLowerCase(), value: m[2].trim(), line: lineAt(bufStart + (buf.length - buf.trimStart().length)) })
    }
    buf = ''
  }
  for (let i = 0; i < src.length; i++) {
    const c = src[i]
    if (!buf) bufStart = i
    if (c === '{') {
      const header = buf.trim()
      buf = ''
      const parent = stack[stack.length - 1]
      if (header.startsWith('@')) stack.push({ selectors: parent.selectors, decls: [], at: true })
      else stack.push({ selectors: resolve(header, parent.selectors), decls: [], at: false })
    } else if (c === '}') {
      pushDecl()
      const b = stack.pop()
      if (!b.at && b.decls.length) blocks.push(b)
      else if (b.at && b.decls.length && stack.length) stack[stack.length - 1].decls.push(...b.decls)
      if (!stack.length) stack.push({ selectors: [''], decls: [], at: true })
    } else if (c === ';') {
      pushDecl()
    } else {
      buf += c
    }
  }
  return blocks
}

// CSS 원문 → 결과(줄은 css 기준)
function scanCssType(css) {
  const out = []
  for (const b of cssBlocks(css)) {
    const content = (b.decls.find(d => d.prop === 'content') || {}).value
    const mono = b.decls.some(d => d.prop === 'font-family' && /monospace|--font-mono/.test(d.value))
    for (const d of b.decls) {
      const sizes = []
      if (d.prop === 'font-size') sizes.push(d.value)
      else if (d.prop === 'font') { const s = sizeFromShorthand(d.value); if (s) sizes.push(s) }
      else if (d.prop === '@apply') for (const tok of d.value.split(/\s+/)) { const s = sizeFromToken(tok); if (s) sizes.push(s) }
      for (const sel of b.selectors) {
        if (d.prop === 'font-size') {
          const root = judgeRoot(sel, d.value)
          if (root) { out.push({ ...root, line: d.line, code: `${sel} { font-size: ${d.value} }`.slice(0, 120) }); continue }
        }
        for (const s of sizes) {
          const rem = toRem(s)
          if (rem === null) continue
          const r = judgeSize(rem, { selector: sel, content, mono })
          if (r) out.push({ rule: 'R-38', ...r, line: d.line, code: `${sel} { ${d.prop === '@apply' ? '@apply ' : d.prop + ': '}${d.value} }`.replace(/\s+/g, ' ').slice(0, 120) })
        }
      }
    }
  }
  // 같은 줄·같은 메시지는 한 번만(선택자 목록이 여럿이면 겹친다)
  const seen = new Set()
  return out.filter(f => { const k = `${f.line}|${f.message}`; if (seen.has(k)) return false; seen.add(k); return true })
}

// HTML 원문 → 결과 — <style> 블록, class의 text-[N], style 속성의 font-size
function scanHtmlType(html) {
  const out = []
  const root = T.parseHtml(html)
  T.walk(root, n => {
    if (n.tag === '#root') return
    if (n.tag === '#text') {
      if (n.rawText && n.parent.tag === 'style') for (const f of scanCssType(n.text)) out.push({ ...f, line: n.lineStart + f.line - 1 })
      return
    }
    const classes = n.attrs.class || ''
    const sizes = classes.split(/\s+/).map(sizeFromToken).filter(Boolean)
    const style = n.attrs.style || ''
    const sm = style.match(/(?:^|;)\s*font-size\s*:\s*([^;]+)/i)
    if (sm) sizes.push(sm[1].trim())
    const fm = style.match(/(?:^|;)\s*font\s*:\s*([^;]+)/i)
    if (fm && sizeFromShorthand(fm[1])) sizes.push(sizeFromShorthand(fm[1]))
    const inCode = [n, ...T.ancestors(n)].some(a => /^(?:pre|code|kbd|samp)$/.test(a.tag))
    for (const s of sizes) {
      const rem = toRem(s)
      if (rem === null) continue
      const r = judgeSize(rem, { tag: n.tag, classes, mono: inCode })
      if (r) out.push({ rule: 'R-38', ...r, line: n.line, code: (n.src || '').replace(/\s+/g, ' ').slice(0, 120) })
    }
  })
  return out
}

module.exports = { scanCssType, scanHtmlType, judgeSize, judgeRoot, toRem, cssBlocks }
