---
title: 색상 토큰
order: 2
---

색상은 `tokens/foundation.json`에서 관리하고 `tokens/build/tokens.css`로 발행한다.
컴포넌트 작성 시에는 `--color-*` 시맨틱 토큰을 우선 사용한다.

## 주요 시맨틱 색상

<div class="color-grid">
  <div class="color-swatch" style="background:var(--color-primary);color:#fff">
    <span class="color-swatch__name">--color-primary</span>
    <span class="color-swatch__desc">주요 액션</span>
  </div>
  <div class="color-swatch" style="background:var(--color-primary-hover);color:#fff">
    <span class="color-swatch__name">--color-primary-hover</span>
    <span class="color-swatch__desc">주요 액션 hover</span>
  </div>
  <div class="color-swatch" style="background:var(--color-primary-pressed);color:#fff">
    <span class="color-swatch__name">--color-primary-pressed</span>
    <span class="color-swatch__desc">주요 액션 active</span>
  </div>
  <div class="color-swatch" style="background:var(--color-text);color:#fff">
    <span class="color-swatch__name">--color-text</span>
    <span class="color-swatch__desc">본문 텍스트</span>
  </div>
  <div class="color-swatch" style="background:var(--color-bg);color:#000;border:1px solid var(--color-border-light)">
    <span class="color-swatch__name">--color-bg</span>
    <span class="color-swatch__desc">기본 배경</span>
  </div>
  <div class="color-swatch" style="background:var(--color-surface);color:#000;border:1px solid var(--color-border-light)">
    <span class="color-swatch__name">--color-surface</span>
    <span class="color-swatch__desc">카드/패널 표면</span>
  </div>
</div>

## 상태 색상

<div class="color-grid">
  <div class="color-swatch" style="background:var(--color-info);color:#fff">
    <span class="color-swatch__name">--color-info</span>
  </div>
  <div class="color-swatch" style="background:var(--color-success);color:#fff">
    <span class="color-swatch__name">--color-success</span>
  </div>
  <div class="color-swatch" style="background:var(--color-warning);color:#000">
    <span class="color-swatch__name">--color-warning</span>
  </div>
  <div class="color-swatch" style="background:var(--color-danger);color:#fff">
    <span class="color-swatch__name">--color-danger</span>
  </div>
</div>

## 사용 원칙

- raw hex/rgb/hsl 색상은 사용하지 않는다.
- 기본은 `--color-primary`, `--color-text`, `--color-bg`, `--color-surface`, `--color-border`처럼 의미 기반 토큰을 사용한다.
- 단계 색상은 명도 조정이 필요한 경우에만 `--color-primary-30`, `--color-gray-70`처럼 제한적으로 사용한다.
- 색상 기준을 바꿀 때는 `tokens/foundation.json`만 수정하고 `npm run build:tokens`를 실행한다.

## CSS 예시

```css
.notice {
  @apply bg-[var(--color-info-surface)] text-[var(--color-info-text)] border border-[var(--color-border-information-light)];
}

.button {
  @apply bg-[var(--color-button-primary-fill)] text-[var(--color-text-inverse)];
}
```
