# 퍼블리싱 규칙 프롬프트 — KRDS 원칙 + Tailwind v4

대상: Cursor, Copilot, Windsurf, Claude Code

이 규칙을 따라 HTML/CSS 코드를 생성하라.

## CSS 방법론

BEM + Tailwind v4 + 표준 CSS nesting을 사용한다. SCSS 파일, `@use`, `@forward`, `$variable`은 사용하지 않는다.

```css
.section-main {
  @apply relative;

  &__title {
    color: var(--color-text);
  }
}
```

색상은 토큰을 강제한다. 간격/크기/타이포는 반복 패턴에 토큰을 권장하고, 프로젝트 고유 레이아웃 값은 허용한다.

## HTML 기본 골격

큰 영역은 심플하게 잡고 내부 `.container`가 폭과 정렬을 담당한다. `main` 안의 요소는 section 단위로 분리한다.

```html
<header id="header">
  <div class="container">...</div>
</header>

<main id="main">
  <section class="section">
    <div class="container">...</div>
  </section>
</main>

<footer id="footer">
  <div class="container">...</div>
</footer>
```

HTML 컴포넌트화는 페이지 전체가 아니라 `main` 내부 section 단위로 한다.

## 접근성

- `<img>`: alt 필수
- 인터랙티브 요소: aria-label 또는 텍스트 레이블 필수
- 색상 대비: 4.5:1 이상
- 키보드 네비게이션 지원
- skip-to-content 링크 제공
- `:focus { outline: none }` 금지
- `<div onclick>` 금지, `<button>`/`<a>` 사용
- 터치 타겟: 최소 44x44px

## 코딩 스타일

- 들여쓰기: 2 spaces
- 따옴표: single quote
- 주석: 한국어
