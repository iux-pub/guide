// 한국형 페이지 골격 규칙 — 납품 페이지(page 계약 대상)의 KRDS 필수 골격을 본다 (안티슬롭 명세, 새 번호)
//   R-32 푸터 개인정보 처리방침 — KRDS 명칭의 링크가 실제 목적지와 함께 있어야 한다. 옛 명칭 금지,
//        강조(site-footer__link--important)는 그 링크에만, 커머스는 이용약관·사업자 정보(경고)
//   R-40 공공 통합검색 — public-service·public-institution 페이지는 헤더에 통합검색 진입을 둔다(KRDS 검색 [필수])
//   R-41 서브 골격 — 브레드크럼·사이드 메뉴는 본문 바로가기 목적지 밖에 두고(KRDS component_03_01),
//        main 안 첫 제목은 h1이다
// 메인 첫 섹션 과업 진입·마케팅 섹션(R-40 (2)(3)), 깊이별 브레드크럼·서브 히어로(R-41 (1)(4))는
// 페이지 유형(pageType, K-16)이 선언된 뒤에 켠다 — 지금은 판정 근거가 없다.
// 결과: { rule, severity, line, message, code }

const T = require('./html-tree')

const norm = T.norm
const PUBLIC = new Set(['public-service', 'public-institution'])
const PRIVACY = /^개인정보\s?처리방침(?:\s*\(?\s*새\s?창(?:\s?열림)?\s*\)?)?$/
const OLD_PRIVACY = /개인정보\s?취급방침|개인정보\s?보호정책|privacy\s+policy/i
const SEARCH_NAME = /(?:통합\s*)?검색|^search$/i

// 실제 목적지가 없는 링크 — 빈 값·#·#none·#;·javascript:
const isDeadHref = href => href === undefined || /^\s*(?:#?|#none|#;|javascript:.*)\s*$/i.test(href)
const hasClass = (n, c) => T.classesOf(n).includes(c)
const els = (root, pred) => {
  const out = []
  T.walk(root, n => { if (n.tag !== '#text' && n.tag !== '#root' && pred(n)) out.push(n) })
  return out
}
function langOf(el) {
  for (const x of [el, ...T.ancestors(el)]) if (x.attrs && x.attrs.lang) return x.attrs.lang
  return null
}
const isKo = el => { const l = langOf(el); return !l || /^ko\b/i.test(l) }
// 접근 가능한 이름 — aria-label, 없으면 aria-hidden만 뺀 글(sr-only 포함)
const accessibleName = n => norm(n.attrs['aria-label'] || T.textOf(n, { accessible: true }))
const inside = (n, anc) => T.ancestors(n).includes(anc)
// 숨은 영역(dialog·hidden·template·aria-hidden) 안의 제목은 페이지 제목 순서가 아니다
const inHiddenRegion = n => [n, ...T.ancestors(n)].some(a => a.tag === 'dialog' || a.tag === 'template' || a.attrs?.role === 'dialog' || 'hidden' in (a.attrs || {}) || a.attrs?.['aria-hidden'] === 'true')

function r32(root, ctx, out) {
  const footer = T.find(root, n => n.tag === 'footer' && n.attrs?.id === 'footer')
  if (!footer) return // footer 자체는 R-15가 본다
  const links = els(footer, n => n.tag === 'a')
  if (isKo(footer)) {
    const privacy = links.filter(a => PRIVACY.test(norm(T.textOf(a, { visible: true }))))
    if (!privacy.length) {
      out.push({ rule: 'R-32', severity: 'error', line: footer.line, message: "푸터에 '개인정보 처리방침' 링크가 없다 — KRDS 필수 명칭으로 정책 링크를 둔다(footer 스니펫 소형 참고).", code: '<footer id="footer">' })
    } else if (privacy.every(a => isDeadHref(a.attrs.href))) {
      out.push({ rule: 'R-32', severity: 'error', line: privacy[0].line, message: "'개인정보 처리방침' 링크에 실제 주소가 없다(#·javascript:) — 처리방침 페이지 주소를 쓴다.", code: norm(privacy[0].src || '').slice(0, 120) })
    }
    for (const a of links) {
      const text = norm(T.textOf(a, { visible: true }))
      if (OLD_PRIVACY.test(text)) out.push({ rule: 'R-32', severity: 'error', line: a.line, message: `옛 명칭 "${text}" — KRDS 명칭 '개인정보 처리방침'을 쓴다.`, code: text })
    }
  }
  for (const a of links) {
    const text = norm(T.textOf(a, { visible: true }))
    if (hasClass(a, 'site-footer__link--important') && !PRIVACY.test(text)) {
      out.push({ rule: 'R-32', severity: 'warn', line: a.line, message: `강조(site-footer__link--important)는 '개인정보 처리방침' 링크에만 둔다 — "${text}".`, code: text })
    }
  }
  if (ctx.profile === 'commerce-reservation') {
    const text = norm(T.textOf(footer))
    const missing = [
      ['상호', /상호|회사명|법인명/],
      ['대표자', /대표(?:자|이사)?/],
      ['사업자등록번호', /사업자\s?(?:등록)?\s?번호/],
      ['통신판매업 신고번호', /통신판매(?:업)?\s?신고/]
    ].filter(([, re]) => !re.test(text)).map(([name]) => name)
    if (!links.some(a => /이용\s?약관/.test(norm(T.textOf(a))))) missing.unshift('이용약관 링크')
    if (missing.length) out.push({ rule: 'R-32', severity: 'warn', line: footer.line, message: `전자상거래가 있으면 푸터에 이용약관과 사업자 정보를 둔다(KRDS) — 없음: ${missing.join(', ')}.`, code: '<footer id="footer">' })
  }
}

function r40(root, ctx, out) {
  if (!PUBLIC.has(ctx.profile)) return
  const header = T.find(root, n => n.tag === 'header' && n.attrs?.id === 'header')
  if (!header) return // 팝업 창·조각처럼 헤더가 없는 문서는 대상이 아니다
  const found = T.find(header, n => n.tag !== '#text' && (
    n.tag === 'search' ||
    (n.tag === 'form' && n.attrs.role === 'search') ||
    (n.tag === 'input' && /^search$/i.test(n.attrs.type || '')) ||
    ((n.tag === 'button' || n.tag === 'a') && SEARCH_NAME.test(accessibleName(n)))
  ))
  if (!found) out.push({ rule: 'R-40', severity: 'error', line: header.line, message: '공공 화면은 모든 페이지 헤더에 통합검색 진입을 둔다(KRDS 검색 [필수]) — <form role="search">나 이름이 \'통합검색\'인 버튼.', code: '<header id="header">' })
}

function r41(root, ctx, out) {
  const main = T.find(root, n => n.tag === 'main')
  if (!main) return
  // 본문 바로가기 목적지 — skip 링크 href가 가리키는 요소, 없으면 main
  const skip = T.find(root, n => n.tag === 'a' && hasClass(n, 'skip-to-content'))
  const id = skip && /^#(.+)$/.exec(skip.attrs.href || '')?.[1]
  const target = (id && T.find(root, n => n.attrs?.id === id)) || main
  for (const nav of els(root, n => hasClass(n, 'breadcrumb') || hasClass(n, 'side-navigation'))) {
    if (nav === target || inside(nav, target)) {
      out.push({ rule: 'R-41', severity: 'error', line: nav.line, message: `${hasClass(nav, 'breadcrumb') ? '브레드크럼' : '사이드 메뉴'}이 본문 바로가기 목적지(#${target.attrs.id || 'main'}) 안에 있다 — KRDS는 반복 영역을 목적지 밖에 두라고 한다. main의 형제로 옮긴다.`, code: norm(nav.src || '').slice(0, 120) })
    }
  }
  const headings = els(main, n => /^h[1-6]$/.test(n.tag) && !inHiddenRegion(n))
  if (!headings.length || headings[0].tag !== 'h1') {
    const first = headings[0]
    out.push({ rule: 'R-41', severity: 'error', line: first ? first.line : main.line, message: first ? `main의 첫 제목이 <${first.tag}>다 — 페이지 제목 h1을 main 안 맨 앞 제목으로 둔다.` : 'main 안에 h1이 없다 — 페이지 제목은 main 안 h1이다.', code: first ? norm(T.textOf(first)).slice(0, 120) : '<main>' })
  }
}

// ctx: { profile }
function scanPageRules(html, ctx = {}) {
  const root = T.parseHtml(html)
  const out = []
  r32(root, ctx, out)
  r40(root, ctx, out)
  r41(root, ctx, out)
  return out.sort((a, b) => (a.line || 0) - (b.line || 0))
}

module.exports = { scanPageRules, isDeadHref }
