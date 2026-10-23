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
| R-09 | img alt 속성 필수 — 일반 어휘·파일명·연번 alt는 경고 | error | check-violations.js, check-html-structure.js |
| R-10 | 인터랙티브 요소는 시맨틱 HTML 사용 — div onclick 금지 | error | check-violations.js |
| R-15 | HTML 기본 구조는 기존 인포마인드 사이트 패턴을 우선 유지한다 | error | check-html-structure.js |
| R-23 | 가짜·자리 콘텐츠 금지 — 채움 문구·placeholder 핫링크·'질문 1' 연번 레이블·자리값 제목·지어낸 연락처 | error | check-violations.js |
| R-25 | 섹션 리듬 — 동일 archetype 3연속·카드형 중첩 금지, archetype 선언 필수, 카드 그리드 남발 경고(납품 페이지는 3연속·3개부터 오류) | error | check-html-structure.js |
| R-27 | 아이콘은 카탈로그에서 가져온다 — 임의 SVG 삽입 금지 | error | check-icons.js, check-html-structure.js, manual |
| R-29 | 마크업의 BEM 클래스는 CSS에 실재해야 한다 — 없는 modifier 금지, 없는 element 경고 | error | check-html-structure.js |
| R-30 | 링크는 실제 목적지와 그 목적지를 말하는 이름을 가진다 — 빈 값·#·javascript: 금지, 더보기만인 이름 경고 | error | check-html-structure.js |
| R-32 | 푸터에 KRDS 명칭 '개인정보 처리방침' 링크를 실제 주소로 둔다 — 옛 명칭 금지, 강조는 그 링크에만 | error | check-html-structure.js |
| R-36 | 이모지를 아이콘·불릿·배지·제목 장식으로 쓰지 않는다 — 아이콘은 카탈로그(R-27) | error | check-violations.js |
| R-39 | main 안 h1은 하나, 제목 단계를 건너뛰지 않는다 | error | check-html-structure.js |
| R-40 | 공공 화면은 모든 페이지 헤더에 통합검색을 두고, 공공 메인은 첫 화면에 과업 진입을 두며 마케팅 템플릿 섹션을 쓰지 않는다 | error | check-html-structure.js |
| R-41 | 브레드크럼·사이드 메뉴는 본문 바로가기 목적지 밖, main 첫 제목은 h1, 3단계 이상 서브는 브레드크럼, 서브 첫 섹션은 비주얼 히어로가 아니다 | error | check-html-structure.js |
| R-42 | 메인 히어로는 하나·첫 섹션, utility 등급은 히어로를 쓰지 않고, 화면 높이·스크롤 유도 큐를 두지 않는다 | error | check-html-structure.js |
| R-43 | 카피 톤 — 번역투·2인칭 마케팅 문구 금지, 버튼은 '~하세요'가 아닌 동사형, 공공 화면 느낌표 금지 | error | check-violations.js |
| R-44 | 근거 없는 최상급·공공 화면의 성과 홍보 어조와 해요체·경어 혼용을 경고한다 | warn | check-violations.js |
| R-45 | 한국어 화면의 영문 전용 UI 레이블, lang 없는 언어 링크, 고르기만 해도 이동하는 select를 쓰지 않는다 | error | check-html-structure.js |
| R-46 | publicIdentity가 required로 확정되지 않으면 공식 배너·운영기관 식별자·정부 상징을 만들지 않는다 | error | check-html-structure.js |
| R-47 | 개인정보 수집 폼은 동의 옆에 목적·항목·보유 기간·거부권을 알리고, 동의를 미리 체크하지 않으며, 주민등록번호를 받지 않는다 | error | check-html-structure.js |
| R-50 | placeholder에는 예시만 둔다 — '내용을 입력하세요' 같은 빈 안내와 레이블 반복은 경고 | warn | check-html-structure.js |
| R-51 | 템플릿 장식 서명 — 제목 위 eyebrow, 순서가 아닌 01·02 장식 번호, 모든 섹션 등장 효과, 색 있는 굵은 옆선은 경고 | warn | check-html-structure.js, check-violations.js |

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

## R-09 — img alt 속성 필수 — 일반 어휘·파일명·연번 alt는 경고

**심각도:** `error` &nbsp; **검증:** check-violations.js · check-html-structure.js

> 스크린 리더 사용자에게 이미지 정보를 전달한다. 장식용 이미지는 alt=""로 빈 값을 명시해 스크린 리더가 건너뛰게 한다. WCAG 1.1.1 비텍스트 콘텐츠 (A등급). alt가 있어도 '메인 이미지'·'hero image'처럼 모든 어절이 일반 어휘이거나, 파일명(.jpg 등)·연번('이미지 1'·'banner01')·카메라 원본 이름(IMG_2034)이면 경고다(scripts/lib/content-quality.js). alt=""·aria-hidden·role=presentation·aria-labelledby는 면제, 문서(site·references·prompts)는 반례를 싣기 때문에 보지 않는다. 여러 줄에 걸친 <img>의 alt 누락은 트리 파서가 오류로 보완한다.

**금지 예시**

```html
<img src="photo.jpg">   // alt 없음
<img src="hero.jpg" alt="메인 비주얼 이미지">   // 일반 어휘뿐 — warn
```

**올바른 형식**

```html
<img src="photo.jpg" alt="흰색 러닝화 측면 사진">   // 이미지가 전하는 내용
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

## R-25 — 섹션 리듬 — 동일 archetype 3연속·카드형 중첩 금지, archetype 선언 필수, 카드 그리드 남발 경고(납품 페이지는 3연속·3개부터 오류)

**심각도:** `error` &nbsp; **검증:** check-html-structure.js

> "중앙 제목 + 카드 그리드" 반복은 규정 준수형 무개성의 최빈 패턴이다. 형제 section 시퀀스에서 동일 archetype(section--X) 3연속과 카드 안 카드 중첩은 error, 카드 그리드 섹션(같은 부모 아래 직계 .card 3개 이상)의 페이지당 3개 이상 또는 연속 배치는 warn으로 검출한다. 사이에 끼울 변주는 5-objects의 section-media(이미지-텍스트 교차)와 src/snippets/signature.md의 시그니처 요소다. hero-bleed(풀블리드 인트로)는 첫 섹션 전용이라 변주로 쓰지 않는다(R-42). 카드형은 card 토큰과, BEM 블록 토큰(__·-- 없음)이 -card·-tile로 끝나는 요소다(section·main·ul·ol·nav·header·footer 제외). 그리드는 같은 부모 아래 카드형이 3개 이상일 때이며, 자식이 하나인 래퍼(li > div > article.card)를 2단까지 따라가 센다(탭 패널·hidden 래퍼 제외). 그리드 섹션 2연속은 경고, 납품 페이지(infoux.json pages·루트 *.html·pages/**)에서는 3연속과 페이지당 3개 이상이 오류다. main 직계 section은 등록된 archetype(contracts/html-page-contract.json sectionArchetypes)을 정확히 하나 가진다 — 없으면 납품 페이지 오류·그 밖 경고, 둘 이상이면 경고(modifier를 빼 연속 판정을 우회하는 길을 막는다). 플레이그라운드는 archetype 판정에서 면제한다.

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
<section class="section" aria-label="공지">…</section>   // archetype 없음 — 납품 페이지 error
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

**심각도:** `error` &nbsp; **검증:** check-icons.js · check-html-structure.js · manual

> 아이콘을 그때그때 붙여 넣으면 프로젝트마다 출처·굵기·그리드가 섞이고 라이선스 근거가 남지 않는다. 색상을 토큰으로 강제하는 R-01과 같은 이유다. 쓸 아이콘은 contracts/icon-codepoints.json에 등재된 것뿐이며, 없으면 지어내지 말고 UX팀에 요청한다 — AI 도구는 MCP list_icons·get_icon으로 실재하는 이름만 받는다. 기본 표기는 `<span class="icon-font icon-font--{name}">`이고, 아이콘에는 항상 aria-hidden을 붙인다(스크린리더가 PUA 코드포인트를 오독한다). 뜻은 아이콘 밖에서 전한다 — 옆의 텍스트나 버튼의 aria-label이다. SVG 태그는 폰트를 못 쓰는 곳이나 개별 색이 필요할 때만 쓴다. 표정은 슬림·레귤러·볼드·필 네 가지이고 이름과 코드포인트는 그대로 둔 채 글리프만 바뀐다 — 폰트는 `icon-font--bold` 같은 클래스가, SVG는 스프라이트 파일(`sprite-bold.svg`)이 표정을 정한다. SVG 쪽에 `icon--bold` 같은 클래스를 붙이지 않는다(아무 일도 하지 않는다). 한 화면에서 표정을 섞지 않으며, 모든 아이콘에 필이 있는 것은 아니다 — 없는 표정을 부르면 빈 네모가 나온다. 사용처 검사(scripts/lib/icon-usage.js): <use href>가 외부 URL이거나 대장 스프라이트(assets/icons/sprite[-slim|-bold|-fill].svg) 밖 파일이면 오류, 조각 이름이 그 스프라이트의 symbol에 없으면(대장에 없는 이름·그 표정이 없는 이름) 오류다. icon-font는 이름 클래스가 정확히 하나, 표정 클래스는 하나 이하여야 하고, 그 이름이 해당 표정을 가져야 한다. 아이콘(svg.icon·use가 있는 svg·.icon-font)은 자신이나 조상에 aria-hidden="true"가 있어야 한다(svg는 role="img"와 이름도 허용). use 없이 path 등으로 직접 그린 인라인 svg는 경고다(로고·차트·지도·엠블럼 클래스, 이름 있는 큰 그림은 면제, 문서·아이콘 시연 페이지는 보지 않는다). 같은 목록·내비게이션·툴바 안에서 slim·regular·bold 표정을 섞으면 경고다(fill은 선택 상태 표시용).

**금지 예시**

```html
<svg viewBox="0 0 20 20"><path fill="#333" d="..."/></svg>   // 카탈로그 밖 임의 SVG — 뷰박스·색이 세트와 어긋난다
<span class="icon-font icon-font--search"></span>   // aria-hidden이 없다 — 스크린리더가 코드포인트를 읽는다
<button class="btn btn--text"><span class="icon-font icon-font--close" aria-hidden="true"></span></button>   // 아이콘만 있는데 버튼에 이름이 없다 — 무슨 버튼인지 알 수 없다
<span class="icon-font icon-font--magnifier" aria-hidden="true"></span>   // 대장에 없는 이름 — 아무것도 안 나온다
<svg class="icon icon--bold" aria-hidden="true"><use href="/assets/icons/sprite.svg#search"></use></svg>   // SVG에서 표정은 클래스가 아니라 스프라이트 파일이 정한다 — 이 클래스는 아무 일도 안 하고 기본 굵기가 나온다
<span class="icon-font icon-font--fill icon-font--search" aria-hidden="true"></span>   // 돋보기는 채울 면이 없어 필이 없다 — 빈 네모가 나온다. 그 아이콘이 가진 표정만 쓴다
<svg class="icon"><use href="assets/icons/sprite.svg#search"></use></svg>   // aria-hidden 없음 — error
<svg viewBox="0 0 24 24"><path d="M3 3h18"/></svg>   // 직접 그린 svg — warn
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

## R-30 — 링크는 실제 목적지와 그 목적지를 말하는 이름을 가진다 — 빈 값·#·javascript: 금지, 더보기만인 이름 경고

**심각도:** `error` &nbsp; **검증:** check-html-structure.js

> 국내 웹 96곳 중 javascript: 링크 55%, 빈 # 65%가 관찰된 관행이지만 WCAG 4.1.2(이름·역할·값)를 어기고 새 탭·북마크·공유가 안 된다. 이동은 실제 주소의 a, 동작(열기·닫기·토글·더보기)은 button으로 쓴다. href가 빈 값·'#'·'#none'·'#;'이거나 javascript:로 시작하면 오류다(scripts/lib/page-rules.js isDeadHref). '#top'·실제 앵커(#main)는 통과, 템플릿 식({{ url }})은 렌더할 때 정해지므로 보지 않는다. 스니펫·플레이그라운드·문서 예시까지 모든 마크업에 적용한다(반례 문서는 기존 제외 경로). 이름 경고(scripts/lib/content-quality.js): 접근 가능한 이름(aria-labelledby → aria-label → 글·sr-only·img alt)에서 장식 기호를 지운 결과가 '더보기'·'자세히'·'바로가기'·'VIEW MORE'·'Learn more' 같은 말뿐이면 경고, 문서 하나 안에서 같은 이름의 링크가 서로 다른 목적지(끝 슬래시·index.html·#조각은 같게 봄)로 가면 경고다. 숫자만인 이름(페이지 번호)과 button은 보지 않는다. 이 경고는 스니펫·플레이그라운드·납품 페이지에만 쓴다.

**금지 예시**

```html
<a href="#" class="more">더보기</a>   // 동작을 링크로
<a href="javascript:void(0)">닫기</a>   // javascript: 링크
```

**올바른 형식**

```html
<a href="/notice">공지사항 더보기</a>   // 이동은 실제 주소
<button type="button" aria-expanded="false">펼치기</button>   // 동작은 button
```

**참고:** references/korean-web-patterns.md, scripts/lib/page-rules.js

---

## R-32 — 푸터에 KRDS 명칭 '개인정보 처리방침' 링크를 실제 주소로 둔다 — 옛 명칭 금지, 강조는 그 링크에만

**심각도:** `error` &nbsp; **검증:** check-html-structure.js

> KRDS component_02_04는 개인정보 처리방침을 반드시 공개하고 반드시 '개인정보 처리방침'이라는 명칭을 쓰라고 한다(붙여 쓴 표기도 인정). 납품 페이지와 boilerplate 스니펫의 footer#footer를 본다(scripts/lib/page-rules.js). (1) 글이 '개인정보 처리방침'인 링크가 없거나 모두 주소가 비었으면(#·javascript:) 오류 — sr-only '(새 창)' 안내는 붙어도 된다. (2) 푸터 링크의 옛 명칭(개인정보취급방침·개인정보 보호정책·Privacy Policy)은 오류. (3) site-footer__link--important가 다른 링크에 붙으면 경고. (4) infoux.json profile이 commerce-reservation이면 이용약관 링크·상호·대표자·사업자등록번호·통신판매업 신고가 없을 때 경고(전자상거래 여부는 검사기가 모른다). 한국어가 아닌 lang의 푸터, 푸터 없는 조각, 사이트 문서의 '...' 골격은 대상이 아니다. 법정 값이 진짜인지는 R-23이 본다.

**금지 예시**

```html
<footer id="footer"><div class="container"><small>© 2026 제주특별자치도</small></div></footer>   // 정책 링크 없음
<a href="#">개인정보 처리방침</a>   // 주소 없음
<a href="/privacy">개인정보취급방침</a>   // 옛 명칭
```

**올바른 형식**

```html
<nav aria-label="약관 및 정책"><a class="site-footer__link site-footer__link--important" href="/privacy">개인정보 처리방침</a></nav>   // KRDS 명칭 + 실제 주소 + 강조 하나
```

**참고:** src/snippets/footer.md, scripts/lib/page-rules.js

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

## R-39 — main 안 h1은 하나, 제목 단계를 건너뛰지 않는다

**심각도:** `error` &nbsp; **검증:** check-html-structure.js

> 페이지 제목 h1은 하나이고 제목은 한 단계씩 내려간다(accessibility.md 제목 구조, WCAG 1.3.1). 납품 페이지·boilerplate의 main 안 제목 수열(h1~h6, role=heading aria-level — 대화상자·숨김·template·nav 안은 제외)에서 h1이 2개 이상이거나 h2 다음 h4처럼 2단계 이상 깊어지면 오류다. 크기는 클래스로 정하고 제목 단계로 정하지 않는다. main 밖 h1(헤더 로고)은 경고, aria-label 없는 섹션의 이름이 카드·목록 항목 안 제목뿐이면 경고다. main 안 h1 없음·첫 제목이 h1이 아님은 R-41이 본다(사이드 메뉴 nav의 제목은 앞에 와도 된다 — KRDS D1).

**금지 예시**

```html
<h1>공지사항</h1><h3>필터</h3>   // h2 건너뜀
<header><h1 class="site-header__logo">기관명</h1></header>   // 로고 h1(경고)
```

**올바른 형식**

```html
<h1>공지사항</h1><h2>목록</h2><h3>필터</h3>   // 한 단계씩
```

**참고:** references/accessibility.md, scripts/lib/page-rules.js

---

## R-40 — 공공 화면은 모든 페이지 헤더에 통합검색을 두고, 공공 메인은 첫 화면에 과업 진입을 두며 마케팅 템플릿 섹션을 쓰지 않는다

**심각도:** `error` &nbsp; **검증:** check-html-structure.js

> KRDS 검색 패턴의 [필수] 문단은 '서비스 내 모든 화면에서 통합 검색 기능을 실행할 수 있도록 한다', 방문 패턴의 [필수]는 '시급하거나 중요한 정보를 빠르게 인지'하게 하라는 것이다. infoux.json profile이 public-service·public-institution일 때: (1) header#header가 있는 납품 페이지의 헤더 안에 search 요소, form[role=search], input[type=search], 또는 접근 가능한 이름(aria-label·sr-only 포함)이 '검색·통합검색·Search'인 버튼·링크가 없으면 오류(아이콘 검색 버튼도 이름이 있으면 인정, 헤더 없는 팝업은 대상 아님). infoux.json pageTypes에 main으로 선언한 페이지는 (2) main의 첫 콘텐츠 2개 섹션(도입부·hero-bleed 제외, 도입부에 검색을 결합했으면 인정) 안에 검색 폼, 공지(section--notice·search·shortcut에 실제 링크 3개, 또는 목록·표에 링크 3개와 날짜 3개), 자주 찾는 서비스(이름 있는 nav·목록에 링크 4개, 카드 안 링크 제외) 중 하나가 없으면 경고, (3) h1~h3가 고객 후기·이용자 후기·Features·Testimonials·Pricing·요금 플랜·핵심 기능·함께하는 파트너면 오류다('숫자로 보는', 공공요금 '요금제', FAQ는 대상 아님). 일반·커머스 메인은 레시피(KR-MAIN-CORP·COMMERCE)가 달라 보지 않는다.

**금지 예시**

```html
<header id="header"><div class="container"><a href="/">제주특별자치도</a></div></header>   // 공공 화면 헤더에 검색 진입 없음
```

**올바른 형식**

```html
<form role="search" action="/search"><label for="q">통합검색</label><input id="q" type="search" name="q"><button type="submit">검색</button></form>   // 헤더 통합검색
```

**참고:** src/snippets/header.md, scripts/lib/page-rules.js

---

## R-41 — 브레드크럼·사이드 메뉴는 본문 바로가기 목적지 밖, main 첫 제목은 h1, 3단계 이상 서브는 브레드크럼, 서브 첫 섹션은 비주얼 히어로가 아니다

**심각도:** `error` &nbsp; **검증:** check-html-structure.js

> KRDS component_03_01은 본문 바로가기 목적지 안에 사이드 메뉴·브레드크럼·페이지 유틸리티를 두지 말라고 한다. 목적지는 skip 링크 href가 가리키는 요소(없으면 main)다 — 브레드크럼을 main의 형제로 두거나(#main), main 안이라도 목적지(#contents) 밖이면 통과한다. 타이틀 밴드 안에 브레드크럼을 넣는 관행은 오류다. main 안의 첫 제목(대화상자·hidden·template·aria-hidden 안 제외)이 h1이 아니거나 h1이 없으면 오류다. infoux.json pageTypes에 main·error가 아닌 유형으로 선언한 서브 페이지는 (1) depth(홈 = 1인 메뉴 단계)가 3 이상인데 nav.breadcrumb[aria-label]과 aria-current="page" 항목이 없으면 공공 프로필 오류·그 밖 경고(KRDS: 2단계 이하는 생략 가능), (4) main 첫 섹션이 hero-bleed면 공공·관리자 오류·그 밖 경고, 화면 높이(min-h-screen·dvh·vh·30rem 이상) 섹션이면 경고다. 유형·깊이는 경로로 추측하지 않는다 — 선언이 없으면 (1)(4)를 보지 않는다.

**금지 예시**

```html
<main id="main"><section class="section section--intro"><div class="container"><nav class="breadcrumb" aria-label="페이지 경로">…</nav><h1>공지사항</h1></div></section></main>   // 브레드크럼이 목적지 안
<main id="main"><section><div class="container"><h2>알림마당</h2></div></section></main>   // main 첫 제목이 h2
```

**올바른 형식**

```html
<nav class="breadcrumb" aria-label="페이지 경로">…</nav>
<main id="main"><section class="section section--content"><div class="container"><h1>공지사항</h1></div></section></main>   // 브레드크럼은 main의 형제, main은 h1로 시작
```

**참고:** src/snippets/breadcrumb.md, scripts/lib/page-rules.js

---

## R-42 — 메인 히어로는 하나·첫 섹션, utility 등급은 히어로를 쓰지 않고, 화면 높이·스크롤 유도 큐를 두지 않는다

**심각도:** `error` &nbsp; **검증:** check-html-structure.js

> art-direction 표현 등급은 공공·업무 화면의 hero를 화면 1/2 이하로 두고, 화면 가득한 히어로 + 튀는 화살표는 AI 히어로 서명(AP-7)이다. 납품 페이지·boilerplate의 main을 본다(scripts/lib/page-rules.js). (1) hero-bleed가 2개 이상이거나 main의 첫 섹션(앞의 notice-bar는 건너뜀)이 아니면 오류 — 사이 변주는 section-media다. (2) infoux.json profile의 표현 등급이 utility(cms-admin)인데 첫 섹션이 hero-bleed·캐러셀이면 오류. (3) 도입부(첫 섹션·section--intro·hero-bleed·hero 클래스)와 그 자손에 (min-)h-screen·dvh·svh·lvh, 50vh를 넘는 h-[Nvh]·style height가 있으면 restrained·utility 오류, expressive 경고(프로필 없으면 경고). (4) 도입부의 animate-bounce, 화살표 글리프만 있거나 이름이 '스크롤·scroll·아래로'인 링크·버튼·span(펼침 토글 제외)은 오류. (5) 도입부 btn--primary 2개 이상은 경고(전환 CTA 1개). 렌더 높이 비율 판정은 하지 않는다.

**금지 예시**

```html
<section class="section section--intro h-screen">…<span class="animate-bounce" aria-hidden="true">↓</span></section>   // 화면 높이 + 스크롤 큐
<section class="section section--content hero-bleed">…</section>   // 중간 섹션 히어로
```

**올바른 형식**

```html
<section class="section section--intro hero-bleed hero-bleed--scrim" aria-labelledby="t">…<a class="btn btn--primary btn--large" href="/program">프로그램 신청하기</a></section>   // 첫 섹션 히어로 하나, CTA 하나
```

**참고:** references/art-direction.md, src/snippets/hero-bleed.md, scripts/lib/page-rules.js

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

## R-44 — 근거 없는 최상급·공공 화면의 성과 홍보 어조와 해요체·경어 혼용을 경고한다

**심각도:** warn &nbsp; **검증:** check-violations.js

> art-direction 카피 톤은 일반사이트 합쇼체 기본, 공공서비스 합쇼체 고정, 공공기관 성과 홍보 어조 금지, 커머스 근거 없는 최상급 금지다(infoUX 판단 — KRDS에는 문체 규정이 없어 경고로 둔다). 문구 덩어리 단위로 본다(scripts/lib/copy-rules.js, 사이트 문서 제외). (1) 혁신적·최고의·최상의·차별화된·압도적·독보적·완벽한·게임 체인저·새로운 경험/기준/차원·스마트한이 제목·도입부·캐러셀에 나오면 경고, 차세대·원스톱·최적의를 포함한 최상급이 페이지에 2회 이상이면 경고('최고의결기구'는 아니다). (2) 공공 프로필의 제목·도입부·캐러셀이 선도하는·도약·글로벌 리더/허브·세계 최고/일류·대한민국 대표·새로운 미래·비전 20XX·함께 만들어 가는이면 경고(청년도약계좌·글로벌허브도시·대한민국 대표 축제, h1이 비전·경영목표인 페이지는 제외). (3) 공공 프로필의 서술형 해요체(~어요·~예요·~네요·~죠, 문장 단위)는 경고 — '~세요'는 R-43, '~나요·~까요' 의문형과 버튼·링크의 한 단어 레이블은 제외. 그 밖의 프로필은 합쇼체와 해요체가 한 페이지에 각각 3문장 이상 섞이면 경고. 고유 문구는 copy-lexicon allow·infoux.json copyAllow로 뺀다.

**금지 예시**

```html
<h2>혁신적인 원스톱 행정 서비스</h2>   // 제목의 최상급
<p>신청서는 온라인으로 낼 수 있어요.</p>   // 공공 화면 해요체
```

**올바른 형식**

```html
<h2>민원 신청과 처리 현황 조회</h2>   // 사실 서술
<p>신청서는 온라인으로 낼 수 있습니다.</p>   // 합쇼체
```

**참고:** references/art-direction.md, scripts/lib/copy-rules.js

---

## R-45 — 한국어 화면의 영문 전용 UI 레이블, lang 없는 언어 링크, 고르기만 해도 이동하는 select를 쓰지 않는다

**심각도:** `error` &nbsp; **검증:** check-html-structure.js

> KRDS 컴포넌트 레이블은 '더보기'·'전체메뉴'처럼 모두 국문이다. 'VIEW MORE +'·'Read more'는 해외 템플릿을 옮긴 흔적이다. 모든 마크업에서(scripts/lib/page-rules.js, 문서 lang이 한국어가 아니면 보지 않는다): (1) a·button의 보이는 글이나 aria-label이 view more·view all·read more·learn more·see more·more·details·skip to content·sign in·log in·sign up·contact us·menu·home이면 오류 — 링크·버튼 자신의 lang="en"으로는 면제되지 않고 lang이 한국어가 아닌 section·article·blockquote 안, 코드, 플레이그라운드 데모(pg__)만 면제한다. (3) 언어명 링크(English·ENG·EN·中文·日本語…)에 lang이 없거나 언어와 맞지 않으면 오류(WCAG 3.1.2, hreflang은 권장). (4) onchange가 location·href·submit()·window.open인 select는 오류(WCAG 3.2.2 — 패밀리 사이트·언어 선택은 별도 [이동] 버튼). 경고: (2) 주 메뉴(.main-menu, aria-label '주 메뉴·메인 메뉴') 항목이 모두 영문, (6) 제목 위 영문 대문자 eyebrow(class eyebrow·kicker·overline 또는 두 낱말 이상의 대문자, 배지·태그·약어 제외)와 영문 전용 h1~h3(FAQ 제외) — 이 둘은 사이트 문서(site/**)에서 보지 않는다. 용어 사전 대조와 날짜·금액 표기 혼용은 아직 기계화하지 않았다.

**금지 예시**

```html
<a href="/news">VIEW MORE +</a>   // 영문 전용 레이블
<a href="/en/" hreflang="en">English</a>   // lang 없음
<select onchange="location.href=this.value">…</select>   // 선택만으로 이동
```

**올바른 형식**

```html
<a href="/news">새소식 더보기</a>   // 국문 레이블
<a href="/en/" lang="en" hreflang="en">English</a>   // 언어 링크
```

**참고:** references/korean-web-patterns.md, scripts/lib/page-rules.js

---

## R-46 — publicIdentity가 required로 확정되지 않으면 공식 배너·운영기관 식별자·정부 상징을 만들지 않는다

**심각도:** `error` &nbsp; **검증:** check-html-structure.js

> 공식 배너('이 누리집은 대한민국 공식 전자정부 누리집입니다')·운영기관 식별자·정부 상징은 정부·관련 기관이 운영하는 공식 디지털 정부서비스만 쓴다(KRDS 공식 배너·운영기관 식별자). AI가 공공 '느낌'을 내려고 아무 사이트에나 붙이면 사칭이 된다. 권한은 infoux.json publicIdentity만 갖는다(없으면 unconfirmed — 페이지 안 표기로 스스로 선언할 수 없다). 납품 페이지·boilerplate에서 required가 아니면 .masthead·.identifier 블록, 정부 상징 이미지(alt '정부 상징·대한민국 정부 로고·대한민국 정부', src gov-symbol·gov-emblem·korea-gov-logo), 공식 배너 문구 전체는 오류, 문구 일부('공식 전자정부 누리집')와 운영기관 식별자 문구는 경고다. required면 공식 배너가 없거나 건너뛰기 링크 바로 다음(앞에는 배너의 조상만)이 아니면 오류, .identifier가 footer#footer 밖이면 오류다(scripts/lib/page-rules.js).

**금지 예시**

```html
<div class="masthead">이 누리집은 대한민국 공식 전자정부 누리집입니다.</div>   // publicIdentity 미확정
```

**올바른 형식**

```html
{ "publicIdentity": "required" }  // infoux.json — 공식 서비스로 확인된 뒤   // 확정 후에만 공식 배너
```

**참고:** references/project-profiles.md, scripts/lib/page-rules.js

---

## R-47 — 개인정보 수집 폼은 동의 옆에 목적·항목·보유 기간·거부권을 알리고, 동의를 미리 체크하지 않으며, 주민등록번호를 받지 않는다

**심각도:** `error` &nbsp; **검증:** check-html-structure.js

> 개인정보 보호법은 동의를 받을 때 수집·이용 목적, 수집 항목, 보유·이용 기간, 동의 거부 권리와 불이익을 알리게 하고, 주민등록번호는 법령 근거가 있을 때만 처리하게 한다. KRDS 개인 식별 정보 입력 패턴은 '수집이 필요한지 확인한다'를 요구한다. 모든 마크업의 native form에서(scripts/lib/page-rules.js): 개인정보 입력(type=tel·email, autocomplete name·tel·email·bday 계열, name·id 토큰 name·phone·mobile·tel·email·birth, 이름·성명·휴대·연락처·이메일·생년)과 개인정보 동의 체크박스·라디오(레이블·legend·aria-describedby 글에 개인정보·수집·제3자 제공·위탁 + 동의)가 함께 있으면, 동의 fieldset(없으면 form)과 그 안의 aria-describedby·aria-controls·#링크·모달이 가리키는 글에 목적·항목·보유(보관·보존·이용 기간)·거부(동의하지 않을)가 모두 있어야 한다 — 없으면 오류, 다른 문서로 가는 약관 링크가 있으면 경고. 개인정보 입력이 있는 폼에서 '동의'를 뜻하는 체크박스·라디오(마케팅 수신 포함, '동의하지 않음' 제외)가 미리 체크돼 있으면 오류. name·id·autocomplete·placeholder·레이블에 주민등록번호·rrn·ssn·jumin·resident-no가 있으면 오류(레이블이 '아님·받지 않습니다' 같은 부정 문맥이면 제외). 고지 값은 발주처 개인정보 처리방침·contentSources에서 가져오고 지어내지 않는다(R-23). 법령 근거가 있는 주민등록번호 처리의 면제 경로는 아직 없다. 법령이 주민등록번호 처리를 요구·허용하는 경우(개인정보 보호법 제24조의2)만 infoux.json exceptions에 { rule: 'R-47', reason, legalBasis: '법령 조항', owner, expires }를 적는다 — 만료 전이면 이 입력을 경고로 낮춘다(scripts/lib/contract-exceptions.js rrnLegalBasis). 근거 조항 없는 예외는 인정하지 않고, 만료·형식 오류는 npm run check:release(CT-03)가 막는다.

**금지 예시**

```html
<input type="checkbox" id="ag" checked><label for="ag">개인정보 수집·이용에 동의합니다</label>   // 미리 체크·고지 없음
<label for="r">주민등록번호</label><input id="r" name="rrn">   // 주민등록번호 수집
```

**올바른 형식**

```html
<fieldset><legend>개인정보 수집·이용 동의</legend><p>수집 목적·항목·보유 기간·동의 거부 권리(처리방침 원문)</p><input type="checkbox" id="ag"><label for="ag">개인정보 수집·이용에 동의합니다</label></fieldset>   // 4요소 고지 + 직접 선택
```

**참고:** references/workflows/design-form.md, scripts/lib/page-rules.js

---

## R-50 — placeholder에는 예시만 둔다 — '내용을 입력하세요' 같은 빈 안내와 레이블 반복은 경고

**심각도:** warn &nbsp; **검증:** check-html-structure.js

> placeholder는 입력하면 사라지고 대비가 낮아 안내를 맡길 수 없다. '내용을 입력하세요'·'입력해 주십시오'처럼 아무 정보도 없는 안내와, 연결된 레이블(필수 표시 * 제외)을 되풀이할 뿐인 placeholder는 경고다(scripts/lib/content-quality.js placeholderFindings). '{레이블}을 입력하세요'는 microcopy 기준(site/design/microcopy.md)이 허용하므로 걸지 않는다. 형식 안내는 '예: 2026-11-03' 같은 예시로, 설명은 form-field__hint와 aria-describedby로 준다. 근거는 KRDS가 아니라 팀 마이크로카피 기준이다. 스니펫·플레이그라운드·납품 페이지에만 쓴다.

**금지 예시**

```html
<textarea id="memo" placeholder="내용을 입력하세요"></textarea>   // 빈 안내
<label for="email">이메일*</label><input id="email" placeholder="이메일">   // 레이블 반복
```

**올바른 형식**

```html
<label for="visit">방문일</label><input id="visit" placeholder="예: 2026-11-03">   // 예시만
```

**참고:** site/design/microcopy.md, scripts/lib/content-quality.js

---

## R-51 — 템플릿 장식 서명 — 제목 위 eyebrow, 순서가 아닌 01·02 장식 번호, 모든 섹션 등장 효과, 색 있는 굵은 옆선은 경고

**심각도:** warn &nbsp; **검증:** check-html-structure.js · check-violations.js

> 어떤 LLM이 만들어도 AI 템플릿 티가 나지 않게, 생성 페이지가 습관처럼 붙이는 장식을 기계로 짚는다. 출처는 Impeccable(pbakaus/impeccable, Apache 2.0)의 craft-floor 금지 목록과 Anthropic frontend-design 스킬이 꼽은 '생성 페이지의 흔한 서명'이다. 원칙은 셋이다 — 제목은 스스로 무게를 가져야 하고(그 위에 분류 꼬리표를 얹어 무게를 빌리지 않는다), 번호는 순서가 정보일 때만 쓰며, 등장 효과는 한 화면에 한 번 의도한 순간에만 둔다. 검출(scripts/lib/template-signature.js): (1) class 조각에 eyebrow·kicker가 든 요소, h2~h3 바로 앞 형제가 20자 이하 짧은 글만 든 p·span이고 class가 __label·__category로 끝나는 경우. 영문 대문자 eyebrow는 R-45도 따로 경고한다. (2) ol 밖에서 글이 01~09(뒤에 공백·끝·마침표)로 시작하는 요소와 class에 __index·__number·__num이 든 요소 — ol·li 안, step-indicator·pagination·calendar 블록, 표 칸, time·code는 뺀다. (3) main 안 section 3개 이상에 data-reveal·data-aos·data-animate 속성이나 reveal·fade-up·animate-on-scroll class가 있으면 문서당 1건 — 기능형 화면의 스크롤 진입 모션 자체는 R-22가 다룬다. (4) 링크·버튼 끝의 → ➜ » ▶ 화살표 글리프는 R-36이 이미 경고하므로 여기서 다시 보지 않는다. (5) CSS·<style>·class의 border-left·border-right(inline-start·inline-end 포함) 폭 1px 초과 + 색 지정, Tailwind border-l-2~8·border-l-[…]·border-r-*·border-s-*·border-e-*·[border-left:…] — 카드·목록·인용·알림에 흔한 강조선이다. 현재 위치 표시(.tab·.main-menu·.side-navigation·.breadcrumb·aria-current·--current), 입력 오류 표시(.form-field·.input·aria-invalid·--error), blockquote, 회전으로 그린 셰브런은 뺀다. 오탐 위험이 있어 모두 경고이고, 의도한 표현이면 남겨도 된다. 마크업은 스니펫·플레이그라운드·납품 페이지에, CSS는 스타일 파일(docs.css 제외)과 스니펫 css 펜스에 쓴다.

**금지 예시**

```html
<p class="feature__eyebrow">주요 서비스</p>
<h2 class="feature__title">민원을 한곳에서</h2>   // 제목 위 분류 표지
<div class="benefit"><span class="benefit__number">01</span><h3>간편 신청</h3></div>   // 순서가 아닌 장식 번호
<main><section data-aos="fade-up">…</section><section data-aos="fade-up">…</section><section data-aos="fade-up">…</section></main>   // 모든 섹션 등장 효과
.notice-card { border-left: 4px solid var(--color-primary); }   // 색 있는 굵은 옆선
```

**올바른 형식**

```html
<h2 class="section__title">자주 찾는 민원</h2>   // 제목이 스스로 무게를 갖는다
<ol class="step-indicator"><li class="step-indicator__item" aria-current="step"><span class="step-indicator__num" aria-hidden="true">1</span>신청서 작성</li></ol>   // 순서가 정보인 번호
.side-navigation__link[aria-current="page"] { border-left: 4px solid var(--color-primary); }   // 현재 위치 표시
```

**참고:** scripts/lib/template-signature.js, https://github.com/pbakaus/impeccable

---
