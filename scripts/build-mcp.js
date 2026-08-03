#!/usr/bin/env node
/**
 * infoUX MCP 데이터 번들러
 *
 * MCP 서버는 팀원 PC에서 `npx`로 도는 독립 패키지다. 저장소를 clone하지 않은
 * 상태에서도 답할 수 있어야 하므로, 서버가 참조할 문서를 mcp/data/로 실어 둔다.
 *
 * 입력:
 *   rules.json                       (규칙 원본)
 *   contracts/profiles.json          (사이트 유형 프리셋)
 *   references/CONTRACT.md           (작업 컨트랙트)
 *   references/*.md                  (토큰·컴포넌트·접근성 등 레퍼런스)
 *   references/workflows/*.md        (작업 절차 — 옛 스킬을 대체한다)
 *   src/snippets/*.md                (컴포넌트 마크업 스니펫)
 *   tokens/build/tokens.css          (실제 토큰 값)
 *   tokens/presets/*.json            (팔레트 프리셋 — brand.json 교체용)
 *
 * 출력:
 *   mcp/data/**                      (번들 — 직접 수정 금지)
 *   mcp/data/manifest.json           (검색·목록용 색인)
 *
 * 사용법: node scripts/build-mcp.js
 */

const fs = require('node:fs')
const path = require('node:path')
const { execSync } = require('node:child_process')

const ROOT = path.resolve(__dirname, '..')
const DATA_DIR = path.join(ROOT, 'mcp', 'data')

function buildVersion() {
  try {
    return execSync('git rev-parse --short HEAD', { cwd: ROOT }).toString().trim()
  } catch {
    return 'unknown'
  }
}

function resetDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true })
  fs.mkdirSync(dir, { recursive: true })
}

function copyMarkdownDir(sourceDir, targetDir, exclude = []) {
  fs.mkdirSync(targetDir, { recursive: true })
  const names = fs
    .readdirSync(sourceDir)
    .filter(name => name.endsWith('.md') && name !== 'AGENTS.md' && !exclude.includes(name))
    .sort()

  return names.map(name => {
    const body = fs.readFileSync(path.join(sourceDir, name), 'utf8')
    fs.writeFileSync(path.join(targetDir, name), body)
    return { id: name.replace(/\.md$/, ''), file: name, chars: body.length }
  })
}

/**
 * 한 줄 요약을 뽑는다 — 목록 응답만 보고 무엇인지 알 수 있어야 한다.
 * 워크플로는 `> **언제 쓰나** — ...` 줄이 용도를 가장 정확히 말한다. 그 줄을 우선하고,
 * 없으면 첫 본문 문단으로 떨어진다.
 */
function summarize(body) {
  const lines = body.split('\n').map(s => s.trim())

  const when = lines.find(s => s.startsWith('> **언제 쓰나**'))
  const line = when
    ? when.replace(/^>\s*\*\*언제 쓰나\*\*\s*—\s*/, '')
    : lines.find(s => s && !s.startsWith('#') && !s.startsWith('>') && !s.startsWith('---'))

  if (!line) return ''
  return line.length > 160 ? `${line.slice(0, 157)}...` : line
}

resetDir(DATA_DIR)

// 1. 규칙 / 사이트 유형 프리셋
fs.copyFileSync(path.join(ROOT, 'rules.json'), path.join(DATA_DIR, 'rules.json'))
fs.copyFileSync(path.join(ROOT, 'contracts', 'profiles.json'), path.join(DATA_DIR, 'profiles.json'))

// 2. 컨트랙트 본문
fs.copyFileSync(path.join(ROOT, 'references', 'CONTRACT.md'), path.join(DATA_DIR, 'contract.md'))

// 3. 레퍼런스 / 워크플로 / 스니펫
// CONTRACT.md는 data/contract.md로 따로 싣는다 — 두 벌 넣으면 번들만 커진다.
const references = copyMarkdownDir(path.join(ROOT, 'references'), path.join(DATA_DIR, 'references'), ['CONTRACT.md'])
const workflows = copyMarkdownDir(path.join(ROOT, 'references', 'workflows'), path.join(DATA_DIR, 'workflows'))
const snippets = copyMarkdownDir(path.join(ROOT, 'src', 'snippets'), path.join(DATA_DIR, 'snippets'))

// 4. 실제 토큰 값 — 카탈로그 문서만으로는 hex를 확정할 수 없다
fs.copyFileSync(path.join(ROOT, 'tokens', 'build', 'tokens.css'), path.join(DATA_DIR, 'tokens.css'))

// 4.5. 팔레트 프리셋 — MCP가 단일 경로다. 서버가 clone 없이 프리셋 hex를 답할 수 있어야 한다
const presetsDir = path.join(ROOT, 'tokens', 'presets')
fs.mkdirSync(path.join(DATA_DIR, 'presets'), { recursive: true })
const presets = fs
  .readdirSync(presetsDir)
  .filter(name => name.endsWith('.json'))
  .sort()
for (const name of presets) {
  fs.copyFileSync(path.join(presetsDir, name), path.join(DATA_DIR, 'presets', name))
}

// 5. 색인
const withSummary = (items, dir) =>
  items.map(item => ({
    ...item,
    summary: summarize(fs.readFileSync(path.join(DATA_DIR, dir, item.file), 'utf8'))
  }))

const manifest = {
  version: buildVersion(),
  generated: 'scripts/build-mcp.js',
  references: withSummary(references, 'references'),
  workflows: withSummary(workflows, 'workflows'),
  snippets: withSummary(snippets, 'snippets')
}

fs.writeFileSync(path.join(DATA_DIR, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)

console.log(
  `✓ mcp/data — 레퍼런스 ${references.length}건, 워크플로 ${workflows.length}건, ` +
  `스니펫 ${snippets.length}건, 프리셋 ${presets.length}건, 빌드 ${manifest.version}`
)
