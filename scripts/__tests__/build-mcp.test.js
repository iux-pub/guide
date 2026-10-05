// MCP 번들 검증 — 팀원 PC에서 clone 없이 답할 수 있어야 한다

const fs = require('node:fs')
const path = require('node:path')
const { test } = require('node:test')
const assert = require('node:assert/strict')

const ROOT = path.resolve(__dirname, '..', '..')
const DATA_DIR = path.join(ROOT, 'mcp', 'data')

test('MCP 번들이 서버가 읽는 파일을 모두 갖췄다', () => {
  for (const required of ['manifest.json', 'rules.json', 'contract.md', 'tokens.css', 'art-direction.json']) {
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

test('번들 아트 디렉션이 원본 contracts/art-direction.json과 같다', () => {
  const bundled = fs.readFileSync(path.join(DATA_DIR, 'art-direction.json'), 'utf8')
  const source = fs.readFileSync(path.join(ROOT, 'contracts', 'art-direction.json'), 'utf8')
  assert.equal(bundled, source, 'MCP가 낡은 아트 디렉션을 답한다 — npm run build:mcp')
})

test('서버가 선언한 도구 이름과 구현 분기가 어긋나지 않는다', () => {
  const server = fs.readFileSync(path.join(ROOT, 'mcp', 'bin', 'server.js'), 'utf8')

  const declared = [...server.matchAll(/^\s{4}name: '([a-z_]+)',$/gm)].map(m => m[1])
  const handled = [...server.matchAll(/^\s{6}case '([a-z_]+)':$/gm)].map(m => m[1])

  assert.ok(declared.length >= 7, `도구 선언을 읽지 못했다 (${declared.length}건)`)
  assert.deepEqual(declared.sort(), handled.sort(), '선언된 도구와 case 분기가 다르다')
})

// ── 아이콘 카탈로그 ────────────────────────────────────
//
// 에이전트는 세트(73종) 안에서만 찾으면 「없다」고 답하거나 이름을 지어낸다 (R-27).
// 카탈로그 전량을 찾을 수 있되, 세트에 없는 것은 채택하기 전에는 마크업을 주지 않아야 한다.

const LIBRARY = path.join(ROOT, 'studio', 'library', 'library.json')

test('MCP 번들에 카탈로그 색인이 정본 그대로 실린다', { skip: !fs.existsSync(LIBRARY) }, () => {
  const bundled = path.join(DATA_DIR, 'icon-library.json')
  assert.ok(fs.existsSync(bundled), 'mcp/data/icon-library.json 누락 — npm run build:mcp')
  assert.equal(fs.readFileSync(bundled, 'utf8'), fs.readFileSync(LIBRARY, 'utf8'))
})

test('번들의 아이콘 대장에 구글 이름이 실린다', () => {
  // 이게 없으면 카탈로그 검색이 「이미 세트에 있다」를 알아보지 못해 같은 아이콘을 또 채택하라고 권한다
  const ledger = JSON.parse(fs.readFileSync(path.join(ROOT, 'contracts', 'icon-codepoints.json'), 'utf8'))
  const bundled = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'icons.json'), 'utf8'))
  for (const [name, meta] of Object.entries(ledger.icons)) {
    if (meta.sourceName) assert.equal(bundled.icons[name]?.material, meta.sourceName, `${name}의 구글 이름`)
  }
})

/** SDK가 설치된 환경에서만 실제 서버를 띄워 본다. 도구 호출은 에이전트가 보는 그대로의 응답이다. */
async function withServer(fn) {
  const req = require('node:module').createRequire(path.join(ROOT, 'mcp', 'package.json'))
  const { Client } = req('@modelcontextprotocol/sdk/client/index.js')
  const { StdioClientTransport } = req('@modelcontextprotocol/sdk/client/stdio.js')
  const client = new Client({ name: 'test', version: '0' })
  await client.connect(new StdioClientTransport({ command: process.execPath, args: [path.join(ROOT, 'mcp', 'bin', 'server.js')], stderr: 'ignore' }))
  try {
    return await fn(async (name, args) => (await client.callTool({ name, arguments: args })).content[0].text)
  } finally {
    await client.close()
  }
}

const hasSdk = fs.existsSync(path.join(ROOT, 'mcp', 'node_modules', '@modelcontextprotocol', 'sdk'))
const serverOpts = { skip: !hasSdk || !fs.existsSync(LIBRARY) }

test('list_icons는 세트에 있는 것과 카탈로그에만 있는 것을 나눠 준다', serverOpts, async () => {
  await withServer(async (call) => {
    // 한국어로 찾아도 걸린다
    const found = await call('list_icons', { query: '장바구니' })
    assert.match(found, /shopping_cart/)

    // 세트에 있는 아이콘은 「바로 쓴다」쪽이다
    const inSet = await call('list_icons', { query: '검색' })
    assert.match(inSet, /## 세트에 있음/)
    assert.match(inSet, /`search`/)

    // 어디에도 없으면 이름을 지어내지 말라고 한다
    const none = await call('list_icons', { query: '존재하지않는아이콘이름' })
    assert.match(none, /지어내지 않는다/)
  })
})

test('get_icon은 카탈로그에만 있는 아이콘의 마크업을 주지 않는다', serverOpts, async () => {
  await withServer(async (call) => {
    const text = await call('get_icon', { name: 'shopping_cart' })
    assert.match(text, /카탈로그에만 있음/)
    assert.match(text, /icons:adopt/)
    // 마크업을 주면 AI는 그대로 쓴다 — 화면에는 아무것도 안 나온다
    assert.doesNotMatch(text, /<span class="icon-font/)
    assert.doesNotMatch(text, /<svg/)
  })
})

test('get_icon은 구글 이름으로 물어도 세트의 이름을 알려 준다', serverOpts, async () => {
  await withServer(async (call) => {
    // keyboard_arrow_up은 이 세트에서 chevron-up이다
    const text = await call('get_icon', { name: 'keyboard_arrow_up' })
    assert.match(text, /`chevron-up`/)
    assert.match(text, /<span class="icon-font icon-font--chevron-up"/)
  })
})

test('get_icon은 이름 규칙에 어긋나는 아이콘에 이름 제안을 붙인다', serverOpts, async () => {
  await withServer(async (call) => {
    const text = await call('get_icon', { name: '4k' })
    assert.match(text, /num-4k/)
    assert.match(text, /--as num-4k/)
  })
})

test('get_icon은 철자가 틀린 이름에도 단서를 준다', serverOpts, async () => {
  await withServer(async (call) => {
    const text = await call('get_icon', { name: 'shoping-cart' })
    assert.match(text, /shopping_cart/)
  })
})
