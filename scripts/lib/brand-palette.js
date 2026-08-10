/**
 * 브랜드 팔레트 생성 — seed hex 하나에서 brand.json 팔레트를 만든다
 *
 * 발주처는 브랜드색을 고르지 않는다. 이미 갖고 있다. 그 CI 색을 넣으면
 * primary/secondary/point × 11단계 × 2모드가 결정론적으로 나와야 한다.
 *
 * 규칙의 정본은 각 프리셋 `$meta.preset.generation.rules`다. 이 파일은 그 7개를
 * 구현하며, 좌표 변환·색역·휘도 역산은 lib/oklch.js에 맡긴다.
 *
 *   ① hue는 스케일 전체 상수. hue·chroma50은 seed hex의 OKLCH 실측값이 정본
 *   ② L은 hex 양자화 후의 Y가 사다리 값에 최근접하도록 이분탐색      → oklch.js
 *   ③ sRGB 밖은 hue·L 유지하고 chroma만 축소                        → oklch.js
 *   ④ 50·60 단계는 흰 배경 4.5:1을 하드 스냅으로 보장
 *   ⑤ secondary chroma는 primary chroma50의 0.4~0.7배, hue는 ±45° 이내
 *   ⑥ point는 primary와 hue 거리 60° 이상, 상태색 hue ±25° 금지 밴드 준수
 *   ⑦ high-contrast는 light와 동일 사다리. ΔH(primary, secondary)<40°면
 *      hc secondary를 ΔH≥40° 위치로 재생성
 *
 * 규칙 ⑤⑥은 범위만 정하고 값은 정하지 않는다. 범위 안에서 무엇을 고를지는
 * 아래 정책 상수가 담당하며, 호출부가 명시하면 정책보다 우선한다.
 */

const { hexToOklch, hexForLuminance, hexLuminance, hueDistance } = require('./oklch')
const { contrastRatio, parseHex } = require('./contrast')

/** 단계 사다리. market-terracotta 실물과 일치하며 테스트가 그것을 강제한다. */
const Y_LADDER = {
  5: 0.885,
  10: 0.777,
  20: 0.605,
  30: 0.426,
  40: 0.255,
  50: 0.178,
  60: 0.104,
  70: 0.049,
  80: 0.022,
  90: 0.009,
  95: 0.005
}

const CHROMA_CURVE = {
  5: 0.08,
  10: 0.17,
  20: 0.34,
  30: 0.54,
  40: 0.83,
  50: 1,
  60: 0.97,
  70: 0.73,
  80: 0.53,
  90: 0.35,
  95: 0.25
}

const STAGES = Object.keys(Y_LADDER)

/** rules ④ — 흰 배경 위에서 본문으로 쓰이는 단계 */
const WHITE = { r: 255, g: 255, b: 255 }
const SNAP_STAGES = ['50', '60']
const SNAP_MIN_RATIO = 4.5

/** rules ⑤ — secondary 허용 범위 */
const SECONDARY_CHROMA_RANGE = [0.4, 0.7]
const SECONDARY_HUE_LIMIT = 45

/** rules ⑥ — point 제약 */
const POINT_MIN_HUE_DISTANCE = 60
const STATUS_GUARD = 25

/** rules ⑦ — high-contrast secondary 분리 하한 */
const HC_MIN_HUE_DELTA = 40

/**
 * 범위 안에서 값을 고르는 정책. 규칙이 정하지 않은 자유도를 여기서 고정해
 * 같은 seed가 항상 같은 팔레트를 내도록 한다.
 */
const POLICY = {
  secondaryHueShift: 30,
  secondaryChromaRatio: 0.55,
  pointChromaRatio: 0.7,
  /** hc secondary를 밀어낼 때 하한에 붙이지 않고 두는 여유 */
  hcHueMargin: 2.5
}

/** 각도를 0~360으로 정규화한다. */
function normalizeHue(hue) {
  return ((hue % 360) + 360) % 360
}

/**
 * foundation의 상태색 hue를 읽는다 (rules ⑥의 금지 밴드 근거).
 * 하드코딩하지 않는다 — foundation이 바뀌면 금지 밴드도 따라 움직여야 한다.
 */
function statusHues(foundation) {
  const light = foundation?.primitive?.color?.light ?? {}
  const hues = {}
  for (const name of ['danger', 'warning', 'success', 'information']) {
    const hex = light[name]?.['50']?.value
    if (typeof hex === 'string' && hex.startsWith('#')) {
      hues[name] = hexToOklch(hex).h
    }
  }
  return hues
}

/**
 * 상태색 ±guard를 뺀 허용 창을 구한다 (rules ⑥).
 * 반환은 [from, to] 배열이며, to < from이면 0°를 넘어가는 창이다.
 */
function allowedPointWindows(hues, guard = STATUS_GUARD) {
  const values = Object.values(hues)
  if (values.length === 0) return [[0, 360]]

  // 금지 구간을 정규화해 정렬하고, 겹치는 것끼리 합친다.
  const banned = values
    .map(h => [normalizeHue(h - guard), normalizeHue(h + guard)])
    .flatMap(([from, to]) => (from <= to ? [[from, to]] : [[from, 360], [0, to]]))
    .sort((a, b) => a[0] - b[0])

  const merged = []
  for (const band of banned) {
    const last = merged[merged.length - 1]
    if (last && band[0] <= last[1]) last[1] = Math.max(last[1], band[1])
    else merged.push([...band])
  }

  // 금지 구간의 여집합
  const windows = []
  let cursor = 0
  for (const [from, to] of merged) {
    if (from > cursor) windows.push([cursor, from])
    cursor = Math.max(cursor, to)
  }
  if (cursor < 360) windows.push([cursor, 360])

  // 0°를 넘어 이어지는 창은 하나로 합친다.
  if (windows.length > 1 && windows[0][0] === 0 && windows[windows.length - 1][1] === 360) {
    const first = windows.shift()
    const last = windows.pop()
    windows.push([last[0], first[1] + 360])
  }
  return windows
}

/** 창의 중앙 각도 */
function windowCenter([from, to]) {
  return normalizeHue((from + to) / 2)
}

/**
 * point hue를 고른다 (rules ⑥).
 * primary의 보색에 가장 가까운 허용 창을 잡고 그 중앙을 쓴다 —
 * 보색은 가장 눈에 띄는 자리고, 중앙은 금지 밴드에서 가장 멀다.
 */
function derivePointHue(primaryHue, windows) {
  const complement = normalizeHue(primaryHue + 180)

  const usable = windows.filter(
    w => hueDistance(windowCenter(w), primaryHue) >= POINT_MIN_HUE_DISTANCE
  )
  const pool = usable.length > 0 ? usable : windows

  let best = null
  let bestGap = Infinity
  for (const w of pool) {
    const center = windowCenter(w)
    // 보색이 창 안에 있으면 거리 0으로 본다.
    const inside = complement >= w[0] && complement <= w[1]
    const gap = inside ? 0 : hueDistance(center, complement)
    if (gap < bestGap) {
      bestGap = gap
      best = center
    }
  }
  return best
}

/** hue가 어떤 허용 창 안에 있는지 본다. */
function isHueAllowed(hue, windows) {
  const h = normalizeHue(hue)
  return windows.some(([from, to]) => {
    if (to <= 360) return h >= from && h <= to
    return h >= from || h <= to - 360
  })
}

/**
 * high-contrast secondary hue를 정한다 (rules ⑦).
 * primary와 40° 이상 벌어져 있으면 그대로 두고, 아니면 밀어낸다.
 */
function deriveHighContrastSecondaryHue(primaryHue, secondaryHue, windows) {
  if (hueDistance(primaryHue, secondaryHue) >= HC_MIN_HUE_DELTA) return secondaryHue

  const offset = HC_MIN_HUE_DELTA + POLICY.hcHueMargin
  const candidates = [
    normalizeHue(secondaryHue - offset),
    normalizeHue(secondaryHue + offset),
    normalizeHue(primaryHue - offset),
    normalizeHue(primaryHue + offset)
  ].filter(h => hueDistance(primaryHue, h) >= HC_MIN_HUE_DELTA)

  // 상태색을 피할 수 있으면 피한다. 여기서 잡히지 않아도 대비 검사가 최종 관문이다.
  return candidates.find(h => windows && isHueAllowed(h, windows)) ?? candidates[0]
}

/**
 * 한 단계의 hex를 만든다. rules ②로 Y를 맞추고, 50·60은 rules ④로 스냅한다.
 *
 * 스냅은 목표 Y를 낮추는 방향으로만 한다 — 밝게 만들면 대비가 더 나빠진다.
 */
function stageHex(stage, targetY, { hue, chroma }) {
  const hex = hexForLuminance(targetY, { c: chroma, h: hue })
  if (!SNAP_STAGES.includes(String(stage))) return hex
  if (contrastRatio(parseHex(hex), WHITE) >= SNAP_MIN_RATIO) return hex

  // 흰 배경 4.5:1을 만족하는 Y 상한에서 다시 시작해 한 칸씩 어둡게 내려간다.
  let y = Math.min(targetY, 1.05 / SNAP_MIN_RATIO - 0.05)
  for (let i = 0; i < 24; i += 1) {
    const candidate = hexForLuminance(y, { c: chroma, h: hue })
    if (contrastRatio(parseHex(candidate), WHITE) >= SNAP_MIN_RATIO) return candidate
    y *= 0.98
  }
  return hex
}

/**
 * seed가 어느 단계에 가장 가까운지 찾는다.
 *
 * 기존 프리셋 3종의 seed는 Y가 50단계(0.178)에 0.4~1.6%로 맞는 색을 골라 쓴 것이다.
 * 실제 발주처 CI는 그렇지 않다 — 3.5~23.5%까지 벌어진다. 사다리만 고집하면
 * **발주처 CI 색 자체가 팔레트 어디에도 남지 않는다.** 그래서 seed를 가장 가까운
 * 단계에 그대로 앉히고, chroma50은 그 단계의 커브로 역산해 나머지를 잇는다.
 */
function anchorStageFor(seedHex) {
  const y = hexLuminance(seedHex)
  let best = '50'
  let bestGap = Infinity
  for (const stage of STAGES) {
    const gap = Math.abs(Y_LADDER[stage] - y)
    if (gap < bestGap) {
      bestGap = gap
      best = stage
    }
  }
  return best
}

/**
 * 11단계 팔레트를 만든다.
 * anchor가 있으면 그 단계는 계산하지 않고 seed hex를 그대로 쓴다.
 */
function buildScale({ hue, chroma50, anchorStage, anchorHex }) {
  const scale = {}
  for (const stage of STAGES) {
    scale[stage] = {
      value:
        anchorStage === stage && anchorHex
          ? anchorHex
          : stageHex(stage, Y_LADDER[stage], { hue, chroma: chroma50 * CHROMA_CURVE[stage] }),
      type: 'color'
    }
  }
  return scale
}

/**
 * seed hex에서 브랜드 팔레트 3계열을 유도한다.
 *
 * secondary/point의 hue·chroma는 규칙이 범위만 정하므로 POLICY로 고른다.
 * 호출부가 값을 주면 그것을 쓰되 규칙 위반은 그대로 보고한다 —
 * 기존 프리셋 재현처럼 정당한 이유로 정책을 벗어나는 경우가 있다.
 */
function derivePalette(seed, foundation, overrides = {}) {
  const measured = hexToOklch(seed)
  if (!measured) throw new Error(`seed를 hex로 읽지 못했다: ${seed}`)

  const windows = allowedPointWindows(statusHues(foundation))

  // seed를 어느 단계에 앉힐지 정하고, chroma50은 그 단계의 커브로 역산한다.
  // anchor를 끄면 seed는 hue·chroma만 제공하고 색 자체는 팔레트에 남지 않는다.
  const anchor = overrides.anchor === false ? null : overrides.anchorStage ?? anchorStageFor(seed)
  const primaryChroma50 = anchor ? measured.c / CHROMA_CURVE[anchor] : measured.c

  const secondaryHue = overrides.secondaryHue ?? normalizeHue(measured.h + POLICY.secondaryHueShift)
  const secondaryChroma = overrides.secondaryChroma ?? primaryChroma50 * POLICY.secondaryChromaRatio
  const pointHue = overrides.pointHue ?? derivePointHue(measured.h, windows)
  const pointChroma = overrides.pointChroma ?? primaryChroma50 * POLICY.pointChromaRatio
  const hcSecondaryHue =
    overrides.highContrastSecondaryHue ??
    deriveHighContrastSecondaryHue(measured.h, secondaryHue, windows)

  return {
    windows,
    anchorStage: anchor,
    anchorHex: anchor ? seed.toLowerCase() : null,
    primary: {
      hue: measured.h,
      chroma50: primaryChroma50,
      anchorStage: anchor,
      anchorHex: anchor ? seed.toLowerCase() : null
    },
    secondary: { hue: secondaryHue, chroma50: secondaryChroma },
    point: { hue: pointHue, chroma50: pointChroma },
    highContrastSecondary: { hue: hcSecondaryHue, chroma50: secondaryChroma }
  }
}

/**
 * 유도된 팔레트가 규칙 ⑤⑥⑦을 지키는지 본다.
 * 색 자체의 접근성은 check-contrast/check-presets가 최종 판정한다 —
 * 여기서는 좌표 수준의 규칙만 본다.
 */
function verifyPalette(palette) {
  const problems = []
  const { primary, secondary, point, highContrastSecondary, windows } = palette

  const ratio = secondary.chroma50 / primary.chroma50
  const [lo, hi] = SECONDARY_CHROMA_RANGE
  if (ratio < lo || ratio > hi) {
    problems.push(
      `rules ⑤ secondary chroma가 primary의 ${ratio.toFixed(3)}배 — 허용 ${lo}~${hi}`
    )
  }
  if (hueDistance(primary.hue, secondary.hue) > SECONDARY_HUE_LIMIT) {
    problems.push(
      `rules ⑤ secondary hue가 primary에서 ${hueDistance(primary.hue, secondary.hue).toFixed(1)}° — 허용 ±${SECONDARY_HUE_LIMIT}°`
    )
  }

  const pointGap = hueDistance(primary.hue, point.hue)
  if (pointGap < POINT_MIN_HUE_DISTANCE) {
    problems.push(`rules ⑥ point hue가 primary와 ${pointGap.toFixed(1)}° — 최소 ${POINT_MIN_HUE_DISTANCE}°`)
  }
  if (!isHueAllowed(point.hue, windows)) {
    problems.push(`rules ⑥ point hue ${point.hue.toFixed(1)}°가 상태색 금지 밴드 안이다`)
  }

  const hcGap = hueDistance(primary.hue, highContrastSecondary.hue)
  if (hcGap < HC_MIN_HUE_DELTA) {
    problems.push(`rules ⑦ high-contrast secondary가 primary와 ${hcGap.toFixed(1)}° — 최소 ${HC_MIN_HUE_DELTA}°`)
  }

  return problems
}

/** brand.json 형태로 조립한다. */
function buildBrandTokens(palette) {
  return {
    light: {
      primary: buildScale(palette.primary),
      secondary: buildScale(palette.secondary),
      point: buildScale(palette.point)
    },
    'high-contrast': {
      primary: buildScale(palette.primary),
      secondary: buildScale(palette.highContrastSecondary),
      point: buildScale(palette.point)
    }
  }
}

module.exports = {
  Y_LADDER,
  CHROMA_CURVE,
  STAGES,
  anchorStageFor,
  POLICY,
  SECONDARY_CHROMA_RANGE,
  SECONDARY_HUE_LIMIT,
  POINT_MIN_HUE_DISTANCE,
  STATUS_GUARD,
  HC_MIN_HUE_DELTA,
  SNAP_STAGES,
  SNAP_MIN_RATIO,
  normalizeHue,
  statusHues,
  allowedPointWindows,
  isHueAllowed,
  derivePointHue,
  deriveHighContrastSecondaryHue,
  buildScale,
  derivePalette,
  verifyPalette,
  buildBrandTokens,
  hexLuminance
}
