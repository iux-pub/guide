#!/usr/bin/env node

// 편집 직후 검사 훅 — Claude Code(.claude/settings.json)·Codex(.codex/hooks.json) PostToolUse 공용 (HX-06)
//
// 예전 셸 훅의 결함을 없앤다:
// - jq가 없으면 'command not found' 뒤 조용히 exit 0 → 입력 JSON을 여기서 직접 읽는다
// - '2>/dev/null || true'로 실패를 숨겼다 → 검사기 출력을 그대로 보이고 하나라도 실패하면 2로 끝낸다
// - 'check-violations; …; check-html-structure'에서 마지막 명령의 종료 코드만 남았다 → 모두 모아 판정한다
//
// 입력(stdin JSON):
// - Claude Code: tool_input.file_path(Write·Edit·MultiEdit), tool_input.notebook_path(NotebookEdit)
// - Codex: tool_name "apply_patch", tool_input.command에 패치 본문 — '*** Add File:'·'*** Update File:'·'*** Move to:' 줄에서
//   경로를 모은다('*** Delete File:'은 검사할 파일이 없다)
//
// 대상(lint-staged·npm run check와 같은 범위):
//   src/styles/**/*.css                       stylelint + check-violations
//   src/snippets/**/*.md                      check-violations + check-html-structure
//   site/**/*.{md,njk,html}                   check-violations + check-html-structure
//   src/playground/**/*.html                  check-violations + check-html-structure
//   references/**/*.md, prompts/**/*.md       check-html-structure (금지 예시를 서술한 문장은 R-23 대상이 아니다)
//   납품 페이지(루트 *.html, pages/**, infoux.json pages)   check-violations + check-html-structure
// 이 프로젝트 밖의 파일은, 그 파일이 속한 다른 infoUX 프로젝트(예: 저장소 안의 starter/)의 훅에 넘긴다.
// 종료 코드: 0 = 통과(또는 대상 아님), 2 = 오류 — PostToolUse에서 2는 stderr가 에이전트에게 전달된다

const fs = require('fs')
const path = require('path')
const { spawnSync } = require('child_process')

// 경로는 양쪽 모두 같은 함수(.native)로 실제 경로를 구한다 — 심볼릭 링크·정션·대소문자가 달라도 같은 파일로 본다
const real = p => {
  try {
    return fs.realpathSync.native(p)
  } catch {
    return path.resolve(p)
  }
}
const ROOT = real(path.resolve(__dirname, '..', '..'))
const SELF = real(__filename)
const SCRIPTS = path.join(ROOT, 'scripts')
const EXCLUDED_SEGMENTS = new Set(['node_modules', 'dist', '_site', '.git'])

const ROUTES = [
  { re: /^src\/styles\/.+\.css$/i, run: ['stylelint', 'check-violations'] },
  { re: /^src\/snippets\/.+\.md$/i, run: ['check-violations', 'check-html-structure'] },
  { re: /^site\/.+\.(md|njk|html)$/i, run: ['check-violations', 'check-html-structure'] },
  { re: /^src\/playground\/.+\.html$/i, run: ['check-violations', 'check-html-structure'] },
  { re: /^(references|prompts)\/.+\.md$/i, run: ['check-html-structure'] }
]

function fail(message) {
  process.stderr.write(`[post-edit] ${message}\n`)
  process.exit(2)
}

function readInput() {
  let raw = ''
  try {
    raw = fs.readFileSync(0, 'utf8')
  } catch (e) {
    fail(`훅 입력을 읽지 못했다: ${e.message}`)
  }
  if (!raw.trim()) fail('훅 입력(JSON)이 비어 있다 — PostToolUse 훅으로만 실행한다')
  try {
    return JSON.parse(raw)
  } catch (e) {
    fail(`훅 입력이 JSON이 아니다: ${e.message}`)
  }
}

// tool_input 안 어디에든 있는 패치 본문(문자열 또는 문자열 배열)을 찾는다
function findPatchText(value) {
  if (typeof value === 'string') return value.includes('*** Begin Patch') ? value : null
  if (Array.isArray(value)) {
    for (const v of value) {
      const found = findPatchText(v)
      if (found) return found
    }
    return null
  }
  if (value && typeof value === 'object') {
    for (const v of Object.values(value)) {
      const found = findPatchText(v)
      if (found) return found
    }
  }
  return null
}

// 검사할 파일 목록. patch=true는 패치 본문이 있었다는 뜻(경로를 하나도 못 읽으면 실패로 본다)
function collectTargets(input) {
  const ti = input?.tool_input || {}
  const direct = ti.file_path || ti.notebook_path || ti.path || input?.tool_response?.filePath
  if (typeof direct === 'string' && direct) return { targets: [direct], patch: false, deletesOnly: false }
  const patchText = findPatchText(ti)
  if (!patchText) return { targets: [], patch: false, deletesOnly: false }
  const targets = []
  let deletes = 0
  for (const line of patchText.split(/\r?\n/)) {
    const m = line.match(/^\*\*\* (Add File|Update File|Move to|Delete File): (.+?)\s*$/)
    if (!m) continue
    if (m[1] === 'Delete File') deletes++
    else targets.push(m[2])
  }
  return { targets: [...new Set(targets)], patch: true, deletesOnly: targets.length === 0 && deletes > 0 }
}

function routeFor(rel) {
  if (rel.split('/').some(seg => EXCLUDED_SEGMENTS.has(seg))) return null
  const route = ROUTES.find(r => r.re.test(rel))
  if (route) return route.run
  try {
    const { isPagePath } = require(path.join(SCRIPTS, 'lib', 'page-scope'))
    if (isPagePath(ROOT, rel)) return ['check-violations', 'check-html-structure']
  } catch {
    // page-scope가 없으면(오래된 파생 프로젝트) 루트 *.html만 페이지로 본다
    if (/^[^/]+\.html$/i.test(rel)) return ['check-violations', 'check-html-structure']
  }
  return null
}

function stylelintCommand(file) {
  const pkgPath = path.join(ROOT, 'node_modules', 'stylelint', 'package.json')
  if (!fs.existsSync(pkgPath)) return null
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
  const bin = typeof pkg.bin === 'string' ? pkg.bin : pkg.bin?.stylelint
  if (!bin) return null
  return [path.join(path.dirname(pkgPath), bin), file]
}

function run(tool, file) {
  let args
  if (tool === 'stylelint') {
    args = stylelintCommand(file)
    if (!args) return { status: 2, output: 'stylelint가 설치되어 있지 않아 CSS 린트를 하지 못했다 — npm install 후 다시 저장한다' }
  } else {
    const script = path.join(SCRIPTS, `${tool}.js`)
    if (!fs.existsSync(script)) return { status: 2, output: `scripts/${tool}.js가 없다 — 스타터를 갱신한다` }
    args = [script, file]
  }
  const result = spawnSync(process.execPath, args, { cwd: ROOT, encoding: 'utf8', env: { ...process.env, FORCE_COLOR: '0' } })
  if (result.error) return { status: 2, output: `${tool} 실행 실패: ${result.error.message}` }
  return { status: result.status === null ? 2 : result.status, output: `${result.stdout || ''}${result.stderr || ''}`.trim() }
}

// 이 프로젝트 밖의 파일 — 가장 가까운 상위 폴더의 다른 infoUX 훅에 넘긴다(저장소 루트에서 starter/ 파일을 고칠 때 등).
// 세션이 starter/로 cd한 뒤 저장소 루트 파일을 고치면 starter 사본이 불리므로, 위로도 찾는다.
function delegate(abs) {
  let dir = path.dirname(abs)
  while (true) {
    const hook = path.join(dir, 'scripts', 'hooks', 'post-edit.js')
    if (fs.existsSync(hook) && real(hook) !== SELF) {
      const input = JSON.stringify({ tool_name: 'Write', cwd: dir, tool_input: { file_path: abs } })
      const result = spawnSync(process.execPath, [hook], { cwd: dir, input, encoding: 'utf8' })
      if (result.error) return { status: 2, output: `${hook} 실행 실패: ${result.error.message}` }
      return { status: result.status === null ? 2 : result.status, output: `${result.stdout || ''}${result.stderr || ''}`.trim() }
    }
    const parent = path.dirname(dir)
    if (parent === dir) return { status: 0, output: '' } // 어느 infoUX 프로젝트에도 속하지 않는다
    dir = parent
  }
}

function checkTarget(target, cwd) {
  const resolved = path.resolve(cwd, target)
  if (!fs.existsSync(resolved)) return [] // 지운 파일
  const abs = real(resolved)
  const rel = path.relative(ROOT, abs).split(path.sep).join('/')
  if (rel.startsWith('..') || path.isAbsolute(rel)) {
    const { status, output } = delegate(abs)
    return status === 0 ? [] : [`── 다른 프로젝트 훅 (exit ${status}) ──\n${output}`]
  }
  const tools = routeFor(rel)
  if (!tools) return []
  const reports = []
  for (const tool of tools) {
    const { status, output } = run(tool, abs)
    if (status !== 0) reports.push(`── ${rel} · ${tool} (exit ${status}) ──\n${output}`)
  }
  return reports
}

function main() {
  const input = readInput()
  const { targets, patch, deletesOnly } = collectTargets(input)
  if (targets.length === 0) {
    // 패치 본문은 있는데 파일 경로를 하나도 못 읽었다 — 형식이 바뀐 것이다. 조용히 넘기지 않는다
    if (patch && !deletesOnly) fail('apply_patch 본문에서 파일 경로(*** Add File: / *** Update File:)를 찾지 못했다 — 훅 입력 형식을 확인한다')
    process.exit(0) // 파일을 쓰지 않은 도구, 또는 삭제만 한 패치
  }
  const cwd = typeof input.cwd === 'string' && input.cwd ? input.cwd : process.cwd()

  // 모든 파일·검사를 끝까지 돌리고, 하나라도 실패하면 2로 끝낸다(STRICT=1에서 경고로 1을 낸 경우도 에이전트가 보도록 2)
  const reports = targets.flatMap(t => checkTarget(t, cwd))
  if (reports.length === 0) process.exit(0)
  process.stderr.write(`[post-edit] 검사 실패\n${reports.join('\n')}\n`)
  process.exit(2)
}

main()
