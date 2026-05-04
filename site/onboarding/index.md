---
title: 온보딩
order: 1
---

이 가이드 시스템은 인포마인드 UX팀의 디자인 및 퍼블리싱 표준을 체계화한 것이다. KRDS(범정부 UI/UX 디자인 시스템) 베이스 + INFOMIND UX팀 표준 + Tailwind v4를 단일 소스에서 발행한다. 신규 팀원이 프로젝트에 빠르게 합류하고, 디자이너-퍼블리셔 간 핸드오프를 표준화하는 데 목적이 있다.

## 가이드 시스템 구성

| 영역 | 설명 |
|------|------|
| **KRDS+Tailwind v4** | 범정부 디자인 시스템 베이스 + Tailwind v4 (`@theme`) + ITCSS 5레이어로 조직한다 |
| **BEM 네이밍** | 5-objects · 6-components 레이어의 모든 CSS 클래스명을 Block__Element--Modifier 패턴으로 작성한다 |
| **디자인 토큰** | KRDS 정본(`--krds-*`)과 INFOMIND 시맨틱 별칭(`--color-*`)을 CSS Custom Properties로 발행한다 |
| **컴포넌트 28종** | KRDS 5그룹 카탈로그 (폼/액션·컨테이너·내비·피드백·콘텐츠) — 외 임의 신설 금지 |
| **info-design 스킬** | Claude Code용 LLM 컨트랙트 — 임의 코드 생성을 거부하고 카탈로그·토큰만 사용 |
| **접근성** | KWCAG/WCAG 2.1 AA 기준을 준수하여 공공기관 납품 요건을 충족한다 |

## 온보딩 가이드

| 문서 | 설명 |
|------|------|
| [시작 가이드](/onboarding/getting-started/) | 설치부터 접근성 체크까지 6단계 튜토리얼 |
| [피그마→코드 핸드오프](/onboarding/handoff/) | 피그마 컴포넌트와 KRDS BEM 클래스 매핑, 전달 항목 체크리스트 |

## 주요 문서 링크

- [토큰 개요](/tokens/) -- KRDS 정본 + INFOMIND 시맨틱 별칭
- [컨벤션 개요](/conventions/) -- CSS 규칙(R-01~R-14), BEM, ITCSS 5레이어
- [컴포넌트 개요](/components/) -- KRDS 28종 (btn, form, card, modal 등)
- [접근성 개요](/accessibility/) -- 체크리스트, 색상 대비, 컴포넌트별 접근성
