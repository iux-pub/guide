#!/usr/bin/env node
// 아이콘 워커 — 큐에 쌓인 요청을 Claude에게 그리게 한다.
//
// 왜 웹 화면이 직접 부르지 않는가:
//   그리는 데 1~2분 걸린다. 화면이 붙들고 있으면 디자이너가 창을 못 닫는다.
//   요청을 파일로 남기고 워커가 집어 가면, 창을 닫아도 작업이 이어진다.
//
// 왜 claude 단일인가 (Decision Log 2026-08-23):
//   회사 자산이라 개인 LLM 자격(agy·codex)을 끌어들이지 않는다. 폴백도 없다 —
//   아이콘은 그린 모델이 바뀌면 그림체가 바뀌는데 로그만 봐서는 모른다.
//   다른 모델로 그리느니 안 그리는 게 낫다.
//
// 인증: 장기 토큰(~/.config/icon-studio/auth.env)이 있으면 그걸 쓴다. OAuth 세션은
//   만료되면 자동 갱신이 안 되는 상태로 빠져 워커가 조용히 멈춘다(2026-08-23 실측).
//
// 실행:  npm run studio:worker

import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

import { transformPath, pathBounds } from '../scripts/lib/svg-path.js'
import { measure } from '../scripts/lib/svg-geometry.js'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(HERE, '..')
const QUEUE = path.join(HERE, 'queue')
const CONTRACT = path.join(ROOT, 'contracts/icon-contract.json')
const LEDGER = path.join(ROOT, 'contracts/icon-codepoints.json')
const BASELINE = path.join(ROOT, 'contracts/icon-metrics-baseline.json')
const AUTH_ENV = path.join(os.homedir(), '.config/icon-studio/auth.env')

const POLL_MS = Number(process.env.POLL_MS || 4000)
// 프롬프트에 예시 path가 들어가 응답이 길어진다. 180초에서는 3개 중 1개가
// 시간 초과로 떨어졌다(2026-08-23 실측). 넉넉히 잡는다 — 어차피 비동기다.
const TIMEOUT_MS = Number(process.env.TIMEOUT_MS || 300000)

const contract = JSON.parse(fs.readFileSync(CONTRACT, 'utf8'))
const CANVAS = contract.canvas.width
const PADDING = contract.canvas.padding

/** 장기 토큰이 있으면 환경에 싣는다. 없으면 세션 자격으로 시도한다. */
function authEnv() {
  const env = { ...process.env }
  if (fs.existsSync(AUTH_ENV)) {
    for (const line of fs.readFileSync(AUTH_ENV, 'utf8').split('\n')) {
      const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
      if (m) env[m[1]] = m[2]
    }
  }
  return env
}

function findClaude() {
  const candidates = [
    process.env.CLAUDE_BIN,
    path.join(os.homedir(), '.local/bin/claude'),
    path.join(os.homedir(), '.claude/local/claude'),
    '/opt/homebrew/bin/claude',
    '/usr/local/bin/claude'
  ].filter(Boolean)
  for (const c of candidates) if (fs.existsSync(c)) return c
  return 'claude' // PATH에 맡긴다
}

const CLAUDE = findClaude()

/** claude --print 한 번. 실패는 던진다 — 폴백하지 않는다. */
function askClaude(prompt) {
  return new Promise((resolve, reject) => {
    const proc = spawn(CLAUDE, ['--print', prompt], {
      env: authEnv(),
      stdio: ['ignore', 'pipe', 'pipe']
    })
    let out = ''
    let err = ''
    const timer = setTimeout(() => {
      proc.kill('SIGKILL')
      reject(new Error(`시간 초과 (${Math.round(TIMEOUT_MS / 1000)}초)`))
    }, TIMEOUT_MS)

    proc.stdout.on('data', (d) => { out += d })
    proc.stderr.on('data', (d) => { err += d })
    proc.on('error', (e) => { clearTimeout(timer); reject(e) })
    proc.on('close', (code) => {
      clearTimeout(timer)
      // 미로그인일 때 종료코드 0으로 안내문만 뱉는다 — 성공으로 오인하면 그 문장이 자산이 된다
      if (/Not logged in|OAuth session expired|Failed to authenticate/i.test(out + err)) {
        return reject(new Error('Claude 인증이 필요합니다 — setup-claude-auth.sh를 실행하세요'))
      }
      if (code !== 0) return reject(new Error(err.trim() || `claude 종료코드 ${code}`))
      resolve(out)
    })
  })
}

/**
 * 세트에 있는 아이콘 몇 개를 예시로 보여 준다.
 * 말로 "아웃라인 스타일"이라고 해 봐야 안 통한다 — 2026-08-23 실측:
 * 규격만 적어 보냈더니 후보 3개가 전부 까맣게 채워진 덩어리로 왔다.
 * 실제 path를 보여 주면 그 결을 따라 그린다.
 */
function examples() {
  // 획 굵기가 기준(2)에 가장 가까운 것들로 고른다. 가는 예시를 주면 따라 가늘어진다.
  const picks = ['calendar', 'user', 'bell']
  const out = []
  for (const name of picks) {
    const p = path.join(ROOT, 'assets/icons/svg', `${name}.svg`)
    if (!fs.existsSync(p)) continue
    const d = fs.readFileSync(p, 'utf8').match(/<path[^>]*\sd="([^"]+)"/)
    if (d) out.push(`${name}: ${d[1]}`)
  }
  return out
}

/** 규격을 그대로 프롬프트에 싣는다. 사람 말로 풀어 쓰지 않는다 — 어긋나면 검사에서 걸린다. */
function buildPrompt(text, seedNames, variant) {
  const angles = [
    '가장 일반적이고 알아보기 쉬운 형태로',
    '단순하게 — 요소를 최소로 줄여서',
    '조금 다른 은유로 — 같은 뜻을 다른 사물로',
    '세부를 하나 더해 구체적으로'
  ]
  return `너는 아이콘 디자이너다. 아래 규격을 정확히 지켜 SVG 아이콘 하나를 그린다.

## 그릴 것
${text}

## 접근 방향
${angles[variant % angles.length]}

## 반드시 아웃라인(속이 빈) 아이콘이다
Google Material Symbols **Outlined**와 같은 결이다. 면으로 꽉 채운 덩어리가 아니라,
${contract.geometry.strokeWeight} 두께의 테두리 선으로 형태를 그린 것이다.

선을 stroke 속성으로 그리지 않고 **면(path)으로 변환**해 표현한다.
테두리 두께는 정확히 ${contract.geometry.strokeWeight}다 — 바깥 형태에서 각 변을
${contract.geometry.strokeWeight}씩 안으로 들인 것이 안쪽 형태다.

  사각 테두리:  M4 6h16v12H4Z  M6 8h12v8H6Z     ← 각 변이 2씩 들어갔다
  원 테두리:    바깥 반지름 10, 안쪽 반지름 8

**칠해진 면적이 캔버스의 4분의 1을 넘으면 잘못 그린 것이다.** 아웃라인 아이콘은
대부분이 빈 공간이다. 통째로 채워진 덩어리가 나오면 안쪽을 빼지 않은 것이다.

<svg>에 fill-rule="evenodd"를 준다. 이게 있어야 겹친 안쪽이 구멍으로 뚫린다.
없으면 감는 방향에 따라 통째로 칠해진다.

## 우리 세트의 실제 아이콘 — 이 결을 따른다
${examples().map((e) => `  ${e}`).join('\n')}

## 규격
- viewBox="0 0 ${CANVAS} ${CANVAS}"
- 형태는 중앙 ${contract.canvas.liveArea}×${contract.canvas.liveArea} 안에만. 바깥 ${PADDING}은 비운다
- 획 굵기 ${contract.geometry.strokeWeight}로 일정하게
- 루트 <svg>에 fill="currentColor" fill-rule="evenodd" 두 개만. path에는 fill을 쓰지 않는다
- stroke·stroke-width 속성 금지
- 색상값(#hex, rgb) 금지
- circle·rect·line·polygon 금지. path만 쓴다
- 좌표는 소수점 ${contract.output.decimalPlaces}자리까지

## 같은 세트에 이미 있는 아이콘 (겹치지 않게)
${seedNames.join(', ')}

## 출력 형식
SVG 코드만 출력한다. 설명·주석·코드펜스를 붙이지 않는다.
반드시 <svg 로 시작해 </svg> 로 끝난다.`
}

/** 응답에서 SVG를 꺼내 규격에 맞게 다듬는다. */
function normalize(raw) {
  const m = raw.match(/<svg[\s\S]*?<\/svg>/i)
  if (!m) throw new Error('SVG를 찾지 못했습니다')
  let svg = m[0]

  const vb = svg.match(/viewBox="([^"]+)"/)
  if (!vb) throw new Error('viewBox가 없습니다')
  const [vx, vy, vw, vh] = vb[1].trim().split(/\s+/).map(Number)
  if (!vw || !vh) throw new Error('viewBox 값이 이상합니다')

  let ds = [...svg.matchAll(/<path[^>]*\sd="([^"]+)"/g)].map((x) => x[1])
  if (ds.length === 0) throw new Error('path가 없습니다')

  // 다른 좌표계로 그려 왔으면 24로 옮긴다
  if (vw !== CANVAS || vx !== 0 || vy !== 0) {
    const scale = CANVAS / vw
    ds = ds.map((d) => transformPath(d, { scale, dx: -vx, dy: -vy, decimals: contract.output.decimalPlaces }))
  }

  const body = ds.map((d) => `<path d="${d}"/>`).join('')
  // fill-rule은 규격이 정한다 — 모델이 빠뜨려도 여기서 붙는다
  const rule = contract.output.fillRule ? ` fill-rule="${contract.output.fillRule}"` : ''
  svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CANVAS} ${CANVAS}" width="${CANVAS}" height="${CANVAS}" fill="currentColor"${rule}>${body}</svg>\n`
  return { svg, ds }
}

/** 사람이 보고 판단할 수 있는 말로만 적는다. viewBox·stroke 같은 용어를 쓰지 않는다. */
function review(svg, ds, original) {
  const notes = []
  let ok = true

  if (/\sstroke=/.test(original)) {
    notes.push({ level: 'bad', text: '선을 면으로 바꾸지 않고 그렸습니다' })
    ok = false
  }
  if (/#[0-9A-Fa-f]{3,6}/.test(original)) {
    notes.push({ level: 'bad', text: '아이콘 안에 색이 박혀 있습니다' })
    ok = false
  }
  if (/<(circle|rect|ellipse|line|polygon|polyline)\b/.test(original)) {
    notes.push({ level: 'bad', text: '도형 요소를 썼습니다 — 작은 크기에서 어긋납니다' })
    ok = false
  }

  const b = pathBounds(ds.join(' '))
  if (b) {
    const slack = 0.5
    if (b.minX < -slack || b.minY < -slack || b.maxX > CANVAS + slack || b.maxY > CANVAS + slack) {
      notes.push({ level: 'bad', text: '그림이 캔버스를 벗어났습니다' })
      ok = false
    } else if (b.minX < PADDING - slack || b.minY < PADDING - slack ||
               b.maxX > CANVAS - PADDING + slack || b.maxY > CANVAS - PADDING + slack) {
      notes.push({ level: 'warn', text: '여백이 다른 아이콘보다 좁습니다' })
    }
  }

  const baseline = fs.existsSync(BASELINE) ? JSON.parse(fs.readFileSync(BASELINE, 'utf8')) : null
  if (baseline) {
    const sw = measure(ds).strokeWeight
    const { min, p10, p90, max } = baseline.strokeWeight
    if (sw > max * 1.8) {
      // 획이 아니라 면으로 꽉 채워 그린 경우다. "굵다"고만 하면 원인을 못 찾는다.
      notes.push({ level: 'bad', text: '속이 꽉 찬 덩어리로 그려졌습니다 — 테두리만 남는 형태가 아닙니다' })
      ok = false
    } else if (sw < min || sw > max) {
      notes.push({ level: 'warn', text: sw < min ? '선이 다른 아이콘보다 많이 가늡니다' : '선이 다른 아이콘보다 많이 굵습니다' })
    } else if (sw < p10 || sw > p90) {
      notes.push({ level: 'warn', text: sw < p10 ? '선이 조금 가는 편입니다' : '선이 조금 굵은 편입니다' })
    }
  }

  if (ok && notes.length === 0) {
    notes.push({ level: 'good', text: '다른 아이콘들과 굵기·여백이 잘 맞습니다' })
  }
  return { ok, notes }
}

// ── 처리 ──────────────────────────────────────────────

async function handle(id, request) {
  const ledger = JSON.parse(fs.readFileSync(LEDGER, 'utf8'))
  const seedNames = Object.keys(ledger.icons)

  console.log(`  요청 ${id} — "${request.text}" 후보 ${request.count}개`)

  // 후보는 각각 따로 부른다. 한 번에 여러 개를 시키면 서로 닮게 나오고,
  // 하나가 어긋나면 전부 못 쓴다.
  const jobs = Array.from({ length: request.count }, (_, i) =>
    askClaude(buildPrompt(request.text, seedNames, i))
      .then((raw) => {
        const { svg, ds } = normalize(raw)
        return { ok: true, svg, review: review(svg, ds, raw) }
      })
      .catch((err) => ({ ok: false, error: err.message }))
  )

  const settled = await Promise.all(jobs)
  const candidates = settled
    .filter((c) => c.ok)
    .map((c, i) => ({ index: i, svg: c.svg, review: c.review }))
  const failures = settled.filter((c) => !c.ok).map((c) => c.error)

  // 인증 실패는 개별 후보 문제가 아니라 워커가 못 도는 상태다 — 요청을 소진하지 않는다
  if (candidates.length === 0 && failures.some((f) => /인증/.test(f))) {
    throw new Error(failures[0])
  }

  return {
    id,
    status: candidates.length > 0 ? 'ready' : 'failed',
    candidates,
    failures,
    finishedAt: new Date().toISOString()
  }
}

async function tick() {
  const reqDir = path.join(QUEUE, 'requests')
  const resDir = path.join(QUEUE, 'results')
  fs.mkdirSync(reqDir, { recursive: true })
  fs.mkdirSync(resDir, { recursive: true })

  for (const f of fs.readdirSync(reqDir).filter((n) => n.endsWith('.json'))) {
    if (fs.existsSync(path.join(resDir, f))) continue // 이미 처리됨

    const request = JSON.parse(fs.readFileSync(path.join(reqDir, f), 'utf8'))
    const id = f.replace(/\.json$/, '')

    // 처리 중 표시 — 화면이 "그리는 중"을 보여줄 수 있어야 한다
    fs.writeFileSync(path.join(resDir, f), JSON.stringify({ id, status: 'working', startedAt: new Date().toISOString() }, null, 2) + '\n')

    try {
      const result = await handle(id, request)
      fs.writeFileSync(path.join(resDir, f), JSON.stringify(result, null, 2) + '\n')
      console.log(`  → ${result.status} · 후보 ${result.candidates.length}개`)
    } catch (err) {
      // 인증 문제면 결과를 지워 다음 회차에 다시 시도한다
      fs.unlinkSync(path.join(resDir, f))
      console.error(`  ✗ ${err.message}`)
      if (/인증/.test(err.message)) {
        console.error('    워커를 멈춥니다. 인증을 고친 뒤 다시 켜세요.')
        process.exit(1)
      }
    }
  }
}

async function main() {
  console.log('아이콘 워커 시작')
  console.log(`  claude: ${CLAUDE}`)
  console.log(`  장기 토큰: ${fs.existsSync(AUTH_ENV) ? '있음' : '없음 (세션 자격으로 시도)'}`)
  console.log(`  ${POLL_MS / 1000}초마다 큐를 봅니다. Ctrl+C로 멈춥니다.\n`)

  for (;;) {
    try {
      await tick()
    } catch (err) {
      console.error('  회차 실패:', err.message)
    }
    await new Promise((r) => setTimeout(r, POLL_MS))
  }
}

main()
