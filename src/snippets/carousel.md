# 캐러셀 (Carousel) — KRDS

KRDS 캐러셀(component_04_09) 기준의 스크롤 스냅 슬라이드. 동작은 `src/js/carousel.js`가 맡는다.
메인 비주얼, 본문 안 팝업존처럼 여러 항목을 한 자리에서 번갈아 보여 줄 때 쓴다.

## 사용 조건

- 슬라이드는 **5개 이내**다. 6건 이상이면 캐러셀 대신 목록([list](list.md))과 전체 목록 페이지 링크를 쓴다.
- 중요한 정보를 캐러셀에만 두지 않는다. 같은 정보에 닿는 다른 경로(공지 목록 등)를 함께 둔다.
- 슬라이드 문구는 **HTML 텍스트**다(제목·기간·대상 1~2줄). 글자가 들어간 이미지를 슬라이드로 쓰지 않는다. 발주처가 이미지 배너만 주면 문구를 HTML로 다시 쓰고, 글자 없는 배경 이미지를 요청한다(R-23·WCAG 1.4.5).
- 자동 회전은 지정할 때만 켠다(`data-carousel-autoplay="밀리초"`). 기본은 끈다.
- 슬라이드가 1개면 컨트롤을 숨긴다(JS가 처리).

## 자동 회전 마크업

정지/재생 버튼이 **첫 상호작용 요소**다. 컨트롤 막대는 슬라이드 위에 둬서 문서 순서·초점 순서·보이는 순서를 같게 한다.

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
          <img class="carousel__image" src="/images/main/notice-01.jpg" alt="">
          <span class="carousel__body">
            <span class="carousel__title">2026년 하반기 청년 창업 지원 사업 공모</span>
            <span class="carousel__meta">접수 2026.11.03 ~ 11.21</span>
          </span>
        </a>
      </li>
      <li class="carousel__slide" role="group" aria-roledescription="slide" aria-label="2 / 3">
        <a class="carousel__link" href="/notice/view/1031">
          <img class="carousel__image" src="/images/main/notice-02.jpg" alt="">
          <span class="carousel__body">
            <span class="carousel__title">겨울철 도로 결빙 구간 안내</span>
            <span class="carousel__meta">2026.12.01부터 적용</span>
          </span>
        </a>
      </li>
      <li class="carousel__slide" role="group" aria-roledescription="slide" aria-label="3 / 3">
        <a class="carousel__link" href="/notice/view/1040">
          <img class="carousel__image" src="/images/main/notice-03.jpg" alt="">
          <span class="carousel__body">
            <span class="carousel__title">민원 처리 시스템 점검으로 일시 중단</span>
            <span class="carousel__meta">2026.11.15 02:00 ~ 06:00</span>
          </span>
        </a>
      </li>
    </ul>
  </div>
</div>
```

- 이미지는 문구를 HTML로 옮겼으므로 장식이다(`alt=""`). 이미지 자체에 문구 밖 정보가 있으면 alt로 쓴다.
- 예시의 문구·주소·날짜는 형식 예시다. 실제 값은 Task Contract의 `contentSources`에서 가져온다(R-23).

## 수동 넘김 마크업

자동 회전이 없으면 정지/재생 버튼을 두지 않는다. 나머지 구조는 같다.

```html
<div class="carousel" role="region" aria-roledescription="carousel" aria-label="추천 여행지" data-carousel>
  <div class="carousel__controls">
    <button type="button" class="carousel__nav" data-carousel-prev>
      <svg class="icon" aria-hidden="true" focusable="false"><use href="/assets/icons/sprite.svg#chevron-left"></use></svg>
      <span class="sr-only">이전 슬라이드</span>
    </button>
    <p class="carousel__counter" aria-hidden="true"><span data-carousel-current>1</span> / <span data-carousel-total>2</span></p>
    <button type="button" class="carousel__nav" data-carousel-next>
      <svg class="icon" aria-hidden="true" focusable="false"><use href="/assets/icons/sprite.svg#chevron-right"></use></svg>
      <span class="sr-only">다음 슬라이드</span>
    </button>
  </div>
  <div class="carousel__viewport">
    <ul class="carousel__track" aria-live="polite">
      <li class="carousel__slide" role="group" aria-roledescription="slide" aria-label="1 / 2">…</li>
      <li class="carousel__slide" role="group" aria-roledescription="slide" aria-label="2 / 2">…</li>
    </ul>
  </div>
</div>
<script src="/js/carousel.js" defer></script>
```

## 동작 (src/js/carousel.js)

| 상황 | 동작 | 근거 |
|------|------|------|
| 키보드 초점이 캐러셀에 들어옴 | 자동 회전 정지. 사용자가 재생 버튼을 누르기 전에는 다시 시작하지 않는다 | KRDS · WCAG 2.2.2 |
| 마우스를 올림 | 멈춘다. 내리면 이어 간다(사용자가 정지하지 않았을 때만) | KRDS |
| 탭이 숨겨짐 | 멈춘다 | — |
| `prefers-reduced-motion: reduce` | 자동 회전을 시작하지 않는다 | R-22 |
| 현재 슬라이드 밖 | `inert` + `aria-hidden="true"` — 초점·보조기기에서 뺀다 | KRDS |
| 자동 회전 중 / 정지 | 트랙 `aria-live`를 `off` / `polite`로 바꾼다 | APG |
| 식별자(점) 그룹에서 ←→ | 이전/다음 슬라이드를 고른다 | KRDS |
| 스와이프·드래그 | 스크롤 스냅으로 넘기고 현재 위치를 다시 맞춘다 | KRDS |

## 접근성 · KRDS 요건

- 루트: `role="region"` + `aria-roledescription="carousel"` + `aria-label`(무엇의 캐러셀인지).
- 슬라이드: `role="group"` + `aria-roledescription="slide"` + `aria-label="N / 총수"`.
- 위치 식별자: 1023px 미만은 분수형(`.carousel__counter`), 1024px 이상은 도형형 버튼(`.carousel__dots`, 현재는 `aria-current="true"`). 현재 점은 색과 길이로 구분한다.
- 모든 컨트롤은 44×44px 이상이다(R-13). 아이콘만 있는 버튼은 `sr-only` 텍스트로 이름을 준다.
- 컨트롤과 식별자가 슬라이드 내용을 가리지 않는다.

## 금지

- 6개 이상 슬라이드, 「전체 보기」 모달로 많은 슬라이드를 몰아 보여 주기
- 정지 버튼이 없거나, 이전·다음보다 뒤에 있는 자동 회전
- 글자가 든 배너 이미지 슬라이드
- 초점이 빠진 뒤 저절로 다시 도는 자동 회전

## 출처

- CSS: `src/styles/6-components/carousel.css`
- JS: `src/js/carousel.js`
- 미리보기: `src/playground/carousel.html`
- 기준: KRDS 캐러셀 https://www.krds.go.kr/html/site/component/component_04_09.html
