## Project

**인포마인드 UX 프로젝트**

인포마인드 UX팀 표준(ITCSS + BEM + 디자인 토큰)을 적용한 프로젝트다.

**Core Value:** 검증된 팀 표준을 일관되게 유지하며 개발한다.

---

## 코딩 규칙

> 위반은 훅(check-violations.js + stylelint)이 자동 검출한다.

<!-- RULES_START -->
### SCSS 규칙
- R-01 `error` — 모든 색상/간격/크기는 var(--token) 사용 — 하드코딩 금지
- R-02 `warn` — !important 사용 금지 — 부득이한 경우 주석으로 사유 필수

### BEM 네이밍
- R-04 `info` — BEM 사용 (5-objects, 6-components 레이어에만 적용)
- R-05 `error` — element 2단계 중첩 금지 — 평탄화
- R-06 `error` — 시각적 modifier 금지 — 의미적 이름 사용

### 모듈 시스템
- R-03 `error` — @use/@forward만 사용 — @import 금지

### HTML/마크업 규칙
- R-07 `warn` — inline style 금지 — CSS 커스텀 프로퍼티 style="--var: val"은 허용
- R-08 `warn` — HTML 클래스에도 BEM 2단계 element 금지 (R-05 연동)
- R-09 `error` — img alt 속성 필수
- R-10 `error` — 인터랙티브 요소는 시맨틱 HTML 사용 — div onclick 금지

### 접근성 규칙
- R-11 `error` — 포커스 스타일 필수 — :focus { outline: none } 금지
- R-12 `error` — 색상 대비 — 일반 텍스트 4.5:1 이상, 큰 텍스트 3:1 이상
- R-13 `error` — 터치/클릭 영역 최소 44×44px
- R-14 `error` — 건너뛰기 링크 필수 — .skip-to-content
<!-- RULES_END -->

---

## 작업 전 체크리스트

### SCSS 파일 작성 시

1. 토큰 파일 확인: `src/scss/1-settings/` — 사용할 토큰 이름을 먼저 확인
2. 모든 색상/간격/크기는 `var(--token-name)` 사용
3. `@use` 경로는 상대 경로로 (`../2-tools/responsive` 등)
4. 새 컴포넌트: `6-components/_index.scss`에 `@forward '컴포넌트명'` 추가 필수
5. 작성 후: `npm run lint:css` 실행 및 오류 수정 완료

### 컴포넌트 마크업 작성 시

1. 스니펫 확인: `src/snippets/{component}.md` — 기존 패턴 우선 적용
2. BEM Block명은 `src/scss/6-components/_{component}.scss` 파일명과 일치
3. 인터랙티브 요소: `role`, `aria-*`, `tabindex` 확인
4. 폼 요소: `<label for>` + `id` 연결 필수

### 신규 컴포넌트 생성 시

`/create-component {컴포넌트명}` 스킬 사용 — 아래 파일 3개가 일괄 생성됨:

| 파일 | 위치 |
|------|------|
| SCSS | `src/scss/6-components/_{name}.scss` |
| 스니펫 | `src/snippets/{name}.md` |
| 플레이그라운드 | `src/playground/{name}.html` |

---

## Technology Stack

| Category | Technology | Version |
|----------|-----------|---------|
| CSS Preprocessor | sass (Dart Sass) | ^1.98.0 |
| SCSS Pattern | ITCSS | - |
| Linting | Stylelint + stylelint-selector-bem-pattern | ^17.5.0 |

---

## 디자인 토큰 위치

모든 스타일 값은 CSS Custom Properties를 사용하라. 하드코딩 금지.

| 토큰 종류 | 파일 |
|----------|------|
| 색상 | `src/scss/1-settings/_tokens-color.scss` |
| 타이포 | `src/scss/1-settings/_tokens-typography.scss` |
| 간격 | `src/scss/1-settings/_tokens-spacing.scss` |
| 기타 (radius, shadow, z-index) | `src/scss/1-settings/_tokens-misc.scss` |
| 그리드 | `src/scss/1-settings/_tokens-grid.scss` |

---

## SCSS 구조 (ITCSS 7레이어)

```
src/scss/
  style.scss                  # 메인 진입점 — 직접 수정 금지
  _project-overrides.scss     # 프로젝트별 토큰 오버라이드만
  1-settings/                 # 토큰, 변수
  2-tools/                    # 믹스인, 함수 (_responsive.scss, _mixins.scss)
  3-generic/                  # 리셋
  4-elements/                 # HTML 태그 기본 스타일
  5-objects/                  # 레이아웃 패턴 — BEM 적용
  6-components/               # UI 컴포넌트 — BEM 적용
  7-utilities/                # 유틸리티
```

BEM은 **5-objects, 6-components 레이어에만** 적용한다.

---

## 반응형 믹스인

```scss
@use '../2-tools/responsive' as resp;  /* 파일명: _responsive.scss */

.block {
  /* 모바일 기본 (0~767px) */

  @include resp.respond-to('tablet') {
    /* 768px ~ 1279px */
  }

  @include resp.respond-to('tablet-up') {
    /* 768px ~ */
  }

  @include resp.respond-to('pc') {
    /* 1280px ~ */
  }
}
```

62.5% REM 트릭 적용 — `1rem = 10px`

---

## 컴포넌트 스니펫 참조

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

---

## LLM 컨텍스트 파일

작업 유형에 따라 아래 파일을 읽어서 컨텍스트를 확보하라.

| 파일 | 언제 읽을까 |
|------|------------|
| `prompts/context.md` | 컴포넌트/SCSS 작업 시작 시 — 규칙 + 토큰 요약 |
| `prompts/tokens.md` | 토큰 이름을 확인해야 할 때 |
| `prompts/components.md` | 컴포넌트 마크업 패턴을 참조할 때 |
| `prompts/design-rules.md` | 디자인 품질 기준이 필요할 때 |
| `prompts/publishing.md` | 퍼블리싱 완료 전 체크리스트 확인 시 |

---

## 명령어

```bash
npm run check           # 위반 패턴 전체 스캔 (훅에서도 자동 실행)
npm run lint:css        # SCSS 린트 전체 검사
npm run lint:css:fix    # 자동 수정
npm run build:css       # CSS 빌드
npm run watch:css       # CSS 감시 빌드
```

## 코딩 스타일

- 들여쓰기: 2 spaces
- 따옴표: single quote
- 세미콜론: SCSS는 사용, JS/HTML은 사용하지 않음
- 주석 언어: 한국어
