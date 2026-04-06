## Project

**INFOMIND UX 디자인/퍼블리싱 가이드 시스템**

인포마인드 UX팀의 디자인 및 퍼블리싱 기본 규칙과 템플릿을 체계화한 가이드 시스템.

**Core Value:** 신규 프로젝트 시작 시 검증된 팀 표준을 즉시 적용할 수 있어야 한다.

### Constraints

- **CSS 방법론**: BEM(Block__Element--Modifier) 필수
- **전처리기**: SCSS(dart-sass), `@use`/`@forward` 사용 (`@import` 금지)
- **패키지 매니저**: npm
- **접근성**: KWCAG/WCAG 2.1 AA 이상
- **코딩 스타일**: 2 spaces, single quote, 세미콜론 없음 (SCSS는 세미콜론 사용)
- **주석 언어**: 한국어

## Technology Stack

| Category | Technology | Version |
|----------|-----------|---------|
| Site Generator | Eleventy (11ty) | ^3.1.5 |
| CSS Preprocessor | sass (Dart Sass) | ^1.98.0 |
| SCSS Pattern | ITCSS | - |
| Tokens | Style Dictionary | ^5.4.0 |
| Linting | Stylelint + stylelint-selector-bem-pattern | ^17.5.0 |
| A11y Testing | pa11y-ci + axe-core | latest |

## Conventions

### BEM 네이밍

- Element 2단계 중첩 금지: `.card__header__title` → `.card__title`
- Modifier는 시각적 속성명 금지, 의미적 이름 사용: `.btn--gray` → `.btn--secondary`
- 5-objects, 6-components 레이어에만 BEM 적용

### 디자인 토큰

모든 스타일 값은 CSS Custom Properties를 사용하라. 하드코딩 금지.

- 색상: `src/scss/1-settings/_tokens-color.scss`
- 타이포: `src/scss/1-settings/_tokens-typography.scss`
- 간격: `src/scss/1-settings/_tokens-spacing.scss`
- 기타 (radius, shadow, z-index): `src/scss/1-settings/_tokens-misc.scss`
- 그리드: `src/scss/1-settings/_tokens-grid.scss`

### 린트

코드 작성 후 반드시 실행하라.

```bash
npm run lint:css        # 전체 검사
npm run lint:css:fix    # 자동 수정
```

### 컴포넌트 스니펫

마크업 패턴과 접근성은 `src/snippets/` 참조.

| 컴포넌트 | 스니펫 | SCSS |
|----------|--------|------|
| 버튼 | `src/snippets/btn.md` | `src/scss/6-components/_btn.scss` |
| 폼 | `src/snippets/form.md` | `src/scss/6-components/_form.scss` |
| 카드 | `src/snippets/card.md` | `src/scss/6-components/_card.scss` |
| 테이블 | `src/snippets/table.md` | `src/scss/6-components/_table.scss` |
| 모달 | `src/snippets/modal.md` | `src/scss/6-components/_modal.scss` |
| 탭 | `src/snippets/tab.md` | `src/scss/6-components/_tab.scss` |
| 페이지네이션 | `src/snippets/pagination.md` | `src/scss/6-components/_pagination.scss` |
| 브레드크럼 | `src/snippets/breadcrumb.md` | `src/scss/6-components/_breadcrumb.scss` |
| 보일러플레이트 | `src/snippets/boilerplate.md` | — |

## Architecture

### SCSS 구조 (ITCSS 7레이어)

```
src/scss/
  style.scss              # 메인 진입점
  _project-overrides.scss # 프로젝트별 토큰 오버라이드
  1-settings/             # 토큰, 변수
  2-tools/                # 믹스인, 함수 (responsive.scss, mixins.scss)
  3-generic/              # 리셋
  4-elements/             # HTML 태그 기본 스타일
  5-objects/              # 레이아웃 패턴
  6-components/           # UI 컴포넌트
  7-utilities/            # 유틸리티
```

- 새 컴포넌트: `6-components/_컴포넌트.scss` 생성 후 `6-components/_index.scss`에 `@forward` 추가

### 반응형

모바일 퍼스트. 믹스인: `src/scss/2-tools/responsive.scss`

| 브레이크포인트 | 범위 |
|--------------|------|
| 모바일 (기본) | 0 ~ 767px |
| tablet | 768px ~ 1279px |
| pc | 1280px ~ |
| tablet-up | 768px ~ |

62.5% REM 트릭 적용 — 1rem = 10px

### 공용 믹스인

`src/scss/2-tools/mixins.scss` 참조 (flex-center, full, ellipsis, bg-cover 등)

## 접근성

- 퍼블리싱 체크리스트: `docs/accessibility/checklist.md`
- 컴포넌트별 가이드: `docs/accessibility/{component}.md`
- 본문 건너뛰기 링크 필수: `<a href="#main-content" class="skip-to-content">`
- 스크린 리더 전용: `.sr-only` 클래스 사용

## GSD Workflow

파일 수정 전 GSD 명령어를 통해 작업하라:

- `/gsd:quick` — 소규모 수정, 문서 작업
- `/gsd:debug` — 버그 조사
- `/gsd:execute-phase` — 계획된 페이즈 작업

## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
