// 디자인 기록(docs/design-plan.md) 판독 — CT-04
//   메인 페이지(infoux.json pageTypes에 main)가 있는 프로젝트는 references/design-intelligence.md 절차(자유 생성 →
//   바닥 교정 → 사람 판정)를 밟고 contracts/design-plan.md 서식으로 기록을 남긴다. 화면 품질은 사람이 본다.
//   여기서는 (1) 네 제목 (2) 서식 자리값(<…>)이 남지 않았는가 (3) 사람 판정 — 납품 게이트에서는 「승인」 만 본다.
//   모델 평가자의 결함 문항·짝 비교는 더는 납품 조건이 아니다(선택 도구로만 남는다).
// 결과 항목: { severity: 'error'|'warn', message }

const fs = require('fs')
const path = require('path')

const PLAN_PATH = 'docs/design-plan.md'
const SECTIONS = ['브리프', '재료', '교정 기록', '사람 판정']

// 결함 문항 — 선택 도구인 평가자 지시문(contracts/render-critique-evaluator.md)과 견본 색인이 쓰는 목록이다.
// 납품 검사에는 쓰지 않는다. 지시문과 같아야 한다(__tests__/design-plan.test.js가 본다). heavy는 「전형·심심함」 문항이다
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

const PLACEHOLDER = /<(?![a-z][a-z0-9-]*\s*\/?>)[^<>\n]{1,60}>/g

function checkDesignPlan(text, { release = false } = {}) {
  const out = []
  const level = release ? 'error' : 'warn'
  const sections = splitSections(text)

  for (const s of SECTIONS) {
    if (!(s in sections)) out.push({ severity: level, message: `「## ${s}」 칸이 없다 — contracts/design-plan.md 서식의 네 칸을 모두 둔다.` })
  }
  for (const s of ['브리프', '재료']) {
    if (s in sections && !sections[s].trim()) out.push({ severity: level, message: `「## ${s}」 칸이 비어 있다.` })
  }

  // 코드 펜스·인라인 코드 밖의 자리값만 본다
  const prose = String(text).replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '')
  const left = [...new Set((prose.match(PLACEHOLDER) || []).map(s => s.trim()))]
  if (left.length) out.push({ severity: level, message: `서식 자리값이 남아 있다 — ${left.slice(0, 5).join(' ')}${left.length > 5 ? ` 외 ${left.length - 5}개` : ''}` })

  // 사람 판정 — 칸 안의 마지막 「판정: …」 줄
  if ('사람 판정' in sections) {
    const lines = [...sections['사람 판정'].matchAll(/^\s*[-*]?\s*판정\s*[:：]\s*(.*)$/gm)].map(m => m[1].trim())
    const human = lines.length ? lines[lines.length - 1] : null
    if (human === null) {
      out.push({ severity: level, message: '「## 사람 판정」에 「판정: …」 줄이 없다 — 운영자·발주자의 「승인」「불통과」와 사유 원문을 적고, 아직이면 「대기」라고 적는다(design-intelligence §1-5).' })
    } else if (/^(불통과|반려|거절)/.test(human)) {
      out.push({ severity: level, message: '사람 판정이 불통과다 — 사유 원문을 보고 디자이너 수정이나 다시 생성으로 간다(design-intelligence §1-5).' })
    } else if (!/^승인/.test(human) && release) {
      out.push({ severity: 'error', message: `사람 판정이 비어 있다(「${human || '빈 칸'}」) — 납품에는 운영자·발주자의 「승인」과 사유 원문이 있어야 한다(design-intelligence §1-5).` })
    }
  }
  return out
}

// 프로젝트 루트에서 기록을 읽어 검사한다. 메인이 없으면 빈 배열
function checkDesignPlanFile(config, root, { release = false } = {}) {
  if (!needsDesignPlan(config)) return []
  const file = path.join(root, PLAN_PATH)
  if (!fs.existsSync(file)) {
    return [{ severity: release ? 'error' : 'warn', message: `메인 페이지가 있는데 ${PLAN_PATH}가 없다 — contracts/design-plan.md 서식으로 브리프·재료·교정 기록·사람 판정을 남긴다(references/design-intelligence.md).` }]
  }
  return checkDesignPlan(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''), { release })
}

module.exports = { PLAN_PATH, SECTIONS, DEFECTS, NORMAL_YES_LIMIT, needsDesignPlan, splitSections, checkDesignPlan, checkDesignPlanFile }
