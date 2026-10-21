// 납품 페이지 범위 — 인자 없이 도는 검사(npm run check)가 실제 페이지까지 닿게 한다(HX-06)
//
// 파생 프로젝트(스타터)의 페이지는 루트 index.html·pages/에 있다. 예전 walk 모드는 src/·site/만 돌아
// 스타터의 index.html이 검사 0건으로 지나갔다. check-violations.js와 check-html-structure.js가 이 모듈로
// 같은 페이지 목록을 얻고, 여기서 나온 파일은 page 계약(skip link·header·main·footer·section 이름)을 받는다.
//
// 범위: DEFAULT_PAGE_GLOBS + infoux.json의 "pages"(글롭 배열). pages는 기본 범위에 **더하는** 것이다 —
//       빈 배열이나 좁은 목록으로 루트 페이지 검사가 꺼지지 않는다.
// 제외: 루트 기준 상대 경로의 폴더 이름이 EXCLUDED_SEGMENTS와 같을 때만 뺀다(부분 문자열이 아니다 —
//       pages/distribution.html은 남고, 상위 폴더 이름에 dist가 들어 있어도 프로젝트 전체가 빠지지 않는다).
// 글롭: '*'(폴더 경계 안), '**'(폴더 0개 이상), '?'만 지원한다(Node 20에는 fs.globSync가 없다). 대소문자는 가리지 않는다.
//       './'·역슬래시·끝의 '/'는 정규화한다. '{}'·'[]'·'!'와 루트 밖('..'·절대 경로)은 문제로 돌려준다.

const fs = require('fs')
const path = require('path')

const DEFAULT_PAGE_GLOBS = ['*.html', 'pages/**/*.html']
const EXCLUDED_SEGMENTS = new Set(['node_modules', 'dist', '_site', '.git'])

function toPosix(p) {
  return p.split(path.sep).join('/')
}

// 글롭 → 정규식. '**/'는 폴더 0개 이상, '*'·'?'는 폴더 경계를 넘지 않는다
function globToRegExp(glob) {
  let re = ''
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i]
    if (c === '*' && glob[i + 1] === '*') {
      if (glob[i + 2] === '/') {
        re += '(?:[^/]+/)*'
        i += 2
      } else {
        re += '.*'
        i += 1
      }
    } else if (c === '*') {
      re += '[^/]*'
    } else if (c === '?') {
      re += '[^/]'
    } else {
      re += c.replace(/[.+^${}()|[\]\\]/g, '\\$&')
    }
  }
  return new RegExp(`^${re}$`, 'i')
}

// 같은 뜻의 다른 표기를 한 형태로 — './pages/**/*.html', 'pages\\**\\*.html', 'pages/' 모두 'pages/**…'로
function normalizeGlob(glob) {
  let g = String(glob).trim().replace(/\\/g, '/')
  while (g.startsWith('./')) g = g.slice(2)
  if (g.endsWith('/')) g += '**/*.html'
  return g
}

function isSafeGlob(glob) {
  if (typeof glob !== 'string' || glob.trim() === '') return false
  if (path.isAbsolute(glob) || /^[a-zA-Z]:/.test(glob) || glob.startsWith('/')) return false
  return !toPosix(glob).split('/').includes('..')
}

// infoux.json의 pages 글롭을 읽어 기본 범위에 더한다.
// problems(오류): 읽을 수 없는 설정·루트 밖·지원하지 않는 문법. userGlobs: 기본 밖에서 더한 글롭(0건이면 경고 대상)
function readPageGlobs(root) {
  const base = { globs: [...DEFAULT_PAGE_GLOBS], userGlobs: [], problems: [] }
  const configPath = path.join(root, 'infoux.json')
  if (!fs.existsSync(configPath)) return base
  let config
  try {
    // Windows 편집기가 붙이는 BOM을 떼고 읽는다
    config = JSON.parse(fs.readFileSync(configPath, 'utf8').replace(/^\uFEFF/, ''))
  } catch (e) {
    return { ...base, problems: [`infoux.json을 읽을 수 없다: ${e.message}`] }
  }
  if (config.pages === undefined) return base
  if (!Array.isArray(config.pages)) {
    return { ...base, problems: ['infoux.json의 pages는 글롭 문자열 배열이어야 한다'] }
  }
  const problems = []
  const userGlobs = []
  for (const raw of config.pages) {
    if (typeof raw !== 'string' || !isSafeGlob(normalizeGlob(raw))) {
      problems.push(`infoux.json pages의 "${raw}"는 프로젝트 루트 밖을 가리키거나 비어 있어 쓰지 않는다`)
      continue
    }
    const g = normalizeGlob(raw)
    if (/[{}[\]!]/.test(g)) {
      problems.push(`infoux.json pages의 "${raw}"에 지원하지 않는 글롭 문법({} [] !)이 있다 — '*', '**', '?'만 쓴다`)
      continue
    }
    if (!base.globs.includes(g) && !userGlobs.includes(g)) userGlobs.push(g)
  }
  return { globs: [...base.globs, ...userGlobs], userGlobs, problems }
}

// 페이지 유형(K-16) — infoux.json "pageTypes": { "글롭": "유형" | { "type": "유형", "depth": 수 } }
//   유형은 Task Contract pageType과 같은 열거값이다. 위에서부터 처음 맞는 글롭을 쓴다.
//   depth는 홈을 1로 센 메뉴 단계(홈>알림마당>공지사항 = 3) — 경로로 추측하지 않는다(pages/about.html은 2단계일 수 있다)
const PAGE_TYPES = ['main', 'sub-content', 'board-list', 'board-detail', 'form', 'search-result', 'error']
function readPageTypes(root) {
  const out = { entries: [], problems: [] }
  const configPath = path.join(root, 'infoux.json')
  if (!fs.existsSync(configPath)) return out
  let config
  try {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8').replace(/^\uFEFF/, ''))
  } catch {
    return out // 읽기 오류는 readPageGlobs가 알린다
  }
  if (config.pageTypes === undefined) return out
  if (!config.pageTypes || typeof config.pageTypes !== 'object' || Array.isArray(config.pageTypes)) {
    return { entries: [], problems: ['infoux.json의 pageTypes는 { "글롭": "유형" } 객체여야 한다'] }
  }
  for (const [raw, value] of Object.entries(config.pageTypes)) {
    const g = normalizeGlob(raw)
    if (!isSafeGlob(g) || /[{}[\]!]/.test(g)) {
      out.problems.push(`infoux.json pageTypes의 "${raw}"는 쓸 수 없는 글롭이다 — 루트 안에서 '*', '**', '?'만 쓴다`)
      continue
    }
    const spec = typeof value === 'string' ? { type: value } : value || {}
    if (!PAGE_TYPES.includes(spec.type)) {
      out.problems.push(`infoux.json pageTypes["${raw}"]의 유형 "${spec.type}"은 없는 값이다 — ${PAGE_TYPES.join(', ')} 중 하나`)
      continue
    }
    if (spec.depth !== undefined && !(Number.isInteger(spec.depth) && spec.depth >= 1)) {
      out.problems.push(`infoux.json pageTypes["${raw}"]의 depth는 1 이상의 정수다(홈 = 1)`)
      continue
    }
    out.entries.push({ glob: g, re: globToRegExp(g), type: spec.type, depth: spec.depth })
  }
  return out
}
// 파일 하나의 선언된 유형 — 상대 경로는 '/' 구분. 없으면 null
function pageTypeOf(root, rel) {
  const hit = readPageTypes(root).entries.find(e => e.re.test(rel))
  return hit ? { type: hit.type, depth: hit.depth } : null
}

// 폴더(상대 경로 조각들) 아래에서 이 글롭이 맞을 수 있는가 — 맞을 수 없는 폴더는 내려가지 않는다
// (저장소 전체를 훑지 않도록. '*.html'이면 루트 바로 아래만 본다)
function canDescend(dirSegments, globSegments) {
  for (let i = 0; i < dirSegments.length; i++) {
    const g = globSegments[i]
    if (g === undefined) return false
    if (g === '**') return true
    if (i === globSegments.length - 1) return false // 마지막 조각은 파일 이름 자리다
    if (!globToRegExp(g).test(dirSegments[i])) return false
  }
  return true
}

// 루트 아래 .html을 모아 글롭에 맞는 것만 돌려준다(절대 경로, 정렬)
// notices(경고): 사용자가 더한 글롭이 아무 파일에도 맞지 않을 때 — 오타로 페이지가 검사 밖에 남지 않게
function collectPageFiles(root) {
  const { globs, userGlobs, problems: globProblems } = readPageGlobs(root)
  const problems = [...globProblems, ...readPageTypes(root).problems]
  const patterns = globs.map(globToRegExp)
  const userPatterns = userGlobs.map(g => [g, globToRegExp(g)])
  const userHits = new Set()
  const globSegments = globs.map(g => g.split('/'))
  const files = []
  const walk = (dir, relSegments) => {
    if (!fs.existsSync(dir)) return
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (EXCLUDED_SEGMENTS.has(entry.name)) continue
      const segments = [...relSegments, entry.name]
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        if (globSegments.some(gs => canDescend(segments, gs))) walk(full, segments)
      } else if (/\.html$/i.test(entry.name)) {
        const rel = segments.join('/')
        if (!patterns.some(re => re.test(rel))) continue
        files.push(full)
        for (const [g, re] of userPatterns) if (re.test(rel)) userHits.add(g)
      }
    }
  }
  walk(root, [])
  const notices = userGlobs
    .filter(g => !userHits.has(g))
    .map(g => `infoux.json pages의 "${g}"에 맞는 .html이 없다 — 경로·철자를 확인한다(node_modules·dist·_site·.git 아래는 검사하지 않는다)`)
  return { files: files.sort(), problems, notices }
}

// 파일 하나가 납품 페이지인가(편집 훅이 쓴다) — 상대 경로는 '/' 구분
function isPagePath(root, rel) {
  if (rel.split('/').some(seg => EXCLUDED_SEGMENTS.has(seg))) return false
  if (!/\.html$/i.test(rel)) return false
  return readPageGlobs(root).globs.some(g => globToRegExp(g).test(rel))
}

module.exports = { DEFAULT_PAGE_GLOBS, EXCLUDED_SEGMENTS, PAGE_TYPES, globToRegExp, normalizeGlob, isSafeGlob, canDescend, readPageGlobs, readPageTypes, pageTypeOf, collectPageFiles, isPagePath }
