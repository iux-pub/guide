# Phase 2: Conventions — BEM + Linting - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-25
**Phase:** 02-conventions-bem-linting
**Areas discussed:** BEM 엄격도, Stylelint 수준, AI 지시문

---

## BEM 엄격도

| Option | Description | Selected |
|--------|-------------|----------|
| 엄격한 BEM | Block__Element--Modifier 표기법 완전 준수 | ✓ |
| 실용적 BEM | Block__Element 필수, Modifier는 --와 .is-active 병행 | |
| You decide | 팀 상황에 맞게 판단 | |

**User's choice:** 엄격한 BEM
**Notes:** 기존 프로젝트의 느슨한 하이픈 패턴을 명확히 잘못된 것으로 정의

---

## Stylelint 수준

사용자가 직접 방향을 제안: "경고를 보내고 권장하는 방향을 표시해줘"

**User's choice:** 경고(warning) + 올바른 패턴 권장 안내
**Notes:** 빌드 차단하지 않되, 규칙을 명확히 알려주는 교육적 방식. 팀 적응 후 에러 전환 가능.

---

## AI 지시문

| Option | Description | Selected |
|--------|-------------|----------|
| CLAUDE.md + 스킬 | CLAUDE.md에 핵심 요약 + 별도 스킬 파일에 상세 | |
| CLAUDE.md만 | 프로젝트 CLAUDE.md에 모든 규칙 직접 작성 | ✓ |
| 스킬 파일만 | .claude/skills/에 전용 스킬로 분리 | |

**User's choice:** CLAUDE.md만
**Notes:** 별도 스킬 없이 CLAUDE.md 하나로 통합

---

## Claude's Discretion

- Stylelint 플러그인 및 설정 구체값
- BEM do/don't 예제 케이스 선정
- CLAUDE.md 섹션 구성
- SCSS BEM 중첩 작성 패턴 예제

## Deferred Ideas

- Stylelint 에러 수준 전환 — 팀 적응 후
- Prettier/ESLint 통합 — 현재 범위 외
