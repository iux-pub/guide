---
title: 페이지네이션
order: 7
playground_src: /playground/pagination.html
preview_height: 300
---

## 기본 마크업

```html
<nav class="pagination" aria-label="페이지 네비게이션">
  <ul class="pagination__list">
    <li class="pagination__item">
      <a href="#" class="pagination__link pagination__link--prev" aria-label="이전 페이지">
        &lt;
      </a>
    </li>
    <li class="pagination__item">
      <a href="#" class="pagination__link" aria-label="페이지 1">1</a>
    </li>
    <li class="pagination__item pagination__item--mobile-hidden">
      <a href="#" class="pagination__link" aria-label="페이지 2">2</a>
    </li>
    <li class="pagination__item pagination__item--mobile-hidden">
      <a href="#" class="pagination__link pagination__link--current"
         aria-current="page" aria-label="페이지 3">3</a>
    </li>
    <li class="pagination__item pagination__item--mobile-hidden">
      <a href="#" class="pagination__link" aria-label="페이지 4">4</a>
    </li>
    <li class="pagination__item">
      <a href="#" class="pagination__link" aria-label="페이지 5">5</a>
    </li>
    <li class="pagination__item">
      <a href="#" class="pagination__link pagination__link--next" aria-label="다음 페이지">
        &gt;
      </a>
    </li>
  </ul>
</nav>
```

## Variant 목록

| Element | 클래스 | 용도 |
|---------|--------|------|
| Nav | `.pagination` | `<nav aria-label="페이지 네비게이션">` |
| List | `.pagination__list` | 페이지 목록 |
| Item | `.pagination__item` | 개별 항목 |
| Item 모바일 숨김 | `.pagination__item--mobile-hidden` | 모바일에서 숨김 |
| Link | `.pagination__link` | 페이지 링크 |
| Current | `.pagination__link--current` | 현재 페이지 |
| Disabled | `.pagination__link--disabled` | 비활성 상태 |

## 첫 번째 페이지 (이전 버튼 비활성)

```html
<li class="pagination__item">
  <span class="pagination__link pagination__link--prev pagination__link--disabled"
        aria-label="이전 페이지" aria-disabled="true">
    &lt;
  </span>
</li>
```

## 접근성 주의사항

- `<nav>` 태그 + `aria-label="페이지 네비게이션"` 필수
- 각 숫자에 `aria-label="페이지 N"` 제공
- 현재 페이지에 `aria-current="page"` 필수
- 비활성 상태는 `<span>` + `aria-disabled="true"` 사용

## SCSS 파일

`src/scss/6-components/_pagination.scss`

## 관련 문서

- [피그마 컴포넌트 네이밍](/figma/component-naming/) -- 피그마에서의 페이지네이션 네이밍 규칙과 BEM 매핑
- [접근성: 페이지네이션](/accessibility/pagination/) -- 페이지네이션 접근성 가이드
