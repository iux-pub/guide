// CT-03 납품 게이트(scripts/check-contract.js)·R-47 법령 예외(scripts/lib/contract-exceptions.js·page-rules.js)

const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { spawnSync } = require('node:child_process')
const { test } = require('node:test')
const assert = require('node:assert/strict')
const { checkContentSources, checkExceptions, rrnLegalBasis, parseDate } = require('../lib/contract-exceptions')
const { privacyFormFindings } = require('../lib/page-rules')

const CHECK = path.resolve(__dirname, '..', 'check-contract.js')
const NOW = new Date(2026, 9, 21)

function project(config, pages = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'iux-ct-'))
  if (config) fs.writeFileSync(path.join(dir, 'infoux.json'), JSON.stringify(config))
  for (const [name, html] of Object.entries(pages)) fs.writeFileSync(path.join(dir, name), html)
  return dir
}
const run = (dir, release) => spawnSync(process.execPath, [CHECK, ...(release ? ['--release'] : [])], { cwd: dir, encoding: 'utf8' })

test('CT-03: 개발 중에는 경고만, 납품(--release)에서는 막는다', () => {
  const dir = project({ profile: 'public-service', contentSources: [] }, { 'index.html': '<main><p data-content-pending>[발주처 확인 필요]</p></main>' })
  assert.equal(run(dir, false).status, 0)
  const rel = run(dir, true)
  assert.equal(rel.status, 2)
  assert.match(rel.stderr, /contentSources가 비어/)
  assert.match(rel.stderr, /data-content-pending/)
})

test('CT-03: infoux.json이 없으면 개발 중 건너뛰고, 납품에서는 오류', () => {
  const dir = project(null)
  assert.equal(run(dir, false).status, 0)
  assert.equal(run(dir, true).status, 2)
})

test('CT-03: 실제 출처가 있고 자리 표기가 없으면 납품 통과 — 주석 속 속성은 보지 않는다', () => {
  const dir = project({ profile: 'public-service', contentSources: ['https://www.jeju.go.kr/', 'docs/과업지시서.pdf'] }, { 'index.html': '<main><!-- <p data-content-pending> --><p>민원 신청</p></main>' })
  fs.mkdirSync(path.join(dir, 'docs'))
  fs.writeFileSync(path.join(dir, 'docs', '과업지시서.pdf'), '')
  const r = run(dir, true)
  assert.equal(r.status, 0, r.stderr)
})

test('CT-03: 자리값 출처·템플릿 문구는 출처가 아니다', () => {
  for (const v of ['TBD', '미정', '과업 문서 경로', '확인 필요'])
    assert.ok(checkContentSources({ contentSources: [v] }, '.', { release: true }).some(f => f.severity === 'error'), v)
})

test('CT-03: 예외 형식·만료 — 개발 중 경고, 납품 오류', () => {
  const cfg = { exceptions: [{ rule: 'R-23', reason: '시안', owner: 'UX팀', expires: '2026-10-01' }, { rule: 'R-34', reason: '이벤트', owner: 'UX팀', expires: '다음 분기' }, { rule: 'R-42', reason: '홍보' }] }
  const dev = checkExceptions(cfg, { now: NOW })
  assert.ok(dev.every(f => f.severity === 'warn'), JSON.stringify(dev))
  const rel = checkExceptions(cfg, { release: true, now: NOW })
  assert.equal(rel.filter(f => f.severity === 'error').length, 2)
  assert.equal(parseDate('2026-9-1'), null)
  assert.equal(parseDate('2026-02-30'), null)
})

test('R-47: 법령 근거 예외가 있으면 주민등록번호 입력을 경고로 낮춘다', () => {
  const html = '<form><label for="rrn">주민등록번호</label><input id="rrn" name="rrn"></form>'
  assert.ok(privacyFormFindings(html).some(f => f.severity === 'error' && /주민등록번호/.test(f.message)))
  const basis = rrnLegalBasis({ exceptions: [{ rule: 'R-47', reason: '세액 공제', legalBasis: '소득세법 제170조', owner: 'UX팀', expires: '2027-12-31' }] }, NOW)
  assert.equal(basis, '소득세법 제170조')
  const r = privacyFormFindings(html, { rrnLegalBasis: basis }).filter(f => /주민등록번호/.test(f.message))
  assert.ok(r.length && r.every(f => f.severity === 'warn'))
  // 근거 없는 예외·만료된 예외는 인정하지 않는다
  assert.equal(rrnLegalBasis({ exceptions: [{ rule: 'R-47', reason: '편의' }] }, NOW), null)
  assert.equal(rrnLegalBasis({ exceptions: [{ rule: 'R-47', legalBasis: '소득세법 제170조', expires: '2026-01-01' }] }, NOW), null)
})
