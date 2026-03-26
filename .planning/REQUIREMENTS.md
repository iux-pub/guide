# Requirements: INFOMIND UX 디자인/퍼블리싱 가이드 시스템

**Defined:** 2026-03-25
**Core Value:** 신규 프로젝트 시작 시 검증된 팀 표준을 즉시 적용할 수 있어야 한다

## v1 Requirements

### AI 활용성 (AI)

- [ ] **AI-01**: 모든 가이드 문서가 AI 프롬프트로 바로 활용 가능한 구조화된 형태 (CLAUDE.md / 스킬 파일 등)
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

- [ ] **DOCS-01**: Eleventy 기반 문서 사이트 구축 (정적 HTML 출력)
- [ ] **DOCS-02**: 컴포넌트 미리보기 + 코드 예제 페이지
- [ ] **DOCS-03**: 코드 예제 copy-to-clipboard 기능
- [ ] **DOCS-04**: 문서 내 검색 기능 (pagefind 등)
- [ ] **DOCS-05**: 가이드 문서 페이지 (토큰, BEM, SCSS 구조, 접근성 등)
- [ ] **DOCS-06**: 문서 사이트 자체가 KWCAG/WCAG AA 준수

### 핸드오프 & 온보딩 (HAND)

- [ ] **HAND-01**: 신규 팀원 온보딩 가이드 (가이드 시스템 사용법, 시작 방법)
- [ ] **HAND-02**: 피그마→코드 핸드오프 규칙 (컴포넌트 네이밍 매핑, 토큰 연결, 전달 항목)
- [ ] **HAND-03**: 프로젝트 스타터 킷 (SCSS+HTML 보일러플레이트 패키지 다운로드/설치)

## v0.9 Requirements

### 피그마 컨벤션 (FIG)

- [ ] **FIG-01**: 피그마 컴포넌트 네이밍 규칙 (계층 구조, 구분자, 대소문자 규칙)
- [ ] **FIG-02**: 피그마 레이어/프레임 구조 가이드 (페이지 정리, 그룹 네이밍)
- [ ] **FIG-03**: 피그마 Variable 네이밍 규칙 + CSS Custom Property 매핑
- [ ] **FIG-04**: 피그마 Auto Layout 규칙 (패딩/갭 토큰 매핑, 반응형 동작 정의)

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

| Requirement | Phase | Status |
|-------------|-------|--------|
| AI-01 | Phase 5 | Pending |
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
| DOCS-01 | Phase 5 | Pending |
| DOCS-02 | Phase 5 | Pending |
| DOCS-03 | Phase 5 | Pending |
| DOCS-04 | Phase 5 | Pending |
| DOCS-05 | Phase 5 | Pending |
| DOCS-06 | Phase 5 | Pending |
| HAND-01 | Phase 6 | Pending |
| HAND-02 | Phase 6 | Pending |
| HAND-03 | Phase 6 | Pending |

**Coverage:**
- v1 requirements: 46 total
- Mapped to phases: 46
- Unmapped: 0

---
*Requirements defined: 2026-03-25*
*Last updated: 2026-03-26 — v0.9 requirements added*
