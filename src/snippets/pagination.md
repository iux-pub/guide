# 페이지네이션 (Pagination)

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
      <a href="#" class="pagination__link pagination__link--current" aria-current="page" aria-label="페이지 3">3</a>
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
| List | `.pagination__list` | `<ul>` 목록 |
| Item | `.pagination__item` | `<li>` 항목 |
| Item (모바일 숨김) | `.pagination__item--mobile-hidden` | 모바일에서 숨김, tablet-up에서 표시 |
| Link | `.pagination__link` | `<a>` 페이지 링크 -- 최소 44x44px 터치 타겟 |
| Current | `.pagination__link--current` | 현재 페이지 (primary 배경색) |
| Prev | `.pagination__link--prev` | "이전" 버튼 |
| Next | `.pagination__link--next` | "다음" 버튼 |
| Disabled | `.pagination__link--disabled` | 첫/마지막 페이지에서 비활성 |

### 첫 번째 페이지 (이전 버튼 비활성)

```html
<li class="pagination__item">
  <span class="pagination__link pagination__link--prev pagination__link--disabled" aria-label="이전 페이지" aria-disabled="true">
    &lt;
  </span>
</li>
```

## 접근성 주의사항

- `<nav>` 태그 + `aria-label="페이지 네비게이션"` 필수
- 각 숫자에 `aria-label="페이지 N"` 제공
- 현재 페이지에 `aria-current="page"` 필수 지정
- 이전/다음 버튼에 `aria-label="이전 페이지"` / `aria-label="다음 페이지"` 필수
- 비활성 상태는 `<span>` + `aria-disabled="true"` 사용 (링크가 아닌 요소로 변경)
- `focus-visible` 스타일 제공: `outline: 2px solid var(--color-primary); outline-offset: 2px`
- 링크 간 간격 8px 이상 (`gap: --spacing-sm`)
- `prefers-reduced-motion` 대응: 모션 감소 설정 시 transition 비활성화

## SCSS 파일

`src/scss/6-components/_pagination.scss`
