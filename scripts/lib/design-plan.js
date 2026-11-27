// 디자인 계획(docs/design-plan.md) 판독 — CT-04
//   메인 페이지(infoux.json pageTypes에 main)가 있는 프로젝트는 references/design-intelligence.md 절차를 밟고
//   contracts/design-plan.md 서식으로 계획을 남긴다. 여기서는 절차를 밟은 흔적만 본다 — 화면 품질은 사람이 본다
//   (1) 일곱 제목  (2) 서식 자리값(<…>)이 남지 않았는가  (3) 비평 기록 — design-intelligence §8
//       · 평가자가 만든 에이전트와 분리됐는가(자기 채점 표기면 불통과)
//       · 기계 검사 결과가 통과인가
//       · 결함 문항(D01~D17) 결과가 있고 기준 안인가 — 무거운 문항 「예」 0개, 일반 문항 「예」 2개 이하
//       · 짝 비교가 순서를 바꿔 두 번 기록됐는가, 교체가 두 번 모두 우세일 때만 이뤄졌는가
//       · 사람 판정 줄이 있는가 — 납품 게이트에서는 「승인」이어야 한다
//   옛 「합계: NN/20」 자기 채점 서식은 받지 않는다.
// 결과 항목: { severity: 'error'|'warn', message }

const fs = require('fs')
const path = require('path')

const PLAN_PATH = 'docs/design-plan.md'
const SECTIONS = ['컨셉', '방향', '색', '서체', '레이아웃', '원칙', '비평 기록']

// 결함 문항 — 정본은 references/design-intelligence.md §8-3. 평가자 지시문(contracts/render-critique-evaluator.md)과
// 세 곳이 같아야 한다(__tests__/design-plan.test.js가 본다). heavy는 「전형·심심함」 문항이다
const DEFECTS = [
  { id: 'D01', heavy: true, label: '로고를 가리면 어느 기관인지 알 수 없다' },
  { id: 'D02', heavy: true, label: '첫 화면에서 가장 큰 것이 정해지지 않는다' },
  { id: 'D03', heavy: true, label: '첫 화면이 흔한 기본 틀 그대로다' },
  { id: 'D04', heavy: true, label: '면 전환이 색 띠 나열로 보인다' },
  { id: 'D05', heavy: true, label: '같은 모양의 카드 격자가 세 번 이상 반복된다' },
  { id: 'D06', heavy: true, label: '섹션이 같은 틀의 반복이다' },
  { id: 'D07', heavy: true, label: '부품이 받은 모양 그대로 보인다' },
  { id: 'D17', heavy: true, label: '디자인이 아니라 와이어프레임이다' },
  { id: 'D08', heavy: false, label: '머리글이 첫 화면과 따로 논다' },
  { id: 'D09', heavy: false, label: '글자의 무게가 고르게 흩어져 있다' },
  { id: 'D10', heavy: false, label: '대표색이 뜻 없이 넓게 깔려 있다' },
  { id: 'D11', heavy: false, label: '빈 칸이나 어긋난 선이 있다' },
  { id: 'D12', heavy: false, label: '사진이 작거나 탁하다' },
  { id: 'D13', heavy: false, label: '날짜·건수·위치가 목록으로만 있다' },
  { id: 'D14', heavy: false, label: '대상과 상관없는 장식이 보인다' },
  { id: 'D15', heavy: false, label: '360 폭이 넓은 화면을 줄여 놓은 모양이다' },
  { id: 'D16', heavy: false, label: '사진 위 글자가 사진에 묻힌다' }
]
// 일반 문항 「예」 허용 개수 — 세 개부터 불통과
const NORMAL_YES_LIMIT = 2

const FORMAT_HINT = '새 서식(contracts/design-plan.md): 「평가자:」「기계 검사:」, D01~D17의 예·아니오와 화면 근거, 「짝 비교 1:」「짝 비교 2:」, 「채택:」, 「사람 판정:」'

// infoux.json pageTypes에 main이 하나라도 있는가
function needsDesignPlan(config) {
  const types = config && config.pageTypes
  if (!types || typeof types !== 'object' || Array.isArray(types)) return false
  return Object.values(types).some(v => (typeof v === 'string' ? v : v && v.type) === 'main')
}

// '## 제목' 단위로 자른다 — { 제목: 본문 }
function splitSections(text) {
  const out = {}
  let name = null
  for (const line of String(text).replace(/\r\n?/g, '\n').split('\n')) {
    const m = line.match(/^##\s+(.+?)\s*$/)
    if (m) { name = m[1]; out[name] = ''; continue }
    if (name) out[name] += line + '\n'
  }
  return out
}

// 비평 기록을 '### ' 제목으로 나눈 회차 목록(제목이 없으면 칸 전체가 한 회차)
function splitRounds(body) {
  const parts = String(body).split(/^###\s+.*$/m)
  return parts.length > 1 ? parts.slice(1) : parts
}

// 「이름: 값」 줄의 값 — 없으면 null, 여러 번이면 마지막 줄
function field(text, name) {
  const all = [...String(text).matchAll(new RegExp(`^[ \\t]*(?:[-*][ \\t]*)?${name}[ \\t]*[:：][ \\t]*(.*)$`, 'gm'))]
  return all.length ? all[all.length - 1][1].trim() : null
}

// 줄표 앞부분 — 「하위 에이전트 — 캡처만 전달」의 「하위 에이전트」. 괄호 안 설명은 뺀다
const head = value => String(value).split(/\s[—–-]\s/)[0].replace(/\([^)]*\)/g, '').trim()

// 만든 에이전트가 스스로 평가했다는 표기
const SELF_EVALUATOR = /자기|자체|본인|스스로|셀프|self|만든\s*에이전트|제작\s*에이전트|생성\s*에이전트|작성\s*에이전트|같은\s*세션|동일\s*세션/i
// 평가자를 따로 두지 못했다는 표기 — design-intelligence §8-5 대체 절차
const NO_EVALUATOR = /분리\s*못|못\s*둠|없음|불가/

// 「가(직전 최고안) 대 나(이번 안) → 나」에서 우세한 쪽의 이름을 읽는다. 읽지 못하면 null
function pairWinner(value) {
  const m = String(value).match(/가\s*\(([^)]*)\)\s*대\s*나\s*\(([^)]*)\)\s*(?:→|->|=>)\s*(가|나)/)
  if (!m) return null
  return (m[3] === '가' ? m[1] : m[2]).trim()
}

// 한 종류(짝 비교·견본 비교)의 1·2번 줄 — { first, second } 값 또는 null
function pairLines(text, name) {
  return { first: field(text, `${name}\\s*1`), second: field(text, `${name}\\s*2`) }
}

const isCurrent = label => /이번\s*안/.test(label)

// 서식 자리값 — <대상>, <예|아니오>, <NN>처럼 꺾쇠 안에 한글·기호가 든 것. HTML 태그 이름(<br>, <ol>)은 뺀다
const PLACEHOLDER = /<(?![a-z][a-z0-9-]*\s*\/?>)[^<>\n]{1,60}>/g

// 지금의 최고안 회차(채택이 「교체」·「첫 안」인 마지막 회차)부터 끝까지를 본다. 없으면 마지막 회차
function currentBest(rounds) {
  for (let i = rounds.length - 1; i >= 0; i--) {
    const adopt = field(rounds[i], '채택')
    if (adopt && /^(교체|첫\s*안)/.test(adopt)) return { round: rounds[i], tail: rounds.slice(i).join('\n') }
  }
  const last = rounds[rounds.length - 1]
  return { round: last, tail: last }
}

function checkCritique(body, { release, level }) {
  const out = []
  const push = (severity, message) => out.push({ severity, message })
  const { round, tail } = currentBest(splitRounds(body))

  // 옛 자기 채점 서식
  const legacy = /합계\s*[:：]\s*\d{1,2}\s*\/\s*\d{1,2}/.test(round)
  const evaluator = field(round, '평가자')
  if (legacy) {
    push(level, `비평 기록이 옛 「합계: NN/20」 자기 채점 서식이다 — 만든 에이전트의 점수는 받지 않는다(design-intelligence §8). ${FORMAT_HINT}으로 다시 적는다.`)
    if (evaluator === null) return out
  }

  // 평가자 분리
  let fallback = false
  if (!evaluator) {
    push(level, `비평 기록에 「평가자: …」 줄이 없다 — 누가 평가했는지 적는다(하위 에이전트·새 세션·다른 모델·사람). ${FORMAT_HINT}`)
  } else if (SELF_EVALUATOR.test(head(evaluator))) {
    push(level, `평가자가 「${head(evaluator)}」다 — 만든 에이전트는 자기 화면을 평가하지 않는다. 캡처와 평가 지시문(contracts/render-critique-evaluator.md)만 받은 별도 평가자에게 맡기고, 둘 수 없으면 「평가자: 분리 못 함」으로 적어 사람 판정으로 넘긴다(design-intelligence §8-5).`)
  } else if (NO_EVALUATOR.test(head(evaluator))) {
    fallback = true
  }

  if (!/캡처\s*[:：]\s*\S/.test(round)) push('warn', '비평 기록에 「캡처: …」 줄이 없다 — 코드가 아니라 렌더를 보고 평가한다.')

  // 기계 검사 관문
  const machine = field(round, '기계\\s*검사')
  if (!machine) push(level, '비평 기록에 「기계 검사: …」 줄이 없다 — check·대비·넘침·터치 영역·글자 크기 비율의 결과를 값과 함께 적는다(design-intelligence §8-2).')
  else if (/^(불통과|실패)/.test(machine)) push(level, '기계 검사가 불통과다 — 계산되는 결함을 먼저 고친 뒤 평가자에게 넘긴다(design-intelligence §8-2).')
  else if (!/^통과/.test(machine)) push('warn', '「기계 검사:」 줄은 「통과」 또는 「불통과」로 시작한다.')

  // 렌더 관문(capture.js gate) — 글로만 있던 구성 규칙을 계산으로 거른다. 옛 계획을 끊지 않게 없으면 경고
  const renderGate = field(round, '렌더\\s*관문')
  if (!renderGate) push('warn', '비평 기록에 「렌더 관문: …」 줄이 없다 — node scripts/capture.js gate의 출력을 붙인다(design-intelligence §8-2).')
  else if (/^(불통과|실패)/.test(renderGate)) push(level, '렌더 관문이 불통과다 — 첫 화면 사진·면 색·검색 입력 같은 계산되는 결함을 먼저 고친다(design-intelligence §8-2).')

  // 결함 문항
  const answers = new Map()
  for (const m of round.matchAll(/^[ \t]*(?:[-*][ \t]*)?(D\d{2})[ \t]+(예|아니오|확인\s*못\s*함)(?=[ \t(]|$)/gm)) answers.set(m[1], m[2])
  if (fallback) {
    // 대체 절차 — 결함 후보만 적고 통과를 선언하지 않는다. 판정은 사람이 한다
  } else if (!answers.size) {
    push(level, '비평 기록에 결함 문항 결과가 없다 — 평가자가 D01~D17에 예·아니오와 화면 근거를 적는다(design-intelligence §8-3).')
  } else {
    const known = new Set(DEFECTS.map(d => d.id))
    const unknown = [...answers.keys()].filter(id => !known.has(id))
    if (unknown.length) push('warn', `결함 문항 목록에 없는 id가 있다(${unknown.join('·')}) — design-intelligence §8-3의 D01~D17을 쓴다.`)
    const missing = DEFECTS.filter(d => !answers.has(d.id)).map(d => d.id)
    if (missing.length) push('warn', `결함 문항 ${missing.length}개에 답이 없다(${missing.join('·')}) — 열일곱 문항 모두에 예·아니오와 근거를 적는다.`)
    const unsure = DEFECTS.filter(d => /확인/.test(answers.get(d.id) || '')).map(d => d.id)
    if (unsure.length) push('warn', `「확인 못 함」인 결함 문항이 있다(${unsure.join('·')}) — 그 문항이 보이는 캡처를 더해 다시 묻는다.`)
    const yes = DEFECTS.filter(d => answers.get(d.id) === '예')
    const heavy = yes.filter(d => d.heavy)
    const normal = yes.filter(d => !d.heavy)
    if (heavy.length) push(level, `무거운 결함 문항이 「예」다(${heavy.map(d => `${d.id} ${d.label}`).join(', ')}) — 하나라도 있으면 불통과다. D01·D03이면 방향 라운드로 돌아간다.`)
    if (normal.length > NORMAL_YES_LIMIT) push(level, `일반 결함 문항 「예」가 ${normal.length}개다(${normal.map(d => d.id).join('·')}) — ${NORMAL_YES_LIMIT}개 이하여야 한다.`)
  }

  // 짝 비교 — 순서를 바꿔 두 번
  const best = pairLines(round, '짝\\s*비교')
  const exemplar = pairLines(round, '견본\\s*비교')
  const adopt = field(round, '채택')
  const complete = p => Boolean(p.first && p.second)
  if (!fallback) {
    const half = [['짝 비교', best], ['견본 비교', exemplar]].filter(([, p]) => Boolean(p.first) !== Boolean(p.second))
    for (const [name] of half) push(level, `「${name}」가 한 번만 기록됐다 — 「가」「나」 자리를 바꿔 두 번 묻고 「${name} 1:」「${name} 2:」로 적는다(design-intelligence §8-4).`)
    if (!half.length && !complete(best) && !complete(exemplar)) {
      if (/상대\s*없음/.test(field(round, '짝\\s*비교') || '')) push('warn', '짝 비교 상대가 없다 — 평가자 통과가 아니다. 사람 판정으로 넘긴다(design-intelligence §8-4).')
      else push(level, '비평 기록에 짝 비교가 없다 — 직전 최고안이나 통과 견본과 순서를 바꿔 두 번 비교해 「짝 비교 1:」「짝 비교 2:」로 적는다. 상대가 없으면 「짝 비교: 상대 없음」이라고 적는다(design-intelligence §8-4).')
    }
    for (const [name, p] of [['짝 비교', best], ['견본 비교', exemplar]]) {
      if (complete(p) && (pairWinner(p.first) === null || pairWinner(p.second) === null)) {
        push('warn', `「${name}」 줄을 읽지 못했다 — 「가(직전 최고안) 대 나(이번 안) → 나」 꼴로 적는다.`)
      }
    }
    if (complete(best) && adopt && /^교체/.test(adopt)) {
      const [a, b] = [pairWinner(best.first), pairWinner(best.second)]
      if (a !== null && b !== null && !(isCurrent(a) && isCurrent(b))) push(level, '채택이 「교체」인데 이번 안이 짝 비교 두 번 모두 우세하지 않다 — 두 번 모두 우세할 때만 최고안을 바꾼다. 「판정 없음」이면 최고안을 유지한다(design-intelligence §8-6).')
    }
    if (!complete(exemplar) && !half.some(([name]) => name === '견본 비교')) push(level, '비평 기록에 견본 비교가 없다 — 통과 견본이 없으면 디비컷 기관/단체 평점 상위 사이트를 같은 폭으로 찍어 「견본 비교 1:」「견본 비교 2:」로 적는다. 견본 비교는 건너뛰지 않는다(design-intelligence §8-4).')
    if (complete(exemplar)) {
      const [a, b] = [pairWinner(exemplar.first), pairWinner(exemplar.second)]
      if (a !== null && b !== null && !isCurrent(a) && !isCurrent(b)) push(level, '통과 견본이 견본 비교 두 번 모두 우세하다 — 견본보다 확연히 못한 안이다. 불통과다(design-intelligence §8-4).')
    }
  }

  if (!adopt) push(level, '비평 기록에 「채택: …」 줄이 없다 — 「첫 안」「교체」「유지」 가운데 하나와 이유를 적는다(design-intelligence §8-6).')

  // 사람 판정 — 최고안 회차나 그 뒤 회차에 적힌 마지막 줄
  const human = field(tail, '사람\\s*판정')
  if (human === null) {
    push(level, '비평 기록에 「사람 판정: …」 줄이 없다 — 평가자 통과는 확연히 못한 안을 걸렀다는 뜻이다. 운영자·발주자의 판정을 「승인」「불통과」와 사유 원문으로 적고, 아직이면 「대기」라고 적는다(design-intelligence §8-7).')
  } else if (/^(불통과|반려|거절)/.test(human)) {
    push(level, '사람 판정이 불통과다 — 평가자가 통과시켰다면 그 사례를 assets/exemplars/index.json의 calibration에 적고 다시 만든다(design-intelligence §8-7·§8-8).')
  } else if (!/^승인/.test(human)) {
    if (release) push('error', `사람 판정이 비어 있다(「${human || '빈 칸'}」) — 납품에는 운영자·발주자의 「승인」과 사유 원문이 있어야 한다(design-intelligence §8-7).`)
    else if (fallback) push('warn', '평가자를 따로 두지 못했다 — 통과를 선언하지 않는다. 캡처와 결함 후보를 사람에게 넘겨 판정을 받는다(design-intelligence §8-5).')
  }
  return out
}

function checkDesignPlan(text, { release = false } = {}) {
  const out = []
  const level = release ? 'error' : 'warn'
  const sections = splitSections(text)

  for (const s of SECTIONS) {
    if (!(s in sections)) out.push({ severity: level, message: `「## ${s}」 칸이 없다 — contracts/design-plan.md 서식의 일곱 칸을 모두 채운다.` })
    else if (!sections[s].trim()) out.push({ severity: level, message: `「## ${s}」 칸이 비어 있다.` })
  }

  // 코드 펜스 밖의 자리값만 본다(와이어프레임 안의 < >는 넘어간다)
  // 인라인 코드(`<use href=…>` 같은 코드 인용)도 자리값이 아니다
  const prose = String(text).replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '')
  const left = [...new Set((prose.match(PLACEHOLDER) || []).map(s => s.trim()))]
  if (left.length) out.push({ severity: level, message: `서식 자리값이 남아 있다 — ${left.slice(0, 5).join(' ')}${left.length > 5 ? ` 외 ${left.length - 5}개` : ''}` })

  if ('방향' in sections && !/고른\s*안\s*[:：]\s*\S/.test(sections['방향'])) {
    out.push({ severity: level, message: '「## 방향」에 「고른 안: …」 줄이 없다 — 세 안 가운데 무엇을 누가 왜 골랐는지 적는다(design-intelligence §3).' })
  }

  if ('비평 기록' in sections && sections['비평 기록'].trim()) out.push(...checkCritique(sections['비평 기록'], { release, level }))
  return out
}

// 프로젝트 루트에서 계획을 읽어 검사한다. 메인이 없으면 빈 배열
function checkDesignPlanFile(config, root, { release = false } = {}) {
  if (!needsDesignPlan(config)) return []
  const file = path.join(root, PLAN_PATH)
  if (!fs.existsSync(file)) {
    return [{ severity: release ? 'error' : 'warn', message: `메인 페이지가 있는데 ${PLAN_PATH}가 없다 — contracts/design-plan.md 서식으로 컨셉·방향·형식·비평 기록을 남긴다(references/design-intelligence.md).` }]
  }
  return checkDesignPlan(fs.readFileSync(file, 'utf8').replace(/^﻿/, ''), { release })
}

module.exports = { PLAN_PATH, SECTIONS, DEFECTS, NORMAL_YES_LIMIT, needsDesignPlan, splitSections, checkDesignPlan, checkDesignPlanFile }
