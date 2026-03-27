---
phase: 25-a11y-token-fix
verified: 2026-03-27T09:00:00Z
status: gaps_found
score: 6/7 must-haves verified
re_verification: false
gaps:
  - truth: "REQUIREMENTS.md에서 A11YFIX-05, A11YFIX-06 상태가 Complete로 갱신되어야 한다"
    status: partial
    reason: "코드 구현은 완료되었으나 REQUIREMENTS.md 추적 테이블이 두 요건을 여전히 Pending으로 표기 중"
    artifacts:
      - path: ".planning/REQUIREMENTS.md"
        issue: "A11YFIX-05 (line 245, 450): '- [ ]' + 'Pending' — 실제 코드는 7개 파일에 구현 완료"
      - path: ".planning/REQUIREMENTS.md"
        issue: "A11YFIX-06 (line 246, 451): '- [ ]' + 'Pending' — 실제 코드는 form/tab/btn 등에 구현 완료"
    missing:
      - "REQUIREMENTS.md line 245: '- [ ] **A11YFIX-05**' -> '- [x] **A11YFIX-05**'"
      - "REQUIREMENTS.md line 246: '- [ ] **A11YFIX-06**' -> '- [x] **A11YFIX-06**'"
      - "REQUIREMENTS.md line 450: 'Pending' -> 'Complete'"
      - "REQUIREMENTS.md line 451: 'Pending' -> 'Complete'"
human_verification:
  - test: "form 포커스 링 시각 확인"
    expected: "입력 필드에 키보드 포커스 시 2px solid 파란 outline이 표시되고, 마우스 클릭 포커스 시에는 outline이 나타나지 않는다 (:focus-visible 동작)"
    why_human: "브라우저에서 :focus vs :focus-visible 동작 차이는 코드 검사로 확인 불가, 실제 탭 키 입력 테스트 필요"
  - test: "prefers-reduced-motion 동작 확인"
    expected: "macOS 손쉬운 사용 > 모션 줄이기 활성 시 버튼 hover, 모달 overlay 전환이 즉시(0.01ms) 처리된다"
    why_human: "OS 설정 변경 + 브라우저 렌더링 확인 필요"
---

# Phase 25: 접근성 수정 + 토큰 정합 검증 보고서

**Phase Goal:** 컴포넌트 SCSS의 접근성 미달 항목(터치 타겟, 간격, reduced-motion, 포커스 링)이 수정되고, 토큰 값과 문서 간 불일치가 해소된다
**Verified:** 2026-03-27T09:00:00Z
**Status:** gaps_found — 코드 구현은 완전하나 REQUIREMENTS.md 상태 추적이 미갱신
**Re-verification:** No — 초기 검증

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | 모달 닫기 버튼의 터치 타겟이 44x44px(4.4rem) 이상이다 | VERIFIED | `_modal.scss` L80-81: `width: 4.4rem; height: 4.4rem;` |
| 2 | 페이지네이션 링크의 터치 타겟이 44x44px(4.4rem) 이상이다 | VERIFIED | `_pagination.scss` L39-40: `min-width: 4.4rem; height: 4.4rem;` |
| 3 | 페이지네이션 링크 간 간격이 8px(var(--spacing-sm)) 이상이다 | VERIFIED | `_pagination.scss` L16: `gap: var(--spacing-sm);` |
| 4 | 브레드크럼 아이템 간 간격이 8px 이상이다 | VERIFIED | `_breadcrumb.scss` L19: `gap: var(--spacing-sm);`, L32: `margin-right: var(--spacing-sm);` (2곳 모두) |
| 5 | 7개 컴포넌트에 prefers-reduced-motion: reduce 미디어 쿼리가 있어 transition이 비활성화된다 | VERIFIED | btn/form/card/modal/tab/pagination/breadcrumb 전체 7개 파일 확인 완료 |
| 6 | form 포커스 스타일이 :focus-visible + outline: 2px solid + outline-offset: 2px이다 | VERIFIED | `_form.scss` L53-57(기본), L69-72(error), L79-82(success) — 3곳 모두. box-shadow/outline:none 잔존 없음 |
| 7 | --transition-fast 토큰 값이 SCSS와 문서 간 일치한다 | VERIFIED | `tokens.json` L97: `"0.1s ease"`, `_tokens-misc.scss` L17: `--transition-fast: 0.1s ease;`, `interaction-timing.md` L12: `duration/fast = 100ms` (0.1s = 100ms) 일치 |

**Score:** 7/7 truths verified (코드 구현 기준)

> **주의:** REQUIREMENTS.md 상태 추적 테이블의 A11YFIX-05, A11YFIX-06이 여전히 Pending으로 표기되어 있어 status: gaps_found로 분류. 코드 품질 자체는 모든 truths를 만족함.

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `tokens.json` | transition.fast = "0.1s ease" | VERIFIED | L97: `"fast": { "$value": "0.1s ease", "$type": "transition" }` |
| `src/scss/1-settings/_tokens-misc.scss` | --transition-fast: 0.1s ease | VERIFIED | L17: `--transition-fast: 0.1s ease;` (자동 생성 확인) |
| `src/scss/6-components/_modal.scss` | 닫기 버튼 4.4rem + reduced-motion | VERIFIED | L80-81: 4.4rem, L31-33: overlay reduced-motion, L90-92: close reduced-motion |
| `src/scss/6-components/_pagination.scss` | 링크 4.4rem + gap spacing-sm + reduced-motion | VERIFIED | L39-40: 4.4rem, L16: gap spacing-sm, L52-54: reduced-motion |
| `src/scss/6-components/_breadcrumb.scss` | gap spacing-sm + ::before margin-right spacing-sm + reduced-motion | VERIFIED | L19: gap, L32: margin-right, L54-56: reduced-motion |
| `src/scss/6-components/_btn.scss` | reduced-motion | VERIFIED | L26-28: `@media (prefers-reduced-motion: reduce)` |
| `src/scss/6-components/_form.scss` | :focus-visible 3곳 + outline-offset: 2px 3곳 + reduced-motion | VERIFIED | L53/69/79: focus-visible, L55/71/81: outline-offset 2px, L45-47: reduced-motion |
| `src/scss/6-components/_card.scss` | prefers-reduced-motion (선제 적용) | VERIFIED | L10-12: 실제 `@media` 블록 (TODO 주석이 아닌 실제 코드) |
| `src/scss/6-components/_tab.scss` | outline-offset: 2px (기존 -2px에서 변경) + reduced-motion | VERIFIED | L45: `outline-offset: 2px;`, L35-37: reduced-motion |
| `.planning/REQUIREMENTS.md` | A11YFIX-05, A11YFIX-06 Complete로 갱신 | FAILED | L245/246: `- [ ]` (미체크), L450/451: `Pending` (미갱신) |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `tokens.json` | `_tokens-misc.scss` | `npm run build:tokens` | VERIFIED | 토큰 빌드 후 `--transition-fast: 0.1s ease` 자동 반영 확인 (`git log: 24a2ba7`) |
| `_form.scss` | 포커스 링 통일 패턴 | `:focus-visible + outline` | VERIFIED | L53-57: `:focus-visible { outline: 2px solid ...; outline-offset: 2px; }` |
| `_tab.scss` | 포커스 링 통일 패턴 | `outline-offset: 2px` | VERIFIED | L45: `outline-offset: 2px;` (기존 -2px에서 변경됨, L43-45 전체 확인) |

---

### Data-Flow Trace (Level 4)

해당 없음 — 이 페이즈는 SCSS 스타일 값 수정 및 미디어 쿼리 추가이며, 동적 데이터를 렌더링하는 컴포넌트 로직이 아님.

---

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| 7개 파일 모두 prefers-reduced-motion 포함 | `grep -rl 'prefers-reduced-motion' src/scss/6-components/ \| wc -l` | 7 | PASS |
| form focus-visible 3곳 이상 | `grep -c 'focus-visible' src/scss/6-components/_form.scss` | 4 (주석 1 + 코드 3) | PASS |
| form box-shadow 포커스 제거 | `grep 'box-shadow' src/scss/6-components/_form.scss` | 0행 출력 | PASS |
| form outline: none 제거 | `grep 'outline: none' src/scss/6-components/_form.scss` | 0행 출력 | PASS |
| tab outline-offset: 2px (기존 -2px 제거) | `grep 'outline-offset' src/scss/6-components/_tab.scss` | `outline-offset: 2px;` 1행 | PASS |
| card 실제 @media 블록 (TODO 아님) | `grep 'prefers-reduced-motion' src/scss/6-components/_card.scss` | 실제 `@media` 행 | PASS |
| tokens.json transition.fast 값 | `grep '"fast"' tokens.json` | `"0.1s ease"` | PASS |
| SCSS 토큰 반영 | `grep 'transition-fast' src/scss/1-settings/_tokens-misc.scss` | `--transition-fast: 0.1s ease;` | PASS |
| breadcrumb spacing-xs 잔존 없음 | `grep 'spacing-xs' src/scss/6-components/_breadcrumb.scss` | 0행 출력 | PASS |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| A11YFIX-01 | 25-01-PLAN | 모달 닫기 버튼 터치 타겟 44px | SATISFIED | `_modal.scss` L80-81: 4.4rem |
| A11YFIX-02 | 25-01-PLAN | 페이지네이션 링크 터치 타겟 44px | SATISFIED | `_pagination.scss` L39-40: 4.4rem |
| A11YFIX-03 | 25-01-PLAN | 페이지네이션 링크 간격 8px | SATISFIED | `_pagination.scss` L16: spacing-sm |
| A11YFIX-04 | 25-01-PLAN | 브레드크럼 아이템 간격 8px | SATISFIED | `_breadcrumb.scss` L19+L32: spacing-sm 2곳 |
| A11YFIX-05 | 25-02-PLAN | 7개 컴포넌트 prefers-reduced-motion 적용 | SATISFIED (코드) / STALE (문서) | 7개 파일 구현 완료. REQUIREMENTS.md L450 Pending 미갱신 |
| A11YFIX-06 | 25-02-PLAN | 포커스 링 :focus-visible + outline 통일 | SATISFIED (코드) / STALE (문서) | form 3곳, tab outline-offset 2px 구현 완료. REQUIREMENTS.md L451 Pending 미갱신 |
| TOKFIX-01 | 25-01-PLAN | --transition-fast 토큰-문서 정합 | SATISFIED | tokens.json + _tokens-misc.scss + interaction-timing.md 모두 100ms/0.1s |

**미선언 요건 확인:** REQUIREMENTS.md에서 Phase 25로 매핑된 요건은 총 7개 (A11YFIX-01~06, TOKFIX-01). 두 PLAN 파일의 `requirements` 필드가 7개 모두를 포함하고 있어 고아 요건 없음.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `.planning/REQUIREMENTS.md` | 245, 246 | `- [ ]` (미체크 체크박스) — 구현 완료된 요건 | Warning | 프로젝트 추적 시스템이 현실과 불일치. 다음 Phase 계획 시 혼선 가능 |
| `.planning/REQUIREMENTS.md` | 450, 451 | `Pending` — 구현 완료 요건을 Pending으로 표기 | Warning | 동일 원인 |

> 코드 파일에서 TODO/FIXME/placeholder/빈 구현 등 블로커 안티패턴은 발견되지 않음.

---

### Human Verification Required

#### 1. form 포커스 링 :focus-visible 동작 확인

**Test:** Chrome/Firefox에서 form 컴포넌트 playground(`src/playground/form.html`) 접속 후, 입력 필드에 탭 키로 포커스 이동
**Expected:** 2px solid 파란 outline이 나타남. 마우스 클릭 포커스 시에는 outline이 표시되지 않음
**Why human:** `:focus-visible`의 키보드/마우스 구분 동작은 브라우저 렌더링으로만 확인 가능

#### 2. prefers-reduced-motion 실제 동작 확인

**Test:** macOS 손쉬운 사용 > 모션 줄이기 활성화 상태에서 버튼 hover, 모달 열기/닫기 동작
**Expected:** 모든 transition이 즉시 처리됨 (0.01ms), 시각적 전환 애니메이션이 없음
**Why human:** OS 시스템 설정 변경 + 브라우저 DevTools 확인 필요

---

### Gaps Summary

코드 구현은 Phase 25의 모든 7개 요건(A11YFIX-01~06, TOKFIX-01)을 완전히 충족한다. 유일한 갭은 `.planning/REQUIREMENTS.md`의 상태 추적 테이블이 Plan 02 실행 완료 후에도 A11YFIX-05와 A11YFIX-06을 Pending으로 남긴 것이다.

**수정 범위:** REQUIREMENTS.md 4행 텍스트 변경 (코드 수정 불필요)
- Line 245: `- [ ]` → `- [x]`
- Line 246: `- [ ]` → `- [x]`
- Line 450: `Pending` → `Complete`
- Line 451: `Pending` → `Complete`

---

_Verified: 2026-03-27T09:00:00Z_
_Verifier: Claude (gsd-verifier)_
