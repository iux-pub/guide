#!/usr/bin/env node
/* global document, window, Image, getComputedStyle, NodeFilter */
/**
 * 렌더 캡처 도구 — 렌더 비평(design-intelligence §8-1)과 견본 캡처에 쓴다
 *
 * 단일 원본: 이 파일. 생성 대상: 없음(캡처 파일은 인자로 받은 경로에 쓴다).
 * 스타터로 함께 간다(scripts/sync-starter.js STARTER_SCRIPTS) — 프로젝트가 자기 화면을 찍는다.
 *
 * 하위 명령
 *   shots  <url|파일> <출력 앞머리> [--width 1440] [--height 900] [--slice 1800] [--max 6] [--wait 3500] [--soft]
 *          전체 페이지를 구간(slice)으로 나눠 찍는다 → <앞머리>-01.jpg, -02.jpg …
 *          그래픽 가속(GPU)을 켜고, 끝까지 한 번 훑어 지연 로딩·진입 효과를 깨운 뒤 맨 위로 돌아가 --wait만큼 기다린다.
 *          WebGL·캔버스·들어오기 연출이 있는 화면을 소프트웨어 렌더로 찍으면 장면이 비거나 깨진다 —
 *          그 캡처로 판정을 받으면 화면이 실제보다 나쁘게 보인다(design-intelligence §8-1).
 *          찍은 뒤 가로 넘침(scrollWidth·clientWidth)을 한 줄로 알린다(§8-2).
 *   scroll <url|파일> <출력 앞머리> [--width 1440] [--height 900] [--frames 5] [--wait 1400] [--soft]
 *          스크롤 연출 사이트를 화면(뷰포트) 단위로 내려가며 찍는다 → <앞머리>-01.jpg …
 *          스크롤 위치에 따라 장면이 바뀌는 사이트(갤러리 선정작 등)는 전체 페이지 한 장으로 찍으면 연출이 펼쳐지지 않는다.
 *          고정 위치의 팝업·레이어는 숨기고 찍는다.
 *   gate   <url|파일> [--wait 2500] [--sketch]
 *          --sketch: 방향 스케치(§3-2, 첫 화면 + 섹션 하나)용 — 페이지 분량 두 줄(넓은 사진 수 · 판 수)을 재지 않는다.
 *          렌더 측정 관문(design-intelligence §8-2). 1440과 360 두 폭에서 값을 읽어 기준과 견주고,
 *          하나라도 어긋나면 종료 코드 1로 끝난다. 글로만 있던 구성 규칙을 계산으로 거른다:
 *          가로 넘침 · 가려져 눌리지 않는 링크·단추(360·1024·1280·1440 첫 화면) · 표제/본문 크기 비율(2.5배) · 보이는 글자 크기 가짓수(5) · 첫 화면 장면(사진·영상·캔버스·SVG 그림 — 1440 폭에서 가장자리에 닿고
 *          높이 480px 이상, 360 첫 화면 안에 장면) · 섹션 바탕색 가짓수(4) · 넓은 면 색 가짓수(5) · 같은 위치 섹션 제목(3) · 섹션 바탕 전환(5번) · 화살표 글리프(0) · 같은 모양 카드 격자(2) · 넓은 사진(3장 이상) · 보이는 검색 입력 수(1) · 360 터치 영역(44px) · 채도 높은 넓은 면(0) · 나란한 단 아랫선 차이(100px) · 면이 있는 판(4개 이상) · 판도 사진도 없는 맨 섹션(1개 이하) · 대표색 면 넓이(본문의 15% 이하) · 글자 덩어리 밀도(1000px당 24개 이하) · 섹션 제목 크기(h2 가운데 값 36px 이상) · 사진 넓이(본문의 35% 이상) · 여백 리듬(섹션 사이 간격·제목→내용 간격이 한 값, 제목 간격은 섹션 간격의 1/3 이하) · 나란한 칸의 제목 윗선(차이 4px 이하) · 윗선이 같은 나란한 판의 아랫선(차이 4px 이하)과 바닥 빈 칸(차이 16px 이하) · 한 줄 UI 글자 줄바꿈(머리글 링크·탭·더보기·단추, 360·1024·1280·1440에서 0) · 늘려 쓴 넓은 사진(1.15배 이하) · 한 칸 안 중복 링크(0) · 사용자 행동 근거(user-behavior §6: 첫 화면 바닥 걸침 · 왼쪽 단 · 한 줄 50자 · 열자마자 레이어 0 · 새 창 안내 · 360 첫 화면 링크 3).
 *   alpha  <입력 폴더> [출력 폴더]
 *          흰 바탕 그림(입체 아이콘·먹 그림 PNG·JPG)을 투명 PNG로 바꾼다(흰색 기준 color-to-alpha).
 *          출력 폴더를 생략하면 <입력 폴더>/alpha/에 쓴다. 긴 변은 1600px로 줄인다.
 *
 * 의존성: puppeteer. 가이드 저장소는 pa11y-ci가 함께 설치한다. 스타터·프로젝트는 npm i -D puppeteer.
 * 사용 예: node scripts/capture.js shots docs/directions/a.html docs/shots/r1-1440
 *          node scripts/capture.js shots http://localhost:8080/ docs/shots/r1-360 --width 360
 *          node scripts/capture.js scroll https://example.org/ docs/shots/ref-x --frames 6
 *          node scripts/capture.js alpha assets/images/icons-src assets/images/icons
 */

const fs = require('node:fs')
const path = require('node:path')
const { pathToFileURL } = require('node:url')

const USAGE = [
  '사용법:',
  '  node scripts/capture.js shots  <url|파일> <출력 앞머리> [--width 1440] [--height 900] [--slice 1800] [--max 6] [--wait 3500] [--soft]',
  '  node scripts/capture.js scroll <url|파일> <출력 앞머리> [--width 1440] [--height 900] [--frames 5] [--wait 1400] [--soft]',
  '  node scripts/capture.js gate   <url|파일> [--wait 2500] [--sketch]',
  '  node scripts/capture.js alpha  <입력 폴더> [출력 폴더]'
].join('\n')

const DEFAULTS = {
  shots: { width: 1440, height: 900, slice: 1800, max: 6, wait: 3500 },
  scroll: { width: 1440, height: 900, frames: 5, wait: 1400 },
  gate: { wait: 2500 },
  alpha: {}
}

/** 관문 기준 — design-intelligence §5·§8-2. 값을 바꾸면 문서도 같이 고친다 */
const GATE = { headingRatio: 2.5, fontSizes: 5, heroHeight: 480, edge: 2, backgrounds: 4, surfaces: 5, searchInputs: 1, touch: 44, headingRepeat: 3, cardGrids: 2, photos: 3, transitions: 5, glyphs: 0, lineChars: 50, emptyLeft: 0, overlays: 0, blankLinks: 0, foldLinks: 3, loudSurfaces: 0, columnGap: 100, panels: 4, bareSections: 1, brandArea: 15, textDensity: 24, sectionHeading: 36, photoArea: 35, gapSpread: 8, rowAlign: 4, upscale: 1.15, panelAlign: 4, panelFill: 16, outside: 0, outsideSlack: 2 }

/**
 * 측정값 → 판정 목록. 순수 함수라 브라우저 없이 시험한다.
 * m = { wide: { overflow, h1, body, fontSizes[], hero: { left, right, width, height } | null, backgrounds[], searchInputs },
 *       narrow: { overflow, heroInFold, smallTargets[] } }
 */
function judgeGate(m, viewport = 1440, { sketch = false } = {}) {
  const out = []
  const add = (name, pass, detail) => out.push({ name, pass, detail })
  add('가로 넘침 없음', !m.wide.overflow && !m.narrow.overflow, `1440 ${m.wide.overflow ? '있음' : '없음'} · 360 ${m.narrow.overflow ? '있음' : '없음'}`)
  const ratio = m.wide.body ? m.wide.h1 / m.wide.body : 0
  add(`표제/본문 ${GATE.headingRatio}배 이상`, ratio >= GATE.headingRatio, `h1 ${m.wide.h1}px ÷ 본문 ${m.wide.body}px = ${ratio.toFixed(2)}`)
  add(`보이는 글자 크기 ${GATE.fontSizes}가지 이하`, m.wide.fontSizes.length <= GATE.fontSizes, m.wide.fontSizes.join(' · '))
  const h = m.wide.hero
  const edge = h && (h.left <= GATE.edge || h.right >= viewport - GATE.edge)
  add(`첫 화면 장면(사진·영상·캔버스·SVG 그림)이 가장자리에 닿고 높이 ${GATE.heroHeight}px 이상(§5-5)`, Boolean(h && edge && h.height >= GATE.heroHeight),
    h ? `가장 큰 장면 x ${h.left}~${h.right} · ${h.width}×${h.height}` : '첫 섹션에 장면 없음')
  add('360 첫 화면 안에 장면(사진·그림, D15)', m.narrow.heroInFold, m.narrow.heroInFold ? '있음' : '첫 화면(780px) 안에 장면 없음')
  // 측정이 없는 옛 측정값은 이 줄을 내지 않는다
  if (m.narrow.darkSlabs) add('360 사진 판 안 사진 없는 짙은 면 400px 미만(§5-5·D12)', m.narrow.darkSlabs.length === 0, m.narrow.darkSlabs.length ? m.narrow.darkSlabs.slice(0, 3).join(' / ') : '없음')
  add(`섹션 바탕색 ${GATE.backgrounds}가지 이하(§5-2)`, m.wide.backgrounds.length <= GATE.backgrounds, m.wide.backgrounds.join(' · '))
  add(`넓은 면 색 ${GATE.surfaces}가지 이하(§5-2·§5-8)`, (m.wide.surfaces || []).length <= GATE.surfaces, (m.wide.surfaces || []).join(' · '))
  const hr = m.wide.headingRepeat || { count: 0, key: '' }
  add(`같은 틀의 섹션 제목 ${GATE.headingRepeat}개 이하(D06)`, hr.count <= GATE.headingRepeat, hr.count ? `가장 많은 틀 ${hr.count}개 — ${hr.key}` : '섹션 제목 없음')
  const grids = m.wide.cardGrids || []
  add(`같은 모양 카드 격자 ${GATE.cardGrids}개 이하(D05)`, grids.length <= GATE.cardGrids, grids.length ? `${grids.length}개 — ${grids.slice(0, 4).join(' / ')}` : '없음')
  // 방향 스케치(§3-2)는 첫 화면과 섹션 하나뿐이라 페이지 분량 항목(넓은 사진 수 · 판 수)을 채울 수 없다 — 재지 않는다
  if (!sketch) add(`넓은 사진 ${GATE.photos}장 이상(§5-5)`, (m.wide.photos ?? GATE.photos) >= GATE.photos, `${m.wide.photos ?? '측정 안 함'}장 — 폭 300px·높이 200px 이상`)
  add(`섹션 바탕 전환 ${GATE.transitions}번 이하(§5-2·D04)`, (m.wide.transitions ?? 0) <= GATE.transitions, `${m.wide.transitions ?? '측정 안 함'}번`)
  const gl = m.wide.glyphs || []
  add('링크·버튼 글자에 → › » 글리프 없음(§7-2)', gl.length <= GATE.glyphs, gl.length ? `${gl.length}곳 — ${gl.slice(0, 3).join(' / ')}` : '없음')
  const peekW = m.wide.peek ?? true; const peekN = m.narrow.peek ?? true
  // 1920×1080 — 전체 폭 장면을 비율대로 키우면 넓은 화면에서 장면이 화면보다 커져 다음 섹션이 사라진다(측정이 없는 옛 측정값은 넣지 않는다)
  const peekX = m.wide.peekXL
  add('첫 화면 바닥에 다음 섹션이 걸쳐 보임(user-behavior 3-6)', peekW && peekN && peekX !== false,
    `1440×900 ${peekW ? '보임' : '안 보임'} · 360×780 ${peekN ? '보임' : '안 보임'}${peekX === undefined ? '' : ` · 1920×1080 ${peekX ? '보임' : '안 보임'}`}`)
  const el = m.wide.emptyLeft || []
  add(`왼쪽 단을 비운 섹션 ${GATE.emptyLeft}개(user-behavior 1-2)`, el.length <= GATE.emptyLeft, el.length ? `${el.length}개 — ${el.slice(0, 3).join(' / ')}` : '없음')
  const cg = m.wide.columnGaps || []
  add(`나란한 단 아랫선 차이 ${GATE.columnGap}px 이하(§5-3·D11)`, cg.length === 0, cg.length ? `${cg.length}개 — ${cg.slice(0, 3).join(' / ')}` : '없음')
  if (m.wide.panels) {
    if (!sketch) add(`면이 있는 판 ${GATE.panels}개 이상(§3-5 4)`, m.wide.panels.length >= GATE.panels, `${m.wide.panels.length}개${m.wide.panels.length ? ' — ' + m.wide.panels.slice(0, 4).join(' / ') : ''}`)
    const bs = m.wide.bareSections || []
    add(`판도 사진도 없는 맨 섹션 ${GATE.bareSections}개 이하(§3-5 4)`, bs.length <= GATE.bareSections, bs.length ? `${bs.length}개 — ${bs.join(' / ')}` : '없음')
  }
  const lc = m.wide.longLines || []
  add(`본문 한 줄 ${GATE.lineChars}자 이하(user-behavior 4-1)`, lc.length === 0, lc.length ? `${lc.length}개 — ${lc.slice(0, 3).join(' / ')}` : '넘는 단락 없음')
  add(`열자마자 뜨는 레이어 ${GATE.overlays}개(user-behavior 5-3)`, (m.wide.overlays ?? 0) <= GATE.overlays, `${m.wide.overlays ?? 0}개`)
  const bl = m.wide.blankLinks || []
  add('새 창 링크에 「새 창」 안내(user-behavior 3-2)', bl.length <= GATE.blankLinks, bl.length ? `안내 없음 ${bl.length}개 — ${bl.slice(0, 3).join(' / ')}` : '빠진 곳 없음')
  add(`360 첫 화면 안 본문 링크 ${GATE.foldLinks}개 이상(user-behavior 3-3)`, (m.narrow.foldLinks ?? GATE.foldLinks) >= GATE.foldLinks, `${m.narrow.foldLinks ?? '측정 안 함'}개`)
  if (m.wide.brandArea) {
    const ba = m.wide.brandArea
    add(`대표색 면 넓이 본문의 ${GATE.brandArea}% 이하(§5-2)`, ba.pct <= GATE.brandArea, `${ba.pct}%${ba.list.length ? ' — ' + ba.list.join(' / ') : ''}`)
  }
  if (m.wide.textDensity) {
    const td = m.wide.textDensity
    add(`글자 덩어리 높이 1000px당 ${GATE.textDensity}개 이하(§5-4)`, td.per1000 <= GATE.textDensity, `${td.per1000}개 — ${td.count}개 ÷ 본문 ${td.height}px`)
  }
  if (m.wide.sectionHeading !== undefined) {
    const sh = m.wide.sectionHeading
    add(`섹션 제목(h2) 가운데 값 ${GATE.sectionHeading}px 이상(§5-1)`, Boolean(sh && sh.median >= GATE.sectionHeading), sh ? `${sh.median}px — ${sh.sizes.join('·')}px` : 'h2 없음')
  }
  if (m.wide.photoArea) {
    const pa = m.wide.photoArea
    add(`사진 넓이 본문의 ${GATE.photoArea}% 이상(§5-5)`, pa.pct >= GATE.photoArea, `${pa.pct}% — 사진 ${pa.count}장`)
  }
  if (m.wide.spacing) {
    const sg = m.wide.spacing.sectionGaps || []; const tg = m.wide.spacing.titleGaps || []
    const spread = arr => arr.length ? Math.max(...arr.map(x => x.gap)) - Math.min(...arr.map(x => x.gap)) : 0
    const list = arr => arr.map(x => `${x.label} ${x.gap}`).join(' / ')
    add(`섹션 사이 간격 한 값(차이 ${GATE.gapSpread}px 이하, §5-4)`, spread(sg) <= GATE.gapSpread, sg.length ? `차이 ${spread(sg)}px — ${list(sg)}` : '이웃 섹션 없음')
    const base = sg.length ? Math.min(...sg.map(x => x.gap)) : 0
    const tooFar = tg.filter(x => base && x.gap > Math.round(base / 3) + GATE.gapSpread)
    add(`제목→내용 간격 한 값이고 섹션 간격의 1/3 이하(§5-4)`, spread(tg) <= GATE.gapSpread && tooFar.length === 0, tg.length ? `차이 ${spread(tg)}px — ${list(tg)}${tooFar.length ? ` · 1/3(${Math.round(base / 3)}px) 넘음 ${tooFar.length}곳` : ''}` : '섹션 제목 없음')
  }
  if (m.wide.dupLinks) {
    const dl = m.wide.dupLinks
    add('한 칸 안에 같은 주소 링크 하나(§3-5)', dl.length === 0, dl.length ? `${dl.length}곳 — ${dl.slice(0, 4).join(' / ')}` : '없음')
  }
  if (m.wide.upscaled) {
    const up = m.wide.upscaled
    add(`넓은 사진을 ${GATE.upscale}배 넘게 늘려 쓰지 않음(§5-5)`, up.length === 0, up.length ? `${up.length}장 — ${up.slice(0, 3).join(' / ')}` : '없음')
  }
  if (m.wide.covered) {
    const cv = m.wide.covered
    add('첫 화면에서 가려져 눌리지 않는 링크 · 단추 0(360 · 1024 · 1280 · 1440, R-13 · R-33)', cv.length === 0, cv.length ? `${cv.length}곳 — ${cv.slice(0, 4).join(' / ')}` : '없음')
  }
  if (m.wide.rowMisaligned) {
    const rm = m.wide.rowMisaligned
    add(`나란한 칸의 제목 윗선 차이 ${GATE.rowAlign}px 이하(§5-3)`, rm.length === 0, rm.length ? `${rm.length}곳 — ${rm.slice(0, 3).join(' / ')}` : '어긋난 곳 없음')
  }
  if (m.wide.panelBottoms) {
    const pb = m.wide.panelBottoms
    add(`윗선이 같은 나란한 판의 아랫선 차이 ${GATE.panelAlign}px · 바닥 빈 칸 차이 ${GATE.panelFill}px 이하(§5-3 · §5-8)`, pb.length === 0, pb.length ? `${pb.length}곳 — ${pb.slice(0, 3).join(' / ')}` : '어긋난 곳 없음')
  }
  if (m.wide.wrapped) {
    const wr = m.wide.wrapped
    add('한 줄 UI 글자 줄바꿈 0 — 머리글 링크 · 탭 · 더보기 · 단추(360 · 1024 · 1280 · 1440, §5-8)', wr.length === 0, wr.length ? `${wr.length}곳 — ${wr.slice(0, 4).join(' / ')}` : '없음')
  }
  if (m.wide.outside) {
    const ot = m.wide.outside
    add(`본문 선 밖 글자 ${GATE.outside}곳(360 · 1024 · 1280 · 1440 · 1920, §5-3 · D11)`, ot.length <= GATE.outside, ot.length ? `${ot.length}곳 — ${ot.slice(0, 4).join(' / ')}` : '없음')
  }
  const ls = m.wide.loudSurfaces || []
  add(`채도 높은 넓은 면 ${GATE.loudSurfaces}개(§5-2)`, ls.length <= GATE.loudSurfaces, ls.length ? `${ls.length}개 — ${ls.slice(0, 3).join(' / ')}` : '없음')
  add(`보이는 검색 입력 ${GATE.searchInputs}개 이하`, m.wide.searchInputs <= GATE.searchInputs, `${m.wide.searchInputs}개`)
  add(`360 터치 영역 ${GATE.touch}px 이상(R-13)`, m.narrow.smallTargets.length === 0,
    m.narrow.smallTargets.length ? `${m.narrow.smallTargets.length}개 — ${m.narrow.smallTargets.slice(0, 5).join(' / ')}` : '미달 없음')
  return out
}

/** 인자를 읽는다 → { command, positional, options }. 모르는 옵션·숫자 아닌 값은 던진다 */
function parseArgs(argv) {
  const [command, ...rest] = argv
  if (!Object.hasOwn(DEFAULTS, command)) throw new Error(`하위 명령은 shots·scroll·alpha·gate 중 하나다(받은 값: ${command ?? '없음'})`)
  const options = { ...DEFAULTS[command], soft: false }
  const positional = []
  for (let i = 0; i < rest.length; i += 1) {
    const arg = rest[i]
    if (!arg.startsWith('--')) { positional.push(arg); continue }
    const key = arg.slice(2)
    if (key === 'soft' && command !== 'alpha') { options.soft = true; continue }
    if (key === 'sketch' && command === 'gate') { options.sketch = true; continue }
    if (!Object.hasOwn(DEFAULTS[command], key)) throw new Error(`${command}에 없는 옵션: ${arg}`)
    const value = Number(rest[i + 1])
    if (!Number.isFinite(value) || value <= 0) throw new Error(`${arg} 뒤에는 양수가 온다`)
    options[key] = value
    i += 1
  }
  const need = command === 'alpha' || command === 'gate' ? 1 : 2
  if (positional.length < need) throw new Error(`${command}에 필요한 인자가 모자란다`)
  return { command, positional, options }
}

/** http(s)·file 주소는 그대로, 그 밖은 파일 경로로 보고 file:// 주소로 바꾼다 */
function toUrl(target, cwd = process.cwd()) {
  if (/^(?:https?|file):\/\//i.test(target)) return target
  return pathToFileURL(path.resolve(cwd, target)).href
}

/** 브라우저 실행 인자 — 그래픽 가속을 켠다. soft면 가속 없이(비교용) */
function launchArgs({ soft = false, platform = process.platform } = {}) {
  // file:// 페이지의 외부 스프라이트(<use href="assets/icons/sprite.svg#…">)가 그려지게 한다
  const args = ['--no-sandbox', '--allow-file-access-from-files']
  if (soft) return args
  const angle = platform === 'win32' ? 'd3d11' : platform === 'darwin' ? 'metal' : 'gl'
  return [...args, `--use-angle=${angle}`, '--enable-gpu', '--ignore-gpu-blocklist', '--enable-webgl']
}

/**
 * 흰 바탕을 알파로 바꾼다(RGBA 바이트 배열을 제자리에서 고친다).
 * 픽셀마다 흰색에서 가장 멀리 떨어진 채널로 불투명도를 정하고, 흰색을 걷어 낸 색으로 되돌린다.
 * 불투명도 4% 미만은 완전히 투명하게 둔다(종이 결·압축 잡음).
 * 브라우저 안에서도 같은 식을 쓴다 — 이 함수를 문자열로 넘긴다.
 */
function whiteToAlpha(data) {
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const alpha = Math.max(255 - r, 255 - g, 255 - b) / 255
    if (alpha < 0.04) { data[i + 3] = 0; continue }
    data[i] = Math.round((r - 255 * (1 - alpha)) / alpha)
    data[i + 1] = Math.round((g - 255 * (1 - alpha)) / alpha)
    data[i + 2] = Math.round((b - 255 * (1 - alpha)) / alpha)
    data[i + 3] = Math.round(alpha * 255)
  }
  return data
}

const pad = n => String(n).padStart(2, '0')
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

function loadPuppeteer() {
  try {
    return require('puppeteer')
  } catch (error) {
    if (error.code !== 'MODULE_NOT_FOUND') throw error
    throw new Error('puppeteer가 없다 — npm i -D puppeteer로 설치한다(가이드 저장소는 pa11y-ci가 함께 설치한다).', { cause: error })
  }
}

async function withBrowser(options, work) {
  const puppeteer = loadPuppeteer()
  const browser = await puppeteer.launch({ headless: true, args: launchArgs(options) })
  try {
    return await work(browser)
  } finally {
    await browser.close()
  }
}

function ensureDir(prefix) {
  fs.mkdirSync(path.dirname(path.resolve(prefix)), { recursive: true })
}

async function shots([target, prefix], options) {
  ensureDir(prefix)
  return withBrowser(options, async browser => {
    const page = await browser.newPage()
    await page.setViewport({ width: options.width, height: options.height, deviceScaleFactor: 1 })
    await page.goto(toUrl(target), { waitUntil: 'load', timeout: 60000 })
    // 지연 로딩·스크롤 진입 효과를 깨우려고 끝까지 한 번 훑고 맨 위로 돌아온다
    await page.evaluate(async () => {
      for (let y = 0; y < document.documentElement.scrollHeight; y += 600) {
        window.scrollTo(0, y)
        await new Promise(resolve => setTimeout(resolve, 120))
      }
      window.scrollTo(0, 0)
    })
    await sleep(options.wait)
    const size = await page.evaluate(() => ({
      total: document.documentElement.scrollHeight,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth
    }))
    const count = Math.min(Math.ceil(size.total / options.slice), options.max)
    const files = []
    for (let i = 0; i < count; i += 1) {
      const y = i * options.slice
      const file = `${prefix}-${pad(i + 1)}.jpg`
      await page.screenshot({
        path: file,
        type: 'jpeg',
        quality: 72,
        clip: { x: 0, y, width: options.width, height: Math.min(options.slice, size.total - y) },
        captureBeyondViewport: true
      })
      files.push(file)
    }
    const overflow = size.scrollWidth > size.clientWidth
    console.log(`페이지 높이 ${size.total}px — ${count}장: ${files.join(', ')}`)
    console.log(`가로 넘침 ${overflow ? '있음' : '없음'} — scrollWidth ${size.scrollWidth} · clientWidth ${size.clientWidth}`)
    if (size.total > options.slice * options.max) console.log(`페이지가 ${options.max}장보다 길다 — 아래쪽은 찍지 않았다(--max로 늘린다)`)
    return { files, ...size, overflow }
  })
}

async function scroll([target, prefix], options) {
  ensureDir(prefix)
  return withBrowser(options, async browser => {
    const page = await browser.newPage()
    await page.setViewport({ width: options.width, height: options.height, deviceScaleFactor: 1 })
    await page.goto(toUrl(target), { waitUntil: 'load', timeout: 60000 })
    await sleep(2500)
    // 고정 위치의 팝업·레이어를 숨긴다 — 첫 화면을 가리는 공지 팝업
    await page.evaluate(() => {
      document.querySelectorAll('[class*="popup"],[id*="popup"],[class*="layer_pop"],[class*="modal"]').forEach(el => {
        const position = window.getComputedStyle(el).position
        if (position === 'fixed' || position === 'absolute') el.style.display = 'none'
      })
    })
    const total = await page.evaluate(() => document.documentElement.scrollHeight)
    const count = Math.min(options.frames, Math.ceil(total / options.height))
    const files = []
    for (let i = 0; i < count; i += 1) {
      await page.evaluate(y => window.scrollTo(0, y), i * options.height)
      await sleep(options.wait)
      const file = `${prefix}-${pad(i + 1)}.jpg`
      await page.screenshot({ path: file, type: 'jpeg', quality: 70 })
      files.push(file)
    }
    console.log(`페이지 높이 ${total}px — 화면 ${count}장: ${files.join(', ')}`)
    return { files, total }
  })
}

async function alpha([inputDir, outputDir], options) {
  const from = path.resolve(inputDir)
  const to = path.resolve(outputDir || path.join(inputDir, 'alpha'))
  const names = fs.readdirSync(from).filter(name => /\.(?:png|jpe?g)$/i.test(name))
  if (!names.length) throw new Error(`${inputDir}에 PNG·JPG가 없다`)
  fs.mkdirSync(to, { recursive: true })
  return withBrowser({ ...options, soft: true }, async browser => {
    const page = await browser.newPage()
    const files = []
    for (const name of names) {
      const mime = /\.png$/i.test(name) ? 'image/png' : 'image/jpeg'
      const source = `data:${mime};base64,${fs.readFileSync(path.join(from, name)).toString('base64')}`
      const dataUrl = await page.evaluate(async (src, convert) => {
        const toAlpha = new Function(`return (${convert})`)()
        const image = new Image()
        image.src = src
        await image.decode()
        const scale = Math.min(1, 1600 / Math.max(image.naturalWidth, image.naturalHeight))
        const width = Math.round(image.naturalWidth * scale)
        const height = Math.round(image.naturalHeight * scale)
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const context = canvas.getContext('2d')
        context.drawImage(image, 0, 0, width, height)
        const pixels = context.getImageData(0, 0, width, height)
        toAlpha(pixels.data)
        context.putImageData(pixels, 0, 0)
        return canvas.toDataURL('image/png')
      }, source, whiteToAlpha.toString())
      const out = path.join(to, name.replace(/\.(?:png|jpe?g)$/i, '.png'))
      fs.writeFileSync(out, Buffer.from(dataUrl.split(',')[1], 'base64'))
      console.log(`${path.relative(process.cwd(), out)} — ${Math.round(fs.statSync(out).size / 1024)}KB`)
      files.push(out)
    }
    return { files }
  })
}

/* 브라우저 안에서 읽는 값 — 보이는 요소만 센다(.sr-only·hidden·크기 0 제외) */
function measureWide() {
  const visible = el => {
    const r = el.getBoundingClientRect()
    const cs = getComputedStyle(el)
    return r.width > 1 && r.height > 1 && cs.visibility !== 'hidden' && cs.display !== 'none' && cs.clip !== 'rect(0px, 0px, 0px, 0px)' && cs.clipPath !== 'inset(50%)'
  }
  const main = document.querySelector('main') || document.body
  const sizes = new Set()
  const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT)
  while (walker.nextNode()) {
    const t = walker.currentNode
    if (!t.textContent.trim() || !t.parentElement || !visible(t.parentElement)) continue
    sizes.add(parseFloat(getComputedStyle(t.parentElement).fontSize))
  }
  const h1 = document.querySelector('main h1') || document.querySelector('h1')
  const para = [...main.querySelectorAll('p')].find(p => visible(p) && p.textContent.trim().length > 20)
  const first = main.querySelector(':scope > section') || main.firstElementChild
  // 장면 매체는 사진만이 아니다 — 지도·실데이터 그림을 인라인 SVG로 그려도 첫 화면 장면이다(§2-3·§3-1). 아이콘 SVG는 작아 가장 큰 것이 되지 않는다
  const imgs = first ? [...first.querySelectorAll('img, picture, video, canvas, svg')].filter(visible) : []
  const big = imgs.map(el => el.getBoundingClientRect()).sort((a, b) => b.width * b.height - a.width * a.height)[0]
  const bgs = new Set()
  for (const sec of main.querySelectorAll(':scope > section')) {
    const c = getComputedStyle(sec).backgroundColor
    bgs.add(c && c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent' ? c : getComputedStyle(document.body).backgroundColor)
  }
  // 넓은 면 — 폭 240px·높이 120px 이상이고 바탕이 칠해진 요소(섹션·판·상자). 사진은 세지 않는다
  const surfaces = new Set()
  // §5-2 — 채도 높은 색(주황·빨강·노랑·하늘 원색)을 넓은 면에 칠한 곳. 채널 차 0.5 이상이고 밝기 중간 이상
  const loudSurfaces = []
  for (const el of main.querySelectorAll('*')) {
    const c = getComputedStyle(el).backgroundColor
    if (!c || c === 'rgba(0, 0, 0, 0)' || c === 'transparent') continue
    const r = el.getBoundingClientRect()
    if (r.width >= 240 && r.height >= 120 && visible(el)) {
      surfaces.add(c)
      const ch = (c.match(/[\d.]+/g) || []).slice(0, 3).map(Number)
      const hi = Math.max(...ch); const lo = Math.min(...ch)
      if (ch.length === 3 && (hi - lo) / 255 >= 0.5 && (hi + lo) / 510 >= 0.4) loudSurfaces.push(`${c} ${Math.round(r.width)}×${Math.round(r.height)}`)
    }
  }
  // D06 — 섹션 제목(h2)의 틀: 글자 크기 · 섹션 왼쪽 끝에서 떨어진 거리 · 섹션 위에서 떨어진 거리(32px 단위)
  const frames = new Map()
  for (const sec of main.querySelectorAll(':scope > section')) {
    const h2 = [...sec.querySelectorAll('h2')].find(visible)
    if (!h2) continue
    const r = h2.getBoundingClientRect(); const sr = sec.getBoundingClientRect()
    const key = `x${Math.round(r.left)} · 위 ${Math.round((r.top - sr.top) / 32) * 32}px`
    frames.set(key, (frames.get(key) || 0) + 1)
  }
  const topFrame = [...frames].sort((a, b) => b[1] - a[1])[0]
  // D05 — 크기(±4px)·바탕이 같은 형제 상자가 3개 이상 나란한 격자
  const cardGrids = []
  for (const parent of main.querySelectorAll('ul, ol, div')) {
    const kids = [...parent.children].filter(visible)
    if (kids.length < 3) continue
    const box = el => { const r = el.getBoundingClientRect(); return { w: r.width, h: r.height, bg: getComputedStyle(el.firstElementChild || el).backgroundColor, bd: getComputedStyle(el.firstElementChild || el).borderTopWidth } }
    const first = box(kids[0])
    if (first.w < 120 || first.h < 120) continue // 한 줄짜리 목록 항목은 카드가 아니다
    const same = kids.every(k => { const b = box(k); return Math.abs(b.w - first.w) <= 4 && Math.abs(b.h - first.h) <= 4 && b.bg === first.bg && b.bd === first.bd })
    const painted = first.bg !== 'rgba(0, 0, 0, 0)' || first.bd !== '0px'
    if (same && painted && !cardGrids.some(g => parent.contains(g.el) || g.el.contains(parent))) cardGrids.push({ el: parent, label: `${kids.length}칸 ${Math.round(first.w)}×${Math.round(first.h)}` })
  }
  // 넓은 사진 — 폭 300px·높이 200px 이상으로 그려진 사진(로고·아이콘은 이 크기에 들지 않는다)
  const photos = [...main.querySelectorAll('img, picture > img, video')].filter(el => { const r = el.getBoundingClientRect(); return visible(el) && r.width >= 300 && r.height >= 200 }).length
  // D04 — 이웃한 섹션의 바탕이 바뀌는 횟수(머리글·푸터 제외)
  const secBgs = [...main.querySelectorAll(':scope > section')].map(sec => { const c = getComputedStyle(sec).backgroundColor; return c === 'rgba(0, 0, 0, 0)' ? 'body' : c })
  const transitions = secBgs.slice(1).filter((c, i) => c !== secBgs[i]).length
  // §7-2 — 글자로 쓴 화살표(카탈로그 chevron 아이콘 대신). ::after content도 본다
  const glyphs = []
  for (const el of document.querySelectorAll('main a, main button')) {
    if (!visible(el)) continue
    const after = getComputedStyle(el, '::after').content
    const text = el.textContent + (after && after !== 'none' && after !== 'normal' ? after : '')
    if (/[→›»]/.test(text)) glyphs.push(el.textContent.trim().slice(0, 16))
  }
  // user-behavior 3-6 — 둘째 섹션의 글자·사진이 첫 화면 안(바닥에서 24px 위)에 보이는가
  const secs = [...main.querySelectorAll(':scope > section')]
  const vh = window.innerHeight
  const peek = secs.length < 2 || secs.slice(1).some(sec => [...sec.querySelectorAll('h2, h3, p, a, img, li, dt')].some(e => visible(e) && e.getBoundingClientRect().top < vh - 24))
  // user-behavior 1-2 — 섹션의 글자·사진이 화면 왼쪽 40% 밖에서 시작하면 왼쪽 단을 비운 것
  const emptyLeft = []
  for (const sec of secs) {
    const xs = [...sec.querySelectorAll('h1, h2, h3, p, a, img, li, dt, dd, button')].filter(visible).map(e => e.getBoundingClientRect().left)
    if (xs.length && Math.min(...xs) > window.innerWidth * 0.4) emptyLeft.push((sec.querySelector('h1, h2')?.textContent || sec.className).trim().slice(0, 14))
  }
  // §5-3 — 나란한 두 단에서 한쪽 단 아래가 비었다(제목만 선 단, 짧은 대표 글). 사진·면은 세지 않고 글자만 본다. 100은 GATE.columnGap과 같다(브라우저 안이라 상수를 못 읽는다)
  const columnGaps = []
  for (const sec of secs) {
    const items = [...sec.querySelectorAll('h2, h3, p, a, li, dt, dd, strong, time')].filter(visible).map(e => e.getBoundingClientRect()).filter(r => r.height > 0)
    // 왼쪽 단 = 섹션 글자의 맨 왼쪽 선(40px 안)에서 시작해 42% 안에서 끝나는 글자. 오른쪽 단 = 왼쪽 단의 오른쪽 끝보다 오른쪽에서 시작하는 글자
    if (!items.length) continue
    const edge = Math.min(...items.map(r => r.left))
    const left = items.filter(r => r.left < edge + 40 && r.right <= window.innerWidth * 0.42)
    if (!left.length) continue
    const split = Math.max(...left.map(r => r.right))
    // 오른쪽 단은 왼쪽 단이 끝나기 전에 시작한 글자만 센다 — 여러 줄로 된 섹션(보도 → 게시판 → 공모 · 안내)에서 왼쪽 단이 끝난 뒤
    // 새 줄로 시작한 오른쪽 내용까지 세면 나란한 두 단이 아닌데도 「왼쪽 단 아래가 비었다」로 잡혔다(2026-11-23 시안 36회차 오탐)
    const leftBottom = Math.max(...left.map(r => r.bottom))
    const right = items.filter(r => r.left >= split && r.top < leftBottom)
    if (right.length < 3) continue
    const lb = Math.max(...left.map(r => r.bottom)); const rb = Math.max(...right.map(r => r.bottom))
    const top = Math.min(...items.map(r => r.top))
    if (Math.max(rb, lb) - top < 200) continue
    // 양쪽을 다 본다 — 왼쪽 단이 더 길어 오른쪽 단 아래가 빈 경우도 같은 결함이다(2026-11-21 시안 25회차: 열린경영 판의
    // 왼쪽 단(제목 + 수치 묶음)이 오른쪽 링크 단보다 약 130px 길었는데 이 검사가 「오른쪽이 긴 경우」만 재어 통과시켰다. 평가자 둘은 모두 D11로 짚었다)
    const gap = Math.round(rb - lb)
    const name = (sec.querySelector('h1, h2')?.textContent || sec.className).trim().slice(0, 14)
    if (Math.abs(gap) > 100) columnGaps.push(`${name} ${gap > 0 ? '왼쪽' : '오른쪽'} 단 아래 ${Math.abs(gap)}px`)
  }
  // §3-5 4 — 판: 섹션 바탕과 다른 색으로 칠했거나 네 변 테두리를 두른 상자, 또는 그림자로 떠 있는 상자(폭 240px·높이 120px 이상, 사진 제외).
  //   그림자 판은 섹션과 같은 흰 바탕이어도 경계가 보인다(사진 위에 뜬 흰 수치 판 — 2026-11-20 20회차에서 빠뜨리던 것을 더했다).
  //   판 안의 판은 세지 않는다. 맨 섹션 = 흰(본문) 바탕이고 판도 넓은 사진도 없는 섹션 — 선과 글자만으로 짠 구간
  const bodyBg = getComputedStyle(document.body).backgroundColor
  const paint = el => { const c = getComputedStyle(el).backgroundColor; return c && c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent' ? c : '' }
  const panels = []
  const panelBottoms = []
  const bareSections = []
  // main > section이 없는 바깥 사이트(기준 사이트 보정용)는 main의 자식 블록을 섹션으로 본다
  const blocks = secs.length ? secs : [...main.children].filter(el => visible(el) && !/^(HEADER|FOOTER|NAV|SCRIPT)$/.test(el.tagName))
  for (const sec of blocks) {
    const secBg = paint(sec) || bodyBg
    const found = []
    for (const el of sec.querySelectorAll('div, ul, ol, li, article, aside, figure, a, nav, form, dl')) {
      if (!visible(el) || found.some(p => p.contains(el))) continue
      const r = el.getBoundingClientRect()
      if (r.width < 240 || r.height < 120) continue
      const cs = getComputedStyle(el)
      const own = paint(el)
      const boxed = ['Top', 'Right', 'Bottom', 'Left'].every(s => parseFloat(cs[`border${s}Width`]) >= 1)
      const lifted = Boolean(own) && cs.boxShadow && cs.boxShadow !== 'none'
      if ((own && own !== secBg) || boxed || lifted) found.push(el)
    }
    panels.push(...found.map(el => `${(sec.querySelector('h1, h2')?.textContent || sec.className).trim().slice(0, 10)} ${Math.round(el.getBoundingClientRect().width)}×${Math.round(el.getBoundingClientRect().height)}`))
    // §5-3 · §5-8 — 윗선이 같은(4px 안) 나란한 두 판은 ① 아랫선이 같고(4px 안) ② 판 바닥에서 마지막 내용까지의 빈 칸도 비슷하다(16px 안).
    //   4·16은 GATE.panelAlign · GATE.panelFill과 같다(브라우저 안이라 상수를 못 읽는다).
    //   ①의 근거: 2026-11-20 20회차 — 가린 평가자가 「옆 남색 판과 아랫선이 30px 어긋난다」로 짚었다(§3-5 4).
    //   ②의 근거: 2026-11-23 천문연 6회차 — 게시판 판 옆 행사 카드의 사진이 원래 비율대로 늘어 줄 높이를 키웠고, 늘어난 게시판 판 아래에
    //   40px 빈 칸이 생겼다(두 판 아랫선은 같아 ①로는 안 잡힌다). 제작자가 다섯 폭을 직접 보고서야 찾았다. 실측: 정상 33 · 28px, 결함 73 · 28px.
    //   마지막 내용 = 숨기지 않은 글자 줄 상자와 잉크(그림 · 입력 · 바탕 · 테두리 · 그림자가 있는 요소)의 가장 아래
    const inkBottom = el => {
      let bottom = -Infinity
      const take = rr => { if (rr.width > 0 && rr.height > 0) bottom = Math.max(bottom, rr.bottom) }
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        const pe = n.parentElement
        if (!n.textContent.trim() || !pe || pe.closest('.sr-only, [hidden]') || !visible(pe)) continue
        const range = document.createRange()
        range.selectNodeContents(n)
        for (const rr of range.getClientRects()) take(rr)
      }
      for (const d of el.querySelectorAll('*')) {
        if (!visible(d) || d.closest('.sr-only')) continue
        const ds = getComputedStyle(d)
        const ink = /^(img|svg|video|canvas|input|select|textarea|button)$/i.test(d.tagName) || paint(d) ||
          ['Top', 'Right', 'Bottom', 'Left'].some(s => parseFloat(ds[`border${s}Width`]) >= 1 && ds[`border${s}Style`] !== 'none') ||
          (ds.boxShadow && ds.boxShadow !== 'none')
        if (ink) take(d.getBoundingClientRect())
      }
      return bottom
    }
    const rects = found.map(el => el.getBoundingClientRect())
    for (let i = 0; i < rects.length; i += 1) {
      for (let j = i + 1; j < rects.length; j += 1) {
        const a = rects[i]; const b = rects[j]
        const apart = a.right <= b.left + 1 || b.right <= a.left + 1
        if (!apart || Math.abs(a.top - b.top) > 4) continue
        const name = `${(sec.querySelector('h1, h2')?.textContent || sec.className).trim().slice(0, 10)} ${Math.round(a.width)}×${Math.round(a.height)} · ${Math.round(b.width)}×${Math.round(b.height)}`
        const diff = Math.round(Math.abs(a.bottom - b.bottom))
        if (diff > 4) { panelBottoms.push(`${name} 아랫선 ${diff}px`); continue }
        const ia = inkBottom(found[i]); const ib = inkBottom(found[j])
        if (!Number.isFinite(ia) || !Number.isFinite(ib)) continue
        const fa = Math.round(a.bottom - ia); const fb = Math.round(b.bottom - ib)
        if (Math.abs(fa - fb) > 16) panelBottoms.push(`${name} 바닥 빈 칸 ${fa} · ${fb}px`)
      }
    }
    const widePhoto = [...sec.querySelectorAll('img, video')].some(el => { const r = el.getBoundingClientRect(); return visible(el) && r.width >= 300 && r.height >= 200 })
    if (secBg === bodyBg && !found.length && !widePhoto) bareSections.push((sec.querySelector('h1, h2')?.textContent || sec.className).trim().slice(0, 14))
  }
  // §5-2 — 대표색 면 넓이: main 넓이 가운데 채도 있는 단색 바탕(채널 차 12/255 이상, 불투명도 0.5 이상)이 덮은 비율.
  //   가장 바깥 칠한 상자만 센다(그 안의 흰 판도 색 면 구간에 든 것으로 본다). 사진·무채색(흰색·회색·검정 스크림)은 세지 않는다
  const mr = main.getBoundingClientRect()
  const mainArea = Math.max(1, mr.width * mr.height)
  const tints = []
  for (const el of main.querySelectorAll('*')) {
    if (/^(IMG|VIDEO|PICTURE|CANVAS|SVG)$/i.test(el.tagName) || el.closest('svg')) continue
    const ch = (getComputedStyle(el).backgroundColor.match(/[\d.]+/g) || []).map(Number)
    if (ch.length < 3 || (ch[3] ?? 1) < 0.5) continue
    if (Math.max(ch[0], ch[1], ch[2]) - Math.min(ch[0], ch[1], ch[2]) < 12) continue
    if (!visible(el) || tints.some(t => t.el.contains(el))) continue
    const r = el.getBoundingClientRect()
    const w = Math.max(0, Math.min(r.right, mr.right) - Math.max(r.left, mr.left)); const h = Math.max(0, Math.min(r.bottom, mr.bottom) - Math.max(r.top, mr.top))
    if (w * h >= 2000) tints.push({ el, w, h, c: getComputedStyle(el).backgroundColor })
  }
  const brandArea = {
    pct: Math.round(1000 * tints.reduce((s, t) => s + t.w * t.h, 0) / mainArea) / 10,
    list: tints.sort((a, b) => b.w * b.h - a.w * a.h).slice(0, 4).map(t => `${t.c} ${Math.round(t.w)}×${Math.round(t.h)}`)
  }
  // §5-4 — 글자 덩어리 밀도: 글자를 직접 담은 보이는 요소 수 ÷ main 높이(1000px당)
  const textOwners = new Set()
  const tw = document.createTreeWalker(main, NodeFilter.SHOW_TEXT)
  while (tw.nextNode()) {
    const t = tw.currentNode
    // 화면에 보이지 않는 스크린리더 전용 글(sr-only, 1px 상자)은 글자 덩어리로 세지 않는다
    // 표(달력·통계표)와 자료 그림(figure — 눈금·지도·도표의 값 이름표)은 한 덩어리로 읽는 자료라 칸마다 세지 않고 하나로 센다.
    // 값을 CSS content로 그려 이 셈을 피하지 않는다 — 화면 읽기 프로그램이 값을 읽지 못한다(design-intelligence §5-4)
    if (t.textContent.trim() && t.parentElement && visible(t.parentElement) && t.parentElement.getBoundingClientRect().width > 1) textOwners.add(t.parentElement.closest('table, figure') || t.parentElement)
  }
  const textDensity = { per1000: Math.round(10000 * textOwners.size / Math.max(1, mr.height)) / 10, count: textOwners.size, height: Math.round(mr.height) }
  // §5-1 — 섹션 제목 크기: main 안 보이는 h2 글자 크기의 가운데 값
  const h2Sizes = [...main.querySelectorAll('h2')].filter(visible).map(el => parseFloat(getComputedStyle(el).fontSize)).sort((a, b) => a - b)
  const sectionHeading = h2Sizes.length ? { median: h2Sizes[Math.floor(h2Sizes.length / 2)], sizes: [...new Set(h2Sizes)] } : null
  // §5-5 — 사진 넓이: 폭 300px·높이 200px 이상인 사진(img·video·배경 그림)이 main 넓이에서 차지하는 비율. 바깥 것만 센다
  const pics = []
  for (const el of main.querySelectorAll('*')) {
    const isPic = /^(IMG|VIDEO)$/.test(el.tagName) || /url\(/.test(getComputedStyle(el).backgroundImage)
    if (!isPic || !visible(el) || pics.some(p => p.el.contains(el))) continue
    const r = el.getBoundingClientRect()
    const w = Math.max(0, Math.min(r.right, mr.right) - Math.max(r.left, mr.left)); const h = Math.max(0, Math.min(r.bottom, mr.bottom) - Math.max(r.top, mr.top))
    if (w >= 300 && h >= 200) pics.push({ el, w, h })
  }
  const photoArea = { pct: Math.min(100, Math.round(1000 * pics.reduce((s, p) => s + p.w * p.h, 0) / mainArea) / 10), count: pics.length }
  // §5-4 — 여백 리듬: 이웃한 섹션 사이 간격(앞 섹션 아래 여백 + 뒤 섹션 위 여백)과 제목(h2)→내용 간격.
  //   첫 섹션(첫 화면)과 둘째 섹션 사이는 세지 않는다 — 첫 화면의 아래 여백은 사진 안이다
  const px = v => Math.round(parseFloat(v) || 0)
  const pads = secs.map(s => { const cs = getComputedStyle(s); return { top: px(cs.paddingTop) + px(cs.marginTop), bottom: px(cs.paddingBottom) + px(cs.marginBottom), name: (s.querySelector('h1, h2')?.textContent || s.className).trim().slice(0, 10) } })
  const sectionGaps = pads.slice(1, -1).map((p, i) => ({ gap: p.bottom + pads[i + 2].top, label: `${p.name}→${pads[i + 2].name}` }))
  const titleGaps = []
  for (const s of secs.slice(1)) {
    const h2 = [...s.querySelectorAll('h2')].find(visible)
    if (!h2) continue
    const hr = h2.getBoundingClientRect(); const hb = hr.bottom
    // 제목과 가로로 겹치는 요소만 센다 — 제목을 왼쪽 열에 건 구도에서 옆 열 목록 줄을 제목 아래 내용으로 재지 않게
    const after = [...s.querySelectorAll('h3, p, a, img, li, ul, ol, div, article, figure, table, dl')].filter(e => { if (!visible(e) || h2.contains(e) || e.contains(h2)) return false; const r = e.getBoundingClientRect(); return r.top >= hb - 1 && r.left < hr.right && r.right > hr.left }).map(e => e.getBoundingClientRect().top)
    if (after.length) titleGaps.push({ gap: Math.round(Math.min(...after) - hb), label: h2.textContent.trim().slice(0, 10) })
  }
  const spacing = { sectionGaps, titleGaps }
  // §3-5 — 한 칸 안 중복 링크: 같은 주소로 가는 보이는 링크 둘의 가장 가까운 공통 조상이 폭 700px·높이 500px 안이면
  //   한 칸 안에 같은 링크를 두 번 단 것이다(로고 링크 + 같은 사이트 글자 링크)
  const dupLinks = []
  const links = [...main.querySelectorAll('a[href]')].filter(visible)
  for (let i = 0; i < links.length; i += 1) {
    for (let j = i + 1; j < links.length; j += 1) {
      if (links[i].href !== links[j].href || links[i].contains(links[j]) || links[j].contains(links[i])) continue
      let box = links[i].parentElement
      while (box && !box.contains(links[j])) box = box.parentElement
      if (!box) continue
      const br = box.getBoundingClientRect()
      if (br.width <= 700 && br.height <= 500) { const name = (links[j].textContent || links[i].textContent).trim().slice(0, 12); if (!dupLinks.includes(name)) dupLinks.push(name) }
    }
  }
  // §5-3 — 나란한 칸의 줄맞춤: 한 줄에 나란히 선 형제 상자(폭 200px 이상, 2개 이상)마다 첫 제목(h2~h4)이
  //   상자 윗선에서 떨어진 거리를 견준다. 로고·그림 높이가 달라 제목·링크 줄이 칸마다 어긋나면 잡는다
  const rowMisaligned = []
  for (const parent of main.querySelectorAll('ul, ol, div')) {
    const kids = [...parent.children].filter(k => visible(k) && k.getBoundingClientRect().width >= 200)
    if (kids.length < 2) continue
    const tops = kids.map(k => k.getBoundingClientRect().top)
    if (Math.max(...tops) - Math.min(...tops) > 2) continue
    // 아래쪽에 맞춘 칸(사진 위 이름)은 제목 아랫선이 상자 아랫선에서 떨어진 거리로 본다 — 둘 중 하나가 맞으면 통과
    const pairs = kids.map(k => { const t = [...k.querySelectorAll('h2, h3, h4')].find(visible); if (!t) return null; const tr = t.getBoundingClientRect(); const kr = k.getBoundingClientRect(); return { top: Math.round(tr.top - kr.top), bottom: Math.round(kr.bottom - tr.bottom) } })
    if (pairs.some(o => o === null)) continue
    const spreadOf = key => Math.max(...pairs.map(p => p[key])) - Math.min(...pairs.map(p => p[key]))
    const diff = Math.min(spreadOf('top'), spreadOf('bottom'))
    if (diff > 4 && !rowMisaligned.some(r => r.el.contains(parent) || parent.contains(r.el))) {
      rowMisaligned.push({ el: parent, label: `${kids.map(k => [...k.querySelectorAll('h2, h3, h4')].find(visible).textContent.trim().slice(0, 8)).join('·')} ${diff}px` })
    }
  }
  // user-behavior 4-1 — 두 줄 이상인 단락의 한 줄 평균 글자 수
  const longLines = []
  for (const p of main.querySelectorAll('p')) {
    if (!visible(p)) continue
    const cs = getComputedStyle(p); const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.6
    const lines = Math.round(p.getBoundingClientRect().height / lh)
    const text = p.textContent.replace(/\s+/g, ' ').trim()
    if (lines >= 2 && text.length / lines > 50) longLines.push(`${Math.round(text.length / lines)}자 「${text.slice(0, 10)}」`)
  }
  // user-behavior 5-3 — 열자마자 화면을 덮는 레이어
  const overlays = [...document.querySelectorAll('dialog[open], [role="dialog"], [role="alertdialog"], [aria-modal="true"]')].filter(visible).length
  // user-behavior 3-2 — 새 창 안내 없는 target=_blank
  const blankLinks = [...document.querySelectorAll('a[target="_blank"]')].filter(a => visible(a) && !/새\s?창/.test(a.textContent + (a.getAttribute('title') || '') + (a.getAttribute('aria-label') || ''))).map(a => a.textContent.trim().slice(0, 12))
  const search = [...document.querySelectorAll('input[type="search"], input[name="q"]')].filter(visible)
  return {
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    h1: h1 ? parseFloat(getComputedStyle(h1).fontSize) : 0,
    body: para ? parseFloat(getComputedStyle(para).fontSize) : 0,
    fontSizes: [...sizes].sort((a, b) => b - a).map(v => `${v}px`),
    hero: big ? { left: Math.round(big.left), right: Math.round(big.right), width: Math.round(big.width), height: Math.round(big.height) } : null,
    backgrounds: [...bgs],
    surfaces: [...surfaces],
    loudSurfaces,
    photos,
    transitions,
    glyphs,
    peek, emptyLeft, columnGaps, longLines, overlays, blankLinks, panels, panelBottoms, bareSections, brandArea, textDensity, sectionHeading, photoArea, spacing, rowMisaligned: rowMisaligned.map(r => r.label), dupLinks,
    headingRepeat: topFrame ? { key: topFrame[0], count: topFrame[1] } : { key: '', count: 0 },
    cardGrids: cardGrids.map(g => g.label),
    searchInputs: search.length
  }
}

function measureNarrow() {
  const visible = el => {
    const r = el.getBoundingClientRect()
    const cs = getComputedStyle(el)
    return r.width > 1 && r.height > 1 && cs.visibility !== 'hidden' && cs.display !== 'none'
  }
  const fold = 780
  const heroInFold = [...document.querySelectorAll('main img, main picture, main video, main canvas, main svg')]
    .some(el => { const r = el.getBoundingClientRect(); return visible(el) && r.top < fold && r.height >= 80 })
  const small = []
  for (const el of document.querySelectorAll('a[href], button, input:not([type="hidden"]), select, textarea, summary')) {
    if (!visible(el) || el.closest('.sr-only, .skip-to-content')) continue
    if (el.tagName === 'A' && el.closest('p')) continue // 문장 안 링크는 KRDS 예외
    const r = el.getBoundingClientRect()
    if (r.width < 44 || r.height < 44) small.push(`${(el.textContent || el.getAttribute('aria-label') || el.tagName).trim().slice(0, 14)} ${Math.round(r.width)}×${Math.round(r.height)}`)
  }
  const secs = [...document.querySelectorAll('main > section')]
  const peek = secs.length < 2 || secs.slice(1).some(sec => [...sec.querySelectorAll('h2, h3, p, a, img, li, dt')].some(e => visible(e) && e.getBoundingClientRect().top < fold - 24))
  const foldLinks = [...document.querySelectorAll('main a[href]')].filter(a => { const r = a.getBoundingClientRect(); return visible(a) && r.top < fold - 24 }).length
  // §5-5·D12 — 사진 판에서 사진이 덮지 않은 짙은 면. 자기 바탕이 짙은(밝기 60 미만) 높이 400px 이상 상자 안에 사진이 있는데,
  // 사진이 세로로 덮지 못한 높이가 400px 이상이면 「사진 판 위쪽이 거의 검은 면」이다. 2026-11-21 시안 13~28회차 360 열린경영 판
  // (사진 폭을 고정해 바닥에만 두고 위를 판 바탕 gray-90으로 녹였다)이 약 640px 검은 면이었고, 가린 평가자가 다섯 회차 내리 D12로 짚었다
  const darkSlabs = []
  for (const box of document.querySelectorAll('main *')) {
    if (!visible(box) || box.tagName === 'IMG') continue
    const m = getComputedStyle(box).backgroundColor.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?/)
    if (!m || (m[4] !== undefined && Number(m[4]) < 0.5)) continue
    if ((Number(m[1]) + Number(m[2]) + Number(m[3])) / 3 >= 60) continue
    const r = box.getBoundingClientRect()
    if (r.height < 400) continue
    // 판 바탕으로 깐 사진만 센다(절대 위치이거나 z-index가 음수) — 짙은 글 면과 사진 단을 나란히 둔 분할(cover)은 사진 판이 아니다
    const imgs = [...box.querySelectorAll('img')].filter(visible).filter(i => { const cs = getComputedStyle(i); return cs.position === 'absolute' || cs.position === 'fixed' || Number(cs.zIndex) < 0 }).map(i => i.getBoundingClientRect())
    if (!imgs.length) continue
    // 사진들이 상자 안에서 세로로 덮는 구간의 합집합
    const spans = imgs.map(i => [Math.max(i.top, r.top), Math.min(i.bottom, r.bottom)]).filter(([a, b]) => b > a).sort((x, y) => x[0] - y[0])
    let covered = 0; let end = -Infinity
    for (const [a, b] of spans) { if (a > end) { covered += b - a; end = b } else if (b > end) { covered += b - end; end = b } }
    const bare = Math.round(r.height - covered)
    if (bare >= 400) darkSlabs.push(`${(box.querySelector('h2, h3')?.textContent || box.className).trim().slice(0, 14)} ${bare}px`)
  }
  return { overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth, heroInFold, smallTargets: small, peek, foldLinks, darkSlabs }
}

/* §5-5 — 늘려 쓴 사진: main 안 넓은 사진(img·배경 그림, 폭 600px·높이 300px 이상)의 원본 크기와 그려진 크기를 견준다.
   object-fit·background-size cover처럼 채우는 경우를 기준으로 배율 = max(그린 폭/원본 폭, 그린 높이/원본 높이).
   지연 로딩 사진을 깨우려고 끝까지 한 번 훑는다 */
async function measureUpscale() {
  for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 60)) }
  window.scrollTo(0, 0)
  const main = document.querySelector('main') || document.body
  const items = []
  for (const el of main.querySelectorAll('*')) {
    const cs = getComputedStyle(el)
    if (cs.display === 'none' || cs.visibility === 'hidden') continue
    const r = el.getBoundingClientRect()
    if (r.width < 600 || r.height < 300) continue
    let src = ''
    if (el.tagName === 'IMG') src = el.currentSrc || el.src
    else { const m = cs.backgroundImage.match(/url\(["']?([^"')]+)["']?\)/); if (m) src = m[1] }
    if (src) items.push({ el, src, w: r.width, h: r.height })
  }
  const load = src => new Promise(resolve => { const im = new Image(); im.onload = () => resolve({ w: im.naturalWidth, h: im.naturalHeight }); im.onerror = () => resolve(null); im.src = src })
  const out = []
  for (const it of items) {
    const n = await load(it.src)
    if (!n || !n.w) continue
    const scale = Math.max(it.w / n.w, it.h / n.h)
    if (scale > 1.15) out.push(`${it.src.split('/').pop().slice(0, 24)} 원본 ${n.w}×${n.h} → ${Math.round(it.w)}×${Math.round(it.h)} (${scale.toFixed(2)}배)`)
  }
  return out
}

/* R-13 · R-33 — 가려진 조작 요소: 첫 화면(뷰포트 안)의 링크 · 단추마다 한가운데 점의 맨 위 요소가 그 자신(또는 안쪽)인지 본다.
   다른 요소가 덮으면 보이는데 마우스로 눌리지 않는다. 캡처로는 보이지 않는 결함이라 폭마다 잰다.
   근거: 2026-11-21 시안 13~20회차에서 1024 · 1280의 첫 화면 정지 단추가 표제 단의 뒤 스크림(::before)에 덮여 눌리지 않았다 */
function measureCovered() {
  const out = []
  const vw = window.innerWidth
  const vh = window.innerHeight
  for (const el of document.querySelectorAll('header a[href], header button, main a[href], main button')) {
    const r = el.getBoundingClientRect()
    if (r.width < 2 || r.height < 2 || r.top < 0 || r.left < 0 || r.bottom > vh || r.right > vw) continue
    const cs = getComputedStyle(el)
    if (cs.visibility === 'hidden' || cs.pointerEvents === 'none' || Number(cs.opacity) === 0) continue
    const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
    if (top && !el.contains(top) && !top.contains(el)) {
      out.push(((el.getAttribute('aria-label') || el.textContent || el.className) + '').replace(/\s+/g, ' ').trim().slice(0, 16))
    }
  }
  return [...new Set(out)]
}

/* §5-8 — 한 줄로 읽혀야 하는 UI 글자(머리글 링크 · 단추, 탭, 더보기, 버튼)가 두 줄로 꺾였는가.
   요소 안 글자 마디마다 줄 상자의 윗선을 모아, 윗선 차이가 그 글자 행간의 0.6배를 넘으면 꺾인 것으로 본다(아이콘·숨긴 글자는 빼고).
   근거: 2026-11-23 천문연 6회차 — 1024 폭에서 머리글 메뉴 「연구원 소개」가 두 줄로 꺾였다. 1440 · 360만 재는 관문은 지나쳤고,
   제작자가 다섯 폭을 직접 보고서야 찾았다(1024~1279 메뉴 간격을 줄이고 줄바꿈을 막아 고쳤다) */
function measureWrapped() {
  const out = []
  const vw = window.innerWidth
  for (const el of document.querySelectorAll('header a[href], header button, [role="tab"], .more-link, .btn')) {
    const r = el.getBoundingClientRect()
    if (r.width < 2 || r.height < 2 || r.right <= 0 || r.left >= vw) continue
    const cs = getComputedStyle(el)
    if (cs.visibility === 'hidden' || Number(cs.opacity) === 0) continue
    const tops = []
    let lh = 0
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      if (!n.textContent.trim()) continue
      const p = n.parentElement
      if (!p || p.closest('.sr-only, [hidden], [aria-hidden="true"]')) continue
      const pcs = getComputedStyle(p)
      lh = Math.max(lh, parseFloat(pcs.lineHeight) || parseFloat(pcs.fontSize) * 1.5)
      const range = document.createRange()
      range.selectNodeContents(n)
      for (const rr of range.getClientRects()) if (rr.width > 0 && rr.height > 0) tops.push(rr.top)
    }
    if (tops.length < 2) continue
    if (Math.max(...tops) - Math.min(...tops) > lh * 0.6) {
      out.push(((el.getAttribute('aria-label') || el.textContent || el.className) + '').replace(/\s+/g, ' ').trim().slice(0, 16))
    }
  }
  return [...new Set(out)]
}

/* §5-3 · D11 — 본문 선 밖 글자: main 안의 보이는 글자(텍스트 마디의 줄 상자)가 본문 선 밖으로 2px 넘게 나갔는가.
   본문 선 = main 안 보이는 .container 가운데 가장 넓은 내용 선(안쪽 여백을 뺀 왼쪽 · 오른쪽 선). main에 .container가 없으면 머리글의 것.
   가로로 넘기는 칸(overflow-x auto · scroll) · 회전 목록(aria-roledescription carousel · slide) · 화면 밖 글자는 뺀다.
   근거: 2026-11-24 KIOST 시니어 시안 S — 1440에서 장면 위 관측값 칸이 본문 오른쪽 선을 21px 넘었고(가린 평가 D11),
   1920에서는 전체 폭 장면을 비율대로 키운 탓에 164px 넘었다. 1440까지만 보는 캡처로는 1920 결함이 보이지 않았다 */
function measureOutside() {
  const vw = window.innerWidth
  const shown = el => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' }
  let boxes = [...document.querySelectorAll('main .container')].filter(shown)
  if (!boxes.length) boxes = [...document.querySelectorAll('header .container')].filter(shown)
  if (!boxes.length) return []
  const lines = boxes.map(el => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return { l: r.left + parseFloat(cs.paddingLeft), r: r.right - parseFloat(cs.paddingRight) } })
  const widest = lines.reduce((a, b) => (b.r - b.l > a.r - a.l ? b : a))
  const L = widest.l; const R = widest.r
  const slack = 2 // GATE.outsideSlack과 같다(브라우저 안이라 상수를 못 읽는다)
  const main = document.querySelector('main')
  const out = []
  if (!main) return out
  const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT)
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (!n.textContent.trim()) continue
    const p = n.parentElement
    if (!p || p.closest('.sr-only, [hidden], [aria-hidden="true"], .skip-to-content, [aria-roledescription="carousel"], [aria-roledescription="slide"]')) continue
    const pcs = getComputedStyle(p)
    if (pcs.visibility === 'hidden' || Number(pcs.opacity) === 0) continue
    // 가로로 넘기는 칸은 빼고, 잘라 내는 조상(overflow hidden · clip — 말줄임 제목 등)은 그 상자로 글자 범위를 자른다
    let scroller = false
    let clipL = -Infinity; let clipR = Infinity
    for (let a = p; a && a !== main; a = a.parentElement) {
      const ox = getComputedStyle(a).overflowX
      if (/auto|scroll/.test(ox) && a.scrollWidth > a.clientWidth + 1) { scroller = true; break }
      if (/hidden|clip/.test(ox)) { const ar = a.getBoundingClientRect(); clipL = Math.max(clipL, ar.left); clipR = Math.min(clipR, ar.right) }
    }
    if (scroller) continue
    const range = document.createRange()
    range.selectNodeContents(n)
    for (const rr of range.getClientRects()) {
      const left = Math.max(rr.left, clipL); const right = Math.min(rr.right, clipR)
      if (right - left < 1 || rr.height < 1 || right <= 0 || left >= vw) continue
      if (right > R + slack || left < L - slack) {
        out.push(`${n.textContent.replace(/\s+/g, ' ').trim().slice(0, 12)} ${right > R + slack ? `오른쪽 +${Math.round(right - R)}` : `왼쪽 −${Math.round(L - left)}`}px`)
        break
      }
    }
  }
  return [...new Set(out)]
}

/* user-behavior 3-6 — 둘째 섹션의 글자 · 사진이 첫 화면 안(바닥에서 24px 위)에 보이는가. measureWide 안의 판정과 같다(1920에서 따로 잰다) */
function measurePeek() {
  const main = document.querySelector('main')
  if (!main) return true
  const secs = [...main.querySelectorAll(':scope > section')]
  if (secs.length < 2) return true
  const vh = window.innerHeight
  return secs.slice(1).some(sec => [...sec.querySelectorAll('h2, h3, p, a, img, li, dt')].some(e => {
    const r = e.getBoundingClientRect(); const cs = getComputedStyle(e)
    return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && r.top < vh - 24
  }))
}

/* 폭마다 한 번 열어 가려진 조작 요소 · 꺾인 한 줄 UI · 본문 선 밖 글자를 함께 잰다 — 브라우저로 넘기는 함수는 혼자 서야 해서 문자열로 묶는다 */
const measurePerWidth = new Function(`return { covered: (${measureCovered})(), wrapped: (${measureWrapped})(), outside: (${measureOutside})() }`)
const measureXL = new Function(`return { outside: (${measureOutside})(), peek: (${measurePeek})() }`)

async function gate([target], options) {
  return withBrowser(options, async browser => {
    const read = async (width, height, fn) => {
      const page = await browser.newPage()
      await page.setViewport({ width, height, deviceScaleFactor: 1 })
      await page.goto(toUrl(target), { waitUntil: 'load', timeout: 60000 })
      await sleep(options.wait)
      const value = await page.evaluate(fn)
      await page.close()
      return value
    }
    const metrics = { wide: await read(1440, 900, measureWide), narrow: await read(360, 780, measureNarrow) }
    metrics.wide.upscaled = await read(1440, 900, measureUpscale)
    metrics.wide.covered = []
    metrics.wide.wrapped = []
    metrics.wide.outside = []
    for (const [w, h] of [[360, 780], [1024, 768], [1280, 800], [1440, 900]]) {
      const per = await read(w, h, measurePerWidth)
      for (const label of per.covered) metrics.wide.covered.push(`${w} ${label}`)
      for (const label of per.wrapped) metrics.wide.wrapped.push(`${w} ${label}`)
      for (const label of per.outside) metrics.wide.outside.push(`${w} ${label}`)
    }
    // 넓은 화면 — 1440까지만 보면 전체 폭 장면을 비율대로 키운 결함(화면보다 큰 장면, 본문 선 밖 글자)이 보이지 않는다
    const xl = await read(1920, 1080, measureXL)
    for (const label of xl.outside) metrics.wide.outside.push(`1920 ${label}`)
    metrics.wide.peekXL = xl.peek
    const results = judgeGate(metrics, 1440, { sketch: options.sketch })
    for (const r of results) console.log(`${r.pass ? '통과' : '불통과'}  ${r.name} — ${r.detail}`)
    if (options.sketch) console.log('스케치 범위(--sketch) — 페이지 분량 두 줄(넓은 사진 수 · 판 수)은 재지 않았다. 완성본에서는 빼지 않는다(§3-2)')
    const failed = results.filter(r => !r.pass).length
    console.log(failed ? `렌더 관문 불통과 ${failed}건 — 평가자에게 넘기지 않고 고친다(§8-2)` : '렌더 관문 통과 — 계산되는 결함 없음. 화면이 좋다는 뜻은 아니다')
    if (failed) process.exitCode = 1
    return { metrics, results }
  })
}

const COMMANDS = { shots, scroll, gate, alpha }

async function main(argv = process.argv.slice(2)) {
  let parsed
  try {
    parsed = parseArgs(argv)
  } catch (error) {
    console.error(error.message)
    console.error(USAGE)
    process.exitCode = 1
    return
  }
  try {
    await COMMANDS[parsed.command](parsed.positional, parsed.options)
  } catch (error) {
    console.error(`캡처 실패: ${error.message}`)
    process.exitCode = 1
  }
}

if (require.main === module) main()

module.exports = { parseArgs, toUrl, launchArgs, whiteToAlpha, judgeGate, GATE, DEFAULTS }
