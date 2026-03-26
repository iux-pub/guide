# 피그마 컨벤션 프롬프트

대상: Figma AI, Figma Make

이 규칙을 따라 피그마 작업을 수행하라.

## 컴포넌트 네이밍

- PascalCase + `/` 구분자: `Button/Primary/Large`, `Card/Horizontal`, `Form/Input/Error`
- Variant Property: camelCase. 예: `type=Primary`, `size=Large`, `state=Hover`
- 금지: 한글 이름, 공백, `_` 언더스코어, 넘버링(`Button1`, `Button2`)

## BEM 매핑

| 피그마 | BEM 클래스 |
|--------|-----------|
| Button/Primary | `.btn--primary` |
| Button/Secondary | `.btn--secondary` |
| Button/Small | `.btn--sm` |
| Card/Horizontal | `.card--horizontal` |
| Form/Input/Error | `.form__input--error` |
| Table/Striped | `.table--striped` |
| Modal | `.modal` |
| Tab | `.tab` |

## Variable 네이밍

Collection 구조: Color, Typography, Spacing, Radius, Shadow

| 피그마 Variable | CSS Custom Property |
|----------------|-------------------|
| Color/Primary/Default | `--color-primary` |
| Color/Gray/900 | `--color-gray-900` |
| Color/Danger | `--color-danger` |
| Typography/Size/Base | `--font-size-base` |
| Spacing/MD | `--spacing-md` |
| Radius/Base | `--radius-base` |

## Auto Layout

패딩/갭은 토큰 스케일만 사용: 4, 8, 16, 24, 32, 48, 64 (px)
금지 값: 5, 10, 15, 20, 30px

## 레이어 구조

- 프레임/그룹: kebab-case (`main-header`, `card-section`)
- 페이지: 🎨 Design, 📦 Components, 📐 Tokens, 📝 Handoff
- 깊이: 최대 5단계
- 자동 생성 이름 금지 (`Frame 427`, `Group 12`)
