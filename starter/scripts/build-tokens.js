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
 * CSS 조립은 scripts/lib/build-tokens-css.js가 담당한다 — 여기서는 입출력만 한다.
 *
 * 사용법: node scripts/build-tokens.js
 */

const fs = require('fs')
const path = require('path')
const { mergeTokens, assertBrandModeParity } = require('./lib/token-source')
const { buildTokensCss } = require('./lib/build-tokens-css')

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
const css = buildTokensCss(source)

fs.writeFileSync(CSS_PATH, css)
console.log(`✓ tokens.css (${(fs.statSync(CSS_PATH).size / 1024).toFixed(1)}KB, ${css.split('\n').length - 1}줄)`)
console.log('')
console.log('완료. 출력:')
console.log(`  - ${path.relative(ROOT, CSS_PATH)}`)
