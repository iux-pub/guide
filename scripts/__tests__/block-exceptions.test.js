// 블록 예외 — 카탈로그 블록의 스타일·마크업에 한해 등록된 위반만 통과시킨다.
// 판정 코드: scripts/lib/block-exceptions.js. 정본: src/blocks/<id>/block.json의 exceptions → contracts/block-exceptions.json

const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { spawnSync } = require('node:child_process')
const { test } = require('node:test')
const assert = require('node:assert/strict')

const ROOT = path.resolve(__dirname, '..', '..')
const X = require('../lib/block-exceptions.js')
const { loadBlocks, loadSets, validateSets, checkSequence } = require('../lib/block-catalog.js')
const { buildExceptionContract } = require('../build-blocks.js')

const BLOCKS = loadBlocks(ROOT)
const REGISTRY = X.loadRegistry(ROOT)
const read = rel => fs.readFileSync(path.join(ROOT, rel), 'utf8').replace(/\r\n/g, '\n')
const ANSI = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, 'g')
const strip = text => text.replace(ANSI, '')

const CSS = [
  '/* 주석 속 .ghost { line-height: 1 } 은 규칙이 아니다 */',
  '.panel {',
  '  @apply rounded-[99rem];',
  '',
  '  box-shadow: 0 1.6rem 3.2rem var(--color-alpha-black-50);',
  '}',
  '',
  '@media (prefers-reduced-motion: no-preference) {',
  '  .panel__a,',
  '  .panel__b {',
  '    animation: rise 0.9s ease;',
  '  }',
  '}',
  '',
  '.panel__title { line-height: 1.2; }',
  ''
].join('\n')
const FILE = 'src/styles/6-components/panel.css'
const registry = css => ({ css, markup: [{ block: 'panel', rule: 'R-27', element: 'svg.ridge', reason: '면 전환 그림이다.' }] })
const entry = (rule, selector, match) => ({ block: 'panel', rule, file: FILE, selector, match, reason: '시험용 예외다. 열 글자를 넘긴다.' })

test('줄을 감싼 규칙의 선택자를 찾는다 — at-규칙은 건너뛰고 주석은 읽지 않는다', () => {
  assert.deepEqual(X.selectorsAt(CSS, 3), ['.panel'])
  assert.deepEqual(X.selectorsAt(CSS, 5), ['.panel'])
  assert.deepEqual(X.selectorsAt(CSS, 11), ['.panel__a', '.panel__b'])
  assert.deepEqual(X.selectorsAt(CSS, 15), ['.panel__title'])
  assert.deepEqual(X.selectorsAt(CSS, 1), [])
  assert.deepEqual(X.selectorsAt(CSS, 7), [])
})

test('파일·규칙·선택자·값이 모두 맞을 때만 통과시킨다', () => {
  const reg = registry([entry('R-35', '.panel', 'rounded-[99rem]'), entry('R-22', '.panel__b', 'animation: rise 0.9s')])

  assert.equal(X.matchCss(reg, FILE, 'R-35', 3, CSS)?.selector, '.panel')
  // Windows 경로로 와도 같다
  assert.ok(X.matchCss(reg, FILE.replace(/\//g, '\\'), 'R-35', 3, CSS))
  // 선택자 목록 가운데 하나만 맞아도 된다
  assert.ok(X.matchCss(reg, FILE, 'R-22', 11, CSS))

  // 다른 파일
  assert.equal(X.matchCss(reg, 'src/styles/6-components/other.css', 'R-35', 3, CSS), null)
  // 다른 규칙 — 같은 선택자의 그림자 blur는 등록하지 않았다
  assert.equal(X.matchCss(reg, FILE, 'R-35', 5, CSS), null)
  assert.equal(X.matchCss(reg, FILE, 'R-24', 3, CSS), null)
  // 다른 선택자 — 등록되지 않은 곳의 같은 종류 위반
  assert.equal(X.matchCss(reg, FILE, 'R-24', 15, CSS), null)
  // 등록부가 비었거나 줄 번호가 없으면 통과시키지 않는다
  assert.equal(X.matchCss({ css: [], markup: [] }, FILE, 'R-35', 3, CSS), null)
  assert.equal(X.matchCss(reg, FILE, 'R-35', null, CSS), null)
})

test('값을 바꾸면 예외가 풀린다 — 프로젝트가 블록 스타일을 고쳐 범위를 넓히지 못한다', () => {
  const reg = registry([entry('R-35', '.panel', 'rounded-[99rem]'), entry('R-22', '.panel__b', 'animation: rise 0.9s')])
  const wider = CSS.replace('rounded-[99rem]', 'rounded-[120rem]').replace('rise 0.9s', 'rise 2.4s')
  assert.equal(X.matchCss(reg, FILE, 'R-35', 3, wider), null)
  assert.equal(X.matchCss(reg, FILE, 'R-22', 11, wider), null)

  // 같은 표현을 등록되지 않은 선택자에 더해도 잡힌다
  const added = `${CSS}\n.panel__extra {\n  @apply rounded-[99rem];\n}\n`
  assert.equal(X.matchCss(reg, FILE, 'R-35', 18, added), null)
  assert.ok(X.matchCss(reg, FILE, 'R-35', 3, added))
})

test('마크업 예외는 R-27 「직접 그린 인라인 svg」와 등록된 클래스에만 걸린다', () => {
  const reg = registry([])
  const msg = '[R-27] 직접 그린 인라인 svg — 아이콘은 대장 스프라이트로 쓴다.'
  assert.ok(X.matchMarkup(reg, 'R-27', msg, '<svg class="ridge" viewBox="0 0 1440 100" aria-hidden="true">'))
  assert.ok(X.matchMarkup(reg, 'R-27', msg, '<svg viewBox="0 0 1440 100" class="wide ridge">'))
  // 등록되지 않은 클래스, 클래스 없음
  assert.equal(X.matchMarkup(reg, 'R-27', msg, '<svg class="blob" viewBox="0 0 10 10">'), null)
  assert.equal(X.matchMarkup(reg, 'R-27', msg, '<svg viewBox="0 0 10 10">'), null)
  assert.equal(X.matchMarkup(reg, 'R-27', msg, '<svg class="ridge-like">'), null)
  // R-27의 다른 위반(aria-hidden 누락)과 다른 규칙은 통과시키지 않는다
  assert.equal(X.matchMarkup(reg, 'R-27', '[R-27] 아이콘 svg에 aria-hidden="true"가 없다', '<svg class="ridge">'), null)
  assert.equal(X.matchMarkup(reg, 'R-09', msg, '<svg class="ridge">'), null)
})

test('예외 형식 — 등록된 스타일 파일, 선택자, 값, 사유가 있어야 한다', () => {
  const styles = [FILE]
  assert.deepEqual(X.validateException(entry('R-35', '.panel', 'rounded-[99rem]'), styles), [])
  assert.deepEqual(X.validateException({ rule: 'R-27', markup: 'svg.ridge', reason: '면 전환 그림이라 스프라이트로 둘 수 없다.' }, styles), [])

  const bad = (patch, expected) => {
    const problems = X.validateException({ ...entry('R-35', '.panel', 'rounded-[99rem]'), ...patch }, styles)
    assert.ok(problems.some(p => expected.test(p)), `${expected}: ${JSON.stringify(problems)}`)
  }
  bad({ rule: '35' }, /rule은 R-NN/)
  bad({ file: 'src/styles/6-components/other.css' }, /styles에 등록된 파일/)
  bad({ file: 'pages/main.css' }, /styles에 등록된 파일/)
  bad({ selector: '' }, /selector/)
  bad({ match: '' }, /match/)
  bad({ reason: '필요함' }, /reason/)
  bad({ krds: 'ok' }, /krds/)
  assert.ok(X.validateException({ rule: 'R-34', markup: 'svg.ridge', reason: '그라데이션을 마크업 예외로 넣으려 한다.' }, styles).some(p => /R-27/.test(p)))
  assert.ok(X.validateException({ rule: 'R-27', markup: 'div.ridge', reason: '아무 요소나 등록하려 한다. 안 된다.' }, styles).some(p => /svg\./.test(p)))
})

test('카탈로그의 예외가 모두 형식을 지키고, 가리키는 선택자와 값이 블록 스타일에 실재한다', () => {
  assert.deepEqual(X.exceptionProblems(BLOCKS), [])
  assert.ok(REGISTRY.css.length > 0 && REGISTRY.markup.length > 0)
  for (const e of REGISTRY.css) {
    const css = read(e.file)
    const lines = css.split('\n')
    const hit = lines.some((line, i) => line.replace(/\s+/g, ' ').includes(e.match) && X.selectorsAt(css, i + 1).includes(e.selector))
    assert.ok(hit, `${e.block}: ${e.file}의 ${e.selector}에 「${e.match}」가 없다 — 낡은 예외다`)
  }
  for (const e of REGISTRY.markup) {
    const cls = e.element.replace(/^svg\./, '')
    assert.ok(BLOCKS.some(b => b.markup.includes(`<svg class="${cls}"`)), `${e.block}: 마크업에 ${e.element}가 없다`)
    assert.ok(BLOCKS.filter(b => b.markup.includes(`<svg class="${cls}"`)).every(b => new RegExp(`<svg class="${cls}"[^>]*aria-hidden="true"`).test(b.markup)), `${e.element}는 aria-hidden이어야 한다`)
  }
})

test('KRDS와 직접 부딪히는 예외는 운영자 승인 대기로 표시돼 있다', () => {
  const leading = REGISTRY.css.filter(e => e.rule === 'R-24')
  assert.ok(leading.length >= 5)
  for (const e of leading) assert.equal(e.krds, 'pending', `${e.block} ${e.selector}: 행간 예외는 krds: pending이어야 한다`)
  for (const id of ['scene', 'news-deck', 'field-shore', 'link-lines']) {
    const block = BLOCKS.find(b => b.id === id)
    assert.ok(block.krdsPending?.some(p => /크기/.test(p)), `${id}: krdsPending에 표제·제목 크기가 없다`)
  }
  const doc = read('docs/archive/design-intelligence-2026-11.md')
  const section6 = doc.slice(doc.indexOf('## 6. 블록별 형식'), doc.indexOf('## 7. '))
  for (const id of ['scene', 'news-deck', 'field-shore', 'link-lines']) {
    assert.ok(new RegExp(`\`${id}\`\\([^\\n]*?KRDS 기준 밖 — 운영자 승인 대기`).test(section6), `design-intelligence §6의 ${id} 줄에 표시가 없다`)
  }
  // 견본은 운영자 판정에서 통과하지 못했다 — 「승인 견본」이라고 쓰지 않는다
  for (const block of BLOCKS) assert.doesNotMatch(JSON.stringify(block), /운영자 승인 (?:쇼케이스|견본)|운영자가 승인한/, block.id)
  assert.match(JSON.stringify(loadSets(ROOT)), /견본 — 운영자 판정: 불통과/)
})

test('계약 파일이 블록 정본과 같고 스타터 사본도 같다 — npm run build:blocks · sync:starter', () => {
  assert.equal(read(X.CONTRACT_FILE), buildExceptionContract(ROOT), 'contracts/block-exceptions.json이 낡았다 — npm run build:blocks')
  assert.equal(read(`starter/${X.CONTRACT_FILE}`), read(X.CONTRACT_FILE), '스타터 사본이 낡았다 — npm run sync:starter')
  assert.ok(fs.existsSync(path.join(ROOT, 'starter', 'scripts', 'lib', 'block-exceptions.js')), '스타터에 판정 코드가 없다 — 스타터에서는 블록 스타일이 그대로 위반으로 잡힌다')
})

test('견본 조합 — 형식을 지키고 순서 점검에서 걸리지 않는다', () => {
  const sets = loadSets(ROOT)
  assert.deepEqual(validateSets(sets, BLOCKS), [])
  const showcase = sets.find(s => s.id === 'scene-showcase')
  assert.deepEqual(showcase.blocks, ['scene', 'news-deck', 'field-shore', 'link-lines', 'logo-row'])
  const by = id => BLOCKS.find(b => b.id === id)

  // 이어지게 설계된 면은 경고 없이 「이어지는 짝」으로 알린다
  const ok = checkSequence(showcase.blocks.map(by))
  assert.deepEqual(ok.filter(f => f.level !== 'info'), [])
  assert.equal(ok.filter(f => f.code === 'joined-surface').length, 4)

  // 짝을 바꿔 끼우면 이어 붙는 면을 다시 본다
  const swapped = checkSequence(['scene', 'bulletin', 'field-shore', 'partner-row'].map(by))
  assert.ok(swapped.some(f => f.code === 'joins-below' && /scene/.test(f.message)))
  assert.ok(swapped.some(f => f.code === 'joins-above' && /field-shore/.test(f.message)))
  // 마지막 블록으로 설계된 것 뒤에 다른 블록
  assert.ok(checkSequence(['scene', 'news-deck', 'field-shore', 'logo-row', 'link-lines'].map(by)).some(f => f.code === 'not-last'))
  // 짝이 아닌 짙은 면 연속은 여전히 경고다
  assert.ok(checkSequence(['cover', 'task-index', 'news-deck'].map(by)).some(f => f.code === 'same-surface'))
  // 걸치는 판은 장면형 첫 화면 뒤에 두지 않는다
  assert.ok(checkSequence(['scene', 'task-index'].map(by)).some(f => f.code === 'avoid-neighbor'))
})

// ─── 검사기에 붙여 돌린다 — 임시 프로젝트에 블록 스타일과 계약을 놓고 실제 스크립트를 실행한다 ───

function tempProject(mutate) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'infoux-blockex-'))
  const copy = rel => {
    const to = path.join(dir, rel)
    fs.mkdirSync(path.dirname(to), { recursive: true })
    fs.cpSync(path.join(ROOT, rel), to, { recursive: true })
  }
  for (const rel of ['scripts/check-violations.js', 'scripts/lib', 'contracts', 'rules.json', 'tokens/build/tokens.css', 'tokens/foundation.json', 'tokens/brand.json']) copy(rel)
  const styles = path.join(dir, 'src', 'styles', '6-components')
  fs.mkdirSync(styles, { recursive: true })
  fs.writeFileSync(path.join(styles, 'index.css'), '@import "./scene-header.css";\n@import "./float-panel.css";\n')
  for (const name of ['scene-header.css', 'float-panel.css']) fs.copyFileSync(path.join(ROOT, 'src/styles/6-components', name), path.join(styles, name))
  if (mutate) mutate(dir, styles)
  const run = spawnSync(process.execPath, [path.join(dir, 'scripts', 'check-violations.js')], { cwd: dir, encoding: 'utf8' })
  fs.rmSync(dir, { recursive: true, force: true })
  return { status: run.status, out: strip(`${run.stdout}\n${run.stderr}`) }
}

test('검사기 — 등록된 블록 스타일은 통과하고 적용 건수를 한 줄로 보인다', () => {
  const { status, out } = tempProject()
  assert.equal(status, 0, out)
  assert.match(out, /\[블록 예외\] 블록 예외 4건 적용 — R-24 1건 · R-35 3건 \(블록: scene · KRDS 기준 밖·운영자 승인 대기 1건\) · 근거 contracts\/block-exceptions\.json/)
  assert.doesNotMatch(out, /\[ERROR\]|\[WARN\]/)
})

test('검사기 — 블록 스타일의 값을 넓히면 그대로 잡는다', () => {
  const { status, out } = tempProject((dir, styles) => {
    const file = path.join(styles, 'float-panel.css')
    fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace('0 1.6rem 3.2rem -1.6rem', '0 1.6rem 6.4rem -1.6rem'))
  })
  assert.match(out, /float-panel\.css:\d+\n\s+\[R-35\] 그림자 blur 6\.4rem/)
  assert.match(out, /블록 예외 3건 적용/)
  assert.equal(status, 0, '그림자 blur는 경고다')
})

test('검사기 — 블록 파일 안이라도 등록되지 않은 위반은 잡는다', () => {
  const { status, out } = tempProject((dir, styles) => {
    fs.appendFileSync(path.join(styles, 'scene-header.css'), '\n.scene-header__chip {\n  @apply rounded-[99rem];\n}\n')
  })
  assert.equal(status, 2, out)
  assert.match(out, /\[ERROR\] src[\\/]styles[\\/]6-components[\\/]scene-header\.css:\d+\n\s+\[R-35\] 반경 99rem/)
  assert.match(out, /블록 예외 4건 적용/)
})

test('검사기 — 계약 파일이 없으면 예외 없이 검사한다', () => {
  const { status, out } = tempProject(dir => fs.rmSync(path.join(dir, 'contracts', 'block-exceptions.json')))
  assert.equal(status, 2, out)
  assert.doesNotMatch(out, /블록 예외/)
  assert.equal((out.match(/\[R-35\] 반경 99rem/g) || []).length, 2)
})

test('검사기 — 블록 밖 파일에 같은 표현을 쓰면 잡는다', () => {
  const { status, out } = tempProject((dir, styles) => {
    fs.writeFileSync(path.join(styles, 'my-search.css'), '.my-search {\n  @apply border border-[var(--color-border)] rounded-[99rem] [word-break:keep-all];\n}\n')
    fs.appendFileSync(path.join(styles, 'index.css'), '@import "./my-search.css";\n')
  })
  assert.equal(status, 2, out)
  assert.match(out, /my-search\.css:\d+\n\s+\[R-35\] 반경 99rem/)
})
