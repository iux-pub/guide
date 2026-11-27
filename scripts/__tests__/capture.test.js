// 렌더 캡처 도구(scripts/capture.js) — 인자 읽기, 주소 변환, 그래픽 가속 인자, 흰 바탕 → 알파 계산.
// 브라우저를 띄우는 부분은 단위 테스트에서 돌리지 않는다(puppeteer·GPU가 환경마다 다르다).

const path = require('node:path')
const { test } = require('node:test')
const assert = require('node:assert/strict')

const { parseArgs, toUrl, launchArgs, whiteToAlpha } = require('../capture.js')

test('인자 — 하위 명령별 기본값과 옵션, 잘못된 입력은 던진다', () => {
  const shots = parseArgs(['shots', 'docs/a.html', 'docs/shots/r1-1440', '--width', '360', '--max', '8'])
  assert.deepEqual(shots.positional, ['docs/a.html', 'docs/shots/r1-1440'])
  assert.equal(shots.options.width, 360)
  assert.equal(shots.options.max, 8)
  assert.equal(shots.options.slice, 1800)
  assert.equal(shots.options.wait, 3500)
  assert.equal(shots.options.soft, false)

  const scroll = parseArgs(['scroll', 'https://example.org/', 'out/ref', '--frames', '6', '--soft'])
  assert.equal(scroll.options.frames, 6)
  assert.equal(scroll.options.soft, true)

  assert.deepEqual(parseArgs(['alpha', 'in']).positional, ['in'])

  assert.throws(() => parseArgs([]), /shots·scroll·alpha/)
  assert.throws(() => parseArgs(['shoot', 'a', 'b']), /shots·scroll·alpha/)
  assert.throws(() => parseArgs(['shots', 'a']), /모자란다/)
  assert.throws(() => parseArgs(['shots', 'a', 'b', '--frames', '3']), /없는 옵션/)
  assert.throws(() => parseArgs(['scroll', 'a', 'b', '--frames', 'x']), /양수/)
  assert.throws(() => parseArgs(['alpha', 'in', '--soft']), /없는 옵션/)
})

test('주소 — http·file 주소는 그대로, 파일 경로는 file:// 주소로', () => {
  assert.equal(toUrl('https://example.org/a'), 'https://example.org/a')
  assert.equal(toUrl('file:///tmp/a.html'), 'file:///tmp/a.html')
  const url = toUrl('docs/a.html', path.resolve('/work'))
  assert.match(url, /^file:\/\/.*\/work\/docs\/a\.html$/)
})

test('브라우저 인자 — 기본은 그래픽 가속, soft면 가속 없이', () => {
  const win = launchArgs({ platform: 'win32' })
  assert.ok(win.includes('--use-angle=d3d11'))
  assert.ok(win.includes('--enable-gpu') && win.includes('--ignore-gpu-blocklist') && win.includes('--enable-webgl'))
  assert.ok(launchArgs({ platform: 'darwin' }).includes('--use-angle=metal'))
  assert.ok(launchArgs({ platform: 'linux' }).includes('--use-angle=gl'))
  assert.deepEqual(launchArgs({ soft: true }), ['--no-sandbox', '--allow-file-access-from-files'])
})

test('흰 바탕 → 알파 — 흰색은 투명, 검정은 불투명, 중간색은 흰색을 걷어 낸 색', () => {
  const data = new Uint8ClampedArray([
    255, 255, 255, 255, // 흰색 → 투명
    250, 252, 254, 255, // 거의 흰색(4% 미만) → 투명
    0, 0, 0, 255, // 검정 → 그대로
    128, 191, 255, 255 // 하늘색 → 반투명 파랑
  ])
  whiteToAlpha(data)
  assert.equal(data[3], 0)
  assert.equal(data[7], 0)
  assert.deepEqual([...data.slice(8, 12)], [0, 0, 0, 255])
  assert.equal(data[15], 127)
  assert.deepEqual([...data.slice(12, 15)], [0, 126, 255])
})

test('gate — 인자와 렌더 관문 판정', () => {
  const { judgeGate, GATE } = require('../capture.js')
  assert.deepEqual(parseArgs(['gate', 'index.html']).positional, ['index.html'])
  assert.equal(parseArgs(['gate', 'index.html', '--wait', '500']).options.wait, 500)
  assert.throws(() => parseArgs(['gate']), /모자란다/)
  const good = {
    wide: { overflow: false, h1: 60, body: 17, fontSizes: ['60px', '40px', '24px', '17px', '15px'], hero: { left: 0, right: 1440, width: 1440, height: 640 }, backgrounds: ['a', 'b'], surfaces: ['a', 'b', 'c'], photos: 4, transitions: 3, glyphs: [], searchInputs: 1 },
    narrow: { overflow: false, heroInFold: true, smallTargets: [] }
  }
  assert.ok(judgeGate(good).every(r => r.pass))
  // 1회차 시안처럼 사진이 가운데 칸에 갇히고, 검색이 둘이고, 면 색이 여덟이면 걸린다
  const boxed = structuredClone(good)
  boxed.wide.hero = { left: 625, right: 1017, width: 392, height: 520 }
  boxed.wide.searchInputs = 2
  boxed.wide.surfaces = ['1', '2', '3', '4', '5', '6', '7', '8']
  boxed.narrow.heroInFold = false
  const failed = judgeGate(boxed).filter(r => !r.pass).map(r => r.name)
  assert.equal(failed.length, 4)
  assert.ok(failed.some(n => n.includes('가장자리')))
  // 반쪽 분할 사진도 한쪽 가장자리에 닿으면 통과한다(§6-1 H1)
  const split = structuredClone(good)
  split.wide.hero = { left: 720, right: 1440, width: 720, height: 600 }
  assert.ok(judgeGate(split).every(r => r.pass))
  const bare = structuredClone(good)
  bare.wide.photos = 1
  assert.ok(judgeGate(bare).some(r => !r.pass && r.name.includes('넓은 사진')))
  // 방향 스케치(§3-2)는 분량 두 줄(넓은 사진 수 · 판 수)을 재지 않는다 — 다른 줄은 그대로 본다
  assert.equal(parseArgs(['gate', 'docs/directions/a.html', '--sketch']).options.sketch, true)
  assert.equal(parseArgs(['gate', 'index.html']).options.sketch, undefined)
  assert.throws(() => parseArgs(['shots', 'a', 'b', '--sketch']), /없는 옵션/)
  const sketch = structuredClone(bare)
  sketch.wide.panels = ['소식 784×398']
  sketch.wide.bareSections = []
  const sketchNames = judgeGate(sketch, 1440, { sketch: true }).map(r => r.name)
  assert.ok(!sketchNames.some(n => n.includes('넓은 사진') || n.includes('면이 있는 판')))
  assert.ok(sketchNames.some(n => n.includes('맨 섹션')))
  assert.ok(judgeGate(sketch).some(r => !r.pass && r.name.includes('면이 있는 판')))
  sketch.wide.hero = { left: 625, right: 1017, width: 392, height: 520 }
  assert.ok(judgeGate(sketch, 1440, { sketch: true }).some(r => !r.pass && r.name.includes('가장자리')))
  const striped = structuredClone(good)
  striped.wide.transitions = 10
  striped.wide.glyphs = ['자세히 보기 →']
  assert.equal(judgeGate(striped).filter(r => !r.pass).length, 2)
  // 사용자 행동 근거(user-behavior §6) — 거짓 바닥·왼쪽 빈 단·긴 줄·레이어·새 창 안내·360 첫 화면 링크
  const blocked = structuredClone(good)
  blocked.wide.peek = false
  blocked.wide.emptyLeft = ['사업영역']
  blocked.wide.longLines = ['62자 「제주관광공사는」']
  blocked.wide.overlays = 1
  blocked.wide.blankLinks = ['비짓제주']
  blocked.narrow.foldLinks = 1
  const blockedNames = judgeGate(blocked).filter(r => !r.pass).map(r => r.name)
  assert.equal(blockedNames.length, 6)
  assert.ok(blockedNames.every(n => /user-behavior/.test(n)))
  const gapped = structuredClone(good)
  gapped.wide.columnGaps = ['접수 중인 공모 190px']
  assert.deepEqual(judgeGate(gapped).filter(r => !r.pass).map(r => r.name), ['나란한 단 아랫선 차이 100px 이하(§5-3·D11)'])
  // 360 사진 판 위쪽이 사진 없이 짙은 면으로 남으면 걸린다(시안 27회차 열린경영 판 640px)
  const slab = structuredClone(good)
  slab.narrow.darkSlabs = ['열린경영 640px']
  assert.deepEqual(judgeGate(slab).filter(r => !r.pass).map(r => r.name), ['360 사진 판 안 사진 없는 짙은 면 400px 미만(§5-5·D12)'])
  slab.narrow.darkSlabs = []
  assert.ok(judgeGate(slab).every(r => r.pass))
  assert.ok(!judgeGate(good).some(r => /짙은 면/.test(r.name)))
  const loud = structuredClone(good)
  loud.wide.loudSurfaces = ['rgb(240, 138, 28) 384×520']
  assert.deepEqual(judgeGate(loud).filter(r => !r.pass).map(r => r.name), ['채도 높은 넓은 면 0개(§5-2)'])
  // 판 측정이 없는 옛 측정값은 판 줄을 내지 않는다(측정 안 한 것을 불통과로 치지 않는다)
  assert.ok(!judgeGate(good).some(r => /면이 있는 판/.test(r.name)))
  const paneled = structuredClone(good)
  paneled.wide.panels = ['알림마당 640×420', '배너 320×420', '사업 384×300', '정보공개 560×320']
  paneled.wide.bareSections = ['관련 기관']
  assert.ok(judgeGate(paneled).every(r => r.pass))
  const unpaneled = structuredClone(paneled)
  unpaneled.wide.panels = []
  unpaneled.wide.bareSections = ['접수 중인 공모', '알림마당']
  assert.deepEqual(judgeGate(unpaneled).filter(r => !r.pass).map(r => r.name), ['면이 있는 판 4개 이상(§3-5 4)', '판도 사진도 없는 맨 섹션 1개 이하(§3-5 4)'])
  // 대표색 면 넓이 — 한국관광공사 9.4%는 통과, 7회차 83.1%는 불통과. 측정이 없으면 줄을 내지 않는다
  assert.ok(!judgeGate(good).some(r => /대표색 면/.test(r.name)))
  const calm = structuredClone(good)
  calm.wide.brandArea = { pct: 9.4, list: ['rgb(74, 86, 119) 1440×130'] }
  assert.ok(judgeGate(calm).every(r => r.pass))
  const flooded = structuredClone(good)
  flooded.wide.brandArea = { pct: 83.1, list: ['rgb(0, 45, 60) 1440×573', 'rgb(230, 244, 251) 1440×500'] }
  assert.deepEqual(judgeGate(flooded).filter(r => !r.pass).map(r => r.name), ['대표색 면 넓이 본문의 15% 이하(§5-2)'])
  // 밀도·섹션 제목·사진 넓이 — 측정이 없으면 줄을 내지 않는다. 한국관광공사 수준은 통과, 9회차 수준은 셋 다 불통과
  assert.ok(!judgeGate(good).some(r => /글자 덩어리|섹션 제목\(h2\)|사진 넓이/.test(r.name)))
  const roomy = structuredClone(good)
  roomy.wide.textDensity = { per1000: 15.4, count: 62, height: 4017 }
  roomy.wide.sectionHeading = { median: 42.4, sizes: [32, 42.4] }
  roomy.wide.photoArea = { pct: 52, count: 9 }
  assert.ok(judgeGate(roomy).every(r => r.pass))
  const crowded = structuredClone(good)
  crowded.wide.textDensity = { per1000: 34.4, count: 123, height: 3579 }
  crowded.wide.sectionHeading = { median: 32, sizes: [24, 32] }
  crowded.wide.photoArea = { pct: 31.7, count: 3 }
  assert.deepEqual(judgeGate(crowded).filter(r => !r.pass).map(r => r.name), ['글자 덩어리 높이 1000px당 24개 이하(§5-4)', '섹션 제목(h2) 가운데 값 36px 이상(§5-1)', '사진 넓이 본문의 35% 이상(§5-5)'])
  // 여백 리듬 — INFOUX .section(PC 위아래 4rem)을 따르면 통과, 11회차 첫 판처럼 제각각이면 두 줄 모두 불통과
  assert.ok(!judgeGate(good).some(r => /섹션 사이 간격|제목→내용/.test(r.name)))
  const even = structuredClone(good)
  even.wide.spacing = { sectionGaps: [{ gap: 80, label: 'a→b' }, { gap: 80, label: 'b→c' }, { gap: 84, label: 'c→d' }], titleGaps: [{ gap: 24, label: 'a' }, { gap: 24, label: 'b' }] }
  assert.ok(judgeGate(even).every(r => r.pass))
  const ragged = structuredClone(good)
  ragged.wide.spacing = { sectionGaps: [{ gap: 192, label: '알림→사업' }, { gap: 48, label: '사업→통계' }, { gap: 208, label: '통계→미션' }], titleGaps: [{ gap: 32, label: '알림마당' }, { gap: 88, label: '미션' }] }
  assert.deepEqual(judgeGate(ragged).filter(r => !r.pass).map(r => r.name), ['섹션 사이 간격 한 값(차이 8px 이하, §5-4)', '제목→내용 간격 한 값이고 섹션 간격의 1/3 이하(§5-4)'])
  const farTitle = structuredClone(good)
  farTitle.wide.spacing = { sectionGaps: [{ gap: 80, label: 'a→b' }], titleGaps: [{ gap: 40, label: 'a' }, { gap: 40, label: 'b' }] }
  assert.deepEqual(judgeGate(farTitle).filter(r => !r.pass).map(r => r.detail), ['차이 0px — a 40 / b 40 · 1/3(27px) 넘음 2곳'])
  // 나란한 칸 줄맞춤 — 측정이 없으면 줄을 내지 않고, 어긋난 줄이 있으면 불통과
  assert.ok(!judgeGate(good).some(r => /나란한 칸/.test(r.name)))
  const aligned = structuredClone(good)
  aligned.wide.rowMisaligned = []
  assert.ok(judgeGate(aligned).every(r => r.pass))
  const skewed = structuredClone(good)
  skewed.wide.rowMisaligned = ['제주관광 전문교·수익 사업·운영 사이트 67px']
  assert.deepEqual(judgeGate(skewed).filter(r => !r.pass).map(r => r.name), ['나란한 칸의 제목 윗선 차이 4px 이하(§5-3)'])
  // 늘려 쓴 사진 — 측정이 없으면 줄을 내지 않고, 1.15배 넘게 늘린 사진이 있으면 불통과
  assert.ok(!judgeGate(good).some(r => /늘려 쓰지/.test(r.name)))
  const sharp = structuredClone(good)
  sharp.wide.upscaled = []
  assert.ok(judgeGate(sharp).every(r => r.pass))
  const blurry = structuredClone(good)
  blurry.wide.upscaled = ['sea-surf.webp 원본 1200×901 → 1440×517 (1.20배)']
  assert.deepEqual(judgeGate(blurry).filter(r => !r.pass).map(r => r.name), ['넓은 사진을 1.15배 넘게 늘려 쓰지 않음(§5-5)'])
  // 가려진 조작 요소 — 측정이 없으면 줄을 내지 않고, 가려져 눌리지 않는 링크·단추가 있으면 불통과
  assert.ok(!judgeGate(good).some(r => /가려져 눌리지/.test(r.name)))
  const open = structuredClone(good)
  open.wide.covered = []
  assert.ok(judgeGate(open).every(r => r.pass))
  const covered = structuredClone(good)
  covered.wide.covered = ['1280 첫 화면 장면 전환 정지', '1024 첫 화면 장면 전환 정지']
  const fail = judgeGate(covered).filter(r => !r.pass)
  assert.deepEqual(fail.map(r => r.name), ['첫 화면에서 가려져 눌리지 않는 링크 · 단추 0(360 · 1024 · 1280 · 1440, R-13 · R-33)'])
  assert.match(fail[0].detail, /2곳 — 1280 첫 화면 장면 전환 정지/)
  // 나란한 판 아랫선 — 측정이 없으면 줄을 내지 않고, 윗선이 같은데 아랫선이 어긋난 판이 있으면 불통과
  assert.ok(!judgeGate(good).some(r => /나란한 판의 아랫선/.test(r.name)))
  const level = structuredClone(good)
  level.wide.panelBottoms = []
  assert.ok(judgeGate(level).every(r => r.pass))
  const stepped = structuredClone(good)
  stepped.wide.panelBottoms = ['알림마당 792×434 · 384×434 바닥 빈 칸 73 · 28px']
  const steppedFail = judgeGate(stepped).filter(r => !r.pass)
  assert.deepEqual(steppedFail.map(r => r.name), ['윗선이 같은 나란한 판의 아랫선 차이 4px · 바닥 빈 칸 차이 16px 이하(§5-3 · §5-8)'])
  assert.match(steppedFail[0].detail, /1곳 — 알림마당 .* 73 · 28px/)
  assert.equal(GATE.panelFill, 16)
  // 한 줄 UI 줄바꿈 — 측정이 없으면 줄을 내지 않고, 꺾인 메뉴 · 탭이 있으면 불통과
  assert.ok(!judgeGate(good).some(r => /한 줄 UI/.test(r.name)))
  const single = structuredClone(good)
  single.wide.wrapped = []
  assert.ok(judgeGate(single).every(r => r.pass))
  const wrapped = structuredClone(good)
  wrapped.wide.wrapped = ['1024 연구원 소개']
  const wrapFail = judgeGate(wrapped).filter(r => !r.pass)
  assert.deepEqual(wrapFail.map(r => r.name), ['한 줄 UI 글자 줄바꿈 0 — 머리글 링크 · 탭 · 더보기 · 단추(360 · 1024 · 1280 · 1440, §5-8)'])
  assert.match(wrapFail[0].detail, /1곳 — 1024 연구원 소개/)
  assert.equal(GATE.panelAlign, 4)
  // 본문 선 밖 글자 — 측정이 없으면 줄을 내지 않고, 본문 선 밖으로 나간 글자가 있으면 불통과(2026-11-24 KIOST 시안 S 1440 +21px · 1920 +164px)
  assert.ok(!judgeGate(good).some(r => /본문 선 밖/.test(r.name)))
  const inside = structuredClone(good)
  inside.wide.outside = []
  assert.ok(judgeGate(inside).every(r => r.pass))
  const outside = structuredClone(good)
  outside.wide.outside = ['1920 이어도 기지 · 11.2 오른쪽 +164px', '1440 이어도 기지 · 11.2 오른쪽 +21px']
  const outFail = judgeGate(outside).filter(r => !r.pass)
  assert.deepEqual(outFail.map(r => r.name), ['본문 선 밖 글자 0곳(360 · 1024 · 1280 · 1440 · 1920, §5-3 · D11)'])
  assert.match(outFail[0].detail, /2곳 — 1920 이어도 기지/)
  assert.equal(GATE.outside, 0)
  // 1920 첫 화면 — 측정이 없으면 설명에 넣지 않고, 다음 섹션이 안 보이면 걸쳐 보임 줄이 불통과(전체 폭 장면을 비율대로 키우면 넓은 화면에서 장면이 화면보다 커진다)
  assert.ok(!judgeGate(good).some(r => /1920×1080/.test(r.detail)))
  const tallXL = structuredClone(good)
  tallXL.wide.peekXL = false
  const xlFail = judgeGate(tallXL).filter(r => !r.pass)
  assert.deepEqual(xlFail.map(r => r.name), ['첫 화면 바닥에 다음 섹션이 걸쳐 보임(user-behavior 3-6)'])
  assert.match(xlFail[0].detail, /1920×1080 안 보임/)
  const fitXL = structuredClone(good)
  fitXL.wide.peekXL = true
  assert.ok(judgeGate(fitXL).every(r => r.pass))
  // 한 칸 안 중복 링크 — 측정이 없으면 줄을 내지 않고, 있으면 불통과
  assert.ok(!judgeGate(good).some(r => /같은 주소 링크/.test(r.name)))
  const dup = structuredClone(good)
  dup.wide.dupLinks = ['비짓제주새 창']
  assert.deepEqual(judgeGate(dup).filter(r => !r.pass).map(r => r.name), ['한 칸 안에 같은 주소 링크 하나(§3-5)'])
  const noH2 = structuredClone(good)
  noH2.wide.sectionHeading = null
  assert.deepEqual(judgeGate(noH2).filter(r => !r.pass).map(r => r.detail), ['h2 없음'])
  assert.equal(GATE.headingRatio, 2.5)
})
