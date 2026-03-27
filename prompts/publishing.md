# 퍼블리싱 규칙 프롬프트

대상: Cursor, Copilot, Windsurf, Claude Code

이 규칙을 따라 HTML/CSS 코드를 생성하라.

## CSS 방법론: BEM

모든 클래스명은 Block__Element--Modifier 패턴을 따른다.

```
.block-name { }
.block-name__element { }
.block-name--modifier { }
.block-name__element--modifier { }
```

금지: `.btn-primary`(→ `.btn--primary`), `.card-header`(→ `.card__header`), element 2단계 중첩(`.card__header__title` → `.card__title`)

## SCSS 구조: ITCSS 7레이어

```
1-settings/    → 토큰, 변수 (CSS 출력 없음)
2-tools/       → 믹스인, 함수 (CSS 출력 없음)
3-generic/     → 리셋, 노멀라이즈
4-elements/    → HTML 태그 기본 스타일
5-objects/     → 레이아웃 (container, grid) — BEM 필수
6-components/  → UI 컴포넌트 — BEM 필수
7-utilities/   → 유틸리티 (sr-only, hidden)
```

`@use`/`@forward` 사용. `@import` 금지.

## 토큰 사용

하드코딩 금지. CSS Custom Properties 사용:
- 색상: `var(--color-primary)`, `var(--color-gray-900)`
- 간격: `var(--spacing-md)` (4px 기반: xs=4, sm=8, md=16, lg=24, xl=32)
- 폰트: `var(--font-size-base)` (62.5% REM, 1rem=10px)
- 그림자: `var(--shadow-base)`
- 전환: `var(--transition-fast)`

## 반응형: 모바일 퍼스트

- 모바일: 0~767px (기본)
- 태블릿: 768~1279px
- PC: 1280px+

```scss
@include resp.respond-to('tablet') { }
@include resp.respond-to('pc') { }
```

## 접근성: KWCAG/WCAG 2.1 AA

- `<img>`: alt 필수
- 인터랙티브 요소: aria-label 또는 텍스트 레이블 필수
- 색상 대비: 4.5:1 이상
- 키보드 네비게이션 지원
- skip-to-content 링크: `<a href="#main-content" class="skip-to-content sr-only">`
- `!important` 금지, 인라인 스타일 금지
- `prefers-reduced-motion` 대응: 모든 컴포넌트 transition/animation 비활성화
- 터치 타겟: 최소 44x44px, 인접 요소 간격 8px 이상

## 레이아웃 크기 기준

| 영역 | 모바일 | 태블릿 | PC |
|------|--------|--------|-----|
| 헤더 높이 | 최소 56px | 최소 64px | 최소 100px |
| GNB 메뉴 폰트 | 14px | 16px | **18px 이상** |
| 컨테이너 max-width | 100% | 100% | 1200px |
| 컨테이너 패딩 | 16px | 24px | 40px |

## 코딩 스타일

- 들여쓰기: 2 spaces
- 따옴표: single quote
- 주석: 한국어
