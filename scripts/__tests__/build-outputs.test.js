// 생성 스크립트의 판정·변환 함수 — 규칙 심각도 표기(build-rules), 토큰 카탈로그 전량 수록·제목 단계(build-references),
// 목록 요약·번들 버전(build-mcp)

const fs = require('node:fs')
const path = require('node:path')
const { test } = require('node:test')
const assert = require('node:assert/strict')

const ROOT = path.resolve(__dirname, '..', '..')
const read = rel => fs.readFileSync(path.join(ROOT, ...rel.split('/')), 'utf8')

// ─── 규칙 심각도 (rules.json · build-rules.js) ──────────────

const { SEVERITY_LABEL, severityBadge, validateSeverities } = require('../build-rules')
const RULES = JSON.parse(read('rules.json'))

test('rules.json 심각도는 error·warn·info 세 값뿐이다(warning 표기 금지)', () => {
  const allowed = Object.keys(SEVERITY_LABEL)
  assert.deepEqual(allowed.sort(), ['error', 'info', 'warn'])
  for (const rule of RULES.rules) {
    assert.ok(allowed.includes(rule.severity), `${rule.id}: 심각도 "${rule.severity}"`)
  }
  assert.doesNotThrow(() => validateSeverities(RULES.rules))
})

test('build-rules는 모르는 심각도를 그대로 흘리지 않고 실패한다', () => {
  assert.equal(severityBadge('warn'), '`warn`')
  assert.throws(() => severityBadge('warning'), /심각도 "warning"/)
  assert.throws(() => severityBadge(undefined), /심각도/)
  assert.throws(() => severityBadge('toString'), /심각도/, '객체 기본 속성 이름도 값이 아니다')
  assert.throws(() => validateSeverities([{ id: 'R-98', severity: 'error' }, { id: 'R-99', severity: 'warning' }]), /R-99: "warning"/)
})

test('생성된 규칙 목록(CLAUDE.md·AGENTS.md)의 심각도 표기가 한 가지다', () => {
  for (const [file, start, end] of [
    ['CLAUDE.md', '<!-- RULES_START -->', '<!-- RULES_END -->'],
    ['AGENTS.md', '<!-- AGENTS_RULES_START -->', '<!-- AGENTS_RULES_END -->']
  ]) {
    const doc = read(file)
    const section = doc.slice(doc.indexOf(start), doc.indexOf(end))
    const lines = section.split('\n').filter(l => /^- \**R-\d+/.test(l))
    assert.equal(lines.length, RULES.rules.length, `${file} 규칙 줄 수 — npm run build:rules`)
    for (const line of lines) {
      assert.match(line, /^- \**R-\d+\** `(?:error|warn|info)` — /, `${file}: ${line.slice(0, 60)} — npm run build:rules`)
    }
  }
})

// ─── 토큰 카탈로그 (build-references.js) ────────────────────

const { renderKrdsTokensMd, parseTokensCss, demoteHeadings } = require('../build-references')
const TOKENS_CSS = read('tokens/build/tokens.css')
const tokenNames = css => [...new Set([...css.matchAll(/^\s*(--(?:color|font|breakpoint)-[a-z0-9-]+)\s*:/gm)].map(m => m[1]))]

test('tokens.css의 모든 --color-*·--font-* 변수가 krds-tokens.md에 있다', () => {
  const names = tokenNames(TOKENS_CSS)
  assert.ok(names.filter(n => n.startsWith('--color-')).length > 100, '토큰을 읽지 못했다')
  const doc = read('references/krds-tokens.md')
  const missing = names.filter(n => !doc.includes(`\`${n}\``))
  assert.deepEqual(missing, [], `get_tokens 문서에 없는 토큰 ${missing.length}개 — npm run build:references`)
})

test('토큰 카탈로그는 tokens.css에서 만든다 — 새 토큰이 생기면 문서에도 생긴다', () => {
  const css = TOKENS_CSS
    .replace('  /* Semantic colors */', '  /* Semantic colors */\n  --color-brand-new-thing: #123456;\n  --color-teal-50: #008080;')
    .replace('  /* Breakpoints */', '  --font-display: \'Display\', sans-serif;\n\n  /* Breakpoints */')
  const doc = renderKrdsTokensMd(css)
  for (const name of ['--color-brand-new-thing', '--color-teal-50', '--font-display']) {
    assert.ok(doc.includes(`\`${name}\``), `${name}이 문서에 없다`)
  }
  assert.match(doc, /### teal\n/, '모르는 단계 분류도 표가 생긴다')
  assert.deepEqual(tokenNames(css).filter(n => !doc.includes(`\`${n}\``)), [])
})

test('토큰 카탈로그의 값은 tokens.css의 라이트·고대비 값과 같다', () => {
  const { light, highContrast } = parseTokensCss(TOKENS_CSS)
  const doc = renderKrdsTokensMd(TOKENS_CSS)
  const lightMap = new Map(light)
  for (const name of ['--color-link', '--color-button-primary-fill', '--color-input-border-error', '--color-border-control', '--color-surface-primary-subtler', '--color-point']) {
    assert.ok(lightMap.has(name), `${name}이 tokens.css에 없다`)
    const row = doc.split('\n').find(l => l.startsWith(`| \`${name}\` |`))
    assert.ok(row, `${name} 줄이 없다`)
    assert.ok(row.includes(`\`${lightMap.get(name)}\``), `${name} 라이트 값: ${row}`)
    assert.ok(row.includes(`\`${highContrast.get(name)}\``), `${name} 고대비 값: ${row}`)
  }
  assert.equal(doc, read('references/krds-tokens.md'), 'references/krds-tokens.md가 낡았다 — npm run build:references')
})

// ─── 컴포넌트 카탈로그 제목 단계 (build-references.js) ──────

test('스니펫 제목은 한 번에 두 단계씩 낮춘다 — H1은 ###, 그 아래 절은 ####', () => {
  const out = demoteHeadings('# 버튼 (Button)\n\n## 기본 마크업\n\n### 아이콘 버튼\n\n#### 주의\n\n###### 가장 깊은 제목', 'btn')
  assert.deepEqual(out.split('\n').filter(Boolean), [
    '### 버튼 (Button) {#btn}',
    '#### 기본 마크업',
    '##### 아이콘 버튼',
    '###### 주의',
    '###### 가장 깊은 제목'
  ])
})

test('코드 펜스 안의 # 줄은 제목이 아니다', () => {
  const md = '# 제목\n\n```bash\n# 설치\nnpm install\n## 주석\n```\n\n~~~markdown\n# 예시 제목\n~~~\n\n## 다음 절'
  const out = demoteHeadings(md, 'x').split('\n')
  assert.ok(out.includes('# 설치'))
  assert.ok(out.includes('## 주석'))
  assert.ok(out.includes('# 예시 제목'))
  assert.ok(out.includes('#### 다음 절'))
  assert.equal(out[0], '### 제목 {#x}')
})

test('krds-components.md의 컴포넌트 제목은 ###이고 그 아래 절이 더 깊다', () => {
  const doc = read('references/krds-components.md')
  let fence = false
  const headings = []
  for (const line of doc.split('\n')) {
    if (/^\s*(?:```|~~~)/.test(line)) { fence = !fence; continue }
    const m = !fence && line.match(/^(#{1,6}) (.*)$/)
    if (m) headings.push({ depth: m[1].length, text: m[2] })
  }
  const titles = headings.filter(h => /\{#[a-z-]+\}$/.test(h.text))
  assert.ok(titles.length >= 30, `컴포넌트 제목을 읽지 못했다(${titles.length})`)
  for (const t of titles) assert.equal(t.depth, 3, `${t.text} — npm run build:references`)
  // 컴포넌트 제목 바로 다음 제목은 그보다 깊거나(절) 같은 단계 이상이다(다음 컴포넌트·그룹)
  headings.forEach((h, i) => {
    const next = headings[i + 1]
    if (/\{#[a-z-]+\}$/.test(h.text) && next && !/\{#[a-z-]+\}$/.test(next.text) && !/^그룹 /.test(next.text)) {
      assert.ok(next.depth > 3, `${h.text} 아래 "${next.text}"가 ${'#'.repeat(next.depth)}다`)
    }
  })
})

// ─── 목록 요약·번들 버전 (build-mcp.js) ─────────────────────

const { summarize, buildVersion } = require('../build-mcp')

test('요약은 코드 펜스 줄을 뽑지 않는다 — 본문이 없으면 H1 제목', () => {
  assert.equal(summarize('# 버튼 (Button) — KRDS\n\n## 기본 마크업\n\n```html\n<button type="button" class="btn">버튼</button>\n```\n\n- 접근성 항목'), '버튼 (Button) — KRDS')
  assert.equal(summarize('# 표\n\n| a | b |\n|---|---|\n| 1 | 2 |\n\n<div class="x">원시 HTML</div>\n\n---\n'), '표')
  assert.equal(summarize('```html\n<p>a</p>\n```'), '')
})

test('요약은 첫 본문 문단을 쓰고, 줄바꿈으로 나뉜 문단은 잇는다', () => {
  assert.equal(summarize('# 배지\n\n작은 알림 표시기.\n\n## 마크업\n\n```html\n<span>1</span>\n```'), '작은 알림 표시기.')
  assert.equal(summarize('# 아이콘\n\n세트에 등재된 아이콘만 쓴다. 목록은\nMCP로 받는다.\n\n다음 문단'), '세트에 등재된 아이콘만 쓴다. 목록은 MCP로 받는다.')
  assert.equal(summarize('# 원칙\n\n1. 시맨틱 우선\n2. ARIA는 그다음'), '1. 시맨틱 우선')
  assert.equal(summarize('# 절차\n\n> **언제 쓰나** — 새 페이지를 설계할 때\n\n본문'), '새 페이지를 설계할 때')
  const long = summarize(`# 긴 글\n\n${'가'.repeat(300)}`)
  assert.equal(long.length, 160)
  assert.ok(long.endsWith('...'))
})

test('번들 색인의 요약에 코드 펜스·표·HTML 줄이 없고, boilerplate는 컴포넌트와 구분된다', () => {
  const manifest = JSON.parse(read('mcp/data/manifest.json'))
  for (const item of [...manifest.snippets, ...manifest.references, ...manifest.workflows]) {
    assert.ok(item.summary, `${item.id} 요약이 비었다`)
    assert.doesNotMatch(item.summary, /^(?:```|~~~|\||<|#)/, `${item.id}: ${item.summary} — npm run build:mcp`)
  }
  assert.equal(manifest.snippets.find(s => s.id === 'boilerplate')?.kind, 'boilerplate')
  assert.equal(manifest.snippets.find(s => s.id === 'btn')?.kind, 'component')
})

test('생성물은 커밋 sha가 아니라 package.json version을 싣는다', () => {
  const version = JSON.parse(read('package.json')).version
  assert.equal(buildVersion(), version)
  assert.equal(JSON.parse(read('mcp/data/manifest.json')).version, version, 'npm run build:mcp')
  for (const file of ['references/krds-tokens.md', 'references/krds-components.md']) {
    const head = read(file).split('\n').slice(0, 8).join('\n')
    assert.ok(head.includes(`> 기준 버전: ${version}`), `${file} — npm run build:references`)
    assert.doesNotMatch(head, /> 빌드: /, `${file}에 빌드 sha 줄이 남아 있다`)
  }
  for (const file of ['scripts/build-mcp.js', 'scripts/build-references.js']) {
    assert.doesNotMatch(read(file), /rev-parse|child_process/, `${file}가 git sha를 읽는다`)
  }
})
