---
title: 캐러셀
order: 26
---

KRDS 정의 컴포넌트. 권위 있는 소스는 `src/snippets/carousel.md`이며, BEM·접근성·토큰 매핑 카탈로그는 [skill/references/krds-components.md](https://github.com/iux-pub/guide/blob/main/skill/references/krds-components.md#carousel)에 있다.

## 기본 마크업

```html
<div class="carousel" aria-roledescription="carousel" aria-label="추천 항목">
  <div class="carousel__viewport">
    <ol class="carousel__track">
      <li class="carousel__slide" aria-roledescription="slide" aria-label="1 / 3">
        <img src="/img1.jpg" alt="설명">
      </li>
      <li class="carousel__slide" aria-roledescription="slide" aria-label="2 / 3">
        <img src="/img2.jpg" alt="설명">
      </li>
      <li class="carousel__slide" aria-roledescription="slide" aria-label="3 / 3">
        <img src="/img3.jpg" alt="설명">
      </li>
    </ol>
  </div>

  <button type="button" class="carousel__nav carousel__nav--prev" aria-label="이전 슬라이드">‹</button>
  <button type="button" class="carousel__nav carousel__nav--next" aria-label="다음 슬라이드">›</button>

  <div class="carousel__indicators" role="tablist">
    <button type="button" class="carousel__dot" role="tab" aria-selected="true" aria-label="1번 슬라이드"></button>
    <button type="button" class="carousel__dot" role="tab" aria-selected="false" aria-label="2번 슬라이드"></button>
    <button type="button" class="carousel__dot" role="tab" aria-selected="false" aria-label="3번 슬라이드"></button>
  </div>
</div>
```

## 접근성 핵심

- 자동 재생은 **기본 OFF** 권장 — 사용자 통제권 (WCAG 2.2.2)
- 자동 재생 시: 일시정지 버튼 필수 + `prefers-reduced-motion: reduce` 시 자동 비활성
- 인디케이터는 키보드 작동 가능
- 슬라이드별 `aria-label="N / 총수"`로 위치 안내

## 파일

- 마크업: `src/snippets/carousel.md`
- CSS: `src/styles/6-components/carousel.css`
- 카탈로그: [krds-components.md#carousel](https://github.com/iux-pub/guide/blob/main/skill/references/krds-components.md#carousel)
