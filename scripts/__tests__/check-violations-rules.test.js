// check-violations.js 판정 함수 — R-02 !important 사유 주석, R-10 div·span 클릭 핸들러, R-11 초점 표시 제거, R-20 :has()
// 정규식 복사본이 아니라 스크립트가 내보내는 함수와 스크립트 실행 결과를 본다.

const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { spawnSync } = require('node:child_process')
const { test } = require('node:test')
const assert = require('node:assert/strict')

const ROOT = path.resolve(__dirname, '..', '..')
const CHECK_VIOLATIONS = path.join(ROOT, 'scripts', 'check-violations.js')
const { importantFindings, clickHandlerFindings, focusFindingsCss, focusFindingsHtml } = require('../check-violations')
const RULES = require('../../rules.json').rules
const rule = id => RULES.find(r => r.id === id)

const brief = r => r.map(f => `${f.line}: ${f.code}`).join('\n')

// 임시 파일에 스크립트를 실제로 돌린다 — R-19(@apply 필수)를 만족시키는 최소 골격 안에 넣는다
function runOnFile(name, source) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'iux-rule-'))
  const file = path.join(dir, name)
  fs.writeFileSync(file, source)
  const result = spawnSync(process.execPath, [CHECK_VIOLATIONS, file], { cwd: ROOT, encoding: 'utf8', env: { ...process.env, FORCE_COLOR: '0' } })
  fs.rmSync(dir, { recursive: true, force: true })
  return { status: result.status, out: result.stdout + result.stderr }
}
const runOnCss = body => runOnFile('sample.css', `@layer components {\n  .sample {\n    @apply flex;\n  }\n${body}\n}\n`)

// ─── R-02 ─────────────────────────────────────────────

test('R-02: 사유 주석 없는 !important는 걸린다', () => {
  const r = importantFindings('.a {\n  color: var(--color-primary) !important;\n}')
  assert.equal(r.length, 1, brief(r))
  assert.equal(r[0].line, 2)
})

test('R-02: 같은 줄 뒤·앞의 사유 주석, 바로 윗줄 주석이 있으면 통과한다', () => {
  for (const css of [
    '.pagefind-ui__input { font-size: 1.7rem !important; /* pagefind 인라인 스타일 오버라이드 */ }',
    '.a { /* 외부 위젯 덮어쓰기 */ top: 0 !important; }',
    '/* 외부 라이브러리 인라인 스타일을 덮는다 */\n.a { top: 0 !important; }',
    '/*\n * 여러 줄 사유\n */\n.a { top: 0 !important; }'
  ]) assert.deepEqual(importantFindings(css), [], `${css}\n${brief(importantFindings(css))}`)
})

test('R-02: 주석 안의 !important 글자는 코드가 아니다', () => {
  assert.deepEqual(importantFindings('/*\n * 예전에는 color: red !important 였다\n */\n.a { color: var(--color-text); }'), [])
})

test('R-02: 사유 주석이 두 줄 이상 떨어져 있으면 걸린다(여러 건은 각각 알린다)', () => {
  const r = importantFindings('/* 사유 */\n.a {\n  top: 0 !important;\n  left: 0 !important;\n}')
  assert.deepEqual(r.map(f => f.line), [3, 4])
})

test('R-02: rules.json 사례 — bad는 경고, good은 통과(스크립트 실행)', () => {
  for (const { code } of rule('R-02').bad) {
    const { status, out } = runOnCss(`  ${code}`)
    assert.equal(status, 0, out) // 경고는 종료 코드를 바꾸지 않는다
    assert.match(out, /\[R-02\]/, `bad인데 통과: ${code}`)
  }
  for (const { code } of rule('R-02').good) {
    const { out } = runOnCss(`  ${code}`)
    assert.doesNotMatch(out, /\[R-02\]/, `good인데 걸림: ${code}\n${out}`)
  }
})

// ─── R-10 ─────────────────────────────────────────────

test('R-10: div·span의 클릭·키 핸들러는 걸린다 — 대소문자 무시', () => {
  for (const html of [
    '<div onclick="fn()">클릭</div>',
    '<span onClick="fn()">클릭</span>',
    '<div class="card" ONCLICK="fn()">클릭</div>',
    '<div role="button" tabindex="0" onkeydown="fn(event)">클릭</div>',
    '<div @click="open = true">열기</div>',
    '<span v-on:click="go">이동</span>'
  ]) assert.equal(clickHandlerFindings(html).length, 1, `${html}\n${brief(clickHandlerFindings(html))}`)
})

test('R-10: 여러 줄에 걸친 태그도 잡고, 속성이 있는 줄을 가리킨다', () => {
  const r = clickHandlerFindings('<main>\n  <div\n    class="card"\n    data-id="3"\n    onClick="openCard(3)"\n  >\n    카드\n  </div>\n</main>')
  assert.equal(r.length, 1, brief(r))
  assert.equal(r[0].line, 5)
})

test('R-10: button·a의 핸들러, div의 비상호작용 이벤트, 글 속 onclick은 통과한다', () => {
  for (const html of [
    '<button type="button" onclick="fn()">클릭</button>',
    '<a href="/notice" onclick="track()">공지</a>',
    '<div onload="init()" onscroll="spy()">본문</div>',
    '<div data-onclick="x" class="onclick">본문</div>',
    '<p>div에 onclick="fn()"을 붙이지 않는다</p>',
    '<!-- <div onclick="fn()"> -->'
  ]) assert.deepEqual(clickHandlerFindings(html), [], `${html}\n${brief(clickHandlerFindings(html))}`)
})

test('R-10: rules.json 사례 — bad는 오류, good은 통과(스크립트 실행)', () => {
  for (const { code } of rule('R-10').bad) {
    const { status, out } = runOnFile('sample.html', code)
    assert.equal(status, 2, out)
    assert.match(out, /\[R-10\]/)
  }
  for (const { code } of rule('R-10').good) {
    const { out } = runOnFile('sample.html', code)
    assert.doesNotMatch(out, /\[R-10\]/, out)
  }
})

test('R-10: 마크다운은 마크업 펜스와 본문의 원시 HTML을 보고, 금지 예시 펜스·인라인 코드는 넘긴다', () => {
  const bad = runOnFile('sample.md', '# 예시\n\n```html\n<div\n  onClick="fn()">클릭</div>\n```\n')
  assert.equal(bad.status, 2, bad.out)
  assert.match(bad.out, /sample\.md:5/)
  const ok = runOnFile('sample.md', '# 예시\n\n`<div onclick="fn()">`은 쓰지 않는다.\n\n```html\n<!-- ❌ 금지 예시 -->\n<div onclick="fn()">클릭</div>\n```\n')
  assert.doesNotMatch(ok.out, /\[R-10\]/, ok.out)
})

// ─── R-11 ─────────────────────────────────────────────

test('R-11: 초점 선택자에서 outline을 지우면 걸린다 — :focus·:focus-visible·선택자 목록·0·outline-width', () => {
  for (const css of [
    ':focus { outline: none; }',
    '*:focus { outline: 0; }',
    '.btn:focus-visible { outline: none; }',
    '.a:focus, .a:hover { outline: 0 }',
    '.a:focus { outline: 0 none; }',
    '.a:focus { outline-width: 0; }',
    '.a:focus { outline-style: none; }',
    '.a:focus { outline: none !important; }',
    '.a:focus { @apply outline-none; }',
    '.a:focus-visible { @apply [outline:0]; }',
    '.a { @apply focus:outline-none; }',
    '.a { @apply tablet:focus-visible:outline-none; }',
    '.a { &:focus { outline: none; } }'
  ]) assert.equal(focusFindingsCss(css).length, 1, `${css}\n${brief(focusFindingsCss(css))}`)
})

test('R-11: 대체 초점 표시가 같은 블록에 있으면 통과한다', () => {
  for (const css of [
    '.input:focus, .input:focus-visible { @apply border-[var(--color-input-border-active)] outline-none; }',
    '.a:focus { outline: none; box-shadow: 0 0 0 0.4rem var(--color-border-primary); }',
    '.a:focus { outline: none; border-color: var(--color-border-primary); }',
    '.a:focus { @apply outline-none ring-2; }',
    '.a:focus { @apply outline-none [box-shadow:0_0_0_0.4rem_var(--color-border-primary)]; }',
    '.a { @apply focus:outline-none focus:ring-2; }',
    '.a { @apply focus:outline-none focus-visible:border-[var(--color-border-primary)]; }'
  ]) assert.deepEqual(focusFindingsCss(css), [], `${css}\n${brief(focusFindingsCss(css))}`)
})

test('R-11: 대체 초점 표시가 같은 선택자의 다른 블록·가상 요소·:focus-visible 블록에 있으면 통과한다', () => {
  for (const css of [
    '.a:focus { outline: none; }\n.a:focus { box-shadow: 0 0 0 0.4rem var(--color-border-primary); }',
    '.a:focus { outline: none; }\n.a:focus-visible { outline: 0.4rem solid var(--color-border-primary); }',
    '.link:focus-visible { @apply [outline:0]; }\n.link:focus-visible::after { @apply [outline:0.4rem_solid_var(--color-border-primary)]; }',
    '.check input:focus { outline: none; }\n.check input:focus ~ .check__box { outline: 0.4rem solid var(--color-border-primary); }',
    '.a { @apply focus:outline-none; }\n.a:focus { box-shadow: 0 0 0 0.4rem var(--color-border-primary); }'
  ]) assert.deepEqual(focusFindingsCss(css), [], `${css}\n${brief(focusFindingsCss(css))}`)
})

test('R-11: 다른 선택자의 대체 표시는 덮어 주지 못한다', () => {
  const r = focusFindingsCss('.a:focus, .b:focus { outline: none; }\n.a:focus { box-shadow: 0 0 0 0.4rem var(--color-border-primary); }')
  assert.equal(r.length, 1, brief(r))
  assert.match(r[0].code, /\.b:focus/)
})

test('R-11: 초점 링 유지·재지정·마우스 폴백·:focus-within은 통과한다', () => {
  for (const css of [
    ':focus-visible { outline: 4px solid var(--color-primary); outline-offset: 2px; }',
    ':focus { @apply [outline:0.4rem_solid_var(--color-border-primary)] [outline-offset:2px]; }',
    ':focus:not(:focus-visible) { @apply outline-none; }',
    ':focus:not(:focus-visible) { outline: none; }',
    '.a:not(:focus) { outline: none; }',
    '.tab__item:focus-visible { @apply [outline-offset:-0.4rem]; }',
    '.tooltip-wrap:focus-within > .tooltip { outline: none; }',
    '.a { outline: none; }',
    '/* :focus { outline: none } 금지 */\n.a { color: var(--color-text); }'
  ]) assert.deepEqual(focusFindingsCss(css), [], `${css}\n${brief(focusFindingsCss(css))}`)
})

test('R-11: 줄 번호는 지우는 선언의 줄이고, 한 파일의 여러 건을 모두 알린다', () => {
  const css = [
    '.a {',
    '  color: var(--color-text);',
    '}',
    '.b:focus {',
    '  color: var(--color-text);',
    '  outline: none;',
    '}',
    '',
    '.c:focus-visible,',
    '.c:hover {',
    '  outline-width: 0;',
    '}'
  ].join('\n')
  assert.deepEqual(focusFindingsCss(css).map(f => f.line), [6, 11])
})

test('R-11: HTML class의 focus:outline-none과 <style> 블록을 본다', () => {
  const r = focusFindingsHtml('<p>a</p>\n<a\n  class="btn focus:outline-none"\n  href="/a">a</a>')
  assert.equal(r.length, 1, brief(r))
  assert.equal(r[0].line, 3)
  assert.equal(focusFindingsHtml('<input class="input focus-visible:outline-0">').length, 1)
  const styled = focusFindingsHtml('<p>a</p>\n<style>\n.a:focus { outline: none; }\n</style>')
  assert.equal(styled.length, 1, brief(styled))
  assert.equal(styled[0].line, 3)
  for (const html of [
    '<button class="btn focus:outline-none focus:ring-2">b</button>',
    '<input class="input focus:outline-none focus:border-[var(--color-border-primary)]">',
    '<a class="btn outline-offset-2" href="/a">a</a>',
    '<p>class="focus:outline-none"은 쓰지 않는다</p>'
  ]) assert.deepEqual(focusFindingsHtml(html), [], `${html}\n${brief(focusFindingsHtml(html))}`)
})

test('R-11: rules.json 사례 — bad는 오류, good은 통과(스크립트 실행)', () => {
  for (const { code } of rule('R-11').bad) {
    const { status, out } = runOnCss(code)
    assert.equal(status, 2, out)
    assert.match(out, /\[R-11\]/, `bad인데 통과: ${code}`)
  }
  for (const { code } of rule('R-11').good) {
    const { out } = runOnCss(code)
    assert.doesNotMatch(out, /\[R-11\]/, `good인데 걸림: ${code}\n${out}`)
  }
})

test('R-11: 카탈로그 CSS(src/styles)에는 오탐이 없다', () => {
  const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => (e.isDirectory() ? walk(path.join(dir, e.name)) : e.name.endsWith('.css') ? [path.join(dir, e.name)] : []))
  for (const file of walk(path.join(ROOT, 'src', 'styles'))) {
    const r = focusFindingsCss(fs.readFileSync(file, 'utf8'))
    assert.deepEqual(r, [], `${path.relative(ROOT, file)}\n${brief(r)}`)
  }
})

test('R-11: 문서 펜스의 // DON\'T 구간은 반례로 넘기고, // DO 구간은 계속 본다', () => {
  const fence = body => `# 포커스\n\n\`\`\`css\n${body}\n\`\`\`\n`
  const doc = runOnFile('sample.md', fence('// DO\n.btn:focus-visible {\n  outline: 2px solid var(--color-primary);\n}\n\n// DON\'T\n.btn:focus {\n  outline: none;\n}'))
  assert.doesNotMatch(doc.out, /\[R-11\]/, doc.out)
  // 금지 표시로 시작하는 펜스는 통째로 반례다(기존 관례). 권장 표시로 시작한 펜스에서 다시 권장 구간이 오면 그 구간은 본다
  const bad = runOnFile('sample.md', fence('// DO\n.x { color: var(--color-text); }\n// DON\'T\n.a:focus { outline: none; }\n// DO\n.btn:focus {\n  outline: none;\n}'))
  assert.equal(bad.status, 2, bad.out)
  assert.match(bad.out, /sample\.md:10/)
  assert.doesNotMatch(bad.out, /sample\.md:7/)
})

// ─── R-20 ─────────────────────────────────────────────

test('R-20: rules.json 사례 — :has()는 오류, sibling·ARIA 선택자는 통과(스크립트 실행)', () => {
  for (const { code } of rule('R-20').bad) {
    const { status, out } = runOnCss(`  ${code}`)
    assert.equal(status, 2, out)
    assert.match(out, /\[R-20\]/, `bad인데 통과: ${code}`)
  }
  for (const { code } of rule('R-20').good) {
    const { status, out } = runOnCss(`  ${code}`)
    assert.doesNotMatch(out, /\[R-20\]/, `good인데 걸림: ${code}\n${out}`)
    assert.equal(status, 0, out)
  }
})

test('R-20: 여러 줄 주석 안의 :has() 설명은 선택자가 아니다', () => {
  const { out } = runOnCss('  /*\n   * 예전에는 .field:has(input) 을 썼다\n   */\n  .field { @apply flex; }')
  assert.doesNotMatch(out, /\[R-20\]/, out)
})
