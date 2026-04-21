---
title: 컨벤션
order: 1
---

인포마인드 UX팀이 합의한 코드 작성 규칙이다. 소스는 `rules.json`이며 `npm run build:rules`로 각 페이지가 자동 생성된다.

## 페이지 목록

| 페이지 | 설명 |
|--------|------|
| [BEM 네이밍](/conventions/bem/) | CSS 클래스 명명 규칙 |
| [SCSS 규칙](/conventions/scss-rules/) | 토큰 사용, !important 등 |
| [모듈 시스템](/conventions/modules/) | @use/@forward/@import |
| [SCSS 구조](/conventions/scss-structure/) | ITCSS 7레이어 아키텍처 |
| [HTML/마크업 규칙](/conventions/html-rules/) | inline style, alt, 시맨틱 HTML |
| [접근성 규칙](/conventions/a11y-rules/) | 포커스, 대비, 터치 영역 |

## 전체 규칙 목록

<!-- RULES_TABLE_START -->
| ID | 규칙 | 심각도 | 카테고리 |
|----|------|--------|----------|
| R-01 | 모든 색상/간격/크기는 var(--token) 사용 — 하드코딩 금지 | error | [SCSS 규칙](/conventions/scss-rules/) |
| R-02 | !important 사용 금지 — 부득이한 경우 주석으로 사유 필수 | warning | [SCSS 규칙](/conventions/scss-rules/) |
| R-03 | @use/@forward만 사용 — @import 금지 | error | [모듈 시스템](/conventions/modules/) |
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
<!-- RULES_TABLE_END -->

## 검증 도구

```bash
npm run check           # 위반 패턴 전체 스캔 (check-violations.js)
npm run lint:css        # Stylelint BEM + SCSS 구문 검사
npm run lint:css:fix    # 자동 수정 가능한 항목 처리
npm run build:rules     # rules.json → 이 페이지들 재생성
```

파일 저장 시 훅이 자동으로 `check-violations.js`와 Stylelint를 실행한다.
