---
title: CSS 애니메이션/트랜지션
order: 5
---

애니메이션과 트랜지션은 사용자 경험을 향상하지만, 잘못 사용하면 성능 저하와 접근성 문제를 일으킨다. 팀 표준 규칙을 정리한다.

## 기본 원칙

1. **디자인 토큰 사용** -- 트랜지션 시간은 토큰으로 통일한다
2. **GPU 가속 속성 우선** -- `transform`, `opacity`를 사용한다
3. **접근성 대응 필수** -- `prefers-reduced-motion` 미디어 쿼리를 적용한다
4. **과도한 애니메이션 금지** -- 기능적 목적이 있는 경우에만 사용한다

## 트랜지션 토큰

디자인 토큰에 정의된 값을 사용한다. 하드코딩 금지.

### 토큰 참조

| 토큰 | 값 | 용도 |
|------|-----|------|
| `var(--transition-fast)` | 0.1s ease | 호버, 포커스, 작은 요소 변화 |
| `var(--transition-base)` | 0.3s ease | 일반적인 상태 변화 |
| `var(--transition-slow)` | 0.5s ease | 모달, 페이드 인/아웃, 큰 요소 변화 |

### 토큰별 실제 적용 코드

**`--transition-fast` (0.1s)** -- 호버, 포커스 등 즉각적 피드백

```scss
// 버튼 호버
.btn {
  background-color: var(--color-primary);
  transition: background-color var(--transition-fast);

  &:hover {
    background-color: var(--color-primary-dark);
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }
}

// 링크 호버
.nav__link {
  color: var(--color-text);
  transition: color var(--transition-fast);

  &:hover {
    color: var(--color-primary);
  }
}

// 아이콘 버튼 배경
.icon-btn {
  background-color: transparent;
  transition: background-color var(--transition-fast);

  &:hover {
    background-color: var(--color-bg-secondary);
  }
}
```

**`--transition-base` (0.3s)** -- 일반적인 상태 변화

```scss
// 카드 호버 리프트
.card {
  box-shadow: var(--shadow-sm);
  transition: box-shadow var(--transition-base), transform var(--transition-base);

  &:hover {
    box-shadow: var(--shadow-lg);
    transform: translateY(-4px);
  }
}

// 모달 페이드 인
.modal {
  opacity: 0;
  transform: translateY(-20px);
  transition: opacity var(--transition-base), transform var(--transition-base);

  &.is-open {
    opacity: 1;
    transform: translateY(0);
  }
}

// 드롭다운 열기
.dropdown__menu {
  opacity: 0;
  transform: translateY(-8px);
  pointer-events: none;
  transition: opacity var(--transition-base), transform var(--transition-base);

  &.is-active {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
  }
}
```

**`--transition-slow` (0.5s)** -- 큰 요소의 등장/퇴장

```scss
// 사이드바 슬라이드
.sidebar {
  transform: translateX(-100%);
  transition: transform var(--transition-slow);

  &.is-open {
    transform: translateX(0);
  }
}

// 모달 배경 오버레이
.modal__backdrop {
  opacity: 0;
  transition: opacity var(--transition-slow);

  &.is-visible {
    opacity: 1;
  }
}

// 페이지 전환 페이드
.page-transition {
  opacity: 0;
  transition: opacity var(--transition-slow);

  &.is-entered {
    opacity: 1;
  }
}
```

### 하드코딩 금지 비교

```scss
// DON'T: 하드코딩
.card {
  transition: transform 0.3s ease;
}

.btn {
  transition: background-color 0.15s ease-in-out;
}

// DO: 토큰 사용
.card {
  transition: transform var(--transition-base);
}

.btn {
  transition: background-color var(--transition-fast);
}
```

## @keyframes 예제

반복되거나 복잡한 움직임에는 `@keyframes`를 사용한다.

### fade-in (페이드 인)

```scss
@keyframes fade-in {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

// 사용: 토스트 알림
.toast {
  animation: fade-in var(--transition-base) forwards;
}

// 사용: 페이지 진입 시 콘텐츠
.page__content {
  animation: fade-in var(--transition-slow) forwards;
}
```

### slide-up (아래에서 위로 슬라이드)

```scss
@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 사용: 카드 스태거드 리빌
.card {
  animation: slide-up var(--transition-base) forwards;

  // 스태거드 딜레이 (각 카드에 순차 지연)
  @for $i from 1 through 6 {
    &:nth-child(#{$i}) {
      animation-delay: #{($i - 1) * 0.1}s;
    }
  }
}

// 사용: 모달 등장
.modal__dialog {
  animation: slide-up var(--transition-base) forwards;
}
```

### spin (회전 -- 로딩 스피너)

```scss
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

// 사용: 로딩 스피너
.spinner {
  display: inline-block;
  width: 24px;
  height: 24px;
  border: 2px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: var(--radius-full);
  animation: spin 0.8s linear infinite;
}
```

### scale-in (스케일 인 -- 팝업 효과)

```scss
@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.9);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

// 사용: 툴팁 등장
.tooltip {
  animation: scale-in var(--transition-fast) forwards;
}
```

## GPU 가속 속성

### Do / Don't 비교

**DO: `transform`과 `opacity`만 애니메이션한다** -- Composite 단계만 트리거하여 성능이 좋다.

```scss
// DO: GPU 가속 (Composite만 트리거)
.card {
  transition: transform var(--transition-base), opacity var(--transition-base);

  &:hover {
    transform: translateY(-4px);
    opacity: 0.95;
  }
}

// DO: 위치 이동은 transform으로
.tooltip {
  transition: transform var(--transition-fast), opacity var(--transition-fast);

  &.is-visible {
    transform: translateY(0);
    opacity: 1;
  }
}
```

**DON'T: Layout/Paint 트리거 속성을 애니메이션하지 않는다**

```scss
// DON'T: Layout 트리거 (width, height, margin, padding, top, left)
.panel {
  transition: width 0.3s, height 0.3s;     // 매 프레임 레이아웃 재계산
  transition: margin 0.3s, padding 0.3s;   // 주변 요소 전부 재배치
  transition: top 0.3s, left 0.3s;         // transform: translate() 사용하라
}

// DON'T: Paint 트리거 주의
.card {
  transition: box-shadow 0.3s;             // 가능하지만 느림
  transition: border 0.3s;                 // 리페인트 발생
}
```

**대체 패턴: Layout 속성 대신 transform 사용**

```scss
// DON'T: top/left로 위치 이동
.dropdown {
  top: 0;
  transition: top 0.3s;

  &.is-open {
    top: 40px;
  }
}

// DO: transform으로 위치 이동
.dropdown {
  transform: translateY(0);
  transition: transform var(--transition-base);

  &.is-open {
    transform: translateY(40px);
  }
}
```

### 속성별 성능 비교

| 속성 | 렌더링 단계 | 성능 | 권장 |
|------|------------|------|------|
| `transform` | Composite | 좋음 | 권장 |
| `opacity` | Composite | 좋음 | 권장 |
| `filter` | Paint | 보통 | 주의 |
| `background-color` | Paint | 보통 | 가능 |
| `box-shadow` | Paint | 느림 | 주의 |
| `width`, `height` | Layout | 나쁨 | 금지 |
| `margin`, `padding` | Layout | 나쁨 | 금지 |
| `top`, `left` | Layout | 나쁨 | `transform` 대체 |

## prefers-reduced-motion 대응

접근성을 위해 모션 감소 설정을 존중해야 한다. 전정 장애(vestibular disorder) 사용자를 위한 필수 대응이다.

### 전역 리셋 패턴

`3-generic` 레이어에 전역 리셋을 추가한다. 이 코드 하나로 모든 애니메이션이 즉시 완료된다.

```scss
// src/scss/3-generic/_reduced-motion.scss

// 모션 감소 선호 시 모든 애니메이션/트랜지션 비활성화
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important; // 즉시 완료 (제거가 아님) -- reduced-motion 전역 리셋
    animation-iteration-count: 1 !important; // reduced-motion 전역 리셋
    transition-duration: 0.01ms !important; // reduced-motion 전역 리셋
    scroll-behavior: auto !important; // reduced-motion 전역 리셋
  }
}
```

> `!important` 사용 사유: 전역 접근성 리셋은 모든 컴포넌트의 애니메이션을 확실히 비활성화해야 하므로 예외적으로 허용한다.

### 컴포넌트별 세밀한 대응

전역 리셋 외에 컴포넌트별로 대안 경험을 제공할 수도 있다. 모션 대신 즉각적 상태 변화를 보여준다.

```scss
// 모달 -- 모션 감소 시 즉시 표시
.modal {
  opacity: 0;
  transform: translateY(-20px);
  transition: opacity var(--transition-base), transform var(--transition-base);

  &.is-open {
    opacity: 1;
    transform: translateY(0);
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
    transform: none;

    &.is-open {
      transform: none;
    }
  }
}

// 카드 호버 -- 모션 감소 시 그림자만 변경 (움직임 없음)
.card {
  transition: box-shadow var(--transition-base), transform var(--transition-base);

  &:hover {
    box-shadow: var(--shadow-lg);
    transform: translateY(-4px);
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;

    &:hover {
      transform: none;          // 움직임 제거
      box-shadow: var(--shadow-lg);  // 시각적 피드백은 유지
    }
  }
}

// 로딩 스피너 -- 모션 감소 시 정적 표시
.spinner {
  animation: spin 0.8s linear infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;

    &::after {
      content: '로딩 중...';
      // 스크린 리더는 aria-live로 별도 처리
    }
  }
}
```

## will-change 사용 규칙

`will-change`는 브라우저에게 변경 예정 속성을 알려 최적화를 준비하게 한다. 남용하면 메모리 낭비.

### 규칙

1. **항상 애니메이션되는 요소에만** 적용한다
2. **호버/포커스 시에만 활성화**하는 것이 이상적이다
3. **`will-change: auto`가 아닌 구체적 속성**을 명시한다
4. **동시에 3개 이상 요소에 적용하지 않는다**

```scss
// DO: 호버 시에만 활성화
.card {
  transition: transform var(--transition-base);

  &:hover {
    will-change: transform;
    transform: translateY(-4px);
  }
}

// DO: 자주 애니메이션되는 요소
.modal__backdrop {
  will-change: opacity;
  transition: opacity var(--transition-base);
}

// DON'T: 모든 요소에 적용
* {
  will-change: transform, opacity;
}

// DON'T: 다수 속성 나열
.card {
  will-change: transform, opacity, background-color, box-shadow, border;
}
```

## 체크리스트

- [ ] 트랜지션 시간에 디자인 토큰(`--transition-*`)을 사용하는가
- [ ] `transform`, `opacity` 위주로 애니메이션하는가
- [ ] `width`, `height`, `margin`, `padding`을 애니메이션하지 않는가
- [ ] `top`, `left` 대신 `transform: translate()`를 사용하는가
- [ ] `prefers-reduced-motion: reduce` 미디어 쿼리를 적용했는가
- [ ] `will-change`를 남용하지 않는가 (3개 이상 요소 동시 사용 금지)
- [ ] 순수 장식 목적의 과도한 애니메이션이 아닌가
- [ ] `!important` 없이 트랜지션이 동작하는가 (reduced-motion 전역 리셋 예외)
- [ ] 스태거드 애니메이션의 총 지연 시간이 0.6s를 넘지 않는가
- [ ] `transition: all` 사용하지 않고 속성을 명시하는가 (예: `transition: opacity 0.3s, transform 0.3s`)
- [ ] 애니메이션이 사용자 입력에 의해 중단 가능한가 (인터럽트 가능)
- [ ] SVG 애니메이션에 `<g>` 래퍼 + `transform-box: fill-box; transform-origin: center` 사용하는가
- [ ] `transform-origin`을 정확히 설정했는가
