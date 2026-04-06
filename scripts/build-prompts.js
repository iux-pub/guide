#!/usr/bin/env node

// build-prompts.js — AI 프롬프트 파일 자동 재생성 스크립트
// SCSS 토큰 파일과 스니펫 마크다운에서 데이터를 추출하여
// site/prompts/{design,components,context}.md 를 재생성한다.

const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const SETTINGS_DIR = path.join(ROOT, 'src/scss/1-settings')
const SNIPPETS_DIR = path.join(ROOT, 'src/snippets')
const PROMPTS_DIR = path.join(ROOT, 'site/prompts')

// ─── SCSS 토큰 파싱 ───

/**
 * SCSS 파일에서 CSS Custom Properties를 추출한다.
 * @param {string} filePath - SCSS 파일 경로
 * @returns {Array<{name: string, value: string, comment: string}>}
 */
function parseTokens(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')
  const tokens = []
  const lines = content.split('\n')

  for (const line of lines) {
    // --token-name: value; 패턴 매칭
    const match = line.match(/^\s*(--[\w-]+):\s*(.+?)\s*;(.*)$/)
    if (match) {
      const comment = match[3].replace(/\/\/\s*/, '').trim()
      tokens.push({
        name: match[1],
        value: match[2].trim(),
        comment
      })
    }
  }

  return tokens
}

/**
 * 토큰 배열을 마크다운 테이블로 변환한다.
 * @param {Array} tokens
 * @param {Array<string>} columns - 컬럼 정의 ['토큰', '값', '용도'] 등
 * @param {Function} rowFn - 토큰을 행 배열로 변환하는 함수
 */
function tokensToTable(tokens, columns, rowFn) {
  const header = '| ' + columns.join(' | ') + ' |'
  const separator = '|' + columns.map(() => '----').join('|') + '|'
  const rows = tokens.map(t => '| ' + rowFn(t).join(' | ') + ' |')
  return [header, separator, ...rows].join('\n')
}

// ─── 스니펫 파싱 ───

/**
 * 스니펫 마크다운에서 기본 마크업(첫 번째 코드 블록)과 Variant 테이블을 추출한다.
 * @param {string} filePath
 * @returns {{title: string, markup: string, variants: string, a11y: string}}
 */
function parseSnippet(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')

  // 제목 추출 (첫 번째 # 라인)
  const titleLine = lines.find(l => /^#\s+/.test(l))
  const title = titleLine ? titleLine.replace(/^#\s+/, '').trim() : path.basename(filePath, '.md')

  // 기본 마크업 추출 (## 기본 마크업 다음 첫 코드 블록)
  let markup = ''
  let inBasicSection = false
  let inCodeBlock = false
  let codeLines = []

  for (const line of lines) {
    if (/^##\s+기본 마크업/.test(line)) {
      inBasicSection = true
      continue
    }
    if (inBasicSection && !inCodeBlock && line.startsWith('```html')) {
      inCodeBlock = true
      continue
    }
    if (inBasicSection && inCodeBlock && line.startsWith('```')) {
      markup = codeLines.join('\n')
      inBasicSection = false
      inCodeBlock = false
      break
    }
    if (inCodeBlock) {
      codeLines.push(line)
    }
  }

  // Variant 테이블 추출 (## Variant 목록 다음 테이블)
  let variants = ''
  let inVariantSection = false
  let variantLines = []

  for (const line of lines) {
    if (/^##\s+Variant 목록/.test(line)) {
      inVariantSection = true
      continue
    }
    if (inVariantSection) {
      // 테이블 행 또는 빈 줄
      if (line.startsWith('|')) {
        variantLines.push(line)
      } else if (variantLines.length > 0 && !line.trim()) {
        // 테이블 끝
        break
      } else if (variantLines.length > 0 && /^###/.test(line)) {
        break
      }
    }
  }

  // 첫 컬럼 헤더에서 'Variant' 또는 'Element/Variant' 등을 '클래스'+'용도'로 간소화
  if (variantLines.length >= 2) {
    // 테이블이 3컬럼이면 첫 컬럼(이름)을 제거하고 클래스+용도만 남긴다
    const headerCells = variantLines[0].split('|').map(c => c.trim()).filter(Boolean)
    if (headerCells.length === 3) {
      // 3컬럼 -> 클래스+용도만 추출
      const simplified = variantLines.map(line => {
        const cells = line.split('|').map(c => c.trim()).filter(Boolean)
        if (cells.length >= 3) {
          return `| ${cells[1]} | ${cells[2]} |`
        }
        // 구분자 행
        if (line.includes('---')) {
          return '|--------|------|'
        }
        return line
      })
      variants = simplified.join('\n')
    } else {
      variants = variantLines.join('\n')
    }
  }

  // 접근성 주의사항 추출
  let a11y = ''
  let inA11ySection = false
  let a11yLines = []

  for (const line of lines) {
    if (/^##\s+접근성 주의사항/.test(line)) {
      inA11ySection = true
      continue
    }
    if (inA11ySection) {
      if (/^##\s/.test(line) && !/^###/.test(line)) {
        break
      }
      if (line.startsWith('- ')) {
        a11yLines.push(line)
      }
    }
  }
  a11y = a11yLines.join('\n')

  return { title, markup, variants, a11y }
}

// ─── design.md 생성 ───

function buildDesignPrompt() {
  const colorTokens = parseTokens(path.join(SETTINGS_DIR, '_tokens-color.scss'))
  const typoTokens = parseTokens(path.join(SETTINGS_DIR, '_tokens-typography.scss'))
  const spacingTokens = parseTokens(path.join(SETTINGS_DIR, '_tokens-spacing.scss'))
  const miscTokens = parseTokens(path.join(SETTINGS_DIR, '_tokens-misc.scss'))

  // 색상 토큰 그룹핑
  const primary = colorTokens.filter(t => t.name.startsWith('--color-primary'))
  const gray = colorTokens.filter(t => t.name.startsWith('--color-gray'))
  const semantic = colorTokens.filter(t => ['--color-danger', '--color-warning', '--color-success', '--color-info'].includes(t.name))
  const text = colorTokens.filter(t => t.name.startsWith('--color-text'))
  const bg = colorTokens.filter(t => t.name.startsWith('--color-bg'))
  const border = colorTokens.filter(t => t.name.startsWith('--color-border'))
  const basic = colorTokens.filter(t => ['--color-white', '--color-black'].includes(t.name))

  // 타이포 그룹핑
  const fontFamily = typoTokens.filter(t => t.name.includes('font-family'))
  const fontSize = typoTokens.filter(t => t.name.includes('font-size'))
  const fontWeight = typoTokens.filter(t => t.name.includes('font-weight'))
  const leading = typoTokens.filter(t => t.name.includes('leading'))

  // 기타 그룹핑
  const radius = miscTokens.filter(t => t.name.includes('radius'))
  const shadow = miscTokens.filter(t => t.name.includes('shadow'))

  // 스니펫에서 컴포넌트 BEM 구조 추출
  const snippetFiles = ['btn', 'form', 'card', 'table', 'modal', 'tab', 'pagination', 'breadcrumb']
  const componentSections = snippetFiles.map(name => {
    const snippet = parseSnippet(path.join(SNIPPETS_DIR, `${name}.md`))
    // 간결한 BEM 클래스 목록 생성
    const variantLines = snippet.variants ? snippet.variants.split('\n').filter(l => l.startsWith('|') && !l.includes('---') && !l.includes('클래스')) : []
    const classes = variantLines.map(l => {
      const cells = l.split('|').map(c => c.trim()).filter(Boolean)
      if (cells.length >= 2) {
        const cls = cells[0].replace(/`/g, '').trim()
        const desc = cells[1].trim()
        return `${cls.padEnd(24)}-- ${desc}`
      }
      return null
    }).filter(Boolean)

    const blockName = name === 'btn' ? 'btn' : name
    const koreanName = snippet.title.replace(/\s*\(.*\)/, '')
    return `### ${koreanName} (${blockName})\n\n\`\`\`\n${classes.join('\n')}\n\`\`\``
  }).join('\n\n')

  // 프롬프트 조립
  const promptContent = `# 디자인 AI 프롬프트

> **목적:** 디자인 AI 도구에서 인포마인드 UX팀 디자인 시스템 규칙을 적용하기 위한 프롬프트
> **대상 AI:** Google Stitch, Galileo, Lovable, v0

---

## 색상 토큰

### Primary (프로젝트별 오버라이드 가능)

${tokensToTable(primary, ['토큰', '값', '용도'], t => [`\`${t.name}\``, t.value, t.comment || (t.name.includes('light') ? '밝은 브랜드 색상' : t.name.includes('dark') ? '어두운 브랜드 색상' : '기본 브랜드 색상')])}

### Gray 스케일

${tokensToTable(gray, ['토큰', '값'], t => [`\`${t.name}\``, t.value])}

### Semantic (KRDS 기준)

${tokensToTable(semantic, ['토큰', '값', '용도'], t => {
    const usageMap = {
      '--color-danger': '에러, 삭제',
      '--color-warning': '경고',
      '--color-success': '성공, 완료',
      '--color-info': '정보'
    }
    return [`\`${t.name}\``, t.value, usageMap[t.name] || '']
  })}

### Text

${tokensToTable(text, ['토큰', '값', '용도'], t => {
    const usageMap = {
      '--color-text': '본문 텍스트',
      '--color-text-secondary': '보조 텍스트',
      '--color-text-disabled': '비활성 텍스트'
    }
    return [`\`${t.name}\``, t.value, usageMap[t.name] || '']
  })}

### Background

${tokensToTable(bg, ['토큰', '값', '용도'], t => {
    const usageMap = {
      '--color-bg': '기본 배경',
      '--color-bg-secondary': '보조 배경'
    }
    return [`\`${t.name}\``, t.value, usageMap[t.name] || '']
  })}

### Border

${tokensToTable(border, ['토큰', '값', '용도'], t => {
    const usageMap = {
      '--color-border': '기본 테두리',
      '--color-border-light': '밝은 테두리'
    }
    return [`\`${t.name}\``, t.value, usageMap[t.name] || '']
  })}

### 기본

${tokensToTable(basic, ['토큰', '값'], t => [`\`${t.name}\``, t.value])}

---

## 타이포그래피 토큰

### 폰트

- 기본 폰트: \`${fontFamily.length ? fontFamily[0].value : "'Pretendard GOV', 'Malgun Gothic', 'apple sd gothic neo', sans-serif"}\`
- 62.5% REM 트릭 적용: \`html { font-size: 62.5% }\` -- 1rem = 10px

### 폰트 크기

${tokensToTable(fontSize, ['토큰', 'rem', 'px'], t => {
    const pxMatch = t.comment.match(/(\d+px)/)
    return [`\`${t.name}\``, t.value, pxMatch ? pxMatch[1] : '']
  })}

### 폰트 굵기

${tokensToTable(fontWeight, ['토큰', '값'], t => [`\`${t.name}\``, t.value])}

### 줄 간격

${tokensToTable(leading, ['토큰', '값'], t => [`\`${t.name}\``, t.value])}

---

## 간격 토큰

4px 기반 스케일. 이 스케일에 없는 값(5px, 10px, 15px, 20px, 30px)을 사용하지 않는다.

${tokensToTable(spacingTokens, ['토큰', 'px'], t => {
    const pxMatch = t.comment.match(/(\d+px)/)
    return [`\`${t.name}\``, pxMatch ? pxMatch[1] : '']
  })}

---

## 기타 토큰

### Border Radius

${tokensToTable(radius, ['토큰', '값'], t => [`\`${t.name}\``, t.value])}

### Box Shadow

${tokensToTable(shadow, ['토큰', '값'], t => [`\`${t.name}\``, t.value])}

---

## 브레이크포인트

| 해상도 | 범위 | 기본 시안 너비 |
|----|----|----|
| 모바일 | 0 ~ 767px | 360px |
| 태블릿 | 768px ~ 1279px | 768px |
| PC | 1280px ~ | 1920px (콘텐츠 max-width: 1200px) |

### 그리드

| 해상도 | 컬럼 | 거터 | 좌우 여백 |
|----|----|----|----------|
| 모바일 | 4 | 16px | 16px |
| 태블릿 | 12 | 24px | 24px |
| PC | 12 | 24px | 40px (max-width: 1200px) |

---

## 컴포넌트 구조

${componentSections}

---

## 접근성 핵심 규칙

1. **색상 대비:** 일반 텍스트 4.5:1 이상, 큰 텍스트(24px/18px bold) 3:1 이상을 유지하라
2. **터치 영역:** 모든 인터랙티브 요소의 최소 터치 영역은 44px x 44px을 보장하라
3. **포커스 표시:** \`focus-visible\` 스타일을 제공하라 -- \`outline: 2px solid var(--color-primary); outline-offset: 2px\`
4. **건너뛰기 링크:** 페이지 최상단에 \`<a href="#main-content" class="skip-to-content">본문 바로가기</a>\`를 제공하라
5. **대체 텍스트:** 이미지에 \`alt\` 속성을 필수로 제공하라. 장식용은 \`alt=""\`을 사용하라
6. **레이블:** 인터랙티브 요소에 \`aria-label\` 또는 텍스트 레이블을 필수로 제공하라`

  const output = `---
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

  return output
}

// ─── components.md 생성 ───

function buildComponentsPrompt() {
  const snippetFiles = ['btn', 'form', 'card', 'table', 'modal', 'tab', 'pagination', 'breadcrumb']

  const sections = snippetFiles.map((name, idx) => {
    const snippet = parseSnippet(path.join(SNIPPETS_DIR, `${name}.md`))

    let section = `## ${idx + 1}. ${snippet.title}\n\n### 기본 마크업\n\n\`\`\`html\n${snippet.markup}\n\`\`\``

    if (snippet.variants) {
      section += `\n\n### Variant\n\n${snippet.variants}`
    }

    // 에러 상태 마크업 추가 (form만)
    if (name === 'form') {
      section += `\n\n### 에러 상태 마크업\n\n\`\`\`html
<div class="form__group">
  <label for="password" class="form__label form__label--required">비밀번호</label>
  <input type="password" id="password" class="form__input form__input--error"
         aria-invalid="true" aria-describedby="password-error" required>
  <span id="password-error" class="form__message form__message--error" role="alert">
    비밀번호는 8자 이상이어야 합니다.
  </span>
</div>\n\`\`\``
    }

    if (snippet.a11y) {
      section += `\n\n### 접근성\n\n${snippet.a11y}`
    }

    return section
  })

  const promptContent = `# 컴포넌트 스니펫 프롬프트

> **목적:** AI 도구에 인포마인드 UX팀 컴포넌트 HTML 마크업과 접근성 패턴을 제공하기 위한 프롬프트
> **대상 AI:** Cursor, Copilot, Windsurf, Claude Code, ChatGPT, v0

---

${sections.join('\n\n---\n\n')}`

  const output = `---
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

  return output
}

// ─── context.md 생성 ───

function buildContextPrompt() {
  const colorTokens = parseTokens(path.join(SETTINGS_DIR, '_tokens-color.scss'))
  const typoTokens = parseTokens(path.join(SETTINGS_DIR, '_tokens-typography.scss'))
  const spacingTokens = parseTokens(path.join(SETTINGS_DIR, '_tokens-spacing.scss'))
  const miscTokens = parseTokens(path.join(SETTINGS_DIR, '_tokens-misc.scss'))

  // 토큰 요약: 컴팩트하게
  const primaryColor = colorTokens.find(t => t.name === '--color-primary')
  const fontSizes = typoTokens.filter(t => t.name.includes('font-size'))
  const fontSizeRange = fontSizes.length ? `${fontSizes[fontSizes.length - 1].comment.match(/\d+/)?.[0] || '12'}~${fontSizes[0].comment.match(/\d+/)?.[0] || '32'}px` : '12~32px'

  const spacingSummary = spacingTokens.map(t => {
    const px = t.comment.match(/(\d+)/)?.[1] || ''
    return px
  }).filter(Boolean).join('/')

  const radiusTokens = miscTokens.filter(t => t.name.includes('radius'))
  const radiusSummary = radiusTokens.map(t => {
    const val = t.value.replace('px', '')
    return val
  }).join('/')

  // 컴포넌트 요약 테이블
  const snippetFiles = ['btn', 'form', 'card', 'table', 'modal', 'tab', 'pagination', 'breadcrumb']
  const componentRows = snippetFiles.map(name => {
    const snippet = parseSnippet(path.join(SNIPPETS_DIR, `${name}.md`))
    const koreanName = snippet.title.replace(/\s*\(.*\)/, '')
    const blockName = `.${name === 'btn' ? 'btn' : name}`

    // 주요 modifier/element 추출
    const variantLines = snippet.variants ? snippet.variants.split('\n').filter(l => l.startsWith('|') && !l.includes('---') && !l.includes('클래스')) : []
    const classes = variantLines.map(l => {
      const cells = l.split('|').map(c => c.trim()).filter(Boolean)
      if (cells.length >= 1) {
        return cells[0].replace(/`/g, '').replace(/^\.(btn|form|card|table|modal|tab|pagination|breadcrumb)/, '').trim()
      }
      return null
    }).filter(Boolean).slice(0, 6).join('/')

    return `| ${koreanName} | \`${blockName}\` | \`${classes}\` |`
  })

  const promptContent = `# 인포마인드 UX 디자인 시스템 컨텍스트

> **목적:** 대화형 AI에 인포마인드 UX팀 디자인/퍼블리싱 규칙을 극한 압축하여 제공하기 위한 프롬프트
> **대상 AI:** ChatGPT, Gemini, Claude 웹

---

## CSS 방법론

- **BEM** (Block__Element--Modifier) 필수
- **ITCSS** 7레이어: settings > tools > generic > elements > objects > components > utilities
- **SCSS** (dart-sass), \`@use\`/\`@forward\` 사용 (\`@import\` 금지)
- 파일 구조: \`src/scss/{1~7}-{layer}/\`

## 디자인 토큰

모든 값은 CSS Custom Properties를 사용하라. 하드코딩 금지.

- **색상:** \`--color-primary\` (${primaryColor ? primaryColor.value : '#256ef4'}), gray-50~900, danger/warning/success/info, text/bg/border
- **폰트:** Pretendard GOV, 크기 \`--font-size-{2xl~xs}\` (${fontSizeRange}), 굵기 400/500/600/700
- **줄 간격:** \`--leading-{tight/base/loose}\` (1.2/1.6/1.8)
- **간격:** \`--spacing-{xs~3xl}\` (${spacingSummary}px)
- **반지름:** \`--radius-{sm/base/lg/xl/full}\` (${radiusSummary}px)
- **그림자:** \`--shadow-{sm/base/lg}\`
- **z-index:** dropdown(100) ~ toast(600)
- **62.5% REM 트릭:** \`html { font-size: 62.5% }\` -- 1rem = 10px

## 컴포넌트

8개 표준 컴포넌트 (BEM Block명):

| 컴포넌트 | Block | 주요 Modifier/Element |
|----------|-------|---------------------|
${componentRows.join('\n')}

## 접근성

- **KWCAG/WCAG 2.1 AA** 준수 필수
- 색상 대비 4.5:1 이상, 큰 텍스트 3:1
- 터치 영역 최소 44px x 44px
- \`focus-visible\` 스타일 제공
- \`<a href="#main-content" class="skip-to-content">본문 바로가기</a>\`
- \`.sr-only\` 스크린 리더 전용 텍스트
- 이미지: \`alt\` 필수, 폼: \`<label for>\` 필수, 모달: \`role="dialog"\` + 포커스 트랩

## 반응형

- **모바일 퍼스트** 접근
- 브레이크포인트: 모바일 0~767px, 태블릿 768~1279px, PC 1280px+
- 그리드: 모바일 4col/16px거터, 태블릿+ 12col/24px거터, PC max-width 1200px
- 믹스인: \`@include resp.respond-to('tablet')\`, \`respond-to('pc')\`, \`respond-to('tablet-up')\`

## 코딩 스타일

- 들여쓰기 2 spaces, single quote, 주석 한국어
- SCSS 세미콜론 사용, JS/HTML 세미콜론 없음
- \`!important\` 금지, 인라인 스타일 금지`

  const output = `---
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

  return output
}

// ─── root prompts/ 파일 생성 (스킬에서 fetch) ───

const DESIGN_DIR = path.join(ROOT, 'site/design')
const FIGMA_DIR = path.join(ROOT, 'site/figma')

/**
 * 마크다운 파일에서 frontmatter, 관련 문서 섹션, HTML 태그, 내부 링크를 제거한다.
 */
function cleanMarkdown(content) {
  let cleaned = content.replace(/^---[\s\S]*?---\n/, '')
  cleaned = cleaned.replace(/^## 관련 문서[\s\S]*?(?=\n## |\n# |$)/m, '')
  cleaned = cleaned.replace(/<[^>]+>/g, '')
  cleaned = cleaned.replace(/^- \[.*?\]\(\/.*?\).*$/gm, '')
  cleaned = cleaned.replace(/\[([^\]]+)\]\(\/[^)]+\)/g, '$1')
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n')
  return cleaned.trim()
}

/**
 * 코드 블록, 대형 테이블(8행 초과), 긴 설명문을 제거한다.
 * 헤딩, 핵심 규칙 테이블(8행 이하), 불릿만 남긴다.
 */
function compressContent(content) {
  // 코드 블록 제거
  let compressed = content.replace(/```[\s\S]*?```/g, '')

  // 테이블 압축: 8행 초과 테이블은 헤더+구분선+첫 3행+...으로 축약
  compressed = compressed.replace(/((?:\|[^\n]+\n){2})((?:\|[^\n]+\n)+)/g, (match, header, rows) => {
    const rowLines = rows.trim().split('\n')
    if (rowLines.length > 8) {
      return header + rowLines.slice(0, 3).join('\n') + '\n| ... | (총 ' + rowLines.length + '행, 원본 참조) |\n'
    }
    return match
  })

  // 빈 줄 정리
  compressed = compressed.replace(/\n{3,}/g, '\n\n')
  return compressed
}

/**
 * 디렉토리 내 .md 파일을 order 필드 기준으로 정렬 반환한다.
 */
function readSorted(dir) {
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

/**
 * prompts/design-rules.md — 디자인 규칙 극한 압축
 * site/design/*.md (design-audit 제외)에서 Do/Don't + 핵심 테이블만 추출
 */
function buildDesignRules() {
  const files = readSorted(DESIGN_DIR)
    .filter(f => f.file !== 'design-audit.md')

  const sections = files.map(f => {
    const cleaned = cleanMarkdown(f.content)

    // 코드 블록 제거
    let text = cleaned.replace(/```[\s\S]*?```/g, '')

    // Do/Don't 테이블만 추출
    const doDontMatch = text.match(/## Do \/ Don't[\s\S]*?(?=\n## |\n# |$)/m)

    // 핵심 규칙 테이블만 추출 (8행 이하)
    const smallTables = []
    const tableRegex = /(\|[^\n]+\n\|[-| ]+\n(?:\|[^\n]+\n){1,8})/g
    let match
    while ((match = tableRegex.exec(text)) !== null) {
      smallTables.push(match[1].trim())
    }

    // 불릿 규칙 추출 (금지, 필수, 원칙 키워드 포함 줄)
    const ruleLines = text.split('\n').filter(l =>
      /^- .*(금지|필수|않는다|안 된다|사용하지|제공한다|준수|확보)/.test(l)
    )

    let section = `## ${f.title}\n\n`

    // 가장 핵심적인 규칙만 포함
    if (ruleLines.length > 0) {
      section += ruleLines.slice(0, 10).join('\n') + '\n\n'
    }

    if (doDontMatch) {
      section += doDontMatch[0].trim() + '\n\n'
    }

    // Do/Don't가 없으면 첫 번째 작은 테이블만
    if (!doDontMatch && smallTables.length > 0) {
      section += smallTables[0] + '\n\n'
    }

    // 상세는 원본 경로 안내
    section += `> 상세: site/design/${f.file}\n`

    return section
  }).join('\n\n---\n\n')

  return `# 디자인 규칙

> 핵심 규칙만 압축. 상세 내용은 각 섹션의 원본 파일을 참조하라.

${sections}
`
}

/**
 * prompts/design-audit.md — 감사 체크리스트 (Quick 5 + 17개 헤딩 + 체크박스)
 * site/design/design-audit.md
 */
function buildDesignAudit() {
  const filePath = path.join(DESIGN_DIR, 'design-audit.md')
  if (!fs.existsSync(filePath)) return ''

  const content = fs.readFileSync(filePath, 'utf-8')
  const cleaned = cleanMarkdown(content)

  // Quick 5 섹션 추출
  const quick5Match = cleaned.match(/## Quick 5[\s\S]*/)

  // 17개 카테고리 (### N. 제목 ~ 다음 ### 전까지의 체크박스만)
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
    if (current && line.startsWith('- [ ]')) {
      current.items.push(line)
    }
    // Quick 5 시작 전까지만
    if (line.startsWith('## Quick 5')) break
  }
  if (current) categories.push(current)

  const categoryText = categories.map(c =>
    `### ${c.title}\n\n${c.items.join('\n')}`
  ).join('\n\n')

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

// ─── 메인 실행 ───

function main() {
  console.log('[build-prompts] 프롬프트 파일 재생성 시작...')

  // site/prompts/ 출력 디렉토리 확인
  if (!fs.existsSync(PROMPTS_DIR)) {
    fs.mkdirSync(PROMPTS_DIR, { recursive: true })
  }

  // root prompts/ 출력 디렉토리 확인
  const ROOT_PROMPTS_DIR = path.join(ROOT, 'prompts')
  if (!fs.existsSync(ROOT_PROMPTS_DIR)) {
    fs.mkdirSync(ROOT_PROMPTS_DIR, { recursive: true })
  }

  // --- site/prompts/ (사람이 복붙하는 용도) ---

  const designContent = buildDesignPrompt()
  fs.writeFileSync(path.join(PROMPTS_DIR, 'design.md'), designContent, 'utf-8')
  console.log('[build-prompts] site/prompts/design.md 생성 완료')

  const componentsContent = buildComponentsPrompt()
  fs.writeFileSync(path.join(PROMPTS_DIR, 'components.md'), componentsContent, 'utf-8')
  console.log('[build-prompts] site/prompts/components.md 생성 완료')

  const contextContent = buildContextPrompt()
  fs.writeFileSync(path.join(PROMPTS_DIR, 'context.md'), contextContent, 'utf-8')
  console.log('[build-prompts] site/prompts/context.md 생성 완료')

  // --- root prompts/ (스킬이 fetch하는 용도) ---

  const designRules = buildDesignRules()
  fs.writeFileSync(path.join(ROOT_PROMPTS_DIR, 'design-rules.md'), designRules, 'utf-8')
  console.log('[build-prompts] prompts/design-rules.md 생성 완료')

  const designAudit = buildDesignAudit()
  fs.writeFileSync(path.join(ROOT_PROMPTS_DIR, 'design-audit.md'), designAudit, 'utf-8')
  console.log('[build-prompts] prompts/design-audit.md 생성 완료')

  console.log('[build-prompts] 완료!')
}

main()
