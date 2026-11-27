const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('fs')
const os = require('os')
const path = require('path')
const { needsDesignPlan, checkDesignPlan, checkDesignPlanFile, SECTIONS, DEFECTS, NORMAL_YES_LIMIT } = require('../lib/design-plan')

const ROOT = path.resolve(__dirname, '..', '..')

// 비평 한 회차 — yes: 「예」로 답한 문항 id, drop: 뺄 줄 이름, set: 바꿀 줄
const round = ({ title = '1회차 — 2026-11-13', yes = [], drop = [], set = {} } = {}) => {
  const lines = {
    평가자: '평가자: 하위 에이전트 — 캡처와 평가 지시문만 전달',
    캡처: '캡처: docs/shots/r1-1440.png · r1-360.png',
    '기계 검사': '기계 검사: 통과 — check 오류 0 · 넘침 없음 · 표제 비율 3.5배',
    '렌더 관문': '렌더 관문: 통과 — 첫 화면 사진 x 0~1440 · 1440×640 · 넓은 면 색 4가지 · 검색 입력 1개',
    결함: DEFECTS.map(d => `${d.id} ${yes.includes(d.id) ? '예' : '아니오'} — 1440 첫 화면 근거`).join('\n'),
    '짝 비교 1': '짝 비교 1: 가(직전 최고안) 대 나(이번 안) → 나',
    '짝 비교 2': '짝 비교 2: 가(이번 안) 대 나(직전 최고안) → 가',
    '견본 비교 1': '견본 비교 1: 가(한국관광공사) 대 나(이번 안) → 나',
    '견본 비교 2': '견본 비교 2: 가(이번 안) 대 나(한국관광공사) → 가',
    채택: '채택: 교체 — 직전 최고안에 두 번 모두 우세',
    '사람 판정': '사람 판정: 승인 — 운영자, 2026-11-13, 「이 방향으로 간다」'
  }
  Object.assign(lines, set)
  return `### ${title}\n` + Object.keys(lines).filter(k => !drop.includes(k)).map(k => lines[k]).join('\n')
}
const plan = ({ critique = round(), drop, extra = '' } = {}) => {
  const body = {
    컨셉: '소재: 현무암 · 돌담 · 감귤\n컨셉: 제주를 위에서 내려다본 섬 하나로 보여 준다',
    방향: '| 안 | 구도 |\n|----|------|\n| A | 분할 |\n고른 안: B — 발주자 선택',
    색: '전략: 몰입',
    서체: '페어링: formal-serif',
    레이아웃: '| 섹션 | 형식 id |\n|------|------|\n| 메인 비주얼 | H5 |\n```\n[ <표제> ][ 사진 ]\n```',
    원칙: '- 섬 장면과 경쟁하는 사진을 두지 않는다',
    '비평 기록': critique
  }
  return SECTIONS.filter(s => s !== drop).map(s => `## ${s}\n${body[s]}\n`).join('\n') + extra
}
const errors = (text, opts = { release: true }) => checkDesignPlan(text, opts).filter(f => f.severity === 'error')
const one = (text, pattern) => {
  const f = errors(text)
  assert.equal(f.length, 1, f.map(x => x.message).join('\n'))
  assert.match(f[0].message, pattern)
}

test('needsDesignPlan — pageTypes에 main이 있을 때만', () => {
  assert.equal(needsDesignPlan({ pageTypes: { 'index.html': 'main' } }), true)
  assert.equal(needsDesignPlan({ pageTypes: { 'index.html': { type: 'main', depth: 1 } } }), true)
  assert.equal(needsDesignPlan({ pageTypes: { 'pages/*.html': 'sub-content' } }), false)
  assert.equal(needsDesignPlan({}), false)
  assert.equal(needsDesignPlan(null), false)
})

test('일곱 칸, 분리된 평가자, 결함 문항, 두 번의 짝 비교, 사람 승인이 있으면 오류도 경고도 없다', () => {
  assert.deepEqual(checkDesignPlan(plan(), { release: true }), [])
})

test('칸이 빠지면 오류', () => {
  one(plan({ drop: '방향' }), /## 방향/)
})

test('옛 「합계: NN/20」 서식은 받지 않고 새 서식을 안내한다', () => {
  const old = '### 1회차 — 2026-11-13\n캡처: a.png\n1 컨셉 2 — 근거\n10 서명 2 — 근거\n합계: 18/20 — 통과'
  const f = errors(plan({ critique: old }))
  assert.equal(f.length, 1)
  assert.match(f[0].message, /옛 「합계: NN\/20」/)
  assert.match(f[0].message, /평가자:/)
  assert.match(f[0].message, /짝 비교 1:/)
  assert.match(f[0].message, /사람 판정:/)
})

test('평가자가 만든 에이전트면 불통과 — 자기 채점 표기를 여러 꼴로 잡는다', () => {
  for (const who of ['자기 채점', '만든 에이전트', '자체 평가 — 같은 세션', '본인', '같은 세션에서 이어서']) {
    one(plan({ critique: round({ set: { 평가자: `평가자: ${who}` } }) }), /만든 에이전트는 자기 화면을 평가하지 않는다/)
  }
})

test('평가자 설명에 「만든 에이전트」가 들어가도 분리된 평가자면 통과한다', () => {
  for (const who of ['하위 에이전트(만든 에이전트와 다른 맥락) — 캡처만 전달', '새 세션 — 만든 에이전트의 설명은 주지 않음', '사람 — 디자이너 검토', '다른 모델']) {
    assert.deepEqual(errors(plan({ critique: round({ set: { 평가자: `평가자: ${who}` } }) })), [], who)
  }
})

test('평가자·기계 검사·채택 줄이 없으면 오류', () => {
  one(plan({ critique: round({ drop: ['평가자'] }) }), /평가자: …/)
  one(plan({ critique: round({ drop: ['기계 검사'] }) }), /기계 검사: …/)
  one(plan({ critique: round({ drop: ['채택'] }) }), /채택: …/)
  one(plan({ critique: round({ set: { '기계 검사': '기계 검사: 불통과 — 360 가로 넘침' } }) }), /기계 검사가 불통과/)
})

test('결함 문항 결과가 없으면 오류, 일부만 있으면 경고', () => {
  one(plan({ critique: round({ drop: ['결함'] }) }), /결함 문항 결과가 없다/)
  const partial = round({ set: { 결함: 'D01 아니오 — 근거\nD02 아니오 — 근거' } })
  assert.deepEqual(errors(plan({ critique: partial })), [])
  const warns = checkDesignPlan(plan({ critique: partial }), { release: true }).filter(f => f.severity === 'warn')
  assert.equal(warns.length, 1)
  assert.match(warns[0].message, new RegExp(`${DEFECTS.length - 2}개에 답이 없다`))
})

test('셋째 평가자 다수결 표기 「아니오(다수결 2:1)」도 답으로 읽는다', () => {
  const majority = round({ set: { 결함: DEFECTS.map(d => `${d.id} ${d.id === 'D07' ? '예(다수결 2:1)' : '아니오(다수결 2:1)'} — 1440 첫 화면 근거`).join('\n') } })
  one(plan({ critique: majority }), /무거운 결함 문항이 「예」다\(D07/)
})

test('무거운 문항은 「예」 하나로 불통과, 일반 문항은 허용 개수를 넘으면 불통과', () => {
  one(plan({ critique: round({ yes: ['D04'] }) }), /무거운 결함 문항이 「예」다\(D04/)
  const normal = DEFECTS.filter(d => !d.heavy).map(d => d.id)
  assert.deepEqual(errors(plan({ critique: round({ yes: normal.slice(0, NORMAL_YES_LIMIT) }) })), [])
  one(plan({ critique: round({ yes: normal.slice(0, NORMAL_YES_LIMIT + 1) }) }), /일반 결함 문항 「예」가 3개/)
})

test('짝 비교는 순서를 바꿔 두 번 — 한 번뿐이거나 없으면 오류', () => {
  one(plan({ critique: round({ drop: ['짝 비교 2'] }) }), /한 번만 기록됐다/)
  const nothing = errors(plan({ critique: round({ drop: ['짝 비교 1', '짝 비교 2', '견본 비교 1', '견본 비교 2'], set: { 채택: '채택: 첫 안' } }) })).map(f => f.message)
  assert.equal(nothing.length, 2)
  assert.match(nothing[0], /짝 비교가 없다/)
  assert.match(nothing[1], /견본 비교가 없다/)
})

test('1회차는 견본 비교 두 번으로 짝 비교를 대신하고, 견본 비교를 건너뛰면 오류', () => {
  const first = { drop: ['짝 비교 1', '짝 비교 2', '견본 비교 1', '견본 비교 2'] }
  const withExemplar = round({ ...first, set: { 채택: '채택: 첫 안\n견본 비교 1: 가(E-01) 대 나(이번 안) → 가\n견본 비교 2: 가(이번 안) 대 나(E-01) → 가' } })
  assert.deepEqual(checkDesignPlan(plan({ critique: withExemplar }), { release: true }), [])
  const none = round({ ...first, set: { 채택: '채택: 첫 안\n짝 비교: 상대 없음' } })
  const f = checkDesignPlan(plan({ critique: none }), { release: true })
  assert.deepEqual(f.map(x => x.severity), ['warn', 'error'])
  assert.match(f[0].message, /평가자 통과가 아니다/)
  assert.match(f[1].message, /견본 비교는 건너뛰지 않는다/)
  one(plan({ critique: round({ drop: ['견본 비교 1', '견본 비교 2'] }) }), /견본 비교가 없다/)
})

test('이번 안이 두 번 모두 우세하지 않은데 교체하면 오류', () => {
  const split = round({ set: { '짝 비교 2': '짝 비교 2: 가(이번 안) 대 나(직전 최고안) → 나' } })
  one(plan({ critique: split }), /두 번 모두 우세할 때만/)
})

test('통과 견본이 두 번 모두 우세하면 불통과, 판정이 갈리면 지난다', () => {
  const lose = round({ drop: ['견본 비교 1', '견본 비교 2'], set: { 채택: '채택: 교체\n견본 비교 1: 가(E-01) 대 나(이번 안) → 가\n견본 비교 2: 가(이번 안) 대 나(E-01) → 나' } })
  one(plan({ critique: lose }), /견본보다 확연히 못한 안/)
  const tie = round({ drop: ['견본 비교 1', '견본 비교 2'], set: { 채택: '채택: 교체\n견본 비교 1: 가(E-01) 대 나(이번 안) → 가\n견본 비교 2: 가(이번 안) 대 나(E-01) → 가' } })
  assert.deepEqual(errors(plan({ critique: tie })), [])
})

test('사람 판정 — 줄이 없으면 오류, 납품에서는 「대기」도 오류, 개발 중에는 「대기」를 받는다', () => {
  one(plan({ critique: round({ drop: ['사람 판정'] }) }), /사람 판정: …/)
  const waiting = plan({ critique: round({ set: { '사람 판정': '사람 판정: 대기' } }) })
  one(waiting, /사람 판정이 비어 있다/)
  assert.deepEqual(checkDesignPlan(waiting, { release: false }), [])
  one(plan({ critique: round({ set: { '사람 판정': '사람 판정:' } }) }), /빈 칸/)
  one(plan({ critique: round({ set: { '사람 판정': '사람 판정: 불통과 — 운영자, 「아직 부족하다」' } }) }), /사람 판정이 불통과/)
})

test('평가자를 따로 두지 못했으면 결함·짝 비교 없이 사람 판정으로 넘긴다 — 납품에는 승인이 있어야 한다', () => {
  const fallback = set => round({ drop: ['결함', '짝 비교 1', '짝 비교 2'], set: { 평가자: '평가자: 분리 못 함 — 하위 에이전트를 쓸 수 없는 환경', 채택: '채택: 첫 안', ...set } })
  const dev = checkDesignPlan(plan({ critique: fallback({ '사람 판정': '사람 판정: 필요' }) }), { release: false })
  assert.deepEqual(dev.map(f => f.severity), ['warn'])
  assert.match(dev[0].message, /통과를 선언하지 않는다/)
  one(plan({ critique: fallback({ '사람 판정': '사람 판정: 필요' }) }), /사람 판정이 비어 있다/)
  assert.deepEqual(errors(plan({ critique: fallback({}) })), [])
})

test('지금의 최고안 회차를 읽는다 — 뒤 회차가 최고안을 넘지 못해 「유지」여도 된다', () => {
  const best = round({ title: '2회차 — 2026-11-13' })
  const worse = round({ title: '3회차 — 2026-11-14', yes: ['D03', 'D04'], drop: ['사람 판정'], set: { '짝 비교 1': '짝 비교 1: 가(직전 최고안) 대 나(이번 안) → 가', 채택: '채택: 유지 — 직전 최고안을 넘지 못함' } })
  assert.deepEqual(errors(plan({ critique: `${round({ yes: ['D01'], drop: ['사람 판정'] })}\n\n${best}\n\n${worse}` })), [])
  // 뒤 회차에 적힌 사람 판정이 최고안의 판정이다
  const rejected = worse + '\n사람 판정: 불통과 — 운영자, 「심심하고 전형적」'
  one(plan({ critique: `${best}\n\n${rejected}` }), /사람 판정이 불통과/)
})

test('서식 자리값이 남으면 오류 — 코드 펜스 안과 HTML 태그 이름은 넘어간다', () => {
  assert.deepEqual(errors(plan({ extra: '\n번호는 <ol>로 쓴다\n' })), [])
  const f = errors(plan({ extra: '\n컨셉: <대상>을 <무엇처럼> 보여 준다\n' }))
  assert.equal(f.length, 1)
  assert.match(f[0].message, /<대상>/)
})

test('고른 안 줄이 없으면 오류', () => {
  one(plan().replace(/고른 안:.*/, ''), /고른 안/)
})

test('개발 중에는 경고로 낮춘다', () => {
  const f = checkDesignPlan(plan({ drop: '색' }), { release: false })
  assert.equal(f.length, 1)
  assert.equal(f[0].severity, 'warn')
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

// ── 문항 목록 세 곳과 서식·견본 색인의 정합 ─────────────────────────

const read = rel => fs.readFileSync(path.join(ROOT, rel), 'utf8')
const ids = DEFECTS.map(d => d.id)

test('결함 문항은 design-intelligence §8-3, 평가자 지시문, 검사 목록 세 곳이 같다', () => {
  const guide = read('references/design-intelligence.md')
  const section = guide.slice(guide.indexOf('### 8-3. '), guide.indexOf('### 8-4. '))
  const heavyAt = section.indexOf('무거운 문항')
  const normalAt = section.indexOf('일반 문항')
  assert.ok(heavyAt >= 0 && normalAt > heavyAt, '§8-3에 무거운 문항·일반 문항 표가 없다')
  const rows = text => [...text.matchAll(/^\| (D\d{2}) \|/gm)].map(m => m[1])
  assert.deepEqual(rows(section.slice(heavyAt, normalAt)), DEFECTS.filter(d => d.heavy).map(d => d.id))
  assert.deepEqual(rows(section.slice(normalAt)), DEFECTS.filter(d => !d.heavy).map(d => d.id))

  const prompt = read('contracts/render-critique-evaluator.md')
  // 문항 줄(「D01 기관 이름과…」)만 센다 — 출력 형식의 「D01 <예|아니오…>」 줄은 뺀다
  assert.deepEqual([...prompt.matchAll(/^(D\d{2}) [^<\s]/gm)].map(m => m[1]), ids)
  // 지시문은 고정 출력 형식과 두 과제를 갖는다
  for (const must of ['## 결함 문항', '## 가장 큰 결함 세 가지', '## 짝 비교', '우세: <가|나>', '고칠 방향']) assert.ok(prompt.includes(must), must)
})

test('계획 서식의 비평 기록 견본은 자리값만 채우면 검사를 통과한다', () => {
  const form = read('contracts/design-plan.md')
  const block = form.slice(form.indexOf('## 비평 기록'), form.indexOf('```', form.indexOf('## 비평 기록')))
  for (const id of ids) assert.match(block, new RegExp(`^${id} <예\\|아니오>`, 'm'))
  const filled = block
    .replace('## 비평 기록\n', '')
    .replace(/<예\|아니오>/g, '아니오')
    .replace(/<통과\|불통과>/g, '통과')
    .replace('가(<견본 id>) 대 나(이번 안) → <가|나>', '가(E-01) 대 나(이번 안) → 나')
    .replace('가(이번 안) 대 나(<견본 id>) → <가|나>', '가(이번 안) 대 나(E-01) → 가')
    .replace('나(이번 안) → <가|나>', '나(이번 안) → 나')
    .replace('나(<직전 최고안>) → <가|나>', '나(1회차) → 가')
    .replace(/<첫 안\|교체\|유지>/, '교체')
    .replace(/<대기\|승인\|불통과>/, '승인')
    .replace(/<[^<>\n]+>/g, '값')
  assert.deepEqual(checkDesignPlan(plan({ critique: filled }), { release: true }), [])
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

test('렌더 관문 — 줄이 없으면 경고, 불통과면 막는다', () => {
  const { checkDesignPlan } = require('../lib/design-plan')
  const msgs = critique => checkDesignPlan(plan({ critique }), { release: true }).map(f => f.severity + ' ' + f.message)
  assert.ok(msgs(round({ drop: ['렌더 관문'] })).some(m => m.startsWith('warn') && m.includes('렌더 관문')))
  assert.ok(msgs(round({ set: { '렌더 관문': '렌더 관문: 불통과 — 검색 입력 2개' } })).some(m => m.startsWith('error') && m.includes('렌더 관문')))
  assert.ok(!msgs(round()).some(m => m.includes('렌더 관문')))
})

test('자리값 — 인라인 코드 안의 꺾쇠는 자리값이 아니다', () => {
  assert.deepEqual(errors(plan({ extra: '\n아이콘은 `<use href="assets/icons/sprite.svg#search">`로 그린다.\n' })), [])
  assert.ok(errors(plan({ extra: '\n대상: <대상>\n' })).some(f => f.message.includes('자리값')))
})
