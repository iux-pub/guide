// MCP 번들 검증 — 팀원 PC에서 clone 없이 답할 수 있어야 한다

const fs = require('node:fs')
const path = require('node:path')
const { test } = require('node:test')
const assert = require('node:assert/strict')

const ROOT = path.resolve(__dirname, '..', '..')
const DATA_DIR = path.join(ROOT, 'mcp', 'data')

test('MCP 번들이 서버가 읽는 파일을 모두 갖췄다', () => {
  for (const required of ['manifest.json', 'rules.json', 'contract.md', 'tokens.css']) {
    assert.ok(fs.existsSync(path.join(DATA_DIR, required)), `mcp/data/${required} 누락 — npm run build:mcp`)
  }
})

test('manifest의 항목은 실제 파일을 가리킨다', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'manifest.json'), 'utf8'))

  assert.ok(manifest.references.length > 0)
  assert.ok(manifest.workflows.length > 0)
  assert.ok(manifest.snippets.length > 0)

  for (const [dir, items] of [
    ['references', manifest.references],
    ['workflows', manifest.workflows],
    ['snippets', manifest.snippets]
  ]) {
    for (const item of items) {
      assert.ok(fs.existsSync(path.join(DATA_DIR, dir, item.file)), `${dir}/${item.file} 누락`)
    }
  }
})

test('스킬 계층은 저장소에서 사라졌다', () => {
  for (const removed of ['skill', '.claude/skills', '.agents/skills', 'starter/.claude/skills', 'starter/.agents/skills']) {
    assert.equal(fs.existsSync(path.join(ROOT, removed)), false, `${removed}가 남아 있다 — 전달 경로는 MCP 하나다`)
  }
})

test('번들 토큰이 원본 tokens.css와 같다', () => {
  const bundled = fs.readFileSync(path.join(DATA_DIR, 'tokens.css'), 'utf8')
  const source = fs.readFileSync(path.join(ROOT, 'tokens', 'build', 'tokens.css'), 'utf8')
  assert.equal(bundled, source, 'MCP가 낡은 토큰을 답한다 — npm run build:mcp')
})

test('번들 규칙이 원본 rules.json과 같다', () => {
  const bundled = fs.readFileSync(path.join(DATA_DIR, 'rules.json'), 'utf8')
  const source = fs.readFileSync(path.join(ROOT, 'rules.json'), 'utf8')
  assert.equal(bundled, source, 'MCP가 낡은 규칙을 답한다 — npm run build:mcp')
})

test('서버가 선언한 도구 이름과 구현 분기가 어긋나지 않는다', () => {
  const server = fs.readFileSync(path.join(ROOT, 'mcp', 'bin', 'server.js'), 'utf8')

  const declared = [...server.matchAll(/^\s{4}name: '([a-z_]+)',$/gm)].map(m => m[1])
  const handled = [...server.matchAll(/^\s{6}case '([a-z_]+)':$/gm)].map(m => m[1])

  assert.ok(declared.length >= 7, `도구 선언을 읽지 못했다 (${declared.length}건)`)
  assert.deepEqual(declared.sort(), handled.sort(), '선언된 도구와 case 분기가 다르다')
})
