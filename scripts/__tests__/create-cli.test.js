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

test('--profile 값은 Task Contract 스키마의 profile enum과 같다', () => {
  const schema = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'contracts', 'task-contract.schema.json'), 'utf8')
  )
  const schemaProfiles = schema.properties.profile.enum.slice().sort()

  const block = CLI.match(/const PROFILES = \{([\s\S]*?)\n\}/)
  assert.ok(block, 'PROFILES를 읽지 못했다')
  const cliProfiles = [...block[1].matchAll(/^\s*'([a-z-]+)':/gm)].map(m => m[1]).sort()

  assert.deepEqual(
    cliProfiles,
    schemaProfiles,
    'CLI가 받는 사이트 유형과 스키마 enum이 다르면 생성물이 계약을 어긴다'
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
