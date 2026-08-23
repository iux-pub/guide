#!/usr/bin/env node
// 아이콘 검수 시트 — 세트 전체를 실제 사용 크기로 나란히 깔아 눈으로 보게 한다.
//
// 좌표 검사는 규격 위반을 잡지만 "그림이 맞는지"는 못 잡는다. 실제로 2026-08-23
// 반입 때 좌표는 캔버스 안에 있으면서 아이콘 14종이 통째로 뒤집혀 있었다
// (첫 moveto가 소문자였던 경우). 그래서 반입·생성 후에는 반드시 이 시트를 본다.
//
// 24·20·16을 함께 두는 이유: 화면에서는 대부분 작게 쓰인다. 24만 보면 뭉개짐을 놓친다.
//
// 사용법:  node scripts/build-icon-sheet.js  →  dist/icon-sheet.html

const fs = require('node:fs')
const path = require('node:path')

const ROOT = path.join(__dirname, '..')
const SEED_MAP = path.join(ROOT, 'contracts/icon-seed-map.json')
const LEDGER = path.join(ROOT, 'contracts/icon-codepoints.json')
const SVG_DIR = path.join(ROOT, 'assets/icons/svg')
// dist에 낸다. 문서 사이트에는 eleventy.config.js가 /icons/ 로 복사한다 —
// site/ 아래에 두면 .gitignore된 생성물을 Eleventy가 무시해 페이지가 안 생긴다.
// 스프라이트가 아니라 SVG를 그대로 심는다: 사이트 경로와 자산 경로가 달라
// <use> 외부 참조가 깨지기 쉽다.
const OUT = path.join(ROOT, 'dist/icon-sheet.html')

const seed = JSON.parse(fs.readFileSync(SEED_MAP, 'utf8'))
const ledger = JSON.parse(fs.readFileSync(LEDGER, 'utf8'))

/** 대장 순서를 카테고리별로 묶는다. 씨앗 맵에 없는 자체 제작분은 뒤에 따로 모은다. */
function grouped() {
  const seen = new Set()
  const groups = seed.categories.map((c) => {
    const icons = c.icons.map((i) => i.name).filter((n) => ledger.icons[n])
    icons.forEach((n) => seen.add(n))
    return { label: c.label, icons }
  })
  const rest = Object.keys(ledger.icons).filter((n) => !seen.has(n))
  if (rest.length > 0) groups.push({ label: '자체 제작', icons: rest })
  return groups
}

function readSvg(name) {
  const p = path.join(SVG_DIR, `${name}.svg`)
  if (!fs.existsSync(p)) return null
  return fs.readFileSync(p, 'utf8').trim()
}

/** width/height만 바꿔 같은 아이콘을 여러 크기로 찍는다. */
function sized(svg, size) {
  return svg.replace(/width="\d+" height="\d+"/, `width="${size}" height="${size}"`)
}

function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
}

const CSS = `
:root {
  --bg: #FAFAF8; --fg: #191A1D; --mut: #6E7278; --line: #E4E3DE; --key: #B93E67;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --bg: #131416; --fg: #E9E9E5; --mut: #9DA1A3; --line: #2E3134; --key: #E2769B;
  }
}
* { box-sizing: border-box; }
body {
  margin: 0; padding: 32px 28px 80px;
  background: var(--bg); color: var(--fg);
  font: 14px/1.7 -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif;
  word-break: keep-all;
}
h1 { font-size: 21px; margin: 0 0 6px; }
.lead { color: var(--mut); margin: 0 0 4px; max-width: 62ch; }
h2 {
  font-size: 12px; letter-spacing: .06em; text-transform: uppercase;
  color: var(--mut); font-weight: 600; margin: 36px 0 12px;
}
.grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1px; background: var(--line); border: 1px solid var(--line);
}
.cell {
  background: var(--bg); padding: 15px 8px 12px;
  display: flex; flex-direction: column; align-items: center; gap: 10px;
}
.row { display: flex; align-items: flex-end; gap: 11px; height: 50px; }
.row svg { color: var(--fg); display: block; }
.frame { outline: 1px dashed color-mix(in srgb, var(--key) 42%, transparent); }
.name {
  font: 11px/1.35 ui-monospace, SFMono-Regular, Menlo, monospace;
  color: var(--mut); text-align: center; word-break: break-all;
}
.cp { display: block; font-size: 9px; opacity: .6; margin-top: 2px; }
.miss { color: var(--key); font-size: 11px; }
`

const groups = grouped()
const total = Object.keys(ledger.icons).length

let html = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>infoUX 아이콘 검수 시트</title>
<style>${CSS}</style>
</head>
<body>
<h1>infoUX 아이콘 ${total}종</h1>
<p class="lead">왼쪽부터 48 · 24 · 20 · 16px. 큰 것은 형태를, 작은 것은 뭉개짐을 본다 — 작은 크기만 보면 테두리와 내부 요소가 뭉쳐 「꽉 찬 덩어리」로 잘못 읽힌다. 점선은 24 캔버스 경계다.</p>
<p class="lead">볼 것 — 획 굵기가 다른 것들과 같은가, 여백이 고른가, 16px에서 뭉개지지 않는가.</p>
`

for (const g of groups) {
  html += `<h2>${esc(g.label)} · ${g.icons.length}</h2><div class="grid">`
  for (const name of g.icons) {
    const svg = readSvg(name)
    const meta = ledger.icons[name]
    html += '<div class="cell">'
    if (svg) {
      html += `<div class="row">${sized(svg, 48)}<span class="frame">${sized(svg, 24)}</span>${sized(svg, 20)}${sized(svg, 16)}</div>`
    } else {
      html += '<div class="row"><span class="miss">파일 없음</span></div>'
    }
    html += `<div class="name">${esc(name)}<span class="cp">${esc(meta.codepoint)}</span></div></div>`
  }
  html += '</div>'
}

html += '\n</body>\n</html>\n'

fs.mkdirSync(path.dirname(OUT), { recursive: true })
fs.writeFileSync(OUT, html)

console.log(`검수 시트 생성: ${path.relative(ROOT, OUT)} (${total}종) → 사이트 /icons/`)
