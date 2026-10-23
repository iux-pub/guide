// ITCSS 캐스케이드 레이어 — 모든 규칙을 @layer 안에 둔다
// 레이어 밖 규칙은 선택자 우선순위와 무관하게 모든 레이어를 이긴다. 5-objects가 레이어 밖이던 때
// 6-components에 둔 프로젝트 변형(.hero-bleed--large .hero-bleed__title { laptop:text-[6rem] })이 무시됐다
// (2026-10-23 제주관광공사 시안 — 60px이 44px로 나옴).

const fs = require('node:fs')
const path = require('node:path')
const { test } = require('node:test')
const assert = require('node:assert/strict')

const STYLES = path.resolve(__dirname, '..', '..', 'src', 'styles')
// 레이어 밖에 둘 수 있는 구문 — 규칙이 아닌 지시문
const DIRECTIVE = /^@(import|layer|source|plugin|custom-variant|utility|theme|config|reference)\b/

/** 최상위(중괄호 깊이 0)의 규칙 머리를 뽑는다. 주석·문자열은 지운다. */
function topLevel(css) {
  const src = css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g, '""')
  const out = []
  let depth = 0
  let buf = ''
  for (const ch of src) {
    if (depth === 0 && (ch === '{' || ch === ';')) {
      const head = buf.trim()
      if (head) out.push({ head, block: ch === '{' })
      buf = ''
      if (ch === '{') depth++
      continue
    }
    if (ch === '{') depth++
    else if (ch === '}') depth--
    else if (depth === 0) buf += ch
  }
  return out
}

function layerOf(file) {
  return topLevel(fs.readFileSync(file, 'utf8')).filter(s => s.block).map(s => s.head)
}

test('style.css가 불러오는 ITCSS 파일에는 레이어 밖 규칙이 없다', () => {
  // docs.css는 문서 사이트 전용 진입점이라 대상이 아니다(5-objects·6-components를 불러오지 않는다)
  const files = ['style.css', ...['3-generic', '4-elements', '5-objects', '6-components', '7-utilities']
    .flatMap(dir => fs.readdirSync(path.join(STYLES, dir)).filter(f => f.endsWith('.css')).map(f => path.join(dir, f)))]
  for (const rel of files) {
    for (const { head } of topLevel(fs.readFileSync(path.join(STYLES, rel), 'utf8'))) {
      assert.match(head, DIRECTIVE, `${rel}: 레이어 밖 규칙 "${head.slice(0, 60)}" — @layer 안에 둔다`)
    }
  }
})

test('레이어 순서: base < components.objects < components < utilities', () => {
  const heads = topLevel(fs.readFileSync(path.join(STYLES, 'style.css'), 'utf8')).filter(s => !s.block).map(s => s.head)
  assert.ok(heads.includes('@layer base, components, utilities'), 'style.css가 base·components·utilities 순서를 선언하지 않는다')
  assert.ok(heads.includes('@layer components.objects'), 'style.css가 components.objects 하위 레이어를 선언하지 않는다')
})

test('5-objects는 components.objects 하위 레이어에 둔다 — container만 utilities', () => {
  for (const f of fs.readdirSync(path.join(STYLES, '5-objects')).filter(f => f.endsWith('.css'))) {
    // container는 Tailwind v4 내장 container 유틸리티와 이름이 같아, 그보다 낮은 레이어면 max-width를 빼앗긴다
    const expected = f === 'container.css' ? '@layer utilities' : '@layer components.objects'
    assert.deepEqual([...new Set(layerOf(path.join(STYLES, '5-objects', f)))], [expected], `5-objects/${f}`)
  }
})

test('6-components는 @layer components에 둔다 — 프로젝트 변형도 여기서 objects를 이긴다', () => {
  for (const f of fs.readdirSync(path.join(STYLES, '6-components')).filter(f => f.endsWith('.css') && f !== 'index.css')) {
    assert.deepEqual([...new Set(layerOf(path.join(STYLES, '6-components', f)))], ['@layer components'], `6-components/${f}`)
  }
})
