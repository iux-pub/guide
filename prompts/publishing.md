# 퍼블리싱 규칙 프롬프트 — KRDS 원칙 + Tailwind v4

대상: Cursor, Copilot, Windsurf, Claude Code

> 손으로 관리하는 파일이다(`npm run build:prompts`가 만들지 않는다). 기준이 바뀌면 `CLAUDE.md`·`rules.json`·`references/`에 맞춰 직접 고친다. KRDS가 언제나 우선한다.

이 규칙을 따라 HTML/CSS 코드를 생성하라.

## CSS 방법론: BEM + Tailwind v4 + ITCSS 5레이어

모든 컴포넌트 클래스명은 Block__Element--Modifier 패턴을 따른다 (5-objects, 6-components 레이어 한정).

```
.block-name { }
.block-name__element { }
.block-name--modifier { }
.block-name__element--modifier { }
```

금지: `.btn-primary`(→ `.btn--primary`), `.card-header`(→ `.card__header`), element 2단계 중첩(`.card__header__title` → `.card__title`).

이름 짓기 순서는 `references/class-naming.md`, 어휘의 정본은 `contracts/class-naming.json`이다.

- **modifier 어휘** — 크기 `--xsmall`~`--xlarge`, 위계 `--primary`/`--secondary`/`--tertiary`/`--text`, 상태색 `--info`/`--success`/`--warning`/`--danger`/`--neutral` 등 허용 어휘에서만 고른다. `--blue`·`--big`·`--rounded` 같은 시각 단어는 쓰지 않는다 (R-18).
- **CSS에 있는 클래스만** — 카탈로그 블록의 변형·부품은 CSS에 정의된 것만 쓴다. `card--featured`·`card__media`처럼 그럴듯한 이름을 지어내지 않는다 (R-29).
- **상태는 ARIA·hidden 속성 먼저** — `aria-expanded`·`aria-current`·`aria-selected`·`hidden`·`disabled`로 표현하고 CSS가 속성 선택자로 모양을 바꾼다. ARIA로 표현할 수 없을 때만 BEM modifier(예: `.step-indicator__item--done`)를 쓴다. `.is-*`·`.has-*` 금지 (R-17).

**SCSS 사용 금지.** 표준 CSS nesting과 Tailwind v4 `@apply`/`@theme`/`@utility`는 허용한다 (R-03).

## CSS 구조: ITCSS 5레이어

```
src/styles/
  style.css                # @import "tailwindcss" + 토큰 + 레이어
  3-generic/               # 리셋
  4-elements/              # HTML 태그 베이스
  5-objects/               # 레이아웃 (BEM)
  6-components/            # KRDS 기반 UI 컴포넌트 (BEM)
  7-utilities/             # 유틸리티
```

옛 1-settings(토큰)는 `tokens/`로 분리, 2-tools(SCSS 믹스인)는 Tailwind utilities로 대체됐다.

## 토큰 사용

색은 하드코딩하지 않는다. 어디에 쓰든 `var(--color-*)`만 쓴다(R-01).

- **의미 토큰을 먼저 쓴다**
  - 글자: `--color-text`, `--color-text-bolder`, `--color-text-subtle`, `--color-text-disabled`, `--color-text-inverse`
  - 배경·표면: `--color-bg`, `--color-bg-subtle`, `--color-bg-subtler`, `--color-bg-inverse`, `--color-surface`
  - 테두리: `--color-border`, `--color-border-light`, `--color-border-dark`, `--color-border-control`(사용자가 조작하는 요소)
  - 브랜드·상태: `--color-primary`, `--color-secondary`, `--color-point`, `--color-danger`, `--color-warning`, `--color-success`, `--color-info`
- **서체**: `var(--font-sans)`(본문), `var(--font-heading)`(제목), `var(--font-mono)`(고정폭). `font-family` 직접값은 쓰지 않는다(R-26)
- **토큰이 아닌 것**: 간격·크기·글자 크기·반경·그림자·모션·z-index는 rem 직접값이다. Tailwind는 `p-[2.4rem]` 같은 임의값으로 쓰고 기본 스케일(`p-4`, `text-sm`)은 쓰지 않는다(R-37)
- **루트 글자 크기**: 62.5%로 고정한다(1rem = 10px). 다른 값이나 vw로 바꾸지 않는다(R-31)

토큰 출처: `tokens/foundation.json`(불변) + `tokens/brand.json`(프로젝트가 고치는 유일한 파일) → `tokens/build/tokens.css`.

## 반응형: 모바일 퍼스트

| 단계 | 폭 | variant | 여기서 바뀌는 것 |
|------|-----|---------|------------------|
| 모바일 | 360px 기준 | (기본) | — |
| 태블릿 | 768px 이상 | `tablet:` | 글자 크기 모바일→PC, 컨테이너 여백 |
| 노트북 | 1024px 이상 | `laptop:` | 메인 메뉴↔전체메뉴, 서브 LNB 2단 |
| PC | 1280px 이상 | `pc:` | 레이아웃 간격 |

단순 반응형 속성 변경은 CSS 파일 내부에서도 Tailwind v4 variant `tablet:` / `laptop:` / `pc:`를 우선 사용한다.
복잡한 중첩 선택자나 여러 하위 요소를 동시에 제어해야 할 때만 `@media`를 사용한다.
Tailwind v4 variant는 `mobile:` / `tablet:` / `laptop:` / `pc:`만 사용하고 `sm:` / `md:` / `lg:` / `xl:` / `2xl:`는 쓰지 않는다.
360px 넘는 모바일 고정 폭을 쓰지 않는다(R-48).

```css
.card {
  @apply p-[1.6rem] tablet:p-[2.4rem] pc:p-[3.2rem];
}
```

직접 `@media`가 필요한 경우 관련 선택자 내부에 중첩한다. 파일 하단에 브레이크포인트별 `@media` 블록을 몰아두지 않는다.

```css
.section {
  @apply grid gap-[2.4rem];

  @media (min-width: 1280px) {
    @apply grid-cols-2;
  }
}
```

순수 CSS `@media (min-width: var(--breakpoint-pc))`는 표준으로 쓰지 않는다. 직접 `@media`가 필요하면 `768px`, `1024px`, `1280px` 값을 명시한다.

## HTML 기본 골격

큰 영역은 단순하게 잡고, `main` 안은 `section > .container` 구조로 둔다. HTML 컴포넌트화는 페이지 전체가 아니라 `main` 내부 section 단위로 분리한다. 각 section은 `.container`를 직접 포함하고, heading 또는 `aria-labelledby`/`aria-label`로 접근 가능한 이름을 제공한다.

```html
<a href="#main" class="skip-to-content">본문 바로가기</a>

<header id="header" class="site-header">
  <div class="container">...</div>
</header>

<main id="main">
  <section class="section section--content" aria-labelledby="section-title">
    <div class="container">
      <h1 id="section-title">공지사항</h1>
      ...
    </div>
  </section>
</main>

<footer id="footer" class="site-footer">
  <div class="container">
    <nav aria-label="약관 및 정책"><a class="site-footer__link site-footer__link--important" href="/privacy">개인정보 처리방침</a></nav>
  </div>
</footer>
```

## 컴포넌트 (KRDS 기반)

기존 카탈로그 패턴을 우선 사용한다. 카탈로그 밖 패턴은 프로젝트 필요성과 공통화 가능성을 판단해 확장한다.

- A (폼/액션): btn, check-radio, file-upload, form, select, switch
- B (컨테이너): accordion, card, disclosure, modal, side-panel, tab
- C (내비): breadcrumb, footer, header, main-menu, mobile-menu, pagination
- D (피드백): alert, badge, notice-bar, progress, spinner, step-indicator, tag, toast, tooltip
- E (콘텐츠): calendar, carousel, error-page, list, table

각 컴포넌트의 마크업은 `src/snippets/{name}.md` 참조.

### 버튼 KRDS 정의

- Variant 4종: `--primary` `--secondary` `--tertiary` `--text`
- Size 5종: `--xsmall`(32) `--small`(40) medium(48, 클래스 없음=기본) `--large`(56) `--xlarge`(64)
- 옛 variant 금지: `--ghost`, `--outline`, `--link`, `--sm`, `--lg`, `--hero`
- 모바일 컨텍스트는 medium(48) 이상 권장 (xsmall/small은 44px 미만이라 모바일 부적합)

## 접근성: KWCAG/WCAG 2.1 AA

- `<img>`: alt 필수 (장식용은 `alt=""`)
- 인터랙티브 요소: `aria-label` 또는 텍스트 레이블 필수
- 색상 대비: 4.5:1 (큰 텍스트 24px/18.67px bold 3:1)
- 키보드 네비게이션 지원
- skip-to-content 링크: `<a href="#main" class="skip-to-content">본문 바로가기</a>`
- 포커스: `:focus-visible` — `outline: 0.4rem solid var(--color-border-primary)`, `outline-offset: 2px` (reset.css 전역 — 컴포넌트에서 제거 금지)
- `!important` 금지 (사유 주석 시 허용), 인라인 스타일 금지 (CSS 변수 주입 `style="--var: val"`은 허용)
- `prefers-reduced-motion` 대응. 사용자 동작에 답하는 전환은 150~250ms, 무한 반복은 로딩 표시에만, 영상은 자동 재생하지 않는다(R-22·R-33)
- 터치 영역: 최소 44×44px (모바일 medium=48px 권장), 인접 요소 간격 8px 이상

## 레이아웃 크기 기준

카탈로그 CSS의 현재 값이다(`src/styles/5-objects/container.css`, `6-components/header.css`·`main-menu.css`).

| 영역 | 모바일 | 768px 이상 | 1280px 이상 |
|------|--------|------------|-------------|
| 컨테이너 최대 폭 | 100% | 100% | `124.8rem`(콘텐츠 1200px + 좌우 여백) |
| 컨테이너 좌우 여백 | `1.6rem` | `2.4rem` | `2.4rem` |
| 헤더 높이 | `6.4rem` | `6.4rem` | `8rem` |
| 메인 메뉴 글자 | — (1024px 미만은 전체메뉴) | `1.7rem` 굵게(1024px 이상) | `1.7rem` 굵게 |
| 본문 글자 | `1.7rem`, 행간 1.7 | 같음 | 같음 |

## 콘텐츠·카피·형태

- 가짜·자리 콘텐츠를 남기지 않는다 — 채움 문구, placeholder 이미지 핫링크, 「질문 1」 연번 레이블, 지어낸 연락처·수치(R-23)
- 링크는 실제 목적지와 그 목적지를 말하는 이름을 가진다. `href="#"`·`javascript:` 금지, 이동은 `a`, 동작은 `button`(R-30)
- 문체는 합쇼체 사실 서술, 버튼은 동사형(「신청하기」). 번역투·2인칭·「~하세요」 버튼·공공 화면 느낌표 금지(R-43·R-44)
- 한국어 화면에 영문 전용 UI 레이블(VIEW MORE)을 쓰지 않는다(R-45). placeholder에는 예시만 둔다(R-50)
- 장식 그라데이션·글래스·색 글로(R-34), 이모지 아이콘(R-36), 1.2rem 넘는 반경(R-35) 금지. 아이콘은 카탈로그 스프라이트에서 가져온다(R-27)
- `main` 안 `h1`은 하나, 제목 단계를 건너뛰지 않는다(R-39). 메인 히어로는 첫 섹션 하나, 화면 높이를 채우지 않는다(R-42)
- 제목 위 분류 표지(eyebrow), 순서가 아닌 01·02 번호, 모든 섹션 등장 효과, 굵은 색 옆선은 템플릿 서명이다(R-51)
- 메인·랜딩은 `references/design-intelligence.md` 절차(컨셉 → 방향 라운드 세 안 → `docs/design-plan.md` → 별도 평가자의 렌더 비평 → 사람 판정)를 거친다

## 코딩 스타일

- 들여쓰기: 2 spaces
- 따옴표: single quote
- 세미콜론: CSS 사용, JS/HTML 미사용
- 주석: 한국어
