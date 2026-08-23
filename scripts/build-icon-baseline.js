#!/usr/bin/env node
// 아이콘 기하 기준선 생성 — 구글 씨앗의 실측 분포를 기록한다.
//
// 왜 기준선이 필요한가 (2026-08-23 실측):
//   획 굵기를 세트 중앙값과 비교했더니 씨앗 72종 중 13종이 경고로 떴다.
//   구글 아이콘 안에서도 선으로 그린 것(chevron)과 면으로 그린 것(chart-bar,
//   building)이 섞여 있어 하나의 중앙값으로 재면 양끝이 늘 튄다.
//   구글 아이콘은 이미 사람 손으로 시각 보정을 마친 것이므로 그 편차는 정상이다.
//
//   그래서 tokens/contrast-baseline.json과 같은 방식을 쓴다 —
//   **검증된 것을 기준선으로 고정하고, 새로 만든 것만 그 분포와 견준다.**
//
// 기준선에 자체 제작 아이콘을 넣지 않는다. 넣으면 기준이 스스로 느슨해져
// "튀는 아이콘"을 더 이상 못 잡는다. 대비 기준선에 새 위반을 추가하지 않는
// 것과 같은 이유다.
//
// 사용법:  node scripts/build-icon-baseline.js
//          씨앗(source: google-material)만 읽어 contracts/icon-metrics-baseline.json을 쓴다

const fs = require('node:fs')
const path = require('node:path')
const { measure } = require('./lib/svg-geometry')

const ROOT = path.join(__dirname, '..')
const LEDGER = path.join(ROOT, 'contracts/icon-codepoints.json')
const SVG_DIR = path.join(ROOT, 'assets/icons/svg')
const OUT = path.join(ROOT, 'contracts/icon-metrics-baseline.json')

const BASELINE_SOURCE = 'google-material'

function quantile(sorted, q) {
  const pos = (sorted.length - 1) * q
  const lo = Math.floor(pos)
  const hi = Math.ceil(pos)
  if (lo === hi) return sorted[lo]
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo)
}

function readPaths(name) {
  const p = path.join(SVG_DIR, `${name}.svg`)
  if (!fs.existsSync(p)) return null
  const svg = fs.readFileSync(p, 'utf8')
  return [...svg.matchAll(/<path[^>]*\sd="([^"]+)"/g)].map((m) => m[1])
}

function main() {
  const ledger = JSON.parse(fs.readFileSync(LEDGER, 'utf8'))
  const seeds = Object.entries(ledger.icons).filter(([, m]) => m.source === BASELINE_SOURCE)

  if (seeds.length < 20) {
    console.error(`기준선을 만들기에 씨앗이 너무 적다 (${seeds.length}종) — 최소 20종 필요`)
    process.exit(1)
  }

  const rows = []
  for (const [name] of seeds) {
    const ds = readPaths(name)
    if (!ds || ds.length === 0) continue
    const m = measure(ds)
    rows.push({ name, ...m })
  }

  const sw = rows.map((r) => r.strokeWeight).sort((a, b) => a - b)
  const area = rows.map((r) => r.area).sort((a, b) => a - b)

  const baseline = {
    name: 'infoUX Icon Metrics Baseline',
    version: '1.0.0',
    policy:
      '구글 씨앗의 기하 실측 분포다. 자체 제작 아이콘이 이 범위 밖이면 세트에서 튄다는 신호이며, 경고이지 자동 실패가 아니다. **이 파일에 자체 제작 아이콘을 추가하지 않는다** — 추가하면 기준이 스스로 느슨해져 검사가 무의미해진다. tokens/contrast-baseline.json과 같은 원칙이다.',
    generatedFrom: { source: BASELINE_SOURCE, count: rows.length },
    strokeWeight: {
      note: '평균 획 굵기 근사 = 2 × 면적 / 둘레. 형태 복잡도와 무관하게 획의 두께를 잰다.',
      min: Number(sw[0].toFixed(3)),
      p10: Number(quantile(sw, 0.1).toFixed(3)),
      median: Number(quantile(sw, 0.5).toFixed(3)),
      p90: Number(quantile(sw, 0.9).toFixed(3)),
      max: Number(sw[sw.length - 1].toFixed(3))
    },
    area: {
      note: '채워진 순면적(구멍 제외). 24×24 캔버스 기준.',
      min: Number(area[0].toFixed(2)),
      p10: Number(quantile(area, 0.1).toFixed(2)),
      median: Number(quantile(area, 0.5).toFixed(2)),
      p90: Number(quantile(area, 0.9).toFixed(2)),
      max: Number(area[area.length - 1].toFixed(2))
    },
    generatedAt: new Date().toISOString().slice(0, 10)
  }

  fs.writeFileSync(OUT, JSON.stringify(baseline, null, 2) + '\n')

  console.log(`기준선 생성: ${path.relative(ROOT, OUT)}`)
  console.log(`  씨앗 ${rows.length}종`)
  console.log(`  획 굵기  min ${baseline.strokeWeight.min} · p10 ${baseline.strokeWeight.p10} · 중앙 ${baseline.strokeWeight.median} · p90 ${baseline.strokeWeight.p90} · max ${baseline.strokeWeight.max}`)
  console.log(`  면적     min ${baseline.area.min} · 중앙 ${baseline.area.median} · max ${baseline.area.max}`)
}

main()
