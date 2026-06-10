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

function listSkillFiles(relativeDir) {
  const root = path.join(ROOT, relativeDir)
  if (!fs.existsSync(root)) {
    fail(`스킬 디렉터리 누락: ${relativeDir}`)
    return []
  }

  return fs.readdirSync(root, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => `${entry.name}/SKILL.md`)
    .filter(relativePath => fs.existsSync(path.join(root, relativePath)))
    .sort()
}

const rules = JSON.parse(read('rules.json') || '{"rules":[]}')
const knownEnforcers = new Set([
  'check-violations.js',
  'check-html-structure.js',
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
requireSame('contracts/html-page-contract.json', 'starter/contracts/html-page-contract.json')
requireSame('contracts/agent-workflow.json', 'starter/contracts/agent-workflow.json')
requireSame('contracts/task-contract.schema.json', 'starter/contracts/task-contract.schema.json')
requireSame('contracts/task-contract.md', 'starter/contracts/task-contract.md')
requireSame('tokens/AGENTS.md', 'starter/tokens/AGENTS.md')
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
if (starterPackage.scripts?.check !== 'node ./scripts/check-violations.js && node ./scripts/check-html-structure.js') {
  fail('starter npm run check가 두 정적 검사기를 모두 실행하지 않습니다.')
}

const agentSkills = listSkillFiles('.agents/skills')
const claudeSkills = listSkillFiles('.claude/skills')
if (agentSkills.join('\n') !== claudeSkills.join('\n')) {
  fail('.agents/skills와 .claude/skills 목록이 다릅니다. npm run build:agents를 실행하세요.')
}

for (const relativeSkill of agentSkills) {
  const skillPath = `.agents/skills/${relativeSkill}`
  requireSame(skillPath, `.claude/skills/${relativeSkill}`)
  requireSame(skillPath, `starter/.agents/skills/${relativeSkill}`)
  requireSame(skillPath, `starter/.claude/skills/${relativeSkill}`)
  const content = read(skillPath)
  for (const banned of ['src/scss', '.scss', '@use ', '@forward ', '--spacing-', '--font-family-base']) {
    if (content.includes(banned)) fail(`${skillPath}에 폐기 패턴 "${banned}"이 남아 있습니다.`)
  }
}

for (const requiredSkill of [
  'change-token/SKILL.md',
  'create-component/SKILL.md',
  'design-form/SKILL.md',
  'design-page/SKILL.md',
  'design-widget/SKILL.md',
  'init-project/SKILL.md',
  'review-ui/SKILL.md'
]) {
  if (!agentSkills.includes(requiredSkill)) fail(`필수 예방 스킬 누락: ${requiredSkill}`)
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
