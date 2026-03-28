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

| Category | Technology | Version |
|----------|-----------|---------|
| Site Generator | Eleventy (11ty) | ^3.1.5 |
| Template | Nunjucks | ^3.2.4 |
| CSS Preprocessor | sass (Dart Sass) | ^1.98.0 |
| PostCSS | PostCSS + Autoprefixer | ^8.5.0 / ^10.4.0 |
| SCSS Pattern | ITCSS | - |
| Tokens | Style Dictionary | ^5.4.0 |
| Linting | Stylelint + stylelint-selector-bem-pattern | ^17.5.0 |
| A11y Testing | pa11y-ci + axe-core | latest / ^4.11.0 |
| Build | npm scripts + concurrently | - |
| Libraries | sass-rem, Prism.js, clipboard.js | latest |

> `sass`가 올바른 npm 패키지 (`dart-sass` 아님). `@use`/`@forward` 사용 (`@import` 금지).
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

### 2. 디자인 토큰 사용법

모든 스타일 값은 CSS Custom Properties(토큰)를 사용하라. 하드코딩 색상, 크기, 간격을 금지한다.

**토큰 파일 참조 (값은 각 파일에서 확인):**
- 색상: `src/scss/1-settings/_tokens-color.scss`
- 타이포: `src/scss/1-settings/_tokens-typography.scss`
- 간격: `src/scss/1-settings/_tokens-spacing.scss`
- 기타 (radius, shadow, transition, z-index): `src/scss/1-settings/_tokens-misc.scss`
- 그리드: `src/scss/1-settings/_tokens-grid.scss`

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

### 3. 린트 규칙

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
- SCSS에서는 세미콜론 사용 (JS/HTML의 세미콜론 없음 규칙과 다름)

### 4. 컴포넌트 스니펫

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
  _project-overrides.scss # 프로젝트별 토큰 오버라이드
  1-settings/             # 토큰, 변수, 브레이크포인트 (CSS 출력 없음)
  2-tools/                # 믹스인, 함수 (CSS 출력 없음)
  3-generic/              # 리셋, 노멀라이즈 (요소 선택자만)
  4-elements/             # HTML 태그 기본 스타일 (h1, a, p 등)
  5-objects/              # 레이아웃 패턴 (BEM 필수 적용)
  6-components/           # UI 컴포넌트 (BEM 필수 적용)
  7-utilities/            # 유틸리티 클래스
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

**프로젝트 고유 접근성 규칙:**
- 본문 건너뛰기 링크 제공: `<a href="#main-content" class="skip-to-content">`
- 스크린 리더 전용 텍스트: `.sr-only` 클래스 사용

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
