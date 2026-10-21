// HX-06 — 검사가 납품 페이지까지 닿는가, 편집 훅이 실패를 숨기지 않는가
//
// 파생 프로젝트(스타터)는 페이지를 루트 index.html·pages/에 둔다. 예전 npm run check는 src/·site/만 돌아
// 확대 차단·이름 없는 section이 든 index.html이 0건으로 지나갔다. 훅은 jq가 없거나 검사기가 실패해도 exit 0이었다.
// 검사기는 ROOT를 __dirname 기준으로 잡으므로, 임시 프로젝트에 검사기를 복사해 인자 없이 돌린다.

const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { spawnSync } = require('node:child_process')
const { test } = require('node:test')
const assert = require('node:assert/strict')

const ROOT = path.resolve(__dirname, '..', '..')
const { globToRegExp, canDescend, isSafeGlob } = require('../lib/page-scope')

function write(dir, rel, content) {
  const file = path.join(dir, ...rel.split('/'))
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, content)
}

// 실제 검사기·계약을 복사한 임시 프로젝트
function makeProject(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'iux-scope-'))
  fs.mkdirSync(path.join(dir, 'scripts'), { recursive: true })
  for (const name of ['check-violations.js', 'check-html-structure.js']) {
    fs.copyFileSync(path.join(ROOT, 'scripts', name), path.join(dir, 'scripts', name))
  }
  fs.cpSync(path.join(ROOT, 'scripts', 'lib'), path.join(dir, 'scripts', 'lib'), { recursive: true })
  fs.mkdirSync(path.join(dir, 'contracts'), { recursive: true })
  for (const name of ['html-page-contract.json', 'class-naming.json']) {
    fs.copyFileSync(path.join(ROOT, 'contracts', name), path.join(dir, 'contracts', name))
  }
  for (const [rel, content] of Object.entries(files)) write(dir, rel, content)
  return dir
}

function runChecker(dir, name) {
  return spawnSync(process.execPath, [path.join(dir, 'scripts', name)], { cwd: dir, encoding: 'utf8', env: { ...process.env, FORCE_COLOR: '0' } })
}

const GOOD_PAGE = `<!DOCTYPE html>
<html lang="ko">
<head><meta name="viewport" content="width=device-width, initial-scale=1"><title>소개</title></head>
<body>
  <a href="#main" class="skip-to-content">본문 바로가기</a>
  <header id="header" class="site-header"><div class="container">기관명</div></header>
  <main id="main">
    <section class="section section--content" aria-labelledby="t">
      <div class="container"><h1 id="t">기관 소개</h1></div>
    </section>
  </main>
  <footer id="footer" class="site-footer"><div class="container">주소 <a href="/privacy">개인정보 처리방침</a></div></footer>
</body>
</html>
`

// 두 검사기 모두에 걸리는 페이지 — 확대 차단(R-28)·이름 없는 section(R-15)·건너뛰기 링크 없음(R-14)
const BAD_PAGE = GOOD_PAGE
  .replace('<a href="#main" class="skip-to-content">본문 바로가기</a>', '')
  .replace('initial-scale=1', 'initial-scale=1, user-scalable=no')
  .replace('<section class="section section--content" aria-labelledby="t">', '<section class="section">')
  .replace('<h1 id="t">기관 소개</h1>', '<p>기관 소개</p>')

// ─── 인자 없는 check가 납품 페이지를 page 계약으로 본다 ─────────────

test('루트 index.html의 확대 차단·이름 없는 section을 인자 없이도 잡는다', () => {
  const dir = makeProject({ 'index.html': BAD_PAGE })
  const result = runChecker(dir, 'check-html-structure.js')
  assert.equal(result.status, 2, result.stdout + result.stderr)
  assert.match(result.stderr, /\[R-15\][\s\S]*section에는 heading 또는 aria-labelledby/)
  assert.match(result.stderr, /\[R-28\]/)
})

test('정상 페이지·검색엔진 확인 파일·빌드 산출물은 오류가 없다', () => {
  const dir = makeProject({
    'index.html': GOOD_PAGE,
    'pages/about.html': GOOD_PAGE,
    'naverabc123.html': 'naver-site-verification: naverabc123.html',
    'dist/index.html': BAD_PAGE,
    '_site/index.html': BAD_PAGE,
    'node_modules/pkg/index.html': BAD_PAGE
  })
  const result = runChecker(dir, 'check-html-structure.js')
  assert.equal(result.status, 0, result.stdout + result.stderr)
  assert.doesNotMatch(result.stderr, /\[R-/)
  assert.match(result.stdout, /납품 페이지 3개/) // index, pages/about, 확인 파일(page 꼴이 아니라 계약은 면제)
})

test('제외는 폴더 이름 단위다 — pages/distribution.html은 검사된다', () => {
  const dir = makeProject({ 'index.html': GOOD_PAGE, 'pages/distribution.html': BAD_PAGE })
  const result = runChecker(dir, 'check-html-structure.js')
  assert.equal(result.status, 2)
  assert.match(result.stderr, /pages[\\/]distribution\.html/)
})

test('infoux.json pages는 기본 범위에 더한다 — 루트 index.html도 계속 검사한다', () => {
  const dir = makeProject({
    'infoux.json': JSON.stringify({ profile: 'public-service', pages: ['public/**/*.html'] }),
    'index.html': BAD_PAGE,
    'public/notice/index.html': BAD_PAGE
  })
  const result = runChecker(dir, 'check-html-structure.js')
  assert.equal(result.status, 2)
  assert.match(result.stderr, /public[\\/]notice[\\/]index\.html/)
  assert.match(result.stderr, /\[R-15\]\S* index\.html:/) // 색 코드가 끼어도 루트 파일 줄을 찾는다
})

test('pages: []로 페이지 검사를 끌 수 없다', () => {
  const dir = makeProject({ 'infoux.json': JSON.stringify({ pages: [] }), 'index.html': BAD_PAGE })
  for (const checker of ['check-html-structure.js', 'check-violations.js']) {
    assert.equal(runChecker(dir, checker).status, 2, checker)
  }
})

test("글롭 표기 정규화 — './', 역슬래시, 끝의 '/'", () => {
  for (const glob of ['./public/**/*.html', 'public\\**\\*.html', 'public/']) {
    const dir = makeProject({ 'infoux.json': JSON.stringify({ pages: [glob] }), 'public/a/b.html': BAD_PAGE })
    const result = runChecker(dir, 'check-html-structure.js')
    assert.equal(result.status, 2, `${glob}: ${result.stdout}`)
    assert.match(result.stderr, /public[\\/]a[\\/]b\.html/, glob)
  }
})

test('infoux.json pages — 루트 밖·지원하지 않는 문법은 HX-06 오류, 맞는 파일이 없는 글롭은 경고', () => {
  const outside = runChecker(makeProject({ 'infoux.json': JSON.stringify({ pages: ['../other/*.html'] }), 'index.html': GOOD_PAGE }), 'check-html-structure.js')
  assert.equal(outside.status, 2)
  assert.match(outside.stderr, /\[HX-06\][\s\S]*\.\.\/other/)
  const brace = runChecker(makeProject({ 'infoux.json': JSON.stringify({ pages: ['{a,b}/*.html'] }), 'index.html': GOOD_PAGE }), 'check-html-structure.js')
  assert.equal(brace.status, 2)
  assert.match(brace.stderr, /\[HX-06\][\s\S]*지원하지 않는 글롭/)
  const typo = runChecker(makeProject({ 'infoux.json': JSON.stringify({ pages: ['pubilc/**/*.html'] }), 'index.html': GOOD_PAGE }), 'check-html-structure.js')
  assert.equal(typo.status, 0, typo.stderr)
  assert.match(typo.stderr, /\[HX-06\][\s\S]*pubilc/)
})

test('BOM이 붙은 infoux.json도 읽는다', () => {
  const dir = makeProject({ 'infoux.json': '\uFEFF' + JSON.stringify({ profile: 'general-site' }), 'index.html': GOOD_PAGE })
  const result = runChecker(dir, 'check-html-structure.js')
  assert.equal(result.status, 0, result.stderr)
})

test('상위 폴더 이름(references·site/testing)이 납품 페이지 검사를 끄지 않는다', () => {
  for (const parent of ['references', 'site/testing', 'site/design']) {
    const outer = fs.mkdtempSync(path.join(os.tmpdir(), 'iux-parent-'))
    const dir = makeProject({ 'index.html': BAD_PAGE })
    const nested = path.join(outer, ...parent.split('/'), 'proj')
    fs.mkdirSync(path.dirname(nested), { recursive: true })
    fs.cpSync(dir, nested, { recursive: true })
    assert.equal(runChecker(nested, 'check-html-structure.js').status, 2, `HS ${parent}`)
    assert.equal(runChecker(nested, 'check-violations.js').status, 2, `CV ${parent}`)
  }
})

test('check-violations도 납품 페이지를 본다 — 건너뛰기 링크 없는 index.html', () => {
  const dir = makeProject({ 'index.html': GOOD_PAGE.replace('<a href="#main" class="skip-to-content">본문 바로가기</a>', '') })
  const result = runChecker(dir, 'check-violations.js')
  assert.equal(result.status, 2, result.stdout + result.stderr)
  assert.match(result.stderr, /\[R-14\]/)
})

test('저장소의 스타터 index.html은 page 계약을 통과한다', () => {
  const dir = makeProject({ 'index.html': fs.readFileSync(path.join(ROOT, 'starter', 'index.html'), 'utf8') })
  const result = runChecker(dir, 'check-html-structure.js')
  assert.equal(result.status, 0, result.stdout + result.stderr)
})

// ─── 글롭 매처 ─────────────────────────────────────────────

test('글롭: * 는 폴더를 넘지 않고 **/ 는 폴더 0개 이상이다', () => {
  assert.ok(globToRegExp('*.html').test('index.html'))
  assert.ok(!globToRegExp('*.html').test('pages/a.html'))
  assert.ok(globToRegExp('pages/**/*.html').test('pages/a.html'))
  assert.ok(globToRegExp('pages/**/*.html').test('pages/x/y/a.html'))
  assert.ok(!globToRegExp('pages/**/*.html').test('pagesx/a.html'))
  assert.ok(canDescend(['pages', 'x'], ['pages', '**', '*.html']))
  assert.ok(!canDescend(['src'], ['*.html']))
  assert.ok(!isSafeGlob('../x/*.html'))
  assert.ok(!isSafeGlob('C:/x/*.html'))
  assert.ok(isSafeGlob('public/**/*.html'))
})

// ─── 편집 훅(scripts/hooks/post-edit.js) ─────────────────────────
// 스텁 검사기로 종료 코드 전달만 본다. 예전 셸 훅은 check-violations=2여도 exit 0이었다.

function makeHookProject({ cv = 0, hs = 0, stylelint = 0, withStylelint = true } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'iux-hook-'))
  write(dir, 'scripts/hooks/post-edit.js', fs.readFileSync(path.join(ROOT, 'scripts', 'hooks', 'post-edit.js'), 'utf8'))
  write(dir, 'scripts/lib/page-scope.js', fs.readFileSync(path.join(ROOT, 'scripts', 'lib', 'page-scope.js'), 'utf8'))
  write(dir, 'scripts/check-violations.js', `console.error('CV 스텁'); process.exit(${cv})\n`)
  write(dir, 'scripts/check-html-structure.js', `console.error('HS 스텁'); process.exit(${hs})\n`)
  if (withStylelint) {
    write(dir, 'node_modules/stylelint/package.json', JSON.stringify({ name: 'stylelint', bin: { stylelint: 'bin/stylelint.js' } }))
    write(dir, 'node_modules/stylelint/bin/stylelint.js', `console.error('stylelint 스텁'); process.exit(${stylelint})\n`)
  }
  for (const rel of ['src/styles/a.css', 'src/snippets/a.md', 'index.html', 'references/a.md', 'notes/a.md']) write(dir, rel, 'x')
  return dir
}

function runHook(dir, rel) {
  const input = JSON.stringify({ tool_name: 'Write', cwd: dir, tool_input: { file_path: path.join(dir, ...rel.split('/')) } })
  return spawnSync(process.execPath, [path.join(dir, 'scripts', 'hooks', 'post-edit.js')], { cwd: dir, input, encoding: 'utf8' })
}

test('훅: check-violations가 실패하면 css·md·html 모두 exit 2다', () => {
  const dir = makeHookProject({ cv: 2, hs: 0 })
  for (const rel of ['src/styles/a.css', 'src/snippets/a.md', 'index.html']) {
    const result = runHook(dir, rel)
    assert.equal(result.status, 2, `${rel}: ${result.stderr}`)
    assert.match(result.stderr, /CV 스텁/)
  }
})

test('훅: check-html-structure만 실패해도 exit 2다(마지막 명령만 보지 않는다)', () => {
  const dir = makeHookProject({ cv: 0, hs: 2 })
  const result = runHook(dir, 'index.html')
  assert.equal(result.status, 2)
  assert.match(result.stderr, /HS 스텁/)
})

test('훅: references·prompts는 HTML 구조만 보고, 범위 밖 파일은 건너뛴다', () => {
  const dir = makeHookProject({ cv: 2, hs: 0 })
  assert.equal(runHook(dir, 'references/a.md').status, 0)
  assert.equal(runHook(dir, 'notes/a.md').status, 0)
})

test('훅: stylelint가 없으면 조용히 넘어가지 않고 exit 2다', () => {
  const dir = makeHookProject({ withStylelint: false })
  const result = runHook(dir, 'src/styles/a.css')
  assert.equal(result.status, 2)
  assert.match(result.stderr, /stylelint가 설치되어 있지 않아/)
})

// ─── 훅 설정 판정(check-harness가 네 훅 파일에 쓴다) ─────────────────

const { validateHookConfig } = require('../lib/hook-contract')
const hookConfig = command => JSON.stringify({ hooks: { PostToolUse: [{ matcher: 'Write|Edit', hooks: [{ type: 'command', command }] }] } })

test('훅 설정: 정해진 명령 하나면 통과한다', () => {
  assert.deepEqual(validateHookConfig(hookConfig('node ./scripts/hooks/post-edit.js')), [])
  for (const file of ['.claude/settings.json', '.codex/hooks.json', 'starter/.claude/settings.json', 'starter/.codex/hooks.json']) {
    assert.deepEqual(validateHookConfig(fs.readFileSync(path.join(ROOT, ...file.split('/')), 'utf8')), [], file)
  }
})

test('훅 설정: 실패를 숨기거나 jq·셸 연결을 쓰는 옛 훅은 거부한다', () => {
  // 옛 스타터 훅 — .scss·.html만, 실패를 숨김, HTML 구조 검사 없음
  const oldStarter = `jq -r '.tool_input.file_path // empty' | { read -r f || exit 0; echo "$f" | grep -qE '\\.(scss|html)$' && node ./scripts/check-violations.js "$f" 2>/dev/null || true; }`
  assert.ok(validateHookConfig(hookConfig(oldStarter)).length >= 2)
  // 옛 루트 훅 — 숨기지는 않지만 마지막 명령의 종료 코드만 남는다
  const oldRoot = `jq -r '.tool_input.file_path // empty' | { read -r f || exit 0; node ./scripts/check-violations.js "$f"; node ./scripts/check-html-structure.js "$f"; }`
  assert.equal(validateHookConfig(hookConfig(oldRoot)).length, 1)
  assert.match(validateHookConfig('{ not json')[0], /JSON 오류/)
})

// Codex는 파일 편집을 apply_patch로 보내고 경로는 tool_input.command의 패치 본문에만 있다
const codexPatch = body => JSON.stringify({ tool_name: 'apply_patch', tool_input: { command: `*** Begin Patch\n${body}\n*** End Patch` } })

test('훅: Codex apply_patch 본문의 파일을 검사한다', () => {
  const dir = makeHookProject({ cv: 2 })
  const hook = path.join(dir, 'scripts', 'hooks', 'post-edit.js')
  const run = input => spawnSync(process.execPath, [hook], { cwd: dir, input, encoding: 'utf8' })
  const update = run(codexPatch('*** Update File: index.html\n@@\n-x\n+y'))
  assert.equal(update.status, 2, update.stderr)
  assert.match(update.stderr, /CV 스텁/)
  assert.equal(run(codexPatch('*** Add File: notes/a.md\n+x')).status, 0) // 범위 밖
  assert.equal(run(codexPatch('*** Delete File: index.html')).status, 0) // 삭제만 — 검사할 파일 없음
  const garbled = run(JSON.stringify({ tool_name: 'apply_patch', tool_input: { command: '*** Begin Patch\n*** Frobnicate: x\n*** End Patch' } }))
  assert.equal(garbled.status, 2) // 형식이 바뀌면 조용히 넘기지 않는다
})

test('훅: 다른 infoUX 프로젝트(starter/ 등)의 파일은 그쪽 훅에 넘긴다', () => {
  // 바깥 프로젝트는 검사기가 실패하고, 안쪽(starter) 사본 훅이 바깥 파일을 받은 경우
  const outer = makeHookProject({ cv: 2 })
  const inner = path.join(outer, 'starter')
  for (const rel of ['scripts/hooks/post-edit.js', 'scripts/lib/page-scope.js']) {
    write(inner, rel, fs.readFileSync(path.join(outer, ...rel.split('/')), 'utf8'))
  }
  write(inner, 'scripts/check-violations.js', 'process.exit(0)\n')
  write(inner, 'scripts/check-html-structure.js', 'process.exit(0)\n')
  const input = JSON.stringify({ tool_name: 'Edit', cwd: inner, tool_input: { file_path: path.join(outer, 'index.html') } })
  const result = spawnSync(process.execPath, [path.join(inner, 'scripts', 'hooks', 'post-edit.js')], { cwd: inner, input, encoding: 'utf8' })
  assert.equal(result.status, 2, result.stderr)
  assert.match(result.stderr, /CV 스텁/)
})

test('훅: 입력이 JSON이 아니면 exit 2다(jq 없이 조용히 끝나던 결함)', () => {
  const dir = makeHookProject()
  const result = spawnSync(process.execPath, [path.join(dir, 'scripts', 'hooks', 'post-edit.js')], { cwd: dir, input: 'not json', encoding: 'utf8' })
  assert.equal(result.status, 2)
})
