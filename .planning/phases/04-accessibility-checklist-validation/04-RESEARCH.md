# Phase 4: Accessibility -- Checklist + Validation - Research

**Researched:** 2026-03-25
**Domain:** KWCAG/WCAG 2.1 AA 접근성 체크리스트, pa11y-ci 자동 검증, 컴포넌트 접근성 가이드, 색상 대비
**Confidence:** HIGH

## Summary

Phase 4는 Phase 3에서 완성된 8개 컴포넌트의 접근성을 검증하고, 향후 프로젝트에서 참조할 접근성 문서 체계를 확립하는 단계다. 핵심 산출물은 (1) KWCAG 2.2 기반 퍼블리싱 체크리스트 (마크다운 + HTML), (2) pa11y-ci 자동 검증 파이프라인, (3) 컴포넌트별 접근성 패턴 가이드, (4) 색상 대비 가이드이다.

pa11y-ci 4.1.0은 Puppeteer 24 기반으로 로컬 HTML 파일을 file:// 프로토콜로 직접 테스트할 수 있다. 별도 서버 없이 playground HTML 9개를 즉시 검증 가능하다. KWCAG 2.2는 기존 24개에서 33개 검사항목으로 확대되었으며, 2026년까지 전자정부 웹사이트 의무 적용이므로 공공기관 납품 시 필수 요건이다.

**Primary recommendation:** pa11y-ci로 playground 9개 HTML을 WCAG2AA 기준 자동 검증하고, KWCAG 2.2 33개 검사항목을 컴포넌트별로 매핑한 실무 체크리스트를 마크다운 + HTML 두 포맷으로 제공한다.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** 마크다운 + HTML 인터랙티브 체크리스트 두 가지 모두 제공. 마크다운(docs/accessibility/checklist.md)은 AI/문서용, HTML(src/playground/a11y-checklist.html)은 실무 체크용.
- **D-02:** 컴포넌트별 분류 기준 -- WCAG 4원칙이 아닌 버튼/폼/카드/테이블/모달/탭/페이지네이션/브레드크럼 + 공통 항목으로 분류. Phase 3 컴포넌트 구조와 1:1 대응.
- **D-03:** KWCAG 2.2 확대 33개 검사항목을 포함하되, 컴포넌트별로 해당하는 항목만 매핑하여 실무 중심으로 구성.
- **D-04:** .pa11yci.json 설정 파일 제공 -- playground 9개 HTML 전체를 WCAG 2.1 AA 수준으로 검사. 향후 Phase 5 문서 사이트 URL 추가 가능한 확장 구조.
- **D-05:** npm run test:a11y 스크립트로 실행. 터미널 결과 요약 + reports/a11y-report.json 저장. CI 통합 가능한 구조.
- **D-06:** pa11y-ci + @axe-core/cli 설치 필요 (package.json devDependencies 추가).
- **D-07:** docs/accessibility/ 폴더에 컴포넌트별 독립 문서 제공 (docs/accessibility/btn.md, form.md 등). Phase 5 문서 사이트에서 임포트.
- **D-08:** 실무 충분 수준 -- 필수 ARIA 속성 표 + 키보드 상호작용 목록 + do/don't 예시 + 스크린리더 테스트 노트. Phase 3 스니펫(src/snippets/*.md)과 상호 보완 (중복 최소화).
- **D-09:** 상세 가이드 -- 프로젝트 토큰별 전경/배경 조합 대비 표(PASS/FAIL) + 온라인 도구 안내(WebAIM, APCA) + 색상 선택 원칙 + 대비 실패 시 대안 색상 제안 방법.
- **D-10:** docs/accessibility/color-contrast.md에 위치. 토큰 값은 Phase 1 src/scss/1-settings/_tokens-color.scss 기준.

### Claude's Discretion
- KWCAG 2.2 33개 항목과 컴포넌트의 구체적 매핑 관계
- HTML 체크리스트 페이지의 인터랙션 방식 (체크박스, 진행률 표시 등)
- pa11y-ci 설정 세부 옵션 (timeout, viewport, ignore rules 등)
- 스크린리더 테스트 노트의 구체적 내용
- 대안 색상 제안의 구체적 방법론

### Deferred Ideas (OUT OF SCOPE)
- Lighthouse CI 통합 -- pa11y-ci로 충분, 추가 시 Phase 5 CI 설정에서 고려
- 자동 색상 대비 체크 스크립트 -- 향후 별도 도구로 개발 가능
- KWCAG 인증 심사 대응 문서 -- 실제 심사 시 별도 작업
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| A11Y-01 | KWCAG/WCAG 2.1 AA 퍼블리싱 체크리스트 (체크 가능한 항목별 목록) | KWCAG 2.2 33개 검사항목 전수 조사 완료, 컴포넌트별 매핑 가이드 제공 |
| A11Y-02 | KWCAG 2.2 확대 항목 (33개 검사항목) 반영 | 4원칙/14지침/33항목 구조 확인, 신규 9개 항목 식별 완료 |
| A11Y-03 | 컴포넌트별 접근성 패턴 내장 (aria-*, role, tabindex, 키보드 네비게이션) | Phase 3 스니펫 접근성 섹션 분석 완료, 가이드 문서 구조 설계 |
| A11Y-04 | 스크린리더 전용 콘텐츠 (.sr-only) 패턴 가이드 | sr-only 유틸리티 존재 확인, 사용 시나리오별 가이드 구조 설계 |
| A11Y-05 | 색상 대비 가이드 (4.5:1 이상, 확인 도구 안내) | 토큰 19개 조합 대비 비율 계산 완료, PASS/FAIL 판정 데이터 확보 |
| A11Y-06 | pa11y-ci 자동화 접근성 테스트 통합 가이드 | pa11y-ci 4.1.0 설정 옵션, JSON 리포터, 로컬 파일 테스트 방법 조사 완료 |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- **BEM 네이밍 필수**: HTML 체크리스트 페이지도 BEM 클래스 적용
- **인라인 스타일 금지**: playground HTML의 pg__ 전용 스타일은 `<style>` 태그 허용 (Phase 3 패턴)
- **!important 금지**
- **CSS Custom Properties 토큰 우선 사용**: 하드코딩 값 금지
- **접근성 (KWCAG/WCAG 2.1 AA)**: alt, aria-label, 키보드 네비게이션, 색상 대비 4.5:1
- **들여쓰기 2 spaces, single quote, 주석 한국어**
- **@use/@forward 사용** (@import 금지)
- **Stylelint 린트 필수 실행**

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| pa11y-ci | ^4.1.0 | CI 접근성 테스트 러너 | Pa11y 9 + Puppeteer 24 기반, WCAG2AA 표준 지원, JSON 리포터 내장 |
| @axe-core/cli | ^4.11.1 | 개발 중 빠른 접근성 검사 | axe-core 엔진 CLI 래퍼, 개별 페이지 빠른 체크용 |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| pa11y | ^9.x | pa11y-ci 내부 엔진 | pa11y-ci가 자동 설치 (peer dependency) |

**Installation:**
```bash
npm install --save-dev pa11y-ci@^4.1.0 @axe-core/cli@^4.11.1 --legacy-peer-deps
```

> `--legacy-peer-deps` 플래그는 Phase 2에서 stylelint-selector-bem-pattern peer dep 충돌 해결에 사용한 기존 패턴 유지.

## Architecture Patterns

### 산출물 디렉토리 구조

```
docs/
  accessibility/
    checklist.md           # A11Y-01, A11Y-02: 마크다운 체크리스트 (AI/문서용)
    btn.md                 # A11Y-03: 버튼 접근성 가이드
    form.md                # A11Y-03: 폼 접근성 가이드
    card.md                # A11Y-03: 카드 접근성 가이드
    table.md               # A11Y-03: 테이블 접근성 가이드
    modal.md               # A11Y-03: 모달 접근성 가이드
    tab.md                 # A11Y-03: 탭 접근성 가이드
    pagination.md          # A11Y-03: 페이지네이션 접근성 가이드
    breadcrumb.md          # A11Y-03: 브레드크럼 접근성 가이드
    sr-only.md             # A11Y-04: .sr-only 패턴 가이드
    color-contrast.md      # A11Y-05: 색상 대비 가이드
src/
  playground/
    a11y-checklist.html    # A11Y-01: HTML 인터랙티브 체크리스트
reports/                   # pa11y-ci 리포트 출력 디렉토리
  .gitkeep
.pa11yci.json              # A11Y-06: pa11y-ci 설정
```

### Pattern 1: pa11y-ci 설정 (.pa11yci.json)

**What:** pa11y-ci 설정 파일로 playground 9개 HTML 파일을 WCAG2AA 기준으로 검사
**When to use:** `npm run test:a11y` 실행 시

```json
{
  "defaults": {
    "standard": "WCAG2AA",
    "timeout": 30000,
    "viewport": {
      "width": 1280,
      "height": 800
    },
    "reporters": [
      "cli",
      ["json", { "fileName": "reports/a11y-report.json" }]
    ],
    "chromeLaunchConfig": {
      "args": ["--no-sandbox"]
    }
  },
  "urls": [
    "file://${PWD}/src/playground/index.html",
    "file://${PWD}/src/playground/btn.html",
    "file://${PWD}/src/playground/form.html",
    "file://${PWD}/src/playground/card.html",
    "file://${PWD}/src/playground/table.html",
    "file://${PWD}/src/playground/modal.html",
    "file://${PWD}/src/playground/tab.html",
    "file://${PWD}/src/playground/pagination.html",
    "file://${PWD}/src/playground/breadcrumb.html"
  ]
}
```

> **주의:** pa11y-ci는 file:// URL에서 `${PWD}` 환경변수를 자동 치환하지 않는다. JavaScript 설정 파일(.pa11yci.js)을 사용하거나, npm script에서 절대 경로를 동적 생성해야 한다.

**추천: JavaScript 설정 파일 사용**

```javascript
// .pa11yci.js
const path = require('path')
const playgroundDir = path.resolve(__dirname, 'src/playground')

const pages = [
  'index.html',
  'btn.html',
  'form.html',
  'card.html',
  'table.html',
  'modal.html',
  'tab.html',
  'pagination.html',
  'breadcrumb.html'
]

module.exports = {
  defaults: {
    standard: 'WCAG2AA',
    timeout: 30000,
    viewport: { width: 1280, height: 800 },
    reporters: [
      'cli',
      ['json', { fileName: 'reports/a11y-report.json' }]
    ],
    chromeLaunchConfig: {
      args: ['--no-sandbox']
    }
  },
  urls: pages.map(p => `file://${path.join(playgroundDir, p)}`)
}
```

### Pattern 2: npm script 추가

```json
{
  "scripts": {
    "test:a11y": "pa11y-ci --config .pa11yci.js",
    "test:a11y:single": "axe"
  }
}
```

### Pattern 3: 컴포넌트별 접근성 가이드 문서 구조

**What:** 각 컴포넌트의 접근성 필수 사항을 문서화
**구조:**

```markdown
# [컴포넌트명] 접근성 가이드

## 필수 ARIA 속성

| 속성 | 대상 요소 | 값 | 설명 |
|------|----------|-----|------|
| role | .tab__list | tablist | 탭 목록 컨테이너 |

## 키보드 상호작용

| 키 | 동작 |
|----|------|
| Tab | 다음 포커스 가능 요소 |

## Do / Don't

### Do (올바른 예)
[코드 예시]

### Don't (잘못된 예)
[코드 예시 + 이유]

## 스크린리더 테스트 노트
- NVDA: [예상 음성 출력]
- VoiceOver: [예상 음성 출력]

## KWCAG 2.2 관련 검사항목
| 항목 번호 | 항목명 | 이 컴포넌트에서의 확인 방법 |
```

### Pattern 4: 체크리스트 마크다운 구조 (D-02 컴포넌트별 분류)

```markdown
# KWCAG/WCAG 2.1 AA 퍼블리싱 체크리스트

## 공통 항목
- [ ] lang 속성 지정 (7.1.1)
- [ ] 페이지 제목 제공 (6.4.2)
- [ ] 건너뛰기 링크 (6.4.1)
...

## 버튼 (btn)
- [ ] <button> 태그 사용 (8.2.1)
- [ ] 아이콘 버튼 aria-label (5.1.1)
...

## 폼 (form)
- [ ] label 연결 (7.3.2)
...
```

### Pattern 5: HTML 인터랙티브 체크리스트

**What:** localStorage로 체크 상태 저장, 진행률 표시
**구조:** Phase 3 playground 패턴(pg__ 접두사) 따라 구현

```html
<!-- 체크리스트 항목 예시 -->
<fieldset class="a11y-checklist__section">
  <legend class="a11y-checklist__title">공통 항목</legend>
  <label class="a11y-checklist__item">
    <input type="checkbox" class="a11y-checklist__check"
           data-category="common" data-id="lang">
    <span class="a11y-checklist__label">
      기본 언어 표시 (7.1.1) -- html lang="ko" 속성 지정
    </span>
  </label>
</fieldset>

<!-- 진행률 표시 -->
<div class="a11y-checklist__progress" role="progressbar"
     aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"
     aria-label="체크리스트 진행률">
  <div class="a11y-checklist__progress-bar"></div>
  <span class="a11y-checklist__progress-text">0 / 33 완료</span>
</div>
```

### Anti-Patterns to Avoid
- **체크리스트를 WCAG 4원칙으로 분류하지 않는다**: D-02 결정에 따라 컴포넌트별로 분류
- **스니펫과 가이드 내용을 중복하지 않는다**: 스니펫 = 코드 복사용, 가이드 = 왜/언제/주의사항
- **pa11y-ci 결과를 git에 커밋하지 않는다**: reports/ 는 .gitignore에 추가

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| WCAG 규칙 검사 엔진 | 커스텀 접근성 검사기 | pa11y-ci (axe-core 내장) | 수백 개 규칙, 지속적 업데이트, Deque 전문팀 |
| 색상 대비 비율 계산 | 직접 계산 스크립트 | WebAIM Contrast Checker / APCA 온라인 도구 안내 | 표준 알고리즘 (WCAG 2.x 상대 휘도), 수동 계산 오류 위험 |
| 스크린리더 테스트 자동화 | 스크린리더 자동 테스트 | 테스트 노트 문서화 (수동) | 스크린리더 자동 테스트는 아직 불안정, 수동 테스트가 표준 |

## KWCAG 2.2 검사항목 전체 구조 (33개)

### 1원칙: 인식의 용이성 (9개)

| 번호 | 검사항목 | 신규 | 관련 컴포넌트 |
|------|---------|------|--------------|
| 5.1.1 | 적절한 대체 텍스트 제공 | | 공통, 카드(이미지) |
| 5.2.1 | 자막 제공 | | 해당 없음 (멀티미디어 없음) |
| 5.3.1 | 표의 구성 | | 테이블 |
| 5.3.2 | 콘텐츠의 선형구조 | | 공통, 모달 |
| 5.3.3 | 명확한 지시사항 제공 | | 폼 |
| 5.4.1 | 색에 무관한 콘텐츠 인식 | | 폼(유효성 상태), 버튼 |
| 5.4.2 | 자동 재생 금지 | | 해당 없음 |
| 5.4.3 | 텍스트 콘텐츠의 명도 대비 | | 공통 (색상 대비 가이드) |
| 5.4.4 | 콘텐츠 간의 구분 | | 카드, 테이블 |

### 2원칙: 운용의 용이성 (15개)

| 번호 | 검사항목 | 신규 | 관련 컴포넌트 |
|------|---------|------|--------------|
| 6.1.1 | 키보드 사용 보장 | | 버튼, 폼, 모달, 탭, 페이지네이션, 브레드크럼 |
| 6.1.2 | 초점 이동과 표시 | | 공통 (focus-visible) |
| 6.1.3 | 조작 가능 | | 버튼, 폼, 모달, 탭 |
| 6.1.4 | 문자 단축키 | NEW | 해당 없음 (단축키 미사용) |
| 6.2.1 | 응답시간 조절 | | 해당 없음 |
| 6.2.2 | 정지 기능 제공 | | 해당 없음 |
| 6.3.1 | 깜빡임과 번쩍임 사용 제한 | | 해당 없음 |
| 6.4.1 | 반복 영역 건너뛰기 | | 보일러플레이트 (skip-to-content) |
| 6.4.2 | 제목 제공 | | 공통 (title, heading) |
| 6.4.3 | 적절한 링크 텍스트 | | 브레드크럼, 페이지네이션 |
| 6.4.4 | 고정된 참조 위치 정보 | NEW | 해당 없음 (단일 페이지) |
| 6.5.1 | 단일 포인터 입력 지원 | NEW | 해당 없음 (드래그 미사용) |
| 6.5.2 | 포인터 입력 취소 | NEW | 해당 없음 |
| 6.5.3 | 레이블과 네임 | NEW | 폼, 버튼 |
| 6.5.4 | 동작기반 작동 | NEW | 해당 없음 |

### 3원칙: 이해의 용이성 (7개)

| 번호 | 검사항목 | 신규 | 관련 컴포넌트 |
|------|---------|------|--------------|
| 7.1.1 | 기본 언어 표시 | | 공통 (html lang="ko") |
| 7.2.1 | 사용자 요구에 따른 실행 | | 폼, 모달 |
| 7.2.2 | 찾기 쉬운 도움 정보 | NEW | 해당 없음 (가이드 사이트 자체) |
| 7.3.1 | 오류 정정 | | 폼 |
| 7.3.2 | 레이블 제공 | | 폼 |
| 7.3.3 | 접근 가능한 인증 | NEW | 해당 없음 (인증 기능 없음) |
| 7.3.4 | 반복 입력 정보 | NEW | 해당 없음 |

### 4원칙: 견고성 (2개)

| 번호 | 검사항목 | 신규 | 관련 컴포넌트 |
|------|---------|------|--------------|
| 8.1.1 | 마크업 오류 방지 | | 공통 |
| 8.2.1 | 웹 애플리케이션 접근성 준수 | | 모달, 탭 |

### 컴포넌트별 해당 검사항목 요약

| 컴포넌트 | 해당 항목 수 | 핵심 항목 |
|----------|------------|----------|
| 공통 | 8 | 5.1.1, 5.3.2, 5.4.1, 5.4.3, 6.1.2, 6.4.2, 7.1.1, 8.1.1 |
| 버튼 | 4 | 5.4.1, 6.1.1, 6.1.3, 6.5.3 |
| 폼 | 7 | 5.3.3, 5.4.1, 6.1.1, 6.5.3, 7.2.1, 7.3.1, 7.3.2 |
| 카드 | 3 | 5.1.1, 5.4.4, 6.4.3 |
| 테이블 | 3 | 5.3.1, 5.4.4, 6.1.1 |
| 모달 | 5 | 5.3.2, 6.1.1, 6.1.3, 7.2.1, 8.2.1 |
| 탭 | 4 | 6.1.1, 6.1.3, 6.4.2, 8.2.1 |
| 페이지네이션 | 3 | 6.1.1, 6.4.3, 5.1.1 |
| 브레드크럼 | 3 | 6.4.3, 5.3.2, 6.1.1 |
| 보일러플레이트 | 2 | 6.4.1, 7.1.1 |

## 색상 대비 분석 데이터 (토큰 기준)

Phase 1 토큰값 기준으로 계산한 전경/배경 조합 대비 비율:

| 전경 | 배경 | 설명 | 대비 비율 | AA 일반 | AA 대형 |
|------|------|------|-----------|---------|---------|
| #1e2124 | #ffffff | text / white bg | 16.2:1 | PASS | PASS |
| #666666 | #ffffff | text-secondary / white bg | 5.7:1 | PASS | PASS |
| #999999 | #ffffff | text-disabled / white bg | 2.8:1 | FAIL | FAIL |
| #ffffff | #256ef4 | white / primary | 4.6:1 | PASS | PASS |
| #ffffff | #083891 | white / primary-dark | 10.6:1 | PASS | PASS |
| #ffffff | #6a9df7 | white / primary-light | 2.7:1 | FAIL | FAIL |
| #de3412 | #ffffff | danger / white bg | 4.6:1 | PASS | PASS |
| #c78500 | #ffffff | warning / white bg | 3.1:1 | FAIL | PASS |
| #228738 | #ffffff | success / white bg | 4.6:1 | PASS | PASS |
| #0b78cb | #ffffff | info / white bg | 4.6:1 | PASS | PASS |
| #222222 | #f8f8f8 | gray-900 / bg-secondary | 15.0:1 | PASS | PASS |
| #555555 | #ffffff | gray-700 / white bg | 7.5:1 | PASS | PASS |
| #333333 | #ffffff | gray-800 / white bg | 12.6:1 | PASS | PASS |
| #b1b8be | #ffffff | gray-400 / white bg | 2.0:1 | FAIL | FAIL |
| #cccccc | #ffffff | gray-300 / white bg | 1.6:1 | FAIL | FAIL |
| #1e2124 | #efefef | text / gray-100 | 14.1:1 | PASS | PASS |
| #1e2124 | #f8f8f8 | text / bg-secondary | 15.2:1 | PASS | PASS |
| #256ef4 | #ffffff | primary / white bg | 4.6:1 | PASS | PASS |
| #000000 | #ffffff | black / white | 21.0:1 | PASS | PASS |

### FAIL 항목 분석 및 사용 가이드

| FAIL 조합 | 대비 비율 | 허용 사용 범위 | 대안 |
|-----------|-----------|---------------|------|
| text-disabled (#999) / white | 2.8:1 | disabled 상태 전용 -- WCAG AA 예외 허용 | 없음 (의도된 비활성 표현) |
| primary-light (#6a9df7) / white | 2.7:1 | 텍스트 사용 불가, 장식적 배경만 허용 | primary(#256ef4) 사용 |
| warning (#c78500) / white | 3.1:1 | 대형 텍스트(18px+, 14px bold+)만 허용 | 아이콘+텍스트 조합 권장 |
| gray-400 (#b1b8be) / white | 2.0:1 | 텍스트 사용 불가, 장식용 보더만 허용 | gray-500(#999)도 부족, gray-700(#555) 사용 |
| gray-300 (#ccc) / white | 1.6:1 | 텍스트 사용 불가, 구분선만 허용 | 텍스트 시 gray-700(#555) 이상 사용 |

## Common Pitfalls

### Pitfall 1: pa11y-ci 로컬 파일 경로 문제
**What goes wrong:** JSON 설정에 상대 경로를 넣으면 file:// 변환 시 경로가 깨진다.
**Why it happens:** pa11y-ci가 CWD 기준으로 상대 경로를 resolve하지만, JSON에서는 동적 경로 생성이 불가능하다.
**How to avoid:** `.pa11yci.js` (JavaScript 설정 파일)를 사용하여 `path.resolve()`로 절대 경로를 동적 생성한다.
**Warning signs:** `Error: Navigation timeout` 또는 빈 페이지 에러.

### Pitfall 2: playground HTML의 외부 CSS 참조 깨짐
**What goes wrong:** pa11y-ci가 file://로 HTML을 열 때 `../../dist/css/style.css` 상대 경로가 올바르게 resolve되지 않을 수 있다.
**Why it happens:** 브라우저가 file:// 프로토콜에서 상대 경로를 다르게 처리할 수 있다.
**How to avoid:** `npm run build:css` 선행 실행 필수. dist/css/style.css가 존재해야 한다. npm script에서 `build:css && pa11y-ci`로 체이닝한다.
**Warning signs:** 스타일 미적용 상태에서 대비 관련 에러가 다수 발생.

### Pitfall 3: 체크리스트 항목 누락
**What goes wrong:** KWCAG 2.2 신규 9개 항목을 빠뜨려 공공기관 납품 시 문제 발생.
**Why it happens:** KWCAG 2.1 기준 24개만 알고 있는 경우.
**How to avoid:** 이 리서치의 33개 항목 전체 목록을 기준으로 체크리스트 작성.
**Warning signs:** 검사항목 수가 33개 미만.

### Pitfall 4: 스니펫과 가이드 내용 중복
**What goes wrong:** src/snippets/*.md와 docs/accessibility/*.md에 동일한 접근성 내용이 중복되어 유지보수 부담 증가.
**Why it happens:** 스니펫 파일에 이미 "접근성 주의사항" 섹션이 있다.
**How to avoid:** 스니펫 = 코드 복사용 (필수 속성 요약), 가이드 = 심화 설명 (왜/언제/do-don't/스크린리더). 가이드에서 스니펫을 참조하되 내용을 복사하지 않는다.
**Warning signs:** 두 파일에서 같은 코드 예시가 반복.

### Pitfall 5: pa11y-ci가 JS 실행 전 검사
**What goes wrong:** 모달/탭 등 JS 의존 컴포넌트가 초기 상태로만 검사되어 숨겨진 접근성 문제를 놓친다.
**Why it happens:** pa11y-ci는 기본적으로 페이지 로드 후 바로 검사한다.
**How to avoid:** modal/tab 등은 actions 옵션으로 상태 변경 후 검사하거나, playground HTML에 펼쳐진 상태를 포함한다. 현재 playground는 이미 모든 상태를 보여주는 구조이므로 큰 문제는 아니지만 확인 필요.
**Warning signs:** 모달 닫힌 상태에서 aria-hidden="true"인 요소에 대한 경고.

## Code Examples

### pa11y-ci JavaScript 설정 파일

```javascript
// .pa11yci.js
// pa11y-ci 설정 -- playground HTML 접근성 검사
const path = require('path')

const playgroundDir = path.resolve(__dirname, 'src/playground')

const pages = [
  'index.html',
  'btn.html',
  'form.html',
  'card.html',
  'table.html',
  'modal.html',
  'tab.html',
  'pagination.html',
  'breadcrumb.html'
]

module.exports = {
  defaults: {
    standard: 'WCAG2AA',
    timeout: 30000,
    viewport: { width: 1280, height: 800 },
    reporters: [
      'cli',
      ['json', { fileName: 'reports/a11y-report.json' }]
    ],
    chromeLaunchConfig: {
      args: ['--no-sandbox']
    }
  },
  urls: pages.map(p => `file://${path.join(playgroundDir, p)}`)
}
```

### npm script 추가 패턴

```json
{
  "test:a11y": "npm run build:css && pa11y-ci --config .pa11yci.js",
  "test:a11y:quick": "axe src/playground/btn.html --rules wcag2aa"
}
```

### HTML 체크리스트 진행률 JS (localStorage 저장)

```javascript
// 체크리스트 진행률 관리 (인라인 또는 별도 파일)
;(function () {
  'use strict'

  const STORAGE_KEY = 'a11y-checklist-state'

  function loadState() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}
    } catch {
      return {}
    }
  }

  function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }

  function updateProgress() {
    const total = document.querySelectorAll('.a11y-checklist__check').length
    const checked = document.querySelectorAll('.a11y-checklist__check:checked').length
    const bar = document.querySelector('.a11y-checklist__progress-bar')
    const text = document.querySelector('.a11y-checklist__progress-text')
    const progressbar = document.querySelector('.a11y-checklist__progress')
    const percent = Math.round((checked / total) * 100)

    if (bar) bar.style.width = percent + '%'
    if (text) text.textContent = checked + ' / ' + total + ' 완료'
    if (progressbar) progressbar.setAttribute('aria-valuenow', percent)
  }

  document.addEventListener('DOMContentLoaded', function () {
    var state = loadState()
    var checkboxes = document.querySelectorAll('.a11y-checklist__check')

    checkboxes.forEach(function (cb) {
      var id = cb.dataset.category + '-' + cb.dataset.id
      if (state[id]) cb.checked = true
    })

    updateProgress()

    document.addEventListener('change', function (e) {
      if (!e.target.classList.contains('a11y-checklist__check')) return
      var id = e.target.dataset.category + '-' + e.target.dataset.id
      var currentState = loadState()
      if (e.target.checked) {
        currentState[id] = true
      } else {
        delete currentState[id]
      }
      saveState(currentState)
      updateProgress()
    })
  })
})()
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| KWCAG 2.1 (24개 검사항목) | KWCAG 2.2 (33개 검사항목) | 2024 | 신규 9개 항목 추가, 2026년 전자정부 의무화 |
| pa11y-ci 3.x (Pa11y 7) | pa11y-ci 4.1.0 (Pa11y 9 + Puppeteer 24) | 2025 | 최신 Chromium, 성능 개선 |
| WCAG 2.0 AA | WCAG 2.1 AA (+ 2.2 참고) | 2018/2023 | 모바일, 인지 접근성 강화 |

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | pa11y-ci 실행 | YES | v22.21.1 | -- |
| npm | 패키지 설치 | YES | v10.9.4 | -- |
| Chromium (Puppeteer) | pa11y-ci 내부 | 자동 설치 | Puppeteer 24 번들 | -- |

**Missing dependencies with no fallback:**
- 없음

**Missing dependencies with fallback:**
- 없음 -- pa11y-ci가 Puppeteer 내장 Chromium을 자동 다운로드하므로 별도 브라우저 설치 불필요

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | pa11y-ci 4.1.0 (axe-core 엔진) |
| Config file | `.pa11yci.js` (Wave 0에서 생성) |
| Quick run command | `npm run test:a11y` |
| Full suite command | `npm run test:a11y` |

### Phase Requirements -> Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| A11Y-01 | 체크리스트 파일 존재 + 33개 항목 포함 | smoke | `test -f docs/accessibility/checklist.md && grep -c '\- \[ \]' docs/accessibility/checklist.md` | Wave 0 |
| A11Y-02 | KWCAG 2.2 신규 9개 항목 포함 | smoke | `grep -c '6.1.4\|6.4.4\|6.5.1\|6.5.2\|6.5.3\|6.5.4\|7.2.2\|7.3.3\|7.3.4' docs/accessibility/checklist.md` | Wave 0 |
| A11Y-03 | 8개 컴포넌트 접근성 가이드 존재 | smoke | `ls docs/accessibility/{btn,form,card,table,modal,tab,pagination,breadcrumb}.md \| wc -l` | Wave 0 |
| A11Y-04 | sr-only 가이드 존재 | smoke | `test -f docs/accessibility/sr-only.md` | Wave 0 |
| A11Y-05 | 색상 대비 가이드 존재 + PASS/FAIL 표 | smoke | `test -f docs/accessibility/color-contrast.md && grep -c 'PASS\|FAIL' docs/accessibility/color-contrast.md` | Wave 0 |
| A11Y-06 | pa11y-ci 설정 + npm script + playground 검증 통과 | integration | `npm run test:a11y` | Wave 0 |

### Sampling Rate
- **Per task commit:** 해당 파일 존재 확인 (smoke)
- **Per wave merge:** `npm run test:a11y` 실행
- **Phase gate:** `npm run test:a11y` 통과 + 모든 문서 파일 존재 확인

### Wave 0 Gaps
- [ ] `.pa11yci.js` -- pa11y-ci 설정 파일 생성
- [ ] `reports/.gitkeep` -- 리포트 출력 디렉토리
- [ ] `.gitignore`에 `reports/a11y-report.json` 추가
- [ ] package.json에 `pa11y-ci`, `@axe-core/cli` devDependencies 추가
- [ ] package.json에 `test:a11y` npm script 추가

## Open Questions

1. **pa11y-ci가 playground HTML의 상대 CSS 경로를 file://에서 정상 resolve하는가?**
   - What we know: playground HTML은 `../../dist/css/style.css` 상대 경로로 CSS 참조
   - What's unclear: file:// 프로토콜에서 상대 경로 CSS가 정상 로드되는지 실행 전 확인 불가
   - Recommendation: 첫 실행 후 결과 확인, 문제 시 playground HTML 내 CSS 경로를 절대 경로로 변경하거나 간단한 로컬 서버 사용

2. **모달/탭의 JS 실행 상태에서 pa11y-ci 검사가 충분한가?**
   - What we know: playground 페이지가 이미 모든 variant를 펼쳐서 보여주는 구조
   - What's unclear: 모달이 닫힌 상태의 aria-hidden="true" 요소가 pa11y에 영향을 주는지
   - Recommendation: 첫 실행 결과에서 false positive 확인 후 ignore 규칙 추가

## Sources

### Primary (HIGH confidence)
- [pa11y-ci GitHub README](https://github.com/pa11y/pa11y-ci/blob/main/README.md) -- 설정 옵션, 리포터, CLI 플래그
- [KWCAG 2.2 공식](https://a11ykr.github.io/kwcag22/) -- 4원칙/14지침/33검사항목 전체 구조
- [pa11y-ci npm](https://www.npmjs.com/package/pa11y-ci) -- v4.1.0 확인
- [@axe-core/cli npm](https://www.npmjs.com/package/@axe-core/cli) -- v4.11.1 확인
- Phase 1 토큰 파일 `src/scss/1-settings/_tokens-color.scss` -- 색상 대비 계산 기준값
- Phase 3 스니펫 파일 `src/snippets/*.md` -- 기존 접근성 주의사항 분석

### Secondary (MEDIUM confidence)
- [KWCAG 2025 최신 기준 정리](https://jinbytes.com/entry/KWCAG-2025-%EC%9B%B9-%EC%A0%91%EA%B7%BC%EC%84%B1-%EC%B5%9C%EC%8B%A0-%EA%B8%B0%EC%A4%80-%EC%A0%95%EB%A6%AC) -- 2026년 의무화 일정
- [UXKM 접근성 가이드](https://uxkm.io/accessibility/a11y/04-a11yCag/02-kwcag) -- KWCAG 컴포넌트 매핑 참고

### Tertiary (LOW confidence)
- 없음

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - pa11y-ci 4.1.0, @axe-core/cli 4.11.1 npm 공식 확인
- Architecture: HIGH - Phase 3 playground 구조 분석 완료, 파일 패턴 확립됨
- KWCAG 2.2 매핑: MEDIUM - 공식 문서 기반이나 컴포넌트별 매핑은 리서치 판단
- Pitfalls: MEDIUM - file:// 경로 문제는 실행 전 확인 불가, 실행 시 검증 필요
- 색상 대비: HIGH - 상대 휘도 공식으로 직접 계산, Phase 3 UI-SPEC 데이터와 일치 확인

**Research date:** 2026-03-25
**Valid until:** 2026-04-25 (pa11y-ci 안정 버전, KWCAG 2.2 확정 표준)
