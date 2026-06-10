---
title: AI 에이전트 규칙 준수 전략
order: 5
---

infoUX의 AI 하네스는 위반을 사후 검출하는 도구가 아니라, 에이전트가 처음부터 팀의 방식으로 판단하고 구현하도록 유도하는 작업 시스템이어야 한다.

## 목표

- 작업 시작 전에 사이트 유형과 적용 규칙을 확정한다.
- 전체 규칙을 한 번에 주입하지 않고 현재 파일과 작업에 필요한 규칙만 제공한다.
- 에이전트가 새 패턴을 임의로 만들기보다 승인된 컴포넌트와 레시피를 조합하게 한다.
- 검사 실패 시 오류 보고에서 끝내지 않고 올바른 레시피로 수정하도록 연결한다.
- Claude Code, Codex, Cursor, Copilot 등 도구별 계약이 서로 어긋나지 않게 한다.

검사는 마지막 안전망으로 유지하되, 핵심 품질 지표는 **첫 생성 결과의 규칙 준수율**로 전환한다.

## 현재 구조의 문제

### 1. 공통 계약이 너무 길다

루트 `AGENTS.md`, `CLAUDE.md`, `skill/SKILL.md`, `prompts/context.md`가 상당 부분 같은 내용을 반복한다. 에이전트가 모든 규칙을 읽더라도 현재 작업과 관계없는 정보가 많아 핵심 지시의 주의도가 낮아진다.

### 2. 경로별 규칙이 없다

토큰, CSS, HTML 스니펫, 문서 예시는 작업 목적과 허용 범위가 다르지만 동일한 공통 계약을 받는다. 그 결과 문서용 예외가 제품 코드에 섞이거나, 토큰 변경의 영향 범위를 놓칠 수 있다.

### 3. 도구별 스킬이 서로 다르다

`.agents/skills`와 `.claude/skills`가 별도로 관리되어 일부 Claude 스킬에는 현재 금지된 SCSS, raw 색상, 과거 디렉터리 구조가 남아 있다. 단일 소스가 아니므로 에이전트마다 다른 결과를 낼 수 있다.

### 4. 규칙은 많지만 생성 경로가 부족하다

현재 계약은 금지와 검증 항목은 상세하지만, 페이지·폼·검색 목록·탭·모달 같은 작업을 어떤 승인 패턴으로 조합해야 하는지에 대한 실행 레시피가 부족하다.

## 목표 구조

### 1. 짧은 Constitution

루트 계약은 모든 작업에 항상 필요한 불변 규칙과 라우팅만 둔다.

- 접근성 우선순위
- 사이트 유형 선판정
- 시맨틱 색상 토큰
- 시맨틱 HTML과 필수 ARIA
- 승인 컴포넌트 우선 재사용
- 작업별 스킬과 경로별 계약을 읽는 순서

세부 규칙, 예시, 검사 설명은 루트에서 제거하고 하위 계약과 스킬로 이동한다. GitHub Copilot Code Review가 사용자 지정 지시의 앞부분만 제한적으로 읽는 환경도 고려해 공통 계약은 약 4,000자 이내를 목표로 한다.

### 2. 경로별 계약

가장 가까운 계약이 현재 작업을 구체화하도록 구성한다.

| 경로 | 담당 규칙 |
|------|----------|
| `tokens/AGENTS.md` | 토큰 명명, 변경 영향, 빌드 산출물 |
| `src/styles/AGENTS.md` | ITCSS, Tailwind v4, nesting, BEM, 상태 표현 |
| `src/snippets/AGENTS.md` | Page shell, section 구조, 시맨틱 HTML, ARIA |
| `site/AGENTS.md` | 문서 예시와 제품 코드의 구분 |
| `scripts/AGENTS.md` | 검사기 작성 원칙과 false positive 방지 |

Copilot에는 같은 내용을 `.github/instructions/*.instructions.md`의 `applyTo` glob으로 발행한다.

### 3. 작업별 스킬

에이전트가 작업명을 보고 적절한 절차를 자동 선택하도록 스킬을 세분화한다.

| 스킬 | 역할 |
|------|------|
| `design-page` | 사이트 유형, Page shell, section 아키타입 결정 |
| `create-component` | 기존 컴포넌트 검색, 변형 범위, 신규 등록 판단 |
| `design-form` | label, 오류, 도움말, 검증 상태, 제출 흐름 |
| `design-widget` | APG 패턴, 키보드, 상태 모델, ARIA 결정 |
| `change-token` | foundation/semantic/component 영향 추적 |
| `review-ui` | 구현 의도와 승인 레시피의 차이 검토 |

각 스킬은 전체 참고 문서를 읽지 않고 관련 참조 2~3개만 점진적으로 로드한다.

### 4. 구현 전 Task Contract

UI 코드를 작성하기 전에 다음 항목을 짧게 확정한다.

```yaml
profile: public-service
primary_task: 민원 신청 상태 확인
page_pattern: search-and-result
reuse:
  - search-form
  - data-list
interactive:
  - disclosure
tokens:
  - semantic-only
exceptions: []
```

필수 항목:

1. 사이트 유형
2. 사용자의 주 작업
3. 페이지/section 패턴
4. 재사용할 기존 컴포넌트
5. 인터랙티브 위젯과 접근성 패턴
6. 토큰 및 허용 variant
7. 예외와 미확정 사항

Task Contract가 비어 있으면 생성 스킬은 구현 단계로 넘어가지 않는다. 단순 수정은 대화 내 짧은 선언으로, 큰 작업은 파일로 남긴다.

### 5. 승인 레시피

규칙 설명보다 복사·조합 가능한 정상 경로를 우선 제공한다.

- 프로젝트 유형별 Page shell
- hero/content/feature/contact 등 section 아키타입
- 검색 + 결과, 필터 + 목록, 상세 + 주요 행동
- 입력폼, 오류 요약, 빈 상태, 로딩 상태
- modal, tab, accordion, disclosure의 상태 모델

각 레시피에는 `언제 사용`, `사용하지 않을 때`, `필수 속성`, `허용 variant`, `키보드 동작`을 함께 둔다. 에이전트는 새 block을 만들기 전에 레시피와 카탈로그를 먼저 검색한다.

### 6. 결정표

긴 설명을 에이전트가 매번 해석하지 않도록 반복 판단을 구조화한다.

- 사이트 유형 → Page shell과 조건부 공공 요소
- 사용자 의도 → 페이지/section 패턴
- UI 상태 → BEM modifier + ARIA 속성
- 시각적 요구 → semantic token
- 새 요구 → 기존 조합 / 프로젝트 패턴 / 공통 컴포넌트 후보

결정표는 JSON/YAML 단일 소스로 관리하고 문서와 스킬에 필요한 형태로 발행한다.

### 7. 단일 소스 배포

`AGENTS.md`, `CLAUDE.md`, `.github/instructions`, `.agents/skills`, `.claude/skills`, starter 계약은 직접 복제하지 않는다.

```text
contracts/
  constitution.md
  scopes/*.md
  tasks/*.yaml
  recipes/*.yaml
        ↓ build
AGENTS.md / CLAUDE.md / Copilot instructions / skills / starter
```

빌드는 도구 문법만 변환하고 의미는 동일하게 유지한다. 현재의 drift 검사는 이 생성 구조가 깨졌을 때만 동작하는 최종 안전망으로 둔다.

## 실행 순서

### P0. 상충 제거

1. `.claude/skills`의 SCSS·raw 색상·과거 경로 지시를 즉시 폐기한다.
2. `.agents/skills`와 `.claude/skills`를 하나의 원본에서 생성한다.
3. UI 작업은 트리거 문구 없이 자동으로 infoUX 계약을 적용하게 한다.
4. 루트 계약을 불변 규칙과 라우팅 중심으로 축약한다.

### P1. 예방형 생성 경로

1. Task Contract 템플릿과 스키마를 추가한다.
2. 경로별 `AGENTS.md`와 Copilot `applyTo` 지시를 추가한다.
3. `design-page`, `design-form`, `design-widget`, `change-token` 스킬을 만든다.
4. 자주 쓰는 페이지·폼·위젯의 승인 레시피를 구축한다.

### P2. 단일 소스화

1. constitution, scope, task, recipe 원본 구조를 만든다.
2. 에이전트별 계약 생성기를 추가한다.
3. starter 배포도 같은 원본에서 생성한다.
4. 수동 복사본을 제거한다.

### P3. 효과 측정

대표 작업 프롬프트 15~20개를 고정 평가 세트로 운영한다.

- 첫 생성 규칙 준수율 90% 이상
- 사이트 유형 선판정 100%
- 기존 컴포넌트 재사용률 80% 이상
- 승인 없는 신규 공통 block 0건
- 상충하는 도구별 계약 0건
- 작업당 로드되는 지시문 분량 50% 이상 감소
- 검사 후 수정 횟수보다 생성 전 올바른 선택 비율을 우선 측정

## 최신 패턴 반영 근거

- [AGENTS.md](https://agents.md/)는 저장소 전역 계약과 가장 가까운 경로의 계약을 조합하는 방식을 권장한다.
- [GitHub Copilot repository instructions](https://docs.github.com/copilot/customizing-copilot/adding-custom-instructions-for-github-copilot)은 저장소 공통 지시와 `applyTo` 기반 경로별 지시를 구분한다.
- [GitHub Copilot custom instructions support](https://docs.github.com/en/copilot/reference/custom-instructions-support)는 도구와 기능별 지시 파일 지원 범위가 다름을 보여준다.
- [Claude Code Skills](https://docs.anthropic.com/en/docs/claude-code/skills)는 반복 절차를 스킬로 분리하고 필요한 시점에만 본문을 로드하는 점진적 공개 방식을 사용한다.
- [GitHub Spec Kit](https://github.com/github/spec-kit)은 constitution → specification → plan → tasks → implementation 순서로 구현 전에 의도와 제약을 고정한다.

## 원칙

검사기는 규칙 준수의 주체가 아니다. 규칙 준수는 에이전트가 **작업을 분류하고, 승인된 경로를 선택하고, 필요한 컨텍스트만 받아 구현하는 과정**에서 만들어져야 한다. 검사기는 그 과정이 실패했을 때 배포를 막는 마지막 장치다.
