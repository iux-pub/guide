#!/usr/bin/env node
// 아이콘 카탈로그 빌드 — 구글 Material Symbols 전량의 검색 색인과 미리보기 스프라이트.
//
// 카탈로그와 세트는 다르다.
//   카탈로그  구글이 내는 아이콘 전체. 찾고 미리 보는 용도. 번호(코드포인트)가 없다.
//   세트      우리가 채택한 아이콘. 대장(icon-codepoints.json)에 올라 번호가 영구히 붙는다.
// 전량을 대장에 올리면 스프라이트·폰트·CSS·스타터가 쓰지도 않는 아이콘만큼 커진다.
// 그래서 전량은 여기서 색인과 미리보기로만 두고, 필요한 것만 채택(adopt)한다.
//
// 산출물:
//   studio/library/library.json        색인 — 이름·분류·인기도·한국어 이름과 검색어·영문 태그
//   studio/public/library/sprite.svg   미리보기(레귤러, 24 좌표계). 화면이 <use>로 그린다
// 입력:
//   studio/library/ko.json             한국어 이름과 검색어 (사람이 검수하는 정본)
//   contracts/icon-keywords.json       세트에 있는 아이콘의 수작업 검색어 — 있으면 앞에 둔다
//   contracts/icon-codepoints.json     세트에 있는 아이콘 — 우리 이름을 색인에 싣는다
//   구글 메타데이터(태그·분류·인기도)와 원본 SVG — .cache/icon-library/ 에 받아 둔다
//   세트에 있는데 구글 목록에서 빠진 옛 이름(place)도 한 줄로 싣는다 — 그래야 「세트에 있음」이 맞게 뜬다
//
// 사용법:  node scripts/build-icon-library.js [--refresh]
//          --refresh  캐시를 버리고 메타데이터와 SVG를 다시 받는다

const fs = require('node:fs')
const path = require('node:path')
const source = require('./lib/icon-source')

const ROOT = path.join(__dirname, '..')
const CONTRACT = path.join(ROOT, 'contracts/icon-contract.json')
const SEED_MAP = path.join(ROOT, 'contracts/icon-seed-map.json')
const LEDGER = path.join(ROOT, 'contracts/icon-codepoints.json')
const KEYWORDS = path.join(ROOT, 'contracts/icon-keywords.json')
const KO = path.join(ROOT, 'studio/library/ko.json')
const OUT_INDEX = path.join(ROOT, 'studio/library/library.json')
const OUT_SPRITE = path.join(ROOT, 'studio/public/library/sprite.svg')
const SVG_DIR = path.join(ROOT, 'assets/icons/svg')
const CACHE = path.join(ROOT, '.cache/icon-library')

const META_URL = 'https://fonts.google.com/metadata/icons?incomplete=true&icon.set=Material+Symbols'
const FAMILY = 'Material Symbols Outlined'
const REFRESH = process.argv.includes('--refresh')
const CONCURRENCY = 24

const contract = JSON.parse(fs.readFileSync(CONTRACT, 'utf8'))
const seed = JSON.parse(fs.readFileSync(SEED_MAP, 'utf8'))

/**
 * 구글 분류 → 한국어 이름, 그리고 채택할 때 대장에 적을 우리 분류.
 * 구글 분류는 18개라 훑어보기에 알맞고, 우리 분류(8개)는 세트를 묶는 단위다. 둘은 다르다.
 */
const CATEGORIES = [
  { google: 'UI actions', id: 'ui-actions', label: 'UI 동작', ours: 'action' },
  { google: 'Actions', id: 'actions', label: '동작', ours: 'action' },
  { google: 'Text', id: 'text', label: '텍스트·서식', ours: 'content' },
  { google: 'Images', id: 'images', label: '이미지·사진', ours: 'media' },
  { google: 'Audio&Video', id: 'audio-video', label: '오디오·비디오', ours: 'media' },
  { google: 'Social', id: 'social', label: '소셜·사람', ours: 'identity' },
  { google: 'Communicate', id: 'communicate', label: '소통·연락', ours: 'identity' },
  { google: 'Brand', id: 'brand', label: '브랜드', ours: 'identity' },
  { google: 'Business', id: 'business', label: '비즈니스·업무', ours: 'domain' },
  { google: 'Maps', id: 'maps', label: '지도·장소', ours: 'domain' },
  { google: 'Transit', id: 'transit', label: '교통', ours: 'domain' },
  { google: 'Travel', id: 'travel', label: '여행·관광', ours: 'domain' },
  { google: 'Home', id: 'home', label: '집·건물', ours: 'domain' },
  { google: 'Household', id: 'household', label: '생활용품', ours: 'domain' },
  { google: 'Activities', id: 'activities', label: '활동·스포츠', ours: 'domain' },
  { google: 'Hardware', id: 'hardware', label: '기기·하드웨어', ours: 'domain' },
  { google: 'Android', id: 'android', label: '기기 상태', ours: 'status' },
  { google: 'Privacy', id: 'privacy', label: '보안·개인정보', ours: 'status' }
]
// 구글 메타데이터는 분류 이름의 대소문자가 일정하지 않다(Maps / maps) — 소문자로 맞춰 찾는다
const CATEGORY_BY_GOOGLE = new Map(CATEGORIES.map((c) => [c.google.toLowerCase(), c]))

// ── 입력 ───────────────────────────────────────────────

async function loadMetadata() {
  const file = path.join(CACHE, 'metadata.json')
  if (!REFRESH && fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf8'))

  console.log('구글 메타데이터를 받는다…')
  const raw = await source.fetchText(META_URL)
  // 응답 앞에 )]}' 줄이 붙어 있다 (JSON 하이재킹 방지용 접두)
  const data = JSON.parse(raw.slice(raw.indexOf('\n') + 1))
  fs.mkdirSync(CACHE, { recursive: true })
  fs.writeFileSync(file, JSON.stringify(data))
  return data
}

/** 레귤러(wght300) 원본 SVG를 받아 둔다. 이미 있으면 다시 받지 않는다. */
async function loadRaw(material) {
  const file = path.join(CACHE, 'svg', `${material}.svg`)
  if (!REFRESH && fs.existsSync(file)) return fs.readFileSync(file, 'utf8')
  const axis = source.axisFor(contract, seed.source, 'regular')
  const raw = await source.fetchText(source.sourceUrl(seed.source, material, axis))
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, raw)
  return raw
}

/** 동시에 n개씩 돌린다. 한 건의 실패가 전체를 멈추지 않게 결과를 모아서 돌려준다. */
async function pool(items, limit, run) {
  const results = new Array(items.length)
  let next = 0
  async function worker() {
    for (;;) {
      const i = next++
      if (i >= items.length) return
      try {
        results[i] = { ok: true, value: await run(items[i], i) }
      } catch (err) {
        results[i] = { ok: false, error: err }
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker))
  return results
}

// ── 본작업 ─────────────────────────────────────────────

async function main() {
  const meta = await loadMetadata()
  const listed = meta.icons.filter((i) => !(i.unsupported_families || []).includes(FAMILY))
  console.log(`${FAMILY} ${listed.length}종`)

  const ko = fs.existsSync(KO) ? JSON.parse(fs.readFileSync(KO, 'utf8')) : {}
  console.log(`한국어 사전 ${Object.keys(ko).length}종`)

  // 세트에 이미 있는 아이콘은 우리 이름과 수작업 검색어를 얹는다. 팀이 손으로 고른 말이 먼저다.
  const ledger = JSON.parse(fs.readFileSync(LEDGER, 'utf8'))
  const handKeywords = fs.existsSync(KEYWORDS) ? JSON.parse(fs.readFileSync(KEYWORDS, 'utf8')).keywords || {} : {}
  const ourName = new Map(
    Object.entries(ledger.icons).filter(([, m]) => m.sourceName).map(([name, m]) => [m.sourceName, name])
  )

  // 세트에는 있는데 구글 목록에 없는 것. 구글이 이름을 바꾸거나 목록에서 뺐지만 주소는 아직 살아 있는 옛 이름이다
  // (place → location_on). 빼 버리면 map-pin이 「세트에 있음」으로 안 뜨고 같은 그림이 번호 둘로 갈려 들어올 수 있다.
  const listedNames = new Set(listed.map((i) => i.name))
  const byName = new Map(meta.icons.map((i) => [i.name, i]))
  const extras = [...ourName.keys()]
    .filter((m) => !listedNames.has(m))
    .map((m) => byName.get(m) || { name: m, popularity: 0, categories: [], tags: [] })
  if (extras.length > 0) console.log(`구글 목록 밖 세트 아이콘 ${extras.length}종 — ${extras.map((e) => e.name).join(', ')}`)

  const supported = [...listed, ...extras]
  supported.sort((a, b) => b.popularity - a.popularity || a.name.localeCompare(b.name))

  // 원본 SVG를 받아 24 좌표로 옮긴다
  let done = 0
  const started = Date.now()
  const fetched = await pool(supported, CONCURRENCY, async (icon) => {
    done += 1
    if (done % 500 === 0) process.stdout.write(`  ${done}/${supported.length} (${Math.round((Date.now() - started) / 1000)}초)\n`)
    try {
      const raw = await loadRaw(icon.name)
      const { svg, warnings } = source.normalize(raw, icon.name, contract)
      return { svg, warnings }
    } catch (err) {
      // 목록 밖 옛 이름은 원본이 사라질 수 있다 — 세트에 이미 들인 그림을 그대로 쓴다
      const own = !listedNames.has(icon.name) && ourName.get(icon.name)
      const file = own && path.join(SVG_DIR, `${own}.svg`)
      if (file && fs.existsSync(file)) return { svg: fs.readFileSync(file, 'utf8'), warnings: [] }
      throw err
    }
  })

  const failed = []
  const symbols = []
  const icons = []
  const rule = contract.output?.fillRule
  const canvas = contract.canvas.width

  supported.forEach((g, i) => {
    const r = fetched[i]
    if (!r.ok) {
      failed.push({ name: g.name, reason: r.error.message })
      return
    }
    const paths = [...r.value.svg.matchAll(/<path d="([^"]+)"/g)].map((m) => `<path d="${m[1]}"/>`).join('')
    symbols.push(`<symbol id="${g.name}" viewBox="0 0 ${canvas} ${canvas}"${rule ? ` fill-rule="${rule}"` : ''}>${paths}</symbol>`)

    const cat = CATEGORY_BY_GOOGLE.get(String((g.categories || [])[0] || '').toLowerCase()) || CATEGORIES[0]
    const mine = ourName.get(g.name)
    const { name, issue } = source.ourNameFor(g.name, contract)
    // 이미 채택했으면 이름 규칙 안내는 필요 없다 — 대장의 이름이 곧 이름이다
    const hint = !mine && issue ? source.suggestName(g.name, contract) : null
    const kr = ko[g.name] || {}
    const hand = mine ? handKeywords[mine] || [] : []

    const row = {
      m: g.name,
      n: mine || (issue ? null : name),
      ...(!mine && issue ? { x: issue } : {}),
      ...(hint ? { s: hint } : {}),
      c: cat.id,
      p: g.popularity,
      ko: kr.ko || '',
      k: [...new Set([...hand, ...(kr.k || [])])],
      t: [...new Set((g.tags || []).map((t) => String(t).toLowerCase()))].sort()
    }
    icons.push(row)
  })

  // 미리보기 스프라이트
  fs.mkdirSync(path.dirname(OUT_SPRITE), { recursive: true })
  fs.writeFileSync(
    OUT_SPRITE,
    `<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="position:absolute;width:0;height:0;overflow:hidden">\n` +
      symbols.join('\n') +
      '\n</svg>\n'
  )

  // 색인 — 아이콘 한 줄에 하나라 diff가 읽힌다
  const index =
    '{\n' +
    `  "name": "infoUX Icon Library",\n` +
    `  "version": "1.0.0",\n` +
    `  "policy": "구글 Material Symbols 전량의 검색 색인이다. 번호(코드포인트)가 없다 — 채택(adopt)해야 대장에 올라 번호가 붙는다. 한국어 이름·검색어의 정본은 studio/library/ko.json이고, 이 파일은 scripts/build-icon-library.js가 만든다. 직접 고치지 않는다.",\n` +
    `  "source": ${JSON.stringify({
      id: seed.source.id,
      license: seed.source.license,
      family: FAMILY,
      metadata: 'fonts.google.com/metadata/icons',
      generatedAt: new Date().toISOString().slice(0, 10),
      count: icons.length
    })},\n` +
    `  "categories": ${JSON.stringify(CATEGORIES.map(({ id, label, ours, google }) => ({ id, label, ours, google })))},\n` +
    '  "icons": [\n' +
    icons.map((r) => '    ' + JSON.stringify(r)).join(',\n') +
    '\n  ]\n}\n'
  fs.mkdirSync(path.dirname(OUT_INDEX), { recursive: true })
  fs.writeFileSync(OUT_INDEX, index)

  // 보고
  const noKo = icons.filter((r) => !r.ko).length
  const issues = icons.filter((r) => r.x)
  const kb = (p) => Math.round(fs.statSync(p).size / 1024)
  console.log('\n── 결과 ──')
  console.log(`  색인 ${icons.length}종 (${kb(OUT_INDEX)}KB) · 스프라이트 ${kb(OUT_SPRITE)}KB`)
  console.log(`  한국어 없음 ${noKo}종 · 이름 규칙에 어긋나 직접 지어야 하는 것 ${issues.length}종`)
  if (failed.length > 0) {
    console.log(`  ✗ 받지 못한 것 ${failed.length}종`)
    for (const f of failed.slice(0, 20)) console.log(`    ${f.name}: ${f.reason}`)
  }
  // 1% 넘게 못 받았으면 색인이 믿을 수 없다 — 실패로 끝낸다
  if (failed.length > supported.length * 0.01) process.exitCode = 1
}

main().catch((err) => {
  console.error('실패:', err.message)
  process.exit(1)
})
