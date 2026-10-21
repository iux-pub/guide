// 이름의 질 — 대체 텍스트·링크 이름·placeholder가 실제 정보를 담는가 (안티슬롭 명세, 경고 위주)
//   R-09 (품질) — alt가 일반 어휘('메인 이미지'·'hero image')·파일명·연번('이미지 1')·카메라 원본 이름이면 경고.
//        여러 줄에 걸친 <img>의 alt 누락은 오류(줄 단위 MISSING_ALT가 놓친다)
//   R-30 (이름) — '더보기'·'자세히'만인 링크, 같은 이름이 다른 목적지로 가는 링크(경고)
//   R-50 — placeholder가 '내용을 입력하세요' 같은 빈 안내이거나 레이블을 되풀이하면 경고. 예시('예: 2026-11-03')만 둔다
// 결과: { rule, severity, line, message, code }

const T = require('./html-tree')

const norm = T.norm
const code = n => (n.src || '').replace(/\s+/g, ' ').slice(0, 120)

// ─── R-09 대체 텍스트 ───────────────────────────────
const ALT_NOUN = /^(?:이미지|사진|그림|배너|로고|아이콘|썸네일|섬네일|비주얼|키비주얼|일러스트|슬라이드|배경|image|img|photo|picture|banner|logo|icon|thumbnail|visual|hero|slide|placeholder)$/i
const ALT_MOD = /^(?:메인|대표|상세|제품|상품|서비스|샘플|예시|기본|관련|소개|기능|첨부|본문|콘텐츠|상단|하단|임시|더미|main|sample|example|default|dummy|key)$/i
const ALT_NOUN_SRC = ALT_NOUN.source.slice(4, -2)
const ALT_MOD_SRC = ALT_MOD.source.slice(4, -2)
// 붙여 쓴 합성어(배너이미지·메인비주얼)를 일반 어휘 조각으로 다 덮는가
const COMPOUND = new RegExp(`^(?:${ALT_MOD_SRC}|${ALT_NOUN_SRC})+$`, 'i')
const ALT_FILE = /\.(?:jpe?g|png|webp|svg|gif|avif)$/i
const ALT_NUMBERED = new RegExp(`^(?:${ALT_NOUN_SRC}|파트너|partner)\\s*[-_#]?\\d+$`, 'i')
const ALT_CAMERA = /^(?:IMG|DSC|KakaoTalk|Screenshot|스크린샷)[\s_-]*\w*\d/i

function altProblem(alt) {
  const a = norm(alt)
  if (!a) return null
  if (ALT_FILE.test(a)) return '파일 이름'
  if (ALT_CAMERA.test(a)) return '카메라·원본 파일 이름'
  if (ALT_NUMBERED.test(a)) return '연번'
  const words = a.split(/\s+/)
  if (words.every(w => ALT_NOUN.test(w) || ALT_MOD.test(w) || COMPOUND.test(w)) && words.some(w => ALT_NOUN.test(w) || COMPOUND.test(w))) return '일반 어휘'
  return null
}

function altFindings(html) {
  const out = []
  T.walk(T.parseHtml(html), n => {
    if (n.tag !== 'img') return
    const a = n.attrs
    if (a['aria-hidden'] === 'true' || /^(?:presentation|none)$/i.test(a.role || '') || a['aria-labelledby']) return
    if (!('alt' in a)) {
      // 한 줄 태그는 check-violations.js MISSING_ALT가 이미 오류로 낸다
      if (/\n/.test(n.src || '')) out.push({ rule: 'R-09', severity: 'error', line: n.line, message: '<img> alt 속성 누락(여러 줄 태그). 장식이면 alt="".', code: code(n) })
      return
    }
    const why = altProblem(a.alt)
    if (why) out.push({ rule: 'R-09', severity: 'warn', line: n.line, message: `대체 텍스트 "${norm(a.alt)}"는 ${why}이라 이미지가 무엇을 전하는지 알 수 없다 — 내용을 쓴다(예: '제주 성산일출봉 일출 풍경'). 장식이면 alt="".`, code: code(n) })
  })
  return out
}

// ─── R-30 링크 이름 ─────────────────────────────────
const VAGUE_LINK = /^(?:더보기|자세히(?:보기)?|상세보기|전체보기|바로가기|여기|클릭|이동|more|viewmore|readmore|learnmore|seemore|go)$/i
const linkName = (root, n) => {
  const by = n.attrs['aria-labelledby']
  if (by) return norm(by.split(/\s+/).map(id => { const t = T.find(root, x => x.attrs?.id === id); return t ? T.textOf(t, { accessible: true }) : '' }).join(' '))
  if (n.attrs['aria-label']) return norm(n.attrs['aria-label'])
  const alts = []
  T.walk(n, c => { if (c.tag === 'img' && c.attrs.alt && c.attrs['aria-hidden'] !== 'true') alts.push(c.attrs.alt) })
  return norm(`${T.textOf(n, { accessible: true })} ${alts.join(' ')}`)
}
const vagueKey = name => name.replace(/[\s+>›»→·…]/g, '')
const hrefKey = href => String(href).trim().replace(/#.*$/, '').replace(/\/index\.html?$/i, '/').replace(/\/+$/, '')

function linkNameFindings(html) {
  const out = []
  const root = T.parseHtml(html)
  const byName = new Map()
  T.walk(root, n => {
    if (n.tag !== 'a' || !n.attrs.href) return
    const href = n.attrs.href
    if (/^\s*(?:#|javascript:)/i.test(href) || !href.trim()) return // 목적지 없는 링크는 R-30 오류가 다룬다
    const name = linkName(root, n)
    if (!name || /^\d+$/.test(name)) return
    if (VAGUE_LINK.test(vagueKey(name))) {
      out.push({ rule: 'R-30', severity: 'warn', line: n.line, message: `링크 이름 "${name}"만으로는 목적지를 알 수 없다 — '공지사항 더보기'로 쓰거나 <span class="sr-only">공지사항</span>을 붙인다.`, code: code(n) })
      return
    }
    if (!byName.has(name)) byName.set(name, [])
    byName.get(name).push({ n, key: hrefKey(href) })
  })
  for (const [name, list] of byName) {
    const keys = new Set(list.map(x => x.key))
    if (keys.size < 2) continue
    const second = list.find(x => x.key !== list[0].key)
    out.push({ rule: 'R-30', severity: 'warn', line: second.n.line, message: `이름이 같은 링크 "${name}"가 서로 다른 목적지 ${keys.size}곳으로 간다 — 이름에 대상을 넣어 구분한다.`, code: code(second.n) })
  }
  return out
}

// ─── R-50 placeholder ──────────────────────────────
const EMPTY_PLACEHOLDER = /^(?:내용|텍스트|값|정보|입력값)?\s*[을를]?\s*입력(?:하세요|해\s?주세요|해\s?주십시오|하십시오)?\s*\.?$/
const stripRequired = s => norm(String(s).replace(/\(\s*필수\s*\)|\*/g, ''))

function placeholderFindings(html) {
  const out = []
  const root = T.parseHtml(html)
  T.walk(root, n => {
    if (!['input', 'textarea'].includes(n.tag) || !n.attrs.placeholder) return
    const ph = norm(n.attrs.placeholder)
    let label = ''
    if (n.attrs.id) {
      const l = T.find(root, x => x.tag === 'label' && x.attrs.for === n.attrs.id)
      if (l) label = stripRequired(T.textOf(l, { accessible: true }))
    }
    if (!label) {
      const wrap = T.ancestors(n).find(a => a.tag === 'label')
      if (wrap) label = stripRequired(T.textOf(wrap, { accessible: true }))
    }
    if (!label && n.attrs['aria-label']) label = stripRequired(n.attrs['aria-label'])
    const same = label && stripRequired(ph) === label
    if (EMPTY_PLACEHOLDER.test(ph) || same) {
      out.push({ rule: 'R-50', severity: 'warn', line: n.line, message: `placeholder "${ph}"는 ${same ? '레이블을 되풀이할 뿐' : '빈 안내'}이다 — placeholder에는 '예: 2026-11-03' 같은 예시만 두고, 설명은 form-field__hint와 aria-describedby로 준다.`, code: code(n) })
    }
  })
  return out
}

module.exports = { altFindings, altProblem, linkNameFindings, placeholderFindings }
