// 아이콘 계층 검증 — 규격·대장·빌드 산출물이 서로 어긋나지 않는지 본다.
//
// 여기 있는 테스트는 대부분 2026-08-23에 실제로 밟은 지뢰다.
//   · path의 첫 moveto가 소문자면 절대 좌표인데 상대로 처리해 14종이 밀렸다
//   · 폰트 변환에서 y축을 미리 뒤집어 이중 반전이 났다 (좌우대칭만 멀쩡했다)
//   · 획 굵기를 세트 중앙값과 견줘 씨앗 22종이 거짓 경고로 떴다
// 다시 밟지 않도록 고정한다.

const fs = require('node:fs')
const path = require('node:path')
const crypto = require('node:crypto')
const { test } = require('node:test')
const assert = require('node:assert/strict')

const { transformPath, pathBounds } = require('../lib/svg-path')
const { measure } = require('../lib/svg-geometry')

const ROOT = path.resolve(__dirname, '..', '..')
const contract = JSON.parse(fs.readFileSync(path.join(ROOT, 'contracts/icon-contract.json'), 'utf8'))
const ledger = JSON.parse(fs.readFileSync(path.join(ROOT, 'contracts/icon-codepoints.json'), 'utf8'))
const SVG_DIR = path.join(ROOT, 'assets/icons/svg')

const CANVAS = contract.canvas.width
const names = Object.keys(ledger.icons)

function readSvg(name) {
  return fs.readFileSync(path.join(SVG_DIR, `${name}.svg`), 'utf8')
}
function readPaths(name) {
  return [...readSvg(name).matchAll(/<path[^>]*\sd="([^"]+)"/g)].map((m) => m[1])
}

// ── 좌표 변환 ──────────────────────────────────────────

test('첫 moveto는 소문자여도 절대 좌표로 다룬다', () => {
  // Material의 arrow_back 원본. m으로 시작한다.
  const d = 'm313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z'
  const out = transformPath(d, { scale: 24 / 960, dx: 0, dy: 960, decimals: 2 })
  const b = pathBounds(out)

  assert.ok(b.minY >= 0, `y가 음수다 (${b.minY}) — 첫 moveto를 상대로 처리하면 -960만큼 밀린다`)
  assert.ok(b.maxY <= CANVAS, `y가 캔버스를 넘는다 (${b.maxY})`)
  assert.ok(out.startsWith('M'), '첫 moveto는 M으로 정규화한다')
})

test('상대 명령에는 이동을 적용하지 않는다', () => {
  // 같은 오프셋이 절대/상대에서 다르게 다뤄져야 한다
  const abs = transformPath('M0 0L100 100', { scale: 0.1, dx: 0, dy: 100, decimals: 2 })
  const rel = transformPath('M0 0l100 100', { scale: 0.1, dx: 0, dy: 100, decimals: 2 })
  assert.notEqual(abs, rel, '절대와 상대가 같게 나오면 이동이 잘못 적용된 것이다')
})

test('숫자 구분자가 생략된 path를 바르게 읽는다', () => {
  const { parseNumbers } = require('../lib/svg-path')
  assert.deepEqual(parseNumbers('784-120'), [784, -120])
  assert.deepEqual(parseNumbers('1.5.5'), [1.5, 0.5])
  assert.deepEqual(parseNumbers('75.5-184.5'), [75.5, -184.5])
})

// ── 자산 규격 ──────────────────────────────────────────

test('아이콘 파일과 대장이 1:1로 맞는다', () => {
  const files = fs.readdirSync(SVG_DIR).filter((f) => f.endsWith('.svg')).map((f) => f.replace(/\.svg$/, ''))
  assert.deepEqual(files.sort(), [...names].sort(), '파일과 대장이 어긋나면 빌드 결과가 조용히 달라진다')
})

test('모든 아이콘이 규격을 지킨다', () => {
  for (const name of names) {
    const svg = readSvg(name)
    assert.match(svg, /viewBox="0 0 24 24"/, `${name}: viewBox가 다르다`)
    assert.match(svg, /fill="currentColor"/, `${name}: currentColor가 없다`)
    assert.doesNotMatch(svg, /\sstroke=/, `${name}: stroke 속성은 금지다 — 선을 면으로 변환한다`)
    assert.doesNotMatch(svg, /#[0-9A-Fa-f]{3,6}/, `${name}: 하드코딩 색상이 있다`)
    assert.doesNotMatch(svg, /<(circle|rect|ellipse|line|polygon|polyline)\b/, `${name}: path가 아닌 도형이 있다`)
  }
})

test('모든 아이콘이 캔버스 안에 있다', () => {
  for (const name of names) {
    const b = pathBounds(readPaths(name).join(' '))
    assert.ok(b, `${name}: path를 읽지 못했다`)
    const slack = 0.5
    assert.ok(b.minX >= -slack && b.minY >= -slack, `${name}: 좌표가 음수다 x${b.minX} y${b.minY}`)
    assert.ok(b.maxX <= CANVAS + slack && b.maxY <= CANVAS + slack, `${name}: 캔버스를 넘는다`)
  }
})

test('이름이 의미적이다 — 시각적 단어를 쓰지 않는다', () => {
  const re = new RegExp(contract.naming.pattern)
  const forbidden = new Set(contract.naming.forbiddenWords)
  for (const name of names) {
    assert.match(name, re, `${name}: 이름 규칙 위반`)
    const bad = name.split('-').filter((s) => forbidden.has(s))
    assert.equal(bad.length, 0, `${name}: 금지 단어 ${bad.join(',')}`)
  }
})

test('대장의 sha256이 실제 파일과 일치한다', () => {
  for (const name of names) {
    const meta = ledger.icons[name]
    if (!meta.sha256) continue
    const actual = crypto.createHash('sha256').update(readSvg(name)).digest('hex')
    assert.equal(actual, meta.sha256, `${name}: 파일이 대장과 다르다 — 손으로 고쳤다면 대장도 갱신한다`)
  }
})

// ── 코드포인트 ─────────────────────────────────────────

test('코드포인트가 겹치지 않는다', () => {
  const seen = new Map()
  for (const [name, meta] of Object.entries(ledger.icons)) {
    assert.ok(meta.codepoint, `${name}: 코드포인트가 없다`)
    assert.equal(seen.has(meta.codepoint), false, `${meta.codepoint} 중복 — ${name}과 ${seen.get(meta.codepoint)}`)
    seen.set(meta.codepoint, name)
  }
})

test('코드포인트가 계약 범위 안에 있다', () => {
  const start = parseInt(contract.codepoints.range.start.replace('U+', ''), 16)
  const end = parseInt(contract.codepoints.range.end.replace('U+', ''), 16)
  for (const [name, meta] of Object.entries(ledger.icons)) {
    const cp = parseInt(meta.codepoint.replace('U+', ''), 16)
    assert.ok(cp >= start && cp <= end, `${name}: ${meta.codepoint}이 범위 밖이다`)
  }
})

test('폐기된 번호를 재사용하지 않는다', () => {
  const tombs = ledger.tombstones ?? {}
  for (const [name, meta] of Object.entries(ledger.icons)) {
    assert.equal(
      Object.prototype.hasOwnProperty.call(tombs, meta.codepoint),
      false,
      `${name}: ${meta.codepoint}은 폐기된 번호다 — 재사용하면 이미 납품한 사이트의 아이콘이 바뀐다`
    )
  }
})

test('출처가 계약이 허용한 것만 쓰인다', () => {
  const allowed = new Set(contract.sources.allowed.map((s) => s.id))
  for (const [name, meta] of Object.entries(ledger.icons)) {
    assert.ok(allowed.has(meta.source), `${name}: 허용되지 않은 출처 ${meta.source}`)
    assert.ok(meta.license, `${name}: 라이선스 기록이 없다`)
  }
})

// ── 빌드 산출물 ────────────────────────────────────────

test('스프라이트가 대장의 모든 아이콘을 담는다', () => {
  const p = path.join(ROOT, 'assets/icons/sprite.svg')
  if (!fs.existsSync(p)) return // 빌드 전이면 건너뛴다
  const sprite = fs.readFileSync(p, 'utf8')
  for (const name of names) {
    assert.ok(sprite.includes(`id="${name}"`), `스프라이트에 ${name}이 없다`)
  }
  assert.match(sprite, /aria-hidden="true"/, '스프라이트 자체가 화면에 잡히면 안 된다')
})

test('폰트 CSS가 대장의 코드포인트를 그대로 낸다', () => {
  const p = path.join(ROOT, 'assets/icons/icons.css')
  if (!fs.existsSync(p)) return
  const css = fs.readFileSync(p, 'utf8')
  for (const [name, meta] of Object.entries(ledger.icons)) {
    assert.ok(css.includes(`.icon-font--${name}`), `CSS에 ${name} 클래스가 없다`)
    const esc = meta.codepoint.replace('U+', '\\')
    assert.ok(css.includes(`"${esc}"`), `${name}의 content가 대장과 다르다 — 폰트와 CSS가 어긋나면 다른 그림이 나온다`)
  }
})

test('스프라이트용 .icon은 컴포넌트 레이어에 있고 생성물에 없다', () => {
  const comp = path.join(ROOT, 'src/styles/6-components/icon.css')
  assert.ok(fs.existsSync(comp), '.icon은 손으로 관리하는 컴포넌트다')
  const compCss = fs.readFileSync(comp, 'utf8')
  assert.match(compCss, /\.icon\s*\{/, '.icon 정의가 없다')
  // stylelint(value-keyword-case)가 키워드를 소문자로 바꾸므로 대소문자를 가리지 않는다
  assert.match(compCss, /fill:\s*currentcolor/i, 'currentColor 상속이 없으면 색이 안 따라간다')

  const index = fs.readFileSync(path.join(ROOT, 'src/styles/6-components/index.css'), 'utf8')
  assert.ok(index.includes('icon.css'), 'index.css에 등록되지 않으면 빌드에 안 들어간다')

  const gen = path.join(ROOT, 'assets/icons/icons.css')
  if (fs.existsSync(gen)) {
    const genCss = fs.readFileSync(gen, 'utf8')
    assert.doesNotMatch(genCss, /^\s*\.icon\s*\{/m, '생성물에 .icon이 중복 정의되면 어느 쪽이 이길지 모른다')
  }
})

test('아이콘 CSS가 색상을 하드코딩하지 않는다', () => {
  const p = path.join(ROOT, 'assets/icons/icons.css')
  if (!fs.existsSync(p)) return
  const css = fs.readFileSync(p, 'utf8')
  assert.doesNotMatch(css, /#[0-9A-Fa-f]{3,6}\b/, '색상은 CSS 토큰이 정한다 (R-01)')
})

test('라이선스 고지가 있고 Apache-2.0 변경 사항을 밝힌다', () => {
  const p = path.join(ROOT, 'assets/icons/LICENSE-NOTICE.txt')
  assert.ok(fs.existsSync(p), 'LICENSE-NOTICE.txt는 재배포 조건이다')
  const notice = fs.readFileSync(p, 'utf8')
  assert.match(notice, /Apache License/, 'Apache-2.0 고지가 없다')
  assert.match(notice, /변경 사항/, '수정 사실을 밝혀야 한다 (Apache-2.0 §4.b)')
})

// ── 기하 지표 ──────────────────────────────────────────

test('획 굵기 지표가 형태 복잡도가 아니라 두께를 잰다', () => {
  // 같은 두께의 짧은 막대와 긴 막대는 굵기가 같게 나와야 한다
  const short = measure(['M2 11h6v2H2Z'])
  const long = measure(['M2 11h20v2H2Z'])
  const diff = Math.abs(short.strokeWeight - long.strokeWeight) / long.strokeWeight
  assert.ok(diff < 0.25, `길이가 달라도 두께는 비슷해야 한다 (${short.strokeWeight.toFixed(2)} vs ${long.strokeWeight.toFixed(2)})`)

  // 두 배 두꺼운 막대는 두 배로 나와야 한다
  const thick = measure(['M2 10h20v4H2Z'])
  assert.ok(thick.strokeWeight > long.strokeWeight * 1.5, '두꺼운 막대가 더 굵게 나와야 한다')
})

test('기준선이 씨앗만으로 만들어진다', () => {
  const p = path.join(ROOT, 'contracts/icon-metrics-baseline.json')
  if (!fs.existsSync(p)) return
  const baseline = JSON.parse(fs.readFileSync(p, 'utf8'))
  const seedCount = Object.values(ledger.icons).filter((m) => m.source === baseline.generatedFrom.source).length
  assert.equal(
    baseline.generatedFrom.count,
    seedCount,
    '기준선에 자체 제작 아이콘이 섞이면 기준이 스스로 느슨해진다'
  )
  assert.ok(baseline.strokeWeight.min < baseline.strokeWeight.median)
  assert.ok(baseline.strokeWeight.median < baseline.strokeWeight.max)
})

test('폰트 빌드가 결정적이다', () => {
  // svg2ttf는 기본으로 생성 시각을 now()로 넣는다. 그대로 두면 빌드할 때마다
  // 파일이 달라져 CI의 자동 생성물 drift 검사가 영원히 실패한다
  // (2026-08-23 실측: 세 번 빌드에 해시 세 개). ts를 대장 갱신일로 고정한다.
  const src = fs.readFileSync(path.join(ROOT, 'scripts/build-icons.js'), 'utf8')
  assert.match(src, /svg2ttf\([^)]*ts:/s, '폰트 생성 시각을 고정하지 않으면 빌드가 비결정적이다')
})
