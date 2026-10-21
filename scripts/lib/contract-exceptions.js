// 프로젝트 계약(infoux.json)의 콘텐츠 출처·규칙 예외 판독 (CT-03)
//   contentSources: 실제 기관 용어·메뉴·연락처를 가져온 곳. 자리값(TBD·미정·템플릿 문구)은 출처가 아니다
//   exceptions: [{ rule, reason, owner, expires: 'YYYY-MM-DD', legalBasis? }]
//     — 검사기가 예외로 규칙을 끄지 않는다(자가 면제 방지). 예외는 R-47 주민등록번호처럼 규칙이 명시한 경우만 읽는다
// 결과 항목: { severity: 'error'|'warn', message } — release면 납품 차단 항목이 error

const fs = require('fs')
const path = require('path')

const PLACEHOLDER_SOURCE = /^(?:tbd|미정|없음|확인\s*필요|n\/a|-|과업\s*문서\s*경로|용어집|기존\s*사이트\s*url|과업\s*문서\s*경로[·,\s]*용어집[·,\s]*기존\s*사이트\s*url)$/i

function readConfig(root) {
  const p = path.join(root, 'infoux.json')
  if (!fs.existsSync(p)) return null
  return JSON.parse(fs.readFileSync(p, 'utf8').replace(/^\uFEFF/, ''))
}

// YYYY-MM-DD 엄격 판독 — 형식이 틀리면 null
function parseDate(s) {
  const m = String(s || '').match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return null
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]))
  return d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[3] ? d : null
}

function todayUtc(now = new Date()) {
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))
}

function checkContentSources(config, root, { release = false } = {}) {
  const out = []
  const level = release ? 'error' : 'warn'
  const sources = config.contentSources
  if (!Array.isArray(sources) || !sources.length) {
    out.push({ severity: level, message: 'infoux.json contentSources가 비어 있다 — 화면 문구·메뉴·연락처는 초안이다. 과업 문서·기존 사이트·용어집 출처를 적는다.' })
    return out
  }
  for (const s of sources) {
    const v = typeof s === 'string' ? s.trim() : (s && (s.path || s.url || s.title || '')).trim()
    if (!v || PLACEHOLDER_SOURCE.test(v)) {
      out.push({ severity: level, message: `contentSources 항목 "${v}"는 자리값이다 — 실제 문서 경로·URL을 적는다.` })
      continue
    }
    // 경로처럼 생긴 항목은 프로젝트 안에 실재해야 한다
    if (!/^[a-z]+:\/\//i.test(v) && /[\\/]|\.\w{2,5}$/.test(v) && !fs.existsSync(path.resolve(root, v))) {
      out.push({ severity: 'warn', message: `contentSources 경로 "${v}"가 프로젝트에 없다.` })
    }
  }
  return out
}

function checkExceptions(config, { release = false, now } = {}) {
  const out = []
  const today = todayUtc(now)
  const list = Array.isArray(config.exceptions) ? config.exceptions : []
  list.forEach((ex, i) => {
    const name = `exceptions[${i}]${ex && ex.rule ? ` (${ex.rule})` : ''}`
    if (!ex || typeof ex !== 'object' || !ex.rule || !ex.reason) {
      out.push({ severity: release ? 'error' : 'warn', message: `${name}: rule과 reason이 필요하다.` })
      return
    }
    if (!ex.owner || !ex.expires) out.push({ severity: 'warn', message: `${name}: owner·expires(YYYY-MM-DD)를 적는다 — 누가 언제까지 책임지는 예외인지 남긴다.` })
    if (ex.expires) {
      const d = parseDate(ex.expires)
      if (!d) out.push({ severity: release ? 'error' : 'warn', message: `${name}: expires "${ex.expires}"는 YYYY-MM-DD 형식이 아니다.` })
      else if (d < today) out.push({ severity: release ? 'error' : 'warn', message: `${name}: ${ex.expires}에 만료됐다 — 연장 근거를 적거나 예외를 걷어 낸다.` })
    }
  })
  return out
}

// R-47 주민등록번호 법령 예외 — rule R-47, legalBasis(법령 조항)가 있고 만료되지 않은 항목
function rrnLegalBasis(config, now) {
  const today = todayUtc(now)
  const ex = (Array.isArray(config?.exceptions) ? config.exceptions : []).find(e => e && e.rule === 'R-47' && typeof e.legalBasis === 'string' && e.legalBasis.trim() && (!e.expires || (parseDate(e.expires) && parseDate(e.expires) >= today)))
  return ex ? ex.legalBasis.trim() : null
}

module.exports = { readConfig, parseDate, checkContentSources, checkExceptions, rrnLegalBasis, PLACEHOLDER_SOURCE }
