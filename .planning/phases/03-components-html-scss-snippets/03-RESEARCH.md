# Phase 3: Components -- HTML+SCSS Snippets - Research

**Researched:** 2026-03-25
**Domain:** BEM UI components, KRDS accessibility patterns, vanilla JS interactions
**Confidence:** HIGH

## Summary

Phase 3는 8개 핵심 UI 컴포넌트(버튼, 폼, 카드, 테이블, 모달, 탭, 페이지네이션, 브레드크럼)와 HTML 페이지 보일러플레이트를 구현하는 단계이다. Phase 1~2에서 구축된 ITCSS 아키텍처, 디자인 토큰(CSS Custom Properties), BEM 네이밍 규칙, Stylelint 검증 파이프라인 위에 컴포넌트 레이어(6-components)를 채운다.

각 컴포넌트는 KRDS 공공 디자인시스템의 접근성 패턴(role, aria-*, 키보드 상호작용)을 내장하되, 스타일링은 프로젝트 토큰 기반으로 독립적으로 구현한다. 모달과 탭에는 바닐라 JS로 포커스 트랩, ESC 닫기, 키보드 좌우 전환 등 접근성 필수 동작을 포함한다.

모든 컴포넌트는 `src/playground/` 하위에 독립 HTML 미리보기 페이지를 갖고, `src/snippets/`에 AI용 마크다운 스니펫 파일을 제공한다. Phase 5 문서 사이트에서 iframe 임베드, Phase 4에서 pa11y-ci 자동 검증에 직접 활용된다.

**Primary recommendation:** 컴포넌트를 복잡도 순서(정적 먼저: 버튼/브레드크럼/페이지네이션 -> 폼/카드/테이블 -> JS 필요: 모달/탭)로 구현하고, 각 컴포넌트마다 SCSS + playground HTML + snippet MD를 한 세트로 완성한다.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** KRDS 공공 디자인시스템의 접근성 패턴(role, aria)과 마크업 구조를 참조하되, 스타일링은 우리 토큰으로 독자 적용. KRDS 디자인 복사 아님.
- **D-02:** 미니멀 기본 스타일 -- 구조와 레이아웃 중심의 최소한 스타일링. 프로젝트에서 토큰 오버라이드로 커스터마이즈 쉽게.
- **D-03:** 전체 variant 세트 제공 -- 버튼(primary/secondary/outline/text/ghost/link + 3가지 크기 + 비활성), 폼(기본+에러+성공+비활성), 카드(기본+가로+이미지) 등 컴포넌트 라이브러리 수준.
- **D-04:** 상세 반응형 -- 모든 컴포넌트에 모바일/태블릿/PC 각각의 레이아웃 변화 정의. respond-to() 믹스인 활용.
- **D-05:** 바닐라 JS 포함 -- 모달(포커스트랩, ESC닫기), 탭(키보드 좌우 전환), 기타 접근성 필수 JS를 함께 제공.
- **D-06:** aria 속성 완전 내장 -- role, aria-label, aria-expanded, aria-selected, aria-current, tabindex 등 해당 컴포넌트에 필요한 접근성 속성 전부 포함.
- **D-07:** 컴포넌트별 독립 HTML 페이지 -- `src/playground/btn.html`, `src/playground/form.html` 등 각 컴포넌트마다 전용 미리보기 페이지. Phase 5에서 iframe 임베드 가능.
- **D-08:** 렌더링 + 코드 함께 표시 -- 각 variant 아래에 렌더링 결과와 HTML 소스코드를 `<pre><code>`로 함께 표시.
- **D-09:** 컴포넌트별 스니펫 파일 생성 후 CLAUDE.md에서 경로 안내 -- `src/snippets/btn.md` 등 별도 파일. CLAUDE.md에 "컴포넌트 스니펫은 `src/snippets/` 참조"로 안내.
- **D-10:** 스니펫 내용은 HTML 마크업 예제 + variant 목록 + 접근성 주의사항. SCSS는 파일 경로만 안내.

### Claude's Discretion
- 각 컴포넌트의 구체적 variant 세부 목록 (D-03 범위 내)
- 컴포넌트별 반응형 브레이크포인트 동작 세부사항
- 바닐라 JS 구현 방식 (모듈 패턴, 이벤트 위임 등)
- 미리보기 페이지 레이아웃/디자인
- 스니펫 .md 파일 내부 구조

### Deferred Ideas (OUT OF SCOPE)
- Accordion, Alert, Badge, Tooltip, Dropdown 등 추가 컴포넌트 -- v2 EXT-03
- 다크모드 variant -- v2 EXT-01
- Figma 컴포넌트와 코드 클래스명 매핑 -- Phase 6
- 컴포넌트 단위 테스트 -- Phase 4에서 pa11y-ci로 통합 검증
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| COMP-01 | 버튼 컴포넌트 HTML+SCSS (Primary, Secondary, Outline, Text, 크기 변형, 비활성) | KRDS 버튼 패턴(krds-btn 계층), WAI-ARIA button role, BEM `.btn` 블록 구조 |
| COMP-02 | 폼 컴포넌트 HTML+SCSS (Input, Select, Checkbox, Radio, Textarea, 유효성 상태) | KRDS 텍스트 입력 필드 접근성(label 필수, aria-describedby for 에러), BEM `.form` 블록 |
| COMP-03 | 카드 컴포넌트 HTML+SCSS (Header, Body, Footer 구조) | BEM `.card` 블록, 기존 webstyleguide 패턴을 BEM 변환 |
| COMP-04 | 테이블 컴포넌트 HTML+SCSS (기본, 스트라이프, 반응형) | KRDS 표 패턴(caption, scope, 반응형 스크롤), 시맨틱 마크업 |
| COMP-05 | 모달 컴포넌트 HTML+SCSS (오버레이, 포커스 트랩, 닫기) | WAI-ARIA APG dialog-modal 패턴, KRDS 모달 가이드, 바닐라 JS 포커스 트랩 |
| COMP-06 | 탭 컴포넌트 HTML+SCSS (role="tablist", aria-selected, 키보드) | WAI-ARIA APG tabs 패턴, KRDS 탭 가이드(자동 활성화), 바닐라 JS 구현 |
| COMP-07 | 페이지네이션 컴포넌트 HTML+SCSS (이전/다음, 숫자, aria-label) | KRDS 페이지네이션(nav, aria-current, 숫자별 aria-label), BEM `.pagination` |
| COMP-08 | 브레드크럼 컴포넌트 HTML+SCSS (aria-label="breadcrumb", aria-current) | KRDS 브레드크럼(nav, ol/li, 구분자 스크린리더 숨김), BEM `.breadcrumb` |
| COMP-09 | HTML 페이지 보일러플레이트 (lang="ko", viewport, skip-to-content, 시맨틱) | KRDS skip-link 패턴, 기존 playground/index.html 패턴 참고 |
| COMP-10 | 각 컴포넌트에 라이브 미리보기 제공 (코드 옆 렌더링 결과) | playground HTML 페이지 패턴(렌더링 + `<pre><code>` 코드 표시) |
| COMP-11 | 모든 컴포넌트 KRDS 공공 디자인시스템 가이드라인 준수 확인 | 컴포넌트별 KRDS ARIA 패턴 조사 완료, 체크리스트화 |
| AI-02 | 컴포넌트 스니펫이 AI가 복사해서 바로 코드 생성에 활용 가능한 포맷 | `src/snippets/*.md` 파일 구조, CLAUDE.md 경로 안내 |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- **CSS 방법론**: BEM(Block__Element--Modifier) 필수
- **전처리기**: SCSS(dart-sass), `@use`/`@forward` 사용 (`@import` 금지)
- **패키지 매니저**: npm
- **접근성**: KWCAG/WCAG 2.1 AA 이상
- **코딩 스타일**: 2 spaces, single quote, 세미콜론 없음 (SCSS는 세미콜론 사용)
- **주석 언어**: 한국어
- **인라인 스타일 금지**, `!important` 금지
- **CSS Custom Properties(토큰) 우선**, 하드코딩 금지
- **62.5% REM 트릭**: 1rem = 10px
- **ITCSS 레이어**: 컴포넌트는 `src/scss/6-components/`에 배치
- **Stylelint BEM 검증**: `.stylelintrc.json`의 scss/selector-class-pattern + plugin/selector-bem-pattern
- **새 컴포넌트 추가 시**: `_컴포넌트명.scss` 생성 -> `_index.scss`에 `@forward` 추가

## Standard Stack

### Core (이미 설치됨)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| sass (Dart Sass) | ^1.98.0 | SCSS 컴파일 | 팀 표준, `@use`/`@forward` 모듈 시스템 |
| modern-normalize | ^3.0.1 | CSS 리셋 | Phase 1에서 설치 완료 |
| sass-rem | ^4.0.1 | REM 변환 | 팀 표준 유틸리티 |
| stylelint | ^17.5.0 | SCSS 린팅 | BEM 검증 포함 |

### Supporting (Phase 3에서 추가 불필요)
| Library | Purpose | When to Use |
|---------|---------|-------------|
| 없음 | - | Phase 3는 순수 HTML+SCSS+바닐라 JS만 사용. 추가 npm 패키지 불필요 |

**설치 명령:** 추가 패키지 설치 없음. 기존 `npm install`로 충분.

## Architecture Patterns

### 파일 구조
```
src/
  scss/
    6-components/
      _index.scss          # @forward로 모든 컴포넌트 공개
      _btn.scss            # 버튼
      _form.scss           # 폼 요소
      _card.scss           # 카드
      _table.scss          # 테이블
      _modal.scss          # 모달
      _tab.scss            # 탭
      _pagination.scss     # 페이지네이션
      _breadcrumb.scss     # 브레드크럼
    style.scss             # 6-components @use 주석 해제
  playground/
    index.html             # 기존 토큰 플레이그라운드 (수정 불필요)
    btn.html               # 버튼 미리보기
    form.html              # 폼 미리보기
    card.html              # 카드 미리보기
    table.html             # 테이블 미리보기
    modal.html             # 모달 미리보기
    tab.html               # 탭 미리보기
    pagination.html        # 페이지네이션 미리보기
    breadcrumb.html        # 브레드크럼 미리보기
    boilerplate.html       # 페이지 보일러플레이트 데모
  snippets/
    btn.md                 # 버튼 AI 스니펫
    form.md                # 폼 AI 스니펫
    card.md                # 카드 AI 스니펫
    table.md               # 테이블 AI 스니펫
    modal.md               # 모달 AI 스니펫
    tab.md                 # 탭 AI 스니펫
    pagination.md          # 페이지네이션 AI 스니펫
    breadcrumb.md          # 브레드크럼 AI 스니펫
    boilerplate.md         # 보일러플레이트 AI 스니펫
  js/
    modal.js               # 모달 포커스 트랩, ESC 닫기
    tab.js                 # 탭 키보드 전환
```

### Pattern 1: BEM 컴포넌트 SCSS 구조
**What:** 각 컴포넌트 SCSS 파일은 하나의 BEM 블록을 정의. 토큰만 사용, 하드코딩 금지.
**When to use:** 모든 6-components 레이어 파일

```scss
// src/scss/6-components/_btn.scss
// 버튼 컴포넌트
@use '../2-tools/responsive' as resp;

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid transparent;
  border-radius: var(--radius-base);
  font-family: var(--font-family-base);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  line-height: var(--leading-tight);
  text-decoration: none;
  cursor: pointer;
  transition: background-color var(--transition-fast),
              border-color var(--transition-fast),
              color var(--transition-fast);

  // Variants
  &--primary {
    background-color: var(--color-primary);
    color: var(--color-white);

    &:hover:not(:disabled) {
      background-color: var(--color-primary-dark);
    }
  }

  &--secondary {
    background-color: var(--color-gray-100);
    color: var(--color-text);

    &:hover:not(:disabled) {
      background-color: var(--color-gray-200);
    }
  }

  &--outline {
    border-color: var(--color-border);
    background-color: transparent;
    color: var(--color-text);

    &:hover:not(:disabled) {
      background-color: var(--color-bg-secondary);
    }
  }

  // Sizes
  &--sm {
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: var(--font-size-sm);
  }

  &--lg {
    padding: var(--spacing-md) var(--spacing-lg);
    font-size: var(--font-size-md);
  }

  // States
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }
}
```

### Pattern 2: Playground HTML 미리보기 페이지
**What:** 각 컴포넌트별 독립 HTML 페이지. 렌더링 결과 + `<pre><code>` 코드를 함께 표시.
**When to use:** `src/playground/*.html`

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>버튼 컴포넌트 - 미리보기</title>
  <link rel="stylesheet" href="../../dist/css/style.css">
  <!-- playground 전용 스타일은 인라인 <style> 허용 (가이드 문서 전용) -->
  <style>
    /* pg__ 접두사로 playground 전용 레이아웃 */
    .pg { max-width: 1200px; margin: 0 auto; padding: 2.4rem 1.6rem; }
    .pg__section { margin-bottom: 4.8rem; }
    .pg__title { font-size: 2.8rem; font-weight: 700; margin-bottom: 2.4rem; }
    .pg__subtitle { font-size: 2rem; font-weight: 600; margin-bottom: 1.6rem; color: #666; }
    .pg__preview { padding: 2.4rem; border: 1px solid #efefef; border-radius: 8px; margin-bottom: 1.6rem; }
    .pg__code { background: #f8f8f8; padding: 1.6rem; border-radius: 8px; overflow-x: auto; }
    .pg__code code { font-size: 1.4rem; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="pg">
    <h1 class="pg__title">버튼 (Button)</h1>

    <!-- Variant: Primary -->
    <section class="pg__section">
      <h2 class="pg__subtitle">Primary</h2>
      <div class="pg__preview">
        <button type="button" class="btn btn--primary">주요 버튼</button>
      </div>
      <pre class="pg__code"><code>&lt;button type="button" class="btn btn--primary"&gt;주요 버튼&lt;/button&gt;</code></pre>
    </section>
  </div>
</body>
</html>
```

### Pattern 3: AI 스니펫 마크다운 구조
**What:** 컴포넌트별 `.md` 파일. AI가 읽고 변형 코드를 생성할 수 있는 구조화된 포맷.
**When to use:** `src/snippets/*.md`

```markdown
# 버튼 (Button)

## 기본 마크업

\`\`\`html
<button type="button" class="btn btn--primary">버튼 텍스트</button>
\`\`\`

## Variant 목록

| Variant | 클래스 | 용도 |
|---------|--------|------|
| Primary | `.btn--primary` | 주요 동작 (제출, 확인) |
| Secondary | `.btn--secondary` | 보조 동작 |
| Outline | `.btn--outline` | 덜 강조된 동작 |
| Text | `.btn--text` | 최소 강조 |
| Ghost | `.btn--ghost` | 투명 배경 |
| Link | `.btn--link` | 링크 스타일 버튼 |

## 크기

| 크기 | 클래스 | 높이 |
|------|--------|------|
| Small | `.btn--sm` | 32px |
| Medium | (기본) | 40px |
| Large | `.btn--lg` | 48px |

## 접근성 주의사항

- `<button>` 태그 사용 필수. `<a>`나 `<div>` 사용 시 `role="button"` + `tabindex="0"` 필수
- 아이콘만 있는 버튼: `aria-label="동작 설명"` 필수
- 비활성 버튼: `disabled` 속성 사용, `aria-disabled`는 불필요
- 최소 터치 영역: 44px x 44px

## SCSS 파일

`src/scss/6-components/_btn.scss`
```

### Pattern 4: 바닐라 JS 모듈 패턴 (모달/탭)
**What:** 프레임워크 비의존 순수 JS. 이벤트 위임, 초기화 함수 패턴.
**When to use:** `src/js/modal.js`, `src/js/tab.js`

```javascript
// src/js/modal.js
// 모달 포커스 트랩 + ESC 닫기
;(function () {
  'use strict'

  const FOCUSABLE = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

  function openModal(modal, trigger) {
    modal.setAttribute('aria-hidden', 'false')
    modal.style.display = 'flex'
    document.body.style.overflow = 'hidden'
    // 포커스를 모달 내부 첫 번째 포커스 가능 요소로 이동
    const firstFocusable = modal.querySelector(FOCUSABLE)
    if (firstFocusable) firstFocusable.focus()
    modal._trigger = trigger
  }

  function closeModal(modal) {
    modal.setAttribute('aria-hidden', 'true')
    modal.style.display = 'none'
    document.body.style.overflow = ''
    // 트리거 요소로 포커스 복귀
    if (modal._trigger) modal._trigger.focus()
  }

  function trapFocus(modal, e) {
    const focusables = modal.querySelectorAll(FOCUSABLE)
    const first = focusables[0]
    const last = focusables[focusables.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  // 이벤트 위임
  document.addEventListener('click', function (e) {
    const trigger = e.target.closest('[data-modal-open]')
    if (trigger) {
      const modal = document.getElementById(trigger.dataset.modalOpen)
      if (modal) openModal(modal, trigger)
    }
    const close = e.target.closest('[data-modal-close]')
    if (close) {
      const modal = close.closest('.modal')
      if (modal) closeModal(modal)
    }
    // 오버레이 클릭 닫기
    if (e.target.classList.contains('modal__overlay')) {
      const modal = e.target.closest('.modal')
      if (modal) closeModal(modal)
    }
  })

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      const openModal_ = document.querySelector('.modal[aria-hidden="false"]')
      if (openModal_) closeModal(openModal_)
    }
    if (e.key === 'Tab') {
      const openModal_ = document.querySelector('.modal[aria-hidden="false"]')
      if (openModal_) trapFocus(openModal_, e)
    }
  })
})()
```

### Pattern 5: style.scss 6-components 활성화
**What:** Phase 3 시작 시 `style.scss`의 6-components 주석을 해제한다.
**When to use:** 첫 번째 컴포넌트 SCSS 파일 생성 전

```scss
// 변경 전
// @use '6-components' as components; // Phase 3에서 활성화

// 변경 후
@use '6-components' as components;
```

### Anti-Patterns to Avoid
- **element 2단계 중첩 금지:** `.card__header__title` -> `.card__title`로 평탄화
- **시각적 이름 사용 금지:** `.btn--gray` -> `.btn--secondary` (의미적 이름)
- **요소 선택자 의존 금지:** `.card-header h4` -> `.card__title` (BEM 클래스)
- **기존 webstyleguide 네이밍 금지:** `.btn-primary` -> `.btn--primary` (BEM modifier `--`)
- **하드코딩 값 금지:** `color: #222` -> `color: var(--color-gray-900)` (토큰 사용)
- **`@import` 사용 금지:** `@use`/`@forward` 모듈 시스템 사용
- **인라인 스타일 금지:** playground HTML의 `<style>` 태그 내 `pg__` 접두사 클래스만 예외

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| 포커스 트랩 | 수동 포커스 인덱스 관리 | querySelectorAll(FOCUSABLE) + Tab 이벤트 래핑 | focusable 요소 목록이 동적이면 누락 발생 |
| CSS 리셋 | 커스텀 리셋 | modern-normalize (이미 설치) | 브라우저 기본 스타일 차이 해결 |
| 반응형 쿼리 | 직접 @media 작성 | respond-to() 믹스인 (이미 존재) | 브레이크포인트 중앙 관리 |
| REM 변환 | 수동 계산 | 62.5% 트릭 (1rem=10px) + 토큰 값 | 이미 토큰이 rem으로 정의됨 |
| 스크린리더 숨김 | 수동 clip/position | `.sr-only` 유틸리티 (이미 존재) | 표준 패턴, 7-utilities에 정의됨 |

## Common Pitfalls

### Pitfall 1: 기존 네이밍 패턴과 BEM 혼동
**What goes wrong:** webstyleguide의 `.btn-primary`, `.card-header` 패턴을 그대로 사용
**Why it happens:** 기존 프로젝트 코드 참조 시 습관적 적용
**How to avoid:** 반드시 BEM 규칙 적용 -- `.btn--primary`, `.card__header`. Stylelint이 경고 발생시킴
**Warning signs:** `npm run lint:css`에서 "BEM 패턴 위반" 경고

### Pitfall 2: aria-hidden="true"와 display:none 동시 사용 누락
**What goes wrong:** 모달을 숨길 때 `display:none`만 설정하고 `aria-hidden="true"` 미설정
**Why it happens:** 시각적으로 숨겨졌으니 접근성도 처리된 것으로 착각
**How to avoid:** 모달 open/close 시 `aria-hidden` + `display` 항상 동기화
**Warning signs:** 스크린리더에서 숨겨진 모달 콘텐츠가 읽힘

### Pitfall 3: 탭 패널 aria-labelledby/aria-controls ID 불일치
**What goes wrong:** `aria-controls="panel1"`과 실제 패널 `id="tabpanel1"`이 다름
**Why it happens:** ID 네이밍 규칙 없이 각각 별도로 작성
**How to avoid:** 일관된 ID 패턴 사용 -- `tab-{name}-{n}` / `tabpanel-{name}-{n}`
**Warning signs:** 탭 클릭 시 패널 전환 안됨, 스크린리더에서 연결 관계 미인식

### Pitfall 4: 포커스 트랩에서 동적 요소 누락
**What goes wrong:** 모달 내부에 동적으로 추가된 요소(에러 메시지의 링크 등)가 포커스 순서에 포함 안됨
**Why it happens:** 모달 열릴 때 한 번만 focusable 목록을 캐싱
**How to avoid:** Tab/Shift+Tab 이벤트마다 focusable 목록을 다시 조회
**Warning signs:** Tab 키가 예상치 못한 위치로 이동

### Pitfall 5: 브레드크럼 구분자가 스크린리더에 노출
**What goes wrong:** CSS `content: "/"` 또는 텍스트 구분자가 스크린리더에서 읽힘
**Why it happens:** 구분자를 HTML 텍스트로 삽입
**How to avoid:** CSS `::before` pseudo-element + `aria-hidden="true"` 또는 `<li>` 구조 자체로 계층 전달
**Warning signs:** 스크린리더에서 "홈 슬래시 카테고리 슬래시 현재 페이지"로 읽힘

### Pitfall 6: 테이블 반응형에서 caption/scope 누락
**What goes wrong:** 모바일 레이아웃 전환 시 `<caption>`, `<th scope>` 제거
**Why it happens:** 반응형 CSS로 시각적 레이아웃만 변경하고 마크업은 고정
**How to avoid:** HTML 마크업은 항상 시맨틱 유지, CSS로만 시각적 배치 변경
**Warning signs:** 모바일에서 스크린리더가 테이블 구조를 인식 못함

### Pitfall 7: style.scss에 6-components @use 활성화 누락
**What goes wrong:** 컴포넌트 SCSS 작성 후 빌드했는데 CSS에 반영 안됨
**Why it happens:** `style.scss`의 `@use '6-components'` 주석이 해제되지 않음
**How to avoid:** Phase 3 첫 작업으로 주석 해제, `npm run build:css`로 확인
**Warning signs:** dist/css/style.css에 컴포넌트 클래스가 없음

## Code Examples

### 컴포넌트별 ARIA 속성 체크리스트

#### 버튼 (COMP-01)
```html
<!-- 기본 버튼 -->
<button type="button" class="btn btn--primary">확인</button>

<!-- 아이콘 전용 버튼 -->
<button type="button" class="btn btn--ghost" aria-label="닫기">
  <svg aria-hidden="true"><!-- icon --></svg>
</button>

<!-- 링크 스타일 버튼 (a 태그) -->
<a href="/page" class="btn btn--link">링크 이동</a>

<!-- 비활성 버튼 -->
<button type="button" class="btn btn--primary" disabled>비활성</button>
```
Source: KRDS 버튼 https://www.krds.go.kr/html/site/component/component_05_02.html

#### 폼 (COMP-02)
```html
<!-- 텍스트 입력 -->
<div class="form__group">
  <label for="name" class="form__label">이름</label>
  <input type="text" id="name" class="form__input" placeholder="이름을 입력하세요">
</div>

<!-- 에러 상태 -->
<div class="form__group">
  <label for="email" class="form__label">이메일</label>
  <input type="email" id="email" class="form__input form__input--error"
         aria-invalid="true" aria-describedby="email-error">
  <span id="email-error" class="form__message form__message--error" role="alert">
    올바른 이메일 형식을 입력하세요
  </span>
</div>

<!-- 체크박스 -->
<div class="form__group">
  <label class="form__checkbox">
    <input type="checkbox" class="form__checkbox-input">
    <span class="form__checkbox-label">이용약관에 동의합니다</span>
  </label>
</div>

<!-- 셀렉트 -->
<div class="form__group">
  <label for="category" class="form__label">카테고리</label>
  <select id="category" class="form__select">
    <option value="">선택하세요</option>
    <option value="1">옵션 1</option>
  </select>
</div>
```
Source: KRDS 텍스트 입력 필드 https://www.krds.go.kr/html/site/component/component_09_03.html

#### 카드 (COMP-03)
```html
<!-- 기본 카드 -->
<article class="card">
  <div class="card__header">
    <h3 class="card__title">카드 제목</h3>
  </div>
  <div class="card__body">
    <p class="card__text">카드 내용입니다.</p>
  </div>
  <div class="card__footer">
    <button type="button" class="btn btn--primary">액션</button>
  </div>
</article>

<!-- 가로형 카드 -->
<article class="card card--horizontal">
  <div class="card__media">
    <img src="image.jpg" alt="이미지 설명" class="card__image">
  </div>
  <div class="card__content">
    <h3 class="card__title">카드 제목</h3>
    <p class="card__text">카드 내용입니다.</p>
  </div>
</article>
```

#### 테이블 (COMP-04)
```html
<div class="table-wrap">
  <table class="table">
    <caption class="sr-only">사용자 목록 (이름, 이메일, 역할 포함)</caption>
    <thead class="table__head">
      <tr>
        <th scope="col" class="table__th">이름</th>
        <th scope="col" class="table__th">이메일</th>
        <th scope="col" class="table__th">역할</th>
      </tr>
    </thead>
    <tbody class="table__body">
      <tr class="table__row">
        <td class="table__td">홍길동</td>
        <td class="table__td">hong@example.com</td>
        <td class="table__td">관리자</td>
      </tr>
    </tbody>
  </table>
</div>
```
Source: KRDS 표 https://www.krds.go.kr/html/site/component/component_04_11.html

#### 모달 (COMP-05)
```html
<!-- 트리거 -->
<button type="button" class="btn btn--primary" data-modal-open="modal-example">
  모달 열기
</button>

<!-- 모달 -->
<div class="modal" id="modal-example" role="dialog" aria-modal="true"
     aria-labelledby="modal-example-title" aria-hidden="true">
  <div class="modal__overlay"></div>
  <div class="modal__container">
    <div class="modal__header">
      <h2 class="modal__title" id="modal-example-title">모달 제목</h2>
      <button type="button" class="modal__close" data-modal-close
              aria-label="모달 닫기">
        <svg aria-hidden="true"><!-- X icon --></svg>
      </button>
    </div>
    <div class="modal__body">
      <p>모달 내용입니다.</p>
    </div>
    <div class="modal__footer">
      <button type="button" class="btn btn--outline" data-modal-close>취소</button>
      <button type="button" class="btn btn--primary">확인</button>
    </div>
  </div>
</div>
```
Source: WAI-ARIA APG Dialog Modal https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/, KRDS 모달 https://www.krds.go.kr/html/site/component/component_04_05.html

#### 탭 (COMP-06)
```html
<div class="tab">
  <div class="tab__list" role="tablist" aria-label="콘텐츠 탭">
    <button type="button" class="tab__button" id="tab-info"
            role="tab" aria-selected="true" aria-controls="tabpanel-info"
            tabindex="0">
      정보
    </button>
    <button type="button" class="tab__button" id="tab-detail"
            role="tab" aria-selected="false" aria-controls="tabpanel-detail"
            tabindex="-1">
      상세
    </button>
  </div>
  <div class="tab__panel" id="tabpanel-info" role="tabpanel"
       aria-labelledby="tab-info" tabindex="0">
    <p>정보 내용</p>
  </div>
  <div class="tab__panel tab__panel--hidden" id="tabpanel-detail" role="tabpanel"
       aria-labelledby="tab-detail" tabindex="0" hidden>
    <p>상세 내용</p>
  </div>
</div>
```
Source: WAI-ARIA APG Tabs https://www.w3.org/WAI/ARIA/apg/patterns/tabs/, KRDS 탭 https://www.krds.go.kr/html/site/component/component_04_10.html

#### 페이지네이션 (COMP-07)
```html
<nav class="pagination" aria-label="검색 결과 페이지 탐색">
  <ul class="pagination__list">
    <li class="pagination__item">
      <a href="#" class="pagination__link pagination__link--prev" aria-label="이전 페이지">
        <span aria-hidden="true">&lsaquo;</span>
      </a>
    </li>
    <li class="pagination__item">
      <a href="#" class="pagination__link" aria-label="페이지 1" aria-current="page">1</a>
    </li>
    <li class="pagination__item">
      <a href="#" class="pagination__link" aria-label="페이지 2">2</a>
    </li>
    <li class="pagination__item">
      <a href="#" class="pagination__link pagination__link--next" aria-label="다음 페이지">
        <span aria-hidden="true">&rsaquo;</span>
      </a>
    </li>
  </ul>
</nav>
```
Source: KRDS 페이지네이션 https://www.krds.go.kr/html/site/component/component_03_06.html

#### 브레드크럼 (COMP-08)
```html
<nav class="breadcrumb" aria-label="브레드크럼">
  <ol class="breadcrumb__list">
    <li class="breadcrumb__item">
      <a href="/" class="breadcrumb__link">홈</a>
    </li>
    <li class="breadcrumb__item">
      <a href="/category" class="breadcrumb__link">카테고리</a>
    </li>
    <li class="breadcrumb__item">
      <span class="breadcrumb__current" aria-current="page">현재 페이지</span>
    </li>
  </ol>
</nav>
```
Source: KRDS 브레드크럼 https://www.krds.go.kr/html/site/component/component_03_03.html

#### HTML 보일러플레이트 (COMP-09)
```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>페이지 제목</title>
  <link rel="stylesheet" href="path/to/style.css">
</head>
<body>
  <!-- 본문 건너뛰기 링크 -->
  <a href="#main-content" class="skip-to-content">본문 바로가기</a>

  <header class="site-header" role="banner">
    <div class="container">
      <!-- 로고, GNB -->
    </div>
  </header>

  <main id="main-content" class="site-main" role="main">
    <div class="container">
      <!-- 페이지 콘텐츠 -->
    </div>
  </main>

  <footer class="site-footer" role="contentinfo">
    <div class="container">
      <!-- 푸터 -->
    </div>
  </footer>
</body>
</html>
```

### 탭 바닐라 JS 키보드 내비게이션 패턴
```javascript
// src/js/tab.js
// 탭 키보드 내비게이션 (좌우 화살표, Home, End)
;(function () {
  'use strict'

  document.addEventListener('keydown', function (e) {
    const tab = e.target.closest('[role="tab"]')
    if (!tab) return

    const tablist = tab.closest('[role="tablist"]')
    if (!tablist) return

    const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'))
    const index = tabs.indexOf(tab)
    let newIndex = index

    switch (e.key) {
      case 'ArrowLeft':
        newIndex = index > 0 ? index - 1 : tabs.length - 1
        break
      case 'ArrowRight':
        newIndex = index < tabs.length - 1 ? index + 1 : 0
        break
      case 'Home':
        newIndex = 0
        break
      case 'End':
        newIndex = tabs.length - 1
        break
      default:
        return
    }

    e.preventDefault()
    activateTab(tabs[newIndex], tabs, tablist)
  })

  document.addEventListener('click', function (e) {
    const tab = e.target.closest('[role="tab"]')
    if (!tab) return
    const tablist = tab.closest('[role="tablist"]')
    if (!tablist) return
    const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'))
    activateTab(tab, tabs, tablist)
  })

  function activateTab(tab, tabs, tablist) {
    // 모든 탭 비활성화
    tabs.forEach(function (t) {
      t.setAttribute('aria-selected', 'false')
      t.setAttribute('tabindex', '-1')
      var panel = document.getElementById(t.getAttribute('aria-controls'))
      if (panel) panel.hidden = true
    })
    // 선택된 탭 활성화
    tab.setAttribute('aria-selected', 'true')
    tab.setAttribute('tabindex', '0')
    tab.focus()
    var panel = document.getElementById(tab.getAttribute('aria-controls'))
    if (panel) panel.hidden = false
  }
})()
```

## 컴포넌트별 Variant 상세 설계 (Claude's Discretion)

### 버튼 Variants
| Variant | 클래스 | 스타일 특성 |
|---------|--------|------------|
| Primary | `.btn--primary` | 주색 배경, 흰 텍스트 |
| Secondary | `.btn--secondary` | 회색 배경, 기본 텍스트 |
| Outline | `.btn--outline` | 투명 배경, 테두리 |
| Text | `.btn--text` | 배경/테두리 없음, 텍스트만 |
| Ghost | `.btn--ghost` | 투명 배경, hover시 배경 |
| Link | `.btn--link` | 밑줄, 링크 스타일 |
| Small | `.btn--sm` | 32px 높이 |
| Medium | (기본) | 40px 높이 |
| Large | `.btn--lg` | 48px 높이 |
| Disabled | `disabled` 속성 | opacity 0.5, cursor not-allowed |

### 폼 Variants
| Variant | 클래스 | 용도 |
|---------|--------|------|
| 기본 입력 | `.form__input` | 텍스트, 이메일, 비밀번호 등 |
| 에러 상태 | `.form__input--error` | 유효성 검증 실패 |
| 성공 상태 | `.form__input--success` | 유효성 검증 통과 |
| 비활성 | `disabled` 속성 | 입력 불가 |
| 셀렉트 | `.form__select` | 드롭다운 선택 |
| 체크박스 | `.form__checkbox` | 다중 선택 |
| 라디오 | `.form__radio` | 단일 선택 |
| 텍스트영역 | `.form__textarea` | 여러 줄 입력 |

### 카드 Variants
| Variant | 클래스 | 특성 |
|---------|--------|------|
| 기본 | `.card` | 세로형, header/body/footer |
| 가로형 | `.card--horizontal` | 이미지 좌측 + 콘텐츠 우측 |
| 이미지형 | `.card--image` | 상단 이미지 + 콘텐츠 |

### 테이블 Variants
| Variant | 클래스 | 특성 |
|---------|--------|------|
| 기본 | `.table` | 기본 테이블 |
| 스트라이프 | `.table--striped` | 홀짝 행 배경색 |
| 반응형 스크롤 | `.table-wrap` + overflow | 모바일에서 가로 스크롤 |

### 반응형 동작 가이드
| 컴포넌트 | 모바일 (0~767px) | 태블릿 (768~1279px) | PC (1280px~) |
|----------|------------------|--------------------|----|
| 버튼 | width: 100% (풀와이드) | 인라인 배치 | 인라인 배치 |
| 카드 (가로형) | 세로형으로 전환 | 가로 유지 | 가로 유지 |
| 테이블 | 가로 스크롤 또는 수직 전환 | 기본 테이블 | 기본 테이블 |
| 모달 | 풀스크린 | 고정폭 중앙 | 고정폭 중앙 |
| 탭 | 스크롤 가능한 탭 리스트 | 기본 탭 | 기본 탭 |
| 폼 | 풀와이드 입력 | 레이블 좌측 배치 가능 | 레이블 좌측 배치 |

## State of the Art

| Old Approach (webstyleguide) | Current Approach (Phase 3) | Impact |
|------------------------------|---------------------------|--------|
| `.btn-primary` (하이픈) | `.btn--primary` (BEM 더블 하이픈) | Stylelint 자동 검증 가능 |
| `.card-header h4` (요소 선택자) | `.card__title` (BEM 요소) | specificity 충돌 방지 |
| 하드코딩 색상값 | CSS Custom Properties 토큰 | 프로젝트별 오버라이드 가능 |
| `@import` | `@use`/`@forward` | 네임스페이스 격리, 중복 방지 |
| jQuery 의존 JS | 바닐라 JS (IIFE 패턴) | 외부 의존 없음 |
| role/aria 속성 미비 | KRDS+WAI-ARIA APG 기반 완전 내장 | KWCAG AA 준수 |
| px 단위 직접 사용 | 62.5% REM 트릭 + 토큰 | 일관된 스케일, 접근성 향상 |

## Open Questions

1. **playground HTML 내 `<style>` 태그 사용**
   - What we know: CLAUDE.md에서 인라인 스타일 금지. 기존 playground/index.html은 `<style>` 태그 내 `.pg__` 클래스 사용 중
   - What's unclear: playground 전용 레이아웃 스타일을 별도 CSS 파일로 분리할지, `<style>` 태그 유지할지
   - Recommendation: 기존 패턴 유지. playground는 가이드 문서 전용이므로 `<style>` 태그 내 `pg__` 접두사 클래스 허용. "인라인 스타일 금지"는 `style=""` 속성을 의미하며 `<style>` 태그는 별도

2. **보일러플레이트의 skip-to-content 스타일링**
   - What we know: `.sr-only`는 7-utilities에 있음. skip-to-content는 포커스 시 보여야 함
   - What's unclear: `.skip-to-content` 클래스를 어떤 레이어에 둘지
   - Recommendation: `src/scss/7-utilities/_skip-to-content.scss`에 별도 파일로 추가

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Stylelint (SCSS 린팅) + 브라우저 수동 확인 |
| Config file | `.stylelintrc.json` |
| Quick run command | `npm run lint:css` |
| Full suite command | `npm run lint:css && npm run build:css` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| COMP-01~08 | BEM 네이밍 준수 | lint | `npx stylelint "src/scss/6-components/**/*.scss"` | Wave 0 후 생성 |
| COMP-01~08 | CSS 빌드 성공 | build | `npm run build:css` | 기존 |
| COMP-09 | 보일러플레이트 렌더링 | manual | 브라우저 확인 | - |
| COMP-10 | 미리보기 페이지 렌더링 | manual | 브라우저에서 playground/*.html 열기 | - |
| COMP-11 | KRDS 접근성 패턴 | manual | Phase 4에서 pa11y-ci 자동화 예정 | - |
| AI-02 | 스니펫 포맷 검증 | manual | snippets/*.md 파일 존재 확인 | - |

### Sampling Rate
- **Per task commit:** `npm run lint:css && npm run build:css`
- **Per wave merge:** 전체 lint + build + playground HTML 브라우저 수동 확인
- **Phase gate:** 전체 lint clean + 8개 playground 페이지 렌더링 확인

### Wave 0 Gaps
- [ ] `style.scss`의 `@use '6-components'` 주석 해제
- [ ] `src/scss/6-components/_index.scss`에 첫 `@forward` 추가 시 빌드 테스트
- [ ] `src/playground/` 디렉토리에 새 HTML 파일 생성 시 CSS 경로(`../../dist/css/style.css`) 확인
- [ ] `src/snippets/` 디렉토리 생성
- [ ] `src/js/` 디렉토리 생성

## Sources

### Primary (HIGH confidence)
- KRDS 버튼 컴포넌트: https://www.krds.go.kr/html/site/component/component_05_02.html
- KRDS 모달 컴포넌트: https://www.krds.go.kr/html/site/component/component_04_05.html
- KRDS 탭 컴포넌트: https://www.krds.go.kr/html/site/component/component_04_10.html
- KRDS 표 컴포넌트: https://www.krds.go.kr/html/site/component/component_04_11.html
- KRDS 페이지네이션: https://www.krds.go.kr/html/site/component/component_03_06.html
- KRDS 브레드크럼: https://www.krds.go.kr/html/site/component/component_03_03.html
- KRDS 텍스트 입력 필드: https://www.krds.go.kr/html/site/component/component_09_03.html
- WAI-ARIA APG Dialog Modal: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
- WAI-ARIA APG Tabs: https://www.w3.org/WAI/ARIA/apg/patterns/tabs/
- 기존 프로젝트 코드: `src/scss/` (Phase 1~2 산출물), `src/playground/index.html`
- 기존 webstyleguide: `/Users/johyeonchang/Documents/Work/code/gitCode/webstyleguide/`

### Secondary (MEDIUM confidence)
- KRDS 입력 폼 기본 패턴: https://www.krds.go.kr/html/site/global/global_08.html

### Tertiary (LOW confidence)
- 없음

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Phase 1~2에서 이미 설치된 도구만 사용, 추가 패키지 불필요
- Architecture: HIGH - ITCSS 6-components 레이어 구조 확립됨, BEM 규칙 Stylelint 검증됨
- Pitfalls: HIGH - webstyleguide 기존 코드와 KRDS/APG 공식 문서 비교 분석 완료
- 접근성 패턴: HIGH - KRDS 공식 사이트 + WAI-ARIA APG 공식 문서 직접 확인

**Research date:** 2026-03-25
**Valid until:** 2026-04-25 (KRDS/WAI-ARIA APG는 안정적, 30일 유효)
