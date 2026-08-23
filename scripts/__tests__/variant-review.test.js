// 표정 판정 테스트.
//
// 이 판정이 헐거우면 「슬림인데 안 가는 것」이 통과해 대장에 들어가고, 그 아이콘만
// 화면에서 혼자 굵게 뜬다. 2026-08-23에 실제로 그럴 뻔했다 — 범위를 min~max로 잡았더니
// slim이 0.36~1.05가 되어 면적 0.95배(거의 그대로)가 「잘 나왔습니다」로 통과했고,
// bold는 0.94까지 열려 기본보다 얇은 볼드도 지나갈 판이었다.

const fs = require('node:fs')
const path = require('node:path')
const { test } = require('node:test')
const assert = require('node:assert/strict')

const ROOT = path.resolve(__dirname, '..', '..')
const BASELINE = path.join(ROOT, 'contracts/icon-metrics-baseline.json')

const baseline = fs.existsSync(BASELINE)
  ? JSON.parse(fs.readFileSync(BASELINE, 'utf8'))
  : null

/** worker.mjs가 쓰는 것과 같은 규칙. 서버를 띄우지 않고 규칙만 시험한다. */
function band(variant) {
  const t = baseline.variants[variant].areaRatio
  return { lo: t.p10 * 0.85, hi: t.p90 * 1.15, wantThinner: t.p90 < 1 }
}

function judge(variant, ratio) {
  const { lo, hi, wantThinner } = band(variant)
  if (wantThinner ? ratio >= 1 : ratio <= 1) return 'direction'
  if (ratio < lo || ratio > hi) return 'range'
  return 'ok'
}

test('기준선에 표정별 분포가 있다', () => {
  assert.ok(baseline, 'icon-metrics-baseline.json이 없다')
  for (const v of ['slim', 'bold', 'fill']) {
    const t = baseline.variants?.[v]
    assert.ok(t, `${v} 분포가 없다 — npm run icons:baseline`)
    assert.ok(t.areaRatio && t.strokeWeight && t.boundsDrift, `${v}: 지표가 빠졌다`)
  }
})

test('방향이 반대면 분포와 무관하게 막는다', () => {
  // 슬림이 기본보다 굵으면 그건 슬림이 아니다. 분포를 볼 것도 없다.
  assert.equal(judge('slim', 1.20), 'direction')
  assert.equal(judge('slim', 1.00), 'direction')
  assert.equal(judge('bold', 0.94), 'direction', '기본보다 얇은 볼드가 통과하면 안 된다')
  assert.equal(judge('fill', 0.80), 'direction')
})

test('거의 그대로인 것을 통과시키지 않는다', () => {
  // 실제로 나온 값이다 — star의 slim이 0.95로 왔다
  assert.notEqual(judge('slim', 0.95), 'ok', '5%만 가늘어진 것은 슬림이 아니다')
  assert.notEqual(judge('bold', 1.05), 'ok', '5%만 굵어진 것은 볼드가 아니다')
})

test('씨앗과 우리가 만든 것 모두 통과한다', () => {
  // 실측값 — 이게 막히면 기준이 지나치게 조인 것이다
  assert.equal(judge('slim', 0.64), 'ok', '구글의 star slim')
  assert.equal(judge('slim', 0.71), 'ok', '우리가 만든 bookmark slim')
  assert.equal(judge('bold', 1.38), 'ok', '씨앗 bold 중앙값')
  assert.equal(judge('fill', 1.93), 'ok', '씨앗 fill 중앙값')
})

test('씨앗 전체가 자기 표정 판정을 통과한다', () => {
  // 기준선을 만든 바로 그 자료다. 여기서 막히면 규칙이 자기 근거와 어긋난 것이다.
  const { measure } = require('../lib/svg-geometry')
  const ledger = JSON.parse(fs.readFileSync(path.join(ROOT, 'contracts/icon-codepoints.json'), 'utf8'))
  const SVG = path.join(ROOT, 'assets/icons/svg')
  const paths = (p) => [...fs.readFileSync(p, 'utf8').matchAll(/<path[^>]*\sd="([^"]+)"/g)].map((m) => m[1])

  for (const [name, meta] of Object.entries(ledger.icons)) {
    for (const v of meta.variants || []) {
      const bp = path.join(SVG, `${name}.svg`)
      const vp = path.join(SVG, v, `${name}.svg`)
      if (!fs.existsSync(vp)) continue
      const ratio = measure(paths(vp)).area / measure(paths(bp)).area
      // 씨앗 안에도 튀는 것이 있다(사람이 시각 보정한 결과다). 방향만은 반드시 맞아야 한다.
      assert.notEqual(judge(v, ratio), 'direction', `${v}/${name}: 방향이 틀렸다 (${ratio.toFixed(2)}배)`)
    }
  }
})
