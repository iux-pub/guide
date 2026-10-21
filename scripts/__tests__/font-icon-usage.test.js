// 폰트 스택(R-26 확장, scripts/lib/font-rules.js·token-source.js)·아이콘 사용처(R-27 확장, scripts/lib/icon-usage.js)

const path = require('node:path')
const { test } = require('node:test')
const assert = require('node:assert/strict')
const { scanCssFont, scanHtmlFont } = require('../lib/font-rules')
const { assertHangulFontFallback, firstFamily } = require('../lib/token-source')
const { loadIconCatalog, iconFindings } = require('../lib/icon-usage')

const ROOT = path.resolve(__dirname, '..', '..')
const brief = r => r.map(f => `${f.rule}:${f.severity}:${f.message}`).join('\n')
const errs = r => r.filter(f => f.severity === 'error')

test('R-26: 토큰 밖 서체·font-serif·외부 호스트는 오류', () => {
  for (const css of [
    '.hero__title { font-family: "Playfair Display", serif; }',
    '.hero__title { @apply font-[var(--font-heading)]; }',
    '.hero__title { @apply font-(--font-heading); }',
    '.hero__title { @apply tablet:font-serif; }',
    '.hero__title { @apply font-["Gowun_Batang"]; }',
    ':root { --font-display: "Playfair Display", serif; }',
    ':root { --font-heading: "Playfair Display", var(--font-sans); }',
    '@import url("https://fonts.bunny.net/css?family=inter");',
    '@font-face { font-family: "Noonnu"; src: url("https://cdn.jsdelivr.net/gh/projectnoonnu/a.woff2"); }',
    '.title { font: 700 2rem/1.5 "Nanum Myeongjo", serif; }'
  ]) assert.ok(errs(scanCssFont(css)).length, `${css}\n${brief(scanCssFont(css))}`)
  assert.ok(errs(scanHtmlFont('<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR">')).length)
  assert.ok(errs(scanHtmlFont('<h2 class="tablet:font-serif">제목</h2>')).length)
})

test('R-26: 토큰·가중치·자체 호스팅은 통과', () => {
  for (const css of [
    'body { font-family: var(--font-sans); }',
    '.title { @apply font-[500] tablet:font-[700] font-[family-name:var(--font-heading)]; }',
    '.title { font: 700 2rem/1.5 var(--font-heading); }',
    '.code { font-family: inherit; }',
    '@font-face { font-family: "Pretendard GOV"; src: url("../fonts/PretendardGOV-Regular.subset.woff2") format("woff2"); }',
    ':root { --font-heading: var(--font-sans); --font-size-body: 1.6rem; }'
  ]) assert.deepEqual(scanCssFont(css), [], `${css}\n${brief(scanCssFont(css))}`)
})

test('R-26: 토큰 스택의 1순위는 카탈로그 한글 폰트', () => {
  const stack = v => ({ font: { family: { sans: { value: "'Pretendard GOV', 'Noto Sans KR', sans-serif" }, heading: { value: v } } } })
  assert.doesNotThrow(() => assertHangulFontFallback(stack("'Pretendard GOV', 'Noto Sans KR', sans-serif")))
  assert.doesNotThrow(() => assertHangulFontFallback(stack('var(--font-sans)')))
  assert.throws(() => assertHangulFontFallback(stack("'Playfair Display', 'Noto Sans KR', serif")), /1순위/)
  assert.equal(firstFamily('var(--font-sans), serif', "'Hahmlet', serif"), 'Hahmlet')
})

const cat = loadIconCatalog(ROOT)

test('R-27: 대장 밖 이름·표정·외부 스프라이트·aria-hidden 누락은 오류', () => {
  for (const html of [
    '<svg class="icon" aria-hidden="true"><use href="assets/icons/sprite.svg#rocket-launch-xyz"></use></svg>',
    '<svg class="icon" aria-hidden="true"><use href="https://cdn.example.com/sprite.svg#search"></use></svg>',
    '<svg class="icon" aria-hidden="true"><use href="assets/icons/my-icons.svg#search"></use></svg>',
    '<svg class="icon"><use href="assets/icons/sprite.svg#search"></use></svg>',
    '<i class="icon-font icon-font--search"></i>',
    '<i class="icon-font icon-font--search icon-font--menu" aria-hidden="true"></i>'
  ]) assert.ok(errs(iconFindings(html, cat)).length, `${html}\n${brief(iconFindings(html, cat))}`)
})

test('R-27: 카탈로그 아이콘·조상 aria-hidden·주석·로고는 통과', () => {
  for (const html of [
    '<svg class="icon" aria-hidden="true"><use href="assets/icons/sprite.svg#search"></use></svg>',
    '<a href="/search"><span aria-hidden="true"><svg class="icon"><use href="/assets/icons/sprite.svg#search"></use></svg></span>통합검색</a>',
    '<svg class="icon" role="img" aria-label="검색"><use href="assets/icons/sprite.svg#search"></use></svg>',
    '<!-- <svg><path d="M0 0h24"/></svg> -->',
    '<svg class="site-header__logo" viewBox="0 0 120 40"><path d="M0 0h120v40H0z"/></svg>',
    '<i class="icon-font icon-font--search" aria-hidden="true"></i>'
  ]) assert.deepEqual(iconFindings(html, cat, { inlineSvg: true }), [], `${html}\n${brief(iconFindings(html, cat, { inlineSvg: true }))}`)
})

test('R-27: 직접 그린 인라인 svg와 목록 안 표정 혼용은 경고', () => {
  const drawn = iconFindings('<svg class="sitemap-link__icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3h18"/></svg>', cat, { inlineSvg: true })
  assert.ok(drawn.some(f => f.severity === 'warn'), brief(drawn))
  const mixed = iconFindings('<ul><li><svg class="icon" aria-hidden="true"><use href="assets/icons/sprite-bold.svg#chevron-left"></use></svg></li><li><svg class="icon" aria-hidden="true"><use href="assets/icons/sprite.svg#search"></use></svg></li></ul>', cat)
  assert.ok(mixed.some(f => f.severity === 'warn' && /표정/.test(f.message)), brief(mixed))
})
