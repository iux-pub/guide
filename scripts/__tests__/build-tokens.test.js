// foundation 토큰 정책 검증
// node:test 빌트인 (Node 20+) — 외부 테스트 프레임워크 불필요

const fs = require('node:fs')
const path = require('node:path')
const { test } = require('node:test')
const assert = require('node:assert/strict')

const {
  BRAND_GROUPS,
  BRAND_MODES,
  mergeTokens,
  assertBrandModeParity,
  loadTokenSource
} = require('../lib/token-source')

const ROOT = path.resolve(__dirname, '..', '..')
const foundation = JSON.parse(fs.readFileSync(path.join(ROOT, 'tokens', 'foundation.json'), 'utf8'))
const brand = JSON.parse(fs.readFileSync(path.join(ROOT, 'tokens', 'brand.json'), 'utf8'))

// 기존 검사는 "빌드가 실제로 보는 값"을 대상으로 한다 — 합성 결과가 계약이다.
const source = loadTokenSource(ROOT)

function collectValues(obj, out = []) {
  if (!obj || typeof obj !== 'object') return out
  if ('value' in obj) {
    out.push(obj.value)
    return out
  }
  for (const [key, value] of Object.entries(obj)) {
    if (!key.startsWith('$')) collectValues(value, out)
  }
  return out
}

test('foundation은 색상, 폰트, 브레이크포인트만 토큰 소스로 갖는다', () => {
  const publicKeys = Object.keys(source).filter(key => !key.startsWith('$')).sort()
  assert.deepEqual(publicKeys, ['breakpoint', 'font', 'mode-high-contrast', 'mode-light', 'primitive'])
  assert.ok(source.primitive.color)
  assert.ok(source.font.family.sans.value.includes('Pretendard GOV'))
  assert.deepEqual(
    Object.values(source.breakpoint).map(token => token.value),
    ['360px', '768px', '1280px']
  )
})

test('foundation에는 과한 비색상 스케일 토큰이 없다', () => {
  for (const banned of ['spacing', 'radius', 'motion', 'z-index', 'shadow', 'elevation', 'touch-target']) {
    assert.equal(JSON.stringify(source).includes(`"${banned}"`), false)
  }
})

test('font 토큰 외 값에는 font-family 문자열이 섞이지 않는다', () => {
  const values = collectValues({
    primitive: source.primitive,
    'mode-light': source['mode-light'],
    'mode-high-contrast': source['mode-high-contrast']
  })
  assert.equal(values.some(value => typeof value === 'string' && value.includes('Pretendard')), false)
})

// ── 브랜드 계층 ──────────────────────────────────────────────
// 프로젝트가 brand.json만 갈아끼워 사이트 색을 바꾸는 구조를 지킨다.

test('브랜드 계열 팔레트는 foundation이 아니라 brand가 소유한다', () => {
  for (const mode of BRAND_MODES) {
    for (const group of BRAND_GROUPS) {
      assert.equal(
        foundation.primitive.color[mode][group],
        undefined,
        `foundation에 ${mode}.${group}이 남아 있으면 브랜드 교체가 반쪽이 된다`
      )
      assert.ok(brand.primitive.color[mode][group], `brand에 ${mode}.${group}이 없다`)
    }
  }
  assert.equal(foundation.font.family.sans, undefined, '본문 폰트는 brand 소유다')
  assert.ok(brand.font.family.sans.value.includes('Pretendard GOV'))
})

test('brand는 foundation의 불변 계층을 재정의하지 않는다', () => {
  const protectedGroups = ['gray', 'danger', 'warning', 'success', 'information']
  for (const mode of BRAND_MODES) {
    for (const group of protectedGroups) {
      assert.equal(
        brand.primitive.color[mode]?.[group],
        undefined,
        `brand가 ${mode}.${group}을 덮으면 접근성 기준이 프로젝트마다 흔들린다`
      )
    }
  }
  assert.equal(brand['mode-light'], undefined, 'brand는 의미 토큰 계층을 건드리지 않는다')
})

test('합성 결과는 foundation과 brand를 모두 포함한다', () => {
  assert.ok(source.primitive.color.light.primary['50'].value.startsWith('#'))
  assert.ok(source.primitive.color.light.gray['0'].value.startsWith('#'))
  assert.ok(source.font.family.sans.value.includes('Pretendard GOV'))
  assert.ok(source.font.family.mono.value.includes('JetBrains Mono'))
})

test('브랜드 모드 정합 — 고대비 단계 누락은 빌드를 막는다', () => {
  assert.doesNotThrow(() => assertBrandModeParity(brand))

  const broken = mergeTokens(brand, {
    primitive: { color: { 'high-contrast': { primary: { '50': brand.primitive.color['high-contrast'].primary['50'] } } } }
  })
  // 고대비 primary를 1단계만 남긴 상태 — 실제로 가장 흔한 사고다
  broken.primitive.color['high-contrast'].primary = {
    '50': brand.primitive.color['high-contrast'].primary['50']
  }
  assert.throws(() => assertBrandModeParity(broken), /high-contrast에/)
})
