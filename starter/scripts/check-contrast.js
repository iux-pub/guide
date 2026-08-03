#!/usr/bin/env node
/**
 * 색상 대비 자동검증 (R-12)
 *
 * 브랜드 계층을 교체 가능하게 만든 대가로 반드시 있어야 하는 안전망이다.
 * 프로젝트가 tokens/brand.json을 바꾸면 이 검사가 WCAG 2.1 AA 위반을 잡는다.
 *
 * 생성된 tokens/build/tokens.css를 읽는다 — 소스가 아니라 실제 산출물을 본다.
 * 모드별로 [data-color-mode="high-contrast"]가 :root를 덮은 결과를 계산한다.
 *
 * 기준: 일반 텍스트 4.5:1, 큰 텍스트 3:1, 비텍스트 UI 요소 3:1 (WCAG 1.4.3 / 1.4.11)
 * 제외: disabled 상태 (WCAG 1.4.3 예외)
 * 검사쌍과 계산 함수의 정본은 scripts/lib/contrast.js다.
 *
 * 사용법: node scripts/check-contrast.js
 */

const fs = require('node:fs')
const path = require('node:path')
const { PAIRS, parseBlock, parseHex, contrastRatio } = require('./lib/contrast')

const ROOT = path.resolve(__dirname, '..')
const CSS_PATH = path.join(ROOT, 'tokens', 'build', 'tokens.css')
const BASELINE_PATH = path.join(ROOT, 'tokens', 'contrast-baseline.json')

const MODES = [
  { id: 'light', selector: ':root' },
  { id: 'high-contrast', selector: '[data-color-mode="high-contrast"]' }
]

const css = fs.readFileSync(CSS_PATH, 'utf8')
const rootVars = parseBlock(css, ':root')
if (!rootVars) {
  console.error('[CONTRAST] tokens.css에서 :root 블록을 찾지 못했다. npm run build:tokens를 먼저 돌린다.')
  process.exit(1)
}

/**
 * 기존 위반 기준선. 이미 있는 위반 때문에 검사를 통째로 끄지 않기 위한 래칫이다.
 * - 기준선에 없는 새 위반 → 실패 (브랜드 교체가 접근성을 깨는 것을 여기서 잡는다)
 * - 기준선에 있는데 이제 통과 → 실패 (기준선을 지우라고 알린다. 방치되면 썩는다)
 */
const baseline = fs.existsSync(BASELINE_PATH)
  ? JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf8'))
  : { known: [] }
const baselineKeys = new Set(baseline.known.map(item => item.id))

let newViolations = 0
let known = 0
let checked = 0
const skipped = []
const resolved = []

for (const mode of MODES) {
  const overrides = mode.id === 'light' ? {} : parseBlock(css, mode.selector) ?? {}
  const vars = { ...rootVars, ...overrides }

  for (const [fgName, bgName, minimum, label] of PAIRS) {
    const id = `${mode.id}|${fgName}|${bgName}`
    const fg = parseHex(vars[fgName] ?? '')
    const bg = parseHex(vars[bgName] ?? '')

    // 알파가 섞인 값은 실제 합성 배경을 모르면 계산할 수 없다. 조용히 넘기지 않고 남긴다.
    if (!fg || !bg || fg.a !== 1 || bg.a !== 1) {
      skipped.push(`${mode.id}: ${fgName} on ${bgName} (${label})`)
      continue
    }

    checked++
    const ratio = contrastRatio(fg, bg)
    const fails = ratio < minimum

    if (fails && baselineKeys.has(id)) {
      known++
      continue
    }
    if (!fails && baselineKeys.has(id)) {
      resolved.push(`${id} — 이제 ${ratio.toFixed(2)}:1로 통과한다`)
      continue
    }
    if (fails) {
      newViolations++
      console.error(
        `[CONTRAST] ${mode.id} — ${label}: ${fgName}(${vars[fgName]}) on ${bgName}(${vars[bgName]}) ` +
        `= ${ratio.toFixed(2)}:1 (최소 ${minimum}:1)`
      )
    }
  }
}

if (skipped.length) {
  console.log(`ℹ 계산 불가로 건너뛴 조합 ${skipped.length}건 (알파 채널 또는 토큰 없음):`)
  for (const item of skipped) console.log(`    ${item}`)
}

if (resolved.length) {
  console.error('[CONTRAST] 기준선이 낡았다 — 아래 항목은 이제 통과한다. tokens/contrast-baseline.json에서 지운다:')
  for (const item of resolved) console.error(`    ${item}`)
  process.exit(1)
}

if (newViolations > 0) {
  console.error(`\n✗ 대비 검사 실패 — 신규 위반 ${newViolations}건 (검사 ${checked}건)`)
  console.error('  tokens/brand.json의 브랜드 색을 조정하거나, 해당 조합을 쓰지 않도록 설계를 바꾼다.')
  process.exit(1)
}

const suffix = known > 0 ? ` — 기준선에 기록된 기존 위반 ${known}건은 별도 과제로 남아 있다` : ''
console.log(`✓ 대비 검사 통과 — 신규 위반 없음 (검사 ${checked}건, WCAG 2.1 AA)${suffix}`)
