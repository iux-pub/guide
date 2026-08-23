#!/usr/bin/env node
// 아이콘 스튜디오 — 로컬 서버.
//
// 디자이너가 브라우저만 열면 되도록 만든다. 터미널·git·npm이 화면에 나오지 않는다.
//
// 왜 서버가 필요한가: 아이콘을 승인하면 파일을 쓰고 대장을 갱신해야 한다.
// 브라우저 혼자서는 못 한다. 그 외에는 정적 파일 서빙과 얇은 API가 전부다.
//
// 왜 의존성이 없는가: 이건 사내 운영 도구다. 프레임워크를 얹으면 그것부터
// 관리 대상이 된다. node 기본 모듈로 충분한 규모다.
//
// 실행:  npm run studio        (기본 4700 포트)
//        PORT=4800 npm run studio

import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(HERE, '..')
const PUBLIC = path.join(HERE, 'public')
const QUEUE = path.join(HERE, 'queue')
const SVG_DIR = path.join(ROOT, 'assets/icons/svg')
const OUT_ICONS = path.join(ROOT, 'assets/icons')
const LEDGER = path.join(ROOT, 'contracts/icon-codepoints.json')
const CONTRACT = path.join(ROOT, 'contracts/icon-contract.json')
const SEED_MAP = path.join(ROOT, 'contracts/icon-seed-map.json')

const PORT = Number(process.env.PORT || 4700)
// 기본은 이 기계에서만 열린다. 사내 서버에 올려 팀이 함께 볼 때만 HOST=0.0.0.0을 준다.
// 스튜디오에는 로그인이 없다 — 열어 둔 곳에서는 누구나 아이콘을 만들고 승인할 수 있다.
const HOST = process.env.HOST || '127.0.0.1'

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.woff2': 'font/woff2'
}

const readJson = (p, fallback = null) => {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'))
  } catch {
    return fallback
  }
}

const json = (res, code, body) => {
  const s = JSON.stringify(body)
  res.writeHead(code, { 'content-type': MIME['.json'], 'content-length': Buffer.byteLength(s) })
  res.end(s)
}

const readBody = (req) =>
  new Promise((resolve, reject) => {
    let acc = ''
    req.on('data', (c) => {
      acc += c
      if (acc.length > 2_000_000) reject(new Error('요청이 너무 큽니다'))
    })
    req.on('end', () => {
      try {
        resolve(acc ? JSON.parse(acc) : {})
      } catch {
        reject(new Error('JSON을 읽지 못했습니다'))
      }
    })
    req.on('error', reject)
  })

// ── 큐 ────────────────────────────────────────────────
// 웹 화면은 요청을 파일로 남기기만 하고, 워커가 그걸 집어 처리한다.
// 화면과 모델 호출을 떼어 놓아야 디자이너가 창을 닫아도 작업이 이어진다.

function ensureQueue() {
  for (const d of ['requests', 'results', 'archive']) {
    fs.mkdirSync(path.join(QUEUE, d), { recursive: true })
  }
}

function listRequests() {
  ensureQueue()
  const reqDir = path.join(QUEUE, 'requests')
  const resDir = path.join(QUEUE, 'results')
  const out = []
  for (const f of fs.readdirSync(reqDir).filter((n) => n.endsWith('.json'))) {
    const req = readJson(path.join(reqDir, f))
    if (!req) continue
    const result = readJson(path.join(resDir, f))
    out.push({ ...req, status: result ? result.status : 'waiting', result })
  }
  return out.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
}

// ── 아이콘 ────────────────────────────────────────────

function iconCatalog() {
  const ledger = readJson(LEDGER, { icons: {} })
  const seed = readJson(SEED_MAP, { categories: [] })

  const labels = new Map()
  for (const c of seed.categories) labels.set(c.id, c.label)

  const icons = Object.entries(ledger.icons).map(([name, meta]) => ({
    name,
    codepoint: meta.codepoint,
    category: meta.category,
    categoryLabel: labels.get(meta.category) || meta.category,
    source: meta.source,
    own: meta.source !== 'google-material',
    addedAt: meta.addedAt
  }))

  return { icons, categories: [...labels.entries()].map(([id, label]) => ({ id, label })) }
}

/** 승인 — 후보 SVG를 자산으로 굳히고 대장에 올린다. 여기가 유일한 쓰기 지점이다. */
function approve({ name, svg, category, requestedBy, model, prompt }) {
  const contract = readJson(CONTRACT)
  const ledger = readJson(LEDGER)
  if (!contract || !ledger) throw new Error('규격 또는 대장을 읽지 못했습니다')

  if (!new RegExp(contract.naming.pattern).test(name)) {
    throw new Error(`이름 규칙에 맞지 않습니다: ${name}`)
  }
  const bad = name.split('-').filter((s) => contract.naming.forbiddenWords.includes(s))
  if (bad.length > 0) throw new Error(`쓸 수 없는 단어입니다: ${bad.join(', ')}`)
  if (ledger.icons[name]) throw new Error(`이미 있는 이름입니다: ${name}`)

  // 코드포인트는 대장과 tombstone을 모두 피해 새로 뽑는다 — 재사용은 납품 사고다
  const used = new Set(Object.values(ledger.icons).map((m) => m.codepoint))
  for (const cp of Object.keys(ledger.tombstones || {})) used.add(cp)
  let n = parseInt(contract.codepoints.range.start.replace('U+', ''), 16)
  let codepoint
  for (;;) {
    const hex = 'U+' + n.toString(16).toUpperCase().padStart(4, '0')
    if (!used.has(hex)) {
      codepoint = hex
      break
    }
    n += 1
  }

  fs.mkdirSync(SVG_DIR, { recursive: true })
  fs.writeFileSync(path.join(SVG_DIR, `${name}.svg`), svg)

  ledger.icons[name] = {
    codepoint,
    category: category || 'custom',
    source: 'infomind-original',
    license: 'proprietary',
    sha256: crypto.createHash('sha256').update(svg).digest('hex'),
    paths: (svg.match(/<path/g) || []).length,
    addedAt: new Date().toISOString().slice(0, 10),
    ...(requestedBy ? { requestedBy } : {}),
    ...(model ? { model } : {}),
    ...(prompt ? { prompt } : {})
  }
  ledger.updatedAt = new Date().toISOString().slice(0, 10)
  fs.writeFileSync(LEDGER, JSON.stringify(ledger, null, 2) + '\n')

  return { name, codepoint }
}

// ── 라우팅 ────────────────────────────────────────────

const routes = {
  'GET /api/catalog': (req, res) => json(res, 200, iconCatalog()),

  'GET /api/contract': (req, res) => {
    const c = readJson(CONTRACT)
    json(res, 200, {
      canvas: c.canvas,
      geometry: c.geometry,
      naming: c.naming,
      generation: c.generation
    })
  },

  'GET /api/requests': (req, res) => json(res, 200, { requests: listRequests() }),

  'POST /api/requests': async (req, res) => {
    const body = await readBody(req)
    const text = String(body.text || '').trim()
    if (text.length < 2) return json(res, 400, { error: '어떤 아이콘이 필요한지 적어 주세요' })

    ensureQueue()
    const id = new Date().toISOString().replace(/[:.]/g, '-') + '-' + crypto.randomBytes(3).toString('hex')

    // 참조 — 특정 로고·심볼처럼 모델이 알 수 없는 대상은 실물을 보여 줘야 한다.
    // 없으면 그럴듯한 다른 것을 그린다.
    //
    // SVG는 코드를 그대로 프롬프트에 싣고, 그림 파일(PNG·JPG)은 디스크에 풀어 두고
    // 경로를 알려 준다 — claude가 파일을 열어 본다(2026-08-23 실측).
    let reference = null
    let referenceImage = null

    if (typeof body.reference === 'string' && body.reference.trim()) {
      const raw = body.reference.trim()
      if (raw.length > 200_000) return json(res, 400, { error: '참조 파일이 너무 큽니다 (200KB 이하)' })
      if (!/<svg[\s\S]*<\/svg>/i.test(raw)) {
        return json(res, 400, { error: 'SVG가 아닙니다. <svg>로 시작하는 코드를 넣어 주세요' })
      }
      reference = raw
    }

    if (typeof body.referenceImage === 'string' && body.referenceImage.trim()) {
      const m = body.referenceImage.match(/^data:image\/(png|jpeg|jpg|webp);base64,([A-Za-z0-9+/=]+)$/)
      if (!m) return json(res, 400, { error: 'PNG·JPG·WebP 그림만 받습니다' })
      const buf = Buffer.from(m[2], 'base64')
      if (buf.length > 4_000_000) return json(res, 400, { error: '그림이 너무 큽니다 (4MB 이하)' })
      const ext = m[1] === 'jpeg' ? 'jpg' : m[1]
      fs.mkdirSync(path.join(QUEUE, 'refs'), { recursive: true })
      const file = path.join(QUEUE, 'refs', `${id}.${ext}`)
      fs.writeFileSync(file, buf)
      referenceImage = file
    }

    const request = {
      id,
      text,
      count: Math.min(6, Math.max(1, Number(body.count) || 4)),
      ...(reference ? { reference } : {}),
      ...(referenceImage ? { referenceImage } : {}),
      createdAt: new Date().toISOString(),
      status: 'waiting'
    }
    fs.writeFileSync(path.join(QUEUE, 'requests', `${id}.json`), JSON.stringify(request, null, 2) + '\n')
    json(res, 201, request)
  },

  'POST /api/approve': async (req, res) => {
    const body = await readBody(req)
    try {
      const result = approve(body)
      // 승인이 끝난 요청은 보관함으로 옮긴다 — 목록이 계속 쌓이면 화면이 일거리가 된다
      if (body.requestId) {
        for (const dir of ['requests', 'results']) {
          const from = path.join(QUEUE, dir, `${body.requestId}.json`)
          if (fs.existsSync(from)) {
            fs.mkdirSync(path.join(QUEUE, 'archive', dir), { recursive: true })
            fs.renameSync(from, path.join(QUEUE, 'archive', dir, `${body.requestId}.json`))
          }
        }
      }
      json(res, 200, result)
    } catch (err) {
      json(res, 400, { error: err.message })
    }
  },

  // 내보내기 묶음 — 프로젝트에 그대로 복사할 파일들을 한 번에 만든다.
  // 브라우저에서 스프라이트만 조립하면 CSS·낱개·고지가 빠져 half-done이 된다.
  'POST /api/bundle': async (req, res) => {
    const body = await readBody(req)
    const names = Array.isArray(body.names) ? body.names.filter((n) => /^[a-z][a-z0-9-]*$/.test(n)) : []
    if (names.length === 0) return json(res, 400, { error: '아이콘을 하나 이상 고르세요' })

    const ledger = readJson(LEDGER, { icons: {} })
    const contract = readJson(CONTRACT, {})
    const canvas = contract.canvas?.width ?? 24
    const rule = contract.output?.fillRule

    const files = {}
    const symbols = []
    let missing = 0

    for (const name of names) {
      const p = path.join(SVG_DIR, `${name}.svg`)
      if (!fs.existsSync(p) || !ledger.icons[name]) { missing += 1; continue }
      const svg = fs.readFileSync(p, 'utf8')
      files[`svg/${name}.svg`] = svg
      const paths = [...svg.matchAll(/<path[^>]*\sd="([^"]+)"/g)].map((m) => `<path d="${m[1]}"/>`).join('')
      symbols.push(`<symbol id="${name}" viewBox="0 0 ${canvas} ${canvas}"${rule ? ` fill-rule="${rule}"` : ''}>${paths}</symbol>`)
    }

    files['sprite.svg'] =
      `<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="position:absolute;width:0;height:0;overflow:hidden">\n` +
      symbols.join('\n') + '\n</svg>\n'

    // 이 묶음에 실제로 든 아이콘만 담은 CSS. 원본 icons.css를 통째로 주면
    // 없는 아이콘의 클래스까지 따라가 쓰는 사람이 헷갈린다.
    const guideCss = path.join(OUT_ICONS, 'icons.css')
    if (fs.existsSync(guideCss)) {
      const full = fs.readFileSync(guideCss, 'utf8')
      const head = full.split('@layer components {')[0]
      const fontFace = (full.match(/@font-face \{[\s\S]*?\n {2}\}/) || [''])[0]
      const iconFont = (full.match(/\.icon-font \{[\s\S]*?\n {2}\}/) || [''])[0]
      const rows = names
        .filter((n) => ledger.icons[n])
        .map((n) => `  .icon-font--${n}::before { content: "${ledger.icons[n].codepoint.replace('U+', '\\')}"; }`)
      files['icons.css'] = `${head}@layer components {\n${fontFace}\n\n${iconFont}\n\n${rows.join('\n')}\n}\n`
    }

    const notice = path.join(OUT_ICONS, 'LICENSE-NOTICE.txt')
    if (fs.existsSync(notice)) files['LICENSE-NOTICE.txt'] = fs.readFileSync(notice, 'utf8')

    files['README.txt'] =
      `infoUX 아이콘 묶음 — ${Object.keys(files).filter((f) => f.startsWith('svg/')).length}종\n` +
      `${new Date().toISOString().slice(0, 10)} 생성\n\n` +
      `프로젝트의 assets/icons/ 에 이 폴더 내용을 그대로 넣는다.\n\n` +
      `쓰는 법\n` +
      `  <svg class="icon" aria-hidden="true">\n` +
      `    <use href="/assets/icons/sprite.svg#${names[0]}"></use>\n` +
      `  </svg>\n\n` +
      `옆에 텍스트가 없어 아이콘이 뜻을 담을 때는 aria-hidden 대신\n` +
      `role="img" aria-label="설명" 을 쓴다.\n\n` +
      `.icon 컴포넌트 CSS는 프로젝트의 6-components/icon.css에 이미 있다.\n` +
      `icons.css는 SVG를 못 받는 환경을 위한 폰트 여벌이며, 쓸 때는\n` +
      `infoux-icons.woff2 를 저장소 assets/icons/ 에서 함께 가져온다.\n\n` +
      `아이콘 목록·추가 요청은 아이콘 스튜디오에서 한다.\n`

    json(res, 200, { files, count: names.length - missing, missing })
  },

  'POST /api/discard': async (req, res) => {
    const body = await readBody(req)
    const id = String(body.requestId || '')
    if (!/^[\w.-]+$/.test(id)) return json(res, 400, { error: '잘못된 요청 번호입니다' })
    for (const dir of ['requests', 'results']) {
      const from = path.join(QUEUE, dir, `${id}.json`)
      if (fs.existsSync(from)) {
        fs.mkdirSync(path.join(QUEUE, 'archive', dir), { recursive: true })
        fs.renameSync(from, path.join(QUEUE, 'archive', dir, `${id}.json`))
      }
    }
    json(res, 200, { ok: true })
  }
}

function serveStatic(req, res, urlPath) {
  // 아이콘 SVG는 자산 폴더에서 바로 준다
  if (urlPath.startsWith('/icons/')) {
    const name = path.basename(urlPath.slice('/icons/'.length))
    const p = path.join(SVG_DIR, name)
    if (path.dirname(p) === SVG_DIR && fs.existsSync(p)) {
      res.writeHead(200, { 'content-type': MIME['.svg'], 'cache-control': 'no-cache' })
      return res.end(fs.readFileSync(p))
    }
    res.writeHead(404)
    return res.end('없음')
  }

  const rel = urlPath === '/' ? 'index.html' : urlPath.replace(/^\/+/, '')
  const p = path.join(PUBLIC, rel)
  if (!p.startsWith(PUBLIC) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' })
    return res.end('없음')
  }
  res.writeHead(200, { 'content-type': MIME[path.extname(p)] || 'application/octet-stream', 'cache-control': 'no-cache' })
  res.end(fs.readFileSync(p))
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`)
  const key = `${req.method} ${url.pathname}`

  if (routes[key]) {
    try {
      await routes[key](req, res)
    } catch (err) {
      json(res, 500, { error: err.message })
    }
    return
  }

  if (req.method === 'GET') return serveStatic(req, res, url.pathname)

  res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' })
  res.end('없음')
})

server.listen(PORT, HOST, () => {
  const { icons } = iconCatalog()
  const shown = HOST === '0.0.0.0' ? '이 기계의 주소' : HOST
  console.log(`아이콘 스튜디오 — http://${shown}:${PORT}`)
  if (HOST === '0.0.0.0') {
    console.log('  ⚠ 바깥에 열려 있습니다 — 로그인이 없으므로 닿을 수 있는 사람은 누구나 씁니다')
  }
  console.log(`  아이콘 ${icons.length}종 · 자체 제작 ${icons.filter((i) => i.own).length}종`)
  console.log('  npm run studio 로 켜면 일꾼도 함께 뜬다')
})
