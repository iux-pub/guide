/**
 * 토큰 빌드 스크립트 — KRDS 베이스 + INFOMIND 오버라이드 → Tailwind v4 CSS
 *
 * 입력:
 *   tokens/krds-base.json          (KRDS-uiux/krds-uiux 정본 — 수정 금지)
 *   tokens/infomind-overrides.json (UX팀 결정 — KRDS 공백 채우기 + 인포마인드 추가)
 *
 * 출력:
 *   tokens/build/merged.json       (병합 결과 — 디버그용)
 *   tokens/build/tokens.css        (Tailwind v4 @theme + KRDS 변수 + 모드/반응형)
 *
 * 사용법: node scripts/build-tokens.js
 */

const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const KRDS_PATH = path.join(ROOT, 'tokens', 'krds-base.json')
const OVERRIDES_PATH = path.join(ROOT, 'tokens', 'infomind-overrides.json')
const BUILD_DIR = path.join(ROOT, 'tokens', 'build')
const MERGED_PATH = path.join(BUILD_DIR, 'merged.json')
const CSS_PATH = path.join(BUILD_DIR, 'tokens.css')

// ── 0. 준비 ─────────────────────────────────────────────────

if (!fs.existsSync(BUILD_DIR)) fs.mkdirSync(BUILD_DIR, { recursive: true })

const krds = JSON.parse(fs.readFileSync(KRDS_PATH, 'utf-8'))
const overrides = JSON.parse(fs.readFileSync(OVERRIDES_PATH, 'utf-8'))

// ── 1. 병합 — overrides가 같은 경로면 덮어쓰고, infomind-* 네임스페이스는 추가 ──

function deepMerge(base, over) {
  if (over === null) return null // 명시적 삭제 (정책)
  if (typeof over !== 'object' || over === null) return over
  if (typeof base !== 'object' || base === null) return over
  if (Array.isArray(over)) return over
  const out = { ...base }
  for (const k of Object.keys(over)) {
    if (k === '$meta' || k === '$comment' || k === '$usage') continue // 메타는 보존만
    if (k in base) {
      out[k] = deepMerge(base[k], over[k])
    } else {
      out[k] = over[k]
    }
  }
  return out
}

const merged = { ...krds }
for (const [k, v] of Object.entries(overrides)) {
  if (k === '$meta') continue
  if (k.startsWith('infomind-')) {
    merged[k] = v // 새 네임스페이스 추가
  } else {
    merged[k] = deepMerge(krds[k], v) // KRDS 같은 경로 덮어쓰기
  }
}

merged.$meta = {
  generated: new Date().toISOString(),
  source: {
    krds: 'tokens/krds-base.json (KRDS-uiux/krds-uiux v1.0.0)',
    overrides: 'tokens/infomind-overrides.json'
  }
}

fs.writeFileSync(MERGED_PATH, JSON.stringify(merged, null, 2))
console.log(`✓ merged.json (${(fs.statSync(MERGED_PATH).size / 1024).toFixed(1)}KB)`)

// ── 2. CSS 출력 ──────────────────────────────────────────────

const lines = []
const indent = '  '

function w(s) { lines.push(s) }

// 헤더
w('/**')
w(' * AUTO-GENERATED — tokens/build/tokens.css')
w(' * 출처: tokens/krds-base.json (KRDS v1.0.0) + tokens/infomind-overrides.json')
w(' * 직접 수정 금지. 토큰 변경은 위 두 파일에서 한다.')
w(' *')
w(' * KRDS는 1rem = 10px 트릭을 명시 채택 (62.5%). 이 시스템도 그대로 따른다.')
w(' *   → reset.css에서 html { font-size: 62.5% } 적용 필수')
w(' */')
w('')

// ── 2.1 KRDS 변수 평탄화 — 헬퍼 ──

/**
 * 객체 트리를 순회하며 '값 토큰'(value 필드 보유)을 수집
 * @returns {Array<{path: string[], value: any, type: string}>}
 */
function flatten(obj, path = []) {
  const out = []
  if (obj === null || obj === undefined) return out
  if (typeof obj !== 'object') return out

  // value 필드가 있으면 단일 토큰
  if ('value' in obj && (typeof obj.value !== 'object' || obj.value === null)) {
    if (obj.value === null) return out // 명시적 삭제
    out.push({ path, value: obj.value, type: obj.type || 'unknown' })
    return out
  }

  // 그 외 — 자식 순회
  for (const [k, v] of Object.entries(obj)) {
    if (k.startsWith('$')) continue
    out.push(...flatten(v, [...path, k]))
  }
  return out
}

/** 토큰 경로 → CSS 변수명 (--krds-{...}) */
function krdsVar(path) {
  // primitive.color.light.primary.50 → --krds-light-color-primary-50
  // mode-light.color.text.basic → --krds-light-color-text-basic
  // responsive-pc.font-size.body.medium → --krds-pc-font-size-body-medium
  // semantic.gap.5 → --krds-gap-5
  // primitive.number.8 → --krds-number-8
  // primitive.typo.font.default → --krds-typo-font-default

  const [root, ...rest] = path
  let prefix = []

  if (root === 'primitive') {
    const [cat, ...tail] = rest
    if (cat === 'color') {
      const [mode, ...colorTail] = tail
      prefix = [mode, 'color', ...colorTail]
    } else {
      // typo, number, etc.
      prefix = [cat, ...tail]
    }
  } else if (root === 'mode-light') {
    prefix = ['light', ...rest]
  } else if (root === 'mode-high-contrast') {
    prefix = ['high-contrast', ...rest]
  } else if (root === 'responsive-pc') {
    prefix = ['pc', ...rest]
  } else if (root === 'responsive-mobile') {
    prefix = ['mobile', ...rest]
  } else if (root === 'semantic') {
    prefix = rest
  } else if (root.startsWith('infomind-')) {
    prefix = [root, ...rest] // infomind-grid.columns.mobile → --infomind-grid-columns-mobile
  } else {
    prefix = [root, ...rest]
  }

  return '--krds-' + prefix.join('-').toLowerCase()
}

/** 값에 KRDS 토큰 참조 `{path.to.token}`가 있으면 `var(--krds-...)`로 변환 */
function resolveValue(v) {
  if (typeof v !== 'string') return v
  if (v.includes('var(--')) return v
  return v.replace(/\{([^}]+)\}/g, (_, ref) => {
    const refPath = ref.split('.')
    return `var(${krdsVar(refPath)})`
  })
}

// ── 2.2 :root — light 모드 기본값 ──

w('/* ═══════════════════════════════════════════════════════')
w(' * KRDS 변수 — Light 모드 (기본)')
w(' * ═══════════════════════════════════════════════════════ */')
w(':root {')

// primitive.color.light
w('  /* primitive.color.light */')
flatten(merged.primitive.color.light, ['primitive', 'color', 'light']).forEach(t => {
  w(`${indent}${krdsVar(t.path)}: ${resolveValue(t.value)};`)
})

// primitive.typo
if (merged.primitive.typo) {
  w('')
  w('  /* primitive.typo */')
  flatten(merged.primitive.typo, ['primitive', 'typo']).forEach(t => {
    w(`${indent}${krdsVar(t.path)}: ${resolveValue(t.value)};`)
  })
}

// primitive.number — 1rem=10px 스케일
if (merged.primitive.number) {
  w('')
  w('  /* primitive.number — 1rem=10px 스케일 */')
  flatten(merged.primitive.number, ['primitive', 'number']).forEach(t => {
    w(`${indent}${krdsVar(t.path)}: ${resolveValue(t.value)};`)
  })
}

// mode-light.color.* (시맨틱)
w('')
w('  /* mode-light.color.* — 시맨틱 색상 */')
flatten(merged['mode-light'].color, ['mode-light', 'color']).forEach(t => {
  w(`${indent}${krdsVar(t.path)}: ${resolveValue(t.value)};`)
})

// mode-light.border-width
if (merged['mode-light']['border-width']) {
  w('')
  w('  /* mode-light.border-width */')
  flatten(merged['mode-light']['border-width'], ['mode-light', 'border-width']).forEach(t => {
    w(`${indent}${krdsVar(t.path)}: ${resolveValue(t.value)};`)
  })
}

// responsive-pc.* (PC 기본 — 모바일은 미디어쿼리에서 덮어씀)
w('')
w('  /* responsive-pc.* — PC 폰트/레이아웃 (1024px 이상 기본) */')
flatten(merged['responsive-pc'], ['responsive-pc']).forEach(t => {
  w(`${indent}${krdsVar(t.path)}: ${resolveValue(t.value)};`)
})

// semantic.* (gap, padding, size-height, radius)
w('')
w('  /* semantic.* — 시맨틱 단위 */')
flatten(merged.semantic, ['semantic']).forEach(t => {
  w(`${indent}${krdsVar(t.path)}: ${resolveValue(t.value)};`)
})

// infomind-* 추가 토큰
w('')
w('  /* infomind-* — UX팀 표준 추가 (KRDS 공백 보완) */')
for (const ns of Object.keys(merged).filter(k => k.startsWith('infomind-'))) {
  w(`${indent}/* ${ns} */`)
  flatten(merged[ns], [ns]).forEach(t => {
    w(`${indent}${krdsVar(t.path)}: ${resolveValue(t.value)};`)
  })
}

w('}')
w('')

// ── 2.3 모바일 미디어쿼리 — responsive-mobile.* 덮어쓰기 ──

w('/* ═══════════════════════════════════════════════════════')
w(' * Mobile 모드 (< 1024px)')
w(' * ═══════════════════════════════════════════════════════ */')
w('@media (max-width: 1023px) {')
w('  :root {')
flatten(merged['responsive-mobile'], ['responsive-mobile']).forEach(t => {
  // pc 토큰명을 그대로 두고 모바일 값으로 덮어씀 — 같은 변수명 사용
  // responsive-mobile.font-size.body.medium → --krds-pc-font-size-body-medium 으로 매핑
  // (KRDS는 PC 기본명을 쓰고 모바일에서 같은 이름을 덮어씀)
  const pcPath = ['responsive-pc', ...t.path.slice(1)]
  w(`${indent}${indent}${krdsVar(pcPath)}: ${resolveValue(t.value)};`)
})
w('  }')
w('}')
w('')

// ── 2.4 High-Contrast 모드 ──

w('/* ═══════════════════════════════════════════════════════')
w(' * High-Contrast 모드')
w(' * ═══════════════════════════════════════════════════════ */')
w('[data-color-mode="high-contrast"] {')
flatten(merged.primitive.color['high-contrast'], ['primitive', 'color', 'high-contrast']).forEach(t => {
  // primary/gray/danger/warning/success/information/point는 light와 동일 hex이므로 secondary와 alpha-shadow만 다름
  // 여기서는 모든 hc 변수를 덮어씀 (안전)
  w(`${indent}${krdsVar(t.path)}: ${resolveValue(t.value)};`)
})
w('')
w('  /* mode-high-contrast.color.* */')
flatten(merged['mode-high-contrast'].color, ['mode-high-contrast', 'color']).forEach(t => {
  // light 변수명을 덮어씀
  const lightPath = ['mode-light', ...t.path.slice(1)]
  w(`${indent}${krdsVar(lightPath)}: ${resolveValue(t.value)};`)
})
w('}')
w('')

// ── 2.5 Tailwind v4 @theme — 시맨틱 별칭 ──

w('/* ═══════════════════════════════════════════════════════')
w(' * Tailwind v4 @theme — 시맨틱 별칭 (유틸리티 노출)')
w(' * ─── Tailwind 기본 토큰 전면 무효화 ───')
w(' *   KRDS가 베이스이므로 Tailwind 기본 색상(oklch)·spacing(0.25rem)·')
w(' *   text-*·shadow-*·radius-*·font-weight-* 모두 비활성화하고 KRDS만 노출.')
w(' * ═══════════════════════════════════════════════════════ */')
w('@theme {')
w('  /* === Tailwind 기본 토큰 무효화 — KRDS 단일 시스템 === */')
w('  --*: initial;')
w('')
w('  /* === Color: Semantic 별칭 === */')
w('  --color-primary: var(--krds-light-color-primary-50);')
w('  --color-primary-hover: var(--krds-light-color-primary-60);')
w('  --color-primary-pressed: var(--krds-light-color-primary-70);')
w('  --color-secondary: var(--krds-light-color-secondary-50);')
w('  --color-text: var(--krds-light-color-text-basic);')
w('  --color-text-bolder: var(--krds-light-color-text-bolder);')
w('  --color-text-subtle: var(--krds-light-color-text-subtle);')
w('  --color-text-disabled: var(--krds-light-color-text-disabled);')
w('  --color-text-inverse: var(--krds-light-color-text-basic-inverse);')
w('  --color-bg: var(--krds-light-color-background-white);')
w('  --color-bg-subtler: var(--krds-light-color-background-gray-subtler);')
w('  --color-bg-subtle: var(--krds-light-color-background-gray-subtle);')
w('  --color-bg-inverse: var(--krds-light-color-background-inverse);')
w('  --color-bg-dim: var(--krds-light-color-background-dim);')
w('  --color-surface: var(--krds-light-color-surface-white);')
w('  --color-surface-subtler: var(--krds-light-color-surface-gray-subtler);')
w('  --color-surface-disabled: var(--krds-light-color-surface-disabled);')
w('  --color-border: var(--krds-light-color-border-gray);')
w('  --color-border-light: var(--krds-light-color-border-gray-light);')
w('  --color-border-dark: var(--krds-light-color-border-gray-dark);')
w('  --color-border-primary: var(--krds-light-color-border-primary);')
w('  --color-border-disabled: var(--krds-light-color-border-disabled);')
w('  --color-danger: var(--krds-light-color-danger-50);')
w('  --color-danger-text: var(--krds-light-color-text-danger);')
w('  --color-danger-surface: var(--krds-light-color-surface-danger-subtler);')
w('  --color-warning: var(--krds-light-color-warning-50);')
w('  --color-warning-text: var(--krds-light-color-text-warning);')
w('  --color-warning-surface: var(--krds-light-color-surface-warning-subtler);')
w('  --color-success: var(--krds-light-color-success-50);')
w('  --color-success-text: var(--krds-light-color-text-success);')
w('  --color-success-surface: var(--krds-light-color-surface-success-subtler);')
w('  --color-info: var(--krds-light-color-information-50);')
w('  --color-info-text: var(--krds-light-color-text-information);')
w('  --color-info-surface: var(--krds-light-color-surface-information-subtler);')
w('  --color-point: var(--krds-light-color-point-50);')
w('')

// Color primitive 단계별 escape hatch — KRDS 5/10/20/30/40/50/60/70/80/90/95
w('  /* === Color: Primitive 단계별 (escape hatch) === */')
const colorGroups = ['primary', 'secondary', 'gray', 'danger', 'warning', 'success', 'information', 'point']
const stages = ['5', '10', '20', '30', '40', '50', '60', '70', '80', '90', '95']
for (const g of colorGroups) {
  // gray는 0과 100도 포함
  const stagesForGroup = (g === 'gray') ? ['0', ...stages, '100'] : stages
  for (const s of stagesForGroup) {
    if (merged.primitive.color.light[g] && merged.primitive.color.light[g][s]) {
      w(`  --color-${g}-${s}: var(--krds-light-color-${g}-${s});`)
    }
  }
}
// graphic은 10/30/50/70/90만
if (merged.primitive.color.light.graphic) {
  for (const s of ['10', '30', '50', '70', '90']) {
    if (merged.primitive.color.light.graphic[s]) {
      w(`  --color-graphic-${s}: var(--krds-light-color-graphic-${s});`)
    }
  }
}
w('')

// Spacing — KRDS number primitive (Tailwind 기본 스케일을 KRDS로 전면 재정의)
w('  /* === Spacing: KRDS number primitive (1rem=10px) === */')
w('  /* Tailwind 기본 --spacing 베이스(0.25rem)는 사용하지 않는다 — KRDS 토큰만 노출 */')
const numberKeys = Object.keys(merged.primitive.number)
for (const k of numberKeys) {
  const v = merged.primitive.number[k].value
  w(`  --spacing-${k}: ${v};`)
}
w('')

// Semantic spacing — gap, padding, size-height
w('  /* === Spacing: Semantic gap/padding/size-height === */')
for (const cat of ['gap', 'padding', 'size-height']) {
  if (!merged.semantic[cat]) continue
  for (const [k, t] of Object.entries(merged.semantic[cat])) {
    if (typeof t === 'object' && 'value' in t) {
      w(`  --${cat}-${k}: var(--krds-${cat}-${k});`)
    }
  }
}
w('')

// Typography
w('  /* === Typography === */')
w('  --font-sans: var(--krds-typo-font-default);')
w('  --font-weight-regular: 400;')
w('  --font-weight-bold: 700;')
w('')
// Tailwind text-* 유틸리티 → KRDS 폰트 사이즈 직접 노출
w('  /* text-* utilities — KRDS PC 기본값. Mobile 미디어쿼리에서 같은 변수가 덮어써짐 */')
const fontCats = { display: ['large', 'medium', 'small'],
                   heading: ['xlarge', 'large', 'medium', 'small', 'xsmall', 'xxsmall'],
                   body: ['large', 'large-bold', 'medium', 'medium-bold', 'small', 'small-bold', 'xsmall', 'xsmall-bold'],
                   label: ['large', 'medium', 'small', 'xsmall'],
                   navigation: ['title-medium', 'title-small', 'depth-medium', 'depth-medium-bold', 'depth-small', 'depth-small-bold'] }
for (const [cat, sizes] of Object.entries(fontCats)) {
  for (const s of sizes) {
    if (merged['responsive-pc']['font-size'][cat] && merged['responsive-pc']['font-size'][cat][s]) {
      w(`  --text-${cat}-${s}: var(--krds-pc-font-size-${cat}-${s});`)
    }
  }
}
w('')

// Breakpoints
w('  /* === Breakpoints === */')
w('  --breakpoint-small: 360px;')
w('  --breakpoint-medium: 768px;')
w('  --breakpoint-large: 1024px;')
w('  --breakpoint-xlarge: 1280px;')
w('  --breakpoint-xxlarge: 1440px;')
w('')

// Radius — KRDS semantic
w('  /* === Radius: KRDS semantic === */')
if (merged.semantic.radius) {
  for (const k of Object.keys(merged.semantic.radius)) {
    if (typeof merged.semantic.radius[k] === 'object' && 'value' in merged.semantic.radius[k]) {
      w(`  --radius-${k}: var(--krds-radius-${k});`)
    }
  }
}
w('')

// Shadow — INFOMIND 추상 elevation
w('  /* === Shadow: INFOMIND 추상 elevation === */')
w('  --shadow-1: var(--krds-infomind-elevation-shadow-1);')
w('  --shadow-2: var(--krds-infomind-elevation-shadow-2);')
w('  --shadow-3: var(--krds-infomind-elevation-shadow-3);')
w('')

// Z-index — INFOMIND
w('  /* === Z-index: INFOMIND 표준 === */')
for (const k of Object.keys(merged['infomind-z-index'])) {
  if (typeof merged['infomind-z-index'][k] === 'object' && 'value' in merged['infomind-z-index'][k]) {
    w(`  --z-${k}: ${merged['infomind-z-index'][k].value};`)
  }
}
w('')

// Motion — INFOMIND
w('  /* === Motion: INFOMIND 표준 === */')
w('  --duration-fast: 0.15s;')
w('  --duration-base: 0.4s;')
w('  --duration-slow: 0.6s;')
w('  --easing-standard: ease-in-out;')
w('  --easing-decelerate: cubic-bezier(0.0, 0.0, 0.2, 1);')
w('  --easing-accelerate: cubic-bezier(0.4, 0.0, 1, 1);')
w('  --easing-linear: linear;')
w('')

// Touch target
w('  /* === Touch Target: WCAG 권장 (INFOMIND 강제) === */')
w('  --touch-target-min: 4.4rem; /* 44px */')

w('}')

fs.writeFileSync(CSS_PATH, lines.join('\n') + '\n')
console.log(`✓ tokens.css (${(fs.statSync(CSS_PATH).size / 1024).toFixed(1)}KB, ${lines.length}줄)`)
console.log('')
console.log('완료. 출력:')
console.log(`  - ${path.relative(ROOT, MERGED_PATH)}`)
console.log(`  - ${path.relative(ROOT, CSS_PATH)}`)
