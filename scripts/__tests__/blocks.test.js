// 블록 카탈로그 — 메타데이터 형식, 마크업 틀, 스타일 실재, 순서 점검, 생성물 정합.
// 정본: src/blocks/<id>/(block.json·markup.html) + src/styles/6-components. 판정 코드: scripts/lib/block-catalog.js

const fs = require('node:fs')
const path = require('node:path')
const { test } = require('node:test')
const assert = require('node:assert/strict')

const ROOT = path.resolve(__dirname, '..', '..')
const {
  SLOTS,
  loadBlocks,
  validateBlock,
  renderTemplate,
  parseTemplate,
  placeholderLines,
  checkSequence,
  composePage
} = require('../lib/block-catalog.js')
const { buildPreviews } = require('../build-blocks.js')

const BLOCKS = loadBlocks(ROOT)
const byId = id => BLOCKS.find(b => b.id === id)
const read = rel => fs.readFileSync(path.join(ROOT, rel), 'utf8').replace(/\r\n/g, '\n')
const SHELL = { boilerplate: read('src/snippets/boilerplate.md'), header: read('src/snippets/header.md'), footer: read('src/snippets/footer.md') }
const codes = findings => findings.map(f => f.code)

// 형식 검증용 최소 블록 — 한 군데씩 망가뜨려 본다
const VALID_META = {
  id: 'sample',
  name: '견본',
  slot: 'news',
  forms: ['N1'],
  reference: 'design-intelligence §6-3',
  tags: ['견본'],
  summary: '견본 블록이다.',
  useWhen: ['쓸 때'],
  avoidWhen: ['쓰지 않을 때'],
  content: [
    { key: 'title', kind: 'text', label: '제목', spec: '한글 4~8자', example: '새소식' },
    {
      key: 'items', kind: 'list', label: '항목', min: 1, max: 3, spec: '1~3개',
      fields: [{ key: 'label', kind: 'text', label: '이름', spec: '한글 2~6자' }],
      examples: [{ label: '공지' }, { label: '채용' }]
    }
  ],
  variants: [],
  neighbors: { before: [], after: [], avoid: [] },
  surface: { tone: 'plain', note: '바탕 면' },
  section: { archetype: 'notice' },
  styles: ['src/styles/6-components/post-list.css'],
  requires: { components: [], icons: [], scripts: [] },
  accessibility: ['제목은 h2다.']
}
const VALID_MARKUP = [
  '<section class="section section--notice" aria-labelledby="sample-title">',
  '  <div class="container">',
  '    <h2 id="sample-title">{{title}}</h2>',
  '    <ul>',
  '      <!-- @each items as item -->',
  '      <li data-n="{{item.@n}}"{{item.@first:| hidden}}>{{item.label}}</li>',
  '      <!-- @end -->',
  '    </ul>',
  '  </div>',
  '</section>',
  ''
].join('\n')
const broken = patch => ({ ...structuredClone(VALID_META), ...patch })

test('카탈로그에 블록이 있고 폴더 이름과 id가 같다', () => {
  assert.ok(BLOCKS.length >= 6, `블록 ${BLOCKS.length}건`)
  for (const id of ['cover', 'task-index', 'bulletin', 'field-list', 'link-rows', 'partner-row']) {
    assert.ok(byId(id), `${id} 블록이 없다`)
  }
})

test('모든 블록이 메타데이터 형식을 지킨다', () => {
  for (const block of BLOCKS) {
    assert.deepEqual(validateBlock(block, block.markup), [], `src/blocks/${block.id}`)
  }
})

test('형식 검증은 빠진 칸·틀린 값을 잡고, 맞는 블록은 통과시킨다', () => {
  assert.deepEqual(validateBlock(VALID_META, VALID_MARKUP), [])

  const cases = [
    [broken({ id: 'Bad_Id' }), VALID_MARKUP, /^id:/],
    [broken({ slot: 'somewhere' }), VALID_MARKUP, /^slot:/],
    [broken({ forms: ['Z9'] }), VALID_MARKUP, /^forms:/],
    [broken({ useWhen: [] }), VALID_MARKUP, /^useWhen:/],
    [broken({ avoidWhen: undefined }), VALID_MARKUP, /^avoidWhen:/],
    [broken({ surface: { tone: 'dark', note: 'x' } }), VALID_MARKUP, /^surface:/],
    [broken({ section: { archetype: 'hero' } }), VALID_MARKUP, /^section\.archetype:/],
    [broken({ styles: ['styles/x.css'] }), VALID_MARKUP, /^styles:/],
    [broken({ accessibility: [] }), VALID_MARKUP, /^accessibility:/],
    [broken({ neighbors: { before: [], after: [] } }), VALID_MARKUP, /^neighbors:/],
    // 틀이 쓰는 자리가 정의에 없다
    [VALID_META, VALID_MARKUP.replace('{{title}}', '{{headline}}'), /headline/],
    // 정의한 자리를 틀이 쓰지 않는다
    [VALID_META, VALID_MARKUP.replace('{{item.label}}', '이름'), /content\.items\.label: 틀에서 쓰지 않는/],
    // 반복 구간이 닫히지 않았다
    [VALID_META, VALID_MARKUP.replace('      <!-- @end -->\n', ''), /닫히지 않았다/],
    // section이 archetype을 선언하지 않았다
    [VALID_META, VALID_MARKUP.replace('section section--notice', 'section'), /section section--notice/],
    // 접근 가능한 이름이 없다
    [VALID_META, VALID_MARKUP.replace(' aria-labelledby="sample-title"', ''), /접근 가능한 이름/],
    // 자리 표기를 ○○로 적었다
    [VALID_META, VALID_MARKUP.replace('{{title}}', '{{title}} ○○'), /자리 표기/]
  ]
  for (const [meta, markup, expected] of cases) {
    const problems = validateBlock(meta, markup)
    assert.ok(problems.some(p => expected.test(p)), `${expected} 를 잡지 못했다: ${JSON.stringify(problems)}`)
  }

  const noSpec = structuredClone(VALID_META)
  delete noSpec.content[0].spec
  assert.ok(validateBlock(noSpec, VALID_MARKUP).some(p => /content\.title: spec/.test(p)))

  const tooMany = structuredClone(VALID_META)
  tooMany.content[1].max = 1
  assert.ok(validateBlock(tooMany, VALID_MARKUP).some(p => /예시 2개가 범위 1~1 밖/.test(p)))

  const noRatio = structuredClone(VALID_META)
  noRatio.content[0].kind = 'image'
  assert.ok(validateBlock(noRatio, VALID_MARKUP).some(p => /ratio/.test(p)))
})

test('틀 펼치기 — 자리는 남기고 반복은 번호를 붙이며, 예시 모드는 값을 이스케이프해 채운다', () => {
  const slots = renderTemplate(VALID_MARKUP, VALID_META, 'slots')
  assert.match(slots.html, /<h2 id="sample-title">\{\{title\}\}<\/h2>/)
  assert.match(slots.html, /<li data-n="1">\{\{items\.1\.label\}\}<\/li>/)
  assert.match(slots.html, /<li data-n="2" hidden>\{\{items\.2\.label\}\}<\/li>/)
  assert.doesNotMatch(slots.html, /@each|@end/)
  assert.deepEqual(slots.used, ['items', 'items.label', 'title'])

  const prefixed = renderTemplate(VALID_MARKUP, VALID_META, 'slots', 'sample.')
  assert.match(prefixed.html, /\{\{sample\.title\}\}/)
  assert.match(prefixed.html, /\{\{sample\.items\.2\.label\}\}/)

  const meta = structuredClone(VALID_META)
  meta.content[0].example = '<b>새소식</b> & "공지"'
  const example = renderTemplate(VALID_MARKUP, meta, 'example')
  assert.match(example.html, /&lt;b&gt;새소식&lt;\/b&gt; &amp; &quot;공지&quot;/)
  assert.match(example.html, /<li data-n="1">공지<\/li>/)
  assert.doesNotMatch(example.html, /\{\{/)

  assert.throws(() => parseTemplate('<!-- @end -->\n'), /짝이 되는 @each/)
})

test('블록 마크업의 클래스는 CSS에 실재하고, 블록 스타일은 index.css에 등록돼 있다', () => {
  const defined = new Set()
  const walk = dir => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) walk(full)
      else if (entry.name.endsWith('.css')) {
        const css = fs.readFileSync(full, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
        for (const m of css.matchAll(/\.([a-z][a-z0-9]*(?:-[a-z0-9]+)*(?:__[a-z0-9]+(?:-[a-z0-9]+)*)?(?:--[a-z0-9]+(?:-[a-z0-9]+)*)?)/g)) defined.add(m[1])
      }
    }
  }
  walk(path.join(ROOT, 'src', 'styles'))
  const index = read('src/styles/6-components/index.css')

  for (const block of BLOCKS) {
    const classes = new Set([...block.markup.matchAll(/class="([^"]+)"/g)].flatMap(m => m[1].split(/\s+/)))
    for (const name of classes) {
      // section--<archetype>은 CSS가 아니라 page 계약(html-page-contract.json)에 등록된 선언이다
      if (name === `section--${block.section.archetype}`) continue
      assert.ok(defined.has(name), `${block.id}: 마크업의 .${name}가 src/styles에 없다(R-29)`)
    }
    for (const rel of block.styles) {
      assert.ok(fs.existsSync(path.join(ROOT, rel)), `${block.id}: ${rel}이 없다`)
      assert.ok(index.includes(`@import "./${path.basename(rel)}";`), `${block.id}: ${path.basename(rel)}이 6-components/index.css에 없다`)
    }
  }
})

test('블록 스타일은 토큰과 rem만 쓴다 — 원시 색 값·px 금지', () => {
  const files = [...new Set(BLOCKS.flatMap(b => b.styles))]
  for (const rel of files) {
    const css = read(rel).replace(/\/\*[\s\S]*?\*\//g, '')
    assert.doesNotMatch(css, /#[0-9a-fA-F]{3,8}\b/, `${rel}: 원시 hex`)
    assert.doesNotMatch(css, /\b(?:rgb|hsl|oklch)a?\(/, `${rel}: 원시 색 함수`)
    // @media (min-width: 1024px) 같은 미디어 조건은 저장소 관례다 — 선언 값의 px만 본다
    const declarations = css.replace(/@media[^{]*\{/g, '{')
    assert.doesNotMatch(declarations, /\d+px\b/, `${rel}: px 값`)
    assert.match(css, /@apply/, `${rel}: @apply가 없다(R-19)`)
  }
  for (const block of BLOCKS) {
    assert.ok(block.tokens.length > 0, `${block.id}: 쓰는 토큰이 없다`)
    assert.ok(block.tokens.every(t => /^--(color|font)-/.test(t)))
  }
})

test('이웃·필요 부품이 실재하는 것을 가리킨다', () => {
  const ids = new Set(BLOCKS.map(b => b.id))
  const slots = new Set(SLOTS.map(s => s.id))
  for (const block of BLOCKS) {
    const n = block.neighbors
    for (const id of [...n.before, ...n.after, ...n.avoid, ...(n.expectsAfter || [])]) {
      assert.ok(ids.has(id), `${block.id}: 이웃 ${id}가 카탈로그에 없다`)
    }
    if (n.requiresBeforeSlot) assert.ok(slots.has(n.requiresBeforeSlot))
    for (const name of block.requires.components) {
      assert.ok(fs.existsSync(path.join(ROOT, 'src', 'snippets', `${name}.md`)), `${block.id}: 컴포넌트 ${name} 스니펫이 없다`)
    }
    for (const name of block.requires.scripts) {
      assert.ok(fs.existsSync(path.join(ROOT, 'src', 'js', name)), `${block.id}: src/js/${name}이 없다`)
    }
    for (const name of block.requires.icons) {
      assert.ok(fs.existsSync(path.join(ROOT, 'assets', 'icons', 'svg', `${name}.svg`)) || read('assets/icons/sprite.svg').includes(`id="${name}"`), `${block.id}: 아이콘 ${name}이 세트에 없다`)
      assert.ok(block.markup.includes(`#${name}"`), `${block.id}: requires.icons의 ${name}을 틀이 쓰지 않는다`)
    }
  }
})

test('순서 점검 — 권장 순서는 걸리지 않는다', () => {
  const order = ['cover', 'task-index', 'bulletin', 'field-list', 'link-rows', 'partner-row'].map(byId)
  const findings = checkSequence(order)
  assert.deepEqual(findings.filter(f => f.level !== 'info'), [])
  assert.ok(codes(findings).includes('ok'))
})

test('순서 점검 — 첫 화면 블록 없음·위치·개수, 걸침 전제, 같은 면 연속, 중복을 잡는다', () => {
  assert.deepEqual(codes(checkSequence([])), ['empty'])

  const noFirst = checkSequence([byId('bulletin'), byId('field-list')])
  assert.ok(noFirst.some(f => f.code === 'no-first-screen' && f.level === 'warn'))

  const late = checkSequence([byId('bulletin'), byId('cover'), byId('task-index')])
  assert.ok(late.some(f => f.code === 'first-screen-order' && f.level === 'error'))

  // 걸치는 판은 첫 화면 블록 바로 뒤에만 놓인다
  const floating = checkSequence([byId('cover'), byId('bulletin'), byId('task-index')])
  assert.ok(floating.some(f => f.code === 'requires-before' && f.level === 'error'))
  assert.ok(floating.some(f => f.code === 'expects-after' && f.level === 'warn'))

  // 짙은 면 → (걸침) → 짙은 면: 걸침 블록은 면으로 세지 않는다
  const sameTone = checkSequence([byId('cover'), byId('task-index'), byId('link-rows')])
  assert.ok(sameTone.some(f => f.code === 'same-surface' && /cover → link-rows/.test(f.message)))

  const twice = checkSequence([byId('cover'), byId('task-index'), byId('bulletin'), byId('bulletin')])
  assert.ok(twice.some(f => f.code === 'duplicate-block' && f.level === 'error'))

  const twoCovers = checkSequence([byId('cover'), byId('cover')])
  assert.ok(twoCovers.some(f => f.code === 'first-screen-count'))
})

test('순서 점검 — 같은 archetype 3연속과 바탕 면 3연속을 잡는다', () => {
  const plain = id => ({ ...structuredClone(VALID_META), id, slot: 'scene' })
  const findings = checkSequence([byId('cover'), byId('task-index'), plain('a'), plain('b'), plain('c')])
  assert.ok(findings.some(f => f.code === 'archetype-run' && f.level === 'error'))
  assert.ok(findings.some(f => f.code === 'flat-surface' && /a → b → c/.test(f.message)))
})

test('순서 점검 — 판을 가진 바탕 면은 3연속으로 세지 않고, 흰색 ↔ 옅은 색 교대를 잡는다', () => {
  const block = (id, surface, archetype) => ({ ...structuredClone(VALID_META), id, slot: 'scene', surface: { note: '면', ...surface }, section: { archetype } })
  const framed = checkSequence([byId('cover'), byId('task-index'),
    block('a', { tone: 'plain', framed: true }, 'notice'), block('b', { tone: 'plain', framed: true }, 'content'), block('c', { tone: 'plain', framed: true }, 'list')])
  assert.ok(!framed.some(f => f.code === 'flat-surface'))

  const mixed = checkSequence([byId('cover'), byId('task-index'),
    block('a', { tone: 'plain' }, 'notice'), block('b', { tone: 'plain', framed: true }, 'content'), block('c', { tone: 'plain' }, 'list'), block('d', { tone: 'plain' }, 'data')])
  assert.ok(!mixed.some(f => f.code === 'flat-surface'))

  const striped = checkSequence([byId('cover'), byId('task-index'),
    block('a', { tone: 'tinted' }, 'notice'), block('b', { tone: 'plain' }, 'content'), block('c', { tone: 'tinted' }, 'list')])
  assert.ok(striped.some(f => f.code === 'striped-surface' && /a … c/.test(f.message)))

  const once = checkSequence([byId('cover'), byId('task-index'),
    block('a', { tone: 'plain' }, 'notice'), block('b', { tone: 'tinted' }, 'content'), block('c', { tone: 'plain' }, 'list')])
  assert.ok(!once.some(f => f.code === 'striped-surface'))

  const badFramed = validateBlock({ ...structuredClone(VALID_META), surface: { tone: 'plain', note: '면', framed: 'yes' } })
  assert.ok(badFramed.some(e => /surface\.framed/.test(e)))
})

test('조립 — 공통 틀에 블록을 순서대로 끼우고 자리·스크립트·경로를 정리한다', () => {
  const order = ['cover', 'task-index', 'bulletin'].map(byId)
  const { html, placeholders, scripts, findings } = composePage(order, SHELL, { assetBase: '../' })

  assert.match(html, /^<!DOCTYPE html>\n<html lang="ko">/)
  assert.match(html, /<a href="#main" class="skip-to-content">본문 바로가기<\/a>/)
  assert.equal((html.match(/<header id="header"/g) || []).length, 1)
  assert.equal((html.match(/<main id="main">/g) || []).length, 1)
  assert.equal((html.match(/<footer id="footer"/g) || []).length, 1)
  assert.match(html, /개인정보 처리방침/)
  assert.equal((html.match(/<h1\b/g) || []).length, 1, 'h1은 하나다(R-39)')

  // main 직계 자식은 블록의 section이고 순서가 같다
  const main = html.slice(html.indexOf('<main id="main">'), html.indexOf('</main>'))
  assert.deepEqual([...main.matchAll(/<!-- 블록: ([a-z-]+) /g)].map(m => m[1]), ['cover', 'task-index', 'bulletin'])
  assert.equal((main.match(/<section\b/g) || []).length, 3)

  // 자리 이름은 블록 id로 구분된다
  assert.match(html, /\{\{cover\.title\}\}/)
  assert.match(html, /\{\{task-index\.tasks\.6\.label\}\}/)
  assert.match(html, /\{\{bulletin\.boards\.3\.posts\.5\.title\}\}/)
  assert.match(html, /<title>\{\{page_title\}\}<\/title>/)
  // 예시 문구는 조립 결과에 들어가지 않는다(R-23)
  assert.doesNotMatch(main, /항구|문화재단|청년 예술가/)
  assert.doesNotMatch(html, /@each|@end|@first|@n\b/)

  // 탭 id 짝
  assert.match(html, /aria-controls="bulletin-panel-2" id="bulletin-tab-2"/)
  assert.match(html, /id="bulletin-panel-2" aria-labelledby="bulletin-tab-2" hidden>/)
  assert.match(html, /id="bulletin-panel-1" aria-labelledby="bulletin-tab-1">/)

  // 자산 경로는 한 기준으로
  assert.match(html, /href="\.\.\/dist\/css\/style\.css"/)
  assert.match(html, /href="\.\.\/assets\/icons\/sprite\.svg#chevron-right"/)
  assert.doesNotMatch(html, /(?:href|src)="(?:\.\.\/\.\.\/|\/)(?:assets|dist)\//)

  assert.deepEqual(scripts, ['tab.js'])
  assert.match(html, /<script src="\.\.\/src\/js\/tab\.js"><\/script>\n<\/body>/)

  assert.deepEqual(placeholders.map(p => p.block), ['cover', 'task-index', 'bulletin'])
  assert.ok(placeholders[0].lines.some(l => l.includes('{{cover.photo_src}}') && l.includes('비율')))
  assert.ok(placeholders[1].lines.some(l => l.includes('3~9개')))
  assert.deepEqual(findings.filter(f => f.level !== 'info'), [])
})

test('채울 자리 목록 — 문구 길이·사진 비율·항목 수 범위가 줄마다 있다', () => {
  for (const block of BLOCKS) {
    const lines = placeholderLines(block)
    assert.ok(lines.length >= block.content.length, block.id)
    for (const line of lines) assert.match(line, /^\s*- `\{\{[^}]+\}\}` .+ — .+/, `${block.id}: ${line}`)
  }
})

test('미리보기 생성물이 정본과 같다 — 블록을 고쳤으면 npm run build:blocks', () => {
  for (const { file, html } of buildPreviews(ROOT)) {
    const target = path.join(ROOT, 'src', 'playground', file)
    assert.ok(fs.existsSync(target), `src/playground/${file}이 없다 — npm run build:blocks`)
    assert.equal(fs.readFileSync(target, 'utf8').replace(/\r\n/g, '\n'), html, `src/playground/${file}이 낡았다 — npm run build:blocks`)
  }
})

test('미리보기는 예시로 채워져 자리 표기가 남지 않는다', () => {
  for (const { file, html } of buildPreviews(ROOT)) {
    assert.doesNotMatch(html, /\{\{|\}\}|@each|@end/, file)
    assert.match(html, /<script src="\.\.\/js\/tab\.js">|^(?![\s\S]*role="tablist")/, `${file}: 탭이 있으면 tab.js를 싣는다`)
  }
})

test('MCP로 가는 사본과 번들이 정본과 같다 — npm run build:mcp', () => {
  assert.equal(read('mcp/bin/block-catalog.js'), read('scripts/lib/block-catalog.js'), 'mcp/bin/block-catalog.js가 낡았다')
  const manifest = JSON.parse(read('mcp/data/manifest.json'))
  assert.deepEqual(manifest.blocks.map(b => b.id), BLOCKS.map(b => b.id))
  for (const block of BLOCKS) {
    assert.deepEqual(JSON.parse(read(`mcp/data/blocks/${block.id}.json`)), JSON.parse(JSON.stringify(block)), `mcp/data/blocks/${block.id}.json이 낡았다`)
  }
})

test('옛 형식표가 블록 id를 잇고, design-page는 메인을 블록 조립으로 정하지 않는다', () => {
  // 블록 형식의 기록은 옛 디자인 디렉션 문서 §6에 남아 있다(생성 맥락에는 넣지 않는다)
  const doc = read('docs/archive/design-intelligence-2026-11.md')
  const section6 = doc.slice(doc.indexOf('## 6. 블록별 형식'), doc.indexOf('## 7. '))
  for (const block of BLOCKS) {
    assert.ok(section6.includes(`\`${block.id}\``), `design-intelligence §6에 ${block.id}가 없다`)
    for (const form of block.forms) assert.ok(new RegExp(`블록: [^\\n]*${form}[^\\n]*\`${block.id}\``).test(section6), `§6이 ${form} → ${block.id}를 잇지 않는다`)
  }
  assert.match(read('references/workflows/design-page.md'), /메인·랜딩은 카탈로그 조합을 강제하지 않는다/)
})
