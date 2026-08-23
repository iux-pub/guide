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

  // `.icon`(스프라이트용 컴포넌트)은 여기서 만들지 않는다.
  // 그건 손으로 관리하는 컴포넌트라 src/styles/6-components/icon.css에 있다.
  // 이 파일은 **폰트 여벌만** 담당한다 — 코드포인트가 대장에서 나오므로 생성물이어야 한다.
  // 폰트 파일과 같은 폴더에 두어 상대 url이 그대로 유효하다.
  const css = `/**
 * infoUX Icons — 폰트 여벌. **생성물이므로 직접 고치지 않는다.**
 * 다시 만들기: npm run icons:build
 *
 * 기본 경로는 스프라이트이고 이 파일은 SVG를 못 받는 환경(일부 CMS 에디터·앱
 * 웹뷰)을 위한 여벌이다. 폰트는 로드 실패 시 자리가 두부로 남고, 사용자가 폰트를
 * 강제 치환하면 사라지며, 스크린리더가 PUA 코드포인트를 오독한다.
 * 그래서 반드시 aria-hidden과 텍스트 라벨을 함께 둔다 (R-27).
 *
 *   <button class="btn">
 *     <span class="icon-font icon-font--search" aria-hidden="true"></span>
 *     검색
 *   </button>
 *
 * 스프라이트 방식(권장): src/styles/6-components/icon.css의 .icon을 쓴다.
 */

@layer components {
  @font-face {
    font-family: "infoUX Icons";
    src: url("./infoux-icons.woff2") format("woff2");
    font-weight: normal;
    font-style: normal;
    font-display: block;
  }

  .icon-font {
    @apply inline-block shrink-0 not-italic normal-case align-[-0.125em];

    font-family: "infoUX Icons", sans-serif;
    font-size: 2.4rem;
    line-height: 1;
    font-variant-ligatures: none;
    speak: never;
    -webkit-font-smoothing: antialiased;
  }

  /* KRDS 사이즈 어휘 — .icon과 같은 이름을 쓴다 (R-06·R-18) */
  .icon-font--xsmall { font-size: 1.6rem; }
  .icon-font--small  { font-size: 2rem; }
  .icon-font--medium { font-size: 2.4rem; }
  .icon-font--large  { font-size: 3.2rem; }
  .icon-font--xlarge { font-size: 4rem; }

  /* 본문과 섞일 때 — 글자 크기를 그대로 따른다 */
  .icon-font--inherit { font-size: 1em; }

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

  // 폰트 생성 시각을 고정한다. 기본값은 now()라 빌드할 때마다 파일이 달라지고,
  // CI의 「자동 생성물 drift」 검사가 영원히 실패한다(2026-08-23 실측: 세 번 빌드에
  // 해시 세 개). 대장의 갱신일을 쓰므로 아이콘이 바뀔 때만 폰트도 바뀐다.
  const stamp = Math.floor(new Date(`${ledger.updatedAt || '2026-01-01'}T00:00:00Z`).getTime() / 1000)
  const ttf = Buffer.from(svg2ttf(svgFont, { copyright: 'INFOMIND UX', ts: stamp }).buffer)
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
