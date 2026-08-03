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

function requireSame(source, target) {
  const sourceContent = read(source)
  const targetContent = read(target)
  if (sourceContent && targetContent && sourceContent !== targetContent) {
    fail(`스타터 drift: ${target}가 ${source}와 다릅니다. npm run sync:starter를 실행하세요.`)
  }
}

const rules = JSON.parse(read('rules.json') || '{"rules":[]}')
const knownEnforcers = new Set([
  'check-violations.js',
  'check-html-structure.js',
  'check-contrast.js',
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

requireSame('scripts/check-violations.js', 'starter/scripts/check-violations.js')
requireSame('scripts/check-html-structure.js', 'starter/scripts/check-html-structure.js')
requireSame('scripts/check-contrast.js', 'starter/scripts/check-contrast.js')
requireSame('scripts/lib/token-source.js', 'starter/scripts/lib/token-source.js')
requireSame('scripts/lib/contrast.js', 'starter/scripts/lib/contrast.js')
requireSame('scripts/lib/build-tokens-css.js', 'starter/scripts/lib/build-tokens-css.js')
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
requireSame('contracts/html-page-contract.json', 'starter/contracts/html-page-contract.json')
requireSame('contracts/agent-workflow.json', 'starter/contracts/agent-workflow.json')
requireSame('contracts/task-contract.schema.json', 'starter/contracts/task-contract.schema.json')
requireSame('contracts/task-contract.md', 'starter/contracts/task-contract.md')
requireSame('contracts/profiles.json', 'starter/contracts/profiles.json')
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
const STARTER_CHECK = 'node ./scripts/check-violations.js && node ./scripts/check-html-structure.js && node ./scripts/check-contrast.js'
if (starterPackage.scripts?.check !== STARTER_CHECK) {
  fail('starter npm run check가 정적 검사기 3종(위반·HTML 구조·대비)을 모두 실행하지 않습니다.')
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

const codexHooks = JSON.parse(read('.codex/hooks.json') || '{}')
const claudeHooks = JSON.parse(read('.claude/settings.json') || '{}')
if (JSON.stringify(codexHooks.hooks) !== JSON.stringify(claudeHooks.hooks)) {
  fail('Codex와 Claude의 훅 절차가 동일하지 않습니다.')
}

for (const hookPath of ['.codex/hooks.json', '.claude/settings.json']) {
  const hooks = read(hookPath)
  if (hooks.includes('sync:starter')) fail(`${hookPath}에서 starter 동기화를 자동 실행하면 안 됩니다.`)
  if (hooks.includes('|| true')) fail(`${hookPath} 검사 훅이 실패를 숨기고 있습니다.`)
}

if (errors > 0) {
  console.error(`하네스 오류 ${errors}건`)
  process.exit(2)
}

console.log('✓ 하네스 구성 일관성 통과')
