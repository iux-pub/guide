// 터치 영역 하한 — R-13 (44×44px). 로고만 든 브랜드 링크는 이미지 높이(3.2rem)가 곧 링크 높이가 된다

const fs = require('node:fs')
const path = require('node:path')
const { test } = require('node:test')
const assert = require('node:assert/strict')

const ROOT = path.resolve(__dirname, '..', '..')

/** CSS 파일에서 선택자 블록의 @apply 본문을 읽는다. */
function applyOf(file, selector) {
  const css = fs.readFileSync(path.join(ROOT, 'src', 'styles', '6-components', file), 'utf8')
  const start = css.indexOf(`${selector} {`)
  assert.notEqual(start, -1, `${file}에 ${selector}가 없다`)
  return css.slice(start, css.indexOf('}', start))
}

/** @apply 본문의 min-h/min-w rem 임의값(px로 환산). 없으면 0. */
function minPx(body, axis) {
  const m = body.match(new RegExp(String.raw`(?:^|\s)min-${axis}-\[(\d+(?:\.\d+)?)rem\]`))
  return m ? Number(m[1]) * 10 : 0
}

test('R-13: 헤더·푸터 브랜드(로고) 링크는 44×44px 이상이다', () => {
  // 2026-10-23 제주관광공사 메인 시안 — 헤더 로고 링크가 32px로 하한에 못 미쳤다(푸터는 이미 지켰다)
  for (const [file, selector] of [['header.css', '.site-header__brand'], ['footer.css', '.site-footer__brand']]) {
    const body = applyOf(file, selector)
    assert.ok(minPx(body, 'h') >= 44, `${selector} 최소 높이가 44px 미만이다`)
    assert.ok(minPx(body, 'w') >= 44, `${selector} 최소 너비가 44px 미만이다`)
  }
})
