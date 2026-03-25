# Phase 4: Accessibility -- Checklist + Validation - Context

**Gathered:** 2026-03-25
**Status:** Ready for planning

<domain>
## Phase Boundary

KWCAG/WCAG 2.1 AA 퍼블리싱 체크리스트를 완성하고, pa11y-ci 자동 검증 체계를 구축하며, 컴포넌트별 접근성 패턴 가이드와 색상 대비 가이드를 문서화한다. Phase 3에서 만든 8개 컴포넌트의 접근성을 검증하고, 향후 프로젝트에서 참조할 접근성 문서 체계를 확립한다.

</domain>

<decisions>
## Implementation Decisions

### 체크리스트 포맷
- **D-01:** 마크다운 + HTML 인터랙티브 체크리스트 두 가지 모두 제공. 마크다운(docs/accessibility/checklist.md)은 AI/문서용, HTML(src/playground/a11y-checklist.html)은 실무 체크용.
- **D-02:** 컴포넌트별 분류 기준 — WCAG 4원칙이 아닌 버튼/폼/카드/테이블/모달/탭/페이지네이션/브레드크럼 + 공통 항목으로 분류. Phase 3 컴포넌트 구조와 1:1 대응.
- **D-03:** KWCAG 2.2 확대 33개 검사항목을 포함하되, 컴포넌트별로 해당하는 항목만 매핑하여 실무 중심으로 구성.

### pa11y-ci 검증 범위
- **D-04:** .pa11yci.json 설정 파일 제공 — playground 9개 HTML 전체를 WCAG 2.1 AA 수준으로 검사. 향후 Phase 5 문서 사이트 URL 추가 가능한 확장 구조.
- **D-05:** npm run test:a11y 스크립트로 실행. 터미널 결과 요약 + reports/a11y-report.json 저장. CI 통합 가능한 구조.
- **D-06:** pa11y-ci + @axe-core/cli 설치 필요 (package.json devDependencies 추가).

### 컴포넌트별 접근성 가이드
- **D-07:** docs/accessibility/ 폴더에 컴포넌트별 독립 문서 제공 (docs/accessibility/btn.md, form.md 등). Phase 5 문서 사이트에서 임포트.
- **D-08:** 실무 충분 수준 — 필수 ARIA 속성 표 + 키보드 상호작용 목록 + do/don't 예시 + 스크린리더 테스트 노트. Phase 3 스니펫(src/snippets/*.md)과 상호 보완 (중복 최소화).

### 색상 대비 가이드
- **D-09:** 상세 가이드 — 프로젝트 토큰별 전경/배경 조합 대비 표(PASS/FAIL) + 온라인 도구 안내(WebAIM, APCA) + 색상 선택 원칙 + 대비 실패 시 대안 색상 제안 방법.
- **D-10:** docs/accessibility/color-contrast.md에 위치. 토큰 값은 Phase 1 src/scss/1-settings/_tokens-color.scss 기준.

### Claude's Discretion
- KWCAG 2.2 33개 항목과 컴포넌트의 구체적 매핑 관계
- HTML 체크리스트 페이지의 인터랙션 방식 (체크박스, 진행률 표시 등)
- pa11y-ci 설정 세부 옵션 (timeout, viewport, ignore rules 등)
- 스크린리더 테스트 노트의 구체적 내용
- 대안 색상 제안의 구체적 방법론

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase 3 산출물 (검증 대상)
- `src/playground/*.html` — pa11y-ci 검증 대상 9개 HTML 페이지
- `src/snippets/*.md` — 컴포넌트별 접근성 주의사항 (중복 확인 필요)
- `src/scss/6-components/*.scss` — 8개 컴포넌트 SCSS
- `src/js/modal.js` — 모달 포커스 트랩, ESC 닫기
- `src/js/tab.js` — 탭 키보드 전환
- `src/scss/7-utilities/_sr-only.scss` — 스크린리더 전용 유틸리티

### Phase 1 산출물 (토큰 기준)
- `src/scss/1-settings/_tokens-color.scss` — 색상 대비 가이드 기준 토큰값

### Phase 3 UI-SPEC (대비 표 기존 데이터)
- `.planning/phases/03-components-html-scss-snippets/03-UI-SPEC.md` — 색상 대비 준수 표 (6개 조합 이미 검증됨)

### 프로젝트 지침
- `./CLAUDE.md` — 접근성 규칙 (### 6. 접근성 섹션)
- `.stylelintrc.json` — BEM 린팅 설정

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Phase 3 playground HTML 9개: pa11y-ci 검증 대상으로 직접 사용
- Phase 3 스니펫 접근성 섹션: 가이드 문서 작성 시 기반 자료
- `.sr-only` 유틸리티: 이미 7-utilities에 존재, 가이드에서 참조
- Phase 3 UI-SPEC 색상 대비 표: 6개 조합 이미 검증, 확장만 필요

### Established Patterns
- playground HTML 구조: `pg__` 접두사 레이아웃, dist/css/style.css 참조
- docs/ 폴더 구조: Phase 2에서 docs/bem-guide.md 패턴 확립
- package.json npm scripts: build:css, lint:css 패턴 존재, test:a11y 추가 예정

### Integration Points
- package.json: pa11y-ci, @axe-core/cli devDependencies 추가
- npm scripts: test:a11y 추가
- .pa11yci.json: 프로젝트 루트에 설정 파일
- reports/: 접근성 리포트 출력 디렉토리
- Phase 5 (Documentation Site): docs/accessibility/ 문서를 임포트하여 가이드 페이지 생성

</code_context>

<specifics>
## Specific Ideas

- 체크리스트는 프로젝트마다 팀원이 실제 체크하며 사용하는 실무 도구로 제공
- pa11y-ci는 Phase 3 컴포넌트를 즉시 검증하여 접근성 품질을 자동으로 보장
- 컴포넌트 접근성 가이드는 Phase 3 스니펫과 중복 없이 상호 보완 (스니펫 = 코드 예제, 가이드 = 왜/언제/주의사항)
- KWCAG 2.2 확대 항목 반영으로 공공기관 납품 요건 충족

</specifics>

<deferred>
## Deferred Ideas

- Lighthouse CI 통합 — pa11y-ci로 충분, 추가 시 Phase 5 CI 설정에서 고려
- 자동 색상 대비 체크 스크립트 — 향후 별도 도구로 개발 가능
- KWCAG 인증 심사 대응 문서 — 실제 심사 시 별도 작업

</deferred>

---

*Phase: 04-accessibility-checklist-validation*
*Context gathered: 2026-03-25*
