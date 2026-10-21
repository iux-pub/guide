// 한글 조판 확장(R-24, scripts/lib/type-floor.js)·모션 예산(R-22, scripts/lib/shape-motion.js)

const { test } = require('node:test')
const assert = require('node:assert/strict')
const { scanCssHangul, scanHtmlHangul } = require('../lib/type-floor')
const { scanCssMotion, scanHtmlMotion } = require('../lib/shape-motion')

const has = (r, severity) => r.some(f => f.severity === severity)
const brief = r => r.map(f => `${f.rule}:${f.severity}:${f.message}`).join('\n')

test('R-24: 음수 자간·전역 자간·keep-all 무력화는 오류', () => {
  assert.ok(has(scanCssHangul('.hero__title { @apply tracking-[-0.02em]; }'), 'error'))
  assert.ok(has(scanCssHangul('.title { letter-spacing: -1px; }'), 'error'))
  assert.ok(has(scanCssHangul('.title { @apply tablet:tracking-tight; }'), 'error'))
  assert.ok(has(scanCssHangul('* { letter-spacing: 0; }'), 'error'))
  assert.ok(has(scanCssHangul('body { letter-spacing: 0.05em; }'), 'error'))
  assert.ok(has(scanCssHangul('.card__text { word-break: break-all; }'), 'error'))
  assert.ok(has(scanCssHangul('.card__text { @apply [word-break:break-word]; }'), 'error'))
  assert.ok(has(scanHtmlHangul('<p class="break-all">긴 문장</p>'), 'error'))
  assert.ok(has(scanHtmlHangul('<p class="leading-tight">본문</p>'), 'error'))
  assert.ok(has(scanHtmlHangul('<h2 style="letter-spacing:-0.5px">제목</h2>'), 'error'))
})

test('R-24: 저장소 실제 형태는 통과', () => {
  for (const css of [
    'pre,\n  code {\n  word-break: normal;\n}',
    '.btn {\n  @apply leading-none;\n}',
    '.badge__icon { line-height: 1; }',
    '.tab__item { @apply whitespace-nowrap leading-none; }',
    'body { letter-spacing: 0; }',
    'html { @apply tracking-normal; }',
    '.display { letter-spacing: 0.1rem; line-height: 1.5; }'
  ]) assert.deepEqual(scanCssHangul(css), [], `${css}\n${brief(scanCssHangul(css))}`)
  assert.deepEqual(scanHtmlHangul('<pre class="break-all"><code>https://example.com/long</code></pre>'), [])
  assert.deepEqual(scanCssHangul('.docs-hero { @apply leading-[1.25]; }', { exemptLeading: true }), [])
})

test('R-24: CSS의 1.5 미만 행간은 경고', () => {
  const r = scanCssHangul('.card__title { @apply leading-[1.2]; }')
  assert.ok(has(r, 'warn') && !has(r, 'error'), brief(r))
  assert.ok(has(scanCssHangul('.notice { line-height: 120%; }'), 'warn'))
})

test('R-24: &nbsp; 정렬·스타일시트 없는 문서는 경고', () => {
  assert.ok(has(scanHtmlHangul('<p>이름&nbsp;&nbsp;&nbsp;홍길동</p>'), 'warn'))
  assert.ok(has(scanHtmlHangul('<html><head><style>p{color:red}</style></head><body><p>본문</p></body></html>'), 'warn'))
  assert.deepEqual(scanHtmlHangul('<html><head><link rel="stylesheet" href="{{ css }}"><style>p{margin:0}</style></head><body><p>본문</p></body></html>'), [])
})

const UTIL = { grade: 'utility', gradeKnown: true }
const REST = { grade: 'restrained', gradeKnown: true }

test('R-22: 저장소 표기(@apply 임의값)를 읽는다', () => {
  assert.ok(has(scanCssMotion('.promo { @apply [animation:float_3s_ease-in-out_infinite]; }', REST), 'error'))
  assert.ok(has(scanCssMotion('.promo { @apply [transition:opacity_0.8s_ease]; }', REST), 'warn'))
  assert.ok(has(scanCssMotion('.promo { @apply ease-[cubic-bezier(0.34,1.56,0.64,1)]; }', REST), 'warn'))
  assert.ok(has(scanCssMotion('.promo { animation: pop 350ms ease; }', REST), 'warn'))
})

test('R-22: 로더·피드백 컴포넌트·짧은 전환은 통과', () => {
  for (const [css, ctx] of [
    ['.spinner { @apply [animation:spin_1s_linear_infinite]; }', REST],
    ['.card--loading { animation: pulse 1.5s infinite; }', REST],
    ['.btn { @apply [transition:background-color_0.15s_ease-in-out,_color_0.15s_ease-in-out]; }', REST],
    ['.accordion__icon { @apply [transition:rotate_0.2s_ease]; }', REST]
  ]) assert.deepEqual(scanCssMotion(css, ctx), [], `${css}\n${brief(scanCssMotion(css, ctx))}`)
  assert.deepEqual(scanCssMotion('.modal__dialog { @apply ease-[cubic-bezier(0.34,1.56,0.64,1)]; }', { ...REST, file: '/src/styles/6-components/modal.css' }), [])
})

test('R-22: 등급 출처가 없으면 무한 반복도 경고로 낮춘다', () => {
  const r = scanCssMotion('.promo { animation: float 2s infinite; }', { grade: 'restrained', gradeKnown: false })
  assert.ok(has(r, 'warn') && !has(r, 'error'), brief(r))
})

test('R-22: 스크롤 진입 모션 — utility 오류, restrained 예산 초과 경고', () => {
  assert.ok(has(scanHtmlMotion('<section data-aos="fade-up"><h2>공지</h2></section>', UTIL), 'error'))
  assert.ok(has(scanHtmlMotion('<section data-aos="fade-up"><h2>공지</h2></section>', REST), 'warn'))
  assert.deepEqual(scanHtmlMotion('<section data-aos="fade" data-aos-once="true" data-aos-duration="300"><h2>공지</h2></section>', REST), [])
  assert.deepEqual(scanHtmlMotion('<span class="spinner animate-spin" role="status"></span>', UTIL), [])
  assert.ok(has(scanHtmlMotion('<span class="animate-bounce">↓</span>', REST), 'warn'))
})
