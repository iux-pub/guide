# KRDS Source — 원본 수집 자료

> 수집일: 2026-04-30
> 출처: KRDS 공식(www.krds.go.kr) + KRDS-uiux GitHub 저장소(공식) + 전자정부 UI/UX 가이드(uiux.egovframe.go.kr)
> 우선순위: KRDS 공식 채택. 전자정부 UI/UX 가이드는 KRDS와 동일 콘텐츠를 호스팅함이 확인되어 별도 보완 항목 없음.
> 수집 범위: 디자인 토큰(색상/타이포/간격/그리드/반경/그림자/모션/z-index/브레이크포인트), 컴포넌트 카탈로그, 접근성, 1rem=10px 트릭, 네이밍 규칙
> 수집 방법: ① KRDS 공식 사이트의 스타일 가이드 페이지 fetch ② KRDS-uiux GitHub의 공식 토큰 JSON(`tokens/transformed_tokens.json`) 직접 다운로드 ③ 컴파일된 CSS(`resources/css/`)에서 z-index/그림자 추출

---

## 0. 개요

- **시스템명**: KRDS (Korea Government Design System) — 한국명 "범정부 UI/UX 디자인 시스템"
- **현재 버전**: v1.0.0 (이전 버전 v0.4는 https://v04.krds.go.kr 에서 보존)
- **GitHub**: https://github.com/KRDS-uiux/krds-uiux (공식 저장소)
- **Figma 라이브러리**: KRDS_v1.0.0 (Figma Community)
- **CSS 변수 prefix**: `--krds-`
- **모드 구분**: `light`(기본) / `high-contrast`(고대비)
- **반응형 모드**: `mobile` / `pc`
- **표준형 vs 확장형**:
  - **표준형(Standard)**: 중앙행정기관 대표 웹사이트(정부24, 고용24 등). KRDS 그대로 적용.
  - **확장형(Extended)**: 독자 로고/브랜드 사용 기관(국민건강보험, 복지로 등). KRDS 토큰 위에 부처 색상/모양 커스터마이즈.

### 디자인 원칙 7가지 (출처: utility_02)
1. **사용자 중심의 서비스** — 모든 의사 결정은 사용자를 중심으로
2. **모든 사용자를 포용하는 서비스** — 장애인·고령자·어린이·외국인 동등 접근
3. **공통된 경험 안에서 개별 특성을 고려한 서비스** — 일관성 + 기관 특성 최적화
4. **빠르고 간단한 서비스** — 사용자 의사결정 최소화
5. **쉽게 이해하고 사용할 수 있는 서비스** — 친숙·간결·직관
6. **사용자의 다양한 상황을 고려하는 서비스** — 상황·목적·숙련도·빈도 고려
7. **신뢰할 수 있는 서비스** — 정부 공식성, 최신·정확 정보

---

## 1. 색상 토큰 (Color)

> 모든 hex 값은 KRDS-uiux GitHub `tokens/transformed_tokens.json` 원본에서 추출.
> 단계 체계: **0, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 100** (Gray만 0/100 포함, 나머지 11단계)
> "매직넘버" 규칙: 두 단계의 차이가 50이면 명도 대비 4.5:1 보장.

### 1.1 Primitive — Light 모드

#### Primary (대표/주조색 — 정부 상징)
| 단계 | hex | 비고 |
|------|------|------|
| 5 | `#ecf2fe` | |
| 10 | `#d8e5fd` | |
| 20 | `#b1cefb` | |
| 30 | `#86aff9` | |
| 40 | `#4c87f6` | |
| **50** | `#256ef4` | **base** — 기본 액션색 |
| 60 | `#0b50d0` | text 권장 |
| 70 | `#083891` | |
| 80 | `#052561` | |
| 90 | `#03163a` | |
| 95 | `#020f27` | |

#### Secondary (보조색)
| 단계 | hex |
|------|------|
| 5 | `#eef2f7` |
| 10 | `#d6e0eb` |
| 20 | `#bacbde` |
| 30 | `#90b0d5` |
| 40 | `#6b96c7` |
| **50** | `#346fb2` |
| 60 | `#1c589c` |
| 70 | `#063a74` |
| 80 | `#052b57` |
| 90 | `#031f3f` |
| 95 | `#02162c` |

#### Gray (무채색 13단계 — 0/100 포함)
| 단계 | hex |
|------|------|
| **0** | `#ffffff` |
| 5 | `#f4f5f6` |
| 10 | `#e6e8ea` |
| 20 | `#cdd1d5` |
| 30 | `#b1b8be` |
| 40 | `#8a949e` |
| 50 | `#6d7882` |
| 60 | `#58616a` |
| 70 | `#464c53` |
| 80 | `#33363d` |
| 90 | `#1e2124` |
| 95 | `#131416` |
| **100** | `#000000` |

#### Danger (Critical/Error)
| 단계 | hex | 시맨틱 역할 |
|------|------|------|
| 5 | `#fdefec` | surface |
| 10 | `#fcdfd9` | border |
| 20 | `#f7afa1` | |
| 30 | `#f48771` | |
| 40 | `#f05f42` | |
| **50** | `#de3412` | **base** |
| 60 | `#bd2c0f` | text |
| 70 | `#8a240f` | |
| 80 | `#5c180a` | |
| 90 | `#390d05` | |
| 95 | `#260903` | |

#### Warning
| 단계 | hex | 시맨틱 역할 |
|------|------|------|
| 5 | `#fff3db` | surface |
| 10 | `#ffe0a3` | border |
| 20 | `#ffc95c` | |
| 30 | `#ffb114` | |
| 40 | `#c78500` | |
| **50** | `#9e6a00` | **base** |
| 60 | `#8a5c00` | text |
| 70 | `#614100` | |
| 80 | `#422c00` | |
| 90 | `#2e1f00` | |
| 95 | `#241800` | |

#### Success
| 단계 | hex | 시맨틱 역할 |
|------|------|------|
| 5 | `#eaf6ec` | surface |
| 10 | `#d8eedd` | border |
| 20 | `#a9dab4` | |
| 30 | `#7ec88e` | |
| 40 | `#3fa654` | |
| **50** | `#228738` | **base** |
| 60 | `#267337` | text |
| 70 | `#285d33` | |
| 80 | `#1f4727` | |
| 90 | `#122b18` | |
| 95 | `#0e2012` | |

#### Information (Info)
| 단계 | hex | 시맨틱 역할 |
|------|------|------|
| 5 | `#e7f4fe` | surface |
| 10 | `#d3ebfd` | border |
| 20 | `#9ed2fa` | |
| 30 | `#5fb5f7` | |
| 40 | `#2098f3` | |
| **50** | `#0b78cb` | **base** |
| 60 | `#096ab3` | text |
| 70 | `#085691` | |
| 80 | `#053961` | |
| 90 | `#03253f` | |
| 95 | `#021a2c` | |

#### Point (강조색 — 빨강 계열)
| 단계 | hex |
|------|------|
| 5 | `#fbeff0` |
| 10 | `#f5d6d9` |
| 20 | `#ebadb2` |
| 30 | `#e0858c` |
| 40 | `#d65c66` |
| **50** | `#d63d4a` |
| 60 | `#ab2b36` |
| 70 | `#7a1f26` |
| 80 | `#521419` |
| 90 | `#310c0f` |
| 95 | `#21080a` |

#### Graphic (그래픽 전용 — 5단계만)
| 단계 | hex |
|------|------|
| 10 | `#e5ecf9` |
| 30 | `#98acc5` |
| 50 | `#61758f` |
| 70 | `#39506c` |
| 90 | `#223a58` |

#### Alpha (투명도 — bg/border/dimmed)
| 토큰 | hex | 용도 |
|------|------|------|
| black100 | `#000000` | text-title |
| black75 | `#000000bf` | dimmed |
| black50 | `#00000080` | bg, border |
| black25 | `#00000040` | bg, border |
| black10 | `#0000001a` | bg, border |
| black0 | `#00000000` | transparent |
| white100 | `#ffffff` | text-title (inverse) |
| white75 | `#ffffffbf` | dimmed (inverse) |
| white50 | `#ffffff80` | bg, border |
| white25 | `#ffffff40` | bg, border |
| white10 | `#ffffff1a` | bg, border |
| white0 | `#ffffff00` | transparent |

#### Shadow Alpha (Light 모드 — 그림자 전용)
| 토큰 | hex |
|------|------|
| `--krds-light-color-alpha-shadow1` | `#0000000d` (5% black) |
| `--krds-light-color-alpha-shadow2` | `#00000014` (8% black) |
| `--krds-light-color-alpha-shadow3` | `#0000001f` (12% black) |

### 1.2 Primitive — High-Contrast 모드

> Primary, Gray, Danger, Warning, Success, Information, Point의 hex는 Light 모드와 동일.
> 차이점:
> - Secondary가 청록 계열로 변경됨
> - Shadow alpha가 더 짙음
> - 시맨틱 토큰(text/icon/border 등)이 다른 단계를 참조함

#### High-Contrast Secondary (청록 계열)
| 단계 | hex |
|------|------|
| 5 | `#edf6f8` |
| 10 | `#d5ebf1` |
| 20 | `#abd8e3` |
| 30 | `#75c0d1` |
| 40 | `#3d9fb8` |
| **50** | `#268097` |
| 60 | `#1f687a` |
| 70 | `#17505e` |
| 80 | `#113b45` |
| 90 | `#0e3139` |
| 95 | `#091f25` |

#### High-Contrast Shadow Alpha
| 토큰 | hex |
|------|------|
| `--krds-high-contrast-color-alpha-shadow1` | `#0000001f` (12% black) |
| `--krds-high-contrast-color-alpha-shadow2` | `#00000033` (20% black) |
| `--krds-high-contrast-color-alpha-shadow3` | `#00000066` (40% black) |

### 1.3 Semantic 색상 토큰 (Light 모드)

> 시맨틱 토큰은 primitive를 참조함. 형식: `--krds-light-color-{category}-{role}`

#### text (텍스트)
| 토큰 | 참조 primitive | 비고 |
|------|------|------|
| `text.bolder` | `gray.95` | 가장 진한 본문 |
| `text.basic` | `gray.90` | 기본 본문 |
| `text.subtle` | `gray.70` | 보조 텍스트 |
| `text.disabled` | `gray.40` | 비활성 |
| `text.disabled-on` | `gray.50` | 비활성 위 텍스트 |
| `text.primary` | `primary.60` | 활성/선택 |
| `text.secondary` | `secondary.80` | 활성/선택 |
| `text.danger` | `danger.60` | |
| `text.warning` | `warning.60` | |
| `text.success` | `success.60` | |
| `text.information` | `information.60` | |
| `text.point` | `point.60` | |
| `text.bolder-inverse` | `gray.0` | 다크 배경용 |
| `text.basic-inverse` | `gray.0` | 다크 배경용 |
| `text.subtle-inverse` | `gray.30` | 다크 배경용 |
| `text.inverse-static` | `gray.0` | |
| `text.static` | `gray.90` | |

#### background (배경)
| 토큰 | 참조 primitive |
|------|------|
| `background.white` | `gray.0` |
| `background.inverse` | `gray.90` |
| `background.gray-subtler` | `gray.5` |
| `background.gray-subtle` | `gray.10` |
| `background.dim` | `alpha.black75` (모달 dim) |

#### surface (표면 — 카드/패널)
| 토큰 | 참조 primitive |
|------|------|
| `surface.white` | `gray.0` |
| `surface.inverse` | `gray.90` |
| `surface.gray-subtler` | `gray.5` |
| `surface.gray-subtle` | `gray.10` |
| `surface.disabled` | `gray.20` |
| `surface.primary-subtler` | `primary.5` |
| `surface.secondary-subtler` | `secondary.5` |
| `surface.danger-subtler` | `danger.5` |
| `surface.warning-subtler` | `warning.5` |
| `surface.success-subtler` | `success.5` |
| `surface.information-subtler` | `information.5` |
| `surface.point-subtler` | `point.5` |

#### border (테두리)
| 토큰 | 참조 primitive |
|------|------|
| `border.gray-light` | `gray.20` |
| `border.gray` | `gray.30` (disabled) |
| `border.gray-dark` | `gray.60` (active) |
| `border.gray-darker` | `gray.90` |
| `border.primary` | `primary.50` (active/selected) |
| `border.primary-light` | `primary.10` |
| `border.secondary` | `secondary.70` |
| `border.secondary-light` | `secondary.10` |
| `border.danger` | `danger.50` |
| `border.danger-light` | `danger.10` |
| `border.warning` | `warning.50` |
| `border.warning-light` | `warning.10` |
| `border.success` | `success.50` |
| `border.success-light` | `success.10` |
| `border.information` | `information.50` |
| `border.information-light` | `information.10` |
| `border.point` | `point.50` |
| `border.point-light` | `point.10` |
| `border.disabled` | `gray.30` |
| `border.inverse` | `gray.0` |
| `border.transparency` | `alpha.black0` |

#### icon
| 토큰 | 참조 primitive |
|------|------|
| `icon.gray` | `gray.80` |
| `icon.gray-light` | `gray.70` |
| `icon.gray-fill` | `gray.20` |
| `icon.inverse` | `gray.0` |
| `icon.primary` | `primary.50` |
| `icon.secondary` | `secondary.80` |
| `icon.point` | `point.50` |
| `icon.danger` | `danger.50` |
| `icon.warning` | `warning.50` |
| `icon.success` | `success.50` |
| `icon.information` | `information.50` |
| `icon.disabled` | `gray.40` |
| `icon.disabled-on` | `gray.50` |

#### link
| 토큰 | 값 |
|------|------|
| `link.default` | `primary.50` |
| `link.hover` | `primary.60` |
| `link.pressed` | `primary.70` |
| `link.visited` | `#5917b8` (직접 hex — 유일한 직접 정의) |

#### button (버튼 전용 시맨틱)
| 토큰 | 참조 |
|------|------|
| `button.primary-fill` | `primary.50` |
| `button.primary-fill-hover` | `primary.60` |
| `button.primary-fill-pressed` | `primary.70` |
| `button.secondary-fill` | `primary.5` |
| `button.secondary-fill-hover` | `primary.10` |
| `button.secondary-fill-pressed` | `primary.20` |
| `button.secondary-border` | `primary.50` |
| `button.tertiary-fill` | `alpha.white0` |
| `button.tertiary-fill-hover` | `gray.5` |
| `button.tertiary-fill-pressed` | `gray.10` |
| `button.tertiary-border` | `gray.60` |
| `button.text-fill` | `alpha.white0` |
| `button.text-fill-hover` | `secondary.5` |
| `button.text-fill-pressed` | `secondary.10` |
| `button.text-border` | `alpha.black0` |
| `button.disabled-fill` | `gray.20` |
| `button.disabled-border` | `gray.30` |

#### input (입력 필드)
| 토큰 | 참조 |
|------|------|
| `input.border` | `gray.60` |
| `input.border-active` | `primary.50` |
| `input.border-error` | `danger.50` |
| `input.border-disabled` | `gray.30` |
| `input.surface` | `gray.0` |
| `input.surface-disabled` | `gray.20` |

#### action (액션 상태 색상)
| 토큰 | 참조 |
|------|------|
| `action.primary` | `alpha.white0` (transparent base) |
| `action.primary-hover` | `primary.5` |
| `action.primary-pressed` | `primary.10` |
| `action.primary-active` | `primary.50` |
| `action.primary-selected` | `primary.5` |
| `action.secondary` | `alpha.white0` |
| `action.secondary-hover` | `secondary.5` |
| `action.secondary-pressed` | `secondary.10` |
| `action.secondary-active` | `secondary.70` |
| `action.secondary-selected` | `secondary.5` |
| `action.disabled` | `gray.20` |
| `action.white` | `gray.0` |

#### divider, element, graphic (그 외 시맨틱)
- `divider.*` (gray-light/gray/gray-dark/gray-darker/primary/secondary/error/point 등)
- `element.*` (gray-lighter/light/normal/dark, primary/secondary/point/danger/warning/success/information의 lighter/light/normal 등)
- `graphic.*` (blue-subtler/subtle/normal/dark/darker, red-subtler/subtle/normal/dark/darker, brand)

> 전체 시맨틱 토큰은 `tokens/transformed_tokens.json` mode-light/mode-high-contrast 섹션 참조 (이 문서에 모두 추출됨).

---

## 2. 타이포그래피 (Typography)

### 2.1 폰트 패밀리
- **권장 폰트**: `Pretendard GOV`
  - SCSS 정의: `$font-family-base: "Pretendard GOV", sans-serif`
  - 출처: `resources/scss/common/_variables_for_code.scss` line 15
  - Pretendard 기반으로 공공기관 접근성·가독성에 최적화
  - 별도 다운로드 필요 (Figma 시작 1단계)
- **확장형 권장**: Noto Sans, Nanum Gothic, Spoqa Han Sans
- **베이스 사이즈**: 17px (Pretendard GOV 상대적으로 작은 자형 보정)

### 2.2 폰트 크기 — Primitive `$font-size-base`
- **`62.5%`** = 1rem = 10px (1rem=10px 트릭 명시적 채택, 출처 SCSS line 16 주석: `//10px 1rem으로 설정`)

### 2.3 폰트 Weight
| 토큰 | 값 |
|------|------|
| `regular` | 400 |
| `bold` | 700 |

### 2.4 line-height
| 토큰 | 값 |
|------|------|
| `none` | 1 |
| `base` | 1.5 (150%) |

> KRDS는 접근성 위해 **최소 150%** 이상 권장.

### 2.5 letter-spacing
| 토큰 | 값 |
|------|------|
| `none` | 0rem |
| `wide` | 0.1rem (= 1px) |

### 2.6 텍스트 스타일 스케일 — PC

#### Display
| 스타일 | PC | Mobile | weight | line-height | letter-spacing |
|--------|-----|--------|--------|-------------|----------------|
| display-large | 6rem (60px) | 4.4rem (44px) | 700 | 150% | 1px |
| display-medium | 4.4rem (44px) | 3.2rem (32px) | 700 | 150% | 1px |
| display-small | 3.6rem (36px) | 2.8rem (28px) | 700 | 150% | 1px |

#### Heading (h1~h5 매핑)
| 스타일 | PC | Mobile | weight |
|--------|-----|--------|--------|
| heading-xlarge | 4rem (40px) | 2.8rem (28px) | 700 |
| heading-large | 3.2rem (32px) | 2.4rem (24px) | 700 |
| heading-medium | 2.4rem (24px) | 2.2rem (22px) | 700 |
| heading-small | 1.9rem (19px) | 1.9rem (19px) | 700 |
| heading-xsmall | 1.7rem (17px) | 1.7rem (17px) | 700 |
| heading-xxsmall | 1.5rem (15px) | 1.5rem (15px) | 700 |

#### Body (본문)
| 스타일 | PC | Mobile | weight |
|--------|-----|--------|--------|
| body-large | 1.9rem (19px) | 1.9rem (19px) | 400 |
| body-large-bold | 1.9rem (19px) | 1.9rem (19px) | 700 |
| **body-medium** | **1.7rem (17px)** | **1.7rem (17px)** | **400 (기본 본문)** |
| body-medium-bold | 1.7rem (17px) | 1.7rem (17px) | 700 |
| body-small | 1.5rem (15px) | 1.5rem (15px) | 400 |
| body-small-bold | 1.5rem (15px) | 1.5rem (15px) | 700 |
| body-xsmall | 1.3rem (13px) | 1.3rem (13px) | 400 |
| body-xsmall-bold | 1.3rem (13px) | 1.3rem (13px) | 700 |

#### Label (UI 레이블)
| 스타일 | PC/Mobile | weight |
|--------|-----------|--------|
| label-large | 1.9rem (19px) | 400 |
| label-medium | 1.7rem (17px) | 400 |
| label-small | 1.5rem (15px) | 400 |
| label-xsmall | 1.3rem (13px) | 400 |

#### Navigation (시맨틱)
| 토큰 | PC | Mobile |
|------|-----|--------|
| nav-title-medium | 2.4rem | 2.2rem |
| nav-title-small | 1.9rem | 1.9rem |
| nav-depth-medium-bold | 1.7rem (700) | 1.7rem (700) |
| nav-depth-medium | 1.7rem (400) | 1.7rem (400) |
| nav-depth-small-bold | 1.5rem (700) | 1.5rem (700) |
| nav-depth-small | 1.5rem (400) | 1.5rem (400) |

> letter-spacing은 Display는 1px, 그 외 기본 0px.
> line-height는 모두 150% 일관 적용.

---

## 3. 간격 (Spacing) — 8-point grid

### 3.1 Primitive number 스케일 (전체 22단계)
> 모든 값은 `rem` (1rem = 10px). 8-point grid 베이스이지만 fine-grained 조절 위해 4/2 단위도 포함.

| primitive | rem | px |
|-----------|-----|-----|
| 0 | 0rem | 0px |
| 1 | 0.1rem | 1px |
| 2 | 0.2rem | 2px |
| 3 | 0.4rem | 4px |
| 4 | 0.6rem | 6px |
| 5 | 0.8rem | 8px |
| 6 | 1.0rem | 10px |
| 7 | 1.2rem | 12px |
| 8 | 1.6rem | 16px |
| 9 | 2.0rem | 20px |
| 10 | 2.4rem | 24px |
| 11 | 2.8rem | 28px |
| 12 | 3.2rem | 32px |
| 13 | 3.6rem | 36px |
| 14 | 4.0rem | 40px |
| 15 | 4.4rem | 44px |
| 16 | 4.8rem | 48px |
| 17 | 5.6rem | 56px |
| 18 | 6.4rem | 64px |
| 19 | 7.2rem | 72px |
| 20 | 8.0rem | 80px |
| 21 | 9.6rem | 96px |
| max | 100rem | 1000px |

### 3.2 Semantic gap (요소 간 간격)
| 토큰 | 참조 primitive | px |
|------|------|-----|
| gap-1 | number-2 | 2px |
| gap-2 | number-3 | 4px |
| gap-3 | number-5 | 8px |
| gap-4 | number-7 | 12px |
| gap-5 | number-8 | 16px |
| gap-6 | number-9 | 20px |
| gap-7 | number-10 | 24px |
| gap-8 | number-12 | 32px |
| gap-9 | number-14 | 40px |
| gap-10 | number-16 | 48px |
| gap-11 | number-18 | 64px |
| gap-12 | number-20 | 80px |

### 3.3 Semantic padding
| 토큰 | 참조 primitive | px |
|------|------|-----|
| padding-1 | number-2 | 2px |
| padding-2 | number-3 | 4px |
| padding-3 | number-5 | 8px |
| padding-4 | number-6 | 10px |
| padding-5 | number-7 | 12px |
| padding-6 | number-8 | 16px |
| padding-7 | number-9 | 20px |
| padding-8 | number-10 | 24px |
| padding-9 | number-12 | 32px |
| padding-10 | number-14 | 40px |

### 3.4 Semantic size-height (높이 — 버튼/입력 등 컴포넌트 기준)
| 토큰 | 참조 | px |
|------|------|-----|
| size-height-1 | number-5 | 8px |
| size-height-2 | number-8 | 16px |
| size-height-3 | number-9 | 20px |
| size-height-4 | number-10 | 24px |
| size-height-5 | number-12 | 32px |
| size-height-6 | number-14 | 40px |
| size-height-7 | number-16 | 48px |
| size-height-8 | number-17 | 56px |
| size-height-9 | number-18 | 64px |
| size-height-10 | number-19 | 72px |
| size-height-11 | number-20 | 80px |

### 3.5 Layout 간격 — 반응형 (gap-layout)

#### Mobile (< 1024px)
| 토큰 | 참조 | px |
|------|------|-----|
| header-breadcrumb | number-8 | 16px |
| breadcrumb-h1 | number-12 | 32px |
| h1-h2 | number-12 | 32px |
| h2-h2 | number-14 | 40px |
| h2-h3 | number-10 | 24px |
| h3-h3 | number-12 | 32px |
| h3-h4 | number-8 | 16px |
| h4-h4 | number-10 | 24px |
| h4-h5 | number-7 | 12px |
| h5-h5 | number-8 | 16px |
| title-body-small | number-5 | 8px |
| title-body-medium | number-7 | 12px |
| title-body-large | number-9 | 20px |
| contents-footer | number-14 | 40px |
| left-contents | 0rem | 0px |
| contents-right | 0rem | 0px |
| text-text-large | number-8 | 16px |
| text-text-medium | number-7 | 12px |
| text-text-small | number-6 | 10px |
| image-text-small | number-8 | 16px |
| image-text-medium | number-9 | 20px |
| image-text-large | number-10 | 24px |

#### PC (≥ 1024px)
| 토큰 | 참조 | px |
|------|------|-----|
| header-breadcrumb | number-10 | 24px |
| breadcrumb-h1 | number-14 | 40px |
| h1-h2 | number-16 | 48px |
| h2-h2 | number-20 | 80px |
| h2-h3 | number-14 | 40px |
| h3-h3 | number-18 | 64px |
| h3-h4 | number-10 | 24px |
| h4-h4 | number-14 | 40px |
| h4-h5 | number-8 | 16px |
| h5-h5 | number-12 | 32px |
| title-body-small | number-8 | 16px |
| title-body-medium | number-9 | 20px |
| title-body-large | number-10 | 24px |
| contents-footer | number-18 | 64px |
| left-contents | number-18 | 64px |
| contents-right | number-14 | 40px |
| text-text-large | number-9 | 20px |
| text-text-medium | number-8 | 16px |
| text-text-small | number-7 | 12px |
| image-text-small | number-9 | 20px |
| image-text-medium | number-10 | 24px |
| image-text-large | number-12 | 32px |

### 3.6 Card padding (반응형)
| 사이즈 | Mobile | PC |
|--------|--------|------|
| xsmall | 1.2rem (12px) | 1.6rem (16px) |
| small | 2rem (20px) | 2.4rem (24px) |
| medium | 2.4rem (24px) | 3.2rem (32px) |
| large | 2.4rem (24px) | 4rem (40px) |

---

## 4. 그리드 (Grid) & 콘텐츠 영역

### 4.1 콘텐츠 영역 (Layout container)
| 토큰 | 값 | 비고 |
|------|------|------|
| `--krds-contents-size` | **1200px** | 콘텐츠 max-width |
| `--krds-contents-wrap-size` | **1248px** | 콘텐츠 + padding 양쪽 (1200 + 24×2) |
| `--krds-contents-padding-x` (PC) | **24px** | 1024px 이상 |
| `--krds-contents-padding-x` (Mobile) | **16px** | 1024px 미만 |

### 4.2 스크린 마진 (좌우 마진)
| 사이즈 | 값 | 적용 |
|--------|------|------|
| large | 24px | 1024px 이상 |
| medium | 24px | 768px 이상 |
| small | 16px | 360px 이상 |

### 4.3 그리드 거터 (Gutter)
| 사이즈 | 최소 | 최적 | 적용 |
|--------|------|------|------|
| large | 16px | 24px | 1024px 이상 |
| medium | 16px | 24px | 768px 이상 |
| small | 16px | 16px | 360px 이상 |

### 4.4 컬럼 수
> KRDS 공식 페이지에서 명시된 정확한 컬럼 수치는 확인되지 않음. 일반 8-point grid 기반 12-column이 통상이지만, **KRDS는 컴포넌트 간 gap·padding을 모두 토큰화한 "토큰 기반 레이아웃" 방식이라 12/8/4 컬럼을 강제하지 않음** (관찰).
> ⚠ **공백 — UX팀 결정 필요 또는 Figma 라이브러리 직접 확인 필요**

---

## 5. 반응형 브레이크포인트 (Breakpoints)

> 출처: `resources/scss/common/_variables_for_code.scss` line 8-12

| 토큰 | 값 |
|------|------|
| `$breakpoint-small` | **360px** |
| `$breakpoint-medium` | **768px** |
| `$breakpoint-large` | **1024px** |
| `$breakpoint-xlarge` | **1280px** |
| `$breakpoint-xxlarge` | **1440px** |

### 미디어 쿼리 mixin (출처: `mixins/_breakpoints.scss`)
| Mixin | 범위 |
|-------|------|
| `size-medium` | ~ 767px (모바일) |
| `size-medium-more` | 768px ~ |
| `size-medium-to-large` | 768 ~ 1023 (태블릿) |
| `size-large-less` | ~ 1023 (모바일+태블릿) |
| `size-large-more` | 1024 ~ |
| `size-large-to-xlarge` | 1024 ~ 1279 (소형 데스크톱) |
| `size-xlarge` | 1280 ~ |

### 디바이스 분류 추정
- **Mobile**: ~ 767px
- **Tablet**: 768 ~ 1023
- **Desktop (Small)**: 1024 ~ 1279
- **Desktop**: 1280 ~ 1439
- **Desktop (Large)**: 1440 ~

---

## 6. 반경 (Border Radius)

> 출처: KRDS Shape 가이드 + transformed_tokens.json semantic.radius

### 6.1 Semantic radius 토큰
| 토큰 | 참조 | px | 적용 컴포넌트 |
|------|------|-----|---------------|
| xsmall1 | number-2 | 2px | 인디케이터, 배지 |
| xsmall2 | number-2 | 2px | 프로그레스 바 |
| xsmall3 | number-2 | 2px | |
| small1 | number-3 | 4px | 칩, 체크박스 |
| small2 | number-3 | 4px | 라디오, 스위치 |
| small3 | number-3 | 4px | 태그 |
| medium1 | number-4 | 6px | 버튼 small |
| medium2 | number-4 | 6px | 버튼 medium, 입력 |
| medium3 | number-5 | 8px | 버튼 large, 셀렉트 |
| medium4 | number-5 | 8px | 페이지네이션 |
| large1 | number-6 | 10px | 카드 |
| large2 | number-6 | 10px | 다이얼로그 |
| xlarge1 | number-7 | 12px | 배너, 다이얼로그 |
| xlarge2 | number-7 | 12px | 바텀 시트 |
| max | number-max | 1000px | 완전 원형 (pill) |

### 6.2 KRDS Shape 가이드 — 5단계 추상 그룹
| 그룹 | 컨테이너 크기 | 반경값 | 컴포넌트 예시 |
|------|---------------|--------|---------------|
| Xsmall | 8×8~16×16 | 2px | 인디케이터, 배지, 프로그레스 |
| Small | 20×20~32×32 | 4px | 칩, 체크박스, 라디오, 스위치, 태그 |
| Medium | 40×40~64×64 | 6~8px | 버튼, 입력, 셀렉트, 페이지네이션 |
| Large | 72×72~80×80 | 10px | 카드, 다이얼로그 |
| Xlarge | 96×96~120×120 | 12px (최대) | 배너, 다이얼로그, 바텀 시트 |

### 6.3 반경 계산 공식
- "컨테이너 높이 × 1/8 (0.125) = radius"
- 홀수 결과는 더 높은 짝수로 반올림
- 짝수 권장, px 단위 사용

---

## 7. 그림자 (Shadow / Elevation)

> KRDS는 별도의 elevation-1/2/3 같은 추상 토큰 없이, 컴포넌트별로 그림자를 직접 정의함. 모든 그림자는 위 § 1.1의 `alpha-shadow1/2/3` 토큰을 조합하여 만듦.

### 7.1 그림자 alpha (재인용)
- shadow1: `#0000000d` (5%)
- shadow2: `#00000014` (8%)
- shadow3: `#0000001f` (12%)

### 7.2 컴포넌트별 그림자 정의 (Light 모드)

| 컴포넌트 토큰 | 값 |
|---------------|------|
| `--krds-modal--wrap-shadow` | `0 0 0.2rem 0 shadow2, 0 1.6rem 2.4rem 0 shadow3` |
| `--krds-help-panel--shadow` | `0 0 0.2rem 0 shadow2, 0 0.8rem 1.6rem 0 shadow3` |
| `--krds-contextual-help--popover-shadow` | `0 0 0.2rem 0 shadow2, 0 0.8rem 1.6rem 0 shadow3` |
| `--krds-critical-alerts--banner-shadow` | `0 0 0.2rem 0 shadow1, 0 0.4rem 0.8rem 0 shadow2` |
| `--krds-calendar--head-drop-down-shadow` | `0 0 0.2rem 0 shadow1, 0 0.4rem 0.8rem 0 shadow2` |
| `--krds-dropdown--menu-color-alpha-shadow` | (드롭다운용 — 정확 값은 _dropdown.scss 참조) |

### 7.3 추상화 그림자 단계 (관찰)
- **Level-1 (subtle)**: `0 0 0.2rem 0 shadow1, 0 0.4rem 0.8rem 0 shadow2` — alert/banner/dropdown
- **Level-2 (medium)**: `0 0 0.2rem 0 shadow2, 0 0.8rem 1.6rem 0 shadow3` — popover/help panel
- **Level-3 (deep)**: `0 0 0.2rem 0 shadow2, 0 1.6rem 2.4rem 0 shadow3` — modal

### 7.4 포커스 outline 그림자
| 토큰 | 값 |
|------|------|
| `--krds-box-shadow-outline` | `0 0 0 0.4rem var(--krds-light-color-border-primary)` |
| `--krds-box-shadow-outline-inset` | `inset 0 0 0 0.2rem var(--krds-light-color-border-primary)` |

> KRDS의 포커스 스타일: 4px 두께의 primary 색상 외곽선

---

## 8. 모션 (Motion / Transition)

> 출처: `_variables_for_code.scss` line 45-49

| 토큰 | 값 |
|------|------|
| `$transition-base` | `.4s ease-in-out` |
| `$transition-fade` | `opacity .4s linear` |
| `$transition-collapse` | `max-height .4s ease` |
| `$transition-collapse-width` | `width .4s ease` |

### CSS 변수
- `--krds-transition-base`: `0.4s ease-in-out`
- `--krds-transition-fade`: `opacity 0.4s linear`
- `--krds-transition-collapse`: `max-height 0.4s ease`
- `--krds-transition-collapse-width`: `width 0.4s ease`

### 추가 관찰 (modal SCSS)
- 모달 visibility: `transition: visibility .15s .3s, z-index 0s .3s, opacity .2s`

> ⚠ **공백** — KRDS는 별도의 motion-duration 스케일(예: motion-fast/medium/slow)을 정의하지 않음. 사실상 0.4s/0.4s/0.4s/0.4s 단일 값 + 0.15s/0.2s/0.3s 컴포넌트별 보조값이 전부. 인포마인드 UX팀이 motion 스케일을 별도 정의할지 결정 필요.

---

## 9. z-index 레이어

> 출처: 컴파일된 `component.css` 분석 (별도 토큰 정의 없음)

| 값 | 용도 (관찰) |
|-----|-------------|
| -1 | 모달 닫힘 상태, 가려진 레이어 |
| auto | 기본 |
| 1 | 일반 stacking |
| 2 ~ 5 | 컴포넌트 내부 stacking |
| 10 | 카드/리스트 hover 등 |
| 50, 60, 70, 71 | 푸터·헤더 sticky 등 |
| 100 | 헤더 등 fixed |
| 901 | 모달 wrap |
| 1000 | 백드롭 dim |
| 1010 | 모달 위 추가 레이어 |
| 1020 | 토스트/알림 |
| 10000 | 최상단 (TTS 등) |

> ⚠ **공백** — KRDS는 추상화된 z-index 토큰(예: `z-index-modal: 1000`)을 정의하지 않고 raw 값을 직접 사용. UX팀이 `z-index-{layer}` 토큰을 별도 정의 필요.

---

## 10. 컴포넌트 카탈로그 (KRDS 공식 컴포넌트 37+개)

> 출처: `https://www.krds.go.kr/html/site/component/component_summary.html` + GitHub `resources/scss/component/`

### 10.1 카테고리별 목록

#### 정체성 (Identity)
- 공식 배너 (Masthead) — `_masthead.scss`
- 운영기관 식별자 (Identifier) — `_identifier.scss`
- 헤더 (Header) — `_header.scss`
- 푸터 (Footer) — `_footer.scss`

#### 탐색 (Navigation)
- 건너뛰기 링크 (Skip link) — `_skip_link.scss`
- 메인 메뉴 (Main menu) — `_main_menu.scss`
- 브레드크럼 (Breadcrumb) — `_breadcrumb.scss`
- 사이드 메뉴 (Side navigation) — `_side_navigation.scss`
- 콘텐츠 내 탐색 (In-page navigation) — `_in_page_navigation.scss`
- 페이지네이션 (Pagination) — `_pagination.scss`

#### 레이아웃 및 표현 (Layout & Presentation)
- 구조화 목록 (Structured list) — `_structured_list.scss`
- 긴급 공지 (Critical alerts) — `_critical_alerts.scss`
- 달력 (Calendar) — `_calendar.scss`
- 디스클로저 (Disclosure) — `_disclosure.scss`
- 모달 (Modal) — `_modal.scss`
- 배지 (Badge) — `_badge.scss`
- 아코디언 (Accordion) — `_accordion.scss`
- 이미지 (Image)
- 캐러셀 (Carousel) — `_carousel.scss`
- 탭 (Tab) — `_tab.scss`
- 표 (Table) — `_table.scss`
- 텍스트 목록 (Text list) — `_text_list.scss`
- 파비콘 (Favicon)

#### 액션 (Action)
- 링크 (Link)
- 버튼 (Button) — `_button.scss`
- 플로팅 버튼 (FAB)

#### 선택 (Selection)
- 라디오 버튼 (Radio button) — `_form_check.scss`
- 체크박스 (Checkbox) — `_form_check.scss`
- 셀렉트 (Select) — `_select.scss`
- 태그 (Tag) — `_tag.scss`
- 토글 스위치 (Toggle switch) — `_switch.scss`

#### 피드백 (Feedback)
- 단계 표시기 (Step indicator) — `_step_indicator.scss`
- 스피너 (Spinner) — `_spinner.scss`

#### 도움 (Help)
- 도움 패널 (Help panel) — `_help_panel.scss`
- 따라하기 패널 (Tutorial panel)
- 맥락적 도움말 (Contextual help) — `_contextual_help.scss`
- 코치마크 (Coach mark) — `_coach_mark.scss`
- 툴팁 (Tooltip) — `_tooltip.scss`
- 음성지원 (TTS) — `_tts.scss`

#### 입력 (Input)
- 날짜 입력 필드 (Date input) — `_input.scss`
- 텍스트 영역 (Textarea) — `_input.scss`
- 텍스트 입력 필드 (Text input) — `_input.scss`
- 파일 업로드 (File upload) — `_file_upload.scss`

#### 설정 (Settings)
- 언어 변경 (Language switcher) — `_language_switcher.scss`
- 화면 크기 조정 (Resize) — `_resize.scss`

#### 콘텐츠 (Content)
- 접근 가능한 미디어 (Accessible multimedia)
- 숨긴 콘텐츠 (Visually hidden)

#### 모바일 (Mobile-only)
- 범위 슬라이드 (Range slider)
- 뒤로가기 버튼 (Back button)
- 바텀시트 (Bottom sheet)
- 수량 토글 (Quantity toggle)
- 토스트 (Toast)
- 스낵바 (Snackbar)
- 탭바 (Tab bars)
- 스플래시 스크린 (Splash screen)

> 총 ~50개 컴포넌트 (KRDS 공식 카탈로그는 "37 컴포넌트"로 표시되나 모바일 컴포넌트 포함 시 50개 수준)

### 10.2 버튼 (Button) — 상세 명세

#### Variant (4종)
1. **primary** — 채움 / 가장 강조 액션
2. **secondary** — primary.5 채움 + primary.50 border / 보조 액션
3. **tertiary** — 투명 채움 + gray.60 border / 약한 액션
4. **text** — 투명 + 투명 border / 텍스트 링크형

#### Size (5종)
| 사이즈 | size-height | padding-x | gap | radius |
|--------|-------------|-----------|-----|--------|
| xsmall | size-height-5 (32px) | padding-4 (10px) | gap-1 (2px) | small3 (4px) |
| small | size-height-6 (40px) | padding-5 (12px) | gap-1 (2px) | medium1 (6px) |
| medium | size-height-7 (48px) | padding-6 (16px) | gap-2 (4px) | medium2 (6px) |
| large | size-height-8 (56px) | padding-7 (20px) | gap-2 (4px) | medium3 (8px) |
| xlarge | size-height-9 (64px) | padding-8 (24px) | gap-2 (4px) | medium4 (8px) |

#### State
- default / hover / pressed / active / selected / disabled

> 다른 컴포넌트 상세 명세는 `https://www.krds.go.kr/html/site/component/component_NN_NN.html` 또는 `resources/scss/component/_*.scss`를 직접 참조.

### 10.3 입력 필드 (Text input) — 핵심 명세

- 구성: 레이블 → 보조설명 → 입력박스 → 시스템메시지
- 요소 간 gap: **gap-3 (8px)**
- 입력박스 내부 padding: **padding-6 (16px)**
- 출처: KRDS 입력폼 가이드 페이지

---

## 11. 접근성 (Accessibility)

### 11.1 준수 표준
- **W3C WCAG 2.1 Level AA 이상**
- 한국 KWCAG 2.1/2.2 (행정안전부 고시) 호환
- 출처: KRDS 디자이너 시작하기 페이지

### 11.2 색상 대비
- 일반 텍스트: **4.5:1 이상** (AA)
- 큰 텍스트(18pt+ 또는 14pt bold+): **3:1 이상** (AA)
- 일반 텍스트 AAA: 7:1
- 큰 텍스트 AAA: 4.5:1
- **매직넘버 50 규칙**: KRDS 색상 단계에서 두 단계 차이가 50 이상이면 4.5:1 자동 충족 (예: gray.10 ↔ gray.60)

### 11.3 아이콘 대비
- 기본 모드: 최소 **3:1**
- 고대비 모드: **7:1**

### 11.4 본문 폰트 사이즈
- **최소 16px**, KRDS는 17px (body-medium) 채택

### 11.5 line-height
- **최소 150%** (모든 KRDS 텍스트 토큰이 150%로 통일)

### 11.6 포커스 스타일
- 모든 인터랙티브 요소에 outline 필수
- KRDS 기본: 4px primary 색상 외곽선 (`--krds-box-shadow-outline`)
- `:focus { outline: none }` 금지

### 11.7 터치/클릭 영역
- KRDS 공식 페이지에서 명시적 수치 미확인. 단, 버튼 최소 사이즈 xsmall=32px / small=40px / medium=48px이며, **medium(48px)을 모바일 권장**으로 추정 (WCAG 권장 44×44px 충족).
- ⚠ **공백** — 명시적 "터치 타겟 최소 44×44px" 문구 출처 미확인. UX팀이 KRDS 위에 명시 추가 필요.

### 11.8 키보드 네비게이션
- 모든 컴포넌트(모달/드롭다운/탭 등)는 Tab/Enter/Esc/방향키 지원 가이드 명시
- Skip Link 컴포넌트(`_skip_link.scss`) 필수 제공

### 11.9 스크린 리더
- 모든 인터랙티브 요소에 적절한 aria-label/role/aria-live 등 ARIA 속성 사용
- 음성지원 TTS 컴포넌트 별도 제공
- "숨긴 콘텐츠" (Visually hidden) 컴포넌트 표준화

### 11.10 고대비 모드
- KRDS는 light/high-contrast 두 모드를 시스템 차원에서 지원
- `prefers-contrast: more` 미디어 쿼리 + `[data-color-mode="high-contrast"]` 어트리뷰트 모두 활용 (관찰)

---

## 12. 1rem = 10px 트릭 권장 여부

### 결론: **KRDS는 명시적으로 채택함** ✅

#### 출처 (직접 인용)
파일: `resources/scss/common/_variables_for_code.scss` line 16
```scss
$font-size-base: 62.5% !default; //10px 1rem으로 설정
```

CSS 출력 (`common.css`):
```css
--krds-font-size-base: 62.5%;
```

#### 적용 증거
- KRDS의 모든 spacing/size primitive 값이 0.1rem 단위로 정의됨
  - number-1 = 0.1rem (= 1px)
  - number-2 = 0.2rem (= 2px)
  - number-8 = 1.6rem (= 16px)
- 모든 폰트 크기도 rem 단위 (예: body-medium = 1.7rem = 17px, display-large = 6rem = 60px)
- 인포마인드 UX팀이 사용 중인 62.5% 트릭과 **완전 동일**

---

## 13. 토큰 네이밍 규칙

### 13.1 형식
```
--krds-{mode?}-{category}-{subcategory?}-{role}-{state?}
```

### 13.2 핵심 prefix
- 모든 CSS 변수: `--krds-` 접두사
- 모드: `light` / `high-contrast`
- 반응형: `mobile` / `pc`

### 13.3 계층 (KRDS 공식 분류)
1. **Primitive tokens** — 기초 디자인 속성 (직접 사용 X)
   - 예: `--krds-light-color-primary-50`
2. **Semantic tokens** — 의미·맥락 정의 (Figma에서 정의)
   - 예: `--krds-light-color-text-primary`
3. **Component tokens** — 컴포넌트 전용 (코드에서 정의)
   - 예: `--krds-button--primary-fill`

### 13.4 컴포넌트 토큰 네이밍 패턴
```
--krds-{component-name}--{theme/type/size/modifier}
```
예시:
- `--krds-button--primary-fill`
- `--krds-modal--wrap-shadow`
- `--krds-calendar--head-drop-down-shadow`
- 더블 하이픈 `--`로 컴포넌트명과 속성 구분

### 13.5 색상 토큰 네이밍
```
--krds-{mode}-color-{category}-{role}
```
- 모드: `light` | `high-contrast`
- 카테고리: `primary` | `secondary` | `gray` | `danger` | `warning` | `success` | `information` | `point` | `graphic` | `alpha` (primitive)
- 카테고리: `text` | `background` | `surface` | `border` | `icon` | `link` | `button` | `input` | `action` | `divider` | `element` | `graphic` (semantic)
- 단계 (primitive): 0/5/10/20/30/40/50/60/70/80/90/95/100
- 역할 (semantic): basic/bolder/subtle/disabled/inverse 등

### 13.6 단위 토큰 네이밍
```
--krds-{type}-{step|name}
```
- `--krds-radius-medium2`
- `--krds-padding-6`
- `--krds-gap-3`
- `--krds-size-height-7`

### 13.7 반응형 토큰 네이밍
```
--krds-{mobile|pc}-{type}-{role}
```
- `--krds-pc-font-size-body-medium`
- `--krds-mobile-font-size-display-large`
- `--krds-pc-gap-layout-h1-h2`

---

## 14. 모순/공백 메모

### 14.1 KRDS와 전자정부 UI/UX 가이드 차이
- **차이 없음**. uiux.egovframe.go.kr/guide/index.html은 KRDS와 동일한 콘텐츠를 호스팅함이 확인됨 (2026-04-30 기준 첫 검색결과 제목이 "KRDS"). 별도 보완 항목 없음.

### 14.2 KRDS에 명시 안 된 항목 (UX팀 결정 필요)

| 항목 | 현황 | 권장 처리 |
|------|------|------|
| **Grid columns 수** | 12/8/4 컬럼 강제 안 함 (gap·padding 토큰화) | UX팀이 12-col 기본값 명시 |
| **z-index 추상 토큰** | raw 값 직접 사용(1000/1010/1020 등) | `z-index-{header/modal/toast}` 토큰 정의 |
| **Motion duration 스케일** | 0.4s/0.15s/0.2s/0.3s 단일·보조값만 | `motion-fast/medium/slow` 등 스케일 정의 |
| **Easing 스케일** | `ease-in-out` / `linear` / `ease`만 사용 | `easing-emphasis/standard/decelerate` 등 정의 |
| **Touch target 최소 사이즈** | 명시적 44px 문구 미확인 | UX팀이 44×44px 강제 명시 |
| **Elevation 추상 토큰** | 컴포넌트별 직접 정의(`--krds-modal--wrap-shadow` 등) | `shadow-1/2/3` 추상 토큰 정의 |
| **다크 모드** | high-contrast 모드만 존재. 일반 다크 모드는 없음 | 필요 시 별도 추가 |
| **Brand 변형 토큰** | 확장형 가이드는 색상/모양 커스터마이즈 가능하다고만 명시 | UX팀 brand-* 토큰 별도 정의 |

### 14.3 출처 미확인 항목
- KRDS 사이트의 "이미지" 컴포넌트 상세 명세
- 그리드 정확한 컬럼 수 (Figma 라이브러리 직접 확인 필요)
- 모션 duration 추상 스케일 (없음 — 사실상 단일 값)

### 14.4 KRDS 자체의 한계
- **컴포넌트 사이즈 명세는 SCSS 파일에서만 추출 가능** (KRDS 공식 사이트는 SPA로 렌더링되어 브라우저 자동화 없이 fetch만으로는 컴포넌트 명세 확인 어려움)
- KRDS 공식 사이트의 디자인 토큰 페이지(style_07)는 동적 렌더링되어 토큰값이 HTML에 직접 노출되지 않음 → GitHub `tokens/transformed_tokens.json` 사용이 정공법

---

## 15. 참고 URL 목록

### KRDS 공식
- 메인: https://www.krds.go.kr/
- 구버전(v0.4): https://v04.krds.go.kr/
- 디자인 원칙: https://www.krds.go.kr/html/site/utility/utility_02.html
- 색상 가이드: https://www.krds.go.kr/html/site/style/style_02.html
- 타이포그래피 가이드: https://www.krds.go.kr/html/site/style/style_03.html
- 형태(반경): https://www.krds.go.kr/html/site/style/style_04.html
- 레이아웃(간격/그리드): https://www.krds.go.kr/html/site/style/style_05.html
- 아이콘: https://www.krds.go.kr/html/site/style/style_06.html
- 디자인 토큰: https://www.krds.go.kr/html/site/style/style_07.html
- 디자인 토큰 전체 보기: https://www.krds.go.kr/html/site/style/style_07_popup.html
- 컴포넌트 카탈로그: https://www.krds.go.kr/html/site/component/component_summary.html
- 디자이너 시작하기: https://www.krds.go.kr/html/site/outline/outline_02.html
- KRDS 소개: https://www.krds.go.kr/html/site/utility/utility_01.html

### KRDS 공식 GitHub
- 조직 페이지: https://github.com/KRDS-uiux
- 메인 저장소: https://github.com/KRDS-uiux/krds-uiux
- **토큰 JSON (이 문서의 hex/rem 값 원본 출처)**:
  - https://raw.githubusercontent.com/KRDS-uiux/krds-uiux/main/tokens/transformed_tokens.json
  - https://raw.githubusercontent.com/KRDS-uiux/krds-uiux/main/tokens/figma_token.json
- SCSS 변수 원본: https://raw.githubusercontent.com/KRDS-uiux/krds-uiux/main/resources/scss/common/_variables_for_code.scss
- 브레이크포인트 mixin: https://raw.githubusercontent.com/KRDS-uiux/krds-uiux/main/resources/scss/common/mixins/_breakpoints.scss
- 컴파일된 토큰 CSS: https://raw.githubusercontent.com/KRDS-uiux/krds-uiux/main/resources/css/token/krds_tokens.css
- 컴포넌트 SCSS 디렉토리: https://github.com/KRDS-uiux/krds-uiux/tree/main/resources/scss/component
- 컴포넌트 HTML 예제: https://github.com/KRDS-uiux/krds-uiux/tree/main/html/code

### 전자정부 UI/UX 가이드 (KRDS와 동일 콘텐츠)
- 메인: https://uiux.egovframe.go.kr/
- 가이드: https://uiux.egovframe.go.kr/guide/index.html

### KRDS Figma 라이브러리
- KRDS_v1.0.0 Community: https://www.figma.com/community/file/1452915208095182951/krds-v1-0-0

### 외부 분석 자료 (보조)
- 디자인 나침반 — KRDS 분석: https://designcompass.org/2024/04/17/krds/
- 플립커뮤니케이션즈 — KRDS 가이드 변경점: https://blog.pulip.com/디지털-정부-서비스를-위한-체계적-디자인-시스템-krds/
- 나무위키 — 범정부 UI/UX 디자인 시스템: https://namu.wiki/w/범정부%20UI/UX%20디자인%20시스템

---

## 16. 수집 방법론 메모 (재현 가능성)

이 문서의 수치는 다음 절차로 추출됨:

1. **WebFetch로 KRDS 공식 페이지 접근**
   - 정적 콘텐츠(원칙, 컴포넌트 목록, 타이포 표) 추출 성공
   - 동적 토큰 표는 SPA 렌더링으로 fetch만으로 미확보 → GitHub 우회

2. **GitHub `KRDS-uiux/krds-uiux` 저장소 발견 후 직접 다운로드**
   - `tokens/transformed_tokens.json` (88KB, 3389 라인) — 모든 hex/rem 값 원본
   - `resources/scss/common/_variables_for_code.scss` — 베이스 변수
   - `resources/scss/common/mixins/_breakpoints.scss` — 브레이크포인트
   - `resources/css/token/krds_tokens.css` — 컴파일된 CSS 변수
   - `resources/css/component/component.css` (11810 라인) — z-index/그림자 추출

3. **jq로 JSON 토큰 추출**, grep으로 z-index/box-shadow 추출.

4. **재현 가능**: 위 URL들을 다시 fetch하면 동일한 값 확보 가능.
