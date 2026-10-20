// contracts/class-naming.json ↔ 파생물 정합 검증
// references/class-naming.md의 마커 사이 표는 build-references.js가 계약에서 만든다.
// 계약만 고치고 빌드를 빠뜨리거나, 표를 손으로 고치면 여기서 실패한다.

const fs = require('node:fs')
const path = require('node:path')
const { test } = require('node:test')
const assert = require('node:assert/strict')

const ROOT = path.resolve(__dirname, '..', '..')
const SPEC = JSON.parse(fs.readFileSync(path.join(ROOT, 'contracts', 'class-naming.json'), 'utf8'))
const DOC_PATH = path.join(ROOT, 'references', 'class-naming.md')
const { renderClassNamingMd } = require('../build-references.js')

test('class-naming.md의 생성 표가 계약과 같다 — npm run build:references', () => {
  const doc = fs.readFileSync(DOC_PATH, 'utf8')
  assert.equal(renderClassNamingMd(SPEC, doc), doc)
})

test('MCP 번들의 class-naming.md가 원본과 같다 — npm run build:mcp', () => {
  const bundled = path.join(ROOT, 'mcp', 'data', 'references', 'class-naming.md')
  assert.equal(fs.readFileSync(bundled, 'utf8'), fs.readFileSync(DOC_PATH, 'utf8'))
})

test('허용 어휘와 금지어가 겹치지 않는다', () => {
  const vocabulary = new Set(SPEC.vocabulary.flatMap(axis => axis.words))
  const overlap = SPEC.forbiddenWords.filter(w => vocabulary.has(w))
  assert.deepEqual(overlap, [])
})

test('파일↔블록 대응의 파일과 블록이 실제 CSS에 있다', () => {
  for (const fb of SPEC.fileBlocks) {
    const css = fs.readFileSync(path.join(ROOT, fb.file), 'utf8')
    for (const block of fb.blocks) {
      assert.match(css, new RegExp(`\\.${block}(?![a-z0-9-])`), `${fb.file}에 .${block}이 없다`)
    }
  }
})

test('폐기 예정 클래스는 이행 기간 동안 CSS 별칭이 남아 있다', () => {
  const styles = path.join(ROOT, 'src', 'styles')
  const all = []
  const walk = dir => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name)
      if (e.isDirectory()) walk(full)
      else if (e.name.endsWith('.css')) all.push(fs.readFileSync(full, 'utf8'))
    }
  }
  walk(styles)
  const css = all.join('\n')
  for (const d of SPEC.deprecated) {
    assert.ok(css.includes(`.${d.class}`), `${d.class} 별칭이 CSS에 없다 — 별칭을 지웠다면 deprecated에서도 뺀다`)
  }
})
