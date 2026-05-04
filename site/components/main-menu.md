---
title: 주 메뉴
order: 15
---

KRDS 정의 컴포넌트. 권위 있는 소스는 `src/snippets/main-menu.md`이며, BEM·접근성·토큰 매핑 카탈로그는 [skill/references/krds-components.md](https://github.com/iux-pub/guide/blob/main/skill/references/krds-components.md#main-menu)에 있다.

## 기본 마크업

```html
<nav class="main-menu" aria-label="주 메뉴">
  <ul class="main-menu__list">
    <li class="main-menu__item">
      <a class="main-menu__link" href="/about">소개</a>
    </li>

    <li class="main-menu__item">
      <button type="button" class="main-menu__link" aria-haspopup="true" aria-expanded="false" aria-controls="submenu-services">
        서비스
      </button>
      <ul id="submenu-services" class="main-menu__submenu" hidden>
        <li><a href="/services/a">서비스 A</a></li>
        <li><a href="/services/b">서비스 B</a></li>
        <li><a href="/services/c" aria-current="page">서비스 C</a></li>
      </ul>
    </li>

    <li class="main-menu__item">
      <a class="main-menu__link" href="/contact">문의</a>
    </li>
  </ul>
</nav>
```

## 접근성 핵심

- 서브메뉴 트리거는 `<button>` 권장 (`<a>` 아님 — 링크가 아니므로)
- `aria-haspopup="true"` + `aria-expanded` 상태값
- `aria-controls`로 서브메뉴 id 연결
- 서브메뉴 `<ul>`은 `hidden` 속성으로 노출 제어
- 현재 페이지: `aria-current="page"`

## 파일

- 마크업: `src/snippets/main-menu.md`
- CSS: `src/styles/6-components/main-menu.css`
- 카탈로그: [krds-components.md#main-menu](https://github.com/iux-pub/guide/blob/main/skill/references/krds-components.md#main-menu)
