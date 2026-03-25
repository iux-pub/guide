# Phase 5: Documentation Site - Context

**Gathered:** 2026-03-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Eleventy 기반 정적 문서 사이트를 구축하여 토큰, 컨벤션, 컴포넌트, 접근성 가이드를 한곳에서 열람하고 검색할 수 있게 한다. 컴포넌트 페이지에서 라이브 미리보기와 코드 복사 기능을 제공하고, 문서 사이트 자체도 KWCAG/WCAG AA를 준수한다. AI 지시문(CLAUDE.md)도 업데이트하여 모든 가이드를 AI가 즉시 참조 가능하게 한다.

</domain>

<decisions>
## Implementation Decisions

### 사이트 구조/네비게이션
- **D-01:** 4개 대섹션 구조 — 토큰(Token) / 컨벤션(Convention) / 컴포넌트(Component) / 접근성(Accessibility) + pagefind 검색. 각 섹션 내 하위 페이지 배치.
- **D-02:** 네비게이션 스타일은 Claude 재량 — 문서 사이트 표준 패턴(좌측 사이드바 등)으로 자유롭게 구성.

### 컴포넌트 미리보기 방식
- **D-03:** 미리보기 구현 방식은 Claude 재량 — iframe 임베드 또는 Nunjucks 매크로 등 최적의 방법으로 구현. Phase 3 playground HTML을 활용.
- **D-04:** 코드 복사(copy-to-clipboard) 버튼은 각 코드 블록 우측 상단에 배치. clipboard.js 사용. 클릭 시 "복사됨" 피드백 표시.

### 디자인/레이아웃
- **D-05:** 미니말 + 토큰 기반 스타일링 — 프로젝트 토큰(--color-*, --spacing-*, --font-*)을 문서 사이트에도 적용. 콘텐츠 중심의 깔끔한 디자인.
- **D-06:** 기본 반응형 — respond-to() 믹스인 활용. 모바일에서 사이드바 숨김 + 햄버거 메뉴, 콘텐츠 1열. 데스크탑에서 사이드바 고정.

### AI 문서 포맷
- **D-07:** CLAUDE.md 확장 방식 — 현재 CLAUDE.md의 컴포넌트 스니펫 경로 안내에 접근성 가이드 경로(docs/accessibility/)도 추가. AI가 레포 클론 후 CLAUDE.md만 읽으면 모든 규칙과 가이드 경로 확인 가능.

### Claude's Discretion
- Eleventy 디렉토리 구조 및 설정 (eleventy.config.js)
- Nunjucks 템플릿 상속 구조 (base layout, page layout 등)
- pagefind 설정 및 통합 방식
- Prism.js 코드 하이라이팅 테마 선택
- 컴포넌트 미리보기의 구체적 구현 방식 (iframe vs 매크로)
- 네비게이션 UI 패턴 (사이드바, 탭, 브레드크럼 등)
- 문서 사이트 전용 SCSS 파일 구조

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase 1~4 산출물 (문서 콘텐츠 소스)
- `src/scss/1-settings/` — 토큰 정의 (색상, 타이포, 간격, 그리드, 기타)
- `src/playground/*.html` — 10개 playground 페이지 (컴포넌트 미리보기 소스)
- `src/snippets/*.md` — 9개 AI 스니펫 (컴포넌트 코드 예제)
- `docs/accessibility/*.md` — 10개 접근성 가이드
- `docs/accessibility/checklist.md` — KWCAG 2.2 체크리스트
- `docs/bem-guide.md` — BEM 컨벤션 가이드

### 기술 스택 (CLAUDE.md에서 선정)
- Eleventy ^3.1.5 — 정적 사이트 생성기
- Nunjucks ^3.2.4 — 템플릿 엔진
- Prism.js — 코드 하이라이팅
- clipboard.js — 코드 복사
- pagefind — 문서 검색

### 접근성 검증
- `.pa11yci.js` — pa11y-ci 설정 (문서 사이트 URL 추가 대상)
- `src/scss/7-utilities/_sr-only.scss` — 스크린리더 전용 유틸리티

### 프로젝트 지침
- `./CLAUDE.md` — 프로젝트 규칙 + AI 지시문 (Phase 5 완료 후 업데이트 대상)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- playground HTML 10개: 컴포넌트 미리보기 iframe 소스로 직접 사용 가능
- 접근성 가이드 10개: 마크다운으로 작성, Eleventy가 바로 렌더링 가능
- BEM 가이드: docs/bem-guide.md, Eleventy 콘텐츠로 직접 사용
- 토큰 SCSS: 문서 사이트 스타일에도 동일 토큰 적용
- pa11y-ci: 문서 사이트 빌드 후 URL 추가하여 접근성 자동 검증 가능

### Established Patterns
- playground `pg__` 접두사 레이아웃: 문서 사이트에서도 비슷한 구조 가능
- npm scripts 패턴: build:css, lint:css, test:a11y 체계에 build (Eleventy) 추가
- BEM 네이밍: 문서 사이트 전용 컴포넌트도 BEM 적용

### Integration Points
- package.json: eleventy, prism.js, clipboard.js, pagefind devDependencies 추가
- npm scripts: build (Eleventy), serve (dev server) 추가
- .pa11yci.js: 빌드된 문서 사이트 페이지 URL 추가
- CLAUDE.md: 접근성 가이드 경로 추가

</code_context>

<specifics>
## Specific Ideas

- Phase 3 playground HTML을 그대로 활용하여 컴포넌트 미리보기 제공 — 별도 재작성 불필요
- 마크다운 문서(접근성 가이드, BEM 가이드)를 Eleventy가 바로 HTML로 변환
- 토큰 시각화는 Phase 1 playground/index.html의 패턴을 문서 사이트에 통합
- pagefind는 빌드 후 자동 인덱싱 — 추가 설정 최소화

</specifics>

<deferred>
## Deferred Ideas

- 버전 관리 (토큰/컴포넌트 변경 이력) — v2 확장
- 다국어 문서 — Out of Scope (한국어 단일)
- 검색 고도화 (필터, 카테고리별 검색) — pagefind 기본 검색으로 충분
- 문서 기여 가이드 (CONTRIBUTING.md) — Phase 6 온보딩에서 고려

</deferred>

---

*Phase: 05-documentation-site*
*Context gathered: 2026-03-26*
