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
// 아이콘 하나를 그리는 데 걸리는 시간. 실측(2026-08-24, NAS): 전체 프롬프트 1회 359초.
// 300초로 두었더니 「인포마인드 로고」 요청이 후보 4개 전부 시간 초과로 떨어졌다.
// 좌표를 정확히 놓는 일이라 원래 느리다 — 큐가 비동기이므로 넉넉히 준다.
const TIMEOUT_MS = Number(process.env.TIMEOUT_MS || 900000)
// 표정 만들기도 같은 정도로 느리다(실측 251초). 따로 두는 이유는 앞으로 둘의
// 성격이 갈릴 수 있어서다 — 지금은 같은 값이다.
const VARIANT_TIMEOUT_MS = Number(process.env.VARIANT_TIMEOUT_MS || 900000)

// 한 번에 몇 개까지 동시에 그릴까.
//
// claude 하나가 무겁다 — 참조 그림이 붙으면 호출당 630초다(2026-08-24 실측, 단독 실행).
// 4코어 서버에서 넷을 한꺼번에 돌리면 서로 굶겨 **넷 다 시간 초과**로 떨어진다
// (「인포마인드 회사 로고」가 그렇게 실패했다). 둘씩 나눠 돌리면 각자 제 속도를 낸다.
// 전체 시간은 조금 길어지지만 큐가 비동기라 사람이 붙잡혀 있지 않고, 무엇보다 **끝난다**.
const MAX_PARALLEL = Number(process.env.MAX_PARALLEL || 2)

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
function askClaude(prompt, timeoutMs = TIMEOUT_MS) {
  return new Promise((resolve, reject) => {
    const proc = spawn(CLAUDE, ['--print', prompt], {
      env: authEnv(),
      stdio: ['ignore', 'pipe', 'pipe']
    })
    let out = ''
    let err = ''
    const timer = setTimeout(() => {
      proc.kill('SIGKILL')
      reject(new Error(`시간 초과 (${Math.round(timeoutMs / 1000)}초)`))
    }, timeoutMs)

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
  // 안에 격자·내부 요소가 있는 것을 고른다. 실패는 그 주제군에서 나오므로
  // 「윤곽 두 겹 + 내부 요소」가 실제로 어떻게 생겼는지 보여 주는 것이 맞다.
  // 획 굵기가 기준(기본 표정)에 가까운 것들이다 — 예시가 곧 굵기 지시다.
  const picks = ['calendar', 'table', 'grid', 'file']
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
function buildPrompt(text, seedNames, variant, reference, referenceImage) {
  const angles = [
    '가장 일반적이고 알아보기 쉬운 형태로',
    '단순하게 — 요소를 최소로 줄여서',
    '조금 다른 은유로 — 같은 뜻을 다른 사물로',
    '세부를 하나 더해 구체적으로'
  ]
  return `너는 아이콘 디자이너다. 아래 규격을 정확히 지켜 SVG 아이콘 하나를 그린다.

## 그릴 것
${text}
${reference || referenceImage ? `
## 참조 — 이 형태를 아이콘으로 옮긴다

아래는 실제 자산이다. **여기 없는 요소를 지어내지 말고**, 이 형태의 알아볼 수 있는
특징을 남기면서 우리 규격(획 굵기·라이브 영역)에 맞게 단순화한다.
${referenceImage ? `
그림 파일을 열어 본다: ${referenceImage}

색·그러데이션·질감은 옮기지 않는다 — 우리 아이콘은 단색 아웃라인이다.
형태의 뼈대만 가져온다.` : ''}${reference ? `
\`\`\`svg
${reference.length > 12000 ? reference.slice(0, 12000) + '\n<!-- (뒷부분 생략) -->' : reference}
\`\`\`` : ''}
` : ''}
## 접근 방향
${angles[variant % angles.length]}

## 반드시 아웃라인(속이 빈) 아이콘이다

Google Material Symbols **Outlined**와 같은 결이다.

**바깥 윤곽은 반드시 두 겹으로 그린다.** 바깥 선 하나, 그보다 ${contract.geometry.strokeWeight}만큼
안으로 들어온 선 하나. 이 둘 사이만 칠해지고 가운데는 빈다.

  올바름:  M4 6h16v12H4Z M6 8h12v8H6Z    ← 두 겹. 가운데가 뚫린 테두리
  틀림:    M4 6h16v12H4Z                  ← 한 겹. 통째로 까맣게 칠해진다

한 겹만 그리면 그 안에 무엇을 넣어도 **까만 덩어리에 흰 구멍이 난 그림**이 된다.
실제로 그렇게 나온 적이 여러 번 있다 — 티켓 몸통이 새까맣고 QR이 흰 구멍이었다.
우리가 원하는 것은 그 반대다: 티켓은 빈 테두리, QR은 그 안의 작은 채운 점.

## path를 역할별로 나눠 쓴다

한 덩어리로 몰아 쓰면 윤곽과 내부가 섞여 실수가 난다. 반드시 이렇게 나눈다.

  <path d="…바깥 윤곽 두 겹…"/>      ← 첫 번째 path. 여기가 테두리다
  <path d="…내부 요소…"/>            ← 두 번째부터. 점·막대·짧은 선

첫 번째 path 안에는 **닫힌 형태가 둘 이상** 있다(Z로 닫는다). 바깥 하나, 안쪽 하나.
닫힌 형태가 하나뿐이면 한 겹만 그린 것이다 — 다시 본다.

내부 요소는 한 겹으로 그려 채운다. 크기가 ${contract.geometry.strokeWeight}~4로 작아
그 자체가 획 굵기다.

<svg>에 fill-rule="evenodd"를 준다. 겹친 안쪽이 구멍으로 뚫리게 하는 장치다.

**자가 점검**: 다 그린 뒤 칠해진 면적이 캔버스의 4분의 1을 넘으면 바깥 윤곽을
한 겹만 그린 것이다. 다시 그린다.

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
아래 두 줄만 출력한다. 설명·주석·코드펜스를 붙이지 않는다.

  name: <영문 이름>
  <svg …></svg>

이름은 kebab-case로 **뜻을 담아** 짓는다 — 색·크기 같은 겉모습 단어를 넣지 않는다.
요청이 한글이어도 이름은 영문이다. 이미 있는 이름과 겹치지 않게 한다.

  좋음: e-ticket, duty-free-limit, tour-course
  나쁨: ticket-blue(색), big-icon(크기), icon-ticket(icon 중복)`
}

/**
 * 다시 그리기 요청. 무엇이 잘못됐는지 구체적으로 돌려준다.
 *
 * 규격을 아무리 정확히 적어도 첫 시도에서 어긋나는 경우가 있다 — 특히 내부 요소가
 * 많은 주제(QR·격자)에서 바깥 윤곽을 한 겹만 그려 덩어리가 된다. 결과를 재서
 * 되먹이면 두 번째에는 대개 맞는다. 사람이 볼 후보의 질이 올라간다.
 */
function retryPrompt(basePrompt, previousSvg, notes) {
  const problems = notes.filter((n) => n.level !== 'good').map((n) => `- ${n.text}`).join('\n')
  return `${basePrompt}

---

## 방금 그린 것이 이렇게 나왔다 — 고쳐서 다시 그린다

${previousSvg}

### 무엇이 잘못됐나
${problems}

### 어떻게 고치나
가장 흔한 원인은 **바깥 윤곽을 한 겹만 그린 것**이다. 한 겹이면 그 안이 통째로
칠해지고, 안에 넣은 요소들이 흰 구멍으로 보인다.

바깥 윤곽을 두 겹으로 다시 그린다 — 바깥 선과, 거기서 ${contract.geometry.strokeWeight}만큼
안으로 들어온 선. 그 사이만 칠해지고 가운데는 빈다.

내부의 작은 요소는 그대로 한 겹으로 채운다.

SVG 코드만 출력한다.`
}

/** 응답에서 SVG를 꺼내 규격에 맞게 다듬는다. */
function normalize(raw) {
  const m = raw.match(/<svg[\s\S]*?<\/svg>/i)
  if (!m) throw new Error('SVG를 찾지 못했습니다')
  let svg = m[0]

  // 모델이 제안한 이름. 규칙에 안 맞으면 버리고 사람이 짓게 둔다 —
  // 요청이 한글이면 화면에서 이름을 뽑아낼 방법이 없다.
  const nameLine = raw.match(/^\s*name\s*:\s*([a-z][a-z0-9-]*)\s*$/im)
  const suggested = nameLine ? nameLine[1] : null

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
  return { svg, ds, suggested }
}

/** 사람이 보고 판단할 수 있는 말로만 적는다. viewBox·stroke 같은 용어를 쓰지 않는다. */
function review(svg, ds, original) {
  const notes = []
  let ok = true
  // 규격 위반은 아니지만 다시 그려 볼 값어치가 있는 상태 —
  // 획이 씨앗 범위를 벗어나면 대개 바깥 윤곽을 한 겹만 그린 것이다.
  let retryWorthy = false

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
    const solidAt = (baseline.strokeWeight.p90 || max) * (contract.optical.solidFillThreshold?.multiplier ?? 2)
    if (sw > solidAt) {
      // 획이 아니라 면으로 꽉 채워 그린 경우다. "굵다"고만 하면 원인을 못 찾는다.
      notes.push({ level: 'bad', text: '속이 꽉 찬 덩어리로 그려졌습니다 — 테두리만 남는 형태가 아닙니다' })
      ok = false
    } else if (sw < min || sw > max) {
      notes.push({ level: 'warn', text: sw < min ? '선이 다른 아이콘보다 많이 가늡니다' : '선이 다른 아이콘보다 많이 굵습니다' })
      retryWorthy = true
    } else if (sw < p10 || sw > p90) {
      notes.push({ level: 'warn', text: sw < p10 ? '선이 조금 가는 편입니다' : '선이 조금 굵은 편입니다' })
    }
  }

  if (ok && notes.length === 0) {
    notes.push({ level: 'good', text: '다른 아이콘들과 굵기·여백이 잘 맞습니다' })
  }
  return { ok, notes, retryWorthy: !ok || retryWorthy }
}

// ── 처리 ──────────────────────────────────────────────

// ── 표정 만들기 ────────────────────────────────────────
//
// 자체 제작 아이콘은 승인해도 기본 표정 하나뿐이다. 씨앗은 넷을 갖고 있으므로,
// 볼드로 통일한 화면에 회사 심볼만 혼자 얇게 뜬다.
//
// 기하로 선을 굵히는(폴리곤 오프셋) 길은 곡선·모서리에서 쉽게 깨진다.
// 대신 **원본 path를 보여 주고 다시 그리게** 한 뒤 실측으로 판정한다 —
// 만들기와 같은 방식이다.

/** 이 표정이 실제로 어떻게 생겼는지 씨앗에서 보여 준다. 말보다 예시가 통한다. */
function variantExamples(variantId) {
  const picks = ['calendar', 'star', 'home', 'file']
  const out = []
  for (const name of picks) {
    const b = path.join(ROOT, 'assets/icons/svg', `${name}.svg`)
    const v = path.join(ROOT, 'assets/icons/svg', variantId, `${name}.svg`)
    if (!fs.existsSync(b) || !fs.existsSync(v)) continue
    const bd = fs.readFileSync(b, 'utf8').match(/<path[^>]*\sd="([^"]+)"/)
    const vd = fs.readFileSync(v, 'utf8').match(/<path[^>]*\sd="([^"]+)"/)
    if (bd && vd) out.push(`${name}\n  기본: ${bd[1]}\n  ${variantId}: ${vd[1]}`)
  }
  return out
}

function variantPrompt(name, baseSvg, combo, target) {
  const baseD = [...baseSvg.matchAll(/<path[^>]*\sd="([^"]+)"/g)].map((m) => m[1])
  // 「가늘게 그려라」만으로는 안 통한다 — 2026-08-23 실측: star의 slim이 면적 1.06배로
  // 거의 그대로 나왔다(재시도해도 마찬가지). 아웃라인 아이콘은 바깥 선과 안쪽 선 두 겹이고
  // 굵기는 그 사이 간격이다. **어느 선을 어느 쪽으로 옮기는지**를 말해 줘야 한다.
  const how = {
    slim: `바깥 선은 **그 자리에 그대로 두고**, 안쪽 선만 바깥쪽으로 밀어 두 선 사이를 좁힌다.
사이 간격이 지금의 약 ${(target.areaRatio.median).toFixed(2)}배가 되도록 좁힌다.`,
    bold: `바깥 선은 **그 자리에 그대로 두고**, 안쪽 선만 안쪽으로 밀어 두 선 사이를 넓힌다.
사이 간격이 지금의 약 ${(target.areaRatio.median).toFixed(2)}배가 되도록 넓힌다.`,
    fill: '안쪽 선을 **지운다**. 바깥 선 하나만 남기면 속이 찬 덩어리가 된다.'
  }[combo.id] || ''

  const what = {
    slim: `획을 **가늘게** 다시 그린다. 목표 굵기 ${target.strokeWeight.median} (기본의 약 ${target.areaRatio.median}배 면적).

${how}`,
    bold: `획을 **굵게** 다시 그린다. 목표 굵기 ${target.strokeWeight.median} (기본의 약 ${target.areaRatio.median}배 면적).

${how}`,
    fill: `속을 **채운다**. 윤곽 안쪽을 메워 덩어리로 만든다. 뜻을 전하는 데 꼭 필요한 구멍(예: 자물쇠 열쇠구멍)만 남긴다.

${how}`
  }[combo.id] || `${combo.id} 표정으로 다시 그린다.`

  return `아이콘 "${name}"의 **${combo.id} 표정**을 만든다.

같은 아이콘의 다른 얼굴이다. **모양이 바뀌면 안 된다** — 무엇을 그린 것인지,
어디에 무엇이 놓였는지가 그대로여야 하고, 굵기(또는 채움)만 달라진다.

## 기본 표정 (이것을 다시 그린다)

${baseD.map((d) => `  ${d}`).join('\n')}

## 할 일

${what}

**바깥 테두리 위치는 그대로 둔다.** 아이콘이 차지하는 사각형이 기본과 거의 같아야 한다
(최대 ${target.boundsDrift.p90} 이내). 안쪽 선만 옮겨 굵기를 바꾼다.

## 씨앗의 실제 예시 — 기본이 ${combo.id}로 어떻게 바뀌는지

${variantExamples(combo.id).join('\n\n') || '(예시 없음)'}

## 규격 (기본과 같다)

- viewBox "0 0 24 24", width·height 24, fill="currentColor"
- <path>만 쓴다. stroke·stroke-width·transform·style·class·id 금지
- 좌표는 소수점 2자리까지
- 선은 면으로 그린다 — 윤곽은 두 겹(바깥 선과 안쪽 선)

## 답

SVG 한 덩어리만 낸다. 설명·코드펜스 없이 <svg …>…</svg> 그대로.
${combo.id === 'fill' ? '\n채울 면이 없는 형태(돋보기·화살표처럼 선으로만 된 것)라면 SVG 대신 NONE 한 낱말만 낸다.' : ''}`
}

/** 표정이 규격·굵기·면적·테두리를 다 지켰는지 실측으로 본다. */
function reviewVariant(baseSvg, svg, ds, combo, target) {
  const notes = []
  const baseDs = [...baseSvg.matchAll(/<path[^>]*\sd="([^"]+)"/g)].map((m) => m[1])
  const base = measure(baseDs)
  const now = measure(ds)

  // ① 같은 아이콘인가 — 테두리가 어긋나면 다른 그림을 그려 온 것이다
  const bb = pathBounds(baseDs.join(' '))
  const vb = pathBounds(ds.join(' '))
  let drift = 0
  if (bb && vb) {
    drift = Math.max(
      Math.abs(vb.minX - bb.minX), Math.abs(vb.minY - bb.minY),
      Math.abs(vb.maxX - bb.maxX), Math.abs(vb.maxY - bb.maxY)
    )
    const limit = Math.max(1.5, target.boundsDrift.max)
    if (drift > limit) {
      notes.push({ level: 'bad', text: `기본과 놓인 자리가 ${drift.toFixed(1)}만큼 다릅니다 — 같은 아이콘이 아닌 것 같습니다` })
    }
  }

  // ② 그 표정답게 굵기가 바뀌었는가.
  //
  // **면적비가 주 지표다.** 같은 아이콘의 자기 기본과 견주므로 형태 복잡도에 휘둘리지 않는다.
  //
  // 범위는 min~max가 아니라 **p10~p90**에 여유를 얹어 잡는다. min·max로 잡으면 뜻이 사라진다 —
  // 2026-08-23 실측: slim이 min×0.8~max×1.25면 0.36~1.05가 되어 「면적 0.95배(거의 그대로)」가
  // 통과했고, bold는 0.94까지 열려 **기본보다 얇은 볼드**도 통과할 판이었다.
  // 씨앗의 p10~p90은 좁다(slim 0.62~0.67, bold 1.34~1.43). 그게 이 표정의 뜻이다.
  const ratio = base.area > 0 ? now.area / base.area : 0
  const lo = target.areaRatio.p10 * 0.85
  const hi = target.areaRatio.p90 * 1.15

  // 방향은 분포와 무관한 불변이다. 슬림이 기본보다 굵으면 그건 슬림이 아니다.
  const wantThinner = target.areaRatio.p90 < 1
  if (wantThinner ? ratio >= 1 : ratio <= 1) {
    notes.push({
      level: 'bad',
      text: `기본 대비 ${ratio.toFixed(2)}배입니다 — ${wantThinner ? '가늘어야' : '굵어야'} 하는데 방향이 반대이거나 그대로입니다`
    })
  } else if (ratio < lo || ratio > hi) {
    // 재시도 프롬프트가 이 문장을 그대로 물고 간다 — 「틀렸다」로 끝내지 않고 방법을 적는다
    const fix = {
      slim: '안쪽 선을 바깥쪽으로 더 밀어 두 선 사이를 좁혀야 합니다',
      bold: '안쪽 선을 안쪽으로 더 밀어 두 선 사이를 넓혀야 합니다',
      fill: '안쪽 선을 지워 속을 채워야 합니다'
    }[combo.id] || '굵기를 더 크게 바꿔야 합니다'
    notes.push({
      level: 'bad',
      text: `기본 대비 ${ratio.toFixed(2)}배로 거의 그대로입니다 — ${fix} (씨앗 범위 ${lo.toFixed(2)}~${hi.toFixed(2)})`
    })
  }

  // ③ 획 굵기는 곁들여 본다 — 면적비가 이미 주 지표이고, 형태에 따라 이 값은 흔들린다.
  const sw = now.strokeWeight
  const t = target.strokeWeight
  if (sw < t.p10 * 0.7) {
    notes.push({ level: 'warn', text: `다른 ${combo.id} 아이콘보다 가늡니다 (${sw.toFixed(2)})` })
  } else if (sw > t.p90 * 1.3) {
    notes.push({ level: 'warn', text: `다른 ${combo.id} 아이콘보다 굵습니다 (${sw.toFixed(2)})` })
  }

  if (/\sstroke=/.test(svg)) {
    notes.push({ level: 'bad', text: '선(stroke)으로 그렸습니다 — 면으로 바꿔야 합니다' })
  }

  const bad = notes.filter((n) => n.level === 'bad').length
  if (bad === 0 && notes.length === 0) {
    notes.push({ level: 'good', text: `기본과 같은 모양이고 ${combo.id}답게 나왔습니다` })
  }
  return {
    ok: bad === 0,
    retryWorthy: bad > 0,
    notes,
    metrics: { strokeWeight: Number(sw.toFixed(2)), areaRatio: Number(ratio.toFixed(2)), boundsDrift: Number(drift.toFixed(2)) }
  }
}

async function handleVariants(id, request) {
  const contract = JSON.parse(fs.readFileSync(CONTRACT, 'utf8'))
  const baselineAll = JSON.parse(fs.readFileSync(BASELINE, 'utf8'))
  const name = request.name
  const basePath = path.join(ROOT, 'assets/icons/svg', `${name}.svg`)
  if (!fs.existsSync(basePath)) throw new Error(`기본 표정이 없습니다: ${name}`)
  const baseSvg = fs.readFileSync(basePath, 'utf8')

  const wanted = Array.isArray(request.variants) && request.variants.length > 0
    ? request.variants
    : (contract.variants?.combinations || []).filter((c) => !c.default).map((c) => c.id)

  console.log(`  요청 ${id} — "${name}"의 표정 ${wanted.join('·')}`)

  const draw = async (vid) => {
    const combo = (contract.variants?.combinations || []).find((c) => c.id === vid)
    const target = baselineAll.variants?.[vid]
    if (!combo || !target) throw new Error(`표정 기준이 없습니다: ${vid}`)

    const prompt = variantPrompt(name, baseSvg, combo, target)
    const raw = await askClaude(prompt, VARIANT_TIMEOUT_MS)

    // 채울 면이 없다고 답할 수 있다 — 억지로 만들면 두부처럼 뭉갠 그림이 나온다
    if (/^\s*NONE\s*$/i.test(raw) || (!/<svg/i.test(raw) && /NONE/i.test(raw))) {
      return { variant: vid, none: true }
    }

    const first = normalize(raw)
    let verdict = reviewVariant(baseSvg, first.svg, first.ds, combo, target)
    let svg = first.svg
    let retried = false

    if (verdict.retryWorthy) {
      retried = true
      try {
        const raw2 = await askClaude(retryPrompt(prompt, first.svg, verdict.notes), VARIANT_TIMEOUT_MS)
        const second = normalize(raw2)
        const v2 = reviewVariant(baseSvg, second.svg, second.ds, combo, target)
        if (v2.ok || v2.notes.filter((n) => n.level === 'bad').length <
                     verdict.notes.filter((n) => n.level === 'bad').length) {
          svg = second.svg
          verdict = v2
        }
      } catch {
        // 두 번째가 실패하면 첫 번째를 그대로 보여 준다 — 판단은 사람 몫이다
      }
    }
    return { variant: vid, svg, review: verdict, retried }
  }

  const settled = await pool(wanted, (v) => draw(v).catch((err) => ({ variant: v, error: err.message })))

  const made = settled.filter((r) => r.svg)
  if (made.length === 0 && settled.some((r) => /인증/.test(r.error || ''))) {
    throw new Error(settled.find((r) => r.error).error)
  }

  return {
    id,
    kind: 'variants',
    status: made.length > 0 || settled.some((r) => r.none) ? 'ready' : 'failed',
    name,
    baseSvg,
    results: settled,
    failures: settled.filter((r) => r.error).map((r) => `${r.variant}: ${r.error}`),
    finishedAt: new Date().toISOString()
  }
}

/**
 * 한 번에 MAX_PARALLEL개씩만 돌린다.
 *
 * Promise.all로 한꺼번에 던지면 프로세스들이 CPU를 두고 다투다 다 같이 늦어진다.
 * 늦어지는 정도가 시간 제한을 넘으면 **하나도 못 건진다** — 나눠 돌리면 적어도
 * 먼저 끝난 것은 남는다.
 */
async function pool(items, run) {
  const out = new Array(items.length)
  let next = 0
  const lane = async () => {
    for (;;) {
      const i = next
      next += 1
      if (i >= items.length) return
      out[i] = await run(items[i], i)
    }
  }
  await Promise.all(Array.from({ length: Math.min(MAX_PARALLEL, items.length) }, lane))
  return out
}

async function handle(id, request) {
  const ledger = JSON.parse(fs.readFileSync(LEDGER, 'utf8'))
  const seedNames = Object.keys(ledger.icons)

  console.log(`  요청 ${id} — "${request.text}" 후보 ${request.count}개${request.reference ? ' (SVG 참조)' : ''}${request.referenceImage ? ' (그림 참조)' : ''}`)

  // 후보는 각각 따로 부른다. 한 번에 여러 개를 시키면 서로 닮게 나오고,
  // 하나가 어긋나면 전부 못 쓴다.
  const draw = async (i) => {
    const base = buildPrompt(request.text, seedNames, i, request.reference, request.referenceImage)
    const raw = await askClaude(base)
    const first = normalize(raw)
    const verdict = review(first.svg, first.ds, raw)

    // 규격을 어겼으면 무엇이 잘못됐는지 알려 주고 한 번 더 그리게 한다.
    // 두 번째도 어긋나면 그대로 둔다 — 판단은 사람 몫이고, 무한정 시도하면
    // 디자이너가 기다리는 시간만 길어진다.
    if (verdict.retryWorthy) {
      try {
        const raw2 = await askClaude(retryPrompt(base, first.svg, verdict.notes))
        const second = normalize(raw2)
        const verdict2 = review(second.svg, second.ds, raw2)
        if (!verdict2.retryWorthy) return { ok: true, svg: second.svg, review: verdict2, retried: true, suggested: second.suggested ?? first.suggested }
        // 둘 다 어긋났으면 덜 나쁜 쪽을 준다
        const score = (v) => v.notes.filter((n) => n.level === 'bad').length * 10 +
                             v.notes.filter((n) => n.level === 'warn').length
        const worse2 = score(verdict2)
        const worse1 = score(verdict)
        return worse2 <= worse1
          ? { ok: true, svg: second.svg, review: verdict2, retried: true, suggested: second.suggested ?? first.suggested }
          : { ok: true, svg: first.svg, review: verdict, retried: true, suggested: first.suggested }
      } catch {
        return { ok: true, svg: first.svg, review: verdict, retried: true, suggested: first.suggested }
      }
    }
    return { ok: true, svg: first.svg, review: verdict, retried: false, suggested: first.suggested }
  }

  const settled = await pool(
    Array.from({ length: request.count }, (_, i) => i),
    (i) => draw(i).catch((err) => ({ ok: false, error: err.message }))
  )
  const candidates = settled
    .filter((c) => c.ok)
    .map((c, i) => ({ index: i, svg: c.svg, review: c.review, retried: c.retried, suggested: c.suggested }))
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
      // 두 가지 일을 한 큐로 받는다 — 일꾼도 화면도 하나면 된다
      const result = request.kind === 'variants'
        ? await handleVariants(id, request)
        : await handle(id, request)
      fs.writeFileSync(path.join(resDir, f), JSON.stringify(result, null, 2) + '\n')
      console.log(
        result.kind === 'variants'
          ? `  → ${result.status} · 표정 ${result.results.filter((r) => r.svg).length}개`
          : `  → ${result.status} · 후보 ${result.candidates.length}개`
      )
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

/**
 * 살아 있다는 표시를 남긴다.
 *
 * 일꾼이 조용히 멈추는 실패가 실제로 있다 — claude 세션 자격이 만료되면
 * 자동 갱신이 안 되는 상태로 빠지고, 그때부터 요청이 「기다리는 중」으로
 * 영원히 남는다. 화면에 아무 신호가 없으면 쓰는 사람은 자기가 뭘 잘못했는지
 * 몰라 계속 기다린다.
 *
 * 파일 하나면 충분하다 — 서버는 이 파일의 시각만 보면 된다.
 */
function beat(state) {
  try {
    fs.mkdirSync(QUEUE, { recursive: true })
    fs.writeFileSync(
      path.join(QUEUE, 'worker-heartbeat.json'),
      JSON.stringify({ at: new Date().toISOString(), state, pid: process.pid, pollMs: POLL_MS }) + '\n'
    )
  } catch {
    // 심장 박동을 못 남기는 것으로 일을 멈추지는 않는다
  }
}

/**
 * 하다 만 일을 되살린다.
 *
 * 일꾼이 일하는 중에 죽으면(배포 재기동·서버 재부팅) 결과 파일이 「하는 중」으로 굳는다.
 * tick은 결과 파일이 있으면 건너뛰므로 그 요청은 **영원히 끝나지 않는다** —
 * 화면에는 「55분째 만드는 중」이 뜬 채로 남는다(2026-08-24 실측).
 *
 * 새로 뜰 때 그런 것을 찾아 결과를 지운다. 다음 회차가 다시 집는다.
 * 다만 무한정은 아니다 — 일꾼을 죽이는 요청이면 되살릴 때마다 또 죽는다.
 * 두 번까지만 되살리고 그 뒤에는 실패로 적어 사람이 보게 한다.
 */
function recoverStale() {
  const reqDir = path.join(QUEUE, 'requests')
  const resDir = path.join(QUEUE, 'results')
  fs.mkdirSync(reqDir, { recursive: true })
  fs.mkdirSync(resDir, { recursive: true })

  const MAX_RETRY = 2
  let revived = 0
  let gaveUp = 0

  for (const f of fs.readdirSync(resDir).filter((n) => n.endsWith('.json'))) {
    let result
    try {
      result = JSON.parse(fs.readFileSync(path.join(resDir, f), 'utf8'))
    } catch {
      continue
    }
    if (result.status !== 'working') continue

    const reqPath = path.join(reqDir, f)
    if (!fs.existsSync(reqPath)) {
      // 요청이 없으면 되살릴 수 없다. 남겨 두면 화면에 영원히 뜬다.
      fs.unlinkSync(path.join(resDir, f))
      continue
    }

    const request = JSON.parse(fs.readFileSync(reqPath, 'utf8'))
    const tries = (request.restarts || 0) + 1

    if (tries > MAX_RETRY) {
      fs.writeFileSync(path.join(resDir, f), JSON.stringify({
        id: result.id,
        kind: request.kind,
        status: 'failed',
        failures: [`${MAX_RETRY}번 되살렸는데 매번 도중에 끊겼습니다 — 일꾼이 이 요청을 처리하다 멈춥니다`],
        finishedAt: new Date().toISOString()
      }, null, 2) + '\n')
      gaveUp += 1
      continue
    }

    request.restarts = tries
    fs.writeFileSync(reqPath, JSON.stringify(request, null, 2) + '\n')
    fs.unlinkSync(path.join(resDir, f))
    revived += 1
  }

  if (revived > 0) console.log(`  하다 만 요청 ${revived}건을 다시 집습니다`)
  if (gaveUp > 0) console.log(`  ${gaveUp}건은 반복해서 끊겨 실패로 적었습니다`)
}

async function main() {
  console.log('아이콘 워커 시작')
  console.log(`  claude: ${CLAUDE}`)
  console.log(`  장기 토큰: ${fs.existsSync(AUTH_ENV) ? '있음' : '없음 (세션 자격으로 시도)'}`)
  console.log(`  ${POLL_MS / 1000}초마다 큐를 봅니다. Ctrl+C로 멈춥니다.\n`)

  recoverStale()
  beat('시작')
  for (;;) {
    try {
      await tick()
      beat('도는 중')
    } catch (err) {
      console.error('  회차 실패:', err.message)
      // 실패해도 박동은 남긴다 — 「죽었다」와 「돌지만 실패한다」는 다른 문제다
      beat(`회차 실패: ${err.message}`.slice(0, 200))
    }
    await new Promise((r) => setTimeout(r, POLL_MS))
  }
}

main()
