// 한국형 페이지 골격 규칙 — 납품 페이지(page 계약 대상)의 KRDS 필수 골격을 본다 (안티슬롭 명세, 새 번호)
//   R-32 푸터 개인정보 처리방침 — KRDS 명칭의 링크가 실제 목적지와 함께 있어야 한다. 옛 명칭 금지,
//        강조(site-footer__link--important)는 그 링크에만, 커머스는 이용약관·사업자 정보(경고)
//   R-40 공공 통합검색 — public-service·public-institution 페이지는 헤더에 통합검색 진입을 둔다(KRDS 검색 [필수])
//   R-41 서브 골격 — 브레드크럼·사이드 메뉴는 본문 바로가기 목적지 밖에 두고(KRDS component_03_01),
//        main 안 첫 제목은 h1이다
// 페이지 유형(pageType, K-16 — infoux.json pageTypes)이 선언된 페이지에만:
//   R-40 공공 메인 — 첫 콘텐츠 2개 섹션 안에 과업 진입(경고), 마케팅 템플릿 섹션 금지(오류)
//   R-41 서브 — 3단계 이상 브레드크럼(공공 오류·그 밖 경고), 첫 섹션 비주얼 히어로 금지
// 선언이 없으면 이 판정은 하지 않는다(경로로 유형·깊이를 추측하지 않는다).
// ctx: { profile, pageType: { type, depth } | null }
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

// R-40 (2)(3) — 공공 메인(pageType main): 첫 콘텐츠 2개 섹션 안의 과업 진입, 마케팅 템플릿 섹션 금지
const MARKETING_HEADING = /(features?|testimonials?|pricing|why\s?us|고객\s?후기|이용(?:자)?\s?후기|가격\s?플랜|요금\s?플랜|핵심\s?기능|함께하는\s?파트너)/i
const TASK_SECTION = /(?:^|\s)section--(?:notice|search|shortcut)(?:\s|$)/
const liveLinks = n => els(n, x => x.tag === 'a' && !isDeadHref(x.attrs.href))
const isSearchForm = n => !!T.find(n, x => x.tag !== '#text' && (x.tag === 'search' || (x.tag === 'form' && x.attrs.role === 'search') || (x.tag === 'input' && /^search$/i.test(x.attrs.type || ''))))
function hasTaskEntry(section) {
  if (isSearchForm(section)) return true
  if (TASK_SECTION.test(section.attrs.class || '') && liveLinks(section).length >= 3) return true
  // 공지 — 목록·표에 링크 3개와 날짜 3개(time 또는 YYYY.MM.DD)
  const DATE = /\d{4}[.-]\s?\d{1,2}[.-]\s?\d{1,2}/
  for (const list of els(section, x => ['ul', 'ol', 'table'].includes(x.tag))) {
    const dates = els(list, x => x.tag === 'time').length || (norm(T.textOf(list)).match(new RegExp(DATE.source, 'g')) || []).length
    if (liveLinks(list).length >= 3 && dates >= 3) return true
  }
  // 자주 찾는 서비스 — 이름 있는 nav나 목록의 링크 4개 이상(카드 안 링크는 치지 않는다)
  for (const group of els(section, x => x.tag === 'nav' || x.tag === 'ul' || x.tag === 'ol')) {
    const named = group.tag !== 'nav' || group.attrs['aria-label'] || group.attrs['aria-labelledby']
    const links = liveLinks(group).filter(a => !T.ancestors(a).some(p => hasClass(p, 'card') || T.classesOf(p).some(c => c.startsWith('card--'))))
    if (named && links.length >= 4) return true
  }
  return false
}
function r40Main(root, ctx, out) {
  if (!PUBLIC.has(ctx.profile) || ctx.pageType?.type !== 'main') return
  const main = T.find(root, n => n.tag === 'main')
  if (!main) return
  const sections = (main.children || []).filter(c => c.tag === 'section')
  const isIntro = s => /(?:^|\s)(?:section--intro|hero-bleed)(?:\s|$)/.test(s.attrs.class || '')
  // 도입부 안에 검색을 결합했으면 그것도 과업 진입이다
  const introWithTask = sections.filter(isIntro).some(isSearchForm)
  const firstTwo = sections.filter(s => !isIntro(s)).slice(0, 2)
  if (!introWithTask && !firstTwo.some(hasTaskEntry)) {
    out.push({ rule: 'R-40', severity: 'warn', line: (firstTwo[0] || main).line, message: '공공 메인은 첫 콘텐츠 2개 섹션 안에 과업 진입(검색·공지 목록·자주 찾는 서비스)을 둔다 — KRDS 방문 패턴 [필수] "시급하거나 중요한 정보를 빠르게".', code: '<main>' })
  }
  for (const h of els(main, x => /^h[1-3]$/.test(x.tag))) {
    const text = norm(T.textOf(h))
    const m = text.match(MARKETING_HEADING)
    if (m) out.push({ rule: 'R-40', severity: 'error', line: h.line, message: `공공 메인에 마케팅 템플릿 섹션 "${text}" — 후기·요금 플랜·핵심 기능 묶음은 공공 메인의 과업이 아니다. 공지·서비스 바로가기로 바꾼다.`, code: text })
  }
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
  // (1)(4) — 서브 페이지(선언된 pageType이 main·error가 아닌 것)
  const pt = ctx.pageType
  if (pt && pt.type !== 'main' && pt.type !== 'error') {
    const strict = PUBLIC.has(ctx.profile)
    if (pt.depth >= 3) {
      const crumb = T.find(root, n => n.tag === 'nav' && hasClass(n, 'breadcrumb'))
      const ok = crumb && (crumb.attrs['aria-label'] || crumb.attrs['aria-labelledby']) && T.find(crumb, n => n.attrs?.['aria-current'] === 'page')
      if (!ok) out.push({ rule: 'R-41', severity: strict ? 'error' : 'warn', line: (crumb || main).line, message: `${pt.depth}단계 서브 페이지에 브레드크럼이 없다 — nav.breadcrumb[aria-label]에 현재 항목 aria-current="page"를 둔다(KRDS: 3단계 이상).`, code: crumb ? norm(crumb.src || '').slice(0, 120) : '<main>' })
    }
    const first = (main.children || []).find(c => c.tag === 'section')
    if (first) {
      const cls = first.attrs.class || ''
      if (/(?:^|\s)hero-bleed(?:\s|$)/.test(cls)) {
        out.push({ rule: 'R-41', severity: strict || ctx.profile === 'cms-admin' ? 'error' : 'warn', line: first.line, message: '서브 페이지 첫 섹션을 비주얼 히어로(hero-bleed)로 쓰지 않는다 — hero-bleed는 메인 최상단 도입 전용이다. 타이틀 밴드와 h1로 시작한다.', code: norm(first.src || '').slice(0, 120) })
      } else if (/(?:^|\s)(?:min-)?h-(?:screen|dvh|svh|lvh|\[\d+(?:\.\d+)?(?:vh|dvh|svh)\])(?:\s|$)|(?:^|\s)min-h-\[(?:[3-9]\d|\d{3,})(?:\.\d+)?rem\]/.test(cls)) {
        out.push({ rule: 'R-41', severity: 'warn', line: first.line, message: '서브 페이지 첫 섹션이 화면 높이만큼 크다 — 서브 비주얼은 화면 1/3 이하로 둔다.', code: norm(first.src || '').slice(0, 120) })
      }
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
  r40Main(root, ctx, out)
  r41(root, ctx, out)
  return out.sort((a, b) => (a.line || 0) - (b.line || 0))
}

module.exports = { scanPageRules, isDeadHref }
