---
title: 브레드크럼
order: 13
playground_src: /playground/breadcrumb.html
preview_height: 500
---

KRDS 정의 컴포넌트. 권위 있는 소스는 `src/snippets/breadcrumb.md`이며, BEM·접근성·토큰 매핑 카탈로그는 [skill/references/krds-components.md](https://github.com/iux-pub/guide/blob/main/skill/references/krds-components.md#breadcrumb)에 있다.

## 기본 마크업

```html
<nav class="breadcrumb" aria-label="페이지 경로">
  <ol class="breadcrumb__list">
    <li class="breadcrumb__item"><a href="/">홈</a></li>
    <li class="breadcrumb__item"><a href="/services">서비스</a></li>
    <li class="breadcrumb__item" aria-current="page">신청하기</li>
  </ol>
</nav>
```

## 접근성 핵심

- `<nav aria-label="페이지 경로">` 필수 (스크린리더용 식별자)
- `<ol>` 사용 — 순서가 의미를 가짐
- 현재 페이지: `aria-current="page"` + `<a>` 없이 텍스트만 (링크 아님)
- 구분자(`›`)는 CSS `::before`로 그려서 스크린리더에 노출 안 됨 (불필요한 읽기 방지)

## 파일

- 마크업: `src/snippets/breadcrumb.md`
- CSS: `src/styles/6-components/breadcrumb.css`
- 카탈로그: [krds-components.md#breadcrumb](https://github.com/iux-pub/guide/blob/main/skill/references/krds-components.md#breadcrumb)
