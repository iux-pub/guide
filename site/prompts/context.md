---
title: 대화형 AI 컨텍스트
order: 6
---

## 대상 AI 도구

ChatGPT, Gemini, Claude 웹

## 사용법

아래 내용을 복사하여 AI 도구의 시스템 프롬프트(또는 첫 메시지)에 붙여넣는다.

## 프롬프트

````markdown
# KRDS 원칙 + INFOMIND UX 디자인 시스템 컨텍스트

> **목적:** 대화형 AI에 KRDS 접근성·구조 원칙과 INFOMIND 디자인/퍼블리싱 규칙을 압축 제공
> **대상 AI:** ChatGPT, Gemini, Claude 웹

---

## 기술 스택

- **CSS Framework:** Tailwind v4 (`^4.0.0`) — `@import "tailwindcss"`
- **Tokens:** INFOUX foundation — 출력은 `tokens/build/tokens.css` (`@theme` + CSS Custom Properties)
- **방법론:** ITCSS 5-layer + BEM (5-objects · 6-components 한정)
- **CSS 작성:** 표준 CSS nesting + Tailwind v4 `@apply` 허용

> SCSS는 사용 금지(R-03). 표준 CSS nesting과 Tailwind v4 문법을 사용한다.

## 프로젝트 유형 판정

코드 생성 전에 프로젝트를 `private-corporate`, `admin-cms`, `public-affiliated`, `public-government`, `ecommerce` 중 하나로 판정한다.

- 민간/브랜드/사내/CMS 프로젝트: 공식 배너, 정부 상징, 운영기관 식별자 생성 금지. 체크리스트에서는 N/A
- 공공 산하기관: 기관 정책 또는 과업 요구가 확인된 경우에만 공공 아이덴티티 요소 생성
- 정부 상징 사용 서비스: 공식 배너, 정부 상징 로고, 운영기관 식별자, 공공 푸터 필수 링크를 조건부 생성
- 유형이 불명확하면 정부 아이덴티티 요소를 제외하고 공통 접근성/구조 규칙만 적용

상세 기준: `skill/references/project-profiles.md`

## 디자인 토큰

색상과 기본 폰트는 CSS Custom Properties(`var(--token)`)를 사용하라. 간격·크기·타이포 스케일은 CSS/Tailwind 직접값을 사용한다.

- **색상** (`--color-*`) — 의미 기반 토큰
- **폰트** (`--font-sans`, `--font-mono`) — 전역 기본 폰트

> 전체 토큰 카탈로그 — `skill/references/krds-tokens.md`

## 컴포넌트 (KRDS 기반)

- **폼/액션** — btn, check-radio, file-upload, form, select, switch
- **컨테이너** — accordion, card, disclosure, modal, side-panel, tab
- **내비** — breadcrumb, header, main-menu, pagination
- **피드백** — alert, badge, progress, spinner, step-indicator, tag, toast, tooltip
- **콘텐츠** — calendar, carousel, list, table

> 각 컴포넌트의 BEM·접근성·토큰 매핑 — `skill/references/krds-components.md`

## HTML 기본 골격

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

HTML 컴포넌트화는 페이지 전체가 아니라 `main` 내부의 section 단위로 분리한다.

## 접근성 (KWCAG/WCAG 2.1 AA)

- 색상 대비 4.5:1 이상, 큰 텍스트 3:1 이상 (KRDS 토큰은 AA 통과 조합)
- 터치 영역 ≥ 44×44px (모바일 권장 medium=48px)
- `:focus-visible` 4px primary 외곽선 (reset.css 전역 관리 — 컴포넌트에서 제거 금지)
- 페이지 최상단 `<a href="#main" class="skip-to-content">본문 바로가기</a>`
- 이미지 `alt` 필수, 폼 `<label for>` + `id` 필수
- `role="dialog"` + 포커스 트랩 (모달)

## 반응형

- **모바일 퍼스트** 접근
- CSS `@media` 또는 Tailwind v4 반응형 variant 직접 사용 (SCSS 믹스인 폐지)

## 절대 금지

- SCSS 파일/`@use`/`@forward`/SCSS 변수
- Raw hex/rgb/hsl 색상
- Tailwind 기본 팔레트 raw 컬러 유틸
- 옛 버튼 variant 이름
- 기존 인포마인드 HTML 골격을 무시한 임의 구조
- BEM element 2단계 중첩
- 포커스 외곽선 제거, `div`/ `span` 클릭 핸들러 패턴
- 이미지 `alt` 누락, 폼 `<label>` 누락

## 코딩 스타일

- 들여쓰기 2 spaces, single quote, 주석 한국어
- 세미콜론: CSS 사용, JS/HTML 미사용

````
