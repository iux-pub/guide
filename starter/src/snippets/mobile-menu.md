# 모바일 메뉴 (Mobile Menu) — infoUX

헤더 햄버거로 여는 전체 화면 메뉴. 1280px 미만(모바일·태블릿)에서 [주 메뉴](main-menu.md)를 대신한다. 화면 전체를 덮으므로 모달처럼 초점을 가둔다.

## 기본 마크업

헤더의 햄버거 버튼과 패널은 **한 쌍**이다. 패널은 `header` 바깥(페이지 shell의 `body` 직계)에 둔다.

```html
<header id="header" class="site-header">
  <div class="container site-header__inner">
    <a class="site-header__brand" href="/">
      <img src="/logo.svg" alt="기관명">
    </a>
    <div class="site-header__actions">
      <button type="button" class="site-header__toggle" aria-label="전체 메뉴" aria-expanded="false" aria-controls="mobile-menu" data-mobile-menu-open="mobile-menu">
        <svg class="icon" aria-hidden="true"><use href="/assets/icons/sprite.svg#menu"></use></svg>
      </button>
    </div>
  </div>
</header>

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
            <li><a class="mobile-menu__sublink" href="/services/guide">이용 안내</a></li>
          </ul>
        </details>
      </li>
      <li class="mobile-menu__item">
        <a class="mobile-menu__link" href="/notice">공지사항</a>
      </li>
    </ul>
  </nav>
</div>
```

## 시맨틱 구조

- **Root 태그**: `<div class="mobile-menu" role="dialog" aria-modal="true" aria-labelledby="…" hidden>`
- **자식**: `__header`(제목 + 닫기 버튼) → `nav.mobile-menu__nav` → `ul.mobile-menu__list`
- **하위 메뉴**: native `<details>/<summary>` — 열고 닫는 상태를 브라우저가 관리한다. ARIA를 덧붙이지 않는다
- **필수 ARIA**: 패널에 `role="dialog"` + `aria-modal="true"` + `aria-labelledby` · 햄버거에 `aria-expanded` + `aria-controls`

> 상세: `references/html-semantics.md#mobile-menu`

## 동작 (JS)

`src/js/mobile-menu.js`

- 열기: 햄버거(`data-mobile-menu-open="패널 id"`) 클릭 → `hidden` 제거 + 햄버거 `aria-expanded="true"` + 본문 스크롤 잠금 + 첫 포커스 가능 요소(닫기 버튼)로 초점 이동
- 닫기: 닫기 버튼(`data-mobile-menu-close`) 또는 `Esc` → `hidden` 복원 + `aria-expanded="false"` + **햄버거로 초점 복귀**
- 포커스 트랩: `Tab`/`Shift+Tab`이 패널 안에서만 순환한다. 닫힌 `details` 안의 링크는 순환에서 빠진다
- 같은 페이지 앵커(`href="#…"`)를 누르면 메뉴를 닫는다
- 화면이 1280px 이상으로 넓어지면 열려 있던 패널을 정리한다 (주 메뉴가 대신한다)

## 사용 조건

- 하위 단계는 한 단계까지 — `details` 안에 `details`를 또 넣지 않는다. 더 깊으면 메뉴 구조를 다시 짠다
- 패널 안에 검색·로그인 같은 유틸리티를 둘 수 있다. 이 경우에도 닫기 버튼이 항상 첫 번째 포커스 대상이다
- 패널 타이틀은 "전체 메뉴"처럼 기능 이름을 쓴다. 기관 홍보 문구를 넣지 않는다
- 장식 애니메이션은 쓰지 않는다. 열림은 즉시 나타나는 것이 기본이다 (필요하면 fade 150~200ms, `prefers-reduced-motion` 가드 필수 · R-22)

## 접근성

- 패널 열림 중 뒤쪽 콘텐츠는 `aria-modal="true"`로 스크린리더 탐색에서 빠진다
- 햄버거 `aria-label`은 **고정**한다 (`전체 메뉴`). 열림 여부는 `aria-expanded`가 전하므로 라벨을 "열기/닫기"로 바꾸지 않는다
- 닫기 버튼 `aria-label="전체 메뉴 닫기"` 필수 — 아이콘만 있는 버튼이므로
- 아이콘은 모두 장식 — `aria-hidden="true"`. 햄버거·닫기 모양의 텍스트 기호로 아이콘을 대신하지 않는다 (R-27)
- 터치 영역: 햄버거·닫기 44×44px, 항목 56px / 하위 항목 48px (R-13)
- 초점 외곽선: 스크롤 영역(`overflow-y: auto`) 안에서 칸을 꽉 채우는 항목은 바깥 외곽선이 잘리므로 `outline-offset`을 음수로 두어 안쪽에 그린다
- 현재 페이지는 `aria-current="page"`
- 키보드: `Tab` 순환 · `Enter`/`Space`로 `summary` 토글 · `Esc` 닫기

## 출처

- WAI-ARIA APG: Dialog (Modal) — https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
- CSS: `src/styles/6-components/mobile-menu.css`
- JS: `src/js/mobile-menu.js`
- 아이콘: `menu` · `close` · `chevron-down` 스프라이트 — `/assets/icons/sprite.svg` (아이콘 카탈로그, R-27)
