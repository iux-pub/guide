---
title: 모바일 메뉴
order: 31
playground_src: /playground/mobile-menu.html
preview_height: 420
---

헤더 햄버거로 여는 전체 화면 메뉴. 권위 있는 소스는 `src/snippets/mobile-menu.md`이며, 1280px 미만에서 [주 메뉴](/components/main-menu/)를 대신한다. 화면 전체를 덮으므로 모달처럼 초점을 가둔다.

## 기본 마크업

```html
<button type="button" class="site-header__toggle" aria-label="전체 메뉴" aria-expanded="false" aria-controls="mobile-menu" data-mobile-menu-open="mobile-menu">
  <svg class="icon" aria-hidden="true"><use href="/assets/icons/sprite.svg#menu"></use></svg>
</button>

<div id="mobile-menu" class="mobile-menu" role="dialog" aria-modal="true" aria-labelledby="mobile-menu-title" hidden>
  <div class="mobile-menu__header">
    <p id="mobile-menu-title" class="mobile-menu__title">전체 메뉴</p>
    <button type="button" class="mobile-menu__close" aria-label="전체 메뉴 닫기" data-mobile-menu-close>
      <svg class="icon" aria-hidden="true"><use href="/assets/icons/sprite.svg#close"></use></svg>
    </button>
  </div>
  <nav class="mobile-menu__nav" aria-label="주 메뉴">
    <ul class="mobile-menu__list">
      <li class="mobile-menu__item">
        <a class="mobile-menu__link" href="/about">소개</a>
      </li>
      <li class="mobile-menu__item">
        <details class="mobile-menu__group">
          <summary class="mobile-menu__summary">
            서비스
            <svg class="mobile-menu__icon icon icon--xsmall" aria-hidden="true"><use href="/assets/icons/sprite.svg#chevron-down"></use></svg>
          </summary>
          <ul class="mobile-menu__sublist">
            <li><a class="mobile-menu__sublink" href="/services/apply">신청</a></li>
            <li><a class="mobile-menu__sublink" href="/services/lookup" aria-current="page">조회</a></li>
          </ul>
        </details>
      </li>
    </ul>
  </nav>
</div>
```

## 동작 (JS)

`src/js/mobile-menu.js`

- 열기: 햄버거 클릭 → `hidden` 제거 + `aria-expanded="true"` + 본문 스크롤 잠금 + 닫기 버튼으로 초점 이동
- 닫기: 닫기 버튼 또는 `Esc` → **햄버거로 초점 복귀**
- `Tab`/`Shift+Tab`이 패널 안에서만 순환한다 (닫힌 `details` 안의 링크는 제외)
- 1280px 이상으로 넓어지면 열려 있던 패널을 정리한다

## 접근성 핵심

- 패널: `role="dialog"` + `aria-modal="true"` + `aria-labelledby`
- 햄버거 `aria-label`은 고정(`전체 메뉴`)하고 열림 여부는 `aria-expanded`가 전한다. "열기/닫기"로 라벨을 바꾸지 않는다
- 아이콘만 있는 버튼에는 `aria-label` 필수. 햄버거·닫기 모양의 텍스트 기호로 아이콘을 대신하지 않는다 (R-27)
- 스크롤 영역 안에서 칸을 꽉 채우는 항목은 `outline-offset`을 음수로 두어 안쪽에 그린다
- 하위 메뉴는 native `details/summary` — ARIA를 덧붙이지 않는다

## 파일

- 마크업: `src/snippets/mobile-menu.md`
- CSS: `src/styles/6-components/mobile-menu.css`
- JS: `src/js/mobile-menu.js`
