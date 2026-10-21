// 시각 서명 규칙 — R-01(색 확장)·R-34(장식 효과)·R-36(이모지)·R-37(Tailwind 기본 스케일)
// 안티슬롭 명세의 통과·실패 표본과 검증자가 더한 경계 사례를 그대로 단언한다.

const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { spawnSync } = require('node:child_process')
const { test } = require('node:test')
const assert = require('node:assert/strict')

const ROOT = path.resolve(__dirname, '..', '..')
const v = require('../lib/visual-signature')

const restrained = { grade: 'restrained' }
const expressive = { grade: 'expressive' }
const rules = findings => findings.map(f => `${f.rule}:${f.severity}`)
const has = (findings, rule, severity = 'error') => findings.some(f => f.rule === rule && f.severity === severity)
const none = (findings, rule) => !findings.some(f => !rule || f.rule === rule)

// ─── R-01 색 ───────────────────────────────────────────

test('R-01: 선언 값 어디에 있든 raw 색을 잡는다', () => {
  assert.ok(has(v.scanCss('.card { border: 1px solid #ddd; }', restrained), 'R-01'))
  assert.ok(has(v.scanCss('.card { box-shadow: 0 20px 50px rgba(124, 58, 237, .5); }', restrained), 'R-01'))
  assert.ok(has(v.scanCss('.btn:focus-visible { outline: 2px solid white; }', restrained), 'R-01'))
  assert.ok(has(v.scanCss('.x { color: var(--color-primary, #7c3aed); }', restrained), 'R-01')) // 폴백
})

test('R-01: Tailwind 임의값·팔레트·흑백 유틸, style 속성(커스텀 속성 동반)을 잡는다', () => {
  assert.ok(has(v.scanHtml('<section class="section bg-[#f5f2ee]">x</section>', restrained), 'R-01'))
  assert.ok(has(v.scanHtml('<p class="text-white">x</p>', restrained), 'R-01'))
  assert.ok(has(v.scanHtml('<p class="bg-gray-50">x</p>', restrained), 'R-01'))
  assert.ok(has(v.scanHtml('<p class="hover:bg-[white] text-[gray]">x</p>', restrained), 'R-01'))
  assert.ok(has(v.scanHtml('<p class="bg-[rgb(1,2,3)]">x</p>', restrained), 'R-01'))
  assert.ok(has(v.scanHtml('<div style="--x:1; background:#7c3aed"></div>', restrained), 'R-01'))
  assert.ok(has(v.scanHtml('<div style="--accent:#7c3aed"></div>', restrained), 'R-01'))
})

test('R-01: 토큰·KRDS 검정 알파 그림자·토큰 color-mix·문자열 속 #은 통과한다', () => {
  assert.ok(none(v.scanCss('.hero { background-color: var(--color-bg); border: 1px solid var(--color-border-light); }', restrained)))
  assert.ok(none(v.scanHtml('<a class="btn btn--primary bg-[var(--color-primary)] text-[var(--color-text-inverse)]" href="/apply">신청하기</a>', restrained)))
  assert.ok(none(v.scanHtml('<div class="progress" style="--progress: 40%"></div>', restrained)))
  assert.ok(none(v.scanCss('.card:hover { @apply shadow-[0_0_0.2rem_0_#00000014,_0_0.8rem_1.6rem_0_#0000001f]; }', restrained)))
  assert.ok(none(v.scanCss('.card { box-shadow: 0 0 0.2rem 0 #00000014; }', restrained)))
  assert.ok(none(v.scanHtml('<p class="bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]">x</p>', restrained)))
  assert.ok(none(v.scanCss('.a::before { content: "#add"; }', restrained)))
  assert.ok(none(v.scanCss('.x { background: url("data:image/svg+xml;utf8,<svg%20stroke=\'%23256EF4\'/>") no-repeat; }', restrained)))
})

test('R-01: KRDS 알파 그림자에 다른 색이 섞이면 잡는다', () => {
  assert.ok(has(v.scanCss('.card { box-shadow: 0 0 0.2rem 0 #00000014, 0 0 1rem #ff0000; }', restrained), 'R-01'))
})

// ─── R-34 장식 효과 ─────────────────────────────────────

test('R-34: 장식 그라데이션은 restrained에서 error, expressive에서 warn', () => {
  const css = '.cta { background: linear-gradient(90deg, var(--color-primary-50), var(--color-secondary-60)); }'
  assert.ok(has(v.scanCss(css, restrained), 'R-34', 'error'))
  assert.ok(has(v.scanCss(css, expressive), 'R-34', 'warn'))
  assert.ok(!has(v.scanCss(css, expressive), 'R-34', 'error'))
})

test('R-34: 보라 계열(AP-3)은 등급과 상관없이 error — 토큰 이름·hex·팔레트', () => {
  assert.ok(has(v.scanCss('.x { background: linear-gradient(#667eea, #764ba2); }', expressive), 'R-34', 'error'))
  assert.ok(has(v.scanHtml('<h1 class="bg-linear-to-r from-violet-600 to-blue-600">x</h1>', expressive), 'R-34', 'error'))
  const tokenColors = v.buildTokenColorMap(':root { --color-brand-a: #7c3aed; --color-cta: var(--color-brand-a); }')
  assert.ok(has(v.scanCss('.x { background: linear-gradient(var(--color-cta), var(--color-bg)); }', { grade: 'expressive', tokenColors }), 'R-34', 'error'))
})

test('R-34: 거의 무채색(zinc)은 보라로 오판하지 않고 warn이다', () => {
  const f = v.scanCss('.x { background: linear-gradient(90deg, var(--color-gray-30), var(--color-gray-10)); }', restrained)
  assert.deepEqual(rules(f.filter(x => x.rule === 'R-34')), ['R-34:warn'])
})

test('R-34: 스크림·가로 스크롤 힌트·mask 페이드는 통과한다', () => {
  assert.ok(none(v.scanCss('.hero-bleed__media::after { background: linear-gradient(to bottom, transparent, var(--color-alpha-black-50)); }', restrained), 'R-34'))
  assert.ok(none(v.scanCss('.x::after { background: linear-gradient(to left, var(--color-bg), transparent); }', restrained), 'R-34'))
  assert.ok(none(v.scanCss('.x { mask-image: linear-gradient(black 70%, transparent); }', restrained), 'R-34'))
})

test('R-34: radial 단색 블롭은 스크림이 아니다', () => {
  assert.ok(has(v.scanCss('.x { background: radial-gradient(circle, var(--color-primary-20), transparent 70%); }', restrained), 'R-34'))
})

test('R-34: 글래스·그라데이션 글자·큰 블러·컬러 글로우', () => {
  assert.ok(has(v.scanHtml('<article class="card backdrop-blur-xl">x</article>', restrained), 'R-34'))
  assert.ok(has(v.scanCss('.x { backdrop-filter: blur(8px); }', restrained), 'R-34'))
  assert.ok(has(v.scanHtml('<h1 class="bg-clip-text text-transparent">x</h1>', expressive), 'R-34'))
  assert.ok(has(v.scanHtml('<div class="blur-sm">x</div>', restrained), 'R-34'))
  assert.ok(has(v.scanCss('.x { filter: blur(0.4rem); }', restrained), 'R-34'))
  assert.ok(has(v.scanCss('.card:hover { box-shadow: 0 0 4rem var(--color-primary-40); }', expressive), 'R-34'))
  assert.ok(has(v.scanCss('.x { filter: drop-shadow(0 0 1rem var(--color-primary)); }', restrained), 'R-34'))
  assert.ok(has(v.scanCss('.x { --glow: 0 0 4rem var(--color-primary-40); }', restrained), 'R-34'))
  assert.ok(has(v.scanHtml('<div class="shadow-primary/50">x</div>', restrained), 'R-34'))
})

test('R-34: 포커스 링·KRDS 그림자·skip-to-content·to-top은 통과한다', () => {
  assert.ok(none(v.scanHtml('<button class="btn btn--primary focus-visible:shadow-[0_0_0_0.4rem_var(--color-border-primary)]" type="submit">신청하기</button>', restrained)))
  assert.ok(none(v.scanCss('.card:hover { box-shadow: 0 0 0.2rem 0 var(--color-alpha-black-50), 0 0.8rem 1.6rem 0 #0000001f; }', restrained), 'R-34'))
  assert.ok(none(v.scanHtml('<a class="skip-to-content" href="#main">본문 바로가기</a><button class="to-top" type="button">맨 위로</button>', restrained)))
  assert.ok(none(v.scanHtml('<div class="blur-none backdrop-blur-none">x</div>', restrained), 'R-34'))
})

// ─── R-37 Tailwind 기본 스케일 ───────────────────────────

test('R-37: 기본 글자·숫자 행간·간격·컨테이너 스케일은 error', () => {
  for (const cls of ['text-base', 'text-3xl', 'text-sm/6', 'leading-6', 'p-4', 'min-h-12', 'gap-2', 'mt-10', 'max-w-md', 'w-md', 'max-w-96', 'scroll-mt-20', 'p-0.75', 'md:!p-4', '[&>li]:mt-2', '-mt-4']) {
    assert.ok(has(v.scanHtml(`<p class="${cls}">x</p>`, restrained), 'R-37'), cls)
  }
  assert.ok(has(v.scanCss('.page-title { @apply text-3xl font-bold; }', restrained), 'R-37'))
})

test('R-37: rem 임의값·0·px·분수·이름 행간·max-w-prose는 통과한다', () => {
  const html = '<p class="text-[1.7rem] leading-[1.7] leading-relaxed w-full h-auto inset-0 p-0 mx-auto w-1/2 -translate-x-1/2 h-px max-w-prose col-start-2 z-10">x</p>'
  assert.ok(none(v.scanHtml(html, restrained), 'R-37'))
  assert.ok(none(v.scanCss('.btn { @apply min-h-[4.8rem] gap-[0.4rem] px-[1.6rem]; }', restrained), 'R-37'))
})

test('R-37: 메시지에 환산값과 rem 대안을 준다', () => {
  const [f] = v.scanHtml('<p class="gap-3">x</p>', restrained)
  assert.match(f.message, /7\.5px/)
  assert.match(f.message, /gap-\[1\.2rem\]/)
})

// ─── R-36 이모지 ────────────────────────────────────────

test('R-36: 제목·목록·배지·CSS content의 이모지는 error', () => {
  assert.ok(has(v.scanHtml('<h3 class="feature__title">🚀 빠른 처리</h3>', restrained), 'R-36'))
  assert.ok(has(v.scanHtml('<ul><li>✅ 24시간 민원 접수</li></ul>', restrained), 'R-36'))
  assert.ok(has(v.scanHtml('<span class="badge">✨ NEW</span>', restrained), 'R-36'))
  assert.ok(has(v.scanCss('.notice__link::before { content: "👉"; }', restrained), 'R-36'))
  assert.ok(has(v.scanCss('.notice__link::before { content: "\\1F449"; }', restrained), 'R-36'))
  assert.ok(has(v.scanHtml('<div class="hero__mark">🚀</div>', restrained), 'R-36')) // 이모지만
  assert.ok(has(v.scanHtml('<p>&#x1F680;</p>', restrained), 'R-36')) // 엔티티
  assert.ok(has(v.scanHtml('<ul><li>1️⃣ 신청</li></ul>', restrained), 'R-36')) // 키캡
})

test('R-36: 국기·ZWJ 이모지는 한 건으로 센다', () => {
  const f = v.scanHtml('<a href="/en">🇺🇸 English</a>', restrained).filter(x => x.rule === 'R-36')
  assert.equal(f.length, 1)
  assert.deepEqual(v.emojisIn('👨‍👩‍👧 🇰🇷'), ['👨‍👩‍👧', '🇰🇷'])
})

test('R-36: 본문 이모지·alt는 warn, 텍스트 기호·code 안은 통과', () => {
  assert.deepEqual(rules(v.scanHtml('<p>오늘은 맑음 ☀️ 입니다</p>', restrained)), ['R-36:warn'])
  assert.deepEqual(rules(v.scanHtml('<img src="a.png" alt="🎉 개관 축하">', restrained)), ['R-36:warn'])
  assert.ok(none(v.scanHtml('<small class="site-footer__copy">© 2026 기관명</small><p>※ 신청 기간을 확인하십시오.</p><a href="tel:0212345678">☎ 02-1234-5678</a>', restrained)))
  assert.ok(none(v.scanCss('.table th[aria-sort="ascending"]::after { content: "▲"; } .y { @apply [content:"_▲"]; }', restrained)))
  assert.ok(none(v.scanHtml('<pre><code>&lt;h3&gt;🚀&lt;/h3&gt;</code></pre><!-- ✅ 주석 -->', restrained)))
})

test('R-36: 링크·버튼 끝 화살표 글자는 warn', () => {
  assert.deepEqual(rules(v.scanHtml('<a href="/notice">공지 더보기 →</a>', restrained)), ['R-36:warn'])
})

test('R-36: 마크다운 본문 — 제목·목록·링크는 error, 문장은 warn, 인라인 코드는 통과', () => {
  const f = v.scanMarkdown('## 🚀 시작\n\n- ✅ 항목\n\n[🔗 바로가기](/a)\n\n보통 문장 ✨\n\n`🚀` 표기\n', restrained)
  assert.deepEqual(rules(f), ['R-36:error', 'R-36:error', 'R-36:error', 'R-36:warn'])
})

test('마크다운: 금지 예시 펜스(첫 줄 주석에 금지·❌·bad)는 검사하지 않는다', () => {
  const md = '```css\n/* 잘못된 예 (하드코딩 금지) */\n.x { color: #222; }\n```\n\n```css\n.y { color: #333; }\n```\n'
  const f = v.scanMarkdown(md, restrained)
  assert.equal(f.length, 1)
  assert.equal(f[0].line, 7)
})

// ─── 적대 리뷰에서 확정된 사례 ──────────────────────────

test('리뷰: % 가 든 클래스도 검사한다(color-mix 인자·그라데이션 정지점)', () => {
  assert.ok(has(v.scanHtml('<p class="bg-[color-mix(in_srgb,#7c3aed_10%,transparent)]">x</p>', restrained), 'R-01'))
  const f = v.scanHtml('<p class="bg-[linear-gradient(135deg,#667eea_0%,#764ba2_100%)]">x</p>', expressive)
  assert.ok(has(f, 'R-01') && has(f, 'R-34', 'error'))
  assert.ok(has(v.scanHtml('<p class="bg-[hsl(270,50%,50%)]">x</p>', restrained), 'R-01'))
})

test('리뷰: 임의값 그라데이션(bg-[…]·bg-linear-[정지점]·@apply)을 판정한다', () => {
  assert.ok(has(v.scanHtml('<p class="bg-[linear-gradient(to_right,var(--color-primary),var(--color-secondary))]">x</p>', restrained), 'R-34'))
  assert.ok(has(v.scanHtml('<p class="bg-[image:radial-gradient(var(--color-primary),transparent)]">x</p>', restrained), 'R-34'))
  assert.ok(has(v.scanCss('.x { @apply bg-[linear-gradient(to_right,var(--color-primary),var(--color-secondary))]; }', restrained), 'R-34'))
  assert.ok(has(v.scanHtml('<p class="bg-linear-[to_right,var(--color-primary),var(--color-secondary)]">x</p>', restrained), 'R-34'))
  assert.ok(has(v.scanHtml('<p class="bg-radial-[at_25%_25%] from-primary to-transparent">x</p>', restrained), 'R-34'))
})

test('리뷰: from-(--x)·투명도 수식어 정지점, bg-[#hex]/50', () => {
  assert.ok(has(v.scanHtml('<p class="bg-linear-to-r from-(--color-primary) to-(--color-secondary)">x</p>', restrained), 'R-34'))
  const f = v.scanHtml('<p class="bg-linear-to-r from-[#667eea]/80 to-[#764ba2]/80">x</p>', expressive)
  assert.ok(has(f, 'R-01') && has(f, 'R-34', 'error'))
  assert.ok(has(v.scanHtml('<p class="bg-[#fff]/50 ring-[#7c3aed]/50">x</p>', restrained), 'R-01'))
  assert.ok(has(v.scanCss('.x { @apply bg-[#ffffff]/90; }', restrained), 'R-01'))
})

test('리뷰: 색 이름 있는 토큰(text-primary 등)은 무채색이 아니다 — 장식 그라데이션 error', () => {
  const css = '.x { background: linear-gradient(90deg, var(--color-text-primary), var(--color-border-primary)); }'
  assert.ok(has(v.scanCss(css, restrained), 'R-34', 'error'))
})

test('리뷰: 한 색 이어 칠하기·여러 단계 검정 알파 스크림은 통과', () => {
  assert.ok(none(v.scanCss('.u { background: linear-gradient(var(--color-primary), var(--color-primary)) no-repeat 0 100% / 0 2px; }', restrained), 'R-34'))
  assert.ok(none(v.scanCss('.s { background: linear-gradient(transparent, var(--color-alpha-black-50), var(--color-alpha-black-75)); }', restrained), 'R-34'))
})

test('리뷰: text-shadow 색 유틸·shadow-[color:…]는 R-34, 이름 아닌 커스텀 속성은 그림자로 오판하지 않는다', () => {
  assert.ok(has(v.scanHtml('<h1 class="text-shadow-lg text-shadow-primary">x</h1>', restrained), 'R-34'))
  assert.ok(has(v.scanHtml('<div class="shadow-lg shadow-[color:var(--color-primary)]">x</div>', restrained), 'R-34'))
  assert.ok(none(v.scanCss('.x { --offset: 0 0 4rem var(--gap); }', restrained), 'R-34'))
})

test('리뷰: docs.css 면제는 @apply 효과에도 적용된다', () => {
  assert.ok(none(v.scanCss('.dot { @apply backdrop-blur-sm; }', { ...restrained, exemptEffects: true }), 'R-34'))
})

test('리뷰: content-[…] 이모지·text-[크기]/N 행간·leading-tight', () => {
  assert.ok(has(v.scanCss(".x::before { @apply content-['🚀']; }", restrained), 'R-36'))
  assert.ok(has(v.scanHtml('<p class="text-[1.7rem]/6">x</p>', restrained), 'R-37'))
  assert.ok(has(v.scanHtml('<h2 class="leading-tight">x</h2>', restrained), 'R-24', 'warn'))
  assert.ok(none(v.scanHtml('<p class="text-[1.7rem]/[1.6]">x</p>', restrained), 'R-37'))
})

test('리뷰: 주석 속 클래스는 보지 않고, 범위 밖 숫자 엔티티로 멈추지 않는다', () => {
  assert.ok(none(v.scanHtml('<!-- <div class="bg-gray-50 p-4">예전 표시</div> -->', restrained)))
  assert.doesNotThrow(() => v.scanHtml('<p>&#x110000; &#99999999;</p>', restrained))
  assert.doesNotThrow(() => v.scanCss('.x::before { content: "\\110000"; }', restrained))
})

test('리뷰: 반례 표시는 주석 바로 뒤에 와야 한다 — ::before·금지어 같은 일반 단어는 아니다', () => {
  assert.equal(v.isCounterFenceStart('/* ::before로 화살표를 그린다 */'), false)
  assert.equal(v.isCounterFenceStart('<!-- 스크롤 금지 영역 -->'), false)
  assert.equal(v.isCounterFenceStart('/* 잘못된 예 (하드코딩 금지) */'), true)
  assert.equal(v.isCounterFenceStart("// DON'T: 하드코딩"), true)
  assert.equal(v.isCounterFenceStart('<!-- ❌ 금지 -->'), true)
  assert.equal(v.isCounterFenceStart('<!-- Before -- AI 슬롭 -->'), true)
})

test('리뷰: 마크다운 이미지 alt는 warn, 여러 줄 HTML 블록은 요소 단위로 본다', () => {
  assert.deepEqual(rules(v.scanMarkdown('![🎉 개관](a.png)\n', restrained)), ['R-36:warn'])
  const f = v.scanMarkdown('<ul>\n  <li>✅ 접수</li>\n</ul>\n', restrained)
  assert.deepEqual(rules(f), ['R-36:error'])
  assert.equal(f[0].line, 2)
})

test('리뷰: 엔티티로 쓴 꼬리 화살표도 warn, 페이지네이션 ‹ ›는 통과', () => {
  assert.deepEqual(rules(v.scanHtml('<a href="/n">더보기 &rarr;</a>', restrained)), ['R-36:warn'])
  assert.ok(none(v.scanHtml('<button type="button" class="pagination__nav" aria-label="다음 페이지">›</button>', restrained)))
})

test('리뷰: 큰 페이지도 빠르게 본다(줄 번호 색인)', () => {
  const html = '<section class="section">' + '<p class="text-[1.7rem]">본문 문장입니다</p>\n'.repeat(12000) + '</section>'
  const t0 = Date.now()
  v.scanHtml(html, restrained)
  assert.ok(Date.now() - t0 < 3000, `${Date.now() - t0}ms`)
})

// ─── 검사기 통합 ────────────────────────────────────────

test('class 속성 밖(classList.add)의 팔레트·기본 글자 크기도 잡는다', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'iux-visual-js-'))
  const p = path.join(dir, 'c.html')
  fs.writeFileSync(p, "<script>el.classList.add('bg-gray-50', 'text-sm')</script>\n")
  const result = spawnSync(process.execPath, [path.join(ROOT, 'scripts', 'check-violations.js'), p], { cwd: ROOT, encoding: 'utf8' })
  assert.match(result.stderr, /\[R-01\][^\n]*bg-gray-50/)
  assert.match(result.stderr, /\[R-37\][^\n]*text-sm/)
})

const CHECK = path.join(ROOT, 'scripts', 'check-violations.js')

function runOn(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'iux-visual-'))
  const paths = Object.entries(files).map(([name, body]) => {
    const p = path.join(dir, name)
    fs.writeFileSync(p, body)
    return p
  })
  return spawnSync(process.execPath, [CHECK, ...paths], { cwd: ROOT, encoding: 'utf8' })
}

test('check-violations가 CSS·HTML 파일에 네 규칙을 적용한다', () => {
  const result = runOn({
    'a.css': '.x {\n  @apply p-4 backdrop-blur-sm;\n  border: 1px solid #ddd;\n}\n.y::before { content: "🚀"; }\n',
    'b.html': '<div class="text-white"><h2>🚀 빠른 처리</h2></div>\n'
  })
  assert.equal(result.status, 2, result.stdout + result.stderr)
  for (const rule of ['R-01', 'R-34', 'R-36', 'R-37']) assert.match(result.stderr, new RegExp(`\\[${rule}\\]`), rule)
})

test('저장소의 스타일·스니펫·플레이그라운드는 네 규칙 오류가 없다', () => {
  const result = spawnSync(process.execPath, [CHECK], { cwd: ROOT, encoding: 'utf8' })
  const errors = (result.stderr.match(/\[ERROR\][^\n]*\n\s*\[R-(01|34|36|37)\][^\n]*/g) || [])
  assert.deepEqual(errors, [])
})
