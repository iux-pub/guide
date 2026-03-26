---
title: 카드
order: 3
playground_src: /playground/card.html
preview_height: 600
---

## 기본 마크업

```html
<article class="card">
  <div class="card__header">
    <h3 class="card__title">카드 제목</h3>
  </div>
  <div class="card__body">
    <p class="card__text">카드 본문 텍스트입니다.</p>
  </div>
  <div class="card__footer">
    <button type="button" class="btn btn--primary">확인</button>
  </div>
</article>
```

## Variant 목록

| Variant | 클래스 | 용도 |
|---------|--------|------|
| 기본 | `.card` | 세로 레이아웃 (header/body/footer) |
| 가로형 | `.card--horizontal` | tablet-up에서 이미지 좌측 + 콘텐츠 우측 |
| 이미지형 | `.card--image` | 상단 이미지 + 콘텐츠 |
| Featured | `.card--featured` | accent 테두리 강조 |

## 이미지형 카드

```html
<article class="card card--image">
  <div class="card__media">
    <img class="card__image" src="image.jpg" alt="이미지 설명">
  </div>
  <div class="card__body">
    <h3 class="card__title">이미지 카드</h3>
    <p class="card__text">이미지가 상단에 위치하는 카드입니다.</p>
  </div>
</article>
```

## 가로형 카드

```html
<article class="card card--horizontal">
  <div class="card__media">
    <img class="card__image" src="image.jpg" alt="이미지 설명">
  </div>
  <div class="card__body">
    <h3 class="card__title">가로형 카드</h3>
    <p class="card__text">tablet-up에서 이미지가 좌측에 위치합니다.</p>
  </div>
</article>
```

## 접근성 주의사항

- `<article>` 시맨틱 태그 사용
- 이미지에 반드시 `alt` 속성 제공
- 카드 제목은 적절한 heading 레벨 사용
- 카드 전체가 링크인 경우 제목에 링크를 걸고 `::after`로 클릭 영역 확장 권장

## SCSS 파일

`src/scss/6-components/_card.scss`
