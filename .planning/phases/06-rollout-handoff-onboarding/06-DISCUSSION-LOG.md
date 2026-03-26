# Phase 6: Rollout — Handoff + Onboarding - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-26
**Phase:** 06-rollout-handoff-onboarding
**Areas discussed:** 논의 범위, 스타터 킷 배포 방식

---

## 논의 범위 선택

| Option | Description | Selected |
|--------|-------------|----------|
| 온보딩 가이드 구조 | 문서 형태, 안내 범위, 튜토리얼 깊이 | |
| 피그마→코드 핸드오프 규칙 | 네이밍 매핑, 전달 항목, 토큰 연결 | |
| 스타터 킷 범위 | 포함 파일, 배포 방식 | |
| 전부 Claude에게 맡김 | 3개 요구사항 모두 Claude 재량 | ✓ |

**User's choice:** 전부 Claude에게 맡김
**Notes:** Phase 1~5 산출물이 명확하므로 Claude가 최적 판단하여 진행

---

## 스타터 킷 배포 방식

| Option | Description | Selected |
|--------|-------------|----------|
| zip 다운로드 | 문서 사이트에서 zip 파일 다운로드 링크 제공 | |
| git clone 템플릿 | 별도 Git 저장소 또는 브랜치에서 clone | ✓ |
| npm init 패키지 | npm create 명령으로 프로젝트 생성 | |

**User's choice:** git clone 템플릿
**Notes:** 버전 관리 용이, 팀 내부 Git 서버 활용 가능

---

## Claude's Discretion

- 온보딩 가이드 세부 목차/깊이
- 핸드오프 체크리스트 세부 항목
- 스타터 킷 디렉토리 구조

## Deferred Ideas

None
