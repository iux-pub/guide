// 블록 카탈로그 — 메타데이터 형식 검증, 마크업 틀 펼치기, 페이지 조립, 블록 순서 점검.
//
// 단일 원본: 이 파일. 생성 대상: mcp/bin/block-catalog.js (scripts/build-mcp.js가 복사한다 —
// MCP 패키지는 저장소의 scripts/를 볼 수 없다. check-harness.js가 두 파일이 같은지 지킨다).
// 쓰는 곳: scripts/build-mcp.js(번들), scripts/build-blocks.js(미리보기), mcp/bin/server.js(도구),
//          scripts/__tests__/blocks.test.js
//
// 블록 정본은 src/blocks/<id>/block.json + markup.html이고, 스타일은 src/styles/6-components/에 둔다.
// 이 파일의 함수는 loadBlocks()만 디스크를 읽는다. 나머지는 값만 받아 값을 돌려준다.
//
// 마크업 틀 표기
//   {{key}}                      한 값 자리. 조립 결과에 그대로 남아 「채울 자리」가 된다
//   <!-- @each list as item -->  반복 구간 시작. list는 content의 list 항목 key 또는 item.field
//   <!-- @end -->                반복 구간 끝
//   {{item.field}}               반복 항목의 값 자리. 조립하면 {{list.1.field}}처럼 번호가 붙는다
//   {{item.@n}}                  항목 번호(1부터). id를 짝지을 때 쓴다 — 자리가 아니라 값으로 풀린다
//   {{item.@first:A|B}}          첫 항목이면 A, 아니면 B (탭의 aria-selected·hidden)
//   {{item.@count}}·{{list.@count}}  그 목록의 항목 수(캐러셀의 「1 / 4」) — 값으로 풀린다

const fs = require('node:fs')
const path = require('node:path')

// 자리 — 블록이 페이지에서 맡는 역할. 새 자리가 필요하면 여기에 더한다(목록 밖 값은 검증에서 떨어진다)
const SLOTS = [
  { id: 'first-screen', label: '첫 화면', recipe: 'KS-01' },
  { id: 'quick-links', label: '바로가기', recipe: 'KS-03' },
  { id: 'news', label: '소식', recipe: 'KS-04·KS-05' },
  { id: 'business', label: '사업 소개', recipe: 'KS-06' },
  { id: 'link-group', label: '링크 묶음', recipe: 'KS-11' },
  { id: 'logo-row', label: '로고 줄', recipe: 'KS-11' },
  { id: 'scene', label: '장면', recipe: '시그니처 장면' }
]

// 면 색 — 순서 점검이 「같은 면 연속」을 볼 때 쓴다. overlap은 앞 블록 위에 걸치는 투명 섹션이다
// scene은 사진·장면이 깔린 면이다. 블록의 위아래 면이 다르면 surface.top·bottom에 따로 적고,
// 위아래 블록과 한 면으로 이어지게 설계했으면 joinsAbove·joinsBelow에 그 면을 적는다
// framed: true는 섹션 바탕은 바탕 면(plain)이지만 내용이 판·사진 판에 담겨 섹션이 구별되는 블록이다 —
// 「바탕 면 3연속」 점검에서 세지 않는다(design-intelligence §5-2: 본문 섹션 바탕은 흰색 하나, 연회색은 판에)
const SURFACE_TONES = ['plain', 'tinted', 'inverse', 'scene', 'overlap']
// icon은 세트에 있는 아이콘 이름이다(MCP list_icons). 스프라이트 주소의 # 뒤에 들어간다
const CONTENT_KINDS = ['text', 'url', 'image', 'date', 'number', 'icon', 'list']
const ARCHETYPES = ['intro', 'content', 'list', 'form', 'data', 'search', 'process', 'notice']
const FORM_RE = /^[HQNB][1-9]$/
const ID_RE = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/
const KEY_RE = /^[a-z][a-z0-9_]*$/

const EACH_RE = /^[ \t]*<!--\s*@each\s+([a-z][a-z0-9_.]*)\s+as\s+([a-z][a-z0-9_]*)\s*-->[ \t]*\r?\n?/m
const END_RE = /^[ \t]*<!--\s*@end\s*-->[ \t]*\r?\n?/m
const SLOT_RE = /\{\{\s*([^{}]+?)\s*\}\}/g

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// ─── 틀 읽기 ───────────────────────────────────────────

/** 틀을 글 조각과 반복 구간의 나무로 읽는다. 짝이 맞지 않으면 던진다. */
function parseTemplate(markup) {
  const root = { type: 'root', children: [] }
  const stack = [root]
  let rest = markup
  while (rest.length > 0) {
    const each = EACH_RE.exec(rest)
    const end = END_RE.exec(rest)
    const next = [each, end].filter(Boolean).sort((a, b) => a.index - b.index)[0]
    if (!next) {
      stack[stack.length - 1].children.push({ type: 'text', value: rest })
      break
    }
    if (next.index > 0) stack[stack.length - 1].children.push({ type: 'text', value: rest.slice(0, next.index) })
    if (next === each) {
      const node = { type: 'each', list: each[1], alias: each[2], children: [] }
      stack[stack.length - 1].children.push(node)
      stack.push(node)
    } else {
      if (stack.length === 1) throw new Error('@end에 짝이 되는 @each가 없다')
      stack.pop()
    }
    rest = rest.slice(next.index + next[0].length)
  }
  if (stack.length > 1) throw new Error(`@each ${stack[stack.length - 1].list}가 닫히지 않았다`)
  return root
}

/** content 정의에서 key를 찾는다 */
function findDef(defs, key) {
  return (defs || []).find(def => def.key === key) || null
}

/**
 * 틀을 펼친다.
 *   mode 'slots'    값 자리를 {{…}}로 남긴다(반복 항목은 번호를 붙인다). 조립 결과용
 *   mode 'example'  메타데이터의 예시 값으로 채운다. 미리보기용
 * 반복 횟수는 두 모드 모두 예시 자료의 개수를 따른다.
 * prefix는 자리 이름 앞에 붙는 말이다 — 여러 블록을 한 페이지에 조립할 때 블록 id를 붙여 이름이 겹치지 않게 한다.
 * 돌려주는 값: { html, used } — used는 틀이 실제로 읽은 정의 경로(예: 'boards.posts.title')
 */
function renderTemplate(markup, meta, mode = 'slots', prefix = '') {
  const tree = parseTemplate(markup)
  const used = new Set()
  const problems = []
  const topData = {}
  for (const def of meta.content || []) topData[def.key] = def.kind === 'list' ? def.examples : def.example

  const renderText = (value, scopes) => value.replace(SLOT_RE, (whole, expr) => {
    const [head, ...tail] = expr.split('.')
    const scope = scopes.find(s => s.alias === head)
    if (!scope) {
      if (tail.join('.') === '@count') {
        const list = findDef(meta.content, head)
        if (list?.kind === 'list') return String((topData[head] || []).length)
      }
      if (tail.length) { problems.push(`{{${expr}}}: '${head}'라는 반복 항목이 없다`); return whole }
      const def = findDef(meta.content, head)
      if (!def || def.kind === 'list') { problems.push(`{{${expr}}}: content에 한 값 자리 '${head}'가 없다`); return whole }
      used.add(head)
      return mode === 'example' ? escapeHtml(topData[head] ?? '') : `{{${prefix}${head}}}`
    }
    const field = tail.join('.')
    if (field === '@n') return String(scope.index)
    if (field === '@count') return String(scope.count)
    if (field.startsWith('@first:')) {
      const [yes, no = ''] = field.slice('@first:'.length).split('|')
      return scope.index === 1 ? yes : no
    }
    const def = findDef(scope.def.fields, field)
    if (!def || def.kind === 'list') { problems.push(`{{${expr}}}: ${scope.defPath}에 값 자리 '${field}'가 없다`); return whole }
    used.add(`${scope.defPath}.${field}`)
    return mode === 'example' ? escapeHtml(scope.data?.[field] ?? '') : `{{${scope.path}.${field}}}`
  })

  const renderNodes = (nodes, scopes) => nodes.map(node => {
    if (node.type === 'text') return renderText(node.value, scopes)
    const [head, ...tail] = node.list.split('.')
    let def, data, basePath, defPath
    if (tail.length === 0) {
      def = findDef(meta.content, head)
      data = topData[head]
      basePath = `${prefix}${head}`
      defPath = head
    } else {
      const parent = scopes.find(s => s.alias === head)
      if (!parent) { problems.push(`@each ${node.list}: '${head}'라는 반복 항목이 없다`); return '' }
      def = findDef(parent.def.fields, tail.join('.'))
      data = parent.data?.[tail.join('.')]
      basePath = `${parent.path}.${tail.join('.')}`
      defPath = `${parent.defPath}.${tail.join('.')}`
    }
    if (!def || def.kind !== 'list') { problems.push(`@each ${node.list}: content에 list 항목이 없다`); return '' }
    used.add(defPath)
    const items = Array.isArray(data) ? data : []
    return items.map((item, i) => renderNodes(node.children, [
      { alias: node.alias, def, data: item, index: i + 1, count: items.length, path: `${basePath}.${i + 1}`, defPath },
      ...scopes
    ])).join('')
  }).join('')

  const html = renderNodes(tree.children, [])
  return { html, used: [...used].sort(), problems }
}

/** content 정의를 경로 목록으로 편다 — 'boards', 'boards.name', 'boards.posts', 'boards.posts.title' */
function contentPaths(defs, prefix = '') {
  const out = []
  for (const def of defs || []) {
    const here = prefix ? `${prefix}.${def.key}` : def.key
    out.push(here)
    if (def.kind === 'list') out.push(...contentPaths(def.fields, here))
  }
  return out
}

// ─── 형식 검증 ─────────────────────────────────────────

function isFilledString(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function isStringList(value, { min = 0 } = {}) {
  return Array.isArray(value) && value.length >= min && value.every(isFilledString)
}

function validateContent(defs, where, problems, examples) {
  if (!Array.isArray(defs) || defs.length === 0) { problems.push(`${where}: 항목이 하나 이상 있어야 한다`); return }
  const seen = new Set()
  for (const def of defs) {
    const at = `${where}.${def?.key ?? '?'}`
    if (!def || !KEY_RE.test(def.key || '')) { problems.push(`${at}: key는 소문자·숫자·밑줄이다`); continue }
    if (seen.has(def.key)) problems.push(`${at}: key가 겹친다`)
    seen.add(def.key)
    if (!CONTENT_KINDS.includes(def.kind)) problems.push(`${at}: kind는 ${CONTENT_KINDS.join('·')} 중 하나다`)
    if (!isFilledString(def.label)) problems.push(`${at}: label(무엇을 넣는 자리인지)이 없다`)
    if (!isFilledString(def.spec)) problems.push(`${at}: spec(문구 길이·사진 비율과 성격·형식)이 없다`)
    if (def.kind === 'image' && !isFilledString(def.ratio)) problems.push(`${at}: 사진 자리는 ratio(비율)를 적는다`)
    if (def.kind === 'list') {
      if (!Number.isInteger(def.min) || !Number.isInteger(def.max) || def.min < 1 || def.max < def.min) {
        problems.push(`${at}: list는 min·max(항목 수 범위, 1 ≤ min ≤ max)를 적는다`)
      }
      // 맨 위 list는 자기 examples를, 안쪽 list는 부모 예시 항목 안의 배열을 예시로 쓴다
      const rows = examples ? examples.map(row => row?.[def.key]) : [def.examples]
      for (const list of rows) {
        if (!Array.isArray(list)) { problems.push(`${at}: 예시 목록이 없다`); continue }
        if (list.length < def.min || list.length > def.max) problems.push(`${at}: 예시 ${list.length}개가 범위 ${def.min}~${def.max} 밖이다`)
      }
      validateContent(def.fields, at, problems, rows.filter(Array.isArray).flat())
    } else if (examples) {
      examples.forEach((row, i) => {
        if (row?.[def.key] === undefined || row[def.key] === '') problems.push(`${at}: 예시 ${i + 1}번에 값이 없다`)
      })
    } else if (def.example === undefined || def.example === '') {
      problems.push(`${at}: example(미리보기에 쓸 예시 값)이 없다`)
    }
  }
}

/**
 * 블록 한 건이 형식을 지키는지 본다. 문제를 글로 돌려준다(없으면 빈 배열).
 * 파일이 실제로 있는지, 클래스가 CSS에 있는지는 단위 테스트가 본다 — 여기서는 값의 모양만 본다.
 */
function validateBlock(meta, markup) {
  const problems = []
  const need = (ok, message) => { if (!ok) problems.push(message) }

  need(ID_RE.test(meta.id || ''), 'id: 소문자·숫자·하이픈이다(BEM 블록 이름과 같게 짓는다)')
  need(isFilledString(meta.name), 'name: 사람이 읽는 이름이 없다')
  need(SLOTS.some(s => s.id === meta.slot), `slot: ${SLOTS.map(s => s.id).join('·')} 중 하나다`)
  need(Array.isArray(meta.forms) && meta.forms.every(f => FORM_RE.test(f)), 'forms: design-intelligence §6의 형식 기호 배열이다(H1·Q1·N2·B1…). 기호가 없는 절이면 빈 배열')
  need(isFilledString(meta.reference), 'reference: 근거 절(예: design-intelligence §6-1)이 없다')
  need(isStringList(meta.tags, { min: 1 }), 'tags: 검색어가 하나 이상 있어야 한다')
  need(isFilledString(meta.summary), 'summary: 한 줄 설명이 없다')
  need(isStringList(meta.useWhen, { min: 1 }), 'useWhen: 언제 쓰나가 하나 이상 있어야 한다')
  need(isStringList(meta.avoidWhen, { min: 1 }), 'avoidWhen: 언제 쓰지 않나가 하나 이상 있어야 한다')
  need(Array.isArray(meta.variants) && meta.variants.every(v => isFilledString(v?.axis) && isFilledString(v?.how)), 'variants: 변형 축마다 axis·how를 적는다(없으면 빈 배열)')
  need(meta.neighbors && ['before', 'after', 'avoid'].every(k => Array.isArray(meta.neighbors[k]) && meta.neighbors[k].every(id => ID_RE.test(id))), 'neighbors: before·after·avoid를 블록 id 배열로 적는다(없으면 빈 배열)')
  if (meta.neighbors?.requiresBeforeSlot !== undefined) {
    need(SLOTS.some(s => s.id === meta.neighbors.requiresBeforeSlot), 'neighbors.requiresBeforeSlot: 자리 id여야 한다')
  }
  if (meta.neighbors?.expectsAfter !== undefined) {
    need(Array.isArray(meta.neighbors.expectsAfter) && meta.neighbors.expectsAfter.every(id => ID_RE.test(id)), 'neighbors.expectsAfter: 블록 id 배열이다')
  }
  need(meta.surface && SURFACE_TONES.includes(meta.surface.tone) && isFilledString(meta.surface.note), `surface: tone(${SURFACE_TONES.join('·')})과 note를 적는다`)
  for (const key of ['top', 'bottom', 'joinsAbove', 'joinsBelow']) {
    if (meta.surface?.[key] !== undefined) need(SURFACE_TONES.includes(meta.surface[key]) && meta.surface[key] !== 'overlap', `surface.${key}: 면 색 이름이다`)
  }
  if (meta.surface?.framed !== undefined) need(typeof meta.surface.framed === 'boolean', 'surface.framed: 판·사진 판에 내용을 담는 바탕 면 블록이면 true(참·거짓 값)')
  if (meta.shell !== undefined) {
    need(meta.shell && ['headerClass', 'footerClass'].every(k => meta.shell[k] === undefined || /^[a-z][a-z0-9-]*$/.test(meta.shell[k])), 'shell: headerClass·footerClass는 클래스 이름 하나다')
  }
  if (meta.bundle !== undefined) {
    need(meta.bundle && isStringList(meta.bundle.parts, { min: 2 }) && isFilledString(meta.bundle.reason), 'bundle: 한 블록으로 묶은 부품 목록(parts, 둘 이상)과 묶은 이유(reason)를 적는다')
  }
  if (meta.krdsPending !== undefined) need(isStringList(meta.krdsPending, { min: 1 }), 'krdsPending: KRDS 기준 밖 항목을 문장으로 적는다')
  if (meta.exceptions !== undefined) need(Array.isArray(meta.exceptions), 'exceptions: 배열이다(형식은 scripts/lib/block-exceptions.js validateException)')
  need(meta.section && ARCHETYPES.includes(meta.section.archetype), `section.archetype: ${ARCHETYPES.join('·')} 중 하나다`)
  need(isStringList(meta.styles, { min: 1 }) && meta.styles.every(s => /^src\/styles\/.+\.css$/.test(s)), 'styles: src/styles/ 아래 CSS 경로가 하나 이상 있어야 한다')
  need(meta.requires && ['components', 'icons', 'scripts'].every(k => Array.isArray(meta.requires[k]) && meta.requires[k].every(isFilledString)), 'requires: components·icons·scripts를 배열로 적는다(없으면 빈 배열)')
  need(isStringList(meta.accessibility, { min: 1 }), 'accessibility: 접근성 주의가 하나 이상 있어야 한다')
  validateContent(meta.content, 'content', problems)

  if (!isFilledString(markup)) {
    problems.push('markup.html이 비어 있다')
    return problems
  }
  const sections = markup.match(/<section\b/g) || []
  need(sections.length === 1 && /^\s*<section\b/.test(markup), 'markup: <section> 하나로 시작한다(main의 직계 자식이 된다)')
  const open = (markup.match(/<section\b[^>]*>/) || [''])[0]
  if (meta.section?.archetype) {
    need(new RegExp(`class="section section--${meta.section.archetype}(?:[ "])`).test(open), `markup: section의 class가 "section section--${meta.section.archetype}"로 시작한다`)
  }
  need(/aria-labelledby="[^"]+"|aria-label="[^"]+"/.test(open), 'markup: section에 접근 가능한 이름(aria-labelledby·aria-label)이 있다')
  need(!/[○〇]{2}/.test(markup), 'markup: ○○ 같은 자리 표기를 쓰지 않는다 — 값 자리는 {{key}}로 적는다')

  let rendered
  try {
    rendered = renderTemplate(markup, meta, 'slots')
  } catch (error) {
    problems.push(`markup: ${error.message}`)
    return problems
  }
  problems.push(...rendered.problems.map(p => `markup: ${p}`))
  const declared = contentPaths(meta.content)
  for (const p of declared.filter(p => !rendered.used.includes(p))) problems.push(`content.${p}: 틀에서 쓰지 않는 자리다`)
  return problems
}

// ─── 채울 자리 목록 ────────────────────────────────────

/** 조립 결과에서 실제 내용으로 채워야 할 자리 — 블록의 content 정의를 사람이 읽는 줄로 편다 */
function placeholderLines(meta, prefix = '') {
  const lines = []
  const walk = (defs, prefix, depth, examples) => {
    for (const def of defs) {
      const pad = '  '.repeat(depth)
      if (def.kind === 'list') {
        const rows = examples ? examples.flatMap(row => row?.[def.key] || []) : def.examples || []
        const shown = examples ? '' : `, 틀에는 ${rows.length}개`
        lines.push(`${pad}- \`{{${prefix}${def.key}.N.…}}\` ${def.label} (${def.min}~${def.max}개${shown}) — ${def.spec}`)
        walk(def.fields, `${prefix}${def.key}.N.`, depth + 1, rows)
      } else {
        const ratio = def.kind === 'image' ? ` 비율 ${def.ratio}.` : ''
        lines.push(`${pad}- \`{{${prefix}${def.key}}}\` ${def.label} (${def.kind}) —${ratio} ${def.spec}`)
      }
    }
  }
  walk(meta.content || [], prefix, 0, null)
  return lines
}

// ─── 순서 점검 ─────────────────────────────────────────

const toneLabel = { plain: '바탕 면', tinted: '옅은 색 면', inverse: '짙은 면', scene: '장면·사진 면', overlap: '걸침' }
const topTone = b => b.surface?.top || b.surface?.tone
const bottomTone = b => b.surface?.bottom || b.surface?.tone

/**
 * 블록 순서를 점검한다. 돌려주는 값: [{ level: 'error'|'warn'|'info', code, message }]
 *   error  이대로는 화면이 깨지거나 규칙(R-25·R-42)을 어긴다
 *   warn   전형 조립·단조로운 면 흐름처럼 디자인이 약해지는 신호
 *   info   참고
 */
function checkSequence(blocks) {
  const out = []
  const add = (level, code, message) => out.push({ level, code, message })
  if (blocks.length === 0) return [{ level: 'error', code: 'empty', message: '블록이 없다.' }]

  const ids = blocks.map(b => b.id)
  const firsts = blocks.filter(b => b.slot === 'first-screen')
  if (firsts.length === 0) {
    add('warn', 'no-first-screen', '첫 화면 블록(slot first-screen)이 없다 — 메인·랜딩은 첫 화면이 컨셉을 전한다. list_blocks({ slot: "first-screen" })로 고른다. 서브 페이지라면 무시한다.')
  } else {
    if (blocks[0].slot !== 'first-screen') add('error', 'first-screen-order', `첫 화면 블록 ${firsts[0].id}가 맨 앞이 아니다 — 히어로는 첫 섹션 하나다(R-42).`)
    if (firsts.length > 1) add('error', 'first-screen-count', `첫 화면 블록이 ${firsts.length}개다(${firsts.map(b => b.id).join(', ')}) — 히어로는 하나다(R-42).`)
  }

  const dup = ids.filter((id, i) => ids.indexOf(id) !== i)
  for (const id of new Set(dup)) add('error', 'duplicate-block', `${id}를 두 번 넣었다 — 제목 id가 겹친다. 한 번만 쓰거나 다른 블록을 고른다.`)

  const slotSeen = new Map()
  for (const b of blocks) {
    if (slotSeen.has(b.slot) && slotSeen.get(b.slot) !== b.id && b.slot !== 'scene') {
      add('warn', 'duplicate-slot', `같은 자리(${b.slot}) 블록이 둘이다 — ${slotSeen.get(b.slot)}, ${b.id}. 같은 역할을 두 번 싣는지 확인한다.`)
    }
    slotSeen.set(b.slot, b.id)
  }

  for (let i = 0; i < blocks.length; i += 1) {
    const b = blocks[i]
    const prev = blocks[i - 1]
    const next = blocks[i + 1]
    const n = b.neighbors || {}

    if (n.requiresBeforeSlot && prev?.slot !== n.requiresBeforeSlot) {
      add('error', 'requires-before', `${b.id}는 앞 블록 위에 걸쳐 올라간다 — 바로 앞이 ${n.requiresBeforeSlot} 자리 블록이어야 한다${prev ? `(지금은 ${prev.id})` : '(지금은 맨 앞)'}.`)
    }
    if (n.expectsAfter?.length && !n.expectsAfter.includes(next?.id)) {
      add('warn', 'expects-after', `${b.id}는 바로 뒤에 ${n.expectsAfter.join('·')}가 오는 것을 전제로 여백을 잡았다${next ? `(지금은 ${next.id})` : '(지금은 맨 끝)'}. 변형 축 안내대로 여백을 고친다.`)
    }
    if (prev && (n.avoid || []).includes(prev.id)) add('warn', 'avoid-neighbor', `${b.id} 앞에 ${prev.id}를 두지 않는다 — 블록 메타데이터의 neighbors.avoid.`)
    if (next && (n.avoid || []).includes(next.id)) add('warn', 'avoid-neighbor', `${b.id} 뒤에 ${next.id}를 두지 않는다 — 블록 메타데이터의 neighbors.avoid.`)
    if (b.shell?.footerClass && next) add('warn', 'not-last', `${b.id}는 푸터 바로 앞의 마지막 블록으로 설계됐다(지금은 뒤에 ${next.id}) — 바닥 전환 그림이 푸터 색으로 칠해져 있다.`)
    if (prev && (n.before || []).includes(prev.id)) add('info', 'good-neighbor', `${prev.id} → ${b.id}: 어울리는 이웃이다.`)

    // 같은 면 연속 — 걸침 블록은 면을 만들지 않으니 건너뛰고 본다. 블록의 아랫면과 다음 블록의 윗면을 견준다
    if (b.surface?.tone && b.surface.tone !== 'overlap') {
      let j = i + 1
      while (blocks[j]?.surface?.tone === 'overlap') j += 1
      const below = blocks[j]
      const tone = bottomTone(b)
      if (below) {
        const joined = b.surface.joinsBelow === topTone(below) || below.surface?.joinsAbove === tone
        if (tone === topTone(below) && tone !== 'plain') {
          if (joined) add('info', 'joined-surface', `${b.id} → ${below.id}: ${toneLabel[tone]}으로 이어지게 설계된 짝이다.`)
          else add('warn', 'same-surface', `${b.id} → ${below.id}: ${toneLabel[tone]}이 이어진다 — 경계가 사라진다. 사이에 다른 면의 블록을 넣거나 한쪽 면을 바꾼다(design-intelligence §5-2 면 지도).`)
        }
        if (b.surface.joinsBelow && b.surface.joinsBelow !== topTone(below)) {
          add('warn', 'joins-below', `${b.id}의 바닥 전환은 아래가 ${toneLabel[b.surface.joinsBelow]}일 때의 색이다(지금은 ${below.id}의 ${toneLabel[topTone(below)]}) — 전환 그림의 색 변수를 아랫면의 토큰으로 바꾼다(get_block("${b.id}") 변형 축).`)
        }
        if (below.surface?.joinsAbove && below.surface.joinsAbove !== tone) {
          add('warn', 'joins-above', `${below.id}는 위가 ${toneLabel[below.surface.joinsAbove]}인 것을 전제로 이어 붙인다(지금은 ${b.id}의 ${toneLabel[tone]}) — 위 여백이나 녹아드는 색을 변형 축대로 고친다(get_block("${below.id}")).`)
        }
      }
    }
  }

  // 판도 사진 판도 없는 바탕 면만 세 번 이상 이어지면 페이지가 한 장의 흰 종이가 된다.
  // 판·사진 판에 내용을 담는 바탕 면 블록(surface.framed)은 세지 않는다 — 섹션 바탕은 흰색 하나가 기본이다(design-intelligence §5-2)
  let run = []
  const flush = () => {
    if (run.length >= 3) add('warn', 'flat-surface', `${run.join(' → ')}: 판 없는 바탕 면이 ${run.length}번 이어진다 — 섹션이 한 덩어리로 보인다. 한 블록을 판이나 사진 판에 담는다.`)
    run = []
  }
  for (const b of blocks) {
    if (b.surface?.tone === 'plain' && topTone(b) === 'plain' && bottomTone(b) === 'plain' && !b.surface.framed) run.push(b.id)
    else if (b.surface?.tone !== 'overlap') flush()
  }
  flush()

  // 흰 섹션과 옅은 색 섹션의 교대 — 옅은 색 면이 바탕 면을 사이에 두고 다시 나오면 회색 띠가 수평으로 쌓인 줄무늬가 된다(D04).
  // 옅은 색 섹션 바탕은 페이지에 한 곳(이어진 한 덩어리)이다(design-intelligence §5-2)
  const tones = blocks.filter(b => b.surface?.tone && b.surface.tone !== 'overlap')
  let seenTinted = null
  let plainAfter = false
  for (const b of tones) {
    const tinted = topTone(b) === 'tinted' || bottomTone(b) === 'tinted'
    if (tinted && seenTinted && plainAfter) {
      add('warn', 'striped-surface', `${seenTinted} … ${b.id}: 바탕 면을 사이에 두고 옅은 색 섹션이 다시 나온다 — 흰색 ↔ 연회색 교대는 띠 나열이다(D04). 섹션 바탕은 흰색 하나로 두고 연회색은 판에 쓴다(design-intelligence §5-2).`)
      break
    }
    if (tinted) { seenTinted = seenTinted || b.id; plainAfter = false } else if (seenTinted && topTone(b) === 'plain') plainAfter = true
  }

  // 같은 archetype 3연속(R-25)
  for (let i = 0; i + 2 < blocks.length; i += 1) {
    const a = blocks[i].section?.archetype
    if (a && blocks[i + 1].section?.archetype === a && blocks[i + 2].section?.archetype === a) {
      add('error', 'archetype-run', `${blocks[i].id} → ${blocks[i + 1].id} → ${blocks[i + 2].id}: section--${a}가 세 번 이어진다(R-25).`)
    }
  }

  if (!out.some(f => f.level !== 'info')) add('info', 'ok', '순서 점검에서 걸린 것이 없다.')
  return out
}

// ─── 페이지 조립 ───────────────────────────────────────

/** 스니펫 문서의 「기본 마크업」 아래 첫 html 코드 블록 */
function firstHtmlFence(markdown) {
  const start = markdown.indexOf('## 기본 마크업')
  const m = /```html\r?\n([\s\S]*?)\r?\n```/.exec(start >= 0 ? markdown.slice(start) : markdown)
  return m ? m[1] : ''
}

function indent(html, spaces) {
  const pad = ' '.repeat(spaces)
  return html.replace(/\r\n/g, '\n').trimEnd().split('\n').map(line => (line ? pad + line : line)).join('\n')
}

/**
 * 블록을 공통 틀에 끼워 완성 HTML을 만든다.
 *   blocks    번들된 블록(메타데이터 + markup)의 배열 — 놓을 순서대로
 *   shell     { boilerplate, header, footer } — 스니펫 문서(markdown) 본문. header·footer가 없으면 boilerplate의 빈 틀을 쓴다
 *   options   { mode: 'slots'|'example', assetBase: '' (자산 경로 앞머리), scriptBase, title }
 * 돌려주는 값: { html, placeholders: [{ block, name, lines }], findings, scripts }
 */
function composePage(blocks, shell, options = {}) {
  const mode = options.mode || 'slots'
  const assetBase = options.assetBase ?? ''
  const scriptBase = options.scriptBase ?? `${assetBase}src/js/`
  const title = options.title ?? '{{page_title}}'

  let html = firstHtmlFence(shell.boilerplate).replace(/\r\n/g, '\n')
  if (!html) throw new Error('boilerplate 스니펫에서 기본 마크업을 찾지 못했다')

  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`)

  const header = shell.header ? firstHtmlFence(shell.header) : ''
  const footer = shell.footer ? firstHtmlFence(shell.footer) : ''
  if (header) html = html.replace(/[ \t]*<header id="header"[\s\S]*?<\/header>/, () => indent(header, 2))
  if (footer) html = html.replace(/[ \t]*<footer id="footer"[\s\S]*?<\/footer>/, () => indent(footer, 2))

  // 블록이 공통 틀에 요구하는 변형(장면 위 투명 머리글, 반전 푸터) — 클래스를 더한다
  for (const cls of [...new Set(blocks.map(b => b.shell?.headerClass).filter(Boolean))]) {
    html = html.replace(/<header id="header" class="site-header/, m => `${m} ${cls}`)
  }
  for (const cls of [...new Set(blocks.map(b => b.shell?.footerClass).filter(Boolean))]) {
    html = html.replace(/<footer id="footer" class="site-footer/, m => `${m} ${cls}`)
  }

  const sections = blocks.map(block => {
    const rendered = renderTemplate(block.markup, block, mode, `${block.id}.`)
    return `    <!-- 블록: ${block.id} — ${block.name} -->\n${indent(rendered.html, 4)}`
  })
  html = html.replace(/<main id="main">[\s\S]*?<\/main>/, () => `<main id="main">\n${sections.join('\n\n')}\n  </main>`)

  const scripts = [...new Set(blocks.flatMap(b => b.requires?.scripts || []))]
  if (scripts.length) {
    const tags = scripts.map(name => `  <script src="${scriptBase}${name}"></script>`).join('\n')
    html = html.replace(/<\/body>/, () => `${tags}\n</body>`)
  }

  // 자산 경로를 한 기준으로 — boilerplate는 ../../, 헤더·푸터·블록은 /로 시작한다
  html = html.replace(/\b(href|src)="(?:\.\.\/\.\.\/|\/)(assets|dist)\//g, (_, attr, dir) => `${attr}="${assetBase}${dir}/`)

  const placeholders = blocks.map(block => ({ block: block.id, name: block.name, lines: placeholderLines(block, `${block.id}.`) }))
  return { html: `${html.trimEnd()}\n`, placeholders, findings: checkSequence(blocks), scripts }
}

// ─── 정본 읽기 ─────────────────────────────────────────

/** CSS에서 쓰는 토큰 이름(--color-*·--font-*)을 모은다 — 주석은 뺀다 */
function tokensInCss(css) {
  const body = css.replace(/\/\*[\s\S]*?\*\//g, '')
  return [...new Set([...body.matchAll(/var\((--(?:color|font)-[a-z0-9-]+)/g)].map(m => m[1]))].sort()
}

/**
 * src/blocks/<id>/를 읽어 번들 한 건씩으로 돌려준다 — 메타데이터 + markup + css(styles 파일을 이어 붙인 것) + tokens.
 * 폴더 이름과 id가 다르거나 파일이 없으면 던진다. 형식 검증은 하지 않는다(validateBlock을 따로 부른다).
 */
function loadBlocks(rootDir) {
  const dir = path.join(rootDir, 'src', 'blocks')
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .sort()
    .map(id => {
      const meta = JSON.parse(fs.readFileSync(path.join(dir, id, 'block.json'), 'utf8'))
      if (meta.id !== id) throw new Error(`src/blocks/${id}/block.json의 id(${meta.id})가 폴더 이름과 다르다`)
      const markup = fs.readFileSync(path.join(dir, id, 'markup.html'), 'utf8').replace(/\r\n/g, '\n')
      const css = (meta.styles || [])
        .map(rel => `/* ${rel} */\n${fs.readFileSync(path.join(rootDir, rel), 'utf8').replace(/\r\n/g, '\n').trim()}`)
        .join('\n\n')
      return { ...meta, tokens: tokensInCss(css), markup, css }
    })
}

// ─── 견본 조합 ─────────────────────────────────────────

/** src/blocks/sets.json — 한 페이지를 이루는 블록 순서의 견본. 없으면 빈 배열 */
function loadSets(rootDir) {
  const file = path.join(rootDir, 'src', 'blocks', 'sets.json')
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')).sets || [] : []
}

/** 견본 조합이 형식을 지키고, 순서 점검에서 오류·경고가 없는지 본다 */
function validateSets(sets, blocks) {
  const problems = []
  const seen = new Set()
  for (const set of sets) {
    const at = `sets.${set?.id ?? '?'}`
    if (!ID_RE.test(set?.id || '')) { problems.push(`${at}: id는 소문자·숫자·하이픈이다`); continue }
    if (seen.has(set.id)) problems.push(`${at}: id가 겹친다`)
    seen.add(set.id)
    for (const key of ['name', 'summary', 'flow', 'useWhen']) if (!isFilledString(set[key])) problems.push(`${at}: ${key}가 없다`)
    if (!isStringList(set.blocks, { min: 2 })) { problems.push(`${at}: blocks(블록 id 순서)가 둘 이상 있어야 한다`); continue }
    const picked = set.blocks.map(id => blocks.find(b => b.id === id))
    const missing = set.blocks.filter((id, i) => !picked[i])
    if (missing.length) { problems.push(`${at}: 카탈로그에 없는 블록 ${missing.join(', ')}`); continue }
    for (const f of checkSequence(picked).filter(f => f.level !== 'info')) problems.push(`${at}: 순서 점검 ${f.level} — ${f.message}`)
  }
  return problems
}

module.exports = {
  loadSets,
  validateSets,
  SLOTS,
  SURFACE_TONES,
  CONTENT_KINDS,
  ARCHETYPES,
  parseTemplate,
  renderTemplate,
  contentPaths,
  validateBlock,
  placeholderLines,
  checkSequence,
  firstHtmlFence,
  composePage,
  tokensInCss,
  loadBlocks
}
