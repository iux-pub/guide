/**
 * 규칙 빌드 스크립트
 * rules.json → CLAUDE.md 규칙 섹션 + site/conventions/ 페이지 생성
 *
 * 사용법: node scripts/build-rules.js
 */

const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const RULES_PATH = path.join(ROOT, 'rules.json')
const CLAUDE_PATH = path.join(ROOT, 'CLAUDE.md')
const CONVENTIONS_DIR = path.join(ROOT, 'site', 'conventions')

const { categories, rules } = JSON.parse(fs.readFileSync(RULES_PATH, 'utf-8'))

const SEVERITY_LABEL = { error: '`error`', warning: '`warn`', info: '`info`' }
const START = '<!-- RULES_START -->'
const END = '<!-- RULES_END -->'

// ── 헬퍼 ──────────────────────────────────────────────────────────────

function rulesByCategory(categoryId) {
  return rules.filter(r => r.category === categoryId)
}

function severityBadge(s) {
  return SEVERITY_LABEL[s] || s
}

/** 코드 블록 생성 (lang 자동 감지) */
function codeBlock(examples, lang) {
  if (!examples || examples.length === 0) return ''
  const lines = examples.map(e => e.note ? `${e.code}   // ${e.note}` : e.code)
  return '```' + lang + '\n' + lines.join('\n') + '\n```'
}

// ── 1. CLAUDE.md 규칙 섹션 생성 ────────────────────────────────────

function buildClaudeSection() {
  const lines = []

  for (const cat of categories) {
    const catRules = rulesByCategory(cat.id)
    if (catRules.length === 0) continue
    lines.push(`### ${cat.title}`)
    for (const r of catRules) {
      lines.push(`- ${r.id} ${severityBadge(r.severity)} — ${r.summary}`)
    }
    lines.push('')
  }

  return lines.join('\n').trimEnd()
}

function updateClaudeMd() {
  const content = fs.readFileSync(CLAUDE_PATH, 'utf-8')
  const si = content.indexOf(START)
  const ei = content.indexOf(END)

  if (si === -1 || ei === -1) {
    console.log('  CLAUDE.md: RULES_START/RULES_END 마커 없음 — 건너뜀')
    return
  }

  const section = buildClaudeSection()
  const updated =
    content.substring(0, si + START.length) +
    '\n' + section + '\n' +
    content.substring(ei)

  fs.writeFileSync(CLAUDE_PATH, updated)
  console.log('  CLAUDE.md 규칙 섹션 갱신 완료')
}

// ── 2. 컨벤션 페이지 생성 ──────────────────────────────────────────

function buildConventionPage(cat) {
  const catRules = rulesByCategory(cat.id)
  if (catRules.length === 0) return

  const lang = cat.lang || 'scss'
  const lines = []

  // 프론트매터
  lines.push('---')
  lines.push(`title: ${cat.title}`)
  lines.push(`order: ${cat.order}`)
  lines.push('---')
  lines.push('')
  lines.push('<!-- 자동 생성 — rules.json에서 생성됨. 직접 수정 금지. npm run build:rules로 갱신. -->')
  lines.push('')
  lines.push(cat.description)
  lines.push('')

  // 규칙 요약 테이블
  lines.push('## 규칙 요약')
  lines.push('')
  lines.push('| ID | 규칙 | 심각도 | 검증 |')
  lines.push('|----|------|--------|------|')
  for (const r of catRules) {
    const enforcement = (r.enforcement || []).join(', ')
    lines.push(`| ${r.id} | ${r.summary} | ${r.severity} | ${enforcement} |`)
  }
  lines.push('')
  lines.push('---')
  lines.push('')

  // 규칙별 상세
  for (const r of catRules) {
    const ruleLang = r.lang || lang
    lines.push(`## ${r.id} — ${r.summary}`)
    lines.push('')

    const severityMap = { error: '🔴 error', warning: '🟡 warning', info: '🔵 info' }
    const enforcementStr = (r.enforcement || []).join(' · ')
    lines.push(`**심각도:** ${severityMap[r.severity] || r.severity} &nbsp; **검증:** ${enforcementStr}`)
    lines.push('')

    if (r.rationale) {
      lines.push(`> ${r.rationale}`)
      lines.push('')
    }

    if (r.bad && r.bad.length > 0) {
      lines.push('**❌ 금지**')
      lines.push('')
      lines.push(codeBlock(r.bad, ruleLang))
      lines.push('')
    }

    if (r.good && r.good.length > 0) {
      lines.push('**✅ 올바른 형식**')
      lines.push('')
      lines.push(codeBlock(r.good, ruleLang))
      lines.push('')
    }

    if (r.refs && r.refs.length > 0) {
      lines.push(`**참고:** ${r.refs.join(', ')}`)
      lines.push('')
    }

    lines.push('---')
    lines.push('')
  }

  const outPath = path.join(CONVENTIONS_DIR, `${cat.slug}.md`)
  fs.writeFileSync(outPath, lines.join('\n'))
  console.log(`  site/conventions/${cat.slug}.md 생성 완료`)
}

// ── 3. conventions/index.md 규칙 테이블 갱신 ──────────────────────

const INDEX_START = '<!-- RULES_TABLE_START -->'
const INDEX_END = '<!-- RULES_TABLE_END -->'

function updateConventionsIndex() {
  const indexPath = path.join(CONVENTIONS_DIR, 'index.md')
  if (!fs.existsSync(indexPath)) return

  const content = fs.readFileSync(indexPath, 'utf-8')
  const si = content.indexOf(INDEX_START)
  const ei = content.indexOf(INDEX_END)
  if (si === -1 || ei === -1) return

  const lines = []
  lines.push('')
  lines.push('| ID | 규칙 | 심각도 | 카테고리 |')
  lines.push('|----|------|--------|----------|')
  for (const r of rules) {
    const cat = categories.find(c => c.id === r.category)
    const catLink = cat ? `[${cat.title}](/conventions/${cat.slug}/)` : r.category
    lines.push(`| ${r.id} | ${r.summary} | ${r.severity} | ${catLink} |`)
  }
  lines.push('')

  const updated =
    content.substring(0, si + INDEX_START.length) +
    lines.join('\n') +
    content.substring(ei)

  fs.writeFileSync(indexPath, updated)
  console.log('  site/conventions/index.md 규칙 테이블 갱신 완료')
}

// ── 실행 ──────────────────────────────────────────────────────────

console.log('규칙 빌드 시작...')

updateClaudeMd()

for (const cat of categories) {
  buildConventionPage(cat)
}

updateConventionsIndex()

console.log('규칙 빌드 완료!')
