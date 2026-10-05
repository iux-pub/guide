// 호(A) 처리 검증 — 굵기 계산과 영역 검사가 호로 그린 도형도 제대로 읽는다.
//
// 2026-10-05에 소넷 5.5로 바꾸고 실서버에서 귤을 그리게 했더니 후보 둘 다 "선이 많이 가늡니다"
// 경고와 함께 재시도를 거쳤다. 그림은 세트만큼 굵었다. 모델은 원을 `a8.5 8.5 0 1 0 0 17`
// 반원 호 두 개로 그리는데, 호를 끝점까지의 직선으로 근사하던 계산기는 그 원을 선분 하나로 보았다.
//   · 굵기 1.5짜리 고리가 0.36으로 재어져 멀쩡한 그림이 "가늘다"로 판정돼 불필요한 재시도가 걸렸다
//   · 영역 검사도 호의 끝점만 봐서 호로 그린 원의 가로 범위가 한 점이었다 (캔버스를 넘어도 못 잡는다)
// 세트의 구글 아이콘은 호를 쓰지 않아 기준값은 그대로고, 호로 그린 새 아이콘만 틀리게 재어졌다.

const { test } = require('node:test')
const assert = require('node:assert/strict')

const { arcPoints, pathBounds } = require('../lib/svg-path')
const { measure } = require('../lib/svg-geometry')

const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg ?? ''} ${a} ≈ ${b} (허용 ${tol})`)

// 반지름 8.5의 바깥 원과 7의 안쪽 원 — 굵기 1.5의 고리. 호 두 개로 한 바퀴.
const RING_ARC = 'M12 5a8.5 8.5 0 1 0 0 17a8.5 8.5 0 1 0 0-17ZM12 6.5a7 7 0 1 0 0 14a7 7 0 1 0 0-14Z'

/** 같은 고리를 3차 베지어 네 개로 — 호가 없는 기준 */
function ringBezier(cx, cy, r) {
  const k = 0.5523 * r
  return `M${cx + r} ${cy}C${cx + r} ${cy + k} ${cx + k} ${cy + r} ${cx} ${cy + r}` +
    `C${cx - k} ${cy + r} ${cx - r} ${cy + k} ${cx - r} ${cy}` +
    `C${cx - r} ${cy - k} ${cx - k} ${cy - r} ${cx} ${cy - r}` +
    `C${cx + k} ${cy - r} ${cx + r} ${cy - k} ${cx + r} ${cy}Z`
}

test('호 두 개로 그린 고리의 굵기를 실제대로 잰다', () => {
  const m = measure([RING_ARC])
  near(m.strokeWeight, 1.5, 0.08, '굵기')
  // 직선 근사 시절에는 0.36이었다
  assert.ok(m.strokeWeight > 1, '호로 그린 고리가 얇게 재어진다')
})

test('호로 그린 고리와 베지어로 그린 고리는 같게 잰다', () => {
  const arc = measure([RING_ARC])
  const bez = measure([ringBezier(12, 12, 8.5) + ringBezier(12, 12, 7)])
  near(arc.strokeWeight, bez.strokeWeight, 0.05, '굵기')
  near(arc.area, bez.area, 2, '면적')
})

test('호 하나로 시작점에서 닫는 원의 면적은 πr²에 가깝다', () => {
  // 반원 두 개 → 원. 다각형으로 펴므로 아주 조금 작다 (32각형이면 0.6%)
  const m = measure(['M12 4a8 8 0 1 0 0 16a8 8 0 1 0 0-16Z'])
  near(m.area, Math.PI * 64, Math.PI * 64 * 0.01, '면적')
})

test('호로 그린 도형의 영역은 호 위의 점까지 본다', () => {
  const b = pathBounds(RING_ARC)
  near(b.minX, 3.5, 0.05, 'minX')
  near(b.maxX, 20.5, 0.05, 'maxX')
  near(b.minY, 5, 0.05, 'minY')
  near(b.maxY, 22, 0.05, 'maxY')
})

test('캔버스를 넘는 호도 영역 검사에 잡힌다', () => {
  // 중심 (12,12), 반지름 14 — 끝점(12,-2)·(12,26)만 보면 가로 범위가 12 한 점이라 못 잡았다
  const b = pathBounds('M12-2a14 14 0 1 0 0 28a14 14 0 1 0 0-28Z')
  assert.ok(b.minX < 0 && b.maxX > 24, `가로 범위가 캔버스를 넘어야 한다 (${b.minX}~${b.maxX})`)
})

test('sweep 방향에 따라 호가 반대쪽으로 휜다', () => {
  // SVG 규격: sweep=1은 화면에서 시계 방향이다. (0,0)에서 (10,0)까지 반지름 5의 반원이면
  // 왼쪽 점에서 출발해 위(y가 작아지는 쪽)를 돌아 오른쪽에 닿는다. sweep=0은 그 반대로 아래를 돈다.
  const clockwise = arcPoints(0, 0, 5, 5, 0, 0, 1, 10, 0)
  const counter = arcPoints(0, 0, 5, 5, 0, 0, 0, 10, 0)
  near(Math.min(...clockwise.map((p) => p[1])), -5, 0.05, 'sweep=1 꼭대기')
  near(Math.max(...counter.map((p) => p[1])), 5, 0.05, 'sweep=0 바닥')
})

test('large-arc 플래그가 큰 쪽 호를 고른다', () => {
  // 반지름 5, 현 (0,0)-(6,0) — 중심은 (3,4) 또는 (3,-4). 작은 호는 현에서 1만 솟고 큰 호는 9까지 돈다
  const small = arcPoints(0, 0, 5, 5, 0, 0, 1, 6, 0)
  const large = arcPoints(0, 0, 5, 5, 0, 1, 1, 6, 0)
  near(Math.min(...small.map((p) => p[1])), -1, 0.05, '작은 호의 높이')
  near(Math.min(...large.map((p) => p[1])), -9, 0.05, '큰 호의 높이')
})

test('반지름이 너무 작으면 반원으로 키운다 (규격)', () => {
  // 두 점 거리 10인데 반지름 1 — 그대로면 닿지 못한다. 규격은 반지름을 키워 반원을 만든다
  const pts = arcPoints(0, 0, 1, 1, 0, 0, 1, 10, 0)
  near(Math.min(...pts.map((p) => p[1])), -5, 0.05, '반원의 높이')
})

test('반지름이 0이면 직선이고 같은 점이면 호가 없다', () => {
  assert.deepEqual(arcPoints(0, 0, 0, 5, 0, 0, 1, 10, 0), [[10, 0]])
  assert.deepEqual(arcPoints(3, 3, 5, 5, 0, 0, 1, 3, 3), [])
})

test('마지막 점은 끝점과 정확히 같다', () => {
  // 부동소수 오차로 이음매가 벌어지면 닫힌 도형의 면적이 흔들린다
  const pts = arcPoints(12, 5, 8.5, 8.5, 0, 1, 0, 12, 22)
  assert.deepEqual(pts[pts.length - 1], [12, 22])
})

test('회전한 타원 호도 끝점을 지난다', () => {
  const pts = arcPoints(0, 0, 10, 4, 45, 0, 1, 8, 8)
  assert.deepEqual(pts[pts.length - 1], [8, 8])
  assert.ok(pts.length >= 2)
})

test('상대 좌표 호(a)도 같은 결과다', () => {
  const abs = measure(['M12 5A8.5 8.5 0 1 0 12 22A8.5 8.5 0 1 0 12 5Z'])
  const rel = measure(['M12 5a8.5 8.5 0 1 0 0 17a8.5 8.5 0 1 0 0-17Z'])
  near(abs.area, rel.area, 0.01, '면적')
})
