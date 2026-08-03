// 팔레트 프리셋 검사 래퍼 — test:unit 글롭에 편입해 ci.yml 수정 없이 CI에서 돈다
// 검사 본체(대비 48건×프리셋·brand 동형·불변층·완전성·profiles id 정합)는 check-presets.js가 정본이다

const { execFileSync } = require('node:child_process')
const path = require('node:path')
const { test } = require('node:test')
const assert = require('node:assert/strict')

const ROOT = path.resolve(__dirname, '..', '..')

test('팔레트 프리셋 전수 검사 — 대비 위반 0·brand 동형·완전성', () => {
  try {
    execFileSync(process.execPath, [path.join(ROOT, 'scripts', 'check-presets.js')], {
      cwd: ROOT,
      encoding: 'utf8'
    })
  } catch (error) {
    assert.fail(
      `프리셋 검사 실패 — npm run check:presets로 상세를 확인한다:\n${error.stdout ?? ''}${error.stderr ?? ''}`
    )
  }
})
