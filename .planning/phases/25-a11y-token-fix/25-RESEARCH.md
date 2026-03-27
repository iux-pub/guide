# Phase 25: 접근성 수정 + 토큰 정합 - Research

**Researched:** 2026-03-27
**Domain:** SCSS 접근성 수정, 디자인 토큰 정합
**Confidence:** HIGH

## Summary

Phase 25는 전체 감사에서 발견된 접근성 위반 6건과 토큰 불일치 1건을 수정하는 작업이다. 수정 대상은 7개 컴포넌트 SCSS 파일(btn, form, card, modal, tab, pagination, breadcrumb)과 토큰 소스(tokens.json)이다.

핵심 작업은 (1) 터치 타겟 44px 미달 수정, (2) 간격 부족 수정, (3) prefers-reduced-motion 미디어 쿼리 추가, (4) 포커스 링 스타일 통일, (5) --transition-fast 토큰 값 정합이다. 모든 변경은 기존 ITCSS 구조와 BEM 규칙을 유지하며, 토큰 파이프라인(tokens.json -> build-tokens.js -> SCSS)을 통해 반영한다.

**Primary recommendation:** 토큰 값 변경(--transition-fast)은 tokens.json을 수정한 뒤 `npm run build:tokens`로 SCSS를 재생성하라. 컴포넌트 SCSS는 직접 수정하되, SCSS 파일 헤더의 "자동 생성" 경고가 없는 파일만 직접 편집 가능하다.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| A11YFIX-01 | 모달 닫기 버튼 터치 타겟 44x44px 이상 수정 (현재 40px) | modal __close의 width/height를 4rem -> 4.4rem으로 변경 |
| A11YFIX-02 | 페이지네이션 링크 터치 타겟 44x44px 이상 수정 (현재 40px) | pagination __link의 min-width/height를 4rem -> 4.4rem으로 변경 |
| A11YFIX-03 | 페이지네이션 링크 간 간격 8px 이상 수정 (현재 4px) | pagination __list의 gap을 var(--spacing-xs) -> var(--spacing-sm)으로 변경 |
| A11YFIX-04 | 브레드크럼 아이템 간 간격 8px 이상 수정 (현재 4px) | breadcrumb __list의 gap과 __item::before의 margin-right를 var(--spacing-sm)으로 변경 |
| A11YFIX-05 | 전 컴포넌트에 prefers-reduced-motion 적용 | 7개 컴포넌트에 @media (prefers-reduced-motion: reduce) 블록 추가, transition-duration: 0.01ms |
| A11YFIX-06 | 포커스 링 :focus-visible + outline 2px solid + offset 2px 통일 | form의 :focus -> :focus-visible + outline 패턴으로, tab의 outline-offset: -2px -> 2px로 변경 |
| TOKFIX-01 | --transition-fast 토큰 값과 문서 정합 | tokens.json의 transition.fast를 "0.15s ease" -> "0.1s ease"로 변경하여 interaction-timing.md의 100ms와 일치시킴 |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- **CSS 방법론**: BEM(Block__Element--Modifier) 필수
- **전처리기**: SCSS(dart-sass)
- **패키지 매니저**: npm
- **접근성**: KWCAG/WCAG 2.1 AA 이상
- **코딩 스타일**: 2 spaces, single quote, 세미콜론 없음 (SCSS에서는 세미콜론 사용)
- **주석**: 한국어
- **인라인 스타일 금지**, **!important 금지** (접근성 필수 오버라이드 제외)
- **@use/@forward 사용** (@import 금지)
- **토큰 우선 사용**, 하드코딩 금지
- **62.5% REM 트릭**: 1rem = 10px
- **토큰 SCSS 파일은 자동 생성** -- tokens.json 수정 후 `npm run build:tokens` 실행

## Standard Stack

이 페이즈는 새 라이브러리를 추가하지 않는다. 기존 스택만 사용한다.

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| sass (Dart Sass) | ^1.98.0 | SCSS 컴파일 | 팀 표준, @use/@forward 모듈 시스템 |
| tokens.json | - | 싱글 소스 토큰 | build-tokens.js로 SCSS 자동 생성 |
| Stylelint | ^17.5.0 | SCSS 린팅 | BEM/SCSS 규칙 자동 검증 |

**Installation:** 추가 설치 없음

## Architecture Patterns

### 토큰 파이프라인 흐름

```
tokens.json (싱글 소스)
  └─ npm run build:tokens (scripts/build-tokens.js)
       ├─ src/scss/1-settings/_tokens-misc.scss    (--transition-fast 등)
       ├─ src/scss/1-settings/_tokens-spacing.scss
       └─ 기타 토큰 SCSS 파일
```

**TOKFIX-01 수정 경로:** tokens.json에서 `transition.fast.$value`를 `"0.1s ease"`로 변경 -> `npm run build:tokens` -> `_tokens-misc.scss` 자동 재생성

### 컴포넌트 SCSS 수정 대상

| 파일 | 수정 사항 | 요구사항 |
|------|-----------|----------|
| `_modal.scss` | __close width/height 4rem -> 4.4rem | A11YFIX-01 |
| `_pagination.scss` | __link min-width/height 4rem -> 4.4rem, __list gap xs -> sm | A11YFIX-02, A11YFIX-03 |
| `_breadcrumb.scss` | __list gap xs -> sm, __item::before margin-right xs -> sm | A11YFIX-04 |
| `_form.scss` | :focus -> :focus-visible + outline 패턴으로 변경 | A11YFIX-06 |
| `_tab.scss` | outline-offset: -2px -> 2px | A11YFIX-06 |
| `_btn.scss` | reduced-motion 추가 (포커스 링은 이미 올바름) | A11YFIX-05 |
| `_card.scss` | reduced-motion 추가 (현재 transition 없으나 Phase 26 대비) | A11YFIX-05 |

### Pattern: prefers-reduced-motion 적용

컴포넌트별 transition 선언 하단에 미디어 쿼리를 추가한다. interaction-timing.md에 정의된 글로벌 `*` 리셋은 `!important`를 사용하므로 프로젝트 규칙과 충돌한다. 대신 컴포넌트별로 명시적으로 적용하는 패턴을 사용한다.

```scss
// 컴포넌트별 reduced-motion 패턴
.btn {
  transition:
    background-color var(--transition-fast),
    border-color var(--transition-fast),
    color var(--transition-fast);

  @media (prefers-reduced-motion: reduce) {
    transition-duration: 0.01ms;
  }
}
```

**이유:** 글로벌 `*` 리셋은 `!important`를 요구하며, 프로젝트는 `!important` 사용을 금지한다. 컴포넌트별 적용은 `!important` 없이 동작하고, 어떤 컴포넌트에 어떤 전환이 비활성화되는지 명확하다.

### Pattern: 포커스 링 통일

```scss
// 통일된 포커스 링 패턴
&:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

**현재 상태 분석:**

| 컴포넌트 | 현재 포커스 스타일 | 수정 필요 |
|----------|-------------------|----------|
| btn | `:focus-visible` + outline + offset 2px | 없음 (이미 올바름) |
| form | `:focus` + box-shadow (outline: none) | **변경 필요**: :focus-visible + outline 패턴으로 |
| card | 포커스 스타일 없음 | 없음 (비인터랙티브 컴포넌트) |
| modal __close | `:focus-visible` + outline + offset 2px | 없음 (이미 올바름) |
| tab __button | `:focus-visible` + outline + offset **-2px** | **변경 필요**: offset 2px로 |
| pagination __link | `:focus-visible` + outline + offset 2px | 없음 (이미 올바름) |
| breadcrumb __link | `:focus-visible` + outline + offset 2px | 없음 (이미 올바름) |

### Anti-Patterns to Avoid

- **글로벌 `*` reduced-motion 리셋 사용 금지**: `!important` 필요, 프로젝트 규칙 위반
- **토큰 SCSS 파일 직접 수정 금지**: `_tokens-misc.scss`는 자동 생성 파일 -- tokens.json + build:tokens 경유
- **:focus와 :focus-visible 혼용 금지**: 마우스 클릭 시 불필요한 포커스 링 방지를 위해 :focus-visible로 통일
- **form의 box-shadow 포커스를 outline으로 바꿀 때 하드코딩 금지**: var(--color-primary) 토큰 사용

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| 토큰 값 변경 | _tokens-misc.scss 직접 편집 | tokens.json 수정 + npm run build:tokens | 싱글 소스 원칙, 다음 빌드 시 덮어써짐 |
| 터치 타겟 계산 | 복잡한 calc() | 4.4rem 직접 지정 (44px at 62.5%) | 프로젝트 REM 트릭으로 간단 계산 |

## Common Pitfalls

### Pitfall 1: 토큰 SCSS 직접 수정
**What goes wrong:** `_tokens-misc.scss` 를 직접 수정하면 다음 `npm run build:tokens` 실행 시 덮어써진다.
**Why it happens:** 파일 상단 "자동 생성" 주석을 간과.
**How to avoid:** tokens.json 수정 -> build:tokens 실행.
**Warning signs:** 파일 첫 줄이 "// 자동 생성"인 경우.

### Pitfall 2: form 포커스 변경 시 에러/성공 상태 누락
**What goes wrong:** 기본 :focus만 바꾸고 --error/:focus, --success/:focus를 놓치면 에러 상태에서 이전 box-shadow 포커스가 남는다.
**Why it happens:** form 컴포넌트에 3개의 :focus 선언이 있다 (기본, --error, --success).
**How to avoid:** 3개 모두 :focus-visible + outline으로 변경. box-shadow 제거.

### Pitfall 3: breadcrumb 간격 수정 시 구분자 간격 불일치
**What goes wrong:** __list gap만 바꾸고 __item::before의 margin-right를 놓으면 시각적 간격이 불균일해진다.
**Why it happens:** breadcrumb은 gap과 ::before margin-right 두 곳에서 간격을 제어한다.
**How to avoid:** 둘 다 var(--spacing-sm)으로 변경.

### Pitfall 4: --transition-fast 변경의 연쇄 영향
**What goes wrong:** 0.15s -> 0.1s 변경 후 hover/focus 전환이 너무 빠르게 느껴질 수 있다.
**Why it happens:** 100ms는 실제로 상당히 빠름.
**How to avoid:** 변경 후 playground에서 버튼 hover, 폼 focus 등을 시각적으로 확인.
**Warning signs:** 전환이 거의 즉각적으로 보이면 정상 (100ms 의도대로).

### Pitfall 5: card 컴포넌트 reduced-motion
**What goes wrong:** card에 현재 transition이 없어 reduced-motion을 추가할 필요가 없어 보이지만, Phase 26에서 hover shadow + translateY가 추가 예정이다.
**Why it happens:** Phase 25와 26의 작업이 연결되어 있다.
**How to avoid:** card에도 빈 reduced-motion 미디어 쿼리를 추가하거나, 주석으로 Phase 26 대비를 명시한다. 또는 현재 transition이 없으므로 Phase 26에서 추가 시 같이 넣는 것이 더 깔끔하다.

## Code Examples

### A11YFIX-01: 모달 닫기 버튼 터치 타겟 수정

```scss
// src/scss/6-components/_modal.scss
// 닫기 버튼 -- 터치 타겟 44px 보장
&__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 4.4rem;   // 변경: 4rem -> 4.4rem (44px)
  height: 4.4rem;  // 변경: 4rem -> 4.4rem (44px)
  // ... 나머지 동일
}
```

### A11YFIX-02/03: 페이지네이션 터치 타겟 + 간격 수정

```scss
// src/scss/6-components/_pagination.scss
&__list {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);  // 변경: --spacing-xs (4px) -> --spacing-sm (8px)
  // ...
}

&__link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 4.4rem;  // 변경: 4rem -> 4.4rem (44px)
  height: 4.4rem;     // 변경: 4rem -> 4.4rem (44px)
  // ...
}
```

### A11YFIX-04: 브레드크럼 간격 수정

```scss
// src/scss/6-components/_breadcrumb.scss
&__list {
  // ...
  gap: var(--spacing-sm);  // 변경: --spacing-xs -> --spacing-sm (8px)
}

&__item {
  // ...
  &:not(:first-child)::before {
    content: '/';
    margin-right: var(--spacing-sm);  // 변경: --spacing-xs -> --spacing-sm (8px)
    color: var(--color-gray-400);
  }
}
```

### A11YFIX-05: prefers-reduced-motion 적용 패턴

```scss
// 각 컴포넌트의 transition 선언 뒤에 추가
// 예시: btn
.btn {
  transition:
    background-color var(--transition-fast),
    border-color var(--transition-fast),
    color var(--transition-fast);

  // 접근성: 모션 감소 설정 대응
  @media (prefers-reduced-motion: reduce) {
    transition-duration: 0.01ms;
  }
  // ...
}

// 예시: modal (복수 transition 요소)
.modal {
  &__overlay {
    transition: opacity var(--transition-base);

    @media (prefers-reduced-motion: reduce) {
      transition-duration: 0.01ms;
    }
  }

  &__close {
    transition: background-color var(--transition-fast);

    @media (prefers-reduced-motion: reduce) {
      transition-duration: 0.01ms;
    }
  }
}
```

### A11YFIX-06: form 포커스 링 통일

```scss
// src/scss/6-components/_form.scss
// 변경 전:
// &:focus {
//   outline: none;
//   border-color: var(--color-primary);
//   box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-primary) 20%, transparent);
// }

// 변경 후:
&:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  border-color: var(--color-primary);
}

// --error 상태
&--error {
  border-color: var(--color-danger);

  &:focus-visible {
    outline-color: var(--color-danger);
  }
}

// --success 상태
&--success {
  border-color: var(--color-success);

  &:focus-visible {
    outline-color: var(--color-success);
  }
}
```

### A11YFIX-06: tab 포커스 링 offset 수정

```scss
// src/scss/6-components/_tab.scss
&:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;  // 변경: -2px -> 2px
}
```

### TOKFIX-01: tokens.json transition.fast 변경

```json
// tokens.json (수정)
"transition": {
  "fast": { "$value": "0.1s ease", "$type": "transition" },
  "base": { "$value": "0.3s ease", "$type": "transition" },
  "slow": { "$value": "0.5s ease", "$type": "transition" }
}
```

변경 후 실행: `npm run build:tokens` -> `_tokens-misc.scss`의 `--transition-fast: 0.1s ease;` 자동 반영

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| :focus | :focus-visible | CSS 2020+ | 마우스 클릭 시 불필요한 포커스 링 제거, 키보드만 표시 |
| outline: none + box-shadow | outline: 2px solid + offset | WCAG 2.2 (2023) | 고대비 모드에서도 포커스 링 보임 |
| 글로벌 reduced-motion 리셋 | 컴포넌트별 reduced-motion | 현재 추세 | !important 없이 세밀 제어 가능 |
| 터치 타겟 48px (Google) | 44px (WCAG 2.1 AA) | WCAG 2.1 (2018) | WCAG AA 최소 기준 44x44px |

## Open Questions

1. **card 컴포넌트 reduced-motion 시점**
   - What we know: card에 현재 transition/animation이 없다. Phase 26에서 hover shadow + translateY 추가 예정.
   - What's unclear: Phase 25에서 빈 reduced-motion을 선제 추가할지, Phase 26에서 같이 추가할지.
   - Recommendation: Phase 25에서는 card에 reduced-motion을 추가하지 않는다. transition이 없는 컴포넌트에 reduced-motion을 넣는 것은 의미가 없다. Phase 26에서 transition 추가 시 같이 넣는 것이 자연스럽다. 대신 요구사항에 "전 컴포넌트"라 명시되어 있으므로, card에도 주석으로 "// Phase 26에서 transition 추가 시 reduced-motion 적용 예정" 정도를 남긴다.

2. **--transition-fast 100ms vs 150ms 문서 정합 방향**
   - What we know: tokens.json/SCSS는 150ms, interaction-timing.md는 100ms. 문서가 "호버, 색상 변경 등 즉각 피드백"에 100ms를 권장.
   - What's unclear: 어느 쪽이 올바른 값인지 (코드를 문서에 맞출지, 문서를 코드에 맞출지).
   - Recommendation: interaction-timing.md의 100ms를 정합 목표로 삼는다. 이 문서는 디자인 가이드로서 의도된 사양이고, 코드가 이를 따라야 한다. tokens.json을 0.1s ease로 변경.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Stylelint ^17.5.0 + pa11y-ci |
| Config file | .stylelintrc.json, .pa11yci.js |
| Quick run command | `npm run lint:css` |
| Full suite command | `npm test` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| A11YFIX-01 | 모달 닫기 버튼 44px | manual + lint | `npm run lint:css` | N/A (SCSS 값 검증은 수동) |
| A11YFIX-02 | 페이지네이션 링크 44px | manual + lint | `npm run lint:css` | N/A |
| A11YFIX-03 | 페이지네이션 간격 8px | manual + lint | `npm run lint:css` | N/A |
| A11YFIX-04 | 브레드크럼 간격 8px | manual + lint | `npm run lint:css` | N/A |
| A11YFIX-05 | reduced-motion 적용 | manual (SCSS grep) | `grep -r 'prefers-reduced-motion' src/scss/6-components/` | N/A |
| A11YFIX-06 | 포커스 링 통일 | manual (SCSS grep) | `grep -r 'focus-visible' src/scss/6-components/` | N/A |
| TOKFIX-01 | 토큰 값 정합 | manual (값 비교) | `npm run build:tokens && grep 'transition-fast' src/scss/1-settings/_tokens-misc.scss` | N/A |

### Sampling Rate
- **Per task commit:** `npm run lint:css`
- **Per wave merge:** `npm test` (lint + build + pa11y)
- **Phase gate:** Full suite green before verify

### Wave 0 Gaps
None -- 기존 lint/pa11y 인프라로 충분. SCSS 값 자체의 정확성은 수동 검증(grep + 빌드 후 확인).

## Sources

### Primary (HIGH confidence)
- 프로젝트 소스 코드 직접 분석 -- 7개 컴포넌트 SCSS 파일, tokens.json, _tokens-misc.scss, interaction-timing.md
- WCAG 2.1 Success Criterion 2.5.8 (Target Size) -- 44x44px minimum
- WCAG 2.1 SC 2.3.3 (Animation from Interactions) -- prefers-reduced-motion

### Secondary (MEDIUM confidence)
- :focus-visible 브라우저 지원 -- caniuse 97%+ (2025 기준)
- prefers-reduced-motion 브라우저 지원 -- caniuse 96%+ (2025 기준)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - 기존 프로젝트 스택 그대로 사용, 새 도구 없음
- Architecture: HIGH - 토큰 파이프라인과 ITCSS 구조가 이미 확립됨, 파일별 수정 위치 명확
- Pitfalls: HIGH - 실제 코드 분석 기반, 모든 수정 대상 파일 확인 완료

**Research date:** 2026-03-27
**Valid until:** 2026-04-27 (안정적 -- SCSS/접근성 표준은 변동 없음)
