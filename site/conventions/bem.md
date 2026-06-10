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
| R-17 | 상태는 BEM modifier로만 표현 — .is-* / .has-* 비-BEM 상태 클래스 금지 | error | check-html-structure.js |
| R-18 | modifier 이름은 의미적이어야 함 — 시각적 단어 금지 | error | check-violations.js, check-html-structure.js |

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
.form__input { }   // 소문자 kebab
```

---

## R-05 — element 2단계 중첩 금지 — 평탄화

**심각도:** 🔴 error &nbsp; **검증:** check-violations.js · stylelint

> HTML 구조가 바뀌면 클래스명이 함께 깨진다. Block 기준으로 element를 평탄화하면 HTML 리팩토링에 독립적이다.

**❌ 금지**

```css
.card__header__title { }   // 2단계 element
.form__group__label { }   // 2단계 element
```

**✅ 올바른 형식**

```css
.card__title { }   // Block 기준 평탄화
.form__label { }   // Block 기준 평탄화
```

---

## R-06 — 시각적 modifier 금지 — 의미적 이름 사용

**심각도:** 🔴 error &nbsp; **검증:** check-violations.js

> 브랜드 색상이 바뀌거나 디자인이 개편되면 시각적 이름(.btn--blue)은 클래스를 전부 바꿔야 한다. 의미적 이름(.btn--primary)은 디자인 변경에 독립적이다. KRDS 표준 modifier(primary/secondary/tertiary/text/xsmall~xlarge)만 사용한다.

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

## R-17 — 상태는 BEM modifier로만 표현 — .is-* / .has-* 비-BEM 상태 클래스 금지

**심각도:** 🔴 error &nbsp; **검증:** check-html-structure.js

> BEM의 modifier가 상태 표현의 표준이며, `.is-active` 같은 비-BEM 클래스는 어느 컴포넌트의 상태인지 모호하다. ARIA 속성(`aria-selected`, `aria-expanded`)이 의미 표현을 담당하고, 시각 변화는 BEM modifier(`.tab__item--selected`)가 담당한다.

**❌ 금지**

```
<button class="btn is-disabled">   // .is-disabled — 비-BEM 상태 클래스
<div class="modal is-open">   // .is-open — 비-BEM 상태 클래스
<input class="input has-error">   // .has-error — 비-BEM 상태 클래스
```

**✅ 올바른 형식**

```html
<button class="btn" disabled aria-disabled="true">   // 네이티브 속성 + ARIA
<div class="modal modal--open" role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <h2 id="modal-title">모달 제목</h2>
</div>   // BEM modifier + ARIA
<input id="email" class="input input--error" aria-invalid="true" aria-label="이메일">   // BEM modifier + ARIA
```

**참고:** skill/references/html-semantics.md#62-상태-표현-r-17

---

## R-18 — modifier 이름은 의미적이어야 함 — 시각적 단어 금지

**심각도:** 🔴 error &nbsp; **검증:** check-violations.js · check-html-structure.js

> `.btn--blue`나 `.card--big` 같은 시각적 modifier는 의미가 시각 표현과 묶여 디자인 변경 시 클래스명도 같이 바꿔야 한다. 의미적 이름(`--primary`, `--large`)을 쓰면 색상·크기가 바뀌어도 클래스는 그대로 유지된다. KRDS 정의 variant/size 어휘만 허용. R-06의 자동화 버전.

**❌ 금지**

```
<button class="btn btn--blue">   // 색을 직접 명시한 modifier
<div class="card card--big">   // 크기를 시각 단어로
<span class="tag tag--rounded">   // 장식 속성을 modifier로
```

**✅ 올바른 형식**

```html
<button class="btn btn--primary">   // KRDS variant — 의미 기반
<article class="card card--large">   // KRDS 사이즈 스케일
<span class="tag tag--info">   // 톤 — 의미 기반
```

**참고:** skill/references/html-semantics.md#63-modifier-의미성-r-06-r-18, skill/references/krds-components.md

---
