// 브랜드 팔레트 생성 검증 — seed hex → brand.json
//
// 이 생성기의 존재 이유는 발주처 CI를 토큰으로 받는 것이다. 그래서 두 가지를
// 동시에 지켜야 한다: ①발주처가 준 색이 팔레트에 그대로 남을 것 ②그 팔레트가
// WCAG 검사를 통과할 것. 아래 테스트는 그 둘을 실제 검사 경로로 확인한다.

const fs = require('node:fs')
const path = require('node:path')
const { test } = require('node:test')
const assert = require('node:assert/strict')

const {
  Y_LADDER,
  CHROMA_CURVE,
  STAGES,
  SECONDARY_CHROMA_RANGE,
  POINT_MIN_HUE_DISTANCE,
  HC_MIN_HUE_DELTA,
  SNAP_STAGES,
  SNAP_MIN_RATIO,
  anchorStageFor,
  statusHues,
  allowedPointWindows,
  isHueAllowed,
  derivePalette,
  buildBrandTokens
} = require('../lib/brand-palette')
const { generateBrand, DEFAULT_FONT } = require('../generate-brand')
const { hexToOklch, hexLuminance, parseHexColor, hueDistance } = require('../lib/oklch')
const { contrastRatio, parseHex } = require('../lib/contrast')

const ROOT = path.resolve(__dirname, '..', '..')
const foundation = JSON.parse(fs.readFileSync(path.join(ROOT, 'tokens', 'foundation.json'), 'utf8'))
const terracotta = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'tokens', 'presets', 'market-terracotta.json'), 'utf8')
)

/** 실무에서 들어올 법한 CI 색. 사다리에 맞춰 고른 색이 아니다. */
const CI_SAMPLES = [
  '#5A928B', // 감성미식 Sea Teal
  '#F26522', // 주황 계열
  '#003876', // 진한 남색
  '#4FC3F7', // 밝은 하늘
  '#C8102E', // 진한 빨강
  '#256ef4' // KRDS 블루
]

function generate(seed, overrides = {}) {
  return generateBrand({
    seed,
    id: 'test',
    label: '',
    mood: '',
    profiles: ['general-site'],
    font: DEFAULT_FONT,
    overrides
  })
}

test('사다리 상수가 실물 프리셋과 일치한다', () => {
  const { generation } = terracotta.$meta.preset
  assert.deepEqual(Y_LADDER, generation.yLadder, 'yLadder가 프리셋과 어긋난다')
  assert.deepEqual(CHROMA_CURVE, generation.chromaCurve, 'chromaCurve가 프리셋과 어긋난다')
})

test('상태색 금지 밴드가 프리셋에 기록된 허용 창과 일치한다 (rules ⑥)', () => {
  // 프리셋 rules 문장의 "허용 창 100~122·172~225·275~7.6"이 근거다.
  const windows = allowedPointWindows(statusHues(foundation))
  const rounded = windows.map(([from, to]) => [Math.round(from), Math.round(to > 360 ? to - 360 : to)])

  assert.deepEqual(rounded, [[100, 122], [172, 225], [275, 8]], `실제: ${JSON.stringify(rounded)}`)
})

test('상태색 hue는 어떤 허용 창에도 들지 않는다', () => {
  const hues = statusHues(foundation)
  const windows = allowedPointWindows(hues)
  assert.ok(Object.keys(hues).length === 4, '상태색 4종을 찾지 못했다')

  for (const [name, hue] of Object.entries(hues)) {
    assert.ok(!isHueAllowed(hue, windows), `${name}(${hue.toFixed(1)}°)가 허용 창 안에 있다`)
  }
})

test('market-terracotta를 채널 1비트 이내로 재생성한다 (골든)', () => {
  const { seed, generation } = terracotta.$meta.preset
  const palette = derivePalette(seed, foundation, {
    secondaryHue: generation.hue.secondary,
    secondaryChroma: generation.chroma50.secondary,
    pointHue: generation.hue.point,
    pointChroma: generation.chroma50.point,
    highContrastSecondaryHue: generation.hue.highContrastSecondary
  })
  const built = buildBrandTokens(palette)

  assert.equal(palette.anchorStage, '50', 'seed가 50단계에 앉지 않았다')

  let worst = 0
  for (const mode of ['light', 'high-contrast']) {
    for (const family of ['primary', 'secondary', 'point']) {
      for (const [stage, entry] of Object.entries(terracotta.primitive.color[mode][family])) {
        const a = parseHexColor(entry.value)
        const b = parseHexColor(built[mode][family][stage].value)
        const delta = Math.max(Math.abs(a.r - b.r), Math.abs(a.g - b.g), Math.abs(a.b - b.b))
        assert.ok(
          delta <= 1,
          `${mode}/${family}/${stage}: ${entry.value} → ${built[mode][family][stage].value} (채널차 ${delta})`
        )
        worst = Math.max(worst, delta)
      }
    }
  }
  assert.ok(worst <= 1, `최대 채널차 ${worst}`)
})

test('seed는 가장 가까운 단계에 그대로 보존된다 (앵커링)', () => {
  for (const seed of CI_SAMPLES) {
    const { brand, palette } = generate(seed)
    const stage = palette.anchorStage

    assert.ok(STAGES.includes(stage), `${seed}: anchor 단계가 이상하다 — ${stage}`)
    assert.equal(
      brand.primitive.color.light.primary[stage].value.toLowerCase(),
      seed.toLowerCase(),
      `${seed}가 primary/${stage}에 남지 않았다`
    )
    // 고대비 모드의 primary도 같은 계열이므로 함께 보존된다.
    assert.equal(
      brand.primitive.color['high-contrast'].primary[stage].value.toLowerCase(),
      seed.toLowerCase(),
      `${seed}가 high-contrast primary/${stage}에 남지 않았다`
    )
  }
})

test('anchor 단계는 seed의 Y에 가장 가까운 칸이다', () => {
  for (const seed of CI_SAMPLES) {
    const stage = anchorStageFor(seed)
    const y = hexLuminance(seed)
    const gap = Math.abs(Y_LADDER[stage] - y)

    for (const other of STAGES) {
      assert.ok(
        Math.abs(Y_LADDER[other] - y) >= gap - 1e-12,
        `${seed}: ${stage}보다 ${other}가 가깝다`
      )
    }
  }
})

test('생성된 팔레트가 검사쌍 전량을 통과한다 (2모드)', () => {
  for (const seed of CI_SAMPLES) {
    const { audit } = generate(seed)
    assert.ok(audit.checked >= 40, `${seed}: 검사쌍이 너무 적다 (${audit.checked})`)
    assert.equal(
      audit.violations.length,
      0,
      `${seed}: ${audit.violations.map(v => `${v.mode}/${v.label} ${v.reason}`).join(', ')}`
    )
  }
})

test('유도된 팔레트가 rules ⑤⑥⑦을 지킨다', () => {
  const windows = allowedPointWindows(statusHues(foundation))

  for (const seed of CI_SAMPLES) {
    const { palette, problems } = generate(seed)
    assert.deepEqual(problems, [], `${seed}: ${problems.join(' / ')}`)

    const ratio = palette.secondary.chroma50 / palette.primary.chroma50
    const [lo, hi] = SECONDARY_CHROMA_RANGE
    assert.ok(ratio >= lo && ratio <= hi, `${seed}: secondary chroma 배수 ${ratio.toFixed(3)}`)

    assert.ok(
      hueDistance(palette.primary.hue, palette.point.hue) >= POINT_MIN_HUE_DISTANCE,
      `${seed}: point hue 거리 부족`
    )
    assert.ok(isHueAllowed(palette.point.hue, windows), `${seed}: point가 금지 밴드 안이다`)
    assert.ok(
      hueDistance(palette.primary.hue, palette.highContrastSecondary.hue) >= HC_MIN_HUE_DELTA,
      `${seed}: high-contrast secondary 분리 부족`
    )
  }
})

test('50·60 단계는 흰 배경 4.5:1을 지킨다 (rules ④)', () => {
  const white = { r: 255, g: 255, b: 255, a: 1 }

  for (const seed of CI_SAMPLES) {
    const { brand } = generate(seed)
    for (const family of ['primary', 'secondary', 'point']) {
      for (const stage of SNAP_STAGES) {
        const hex = brand.primitive.color.light[family][stage].value
        // anchor로 고정된 칸은 발주처 CI 원본이므로 스냅 대상이 아니다.
        // 그 색이 본문에 못 쓰이는지는 대비 검사가 따로 판정한다.
        if (hex.toLowerCase() === seed.toLowerCase()) continue

        const ratio = contrastRatio(parseHex(hex), white)
        assert.ok(
          ratio >= SNAP_MIN_RATIO,
          `${seed} ${family}/${stage} ${hex}: 흰 배경 ${ratio.toFixed(2)}:1`
        )
      }
    }
  }
})

test('hue는 스케일 전체에서 상수다 (rules ①)', () => {
  const { palette, brand } = generate('#5A928B')

  for (const [family, key] of [['primary', 'primary'], ['point', 'point']]) {
    for (const [stage, entry] of Object.entries(brand.primitive.color.light[family])) {
      // 매우 어둡거나 밝은 칸은 8bit 격자가 성겨 hue가 흔들린다. 중간 대역만 본다.
      if (Y_LADDER[stage] < 0.02 || Y_LADDER[stage] > 0.8) continue
      const drift = hueDistance(hexToOklch(entry.value).h, palette[key].hue)
      assert.ok(drift < 3, `${family}/${stage} ${entry.value}: hue가 ${drift.toFixed(1)}° 벗어났다`)
    }
  }
})

test('verifyPalette가 규칙 위반을 잡는다', () => {
  // point를 danger hue(32.6°) 위에 강제로 올린다 — 금지 밴드 정중앙이다.
  const { problems } = generate('#5A928B', { pointHue: statusHues(foundation).danger })
  assert.ok(
    problems.some(p => p.includes('금지 밴드')),
    `금지 밴드 위반을 잡지 못했다: ${JSON.stringify(problems)}`
  )
})

test('anchor를 끄면 seed 색이 팔레트에 남지 않는다', () => {
  const seed = '#5A928B'
  const { brand, palette } = generate(seed, { anchor: false })

  assert.equal(palette.anchorStage, null)
  const all = Object.values(brand.primitive.color.light.primary).map(e => e.value.toLowerCase())
  assert.ok(!all.includes(seed.toLowerCase()), 'anchor를 껐는데 seed가 남아 있다')
})
