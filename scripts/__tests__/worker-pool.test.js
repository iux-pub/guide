// 동시 실행 제한 테스트.
//
// claude 하나가 무겁다 — 참조 그림이 붙으면 호출당 630초다(2026-08-24 실측).
// 4코어 서버에서 넷을 한꺼번에 던지면 서로 굶겨 **넷 다** 시간 초과로 떨어진다.
// 나눠 돌리면 적어도 먼저 끝난 것은 남는다.

const fs = require('node:fs')
const path = require('node:path')
const { test } = require('node:test')
const assert = require('node:assert/strict')

const ROOT = path.resolve(__dirname, '..', '..')
const src = fs.readFileSync(path.join(ROOT, 'studio/worker.mjs'), 'utf8')

function loadPool(maxParallel) {
  const fn = src.match(/async function pool\([\s\S]*?\n\}/)[0]
  return new Function('MAX_PARALLEL', `${fn}; return pool`)(maxParallel)
}

test('한 번에 정해진 개수만 돈다', async () => {
  const pool = loadPool(2)
  let now = 0
  let peak = 0
  const items = [0, 1, 2, 3, 4, 5]

  await pool(items, async (x) => {
    now += 1
    peak = Math.max(peak, now)
    await new Promise((r) => setTimeout(r, 10))
    now -= 1
    return x * 2
  })

  assert.equal(peak, 2, `한 번에 ${peak}개가 돌았다 — 2개여야 한다`)
})

test('결과가 넣은 순서를 지킨다', async () => {
  // 화면이 후보를 순서대로 보여 준다. 순서가 섞이면 「1번을 골랐는데 2번이 채택」된다.
  const pool = loadPool(3)
  const out = await pool([0, 1, 2, 3, 4], async (x) => {
    // 뒤엣것이 먼저 끝나게 만든다
    await new Promise((r) => setTimeout(r, (5 - x) * 8))
    return `r${x}`
  })
  assert.deepEqual(out, ['r0', 'r1', 'r2', 'r3', 'r4'])
})

test('항목이 제한보다 적으면 그만큼만 돈다', async () => {
  const pool = loadPool(4)
  let peak = 0
  let now = 0
  await pool([0, 1], async () => {
    now += 1
    peak = Math.max(peak, now)
    await new Promise((r) => setTimeout(r, 5))
    now -= 1
  })
  assert.equal(peak, 2)
})

test('빈 목록에도 멈추지 않는다', async () => {
  const pool = loadPool(2)
  assert.deepEqual(await pool([], async () => 'x'), [])
})

test('참조가 붙으면 후보를 줄인다', () => {
  // 같은 형태를 옮기는 일이라 「다른 접근」이 의미가 없고, 호출이 무겁다
  const server = fs.readFileSync(path.join(ROOT, 'studio/server.mjs'), 'utf8')
  assert.match(server, /hasReference \? 2 : 4/, '참조 있을 때 기본 후보 수가 줄어야 한다')
})
