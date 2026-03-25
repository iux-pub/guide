# Phase 3: Components — HTML+SCSS Snippets - Context

**Gathered:** 2026-03-25
**Status:** Ready for planning

<domain>
## Phase Boundary

8개 핵심 UI 컴포넌트(버튼, 폼, 카드, 테이블, 모달, 탭, 페이지네이션, 브레드크럼)와 HTML 페이지 보일러플레이트를 BEM+접근성 내장 형태로 구축한다. 각 컴포넌트의 바닐라 JS 동작(접근성 필수 포함), 컴포넌트별 미리보기 HTML 페이지, AI용 스니펫 파일을 함께 제공한다.

</domain>

<decisions>
## Implementation Decisions

### 컴포넌트 디자인 기준
- **D-01:** KRDS 공공 디자인시스템의 접근성 패턴(role, aria)과 마크업 구조를 참조하되, 스타일링은 우리 토큰으로 독자 적용. KRDS 디자인 복사 아님.
- **D-02:** 미니멀 기본 스타일 — 구조와 레이아웃 중심의 최소한 스타일링. 프로젝트에서 토큰 오버라이드로 커스터마이즈 쉽게.
- **D-03:** 전체 variant 세트 제공 — 버튼(primary/secondary/outline/text/ghost/link + 3가지 크기 + 비활성), 폼(기본+에러+성공+비활성), 카드(기본+가로+이미지) 등 컴포넌트 라이브러리 수준.
- **D-04:** 상세 반응형 — 모든 컴포넌트에 모바일/태블릿/PC 각각의 레이아웃 변화 정의. 보일러플레이트도 3단계 레이아웃. respond-to() 믹스인 활용.

### 접근성 내장 범위
- **D-05:** 바닐라 JS 포함 — 모달(포커스트랩, ESC닫기), 탭(키보드 좌우 전환), 기타 접근성 필수 JS를 함께 제공. 복사해서 바로 쓰는 수준.
- **D-06:** aria 속성 완전 내장 — role, aria-label, aria-expanded, aria-selected, aria-current, tabindex 등 해당 컴포넌트에 필요한 접근성 속성 전부 포함. Phase 4는 검증/체크리스트에 집중.

### 미리보기 페이지 구조
- **D-07:** 컴포넌트별 독립 HTML 페이지 — `src/playground/btn.html`, `src/playground/form.html` 등 각 컴포넌트마다 전용 미리보기 페이지. Phase 5 문서사이트에서 iframe으로 임베드 가능.
- **D-08:** 렌더링 + 코드 함께 표시 — 각 variant 아래에 렌더링 결과와 HTML 소스코드를 `<pre><code>`로 함께 표시. Phase 5 전에도 코드 확인 가능.

### AI 스니펫 포맷
- **D-09:** 컴포넌트별 스니펫 파일 생성 후 CLAUDE.md에서 경로 안내 — `src/snippets/btn.md`, `src/snippets/form.md` 등 별도 파일. CLAUDE.md에 "컴포넌트 스니펫은 `src/snippets/` 참조"로 안내. 설치 과정 없이 repo 클론만으로 적용.
- **D-10:** 스니펫 내용은 HTML 마크업 예제 + variant 목록 + 접근성 주의사항. SCSS는 파일 경로만 안내 (AI가 실제 SCSS 파일을 직접 읽음).

### Claude's Discretion
- 각 컴포넌트의 구체적 variant 세부 목록 (위 D-03 범위 내에서)
- 컴포넌트별 반응형 브레이크포인트 동작 세부사항
- 바닐라 JS 구현 방식 (모듈 패턴, 이벤트 위임 등)
- 미리보기 페이지 레이아웃/디자인
- 스니펫 .md 파일 내부 구조

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### KRDS 공공 디자인시스템
- https://www.krds.go.kr/ — KRDS 컴포넌트 접근성 패턴, 마크업 구조 참조

### Phase 1~2 산출물 (토큰 + BEM 기반)
- `src/scss/1-settings/` — 색상, 타이포, 간격, 그리드, 기타 토큰 정의
- `src/scss/2-tools/_responsive.scss` — respond-to() 반응형 믹스인
- `src/scss/2-tools/_mixins.scss` — flex-center, ellipsis 등 공용 믹스인
- `src/scss/5-objects/_container.scss` — 컨테이너 BEM 패턴
- `src/scss/5-objects/_grid.scss` — 그리드 BEM 패턴 (`.grid__col-*`)
- `src/scss/7-utilities/_sr-only.scss` — 스크린리더 전용 유틸리티
- `.stylelintrc.json` — BEM 린팅 설정

### 기존 프로젝트 참고 (컴포넌트 패턴)
- `/Users/johyeonchang/Documents/Work/code/gitCode/webstyleguide/` — 기존 컴포넌트 패턴 (btn, form, card, tab, pagination, breadcrumb, modal)

### 프로젝트 문서
- `.planning/phases/01-foundation-design-tokens-scss-architecture/01-CONTEXT.md` — Phase 1 결정사항
- `.planning/phases/02-conventions-bem-linting/02-CONTEXT.md` — Phase 2 결정사항 (BEM 규칙)
- `./CLAUDE.md` — 현재 프로젝트 AI 지시문 (Phase 3 완료 후 컴포넌트 스니펫 경로 추가 대상)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/scss/6-components/_index.scss` — 비어있음, Phase 3에서 채울 예정
- `src/playground/index.html` — 토큰 플레이그라운드, 컴포넌트 미리보기 페이지 패턴 참고
- Phase 1 토큰: `var(--color-*)`, `var(--spacing-*)`, `var(--font-size-*)`, `var(--radius-*)`, `var(--shadow-*)`, `var(--transition-*)`

### Established Patterns
- BEM: `.block__element--modifier` (Phase 2에서 확립, Stylelint으로 검증)
- ITCSS: 컴포넌트는 `src/scss/6-components/` 레이어에 배치
- 모듈 시스템: `@use`/`@forward`, 새 파일 추가 시 `_index.scss`에 `@forward` 추가
- 62.5% REM 트릭: 1rem = 10px
- 반응형: 모바일 퍼스트, respond-to('tablet'), respond-to('pc'), respond-to('tablet-up')

### Integration Points
- 새 컴포넌트 SCSS: `src/scss/6-components/_btn.scss` 등 → `_index.scss`에 `@forward`
- 미리보기 HTML: `src/playground/btn.html` 등 → 빌드된 CSS 참조
- AI 스니펫: `src/snippets/btn.md` 등 → CLAUDE.md에서 경로 안내
- Phase 4 (Accessibility)에서 이 컴포넌트들을 pa11y-ci로 자동 검증
- Phase 5 (Documentation Site)에서 미리보기 HTML을 iframe 임베드

</code_context>

<specifics>
## Specific Ideas

- 기존 프로젝트(webstyleguide)의 컴포넌트 패턴(`.btn-primary`, `.card-header`)을 BEM 변환한 형태로 제공 — 팀이 기존 패턴과 새 BEM 패턴의 대응을 바로 이해
- 스니펫 파일은 repo 안에 있으므로 팀원이 별도 설치 없이 프로젝트 클론만으로 AI 활용 가능
- 바닐라 JS는 프레임워크 비의존 — jQuery, React 등 없이 순수 JS로 접근성 동작 구현

</specifics>

<deferred>
## Deferred Ideas

- Accordion, Alert, Badge, Tooltip, Dropdown 등 추가 컴포넌트 — v2 EXT-03
- 다크모드 variant — v2 EXT-01
- Figma 컴포넌트와 코드 클래스명 매핑 — Phase 6
- 컴포넌트 단위 테스트 — Phase 4에서 pa11y-ci로 통합 검증

</deferred>

---

*Phase: 03-components-html-scss-snippets*
*Context gathered: 2026-03-25*
