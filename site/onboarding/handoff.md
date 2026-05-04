---
title: "피그마→코드 핸드오프"
order: 3
---

디자이너가 피그마에서 작업한 시안을 퍼블리셔에게 전달할 때의 규칙을 정의한다. KRDS+INFOMIND 컴포넌트 매핑, KRDS 토큰 연결, 전달 항목 체크리스트를 통해 핸드오프 과정을 표준화한다.

## 피그마 컴포넌트 ↔ BEM 클래스 매핑 (KRDS 정의)

피그마 컴포넌트 이름과 퍼블리싱에서 사용하는 BEM 클래스의 매핑이다. **KRDS 28종 카탈로그 안에서만** 사용한다.

### 버튼 (KRDS 4 variant × 5 size)

| Figma 컴포넌트 | BEM 클래스 | 비고 |
|----------------|-----------|------|
| Button/Primary | `.btn.btn--primary` | 메인 CTA |
| Button/Secondary | `.btn.btn--secondary` | 보조 액션 |
| Button/Tertiary | `.btn.btn--tertiary` | 약한 액션 (gray border) |
| Button/Text | `.btn.btn--text` | 텍스트 링크형 |
| Button/Size/XSmall | `.btn.btn--xsmall` | 32px (데스크탑 dense UI 한정) |
| Button/Size/Small | `.btn.btn--small` | 40px (데스크탑 보조) |
| Button/Size/Medium | (클래스 없음, 기본) | 48px (모바일 권장) |
| Button/Size/Large | `.btn.btn--large` | 56px |
| Button/Size/XLarge | `.btn.btn--xlarge` | 64px (히어로 CTA) |

> 옛 variant (`Button/Outline`, `Button/Ghost`, `Button/Link`)는 KRDS 마이그레이션에서 폐기. 디자인 단계에서 사용 금지.

### 카드 / 폼

| Figma 컴포넌트 | BEM 클래스 |
|----------------|-----------|
| Card | `.card` |
| Card/Featured | `.card.card--featured` |
| Form/Input | `.input` (form-field 컨테이너 안) |
| Form/Input/Error | `.input.input--error` |
| Form/Select | `.select` |
| Form/Checkbox | `.check-radio` (input type=checkbox) |
| Form/Radio | `.check-radio` (input type=radio) |
| Form/Switch | `.switch` |
| Form/FileUpload | `.file-upload` |

### 내비게이션 / 피드백 / 콘텐츠

| Figma 컴포넌트 | BEM 클래스 |
|----------------|-----------|
| Modal | `.modal` |
| Tab | `.tab` |
| Accordion | `.accordion` |
| Disclosure | `.disclosure` |
| SidePanel | `.side-panel` |
| Pagination | `.pagination` |
| Breadcrumb | `.breadcrumb` |
| Header | `.header` |
| MainMenu | `.main-menu` |
| Alert | `.alert` (variant: `--success`/`--warning`/`--danger`/`--info`) |
| Badge | `.badge` |
| Tag | `.tag` |
| Toast | `.toast` |
| Tooltip | `.tooltip` |
| Progress | `.progress` |
| Spinner | `.spinner` |
| StepIndicator | `.step-indicator` |
| Calendar | `.calendar` |
| Carousel | `.carousel` |
| List | `.list` |
| Table | `.table` |

전체 28종 카탈로그 — `skill/references/krds-components.md` 참조.

## 피그마 Variable ↔ CSS Custom Property 매핑 (KRDS 토큰)

피그마에서 정의한 Variable과 코드에서 사용하는 CSS Custom Property의 매핑이다. KRDS 정본을 우선 사용하고, 의미 기반 작성에는 INFOMIND 시맨틱 별칭을 쓴다.

### 색상 (KRDS 정본)

| Figma Variable | CSS Custom Property | 용도 |
|----------------|---------------------|------|
| KRDS/Color/Primary/50 | `--krds-light-color-primary-50` | 기본 강조 (`#256ef4`) |
| KRDS/Color/Primary/40 / 60 | `--krds-light-color-primary-40 / 60` | hover/pressed 변종 |
| KRDS/Color/Secondary/50 | `--krds-light-color-secondary-50` | 보조 강조 |
| KRDS/Color/Gray/0~100 | `--krds-light-color-gray-0` ~ `--krds-light-color-gray-100` | 그레이 스케일 |
| KRDS/Color/Success/50 | `--krds-light-color-success-50` | 성공 |
| KRDS/Color/Warning/50 | `--krds-light-color-warning-50` | 경고 |
| KRDS/Color/Danger/50 | `--krds-light-color-danger-50` | 에러/삭제 |
| KRDS/Color/Info/50 | `--krds-light-color-info-50` | 정보 |
| KRDS/Color/Button/Primary/Fill | `--krds-light-color-button-primary-fill` | 버튼 배경 |
| KRDS/Color/Button/Primary/Fill-Hover | `--krds-light-color-button-primary-fill-hover` | 버튼 hover |

### 색상 (INFOMIND 시맨틱 별칭)

| Figma Variable | CSS Custom Property | 의미 |
|----------------|---------------------|------|
| INFOMIND/Color/Text | `--color-text` | 본문 텍스트 |
| INFOMIND/Color/Text/Secondary | `--color-text-secondary` | 보조 텍스트 |
| INFOMIND/Color/Text/Disabled | `--color-text-disabled` | 비활성 텍스트 |
| INFOMIND/Color/Bg | `--color-bg` | 기본 배경 |
| INFOMIND/Color/Bg/Secondary | `--color-bg-secondary` | 보조 배경 |
| INFOMIND/Color/Border | `--color-border` | 기본 테두리 |
| INFOMIND/Color/Border/Light | `--color-border-light` | 옅은 테두리 |
| INFOMIND/Color/Primary | `--color-primary` | 브랜드 강조 (KRDS primary-50를 가리킴) |

### 패딩·간격 (KRDS 정량 스케일)

| Figma Variable | CSS Custom Property |
|----------------|---------------------|
| KRDS/Padding/1~8 | `--krds-padding-1` ~ `--krds-padding-8` |
| KRDS/Gap/1~6 | `--krds-gap-1` ~ `--krds-gap-6` |
| INFOMIND/Spacing/4 (=4px) | `--spacing-4` |

### 사이즈·반경

| Figma Variable | CSS Custom Property |
|----------------|---------------------|
| KRDS/Size/Height/5 (=32px) | `--krds-size-height-5` |
| KRDS/Size/Height/6 (=40px) | `--krds-size-height-6` |
| KRDS/Size/Height/7 (=48px=KRDS medium) | `--krds-size-height-7` |
| KRDS/Size/Height/8 (=56px) | `--krds-size-height-8` |
| KRDS/Size/Height/9 (=64px) | `--krds-size-height-9` |
| KRDS/Radius/Small1~3 (2~4px) | `--krds-radius-small1` ~ `small3` |
| KRDS/Radius/Medium1~4 (6~10px) | `--krds-radius-medium1` ~ `medium4` |
| KRDS/Radius/Large1~3 (12~16px) | `--krds-radius-large1` ~ `large3` |

### 타이포그래피

| Figma Variable | CSS Custom Property |
|----------------|---------------------|
| KRDS/Font/Size/1~15 | `--krds-font-size-1` ~ `--krds-font-size-15` |
| INFOMIND/Text/Body/{XSmall,Small,Medium,Large} | `--text-body-{xsmall,small,medium,large}` |
| INFOMIND/Text/Heading/{Small,Medium,Large,XLarge} | `--text-heading-{small,medium,large,xlarge}` |
| Font Family/Sans | `--font-sans` (= Pretendard GOV → SUIT-V → Apple SD Gothic Neo → Malgun Gothic) |

전체 토큰 카탈로그 — `skill/references/krds-tokens.md`

## 핸드오프 전달 항목 체크리스트

디자이너가 퍼블리셔에게 시안을 전달할 때 다음 항목을 확인한다.

- [ ] **토큰 확인:** 사용된 색상이 KRDS 정본 또는 INFOMIND 시맨틱 별칭에 매핑된다. raw hex/rgb 0건. 매핑 없으면 UX팀과 협의(`infomind-overrides.json` 갱신)
- [ ] **컴포넌트 카탈로그:** 사용한 컴포넌트가 KRDS 28종 안에 있다. 외 컴포넌트는 신설 제안 절차 진행
- [ ] **버튼 정의 준수:** Variant는 `Primary`/`Secondary`/`Tertiary`/`Text` 4종, Size는 `XSmall`~`XLarge` 5종 안. 모바일 변형은 medium(48) 이상 사용
- [ ] **간격/정렬 기준:** KRDS padding/gap 정량 스케일에 매핑된다. 5/7/14/22px 같은 임의 값 0건
- [ ] **타이포그래피:** KRDS font-size 또는 INFOMIND text 시맨틱에 매핑된다
- [ ] **반응형 시안:** 모바일(0~767), 태블릿(768~1279), PC(1280+) 각각 시안 제공
- [ ] **인터랙션 명세:** hover, focus(4px primary 외곽선), pressed, disabled 상태 정의
- [ ] **접근성:** 대체 텍스트, 키보드 조작, 포커스 순서, 색상 대비 4.5:1, 터치 영역 ≥44×44px 명시
- [ ] **다크 모드:** KRDS는 light/dark 양쪽 토큰 발행 — 다크 모드 시안이 KRDS dark 토큰에 매핑되는지 확인

## 참고 문서

- [컴포넌트 개요](/components/) — 사용 가능한 KRDS 28종
- [토큰 개요](/tokens/) — KRDS 정본 + INFOMIND 시맨틱 별칭
- [BEM 네이밍](/conventions/bem/) — BEM 네이밍 규칙 상세
- [접근성 개요](/accessibility/) — 접근성 체크리스트와 가이드
