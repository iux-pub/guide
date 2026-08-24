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
import { makeZip } from './lib/zip.mjs'
import { execFile } from 'node:child_process'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(HERE, '..')
const PUBLIC = path.join(HERE, 'public')
const QUEUE = path.join(HERE, 'queue')
const SVG_DIR = path.join(ROOT, 'assets/icons/svg')
const OUT_ICONS = path.join(ROOT, 'assets/icons')
const KEYWORDS = path.join(ROOT, 'contracts/icon-keywords.json')
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

/** 처리가 끝난 요청을 보관함으로 옮긴다. 목록이 계속 쌓이면 화면이 일거리가 된다. */
function archiveRequest(id) {
  if (!/^[\w.-]+$/.test(id)) return
  for (const dir of ['requests', 'results']) {
    const from = path.join(QUEUE, dir, `${id}.json`)
    if (!fs.existsSync(from)) continue
    fs.mkdirSync(path.join(QUEUE, 'archive', dir), { recursive: true })
    fs.renameSync(from, path.join(QUEUE, 'archive', dir, `${id}.json`))
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

/**
 * 일꾼이 살아 있나.
 *
 * 세션 자격이 만료되면 일꾼은 조용히 멈추고 요청은 「기다리는 중」으로 영원히 남는다.
 * 화면이 그걸 말해 주지 않으면 쓰는 사람은 자기가 뭘 잘못했는지 몰라 계속 기다린다.
 *
 * 판정은 박동 파일의 시각 하나로 한다 — 프로세스를 뒤지면 컨테이너·원격에서 안 맞는다.
 * 폴링 주기의 6배를 넘으면 멈춘 것으로 본다(4초 주기 → 24초). 한 회차가 오래 걸리는
 * 일은 없다. 실제 생성은 자식 프로세스가 하고 그동안에도 박동은 남는다.
 */
function workerHealth() {
  const p = path.join(QUEUE, 'worker-heartbeat.json')
  if (!fs.existsSync(p)) {
    return { alive: false, reason: '한 번도 뛴 적이 없습니다 — 일꾼이 뜨지 않았습니다' }
  }
  const beat = readJson(p, null)
  if (!beat?.at) return { alive: false, reason: '박동을 읽지 못했습니다' }

  const ageMs = Date.now() - new Date(beat.at).getTime()
  const limit = (beat.pollMs || 4000) * 6
  if (ageMs > limit) {
    return {
      alive: false,
      lastBeat: beat.at,
      ageSec: Math.round(ageMs / 1000),
      reason: `${Math.round(ageMs / 1000)}초째 박동이 없습니다`
    }
  }
  return { alive: true, lastBeat: beat.at, ageSec: Math.round(ageMs / 1000), state: beat.state }
}

// ── 아이콘 ────────────────────────────────────────────

function iconCatalog() {
  const ledger = readJson(LEDGER, { icons: {} })
  const seed = readJson(SEED_MAP, { categories: [] })

  const labels = new Map()
  for (const c of seed.categories) labels.set(c.id, c.label)

  // 이 아이콘에 어떤 표정이 있는지는 **대장이 정본**이다 (icon-codepoints.json).
  // 폴더를 직접 뒤지지 않는다 — 빌드를 안 거친 파일이 섞이면 없는 표정을 권하게 된다.
  const contract = readJson(CONTRACT, {})
  const combos = (contract.variants?.combinations || []).filter((c) => !c.default)
  const keywords = readJson(KEYWORDS, { keywords: {} }).keywords || {}

  const icons = Object.entries(ledger.icons).map(([name, meta]) => ({
    name,
    codepoint: meta.codepoint,
    category: meta.category,
    categoryLabel: labels.get(meta.category) || meta.category,
    source: meta.source,
    own: meta.source !== 'google-material',
    addedAt: meta.addedAt,
    variants: meta.variants || [],
    // 한국어로 찾을 수 있게. 화면에는 안 보이고 검색에만 쓴다
    keywords: keywords[name] || []
  }))

  return {
    icons,
    categories: [...labels.entries()].map(([id, label]) => ({ id, label })),
    variants: combos.map((c) => ({ id: c.id, note: c.note }))
  }
}

/** 승인 — 후보 SVG를 자산으로 굳히고 대장에 올린다. 여기가 유일한 쓰기 지점이다. */
/**
 * 요청문에서 검색어 후보를 뽑는다.
 *
 * 사용자가 「전자티켓 QR 스캔 아이콘」이라고 적었으면 그 말이 곧 남들이 찾을 말이다.
 * 완벽할 필요는 없다 — 승인 화면에서 고칠 수 있고, 여기서 하는 일은
 * **빈칸으로 두지 않는 것**이다. 검색어가 없으면 만들자마자 안 찾힌다.
 */
function keywordsFromPrompt(prompt, name) {
  // 아이콘 요청문에 늘 붙는 말은 검색어로 쓸모가 없다 — 다 걸린다
  const noise = new Set([
    '아이콘', '만들어', '만들어줘', '그려', '그려줘', '해줘', '주세요', '필요',
    '느낌', '모양', '스타일', '심플하게', '간단하게', '느낌으로', '표현',
    'icon', 'make', 'create', 'please'
  ])

  const words = String(prompt || '')
    .split(/[\s,·.·/()[\]{}"'`~!@#$%^&*+=<>?|\\:;]+/)
    .map((w) => w.trim())
    // 조사·어미가 붙은 채로 남으면 검색이 안 걸린다. 흔한 것만 떼어 낸다.
    .map((w) => w.replace(/(을|를|이|가|은|는|의|에|로|으로|와|과|도|만)$/, ''))
    .filter((w) => w.length >= 2 && w.length <= 12)
    .filter((w) => !noise.has(w))
    .filter((w) => !/^\d+$/.test(w))

  const out = []
  for (const w of words) if (!out.includes(w)) out.push(w)

  // 이름을 마디로 쪼개 함께 넣는다 — e-ticket이면 e·ticket으로도 찾힌다
  for (const seg of String(name).split('-')) {
    if (seg.length >= 2 && !out.includes(seg)) out.push(seg)
  }
  return out.slice(0, 8)
}

/** 검색어 사전에 적는다. 대장 순서를 그대로 따라 파일이 흔들리지 않게 한다. */
function writeKeywords(name, words, ledger) {
  if (!fs.existsSync(KEYWORDS)) return
  const dict = readJson(KEYWORDS, null)
  if (!dict) return
  dict.keywords = dict.keywords || {}
  dict.keywords[name] = words
  const ordered = {}
  for (const n of Object.keys(ledger.icons)) if (dict.keywords[n]) ordered[n] = dict.keywords[n]
  dict.keywords = ordered
  fs.writeFileSync(KEYWORDS, JSON.stringify(dict, null, 2) + '\n')
}

function approve({ name, svg, category, requestedBy, model, prompt, keywords }) {
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

  // 검색어가 없으면 만들자마자 화면에서 안 찾힌다 — 쓰는 사람은 없는 줄 알고
  // 또 만들어 달라고 하거나 남의 SVG를 붙여 넣는다 (R-27 위반)
  const given = Array.isArray(keywords)
    ? keywords.map((k) => String(k).trim()).filter(Boolean)
    : []
  const words = given.length > 0 ? [...new Set(given)].slice(0, 10) : keywordsFromPrompt(prompt, name)
  writeKeywords(name, words, ledger)

  return { name, codepoint, keywords: words }
}

// ── 저장소로 가는 길 ────────────────────────────────────
//
// 스튜디오는 git 체크아웃 안에 파일을 쓴다(assets/icons/svg·contracts). 그런데
// 서버의 클론에는 push 권한이 없다 — **만든 아이콘은 여기 머물 뿐 저장소로 가지 않는다.**
// 다음 배포가 `git reset --hard`를 하면 조용히 사라진다(2026-08-23 확인).
//
// 그래서 두 가지를 둔다. 배포는 남은 것이 있으면 멈추고(deploy-nas.sh),
// 화면은 「아직 저장소에 없다」고 말하며 패치를 내준다. 사람이 자기 클론에
// `git apply`로 옮겨 커밋한다 — 대장 번호와 검색어까지 한 번에 간다.

/** NAS의 git은 PATH에 없다. 흔한 자리를 훑는다. */
function findGit() {
  const cands = ['/usr/local/bin/git', '/opt/homebrew/bin/git', '/usr/bin/git', 'git']
  for (const c of cands) {
    if (c === 'git' || fs.existsSync(c)) return c
  }
  return null
}

const GIT = findGit()

function git(args) {
  return new Promise((resolve) => {
    if (!GIT) return resolve({ ok: false, out: '', err: 'git을 찾지 못했습니다' })
    execFile(GIT, args, { cwd: ROOT, maxBuffer: 20 * 1024 * 1024 }, (err, stdout, stderr) => {
      resolve({ ok: !err, out: stdout || '', err: (stderr || err?.message || '').trim() })
    })
  })
}

/**
 * 이 서버가 저장소에 올릴 수 있는가.
 *
 * 실제로 밀어 보지 않으면 알 수 없다 — 자격 파일이 있어도 토큰이 만료됐거나
 * 권한이 모자랄 수 있다. 아무것도 바꾸지 않는 dry-run으로 묻는다.
 */
async function canPush() {
  const r = await git(['push', '--dry-run', 'origin', 'HEAD:refs/heads/main'])
  if (r.ok) return { ok: true }

  // git의 거절 문구는 이유를 안 알려 준다 — 「Permission to … denied to <계정>」이 전부라
  // 권한이 모자란 건지, 저장소를 안 골랐는지, 조직 정책에 막힌 건지 알 수 없다.
  // 자격 파일이 아예 없으면 「아직 안 했다」는 뜻이고, 있는데 막히면 그 이유를 짚어야
  // 쓰는 사람이 무엇을 고칠지 안다(2026-08-24: 「조직이 366일 넘는 토큰을 금지한다」였다).
  const raw = (r.err || '') + (r.out || '')

  // **뒤처진 것은 권한 문제가 아니다.** 이 클론이 origin보다 뒤에 있으면 dry-run이
  // 「rejected (fetch first)」로 떨어지는데, 그건 인증이 되고 ref 갱신 단계까지
  // 갔다는 뜻이다 — 올릴 때 fetch·rebase를 하므로 그대로 올릴 수 있다.
  // 이 둘을 섞으면 멀쩡한 권한을 「없다」고 말한다(2026-08-24 실측).
  if (/fetch first|non-fast-forward|rejected/i.test(raw)) return { ok: true, behind: true }

  if (/could not read Username|terminal prompts disabled|Authentication failed|Permission denied \(publickey\)/i.test(raw)) {
    return { ok: false, reason: '아직 권한을 주지 않았습니다', how: 'setup' }
  }
  if (/denied to|403|read-only|write access/i.test(raw)) {
    return {
      ok: false,
      reason: '이 저장소에 쓸 수 없습니다 — 배포 키의 쓰기 허용을 확인하세요',
      how: 'setup'
    }
  }
  return { ok: false, reason: (raw.split('\n').find(Boolean) || '이유를 알 수 없습니다').slice(0, 200) }
}

/** 저장소에 아직 없는 아이콘·표정·검색어가 있는가. */
async function pendingWork() {
  const r = await git(['status', '--porcelain', '--', 'assets/icons/svg', 'contracts'])
  if (!r.ok) return { available: false, reason: r.err || 'git 상태를 읽지 못했습니다', icons: [], files: 0 }

  const lines = r.out.split('\n').map((l) => l.trim()).filter(Boolean)
  const icons = new Set()
  for (const line of lines) {
    // "?? assets/icons/svg/fill/e-ticket.svg" 같은 꼴
    const m = line.match(/assets\/icons\/svg\/(?:([a-z][a-z0-9-]*)\/)?([a-z][a-z0-9-]*)\.svg$/)
    if (m) icons.add(m[2])
  }
  return { available: true, icons: [...icons].sort(), files: lines.length, lines }
}

// ── 라우팅 ────────────────────────────────────────────

const routes = {
  'GET /api/catalog': (req, res) => json(res, 200, iconCatalog()),

  'GET /api/pending': async (req, res) => {
    const w = await pendingWork()
    // push가 되면 화면이 「올리기」를 내주고, 안 되면 패치를 받아 가라고 한다.
    // 막혔다면 왜 막혔는지도 함께 준다 — 「권한 없음」만으로는 무엇을 고칠지 모른다.
    const allowed = await canPush()
    w.canPush = allowed.ok
    if (!allowed.ok) w.pushBlocked = allowed.reason
    json(res, 200, w)
  },

  // 만든 것을 그 자리에서 저장소에 올린다. push 권한이 있을 때만 된다
  // (scripts/setup-nas-push.sh). 없으면 패치를 받아 사람이 옮긴다.
  'POST /api/push': async (req, res) => {
    const pending = await pendingWork()
    if (!pending.available) return json(res, 503, { error: pending.reason })
    if (pending.files === 0) return json(res, 400, { error: '올릴 것이 없습니다' })
    const allowed = await canPush()
    if (!allowed.ok) {
      return json(res, 403, {
        error: `${allowed.reason} — scripts/setup-nas-push.sh를 실행하면 이유를 짚어 줍니다`
      })
    }

    // 남이 먼저 올린 것이 있으면 먼저 받아 얹는다. 안 그러면 push가 거절된다.
    const fetched = await git(['fetch', '-q', 'origin'])
    if (!fetched.ok) return json(res, 502, { error: `저장소를 읽지 못했습니다 — ${fetched.err}` })

    const add = await git(['add', '--', 'assets/icons/svg', 'contracts'])
    if (!add.ok) return json(res, 500, { error: add.err })

    const names = pending.icons.length > 0 ? pending.icons.join(', ') : `파일 ${pending.files}개`
    const body = String((await readBody(req)).message || '').trim()
    const message =
      `feat(icons): ${names} 추가\n\n` +
      (body ? `${body}\n\n` : '') +
      '아이콘 스튜디오에서 만들어 그 자리에서 올린 것이다.\n' +
      'SVG·표정 파일과 함께 대장 번호·검색어가 같이 간다.\n\n' +
      'Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>'

    // 훅은 이 서버에 없다(개발 의존성을 깔지 않는다). --no-verify로 건너뛴다 —
    // 대신 서버가 승인·채택 때 규격을 이미 봤고, CI가 올라간 뒤 다시 본다.
    const commit = await git(['commit', '--no-verify', '-m', message])
    if (!commit.ok) return json(res, 500, { error: `커밋하지 못했습니다 — ${commit.err || commit.out}` })

    // rebase로 얹는다. merge면 서버가 만든 병합 커밋이 이력에 남는다.
    const rebase = await git(['rebase', 'origin/main'])
    if (!rebase.ok) {
      await git(['rebase', '--abort'])
      return json(res, 409, {
        error: '저장소에 먼저 올라온 변경과 부딪힙니다 — 패치를 받아 사람이 정리해야 합니다'
      })
    }

    const push = await git(['push', 'origin', 'HEAD:main'])
    if (!push.ok) {
      return json(res, 502, { error: `올리지 못했습니다 — ${push.err}` })
    }

    const head = await git(['log', '--oneline', '-1'])
    json(res, 200, { ok: true, icons: pending.icons, commit: head.out.trim() })
  },

  // 자기 클론에 `git apply`로 옮길 패치. 추적 안 되는 새 파일도 담기게 --binary와
  // intent-to-add를 함께 쓴다 — 안 그러면 새 SVG가 통째로 빠진다.
  'GET /api/pending.patch': async (req, res) => {
    const pending = await pendingWork()
    if (!pending.available) return json(res, 503, { error: pending.reason })
    if (pending.files === 0) return json(res, 404, { error: '저장소에 없는 변경이 없습니다' })

    // `add -N`은 새 파일을 diff에 나오게 하려고 인덱스에 자리만 잡아 둔다. 그런데 그
    // 흔적이 남으면 파일을 지운 뒤에도 `git status`가 유령 삭제(D)를 보고해 배포가
    // 헛되이 멈춘다(2026-08-24 실측). 뽑자마자 인덱스를 되돌린다.
    // 이 체크아웃은 배포 전용이라 일부러 staging하는 일이 없으므로 안전하다.
    await git(['add', '-N', '--', 'assets/icons/svg', 'contracts'])
    const d = await git(['diff', '--binary', '--', 'assets/icons/svg', 'contracts'])
    await git(['reset', '-q', '--', 'assets/icons/svg', 'contracts'])
    if (!d.ok) return json(res, 500, { error: d.err || '패치를 만들지 못했습니다' })

    res.writeHead(200, {
      'content-type': 'text/plain; charset=utf-8',
      'content-disposition': 'attachment; filename="pending.patch"',
      'x-icon-pending': String(pending.icons.length)
    })
    res.end(d.out)
  },

  'GET /api/contract': (req, res) => {
    const c = readJson(CONTRACT)
    json(res, 200, {
      canvas: c.canvas,
      geometry: c.geometry,
      naming: c.naming,
      generation: c.generation
    })
  },

  'GET /api/requests': (req, res) =>
    json(res, 200, { requests: listRequests(), worker: workerHealth() }),

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

    const hasReference = Boolean(reference || referenceImage)
    const request = {
      id,
      text,
      // 참조를 붙이면 후보가 서로 닮는다 — 같은 형태를 옮기는 일이라 「다른 접근」이
      // 의미가 없다. 게다가 참조가 붙으면 호출당 630초로 무거워진다(2026-08-24 실측).
      // 넷을 그리느라 40분을 쓰느니 둘을 그려 20분에 끝내는 편이 낫다.
      count: Math.min(6, Math.max(1, Number(body.count) || (hasReference ? 2 : 4))),
      ...(reference ? { reference } : {}),
      ...(referenceImage ? { referenceImage } : {}),
      createdAt: new Date().toISOString(),
      status: 'waiting'
    }
    fs.writeFileSync(path.join(QUEUE, 'requests', `${id}.json`), JSON.stringify(request, null, 2) + '\n')
    json(res, 201, request)
  },

  // 표정 만들기 — 자체 제작 아이콘은 승인해도 기본 하나뿐이라, 볼드로 통일한
  // 화면에 그 아이콘만 혼자 얇게 뜬다. 씨앗과 같은 자격으로 만들어 준다.
  'POST /api/variants': async (req, res) => {
    const body = await readBody(req)
    const name = String(body.name || '')
    if (!/^[a-z][a-z0-9-]*$/.test(name)) return json(res, 400, { error: '아이콘 이름이 올바르지 않습니다' })

    const ledger = readJson(LEDGER, { icons: {} })
    if (!ledger.icons[name]) return json(res, 400, { error: `대장에 없는 아이콘입니다: ${name}` })
    if (!fs.existsSync(path.join(SVG_DIR, `${name}.svg`))) {
      return json(res, 400, { error: '기본 표정 파일이 없습니다' })
    }

    const contract = readJson(CONTRACT, {})
    const known = (contract.variants?.combinations || []).filter((c) => !c.default).map((c) => c.id)
    const asked = Array.isArray(body.variants) ? body.variants.filter((v) => known.includes(v)) : known
    if (asked.length === 0) return json(res, 400, { error: '만들 표정을 고르세요' })

    // 이미 있는 것은 다시 만들지 않는다 — 덮어쓰면 사람이 고른 결과가 사라진다
    const have = ledger.icons[name].variants || []
    const todo = asked.filter((v) => !have.includes(v))
    if (todo.length === 0) return json(res, 400, { error: '고른 표정은 이미 있습니다' })

    ensureQueue()
    const id = new Date().toISOString().replace(/[:.]/g, '-') + '-' + crypto.randomBytes(3).toString('hex')
    const request = {
      id,
      kind: 'variants',
      name,
      variants: todo,
      text: `${name} 표정 만들기 — ${todo.join('·')}`,
      createdAt: new Date().toISOString()
    }
    fs.writeFileSync(path.join(QUEUE, 'requests', `${id}.json`), JSON.stringify(request, null, 2) + '\n')
    json(res, 200, { ...request, status: 'waiting' })
  },

  // 만들어진 표정을 자산으로 들인다. 대장에도 적어야 스튜디오·MCP·검수 시트가 안다.
  'POST /api/variants/adopt': async (req, res) => {
    const body = await readBody(req)
    const name = String(body.name || '')
    if (!/^[a-z][a-z0-9-]*$/.test(name)) return json(res, 400, { error: '아이콘 이름이 올바르지 않습니다' })

    const ledger = readJson(LEDGER, null)
    const contract = readJson(CONTRACT, {})
    if (!ledger?.icons?.[name]) return json(res, 400, { error: `대장에 없는 아이콘입니다: ${name}` })

    const known = (contract.variants?.combinations || []).filter((c) => !c.default).map((c) => c.id)
    const picks = Array.isArray(body.picks) ? body.picks : []
    const taken = []

    for (const pick of picks) {
      const vid = String(pick.variant || '')
      if (!known.includes(vid)) continue
      const svg = String(pick.svg || '')
      // 서버가 마지막 문지기다 — 화면을 거치지 않고 들어오는 길도 있다
      if (!/viewBox="0 0 24 24"/.test(svg) || !/fill="currentColor"/.test(svg) || /\sstroke=/.test(svg)) {
        return json(res, 400, { error: `${vid}: 규격에 맞지 않습니다` })
      }
      const dir = path.join(SVG_DIR, vid)
      fs.mkdirSync(dir, { recursive: true })
      fs.writeFileSync(path.join(dir, `${name}.svg`), svg.endsWith('\n') ? svg : `${svg}\n`)
      taken.push(vid)
    }

    if (taken.length === 0) return json(res, 400, { error: '들일 표정이 없습니다' })

    const have = new Set(ledger.icons[name].variants || [])
    for (const v of taken) have.add(v)
    // 계약이 정한 순서를 지킨다 — 파일이 매번 다르게 정렬되면 diff가 시끄럽다
    ledger.icons[name].variants = known.filter((v) => have.has(v))
    ledger.updatedAt = new Date().toISOString().slice(0, 10)
    fs.writeFileSync(LEDGER, JSON.stringify(ledger, null, 2) + '\n')

    if (body.requestId) archiveRequest(String(body.requestId))
    json(res, 200, { name, taken, variants: ledger.icons[name].variants })
  },

  'POST /api/approve': async (req, res) => {
    const body = await readBody(req)
    try {
      const result = approve(body)
      if (body.requestId) archiveRequest(String(body.requestId))
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
    const allCombos = contract.variants?.combinations || [{ id: 'regular', default: true }]

    // 고른 표정만 담는다. 기본은 늘 들어간다 — 표정만 있고 기본이 없으면
    // 클래스를 안 붙인 자리가 통째로 빈 네모가 된다.
    const asked = new Set(Array.isArray(body.variants) ? body.variants : [])
    const combos = allCombos.filter((c) => c.default || asked.has(c.id))

    const files = []
    const kept = []
    let missing = 0

    const svgOf = (name, combo) => {
      const dir = combo.default ? SVG_DIR : path.join(SVG_DIR, combo.id)
      const p = path.join(dir, `${name}.svg`)
      return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null
    }

    for (const name of names) {
      const base = ledger.icons[name] ? svgOf(name, combos[0]) : null
      if (!base) { missing += 1; continue }
      kept.push(name)
    }

    for (const combo of combos) {
      const symbols = []
      for (const name of kept) {
        const svg = svgOf(name, combo)
        // 표정이 없는 아이콘은 그 표정 스프라이트에서 빠진다 — 기본을 대신 넣으면
        // 「필인 줄 알았는데 아웃라인」이 조용히 섞인다
        if (!svg) continue
        const dir = combo.default ? 'svg' : `svg/${combo.id}`
        files.push({ name: `${dir}/${name}.svg`, data: svg })
        const paths = [...svg.matchAll(/<path[^>]*\sd="([^"]+)"/g)].map((m) => `<path d="${m[1]}"/>`).join('')
        symbols.push(`<symbol id="${name}" viewBox="0 0 ${canvas} ${canvas}"${rule ? ` fill-rule="${rule}"` : ''}>${paths}</symbol>`)
      }
      if (symbols.length === 0) continue
      files.push({
        name: combo.default ? 'sprite.svg' : `sprite-${combo.id}.svg`,
        data:
          `<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="position:absolute;width:0;height:0;overflow:hidden">\n` +
          symbols.join('\n') + '\n</svg>\n'
      })

      // 폰트는 이진이다. 예전에는 「저장소에서 따로 가져오라」고 안내만 했는데,
      // 그 한 줄이 받는 사람에게 별도 절차였다. zip이면 그냥 넣을 수 있다.
      const font = path.join(OUT_ICONS, combo.default ? 'infoux-icons.woff2' : `infoux-icons-${combo.id}.woff2`)
      if (fs.existsSync(font)) {
        files.push({ name: path.basename(font), data: fs.readFileSync(font) })
      }
    }

    // 이 묶음에 실제로 든 아이콘만 담은 CSS. 원본 icons.css를 통째로 주면
    // 없는 아이콘의 클래스까지 따라가 쓰는 사람이 헷갈린다.
    const guideCss = path.join(OUT_ICONS, 'icons.css')
    if (fs.existsSync(guideCss) && kept.length > 0) {
      const full = fs.readFileSync(guideCss, 'utf8')
      const head = full.split('@layer components {')[0]

      // 저장소의 icons.css는 Tailwind `@apply`를 쓴다. 그건 빌드를 거쳐야 값이 되는
      // 문법이라, Tailwind가 없는 프로젝트에 그대로 주면 아이콘이 통째로 안 뜬다.
      // 묶음은 어디에 넣어도 그냥 도는 것이 조건이므로 순수 CSS로 편다.
      const iconFont =
        `  .icon-font {\n` +
        `    display: inline-block;\n` +
        `    flex-shrink: 0;\n` +
        `    font-family: "infoUX Icons", sans-serif;\n` +
        `    font-size: 2.4rem;\n` +
        `    line-height: 1;\n` +
        `    font-style: normal;\n` +
        `    text-transform: none;\n` +
        `    vertical-align: -0.125em;\n` +
        `    font-variant-ligatures: none;\n` +
        `    speak: never;\n` +
        `    -webkit-font-smoothing: antialiased;\n` +
        `  }\n\n` +
        `  /* KRDS 사이즈 어휘 — 시각적 이름(--big)은 쓰지 않는다 */\n` +
        `  .icon-font--xsmall { font-size: 1.6rem; }\n` +
        `  .icon-font--small  { font-size: 2rem; }\n` +
        `  .icon-font--medium { font-size: 2.4rem; }\n` +
        `  .icon-font--large  { font-size: 3.2rem; }\n` +
        `  .icon-font--xlarge { font-size: 4rem; }\n` +
        `  .icon-font--inherit { font-size: inherit; }`
      const blocks = []

      for (const combo of combos) {
        const family = combo.default ? 'infoUX Icons' : `infoUX Icons ${combo.id}`
        const file = combo.default ? 'infoux-icons.woff2' : `infoux-icons-${combo.id}.woff2`
        blocks.push(
          `  @font-face {\n` +
          `    font-family: "${family}";\n` +
          `    src: url("./${file}") format("woff2");\n` +
          `    font-weight: normal;\n` +
          `    font-style: normal;\n` +
          `    font-display: block;\n` +
          `  }`
        )
      }
      blocks.push(iconFont)

      // 코드포인트는 표정과 무관하게 한 번만 적는다 — 두 번 적으면 대장이 두 곳으로 갈린다
      blocks.push(
        kept.map((n) => `  .icon-font--${n}::before { content: "${ledger.icons[n].codepoint.replace('U+', '\\')}"; }`).join('\n')
      )

      for (const combo of combos.filter((c) => !c.default)) {
        const has = kept.filter((n) => (ledger.icons[n].variants || []).includes(combo.id))
        if (has.length === 0) continue
        const sel = has.map((n) => `  .icon-font--${combo.id}.icon-font--${n}`).join(',\n')
        blocks.push(`${sel} {\n    font-family: "infoUX Icons ${combo.id}", "infoUX Icons", sans-serif;\n  }`)
      }

      files.push({ name: 'icons.css', data: `${head}@layer components {\n${blocks.join('\n\n')}\n}\n` })
    }

    const notice = path.join(OUT_ICONS, 'LICENSE-NOTICE.txt')
    if (fs.existsSync(notice)) files.push({ name: 'LICENSE-NOTICE.txt', data: fs.readFileSync(notice, 'utf8') })

    const extra = combos.filter((c) => !c.default)
    const sample = kept[0] || 'search'
    files.push({
      name: 'README.txt',
      data:
        `infoUX 아이콘 묶음 — ${kept.length}종\n` +
        `표정 ${combos.map((c) => c.id).join(' · ')}\n` +
        `${new Date().toISOString().slice(0, 10)} 생성\n\n` +
        `이 폴더 내용을 프로젝트의 assets/icons/ 에 그대로 넣는다. 폰트도 들어 있다.\n\n` +
        `쓰는 법 — 폰트(기본)\n` +
        `  <span class="icon-font icon-font--${sample}" aria-hidden="true"></span>\n\n` +
        `쓰는 법 — SVG (폰트를 못 쓰는 곳, 개별 색이 필요할 때)\n` +
        `  <svg class="icon" aria-hidden="true">\n` +
        `    <use href="/assets/icons/sprite.svg#${sample}"></use>\n` +
        `  </svg>\n\n` +
        (extra.length > 0
          ? `표정 바꾸기\n` +
            extra.map((c) =>
              `  <span class="icon-font icon-font--${c.id} icon-font--${sample}" aria-hidden="true"></span>\n` +
              `  <svg class="icon" aria-hidden="true"><use href="/assets/icons/sprite-${c.id}.svg#${sample}"></use></svg>\n`
            ).join('') +
            `\n  폰트는 클래스가, SVG는 스프라이트 파일이 표정을 정한다.\n` +
            `  아이콘마다 있는 표정이 다르다 — 없는 표정을 부르면 빈 네모가 나온다.\n` +
            `  한 화면에서 표정을 섞지 않는다.\n\n`
          : '') +
        `아이콘에는 늘 aria-hidden을 붙인다. 뜻은 옆의 텍스트나 버튼의\n` +
        `aria-label이 전한다 — 스크린리더는 코드포인트를 엉뚱하게 읽는다.\n\n` +
        `.icon 컴포넌트 CSS는 프로젝트의 6-components/icon.css에 이미 있다.\n\n` +
        `아이콘 목록·추가 요청은 아이콘 스튜디오에서 한다.\n`
    })

    const zip = makeZip(files)
    res.writeHead(200, {
      'content-type': 'application/zip',
      'content-disposition': 'attachment; filename="infoux-icons.zip"',
      'content-length': zip.length,
      'x-icon-count': String(kept.length),
      'x-icon-missing': String(missing),
      'x-icon-files': String(files.length)
    })
    res.end(zip)
  },

  'POST /api/discard': async (req, res) => {
    const body = await readBody(req)
    const id = String(body.requestId || '')
    if (!/^[\w.-]+$/.test(id)) return json(res, 400, { error: '잘못된 요청 번호입니다' })
    archiveRequest(id)
    json(res, 200, { ok: true })
  }
}

function serveStatic(req, res, urlPath) {
  // 아이콘 SVG는 자산 폴더에서 바로 준다
  if (urlPath.startsWith('/icons/')) {
    // /icons/fill/star.svg 처럼 변형 폴더도 받는다
    const rel = urlPath.slice('/icons/'.length)
    const parts = rel.split('/').filter(Boolean)
    const name = path.basename(parts.pop() || '')
    const sub = parts.length === 1 && /^[a-z][a-z0-9-]*$/.test(parts[0]) ? parts[0] : ''
    const base = sub ? path.join(SVG_DIR, sub) : SVG_DIR
    const p = path.join(base, name)
    if (path.dirname(p) === base && p.startsWith(SVG_DIR) && fs.existsSync(p)) {
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
