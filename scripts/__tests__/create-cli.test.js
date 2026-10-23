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

// ─── 압축 해제·의존성 설치 (2026-10-23 Windows에서 드러난 결함) ─────────

const os = require('node:os')
const zlib = require('node:zlib')
const { extractTarGz, runNpmInstall } = require('../../cli/bin/create')

/** ustar 헤더 한 블록을 만든다(체크섬 포함). */
function tarHeader(name, { size = 0, type = '0', mode = 0o644 } = {}) {
  const h = Buffer.alloc(512)
  h.write(name, 0, 100, 'utf8')
  h.write(mode.toString(8).padStart(7, '0') + '\0', 100)
  h.write('0000000\0', 108)
  h.write('0000000\0', 116)
  h.write(size.toString(8).padStart(11, '0') + '\0', 124)
  h.write('00000000000\0', 136)
  h.write(type, 156)
  h.write('ustar\0', 257)
  h.write('00', 263)
  h.fill(0x20, 148, 156)
  let sum = 0
  for (const byte of h) sum += byte
  h.write(sum.toString(8).padStart(6, '0') + '\0 ', 148)
  return h
}

function tarEntry(name, content = '', opts = {}) {
  const body = Buffer.from(content, 'utf8')
  const pad = Buffer.alloc((512 - (body.length % 512)) % 512)
  return Buffer.concat([tarHeader(name, { ...opts, size: body.length }), body, pad])
}

/** pax 레코드("길이 키=값\n") — 길이는 자기 자신을 포함한다. */
function paxBody(fields) {
  return Object.entries(fields).map(([k, v]) => {
    const rest = ` ${k}=${v}\n`
    let len = Buffer.byteLength(rest) + 1
    while (String(len).length + Buffer.byteLength(rest) !== len) len++
    return `${len}${rest}`
  }).join('')
}

function writeTarGz(entries) {
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'iux-tar-')), 'starter.tar.gz')
  fs.writeFileSync(file, zlib.gzipSync(Buffer.concat([...entries, Buffer.alloc(1024)])))
  return file
}

test('압축 해제: 시스템 tar를 부르지 않는다 — Windows의 Git GNU tar가 C: 경로를 원격 호스트로 읽는다', () => {
  assert.doesNotMatch(CLI, /execSync\(\s*`tar\b/, 'tar 명령을 셸로 부르면 PATH 순서에 따라 Windows에서 실패한다')
})

test('압축 해제: GitHub tarball 모양(전역 pax·최상위 폴더·긴 경로)을 풀고 최상위 폴더를 벗긴다', () => {
  const longDir = 'starter-main/src/' + 'deep-folder-name/'.repeat(6)
  const tarball = writeTarGz([
    tarEntry('pax_global_header', paxBody({ comment: '02662da' }), { type: 'g' }),
    tarEntry('starter-main/', '', { type: '5', mode: 0o755 }),
    tarEntry('starter-main/package.json', '{"name":"starter"}\n'),
    tarEntry('starter-main/src/snippets/', '', { type: '5', mode: 0o755 }),
    tarEntry('starter-main/src/snippets/header.md', '# 헤더\n'),
    tarEntry('PaxHeader/long', paxBody({ path: `${longDir}page.html` }), { type: 'x' }),
    tarEntry('starter-main/src/truncated-name', '<!doctype html>\n'),
    tarEntry('starter-main/link', '', { type: '2' })
  ])
  // 실제 결함 재현처럼 드라이브 문자가 든 절대 경로(Windows)로 푼다
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'iux-out-'))
  const result = extractTarGz(tarball, out)

  assert.equal(result.files, 3)
  assert.deepEqual(result.skipped, ['link'])
  assert.equal(fs.readFileSync(path.join(out, 'package.json'), 'utf8'), '{"name":"starter"}\n')
  assert.equal(fs.readFileSync(path.join(out, 'src', 'snippets', 'header.md'), 'utf8'), '# 헤더\n')
  assert.ok(fs.existsSync(path.join(out, ...longDir.split('/').slice(1), 'page.html')), 'pax 긴 경로를 따르지 않았다')
  assert.ok(!fs.existsSync(path.join(out, 'starter-main')), '최상위 폴더를 벗기지 않았다')
  assert.ok(!fs.existsSync(path.join(out, 'src', 'truncated-name')), 'pax path 대신 잘린 이름을 썼다')
})

test('압축 해제: 프로젝트 폴더 밖을 가리키는 항목은 멈춘다', () => {
  const parent = fs.mkdtempSync(path.join(os.tmpdir(), 'iux-escape-'))
  const out = path.join(parent, 'project')
  fs.mkdirSync(out)
  const tarball = writeTarGz([tarEntry('starter-main/../../evil.txt', 'x')])
  assert.throws(() => extractTarGz(tarball, out), /폴더 밖/)
  assert.ok(!fs.existsSync(path.join(parent, 'evil.txt')))
})

test('의존성 설치: Windows는 셸을 거쳐 npm.cmd를 찾는다', () => {
  const calls = []
  const spawn = (...a) => { calls.push(a); return { status: 0 } }
  assert.deepEqual(runNpmInstall('C:\\work\\app', { platform: 'win32', spawn }), { ok: true })
  assert.equal(calls[0][0], 'npm install')
  assert.equal(calls[0][1].shell, true)
  assert.equal(calls[0][1].cwd, 'C:\\work\\app')

  calls.length = 0
  assert.deepEqual(runNpmInstall('/work/app', { platform: 'linux', spawn }), { ok: true })
  assert.deepEqual(calls[0].slice(0, 2), ['npm', ['install']])
})

test('의존성 설치: 실행 실패·비정상 종료는 이유와 함께 실패로 돌려준다', () => {
  const enoent = Object.assign(new Error('spawnSync npm ENOENT'), { code: 'ENOENT' })
  const failed = runNpmInstall('.', { platform: 'win32', spawn: () => ({ status: null, error: enoent }) })
  assert.equal(failed.ok, false)
  assert.match(failed.reason, /ENOENT/)
  assert.match(runNpmInstall('.', { platform: 'linux', spawn: () => ({ status: 1 }) }).reason, /종료 코드 1/)
  assert.match(runNpmInstall('.', { platform: 'linux', spawn: () => ({ status: null, signal: 'SIGINT' }) }).reason, /SIGINT/)
})

test('의존성 설치 실패는 「완료」로 덮지 않고 종료 코드 1로 알린다', () => {
  const block = CLI.slice(CLI.indexOf('// 5. npm install'), CLI.indexOf('다음 단계:'))
  assert.match(block, /runNpmInstall\(/)
  assert.match(block, /if \(installFailed\)[\s\S]*process\.exitCode = 1[\s\S]*else[\s\S]*✓ 완료!/)
})
