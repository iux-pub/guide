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
      x = isAbs ? args[5] : x + args[5]
      y = isAbs ? args[6] : y + args[6]
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

module.exports = { parsePath, parseNumbers, transformPath, pathBounds }
