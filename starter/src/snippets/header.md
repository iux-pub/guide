# 사이트 헤더 (Site Header) — KRDS

KRDS 정부 사이트 표준 헤더 패턴. 브랜드 + 주 메뉴 + 액션 영역.

## 기본 마크업

```html
<header class="site-header">
  <div class="container site-header__inner">
    <a class="site-header__brand" href="/">
      <img src="/logo.svg" alt="기관명">
      <span class="site-header__brand-name">기관명</span>
    </a>

    <nav class="site-header__nav" aria-label="주 메뉴">
      <ul class="site-header__menu">
        <li><a href="/about">소개</a></li>
        <li><a href="/services" aria-current="page">서비스</a></li>
        <li><a href="/notice">공지</a></li>
      </ul>
    </nav>

    <div class="site-header__actions">
      <button type="button" class="btn btn--text btn--small">로그인</button>
      <button type="button" class="site-header__toggle" aria-label="메뉴 열기" aria-expanded="false">☰</button>
    </div>
  </div>
</header>
```

## 동작

- 모바일 (< 1024px): 주 메뉴 숨김 + 햄버거 토글 노출
- PC (≥ 1024px): 주 메뉴 노출 + 햄버거 숨김
- `position: sticky` 적용 (스크롤 시에도 상단 유지)

## 접근성

- `<header>` 시맨틱 태그 사용 (페이지당 하나)
- 주 메뉴는 `<nav aria-label="주 메뉴">` (페이지에 nav가 여러 개면 label 필수)
- 현재 페이지 메뉴: `aria-current="page"`
- 모바일 토글: `aria-label="메뉴 열기/닫기"` + `aria-expanded` 상태 토글
- 로고 `<img>` `alt` 텍스트 필수 (KRDS R-09)

## 출처

- CSS: `src/styles/6-components/header.css`
