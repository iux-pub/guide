// check-violations.js의 핵심 정규식 검증 — 옛 토큰·BEM 위반·Tailwind raw 컬러 검출 정합성

const { test } = require('node:test')
const assert = require('node:assert/strict')

// 핵심 정규식 (check-violations.js와 동기화 유지 필수)
const TW_RAW_COLOR = /\b(?:bg|text|border|ring|divide|hover:bg|hover:text|hover:border)-(?:gray|slate|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d+\b/
const HARDCODED_HEX = /:\s*#[0-9a-fA-F]{3,8}\b/
const FOCUS_OUTLINE_NONE = /:focus(?![-:\w])\s*\{[^}]*outline\s*:\s*(?:none|0)/
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
  assert.doesNotMatch(':focus:not(:focus-visible) { outline: none }', FOCUS_OUTLINE_NONE)
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
