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

/**
 * 사이트 유형. contracts/task-contract.schema.json의 profile enum과 같은 값이어야 한다.
 * 여기서 지정하면 프로젝트에 기록되어 에이전트가 매번 되묻지 않는다.
 */
const PROFILES = {
  'general-site': '일반사이트 — 민간 기업·브랜드·캠페인. 정부 상징/공식 배너 제외',
  'public-service': '공공서비스 — 민원·신청·조회. KRDS 서비스 패턴 적극 적용',
  'public-institution': '공공기관 — 기관 대표 홈페이지. 기관 CI/BI 우선',
  'cms-admin': 'CMS·관리자 — 고밀도 정보, 폼/테이블/필터. 정부 아이덴티티 제외',
  'commerce-reservation': '커머스·예약 — 상품·주문·결제 접근성, 명확한 CTA'
}

/**
 * 납품본에서 제외하는 사내 운영 자산.
 * 발주처에 넘기는 것은 생성된 사이트이지 infoUX 운영 체계가 아니다.
 * 근거: 2026-07-29 납품 범위 결정.
 */
const INTERNAL_ONLY = [
  'AGENTS.md',
  'CLAUDE.md',
  'PUBLISHER_GUIDE.md',
  'INSTACK_GUIDE.md',
  '.cursorrules',
  '.github',
  'prompts'
]

/**
 * 사내 자산처럼 보이지만 빼면 안 되는 것들 — 납품본도 스스로 검증할 수 있어야 한다.
 * - contracts/html-page-contract.json: check-html-structure.js가 section archetype 목록을 여기서 읽는다.
 *   빼면 정상 마크업이 R-18 위반으로 잡힌다(2026-07-29 실제로 발생).
 * - scripts/, tokens/: 빌드와 검사의 실체다.
 */
const DELIVERABLE_REQUIRED = ['contracts', 'scripts', 'tokens']

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
    } else if (a === '--profile') {
      args.flags.profile = argv[++i]
    } else if (a === '--brand') {
      args.flags.brand = argv[++i]
    } else if (a === '--deliver') {
      args.flags.deliver = true
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
  --profile <type>   사이트 유형 지정 (아래 목록)
  --brand <path>     브랜드 토큰 파일 주입 (tokens/brand.json 교체)
  --deliver          납품본 생성 — 사내 운영 문서 제외
  --skip-install     의존성 설치 건너뛰기
  --no-git           git init 건너뛰기
  --template <name>  스타터 템플릿 (기본: starter)
  --help, -h         이 도움말
  --version, -v      버전

${BOLD}사이트 유형:${RESET}
${Object.entries(PROFILES).map(([k, v]) => `  ${k.padEnd(22)}${DIM}${v}${RESET}`).join('\n')}

${BOLD}예시:${RESET}
  npx create-infomind-ux my-app
  npx create-infomind-ux jdc-portal --profile public-institution --brand ./jdc-brand.json
  npx create-infomind-ux client-site --profile commerce-reservation --deliver
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


// ─── 옵션 처리 ─────────────────────────────────────────

function validateProfile(profile) {
  if (!profile) return
  if (!PROFILES[profile]) {
    die(`알 수 없는 사이트 유형: "${profile}"\n  가능한 값: ${Object.keys(PROFILES).join(', ')}`)
  }
}

function readBrandFile(brandPath) {
  if (!brandPath) return null
  const resolved = path.resolve(brandPath)
  if (!fs.existsSync(resolved)) die(`브랜드 파일을 찾을 수 없습니다: ${resolved}`)

  let brand
  try {
    brand = JSON.parse(fs.readFileSync(resolved, 'utf-8'))
  } catch (e) {
    die(`브랜드 파일이 올바른 JSON이 아닙니다: ${e.message}`)
  }

  // 라이트만 채우고 고대비를 잊는 것이 가장 흔한 사고다. 생성 시점에 막는다.
  const color = brand?.primitive?.color
  if (!color) die('브랜드 파일에 primitive.color가 없습니다. 원본 tokens/brand.json 구조를 따르세요.')

  const problems = []
  for (const group of ['primary', 'secondary', 'point']) {
    const light = Object.keys(color.light?.[group] ?? {}).sort()
    const contrast = Object.keys(color['high-contrast']?.[group] ?? {}).sort()
    if (light.length === 0) { problems.push(`${group}: light 팔레트가 비어 있음`); continue }
    const missing = light.filter(stage => !contrast.includes(stage))
    if (missing.length) problems.push(`${group}: high-contrast에 ${missing.join(', ')} 단계 없음`)
  }
  if (problems.length) {
    die(`브랜드 파일 모드 정합 실패:\n  - ${problems.join('\n  - ')}\n  라이트와 고대비 두 모드를 모두 채워야 합니다.`)
  }

  return { resolved, brand }
}

/** 사이트 유형을 프로젝트에 남긴다 — 에이전트가 매번 되묻지 않게 한다. */
function writeProjectProfile(projectPath, profile) {
  const configPath = path.join(projectPath, 'infoux.json')
  fs.writeFileSync(configPath, JSON.stringify({
    profile,
    note: 'infoUX 사이트 유형. AI 도구는 이 값을 사이트 유형 판정 결과로 사용한다. 값은 contracts/task-contract.schema.json의 profile enum을 따른다.'
  }, null, 2) + '\n')

  // 에이전트 지시 파일에도 한 줄 박아 둔다. infoux.json을 안 읽는 도구도 있다.
  for (const name of ['CLAUDE.md', 'AGENTS.md']) {
    const docPath = path.join(projectPath, name)
    if (!fs.existsSync(docPath)) continue
    const body = fs.readFileSync(docPath, 'utf-8')
    fs.writeFileSync(docPath,
      `> **이 프로젝트의 사이트 유형: \`${profile}\`** — ${PROFILES[profile]}\n` +
      '> 사이트 유형을 다시 판정하지 않는다. 바꿔야 하면 UX팀에 확인한다.\n\n' + body)
  }
}

/** 납품본에서 사내 운영 자산을 걷어낸다. 검증에 필요한 것은 남긴다. */
function stripInternal(projectPath) {
  const removed = []
  for (const name of INTERNAL_ONLY) {
    const target = path.join(projectPath, name)
    if (!fs.existsSync(target)) continue
    fs.rmSync(target, { recursive: true, force: true })
    removed.push(name)
  }

  const missing = DELIVERABLE_REQUIRED.filter(name => !fs.existsSync(path.join(projectPath, name)))
  if (missing.length) {
    die(`납품본에 필수 자산이 없습니다: ${missing.join(', ')}\n  이것들이 없으면 발주처가 빌드·검증을 못 합니다.`)
  }
  return removed
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
  validateProfile(args.flags.profile)
  const brandInput = readBrandFile(args.flags.brand)

  const projectPath = path.resolve(projectName)

  console.log('')
  log('▸', `${BOLD}create-infomind-ux${RESET} — 새 프로젝트 생성`, CYAN)
  console.log(`  ${DIM}이름:${RESET} ${projectName}`)
  console.log(`  ${DIM}위치:${RESET} ${projectPath}`)
  console.log(`  ${DIM}템플릿:${RESET} ${REPO}@${DEFAULT_BRANCH}`)
  if (args.flags.profile) console.log(`  ${DIM}사이트 유형:${RESET} ${args.flags.profile}`)
  if (brandInput) console.log(`  ${DIM}브랜드:${RESET} ${brandInput.resolved}`)
  if (args.flags.deliver) console.log(`  ${DIM}모드:${RESET} 납품본 (사내 운영 문서 제외)`)
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

  // 3-1. 사이트 유형 기록
  if (args.flags.profile) {
    writeProjectProfile(projectPath, args.flags.profile)
    log('   ', `사이트 유형 기록: ${args.flags.profile}`, DIM)
  }

  // 3-2. 브랜드 토큰 주입
  if (brandInput) {
    fs.writeFileSync(
      path.join(projectPath, 'tokens', 'brand.json'),
      JSON.stringify(brandInput.brand, null, 2) + '\n'
    )
    log('   ', '브랜드 토큰 주입 완료', DIM)
  }

  // 3-3. 납품본 정리
  let removed = []
  if (args.flags.deliver) {
    removed = stripInternal(projectPath)
    log('   ', `납품본 정리: ${removed.length}개 사내 자산 제외`, DIM)
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
  console.log(`${DIM}브랜드 변경:${RESET}   tokens/brand.json 편집 → npm run build → npm run check`)
  console.log(`${DIM}AI 기준 연결:${RESET}  claude mcp add infoux -- npx -y @infomind-ux/infoux-mcp`)
  if (args.flags.deliver) {
    console.log('')
    console.log(`${YELLOW}납품본입니다.${RESET} 제외된 사내 자산: ${removed.join(', ') || '없음'}`)
    console.log(`${DIM}이 폴더에는 infoUX 버전을 남기지 않습니다. 파생 버전은 UX팀 원장에 기록하세요.${RESET}`)
  }
  const guideVersion = require('../package.json').version
  console.log('')
  console.log(`${DIM}이 프로젝트는 create-infomind-ux ${guideVersion} 파생입니다. 위키 대응표에 기록하세요.${RESET}`)
  console.log('')
}

main().catch((e) => {
  console.error(`${RED}예상 못한 오류: ${e.message}${RESET}`)
  if (process.env.DEBUG) console.error(e.stack)
  process.exit(1)
})
