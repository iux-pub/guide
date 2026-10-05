// SVG path 좌표 변환 — Material Symbols(960 좌표계)를 infoUX 아이콘 규격(24)으로 옮긴다.
//
// 왜 transform 속성이 아니라 path 데이터를 직접 바꾸나:
//   <g transform="translate(0,960) scale(0.025)">로 감싸면 결과는 같아 보이지만
//   icon-contract의 output 규칙(path만·transform 금지)을 어기고, 스프라이트에서
//   중첩 transform이 겹칠 때 디버깅이 어려워진다. 좌표를 미리 구워 두면 파일이
//   그 자체로 24 좌표계 안에서 완결된다.
//
// 좌표 규칙:
//   절대 명령(M L H V C S Q T A) → 스케일 + 이동
//   상대 명령(m l h v c s q t a) → 스케일만 (오프셋이라 이동이 무관하다)
//   A/a의 rx·ry는 스케일, 회전각·플래그 2개는 그대로 둔다

/** 명령별 파라미터 묶음 크기와 각 값의 의미. x=가로좌표, y=세로좌표, n=그대로, f=플래그 */
const COMMANDS = {
  M: ['x', 'y'],
  L: ['x', 'y'],
  T: ['x', 'y'],
  H: ['x'],
  V: ['y'],
  C: ['x', 'y', 'x', 'y', 'x', 'y'],
  S: ['x', 'y', 'x', 'y'],
  Q: ['x', 'y', 'x', 'y'],
  A: ['x', 'y', 'n', 'f', 'f', 'x', 'y'],
  Z: []
}

/** path d 문자열을 {cmd, args[]} 배열로 쪼갠다. */
function parsePath(d) {
  const out = []
  // 명령 문자 하나 + 뒤따르는 숫자 뭉치
  const re = /([MmLlHhVvCcSsQqTtAaZz])([^MmLlHhVvCcSsQqTtAaZz]*)/g
  let m
  while ((m = re.exec(d)) !== null) {
    const cmd = m[1]
    const nums = parseNumbers(m[2])
    const spec = COMMANDS[cmd.toUpperCase()]
    if (spec.length === 0) {
      out.push({ cmd, args: [] })
      continue
    }
    // 파라미터가 묶음 크기보다 많으면 같은 명령이 반복된 것이다 (예: "L1 2 3 4")
    for (let i = 0; i < nums.length; i += spec.length) {
      const args = nums.slice(i, i + spec.length)
      if (args.length < spec.length) break
      // 반복 시 M은 L로, m은 l로 이어진다는 SVG 규칙
      const c = i === 0 ? cmd : cmd === 'M' ? 'L' : cmd === 'm' ? 'l' : cmd
      out.push({ cmd: c, args })
    }
  }
  return out
}

/**
 * 숫자 뭉치를 파싱한다. SVG는 구분자를 생략할 수 있어 단순 split이 통하지 않는다.
 * "784-120"은 [784, -120]이고, "1.5.5"는 [1.5, 0.5]다.
 */
function parseNumbers(s) {
  const re = /-?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?/g
  const out = []
  let m
  while ((m = re.exec(s)) !== null) out.push(parseFloat(m[0]))
  return out
}

/** 소수점 자릿수를 맞추고 꼬리 0을 없앤다. 2 → "2", 2.50 → "2.5" */
function fmt(n, decimals) {
  const r = Number(n.toFixed(decimals))
  return Object.is(r, -0) ? '0' : String(r)
}

/**
 * path를 다른 좌표계로 옮긴다.
 * @param {string} d           원본 path 데이터
 * @param {object} opt
 * @param {number} opt.scale   배율 (960→24 이면 0.025)
 * @param {number} opt.dx      절대 좌표에 더할 가로 이동량 (원본 좌표계 기준)
 * @param {number} opt.dy      절대 좌표에 더할 세로 이동량 (원본 좌표계 기준)
 * @param {number} opt.decimals 소수점 자릿수
 */
function transformPath(d, { scale, dx = 0, dy = 0, decimals = 2 }) {
  const segs = parsePath(d)
  const parts = []
  let seenMove = false

  for (const { cmd, args } of segs) {
    const upper = cmd.toUpperCase()
    // path의 **첫 moveto는 소문자여도 절대 좌표**다 (SVG 1.1 §8.3.2).
    // 앞에 커서가 없어 원점 기준이 되기 때문이다. 이걸 상대로 처리하면
    // 시작점만 이동이 빠지고 뒤따르는 상대 명령이 전부 그 오차를 물려받아
    // 아이콘 전체가 통째로 어긋난다 (2026-08-23 실측: Material의 m으로
    // 시작하는 path 14종이 y축 -960만큼 밀렸다).
    const isFirstMove = upper === 'M' && !seenMove
    if (upper === 'M') seenMove = true
    const isAbs = cmd === upper || isFirstMove
    const spec = COMMANDS[upper]

    if (spec.length === 0) {
      parts.push(cmd)
      continue
    }

    const moved = args.map((v, i) => {
      const kind = spec[i]
      if (kind === 'f' || kind === 'n') return v
      // 상대 명령은 오프셋이므로 이동을 적용하지 않는다
      const shift = isAbs ? (kind === 'x' ? dx : dy) : 0
      return (v + shift) * scale
    })

    // 첫 moveto를 절대로 구웠으면 명령 문자도 M으로 맞춘다. 시작 커서가 0,0이라
    // m으로 남겨도 렌더 결과는 같지만, 데이터와 명령이 어긋나 보이면 나중에 헷갈린다.
    const outCmd = isFirstMove ? 'M' : cmd
    parts.push(outCmd + moved.map((v, i) => (spec[i] === 'f' ? String(v) : fmt(v, decimals))).join(' '))
  }

  // 명령 문자 앞의 공백은 필요 없다
  return parts.join('').replace(/\s+([MmLlHhVvCcSsQqTtAaZz])/g, '$1')
}

/**
 * 호(A) 한 구간을 점들로 편다. 시작점 (x1, y1)에서 끝점 (x2, y2)까지, 시작점은 넣지 않는다.
 *
 * SVG의 호는 끝점과 반지름·플래그로만 적혀 있어 중심을 직접 구해야 한다
 * (SVG 1.1 부록 F.6.5의 끝점→중심 변환). 모델은 원을 `a8.5 8.5 0 1 0 0 17` 두 번으로 그린다 —
 * 호의 끝점만 보면 이 원은 지름 양끝의 두 점이 되어 면적이 사라지고, 굵기를 재면 실제 1.5가 0.36으로,
 * 영역을 재면 가로 범위가 한 점으로 나온다(2026-10-05 실측, 소넷 5.5의 귤).
 *
 * @param {number} stepsPerQuarter 90도당 쪼갤 등분 수 (기본 8 — 베지어와 같은 정밀도)
 * @returns {number[][]} [[x, y], ...]
 */
function arcPoints(x1, y1, rx, ry, rotationDeg, largeArc, sweep, x2, y2, stepsPerQuarter = 8) {
  // 같은 점이면 호가 없다. 반지름이 0이면 직선이다 (SVG 규격)
  if (x1 === x2 && y1 === y2) return []
  rx = Math.abs(rx)
  ry = Math.abs(ry)
  if (rx === 0 || ry === 0) return [[x2, y2]]

  const phi = (rotationDeg * Math.PI) / 180
  const cosPhi = Math.cos(phi)
  const sinPhi = Math.sin(phi)

  // 1단계: 타원 좌표계로 옮긴 중점 기준 좌표
  const dx = (x1 - x2) / 2
  const dy = (y1 - y2) / 2
  const x1p = cosPhi * dx + sinPhi * dy
  const y1p = -sinPhi * dx + cosPhi * dy

  // 반지름이 너무 작아 두 점을 못 잇는 경우 — 규격대로 키운다 (반원이 된다)
  const lambda = (x1p * x1p) / (rx * rx) + (y1p * y1p) / (ry * ry)
  if (lambda > 1) {
    const k = Math.sqrt(lambda)
    rx *= k
    ry *= k
  }

  // 2단계: 중심
  const rx2 = rx * rx
  const ry2 = ry * ry
  const denom = rx2 * y1p * y1p + ry2 * x1p * x1p
  const sign = Boolean(largeArc) === Boolean(sweep) ? -1 : 1
  const coef = denom === 0 ? 0 : sign * Math.sqrt(Math.max(0, (rx2 * ry2 - denom) / denom))
  const cxp = (coef * rx * y1p) / ry
  const cyp = (-coef * ry * x1p) / rx
  const cx = cosPhi * cxp - sinPhi * cyp + (x1 + x2) / 2
  const cy = sinPhi * cxp + cosPhi * cyp + (y1 + y2) / 2

  // 3단계: 시작 각도와 쓸고 가는 각도
  const angle = (ux, uy, vx, vy) => {
    const dot = ux * vx + uy * vy
    const len = Math.hypot(ux, uy) * Math.hypot(vx, vy)
    let a = Math.acos(Math.max(-1, Math.min(1, dot / len)))
    if (ux * vy - uy * vx < 0) a = -a
    return a
  }
  const theta1 = angle(1, 0, (x1p - cxp) / rx, (y1p - cyp) / ry)
  let delta = angle((x1p - cxp) / rx, (y1p - cyp) / ry, (-x1p - cxp) / rx, (-y1p - cyp) / ry)
  // sweep=0은 각도가 줄어드는 방향, 1은 늘어나는 방향
  if (!sweep && delta > 0) delta -= 2 * Math.PI
  if (sweep && delta < 0) delta += 2 * Math.PI

  const steps = Math.max(2, Math.ceil((Math.abs(delta) / (Math.PI / 2)) * stepsPerQuarter))
  const pts = []
  for (let i = 1; i <= steps; i += 1) {
    const t = theta1 + (delta * i) / steps
    const ex = rx * Math.cos(t)
    const ey = ry * Math.sin(t)
    pts.push([cosPhi * ex - sinPhi * ey + cx, sinPhi * ex + cosPhi * ey + cy])
  }
  // 마지막 점은 부동소수 오차 없이 끝점 그대로 — 닫힌 도형의 이음매가 어긋나지 않게
  pts[pts.length - 1] = [x2, y2]
  return pts
}

/** path가 차지하는 좌표 범위. 라이브 영역을 벗어났는지 확인하는 용도(제어점 포함 근사값). */
function pathBounds(d) {
  const segs = parsePath(d)
  let x = 0, y = 0, startX = 0, startY = 0
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity

  const hit = (px, py) => {
    if (px < minX) minX = px
    if (px > maxX) maxX = px
    if (py < minY) minY = py
    if (py > maxY) maxY = py
  }

  for (const { cmd, args } of segs) {
    const upper = cmd.toUpperCase()
    const isAbs = cmd === upper

    if (upper === 'Z') { x = startX; y = startY; continue }

    if (upper === 'H') {
      x = isAbs ? args[0] : x + args[0]
      hit(x, y)
      continue
    }
    if (upper === 'V') {
      y = isAbs ? args[0] : y + args[0]
      hit(x, y)
      continue
    }

    // 좌표쌍을 순서대로 훑는다. A는 끝점만 좌표다.
    if (upper === 'A') {
      const ex = isAbs ? args[5] : x + args[5]
      const ey = isAbs ? args[6] : y + args[6]
      // 끝점만 보면 반원 두 개로 그린 원의 가로 범위가 한 점이 되어 캔버스를 넘어도 못 잡는다
      for (const [px, py] of arcPoints(x, y, args[0], args[1], args[2], args[3], args[4], ex, ey)) hit(px, py)
      x = ex
      y = ey
      hit(x, y)
      continue
    }

    for (let i = 0; i < args.length; i += 2) {
      const px = isAbs ? args[i] : x + args[i]
      const py = isAbs ? args[i + 1] : y + args[i + 1]
      hit(px, py)
      // 마지막 쌍이 실제 커서 위치가 된다
      if (i + 2 >= args.length) { x = px; y = py }
    }

    if (upper === 'M') { startX = x; startY = y }
  }

  if (minX === Infinity) return null
  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY }
}

module.exports = { parsePath, parseNumbers, transformPath, pathBounds, arcPoints }
