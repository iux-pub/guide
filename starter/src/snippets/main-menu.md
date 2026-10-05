# 주 메뉴 (Main Menu) — KRDS

드롭다운형·메가형 주 내비게이션. 헤더 안에서 사용한다. 하위 메뉴는 **disclosure 패턴**(버튼이 링크 목록을 열고 닫는다)이다.

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

## 시맨틱 구조

- **Root 태그**: `<nav class="main-menu" aria-label="주 메뉴">`
- **자식**: `ul.main-menu__list` → `li.main-menu__item` → `a.main-menu__link`(이동) 또는 `button.main-menu__toggle`(하위 패널 열기)
- **필수 ARIA**: `nav`에 `aria-label` · 토글 버튼에 `aria-expanded` + `aria-controls` · 현재 페이지에 `aria-current="page"`
- **쓰지 않는 것**: `role="menu"` · `role="menuitem"` · `aria-haspopup` — 링크 목록을 펼치는 것일 뿐 애플리케이션 메뉴가 아니다

> 상세: `references/html-semantics.md#main-menu`

## Variant

| Variant | 클래스 | 용도 |
|---------|--------|------|
| 드롭다운 | (기본) | 항목 아래 작은 목록. 하위 링크가 한 줄로 끝나는 메뉴 |
| 메가 | `.main-menu--mega` | 헤더 전체 폭 패널에 그룹별로 나눈 링크. 하위 링크가 많거나 그룹이 있는 메뉴 |

### 메가 메뉴

패널이 헤더 전체 폭으로 열린다. 그룹 제목은 링크가 아니라 텍스트이고, 목록은 `aria-labelledby`로 그룹 이름을 받는다.

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
              <li><a class="main-menu__sublink" href="/apply/certificate">증명서 발급</a></li>
            </ul>
          </div>
          <div class="main-menu__group">
            <p class="main-menu__group-title" id="mega-service-lookup">조회</p>
            <ul class="main-menu__group-list" aria-labelledby="mega-service-lookup">
              <li><a class="main-menu__sublink" href="/lookup/status" aria-current="page">처리 현황</a></li>
              <li><a class="main-menu__sublink" href="/lookup/history">신청 내역</a></li>
            </ul>
          </div>
        </div>
      </div>
    </li>

    <li class="main-menu__item">
      <a class="main-menu__link" href="/notice">공지사항</a>
    </li>
  </ul>
</nav>
```

## 동작 (JS)

`src/js/disclosure-nav.js` — 드롭다운·메가 공통.

- 토글 버튼 클릭(`Enter`/`Space`) → 해당 `aria-controls` 패널의 `hidden` 토글 + `aria-expanded` 갱신. 다른 패널은 닫는다
- `Esc` → 열린 패널을 닫고 **초점을 토글 버튼으로 되돌린다**
- 메뉴 바깥 클릭 → 닫기
- `Tab`으로 열린 항목 밖으로 초점이 나가면 닫기
- 방향키 운용은 하지 않는다 — 링크는 `Tab`으로 순서대로 지난다
- 마우스를 올리는 것만으로는 열지 않는다(클릭 전용). 호버로 열리면 WCAG 1.4.13(호버 콘텐츠)을 따로 만족시켜야 한다

## 접근성

- 하위 메뉴 트리거는 `<button>` (링크가 아니므로 `<a>` 쓰지 않는다)
- `aria-expanded`(`true`/`false`) + `aria-controls`(패널 id) — 연결 대상 id가 실제로 존재해야 한다
- 패널은 `hidden` 속성으로 노출을 제어한다 — 닫힌 패널의 링크는 Tab 순서에서 빠진다
- 현재 페이지는 `aria-current="page"`. 패널 안에 현재 페이지가 있어도 토글 버튼은 그대로 둔다
- 링크 터치 영역 44px 이상 — 패널 링크는 `min-h-[4.4rem]`를 포함한다
- 초점 외곽선: 칸을 꽉 채우는 패널 링크는 `outline-offset`을 음수로 두어 안쪽에 그린다
- 아이콘은 장식 — `aria-hidden="true"`, 의미는 옆 텍스트가 전한다
- 메가 패널이 열려 있어도 본문 스크롤을 막지 않는다. 포커스 트랩이 없다(모달이 아니다)

## 출처

- WAI-ARIA APG: Disclosure Navigation Menu (https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/)
- CSS: `src/styles/6-components/main-menu.css`
- JS: `src/js/disclosure-nav.js`
- 아이콘: `chevron-down` 스프라이트 — `/assets/icons/sprite.svg` (아이콘 카탈로그, R-27)
