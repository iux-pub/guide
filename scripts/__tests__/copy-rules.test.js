// 카피 규칙 — R-23 가짜·자리 콘텐츠, R-43 카피 톤 (scripts/lib/copy-rules.js)
// 안티슬롭 명세의 통과·실패 표본과 범위(납품·템플릿·스니펫·플레이그라운드·문서)별 심각도를 단언한다.

const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { spawnSync } = require('node:child_process')
const { test } = require('node:test')
const assert = require('node:assert/strict')

const ROOT = path.resolve(__dirname, '..', '..')
const c = require('../lib/copy-rules')
const { finalizeStarterPage } = require('../../cli/bin/create')

const COPY = c.loadCopyContracts(ROOT)
const ctx = (scope, extra = {}) => ({ scope, profile: null, copyAllow: [], copy: COPY, ...extra })
const html = (src, scope = 'deliverable', extra) => c.scanHtmlCopy(src, ctx(scope, extra))
const has = (findings, rule, severity = 'error') => findings.some(f => f.rule === rule && f.severity === severity)
const none = (findings, rule) => !findings.some(f => !rule || f.rule === rule)
const brief = findings => findings.map(f => `${f.rule}:${f.severity}:${f.code}`).join('\n')

test('계약: 저장소 계약을 읽고 빠진 파일이 없다', () => {
  assert.deepEqual(COPY.missing, [])
  assert.ok(COPY.translationese.length >= 8)
})

// ─── R-23 채움 문구·핫링크 ─────────────────────────────

test('R-23: lorem·자리 채움 문구는 오류, 플레이그라운드는 경고', () => {
  assert.ok(has(html('<p>Lorem ipsum dolor sit amet</p>'), 'R-23'))
  assert.ok(has(html('<p>내용이 여기에 들어갑니다</p>'), 'R-23'))
  assert.ok(has(html('<div><p>답변 1 내용</p></div>', 'snippet'), 'R-23'))
  assert.ok(has(html('<p>카드 본문 내용</p>', 'snippet'), 'R-23'))
  assert.ok(has(html('<p>모달 본문 내용입니다.</p>'), 'R-23'))
  assert.ok(has(html('<div role="tooltip">도움말 설명 텍스트</div>'), 'R-23'))
  assert.ok(has(html('<p>Lorem ipsum</p>', 'playground'), 'R-23', 'warn'))
  assert.ok(none(html('<p>Lorem ipsum</p>', 'playground'), 'R-23') === false)
})

test('R-23: 항목 이름(표 머리·레이블·색 역할)과 코드 블록은 채움 문구가 아니다', () => {
  assert.ok(none(html('<table><tr><th>본문 내용</th></tr></table>'), 'R-23'))
  assert.ok(none(html('<label for="body">본문 내용</label>'), 'R-23'))
  assert.ok(none(html('<span class="color-swatch__desc">본문 텍스트</span>'), 'R-23'))
  assert.ok(none(html('<pre><code>&lt;p&gt;답변 1 내용&lt;/p&gt;</code></pre>'), 'R-23'))
  assert.ok(none(html('<p>독서문화 프로그램은 매월 첫째 주 월요일부터 신청을 받습니다.</p>'), 'R-23'))
})

test('R-23: placeholder 핫링크는 속성·style·script 어디서든 오류다', () => {
  assert.ok(has(html('<img src="https://picsum.photos/400/300" alt="행사 사진">', 'doc'), 'R-23'))
  assert.ok(has(html('<img data-src="https://via.placeholder.com/1" alt="">'), 'R-23'))
  assert.ok(has(html('<div style="background:url(https://images.unsplash.com/photo-1)"></div>'), 'R-23'))
  assert.ok(has(html('<script>img.src = "https://i.pravatar.cc/80"</script>'), 'R-23'))
  assert.ok(has(html('<meta property="og:image" content="https://placehold.co/1200x630">'), 'R-23'))
  assert.ok(has(c.scanTextHotlinks('.hero { background: url(https://picsum.photos/1600/900); }', ctx('doc')), 'R-23'))
  assert.ok(none(html('<img src="/images/program-reading.jpg" alt="독서문화 프로그램 진행 모습">'), 'R-23'))
  assert.ok(none(html('<img src="https://cdn.myplacehold.com.kr/a.jpg" alt="공원 전경">'), 'R-23'))
})

// ─── R-23 연번 레이블·자리값 제목 ──────────────────────

const FAQ = `<div class="accordion">
  <details><summary>자주 묻는 질문 1</summary><p>민원 종류마다 다릅니다.</p></details>
  <details><summary>자주 묻는 질문 2</summary><p>접수 대기일 때 고칩니다.</p></details>
</div>`

test('R-23: 일반명사+번호 형제 레이블은 납품 오류, 스니펫 경고', () => {
  assert.ok(has(html(FAQ), 'R-23'))
  assert.ok(has(html(FAQ, 'snippet'), 'R-23', 'warn'))
  assert.ok(has(html('<div role="tablist"><button role="tab">탭 1</button><button role="tab">탭 2</button></div>'), 'R-23'))
})

test('R-23: 연번 레이블 예외 — 하나뿐인 항목, 숨김 텍스트, 명사 없는 번호', () => {
  assert.ok(none(html('<ul><li>질문 1</li><li>민원 처리 기간</li></ul>'), 'R-23'))
  assert.ok(none(html('<div><button><span class="sr-only">슬라이드 1</span></button><button><span class="sr-only">슬라이드 2</span></button></div>'), 'R-23'))
  assert.ok(none(html('<ol><li>1</li><li>2</li><li>3</li></ol>'), 'R-23'))
  assert.ok(none(html('<div><span>Q1</span><span>Q2</span></div>'), 'R-23'))
})

test('R-23: 자리값 제목 — 납품 오류, 템플릿·스니펫 경고, 문서·플레이그라운드 통과', () => {
  const page = '<html><head><title>새 프로젝트</title></head><body><h1>페이지 제목</h1><h2>모달 제목</h2><h3>제목</h3></body></html>'
  const d = html(page)
  assert.equal(d.filter(f => f.rule === 'R-23' && f.severity === 'error').length, 4, brief(d))
  assert.ok(has(html(page, 'template'), 'R-23', 'warn'))
  assert.ok(!has(html(page, 'template'), 'R-23', 'error'))
  assert.ok(has(html(page, 'snippet'), 'R-23', 'warn'))
  assert.ok(none(html(page, 'doc'), 'R-23'))
  assert.ok(none(html('<h1>공지사항</h1><h2>게시판 이용 안내</h2>'), 'R-23'))
})

// ─── R-23 지어낸 연락처·기관명 자리값 ─────────────────

test('R-23: 비실재 표기(064-000-0000·○○·example 도메인)는 납품에서만 오류, 스니펫은 통과', () => {
  for (const src of ['<p>대표전화 064-000-0000</p>', '<p>○○시청 민원실</p>', '<p>문의: help@example.go.kr</p>', '<p>담당자 홍길동</p>', '<a href="https://example.com/apply">신청</a>']) {
    assert.ok(has(html(src), 'R-23'), src)
    assert.ok(none(html(src, 'snippet'), 'R-23'), src)
  }
})

test('R-23: 실재처럼 보이는 가짜 번호는 스니펫에서도 경고', () => {
  assert.ok(has(html('<p>대표전화 02-1234-5678</p>'), 'R-23'))
  assert.ok(has(html('<p>대표전화 064-123-4567</p>', 'snippet'), 'R-23', 'warn'))
  assert.ok(has(html('<p>사업자등록번호 123-45-67890</p>', 'playground'), 'R-23', 'warn'))
})

test('R-23: 연락처 예외 — 성씨 마스킹, 영어 낱말 속 OO, 형식 예시', () => {
  assert.ok(none(html('<p>담당 김○○ 주무관</p>'), 'R-23'))
  assert.ok(none(html('<p>OOP 교육 과정</p>'), 'R-23'))
  assert.ok(none(html('<p class="form__hint">예: 010-1234-5678</p>'), 'R-23'))
})

test('R-23: 기관명 자리값은 이름 자리(title 조각·로고 alt·저작권)에서만 오류', () => {
  assert.ok(has(html('<title>공지사항 | 기관명</title>'), 'R-23'))
  assert.ok(has(html('<a class="site-header__logo" href="/"><img src="/logo.svg" alt="사이트명"></a>'), 'R-23'))
  assert.ok(has(html('<p class="site-footer__copyright">© 2026 회사명. All rights reserved.</p>'), 'R-23'))
  assert.ok(has(html('<meta property="og:site_name" content="서비스명">'), 'R-23'))
  assert.ok(none(html('<table><tr><th>기관명</th><td>제주특별자치도</td></tr></table>'), 'R-23'))
  assert.ok(none(html('<title>공지사항 | 기관명</title>', 'snippet'), 'R-23'))
})

// ─── R-23 수치 밴드·가짜 후기 ─────────────────────────

test('R-23: 출처 없는 수치 밴드는 경고, 출처·기준일이 있으면 통과', () => {
  const band = '<section><h2>성과</h2><dl><dt>이용자</dt><dd>12,000명</dd><dt>만족도</dt><dd>98%</dd><dt>센터</dt><dd>24곳</dd></dl></section>'
  assert.ok(has(html(band), 'R-23', 'warn'))
  assert.ok(none(html(band.replace('</dl>', '</dl><p>출처: 운영 현황(2026년 3월 기준)</p>')), 'R-23'))
  assert.ok(none(html(band, 'doc'), 'R-23'))
  assert.ok(none(html('<dl><dt>설립</dt><dd>2001년</dd><dt>직원</dt><dd>2024년</dd><dt>위치</dt><dd>제주시</dd></dl>'), 'R-23'))
})

test('R-23: 마스킹 이름·별점 후기는 바깥 요소에서 한 번 경고', () => {
  const r = html('<section class="review"><ul><li class="review__item"><p>친절해요</p><span>김○○ 고객</span></li></ul></section>')
  assert.equal(r.filter(f => f.rule === 'R-23').length, 1, brief(r))
  assert.ok(has(r, 'R-23', 'warn'))
  assert.ok(none(html('<div class="preview"><p>김○○ 고객</p></div>'), 'R-23'))
})

test('R-23: 템플릿 표시가 남은 페이지는 매번 알린다', () => {
  const page = '<head><meta name="infoux:template" content="starter"><title>새 프로젝트</title></head>'
  const r = html(page, c.copyScopeOf('/index.html', page, { isPage: true, copy: COPY }))
  assert.ok(r.some(f => f.rule === 'R-23' && f.severity === 'warn' && /틀 표시/.test(f.message)), brief(r))
  assert.ok(!has(r, 'R-23', 'error'))
})

// ─── 범위 판정 ─────────────────────────────────────────

test('범위: 템플릿 > 납품 > 스니펫 > 플레이그라운드 > 문서', () => {
  const marked = '<meta name="infoux:template" content="starter">'
  assert.equal(c.copyScopeOf('/index.html', marked, { isPage: true, copy: COPY }), 'template')
  assert.equal(c.copyScopeOf('/pages/notice.html', '<p></p>', { isPage: true, copy: COPY }), 'deliverable')
  assert.equal(c.copyScopeOf('/src/snippets/card.md', '', { copy: COPY }), 'snippet')
  assert.equal(c.copyScopeOf('/site/components/card.md', '', { copy: COPY }), 'snippet')
  assert.equal(c.copyScopeOf('/site/prompts/components.md', '', { copy: COPY }), 'snippet')
  assert.equal(c.copyScopeOf('/src/playground/tab.html', '', { copy: COPY }), 'playground')
  assert.equal(c.copyScopeOf('/site/tokens/color.md', '', { copy: COPY }), 'doc')
  // 마크다운이 표시를 예시로 실어도 템플릿이 되지 않는다
  assert.equal(c.copyScopeOf('/site/onboarding/starter.md', marked, { copy: COPY }), 'doc')
})

// ─── R-43 번역투·2인칭 마케팅 ─────────────────────────

test('R-43: 제목·버튼·도입부의 번역투는 오류, 본문은 경고', () => {
  assert.ok(has(html('<h2>당신만의 여정을 시작하세요</h2>'), 'R-43'))
  assert.ok(has(html('<section class="section section--intro"><p>새로운 차원의 행정 서비스를 경험하세요</p></section>'), 'R-43'))
  assert.ok(has(html('<a class="btn btn--primary" href="/apply">지금 바로 신청</a>'), 'R-43'))
  assert.ok(has(html('<button type="button" aria-label="무료로 시작">시작</button>'), 'R-43'))
  assert.ok(has(html('<p>당신의 정보는 안전하게 보관됩니다.</p>'), 'R-43', 'warn'))
  assert.ok(!has(html('<p>당신의 정보는 안전하게 보관됩니다.</p>'), 'R-43', 'error'))
})

test('R-43: 번역투 예외 — 바로가기 링크, 공식 대피 안내, 인용·코드·외국어·따옴표', () => {
  assert.ok(none(html('<a href="/" class="link">지금 바로가기</a>'), 'R-43'))
  assert.ok(none(html('<p>지금 바로 높은 곳으로 대피하십시오.</p>'), 'R-43'))
  assert.ok(none(html('<blockquote><p>당신의 하루를 응원합니다</p></blockquote>'), 'R-43'))
  assert.ok(none(html('<p><code>경험하세요</code> 같은 문구를 쓰지 않는다</p>'), 'R-43'))
  assert.ok(none(html('<h2 lang="en">Discover your journey</h2>'), 'R-43'))
  assert.ok(none(html('<p>“당신”이라는 말은 쓰지 않습니다.</p>'), 'R-43'))
  assert.ok(none(html('<p>담당신청 접수는 민원실에서 받습니다.</p>'), 'R-43'))
})

test('R-43: copyAllow에 둔 고유 문구(공식 슬로건)는 통과한다', () => {
  const slogan = '<h1>도민과 함께! 미래를 만나는 제주</h1>'
  assert.ok(has(html(slogan, 'deliverable', { profile: 'public-service' }), 'R-43'))
  assert.ok(none(html(slogan, 'deliverable', { profile: 'public-service', copyAllow: ['도민과 함께! 미래를 만나는 제주'] }), 'R-43'))
})

// ─── R-43 재촉형 버튼 ─────────────────────────────────

test("R-43: '~하세요·~하십시오·~해 보세요'로 끝나는 버튼 이름은 오류", () => {
  assert.ok(has(html('<button type="submit">신청하세요</button>'), 'R-43'))
  assert.ok(has(html('<a class="btn" href="/join">가입해 보세요 →</a>'), 'R-43'))
  assert.ok(has(html('<input type="submit" value="제출하십시오">'), 'R-43'))
  assert.ok(has(html('<button type="button" aria-label="검색하세요"><svg aria-hidden="true"></svg></button>'), 'R-43'))
  assert.ok(has(html('<div role="button" tabindex="0">확인해 주세요</div>'), 'R-43'))
})

test('R-43: KRDS 동사형 레이블과 아이콘 버튼은 통과한다', () => {
  for (const src of [
    '<button type="submit" class="btn btn--primary">신청하기</button>',
    '<button type="button"><svg aria-hidden="true"></svg><span>검색</span></button>',
    '<a class="btn btn--secondary" href="/list">목록</a>',
    '<button type="button" aria-label="닫기">×</button>'
  ]) assert.ok(none(html(src), 'R-43'), src)
})

// ─── R-43 느낌표 ──────────────────────────────────────

test('R-43: 공공서비스는 제목·버튼·도입부 느낌표가 오류, 본문은 경고', () => {
  const ps = { profile: 'public-service' }
  assert.ok(has(html('<h1>신청이 완료되었습니다!</h1>', 'deliverable', ps), 'R-43'))
  assert.ok(has(html('<button type="button">확인!</button>', 'deliverable', ps), 'R-43'))
  assert.ok(has(html('<p>오늘부터 신청할 수 있습니다!</p>', 'deliverable', ps), 'R-43', 'warn'))
  assert.ok(!has(html('<p>오늘부터 신청할 수 있습니다!</p>', 'deliverable', ps), 'R-43', 'error'))
})

test('R-43: 공공기관·관리자는 경고, 일반·커머스는 제목·버튼만 경고', () => {
  assert.ok(has(html('<p>새 기능이 열렸습니다!</p>', 'deliverable', { profile: 'cms-admin' }), 'R-43', 'warn'))
  assert.ok(has(html('<h2>여름 세일!</h2>', 'deliverable', { profile: 'commerce-reservation' }), 'R-43', 'warn'))
  assert.ok(none(html('<p>오늘 도착!</p>', 'deliverable', { profile: 'commerce-reservation' }), 'R-43'))
  assert.ok(has(html('<h2>여름 세일!</h2>', 'deliverable', { profile: 'general-site' }), 'R-43', 'warn'))
  assert.ok(none(html('<p>if (a != b) return</p>', 'deliverable', { profile: 'public-service' }), 'R-43'))
  assert.ok(none(html('<img src="/a.png" alt="축제 포스터: 놀러 오세요!">', 'deliverable', { profile: 'public-service' }), 'R-43'))
})

// ─── 마크다운 ─────────────────────────────────────────

test('마크다운: html 펜스·원시 HTML 블록은 트리로, 본문 문장은 채움 문구·핫링크만 본다', () => {
  const md = [
    '# 카드',
    '',
    '당신의 서비스를 경험하세요 같은 문구를 설명하는 문장은 R-43 대상이 아니다.',
    '',
    '```html',
    '<h3 class="card__title">카드 제목</h3>',
    '<button type="button">신청하세요</button>',
    '```',
    '',
    '<div class="docs-preview">',
    '  <h2>당신만의 여정</h2>',
    '</div>',
    '',
    '본문의 `Lorem ipsum` 인용은 통과하지만 Lorem ipsum 문장은 잡힌다.',
    '',
    '```html',
    '<!-- ❌ 금지 예 -->',
    '<p>Lorem ipsum</p>',
    '```'
  ].join('\n')
  const r = c.scanMarkdownCopy(md, ctx('snippet'))
  const lines = r.map(f => `${f.rule}@${f.line}`)
  assert.ok(lines.includes('R-23@6'), lines.join(' '))
  assert.ok(lines.includes('R-43@7'), lines.join(' '))
  assert.ok(lines.includes('R-43@11'), lines.join(' '))
  assert.ok(lines.includes('R-23@14'), lines.join(' '))
  assert.ok(!lines.some(l => /@3$|@18$/.test(l)), lines.join(' '))
})

// ─── 스타터 틀 → 새 프로젝트 ─────────────────────────

test('스타터: index.html은 틀 표시를 달고, create가 표시를 지우고 제목을 채운다', () => {
  const src = fs.readFileSync(path.join(ROOT, 'starter', 'index.html'), 'utf8')
  assert.ok(c.hasTemplateMarker(src, COPY))
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'iux-create-'))
  fs.writeFileSync(path.join(dir, 'index.html'), src)
  assert.equal(finalizeStarterPage(dir, 'jeju-portal'), true)
  const out = fs.readFileSync(path.join(dir, 'index.html'), 'utf8')
  assert.ok(!c.hasTemplateMarker(out, COPY))
  assert.ok(!/스타터 틀 표시/.test(out))
  assert.match(out, /<title>jeju-portal<\/title>/)
  assert.match(out, /<h1 id="page-title">jeju-portal<\/h1>/)
  assert.ok(none(html(out), 'R-23'), brief(html(out)))
})

// ─── 리뷰 회귀: 파서 ─────────────────────────────────
const ps = { profile: 'public-service' }

test('파서: 인라인 강조·줄바꿈으로 쪼갠 문구는 덩어리로 본다(예외·인용·허용이 깨지지 않고, 쪼갠 슬롭도 잡는다)', () => {
  assert.ok(none(html('<h2 class="alert__title">지금 바로 <strong>대피하십시오</strong></h2>', 'deliverable', ps), 'R-43'))
  assert.ok(none(html('<h2>지금 바로<br>대피하십시오</h2>', 'deliverable', ps), 'R-43'))
  assert.ok(none(html('<h2>“<em>당신</em>의 이야기” 공모전 수상작</h2>'), 'R-43'))
  assert.ok(none(html('<section class="hero"><h1>도민과 함께!<br>미래를 만나는 제주</h1></section>', 'deliverable', { ...ps, copyAllow: ['도민과 함께! 미래를 만나는 제주'] }), 'R-43'))
  assert.ok(none(html('<a class="btn" href="/apply">지금 바로<br>가기</a>'), 'R-43'))
  assert.ok(has(html('<h1><em>지금</em> 바로 신청하는 민원</h1>'), 'R-43'))
  assert.ok(has(html('<h1>새로운 <strong>차원</strong>의 행정 서비스</h1>'), 'R-43'))
  assert.ok(has(html('<h2>접수 마감 임박<span class="point">!</span></h2>', 'deliverable', ps), 'R-43'))
})

test('파서: svg <title>은 문서 제목이 아니다', () => {
  const sprite = '<body><svg style="display:none"><symbol id="ico-home"><title>Home</title></symbol><symbol id="ico-doc"><title>Document</title></symbol></svg><main><h1>민원 안내</h1></main></body>'
  assert.ok(none(html(sprite), 'R-23'), brief(html(sprite)))
})

test('파서: 이름 엔티티 따옴표·대시를 푼다', () => {
  assert.ok(none(html('<h2>&ldquo;당신의 이야기&rdquo; 공모전</h2>'), 'R-43'))
  assert.ok(has(html('<title>기관명 &ndash; 민원 안내</title>'), 'R-23'))
  assert.equal(require('../lib/html-tree').decodeEntities('&#38;lt;'), '&lt;')
})

test('파서: 종료 태그 생략(li·dd)·다른 단계 제목 종료·붙은 속성·중첩 template·반응형 표시', () => {
  assert.ok(has(html('<ul><li>질문 1<li>질문 2</ul>'), 'R-23'))
  assert.ok(has(html('<section><dl><dt>이용자<dd>12,000명<dt>만족도<dd>98%<dt>센터<dd>24곳</dl></section>'), 'R-23', 'warn'))
  const h = html('<h2>소개</h3><p>당신의 정보는 안전합니다.</p>')
  assert.ok(has(h, 'R-43', 'warn') && !has(h, 'R-43', 'error'), brief(h))
  assert.ok(has(html('<a href="/x"class="btn">신청하세요</a>'), 'R-43'))
  assert.ok(none(html('<template><div><template><p>x</p></template><p>Lorem ipsum</p><h2>당신의 여정</h2></div></template>')))
  assert.ok(has(html('<div role="tablist"><button role="tab" class="hidden laptop:inline-flex">탭 1</button><button role="tab" class="hidden laptop:inline-flex">탭 2</button></div>'), 'R-23'))
})

test('파서: style·script 안 핫링크는 줄마다, 주석은 빼고 알린다', () => {
  const src = '<style>\n/* picsum.photos 금지 */\n.a { background: url(https://picsum.photos/1); }\n.b { background: url(https://placehold.co/2); }\n</style>'
  const r = html(src).filter(f => f.rule === 'R-23')
  assert.deepEqual(r.map(f => f.line), [3, 4], brief(r))
})

test('파서: 여러 줄 문단의 위반은 그 글자가 있는 줄로 알린다', () => {
  const r = html('<p>\n  첫 줄 안내입니다.\n  둘째 줄에 당신의 정보가 있습니다.\n</p>')
  assert.equal(r.find(f => f.rule === 'R-43').line, 3)
})

// ─── 리뷰 회귀: R-43 ─────────────────────────────────

test('R-43: <html lang="en">이어도 한글 문구는 검사하고, 한글 없는 영어는 뺀다', () => {
  assert.ok(has(html('<html lang="en"><body><h2>당신만의 여정</h2></body></html>'), 'R-43'))
  assert.ok(none(html('<html lang="en"><body><h2>Welcome!</h2></body></html>', 'deliverable', ps), 'R-43'))
})

test("R-43: '지금 시작하세요'·재촉 어미 일반형·느낌표 변형", () => {
  assert.ok(has(html('<h1>지금 시작하세요</h1>'), 'R-43'))
  assert.ok(has(html('<button type="button">쿠폰 받으세요</button>'), 'R-43'))
  assert.ok(has(html('<button type="button">알려주십시오</button>'), 'R-43'))
  assert.ok(has(html('<button type="button">가입하세요~!</button>'), 'R-43'))
  assert.ok(has(html('<h2>놀러 오세요~!</h2>', 'deliverable', ps), 'R-43'))
  assert.ok(has(html('<h2>오픈！</h2>', 'deliverable', ps), 'R-43'))
  assert.ok(has(html('<h2>오픈!10월</h2>', 'deliverable', ps), 'R-43'))
  assert.ok(none(html('<h2>CSS !important 사용 금지</h2>', 'deliverable', ps), 'R-43'))
})

test('R-43: 버튼 이름은 aria-label과 보이는 글을 둘 다 본다(새 창 안내 sr-only 꼬리 포함)', () => {
  assert.ok(has(html('<button type="button">신청하세요<span class="sr-only">새 창 열림</span></button>'), 'R-43'))
  assert.ok(none(html('<a class="btn" href="/apply" target="_blank">신청하기<span class="sr-only">새 창 열림</span></a>'), 'R-43'))
  assert.ok(has(html('<button type="button" aria-label="신청">지금 신청하세요</button>'), 'R-43'))
})

test('R-43: 탭·목록 펼침·아코디언 트리거는 행동 버튼이 아니다', () => {
  assert.ok(none(html('<button type="button" aria-haspopup="listbox">선택하세요</button>'), 'R-43'))
  assert.ok(none(html('<h3><button type="button" aria-expanded="false">꼭 챙기세요</button></h3>'), 'R-43'))
  assert.ok(none(html('<button type="button" role="tab">확인하세요</button>'), 'R-43'))
  assert.ok(has(html('<button type="button" aria-haspopup="dialog">지금 신청하세요</button>'), 'R-43'))
})

test('R-43: 영어 아포스트로피는 따옴표가 아니고, 제주 당신(堂神) 복합어는 통과한다', () => {
  assert.ok(has(html("<p>Editor's Pick 당신의 Today's</p>"), 'R-43', 'warn'))
  assert.ok(none(html('<h2>당신본풀이와 마을 신당</h2>'), 'R-43'))
})

test('R-43: role=img·img의 aria-label·title은 alt처럼 본다', () => {
  const r = html('<div role="img" aria-label="지금 바로 놀러 오세요!"></div>', 'deliverable', ps)
  assert.ok(has(r, 'R-43', 'warn') && !has(r, 'R-43', 'error'), brief(r))
})

test("R-43: '…하십시오' 예외는 문장마다 — 같은 문단의 다른 문장이 예외를 빌려 주지 않는다", () => {
  assert.ok(has(html('<section class="section--intro"><p>지금 바로 가입하면 혜택이 있습니다. 문의는 대표전화로 하십시오.</p></section>'), 'R-43'))
  assert.ok(none(html('<p>지금 바로 높은 곳으로 대피하십시오. 엘리베이터를 이용하지 마십시오.</p>'), 'R-43'))
})

test('R-43: aria-label과 보이는 글이 같으면 한 번만 알린다', () => {
  const r = html('<a class="btn" href="/benefit" aria-label="당신의 혜택">당신의 혜택</a>').filter(f => f.rule === 'R-43')
  assert.equal(r.length, 1, brief(r))
})

// ─── 리뷰 회귀: R-23 ─────────────────────────────────

test('R-23: 채움 문구 — 수식어가 붙은 문장·영문 자리 문구·쪼갠 문구는 잡고, 구조 설명은 놓아준다', () => {
  for (const src of [
    '<p>카드에 대한 간단한 설명이 들어갑니다.</p>',
    '<p>여기에 회사 소개 내용이 들어갑니다.</p>',
    '<p>서비스 소개 문구가 들어갈 자리입니다.</p>',
    '<p>샘플 텍스트입니다.</p>',
    '<p>이곳은 서비스 설명 영역입니다.</p>',
    '<p>Your text here</p>',
    '<p>서비스 설명이<br>들어갈 자리입니다.</p>',
    '<p>여기에 <strong>내용이</strong> 들어갑니다.</p>',
    '<p>카드 본문 내용입니다. 다양한 정보를 표시할 수 있습니다.</p>'
  ]) assert.ok(has(html(src), 'R-23'), src)
  assert.ok(none(html('<p>카드 제목 아래에는 한두 줄 요약 설명이 들어갑니다.</p>'), 'R-23'))
  const md = c.scanMarkdownCopy('카드 제목 아래에는 한두 줄 요약 설명이 들어갑니다.\n\n개발 서버의 더미 데이터는 매일 초기화된다.\n', ctx('doc'))
  assert.ok(none(md, 'R-23'), brief(md))
})

test('R-23: 핫링크는 어느 속성이든 잡는다', () => {
  for (const src of [
    '<svg><image xlink:href="https://picsum.photos/1"></image></svg>',
    '<div data-background="https://images.unsplash.com/a"></div>',
    '<img data-original="https://placehold.co/1" src="/a.jpg" alt="">',
    '<object data="https://placehold.co/1"></object>',
    '<link rel="preload" imagesrcset="https://picsum.photos/1 1x">',
    '<img src="/a.jpg" onerror="this.src=\'https://placehold.co/1\'" alt="">',
    '<img src="/a.jpg" data-placeholder="https://picsum.photos/20" alt="">',
    '<img src="https://plus.unsplash.com/premium.jpg" alt="">'
  ]) assert.ok(has(html(src), 'R-23'), src)
})

test('R-23: 성씨 마스킹은 호칭·조사·복성까지 통과, 자리 표기는 잡는다', () => {
  for (const src of ['<p>김○○님께 감사드립니다.</p>', '<p>이OO씨가 문의했습니다.</p>', '<p>담당 남궁○○</p>', '<p>황보OO 고객</p>', '<p>김○○의 질문</p>']) assert.ok(none(html(src), 'R-23'), src)
  for (const src of ['<p>제○○호</p>', '<p>김○○시 민원실</p>', '<p>담당자 OOO</p>', '<p>담당자 ○○○</p>', '<p>◯◯구청</p>', '<p>XX구 XX로 12</p>', '<p>△△동 주민센터</p>']) assert.ok(has(html(src), 'R-23'), src)
  assert.ok(none(html('<p>OOP 교육 과정</p>'), 'R-23'))
})

test('R-23: 전화번호 표기 변형·자리 이메일·tel 링크를 잡는다', () => {
  for (const src of ['<p>(064) 000-0000</p>', '<p>064.000.0000</p>', '<p>02)1234-5678</p>', '<p>02 1234 5678</p>', '<p>010-XXXX-XXXX</p>', '<p>example@email.com</p>', '<a href="tel:064-000-0000">전화 문의</a>', '<a href="tel:02-1234-5678">전화 문의</a>']) assert.ok(has(html(src), 'R-23'), src)
})

test("R-23: '홍길동'은 사람 이름 자리에서만, 고유명사(홍길동전·홍길동테마파크)는 통과", () => {
  assert.ok(none(html('<p>추천도서: 홍길동전</p><p>장성 홍길동테마파크 안내</p>'), 'R-23'))
  assert.ok(has(html('<p>담당자 홍길동</p>'), 'R-23'))
})

test('R-23: 예시 면제는 예시 조각과 문서용 예시 상자에만', () => {
  assert.ok(has(html('<main class="examples"><p>대표전화 064-000-0000</p></main>'), 'R-23'))
  assert.ok(has(html('<p>대표전화 064-000-0000 (예: 평일 09:00~18:00)</p>'), 'R-23'))
  assert.ok(none(html('<p class="form__hint">예: <strong>010-1234-5678</strong></p>'), 'R-23'))
  assert.ok(none(html('<div class="example"><p>대표전화 064-000-0000</p></div>', 'doc'), 'R-23'))
})

test('R-23: 저작권·브랜드 자리값 변형', () => {
  assert.ok(has(html('<footer><p class="site-footer__copyright">Copyright ⓒ 2026 기관명. All rights reserved.</p></footer>'), 'R-23'))
  assert.ok(has(html('<header><a class="site-header__brand" href="/"><span class="site-header__name"><strong>기관명</strong></span></a></header>'), 'R-23'))
  assert.ok(none(html('<p class="site-footer__copyright">© 2026 제주특별자치도</p>'), 'R-23'))
})

test('R-23: 자리값 제목 — h1도 부품 제목 패턴, title은 조각마다', () => {
  for (const src of ['<h1>제목을 입력하세요</h1>', '<h1>모달 제목</h1>', '<title>페이지 제목 | 서울시립도서관</title>', '<title>새 프로젝트 | 서울시립도서관</title>']) assert.ok(has(html(src), 'R-23'), src)
  for (const src of ['<title>Home | 서울시립도서관</title>', '<title>홈 | 서울시립도서관</title>', '<h1>공지사항</h1>']) assert.ok(none(html(src), 'R-23'), src)
})

test('R-23: 연번 — KRDS 버튼형 아코디언·카드 그리드는 잡고, 폼 업로드 칸은 놓아준다. 조각 최상위 형제도 본다', () => {
  const krds = n => `<div class="accordion-item"><h3><button class="btn-accordion" aria-expanded="false">자주 묻는 질문 ${n}</button></h3><div class="accordion-collapse"><p>민원 종류마다 다릅니다.</p></div></div>`
  assert.ok(has(html(`<div class="accordion">${krds(1)}${krds(2)}</div>`), 'R-23'))
  assert.ok(has(html('<ul><li class="card"><h3>카드 제목 1</h3><p>설명</p></li><li class="card"><h3>카드 제목 2</h3><p>설명</p></li></ul>'), 'R-23'))
  assert.ok(has(html('<ul><li><h3>Feature 1</h3></li><li><h3>Feature 2</h3></li></ul>'), 'R-23'))
  const slot = n => `<div class="form-field"><label for="img${n}">상품 이미지 ${n}</label><input type="file" id="img${n}"></div>`
  assert.ok(none(html(`<form>${slot(1)}${slot(2)}${slot(3)}</form>`), 'R-23'))
  assert.ok(has(html('<details><summary>자주 묻는 질문 1</summary></details><details><summary>자주 묻는 질문 2</summary></details>'), 'R-23'))
})

test('R-23: 수치 밴드 — 공문서 기준일은 출처로 보고, 개수만 이어진 운영 정보는 밴드가 아니다', () => {
  const band = '<section><dl><dt>이용자</dt><dd>12,000명</dd><dt>만족도</dt><dd>98%</dd><dt>센터</dt><dd>24곳</dd></dl>'
  for (const mark of ['<p>2026. 9. 30. 기준</p>', '<p>(2026.09.30 기준)</p>', '<p>2026년 9월 30일 기준</p>', '<p>2026년 9월 말 현재</p>']) assert.ok(none(html(`${band}${mark}</section>`), 'R-23'), mark)
  assert.ok(has(html(`${band}<p>출처를 밝히지 않은 수치입니다.</p></section>`), 'R-23', 'warn'))
  assert.ok(none(html('<ol class="rank"><li><strong>1위</strong> 감귤</li><li><strong>2위</strong> 한라봉</li><li><strong>3위</strong> 천혜향</li></ol>'), 'R-23'))
  assert.ok(none(html('<ul><li><strong>2명</strong> 스탠다드</li><li><strong>3명</strong> 디럭스</li><li><strong>4명</strong> 패밀리</li></ul>'), 'R-23'))
  assert.ok(none(html('<ul><li><span class="product__discount">15%</span></li><li><span class="product__discount">20%</span></li><li><span class="product__discount">30%</span></li></ul>'), 'R-23'))
  const grid = '<section><div class="stats"><div class="stat"><span class="stat__value">10,000+</span><span class="stat__label">이용자</span></div><div class="stat"><span class="stat__value">99.9%</span></div><div class="stat"><span class="stat__value">50만 명</span></div></div></section>'
  assert.ok(has(html(grid), 'R-23', 'warn'))
})

test('R-23: 출처가 있는 후기 묶음은 경고하지 않는다', () => {
  assert.ok(none(html('<section class="review"><ul><li><p>친절해요</p><span>김○○ 고객</span></li></ul><p>출처: 2026년 고객 만족도 조사(2026. 6. 30. 기준)</p></section>'), 'R-23'))
})

test('범위: 틀 표시는 트리로 — 주석 처리한 표시는 표시가 아니고, 루트 index.html 밖 납품 페이지는 표시가 있어도 납품', () => {
  const commented = '<head><!-- <meta name="infoux:template" content="starter"> --><title>새 프로젝트</title></head>'
  assert.equal(c.copyScopeOf('/index.html', commented, { isPage: true, copy: COPY }), 'deliverable')
  const upper = '<head><meta name="INFOUX:TEMPLATE" content="starter"><title>새 프로젝트</title></head>'
  assert.equal(c.copyScopeOf('/index.html', upper, { isPage: true, copy: COPY }), 'template')
  assert.ok(html(upper, 'template').some(f => /틀 표시/.test(f.message)))
  const marked = '<head><meta name="infoux:template" content="starter"><title>새 프로젝트</title></head>'
  const scope = c.copyScopeOf('/pages/notice.html', marked, { isPage: true, copy: COPY })
  assert.equal(scope, 'deliverable')
  const r = html(marked, scope)
  assert.ok(has(r, 'R-23') && r.some(f => /루트 index\.html 전용/.test(f.message)), brief(r))
})

test('마크다운: markdown 펜스 안 html 펜스, jsx·무표기 펜스, 인라인 태그로 시작하는 문단', () => {
  const md = ['````markdown', '```html', '<h3 class="card__title">카드 제목</h3>', '```', '````', '', '```jsx', 'const t = "Lorem ipsum"', '```', '', '```', '<img src="https://picsum.photos/1">', '```', '', '<strong>주의</strong> — 당신의 정보는 안전합니다!', ''].join('\n')
  const r = c.scanMarkdownCopy(md, ctx('snippet'))
  const lines = r.map(f => `${f.rule}:${f.severity}@${f.line}`)
  assert.ok(lines.includes('R-23:warn@3'), lines.join(' '))
  assert.ok(lines.includes('R-23:error@8'), lines.join(' '))
  assert.ok(lines.includes('R-23:error@12'), lines.join(' '))
  assert.ok(!lines.some(l => l.startsWith('R-43')), lines.join(' '))
})

test('JS: 주석 속 호스트는 통과, 문자열의 핫링크·lorem은 오류, 지어낸 연락처는 경고', () => {
  const js = "// 자리 이미지(placehold.co)로 채우지 않는다\nimg.src = 'https://picsum.photos/400' // 실제 사용\nconst t = 'Lorem ipsum dolor'\nconst who = '담당자 홍길동'\n"
  const r = c.scanJsCopy(js, ctx('doc'))
  assert.deepEqual(r.map(f => `${f.severity}@${f.line}`).sort(), ['error@2', 'error@3', 'warn@4'], brief(r))
})

// ─── 2차 리뷰 회귀 ───────────────────────────────────

test('2차: 인라인 사이 공백·sr-only·aria-hidden 조각이 덩어리 판정을 흐리지 않는다', () => {
  assert.ok(none(html('<p>지금 바로 <em>안전한</em> <strong>곳으로 대피하십시오</strong></p>', 'deliverable', ps), 'R-43'))
  assert.ok(has(html('<h2><em>제주</em> <em>당신의 여정</em></h2>'), 'R-43'))
  assert.ok(none(html('<a href="/shelter">지금 바로 대피소를 확인하십시오<span class="sr-only">새 창 열림</span></a>', 'deliverable', ps), 'R-43'))
  assert.ok(none(html('<h2>공지<span aria-hidden="true">!</span></h2>', 'deliverable', ps), 'R-43'))
  assert.ok(has(html('<html lang="en"><body><h2>신청 마감<span>!</span></h2></body></html>', 'deliverable', ps), 'R-43'))
  assert.ok(none(html('<p><span lang="en">Visit Jeju!</span> 제주 여행 안내입니다.</p>', 'deliverable', ps), 'R-43'))
})

test('2차: template·textarea 안 핫링크, 주석 속 <template> 글자', () => {
  assert.ok(has(html('<template><img src="https://picsum.photos/1" alt=""></template>'), 'R-23'))
  assert.ok(none(html('<textarea>문의 내용을 적어 주십시오.</textarea>')))
  assert.ok(has(html('<template><!-- <template> --><p>x</p></template><p>Lorem ipsum</p>'), 'R-23'))
})

test('2차: 채움 문장 — 실제 안내문(○○에·○○에는)은 놓아주고 화면 부품 자리 문구는 잡는다', () => {
  for (const src of ['<p>카드 앞면에 본인 사진이 들어갑니다.</p>', '<p>신청서에는 신청인 정보와 신청 내용이 들어갑니다.</p>', '<p>봉투에 반송 주소와 사진이 들어갑니다.</p>']) assert.ok(none(html(src), 'R-23'), src)
  for (const src of ['<p>메인 배너에 이미지가 들어갑니다.</p>', '<p>카드에 대한 간단한 설명이 들어갑니다.</p>']) assert.ok(has(html(src), 'R-23'), src)
})

test('2차: 수치 밴드 — 금액·할인율은 밴드가 아니고, 그림·표 밖 출처와 연 단위 기준일도 출처다', () => {
  assert.ok(none(html('<section><ul><li><strong>30만 원</strong> 청년</li><li><strong>40만 원</strong> 신혼</li><li><strong>50만 원</strong> 다자녀</li></ul></section>'), 'R-23'))
  assert.ok(none(html('<ul><li><strong>15%</strong> 봄 할인</li><li><strong>20%</strong> 회원 할인</li><li><strong>30%</strong> 마감 할인</li></ul>'), 'R-23'))
  const band = '<ul><li><strong>98%</strong> 만족</li><li><strong>50만</strong> 이용</li><li><strong>3배</strong> 증가</li></ul>'
  assert.ok(none(html(`<figure><figcaption>출처: 통계청</figcaption>${band}</figure>`), 'R-23'))
  assert.ok(none(html(`<section>${band}<p>(2025년 기준)</p></section>`), 'R-23'))
  assert.ok(none(html(`<section>${band}<p>출처 통계청 사회조사</p></section>`), 'R-23'))
  assert.ok(has(html(`<section>${band}</section>`), 'R-23', 'warn'))
})

test('2차: 마스킹 이름 호칭·조사, 저작권 열거, 브랜드 판정', () => {
  for (const src of ['<p>김○○에게 전달했습니다.</p>', '<p>박○○교수 강연</p>', '<p>이○○도 참석</p>', '<li>(c) 회사명 변경 신고</li>', '<div class="brand-apply"><label for="b">브랜드명</label><input id="b"></div>']) assert.ok(none(html(src), 'R-23'), src)
  assert.ok(has(html('<header><a class="logo" href="/">기관명 <span>홈</span></a></header>'), 'R-23'))
})

test('2차: 디스클로저·콤보박스는 행동 버튼이 아니다', () => {
  assert.ok(none(html('<button type="button" aria-expanded="false" aria-controls="more">자세히 확인하세요</button>'), 'R-43'))
  assert.ok(none(html('<button type="button" role="combobox">선택하세요</button>'), 'R-43'))
})

test("2차: 예시 조각은 줄·문장 끝까지만, 'ex)'도 예시", () => {
  assert.ok(has(html('<p>예: 평일 09:00<br>대표전화 064-000-0000</p>'), 'R-23'))
  assert.ok(none(html('<p class="form__hint">ex) 010-1234-5678</p>'), 'R-23'))
})

test('2차: 마스킹 서명 <cite>는 후기 출처가 아니고, 폼 밖 체크박스 토글 아코디언은 연번을 본다', () => {
  assert.ok(has(html('<blockquote><p>정말 좋아요</p><cite>김○○ 고객</cite></blockquote>'), 'R-23', 'warn'))
  const item = n => `<div><input type="checkbox" id="q${n}"><label for="q${n}">자주 묻는 질문 ${n}</label><p>민원 종류마다 다릅니다.</p></div>`
  assert.ok(has(html(`<div class="faq">${item(1)}${item(2)}</div>`), 'R-23'))
})

test('2차: </p>를 생략한 문단 수천 개도 끝까지 검사한다', () => {
  const src = '<main>' + Array.from({ length: 3000 }, (_, i) => `<p>안내 ${i}`).join('\n') + '</main>'
  assert.doesNotThrow(() => html(src))
})

test('문서: rules.json의 good 예시는 납품 기준에서도 R-23·R-43이 0건이다', () => {
  const rulesJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'rules.json'), 'utf8'))
  for (const rule of rulesJson.rules) {
    for (const g of rule.good || []) {
      if (!/<[a-z]/i.test(g.code)) continue
      const r = html(g.code).filter(f => f.rule === 'R-23' || f.rule === 'R-43')
      assert.equal(r.length, 0, `${rule.id} good: ${g.code}\n${brief(r)}`)
    }
  }
})

// ─── 검사기 통합 ─────────────────────────────────────

function makeProject(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'iux-copy-'))
  fs.mkdirSync(path.join(dir, 'scripts'), { recursive: true })
  fs.copyFileSync(path.join(ROOT, 'scripts', 'check-violations.js'), path.join(dir, 'scripts', 'check-violations.js'))
  fs.cpSync(path.join(ROOT, 'scripts', 'lib'), path.join(dir, 'scripts', 'lib'), { recursive: true })
  fs.mkdirSync(path.join(dir, 'contracts'), { recursive: true })
  for (const name of ['class-naming.json', 'fake-content.json', 'copy-lexicon.json']) {
    fs.copyFileSync(path.join(ROOT, 'contracts', name), path.join(dir, 'contracts', name))
  }
  for (const [rel, content] of Object.entries(files)) {
    const file = path.join(dir, ...rel.split('/'))
    fs.mkdirSync(path.dirname(file), { recursive: true })
    fs.writeFileSync(file, content)
  }
  return dir
}
const run = (dir, args = []) => spawnSync(process.execPath, [path.join(dir, 'scripts', 'check-violations.js'), ...args], { cwd: dir, encoding: 'utf8', env: { ...process.env, FORCE_COLOR: '0' } })

test('검사기: 납품 페이지(pages/**)의 자리값은 오류, 틀 표시 페이지는 경고, 공공서비스 느낌표는 오류', () => {
  const page = body => `<!DOCTYPE html><html lang="ko"><head><title>공지사항 | 제주특별자치도</title></head><body><a href="#main" class="skip-to-content">본문 바로가기</a><main id="main">${body}</main></body></html>`
  const dir = makeProject({
    'pages/notice.html': page('<h1>페이지 제목</h1>'),
    'index.html': '<!DOCTYPE html><html lang="ko"><head><meta name="infoux:template" content="starter"><title>새 프로젝트</title></head><body><a href="#main" class="skip-to-content">본문 바로가기</a><main id="main"><h1>새 프로젝트</h1></main></body></html>'
  })
  let r = run(dir)
  assert.equal(r.status, 2, r.stdout + r.stderr)
  assert.match(r.stderr, /\[ERROR\][^\n]*pages[\\/]notice\.html[\s\S]*?\[R-23\]/)
  assert.doesNotMatch(r.stderr, /\[ERROR\][^\n]*index\.html/)
  assert.match(r.stderr, /\[WARN\][^\n]*index\.html[\s\S]*?틀 표시/)

  fs.writeFileSync(path.join(dir, 'pages', 'notice.html'), page('<h1>신청이 완료되었습니다!</h1>'))
  r = run(dir)
  assert.equal(r.status, 0, r.stdout + r.stderr) // 사이트 유형이 없으면 제목 느낌표는 경고
  fs.writeFileSync(path.join(dir, 'infoux.json'), JSON.stringify({ profile: 'public-service' }))
  r = run(dir)
  assert.equal(r.status, 2, r.stdout + r.stderr)
  assert.match(r.stderr, /\[R-43\]/)
  // 편집 훅처럼 파일 하나를 인자로 줘도 납품 범위로 본다
  r = run(dir, [path.join(dir, 'pages', 'notice.html')])
  assert.equal(r.status, 2, r.stdout + r.stderr)
})

test('검사기: 계약 파일이 없으면 기본값으로 검사하고 경고한다', () => {
  const dir = makeProject({ 'src/js/gallery.js': "img.src = 'https://picsum.photos/400'\n" })
  fs.rmSync(path.join(dir, 'contracts', 'copy-lexicon.json'))
  const r = run(dir)
  assert.equal(r.status, 2, r.stdout + r.stderr) // src/js의 핫링크
  assert.match(r.stderr, /copy-lexicon\.json[\s\S]*?기본값/)
  assert.match(r.stderr, /gallery\.js[\s\S]*?\[R-23\]/)
})
