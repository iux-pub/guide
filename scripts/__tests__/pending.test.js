// 「저장소에 없는 것」 감지 테스트.
//
// 이 감지가 틀리면 두 방향 다 나쁘다 — 못 잡으면 팀원이 만든 아이콘이 배포 때
// 조용히 사라지고, 헛짚으면 멀쩡한데 배포가 막힌다. 실제로 둘 다 겪었다.

const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { execFileSync } = require('node:child_process')
const { test } = require('node:test')
const assert = require('node:assert/strict')

const ROOT = path.resolve(__dirname, '..', '..')

/** server.mjs가 쓰는 것과 같은 이름 뽑기 규칙. */
function iconNamesFrom(lines) {
  const icons = new Set()
  for (const line of lines) {
    const m = line.trim().match(/assets\/icons\/svg\/(?:([a-z][a-z0-9-]*)\/)?([a-z][a-z0-9-]*)\.svg$/)
    if (m) icons.add(m[2])
  }
  return [...icons].sort()
}

test('새 아이콘·표정·계약 변경을 모두 잡는다', () => {
  const lines = [
    ' M contracts/icon-codepoints.json',
    ' M contracts/icon-keywords.json',
    '?? assets/icons/svg/e-ticket.svg',
    '?? assets/icons/svg/bold/e-ticket.svg',
    '?? assets/icons/svg/fill/e-ticket.svg'
  ]
  assert.deepEqual(iconNamesFrom(lines), ['e-ticket'], '표정 폴더가 섞여도 아이콘 이름 하나로 모인다')
})

test('아이콘과 무관한 변경은 이름으로 세지 않는다', () => {
  // 파일 수로는 잡히되(배포는 멈춘다) 아이콘 이름 목록에는 안 들어간다
  assert.deepEqual(iconNamesFrom([' M contracts/icon-contract.json']), [])
})

test('패치를 뽑아도 인덱스에 흔적이 남지 않는다', () => {
  // `git add -N`은 새 파일을 diff에 나오게 하지만 흔적이 남으면 파일을 지운 뒤에도
  // git status가 유령 삭제(D)를 보고해 배포가 헛되이 멈춘다. 2026-08-24에 실제로 겪었다.
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'iux-pending-'))
  const g = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' })
  try {
    g('init', '-q')
    g('config', 'user.email', 't@example.com')
    g('config', 'user.name', 't')
    fs.mkdirSync(path.join(dir, 'assets/icons/svg'), { recursive: true })
    fs.writeFileSync(path.join(dir, 'seed.txt'), 'x')
    g('add', '-A')
    g('commit', '-qm', 'init')

    const newIcon = path.join(dir, 'assets/icons/svg/probe.svg')
    fs.writeFileSync(newIcon, '<svg/>')

    // server.mjs가 하는 순서 그대로
    g('add', '-N', '--', 'assets/icons/svg')
    const patch = g('diff', '--binary', '--', 'assets/icons/svg')
    g('reset', '-q', '--', 'assets/icons/svg')

    assert.match(patch, /new file mode/, '새 파일이 패치에 담겨야 한다')
    assert.match(patch, /probe\.svg/)

    // 지운 뒤 유령이 남지 않아야 한다
    fs.unlinkSync(newIcon)
    assert.equal(g('status', '--porcelain').trim(), '', '인덱스에 흔적이 남았다')
  } finally {
    fs.rmSync(dir, { recursive: true, force: true })
  }
})

test('배포 스크립트가 미저장 변경에서 멈춘다', () => {
  // 안전장치가 실수로 빠지면 조용한 데이터 손실로 돌아간다
  const sh = fs.readFileSync(path.join(ROOT, 'scripts/deploy-nas.sh'), 'utf8')
  const guard = sh.indexOf('git status --porcelain assets contracts')
  const reset = sh.indexOf('git reset -q --hard origin/main')
  assert.ok(guard > 0, '미저장 변경 검사가 없다')
  assert.ok(reset > 0, 'reset --hard가 없다')
  assert.ok(guard < reset, '검사가 reset --hard보다 먼저여야 한다')
  assert.match(sh.slice(guard, reset), /exit 1/, '변경이 있으면 실패로 끝나야 한다')
})
