# 브레드크럼 (Breadcrumb)

## 기본 마크업

```html
<nav class="breadcrumb" aria-label="현재 위치">
  <ol class="breadcrumb__list">
    <li class="breadcrumb__item breadcrumb__item--mobile-hidden">
      <a href="/" class="breadcrumb__link">홈</a>
    </li>
    <li class="breadcrumb__item breadcrumb__item--mobile-hidden">
      <a href="/category" class="breadcrumb__link">카테고리</a>
    </li>
    <li class="breadcrumb__item">
      <a href="/category/sub" class="breadcrumb__link">하위 카테고리</a>
    </li>
    <li class="breadcrumb__item">
      <span class="breadcrumb__current" aria-current="page">현재 페이지</span>
    </li>
  </ol>
</nav>
```

## Variant 목록

| Element | 클래스 | 용도 |
|---------|--------|------|
| Nav | `.breadcrumb` | `<nav aria-label="현재 위치">` |
| List | `.breadcrumb__list` | `<ol>` 순서 있는 목록 |
| Item | `.breadcrumb__item` | `<li>` 항목 |
| Item (모바일 숨김) | `.breadcrumb__item--mobile-hidden` | 모바일에서 숨김, tablet-up에서 표시 |
| Link | `.breadcrumb__link` | 이전 페이지 링크 |
| Current | `.breadcrumb__current` | 현재 위치 (링크 아님, 텍스트) |
| Separator | CSS `::before` | `/` 구분자 (스크린리더 자동 무시) |

### 간단한 2단계 브레드크럼

```html
<nav class="breadcrumb" aria-label="현재 위치">
  <ol class="breadcrumb__list">
    <li class="breadcrumb__item">
      <a href="/" class="breadcrumb__link">홈</a>
    </li>
    <li class="breadcrumb__item">
      <span class="breadcrumb__current" aria-current="page">현재 페이지</span>
    </li>
  </ol>
</nav>
```

## 접근성 주의사항

- `<nav>` 태그 + `aria-label="현재 위치"` 필수
- `<ol>` 순서 목록 사용 (경로의 계층 구조를 의미적으로 표현)
- 현재 위치 항목에 `aria-current="page"` 필수 지정
- 현재 위치는 링크가 아닌 `<span>` 사용 (이동할 수 없는 현재 페이지)
- 구분자는 CSS `::before` pseudo-element로 처리 (스크린리더에서 자동 무시)
- `<ol>` 목록이므로 스크린리더가 "N개 항목 중 M번째"로 읽어줌
- 모바일에서 `.breadcrumb__item--mobile-hidden`으로 상위 경로 숨김 (마지막 2단계만 표시)

## SCSS 파일

`src/scss/6-components/_breadcrumb.scss`
