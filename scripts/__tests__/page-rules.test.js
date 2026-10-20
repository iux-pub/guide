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

// ─── 검사기 통합 ─────────────────────────────────────

test('검사기: 납품 페이지에 R-32·R-40·R-41이 닿고, 사이트 문서 골격에는 닿지 않는다', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'iux-page-'))
  fs.mkdirSync(path.join(dir, 'scripts'), { recursive: true })
  fs.copyFileSync(path.join(ROOT, 'scripts', 'check-html-structure.js'), path.join(dir, 'scripts', 'check-html-structure.js'))
  fs.cpSync(path.join(ROOT, 'scripts', 'lib'), path.join(dir, 'scripts', 'lib'), { recursive: true })
  fs.mkdirSync(path.join(dir, 'contracts'), { recursive: true })
  for (const name of ['html-page-contract.json', 'class-naming.json']) fs.copyFileSync(path.join(ROOT, 'contracts', name), path.join(dir, 'contracts', name))
  fs.writeFileSync(path.join(dir, 'infoux.json'), JSON.stringify({ profile: 'public-service' }))
  fs.mkdirSync(path.join(dir, 'pages'))
  fs.writeFileSync(path.join(dir, 'pages', 'notice.html'), `<!DOCTYPE html><html lang="ko">${page({ header: '', footer: '<small>© 2026</small>' })}</html>`)
  fs.mkdirSync(path.join(dir, 'site', 'guides'), { recursive: true })
  fs.writeFileSync(path.join(dir, 'site', 'guides', 'shell.md'), '```html\n' + page({ footer: '...' }) + '\n```\n')
  const r = spawnSync(process.execPath, [path.join(dir, 'scripts', 'check-html-structure.js')], { cwd: dir, encoding: 'utf8', env: { ...process.env, FORCE_COLOR: '0' } })
  const out = r.stdout + r.stderr
  assert.equal(r.status, 2, out)
  assert.match(out, /notice\.html[\s\S]*?\[R-32\]/)
  assert.match(out, /\[R-40\]/)
  assert.doesNotMatch(out, /shell\.md[^\n]*\n[^\n]*\[R-32\]/)
})
