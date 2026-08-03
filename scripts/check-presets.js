#!/usr/bin/env node
/**
 * 팔레트 프리셋 검사 (tokens/presets/*.json)
 *
 * 프리셋은 brand.json 자리에 그대로 복사해 쓰는 완전 동형 파일이다.
 * "대비 위반 0건으로 입고"가 유일한 정책이므로 contrast-baseline.json은
 * 참조하지 않는다 — 래칫은 현행 brand.json의 사정이지 프리셋의 사정이 아니다.
 *
 * 검사 3종:
 *   ① 대비 — foundation과 합성해 tokens.css를 조립하고 검사쌍 전량(2모드)을 계산, 위반 0건
 *   ② 동형성 — brand.json과 구조 동일 + 불변층(gray·상태색·의미 토큰) 침범 금지
 *   ③ 완전성 — 11단계×3그룹×2모드 hex 전량 + $meta.preset 필수 필드 + profiles.json id 정합
 *
 * 사용법: node scripts/check-presets.js
 */

const fs = require('node:fs')
const path = require('node:path')
const { BRAND_GROUPS, BRAND_MODES, mergeTokens, assertBrandModeParity } = require('./lib/token-source')
const { buildTokensCss } = require('./lib/build-tokens-css')
const { PAIRS, parseBlock, parseHex, contrastRatio } = require('./lib/contrast')

const ROOT = path.resolve(__dirname, '..')
const PRESETS_DIR = path.join(ROOT, 'tokens', 'presets')

const STAGES = ['5', '10', '20', '30', '40', '50', '60', '70', '80', '90', '95']
const PROTECTED_GROUPS = ['gray', 'danger', 'warning', 'success', 'information']
const META_REQUIRED = ['id', 'label', 'mood', 'profiles', 'seed', 'generation']
const MODES = [
  { id: 'light', selector: ':root' },
  { id: 'high-contrast', selector: '[data-color-mode="high-contrast"]' }
]

let errors = 0

function fail(presetId, message) {
  console.error(`[PRESET] ${presetId}: ${message}`)
  errors++
}

/** $ 접두 키를 뺀 구조 서명 — 값은 무시하고 키 트리만 본다. */
function shapeOf(node) {
  if (!node || typeof node !== 'object' || Array.isArray(node)) return typeof node
  const keys = Object.keys(node).filter(key => !key.startsWith('$')).sort()
  return Object.fromEntries(keys.map(key => [key, shapeOf(node[key])]))
}

const foundation = JSON.parse(fs.readFileSync(path.join(ROOT, 'tokens', 'foundation.json'), 'utf8'))
const brand = JSON.parse(fs.readFileSync(path.join(ROOT, 'tokens', 'brand.json'), 'utf8'))
const brandShape = JSON.stringify(shapeOf(brand))
const profileIds = new Set(
  JSON.parse(fs.readFileSync(path.join(ROOT, 'contracts', 'profiles.json'), 'utf8')).profiles.map(p => p.id)
)

const presetFiles = fs.existsSync(PRESETS_DIR)
  ? fs.readdirSync(PRESETS_DIR).filter(name => name.endsWith('.json')).sort()
  : []
if (presetFiles.length === 0) {
  console.error('[PRESET] tokens/presets/에 프리셋 파일이 없다.')
  process.exit(1)
}

let totalChecked = 0

for (const file of presetFiles) {
  const presetId = file.replace(/\.json$/, '')
  let preset
  try {
    preset = JSON.parse(fs.readFileSync(path.join(PRESETS_DIR, file), 'utf8'))
  } catch (error) {
    fail(presetId, `JSON 파싱 실패 — ${error.message}`)
    continue
  }

  // ── ② 동형성: brand.json 자리에 그대로 들어갈 수 있는 구조인가 ──
  if (JSON.stringify(shapeOf(preset)) !== brandShape) {
    fail(presetId, 'brand.json과 구조가 다르다 — 프리셋은 완전 동형이어야 교체 가능하다.')
  }
  try {
    assertBrandModeParity(preset)
  } catch (error) {
    fail(presetId, error.message)
  }
  // 불변층 침범 금지 — gray·상태색은 foundation 소유다 (접근성 기준이 프리셋마다 흔들리면 안 된다)
  for (const mode of BRAND_MODES) {
    for (const group of PROTECTED_GROUPS) {
      if (preset.primitive?.color?.[mode]?.[group] !== undefined) {
        fail(presetId, `${mode}.${group}을 재정의한다 — 불변층은 foundation 소유다.`)
      }
    }
  }
  for (const layer of ['mode-light', 'mode-high-contrast', 'breakpoint']) {
    if (preset[layer] !== undefined) {
      fail(presetId, `${layer} 계층을 건드린다 — 프리셋은 브랜드 팔레트와 본문 폰트만 정의한다.`)
    }
  }

  // ── ③ 완전성: 11단계 × 3그룹 × 2모드 + $meta.preset ──
  for (const mode of BRAND_MODES) {
    for (const group of BRAND_GROUPS) {
      const stages = preset.primitive?.color?.[mode]?.[group] ?? {}
      const missing = STAGES.filter(stage => !stages[stage])
      const extra = Object.keys(stages).filter(stage => !STAGES.includes(stage))
      if (missing.length) fail(presetId, `${mode}.${group}에 ${missing.join(', ')} 단계가 없다.`)
      if (extra.length) fail(presetId, `${mode}.${group}에 정의 밖 단계가 있다 — ${extra.join(', ')}`)
      for (const [stage, token] of Object.entries(stages)) {
        const parsed = parseHex(token?.value ?? '')
        if (!parsed || parsed.a !== 1) {
          fail(presetId, `${mode}.${group}.${stage} 값이 불투명 hex가 아니다: ${token?.value}`)
        }
      }
    }
  }

  const presetMeta = preset.$meta?.preset
  if (!presetMeta) {
    fail(presetId, '$meta.preset 블록이 없다.')
  } else {
    for (const field of META_REQUIRED) {
      if (presetMeta[field] === undefined) fail(presetId, `$meta.preset.${field}가 없다.`)
    }
    if (presetMeta.id !== presetId) {
      fail(presetId, `$meta.preset.id(${presetMeta.id})가 파일명과 다르다.`)
    }
    const profiles = Array.isArray(presetMeta.profiles) ? presetMeta.profiles : []
    if (profiles.length === 0) fail(presetId, '$meta.preset.profiles가 비어 있다.')
    for (const id of profiles) {
      if (!profileIds.has(id)) fail(presetId, `$meta.preset.profiles의 ${id}가 contracts/profiles.json에 없다.`)
    }
  }

  // ── ① 대비: 검사쌍 전량 × 2모드 위반 0건 — 프리셋은 계산 불가 조합도 실격이다 ──
  let css
  try {
    css = buildTokensCss(mergeTokens(foundation, preset))
  } catch (error) {
    fail(presetId, `tokens.css 조립 실패 — ${error.message}`)
    continue
  }
  const rootVars = parseBlock(css, ':root')
  if (!rootVars) {
    fail(presetId, '조립된 tokens.css에서 :root 블록을 찾지 못했다.')
    continue
  }

  for (const mode of MODES) {
    const overrides = mode.id === 'light' ? {} : parseBlock(css, mode.selector) ?? {}
    const vars = { ...rootVars, ...overrides }

    for (const [fgName, bgName, minimum, label] of PAIRS) {
      const fg = parseHex(vars[fgName] ?? '')
      const bg = parseHex(vars[bgName] ?? '')
      if (!fg || !bg || fg.a !== 1 || bg.a !== 1) {
        fail(presetId, `${mode.id} — ${label}: ${fgName} on ${bgName} 계산 불가 (알파 또는 토큰 없음)`)
        continue
      }
      totalChecked++
      const ratio = contrastRatio(fg, bg)
      if (ratio < minimum) {
        fail(
          presetId,
          `${mode.id} — ${label}: ${fgName}(${vars[fgName]}) on ${bgName}(${vars[bgName]}) ` +
          `= ${ratio.toFixed(2)}:1 (최소 ${minimum}:1)`
        )
      }
    }
  }
}

if (errors > 0) {
  console.error(`\n✗ 프리셋 검사 실패 — ${errors}건. 프리셋은 위반 0건으로만 입고한다 (baseline 없음).`)
  process.exit(1)
}

console.log(
  `✓ 프리셋 검사 통과 — ${presetFiles.length}종, 대비 ${totalChecked}건 위반 0 (brand 동형·불변층·완전성 포함)`
)
