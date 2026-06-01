// check-html-structure.js page shell 계약 검증

const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { spawnSync } = require('node:child_process')
const { test } = require('node:test')
const assert = require('node:assert/strict')

const ROOT = path.resolve(__dirname, '..', '..')
const CHECK_HTML = path.join(ROOT, 'scripts', 'check-html-structure.js')

function runCheck(source) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'iux-html-'))
  const filePath = path.join(dir, 'page.html')
  fs.writeFileSync(filePath, source)

  return spawnSync(process.execPath, [CHECK_HTML, filePath], {
    cwd: ROOT,
    encoding: 'utf8'
  })
}

test('page shell 계약을 충족한 HTML은 통과한다', () => {
  const result = runCheck(`<!DOCTYPE html>
<html lang="ko">
<head>
  <title>테스트</title>
</head>
<body>
  <a href="#main" class="skip-to-content">본문 바로가기</a>
  <header id="header" class="site-header">
    <div class="container">브랜드</div>
  </header>
  <main id="main">
    <section class="section section--content" aria-labelledby="section-title">
      <div class="container">
        <h1 id="section-title">페이지 제목</h1>
      </div>
    </section>
  </main>
  <footer id="footer" class="site-footer">
    <div class="container">푸터</div>
  </footer>
</body>
</html>`)

  assert.equal(result.status, 0, result.stderr)
})

test('page shell 필수 구조가 빠지면 R-14/R-15 오류로 실패한다', () => {
  const result = runCheck(`<!DOCTYPE html>
<html lang="ko">
<body>
  <header>
    <div class="container">브랜드</div>
  </header>
  <main>
    <div class="container">본문</div>
  </main>
</body>
</html>`)

  assert.equal(result.status, 2)
  assert.match(result.stderr, /\[R-14\]/)
  assert.match(result.stderr, /\[R-15\]/)
  assert.match(result.stderr, /main#main/)
})

test('등록되지 않은 section modifier는 실패한다', () => {
  const result = runCheck(`<!DOCTYPE html>
<html lang="ko">
<body>
  <a href="#main" class="skip-to-content">본문 바로가기</a>
  <header id="header" class="site-header">
    <div class="container">브랜드</div>
  </header>
  <main id="main">
    <section class="section section--hero" aria-labelledby="section-title">
      <div class="container">
        <h1 id="section-title">페이지 제목</h1>
      </div>
    </section>
  </main>
  <footer id="footer" class="site-footer">
    <div class="container">푸터</div>
  </footer>
</body>
</html>`)

  assert.equal(result.status, 2)
  assert.match(result.stderr, /\[R-18\]/)
  assert.match(result.stderr, /section--hero/)
})
