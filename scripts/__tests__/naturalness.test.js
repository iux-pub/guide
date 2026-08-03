// 자연스러움 검출기 검증 — R-23 가짜 콘텐츠 · R-24 한글 조판 하한 (check-violations.js)

const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { spawnSync } = require('node:child_process')
const { test } = require('node:test')
const assert = require('node:assert/strict')

const ROOT = path.resolve(__dirname, '..', '..')
const CHECK_VIOLATIONS = path.join(ROOT, 'scripts', 'check-violations.js')

// relativePath 위치에 픽스처를 만들고 check-violations.js를 명시적 인자로 실행한다
function runCheck(relativePath, source) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'iux-nat-'))
  const filePath = path.join(dir, relativePath)
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, source)

  return spawnSync(process.execPath, [CHECK_VIOLATIONS, filePath], {
    cwd: ROOT,
    encoding: 'utf8'
  })
}

// ─── R-23 가짜 콘텐츠 ─────────────────────────────────

test('R-23: lorem ipsum 채움 텍스트는 오류다', () => {
  const result = runCheck('page.html', '<p>Lorem ipsum dolor sit amet</p>')

  assert.equal(result.status, 2)
  assert.match(result.stderr, /\[R-23\]/)
})

test('R-23: 한글 자리 채움 문구는 오류다', () => {
  const result = runCheck('page.html', '<p>내용이 여기에 들어갑니다</p>')

  assert.equal(result.status, 2)
  assert.match(result.stderr, /\[R-23\]/)
})

test('R-23: placeholder 이미지 핫링크는 오류다', () => {
  const result = runCheck('page.html', '<img src="https://picsum.photos/400/300" alt="사진">')

  assert.equal(result.status, 2)
  assert.match(result.stderr, /\[R-23\]/)
})

test('R-23: 실제 콘텐츠·실제 자산 경로는 통과한다', () => {
  const result = runCheck('page.html', `
<p>독서문화 프로그램은 매월 첫째 주 월요일부터 신청을 받습니다.</p>
<img src="/images/program-reading.jpg" alt="독서문화 프로그램 진행 모습">`)

  assert.equal(result.status, 0, result.stderr)
})

test('R-23: references/ 문서는 의도적 반례를 실어도 SKIP된다', () => {
  const result = runCheck('references/anti-example.md', '<p>Lorem ipsum dolor sit amet</p>')

  assert.equal(result.status, 0, result.stderr)
})

test('R-23: site/design/ 문서는 의도적 반례를 실어도 SKIP된다', () => {
  const result = runCheck('site/design/microcopy-example.md', '<p>내용이 여기에 들어갑니다</p>')

  assert.equal(result.status, 0, result.stderr)
})

// ─── R-24 한글 조판 하한 ──────────────────────────────

test('R-24: reset 계층에 word-break: keep-all이 없으면 오류다', () => {
  const result = runCheck('src/styles/3-generic/reset.css', `body {
  line-height: 1.7;
}
`)

  assert.equal(result.status, 2)
  assert.match(result.stderr, /\[R-24\]/)
  assert.match(result.stderr, /keep-all/)
})

test('R-24: keep-all이 있는 reset 계층은 통과한다', () => {
  const result = runCheck('src/styles/3-generic/reset.css', `body {
  word-break: keep-all;
  overflow-wrap: break-word;
  line-height: 1.7;
}
`)

  assert.equal(result.status, 0, result.stderr)
})

test('R-24: HTML의 leading-none 클래스는 오류다', () => {
  const result = runCheck('page.html', '<p class="leading-none">접수 안내</p>')

  assert.equal(result.status, 2)
  assert.match(result.stderr, /\[R-24\]/)
})

test('R-24: CSS line-height 1.5 미만은 경고다 (차단 없음)', () => {
  const result = runCheck('src/styles/6-components/notice.css', `.notice {
  @apply block;
  line-height: 1.49;
}
`)

  assert.equal(result.status, 0, result.stderr)
  assert.match(result.stderr, /\[R-24\]/)
})

test('R-24: line-height 1.5 이상은 경고하지 않는다', () => {
  const result = runCheck('src/styles/6-components/notice.css', `.notice {
  @apply block;
  line-height: 1.5;
}
`)

  assert.equal(result.status, 0, result.stderr)
  assert.doesNotMatch(result.stderr, /\[R-24\]/)
})

test('R-24: 단행 컴포넌트(badge·tag·btn) 파일은 line-height 하한 예외다', () => {
  const result = runCheck('src/styles/6-components/badge.css', `.badge {
  @apply inline-flex;
  line-height: 1;
}
`)

  assert.equal(result.status, 0, result.stderr)
  assert.doesNotMatch(result.stderr, /\[R-24\]/)
})

// ─── 임계값 정본 동일성 ───────────────────────────────

test('R-24 임계값은 contracts/art-direction.json hangul.lintFloor와 같다', () => {
  const source = fs.readFileSync(CHECK_VIOLATIONS, 'utf8')
  const match = source.match(/HANGUL_LINE_HEIGHT_FLOOR\s*=\s*([\d.]+)/)
  assert.ok(match, 'check-violations.js에서 HANGUL_LINE_HEIGHT_FLOOR 상수를 찾지 못했다')

  const artDirection = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'contracts', 'art-direction.json'), 'utf8')
  )
  assert.equal(
    parseFloat(match[1]),
    artDirection.hangul.bodyLineHeight.lintFloor,
    'R-24 검출 임계와 hangul.bodyLineHeight.lintFloor가 다르다 — 정본은 contracts/art-direction.json'
  )
})
