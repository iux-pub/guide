# Phase 4: Accessibility -- Checklist + Validation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-25
**Phase:** 04-accessibility-checklist-validation
**Areas discussed:** 체크리스트 포맷, pa11y-ci 검증 범위, 컴포넌트별 접근성 가이드, 색상 대비 가이드

---

## 체크리스트 포맷

| Option | Description | Selected |
|--------|-------------|----------|
| 마크다운 체크리스트 | docs/accessibility-checklist.md — 카테고리별 체크박스 목록 | |
| HTML 체크리스트 페이지 | src/playground/a11y-checklist.html — 브라우저에서 실제 체크 가능 | |
| 두 가지 모두 | 마크다운(AI/문서용) + HTML(실무 체크용) 병행 제공 | ✓ |

**User's choice:** 두 가지 모두
**Notes:** 없음

### 분류 기준

| Option | Description | Selected |
|--------|-------------|----------|
| WCAG 4원칙 기준 | 인식/운용/이해/견고 분류 | |
| 퍼블리싱 작업 단계별 | HTML → CSS → JS → 테스트 순서 | |
| 컴포넌트별 | 버튼, 폼, 모달 등 컴포넌트 단위로 분류 | ✓ |

**User's choice:** 컴포넌트별
**Notes:** Phase 3 컴포넌트 구조와 1:1 대응

---

## pa11y-ci 검증 범위

| Option | Description | Selected |
|--------|-------------|----------|
| playground 전체 + WCAG AA | src/playground/*.html 9개 전체 검사 | |
| playground + 미래 확장 가능 | .pa11yci.json 설정 파일로 확장 가능한 구조 | ✓ |
| 선별적 검사 | 컴포넌트별 개별 검사 가능 구조 | |

**User's choice:** playground + 미래 확장 가능

### 리포트 형태

| Option | Description | Selected |
|--------|-------------|----------|
| 터미널 + JSON | 터미널 요약 + reports/a11y-report.json 저장 | ✓ |
| 터미널만 | 콘솔 출력만 | |
| HTML 리포트 | 브라우저 리포트 생성 | |

**User's choice:** 터미널 + JSON

---

## 컴포넌트별 접근성 가이드

| Option | Description | Selected |
|--------|-------------|----------|
| 실무 충분 | ARIA 표 + 키보드 + do/don't + 스크린리더 노트 | ✓ |
| 간결한 참조 | ARIA 표 + 체크포인트만 | |
| KRDS 원문 수준 | WAI-ARIA APG 전체 포함 상세 문서 | |

**User's choice:** 실무 충분

### 가이드 위치

| Option | Description | Selected |
|--------|-------------|----------|
| docs/ 별도 문서 | docs/accessibility/ 폴더에 컴포넌트별 독립 문서 | ✓ |
| 스니펫 확장 | src/snippets/*.md 접근성 섹션 확장 | |
| CLAUDE.md 통합 | CLAUDE.md 접근성 섹션 확장 | |

**User's choice:** docs/ 별도 문서

---

## 색상 대비 가이드

| Option | Description | Selected |
|--------|-------------|----------|
| 토큰 대비 표 + 도구 안내 | 대비 표 + 온라인 도구 안내 | |
| 토큰 대비 표만 | UI-SPEC 대비 표 확장 | |
| 상세 가이드 | 대비 표 + 도구 + 색상 선택 원칙 + 대안 제안 | ✓ |

**User's choice:** 상세 가이드

---

## Claude's Discretion

- KWCAG 2.2 33개 항목과 컴포넌트의 구체적 매핑 관계
- HTML 체크리스트 페이지의 인터랙션 방식
- pa11y-ci 설정 세부 옵션
- 스크린리더 테스트 노트의 구체적 내용
- 대안 색상 제안의 구체적 방법론

## Deferred Ideas

- Lighthouse CI 통합
- 자동 색상 대비 체크 스크립트
- KWCAG 인증 심사 대응 문서
