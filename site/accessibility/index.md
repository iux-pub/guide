---
title: 접근성
order: 1
---

KWCAG/WCAG 2.1 AA 기준의 웹 접근성 가이드이다. 공공기관 납품 요건을 충족하는 마크업 패턴과 컴포넌트별 접근성 규칙을 안내한다.

## 접근성 기준

- **KWCAG 2.2** -- 한국형 웹 콘텐츠 접근성 지침 (33개 검사항목, 2026년 전자정부 웹사이트 의무)
- **WCAG 2.1 AA** -- W3C 웹 콘텐츠 접근성 가이드라인 적합성 수준 AA

## 접근성 원칙 (POUR)

| 원칙 | 설명 |
|------|------|
| **인식 가능 (Perceivable)** | 정보와 UI를 사용자가 인식할 수 있어야 한다 |
| **운용 가능 (Operable)** | UI와 내비게이션이 운용 가능해야 한다 |
| **이해 가능 (Understandable)** | 정보와 UI 운용이 이해 가능해야 한다 |
| **견고 (Robust)** | 보조 기술 포함 다양한 사용자 에이전트가 해석 가능해야 한다 |

## 공통 접근성 규칙

- 이미지에 `alt` 속성을 필수로 제공한다
- 인터랙티브 요소에 `aria-label` 또는 텍스트 레이블을 필수로 제공한다
- 키보드 네비게이션을 지원한다 (탭 순서, 포커스 표시)
- 색상 대비 4.5:1 이상을 유지한다
- 본문 건너뛰기 링크를 제공한다
- 스크린 리더 전용 텍스트는 `.sr-only` 클래스를 사용한다

## 가이드 목록

### 일반 가이드

| 가이드 | 설명 |
|--------|------|
| [체크리스트](/accessibility/checklist/) | KWCAG 2.2 기준 퍼블리싱 체크리스트 (컴포넌트별 분류) |
| [색상 대비](/accessibility/color-contrast/) | 토큰 기반 색상 대비 표, FAIL 항목 대안 |
| [스크린리더 전용](/accessibility/sr-only/) | `.sr-only` 패턴 가이드, 사용 시나리오 |

### 컴포넌트별 접근성 가이드

| 컴포넌트 | 주요 KWCAG 항목 |
|----------|----------------|
| [버튼](/accessibility/btn/) | 6.1.1 키보드, 6.5.3 레이블 |
| [폼](/accessibility/form/) | 7.3.2 레이블, 7.3.1 오류 정정 |
| [카드](/accessibility/card/) | 5.1.1 대체 텍스트, 6.4.3 링크 텍스트 |
| [테이블](/accessibility/table/) | 5.3.1 표의 구성 |
| [모달](/accessibility/modal/) | 8.2.1 WAI-ARIA, 6.1.1 키보드 |
| [탭](/accessibility/tab/) | 8.2.1 WAI-ARIA, 6.1.1 키보드 |
| [브레드크럼](/accessibility/breadcrumb/) | 6.4.3 링크 텍스트, 5.3.2 선형구조 |
| [페이지네이션](/accessibility/pagination/) | 6.1.1 키보드, 6.4.3 링크 텍스트 |

## 자동 검사

```bash
# pa11y-ci 접근성 검사 (WCAG2AA 기준)
npm run test:a11y

# 개별 페이지 검사
npx axe <URL>
```
