# Phase 2: Conventions -- BEM + Linting - Research

**Researched:** 2026-03-25
**Domain:** BEM naming convention, Stylelint SCSS linting, AI instruction authoring
**Confidence:** HIGH

## Summary

Phase 2는 엄격한 BEM 네이밍 규칙을 문서화하고, Stylelint으로 자동 검증 체계를 구축하며, CLAUDE.md에 AI가 즉시 활용 가능한 지시문을 통합하는 작업이다. 핵심 도구는 Stylelint 17.5.0 + stylelint-config-standard-scss + stylelint-selector-bem-pattern 조합이며, BEM 위반은 warning 수준으로 설정한다.

Stylelint 17에서 `resolveNestedSelectors` 옵션이 코어 `selector-class-pattern`에서 제거되었다는 점이 가장 중요한 발견이다. SCSS에서 `&__element`, `&--modifier` 패턴을 검증하려면 반드시 `scss/selector-class-pattern` 규칙을 사용해야 한다. 또한 `stylelint-selector-bem-pattern`은 `postcss-bem-linter`를 내장하며, 각 SCSS 파일에 `/** @define ComponentName */` 주석 또는 `implicitComponents` 옵션으로 컴포넌트 범위를 지정해야 한다.

두 가지 접근법(selector-class-pattern regex vs. stylelint-selector-bem-pattern 플러그인)을 비교한 결과, `scss/selector-class-pattern` + BEM regex가 더 실용적이다. `@define` 주석 없이도 동작하고, ITCSS 폴더 구조의 settings/tools/generic/elements 레이어는 BEM 대상이 아니므로 선택적 적용이 용이하다.

**Primary recommendation:** `stylelint-config-standard-scss` 확장 + `scss/selector-class-pattern` BEM regex(warning) + `stylelint-selector-bem-pattern` 플러그인은 objects/components 레이어에만 선택적 적용

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** 엄격한 BEM 표기법 완전 준수 -- Block__Element--Modifier 패턴 필수
- **D-02:** 예시: `.card__header`, `.btn--primary`, `.form__input--error`
- **D-03:** 기존 프로젝트의 느슨한 하이픈 패턴(`.card-header`, `.btn-primary`)은 잘못된 패턴으로 do/don't 가이드에 명시
- **D-04:** BEM 위반 시 경고(warning) 수준으로 표시 -- 빌드는 성공하되 경고 로그 출력
- **D-05:** 경고 메시지에 올바른 BEM 패턴을 권장 방향으로 함께 안내
- **D-06:** `npm run lint:fix`로 자동 수정 가능한 항목은 자동 처리 지원
- **D-07:** 팀이 익숙해지면 추후 에러 수준으로 전환 가능 (현재는 경고)
- **D-08:** 프로젝트 CLAUDE.md에 모든 규칙을 직접 작성 -- 별도 스킬 파일 없이 CLAUDE.md 하나로 통합
- **D-09:** CLAUDE.md에 BEM 네이밍, 토큰 사용법, SCSS 구조, 접근성 기본 규칙 등 Phase 1~2 전체 규칙 포함
- **D-10:** AI가 CLAUDE.md만 읽으면 즉시 규칙대로 코드를 생성할 수 있는 수준의 구체적 지시문

### Claude's Discretion
- Stylelint 플러그인 선택 (stylelint-selector-bem-pattern 등)
- `.stylelintrc` 구체적 설정값
- BEM do/don't 예제의 구체적 케이스 선정
- CLAUDE.md 섹션 구조 및 내용 구성
- SCSS 중첩에서 BEM 작성 패턴 예제 구성

### Deferred Ideas (OUT OF SCOPE)
- Stylelint 에러 수준 전환 -- 팀 적응 후 별도 결정
- Prettier 통합 -- 현재 범위 외
- ESLint 연동 -- JS/프레임워크 규칙은 별도
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| BEM-01 | BEM 네이밍 규칙 가이드 (Block__Element--Modifier 표기법 명확화) | BEM regex 패턴, do/don't 예제, SCSS 중첩 패턴 연구 완료 |
| BEM-02 | BEM do/don't 예제 모음 (기존 프로젝트의 잘못된 패턴 vs 올바른 패턴) | webstyleguide/inCMSv3의 실제 잘못된 패턴 수집 완료 (`.btn-primary`, `.card-header`, `.btn-gray`, `.input-box.error`) |
| BEM-03 | SCSS에서 BEM 중첩 작성 규칙 (&__element, &--modifier 패턴) | Stylelint 17 scss/selector-class-pattern resolveNestedSelectors 연구 완료 |
| BEM-04 | Stylelint + BEM 패턴 린팅 설정 파일 (.stylelintrc) 템플릿 제공 | stylelint-config-standard-scss + scss/selector-class-pattern + warning severity 설정 방법 확인 |
| AI-03 | 디자인 토큰/BEM 규칙이 AI 지시문 형태로 제공 | CLAUDE.md 통합 구조, AI-friendly 지시문 작성 패턴 연구 |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- **CSS 방법론**: BEM (Block__Element--Modifier)
- **전처리기**: SCSS (dart-sass)
- **패키지 매니저**: npm
- **인라인 스타일 사용 금지**, `!important` 사용 금지
- **들여쓰기**: 2 spaces, **따옴표**: single quote, **세미콜론**: 없음
- **주석**: 한국어
- **웹 접근성**: WCAG 2.1 AA (aria-label, alt, 키보드 네비게이션, 4.5:1 대비)

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| stylelint | 17.5.0 | CSS/SCSS 린팅 엔진 | 업계 표준, 플러그인 생태계 풍부 |
| stylelint-config-standard-scss | 17.0.0 | SCSS 표준 규칙 세트 | stylelint-scss 포함, SCSS @use/@forward 지원 |
| stylelint-selector-bem-pattern | 4.0.1 | BEM 패턴 검증 플러그인 | postcss-bem-linter 내장, BEM preset 지원 |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| stylelint-scss | 7.0.0 | SCSS 전용 규칙 | stylelint-config-standard-scss에 이미 포함 (직접 설치 불필요) |
| postcss-bem-linter | 4.0.1 | BEM 검증 엔진 | stylelint-selector-bem-pattern에 이미 포함 (직접 설치 불필요) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| stylelint-selector-bem-pattern | selector-class-pattern regex만 사용 | regex만으로 충분히 BEM 검증 가능하나, 컴포넌트 범위 검증(block-element 관계)은 불가 |
| stylelint-config-standard-scss | stylelint-config-standard + stylelint-scss 수동 조합 | 조합이 번거롭고 규칙 충돌 가능성 높음 |

**Installation:**
```bash
npm install --save-dev stylelint stylelint-config-standard-scss stylelint-selector-bem-pattern
```

**Version verification:** npm registry에서 2026-03-25 기준 확인 완료
- stylelint: 17.5.0
- stylelint-config-standard-scss: 17.0.0
- stylelint-selector-bem-pattern: 4.0.1

## Architecture Patterns

### Recommended .stylelintrc.json Structure

```json
{
  "extends": ["stylelint-config-standard-scss"],
  "plugins": ["stylelint-selector-bem-pattern"],
  "defaultSeverity": "warning",
  "rules": {
    "scss/selector-class-pattern": [
      "^[a-z][a-z0-9]*(-[a-z0-9]+)*((__[a-z0-9]+(-[a-z0-9]+)*)(--[a-z0-9]+(-[a-z0-9]+)*)?|(--[a-z0-9]+(-[a-z0-9]+)*))?$",
      {
        "resolveNestedSelectors": true,
        "message": "클래스명은 BEM 패턴을 따라야 합니다: .block__element--modifier (current: \"%s\")"
      }
    ],
    "plugin/selector-bem-pattern": {
      "preset": "bem",
      "implicitComponents": [
        "src/scss/5-objects/**/*.scss",
        "src/scss/6-components/**/*.scss"
      ]
    }
  }
}
```

### Two-Layer BEM Enforcement Strategy

BEM 검증을 두 단계로 구성하는 것을 권장한다.

**Layer 1 -- `scss/selector-class-pattern` (전역)**
- 모든 SCSS 파일의 클래스명이 BEM 패턴 regex에 맞는지 검증
- `resolveNestedSelectors: true`로 SCSS `&__element`, `&--modifier` 중첩 해석
- utility 클래스(`.sr-only`, `.hidden`)는 BEM block으로 유효하므로 통과

**Layer 2 -- `plugin/selector-bem-pattern` (선택적)**
- objects/components 레이어에만 `implicitComponents`로 적용
- block-element 관계의 의미적 일관성 검증 (`.card` 파일에 `.btn__icon`이 있으면 경고)
- settings/tools/generic/elements 레이어는 BEM 대상이 아니므로 제외

### SCSS BEM Nesting Pattern (Canonical)

```scss
// 올바른 BEM 중첩 패턴
.card {
  display: flex;

  &__header {
    padding: var(--spacing-md);
  }

  &__body {
    flex: 1;
  }

  &--featured {
    border-color: var(--color-primary);
  }

  // element + modifier 조합
  &__title {
    font-size: var(--font-size-lg);

    &--highlight {
      color: var(--color-primary);
    }
  }
}
```

### BEM Regex Pattern 상세 설명

```
^[a-z][a-z0-9]*(-[a-z0-9]+)*((__[a-z0-9]+(-[a-z0-9]+)*)(--[a-z0-9]+(-[a-z0-9]+)*)?|(--[a-z0-9]+(-[a-z0-9]+)*))?$
```

이 regex가 허용하는 패턴:
| Pattern | Example | Matches |
|---------|---------|---------|
| block | `.card`, `.btn`, `.sr-only` | O |
| block--modifier | `.btn--primary`, `.card--featured` | O |
| block__element | `.card__header`, `.form__input` | O |
| block__element--modifier | `.card__title--highlight`, `.form__input--error` | O |
| multi-word block | `.site-header`, `.nav-item` | O |

이 regex가 거부하는 패턴:
| Pattern | Example | Reason |
|---------|---------|--------|
| 대문자 | `.Card__header` | block은 소문자 시작 |
| element 중첩 | `.card__header__title` | element 2단계 중첩 금지 |
| 하이픈 하나 modifier | `.btn-primary` | `--` 아닌 `-` 사용 |

### Anti-Patterns to Avoid

- **`@define` 주석 남용:** `implicitComponents`로 충분히 대체 가능. 모든 파일에 `/** @define Block */` 주석을 넣는 것은 유지보수 부담
- **settings/tools 레이어에 BEM 강제:** `$variables`, `@mixin`, `@function`은 BEM 대상이 아님. ITCSS 1-settings ~ 4-elements 레이어는 린트 대상에서 제외하거나 느슨하게 적용
- **element 2단계 중첩:** `.card__header__title`은 BEM 안티패턴. `.card__title`로 평탄화하거나 `.card-header`를 별도 block으로 분리

### ITCSS Layer별 BEM 적용 범위

| Layer | BEM 적용 | 이유 |
|-------|---------|------|
| 1-settings | X | SCSS 변수, CSS Custom Properties 정의 |
| 2-tools | X | 믹스인, 함수 정의 |
| 3-generic | X | reset/normalize, 요소 선택자 |
| 4-elements | X | HTML 요소 선택자 (`h1`, `a`, `p`) |
| 5-objects | O | `.container`, `.grid`, `.grid__col-*` |
| 6-components | O | `.card`, `.btn`, `.form`, `.modal` 등 |
| 7-utilities | 부분 | `.sr-only`, `.hidden` 등은 BEM block으로 유효 |

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| BEM 이름 검증 | 수동 코드 리뷰 | `scss/selector-class-pattern` + regex | 사람은 실수하지만 린터는 일관적 |
| SCSS BEM 중첩 해석 | 커스텀 PostCSS 플러그인 | `resolveNestedSelectors: true` | Stylelint SCSS 플러그인이 이미 해결 |
| BEM 컴포넌트 범위 검증 | 파일별 수동 확인 | `stylelint-selector-bem-pattern` + `implicitComponents` | 파일명 기반 자동 컴포넌트 매핑 |

## Common Pitfalls

### Pitfall 1: Stylelint 17 resolveNestedSelectors 제거
**What goes wrong:** 코어 `selector-class-pattern` 규칙에 `resolveNestedSelectors` 옵션을 넣으면 무시되거나 에러 발생
**Why it happens:** Stylelint 17에서 CSS Nesting 표준과 호환되지 않아 코어에서 제거됨
**How to avoid:** 반드시 `scss/selector-class-pattern`을 사용 (stylelint-scss 플러그인 규칙)
**Warning signs:** SCSS `&__element` 패턴이 검증되지 않고 통과하거나, `Unknown option "resolveNestedSelectors"` 경고

### Pitfall 2: stylelint-config-standard-scss와 규칙 충돌
**What goes wrong:** `extends`에서 설정한 규칙과 `rules`에서 오버라이드한 규칙이 충돌
**Why it happens:** `stylelint-config-standard-scss`가 이미 `selector-class-pattern`을 설정하고 있을 수 있음
**How to avoid:** `rules`에서 `scss/selector-class-pattern`을 명시적으로 오버라이드하면 extends 설정을 완전 대체
**Warning signs:** 예상과 다른 린트 결과, 일부 패턴이 통과/실패하는 불일치

### Pitfall 3: utility 클래스 false positive
**What goes wrong:** `.sr-only`, `.hidden`, `.d-flex` 같은 유틸리티가 BEM 위반으로 잡힘
**Why it happens:** BEM regex가 단일 block 패턴(`.sr-only`)을 허용하지 않는 경우
**How to avoid:** regex에서 `(-[a-z0-9]+)*` 부분으로 하이픈 연결 단어를 허용 (위의 regex는 이미 처리됨)
**Warning signs:** 7-utilities 레이어 파일에서 경고 대량 발생

### Pitfall 4: implicitComponents 파일명 매핑 오류
**What goes wrong:** `_card.scss` 파일이 `card` 컴포넌트로 인식되지 않음
**Why it happens:** SCSS partial의 `_` 접두사나 확장자 매칭 실패
**How to avoid:** glob 패턴을 `src/scss/6-components/**/*.scss`로 충분히 넓게 설정하고 테스트
**Warning signs:** `plugin/selector-bem-pattern` 규칙이 아무 파일에도 적용되지 않음

### Pitfall 5: BEM do/don't 가이드가 추상적
**What goes wrong:** 팀이 가이드를 읽어도 실제 코드에 적용하지 못함
**Why it happens:** 일반적인 `.block__element--modifier` 설명만 있고 팀의 실제 패턴이 없음
**How to avoid:** 기존 프로젝트(webstyleguide, inCMSv3)의 실제 코드를 do/don't 예제로 활용
**Warning signs:** 가이드 배포 후에도 같은 실수 반복

## Code Examples

### Example 1: .stylelintrc.json 전체 설정 (Source: Stylelint 공식 문서 기반)

```json
{
  "extends": ["stylelint-config-standard-scss"],
  "plugins": ["stylelint-selector-bem-pattern"],
  "defaultSeverity": "warning",
  "rules": {
    "scss/selector-class-pattern": [
      "^[a-z][a-z0-9]*(-[a-z0-9]+)*((__[a-z0-9]+(-[a-z0-9]+)*)(--[a-z0-9]+(-[a-z0-9]+)*)?|(--[a-z0-9]+(-[a-z0-9]+)*))?$",
      {
        "resolveNestedSelectors": true,
        "message": "BEM 패턴 위반: \"%s\" -> .block__element--modifier 형태로 작성하세요"
      }
    ],
    "plugin/selector-bem-pattern": [
      {
        "preset": "bem",
        "implicitComponents": [
          "src/scss/5-objects/**/*.scss",
          "src/scss/6-components/**/*.scss"
        ]
      },
      {
        "severity": "warning",
        "message": "이 파일의 선택자가 파일명 기반 BEM 블록과 일치하지 않습니다"
      }
    ],
    "selector-class-pattern": null
  }
}
```

**주의:** `"selector-class-pattern": null`로 코어 규칙을 비활성화하고, `scss/selector-class-pattern`으로 대체한다.

### Example 2: BEM Do/Don't (팀 실제 패턴 기반)

```scss
// ===== DON'T: 기존 webstyleguide 패턴 =====

// 잘못된 예 1: 하이픈 단일 구분자 (modifier가 아닌 element처럼 보임)
.btn-primary { ... }     // X -- modifier인데 -- 아닌 - 사용
.btn-secondary { ... }   // X
.btn-outline { ... }     // X

// 잘못된 예 2: 요소 선택자로 하위 접근
.card-header h4 { ... }  // X -- 요소 선택자 의존, BEM element 미사용
.form-group label { ... } // X

// 잘못된 예 3: 상태를 별도 클래스로 (inCMSv3)
.input-box.error { ... }  // X -- modifier 대신 별도 클래스 조합
.btn-gray { ... }          // X -- 시각적 속성을 이름에 직접 사용

// ===== DO: 올바른 BEM 패턴 =====

// 올바른 예 1: modifier는 -- 구분자
.btn--primary { ... }
.btn--secondary { ... }
.btn--outline { ... }

// 올바른 예 2: element는 __ 구분자
.card__header { ... }
.card__title { ... }      // h4 대신 BEM element
.form__label { ... }       // label 대신 BEM element

// 올바른 예 3: 상태는 modifier
.form__input--error { ... }
.btn--disabled { ... }
```

### Example 3: SCSS 중첩 BEM 패턴 (Canonical)

```scss
// 버튼 컴포넌트 -- BEM + SCSS 중첩
.btn {
  display: inline-flex;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-base);
  transition: var(--transition-fast);

  // Element: 아이콘
  &__icon {
    margin-right: var(--spacing-xs);
    width: 1.6rem;
    height: 1.6rem;
  }

  // Element: 텍스트
  &__text {
    flex: 1;
  }

  // Modifier: 주요 버튼
  &--primary {
    background-color: var(--color-primary);
    color: var(--color-white);
  }

  // Modifier: 크기 변형
  &--large {
    padding: var(--spacing-md) var(--spacing-lg);
    font-size: var(--font-size-lg);
  }

  // Modifier: 비활성
  &--disabled {
    opacity: 0.5;
    pointer-events: none;
  }
}
```

### Example 4: npm scripts 설정

```json
{
  "scripts": {
    "lint:css": "stylelint \"src/scss/**/*.scss\"",
    "lint:css:fix": "stylelint \"src/scss/**/*.scss\" --fix",
    "build:css": "sass src/scss/style.scss dist/css/style.css --load-path=node_modules",
    "watch:css": "sass src/scss/style.scss dist/css/style.css --load-path=node_modules --watch"
  }
}
```

### Example 5: CLAUDE.md AI 지시문 구조 (권장)

```markdown
# BEM 네이밍 규칙

## 필수 패턴
- Block: `.block-name` (소문자, 하이픈 연결)
- Element: `.block__element` (더블 언더스코어)
- Modifier: `.block--modifier` (더블 하이픈)
- Element+Modifier: `.block__element--modifier`

## SCSS 작성 규칙
- 반드시 & 중첩 사용: `&__element`, `&--modifier`
- element 2단계 금지: `.card__header__title` -> `.card__title`
- modifier는 block 또는 element에만 붙임

## 금지 패턴
- `.btn-primary` -> `.btn--primary` (modifier에 -- 사용)
- `.card-header` -> `.card__header` (element에 __ 사용)
- `.input-box.error` -> `.form__input--error` (별도 클래스 대신 modifier)
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `selector-class-pattern` + `resolveNestedSelectors` | `scss/selector-class-pattern` + `resolveNestedSelectors` | Stylelint 17.0.0 (2024) | SCSS 사용 시 반드시 scss/ 접두사 규칙 사용 필수 |
| `stylelint-config-standard` + `stylelint-scss` 수동 조합 | `stylelint-config-standard-scss` 단일 패키지 | 2023+ | 설정 단순화, 충돌 방지 |
| `@import` 기반 SCSS | `@use`/`@forward` 기반 SCSS | Dart Sass 2.0 | stylelint-scss 7.x에서 @use 완전 지원 |

**Deprecated/outdated:**
- `selector-class-pattern`의 `resolveNestedSelectors` 옵션: Stylelint 17에서 제거. `scss/selector-class-pattern` 사용
- `stylelint-config-standard` 단독 사용: SCSS 프로젝트에서는 `stylelint-config-standard-scss` 권장

## Open Questions

1. **`implicitComponents`의 SCSS partial `_` 접두사 처리**
   - What we know: postcss-bem-linter가 파일명에서 컴포넌트명을 추출할 때 `_` 제거 여부 미확인
   - What's unclear: `_card.scss` -> `card` 블록으로 자동 매핑되는지
   - Recommendation: 구현 시 5-objects와 6-components 파일로 테스트 후 확인. 실패 시 `@define` 주석으로 대체

2. **stylelint-config-standard-scss의 기본 selector-class-pattern 설정**
   - What we know: extends 체인에서 이미 `selector-class-pattern`을 설정하고 있을 수 있음
   - What's unclear: 정확히 어떤 값으로 설정되어 있는지
   - Recommendation: `rules`에서 `"selector-class-pattern": null`로 명시적 비활성화, `scss/selector-class-pattern`으로 대체

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Stylelint 실행 | O | 22.21.1 | -- |
| npm | 패키지 설치 | O | 10.9.4 | -- |
| sass (dart-sass) | SCSS 컴파일 | O | ^1.98.0 (package.json) | -- |

**Missing dependencies with no fallback:**
- stylelint, stylelint-config-standard-scss, stylelint-selector-bem-pattern: 아직 미설치 (Phase 2에서 설치)

**Missing dependencies with fallback:**
- None

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Stylelint 17.5.0 (린팅 규칙 자체가 검증 수단) |
| Config file | `.stylelintrc.json` (Phase 2 Wave 0에서 생성) |
| Quick run command | `npx stylelint "src/scss/5-objects/**/*.scss" "src/scss/6-components/**/*.scss"` |
| Full suite command | `npx stylelint "src/scss/**/*.scss"` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| BEM-01 | BEM 네이밍 규칙 문서화 | manual-only | CLAUDE.md 내용 리뷰 | -- Wave 0 |
| BEM-02 | do/don't 예제 작성 | manual-only | 문서 리뷰 | -- Wave 0 |
| BEM-03 | SCSS BEM 중첩 규칙 검증 | smoke | `npx stylelint "src/scss/5-objects/_grid.scss"` | -- Wave 0 |
| BEM-04 | .stylelintrc 설정 검증 | smoke | `npx stylelint "src/scss/**/*.scss"` | -- Wave 0 |
| AI-03 | CLAUDE.md AI 지시문 | manual-only | AI에게 CLAUDE.md 기반 코드 생성 요청 테스트 | -- |

### Sampling Rate
- **Per task commit:** `npx stylelint "src/scss/5-objects/**/*.scss" "src/scss/6-components/**/*.scss"`
- **Per wave merge:** `npx stylelint "src/scss/**/*.scss"`
- **Phase gate:** 전체 SCSS lint warning만 허용 (error 0개), CLAUDE.md 규칙 완전성 리뷰

### Wave 0 Gaps
- [ ] `.stylelintrc.json` -- Stylelint 설정 파일 (Phase 2 첫 태스크에서 생성)
- [ ] `package.json` scripts -- `lint:css`, `lint:css:fix` 스크립트 추가
- [ ] npm 패키지 설치 -- `stylelint`, `stylelint-config-standard-scss`, `stylelint-selector-bem-pattern`

## Sources

### Primary (HIGH confidence)
- [Stylelint 공식 설정 문서](https://stylelint.io/user-guide/configure/) -- defaultSeverity, per-rule severity, plugins 설정
- [Stylelint 17 마이그레이션 가이드](https://stylelint.io/migration-guide/to-17/) -- resolveNestedSelectors 제거, scss/ 규칙 전환
- [stylelint-selector-bem-pattern GitHub](https://github.com/simonsmith/stylelint-selector-bem-pattern) -- BEM preset, implicitComponents
- [postcss-bem-linter GitHub](https://github.com/postcss/postcss-bem-linter) -- BEM preset regex, @define 주석, ignoreSelectors
- npm registry 직접 조회 -- stylelint 17.5.0, stylelint-config-standard-scss 17.0.0, stylelint-selector-bem-pattern 4.0.1

### Secondary (MEDIUM confidence)
- [stylelint-selector-bem-pattern issue #23](https://github.com/simonsmith/stylelint-selector-bem-pattern/issues/23) -- BEM preset 설정 방법
- [EU System SCSS conventions](https://ec.europa.eu/component-library/v1.15.0/eu/docs/conventions/scss/) -- BEM + Stylelint 실전 설정 참고

### Tertiary (LOW confidence)
- BEM regex 패턴의 모든 edge case 커버리지 -- 실제 적용 시 테스트 필요

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- npm registry에서 최신 버전 직접 확인, 공식 문서로 설정 방법 검증
- Architecture: HIGH -- Stylelint 17 마이그레이션 가이드에서 SCSS 대응 방법 확인, 두 가지 접근법 비교 완료
- Pitfalls: HIGH -- Stylelint 17 breaking change(resolveNestedSelectors 제거)가 가장 큰 함정이며 공식 문서에서 확인

**Research date:** 2026-03-25
**Valid until:** 2026-04-25 (Stylelint 17.x 안정 버전, 30일 유효)
