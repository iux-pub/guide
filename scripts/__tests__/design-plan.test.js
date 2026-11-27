const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('fs')
const os = require('os')
const path = require('path')
const { needsDesignPlan, checkDesignPlan, checkDesignPlanFile, SECTIONS, DEFECTS } = require('../lib/design-plan')

const ROOT = path.resolve(__dirname, '..', '..')

const plan = ({ drop, set = {}, extra = '' } = {}) => {
  const body = {
    브리프: '기관: 한국해양과학기술원 · 해양 연구\n1순위 과업: 공지·채용·입찰 확인\n사용자: 연구자·구직자\n기준 수준: 국내 수상 공공 수준\n피할 것: 와이어프레임 같은 화면',
    재료: '- 콘텐츠: infoux.json contentSources\n- 사진: assets/img/ieodo.jpg · 기관 제공 · 사용 허락',
    '교정 기록': '- R-12 — 첫 화면 표제 — 글자색 명도만 올림',
    '사람 판정': '판정: 승인 — 운영자, 2026-11-27, 「이대로 간다」',
    ...set
  }
  return SECTIONS.filter(s => s !== drop).map(s => `## ${s}\n${body[s]}\n`).join('\n') + extra
}
const errors = (text, opts = { release: true }) => checkDesignPlan(text, opts).filter(f => f.severity === 'error')

test('needsDesignPlan — pageTypes에 main이 있을 때만', () => {
  assert.equal(needsDesignPlan({ pageTypes: { 'index.html': 'main' } }), true)
  assert.equal(needsDesignPlan({ pageTypes: { 'index.html': { type: 'main' } } }), true)
  assert.equal(needsDesignPlan({ pageTypes: { 'list.html': 'list' } }), false)
  assert.equal(needsDesignPlan({}), false)
})

test('네 칸과 사람 승인이 있으면 오류도 경고도 없다', () => {
  assert.deepEqual(checkDesignPlan(plan(), { release: true }), [])
})

test('칸이 빠지면 오류, 브리프·재료가 비면 오류', () => {
  for (const s of SECTIONS) assert.ok(errors(plan({ drop: s })).some(f => f.message.includes(s)), s)
  assert.ok(errors(plan({ set: { 브리프: '' } })).some(f => f.message.includes('브리프')))
  assert.ok(errors(plan({ set: { 재료: '' } })).some(f => f.message.includes('재료')))
})

test('교정 기록은 비어 있어도 된다', () => {
  assert.deepEqual(errors(plan({ set: { '교정 기록': '' } })), [])
})

test('사람 판정 — 줄이 없으면 오류, 납품에서는 「대기」도 오류, 개발 중에는 「대기」를 받는다', () => {
  assert.ok(errors(plan({ set: { '사람 판정': '아직 안 봄' } })).some(f => f.message.includes('판정')))
  const waiting = plan({ set: { '사람 판정': '판정: 대기 — 캡처 전달함' } })
  assert.ok(errors(waiting).some(f => f.message.includes('승인')))
  assert.deepEqual(checkDesignPlan(waiting, { release: false }), [])
  assert.ok(errors(plan({ set: { '사람 판정': '판정: 불통과 — 운영자, 「구려」' } })).some(f => f.message.includes('불통과')))
})

test('다시 판정받으면 마지막 「판정:」 줄을 읽는다', () => {
  const twice = '판정: 불통과 — 운영자, 「사진이 탁하다」\n판정: 승인 — 운영자, 「사진 바꾼 안으로 간다」'
  assert.deepEqual(errors(plan({ set: { '사람 판정': twice } })), [])
})

test('개발 중에는 경고로 낮춘다', () => {
  const found = checkDesignPlan(plan({ drop: '재료' }), { release: false })
  assert.ok(found.length > 0 && found.every(f => f.severity === 'warn'))
})

test('자리값 — 남으면 오류, 코드 펜스·인라인 코드·HTML 태그 이름은 넘어간다', () => {
  assert.ok(errors(plan({ extra: '\n대상: <대상>\n' })).some(f => f.message.includes('자리값')))
  assert.deepEqual(errors(plan({ extra: '\n아이콘은 `<use href="assets/icons/sprite.svg#search">`로 그린다.\n' })), [])
  assert.deepEqual(errors(plan({ extra: '\n```\n[ <표제> ]\n```\n' })), [])
})

test('checkDesignPlanFile — 메인이 있는데 파일이 없으면 납품 오류, 메인이 없으면 검사하지 않는다', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'infoux-plan-'))
  try {
    const main = { pageTypes: { 'index.html': 'main' } }
    assert.deepEqual(checkDesignPlanFile({ pageTypes: {} }, dir, { release: true }), [])
    const missing = checkDesignPlanFile(main, dir, { release: true })
    assert.equal(missing.length, 1)
    assert.equal(missing[0].severity, 'error')
    fs.mkdirSync(path.join(dir, 'docs'))
    fs.writeFileSync(path.join(dir, 'docs', 'design-plan.md'), plan())
    assert.deepEqual(checkDesignPlanFile(main, dir, { release: true }), [])
  } finally {
    fs.rmSync(dir, { recursive: true, force: true })
  }
})

// ── 서식과 선택 도구(평가자 지시문·견본 색인)의 정합 ─────────────────

const read = rel => fs.readFileSync(path.join(ROOT, rel), 'utf8')
const ids = DEFECTS.map(d => d.id)

test('기록 서식은 자리값만 채우면 검사를 통과한다', () => {
  const form = read('contracts/design-plan.md')
  const block = form.slice(form.indexOf('```markdown') + '```markdown'.length, form.lastIndexOf('```'))
  for (const s of SECTIONS) assert.ok(block.includes(`## ${s}`), s)
  const filled = block
    .replace(/<대기\|승인\|불통과>/, '승인')
    .replace(/<[^<>\n]+>/g, '값')
  assert.deepEqual(checkDesignPlan(filled, { release: true }), [])
})

test('결함 문항은 평가자 지시문(선택 도구)과 검사 목록이 같다', () => {
  const prompt = read('contracts/render-critique-evaluator.md')
  // 문항 줄(「D01 기관 이름과…」)만 센다 — 출력 형식의 「D01 <예|아니오…>」 줄은 뺀다
  assert.deepEqual([...prompt.matchAll(/^(D\d{2}) [^<\s]/gm)].map(m => m[1]), ids)
})

test('기준 견본 색인 — 필수 칸, 판정 원문, 결함 문항 id, 캡처 상태', () => {
  const index = JSON.parse(read('assets/exemplars/index.json'))
  assert.ok(index.exemplars.length >= 2)
  assert.ok(Array.isArray(index.calibration))
  const seen = new Set()
  for (const e of index.exemplars) {
    assert.match(e.id, /^E-\d{2}$/)
    assert.ok(!seen.has(e.id), `${e.id} 중복`)
    seen.add(e.id)
    assert.ok(['통과', '불통과', '대기'].includes(e.verdict), `${e.id} verdict`)
    // 판정 대기인 안은 짝 비교 상대가 아니다
    if (e.verdict === '대기') assert.equal(e.use, '판정 대기', `${e.id} 대기 견본의 쓰임`)
    assert.ok(e.verdictQuote && e.judgedBy && e.title, `${e.id} 판정 원문·판정자·제목`)
    assert.ok(e.judgedAt === null || /^\d{4}-\d{2}-\d{2}$/.test(e.judgedAt), `${e.id} judgedAt`)
    for (const id of e.defects) assert.ok(ids.includes(id), `${e.id} 결함 문항 ${id}`)
    if (e.verdict === '통과') assert.deepEqual(e.defects, [], `${e.id} 통과 견본에 결함 문항`)
    assert.ok(e.captures.length > 0, `${e.id} 캡처 자리`)
    for (const c of e.captures) {
      assert.ok(Number.isInteger(c.width) && ['fold', 'full'].includes(c.kind), `${e.id} 캡처 폭·종류`)
      assert.ok(['있음', '캡처 대기'].includes(c.status), `${e.id} 캡처 상태`)
      assert.match(c.path, /^assets\/exemplars\/shots\/[a-z0-9-]+\.(png|webp|jpg)$/)
      // 「있음」이라고 적은 캡처는 실제로 있어야 한다
      if (c.status === '있음') assert.ok(fs.existsSync(path.join(ROOT, c.path)), `${c.path} 없음`)
      if (c.source !== undefined) assert.ok(typeof c.source === 'string' && c.source.length > 0, `${e.id} 캡처 원본 경로`)
    }
  }
  assert.ok(index.exemplars.some(e => e.verdict === '통과') && index.exemplars.some(e => e.verdict === '불통과'))
})

