#!/usr/bin/env node
/**
 * infoUX MCP 데이터 번들러
 *
 * MCP 서버는 팀원 PC에서 `npx`로 도는 독립 패키지다. 저장소를 clone하지 않은
 * 상태에서도 답할 수 있어야 하므로, 서버가 참조할 문서를 mcp/data/로 실어 둔다.
 *
 * 입력:
 *   rules.json                       (규칙 원본)
 *   skill/SKILL.md                   (info-design 컨트랙트)
 *   skill/references/*.md            (토큰·컴포넌트·접근성 등 레퍼런스)
 *   src/snippets/*.md                (컴포넌트 마크업 스니펫)
 *   tokens/build/tokens.css          (실제 토큰 값)
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

function copyMarkdownDir(sourceDir, targetDir) {
  fs.mkdirSync(targetDir, { recursive: true })
  const names = fs
    .readdirSync(sourceDir)
    .filter(name => name.endsWith('.md') && name !== 'AGENTS.md')
    .sort()

  return names.map(name => {
    const body = fs.readFileSync(path.join(sourceDir, name), 'utf8')
    fs.writeFileSync(path.join(targetDir, name), body)
    return { id: name.replace(/\.md$/, ''), file: name, chars: body.length }
  })
}

/** 문서 첫 문단을 한 줄 요약으로 쓴다 — 목록 응답에서 무엇인지 알려면 필요하다. */
function summarize(body) {
  const line = body
    .split('\n')
    .map(s => s.trim())
    .find(s => s && !s.startsWith('#') && !s.startsWith('>') && !s.startsWith('---'))
  if (!line) return ''
  return line.length > 160 ? `${line.slice(0, 157)}...` : line
}

resetDir(DATA_DIR)

// 1. 규칙
fs.copyFileSync(path.join(ROOT, 'rules.json'), path.join(DATA_DIR, 'rules.json'))

// 2. 컨트랙트 본문
fs.copyFileSync(path.join(ROOT, 'skill', 'SKILL.md'), path.join(DATA_DIR, 'skill.md'))

// 3. 레퍼런스 / 스니펫
const references = copyMarkdownDir(path.join(ROOT, 'skill', 'references'), path.join(DATA_DIR, 'references'))
const snippets = copyMarkdownDir(path.join(ROOT, 'src', 'snippets'), path.join(DATA_DIR, 'snippets'))

// 4. 실제 토큰 값 — 카탈로그 문서만으로는 hex를 확정할 수 없다
fs.copyFileSync(path.join(ROOT, 'tokens', 'build', 'tokens.css'), path.join(DATA_DIR, 'tokens.css'))

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
  snippets: withSummary(snippets, 'snippets')
}

fs.writeFileSync(path.join(DATA_DIR, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)

console.log(`✓ mcp/data — 레퍼런스 ${references.length}건, 스니펫 ${snippets.length}건, 빌드 ${manifest.version}`)
