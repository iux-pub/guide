// 하다 만 일 되살리기 테스트.
//
// 일꾼이 일하는 중에 죽으면(배포 재기동·재부팅) 결과가 「하는 중」으로 굳고,
// tick은 결과 파일이 있으면 건너뛰므로 그 요청은 영원히 안 끝난다.
// 2026-08-24에 실제로 「55분째 만드는 중」이 화면에 남았다.

const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { test } = require('node:test')
const assert = require('node:assert/strict')

const ROOT = path.resolve(__dirname, '..', '..')

/** worker.mjs의 recoverStale을 떼어 내 규칙만 시험한다(서버를 띄우지 않는다). */
function loadRecover(queue) {
  const src = fs.readFileSync(path.join(ROOT, 'studio/worker.mjs'), 'utf8')
  const fn = src.match(/function recoverStale\(\)[\s\S]*?\n\}/)[0]
  return new Function('fs', 'path', 'QUEUE', 'console', `${fn}; return recoverStale`)(
    fs, path, queue, { log: () => {} }
  )
}

function withQueue(run) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'iux-recover-'))
  fs.mkdirSync(path.join(dir, 'requests'), { recursive: true })
  fs.mkdirSync(path.join(dir, 'results'), { recursive: true })
  try {
    return run(dir, loadRecover(dir))
  } finally {
    fs.rmSync(dir, { recursive: true, force: true })
  }
}

const put = (dir, id, request, result) => {
  fs.writeFileSync(path.join(dir, 'requests', `${id}.json`), JSON.stringify(request))
  if (result) fs.writeFileSync(path.join(dir, 'results', `${id}.json`), JSON.stringify(result))
}
const readRes = (dir, id) => {
  const p = path.join(dir, 'results', `${id}.json`)
  return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : null
}
const readReq = (dir, id) => JSON.parse(fs.readFileSync(path.join(dir, 'requests', `${id}.json`), 'utf8'))

test('하다 만 요청은 결과를 지워 다시 집게 한다', () => {
  withQueue((dir, recover) => {
    put(dir, 'a', { id: 'a', text: 'x' }, { id: 'a', status: 'working', startedAt: '2026-08-24T01:41:10Z' })
    recover()
    assert.equal(readRes(dir, 'a'), null, '결과가 남아 있으면 tick이 영원히 건너뛴다')
    assert.equal(readReq(dir, 'a').restarts, 1, '되살린 횟수를 세야 한다')
  })
})

test('끝난 요청은 건드리지 않는다', () => {
  withQueue((dir, recover) => {
    put(dir, 'b', { id: 'b' }, { id: 'b', status: 'ready', candidates: [] })
    put(dir, 'c', { id: 'c' }, { id: 'c', status: 'failed', failures: ['x'] })
    recover()
    assert.equal(readRes(dir, 'b').status, 'ready')
    assert.equal(readRes(dir, 'c').status, 'failed')
  })
})

test('두 번까지만 되살리고 그 뒤엔 실패로 적는다', () => {
  // 일꾼을 죽이는 요청이면 되살릴 때마다 또 죽는다. 무한 되풀이를 막는다.
  withQueue((dir, recover) => {
    put(dir, 'd', { id: 'd', restarts: 2 }, { id: 'd', status: 'working' })
    recover()
    const r = readRes(dir, 'd')
    assert.equal(r.status, 'failed')
    assert.match(r.failures[0], /되살렸는데/)
  })
})

test('요청이 사라진 결과는 치운다', () => {
  // 되살릴 근거가 없는데 남겨 두면 화면에 영원히 「하는 중」으로 뜬다
  withQueue((dir, recover) => {
    fs.writeFileSync(path.join(dir, 'results', 'e.json'), JSON.stringify({ id: 'e', status: 'working' }))
    recover()
    assert.equal(readRes(dir, 'e'), null)
  })
})
