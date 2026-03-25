# Phase 3: Components — HTML+SCSS Snippets - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-25
**Phase:** 03-components-html-scss-snippets
**Areas discussed:** 컴포넌트 디자인 기준, 접근성 내장 범위, 미리보기 페이지 구조, AI 스니펫 포맷

---

## 컴포넌트 디자인 기준

### KRDS 참조 수준

| Option | Description | Selected |
|--------|-------------|----------|
| KRDS 구조 참조 (Recommended) | KRDS의 접근성 패턴(role, aria)과 마크업 구조를 참조하되, 스타일링은 우리 토큰으로 독자 적용 | ✓ |
| KRDS 충실 재현 | KRDS의 디자인(색상, 간격, 모양)을 최대한 그대로 재현 | |
| 독자 디자인 | KRDS 무관하게 우리 팀 디자인 기준으로 자유롭게 설계 | |

**User's choice:** KRDS 구조 참조
**Notes:** None

### 스타일 방향

| Option | Description | Selected |
|--------|-------------|----------|
| 미니멀 기본 (Recommended) | 최소한의 스타일링만 적용 — 구조와 레이아웃 중심 | ✓ |
| 완성도 높은 기본값 | 바로 쓸 수 있는 수준의 스타일링 | |

**User's choice:** 미니멀 기본
**Notes:** None

### Variant 범위

| Option | Description | Selected |
|--------|-------------|----------|
| 핵심만 (Recommended) | 가장 많이 쓰는 변형만 | |
| 전체 variant 세트 | 모든 변형을 미리 정의, 컴포넌트 라이브러리 수준 | ✓ |

**User's choice:** 전체 variant 세트
**Notes:** None

### 반응형 수준

| Option | Description | Selected |
|--------|-------------|----------|
| 기본 반응형 (Recommended) | 필수 반응형만 | |
| 상세 반응형 | 모든 컴포넌트에 모바일/태블릿/PC 각각의 레이아웃 변화 정의 | ✓ |

**User's choice:** 상세 반응형
**Notes:** None

---

## 접근성 내장 범위

### JS 동작 포함 여부

| Option | Description | Selected |
|--------|-------------|----------|
| HTML+SCSS만 (Recommended) | JS 동작은 주석으로 안내 | |
| 바닐라 JS 포함 | 접근성 필수 JS를 함께 제공, 복사해서 바로 쓰는 수준 | ✓ |
| 접근성 JS만 포함 | 포커스트랩, 키보드 네비게이션 등 접근성 필수 JS만 | |

**User's choice:** 바닐라 JS 포함
**Notes:** None

### aria 속성 수준

| Option | Description | Selected |
|--------|-------------|----------|
| 완전 내장 (Recommended) | role, aria-label, aria-expanded, aria-selected, tabindex 등 전부 포함 | ✓ |
| 기본만 | role, aria-label 등 기본 수준만 | |

**User's choice:** 완전 내장
**Notes:** None

---

## 미리보기 페이지 구조

### 페이지 구성

| Option | Description | Selected |
|--------|-------------|----------|
| 컴포넌트별 HTML (Recommended) | 각 컴포넌트마다 독립 HTML 페이지 | ✓ |
| playground 확장 | 기존 playground를 확장해서 모든 컴포넌트를 한 페이지에 | |
| Phase 5에서 처리 | Phase 3에서는 SCSS만, 미리보기는 Phase 5에서 | |

**User's choice:** 컴포넌트별 HTML
**Notes:** None

### 코드 표시

| Option | Description | Selected |
|--------|-------------|----------|
| 렌더링만 (Recommended) | 미리보기 페이지는 렌더링 결과만, 코드는 Phase 5에서 | |
| 렌더링 + 코드 함께 | 각 variant 아래에 HTML 소스코드를 함께 표시 | ✓ |

**User's choice:** 렌더링 + 코드 함께
**Notes:** None

---

## AI 스니펫 포맷

### 포맷 결정 과정

사용자가 여러 옵션을 검토하며 대화를 통해 결정:

1. **CLAUDE.md 통합** — Phase 2와 동일 방식이나 컴포넌트 8개+variant 넣으면 너무 길어짐
2. **별도 스킬 파일** — `.claude/skills/`에 설치 필요, 팀원마다 셋업 과정 추가
3. **프로젝트 내 참조 파일** — `src/snippets/`에 두면 스킬과 별 차이 없음
4. **최종 결정: 스니펫 파일 생성 + CLAUDE.md에서 경로 안내**

**User's choice:** 스니펫 파일 생성 후 CLAUDE.md에서 경로 안내
**Notes:** 팀원 배포 시 설치 과정 없이 repo 클론만으로 적용 가능한 것이 핵심. 스킬은 별도 설치가 번거로움.

### 스니펫 내용

| Option | Description | Selected |
|--------|-------------|----------|
| HTML + 사용법 (Recommended) | HTML 마크업 예제 + variant 목록 + 접근성 주의사항, SCSS는 파일 경로만 안내 | ✓ |
| HTML + SCSS 통합 | HTML과 SCSS 코드를 함께 제공 | |
| HTML만 | HTML 마크업만 제공 | |

**User's choice:** HTML + 사용법
**Notes:** None

---

## Claude's Discretion

- 각 컴포넌트의 구체적 variant 세부 목록
- 컴포넌트별 반응형 브레이크포인트 동작 세부사항
- 바닐라 JS 구현 방식
- 미리보기 페이지 레이아웃/디자인
- 스니펫 .md 파일 내부 구조

## Deferred Ideas

- 추가 컴포넌트 (Accordion, Alert, Badge, Tooltip, Dropdown) — v2
- 다크모드 variant — v2
- Figma 컴포넌트-코드 매핑 — Phase 6
