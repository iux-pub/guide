# 코드 리뷰 체크리스트 프롬프트 — KRDS+Tailwind v4

대상: 모든 AI (코드 리뷰 용도)

아래 체크리스트로 이 코드를 리뷰하라. 위반 항목을 구체적으로 지적하라.

## CSS 시스템 (R-03)

- [ ] **SCSS 사용 없음** — `.scss` 파일, `@use`, `@forward`, `$variable` 모두 0건
- [ ] CSS는 표준 CSS만 사용 (`.css` 파일, `@import "tailwindcss"`, CSS Custom Property)
- [ ] Tailwind v4 raw 컬러 유틸 없음 (`bg-red-500`, `text-gray-700` 등)
- [ ] Tailwind 비활성 스케일 없음 (`text-base`, `rounded-lg`, `shadow-md`, `z-10`, `sm:` 등)

## BEM (R-04, R-05, R-06)

- [ ] 클래스명이 Block__Element--Modifier 패턴
- [ ] Element 2단계 중첩 0건 (`.card__header__title` 금지)
- [ ] Modifier에 `--` 사용 (`.btn-primary` 금지 → `.btn--primary`)
- [ ] 요소 선택자 의존 없음 (`.card h4` 금지 → `.card__title`)
- [ ] 시각적 modifier 없음 (`--blue`, `--gray`, `--large`(badge용 제외) 금지 → 의미적 이름)
- [ ] 옛 버튼 variant 없음 (`btn--ghost`, `btn--outline`, `btn--link`, `btn--sm`, `btn--lg`, `btn--hero`)

## 토큰 (R-01)

- [ ] 하드코딩 색상 0건 (`#222`, `rgb(...)` 금지 → `var(--krds-*)` 또는 `var(--color-*)`)
- [ ] 하드코딩 간격 0건 (`16px` 금지 → `var(--krds-padding-*)` 또는 `var(--spacing-*)`)
- [ ] 하드코딩 폰트 사이즈 0건 (`14px` 금지 → `var(--krds-font-size-*)` 또는 `var(--text-*)`)
- [ ] 하드코딩 그림자/반경 0건 (토큰 사용)
- [ ] 옛 시맨틱 토큰 0건 (`--color-primary-light`, `--font-size-2xl`, `--spacing-xs` 등 — KRDS 마이그레이션에서 제거)

## CSS 규칙 (R-02, R-07)

- [ ] `!important` 사용 시 사유 주석 명시
- [ ] 인라인 `style="..."` 0건 (CSS 변수 주입 `style="--var: val"`은 허용)
- [ ] 선택자 깊이 3단계 이하

## ITCSS 5레이어

- [ ] 파일이 올바른 레이어에 위치 (컴포넌트 → `src/styles/6-components/`)
- [ ] `src/styles/6-components/index.css`에 `@import "./{name}.css"` 등록
- [ ] BEM은 5-objects, 6-components 레이어에만 적용

## HTML/마크업 (R-07~R-10)

- [ ] `<img>`에 `alt` 속성 (장식용은 `alt=""`)
- [ ] 인터랙티브 요소에 `aria-label` 또는 텍스트 레이블
- [ ] `<div onclick>` 없음 — `<button>`/`<a>` 시맨틱 HTML 사용
- [ ] 폼 요소에 `<label for>` + `id` 연결

## 접근성 (R-11~R-14)

- [ ] `:focus-visible` 스타일 (또는 reset.css 전역 4px primary 외곽선 유지)
- [ ] `:focus { outline: none }` 0건
- [ ] 색상만으로 정보 전달하지 않음 (아이콘 또는 텍스트 병행)
- [ ] 색상 대비 4.5:1 이상 (큰 텍스트 24px/18.67px bold 3:1)
- [ ] `prefers-reduced-motion` 대응
- [ ] 터치 타겟 ≥ 44×44px (모바일 medium=48px 권장)
- [ ] `<a href="#main-content" class="skip-to-content">본문 바로가기</a>` 존재

## 반응형

- [ ] 모바일 퍼스트 작성 (기본 → tablet 768+ → pc 1280+)
- [ ] CSS `@media` 또는 Tailwind v4 variant 사용 (SCSS `respond-to` 믹스인 폐기 — 사용 시 위반)
- [ ] 62.5% REM 트릭 — 1rem = 10px

## 컴포넌트 카탈로그

- [ ] KRDS 28종 카탈로그 안에 있는 컴포넌트만 사용
- [ ] 카탈로그 외 임의 신설 0건 (`skill/references/krds-components.md` 참조)
- [ ] 버튼은 KRDS 정의 4 variant (`--primary` `--secondary` `--tertiary` `--text`) × 5 size (`--xsmall` `--small` medium `--large` `--xlarge`) 안에 있음

## 코딩 스타일

- [ ] 들여쓰기 2 spaces
- [ ] 따옴표 single quote
- [ ] 세미콜론 — CSS 사용, JS/HTML 미사용
- [ ] 주석 한국어
