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
 *   contracts/art-direction.json     (아트 디렉션 정본 — 타이포·팔레트·한글 조판)
 *   contracts/fake-content.json      (R-23 자리값·핫링크 호스트)
 *   contracts/copy-lexicon.json      (R-43 번역투 어휘·버튼 어미·느낌표)
 *   references/CONTRACT.md           (작업 컨트랙트)
 *   references/*.md                  (토큰·컴포넌트·접근성 등 레퍼런스)
 *   references/workflows/*.md        (작업 절차 — 옛 스킬을 대체한다)
 *   contracts/render-critique-evaluator.md (렌더 비평 평가자 지시문 — 레퍼런스로 싣는다)
 *   assets/exemplars/index.json      (기준 견본 색인 — 레퍼런스 exemplars.md로 풀어 싣는다)
 *   src/snippets/*.md                (컴포넌트 마크업 스니펫)
 *   src/blocks/<id>/                 (블록 카탈로그 — block.json·markup.html + styles가 가리키는 CSS)
 *   scripts/lib/block-catalog.js     (블록 조립·점검 코드 — mcp/bin/으로 복사한다)
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

const { loadBlocks, validateBlock, loadSets, validateSets } = require('./lib/block-catalog.js')
const { exceptionProblems } = require('./lib/block-exceptions.js')

const ROOT = path.resolve(__dirname, '..')
const DATA_DIR = path.join(ROOT, 'mcp', 'data')

// 번들 표기 — 커밋 sha가 아니라 가이드 package.json version을 싣는다.
// sha를 박으면 빌드할 때마다 manifest에 diff가 생기고, 커밋 전에 만든 번들이라 값도 늘 한 커밋 늦다.
function buildVersion() {
  return JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')).version
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
 * 없으면 첫 코드 펜스 앞의 첫 본문 문단으로 떨어진다. 제목·인용·표·원시 HTML·구분선은
 * 설명이 아니므로 건너뛴다 — 예전에는 ```html 줄이 요약으로 뽑혀 list_components가 `btn — ```html`로 답했다.
 * 본문 문단이 하나도 없으면(제목 바로 아래가 코드뿐인 스니펫) H1 제목을 쓴다.
 */
function summarize(body) {
  const lines = body.split('\n').map(s => s.trim())
  const clip = line => (line.length > 160 ? `${line.slice(0, 157)}...` : line)

  const when = lines.find(s => s.startsWith('> **언제 쓰나**'))
  if (when) return clip(when.replace(/^>\s*\*\*언제 쓰나\*\*\s*—\s*/, ''))

  let title = ''
  const paragraph = []
  const isList = line => /^(?:[-*+]|\d+[.)])\s/.test(line)
  for (const line of lines) {
    // 첫 코드 펜스에서 멈춘다 — 그 뒤의 글은 변형·접근성 절의 세부라 문서 전체의 설명이 아니다
    if (/^(?:`{3,}|~{3,})/.test(line)) break
    const prose = line && !/^(?:#|>|\||<|---|===)/.test(line)
    if (!prose) {
      if (!title && /^# /.test(line)) title = line.replace(/^# /, '')
      if (paragraph.length) break
      continue
    }
    // 목록 항목은 한 줄만 쓴다. 줄바꿈으로 나뉜 한 문단은 이어 붙인다(문장 중간에서 끊긴 요약을 막는다)
    if (isList(line) && paragraph.length) break
    paragraph.push(line)
    if (isList(line) || paragraph.join(' ').length > 160) break
  }
  return clip(paragraph.join(' ') || title)
}

// 스니펫 가운데 컴포넌트가 아닌 것 — list_components가 카탈로그와 따로 보여 준다
const SNIPPET_KINDS = { boilerplate: 'boilerplate' }

/**
 * 기준 견본 색인(assets/exemplars/index.json)을 레퍼런스 문서로 푼다 — get_reference("exemplars").
 * MCP는 글만 보내므로 캡처 파일은 싣지 않는다. 캡처는 프로젝트의 assets/exemplars/shots/에서 읽는다.
 */
function renderExemplarsMd(index) {
  const lines = [
    '# 기준 견본 색인',
    '',
    index.description,
    '',
    '> 생성물이다 — `npm run build:mcp`가 `assets/exemplars/index.json`에서 만든다. 쓰는 법은 `design-intelligence` §8-4·§8-8, 평가자 지시문은 `render-critique-evaluator`.',
    '',
    '## 견본'
  ]
  for (const e of index.exemplars || []) {
    lines.push(
      '',
      `### ${e.id} — ${e.title}`,
      '',
      ...(e.case ? [`- 안: ${e.case}`] : []),
      `- 판정: ${e.verdict} — 「${e.verdictQuote}」 (${e.judgedBy}, ${e.judgedAt || '날짜 기록 없음'})`,
      ...(e.reference ? [`- 레퍼런스: ${e.reference}`] : []),
      `- 쓰임: ${e.use}`,
      `- 화면 특징: ${(e.traits || []).join(' / ')}`,
      `- 「예」인 결함 문항: ${(e.defects || []).join('·') || '없음'}`,
      ...(e.notes ? [`- 경위: ${e.notes}`] : []),
      '- 캡처:'
    )
    for (const c of e.captures || []) lines.push(`  - \`${c.path}\` — ${c.width}px · ${c.kind} · ${c.status}${c.source ? ` (원본 ${c.source})` : ''}`)
  }
  lines.push('', '## 보정 사례 — 사람 판정과 평가자 판정이 갈린 것', '')
  const cal = index.calibration || []
  if (!cal.length) lines.push('아직 없다.')
  for (const c of cal) {
    lines.push(`- ${c.date} · ${c.screen} — 평가자: ${c.evaluator} / 사람: ${c.human} 「${c.humanQuote}」 — 놓친 것: ${c.missed}${c.change ? ` — 고친 것: ${c.change}` : ''}`)
  }
  return lines.join('\n') + '\n'
}

module.exports = { summarize, buildVersion, SNIPPET_KINDS, renderExemplarsMd }

// 단위 테스트가 require로 불러 쓸 수 있게 직접 실행할 때만 번들을 다시 만든다
if (require.main !== module) return

resetDir(DATA_DIR)

// 1. 규칙 / 사이트 유형 프리셋 / 아트 디렉션 정본
fs.copyFileSync(path.join(ROOT, 'rules.json'), path.join(DATA_DIR, 'rules.json'))
fs.copyFileSync(path.join(ROOT, 'contracts', 'profiles.json'), path.join(DATA_DIR, 'profiles.json'))
fs.copyFileSync(path.join(ROOT, 'contracts', 'art-direction.json'), path.join(DATA_DIR, 'art-direction.json'))
// 카피 규칙 판정 자료 — get_rules("R-23"·"R-43")가 자리값 목록·번역투 어휘를 함께 낸다
fs.copyFileSync(path.join(ROOT, 'contracts', 'fake-content.json'), path.join(DATA_DIR, 'fake-content.json'))
fs.copyFileSync(path.join(ROOT, 'contracts', 'copy-lexicon.json'), path.join(DATA_DIR, 'copy-lexicon.json'))

// 1.5. 아이콘 대장 — 에이전트가 없는 아이콘 이름을 지어내는 것을 막는다 (R-27).
// 이름·분류·코드포인트만 있으면 되므로 SVG 본문은 싣지 않는다 — 번들만 커진다.
const iconLedgerPath = path.join(ROOT, 'contracts', 'icon-codepoints.json')
if (fs.existsSync(iconLedgerPath)) {
  const full = JSON.parse(fs.readFileSync(iconLedgerPath, 'utf8'))
  // 한국어 검색어를 함께 싣는다 — AI가 「달력」으로 물어도 calendar를 찾아야
  // 이름을 지어내지 않는다 (R-27)
  const kwPath = path.join(ROOT, 'contracts', 'icon-keywords.json')
  const keywords = fs.existsSync(kwPath)
    ? JSON.parse(fs.readFileSync(kwPath, 'utf8')).keywords || {}
    : {}
  const slim = { name: full.name, version: full.version, icons: {} }
  for (const [name, meta] of Object.entries(full.icons)) {
    // variants를 빠뜨리면 MCP가 「표정 없음」이라고 답한다 — AI가 볼드를 아예 안 쓴다
    slim.icons[name] = { codepoint: meta.codepoint, category: meta.category, source: meta.source }
    if (meta.variants) slim.icons[name].variants = meta.variants
    if (keywords[name]) slim.icons[name].keywords = keywords[name]
    // 구글 이름 — 카탈로그 검색 결과가 「이미 세트에 있다」를 알아보는 다리다
    if (meta.sourceName) slim.icons[name].material = meta.sourceName
  }
  fs.writeFileSync(path.join(DATA_DIR, 'icons.json'), JSON.stringify(slim, null, 2) + '\n')
}

// 1.6. 아이콘 카탈로그 색인 — 구글 Material Symbols 전량. 세트에 없는 아이콘도 AI가 찾고,
// 「채택하면 쓴다」고 사용자에게 안내할 수 있어야 한다. 이게 없으면 AI는 세트 밖 아이콘을 모른 채
// 「없다」고 답하거나 이름을 지어낸다 (R-27). 정본은 studio/library/library.json
// (npm run icons:library로 만든다)이다 — 여기서 고치지 않는다.
const iconLibraryPath = path.join(ROOT, 'studio', 'library', 'library.json')
if (fs.existsSync(iconLibraryPath)) {
  // 한 줄 포맷 그대로 복사한다 — 다시 직렬화하면 diff가 시끄럽다
  fs.copyFileSync(iconLibraryPath, path.join(DATA_DIR, 'icon-library.json'))
}

// 검색 코드는 스튜디오·CLI와 같아야 한다 — 복사해서 싣고 check-harness가 같은지 지킨다.
// 정본은 scripts/lib/icon-search.js다. MCP 패키지는 이 저장소의 scripts/를 볼 수 없다.
fs.copyFileSync(path.join(ROOT, 'scripts', 'lib', 'icon-search.js'), path.join(ROOT, 'mcp', 'bin', 'icon-search.js'))

// 1.7. 블록 카탈로그 — 메인·랜딩의 섹션 단위 실물. 블록 한 건을 「메타데이터 + 마크업 틀 + 스타일」 JSON 하나로 싣는다.
// 정본은 src/blocks/<id>/(block.json·markup.html)와 block.json의 styles가 가리키는 src/styles CSS다.
// 형식을 어긴 블록은 싣지 않고 빌드를 멈춘다 — 에이전트가 깨진 틀을 받아 조립하면 안 된다.
// 조립·점검 코드도 아이콘 검색처럼 복사해 싣는다(정본 scripts/lib/block-catalog.js, check-harness가 같은지 지킨다).
const blocks = loadBlocks(ROOT)
const blockSets = loadSets(ROOT)
const blockProblems = [
  ...blocks.flatMap(block => validateBlock(block, block.markup).map(p => `src/blocks/${block.id}: ${p}`)),
  ...exceptionProblems(blocks),
  ...validateSets(blockSets, blocks).map(p => `src/blocks/sets.json: ${p}`)
]
if (blockProblems.length) {
  console.error(`✗ 블록 형식 오류 ${blockProblems.length}건\n${blockProblems.map(p => `  - ${p}`).join('\n')}`)
  process.exit(1)
}
fs.mkdirSync(path.join(DATA_DIR, 'blocks'), { recursive: true })
for (const block of blocks) {
  fs.writeFileSync(path.join(DATA_DIR, 'blocks', `${block.id}.json`), `${JSON.stringify(block, null, 2)}\n`)
}
fs.copyFileSync(path.join(ROOT, 'scripts', 'lib', 'block-catalog.js'), path.join(ROOT, 'mcp', 'bin', 'block-catalog.js'))

// 2. 컨트랙트 본문
fs.copyFileSync(path.join(ROOT, 'references', 'CONTRACT.md'), path.join(DATA_DIR, 'contract.md'))

// 3. 레퍼런스 / 워크플로 / 스니펫
// CONTRACT.md는 data/contract.md로 따로 싣는다 — 두 벌 넣으면 번들만 커진다.
const references = copyMarkdownDir(path.join(ROOT, 'references'), path.join(DATA_DIR, 'references'), ['CONTRACT.md'])
// 계약 서식 두 개와 렌더 비평 평가자 지시문은 contracts/에 있지만 에이전트는 MCP로만 받는다 — 레퍼런스로 함께 싣는다.
// get_reference("task-contract")·get_reference("design-plan")·get_reference("render-critique-evaluator")
for (const name of ['task-contract.md', 'design-plan.md', 'render-critique-evaluator.md']) {
  const body = fs.readFileSync(path.join(ROOT, 'contracts', name), 'utf8')
  fs.writeFileSync(path.join(DATA_DIR, 'references', name), body)
  references.push({ id: name.replace(/\.md$/, ''), file: name, chars: body.length })
}
// 기준 견본 색인 — 짝 비교 상대와 운영자 판정 사례(design-intelligence §8-8). get_reference("exemplars")
{
  const index = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets', 'exemplars', 'index.json'), 'utf8'))
  const body = renderExemplarsMd(index)
  fs.writeFileSync(path.join(DATA_DIR, 'references', 'exemplars.md'), body)
  references.push({ id: 'exemplars', file: 'exemplars.md', chars: body.length })
}
references.sort((a, b) => a.id.localeCompare(b.id))
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
  snippets: withSummary(snippets, 'snippets').map(item => ({ ...item, kind: SNIPPET_KINDS[item.id] || 'component' })),
  // 블록은 목록에서 거르는 데 쓰는 값만 색인에 둔다 — 본문은 blocks/<id>.json
  blocks: blocks.map(block => ({ id: block.id, file: `${block.id}.json`, name: block.name, slot: block.slot, forms: block.forms, tags: block.tags, summary: block.summary })),
  // 견본 조합 — 한 페이지를 이루는 블록 순서(src/blocks/sets.json). compose_page({ set })가 그대로 조립한다
  blockSets
}

fs.writeFileSync(path.join(DATA_DIR, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)

console.log(
  `✓ mcp/data — 레퍼런스 ${references.length}건, 워크플로 ${workflows.length}건, ` +
  `스니펫 ${snippets.length}건, 블록 ${blocks.length}건, 프리셋 ${presets.length}건, 기준 버전 ${manifest.version}`
)
