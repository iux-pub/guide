/**
 * OKLCH ↔ sRGB 변환과 색역·휘도 유틸
 *
 * 브랜드 팔레트 생성기(generate-brand.js)의 계산 기반이다.
 * 알고리즘 근거는 각 프리셋 `$meta.preset.generation.rules`이며,
 * 이 파일은 그중 좌표 변환·색역 클리핑·휘도 역산만 담당한다.
 *
 * 변환식은 Björn Ottosson의 Oklab 정의를 따른다.
 * WCAG 상대휘도는 새로 만들지 않고 contrast.js의 것을 그대로 쓴다 —
 * 검사와 생성이 다른 휘도를 쓰면 생성물이 검사를 통과하는 근거가 사라진다.
 */

const { luminance } = require('./contrast')

/** sRGB 감마 해제 (0~255 → 선형 0~1) */
function toLinear(value) {
  const c = value / 255
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

/** 선형 0~1 → sRGB 감마 적용값 0~255 (양자화 전, 범위 밖 값 보존) */
function fromLinear(value) {
  const c = value <= 0.0031308 ? value * 12.92 : 1.055 * value ** (1 / 2.4) - 0.055
  return c * 255
}

/** '#rrggbb' / '#rgb' → {r,g,b} 0~255. 16진수가 아니면 null. */
function parseHexColor(hex) {
  const body = String(hex).trim().replace(/^#/, '')
  if (!/^[0-9a-fA-F]+$/.test(body)) return null

  if (body.length === 3) {
    const expand = c => parseInt(c + c, 16)
    return { r: expand(body[0]), g: expand(body[1]), b: expand(body[2]) }
  }
  if (body.length === 6) {
    return {
      r: parseInt(body.slice(0, 2), 16),
      g: parseInt(body.slice(2, 4), 16),
      b: parseInt(body.slice(4, 6), 16)
    }
  }
  return null
}

/** {r,g,b} 0~255 → '#rrggbb' (반올림·클램프) */
function toHex({ r, g, b }) {
  const channel = value => {
    const n = Math.max(0, Math.min(255, Math.round(value)))
    return n.toString(16).padStart(2, '0')
  }
  return `#${channel(r)}${channel(g)}${channel(b)}`
}

/** 선형 sRGB {r,g,b} 0~1 → Oklab {L,a,b} */
function linearToOklab({ r, g, b }) {
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b

  const l_ = Math.cbrt(l)
  const m_ = Math.cbrt(m)
  const s_ = Math.cbrt(s)

  return {
    L: 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_,
    a: 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_,
    b: 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_
  }
}

/** Oklab {L,a,b} → 선형 sRGB {r,g,b} 0~1 (색역 밖이면 범위를 벗어난 값 그대로) */
function oklabToLinear({ L, a, b }) {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b

  const l = l_ ** 3
  const m = m_ ** 3
  const s = s_ ** 3

  return {
    r: 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    g: -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    b: -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
  }
}

/** hex → OKLCH {l, c, h}. h는 도(0~360), 무채색이면 h=0. */
function hexToOklch(hex) {
  const rgb = parseHexColor(hex)
  if (!rgb) return null

  const lab = linearToOklab({
    r: toLinear(rgb.r),
    g: toLinear(rgb.g),
    b: toLinear(rgb.b)
  })

  const c = Math.sqrt(lab.a ** 2 + lab.b ** 2)
  let h = (Math.atan2(lab.b, lab.a) * 180) / Math.PI
  if (h < 0) h += 360

  return { l: lab.L, c, h: c < 1e-6 ? 0 : h }
}

/** OKLCH → 선형 sRGB (클리핑 없음 — 색역 판정용) */
function oklchToLinearRgb({ l, c, h }) {
  const rad = (h * Math.PI) / 180
  return oklabToLinear({ L: l, a: c * Math.cos(rad), b: c * Math.sin(rad) })
}

/**
 * sRGB 색역 안에 있는지 본다.
 * 반올림으로 흡수되는 미세 초과는 색역 밖으로 보지 않는다(1/255의 절반 = 약 0.002).
 */
function isInGamut(oklch) {
  const lin = oklchToLinearRgb(oklch)
  const EPSILON = 0.002
  return ['r', 'g', 'b'].every(k => {
    const v = fromLinear(lin[k]) / 255
    return v >= -EPSILON && v <= 1 + EPSILON
  })
}

/**
 * 색역 밖이면 hue·L을 유지한 채 chroma만 줄여 안으로 넣는다 (rules ③).
 * 이분탐색 40회면 chroma 해상도가 배정밀도 한계에 닿는다.
 */
function clipChroma(oklch) {
  if (isInGamut(oklch)) return { ...oklch }

  let lo = 0
  let hi = oklch.c
  for (let i = 0; i < 40; i += 1) {
    const mid = (lo + hi) / 2
    if (isInGamut({ ...oklch, c: mid })) lo = mid
    else hi = mid
  }
  return { ...oklch, c: lo }
}

/** OKLCH → '#rrggbb'. 색역 밖은 chroma를 줄여 넣는다. */
function oklchToHex(oklch) {
  const fitted = clipChroma(oklch)
  const lin = oklchToLinearRgb(fitted)
  return toHex({
    r: fromLinear(lin.r),
    g: fromLinear(lin.g),
    b: fromLinear(lin.b)
  })
}

/** hex의 WCAG 상대휘도 Y. 휘도 정의는 contrast.js가 원본이다. */
function hexLuminance(hex) {
  const rgb = parseHexColor(hex)
  return rgb ? luminance(rgb) : null
}

/**
 * 목표 상대휘도 Y에 가장 가까운 hex를 찾는다 (rules ②).
 *
 * 핵심은 **hex로 양자화한 뒤** Y를 재는 것이다. OKLCH 공간에서 맞춘 L은
 * 8bit로 반올림되는 순간 어긋나므로, 탐색 내내 실제 출력 hex의 Y를 본다.
 * chroma 클리핑도 L에 따라 달라지므로 같은 이유로 매번 적용한다.
 *
 * 이분탐색만으로는 부족하다 — 여러 L이 같은 hex로 반올림되는 구간이 있어
 * 수렴 지점이 경로에 따라 이웃 hex로 밀린다(±1/255). 그래서 대략 위치를
 * 잡은 뒤 주변을 조밀하게 훑어 **후보 hex 중 Y 최근접**을 고른다.
 *
 * 반환은 최종 hex다 — 호출부가 다시 변환하면 양자화가 한 번 더 일어난다.
 */
function hexForLuminance(targetY, { c, h }) {
  let lo = 0
  let hi = 1
  for (let i = 0; i < 24; i += 1) {
    const mid = (lo + hi) / 2
    if (hexLuminance(oklchToHex({ l: mid, c, h })) < targetY) lo = mid
    else hi = mid
  }

  // 수렴점 주변 스캔. SPAN은 8bit 한 칸이 넉넉히 들어가는 폭이다.
  const center = (lo + hi) / 2
  const SPAN = 0.01
  const STEPS = 400

  let best = null
  let bestGap = Infinity
  for (let i = 0; i <= STEPS; i += 1) {
    const l = center - SPAN + (2 * SPAN * i) / STEPS
    if (l < 0 || l > 1) continue

    const hex = oklchToHex({ l, c, h })
    const gap = Math.abs(hexLuminance(hex) - targetY)
    if (gap < bestGap) {
      bestGap = gap
      best = hex
    }
  }

  return best
}

/** 두 hue의 최단 각도 거리 (0~180) */
function hueDistance(a, b) {
  const diff = Math.abs(((a - b) % 360 + 360) % 360)
  return diff > 180 ? 360 - diff : diff
}

module.exports = {
  parseHexColor,
  toHex,
  hexToOklch,
  oklchToHex,
  oklchToLinearRgb,
  isInGamut,
  clipChroma,
  hexLuminance,
  hexForLuminance,
  hueDistance
}
