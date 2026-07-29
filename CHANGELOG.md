# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [3.0.0] - 2026-07-29

### Added
- 토큰 브랜드 계층 `tokens/brand.json` 신설. 프로젝트는 이 파일만 갈아끼우면 사이트 전체 색이 따라온다.
- 대비 자동검증 `scripts/check-contrast.js`를 `npm run check`에 편입. 라이트·고대비 두 모드에서 전경/배경 40건의 WCAG 2.1 AA 대비를 계산한다.
- `tokens/contrast-baseline.json` 래칫. 기존 위반 6건을 고정하고 새 위반만 차단한다. 기준선 항목이 고쳐지면 목록을 지우도록 실패시킨다.
- infoUX MCP 서버 `@infomind-ux/infoux-mcp`. 도구 8종(get_contract / list_components / get_component / get_tokens / get_rules / get_reference / get_workflow / search_docs)으로 기준을 제공하며, 접속 시 지시문을 넘겨 준수 순서를 자동으로 건다.
- 문서 사이트에 `/onboarding/mcp/` 신설.

### Changed
- BREAKING: 토큰 원본이 두 파일로 갈렸다. `tokens/foundation.json`은 gray·상태색·의미 토큰만 갖는 불변 계층이 되고, 브랜드 팔레트(primary/secondary/point)와 `--font-sans`는 `tokens/brand.json`이 소유한다. 생성되는 `tokens/build/tokens.css`의 변수명과 값은 이전과 동일하다.
- BREAKING: 스킬 계층을 폐기했다. `.agents/skills`·`.claude/skills`와 스타터 사본을 제거하고 전달 경로를 MCP 하나로 모았다. 작업 절차 7종은 `references/workflows/`로 옮겨 `get_workflow`로 제공한다.
- BREAKING: `skill/`을 `references/`로 통합하고 `skill/SKILL.md`를 `references/CONTRACT.md`로 옮겼다.
- `check-harness.js`가 스킬 4벌 동일성 대신 MCP 번들과 원본의 동기화를 검사한다.
- 문서 사이트와 스타터 안내에서 "info-design 스킬 발화"를 MCP 등록 안내로 교체했다.

### Removed
- `scripts/build-agent-harness.js`, `npm run build:agents`, `npm run deploy:skill`.

## [2.0.0] - 2026-06-01

### Added
- HTML Page Shell 계약 추가: `.skip-to-content`, `header#header`, `main#main`, `footer#footer`, `section > .container`, section accessible name 검증.
- R-20 호환성 규칙 추가: 핵심 CSS에서 `:has()` 의존 금지 및 `check-violations.js` 자동 검출.
- `browserslist` 기준 추가: Chrome/Safari/Firefox/Edge 최신 2개 버전, Samsung Internet 최신, IE 기본 미지원.

### Changed
- BREAKING: R-15 HTML 기본 구조 규칙을 error로 승격하고 `check-html-structure.js` page shell 검사를 강화.
- info-design 스킬, AGENTS/CLAUDE, prompts, 문서 사이트를 page shell 및 section 단위 컴포넌트화 기준으로 갱신.
- check/rules 문서 범위를 R-01~R-20으로 확장.

### Fixed
- `:focus` fallback을 추가해 `:focus-visible` 미지원 브라우저에서도 포커스 링이 유지되도록 보강.
- check/radio, switch, file-upload 컴포넌트의 `:has()` 의존을 sibling selector 기반 상태 스타일로 교체.
- 브라우저 테스트 문서의 IE 지원 기준 불일치를 정리.

## [0.9.0] - 2026-03-26

### Added
- 거버넌스 문서 (컴포넌트 라이프사이클, 버전 정책, 변경 승인 프로세스)

## [0.8.0] - 2026-03-25

### Added
- ITCSS 7레이어 + BEM SCSS 아키텍처
- 디자인 토큰 (색상, 타이포그래피, 간격, 그리드, 기타)
- 반응형 믹스인 (모바일/태블릿/PC 브레이크포인트)
- 공용 믹스인 (flex-center, ellipsis, bg-cover 등)
- 8개 UI 컴포넌트 HTML+SCSS 스니펫 (btn, form, card, table, modal, tab, pagination, breadcrumb)
- KWCAG/WCAG AA 접근성 체크리스트 및 컴포넌트별 접근성 가이드
- Eleventy 기반 문서 사이트
- 신규 팀원 온보딩 가이드
- 프로젝트 보일러플레이트 (HTML 시작 템플릿)
- Stylelint BEM 검증 설정
- pa11y-ci 접근성 자동 검사 설정
