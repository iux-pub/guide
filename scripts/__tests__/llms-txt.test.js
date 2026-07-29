// llms.txt 발행 검증
// 문서를 사람용 HTML과 AI용 텍스트 두 형태로 낸다. 텍스트 쪽이 조용히 비거나
// HTML 이스케이프가 섞이면 읽는 쪽(외부 AI)이 잘못된 기준을 학습한다.

const fs = require('node:fs')
const path = require('node:path')
const { test } = require('node:test')
const assert = require('node:assert/strict')

const ROOT = path.resolve(__dirname, '..', '..')
const SITE = path.join(ROOT, '_site')

const built = fs.existsSync(path.join(SITE, 'llms.txt'))

test('루트 llms.txt가 섹션 목록과 MCP 안내를 담는다', { skip: !built && '빌드 전' }, () => {
  const body = fs.readFileSync(path.join(SITE, 'llms.txt'), 'utf8')

  assert.match(body, /INFOMIND UX Guide/)
  assert.match(body, /@infomind-ux\/infoux-mcp/, 'MCP 안내가 있어야 코드 생성 쪽으로 유도된다')
  assert.match(body, /\/components\/llms\.txt/)
  assert.match(body, /\/llms-full\.txt/)
})

test('섹션마다 요약본과 전문이 함께 나온다', { skip: !built && '빌드 전' }, () => {
  const sections = fs
    .readdirSync(SITE, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .filter(name => fs.existsSync(path.join(SITE, name, 'llms.txt')))

  assert.ok(sections.length >= 5, `섹션이 너무 적다 (${sections.length}개)`)

  for (const section of sections) {
    const full = path.join(SITE, section, 'llms-full.txt')
    assert.ok(fs.existsSync(full), `${section}: llms-full.txt 누락`)
    assert.ok(fs.statSync(full).size > 200, `${section}: 전문이 비어 있다`)
  }
})

test('텍스트 산출물에 레이아웃이 적용되지 않는다', { skip: !built && '빌드 전' }, () => {
  // 본문에는 마크업 예제가 정상적으로 들어 있으므로 태그 존재로는 판정할 수 없다.
  // 레이아웃이 씌워졌는지는 파일 첫머리로 본다.
  for (const file of ['llms.txt', 'llms-full.txt', 'components/llms.txt']) {
    const body = fs.readFileSync(path.join(SITE, file), 'utf8')
    assert.match(body.trimStart().slice(0, 40), /^#\s/, `${file}: 헤딩이 아니라 다른 것으로 시작한다`)
    assert.doesNotMatch(
      body.slice(0, 500),
      /<!doctype html|<html\b|<head\b/i,
      `${file}: 레이아웃이 적용됐다`
    )
  }
})

test('전문에 문서 본문이 실제로 들어 있다', { skip: !built && '빌드 전' }, () => {
  const body = fs.readFileSync(path.join(SITE, 'llms-full.txt'), 'utf8')

  assert.ok(body.length > 50_000, `전문이 너무 짧다 (${body.length}자)`)
  // 기준의 핵심 문구가 빠지면 외부 AI가 규칙을 모르는 채 코드를 짠다.
  assert.match(body, /BEM/)
  assert.match(body, /skip-to-content/)
  assert.match(body, /var\(--color-/)
})
