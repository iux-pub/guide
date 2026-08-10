#!/usr/bin/env node
/**
 * 브랜드 팔레트 생성 — seed hex 하나로 tokens/brand.json을 만든다
 *
 * 발주처 CI는 협상 대상이 아니라 주어진 값이다. 그 색을 넣으면 팔레트가
 * 나와야 하고, 나온 결과가 접근성 검사를 통과하는지 즉시 알아야 한다.
 *
 * 생성 규칙의 정본은 프리셋 `$meta.preset.generation.rules`이며 구현은
 * lib/brand-palette.js에 있다. 이 파일은 CLI 껍데기와 대비 검증만 맡는다.
 *
 * 사용법:
 *   node scripts/generate-brand.js --seed "#5A928B"
 *   node scripts/generate-brand.js --seed "#5A928B" --out tokens/brand.json
 *   node scripts/generate-brand.js --seed "#00818c" --id coast-teal --label "관광 청록" \
 *     --mood "바다·환경·청량" --profiles general-site,public-service
 *
 * 규칙이 범위만 정하는 secondary/point는 정책값이 쓰인다.
 * 발주처가 보조색까지 지정했다면 --secondary-hue 등으로 덮는다.
 */

const fs = require('node:fs')
const path = require('node:path')
const { parseArgs } = require('node:util')

const {
  Y_LADDER,
  CHROMA_CURVE,
  derivePalette,
  verifyPalette,
  buildBrandTokens
} = require('./lib/brand-palette')
const { mergeTokens } = require('./lib/token-source')
const { buildTokensCss } = require('./lib/build-tokens-css')
const { PAIRS, parseBlock, parseHex, contrastRatio } = require('./lib/contrast')

const ROOT = path.resolve(__dirname, '..')

const MODES = [
  { id: 'light', selector: ':root' },
  { id: 'high-contrast', selector: '[data-color-mode="high-contrast"]' }
]

/**
 * 생성된 팔레트를 foundation과 합성해 검사쌍 전량을 계산한다.
 * check-presets.js와 같은 경로를 쓴다 — 생성기가 자기 기준으로 통과를
 * 선언하면 의미가 없다.
 */
function auditContrast(foundation, brand) {
  const css = buildTokensCss(mergeTokens(foundation, brand))
  const rootVars = parseBlock(css, ':root')
  if (!rootVars) throw new Error('조립된 tokens.css에서 :root를 찾지 못했다.')

  const violations = []
  let checked = 0

  for (const mode of MODES) {
    const overrides = mode.id === 'light' ? {} : parseBlock(css, mode.selector) ?? {}
    const vars = { ...rootVars, ...overrides }

    for (const [fgName, bgName, minimum, label] of PAIRS) {
      const fg = parseHex(vars[fgName] ?? '')
      const bg = parseHex(vars[bgName] ?? '')
      if (!fg || !bg || fg.a !== 1 || bg.a !== 1) {
        violations.push({ mode: mode.id, label, reason: '계산 불가 (알파 또는 토큰 없음)' })
        continue
      }
      checked += 1
      const ratio = contrastRatio(fg, bg)
      if (ratio < minimum) {
        violations.push({
          mode: mode.id,
          label,
          reason: `${ratio.toFixed(2)}:1 < ${minimum}:1`
        })
      }
    }
  }

  return { checked, violations }
}

/** 생성 파라미터를 결과에 남긴다 — 이게 없으면 나중에 재현할 수 없다. */
function buildMeta(options, palette) {
  const round = (value, digits) => Number(value.toFixed(digits))

  return {
    name: `INFOUX Brand Tokens${options.label ? ` — ${options.label}` : ''}`,
    purpose:
      'tokens/brand.json 자리에 그대로 복사해 쓴다 — cp <this> tokens/brand.json && npm run build:tokens && npm run check:contrast.',
    version: '1.0.0',
    owner: 'INFOMIND UX Team',
    policy:
      '브랜드 계열 팔레트(primary/secondary/point)와 기본 본문 폰트만 정의한다. gray 스케일·상태색(danger/warning/success/information)·border/surface/input 의미 토큰은 foundation이 소유하며 여기서 재정의하지 않는다.',
    modes: 'light와 high-contrast 두 모드 값을 모두 정의해야 한다. 누락 시 build:tokens가 실패한다.',
    preset: {
      id: options.id,
      label: options.label,
      mood: options.mood,
      profiles: options.profiles,
      seed: options.seed,
      generation: {
        colorSpace: 'oklch',
        yLadder: Y_LADDER,
        chromaCurve: CHROMA_CURVE,
        hue: {
          primary: round(palette.primary.hue, 1),
          secondary: round(palette.secondary.hue, 1),
          point: round(palette.point.hue, 1),
          highContrastSecondary: round(palette.highContrastSecondary.hue, 1)
        },
        chroma50: {
          primary: round(palette.primary.chroma50, 3),
          secondary: round(palette.secondary.chroma50, 3),
          point: round(palette.point.chroma50, 3)
        },
        generator: 'scripts/generate-brand.js',
        note:
          'hue·chroma50은 표시용 반올림값이다. 재생성할 때는 seed에서 다시 실측한다 — 반올림값을 입력으로 쓰면 결과가 어긋난다.'
      }
    }
  }
}

/** seed hex에서 brand.json 객체 전체를 만든다. */
function generateBrand(options) {
  const foundation = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'tokens', 'foundation.json'), 'utf8')
  )

  const palette = derivePalette(options.seed, foundation, options.overrides)
  const problems = verifyPalette(palette)

  const brand = {
    $meta: buildMeta(options, palette),
    font: options.font,
    primitive: { color: buildBrandTokens(palette) }
  }

  return { brand, palette, problems, audit: auditContrast(foundation, brand) }
}

const DEFAULT_FONT = {
  family: {
    sans: {
      value: "'Pretendard GOV', 'Apple SD Gothic Neo', 'Noto Sans KR', system-ui, sans-serif",
      $comment: '인포마인드 UX팀 기본 본문 폰트. reset.css의 body에서 var(--font-sans)로 적용한다.'
    },
    heading: {
      value: "'Pretendard GOV', 'Apple SD Gothic Neo', 'Noto Sans KR', system-ui, sans-serif",
      $comment:
        '제목 폰트 슬롯. 표현 등급이 허용하는 프로젝트만 카탈로그 페어링으로 교체한다. 슬롯이 없으면 build:tokens가 --font-heading을 sans 값으로 폴백한다.'
    }
  }
}

function main() {
  const { values } = parseArgs({
    options: {
      seed: { type: 'string' },
      out: { type: 'string' },
      id: { type: 'string', default: 'generated' },
      label: { type: 'string', default: '' },
      mood: { type: 'string', default: '' },
      profiles: { type: 'string', default: 'general-site' },
      'secondary-hue': { type: 'string' },
      'secondary-chroma': { type: 'string' },
      'point-hue': { type: 'string' },
      'point-chroma': { type: 'string' },
      'hc-secondary-hue': { type: 'string' },
      force: { type: 'boolean', default: false },
      help: { type: 'boolean', default: false }
    }
  })

  if (values.help || !values.seed) {
    console.log(`사용법: node scripts/generate-brand.js --seed "#RRGGBB" [옵션]

  --seed <hex>              발주처 CI 주색. 필수.
  --out <path>              쓸 파일. 없으면 표준출력.
  --id / --label / --mood   프리셋 메타.
  --profiles <a,b>          contracts/profiles.json의 유형 키 (쉼표 구분).
  --secondary-hue <deg>     정책 대신 직접 지정 (--secondary-chroma, --point-hue,
  --point-chroma <n>        --point-chroma, --hc-secondary-hue도 같다).
  --force                   대비 위반이 있어도 파일을 쓴다.

규칙이 범위만 정하는 secondary/point는 정책값으로 채운다.
생성 후 검사쌍 전량(2모드)을 계산해 위반이 있으면 종료 코드 1로 끝난다.`)
    process.exit(values.help ? 0 : 1)
  }

  const num = key => (values[key] === undefined ? undefined : Number(values[key]))
  const overrides = {
    secondaryHue: num('secondary-hue'),
    secondaryChroma: num('secondary-chroma'),
    pointHue: num('point-hue'),
    pointChroma: num('point-chroma'),
    highContrastSecondaryHue: num('hc-secondary-hue')
  }

  let result
  try {
    result = generateBrand({
      seed: values.seed,
      id: values.id,
      label: values.label,
      mood: values.mood,
      profiles: values.profiles.split(',').map(s => s.trim()).filter(Boolean),
      font: DEFAULT_FONT,
      overrides
    })
  } catch (error) {
    console.error(`[GENERATE-BRAND] ${error.message}`)
    process.exit(1)
  }
  const { brand, palette, problems, audit } = result

  const json = `${JSON.stringify(brand, null, 2)}\n`

  // 리포트는 표준에러로 — 표준출력은 JSON 전용이라 파이프로 넘길 수 있어야 한다.
  const report = []
  report.push(`seed ${values.seed}`)
  for (const key of ['primary', 'secondary', 'point', 'highContrastSecondary']) {
    const p = palette[key]
    report.push(`  ${key.padEnd(22)} hue ${p.hue.toFixed(1).padStart(6)}  chroma50 ${p.chroma50.toFixed(4)}`)
  }
  report.push(`대비 ${audit.checked}쌍 검사 — 위반 ${audit.violations.length}건`)
  for (const v of audit.violations) report.push(`  ✗ ${v.mode} — ${v.label}: ${v.reason}`)
  for (const p of problems) report.push(`  ⚠ ${p}`)
  console.error(report.join('\n'))

  const blocked = audit.violations.length > 0 && !values.force
  if (values.out && !blocked) {
    fs.writeFileSync(path.resolve(values.out), json)
    console.error(`\n${values.out}에 썼다.`)
  } else if (!values.out) {
    process.stdout.write(json)
  } else {
    console.error('\n대비 위반이 있어 파일을 쓰지 않았다. 색을 조정하거나 --force로 강행한다.')
  }

  process.exit(audit.violations.length > 0 ? 1 : 0)
}

if (require.main === module) main()

module.exports = { generateBrand, auditContrast, DEFAULT_FONT }
