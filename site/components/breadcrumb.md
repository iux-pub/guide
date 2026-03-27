---
title: 브레드크럼
order: 8
playground_src: /playground/breadcrumb.html
preview_height: 200
---

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

## 구성 요소

| Element | 클래스 | 용도 |
|---------|--------|------|
| Nav | `.breadcrumb` | `<nav aria-label="현재 위치">` |
| List | `.breadcrumb__list` | `<ol>` 순서 있는 목록 |
| Item | `.breadcrumb__item` | 개별 항목 |
| Item 모바일 숨김 | `.breadcrumb__item--mobile-hidden` | 모바일에서 숨김 |
| Link | `.breadcrumb__link` | 이전 페이지 링크 |
| Current | `.breadcrumb__current` | 현재 위치 (링크 아님) |
| Separator | CSS `::before` | `/` 구분자 |

## 간단한 2단계 브레드크럼

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
- `<ol>` 순서 목록 사용 (계층 구조 의미 표현)
- 현재 위치에 `aria-current="page"` 필수
- 현재 위치는 `<span>` 사용 (링크가 아닌 현재 페이지)
- 구분자는 CSS `::before`로 처리 (스크린리더 자동 무시)
- 모바일에서 `.breadcrumb__item--mobile-hidden`으로 상위 경로 숨김
- 아이템 간 간격 8px (`--spacing-sm`)
- `prefers-reduced-motion` 대응
- 태블릿 이상 폰트 16px

## SCSS 파일

`src/scss/6-components/_breadcrumb.scss`

## 관련 문서

- [피그마 컴포넌트 네이밍](/figma/component-naming/) -- 피그마에서의 브레드크럼 네이밍 규칙과 BEM 매핑
- [접근성: 브레드크럼](/accessibility/breadcrumb/) -- 브레드크럼 접근성 가이드
