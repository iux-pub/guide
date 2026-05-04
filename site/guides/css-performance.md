---
title: CSS 성능 가이드라인
order: 4
---

CSS 파일 크기와 선택자 효율이 페이지 렌더링 성능에 직접 영향을 미친다. ITCSS + BEM 구조를 활용하여 성능을 유지하는 팀 규칙을 정리한다.

## 선택자 깊이 제한

### 규칙: 최대 3단계

선택자 중첩이 깊을수록 브라우저 매칭 비용이 증가하고 유지보수가 어려워진다. **BEM을 사용하면 자연스럽게 1-2단계로 유지된다.**

```css
// DO: BEM 플랫 선택자 (1단계)
.card__title { ... }
.card__title--highlight { ... }

// DO: 최대 3단계 (부득이한 경우)
.card__body .table__cell { ... }

// DON'T: 4단계 이상
.site-header .nav .menu .menu__item .menu__link { ... }

// DON'T: 요소 선택자 체이닝
main section article p span { ... }
```

### Stylelint 검증

프로젝트 `.stylelintrc.json`에 이미 설정되어 있다.

```json
{
  "rules": {
    "selector-max-compound-selectors": 3
  }
}
```

### 선택자 유형별 성능

| 선택자 | 성능 | 비고 |
|--------|------|------|
| `.card__title` | 가장 빠름 | BEM 단일 클래스 권장 |
| `.card .card__title` | 보통 | 불필요한 중첩, BEM이면 `.card__title`으로 충분 |
| `div.card > h3.card__title` | 느림 | 태그 한정자 불필요 |
| `#header .nav a` | 느림 | ID + 후손 + 태그 조합 |
| `[data-type="primary"]` | 보통 | 속성 선택자는 클래스보다 느림 |

## 미사용 CSS 감지

### 방법 1: Chrome DevTools Coverage

1. DevTools 열기 (F12)
2. Cmd+Shift+P -> "Show Coverage" 입력
3. 새로고침 후 미사용 바이트 확인
4. 빨간색 = 미사용, 파란색 = 사용

### 방법 2: PurgeCSS (빌드 시)

```bash
# 설치
npm install purgecss --save-dev
```

```js
// purgecss.config.js
module.exports = {
  content: ['src/**/*.html', 'site/**/*.njk', 'site/**/*.md'],
  css: ['dist/css/*.css'],
  safelist: {
    // 동적으로 추가되는 클래스 보호
    standard: ['is-active', 'is-open', 'is-visible'],
    greedy: [/^js-/]
  }
}
```

### 방법 3: Stylelint no-duplicate-selectors

중복 선택자를 감지한다 (이미 `.stylelintrc.json`에 포함).

## CSS 파일 크기 기준

| 기준 | 목표 | 경고 |
|------|------|------|
| 전체 CSS (minified + gzip) | 50KB 이하 | 100KB 초과 시 분할 검토 |
| 단일 CSS 파일 | 300줄 이하 | 500줄 초과 시 분할 |
| 컴포넌트 CSS | 200줄 이하 | 컴포넌트가 너무 큰 신호 |

### 파일 크기 확인

```bash
# CSS 빌드 후 크기 확인
ls -lh dist/css/style.css

# gzip 압축 후 크기 추정
gzip -c dist/css/style.css | wc -c
```

## ITCSS 특성 활용

ITCSS 구조는 CSS 성능에 유리한 특성이 있다.

### 1. 특이성(Specificity) 순서 보장

낮은 특이성에서 높은 특이성 순으로 레이어가 배치되어 `!important` 없이 자연스러운 오버라이드가 가능하다.

```
tokens (분리)  → @theme + CSS Custom Property (출력 있음, 변수)
3-generic      → 요소 선택자 (가장 낮은 특이성)
4-elements     → 요소 선택자
5-objects      → 클래스 선택자 (BEM)
6-components   → 클래스 선택자 (BEM)
7-utilities    → 클래스 선택자 (가장 높은 레이어)
```

> 옛 1-settings(토큰) 레이어는 `tokens/`로 외부화됐고, 2-tools(SCSS 믹스인)는 Tailwind v4 utilities로 대체됐다.

### 2. 컴포넌트 단위 관리

각 컴포넌트가 독립 파일이므로 미사용 컴포넌트 제거가 쉽다.

```css
/* src/styles/6-components/index.css */
/* 사용하지 않는 컴포넌트는 주석 처리하여 번들에서 제외 */
@import "./btn.css";
@import "./card.css";
@import "./form.css";
/* @import "./carousel.css";  // 이 프로젝트에서 미사용 */
```

### 3. 유틸리티 레이어 최소화

7-utilities는 꼭 필요한 유틸리티만 포함한다. Tailwind v4의 raw 유틸 클래스(`bg-red-500`, `text-base` 등)는 사용 금지(R-01, R-06).

## 성능 체크리스트

- [ ] 선택자 깊이가 3단계 이하인가
- [ ] BEM 단일 클래스 선택자를 사용하는가
- [ ] 태그 한정자(`div.card`)를 사용하지 않는가
- [ ] `!important`를 사용하지 않는가
- [ ] 미사용 컴포넌트 CSS를 `index.css`에서 제외했는가
- [ ] CSS 파일 크기가 목표 이내인가 (50KB gzip 이하)
- [ ] 단일 컴포넌트 CSS가 300줄 이하인가
- [ ] SCSS 사용 0건 (R-03 — Tailwind v4 + 표준 CSS만)
