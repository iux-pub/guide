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
| R-23 | 가짜·자리 콘텐츠 금지 — 채움 문구·placeholder 핫링크·'질문 1' 연번 레이블·자리값 제목·지어낸 연락처 | error | check-violations.js |
| R-25 | 섹션 리듬 — 동일 archetype 3연속·카드 중첩 금지, 카드 그리드 남발 경고 | error | check-html-structure.js |
| R-27 | 아이콘은 카탈로그에서 가져온다 — 임의 SVG 삽입 금지 | error | check-icons.js, manual |
| R-29 | 마크업의 BEM 클래스는 CSS에 실재해야 한다 — 없는 modifier 금지, 없는 element 경고 | error | check-html-structure.js |
| R-36 | 이모지를 아이콘·불릿·배지·제목 장식으로 쓰지 않는다 — 아이콘은 카탈로그(R-27) | error | check-violations.js |
| R-43 | 카피 톤 — 번역투·2인칭 마케팅 문구 금지, 버튼은 '~하세요'가 아닌 동사형, 공공 화면 느낌표 금지 | error | check-violations.js |

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
      <h1 id="section-title">공지사항</h1>
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

## R-23 — 가짜·자리 콘텐츠 금지 — 채움 문구·placeholder 핫링크·'질문 1' 연번 레이블·자리값 제목·지어낸 연락처

**심각도:** `error` &nbsp; **검증:** check-violations.js

> 시안·납품물에 채움 콘텐츠가 남으면 검수 신뢰가 깨지고, placeholder 이미지 핫링크는 외부 서비스 의존이라 납품 self-contained 정책과도 이중으로 충돌한다. 콘텐츠가 미확정이면 task contract의 contentSources로 실제 용어·문서 출처를 먼저 확보하고, 이미지는 실제 자산 경로를 쓴다. 검사는 요소 트리로 보고(scripts/lib/copy-rules.js, 판정 자료 contracts/fake-content.json), 글은 텍스트 노드가 아니라 블록·제목·버튼 하나 아래의 인라인 글을 이은 '문구 덩어리'로 본다(<strong>·<br>로 쪼갠 자리 문구도 잡는다). 범위마다 심각도가 다르다. 납품 페이지(루트 *.html·pages/**·infoux.json pages): 채움 문구(lorem, '…설명이 들어갑니다', '…문구가 들어갈 자리입니다', '샘플 텍스트입니다', '카드 본문 내용', '답변 1 내용', 'Your text here'), 스톡·아바타 핫링크(어느 속성이든·style·script·CSS url()·src/js 문자열), 형제 2개 이상이 '일반명사+번호'인 레이블('자주 묻는 질문 1·2', '탭 1·2·3', 'Feature 1·2' — 형제 안의 제목·summary·펼침 버튼·탭 글로 비교한다), 자리값 title·h1('새 프로젝트', '페이지 제목', '제목을 입력하세요', '모달 제목', title은 '|'·'-'로 나눈 조각마다)과 h2~h6('제목', '모달 제목'), 비실재 연락처·자리 표기(064-000-0000·(064) 000-0000·010-XXXX-XXXX, ○○·OOO·XX구·△△동, 홍길동, example 도메인·example@ 이메일, tel:·mailto: 링크 값, 000-00-00000), 이름 자리(title 조각·로고 alt·브랜드·저작권 블록·사이트 이름 메타)의 '기관명·사이트명'은 오류다. 템플릿(루트 index.html의 틀 표시)은 채움 문구·핫링크 오류, 자리값 제목·연락처·연번은 경고. 스니펫 사본(src/snippets·site/components·site/prompts)은 채움 문구·핫링크 오류, 연번·자리값 제목 경고, 비실재 표기(○○, 064-000-0000)는 K-04 형식 예시로 통과한다 — 그대로 납품 페이지에 옮기면 그때 잡힌다. 플레이그라운드는 채움 문구 경고. 실재처럼 보이는 가짜 번호(02-1234-5678, 123-45-67890)는 어디서든 경고(납품은 오류). 출처·기준일 없는 수치 밴드(단위 붙은 값 3칸 이상, 그중 %·+·만·억·배가 하나 이상 — 순위·정원·건수만 이어진 운영 정보는 아니다)와 마스킹 이름·별점 후기는 경고다 — '출처: …', 'YYYY. M. D. 기준', 'YYYY년 M월 말 현재', <cite>를 붙이면 통과한다. 대상이 아닌 것: 성씨 마스킹(김○○ 주무관·남궁○○님·이OO씨), placeholder·aria-placeholder 속성의 글, '예:'·'예)' 뒤의 형식 예시 조각, 코드(code·pre·kbd·samp), 표 머리·레이블·폼 업로드 칸('상품 이미지 1·2·3'), 고유명사(홍길동전), 금지 예시 펜스, 연번 비교에서의 숨김 형제(sr-only·hidden·aria-hidden). class에 example이 든 예시 상자는 문서·스니펫에서만 면제한다. 스타터 index.html처럼 고쳐 쓸 틀에는 <meta name="infoux:template">를 둔다 — 루트 index.html에서만 인정하고(pages/** 등 다른 납품 페이지는 표시가 있어도 납품 검사와 함께 표시 제거 경고), 표시가 남은 동안은 매번 표시 제거를 알린다. 주석 처리한 표시는 표시가 아니다. create-infomind-ux는 표시를 지우고 제목을 프로젝트 이름으로 채운다. JS 문자열의 lorem은 오류, 그 밖의 채움 문구·지어낸 연락처는 경고다(JS에는 페이지 범위가 없다).

**금지 예시**

```html
<p>Lorem ipsum dolor sit amet</p>   // 영문 채움 텍스트
<p>여기에 설명 텍스트가 들어갑니다</p>   // 한글 자리 채움 문구
<img src="https://placehold.co/300x200" alt="">   // placeholder 핫링크 — self-contained 정책과 이중 위반
<summary>자주 묻는 질문 1</summary> … <summary>자주 묻는 질문 2</summary>   // 일반명사+번호 연번 레이블
<title>새 프로젝트</title>   // 자리값 제목(납품 페이지)
<p>대표전화 064-000-0000 · ○○시청</p>   // 비실재 표기가 납품 페이지에 남음
```

**올바른 형식**

```html
<p>독서문화 프로그램은 매월 첫째 주 월요일부터 신청을 받습니다.</p>   // 실제 서비스 문안 (contentSources 기반)
<img src="/images/program-reading.jpg" alt="독서문화 프로그램 진행 모습">   // 실제 자산 경로 + 의미 있는 alt
<summary>민원 처리 기간은 얼마나 걸리나요?</summary>   // 실제 문의에서 가져온 질문
<p>담당 김○○ 주무관</p>   // 성씨 마스킹은 관행 — 대상 아님
```

**참고:** references/art-direction.md, contracts/task-contract.schema.json, contracts/fake-content.json, scripts/lib/copy-rules.js

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
<small class="site-footer__copy">© 2026 인포마인드</small>   // 텍스트 기호
<p>※ 신청 기간을 확인하십시오.</p>   // 텍스트 기호
<svg class="icon" aria-hidden="true"><use href="assets/icons/sprite.svg#check"></use></svg>   // 카탈로그 아이콘
```

**참고:** references/class-naming.md, scripts/lib/visual-signature.js

---

## R-43 — 카피 톤 — 번역투·2인칭 마케팅 문구 금지, 버튼은 '~하세요'가 아닌 동사형, 공공 화면 느낌표 금지

**심각도:** `error` &nbsp; **검증:** check-violations.js

> '당신만의 여정을 시작하세요'·'새로운 차원을 경험하세요'·'지금 바로 무료로 시작' 같은 영어 마케팅 직역은 AI 카피의 서명이고, 한국어 공공·서비스 화면은 주어를 생략하거나 '이용자·주민'을 쓰며 합쇼체 사실 서술을 기본으로 한다(art-direction §8). KRDS 버튼 레이블은 실행될 기능을 예측할 수 있는 동사형('신청하기', '변경사항 저장') 또는 일반 작업 명사('닫기', '취소')다 — '신청하세요'·'쿠폰 받으세요'·'가입해 보세요'처럼 재촉하는 명령문은 버튼 이름이 아니다. 판정(scripts/lib/copy-rules.js, 어휘 contracts/copy-lexicon.json)은 텍스트 노드가 아니라 '문구 덩어리'(블록·제목·버튼 하나 아래 인라인 글을 이은 것, <br>은 공백)로 한다 — '<em>지금</em> 바로'처럼 강조로 쪼갠 문구도 잡고, '지금 바로 <strong>대피하십시오</strong>'처럼 강조가 섞인 정상 문장도 예외를 받는다. (1) 번역투 어휘는 제목·title·버튼·a.btn·role=button·도입부(section--intro·hero)·aria-label에서 오류, 본문과 이미지 대체 글(alt, img·role=img의 aria-label·title)에서 경고. (2) 버튼 이름 — aria-label과 보이는 글을 각각(아이콘 aria-hidden 제외, 끝의 →·›·~·! 같은 기호 제외) — 이 '-(으)세요·-십시오'로 끝나면 오류. 탭(role=tab)·목록 펼침 트리거(aria-haspopup=listbox·menu·tree·grid·true)·제목 안의 펼침 버튼(아코디언)은 제목 구실이라 보지 않는다. (3) 느낌표(전각 ！·‼·'~!'·'?!' 포함, '!='·'!important'는 아니다)는 사이트 유형(infoux.json profile)에 따라 — 공공서비스는 제목·버튼·도입부 오류·본문 경고, 공공기관·관리자는 경고, 일반사이트·커머스(또는 유형 미정)는 제목·버튼만 경고. '지금 바로가기' 링크와 '…하십시오'로 끝나는 공식 안내·재난 대피 문장(문장마다 본다)은 대상이 아니다. 인용(blockquote·q·cite)·코드·따옴표 안 인용(영어 아포스트로피는 따옴표가 아니다)·한글이 없는 외국어 조각도 대상이 아니다 — <html lang="en"> 보일러플레이트여도 한글 문구는 검사한다. 같은 제목·버튼의 aria-label과 보이는 글이 같은 문구면 한 번만 알린다. 바꿀 수 없는 공식 슬로건·행사명은 infoux.json copyAllow에 둔다(공백을 접어 비교하므로 <br>로 나눈 슬로건도 한 줄로 적는다). 마크다운은 html 펜스와 원시 HTML 블록만 보고 설명 문장(인라인 태그로 시작하는 문단 포함)은 보지 않는다.

**금지 예시**

```html
<h2>당신만의 여정을 시작하세요</h2>   // 2인칭·직역 마케팅
<a class="btn btn--primary" href="/apply">지금 바로 신청하세요!</a>   // 재촉형 버튼 + 느낌표
<h1>신청이 완료되었습니다!</h1>   // 공공서비스 화면의 느낌표
```

**올바른 형식**

```html
<h2>신청 방법</h2>   // 사실 서술 제목
<a class="btn btn--primary" href="/apply">신청하기</a>   // KRDS 동사형 레이블
<p>지금 바로 높은 곳으로 대피하십시오.</p>   // 공식 재난 안내(합쇼체 명령)는 대상 아님
```

**참고:** references/art-direction.md, contracts/copy-lexicon.json, scripts/lib/copy-rules.js

---
