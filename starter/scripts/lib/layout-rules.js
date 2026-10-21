// 모바일 우선 — R-48 (안티슬롭 명세, 새 번호)
//   (1) 접두 없는(모바일 기본) 고정 폭 w-[N]·min-w-[N]·[width:N]·[min-width:N]·CSS width·min-width가 36rem(360px)을 넘으면 오류.
//       tablet:·laptop:·pc:·print: 접두와 min-width 768 이상 @media 안은 뺀다(mobile:·max-*·상태 접두는 본다).
//       같은 요소의 max-w-full·max-w-[≤100%], 숨김(hidden + 반응형 표시), 가로 스크롤 래퍼(.table-wrap·overflow-x-auto…)·
//       데스크톱 전용 메뉴(.site-header__nav·.main-menu) 아래는 뺀다
//   (2) 모바일 기본 열 없이 grid-cols-3 이상(같은 요소에 tablet:·laptop:·pc: grid-cols가 없을 때)·
//       @media 밖 grid-template-columns: repeat(3 이상)은 경고
// 결과: { rule, severity, line, message, code }

const T = require('./html-tree')
const { cssBlocks } = require('./type-floor')

const WIDE_PREFIX = /^(?:tablet|laptop|pc|print):/
const LIMIT_REM = 36
const toRem = raw => {
  const m = String(raw).trim().match(/^(\d*\.?\d+)(rem|px)$/i)
  return m ? (m[2].toLowerCase() === 'px' ? +m[1] / 10 : +m[1]) : null
}
const variantsOf = tok => (tok.match(/^((?:[\w-]+:)*)/) || ['', ''])[1]
const baseOf = tok => tok.replace(/^(?:[\w-]+:)+/, '').replace(/^!/, '')
const isWideVariant = tok => variantsOf(tok).split(':').filter(Boolean).some(v => WIDE_PREFIX.test(`${v}:`))

// 토큰 → 폭 rem(고정 폭이 아니면 null)
function widthOfToken(tok) {
  if (isWideVariant(tok)) return null
  const b = baseOf(tok)
  const m = b.match(/^(?:min-)?w-\[([^\]]+)\]$/) || b.match(/^\[(?:min-)?width:([^\]]+)\]$/)
  return m ? toRem(m[1]) : null
}
const capsWidth = tokens => tokens.some(t => !isWideVariant(t) && /^max-w-(?:full|\[(?:100%|\d{1,2}(?:\.\d+)?%|calc\(100vw[^\]]*)\])$/.test(baseOf(t)))
const SCROLL_WRAP = /(?:^|\s)(?:table-wrap|overflow-x-auto|overflow-auto|overflow-x-scroll|overflow-scroll)(?:\s|$)/
const DESKTOP_ONLY = /(?:^|\s)(?:site-header__nav|main-menu)(?:\s|$|__)/
const hiddenMobile = cls => /(?:^|\s)hidden(?:\s|$)/.test(cls) && /(?:^|\s)(?:tablet|laptop|pc):(?:block|flex|grid|inline|inline-flex|inline-block|table|contents)(?:\s|$)/.test(cls)

const msgWidth = rem => `고정 폭 ${Math.round(rem * 100) / 100}rem(${Math.round(rem * 10)}px) — 모바일 360px을 넘는다. 기본은 w-full·max-w-[…]로 두고 넓은 폭은 tablet:·pc: 접두로 준다(모바일 우선).`

function scanHtmlLayout(html) {
  const out = []
  T.walk(T.parseHtml(html), n => {
    if (n.tag === '#root' || n.tag === '#text') return
    const cls = n.attrs.class || ''
    if (!cls) return
    const tokens = cls.split(/\s+/).filter(Boolean)
    const chain = [n, ...T.ancestors(n)]
    const exempt = capsWidth(tokens) || chain.some(a => hiddenMobile(a.attrs?.class || '') || SCROLL_WRAP.test(a.attrs?.class || '') || DESKTOP_ONLY.test(a.attrs?.class || ''))
    if (!exempt) {
      const w = Math.max(0, ...tokens.map(widthOfToken).filter(x => x !== null))
      if (w > LIMIT_REM) out.push({ rule: 'R-48', severity: 'error', line: n.line, message: msgWidth(w), code: (n.src || '').replace(/\s+/g, ' ').slice(0, 120) })
    }
    const cols = tokens.filter(t => !variantsOf(t) && /^grid-cols-(\d+)$/.test(t)).map(t => +t.match(/\d+/)[0])
    const responsive = tokens.some(t => isWideVariant(t) && /grid-cols-/.test(t))
    if (cols.some(c => c >= 3) && !responsive && !chain.some(a => hiddenMobile(a.attrs?.class || ''))) {
      out.push({ rule: 'R-48', severity: 'warn', line: n.line, message: `모바일 기본 ${Math.max(...cols)}열 그리드 — 360px에서 칸이 너무 좁다. 기본 1~2열(grid-cols-1)로 두고 tablet:·pc:에서 늘린다.`, code: (n.src || '').replace(/\s+/g, ' ').slice(0, 120) })
    }
  })
  return out
}

// CSS — min-width 768 이상 @media 밖의 width·min-width·@apply 폭, grid-template-columns repeat(3+)
const wideMedia = media => (String(media).match(/min-width\s*:\s*(\d+)px/g) || []).some(m => +m.match(/\d+/)[0] >= 768)
function scanCssLayout(css) {
  const out = []
  for (const b of cssBlocks(css)) {
    const selExempt = b.selectors.every(s => /\btable\b|table-wrap|site-header__nav|main-menu/.test(s))
    if (selExempt) continue
    const capped = b.decls.some(d => (d.prop === 'max-width' && /^(?:100%|\d{1,2}%|calc\(100vw)/.test(d.value)) || (d.prop === '@apply' && capsWidth(d.value.split(/\s+/))))
    for (const d of b.decls) {
      if (wideMedia(d.media)) continue
      let w = null
      if ((d.prop === 'width' || d.prop === 'min-width')) w = toRem(d.value)
      if (d.prop === '@apply') w = Math.max(0, ...d.value.split(/\s+/).map(widthOfToken).filter(x => x !== null)) || null
      const sel = b.selectors[0]
      if (w !== null && w > LIMIT_REM && !capped) out.push({ rule: 'R-48', severity: 'error', line: d.line, message: msgWidth(w), code: `${sel} { ${d.prop === '@apply' ? '@apply ' : d.prop + ': '}${d.value} }`.replace(/\s+/g, ' ').slice(0, 120) })
      if (d.prop === 'grid-template-columns' && !d.media) {
        const m = d.value.match(/repeat\(\s*(\d+)\s*,/)
        if (m && +m[1] >= 3) out.push({ rule: 'R-48', severity: 'warn', line: d.line, message: `모바일 기본 ${m[1]}열 그리드 — 기본 1~2열로 두고 @media(min-width: 768px) 이상에서 늘린다.`, code: `${sel} { grid-template-columns: ${d.value} }`.slice(0, 120) })
      }
    }
  }
  return out
}

module.exports = { scanHtmlLayout, scanCssLayout }
