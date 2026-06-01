# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
