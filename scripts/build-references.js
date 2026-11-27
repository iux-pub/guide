/**
 * 레퍼런스 빌더 — references/의 자동 생성 문서를 만든다
 *
 * 입력(단일 원본):
 *   tokens/build/tokens.css (이미 빌드되어 있어야 함 — 토큰 이름·값의 정본)
 *   src/snippets/*.md
 *   contracts/class-naming.json
 *
 * 출력(생성 대상):
 *   references/krds-tokens.md     (자동 생성 — 토큰 카탈로그)
 *   references/krds-components.md (자동 생성 — 컴포넌트 카탈로그)
 *   references/class-naming.md    (마커 사이 표만 — 정본 contracts/class-naming.json, 나머지는 직접 작성)
 *
 * 직접 작성하는 파일 (이 스크립트는 건드리지 않음):
 *   references/CONTRACT.md
 *   references/forbidden-patterns.md
 *   references/accessibility.md
 *   references/tailwind-mapping.md
 *   references/guide-import.md
 *
 * 사용법: node scripts/build-references.js
 */

const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const SNIPPETS_DIR = path.join(ROOT, 'src', 'snippets')
const REFS_DIR = path.join(ROOT, 'references')

if (!fs.existsSync(REFS_DIR)) fs.mkdirSync(REFS_DIR, { recursive: true })

// 빌드 표기 — 산출물에는 커밋 sha가 아니라 package.json version을 싣는다.
// sha를 박으면 빌드할 때마다 diff가 생기고, 커밋 전에 만든 생성물이라 값도 늘 한 커밋 늦다.
const GUIDE_VERSION = require('../package.json').version

// ─────────────────────────────────────────────────────
// 1. krds-tokens.md — 토큰 카탈로그
//    정본은 tokens/build/tokens.css다. 표를 손으로 적으면 토큰이 늘 때마다 문서에서 빠진다
//    (2026-11 검수: 173개 중 58개 누락). CSS를 읽어 전량을 싣고, 용도 설명만 여기서 붙인다.
// ─────────────────────────────────────────────────────

/** tokens.css → { light: [[이름, 값]…], highContrast: Map } — :root와 고대비 블록의 선언을 순서대로 읽는다 */
function parseTokensCss(css) {
  const block = (re) => {
    const m = css.match(re)
    if (!m) return []
    return [...m[1].matchAll(/^\s*(--[a-z0-9-]+)\s*:\s*([^;]+);/gim)].map(x => [x[1], x[2].trim()])
  }
  return {
    light: block(/(?:^|\n):root\s*\{([\s\S]*?)\n\}/),
    highContrast: new Map(block(/\[data-color-mode="high-contrast"\]\s*\{([\s\S]*?)\n\}/))
  }
}

// 단계 색상(--color-<분류>-<단계>)의 표 제목. 여기 없는 분류가 생겨도 표는 만들어진다(분류 이름 그대로)
const STEP_LABEL = {
  primary: 'Primary (브랜드 / 액션 강조)',
  secondary: 'Secondary (보조 브랜드)',
  gray: 'Gray (무채색 — 텍스트/배경/보더)',
  danger: 'Danger (오류/삭제)',
  warning: 'Warning (경고)',
  success: 'Success (성공)',
  information: 'Information (정보)',
  point: 'Point (강조)',
  'alpha-black': 'Alpha (검정 알파 — dim)'
}
const STEP_TOKEN = /^--color-([a-z]+(?:-[a-z]+)*)-(\d+)$/

// 시맨틱 토큰의 묶음 — 위에서부터 먼저 맞는 묶음에 들어간다. 마지막 묶음이 나머지를 모두 받아 누락이 없다
const SEMANTIC_GROUPS = [
  ['브랜드', n => /^--color-(?:primary|secondary|point)(?:-(?:hover|pressed))?$/.test(n)],
  ['링크', n => /^--color-link(?:-|$)/.test(n)],
  ['버튼', n => /^--color-button-/.test(n)],
  ['입력', n => /^--color-input-/.test(n)],
  ['텍스트', n => /^--color-text(?:-|$)/.test(n) || /^--color-[a-z]+-text$/.test(n)],
  ['배경', n => /^--color-bg(?:-|$)/.test(n)],
  ['표면', n => /^--color-surface(?:-|$)/.test(n) || /^--color-[a-z]+-surface$/.test(n)],
  ['보더', n => /^--color-border(?:-|$)/.test(n)],
  ['상태', n => /^--color-(?:danger|warning|success|info)$/.test(n)],
  ['그 밖', () => true]
]

const STATE_KO = { primary: 'primary', information: '정보', info: '정보', success: '성공', warning: '경고', danger: '오류' }
const USAGE = {
  '--color-primary': '브랜드·주요 액션',
  '--color-primary-hover': '주요 액션 hover',
  '--color-primary-pressed': '주요 액션 pressed',
  '--color-secondary': '보조 브랜드',
  '--color-point': '강조(포인트)',
  '--color-text': '본문 (기본)',
  '--color-text-bolder': '가장 진한 텍스트',
  '--color-text-subtle': '보조 텍스트',
  '--color-text-disabled': '비활성 텍스트',
  '--color-text-inverse': '다크 배경 위 텍스트',
  '--color-text-primary': '브랜드색 텍스트 (활성 메뉴·강조)',
  '--color-bg': '페이지 기본 배경',
  '--color-bg-subtler': '보조 배경 (헤더 띠 등)',
  '--color-bg-subtle': '더 진한 보조 배경',
  '--color-bg-inverse': '다크 배경',
  '--color-bg-dim': '모달 dim',
  '--color-surface': '카드/패널 표면',
  '--color-surface-subtler': '보조 표면',
  '--color-surface-disabled': '비활성 표면',
  '--color-border': '기본 테두리',
  '--color-border-light': '옅은 구분선',
  '--color-border-dark': '진한 테두리 (hover)',
  '--color-border-control': '폼 컨트롤 테두리 (배경 대비 3:1)',
  '--color-border-primary': '강조 테두리 (focus·선택)',
  '--color-border-disabled': '비활성 테두리',
  '--color-link': '링크 기본',
  '--color-link-hover': '링크 hover',
  '--color-link-pressed': '링크 pressed',
  '--color-link-visited': '방문한 링크',
  '--color-input-surface': '입력 표면',
  '--color-input-surface-disabled': '비활성 입력 표면',
  '--color-input-border': '입력 테두리',
  '--color-input-border-active': '입력 테두리 (focus)',
  '--color-input-border-disabled': '비활성 입력 테두리',
  '--color-input-border-error': '입력 오류 테두리'
}

/** 용도 설명 — 표에 없으면 이름 규칙으로 만든다. 규칙에도 안 맞으면 '—'(토큰 자체는 표에 실린다) */
function usageOf(name) {
  if (USAGE[name]) return USAGE[name]
  let m = name.match(/^--color-button-(primary|secondary|tertiary|text|disabled)-(fill|border)(?:-(hover|pressed))?$/)
  if (m) return `${m[1] === 'disabled' ? '비활성' : m[1]} 버튼 ${m[2] === 'fill' ? '채움' : '테두리'}${m[3] ? ` (${m[3]})` : ''}`
  m = name.match(/^--color-(danger|warning|success|info)(?:-(text|surface))?$/)
  if (m) return `${STATE_KO[m[1]]} ${m[2] === 'text' ? '텍스트' : m[2] === 'surface' ? '알림 배경' : '상태색 (아이콘·강조)'}`
  m = name.match(/^--color-surface-(primary|information|success|warning|danger)-subtler$/)
  if (m) return `옅은 ${STATE_KO[m[1]]} 표면`
  m = name.match(/^--color-border-(primary|information|success|warning|danger)-light$/)
  if (m) return `옅은 ${STATE_KO[m[1]]} 테두리`
  return '—'
}

const FONT_USAGE = {
  '--font-sans': '본문/컴포넌트 기본 폰트',
  '--font-heading': '제목 차등 서체 — brand에 heading 슬롯이 없으면 sans 값 폴백',
  '--font-mono': '코드/고정폭 텍스트'
}
const BREAKPOINT_USAGE = {
  '--breakpoint-mobile': '모바일 기준 뷰포트',
  '--breakpoint-tablet': '태블릿 이상 — 글자 크기 mobile→pc 전환',
  '--breakpoint-laptop': '노트북 이상 — 메인 메뉴↔전체메뉴, 서브 LNB 2단, 레이아웃 간격',
  '--breakpoint-pc': 'PC 이상'
}

/** tokens.css 원문 → krds-tokens.md 본문. 파일을 쓰지 않는 순수 함수라 테스트가 누락을 본다 */
function renderKrdsTokensMd(css) {
  const { light, highContrast } = parseTokensCss(css)
  const lines = []
  const w = (s) => lines.push(s)

  const colors = light.filter(([n]) => n.startsWith('--color-'))
  const steps = colors.filter(([n]) => STEP_TOKEN.test(n))
  const semantic = colors.filter(([n]) => !STEP_TOKEN.test(n))

  // 같은 값의 단계 토큰 — 시맨틱 토큰의 '참조' 칸. 이름에 같은 분류가 들어 있으면 그것을 먼저 고른다
  const stepByValue = new Map()
  for (const [n, v] of steps) {
    if (!stepByValue.has(v)) stepByValue.set(v, [])
    stepByValue.get(v).push(n.replace(/^--color-/, ''))
  }
  const refOf = (name, value) => {
    const cands = stepByValue.get(value)
    if (!cands) return '—'
    const hint = name.replace(/-info(?=-|$)/, '-information')
    return cands.find(c => hint.includes(c.replace(/-\d+$/, ''))) || cands[0]
  }

  w('# INFOUX 파운데이션 토큰 카탈로그')
  w('')
  w('> 자동 생성됨. 직접 수정 금지.')
  w('> 출처: `tokens/build/tokens.css` (`tokens/foundation.json` + `tokens/brand.json` 합성 결과)')
  w('> 기준 버전: ' + GUIDE_VERSION)
  w('')
  w('색상, 기본 폰트, 브레이크포인트는 이 문서의 토큰을 사용한다. 임의 hex/rgb/hsl 색상 작성은 금지한다. 간격·크기·타이포 스케일·모션·z-index는 토큰 카탈로그 대상이 아니다 — 간격·크기·타이포는 rem 임의값(`p-[1.6rem]`, Tailwind 기본 스케일은 62.5% 루트에서 37.5% 작아 R-37 금지), 모션·z-index는 CSS 값이나 Tailwind 임의값(`duration-[200ms]`, `z-[1050]`)으로 작성한다.')
  w('')
  w(`이 문서는 \`tokens.css\`의 \`--color-*\` ${colors.length}개와 \`--font-*\`·\`--breakpoint-*\` 전량을 싣는다. 여기 없는 이름은 없는 토큰이다 — 지어내지 않는다.`)
  w('')
  w('---')
  w('')
  w('## 색상 — 시맨틱 (먼저 쓴다)')
  w('')
  w('「참조」는 라이트 모드에서 같은 값을 가진 단계 토큰이다. 「고대비」는 `[data-color-mode="high-contrast"]`에서 바뀌는 값이다.')
  w('')
  const taken = new Set()
  for (const [title, test] of SEMANTIC_GROUPS) {
    const rows = semantic.filter(([n]) => !taken.has(n) && test(n))
    if (rows.length === 0) continue
    rows.forEach(([n]) => taken.add(n))
    w(`### 시맨틱 — ${title}`)
    w('')
    w('| 토큰 | 값 | 고대비 | 참조 | 용도 |')
    w('|------|----|--------|------|------|')
    for (const [name, value] of rows) {
      w(`| \`${name}\` | \`${value}\` | \`${highContrast.get(name) ?? value}\` | ${refOf(name, value)} | ${usageOf(name)} |`)
    }
    w('')
  }

  w('## 색상 — 단계 (명도가 필요할 때만)')
  w('')
  const groups = []
  for (const [name, value] of steps) {
    const [, group, stage] = name.match(STEP_TOKEN)
    let g = groups.find(x => x.group === group)
    if (!g) groups.push(g = { group, rows: [] })
    g.rows.push([stage, name, value])
  }
  for (const { group, rows } of groups) {
    w(`### ${STEP_LABEL[group] || group}`)
    w('')
    w('| 단계 | 토큰 | hex | 고대비 |')
    w('|------|------|-----|--------|')
    for (const [stage, name, value] of rows) {
      w(`| ${stage} | \`${name}\` | \`${value}\` | \`${highContrast.get(name) ?? value}\` |`)
    }
    w('')
  }
  w('정보색의 단계 토큰 분류는 `information`이다(`--color-information-60`). 시맨틱 별칭(`--color-info`, `--color-info-text`, `--color-info-surface`)만 `info`를 쓴다.')
  w('')

  w('## 기본 폰트')
  w('')
  w('| 토큰 | 값 | 용도 |')
  w('|------|----|------|')
  for (const [name, value] of light.filter(([n]) => n.startsWith('--font-'))) {
    w(`| \`${name}\` | \`${value}\` | ${FONT_USAGE[name] || '—'} |`)
  }
  w('')
  w('## 브레이크포인트')
  w('')
  w('| 토큰 | 값 | 용도 | Tailwind variant |')
  w('|------|----|------|------------------|')
  for (const [name, value] of light.filter(([n]) => n.startsWith('--breakpoint-'))) {
    w(`| \`${name}\` | \`${value}\` | ${BREAKPOINT_USAGE[name] || '—'} | \`${name.replace('--breakpoint-', '')}:\` |`)
  }
  w('')
  w('---')
  w('')
  w('## 사용 원칙')
  w('')
  w('- 색상은 `--color-*` 시맨틱 토큰을 우선 사용한다.')
  w('- 단계 색상은 예외적으로 명도가 필요한 경우에만 `--color-{group}-{step}`을 사용한다.')
  w('- 폰트 패밀리는 `--font-sans`, `--font-heading`, `--font-mono`만 사용한다.')
  w('- 브레이크포인트는 KRDS 표준형 360 / 768 / 1024 / 1280 네 단계만 사용한다. 글자 크기의 mobile→pc 전환은 768, 메인 메뉴↔전체메뉴·서브 LNB 2단·레이아웃 간격 전환은 1024다.')
  w('- Tailwind 반응형 variant는 `mobile:` / `tablet:` / `laptop:` / `pc:`만 사용하고 `sm:` / `md:` / `lg:` / `xl:` / `2xl:`는 사용하지 않는다.')
  w('- 단순 반응형 속성 변경은 CSS 파일 내부에서도 `@apply tablet:*`, `@apply pc:*`를 우선 사용한다.')
  w('- 복잡한 중첩 선택자나 여러 하위 요소를 동시에 제어해야 할 때만 `@media`를 사용하고, 관련 선택자 내부에 중첩한다.')
  w('- 파일 하단에 브레이크포인트별 `@media` 블록을 몰아두지 않는다.')
  w('- 순수 CSS `@media (min-width: var(--breakpoint-*))`는 표준으로 쓰지 않는다. 직접 `@media`가 필요하면 `768px`, `1280px` 값을 명시한다.')
  w('- 간격, 크기, 타이포 스케일, 반경, 그림자, 모션, z-index는 토큰화하지 않는다.')
  w('- 해당 값들은 `@apply`의 Tailwind 유틸리티 또는 명확한 CSS 직접값으로 작성한다.')
  w('- `tokens/build/tokens.css`는 자동 생성물이므로 직접 수정하지 않는다.')
  w('')
  return lines.join('\n') + '\n'
}

function buildKrdsTokensMd() {
  const cssPath = path.join(ROOT, 'tokens', 'build', 'tokens.css')
  if (!fs.existsSync(cssPath)) throw new Error('tokens/build/tokens.css가 없다 — npm run build:tokens를 먼저 실행한다.')
  fs.writeFileSync(path.join(REFS_DIR, 'krds-tokens.md'), renderKrdsTokensMd(fs.readFileSync(cssPath, 'utf-8')))
  console.log('✓ references/krds-tokens.md')
}

// ─────────────────────────────────────────────────────
// 2. krds-components.md — 컴포넌트 카탈로그
// ─────────────────────────────────────────────────────

/**
 * 스니펫 문서를 카탈로그의 한 항목으로 낮춘다 — 첫 H1은 `### 제목 {#이름}`, 나머지 제목은 두 단계씩(최대 6단계).
 * 한 줄씩 한 번만 바꾼다(H1을 ###로 바꾼 뒤 `^### `를 다시 치환하면 방금 만든 제목까지 #####가 된다).
 * 코드 펜스 안의 `# …`(셸 주석·마크다운 예시)는 제목이 아니므로 건드리지 않는다.
 */
function demoteHeadings(markdown, anchor) {
  let fence = null
  let titled = false
  return markdown.split('\n').map(line => {
    const fm = line.match(/^\s*(`{3,}|~{3,})/)
    if (fm) {
      if (!fence) fence = fm[1]
      else if (fm[1][0] === fence[0] && fm[1].length >= fence.length && line.trim() === fm[1]) fence = null
      return line
    }
    if (fence) return line
    const h = line.match(/^(#{1,6}) (.*)$/)
    if (!h) return line
    if (h[1].length === 1 && !titled) {
      titled = true
      return `### ${h[2]}${anchor ? ` {#${anchor}}` : ''}`
    }
    return `${'#'.repeat(Math.min(6, h[1].length + 2))} ${h[2]}`
  }).join('\n')
}

function buildKrdsComponentsMd() {
  const lines = []
  const w = (s) => lines.push(s)

  w('# KRDS 컴포넌트 카탈로그')
  w('')
  w('> 자동 생성됨. 직접 수정 금지.')
  w('> 출처: `src/snippets/*.md`')
  w('> 기준 버전: ' + GUIDE_VERSION)
  w('')
  w('아래 카탈로그에 없는 컴포넌트는 임의 생성 금지. § "카탈로그에 없는 컴포넌트 요구 시" 절차 따름.')
  w('')
  w('---')
  w('')

  // 그룹 정의
  const groups = {
    'A — 폼/액션': ['btn', 'check-radio', 'file-upload', 'form', 'select', 'switch'],
    'B — 컨테이너/레이아웃': ['accordion', 'card', 'disclosure', 'modal', 'side-panel', 'tab'],
    'C — 내비게이션': ['breadcrumb', 'footer', 'header', 'main-menu', 'mobile-menu', 'pagination'],
    'D — 피드백': ['alert', 'badge', 'notice-bar', 'progress', 'spinner', 'step-indicator', 'tag', 'toast', 'tooltip'],
    'E — 콘텐츠/표현': ['calendar', 'carousel', 'error-page', 'icon', 'list', 'table']
  }

  // 인덱스
  w('## 인덱스')
  w('')
  for (const [groupName, comps] of Object.entries(groups)) {
    w(`- **그룹 ${groupName}**: ${comps.map(c => `[${c}](#${c})`).join(' · ')}`)
  }
  w('')
  w('---')
  w('')

  // 각 컴포넌트 — 스니펫 본문 임포트
  for (const [groupName, comps] of Object.entries(groups)) {
    w(`## 그룹 ${groupName}`)
    w('')
    for (const comp of comps) {
      const snippetPath = path.join(SNIPPETS_DIR, `${comp}.md`)
      if (!fs.existsSync(snippetPath)) {
        w(`### ${comp}`)
        w(`> 스니펫 파일 없음 (\`src/snippets/${comp}.md\`).`)
        w('')
        continue
      }
      const snippetContent = fs.readFileSync(snippetPath, 'utf-8')
      w(demoteHeadings(snippetContent, comp))
      w('')
      w('---')
      w('')
    }
  }

  fs.writeFileSync(path.join(REFS_DIR, 'krds-components.md'), lines.join('\n') + '\n')
  console.log('✓ references/krds-components.md')
}

// ─────────────────────────────────────────────────────
// class-naming.md — contracts/class-naming.json의 표를 마커 사이에 채운다
// ─────────────────────────────────────────────────────

// 폐기 대상의 대체가 클래스면 .이름으로, 속성 조합(aria-current="page" 등)이면 그대로 적는다
function formatReplacement(replacement) {
  return /^[a-z][a-z0-9_-]*$/.test(replacement) ? `\`.${replacement}\`` : `\`${replacement}\``
}

// 계약 → 마커 사이 표. 파일을 쓰지 않는 순수 함수라 테스트가 현재 문서와 비교한다(손으로 고친 표가 남지 않게)
function renderClassNamingMd(spec, doc) {
  const vocabulary = [
    '| 축 | 어휘 | 근거 |',
    '|----|------|------|',
    ...spec.vocabulary.map(a => `| ${a.label} | ${a.words.map(w => `\`--${w}\``).join(' · ')} | ${a.source} |`),
    ...Object.entries(spec.blockModifiers || {}).map(([block, v]) => `| \`${block}\` 고유 | ${v.words.map(w => `\`--${w}\``).join(' · ')} | ${v.note} |`)
  ].join('\n')

  const forbidden = [
    `금지어(error): ${spec.forbiddenWords.map(w => `\`${w}\``).join(' · ')}`,
    '',
    '| 폐기 예정 | 대신 | 메모 |',
    '|-----------|------|------|',
    ...(spec.deprecated || []).map(d => `| \`.${d.class}\` | ${formatReplacement(d.replacement)} | ${d.note} |`)
  ].join('\n')

  const fileBlocks = [
    '| 컴포넌트 | 파일 | 블록 | 이유 |',
    '|----------|------|------|------|',
    ...spec.fileBlocks.map(f => `| \`${f.component}\` | \`${f.file}\` | ${f.blocks.map(b => `\`.${b}\``).join(' · ')} | ${f.why} |`),
    ...(spec.blockAliases || []).map(a => `| (오기) \`${a.alias}\` | — | \`.${a.block}\` | ${a.why} |`)
  ].join('\n')

  let out = doc
  for (const [id, body] of [['vocabulary', vocabulary], ['forbidden', forbidden], ['file-blocks', fileBlocks]]) {
    const re = new RegExp(`(<!-- class-naming:${id}:begin[^>]*-->)[\\s\\S]*?(<!-- class-naming:${id}:end -->)`)
    if (!re.test(out)) throw new Error(`references/class-naming.md에 class-naming:${id} 마커가 없다`)
    out = out.replace(re, `$1\n${body}\n$2`)
  }
  return out
}

function buildClassNamingMd() {
  const specPath = path.join(ROOT, 'contracts', 'class-naming.json')
  const target = path.join(REFS_DIR, 'class-naming.md')
  if (!fs.existsSync(specPath) || !fs.existsSync(target)) return
  const spec = JSON.parse(fs.readFileSync(specPath, 'utf-8'))
  fs.writeFileSync(target, renderClassNamingMd(spec, fs.readFileSync(target, 'utf-8')))
  console.log('✓ references/class-naming.md — 어휘·금지어·파일 대응 표')
}

module.exports = { renderClassNamingMd, renderKrdsTokensMd, parseTokensCss, demoteHeadings }

if (require.main === module) {
  console.log('레퍼런스 빌드 시작...')
  buildKrdsTokensMd()
  buildKrdsComponentsMd()
  buildClassNamingMd()
  console.log('완료. references/ 갱신본은 npm run build:mcp로 MCP 번들에 반영된다.')
  console.log('')
}
