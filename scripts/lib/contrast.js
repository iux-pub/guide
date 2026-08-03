/**
 * 색상 대비 계산 공통 모듈 (WCAG 2.1)
 *
 * check-contrast.js가 쓰는 검사쌍과 계산 함수를 한 곳에 둔다.
 * 다른 소비자(프리셋 검사 등)도 같은 검사쌍·같은 계산으로 판정하도록
 * 기준 수치는 여기서만 정의한다.
 */

const TEXT_AA = 4.5
const UI_AA = 3

/**
 * 검사 대상 쌍. [전경, 배경, 최소대비, 설명]
 * 배경 위에 실제로 올라가는 조합만 넣는다 — 쓰이지 않는 조합을 넣으면
 * 통과시키려고 토큰을 왜곡하게 된다.
 */
const PAIRS = [
  ['--color-text', '--color-bg', TEXT_AA, '본문 텍스트'],
  ['--color-text', '--color-surface', TEXT_AA, '카드 위 본문'],
  ['--color-text', '--color-bg-subtler', TEXT_AA, '연한 배경 위 본문'],
  ['--color-text-bolder', '--color-bg', TEXT_AA, '강조 텍스트'],
  ['--color-text-subtle', '--color-bg', TEXT_AA, '보조 텍스트'],
  ['--color-text-inverse', '--color-bg-inverse', TEXT_AA, '반전 배경 위 텍스트'],
  ['--color-text-inverse', '--color-button-primary-fill', TEXT_AA, 'primary 버튼 레이블'],
  ['--color-text-primary', '--color-button-secondary-fill', TEXT_AA, 'secondary 버튼 레이블'],
  ['--color-button-secondary-border', '--color-bg', UI_AA, 'secondary 버튼 테두리'],
  ['--color-text', '--color-input-surface', TEXT_AA, '입력 필드 텍스트'],
  ['--color-link', '--color-bg', TEXT_AA, '링크'],
  ['--color-link-hover', '--color-bg', TEXT_AA, '링크 hover'],
  ['--color-link-visited', '--color-bg', TEXT_AA, '방문한 링크'],
  ['--color-danger-text', '--color-danger-surface', TEXT_AA, '오류 메시지'],
  ['--color-warning-text', '--color-warning-surface', TEXT_AA, '경고 메시지'],
  ['--color-success-text', '--color-success-surface', TEXT_AA, '성공 메시지'],
  ['--color-info-text', '--color-info-surface', TEXT_AA, '정보 메시지'],
  ['--color-danger-text', '--color-bg', TEXT_AA, '흰 배경 위 오류 텍스트'],
  // --color-border는 표 구분선·아코디언 경계 같은 장식이다. WCAG 1.4.11은 장식 경계에
  // 3:1을 요구하지 않으므로 검사 대상이 아니다. 사용자가 조작하는 요소의 경계는
  // --color-border-control을 쓰고, 그쪽을 아래에서 검사한다.
  ['--color-border-control', '--color-bg', UI_AA, '컨트롤 테두리'],
  ['--color-border-control', '--color-surface', UI_AA, '카드 위 컨트롤 테두리'],
  ['--color-input-border', '--color-bg', UI_AA, '입력 필드 테두리'],
  ['--color-input-border-active', '--color-bg', UI_AA, '입력 필드 활성 테두리'],
  ['--color-input-border-error', '--color-bg', UI_AA, '입력 필드 오류 테두리'],
  ['--color-primary', '--color-bg', UI_AA, 'primary 강조 요소']
]

/** tokens.css의 선택자 블록에서 --color-* 선언을 읽는다. */
function parseBlock(css, selector) {
  const start = css.indexOf(`${selector} {`)
  if (start === -1) return null
  const open = css.indexOf('{', start)
  const close = css.indexOf('\n}', open)
  const body = css.slice(open + 1, close)

  const vars = {}
  for (const line of body.split('\n')) {
    const match = line.match(/^\s*(--color-[\w-]+):\s*([^;]+);/)
    if (match) vars[match[1]] = match[2].trim()
  }
  return vars
}

/** #rgb, #rrggbb, #rrggbbaa → {r,g,b,a}. 그 외는 null(검사 제외). */
function parseHex(value) {
  const hex = value.trim()
  if (!hex.startsWith('#')) return null
  const body = hex.slice(1)
  const expand = c => parseInt(c.length === 1 ? c + c : c, 16)

  if (body.length === 3) {
    return { r: expand(body[0]), g: expand(body[1]), b: expand(body[2]), a: 1 }
  }
  if (body.length === 6 || body.length === 8) {
    return {
      r: parseInt(body.slice(0, 2), 16),
      g: parseInt(body.slice(2, 4), 16),
      b: parseInt(body.slice(4, 6), 16),
      a: body.length === 8 ? parseInt(body.slice(6, 8), 16) / 255 : 1
    }
  }
  return null
}

/** WCAG 상대 휘도 */
function luminance({ r, g, b }) {
  const channel = value => {
    const c = value / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

function contrastRatio(fg, bg) {
  const [lighter, darker] = [luminance(fg), luminance(bg)].sort((a, b) => b - a)
  return (lighter + 0.05) / (darker + 0.05)
}

module.exports = {
  TEXT_AA,
  UI_AA,
  PAIRS,
  parseBlock,
  parseHex,
  luminance,
  contrastRatio
}
