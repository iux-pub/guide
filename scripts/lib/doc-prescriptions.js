// HX-07 — 기준 문서에 정본과 모순되는 처방(슬롭을 유도하는 문구)을 두지 않는다
//   사전: contracts/copy-lexicon.json prescriptions — { id, pattern(정규식), polarity, note }
//     prescriptive: 처방형 문구. 같은 줄에 금지·쓰지 않·피한다·안티패턴·❌가 있으면 반례 서술이라 면제
//     always: 그 자체가 정본과 충돌하는 문구. 면제하지 않는다
//   제목에 금지 예시·안티패턴·Don't·❌·나쁜 예가 든 블록은 다음 제목(레벨 무관)까지 건너뛴다.
//   ❌가 붙은 줄, 코드 펜스, 표의 Don't·❌·금지·나쁜 예 열은 건너뛴다.
// 결과: { rule: 'HX-07', line, id, message, code }

const NEGATION = /금지|쓰지\s*않|사용하지\s*않|하지\s*않|피한다|피하|안티패턴|❌|지양|않는다/
const COUNTER_HEADING = /금지\s*예시|안티\s*패턴|anti-?pattern|don'?t|❌|나쁜\s*예|잘못된\s*예/i
const COUNTER_COLUMN = /don'?t|❌|금지|나쁜|bad|잘못/i

function compile(prescriptions) {
  return (prescriptions || []).map(p => ({ ...p, re: new RegExp(p.pattern, 'i') }))
}

function scanDocPrescriptions(text, prescriptions) {
  const dict = compile(prescriptions)
  const out = []
  let skipBlock = false
  let inFence = false
  let counterCols = new Set()
  String(text).split('\n').forEach((raw, i) => {
    if (/^\s*```/.test(raw)) { inFence = !inFence; return }
    if (inFence) return
    const heading = raw.match(/^\s{0,3}#{1,6}\s+(.*)$/)
    if (heading) { skipBlock = COUNTER_HEADING.test(heading[1]); counterCols = new Set(); return }
    // 굵은 글씨 문단 머리(**금지 예시** …)도 다음 제목까지 반례 블록이다
    if (/^\s*\*\*[^*]*(?:금지\s*예시|안티\s*패턴|나쁜\s*예)[^*]*\*\*/.test(raw)) { skipBlock = true; return }
    // 반례 블록 안에서도 inCounterBlocks 항목('예측 가능한 레이아웃'을 안티패턴으로 적기)은 본다
    if (skipBlock || /❌/.test(raw)) {
      const line = raw.replace(/[*_`]/g, '')
      for (const p of dict.filter(d => d.inCounterBlocks)) {
        if (p.re.test(line)) out.push({ rule: 'HX-07', line: i + 1, id: p.id, message: `정본과 모순되는 처방(${p.id}) — ${p.note}`, code: raw.trim().slice(0, 120) })
      }
      return
    }
    let line = raw.replace(/[*_`]/g, '')
    // 표: 머리 행에서 반례 열을 기억하고, 본문 행에서는 그 열을 지운다
    if (/^\s*\|/.test(line)) {
      const cells = line.split('|').slice(1, -1)
      if (cells.some(c => COUNTER_COLUMN.test(c)) && !cells.every(c => /^\s*:?-{2,}:?\s*$/.test(c))) {
        const next = cells.map((c, j) => (COUNTER_COLUMN.test(c) ? j : -1)).filter(j => j >= 0)
        if (next.length && next.length < cells.length) { counterCols = new Set(next); return }
      }
      if (counterCols.size) line = '|' + cells.map((c, j) => (counterCols.has(j) ? '' : c)).join('|') + '|'
    } else if (line.trim()) {
      counterCols = new Set()
    }
    for (const p of dict) {
      if (!p.re.test(line)) continue
      if (p.polarity !== 'always' && NEGATION.test(line)) continue
      out.push({ rule: 'HX-07', line: i + 1, id: p.id, message: `정본과 모순되는 처방(${p.id}) — ${p.note}`, code: raw.trim().slice(0, 120) })
    }
  })
  return out
}

module.exports = { scanDocPrescriptions }
