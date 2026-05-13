---
title: CSS 규칙
order: 2
---

<!-- 자동 생성 — rules.json에서 생성됨. 직접 수정 금지. npm run build:rules로 갱신. -->

CSS 파일 작성 시 적용되는 값·문법 규칙이다. Tailwind v4 + INFOUX 토큰 기반.

## 규칙 요약

| ID | 규칙 | 심각도 | 검증 |
|----|------|--------|------|
| R-01 | 색상은 var(--token) 강제 — 간격/크기/타이포 스케일은 권장 | error | check-violations.js |
| R-02 | !important 사용 금지 — 부득이한 경우 주석으로 사유 필수 | warning | check-violations.js |
| R-03 | SCSS 사용 금지 — 표준 CSS nesting + Tailwind v4 문법 허용 | error | check-violations.js |
| R-19 | 스타일 CSS는 Tailwind v4 @apply 우선 — 토큰 값은 var(--token) 유지 | error | check-violations.js |

---

## R-01 — 색상은 var(--token) 강제 — 간격/크기/타이포 스케일은 권장

**심각도:** 🔴 error &nbsp; **검증:** check-violations.js

> 색상은 브랜드·상태·접근성·테마 변경의 영향이 크므로 반드시 토큰으로 관리한다. 반면 간격·크기·타이포 스케일은 KRDS 값을 참고하되 프로젝트 성격에 맞게 조정할 수 있다. 특히 CMS/관리자 화면은 정보 밀도와 반복 작업 효율이 중요하므로 KRDS 수치 체계를 그대로 강제하지 않는다.

**❌ 금지**

```css
color: #256ef4;   // 하드코딩 색상
background: #f8f8f8;   // 하드코딩 색상
color: rgb(37, 110, 244);   // 하드코딩 색상
```

**✅ 올바른 형식**

```css
color: var(--color-primary);   // INFOUX 공개 토큰
color: var(--color-primary);   // INFOMIND 시맨틱 별칭 (INFOUX 토큰을 가리킴)
padding: 16px;   // 프로젝트 맥락상 명확한 간격값은 허용
gap: 1.6rem;   // 반복 패턴에는 INFOMIND 간격 별칭 권장
```

**참고:** tokens/foundation.json, tokens/foundation.json, tokens/build/tokens.css

---

## R-02 — !important 사용 금지 — 부득이한 경우 주석으로 사유 필수

**심각도:** 🟡 warning &nbsp; **검증:** check-violations.js

> 캐스케이드 우선순위를 강제 무력화하여 이후 오버라이드를 불가능하게 만든다. 외부 라이브러리 인라인 스타일을 덮어야 하는 등 불가피한 경우에만 허용하며 반드시 사유를 주석으로 명시한다.

**❌ 금지**

```css
.element { color: var(--color-primary) !important; }   // 사유 없는 !important
```

**✅ 올바른 형식**

```css
.pagefind-ui__input { font-size: 1.7rem !important; /* pagefind 인라인 스타일 오버라이드 */ }   // 사유 주석 명시
```

---

## R-03 — SCSS 사용 금지 — 표준 CSS nesting + Tailwind v4 문법 허용

**심각도:** 🔴 error &nbsp; **검증:** check-violations.js

> 프로젝트는 SCSS 빌드 파이프라인을 사용하지 않는다. .scss 확장자, @use/@forward, SCSS 변수($var), SCSS 전용 함수/믹스인 사용을 금지한다. 단, 표준 CSS nesting과 Tailwind v4의 @theme/@apply/@utility 등 CSS 기반 문법은 허용한다.

**❌ 금지**

```css
/* style.scss */   // .scss 확장자 — 빌드 파이프라인 없음
@use '../1-settings' as settings;   // Dart Sass @use
@forward 'btn';   // Dart Sass @forward
$primary: #256ef4;   // SCSS 변수
```

**✅ 올바른 형식**

```css
/* style.css */   // .css 확장자만
.card { &__title { color: var(--color-text); } }   // 표준 CSS nesting
.btn { @apply inline-flex items-center; }   // Tailwind @apply
@import "tailwindcss";   // Tailwind v4 import
```

**참고:** src/styles/style.css, tokens/build/tokens.css

---

## R-19 — 스타일 CSS는 Tailwind v4 @apply 우선 — 토큰 값은 var(--token) 유지

**심각도:** 🔴 error &nbsp; **검증:** check-violations.js

> 반복되는 레이아웃, 정렬, 표시 상태, 커서, overflow 같은 유틸리티 성격의 선언은 Tailwind v4 @apply로 작성해 CSS 구조를 간결하게 유지한다. 색상, 간격, 크기, radius, shadow, typography처럼 KRDS/INFOMIND 토큰 의미가 중요한 값은 Tailwind 기본 유틸로 억지 변환하지 않고 var(--token)을 유지한다.

**❌ 금지**

```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}   // @apply로 표현 가능한 raw utility 선언
```

**✅ 올바른 형식**

```css
.btn {
  @apply inline-flex items-center justify-center;
  color: var(--color-text);
}   // 유틸은 @apply, 토큰 값은 var() 유지
.card {
  @apply relative overflow-hidden;
  border-radius: 0.6rem;
}   // 구조 유틸과 INFOUX 토큰 병행
```

**참고:** src/styles/**/*.css, starter/src/styles/**/*.css

---
