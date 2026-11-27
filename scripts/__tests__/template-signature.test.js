// 템플릿 장식 서명 — R-51 eyebrow·장식 번호·전 섹션 등장 효과·굵은 옆선·아이콘 타일 바로가기 (scripts/lib/template-signature.js)

const { test } = require('node:test')
const assert = require('node:assert/strict')
const path = require('path')
const { scanHtmlTemplate, scanCssTemplate } = require('../lib/template-signature')

const brief = r => r.map(f => `${f.rule}:${f.severity}:${f.line}:${f.message}`).join('\n')
const RULES = require(path.join(__dirname, '..', '..', 'rules.json'))
const R51 = RULES.rules.find(r => r.id === 'R-51')
const scanAny = s => (/^\s*</.test(s) ? scanHtmlTemplate(s) : scanCssTemplate(s))

test('R-51: rules.json bad 사례는 모두 경고, good 사례는 통과', () => {
  assert.ok(R51, 'rules.json에 R-51이 있다')
  assert.equal(R51.severity, 'warn')
  for (const { code } of R51.bad) {
    const r = scanAny(code)
    assert.ok(r.length >= 1, `bad인데 통과: ${code}`)
    assert.ok(r.every(f => f.rule === 'R-51' && f.severity === 'warn'), brief(r))
  }
  for (const { code } of R51.good) assert.deepEqual(scanAny(code), [], `good인데 걸림: ${code}\n${brief(scanAny(code))}`)
})

test('R-51 (1): eyebrow·kicker class는 경고', () => {
  for (const html of [
    '<p class="eyebrow">서비스</p><h2>민원</h2>',
    '<span class="hero__kicker">NEW</span>',
    '<p class="section-media__eyebrow">추천 코스</p>',
    '<div class="section-eyebrow">소개</div>',
    '<p class="hero__overline">2026 시정</p>',
    '<span class="section__pretitle">소개</span>',
    '<p class="feature-overline">주요 기능</p>',
    '<p class="section__suptitle">소개</p>'
  ]) assert.equal(scanHtmlTemplate(html).length, 1, `${html}\n${brief(scanHtmlTemplate(html))}`)
})

test('R-51 (1): Tailwind overline 유틸·비슷한 다른 이름은 eyebrow가 아니다', () => {
  for (const html of [
    '<p class="overline">윗줄 장식</p>',
    '<a class="hover:overline" href="/a">링크</a>',
    '<p class="card__title">제목</p>',
    '<p class="hero__subtitle">부제</p>'
  ]) assert.deepEqual(scanHtmlTemplate(html), [], `${html}\n${brief(scanHtmlTemplate(html))}`)
})

test('R-51 (1): h2·h3 바로 앞 짧은 __label·__category는 경고', () => {
  for (const html of [
    '<p class="feature__label">주요 기능</p>\n<h2>한 번에 신청</h2>',
    '<span class="post__category">공지</span><h3>점검 안내</h3>'
  ]) assert.equal(scanHtmlTemplate(html).length, 1, `${html}\n${brief(scanHtmlTemplate(html))}`)
})

test('R-51 (1): 긴 글·다른 class·사이에 글이 낀 경우·h4·form label은 통과', () => {
  for (const html of [
    '<p class="feature__label">이 기능은 여러 기관의 민원을 한 화면에서 신청하도록 돕습니다</p><h2>한 번에 신청</h2>',
    '<p class="feature__desc">주요 기능</p><h2>한 번에 신청</h2>',
    '<p class="feature__label">주요 기능</p>본문 글<h2>한 번에 신청</h2>',
    '<p class="feature__label">주요 기능</p><h4>한 번에 신청</h4>',
    '<label class="form-field__label" for="a">이름</label><input id="a">',
    '<p class="feature__label">주요 기능</p><p>설명</p><h2>제목</h2>',
    '<h2 class="section__title">자주 찾는 민원</h2>'
  ]) assert.deepEqual(scanHtmlTemplate(html), [], `${html}\n${brief(scanHtmlTemplate(html))}`)
})

test('R-51 (2): ol 밖 01~09 텍스트·__num/__number/__index class는 경고', () => {
  for (const html of [
    '<div><span>01</span><h3>간편 신청</h3></div>',
    '<p>02. 빠른 처리</p>',
    '<h3>03 안전한 보관</h3>',
    '<span class="benefit__index">2</span>',
    '<span class="card__num">1</span>',
    '<span class="feature__number--large">4</span>',
    '<span class="benefit__number">12</span>',
    '<div class="benefit"><span class="benefit__number">01</span><h3>간편 신청</h3></div>'
  ]) assert.equal(scanHtmlTemplate(html).length, 1, `${html}\n${brief(scanHtmlTemplate(html))}`)
})

test('R-51 (2): __number·__num class라도 번호가 아닌 글·입력칸은 통과', () => {
  for (const html of [
    '<strong class="stat__number">1,234건</strong>',
    '<span class="stat__number">87%</span>',
    '<a class="contact__number" href="tel:0641234567">064-123-4567</a>',
    '<input class="form__number" type="number" id="qty" name="qty">',
    '<span class="notice__number">제2026-118호</span>',
    '<span class="benefit__index">가</span>',
    '<span class="queue__number">128</span>'
  ]) assert.deepEqual(scanHtmlTemplate(html), [], `${html}\n${brief(scanHtmlTemplate(html))}`)
})

test('R-51 (2): 날짜 배지의 일·월 숫자는 통과', () => {
  for (const html of [
    '<time datetime="2026-11-05"><span>05</span><span>2026.11</span></time>',
    '<div class="notice__date"><span>05</span><span>2026.11</span></div>',
    '<p class="event__day">05</p>',
    '<div class="schedule"><strong>07</strong> 정기 휴관</div>',
    '<span class="d-day">03</span>'
  ]) assert.deepEqual(scanHtmlTemplate(html), [], `${html}\n${brief(scanHtmlTemplate(html))}`)
})

test('R-51 (2): 순서가 정보인 번호·날짜·시간·전화·표 칸은 통과', () => {
  for (const html of [
    '<ol><li><span class="step__num">01</span>작성</li></ol>',
    '<ul><li>01 첫째</li></ul>',
    '<ol class="step-indicator"><li class="step-indicator__item"><span class="step-indicator__num" aria-hidden="true">1</span>작성</li></ol>',
    '<div class="step-indicator"><span class="step-indicator__num">01</span></div>',
    '<nav class="pagination"><a class="pagination__number" href="/p/2">02</a></nav>',
    '<p>09.15 마감</p>',
    '<p>09:00 접수 시작</p>',
    '<p>02 2100 1234</p>',
    '<p>010-1234-5678</p>',
    '<p>10 대 과제</p>',
    '<p>0 건</p>',
    '<table><tr><td>01</td></tr></table>',
    '<p><time datetime="2026-01-02">01.02</time></p>',
    '<code>01 02</code>'
  ]) assert.deepEqual(scanHtmlTemplate(html), [], `${html}\n${brief(scanHtmlTemplate(html))}`)
})

test('R-51 (3): main 안 section 3개 이상 등장 효과는 문서당 1건', () => {
  const html = `<main>
  <section data-reveal>a</section>
  <section class="reveal">b</section>
  <section><div class="container" data-animate="up">c</div></section>
  <section class="fade-up">d</section>
</main>`
  const r = scanHtmlTemplate(html)
  assert.equal(r.length, 1, brief(r))
  assert.equal(r[0].line, 4, '세 번째 섹션 줄')
  assert.match(r[0].message, /섹션 4개/)
  assert.equal(scanHtmlTemplate('<section class="animate-on-scroll"></section><section data-aos="fade"></section><section data-aos="fade"></section>').length, 1, 'main 없는 조각도 본다')
})

test('R-51 (3): 등장 효과 2개 이하·main 밖 섹션은 통과', () => {
  for (const html of [
    '<main><section data-aos="fade">a</section><section data-aos="fade">b</section><section>c</section></main>',
    '<section data-aos="fade"></section><section data-aos="fade"></section><main><section data-aos="fade">a</section><section>b</section></main>'
  ]) assert.deepEqual(scanHtmlTemplate(html), [], `${html}\n${brief(scanHtmlTemplate(html))}`)
})

test('R-51 (5): 색 있는 굵은 옆선 CSS는 경고', () => {
  for (const css of [
    '.card { border-left: 4px solid var(--color-primary); }',
    '.alert { border-right: 0.3rem solid var(--color-danger-50); }',
    '.quote-box { border-inline-start: thick solid var(--color-primary); }',
    '.list__item { border-left-width: 3px; border-left-color: var(--color-primary); }',
    '.notice { @apply border-l-4 border-[var(--color-primary)]; }',
    '.notice { @apply border-r-[3px]; }',
    '.notice { @apply [border-left:4px_solid_var(--color-primary)]; }',
    '.item { & .item__body { border-left: 2px solid var(--color-point); } }',
    '.card { border-style: solid; border-color: var(--color-primary); border-width: 0 0 0 4px; }',
    '.card { border: solid var(--color-primary); border-width: 0 0 0 0.4rem; }',
    '.card { border-width: 1px 1px 1px 4px; border-color: var(--color-primary); }',
    '.card { box-shadow: inset 4px 0 0 var(--color-primary); }',
    '.card { box-shadow: inset -0.4rem 0 0 0 var(--color-point); }',
    '.card { box-shadow: 0 0 0.2rem 0 #00000014, inset 4px 0 0 var(--color-primary); }',
    '.card { @apply shadow-[inset_4px_0_0_var(--color-primary)]; }',
    '.card { @apply [box-shadow:inset_0.4rem_0_0_var(--color-primary)]; }'
  ]) assert.equal(scanCssTemplate(css).length, 1, `${css}\n${brief(scanCssTemplate(css))}`)
})

test('R-51 (5): 1px 구분선·색 없는 선언·현재 위치·오류 표시·blockquote·셰브런은 통과', () => {
  for (const css of [
    '.table th { border-right: 1px solid var(--color-border); }',
    '.panel { border-left: 0.1rem solid var(--color-border); }',
    '.panel { border-left: none; }',
    '.panel { border-left-width: 4px; }',
    '.panel { @apply border-l; }',
    '.tab__button[aria-selected="true"] { border-left: 4px solid var(--color-primary); }',
    '.main-menu__link { border-left: 3px solid var(--color-primary); }',
    '.side-navigation__link--current { border-left: 4px solid var(--color-primary); }',
    '.breadcrumb__item { border-right: 2px solid var(--color-border); }',
    '.form-field--error .input { border-left: 4px solid var(--color-danger-50); }',
    '.input[aria-invalid="true"] { border-left: 4px solid var(--color-danger-50); }',
    'blockquote { border-left: 4px solid var(--color-border); }',
    '.prose blockquote { border-left: 4px solid var(--color-border); }',
    '.chevron { border-right: 2px solid var(--color-text); border-bottom: 2px solid var(--color-text); transform: rotate(-45deg); }',
    '.chevron { @apply border-b-2 [border-right:2px_solid_var(--color-text)] [transform:rotate(-45deg)]; }',
    // 투명색 — 상태에서만 색이 켜지는 자리 잡기
    '.nav-item { border-left: 4px solid transparent; }',
    '.nav-item { @apply border-l-4 border-transparent; }',
    '.nav-item { @apply border-l-4 border-l-transparent; }',
    // 표 칸 구분선
    '.table th + th { border-left: 2px solid var(--color-border); }',
    '.board td { border-right: 2px solid var(--color-border); }',
    '.table__cell { border-left: 2px solid var(--color-border-dark); }',
    // 네 변이 같은 테두리·옆이 아닌 변·색 없는 단축
    '.card { border-width: 4px; border-color: var(--color-primary); }',
    '.card { border-width: 4px 0 0; border-color: var(--color-primary); }',
    '.card { border-width: 0 0 0 4px; }',
    // 옆 그림자가 아닌 inset·번지는 그림자·색 없는 그림자
    '.tab__item { box-shadow: inset 0 -4px 0 var(--color-primary); }',
    '.card { box-shadow: inset 0 -0.4rem 0 var(--color-primary); }',
    '.card { box-shadow: inset 4px 0 8px var(--color-primary); }',
    '.card { box-shadow: 4px 0 0 var(--color-primary); }',
    '.card { box-shadow: inset 1px 0 0 var(--color-border); }',
    '.card { box-shadow: none; }'
  ]) assert.deepEqual(scanCssTemplate(css), [], `${css}\n${brief(scanCssTemplate(css))}`)
})

test('R-51 (5): 마크업 class·<style> 블록의 옆선도 본다', () => {
  assert.equal(scanHtmlTemplate('<div class="card border-l-4 border-[var(--color-primary)]">a</div>').length, 1)
  assert.equal(scanHtmlTemplate('<div class="card tablet:border-s-8">a</div>').length, 1)
  const styled = scanHtmlTemplate('<p>a</p>\n<style>\n.card { border-left: 4px solid var(--color-primary); }\n</style>')
  assert.equal(styled.length, 1, brief(styled))
  assert.equal(styled[0].line, 3)
  for (const html of [
    '<div class="card border-l">a</div>',
    '<a class="side-navigation__link border-l-4" aria-current="page" href="/a">a</a>',
    '<li class="main-menu__item"><a class="border-l-4" href="/a">a</a></li>',
    '<blockquote class="border-l-4">인용</blockquote>',
    '<div class="card aria-[current=page]:border-l-4">a</div>',
    '<div class="card border-l-[var(--color-primary)]">a</div>',
    '<a class="menu__link border-l-4 border-transparent aria-[current=page]:border-[var(--color-primary)]" href="/a">a</a>',
    '<div class="item border-l-4 border-l-transparent">a</div>',
    '<table><tr><td class="border-l-2">a</td></tr></table>'
  ]) assert.deepEqual(scanHtmlTemplate(html), [], `${html}\n${brief(scanHtmlTemplate(html))}`)
  assert.equal(scanHtmlTemplate('<div class="item border-l-4 border-transparent border-l-[var(--color-primary)]">a</div>').length, 1, '투명 뒤에 옆선 색을 다시 주면 옆선이다')
})

test('R-51 (5): style 속성의 옆선도 본다 — 줄은 style 속성이 있는 줄', () => {
  for (const html of [
    '<div class="card" style="border-left:4px solid var(--color-primary)">a</div>',
    '<div class="card" style="--x: 1; border-left: 0.4rem solid var(--color-primary);">a</div>',
    '<li style="box-shadow: inset 4px 0 0 var(--color-primary)">a</li>',
    '<div style="border-width: 0 0 0 4px; border-style: solid; border-color: var(--color-primary)">a</div>'
  ]) assert.equal(scanHtmlTemplate(html).length, 1, `${html}\n${brief(scanHtmlTemplate(html))}`)
  const multi = scanHtmlTemplate('<p>a</p>\n<div\n  class="card"\n  style="border-left: 4px solid var(--color-primary)">a</div>')
  assert.equal(multi.length, 1, brief(multi))
  assert.equal(multi[0].line, 4)
  for (const html of [
    '<div style="--card-ratio: 4 / 3">a</div>',
    '<div style="border-left: 1px solid var(--color-border)">a</div>',
    '<div style="border-left: 4px solid transparent">a</div>',
    '<blockquote style="border-left: 4px solid var(--color-border)">인용</blockquote>',
    '<a class="side-navigation__link" aria-current="page" style="border-left: 4px solid var(--color-primary)" href="/a">a</a>',
    '<td style="border-left: 2px solid var(--color-border)">a</td>'
  ]) assert.deepEqual(scanHtmlTemplate(html), [], `${html}\n${brief(scanHtmlTemplate(html))}`)
})

// ─── (6) 아이콘 타일 바로가기 ───────────────────────────
const tile = (name, label) => `<li class="quick__item"><a class="quick__link" href="/${name}"><span class="quick__icon"><svg class="icon" aria-hidden="true"><use href="/assets/icons/sprite.svg#${name}"></use></svg></span><span class="quick__label">${label}</span></a></li>`
const TILES = [['doc', '증명서 발급'], ['calendar', '시설 예약'], ['search', '민원 조회'], ['map', '찾아오는 길'], ['call', '전화번호 안내']]

test('R-51 (6): 같은 부모 아래 아이콘 상자 + 레이블 링크 4개 이상은 문서당 1건 경고', () => {
  const list = n => `<ul class="quick">\n${TILES.slice(0, n).map(([a, b]) => tile(a, b)).join('\n')}\n</ul>`
  const r = scanHtmlTemplate(list(5))
  assert.equal(r.length, 1, brief(r))
  assert.equal(r[0].line, 2, '첫 타일의 줄')
  assert.match(r[0].message, /아이콘 타일 바로가기 5개/)
  assert.match(r[0].message, /의도한 선택이면 docs\/design-plan\.md에 이유를 적는다/)
  assert.equal(scanHtmlTemplate(list(4)).length, 1, '4개부터')
  assert.equal(scanHtmlTemplate(list(5) + list(5)).length, 1, '묶음이 둘이어도 문서당 1건')
  // 링크가 형제인 꼴(div > a), 아이콘 폰트, 버튼, div 상자
  const flat = `<div class="quick">${TILES.slice(0, 4).map(([a, b]) => `<a href="/${a}"><div class="quick__box"><span class="icon-font icon-font--${a}" aria-hidden="true"></span></div>${b}</a>`).join('')}</div>`
  assert.equal(scanHtmlTemplate(flat).length, 1, brief(scanHtmlTemplate(flat)))
  const buttons = `<div class="quick">${TILES.slice(0, 4).map(([a, b]) => `<button type="button"><span><svg class="icon" aria-hidden="true"><use href="/assets/icons/sprite.svg#${a}"></use></svg></span><strong>${b}</strong></button>`).join('')}</div>`
  assert.equal(scanHtmlTemplate(buttons).length, 1, brief(scanHtmlTemplate(buttons)))
})

test('R-51 (6): 세 개 이하·상자 없는 아이콘·레이블 없는 아이콘·글 뒤 아이콘·메뉴와 푸터는 통과', () => {
  const ul = items => `<ul class="quick">${items.join('')}</ul>`
  const icon = name => `<svg class="icon" aria-hidden="true"><use href="/assets/icons/sprite.svg#${name}"></use></svg>`
  for (const html of [
    // 세 개
    ul(TILES.slice(0, 3).map(([a, b]) => tile(a, b))),
    // 아이콘이 상자 없이 글 왼쪽에 있다(§6-2 Q3)
    ul(TILES.map(([a, b]) => `<li><a href="/${a}">${icon(a)}<span>${b}</span></a></li>`)),
    // 보이는 레이블이 없다(SNS 아이콘 줄)
    ul(TILES.map(([a, b]) => `<li><a href="/${a}"><span class="sns__icon">${icon(a)}</span><span class="sr-only">${b}</span></a></li>`)),
    // 글이 먼저 오고 아이콘이 뒤에 온다(줄 목록 + chevron)
    ul(TILES.map(([a, b]) => `<li><a href="/${a}"><span>${b}</span><span class="list__chevron">${icon('chevron-right')}</span></a></li>`)),
    // 상자 안에 아이콘 말고 다른 것이 있다(사진·배지)
    ul(TILES.map(([a, b]) => `<li><a href="/${a}"><span class="thumb"><img src="/images/${a}.jpg" alt=""></span><span>${b}</span></a></li>`)),
    // 항목 안에 링크가 둘이다(카드)
    ul(TILES.map(([a, b]) => `<li><a href="/${a}"><span>${icon(a)}</span>${b}</a><a href="/${a}/more">자세히</a></li>`)),
    // 헤더·푸터·메뉴 블록
    `<header><ul>${TILES.map(([a, b]) => tile(a, b)).join('')}</ul></header>`,
    `<footer><ul>${TILES.map(([a, b]) => tile(a, b)).join('')}</ul></footer>`,
    `<nav class="mobile-menu"><ul class="mobile-menu__list">${TILES.map(([a, b]) => tile(a, b)).join('')}</ul></nav>`,
    // 타일이 서로 다른 부모에 흩어져 있다
    TILES.map(([a, b]) => `<div class="col">${tile(a, b).replace(/^<li[^>]*>|<\/li>$/g, '')}</div>`).map(x => `<section>${x}</section>`).join('').replace(/<div class="col">/g, '<div class="col"><p>안내</p>')
  ]) assert.deepEqual(scanHtmlTemplate(html), [], `${html}\n${brief(scanHtmlTemplate(html))}`)
})


test('R-51 (4): 화살표 글리프는 R-36 소관이라 보지 않는다', () => {
  assert.deepEqual(scanHtmlTemplate('<a href="/notice">공지사항 →</a>'), [])
})
