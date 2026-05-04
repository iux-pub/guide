---
title: CSS 구조
order: 3
---

ITCSS(Inverted Triangle CSS) 5레이어 + Tailwind v4 구조를 사용한다. 특이도(specificity) 순서대로 레이어를 배치하여 캐스케이드 충돌을 방지한다. KRDS+Tailwind v4 마이그레이션 이후 토큰은 `tokens/`로 분리, SCSS 믹스인 레이어(2-tools)는 Tailwind utilities로 대체되어 5레이어로 축소됐다.

## ITCSS 5레이어 + 토큰 분리

```
tokens/                       # 디자인 토큰 (CSS 출력은 build/tokens.css)
  krds-base.json              # KRDS 정본 (수정 금지)
  infomind-overrides.json     # UX팀 결정
  build/tokens.css            # @theme + CSS Custom Properties (자동 생성)

src/styles/
  style.css                   # 메인 진입점
  docs.css                    # 문서 사이트 진입점
  3-generic/                  # 리셋 (62.5% 트릭 포함)
  4-elements/                 # HTML 태그 기본 스타일
  5-objects/                  # 레이아웃 패턴 (BEM 필수)
  6-components/               # KRDS UI 컴포넌트 28종 (BEM 필수)
  7-utilities/                # 유틸리티 클래스
```

## 레이어별 역할

| 레이어 | 역할 | 특이도 | 예시 파일 |
|--------|------|--------|----------|
| tokens (분리) | KRDS 토큰 + INFOMIND 오버라이드 | 없음 (`@theme` + `:root`) | `tokens/build/tokens.css` |
| 3-generic | 리셋, 62.5% 트릭 | 요소 선택자 | `reset.css` |
| 4-elements | HTML 태그 기본 스타일 | 요소 선택자 | `base.css` |
| 5-objects | 레이아웃 패턴 | 클래스 선택자 (BEM) | `container.css` |
| 6-components | KRDS UI 컴포넌트 | 클래스 선택자 (BEM) | `btn.css`, `card.css`, `form.css` 등 28개 |
| 7-utilities | 유틸리티 클래스 | 클래스 선택자 | `sr-only.css` |

> 옛 1-settings 레이어는 `tokens/`로 분리, 2-tools(SCSS 믹스인)는 Tailwind v4 utilities로 대체됐다.

## 메인 진입점 — Tailwind v4 + 토큰 + 레이어

```css
/* src/styles/style.css */

@import "tailwindcss";

/* ITCSS 레이어 우선순위 */
@layer base, components, utilities;

/* 토큰 — KRDS 정본 + INFOMIND 오버라이드 (자동 생성) */
@import "../../tokens/build/tokens.css";

/* ITCSS 레이어 */
@import "./3-generic/reset.css";
@import "./4-elements/base.css";
@import "./5-objects/container.css";
@import "./6-components/index.css";
@import "./7-utilities/sr-only.css";
```

`@import` 사용은 R-03(SCSS 사용 금지)과 무관하다. R-03은 SCSS 빌드 파이프라인 자체를 금지하는 것이며, 표준 CSS의 `@import`는 정상이다.

## 새 파일 추가 규칙

### 새 컴포넌트 추가

`/create-component {컴포넌트명}` 스킬을 사용하면 4개 파일이 일괄 생성된다.

1. `src/styles/6-components/{name}.css`
2. `src/snippets/{name}.md`
3. `src/playground/{name}.html`
4. `site/components/{name}.md`

수동 추가 시 `src/styles/6-components/index.css`에 `@import "./{name}.css";`를 명시적으로 추가한다.

> KRDS 28종 컴포넌트 카탈로그(`skill/references/krds-components.md`) **외 임의 신설은 금지**(R-06 연동). 신설 필요 시 UX팀 결정 후 카탈로그에 먼저 등재한다.

### 새 유틸리티 추가

가능하면 Tailwind v4 기본 유틸리티 또는 KRDS 토큰 기반 utility로 해결한다. 부득이한 경우만 `src/styles/7-utilities/{name}.css`에 추가하고 `style.css`에서 import한다.

## 반응형 작성

CSS `@media` 또는 Tailwind v4 반응형 variant를 직접 사용한다 (SCSS 믹스인 폐지).

```css
.card {
  padding: var(--krds-padding-3); /* 모바일 기본 */
}

@media (min-width: 768px) {
  .card {
    padding: var(--krds-padding-5); /* 태블릿 ~ */
  }
}

@media (min-width: 1280px) {
  .card {
    padding: var(--krds-padding-7); /* PC ~ */
  }
}
```

KRDS 표준 브레이크포인트 — 모바일 0~767, 태블릿 768~1279, PC 1280~. 62.5% REM 트릭 적용으로 `1rem = 10px`.

## 토큰 사용 패턴

KRDS 정본 토큰(`--krds-*`)과 INFOMIND 시맨틱 별칭(`--color-*`/`--spacing-*` 등) 양쪽 모두 사용 가능하다.

```css
.btn {
  background: var(--krds-light-color-primary);  /* KRDS 정본 */
  padding: var(--krds-padding-5) var(--krds-padding-7);
  border-radius: var(--krds-radius-medium2);
}

.alert {
  color: var(--color-text-default);              /* 시맨틱 별칭 */
  background: var(--color-bg-secondary);
}
```

토큰 카탈로그 — `skill/references/krds-tokens.md` 참조.
