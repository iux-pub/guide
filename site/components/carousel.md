---
title: 캐러셀
order: 26
---

KRDS 캐러셀(component_04_09) 기준 컴포넌트. 권위 있는 소스는 `src/snippets/carousel.md`이며, BEM·접근성·토큰 매핑 카탈로그는 [references/krds-components.md](https://github.com/iux-pub/guide/blob/main/references/krds-components.md#carousel)에 있다.

## 사용 조건

- 슬라이드는 **5개 이내**다. 6건 이상이면 목록과 전체 목록 페이지 링크로 바꾼다.
- 슬라이드 문구는 HTML 텍스트다. 글자가 든 배너 이미지를 슬라이드로 쓰지 않는다.
- 자동 회전은 `data-carousel-autoplay`로 지정할 때만 켜고, 이때 **정지/재생 버튼이 첫 상호작용 요소**다.

## 자동 회전 마크업 (요약)

```html
<div class="carousel" role="region" aria-roledescription="carousel" aria-label="알림" data-carousel data-carousel-autoplay="6000">
  <div class="carousel__controls">
    <button type="button" class="carousel__toggle" data-carousel-toggle>
      <svg class="icon" aria-hidden="true" focusable="false"><use href="/assets/icons/sprite.svg#pause"></use></svg>
      <span class="sr-only">자동 넘김 정지</span>
    </button>
    <button type="button" class="carousel__nav" data-carousel-prev>
      <svg class="icon" aria-hidden="true" focusable="false"><use href="/assets/icons/sprite.svg#chevron-left"></use></svg>
      <span class="sr-only">이전 슬라이드</span>
    </button>
    <p class="carousel__counter" aria-hidden="true"><span data-carousel-current>1</span> / <span data-carousel-total>3</span></p>
    <div class="carousel__dots" role="group" aria-label="슬라이드 선택">
      <button type="button" class="carousel__dot" data-carousel-goto="0" aria-current="true"><span class="sr-only">1번 슬라이드</span></button>
      <button type="button" class="carousel__dot" data-carousel-goto="1"><span class="sr-only">2번 슬라이드</span></button>
      <button type="button" class="carousel__dot" data-carousel-goto="2"><span class="sr-only">3번 슬라이드</span></button>
    </div>
    <button type="button" class="carousel__nav" data-carousel-next>
      <svg class="icon" aria-hidden="true" focusable="false"><use href="/assets/icons/sprite.svg#chevron-right"></use></svg>
      <span class="sr-only">다음 슬라이드</span>
    </button>
  </div>
  <div class="carousel__viewport">
    <ul class="carousel__track" aria-live="off">
      <li class="carousel__slide" role="group" aria-roledescription="slide" aria-label="1 / 3">
        <a class="carousel__link" href="/notice/view/1024">
          <span class="carousel__body">
            <span class="carousel__title">2026년 하반기 청년 창업 지원 사업 공모</span>
            <span class="carousel__meta">접수 2026.11.03 ~ 11.21</span>
          </span>
        </a>
      </li>
      <!-- 슬라이드 2·3 같은 구조 -->
    </ul>
  </div>
</div>
```

## 접근성 핵심

- 키보드 초점이 들어오면 자동 회전을 멈추고, 재생 버튼을 누르기 전에는 다시 돌지 않는다. 마우스를 올려도 멈춘다.
- 현재 슬라이드 밖은 `inert` + `aria-hidden`으로 초점·보조기기에서 뺀다.
- 1023px 미만은 분수형(1 / 3), 1024px 이상은 점 버튼으로 위치를 보인다. 점 그룹에서 ←→로 넘긴다.
- `prefers-reduced-motion: reduce`이면 자동 회전을 시작하지 않는다.
- 모든 컨트롤은 44×44px 이상이다.

## 파일

- 마크업: `src/snippets/carousel.md`
- CSS: `src/styles/6-components/carousel.css`
- JS: `src/js/carousel.js`
- 미리보기: `src/playground/carousel.html`
- 카탈로그: [krds-components.md#carousel](https://github.com/iux-pub/guide/blob/main/references/krds-components.md#carousel)
