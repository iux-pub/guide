---
title: 온보딩
order: 1
---

이 가이드 시스템은 인포마인드 UX팀의 디자인 및 퍼블리싱 표준을 체계화한 것이다. KRDS(범정부 UI/UX 디자인 시스템)의 접근성·구조 원칙 + INFOMIND UX팀 실무 표준 + Tailwind v4를 단일 소스에서 발행한다. 신규 팀원이 프로젝트에 빠르게 합류하고, 디자인 의도가 퍼블리싱으로 안정적으로 전달되도록 하는 데 목적이 있다.

## 가이드 시스템 구성

| 영역 | 설명 |
|------|------|
| **KRDS 원칙 + Tailwind v4** | KRDS 접근성·구조 원칙 + Tailwind v4 (`@theme`, `@apply`) + ITCSS 5레이어로 조직한다 |
| **BEM 네이밍** | 5-objects · 6-components 레이어의 모든 CSS 클래스명을 Block__Element--Modifier 패턴으로 작성한다 |
| **디자인 토큰** | `--color-*`, `--font-*`만 CSS Custom Properties로 발행한다 |
| **컴포넌트 패턴** | 기존 카탈로그 패턴 우선, 필요 시 프로젝트 패턴 또는 공통 컴포넌트로 확장 |
| **HTML 기본 골격** | `.skip-to-content`, `header#header`, `main#main`, `footer#footer`, `main > section > .container`; section별 접근 이름 |
| **info-design 스킬** | Claude Code용 LLM 컨트랙트 — 색상 토큰, 접근성, 인포마인드 HTML 골격을 일관되게 적용 |
| **접근성** | KWCAG/WCAG 2.1 AA 기준을 준수하여 공공기관 납품 요건을 충족한다 |

## 온보딩 가이드

| 문서 | 설명 |
|------|------|
| [시작 가이드](/onboarding/getting-started/) | 설치부터 접근성 체크까지 6단계 튜토리얼 |
| [디자인 전달 체크리스트](/onboarding/handoff/) | 구조, 토큰, 컴포넌트, 접근성 전달 항목 체크리스트 |

## 주요 문서 링크

- [토큰 개요](/tokens/) -- KRDS 정본 + INFOMIND 시맨틱 별칭
- [컨벤션 개요](/conventions/) -- CSS 규칙(R-01~R-14), BEM, ITCSS 5레이어
- [컴포넌트 개요](/components/) -- KRDS 기반 패턴 (btn, form, card, modal 등)
- [접근성 개요](/accessibility/) -- 체크리스트, 색상 대비, 컴포넌트별 접근성
