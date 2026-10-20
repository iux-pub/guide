// 글자 크기 하한 — R-31 루트 글자 크기, R-38 최소 글자 (scripts/lib/type-floor.js)

const { test } = require('node:test')
const assert = require('node:assert/strict')
const { scanCssType, scanHtmlType } = require('../lib/type-floor')

const has = (r, rule, severity = 'error') => r.some(f => f.rule === rule && f.severity === severity)
const none = (r, rule) => !r.some(f => !rule || f.rule === rule)
const brief = r => r.map(f => `${f.rule}:${f.severity}:${f.message}`).join('\n')

test('R-38: 1.3rem 미만·body 1.6rem 미만·본문 성격 요소 1.5rem 미만은 오류', () => {
  assert.ok(has(scanCssType('.board__count { @apply text-[1.2rem]; }'), 'R-38'))
  assert.ok(has(scanCssType('.note { font-size: 11px; }'), 'R-38'))
  assert.ok(has(scanCssType('body { @apply text-[1.5rem]; }'), 'R-38'))
  assert.ok(has(scanCssType('.card__desc { font-size: 1.4rem; }'), 'R-38'))
  assert.ok(has(scanCssType('.x { font: bold 1.1rem/1.5 var(--font-sans); }'), 'R-38'))
  assert.ok(has(scanCssType('.x { font-size: clamp(11px, 1vw, 14px); }'), 'R-38'))
  assert.ok(has(scanCssType('.x::after { content: "(필수)"; font-size: 1.1rem; }'), 'R-38'))
})

test('R-38: 단계 밖(1.3~1.5rem)과 본문 태그 1.3rem은 경고', () => {
  const r = scanCssType('.notice-bar__label { @apply text-[1.4rem]; }')
  assert.ok(has(r, 'R-38', 'warn') && !has(r, 'R-38', 'error'), brief(r))
  const p = scanHtmlType('<p class="form__hint text-[1.3rem]">예: 010-0000-0000</p>')
  assert.ok(has(p, 'R-38', 'warn'), brief(p))
})

test('R-38: 단계 값·글리프·기호 의사 요소·코드·em·%는 통과', () => {
  for (const css of [
    '.badge__text { @apply text-[1.3rem]; }',
    '.card__title { font-size: 1.9rem; }',
    '.btn__icon { font-size: 1rem; }',
    '.x::before { content: "›"; font-size: 1rem; }',
    '.prose pre { font-size: 1.2rem; }',
    '.x { font-family: var(--font-mono); font-size: 1.2rem; }',
    '.x { font-size: 0.875em; }',
    '.x { font-size: 90%; }'
  ]) assert.ok(none(scanCssType(css), 'R-38'), css)
})

test('R-38: 중첩·@media 안의 선언과 HTML <style>·class·style 속성을 본다', () => {
  assert.ok(has(scanCssType('.card { &__desc { @media (min-width: 768px) { font-size: 1.2rem; } } }'), 'R-38'))
  const html = '<style>\n.lead { font-size: 1.1rem; }\n</style>\n<p class="text-[1.2rem]">안내</p>\n<span style="font-size: 10px">주</span>'
  const r = scanHtmlType(html)
  assert.deepEqual(r.filter(f => f.rule === 'R-38').map(f => f.line), [2, 4, 5], brief(r))
  assert.ok(none(scanHtmlType('<pre><code class="text-[1.2rem]">x</code></pre>'), 'R-38'))
})

test('R-31: 루트 글자 크기는 62.5% — 다른 값·vw는 경고, data-font-scale은 예외', () => {
  assert.ok(none(scanCssType('html { font-size: 62.5%; }')))
  assert.ok(has(scanCssType('html { font-size: 56.25%; }'), 'R-31', 'warn'))
  assert.ok(has(scanCssType(':root { font-size: calc(0.5rem + 0.5vw); }'), 'R-31', 'warn'))
  assert.ok(none(scanCssType('html[data-font-scale="large"] { font-size: 75%; }'), 'R-31'))
  assert.ok(none(scanCssType('html { font-size: 56.25%; }'), 'R-38'))
})
