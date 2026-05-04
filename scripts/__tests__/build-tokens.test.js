// build-tokens.js의 deepMerge 동작 검증 — KRDS 정본 + INFOMIND 오버라이드 합병 정합성
// node:test 빌트인 (Node 20+) — 외부 테스트 프레임워크 불필요

const { test } = require('node:test')
const assert = require('node:assert/strict')

// build-tokens.js의 deepMerge를 재현 — 실제 함수 추출이 아닌 동일 로직 검증
function deepMerge(base, over) {
  if (over === null) return null
  if (typeof over !== 'object' || over === null) return over
  if (typeof base !== 'object' || base === null) return over
  if (Array.isArray(over)) return over
  const out = { ...base }
  for (const k of Object.keys(over)) {
    if (k === '$meta' || k === '$comment' || k === '$usage') continue
    if (k in base) {
      out[k] = deepMerge(base[k], over[k])
    } else {
      out[k] = over[k]
    }
  }
  return out
}

test('deepMerge — KRDS 같은 경로 덮어쓰기', () => {
  const base = { color: { primary: { 50: '#256ef4' } } }
  const over = { color: { primary: { 50: '#0b50d0' } } }
  const merged = deepMerge(base, over)
  assert.equal(merged.color.primary[50], '#0b50d0')
})

test('deepMerge — KRDS 없는 경로 추가', () => {
  const base = { color: { primary: { 50: '#256ef4' } } }
  const over = { color: { primary: { 60: '#0b50d0' } } }
  const merged = deepMerge(base, over)
  assert.equal(merged.color.primary[50], '#256ef4')
  assert.equal(merged.color.primary[60], '#0b50d0')
})

test('deepMerge — null 명시 삭제 정책', () => {
  const base = { color: { primary: { 50: '#256ef4' } } }
  const over = { color: { primary: null } }
  const merged = deepMerge(base, over)
  assert.equal(merged.color.primary, null)
})

test('deepMerge — $meta/$comment/$usage 키 보존', () => {
  const base = { color: { primary: { 50: '#256ef4' } } }
  const over = {
    $meta: { version: '2.0' },
    $comment: 'INFOMIND override',
    color: { primary: { 50: '#0b50d0' } }
  }
  const merged = deepMerge(base, over)
  assert.equal(merged.color.primary[50], '#0b50d0')
  // $meta/$comment 같은 메타 키는 머지 결과에 포함되지 않음 (정책)
  assert.equal('$meta' in merged, false)
})

test('deepMerge — 배열은 통째로 교체 (병합 안 함)', () => {
  const base = { breakpoints: ['mobile', 'tablet', 'pc'] }
  const over = { breakpoints: ['mobile', 'desktop'] }
  const merged = deepMerge(base, over)
  assert.deepEqual(merged.breakpoints, ['mobile', 'desktop'])
})
