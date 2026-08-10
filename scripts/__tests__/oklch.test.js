// OKLCH 변환·색역·휘도 역산 검증 — 브랜드 팔레트 생성기의 계산 기반
//
// 검증의 정본은 tokens/presets/*.json이다. 프리셋에 이미 들어 있는 실물 색을
// 되돌려 계산해 라이브러리가 같은 좌표에 도달하는지 본다.
//
// 주의: 프리셋 3종이 모두 생성물인 것은 아니다. 아래 GENERATED만 rules를 따르며,
// 나머지는 기존 색 승계본이고 generation 메타는 사후 기록이다(2026-08-10 확인).
// 근거는 preset-generation-fidelity 테스트가 수치로 남긴다.

const fs = require('node:fs')
const path = require('node:path')
const { test } = require('node:test')
const assert = require('node:assert/strict')

const {
  hexToOklch,
  oklchToHex,
  isInGamut,
  clipChroma,
  hexLuminance,
  hexForLuminance,
  hueDistance
} = require('../lib/oklch')

const ROOT = path.resolve(__dirname, '..', '..')
const PRESET_DIR = path.join(ROOT, 'tokens', 'presets')

const PRESETS = fs
  .readdirSync(PRESET_DIR)
  .filter(f => f.endsWith('.json'))
  .map(f => ({
    id: path.basename(f, '.json'),
    data: JSON.parse(fs.readFileSync(path.join(PRESET_DIR, f), 'utf8'))
  }))

/** generation.rules를 실제로 따르는 프리셋. 나머지는 승계본이다. */
const GENERATED = ['market-terracotta']

/** 프리셋의 모든 색을 {mode, family, step, hex}로 편다. */
function* eachColor(data) {
  for (const [mode, families] of Object.entries(data.primitive?.color ?? {})) {
    for (const [family, steps] of Object.entries(families)) {
      for (const [step, entry] of Object.entries(steps)) {
        if (typeof entry?.value === 'string' && entry.value.startsWith('#')) {
          yield { mode, family, step, hex: entry.value }
        }
      }
    }
  }
}

test('hex → OKLCH → hex 왕복이 무손실이다', () => {
  let count = 0
  for (const { id, data } of PRESETS) {
    for (const { mode, family, step, hex } of eachColor(data)) {
      const back = oklchToHex(hexToOklch(hex))
      assert.equal(back.toLowerCase(), hex.toLowerCase(), `${id} ${mode}/${family}/${step}`)
      count += 1
    }
  }
  assert.ok(count > 100, `검사 대상이 너무 적다 (${count}건)`)
})

test('seed hex의 OKLCH 실측값이 generation 메타와 일치한다 (rules ①)', () => {
  for (const { id, data } of PRESETS) {
    const preset = data.$meta?.preset
    if (!preset?.seed || !preset.generation) continue

    const measured = hexToOklch(preset.seed)
    const { hue, chroma50 } = preset.generation

    // 메타는 hue 소수 1자리, chroma 소수 3자리로 반올림해 기록한다.
    assert.ok(
      Math.abs(measured.h - hue.primary) < 0.05,
      `${id}: hue 기록 ${hue.primary} vs 실측 ${measured.h.toFixed(3)}`
    )
    assert.ok(
      Math.abs(measured.c - chroma50.primary) < 0.0005,
      `${id}: chroma50 기록 ${chroma50.primary} vs 실측 ${measured.c.toFixed(5)}`
    )
  }
})

test('색역 클리핑은 hue·L을 지키고 chroma만 줄인다 (rules ③)', () => {
  // sRGB 밖으로 확실히 나가는 과채도 색들
  const cases = [
    { l: 0.5, c: 0.4, h: 205 },
    { l: 0.8, c: 0.3, h: 20 },
    { l: 0.3, c: 0.35, h: 140 }
  ]

  for (const oklch of cases) {
    const fitted = clipChroma(oklch)
    assert.equal(fitted.l, oklch.l, 'L이 바뀌었다')
    assert.equal(fitted.h, oklch.h, 'hue가 바뀌었다')
    assert.ok(fitted.c < oklch.c, 'chroma가 줄지 않았다')
    assert.ok(isInGamut(fitted), '클리핑 후에도 색역 밖이다')
  }
})

test('색역 안의 색은 클리핑이 건드리지 않는다', () => {
  for (const { data } of PRESETS) {
    for (const { hex } of eachColor(data)) {
      const oklch = hexToOklch(hex)
      assert.ok(isInGamut(oklch), `${hex}가 색역 밖으로 판정됐다`)
      assert.equal(clipChroma(oklch).c, oklch.c, `${hex}의 chroma가 변형됐다`)
    }
  }
})

test('hexForLuminance가 목표 상대휘도에 8bit 해상도로 수렴한다 (rules ②)', () => {
  const { generation } = PRESETS.find(p => p.id === GENERATED[0]).data.$meta.preset
  const seed = hexToOklch(PRESETS.find(p => p.id === GENERATED[0]).data.$meta.preset.seed)

  for (const [step, targetY] of Object.entries(generation.yLadder)) {
    const c = seed.c * generation.chromaCurve[step]
    const hex = hexForLuminance(targetY, { c, h: seed.h })
    const gap = Math.abs(hexLuminance(hex) - targetY)

    // 8bit 양자화 한 칸이 만드는 Y 간격보다 작아야 한다. 어두운 쪽일수록 촘촘하므로
    // 목표 Y에 비례한 여유를 준다.
    const tolerance = Math.max(0.0015, targetY * 0.02)
    assert.ok(gap < tolerance, `step ${step}: 목표 ${targetY} → ${hex} (Y 오차 ${gap.toFixed(5)})`)
  }
})

test('생성 규칙이 실제 프리셋 색을 재현한다 (골든)', () => {
  for (const id of GENERATED) {
    const { data } = PRESETS.find(p => p.id === id)
    const { seed, generation } = data.$meta.preset
    const measured = hexToOklch(seed)

    for (const [step, entry] of Object.entries(data.primitive.color.light.primary)) {
      const c = measured.c * generation.chromaCurve[step]
      const generated = hexForLuminance(generation.yLadder[step], { c, h: measured.h })
      if (generated.toLowerCase() === entry.value.toLowerCase()) continue

      // 8bit 격자에서 갈린 경우. rules ①이 "hue는 스케일 전체 상수"이므로
      // hue를 벗어난 저장값은 우리가 재현할 대상이 아니다 — 규칙 쪽이 정본이다.
      // hue를 지킨 저장값이 Y에 더 가깝다면 그건 우리 탐색의 실패다.
      const storedHue = hexToOklch(entry.value).h
      const drift = hueDistance(storedHue, measured.h)
      if (drift > 0.15) continue

      const target = generation.yLadder[step]
      const ours = Math.abs(hexLuminance(generated) - target)
      const stored = Math.abs(hexLuminance(entry.value) - target)
      assert.ok(
        ours <= stored,
        `${id} primary/${step}: 저장 ${entry.value}(Y오차 ${stored.toFixed(5)})보다 생성 ${generated}(${ours.toFixed(5)})가 더 멀다`
      )
    }
  }
})

test('승계 프리셋은 generation 메타로 재현되지 않는다 (사후 기록임을 고정)', () => {
  // 이 사실을 테스트로 박아 둔다. 나중에 누군가 "3종 다 생성물"이라고 가정하고
  // 골든 테스트를 넓히면 여기서 먼저 걸린다.
  const legacy = PRESETS.filter(p => !GENERATED.includes(p.id) && p.data.$meta?.preset?.generation)
  assert.ok(legacy.length > 0, '승계 프리셋이 없다 — GENERATED 목록을 재검토한다')

  for (const { id, data } of legacy) {
    const { seed, generation } = data.$meta.preset
    const measured = hexToOklch(seed)

    let mismatch = 0
    for (const [step, entry] of Object.entries(data.primitive.color.light.primary)) {
      const c = measured.c * generation.chromaCurve[step]
      const generated = hexForLuminance(generation.yLadder[step], { c, h: measured.h })
      if (generated.toLowerCase() !== entry.value.toLowerCase()) mismatch += 1
    }
    assert.ok(mismatch > 0, `${id}가 이제 완전 재현된다 — GENERATED에 추가하고 이 테스트를 갱신한다`)
  }
})

test('hueDistance가 최단 각도를 준다', () => {
  assert.equal(hueDistance(10, 350), 20)
  assert.equal(hueDistance(350, 10), 20)
  assert.equal(hueDistance(0, 180), 180)
  assert.equal(hueDistance(200, 200), 0)
  assert.equal(hueDistance(90, 270), 180)
})
