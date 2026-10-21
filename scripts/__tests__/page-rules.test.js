// 한국형 페이지 골격 — R-32 푸터 개인정보 처리방침, R-40 공공 통합검색, R-41 서브 골격 (scripts/lib/page-rules.js)

const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { spawnSync } = require('node:child_process')
const { test } = require('node:test')
const assert = require('node:assert/strict')

const ROOT = path.resolve(__dirname, '..', '..')
const { scanPageRules } = require('../lib/page-rules')

const has = (r, rule, severity = 'error') => r.some(f => f.rule === rule && f.severity === severity)
const none = (r, rule) => !r.some(f => f.rule === rule)
const brief = r => r.map(f => `${f.rule}:${f.severity}:${f.message}`).join('\n')

const SEARCH = '<form role="search" action="/search"><label for="q">통합검색</label><input id="q" type="search" name="q"><button type="submit">검색</button></form>'
const PRIVACY = '<nav aria-label="약관 및 정책"><a class="site-footer__link site-footer__link--important" href="/privacy">개인정보 처리방침</a></nav>'
const page = ({ header = SEARCH, beforeMain = '', main = '<section class="section section--content"><div class="container"><h1>공지사항</h1></div></section>', footer = PRIVACY, skip = '#main' } = {}) =>
  `<body><a href="${skip}" class="skip-to-content">본문 바로가기</a><header id="header" class="site-header"><div class="container">${header}</div></header>${beforeMain}<main id="main">${main}</main><footer id="footer" class="site-footer"><div class="container">${footer}</div></footer></body>`

// ─── R-32 ───────────────────────────────────────────

test('R-32: KRDS 명칭 정책 링크(띄어쓰기 둘 다·새 창 안내 포함)는 통과', () => {
  assert.ok(none(scanPageRules(page()), 'R-32'))
  assert.ok(none(scanPageRules(page({ footer: '<a class="site-footer__link site-footer__link--important" href="/privacy">개인정보처리방침</a>' })), 'R-32'))
  assert.ok(none(scanPageRules(page({ footer: '<a href="/privacy" target="_blank">개인정보 처리방침<span class="sr-only">(새 창)</span></a>' })), 'R-32'))
})

test('R-32: 링크 없음·빈 주소·옛 명칭은 오류, 엉뚱한 강조는 경고', () => {
  assert.ok(has(scanPageRules(page({ footer: '<small>© 2026 제주특별자치도</small>' })), 'R-32'))
  assert.ok(has(scanPageRules(page({ footer: '<a href="#">개인정보 처리방침</a>' })), 'R-32'))
  assert.ok(has(scanPageRules(page({ footer: '<a href="javascript:void(0)">개인정보 처리방침</a>' })), 'R-32'))
  assert.ok(has(scanPageRules(page({ footer: `${PRIVACY}<a href="/old">개인정보취급방침</a>` })), 'R-32'))
  const r = scanPageRules(page({ footer: `${PRIVACY}<a class="site-footer__link site-footer__link--important" href="/copyright">저작권 정책</a>` }))
  assert.ok(has(r, 'R-32', 'warn') && !has(r, 'R-32', 'error'), brief(r))
})

test('R-32: 영문 페이지 Privacy Policy는 대상이 아니고, 푸터 없는 조각도 아니다', () => {
  assert.ok(none(scanPageRules(`<html lang="en">${page({ footer: '<a href="/privacy">Privacy Policy</a>' })}</html>`), 'R-32'))
  assert.ok(none(scanPageRules('<section><h2>안내</h2></section>'), 'R-32'))
})

test('R-32: 커머스는 이용약관·사업자 정보가 없으면 경고', () => {
  const r = scanPageRules(page({ footer: `${PRIVACY}<small>© 2026 제주여행</small>` }), { profile: 'commerce-reservation' })
  assert.ok(has(r, 'R-32', 'warn'), brief(r))
  const full = `${PRIVACY}<a href="/terms">이용 약관</a><dl><dt>회사명</dt><dd>제주여행</dd><dt>대표이사</dt><dd>김○○</dd><dt>사업자 등록번호</dt><dd>000-00-00000</dd><dt>통신판매신고</dt><dd>제2026-제주-0000호</dd></dl>`
  assert.ok(none(scanPageRules(page({ footer: full }), { profile: 'commerce-reservation' }), 'R-32'))
})

// ─── R-40 ───────────────────────────────────────────

test('R-40: 공공 화면은 헤더에 통합검색 — 폼·검색 입력·이름이 검색인 아이콘 버튼 모두 인정', () => {
  const ps = { profile: 'public-service' }
  assert.ok(none(scanPageRules(page(), ps), 'R-40'))
  assert.ok(none(scanPageRules(page({ header: '<button type="button" aria-label="통합검색" aria-haspopup="dialog"><svg aria-hidden="true"></svg></button>' }), ps), 'R-40'))
  assert.ok(none(scanPageRules(page({ header: '<a href="/search"><span class="sr-only">통합 검색</span></a>' }), ps), 'R-40'))
  assert.ok(has(scanPageRules(page({ header: '<a href="/">제주특별자치도</a>' }), { profile: 'public-institution' }), 'R-40'))
  // 일반·유형 미정·헤더 없는 팝업은 대상이 아니다
  assert.ok(none(scanPageRules(page({ header: '' }), { profile: 'general-site' }), 'R-40'))
  assert.ok(none(scanPageRules(page({ header: '' })), 'R-40'))
  assert.ok(none(scanPageRules('<body><main id="main"><section><div class="container"><h1>우편번호 찾기</h1></div></section></main></body>', ps), 'R-40'))
})

// ─── R-41 ───────────────────────────────────────────

const CRUMB = '<nav class="breadcrumb" aria-label="페이지 경로"><ol><li><a href="/">홈</a></li><li aria-current="page">공지사항</li></ol></nav>'

test('R-41: 브레드크럼은 본문 바로가기 목적지 밖 — main의 형제는 통과, main 안은 오류', () => {
  assert.ok(none(scanPageRules(page({ beforeMain: CRUMB })), 'R-41'))
  assert.ok(has(scanPageRules(page({ main: `<section class="section section--intro"><div class="container">${CRUMB}<h1>공지사항</h1></div></section>` })), 'R-41'))
})

test('R-41: 목적지는 skip 링크가 가리키는 요소 — #contents 구조는 main 안이라도 목적지 밖이면 통과', () => {
  const main = `${CRUMB}<section class="section section--content" id="contents"><div class="container"><h1>공지사항</h1></div></section>`
  assert.ok(none(scanPageRules(page({ skip: '#contents', main })), 'R-41'))
})

test('R-41: main 첫 제목은 h1 — 헤더 로고 h1·h2로 시작하는 main은 오류, 숨은 대화상자 제목은 셈하지 않는다', () => {
  assert.ok(has(scanPageRules(page({ main: '<section><div class="container"><h2>알림마당</h2></div></section>' })), 'R-41'))
  assert.ok(has(scanPageRules(page({ main: '<section><div class="container"><p>안내</p></div></section>' })), 'R-41'))
  const withDialog = '<section><div class="container"><div class="modal" role="dialog" hidden><h2>작성 내용 임시 저장</h2></div><h1>공지사항</h1></div></section>'
  assert.ok(none(scanPageRules(page({ main: withDialog })), 'R-41'))
})

// ─── pageType 선언(K-16) 뒤에 켜지는 판정 ───────────────

const ps = { profile: 'public-service' }
const mainOf = pageType => ({ ...ps, pageType })
const NOTICE = '<section class="section section--notice"><div class="container"><h2>공지사항</h2><ul><li><a href="/n/3">하반기 공모 안내</a><time datetime="2026-10-15">2026.10.15</time></li><li><a href="/n/2">시스템 점검</a><time datetime="2026-10-12">2026.10.12</time></li><li><a href="/n/1">휴관 안내</a><time datetime="2026-10-08">2026.10.08</time></li></ul></div></section>'
const INTRO = '<section class="section section--intro"><div class="container"><h1>제주 민원 포털</h1></div></section>'

test('R-40 (2): 공공 메인은 첫 콘텐츠 2개 섹션 안에 과업 진입 — 공지·검색·바로가기 인정, 없으면 경고', () => {
  const main = { type: 'main' }
  assert.ok(none(scanPageRules(page({ main: INTRO + NOTICE }), mainOf(main)), 'R-40'))
  // span 날짜 공지, 도입부 결합 검색, 이름 있는 바로가기 nav
  const spanNotice = NOTICE.replace(/<time datetime="[^"]+">([^<]+)<\/time>/g, '<span>$1</span>')
  assert.ok(none(scanPageRules(page({ main: INTRO + spanNotice }), mainOf(main)), 'R-40'))
  assert.ok(none(scanPageRules(page({ main: `<section class="section section--intro"><div class="container"><h1>민원 포털</h1>${SEARCH}</div></section>` }), mainOf(main)), 'R-40'))
  const quick = '<section class="section section--content"><div class="container"><h2>자주 찾는 서비스</h2><nav aria-label="자주 찾는 서비스"><ul><li><a href="/a">여권 발급</a></li><li><a href="/b">등본 발급</a></li><li><a href="/c">세금 납부</a></li><li><a href="/d">주차 신고</a></li></ul></nav></div></section>'
  assert.ok(none(scanPageRules(page({ main: INTRO + quick }), mainOf(main)), 'R-40'))
  const story = '<section class="section section--content"><div class="container"><h2>재단 이야기</h2><p>소개</p></div></section>'
  const r = scanPageRules(page({ main: INTRO + story }), mainOf(main))
  assert.ok(has(r, 'R-40', 'warn') && !has(r, 'R-40', 'error'), brief(r))
  // 유형 선언이 없거나 서브면 보지 않는다
  assert.ok(none(scanPageRules(page({ main: INTRO + story }), ps), 'R-40'))
  assert.ok(none(scanPageRules(page({ main: INTRO + story }), mainOf({ type: 'sub-content' })), 'R-40'))
})

test("R-40 (3): 공공 메인의 마케팅 템플릿 섹션은 오류 — '숫자로 보는'·'요금제'·'FAQ'는 아니다", () => {
  const sec = h => `<section class="section section--content"><div class="container"><h2>${h}</h2></div></section>`
  for (const h of ['고객 후기', 'FEATURES', '이용자 후기', '요금 플랜']) assert.ok(has(scanPageRules(page({ main: INTRO + NOTICE + sec(h) }), mainOf({ type: 'main' })), 'R-40'), h)
  for (const h of ['숫자로 보는 제주', '전기요금제 안내', '자주 묻는 질문']) assert.ok(none(scanPageRules(page({ main: INTRO + NOTICE + sec(h) }), mainOf({ type: 'main' })), 'R-40'), h)
  assert.ok(none(scanPageRules(page({ main: INTRO + NOTICE + sec('고객 후기') }), { profile: 'commerce-reservation', pageType: { type: 'main' } }), 'R-40'))
})

test('R-41 (1): 선언된 3단계 이상 서브 페이지는 브레드크럼 — 공공 오류, 그 밖 경고, 2단계·메인은 통과', () => {
  const sub = d => ({ type: 'board-list', depth: d })
  assert.ok(has(scanPageRules(page(), { profile: 'public-institution', pageType: sub(3) }), 'R-41'))
  const r = scanPageRules(page(), { profile: 'general-site', pageType: sub(3) })
  assert.ok(has(r, 'R-41', 'warn') && !has(r, 'R-41', 'error'), brief(r))
  assert.ok(none(scanPageRules(page({ beforeMain: CRUMB }), { profile: 'public-institution', pageType: sub(3) }), 'R-41'))
  assert.ok(none(scanPageRules(page(), { profile: 'public-institution', pageType: sub(2) }), 'R-41'))
  assert.ok(none(scanPageRules(page(), { profile: 'public-institution', pageType: { type: 'main', depth: 3 } }), 'R-41'))
})

test('R-41 (4): 서브 첫 섹션 hero-bleed는 공공·관리자 오류, 화면 높이 섹션은 경고', () => {
  const hero = '<section class="section section--intro hero-bleed"><div class="container"><h1>알림마당</h1></div></section>'
  assert.ok(has(scanPageRules(page({ main: hero }), { profile: 'public-institution', pageType: { type: 'sub-content' } }), 'R-41'))
  assert.ok(has(scanPageRules(page({ main: hero }), { profile: 'general-site', pageType: { type: 'sub-content' } }), 'R-41', 'warn'))
  const tall = '<section class="section section--intro min-h-screen"><div class="container"><h1>알림마당</h1></div></section>'
  assert.ok(has(scanPageRules(page({ main: tall }), { profile: 'public-institution', pageType: { type: 'sub-content' } }), 'R-41', 'warn'))
  assert.ok(none(scanPageRules(page({ main: hero }), { profile: 'public-institution', pageType: { type: 'main' } }), 'R-41'))
})

test('page-scope: pageTypes 선언을 읽고 잘못된 유형·깊이·글롭은 HX-06 문제로 낸다', () => {
  const { readPageTypes, pageTypeOf } = require('../lib/page-scope')
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'iux-ptype-'))
  fs.writeFileSync(path.join(dir, 'infoux.json'), JSON.stringify({ pageTypes: { 'index.html': 'main', 'pages/notice/*.html': { type: 'board-list', depth: 3 }, 'pages/x.html': 'landing', '../a.html': 'main', 'pages/y.html': { type: 'form', depth: 0 } } }))
  assert.deepEqual(pageTypeOf(dir, 'index.html'), { type: 'main', depth: undefined })
  assert.deepEqual(pageTypeOf(dir, 'pages/notice/list.html'), { type: 'board-list', depth: 3 })
  assert.equal(pageTypeOf(dir, 'pages/about.html'), null)
  assert.equal(readPageTypes(dir).problems.length, 3)
})

// ─── R-30·R-39 ───────────────────────────────────────

test('R-30: 빈 값·#·#none·#;·javascript: 링크는 오류, #top·실제 앵커·템플릿 식은 통과', () => {
  const { deadLinkFindings } = require('../lib/page-rules')
  for (const href of ['', '#', '#none', '#;', 'javascript:void(0)', 'javascript:;']) assert.equal(deadLinkFindings(`<a href="${href}">자세히</a>`).length, 1, href)
  for (const src of ['<a href="#top">맨 위로</a>', '<a href="#main">본문 바로가기</a>', '<a href="/notice">공지</a>', '<a href="{{ page.url }}">이전</a>', '<a>앵커</a>']) assert.equal(deadLinkFindings(src).length, 0, src)
})

test('R-39: main 안 h1 하나, 단계 건너뛰기 금지, main 밖 h1 경고, 카드 제목으로 섹션 이름 대신 경고', () => {
  const sec = inner => `<section class="section section--content"><div class="container">${inner}</div></section>`
  assert.ok(none(scanPageRules(page({ main: sec('<h1>공지사항</h1><h2>목록</h2><h3>필터</h3>') })), 'R-39'))
  assert.ok(has(scanPageRules(page({ main: sec('<h1>공지사항</h1>') + sec('<h1>또 다른 제목</h1>') })), 'R-39'))
  assert.ok(has(scanPageRules(page({ main: sec('<h1>공지사항</h1><h3>필터</h3>') })), 'R-39'))
  assert.ok(has(scanPageRules(page({ header: `<h1 class="site-header__logo">제주특별자치도</h1>${SEARCH}` })), 'R-39', 'warn'))
  const cards = '<section class="section section--list"><div class="container"><ul class="card-grid"><li class="card"><h2>도서관 휴관일 안내</h2></li><li class="card"><h2>프로그램 접수</h2></li></ul></div></section>'
  assert.ok(has(scanPageRules(page({ main: sec('<h1>알림마당</h1>') + cards })), 'R-39', 'warn'))
  // 사이드 메뉴 nav의 h2는 제목 수열에서 뺀다(KRDS D1)
  const side = '<nav class="side-navigation" aria-label="알림마당"><h2>알림마당</h2></nav>'
  assert.ok(none(scanPageRules(page({ main: sec(`${side}<h1>공지사항</h1>`) })), 'R-39'))
})

// ─── R-33·R-42 ───────────────────────────────────────

test('R-33: 자동 전환은 정지 버튼이 첫 포커스, 자동 재생 영상은 muted·정지 수단, marquee 금지', () => {
  const { motionFindings } = require('../lib/page-rules')
  const ok = '<div class="carousel" data-carousel-autoplay="6000"><button type="button" class="carousel__toggle" data-carousel-toggle aria-label="자동 재생 정지"></button><ul><li><a href="/event/1">가을 축제</a></li></ul></div>'
  assert.equal(motionFindings(ok).length, 0)
  assert.equal(motionFindings('<div class="carousel"><button type="button" aria-label="이전 슬라이드"></button><ul><li><a href="/e/1">축제</a></li></ul></div>').length, 0)
  assert.ok(has(motionFindings('<div class="carousel" data-autoplay="true"><ul><li><a href="/e/1">축제</a></li></ul></div>'), 'R-33'))
  assert.ok(has(motionFindings('<div class="carousel" data-autoplay="true"><ul><li><a href="/e/1">축제</a></li></ul><button type="button" data-carousel-toggle aria-label="자동 재생 정지"></button></div>'), 'R-33'))
  assert.ok(has(motionFindings('<div class="carousel" data-carousel-autoplay="3000"><button type="button" data-carousel-toggle aria-label="일시정지"></button></div>'), 'R-33', 'warn'))
  assert.equal(motionFindings('<div class="carousel" data-autoplay="0"><a href="/e">축제</a></div>').length, 0)
  assert.ok(has(motionFindings('<div class="swiper main-visual"><a class="swiper-slide" href="/e/1">행사</a></div><script>new Swiper(".main-visual", { autoplay: { delay: 3000 }, loop: true })</script>'), 'R-33'))
  assert.ok(has(motionFindings('<section><video autoplay loop src="/v.mp4"></video></section>'), 'R-33'))
  assert.equal(motionFindings('<section><video autoplay muted loop controls src="/v.mp4"></video></section>').length, 0)
  assert.equal(motionFindings('<figure><video id="v" autoplay muted loop src="/v.mp4"></video><button type="button" data-media-toggle aria-controls="v">영상 정지</button></figure>').length, 0)
  assert.ok(has(motionFindings('<marquee>공지</marquee>'), 'R-33'))
})

test('R-42: 히어로는 하나·첫 섹션, 화면 높이·스크롤 큐 금지, primary 둘은 경고', () => {
  const restrained = { profile: 'public-institution', expression: 'restrained' }
  const hero = (cls = '', inner = '<h1>항구도시 문화재단</h1>') => `<section class="section section--intro hero-bleed ${cls}"><div class="container">${inner}</div></section>`
  const notice = '<section class="section section--notice" aria-label="공지"><div class="container"><h2>공지</h2></div></section>'
  assert.ok(none(scanPageRules(page({ main: hero('', '<h1>항구도시 문화재단</h1><a class="btn btn--primary btn--large" href="/program">프로그램 신청하기</a>') + notice }), restrained), 'R-42'))
  assert.ok(has(scanPageRules(page({ main: notice.replace('<h2>공지</h2>', '<h1>공지</h1>') + hero('', '<h2>도입</h2>') }), restrained), 'R-42'))
  assert.ok(has(scanPageRules(page({ main: hero() + hero('', '<h2>또</h2>') }), restrained), 'R-42'))
  assert.ok(has(scanPageRules(page({ main: hero('h-screen') }), restrained), 'R-42'))
  assert.ok(has(scanPageRules(page({ main: hero('min-h-[55vh]') }), { profile: 'general-site', expression: 'expressive' }), 'R-42', 'warn'))
  assert.ok(has(scanPageRules(page({ main: hero('', '<h1>바다</h1><span class="animate-bounce" aria-hidden="true">↓</span>') }), restrained), 'R-42'))
  assert.ok(has(scanPageRules(page({ main: hero('', '<h1>바다</h1><a href="#next">스크롤</a>') }), restrained), 'R-42'))
  const two = hero('', '<h1>바다</h1><a class="btn btn--primary" href="/a">시작</a><a class="btn btn--primary" href="/b">소개</a>')
  assert.ok(has(scanPageRules(page({ main: two }), restrained), 'R-42', 'warn'))
  assert.ok(has(scanPageRules(page({ main: hero() }), { profile: 'cms-admin', expression: 'utility' }), 'R-42'))
})

// ─── R-46·R-47 ───────────────────────────────────────

test('R-46: publicIdentity가 required가 아니면 공식 배너·식별자·정부 상징 금지, required면 위치 확인', () => {
  const banner = '<div class="masthead"><p>이 누리집은 대한민국 공식 전자정부 누리집입니다.</p></div>'
  assert.ok(has(scanPageRules(page({ beforeMain: '' }).replace('<header', `${banner}<header`)), 'R-46'))
  assert.ok(has(scanPageRules(page({ header: '<img src="/img/gov-symbol.svg" alt="대한민국 정부">' })), 'R-46'))
  assert.ok(has(scanPageRules(page({ main: '<section><div class="container"><h1>안내</h1><p>이 누리집은 <strong>대한민국 공식 전자정부 누리집</strong>입니다.</p></div></section>' })), 'R-46'))
  assert.ok(none(scanPageRules(page({ main: '<section><div class="container"><h1>공식 배너 안내</h1><p>공식 배너는 조건부로 만든다.</p></div></section>' })), 'R-46'))
  // required — 건너뛰기 링크 바로 다음 배너, 식별자는 푸터 안
  const req = { publicIdentity: 'required' }
  assert.ok(none(scanPageRules(page().replace('<header', `${banner}<header`).replace(PRIVACY, `${PRIVACY}<div class="identifier">운영기관</div>`), req), 'R-46'))
  assert.ok(has(scanPageRules(page(), req), 'R-46'))
  assert.ok(has(scanPageRules(page().replace('<header id="header" class="site-header"><div class="container">', `<header id="header" class="site-header"><div class="container"><nav>메뉴</nav>${banner}`), req), 'R-46'))
})

test('R-47: 개인정보 동의는 4요소 고지, 미리 체크·주민등록번호 금지', () => {
  const { privacyFormFindings } = require('../lib/page-rules')
  const fields = '<label for="nm">이름</label><input id="nm" name="name" autocomplete="name"><label for="ph">휴대전화</label><input id="ph" type="tel" name="phone">'
  const consent = (notice, checked = '') => `<fieldset><legend>개인정보 수집·이용 동의</legend>${notice}<input type="checkbox" id="ag" ${checked}><label for="ag">개인정보 수집·이용에 동의합니다</label></fieldset>`
  const full = '<p>수집 목적: 상담 회신 / 수집 항목: 이름, 휴대전화 / 보유 기간: 처리방침에 따름 / 동의를 거부할 수 있으며, 거부하면 상담 신청이 제한됩니다.</p>'
  assert.equal(privacyFormFindings(`<form>${fields}${consent(full)}</form>`).length, 0)
  assert.ok(has(privacyFormFindings(`<form>${fields}${consent('<p>개인정보를 수집합니다.</p>')}</form>`), 'R-47'))
  assert.ok(has(privacyFormFindings(`<form>${fields}${consent('<p>개인정보를 수집합니다. <a href="/privacy">처리방침 보기</a></p>')}</form>`), 'R-47', 'warn'))
  assert.ok(has(privacyFormFindings(`<form>${fields}${consent(full, 'checked')}</form>`), 'R-47'))
  assert.ok(has(privacyFormFindings(`<form>${fields}<input type="checkbox" id="mk" checked><label for="mk">마케팅 정보 수신 동의</label></form>`), 'R-47'))
  assert.ok(has(privacyFormFindings('<form><label for="r">주민등록번호</label><input id="r" name="rrn"></form>'), 'R-47'))
  assert.equal(privacyFormFindings('<form><label for="b">생년월일(주민등록번호 아님)</label><input id="b" name="birth"></form>').length, 0)
  // 개인정보 입력이 없는 폼·hotel 같은 낱말은 대상이 아니다
  assert.equal(privacyFormFindings('<form><input type="search" name="q"><input type="checkbox" id="k" checked><label for="k">아이디 저장</label></form>').length, 0)
  assert.equal(privacyFormFindings('<form><input name="hotel"><input type="checkbox" id="a" checked><label for="a">약관에 동의</label></form>').length, 0)
})

// ─── 검사기 통합 ─────────────────────────────────────

test('검사기: 납품 페이지에 R-32·R-40·R-41이 닿고, 사이트 문서 골격에는 닿지 않는다', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'iux-page-'))
  fs.mkdirSync(path.join(dir, 'scripts'), { recursive: true })
  fs.copyFileSync(path.join(ROOT, 'scripts', 'check-html-structure.js'), path.join(dir, 'scripts', 'check-html-structure.js'))
  fs.cpSync(path.join(ROOT, 'scripts', 'lib'), path.join(dir, 'scripts', 'lib'), { recursive: true })
  fs.mkdirSync(path.join(dir, 'contracts'), { recursive: true })
  for (const name of ['html-page-contract.json', 'class-naming.json']) fs.copyFileSync(path.join(ROOT, 'contracts', name), path.join(dir, 'contracts', name))
  fs.writeFileSync(path.join(dir, 'infoux.json'), JSON.stringify({ profile: 'public-service', pageTypes: { 'pages/notice.html': { type: 'board-list', depth: 3 } } }))
  fs.mkdirSync(path.join(dir, 'pages'))
  fs.writeFileSync(path.join(dir, 'pages', 'notice.html'), `<!DOCTYPE html><html lang="ko">${page({ header: '', footer: '<small>© 2026</small>' })}</html>`)
  fs.mkdirSync(path.join(dir, 'site', 'guides'), { recursive: true })
  fs.writeFileSync(path.join(dir, 'site', 'guides', 'shell.md'), '```html\n' + page({ footer: '...' }) + '\n```\n')
  const r = spawnSync(process.execPath, [path.join(dir, 'scripts', 'check-html-structure.js')], { cwd: dir, encoding: 'utf8', env: { ...process.env, FORCE_COLOR: '0' } })
  const out = r.stdout + r.stderr
  assert.equal(r.status, 2, out)
  assert.match(out, /notice\.html[\s\S]*?\[R-32\]/)
  assert.match(out, /\[R-40\]/)
  assert.match(out, /\[R-41\][^\n]*3단계/)
  assert.doesNotMatch(out, /shell\.md[^\n]*\n[^\n]*\[R-32\]/)
})
