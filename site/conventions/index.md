---
title: 컨벤션
order: 1
---

인포마인드 UX팀이 합의한 코드 작성 규칙이다. BEM 네이밍 규칙과 ITCSS 기반 SCSS 구조를 중심으로 일관된 코드 품질을 유지한다.

## 핵심 컨벤션

| 항목 | 규칙 | 상세 |
|------|------|------|
| CSS 방법론 | [BEM](/conventions/bem/) | Block__Element--Modifier 필수 |
| SCSS 구조 | [ITCSS](/conventions/scss-structure/) | 7레이어 역삼각형 구조 |
| 전처리기 | SCSS (Dart Sass) | `@use`/`@forward` 사용, `@import` 금지 |
| 들여쓰기 | 2 spaces | 탭 금지 |
| 따옴표 | single quote | |
| 주석 | 한국어 | 팀 내 소통 언어 |

## CSS 규칙 요약

- BEM(Block__Element--Modifier) 네이밍을 필수로 적용한다
- 인라인 스타일 사용을 금지한다
- `!important` 사용을 금지한다 (부득이한 경우 주석으로 사유 필수)
- CSS Custom Properties(토큰)를 우선 사용한다. 하드코딩 값을 금지한다
- 코드 작성 후 반드시 린트를 실행한다: `npm run lint:css`

## 린트 검사

```bash
# SCSS 전체 린트 검사
npm run lint:css

# 자동 수정 가능한 항목 처리
npm run lint:css:fix

# 특정 폴더만 검사
npx stylelint "src/scss/6-components/**/*.scss"
```

BEM 위반은 현재 warning 수준이다. 팀 적응 후 error로 전환 예정이다.
