# INFOMIND UX 디자인/퍼블리싱 가이드 시스템

## What This Is

인포마인드 UX팀의 디자인 및 퍼블리싱 기본 규칙과 템플릿을 체계화한 가이드 시스템. 피그마 디자인 단계부터 HTML/CSS 퍼블리싱까지의 컨벤션을 문서화하고, 신규 프로젝트에 바로 적용 가능한 코드 템플릿을 제공한다. 공공기관 사이트를 포함한 다양한 프로젝트에서 일관된 품질과 웹 접근성(KWCAG/WCAG AA)을 보장하기 위한 팀 표준.

## Core Value

신규 프로젝트 시작 시 디자인/퍼블리싱 규칙을 처음부터 다시 정하지 않고, 검증된 팀 표준을 즉시 적용할 수 있어야 한다.

## Current Milestone: v1.6 하네스 엔지니어링

**Goal:** Claude Code 하네스(CLAUDE.md, 훅, 스킬)를 최적화하여 AI 협업 효율을 극대화한다

**Target features:**
- CLAUDE.md 경량화 — 토큰 값 나열 제거, 파일 참조로 대체, 규칙/판단 기준만 유지
- lint 훅 — SCSS Edit/Write 후 npm run lint:css 자동 실행
- 컴포넌트 생성 스킬 — SCSS + 스니펫 + playground + site 문서 일괄 생성
- sync:starter 훅 — 커밋 시 스타터킷 레포 자동 동기화
- 프로젝트 CLAUDE.md 생성 스킬 — 스타터킷 기반 새 프로젝트 맞춤 CLAUDE.md 생성
- 전반적 폰트 크기/여백 확대 (현대적 시원한 느낌)
- 문서/스니펫 역갱신 (코드와 문서 일치)

## Requirements

### Validated (v0.8)

- ✓ 디자인 토큰 체계 (색상, 타이포, 간격, 그리드) — Phase 1
- ✓ 반응형 브레이크포인트 기준 정의 — Phase 1
- ✓ SCSS 구조/변수/믹스인 템플릿 — Phase 1
- ✓ BEM 기반 CSS 네이밍 컨벤션 가이드 — Phase 2
- ✓ 공통 컴포넌트 HTML+SCSS 스니펫 — Phase 3
- ✓ 웹 접근성(KWCAG/WCAG AA) 퍼블리싱 체크리스트 — Phase 4
- ✓ 문서 사이트 (Eleventy 기반) — Phase 5
- ✓ 신규 팀원 온보딩 가이드 + 스타터 킷 — Phase 6

### Active (v0.9)

- [ ] 피그마 컴포넌트 네이밍/구조 컨벤션
- [ ] 피그마 Variable 네이밍 + 토큰 연결 규칙
- [ ] 피그마 Auto Layout 규칙 (패딩/갭 토큰 매핑)
- [ ] 디자인 QA 체크리스트 (핸드오프 전 자체 점검)
- [ ] 크로스 브라우저/디바이스 테스트 가이드 (타겟 브라우저 목록)
- [ ] 시맨틱 HTML 마크업 가이드 (heading 계층, section/article 구조)
- [ ] 이미지 처리 규칙 (WebP, lazy loading, SVG 최적화, 네이밍)
- [ ] CSS 성능 가이드라인 (선택자 깊이, 미사용 CSS)
- [ ] 컴포넌트 라이프사이클 (stable/beta/experimental 라벨링)
- [ ] 버전 정책 + 변경 이력 형식
- [ ] 기여 가이드 + 이슈 템플릿
- [ ] 거버넌스 문서 (토큰/컴포넌트 승인 프로세스)

### Out of Scope

- JavaScript/프레임워크 규칙 — 퍼블리싱(HTML/CSS) 범위에 집중, JS는 프로젝트별 상이
- 백엔드 연동 가이드 — 프론트엔드 마크업/스타일링 영역만 다룸
- 디자인 시스템 UI Kit 제작 — 규칙/가이드 문서화가 목적, 피그마 라이브러리 자체 구축은 별도
- CI/CD 파이프라인 — 빌드/배포는 프로젝트별 상이

## Context

- 인포마인드 UX팀은 공공기관 사이트를 포함해 기업 웹사이트, 관리자 대시보드, 모바일 앱 등 다양한 프로젝트를 수행
- 공공기관 사이트 비중이 높아 KWCAG(한국형 웹 콘텐츠 접근성 지침) 준수가 필수
- 기존에 CLAUDE.md에 BEM, SCSS(dart-sass), 2 spaces, single quote 등 기본 컨벤션이 있으나 체계적으로 정리된 적 없음
- 이번에 기존 규칙을 참고하되 처음부터 새로 체계화하려는 목적
- 결과물은 문서(가이드) + 코드 템플릿(SCSS/HTML) 두 가지 형태로 제공
- **핵심 사용 시나리오**: AI(클로드 등)에게 가이드를 줬을 때 바로 규칙대로 코드를 생성할 수 있어야 함 — CLAUDE.md/스킬 파일 등 AI instruction 형태도 필수
- KRDS(한국 공공 디자인시스템) 기준 반영 필요 — 공공기관 사이트 납품 시 KRDS 준수 요구

### 기존 프로젝트 분석 (참고 자료)

**참고 경로:**
- 기존 코드: `/Users/johyeonchang/Documents/Work/code/` (gitCode, ftpCode)
- 기존 디자인: `/Users/johyeonchang/Documents/Work/design/`
- 가장 체계적인 참조: `code/gitCode/webstyleguide/` (비짓제주 스타일가이드)

**기존 SCSS 구조 (전 프로젝트 공통):**
- 파일 구조: `_normalize.scss`, `_rem.scss`, `_font.scss`, `_color.scss`, `_mixin.scss`, `_default.scss`, `style.scss`
- Import 순서: normalize → rem → font → color → mixin → default
- REM 함수: sass-rem 패키지, 16px 기준

**기존 공통 믹스인:**
- `flex` (display:flex + center), `full` (width/height 100%), `fsize` (font-size + line-height 1.4배)
- `ellipse` (텍스트 말줄임), `ani` (transition 0.4s), `border-radius`, `drop-shadow`
- `pmz` (padding/margin), `backcover` (배경이미지), `placeholder` (인풋 플레이스홀더)

**기존 폰트:**
- 주력: Pretendard GOV (+ Malgun Gothic, apple sd gothic neo 폴백)
- 프로젝트별: Spoqa Han Sans Neo, Noto Sans KR 도 사용

**기존 색상 변수:**
- `$color-main`: 프로젝트별 상이 (#1886d8, #2C8CCB, #EF8200 등)
- `$color-black: #222`, `$color-font-main: #222`
- 그레이 스케일: #404040, #666, #9ca3af, #ccc, #efefef, #f0f0f0 등
- webstyleguide에서 CSS Custom Properties로 정리: `--primary-color`, `--gray-900` ~ `--gray-100`

**기존 브레이크포인트:**
- 모바일 최소: 360px
- 태블릿: 768px
- 데스크탑: 1200px 또는 1280px (프로젝트별 상이)
- 12컬럼 Bootstrap 스타일 그리드 (col-xs, col-sm, col-md, col-lg)

**기존 접근성 패턴:**
- `.sr-only` / `.sr-only-focusable` 전 프로젝트 동일 구현
- 본문 건너뛰기 링크 (`<a href="#main-content" class="skip-to-content">`)
- 테이블 caption 숨김, thead-hidden
- 색상 대비 4.5:1 이상 유지 (#222 on #fff = 10.7:1)

**기존 HTML 보일러플레이트:**
- `lang="ko"`, viewport 메타, skip-to-content 링크
- header > .inner-conts > h1.logo + nav.gnb
- div#container > main#main-content + aside.sidebar
- footer#footer
- webstyleguide: CSS Grid 레이아웃 (grid-template-areas)

**기존 컴포넌트:**
- 버튼: `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-outline`, 크기 `.btn-large`/`.btn-small`
- 폼: `.form-group` > label + `.form-control`
- 카드: `.card` > `.card-header` + `.card-body` + `.card-footer`
- 탭: `role="tablist"` + `role="tab"` + `role="tabpanel"` (접근성 포함)
- 페이지네이션, 브레드크럼, 모달

**BEM 적용 현황:**
- 공식적으로 BEM을 표방하지만 실제로는 하이픈(-) 위주의 느슨한 적용
- `__` (element)보다 `-` 하이픈 네이밍이 주류
- 모디파이어는 `&.active`, `&.on` 등 SCSS 중첩으로 처리
- → 이번 가이드에서 BEM 적용 수준을 명확히 정의할 필요 있음

## Constraints

- **CSS 방법론**: BEM(Block__Element--Modifier) 필수 — 팀 합의 사항
- **전처리기**: SCSS(dart-sass) — 팀 표준
- **패키지 매니저**: npm — 팀 표준
- **접근성**: KWCAG/WCAG 2.1 AA 이상 — 공공기관 납품 요건
- **코딩 스타일**: 2 spaces, single quote, 세미콜론 없음 — 팀 합의
- **주석 언어**: 한국어 — 팀 내 소통 언어

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| BEM 네이밍 유지 | 팀 합의 사항, 기존 프로젝트와 일관성 | — Pending |
| 접근성을 핵심 축으로 편입 | 공공기관 사이트 비중이 높아 선택이 아닌 기본 전제 | — Pending |
| 기존 규칙 참고하되 새로 체계화 | 기존 규칙이 산발적이라 처음부터 구조화 필요 | — Pending |
| 기존 프로젝트 코드를 참고 자료로 활용 | design/, code/ 폴더의 실제 프로젝트 패턴 분석 결과 반영 | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-28 — Milestone v1.6 started*
