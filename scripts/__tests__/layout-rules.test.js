// 모바일 우선 — R-48 (scripts/lib/layout-rules.js)

const { test } = require('node:test')
const assert = require('node:assert/strict')
const { scanHtmlLayout, scanCssLayout } = require('../lib/layout-rules')

const has = (r, severity = 'error') => r.some(f => f.rule === 'R-48' && f.severity === severity)
const none = r => !r.some(f => f.rule === 'R-48')

test('R-48: 모바일 기본 고정 폭 36rem 초과는 오류', () => {
  for (const src of ['<div class="w-[40rem]">x</div>', '<div class="mobile:w-[120rem]">x</div>', '<div class="[width:120rem]">x</div>', '<table class="min-w-[72rem]"></table>']) assert.ok(has(scanHtmlLayout(src)), src)
  assert.ok(has(scanCssLayout('.panel { @apply w-[120rem]; }')))
  assert.ok(has(scanCssLayout('.panel { width: 480px; }')))
})

test('R-48: 넓은 화면 접두·max-w-full·숨김·가로 스크롤 래퍼·태블릿 이상 미디어는 통과', () => {
  for (const src of [
    '<div class="w-[40rem] max-w-full">x</div>',
    '<div class="hidden w-[40rem] pc:block">x</div>',
    '<div class="overflow-x-auto"><table class="min-w-[64rem]"></table></div>',
    '<div class="w-full pc:w-[120rem]">x</div>'
  ]) assert.ok(none(scanHtmlLayout(src)), src)
  assert.ok(none(scanCssLayout('.panel { @media (min-width: 1280px) { min-width: 120rem; } }')))
  assert.ok(none(scanCssLayout('.panel { @apply w-full tablet:w-[72rem]; }')))
})

test('R-48: 모바일 기본 3열 이상 그리드는 경고, 반응형 열이 있으면 통과', () => {
  assert.ok(has(scanHtmlLayout('<ul class="grid grid-cols-4">x</ul>'), 'warn'))
  assert.ok(none(scanHtmlLayout('<ul class="grid grid-cols-4 tablet:grid-cols-6">x</ul>')))
  assert.ok(none(scanHtmlLayout('<ul class="grid grid-cols-2 pc:grid-cols-4">x</ul>')))
  assert.ok(has(scanCssLayout('.grid { grid-template-columns: repeat(3, 1fr); }'), 'warn'))
  assert.ok(none(scanCssLayout('.grid { @media (min-width: 768px) { grid-template-columns: repeat(3, 1fr); } }')))
})
