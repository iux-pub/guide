// foundation 토큰 정책 검증
// node:test 빌트인 (Node 20+) — 외부 테스트 프레임워크 불필요

const fs = require('node:fs')
const path = require('node:path')
const { test } = require('node:test')
const assert = require('node:assert/strict')

const ROOT = path.resolve(__dirname, '..', '..')
const source = JSON.parse(fs.readFileSync(path.join(ROOT, 'tokens', 'foundation.json'), 'utf8'))

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

test('foundation은 색상과 폰트만 토큰 소스로 갖는다', () => {
  const publicKeys = Object.keys(source).filter(key => !key.startsWith('$')).sort()
  assert.deepEqual(publicKeys, ['font', 'mode-high-contrast', 'mode-light', 'primitive'])
  assert.ok(source.primitive.color)
  assert.ok(source.font.family.sans.value.includes('Pretendard GOV'))
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
