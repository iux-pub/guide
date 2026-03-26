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
# 인포마인드 UX 디자인 시스템 컨텍스트

> **목적:** 대화형 AI에 인포마인드 UX팀 디자인/퍼블리싱 규칙을 극한 압축하여 제공하기 위한 프롬프트
> **대상 AI:** ChatGPT, Gemini, Claude 웹

---

## CSS 방법론

- **BEM** (Block__Element--Modifier) 필수
- **ITCSS** 7레이어: settings > tools > generic > elements > objects > components > utilities
- **SCSS** (dart-sass), `@use`/`@forward` 사용 (`@import` 금지)
- 파일 구조: `src/scss/{1~7}-{layer}/`

## 디자인 토큰

모든 값은 CSS Custom Properties를 사용하라. 하드코딩 금지.

- **색상:** `--color-primary` (#256ef4), gray-50~900, danger/warning/success/info, text/bg/border
- **폰트:** Pretendard GOV, 크기 `--font-size-{2xl~xs}` (12~32px), 굵기 400/500/600/700
- **줄 간격:** `--leading-{tight/base/loose}` (1.2/1.6/1.8)
- **간격:** `--spacing-{xs~3xl}` (4/8/16/24/32/48/64px)
- **반지름:** `--radius-{sm/base/lg/xl/full}` (4/8/12/16/9999px)
- **그림자:** `--shadow-{sm/base/lg}`
- **z-index:** dropdown(100) ~ toast(600)
- **62.5% REM 트릭:** `html { font-size: 62.5% }` -- 1rem = 10px

## 컴포넌트

8개 표준 컴포넌트 (BEM Block명):

| 컴포넌트 | Block | 주요 Modifier/Element |
|----------|-------|---------------------|
| 버튼 | `.btn` | `--primary/--secondary/--outline/--text/--ghost/--link` |
| 폼 | `.form` | `__group/__label/__label--required/__input/__select/__textarea` |
| 카드 | `.card` | `--horizontal/--image/--featured/__header/__title/__body` |
| 테이블 | `.table` | `--striped/--bordered/__wrapper/__head/__th/__body` |
| 모달 | `.modal` | `__overlay/__container/__header/__title/__body/__footer` |
| 탭 | `.tab` | `__list/__button/__panel` |
| 페이지네이션 | `.pagination` | `__list/__item/__item--mobile-hidden/__link/__link--current/__link--prev` |
| 브레드크럼 | `.breadcrumb` | `__list/__item/__item--mobile-hidden/__link/__current/CSS ::before` |

## 접근성

- **KWCAG/WCAG 2.1 AA** 준수 필수
- 색상 대비 4.5:1 이상, 큰 텍스트 3:1
- 터치 영역 최소 44px x 44px
- `focus-visible` 스타일 제공
- `<a href="#main-content" class="skip-to-content">본문 바로가기</a>`
- `.sr-only` 스크린 리더 전용 텍스트
- 이미지: `alt` 필수, 폼: `<label for>` 필수, 모달: `role="dialog"` + 포커스 트랩

## 반응형

- **모바일 퍼스트** 접근
- 브레이크포인트: 모바일 0~767px, 태블릿 768~1279px, PC 1280px+
- 그리드: 모바일 4col/16px거터, 태블릿+ 12col/24px거터, PC max-width 1200px
- 믹스인: `@include resp.respond-to('tablet')`, `respond-to('pc')`, `respond-to('tablet-up')`

## 코딩 스타일

- 들여쓰기 2 spaces, single quote, 주석 한국어
- SCSS 세미콜론 사용, JS/HTML 세미콜론 없음
- `!important` 금지, 인라인 스타일 금지
````
