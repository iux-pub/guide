#!/usr/bin/env node
// 아이콘 검사 — contracts/icon-contract.json을 기준으로 자산과 대장을 본다.
//
// 검사 층위가 세 개다.
//   1) 규격     파일 자체가 계약을 지키는가 (뷰박스·stroke·색·이름)
//   2) 대장     번호가 밀리거나 겹치지 않는가 — 깨지면 납품 사이트가 통째로 바뀐다
//   3) 시각     세트 안에서 혼자 튀지 않는가 (먹임량·중복) — 경고만, 판단은 사람이
//
// 1·2는 실패(exit 1), 3은 경고다. 기계가 "이상하다"고 말할 수는 있어도
// "그러니 빼라"고 정할 수는 없다.
//
// 사용법:  node scripts/check-icons.js [--strict]
//          --strict 를 주면 시각 경고도 실패로 친다 (CI에서 조이고 싶을 때)

const fs = require('node:fs')
const path = require('node:path')
const crypto = require('node:crypto')
const { pathBounds } = require('./lib/svg-path')
const { measure, shapeCells, jaccard } = require('./lib/svg-geometry')

const ROOT = path.join(__dirname, '..')
const CONTRACT = path.join(ROOT, 'contracts/icon-contract.json')
const LEDGER = path.join(ROOT, 'contracts/icon-codepoints.json')
const BASELINE = path.join(ROOT, 'contracts/icon-metrics-baseline.json')
const SVG_DIR = path.join(ROOT, 'assets/icons/svg')

const STRICT = process.argv.includes('--strict')

const contract = JSON.parse(fs.readFileSync(CONTRACT, 'utf8'))
const ledger = JSON.parse(fs.readFileSync(LEDGER, 'utf8'))
const baseline = fs.existsSync(BASELINE) ? JSON.parse(fs.readFileSync(BASELINE, 'utf8')) : null
const BASELINE_SOURCE = baseline ? baseline.generatedFrom.source : 'google-material'

const CANVAS = contract.canvas.width
const PADDING = contract.canvas.padding
const NAME_RE = new RegExp(contract.naming.pattern)
const FORBIDDEN_WORDS = new Set(contract.naming.forbiddenWords)
const FORBIDDEN_ATTRS = contract.output.forbiddenAttributes
const DUP_THRESHOLD = contract.optical.duplicateSimilarity.threshold

const errors = []
const warns = []

const fail = (name, msg) => errors.push(`${name}: ${msg}`)
const warn = (name, msg) => warns.push(`${name}: ${msg}`)

// ── 1. 규격 ────────────────────────────────────────────

/** 이름이 계약을 지키는가. */
function checkName(name) {
  if (!NAME_RE.test(name)) fail(name, `이름 규칙 위반 — ${contract.naming.case}만 허용`)
  const segs = name.split('-')
  if (segs.length > contract.naming.maxSegments) {
    fail(name, `이름이 ${segs.length}마디 — ${contract.naming.maxSegments}마디까지만`)
  }
  const bad = segs.filter((s) => FORBIDDEN_WORDS.has(s))
  if (bad.length > 0) {
    fail(name, `시각적·불필요 단어 사용: ${bad.join(', ')} — 의미로 짓는다 (R-06·R-18의 아이콘판)`)
  }
}

/** SVG 본문이 계약을 지키는가. */
function checkSvg(name, svg, isSeed) {
  const vb = svg.match(/viewBox="([^"]+)"/)
  if (!vb) return fail(name, 'viewBox 없음')
  const want = `0 0 ${CANVAS} ${CANVAS}`
  if (vb[1].trim() !== want) fail(name, `viewBox가 "${vb[1]}" — "${want}"이어야 한다`)

  for (const attr of FORBIDDEN_ATTRS) {
    // fill은 루트에서 currentColor로만 허용하므로 따로 본다
    if (attr === 'style' || attr === 'class' || attr === 'id') {
      if (new RegExp(`\\s${attr}="`).test(svg)) fail(name, `${attr} 속성 금지`)
      continue
    }
    if (new RegExp(`\\s${attr}=`).test(svg)) {
      fail(name, `${attr} 금지 — 선은 면(path)으로 변환한다`)
    }
  }

  if (!/fill="currentColor"/.test(svg)) {
    fail(name, 'fill="currentColor" 없음 — 색은 CSS가 정한다 (R-01의 아이콘판)')
  }

  // 하드코딩 색상. currentColor·none 외의 값이 보이면 잡는다.
  const colors = [...svg.matchAll(/(?:fill|stroke)="([^"]+)"/g)]
    .map((m) => m[1])
    .filter((v) => v !== 'currentColor' && v !== 'none')
  if (colors.length > 0) fail(name, `하드코딩 색상: ${[...new Set(colors)].join(', ')}`)

  // path 외 도형 요소 금지 — circle/rect 등은 폰트 변환에서 사라진다
  const shapes = [...svg.matchAll(/<(circle|rect|ellipse|line|polygon|polyline)\b/g)].map((m) => m[1])
  if (shapes.length > 0) {
    fail(name, `path가 아닌 도형: ${[...new Set(shapes)].join(', ')} — path로 변환한다`)
  }

  const ds = [...svg.matchAll(/<path[^>]*\sd="([^"]+)"/g)].map((m) => m[1])
  if (ds.length === 0) return fail(name, 'path 없음')

  const b = pathBounds(ds.join(' '))
  if (b) {
    const slack = 0.5
    if (b.minX < -slack || b.minY < -slack || b.maxX > CANVAS + slack || b.maxY > CANVAS + slack) {
      fail(name, `캔버스 ${CANVAS} 벗어남 x[${b.minX.toFixed(2)}..${b.maxX.toFixed(2)}] y[${b.minY.toFixed(2)}..${b.maxY.toFixed(2)}]`)
    } else {
      const lo = PADDING - slack
      const hi = CANVAS - PADDING + slack
      // 씨앗은 구글이 형태별 keyline으로 이미 보정한 것이라 22를 넘는 것이 정상이다
      // (자물쇠는 세로로 길고 눈·경고삼각형은 가로로 넓다). 자체 제작만 본다.
      if (!isSeed && (b.minX < lo || b.minY < lo || b.maxX > hi || b.maxY > hi)) {
        warn(name, `라이브 영역 ${contract.canvas.liveArea} 초과 x[${b.minX.toFixed(2)}..${b.maxX.toFixed(2)}] y[${b.minY.toFixed(2)}..${b.maxY.toFixed(2)}] — 여백이 다른 아이콘과 다르게 보인다`)
      }
    }
  }

  // 소수점 자릿수
  const overPrecision = [...ds.join(' ').matchAll(/\d+\.(\d+)/g)]
    .filter((m) => m[1].length > contract.output.decimalPlaces)
  if (overPrecision.length > 0) {
    warn(name, `소수점 ${contract.output.decimalPlaces}자리 초과 ${overPrecision.length}곳`)
  }

  return ds
}

// ── 3. 시각 ────────────────────────────────────────────
//
// 기준선(icon-metrics-baseline.json)은 구글 씨앗의 실측 분포다. 씨앗 자신은
// 이미 사람 손으로 시각 보정을 마친 것이므로 검사 대상이 아니고,
// 자체 제작 아이콘만 그 분포와 견준다. 자세한 근거는 build-icon-baseline.js.

// ── 실행 ───────────────────────────────────────────────

function main() {
  console.log('\x1b[36m[check-icons]\x1b[0m 아이콘 검사 시작...\n')

  const names = Object.keys(ledger.icons)
  if (names.length === 0) {
    console.log('  대장이 비어 있다 — 검사할 것이 없다')
    return
  }

  const files = fs.existsSync(SVG_DIR)
    ? fs.readdirSync(SVG_DIR).filter((f) => f.endsWith('.svg')).map((f) => f.replace(/\.svg$/, ''))
    : []

  // 대장과 파일이 어긋나면 빌드 결과가 조용히 달라진다
  for (const n of names) {
    if (!files.includes(n)) fail(n, '대장에 있는데 파일이 없다')
  }
  for (const f of files) {
    if (!names.includes(f)) fail(f, '파일이 있는데 대장에 없다 — import 스크립트를 거치지 않았다')
  }

  // ── 2. 대장 ──
  const cpSeen = new Map()
  for (const [name, meta] of Object.entries(ledger.icons)) {
    for (const field of contract.metadata.required) {
      if (meta[field] === undefined && field !== 'name') {
        fail(name, `대장 필수 항목 누락: ${field}`)
      }
    }
    if (meta.codepoint) {
      if (cpSeen.has(meta.codepoint)) {
        fail(name, `코드포인트 ${meta.codepoint} 중복 — ${cpSeen.get(meta.codepoint)}와 겹친다`)
      }
      cpSeen.set(meta.codepoint, name)
      if (ledger.tombstones && ledger.tombstones[meta.codepoint]) {
        fail(name, `코드포인트 ${meta.codepoint}는 폐기된 번호다 — 재사용하면 납품 사이트가 바뀐다`)
      }
    }
    const src = contract.sources.allowed.find((s) => s.id === meta.source)
    if (!src) fail(name, `허용되지 않은 출처: ${meta.source}`)
  }

  // ── 1·3 ──
  const metrics = []
  const hashes = new Map()

  for (const name of names) {
    checkName(name)
    const p = path.join(SVG_DIR, `${name}.svg`)
    if (!fs.existsSync(p)) continue
    const svg = fs.readFileSync(p, 'utf8')

    const meta = ledger.icons[name]
    if (meta.sha256 && crypto.createHash('sha256').update(svg).digest('hex') !== meta.sha256) {
      fail(name, '파일이 대장의 sha256과 다르다 — 손으로 고쳤다면 대장도 갱신한다')
    }

    const ds = checkSvg(name, svg, meta.source === BASELINE_SOURCE)
    if (!ds) continue

    metrics.push({ name, sw: measure(ds).strokeWeight })
    hashes.set(name, shapeCells(ds))
  }

  // 획 굵기 — 기준선 분포 밖이면 세트에서 튄다는 신호다
  if (baseline) {
    const { min, p10, p90, max } = baseline.strokeWeight
    for (const { name, sw } of metrics) {
      if (ledger.icons[name].source === BASELINE_SOURCE) continue // 씨앗이 기준선 자신이다
      if (sw < min || sw > max) {
        warn(name, `획 굵기 ${sw.toFixed(2)} — 씨앗 범위(${min}~${max}) 밖이다. ${sw < min ? '가늘어' : '굵어'} 보인다`)
      } else if (sw < p10 || sw > p90) {
        warn(name, `획 굵기 ${sw.toFixed(2)} — 씨앗 대부분(${p10}~${p90})보다 ${sw < p10 ? '가늘다' : '굵다'}`)
      }
    }
  }

  // 중복 — 새로 만든 것이 이미 있는 것과 겹치는가.
  // 씨앗끼리의 닮음(info/error, lock/unlock)은 구글이 의도해 구분한 것이므로 보지 않는다.
  const hnames = [...hashes.keys()]
  for (let i = 0; i < hnames.length; i += 1) {
    for (let j = i + 1; j < hnames.length; j += 1) {
      const a = hnames[i]
      const b = hnames[j]
      const bothSeed =
        ledger.icons[a].source === BASELINE_SOURCE && ledger.icons[b].source === BASELINE_SOURCE
      if (bothSeed) continue
      const sim = jaccard(hashes.get(a), hashes.get(b))
      if (sim >= DUP_THRESHOLD) {
        warn(a, `${b}와 형태가 ${(sim * 100).toFixed(0)}% 닮았다 — 둘 다 필요한지 본다`)
      }
    }
  }

  // ── 보고 ──
  if (warns.length > 0) {
    console.log(`\x1b[33m  경고 ${warns.length}건\x1b[0m — 형태 판단은 사람이 한다`)
    for (const w of warns) console.log(`    ${w}`)
    console.log('')
  }

  if (errors.length > 0) {
    console.log(`\x1b[31m✗ 아이콘 규격 위반 ${errors.length}건\x1b[0m`)
    for (const e of errors) console.log(`    ${e}`)
    process.exit(1)
  }

  if (STRICT && warns.length > 0) {
    console.log('\x1b[31m✗ --strict: 경고를 실패로 처리한다\x1b[0m')
    process.exit(1)
  }

  console.log(`\x1b[32m✓ 아이콘 검사 통과 — ${names.length}종, 규격·대장 위반 없음\x1b[0m`)
}

main()
