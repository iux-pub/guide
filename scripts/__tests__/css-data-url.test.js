// src/styles의 SVG data URL이 깨지지 않았는지 검증
// Tailwind v4는 @apply 임의값의 밑줄(_)을 공백으로 바꾸지만 url() 안은 그대로 둔다.
// 그래서 url("data:image/svg+xml;utf8,<svg_xmlns=...>")는 <svg_xmlns=...>로 남아 이미지가 깨진다
// (체크박스 체크 표시·셀렉트·아코디언·디스클로저·브레드크럼·메인 메뉴 화살표가 안 보였다). url() 안 공백은 %20으로 쓴다.

const fs = require('node:fs')
const path = require('node:path')
const { test } = require('node:test')
const assert = require('node:assert/strict')

const ROOT = path.resolve(__dirname, '..', '..')
const STYLES_DIR = path.join(ROOT, 'src', 'styles')
const DATA_URL = /url\((["'])(data:image\/svg\+xml.*?)\1\)/g

function cssFiles(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) cssFiles(full, out)
    else if (entry.name.endsWith('.css')) out.push(full)
  }
  return out
}

test('SVG data URL 안에 밑줄을 쓰지 않는다 — 공백은 %20', () => {
  const broken = []
  for (const file of cssFiles(STYLES_DIR)) {
    const source = fs.readFileSync(file, 'utf8')
    for (const match of source.matchAll(DATA_URL)) {
      if (match[2].includes('_')) {
        const line = source.slice(0, match.index).split('\n').length
        broken.push(`${path.relative(ROOT, file)}:${line}`)
      }
    }
  }
  assert.deepEqual(broken, [], `url() 안 밑줄은 공백으로 바뀌지 않는다: ${broken.join(', ')}`)
})

test('SVG data URL은 여는 태그가 온전한 svg 요소다', () => {
  for (const file of cssFiles(STYLES_DIR)) {
    const source = fs.readFileSync(file, 'utf8')
    for (const match of source.matchAll(DATA_URL)) {
      const svg = decodeURIComponent(match[2].replace(/^data:image\/svg\+xml;utf8,/, ''))
      assert.match(svg, /^<svg xmlns='http:\/\/www\.w3\.org\/2000\/svg'[ >]/, path.relative(ROOT, file))
    }
  }
})
