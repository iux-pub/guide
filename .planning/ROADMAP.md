# Roadmap: INFOMIND UX 디자인/퍼블리싱 가이드 시스템

## Milestones

- [x] **v0.8 Foundation** - Phases 1-6 (complete)
- [ ] **v0.9 디자인 컨벤션 + 프로세스 강화** - Phases 7-11 (in progress)

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

### v0.9 디자인 컨벤션 + 프로세스 강화

- [ ] **Phase 7: 피그마 컨벤션** - 컴포넌트 네이밍, 레이어 구조, Variable, Auto Layout 규칙
- [ ] **Phase 8: 디자인 QA + 핸드오프 품질** - QA 체크리스트, 픽셀 퍼펙트 허용 범위
- [ ] **Phase 9: 퍼블리싱 심화 가이드** - 시맨틱 HTML, 이미지 처리, CSS 성능, 애니메이션
- [x] **Phase 10: 테스트 가이드** - 크로스 브라우저, 모바일/터치, CSS 회귀 테스트 (completed 2026-03-26)
- [x] **Phase 11: 거버넌스 + 버전 관리** - 컴포넌트 라이프사이클, 버전 정책, 기여 가이드 (completed 2026-03-26)

## Phase Details

### Phase 7: 피그마 컨벤션
**Goal**: 디자이너가 피그마에서 작업할 때 따라야 할 네이밍/구조/토큰 규칙이 문서화되어 있다
**Depends on**: Nothing (v0.9 첫 페이즈, v0.8 문서 사이트 위에 페이지 추가)
**Requirements**: FIG-01, FIG-02, FIG-03, FIG-04
**Success Criteria** (what must be TRUE):
  1. 문서 사이트에서 피그마 컴포넌트 네이밍 규칙(계층 구조, 구분자, 대소문자)을 확인할 수 있다
  2. 피그마 레이어/프레임 정리 규칙(페이지 구성, 그룹 네이밍)이 예제와 함께 문서화되어 있다
  3. 피그마 Variable 이름과 CSS Custom Property 이름의 매핑 테이블이 존재한다
  4. Auto Layout 패딩/갭 값이 디자인 토큰 스케일과 1:1로 매핑된 참조표가 있다
**Plans**: 1 (complete)
**UI hint**: yes

### Phase 8: 디자인 QA + 핸드오프 품질
**Goal**: 디자이너가 핸드오프 전 자체 점검할 수 있는 체크리스트와 퍼블리셔와의 허용 오차 기준이 합의되어 있다
**Depends on**: Phase 7
**Requirements**: DQA-01, DQA-02
**Success Criteria** (what must be TRUE):
  1. 문서 사이트에 핸드오프 전 디자인 QA 체크리스트(토큰 준수, 컴포넌트 일관성, 접근성 등)가 있다
  2. 간격/폰트/컬러 각각에 대해 구체적인 픽셀 허용 오차 기준이 명시되어 있다
  3. 체크리스트를 따라 실제 핸드오프 점검을 수행할 수 있다
**Plans**: TBD
**UI hint**: yes

### Phase 9: 퍼블리싱 심화 가이드
**Goal**: 퍼블리셔가 시맨틱 마크업, 이미지 최적화, CSS 성능, 애니메이션에 대한 팀 규칙을 참조할 수 있다
**Depends on**: Nothing (v0.8 완료 기반, Phase 7-8과 독립)
**Requirements**: PUB-01, PUB-02, PUB-03, PUB-04
**Success Criteria** (what must be TRUE):
  1. heading 계층(h1-h6), section/article/nav/aside 사용 규칙이 do/don't 예제와 함께 문서화되어 있다
  2. 이미지 포맷 선택(WebP/PNG/SVG), lazy loading 적용 기준, 파일 네이밍 규칙이 명시되어 있다
  3. CSS 선택자 깊이 제한, 미사용 CSS 감지 방법, 파일 크기 기준이 가이드로 존재한다
  4. 애니메이션/트랜지션 작성 규칙과 prefers-reduced-motion 대응 패턴이 코드 예제와 함께 있다
**Plans**: TBD
**UI hint**: yes

### Phase 10: 테스트 가이드
**Goal**: 팀이 크로스 브라우저/디바이스 테스트와 CSS 회귀 테스트를 체계적으로 수행할 수 있다
**Depends on**: Phase 9
**Requirements**: TEST-01, TEST-02, TEST-03
**Success Criteria** (what must be TRUE):
  1. 공식 타겟 브라우저/디바이스 목록이 있고 각 브라우저별 테스트 체크리스트가 있다
  2. 모바일 터치 테스트 항목(호버 대체, 터치 타겟 크기, 제스처)이 문서화되어 있다
  3. CSS 변경 시 의도하지 않은 회귀를 감지하는 방법(도구, 프로세스)이 가이드로 존재한다
**Plans**: TBD
**UI hint**: yes

### Phase 11: 거버넌스 + 버전 관리
**Goal**: 가이드 시스템의 성장/변경을 관리하는 프로세스가 확립되어 있다
**Depends on**: Phase 7, Phase 9 (컨벤션/가이드가 존재해야 거버넌스 대상이 있음)
**Requirements**: GOV-01, GOV-02, GOV-03, GOV-04
**Success Criteria** (what must be TRUE):
  1. 컴포넌트에 stable/beta/experimental 라벨이 부여되는 기준과 승격/강등 조건이 명시되어 있다
  2. 가이드 시스템의 시맨틱 버전 정책과 CHANGELOG 작성 형식이 문서화되어 있다
  3. 새 토큰/컴포넌트 추가 또는 기존 변경에 대한 제안-리뷰-승인 프로세스가 있다
  4. GitHub 이슈 템플릿(버그, 기능 요청)과 기여 가이드가 저장소에 존재한다
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 7 -> 8 -> 9 -> 10 -> 11
(Phase 9 can start independently of 7-8)

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Foundation | v0.8 | 3/3 | Complete | 2026-03-25 |
| 2. Conventions | v0.8 | 2/2 | Complete | 2026-03-25 |
| 3. Components | v0.8 | 4/4 | Complete | 2026-03-25 |
| 4. Accessibility | v0.8 | 3/3 | Complete | 2026-03-25 |
| 5. Documentation Site | v0.8 | 4/4 | Complete | 2026-03-26 |
| 6. Rollout | v0.8 | 2/2 | Complete | 2026-03-26 |
| 7. 피그마 컨벤션 | v0.9 | 1/1 | Complete | 2026-03-26 |
| 8. 디자인 QA + 핸드오프 품질 | v0.9 | 0/TBD | Not started | - |
| 9. 퍼블리싱 심화 가이드 | v0.9 | 0/TBD | Not started | - |
| 10. 테스트 가이드 | v0.9 | 0/TBD | Complete    | 2026-03-26 |
| 11. 거버넌스 + 버전 관리 | v0.9 | 0/TBD | Complete    | 2026-03-26 |
