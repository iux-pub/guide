# 브레드크럼 (Breadcrumb) — KRDS

페이지 경로 표시. 사용자의 현재 위치를 보여주고 상위 페이지로 빠르게 이동할 수 있게 한다.

## 기본 마크업

```html
<nav class="breadcrumb" aria-label="브레드크럼">
  <ol class="breadcrumb__list">
    <li class="breadcrumb__item"><a href="/">홈</a></li>
    <li class="breadcrumb__item"><a href="/services">서비스</a></li>
    <li class="breadcrumb__item" aria-current="page">신청하기</li>
  </ol>
</nav>
```

## 배치

본문 바로가기 목적지 밖에 둔다(KRDS component_03_01, R-41). `<main id="main">`의 형제로 header와 main 사이에 두고, 타이틀 밴드(`section--intro`) 안에 넣지 않는다. 깊이 2 이하 사이트는 생략할 수 있다.

순서: `header#header` → `nav.breadcrumb` → `main#main`(첫 제목 h1) → `footer#footer`.

## 접근성

- `<nav aria-label="브레드크럼">` 필수 — KRDS가 정한 구획 제목이다(스크린리더 랜드마크 이름). 다른 이름으로 바꾸지 않는다
- `<ol>` 사용 — 순서가 의미를 가짐
- 현재 페이지: `aria-current="page"` + `<a>` 없이 텍스트만 (링크 아님)
- 구분자(`›`)는 CSS `::before`로 그려서 스크린리더에 노출 안 됨 (불필요한 읽기 방지)

## 출처

- CSS: `src/styles/6-components/breadcrumb.css`
- 기준: KRDS 브레드크럼 https://www.krds.go.kr/html/site/component/component_03_03.html
