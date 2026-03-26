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

```scss
// DO: 토큰 사용
.card {
  transition: transform var(--transition-base);
}

.btn {
  transition: background-color var(--transition-fast);
}

.modal {
  transition: opacity var(--transition-base);
}

// DON'T: 하드코딩
.card {
  transition: transform 0.3s ease;
}
```

### 토큰 참조

| 토큰 | 값 | 용도 |
|------|-----|------|
| `var(--transition-fast)` | 0.15s ease | 호버, 포커스, 작은 요소 변화 |
| `var(--transition-base)` | 0.3s ease | 일반적인 상태 변화 |
| `var(--transition-slow)` | 0.5s ease | 모달, 페이드 인/아웃, 큰 요소 변화 |

## GPU 가속 속성

### 권장 속성 (Composite 단계만 트리거)

렌더링 파이프라인의 마지막 단계(Composite)만 트리거하여 성능이 좋다.

```scss
// DO: GPU 가속 속성
.card {
  transition: transform var(--transition-base), opacity var(--transition-base);

  &:hover {
    transform: translateY(-4px);
    opacity: 0.95;
  }
}
```

### 비권장 속성 (Layout/Paint 트리거)

이 속성들은 레이아웃 재계산이나 리페인트를 일으킨다.

```scss
// DON'T: 레이아웃 트리거 속성
.card {
  transition: width 0.3s, height 0.3s, margin 0.3s, padding 0.3s;
}

// DON'T: 페인트 트리거 속성
.card {
  transition: background-color 0.3s, box-shadow 0.3s, border 0.3s;
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

`3-generic` 레이어에 전역 리셋을 추가한다.

```scss
// src/scss/3-generic/_reduced-motion.scss

// 모션 감소 선호 시 모든 애니메이션/트랜지션 비활성화
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important; // 즉시 완료 (제거가 아님)
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### 컴포넌트별 세밀한 대응

전역 리셋 외에 컴포넌트별로 대안 경험을 제공할 수도 있다.

```scss
// 모달 페이드 인/아웃
.modal {
  opacity: 0;
  transform: translateY(-20px);
  transition: opacity var(--transition-base), transform var(--transition-base);

  &.is-open {
    opacity: 1;
    transform: translateY(0);
  }

  // 모션 감소: 트랜지션 없이 즉시 표시
  @media (prefers-reduced-motion: reduce) {
    transition: none;
    transform: none;

    &.is-open {
      transform: none;
    }
  }
}
```

```scss
// 로딩 스피너: 애니메이션 대신 정적 표시
.spinner {
  animation: spin 1s linear infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    // 대안: 정적 로딩 텍스트 표시
    &::after {
      content: '로딩 중...';
    }
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
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

## 애니메이션 작성 패턴

### 간단한 상태 변화: transition

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
```

### 반복/복잡한 움직임: @keyframes

```scss
// 페이드 인
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.toast {
  animation: fade-in var(--transition-base) forwards;
}
```

## 체크리스트

- [ ] 트랜지션 시간에 디자인 토큰(`--transition-*`)을 사용하는가
- [ ] `transform`, `opacity` 위주로 애니메이션하는가
- [ ] `width`, `height`, `margin`, `padding`을 애니메이션하지 않는가
- [ ] `prefers-reduced-motion: reduce` 미디어 쿼리를 적용했는가
- [ ] `will-change`를 남용하지 않는가 (3개 이상 요소 동시 사용 금지)
- [ ] 순수 장식 목적의 과도한 애니메이션이 아닌가
- [ ] `!important` 없이 트랜지션이 동작하는가 (reduced-motion 전역 리셋 예외)
