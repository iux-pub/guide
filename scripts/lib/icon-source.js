// 아이콘 원본(구글 Material Symbols) 다루기 — 수입·카탈로그·채택이 함께 쓰는 한 곳.
//
// 같은 일을 세 군데서 각자 하면 한 곳만 고치고 나머지가 어긋난다. 그러면 카탈로그 미리보기와
// 채택 결과가 다른 그림이 된다 — 「미리 본 것과 들어온 것이 다르다」는 이 도구에서 가장 나쁜 일이다.
// 그래서 원본을 받는 주소, 24 좌표계로 옮기는 방법, 이름 규칙, 번호 할당을 여기 하나만 둔다.

const crypto = require('node:crypto')
const { transformPath, pathBounds } = require('./svg-path')

/** 구글 Material Symbols 원본 SVG 주소. 우리 규격(24px)과 같은 광학 크기라 그대로 받는다. */
function sourceUrl(seedSource, material, axis) {
  return seedSource.urlTemplate
    .replace('{style}', seedSource.style)
    .replace('{material}', material)
    .replace('{axis}', axis)
}

/** 계약의 표정 조합 중 기본(regular)이 가리키는 축 경로. */
function axisFor(contract, seedSource, comboId) {
  return (seedSource.variantAxisPath || {})[comboId] || 'default'
}

function sha256(text) {
  return crypto.createHash('sha256').update(text).digest('hex')
}

/** 재시도가 있는 내려받기. 일시적인 오류(5xx·네트워크)만 다시 하고, 404는 바로 던진다. */
async function fetchText(url, { retries = 2, fetchImpl = fetch } = {}) {
  let last
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const res = await fetchImpl(url)
      if (res.ok) return await res.text()
      const err = new Error(`HTTP ${res.status}`)
      err.status = res.status
      if (res.status < 500) throw err // 404 등은 다시 해도 같다
      last = err
    } catch (err) {
      if (err.status && err.status < 500) throw err
      last = err
    }
    await new Promise((r) => setTimeout(r, 300 * (attempt + 1)))
  }
  throw last
}

/**
 * 원본 SVG를 규격에 맞는 24 좌표계 SVG로 바꾼다.
 * 실패 사유가 있으면 던진다 — 규격 밖 아이콘을 조용히 통과시키지 않는다.
 *
 * @returns {{svg: string, warnings: string[], pathCount: number}}
 */
function normalize(raw, name, contract) {
  const CANVAS = contract.canvas.width
  const PADDING = contract.canvas.padding
  const DECIMALS = contract.output.decimalPlaces

  const viewBox = raw.match(/viewBox="([^"]+)"/)
  if (!viewBox) throw new Error('viewBox 없음')

  const [vx, vy, vw, vh] = viewBox[1].trim().split(/\s+/).map(Number)
  if (vw !== vh) throw new Error(`정사각형이 아님 (${vw}×${vh})`)

  // 원본 좌표계를 24로 옮긴다. viewBox 원점이 (vx, vy)이므로 그만큼 되돌린다.
  const scale = CANVAS / vw
  const paths = [...raw.matchAll(/<path[^>]*\sd="([^"]+)"/g)].map((m) => m[1])
  if (paths.length === 0) throw new Error('path 없음')

  const moved = paths.map((d) => transformPath(d, { scale, dx: -vx, dy: -vy, decimals: DECIMALS }))

  // 좌표 검사. 두 단계로 나눈다.
  //   캔버스(0~24) 초과      → 실패. 변환이 잘못됐다는 뜻이다.
  //   라이브 영역(2~22) 초과 → 경고. 형태에 따라 정상일 수 있다 — Material도
  //     자물쇠처럼 세로로 긴 것, 눈·경고삼각형처럼 가로로 넓은 것은 keyline이
  //     달라 22를 넘는다. 자체 제작 아이콘에서 이 경고가 뜨면 눈으로 봐야 한다.
  const all = moved.join(' ')
  const b = pathBounds(all)
  const warnings = []
  if (b) {
    const slack = 0.5
    if (b.minX < -slack || b.minY < -slack || b.maxX > CANVAS + slack || b.maxY > CANVAS + slack) {
      throw new Error(
        `캔버스 ${CANVAS} 벗어남 x[${b.minX.toFixed(2)}..${b.maxX.toFixed(2)}] y[${b.minY.toFixed(2)}..${b.maxY.toFixed(2)}] — 좌표 변환 확인 필요`
      )
    }
    const lo = PADDING - slack
    const hi = CANVAS - PADDING + slack
    if (b.minX < lo || b.minY < lo || b.maxX > hi || b.maxY > hi) {
      warnings.push(
        `라이브 영역 ${contract.canvas.liveArea} 초과 x[${b.minX.toFixed(2)}..${b.maxX.toFixed(2)}] y[${b.minY.toFixed(2)}..${b.maxY.toFixed(2)}]`
      )
    }
  }

  const body = moved.map((d) => `<path d="${d}"/>`).join('')
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CANVAS} ${CANVAS}" ` +
    `width="${CANVAS}" height="${CANVAS}" fill="currentColor" data-icon="${name}">` +
    `${body}</svg>\n`

  return { svg, warnings, pathCount: moved.length }
}

/** 대장과 tombstone을 모두 피해 다음 코드포인트를 뽑는다. 한 번 부여한 번호는 영구다. */
function allocateCodepoint(ledger, contract) {
  const used = new Set()
  for (const v of Object.values(ledger.icons || {})) used.add(v.codepoint)
  for (const v of Object.keys(ledger.tombstones || {})) used.add(v)

  const end = parseInt(contract.codepoints.range.end.replace('U+', ''), 16)
  let cp = parseInt(contract.codepoints.range.start.replace('U+', ''), 16)
  for (; cp <= end; cp += 1) {
    const hex = 'U+' + cp.toString(16).toUpperCase().padStart(4, '0')
    if (!used.has(hex)) return hex
  }
  throw new Error('코드포인트 영역이 가득 찼습니다')
}

/**
 * 이름이 계약을 지키는가. 어긋나면 이유를 문장으로 돌려준다(통과면 null).
 * 서버·검사기·카탈로그가 같은 판정을 쓰도록 한 곳에 둔다.
 */
function nameIssue(name, contract) {
  const re = new RegExp(contract.naming.pattern)
  if (!re.test(name)) {
    if (/^\d/.test(name)) return '숫자로 시작할 수 없습니다 — 앞에 뜻을 붙여 짓습니다'
    return '이름 규칙(소문자·숫자·하이픈)에 맞지 않습니다'
  }
  const segments = name.split('-')
  if (segments.length > contract.naming.maxSegments) {
    return `이름이 너무 깁니다 (${segments.length}마디 — ${contract.naming.maxSegments}마디까지)`
  }
  const bad = segments.filter((s) => contract.naming.forbiddenWords.includes(s))
  if (bad.length > 0) return `쓸 수 없는 단어가 있습니다: ${bad.join(', ')}`
  return null
}

/** 구글 이름(snake_case)을 우리 기본 이름(kebab-case)으로. 규칙에 어긋나면 issue를 함께 준다. */
function ourNameFor(material, contract) {
  const name = String(material).replace(/_/g, '-')
  return { name, issue: nameIssue(name, contract) }
}

/**
 * 규칙에 어긋나는 구글 이름에 대한 제안. 사람이 고칠 출발점이지 확정이 아니다.
 *   금지 단어는 뺀다          open_in_new → open-in
 *   숫자로 시작하면 num- 을   4k → num-4k
 *   너무 길면 앞마디만 남긴다
 * 그래도 규칙을 못 지키면 null.
 */
function suggestName(material, contract) {
  const forbidden = new Set(contract.naming.forbiddenWords)
  let segs = String(material).split('_').filter((s) => s && !forbidden.has(s))
  if (segs.length === 0) return null
  if (/^\d/.test(segs[0])) segs = ['num', ...segs]
  segs = segs.slice(0, contract.naming.maxSegments)
  const name = segs.join('-')
  return nameIssue(name, contract) ? null : name
}

module.exports = {
  suggestName,
  sourceUrl,
  axisFor,
  sha256,
  fetchText,
  normalize,
  allocateCodepoint,
  nameIssue,
  ourNameFor
}
