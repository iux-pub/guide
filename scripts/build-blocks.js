#!/usr/bin/env node
/**
 * 블록 미리보기·블록 예외 계약 생성기
 *
 * 단일 원본: src/blocks/<id>/(block.json·markup.html), src/blocks/sets.json(견본 조합),
 *            src/snippets/boilerplate.md·header.md·footer.md(공통 틀)
 * 생성 대상: src/playground/block-<id>.html      (블록 하나 — 앞뒤에 꼭 필요한 이웃을 붙인다)
 *            src/playground/blocks-<조합 id>.html (견본 조합을 한 페이지로 조립한 견본)
 *            contracts/block-exceptions.json     (block.json의 exceptions를 모은 검사기용 계약)
 *
 * 미리보기는 MCP compose_page와 같은 코드(scripts/lib/block-catalog.js composePage)로 조립하고,
 * 자리는 block.json의 예시 값으로 채운다. 손으로 고치지 않는다 — 블록을 고쳤으면 다시 만든다.
 * 단위 테스트(scripts/__tests__/blocks.test.js·block-exceptions.test.js)가 생성물이 정본과 같은지 본다.
 *
 * 사용법: npm run build:blocks
 */

const fs = require('node:fs')
const path = require('node:path')
const { loadBlocks, validateBlock, composePage, loadSets, validateSets } = require('./lib/block-catalog.js')
const { CONTRACT_FILE, buildContract, exceptionProblems } = require('./lib/block-exceptions.js')

const ROOT = path.resolve(__dirname, '..')
const OUT_DIR = path.join(ROOT, 'src', 'playground')

/** 블록 하나를 볼 때 함께 놓을 이웃 — 걸치거나 위아래 면에 이어 붙는 블록은 짝 없이 볼 수 없다 */
function previewSet(block, all) {
  const set = []
  const need = block.neighbors.requiresBeforeSlot
  if (need) {
    const before = all.find(b => b.slot === need && (block.neighbors.before.length === 0 || block.neighbors.before.includes(b.id)))
    if (before) set.push(before)
  } else if (block.surface.joinsAbove) {
    const before = all.find(b => b.id === block.neighbors.before[0])
    if (before) set.push(before)
  }
  set.push(block)
  for (const id of block.neighbors.expectsAfter || []) {
    const after = all.find(b => b.id === id)
    if (after) { set.push(after); break }
  }
  return set
}

// 헤더·푸터 스니펫의 형식 예시(기관명, ○○로, 000-0000)를 미리보기에서만 가상의 기관 값으로 바꾼다 —
// 블록 예시와 같은 기관(항구도시 문화재단)이다. 스니펫 정본은 고치지 않는다
const PREVIEW_SHELL_VALUES = [
  [/<img src="\/logo\.svg" alt="">[^\n]*\n\s*/, ''],
  ['<span>기관명</span>', '<span>항구도시 문화재단</span>'],
  [/<a class="site-footer__brand" href="\/">\s*<img class="site-footer__logo" src="\/images\/logo\.svg" alt="기관명">\s*<\/a>/, '<a class="site-footer__brand" href="/">항구도시 문화재단</a>'],
  [/\(우\)00000 제주특별자치도 제주시 ○○로 00<br>\s*대표전화 064-000-0000 · 평일 09:00~18:00/, '항구광역시 중구 등대로 12 항구도시 문화재단<br>\n          평일 09:00~18:00'],
  [/<li>\s*<details class="site-footer__family">[\s\S]*?<\/details>\s*<\/li>\s*/, ''],
  ['© 2026 기관명. All rights reserved.', '© 2026 항구도시 문화재단']
]

function previewShell(rootDir, full) {
  const read = name => fs.readFileSync(path.join(rootDir, 'src', 'snippets', name), 'utf8')
  const shell = { boilerplate: read('boilerplate.md') }
  if (!full) return shell
  const fill = text => PREVIEW_SHELL_VALUES.reduce((s, [from, to]) => s.replace(from, to), text)
  return { ...shell, header: fill(read('header.md')), footer: fill(read('footer.md')) }
}

/** 형식 문제를 모두 모은다 — 블록, 예외, 견본 조합 */
function catalogProblems(blocks, sets) {
  return [
    ...blocks.flatMap(block => validateBlock(block, block.markup).map(p => `src/blocks/${block.id}: ${p}`)),
    ...exceptionProblems(blocks),
    ...validateSets(sets, blocks).map(p => `src/blocks/sets.json: ${p}`)
  ]
}

/** 생성할 미리보기 파일 목록 — { file(playground 기준 이름), html } */
function buildPreviews(rootDir = ROOT) {
  const blocks = loadBlocks(rootDir)
  const sets = loadSets(rootDir)
  const problems = catalogProblems(blocks, sets)
  if (problems.length) throw new Error(`블록 형식 오류 ${problems.length}건\n${problems.map(p => `  - ${p}`).join('\n')}`)

  const options = { mode: 'example', assetBase: '../../', scriptBase: '../js/' }
  // 공통 틀을 바꾸는 블록(장면 위 투명 머리글, 반전 푸터)이 있으면 헤더·푸터 스니펫까지 끼워 본다.
  // 그 밖의 미리보기는 블록만 본다 — boilerplate의 빈 틀 그대로 둔다
  const page = (set, title) => composePage(set, previewShell(rootDir, set.some(b => b.shell)), { ...options, title }).html

  const files = blocks.map(block => ({
    file: `block-${block.id}.html`,
    html: page(previewSet(block, blocks), `${block.name} (${block.id}) - 블록 미리보기`)
  }))
  for (const set of sets) {
    files.push({
      file: `blocks-${set.id}.html`,
      html: page(set.blocks.map(id => blocks.find(b => b.id === id)), `${set.name} (${set.id}) - 블록 견본 조합`)
    })
  }
  return files
}

/** contracts/block-exceptions.json 내용(문자열) */
function buildExceptionContract(rootDir = ROOT) {
  return `${JSON.stringify(buildContract(loadBlocks(rootDir)), null, 2)}\n`
}

module.exports = { buildPreviews, buildExceptionContract, previewSet, catalogProblems }

if (require.main === module) {
  try {
    const files = buildPreviews()
    // 낡은 생성물(지운 블록·조합의 미리보기)을 치운다
    const keep = new Set(files.map(f => f.file))
    for (const name of fs.readdirSync(OUT_DIR)) {
      if (/^(?:block-[a-z0-9-]+|blocks(?:-[a-z0-9-]+)?)\.html$/.test(name) && !keep.has(name)) fs.rmSync(path.join(OUT_DIR, name))
    }
    for (const { file, html } of files) fs.writeFileSync(path.join(OUT_DIR, file), html)
    fs.writeFileSync(path.join(ROOT, CONTRACT_FILE), buildExceptionContract())
    const contract = JSON.parse(buildExceptionContract())
    console.log(`✓ src/playground — 블록 미리보기 ${files.length}건`)
    console.log(`✓ ${CONTRACT_FILE} — 스타일 예외 ${contract.css.length}건, 마크업 예외 ${contract.markup.length}건`)
  } catch (error) {
    console.error(`✗ 블록 생성 실패: ${error.message}`)
    process.exit(1)
  }
}
