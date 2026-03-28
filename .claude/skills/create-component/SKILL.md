---
name: create-component
description: BEM 컴포넌트 일괄 생성. 컴포넌트명 입력 시 SCSS + 스니펫 + playground HTML + site 문서 페이지를 한 번에 생성한다. "컴포넌트 추가", "새 컴포넌트", "create component" 등 요청 시 사용.
---

# create-component

인포마인드 가이드 시스템에 새 BEM 컴포넌트를 일괄 생성한다.

## 사용법

`/create-component [컴포넌트명]` (예: `/create-component accordion`)

## 생성 파일 목록

컴포넌트명이 `{name}`일 때:

| 파일 | 용도 |
|------|------|
| `src/scss/6-components/_{name}.scss` | SCSS 스타일 (BEM 필수) |
| `src/snippets/{name}.md` | HTML 마크업 + variant + 접근성 가이드 |
| `src/playground/{name}.html` | 브라우저 미리보기 |
| `site/components/{name}.md` | 문서 사이트 페이지 |

## 실행 절차

### 1. SCSS 파일 생성

`src/scss/6-components/_{name}.scss` 생성 후 `6-components/_index.scss`에 `@forward '{name}'` 추가.

```scss
// {name} 컴포넌트
// BEM Block: .{name}
// Elements: (사용자 정의)
// Modifiers: (사용자 정의)

@use '../2-tools/responsive' as resp;

.{name} {
  // 모바일 기본 스타일
  padding: var(--spacing-sm);

  @include resp.respond-to('tablet') {
    padding: var(--spacing-md);
  }

  @include resp.respond-to('pc') {
    padding: var(--spacing-lg);
  }

  // 접근성: 모션 감소 설정 대응
  @media (prefers-reduced-motion: reduce) {
    transition-duration: 0.01ms;
  }

  // 포커스 링 (인터랙티브 요소인 경우)
  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }
}
```

### 2. 스니펫 생성

`src/snippets/{name}.md` — 기존 스니펫(btn.md, card.md 등) 구조를 따름:
- 기본 마크업
- Variant 목록 테이블
- 접근성 주의사항
- 참고 파일 경로

### 3. playground HTML 생성

`src/playground/{name}.html` — 기존 playground 파일 구조를 따름:
- `dist/css/style.css` 링크
- 각 variant별 섹션
- 접근성 속성 포함

### 4. site 문서 페이지 생성

`site/components/{name}.md` — Eleventy 문서 페이지:

```markdown
---
title: {Name}
layout: layouts/doc.njk
tags: components
order: (다음 순번)
---

{컴포넌트 설명}

## 기본 사용법
## Variant
## 접근성
## SCSS 파일
```

### 5. 빌드 + 린트

```bash
npm run build:css
npm run lint:css -- "src/scss/6-components/_{name}.scss"
```

## 규칙

- **BEM 필수**: `.{name}__element--modifier` 패턴
- **토큰 사용**: 하드코딩 색상/크기/간격 금지, CSS Custom Properties 사용
- **반응형 필수**: respond-to 믹스인으로 모바일/태블릿/PC 차등
- **접근성 필수**: prefers-reduced-motion, focus-visible, aria 속성
- **한국어 주석**: 모든 주석은 한국어로 작성
