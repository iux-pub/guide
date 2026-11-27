---
title: 인터랙션 타이밍
order: 3
---

전환 시간과 이징의 기준. 수치는 카탈로그 CSS(`src/styles/`)에서 잰 값이다. 모션은 토큰으로 만들지 않는다 — CSS 값이나 Tailwind 임의값(`duration-[200ms]`, `[transition:color_0.15s_ease-in-out]`)으로 직접 쓴다.

> **정본 관계** — KRDS → `contracts/profiles.json`의 표현 등급 모션 예산(R-22) → 이 문서. 컴포넌트 피드백 모션(버튼·입력·탭·모달·토스트)의 수치는 이 문서가 맡고, 장식·스크롤 진입 모션의 상한은 [아트 디렉션](/design/art-direction/) §1 표현 등급 표가 맡는다.

## 전환 시간

| 종류 | 시간 | 적용 |
|------|------|------|
| 사용자 동작에 답하는 전환 | 150~250ms | 호버, 초점, 누름, 선택, 열림·닫힘. 등급과 상관없이 빠짐없이 준다 |
| 장식·스크롤 진입 모션 — 기능형 | 200ms 이하 | 페이드만. 스크롤 진입 모션은 쓰지 않는다(R-22) |
| 장식·스크롤 진입 모션 — 절제형 | 300ms 이하 | 페이드, 16px 이동, 한 번만 나타나는 스크롤 페이드 |
| 장식·스크롤 진입 모션 — 표현형 | 400ms 이하 | 페이드, 24px 이동, 2% 확대, 50~80ms 간격의 순차 등장 |
| 모든 전환 | 500ms 초과 금지 | 로딩 표시(`spinner`)의 회전만 예외다 |

- 카탈로그의 기본 전환은 **150ms**다. 새 컴포넌트도 150ms에서 시작하고, 이동 거리가 큰 전환만 250ms까지 늘린다.
- 무한 반복은 로딩 표시에만 쓴다. 로고 마키, 떠다니는 장식, 반복되는 강조 효과는 쓰지 않는다(R-22·R-33).
- 의도한 등장 효과는 페이지에 하나다. 모든 섹션이 떠오르는 화면은 템플릿 서명이다(R-51).
- 영상은 자동 재생하지 않는다. 무음 배경 영상도 사용자가 재생한다(KRDS).

## 이징 함수

| 값 | 쓰는 곳 | 출처 |
|----|---------|------|
| `ease-in-out` | 카탈로그의 모든 `transition` | `btn.css`·`form.css`·`tab.css` 등 |
| `cubic-bezier(0, 0, 0.2, 1)` | 토스트 등장(감속) | `toast.css` |
| `linear` | 스피너 회전 | `spinner.css` |

- 장식·스크롤 진입 모션은 감속 계열(`ease-out`)을 쓴다. 목표 지점을 넘었다 돌아오는 이징(overshoot·bounce)은 쓰지 않는다([아트 디렉션](/design/art-direction/) §10의 8번).
- 스크롤 속도·방향을 바꾸거나 구간을 고정하는 연출(scroll-jacking), 패럴랙스는 쓰지 않는다.

## 컴포넌트별 전환 매핑

`src/styles/4-elements/base.css`와 `src/styles/6-components/*.css`의 현재 값이다.

| 컴포넌트 | 바뀌는 속성 | 시간 | 이징 |
|----------|-------------|------|------|
| 링크 `a` | `color` | 150ms | ease-in-out |
| `btn` | `background-color`·`border-color`·`color` | 150ms | ease-in-out |
| `input`·`textarea`·`select` | `border-color`(`input`은 `background-color`도) | 150ms | ease-in-out |
| `check`·`radio` | 상자 `background-color`·`border-color`, 표시 `opacity` | 150ms | ease-in-out |
| `switch` | 트랙 `background-color`, 손잡이 `transform` | 150ms | ease-in-out |
| `tab` | 글자 `color`, 선택 밑줄 `background-color` | 150ms | ease-in-out |
| `pagination` | `background-color`·`color`·`border-color` | 150ms | ease-in-out |
| `table--hover` 행 | `background-color` | 150ms | ease-in-out |
| 링크형 `card` | `box-shadow`·`transform` | 150ms | ease-in-out |
| `tag`·`breadcrumb`·`calendar` 날짜 | 색 | 150ms | ease-in-out |
| `tooltip` | `opacity` | 150ms | ease-in-out |
| `main-menu`·`mobile-menu`·`footer` 화살표 | `rotate` | 150ms | ease-in-out |
| `carousel` 위치 표시점 | `width`·`background-color` | 150ms | ease-in-out |
| `accordion`·`disclosure` | 글자 `color` 150ms, 화살표 `rotate` **400ms** | — | ease-in-out |
| `side-panel` | `transform: translateX(100% → 0)`·`visibility` | **400ms** | ease-in-out |
| `toast` | `opacity 0 → 1`, `translateX(2rem → 0)` | **400ms** | cubic-bezier(0, 0, 0.2, 1) |
| `progress` 채움 막대 | `width`(WebKit) | **400ms** | ease-in-out |
| `spinner` | 360도 회전, 무한 반복 | 800ms | linear |
| `modal` | 없음 — `hidden` 속성으로 바로 열고 닫는다 | — | — |

- 400ms인 다섯 곳(`accordion`·`disclosure` 화살표, `side-panel`, `toast`, `progress`)은 150~250ms 기준보다 길고 500ms 상한 안에 있다. 새로 만드는 전환의 기준으로 삼지 않는다.
- 아코디언 패널과 탭 패널의 내용은 전환 없이 바로 바뀐다. 높이를 움직이지 않는다.
- 토스트는 3~5초 뒤에 닫는다(`src/snippets/toast.md`). 자동으로 닫히는 토스트는 사용자가 멈추거나 유지할 수 있어야 한다(WCAG 2.2.1).

## Hover 상태

호버는 색으로 답한다. 크기나 위치를 바꿔 주변 요소를 밀지 않는다.

| 컴포넌트 | 기본 → 호버 |
|----------|-------------|
| `btn--primary` | 배경·테두리 `--color-button-primary-fill` → `--color-button-primary-fill-hover` |
| `btn--secondary`·`--tertiary`·`--text` | 배경 `--color-button-{variant}-fill` → `--color-button-{variant}-fill-hover` |
| 링크 `a` | `--color-link` → `--color-link-hover` |
| `input`·`textarea` | 테두리 `--color-input-border` → `--color-border-dark` |
| `tab__item` | `--color-text-subtle` → `--color-text` |
| `accordion__summary` | `--color-text` → `--color-primary` |
| `pagination__item`·`table--hover` 행 | 배경 → `--color-bg-subtler` |
| 링크형 `card` | KRDS 그림자 추가 + `translateY(-2px)` |

메인 메뉴의 호버는 색·배경 피드백에만 쓴다. 호버로 하위 메뉴를 열지 않는다(KRDS).

## Focus Ring 규격

초점 링은 `src/styles/3-generic/reset.css`가 전역으로 그린다. 컴포넌트에서 지우지 않는다(R-11).

```css
:focus-visible {
  outline: 0.4rem solid var(--color-border-primary);
  outline-offset: 2px;
}
```

- `input`·`textarea`는 외곽선 대신 테두리를 `--color-input-border-active`로 바꾼다(`form.css`).
- 가로로 스크롤되는 목록 안의 항목은 링이 잘리지 않게 안쪽에 그린다 — `tab__item`은 `outline-offset: -0.4rem`이다(`tab.css`).
- 짙은 면 위에서는 링을 밝은 색으로 바꾸고 대비를 실측한다(`references/design-intelligence.md` §5-2).

## Active / Pressed 상태

| 컴포넌트 | 변화 |
|----------|------|
| `btn` | 배경 `--color-button-{variant}-fill-pressed` |
| 링크 `a` | `--color-link-pressed` |

누름 상태에서 크기를 줄이지 않는다. 카탈로그는 색만 바꾼다.

## Disabled 상태

투명도로 흐리게 하지 않고 비활성 토큰을 쓴다.

| 컴포넌트 | 값 |
|----------|----|
| `btn` | 배경 `--color-button-disabled-fill`, 글자 `--color-text-disabled`, 테두리 `--color-button-disabled-border`, `cursor: not-allowed`, `pointer-events: none` |
| `input` | 배경 `--color-input-surface-disabled`, 테두리 `--color-input-border-disabled`, 글자 `--color-text-disabled`, `cursor: not-allowed` |
| `tab__item`·`pagination__item` | 글자 `--color-text-disabled`, `cursor: not-allowed` |

비활성은 `disabled` 속성으로 표시한다. 속성을 쓸 수 없는 요소만 `aria-disabled="true"`를 쓴다. 왜 비활성인지 화면에서 알 수 있어야 한다(`references/release-checklist.md` §4).

## prefers-reduced-motion 대응

모든 움직임은 `prefers-reduced-motion: reduce`에서 멈추거나 줄인다(R-22). 전역 초기화 규칙은 없다. 움직임을 넣은 컴포넌트가 직접 대응한다.

| 컴포넌트 | 대응 | 출처 |
|----------|------|------|
| `toast` | 등장 애니메이션을 끈다 | `toast.css` |
| `side-panel` | 전환 없이 바로 열고 닫는다 | `side-panel.css` |
| `carousel` | 부드러운 스크롤과 표시점 전환을 끈다. 자동 회전을 시작하지 않는다 | `carousel.css`, `src/js/carousel.js` |
| `spinner` | 회전을 1.6초로 늦춘다 | `spinner.css` |

```css
.side-panel {
  transition: transform 0.4s ease-in-out, visibility 0.4s;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
}
```

`animation`이나 `@keyframes`를 쓰는 파일에 이 가드가 없으면 `npm run check`가 경고한다.

## 애니메이션 성능 규칙

- `transform`과 `opacity`를 움직인다. `top`·`left`·`width`·`height`를 움직이는 전환을 새로 만들지 않는다 — 레이아웃을 다시 계산한다. 카탈로그의 예외는 `progress` 채움 막대와 `carousel` 위치 표시점 두 곳이다.
- 스크롤 위치는 `IntersectionObserver`로 읽는다. `scroll` 이벤트에 직접 묶지 않는다.
- `min-height: 100dvh`는 전체 화면 레이어(모바일 메뉴·모달)에만 쓴다. 히어로에는 쓰지 않는다 — 히어로는 화면 높이를 채우지 않는다(R-42).

## Do / Don't

| Do | Don't |
|----|-------|
| 사용자 동작에 답하는 전환 150~250ms | 500ms를 넘는 전환 |
| 호버·초점·누름·비활성 상태를 모두 만든다 | 초점 상태 없이 납품 |
| 색으로 답하는 호버 | 호버에서 크기가 바뀌어 주변을 미는 요소 |
| `transform`·`opacity` 전환 | `top`·`left`·`width`·`height` 전환을 새로 추가 |
| 의도한 등장 효과 한 곳 | 모든 섹션의 페이드·슬라이드 등장 |
| 로딩 표시에만 무한 반복 | 로고 마키, 반복되는 장식 모션 |
| 사용자가 재생하는 영상 | 자동 재생 영상(무음 포함) |
| `prefers-reduced-motion` 가드 | 가드 없는 `animation`·`@keyframes` |
| 감속 이징(`ease-out` 계열) | overshoot·bounce, 패럴랙스, scroll-jacking |

## 관련 문서

- [아트 디렉션](/design/art-direction/) -- 표현 등급별 장식·스크롤 진입 모션 상한
- [UI 상태 패턴](/design/ui-states/) -- 컴포넌트별 상태 셋
- [디자인 감사 - 모션](/design/design-audit/) -- 감사 체크리스트 8번
- [접근성](/accessibility/) -- KWCAG/WCAG AA 요구사항
