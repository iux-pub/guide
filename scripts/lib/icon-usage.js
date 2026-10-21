// 아이콘 사용처 (R-27 확장) — 아이콘은 대장(contracts/icon-codepoints.json)에 있는 이름만 스프라이트 <use>나 icon-font로 쓴다
//   (1) <use href>: 외부 URL·대장 스프라이트(assets/icons/sprite[-slim|-bold|-fill].svg) 밖 파일 오류,
//       조각 이름이 그 스프라이트의 symbol에 없으면 오류(표정 보유까지 확인). 같은 문서의 #id는 그 문서 <symbol>이면서 대장 이름일 때만
//   (1b) icon-font: 이름 클래스 정확히 하나, 표정 클래스 하나 이하, 그 이름이 해당 표정을 가져야 한다(없는 수식어는 R-29가 본다)
//   (2) 아이콘(svg.icon·use가 있는 svg·.icon-font)은 자신이나 조상에 aria-hidden="true" — svg는 role="img"와 이름이 있어도 된다
//   (3) use 없이 path 등으로 직접 그린 인라인 svg 경고(카탈로그 밖 SVG) — 로고·차트·지도·엠블럼, 이름 있는 큰 그림은 면제
//   (4) 같은 목록·내비게이션·툴바 안의 형제 아이콘이 slim·regular·bold 표정을 섞으면 경고(fill은 선택 상태라 허용)
// 결과: { rule, severity, line, message, code }

const fs = require('fs')
const path = require('path')
const T = require('./html-tree')

const VARIANTS = ['slim', 'bold', 'fill']

// 대장·스프라이트·크기 수식어를 읽는다. 자산이 없으면(오래된 파생 프로젝트) null
function loadIconCatalog(root) {
  try {
    const ledger = JSON.parse(fs.readFileSync(path.join(root, 'contracts', 'icon-codepoints.json'), 'utf8'))
    const names = new Map(Object.entries(ledger.icons || {}).map(([name, v]) => [name, new Set(v.variants || [])]))
    const sprites = new Map()
    for (const file of ['sprite.svg', 'sprite-slim.svg', 'sprite-bold.svg', 'sprite-fill.svg']) {
      const p = path.join(root, 'assets', 'icons', file)
      if (fs.existsSync(p)) sprites.set(file, new Set([...fs.readFileSync(p, 'utf8').matchAll(/<symbol\b[^>]*\bid="([^"]+)"/g)].map(m => m[1])))
    }
    let sizes = new Set()
    const css = path.join(root, 'assets', 'icons', 'icons.css')
    if (fs.existsSync(css)) sizes = new Set([...fs.readFileSync(css, 'utf8').matchAll(/\.icon-font--([\w-]+)/g)].map(m => m[1]).filter(x => !names.has(x) && !VARIANTS.includes(x)))
    return { names, sprites, sizes }
  } catch {
    return null
  }
}

const code = n => (n.src || '').replace(/\s+/g, ' ').slice(0, 120)
const isSvgIcon = n => n.tag === 'svg' && (T.classesOf(n).includes('icon') || !!T.find(n, x => x.tag === 'use'))
const isFontIcon = n => n.tag !== 'svg' && T.classesOf(n).includes('icon-font')
const hiddenByAria = n => [n, ...T.ancestors(n)].some(a => a.attrs?.['aria-hidden'] === 'true')
const SHAPE_TAGS = new Set(['path', 'circle', 'rect', 'polygon', 'polyline', 'line', 'ellipse'])
const EXEMPT_TOKEN = /^(?:logo|chart|map|emblem)$/
const exemptByClass = n => [n, ...T.ancestors(n).slice(0, 2)].some(a => T.classesOf(a).some(c => c.split(/[_-]+/).some(t => EXEMPT_TOKEN.test(t))))

function svgName(root, n) {
  if (n.attrs['aria-label']) return n.attrs['aria-label'].trim()
  if (n.attrs['aria-labelledby']) return n.attrs['aria-labelledby'].split(/\s+/).map(id => T.find(root, x => x.attrs?.id === id)).filter(Boolean).map(x => T.textOf(x)).join(' ').trim()
  const title = (n.children || []).find(c => c.tag === 'title')
  return title ? T.textOf(title).trim() : ''
}

// 아이콘 하나의 표정 — slim·bold·fill, 없으면 regular
function variantOf(n) {
  if (isFontIcon(n)) return VARIANTS.find(v => T.classesOf(n).includes(`icon-font--${v}`)) || 'regular'
  const use = T.find(n, x => x.tag === 'use')
  const href = use ? use.attrs.href || use.attrs['xlink:href'] || '' : ''
  const m = href.match(/sprite-(slim|bold|fill)\.svg/)
  return m ? m[1] : 'regular'
}

function iconFindings(html, catalog, opts = {}) {
  const out = []
  const root = T.parseHtml(html)
  const push = (severity, n, message) => out.push({ rule: 'R-27', severity, line: n.line, message, code: code(n) })
  const localSymbols = new Set()
  T.walk(root, n => { if (n.tag === 'symbol' && n.attrs.id) localSymbols.add(n.attrs.id) })

  T.walk(root, n => {
    if (n.tag === '#text' || n.tag === '#root') return
    // (1) use href
    if (n.tag === 'use' && catalog) {
      const href = (n.attrs.href || n.attrs['xlink:href'] || '').trim()
      if (!href || /\{\{|\{%/.test(href)) return
      if (/^(?:https?:)?\/\//i.test(href)) return push('error', n, `외부 스프라이트 ${href} — 아이콘은 대장 스프라이트(assets/icons/sprite*.svg)에서 쓴다.`)
      const [file, frag] = href.split('#')
      if (!file) {
        if (!localSymbols.has(frag) || !catalog.names.has(frag)) push('error', n, `<use href="#${frag}"> — 같은 문서의 대장 아이콘 <symbol>이 아니다. assets/icons/sprite.svg#이름을 쓴다.`)
        return
      }
      const base = file.split('/').pop()
      if (!/^sprite(?:-(?:slim|bold|fill))?\.svg$/.test(base)) return push('error', n, `대장 밖 스프라이트 ${file} — 아이콘은 assets/icons/sprite[-slim|-bold|-fill].svg에서 쓴다.`)
      const ids = catalog.sprites.get(base)
      if (ids && frag && !ids.has(frag)) push('error', n, catalog.names.has(frag) ? `${frag}에는 ${base.replace(/^sprite-?|\.svg$/g, '') || 'regular'} 표정이 없다 — 대장(contracts/icon-codepoints.json) variants를 확인한다.` : `대장에 없는 아이콘 "${frag}" — find_icon으로 카탈로그에서 찾아 채택한다(get_rules R-27).`)
      return
    }
    // (1b) icon-font 클래스 조합
    if (isFontIcon(n) && catalog) {
      const mods = T.classesOf(n).filter(c => c.startsWith('icon-font--')).map(c => c.slice('icon-font--'.length))
      const nameMods = mods.filter(m => catalog.names.has(m))
      const variantMods = mods.filter(m => VARIANTS.includes(m))
      if (nameMods.length !== 1) push('error', n, `icon-font에 아이콘 이름 클래스가 ${nameMods.length}개 — 정확히 하나(icon-font--이름)를 둔다.`)
      else if (variantMods.length > 1) push('error', n, `icon-font 표정 클래스가 ${variantMods.length}개(${variantMods.join('·')}) — 하나만 둔다.`)
      else if (variantMods.length === 1 && !catalog.names.get(nameMods[0]).has(variantMods[0])) push('error', n, `${nameMods[0]}에는 ${variantMods[0]} 표정이 없다 — 대장 variants를 확인한다.`)
    }
    // (2) aria-hidden
    if (isFontIcon(n) && !hiddenByAria(n)) push('error', n, 'icon-font 아이콘에 aria-hidden="true"가 없다 — 글리프 문자를 스크린 리더가 읽는다. 뜻은 옆 텍스트나 sr-only로 준다.')
    if (isSvgIcon(n) && !hiddenByAria(n) && !(n.attrs.role === 'img' && svgName(root, n))) push('error', n, '아이콘 svg에 aria-hidden="true"가 없다 — 장식이면 aria-hidden, 뜻이 있으면 role="img"와 aria-label을 준다.')
    // (3) 직접 그린 인라인 svg
    if (opts.inlineSvg && n.tag === 'svg' && !T.find(n, x => x.tag === 'use')) {
      const sheet = (n.children || []).filter(c => c.tag !== '#text').every(c => c.tag === 'symbol' || c.tag === 'defs')
      const drawn = !!T.find(n, x => SHAPE_TAGS.has(x.tag) && !T.ancestors(x).some(a => a.tag === 'symbol'))
      const vb = (n.attrs.viewBox || n.attrs.viewbox || '').trim().split(/[\s,]+/).map(Number)
      const smallSquare = vb.length === 4 && vb[2] === vb[3] && vb[2] <= 48
      const named = n.attrs.role === 'img' && svgName(root, n)
      if (!sheet && drawn && !exemptByClass(n) && !(named && !smallSquare)) push('warn', n, '직접 그린 인라인 svg — 아이콘은 대장 스프라이트(<use href="assets/icons/sprite.svg#이름">)로 쓴다. 없는 아이콘은 find_icon으로 채택한다.')
    }
  })

  // (4) 같은 목록·내비게이션·툴바 안의 표정 혼용
  const GROUP = a => ['ul', 'ol', 'nav', 'menu'].includes(a.tag) || /^(?:toolbar|tablist|menubar)$/.test(a.attrs?.role || '')
  const groups = new Map()
  T.walk(root, n => {
    if (n.tag === '#text' || n.tag === '#root' || !(isSvgIcon(n) || isFontIcon(n))) return
    const g = T.ancestors(n).find(GROUP)
    if (!g) return
    if (!groups.has(g)) groups.set(g, new Map())
    const v = variantOf(n)
    if (v !== 'fill' && !groups.get(g).has(v)) groups.get(g).set(v, n)
  })
  for (const [g, vs] of groups) {
    if (vs.size >= 2) out.push({ rule: 'R-27', severity: 'warn', line: g.line, message: `한 묶음 안에서 아이콘 표정(${[...vs.keys()].join('·')})을 섞었다 — 같은 목록·메뉴는 한 표정으로 맞춘다(fill은 선택 상태 표시용).`, code: code(g) })
  }
  return out
}

module.exports = { loadIconCatalog, iconFindings }
