#!/usr/bin/env node
// 씨앗 아이콘 반입 — contracts/icon-seed-map.json에 적힌 것을 받아 24 좌표계로 정규화한다.
//
// 하는 일:
//   1. 원본 SVG를 내려받는다 (Material Symbols는 960 좌표계)
//   2. path 좌표를 24 좌표계로 구워 넣는다 (transform 속성을 남기지 않는다)
//   3. icon-contract 규격에 맞춰 다시 쓴다 (fill=currentColor, path만)
//   4. 라이브 영역(20×20)을 벗어나는지 검사한다
//   5. 코드포인트 대장을 갱신한다 — 기존 번호는 절대 건드리지 않는다
//
// 사용법:
//   node scripts/import-icons.js            # 대장에 없는 것만 받는다
//   node scripts/import-icons.js --force    # 전부 다시 받는다 (코드포인트는 유지)
//   node scripts/import-icons.js --dry-run  # 받아만 보고 쓰지 않는다

const fs = require('node:fs')
const path = require('node:path')
const crypto = require('node:crypto')
const { transformPath, pathBounds } = require('./lib/svg-path')

const ROOT = path.join(__dirname, '..')
const SEED_MAP = path.join(ROOT, 'contracts/icon-seed-map.json')
const CONTRACT = path.join(ROOT, 'contracts/icon-contract.json')
const LEDGER = path.join(ROOT, 'contracts/icon-codepoints.json')
const OUT_DIR = path.join(ROOT, 'assets/icons/svg')
const VARIANT_DIR = (id) => path.join(ROOT, 'assets/icons/svg', id)

const argv = process.argv.slice(2)
const FORCE = argv.includes('--force')
const DRY = argv.includes('--dry-run')
// --variants 를 주면 기본 외의 표정(fill·bold)까지 받는다
const WITH_VARIANTS = argv.includes('--variants')

const seed = JSON.parse(fs.readFileSync(SEED_MAP, 'utf8'))
const contract = JSON.parse(fs.readFileSync(CONTRACT, 'utf8'))

const CANVAS = contract.canvas.width
const PADDING = contract.canvas.padding
const DECIMALS = contract.output.decimalPlaces
const CP_START = parseInt(contract.codepoints.range.start.replace('U+', ''), 16)

/** 대장을 읽는다. 없으면 빈 대장으로 시작한다. */
function loadLedger() {
  if (!fs.existsSync(LEDGER)) {
    return {
      name: 'infoUX Icon Codepoints',
      version: '1.0.0',
      policy: '아이콘 이름 ↔ 코드포인트 대장이다. 한 번 부여한 번호는 영구히 고정한다. 아이콘을 폐기해도 번호를 회수하지 않고 tombstone으로 남긴다 — 재사용하면 이미 납품된 사이트의 아이콘이 다른 그림으로 바뀐다.',
      nextCodepoint: contract.codepoints.range.start,
      icons: {},
      tombstones: {}
    }
  }
  return JSON.parse(fs.readFileSync(LEDGER, 'utf8'))
}

/** 다음으로 쓸 수 있는 코드포인트. 대장과 tombstone 양쪽을 피한다. */
function allocateCodepoint(ledger) {
  const used = new Set()
  for (const v of Object.values(ledger.icons)) used.add(v.codepoint)
  for (const v of Object.keys(ledger.tombstones)) used.add(v)

  let cp = CP_START
  for (;;) {
    const hex = 'U+' + cp.toString(16).toUpperCase().padStart(4, '0')
    if (!used.has(hex)) return hex
    cp += 1
  }
}

function sha256(text) {
  return crypto.createHash('sha256').update(text).digest('hex')
}

async function fetchSvg(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.text()
}

/**
 * 원본 SVG를 규격에 맞는 24 좌표계 SVG로 바꾼다.
 * 실패 사유가 있으면 던진다 — 규격 밖 아이콘을 조용히 통과시키지 않는다.
 */
function normalize(raw, name) {
  const viewBox = raw.match(/viewBox="([^"]+)"/)
  if (!viewBox) throw new Error('viewBox 없음')

  const [vx, vy, vw, vh] = viewBox[1].trim().split(/\s+/).map(Number)
  if (vw !== vh) throw new Error(`정사각형이 아님 (${vw}×${vh})`)

  // 원본 좌표계를 24로 옮긴다. viewBox 원점이 (vx, vy)이므로 그만큼 되돌린다.
  const scale = CANVAS / vw
  const paths = [...raw.matchAll(/<path[^>]*\sd="([^"]+)"/g)].map((m) => m[1])
  if (paths.length === 0) throw new Error('path 없음')

  const moved = paths.map((d) => transformPath(d, { scale, dx: -vx, dy: -vy, decimals: DECIMALS }))

  // 좌표 검사. 두 단계로 나눈다.
  //   캔버스(0~24) 초과      → 실패. 변환이 잘못됐다는 뜻이다.
  //   라이브 영역(2~22) 초과 → 경고. 형태에 따라 정상일 수 있다 — Material도
  //     자물쇠처럼 세로로 긴 것, 눈·경고삼각형처럼 가로로 넓은 것은 keyline이
  //     달라 22를 넘는다. 자체 제작 아이콘에서 이 경고가 뜨면 눈으로 봐야 한다.
  const all = moved.join(' ')
  const b = pathBounds(all)
  const warnings = []
  if (b) {
    const slack = 0.5
    if (b.minX < -slack || b.minY < -slack || b.maxX > CANVAS + slack || b.maxY > CANVAS + slack) {
      throw new Error(
        `캔버스 ${CANVAS} 벗어남 x[${b.minX.toFixed(2)}..${b.maxX.toFixed(2)}] y[${b.minY.toFixed(2)}..${b.maxY.toFixed(2)}] — 좌표 변환 확인 필요`
      )
    }
    const lo = PADDING - slack
    const hi = CANVAS - PADDING + slack
    if (b.minX < lo || b.minY < lo || b.maxX > hi || b.maxY > hi) {
      warnings.push(
        `라이브 영역 ${contract.canvas.liveArea} 초과 x[${b.minX.toFixed(2)}..${b.maxX.toFixed(2)}] y[${b.minY.toFixed(2)}..${b.maxY.toFixed(2)}]`
      )
    }
  }

  const body = moved.map((d) => `<path d="${d}"/>`).join('')
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CANVAS} ${CANVAS}" ` +
    `width="${CANVAS}" height="${CANVAS}" fill="currentColor" data-icon="${name}">` +
    `${body}</svg>\n`

  return { svg, warnings, pathCount: moved.length }
}

/**
 * 변형(표정)을 받는다.
 *
 * 아이콘에 따라 그 변형이 없을 수 있다 — 돋보기는 채울 면이 없어 fill이 무의미하다.
 * 그때 구글은 **기본과 같은 파일**을 준다. 해시가 같으면 변형이 없는 것으로 보고
 * 저장하지 않는다. 없는 변형까지 만들면 폰트만 커지고 그림은 그대로다.
 */
async function importVariants(ledger, results) {
  const combos = (contract.variants?.combinations || []).filter((c) => !c.default)
  const axisPath = seed.source.variantAxisPath || {}
  const tpl = seed.source.variantUrlTemplate
  if (combos.length === 0 || !tpl) return

  const seeds = Object.entries(ledger.icons).filter(([, m]) => m.source === seed.source.id)
  console.log(`\n변형 ${combos.map((c) => c.id).join('·')} — 씨앗 ${seeds.length}종에서 찾는다`)

  for (const combo of combos) {
    const axis = axisPath[combo.id]
    if (!axis) continue
    const dir = VARIANT_DIR(combo.id)
    if (!DRY) fs.mkdirSync(dir, { recursive: true })

    let made = 0
    let same = 0
    for (const [name, meta] of seeds) {
      const outPath = path.join(dir, `${name}.svg`)
      if (!FORCE && fs.existsSync(outPath)) { made += 1; continue }

      const url = tpl
        .replace('{style}', seed.source.style)
        .replace('{material}', meta.sourceName)
        .replace('{axis}', axis)

      try {
        const raw = await fetchSvg(url)
        const { svg } = normalize(raw, name)
        // 기본과 같으면 이 아이콘에는 그 변형이 없다
        if (sha256(svg) === meta.sha256) { same += 1; continue }
        if (!DRY) fs.writeFileSync(outPath, svg)
        made += 1
      } catch (err) {
        results.failed.push({ name, material: meta.sourceName, reason: `${combo.id}: ${err.message}` })
      }
    }
    console.log(`  ${combo.id.padEnd(8)} ${made}종 · 변형 없음 ${same}종`)
    if (!DRY) {
      ledger.variants = ledger.variants || {}
      ledger.variants[combo.id] = { count: made, updatedAt: new Date().toISOString().slice(0, 10) }
    }
  }
}

async function main() {
  const ledger = loadLedger()
  const results = { added: [], updated: [], skipped: [], failed: [], warned: [] }

  if (!DRY) fs.mkdirSync(OUT_DIR, { recursive: true })

  const all = seed.categories.flatMap((c) => c.icons.map((i) => ({ ...i, category: c.id })))
  console.log(`씨앗 ${all.length}종 · 출처 ${seed.source.id} (${seed.source.license})\n`)

  for (const item of all) {
    const { name, material, category } = item
    const outPath = path.join(OUT_DIR, `${name}.svg`)
    const known = ledger.icons[name]

    if (known && !FORCE && fs.existsSync(outPath)) {
      results.skipped.push(name)
      continue
    }

    // 기본 굵기의 축 경로. 구글의 default(wght400)가 아니라 **우리가 정한 기본**을 받는다.
    const baseCombo = (contract.variants?.combinations || []).find((c) => c.default)
    const baseAxis = (seed.source.variantAxisPath || {})[baseCombo?.id || 'regular'] || 'default'
    const url = seed.source.urlTemplate
      .replace('{style}', seed.source.style)
      .replace('{material}', material)
      .replace('{axis}', baseAxis)

    try {
      const raw = await fetchSvg(url)
      const { svg, warnings, pathCount } = normalize(raw, name)

      if (warnings.length > 0) results.warned.push({ name, warnings })

      // 코드포인트는 기존 것을 그대로 쓴다. 새 아이콘만 새로 받는다.
      const codepoint = known ? known.codepoint : allocateCodepoint(ledger)

      ledger.icons[name] = {
        codepoint,
        category,
        source: seed.source.id,
        sourceName: material,
        license: seed.source.license,
        sha256: sha256(svg),
        paths: pathCount,
        addedAt: known ? known.addedAt : new Date().toISOString().slice(0, 10)
      }

      if (!DRY) fs.writeFileSync(outPath, svg)
      ;(known ? results.updated : results.added).push(name)
      process.stdout.write(`  ${known ? '↻' : '+'} ${name.padEnd(16)} ${codepoint}  ← ${material}\n`)
    } catch (err) {
      results.failed.push({ name, material, reason: err.message })
      process.stdout.write(`  ✗ ${name.padEnd(16)} ${material} — ${err.message}\n`)
    }
  }

  if (WITH_VARIANTS) await importVariants(ledger, results)

  // 대장의 다음 번호를 갱신해 둔다 (참고용 — 실제 할당은 allocateCodepoint가 한다)
  ledger.nextCodepoint = allocateCodepoint(ledger)
  ledger.updatedAt = new Date().toISOString().slice(0, 10)

  if (!DRY) {
    fs.writeFileSync(LEDGER, JSON.stringify(ledger, null, 2) + '\n')
  }

  console.log('\n── 결과 ──')
  console.log(`  추가 ${results.added.length} · 갱신 ${results.updated.length} · 건너뜀 ${results.skipped.length} · 실패 ${results.failed.length}`)
  console.log(`  대장 아이콘 ${Object.keys(ledger.icons).length}종, 다음 번호 ${ledger.nextCodepoint}`)

  if (results.warned.length > 0) {
    console.log(`\n  ⚠ 라이브 영역 초과 ${results.warned.length}건 — 형태상 정상일 수 있다. 자체 제작 아이콘이면 눈으로 확인할 것`)
    for (const w of results.warned) console.log(`    ${w.name}: ${w.warnings.join(', ')}`)
  }

  if (results.failed.length > 0) {
    console.log(`\n  ✗ 실패 ${results.failed.length}건 — 원본 이름을 icon-seed-map.json에서 고친다`)
    for (const f of results.failed) console.log(`    ${f.name} (${f.material}): ${f.reason}`)
    process.exitCode = 1
  }

  if (DRY) console.log('\n  (--dry-run: 파일을 쓰지 않았다)')
}

main().catch((err) => {
  console.error('실패:', err.message)
  process.exit(1)
})
