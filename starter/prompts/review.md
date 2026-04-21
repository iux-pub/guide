# 코드 리뷰 체크리스트 프롬프트

대상: 모든 AI (코드 리뷰 용도)

아래 체크리스트로 이 코드를 리뷰하라. 위반 항목을 구체적으로 지적하라.

## BEM

- [ ] 클래스명이 Block__Element--Modifier 패턴인가
- [ ] Element 2단계 중첩이 없는가 (`.card__header__title` 금지)
- [ ] Modifier에 `--` 사용했는가 (`.btn-primary` 금지 → `.btn--primary`)
- [ ] 요소 선택자 의존이 없는가 (`.card h4` 금지 → `.card__title`)

## 토큰

- [ ] 하드코딩 색상이 없는가 (`#222` 금지 → `var(--color-gray-900)`)
- [ ] 하드코딩 간격이 없는가 (`16px` 금지 → `var(--spacing-md)`)
- [ ] 하드코딩 폰트가 없는가 (`14px` 금지 → `var(--font-size-sm)`)
- [ ] 하드코딩 그림자/반경이 없는가 (토큰 사용)

## CSS 규칙

- [ ] `!important` 사용이 없는가
- [ ] 인라인 스타일이 없는가
- [ ] `@import` 대신 `@use`/`@forward` 사용했는가
- [ ] 선택자 깊이가 3단계 이하인가

## 접근성

- [ ] `<img>`에 `alt` 속성이 있는가
- [ ] 인터랙티브 요소에 `aria-label` 또는 텍스트 레이블이 있는가
- [ ] `focus-visible` 스타일이 있는가
- [ ] 색상만으로 정보를 전달하지 않는가
- [ ] `prefers-reduced-motion` 미디어 쿼리가 있는가

## 반응형

- [ ] 모바일 퍼스트로 작성했는가 (기본 → tablet → pc)
- [ ] respond-to 믹스인을 사용했는가
- [ ] 터치 타겟이 최소 44×44px인가

## ITCSS

- [ ] 파일이 올바른 레이어에 있는가 (컴포넌트 → 6-components/)
- [ ] `_index.scss`에 `@forward` 추가했는가
