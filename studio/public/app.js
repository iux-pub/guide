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
  // 만들기에 붙일 참조. 회사 심볼처럼 정해진 모양은 이게 없으면 지어낸 것이 나온다.
  // SVG는 코드로, 그림(PNG·JPG)은 data URL로 담는다.
  reference: null,
  referenceImage: null,
  variants: [],
  sheetVariant: 'regular'
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

function renderChips() {
  const chips = [
    { id: null, label: `전체 ${state.icons.length}` },
    { id: '__own', label: `우리가 만든 것 ${state.icons.filter((i) => i.own).length}` },
    ...state.categories.map((c) => ({
      id: c.id,
      label: `${c.label} ${state.icons.filter((i) => i.category === c.id).length}`
    }))
  ]
  $('#chips').innerHTML = chips
    .map((c) => `<button class="chip${state.filter.category === c.id ? ' chip--on' : ''}" data-cat="${c.id ?? ''}">${esc(c.label)}</button>`)
    .join('')
}

function filtered() {
  const q = state.filter.q.trim().toLowerCase()
  const cat = state.filter.category
  return state.icons.filter((i) => {
    if (cat === '__own' && !i.own) return false
    if (cat && cat !== '__own' && i.category !== cat) return false
    if (!q) return true
    return i.name.includes(q) || (i.categoryLabel || '').includes(q)
  })
}

async function renderGrid() {
  const rows = filtered()
  const grid = $('#grid')
  $('#find-empty').hidden = rows.length > 0

  grid.innerHTML = rows
    .map((i) => `<button class="cell${i.own ? ' cell--own' : ''}" data-name="${esc(i.name)}">
      <span class="cell__svg" data-svg="${esc(i.name)}"></span>
      <span class="cell__name">${esc(i.name)}</span>
    </button>`)
    .join('')

  // SVG는 따로 채운다 — 한 번에 72개를 fetch해도 캐시가 받아 준다
  for (const holder of grid.querySelectorAll('[data-svg]')) {
    loadSvg(holder.dataset.svg).then((svg) => { holder.innerHTML = svg })
  }
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
  $('#sheet-variants').innerHTML =
    avail.length > 1
      ? avail
          .map((v) => `<button type="button" class="vbtn${v === variant ? ' vbtn--on' : ''}" data-variant="${v}">${VARIANT_LABEL[v] || v}</button>`)
          .join('')
      : ''

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

// ── 만들기 ────────────────────────────────────────────

function statusLine(job) {
  if (job.status === 'waiting') {
    return `<p class="status status--waiting"><span class="status__dot"></span>차례를 기다리는 중입니다. 창을 닫아도 됩니다.</p>`
  }
  if (job.status === 'working') {
    return `<p class="status status--working"><span class="status__dot"></span>그리는 중입니다 — 보통 1~2분 걸립니다. 창을 닫아도 됩니다.</p>`
  }
  if (job.status === 'failed') {
    const why = (job.result?.failures || []).join(' / ') || '알 수 없는 이유'
    return `<p class="status status--failed"><span class="status__dot"></span>만들지 못했습니다 — ${esc(why)}</p>`
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
      return `<article class="job">
        <div class="job__head">
          <p class="job__text">${esc(job.text)}</p>
          <span class="job__time">${when}
            <button class="linkbtn job__discard" data-job="${esc(job.id)}">버리기</button>
          </span>
        </div>
        ${statusLine(job)}
        ${cands.length > 0 ? `<div class="cands">${cands.map((c) => candCard(job, c)).join('')}</div>` : ''}
      </article>`
    })
    .join('')
}

async function refreshJobs() {
  try {
    const { requests } = await api('/api/requests')
    renderJobs(requests)
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

function renderTree() {
  const n = state.picked.size
  $('#pick-n').textContent = `${n}개`
  $('#do-export').disabled = n === 0
  $('#tree').textContent =
    `assets/icons/\n` +
    `├─ sprite.svg          ${n}개\n` +
    `├─ icons.css           폰트 여벌\n` +
    `├─ svg/                낱개 ${n}개\n` +
    `├─ LICENSE-NOTICE.txt  재배포 조건\n` +
    `└─ README.txt          쓰는 법`
}

/**
 * 묶음 내려받기.
 *
 * 서버가 파일 목록을 만들어 주고 브라우저는 저장만 한다. 예전에는 브라우저에서
 * 스프라이트만 조립했는데, 그러면 CSS·낱개·라이선스 고지가 빠져 프로젝트에
 * 넣어도 반쪽이었다.
 *
 * zip 라이브러리를 쓰지 않는다 — 사내 도구에 의존성을 늘리지 않으려고
 * 파일을 하나씩 저장한다. 브라우저가 「여러 파일 다운로드」를 물어보면 허용한다.
 */
async function doExport() {
  const btn = $('#do-export')
  const note = $('#export-status')
  btn.disabled = true
  note.textContent = '묶음을 만드는 중입니다…'

  try {
    const { files, count, missing } = await api('/api/bundle', {
      method: 'POST',
      body: JSON.stringify({ names: [...state.picked] })
    })

    const entries = Object.entries(files)
    for (const [name, content] of entries) {
      const blob = new Blob([content], { type: name.endsWith('.svg') ? 'image/svg+xml' : 'text/plain' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      // 폴더 구조를 파일명에 담는다 — 브라우저가 경로를 만들어 주지 않는다
      a.download = name.replace(/\//g, '_')
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(a.href)
      await new Promise((r) => setTimeout(r, 120)) // 연속 저장을 브라우저가 막지 않게
    }

    note.textContent = `${count}종 · 파일 ${entries.length}개를 내려받았습니다.` +
      (missing ? ` (${missing}개는 파일이 없어 빠졌습니다)` : '') +
      ' svg_로 시작하는 파일은 svg/ 폴더에 넣으세요.'
  } catch (e) {
    note.textContent = `내려받지 못했습니다 — ${e.message}`
  } finally {
    btn.disabled = state.picked.size === 0
  }
}

// ── 시작 ──────────────────────────────────────────────

async function load() {
  const data = await api('/api/catalog')
  state.icons = data.icons
  state.categories = data.categories
  state.variants = data.variants || []
  $('#count').textContent = `${data.icons.length}종 · 우리가 만든 것 ${data.icons.filter((i) => i.own).length}종`
  renderChips()
  renderGrid()
}

document.addEventListener('click', async (e) => {
  const t = e.target

  const tab = t.closest('.tabs__btn')
  if (tab) return show(tab.dataset.view)

  const goto = t.closest('[data-goto]')
  if (goto) return show(goto.dataset.goto)

  const chip = t.closest('.chip')
  if (chip) {
    state.filter.category = chip.dataset.cat || null
    renderChips()
    renderGrid()
    return
  }

  const cell = t.closest('.cell')
  if (cell) return openSheet(cell.dataset.name)

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

  if (t.closest('#ask-refclear')) {
    $('#ask-refcode').value = ''
    $('#ask-file').value = ''
    setReference(null)
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

// 참조 SVG — 파일에서 읽는다
document.addEventListener('change', async (e) => {
  const file = e.target.closest('#ask-file')?.files?.[0]
  if (!file) return

  const isSvg = /\.svg$/i.test(file.name) || file.type.includes('svg')

  if (isSvg) {
    if (file.size > 200_000) return refError('SVG가 너무 큽니다 (200KB 이하)')
    const text = await file.text()
    if (!/<svg[\s\S]*<\/svg>/i.test(text)) return refError('SVG 파일이 아닙니다')
    state.reference = text
    state.referenceImage = null
    $('#ask-refcode').value = ''
    setReference(text, file.name)
    return
  }

  // 그림 파일 — data URL로 담아 보내면 서버가 디스크에 풀고 모델이 열어 본다
  if (!/^image\/(png|jpeg|webp)$/.test(file.type)) {
    return refError('SVG·PNG·JPG·WebP만 됩니다')
  }
  if (file.size > 4_000_000) return refError('그림이 너무 큽니다 (4MB 이하)')

  const dataUrl = await new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result)
    r.onerror = () => reject(new Error('파일을 읽지 못했습니다'))
    r.readAsDataURL(file)
  }).catch(() => null)

  if (!dataUrl) return refError('파일을 읽지 못했습니다')

  state.referenceImage = dataUrl
  state.reference = null
  $('#ask-refcode').value = ''
  setReference(dataUrl, file.name, 'image')
})

// 참조 SVG — 코드로 직접 붙여넣기
$('#ask-refcode').addEventListener('input', (e) => {
  const v = e.target.value.trim()
  if (!v) return setReference(null)
  if (!/<svg[\s\S]*<\/svg>/i.test(v)) {
    $('#ask-refstate').textContent = '아직 SVG가 아닙니다'
    $('#ask-refpreview').hidden = true
    return
  }
  state.reference = v
  state.referenceImage = null
  setReference(v, '붙여 넣은 코드')
})

document.addEventListener('change', (e) => {
  const pick = e.target.closest('[data-pick]')
  if (!pick) return
  if (pick.checked) state.picked.add(pick.dataset.pick)
  else state.picked.delete(pick.dataset.pick)
  renderTree()
})

$('#q').addEventListener('input', (e) => {
  state.filter.q = e.target.value
  renderGrid()
})

/** 참조를 화면에 반영한다. 미리보기로 「제대로 들어갔나」를 눈으로 확인시킨다. */
function setReference(content, label, kind = 'svg') {
  const preview = $('#ask-refpreview')
  const stateEl = $('#ask-refstate')   // 전역 state와 이름이 겹치지 않게 한다
  const clear = $('#ask-refclear')

  if (!content) {
    state.reference = null
    state.referenceImage = null
    preview.hidden = true
    preview.innerHTML = ''
    stateEl.textContent = ''
    clear.hidden = true
    return
  }

  const sizes = [48, 24, 16]
  preview.innerHTML =
    kind === 'image'
      ? sizes.map((px) => `<img src="${content}" width="${px}" height="${px}" alt="참조 그림 ${px}픽셀 미리보기">`).join('')
      : sizes
          .map((px) => content.replace(/<svg([^>]*)>/i, (m, attrs) => {
            const cleaned = attrs.replace(/\s(width|height)="[^"]*"/gi, '')
            return `<svg${cleaned} width="${px}" height="${px}">`
          }))
          .join('')

  preview.hidden = false
  stateEl.textContent = label || '참조 붙음'
  clear.hidden = false
}

function refError(msg) {
  const err = $('#ask-error')
  err.textContent = msg
  err.hidden = false
}

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
    const reference = state.reference || $('#ask-refcode').value.trim() || null
    const referenceImage = state.referenceImage || null
    await api('/api/requests', {
      method: 'POST',
      body: JSON.stringify({
        text,
        count: 4,
        ...(reference ? { reference } : {}),
        ...(referenceImage ? { referenceImage } : {})
      })
    })
    $('#ask-text').value = ''
    $('#ask-refcode').value = ''
    setReference(null)
    startPolling()
  } catch (e) {
    err.textContent = e.message
    err.hidden = false
  } finally {
    btn.disabled = false
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
        model: 'claude'
      })
    })
    state.svgCache.delete(name)
    await load()
    await refreshJobs()
    show('find')
    $('#q').value = name
    state.filter.q = name
    state.filter.category = null
    renderChips()
    renderGrid()
  } catch (e) {
    const err = $('#ask-error')
    err.textContent = e.message
    err.hidden = false
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

load().catch((e) => {
  document.querySelector('#main').innerHTML =
    `<p class="empty">아이콘 목록을 불러오지 못했습니다 — ${esc(e.message)}</p>`
})
