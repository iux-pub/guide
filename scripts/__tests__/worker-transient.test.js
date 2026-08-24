// 「잠시 뒤 다시 하면 되는 오류」 판정 테스트.
//
// claude는 이런 오류를 **stdout으로** 뱉고 종료코드 1로 끝난다. stderr만 보면 이유를
// 통째로 잃는다 — 2026-08-24에 「API Error: 529 Overloaded ... usually temporary」가
// 화면에는 「claude 종료코드 1」로 떴다. 무엇을 하면 되는지 알 수 없는 문구다.

const fs = require('node:fs')
const path = require('node:path')
const { test } = require('node:test')
const assert = require('node:assert/strict')

const ROOT = path.resolve(__dirname, '..', '..')
const src = fs.readFileSync(path.join(ROOT, 'studio/worker.mjs'), 'utf8')
const transient = new Function(`${src.match(/function transient\([\s\S]*?\n\}/)[0]}; return transient`)()

test('서버가 붐비는 오류를 알아본다', () => {
  for (const s of [
    'API Error: 529 Overloaded. This is a server-side issue, usually temporary — try again in a moment.',
    'API Error: 429 rate limit exceeded',
    'Error: 503 Service Unavailable',
    'Error: 500 Internal Server Error'
  ]) {
    assert.equal(transient(s), true, `놓쳤다: ${s.slice(0, 50)}`)
  }
})

test('다시 해도 같은 것은 붐빔으로 보지 않는다', () => {
  // 이걸 붐빔으로 오인하면 안 될 일을 몇 분씩 되풀이한다
  for (const s of ['Not logged in', 'viewBox가 잘못되었습니다', 'claude 종료코드 1', '파일을 찾지 못했습니다']) {
    assert.equal(transient(s), false, `헛짚었다: ${s}`)
  }
})

test('오류 문구를 stdout에서도 읽는다', () => {
  // 이 코드가 사라지면 이유가 다시 「종료코드 1」로 뭉개진다
  assert.match(src, /err\.trim\(\)\s*\|\|\s*out\.trim\(\)/, 'stdout을 보지 않으면 이유를 잃는다')
})

test('붐빔은 기다렸다 다시 부른다', () => {
  assert.match(src, /if \(!err\.transient \|\| i === waits\.length\) throw err/, '붐빌 때만 기다려야 한다')
  const waits = src.match(/const waits = \[([^\]]+)\]/)[1].split(',').map((n) => Number(n.trim()))
  assert.ok(waits.length >= 2, '한 번은 더 기다려 봐야 한다')
  for (let i = 1; i < waits.length; i += 1) {
    assert.ok(waits[i] > waits[i - 1], '기다리는 시간이 점점 길어져야 한다')
  }
})

test('되풀이에 끝이 있다', () => {
  // 서버가 오래 붐비면 5~10분짜리 생성을 무한정 반복하게 된다
  assert.match(src, /MAX_ATTEMPTS = 3/, '시도 한도가 있어야 한다')
  assert.match(src, /attempts >= MAX_ATTEMPTS/, '한도를 넘으면 실패로 적어야 한다')
})
