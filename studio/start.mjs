#!/usr/bin/env node
// 아이콘 스튜디오 한 번에 켜기 — `npm run studio`
//
// 왜 하나로 묶나:
//   서버와 일꾼을 따로 띄우게 하면 하나를 빠뜨린다. 그러면 「만들기」를 눌러도
//   영영 「차례를 기다리는 중」에 머물고, 디자이너는 무엇이 잘못됐는지 알 수 없다.
//   두 개를 함께 띄우고, 브라우저까지 열어 준다.
//
// 인증이 없으면 켜기 전에 알려 준다. 일꾼이 조용히 실패하는 것보다 낫다.
//
// 실행:  npm run studio
//        PORT=4800 npm run studio     다른 포트로
//        npm run studio -- --no-open  브라우저 자동 열기 끄기

import { spawn } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const PORT = Number(process.env.PORT || 4700)
const AUTH_ENV = path.join(os.homedir(), '.config/icon-studio/auth.env')
const NO_OPEN = process.argv.includes('--no-open')

const C = {
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`
}

function findClaude() {
  const candidates = [
    process.env.CLAUDE_BIN,
    path.join(os.homedir(), '.local/bin/claude'),
    path.join(os.homedir(), '.claude/local/claude'),
    '/opt/homebrew/bin/claude',
    '/usr/local/bin/claude'
  ].filter(Boolean)
  return candidates.find((c) => fs.existsSync(c)) || null
}

// ── 켜기 전 점검 ──────────────────────────────────────

const claude = findClaude()
const hasToken = fs.existsSync(AUTH_ENV)

console.log('')
console.log(C.bold('  아이콘 스튜디오'))
console.log('')

if (!claude) {
  console.log(C.yellow('  ⚠ Claude를 찾지 못했습니다.'))
  console.log(C.dim('    「찾기」와 「내보내기」는 그대로 되지만 「만들기」는 안 됩니다.'))
  console.log('')
} else if (!hasToken) {
  console.log(C.yellow('  ⚠ 장기 토큰이 없습니다 — 세션 자격으로 시도합니다.'))
  console.log(C.dim('    「만들기」가 인증 오류로 멈추면 아래를 한 번 실행하세요.'))
  console.log(C.dim('      bash scripts/setup-claude-auth.sh'))
  console.log('')
}

// ── 두 프로세스 띄우기 ────────────────────────────────

const children = []

function run(name, script) {
  const p = spawn(process.execPath, [path.join(HERE, script)], {
    env: { ...process.env, PORT: String(PORT) },
    stdio: ['ignore', 'pipe', 'pipe']
  })
  const tag = C.dim(`[${name}]`)
  const relay = (stream) => {
    let buf = ''
    stream.on('data', (d) => {
      buf += d
      const lines = buf.split('\n')
      buf = lines.pop() ?? ''
      for (const l of lines) if (l.trim()) console.log(`  ${tag} ${l}`)
    })
  }
  relay(p.stdout)
  relay(p.stderr)
  p.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.log(`  ${tag} ${C.yellow(`멈췄습니다 (코드 ${code})`)}`)
    }
  })
  children.push(p)
  return p
}

run('화면', 'server.mjs')
if (claude) run('일꾼', 'worker.mjs')

// ── 브라우저 열기 ─────────────────────────────────────

if (!NO_OPEN) {
  setTimeout(() => {
    const url = `http://127.0.0.1:${PORT}`
    const opener = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open'
    spawn(opener, [url], { stdio: 'ignore', detached: true }).unref()
    console.log('')
    console.log(`  ${C.green('열림')}  ${url}`)
    console.log(C.dim('  멈추려면 Ctrl+C'))
    console.log('')
  }, 1200)
}

// ── 정리 ──────────────────────────────────────────────

let closing = false
const shutdown = () => {
  if (closing) return
  closing = true
  console.log('')
  console.log(C.dim('  멈춥니다…'))
  for (const c of children) c.kill('SIGTERM')
  setTimeout(() => process.exit(0), 400)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
