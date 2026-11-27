#!/usr/bin/env node

const fs = require('node:fs')
const path = require('node:path')

const ROOT = path.resolve(__dirname, '..')
let errors = 0

function fail(message) {
  console.error(`[HARNESS] ${message}`)
  errors++
}

function read(relativePath) {
  const filePath = path.join(ROOT, relativePath)
  if (!fs.existsSync(filePath)) {
    fail(`필수 파일 누락: ${relativePath}`)
    return ''
  }
  return fs.readFileSync(filePath, 'utf8')
}

// 사본이 원본과 같은지 본다. 고치는 명령은 사본이 어디 것이냐에 따라 다르다 —
// 스타터 사본은 npm run sync:starter(Node 스크립트라 Windows에서도 돈다), MCP 번들은 npm run build:mcp
function requireSame(source, target) {
  const sourceContent = read(source)
  const targetContent = read(target)
  if (sourceContent && targetContent && sourceContent !== targetContent) {
    const bundle = target.startsWith('mcp/')
    fail(`${bundle ? 'MCP 번들' : '스타터'} drift: ${target}가 ${source}와 다릅니다. ${bundle ? 'npm run build:mcp' : 'npm run sync:starter'}를 실행하세요.`)
  }
}

const rules = JSON.parse(read('rules.json') || '{"rules":[]}')
const knownEnforcers = new Set([
  'check-violations.js',
  'check-html-structure.js',
  'check-contrast.js',
  'check-icons.js',
  'build-tokens.js',
  'stylelint',
  'pa11y-ci',
  'manual'
])

for (const rule of rules.rules || []) {
  if (!rule.enforcement || rule.enforcement.length === 0) {
    fail(`${rule.id} enforcement가 비어 있습니다.`)
    continue
  }
  for (const enforcer of rule.enforcement) {
    if (!knownEnforcers.has(enforcer)) fail(`${rule.id} 알 수 없는 enforcement: ${enforcer}`)
  }
}

// 스타터 스크립트 사본 — 목록을 손으로 늘리지 않는다(template-signature.js가 목록에서 빠져 스타터의 R-51 검사가
// 조용히 꺼져 있었다). 두 방향으로 본다:
//   ① 원본에서 스타터로 가야 하는 파일(sync-starter.js의 진입 스크립트 + 훅 + 그들이 require로 부르는 lib)이
//      스타터에 있고 원본과 같다.
//   ② 스타터에 있는 스크립트(starter/scripts/*.js·hooks·lib)가 require('./lib/…')로 부르는 파일이
//      스타터에 있고 원본과 같다 — try/catch로 감싼 선택 모듈이 스타터에서만 빠진 경우를 잡는다.
const { starterScriptFiles, requireClosure, scriptFilesIn } = require('./sync-starter')
const starterScriptsDir = path.join(ROOT, 'starter', 'scripts')
const checkedScripts = new Set()
function requireSameScript(rel) {
  if (checkedScripts.has(rel)) return
  checkedScripts.add(rel)
  requireSame(`scripts/${rel}`, `starter/scripts/${rel}`)
}
for (const rel of starterScriptFiles(ROOT)) requireSameScript(rel)
if (fs.existsSync(starterScriptsDir)) {
  const starterEntries = ['', 'hooks', 'lib'].flatMap(sub => scriptFilesIn(starterScriptsDir, sub))
  const { files, missing } = requireClosure(starterScriptsDir, starterEntries)
  for (const rel of files) {
    // 원본에 없는 파일은 스타터 전용이 아니라 남은 찌꺼기다 — 원본에서 지운 lib이 스타터에 남아 계속 돈다
    if (!fs.existsSync(path.join(ROOT, 'scripts', rel))) fail(`스타터에만 있는 스크립트: starter/scripts/${rel} (원본 scripts/${rel} 없음)`)
    else requireSameScript(rel)
  }
  for (const rel of missing) {
    // 원본에도 없으면 어디에도 없는 선택 모듈이다. 원본에는 있는데 스타터에 없으면 그 검사가 스타터에서 꺼져 있다
    if (fs.existsSync(path.join(ROOT, 'scripts', rel))) {
      fail(`스타터 스크립트가 부르는 starter/scripts/${rel}가 없습니다(그 검사가 스타터에서 조용히 꺼진다). npm run sync:starter를 실행하세요.`)
    }
  }
}
// MCP는 저장소의 scripts/를 볼 수 없어 검색 코드를 복사해 싣는다. 어긋나면 AI와 사람이 다르게 찾는다
requireSame('scripts/lib/icon-search.js', 'mcp/bin/icon-search.js')
// 블록 조립·순서 점검 코드도 같다 — 어긋나면 미리보기와 MCP compose_page가 다른 페이지를 만든다
requireSame('scripts/lib/block-catalog.js', 'mcp/bin/block-catalog.js')
// 브랜드 계층은 프로젝트가 갈아끼우는 파일이라 값 동일성을 요구하지 않는다.
// 다만 스타터가 세 파일을 모두 갖추지 못하면 브랜드 교체 구조 자체가 성립하지 않는다.
for (const required of [
  'starter/tokens/foundation.json',
  'starter/tokens/brand.json',
  'starter/tokens/contrast-baseline.json'
]) {
  if (!fs.existsSync(path.join(ROOT, required))) {
    fail(`스타터에 ${required}가 없습니다. npm run sync:starter를 실행하세요.`)
  }
}
// 계약 파일 — 폴더의 파일 전부를 대조한다(sync-starter.js가 폴더째 옮긴다). 새 계약 파일을 더해도 목록을 고칠 일이 없다
for (const name of fs.readdirSync(path.join(ROOT, 'contracts'), { withFileTypes: true }).filter(e => e.isFile()).map(e => e.name).sort()) {
  requireSame(`contracts/${name}`, `starter/contracts/${name}`)
}
requireSame('tokens/AGENTS.md', 'starter/tokens/AGENTS.md')
// 팔레트 프리셋은 원본·스타터·MCP 번들 세 곳이 항상 같아야 한다 — 낡은 hex가 퍼지는 사고를 막는다.
const presetsDir = path.join(ROOT, 'tokens', 'presets')
const presetNames = fs.existsSync(presetsDir)
  ? fs.readdirSync(presetsDir).filter(name => name.endsWith('.json')).sort()
  : []
if (presetNames.length === 0) fail('tokens/presets/에 프리셋 파일이 없습니다.')
for (const name of presetNames) {
  requireSame(`tokens/presets/${name}`, `starter/tokens/presets/${name}`)
  requireSame(`tokens/presets/${name}`, `mcp/data/presets/${name}`)
}
requireSame('src/styles/AGENTS.md', 'starter/src/styles/AGENTS.md')
requireSame('src/snippets/AGENTS.md', 'starter/src/snippets/AGENTS.md')

for (const instruction of [
  'governance.instructions.md',
  'snippets.instructions.md',
  'styles.instructions.md',
  'tokens.instructions.md'
]) {
  requireSame(`.github/instructions/${instruction}`, `starter/.github/instructions/${instruction}`)
}

const starterPackage = JSON.parse(read('starter/package.json') || '{}')
// .stylelintrc.json은 루트에서 복사되지만 package.json은 스타터 전용이다 — 플러그인·확장을 설치 목록에 두지 않으면
// 파생 프로젝트의 모든 CSS 편집이 'Could not find …'로 실패한다(편집 훅이 CSS마다 stylelint를 돌린다)
const starterStylelint = JSON.parse(read('starter/.stylelintrc.json') || '{}')
const starterDeps = { ...starterPackage.dependencies, ...starterPackage.devDependencies }
for (const name of [...(starterStylelint.plugins || []), ...[].concat(starterStylelint.extends || [])]) {
  if (!starterDeps[name]) fail(`starter/.stylelintrc.json이 쓰는 ${name}이 starter/package.json에 없습니다.`)
}
const STARTER_CHECK = 'node ./scripts/check-violations.js && node ./scripts/check-html-structure.js && node ./scripts/check-contrast.js && node ./scripts/check-icons.js && node ./scripts/check-contract.js'
if (starterPackage.scripts?.check !== STARTER_CHECK) {
  fail('starter npm run check가 정적 검사기 5종(위반·HTML 구조·대비·아이콘·계약)을 모두 실행하지 않습니다.')
}
if (starterPackage.scripts?.['check:release'] !== 'npm run check && node ./scripts/check-contract.js --release') {
  fail('starter에 납품 게이트 npm run check:release(CT-03)가 없습니다.')
}

// 스킬 계층은 2026-07-29 폐기했다. 작업 절차·레퍼런스는 infoUX MCP가 단일 경로로 제공한다.
// 대신 MCP 번들이 원본과 어긋나지 않는지 확인한다 — 낡은 기준을 답하는 것이 가장 큰 사고다.
for (const bundled of [
  ['rules.json', 'mcp/data/rules.json'],
  ['references/CONTRACT.md', 'mcp/data/contract.md'],
  ['tokens/build/tokens.css', 'mcp/data/tokens.css'],
  ['contracts/profiles.json', 'mcp/data/profiles.json'],
  ['contracts/art-direction.json', 'mcp/data/art-direction.json']
]) {
  requireSame(bundled[0], bundled[1])
}

for (const requiredPath of [
  'tokens/AGENTS.md',
  'src/styles/AGENTS.md',
  'src/snippets/AGENTS.md',
  'site/AGENTS.md',
  'scripts/AGENTS.md',
  '.github/instructions/styles.instructions.md',
  '.github/instructions/snippets.instructions.md',
  '.github/instructions/tokens.instructions.md',
  '.github/instructions/governance.instructions.md',
  'contracts/task-contract.schema.json',
  'contracts/task-contract.md'
]) {
  read(requiredPath)
}

const rootContract = read('AGENTS.md')
if (!rootContract.includes('contracts/task-contract.md')) {
  fail('루트 AGENTS.md가 Task Contract를 작업 시작점으로 안내하지 않습니다.')
}

try {
  JSON.parse(read('contracts/task-contract.schema.json'))
} catch (error) {
  fail(`Task Contract schema JSON 오류: ${error.message}`)
}

let workflow
try {
  workflow = JSON.parse(read('contracts/agent-workflow.json'))
} catch (error) {
  fail(`Agent Workflow JSON 오류: ${error.message}`)
  workflow = { steps: [] }
}

for (const contractPath of ['AGENTS.md', 'CLAUDE.md']) {
  const contract = read(contractPath)
  if (!contract.includes('contracts/agent-workflow.json')) {
    fail(`${contractPath}가 Agent Workflow 단일 원본을 참조하지 않습니다.`)
  }
}

for (const step of workflow.steps || []) {
  if (!step.id || !step.instruction) fail('Agent Workflow step에 id 또는 instruction이 없습니다.')
}

// 편집 훅(HX-06) — 루트·스타터 × Claude·Codex 네 파일이 모두 정해진 명령 하나만 부른다.
// 훅 로직은 scripts/hooks/post-edit.js에 두고, 판정은 lib/hook-contract.js가 한다(단위 테스트 대상).
const { validateHookConfig } = require('./lib/hook-contract')
for (const hookPath of ['.claude/settings.json', '.codex/hooks.json', 'starter/.claude/settings.json', 'starter/.codex/hooks.json']) {
  const raw = read(hookPath)
  if (!raw) continue
  for (const problem of validateHookConfig(raw)) fail(`${hookPath} ${problem}`)
}
const codexHooks = JSON.parse(read('.codex/hooks.json') || '{}')
const claudeHooks = JSON.parse(read('.claude/settings.json') || '{}')
if (JSON.stringify(codexHooks.hooks) !== JSON.stringify(claudeHooks.hooks)) {
  fail('Codex와 Claude의 훅 절차가 동일하지 않습니다.')
}
requireSame('.claude/settings.json', 'starter/.claude/settings.json')
requireSame('.codex/hooks.json', 'starter/.codex/hooks.json')
// 스타터 index.html은 틀 표시를 달고 나간다 — 없으면 자리값 제목이 납품 오류로 잡히고, create는 지울 표시가 없다
const starterIndex = read('starter/index.html')
if (starterIndex && !/<meta\s+name=["']infoux:template["']/.test(starterIndex)) {
  fail('starter/index.html에 <meta name="infoux:template"> 틀 표시가 없습니다(R-23 템플릿 범위).')
}

// 스타터 푸시 단계가 검사 실패를 파이프로 삼키지 않게 한다(npm run check | tail 은 pipefail 없이는 늘 성공)
const syncScript = read('scripts/sync-starter.sh')
if (syncScript && !/^set -o pipefail/m.test(syncScript)) {
  fail('scripts/sync-starter.sh에 set -o pipefail이 없습니다 — 스타터 검사 실패가 tail 파이프에 묻힙니다.')
}
// 복사 목록은 sync-starter.js 한 곳에만 둔다 — bash 스크립트가 cp 목록을 따로 가지면 두 벌이 어긋난다
if (syncScript && !/^\s*node "\$GUIDE_DIR\/scripts\/sync-starter\.js"/m.test(syncScript)) {
  fail('scripts/sync-starter.sh가 로컬 갱신을 scripts/sync-starter.js에 맡기지 않습니다 — 복사 목록이 두 벌이 됩니다.')
}
if (syncScript && /^\s*cp\s+(?:-\w+\s+)?"\$GUIDE_DIR\//m.test(syncScript)) {
  fail('scripts/sync-starter.sh에 guide → starter 복사 줄(cp "$GUIDE_DIR/…")이 남아 있습니다 — 목록은 scripts/sync-starter.js에만 둡니다.')
}
// npm run sync:starter는 bash 없이 돌아야 한다(Windows) — 위 drift 안내가 이 명령을 가리킨다
const rootPackage = JSON.parse(read('package.json') || '{}')
if (rootPackage.scripts?.['sync:starter'] !== 'node scripts/sync-starter.js') {
  fail('package.json sync:starter가 node scripts/sync-starter.js가 아닙니다 — Windows에서 스타터를 갱신할 수 없습니다.')
}

// HX-07 기준 문서 정합 — 정본과 모순되는 처방(슬롭 유도 문구)을 references·site/design·prompts에 두지 않는다
//   사전: contracts/copy-lexicon.json prescriptions, 판정: scripts/lib/doc-prescriptions.js
//   스타터 사본(starter/prompts)·MCP 번들(mcp/data)은 원본에서 생성되므로 원본만 본다
const lexicon = JSON.parse(read('contracts/copy-lexicon.json') || '{}')
if (Array.isArray(lexicon.prescriptions)) {
  const { scanDocPrescriptions } = require('./lib/doc-prescriptions')
  for (const dir of ['references', 'site/design', 'prompts']) {
    const abs = path.join(ROOT, dir)
    if (!fs.existsSync(abs)) continue
    for (const name of fs.readdirSync(abs).filter(f => f.endsWith('.md'))) {
      for (const f of scanDocPrescriptions(fs.readFileSync(path.join(abs, name), 'utf8'), lexicon.prescriptions)) {
        fail(`${dir}/${name}:${f.line} [HX-07] ${f.message}\n    ${f.code}`)
      }
    }
  }
}

if (errors > 0) {
  console.error(`하네스 오류 ${errors}건`)
  process.exit(2)
}

console.log('✓ 하네스 구성 일관성 통과')
