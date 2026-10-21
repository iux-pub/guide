// 모양·움직임 — KRDS Shape·Elevation과 자동 전환 금지 (안티슬롭 명세, 새 번호)
//   R-35 반경·그림자 — 반경은 KRDS 상한 1.2rem(12px). 원형(pill)은 지정 블록(contracts/art-direction.json shape.pillBlocks)과
//        정사각 원형(가로=세로·size-[x]·aspect-square)만. 그림자 blur는 KRDS Level-3의 2.4rem 이하(경고)
//   R-33 (CSS 부분) — 로고·배너·롤링 영역의 무한 애니메이션(마키) 금지. 스피너·스켈레톤 같은 로딩 표시는 R-22 소관이라 뺀다
// 마크업 부분(정지 토글·자동 재생 영상)은 page-rules.js가 본다.
// 결과: { rule, severity, line, message, code }

const { cssBlocks } = require('./type-floor')

const DEFAULT_PILL_BLOCKS = ['switch', 'avatar']

const toRem = raw => {
  if (/^-?0$/.test(String(raw).trim())) return { rem: 0 }
  const m = String(raw).trim().match(/^(-?\d*\.?\d+)(rem|px|%)$/i)
  if (!m) return null
  const u = m[2].toLowerCase()
  return u === 'px' ? { rem: +m[1] / 10 } : u === '%' ? { pct: +m[1] } : { rem: +m[1] }
}
const isPill = v => (v.pct !== undefined && v.pct >= 50) || (v.rem !== undefined && v.rem >= 100)
// 반경 값 하나 → 판정 대상 값 목록(단축 속성 '1rem 1rem 0 0'·'8px / 4px')
const radiusValues = value => String(value).replace(/\//g, ' ').trim().split(/\s+/).map(toRem).filter(Boolean)

// 토큰 → 반경 값({rem}|{pct}|'full'). 이름 스케일(rounded-lg)은 R-01·R-37 소관
function radiusFromToken(tok) {
  const base = tok.replace(/^(?:[\w-]+:)+/, '').replace(/^!/, '')
  if (/^rounded(?:-(?:t|r|b|l|tl|tr|br|bl|s|e|ss|se|es|ee))?-full$/.test(base)) return 'full'
  const m = base.match(/^rounded(?:-(?:t|r|b|l|tl|tr|br|bl|s|e|ss|se|es|ee))?-\[([^\]]+)\]$/) || base.match(/^\[border(?:-[a-z-]+)?-radius:([^\]]+)\]$/)
  return m ? m[1].replace(/_/g, ' ') : null
}
// 정사각 원형 — 같은 블록·같은 class 목록에 가로=세로 단서
function isSquare(text) {
  if (/(?:^|\s)(?:size-\[[^\]]+\]|aspect-square)(?=\s|$)|aspect-ratio\s*:\s*1(?:\s*\/\s*1)?\b/.test(text)) return true
  const w = text.match(/(?:^|\s)w-\[([^\]]+)\]/) || text.match(/(?:^|[;{\s])width\s*:\s*([^;}\s]+)/)
  const h = text.match(/(?:^|\s)h-\[([^\]]+)\]/) || text.match(/(?:^|[;{\s])height\s*:\s*([^;}\s]+)/)
  return !!(w && h && w[1] === h[1])
}
const blockOf = sel => {
  const m = String(sel).match(/\.([a-z][a-z0-9]*(?:-[a-z0-9]+)*)(?=__|--|[\s.:[>+~,]|$)/g)
  return m ? m.map(x => x.slice(1)) : []
}

function judgeRadius(values, ctx) {
  // values: 'full' 또는 {rem}|{pct} 목록. ctx: { blocks, square, pillBlocks }
  const pill = values === 'full' || values.some(isPill)
  if (pill) {
    if (ctx.square || ctx.blocks.some(b => ctx.pillBlocks.includes(b))) return null
    return { rule: 'R-35', severity: 'error', message: `완전 원형(pill) 반경은 ${ctx.pillBlocks.join('·')} 블록과 정사각 원형(가로=세로)만 쓴다 — 버튼·태그·카드는 KRDS 반경(최대 1.2rem)이다.` }
  }
  const max = Math.max(...values.map(v => (v.rem !== undefined ? v.rem : 0)))
  // 허용 블록 안의 큰 반경(2rem 이상 — switch 100px)은 원형 의도다
  if (max >= 2 && ctx.blocks.some(b => ctx.pillBlocks.includes(b))) return null
  if (max > 1.2) return { rule: 'R-35', severity: 'error', message: `반경 ${Math.round(max * 100) / 100}rem — KRDS Shape 상한은 1.2rem(12px)이다.` }
  return null
}

// box-shadow blur(세 번째 길이)가 2.4rem을 넘으면 경고
function shadowBlurs(value) {
  const out = []
  for (const part of String(value).split(/,(?![^(]*\))/)) {
    const lens = part.replace(/var\([^)]*\)|rgba?\([^)]*\)|#[0-9a-f]+|inset/gi, ' ').trim().split(/\s+/).map(toRem).filter(Boolean)
    if (lens.length >= 3 && lens[2].rem !== undefined) out.push(lens[2].rem)
  }
  return out
}

const MARQUEE_SELECTOR = /logo|partner|marquee|ticker|rolling|banner-zone|carousel|slider|swiper|slide/i
const LOADING_SELECTOR = /spinner|skeleton|loading|loader|shimmer|progress/i

function scanCssShape(css, { file = '', pillBlocks = DEFAULT_PILL_BLOCKS } = {}) {
  const out = []
  const fileBlock = (String(file).match(/([a-z0-9-]+)\.css$/i) || [])[1]
  for (const b of cssBlocks(css)) {
    const declText = b.decls.map(d => (d.prop === '@apply' ? ` ${d.value} ` : `${d.prop}:${d.value};`)).join(' ')
    const square = isSquare(declText)
    for (const d of b.decls) {
      const radii = []
      if (/^border(?:-[a-z-]+)?-radius$/.test(d.prop)) radii.push(radiusValues(d.value))
      if (d.prop === '@apply') {
        for (const tok of d.value.split(/\s+/)) {
          const r = radiusFromToken(tok)
          if (r) radii.push(r === 'full' ? 'full' : radiusValues(r))
        }
      }
      for (const sel of b.selectors) {
        const blocks = [...blockOf(sel), ...(fileBlock ? [fileBlock] : [])]
        for (const values of radii) {
          if (values !== 'full' && !values.length) continue
          const r = judgeRadius(values, { blocks, square, pillBlocks })
          if (r) out.push({ ...r, line: d.line, code: `${sel} { ${d.prop === '@apply' ? '@apply ' : d.prop + ': '}${d.value} }`.replace(/\s+/g, ' ').slice(0, 120) })
        }
        if (d.prop === 'box-shadow' || d.prop === '@apply') {
          const shadowValues = d.prop === 'box-shadow' ? [d.value] : d.value.split(/\s+/).map(t => (t.match(/^(?:[\w-]+:)*shadow-\[([^\]]+)\]$/) || [])[1]).filter(Boolean).map(v => v.replace(/_/g, ' '))
          const blur = Math.max(0, ...shadowValues.flatMap(shadowBlurs))
          if (blur > 2.4) out.push({ rule: 'R-35', severity: 'warn', line: d.line, message: `그림자 blur ${Math.round(blur * 100) / 100}rem — KRDS Elevation은 Level-3도 2.4rem이다. 검정 알파 3단계 안에서 쓴다.`, code: `${sel} { ${d.value} }`.replace(/\s+/g, ' ').slice(0, 120) })
        }
        // R-33 — 마키·롤링 영역의 무한 애니메이션
        const anim = d.prop === 'animation' || d.prop === 'animation-iteration-count' ? d.value : d.prop === '@apply' ? d.value.split(/\s+/).filter(t => /^(?:[\w-]+:)*(?:\[animation:|animate-\[)/.test(t)).join(' ') : ''
        if (anim && /\binfinite\b/.test(anim.replace(/_/g, ' ')) && MARQUEE_SELECTOR.test(sel) && !LOADING_SELECTOR.test(sel)) {
          out.push({ rule: 'R-33', severity: 'error', line: d.line, message: '로고·배너·롤링 영역의 무한 애니메이션(마키) — 자동으로 계속 움직이는 띠는 쓰지 않는다(KRDS 자동 전환 정지·WCAG 2.2.2). 정지 버튼이 있는 캐러셀이나 정적 목록으로 둔다.', code: `${sel} { ${d.value} }`.replace(/\s+/g, ' ').slice(0, 120) })
        }
      }
    }
  }
  const seen = new Set()
  return out.filter(f => { const k = `${f.rule}|${f.line}|${f.message}`; if (seen.has(k)) return false; seen.add(k); return true })
}

// HTML class 목록의 반경(R-35) — 블록은 class의 블록 이름들
function scanClassShape(classValue, { pillBlocks = DEFAULT_PILL_BLOCKS } = {}) {
  const tokens = String(classValue).split(/\s+/).filter(Boolean)
  const blocks = tokens.filter(t => /^[a-z][a-z0-9-]*$/.test(t) && !/^(?:rounded|w|h|p|m|text|bg|flex|grid|inline|block|items|justify|gap|border|shadow)(?:-|$)/.test(t))
  const square = isSquare(` ${classValue} `)
  const out = []
  for (const tok of tokens) {
    const r = radiusFromToken(tok)
    if (!r) continue
    const values = r === 'full' ? 'full' : radiusValues(r)
    if (values !== 'full' && !values.length) continue
    const f = judgeRadius(values, { blocks, square, pillBlocks })
    if (f) out.push(f)
  }
  return out
}

// HTML 원문 → R-35(class·<style>)·R-33(<style>의 마키)
function scanHtmlShape(html, opts = {}) {
  const T = require('./html-tree')
  const out = []
  T.walk(T.parseHtml(html), n => {
    if (n.tag === '#root') return
    if (n.tag === '#text') {
      if (n.rawText && n.parent.tag === 'style') for (const f of scanCssShape(n.text, opts)) out.push({ ...f, line: n.lineStart + f.line - 1 })
      return
    }
    if (n.attrs.class) for (const f of scanClassShape(n.attrs.class, opts)) out.push({ ...f, line: n.line, code: (n.src || '').replace(/\s+/g, ' ').slice(0, 120) })
  })
  return out
}

module.exports = { scanCssShape, scanClassShape, scanHtmlShape, DEFAULT_PILL_BLOCKS }
