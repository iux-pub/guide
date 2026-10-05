#!/usr/bin/env node
// 아이콘 찾기·채택 CLI — 스튜디오 화면이 하는 일을 터미널에서도 한다.
//
// 사용법:
//   npm run icons:adopt -- --search 장바구니              한국어·영어로 카탈로그를 찾는다
//   npm run icons:adopt -- shopping_cart                  채택한다 (우리 이름은 shopping-cart)
//   npm run icons:adopt -- open_in_new --as external-link 이름을 직접 정한다
//   npm run icons:adopt -- receipt_long account_tree --build   여럿을 채택하고 빌드·검사까지
//
// 옵션:
//   --category <id>  우리 분류(navigation·action·status·form·content·identity·media·domain)
//   --build          채택 뒤 icons:build와 icons:check를 돌린다 (스프라이트·폰트·CSS가 갱신된다)
//   --search <말>    찾기만 한다. 아무것도 쓰지 않는다
//
// 채택하면 대장에 번호가 영구히 붙는다 — 되돌릴 수 있는 일이 아니다. 먼저 --search로 확인한다.

const path = require('node:path')
const { execFileSync } = require('node:child_process')
const { adopt, loadLibrary, adoptedMap, pathsOf } = require('./lib/icon-adopt')
const { search } = require('./lib/icon-search')

const ROOT = path.join(__dirname, '..')
const argv = process.argv.slice(2)

function flag(name) {
  const i = argv.indexOf(name)
  return i >= 0 ? argv[i + 1] : null
}
const has = (name) => argv.includes(name)

const library = loadLibrary(ROOT)
if (!library) {
  console.error('카탈로그가 없습니다. npm run icons:library 로 만든다.')
  process.exit(1)
}

const ledger = JSON.parse(require('node:fs').readFileSync(pathsOf(ROOT).ledger, 'utf8'))
const taken = adoptedMap(ledger)

// ── 찾기 ──────────────────────────────────────────────

if (has('--search')) {
  const q = flag('--search') || ''
  const rows = search(library, q, { limit: 20 })
  if (rows.length === 0) {
    console.log(`"${q}"에 해당하는 아이콘이 카탈로그에 없습니다.`)
    process.exit(0)
  }
  console.log(`"${q}" — ${rows.length}종${rows.length === 20 ? ' (상위 20)' : ''}\n`)
  for (const { icon, via } of rows) {
    const ours = taken.get(icon.m)
    const status = ours ? `세트에 있음 → ${ours}` : icon.n ? '채택 가능' : `이름을 정해야 함 (${icon.s ? `제안: ${icon.s}` : icon.x})`
    console.log(`  ${icon.m.padEnd(30)} ${(icon.ko || '').padEnd(12)} ${status}${via ? `   [${via}]` : ''}`)
  }
  console.log('\n채택: npm run icons:adopt -- <구글 이름> [--as <우리 이름>] [--build]')
  process.exit(0)
}

// ── 채택 ──────────────────────────────────────────────

const optionValues = new Set([flag('--as'), flag('--category')].filter(Boolean))
const materials = argv.filter((a) => !a.startsWith('--') && !optionValues.has(a))

if (materials.length === 0) {
  console.error('채택할 아이콘 이름을 주세요. 예) npm run icons:adopt -- shopping_cart')
  console.error('찾으려면: npm run icons:adopt -- --search 장바구니')
  process.exit(1)
}
if (materials.length > 1 && flag('--as')) {
  console.error('--as 는 아이콘 하나일 때만 쓸 수 있습니다.')
  process.exit(1)
}

;(async () => {
  let failed = 0
  for (const material of materials) {
    try {
      const r = await adopt({ material, name: flag('--as'), category: flag('--category'), root: ROOT })
      console.log(`+ ${r.name.padEnd(24)} ${r.codepoint}  ← ${material}  [${['regular', ...r.variants].join('·')}]  검색어: ${r.keywords.slice(0, 5).join(', ')}`)
      for (const w of r.warnings) console.log(`    ⚠ ${w}`)
    } catch (err) {
      failed += 1
      console.error(`✗ ${material}: ${err.message}`)
    }
  }

  if (failed < materials.length && has('--build')) {
    console.log('\n빌드와 검사…')
    execFileSync(process.execPath, [path.join(__dirname, 'build-icons.js')], { stdio: 'inherit', cwd: ROOT })
    execFileSync(process.execPath, [path.join(__dirname, 'check-icons.js')], { stdio: 'inherit', cwd: ROOT })
  } else if (failed < materials.length) {
    console.log('\n다음: npm run icons:build && npm run check   (또는 --build 를 붙여 한 번에)')
  }
  process.exitCode = failed > 0 ? 1 : 0
})()
