#!/usr/bin/env node

/**
 * create-infomind-ux — INFOMIND UX 스타터 키트로 새 프로젝트 생성
 *
 * 사용법:
 *   npx create-infomind-ux <project-name>
 *   npx create-infomind-ux <project-name> --skip-install
 *   npx create-infomind-ux <project-name> --template starter --no-git
 *
 * 동작:
 *   1. iux-pub/starter 저장소를 GitHub tarball로 다운로드
 *   2. <project-name> 폴더에 압축 해제
 *   3. package.json name 변경
 *   4. git init (--no-git 옵션 시 생략)
 *   5. npm install (--skip-install 옵션 시 생략)
 *   6. 다음 단계 안내 출력
 *
 * Zero dependency: Node 표준 라이브러리만 사용 (https/fs/child_process/path)
 */

'use strict'

const fs = require('fs')
const path = require('path')
const https = require('https')
const { execSync, spawnSync } = require('child_process')
const os = require('os')

// ─── 상수 ──────────────────────────────────────────────

const REPO = 'iux-pub/starter'
const DEFAULT_BRANCH = 'main'
const TARBALL_URL = `https://codeload.github.com/${REPO}/tar.gz/refs/heads/${DEFAULT_BRANCH}`

const RESET = '\x1b[0m'
const BOLD = '\x1b[1m'
const DIM = '\x1b[2m'
const CYAN = '\x1b[36m'
const GREEN = '\x1b[32m'
const YELLOW = '\x1b[33m'
const RED = '\x1b[31m'

// ─── CLI 인자 파싱 ─────────────────────────────────────

function parseArgs(argv) {
  const args = { _: [], flags: {} }
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--help' || a === '-h') {
      args.flags.help = true
    } else if (a === '--version' || a === '-v') {
      args.flags.version = true
    } else if (a === '--skip-install') {
      args.flags.skipInstall = true
    } else if (a === '--no-git') {
      args.flags.noGit = true
    } else if (a === '--template') {
      args.flags.template = argv[++i] || 'starter'
    } else if (!a.startsWith('-')) {
      args._.push(a)
    } else {
      console.error(`${RED}알 수 없는 옵션: ${a}${RESET}`)
      process.exit(1)
    }
  }
  return args
}

function showHelp() {
  console.log(`
${BOLD}create-infomind-ux${RESET} — INFOMIND UX 스타터로 새 프로젝트 생성

${BOLD}사용법:${RESET}
  npx create-infomind-ux <project-name> [옵션]

${BOLD}옵션:${RESET}
  --skip-install     의존성 설치 건너뛰기
  --no-git           git init 건너뛰기
  --template <name>  스타터 템플릿 (기본: starter)
  --help, -h         이 도움말
  --version, -v      버전

${BOLD}예시:${RESET}
  npx create-infomind-ux my-app
  npx create-infomind-ux gov-portal --skip-install
`)
}

// ─── 헬퍼 ──────────────────────────────────────────────

function log(symbol, msg, color = CYAN) {
  console.log(`${color}${symbol}${RESET} ${msg}`)
}

function die(msg, code = 1) {
  console.error(`${RED}✗ ${msg}${RESET}`)
  process.exit(code)
}

function validateName(name) {
  if (!name) die('프로젝트 이름이 필요합니다. npx create-infomind-ux <project-name>')
  if (!/^[a-z][a-z0-9-]*$/.test(name)) {
    die(`프로젝트 이름은 소문자/숫자/하이픈만 가능: "${name}"`)
  }
  if (fs.existsSync(name)) {
    die(`디렉토리 "${name}"가 이미 존재합니다. 다른 이름을 쓰세요.`)
  }
}

// HTTPS GET → 파일로 저장 (리다이렉트 따라감)
function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest)
    const req = (u) => https.get(u, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return req(res.headers.location)
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} from ${u}`))
      }
      res.pipe(file)
      file.on('finish', () => file.close(() => resolve()))
    }).on('error', (e) => {
      fs.unlink(dest, () => reject(e))
    })
    req(url)
  })
}

// tar 압축 해제 — 시스템 tar 사용
function extractTar(tarPath, outDir) {
  try {
    execSync(`tar -xzf "${tarPath}" -C "${outDir}" --strip-components=1`, { stdio: 'pipe' })
  } catch (e) {
    die(`tar 압축 해제 실패: ${e.message}`)
  }
}

// ─── 메인 ──────────────────────────────────────────────

async function main() {
  const args = parseArgs(process.argv)

  if (args.flags.help) { showHelp(); return }
  if (args.flags.version) {
    const pkg = require('../package.json')
    console.log(pkg.version)
    return
  }

  const projectName = args._[0]
  validateName(projectName)

  const projectPath = path.resolve(projectName)

  console.log('')
  log('▸', `${BOLD}create-infomind-ux${RESET} — 새 프로젝트 생성`, CYAN)
  console.log(`  ${DIM}이름:${RESET} ${projectName}`)
  console.log(`  ${DIM}위치:${RESET} ${projectPath}`)
  console.log(`  ${DIM}템플릿:${RESET} ${REPO}@${DEFAULT_BRANCH}`)
  console.log('')

  // 1. 다운로드
  log('1/5', 'starter 키트 다운로드 중...')
  const tmpTarball = path.join(os.tmpdir(), `infomind-starter-${Date.now()}.tar.gz`)
  try {
    await download(TARBALL_URL, tmpTarball)
  } catch (e) {
    die(`다운로드 실패: ${e.message}\n  네트워크 또는 ${REPO} 저장소 접근 확인.`)
  }

  // 2. 압축 해제
  log('2/5', '압축 해제 중...')
  fs.mkdirSync(projectPath, { recursive: true })
  extractTar(tmpTarball, projectPath)
  fs.unlinkSync(tmpTarball)

  // 3. package.json name 변경
  log('3/5', 'package.json 갱신 중...')
  const pkgPath = path.join(projectPath, 'package.json')
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
    pkg.name = projectName
    pkg.version = '0.1.0'
    delete pkg.description
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
  }

  // 4. git init
  if (!args.flags.noGit) {
    log('4/5', 'git 초기화 중...')
    spawnSync('git', ['init', '--quiet'], { cwd: projectPath, stdio: 'pipe' })
    spawnSync('git', ['add', '.'], { cwd: projectPath, stdio: 'pipe' })
    spawnSync('git', ['commit', '--quiet', '-m', `chore: ${projectName} 초기화 (create-infomind-ux)`], {
      cwd: projectPath, stdio: 'pipe',
    })
  } else {
    log('4/5', 'git 초기화 건너뜀 (--no-git)', DIM)
  }

  // 5. npm install
  if (!args.flags.skipInstall) {
    log('5/5', '의존성 설치 중... (1~2분)')
    const result = spawnSync('npm', ['install'], { cwd: projectPath, stdio: 'inherit' })
    if (result.status !== 0) {
      console.log('')
      console.log(`${YELLOW}⚠ 의존성 설치 실패. 디렉토리는 생성됨. 수동으로:${RESET}`)
      console.log(`  cd ${projectName} && npm install`)
    }
  } else {
    log('5/5', '의존성 설치 건너뜀 (--skip-install)', DIM)
  }

  // 완료 안내
  console.log('')
  console.log(`${GREEN}${BOLD}✓ 완료!${RESET} ${projectName} 프로젝트 생성됨`)
  console.log('')
  console.log(`${BOLD}다음 단계:${RESET}`)
  console.log('')
  console.log(`  ${CYAN}cd ${projectName}${RESET}`)
  if (args.flags.skipInstall) {
    console.log(`  ${CYAN}npm install${RESET}`)
  }
  console.log(`  ${CYAN}npm run dev${RESET}          # 개발 서버 (http://localhost:8080)`)
  console.log('')
  console.log(`${DIM}토큰 변경:${RESET}       tokens/foundation.json 편집 → npm run build`)
  console.log(`${DIM}AI 컨트랙트 발효:${RESET}    "info-design 스킬 기준으로 가자" 발화`)
  console.log(`${DIM}문서:${RESET}              ${projectName}/README.md · CLAUDE.md · .claude/skills/info-design/SKILL.md`)
  console.log('')
}

main().catch((e) => {
  console.error(`${RED}예상 못한 오류: ${e.message}${RESET}`)
  if (process.env.DEBUG) console.error(e.stack)
  process.exit(1)
})
