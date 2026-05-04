---
title: 페이지네이션
order: 16
playground_src: /playground/pagination.html
preview_height: 500
---

KRDS 정의 컴포넌트. 권위 있는 소스는 `src/snippets/pagination.md`이며, BEM·접근성·토큰 매핑 카탈로그는 [skill/references/krds-components.md](https://github.com/iux-pub/guide/blob/main/skill/references/krds-components.md#pagination)에 있다.

## 기본 마크업

```html
<nav class="pagination" aria-label="페이지 내비게이션">
  <button type="button" class="pagination__nav" aria-label="이전 페이지">‹</button>
  <ol class="pagination__list">
    <li><a class="pagination__item" href="?p=1">1</a></li>
    <li><a class="pagination__item pagination__item--current" href="?p=2" aria-current="page">2</a></li>
    <li><a class="pagination__item" href="?p=3">3</a></li>
    <li><a class="pagination__item" href="?p=4">4</a></li>
    <li><a class="pagination__item" href="?p=5">5</a></li>
  </ol>
  <button type="button" class="pagination__nav" aria-label="다음 페이지">›</button>
</nav>
```

## 접근성 핵심

- `<nav aria-label="페이지 내비게이션">` 필수
- 현재 페이지: `aria-current="page"`
- 이전/다음 버튼: `aria-label="이전 페이지"` / `aria-label="다음 페이지"` 필수
- `aria-disabled="true"` + `disabled` 같이 사용 (첫/마지막 페이지)

## 파일

- 마크업: `src/snippets/pagination.md`
- CSS: `src/styles/6-components/pagination.css`
- 카탈로그: [krds-components.md#pagination](https://github.com/iux-pub/guide/blob/main/skill/references/krds-components.md#pagination)
