// 스타터 동기화(scripts/sync-starter.js)와 그 주변 계약 — 복사 목록은 한 곳, lib은 require를 따라 모은다.
// npm 스크립트·eslint 설정·CI가 Windows와 검사 범위 요구를 지키는지도 여기서 본다.

const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { test } = require('node:test')
const assert = require('node:assert/strict')

const ROOT = path.resolve(__dirname, '..', '..')
const sync = require('../sync-starter')
const read = rel => fs.readFileSync(path.join(ROOT, ...rel.split('/')), 'utf8')

test('스타터로 가는 스크립트 묶음에 require로 부르는 lib이 모두 들어 있다', () => {
  const files = sync.starterScriptFiles(ROOT)
  for (const rel of [...sync.STARTER_SCRIPTS, 'hooks/post-edit.js', 'lib/template-signature.js', 'lib/design-plan.js', 'lib/html-tree.js', 'lib/type-floor.js', 'lib/visual-signature.js']) {
    assert.ok(files.includes(rel), `${rel}이 스타터 묶음에 없다`)
  }
  // 묶음 안의 어떤 파일이 부르는 상대 모듈도 묶음 안에 있다(닫혀 있다)
  for (const rel of files) {
    for (const dep of sync.relativeRequires(path.join(ROOT, 'scripts'), rel)) {
      if (fs.existsSync(path.join(ROOT, 'scripts', dep))) assert.ok(files.includes(dep), `${rel} → ${dep}이 묶음에 없다`)
    }
  }
  // 가이드 전용 빌드 스크립트는 넘기지 않는다
  for (const rel of ['build-rules.js', 'build-mcp.js', 'check-harness.js', 'sync-starter.js']) assert.ok(!files.includes(rel), rel)
})

test('require 추적 — try/catch 선택 모듈과 ../lib 경로를 따라가고, 없는 파일은 missing으로 알린다', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'iux-sync-'))
  const write = (rel, body) => { fs.mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true }); fs.writeFileSync(path.join(dir, rel), body) }
  write('entry.js', "const a = require('./lib/a')\nlet opt = null\ntry { opt = require('./lib/optional') } catch (e) { if (e.code !== 'MODULE_NOT_FOUND') throw e }\nconst fs = require('node:fs')\nconst pkg = require('../package.json')\n")
  write('hooks/hook.js', "require('../lib/b.js')\n")
  write('lib/a.js', "module.exports = require('./c')\n")
  write('lib/b.js', '')
  write('lib/c.js', '')
  const { files, missing } = sync.requireClosure(dir, ['entry.js', 'hooks/hook.js'])
  assert.deepEqual(files, ['entry.js', 'hooks/hook.js', 'lib/a.js', 'lib/b.js', 'lib/c.js'])
  assert.deepEqual(missing, ['lib/optional.js'])
  fs.rmSync(dir, { recursive: true, force: true })
})

test('동기화 — 임시 스타터 폴더에 스크립트·계약·토큰·설정이 원본 그대로 간다', () => {
  const starterDir = fs.mkdtempSync(path.join(os.tmpdir(), 'iux-starter-'))
  // 스타터 전용 파일과 낡은 프리셋은 각각 남고 지워져야 한다
  fs.mkdirSync(path.join(starterDir, 'tokens', 'presets'), { recursive: true })
  fs.writeFileSync(path.join(starterDir, 'tokens', 'presets', 'stale.json'), '{}')
  fs.writeFileSync(path.join(starterDir, 'package.json'), '{"name":"starter-only"}')
  const { scripts } = sync.syncStarter({ guideDir: ROOT, starterDir, log: () => {} })
  const same = rel => assert.equal(fs.readFileSync(path.join(starterDir, ...rel.split('/')), 'utf8'), read(rel), rel)
  for (const rel of scripts) same(`scripts/${rel}`)
  for (const rel of ['scripts/lib/template-signature.js', 'scripts/lib/design-plan.js', 'contracts/design-plan.md', 'contracts/profiles.json', 'tokens/foundation.json', 'tokens/brand.json', '.stylelintrc.json', '.claude/settings.json', '.codex/hooks.json', 'src/styles/style.css', 'assets/icons/icons.css', 'assets/icons/sprite.svg']) same(rel)
  for (const name of fs.readdirSync(path.join(ROOT, 'contracts'))) assert.ok(fs.existsSync(path.join(starterDir, 'contracts', name)), `contracts/${name}`)
  assert.equal(fs.existsSync(path.join(starterDir, 'tokens', 'presets', 'stale.json')), false, '낡은 프리셋이 남았다')
  assert.equal(fs.existsSync(path.join(starterDir, 'tokens', 'build')), false, 'tokens/build는 스타터가 자체 빌드한다')
  assert.equal(fs.readFileSync(path.join(starterDir, 'package.json'), 'utf8'), '{"name":"starter-only"}', '스타터 전용 파일을 덮어썼다')
  fs.rmSync(starterDir, { recursive: true, force: true })
})

test('복사 목록은 sync-starter.js 한 곳에만 있다 — bash 스크립트는 그것을 부른다', () => {
  const sh = read('scripts/sync-starter.sh')
  assert.match(sh, /^\s*node "\$GUIDE_DIR\/scripts\/sync-starter\.js"/m)
  assert.doesNotMatch(sh, /^\s*cp\s+(?:-\w+\s+)?"\$GUIDE_DIR\//m, 'bash 스크립트에 guide → starter 복사 줄이 남아 있다')
  assert.match(sh, /^set -o pipefail/m)
  assert.match(sh, /template-signature\.js/, '머리 주석 목록에 template-signature.js가 없다')
})

test('npm 스크립트 — Windows에서 도는 형태다', () => {
  const scripts = JSON.parse(read('package.json')).scripts
  assert.equal(scripts['sync:starter'], 'node scripts/sync-starter.js')
  assert.equal(scripts['sync:starter:push'], 'bash scripts/sync-starter.sh --push')
  // Node 20은 Windows에서 *.test.js 글롭을 풀지 못한다 — 폴더를 넘긴다
  assert.equal(scripts['test:unit'], 'node --test scripts/__tests__/')
  for (const name of ['lint:js', 'lint:js:fix']) {
    for (const dir of ['scripts/', 'studio/', 'mcp/bin/', 'cli/bin/', 'eleventy.config.js']) assert.ok(scripts[name].includes(dir), `${name}에 ${dir}가 없다`)
  }
})

test('eslint 설정은 .mjs이고 mcp/bin·cli/bin·studio 블록이 있다', () => {
  assert.equal(fs.existsSync(path.join(ROOT, 'eslint.config.js')), false, 'eslint.config.js가 남아 있다(MODULE_TYPELESS_PACKAGE_JSON 경고)')
  const config = read('eslint.config.mjs')
  for (const glob of ['mcp/bin/**/*.js', 'cli/bin/**/*.js', 'studio/**/*.mjs', 'studio/public/**/*.js', 'scripts/**/*.js']) assert.ok(config.includes(`'${glob}'`), glob)
})

test('CI — MCP 의존성을 설치하고, 레퍼런스·MCP 번들을 빌드해 drift를 본다', () => {
  const ci = read('.github/workflows/ci.yml')
  assert.match(ci, /npm ci --prefix mcp/)
  const order = ['npm run build:rules', 'npm run build:prompts', 'npm run build:references', 'npm run build:mcp', 'npm run sync:starter', 'git diff --exit-code'].map(s => ci.indexOf(s))
  assert.ok(order.every(i => i >= 0), `빠진 단계가 있다: ${order}`)
  assert.deepEqual([...order].sort((a, b) => a - b), order, '빌드 → 동기화 → drift 검사 순서')
  const diff = ci.split('\n').find(l => l.includes('git diff --exit-code'))
  for (const p of ['references/', 'mcp/data/', 'starter/', 'prompts/', 'CLAUDE.md']) assert.ok(diff.includes(p), `drift 검사 경로에 ${p}가 없다`)
  assert.match(ci, /npm run lint:js/)
})
