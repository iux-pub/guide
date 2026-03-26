# Roadmap: INFOMIND UX 디자인/퍼블리싱 가이드 시스템

## Milestones

- [x] **v0.8 Foundation** - Phases 1-6 (complete)
- [x] **v0.9 디자인 컨벤션 + 프로세스 강화** - Phases 7-11 (complete)
- [x] **v0.9.5 리뷰 기반 품질 강화** - Phases 12-13 (complete)
- [ ] **v1.0 AI 범용 프롬프트 시스템** - Phases 14-15 (in progress)
- [ ] **v1.1 시스템 고도화** - Phases 16-18
- [ ] **v1.2 디자인 역량 강화** - Phases 19-20

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
<summary>v1.0 AI 범용 프롬프트 시스템 (Phases 14-15) - IN PROGRESS</summary>

- [ ] **Phase 14: 프롬프트 파일 생성** - 6개 AI 프롬프트 마크다운 파일 작성 (prompts/ 디렉토리)
- [ ] **Phase 15: 문서 사이트 프롬프트 통합** - site/prompts/ 섹션, 사용 가이드, 복사 기능

</details>

<details>
<summary>v1.1 시스템 고도화 (Phases 16-18)</summary>

- [ ] **Phase 16: 토큰 파이프라인** - tokens.json 싱글 소스 + SCSS/프롬프트 자동 생성 스크립트
- [ ] **Phase 17: 컴포넌트 조합 패턴** - 실전 레이아웃 예제 3종 + 문서 사이트 조합 패턴 페이지
- [ ] **Phase 18: 빌드 통합** - npm run build 전체 파이프라인 + 프롬프트 자동 재생성

</details>

### v1.2 디자인 역량 강화

- [ ] **Phase 19: 디자인 가이드 콘텐츠** - info-design 스킬 기반 6개 디자인 가이드 마크다운 문서 생성
- [ ] **Phase 20: 문서 사이트 통합** - site/design/ 섹션 네비게이션, pa11yci, info-design 스킬 역갱신

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
<summary>v1.0 Phase Details (In Progress)</summary>

### Phase 14: 프롬프트 파일 생성
**Goal**: 팀의 디자인/퍼블리싱 규칙이 6개 AI 프롬프트 파일로 체계화되어, 어떤 AI 도구에든 즉시 주입 가능하다
**Depends on**: Phase 13 (기존 가이드 문서, 토큰, 컴포넌트, 접근성 규칙이 모두 완성된 상태)
**Requirements**: PROMPT-D01, PROMPT-D02, PROMPT-P01, PROMPT-P02, PROMPT-C01, PROMPT-C02
**Success Criteria** (what must be TRUE):
  1. `prompts/design.md` 파일이 존재하며, 토큰(색상/타이포/간격), 컴포넌트 구조, 접근성 규칙을 특정 AI 도구 종속 문법 없이 담고 있다
  2. `prompts/figma.md` 파일이 존재하며, 피그마 컴포넌트 네이밍, Variable 매핑, Auto Layout, 레이어 구조 규칙을 담고 있다
  3. `prompts/publishing.md` 파일이 존재하며, BEM, ITCSS, 토큰 사용법, 반응형 브레이크포인트, 접근성 규칙을 AI가 코드 생성에 바로 활용할 수 있는 형태로 담고 있다
  4. `prompts/components.md` 파일이 존재하며, 8개 컴포넌트(버튼, 폼, 카드, 테이블, 모달, 탭, 페이지네이션, 브레드크럼)의 HTML+CSS 패턴을 AI가 바로 참조 가능한 압축 형태로 제공한다
  5. `prompts/context.md` 파일이 존재하며, 팀 규칙 전체를 대화형 AI에 붙여넣기 가능한 2000토큰 이내 요약으로 압축하고 있다
  6. `prompts/review.md` 파일이 존재하며, BEM/토큰/접근성 체크리스트를 AI 코드 리뷰어에게 주입 가능한 형태로 제공한다
**Plans**: TBD

### Phase 15: 문서 사이트 프롬프트 통합
**Goal**: 사용자가 문서 사이트에서 프롬프트를 열람하고, 용도에 맞는 프롬프트를 복사하여 AI 도구에 바로 붙여넣을 수 있다
**Depends on**: Phase 14 (프롬프트 파일이 존재해야 사이트에 통합 가능)
**Requirements**: PROMPT-SITE01, PROMPT-SITE02
**Success Criteria** (what must be TRUE):
  1. 문서 사이트 네비게이션에 "AI 프롬프트" 섹션이 존재하며, 6개 프롬프트 페이지로 접근 가능하다
  2. 각 프롬프트 페이지에 "복사" 버튼이 있어 클릭 시 프롬프트 전문이 클립보드에 복사된다
  3. 프롬프트 사용 가이드 페이지가 존재하며, AI 도구 유형별(디자인 AI, 퍼블리싱 AI, 대화형 AI, 피그마 AI) 어떤 프롬프트를 사용하는지 매핑 테이블을 제공한다
  4. 프롬프트 섹션 페이지가 기존 사이트와 동일한 KWCAG/WCAG AA 접근성 수준을 유지한다
**Plans**: TBD
**UI hint**: yes

</details>

<details>
<summary>v1.1 Phase Details</summary>

### Phase 16: 토큰 파이프라인
**Goal**: 토큰이 tokens.json 하나에서 관리되고, SCSS 변수와 AI 프롬프트가 스크립트 한 번으로 자동 생성된다
**Depends on**: Phase 15 (v1.0 완료 후 시작, 기존 토큰 SCSS와 프롬프트 파일이 존재하는 상태)
**Requirements**: PIPE-01, PIPE-02, PIPE-03
**Success Criteria** (what must be TRUE):
  1. `tokens.json` 파일이 DTCG 포맷($value, $type)으로 존재하며, 현재 `_tokens-*.scss` 파일의 모든 토큰 값(색상, 타이포, 간격, 그리드, 기타)을 포함한다
  2. 빌드 스크립트 실행 시 `tokens.json`에서 `_tokens-*.scss` 파일이 자동 생성되며, 생성된 CSS Custom Properties가 기존 수동 작성본과 동일한 결과를 낸다
  3. 빌드 스크립트 실행 시 `tokens.json`에서 `prompts/design.md`의 토큰 섹션이 자동 갱신되어, 토큰 값 변경이 프롬프트에 즉시 반영된다
  4. `tokens.json` 값을 변경한 뒤 스크립트를 재실행하면 SCSS와 프롬프트 양쪽 모두에 변경이 반영된다
**Plans**: TBD

### Phase 17: 컴포넌트 조합 패턴
**Goal**: 개별 컴포넌트를 조합한 실전 레이아웃 예제가 playground와 문서 사이트에서 확인 가능하다
**Depends on**: Phase 15 (v1.0 완료 후 시작, 문서 사이트와 컴포넌트가 존재하는 상태)
**Requirements**: COMBO-01, COMBO-02
**Success Criteria** (what must be TRUE):
  1. `src/playground/` 에 3종 조합 예제(모달+폼, 카드그리드+페이지네이션, 검색폼+테이블)의 HTML 파일이 존재하며 브라우저에서 렌더링된다
  2. 각 조합 예제가 기존 컴포넌트 SCSS(`_modal.scss`, `_form.scss`, `_card.scss`, `_table.scss`, `_pagination.scss`)를 재사용하며, 추가 SCSS가 최소한이다
  3. 문서 사이트 `site/components/` 하위에 조합 패턴 문서 페이지가 존재하며, iframe 또는 코드 예제로 각 조합을 미리볼 수 있다
  4. 조합 예제의 HTML이 KWCAG/WCAG AA 접근성을 유지한다 (aria 속성, 키보드 네비게이션, 포커스 관리)
**Plans**: TBD
**UI hint**: yes

### Phase 18: 빌드 통합
**Goal**: `npm run build` 한 명령으로 토큰 생성부터 SCSS 컴파일, 프롬프트 재생성, 문서 사이트 빌드까지 전체 파이프라인이 실행된다
**Depends on**: Phase 16 (토큰 파이프라인 스크립트가 있어야 빌드에 통합 가능)
**Requirements**: BUILD-01, BUILD-02
**Success Criteria** (what must be TRUE):
  1. `npm run build` 실행 시 tokens -> SCSS -> CSS -> prompts -> site 순서로 전체 빌드가 오류 없이 완료된다
  2. `npm run build:prompts` 실행 시 `tokens.json`과 `src/snippets/`를 읽어 `prompts/*.md` 파일이 자동 재생성된다
  3. 토큰 값 또는 스니펫 내용을 변경한 뒤 `npm run build`를 실행하면 최종 사이트와 프롬프트에 변경이 반영된다
  4. `package.json`의 scripts 섹션에 build, build:tokens, build:prompts 명령이 정의되어 있고, 각각 독립 실행도 가능하다
**Plans**: TBD

</details>

### Phase 19: 디자인 가이드 콘텐츠
**Goal**: info-design 스킬의 핵심 콘텐츠가 6개 마크다운 문서로 추출되어, 디자인 품질 기준이 "코딩 규칙"에서 "디자인 시스템" 수준으로 확장된다
**Depends on**: Phase 18 (v1.1 완료 후 시작, 문서 사이트와 빌드 파이프라인이 존재하는 상태)
**Requirements**: MICRO-01, INTER-01, AUDIT-01, STATE-01, ICON-01, AESTH-01
**Success Criteria** (what must be TRUE):
  1. `site/design/microcopy.md` 파일이 존재하며, 에러 메시지 3-part 공식(what/why/how), 버튼 텍스트 규칙(동사형 2~4단어), 톤 매핑(B2B/소비자/공공), 플레이스홀더 규칙, 숫자 포맷을 실무 예제와 함께 제공한다
  2. `site/design/interaction-timing.md` 파일이 존재하며, 컴포넌트별 전환 시간(버튼 100ms, 모달 300ms 등), 이징 함수, prefers-reduced-motion 대응, Figma 프로토타입 설정 매핑을 담고 있다
  3. `site/design/design-audit.md` 파일이 존재하며, 17점 체크리스트 + Quick 5 기본 점검 + 점수 체계(100점 만점, Critical/Warning/Tip 심각도)가 팀이 즉시 적용 가능한 형태로 제공된다
  4. `site/design/ui-states.md` 파일이 존재하며, 로딩(Skeleton vs Spinner vs ProgressBar 의사결정 트리), 에러(3단계 심각도), 빈 상태(아이콘+제목+설명+CTA 템플릿), 폼 유효성 타이밍을 담고 있다
  5. `site/design/icon-system.md` 파일이 존재하며, 8pt 그리드(허용 사이즈 12/16/20/24/32/40/48px), Lucide 표준, 금지 사이즈, 접근성(aria-hidden + 텍스트 라벨) 규격을 정의한다
  6. `site/design/aesthetics.md` 파일이 존재하며, AI 슬롭 안티패턴, 5트랙 디자인 사고, 비대칭 레이아웃 원칙, INFOMIND 제품별 UI 스타일 매핑을 담고 있다
**Plans**: TBD

### Phase 20: 문서 사이트 통합
**Goal**: 6개 디자인 가이드가 문서 사이트의 "디자인" 섹션으로 통합되어 네비게이션에서 접근 가능하고, 접근성 테스트를 통과하며, info-design 스킬이 역갱신된다
**Depends on**: Phase 19 (6개 마크다운 문서가 존재해야 사이트에 통합 가능)
**Requirements**: DSSITE-01
**Success Criteria** (what must be TRUE):
  1. 문서 사이트 네비게이션에 "디자인" 섹션이 존재하며, 6개 디자인 가이드 페이지(마이크로카피, 인터랙션 타이밍, 디자인 감사, UI 상태, 아이콘 시스템, 미학 원칙)로 접근 가능하다
  2. `.pa11yci.js`에 `site/design/` 하위 6개 페이지 URL이 추가되어 pa11y-ci 접근성 테스트를 통과한다
  3. info-design 스킬의 references/ 파일에서 가이드 시스템 문서 링크가 역참조로 추가되어, 스킬과 가이드 사이트가 양방향으로 연결된다
  4. 디자인 섹션 페이지가 기존 사이트와 동일한 레이아웃, 코드 하이라이팅, copy-to-clipboard 기능을 사용한다
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 14 -> 15 -> 16 -> 17 -> 18 -> 19 -> 20

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
| 14. 프롬프트 파일 생성 | v1.0 | 0/TBD | Not started | - |
| 15. 문서 사이트 프롬프트 통합 | v1.0 | 0/TBD | Complete | 2026-03-26 |
| 16. 토큰 파이프라인 | v1.1 | 0/TBD | Not started | - |
| 17. 컴포넌트 조합 패턴 | v1.1 | 0/TBD | Not started | - |
| 18. 빌드 통합 | v1.1 | 0/TBD | Complete | 2026-03-26 |
| 19. 디자인 가이드 콘텐츠 | v1.2 | 0/TBD | Not started | - |
| 20. 문서 사이트 통합 | v1.2 | 0/TBD | Not started | - |
