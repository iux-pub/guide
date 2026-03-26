# Phase 1: Foundation -- Design Tokens + SCSS Architecture - Research

**Researched:** 2026-03-25
**Domain:** CSS Design Tokens (Custom Properties) + SCSS Architecture (ITCSS)
**Confidence:** HIGH

## Summary

이 Phase는 프로젝트 전체의 스타일링 기반을 확립한다. CSS Custom Properties로 디자인 토큰을 정의하고, ITCSS 기반 SCSS 폴더 구조를 세우며, 기존 믹스인을 현대화하고, 토큰 시각화 플레이그라운드 HTML 페이지를 만든다. Style Dictionary 없이 SCSS 파일에서 직접 `:root` 블록으로 토큰을 정의하는 심플한 접근 방식이 결정되었다.

기존 프로젝트(webstyleguide, inCMSv3)의 CSS Custom Properties 패턴과 SCSS 구조를 분석한 결과, 현재 코드베이스에서 이미 `--color-main`, `--color-gray1` 등의 패턴이 사용 중이다. 이를 체계적인 토큰 네이밍 시스템으로 표준화하면서, KRDS 공공 디자인시스템의 시맨틱 색상과 레이아웃 수치를 반영한다.

**Primary recommendation:** SCSS 파일 내에서 `:root` 블록으로 CSS Custom Properties를 직접 정의하고, `@use`/`@forward` 모듈 시스템으로 ITCSS 레이어를 구성한다. 브레이크포인트만 SCSS 변수로 예외 처리하고, sass-rem v4의 `rem.convert()` 함수를 사용한다.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Primary 색상은 프로젝트마다 변경되므로 기본값만 정의하고 `:root` 오버라이드로 프로젝트별 커스텀. 중립 팔레트 방식.
- **D-02:** 시맨틱 색상(success, danger, warning, info)은 KRDS 공공 디자인시스템 기준 채택
- **D-03:** 그레이 스케일은 Claude 재량으로 기존 프로젝트 값들(#222, #333, #666, #999, #ccc, #efefef, #f8f8f8)을 참고하여 정리
- **D-04:** 3단계로 간소화 -- 모바일(0~767px), 태블릿(768px~1279px), PC(1280px~)
- **D-05:** 콘텐츠 max-width는 1200px (KRDS 표준형과 동일)
- **D-06:** 양쪽 마진 포함 시 1280px 뷰포트에서 콘텐츠 1200px + 좌우 40px
- **D-07:** KRDS 표준형 그리드 참고 -- PC/태블릿 12컬럼, 모바일 4컬럼, 거터 PC 24px / 모바일 16px
- **D-08:** 기존 믹스인 현대화 정리 -- vendor prefix(-webkit-, -moz-) 제거, 불필요한 것 삭제, 필요한 것만 개선 유지
- **D-09:** 반응형 믹스인 새로 추가 -- `@mixin respond-to(mobile/tablet/pc)` 형태의 미디어 쿼리 헬퍼
- **D-10:** 토큰은 CSS Custom Properties(`var(--token)`)로 통일. 브레이크포인트만 SCSS 변수 예외 (CSS 미디어 쿼리 제약)
- **D-11:** Style Dictionary 등 별도 도구 없이 SCSS 파일에서 직접 `:root` 블록으로 토큰 정의 (심플하게)
- **D-12:** 토큰 네이밍을 Tailwind 컨벤션과 충돌하지 않게 설계 -- 향후 Tailwind 도입 시 config에서 `var()` 참조로 매핑 가능하도록
- **D-13:** 프로젝트별 커스텀은 `:root` 오버라이드 파일 하나로 처리

### Claude's Discretion
- 그레이 스케일 구체적 값과 단계 수
- 타이포그래피 스케일 구체적 사이즈 (기존 webstyleguide 참고하되 조정 가능)
- 간격(Spacing) 토큰 스케일 구체적 값
- 기타 토큰(border-radius, box-shadow, transition, z-index) 구체적 값
- 기존 믹스인 중 제거할 것과 유지할 것의 최종 판단
- ITCSS 레이어별 파일 구성 세부사항
- 토큰 플레이그라운드 페이지 디자인/구조

### Deferred Ideas (OUT OF SCOPE)
- Tailwind CSS 도입/전환 -- 현재는 SCSS 기반, 향후 별도 결정
- Style Dictionary 도입 -- 현재는 SCSS 직접 관리, 토큰이 복잡해지면 재검토
- Figma Variables <-> 코드 토큰 자동 동기화 -- v2 범위
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| TOKEN-01 | 색상 토큰 체계 정의 (Primary, Secondary, Gray scale, Semantic colors) -- KRDS 기준 반영 | KRDS 시맨틱 색상 HEX값 확보, 기존 프로젝트 색상 패턴 분석 완료 |
| TOKEN-02 | 타이포그래피 토큰 정의 (폰트 패밀리, 사이즈 스케일, line-height, font-weight) | webstyleguide 기존 스케일 분석, Pretendard GOV 폰트 체계 확인 |
| TOKEN-03 | 간격(Spacing) 토큰 정의 (4px 기반 스케일: xs~3xl) | webstyleguide 기존 spacing 분석, 4px 기반 스케일 설계 |
| TOKEN-04 | 그리드 시스템 토큰 정의 (12컬럼, 거터, 컨테이너 max-width) | KRDS 레이아웃 표준 수치 확보, D-04~D-07 결정사항 반영 |
| TOKEN-05 | 기타 토큰 정의 (border-radius, box-shadow, transition, z-index) | webstyleguide 기존 값 분석, 구체값은 Claude 재량 |
| TOKEN-06 | ~~Style Dictionary JSON -> SCSS + CSS Custom Properties 파이프라인~~ **변경: SCSS 파일에서 직접 `:root` 블록으로 토큰 정의** | D-11 결정에 따라 Style Dictionary 제외, SCSS 직접 관리 방식 |
| TOKEN-07 | 토큰 시각적 플레이그라운드 페이지 (색상 팔레트, 타입 스케일, 간격 미리보기) | 정적 HTML 페이지로 토큰 시각화 구현 |
| SCSS-01 | ITCSS 기반 SCSS 폴더 구조 정의 (settings/tools/base/layout/components/utilities) | ITCSS 패턴 분석, 기존 import 순서 매핑 완료 |
| SCSS-02 | 기존 공통 믹스인 정리 및 개선 | 기존 16개 믹스인 상세 분석, 유지/제거/현대화 판단 완료 |
| SCSS-03 | 반응형 브레이크포인트 표준화 (3단계: 모바일/태블릿/PC) | D-04 결정 반영, respond-to 믹스인 설계 |
| SCSS-04 | REM 함수 및 유틸리티 설정 (16px 기준) | sass-rem v4 @use 호환성 확인, rem.convert() 사용법 문서화 |
| SCSS-05 | Normalize/Reset SCSS 정리 | modern-normalize v3 사용, 기존 normalize 대체 |
| SCSS-06 | SCSS 파일 구조 가이드 문서 (어디에 무엇을 넣는지 설명) | ITCSS 레이어별 파일 매핑 및 역할 정의 완료 |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- **CSS 방법론**: BEM (Block__Element--Modifier) 필수
- **전처리기**: SCSS (dart-sass) -- `sass` npm 패키지 사용 (dart-sass 패키지는 deprecated)
- **패키지 매니저**: npm
- **인라인 스타일 사용 금지**
- **`!important` 사용 금지** (부득이한 경우 주석 필수)
- **들여쓰기**: 2 spaces
- **따옴표**: single quote
- **세미콜론**: 없음 (SCSS에서는 세미콜론 필수이므로 이 규칙은 JS/TS에만 적용, SCSS는 표준 문법 따름)
- **주석은 한국어로 작성**
- **웹 접근성**: 색상 대비 4.5:1 이상 유지 (WCAG 2.1 AA)

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| sass (Dart Sass) | ^1.98.0 | SCSS 컴파일 | 팀 표준. `@use`/`@forward` 모듈 시스템 지원. `sass` npm 패키지 사용 (NOT `dart-sass`) |
| sass-rem | ^4.0.1 | REM 변환 함수 | 팀 기존 사용중. v4에서 CSS `rem()` 충돌 방지를 위해 `rem-convert` / `rem.convert()` 사용 |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| modern-normalize | ^3.0.1 | CSS Reset/Normalize | 기존 normalize.scss(IE 대응) 대체. 모던 브라우저 대응으로 간결 |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| modern-normalize | 기존 normalize.scss (inCMSv3) | 기존 파일은 IE8/9 대응 포함, 현재 불필요. modern-normalize가 더 경량 |
| sass-rem | 직접 SCSS function 작성 | sass-rem이 edge case 처리 완료, shorthand property 지원 |

**Installation:**
```bash
npm install sass sass-rem modern-normalize
```

**Version verification:** 2026-03-25 npm registry 확인 완료
- sass: 1.98.0 (latest)
- sass-rem: 4.0.1 (latest)
- modern-normalize: 3.0.1 (latest)

## Architecture Patterns

### Recommended Project Structure
```
src/
  scss/
    1-settings/            # 토큰, 변수 (CSS 출력 없음 -- :root 블록 제외)
      _tokens-color.scss   # 색상 토큰 (:root CSS Custom Properties)
      _tokens-typography.scss  # 타이포 토큰
      _tokens-spacing.scss # 간격 토큰
      _tokens-grid.scss    # 그리드 토큰
      _tokens-misc.scss    # border-radius, shadow, transition, z-index
      _breakpoints.scss    # SCSS 변수 (미디어쿼리용, CSS CP 아님)
      _index.scss          # @forward 모음
    2-tools/               # 믹스인, 함수 (CSS 출력 없음)
      _mixins.scss         # 범용 믹스인 (flex-center, ellipsis, etc.)
      _responsive.scss     # respond-to 미디어쿼리 믹스인
      _functions.scss      # 커스텀 함수 (필요시)
      _index.scss
    3-generic/             # Reset, normalize (첫 CSS 출력)
      _normalize.scss      # modern-normalize 기반
      _box-sizing.scss     # *, *::before, *::after box-sizing
      _index.scss
    4-elements/            # 순수 HTML 엘리먼트 스타일
      _base.scss           # html, body 기본 설정
      _headings.scss       # h1-h6
      _links.scss          # a 태그
      _index.scss
    5-objects/             # 구조적 레이아웃 패턴
      _container.scss      # .container max-width + 양쪽 패딩
      _grid.scss           # CSS Grid 기반 12컬럼 시스템
      _index.scss
    6-components/          # BEM 컴포넌트 (Phase 3에서 추가)
      _index.scss
    7-utilities/           # 유틸리티 클래스
      _sr-only.scss        # 스크린리더 전용
      _visibility.scss     # display, overflow 유틸리티
      _index.scss
    _project-overrides.scss  # 프로젝트별 토큰 오버라이드 (:root)
    style.scss             # 메인 엔트리 (@use all layers)
  playground/              # 토큰 플레이그라운드
    index.html             # 토큰 시각화 페이지
```

### Pattern 1: CSS Custom Properties 토큰 정의
**What:** SCSS 파일 내에서 `:root` 블록으로 CSS Custom Properties 토큰을 직접 정의
**When to use:** 모든 토큰 정의 시 (브레이크포인트 제외)
**Example:**
```scss
// src/scss/1-settings/_tokens-color.scss
// 색상 토큰 -- KRDS 기반 시맨틱 + 중립 팔레트

:root {
  // Primary -- 프로젝트별 :root 오버라이드로 변경
  --color-primary: #256ef4;
  --color-primary-light: #6a9df7;
  --color-primary-dark: #083891;

  // Gray scale
  --color-gray-900: #222;
  --color-gray-800: #333;
  --color-gray-700: #555;
  --color-gray-600: #666;
  --color-gray-500: #999;
  --color-gray-400: #b1b8be;
  --color-gray-300: #ccc;
  --color-gray-200: #ddd;
  --color-gray-100: #efefef;
  --color-gray-50: #f8f8f8;

  // Semantic -- KRDS 기준
  --color-danger: #de3412;
  --color-warning: #c78500;
  --color-success: #228738;
  --color-info: #0b78cb;

  // Text
  --color-text: #1e2124;
  --color-text-secondary: #666;
  --color-text-disabled: #999;

  // Background
  --color-bg: #fff;
  --color-bg-secondary: #f8f8f8;

  // Border
  --color-border: #ccc;
  --color-border-light: #efefef;

  // White / Black
  --color-white: #fff;
  --color-black: #000;
}
```

### Pattern 2: SCSS 변수 브레이크포인트 + respond-to 믹스인
**What:** 미디어쿼리에서 CSS Custom Properties를 사용할 수 없으므로 브레이크포인트는 SCSS 변수로 정의
**When to use:** 반응형 스타일 작성 시
**Example:**
```scss
// src/scss/1-settings/_breakpoints.scss
$breakpoint-tablet: 768px;
$breakpoint-pc: 1280px;

// src/scss/2-tools/_responsive.scss
@use '../1-settings/breakpoints' as bp;

// 모바일 퍼스트 기본 -- respond-to(tablet)은 768px 이상
@mixin respond-to($device) {
  @if $device == 'mobile' {
    @media (max-width: #{bp.$breakpoint-tablet - 1px}) {
      @content;
    }
  } @else if $device == 'tablet' {
    @media (min-width: #{bp.$breakpoint-tablet}) and (max-width: #{bp.$breakpoint-pc - 1px}) {
      @content;
    }
  } @else if $device == 'tablet-up' {
    @media (min-width: #{bp.$breakpoint-tablet}) {
      @content;
    }
  } @else if $device == 'pc' {
    @media (min-width: #{bp.$breakpoint-pc}) {
      @content;
    }
  }
}
```

### Pattern 3: @use/@forward 모듈 시스템
**What:** 각 ITCSS 레이어에 `_index.scss`를 두고 `@forward`로 모아서, 메인 파일에서 `@use`로 가져옴
**When to use:** 모든 SCSS 파일 간 의존성 관리
**Example:**
```scss
// src/scss/1-settings/_index.scss
@forward 'tokens-color';
@forward 'tokens-typography';
@forward 'tokens-spacing';
@forward 'tokens-grid';
@forward 'tokens-misc';
@forward 'breakpoints';

// src/scss/2-tools/_index.scss
@forward 'mixins';
@forward 'responsive';
@forward 'functions';

// src/scss/style.scss -- 메인 엔트리 포인트
// ITCSS 레이어 순서: 낮은 specificity -> 높은 specificity

// 1. Settings -- 토큰, 변수
@use '1-settings' as *;

// 2. Tools -- 믹스인, 함수
@use '2-tools' as *;

// 3. Generic -- 리셋, 노멀라이즈
@use '3-generic';

// 4. Elements -- HTML 엘리먼트
@use '4-elements';

// 5. Objects -- 레이아웃 패턴
@use '5-objects';

// 6. Components -- BEM 컴포넌트
@use '6-components';

// 7. Utilities -- 유틸리티 클래스
@use '7-utilities';
```

### Pattern 4: 프로젝트별 토큰 오버라이드
**What:** 프로젝트 시작 시 하나의 파일에서 `:root` 오버라이드로 커스텀 색상 적용
**When to use:** 프로젝트별 Primary 색상 등을 변경할 때
**Example:**
```scss
// src/scss/_project-overrides.scss
// 삼다수 프로젝트 예시
:root {
  --color-primary: #0a7b4f;
  --color-primary-light: #3da87a;
  --color-primary-dark: #065535;
}
```

### Pattern 5: sass-rem @use 사용법 (v4)
**What:** sass-rem v4의 @use 모듈 문법으로 REM 변환 사용
**When to use:** 모든 px 값을 rem으로 변환할 때
**Example:**
```scss
// src/scss/2-tools/_functions.scss
@use 'sass-rem' as rem;

// 사용 예시 (컴포넌트 파일에서)
.btn {
  padding: rem.convert(8px 16px);
  font-size: rem.convert(14px);
}
```

### Anti-Patterns to Avoid
- **`@import` 사용:** deprecated. 반드시 `@use`/`@forward` 사용
- **하드코딩 색상값:** `color: #1886d8` 대신 `color: var(--color-primary)` 사용
- **3단계 이상 SCSS 중첩:** BEM 구조에서 Block > Element > Modifier 최대 3단계
- **vendor prefix 직접 작성:** Autoprefixer가 처리. 믹스인에서도 제거
- **CSS Custom Property를 미디어쿼리 조건에 사용:** `@media (min-width: var(--bp))` 불가능, SCSS 변수 사용

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| REM 변환 함수 | 직접 SCSS function | sass-rem v4 (`rem.convert()`) | shorthand property 파싱, baseline 설정 등 edge case 처리 완료 |
| CSS Reset | 직접 reset.css 작성 | modern-normalize v3 | 모던 브라우저 기준 최적화, 커뮤니티 검증 |
| Bootstrap-style 그리드 | float 기반 그리드 (inCMSv3 _grid.scss) | CSS Grid + 컨테이너 패턴 | float 그리드는 레거시. CSS Grid가 표준이며 더 유연 |

**Key insight:** 기존 프로젝트의 `_grid.scss`(Bootstrap 3 스타일 float 그리드)는 완전히 교체한다. CSS Grid 기반의 간결한 `.container` + 필요 시 grid-template-columns 패턴으로 전환.

## Mixin Modernization Analysis (기존 -> 신규)

기존 inCMSv3 `_mixin.scss`에서 16개 믹스인을 분석한 결과:

| 기존 믹스인 | 판정 | 이유 | 신규 처리 |
|-------------|------|------|-----------|
| `flex` | **현대화** | vendor prefix 불필요, 유용한 센터링 패턴 | `flex-center` -- prefix 제거 |
| `full` | **유지** | 간단하고 유용 | 그대로 유지 |
| `pmz` | **제거** | `margin`/`padding` 직접 쓰는 게 명확 | 토큰으로 대체 |
| `full-position` | **현대화** | `inset: 0`으로 대체 가능 | `inset-0` 또는 제거 |
| `zero` | **제거** | `font-size: 0` 한 줄, 믹스인 불필요 | 삭제 |
| `fsize` | **현대화** | 유용하나 line-height 계산 방식 개선 필요 | `font-size` -- rem 토큰 활용 |
| `border` | **제거** | SCSS border nested property 사용할 필요 없음, 한 줄로 작성 | 삭제 |
| `box-sizing` | **제거** | vendor prefix 불필요, generic 레이어에서 전역 설정 | 삭제 |
| `border-radius` | **제거** | vendor prefix 불필요, 네이티브로 충분 | 토큰으로 대체 |
| `drop-shadow` | **제거** | vendor prefix 불필요 | 토큰으로 대체 |
| `inner-shadow` | **제거** | vendor prefix 불필요, 사용 빈도 매우 낮음 | 삭제 |
| `text-shadow` | **제거** | 한 줄 속성, 믹스인 불필요 | 삭제 |
| `opacity` | **제거** | vendor prefix 불필요 | 삭제 |
| `gradient` / `gradienth` | **제거** | vendor prefix 불필요, 사용 빈도 낮음 | 삭제 |
| `ani` | **현대화** | 유용하나 prefix 제거 필요 | `transition` -- 토큰 활용 |
| `container` | **현대화** | inline-block 대신 현대적 패턴으로 | Objects 레이어 `.container` 클래스로 전환 |
| `blur` | **제거** | vendor prefix 불필요 | 삭제 |
| `ellipsis` | **유지** | 3 속성 묶음으로 여전히 유용 | 그대로 유지 |
| `placeholder` | **현대화** | 레거시 prefix 제거, `::placeholder` 표준만 | 대폭 간소화 |
| `backcover` | **현대화** | background shorthand로 개선 가능 | `bg-cover` -- 간소화 |

**최종 유지/현대화 목록 (2-tools/_mixins.scss):**
1. `flex-center` -- display: flex + align/justify center
2. `full` -- width/height 100%
3. `ellipsis` -- text-overflow 처리
4. `ellipsis-multiline($lines)` -- 다중 줄 말줄임 (신규 추가)
5. `bg-cover` -- background cover 패턴 간소화
6. `placeholder($color)` -- ::placeholder 표준만

**반응형 전용 (2-tools/_responsive.scss):**
1. `respond-to($device)` -- 미디어쿼리 헬퍼 (신규)

## KRDS 색상 Reference

KRDS GitHub 공식 토큰 파일(`resources/css/token/krds_tokens.css`)에서 추출한 색상값:

### Semantic Colors (Light Mode)
| Token | 50 (Base) | 60 (Dark) | 70 (Darker) |
|-------|-----------|-----------|-------------|
| Danger | `#de3412` | `#bd2c0f` | `#8a240f` |
| Warning | `#ffb114` (30) / `#c78500` (40) / `#9e6a00` (50) | - | - |
| Success | `#228738` | `#267337` | `#285d33` |
| Information | `#0b78cb` | `#096ab3` | `#085691` |

### Primary / Secondary
| Token | Value |
|-------|-------|
| Primary 50 | `#256ef4` |
| Primary 60 | `#0b50d0` |
| Primary 70 | `#083891` |

### Key Functional Colors
| Purpose | Value |
|---------|-------|
| Text Basic | `#1e2124` |
| Background | `#ffffff` |
| Border Gray | `#b1b8be` |
| Link Default | `#256ef4` |

**Recommendation:** KRDS Primary(`#256ef4`)를 기본값으로 사용하되, D-01에 따라 프로젝트별 오버라이드를 전제로 설계. Semantic 색상은 50 단계를 기본으로 채택 (danger: `#de3412`, warning: `#c78500`, success: `#228738`, info: `#0b78cb`).

## Design Token Naming Convention (Tailwind 호환)

D-12에 따라 향후 Tailwind 도입 시 config에서 `var()` 참조로 매핑 가능한 네이밍:

```
// Tailwind config 매핑 예시
theme: {
  colors: {
    primary: 'var(--color-primary)',
    danger: 'var(--color-danger)',
    gray: {
      50: 'var(--color-gray-50)',
      100: 'var(--color-gray-100)',
      ...
    }
  },
  spacing: {
    xs: 'var(--spacing-xs)',
    sm: 'var(--spacing-sm)',
    ...
  }
}
```

**네이밍 규칙:**
- `--color-{name}` -- 색상 (color-primary, color-gray-500, color-danger)
- `--font-{property}` -- 타이포 (font-size-base, font-weight-bold, font-family-base)
- `--leading-{name}` -- line-height (leading-tight, leading-base, leading-loose)
- `--spacing-{size}` -- 간격 (spacing-xs, spacing-sm, ..., spacing-3xl)
- `--radius-{size}` -- border-radius (radius-sm, radius-base, radius-lg, radius-full)
- `--shadow-{size}` -- box-shadow (shadow-sm, shadow-base, shadow-lg)
- `--transition-{speed}` -- transition (transition-fast, transition-base, transition-slow)
- `--z-{name}` -- z-index (z-dropdown, z-sticky, z-modal, z-toast)
- `--grid-{property}` -- 그리드 (grid-columns, grid-gutter, grid-margin)

## Recommended Token Values (Claude's Discretion)

### Gray Scale (D-03)
기존 프로젝트 값 + KRDS 참고로 10단계:

| Token | Value | Source | Usage |
|-------|-------|--------|-------|
| `--color-gray-900` | `#222` | 기존 프로젝트 | 본문 텍스트 |
| `--color-gray-800` | `#333` | 기존 프로젝트 | 제목 텍스트 |
| `--color-gray-700` | `#555` | webstyleguide | 부제목 |
| `--color-gray-600` | `#666` | 기존 프로젝트 | 보조 텍스트 |
| `--color-gray-500` | `#999` | 기존 프로젝트 | 비활성, 힌트 |
| `--color-gray-400` | `#b1b8be` | KRDS border-gray | 테두리 |
| `--color-gray-300` | `#ccc` | 기존 프로젝트 | 구분선 |
| `--color-gray-200` | `#ddd` | webstyleguide | 연한 테두리 |
| `--color-gray-100` | `#efefef` | 기존 프로젝트 | 배경 |
| `--color-gray-50` | `#f8f8f8` | 기존 프로젝트 | 연한 배경 |

### Typography Scale
기존 webstyleguide 기반 + 16px 기준:

| Token | Value | rem | Usage |
|-------|-------|-----|-------|
| `--font-size-2xl` | 32px | 2rem | 히어로 제목 |
| `--font-size-xl` | 28px | 1.75rem | H1 |
| `--font-size-lg` | 24px | 1.5rem | H2 |
| `--font-size-md` | 20px | 1.25rem | H3 |
| `--font-size-base` | 16px | 1rem | 본문 기본 |
| `--font-size-sm` | 14px | 0.875rem | 보조 텍스트 |
| `--font-size-xs` | 12px | 0.75rem | 캡션, 주석 |
| `--font-family-base` | 'Pretendard GOV', 'Malgun Gothic', 'apple sd gothic neo', sans-serif | - | 기본 폰트 |
| `--font-weight-regular` | 400 | - | 본문 |
| `--font-weight-medium` | 500 | - | 강조 |
| `--font-weight-semibold` | 600 | - | 부제목 |
| `--font-weight-bold` | 700 | - | 제목 |
| `--leading-tight` | 1.2 | - | 제목용 |
| `--leading-base` | 1.6 | - | 본문용 |
| `--leading-loose` | 1.8 | - | 읽기 편한 블록 |

### Spacing Scale (4px 기반)
| Token | Value | rem |
|-------|-------|-----|
| `--spacing-xs` | 4px | 0.25rem |
| `--spacing-sm` | 8px | 0.5rem |
| `--spacing-md` | 16px | 1rem |
| `--spacing-lg` | 24px | 1.5rem |
| `--spacing-xl` | 32px | 2rem |
| `--spacing-2xl` | 48px | 3rem |
| `--spacing-3xl` | 64px | 4rem |

### Misc Tokens
```scss
// Border Radius
--radius-sm: 4px;
--radius-base: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-full: 9999px;

// Box Shadow
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-base: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05);

// Transition
--transition-fast: 0.15s ease;
--transition-base: 0.3s ease;
--transition-slow: 0.5s ease;

// Z-index
--z-dropdown: 100;
--z-sticky: 200;
--z-fixed: 300;
--z-modal-backdrop: 400;
--z-modal: 500;
--z-toast: 600;
```

### Grid Tokens (D-04~D-07)
```scss
// SCSS 변수 (미디어쿼리 조건용)
$breakpoint-tablet: 768px;
$breakpoint-pc: 1280px;

// CSS Custom Properties (스타일 적용용)
:root {
  --grid-columns: 4;
  --grid-gutter: 16px;
  --grid-margin: 16px;
  --container-max-width: 100%;
}

@media (min-width: 768px) {
  :root {
    --grid-columns: 12;
    --grid-gutter: 24px;
    --grid-margin: 24px;
  }
}

@media (min-width: 1280px) {
  :root {
    --container-max-width: 1200px;
    --grid-margin: 40px;
  }
}
```

## Common Pitfalls

### Pitfall 1: @use 네임스페이스 혼란
**What goes wrong:** `@use` 없이 다른 파일의 변수/믹스인을 참조하면 컴파일 에러 발생
**Why it happens:** `@import`와 달리 `@use`는 명시적 네임스페이스가 필요
**How to avoid:** 각 ITCSS 레이어에 `_index.scss` 파일 생성 후 `@forward`로 모아서 export. 사용 측에서 `@use 'layer' as *`으로 가져오기
**Warning signs:** `Undefined variable`, `Undefined mixin` 컴파일 에러

### Pitfall 2: CSS Custom Properties 미디어쿼리 제한
**What goes wrong:** `@media (min-width: var(--bp-tablet))` 작동하지 않음
**Why it happens:** CSS Custom Properties는 property value에서만 사용 가능, 미디어쿼리 조건에는 사용 불가
**How to avoid:** 브레이크포인트만 SCSS 변수(`$breakpoint-tablet`)로 정의 (D-10)
**Warning signs:** 미디어쿼리가 전혀 적용되지 않는 현상

### Pitfall 3: sass-rem v4 함수명 변경
**What goes wrong:** `rem(16px)` 호출 시 CSS 네이티브 `rem()` 함수(나머지 계산)와 충돌
**Why it happens:** CSS에 `rem()` 수학 함수가 추가됨 (CSS Values Level 4)
**How to avoid:** `@use 'sass-rem' as rem;` 후 `rem.convert(16px)` 사용. 절대 전역 `as *`로 가져오지 않기
**Warning signs:** 예상과 다른 rem 값 출력, CSS rem() 함수와의 충돌 경고

### Pitfall 4: ITCSS 레이어 순서 위반
**What goes wrong:** Utilities가 Components보다 먼저 import되면 specificity 역전 발생
**Why it happens:** ITCSS의 핵심은 "inverted triangle" -- 위에서 아래로 specificity 증가
**How to avoid:** style.scss에서 반드시 1-settings -> 2-tools -> 3-generic -> 4-elements -> 5-objects -> 6-components -> 7-utilities 순서 유지
**Warning signs:** 유틸리티 클래스가 컴포넌트에 의해 덮어쓰여지는 현상

### Pitfall 5: 토큰 플레이그라운드 SCSS 컴파일 의존성
**What goes wrong:** 플레이그라운드 HTML이 컴파일된 CSS를 참조하지 못함
**Why it happens:** Phase 1에서는 빌드 파이프라인(Eleventy)이 아직 없음
**How to avoid:** 플레이그라운드는 단독 실행 가능한 정적 HTML로 작성. 컴파일된 style.css를 상대경로로 직접 참조
**Warning signs:** 플레이그라운드 페이지에서 토큰이 적용되지 않는 현상

## Code Examples

### 완전한 토큰 파일 예시 (색상)
```scss
// src/scss/1-settings/_tokens-color.scss
// 색상 디자인 토큰
// KRDS 기반 시맨틱 + 중립 팔레트 방식

:root {
  // === Primary ===
  // 프로젝트별 _project-overrides.scss에서 오버라이드
  --color-primary: #256ef4;
  --color-primary-light: #6a9df7;
  --color-primary-dark: #083891;

  // === Gray Scale ===
  --color-gray-900: #222;
  --color-gray-800: #333;
  --color-gray-700: #555;
  --color-gray-600: #666;
  --color-gray-500: #999;
  --color-gray-400: #b1b8be;
  --color-gray-300: #ccc;
  --color-gray-200: #ddd;
  --color-gray-100: #efefef;
  --color-gray-50: #f8f8f8;

  // === Semantic (KRDS 기준) ===
  --color-danger: #de3412;
  --color-danger-light: #f2a89a;
  --color-danger-dark: #8a240f;

  --color-warning: #c78500;
  --color-warning-light: #ffb114;
  --color-warning-dark: #9e6a00;

  --color-success: #228738;
  --color-success-light: #6bb87a;
  --color-success-dark: #285d33;

  --color-info: #0b78cb;
  --color-info-light: #5da7e0;
  --color-info-dark: #085691;

  // === Functional ===
  --color-text: var(--color-gray-900);
  --color-text-secondary: var(--color-gray-600);
  --color-text-disabled: var(--color-gray-500);
  --color-bg: #fff;
  --color-bg-secondary: var(--color-gray-50);
  --color-border: var(--color-gray-300);
  --color-border-light: var(--color-gray-100);
  --color-white: #fff;
  --color-black: #000;
  --color-link: var(--color-primary);
}
```

### Container + Grid Object
```scss
// src/scss/5-objects/_container.scss
@use '../2-tools' as *;

.container {
  width: 100%;
  max-width: var(--container-max-width);
  margin-inline: auto;
  padding-inline: var(--grid-margin);
}
```

### 토큰 플레이그라운드 HTML 구조 (간략)
```html
<!-- src/playground/index.html -->
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>디자인 토큰 플레이그라운드</title>
  <link rel="stylesheet" href="../scss/compiled/style.css">
</head>
<body>
  <a href="#main" class="sr-only">본문 바로가기</a>
  <main id="main">
    <h1>디자인 토큰 플레이그라운드</h1>

    <!-- 색상 팔레트 섹션 -->
    <section aria-labelledby="colors-heading">
      <h2 id="colors-heading">색상 (Colors)</h2>
      <!-- Primary, Gray, Semantic 색상 스와치 -->
    </section>

    <!-- 타이포그래피 섹션 -->
    <section aria-labelledby="type-heading">
      <h2 id="type-heading">타이포그래피 (Typography)</h2>
      <!-- 폰트 사이즈 스케일 미리보기 -->
    </section>

    <!-- 간격 섹션 -->
    <section aria-labelledby="spacing-heading">
      <h2 id="spacing-heading">간격 (Spacing)</h2>
      <!-- 간격 시각화 -->
    </section>
  </main>
</body>
</html>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `@import` | `@use`/`@forward` | Sass 2019 (Module system) | `@import` deprecated, 향후 제거 예정 |
| vendor prefix 믹스인 | Autoprefixer | 2015+ | 수동 prefix 불필요, PostCSS가 처리 |
| SCSS 변수 (`$color-main`) | CSS Custom Properties (`var(--color-primary)`) | 2017+ | 런타임 오버라이드 가능, 테마 전환 용이 |
| float 기반 그리드 | CSS Grid / Flexbox | 2017+ | 모든 모던 브라우저 지원 |
| sass-rem `rem()` | sass-rem `rem.convert()` | v4 (2023) | CSS `rem()` 수학함수와 충돌 방지 |
| normalize.css (IE 대응) | modern-normalize (모던 브라우저) | 2020+ | IE 대응 코드 제거, 경량화 |

**Deprecated/outdated:**
- `@import` in Sass: 공식 deprecated, 새 코드에서 사용 금지
- vendor prefix 믹스인: Autoprefixer로 대체, 수동 prefix는 레거시
- Bootstrap 3 float 그리드: CSS Grid가 표준, float 그리드는 레거시

## Open Questions

1. **Pretendard GOV 폰트 파일 포함 방식**
   - What we know: 기존 프로젝트에서 woff/woff2 파일을 `font/` 디렉토리에 직접 포함
   - What's unclear: CDN 사용 vs 로컬 파일 번들 중 어느 방식을 기본으로 할지
   - Recommendation: 공공기관 프로젝트 특성상 외부 CDN 의존 불가한 경우 많으므로, 로컬 파일 기본 + CDN 옵션 문서화. Phase 1에서는 @font-face 토큰만 정의하고 실제 폰트 파일은 프로젝트별 처리로 위임

2. **토큰 플레이그라운드와 Eleventy 문서 사이트 관계**
   - What we know: Phase 5에서 Eleventy 기반 문서 사이트 구축 예정. Phase 1에서는 독립 HTML 플레이그라운드
   - What's unclear: Phase 5에서 플레이그라운드를 Eleventy로 마이그레이션할 것인지
   - Recommendation: Phase 1에서는 정적 HTML로 작성하되, Phase 5에서 Eleventy 페이지로 전환할 수 있도록 시맨틱 마크업 유지

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | npm 패키지 설치, SCSS 컴파일 | Yes | v22.21.1 | -- |
| npm | 패키지 관리 | Yes | 10.9.4 | -- |
| sass (npm) | SCSS 컴파일 | No (설치 필요) | ^1.98.0 | `npm install sass` |
| sass-rem (npm) | REM 변환 | No (설치 필요) | ^4.0.1 | `npm install sass-rem` |

**Missing dependencies with no fallback:**
- 없음 -- 모든 필요 도구가 npm install로 해결 가능

**Missing dependencies with fallback:**
- 없음 -- Node.js/npm 환경 정상 확인

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | SCSS 컴파일 검증 (sass CLI) |
| Config file | none -- Wave 0에서 package.json scripts 설정 |
| Quick run command | `npx sass src/scss/style.scss dist/style.css --no-source-map` |
| Full suite command | `npx sass src/scss/style.scss dist/style.css --style=compressed` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| TOKEN-01 | 색상 토큰이 :root에 정의됨 | compile + grep | `npx sass src/scss/style.scss /dev/stdout \| grep -c 'color-primary'` | No -- Wave 0 |
| TOKEN-02 | 타이포 토큰이 :root에 정의됨 | compile + grep | `npx sass src/scss/style.scss /dev/stdout \| grep -c 'font-size-base'` | No -- Wave 0 |
| TOKEN-03 | 간격 토큰이 :root에 정의됨 | compile + grep | `npx sass src/scss/style.scss /dev/stdout \| grep -c 'spacing-'` | No -- Wave 0 |
| TOKEN-04 | 그리드 토큰 + 반응형 변경 | compile + grep | `npx sass src/scss/style.scss /dev/stdout \| grep -c 'grid-columns'` | No -- Wave 0 |
| TOKEN-05 | 기타 토큰 정의됨 | compile + grep | `npx sass src/scss/style.scss /dev/stdout \| grep -c 'radius-\|shadow-\|transition-\|z-'` | No -- Wave 0 |
| TOKEN-06 | SCSS 파일에서 직접 :root 토큰 정의 (파이프라인 대체) | manual | 파일 구조 확인 | No -- Wave 0 |
| TOKEN-07 | 플레이그라운드 HTML 렌더링 | manual | 브라우저에서 index.html 열기 | No -- Wave 0 |
| SCSS-01 | ITCSS 폴더 구조 존재 | smoke | `ls src/scss/{1-settings,2-tools,3-generic,4-elements,5-objects,6-components,7-utilities}` | No -- Wave 0 |
| SCSS-02 | 믹스인 컴파일 가능 | compile | `npx sass src/scss/style.scss /dev/stdout > /dev/null` | No -- Wave 0 |
| SCSS-03 | respond-to 믹스인 작동 | compile + grep | `echo '@use "src/scss/2-tools" as *; .test { @include respond-to("tablet") { color: red; } }' \| npx sass --stdin` | No -- Wave 0 |
| SCSS-04 | rem.convert() 함수 작동 | compile | sass-rem import 후 컴파일 확인 | No -- Wave 0 |
| SCSS-05 | Normalize CSS 포함됨 | compile + grep | 컴파일 출력에서 normalize 규칙 확인 | No -- Wave 0 |
| SCSS-06 | 파일 구조 가이드 문서 존재 | manual | 문서 파일 확인 | No -- Wave 0 |

### Sampling Rate
- **Per task commit:** `npx sass src/scss/style.scss /dev/stdout > /dev/null` (컴파일 에러 없음 확인)
- **Per wave merge:** 전체 컴파일 + 출력 CSS에서 토큰 존재 확인
- **Phase gate:** 모든 토큰 정의됨 + SCSS 컴파일 성공 + 플레이그라운드 렌더링

### Wave 0 Gaps
- [ ] `package.json` -- sass, sass-rem, modern-normalize 의존성
- [ ] npm scripts -- `build:scss`, `watch:scss` 명령
- [ ] ITCSS 폴더 구조 생성 -- 7개 레이어 디렉토리 + `_index.scss` 파일

## Sources

### Primary (HIGH confidence)
- KRDS GitHub `krds_tokens.css` -- https://github.com/KRDS-uiux/krds-uiux (시맨틱 색상 HEX값 직접 추출)
- KRDS 레이아웃 가이드 -- https://www.krds.go.kr/html/site/style/style_05.html (브레이크포인트, 그리드 수치)
- sass-rem GitHub README -- https://github.com/pierreburel/sass-rem (v4 @use 문법, rem.convert())
- npm registry -- sass 1.98.0, sass-rem 4.0.1, modern-normalize 3.0.1 (버전 확인)
- 기존 프로젝트 소스코드 직접 분석 -- inCMSv3 `_mixin.scss`, `_color.scss`, `_font.scss`, `style.scss`; webstyleguide `style.css`

### Secondary (MEDIUM confidence)
- ITCSS architecture -- https://www.xfive.co/blog/itcss-scalable-maintainable-css-architecture/ (프로젝트 리서치 문서에서 참조)
- Sass @use documentation -- https://sass-lang.com/documentation/at-rules/use/ (모듈 시스템)

### Tertiary (LOW confidence)
- KRDS 색상 가이드 페이지 -- https://www.krds.go.kr/html/site/style/style_02.html (구체 HEX 미표시, 토큰 파일에서 직접 확보)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- npm registry에서 최신 버전 확인, sass-rem @use 호환성 검증 완료
- Architecture: HIGH -- ITCSS 패턴 확립, 기존 코드 구조 분석 완료, @use/@forward 문법 검증
- Pitfalls: HIGH -- sass-rem v4 함수명 변경, CSS CP 미디어쿼리 제한 등 실제 경험 기반 문서화
- Token values: MEDIUM -- KRDS 토큰 파일에서 직접 추출했으나, 그레이 스케일/타이포/간격은 기존 프로젝트 참고한 추천값

**Research date:** 2026-03-25
**Valid until:** 2026-04-25 (안정적 기술 스택, 30일 유효)
