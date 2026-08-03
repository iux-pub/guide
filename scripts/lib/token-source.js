/**
 * 토큰 소스 합성 — foundation(불변) + brand(교체)
 *
 * 브랜드 교체 가능성을 만드는 계층이다. 프로젝트는 brand.json만 갈아끼우고
 * foundation.json은 건드리지 않는다. 두 파일을 읽는 쪽(build-tokens,
 * check-contrast, 테스트)이 같은 합성 결과를 보도록 여기 한 곳에 둔다.
 */

const fs = require('node:fs')
const path = require('node:path')

const BRAND_GROUPS = ['primary', 'secondary', 'point']
const BRAND_MODES = ['light', 'high-contrast']

/** brand가 foundation을 덮는 깊은 병합. 원본 객체는 건드리지 않는다. */
function mergeTokens(base, override) {
  if (!override || typeof override !== 'object' || Array.isArray(override)) return override ?? base
  if (!base || typeof base !== 'object' || Array.isArray(base)) return override

  const merged = { ...base }
  for (const [key, value] of Object.entries(override)) {
    if (key === '$meta') continue
    merged[key] = key in base ? mergeTokens(base[key], value) : value
  }
  return merged
}

/**
 * 브랜드 팔레트가 light와 high-contrast 양쪽에 같은 단계를 갖췄는지 본다.
 * 프로젝트가 브랜드를 바꿀 때 라이트만 채우고 고대비를 잊는 것이 가장 흔한
 * 사고다. 그대로 두면 고대비 모드에서 색이 사라진다.
 */
function assertBrandModeParity(brand) {
  const color = brand?.primitive?.color
  if (!color) throw new Error('brand.json에 primitive.color가 없다.')

  const errors = []
  for (const group of BRAND_GROUPS) {
    const stagesByMode = BRAND_MODES.map(mode => ({
      mode,
      stages: Object.keys(color[mode]?.[group] ?? {}).sort()
    }))

    const [light, contrast] = stagesByMode
    if (light.stages.length === 0) {
      errors.push(`${group}: light 팔레트가 비어 있다`)
      continue
    }

    const missing = light.stages.filter(stage => !contrast.stages.includes(stage))
    const extra = contrast.stages.filter(stage => !light.stages.includes(stage))
    if (missing.length) errors.push(`${group}: high-contrast에 ${missing.join(', ')} 단계가 없다`)
    if (extra.length) errors.push(`${group}: light에 없는 단계가 high-contrast에 있다 — ${extra.join(', ')}`)
  }

  if (errors.length) {
    throw new Error(`brand.json 모드 정합 실패:\n  - ${errors.join('\n  - ')}`)
  }
}

/**
 * R-26 폰트 한글 fallback — --font-sans·--font-heading 스택의 한글 가용 폰트 판정 정본.
 * 영문 display 폰트만 적으면 한글이 시스템 기본 서체로 떨어져 조판이 깨진다.
 */
const HANGUL_FONT_PATTERN = /(Pretendard|Noto\s*(Sans|Serif)\s*KR|Wanted\s*Sans|Hahmlet|IBM\s*Plex\s*Sans\s*KR|Nanum|Spoqa|Malgun|Apple\s*SD\s*Gothic)/i

/**
 * 본문·제목 폰트 스택에 한글 가용 폰트가 포함됐는지 검사한다 (R-26).
 * 미정의 슬롯은 통과시킨다 — heading 슬롯이 없는 구 brand.json 파생 사이트가
 * 빌드에서 끊기면 안 된다.
 */
function assertHangulFontFallback(source) {
  const { readToken } = createResolver(source)
  const errors = []
  for (const slot of ['sans', 'heading']) {
    if (!source?.font?.family?.[slot]) continue
    const value = readToken(`font.family.${slot}`)
    if (!HANGUL_FONT_PATTERN.test(value)) {
      errors.push(`font.family.${slot}: 스택에 한글 가용 폰트가 없다 — ${value}`)
    }
  }
  if (errors.length) {
    throw new Error(`R-26 폰트 한글 fallback 실패:\n  - ${errors.join('\n  - ')}`)
  }
}

/** foundation + brand를 읽어 합성한 토큰 소스를 돌려준다. */
function loadTokenSource(root) {
  const foundation = JSON.parse(fs.readFileSync(path.join(root, 'tokens', 'foundation.json'), 'utf8'))
  const brandPath = path.join(root, 'tokens', 'brand.json')
  if (!fs.existsSync(brandPath)) {
    throw new Error('tokens/brand.json이 없다. 브랜드 계층은 필수다.')
  }
  const brand = JSON.parse(fs.readFileSync(brandPath, 'utf8'))
  assertBrandModeParity(brand)
  return mergeTokens(foundation, brand)
}

/** `{path.to.token}` 참조를 실제 값으로 푼다. */
function createResolver(source) {
  function getByPath(tokenPath) {
    return tokenPath.split('.').reduce((acc, key) => acc?.[key], source)
  }

  function resolveValue(value) {
    if (typeof value !== 'string') return value
    return value.replace(/\{([^}]+)\}/g, (_, ref) => {
      const token = getByPath(ref)
      if (!token || !('value' in token)) throw new Error(`토큰 참조를 찾을 수 없음: ${ref}`)
      return resolveValue(token.value)
    })
  }

  function readToken(tokenPath) {
    const token = getByPath(tokenPath)
    if (!token || !('value' in token)) throw new Error(`토큰을 찾을 수 없음: ${tokenPath}`)
    return resolveValue(token.value)
  }

  return { getByPath, resolveValue, readToken }
}

module.exports = {
  BRAND_GROUPS,
  BRAND_MODES,
  HANGUL_FONT_PATTERN,
  mergeTokens,
  assertBrandModeParity,
  assertHangulFontFallback,
  loadTokenSource,
  createResolver
}
