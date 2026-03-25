# Roadmap: INFOMIND UX 디자인/퍼블리싱 가이드 시스템

## Overview

디자인 토큰과 SCSS 아키텍처를 기반으로 시작하여, BEM 컨벤션을 확립하고, 그 위에 접근성을 내장한 컴포넌트를 쌓은 뒤, 접근성 검증을 거쳐, 최종적으로 문서 사이트와 온보딩 패키지로 팀에 배포한다. 각 단계의 결과물이 다음 단계의 재료가 되는 순차 구조이며, 모든 산출물은 AI(Claude) 지시문으로 즉시 활용 가능한 형태를 병행 제공한다.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation -- Design Tokens + SCSS Architecture** - Style Dictionary 파이프라인과 ITCSS 기반 SCSS 구조를 구축하여 모든 스타일링의 기반을 확립
- [ ] **Phase 2: Conventions -- BEM + Linting** - BEM 네이밍 규칙을 명확히 정의하고 Stylelint으로 자동 강제하여 일관된 코드 품질 보장
- [ ] **Phase 3: Components -- HTML+SCSS Snippets** - 핵심 UI 컴포넌트를 BEM+접근성 내장 형태로 구축하고 AI가 바로 활용 가능한 스니펫 제공
- [ ] **Phase 4: Accessibility -- Checklist + Validation** - KWCAG/WCAG AA 체크리스트를 완성하고 pa11y-ci로 자동 검증 체계 구축
- [ ] **Phase 5: Documentation Site** - Eleventy 기반 문서 사이트에서 컴포넌트 미리보기, 가이드, 검색을 제공
- [ ] **Phase 6: Rollout -- Handoff + Onboarding** - 피그마 핸드오프 규칙, 온보딩 가이드, 프로젝트 스타터 킷으로 팀 배포 완료

## Phase Details

### Phase 1: Foundation -- Design Tokens + SCSS Architecture
**Goal**: 프로젝트에서 사용하는 모든 디자인 값(색상, 타이포, 간격, 그리드 등)이 토큰으로 정의되고, SCSS 아키텍처가 확립되어 어떤 파일에 무엇을 넣는지 명확한 상태
**Depends on**: Nothing (first phase)
**Requirements**: TOKEN-01, TOKEN-02, TOKEN-03, TOKEN-04, TOKEN-05, TOKEN-06, TOKEN-07, SCSS-01, SCSS-02, SCSS-03, SCSS-04, SCSS-05, SCSS-06
**Success Criteria** (what must be TRUE):
  1. SCSS 파일에서 :root 블록으로 CSS Custom Properties 토큰이 정의되고, 변수 하나를 변경하면 빌드 결과에 반영된다
  2. ITCSS 레이어별 폴더(settings/tools/generic/elements/objects/components/utilities)가 존재하고, 각 폴더에 해당 파일이 올바르게 배치되어 있다
  3. 색상 팔레트, 타입 스케일, 간격 미리보기를 보여주는 플레이그라운드 HTML 페이지가 렌더링된다
  4. 기존 믹스인(flex, fsize, ellipse 등)이 새 구조에 포팅되어 정상 동작한다
  5. 브레이크포인트 믹스인으로 반응형 미디어 쿼리를 작성할 수 있다
**Plans**: 3 plans

Plans:
- [x] 01-01-PLAN.md — ITCSS 폴더 구조 + 디자인 토큰 + normalize + base 스타일 + 빌드 파이프라인
- [x] 01-02-PLAN.md — 현대화된 믹스인 + 반응형 시스템 + Container/Grid 레이아웃 오브젝트
- [x] 01-03-PLAN.md — 토큰 시각화 플레이그라운드 + SCSS 구조 가이드 문서

### Phase 2: Conventions -- BEM + Linting
**Goal**: BEM 네이밍 규칙이 명확히 문서화되고 Stylelint으로 자동 강제되어, 기존의 느슨한 하이픈 네이밍 대신 일관된 Block__Element--Modifier 패턴이 적용되는 상태
**Depends on**: Phase 1
**Requirements**: BEM-01, BEM-02, BEM-03, BEM-04, AI-03
**Success Criteria** (what must be TRUE):
  1. BEM 가이드 문서에 올바른 패턴과 잘못된 패턴(do/don't)이 기존 프로젝트 실제 예시와 함께 제시되어 있다
  2. `.stylelintrc` 설정으로 BEM 위반 코드를 린트하면 경고가 발생한다
  3. SCSS에서 `&__element`, `&--modifier` 중첩 패턴 가이드가 예제 코드와 함께 존재한다
  4. 디자인 토큰과 BEM 규칙이 CLAUDE.md / 스킬 파일 형태의 AI 지시문으로 제공되어, AI에게 주면 즉시 규칙대로 코드를 생성한다
**Plans**: 2 plans

Plans:
- [x] 02-01-PLAN.md — Stylelint BEM 린팅 환경 구축 + BEM 가이드 문서 작성
- [x] 02-02-PLAN.md — CLAUDE.md Phase 1~2 통합 AI 지시문 업데이트

### Phase 3: Components -- HTML+SCSS Snippets
**Goal**: 팀에서 반복 사용하는 핵심 UI 컴포넌트(버튼, 폼, 카드, 테이블, 모달, 탭, 페이지네이션, 브레드크럼)가 BEM+접근성 내장 형태로 완성되고, AI와 사람 모두 바로 복사해서 사용 가능한 상태
**Depends on**: Phase 2
**Requirements**: COMP-01, COMP-02, COMP-03, COMP-04, COMP-05, COMP-06, COMP-07, COMP-08, COMP-09, COMP-10, COMP-11, AI-02
**Success Criteria** (what must be TRUE):
  1. 8개 핵심 컴포넌트(버튼, 폼, 카드, 테이블, 모달, 탭, 페이지네이션, 브레드크럼) 각각의 HTML+SCSS 스니펫이 존재하고 브라우저에서 정상 렌더링된다
  2. HTML 페이지 보일러플레이트(lang="ko", viewport, skip-to-content, 시맨틱 구조)가 새 페이지 시작 템플릿으로 동작한다
  3. 모든 컴포넌트가 KRDS 공공 디자인시스템 가이드라인을 준수한다 (role, aria-*, 키보드 네비게이션 포함)
  4. 각 컴포넌트 옆에 라이브 미리보기(렌더링 결과)가 코드와 함께 표시된다
  5. 컴포넌트 스니펫을 AI에게 전달하면 규칙대로 변형된 코드를 생성할 수 있는 포맷이다
**Plans**: 4 plans
**UI hint**: yes

Plans:
- [x] 03-01-PLAN.md — 인프라 준비 + HTML 보일러플레이트 + 버튼 컴포넌트
- [x] 03-02-PLAN.md — 폼, 카드, 테이블, 브레드크럼, 페이지네이션 컴포넌트 (SCSS + Playground)
- [x] 03-03-PLAN.md — 모달, 탭 컴포넌트 (SCSS + 바닐라 JS + Playground)
- [ ] 03-04-PLAN.md — AI 스니펫 파일 + CLAUDE.md 업데이트

### Phase 4: Accessibility -- Checklist + Validation
**Goal**: KWCAG/WCAG 2.1 AA 퍼블리싱 체크리스트가 완성되고, pa11y-ci 자동 테스트로 기존 컴포넌트가 검증된 상태
**Depends on**: Phase 3
**Requirements**: A11Y-01, A11Y-02, A11Y-03, A11Y-04, A11Y-05, A11Y-06
**Success Criteria** (what must be TRUE):
  1. KWCAG 2.2 확대 항목(33개 검사항목) 포함 퍼블리싱 체크리스트가 체크 가능한 항목별 목록으로 존재한다
  2. pa11y-ci를 실행하면 Phase 3에서 만든 컴포넌트 페이지들이 자동 검사되고 결과 리포트가 출력된다
  3. 컴포넌트별 접근성 패턴(aria-*, role, tabindex, 키보드 네비게이션)이 가이드에 정리되어 있다
  4. .sr-only 패턴과 색상 대비 가이드(4.5:1 이상)가 예제와 함께 문서화되어 있다
**Plans**: TBD

Plans:
- [ ] 04-01: TBD
- [ ] 04-02: TBD

### Phase 5: Documentation Site
**Goal**: Eleventy 기반 정적 문서 사이트에서 토큰, 컨벤션, 컴포넌트, 접근성 가이드를 한곳에서 열람하고 검색할 수 있으며, 문서 사이트 자체도 접근성을 준수하는 상태
**Depends on**: Phase 4
**Requirements**: DOCS-01, DOCS-02, DOCS-03, DOCS-04, DOCS-05, DOCS-06, AI-01
**Success Criteria** (what must be TRUE):
  1. `npm run build`로 Eleventy 정적 사이트가 빌드되고 브라우저에서 열린다
  2. 컴포넌트 페이지에서 라이브 미리보기와 코드 예제가 나란히 표시되고, 코드 복사(copy-to-clipboard) 버튼이 동작한다
  3. 문서 내 검색(pagefind 등)으로 토큰명, 컴포넌트명, 가이드 키워드를 찾을 수 있다
  4. 문서 사이트 자체가 pa11y-ci 검사를 통과한다 (KWCAG/WCAG AA)
  5. 모든 가이드 문서가 CLAUDE.md / 스킬 파일 형태로도 제공되어 AI 프롬프트에 즉시 주입 가능하다
**Plans**: TBD
**UI hint**: yes

Plans:
- [ ] 05-01: TBD
- [ ] 05-02: TBD
- [ ] 05-03: TBD

### Phase 6: Rollout -- Handoff + Onboarding
**Goal**: 신규 팀원이 가이드를 보고 바로 프로젝트를 시작할 수 있고, 디자이너-퍼블리셔 간 핸드오프 규칙이 명확하며, 스타터 킷으로 새 프로젝트를 즉시 셋업할 수 있는 상태
**Depends on**: Phase 5
**Requirements**: HAND-01, HAND-02, HAND-03
**Success Criteria** (what must be TRUE):
  1. 신규 팀원 온보딩 가이드를 따라가면 가이드 시스템의 구조와 사용법을 파악할 수 있다
  2. 피그마 컴포넌트 네이밍과 코드 클래스명의 매핑 규칙, 핸드오프 시 전달 항목이 문서화되어 있다
  3. 스타터 킷(SCSS+HTML 보일러플레이트)을 다운로드/설치하면 토큰, 믹스인, 레이아웃이 포함된 새 프로젝트가 즉시 시작된다
**Plans**: TBD

Plans:
- [ ] 06-01: TBD
- [ ] 06-02: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 0/3 | Not started | - |
| 2. Conventions | 0/2 | Not started | - |
| 3. Components | 0/4 | Not started | - |
| 4. Accessibility | 0/2 | Not started | - |
| 5. Documentation Site | 0/3 | Not started | - |
| 6. Rollout | 0/2 | Not started | - |
