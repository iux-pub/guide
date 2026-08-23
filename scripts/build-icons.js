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

/** 기본 + 실제로 파일이 있는 변형. 파일이 없으면 그 변형은 안 만든다. */
function variantList() {
  const combos = contract.variants?.combinations || [{ id: 'regular', default: true }]
  return combos.filter((c) => {
    if (c.default) return true
    return fs.existsSync(path.join(SVG_DIR, c.id))
  })
}

/** 변형의 낱개 SVG 폴더. 기본은 svg/ 그대로 — 기존 경로를 깨지 않는다. */
function variantDir(v) {
  return v.default ? SVG_DIR : path.join(SVG_DIR, v.id)
}

/** 그 변형에 실제 파일이 있는 아이콘만. fill이 없는 아이콘은 기본으로 대체하지 않는다. */
function iconsFor(v, icons) {
  if (v.default) return icons
  const dir = variantDir(v)
  return icons.filter((ic) => fs.existsSync(path.join(dir, `${ic.name}.svg`)))
}

/** 대장 순서 = 코드포인트 순서. 빌드 결과가 매번 같아야 diff가 읽힌다. */
function iconList() {
  return Object.entries(ledger.icons)
    .map(([name, meta]) => ({ name, ...meta }))
    .sort((a, b) => a.codepoint.localeCompare(b.codepoint))
}

function readPaths(name, dir = SVG_DIR) {
  const svg = fs.readFileSync(path.join(dir, `${name}.svg`), 'utf8')
  return [...svg.matchAll(/<path[^>]*\sd="([^"]+)"/g)].map((m) => m[1])
}

// ── 스프라이트 ─────────────────────────────────────────

function buildSprite(icons, v) {
  const dir = variantDir(v)
  const rows = iconsFor(v, icons)
  const symbols = rows
    .map((ic) => {
      const body = readPaths(ic.name, dir).map((d) => `<path d="${d}"/>`).join('')
      return `<symbol id="${ic.name}" viewBox="0 0 ${CANVAS} ${CANVAS}">${body}</symbol>`
    })
    .join('\n')

  // aria-hidden + display:none — 스프라이트 자체가 화면에 잡히면 안 된다
  const sprite =
    `<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="position:absolute;width:0;height:0;overflow:hidden">\n` +
    `${symbols}\n</svg>\n`

  const file = v.default ? 'sprite.svg' : `sprite-${v.id}.svg`
  fs.writeFileSync(path.join(OUT_DIR, file), sprite)
  return { file, size: sprite.length, count: rows.length }
}

// ── CSS ───────────────────────────────────────────────

function buildCss(icons, variants) {
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

${variantCss(icons, variants)}}
`

  fs.writeFileSync(path.join(OUT_DIR, 'icons.css'), css)
  return css.length
}

/**
 * 변형 CSS — 폰트 패밀리를 갈아 끼운다.
 *
 * 코드포인트는 그대로 두고 글리프만 바꾼다. `.icon-font--fill`을 덧붙이면
 * 같은 `.icon-font--search`가 채운 그림으로 그려진다 — 대장이 흔들리지 않는다.
 *
 * 그 변형이 없는 아이콘은 폰트에 글리프가 없어 두부가 된다. 그래서
 * **있는 것만 목록으로 적어** 그 아이콘에만 패밀리를 바꾼다.
 */
function variantCss(icons, variants) {
  const extra = variants.filter((v) => !v.default)
  if (extra.length === 0) return ''

  const blocks = extra.map((v) => {
    const rows = iconsFor(v, icons)
    if (rows.length === 0) return ''
    const sel = rows.map((ic) => `.icon-font--${v.id}.icon-font--${ic.name}`).join(',\n  ')
    return `  /* ${v.id} — ${rows.length}종. ${v.note || ''} */
  @font-face {
    font-family: "infoUX Icons ${v.id}";
    src: url("./infoux-icons-${v.id}.woff2") format("woff2");
    font-weight: normal;
    font-style: normal;
    font-display: block;
  }

  ${sel} {
    font-family: "infoUX Icons ${v.id}", "infoUX Icons", sans-serif;
  }
`
  })

  return blocks.filter(Boolean).join('\n')
}

// ── 폰트 ──────────────────────────────────────────────

async function buildFont(icons, v) {
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

  const rows = iconsFor(v, icons)
  if (rows.length === 0) return null

  const fontStream = new SVGIcons2SVGFontStream({
    fontName: v.default ? 'infoUX Icons' : `infoUX Icons ${v.id}`,
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

    const dir = variantDir(v)
    for (const ic of rows) {
      // 원본 24 좌표계 SVG를 손대지 않고 그대로 넘긴다 (위 주석 참조)
      const glyphSvg = fs.readFileSync(path.join(dir, `${ic.name}.svg`), 'utf8')

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
  const file = v.default ? 'infoux-icons.woff2' : `infoux-icons-${v.id}.woff2`
  fs.writeFileSync(path.join(OUT_DIR, file), woff2)
  return { file, size: woff2.length, count: rows.length }
}

// ── 실행 ───────────────────────────────────────────────

/**
 * 어느 아이콘에 어떤 표정이 있는지를 **대장에 적어 둔다.**
 *
 * 이걸 안 하면 MCP·스튜디오·검수 시트가 저마다 폴더를 뒤져야 하고, 그중 하나만
 * 빠뜨려도 없는 표정을 권하게 된다 — 화면에는 빈 네모가 나온다. 대장이 정본이므로
 * 여기 한 줄만 보면 된다. 파일과 어긋나면 check-icons가 잡는다.
 */
function recordVariants(icons, variants) {
  const extra = variants.filter((v) => !v.default)
  let changed = false

  for (const icon of icons) {
    const has = extra.filter((v) => iconsFor(v, [icon]).length > 0).map((v) => v.id)
    const meta = ledger.icons[icon.name]
    if (!meta) continue
    const before = JSON.stringify(meta.variants || [])
    if (has.length > 0) meta.variants = has
    else delete meta.variants
    if (before !== JSON.stringify(meta.variants || [])) changed = true
  }

  if (changed) fs.writeFileSync(LEDGER, `${JSON.stringify(ledger, null, 2)}\n`)
  return changed
}

async function main() {
  const icons = iconList()
  if (icons.length === 0) {
    console.error('대장이 비어 있다 — npm run icons:import 먼저')
    process.exit(1)
  }

  const variants = variantList()
  fs.mkdirSync(OUT_DIR, { recursive: true })
  console.log(`아이콘 빌드 — ${icons.length}종 · 표정 ${variants.map((v) => v.id).join('·')}\n`)

  for (const v of variants) {
    const sp = buildSprite(icons, v)
    console.log(`  ${sp.file.padEnd(22)} ${(sp.size / 1024).toFixed(1).padStart(5)} KB · ${sp.count}종`)
  }

  const cssSize = buildCss(icons, variants)
  console.log(`  ${'icons.css'.padEnd(22)} ${(cssSize / 1024).toFixed(1).padStart(5)} KB`)

  if (!NO_FONT) {
    for (const v of variants) {
      const f = await buildFont(icons, v)
      if (f) console.log(`  ${f.file.padEnd(22)} ${(f.size / 1024).toFixed(1).padStart(5)} KB · ${f.count}종`)
    }
  }

  console.log(`  ${'svg/'.padEnd(22)} 낱개 ${icons.length}개 (원본 그대로)`)
  for (const v of variants.filter((x) => !x.default)) {
    console.log(`  ${`svg/${v.id}/`.padEnd(22)} 낱개 ${iconsFor(v, icons).length}개`)
  }
  if (recordVariants(icons, variants)) {
    console.log(`  ${'icon-codepoints.json'.padEnd(22)} 표정 목록 갱신`)
  }

  console.log(`\n  코드포인트 ${icons[0].codepoint} ~ ${icons[icons.length - 1].codepoint}`)
}

main().catch((err) => {
  console.error('빌드 실패:', err.message)
  process.exit(1)
})
