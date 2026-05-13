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
| R-15 | HTML 기본 구조는 기존 인포마인드 사이트 패턴을 우선 유지한다 | warning | check-html-structure.js |

---

## R-07 — inline style 금지 — CSS 커스텀 프로퍼티 style="--var: val"은 허용

**심각도:** 🟡 warning &nbsp; **검증:** check-violations.js

> 스타일은 CSS 파일에서만 관리한다. 인라인 스타일은 특이도가 높아 오버라이드가 어렵고 토큰 시스템을 우회한다. CSS 커스텀 프로퍼티 주입(style="--width: 320px")은 동적 값 전달 패턴이므로 허용한다.

**❌ 금지**

```html
<div style="padding: 16px; color: #333">   // 일반 인라인 스타일
```

**✅ 올바른 형식**

```html
<div style="--card-ratio: 16/9">   // CSS 커스텀 프로퍼티만
<div class="card card--featured">   // 클래스로 스타일 적용
```

---

## R-08 — HTML 클래스에도 BEM 2단계 element 금지 (R-05 연동)

**심각도:** 🟡 warning &nbsp; **검증:** check-violations.js

> R-05와 동일 원칙. HTML 클래스가 CSS에서 정의된 것과 일치해야 한다.

**❌ 금지**

```html
<div class="card__header__title">   // 2단계 element
```

**✅ 올바른 형식**

```html
<div class="card__title">   // 평탄화
```

---

## R-09 — img alt 속성 필수

**심각도:** 🔴 error &nbsp; **검증:** check-violations.js

> 스크린 리더 사용자에게 이미지 정보를 전달한다. 장식용 이미지는 alt=""로 빈 값을 명시해 스크린 리더가 건너뛰게 한다. WCAG 1.1.1 비텍스트 콘텐츠 (A등급).

**❌ 금지**

```html
<img src="photo.jpg">   // alt 없음
```

**✅ 올바른 형식**

```html
<img src="photo.jpg" alt="제품 상세 이미지">   // 의미 있는 alt
<img src="deco.svg" alt="">   // 장식용: 빈 alt 명시
```

---

## R-10 — 인터랙티브 요소는 시맨틱 HTML 사용 — div onclick 금지

**심각도:** 🔴 error &nbsp; **검증:** check-violations.js

> div에 onclick을 붙이면 키보드 포커스가 안 되고 스크린 리더가 역할을 인식하지 못한다. 시맨틱 요소는 키보드·스크린 리더 지원이 내장되어 있다.

**❌ 금지**

```html
<div onclick="fn()">클릭</div>   // 키보드 접근 불가
```

**✅ 올바른 형식**

```html
<button type="button" onclick="fn()">클릭</button>   // 키보드·스크린 리더 지원
```

---

## R-15 — HTML 기본 구조는 기존 인포마인드 사이트 패턴을 우선 유지한다

**심각도:** 🟡 warning &nbsp; **검증:** check-html-structure.js

> 인포마인드가 기존에 구축·유지보수한 사이트들은 공통 HTML 골격, 영역 네이밍, 헤더/푸터/본문 구성 패턴을 갖고 있다. 신규 작업도 이 패턴을 우선 유지해 유지보수성과 팀 내 이해도를 확보한다. 페이지 전체 골격은 공통 레이아웃에 두고, HTML 컴포넌트화는 main 안의 section 단위로 분리한다. KRDS는 root 태그 강제가 아니라 시맨틱 HTML, 접근성 속성, 키보드 동작을 보강하는 기준으로 적용한다.

**❌ 금지**

```html
<div onclick="goPage()">이동</div>   // 기존 골격 유지와 무관하게 인터랙션을 div에 직접 부여하는 것은 금지
<div class="modal">...</div>   // dialog 역할/상태 속성 없이 모달을 구성
<div id="content"><div class="header">...</div><div class="footer">...</div></div>   // 기존 사이트 골격과 다른 임의 구조
```

**✅ 올바른 형식**

```html
<header id="header"><div class="container">...</div></header>
<main id="main">
  <section class="section">
    <div class="container">...</div>
  </section>
</main>
<footer id="footer"><div class="container">...</div></footer>   // 큰 영역은 단순하게 잡고 main 안은 section 단위, 각 section 안의 .container가 폭과 정렬 담당
<div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">...</div>   // 기존 마크업 패턴 위에 접근성 속성 보강
<nav class="breadcrumb" aria-label="페이지 경로"><ol>...</ol></nav>   // 기존 패턴이 없거나 접근성 개선이 필요한 경우 시맨틱 태그 사용
```

**참고:** 기존 인포마인드 구축 사이트 HTML, skill/references/html-semantics.md, skill/references/krds-components.md

---
