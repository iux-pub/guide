// 템플릿 장식 서명 — R-51 eyebrow·장식 번호·전 섹션 등장 효과·굵은 옆선 (scripts/lib/template-signature.js)

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
    '<div class="section-eyebrow">소개</div>'
  ]) assert.equal(scanHtmlTemplate(html).length, 1, `${html}\n${brief(scanHtmlTemplate(html))}`)
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
    '<span class="benefit__index">가</span>',
    '<span class="card__num">1</span>',
    '<span class="feature__number--large">4</span>'
  ]) assert.equal(scanHtmlTemplate(html).length, 1, `${html}\n${brief(scanHtmlTemplate(html))}`)
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
    '.item { & .item__body { border-left: 2px solid var(--color-point); } }'
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
    '.chevron { @apply border-b-2 [border-right:2px_solid_var(--color-text)] [transform:rotate(-45deg)]; }'
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
    '<div class="card border-l-[var(--color-primary)]">a</div>'
  ]) assert.deepEqual(scanHtmlTemplate(html), [], `${html}\n${brief(scanHtmlTemplate(html))}`)
})

test('R-51 (4): 화살표 글리프는 R-36 소관이라 보지 않는다', () => {
  assert.deepEqual(scanHtmlTemplate('<a href="/notice">공지사항 →</a>'), [])
})
