# Phase 5: Documentation Site - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-26
**Phase:** 05-documentation-site
**Areas discussed:** 사이트 구조/네비게이션, 컴포넌트 미리보기 방식, 디자인/레이아웃, AI 문서 포맷

---

## 사이트 구조/네비게이션

### 메인 섹션 구조

| Option | Description | Selected |
|--------|-------------|----------|
| 4섹션 + 검색 | 토큰/컨벤션/컴포넌트/접근성 + pagefind | ✓ |
| 3섹션 통합 | 디자인/컴포넌트/접근성 | |
| 플랫 구조 | 모든 페이지 같은 레벨 | |

**User's choice:** 4섹션 + 검색

### 네비게이션 스타일

| Option | Description | Selected |
|--------|-------------|----------|
| 왼쪽 사이드바 | 데스크탑 고정, 모바일 햄버거 | |
| 상단 탭 | 대섹션 상단 탭, 하위 본문 링크 | |
| Claude에게 맡기기 | 문서 사이트 표준 패턴으로 자유 구성 | ✓ |

**User's choice:** Claude에게 맡기기

---

## 컴포넌트 미리보기 방식

### 미리보기 구현

| Option | Description | Selected |
|--------|-------------|----------|
| iframe 임베드 | playground HTML iframe 로드 | |
| Nunjucks 매크로 재구성 | 매크로로 재작성 직접 렌더링 | |
| Claude에게 맡기기 | 최적의 방법으로 구현 | ✓ |

**User's choice:** Claude에게 맡기기

### 코드 복사 버튼

| Option | Description | Selected |
|--------|-------------|----------|
| 코드 블록 우측 상단 | clipboard.js, "복사됨" 피드백 | ✓ |
| Claude에게 맡기기 | 적절한 위치에 배치 | |

**User's choice:** 코드 블록 우측 상단

---

## 디자인/레이아웃

### 스타일링 방향

| Option | Description | Selected |
|--------|-------------|----------|
| 미니말 + 토큰 기반 | 프로젝트 토큰 적용, 콘텐츠 중심 | ✓ |
| 독립적 디자인 | 문서 사이트 전용 스타일 별도 작성 | |
| Claude에게 맡기기 | 토큰 기반으로 자유 구성 | |

**User's choice:** 미니말 + 토큰 기반

### 모바일 대응

| Option | Description | Selected |
|--------|-------------|----------|
| 기본 반응형 | respond-to() 활용, 모바일 햄버거+1열 | ✓ |
| 데스크탑 전용 | 모바일 대응 생략 | |
| Claude에게 맡기기 | 적절한 수준으로 구현 | |

**User's choice:** 기본 반응형

---

## AI 문서 포맷

| Option | Description | Selected |
|--------|-------------|----------|
| CLAUDE.md 확장 | 접근성 가이드 경로 추가, 단일 파일 AI 지시문 | ✓ |
| 별도 스킬 파일 | .claude/skills/에 주제별 스킬 파일 | |
| Claude에게 맡기기 | 최적 형태로 구성 | |

**User's choice:** CLAUDE.md 확장

---

## Claude's Discretion

- Eleventy 디렉토리 구조 및 설정
- Nunjucks 템플릿 상속 구조
- pagefind 설정 및 통합 방식
- Prism.js 테마 선택
- 컴포넌트 미리보기 구체적 구현 방식
- 네비게이션 UI 패턴
- 문서 사이트 전용 SCSS 구조

## Deferred Ideas

- 버전 관리 (토큰/컴포넌트 변경 이력)
- 검색 고도화 (필터, 카테고리별)
- 문서 기여 가이드
