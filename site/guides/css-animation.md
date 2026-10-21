---
title: CSS 애니메이션/트랜지션
order: 5
---

애니메이션과 트랜지션은 사용자 경험을 향상하지만, 잘못 사용하면 성능 저하와 접근성 문제를 일으킨다. 팀 표준 규칙을 정리한다.

> **코드 표기** — 이 페이지의 예시는 `src/styles/6-components/`의 컴포넌트 CSS와 같은 방식으로 쓴다.
>
> - 선택자는 전체 이름으로 평탄하게 쓴다(`.side-panel`, `.modal__overlay`). 표준 CSS nesting의 `&`는 부모 선택자를 그 자리에 넣을 뿐 SCSS처럼 이름을 이어 붙이지 않는다 — `.card` 안에서 `&` 뒤에 `__title`을 붙이면 `.card__title`이 아니라 `__title.card`가 되어 어떤 요소에도 맞지 않는다.
> - 유틸리티 성격의 선언은 Tailwind v4 `@apply`로 쓴다(R-19). 대괄호 안의 밑줄은 공백이다 — `[transition:transform_0.4s_ease-in-out]`은 `transition: transform 0.4s ease-in-out`과 같다.
> - 색은 `var(--color-*)`만 쓴다(R-01).
> - 주석은 `/* */`만 쓴다. `//`는 CSS 주석이 아니어서 뒤따르는 규칙이나 선언을 통째로 무효로 만든다.
> - `금지 예시`라고 적힌 코드는 따라 쓰지 않는다.

## 기본 원칙

1. **정해진 시간 단계 사용** -- 전환 시간은 아래 세 단계에서 고른다. 그때그때 값을 지어내지 않는다
2. **GPU 가속 속성 우선** -- `transform`, `opacity`를 사용한다
3. **상태는 속성에 건다** -- 열림·닫힘은 ARIA·`hidden` 속성이 들고, 움직임은 그 속성 선택자에 건다(R-17)
4. **접근성 대응 필수** -- `prefers-reduced-motion` 미디어 쿼리를 적용한다(R-22)
5. **과도한 애니메이션 금지** -- 기능적 목적이 있는 경우에만 사용한다

## 상태는 속성에 건다

열림·닫힘 같은 상태는 화면뿐 아니라 보조기기에도 전해져야 한다. 그래서 상태는 ARIA·`hidden` 속성이 들고, CSS는 그 속성 선택자에 모양과 움직임을 건다(R-17, `references/class-naming.md`). `.is-open`·`.is-active` 같은 상태 클래스는 화면만 바꾸고 보조기기에는 아무것도 알리지 않으므로 쓰지 않는다.

| 컴포넌트 | 상태를 드는 속성 | 움직임을 거는 선택자 |
|----------|------------------|----------------------|
| 메인 메뉴 화살표 | 버튼의 `aria-expanded` | `.main-menu__toggle[aria-expanded="true"] .main-menu__icon` |
| 메인 메뉴 하위 메뉴 | `hidden` | `.main-menu__submenu:not([hidden])` |
| 모달 | `hidden` | `.modal:not([hidden]) .modal__content` |
| 사이드 패널 | `aria-hidden` | `.side-panel[aria-hidden="false"]` |
| 모바일 메뉴 하위 그룹 | `<details>`의 `open` | `.mobile-menu__group[open] .mobile-menu__icon` |

JS는 클래스를 붙이거나 떼지 않고 속성만 바꾼다.

```js
toggle.setAttribute('aria-expanded', 'true')
submenu.hidden = false
panel.setAttribute('aria-hidden', 'false')
```

속성마다 움직임을 거는 방법이 다르다.

- **`hidden`으로 숨기는 요소**(하위 메뉴·모달)는 `display: none`에서 나타나므로 `transition`이 걸리지 않는다. 나타나는 순간 한 번 도는 `@keyframes` 애니메이션을 건다. 닫힐 때는 바로 사라진다.
- **닫힘까지 움직여야 하는 요소**(사이드 패널)는 `display`를 끄지 않고 `visibility`와 `transform`으로 숨긴다. 이때는 `transition`이 양방향으로 걸린다.

**금지 예시** — 상태 클래스로 여닫는다.

```css
/* 금지 예시 — 상태 클래스(R-17). 보조기기는 하위 메뉴가 열렸는지 모른다 */
.main-menu__submenu.is-open {
  display: block;
}
```

## 전환 시간 단계

infoUX는 모션을 토큰으로 만들지 않는다([토큰 개요](/tokens/) — 간격·크기·타이포 스케일·반경·그림자·모션·z-index는 직접값을 쓴다). 그래서 `var(--duration-fast)` 같은 변수는 없다. 정의되지 않은 변수를 쓰면 그 `transition` 선언이 무효가 되어 전환 없이 바로 바뀐다. 대신 컴포넌트 CSS가 실제로 쓰는 값을 세 단계로 정해 두고 그 값을 직접 적는다.

| 단계 | 값 | 용도 | 쓰는 곳 |
|------|-----|------|---------|
| 빠름 | `0.15s ease-in-out` | 호버·포커스, 색·테두리 변화, 펼침 화살표 회전 | `btn`, `tab`, `pagination`, `main-menu` |
| 보통 | `0.2s ease-out` | 하위 메뉴·모달 등장, 덮개 페이드 | 프로젝트에서 등장 모션을 더할 때 |
| 느림 | `0.4s ease-in-out` | 화면 가장자리에서 들어오는 큰 요소 | `side-panel`, `toast`(감속 곡선 `cubic-bezier(0, 0, 0.2, 1)`) |

- infoUX의 하위 메뉴·모달은 기본으로 바로 열린다. 등장 모션은 프로젝트에 필요할 때 더한다(모바일 메뉴 스니펫 기준 150~200ms).
- 0.5s를 넘기지 않는다. 사용자는 그만큼을 기다림으로 느낀다([인터랙션 타이밍](/design/interaction-timing/) Do / Don't).
- 등장은 `ease-out`(빠르게 시작해 천천히 멈춤), 퇴장은 `ease-in`이 기본이다.
- 같은 값을 프로젝트 곳곳에서 되풀이한다면 그 프로젝트 CSS에 사용자 정의 속성을 직접 정의해 써도 된다. 정의는 프로젝트 몫이며 infoUX 토큰이 아니다.

### 단계별 적용 코드

**빠름 (0.15s)** -- 호버, 포커스, 펼침 화살표

```css
/* 버튼 — 바뀌는 속성만 나열한다 (btn.css) */
.btn {
  @apply [transition:background-color_0.15s_ease-in-out,_border-color_0.15s_ease-in-out,_color_0.15s_ease-in-out];
}

.btn--primary:hover:not(:disabled):not([aria-disabled="true"]) {
  @apply bg-[var(--color-button-primary-fill-hover)] border-[var(--color-button-primary-fill-hover)];
}

/* 메인 메뉴 화살표 — 버튼의 aria-expanded가 "true"가 되면 뒤집는다 */
.main-menu__icon {
  @apply [transition:rotate_0.15s_ease-in-out];
}

.main-menu__toggle[aria-expanded="true"] .main-menu__icon {
  @apply rotate-180;
}
```

> **주의** — Tailwind v4의 `rotate-*`·`scale-*`·`translate-*`는 `transform`이 아니라 개별 속성(`rotate`·`scale`·`translate`)으로 빌드된다. `rotate-180`을 쓰면서 `transition`에 `transform`만 적으면 돌지 않고 바로 뒤집힌다. 전환 대상에는 실제로 바뀌는 속성 이름을 적는다.

**보통 (0.2s)** -- 하위 메뉴 등장

```css
/* 메인 메뉴 하위 메뉴 — hidden이 풀리면 위에서 살짝 내려오며 나타난다 */
.main-menu__submenu:not([hidden]) {
  @apply [animation:submenu-in_0.2s_ease-out];
}

@keyframes submenu-in {
  from { opacity: 0; transform: translateY(-0.8rem); }
  to   { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  .main-menu__submenu:not([hidden]) {
    @apply [animation:none];
  }
}
```

**느림 (0.4s)** -- 화면 가장자리에서 들어오는 큰 요소

사이드 패널은 `aria-hidden` 하나로 여닫는다(닫힘 `"true"`, 열림 `"false"`). 닫힌 패널은 `visibility: hidden`이라 화면 밖에 있어도 Tab 초점이 들어가지 않는다. `visibility`도 같은 시간 동안 전환하므로 닫을 때는 슬라이드가 끝난 뒤에 숨는다.

```css
/* side-panel.css 발췌 — 납품 호환 별칭 --open은 뺐다 */
.side-panel {
  @apply [transform:translateX(100%)] [visibility:hidden] [transition:transform_0.4s_ease-in-out,visibility_0.4s];
}

.side-panel[aria-hidden="false"] {
  @apply [transform:translateX(0)] [visibility:visible];
}

@media (prefers-reduced-motion: reduce) {
  .side-panel {
    @apply [transition:none];
  }
}
```

### 단계 밖 값 비교

**금지 예시** — 단계에 없는 값, `all`, 정의되지 않은 변수.

```css
/* 금지 예시 — 단계에 없는 값 */
.card--link {
  transition: transform 0.25s ease;
}

/* 금지 예시 — all: 바뀌는 모든 속성이 함께 움직인다 */
.btn {
  transition: all 0.15s ease-in-out;
}

/* 금지 예시 — 없는 변수: 선언이 무효가 되어 전환이 사라진다 */
.tab__item {
  transition: color var(--duration-fast);
}
```

**권장** — 단계 값으로, 바뀌는 속성만 적는다.

```css
.card--link {
  @apply [transition:transform_0.15s_ease-in-out];
}

.tab__item {
  @apply [transition:color_0.15s_ease-in-out];
}
```

## @keyframes 예제

나타날 때 한 번 돌거나 반복되는 움직임에는 `@keyframes`를 쓴다. 이름은 무엇이 어떻게 움직이는지 드러나게 짓는다(`toast-slide-in`, `spinner-rotate`). `@keyframes`를 쓰는 CSS 파일에는 같은 파일 안에 `prefers-reduced-motion` 가드를 둔다 — 없으면 검사(R-22)가 경고한다.

### fade-in · scale-in -- 모달 등장

`modal.css`에는 모션이 없어 바로 열린다. 등장 모션이 필요한 프로젝트는 아래처럼 더한다 — 덮개는 옅게, 콘텐츠 상자는 살짝 커지며 나타난다. 모션 감소 설정에서는 크기 변화만 빼고 페이드는 남긴다.

```css
.modal:not([hidden]) .modal__overlay {
  @apply [animation:fade-in_0.2s_ease-out];
}

.modal:not([hidden]) .modal__content {
  @apply [animation:scale-in_0.2s_ease-out];
}

@keyframes fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes scale-in {
  from { opacity: 0; transform: scale(0.95); }
  to   { opacity: 1; transform: scale(1); }
}

/* 모션 감소 — 커지는 움직임만 빼고 페이드로 바꾼다 */
@media (prefers-reduced-motion: reduce) {
  .modal:not([hidden]) .modal__content {
    @apply [animation:fade-in_0.2s_ease-out];
  }
}
```

### slide-in -- 토스트

`toast.css`에서 모션 부분만 발췌했다. 화면 오른쪽에서 2rem 미끄러져 들어오며, 감속 곡선으로 끝을 부드럽게 멈춘다.

```css
.toast {
  @apply [animation:toast-slide-in_0.4s_cubic-bezier(0.0,_0.0,_0.2,_1)];
}

@keyframes toast-slide-in {
  from { opacity: 0; transform: translateX(2rem); }
  to   { opacity: 1; transform: translateX(0); }
}

@media (prefers-reduced-motion: reduce) {
  .toast {
    @apply [animation:none];
  }
}
```

### slide-up -- 카드 순차 등장

목록이 처음 나타날 때 카드를 0.1s 간격으로 올린다. 아래 `.status-board`는 **프로젝트 고유 블록 예시**다(infoUX 카탈로그에 없다). `.card` 전체에 걸면 사이트의 모든 카드가 움직이므로 반드시 그 목록 블록으로 범위를 좁힌다. 마지막 카드의 지연이 0.4s, 움직임이 0.2s라 전체가 0.6s 안에 끝난다.

```css
.status-board > .card {
  @apply [animation:slide-up_0.2s_ease-out_both];
}

.status-board > .card:nth-child(2) { @apply [animation-delay:0.1s]; }
.status-board > .card:nth-child(3) { @apply [animation-delay:0.2s]; }
.status-board > .card:nth-child(4) { @apply [animation-delay:0.3s]; }
.status-board > .card:nth-child(n+5) { @apply [animation-delay:0.4s]; }

@keyframes slide-up {
  from { opacity: 0; transform: translateY(2rem); }
  to   { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  .status-board > .card {
    @apply [animation:none];
  }
}
```

`both`(`animation-fill-mode`)는 지연 시간 동안 첫 프레임(투명)을 유지한다. 빠지면 카드가 보였다가 사라진 뒤 다시 올라온다.

### spin -- 로딩 스피너

`spinner.css`에서 모션 부분만 발췌했다. 로딩 상태 자체는 `role="status"`와 `aria-label="로딩 중"`이 보조기기에 전한다.

```css
.spinner {
  @apply [animation:spinner-rotate_0.8s_linear_infinite];
}

@keyframes spinner-rotate {
  to { transform: rotate(360deg); }
}

/* 모션 감소 — 멈추지 않고 절반 속도로 돈다. 멈춘 스피너는 화면이 굳은 것처럼 보인다 */
@media (prefers-reduced-motion: reduce) {
  .spinner {
    @apply [animation-duration:1.6s];
  }
}
```

## GPU 가속 속성

### 권장 / 금지 비교

**권장: `transform`과 `opacity`만 애니메이션한다** -- Composite 단계만 트리거하여 성능이 좋다. Tailwind v4 유틸리티가 만드는 `translate`·`rotate`·`scale` 개별 속성도 같은 단계에서 처리된다.

```css
/* 링크형 카드 — 위로 2px 들어 올린다. 자리 이동은 margin이 아니라 transform으로 */
.card--link {
  @apply [transition:transform_0.15s_ease-in-out];
}

.card--link:hover {
  @apply [transform:translateY(-2px)];
}
```

**금지 예시: Layout/Paint 트리거 속성을 애니메이션한다**

```css
/* 금지 예시 — Layout 단계를 다시 돌리는 속성 */
.disclosure__panel {
  transition: height 0.4s ease-in-out;     /* 매 프레임 레이아웃 재계산 */
}

.card--link {
  transition: margin-top 0.15s ease-in-out; /* 주변 요소까지 전부 재배치 */
}

/* 금지 예시 — Paint가 큰 속성을 길게 움직인다 */
.card--elevated {
  transition: box-shadow 0.4s ease-in-out;  /* 매 프레임 다시 칠한다 — 0.15s 짧은 피드백에만 쓴다 */
}
```

**대체 패턴: 위치 이동은 `top`·`left`·`right`가 아니라 `transform`으로**

```css
/* 금지 예시 — right 값으로 화면 밖에 두고 움직인다 */
.side-panel {
  right: -48rem;
  transition: right 0.4s ease-in-out;
}

.side-panel[aria-hidden="false"] {
  right: 0;
}
```

권장 코드는 위 「단계별 적용 코드」 느림 단계의 사이드 패널과 같다. 자리는 `right: 0`에 고정하고, 화면 밖으로는 `translateX(100%)`로 보낸다.

### 속성별 성능 비교

| 속성 | 렌더링 단계 | 성능 | 권장 |
|------|------------|------|------|
| `transform` · `translate` · `rotate` · `scale` | Composite | 좋음 | 권장 |
| `opacity` | Composite | 좋음 | 권장 |
| `filter` | Paint | 보통 | 주의 |
| `background-color` | Paint | 보통 | 가능 |
| `box-shadow` | Paint | 느림 | 주의 |
| `width`, `height` | Layout | 나쁨 | 금지 |
| `margin`, `padding` | Layout | 나쁨 | 금지 |
| `top`, `left`, `right` | Layout | 나쁨 | `transform` 대체 |

## prefers-reduced-motion 대응

접근성을 위해 모션 감소 설정을 존중해야 한다. 전정 장애(vestibular disorder) 사용자를 위한 필수 대응이다(R-22).

### 컴포넌트별 가드 -- 기본

infoUX 컴포넌트는 움직임이 있는 규칙 바로 옆에 가드를 둔다. 무엇을 끌지는 움직임의 목적에 따라 다르다.

| 컴포넌트 | 모션 감소 시 | 이유 |
|----------|-------------|------|
| `side-panel` | `transition: none` — 바로 열고 닫는다 | 큰 면적이 화면을 가로지른다 |
| `toast` | `animation: none` — 제자리에 바로 나타난다 | 진입 움직임은 장식이다 |
| `spinner` | 회전을 절반 속도(1.6s)로 | 멈추면 진행 중이라는 신호가 사라진다 |

움직임을 없애도 피드백은 남긴다. 링크형 카드는 모션 감소 시 들어 올리기만 끄고 그림자 변화는 그대로 둔다.

```css
@media (prefers-reduced-motion: reduce) {
  a.card:hover,
  .card--link:hover {
    @apply [transform:none];
  }
}
```

### 전역 리셋 -- 선택

프로젝트가 직접 만든 모션이 많아 하나하나 가드하기 어려우면 `3-generic` 레이어의 `reset.css` 끝에 전역 리셋을 둘 수 있다(`references/accessibility.md` 9. 동작·모션). infoUX의 `reset.css`에는 들어 있지 않다.

```css
/* src/styles/3-generic/reset.css 끝에 더한다 */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;   /* 접근성 필수 오버라이드 — 제거가 아니라 즉시 완료 */
    animation-iteration-count: 1 !important; /* 접근성 필수 오버라이드 */
    transition-duration: 0.01ms !important;  /* 접근성 필수 오버라이드 */
    scroll-behavior: auto !important;        /* 접근성 필수 오버라이드 */
  }
}
```

> `!important` 사용 사유: 전역 접근성 리셋은 모든 컴포넌트의 애니메이션을 확실히 끝내야 하므로 예외적으로 허용한다(R-02 — 사유 주석 필수). 이 리셋은 컴포넌트별 선택도 덮는다. 스피너의 「절반 속도로 계속 돌기」도 한 바퀴 만에 멈추므로, 전역 리셋을 둔 프로젝트는 스피너 옆에 「불러오는 중」 같은 글자를 함께 보여 준다.

## will-change 사용 규칙

`will-change`는 브라우저에게 변경 예정 속성을 알려 최적화를 준비하게 한다. 남용하면 메모리 낭비. 브라우저는 `transform`·`opacity` 애니메이션이 시작되면 스스로 합성 레이어를 만들므로 대부분은 쓰지 않아도 된다.

### 규칙

1. **항상 애니메이션되는 요소에만** 적용한다
2. **호버/포커스 시에만 활성화**하는 것이 이상적이다
3. **`will-change: auto`가 아닌 구체적 속성**을 명시한다
4. **동시에 3개 이상 요소에 적용하지 않는다**

```css
/* 권장 — 호버하는 동안에만 켠다. 호버가 끝나면 자동으로 꺼진다 */
.card--link:hover {
  @apply [will-change:transform];
}

/* 권장 — 계속 도는 요소에, 움직이는 속성 하나만 */
.spinner {
  @apply [will-change:transform];
}
```

```css
/* 금지 예시 — 모든 요소에 적용 */
* {
  will-change: transform, opacity;
}

/* 금지 예시 — 다수 속성 나열 */
.card {
  will-change: transform, opacity, background-color, box-shadow, border;
}
```

## 체크리스트

- [ ] 전환 시간이 세 단계(0.15s·0.2s·0.4s) 안에 있고 0.5s를 넘지 않는가
- [ ] 정의되지 않은 변수(`var(--duration-*)` 등)를 쓰지 않았는가
- [ ] `transform`, `opacity` 위주로 애니메이션하는가
- [ ] `rotate-*`·`scale-*`·`translate-*` 유틸리티를 쓸 때 `transition`에 그 속성 이름(`rotate` 등)을 적었는가
- [ ] `width`, `height`, `margin`, `padding`을 애니메이션하지 않는가
- [ ] `top`, `left`, `right` 대신 `transform: translate()`를 사용하는가
- [ ] 열림·닫힘을 ARIA·`hidden` 속성 선택자로 그리는가 — `.is-*`·`.has-*` 상태 클래스가 없는가 (R-17)
- [ ] `hidden`으로 숨기는 요소의 등장은 `@keyframes`로, 닫힘까지 움직일 요소는 `visibility`+`transform`으로 만들었는가
- [ ] 애니메이션이 있는 파일마다 `prefers-reduced-motion: reduce` 가드를 두었는가 (R-22)
- [ ] `will-change`를 남용하지 않는가 (3개 이상 요소 동시 사용 금지)
- [ ] 순수 장식 목적의 과도한 애니메이션이 아닌가
- [ ] `!important` 없이 트랜지션이 동작하는가 (reduced-motion 전역 리셋 예외)
- [ ] 스태거드 애니메이션이 0.6s 안에 끝나는가
- [ ] `transition: all` 사용하지 않고 속성을 명시하는가 (예: `[transition:opacity_0.2s_ease-out,_transform_0.2s_ease-out]`)
- [ ] 애니메이션이 사용자 입력에 의해 중단 가능한가 (인터럽트 가능)
- [ ] SVG 애니메이션에 `<g>` 래퍼 + `transform-box: fill-box; transform-origin: center` 사용하는가
- [ ] `transform-origin`을 정확히 설정했는가
