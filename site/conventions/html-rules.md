---
title: HTML/마크업 규칙
order: 4
---

<!-- 자동 생성 — rules.json에서 생성됨. 직접 수정 금지. npm run build:rules로 갱신. -->

HTML 마크업 작성 규칙이다.

## 규칙 요약

| ID | 규칙 | 심각도 | 검증 |
|----|------|--------|------|
| R-07 | inline style 금지 — CSS 커스텀 프로퍼티 style="--var: val"은 허용 | warning | check-violations.js |
| R-08 | HTML 클래스에도 BEM 2단계 element 금지 (R-05 연동) | warning | check-violations.js |
| R-09 | img alt 속성 필수 | error | check-violations.js |
| R-10 | 인터랙티브 요소는 시맨틱 HTML 사용 — div onclick 금지 | error | check-violations.js |
| R-15 | HTML 기본 구조는 기존 인포마인드 사이트 패턴을 우선 유지한다 | error | check-html-structure.js |
| R-23 | 가짜 콘텐츠 금지 — lorem ipsum·자리 채움 문구·placeholder 핫링크 | error | check-violations.js |
| R-25 | 섹션 리듬 — 동일 archetype 3연속·카드 중첩 금지, 카드 그리드 남발 경고 | error | check-html-structure.js |
| R-27 | 아이콘은 카탈로그에서 가져온다 — 임의 SVG 삽입 금지 | error | check-icons.js, manual |
| R-29 | 마크업의 BEM 클래스는 CSS에 실재해야 한다 — 없는 modifier 금지, 없는 element 경고 | error | check-html-structure.js |
| R-36 | 이모지를 아이콘·불릿·배지·제목 장식으로 쓰지 않는다 — 아이콘은 카탈로그(R-27) | error | check-violations.js |

---

## R-07 — inline style 금지 — CSS 커스텀 프로퍼티 style="--var: val"은 허용

**심각도:** `warning` &nbsp; **검증:** check-violations.js

> 스타일은 CSS 파일에서만 관리한다. 인라인 스타일은 특이도가 높아 오버라이드가 어렵고 토큰 시스템을 우회한다. CSS 커스텀 프로퍼티 주입(style="--width: 320px")은 동적 값 전달 패턴이므로 허용한다.

**금지 예시**

```html
<div style="padding: 16px; color: #333">   // 일반 인라인 스타일
```

**올바른 형식**

```html
<div style="--card-ratio: 16/9">   // CSS 커스텀 프로퍼티만
<article class="card card--elevated">   // CSS에 정의된 변형 클래스로 스타일 적용
```

---

## R-08 — HTML 클래스에도 BEM 2단계 element 금지 (R-05 연동)

**심각도:** `warning` &nbsp; **검증:** check-violations.js

> R-05와 동일 원칙. HTML 클래스가 CSS에서 정의된 것과 일치해야 한다.

**금지 예시**

```html
<div class="card__header__title">   // 2단계 element
```

**올바른 형식**

```html
<div class="card__title">   // 평탄화
```

---

## R-09 — img alt 속성 필수

**심각도:** `error` &nbsp; **검증:** check-violations.js

> 스크린 리더 사용자에게 이미지 정보를 전달한다. 장식용 이미지는 alt=""로 빈 값을 명시해 스크린 리더가 건너뛰게 한다. WCAG 1.1.1 비텍스트 콘텐츠 (A등급).

**금지 예시**

```html
<img src="photo.jpg">   // alt 없음
```

**올바른 형식**

```html
<img src="photo.jpg" alt="제품 상세 이미지">   // 의미 있는 alt
<img src="deco.svg" alt="">   // 장식용: 빈 alt 명시
```

---

## R-10 — 인터랙티브 요소는 시맨틱 HTML 사용 — div onclick 금지

**심각도:** `error` &nbsp; **검증:** check-violations.js

> div에 onclick을 붙이면 키보드 포커스가 안 되고 스크린 리더가 역할을 인식하지 못한다. 시맨틱 요소는 키보드·스크린 리더 지원이 내장되어 있다.

**금지 예시**

```html
<div onclick="fn()">클릭</div>   // 키보드 접근 불가
```

**올바른 형식**

```html
<button type="button" onclick="fn()">클릭</button>   // 키보드·스크린 리더 지원
```

---

## R-15 — HTML 기본 구조는 기존 인포마인드 사이트 패턴을 우선 유지한다

**심각도:** `error` &nbsp; **검증:** check-html-structure.js

> 인포마인드가 기존에 구축·유지보수한 사이트들은 공통 HTML 골격, 영역 네이밍, 헤더/푸터/본문 구성 패턴을 갖고 있다. 신규 작업도 이 패턴을 우선 유지해 유지보수성과 팀 내 이해도를 확보한다. page shell은 header#header, main#main, footer#footer를 기본으로 하고, HTML 컴포넌트화는 main 안의 section 단위로 분리한다. 각 section은 .container와 접근 가능한 이름을 가진다. KRDS는 root 태그 강제가 아니라 시맨틱 HTML, 접근성 속성, 키보드 동작을 보강하는 기준으로 적용한다.

**금지 예시**

```html
<div onclick="goPage()">이동</div>   // 기존 골격 유지와 무관하게 인터랙션을 div에 직접 부여하는 것은 금지
<div class="modal">...</div>   // dialog 역할/상태 속성 없이 모달을 구성
<div id="content"><div class="header">...</div><div class="footer">...</div></div>   // 기존 사이트 골격과 다른 임의 구조
```

**올바른 형식**

```html
<a href="#main" class="skip-to-content">본문 바로가기</a>
<header id="header"><div class="container">...</div></header>
<main id="main">
  <section class="section section--content" aria-labelledby="section-title">
    <div class="container">
      <h1 id="section-title">페이지 제목</h1>
      ...
    </div>
  </section>
</main>
<footer id="footer"><div class="container">...</div></footer>   // 큰 영역은 단순하게 잡고 main 안은 section 단위, 각 section 안의 .container와 제목이 구조 담당
<div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">...</div>   // 기존 마크업 패턴 위에 접근성 속성 보강
<nav class="breadcrumb" aria-label="브레드크럼"><ol>...</ol></nav>   // 기존 패턴이 없거나 접근성 개선이 필요한 경우 시맨틱 태그 사용
```

**참고:** 기존 인포마인드 구축 사이트 HTML, references/html-semantics.md, references/krds-components.md

---

## R-23 — 가짜 콘텐츠 금지 — lorem ipsum·자리 채움 문구·placeholder 핫링크

**심각도:** `error` &nbsp; **검증:** check-violations.js

> 시안·납품물에 채움 콘텐츠가 남으면 검수 신뢰가 깨지고, placeholder 이미지 핫링크는 외부 서비스 의존이라 납품 self-contained 정책과도 이중으로 충돌한다. 콘텐츠가 미확정이면 task contract의 contentSources로 실제 용어·문서 출처를 먼저 확보하고, 이미지는 실제 자산 경로 또는 실제 비율의 data-uri 표기를 쓴다.

**금지 예시**

```html
<p>Lorem ipsum dolor sit amet</p>   // 영문 채움 텍스트
<p>여기에 설명 텍스트가 들어갑니다</p>   // 한글 자리 채움 문구
<img src="https://placehold.co/300x200" alt="">   // placeholder 핫링크 — self-contained 정책과 이중 위반
```

**올바른 형식**

```html
<p>독서문화 프로그램은 매월 첫째 주 월요일부터 신청을 받습니다.</p>   // 실제 서비스 문안 (contentSources 기반)
<img src="/images/program-reading.jpg" alt="독서문화 프로그램 진행 모습">   // 실제 자산 경로 + 의미 있는 alt
```

**참고:** references/art-direction.md, contracts/task-contract.schema.json

---

## R-25 — 섹션 리듬 — 동일 archetype 3연속·카드 중첩 금지, 카드 그리드 남발 경고

**심각도:** `error` &nbsp; **검증:** check-html-structure.js

> "중앙 제목 + 카드 그리드" 반복은 규정 준수형 무개성의 최빈 패턴이다. 형제 section 시퀀스에서 동일 archetype(section--X) 3연속과 카드 안 카드 중첩은 error, 카드 그리드 섹션(같은 부모 아래 직계 .card 3개 이상)의 페이지당 3개 이상 또는 연속 배치는 warn으로 검출한다. 대체 패턴은 5-objects의 section-media(이미지-텍스트 교차)·hero-bleed(풀블리드 인트로)와 src/snippets/signature.md의 시그니처 요소가 공급한다.

**금지 예시**

```html
<main id="main">
  <section class="section section--list">…</section>
  <section class="section section--list">…</section>
  <section class="section section--list">…</section>
</main>   // 동일 archetype 3연속 — 연속 상한 2
<article class="card">
  <article class="card">…</article>
</article>   // 카드 안 카드 중첩
```

**올바른 형식**

```html
<main id="main">
  <section class="section section--intro hero-bleed">…</section>
  <section class="section section--list">…</section>
  <section class="section section--content">
    <div class="container">
      <div class="section-media">…</div>
    </div>
  </section>
</main>   // archetype 교차 + 변주 패턴 삽입
```

**참고:** references/art-direction.md, src/snippets/section-media.md, src/snippets/hero-bleed.md, src/snippets/signature.md

---

## R-27 — 아이콘은 카탈로그에서 가져온다 — 임의 SVG 삽입 금지

**심각도:** `error` &nbsp; **검증:** check-icons.js · manual

> 아이콘을 그때그때 붙여 넣으면 프로젝트마다 출처·굵기·그리드가 섞이고 라이선스 근거가 남지 않는다. 색상을 토큰으로 강제하는 R-01과 같은 이유다. 쓸 아이콘은 contracts/icon-codepoints.json에 등재된 것뿐이며, 없으면 지어내지 말고 UX팀에 요청한다 — AI 도구는 MCP list_icons·get_icon으로 실재하는 이름만 받는다. 기본 표기는 `<span class="icon-font icon-font--{name}">`이고, 아이콘에는 항상 aria-hidden을 붙인다(스크린리더가 PUA 코드포인트를 오독한다). 뜻은 아이콘 밖에서 전한다 — 옆의 텍스트나 버튼의 aria-label이다. SVG 태그는 폰트를 못 쓰는 곳이나 개별 색이 필요할 때만 쓴다. 표정은 슬림·레귤러·볼드·필 네 가지이고 이름과 코드포인트는 그대로 둔 채 글리프만 바뀐다 — 폰트는 `icon-font--bold` 같은 클래스가, SVG는 스프라이트 파일(`sprite-bold.svg`)이 표정을 정한다. SVG 쪽에 `icon--bold` 같은 클래스를 붙이지 않는다(아무 일도 하지 않는다). 한 화면에서 표정을 섞지 않으며, 모든 아이콘에 필이 있는 것은 아니다 — 없는 표정을 부르면 빈 네모가 나온다.

**금지 예시**

```html
<svg viewBox="0 0 20 20"><path fill="#333" d="..."/></svg>   // 카탈로그 밖 임의 SVG — 뷰박스·색이 세트와 어긋난다
<span class="icon-font icon-font--search"></span>   // aria-hidden이 없다 — 스크린리더가 코드포인트를 읽는다
<button class="btn btn--text"><span class="icon-font icon-font--close" aria-hidden="true"></span></button>   // 아이콘만 있는데 버튼에 이름이 없다 — 무슨 버튼인지 알 수 없다
<span class="icon-font icon-font--magnifier" aria-hidden="true"></span>   // 대장에 없는 이름 — 아무것도 안 나온다
<svg class="icon icon--bold" aria-hidden="true"><use href="/assets/icons/sprite.svg#search"></use></svg>   // SVG에서 표정은 클래스가 아니라 스프라이트 파일이 정한다 — 이 클래스는 아무 일도 안 하고 기본 굵기가 나온다
<span class="icon-font icon-font--fill icon-font--search" aria-hidden="true"></span>   // 돋보기는 채울 면이 없어 필이 없다 — 빈 네모가 나온다. 그 아이콘이 가진 표정만 쓴다
```

**올바른 형식**

```html
<button class="btn"><span class="icon-font icon-font--search" aria-hidden="true"></span>검색</button>   // 옆의 텍스트가 뜻을 전한다
<button class="btn btn--text" aria-label="닫기"><span class="icon-font icon-font--close" aria-hidden="true"></span></button>   // 아이콘만 있을 때는 버튼에 이름을 준다
<svg class="icon" aria-hidden="true"><use href="/assets/icons/sprite.svg#search"></use></svg>   // 폰트를 못 쓰는 곳이나 개별 색이 필요할 때
<span class="icon-font icon-font--bold icon-font--search" aria-hidden="true"></span>   // 폰트는 클래스가 표정을 바꾼다 — 표정 클래스를 이름 클래스 앞에 둔다
<svg class="icon" aria-hidden="true"><use href="/assets/icons/sprite-bold.svg#search"></use></svg>   // SVG는 스프라이트 파일이 곧 표정이다
```

---

## R-29 — 마크업의 BEM 클래스는 CSS에 실재해야 한다 — 없는 modifier 금지, 없는 element 경고

**심각도:** `error` &nbsp; **검증:** check-html-structure.js

> 카탈로그 블록(src/styles에 정의된 블록)의 modifier를 CSS에 없는 이름으로 쓰면 화면은 기본 모양으로 나오면서 변형인 척한다. AI가 card--featured처럼 그럴듯한 변형을 지어내는 대표적 경로다(2026-10 점검에서 playground·스니펫에 이런 유령 클래스 30개가 있었다). modifier는 모양을 바꾸려고 있는 것이라 CSS가 없으면 error, element는 스타일 없는 구조 표시일 수 있어 warn — 스타일이 필요 없으면 클래스를 달지 않는다. 같은 파일 <style>에 정의한 클래스와 section 목적 modifier(html-page-contract)는 예외다. CSS에 없는 블록은 프로젝트 고유 블록일 수 있어 보지 않지만, 파일 이름이나 흔한 오기로 지은 블록(header__*·form__*·check-radio__*·table-wrapper)은 contracts/class-naming.json 대응표로 실제 블록(site-header·form-field·check·table-wrap)을 알려 주며 오류로 잡는다.

**금지 예시**

```html
<article class="card card--featured">   // card.css에 없는 변형 — 기본 카드로 보인다
<a class="pagination__link pagination__link--current">   // 컴포넌트 CSS와 다른 클래스 — 현재 페이지가 표시되지 않는다
```

**올바른 형식**

```html
<article class="card card--elevated">   // card.css에 정의된 변형
<a class="pagination__item" href="?p=3" aria-current="page">3</a>   // pagination.css가 aria-current 속성 선택자로 현재 페이지를 그린다
```

**참고:** references/class-naming.md

---

## R-36 — 이모지를 아이콘·불릿·배지·제목 장식으로 쓰지 않는다 — 아이콘은 카탈로그(R-27)

**심각도:** `error` &nbsp; **검증:** check-violations.js

> 이모지는 글리프 색이 고정돼 토큰·고대비 모드를 따르지 못하고 KRDS 아이콘 대비(3:1·7:1)를 보장할 수 없다. 플랫폼마다 모양이 다르고, 국내 사이트 99곳 중 1곳만 쓴다 — 흡수할 관행이 없는 AI 슬롭 서명이다. 제목(h1~h6)·버튼·링크·label·summary·th·li·legend·caption·.badge·.tag·__title·__label·__icon 안, 이모지만 있는 텍스트, CSS content(Tailwind [content:"…"]·content-[…] 포함)는 error, 그 밖의 본문은 warn, alt는 이미지 속 글자 전사일 수 있어 warn이다. HTML 엔티티(`&#x1F680;`)·CSS 이스케이프(`\1F449`)도 풀어 본다. ©·®·※·★·▲·①·☎·✔ 같은 텍스트 기호는 이모지가 아니라 통과한다. 링크·버튼 끝의 → ➜ » ▶는 warn — 카탈로그 chevron + aria-hidden을 쓴다. 웹 콘텐츠(스니펫 코드 블록·플레이그라운드·사이트 문서·납품 페이지)에만 적용하고 저장소 안내 문서(README·CLAUDE.md 등)는 대상이 아니다.

**금지 예시**

```html
<h3 class="feature__title">🚀 빠른 처리</h3>   // 제목 장식
<li>✅ 24시간 민원 접수</li>   // 불릿 대용
<span class="badge">✨ NEW</span>   // 배지 장식
.notice__link::before { content: "👉"; }   // CSS content 이모지
```

**올바른 형식**

```html
<small class="site-footer__copy">© 2026 기관명</small>   // 텍스트 기호
<p>※ 신청 기간을 확인하십시오.</p>   // 텍스트 기호
<svg class="icon" aria-hidden="true"><use href="assets/icons/sprite.svg#check"></use></svg>   // 카탈로그 아이콘
```

**참고:** references/class-naming.md, scripts/lib/visual-signature.js

---
