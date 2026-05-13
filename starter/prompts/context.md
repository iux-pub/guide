# INFOMIND UX 팀 규칙 — KRDS 원칙 + Tailwind v4 (압축 버전)

대상: ChatGPT, Gemini, Claude 웹 — 시스템 프롬프트 또는 첫 메시지로 주입

---

CSS: BEM(Block__Element--Modifier) + Tailwind v4 + ITCSS 5레이어(3-generic/4-elements/5-objects/6-components/7-utilities). **SCSS 사용 금지.** 표준 CSS nesting과 Tailwind v4 `@apply`/`@theme`/`@utility`는 허용.

토큰: 색상은 `var(--color-*)`를 강제한다. 기본 폰트는 `var(--font-sans)`/`var(--font-mono)`를 사용한다. 간격/크기/타이포 스케일은 CMS·관리자 화면처럼 정보 밀도가 중요한 프로젝트 맥락에 맞게 CSS/Tailwind 직접값을 사용한다. 토큰 출처는 `tokens/foundation.json` → `tokens/build/tokens.css`.

반응형: 모바일 퍼스트. CSS `@media` 또는 Tailwind v4 variant 직접 사용 (SCSS 믹스인 폐지). rem 기준은 기존 프로젝트 기준을 따른다.

컴포넌트는 기존 카탈로그 패턴을 우선 사용한다. 카탈로그 밖 패턴은 프로젝트 필요성과 공통화 가능성을 판단해 확장한다.

HTML 기본 골격은 큰 영역을 심플하게 잡고, `main` 안은 `section > .container` 구조로 둔다. HTML 컴포넌트화는 페이지 전체가 아니라 `main` 내부의 section 단위로 분리한다.

```html
<header id="header">
  <div class="container">...</div>
</header>
<main id="main">
  <section class="section">
    <div class="container">...</div>
  </section>
</main>
```

버튼 KRDS variant(4종): `--primary` `--secondary` `--tertiary` `--text`. KRDS size(5종): `--xsmall`(32) `--small`(40) medium(48, 기본) `--large`(56) `--xlarge`(64). 모바일은 medium 이상 권장.

접근성 (KWCAG/WCAG 2.1 AA): 대비 4.5:1 (큰 텍스트 3:1), 터치 ≥44×44px (모바일 medium=48px 권장), `:focus-visible` (reset.css 전역 4px primary 외곽선 — 컴포넌트에서 제거 금지), skip-to-content 필수, `<img alt>` 필수, `<label for>+id` 필수, `div/span 클릭 핸들러 패턴` 금지.

절대 금지: SCSS 파일/`@use`/`@forward`/SCSS 변수, raw hex/rgb/hsl 색상, Tailwind 기본 팔레트 raw 컬러, 옛 버튼 variant(`--ghost`/`--outline`/`--link`/`--sm`/`--lg`), `!important` (사유 주석 없을 시), 인라인 `style="..."` (CSS 변수 주입 외), BEM element 2단계 중첩(`.card__body__title`), 기존 인포마인드 HTML 골격을 무시한 임의 구조.

코딩: 2 spaces, single quote, 한국어 주석. 세미콜론 — CSS 사용, JS/HTML 미사용.

폰트: KRDS 표준 — Pretendard GOV → SUIT-V → Apple SD Gothic Neo → Malgun Gothic → sans-serif.
