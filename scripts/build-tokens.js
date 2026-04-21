/**
 * 토큰 빌드 스크립트
 * tokens.json(DTCG 포맷)을 읽어서 SCSS 토큰 파일을 자동 생성한다.
 *
 * 사용법: node scripts/build-tokens.js
 */

const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const TOKENS_PATH = path.join(ROOT, 'tokens.json')
const SCSS_DIR = path.join(ROOT, 'src', 'scss', '1-settings')

// tokens.json 읽기
const tokens = JSON.parse(fs.readFileSync(TOKENS_PATH, 'utf-8'))

// ── 헬퍼 ──────────────────────────────────────────────

/**
 * 플랫 토큰 목록을 CSS custom property 선언 문자열로 변환
 * @param {Array<{name: string, value: string}>} entries
 * @returns {string}
 */
function toCustomProps(entries) {
  return entries.map(e => `  ${e.name}: ${e.value};`).join('\n')
}

/**
 * 자동 생성 헤더
 * @param {string} comment - 파일 설명 주석
 * @returns {string}
 */
function header(comment) {
  return `// 자동 생성 — tokens.json에서 생성됨. 직접 수정 금지.\n// ${comment}`
}

// ── 1. _tokens-color.scss ─────────────────────────────

function buildColor() {
  const color = tokens.color
  if (!color) return

  // 그룹별 주석 매핑
  const groups = [
    { comment: 'Primary — 기본값, 프로젝트별 오버라이드 전제', keys: ['primary', 'primary-light', 'primary-dark'] },
    { comment: 'Gray scale — 기존 프로젝트 값(#222, #333, #666, #999, #ccc, #efefef, #f8f8f8) 기반', keys: ['gray-900', 'gray-800', 'gray-700', 'gray-600', 'gray-500', 'gray-400', 'gray-300', 'gray-200', 'gray-100', 'gray-50'] },
    { comment: 'Semantic — KRDS 기준 (50 단계)', keys: ['danger', 'warning', 'success', 'info'] },
    { comment: 'Text', keys: ['text', 'text-secondary', 'text-disabled'] },
    { comment: 'Background', keys: ['bg', 'bg-secondary'] },
    { comment: 'Border', keys: ['border', 'border-light'] },
    { comment: 'White / Black', keys: ['white', 'black'] },
    { comment: 'Alpha — 반투명 값 (color-mix 기반, CSS 변수 참조)', keys: ['primary-alpha-8', 'primary-alpha-6', 'black-alpha-50'] }
  ]

  const lines = [
    header('색상 토큰 — KRDS 기반 시맨틱 + 중립 팔레트'),
    '// D-01: Primary는 프로젝트별 :root 오버라이드로 변경',
    '// D-02: 시맨틱 색상은 KRDS 공공 디자인시스템 기준',
    '// D-03: 그레이 스케일은 기존 프로젝트 값 참고',
    '',
    ':root {'
  ]

  groups.forEach((group, i) => {
    if (i > 0) lines.push('')
    lines.push(`  // ${group.comment}`)
    group.keys.forEach(key => {
      if (color[key]) {
        lines.push(`  --color-${key}: ${color[key].$value};`)
      }
    })
  })

  lines.push('}')
  lines.push('')

  fs.writeFileSync(path.join(SCSS_DIR, '_tokens-color.scss'), lines.join('\n'))
  console.log('  _tokens-color.scss 생성 완료')
}

// ── 2. _tokens-typography.scss ────────────────────────

function buildTypography() {
  const typo = tokens.typography
  if (!typo) return

  const lines = [
    header('타이포그래피 토큰 — Pretendard GOV 기반'),
    '// 62.5% 트릭 적용: html { font-size: 62.5% } → 1rem = 10px',
    '// rem 값이 px의 1/10이므로 직관적 (예: 1.6rem = 16px)',
    ':root {'
  ]

  // Font Family
  if (typo['font-family']) {
    lines.push('  // Font Family')
    for (const [name, token] of Object.entries(typo['font-family'])) {
      lines.push(`  --font-family-${name}: ${token.$value};`)
    }
  }

  // Font Size
  if (typo['font-size']) {
    lines.push('')
    lines.push('  // Font Size (62.5% 기준, 1rem = 10px)')
    const sizeComments = {
      '2xl': '32px', 'xl': '28px', 'lg': '24px', 'md': '20px',
      'base': '16px', 'sm': '14px', 'xs': '12px'
    }
    for (const [name, token] of Object.entries(typo['font-size'])) {
      const prop = `--font-size-${name}`
      const decl = `  ${prop}: ${token.$value};`
      if (sizeComments[name]) {
        const padded = decl.padEnd(30)
        lines.push(`${padded}// ${sizeComments[name]}`)
      } else {
        lines.push(decl)
      }
    }
  }

  // Font Weight
  if (typo['font-weight']) {
    lines.push('')
    lines.push('  // Font Weight')
    for (const [name, token] of Object.entries(typo['font-weight'])) {
      lines.push(`  --font-weight-${name}: ${token.$value};`)
    }
  }

  // Leading (Line Height)
  if (typo.leading) {
    lines.push('')
    lines.push('  // Line Height')
    for (const [name, token] of Object.entries(typo.leading)) {
      lines.push(`  --leading-${name}: ${token.$value};`)
    }
  }

  lines.push('}')
  lines.push('')

  fs.writeFileSync(path.join(SCSS_DIR, '_tokens-typography.scss'), lines.join('\n'))
  console.log('  _tokens-typography.scss 생성 완료')
}

// ── 3. _tokens-spacing.scss ───────────────────────────

function buildSpacing() {
  const spacing = tokens.spacing
  if (!spacing) return

  const pxComments = {
    'xs': '4px', 'sm': '8px', 'md': '16px', 'lg': '24px',
    'xl': '32px', '2xl': '48px', '3xl': '64px'
  }

  const lines = [
    header('간격 토큰 — 4px 기반 스케일'),
    '// 62.5% 트릭 적용: 1rem = 10px (rem 값 = px / 10)',
    ':root {'
  ]

  for (const [name, token] of Object.entries(spacing)) {
    const prop = `--spacing-${name}`
    const decl = `  ${prop}: ${token.$value};`
    if (pxComments[name]) {
      const padded = decl.padEnd(28)
      lines.push(`${padded}// ${pxComments[name]}`)
    } else {
      lines.push(decl)
    }
  }

  lines.push('}')
  lines.push('')

  fs.writeFileSync(path.join(SCSS_DIR, '_tokens-spacing.scss'), lines.join('\n'))
  console.log('  _tokens-spacing.scss 생성 완료')
}

// ── 4. _tokens-grid.scss ──────────────────────────────

function buildGrid() {
  const grid = tokens.grid
  if (!grid) return

  const lines = [
    header('그리드 토큰 — KRDS 표준형 기반'),
    '// D-04: 3단계(모바일/태블릿/PC)',
    '// D-05: 콘텐츠 max-width 1200px',
    '// D-06: 1280px 뷰포트 = 1200px + 좌우 40px',
    '// D-07: PC/태블릿 12컬럼, 모바일 4컬럼',
    '',
    "@use 'breakpoints' as bp;",
    '',
    ':root {',
    `  --grid-columns: ${grid.columns.mobile.$value};`,
    `  --grid-gutter: ${grid.gutter.mobile.$value};`,
    `  --grid-margin: ${grid.margin.mobile.$value};`,
    `  --container-max-width: ${grid['container-max-width'].mobile.$value};`,
    '}',
    '',
    '@media (min-width: #{bp.$breakpoint-tablet}) {',
    '  :root {',
    `    --grid-columns: ${grid.columns.tablet.$value};`,
    `    --grid-gutter: ${grid.gutter.tablet.$value};`,
    `    --grid-margin: ${grid.margin.tablet.$value};`,
    '  }',
    '}',
    '',
    '@media (min-width: #{bp.$breakpoint-pc}) {',
    '  :root {',
    `    --container-max-width: ${grid['container-max-width'].pc.$value};`,
    `    --grid-margin: ${grid.margin.pc.$value};`,
    '  }',
    '}',
    ''
  ]

  fs.writeFileSync(path.join(SCSS_DIR, '_tokens-grid.scss'), lines.join('\n'))
  console.log('  _tokens-grid.scss 생성 완료')
}

// ── 5. _tokens-misc.scss ──────────────────────────────

function buildMisc() {
  const lines = [
    header('기타 디자인 토큰 — border-radius, shadow, transition, z-index'),
    ':root {'
  ]

  // Radius
  if (tokens.radius) {
    lines.push('  // Border Radius')
    for (const [name, token] of Object.entries(tokens.radius)) {
      lines.push(`  --radius-${name}: ${token.$value};`)
    }
  }

  // Shadow
  if (tokens.shadow) {
    lines.push('')
    lines.push('  // Box Shadow')
    for (const [name, token] of Object.entries(tokens.shadow)) {
      lines.push(`  --shadow-${name}: ${token.$value};`)
    }
  }

  // Transition
  if (tokens.transition) {
    lines.push('')
    lines.push('  // Transition')
    for (const [name, token] of Object.entries(tokens.transition)) {
      lines.push(`  --transition-${name}: ${token.$value};`)
    }
  }

  // Z-index
  if (tokens['z-index']) {
    lines.push('')
    lines.push('  // Z-index')
    for (const [name, token] of Object.entries(tokens['z-index'])) {
      lines.push(`  --z-${name}: ${token.$value};`)
    }
  }

  lines.push('}')
  lines.push('')

  fs.writeFileSync(path.join(SCSS_DIR, '_tokens-misc.scss'), lines.join('\n'))
  console.log('  _tokens-misc.scss 생성 완료')
}

// ── 실행 ──────────────────────────────────────────────

console.log('토큰 빌드 시작...')
buildColor()
buildTypography()
buildSpacing()
buildGrid()
buildMisc()
console.log('토큰 빌드 완료!')
