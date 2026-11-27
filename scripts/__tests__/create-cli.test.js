// create-infomind-ux 옵션 계약 검증
// 실제 생성은 네트워크를 타므로, 여기서는 CLI가 선언한 계약이 다른 원본과
// 어긋나지 않는지 본다. 어긋나면 생성 시점에야 드러나고 그때는 이미 늦다.

const fs = require('node:fs')
const path = require('node:path')
const { test } = require('node:test')
const assert = require('node:assert/strict')

const ROOT = path.resolve(__dirname, '..', '..')
const CLI = fs.readFileSync(path.join(ROOT, 'cli', 'bin', 'create.js'), 'utf8')

/** CLI 소스에서 배열 상수의 문자열 항목을 뽑는다. */
function listFromCli(constName) {
  const marker = `const ${constName} = [`
  const start = CLI.indexOf(marker)
  assert.notEqual(start, -1, `${constName}를 읽지 못했다`)
  const end = CLI.indexOf(']', start)
  assert.notEqual(end, -1, `${constName}가 닫히지 않았다`)
  const body = CLI.slice(start + marker.length, end)
  return [...body.matchAll(/'([^']+)'/g)].map(m => m[1])
}

test('사이트 유형 정의가 세 곳에서 일치한다', () => {
  // CLI(입력 검증) · Task Contract 스키마(계약) · profiles.json(프리셋)이 갈라지면
  // 생성물이 계약을 어기거나 MCP가 없는 유형을 답한다.
  const schema = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'contracts', 'task-contract.schema.json'), 'utf8')
  )
  const spec = JSON.parse(fs.readFileSync(path.join(ROOT, 'contracts', 'profiles.json'), 'utf8'))

  const schemaProfiles = schema.properties.profile.enum.slice().sort()
  const presetProfiles = spec.profiles.map(p => p.id).sort()

  const block = CLI.match(/const PROFILES = \{([\s\S]*?)\n\}/)
  assert.ok(block, 'PROFILES를 읽지 못했다')
  const cliProfiles = [...block[1].matchAll(/^\s*'([a-z-]+)':/gm)].map(m => m[1]).sort()

  assert.deepEqual(cliProfiles, schemaProfiles, 'CLI와 Task Contract 스키마가 다르다')
  assert.deepEqual(presetProfiles, schemaProfiles, 'profiles.json과 Task Contract 스키마가 다르다')
})

test('프로필 프리셋이 실제 컴포넌트와 section archetype만 가리킨다', () => {
  const spec = JSON.parse(fs.readFileSync(path.join(ROOT, 'contracts', 'profiles.json'), 'utf8'))
  const pageContract = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'contracts', 'html-page-contract.json'), 'utf8')
  )
  const archetypes = pageContract.sectionArchetypes
  const components = fs
    .readdirSync(path.join(ROOT, 'src', 'snippets'))
    .filter(name => name.endsWith('.md') && name !== 'AGENTS.md')
    .map(name => name.replace(/\.md$/, ''))

  for (const profile of spec.profiles) {
    for (const flow of [profile.sectionFlow, profile.sectionFlowAlt ?? []]) {
      for (const section of flow) {
        assert.ok(archetypes.includes(section),
          `${profile.id}: section--${section}은 등록된 archetype이 아니다`)
      }
    }
    for (const component of profile.priorityComponents) {
      assert.ok(components.includes(component),
        `${profile.id}: 컴포넌트 "${component}"이 카탈로그에 없다`)
    }
    assert.ok(spec.density[profile.density], `${profile.id}: 밀도 "${profile.density}" 정의 없음`)
    assert.ok(spec.expressionLevels[profile.expression],
      `${profile.id}: 표현 등급 "${profile.expression}" 정의 없음`)
  }
})

test('표현 등급 정의가 스키마와 프리셋에서 일치한다', () => {
  // expressionLevels 정의와 Task Contract의 expression enum이 갈라지면
  // 계약이 허용한 등급을 프리셋이 모르거나, 프리셋 등급을 계약이 거부한다.
  const schema = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'contracts', 'task-contract.schema.json'), 'utf8')
  )
  const spec = JSON.parse(fs.readFileSync(path.join(ROOT, 'contracts', 'profiles.json'), 'utf8'))

  assert.deepEqual(
    schema.properties.expression.enum.slice().sort(),
    Object.keys(spec.expressionLevels).sort(),
    'Task Contract 스키마의 expression enum과 expressionLevels 정의가 다르다'
  )
})

test('납품본에서 제외하는 것과 남겨야 하는 것이 겹치지 않는다', () => {
  const internal = listFromCli('INTERNAL_ONLY')
  const required = listFromCli('DELIVERABLE_REQUIRED')

  assert.ok(internal.length > 0)
  assert.ok(required.length > 0)

  const overlap = internal.filter(name => required.includes(name))
  assert.deepEqual(overlap, [], '제외 목록과 필수 목록이 겹치면 납품본이 깨진다')
})

test('검사기가 읽는 경로는 납품 필수 자산에 포함된다', () => {
  const required = listFromCli('DELIVERABLE_REQUIRED')
  const checker = fs.readFileSync(path.join(ROOT, 'scripts', 'check-html-structure.js'), 'utf8')

  // check-html-structure.js가 contracts/에서 page contract를 읽는다.
  // 납품본에서 빼면 정상 마크업이 R-18로 잡힌다(2026-07-29 실제 발생).
  assert.match(checker, /'contracts'/)
  assert.ok(required.includes('contracts'), 'contracts는 납품본에 남아야 한다')
})

test('사내 운영 문서는 납품본에서 제외한다', () => {
  const internal = listFromCli('INTERNAL_ONLY')
  for (const name of ['AGENTS.md', 'CLAUDE.md', 'PUBLISHER_GUIDE.md', 'prompts']) {
    assert.ok(internal.includes(name), `${name}이 납품본 제외 목록에 없다`)
  }
})

// ─── CLI 동작 (네트워크 없이) ─────────────────────────────

const os = require('node:os')
const { PassThrough } = require('node:stream')
const { EventEmitter } = require('node:events')
const cli = require('../../cli/bin/create.js')

const argv = (...rest) => ['node', 'create.js', ...rest]

test('인자: --profile·--brand는 값이 없으면 오류다(조용히 무시하지 않는다)', () => {
  assert.throws(() => cli.parseArgs(argv('my-app', '--profile')), /--profile 옵션에는 값이 필요합니다/)
  assert.throws(() => cli.parseArgs(argv('my-app', '--profile', '--no-git')), /--profile 옵션에는 값이 필요합니다/)
  assert.throws(() => cli.parseArgs(argv('my-app', '--brand')), /--brand 옵션에는 값이 필요합니다/)
  const ok = cli.parseArgs(argv('my-app', '--profile', 'public-service', '--brand', './b.json', '--deliver', '--skip-install', '--no-git'))
  assert.deepEqual(ok._, ['my-app'])
  assert.deepEqual(ok.flags, { profile: 'public-service', brand: './b.json', deliver: true, skipInstall: true, noGit: true })
})

test('인자: 없어진 --template과 모르는 옵션은 오류다', () => {
  assert.throws(() => cli.parseArgs(argv('my-app', '--template', 'starter')), /--template 옵션은 없어졌습니다/)
  assert.throws(() => cli.parseArgs(argv('my-app', '--template=starter')), /--template 옵션은 없어졌습니다/)
  assert.throws(() => cli.parseArgs(argv('my-app', '--nope')), /알 수 없는 옵션: --nope/)
  // 도움말·README도 없어진 옵션을 안내하지 않는다
  assert.doesNotMatch(CLI, /--template <name>/)
  assert.doesNotMatch(fs.readFileSync(path.join(ROOT, 'cli', 'README.md'), 'utf8'), /--template/)
})

test('완료 안내는 스타터에 실제로 있는 npm 스크립트만 말한다', () => {
  const starterScripts = JSON.parse(fs.readFileSync(path.join(ROOT, 'starter', 'package.json'), 'utf8')).scripts
  const steps = cli.nextSteps(starterScripts)
  assert.ok(steps.length >= 2, '빌드·검사 안내가 있다')
  for (const step of steps) {
    const name = step.command.replace(/^npm run /, '')
    assert.ok(starterScripts[name], `스타터에 없는 명령을 안내한다: ${step.command}`)
  }
  assert.deepEqual(cli.nextSteps({ build: 'x' }).map(s => s.command), ['npm run build'], '없는 스크립트는 빼고 안내한다')
  // 소스와 README에 스타터에 없는 npm run <이름>이 남아 있지 않다
  for (const [label, text] of [['cli/bin/create.js', CLI], ['cli/README.md', fs.readFileSync(path.join(ROOT, 'cli', 'README.md'), 'utf8')]]) {
    for (const m of text.matchAll(/npm run ([a-z][\w:-]*)/g)) {
      assert.ok(starterScripts[m[1]], `${label}가 스타터에 없는 npm run ${m[1]}을 안내한다`)
    }
  }
})

test('npm 호출: Windows에서는 셸로 부른다(npm.cmd — 셸 없이는 ENOENT)', () => {
  const result = cli.runNpm(['--version'], { encoding: 'utf8' })
  assert.equal(result.error, undefined, String(result.error))
  assert.equal(result.status, 0, result.stderr)
  assert.match(result.stdout.trim(), /^\d+\.\d+\.\d+/)
})

// https.get 흉내 — 주소마다 { status, location, body, fail } 응답을 돌려준다
function fakeGet(route) {
  const calls = []
  const get = (url, onResponse) => {
    calls.push(url)
    const req = new EventEmitter()
    req.setTimeout = () => {}
    req.destroy = () => {}
    const spec = route(url, calls.length)
    setImmediate(() => {
      if (spec.requestError) return req.emit('error', new Error(spec.requestError))
      const res = new PassThrough()
      res.statusCode = spec.status
      res.headers = spec.location ? { location: spec.location } : {}
      onResponse(res)
      if (spec.streamError) {
        res.write('partial')
        setImmediate(() => res.destroy(new Error(spec.streamError)))
      } else {
        res.end(spec.body || '')
      }
    })
    return req
  }
  return { get, calls }
}
const tmpDest = () => path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'iux-dl-')), 'starter.tar.gz')

test('다운로드: 리다이렉트를 따라가 파일을 쓴다', async () => {
  const dest = tmpDest()
  const { get, calls } = fakeGet(url => (url.endsWith('/a') ? { status: 302, location: '/b' } : { status: 200, body: 'tarball' }))
  await cli.download('https://example.test/a', dest, { get })
  assert.deepEqual(calls, ['https://example.test/a', 'https://example.test/b'], '상대 주소 리다이렉트를 원래 주소 기준으로 푼다')
  assert.equal(fs.readFileSync(dest, 'utf8'), 'tarball')
})

test('다운로드: 리다이렉트가 끝나지 않으면 횟수 제한에서 멈춘다', async () => {
  const dest = tmpDest()
  const { get, calls } = fakeGet(() => ({ status: 302, location: 'https://example.test/loop' }))
  await assert.rejects(cli.download('https://example.test/loop', dest, { get }), /리다이렉트가 5번을 넘었습니다/)
  assert.equal(calls.length, cli.MAX_REDIRECTS + 1)
  assert.equal(fs.existsSync(dest), false)
})

test('다운로드: https가 아닌 주소로는 리다이렉트를 따라가지 않는다', async () => {
  const dest = tmpDest()
  const { get } = fakeGet(() => ({ status: 301, location: 'http://example.test/plain' }))
  await assert.rejects(cli.download('https://example.test/a', dest, { get }), /https가 아닌 주소/)
})

test('다운로드: 실패하면 임시 파일을 남기지 않는다 — HTTP 오류·요청 오류·받는 중 끊김', async () => {
  for (const [spec, pattern] of [
    [{ status: 404 }, /HTTP 404/],
    [{ requestError: 'ENOTFOUND' }, /ENOTFOUND/],
    [{ status: 200, streamError: 'ECONNRESET' }, /ECONNRESET/]
  ]) {
    const dest = tmpDest()
    const { get } = fakeGet(() => spec)
    await assert.rejects(cli.download('https://example.test/a', dest, { get }), pattern)
    assert.equal(fs.existsSync(dest), false, `반쯤 받은 파일이 남았다: ${JSON.stringify(spec)}`)
  }
})
