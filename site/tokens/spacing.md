---
title: 간격 토큰
order: 4
---

간격 토큰은 `src/scss/1-settings/_tokens-spacing.scss`에 정의되어 있다. 4px 기반 스케일로 구성되며, 62.5% REM 트릭이 적용된다 (1rem = 10px).

## 간격 스케일

| 토큰 | 값 | px 환산 | 용도 |
|------|-----|---------|------|
| `--spacing-xs` | `0.4rem` | 4px | 아이콘과 텍스트 사이, 매우 좁은 간격 |
| `--spacing-sm` | `0.8rem` | 8px | 인접 요소 간 좁은 간격 |
| `--spacing-md` | `1.6rem` | 16px | 기본 패딩, 요소 간 표준 간격 |
| `--spacing-lg` | `2.4rem` | 24px | 섹션 내부 여백 |
| `--spacing-xl` | `3.2rem` | 32px | 섹션 간 간격 |
| `--spacing-2xl` | `4.8rem` | 48px | 큰 섹션 구분 |
| `--spacing-3xl` | `6.4rem` | 64px | 페이지 레벨 여백 |

## 사용 원칙

- **4px 배수 유지:** 토큰에 정의된 값만 사용한다. 임의의 px 값을 넣지 않는다
- **일관된 리듬:** 같은 계층의 요소에는 같은 토큰을 사용한다
- **반응형 조정:** 모바일에서 `--spacing-sm`, PC에서 `--spacing-md`처럼 브레이크포인트별로 조정한다

## 사용 예시

```scss
@use '../2-tools/responsive' as resp;

// 카드 컴포넌트 패딩
.card {
  padding: var(--spacing-sm);

  @include resp.respond-to('tablet') {
    padding: var(--spacing-md);
  }

  @include resp.respond-to('pc') {
    padding: var(--spacing-lg);
  }

  &__header {
    margin-bottom: var(--spacing-sm);
  }

  &__body {
    padding: var(--spacing-md);
  }
}

// 섹션 간격
.section {
  margin-bottom: var(--spacing-xl);

  @include resp.respond-to('pc') {
    margin-bottom: var(--spacing-2xl);
  }
}
```
