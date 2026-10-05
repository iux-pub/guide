// 카탈로그의 아이콘을 세트에 채택한다 — 스튜디오 화면과 CLI(npm run icons:adopt)가 함께 쓴다.
//
// 채택은 여기서만 한다. 쓰는 곳이 둘이면 번호를 먼저 받는 쪽과 늦게 받는 쪽이 갈려 대장이 어긋난다.
//
// 하는 일 (한 아이콘):
//   1. 이름을 규칙에 대조하고, 이미 있는 아이콘인지 본다
//   2. 네 표정(슬림·레귤러·볼드·필)의 원본을 받아 24 좌표계로 옮긴다  ← import-icons.js와 같은 코드
//   3. 파일을 쓰고, 대장에 번호를 영구히 올리고, 씨앗 지도와 검색어 사전을 갱신한다
// 하지 않는 일: 스프라이트·폰트·CSS 빌드. 저장소로 올리는 쪽(사람 또는 icons:adopt --build)이 한다.
//
// 먼저 받고 마지막에 한꺼번에 쓴다. 중간에 실패해 파일만 반쯤 남는 일을 막는다.

const fs = require('node:fs')
const path = require('node:path')
const source = require('./icon-source')

function pathsOf(root) {
  return {
    contract: path.join(root, 'contracts/icon-contract.json'),
    ledger: path.join(root, 'contracts/icon-codepoints.json'),
    seed: path.join(root, 'contracts/icon-seed-map.json'),
    keywords: path.join(root, 'contracts/icon-keywords.json'),
    svgDir: path.join(root, 'assets/icons/svg'),
    library: path.join(root, 'studio/library/library.json')
  }
}

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'))
const writeJson = (p, v) => fs.writeFileSync(p, JSON.stringify(v, null, 2) + '\n')

/** 카탈로그 색인. 없으면 null (npm run icons:library로 만든다). */
function loadLibrary(root) {
  const p = pathsOf(root).library
  return fs.existsSync(p) ? readJson(p) : null
}

/** 구글 이름 → 세트에서 쓰는 우리 이름. 대장이 정본이다. */
function adoptedMap(ledger) {
  const out = new Map()
  for (const [name, meta] of Object.entries(ledger.icons || {})) {
    if (meta.sourceName) out.set(meta.sourceName, name)
  }
  return out
}

/**
 * 한 아이콘의 네 표정을 받아 규격에 맞춘다. 쓰지는 않는다 — 미리보기와 채택이 같은 코드를 쓴다.
 * 「미리 본 것과 들어온 것이 다르다」가 이 도구에서 가장 나쁜 일이라서다.
 *
 * 기본과 같은 그림은 그 표정이 없는 것이다(돋보기에는 채울 면이 없다). 변형 목록에서 뺀다.
 *
 * @param {object} args
 * @param {string} [args.cacheDir] 있으면 원본을 여기에 두고 다시 쓴다 (미리보기가 같은 걸 여러 번 열 때)
 */
async function fetchExpressions({ material, name, contract, seed, fetchImpl, cacheDir }) {
  const combos = contract.variants.combinations
  const base = combos.find((c) => c.default)
  const fetchOpts = fetchImpl ? { fetchImpl } : {}
  const fetched = new Map()
  const warnings = []

  await Promise.all(
    combos.map(async (combo) => {
      const axis = source.axisFor(contract, seed.source, combo.id)
      const cached = cacheDir ? path.join(cacheDir, material, `${axis}.svg`) : null
      try {
        let raw
        if (cached && fs.existsSync(cached)) {
          raw = fs.readFileSync(cached, 'utf8')
        } else {
          raw = await source.fetchText(source.sourceUrl(seed.source, material, axis), fetchOpts)
          if (cached) {
            fs.mkdirSync(path.dirname(cached), { recursive: true })
            fs.writeFileSync(cached, raw)
          }
        }
        fetched.set(combo.id, source.normalize(raw, name, contract))
      } catch (err) {
        if (combo.default) throw new Error(`기본 표정을 받지 못했습니다 (${material}): ${err.message}`, { cause: err })
        // 다른 표정이 없는 아이콘도 있다 — 경고만 남기고 넘어간다
        warnings.push(`${combo.id}: ${err.message}`)
      }
    })
  )

  const baseResult = fetched.get(base.id)
  const baseHash = source.sha256(baseResult.svg)
  warnings.push(...baseResult.warnings)

  const variants = []
  for (const combo of combos) {
    if (combo.default || !fetched.has(combo.id)) continue
    const r = fetched.get(combo.id)
    if (source.sha256(r.svg) === baseHash) continue
    variants.push({ id: combo.id, svg: r.svg })
  }
  return { base: baseResult, baseHash, variants, warnings }
}

/**
 * 채택한다.
 *
 * @param {object} args
 * @param {string} args.material  구글 이름 (예: shopping_cart)
 * @param {string} [args.name]    우리 이름. 없으면 기본 이름(kebab-case)을 쓴다
 * @param {string} [args.category] 우리 분류 id. 없으면 카탈로그가 알려 주는 분류, 그것도 없으면 domain
 * @param {string[]} [args.keywords] 검색어. 없으면 카탈로그의 한국어 이름과 검색어
 * @param {string} [args.root]    저장소 루트 (시험에서 임시 사본을 가리키게 한다)
 * @param {Function} [args.fetchImpl] fetch 대체 (시험용)
 */
async function adopt({ material, name, category, keywords, root, fetchImpl } = {}) {
  const ROOT = root || path.join(__dirname, '..', '..')
  const P = pathsOf(ROOT)
  if (!/^[a-z0-9_]+$/.test(String(material || ''))) throw new Error(`구글 아이콘 이름이 올바르지 않습니다: ${material}`)

  const contract = readJson(P.contract)
  const ledger = readJson(P.ledger)
  const seed = readJson(P.seed)
  const library = loadLibrary(ROOT)
  const entry = library?.icons.find((i) => i.m === material) || null

  // 1. 이름과 중복
  const given = name ? String(name).trim() : ''
  const finalName = given || source.ourNameFor(material, contract).name
  const issue = source.nameIssue(finalName, contract)
  if (issue) throw new Error(`이름을 정해 주세요 — ${finalName}: ${issue}`)

  const already = adoptedMap(ledger).get(material)
  if (already) throw new Error(`이미 세트에 있습니다: ${already} (${material})`)
  if (ledger.icons[finalName]) throw new Error(`이미 있는 이름입니다: ${finalName} — 다른 이름으로 채택하세요`)
  if (ledger.tombstones && Object.values(ledger.tombstones).some((t) => t && t.name === finalName)) {
    throw new Error(`폐기된 이름입니다: ${finalName} — 번호를 되살리지 않습니다`)
  }

  // 2. 네 표정을 받는다 — 하나라도 기본이 실패하면 아무것도 쓰지 않는다
  const expr = await fetchExpressions({ material, name: finalName, contract, seed, fetchImpl })
  const baseResult = expr.base
  const baseHash = expr.baseHash
  const variantFiles = expr.variants
  const warnings = expr.warnings

  // 3. 쓴다
  const combos = contract.variants.combinations
  fs.mkdirSync(P.svgDir, { recursive: true })
  const written = []
  const baseFile = path.join(P.svgDir, `${finalName}.svg`)
  fs.writeFileSync(baseFile, baseResult.svg)
  written.push(path.relative(ROOT, baseFile))
  for (const v of variantFiles) {
    const dir = path.join(P.svgDir, v.id)
    fs.mkdirSync(dir, { recursive: true })
    const file = path.join(dir, `${finalName}.svg`)
    fs.writeFileSync(file, v.svg)
    written.push(path.relative(ROOT, file))
  }

  // 분류: 지정 > 카탈로그가 아는 것 > domain. 씨앗 지도에 없는 분류는 쓰지 않는다.
  const known = new Set(seed.categories.map((c) => c.id))
  const fromLibrary = library?.categories.find((c) => c.id === entry?.c)?.ours
  const cat = [category, fromLibrary, 'domain'].find((c) => c && known.has(c))

  const codepoint = source.allocateCodepoint(ledger, contract)
  const today = new Date().toISOString().slice(0, 10)
  ledger.icons[finalName] = {
    codepoint,
    category: cat,
    source: seed.source.id,
    sourceName: material,
    license: seed.source.license,
    sha256: baseHash,
    paths: baseResult.pathCount,
    addedAt: today,
    // 계약이 정한 순서를 지킨다 — 파일이 매번 다르게 정렬되면 diff가 시끄럽다
    variants: combos.filter((c) => variantFiles.some((v) => v.id === c.id)).map((c) => c.id)
  }
  if (ledger.icons[finalName].variants.length === 0) delete ledger.icons[finalName].variants
  ledger.nextCodepoint = source.allocateCodepoint(ledger, contract)
  ledger.updatedAt = today
  writeJson(P.ledger, ledger)

  // 씨앗 지도 — 우리 이름 ↔ 원본 이름의 정본이다. 여기 없으면 import --force가 이 아이콘을 모른다
  seed.categories.find((c) => c.id === cat).icons.push({ name: finalName, material })
  writeJson(P.seed, seed)

  // 검색어 — 없으면 채택하자마자 화면에서 안 찾힌다. 카탈로그의 한국어를 그대로 쓴다
  const words = (Array.isArray(keywords) && keywords.length > 0
    ? keywords
    : [entry?.ko, ...(entry?.k || [])]
  )
    .map((w) => String(w || '').trim())
    .filter(Boolean)
  const unique = [...new Set(words.length > 0 ? words : finalName.split('-').filter((s) => s.length >= 2))].slice(0, 10)
  if (fs.existsSync(P.keywords)) {
    const dict = readJson(P.keywords)
    dict.keywords = dict.keywords || {}
    dict.keywords[finalName] = unique
    // 대장 순서를 따른다
    const ordered = {}
    for (const n of Object.keys(ledger.icons)) if (dict.keywords[n]) ordered[n] = dict.keywords[n]
    dict.keywords = ordered
    writeJson(P.keywords, dict)
  }

  return {
    name: finalName,
    material,
    codepoint,
    category: cat,
    variants: ledger.icons[finalName].variants || [],
    keywords: unique,
    files: written,
    warnings
  }
}

module.exports = { adopt, fetchExpressions, loadLibrary, adoptedMap, pathsOf }
