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
| R-15 | 컴포넌트 root 태그는 html-semantics.md 매핑을 따른다 | error | check-html-structure.js |

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

## R-15 — 컴포넌트 root 태그는 html-semantics.md 매핑을 따른다

**심각도:** 🔴 error &nbsp; **검증:** check-html-structure.js

> KRDS 28종 컴포넌트는 시맨틱 의미가 정해져 있다. 같은 BEM Block을 다른 root 태그로 쓰면 검색/스크린리더/SEO 일관성이 깨진다. 단일 매핑 표(`skill/references/html-semantics.md`)가 정답을 정의하고, 임의 변경은 UX팀 결정 절차를 거친다. WAI-ARIA 1st rule: 네이티브 시맨틱이 가능하면 그것을 쓴다.

**❌ 금지**

```html
<div class="card">...</div>   // card는 <article> 또는 <section>이어야 함
<div class="modal">...</div>   // modal은 <dialog> 또는 <div role="dialog" aria-modal="true">
<div class="breadcrumb">...</div>   // breadcrumb는 <nav aria-label="페이지 경로">
```

**✅ 올바른 형식**

```html
<article class="card">...</article>   // 독립 콘텐츠
<dialog class="modal">...</dialog>   // 네이티브 dialog (Safari 15.4+)
<nav class="breadcrumb" aria-label="페이지 경로"><ol>...</ol></nav>   // nav + ol
```

**참고:** skill/references/html-semantics.md, skill/references/krds-components.md

---
