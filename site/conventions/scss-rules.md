---
title: SCSS 규칙
order: 2
---

<!-- 자동 생성 — rules.json에서 생성됨. 직접 수정 금지. npm run build:rules로 갱신. -->

SCSS 파일 작성 시 적용되는 값·문법 규칙이다.

## 규칙 요약

| ID | 규칙 | 심각도 | 검증 |
|----|------|--------|------|
| R-01 | 모든 색상/간격/크기는 var(--token) 사용 — 하드코딩 금지 | error | check-violations.js |
| R-02 | !important 사용 금지 — 부득이한 경우 주석으로 사유 필수 | warning | check-violations.js |

---

## R-01 — 모든 색상/간격/크기는 var(--token) 사용 — 하드코딩 금지

**심각도:** 🔴 error &nbsp; **검증:** check-violations.js

> 디자인 토큰으로 일관성을 유지하고 프로젝트별 테마 오버라이드를 가능하게 한다. 하드코딩 값은 토큰 변경 시 일일이 찾아 고쳐야 하는 기술 부채다.

**❌ 금지**

```scss
color: #256ef4;   // 하드코딩 색상
background: #f8f8f8;   // 하드코딩 색상
padding: 16px;   // 하드코딩 간격
gap: 8px;   // 하드코딩 간격
```

**✅ 올바른 형식**

```scss
color: var(--color-primary);   // 색상 토큰
background: var(--color-bg-secondary);   // 색상 토큰
padding: var(--spacing-md);   // 간격 토큰
gap: var(--spacing-sm);   // 간격 토큰
```

**참고:** tokens.json, src/scss/1-settings/

---

## R-02 — !important 사용 금지 — 부득이한 경우 주석으로 사유 필수

**심각도:** 🟡 warning &nbsp; **검증:** check-violations.js

> 캐스케이드 우선순위를 강제 무력화하여 이후 오버라이드를 불가능하게 만든다. 외부 라이브러리 인라인 스타일을 덮어야 하는 등 불가피한 경우에만 허용하며 반드시 사유를 주석으로 명시한다.

**❌ 금지**

```scss
.element { color: var(--color-primary) !important; }   // 사유 없는 !important
```

**✅ 올바른 형식**

```scss
.pagefind-ui__input { font-size: var(--font-size-sm) !important; /* pagefind 인라인 스타일 오버라이드 */ }   // 사유 주석 명시
```

---
