// 서체 로딩 계약 — assets/fonts/fonts.css가 art-direction 카탈로그와 어긋나지 않는다.
//
// 카탈로그(contracts/art-direction.json typography[].fonts)는 파일·해시를 소유하고,
// fonts.css는 그 파일을 @font-face로 선언한다. 한쪽만 고치면 폰트가 조용히 시스템 서체로
// 떨어진다 — 화면은 뜨니 아무도 모른다. 그래서 테스트로 묶는다.

const fs = require('node:fs')
const path = require('node:path')
const { test } = require('node:test')
const assert = require('node:assert/strict')

const ROOT = path.resolve(__dirname, '..', '..')
const FONTS_DIR = path.join(ROOT, 'assets', 'fonts')
const FONTS_CSS = path.join(FONTS_DIR, 'fonts.css')
const art = JSON.parse(fs.readFileSync(path.join(ROOT, 'contracts', 'art-direction.json'), 'utf8'))
const css = fs.readFileSync(FONTS_CSS, 'utf8')

function fontFaces(source) {
  const faces = []
  const re = /@font-face\s*\{([^}]*)\}/g
  let m
  while ((m = re.exec(source)) !== null) {
    const body = m[1]
    const family = (/font-family\s*:\s*['"]([^'"]+)['"]/.exec(body) || [])[1]
    const src = (/url\(\s*['"]?([^'")]+)['"]?\s*\)/.exec(body) || [])[1]
    const display = (/font-display\s*:\s*([a-z-]+)/.exec(body) || [])[1]
    faces.push({ family, src, display })
  }
  return faces
}

const faces = fontFaces(css)
const catalog = art.typography.flatMap(entry => entry.fonts.map(f => ({ id: entry.id, ...f })))

test('카탈로그의 모든 서체 파일이 fonts.css에 선언돼 있다', () => {
  for (const font of catalog) {
    for (const file of font.files) {
      const rel = './' + path.posix.relative('assets/fonts', file)
      const face = faces.find(f => f.src === rel)
      assert.ok(face, `${font.id}: ${file}의 @font-face가 없다`)
      assert.equal(face.family, font.family, `${file}의 font-family가 카탈로그(${font.family})와 다르다`)
    }
  }
})

test('fonts.css는 카탈로그에 없는 파일을 선언하지 않는다', () => {
  const files = new Set(catalog.flatMap(f => f.files))
  for (const face of faces) {
    const file = path.posix.join('assets/fonts', face.src.replace(/^\.\//, ''))
    assert.ok(files.has(file), `${face.src}는 카탈로그에 없다`)
  }
})

test('선언한 파일이 실제로 있다', () => {
  for (const face of faces) {
    assert.ok(fs.existsSync(path.join(FONTS_DIR, face.src)), `${face.src} 파일이 없다`)
  }
})

test('모든 @font-face가 상대 경로와 font-display: swap을 쓴다', () => {
  assert.ok(faces.length > 0)
  for (const face of faces) {
    assert.match(face.src, /^\.\//, `${face.src} — 루트 절대 경로는 서브 디렉터리 배포에서 깨진다`)
    assert.equal(face.display, 'swap', `${face.src} — font-display: swap이 아니다`)
  }
})

test('브랜드 서체 스택은 웹폰트 실패 시 윈도우 한글 서체로 떨어진다', () => {
  for (const file of ['tokens/brand.json', ...fs.readdirSync(path.join(ROOT, 'tokens', 'presets')).map(n => 'tokens/presets/' + n)]) {
    const tokens = JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'))
    for (const slot of ['sans', 'heading']) {
      const value = tokens.font?.family?.[slot]?.value
      if (!value) continue
      assert.match(value, /'Malgun Gothic'/, `${file} font.family.${slot}에 'Malgun Gothic'이 없다`)
    }
  }
})
