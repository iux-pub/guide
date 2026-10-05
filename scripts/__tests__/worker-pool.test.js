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

test('참조 그림으로 로고를 옮기는 길은 없다', () => {
  // 2026-10-05에 걷어냈다. 참조를 붙인 요청 8건 가운데 5건이 실패하고 2건은 끝나지 않았으며
  // 후보를 낸 1건도 1개뿐이었다. 정해진 모양은 원본 SVG를 그대로 쓴다.
  // 어디선가 되살아나면 요청이 다시 몇십 분씩 걸리고 일꾼이 한 건에 묶인다.
  const legacy = /referenceImage|hasReference|describeReference|REF_DRAW_TIMEOUT_MS|fromReference/
  for (const file of ['studio/server.mjs', 'studio/worker.mjs', 'studio/public/app.js', 'studio/public/index.html']) {
    const code = fs.readFileSync(path.join(ROOT, file), 'utf8')
    assert.doesNotMatch(code, legacy, `${file}에 참조 그림 경로가 남아 있다`)
  }
})

test('워커의 모델·사고량 설정은 Claude 앱의 환경변수와 겹치지 않는다', () => {
  // Claude Code 데스크톱 앱은 세션마다 CLAUDE_EFFORT를 자기 값(xhigh 등)으로 둔다.
  // 같은 이름을 읽으면 Claude 세션 안에서 워커를 띄울 때 우리 기본값(medium)이 무시되고
  // 앱의 사고량이 적용된다 — 2026-10-05 측정 중 medium이어야 할 호출이 xhigh로 돌아 187초가 걸렸다.
  const worker = fs.readFileSync(path.join(ROOT, 'studio/worker.mjs'), 'utf8')
  assert.doesNotMatch(worker, /process\.env\.CLAUDE_(EFFORT|MODEL|RETRY_EFFORT)/)
  assert.match(worker, /process\.env\.ICON_STUDIO_EFFORT \|\| 'medium'/)
  assert.match(worker, /process\.env\.ICON_STUDIO_MODEL \?\? 'claude-sonnet-5-5'/)
})

test('모델은 claude 호출에 명시해 넘긴다', () => {
  // 지정하지 않으면 계정 기본 모델이 쓰여 같은 요청이 사람마다 다른 모델로 그려진다
  const worker = fs.readFileSync(path.join(ROOT, 'studio/worker.mjs'), 'utf8')
  assert.match(worker, /if \(MODEL\) args\.push\('--model', MODEL\)/)
})

test('다시 그릴 때는 기본보다 높은 사고량을 쓴다', () => {
  // 기본이 medium이 되면서 예전의 하드코딩된 'medium'은 재시도가 기본과 같아지는 퇴보가 된다
  const worker = fs.readFileSync(path.join(ROOT, 'studio/worker.mjs'), 'utf8')
  assert.equal((worker.match(/, 'medium'\)/g) || []).length, 0, "askClaude(..., 'medium') 하드코딩이 남아 있다")
  assert.equal((worker.match(/RETRY_EFFORT\)/g) || []).length, 2, '표정·새 아이콘 재시도 두 곳 모두 RETRY_EFFORT를 써야 한다')
  assert.match(worker, /ICON_STUDIO_RETRY_EFFORT \|\| 'high'/)
})
