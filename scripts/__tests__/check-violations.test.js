// check-violations.js의 핵심 정규식 검증 — 옛 토큰·BEM 위반·Tailwind raw 컬러 검출 정합성

const { test } = require('node:test')
const assert = require('node:assert/strict')

// 핵심 정규식 (check-violations.js와 동기화 유지 필수)
const TW_RAW_COLOR = /\b(?:bg|text|border|ring|divide|hover:bg|hover:text|hover:border)-(?:gray|slate|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d+\b/
const HARDCODED_HEX = /:\s*#[0-9a-fA-F]{3,8}\b/
const FOCUS_OUTLINE_NONE = /:focus(?![-:\w])\s*\{[^}]*outline\s*:\s*(?:none\b|0\s*(?:!important)?\s*(?:;|}))/
const CSS_HAS_SELECTOR = /:has\(/
const BEM_DOUBLE_ELEMENT = /\.([\w-]+)__([\w-]+)__([\w-]+)/
const SCSS_USE = /@use\s+['"]/
const MISSING_ALT = /<img(?![^>]*\balt\s*=)[^>]*\bsrc\s*=[^>]*>/
const CLICK_ON_DIV = /<(?:div|span)[^>]+onclick/

test('TW_RAW_COLOR — bg-red-500 같은 raw 컬러 검출', () => {
  assert.match('bg-red-500', TW_RAW_COLOR)
  assert.match('text-gray-700', TW_RAW_COLOR)
  assert.match('hover:bg-blue-600', TW_RAW_COLOR)
})

test('TW_RAW_COLOR — KRDS 토큰 클래스는 매칭 안 됨', () => {
  assert.doesNotMatch('bg-primary', TW_RAW_COLOR)
  assert.doesNotMatch('text-base', TW_RAW_COLOR)
})

test('HARDCODED_HEX — color: #ff0000 검출', () => {
  assert.match('color: #ff0000;', HARDCODED_HEX)
  assert.match('background: #abc;', HARDCODED_HEX)
})

test('HARDCODED_HEX — var()는 매칭 안 됨', () => {
  assert.doesNotMatch('color: var(--color-primary);', HARDCODED_HEX)
})

test('FOCUS_OUTLINE_NONE — 포커스 outline 제거 검출', () => {
  assert.match(':focus { outline: none }', FOCUS_OUTLINE_NONE)
  assert.match(':focus { outline: 0; }', FOCUS_OUTLINE_NONE)
})

test('FOCUS_OUTLINE_NONE — :focus-visible 패턴은 매칭 안 됨', () => {
  assert.doesNotMatch(':focus-visible { outline: 4px solid blue }', FOCUS_OUTLINE_NONE)
  assert.doesNotMatch(':focus { outline: 0.4rem solid var(--color-border-primary); }', FOCUS_OUTLINE_NONE)
  assert.doesNotMatch(':focus:not(:focus-visible) { outline: none }', FOCUS_OUTLINE_NONE)
})

test('CSS_HAS_SELECTOR — :has() 선택자 검출', () => {
  assert.match('.field:has(input:disabled) { }', CSS_HAS_SELECTOR)
  assert.match('.check:hover:not(:has(input:disabled)) .check__box { }', CSS_HAS_SELECTOR)
})

test('CSS_HAS_SELECTOR — sibling/ARIA selector는 매칭 안 됨', () => {
  assert.doesNotMatch('.field input:disabled ~ .field__label { }', CSS_HAS_SELECTOR)
  assert.doesNotMatch('.disclosure[aria-expanded="true"] + .disclosure__panel { }', CSS_HAS_SELECTOR)
})

test('BEM_DOUBLE_ELEMENT — 2단계 element 중첩 검출', () => {
  assert.match('.card__header__title { }', BEM_DOUBLE_ELEMENT)
})

test('BEM_DOUBLE_ELEMENT — 1단계 element는 매칭 안 됨', () => {
  assert.doesNotMatch('.card__header { }', BEM_DOUBLE_ELEMENT)
  assert.doesNotMatch('.btn--primary { }', BEM_DOUBLE_ELEMENT)
})

test('SCSS_USE — @use 검출', () => {
  assert.match("@use '../1-settings'", SCSS_USE)
})

test('MISSING_ALT — img src 있고 alt 없음 검출', () => {
  assert.match('<img src="photo.jpg">', MISSING_ALT)
})

test('MISSING_ALT — alt 있으면 매칭 안 됨 (빈 alt 포함)', () => {
  assert.doesNotMatch('<img src="x.jpg" alt="설명">', MISSING_ALT)
  assert.doesNotMatch('<img src="x.svg" alt="">', MISSING_ALT)
})

test('CLICK_ON_DIV — div onclick 검출', () => {
  assert.match('<div onclick="fn()">', CLICK_ON_DIV)
})

test('CLICK_ON_DIV — button onclick은 매칭 안 됨', () => {
  assert.doesNotMatch('<button onclick="fn()">', CLICK_ON_DIV)
})

// ─── 정의되지 않은 토큰 참조 (R-01) ─────────────────────────────────
// 문서가 이름을 잘못 적거나 이름을 지어내도 var() 형식은 맞아서 통과하던 구멍.
// 정규식 복사본이 아니라 실제 스크립트를 임시 CSS 에 돌려 본다.

const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { spawnSync } = require('node:child_process')

const CHECK_VIOLATIONS = path.resolve(__dirname, '..', 'check-violations.js')

function runOnCss(source) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'iux-css-'))
  const file = path.join(dir, 'sample.css')
  // R-19 (@apply 필수)를 만족시키는 최소 골격
  fs.writeFileSync(file, `@layer components {\n  .sample {\n    @apply flex;\n${source}\n  }\n}\n`)
  return spawnSync(process.execPath, [CHECK_VIOLATIONS, file], {
    cwd: path.resolve(__dirname, '..', '..'),
    encoding: 'utf8'
  })
}

test('토큰 소스에 있는 이름은 통과한다', () => {
  const result = runOnCss('    color: var(--color-information-60);\n    background: var(--color-info-surface);')
  assert.equal(result.status, 0, result.stdout + result.stderr)
})

test('토큰 소스에 없는 이름은 R-01 오류로 실패한다 (--color-info-60 은 실존하지 않는다)', () => {
  const result = runOnCss('    background: var(--color-info-60);')
  assert.equal(result.status, 2)
  assert.match(result.stdout + result.stderr, /정의되지 않은 토큰 var\(--color-info-60\)/)
})

test('폰트·브레이크포인트 접두도 같은 규칙을 받는다', () => {
  const result = runOnCss('    font-family: var(--font-display);')
  assert.equal(result.status, 2)
  assert.match(result.stdout + result.stderr, /정의되지 않은 토큰 var\(--font-display\)/)
})

test('대체값이 있는 var() 는 없을 수 있음을 알고 쓴 것이므로 넘긴다', () => {
  const result = runOnCss('    color: var(--color-project-accent, currentcolor);')
  assert.equal(result.status, 0, result.stdout + result.stderr)
})

test('같은 파일에서 직접 선언한 커스텀 프로퍼티는 정의된 것으로 본다', () => {
  const result = runOnCss('    --color-local-tint: currentcolor;\n    background: var(--color-local-tint);')
  assert.equal(result.status, 0, result.stdout + result.stderr)
})

test('토큰 접두가 아닌 커스텀 프로퍼티(--card-ratio 등)는 검사하지 않는다', () => {
  const result = runOnCss('    aspect-ratio: var(--card-ratio);')
  assert.equal(result.status, 0, result.stdout + result.stderr)
})
