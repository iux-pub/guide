// 아이콘 카탈로그 검색 — 스튜디오 서버·CLI·MCP가 같은 점수를 쓴다.
//
// 이 파일은 mcp/bin/icon-search.js로 복사되어 나간다(npm run build:mcp). MCP 패키지는
// 이 저장소의 scripts/를 볼 수 없어서다. 둘이 어긋나면 AI가 찾는 결과와 사람이 스튜디오에서
// 찾는 결과가 달라진다 — check-harness가 두 파일이 같은지 지킨다. 고칠 때는 여기서만 고친다.
//
// 의존성이 없다. 색인(library.json)의 한 줄은 {m, n, c, p, ko, k, t} 꼴이다.
//   m 구글 이름   n 우리 기본 이름(없으면 null)   c 분류   p 인기도
//   ko 한국어 이름   k 한국어 검색어   t 영문 태그

/** 칸마다 걸린 정도. 정확히 맞을수록, 한국어 이름에 맞을수록 높다. */
const W = {
  koExact: 100, koStart: 80, koIncl: 60,
  kExact: 70, kStart: 50, kIncl: 30,
  nameExact: 90, nameSeg: 60, nameIncl: 30,
  tagExact: 20, tagIncl: 8,
  catIncl: 10
}

/**
 * 걸린 정도를 세 등급으로 묶는다. 등급이 다르면 무조건 높은 쪽이 앞이고,
 * 같은 등급 안에서는 많이 쓰이는 쪽이 앞이다.
 *
 * 왜 이렇게 나누나: 「돋보기」를 치면 사람은 검색 아이콘을 찾는다. 그런데 「돋보기 도킹」이라는
 * 이름의 아이콘은 이름이 「돋보기」로 시작해서 80점, 검색은 검색어 사전에서 정확히 맞아 70점이었다.
 * 점수만 보면 인기 없는 쪽이 앞선다. 둘은 같은 등급(잘 맞는다)이므로 인기로 가려야 한다.
 * 반대로 한국어 이름이 정확히 같은 것(장바구니)은 인기와 무관하게 맨 위여야 한다.
 */
const TIER = { exact: 90, good: 50, weak: 30 }

function tierOf(avg) {
  if (avg >= TIER.exact) return 3
  if (avg >= TIER.good) return 2
  if (avg >= TIER.weak) return 1
  return 0
}

const norm = (s) => String(s || '').toLowerCase().trim()

/**
 * 아이콘을 찾는 자리에서 「아이콘」은 아무것도 가르지 않는다. 그런데 구글 태그에는 「find icon」처럼
 * 「icon」이 박힌 것이 많아, 「cart icon」이라고 치면 장바구니와 상관없는 아이콘이 끼어든다.
 */
const NOISE_TERMS = new Set(['icon', 'icons', '아이콘'])

/** 검색어 한 마디가 아이콘 한 개에 얼마나 걸리나. 안 걸리면 0. */
function scoreTerm(icon, term, categoryLabel) {
  let best = 0
  let via = ''
  const hit = (score, reason) => { if (score > best) { best = score; via = reason } }

  // 이름(영어) — 구글 이름과 우리 이름 둘 다
  for (const raw of [icon.m, icon.n]) {
    const name = norm(raw)
    if (!name) continue
    const flat = name.replace(/[-_]/g, ' ')
    if (name === term || flat === term) hit(W.nameExact, 'name')
    else if (flat.split(' ').includes(term)) hit(W.nameSeg, 'name')
    else if (flat.includes(term)) hit(W.nameIncl, 'name')
  }

  // 한국어 이름과 검색어
  const ko = norm(icon.ko)
  if (ko) {
    if (ko === term) hit(W.koExact, 'ko')
    else if (ko.startsWith(term)) hit(W.koStart, 'ko')
    else if (ko.includes(term)) hit(W.koIncl, 'ko')
  }
  for (const k of icon.k || []) {
    const w = norm(k)
    if (!w) continue
    if (w === term) hit(W.kExact, 'k')
    else if (w.startsWith(term)) hit(W.kStart, 'k')
    else if (w.includes(term)) hit(W.kIncl, 'k')
  }

  // 영문 태그 — 이름에 없는 말로 걸릴 때(purchase → shopping_cart)
  for (const t of icon.t || []) {
    if (t === term) hit(W.tagExact, 'tag')
    else if (term.length >= 3 && t.includes(term)) hit(W.tagIncl, 'tag')
  }

  // 분류 이름
  if (categoryLabel && norm(categoryLabel).includes(term)) hit(W.catIncl, 'cat')

  return { score: best, via }
}

/**
 * 검색. 띄어 쓴 말은 모두 걸려야 한다(AND). 마디별 최고점의 평균으로 등급을 매기고,
 * 같은 등급 안에서는 인기도(로그)로 가른다. 점수 = 등급 × 1000 + 평균 + 10 × log10(인기도+1).
 *
 * @param {{icons: object[], categories?: object[]}} library
 * @param {string} query
 * @param {{limit?: number, category?: string|null, only?: Set<string>|null}} opts
 *        only: 이 구글 이름들만 대상으로 삼는다(세트에 있는 것만 볼 때)
 * @returns {{icon: object, score: number, via: string}[]}
 */
function search(library, query, opts = {}) {
  const { limit = 60, category = null, only = null } = opts
  const terms = norm(query).split(/\s+/).filter((t) => t && !NOISE_TERMS.has(t))
  const labelOf = new Map((library.categories || []).map((c) => [c.id, c.label]))

  const rows = []
  for (const icon of library.icons) {
    if (category && icon.c !== category) continue
    if (only && !only.has(icon.m)) continue

    if (terms.length === 0) {
      rows.push({ icon, score: 0, via: '' })
      continue
    }
    let sum = 0
    let via = ''
    let ok = true
    for (const term of terms) {
      const r = scoreTerm(icon, term, labelOf.get(icon.c))
      if (r.score === 0) { ok = false; break }
      sum += r.score
      if (!via) via = r.via
    }
    if (!ok) continue
    const avg = sum / terms.length
    // 인기도는 로그로 누른다 — 0~18만을 0~53으로. 등급을 넘어서 뒤집지는 못한다(등급이 ×1000)
    rows.push({ icon, score: tierOf(avg) * 1000 + avg + 10 * Math.log10((icon.p || 0) + 1), via })
  }

  rows.sort((a, b) => b.score - a.score || (b.icon.p || 0) - (a.icon.p || 0) || a.icon.m.localeCompare(b.icon.m))
  return rows.slice(0, limit)
}

module.exports = { search, scoreTerm }
