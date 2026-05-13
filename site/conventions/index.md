---
title: 컨벤션
order: 1
---

인포마인드 UX팀이 합의한 코드 작성 규칙이다. 소스는 `rules.json`이며 `npm run build:rules`로 각 페이지가 자동 생성된다.

## 페이지 목록

| 페이지 | 설명 |
|--------|------|
| [CSS 규칙](/conventions/css-rules/) | 토큰 사용, !important, SCSS 사용 금지 |
| [BEM 네이밍](/conventions/bem/) | CSS 클래스 명명 규칙 |
| [CSS 구조](/conventions/css-structure/) | ITCSS 5레이어 + Tailwind v4 + 토큰 분리 |
| [HTML/마크업 규칙](/conventions/html-rules/) | inline style, alt, 시맨틱 HTML |
| [접근성 규칙](/conventions/a11y-rules/) | 포커스, 대비, 터치 영역 |

## 전체 규칙 목록

<!-- RULES_TABLE_START -->
| ID | 규칙 | 심각도 | 카테고리 |
|----|------|--------|----------|
| R-01 | 색상은 var(--token) 강제 — 간격/크기/타이포 스케일은 권장 | error | [CSS 규칙](/conventions/css-rules/) |
| R-02 | !important 사용 금지 — 부득이한 경우 주석으로 사유 필수 | warning | [CSS 규칙](/conventions/css-rules/) |
| R-03 | SCSS 사용 금지 — 표준 CSS nesting + Tailwind v4 문법 허용 | error | [CSS 규칙](/conventions/css-rules/) |
| R-19 | 스타일 CSS는 Tailwind v4 @apply 우선 — 토큰 값은 var(--token) 유지 | error | [CSS 규칙](/conventions/css-rules/) |
| R-04 | BEM 사용 (5-objects, 6-components 레이어에만 적용) | info | [BEM 네이밍](/conventions/bem/) |
| R-05 | element 2단계 중첩 금지 — 평탄화 | error | [BEM 네이밍](/conventions/bem/) |
| R-06 | 시각적 modifier 금지 — 의미적 이름 사용 | error | [BEM 네이밍](/conventions/bem/) |
| R-07 | inline style 금지 — CSS 커스텀 프로퍼티 style="--var: val"은 허용 | warning | [HTML/마크업 규칙](/conventions/html-rules/) |
| R-08 | HTML 클래스에도 BEM 2단계 element 금지 (R-05 연동) | warning | [HTML/마크업 규칙](/conventions/html-rules/) |
| R-09 | img alt 속성 필수 | error | [HTML/마크업 규칙](/conventions/html-rules/) |
| R-10 | 인터랙티브 요소는 시맨틱 HTML 사용 — div onclick 금지 | error | [HTML/마크업 규칙](/conventions/html-rules/) |
| R-11 | 포커스 스타일 필수 — :focus { outline: none } 금지 | error | [접근성 규칙](/conventions/a11y-rules/) |
| R-12 | 색상 대비 — 일반 텍스트 4.5:1 이상, 큰 텍스트 3:1 이상 | error | [접근성 규칙](/conventions/a11y-rules/) |
| R-13 | 터치/클릭 영역 최소 44×44px | error | [접근성 규칙](/conventions/a11y-rules/) |
| R-14 | 건너뛰기 링크 필수 — .skip-to-content | error | [접근성 규칙](/conventions/a11y-rules/) |
| R-15 | HTML 기본 구조는 기존 인포마인드 사이트 패턴을 우선 유지한다 | warning | [HTML/마크업 규칙](/conventions/html-rules/) |
| R-16 | 인터랙티브 컴포넌트는 필수 ARIA 속성을 누락할 수 없다 | error | [접근성 규칙](/conventions/a11y-rules/) |
| R-17 | 상태는 BEM modifier로만 표현 — .is-* / .has-* 비-BEM 상태 클래스 금지 | warning | [BEM 네이밍](/conventions/bem/) |
| R-18 | modifier 이름은 의미적이어야 함 — 시각적 단어 금지 | error | [BEM 네이밍](/conventions/bem/) |
<!-- RULES_TABLE_END -->

## 검증 도구

```bash
npm run check           # 위반 패턴 전체 스캔 (check-violations.js)
npm run lint:css        # Stylelint (src/styles/**/*.css)
npm run lint:css:fix    # 자동 수정 가능한 항목 처리
npm run build:rules     # rules.json → 이 페이지들 재생성
```

저장소에 Husky pre-commit 훅이 깔리면 커밋 시 `check-violations.js` + Stylelint가 자동 실행된다(예정).
