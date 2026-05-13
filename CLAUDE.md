## ⚠ UI/스타일 작업 시 — `info-design` 스킬 필수 활성화

**모든 CSS·HTML·UI 코드 작성 시 다음 트리거를 먼저 발화한다:**

> "info-design 스킬 기준으로 가자"

이 트리거 후에는 LLM이 컨트랙트(`skill/SKILL.md` 또는 `~/.claude/skills/info-design/SKILL.md`)에 따라
**색상/상태 토큰과 INFOMIND 컴포넌트 패턴을 우선 사용**한다. KRDS는 품질 원칙과 접근성 기준으로 적용하고, 수치 체계는 프로젝트 맥락에 맞게 조정한다.

위반 발견 시 LLM은 즉시 작업을 중단하고 사용자에게 보고한다.

> 스킬 본체 소스는 이 저장소의 `skill/`. `npm run build:skill` → `npm run deploy:skill`로 로컬 Claude Code에 배포된다.

---

## Project

**INFOMIND UX 디자인/퍼블리싱 가이드 시스템**

KRDS(범정부 UI/UX 디자인 시스템) 베이스 + INFOMIND UX팀 표준을 합쳐 신규 프로젝트가 즉시 적용 가능한 토큰·컴포넌트·스니펫·스킬을 한 저장소에서 발행한다.

**Core Value:** 검증된 팀 표준을 일관되게 유지하며, 토큰부터 컴포넌트·스니펫·LLM 컨트랙트까지 단일 소스에서 발행한다.

발행 채널 — `starter/`(KRDS+Tailwind v4 스타터 키트), `skill/`(info-design 스킬), `prompts/`(LLM 컨텍스트 묶음).

---

## 코딩 규칙

> 소스: `rules.json` | 상세 문서: `/conventions/` | 갱신: `npm run build:rules`
> 위반은 훅(check-violations.js + stylelint)이 자동 검출한다.

<!-- RULES_START -->
### CSS 규칙
- R-01 `error` — 색상은 var(--token) 강제 — 간격/크기/타이포 스케일은 권장
- R-02 `warn` — !important 사용 금지 — 부득이한 경우 주석으로 사유 필수
- R-03 `error` — SCSS 사용 금지 — 표준 CSS nesting + Tailwind v4 문법 허용
- R-19 `error` — 스타일 CSS는 Tailwind v4 @apply 우선 — 토큰 값은 var(--token) 유지

### BEM 네이밍
- R-04 `info` — BEM 사용 (5-objects, 6-components 레이어에만 적용)
- R-05 `error` — element 2단계 중첩 금지 — 평탄화
- R-06 `error` — 시각적 modifier 금지 — 의미적 이름 사용
- R-17 `warn` — 상태는 BEM modifier로만 표현 — .is-* / .has-* 비-BEM 상태 클래스 금지
- R-18 `error` — modifier 이름은 의미적이어야 함 — 시각적 단어 금지

### HTML/마크업 규칙
- R-07 `warn` — inline style 금지 — CSS 커스텀 프로퍼티 style="--var: val"은 허용
- R-08 `warn` — HTML 클래스에도 BEM 2단계 element 금지 (R-05 연동)
- R-09 `error` — img alt 속성 필수
- R-10 `error` — 인터랙티브 요소는 시맨틱 HTML 사용 — div onclick 금지
- R-15 `warn` — HTML 기본 구조는 기존 인포마인드 사이트 패턴을 우선 유지한다

### 접근성 규칙
- R-11 `error` — 포커스 스타일 필수 — :focus { outline: none } 금지
- R-12 `error` — 색상 대비 — 일반 텍스트 4.5:1 이상, 큰 텍스트 3:1 이상
- R-13 `error` — 터치/클릭 영역 최소 44×44px
- R-14 `error` — 건너뛰기 링크 필수 — .skip-to-content
- R-16 `error` — 인터랙티브 컴포넌트는 필수 ARIA 속성을 누락할 수 없다
<!-- RULES_END -->

> 위 표는 `rules.json`에서 자동 생성된다. 실제 적용 대상은 `src/styles/**/*.css`(R-01~R-06, R-11~R-13) + `src/snippets/**/*.md`/`site/**/*.md`(R-07~R-10, R-14).

---

## 작업 전 체크리스트

### CSS 파일 작성 시

1. ✅ 사용할 토큰 확인: `tokens/foundation.json`
2. ✅ 모든 색상 = `var(--color-*)` 시맨틱 토큰
3. ✅ 기본 폰트 = `var(--font-sans)` / 코드 폰트 = `var(--font-mono)`
4. ✅ 간격/크기/타이포 스케일은 CSS/Tailwind 직접값 사용
5. ✅ 표준 CSS nesting과 Tailwind v4 `@apply`를 사용해 구조를 간결하게 유지
6. ✅ 새 컴포넌트는 `src/styles/6-components/{name}.css` 추가 + `6-components/index.css`에 `@import` 등록
7. ✅ 작성 후: `npm run lint:css` 통과 + `npm run check` 위반 0건

### 컴포넌트 마크업 작성 시

1. 페이지 전체 골격은 기존 인포마인드 방식 유지: `header`, `main`, `footer`
2. 각 큰 영역 안에는 `.container`를 두고 폭과 정렬을 담당시킨다
3. `main` 내부는 `section > .container` 단위로 구성한다
4. HTML 컴포넌트화는 페이지 전체가 아니라 `main` 내부 section 단위로 분리한다
5. 스니펫 확인: `src/snippets/{component}.md` — 기존 패턴 우선 적용
6. BEM Block명은 `src/styles/6-components/{component}.css` 파일명과 일치
7. 인터랙티브 요소: `role`, `aria-*`, `tabindex` 확인
8. 폼 요소: `<label for>` + `id` 연결 필수
9. 모바일 터치 영역 ≥ 44×44px (R-13)

기본 골격:

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

### 신규 컴포넌트 생성 시

`/create-component {컴포넌트명}` 스킬 사용 — 아래 파일이 일괄 생성된다:

| 파일 | 위치 |
|------|------|
| CSS | `src/styles/6-components/{name}.css` |
| 스니펫 | `src/snippets/{name}.md` |
| 플레이그라운드 | `src/playground/{name}.html` |
| 문서 페이지 | `site/components/{name}.md` |

> 컴포넌트 카탈로그(`skill/references/krds-components.md`)를 먼저 확인한다. 카탈로그 밖 패턴은 프로젝트 필요성과 재사용 가능성을 판단해 UX팀 결정으로 확장한다.

---

## Technology Stack

| Category | Technology | Version |
|----------|-----------|---------|
| Site Generator | Eleventy (11ty) | ^3.1.5 |
| CSS Framework | Tailwind v4 | ^4.0.0 |
| CSS 작성 | 표준 CSS nesting + Tailwind v4 `@apply` | SCSS 빌드 없이 중첩 구조와 유틸 조합 사용 |
| Tokens | INFOUX foundation | `tokens/foundation.json` (색상 + 기본 폰트) |
| ITCSS Pattern | 5-layer (3-generic ~ 7-utilities) | — |
| BEM | Block__Element--Modifier | 5-objects · 6-components 한정 |
| Linting | Stylelint + check-violations.js | ^17.5.0 |
| A11y Testing | pa11y-ci + axe-core | latest |

---

## 디자인 토큰 위치

색상과 기본 폰트는 CSS Custom Properties(`var(--*)`)를 사용하라. 간격·크기·타이포 스케일은 프로젝트 맥락에 맞는 CSS/Tailwind 직접값으로 작성한다(R-01).

| 단계 | 파일 | 갱신 정책 |
|------|------|----------|
| 단일 소스 | `tokens/foundation.json` | 색상 + 기본 폰트 기준 |
| 빌드 산출물 | `tokens/build/tokens.css` | `npm run build:tokens` 자동 생성 — 직접 수정 금지 |

빌드 흐름: `foundation.json` → `build-tokens.js` → Tailwind v4 `@theme` 형태의 `tokens.css`.

---

## CSS 구조 (ITCSS 5레이어)

```
src/styles/
  style.css                  # 메인 진입점 — Tailwind v4 + tokens.css + ITCSS 레이어 import
  docs.css                   # 문서 사이트 전용 진입점
  3-generic/                 # 리셋
  4-elements/                # HTML 태그 베이스
  5-objects/                 # 레이아웃 패턴 — BEM 적용
  6-components/              # KRDS 기반 UI 컴포넌트 (BEM)
  7-utilities/               # 유틸리티
```

> 1-settings(토큰)는 `tokens/`로 분리, 2-tools(SCSS 믹스인)는 Tailwind v4 utilities로 대체됐다. BEM은 **5-objects, 6-components 레이어에만** 적용한다.

---

## 반응형 가이드

CSS `@media` 또는 Tailwind v4 반응형 variant를 직접 사용한다 (SCSS 믹스인 폐지).

```css
.block {
  /* 모바일 기본 (0~767px) */
}

@media (min-width: 768px) {
  .block { /* 태블릿 ~ */ }
}

@media (min-width: 1280px) {
  .block { /* PC ~ */ }
}
```

- 브레이크포인트 — 모바일 0~767, 태블릿 768~1279, PC 1280~ (KRDS 표준)
- 표준 CSS nesting과 Tailwind v4 `@apply` 사용 가능

---

## 컴포넌트 카탈로그 (KRDS 기반)

| 그룹 | 컴포넌트 |
|------|---------|
| A — 폼/액션 | `btn` · `check-radio` · `file-upload` · `form` · `select` · `switch` |
| B — 컨테이너/레이아웃 | `accordion` · `card` · `disclosure` · `modal` · `side-panel` · `tab` |
| C — 내비게이션 | `breadcrumb` · `header` · `main-menu` · `pagination` |
| D — 피드백 | `alert` · `badge` · `progress` · `spinner` · `step-indicator` · `tag` · `toast` · `tooltip` |
| E — 콘텐츠/표현 | `calendar` · `carousel` · `list` · `table` |

각 컴포넌트는 다음 4종 자료가 동일한 BEM Block명으로 정렬되어 있다 — CSS(`src/styles/6-components/{name}.css`) · 스니펫(`src/snippets/{name}.md`) · 플레이그라운드(`src/playground/{name}.html`) · 문서(`site/components/{name}.md`).

> 상세 카탈로그(BEM·접근성·토큰 매핑) — `skill/references/krds-components.md`

---

## LLM 컨텍스트 파일

`prompts/` 폴더에 작업 유형별 컨텍스트가 있다. 필요한 파일을 대화에 첨부하거나 읽어서 사용하라.

| 파일 | 용도 |
|------|------|
| `prompts/context.md` | 컴포넌트/CSS 작업 시 규칙 + 토큰 요약 |
| `prompts/tokens.md` | 전체 토큰 목록 |
| `prompts/components.md` | 컴포넌트 스니펫 마크업 |
| `prompts/design-rules.md` | 디자인 품질 규칙 |
| `prompts/publishing.md` | 퍼블리싱 체크리스트 |

`skill/` — info-design 스킬 본체. SKILL.md + references/(krds-tokens, krds-components, tailwind-mapping, accessibility, forbidden-patterns, guide-import). `npm run build:skill` → `npm run deploy:skill`로 로컬 `~/.claude/skills/info-design/`에 배포.

---

## 절대 금지 (요약 — 상세는 스킬 `references/forbidden-patterns.md`)

- Raw hex/rgb/hsl 색상
- 간격/크기/타이포 스케일은 CSS/Tailwind 직접값 사용. 색상 raw 값은 금지
- Tailwind 기본 팔레트 raw 컬러 유틸
- Tailwind 기본 스케일은 프로젝트 기준과 충돌하지 않는지 확인
- 옛 버튼 variant (`btn--ghost`, `btn--outline`, `btn--link`, `btn--sm`, `btn--lg`)
- `!important` (사유 주석 없을 시)
- 인라인 `style="..."` (CSS 변수 주입 외)
- 카탈로그 밖 컴포넌트는 UX팀 판단 후 프로젝트 패턴 또는 공통 컴포넌트로 확장
- BEM element 2단계 중첩 (`.card__body__title`)
- `:focus { outline: none }`
- `div/span 클릭 핸들러 패턴`
- 이미지 `alt` 누락, 폼 `<label>` 누락
- 모바일 터치 영역 44px 미만

---

## 명령어

```bash
# 검사
npm run check           # 위반 패턴 전체 스캔 (훅에서도 자동 실행)
npm run lint:css        # Stylelint (src/styles/**/*.css)
npm run lint:css:fix    # Stylelint 자동 수정

# 빌드
npm run build:tokens    # tokens/foundation.json → tokens/build/tokens.css
npm run build:css       # Tailwind v4 → dist/css/style.css
npm run build:docs-css  # 문서 사이트 CSS → dist/css/docs.css
npm run build:rules     # rules.json → site/conventions/ + CLAUDE.md 자동 주입
npm run build:prompts   # prompts/*.md 재생성
npm run build:skill     # skill/ 빌드
npm run build           # 위 전부 + Eleventy 사이트 빌드

# 발행
npm run deploy:skill    # 로컬 ~/.claude/skills/info-design/ 동기화
npm run sync:starter    # iux-pub/starter 저장소로 동기화

# 개발 / 검증
npm run serve           # Tailwind 워치 + 11ty 서브 (concurrently)
npm run test:a11y       # pa11y-ci 접근성 검증
npm test                # 전체 CI (check → tokens → lint → build → a11y)
```

---

## 코딩 스타일

- 들여쓰기: 2 spaces
- 따옴표: single quote
- 세미콜론: CSS 사용, JS/HTML 미사용
- 주석 언어: 한국어
