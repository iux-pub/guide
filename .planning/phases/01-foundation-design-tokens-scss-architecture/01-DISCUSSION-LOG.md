# Phase 1: Foundation — Design Tokens + SCSS Architecture - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-25
**Phase:** 01-foundation-design-tokens-scss-architecture
**Areas discussed:** 색상 체계, 브레이크포인트, 믹스인 범위, 토큰 파이프라인

---

## 색상 체계

| Option | Description | Selected |
|--------|-------------|----------|
| KRDS 기준 채택 | KRDS 공공 디자인시스템 색상 그대로 기본값 설정, 프로젝트별 오버라이드 | |
| 중립 팔레트 | 회색 스케일 + 시맨틱 색상만 기본값, Primary는 프로젝트마다 변경 | ✓ |
| 기존 패턴 유지 | webstyleguide의 --primary-color, --gray-900~100 패턴 그대로 표준화 | |

**User's choice:** 중립 팔레트
**Notes:** Primary는 프로젝트마다 다르니 기본값만 정의

### 그레이 스케일

| Option | Description | Selected |
|--------|-------------|----------|
| 기존 값 정리 | 기존 프로젝트에서 쓰던 값들을 토큰으로 표준화 | |
| KRDS 그레이 | KRDS 공공 디자인시스템의 그레이 스케일 채택 | |
| You decide | 적절히 정리해줘 | ✓ |

**User's choice:** Claude 재량

### 시맨틱 색상

| Option | Description | Selected |
|--------|-------------|----------|
| 기존 값 유지 | success:#28A745, danger:#DC3545 등 (webstyleguide 기준) | |
| KRDS 기준 | KRDS의 시맨틱 색상 채택 | ✓ |
| You decide | 적절히 정리해줘 | |

**User's choice:** KRDS 기준

---

## 브레이크포인트

**User's choice:** 3단계 간소화 — 모바일/태블릿/PC

사용자가 먼저 "3단계로 간소화하고 싶다"고 제안. PC 기준에 대해 논의.

| Option | Description | Selected |
|--------|-------------|----------|
| 1200px | 기존 프로젝트 기준 | |
| 1280px | KRDS xlarge 기준, 최근 프로젝트 기준 | ✓ |
| 1440px | 최신 트렌드, 대형 모니터 시대 | |

**User's choice:** 1280px (Claude 추천 수용)
**Notes:**
- KRDS 공식 브레이크포인트 확인 요청 → 웹 검색으로 KRDS 레이아웃 페이지(style_05.html) 확인
- KRDS 표준형: small 360, medium 768, large 1024, xlarge 1280
- 콘텐츠 max-width 1200px로 확정 (KRDS와 동일, 기존 프로젝트 호환)
- 1280px 뷰포트에서 콘텐츠 1200px + 좌우 마진 40px

---

## 믹스인 범위

| Option | Description | Selected |
|--------|-------------|----------|
| 현대화 정리 | vendor prefix 제거, 불필요한 것 삭제, 필요한 것만 개선 유지 | ✓ |
| 전부 포팅 | 기존 믹스인 그대로 유지 (vendor prefix 포함) | |
| You decide | 적절히 판단해줘 | |

**User's choice:** 현대화 정리

| Option | Description | Selected |
|--------|-------------|----------|
| 반응형 믹스인 추가 | @mixin respond-to(mobile/tablet/pc) 미디어 쿼리 헬퍼 | ✓ |
| 기존만 정리 | 새 믹스인 없이 기존 것만 정리 | |
| You decide | 필요한 것 추가해줘 | |

**User's choice:** 반응형 믹스인 추가

---

## 토큰 파이프라인

사용자가 직접 방향을 제안하여 대화형으로 결정.

### 토큰 출력 형식
- Claude 제안: SCSS 변수 + CSS Custom Properties 둘 다 → 사용자 "복잡하지 않을까?"
- Claude 제안: SCSS 변수로 통일 → 사용자 "토큰(CSS Custom Properties)쪽으로 통일하는게 어떨까"
- 최종: **CSS Custom Properties로 통일, 브레이크포인트만 SCSS 변수 예외**

### 토큰 관리 도구
- Style Dictionary 등 도구 없이 SCSS 파일에서 직접 `:root` 블록으로 관리

### Tailwind 호환성
- 사용자 추가 요청: "회사내에 테일윈드를 도입하네 마네 하는 말이 있어. 나중에 테일윈드쪽으로 커스터마이징해서 쓸 가능성도 엄두에 둬"
- 토큰 네이밍을 Tailwind config와 호환 가능하게 설계하기로 결정

---

## Claude's Discretion

- 그레이 스케일 구체적 값과 단계 수
- 타이포그래피/간격/기타 토큰 구체적 값
- 기존 믹스인 제거/유지 최종 판단
- ITCSS 레이어별 파일 구성 세부사항
- 토큰 플레이그라운드 페이지 디자인

## Deferred Ideas

- Tailwind CSS 도입/전환 — 향후 별도 결정
- Style Dictionary 도입 — 토큰 복잡해지면 재검토
- Figma Variables 자동 동기화 — v2 범위
