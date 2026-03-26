# Phase 6: Rollout — Handoff + Onboarding - Context

**Gathered:** 2026-03-26
**Status:** Ready for planning

<domain>
## Phase Boundary

신규 팀원이 가이드를 보고 바로 프로젝트를 시작할 수 있고, 디자이너-퍼블리셔 간 핸드오프 규칙이 명확하며, 스타터 킷으로 새 프로젝트를 즉시 셋업할 수 있는 상태를 만든다. Phase 1~5의 모든 산출물을 팀에 배포하는 마지막 단계.

</domain>

<decisions>
## Implementation Decisions

### 온보딩 가이드 구조
- **D-01:** 온보딩 가이드는 문서 사이트(Eleventy) 내 별도 섹션으로 작성한다. 별도 README나 외부 문서가 아닌 site/ 디렉토리에 마크다운 페이지로 추가.
- **D-02:** 스텝바이스텝 튜토리얼 형태 — 설치 → SCSS 구조 이해 → 토큰 사용 → 컴포넌트 활용 → 접근성 체크 순서로 안내.
- **D-03:** 온보딩 페이지에서 각 단계마다 관련 문서 사이트 페이지로 링크하여 심화 참조 가능하게 한다.

### 피그마→코드 핸드오프 규칙
- **D-04:** 피그마 컴포넌트 네이밍과 BEM 클래스 매핑 테이블을 문서화한다 (예: Figma `Button/Primary` → `.btn--primary`).
- **D-05:** 디자이너가 퍼블리셔에게 전달할 항목 체크리스트를 작성한다 — 토큰 확인, 컴포넌트 variant 명시, 간격/정렬 기준, 반응형 브레이크포인트별 시안 등.
- **D-06:** 토큰 연결 방식: 피그마 Variable 이름 → CSS Custom Property 이름 매핑 규칙을 명시한다.

### 프로젝트 스타터 킷
- **D-07:** 배포 방식은 git clone 템플릿 — 별도 브랜치(`starter-kit`) 또는 별도 디렉토리(`starter/`)에 최소 파일셋을 구성하여 clone 후 바로 시작 가능.
- **D-08:** 스타터 킷 포함 범위: SCSS(ITCSS 전체 구조 + 토큰 + 믹스인 + normalize + 컴포넌트), HTML 보일러플레이트, package.json(빌드 스크립트), .stylelintrc.json. JS는 모달/탭만 포함.
- **D-09:** _project-overrides.scss에 프로젝트별 Primary 색상 변경 가이드를 주석으로 포함한다.
- **D-10:** 스타터 킷 설치 후 `npm install && npm run build:css`만으로 첫 빌드가 되어야 한다.

### Claude's Discretion
- 온보딩 가이드의 세부 목차와 설명 깊이
- 핸드오프 체크리스트의 항목 수와 세부도
- 스타터 킷 디렉토리 구조 (starter/ vs starter-kit 브랜치)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### 기존 산출물 (Phase 1~5)
- `CLAUDE.md` — 전체 프로젝트 규칙, BEM, 토큰, ITCSS, 접근성, 컴포넌트 스니펫 참조 경로
- `src/scss/style.scss` — ITCSS 메인 진입점 (스타터 킷 기반)
- `src/scss/_project-overrides.scss` — 프로젝트별 토큰 오버라이드 패턴
- `src/snippets/boilerplate.md` — HTML 보일러플레이트 스니펫
- `docs/bem-guide.md` — BEM 가이드 문서
- `docs/scss-structure-guide.md` — SCSS 구조 가이드
- `.stylelintrc.json` — Stylelint BEM 린팅 설정

### 문서 사이트
- `eleventy.config.js` — Eleventy 설정 (site/ 구조 참조)
- `site/_data/navigation.json` — 네비게이션 구조 (온보딩 섹션 추가 시 참조)

### 접근성
- `docs/accessibility/checklist.md` — KWCAG 체크리스트
- `.pa11yci.js` — pa11y-ci 설정 (새 페이지 URL 추가 필요)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Phase 5 Eleventy 문서 사이트 — 온보딩 가이드를 site/ 아래 마크다운 페이지로 추가하면 자동 빌드
- `site/_includes/layouts/page.njk` — 일반 문서 레이아웃 (온보딩 페이지에 재사용)
- `src/snippets/boilerplate.md` — 스타터 킷 HTML 템플릿 기반
- `package.json` — 빌드 스크립트 (스타터 킷용 최소 버전 추출 가능)

### Established Patterns
- 디렉토리별 데이터 파일(*.json)로 섹션 설정 (tokens.json, conventions.json 등)
- 마크다운 + Nunjucks front matter로 문서 페이지 생성
- BEM 클래스 + CSS Custom Properties 토큰 시스템

### Integration Points
- `site/_data/navigation.json` — 온보딩 섹션 추가
- `.pa11yci.js` — 새 페이지 URL 추가
- `site/` 디렉토리 — 새 섹션 추가

</code_context>

<specifics>
## Specific Ideas

- 스타터 킷은 git clone 방식으로 배포 (사용자 결정)
- Phase 1~5 모든 산출물이 이미 완성되어 있으므로 스타터 킷은 기존 파일에서 추출하는 방식

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 06-rollout-handoff-onboarding*
*Context gathered: 2026-03-26*
