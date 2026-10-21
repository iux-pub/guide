// check-html-structure.js page shell 계약 검증

const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { spawnSync } = require('node:child_process')
const { test } = require('node:test')
const assert = require('node:assert/strict')

const ROOT = path.resolve(__dirname, '..', '..')
const CHECK_HTML = path.join(ROOT, 'scripts', 'check-html-structure.js')

function runCheck(source) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'iux-html-'))
  const filePath = path.join(dir, 'page.html')
  fs.writeFileSync(filePath, source)

  return spawnSync(process.execPath, [CHECK_HTML, filePath], {
    cwd: ROOT,
    encoding: 'utf8'
  })
}

test('page shell 계약을 충족한 HTML은 통과한다', () => {
  const result = runCheck(`<!DOCTYPE html>
<html lang="ko">
<head>
  <title>테스트</title>
</head>
<body>
  <a href="#main" class="skip-to-content">본문 바로가기</a>
  <header id="header" class="site-header">
    <div class="container">브랜드</div>
  </header>
  <main id="main">
    <section class="section section--content" aria-labelledby="section-title">
      <div class="container">
        <h1 id="section-title">페이지 제목</h1>
      </div>
    </section>
  </main>
  <footer id="footer" class="site-footer">
    <div class="container">푸터</div>
  </footer>
</body>
</html>`)

  assert.equal(result.status, 0, result.stderr)
})

test('page shell 필수 구조가 빠지면 R-14/R-15 오류로 실패한다', () => {
  const result = runCheck(`<!DOCTYPE html>
<html lang="ko">
<body>
  <header>
    <div class="container">브랜드</div>
  </header>
  <main>
    <div class="container">본문</div>
  </main>
</body>
</html>`)

  assert.equal(result.status, 2)
  assert.match(result.stderr, /\[R-14\]/)
  assert.match(result.stderr, /\[R-15\]/)
  assert.match(result.stderr, /main#main/)
})

test('등록되지 않은 section modifier는 실패한다', () => {
  const result = runCheck(`<!DOCTYPE html>
<html lang="ko">
<body>
  <a href="#main" class="skip-to-content">본문 바로가기</a>
  <header id="header" class="site-header">
    <div class="container">브랜드</div>
  </header>
  <main id="main">
    <section class="section section--hero" aria-labelledby="section-title">
      <div class="container">
        <h1 id="section-title">페이지 제목</h1>
      </div>
    </section>
  </main>
  <footer id="footer" class="site-footer">
    <div class="container">푸터</div>
  </footer>
</body>
</html>`)

  assert.equal(result.status, 2)
  assert.match(result.stderr, /\[R-18\]/)
  assert.match(result.stderr, /section--hero/)
})

test('폼 컨트롤에 label이 없으면 R-16으로 실패한다', () => {
  const result = runCheck('<form><input id="email" type="email"></form>')

  assert.equal(result.status, 2)
  assert.match(result.stderr, /\[R-16\]/)
  assert.match(result.stderr, /접근 가능한 이름/)
})

test('label 또는 aria-label이 있는 폼 컨트롤은 통과한다', () => {
  const result = runCheck(`
<form>
  <label for="email">이메일</label>
  <input id="email" type="email">
  <input type="search" aria-label="검색어">
</form>`)

  assert.equal(result.status, 0, result.stderr)
})

test('ARIA 관계가 완전한 tab 패턴은 통과한다', () => {
  const result = runCheck(`
<div class="tab">
  <div class="tab__list" role="tablist" aria-label="콘텐츠">
    <button class="tab__item" role="tab" id="tab-1" aria-selected="true" aria-controls="panel-1">개요</button>
  </div>
  <div class="tab__panel" role="tabpanel" id="panel-1" aria-labelledby="tab-1">내용</div>
</div>`)

  assert.equal(result.status, 0, result.stderr)
})

test('tab의 role과 관계 속성이 빠지면 R-16으로 실패한다', () => {
  const result = runCheck(`
<div class="tab">
  <button class="tab__item">개요</button>
  <div class="tab__panel">내용</div>
</div>`)

  assert.equal(result.status, 2)
  assert.match(result.stderr, /\[R-16\]/)
  assert.match(result.stderr, /tablist/)
})

test('native details accordion은 통과한다', () => {
  const result = runCheck(`
<div class="accordion">
  <details class="accordion__item">
    <summary class="accordion__summary">질문</summary>
    <div class="accordion__panel">답변</div>
  </details>
</div>`)

  assert.equal(result.status, 0, result.stderr)
})

test('custom accordion의 관계 속성이 빠지면 R-16으로 실패한다', () => {
  const result = runCheck(`
<div class="accordion">
  <button class="accordion__trigger">열기</button>
  <div class="accordion__panel">내용</div>
</div>`)

  assert.equal(result.status, 2)
  assert.match(result.stderr, /\[R-16\]/)
  assert.match(result.stderr, /aria-expanded/)
})

test('비-BEM 상태 클래스는 R-17 오류로 실패한다', () => {
  const result = runCheck('<button class="btn is-active">버튼</button>')

  assert.equal(result.status, 2)
  assert.match(result.stderr, /\[R-17\]/)
})

test('lang 없는 <html>은 R-21 오류로 실패한다', () => {
  const result = runCheck(`<!DOCTYPE html>
<html>
<body>
  <a href="#main" class="skip-to-content">본문 바로가기</a>
  <header id="header"><div class="container">브랜드</div></header>
  <main id="main">
    <section class="section section--content" aria-labelledby="t">
      <div class="container"><h1 id="t">제목</h1></div>
    </section>
  </main>
  <footer id="footer"><div class="container">푸터</div></footer>
</body>
</html>`)

  assert.equal(result.status, 2)
  assert.match(result.stderr, /\[R-21\]/)
})

test('R-25: 동일 archetype 3연속 section은 오류다', () => {
  const result = runCheck(`<!DOCTYPE html>
<html lang="ko">
<body>
  <a href="#main" class="skip-to-content">본문 바로가기</a>
  <header id="header"><div class="container">브랜드</div></header>
  <main id="main">
    <section class="section section--list" aria-label="공지 목록"><div class="container">공지</div></section>
    <section class="section section--list" aria-label="보도자료 목록"><div class="container">보도자료</div></section>
    <section class="section section--list" aria-label="채용 목록"><div class="container">채용</div></section>
  </main>
  <footer id="footer"><div class="container">푸터</div></footer>
</body>
</html>`)

  assert.equal(result.status, 2)
  assert.match(result.stderr, /\[R-25\]/)
  assert.match(result.stderr, /3연속/)
})

test('R-25: archetype을 교차한 section 시퀀스는 통과한다', () => {
  const result = runCheck(`<!DOCTYPE html>
<html lang="ko">
<body>
  <a href="#main" class="skip-to-content">본문 바로가기</a>
  <header id="header"><div class="container">브랜드</div></header>
  <main id="main">
    <section class="section section--intro" aria-label="기관 소개"><div class="container">소개</div></section>
    <section class="section section--list" aria-label="공지 목록"><div class="container">공지</div></section>
    <section class="section section--content" aria-label="이용 안내"><div class="container">안내</div></section>
    <section class="section section--list" aria-label="보도자료 목록"><div class="container">보도자료</div></section>
  </main>
  <footer id="footer"><div class="container">푸터</div></footer>
</body>
</html>`)

  assert.equal(result.status, 0, result.stderr)
})

test('R-25: 카드 안 카드 중첩은 오류다', () => {
  const result = runCheck(`
<article class="card">
  <div class="card__body">
    <article class="card">
      <div class="card__body">중첩 카드</div>
    </article>
  </div>
</article>`)

  assert.equal(result.status, 2)
  assert.match(result.stderr, /\[R-25\]/)
  assert.match(result.stderr, /중첩/)
})

test('R-25: 카드 그리드 섹션이 페이지당 3개 이상이면 경고한다 (차단 없음)', () => {
  const grid = (label) => `
    <section class="section section--list" aria-label="${label}">
      <div class="container">
        <div class="grid">
          <article class="card"><div class="card__body">${label} 1</div></article>
          <article class="card"><div class="card__body">${label} 2</div></article>
          <article class="card"><div class="card__body">${label} 3</div></article>
        </div>
      </div>
    </section>`
  const result = runCheck(`<!DOCTYPE html>
<html lang="ko">
<body>
  <a href="#main" class="skip-to-content">본문 바로가기</a>
  <header id="header"><div class="container">브랜드</div></header>
  <main id="main">
    ${grid('공지')}
    <section class="section section--content" aria-label="이용 안내"><div class="container">안내</div></section>
    ${grid('행사')}
    <section class="section section--intro" aria-label="기관 소개"><div class="container">소개</div></section>
    ${grid('자료')}
  </main>
  <footer id="footer"><div class="container">푸터</div></footer>
</body>
</html>`)

  assert.equal(result.status, 0, result.stderr)
  assert.match(result.stderr, /\[R-25\]/)
  assert.match(result.stderr, /페이지당/)
})

test('R-25: 카드 그리드 섹션 연속 배치는 경고한다 (차단 없음)', () => {
  const result = runCheck(`<!DOCTYPE html>
<html lang="ko">
<body>
  <a href="#main" class="skip-to-content">본문 바로가기</a>
  <header id="header"><div class="container">브랜드</div></header>
  <main id="main">
    <section class="section section--list" aria-label="공지 목록">
      <div class="container">
        <div class="grid">
          <article class="card"><div class="card__body">공지 1</div></article>
          <article class="card"><div class="card__body">공지 2</div></article>
          <article class="card"><div class="card__body">공지 3</div></article>
        </div>
      </div>
    </section>
    <section class="section section--data" aria-label="현황 카드">
      <div class="container">
        <div class="grid">
          <article class="card"><div class="card__body">현황 1</div></article>
          <article class="card"><div class="card__body">현황 2</div></article>
          <article class="card"><div class="card__body">현황 3</div></article>
        </div>
      </div>
    </section>
  </main>
  <footer id="footer"><div class="container">푸터</div></footer>
</body>
</html>`)

  assert.equal(result.status, 0, result.stderr)
  assert.match(result.stderr, /\[R-25\]/)
  assert.match(result.stderr, /연속 배치/)
})

test('R-25: 카드 그리드 2개가 떨어져 있으면 경고하지 않는다', () => {
  const grid = (label) => `
    <section class="section section--list" aria-label="${label}">
      <div class="container">
        <div class="grid">
          <article class="card"><div class="card__body">${label} 1</div></article>
          <article class="card"><div class="card__body">${label} 2</div></article>
          <article class="card"><div class="card__body">${label} 3</div></article>
        </div>
      </div>
    </section>`
  const result = runCheck(`<!DOCTYPE html>
<html lang="ko">
<body>
  <a href="#main" class="skip-to-content">본문 바로가기</a>
  <header id="header"><div class="container">브랜드</div></header>
  <main id="main">
    ${grid('공지')}
    <section class="section section--content" aria-label="이용 안내"><div class="container">안내</div></section>
    ${grid('행사')}
  </main>
  <footer id="footer"><div class="container">푸터</div></footer>
</body>
</html>`)

  assert.equal(result.status, 0, result.stderr)
  assert.doesNotMatch(result.stderr, /\[R-25\]/)
})

test('lang="ko"가 있는 <html>은 R-21을 통과한다', () => {
  const result = runCheck(`<!DOCTYPE html>
<html lang="ko">
<body>
  <a href="#main" class="skip-to-content">본문 바로가기</a>
  <header id="header"><div class="container">브랜드</div></header>
  <main id="main">
    <section class="section section--content" aria-labelledby="t">
      <div class="container"><h1 id="t">제목</h1></div>
    </section>
  </main>
  <footer id="footer"><div class="container">푸터</div></footer>
</body>
</html>`)

  assert.equal(result.status, 0, result.stderr)
})

// ─── R-29: 마크업 클래스 실재 · R-18 폐기 modifier ─────────────
function fragment(body) {
  return `<section class="section section--content" aria-labelledby="t">
  <div class="container">
    <h2 id="t">제목</h2>
    ${body}
  </div>
</section>`
}

test('R-29: CSS에 정의된 modifier는 통과한다', () => {
  const result = runCheck(fragment('<article class="card card--elevated"><h3 class="card__title">공지</h3></article>'))
  assert.doesNotMatch(result.stderr, /\[R-29\]/)
})

test('R-29: 카탈로그 블록에 없는 modifier는 오류다', () => {
  const result = runCheck(fragment('<article class="card card--featured"><h3 class="card__title">공지</h3></article>'))
  assert.equal(result.status, 2)
  assert.match(result.stderr, /\[R-29\][\s\S]*card--featured/)
})

test('R-29: 카탈로그 블록에 없는 element는 경고만 한다', () => {
  const result = runCheck(fragment('<article class="card"><div class="card__media"></div><h3 class="card__title">공지</h3></article>'))
  assert.equal(result.status, 0, result.stderr)
  assert.match(result.stderr, /\[R-29\][\s\S]*card__media/)
})

test('R-29: 같은 파일 <style>에 정의한 클래스와 프로젝트 고유 블록은 검사하지 않는다', () => {
  const result = runCheck(`<style>.card--promo { outline: 0; }</style>
${fragment('<article class="card card--promo"><h3 class="card__title">공지</h3></article><div class="campaign__badge--new">새 소식</div>')}`)
  assert.doesNotMatch(result.stderr, /\[R-29\]/)
})

test('R-18: 폐기 예정 modifier는 대체 이름과 함께 경고한다', () => {
  const result = runCheck(fragment('<span class="badge badge--gray">3</span>'))
  assert.equal(result.status, 0, result.stderr)
  assert.match(result.stderr, /\[R-18\][\s\S]*badge--neutral/)
})

test('R-18: 폐기 별칭으로 시작하는 다른 modifier(badge--gray-dark)는 오류다 — 별칭 예외는 클래스 전체가 같을 때만', () => {
  const result = runCheck(`<style>.badge--gray-dark { outline: 0; }</style>
${fragment('<span class="badge badge--gray-dark">3</span>')}`)
  assert.equal(result.status, 2)
  assert.match(result.stderr, /\[R-18\][\s\S]*badge--gray-dark/)
})

test('R-18: 금지어가 뒤 조각에 있어도(card--dark-mode) 오류다', () => {
  const result = runCheck(fragment('<article class="card card--dark-mode"><h3 class="card__title">공지</h3></article>'))
  assert.equal(result.status, 2)
  assert.match(result.stderr, /\[R-18\][\s\S]*card--dark-mode/)
})

test('R-18: 면제 접두어(pg) 블록은 시각 단어 검사에서 빠진다', () => {
  const result = runCheck(`<style>.pg__swatch--gray { outline: 0; }</style>
${fragment('<span class="pg__swatch--gray">회색 견본</span>')}`)
  assert.doesNotMatch(result.stderr, /\[R-18\]/)
})

test('R-29: 파일 이름·오기로 지은 블록(header__*, form__*, table-wrapper)은 실제 블록을 알려 주는 오류다', () => {
  const result = runCheck(fragment(`<div class="header__inner">기관명</div>
<div class="form__group"><label class="form__label" for="q">검색어</label><input id="q" class="input"></div>
<div class="table-wrapper"><table class="table"><caption class="table__caption">목록</caption><tr><th scope="col">이름</th></tr></table></div>`))
  assert.equal(result.status, 2)
  assert.match(result.stderr, /\[R-29\][\s\S]*header__inner[\s\S]*site-header/)
  assert.match(result.stderr, /\[R-29\][\s\S]*form__group[\s\S]*form-field/)
  assert.match(result.stderr, /\[R-29\][\s\S]*table-wrapper[\s\S]*table-wrap/)
})

test('R-29: 템플릿 식이 든 class 조각({{ }}, ${ })은 검사하지 않는다', () => {
  const result = runCheck(fragment('<article class="card card--{{ variant }}"><h3 class="card__title">공지</h3></article><span class="badge badge--${tone}">새 글</span>'))
  assert.doesNotMatch(result.stderr, /\[R-29\]/)
})

test('R-17: 대응 속성 없는 상태 modifier는 경고하고, 속성이 있으면 통과한다', () => {
  const missing = runCheck(fragment('<ol><li class="step-indicator__item step-indicator__item--current">신청서 작성</li></ol>'))
  assert.match(missing.stderr, /\[R-17\][\s\S]*step-indicator__item--current/)
  const paired = runCheck(fragment('<ol><li class="step-indicator__item step-indicator__item--current" aria-current="step">신청서 작성</li></ol>'))
  assert.doesNotMatch(paired.stderr, /\[R-17\]/)
})

test('R-18: 현재 페이지 modifier(pagination__item--current)는 aria-current로 바꾸라고 경고한다', () => {
  const result = runCheck(fragment('<nav class="pagination" aria-label="페이지 내비게이션"><ol class="pagination__list"><li><a class="pagination__item pagination__item--current" href="?p=2" aria-current="page">2</a></li></ol></nav>'))
  assert.equal(result.status, 0, result.stderr)
  assert.match(result.stderr, /\[R-18\][\s\S]*aria-current/)
})

function pageWithViewport(content) {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta name="viewport" content="${content}">
  <title>테스트</title>
</head>
<body>
  <a href="#main" class="skip-to-content">본문 바로가기</a>
  <header id="header"><div class="container">브랜드</div></header>
  <main id="main">
    <section class="section section--content" aria-labelledby="t">
      <div class="container"><h1 id="t">제목</h1></div>
    </section>
  </main>
  <footer id="footer"><div class="container">푸터</div></footer>
</body>
</html>`
}

test('R-28: 확대 제한 없는 viewport는 통과한다', () => {
  const result = runCheck(pageWithViewport('width=device-width, initial-scale=1'))
  assert.equal(result.status, 0, result.stderr)
  assert.doesNotMatch(result.stderr, /\[R-28\]/)
})

test('R-28: user-scalable=0은 오류다', () => {
  const result = runCheck(pageWithViewport('width=device-width, initial-scale=1.0, user-scalable=0'))
  assert.equal(result.status, 2)
  assert.match(result.stderr, /\[R-28\]/)
})

test('R-28: maximum-scale=1.0은 오류다', () => {
  const result = runCheck(pageWithViewport('width=device-width, initial-scale=1.0, maximum-scale=1.0'))
  assert.equal(result.status, 2)
  assert.match(result.stderr, /\[R-28\]/)
})

test('R-28: maximum-scale=2.0은 경고만 한다', () => {
  const result = runCheck(pageWithViewport('width=device-width, initial-scale=1, maximum-scale=2.0'))
  assert.equal(result.status, 0, result.stderr)
  assert.match(result.stderr, /\[R-28\]/)
})

test('R-28: 공백·대소문자가 섞여도 차단을 잡는다', () => {
  const result = runCheck(pageWithViewport('width=device-width,initial-scale=1 , User-Scalable = NO'))
  assert.equal(result.status, 2)
  assert.match(result.stderr, /\[R-28\]/)
})

test('다른 블록의 modifier를 컴포넌트 root로 오인하지 않는다 (R-15)', () => {
  // icon-font--calendar는 아이콘 이름이지 calendar 컴포넌트가 아니다.
  // 부분 문자열로 비교하면 걸린다 — 2026-08-23에 아이콘을 쓴 파일마다 경고가 떴다.
  const result = runCheck(`<!DOCTYPE html>
<html lang="ko">
<body>
  <a href="#main" class="skip-to-content">본문 바로가기</a>
  <header id="header"><div class="container">브랜드</div></header>
  <main id="main">
    <section class="section section--content" aria-labelledby="t">
      <div class="container">
        <h1 id="t">제목</h1>
        <button class="btn">
          <span class="icon-font icon-font--calendar" aria-hidden="true"></span>
          일정
        </button>
        <button class="btn">
          <span class="icon-font icon-font--small icon-font--table" aria-hidden="true"></span>
          표
        </button>
      </div>
    </section>
  </main>
  <footer id="footer"><div class="container">푸터</div></footer>
</body>
</html>`)

  assert.equal(result.status, 0, result.stderr)
  assert.doesNotMatch(result.stderr, /\[R-15\]/, '아이콘 클래스를 컴포넌트로 잡으면 안 된다')
})

// ─── 내비게이션 · 공지 · 푸터 (disclosure 패턴) ────────────────────────

function pageWith(shellHeader, body, footer = '<footer id="footer" class="site-footer"><div class="container">푸터</div></footer>') {
  return `<!DOCTYPE html>
<html lang="ko">
<body>
  <a href="#main" class="skip-to-content">본문 바로가기</a>
  ${shellHeader}
  <main id="main">
    <section class="section section--content" aria-labelledby="t">
      <div class="container">
        <h1 id="t">제목</h1>
        ${body}
      </div>
    </section>
  </main>
  ${footer}
</body>
</html>`
}

const PLAIN_HEADER = '<header id="header"><div class="container">브랜드</div></header>'

test('disclosure 토글(aria-expanded + aria-controls)을 갖춘 메가 메뉴는 통과한다', () => {
  const result = runCheck(pageWith(PLAIN_HEADER, `
    <nav class="main-menu main-menu--mega" aria-label="메인 메뉴">
      <ul class="main-menu__list">
        <li class="main-menu__item">
          <button type="button" class="main-menu__toggle" aria-expanded="false" aria-controls="mega-a">서비스</button>
          <div id="mega-a" class="main-menu__panel" hidden>
            <div class="container main-menu__groups">
              <div class="main-menu__group">
                <p class="main-menu__group-title" id="mega-a-g1">신청</p>
                <ul class="main-menu__group-list" aria-labelledby="mega-a-g1">
                  <li><a class="main-menu__sublink" href="/apply">허가 신청</a></li>
                </ul>
              </div>
            </div>
          </div>
        </li>
      </ul>
    </nav>`))

  assert.equal(result.status, 0, result.stderr)
  assert.doesNotMatch(result.stderr, /main-menu__toggle/)
})

test('main-menu__toggle에 aria-controls가 없거나 대상 id가 없으면 R-16으로 실패한다', () => {
  const noControls = runCheck(pageWith(PLAIN_HEADER, `
    <nav class="main-menu" aria-label="메인 메뉴">
      <button type="button" class="main-menu__toggle" aria-expanded="false">서비스</button>
    </nav>`))
  assert.equal(noControls.status, 2)
  assert.match(noControls.stderr, /\[R-16\] main-menu__toggle/)

  const brokenTarget = runCheck(pageWith(PLAIN_HEADER, `
    <nav class="main-menu" aria-label="메인 메뉴">
      <button type="button" class="main-menu__toggle" aria-expanded="false" aria-controls="missing">서비스</button>
    </nav>`))
  assert.equal(brokenTarget.status, 2)
  assert.match(brokenTarget.stderr, /\[R-16\] main-menu__toggle/)
})

test('main-menu__toggle에 aria-haspopup을 붙이면 경고한다 (차단 없음)', () => {
  const result = runCheck(pageWith(PLAIN_HEADER, `
    <nav class="main-menu" aria-label="메인 메뉴">
      <button type="button" class="main-menu__toggle" aria-haspopup="true" aria-expanded="false" aria-controls="sub-a">서비스</button>
      <ul id="sub-a" class="main-menu__submenu" hidden><li><a href="/a">A</a></li></ul>
    </nav>`))

  assert.equal(result.status, 0, result.stderr)
  assert.match(result.stderr, /aria-haspopup/)
})

test('모바일 메뉴 햄버거: aria-controls가 data-mobile-menu-open과 짝이면 통과한다', () => {
  const result = runCheck(pageWith(`
    <header id="header" class="site-header">
      <div class="container">
        <button type="button" class="site-header__toggle" aria-label="전체메뉴" aria-expanded="false" aria-controls="mobile-menu" data-mobile-menu-open="mobile-menu">메뉴</button>
      </div>
    </header>`, ''))

  assert.equal(result.status, 0, result.stderr)
})

test('모바일 메뉴 햄버거: aria-expanded가 없거나 aria-controls가 어긋나면 R-16으로 실패한다', () => {
  const noExpanded = runCheck(pageWith(`
    <header id="header" class="site-header">
      <div class="container">
        <button type="button" class="site-header__toggle" aria-label="전체메뉴" aria-controls="mobile-menu" data-mobile-menu-open="mobile-menu">메뉴</button>
      </div>
    </header>`, ''))
  assert.equal(noExpanded.status, 2)
  assert.match(noExpanded.stderr, /\[R-16\] 모바일 메뉴 햄버거/)

  const mismatch = runCheck(pageWith(`
    <header id="header" class="site-header">
      <div class="container">
        <button type="button" class="site-header__toggle" aria-label="전체메뉴" aria-expanded="false" aria-controls="other" data-mobile-menu-open="mobile-menu">메뉴</button>
      </div>
    </header>`, ''))
  assert.equal(mismatch.status, 2)
  assert.match(mismatch.stderr, /\[R-16\] 모바일 메뉴 햄버거/)
})

test('mobile-menu 패널에 dialog 역할 속성이 빠지면 R-16으로 실패한다', () => {
  const ok = runCheck(pageWith(PLAIN_HEADER, `
    <div id="mobile-menu" class="mobile-menu" role="dialog" aria-modal="true" aria-labelledby="mm-title" hidden>
      <p id="mm-title">전체메뉴</p>
    </div>`))
  assert.equal(ok.status, 0, ok.stderr)

  const missing = runCheck(pageWith(PLAIN_HEADER, `
    <div id="mobile-menu" class="mobile-menu" hidden>
      <p id="mm-title">전체메뉴</p>
    </div>`))
  assert.equal(missing.status, 2)
  assert.match(missing.stderr, /\[R-16\]/)
})

test('notice-bar는 aria-label이 있어야 하고 section이 아니면 R-15 경고한다', () => {
  const ok = runCheck(pageWith(PLAIN_HEADER, `
    <section class="notice-bar notice-bar--warning" aria-label="사이트 공지">
      <div class="container notice-bar__inner">
        <p class="notice-bar__message">10월 12일 시스템 점검 안내</p>
      </div>
    </section>`))
  assert.equal(ok.status, 0, ok.stderr)

  const noLabel = runCheck(pageWith(PLAIN_HEADER, `
    <section class="notice-bar">
      <div class="container notice-bar__inner">
        <p class="notice-bar__message">10월 12일 시스템 점검 안내</p>
      </div>
    </section>`))
  assert.equal(noLabel.status, 2)
  assert.match(noLabel.stderr, /\[R-16\]/)

  const wrongTag = runCheck(pageWith(PLAIN_HEADER, `
    <div class="notice-bar" aria-label="사이트 공지">
      <div class="container notice-bar__inner"><p class="notice-bar__message">점검 안내</p></div>
    </div>`))
  assert.equal(wrongTag.status, 0, wrongTag.stderr)
  assert.match(wrongTag.stderr, /\[R-15\] "notice-bar"/)
})

test('site-footer 루트가 footer가 아니면 R-15 경고한다 (차단 없음)', () => {
  const result = runCheck(pageWith(PLAIN_HEADER, `
    <div class="site-footer"><div class="container">푸터</div></div>`))

  assert.equal(result.status, 0, result.stderr)
  assert.match(result.stderr, /\[R-15\] "site-footer"/)
})

// ─── 템플릿 조각(site/_includes)은 page shell 대상이 아니다 ─────────────
// 파일을 지정해 돌리면(pre-commit 훅) <main>·skip-to-content 가 든 레이아웃이 완전한 페이지로 판정돼
// 레이아웃을 고칠 때마다 커밋이 막혔다. 전체 검사 모드에서는 원래 요구하지 않던 것이다.

const LAYOUT_FRAGMENT = `<!DOCTYPE html>
<html lang="ko">
<body>
  <a href="#main" class="skip-to-content">본문 바로가기</a>
  <main id="main">{% block content %}{% endblock %}</main>
</body>
</html>`

test('site/_includes 의 레이아웃 조각은 page shell 을 요구받지 않는다', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'iux-layout-'))
  const file = path.join(dir, 'site', '_includes', 'layouts', 'base.njk')
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, LAYOUT_FRAGMENT)

  const result = spawnSync(process.execPath, [CHECK_HTML, file], { cwd: ROOT, encoding: 'utf8' })
  assert.equal(result.status, 0, result.stderr)
})

test('같은 내용이라도 조각이 아닌 페이지(경로가 _includes 밖)는 page shell 을 요구받는다', () => {
  const result = runCheck(LAYOUT_FRAGMENT)
  assert.equal(result.status, 2)
  assert.match(result.stderr, /\[R-15\]/)
})

// ─── AI 컨텍스트(references·prompts)도 검사한다 ─────────────
// 손으로 쓴 prompts/components.md에 유령 클래스(tab__button, modal__container 등)가 남아
// AI가 그대로 옮겨 쓰던 경로를 막는다. 금지 예시가 본문인 문서 둘만 제외한다.

const GHOST_MD = '```html\n<article class="card card--featured"><h3 class="card__title">공지</h3></article>\n```\n'

function runCheckAt(relPath, source) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'iux-ctx-'))
  const file = path.join(dir, ...relPath.split('/'))
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, source)
  return spawnSync(process.execPath, [CHECK_HTML, file], { cwd: ROOT, encoding: 'utf8' })
}

test('prompts/의 마크다운 html 블록도 R-29로 검사한다', () => {
  const result = runCheckAt('prompts/components.md', GHOST_MD)
  assert.equal(result.status, 2)
  assert.match(result.stderr, /\[R-29\][\s\S]*card--featured/)
})

test('references/의 금지 예시 문서(forbidden-patterns·accessibility)는 검사하지 않는다', () => {
  for (const name of ['forbidden-patterns.md', 'accessibility.md']) {
    const result = runCheckAt(`references/${name}`, GHOST_MD)
    assert.equal(result.status, 0, `${name}: ${result.stderr}`)
  }
})

test('저장소의 AI 컨텍스트 마크업은 CSS에 있는 클래스만 쓴다', () => {
  const files = ['prompts/components.md', 'references/krds-components.md', 'references/html-semantics.md']
  const result = spawnSync(process.execPath, [CHECK_HTML, ...files.map(f => path.join(ROOT, f))], { cwd: ROOT, encoding: 'utf8' })
  assert.equal(result.status, 0, result.stderr)
  assert.doesNotMatch(result.stderr, /\[R-29\]/)
})

test('R-25: li로 감싼 카드도 그리드로 센다(경고), -tile 블록 중첩은 오류', () => {
  const grid = label => `
    <section class="section section--list" aria-label="${label}">
      <div class="container">
        <ul class="list">
          <li><div><article class="card"><div class="card__body">${label} 1</div></article></div></li>
          <li><article class="card"><div class="card__body">${label} 2</div></article></li>
          <li><article class="card"><div class="card__body">${label} 3</div></article></li>
        </ul>
      </div>
    </section>`
  const page = body => `<!DOCTYPE html>
<html lang="ko">
<body>
  <a href="#main" class="skip-to-content">본문 바로가기</a>
  <header id="header"><div class="container">브랜드</div></header>
  <main id="main">${body}</main>
  <footer id="footer"><div class="container">푸터</div></footer>
</body>
</html>`
  const warned = runCheck(page(`${grid('공지')}${grid('행사')}`))
  assert.equal(warned.status, 0, warned.stderr)
  assert.match(warned.stdout + warned.stderr, /카드 그리드 섹션이 2개 연속/)

  const nested = runCheck('<div class="feature-tile"><div class="promo-card">안</div></div>')
  assert.equal(nested.status, 2)
  assert.match(nested.stderr, /\[R-25\].*중첩/)

  // modifier·element 토큰(list--card, foo__x-card)은 카드형이 아니다
  const ok = runCheck('<ul class="list list--card"><li class="list__item"><div class="news__x-card"><div class="news__x-card">안</div></div></li></ul>')
  assert.doesNotMatch(ok.stdout + ok.stderr, /\[R-25\]/)
})

test('R-25: archetype 없는 section은 경고(납품 페이지 밖)', () => {
  const result = runCheck(`<!DOCTYPE html>
<html lang="ko">
<body>
  <a href="#main" class="skip-to-content">본문 바로가기</a>
  <header id="header"><div class="container">브랜드</div></header>
  <main id="main">
    <section class="section" aria-label="공지"><div class="container">공지</div></section>
  </main>
  <footer id="footer"><div class="container">푸터</div></footer>
</body>
</html>`)
  assert.equal(result.status, 0, result.stderr)
  assert.match(result.stdout + result.stderr, /archetype이 없습니다/)
})