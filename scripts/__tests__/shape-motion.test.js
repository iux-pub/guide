// 모양·움직임 — R-35 반경·그림자, R-33 마키 애니메이션 (scripts/lib/shape-motion.js)

const { test } = require('node:test')
const assert = require('node:assert/strict')
const { scanCssShape, scanHtmlShape } = require('../lib/shape-motion')

const has = (r, rule, severity = 'error') => r.some(f => f.rule === rule && f.severity === severity)
const none = (r, rule) => !r.some(f => !rule || f.rule === rule)
const brief = r => r.map(f => `${f.rule}:${f.severity}:${f.message}`).join('\n')

test('R-35: 1.2rem 넘는 반경과 지정 블록 밖 pill은 오류', () => {
  assert.ok(has(scanCssShape('.feature { @apply rounded-[2.4rem]; }'), 'R-35'))
  assert.ok(has(scanCssShape('.card { border-radius: 16px; }'), 'R-35'))
  assert.ok(has(scanCssShape('.card { @apply rounded-t-full; }'), 'R-35'))
  assert.ok(has(scanCssShape('.chip { @apply rounded-full px-[1.2rem]; }'), 'R-35'))
  assert.ok(has(scanHtmlShape('<a class="btn btn--primary rounded-full" href="/apply">신청하기</a>'), 'R-35'))
  assert.ok(has(scanHtmlShape('<span class="tag rounded-full">교육</span>'), 'R-35'))
  assert.ok(has(scanHtmlShape('<span class="badge rounded-full">12</span>'), 'R-35'))
})

test('R-35: KRDS 반경·정사각 원형·허용 블록은 통과', () => {
  for (const css of [
    '.card { @apply rounded-[1rem] border border-[var(--color-border-light)]; }',
    '.modal__dialog { border-radius: 1.2rem; }',
    '.badge--dot { @apply w-[0.8rem] h-[0.8rem] rounded-full; }',
    '.quick-link__icon { @apply w-[5.6rem] h-[5.6rem] rounded-full; }',
    '.x { @apply size-[4rem] rounded-full; }',
    '.switch__track { border-radius: 100px; }',
    '.avatar { border-radius: 50%; }'
  ]) assert.ok(none(scanCssShape(css), 'R-35'), css)
  assert.ok(none(scanCssShape('.track { border-radius: 9999px; }', { file: '/src/styles/6-components/switch.css' }), 'R-35'))
})

test('R-35: 그림자 blur 2.4rem 초과는 경고', () => {
  const r = scanCssShape('.card { box-shadow: 0 2rem 6rem 0 #0000001f; }')
  assert.ok(has(r, 'R-35', 'warn') && !has(r, 'R-35', 'error'), brief(r))
  assert.ok(none(scanCssShape('.card:hover { @apply shadow-[0_0_0.2rem_0_#00000014,_0_0.8rem_1.6rem_0_#0000001f]; }'), 'R-35'))
})

test('R-33: 로고·배너·롤링 영역의 무한 애니메이션은 오류, 로딩 표시는 통과', () => {
  assert.ok(has(scanCssShape('.partner-logos__track { animation: marquee 20s linear infinite; }'), 'R-33'))
  assert.ok(has(scanCssShape('.rolling { & .banner { @apply [animation:slide_30s_linear_infinite]; } }'), 'R-33'))
  assert.ok(none(scanCssShape('.spinner { animation: spin 1s linear infinite; }'), 'R-33'))
  assert.ok(none(scanCssShape('.carousel__skeleton { animation: shimmer 1s infinite; }'), 'R-33'))
  assert.ok(none(scanCssShape('.partner-logos__track { animation: fade 1s ease 1; }'), 'R-33'))
})
