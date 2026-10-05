/**
 * 아이콘 스튜디오 — 화면 동작.
 *
 * 초보자 기준으로 만든다. 화면에 기술 용어를 쓰지 않는다 —
 * "viewBox가 다릅니다"가 아니라 "선이 다른 아이콘보다 굵습니다"로 말한다.
 * 수치는 서버·워커가 재고, 화면은 결론만 전한다.
 */

const $ = (sel) => document.querySelector(sel)
const $$ = (sel) => [...document.querySelectorAll(sel)]

const state = {
  icons: [],
  categories: [],
  filter: { q: '', category: null },
  picked: new Set(),
  svgCache: new Map(),
  pollTimer: null,
  // 찾는 범위: 'set'(우리가 채택한 것) | 'catalog'(구글 전량 — 아직 번호가 없다)
  scope: 'set',
  lib: {
    meta: null,          // 카탈로그 요약 (없으면 {available:false})
    rows: [],            // 지금 화면에 올라온 카탈로그 줄
    total: 0,            // 검색에 걸린 전체 수 (더 보기 판단용)
    byM: new Map(),      // 구글 이름 → 줄. 눌렀을 때 꺼내 쓴다
    seq: 0               // 늦게 온 옛 응답을 버리려는 번호
  },
  suggestSeq: 0,
  variants: [],
  sheetVariant: 'regular',
  // 내보내기에 함께 담을 표정. 기본은 늘 들어가므로 목록에 두지 않는다
  exportVariants: new Set(),
  jobs: []
}

// ── 공통 ──────────────────────────────────────────────

/**
 * API 주소는 **상대경로**로 만든다.
 * `/api/...`처럼 절대경로를 쓰면 nginx가 하위 경로(예: /guide/_icons/)로 프록시할 때
 * 브라우저가 문서 루트를 때려 404가 난다. 상대경로면 현재 위치를 기준으로 붙는다.
 */
function apiUrl(p) {
  return String(p).replace(/^\//, '')
}

async function api(path, options) {
  const res = await fetch(apiUrl(path), {
    headers: { 'content-type': 'application/json' },
    ...options
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.error || `요청 실패 (${res.status})`)
  return body
}

/** 아이콘 SVG를 가져와 캐시한다. 같은 아이콘을 여러 크기로 여러 번 그린다. */
async function loadSvg(name, variant = '') {
  const key = variant ? `${variant}/${name}` : name
  if (state.svgCache.has(key)) return state.svgCache.get(key)
  const p = variant
    ? `icons/${variant}/${encodeURIComponent(name)}.svg`
    : `icons/${encodeURIComponent(name)}.svg`
  const res = await fetch(p)
  const text = res.ok ? await res.text() : ''
  state.svgCache.set(key, text)
  return text
}

/** width/height만 바꿔 같은 SVG를 여러 크기로 쓴다. */
function sized(svg, px) {
  return svg.replace(/width="\d+" height="\d+"/, `width="${px}" height="${px}"`)
}

function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
}

// ── 화면 전환 ─────────────────────────────────────────

function show(view) {
  $$('.view').forEach((v) => { v.hidden = v.id !== `view-${view}` })
  $$('.tabs__btn').forEach((b) => {
    const on = b.dataset.view === view
    b.classList.toggle('tabs__btn--on', on)
    b.setAttribute('aria-selected', String(on))
  })
  if (view === 'make') startPolling()
  else stopPolling()
  if (view === 'export') renderExport()
}

// ── 찾기 ──────────────────────────────────────────────
//
// 찾는 범위는 둘이다.
//   세트      우리가 채택한 아이콘. 번호가 붙어 있어 바로 쓴다.
//   카탈로그  구글 Material Symbols 전량. 찾고 미리 볼 뿐 번호가 없다 —
//             「세트에 넣기」를 해야 쓸 수 있다.
// 전량을 세트로 두지 않는 까닭: 쓰지도 않을 아이콘만큼 스프라이트·폰트·스타터가 커진다.

const PAGE = 120

const catalogOn = () => Boolean(state.lib.meta?.available)

function renderScope() {
  $$('.scope__btn').forEach((b) => {
    const on = b.dataset.scope === state.scope
    b.classList.toggle('scope__btn--on', on)
    if (on) b.setAttribute('aria-current', 'true')
    else b.removeAttribute('aria-current')
  })
  // 카탈로그를 못 받았으면 버튼 자체를 감춘다 — 눌러도 빈 화면만 나온다
  $('[data-scope="catalog"]').hidden = !catalogOn()
  $('#scope-set-n').textContent = state.icons.length
  $('#scope-cat-n').textContent = catalogOn() ? state.lib.meta.count.toLocaleString('ko-KR') : ''
}

function setScope(scope) {
  if (scope === 'catalog' && !catalogOn()) return
  state.scope = scope
  state.filter.category = null
  renderScope()
  renderChips()
  renderGrid()
}

function renderChips() {
  let chips
  if (state.scope === 'catalog') {
    const meta = state.lib.meta
    chips = [
      { id: null, label: `전체 ${meta.count.toLocaleString('ko-KR')}` },
      ...meta.categories.map((c) => ({ id: c.id, label: `${c.label} ${c.count.toLocaleString('ko-KR')}` }))
    ]
  } else {
    chips = [
      { id: null, label: `전체 ${state.icons.length}` },
      { id: '__own', label: `우리가 만든 것 ${state.icons.filter((i) => i.own).length}` },
      ...state.categories.map((c) => ({
        id: c.id,
        label: `${c.label} ${state.icons.filter((i) => i.category === c.id).length}`
      }))
    ]
  }
  $('#chips').innerHTML = chips
    .map((c) => {
      const on = state.filter.category === c.id
      return `<button type="button" class="chip${on ? ' chip--on' : ''}" data-cat="${c.id ?? ''}"${on ? ' aria-current="true"' : ''}>${esc(c.label)}</button>`
    })
    .join('')
}

/** 세트 안에서 거른다. 이름은 영어인데 쓰는 사람은 한국어로 생각한다 — 검색어 사전이 그 다리다. */
function filtered() {
  const q = state.filter.q.trim().toLowerCase()
  const cat = state.filter.category
  return state.icons.filter((i) => {
    if (cat === '__own' && !i.own) return false
    if (cat && cat !== '__own' && i.category !== cat) return false
    if (!q) return true
    return (
      i.name.includes(q) ||
      (i.categoryLabel || '').includes(q) ||
      (i.keywords || []).some((k) => k.includes(q))
    )
  })
}

function announce(text) {
  $('#find-live').textContent = text
}

function renderGrid() {
  if (state.scope === 'catalog') return searchCatalog({ reset: true })
  renderSetGrid()
}

function renderSetGrid() {
  const rows = filtered()
  const grid = $('#grid')
  const q = state.filter.q.trim()
  $('#more').hidden = true

  const empty = $('#find-empty')
  empty.hidden = rows.length > 0
  if (rows.length === 0) {
    empty.innerHTML =
      (q ? `세트에 “${esc(q)}”에 맞는 아이콘이 없습니다. ` : '세트가 비어 있습니다. ') +
      (catalogOn() ? '<button type="button" class="linkbtn" data-scope-go="catalog">카탈로그에서 찾아보기</button> ' : '') +
      '<button type="button" class="linkbtn" data-goto="make">만들기로 넘어가기</button>'
  }
  announce(q ? `세트에서 ${rows.length}종을 찾았습니다` : '')

  grid.innerHTML = rows
    .map((i) => `<button type="button" class="cell${i.own ? ' cell--own' : ''}" data-name="${esc(i.name)}">
      <span class="cell__svg" data-svg="${esc(i.name)}"></span>
      <span class="cell__name">${esc(i.name)}</span>
    </button>`)
    .join('')

  // SVG는 따로 채운다 — 한 번에 72개를 fetch해도 캐시가 받아 준다
  for (const holder of grid.querySelectorAll('[data-svg]')) {
    loadSvg(holder.dataset.svg).then((svg) => { holder.innerHTML = svg })
  }
  scheduleCatalogNote()
}

/** 세트에서 찾는 중에도 카탈로그에 몇 종이 있는지 알려 준다 — 못 찾고 돌아서지 않게. */
let noteTimer = null
function scheduleCatalogNote() {
  const note = $('#scope-note')
  clearTimeout(noteTimer)
  const q = state.filter.q.trim()
  if (state.scope !== 'set' || !q || !catalogOn()) {
    if (state.scope === 'set') note.hidden = true
    return
  }
  noteTimer = setTimeout(async () => {
    try {
      const data = await api(`/api/library/search?q=${encodeURIComponent(q)}&limit=1`)
      // 그 사이 범위나 검색어가 바뀌었으면 버린다
      if (state.scope !== 'set' || state.filter.q.trim() !== q) return
      if (data.total === 0) {
        note.hidden = true
        return
      }
      note.hidden = false
      note.innerHTML = `카탈로그에서는 “${esc(q)}”가 <b>${data.total.toLocaleString('ko-KR')}종</b> 찾아집니다. <button type="button" class="linkbtn" data-scope-go="catalog">카탈로그에서 보기</button>`
    } catch {
      note.hidden = true
    }
  }, 250)
}

// ── 카탈로그 ──

function libCell(r) {
  const mine = Boolean(r.a)
  const label = r.ko || r.m.replace(/_/g, ' ')
  return `<button type="button" class="cell cell--lib${mine ? ' cell--in' : ''}" data-m="${esc(r.m)}">
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="library/sprite.svg#${esc(r.m)}"></use></svg>
      <span class="cell__label">${esc(label)}</span>
      <span class="cell__name">${esc(r.m)}</span>
      ${mine ? '<span class="cell__badge">세트</span>' : ''}
    </button>`
}

async function searchCatalog({ reset = false } = {}) {
  const lib = state.lib
  const seq = ++lib.seq
  const q = state.filter.q.trim()
  const params = new URLSearchParams({ q, offset: String(reset ? 0 : lib.rows.length), limit: String(PAGE) })
  if (state.filter.category) params.set('category', state.filter.category)

  let data
  try {
    data = await api(`/api/library/search?${params}`)
  } catch (e) {
    if (seq !== lib.seq) return
    $('#find-empty').hidden = false
    $('#find-empty').textContent = `카탈로그를 불러오지 못했습니다 — ${e.message}`
    return
  }
  // 더 새로운 검색이 이미 나갔으면 이 응답은 버린다 — 늦게 온 옛 결과가 화면을 덮지 않게
  if (seq !== lib.seq) return

  if (reset) lib.rows = []
  lib.rows.push(...data.rows)
  lib.total = data.total
  for (const r of data.rows) lib.byM.set(r.m, r)

  const grid = $('#grid')
  const html = data.rows.map(libCell).join('')
  if (reset) grid.innerHTML = html
  else grid.insertAdjacentHTML('beforeend', html)

  const empty = $('#find-empty')
  empty.hidden = lib.rows.length > 0
  if (lib.rows.length === 0) {
    empty.innerHTML =
      `카탈로그에도 “${esc(q)}”에 맞는 아이콘이 없습니다. 영어 이름으로도 찾아 보세요. ` +
      '<button type="button" class="linkbtn" data-goto="make">없으면 만들기로 넘어가기</button>'
  }

  const note = $('#scope-note')
  note.hidden = false
  note.innerHTML =
    `구글 Material Symbols <b>${lib.total.toLocaleString('ko-KR')}종</b>${q ? ` 중 “${esc(q)}”` : ''}. ` +
    '번호가 없어 아직 쓸 수 없습니다 — 눌러서 <b>세트에 넣으면</b> 씁니다. <span class="badge">세트</span> 표시는 이미 있는 것입니다.'

  $('#more').hidden = lib.rows.length >= lib.total
  $('#more-n').textContent = `${lib.rows.length.toLocaleString('ko-KR')} / ${lib.total.toLocaleString('ko-KR')}`
  announce(reset ? `카탈로그에서 ${lib.total.toLocaleString('ko-KR')}종을 찾았습니다` : `${data.rows.length}종을 더 불러왔습니다`)
}

/** 카탈로그의 한 아이콘을 눌렀을 때. 이미 세트에 있으면 상세, 없으면 채택 시트. */
function openCatalogCell(m) {
  const r = state.lib.byM.get(m)
  if (!r) return
  if (r.a) return openSheet(r.a)
  return openAdopt(r)
}

// ── 상세 ──────────────────────────────────────────────

const VARIANT_LABEL = { regular: '기본', slim: '슬림', bold: '볼드', fill: '필' }

/** 표정을 바꿔 다시 그린다. 이름과 코드포인트는 표정과 무관하게 그대로다. */
async function renderSheet(name, variant) {
  const icon = state.icons.find((i) => i.name === name)
  if (!icon) return
  const isBase = variant === 'regular'
  const svg = await loadSvg(name, isBase ? '' : variant)

  $('#sheet-preview').innerHTML = [48, 24, 20, 16].map((px) => sized(svg, px)).join('')

  // 이 아이콘이 가진 표정만 보여 준다 — 없는 것을 누르면 빈 네모가 나온다
  const avail = ['regular', ...(icon.variants || [])]
  const missing = state.variants.map((v) => v.id).filter((v) => !avail.includes(v))
  // 우리가 만든 아이콘만 표정을 더 만들 수 있다 — 씨앗은 구글에서 받아 온다
  const canMake = icon.own && missing.length > 0
  $('#sheet-variants').innerHTML =
    avail
      .map((v) => `<button type="button" class="vbtn${v === variant ? ' vbtn--on' : ''}" data-variant="${v}">${VARIANT_LABEL[v] || v}</button>`)
      .join('') +
    (canMake
      ? `<button type="button" class="vbtn vbtn--make" data-make-variants="${name}">+ ${missing.map((v) => VARIANT_LABEL[v] || v).join('·')} 만들기</button>`
      : '')

  // 기본은 span(폰트) 방식이다. 한 줄이라 붙여 넣기 쉽고 마크업이 짧다.
  const vc = isBase ? '' : ` icon-font--${variant}`
  $('#sheet-code').value = `<span class="icon-font${vc} icon-font--${name}" aria-hidden="true"></span>`
  // SVG 방식은 스프라이트 파일이 곧 표정이다 — 클래스를 더 붙이지 않는다
  const sprite = isBase ? 'sprite.svg' : `sprite-${variant}.svg`
  $('#sheet-alt').value =
    `<svg class="icon" aria-hidden="true">\n  <use href="/assets/icons/${sprite}#${name}"></use>\n</svg>`

  $('#sheet-meta').textContent =
    `${icon.categoryLabel} · ${icon.own ? '우리가 만든 것' : '구글 아이콘'} · ${icon.codepoint}` +
    (isBase ? '' : ` · ${VARIANT_LABEL[variant] || variant}`)
  $('#sheet-hint').textContent = ''
  $('#sheet').dataset.variant = variant
}

async function openSheet(name) {
  const icon = state.icons.find((i) => i.name === name)
  if (!icon) return
  state.sheetVariant = 'regular'
  $('#sheet-name').textContent = name
  $('#sheet').dataset.name = name
  await renderSheet(name, 'regular')
  $('#sheet').showModal()
}

// ── 카탈로그 아이콘을 세트에 넣기 ──────────────────────────
//
// 미리 보는 것과 들어오는 것은 같다 — 서버가 채택할 때와 같은 코드로 받아 옮긴 그림을 미리보기로 준다.
// 「미리 본 것과 들어온 것이 다르다」가 이 도구에서 가장 나쁜 일이다.

const FACES = ['regular', 'slim', 'bold', 'fill']

/** 서버가 주는 변환 경고를 쓰는 사람이 읽을 말로 바꾼다. 모르는 경고는 보이지 않는다. */
function plainWarning(w) {
  if (/^라이브 영역/.test(w)) return '가장자리 여백이 다른 아이콘보다 조금 좁습니다. 구글 원본이 그렇습니다.'
  return ''
}

function renderFaces(expr) {
  $('#adopt-faces').innerHTML = FACES
    .map((id) => {
      const svg = expr?.[id]
      const label = VARIANT_LABEL[id] || id
      if (!svg) {
        // 채울 면이 없는 형태(돋보기 등)는 그 표정이 기본과 같다. 만들지 않고 비워 둔다
        return `<div class="face face--none"><span class="face__art">${expr ? '' : '…'}</span><span class="face__label">${label}</span>${expr ? '<span class="face__note">기본과 같음</span>' : ''}</div>`
      }
      return `<div class="face"><span class="face__art">${sized(svg, 40)}${sized(svg, 20)}</span><span class="face__label">${label}</span></div>`
    })
    .join('')
}

async function openAdopt(r) {
  const dlg = $('#adopt')
  dlg.dataset.m = r.m
  const meta = state.lib.meta
  const cat = meta?.categories.find((c) => c.id === r.c)

  $('#adopt-title').textContent = r.ko || r.m.replace(/_/g, ' ')
  $('#adopt-meta').textContent = `${r.m}${cat ? ` · ${cat.label}` : ''} · 구글 Material Symbols`
  $('#adopt-name').value = r.n || r.s || ''
  $('#adopt-kw').value = [r.ko, ...(r.k || [])].filter(Boolean).join(', ')
  $('#adopt-error').hidden = true
  $('#adopt-warn').hidden = true
  $('#adopt-go').disabled = false
  $('#adopt-go').textContent = '세트에 넣기'

  // 이름이 규칙에 어긋나면 이유와 제안을 붙인다. 제안은 출발점이지 확정이 아니다.
  $('#adopt-rule').textContent = r.x
    ? `${r.x}${r.s ? ` — 제안한 이름: ${r.s}` : ' — 직접 지어 주세요.'}`
    : ''

  const sel = $('#adopt-cat')
  sel.innerHTML = state.categories.map((c) => `<option value="${esc(c.id)}">${esc(c.label)}</option>`).join('')
  const ours = cat?.ours
  sel.value = state.categories.some((c) => c.id === ours) ? ours : 'domain'

  renderFaces(null)
  dlg.showModal()

  try {
    const data = await api(`/api/library/preview?m=${encodeURIComponent(r.m)}`)
    if (dlg.dataset.m !== r.m) return // 그 사이 다른 아이콘을 열었다
    renderFaces(data.expressions)
    const notes = [...new Set((data.warnings || []).map(plainWarning).filter(Boolean))]
    if (notes.length > 0) {
      $('#adopt-warn').hidden = false
      $('#adopt-warn').textContent = notes.join(' ')
    }
  } catch (e) {
    if (dlg.dataset.m !== r.m) return
    $('#adopt-faces').innerHTML = ''
    $('#adopt-error').hidden = false
    $('#adopt-error').textContent = `미리 보지 못했습니다 — ${e.message}. 넣기는 그대로 시도할 수 있습니다.`
  }
}

async function submitAdopt(e) {
  e.preventDefault()
  const dlg = $('#adopt')
  const m = dlg.dataset.m
  const name = $('#adopt-name').value.trim()
  const err = $('#adopt-error')
  err.hidden = true

  if (!name) {
    err.hidden = false
    err.textContent = '이름을 정해 주세요. 영문 소문자와 붙임표만 씁니다 (예: shopping-cart).'
    $('#adopt-name').focus()
    return
  }

  const btn = $('#adopt-go')
  btn.disabled = true
  btn.textContent = '넣는 중…'
  try {
    const keywords = $('#adopt-kw').value.split(',').map((k) => k.trim()).filter(Boolean)
    const r = await api('/api/adopt', {
      method: 'POST',
      body: JSON.stringify({ material: m, name, category: $('#adopt-cat').value, keywords })
    })

    dlg.close()
    // 카탈로그 쪽 표시를 바꾼다 — 다시 검색하면 쪽수와 자리가 날아가므로 화면의 칸만 고친다
    const row = state.lib.byM.get(m)
    if (row) row.a = r.name
    if (state.lib.meta) state.lib.meta.adopted += 1
    for (const cell of $$(`.cell--lib[data-m="${m}"]`)) {
      cell.outerHTML = libCell(state.lib.byM.get(m))
    }

    await load()
    await openSheet(r.name)
    $('#sheet-hint').textContent = '세트에 넣었습니다. 위 코드를 붙여 넣으세요. 저장소에 올리기 전까지는 이 서버에만 있습니다.'
  } catch (e2) {
    err.hidden = false
    err.textContent = e2.message
    btn.disabled = false
    btn.textContent = '세트에 넣기'
  }
}

// ── 만들기 ────────────────────────────────────────────

/**
 * 만들기 전에 이미 있는 것을 보여 준다.
 *
 * 만드는 데는 몇 분이 걸리고 결과는 구글 아이콘보다 못한 경우가 많다. 쓰는 사람이
 * 카탈로그에 있는 줄 모르고 만들어 달라고 하는 일이 가장 흔한 낭비라서, 요청문에서
 * 말을 뽑아 카탈로그를 먼저 뒤진다. 단어마다 따로 찾아 번갈아 담는다 — 문장 통째로는 안 걸린다.
 */
let suggestTimer = null

async function renderSuggest() {
  const box = $('#ask-suggest')
  if (!catalogOn()) {
    box.hidden = true
    return
  }
  const words = guessKeywords($('#ask-text').value, '').slice(0, 4)
  if (words.length === 0) {
    box.hidden = true
    return
  }

  const seq = ++state.suggestSeq
  const results = await Promise.all(
    words.map((w) => api(`/api/library/search?q=${encodeURIComponent(w)}&limit=6`).catch(() => ({ rows: [] })))
  )
  if (seq !== state.suggestSeq) return

  // 적게 걸리는 말이 구체적인 말이다 — 「모바일」은 수십 종에 걸리지만 「영수증」은 몇 종뿐이다.
  // 구체적인 말을 앞에 세워 번갈아 담으면 흔한 말이 자리를 채우지 못한다.
  const ranked = results.filter((r) => r.total > 0).sort((a, b) => a.total - b.total)

  const picked = []
  const seen = new Set()
  for (let i = 0; i < 6 && picked.length < 8; i += 1) {
    for (const res of ranked) {
      const row = res.rows[i]
      if (row && !seen.has(row.m) && picked.length < 8) {
        seen.add(row.m)
        picked.push(row)
        state.lib.byM.set(row.m, row)
      }
    }
  }
  box.hidden = picked.length === 0
  $('#ask-suggest-list').innerHTML = picked.map(libCell).join('')
}

/** 시작한 지 얼마나 됐는지. 오래 걸리는 일이라 「멈춘 건가」를 묻지 않게 한다. */
function elapsed(from) {
  if (!from) return ''
  const sec = Math.max(0, Math.round((Date.now() - new Date(from).getTime()) / 1000))
  return sec < 60 ? `${sec}초째` : `${Math.floor(sec / 60)}분 ${sec % 60}초째`
}

function statusLine(job) {
  if (job.status === 'waiting') {
    return `<p class="status status--waiting"><span class="status__dot"></span>차례를 기다리는 중입니다. 창을 닫아도 됩니다.</p>`
  }
  if (job.status === 'working') {
    // 실측(--effort low): 도형 하나 8초~1분. 후보 4개를 차례로 그리므로 1~2분이다.
    const t = elapsed(job.result?.startedAt)
    const kind = job.kind === 'variants' ? '표정을 만드는' : '그리는'
    return `<p class="status status--working"><span class="status__dot"></span>${kind} 중입니다${t ? ` — ${t}` : ''}. 좌표를 하나씩 놓는 일이라 <b>1~2분</b> 걸립니다. 창을 닫아도 됩니다.</p>`
  }
  if (job.status === 'failed') {
    const raw = (job.result?.failures || []).join(' / ')
    // 같은 이유가 후보 수만큼 되풀이돼 「시간 초과 / 시간 초과 / 시간 초과」로 뜬다.
    const seen = [...new Set((job.result?.failures || []).map((f) => String(f)))]
    const why = seen.join(' / ') || '알 수 없는 이유'
    // 서버 사정은 우리가 고칠 것이 없다 — 무엇을 하면 되는지만 말한다
    const busy = /529|Overloaded|붐빕|rate.?limit/i.test(raw)
    const hint = busy
      ? ' 클로드 서버가 잠시 붐빈 것이라 우리 쪽 문제가 아닙니다. 조금 뒤 다시 눌러 보세요.'
      : ''
    return `<p class="status status--failed"><span class="status__dot"></span>만들지 못했습니다 — ${esc(why)}${hint}</p>`
  }
  return ''
}

function candCard(job, cand) {
  const notes = cand.review.notes
    .map((n) => `<p class="note note--${n.level}">${esc(n.text)}</p>`)
    .join('')
  const blocked = cand.review.ok === false
  // 모델이 지어 온 이름을 기본값으로 쓴다. 요청이 한글이면 화면에서
  // 이름을 뽑아낼 방법이 없어 예전에는 늘 빈칸이었다.
  const suggested = cand.suggested || ''

  return `<div class="cand" data-job="${esc(job.id)}" data-idx="${cand.index}">
    <div class="cand__art">
      ${sized(cand.svg, 48)}${sized(cand.svg, 24)}${sized(cand.svg, 16)}
    </div>
    ${notes}
    ${blocked ? '' : `<div class="namefield">
      <label for="nm-${esc(job.id)}-${cand.index}">이름 — 영문, 뜻을 담아</label>
      <input id="nm-${esc(job.id)}-${cand.index}" class="cand__name" value="${esc(suggested)}" placeholder="예: e-ticket" autocomplete="off" spellcheck="false">
    </div>
    <div class="namefield">
      <label for="kw-${esc(job.id)}-${cand.index}">찾을 말 — 쉼표로 나눠, 한국어로</label>
      <input id="kw-${esc(job.id)}-${cand.index}" class="cand__keywords" value="${esc(guessKeywords(job.text, suggested).join(', '))}" placeholder="예: 전자티켓, 입장권, QR" autocomplete="off">
    </div>`}
    <div class="cand__foot">
      ${blocked
        ? '<button class="btn btn--ghost btn--full" disabled>규격에 안 맞습니다</button>'
        : '<button class="btn btn--full cand__pick">이걸로 정하기</button>'}
    </div>
  </div>`
}

function renderJobs(jobs) {
  $('#make-empty').hidden = jobs.length > 0
  $('#jobs').innerHTML = jobs
    .map((job) => {
      const when = new Date(job.createdAt).toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
      const cands = job.result?.candidates || []
      const isVariant = job.kind === 'variants' || job.result?.kind === 'variants'
      return `<article class="job">
        <div class="job__head">
          <p class="job__text">${esc(job.text)}</p>
          <span class="job__time">${when}
            <button class="linkbtn job__discard" data-job="${esc(job.id)}">버리기</button>
          </span>
        </div>
        ${statusLine(job)}
        ${isVariant ? variantCard(job) : ''}
        ${cands.length > 0 ? `<div class="cands">${cands.map((c) => candCard(job, c)).join('')}</div>` : ''}
      </article>`
    })
    .join('')
}

/**
 * 표정 결과 카드.
 *
 * 기본을 맨 왼쪽에 두고 만든 표정을 그 옆에 붙인다 — **나란히 놓지 않으면
 * 「같은 아이콘인가」를 눈으로 볼 수 없다.** 실측 수치도 함께 적는다.
 * 통과한 것만 미리 체크해 두고, 막힌 것도 지우지 않고 보여 준다 —
 * 기계가 「이상하다」고는 해도 「그러니 빼라」고 정할 수는 없다.
 */
function variantCard(job) {
  const r = job.result
  if (!r || r.status === 'working') return ''
  const rows = r.results || []
  if (rows.length === 0) return ''

  const face = (svg, px) => sized(svg, px)
  const cells = rows.map((x) => {
    if (x.error) {
      return `<div class="vres vres--fail"><span class="vres__name">${esc(VARIANT_LABEL[x.variant] || x.variant)}</span>
        <p class="vres__note">만들지 못했습니다 — ${esc(x.error)}</p></div>`
    }
    if (x.none) {
      return `<div class="vres vres--none"><span class="vres__name">${esc(VARIANT_LABEL[x.variant] || x.variant)}</span>
        <p class="vres__note">채울 면이 없는 형태입니다. 이 아이콘에는 만들지 않습니다.</p></div>`
    }
    const m = x.review?.metrics || {}
    const notes = (x.review?.notes || [])
      .map((n) => `<span class="vres__tag vres__tag--${n.level}">${esc(n.text)}</span>`)
      .join('')
    return `<div class="vres">
      <label class="vres__pick">
        <input type="checkbox" class="vres__on" data-variant="${esc(x.variant)}" ${x.review?.ok ? 'checked' : ''}>
        <span class="vres__name">${esc(VARIANT_LABEL[x.variant] || x.variant)}</span>
      </label>
      <div class="vres__art">${face(x.svg, 48)}${face(x.svg, 24)}${face(x.svg, 16)}</div>
      <p class="vres__num">획 ${m.strokeWeight ?? '?'} · 기본의 ${m.areaRatio ?? '?'}배 · 자리 어긋남 ${m.boundsDrift ?? '?'}</p>
      ${notes}
    </div>`
  }).join('')

  const canTake = rows.some((x) => x.svg)
  return `<div class="vgroup" data-job="${esc(job.id)}" data-name="${esc(r.name || '')}">
    <div class="vres vres--base">
      <span class="vres__name">기본</span>
      <div class="vres__art">${face(r.baseSvg || '', 48)}${face(r.baseSvg || '', 24)}${face(r.baseSvg || '', 16)}</div>
      <p class="vres__num">이것과 같은 모양이어야 합니다</p>
    </div>
    ${cells}
    ${canTake ? '<div class="vgroup__foot"><button class="btn vgroup__take">고른 표정 넣기</button></div>' : ''}
  </div>`
}

/**
 * 일꾼이 멈췄으면 말해 준다.
 *
 * 조용히 멈추는 실패가 실제로 있다 — claude 세션 자격이 만료되면 자동 갱신이 안 되는
 * 상태로 빠지고, 그때부터 요청은 「기다리는 중」으로 영원히 남는다. 아무 말이 없으면
 * 쓰는 사람은 자기가 뭘 잘못 적었나 싶어 계속 기다린다.
 *
 * **요청을 넣기 전에** 보여야 하므로 입력칸 위에 둔다. 「4개 만들기」도 막는다 —
 * 처리되지 않을 요청을 큐에 쌓아 봐야 나중에 지울 일만 생긴다.
 */
function renderWorkerHealth(worker) {
  const box = $('#worker-down')
  const send = $('#ask-send')
  if (!box) return

  if (!worker || worker.alive) {
    box.hidden = true
    box.innerHTML = ''
    if (send) send.disabled = false
    return
  }

  box.hidden = false
  box.innerHTML =
    `<b>만들기가 지금 멈춰 있습니다.</b> ${esc(worker.reason || '일꾼이 응답하지 않습니다')} — ` +
    '지금 요청을 넣으면 처리되지 않고 쌓이기만 합니다.<br>' +
    '<b>찾기와 내보내기는 그대로 됩니다.</b> 만들기는 UX팀에 알려 주세요 ' +
    '(서버에서 <code>~/services/icon-studio/start.sh</code>).'
  if (send) send.disabled = true
}

async function refreshJobs() {
  try {
    const { requests, worker } = await api('/api/requests')
    state.jobs = requests
    renderJobs(requests)
    renderWorkerHealth(worker)
  } catch {
    /* 워커가 없어도 화면은 살아 있어야 한다 */
  }
}

function startPolling() {
  refreshJobs()
  stopPolling()
  state.pollTimer = setInterval(refreshJobs, 4000)
}

function stopPolling() {
  if (state.pollTimer) clearInterval(state.pollTimer)
  state.pollTimer = null
}

// ── 내보내기 ──────────────────────────────────────────

async function renderExport() {
  const list = $('#picklist')
  list.innerHTML = state.icons
    .map((i) => `<label class="pickrow">
      <input type="checkbox" data-pick="${esc(i.name)}"${state.picked.has(i.name) ? ' checked' : ''}>
      <span class="pickrow__svg" data-svg="${esc(i.name)}"></span>
      <span>${esc(i.name)}</span>
      <em>${i.own ? '우리가 만든 것' : '구글'}</em>
    </label>`)
    .join('')

  for (const holder of list.querySelectorAll('[data-svg]')) {
    loadSvg(holder.dataset.svg).then((svg) => { holder.innerHTML = sized(svg, 20) })
  }
  renderTree()
}

function renderVariantPicker() {
  const box = $('#export-variants')
  if (!box) return
  box.innerHTML = state.variants
    .map((v) => {
      const on = state.exportVariants.has(v.id)
      return `<button type="button" class="vbtn${on ? ' vbtn--on' : ''}" data-export-variant="${v.id}" aria-pressed="${on}">${VARIANT_LABEL[v.id] || v.id}</button>`
    })
    .join('')
}

function renderTree() {
  const n = state.picked.size
  $('#pick-n').textContent = `${n}개`
  $('#do-export').disabled = n === 0
  renderVariantPicker()

  const picked = [...state.picked]
  const chosen = state.variants.filter((v) => state.exportVariants.has(v.id))

  // 표정이 없는 아이콘은 그 표정 파일에서 빠진다 — 숫자를 미리 보여 주면
  // 「필을 골랐는데 왜 40개뿐이냐」를 받은 뒤에 묻지 않는다
  const countFor = (id) =>
    picked.filter((n2) => (state.icons.find((i) => i.name === n2)?.variants || []).includes(id)).length

  const rows = [
    `├─ sprite.svg          ${n}개`,
    ...chosen.map((v) => `├─ sprite-${v.id}.svg${' '.repeat(Math.max(1, 10 - v.id.length))}${countFor(v.id)}개`),
    `├─ infoux-icons.woff2  폰트`,
    ...chosen.map((v) => `├─ infoux-icons-${v.id}.woff2`),
    `├─ icons.css           폰트 여벌 (Tailwind 없이 그대로 씁니다)`,
    `├─ svg/                낱개 ${n}개`,
    ...chosen.map((v) => `├─ svg/${v.id}/${' '.repeat(Math.max(1, 15 - v.id.length))}낱개 ${countFor(v.id)}개`),
    `├─ LICENSE-NOTICE.txt  재배포 조건`,
    `└─ README.txt          쓰는 법`
  ]
  $('#tree').textContent = `infoux-icons.zip → assets/icons/\n${rows.join('\n')}`
}

/**
 * 묶음 내려받기 — zip 하나.
 *
 * 예전에는 파일을 낱개로 떨구며 폴더를 이름에 접어 넣고(`svg_star.svg`)
 * 「svg_로 시작하는 파일은 svg/ 폴더에 넣으세요」라고 안내했다. 받는 사람이
 * 손으로 다시 조립해야 했고, 폰트(woff2)는 이진이라 아예 못 보내 「저장소에서
 * 따로 가져오라」는 한 줄이 남았다. 그 한 줄이 「별다른 절차 없이」를 깨뜨렸다.
 *
 * zip은 서버가 만든다(studio/lib/zip.mjs — 의존성 없이 직접 씀). 브라우저는
 * 받은 것을 저장만 한다.
 */
async function doExport() {
  const btn = $('#do-export')
  const note = $('#export-status')
  btn.disabled = true
  note.textContent = '묶음을 만드는 중입니다…'

  try {
    const res = await fetch(apiUrl('/api/bundle'), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        names: [...state.picked],
        variants: [...state.exportVariants]
      })
    })
    if (!res.ok) {
      const msg = await res.json().catch(() => ({}))
      throw new Error(msg.error || `서버 ${res.status}`)
    }

    const count = Number(res.headers.get('x-icon-count') || 0)
    const missing = Number(res.headers.get('x-icon-missing') || 0)
    const fileCount = Number(res.headers.get('x-icon-files') || 0)
    const unbuilt = Number(res.headers.get('x-icon-unbuilt') || 0)

    const blob = await res.blob()
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'infoux-icons.zip'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(a.href)

    const kb = (blob.size / 1024).toFixed(0)
    note.textContent =
      `infoux-icons.zip 내려받았습니다 — ${count}종 · 파일 ${fileCount}개 · ${kb}KB.` +
      (missing ? ` (${missing}개는 파일이 없어 빠졌습니다)` : '') +
      ' 풀어서 assets/icons/ 에 그대로 넣으세요.' +
      (unbuilt ? ` 단, ${unbuilt}종은 폰트에 아직 없어 SVG 방식으로만 쓸 수 있습니다 (README.txt에 이름이 있습니다).` : '')
  } catch (e) {
    note.textContent = `내려받지 못했습니다 — ${e.message}`
  } finally {
    btn.disabled = state.picked.size === 0
  }
}

// ── 시작 ──────────────────────────────────────────────

/**
 * 저장소에 아직 없는 아이콘을 알린다.
 *
 * 스튜디오는 git 체크아웃 안에 파일을 쓰는데 이 서버의 클론에는 push 권한이 없다.
 * 만든 아이콘은 **여기 머물 뿐 저장소로 가지 않고**, 다음 배포가 `git reset --hard`를
 * 하면 조용히 사라진다. 만든 사람이 그 사실을 모르면 애써 만든 것을 잃는다.
 *
 * 찾기 화면 맨 위에 둔다 — 만든 직후 돌아오는 자리다.
 */
async function renderPending() {
  const box = $('#pending')
  if (!box) return
  try {
    const p = await api('/api/pending')
    if (!p.available || p.files === 0) {
      box.hidden = true
      return
    }
    const names = p.icons.length > 0
      ? p.icons.map((n) => `<code>${esc(n)}</code>`).join(' ')
      : `파일 ${p.files}개`
    box.hidden = false
    box.innerHTML = p.canPush
      // 권한이 있으면 여기서 끝낼 수 있다. 「사라진다」는 겁을 주지 않는다 — 한 번 누르면 되니까.
      ? `<b>${names} — 아직 저장소에 없습니다.</b> 올리면 팀 전체가 씁니다 ` +
        '(대장 번호와 검색어까지 함께 갑니다).<br>' +
        '<button type="button" class="pending__get" id="pending-push">저장소에 올리기</button>' +
        '<span class="pending__state" id="pending-state"></span>'
      : `<b>${names} — 아직 저장소에 없습니다.</b> 이 서버에만 있어서 <b>다음 배포 때 사라집니다.</b><br>` +
        '패치를 받아 자기 클론에 <code>git apply</code>로 옮긴 뒤 커밋하면 팀 전체가 씁니다 — ' +
        '대장 번호와 검색어까지 함께 갑니다.<br>' +
        (p.pushBlocked ? `<span class="pending__state">서버가 직접 올리지 못하는 이유 — ${esc(p.pushBlocked)}</span><br>` : '') +
        '<button type="button" class="pending__get" id="pending-get">패치 내려받기</button>'
  } catch {
    box.hidden = true
  }
}

async function load() {
  const data = await api('/api/catalog')
  state.icons = data.icons
  state.categories = data.categories
  state.variants = data.variants || []
  renderPending()
  $('#count').textContent = `세트 ${data.icons.length}종 · 우리가 만든 것 ${data.icons.filter((i) => i.own).length}종`
  renderScope()
  // 카탈로그를 보는 중이면 건드리지 않는다 — 다시 그리면 쪽수와 자리가 날아간다
  if (state.scope === 'set') {
    renderChips()
    renderGrid()
  }
}

async function loadLibraryMeta() {
  try {
    state.lib.meta = await api('/api/library/meta')
  } catch {
    state.lib.meta = { available: false }
  }
}

document.addEventListener('click', async (e) => {
  const t = e.target

  const tab = t.closest('.tabs__btn')
  if (tab) return show(tab.dataset.view)

  const goto = t.closest('[data-goto]')
  if (goto) return show(goto.dataset.goto)

  const scopeBtn = t.closest('.scope__btn')
  if (scopeBtn) return setScope(scopeBtn.dataset.scope)

  const scopeGo = t.closest('[data-scope-go]')
  if (scopeGo) return setScope(scopeGo.dataset.scopeGo)

  if (t.closest('#more-btn')) return searchCatalog({ reset: false })

  const chip = t.closest('.chip')
  if (chip) {
    state.filter.category = chip.dataset.cat || null
    renderChips()
    renderGrid()
    return
  }

  const libCellEl = t.closest('.cell--lib')
  if (libCellEl) return openCatalogCell(libCellEl.dataset.m)

  const cell = t.closest('.cell')
  if (cell) return openSheet(cell.dataset.name)

  const pushBtn = t.closest('#pending-push')
  if (pushBtn) {
    const state = $('#pending-state')
    pushBtn.disabled = true
    pushBtn.textContent = '올리는 중…'
    try {
      const r = await api('/api/push', { method: 'POST', body: JSON.stringify({}) })
      if (state) state.textContent = ` 올렸습니다 — ${r.commit}`
      await renderPending()
    } catch (e) {
      pushBtn.disabled = false
      pushBtn.textContent = '저장소에 올리기'
      if (state) state.textContent = ` 올리지 못했습니다 — ${e.message}`
    }
    return
  }

  if (t.closest('#pending-get')) {
    const a = document.createElement('a')
    a.href = apiUrl('/api/pending.patch')
    a.download = 'pending.patch'
    document.body.appendChild(a)
    a.click()
    a.remove()
    return
  }

  const take = t.closest('.vgroup__take')
  if (take) return takeVariants(take.closest('.vgroup'))

  const makeV = t.closest('[data-make-variants]')
  if (makeV) return requestVariants(makeV.dataset.makeVariants)

  const evb = t.closest('[data-export-variant]')
  if (evb) {
    const id = evb.dataset.exportVariant
    if (state.exportVariants.has(id)) state.exportVariants.delete(id)
    else state.exportVariants.add(id)
    return renderTree()
  }

  const vbtn = t.closest('.vbtn')
  if (vbtn) {
    state.sheetVariant = vbtn.dataset.variant
    return renderSheet($('#sheet').dataset.name, state.sheetVariant)
  }

  if (t.closest('#sheet-copy')) {
    const code = $('#sheet-code')
    code.select()
    try {
      await navigator.clipboard.writeText(code.value)
      $('#sheet-hint').textContent = '복사했습니다. 코드에 붙여 넣으세요.'
    } catch {
      $('#sheet-hint').textContent = '복사하지 못했습니다 — 위 상자에서 직접 복사하세요.'
    }
    return
  }

  if (t.closest('#sheet-svg')) {
    const name = $('#sheet').dataset.name
    const v = $('#sheet').dataset.variant || 'regular'
    const svg = await loadSvg(name, v === 'regular' ? '' : v)
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = v === 'regular' ? `${name}.svg` : `${name}-${v}.svg`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(a.href)
    $('#sheet-hint').textContent = `${name}.svg 를 내려받았습니다.`
    return
  }

  if (t.closest('#sheet-copy-alt')) {
    const code = $('#sheet-alt')
    code.select()
    try {
      await navigator.clipboard.writeText(code.value)
      $('#sheet-hint').textContent = 'SVG 방식 코드를 복사했습니다.'
    } catch {
      $('#sheet-hint').textContent = '복사하지 못했습니다 — 위 상자에서 직접 복사하세요.'
    }
    return
  }

  if (t.closest('#ask-send')) return sendAsk()

  const pick = t.closest('.cand__pick')
  if (pick) return approve(pick.closest('.cand'))

  const discard = t.closest('.job__discard')
  if (discard) {
    await api('/api/discard', { method: 'POST', body: JSON.stringify({ requestId: discard.dataset.job }) })
    return refreshJobs()
  }

  if (t.closest('#pick-all')) {
    state.icons.forEach((i) => state.picked.add(i.name))
    return renderExport()
  }
  if (t.closest('#pick-none')) {
    state.picked.clear()
    return renderExport()
  }
  if (t.closest('#pick-own')) {
    state.picked.clear()
    state.icons.filter((i) => i.own).forEach((i) => state.picked.add(i.name))
    return renderExport()
  }
  if (t.closest('#do-export')) return doExport()
})

// 상세 시트 바깥을 누르면 닫는다. 초보자는 ✕를 찾기 전에 바깥을 먼저 누른다.
// <dialog>는 backdrop 클릭을 기본으로 잡아 주지 않으므로 좌표로 판정한다.
$('#sheet').addEventListener('click', (e) => {
  const sheet = $('#sheet')
  if (e.target !== sheet) return // 내용 위 클릭은 통과
  const r = sheet.getBoundingClientRect()
  const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom
  if (!inside) sheet.close()
})

document.addEventListener('change', (e) => {
  const pick = e.target.closest('[data-pick]')
  if (!pick) return
  if (pick.checked) state.picked.add(pick.dataset.pick)
  else state.picked.delete(pick.dataset.pick)
  renderTree()
})

let findTimer = null
$('#q').addEventListener('input', (e) => {
  state.filter.q = e.target.value
  if (state.scope === 'set') return renderSetGrid()
  // 카탈로그는 서버에 묻는다 — 키마다 묻지 않고 멈추면 묻는다
  clearTimeout(findTimer)
  findTimer = setTimeout(() => searchCatalog({ reset: true }), 160)
})

$('#ask-text').addEventListener('input', () => {
  clearTimeout(suggestTimer)
  suggestTimer = setTimeout(renderSuggest, 350)
})

$('#adopt-form').addEventListener('submit', submitAdopt)
// 이름을 고치기 시작하면 처음 이름에 붙었던 규칙 안내는 더 맞지 않는다
$('#adopt-name').addEventListener('input', () => { $('#adopt-rule').textContent = '' })

async function sendAsk() {
  const text = $('#ask-text').value.trim()
  const err = $('#ask-error')
  err.hidden = true
  if (text.length < 2) {
    err.textContent = '어떤 아이콘이 필요한지 적어 주세요.'
    err.hidden = false
    return
  }
  const btn = $('#ask-send')
  btn.disabled = true
  try {
    await api('/api/requests', { method: 'POST', body: JSON.stringify({ text, count: 4 }) })
    $('#ask-text').value = ''
    $('#ask-suggest').hidden = true
    startPolling()
  } catch (e) {
    err.textContent = e.message
    err.hidden = false
  } finally {
    btn.disabled = false
  }
}

/**
 * 요청문에서 찾을 말을 미리 뽑는다. 서버의 keywordsFromPrompt와 같은 규칙이다.
 *
 * 왜 화면에도 두나: 승인 직전에 눈으로 보고 고칠 수 있어야 한다. 서버만 뽑으면
 * 엉뚱한 말이 들어가도 아무도 모른 채 검색 사전에 남는다.
 */
const KW_NOISE = new Set([
  '아이콘', '만들어', '만들어줘', '그려', '그려줘', '해줘', '주세요', '필요',
  '느낌', '모양', '스타일', '심플하게', '간단하게', '느낌으로', '표현',
  'icon', 'make', 'create', 'please'
])

function guessKeywords(prompt, name) {
  const words = String(prompt || '')
    .split(/[\s,·./()[\]{}"'`~!@#$%^&*+=<>?|\\:;]+/)
    .map((w) => w.trim().replace(/(을|를|이|가|은|는|의|에|로|으로|와|과|도|만)$/, ''))
    .filter((w) => w.length >= 2 && w.length <= 12 && !KW_NOISE.has(w) && !/^\d+$/.test(w))

  const out = []
  for (const w of words) if (!out.includes(w)) out.push(w)
  for (const seg of String(name).split('-')) {
    if (seg.length >= 2 && !out.includes(seg)) out.push(seg)
  }
  return out.slice(0, 8)
}

/** 이 아이콘에 없는 표정을 만들어 달라고 큐에 넣는다. */
async function requestVariants(name) {
  const icon = state.icons.find((i) => i.name === name)
  if (!icon) return
  const have = new Set(icon.variants || [])
  const todo = state.variants.map((v) => v.id).filter((v) => !have.has(v))
  if (todo.length === 0) return

  const hint = $('#sheet-hint')
  if (hint) hint.textContent = '표정을 만들고 있습니다 — 만들기 탭에서 진행을 봅니다. 몇 분 걸립니다.'

  try {
    await api('/api/variants', { method: 'POST', body: JSON.stringify({ name, variants: todo }) })
    $('#sheet')?.close()
    show('make')
    await refreshJobs()
  } catch (e) {
    if (hint) hint.textContent = `표정을 만들지 못했습니다 — ${e.message}`
  }
}

/** 체크한 표정을 자산으로 들인다. */
async function takeVariants(group) {
  const name = group.dataset.name
  const btn = group.querySelector('.vgroup__take')
  const picks = [...group.querySelectorAll('.vres__on')]
    .filter((c) => c.checked)
    .map((c) => c.dataset.variant)

  if (picks.length === 0) {
    btn.textContent = '넣을 표정을 고르세요'
    setTimeout(() => { btn.textContent = '고른 표정 넣기' }, 2000)
    return
  }

  btn.disabled = true
  btn.textContent = '넣는 중…'
  try {
    const job = state.jobs?.find((j) => j.id === group.dataset.job)
    const rows = job?.result?.results || []
    await api('/api/variants/adopt', {
      method: 'POST',
      body: JSON.stringify({
        name,
        requestId: group.dataset.job,
        picks: picks.map((v) => ({ variant: v, svg: rows.find((r) => r.variant === v)?.svg }))
      })
    })
    // 캐시를 비우지 않으면 새 표정이 옛 그림으로 보인다
    for (const v of picks) state.svgCache.delete(`${v}/${name}`)
    await load()
    await refreshJobs()
    show('find')
  } catch (e) {
    btn.disabled = false
    btn.textContent = `넣지 못했습니다 — ${e.message}`
  }
}

async function approve(card) {
  const jobId = card.dataset.job
  const idx = Number(card.dataset.idx)
  const nameInput = card.querySelector('.cand__name')
  const name = (nameInput?.value || '').trim()
  if (!name) {
    nameInput?.focus()
    const err = $('#ask-error')
    err.textContent = '이름을 먼저 정해 주세요. 영문 소문자와 붙임표만 씁니다 (예: e-ticket).'
    err.hidden = false
    return
  }

  const { requests } = await api('/api/requests')
  const job = requests.find((r) => r.id === jobId)
  const cand = job?.result?.candidates?.find((c) => c.index === idx)
  if (!cand) return

  try {
    await api('/api/approve', {
      method: 'POST',
      body: JSON.stringify({
        name,
        svg: cand.svg,
        category: 'custom',
        requestId: jobId,
        prompt: job.text,
        model: 'claude',
        keywords: (card.querySelector('.cand__keywords')?.value || '')
          .split(',')
          .map((k) => k.trim())
          .filter(Boolean)
      })
    })
    state.svgCache.delete(name)
    await load()
    await refreshJobs()
    show('find')
    $('#q').value = name
    state.filter.q = name
    setScope('set')
  } catch (e) {
    const err = $('#ask-error')
    err.textContent = e.message
    err.hidden = false
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

loadLibraryMeta().then(load).catch((e) => {
  document.querySelector('#main').innerHTML =
    `<p class="empty">아이콘 목록을 불러오지 못했습니다 — ${esc(e.message)}</p>`
})
