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
