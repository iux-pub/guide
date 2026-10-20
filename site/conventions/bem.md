---
title: BEM 네이밍
order: 3
---

<!-- 자동 생성 — rules.json에서 생성됨. 직접 수정 금지. npm run build:rules로 갱신. -->

CSS 클래스 명명 규칙이다. Stylelint와 check-violations.js로 자동 검증한다. 5-objects, 6-components 레이어에만 적용된다.

## 규칙 요약

| ID | 규칙 | 심각도 | 검증 |
|----|------|--------|------|
| R-04 | BEM 사용 (5-objects, 6-components 레이어에만 적용) | info | stylelint |
| R-05 | element 2단계 중첩 금지 — 평탄화 | error | check-violations.js, stylelint |
| R-06 | 시각적 modifier 금지 — 의미적 이름 사용 | error | check-violations.js |
| R-17 | 상태는 ARIA·hidden 속성을 먼저 — ARIA로 표현할 수 없을 때만 BEM modifier, .is-* / .has-* 금지 | error | check-html-structure.js |
| R-18 | modifier 이름은 허용 어휘(contracts/class-naming.json)에서 — 시각적 단어 금지 | error | check-violations.js, check-html-structure.js |

---

## R-04 — BEM 사용 (5-objects, 6-components 레이어에만 적용)

**심각도:** 🔵 info &nbsp; **검증:** stylelint

> 클래스명만으로 컴포넌트 역할과 관계를 파악할 수 있어 HTML과 CSS를 별도 탐색 없이 이해할 수 있다. 3-generic·4-elements·7-utilities 레이어는 BEM 미적용.

**❌ 금지**

```css
.btn-primary { }   // modifier 구분자 누락
.card-header { }   // element 구분자 누락
.inputBox { }   // camelCase
```

**✅ 올바른 형식**

```css
.btn--primary { }   // modifier: 이중 하이픈
.card__header { }   // element: 이중 언더스코어
.form-field__label { }   // 소문자 kebab
```

---

## R-05 — element 2단계 중첩 금지 — 평탄화

**심각도:** 🔴 error &nbsp; **검증:** check-violations.js · stylelint

> HTML 구조가 바뀌면 클래스명이 함께 깨진다. Block 기준으로 element를 평탄화하면 HTML 리팩토링에 독립적이다.

**❌ 금지**

```css
.card__header__title { }   // 2단계 element
.form-field__label__required { }   // 2단계 element
```

**✅ 올바른 형식**

```css
.card__title { }   // Block 기준 평탄화
.form-field__required { }   // Block 기준 평탄화
```

---

## R-06 — 시각적 modifier 금지 — 의미적 이름 사용

**심각도:** 🔴 error &nbsp; **검증:** check-violations.js

> 브랜드 색상이 바뀌거나 디자인이 개편되면 시각적 이름(.btn--blue)은 클래스를 전부 바꿔야 한다. 의미적 이름(.btn--primary)은 디자인 변경에 독립적이다. 허용 어휘·금지어의 정본은 contracts/class-naming.json이고 자동 검사는 R-18이 한다. 이 규칙은 KRDS에서 폐기된 옛 버튼 variant(btn--ghost·btn--outline·btn--link·btn--sm·btn--lg)를 따로 막는다 — 버튼은 KRDS 4 유형(primary·secondary·tertiary·text)과 5 크기(xsmall~xlarge)만 쓴다.

**❌ 금지**

```css
.btn--gray { }   // 색상 이름 modifier
.btn--blue { }   // 색상 이름 modifier
.text--red { }   // 색상 이름 modifier
.btn--ghost { }   // 옛 variant — KRDS에서 폐기됨
.btn--outline { }   // 옛 variant — KRDS에서 폐기됨
.btn--sm { }   // 옛 size — KRDS small/xsmall 사용
```

**✅ 올바른 형식**

```css
.btn--primary { }   // KRDS 정의 variant
.btn--secondary { }   // KRDS 정의 variant
.btn--tertiary { }   // KRDS 정의 variant
.btn--small { }   // KRDS 정의 size
.text--danger { }   // 시맨틱 상태
```

---

## R-17 — 상태는 ARIA·hidden 속성을 먼저 — ARIA로 표현할 수 없을 때만 BEM modifier, .is-* / .has-* 금지

**심각도:** 🔴 error &nbsp; **검증:** check-html-structure.js

> 상태는 먼저 ARIA·네이티브 속성(aria-expanded·aria-current·aria-selected·aria-invalid·disabled·hidden)으로 표현하고, CSS는 그 속성 선택자([aria-expanded="true"], [hidden])로 모양을 바꾼다. 의미(보조기기)와 모양이 한 속성에 묶여 어긋나지 않는다. ARIA에 대응하는 상태가 없을 때(예: 단계 표시의 done)만 BEM modifier(--done)를 쓴다. 달력의 오늘은 aria-current="date"가 있으므로 속성을 먼저 단다. 기존 CSS가 --current·--selected·--disabled 변형을 쓰는 곳은 같은 요소에 대응 속성을 함께 둔다(없으면 경고). .is-active 같은 비-BEM 클래스는 어느 블록의 상태인지 모호하고 의미가 보조기기에 전달되지 않는다.

**❌ 금지**

```html
<button class="btn is-disabled">   // .is-disabled — 비-BEM 상태 클래스
<div class="modal is-open">   // .is-open — 비-BEM 상태 클래스
<input class="input has-error">   // .has-error — 비-BEM 상태 클래스
```

**✅ 올바른 형식**

```html
<button class="btn" disabled>   // 네이티브 속성 — CSS는 .btn:disabled
<div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" hidden>   // hidden 속성으로 여닫는다 — CSS는 .modal[hidden]
<input class="input input--error" aria-invalid="true">   // ARIA(aria-invalid) + 기존 변형(--error)
<li class="step-indicator__item step-indicator__item--done">   // ARIA 대응이 없는 상태만 modifier
```

**참고:** references/class-naming.md, references/html-semantics.md#62-상태-표현-r-17

---

## R-18 — modifier 이름은 허용 어휘(contracts/class-naming.json)에서 — 시각적 단어 금지

**심각도:** 🔴 error &nbsp; **검증:** check-violations.js · check-html-structure.js

> `.btn--blue`나 `.card--big` 같은 시각적 modifier는 의미가 모양에 묶여 디자인을 바꿀 때 클래스도 바꿔야 한다. 변형 이름은 contracts/class-naming.json의 어휘 — 크기(xsmall~xlarge, KRDS)·위계(primary/secondary/tertiary/text)·상태색(info/success/warning/danger)·밀도·바탕·배치·상태·역할 — 에서 고른다. CSS에 금지어 modifier를 정의하면 error, 어휘 밖이면 warn(블록 고유 변형은 blockModifiers에 등록). 폐기 예정 이름(badge--gray → badge--neutral)을 마크업에 쓰면 warn. R-06의 자동화 버전.

**❌ 금지**

```html
<button class="btn btn--blue">   // 색을 직접 명시한 modifier
<div class="card card--big">   // 크기를 시각 단어로
<span class="tag tag--rounded">   // 장식 속성을 modifier로
```

**✅ 올바른 형식**

```html
<button class="btn btn--primary">   // KRDS variant — 의미 기반
<div class="card card--large">   // KRDS 사이즈 스케일
<span class="tag tag--info">   // 톤 — 의미 기반
```

**참고:** references/class-naming.md, contracts/class-naming.json, references/html-semantics.md#63-modifier-의미성-r-06-r-18

---
