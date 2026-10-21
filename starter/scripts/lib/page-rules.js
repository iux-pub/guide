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

  const headings = headingsIn(main)
  if (!headings.length || headings[0].tag !== 'h1') {
    const first = headings[0]
    out.push({ rule: 'R-41', severity: 'error', line: first ? first.line : main.line, message: first ? `main의 첫 제목이 <${first.tag}>다 — 페이지 제목 h1을 main 안 맨 앞 제목으로 둔다.` : 'main 안에 h1이 없다 — 페이지 제목은 main 안 h1이다.', code: first ? norm(T.textOf(first)).slice(0, 120) : '<main>' })
  }
}

// 제목 수열 — h1~h6과 role=heading(aria-level). 대화상자·숨김·template·nav(사이드 메뉴 제목) 안은 뺀다
const levelOf = n => (/^h[1-6]$/.test(n.tag) ? +n.tag[1] : n.attrs?.role === 'heading' ? +(n.attrs['aria-level'] || 2) : 0)
const headingsIn = scope => els(scope, n => levelOf(n) > 0 && !inHiddenRegion(n) && !T.ancestors(n).some(a => a.tag === 'nav'))
  .map(n => Object.assign(n, { level: levelOf(n) }))

// R-39 — main 안 h1은 하나, 제목 단계를 건너뛰지 않는다, 섹션 이름을 카드 안 제목으로 대신하지 않는다
function r39(root, ctx, out) {
  const main = T.find(root, n => n.tag === 'main')
  if (!main) return
  const hs = headingsIn(main)
  const h1s = hs.filter(h => h.level === 1)
  if (h1s.length > 1) out.push({ rule: 'R-39', severity: 'error', line: h1s[1].line, message: `main 안에 h1이 ${h1s.length}개다 — 페이지 제목 h1은 하나다.`, code: norm(T.textOf(h1s[1])).slice(0, 120) })
  for (let i = 1; i < hs.length; i++) {
    if (hs[i].level > hs[i - 1].level + 1) {
      out.push({ rule: 'R-39', severity: 'error', line: hs[i].line, message: `제목 단계를 건너뛰었다(h${hs[i - 1].level} 다음 h${hs[i].level}) — 한 단계씩 내려간다. 크기는 클래스로 정한다.`, code: norm(T.textOf(hs[i])).slice(0, 120) })
    }
  }
  const outsideH1 = els(root, n => levelOf(n) === 1 && !inside(n, main) && !inHiddenRegion(n))
  if (outsideH1.length) out.push({ rule: 'R-39', severity: 'warn', line: outsideH1[0].line, message: 'main 밖에 h1이 있다(헤더 로고 등) — 로고는 h1이 아니다. 페이지 제목 h1은 main 안에 하나만 둔다.', code: norm(T.textOf(outsideH1[0])).slice(0, 120) })
  for (const section of (main.children || []).filter(c => c.tag === 'section')) {
    if (section.attrs['aria-label'] || section.attrs['aria-labelledby']) continue
    const first = headingsIn(section)[0]
    if (!first) continue
    const holder = T.ancestors(first).find(a => a === section ? false : hasClass(a, 'card') || a.tag === 'li' || (a.tag === 'article' && (a.parent.children || []).filter(s => s.tag === 'article').length > 1))
    if (holder && inside(holder, section)) out.push({ rule: 'R-39', severity: 'warn', line: first.line, message: '섹션 이름이 카드·목록 항목 안 제목뿐이다 — 섹션 제목(h2)을 따로 두거나 aria-label로 이름을 준다.', code: norm(T.textOf(first)).slice(0, 120) })
  }
}

// R-30 — 링크는 실제 목적지가 있어야 한다(빈 값·#·#none·#;·javascript:). '#top'은 맨 위 이동이라 예외.
// 이동은 실제 URL의 a, 동작은 button이다. page 계약과 무관하게 모든 마크업에 쓴다
function deadLinkFindings(html) {
  const out = []
  T.walk(T.parseHtml(html), n => {
    if (n.tag !== 'a' || !('href' in (n.attrs || {}))) return
    // 공백만 남은 href는 템플릿 식({{ url }})을 지운 자리다 — 값이 렌더할 때 정해진다
    if (/^\s+$/.test(n.attrs.href)) return
    if (isDeadHref(n.attrs.href)) out.push({ rule: 'R-30', severity: 'error', line: n.line, message: `링크 href="${n.attrs.href}"에 실제 목적지가 없다 — 이동은 실제 주소의 a, 동작(열기·닫기·토글)은 button으로 쓴다.`, code: (n.src || '').replace(/\s+/g, ' ').slice(0, 120) })
  })
  return out
}

// R-33 — 자동 전환·자동 재생에는 정지 토글(첫 포커스), <marquee> 금지. page 계약과 무관하게 모든 마크업
const PAUSE_NAME = /정지|일시정지|멈춤|pause|stop/i
const isToggle = n => n.tag !== '#text' && ('data-carousel-toggle' in n.attrs || 'data-media-toggle' in n.attrs || (n.tag === 'button' && PAUSE_NAME.test(accessibleName(n) || norm(T.textOf(n)) || (T.find(n, x => x.tag === 'img')?.attrs.alt || ''))))
const isFocusable = n => n.tag !== '#text' && !inHiddenRegion(n) && !('disabled' in n.attrs) && !T.ancestors(n).some(a => 'inert' in (a.attrs || {})) && (
  (n.tag === 'a' && 'href' in n.attrs) || ['button', 'select', 'textarea'].includes(n.tag) || (n.tag === 'input' && !/^hidden$/i.test(n.attrs.type || '')) || (n.attrs.tabindex !== undefined && +n.attrs.tabindex >= 0)) &&
  !(n.attrs.tabindex !== undefined && +n.attrs.tabindex < 0)
function motionFindings(html) {
  const out = []
  const root = T.parseHtml(html)
  const push = (severity, n, message) => out.push({ rule: 'R-33', severity, line: n.line, message, code: (n.src || '').replace(/\s+/g, ' ').slice(0, 120) })
  T.walk(root, n => {
    if (n.tag === '#text' || n.tag === '#root') return
    if (n.tag === 'marquee') push('error', n, '<marquee> — 자동으로 흐르는 띠는 쓰지 않는다(WCAG 2.2.2).')
    const autoplayMs = n.attrs['data-carousel-autoplay'] !== undefined ? parseInt(n.attrs['data-carousel-autoplay'], 10) : NaN
    const isAuto = autoplayMs > 0 || (n.attrs['data-autoplay'] !== undefined && !/^(?:false|0|off|no)$/i.test(n.attrs['data-autoplay'].trim()))
    if (isAuto) {
      const focusables = els(n, isFocusable)
      const toggle = focusables.find(isToggle) || T.find(n, x => x !== n && isToggle(x))
      if (!toggle) push('error', n, '자동 전환 영역에 정지 버튼이 없다 — 루트 안 첫 요소로 [data-carousel-toggle] 정지·재생 버튼을 둔다(KRDS 캐러셀).')
      else if (focusables[0] && focusables[0] !== toggle) push('error', n, '자동 전환 정지 버튼이 첫 번째 포커스 요소가 아니다 — 슬라이드 링크보다 앞에 둔다(KRDS 캐러셀).')
      if (autoplayMs > 0 && autoplayMs < 5000) push('warn', n, `자동 전환 간격 ${autoplayMs}ms — 팀 기준 5초(5000ms) 이상으로 둔다(KRDS는 '적절한 간격'만 정한다).`)
    }
    if (n.tag === 'video' && 'autoplay' in n.attrs) {
      if (!('muted' in n.attrs)) push('error', n, '소리 있는 자동 재생 영상 — 자동 재생은 muted여야 한다(KRDS 멀티미디어).')
      if (!('controls' in n.attrs)) {
        const id = n.attrs.id
        const scope = T.ancestors(n).find(a => ['section', 'figure'].includes(a.tag)) || n.parent
        const ok = (id && T.find(root, x => x.tag !== '#text' && x.attrs?.['aria-controls'] === id && isToggle(x))) || (scope && T.find(scope, isToggle))
        if (!ok) push('error', n, '자동 재생 영상에 정지 수단이 없다 — controls를 두거나 [data-media-toggle] 정지 버튼을 같은 영역에 둔다.')
      }
    }
    if (n.tag === 'script' && !n.attrs.src) {
      const src = (n.children[0] || {}).text || ''
      if (/new\s+(?:Swiper|Splide)\b|\.slick\(/.test(src) && /autoplay\s*:\s*(?:true|\{)/.test(src)) {
        if (!T.find(root, isToggle)) push('error', n, '자동 재생 슬라이더(Swiper·Splide·slick)에 정지 버튼이 없다 — 슬라이더 안 첫 요소로 정지·재생 버튼을 둔다.')
        const delay = src.match(/delay\s*:\s*(\d+)/) || src.match(/autoplaySpeed\s*:\s*(\d+)/)
        if (delay && +delay[1] < 5000) push('warn', n, `자동 전환 간격 ${delay[1]}ms — 팀 기준 5초(5000ms) 이상으로 둔다.`)
      }
    }
  })
  return out
}

// R-42 — 메인 히어로는 하나·첫 섹션, utility는 쓰지 않음, 화면 높이·스크롤 유도 금지. ctx.expression: profiles.json 등급
const HERO_CLASS = /(?:^|\s)(?:hero-bleed|section--intro)(?:\s|$)|(?:^|[\s_-])hero(?:[_-]|\s|$)/
const TALL = /(?:^|\s)(?:[\w-]+:)*(?:min-)?h-(?:screen|dvh|svh|lvh)(?:\s|$)/
const ARROW_ONLY = /^[\s↓⌄﹀▼⬇︾⇩↧]+$/
const SCROLL_NAME = /^(?:scroll(?:\s+down)?|스크롤|아래로.*)$/i
function r42(root, ctx, out) {
  const main = T.find(root, n => n.tag === 'main')
  if (!main) return
  const sections = (main.children || []).filter(c => c.tag === 'section' && !hasClass(c, 'notice-bar'))
  const heroes = els(main, n => hasClass(n, 'hero-bleed'))
  if (heroes.length > 1) out.push({ rule: 'R-42', severity: 'error', line: heroes[1].line, message: `hero-bleed가 ${heroes.length}개다 — 히어로는 페이지에 하나, 첫 섹션에만 둔다. 사이 변주는 section-media를 쓴다.`, code: norm(heroes[1].src || '').slice(0, 120) })
  if (heroes.length && heroes[0] !== sections[0]) out.push({ rule: 'R-42', severity: 'error', line: heroes[0].line, message: 'hero-bleed가 main의 첫 섹션이 아니다 — 히어로는 문서 최상단 도입 전용이다.', code: norm(heroes[0].src || '').slice(0, 120) })
  const grade = ctx.expression
  const first = sections[0]
  if (grade === 'utility' && first && (hasClass(first, 'hero-bleed') || T.find(first, n => hasClass(n, 'carousel')))) {
    out.push({ rule: 'R-42', severity: 'error', line: first.line, message: 'utility 등급(관리자·업무 화면)은 첫 섹션을 히어로·캐러셀로 쓰지 않는다 — 과업(검색·현황)으로 시작한다.', code: norm(first.src || '').slice(0, 120) })
  }
  const intros = [...new Set([first, ...sections.filter(s => HERO_CLASS.test(s.attrs.class || ''))].filter(Boolean))]
  for (const intro of intros) {
    const tall = [intro, ...els(intro, () => true)].find(n => {
      const cls = n.attrs?.class || ''
      if (TALL.test(cls)) return true
      const vh = [...cls.matchAll(/(?:^|\s)(?:[\w-]+:)*(?:min-)?h-\[(\d+(?:\.\d+)?)(?:vh|dvh|svh|lvh)\]/g)].map(m => +m[1])
      const style = (n.attrs?.style || '').match(/(?:min-)?height\s*:\s*(\d+(?:\.\d+)?)(?:vh|dvh|svh|lvh)/)
      return vh.some(v => v > 50) || (style && +style[1] > 50)
    })
    if (tall) {
      const severity = grade === 'expressive' ? 'warn' : grade ? 'error' : 'warn'
      out.push({ rule: 'R-42', severity, line: tall.line, message: '도입부가 화면 높이의 절반을 넘는다(h-screen·50vh 초과) — 공공·업무 화면의 hero는 화면 1/2 이하다(art-direction 표현 등급). 과업 진입이 첫 화면에 보이게 한다.', code: norm(tall.src || '').slice(0, 120) })
    }
    const bounce = els(intro, n => /(?:^|\s)(?:[\w-]+:)*animate-bounce(?:\s|$)/.test(n.attrs.class || ''))
    const cue = els(intro, n => ['a', 'button', 'span'].includes(n.tag) && n.attrs['aria-expanded'] === undefined && n.attrs['aria-controls'] === undefined && (() => {
      const text = norm(T.textOf(n))
      const name = norm(n.attrs['aria-label'] || text)
      return (text && ARROW_ONLY.test(text)) || SCROLL_NAME.test(name) || (n.tag === 'a' && /^#/.test(n.attrs.href || '') && /(?:arrow|chevron)-down/.test((n.src || '') + T.textOf(n)))
    })())
    const c = bounce[0] || cue[0]
    if (c) out.push({ rule: 'R-42', severity: 'error', line: c.line, message: '도입부의 스크롤 유도 큐(튀는 화살표·"스크롤") — AI 히어로 서명(AP-7)이다. 다음 섹션의 과업을 첫 화면에 보이게 한다.', code: norm(c.src || '').slice(0, 120) })
    const primaries = els(intro, n => hasClass(n, 'btn--primary'))
    if (primaries.length >= 2) out.push({ rule: 'R-42', severity: 'warn', line: primaries[1].line, message: `도입부 primary 버튼이 ${primaries.length}개다 — 전환 CTA는 하나(btn--primary), 나머지는 secondary·tertiary다.`, code: norm(T.textOf(primaries[1])).slice(0, 120) })
  }
}

// R-46 — 공식 배너·운영기관 식별자·정부 상징은 publicIdentity가 required로 확정된 경우에만(infoux.json)
const BANNER_FULL = /이\s?누리집은\s?대한민국\s?공식\s?전자정부\s?누리집입니다/
const BANNER_PART = /공식\s?전자정부\s?누리집|대한민국\s?공식\s?전자정부/
const OPERATOR_TEXT = /이\s?누리집은\s?[^.]{1,40}에서\s?운영하는\s?누리집입니다/
const GOV_ALT = /정부\s?상징|대한민국\s?정부\s?(?:상징|로고)|^대한민국\s?정부$/
const GOV_SRC = /gov[-_]?(?:symbol|emblem)|korea[-_]?gov[-_]?(?:logo|symbol)/i
function r46(root, ctx, out) {
  const required = ctx.publicIdentity === 'required'
  const textOfEl = n => norm(T.textOf(n))
  if (!required) {
    const push = (severity, n, message) => out.push({ rule: 'R-46', severity, line: n.line, message: `${message} publicIdentity가 required로 확정되지 않았다(infoux.json) — 정부·공공기관이 운영하는 공식 서비스로 확인된 뒤에만 만든다.`, code: (n.src || textOfEl(n)).replace(/\s+/g, ' ').slice(0, 120) })
    const body = T.find(root, n => n.tag === 'body') || root
    for (const n of els(body, x => !['script', 'style', 'title', 'pre', 'code', 'textarea'].includes(x.tag) && !T.ancestors(x).some(a => ['pre', 'code', 'textarea'].includes(a.tag)))) {
      if (hasClass(n, 'masthead') || hasClass(n, 'identifier')) push('error', n, `공식 배너·운영기관 식별자 예약 블록(.${hasClass(n, 'masthead') ? 'masthead' : 'identifier'})이 있다.`)
      if (n.tag === 'img' && (GOV_ALT.test(norm(n.attrs.alt || '')) || GOV_SRC.test(n.attrs.src || ''))) push('error', n, '정부 상징 이미지가 있다.')
      // 글 판정은 글을 직접 가진 블록 단위로(인라인 강조를 걷어낸 글)
      const own = (n.children || []).some(c => c.tag === '#text' && c.text.trim())
      if (own && !T.INLINE.has(n.tag)) {
        const text = textOfEl(n)
        if (BANNER_FULL.test(text)) push('error', n, '공식 전자정부 누리집 배너 문구가 있다.')
        else if (BANNER_PART.test(text)) push('warn', n, "'공식 전자정부 누리집' 문구가 있다.")
        if (OPERATOR_TEXT.test(text)) push('warn', n, '운영기관 식별자 문구가 있다.')
      }
    }
    return
  }
  // required — 공식 배너는 건너뛰기 링크 바로 다음(앞에는 배너의 조상만), 운영기관 식별자는 푸터 안
  const masthead = T.find(root, n => hasClass(n, 'masthead'))
  const skip = T.find(root, n => n.tag === 'a' && hasClass(n, 'skip-to-content'))
  if (!masthead) out.push({ rule: 'R-46', severity: 'error', line: (skip || root).line || 1, message: 'publicIdentity가 required인데 공식 배너(.masthead)가 없다 — 건너뛰기 링크 바로 다음에 둔다(KRDS 공식 배너).', code: '<body>' })
  else if (skip) {
    const order = els(root, () => true)
    const between = order.slice(order.indexOf(skip) + 1, order.indexOf(masthead)).filter(x => x.tag !== '#text' && !inside(x, skip) && !inside(masthead, x) && x !== skip)
    if (between.length) out.push({ rule: 'R-46', severity: 'error', line: masthead.line, message: '공식 배너(.masthead)가 건너뛰기 링크 바로 다음이 아니다 — 배너 앞에 다른 요소를 두지 않는다(공지 띠는 배너 다음).', code: norm(masthead.src || '').slice(0, 120) })
  }
  for (const id of els(root, n => hasClass(n, 'identifier'))) {
    if (!T.ancestors(id).some(a => a.tag === 'footer' && a.attrs.id === 'footer')) out.push({ rule: 'R-46', severity: 'error', line: id.line, message: '운영기관 식별자(.identifier)는 footer#footer 안 마지막에 둔다(KRDS 운영기관 식별자).', code: norm(id.src || '').slice(0, 120) })
  }
}

// R-47 — 개인정보 수집 폼: 동의 옆 4요소 고지(목적·항목·보유 기간·거부권), 동의 미리 체크 금지, 주민등록번호 수집 금지.
// 모든 마크업. 고지 값은 발주처 개인정보 처리방침·contentSources에서 가져온다(지어내지 않는다 — R-23)
const PERSONAL_AC = /^(?:name|given-name|family-name|additional-name|nickname|tel(?:-[a-z-]+)?|email|bday(?:-[a-z]+)?)$/i
const PERSONAL_TOKEN = /(?:^|[-_\s])(?:name|phone|mobile|tel|email|birth|bday)(?:$|[-_\s])|이름|성명|휴대|연락처|이메일|생년/i
const CONSENT_TEXT = /(?:개인\s?정보|수집|제3자\s?제공|위탁).*동의|동의.*(?:개인\s?정보|수집)/
const RRN = /주민\s?(?:등록)?\s?번호|(?:^|[^a-z])(?:rrn|ssn|jumin\w*|resident[-_]?(?:no|number))(?:[^a-z0-9]|$)/i
const RRN_NEGATED = /아님|않습니다|받지|수집하지|대신/
function labelTextOf(root, input) {
  const parts = []
  const wrap = T.ancestors(input).find(a => a.tag === 'label')
  if (wrap) parts.push(T.textOf(wrap))
  if (input.attrs.id) for (const l of els(root, x => x.tag === 'label' && x.attrs.for === input.attrs.id)) parts.push(T.textOf(l))
  for (const ref of String(input.attrs['aria-describedby'] || input.attrs['aria-labelledby'] || '').split(/\s+/).filter(Boolean)) {
    const el = T.find(root, x => x.attrs?.id === ref)
    if (el) parts.push(T.textOf(el))
  }
  if (input.attrs['aria-label']) parts.push(input.attrs['aria-label'])
  return norm(parts.join(' '))
}
// opts.rrnLegalBasis — infoux.json exceptions의 R-47 법령 근거(scripts/lib/contract-exceptions.js rrnLegalBasis).
//   있으면 주민등록번호 입력을 경고로 낮춘다(개인정보 보호법 제24조의2 — 법령이 요구·허용하는 경우만)
function privacyFormFindings(html, opts = {}) {
  const out = []
  const root = T.parseHtml(html)
  const push = (severity, n, message) => out.push({ rule: 'R-47', severity, line: n.line, message, code: (n.src || '').replace(/\s+/g, ' ').slice(0, 120) })
  // 주민등록번호 입력(폼 안팎 모두)
  for (const ctl of els(root, x => ['input', 'select', 'textarea'].includes(x.tag))) {
    const label = labelTextOf(root, ctl)
    const hay = [ctl.attrs.name, ctl.attrs.id, ctl.attrs.autocomplete, ctl.attrs.placeholder].filter(Boolean).join(' ')
    if ((RRN.test(hay) || RRN.test(label)) && !RRN_NEGATED.test(label)) {
      if (opts.rrnLegalBasis) push('warn', ctl, `주민등록번호 입력 — 법령 예외(${opts.rrnLegalBasis})로 허용했다. 수집 고지에 근거 조항을 적고, 입력은 마스킹·암호화 전송한다.`)
      else push('error', ctl, '주민등록번호 입력 — 법령 근거 없이 받지 않는다. 본인 확인은 휴대전화·공동인증 같은 다른 수단으로 한다. 법령이 요구하면 infoux.json exceptions에 { rule: "R-47", legalBasis, owner, expires }를 적는다.')
    }
  }
  for (const form of els(root, x => x.tag === 'form')) {
    const inputs = els(form, x => x.tag === 'input' || x.tag === 'textarea')
    const personal = inputs.filter(i => {
      const type = (i.attrs.type || 'text').toLowerCase()
      if (['hidden', 'checkbox', 'radio', 'search', 'password', 'submit', 'button'].includes(type)) return false
      return type === 'tel' || type === 'email' || PERSONAL_AC.test((i.attrs.autocomplete || '').trim()) || PERSONAL_TOKEN.test(`${i.attrs.name || ''} ${i.attrs.id || ''}`)
    })
    if (!personal.length) continue
    const choices = inputs.filter(i => /^(?:checkbox|radio)$/i.test(i.attrs.type || ''))
    const consents = choices.filter(c => CONSENT_TEXT.test(labelTextOf(root, c) + ' ' + norm(T.textOf(T.ancestors(c).find(a => a.tag === 'fieldset') || { tag: '#text', text: '' }))))
    // 동의 미리 체크 — '동의하지 않음'은 뺀다(마케팅 수신 동의 포함)
    for (const c of choices) {
      const label = labelTextOf(root, c)
      if ('checked' in c.attrs && /동의/.test(label) && !/동의하지\s?않/.test(label)) push('error', c, `동의 '${label.slice(0, 30)}'가 미리 체크돼 있다 — 이용자가 직접 고르게 둔다.`)
    }
    if (!consents.length) continue
    const group = T.ancestors(consents[0]).find(a => a.tag === 'fieldset') || form
    let text = norm(T.textOf(group))
    for (const c of els(group, x => x.attrs && (x.attrs['aria-describedby'] || x.attrs['aria-controls'] || (x.tag === 'a' && /^#/.test(x.attrs.href || '')) || x.attrs['data-modal-open']))) {
      const ids = [x => x.attrs['aria-describedby'], x => x.attrs['aria-controls'], x => (x.attrs.href || '').replace(/^#/, ''), x => x.attrs['data-modal-open']].map(f => f(c)).filter(Boolean).flatMap(v => v.split(/\s+/))
      for (const id of ids) { const el = T.find(root, x => x.attrs?.id === id); if (el) text += ' ' + norm(T.textOf(el)) }
    }
    const missing = [['수집 목적', /목적/], ['수집 항목', /항목|수집하는\s?(?:개인\s?)?정보/], ['보유 기간', /보유|보관|보존|이용\s?기간/], ['거부 권리', /거부|동의하지\s?않/]].filter(([, re]) => !re.test(text)).map(([n]) => n)
    if (missing.length) {
      const external = els(group, x => x.tag === 'a' && x.attrs.href && !/^#/.test(x.attrs.href)).length > 0
      push(external ? 'warn' : 'error', consents[0], `개인정보 동의 옆에 ${missing.join('·')} 고지가 없다 — 수집 목적·항목·보유 기간·거부 권리와 거부 시 불이익을 동의 그룹 안에 적는다. 값은 발주처 개인정보 처리방침에서 가져온다(지어내지 않는다).`)
    }
  }
  return out
}

// R-45 — 한국어 화면의 영문 전용 UI 레이블·언어 링크 lang·select 바로 이동(오류), 영문 주 메뉴·영문 eyebrow·영문 제목(경고).
// 모든 마크업. 문서 lang이 한국어가 아니면 보지 않는다. lang=en 면제는 콘텐츠 영역(section·article·blockquote)에만 준다
// — 링크·버튼 자신에 lang="en"을 붙여 VIEW MORE를 통과시키지 못하게
const EN_LABEL = /^(?:view\s?more\s?\+?|view\s?all|read\s?more|learn\s?more|see\s?more|more\s?\+?|details?|skip to (?:main )?content|sign\s?in|log\s?in|sign\s?up|contact\s?us|menu|home)$/i
const LANG_NAMES = [[/^(?:english|eng|en)$/i, 'en'], [/^(?:中文|简体中文|繁體中文|chinese|中國語|中国语)$/i, 'zh'], [/^(?:日本語|japanese|日本语)$/i, 'ja'], [/^(?:русский|russian)$/i, 'ru'], [/^(?:tiếng việt|vietnamese)$/i, 'vi'], [/^(?:español|spanish)$/i, 'es']]
const ACRONYM = /^(?:PDF|HWP|HWPX|DOC|XLS|NEW|FAQ|Q&A|KRDS|TOP|HOT|BEST|EVENT|NOTICE)$/
const DEMO_CLASS = /(?:^|\s)pg(?:__|\s|$)/
// opts.docs: 사이트 문서(site/**) — 영문 제목·eyebrow 경고는 문서·반례에 쓰지 않는다
function langFindings(html, opts = {}) {
  const out = []
  const root = T.parseHtml(html)
  const htmlEl = T.find(root, n => n.tag === 'html')
  if (htmlEl && htmlEl.attrs.lang && !/^ko\b/i.test(htmlEl.attrs.lang)) return out
  const push = (severity, n, message, sample) => out.push({ rule: 'R-45', severity, line: n.line, message, code: norm(sample || n.src || '').slice(0, 120) })
  const exempt = n => [n, ...T.ancestors(n)].some(a => ['code', 'kbd', 'pre', 'samp'].includes(a.tag) || DEMO_CLASS.test(a.attrs?.class || '')) ||
    T.ancestors(n).some(a => ['section', 'article', 'blockquote'].includes(a.tag) && a.attrs.lang && !/^ko\b/i.test(a.attrs.lang))
  const visible = n => norm(T.textOf(n, { visible: true }))
  for (const n of els(root, x => x.tag === 'a' || x.tag === 'button')) {
    if (exempt(n)) continue
    const text = visible(n)
    const name = norm(n.attrs['aria-label'] || '')
    const hit = [text, name].find(s => s && EN_LABEL.test(s))
    if (hit) { push('error', n, `영문 전용 UI 레이블 "${hit}" — 한국어 화면은 국문 레이블(더보기·전체 보기·로그인·메뉴·홈)을 쓴다.`, hit); continue }
    // 언어 전환 링크 — lang 필수(대상 언어로 읽히게), 값이 언어와 맞아야 한다. hreflang은 권장
    const lang = LANG_NAMES.find(([re]) => re.test(text))
    if (n.tag === 'a' && lang) {
      if (!n.attrs.lang) push('error', n, `언어 링크 "${text}"에 lang이 없다 — lang="${lang[1]}"(+ hreflang)을 단다(WCAG 3.1.2).`, text)
      else if (!new RegExp(`^${lang[1]}\\b`, 'i').test(n.attrs.lang)) push('error', n, `언어 링크 "${text}"의 lang="${n.attrs.lang}"이 언어와 맞지 않다 — lang="${lang[1]}".`, text)
    }
  }
  for (const s of els(root, x => x.tag === 'select')) {
    if (/\blocation\b|\.href\s*=|\bsubmit\s*\(|window\.open/.test(s.attrs.onchange || '')) push('error', s, '고르기만 해도 이동·제출하는 select — 이동은 별도 [이동] 버튼으로 한다(WCAG 3.2.2).', s.src)
  }
  // 영문 전용 주 메뉴(경고)
  for (const nav of els(root, x => hasClass(x, 'main-menu') || (x.tag === 'nav' && /^(?:주|메인)\s?메뉴$/.test(norm(x.attrs['aria-label'] || ''))))) {
    if (exempt(nav)) continue
    const items = els(nav, x => x.tag === 'a').map(visible).filter(Boolean)
    if (items.length >= 2 && items.every(t => !/[가-힣]/.test(t) && /[A-Za-z]{3}/.test(t))) push('warn', nav, '주 메뉴가 영문뿐이다 — 한국어 화면의 메뉴는 국문으로 쓴다.', items.join(' · '))
  }
  // 영문 대문자 eyebrow·영문 전용 제목(경고)
  for (const h of opts.docs ? [] : els(root, x => /^h[1-3]$/.test(x.tag))) {
    if (exempt(h)) continue
    const text = visible(h)
    if (text && !/[가-힣]/.test(text) && /[A-Za-z]{2,}\s+[A-Za-z]{2,}/.test(text) && !/^(?:FAQ|Q&A)$/i.test(text)) push('warn', h, `영문 전용 제목 "${text}" — 한국어 화면의 제목은 국문으로 쓴다(영문 병기는 보조로).`, text)
    const sibs = (h.parent.children || []).filter(c => c.tag !== '#text')
    const prev = sibs[sibs.indexOf(h) - 1]
    if (prev && !/^h[1-6]$/.test(prev.tag) && !hasClass(prev, 'badge') && !hasClass(prev, 'tag')) {
      const pt = visible(prev)
      const byClass = /(?:^|[\s_-])(?:eyebrow|kicker|overline)(?:$|[\s_-])/.test(prev.attrs.class || '')
      const byText = /^[A-Z][A-Z&\s]{2,30}$/.test(pt) && /\s/.test(pt.trim()) && !ACRONYM.test(pt)
      if (pt && !/[가-힣]/.test(pt) && (byClass || byText)) push('warn', prev, `제목 위 영문 eyebrow "${pt}" — AI 랜딩 서명이다. 빼거나 국문 분류명으로 쓴다.`, pt)
    }
  }
  return out
}

// ctx: { profile }
function scanPageRules(html, ctx = {}) {
  const root = T.parseHtml(html)
  const out = []
  r32(root, ctx, out)
  r40(root, ctx, out)
  r40Main(root, ctx, out)
  r41(root, ctx, out)
  r39(root, ctx, out)
  r42(root, ctx, out)
  r46(root, ctx, out)
  return out.sort((a, b) => (a.line || 0) - (b.line || 0))
}

module.exports = { scanPageRules, deadLinkFindings, motionFindings, privacyFormFindings, langFindings, isDeadHref }
