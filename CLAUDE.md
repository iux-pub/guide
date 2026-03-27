<!-- GSD:project-start source:PROJECT.md -->
## Project

**INFOMIND UX 디자인/퍼블리싱 가이드 시스템**

인포마인드 UX팀의 디자인 및 퍼블리싱 기본 규칙과 템플릿을 체계화한 가이드 시스템. 피그마 디자인 단계부터 HTML/CSS 퍼블리싱까지의 컨벤션을 문서화하고, 신규 프로젝트에 바로 적용 가능한 코드 템플릿을 제공한다. 공공기관 사이트를 포함한 다양한 프로젝트에서 일관된 품질과 웹 접근성(KWCAG/WCAG AA)을 보장하기 위한 팀 표준.

**Core Value:** 신규 프로젝트 시작 시 디자인/퍼블리싱 규칙을 처음부터 다시 정하지 않고, 검증된 팀 표준을 즉시 적용할 수 있어야 한다.

### Constraints

- **CSS 방법론**: BEM(Block__Element--Modifier) 필수 -- 팀 합의 사항
- **전처리기**: SCSS(dart-sass) -- 팀 표준
- **패키지 매니저**: npm -- 팀 표준
- **접근성**: KWCAG/WCAG 2.1 AA 이상 -- 공공기관 납품 요건
- **코딩 스타일**: 2 spaces, single quote, 세미콜론 없음 -- 팀 합의
- **주석 언어**: 한국어 -- 팀 내 소통 언어
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

## Recommended Stack
### Documentation Site Generator
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Eleventy (11ty) | ^3.1.5 | Documentation site generator | Framework-agnostic, Nunjucks/Markdown templates produce pure HTML. No React/Vue dependency. Perfect for HTML/CSS publishing team. Zero JS shipped by default. Active maintenance (177 releases in 2025, v3.1.5 latest). |
| Nunjucks | ^3.2.4 | Template engine for Eleventy | Jinja2-style syntax familiar to HTML publishers. Supports template inheritance, macros for component previews. |
- **Storybook** - Designed for JS component libraries (React/Vue/Angular). Overkill and wrong paradigm for HTML/CSS snippets. Heavy JS dependency.
- **Astro** - Good but adds unnecessary abstraction layer. Team works in HTML/CSS directly, not .astro components. Eleventy lets you write plain HTML.
- **Docusaurus** - React-based. Wrong ecosystem for a non-JS team.
- **Fractal** - Viable alternative but less active community. Eleventy has broader ecosystem and plugin support.
- **VitePress** - Vue-based. Same problem as Docusaurus.
### CSS Preprocessor & Architecture
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| sass (Dart Sass) | ^1.98.0 | SCSS compilation | Team standard. `sass` is the correct npm package (NOT `dart-sass` which is deprecated at v1.25.0). Uses @use/@forward (NOT deprecated @import). |
| PostCSS | ^8.5.0 | Post-processing | Autoprefixer for vendor prefixes. Pairs with sass output. |
| Autoprefixer | ^10.4.0 | Vendor prefixes | Required for public sector browser support (IE edge cases). |
### SCSS Architecture Pattern
| Pattern | Why |
|---------|-----|
| **ITCSS (Inverted Triangle CSS)** | Best fit for BEM methodology. Designed by Harry Roberts specifically to work with BEM. Organizes by specificity, not file type. Prevents cascade conflicts that 7-1 pattern allows. |
### Design Token Management
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Style Dictionary | ^5.4.0 | Design token pipeline | Transforms JSON tokens into SCSS variables AND CSS custom properties simultaneously. Single source of truth for colors, spacing, typography. DTCG format compatible. |
- Define tokens in JSON (DTCG format with `$value`, `$type`)
- Generate SCSS variables for compile-time use in mixins
- Generate CSS custom properties for runtime theming (dark mode, project-specific overrides)
- This matches team's existing pattern: webstyleguide already uses CSS Custom Properties (`--primary-color`, `--gray-900`)
### Linting & Code Quality
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Stylelint | ^17.5.0 | CSS/SCSS linting | Industry standard. Enforces team conventions automatically. |
| stylelint-scss | latest | SCSS-specific rules | SCSS-specific linting rules (no-duplicate-mixins, etc.) |
| stylelint-selector-bem-pattern | latest | BEM enforcement | Validates BEM naming convention in selectors. Critical for enforcing consistent BEM usage (team's existing codebase has inconsistent BEM application). |
| stylelint-config-standard-scss | latest | Standard SCSS config | Base config extending standard rules for SCSS. |
### Accessibility Testing
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| pa11y-ci | latest | CI accessibility testing | CLI-based, tests against URL lists. Supports WCAG 2.1 AA. Catches ~50% of issues automatically. Perfect for testing built guide pages. |
| axe-core | ^4.11.0 | Accessibility engine | Powers pa11y's checks. Industry-standard ruleset from Deque. |
| @axe-core/cli | latest | Quick CLI a11y checks | For developer-side quick checks during development. |
- **Lighthouse** - Good but general-purpose (performance, SEO, etc.). pa11y is focused on accessibility with better WCAG rule coverage.
- **WAVE** - Browser extension only. Not scriptable for CI.
### Build Tools
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| npm scripts | - | Task runner | Team standard (npm). No need for gulp/grunt overhead. npm scripts can chain sass compilation, PostCSS, and Eleventy build. |
| concurrently | latest | Parallel npm scripts | Run sass --watch and eleventy --serve simultaneously during development. |
| live-server or Eleventy's built-in | - | Dev server | Eleventy includes BrowserSync-like dev server with hot reload. |
- No JavaScript to bundle
- No framework compilation needed
- SCSS compilation + static HTML generation = npm scripts are more than enough
- Fewer dependencies = fewer maintenance headaches
### Supporting Libraries
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| sass-rem | latest | REM conversion | Team already uses this. `rem(16px)` function for rem values with 16px base. |
| markdown-it | latest | Markdown parsing | Eleventy default. For writing guide content in Markdown. |
| Prism.js | latest | Code syntax highlighting | For displaying HTML/SCSS code examples in the guide. |
| clipboard.js | latest | Copy to clipboard | For "copy code" buttons on code snippets. |
## Alternatives Considered
| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Doc Site | Eleventy | Fractal | Less active community, steeper learning curve, Eleventy plugins cover same use cases |
| Doc Site | Eleventy | Storybook | React-centric, ships heavy JS, wrong paradigm for HTML/CSS publishing team |
| Doc Site | Eleventy | Astro | Adds .astro abstraction when team works in plain HTML. Good tool, wrong fit. |
| SCSS Pattern | ITCSS | 7-1 Pattern | Doesn't enforce specificity ordering, allows cascade conflicts |
| Tokens | Style Dictionary | Manual SCSS variables | No single source of truth, no automated CSS custom property generation |
| Tokens | Style Dictionary | Token CSS | Newer, smaller community, less SCSS integration |
| Linting | Stylelint | CSS-only manual review | Inconsistent enforcement, team already has BEM compliance issues |
| A11y | pa11y-ci | Lighthouse CI | pa11y has better WCAG-focused rules; Lighthouse is general-purpose |
| Build | npm scripts | Gulp | Unnecessary abstraction for this scope (no JS bundling) |
## Installation
# Documentation site
# SCSS compilation
# Design tokens
# Linting
# Accessibility testing
# Build utilities
# Existing team dependencies
## Key npm Scripts
## Sources
- Eleventy official: https://www.11ty.dev/ (v3.1.5, verified 2026-03-25)
- sass npm: https://www.npmjs.com/package/sass (v1.98.0, verified 2026-03-25)
- Style Dictionary: https://styledictionary.com/ (v5.4.0, verified 2026-03-25)
- Stylelint: https://stylelint.io/ (v17.5.0, verified 2026-03-25)
- ITCSS: https://www.xfive.co/blog/itcss-scalable-maintainable-css-architecture/
- pa11y: https://pa11y.org/ (maintained 2016-2025)
- stylelint-selector-bem-pattern: https://github.com/simonsmith/stylelint-selector-bem-pattern
- Sass Guidelines (7-1 & architecture): https://sass-guidelin.es/
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

### 1. BEM 네이밍 규칙

모든 CSS 클래스명은 BEM(Block__Element--Modifier) 패턴을 따르라.

**필수 패턴:**

| 패턴 | 형식 | 예시 |
|------|------|------|
| Block | `.block-name` | `.card`, `.btn`, `.site-header` |
| Block + Modifier | `.block--modifier` | `.btn--primary`, `.card--featured` |
| Block + Element | `.block__element` | `.card__header`, `.form__input` |
| Block + Element + Modifier | `.block__element--modifier` | `.form__input--error`, `.card__title--highlight` |

**SCSS 작성 규칙:**
- Element는 반드시 `&__element-name`으로 중첩 작성하라
- Modifier는 반드시 `&--modifier-name`으로 중첩 작성하라
- Element 2단계 중첩을 금지한다: `.card__header__title` -> `.card__title`로 평탄화하라
- Modifier는 Block 또는 Element에만 부착하라

**금지 패턴 (반드시 피하라):**

| 잘못된 패턴 | 올바른 BEM | 이유 |
|-------------|-----------|------|
| `.btn-primary` | `.btn--primary` | modifier에는 `--` 사용 필수 |
| `.card-header` | `.card__header` | element에는 `__` 사용 필수 |
| `.input-box.error` | `.form__input--error` | 별도 클래스 조합 대신 modifier 사용 |
| `.card-header h4` | `.card__title` | 요소 선택자 의존 금지 |
| `.btn-gray` | `.btn--secondary` | 시각적 속성 이름 금지, 의미적 이름 사용 |
| `.card__header__title` | `.card__title` | element 2단계 중첩 금지, 평탄화 |

**SCSS BEM 중첩 예시:**

```scss
// 카드 컴포넌트
.card {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-base);

  &__header {
    padding: var(--spacing-md);
  }

  &__title {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-bold);

    &--highlight {
      color: var(--color-primary);
    }
  }

  &__body {
    padding: var(--spacing-md);
  }

  &--featured {
    border-color: var(--color-primary);
  }
}
```

### 2. CSS 규칙

- BEM(Block__Element--Modifier) 네이밍을 필수로 적용하라
- 인라인 스타일 사용을 금지한다
- `!important` 사용을 금지한다 (부득이한 경우 주석으로 사유 필수)
- CSS Custom Properties(토큰)를 우선 사용하라. 하드코딩 값을 금지한다
- Stylelint `.stylelintrc.json` 설정을 참조하라

### 3. 디자인 토큰 사용법

모든 스타일 값은 CSS Custom Properties(토큰)를 사용하라. 하드코딩 색상, 크기, 간격을 금지한다.

**색상 토큰** (`src/scss/1-settings/_tokens-color.scss`):

```scss
// Primary -- 프로젝트별 오버라이드 가능
var(--color-primary)           // #256ef4
var(--color-primary-light)     // #6a9df7
var(--color-primary-dark)      // #083891

// Gray scale
var(--color-gray-900)          // #222
var(--color-gray-800)          // #333
var(--color-gray-700)          // #555
var(--color-gray-600)          // #666
var(--color-gray-500)          // #999
var(--color-gray-400)          // #b1b8be
var(--color-gray-300)          // #ccc
var(--color-gray-200)          // #ddd
var(--color-gray-100)          // #efefef
var(--color-gray-50)           // #f8f8f8

// Semantic -- KRDS 기준
var(--color-danger)            // #de3412
var(--color-warning)           // #c78500
var(--color-success)           // #228738
var(--color-info)              // #0b78cb

// Text
var(--color-text)              // #1e2124
var(--color-text-secondary)    // #666
var(--color-text-disabled)     // #999

// Background
var(--color-bg)                // #fff
var(--color-bg-secondary)      // #f8f8f8

// Border
var(--color-border)            // #ccc
var(--color-border-light)      // #efefef

// 기본
var(--color-white)             // #fff
var(--color-black)             // #000
```

**타이포그래피 토큰** (`src/scss/1-settings/_tokens-typography.scss`):

```scss
// Font Family
var(--font-family-base)        // 'Pretendard GOV', 'Malgun Gothic', 'apple sd gothic neo', sans-serif

// Font Size (62.5% 기준, 1rem = 10px)
var(--font-size-2xl)           // 3.2rem (32px)
var(--font-size-xl)            // 2.8rem (28px)
var(--font-size-lg)            // 2.4rem (24px)
var(--font-size-md)            // 2rem (20px)
var(--font-size-base)          // 1.6rem (16px)
var(--font-size-sm)            // 1.4rem (14px)
var(--font-size-xs)            // 1.2rem (12px)

// Font Weight
var(--font-weight-regular)     // 400
var(--font-weight-medium)      // 500
var(--font-weight-semibold)    // 600
var(--font-weight-bold)        // 700

// Line Height
var(--leading-tight)           // 1.2
var(--leading-base)            // 1.6
var(--leading-loose)           // 1.8
```

**간격 토큰** (`src/scss/1-settings/_tokens-spacing.scss`):

```scss
// 4px 기반 스케일 (62.5% 트릭, 1rem = 10px)
var(--spacing-xs)              // 0.4rem (4px)
var(--spacing-sm)              // 0.8rem (8px)
var(--spacing-md)              // 1.6rem (16px)
var(--spacing-lg)              // 2.4rem (24px)
var(--spacing-xl)              // 3.2rem (32px)
var(--spacing-2xl)             // 4.8rem (48px)
var(--spacing-3xl)             // 6.4rem (64px)
```

**기타 토큰** (`src/scss/1-settings/_tokens-misc.scss`):

```scss
// Border Radius
var(--radius-sm)               // 4px
var(--radius-base)             // 8px
var(--radius-lg)               // 12px
var(--radius-xl)               // 16px
var(--radius-full)             // 9999px

// Box Shadow
var(--shadow-sm)               // 0 1px 2px rgba(0,0,0,0.05)
var(--shadow-base)             // 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)
var(--shadow-lg)               // 0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)

// Transition
var(--transition-fast)         // 0.1s ease
var(--transition-base)         // 0.3s ease
var(--transition-slow)         // 0.5s ease

// Z-index
var(--z-dropdown)              // 100
var(--z-sticky)                // 200
var(--z-fixed)                 // 300
var(--z-modal-backdrop)        // 400
var(--z-modal)                 // 500
var(--z-toast)                 // 600
```

**그리드 토큰** (`src/scss/1-settings/_tokens-grid.scss`):

```scss
var(--grid-columns)            // 4 (모바일) / 12 (태블릿+)
var(--grid-gutter)             // 16px (모바일) / 24px (태블릿+)
var(--grid-margin)             // 16px (모바일) / 24px (태블릿) / 40px (PC)
var(--container-max-width)     // 100% (모바일/태블릿) / 1200px (PC)
```

**하드코딩 vs 토큰 비교:**

```scss
// 잘못된 예 (하드코딩 금지)
.card {
  color: #222;
  padding: 16px;
  font-size: 14px;
  border-radius: 8px;
}

// 올바른 예 (토큰 사용)
.card {
  color: var(--color-gray-900);
  padding: var(--spacing-md);
  font-size: var(--font-size-sm);
  border-radius: var(--radius-base);
}
```

### 4. 린트 규칙

코드 작성 후 반드시 린트를 실행하라.

```bash
# SCSS 전체 린트 검사
npm run lint:css

# 자동 수정 가능한 항목 처리
npm run lint:css:fix

# 특정 폴더만 검사
npx stylelint "src/scss/6-components/**/*.scss"
```

- BEM 위반은 warning 수준이다 (빌드는 성공하되 경고 출력)
- 경고 메시지에 올바른 패턴이 안내된다: `BEM 패턴 위반: "btn-primary" -> .block__element--modifier 형태로 작성하세요`
- `.stylelintrc.json` 설정: `scss/selector-class-pattern`으로 BEM regex 검증, `plugin/selector-bem-pattern`으로 5-objects/6-components 블록명 검증
- 팀 적응 후 warning -> error 전환 예정

### 5. 코딩 스타일

- 들여쓰기: 2 spaces (탭 금지)
- 따옴표: single quote 사용
- 세미콜론: JS/HTML에서는 없음, SCSS에서는 세미콜론 사용
- 주석은 한국어로 작성하라
- Git commit 메시지는 한국어, 명령형으로 작성하라

### 6. 접근성 (KWCAG/WCAG 2.1 AA)

- 이미지에 `alt` 속성을 필수로 제공하라
- 인터랙티브 요소에 `aria-label` 또는 텍스트 레이블을 필수로 제공하라
- 키보드 네비게이션을 지원하라 (탭 순서, 포커스 표시)
- 색상 대비 4.5:1 이상을 유지하라
- Swiper 등 슬라이더에 `aria-live`, `role` 속성을 필수로 부여하라
- 본문 건너뛰기 링크를 제공하라: `<a href="#main-content" class="skip-to-content">`
- 스크린 리더 전용 텍스트: `.sr-only` 클래스 사용

### 7. 컴포넌트 스니펫

컴포넌트 HTML 마크업과 접근성 패턴은 `src/snippets/` 디렉토리의 마크다운 파일을 참조하라.

| 컴포넌트 | 스니펫 파일 | SCSS 파일 |
|----------|------------|-----------|
| 버튼 | `src/snippets/btn.md` | `src/scss/6-components/_btn.scss` |
| 폼 | `src/snippets/form.md` | `src/scss/6-components/_form.scss` |
| 카드 | `src/snippets/card.md` | `src/scss/6-components/_card.scss` |
| 테이블 | `src/snippets/table.md` | `src/scss/6-components/_table.scss` |
| 모달 | `src/snippets/modal.md` | `src/scss/6-components/_modal.scss` |
| 탭 | `src/snippets/tab.md` | `src/scss/6-components/_tab.scss` |
| 페이지네이션 | `src/snippets/pagination.md` | `src/scss/6-components/_pagination.scss` |
| 브레드크럼 | `src/snippets/breadcrumb.md` | `src/scss/6-components/_breadcrumb.scss` |
| 보일러플레이트 | `src/snippets/boilerplate.md` | — |

- 스니펫 파일은 HTML 마크업 예제 + variant 목록 + 접근성 주의사항을 포함한다
- SCSS 스타일 세부사항은 SCSS 파일을 직접 읽어 참조하라
- 미리보기 페이지: `src/playground/{컴포넌트}.html`
- 바닐라 JS (모달, 탭): `src/js/modal.js`, `src/js/tab.js`
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

### 1. SCSS 구조 (ITCSS 7레이어)

```
src/scss/
  style.scss              # 메인 진입점 (@use로 각 레이어 로드)
  _project-overrides.scss # 프로젝트별 토큰 오버라이드 (맨 마지막)
  1-settings/             # 토큰, 변수, 브레이크포인트 (CSS 출력 없음)
    _tokens-color.scss
    _tokens-typography.scss
    _tokens-spacing.scss
    _tokens-grid.scss
    _tokens-misc.scss
    _breakpoints.scss
    _index.scss
  2-tools/                # 믹스인, 함수 (CSS 출력 없음)
    _responsive.scss      # @mixin respond-to(mobile/tablet/tablet-up/pc)
    _mixins.scss          # flex-center, ellipsis, bg-cover, placeholder 등
    _functions.scss
    _index.scss
  3-generic/              # 리셋, 노멀라이즈 (요소 선택자만)
    _normalize.scss
    _box-sizing.scss
    _index.scss
  4-elements/             # HTML 태그 기본 스타일 (h1, a, p 등)
    _base.scss
    _headings.scss
    _links.scss
    _index.scss
  5-objects/              # 레이아웃 패턴 (BEM 필수 적용)
    _container.scss
    _grid.scss
    _index.scss
  6-components/           # UI 컴포넌트 (BEM 필수 적용)
    _index.scss
  7-utilities/            # 유틸리티 클래스
    _sr-only.scss
    _visibility.scss
    _index.scss
```

**새 파일 추가 규칙:**
- 새 컴포넌트: `src/scss/6-components/_컴포넌트명.scss` 생성 후 `6-components/_index.scss`에 `@forward` 추가
- 새 유틸리티: `src/scss/7-utilities/_유틸리티명.scss` 생성 후 `7-utilities/_index.scss`에 `@forward` 추가
- `style.scss`에 새 레이어 `@use` 추가 (이미 있으면 생략)

**모듈 시스템:**
- `@use`/`@forward`를 사용하라 (`@import` 사용을 금지한다)
- 숫자 접두사 폴더는 `@use` 시 `as` 별칭 필수: `@use '1-settings' as settings`
- 각 레이어의 `_index.scss`에서 `@forward`로 내부 파일 공개

**ITCSS 레이어별 BEM 적용 범위:**

| 레이어 | BEM 적용 | 설명 |
|--------|---------|------|
| 1-settings | 적용 안함 | 변수, 토큰 정의 (클래스 없음) |
| 2-tools | 적용 안함 | 믹스인, 함수 (CSS 출력 없음) |
| 3-generic | 적용 안함 | reset/normalize, 요소 선택자만 |
| 4-elements | 적용 안함 | HTML 태그 선택자 |
| **5-objects** | **필수** | `.container`, `.grid`, `.grid__col-*` 등 |
| **6-components** | **필수** | `.card`, `.btn`, `.form` 등 모든 UI |
| 7-utilities | 부분 적용 | `.sr-only`, `.hidden` 등 |

### 2. 반응형 작성

모바일 퍼스트 접근을 사용하라.

```scss
// 반응형 믹스인 사용법
@use '../2-tools/responsive' as resp;

.card {
  padding: var(--spacing-sm);          // 모바일 기본

  @include resp.respond-to('tablet') {
    padding: var(--spacing-md);        // 태블릿 (768px ~ 1279px)
  }

  @include resp.respond-to('pc') {
    padding: var(--spacing-lg);        // PC (1280px ~)
  }
}

// tablet-up: 태블릿+PC 동일 스타일 적용 시
.nav {
  display: none;

  @include resp.respond-to('tablet-up') {
    display: flex;                     // 태블릿+PC (768px ~)
  }
}
```

**브레이크포인트:**
- 모바일: 0 ~ 767px (기본 스타일)
- 태블릿: 768px ~ 1279px
- PC: 1280px ~
- `tablet-up`: 768px ~ (태블릿+PC 공통)

**62.5% REM 트릭:**
- `html { font-size: 62.5% }` 적용 -- 1rem = 10px
- px -> rem 변환: px값 / 10 (예: 16px = 1.6rem, 24px = 2.4rem)
- 토큰 값이 이미 rem으로 정의되어 있으므로 토큰을 우선 사용하라

### 3. 공용 믹스인

```scss
@use '../2-tools/mixins' as mix;

// flex 센터 정렬
@include mix.flex-center;              // row 방향
@include mix.flex-center(column);      // column 방향

// width + height 100%
@include mix.full;

// 한 줄 말줄임
@include mix.ellipsis;

// 여러 줄 말줄임
@include mix.ellipsis-multiline(3);    // 3줄 후 말줄임

// 배경 이미지 커버
@include mix.bg-cover;

// placeholder 스타일
@include mix.placeholder(var(--color-gray-500));
```
<!-- GSD:architecture-end -->

### 접근성 가이드 참조 경로

- 퍼블리싱 체크리스트: docs/accessibility/checklist.md
- 색상 대비 가이드: docs/accessibility/color-contrast.md
- 스크린리더 전용 패턴: docs/accessibility/sr-only.md
- 컴포넌트별 접근성: docs/accessibility/{component}.md (btn, form, card, table, modal, tab, breadcrumb, pagination)

### 문서 사이트

문서 사이트: `npm run build:site`로 빌드 후 _site/ 에서 열람. `npm run serve`로 개발 서버 실행.

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
