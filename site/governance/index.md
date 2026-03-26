---
title: 거버넌스 + 버전 관리
order: 1
---

가이드 시스템의 성장과 변경을 관리하는 프로세스를 정의한다. 컴포넌트의 성숙도를 추적하고, 변경 이력을 기록하며, 토큰과 컴포넌트의 추가/수정을 체계적으로 승인하는 절차를 제공한다.

## 대상

- **디자이너**: 컴포넌트 라이프사이클 단계를 확인하고, 새 컴포넌트 제안 시 프로세스를 따른다
- **퍼블리셔**: 컴포넌트 상태(experimental/beta/stable)에 따른 사용 제한을 준수한다
- **기여자**: 토큰/컴포넌트 변경 시 승인 프로세스를 따르고, CHANGELOG를 업데이트한다

## 거버넌스 문서

| 문서 | 설명 |
|------|------|
| [컴포넌트 라이프사이클](/governance/lifecycle/) | experimental, beta, stable 3단계 기준과 승격/강등 조건 |
| [버전 정책](/governance/versioning/) | 시맨틱 버전(MAJOR/MINOR/PATCH) 기준과 CHANGELOG 작성 규칙 |
| [변경 승인 프로세스](/governance/governance-process/) | 토큰/컴포넌트 추가 및 변경 승인 절차 |
| [기여 가이드](/governance/contributing/) | 이슈 등록, PR 작성, 코드 리뷰 절차 |

## 관련 가이드

- [SCSS 구조](/conventions/scss-structure/) -- ITCSS 7레이어 아키텍처
- [BEM 네이밍](/conventions/bem/) -- CSS 클래스명 컨벤션
- [접근성 체크리스트](/accessibility/checklist/) -- KWCAG/WCAG AA 검증 기준
- [온보딩](/onboarding/) -- 신규 팀원 시작 가이드
