#!/usr/bin/env node
// 아이콘 출력 빌드 — 하나의 원본(assets/icons/svg/)에서 네 벌을 만든다.
//
//   sprite.svg          기본 사용 경로. <use>로 참조하고 currentColor를 상속받는다
//   infoux-icons.woff2  앱·CMS 에디터처럼 SVG를 못 받는 곳을 위한 여벌
//   icons.css           .icon 컴포넌트 + 폰트 클래스
//   svg/                낱개 (이미 원본이 그 자리에 있다 — 그대로 쓴다)
//
// 폰트는 여벌이지 원본이 아니다. 폰트 아이콘은 로드 실패 시 두부로 깨지고,
// 사용자 폰트 강제 치환 환경에서 사라지며, 스크린리더가 PUA 코드포인트를
// 오독한다. 그래서 기본은 스프라이트이고 폰트는 aria-hidden 전제로만 쓴다.
//
// 폰트 좌표계 주의: SVG는 y축이 아래로, 폰트는 위로 간다. svgicons2svgfont가
// 뒤집기를 해 주지만 fontHeight/descent를 맞춰야 아이콘이 baseline에 앉는다.
//
// 사용법:  node scripts/build-icons.js [--no-font]

const fs = require('node:fs')
const path = require('node:path')
const { Readable } = require('node:stream')

const ROOT = path.join(__dirname, '..')
const CONTRACT = path.join(ROOT, 'contracts/icon-contract.json')
const LEDGER = path.join(ROOT, 'contracts/icon-codepoints.json')
const SVG_DIR = path.join(ROOT, 'assets/icons/svg')
const OUT_DIR = path.join(ROOT, 'assets/icons')

const NO_FONT = process.argv.includes('--no-font')

const contract = JSON.parse(fs.readFileSync(CONTRACT, 'utf8'))
const ledger = JSON.parse(fs.readFileSync(LEDGER, 'utf8'))
const CANVAS = contract.canvas.width

/** 대장 순서 = 코드포인트 순서. 빌드 결과가 매번 같아야 diff가 읽힌다. */
function iconList() {
  return Object.entries(ledger.icons)
    .map(([name, meta]) => ({ name, ...meta }))
    .sort((a, b) => a.codepoint.localeCompare(b.codepoint))
}

function readPaths(name) {
  const svg = fs.readFileSync(path.join(SVG_DIR, `${name}.svg`), 'utf8')
  return [...svg.matchAll(/<path[^>]*\sd="([^"]+)"/g)].map((m) => m[1])
}

// ── 스프라이트 ─────────────────────────────────────────

function buildSprite(icons) {
  const symbols = icons
    .map((ic) => {
      const body = readPaths(ic.name).map((d) => `<path d="${d}"/>`).join('')
      return `<symbol id="${ic.name}" viewBox="0 0 ${CANVAS} ${CANVAS}">${body}</symbol>`
    })
    .join('\n')

  // aria-hidden + display:none — 스프라이트 자체가 화면에 잡히면 안 된다
  const sprite =
    `<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="position:absolute;width:0;height:0;overflow:hidden">\n` +
    `${symbols}\n</svg>\n`

  fs.writeFileSync(path.join(OUT_DIR, 'sprite.svg'), sprite)
  return sprite.length
}

// ── CSS ───────────────────────────────────────────────

function buildCss(icons) {
  const classes = icons
    .map((ic) => {
      const cp = ic.codepoint.replace('U+', '\\')
      return `.icon-font--${ic.name}::before { content: "${cp}"; }`
    })
    .join('\n')

  const css = `/**
 * infoUX Icons — 생성물이다. 직접 고치지 않는다.
 * 원본: assets/icons/svg/ · 대장: contracts/icon-codepoints.json
 * 다시 만들기: npm run icons:build
 *
 * 쓰는 법 (기본 — 스프라이트)
 *   장식용:  <svg class="icon" aria-hidden="true"><use href="/assets/icons/sprite.svg#search"></use></svg>
 *   의미있음: <svg class="icon" role="img" aria-label="검색"><use href="/assets/icons/sprite.svg#search"></use></svg>
 *
 * 폰트는 여벌이다. SVG를 못 받는 환경에서만 쓰고, 반드시 aria-hidden과
 * 텍스트 라벨을 함께 둔다 — 폰트가 안 뜨면 아이콘 자리가 두부로 남는다.
 */

@layer components {
  .icon {
    @apply inline-block shrink-0 align-[-0.125em];

    width: 2.4rem;
    height: 2.4rem;
    fill: currentColor;
  }

  /* KRDS 사이즈 어휘를 따른다 — 시각적 이름(--big)은 쓰지 않는다 (R-06·R-18) */
  .icon--xsmall { width: 1.6rem; height: 1.6rem; }
  .icon--small  { width: 2rem;   height: 2rem; }
  .icon--medium { width: 2.4rem; height: 2.4rem; }
  .icon--large  { width: 3.2rem; height: 3.2rem; }
  .icon--xlarge { width: 4rem;   height: 4rem; }

  /* 글자 크기를 따라가는 변형 — 버튼·링크 안에서 쓴다 */
  .icon--inherit { width: 1em; height: 1em; }
}

@layer components {
  @font-face {
    font-family: "infoUX Icons";
    src: url("./infoux-icons.woff2") format("woff2");
    font-weight: normal;
    font-style: normal;
    font-display: block;
  }

  .icon-font {
    @apply inline-block shrink-0 not-italic normal-case;

    font-family: "infoUX Icons", sans-serif;
    font-size: 2.4rem;
    line-height: 1;
    font-variant-ligatures: none;
    speak: never;
    -webkit-font-smoothing: antialiased;
  }

${classes.split('\n').map((l) => `  ${l}`).join('\n')}
}
`

  fs.writeFileSync(path.join(OUT_DIR, 'icons.css'), css)
  return css.length
}

// ── 폰트 ──────────────────────────────────────────────

async function buildFont(icons) {
  let SVGIcons2SVGFontStream
  let svg2ttf
  let ttf2woff2
  try {
    // 16.x는 named export다 (기본 export가 아니다)
    ;({ SVGIcons2SVGFontStream } = require('svgicons2svgfont'))
    svg2ttf = require('svg2ttf')
    // 8.x는 ESM interop이라 default 아래에 있다
    ttf2woff2 = require('ttf2woff2').default ?? require('ttf2woff2')
  } catch {
    console.log('  폰트 건너뜀 — svgicons2svgfont·svg2ttf·ttf2woff2가 없다')
    return null
  }

  // 좌표 변환은 **라이브러리에 맡긴다.** SVG는 y축이 아래로, 폰트는 위로 가는데
  // svgicons2svgfont가 그 뒤집기를 이미 한다. 여기서 미리 뒤집으면 이중 반전이
  // 되어 위아래가 뒤집힌 글리프가 나온다 — 2026-08-23 실측: 좌우대칭인 것
  // (chevron·menu·add)만 멀쩡하고 돋보기·자물쇠·사람이 전부 거꾸로 찍혔다.
  // 원본 SVG를 그대로 넘기는 것이 맞다.
  const UNITS = 1000

  const fontStream = new SVGIcons2SVGFontStream({
    fontName: 'infoUX Icons',
    fontHeight: UNITS,
    descent: 0,
    normalize: true,
    centerHorizontally: true,
    log: () => {}
  })

  const svgFont = await new Promise((resolve, reject) => {
    // 이 스트림은 문자열 청크를 내보낸다 (Buffer가 아니다)
    let acc = ''
    fontStream.on('data', (c) => { acc += c })
    fontStream.on('end', () => resolve(acc))
    fontStream.on('error', reject)

    for (const ic of icons) {
      // 원본 24 좌표계 SVG를 손대지 않고 그대로 넘긴다 (위 주석 참조)
      const glyphSvg = fs.readFileSync(path.join(SVG_DIR, `${ic.name}.svg`), 'utf8')

      const stream = Readable.from([glyphSvg])
      stream.metadata = {
        unicode: [String.fromCodePoint(parseInt(ic.codepoint.replace('U+', ''), 16))],
        name: ic.name
      }
      fontStream.write(stream)
    }
    fontStream.end()
  })

  const ttf = Buffer.from(svg2ttf(svgFont, { copyright: 'INFOMIND UX' }).buffer)
  const woff2 = ttf2woff2(ttf)
  fs.writeFileSync(path.join(OUT_DIR, 'infoux-icons.woff2'), woff2)
  return woff2.length
}

// ── 실행 ───────────────────────────────────────────────

async function main() {
  const icons = iconList()
  if (icons.length === 0) {
    console.error('대장이 비어 있다 — npm run icons:import 먼저')
    process.exit(1)
  }

  fs.mkdirSync(OUT_DIR, { recursive: true })
  console.log(`아이콘 빌드 — ${icons.length}종\n`)

  const spriteSize = buildSprite(icons)
  console.log(`  sprite.svg        ${(spriteSize / 1024).toFixed(1)} KB`)

  const cssSize = buildCss(icons)
  console.log(`  icons.css         ${(cssSize / 1024).toFixed(1)} KB`)

  if (!NO_FONT) {
    const fontSize = await buildFont(icons)
    if (fontSize !== null) {
      console.log(`  infoux-icons.woff2 ${(fontSize / 1024).toFixed(1)} KB`)
    }
  }

  console.log(`  svg/              낱개 ${icons.length}개 (원본 그대로)`)
  console.log(`\n  코드포인트 ${icons[0].codepoint} ~ ${icons[icons.length - 1].codepoint}`)
}

main().catch((err) => {
  console.error('빌드 실패:', err.message)
  process.exit(1)
})
