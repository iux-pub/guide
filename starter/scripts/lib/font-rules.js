// 폰트 스택 (R-26 확장) — 서체는 토큰(--font-sans·--font-heading·--font-mono)으로만 쓴다
//   (b) font-family 값은 var(--font-sans|heading|mono)·inherit·initial·unset·revert만. font 축약형에 따옴표 패밀리·generic 이름 금지
//       --font-sans·--font-heading을 다시 선언하면 1순위 한글 폰트를 판정하고, 새 패밀리 변수(--font-display 등)는 금지
//   (c) font-serif, font-[…] 임의 패밀리 금지. font-[var(--font-*)]·font-(--font-*)는 Tailwind가 font-weight로 만든다 — family-name: 표기를 쓴다
//   (d) 외부 폰트 호스트(구글·타입킷·눈누·jsdelivr pretendard 등)를 link·@import로 부르거나 @font-face src에 절대 URL 금지 — 자체 호스팅(assets/fonts)
// 결과: { rule, severity, line, message, code }

const { cssBlocks } = require('./type-floor')
const { HANGUL_FONT_PATTERN, firstFamily } = require('./token-source')

const OK_FAMILY = /^(?:var\(\s*--font-(?:sans|heading|mono)\s*\)|inherit|initial|unset|revert)$/
const GENERIC = /(?:^|[\s,])(?:serif|sans-serif|monospace|system-ui|cursive|fantasy|ui-serif|ui-sans-serif|ui-monospace)(?=$|[\s,])/
const FONT_HOST = /(?:fonts\.googleapis\.com|fonts\.gstatic\.com|use\.typekit\.net|p\.typekit\.net|fonts\.bunny\.net|fonts\.cdnfonts\.com|hangeul\.pstatic\.net|spoqa\.github\.io|(?:cdn|fastly)\.jsdelivr\.net\/gh\/(?:projectnoonnu|orioncactus|sun-typeface)|cdn\.jsdelivr\.net\/npm\/pretendard|cdnjs\.cloudflare\.com\/ajax\/libs\/pretendard|unpkg\.com\/pretendard)/i
const FAMILY_VAR_SKIP = /^--font-(?:sans|heading|mono|size|weight|feature|variation|optical|style|stretch|synthesis|kerning)(?:-|$)/

const MSG = {
  family: v => `font-family: ${v} — 서체는 var(--font-sans|heading|mono)로만 쓴다. 바꿀 서체는 tokens/brand.json(카탈로그 페어링)에서 정한다.`,
  shorthand: v => `font: ${v} — 축약형에 패밀리를 직접 쓰지 않는다. 패밀리 자리에 var(--font-sans|heading|mono)를 둔다.`,
  newVar: p => `새 서체 변수 ${p} — 서체 토큰은 --font-sans·--font-heading·--font-mono 셋이다. 차등 서체는 brand.json heading 슬롯을 쓴다.`,
  first: (p, f) => `${p}의 1순위 "${f}"가 카탈로그의 한글 폰트가 아니다 — 한글 폰트를 맨 앞에 둔다.`,
  serif: t => `${t} — Tailwind 기본 serif 스택은 한글 명조가 없다. 서체는 토큰으로 쓴다.`,
  weightBug: t => `${t} — Tailwind는 타입 표기 없는 font-[var(…)]를 font-weight로 만든다(서체가 조용히 안 바뀐다). font-[family-name:var(--font-*)]로 쓴다.`,
  arbitrary: t => `${t} — 임의 서체 금지. 서체는 var(--font-sans|heading|mono)로만 쓴다.`,
  host: u => `외부 폰트 호스트 ${u} — 폰트는 자체 호스팅한다(assets/fonts, 카탈로그 woff2). 외부 CDN은 가용성·개인정보·라이선스 확인이 안 된다.`
}

// @apply·class 토큰 → 문제 메시지(없으면 null)
function fontTokenProblem(raw) {
  const tok = raw.replace(/^(?:[\w-]+:|\[[^\]]*\]:)*/, '').replace(/^!/, '')
  if (tok === 'font-serif') return MSG.serif(raw)
  let m
  if ((m = tok.match(/^font-\[(.+)\]$/))) {
    const v = m[1]
    if (/^\d+$/.test(v) || v === 'inherit' || /^family-name:var\(--font-(?:sans|heading|mono)\)$/.test(v) || /^weight:/.test(v)) return null
    if (/^var\(--font-/.test(v)) return MSG.weightBug(raw)
    if (/^var\(/.test(v) || /^length:/.test(v)) return null
    return MSG.arbitrary(raw)
  }
  if ((m = tok.match(/^font-\((.+)\)$/))) {
    if (/^family-name:--font-(?:sans|heading|mono)$/.test(m[1])) return null
    if (/^--font-/.test(m[1])) return MSG.weightBug(raw)
  }
  if ((m = tok.match(/^\[font-family:(.+)\]$/)) && !OK_FAMILY.test(m[1].replace(/_/g, ' ').trim())) return MSG.family(m[1])
  return null
}

function declProblems(prop, value, sansStack) {
  const v = String(value).trim().replace(/\s*!important$/, '')
  const out = []
  if (prop === 'font-family' && !OK_FAMILY.test(v)) out.push(MSG.family(v))
  if (prop === 'font' && (/["']/.test(v) || GENERIC.test(v)) && !/var\(--font-/.test(v)) out.push(MSG.shorthand(v))
  if (prop === '--font-sans' || prop === '--font-heading') {
    const f = firstFamily(v, sansStack)
    if (!HANGUL_FONT_PATTERN.test(f) && !/^var\(--font-sans\)$/.test(v)) out.push(MSG.first(prop, f))
  } else if (/^--font-/.test(prop) && !FAMILY_VAR_SKIP.test(prop) && /["',]|serif|sans|mono/.test(v)) out.push(MSG.newVar(prop))
  return out
}

function scanCssFont(css, opts = {}) {
  const out = []
  for (const b of cssBlocks(css)) {
    const sel = b.selectors.filter(Boolean).join(', ')
    for (const d of b.decls) {
      const code = `${sel} { ${d.prop === '@apply' ? '@apply ' : d.prop + ': '}${d.value} }`.replace(/\s+/g, ' ').slice(0, 120)
      const msgs = d.prop === '@apply' ? d.value.split(/\s+/).filter(Boolean).map(fontTokenProblem).filter(Boolean) : declProblems(d.prop, d.value, opts.sansStack)
      for (const message of msgs) out.push({ rule: 'R-26', severity: 'error', line: d.line, message, code })
    }
  }
  // (d) @import·@font-face src의 외부 호스트·절대 URL
  const lines = String(css).split('\n')
  let inFace = false
  lines.forEach((line, i) => {
    if (/@font-face/.test(line)) inFace = true
    const imp = line.match(/@import\s+(?:url\()?\s*['"]?([^'")\s;]+)/)
    if (imp && FONT_HOST.test(imp[1])) out.push({ rule: 'R-26', severity: 'error', line: i + 1, message: MSG.host(imp[1]), code: line.trim().slice(0, 120) })
    for (const m of line.matchAll(/url\(\s*['"]?([^'")\s]+)/g)) {
      if (FONT_HOST.test(m[1]) || (inFace && /^(?:https?:)?\/\//i.test(m[1]))) out.push({ rule: 'R-26', severity: 'error', line: i + 1, message: MSG.host(m[1]), code: line.trim().slice(0, 120) })
    }
    if (inFace && /\}/.test(line)) inFace = false
  })
  const seen = new Set()
  return out.filter(f => { const k = `${f.line}|${f.message}`; if (seen.has(k)) return false; seen.add(k); return true })
}

function scanHtmlFont(html, opts = {}) {
  const T = require('./html-tree')
  const out = []
  T.walk(T.parseHtml(html), n => {
    if (n.tag === '#root') return
    if (n.tag === '#text') {
      if (n.rawText && n.parent.tag === 'style') for (const f of scanCssFont(n.text, opts)) out.push({ ...f, line: n.lineStart + f.line - 1 })
      return
    }
    const code = (n.src || '').replace(/\s+/g, ' ').slice(0, 120)
    const push = message => out.push({ rule: 'R-26', severity: 'error', line: n.line, message, code })
    if (n.tag === 'link' && n.attrs.href && FONT_HOST.test(n.attrs.href)) push(MSG.host(n.attrs.href))
    for (const tok of (n.attrs.class || '').split(/\s+/).filter(Boolean)) {
      const p = fontTokenProblem(tok)
      if (p) push(p)
    }
    for (const m of (n.attrs.style || '').split(';').map(s => s.match(/^\s*(font-family|font)\s*:\s*(.+?)\s*$/i)).filter(Boolean)) {
      for (const message of declProblems(m[1].toLowerCase(), m[2], opts.sansStack)) push(message)
    }
  })
  return out
}

module.exports = { scanCssFont, scanHtmlFont, fontTokenProblem, FONT_HOST }
