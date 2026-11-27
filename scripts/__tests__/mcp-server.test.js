// MCP 서버 도구 구현 — 오류 응답(isError), 검색 범위, get_rules 필터.
// 서버는 SDK를 기동할 때만 부르므로, SDK가 설치되지 않은 환경에서도 도구 함수를 직접 부른다.

const fs = require('node:fs')
const path = require('node:path')
const { test } = require('node:test')
const assert = require('node:assert/strict')

const ROOT = path.resolve(__dirname, '..', '..')
const { callTool, TOOLS, normalizeSeverity } = require('../../mcp/bin/server.js')
const RULES = JSON.parse(fs.readFileSync(path.join(ROOT, 'rules.json'), 'utf8'))
const MANIFEST = JSON.parse(fs.readFileSync(path.join(ROOT, 'mcp', 'data', 'manifest.json'), 'utf8'))

const body = result => result.content[0].text
const ruleIds = result => [...body(result).matchAll(/^## (R-\d+) — /gm)].map(m => m[1])

test('없는 이름·잘못된 입력은 isError로 돌려준다', () => {
  for (const [name, args] of [
    ['get_component', { name: 'no-such-component' }],
    ['get_component', {}],
    ['get_component', { name: 42 }],
    ['get_icon', {}],
    ['get_reference', { name: 'no-such-doc' }],
    ['get_workflow', { name: 'no-such-flow' }],
    ['get_profile', { name: 'no-such-profile' }],
    ['get_rules', { id: 'R-999' }],
    ['get_rules', { category: 'no-such-category' }],
    ['get_rules', { severity: 'fatal' }],
    ['get_art_direction', { profile: 'no-such-profile' }],
    ['get_art_direction', { expression: 'loud' }],
    ['get_tokens', { query: 'no-such-token-name' }],
    ['search_docs', { query: '' }],
    ['search_docs', { query: '   ' }],
    ['search_docs', {}],
    ['no_such_tool', {}]
  ]) {
    const result = callTool(name, args)
    assert.equal(result.isError, true, `${name}(${JSON.stringify(args)})가 정상 응답처럼 돌아왔다: ${body(result).slice(0, 80)}`)
    assert.ok(body(result).length > 0)
  }
})

test('정상 호출은 isError가 없다', () => {
  for (const [name, args] of [
    ['get_contract', {}],
    ['list_components', {}],
    ['get_component', { name: 'btn' }],
    ['get_tokens', {}],
    ['get_tokens', { query: 'link' }],
    ['get_rules', {}],
    ['get_rules', { id: 'r-11' }],
    ['get_reference', {}],
    ['get_workflow', {}],
    ['get_profile', {}],
    ['get_art_direction', {}],
    ['search_docs', { query: '포커스' }]
  ]) {
    const result = callTool(name, args)
    assert.notEqual(result.isError, true, `${name}(${JSON.stringify(args)}): ${body(result).slice(0, 120)}`)
  }
})

test('없는 이름의 오류에는 쓸 수 있는 이름이 들어 있다', () => {
  assert.match(body(callTool('get_component', { name: 'buton' })), /사용 가능: .*\bbtn\b/)
  assert.match(body(callTool('get_rules', { category: 'accessibility' })), /사용 가능: .*a11y/)
})

test('get_rules 심각도 필터는 warn·warning·대문자를 같은 값으로 받는다', () => {
  const expected = RULES.rules.filter(r => r.severity === 'warn').map(r => r.id)
  assert.ok(expected.length >= 9, '경고 규칙을 읽지 못했다')
  for (const severity of ['warn', 'warning', 'WARN', ' Warning ']) {
    assert.deepEqual(ruleIds(callTool('get_rules', { severity })), expected, `severity=${JSON.stringify(severity)}`)
  }
  // 통일 전 warning이던 규칙과 warn이던 규칙이 한 필터에 함께 나온다
  for (const id of ['R-02', 'R-07', 'R-08', 'R-22', 'R-31', 'R-44', 'R-49', 'R-50', 'R-51']) assert.ok(expected.includes(id), id)
  assert.equal(normalizeSeverity('warning'), 'warn')
  assert.equal(normalizeSeverity('ERROR'), 'error')
  assert.equal(ruleIds(callTool('get_rules', { severity: 'error' })).length, RULES.rules.filter(r => r.severity === 'error').length)
})

test('get_rules 분류 필터 — 허용값은 도구 설명에 있고 rules.json categories와 같다', () => {
  const tool = TOOLS.find(t => t.name === 'get_rules')
  for (const cat of RULES.categories) {
    assert.ok(tool.inputSchema.properties.category.description.includes(cat.id), `category 설명에 ${cat.id}가 없다`)
    assert.deepEqual(ruleIds(callTool('get_rules', { category: cat.id })), RULES.rules.filter(r => r.category === cat.id).map(r => r.id))
  }
  assert.deepEqual(ruleIds(callTool('get_rules', { category: 'A11Y' })), RULES.rules.filter(r => r.category === 'a11y').map(r => r.id), '대소문자 무시')
})

test('search_docs는 작업 컨트랙트·사이트 유형 프리셋·아트 디렉션도 찾는다', () => {
  const contract = fs.readFileSync(path.join(ROOT, 'mcp', 'data', 'contract.md'), 'utf8')
  const heading = contract.split('\n').find(l => /^#{1,3} \S/.test(l)).replace(/^#+\s*/, '').trim()
  assert.match(body(callTool('search_docs', { query: heading })), /## contract \(contract, \d+건\) — get_contract\(\)/)
  assert.match(body(callTool('search_docs', { query: 'sectionPaddingPc' })), /## profiles \(profile, \d+건\) — get_profile\(\)/)
  assert.match(body(callTool('search_docs', { query: 'bodyLineHeight' })), /## art-direction \(art-direction, \d+건\) — get_art_direction\(\)/)
})

test('search_docs — 대소문자 무시, 결과 없음은 오류가 아니다, 문서 전체를 돌려주지 않는다', () => {
  const upper = body(callTool('search_docs', { query: 'KEEP-ALL' }))
  assert.match(upper, /^# 검색 — "KEEP-ALL"/)
  const none = callTool('search_docs', { query: 'zzz-이런-글은-없다-zzz' })
  assert.notEqual(none.isError, true)
  assert.match(body(none), /검색 결과 없음/)
  // 흔한 글자로 찾아도 문서마다 표본 세 줄까지만 싣는다
  const common = body(callTool('search_docs', { query: 'a' }))
  const sections = common.split('\n## ').slice(1).filter(s => !s.startsWith('규칙 '))
  for (const section of sections) assert.ok(section.split('\n').filter(l => /^ {2}\d+: /.test(l)).length <= 3)
})

test('list_components는 페이지 골격(boilerplate)을 컴포넌트 목록과 따로 보인다', () => {
  const text = body(callTool('list_components', {}))
  const [catalog, skeleton] = text.split('## 페이지 골격')
  assert.ok(skeleton, '페이지 골격 절이 없다')
  assert.doesNotMatch(catalog, /\*\*boilerplate\*\*/)
  assert.match(skeleton, /\*\*boilerplate\*\*/)
  assert.match(catalog, /\*\*btn\*\* — /)
  // 요약에 코드 펜스가 그대로 나오지 않는다(예전: - **btn** — ```html)
  assert.doesNotMatch(text, /— ```/)
  const count = Number(catalog.match(/컴포넌트·패턴 (\d+)종/)[1])
  assert.equal(count, MANIFEST.snippets.filter(s => s.kind !== 'boilerplate').length)
})

test('get_reference로 design-intelligence·design-plan·task-contract를 받는다', () => {
  for (const name of ['design-intelligence', 'design-plan', 'task-contract']) {
    const result = callTool('get_reference', { name })
    assert.notEqual(result.isError, true, name)
    assert.ok(body(result).length > 200, name)
    assert.match(body(callTool('get_reference', {})), new RegExp(`\\*\\*${name}\\*\\*`))
  }
})

test('mcp/README.md의 도구 표가 서버의 도구 목록과 같고, 낡은 숫자가 없다', () => {
  const readme = fs.readFileSync(path.join(ROOT, 'mcp', 'README.md'), 'utf8')
  const documented = [...readme.matchAll(/^\| `([a-z_]+)` \|/gm)].map(m => m[1])
  assert.deepEqual(documented.sort(), TOOLS.map(t => t.name).sort())
  assert.doesNotMatch(readme, /KRDS 28종/)
  assert.doesNotMatch(readme, /빌드 <sha>/)
  for (const name of ['design-intelligence', 'design-plan', 'task-contract']) assert.ok(readme.includes(name), `README에 ${name}이 없다`)
  // README가 적은 레퍼런스 문서 이름은 번들에 실제로 있다
  const row = readme.split('\n').find(l => l.startsWith('| `get_reference` |'))
  const ids = MANIFEST.references.map(r => r.id)
  for (const m of row.matchAll(/`([a-z][a-z-]+)`/g)) {
    if (m[1] === 'get_reference') continue
    assert.ok(ids.includes(m[1]), `README의 get_reference 문서 "${m[1]}"가 번들에 없다`)
  }
})
