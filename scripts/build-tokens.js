/**
 * 파운데이션 + 브랜드 토큰 빌드 스크립트
 *
 * 입력:
 *   tokens/foundation.json          (불변 계층 — gray 스케일, 상태색, 의미 토큰, 브레이크포인트)
 *   tokens/brand.json               (교체 계층 — 프로젝트 브랜드 팔레트, 본문 폰트)
 *
 * 출력:
 *   tokens/build/tokens.css         (공개 CSS 변수 + Tailwind v4 theme)
 *
 * 프로젝트는 brand.json만 갈아끼운다. foundation.json은 접근성 기준을 담은
 * 불변 계층이므로 프로젝트에서 수정하지 않는다.
 *
 * 라이트와 고대비 두 블록은 **같은 목록에서** 생성한다. 손으로 따로 유지하면
 * 한쪽에만 변수가 늘어나 고대비에서 색이 라이트 값으로 남는다 — 2026-07-29에
 * 실제로 74개 중 21개만 덮여 링크·버튼·상태 텍스트 대비가 깨져 있었다.
 *
 * 사용법: node scripts/build-tokens.js
 */

const fs = require('fs')
const path = require('path')
const { mergeTokens, assertBrandModeParity } = require('./lib/token-source')

const ROOT = path.resolve(__dirname, '..')
const FOUNDATION_PATH = path.join(ROOT, 'tokens', 'foundation.json')
const BRAND_PATH = path.join(ROOT, 'tokens', 'brand.json')
const BUILD_DIR = path.join(ROOT, 'tokens', 'build')
const CSS_PATH = path.join(BUILD_DIR, 'tokens.css')

if (!fs.existsSync(BUILD_DIR)) fs.mkdirSync(BUILD_DIR, { recursive: true })

if (!fs.existsSync(BRAND_PATH)) {
  throw new Error(
    'tokens/brand.json이 없다. 브랜드 계층은 필수다 — 원본에서 복사한 뒤 프로젝트 색상으로 바꾼다.'
  )
}

const foundation = JSON.parse(fs.readFileSync(FOUNDATION_PATH, 'utf-8'))
const brand = JSON.parse(fs.readFileSync(BRAND_PATH, 'utf-8'))

assertBrandModeParity(brand)

const source = mergeTokens(foundation, brand)

function getByPath(tokenPath) {
  return tokenPath.split('.').reduce((acc, key) => acc?.[key], source)
}

function resolveValue(value) {
  if (typeof value !== 'string') return value

  return value.replace(/\{([^}]+)\}/g, (_, ref) => {
    const token = getByPath(ref)
    if (!token || !('value' in token)) {
      throw new Error(`토큰 참조를 찾을 수 없음: ${ref}`)
    }
    return resolveValue(token.value)
  })
}

function readToken(tokenPath) {
  const token = getByPath(tokenPath)
  if (!token || !('value' in token)) {
    throw new Error(`토큰을 찾을 수 없음: ${tokenPath}`)
  }
  return resolveValue(token.value)
}

function cssLine(name, tokenPath) {
  return `  ${name}: ${readToken(tokenPath)};`
}

/** 시맨틱 색상 변수 — 라이트 경로만 적는다. 고대비는 여기서 파생한다. */
const SEMANTIC_COLORS = [
  ['--color-primary', 'primitive.color.light.primary.50'],
  ['--color-primary-hover', 'primitive.color.light.primary.60'],
  ['--color-primary-pressed', 'primitive.color.light.primary.70'],
  ['--color-secondary', 'primitive.color.light.secondary.50'],
  ['--color-text', 'mode-light.color.text.basic'],
  ['--color-text-bolder', 'mode-light.color.text.bolder'],
  ['--color-text-subtle', 'mode-light.color.text.subtle'],
  ['--color-text-disabled', 'mode-light.color.text.disabled'],
  ['--color-text-inverse', 'mode-light.color.text.basic-inverse'],
  ['--color-text-primary', 'mode-light.color.text.primary'],
  ['--color-bg', 'mode-light.color.background.white'],
  ['--color-bg-subtler', 'mode-light.color.background.gray-subtler'],
  ['--color-bg-subtle', 'mode-light.color.background.gray-subtle'],
  ['--color-bg-inverse', 'mode-light.color.background.inverse'],
  ['--color-bg-dim', 'mode-light.color.background.dim'],
  ['--color-surface', 'mode-light.color.surface.white'],
  ['--color-surface-subtler', 'mode-light.color.surface.gray-subtler'],
  ['--color-surface-disabled', 'mode-light.color.surface.disabled'],
  ['--color-surface-primary-subtler', 'mode-light.color.surface.primary-subtler'],
  ['--color-surface-information-subtler', 'mode-light.color.surface.information-subtler'],
  ['--color-surface-success-subtler', 'mode-light.color.surface.success-subtler'],
  ['--color-surface-warning-subtler', 'mode-light.color.surface.warning-subtler'],
  ['--color-surface-danger-subtler', 'mode-light.color.surface.danger-subtler'],
  ['--color-border', 'mode-light.color.border.gray'],
  ['--color-border-light', 'mode-light.color.border.gray-light'],
  ['--color-border-dark', 'mode-light.color.border.gray-dark'],
  ['--color-border-primary', 'mode-light.color.border.primary'],
  ['--color-border-primary-light', 'mode-light.color.border.primary-light'],
  ['--color-border-information-light', 'mode-light.color.border.information-light'],
  ['--color-border-success-light', 'mode-light.color.border.success-light'],
  ['--color-border-warning-light', 'mode-light.color.border.warning-light'],
  ['--color-border-danger-light', 'mode-light.color.border.danger-light'],
  ['--color-border-disabled', 'mode-light.color.border.disabled'],
  ['--color-link', 'mode-light.color.link.default'],
  ['--color-link-hover', 'mode-light.color.link.hover'],
  ['--color-link-pressed', 'mode-light.color.link.pressed'],
  ['--color-link-visited', 'mode-light.color.link.visited'],
  ['--color-button-primary-fill', 'mode-light.color.button.primary-fill'],
  ['--color-button-primary-fill-hover', 'mode-light.color.button.primary-fill-hover'],
  ['--color-button-primary-fill-pressed', 'mode-light.color.button.primary-fill-pressed'],
  ['--color-button-secondary-fill', 'mode-light.color.button.secondary-fill'],
  ['--color-button-secondary-fill-hover', 'mode-light.color.button.secondary-fill-hover'],
  ['--color-button-secondary-fill-pressed', 'mode-light.color.button.secondary-fill-pressed'],
  ['--color-button-secondary-border', 'mode-light.color.button.secondary-border'],
  ['--color-button-tertiary-fill', 'mode-light.color.button.tertiary-fill'],
  ['--color-button-tertiary-fill-hover', 'mode-light.color.button.tertiary-fill-hover'],
  ['--color-button-tertiary-fill-pressed', 'mode-light.color.button.tertiary-fill-pressed'],
  ['--color-button-tertiary-border', 'mode-light.color.button.tertiary-border'],
  ['--color-button-text-fill', 'mode-light.color.button.text-fill'],
  ['--color-button-text-fill-hover', 'mode-light.color.button.text-fill-hover'],
  ['--color-button-text-fill-pressed', 'mode-light.color.button.text-fill-pressed'],
  ['--color-button-text-border', 'mode-light.color.button.text-border'],
  ['--color-button-disabled-fill', 'mode-light.color.button.disabled-fill'],
  ['--color-button-disabled-border', 'mode-light.color.button.disabled-border'],
  ['--color-input-surface', 'mode-light.color.input.surface'],
  ['--color-input-surface-disabled', 'mode-light.color.input.surface-disabled'],
  ['--color-input-border', 'mode-light.color.input.border'],
  ['--color-input-border-active', 'mode-light.color.input.border-active'],
  ['--color-input-border-disabled', 'mode-light.color.input.border-disabled'],
  ['--color-input-border-error', 'mode-light.color.input.border-error'],
  ['--color-danger', 'primitive.color.light.danger.50'],
  ['--color-danger-text', 'mode-light.color.text.danger'],
  ['--color-danger-surface', 'mode-light.color.surface.danger-subtler'],
  ['--color-warning', 'primitive.color.light.warning.50'],
  ['--color-warning-text', 'mode-light.color.text.warning'],
  ['--color-warning-surface', 'mode-light.color.surface.warning-subtler'],
  ['--color-success', 'primitive.color.light.success.50'],
  ['--color-success-text', 'mode-light.color.text.success'],
  ['--color-success-surface', 'mode-light.color.surface.success-subtler'],
  ['--color-info', 'primitive.color.light.information.50'],
  ['--color-info-text', 'mode-light.color.text.information'],
  ['--color-info-surface', 'mode-light.color.surface.information-subtler'],
  ['--color-point', 'primitive.color.light.point.50']
]

/** 스케일 뒤에 오는 알파 값. 출력 순서를 지키려고 따로 둔다. */
const ALPHA_COLORS = [
  ['--color-alpha-black-50', 'primitive.color.light.alpha.black50'],
  ['--color-alpha-black-75', 'primitive.color.light.alpha.black75']
]

/** 라이트 토큰 경로를 같은 의미의 고대비 경로로 바꾼다. */
function toHighContrast(tokenPath) {
  return tokenPath
    .replace('mode-light', 'mode-high-contrast')
    .replace('primitive.color.light', 'primitive.color.high-contrast')
}

const COLOR_GROUPS = ['primary', 'secondary', 'gray', 'danger', 'warning', 'success', 'information', 'point']
const STAGES = ['5', '10', '20', '30', '40', '50', '60', '70', '80', '90', '95']

/** 단계 색상은 gray만 0·100을 더 갖는다. */
function stagesOf(group) {
  return group === 'gray' ? ['0', ...STAGES, '100'] : STAGES
}

const lines = []
const w = (s) => lines.push(s)

/** 한 모드의 색상 선언 전체를 쓴다. mode는 'light' | 'high-contrast'. */
function writeColorBlock(mode) {
  const resolve = mode === 'light' ? (p) => p : toHighContrast
  const palette = source.primitive.color[mode]

  w('  /* Semantic colors */')
  for (const [name, tokenPath] of SEMANTIC_COLORS) w(cssLine(name, resolve(tokenPath)))
  w('')
  w('  /* 단계 색상: 필요한 경우에만 제한적으로 사용 */')
  for (const group of COLOR_GROUPS) {
    for (const stage of stagesOf(group)) {
      if (palette[group]?.[stage]) {
        w(cssLine(`--color-${group}-${stage}`, `primitive.color.${mode}.${group}.${stage}`))
      }
    }
  }
  for (const [name, tokenPath] of ALPHA_COLORS) w(cssLine(name, resolve(tokenPath)))
}

w('/**')
w(' * AUTO-GENERATED — tokens/build/tokens.css')
w(' * 출처: tokens/foundation.json + tokens/brand.json')
w(' * 직접 수정 금지. 브랜드 변경은 tokens/brand.json에서 한다.')
w(' *')
w(' * 공개 토큰은 색상, 기본 폰트, 브레이크포인트만 발행한다.')
w(' * 간격·크기·타이포 스케일·반경·모션·그림자·z-index는 CSS/Tailwind 직접값으로 작성한다.')
w(' */')
w('')
w(':root {')
w('  /* Font families */')
w(cssLine('--font-sans', 'font.family.sans'))
w(cssLine('--font-mono', 'font.family.mono'))
w('')
w('  /* Breakpoints */')
w(cssLine('--breakpoint-mobile', 'breakpoint.mobile'))
w(cssLine('--breakpoint-tablet', 'breakpoint.tablet'))
w(cssLine('--breakpoint-pc', 'breakpoint.pc'))
w('')
writeColorBlock('light')
w('}')
w('')
w('[data-color-mode="high-contrast"] {')
writeColorBlock('high-contrast')
w('}')
w('')
w('@theme {')
w('  /* Tailwind 기본 색상 팔레트 비활성화 — INFOUX 색상만 노출 */')
w('  --color-*: initial;')
w('')
w(`  --font-sans: ${readToken('font.family.sans')};`)
w(`  --font-mono: ${readToken('font.family.mono')};`)
w('')
w('  /* Tailwind responsive variants: mobile:, tablet:, pc: */')
w('  --breakpoint-*: initial;')
w(`  --breakpoint-mobile: ${readToken('breakpoint.mobile')};`)
w(`  --breakpoint-tablet: ${readToken('breakpoint.tablet')};`)
w(`  --breakpoint-pc: ${readToken('breakpoint.pc')};`)
w('')
for (const [name] of [...SEMANTIC_COLORS, ...ALPHA_COLORS]) {
  w(`  ${name}: var(${name});`)
}
for (const group of COLOR_GROUPS) {
  for (const stage of stagesOf(group)) {
    if (source.primitive.color.light[group]?.[stage]) {
      w(`  --color-${group}-${stage}: var(--color-${group}-${stage});`)
    }
  }
}
w('}')

fs.writeFileSync(CSS_PATH, lines.join('\n') + '\n')
console.log(`✓ tokens.css (${(fs.statSync(CSS_PATH).size / 1024).toFixed(1)}KB, ${lines.length}줄)`)
console.log('')
console.log('완료. 출력:')
console.log(`  - ${path.relative(ROOT, CSS_PATH)}`)
