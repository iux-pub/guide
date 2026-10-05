// 아이콘 카탈로그(구글 전량)·검색·채택 검증.
//
// 여기 있는 테스트는 설계에서 「이게 틀리면 조용히 망가진다」고 짚은 자리다.
//   · 이름 규칙은 서버·검사기·카탈로그가 같은 판정을 써야 한다 (한 곳이 어긋나면 채택한 뒤에야 검사에서 걸린다)
//   · 번호는 영구다 — 대장과 tombstone을 모두 피해서 뽑고, 폐기된 이름은 되살리지 않는다
//   · 채택은 먼저 다 받고 마지막에 쓴다 — 받다가 실패했을 때 파일만 반쯤 남지 않는다
//   · 검색은 「돋보기」를 치면 검색 아이콘이 먼저 나와야 한다 (이름이 「돋보기」로 시작하는 낯선 아이콘이 아니라)
//   · 카탈로그의 한국어 이름은 한 칸도 비면 안 된다 — 비면 한국어로는 영영 못 찾는다

const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { test } = require('node:test')
const assert = require('node:assert/strict')

const source = require('../lib/icon-source')
const { search } = require('../lib/icon-search')
const { adopt, adoptedMap } = require('../lib/icon-adopt')

const ROOT = path.resolve(__dirname, '..', '..')
const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'))
const contract = readJson(path.join(ROOT, 'contracts/icon-contract.json'))
const seedMap = readJson(path.join(ROOT, 'contracts/icon-seed-map.json'))

// ── 이름 규칙 ──────────────────────────────────────────

test('규칙을 지킨 이름은 통과한다', () => {
  for (const name of ['search', 'chevron-up', 'add-shopping-cart', 'a1', 'file-4k']) {
    assert.equal(source.nameIssue(name, contract), null, name)
  }
})

test('숫자로 시작하는 이름은 이유를 말한다', () => {
  assert.match(source.nameIssue('4k', contract), /숫자로 시작/)
})

test('금지 단어가 든 이름은 어느 단어인지 말한다', () => {
  const issue = source.nameIssue('big-calendar', contract)
  assert.match(issue, /big/)
  // 시각적 이름은 디자인이 바뀌면 클래스까지 바꿔야 한다 (arrow-blue 문제)
  assert.match(source.nameIssue('arrow-blue', contract), /blue/)
})

test('마디가 너무 많은 이름은 몇 마디인지 말한다', () => {
  assert.match(source.nameIssue('a-b-c-d-e', contract), /5마디/)
})

test('대문자·밑줄은 규칙 위반이다', () => {
  assert.ok(source.nameIssue('Search', contract))
  assert.ok(source.nameIssue('shopping_cart', contract))
})

test('구글 이름의 기본 이름은 밑줄을 붙임표로 바꾼 것이다', () => {
  const r = source.ourNameFor('shopping_cart', contract)
  assert.equal(r.name, 'shopping-cart')
  assert.equal(r.issue, null)
  // 규칙에 어긋나면 이름과 함께 이유를 준다 — 채택 화면이 안내에 쓴다
  assert.ok(source.ourNameFor('open_in_new', contract).issue)
})

test('제안 이름은 금지 단어를 빼고 숫자 시작에는 num-을 붙인다', () => {
  assert.equal(source.suggestName('open_in_new', contract), 'open-in')
  assert.equal(source.suggestName('4k', contract), 'num-4k')
})

test('제안 이름은 언제나 규칙을 지킨다', () => {
  // 제안을 그대로 눌렀는데 또 거절당하면 안 된다
  for (const m of ['open_in_new', '4k', '10mp', '3d_rotation', 'new_releases', 'wb_twilight_big_old_new']) {
    const hint = source.suggestName(m, contract)
    if (hint !== null) assert.equal(source.nameIssue(hint, contract), null, `${m} → ${hint}`)
  }
})

test('제안할 수 없으면 null을 준다', () => {
  // 전부 금지 단어면 남는 마디가 없다
  assert.equal(source.suggestName('new_old_big', contract), null)
})

// ── 번호 ───────────────────────────────────────────────

test('번호는 대장과 tombstone을 모두 피한다', () => {
  const ledger = {
    icons: { a: { codepoint: 'U+E000' }, b: { codepoint: 'U+E001' } },
    tombstones: { 'U+E002': { name: 'gone' } }
  }
  assert.equal(source.allocateCodepoint(ledger, contract), 'U+E003')
})

test('빈 구멍이 있으면 그 번호를 쓴다', () => {
  // 대장이 앞에서부터 차 있지 않아도 겹치지만 않으면 된다
  const ledger = { icons: { a: { codepoint: 'U+E000' }, c: { codepoint: 'U+E002' } }, tombstones: {} }
  assert.equal(source.allocateCodepoint(ledger, contract), 'U+E001')
})

test('영역이 가득 차면 넘치지 않고 멈춘다', () => {
  const tiny = { ...contract, codepoints: { ...contract.codepoints, range: { start: 'U+E000', end: 'U+E001' } } }
  const ledger = { icons: { a: { codepoint: 'U+E000' }, b: { codepoint: 'U+E001' } }, tombstones: {} }
  assert.throws(() => source.allocateCodepoint(ledger, tiny), /가득/)
})

// ── 원본 변환 ──────────────────────────────────────────

/** 구글 원본 꼴(viewBox 0 -960 960 960)의 정사각형. 24 좌표로 옮기면 x·y 모두 5~19다. */
const googleSvg = (d = 'M200-200h560v-560H200Z') =>
  `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="${d}"/></svg>`

test('960 좌표를 24 좌표로 옮기고 이름을 단다', () => {
  const r = source.normalize(googleSvg(), 'box', contract)
  assert.match(r.svg, /viewBox="0 0 24 24"/)
  assert.match(r.svg, /data-icon="box"/)
  assert.match(r.svg, /fill="currentColor"/)
  assert.equal(r.pathCount, 1)
  assert.deepEqual(r.warnings, [])
})

test('캔버스를 벗어나는 그림은 조용히 통과시키지 않는다', () => {
  assert.throws(() => source.normalize(googleSvg('M-2000-200h560v-560H-2000Z'), 'box', contract), /벗어남/)
})

test('라이브 영역을 살짝 넘는 것은 경고만 한다', () => {
  // 자물쇠·눈처럼 형태에 따라 정상일 수 있다
  // x 0.5~23.5: 라이브 영역(2~22)은 넘고 캔버스(0~24)는 넘지 않는다
  const r = source.normalize(googleSvg('M20-200h920v-560H20Z'), 'wide', contract)
  assert.ok(r.warnings.some((w) => /라이브 영역/.test(w)))
})

test('정사각형이 아니거나 path가 없으면 거절한다', () => {
  assert.throws(() => source.normalize('<svg viewBox="0 0 960 480"><path d="M0 0h1v1Z"/></svg>', 'x', contract), /정사각형/)
  assert.throws(() => source.normalize('<svg viewBox="0 -960 960 960"></svg>', 'x', contract), /path 없음/)
  assert.throws(() => source.normalize('<svg><path d="M0 0"/></svg>', 'x', contract), /viewBox/)
})

test('내려받기는 5xx만 다시 하고 404는 바로 던진다', async () => {
  let calls = 0
  const notFound = async () => { calls += 1; return { ok: false, status: 404, text: async () => '' } }
  await assert.rejects(source.fetchText('u', { retries: 3, fetchImpl: notFound }), /404/)
  assert.equal(calls, 1, '404는 다시 해도 같다')

  let n = 0
  const flaky = async () => {
    n += 1
    return n < 3 ? { ok: false, status: 503, text: async () => '' } : { ok: true, status: 200, text: async () => 'ok' }
  }
  assert.equal(await source.fetchText('u', { retries: 3, fetchImpl: flaky }), 'ok')
  assert.equal(n, 3)
})

// ── 검색 ───────────────────────────────────────────────

const lib = {
  categories: [{ id: 'actions', label: '동작' }, { id: 'maps', label: '지도·장소' }],
  icons: [
    // 이름이 「돋보기」로 시작하지만 아무도 안 쓰는 것
    { m: 'magnify_docked', n: 'magnify-docked', c: 'actions', p: 20, ko: '돋보기 도킹', k: ['도킹'], t: ['dock'] },
    // 사람들이 「돋보기」로 찾는 진짜 — 검색어 사전에서 정확히 맞는다
    { m: 'search', n: 'search', c: 'actions', p: 184217, ko: '검색', k: ['찾기', '돋보기'], t: ['find', 'magnifier', 'look'] },
    { m: 'shopping_cart', n: 'shopping-cart', c: 'actions', p: 90000, ko: '장바구니', k: ['카트', '쇼핑'], t: ['purchase', 'buy'] },
    { m: 'shopping_cart_checkout', n: 'shopping-cart-checkout', c: 'actions', p: 70000, ko: '장바구니 결제', k: ['결제'], t: ['purchase'] },
    { m: 'map', n: 'map', c: 'maps', p: 50000, ko: '지도', k: ['위치'], t: ['navigation'] },
    { m: 'sitemap_like', n: 'sitemap-like', c: 'maps', p: 1, ko: '', k: [], t: [] }
  ]
}

const names = (rows) => rows.map((r) => r.icon.m)

test('정확히 맞은 한국어 이름이 맨 위다', () => {
  assert.equal(names(search(lib, '장바구니'))[0], 'shopping_cart')
})

test('같은 정도로 맞으면 많이 쓰는 쪽이 앞이다', () => {
  // 「돋보기 도킹」은 이름이 시작해서, 검색은 검색어 사전에서 정확히 맞아서 걸린다. 둘은 같은 등급이다
  assert.deepEqual(names(search(lib, '돋보기')), ['search', 'magnify_docked'])
})

test('등급이 다르면 인기와 상관없이 정확히 맞은 쪽이 앞이다', () => {
  // 「장바구니 결제」(인기 7만)가 「장바구니」(9만)를 뒤집지 못해야 하고, 인기가 낮아도 정확한 쪽이 위여야 한다
  const low = { ...lib, icons: lib.icons.map((i) => (i.m === 'shopping_cart' ? { ...i, p: 1 } : i)) }
  assert.equal(names(search(low, '장바구니'))[0], 'shopping_cart')
})

test('띄어 쓴 말은 모두 걸려야 한다', () => {
  assert.deepEqual(names(search(lib, '장바구니 결제')), ['shopping_cart_checkout'])
  assert.deepEqual(search(lib, '장바구니 지도'), [])
})

test('영어 태그로도 찾는다', () => {
  assert.deepEqual(names(search(lib, 'purchase')).sort(), ['shopping_cart', 'shopping_cart_checkout'])
})

test('구글 이름과 우리 이름 둘 다로 찾는다', () => {
  assert.equal(names(search(lib, 'shopping-cart'))[0], 'shopping_cart')
  assert.equal(names(search(lib, 'shopping_cart'))[0], 'shopping_cart')
})

test('「아이콘」이라는 말은 아무것도 가르지 않는다', () => {
  // 구글 태그에는 「find icon」처럼 icon이 박힌 것이 많아 「cart icon」이 엉뚱한 것을 끌어온다
  assert.deepEqual(names(search(lib, '장바구니 아이콘')), names(search(lib, '장바구니')))
  assert.deepEqual(names(search(lib, 'cart icon')), names(search(lib, 'cart')))
})

test('분류와 범위로 좁힌다', () => {
  assert.deepEqual(names(search(lib, '', { category: 'maps' })).sort(), ['map', 'sitemap_like'])
  assert.deepEqual(names(search(lib, '', { only: new Set(['map']) })), ['map'])
})

test('빈 검색어는 인기순으로 전부 준다', () => {
  const all = search(lib, '')
  assert.equal(all.length, lib.icons.length)
})

test('limit이 결과 수를 자른다', () => {
  assert.equal(search(lib, '', { limit: 2 }).length, 2)
})

// ── 채택 ───────────────────────────────────────────────

/** 실제 계약·대장·씨앗을 임시 폴더에 옮겨 쓴다. 진짜 저장소를 건드리지 않는다. */
function makeRoot(extraLedger = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'icon-adopt-'))
  fs.mkdirSync(path.join(root, 'contracts'), { recursive: true })
  fs.mkdirSync(path.join(root, 'studio/library'), { recursive: true })
  fs.mkdirSync(path.join(root, 'assets/icons/svg'), { recursive: true })
  for (const f of ['icon-contract.json', 'icon-codepoints.json', 'icon-seed-map.json', 'icon-keywords.json']) {
    fs.copyFileSync(path.join(ROOT, 'contracts', f), path.join(root, 'contracts', f))
  }
  fs.writeFileSync(
    path.join(root, 'studio/library/library.json'),
    JSON.stringify({
      categories: [{ id: 'business', label: '비즈니스', ours: 'domain' }],
      icons: [
        { m: 'shopping_cart', n: 'shopping-cart', c: 'business', p: 9, ko: '장바구니', k: ['카트', '쇼핑'], t: [] },
        { m: 'new_releases', n: null, x: '쓸 수 없는 단어가 있습니다: new', s: 'releases', c: 'business', p: 8, ko: '새 소식', k: [], t: [] }
      ]
    })
  )
  if (Object.keys(extraLedger).length > 0) {
    const p = path.join(root, 'contracts/icon-codepoints.json')
    const ledger = readJson(p)
    Object.assign(ledger, extraLedger)
    fs.writeFileSync(p, JSON.stringify(ledger, null, 2))
  }
  return root
}

/**
 * 구글 주소를 흉내 낸다. 축마다 다른 모양을 돌려 표정이 갈리는지 볼 수 있다.
 * same에 든 축은 기본(wght300)과 같은 그림 — 돋보기처럼 채울 면이 없는 형태의 모양이다.
 */
function fakeFetch({ fail = [], same = [] } = {}) {
  return async (url) => {
    const axis = url.split('/').slice(-2)[0]
    if (fail.includes(axis)) return { ok: false, status: 404, text: async () => '' }
    const base = 'M200-200h560v-560H200Z'
    const shape = {
      wght300: base,
      wght200: 'M240-240h480v-480H240Z',
      default: 'M180-180h600v-600H180Z',
      wght300fill1: 'M200-200h560v-560H200Z M300-300h360v-360H300Z'
    }
    const d = same.includes(axis) ? base : shape[axis]
    return { ok: true, status: 200, text: async () => googleSvg(d) }
  }
}

const snapshot = (root) => {
  const out = {}
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name)
      if (e.isDirectory()) walk(p)
      else out[path.relative(root, p)] = fs.readFileSync(p, 'utf8')
    }
  }
  walk(root)
  return out
}

test('채택하면 파일·대장·씨앗 지도·검색어가 한꺼번에 들어간다', async () => {
  const root = makeRoot()
  const before = readJson(path.join(root, 'contracts/icon-codepoints.json'))
  const r = await adopt({ material: 'shopping_cart', root, fetchImpl: fakeFetch() })

  assert.equal(r.name, 'shopping-cart')
  assert.equal(r.category, 'domain', '카탈로그의 분류 사상이 기본이다')
  assert.deepEqual(r.variants, ['slim', 'bold', 'fill'])

  // 파일 — 기본과 표정별 폴더
  for (const f of ['shopping-cart.svg', 'slim/shopping-cart.svg', 'bold/shopping-cart.svg', 'fill/shopping-cart.svg']) {
    assert.ok(fs.existsSync(path.join(root, 'assets/icons/svg', f)), f)
  }

  // 대장 — 번호는 기존 것과 겹치지 않고, 구글 이름이 이어진다
  const ledger = readJson(path.join(root, 'contracts/icon-codepoints.json'))
  const entry = ledger.icons['shopping-cart']
  assert.equal(entry.sourceName, 'shopping_cart')
  assert.equal(entry.source, seedMap.source.id)
  assert.equal(entry.license, seedMap.source.license)
  assert.deepEqual(entry.variants, ['slim', 'bold', 'fill'], '계약이 정한 순서를 지킨다')
  const used = Object.values(before.icons).map((i) => i.codepoint)
  assert.ok(!used.includes(entry.codepoint), '기존 번호와 겹치면 납품한 사이트의 아이콘이 바뀐다')
  assert.equal(adoptedMap(ledger).get('shopping_cart'), 'shopping-cart')

  // 씨앗 지도 — 없으면 import --force가 이 아이콘을 모른다
  const seed = readJson(path.join(root, 'contracts/icon-seed-map.json'))
  const inSeed = seed.categories.find((c) => c.id === 'domain').icons.find((i) => i.name === 'shopping-cart')
  assert.equal(inSeed.material, 'shopping_cart')

  // 검색어 — 카탈로그의 한국어를 그대로 쓴다. 없으면 채택하자마자 화면에서 안 찾힌다
  const kw = readJson(path.join(root, 'contracts/icon-keywords.json')).keywords['shopping-cart']
  assert.deepEqual(kw.slice(0, 3), ['장바구니', '카트', '쇼핑'])
})

test('기본과 같은 표정은 만들지 않는다', async () => {
  // 돋보기처럼 채울 면이 없는 형태는 구글이 기본과 같은 파일을 준다
  const root = makeRoot()
  const r = await adopt({ material: 'shopping_cart', root, fetchImpl: fakeFetch({ same: ['wght300fill1'] }) })
  assert.deepEqual(r.variants, ['slim', 'bold'])
  assert.ok(!fs.existsSync(path.join(root, 'assets/icons/svg/fill/shopping-cart.svg')))
  const entry = readJson(path.join(root, 'contracts/icon-codepoints.json')).icons['shopping-cart']
  assert.ok(!entry.variants.includes('fill'))
})

test('다른 표정을 못 받아도 기본이 있으면 채택한다', async () => {
  const root = makeRoot()
  const r = await adopt({ material: 'shopping_cart', root, fetchImpl: fakeFetch({ fail: ['wght200'] }) })
  assert.ok(!r.variants.includes('slim'))
  assert.ok(r.warnings.some((w) => /slim/.test(w)), '못 받았다는 말은 남긴다')
})

test('기본을 못 받으면 아무것도 쓰지 않는다', async () => {
  const root = makeRoot()
  const before = snapshot(root)
  await assert.rejects(adopt({ material: 'shopping_cart', root, fetchImpl: fakeFetch({ fail: ['wght300'] }) }), /기본 표정/)
  assert.deepEqual(snapshot(root), before, '파일만 반쯤 남으면 대장과 어긋난다')
})

test('이름 규칙에 어긋나면 거절하고 제안을 되돌려 줄 수 있다', async () => {
  const root = makeRoot()
  const before = snapshot(root)
  await assert.rejects(adopt({ material: 'new_releases', root, fetchImpl: fakeFetch() }), /이름을 정해/)
  assert.deepEqual(snapshot(root), before)

  // 제안을 그대로 쓰면 통과한다
  const r = await adopt({ material: 'new_releases', name: 'releases', root, fetchImpl: fakeFetch() })
  assert.equal(r.name, 'releases')
})

test('같은 아이콘을 두 번 채택하지 못한다', async () => {
  const root = makeRoot()
  await adopt({ material: 'shopping_cart', root, fetchImpl: fakeFetch() })
  // 이름을 바꿔도 같은 원본이면 거절한다 — 같은 그림이 번호 둘로 갈린다
  await assert.rejects(adopt({ material: 'shopping_cart', name: 'cart-two', root, fetchImpl: fakeFetch() }), /이미 세트에 있습니다/)
})

test('이미 있는 이름으로는 채택하지 못한다', async () => {
  const root = makeRoot()
  await assert.rejects(adopt({ material: 'shopping_cart', name: 'search', root, fetchImpl: fakeFetch() }), /이미 있는 이름/)
})

test('폐기된 이름은 되살리지 않는다', async () => {
  const root = makeRoot({ tombstones: { 'U+E100': { name: 'shopping-cart', reason: '시험' } } })
  await assert.rejects(adopt({ material: 'shopping_cart', root, fetchImpl: fakeFetch() }), /폐기된 이름/)
})

test('폐기된 번호는 새 아이콘이 가져가지 않는다', async () => {
  const root = makeRoot()
  const first = readJson(path.join(root, 'contracts/icon-codepoints.json'))
  const free = source.allocateCodepoint(first, contract)
  const ledger = { ...first, tombstones: { [free]: { name: 'gone' } } }
  fs.writeFileSync(path.join(root, 'contracts/icon-codepoints.json'), JSON.stringify(ledger, null, 2))

  const r = await adopt({ material: 'shopping_cart', root, fetchImpl: fakeFetch() })
  assert.notEqual(r.codepoint, free, '폐기한 번호를 다시 쓰면 옛 납품물이 다른 그림으로 바뀐다')
})

test('구글 이름이 이상하면 받으러 가지 않는다', async () => {
  const root = makeRoot()
  let called = false
  const spy = async () => { called = true; return { ok: true, status: 200, text: async () => '' } }
  await assert.rejects(adopt({ material: '../etc/passwd', root, fetchImpl: spy }), /올바르지 않/)
  assert.equal(called, false)
})

test('분류를 지정하되 씨앗 지도에 없는 분류는 쓰지 않는다', async () => {
  const root = makeRoot()
  const ok = await adopt({ material: 'shopping_cart', category: 'action', root, fetchImpl: fakeFetch() })
  assert.equal(ok.category, 'action')

  const root2 = makeRoot()
  const fallback = await adopt({ material: 'shopping_cart', category: 'no-such-category', root: root2, fetchImpl: fakeFetch() })
  assert.equal(fallback.category, 'domain', '엉뚱한 분류가 대장에 들어가면 화면의 묶음이 깨진다')
})

test('직접 정한 검색어가 카탈로그의 것보다 먼저다', async () => {
  const root = makeRoot()
  await adopt({ material: 'shopping_cart', keywords: ['쇼핑카트', '담기'], root, fetchImpl: fakeFetch() })
  const kw = readJson(path.join(root, 'contracts/icon-keywords.json')).keywords['shopping-cart']
  assert.deepEqual(kw, ['쇼핑카트', '담기'])
})

// ── 실제 색인 ──────────────────────────────────────────

const libraryPath = path.join(ROOT, 'studio/library/library.json')
const realLibrary = fs.existsSync(libraryPath) ? readJson(libraryPath) : null

test('카탈로그는 한 줄도 한국어가 비지 않는다', { skip: !realLibrary }, () => {
  // 비면 한국어로는 영영 못 찾는다. 새로 만들 때 한국어 사전이 빠졌다는 신호다
  const empty = realLibrary.icons.filter((i) => !i.ko).map((i) => i.m)
  assert.deepEqual(empty.slice(0, 10), [], `한국어 이름이 없는 아이콘 ${empty.length}종`)

  const thin = realLibrary.icons.filter((i) => i.k.length < 4).map((i) => i.m)
  assert.deepEqual(thin.slice(0, 10), [], `검색어가 4개 미만인 아이콘 ${thin.length}종`)
})

test('카탈로그에 같은 아이콘이 두 번 들어 있지 않다', { skip: !realLibrary }, () => {
  const seen = new Set()
  for (const i of realLibrary.icons) {
    assert.ok(!seen.has(i.m), `중복: ${i.m}`)
    seen.add(i.m)
  }
})

test('세트의 구글 아이콘은 모두 카탈로그에 있다', { skip: !realLibrary }, () => {
  // 채택은 카탈로그에서 하므로, 세트에 있는데 카탈로그에 없으면 미리보기·검색이 그 아이콘을 모른다
  const ledger = readJson(path.join(ROOT, 'contracts/icon-codepoints.json'))
  const inLibrary = new Set(realLibrary.icons.map((i) => i.m))
  const missing = Object.values(ledger.icons).filter((m) => m.sourceName && !inLibrary.has(m.sourceName)).map((m) => m.sourceName)
  assert.deepEqual(missing, [])
})

test('카탈로그의 이름 제안은 규칙을 지킨다', { skip: !realLibrary }, () => {
  // 제안을 눌렀는데 또 거절당하면 쓰는 사람은 규칙이 아니라 도구를 의심한다
  const bad = realLibrary.icons
    .filter((i) => i.s && source.nameIssue(i.s, contract))
    .map((i) => `${i.m} → ${i.s}`)
  assert.deepEqual(bad.slice(0, 10), [])
  // 규칙을 어기는 이름에는 이유가 붙어 있고, 지킨 이름에는 이유가 없다
  for (const i of realLibrary.icons) {
    if (i.n === null) assert.ok(i.x, `${i.m}: 이름이 없는데 이유도 없다`)
    else assert.equal(source.nameIssue(i.n, contract), i.x ? i.x : null, `${i.m}`)
  }
})

test('카탈로그 분류는 모두 채택 분류에 이어진다', { skip: !realLibrary }, () => {
  const ours = new Set(seedMap.categories.map((c) => c.id))
  for (const c of realLibrary.categories) assert.ok(ours.has(c.ours), `${c.id} → ${c.ours}`)
  const ids = new Set(realLibrary.categories.map((c) => c.id))
  for (const i of realLibrary.icons) assert.ok(ids.has(i.c), `${i.m}의 분류 ${i.c}`)
})

test('MCP가 싣는 검색 코드는 정본과 같다', () => {
  const a = fs.readFileSync(path.join(ROOT, 'scripts/lib/icon-search.js'), 'utf8')
  const b = fs.readFileSync(path.join(ROOT, 'mcp/bin/icon-search.js'), 'utf8')
  assert.equal(b, a, 'AI가 찾는 결과와 사람이 스튜디오에서 찾는 결과가 달라진다 — npm run build:mcp')
})
