---
title: CSS 규칙
order: 2
---

<!-- 자동 생성 — rules.json에서 생성됨. 직접 수정 금지. npm run build:rules로 갱신. -->

CSS 파일 작성 시 적용되는 값·문법 규칙이다. Tailwind v4 + KRDS 토큰 기반.

## 규칙 요약

| ID | 규칙 | 심각도 | 검증 |
|----|------|--------|------|
| R-01 | 모든 색상/간격/크기는 var(--token) 사용 — 하드코딩 금지 | error | check-violations.js |
| R-02 | !important 사용 금지 — 부득이한 경우 주석으로 사유 필수 | warning | check-violations.js |
| R-03 | SCSS 사용 금지 — Tailwind v4 + CSS Custom Properties만 허용 | error | check-violations.js |

---

## R-01 — 모든 색상/간격/크기는 var(--token) 사용 — 하드코딩 금지

**심각도:** 🔴 error &nbsp; **검증:** check-violations.js

> 디자인 토큰으로 일관성을 유지하고 프로젝트별 테마 오버라이드를 가능하게 한다. 하드코딩 값은 토큰 변경 시 일일이 찾아 고쳐야 하는 기술 부채다. KRDS 토큰(`--krds-*`)과 INFOMIND 시맨틱 별칭(`--color-*`/`--spacing-*` 등) 양쪽을 사용할 수 있다.

**❌ 금지**

```css
color: #256ef4;   // 하드코딩 색상
background: #f8f8f8;   // 하드코딩 색상
padding: 16px;   // 하드코딩 간격
gap: 8px;   // 하드코딩 간격
```

**✅ 올바른 형식**

```css
color: var(--krds-light-color-primary);   // KRDS 정본 토큰
color: var(--color-primary);   // INFOMIND 시맨틱 별칭 (KRDS 토큰을 가리킴)
padding: var(--krds-padding-5);   // KRDS spacing 스케일
gap: var(--spacing-4);   // INFOMIND 시맨틱 별칭
```

**참고:** tokens/krds-base.json, tokens/infomind-overrides.json, tokens/build/tokens.css

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
.pagefind-ui__input { font-size: var(--krds-font-size-7) !important; /* pagefind 인라인 스타일 오버라이드 */ }   // 사유 주석 명시
```

---

## R-03 — SCSS 사용 금지 — Tailwind v4 + CSS Custom Properties만 허용

**심각도:** 🔴 error &nbsp; **검증:** check-violations.js

> 프로젝트는 KRDS+Tailwind v4 마이그레이션으로 SCSS 빌드 파이프라인을 폐기했다. .scss 확장자, @use/@forward, SCSS 변수($var), SCSS 전용 함수/믹스인 사용을 금지한다. 토큰은 tokens/build/tokens.css(`@theme` + CSS Custom Properties)로 발행되며 모든 스타일은 표준 CSS만 사용한다.

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
@import "tailwindcss";   // Tailwind v4 import
@import "../../tokens/build/tokens.css";   // 토큰 import
:root { --color-primary: var(--krds-light-color-primary); }   // CSS Custom Property
```

**참고:** src/styles/style.css, tokens/build/tokens.css

---
