# Requirements: INFOMIND UX 디자인/퍼블리싱 가이드 시스템

**Defined:** 2026-03-25
**Core Value:** 신규 프로젝트 시작 시 검증된 팀 표준을 즉시 적용할 수 있어야 한다

## v1 Requirements

### AI 활용성 (AI)

- [x] **AI-01**: 모든 가이드 문서가 AI 프롬프트로 바로 활용 가능한 구조화된 형태 (CLAUDE.md / 스킬 파일 등)
- [x] **AI-02**: 컴포넌트 스니펫이 AI가 복사해서 바로 코드 생성에 활용 가능한 포맷
- [x] **AI-03**: 디자인 토큰/BEM 규칙이 AI 지시문(instruction) 형태로도 제공되어 프로젝트 시작 시 즉시 주입 가능

### 디자인 토큰 (TOKEN)

- [x] **TOKEN-01**: 색상 토큰 체계 정의 (Primary, Secondary, Gray scale, Semantic colors) — KRDS 공공 디자인시스템 색상 기준 반영
- [x] **TOKEN-02**: 타이포그래피 토큰 정의 (폰트 패밀리, 사이즈 스케일, line-height, font-weight)
- [x] **TOKEN-03**: 간격(Spacing) 토큰 정의 (4px 기반 스케일: xs~3xl)
- [x] **TOKEN-04**: 그리드 시스템 토큰 정의 (12컬럼, 거터, 컨테이너 max-width)
- [x] **TOKEN-05**: 기타 토큰 정의 (border-radius, box-shadow, transition, z-index)
- [x] **TOKEN-06**: Style Dictionary JSON → SCSS 변수 + CSS Custom Properties 파이프라인 구축
- [x] **TOKEN-07**: 토큰 시각적 플레이그라운드 페이지 (색상 팔레트, 타입 스케일, 간격 미리보기)

### SCSS 아키텍처 (SCSS)

- [x] **SCSS-01**: ITCSS 기반 SCSS 폴더 구조 정의 (settings/tools/base/layout/components/utilities)
- [x] **SCSS-02**: 기존 공통 믹스인 정리 및 개선 (flex, fsize, ellipse, ani, border-radius, drop-shadow 등)
- [x] **SCSS-03**: 반응형 브레이크포인트 표준화 (Mobile: 360px, Tablet: 768px, Desktop: 1200px)
- [x] **SCSS-04**: REM 함수 및 유틸리티 설정 (16px 기준)
- [x] **SCSS-05**: Normalize/Reset SCSS 정리
- [x] **SCSS-06**: SCSS 파일 구조 가이드 문서 (어디에 무엇을 넣는지 설명)

### BEM & 코딩 컨벤션 (BEM)

- [x] **BEM-01**: BEM 네이밍 규칙 가이드 (Block__Element--Modifier 표기법 명확화)
- [x] **BEM-02**: BEM do/don't 예제 모음 (기존 프로젝트의 잘못된 패턴 vs 올바른 패턴)
- [x] **BEM-03**: SCSS에서 BEM 중첩 작성 규칙 (&__element, &--modifier 패턴)
- [x] **BEM-04**: Stylelint + BEM 패턴 린팅 설정 파일 (.stylelintrc) 템플릿 제공

### 컴포넌트 (COMP)

- [x] **COMP-01**: 버튼 컴포넌트 HTML+SCSS (Primary, Secondary, Outline, Text, 크기 변형, 비활성)
- [x] **COMP-02**: 폼 컴포넌트 HTML+SCSS (Input, Select, Checkbox, Radio, Textarea, 유효성 상태)
- [x] **COMP-03**: 카드 컴포넌트 HTML+SCSS (Header, Body, Footer 구조)
- [x] **COMP-04**: 테이블 컴포넌트 HTML+SCSS (기본, 스트라이프, 반응형 테이블)
- [x] **COMP-05**: 모달 컴포넌트 HTML+SCSS (오버레이, 포커스 트랩, 닫기 처리)
- [x] **COMP-06**: 탭 컴포넌트 HTML+SCSS (role="tablist", aria-selected, 키보드 네비게이션)
- [x] **COMP-07**: 페이지네이션 컴포넌트 HTML+SCSS (이전/다음, 숫자, aria-label)
- [x] **COMP-08**: 브레드크럼 컴포넌트 HTML+SCSS (aria-label="breadcrumb", aria-current)
- [x] **COMP-09**: HTML 페이지 보일러플레이트 (lang="ko", viewport, skip-to-content, 시맨틱 구조)
- [x] **COMP-10**: 각 컴포넌트에 라이브 미리보기 제공 (코드 옆에 렌더링된 결과)
- [x] **COMP-11**: 모든 컴포넌트 KRDS 공공 디자인시스템 가이드라인 준수 확인

### 접근성 (A11Y)

- [x] **A11Y-01**: KWCAG/WCAG 2.1 AA 퍼블리싱 체크리스트 (체크 가능한 항목별 목록)
- [x] **A11Y-02**: KWCAG 2.2 확대 항목 (33개 검사항목) 반영
- [x] **A11Y-03**: 컴포넌트별 접근성 패턴 내장 (aria-*, role, tabindex, 키보드 네비게이션)
- [x] **A11Y-04**: 스크린리더 전용 콘텐츠 (.sr-only) 패턴 가이드
- [x] **A11Y-05**: 색상 대비 가이드 (4.5:1 이상, 확인 도구 안내)
- [x] **A11Y-06**: pa11y-ci 자동화 접근성 테스트 통합 가이드

### 문서 사이트 (DOCS)

- [x] **DOCS-01**: Eleventy 기반 문서 사이트 구축 (정적 HTML 출력)
- [x] **DOCS-02**: 컴포넌트 미리보기 + 코드 예제 페이지
- [x] **DOCS-03**: 코드 예제 copy-to-clipboard 기능
- [x] **DOCS-04**: 문서 내 검색 기능 (pagefind 등)
- [x] **DOCS-05**: 가이드 문서 페이지 (토큰, BEM, SCSS 구조, 접근성 등)
- [x] **DOCS-06**: 문서 사이트 자체가 KWCAG/WCAG AA 준수

### 핸드오프 & 온보딩 (HAND)

- [x] **HAND-01**: 신규 팀원 온보딩 가이드 (가이드 시스템 사용법, 시작 방법)
- [x] **HAND-02**: 피그마→코드 핸드오프 규칙 (컴포넌트 네이밍 매핑, 토큰 연결, 전달 항목)
- [x] **HAND-03**: 프로젝트 스타터 킷 (SCSS+HTML 보일러플레이트 패키지 다운로드/설치)

## v0.9 Requirements

### 피그마 컨벤션 (FIG)

- [x] **FIG-01**: 피그마 컴포넌트 네이밍 규칙 (계층 구조, 구분자, 대소문자 규칙)
- [x] **FIG-02**: 피그마 레이어/프레임 구조 가이드 (페이지 정리, 그룹 네이밍)
- [x] **FIG-03**: 피그마 Variable 네이밍 규칙 + CSS Custom Property 매핑
- [x] **FIG-04**: 피그마 Auto Layout 규칙 (패딩/갭 토큰 매핑, 반응형 동작 정의)

### 디자인 QA (DQA)

- [ ] **DQA-01**: 디자인 QA 체크리스트 (핸드오프 전 디자이너 자체 점검 항목)
- [ ] **DQA-02**: 디자인→코드 픽셀 퍼펙트 허용 범위 정의 (간격, 폰트, 컬러 오차 기준)

### 테스트 가이드 (TEST)

- [ ] **TEST-01**: 타겟 브라우저/디바이스 목록 + 크로스 브라우저 테스트 체크리스트
- [ ] **TEST-02**: 모바일/터치 테스트 가이드 (호버 상태, 터치 타겟, 제스처)
- [ ] **TEST-03**: CSS 회귀 테스트 가이드 (의도하지 않은 스타일 변경 감지)

### 퍼블리싱 심화 (PUB)

- [ ] **PUB-01**: 시맨틱 HTML 마크업 가이드 (heading 계층, section/article/nav/aside 사용법)
- [ ] **PUB-02**: 이미지 처리 규칙 (WebP 대응, lazy loading, SVG 최적화, 파일 네이밍)
- [ ] **PUB-03**: CSS 성능 가이드라인 (선택자 깊이 제한, 미사용 CSS 감지, 파일 크기 기준)
- [ ] **PUB-04**: CSS 애니메이션/트랜지션 가이드 (타이밍, prefers-reduced-motion 대응)

### 거버넌스 & 버전 관리 (GOV)

- [ ] **GOV-01**: 컴포넌트 라이프사이클 라벨링 (stable/beta/experimental 기준 정의)
- [ ] **GOV-02**: 가이드 시스템 버전 정책 (시맨틱 버전, 변경 이력 형식)
- [ ] **GOV-03**: 기여 가이드 + 이슈/버그 리포트 템플릿
- [ ] **GOV-04**: 토큰/컴포넌트 추가·변경 승인 프로세스 (거버넌스)

## v0.9.5 Requirements

### SCSS 버그 수정 (FIX)

- [ ] **FIX-01**: _table.scss striped 범위 복원 — &__body 하위만 스트라이프 적용
- [ ] **FIX-02**: _form.scss, _modal.scss color-mix() 브라우저 호환 — rgba fallback 추가
- [ ] **FIX-03**: Stylelint 경고 정리 — clip→clip-path, rgba→modern notation, :not() 문법

### 접근성 테스트 보강 (A11FIX)

- [ ] **A11FIX-01**: .pa11yci.js 누락 URL 추가 (design-qa 3, guides 5, onboarding 3 = 11개)

### 문서 사이트 UX (SITE)

- [ ] **SITE-01**: 홈페이지 완성 — v0.9 추가 섹션(피그마, 테스트, 거버넌스, 퍼블리싱 심화) 링크 추가
- [ ] **SITE-02**: 이전/다음 페이지 네비게이션 — 페이지 하단에 순차 이동 링크
- [ ] **SITE-03**: 문서 간 상호 링크 — figma/* ↔ components/*, tokens/* 양방향 참조

### 온보딩 개선 (ONBOARD)

- [ ] **ONBOARD-01**: starter README 개선 — 퍼블리셔 퀵스타트 6단계, 빌드 출력 설명, 커스터마이징 확장

## v1.0 Requirements

### 디자인 AI 프롬프트 (PROMPT-D)

- [ ] **PROMPT-D01**: 디자인 AI용 범용 프롬프트 (`prompts/design.md`) — 토큰(색상/타이포/간격), 컴포넌트 구조, 접근성 규칙을 AI 종속 문법 없이 작성
- [ ] **PROMPT-D02**: 피그마 AI 전용 프롬프트 (`prompts/figma.md`) — 컴포넌트 네이밍, Variable, Auto Layout, 레이어 구조 규칙

### 퍼블리싱 AI 프롬프트 (PROMPT-P)

- [ ] **PROMPT-P01**: 퍼블리싱 AI용 범용 프롬프트 (`prompts/publishing.md`) — BEM, ITCSS, 토큰, 반응형, 접근성 규칙을 CLAUDE.md에서 AI 종속 문법 제거하여 추출
- [ ] **PROMPT-P02**: 컴포넌트 스니펫 프롬프트 (`prompts/components.md`) — 8개 컴포넌트 HTML+CSS 패턴을 AI가 바로 참조 가능한 형태로 압축

### 대화형 AI 프롬프트 (PROMPT-C)

- [ ] **PROMPT-C01**: 대화형 AI용 컨텍스트 프롬프트 (`prompts/context.md`) — 팀 규칙 전체를 2000토큰 이내로 압축한 요약 버전
- [ ] **PROMPT-C02**: 코드 리뷰 프롬프트 (`prompts/review.md`) — BEM/토큰/접근성 체크리스트를 AI 리뷰어에게 주입 가능한 형태

### 프롬프트 배포 (PROMPT-SITE)

- [ ] **PROMPT-SITE01**: 문서 사이트에 프롬프트 섹션 추가 (`site/prompts/`) — 각 프롬프트를 복사 버튼과 함께 제공
- [ ] **PROMPT-SITE02**: 프롬프트 사용 가이드 — 어떤 AI 도구에 어떤 프롬프트를 넣는지 매핑 테이블

## v1.1 Requirements

### 토큰 파이프라인 (PIPE)

- [ ] **PIPE-01**: tokens.json 싱글 소스 생성 — DTCG 포맷($value, $type)으로 색상/타이포/간격/그리드/기타 토큰 정의
- [ ] **PIPE-02**: tokens.json → SCSS :root 자동 생성 스크립트 — 기존 _tokens-*.scss 파일을 스크립트 출력으로 대체
- [ ] **PIPE-03**: tokens.json → prompts/design.md 토큰 섹션 자동 생성 — 프롬프트 내 토큰 값이 항상 최신 유지

### 컴포넌트 조합 패턴 (COMBO)

- [ ] **COMBO-01**: 실전 레이아웃 예제 3종 — 모달+폼, 카드그리드+페이지네이션, 검색폼+테이블 playground HTML
- [ ] **COMBO-02**: 조합 패턴 문서 페이지 — site/components/ 하위에 조합 예제 문서 + iframe 미리보기

### 빌드 통합 (BUILD)

- [ ] **BUILD-01**: npm run build 통합 — tokens → CSS → docs-css → prompts → site 전체 파이프라인 한 명령
- [ ] **BUILD-02**: npm run build:prompts 스크립트 — tokens.json + snippets에서 prompts/*.md 자동 재생성

## v1.2 Requirements

### 마이크로카피 (MICRO)

- [ ] **MICRO-01**: 마이크로카피 가이드 — 에러 메시지 3-part 공식(what/why/how), 버튼 텍스트 규칙(동사형 2~4단어), 톤 매핑(B2B/소비자/공공), 플레이스홀더 규칙, 숫자 포맷

### 인터랙션 (INTER)

- [ ] **INTER-01**: 인터랙션 타이밍 규격 — 컴포넌트별 전환 시간(버튼 100ms, 모달 300ms), 이징 함수, prefers-reduced-motion 대응, Figma 프로토타입 설정 매핑

### 디자인 감사 (AUDIT)

- [ ] **AUDIT-01**: 디자인 감사 프레임워크 — 17점 체크리스트 + Quick 5 기본 점검 + 점수 체계(100점 만점, Critical/Warning/Tip 심각도)

### UI 상태 패턴 (STATE)

- [ ] **STATE-01**: UI 상태 패턴 가이드 — 로딩(Skeleton vs Spinner vs ProgressBar 의사결정 트리), 에러(3단계 심각도 + Alert 구조), 빈 상태(아이콘+제목+설명+CTA 템플릿), 폼 유효성 타이밍(blur/change/submit)

### 아이콘 시스템 (ICON)

- [ ] **ICON-01**: 아이콘 시스템 규격 — 8pt 그리드(12/16/20/24/32/40/48px만 허용), Lucide 표준 라이브러리, 금지 사이즈(18/22/26/28/36px), 접근성(aria-hidden + 텍스트 라벨)

### 미학 원칙 (AESTH)

- [ ] **AESTH-01**: 프론트엔드 미학 원칙 — AI 슬롭 안티패턴(Inter 기본폰트, 보라색 그라디언트, 예측 가능 레이아웃), 5트랙 디자인 사고, 비대칭 레이아웃 원칙, INFOMIND 제품별 UI 스타일 매핑

### 문서 사이트 통합 (DSSITE)

- [ ] **DSSITE-01**: 위 6개 가이드를 문서 사이트 site/design/ 섹션으로 통합 + 네비게이션 + pa11yci

## v1.3 Requirements

### 빌드 시스템 (BSYS)

- [ ] **BSYS-01**: .gitignore 강화 — _site/, .claude/worktrees/, .DS_Store, *.log, dist/ 명시적 제외
- [ ] **BSYS-02**: worktree 잔해 정리 — 20개 worktree 브랜치 삭제, .claude/worktrees/ 디렉토리 정리
- [ ] **BSYS-03**: serve 모드 CSS 핫리로드 — npm run serve에서 SCSS 변경 시 _site/dist/css/ 자동 갱신
- [ ] **BSYS-04**: npm test 통합 — lint:css + test:a11y를 한 명령으로 실행

### starter kit 실증 (STARTER)

- [ ] **STARTER-01**: 클린 디렉토리에서 starter kit 독립 빌드 검증 — cp -r starter/ /tmp/test-project/ → npm install → npm run build:css → 성공 확인
- [ ] **STARTER-02**: starter kit에서 lint:css, playground HTML 정상 동작 확인

### 콘텐츠 감사 (CONTENT)

- [ ] **CONTENT-01**: 71페이지 중 100줄 미만 얇은 페이지 식별 + 보강 (최소 기준: 제목 + 개요 + 본문 내용 + 예제)

## v1.4 Requirements

### 콘텐츠 재작성 (REWRITE)

- [ ] **REWRITE-01**: design/aesthetics.md 재작성 — 추상적 원칙 → 실제 프로젝트 사례(Before/After), INFOMIND 제품별 적용 예시로 교체
- [ ] **REWRITE-02**: design/icon-system.md 보강 — Lucide 라이브러리 링크, 실제 사용 코드(`<svg>` 인라인 + aria-hidden), 컨텍스트별 크기 예제
- [ ] **REWRITE-03**: guides/css-animation.md 보강 — 각 전환 토큰의 실제 CSS transition/animation 코드 예제 추가

### 사이트 디자인 고도화 (UI)

- [ ] **UI-01**: docs.scss 사이드바 아코디언 — 섹션별 펼침/닫힘, 현재 섹션 자동 열림
- [ ] **UI-02**: docs.scss 콘텐츠 영역 — heading 스타일 개선(h1 밑줄, h2 좌측 포인트), 본문 줄간격/여백 최적화
- [ ] **UI-03**: docs.scss 코드 블록 — 파일명 표시 바, 줄번호 옵션, 복사 버튼 위치 개선
- [ ] **UI-04**: docs.scss 컴포넌트 미리보기 — iframe 영역 테두리/배경 구분, "코드 보기/미리보기" 탭 전환

## v2 Requirements

### 확장 기능

- **EXT-01**: 다크/라이트 모드 토글 (CSS Custom Properties 기반 테마 시연)
- **EXT-02**: 디자인 토큰 Figma Variables 자동 동기화 (Tokens Studio 연동)
- **EXT-03**: 추가 컴포넌트 확장 (Accordion, Alert, Badge, Tooltip, Dropdown 등)
- **EXT-04**: 다국어 지원 컴포넌트 가이드 (한/영/중/일 — visitjeju 참고)

## Out of Scope

| Feature | Reason |
|---------|--------|
| JavaScript 프레임워크 컴포넌트 라이브러리 | HTML/CSS 퍼블리싱 범위에 집중, JS는 프로젝트별 상이 |
| Figma UI Kit / 컴포넌트 라이브러리 직접 제작 | 규칙/가이드 문서화가 목적, 피그마 라이브러리 구축은 별도 프로젝트 |
| CI/CD 파이프라인 구성 | 빌드/배포는 프로젝트별 상이, 린트/테스트 스크립트만 제공 |
| 백엔드 API 연동 가이드 | 프론트엔드 마크업/스타일링 영역만 다룸 |
| 복잡한 테마 엔진 | 대부분 $color-main만 변경, CSS Custom Properties로 간단히 처리 |
| 가이드 문서 다국어(i18n) | 팀 내부 사용, 한국어 단일 언어 |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

### v0.8 (Complete)

| Requirement | Phase | Status |
|-------------|-------|--------|
| AI-01 | Phase 5 | Complete |
| AI-02 | Phase 3 | Complete |
| AI-03 | Phase 2 | Complete |
| TOKEN-01 | Phase 1 | Complete |
| TOKEN-02 | Phase 1 | Complete |
| TOKEN-03 | Phase 1 | Complete |
| TOKEN-04 | Phase 1 | Complete |
| TOKEN-05 | Phase 1 | Complete |
| TOKEN-06 | Phase 1 | Complete |
| TOKEN-07 | Phase 1 | Complete |
| SCSS-01 | Phase 1 | Complete |
| SCSS-02 | Phase 1 | Complete |
| SCSS-03 | Phase 1 | Complete |
| SCSS-04 | Phase 1 | Complete |
| SCSS-05 | Phase 1 | Complete |
| SCSS-06 | Phase 1 | Complete |
| BEM-01 | Phase 2 | Complete |
| BEM-02 | Phase 2 | Complete |
| BEM-03 | Phase 2 | Complete |
| BEM-04 | Phase 2 | Complete |
| COMP-01 | Phase 3 | Complete |
| COMP-02 | Phase 3 | Complete |
| COMP-03 | Phase 3 | Complete |
| COMP-04 | Phase 3 | Complete |
| COMP-05 | Phase 3 | Complete |
| COMP-06 | Phase 3 | Complete |
| COMP-07 | Phase 3 | Complete |
| COMP-08 | Phase 3 | Complete |
| COMP-09 | Phase 3 | Complete |
| COMP-10 | Phase 3 | Complete |
| COMP-11 | Phase 3 | Complete |
| A11Y-01 | Phase 4 | Complete |
| A11Y-02 | Phase 4 | Complete |
| A11Y-03 | Phase 4 | Complete |
| A11Y-04 | Phase 4 | Complete |
| A11Y-05 | Phase 4 | Complete |
| A11Y-06 | Phase 4 | Complete |
| DOCS-01 | Phase 5 | Complete |
| DOCS-02 | Phase 5 | Complete |
| DOCS-03 | Phase 5 | Complete |
| DOCS-04 | Phase 5 | Complete |
| DOCS-05 | Phase 5 | Complete |
| DOCS-06 | Phase 5 | Complete |
| HAND-01 | Phase 6 | Complete |
| HAND-02 | Phase 6 | Complete |
| HAND-03 | Phase 6 | Complete |

### v0.9 (Complete)

| Requirement | Phase | Status |
|-------------|-------|--------|
| FIG-01 | Phase 7 | Complete |
| FIG-02 | Phase 7 | Complete |
| FIG-03 | Phase 7 | Complete |
| FIG-04 | Phase 7 | Complete |
| DQA-01 | Phase 8 | Complete |
| DQA-02 | Phase 8 | Complete |
| PUB-01 | Phase 9 | Complete |
| PUB-02 | Phase 9 | Complete |
| PUB-03 | Phase 9 | Complete |
| PUB-04 | Phase 9 | Complete |
| TEST-01 | Phase 10 | Complete |
| TEST-02 | Phase 10 | Complete |
| TEST-03 | Phase 10 | Complete |
| GOV-01 | Phase 11 | Complete |
| GOV-02 | Phase 11 | Complete |
| GOV-03 | Phase 11 | Complete |
| GOV-04 | Phase 11 | Complete |

### v0.9.5 (Complete)

| Requirement | Phase | Status |
|-------------|-------|--------|
| FIX-01 | Phase 12 | Complete |
| FIX-02 | Phase 12 | Complete |
| FIX-03 | Phase 12 | Complete |
| A11FIX-01 | Phase 12 | Complete |
| SITE-01 | Phase 13 | Complete |
| SITE-02 | Phase 13 | Complete |
| SITE-03 | Phase 13 | Complete |
| ONBOARD-01 | Phase 13 | Complete |

### v1.0 (Complete)

| Requirement | Phase | Status |
|-------------|-------|--------|
| PROMPT-D01 | Phase 14 | Complete |
| PROMPT-D02 | Phase 14 | Complete |
| PROMPT-P01 | Phase 14 | Complete |
| PROMPT-P02 | Phase 14 | Complete |
| PROMPT-C01 | Phase 14 | Complete |
| PROMPT-C02 | Phase 14 | Complete |
| PROMPT-SITE01 | Phase 15 | Complete |
| PROMPT-SITE02 | Phase 15 | Complete |

### v1.1 (Complete)

| Requirement | Phase | Status |
|-------------|-------|--------|
| PIPE-01 | Phase 16 | Complete |
| PIPE-02 | Phase 16 | Complete |
| PIPE-03 | Phase 16 | Complete |
| COMBO-01 | Phase 17 | Complete |
| COMBO-02 | Phase 17 | Complete |
| BUILD-01 | Phase 18 | Complete |
| BUILD-02 | Phase 18 | Complete |

### v1.2 (Complete)

| Requirement | Phase | Status |
|-------------|-------|--------|
| MICRO-01 | Phase 19 | Complete |
| INTER-01 | Phase 19 | Complete |
| AUDIT-01 | Phase 19 | Complete |
| STATE-01 | Phase 19 | Complete |
| ICON-01 | Phase 19 | Complete |
| AESTH-01 | Phase 19 | Complete |
| DSSITE-01 | Phase 20 | Complete |

### v1.3 (Complete)

| Requirement | Phase | Status |
|-------------|-------|--------|
| BSYS-01 | Phase 21 | Complete |
| BSYS-02 | Phase 21 | Complete |
| BSYS-03 | Phase 21 | Complete |
| BSYS-04 | Phase 21 | Complete |
| STARTER-01 | Phase 21 | Complete |
| STARTER-02 | Phase 21 | Complete |
| CONTENT-01 | Phase 22 | Complete |

### v1.4 (In Progress)

| Requirement | Phase | Status |
|-------------|-------|--------|
| REWRITE-01 | Phase 23 | Pending |
| REWRITE-02 | Phase 23 | Pending |
| REWRITE-03 | Phase 23 | Pending |
| UI-01 | Phase 24 | Pending |
| UI-02 | Phase 24 | Pending |
| UI-03 | Phase 24 | Pending |
| UI-04 | Phase 24 | Pending |

**Coverage:**
- v0.8 requirements: 46 total (all complete)
- v0.9 requirements: 17 total (all complete)
- v0.9.5 requirements: 8 total (all complete)
- v1.0 requirements: 8 total (all complete)
- v1.1 requirements: 7 total (all complete)
- v1.2 requirements: 7 total (all complete)
- v1.3 requirements: 7 total (all complete)
- v1.4 requirements: 7 total (mapped: 7)
- Unmapped: 0

---
*Requirements defined: 2026-03-25*
*Last updated: 2026-03-27 -- v1.4 로드맵 생성, 트레이서빌리티 업데이트*
