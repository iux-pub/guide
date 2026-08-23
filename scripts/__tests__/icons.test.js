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

test('면적은 evenodd 기준으로 센다 — 감는 방향에 휘둘리지 않는다', () => {
  // 바깥과 안쪽을 **같은 방향**으로 그린 테두리. 우리 규격은 fill-rule=evenodd라
  // 가운데가 정상적으로 뚫린다. 부호(감는 방향)로 면적을 더하면 둘이 합쳐져
  // 「꽉 찬 덩어리」로 오판한다 — 2026-08-23에 이 버그로 정상 아이콘을 여섯 번
  // 불량으로 판정했다.
  const sameDir = measure(['M2 2h20v20H2Z M4 4h16v16H4Z'])
  const oppDir = measure(['M2 2h20v20H2Z M4 20h16V4H4Z']) // 안쪽만 반대 방향

  assert.ok(Math.abs(sameDir.strokeWeight - oppDir.strokeWeight) < 0.2,
    `감는 방향이 달라도 같게 나와야 한다 (${sameDir.strokeWeight.toFixed(2)} vs ${oppDir.strokeWeight.toFixed(2)})`)

  // 테두리 두께 2 → 획 굵기도 2 언저리여야 한다
  assert.ok(sameDir.strokeWeight > 1.5 && sameDir.strokeWeight < 2.6,
    `두께 2 테두리인데 ${sameDir.strokeWeight.toFixed(2)}로 나왔다`)

  // 정말 꽉 찬 사각형은 확실히 커야 한다
  const solid = measure(['M2 2h20v20H2Z'])
  assert.ok(solid.strokeWeight > 5, `꽉 찬 사각형은 크게 나와야 한다 (${solid.strokeWeight.toFixed(2)})`)
})

test('내부 요소가 구멍 안에 있으면 다시 칠해진다', () => {
  // 테두리(깊이 0·1) 안의 점(깊이 2)은 evenodd 홀짝 규칙상 칠해진 영역이다.
  // 이걸 구멍으로 세면 면적이 음수로 깎여 획이 가늘게 나온다.
  const withDots = measure(['M2 2h20v20H2Z M4 4h16v16H4Z M10 10h4v4h-4Z'])
  const noDots = measure(['M2 2h20v20H2Z M4 4h16v16H4Z'])
  assert.ok(withDots.area > noDots.area, '내부 점이 면적에 더해져야 한다')
})

test('기준선이 계약이 정한 기본 굵기와 맞는다', () => {
  const p = path.join(ROOT, 'contracts/icon-metrics-baseline.json')
  if (!fs.existsSync(p)) return
  const b = JSON.parse(fs.readFileSync(p, 'utf8')).strokeWeight

  // 기준선은 기본 표정(regular)의 실측이다. 계약의 기본 굵기가 바뀌면 여기도
  // 따라와야 한다 — 안 따라오면 자체 제작 아이콘이 옛 굵기로 판정된다.
  // 2026-08-23: 구글 기본(wght400·획 2.0)이 24px에서 본문보다 무거워 wght300으로 내렸다.
  const contract = JSON.parse(fs.readFileSync(path.join(ROOT, 'contracts/icon-contract.json'), 'utf8'))
  const base = contract.variants.combinations.find((c) => c.default)
  const expected = { 200: 1.0, 300: 1.5, 400: 2.0 }[base.weight]
  assert.ok(expected, `기본 굵기 ${base.weight}에 대응하는 실측 기대값이 없다 — 이 표를 갱신한다`)
  assert.ok(
    Math.abs(b.median - expected) < 0.25,
    `중앙값 ${b.median} — 기본 굵기 ${base.weight}이면 ${expected} 언저리여야 한다`
  )
  assert.ok(b.min > expected * 0.6, `최솟값 ${b.min} — 구멍 있는 아이콘을 잘못 재고 있을 수 있다`)
})

// ── 표정 ───────────────────────────────────────────────

test('표정 사다리가 얇은 것부터 굵은 것 순으로 벌어진다', () => {
  const contract = JSON.parse(fs.readFileSync(path.join(ROOT, 'contracts/icon-contract.json'), 'utf8'))
  const combos = contract.variants.combinations.filter((c) => c.fill === 0)

  // 굵기가 다른데 실측이 같으면 같은 파일을 받아 온 것이다 — 화면에서 구분이 안 된다
  const measured = combos.map((c) => {
    const dir = c.default ? SVG_DIR : path.join(SVG_DIR, c.id)
    const w = fs.readdirSync(dir).filter((f) => f.endsWith('.svg')).map((f) => {
      const svg = fs.readFileSync(path.join(dir, f), 'utf8')
      const ds = [...svg.matchAll(/<path[^>]*\sd="([^"]+)"/g)].map((m) => m[1])
      return measure(ds).strokeWeight
    }).filter((x) => x > 0).sort((a, b) => a - b)
    return { id: c.id, weight: c.weight, median: w[Math.floor(w.length / 2)] }
  }).sort((a, b) => a.weight - b.weight)

  for (let i = 1; i < measured.length; i += 1) {
    const prev = measured[i - 1]
    const cur = measured[i]
    assert.ok(
      cur.median > prev.median + 0.2,
      `${prev.id}(${prev.median.toFixed(2)}) → ${cur.id}(${cur.median.toFixed(2)}) — 눈에 띄게 벌어지지 않는다`
    )
  }
})

test('대장의 표정 목록이 실제 파일과 맞는다', () => {
  // 대장이 정본이다. 어긋나면 MCP·스튜디오가 없는 표정을 권하고 화면에 빈 네모가 나온다.
  const contract = JSON.parse(fs.readFileSync(path.join(ROOT, 'contracts/icon-contract.json'), 'utf8'))
  const extra = contract.variants.combinations.filter((c) => !c.default)

  for (const combo of extra) {
    const dir = path.join(SVG_DIR, combo.id)
    const files = fs.existsSync(dir)
      ? new Set(fs.readdirSync(dir).filter((f) => f.endsWith('.svg')).map((f) => f.replace(/\.svg$/, '')))
      : new Set()

    for (const [name, meta] of Object.entries(ledger.icons)) {
      const listed = (meta.variants || []).includes(combo.id)
      assert.equal(
        listed, files.has(name),
        `${name}의 ${combo.id} — 대장은 ${listed ? '있다' : '없다'}는데 파일은 ${files.has(name) ? '있다' : '없다'}`
      )
    }
  }
})

test('표정도 기본과 같은 규격을 지킨다', () => {
  const contract = JSON.parse(fs.readFileSync(path.join(ROOT, 'contracts/icon-contract.json'), 'utf8'))
  for (const combo of contract.variants.combinations.filter((c) => !c.default)) {
    const dir = path.join(SVG_DIR, combo.id)
    if (!fs.existsSync(dir)) continue
    for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.svg'))) {
      const svg = fs.readFileSync(path.join(dir, f), 'utf8')
      assert.match(svg, /viewBox="0 0 24 24"/, `${combo.id}/${f} 뷰박스`)
      assert.match(svg, /fill="currentColor"/, `${combo.id}/${f} 색`)
      assert.ok(!/\sstroke=/.test(svg), `${combo.id}/${f} — stroke는 면으로 변환한다`)
    }
  }
})

test('표정마다 스프라이트와 폰트가 함께 나온다', () => {
  // 하나만 갱신되면 SVG로 본 것과 폰트로 나온 것이 달라진다
  const contract = JSON.parse(fs.readFileSync(path.join(ROOT, 'contracts/icon-contract.json'), 'utf8'))
  const out = path.join(ROOT, 'assets/icons')
  if (!fs.existsSync(path.join(out, 'sprite.svg'))) return

  for (const combo of contract.variants.combinations) {
    const sprite = combo.default ? 'sprite.svg' : `sprite-${combo.id}.svg`
    const font = combo.default ? 'infoux-icons.woff2' : `infoux-icons-${combo.id}.woff2`
    assert.ok(fs.existsSync(path.join(out, sprite)), `${sprite} 없음 — npm run icons:build`)
    assert.ok(fs.existsSync(path.join(out, font)), `${font} 없음 — npm run icons:build`)
  }
})

test('표정 클래스가 font-family만 바꾼다 — 코드포인트는 그대로다', () => {
  const css = fs.readFileSync(path.join(ROOT, 'assets/icons/icons.css'), 'utf8')
  const contract = JSON.parse(fs.readFileSync(path.join(ROOT, 'contracts/icon-contract.json'), 'utf8'))

  for (const combo of contract.variants.combinations.filter((c) => !c.default)) {
    const sample = Object.entries(ledger.icons).find(([, m]) => (m.variants || []).includes(combo.id))
    if (!sample) continue
    const [name] = sample
    // 선택자를 묶어 내므로 규칙 하나만 떼어 보지 않고, 대상이 든 규칙을 찾는다
    const target = `.icon-font--${combo.id}.icon-font--${name}`
    const rule = [...css.matchAll(/([^{}]+)\{([^}]*)\}/g)]
      .find((r) => r[1].split(',').some((sel) => sel.trim() === target))
    assert.ok(rule, `${combo.id}/${name} 규칙이 icons.css에 없다`)
    // content(코드포인트)를 다시 정하면 대장이 두 곳으로 갈린다
    assert.ok(!/content\s*:/.test(rule[2]), `${combo.id}/${name} — 표정이 코드포인트를 덮어쓰면 안 된다`)
    assert.match(rule[2], /font-family/, `${combo.id}/${name} — font-family를 바꿔야 한다`)
  }
})


// ── 검색어 ─────────────────────────────────────────────

test('모든 아이콘에 한국어 검색어가 있다', () => {
  const p = path.join(ROOT, 'contracts/icon-keywords.json')
  if (!fs.existsSync(p)) return
  const dict = JSON.parse(fs.readFileSync(p, 'utf8')).keywords

  for (const name of Object.keys(ledger.icons)) {
    const words = dict[name]
    assert.ok(Array.isArray(words) && words.length > 0, `${name}: 검색어가 없다 — 화면에서 안 찾힌다`)
    assert.ok(words.some((w) => /[가-힣]/.test(w)), `${name}: 한국어 낱말이 하나도 없다`)
  }
  for (const name of Object.keys(dict)) {
    assert.ok(ledger.icons[name], `${name}: 대장에 없는 아이콘의 검색어다`)
  }
})

test('검색어가 실제로 아이콘을 집어낸다', () => {
  const p = path.join(ROOT, 'contracts/icon-keywords.json')
  if (!fs.existsSync(p)) return
  const dict = JSON.parse(fs.readFileSync(p, 'utf8')).keywords

  // 스튜디오·MCP가 쓰는 것과 같은 판정이다. 사전이 있어도 이 규칙이 어긋나면
  // 화면에서는 여전히 안 찾힌다.
  const find = (q) =>
    Object.keys(ledger.icons).filter(
      (n) => n.includes(q) || (dict[n] || []).some((k) => k.includes(q))
    )

  const cases = [
    ['달력', 'calendar'],
    ['즐겨찾기', 'star'],
    ['찾아오는길', 'map-pin'],
    ['휴지통', 'delete'],
    ['전체메뉴', 'menu'],
    ['새창', 'external-link']
  ]
  for (const [q, want] of cases) {
    assert.ok(find(q).includes(want), `"${q}"로 ${want}가 안 나온다`)
  }
})

test('검색어가 지나치게 넓지 않다', () => {
  const p = path.join(ROOT, 'contracts/icon-keywords.json')
  if (!fs.existsSync(p)) return
  const dict = JSON.parse(fs.readFileSync(p, 'utf8')).keywords

  // 한 낱말이 아이콘 여럿을 부르는 것 자체는 정상이다(「즐겨찾기」= star·bookmark).
  // 다만 대여섯을 넘으면 검색 결과가 뭉개져 고르기 어려워진다.
  const hits = new Map()
  for (const [name, words] of Object.entries(dict)) {
    for (const w of words) {
      if (!hits.has(w)) hits.set(w, [])
      hits.get(w).push(name)
    }
  }
  for (const [w, names] of hits) {
    assert.ok(names.length <= 5, `"${w}"가 ${names.length}종을 부른다 (${names.join(', ')}) — 너무 넓다`)
  }
})


test('만들기 지시와 판정 기준이 같은 굵기를 말한다', () => {
  // 일꾼은 contract.geometry.strokeWeight를 프롬프트에 실어 「이 굵기로 그려라」라고 하고,
  // 판정은 icon-metrics-baseline.json 분포로 「굵다/가늘다」를 말한다. 둘이 어긋나면
  // 만들기가 씨앗보다 굵은 아이콘을 내놓고 판정은 매번 경고를 붙인다 — 쓰는 사람은
  // 경고를 무시하는 법부터 배운다. 2026-08-23에 실제로 그랬다(기본을 wght300으로
  // 내렸는데 geometry만 2로 남았다).
  const bp = path.join(ROOT, 'contracts/icon-metrics-baseline.json')
  if (!fs.existsSync(bp)) return
  const b = JSON.parse(fs.readFileSync(bp, 'utf8')).strokeWeight
  const w = contract.geometry.strokeWeight

  assert.ok(
    w >= b.p10 && w <= b.p90,
    `생성 지시 ${w}가 기준선 p10~p90(${b.p10}~${b.p90}) 밖이다 — 만들 때마다 경고가 붙는다`
  )
})

test('생성 예시로 쓰는 씨앗이 실제로 그 굵기다', () => {
  // 프롬프트는 규격을 말로 적기도 하지만 실제 path를 예시로 보여 준다.
  // 말과 예시가 다르면 모델은 예시를 따른다 — 예시가 진짜 지시다.
  const picks = ['calendar', 'table', 'grid', 'file']
  const w = contract.geometry.strokeWeight

  for (const name of picks) {
    const p = path.join(SVG_DIR, `${name}.svg`)
    if (!fs.existsSync(p)) continue
    const svg = fs.readFileSync(p, 'utf8')
    const ds = [...svg.matchAll(/<path[^>]*\sd="([^"]+)"/g)].map((m) => m[1])
    const sw = measure(ds).strokeWeight
    assert.ok(
      Math.abs(sw - w) < 0.6,
      `예시 ${name}의 획이 ${sw.toFixed(2)}인데 지시는 ${w}다 — 모델은 예시를 따른다`
    )
  }
})
