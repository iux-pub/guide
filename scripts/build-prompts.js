#!/usr/bin/env node

// build-prompts.js — AI 프롬프트 파일 자동 재생성 스크립트
// 입력: tokens/build/tokens.css (토큰), src/snippets/*.md (28컴포넌트 스니펫),
//       site/design/*.md (디자인 규칙), skill/references/* (KRDS 카탈로그)
// 출력: site/prompts/{design,components,context}.md (사람이 복붙)
//       prompts/{design-rules,design-audit}.md (스킬이 fetch)
//
// KRDS+Tailwind v4 시대 — SCSS 의존 일체 없음

const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const TOKENS_CSS = path.join(ROOT, 'tokens/build/tokens.css')
const SNIPPETS_DIR = path.join(ROOT, 'src/snippets')
const SITE_PROMPTS_DIR = path.join(ROOT, 'site/prompts')
const ROOT_PROMPTS_DIR = path.join(ROOT, 'prompts')
const DESIGN_DIR = path.join(ROOT, 'site/design')

// ─── 토큰 파싱 ────────────────────────────────────────

/**
 * tokens/build/tokens.css에서 :root 안의 CSS Custom Property를 추출한다.
 * @returns {Array<{name: string, value: string, comment: string}>}
 */
function parseTokensCss() {
  if (!fs.existsSync(TOKENS_CSS)) {
    console.warn(`[build-prompts] 경고: ${TOKENS_CSS} 없음. 'npm run build:tokens' 먼저 실행.`)
    return []
  }
  const content = fs.readFileSync(TOKENS_CSS, 'utf-8')
  const tokens = []
  const re = /^\s*(--[\w-]+):\s*([^;]+);\s*(?:\/\*\s*(.+?)\s*\*\/)?/gm
  let m
  while ((m = re.exec(content)) !== null) {
    tokens.push({ name: m[1], value: m[2].trim(), comment: (m[3] || '').trim() })
  }
  return tokens
}

/**
 * 토큰 배열을 마크다운 테이블로 변환한다.
 */
function tokensToTable(tokens, columns, rowFn, max = 30) {
  if (tokens.length === 0) return '_(토큰 없음 — npm run build:tokens 실행 필요)_'
  const head = '| ' + columns.join(' | ') + ' |'
  const sep = '|' + columns.map(() => '----').join('|') + '|'
  const sliced = max && tokens.length > max ? tokens.slice(0, max) : tokens
  const rows = sliced.map(t => '| ' + rowFn(t).join(' | ') + ' |')
  if (max && tokens.length > max) {
    rows.push(`| ... | (총 ${tokens.length}개, tokens/build/tokens.css 참조) |`)
  }
  return [head, sep, ...rows].join('\n')
}

// ─── 스니펫 파싱 ──────────────────────────────────────

/**
 * 스니펫 마크다운에서 제목·기본 마크업·variant 표·접근성 노트를 추출한다.
 * KRDS 스니펫 헤더 패턴(예: "## Variant (KRDS 정의 — 4종)", "## 접근성 (KRDS + WCAG 2.1 AA)")에 유연하게 매칭.
 */
function parseSnippet(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')

  const titleLine = lines.find(l => /^#\s+/.test(l))
  const title = titleLine ? titleLine.replace(/^#\s+/, '').trim() : path.basename(filePath, '.md')

  // 첫 ```html 코드 블록
  let markup = ''
  let inCode = false
  const codeLines = []
  for (const line of lines) {
    if (!inCode && line.startsWith('```html')) { inCode = true; continue }
    if (inCode && line.startsWith('```')) { markup = codeLines.join('\n'); break }
    if (inCode) codeLines.push(line)
  }

  // 첫 Variant/Size 표
  let variants = ''
  for (let i = 0; i < lines.length; i++) {
    if (/^##\s+(Variant|Size|Element|Variant 목록)/i.test(lines[i])) {
      const tableLines = []
      for (let j = i + 1; j < lines.length; j++) {
        if (lines[j].startsWith('|')) tableLines.push(lines[j])
        else if (tableLines.length > 0 && lines[j].trim() === '') break
        else if (tableLines.length === 0 && /^##/.test(lines[j])) break
      }
      if (tableLines.length > 0) { variants = tableLines.join('\n'); break }
    }
  }

  // 접근성 불릿
  let a11y = ''
  for (let i = 0; i < lines.length; i++) {
    if (/^##\s+접근성/.test(lines[i])) {
      const a11yLines = []
      for (let j = i + 1; j < lines.length; j++) {
        if (/^##\s/.test(lines[j])) break
        if (lines[j].startsWith('- ')) a11yLines.push(lines[j])
      }
      a11y = a11yLines.join('\n')
      break
    }
  }

  return { title, markup, variants, a11y }
}

/**
 * 스니펫 디렉토리를 스캔해 컴포넌트 이름 목록을 반환한다 (boilerplate 제외).
 */
function getComponentList() {
  return fs.readdirSync(SNIPPETS_DIR)
    .filter(f => f.endsWith('.md') && f !== 'boilerplate.md')
    .map(f => f.replace(/\.md$/, ''))
    .sort()
}

// ─── design.md 생성 (디자인 AI용 — Stitch/Galileo/Lovable/v0) ───

function buildDesignPrompt() {
  const tokens = parseTokensCss()
  const components = getComponentList()

  // INFOUX 공개 토큰 카테고리
  const primary = tokens.filter(t => /^--color-primary-\d+$/.test(t.name))
  const secondary = tokens.filter(t => /^--color-secondary-\d+$/.test(t.name))
  const gray = tokens.filter(t => /^--color-gray-\d+$/.test(t.name))
  const semantic = tokens.filter(t => /^--color-(success|warning|danger|info)-/.test(t.name))
  const text = tokens.filter(t => /^--color-text/.test(t.name))
  const bg = tokens.filter(t => /^--color-bg/.test(t.name))
  const border = tokens.filter(t => /^--color-border/.test(t.name))
  const font = tokens.filter(t => /^--font-/.test(t.name))

  // 컴포넌트 카탈로그 (KRDS 5그룹)
  const groups = {
    A: ['btn', 'check-radio', 'file-upload', 'form', 'select', 'switch'],
    B: ['accordion', 'card', 'disclosure', 'modal', 'side-panel', 'tab'],
    C: ['breadcrumb', 'header', 'main-menu', 'pagination'],
    D: ['alert', 'badge', 'progress', 'spinner', 'step-indicator', 'tag', 'toast', 'tooltip'],
    E: ['calendar', 'carousel', 'list', 'table']
  }
  const groupLabels = {
    A: '폼/액션', B: '컨테이너/레이아웃', C: '내비게이션', D: '피드백', E: '콘텐츠/표현'
  }
  const componentTable = Object.entries(groups).map(([k, names]) => {
    const valid = names.filter(n => components.includes(n))
    return `| ${k} — ${groupLabels[k]} | ${valid.map(n => `\`${n}\``).join(' · ')} |`
  }).join('\n')

  const promptContent = `# KRDS 원칙 + INFOMIND 디자인 AI 프롬프트

> **목적:** 디자인 AI 도구에서 KRDS(범정부 UI/UX 디자인 시스템)의 접근성·구조 원칙과 INFOMIND UX 실무 표준을 적용하기 위한 프롬프트
> **대상 AI:** Google Stitch, Galileo, Lovable, v0

---

## 핵심 원칙

- **색상은 CSS Custom Property(\`var(--token)\`) 사용.** 하드코딩 hex/rgb/hsl 금지
- **간격·크기·타이포 스케일은 CSS/Tailwind 직접값 사용.** CMS·관리자 화면은 정보 밀도에 맞게 조정
- **CSS는 표준 nesting + Tailwind v4 \`@apply\` 사용 가능**
- **모바일 터치 영역 ≥ 44×44px**
- **시맨틱 HTML + WCAG 2.1 AA 준수**
- **HTML 기본 골격은 \`header/main/footer\`, \`main > section > .container\` 패턴 유지**

---

## 색상 토큰 (INFOUX)

### Primary

${tokensToTable(primary, ['토큰', '값'], t => [`\`${t.name}\``, t.value], 12)}

### Secondary

${tokensToTable(secondary, ['토큰', '값'], t => [`\`${t.name}\``, t.value], 12)}

### Gray

${tokensToTable(gray, ['토큰', '값'], t => [`\`${t.name}\``, t.value], 12)}

### Semantic (success/warning/danger/info)

${tokensToTable(semantic, ['토큰', '값'], t => [`\`${t.name}\``, t.value], 30)}

---

## 시맨틱 토큰

컴포넌트 작성 시 의미 기반 \`--color-*\` 토큰을 우선 사용한다.

### Text

${tokensToTable(text, ['토큰', '값'], t => [`\`${t.name}\``, t.value], 20)}

### Background

${tokensToTable(bg, ['토큰', '값'], t => [`\`${t.name}\``, t.value], 20)}

### Border

${tokensToTable(border, ['토큰', '값'], t => [`\`${t.name}\``, t.value], 20)}

---

## 기본 폰트 토큰

${tokensToTable(font, ['토큰', '값'], t => [`\`${t.name}\``, t.value], 10)}

## 직접값 사용 범위

간격, 크기, 타이포 스케일, 반경, 그림자, 모션, z-index는 토큰화하지 않는다. Tailwind v4 \`@apply\`와 명확한 CSS 직접값으로 작성한다.

> 전체 토큰 카탈로그(상세 + 시맨틱 매핑) — \`skill/references/krds-tokens.md\`
> Tailwind v4 @theme 매핑 — \`skill/references/tailwind-mapping.md\`

---

## 브레이크포인트

| 해상도 | 범위 | 권장 시안 너비 |
|--------|------|--------------|
| 모바일 | 0 ~ 767px | 360px |
| 태블릿 | 768px ~ 1279px | 768px |
| PC | 1280px ~ | 1920px (콘텐츠 max-width: 1200px) |

KRDS 표준 브레이크포인트.

---

## 컴포넌트 카탈로그 (KRDS 기반)

| 그룹 | 컴포넌트 |
|------|---------|
${componentTable}

> 각 컴포넌트의 BEM·접근성·토큰 매핑 — \`skill/references/krds-components.md\`
> 마크업 스니펫 — \`src/snippets/{name}.md\`

## HTML 기본 골격

\`\`\`html
<header id="header">
  <div class="container">...</div>
</header>

<main id="main">
  <section class="section">
    <div class="container">...</div>
  </section>
</main>

<footer id="footer">
  <div class="container">...</div>
</footer>
\`\`\`

HTML 컴포넌트화는 페이지 전체가 아니라 \`main\` 내부의 section 단위로 분리한다.

---

## 접근성 핵심 규칙 (KWCAG/WCAG 2.1 AA)

1. **색상 대비** — 일반 텍스트 4.5:1 이상, 큰 텍스트(24px 이상 또는 18.67px bold) 3:1 이상
2. **터치 영역** — 인터랙티브 요소 최소 44×44px (KRDS 모바일 권장 medium=48px)
3. **포커스 표시** — \`:focus-visible\` 4px primary 외곽선 + 2px offset (reset.css 전역 관리)
4. **건너뛰기 링크** — body 최상단 \`<a href="#main-content" class="skip-to-content">본문 바로가기</a>\`
5. **이미지** — \`alt\` 필수. 장식용은 \`alt=""\`
6. **폼** — \`<label for>\` + \`id\` 연결 필수
7. **모달** — \`role="dialog"\` + 포커스 트랩 + \`aria-labelledby\`
8. **시맨틱 HTML** — \`<button>\`/\`<a>\` 사용. \`div\`/ \`span\`에 직접 클릭 핸들러를 붙이는 패턴 금지

---

## 절대 금지

- Raw hex/rgb/hsl 색상
- Tailwind 기본 팔레트 raw 컬러 유틸
- 옛 버튼 variant 이름
- \`!important\` (사유 주석 없을 시)
- 인라인 \`style="..."\` (CSS 변수 주입 외)
- 기존 인포마인드 HTML 골격을 무시한 임의 구조
- \`:focus { outline: none }\`
- \`div\`/ \`span\` 클릭 핸들러 패턴
- 이미지 \`alt\` 누락, 폼 \`<label>\` 누락
`

  return `---
title: 디자인 AI 프롬프트
order: 2
---

## 대상 AI 도구

Google Stitch, Galileo, Lovable, v0

## 사용법

아래 내용을 복사하여 AI 도구의 시스템 프롬프트(또는 첫 메시지)에 붙여넣는다.

## 프롬프트

\`\`\`\`markdown
${promptContent}
\`\`\`\`
`
}

// ─── components.md 생성 (마크업 AI용 — Cursor/Copilot/Claude Code) ───

function buildComponentsPrompt() {
  const components = getComponentList()

  const sections = components.map((name, idx) => {
    const snippet = parseSnippet(path.join(SNIPPETS_DIR, `${name}.md`))
    let section = `## ${idx + 1}. ${snippet.title}\n\n### 기본 마크업\n\n\`\`\`html\n${snippet.markup}\n\`\`\``
    if (snippet.variants) {
      section += `\n\n### Variant / Size\n\n${snippet.variants}`
    }
    if (snippet.a11y) {
      section += `\n\n### 접근성\n\n${snippet.a11y}`
    }
    return section
  })

  const promptContent = `# INFOMIND 컴포넌트 스니펫 프롬프트

> **목적:** AI 도구에 INFOMIND 컴포넌트 HTML 마크업과 접근성 패턴을 제공하기 위한 프롬프트
> **대상 AI:** Cursor, Copilot, Windsurf, Claude Code, ChatGPT, v0

> 기존 카탈로그 패턴을 우선 사용한다. 카탈로그 밖 패턴은 프로젝트 필요성과 공통화 가능성을 판단해 확장한다.

---

${sections.join('\n\n---\n\n')}
`

  return `---
title: 컴포넌트 스니펫 프롬프트
order: 5
---

## 대상 AI 도구

Cursor, Copilot, Windsurf, Claude Code, ChatGPT, v0

## 사용법

아래 내용을 복사하여 AI 도구의 시스템 프롬프트(또는 첫 메시지)에 붙여넣는다.

## 프롬프트

\`\`\`\`markdown
${promptContent}
\`\`\`\`
`
}

// ─── context.md 생성 (대화형 AI용 — Claude/GPT/Gemini 웹) ───

function buildContextPrompt() {
  const components = getComponentList()
  const groups = {
    A: ['btn', 'check-radio', 'file-upload', 'form', 'select', 'switch'],
    B: ['accordion', 'card', 'disclosure', 'modal', 'side-panel', 'tab'],
    C: ['breadcrumb', 'header', 'main-menu', 'pagination'],
    D: ['alert', 'badge', 'progress', 'spinner', 'step-indicator', 'tag', 'toast', 'tooltip'],
    E: ['calendar', 'carousel', 'list', 'table']
  }
  const componentLines = Object.entries(groups).map(([k, names]) => {
    const valid = names.filter(n => components.includes(n))
    const groupLabel = { A: '폼/액션', B: '컨테이너', C: '내비', D: '피드백', E: '콘텐츠' }[k]
    return `- **${groupLabel}** — ${valid.join(', ')}`
  }).join('\n')

  const promptContent = `# KRDS 원칙 + INFOMIND UX 디자인 시스템 컨텍스트

> **목적:** 대화형 AI에 KRDS 접근성·구조 원칙과 INFOMIND 디자인/퍼블리싱 규칙을 압축 제공
> **대상 AI:** ChatGPT, Gemini, Claude 웹

---

## 기술 스택

- **CSS Framework:** Tailwind v4 (\`^4.0.0\`) — \`@import "tailwindcss"\`
- **Tokens:** INFOUX foundation — 출력은 \`tokens/build/tokens.css\` (\`@theme\` + CSS Custom Properties)
- **방법론:** ITCSS 5-layer + BEM (5-objects · 6-components 한정)
- **CSS 작성:** 표준 CSS nesting + Tailwind v4 \`@apply\` 허용

> SCSS는 사용 금지(R-03). 표준 CSS nesting과 Tailwind v4 문법을 사용한다.

## 디자인 토큰

색상과 기본 폰트는 CSS Custom Properties(\`var(--token)\`)를 사용하라. 간격·크기·타이포 스케일은 CSS/Tailwind 직접값을 사용한다.

- **색상** (\`--color-*\`) — 의미 기반 토큰
- **폰트** (\`--font-sans\`, \`--font-mono\`) — 전역 기본 폰트

> 전체 토큰 카탈로그 — \`skill/references/krds-tokens.md\`

## 컴포넌트 (KRDS 기반)

${componentLines}

> 각 컴포넌트의 BEM·접근성·토큰 매핑 — \`skill/references/krds-components.md\`

## HTML 기본 골격

\`\`\`html
<header id="header">
  <div class="container">...</div>
</header>

<main id="main">
  <section class="section">
    <div class="container">...</div>
  </section>
</main>

<footer id="footer">
  <div class="container">...</div>
</footer>
\`\`\`

HTML 컴포넌트화는 페이지 전체가 아니라 \`main\` 내부의 section 단위로 분리한다.

## 접근성 (KWCAG/WCAG 2.1 AA)

- 색상 대비 4.5:1 이상, 큰 텍스트 3:1 이상 (KRDS 토큰은 AA 통과 조합)
- 터치 영역 ≥ 44×44px (모바일 권장 medium=48px)
- \`:focus-visible\` 4px primary 외곽선 (reset.css 전역 관리 — 컴포넌트에서 제거 금지)
- 페이지 최상단 \`<a href="#main-content" class="skip-to-content">본문 바로가기</a>\`
- 이미지 \`alt\` 필수, 폼 \`<label for>\` + \`id\` 필수
- \`role="dialog"\` + 포커스 트랩 (모달)

## 반응형

- **모바일 퍼스트** 접근
- CSS \`@media\` 또는 Tailwind v4 반응형 variant 직접 사용 (SCSS 믹스인 폐지)

## 절대 금지

- SCSS 파일/\`@use\`/\`@forward\`/SCSS 변수
- Raw hex/rgb/hsl 색상
- Tailwind 기본 팔레트 raw 컬러 유틸
- 옛 버튼 variant 이름
- 기존 인포마인드 HTML 골격을 무시한 임의 구조
- BEM element 2단계 중첩
- 포커스 외곽선 제거, \`div\`/ \`span\` 클릭 핸들러 패턴
- 이미지 \`alt\` 누락, 폼 \`<label>\` 누락

## 코딩 스타일

- 들여쓰기 2 spaces, single quote, 주석 한국어
- 세미콜론: CSS 사용, JS/HTML 미사용
`

  return `---
title: 대화형 AI 컨텍스트
order: 6
---

## 대상 AI 도구

ChatGPT, Gemini, Claude 웹

## 사용법

아래 내용을 복사하여 AI 도구의 시스템 프롬프트(또는 첫 메시지)에 붙여넣는다.

## 프롬프트

\`\`\`\`markdown
${promptContent}
\`\`\`\`
`
}

// ─── prompts/ root 출력 (스킬 fetch용) ───

function cleanMarkdown(content) {
  let cleaned = content.replace(/^---[\s\S]*?---\n/, '')
  cleaned = cleaned.replace(/^## 관련 문서[\s\S]*?(?=\n## |\n# |$)/m, '')
  cleaned = cleaned.replace(/<[^>]+>/g, '')
  cleaned = cleaned.replace(/^- \[.*?\]\(\/.*?\).*$/gm, '')
  cleaned = cleaned.replace(/\[([^\]]+)\]\(\/[^)]+\)/g, '$1')
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n')
  return cleaned.trim()
}

function readSorted(dir) {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.md') && f !== 'index.md')
    .map(f => {
      const content = fs.readFileSync(path.join(dir, f), 'utf-8')
      const orderMatch = content.match(/^order:\s*(\d+)/m)
      const titleMatch = content.match(/^title:\s*(.+)/m)
      return {
        file: f,
        order: orderMatch ? parseInt(orderMatch[1]) : 99,
        title: titleMatch ? titleMatch[1].trim() : f,
        content
      }
    })
    .sort((a, b) => a.order - b.order)
}

function buildDesignRules() {
  const files = readSorted(DESIGN_DIR).filter(f => f.file !== 'design-audit.md')

  const sections = files.map(f => {
    const cleaned = cleanMarkdown(f.content)
    const text = cleaned.replace(/```[\s\S]*?```/g, '')
    const doDontMatch = text.match(/## Do \/ Don't[\s\S]*?(?=\n## |\n# |$)/m)

    const smallTables = []
    const tableRegex = /(\|[^\n]+\n\|[-| ]+\n(?:\|[^\n]+\n){1,8})/g
    let m
    while ((m = tableRegex.exec(text)) !== null) smallTables.push(m[1].trim())

    const ruleLines = text.split('\n').filter(l =>
      /^- .*(금지|필수|않는다|안 된다|사용하지|제공한다|준수|확보)/.test(l)
    )

    let section = `## ${f.title}\n\n`
    if (ruleLines.length > 0) section += ruleLines.slice(0, 10).join('\n') + '\n\n'
    if (doDontMatch) section += doDontMatch[0].trim() + '\n\n'
    if (!doDontMatch && smallTables.length > 0) section += smallTables[0] + '\n\n'
    section += `> 상세: site/design/${f.file}\n`
    return section
  }).join('\n\n---\n\n')

  return `# 디자인 규칙

> 핵심 규칙만 압축. 상세 내용은 각 섹션의 원본 파일을 참조하라.

${sections}
`
}

function buildDesignAudit() {
  const filePath = path.join(DESIGN_DIR, 'design-audit.md')
  if (!fs.existsSync(filePath)) {
    return `# 디자인 감사 체크리스트\n\n_(site/design/design-audit.md 없음)_\n`
  }
  const content = fs.readFileSync(filePath, 'utf-8')
  const cleaned = cleanMarkdown(content)
  const quick5Match = cleaned.match(/## Quick 5[\s\S]*/)

  const categories = []
  const lines = cleaned.split('\n')
  let current = null
  for (const line of lines) {
    const heading = line.match(/^### (\d+)\. (.+)/)
    if (heading) {
      if (current) categories.push(current)
      current = { title: `${heading[1]}. ${heading[2]}`, items: [] }
      continue
    }
    if (current && line.startsWith('- [ ]')) current.items.push(line)
    if (line.startsWith('## Quick 5')) break
  }
  if (current) categories.push(current)

  const categoryText = categories.map(c => `### ${c.title}\n\n${c.items.join('\n')}`).join('\n\n')

  return `# 디자인 감사 체크리스트

> 17개 카테고리 기반 디자인 품질 평가.
> 100점 시작, Critical -8 / Warning -4 / Tip -1.

## 점수 기준

| 점수 | 판정 |
|------|------|
| 90~100 | 출시 가능 |
| 70~89 | 소폭 수정 |
| 50~69 | 보완 필요 |
| 50 미만 | 재작업 |

${categoryText}

${quick5Match ? quick5Match[0] : ''}
`
}

// ─── 메인 ──────────────────────────────────────────────

function main() {
  console.log('[build-prompts] 프롬프트 파일 재생성 시작...')

  if (!fs.existsSync(SITE_PROMPTS_DIR)) fs.mkdirSync(SITE_PROMPTS_DIR, { recursive: true })
  if (!fs.existsSync(ROOT_PROMPTS_DIR)) fs.mkdirSync(ROOT_PROMPTS_DIR, { recursive: true })

  fs.writeFileSync(path.join(SITE_PROMPTS_DIR, 'design.md'), buildDesignPrompt(), 'utf-8')
  console.log('  site/prompts/design.md 생성 완료')

  fs.writeFileSync(path.join(SITE_PROMPTS_DIR, 'components.md'), buildComponentsPrompt(), 'utf-8')
  console.log('  site/prompts/components.md 생성 완료')

  fs.writeFileSync(path.join(SITE_PROMPTS_DIR, 'context.md'), buildContextPrompt(), 'utf-8')
  console.log('  site/prompts/context.md 생성 완료')

  fs.writeFileSync(path.join(ROOT_PROMPTS_DIR, 'design-rules.md'), buildDesignRules(), 'utf-8')
  console.log('  prompts/design-rules.md 생성 완료')

  fs.writeFileSync(path.join(ROOT_PROMPTS_DIR, 'design-audit.md'), buildDesignAudit(), 'utf-8')
  console.log('  prompts/design-audit.md 생성 완료')

  console.log('[build-prompts] 완료!')
}

main()
