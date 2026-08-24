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
    // 이름은 영어인데 쓰는 사람은 한국어로 생각한다 — 검색어 사전이 그 다리다
    return (
      i.name.includes(q) ||
      (i.categoryLabel || '').includes(q) ||
      (i.keywords || []).some((k) => k.includes(q))
    )
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

// ── 만들기 ────────────────────────────────────────────

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
    // 실측 5~7분이다. 「1~2분」이라고 적어 두면 3분째부터 고장으로 읽힌다.
    const t = elapsed(job.result?.startedAt)
    const kind = job.kind === 'variants' ? '표정을 만드는' : '그리는'
    return `<p class="status status--working"><span class="status__dot"></span>${kind} 중입니다${t ? ` — ${t}` : ''}. 좌표를 하나씩 놓는 일이라 <b>5~10분</b> 걸립니다. 창을 닫아도 됩니다.</p>`
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
      ' 풀어서 assets/icons/ 에 그대로 넣으세요.'
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
