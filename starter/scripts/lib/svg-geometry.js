// 아이콘 형태를 수치로 재는 도구 — "혼자 튀는가"를 기계가 말할 수 있게 한다.
//
// 왜 면적이나 둘레 하나만으로는 안 되나 (2026-08-23 실측):
//   먹임량(면적)만 재서 세트 중앙값과 비교했더니 72종 중 22종이 경고로 떴다.
//   꺾쇠(chevron)는 늘 "가늘다", 톱니바퀴(settings)는 늘 "굵다"로 나온다 —
//   형태 복잡도를 재고 있었기 때문이다. 복잡한 아이콘이 면적이 큰 건 당연하다.
//
//   실제로 잡고 싶은 것은 **획 굵기**다. 다른 것이 2px로 그려졌는데 혼자 3px면
//   세트에서 튄다. 아이콘은 선을 면으로 변환한 상태이므로,
//
//       평균 획 굵기 ≈ 2 × 면적 / 둘레
//
//   긴 띠(길이 L, 두께 T)의 면적은 L×T, 둘레는 2L+2T ≈ 2L이므로 위 식이 성립한다.
//   이 값은 형태가 단순하든 복잡하든 획이 같으면 같게 나온다.

const { parsePath } = require('./svg-path')

/** 베지어를 직선으로 쪼갤 등분 수. 크면 정확하고 느리다. 아이콘 크기에는 8이면 충분하다. */
const CURVE_STEPS = 8

function quadAt(p0, p1, p2, t) {
  const u = 1 - t
  return [
    u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0],
    u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1]
  ]
}

function cubicAt(p0, p1, p2, p3, t) {
  const u = 1 - t
  return [
    u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
    u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]
  ]
}

/**
 * path를 subpath별 점 배열로 편다. 곡선은 직선으로 쪼갠다.
 * 원이 다각형이 되어 면적이 조금 줄지만, 모든 아이콘에 같은 근사를 쓰므로
 * 상대 비교에는 영향이 없다.
 */
function flatten(d) {
  const subpaths = []
  let pts = null
  let cur = [0, 0]
  let start = [0, 0]
  // 이전 제어점 — S/T의 반사에 쓴다
  let prevCubicCtrl = null
  let prevQuadCtrl = null

  const push = (p) => {
    if (pts) pts.push(p)
    cur = p
  }
  const open = (p) => {
    if (pts && pts.length > 1) subpaths.push(pts)
    pts = [p]
    cur = p
    start = p
  }

  for (const { cmd, args } of parsePath(d)) {
    const up = cmd.toUpperCase()
    const abs = cmd === up
    const ax = (i) => (abs ? args[i] : cur[0] + args[i])
    const ay = (i) => (abs ? args[i] : cur[1] + args[i])

    if (up === 'M') {
      open([ax(0), ay(1)])
      prevCubicCtrl = prevQuadCtrl = null
      continue
    }
    if (up === 'Z') {
      if (pts && pts.length > 1) {
        pts.push(start)
        subpaths.push(pts)
      }
      pts = null
      cur = start
      prevCubicCtrl = prevQuadCtrl = null
      continue
    }
    if (!pts) open(cur)

    if (up === 'L') { push([ax(0), ay(1)]); prevCubicCtrl = prevQuadCtrl = null; continue }
    if (up === 'H') { push([abs ? args[0] : cur[0] + args[0], cur[1]]); prevCubicCtrl = prevQuadCtrl = null; continue }
    if (up === 'V') { push([cur[0], abs ? args[0] : cur[1] + args[0]]); prevCubicCtrl = prevQuadCtrl = null; continue }

    if (up === 'C' || up === 'S') {
      const p0 = cur
      let c1
      let c2
      let p3
      if (up === 'C') {
        c1 = [ax(0), ay(1)]; c2 = [ax(2), ay(3)]; p3 = [ax(4), ay(5)]
      } else {
        c1 = prevCubicCtrl ? [2 * p0[0] - prevCubicCtrl[0], 2 * p0[1] - prevCubicCtrl[1]] : p0
        c2 = [ax(0), ay(1)]; p3 = [ax(2), ay(3)]
      }
      for (let i = 1; i <= CURVE_STEPS; i += 1) push(cubicAt(p0, c1, c2, p3, i / CURVE_STEPS))
      prevCubicCtrl = c2
      prevQuadCtrl = null
      continue
    }

    if (up === 'Q' || up === 'T') {
      const p0 = cur
      let c1
      let p2
      if (up === 'Q') {
        c1 = [ax(0), ay(1)]; p2 = [ax(2), ay(3)]
      } else {
        c1 = prevQuadCtrl ? [2 * p0[0] - prevQuadCtrl[0], 2 * p0[1] - prevQuadCtrl[1]] : p0
        p2 = [ax(0), ay(1)]
      }
      for (let i = 1; i <= CURVE_STEPS; i += 1) push(quadAt(p0, c1, p2, i / CURVE_STEPS))
      prevQuadCtrl = c1
      prevCubicCtrl = null
      continue
    }

    if (up === 'A') {
      // 호는 끝점까지 직선으로 근사한다. 아이콘의 호는 대부분 짧아 영향이 작다.
      push([abs ? args[5] : cur[0] + args[5], abs ? args[6] : cur[1] + args[6]])
      prevCubicCtrl = prevQuadCtrl = null
    }
  }

  if (pts && pts.length > 1) subpaths.push(pts)
  return subpaths
}

/** 신발끈 공식. 부호가 방향을 담으므로 구멍(반대 방향)은 자동으로 빠진다. */
function signedArea(pts) {
  let a = 0
  for (let i = 0; i < pts.length - 1; i += 1) {
    a += pts[i][0] * pts[i + 1][1] - pts[i + 1][0] * pts[i][1]
  }
  return a / 2
}

function perimeter(pts) {
  let p = 0
  for (let i = 0; i < pts.length - 1; i += 1) {
    p += Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1])
  }
  return p
}

/** 점이 다각형 안에 있는가 (ray casting). */
function pointInPoly(pt, poly) {
  let inside = false
  for (let i = 0, j = poly.length - 2; i < poly.length - 1; j = i++) {
    const [xi, yi] = poly[i]
    const [xj, yj] = poly[j]
    if ((yi > pt[1]) !== (yj > pt[1]) &&
        pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) {
      inside = !inside
    }
  }
  return inside
}

/** subpath의 대표점 — 무게중심이 형태 밖에 놓일 수 있어 첫 변의 중점을 쓴다. */
function samplePoint(sp) {
  if (sp.length < 2) return sp[0]
  return [(sp[0][0] + sp[1][0]) / 2, (sp[0][1] + sp[1][1]) / 2]
}

/**
 * 아이콘 한 장의 기하 지표.
 *
 * 면적은 **fill-rule: evenodd 기준**으로 센다 — 우리 규격이 evenodd이기 때문이다.
 * 부호(감는 방향)로 더하면 안 된다: 모델이 바깥·안쪽을 같은 방향으로 그려도
 * evenodd에서는 정상적으로 뚫리는데, 부호 합산은 그걸 「꽉 찬 덩어리」로 오판한다
 * (2026-08-23 실측: 실제로는 테두리가 제대로 그려진 아이콘을 획 4.27로 재서
 * 여섯 번을 헛짚었다). 포함 깊이가 홀수면 칠해진 부분, 짝수면 구멍이다.
 *
 * @returns {{area:number, perimeter:number, strokeWeight:number, subpaths:number}}
 *   area          칠해진 순면적 (구멍 제외)
 *   perimeter     윤곽선 총 길이
 *   strokeWeight  평균 획 굵기 근사 = 2 × area / perimeter
 */
function measure(ds) {
  const subpaths = []
  for (const d of ds) for (const sp of flatten(d)) subpaths.push(sp)
  if (subpaths.length === 0) return { area: 0, perimeter: 0, strokeWeight: 0, subpaths: 0 }

  const areas = subpaths.map((sp) => Math.abs(signedArea(sp)))
  const peri = subpaths.reduce((sum, sp) => sum + perimeter(sp), 0)

  // 각 subpath가 다른 subpath 몇 개 안에 들어 있는지 센다.
  // 홀수면 칠해진 영역, 짝수(0 포함)면 바깥이거나 구멍이다.
  let net = 0
  for (let i = 0; i < subpaths.length; i += 1) {
    const pt = samplePoint(subpaths[i])
    let depth = 0
    for (let j = 0; j < subpaths.length; j += 1) {
      if (i === j) continue
      // 자기보다 큰 것만 감쌀 수 있다 — 같은 크기끼리의 오판을 줄인다
      if (areas[j] <= areas[i]) continue
      if (pointInPoly(pt, subpaths[j])) depth += 1
    }
    net += depth % 2 === 0 ? areas[i] : -areas[i]
  }

  const area = Math.max(0, net)
  return {
    area,
    perimeter: peri,
    strokeWeight: peri > 0 ? (2 * area) / peri : 0,
    subpaths: subpaths.length
  }
}

/**
 * 형태 지문 — 격자에 선을 그려 점유 칸을 모은다.
 * 끝점만 찍으면 해상도가 낮아 서로 다른 아이콘도 닮아 보인다.
 */
function shapeCells(ds, grid = 24) {
  const cells = new Set()
  const mark = (x, y) => {
    const gx = Math.min(grid - 1, Math.max(0, Math.floor((x / 24) * grid)))
    const gy = Math.min(grid - 1, Math.max(0, Math.floor((y / 24) * grid)))
    cells.add(gy * grid + gx)
  }
  for (const d of ds) {
    for (const sp of flatten(d)) {
      for (let i = 0; i < sp.length - 1; i += 1) {
        const [x0, y0] = sp[i]
        const [x1, y1] = sp[i + 1]
        const steps = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0)))
        for (let s = 0; s <= steps; s += 1) {
          mark(x0 + ((x1 - x0) * s) / steps, y0 + ((y1 - y0) * s) / steps)
        }
      }
    }
  }
  return cells
}

function jaccard(a, b) {
  if (a.size === 0 && b.size === 0) return 1
  let inter = 0
  for (const v of a) if (b.has(v)) inter += 1
  return inter / (a.size + b.size - inter)
}

module.exports = { flatten, measure, shapeCells, jaccard, signedArea, perimeter, pointInPoly }
