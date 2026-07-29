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
  }
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
