// R-44 최상급·홍보 어조·해요체, R-45 영문 레이블·언어 링크, R-49 섹션 여백

const path = require('node:path')
const { test } = require('node:test')
const assert = require('node:assert/strict')

const ROOT = path.resolve(__dirname, '..', '..')
const c = require('../lib/copy-rules')
const { langFindings } = require('../lib/page-rules')
const { sectionPaddingHtml, sectionPaddingCss } = require('../lib/layout-rules')

const COPY = c.loadCopyContracts(ROOT)
const copy = (src, extra = {}) => c.scanHtmlCopy(src, { scope: 'deliverable', profile: null, copyAllow: [], copy: COPY, ...extra }).filter(f => f.rule === 'R-44')
const pub = { profile: 'public-institution' }

test('R-44: 제목·도입부의 최상급은 한 번이라도, 본문은 누적 2회부터 경고', () => {
  assert.equal(copy('<h2>혁신적인 행정 서비스</h2>').length, 1)
  assert.equal(copy('<p>혁신적인 서비스입니다.</p>').length, 0)
  assert.equal(copy('<p>차세대 시스템입니다.</p><p>원스톱으로 처리합니다.</p>').length, 1)
  assert.equal(copy('<h2>최고의결기구 안내</h2>').length, 0)
  assert.ok(copy('<h2>혁신적인 서비스</h2>').every(f => f.severity === 'warn'))
})

test('R-44: 공공 화면의 홍보 어조·해요체는 경고, 고유명사·비전 페이지·의문형은 통과', () => {
  assert.equal(copy('<h2>세계 최고의 문화도시로 도약합니다</h2>', pub).length >= 1, true)
  assert.equal(copy('<h2>청년도약계좌 신청 안내</h2>', pub).length, 0)
  assert.equal(copy('<h1>비전</h1><h2>새로운 미래를 엽니다</h2>', pub).filter(f => /홍보/.test(f.message)).length, 0)
  assert.equal(copy('<p>신청서는 온라인으로 낼 수 있어요.</p>', pub).length, 1)
  assert.equal(copy('<p>어떻게 신청하나요?</p>', pub).length, 0)
  assert.equal(copy('<button type="button">좋아요</button>', pub).length, 0)
})

test('R-44: 일반 화면은 합쇼체·해요체가 각각 3문장 이상 섞일 때만 경고', () => {
  const mixed = '<p>안내합니다. 확인합니다. 접수합니다.</p><p>좋아요. 쉬워요. 빨라요.</p>'
  assert.equal(copy(mixed, { profile: 'general-site' }).length, 1)
  assert.equal(copy('<p>안내합니다. 쉬워요.</p>', { profile: 'general-site' }).length, 0)
})

test('R-45: 영문 전용 UI 레이블은 오류 — 링크에 lang="en"을 붙여도, 보이는 글이 영문이어도', () => {
  for (const src of ['<a href="/news">VIEW MORE +</a>', '<a href="/news" lang="en">View more</a>', '<a href="/news" aria-label="새소식 더보기">MORE</a>', '<button type="button">Menu</button>']) assert.ok(langFindings(src).some(f => f.severity === 'error'), src)
  assert.equal(langFindings('<a href="/news">새소식 더보기</a>').length, 0)
  assert.equal(langFindings('<section lang="en"><a href="/en/news">Read more</a></section>').length, 0)
  assert.equal(langFindings('<div class="pg__preview"><button type="button">Menu</button></div>').length, 0)
  assert.equal(langFindings('<html lang="en"><body><a href="/x">Read more</a></body></html>').length, 0)
})

test('R-45: 언어 링크는 lang 필수·일치, select 바로 이동 금지', () => {
  assert.ok(langFindings('<a href="/en/" hreflang="en">English</a>').some(f => f.severity === 'error'))
  assert.ok(langFindings('<a href="/zh/" lang="en">中文</a>').some(f => f.severity === 'error'))
  assert.equal(langFindings('<a href="/en/" lang="en" hreflang="en">English</a>').length, 0)
  assert.ok(langFindings('<select onchange="this.form.submit()"><option>패밀리 사이트</option></select>').some(f => f.severity === 'error'))
  assert.ok(langFindings('<select onchange="location.href=this.value"><option>패밀리 사이트</option></select>').some(f => f.severity === 'error'))
})

test('R-45: 영문 주 메뉴·영문 eyebrow·영문 제목은 경고, 배지·약어·FAQ·문서는 통과', () => {
  assert.ok(langFindings('<nav class="main-menu" aria-label="메인 메뉴"><a href="/a">About</a><a href="/b">Service</a></nav>').some(f => f.severity === 'warn'))
  assert.ok(langFindings('<div><p class="eyebrow">OUR STORY</p><h2>우리의 이야기</h2></div>').some(f => f.severity === 'warn'))
  assert.ok(langFindings('<div><p>WHAT WE DO</p><h2>하는 일</h2></div>').some(f => f.severity === 'warn'))
  assert.ok(langFindings('<h2>Our Services</h2>').some(f => f.severity === 'warn'))
  for (const src of ['<div><span class="badge">NEW</span><h3>공지</h3></div>', '<div><span class="tag">PDF</span><h3>서식</h3></div>', '<div><p>FAQ</p><h2>자주 묻는 질문</h2></div>', '<h2>FAQ</h2>']) assert.equal(langFindings(src).length, 0, src)
  assert.equal(langFindings('<h2>Welcome to Our Platform</h2>', { docs: true }).length, 0)
})

test('R-49: 섹션 세로 여백은 밀도 기준의 1.5배까지 — 모바일·PC 따로', () => {
  const comfortable = { mobile: 4, pc: 8 }
  const compact = { mobile: 2.4, pc: 4 }
  assert.equal(sectionPaddingHtml('<section class="section py-[5.6rem] laptop:py-[8rem]"></section>', comfortable).length, 0)
  assert.equal(sectionPaddingHtml('<section class="section py-[6.4rem] laptop:py-[8rem]"></section>', comfortable).length, 1)
  assert.equal(sectionPaddingHtml('<section class="section py-[3.2rem] laptop:py-[8rem]"></section>', compact).length, 1)
  assert.equal(sectionPaddingHtml('<div class="section-media py-[16rem]"></div>', comfortable).length, 0)
  assert.equal(sectionPaddingCss('.section { @apply py-[4rem] laptop:py-[16rem]; }', comfortable).length, 1)
  assert.equal(sectionPaddingCss('.section--intro { padding: 2rem 0; @media (min-width: 1280px) { padding-block: 10rem; } }', comfortable).length, 0)
  assert.ok(sectionPaddingCss('.section { padding-top: 7rem; }', comfortable).every(f => f.severity === 'warn'))
})
