---
title: 대화형 AI 컨텍스트
order: 6
---

## 대상 AI 도구

ChatGPT, Gemini, Claude 웹

## 사용법

아래 내용을 복사하여 AI 도구의 시스템 프롬프트(또는 첫 메시지)에 붙여넣는다.

## 프롬프트

````markdown
# KRDS+INFOMIND UX 디자인 시스템 컨텍스트

> **목적:** 대화형 AI에 KRDS+INFOMIND 디자인/퍼블리싱 규칙을 극한 압축하여 제공
> **대상 AI:** ChatGPT, Gemini, Claude 웹

---

## 기술 스택

- **CSS Framework:** Tailwind v4 (`^4.0.0`) — `@import "tailwindcss"`
- **Tokens:** KRDS-uiux 정본 + INFOMIND 오버라이드 — 출력은 `tokens/build/tokens.css` (`@theme` + CSS Custom Properties)
- **방법론:** ITCSS 5-layer + BEM (5-objects · 6-components 한정)
- **REM 트릭:** 62.5% (1rem = 10px) — KRDS 명시 채택

> SCSS는 사용 금지(R-03). 표준 CSS만 사용.

## 디자인 토큰

모든 값은 CSS Custom Properties(`var(--token)`)를 사용하라. 하드코딩 금지.

- **KRDS 정본** (`--krds-light-color-*`, `--krds-padding-*`, `--krds-radius-*`, `--krds-font-size-*` 등) — 5/10/20/.../95 스텝
- **INFOMIND 시맨틱 별칭** (`--color-text-*`, `--color-bg-*`, `--color-border-*` 등) — 의미 기반 alias

> 전체 토큰 카탈로그 — `skill/references/krds-tokens.md`

## 컴포넌트 (KRDS 28종)

- **폼/액션** — btn, check-radio, file-upload, form, select, switch
- **컨테이너** — accordion, card, disclosure, modal, side-panel, tab
- **내비** — breadcrumb, header, main-menu, pagination
- **피드백** — alert, badge, progress, spinner, step-indicator, tag, toast, tooltip
- **콘텐츠** — calendar, carousel, list, table

> 각 컴포넌트의 BEM·접근성·토큰 매핑 — `skill/references/krds-components.md`

## 접근성 (KWCAG/WCAG 2.1 AA)

- 색상 대비 4.5:1 이상, 큰 텍스트 3:1 이상 (KRDS 토큰은 AA 통과 조합)
- 터치 영역 ≥ 44×44px (모바일 권장 medium=48px)
- `:focus-visible` 4px primary 외곽선 (reset.css 전역 관리 — 컴포넌트에서 제거 금지)
- 페이지 최상단 `<a href="#main-content" class="skip-to-content">본문 바로가기</a>`
- 이미지 `alt` 필수, 폼 `<label for>` + `id` 필수
- `role="dialog"` + 포커스 트랩 (모달)

## 반응형

- **모바일 퍼스트** 접근
- KRDS 표준 브레이크포인트: 모바일 0~767, 태블릿 768~1279, PC 1280~
- CSS `@media` 또는 Tailwind v4 반응형 variant 직접 사용 (SCSS 믹스인 폐지)

## 절대 금지

- SCSS 파일/`@use`/`@forward`/SCSS 변수
- Raw hex/rgb/hsl 색상, raw px (KRDS 스케일 외)
- Tailwind raw 컬러 유틸(`bg-red-500` 등), 비활성 스케일(`text-base`, `rounded-lg` 등)
- 옛 버튼 variant(`btn--ghost`/`--outline`/`--link`/`--sm`/`--lg`)
- 카탈로그 외 컴포넌트 임의 생성
- BEM element 2단계 중첩 (`.card__body__title`)
- `:focus { outline: none }`, `<div onclick>`
- 이미지 `alt` 누락, 폼 `<label>` 누락

## 코딩 스타일

- 들여쓰기 2 spaces, single quote, 주석 한국어
- 세미콜론: CSS 사용, JS/HTML 미사용

````
