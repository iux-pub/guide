---
title: 주 메뉴
order: 15
playground_src: /playground/main-menu.html
preview_height: 480
---

KRDS 정의 컴포넌트에 메가 변형을 더한 주 내비게이션. 하위 메뉴는 **disclosure 패턴**(버튼이 링크 목록을 열고 닫는다)이다. 권위 있는 소스는 `src/snippets/main-menu.md`이며, BEM·접근성·토큰 매핑 카탈로그는 [references/krds-components.md](https://github.com/iux-pub/guide/blob/main/references/krds-components.md#main-menu)에 있다.

## 기본 마크업

```html
<nav class="main-menu" aria-label="주 메뉴">
  <ul class="main-menu__list">
    <li class="main-menu__item">
      <a class="main-menu__link" href="/about">소개</a>
    </li>

    <li class="main-menu__item">
      <button type="button" class="main-menu__toggle" aria-expanded="false" aria-controls="submenu-services">
        서비스
        <svg class="main-menu__icon icon icon--xsmall" aria-hidden="true"><use href="/assets/icons/sprite.svg#chevron-down"></use></svg>
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

## 메가 메뉴 (--mega)

패널이 헤더 전체 폭으로 열린다. 그룹 제목은 텍스트이고 목록은 `aria-labelledby`로 그룹 이름을 받는다.

```html
<nav class="main-menu main-menu--mega" aria-label="주 메뉴">
  <ul class="main-menu__list">
    <li class="main-menu__item">
      <button type="button" class="main-menu__toggle" aria-expanded="false" aria-controls="mega-service">
        민원 서비스
        <svg class="main-menu__icon icon icon--xsmall" aria-hidden="true"><use href="/assets/icons/sprite.svg#chevron-down"></use></svg>
      </button>
      <div id="mega-service" class="main-menu__panel" hidden>
        <div class="container main-menu__groups">
          <div class="main-menu__group">
            <p class="main-menu__group-title" id="mega-service-apply">신청</p>
            <ul class="main-menu__group-list" aria-labelledby="mega-service-apply">
              <li><a class="main-menu__sublink" href="/apply/permit">허가 신청</a></li>
              <li><a class="main-menu__sublink" href="/apply/report">신고</a></li>
            </ul>
          </div>
        </div>
      </div>
    </li>
  </ul>
</nav>
```

## 접근성 핵심

- 서브메뉴 트리거는 `<button>` (링크가 아니므로 `<a>` 쓰지 않는다)
- `aria-expanded` + `aria-controls` — **`aria-haspopup`·`role="menu"`는 쓰지 않는다.** 링크 목록을 펼칠 뿐이라 메뉴 위젯 역할을 선언하면 스크린리더가 방향키 운용을 기대한다
- 키보드: `Enter`/`Space` 열기·닫기, `Esc` 닫기 후 토글로 초점 복귀, `Tab`이 링크를 순서대로 지난다. 방향키 운용은 없다
- 서브메뉴·패널은 `hidden` 속성으로 노출을 제어한다
- 현재 페이지: `aria-current="page"`
- 초점 외곽선: 칸을 꽉 채우는 패널 링크는 `outline-offset`을 음수로 두어 안쪽에 그린다

## 파일

- 마크업: `src/snippets/main-menu.md`
- CSS: `src/styles/6-components/main-menu.css`
- JS: `src/js/disclosure-nav.js`
- 카탈로그: [krds-components.md#main-menu](https://github.com/iux-pub/guide/blob/main/references/krds-components.md#main-menu)
