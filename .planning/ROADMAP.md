# Roadmap: INFOMIND UX 디자인/퍼블리싱 가이드 시스템

## Milestones

- [x] **v0.8 Foundation** - Phases 1-6 (complete)
- [x] **v0.9 디자인 컨벤션 + 프로세스 강화** - Phases 7-11 (complete)
- [x] **v0.9.5 리뷰 기반 품질 강화** - Phases 12-13 (complete)
- [x] **v1.0 AI 범용 프롬프트 시스템** - Phases 14-15 (complete)
- [x] **v1.1 시스템 고도화** - Phases 16-18 (complete)
- [x] **v1.2 디자인 역량 강화** - Phases 19-20 (complete)
- [x] **v1.3 핵심 경화** - Phases 21-22 (complete)
- [x] **v1.4 콘텐츠 정제 + 사이트 디자인 고도화** - Phases 23-24 (complete)
- [ ] **v1.5 컴포넌트 실질 품질 강화** - Phases 25-27 (in progress)

## Phases

<details>
<summary>v0.8 Foundation (Phases 1-6) - COMPLETE</summary>

- [x] **Phase 1: Foundation -- Design Tokens + SCSS Architecture** - 토큰 체계, ITCSS 구조, 믹스인, 반응형
- [x] **Phase 2: Conventions -- BEM + Linting** - BEM 네이밍 가이드, Stylelint 설정
- [x] **Phase 3: Components -- HTML+SCSS Snippets** - 8개 UI 컴포넌트 HTML+SCSS 스니펫
- [x] **Phase 4: Accessibility -- Checklist + Validation** - KWCAG/WCAG AA 체크리스트, pa11y-ci 연동
- [x] **Phase 5: Documentation Site** - Eleventy 기반 가이드 사이트 구축
- [x] **Phase 6: Rollout -- Handoff + Onboarding** - 신규 팀원 가이드, 프로젝트 보일러플레이트

</details>

<details>
<summary>v0.9 디자인 컨벤션 + 프로세스 강화 (Phases 7-11) - COMPLETE</summary>

- [x] **Phase 7: 피그마 컨벤션** - 컴포넌트 네이밍, 레이어 구조, Variable, Auto Layout 규칙
- [x] **Phase 8: 디자인 QA + 핸드오프 품질** - QA 체크리스트, 픽셀 퍼펙트 허용 범위
- [x] **Phase 9: 퍼블리싱 심화 가이드** - 시맨틱 HTML, 이미지 처리, CSS 성능, 애니메이션
- [x] **Phase 10: 테스트 가이드** - 크로스 브라우저, 모바일/터치, CSS 회귀 테스트
- [x] **Phase 11: 거버넌스 + 버전 관리** - 컴포넌트 라이프사이클, 버전 정책, 기여 가이드

</details>

<details>
<summary>v0.9.5 리뷰 기반 품질 강화 (Phases 12-13) - COMPLETE</summary>

- [x] **Phase 12: 코드 품질 수정** - SCSS 버그 수정 + pa11yci 누락 URL 추가
- [x] **Phase 13: 사이트 UX + 온보딩 개선** - 홈페이지 완성, 페이지 네비게이션, 상호 링크, README 개선

</details>

<details>
<summary>v1.0 AI 범용 프롬프트 시스템 (Phases 14-15) - COMPLETE</summary>

- [x] **Phase 14: 프롬프트 파일 생성** - 6개 AI 프롬프트 마크다운 파일 작성 (prompts/ 디렉토리)
- [x] **Phase 15: 문서 사이트 프롬프트 통합** - site/prompts/ 섹션, 사용 가이드, 복사 기능

</details>

<details>
<summary>v1.1 시스템 고도화 (Phases 16-18) - COMPLETE</summary>

- [x] **Phase 16: 토큰 파이프라인** - tokens.json 싱글 소스 + SCSS/프롬프트 자동 생성 스크립트
- [x] **Phase 17: 컴포넌트 조합 패턴** - 실전 레이아웃 예제 3종 + 문서 사이트 조합 패턴 페이지
- [x] **Phase 18: 빌드 통합** - npm run build 전체 파이프라인 + 프롬프트 자동 재생성

</details>

<details>
<summary>v1.2 디자인 역량 강화 (Phases 19-20) - COMPLETE</summary>

- [x] **Phase 19: 디자인 가이드 콘텐츠** - info-design 스킬 기반 6개 디자인 가이드 마크다운 문서 생성
- [x] **Phase 20: 문서 사이트 통합** - site/design/ 섹션 네비게이션, pa11yci, info-design 스킬 역갱신

</details>

<details>
<summary>v1.3 핵심 경화 (Phases 21-22) - COMPLETE</summary>

- [x] **Phase 21: 빌드 + 인프라 경화** - .gitignore, worktree 정리, serve 핫리로드, npm test, starter 실증
- [x] **Phase 22: 콘텐츠 감사 + 보강** - 71페이지 스캔, 얇은 페이지 보강

</details>

<details>
<summary>v1.4 콘텐츠 정제 + 사이트 디자인 고도화 (Phases 23-24) - COMPLETE</summary>

- [x] **Phase 23: 콘텐츠 재작성** - 감사에서 발견된 약한 콘텐츠 3건(aesthetics, icon-system, css-animation) 재작성
- [x] **Phase 24: 사이트 디자인 고도화** - 사이드바 아코디언, 타이포/여백, 코드 블록, 컴포넌트 미리보기 시각 개선

</details>

### v1.5 컴포넌트 실질 품질 강화

- [ ] **Phase 25: 접근성 수정 + 토큰 정합** - 터치 타겟/간격 수정, prefers-reduced-motion 적용, 포커스 링 통일, 토큰 값 정합
- [ ] **Phase 26: SCSS 현대화** - 반응형 패딩 차등 적용, 인터랙션 애니메이션, 폰트/여백 사이즈 확대
- [ ] **Phase 27: 문서/플레이그라운드 동기화** - playground HTML 반영 + 문서/프롬프트/스니펫 역갱신

## Phase Details

<details>
<summary>v0.8 Phase Details (Complete)</summary>

### Phase 1: Foundation -- Design Tokens + SCSS Architecture
**Goal**: ITCSS 기반 SCSS 구조와 디자인 토큰 체계가 갖춰져 모든 후속 작업의 기반이 된다
**Depends on**: Nothing
**Requirements**: TOKEN-01, TOKEN-02, TOKEN-03, TOKEN-04, TOKEN-05, TOKEN-06, TOKEN-07, SCSS-01, SCSS-02, SCSS-03, SCSS-04, SCSS-05, SCSS-06
**Status**: Complete

### Phase 2: Conventions -- BEM + Linting
**Goal**: BEM 네이밍 규칙과 자동 린팅으로 코드 일관성이 보장된다
**Depends on**: Phase 1
**Requirements**: BEM-01, BEM-02, BEM-03, BEM-04, AI-03
**Status**: Complete

### Phase 3: Components -- HTML+SCSS Snippets
**Goal**: 8개 공통 컴포넌트의 HTML+SCSS 스니펫이 즉시 사용 가능하다
**Depends on**: Phase 2
**Requirements**: COMP-01, COMP-02, COMP-03, COMP-04, COMP-05, COMP-06, COMP-07, COMP-08, COMP-09, COMP-10, COMP-11, AI-02
**Status**: Complete

### Phase 4: Accessibility -- Checklist + Validation
**Goal**: KWCAG/WCAG AA 준수를 위한 체크리스트와 자동 테스트가 갖춰진다
**Depends on**: Phase 3
**Requirements**: A11Y-01, A11Y-02, A11Y-03, A11Y-04, A11Y-05, A11Y-06
**Status**: Complete

### Phase 5: Documentation Site
**Goal**: 모든 가이드와 컴포넌트를 탐색 가능한 웹사이트로 제공한다
**Depends on**: Phase 4
**Requirements**: DOCS-01, DOCS-02, DOCS-03, DOCS-04, DOCS-05, DOCS-06, AI-01
**Status**: Complete

### Phase 6: Rollout -- Handoff + Onboarding
**Goal**: 신규 팀원이 가이드 시스템을 이해하고 프로젝트에 즉시 적용할 수 있다
**Depends on**: Phase 5
**Requirements**: HAND-01, HAND-02, HAND-03
**Status**: Complete

</details>

<details>
<summary>v0.9 Phase Details (Complete)</summary>

### Phase 7: 피그마 컨벤션
**Goal**: 디자이너가 피그마에서 작업할 때 따라야 할 네이밍/구조/토큰 규칙이 문서화되어 있다
**Depends on**: Nothing (v0.9 첫 페이즈, v0.8 문서 사이트 위에 페이지 추가)
**Requirements**: FIG-01, FIG-02, FIG-03, FIG-04
**Status**: Complete

### Phase 8: 디자인 QA + 핸드오프 품질
**Goal**: 디자이너가 핸드오프 전 자체 점검할 수 있는 체크리스트와 퍼블리셔와의 허용 오차 기준이 합의되어 있다
**Depends on**: Phase 7
**Requirements**: DQA-01, DQA-02
**Status**: Complete

### Phase 9: 퍼블리싱 심화 가이드
**Goal**: 퍼블리셔가 시맨틱 마크업, 이미지 최적화, CSS 성능, 애니메이션에 대한 팀 규칙을 참조할 수 있다
**Depends on**: Nothing (v0.8 완료 기반, Phase 7-8과 독립)
**Requirements**: PUB-01, PUB-02, PUB-03, PUB-04
**Status**: Complete

### Phase 10: 테스트 가이드
**Goal**: 팀이 크로스 브라우저/디바이스 테스트와 CSS 회귀 테스트를 체계적으로 수행할 수 있다
**Depends on**: Phase 9
**Requirements**: TEST-01, TEST-02, TEST-03
**Status**: Complete

### Phase 11: 거버넌스 + 버전 관리
**Goal**: 가이드 시스템의 성장/변경을 관리하는 프로세스가 확립되어 있다
**Depends on**: Phase 7, Phase 9
**Requirements**: GOV-01, GOV-02, GOV-03, GOV-04
**Status**: Complete

</details>

<details>
<summary>v0.9.5 Phase Details (Complete)</summary>

### Phase 12: 코드 품질 수정
**Goal**: PR 리뷰에서 발견된 SCSS 버그가 수정되고, pa11yci가 모든 문서 페이지를 커버한다
**Depends on**: Phase 11
**Requirements**: FIX-01, FIX-02, FIX-03, A11FIX-01
**Status**: Complete

### Phase 13: 사이트 UX + 온보딩 개선
**Goal**: 문서 사이트의 탐색 경험이 완성되고, 신규 퍼블리셔가 README만으로 프로젝트를 시작할 수 있다
**Depends on**: Phase 12
**Requirements**: SITE-01, SITE-02, SITE-03, ONBOARD-01
**Status**: Complete

</details>

<details>
<summary>v1.0 Phase Details (Complete)</summary>

### Phase 14: 프롬프트 파일 생성
**Goal**: 팀의 디자인/퍼블리싱 규칙이 6개 AI 프롬프트 파일로 체계화되어, 어떤 AI 도구에든 즉시 주입 가능하다
**Depends on**: Phase 13 (기존 가이드 문서, 토큰, 컴포넌트, 접근성 규칙이 모두 완성된 상태)
**Requirements**: PROMPT-D01, PROMPT-D02, PROMPT-P01, PROMPT-P02, PROMPT-C01, PROMPT-C02
**Status**: Complete

### Phase 15: 문서 사이트 프롬프트 통합
**Goal**: 사용자가 문서 사이트에서 프롬프트를 열람하고, 용도에 맞는 프롬프트를 복사하여 AI 도구에 바로 붙여넣을 수 있다
**Depends on**: Phase 14
**Requirements**: PROMPT-SITE01, PROMPT-SITE02
**Status**: Complete

</details>

<details>
<summary>v1.1 Phase Details (Complete)</summary>

### Phase 16: 토큰 파이프라인
**Goal**: 토큰이 tokens.json 하나에서 관리되고, SCSS 변수와 AI 프롬프트가 스크립트 한 번으로 자동 생성된다
**Depends on**: Phase 15
**Requirements**: PIPE-01, PIPE-02, PIPE-03
**Status**: Complete

### Phase 17: 컴포넌트 조합 패턴
**Goal**: 개별 컴포넌트를 조합한 실전 레이아웃 예제가 playground와 문서 사이트에서 확인 가능하다
**Depends on**: Phase 15
**Requirements**: COMBO-01, COMBO-02
**Status**: Complete

### Phase 18: 빌드 통합
**Goal**: `npm run build` 한 명령으로 토큰 생성부터 SCSS 컴파일, 프롬프트 재생성, 문서 사이트 빌드까지 전체 파이프라인이 실행된다
**Depends on**: Phase 16
**Requirements**: BUILD-01, BUILD-02
**Status**: Complete

</details>

<details>
<summary>v1.2 Phase Details (Complete)</summary>

### Phase 19: 디자인 가이드 콘텐츠
**Goal**: info-design 스킬의 핵심 콘텐츠가 6개 마크다운 문서로 추출되어, 디자인 품질 기준이 "코딩 규칙"에서 "디자인 시스템" 수준으로 확장된다
**Depends on**: Phase 18
**Requirements**: MICRO-01, INTER-01, AUDIT-01, STATE-01, ICON-01, AESTH-01
**Status**: Complete

### Phase 20: 문서 사이트 통합
**Goal**: 6개 디자인 가이드가 문서 사이트의 "디자인" 섹션으로 통합되어 네비게이션에서 접근 가능하고, 접근성 테스트를 통과하며, info-design 스킬이 역갱신된다
**Depends on**: Phase 19
**Requirements**: DSSITE-01
**Status**: Complete

</details>

<details>
<summary>v1.3 Phase Details (Complete)</summary>

### Phase 21: 빌드 + 인프라 경화
**Goal**: 빌드 시스템과 개발 인프라가 프로덕션 수준으로 정비되어, 클린 환경에서 빌드/린트/테스트가 한 번에 통과하고 개발 서버가 SCSS 변경을 즉시 반영한다
**Depends on**: Phase 20
**Requirements**: BSYS-01, BSYS-02, BSYS-03, BSYS-04, STARTER-01, STARTER-02
**Status**: Complete

### Phase 22: 콘텐츠 감사 + 보강
**Goal**: 문서 사이트의 71페이지 중 얇은 페이지가 식별되고 보강되어, 모든 페이지가 최소 품질 기준(제목 + 개요 + 본문 내용 + 예제)을 충족한다
**Depends on**: Phase 21
**Requirements**: CONTENT-01
**Status**: Complete

</details>

<details>
<summary>v1.4 Phase Details (Complete)</summary>

### Phase 23: 콘텐츠 재작성
**Goal**: 감사에서 발견된 약한 콘텐츠 3건이 구체적 사례, 코드 예제, 실무 활용법 중심으로 재작성되어 가이드로서의 실질적 가치를 갖춘다
**Depends on**: Phase 22 (콘텐츠 감사에서 약한 페이지가 식별된 상태)
**Requirements**: REWRITE-01, REWRITE-02, REWRITE-03
**Status**: Complete

### Phase 24: 사이트 디자인 고도화
**Goal**: 가이드 웹사이트 자체의 시각적 품질이 프로페셔널 수준으로 향상되어, 사이드바 탐색/콘텐츠 가독성/코드 블록 사용성/컴포넌트 미리보기가 개선된다
**Depends on**: Phase 23 (콘텐츠가 확정된 후 디자인 개선)
**Requirements**: UI-01, UI-02, UI-03, UI-04
**Status**: Complete

</details>

### Phase 25: 접근성 수정 + 토큰 정합
**Goal**: 컴포넌트 SCSS의 접근성 미달 항목(터치 타겟, 간격, reduced-motion, 포커스 링)이 수정되고, 토큰 값과 문서 간 불일치가 해소된다
**Depends on**: Phase 24 (v1.4 완료 기반)
**Requirements**: A11YFIX-01, A11YFIX-02, A11YFIX-03, A11YFIX-04, A11YFIX-05, A11YFIX-06, TOKFIX-01
**Success Criteria** (what must be TRUE):
  1. 모달 닫기 버튼, 페이지네이션 링크의 터치 타겟이 44x44px 이상이며, 페이지네이션 링크 간격이 8px 이상이다
  2. 브레드크럼 아이템 간 간격이 8px 이상이다
  3. btn, form, card, modal, tab, pagination, breadcrumb 7개 컴포넌트 SCSS에 `prefers-reduced-motion: reduce` 미디어 쿼리가 적용되어, 해당 설정 시 모든 transition/animation이 비활성화된다
  4. 7개 컴포넌트의 포커스 스타일이 `:focus-visible` + `outline: 2px solid` + `outline-offset: 2px`로 통일되어 있다
  5. `--transition-fast` 토큰 값이 SCSS 파일과 `interaction-timing.md` 문서에서 동일한 값으로 정합되어 있다
**Plans**: 2 plans
Plans:
- [x] 25-01-PLAN.md -- 토큰 값 정합 + 터치 타겟/간격 수정
- [ ] 25-02-PLAN.md -- reduced-motion + 포커스 링 통일

### Phase 26: SCSS 현대화
**Goal**: 8개 컴포넌트의 반응형 패딩, 인터랙션 애니메이션, 폰트/여백 사이즈가 현대적 수준으로 개선되어 실제 프로젝트 투입 시 바로 사용 가능한 품질을 갖춘다
**Depends on**: Phase 25 (접근성/토큰 기반이 정리된 상태)
**Requirements**: RESP-01, RESP-02, RESP-03, MOTION-01, MOTION-02, SIZE-01, SIZE-02, SIZE-03
**Success Criteria** (what must be TRUE):
  1. btn, form, card, table, modal, tab, pagination, breadcrumb 8개 컴포넌트가 모바일/태블릿/PC 각각 다른 패딩을 가지며, respond-to 믹스인으로 작성되어 있다
  2. 모달이 열릴 때 scale 0.95->1 + opacity 0->1 애니메이션이 300ms 동안 재생된다
  3. 카드에 hover 시 shadow가 확대되고 translateY -2px 효과가 적용된다
  4. 폼 라벨, 테이블 기본 폰트가 16px(var(--font-size-base)) 이상이며, 탭 버튼 패딩이 수직 12px/수평 20px 이상이다
  5. 카드/모달/테이블 등의 내부 여백이 이전보다 확대되어 시원시원한 느낌을 준다
**Plans**: 2 plans
Plans:
- [ ] 25-01-PLAN.md -- 토큰 값 정합 + 터치 타겟/간격 수정
- [ ] 25-02-PLAN.md -- reduced-motion + 포커스 링 통일
**UI hint**: yes

### Phase 27: 문서/플레이그라운드 동기화
**Goal**: Phase 25-26에서 변경된 SCSS가 playground HTML, 문서 사이트, 프롬프트, 스니펫에 모두 반영되어 코드와 문서가 100% 일치한다
**Depends on**: Phase 26 (모든 SCSS 변경이 완료된 상태)
**Requirements**: SIZE-04, TOKFIX-02
**Success Criteria** (what must be TRUE):
  1. playground HTML 미리보기에서 변경된 사이즈/여백이 시각적으로 반영되어 있다 (모달 애니메이션, 카드 hover, 확대된 패딩/폰트 확인 가능)
  2. src/snippets/ 마크다운 파일의 코드 예제가 실제 SCSS 구현과 일치한다
  3. prompts/ 디렉토리의 AI 프롬프트가 변경된 토큰 값/규칙을 반영하고 있다
  4. site/ 문서 페이지(컴포넌트, 접근성, 가이드)가 변경된 규칙을 반영하고 있다
  5. `npm test` (lint + a11y)가 통과한다
**Plans**: 2 plans
Plans:
- [ ] 25-01-PLAN.md -- 토큰 값 정합 + 터치 타겟/간격 수정
- [ ] 25-02-PLAN.md -- reduced-motion + 포커스 링 통일

## Progress

**Execution Order:**
Phases execute in numeric order: 25 -> 26 -> 27

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Foundation | v0.8 | 3/3 | Complete | 2026-03-25 |
| 2. Conventions | v0.8 | 2/2 | Complete | 2026-03-25 |
| 3. Components | v0.8 | 4/4 | Complete | 2026-03-25 |
| 4. Accessibility | v0.8 | 3/3 | Complete | 2026-03-25 |
| 5. Documentation Site | v0.8 | 4/4 | Complete | 2026-03-26 |
| 6. Rollout | v0.8 | 2/2 | Complete | 2026-03-26 |
| 7. 피그마 컨벤션 | v0.9 | 1/1 | Complete | 2026-03-26 |
| 8. 디자인 QA | v0.9 | 0/TBD | Complete | 2026-03-26 |
| 9. 퍼블리싱 심화 | v0.9 | 0/TBD | Complete | 2026-03-26 |
| 10. 테스트 가이드 | v0.9 | 0/TBD | Complete | 2026-03-26 |
| 11. 거버넌스 | v0.9 | 0/TBD | Complete | 2026-03-26 |
| 12. 코드 품질 수정 | v0.9.5 | 0/TBD | Complete | 2026-03-26 |
| 13. 사이트 UX + 온보딩 | v0.9.5 | 0/TBD | Complete | 2026-03-26 |
| 14. 프롬프트 파일 생성 | v1.0 | 0/TBD | Complete | 2026-03-26 |
| 15. 문서 사이트 프롬프트 통합 | v1.0 | 0/TBD | Complete | 2026-03-26 |
| 16. 토큰 파이프라인 | v1.1 | 0/TBD | Complete | 2026-03-26 |
| 17. 컴포넌트 조합 패턴 | v1.1 | 0/TBD | Complete | 2026-03-26 |
| 18. 빌드 통합 | v1.1 | 0/TBD | Complete | 2026-03-26 |
| 19. 디자인 가이드 콘텐츠 | v1.2 | 0/TBD | Complete | 2026-03-26 |
| 20. 문서 사이트 통합 | v1.2 | 0/TBD | Complete | 2026-03-26 |
| 21. 빌드 + 인프라 경화 | v1.3 | 0/TBD | Complete | 2026-03-26 |
| 22. 콘텐츠 감사 + 보강 | v1.3 | 0/TBD | Complete | 2026-03-26 |
| 23. 콘텐츠 재작성 | v1.4 | 0/TBD | Complete | 2026-03-27 |
| 24. 사이트 디자인 고도화 | v1.4 | 0/TBD | Complete | 2026-03-27 |
| 25. 접근성 수정 + 토큰 정합 | v1.5 | 1/2 | In Progress|  |
| 26. SCSS 현대화 | v1.5 | 0/TBD | Not started | - |
| 27. 문서/플레이그라운드 동기화 | v1.5 | 0/TBD | Not started | - |
