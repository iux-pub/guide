---
title: 카드
order: 8
playground_src: /playground/card.html
preview_height: 500
---

KRDS 정의 컴포넌트. 권위 있는 소스는 `src/snippets/card.md`이며, BEM·접근성·토큰 매핑 카탈로그는 [references/krds-components.md](https://github.com/iux-pub/guide/blob/main/references/krds-components.md#card)에 있다.

## 기본 마크업

```html
<article class="card">
  <header class="card__header">
    <h3 class="card__title">도서관 휴관일 안내</h3>
  </header>
  <div class="card__body">
    <p>매주 월요일과 법정 공휴일에는 휴관합니다. 휴관일에도 무인 반납함은 이용할 수 있습니다.</p>
  </div>
  <footer class="card__footer">
    <button type="button" class="btn btn--text btn--small">자세히</button>
  </footer>
</article>
```

## 접근성 핵심

- 시맨틱 컨테이너: `<article>` (독립 콘텐츠) / `<section>` (관련 섹션) / `<div>` (장식)
- 카드 전체가 링크면 `<a class="card">` 또는 카드 내부 `<a>`만 링크 (이중 링크 금지)
- 카드 내 인터랙티브 요소는 `aria-label`로 컨텍스트 명시 권장

## 파일

- 마크업: `src/snippets/card.md`
- CSS: `src/styles/6-components/card.css`
- 카탈로그: [krds-components.md#card](https://github.com/iux-pub/guide/blob/main/references/krds-components.md#card)
