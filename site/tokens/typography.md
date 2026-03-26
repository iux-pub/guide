---
title: 타이포그래피 토큰
order: 3
---

타이포그래피 토큰은 `src/scss/1-settings/_tokens-typography.scss`에 정의되어 있다. Pretendard GOV 기반이며, 62.5% REM 트릭을 적용한다.

## 62.5% REM 트릭

`html { font-size: 62.5% }` 설정으로 **1rem = 10px**이 된다. px 값을 10으로 나누면 rem 값이 되므로 직관적인 변환이 가능하다.

| px | rem | 계산 |
|----|-----|------|
| 12px | 1.2rem | 12 / 10 |
| 14px | 1.4rem | 14 / 10 |
| 16px | 1.6rem | 16 / 10 |
| 20px | 2rem | 20 / 10 |
| 24px | 2.4rem | 24 / 10 |
| 28px | 2.8rem | 28 / 10 |
| 32px | 3.2rem | 32 / 10 |

## Font Family

| 토큰 | 값 |
|------|-----|
| `--font-family-base` | `'Pretendard GOV', 'Malgun Gothic', 'apple sd gothic neo', sans-serif` |

## Font Size

62.5% 기준으로 1rem = 10px이다.

| 토큰 | 값 | px 환산 |
|------|-----|---------|
| `--font-size-2xl` | `3.2rem` | 32px |
| `--font-size-xl` | `2.8rem` | 28px |
| `--font-size-lg` | `2.4rem` | 24px |
| `--font-size-md` | `2rem` | 20px |
| `--font-size-base` | `1.6rem` | 16px |
| `--font-size-sm` | `1.4rem` | 14px |
| `--font-size-xs` | `1.2rem` | 12px |

## Font Weight

| 토큰 | 값 | 용도 |
|------|-----|------|
| `--font-weight-regular` | `400` | 본문 텍스트 |
| `--font-weight-medium` | `500` | 강조 텍스트 |
| `--font-weight-semibold` | `600` | 소제목 |
| `--font-weight-bold` | `700` | 제목, 강한 강조 |

## Line Height

| 토큰 | 값 | 용도 |
|------|-----|------|
| `--leading-tight` | `1.2` | 제목, 짧은 텍스트 |
| `--leading-base` | `1.6` | 본문 텍스트 |
| `--leading-loose` | `1.8` | 긴 본문, 가독성 필요 시 |

## 사용 예시

```scss
// 제목 스타일
.heading {
  font-family: var(--font-family-base);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  line-height: var(--leading-tight);
}

// 본문 스타일
.body-text {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-regular);
  line-height: var(--leading-base);
}

// 캡션 스타일
.caption {
  font-size: var(--font-size-xs);
  color: var(--color-gray-700);
  line-height: var(--leading-base);
}
```
