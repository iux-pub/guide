---
title: 피그마 AI 프롬프트
order: 3
---

## 대상 AI 도구

Figma AI, Figma Make

## 사용법

아래 내용을 복사하여 AI 도구의 시스템 프롬프트(또는 첫 메시지)에 붙여넣는다.

## 프롬프트

````markdown
# 피그마 컨벤션 프롬프트 — KRDS+INFOMIND

대상: Figma AI, Figma Make

이 규칙을 따라 피그마 작업을 수행하라.

## 컴포넌트 네이밍

- PascalCase + `/` 구분자: `Button/Primary/Medium`, `Card/Default`, `Form/Input/Error`
- Variant Property: camelCase. 예: `variant=Primary`, `size=Medium`, `state=Hover`
- 금지: 한글 이름, 공백, `_` 언더스코어, 넘버링(`Button1`, `Button2`), 자동 생성 이름(`Frame 427`)

## BEM 매핑 (KRDS 정의)

| 피그마 | BEM 클래스 |
|--------|-----------|
| Button/Primary | `.btn--primary` |
| Button/Secondary | `.btn--secondary` |
| Button/Tertiary | `.btn--tertiary` |
| Button/Text | `.btn--text` |
| Button/Size/XSmall | `.btn--xsmall` |
| Button/Size/Small | `.btn--small` |
| Button/Size/Medium | (기본 — 클래스 없음) |
| Button/Size/Large | `.btn--large` |
| Button/Size/XLarge | `.btn--xlarge` |
| Card/Default | `.card` |
| Form/Input/Error | `.input--error` |
| Modal | `.modal` |
| Tab | `.tab` |
| Alert/Success | `.alert--success` |

> 옛 BEM (`--ghost`, `--outline`, `--link`, `--sm`, `--lg`)은 KRDS 마이그레이션에서 폐기됨. 디자인 단계에서도 KRDS 정의(4 variant × 5 size)로 정리한다.

## Variable 네이밍 (KRDS 토큰 매핑)

Collection 구조: KRDS Color, KRDS Padding, KRDS Radius, KRDS Size, KRDS Font, INFOMIND Semantic

| 피그마 Variable | CSS Custom Property |
|----------------|---------------------|
| KRDS/Color/Primary/50 | `--krds-light-color-primary-50` |
| KRDS/Color/Gray/700 | `--krds-light-color-gray-70` |
| KRDS/Color/Button/Primary/Fill | `--krds-light-color-button-primary-fill` |
| KRDS/Padding/5 | `--krds-padding-5` |
| KRDS/Radius/Medium2 | `--krds-radius-medium2` |
| KRDS/Size/Height/7 | `--krds-size-height-7` |
| KRDS/Font/Size/7 | `--krds-font-size-7` |
| INFOMIND/Color/Text | `--color-text` |
| INFOMIND/Color/Text/Secondary | `--color-text-secondary` |
| INFOMIND/Color/Bg | `--color-bg` |

전체 토큰 카탈로그: `skill/references/krds-tokens.md`

## Auto Layout (패딩·갭)

KRDS 패딩 스케일만 사용 — `--krds-padding-1` ~ `--krds-padding-8`. KRDS gap 스케일 — `--krds-gap-1` ~ `--krds-gap-6`.

권장 px 값(KRDS 스케일에 매핑): 2, 4, 8, 10, 12, 16, 20, 24, 32, 48, 64.

**금지 임의 값**: 5, 7, 11, 14, 18, 22, 30, 50px 등.

## 컴포넌트 카탈로그 (KRDS 28종)

피그마 라이브러리도 다음 28종으로 한정한다. 외 컴포넌트 임의 신설 금지.

- A — 폼/액션: Button, CheckRadio, FileUpload, Form, Select, Switch
- B — 컨테이너: Accordion, Card, Disclosure, Modal, SidePanel, Tab
- C — 내비: Breadcrumb, Header, MainMenu, Pagination
- D — 피드백: Alert, Badge, Progress, Spinner, StepIndicator, Tag, Toast, Tooltip
- E — 콘텐츠: Calendar, Carousel, List, Table

## 레이어 구조

- 프레임/그룹: kebab-case (`main-header`, `card-section`)
- 페이지 분류: 🎨 Design, 📦 Components, 📐 Tokens, 📝 Handoff
- 깊이: 최대 5단계
- 자동 생성 이름 금지 (`Frame 427`, `Group 12`)

## 핸드오프 체크

디자인 → 코드 핸드오프 시 다음을 충족해야 한다.

- [ ] 모든 색상이 KRDS Variable 사용 (raw hex 0건)
- [ ] 모든 패딩/갭이 KRDS 스케일에 매핑됨 (5/7/14px 등 임의 값 0건)
- [ ] 컴포넌트가 28종 카탈로그 안에 있음
- [ ] 버튼이 KRDS 4 variant × 5 size 안에 있음
- [ ] 모바일 변형은 medium(48) 이상 사이즈 사용
- [ ] 색상 대비 4.5:1 (큰 텍스트 3:1) 확인됨
- [ ] 터치 영역 44×44px 이상
````
