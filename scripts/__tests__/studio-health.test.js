// 일꾼 건강 판정 테스트.
//
// 일꾼이 조용히 멈추는 실패가 실제로 있다 — claude 세션 자격이 만료되면 자동 갱신이
// 안 되는 상태로 빠지고, 요청은 「기다리는 중」으로 영원히 남는다. 판정이 틀리면
// 두 방향 다 나쁘다: 못 잡으면 사람이 하염없이 기다리고, 헛짚으면 멀쩡한데 막힌다.

const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { test } = require('node:test')
const assert = require('node:assert/strict')

const ROOT = path.resolve(__dirname, '..', '..')

/**
 * server.mjs의 workerHealth를 떼어 내 판정 규칙만 시험한다.
 *
 * 서버를 통째로 import하면 포트를 잡아 테스트가 매달린다(2026-08-23에 실제로 겪었다).
 */
function loadHealth(queueDir) {
  const src = fs.readFileSync(path.join(ROOT, 'studio/server.mjs'), 'utf8')
  const fn = src.match(/function workerHealth\(\) \{[\s\S]*?\n\}/)[0]
  const readJson = (p, fallback) => {
    try {
      return JSON.parse(fs.readFileSync(p, 'utf8'))
    } catch {
      return fallback
    }
  }
  return new Function('fs', 'path', 'QUEUE', 'readJson', `${fn}; return workerHealth`)(
    fs, path, queueDir, readJson
  )
}

function withQueue(run) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'iux-hb-'))
  try {
    return run(dir, loadHealth(dir))
  } finally {
    fs.rmSync(dir, { recursive: true, force: true })
  }
}

const writeBeat = (dir, ageMs, extra = {}) =>
  fs.writeFileSync(
    path.join(dir, 'worker-heartbeat.json'),
    JSON.stringify({ at: new Date(Date.now() - ageMs).toISOString(), pollMs: 4000, state: '도는 중', ...extra })
  )

test('박동 파일이 없으면 멈춘 것으로 본다', () => {
  withQueue((dir, health) => {
    const h = health()
    assert.equal(h.alive, false)
    // 「뜬 적이 없다」와 「뜨다 멈췄다」는 사람이 할 일이 다르다
    assert.match(h.reason, /뜨지 않았습니다/)
  })
})

test('방금 뛰었으면 살아 있다', () => {
  withQueue((dir, health) => {
    writeBeat(dir, 1000)
    assert.equal(health().alive, true)
  })
})

test('한 회차쯤 늦는 것으로는 죽었다고 하지 않는다', () => {
  withQueue((dir, health) => {
    // 폴링 4초 · 한계 24초. 생성이 도는 동안에도 박동은 남지만 여유를 둔다.
    writeBeat(dir, 12_000)
    assert.equal(health().alive, true, '12초는 정상 범위여야 한다 — 헛짚으면 멀쩡한데 막힌다')
  })
})

test('폴링 주기의 6배를 넘으면 멈춘 것으로 본다', () => {
  withQueue((dir, health) => {
    writeBeat(dir, 30_000)
    const h = health()
    assert.equal(h.alive, false)
    assert.match(h.reason, /박동이 없습니다/)
    assert.ok(h.ageSec >= 29, `경과 ${h.ageSec}초가 실제와 맞아야 한다`)
  })
})

test('폴링 주기가 다르면 한계도 따라 움직인다', () => {
  withQueue((dir, health) => {
    // 느리게 도는 일꾼을 죽었다고 하면 안 된다
    writeBeat(dir, 30_000, { pollMs: 20_000 })
    assert.equal(health().alive, true, '20초 주기면 30초는 아직 정상이다')
  })
})

test('깨진 박동 파일에 넘어가지 않는다', () => {
  withQueue((dir, health) => {
    fs.writeFileSync(path.join(dir, 'worker-heartbeat.json'), '{깨진')
    const h = health()
    assert.equal(h.alive, false)
    assert.ok(h.reason, '이유를 말해야 한다')
  })
})
