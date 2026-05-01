# Tailwind v4 ↔ KRDS 토큰 매핑

이 시스템은 Tailwind v4 `@theme` 블록을 통해 KRDS 토큰을 Tailwind 유틸리티로 노출한다.
Tailwind 기본 토큰(oklch 색상, 0.25rem spacing 등)은 **`--*: initial`로 전면 무효화**되었다.

**아래 매핑에 없는 Tailwind 유틸리티는 작동하지 않는다.**

---

## 색상 (`bg-*` / `text-*` / `border-*`)

### 시맨틱 (권장 — 다크/고대비 자동 분기)

| 유틸 | 토큰 | 용도 |
|------|------|------|
| `bg-primary` | `--krds-light-color-primary-50` | 메인 액션 |
| `bg-primary-hover` | `--krds-light-color-primary-60` | hover 상태 |
| `bg-primary-pressed` | `--krds-light-color-primary-70` | active 상태 |
| `bg-secondary` | `--krds-light-color-secondary-50` | 보조 색상 |
| `text-text` | `--krds-light-color-text-basic` | 본문 텍스트 |
| `text-text-bolder` | `--krds-light-color-text-bolder` | 진한 텍스트 |
| `text-text-subtle` | `--krds-light-color-text-subtle` | 보조 텍스트 |
| `text-text-disabled` | `--krds-light-color-text-disabled` | 비활성 텍스트 |
| `text-text-inverse` | `--krds-light-color-text-basic-inverse` | 다크 배경 위 텍스트 |
| `bg-bg` | `--krds-light-color-background-white` | 카드/모달 배경 |
| `bg-bg-subtler` | `--krds-light-color-background-gray-subtler` | 보조 배경 |
| `bg-bg-subtle` | `--krds-light-color-background-gray-subtle` | 더 진한 보조 배경 |
| `bg-bg-inverse` | `--krds-light-color-background-inverse` | 다크 배경 |
| `bg-bg-dim` | `--krds-light-color-background-dim` | 모달 dim |
| `bg-surface` | `--krds-light-color-surface-white` | 카드 표면 |
| `bg-surface-subtler` | `--krds-light-color-surface-gray-subtler` | 보조 표면 |
| `bg-surface-disabled` | `--krds-light-color-surface-disabled` | 비활성 표면 |
| `border-border` | `--krds-light-color-border-gray` | 기본 보더 |
| `border-border-light` | `--krds-light-color-border-gray-light` | 약한 보더 |
| `border-border-dark` | `--krds-light-color-border-gray-dark` | 진한 보더 |
| `border-border-primary` | `--krds-light-color-border-primary` | 활성 보더 (focus) |
| `border-border-disabled` | `--krds-light-color-border-disabled` | 비활성 보더 |
| `text-danger` / `bg-danger` | KRDS danger | 오류 |
| `text-danger-text` | `--krds-light-color-text-danger` | 오류 텍스트 (대비 보장) |
| `bg-danger-surface` | `--krds-light-color-surface-danger-subtler` | 오류 배경 (alert) |
| `text-warning` / `bg-warning` | KRDS warning | 경고 |
| `bg-warning-surface` | (warning subtler) | 경고 배경 |
| `text-success` / `bg-success` | KRDS success | 성공 |
| `bg-success-surface` | (success subtler) | 성공 배경 |
| `text-info` / `bg-info` | KRDS information | 정보 |
| `bg-info-surface` | (information subtler) | 정보 배경 |
| `text-point` / `bg-point` | KRDS point | 강조 (빨강) |

### Primitive 단계별 (escape hatch — 시맨틱이 안 맞을 때만)

KRDS 11단계: `5/10/20/30/40/50/60/70/80/90/95` (gray는 `0/100` 추가, graphic은 `10/30/50/70/90`만)

| 유틸 | 토큰 |
|------|------|
| `bg-primary-{5..95}` | `--krds-light-color-primary-{5..95}` |
| `bg-secondary-{5..95}` | `--krds-light-color-secondary-{5..95}` |
| `bg-gray-{0,5,10,..,95,100}` | `--krds-light-color-gray-*` |
| `bg-danger-{5..95}` | `--krds-light-color-danger-*` |
| `bg-warning-{5..95}` | `--krds-light-color-warning-*` |
| `bg-success-{5..95}` | `--krds-light-color-success-*` |
| `bg-information-{5..95}` | `--krds-light-color-information-*` |
| `bg-point-{5..95}` | `--krds-light-color-point-*` |
| `bg-graphic-{10,30,50,70,90}` | `--krds-light-color-graphic-*` |

> **시맨틱 별칭이 있으면 시맨틱을 쓴다.** primitive 단계는 디자이너가 시맨틱으로 표현 못 하는 특수 케이스에만.

---

## 간격 (`p-*` / `m-*` / `gap-*` / `w-*` / `h-*`)

KRDS number primitive (1rem = 10px):

| 유틸 | 값 | px |
|------|-----|-----|
| `p-0` `m-0` `gap-0` | 0 | 0 |
| `p-1` `m-1` | 0.1rem | 1 |
| `p-2` `m-2` | 0.2rem | 2 |
| `p-3` | 0.4rem | **4** |
| `p-4` | 0.6rem | 6 |
| `p-5` | 0.8rem | **8** |
| `p-6` | 1.0rem | 10 |
| `p-7` | 1.2rem | **12** |
| `p-8` | 1.6rem | **16** |
| `p-9` | 2.0rem | **20** |
| `p-10` | 2.4rem | **24** |
| `p-11` | 2.8rem | 28 |
| `p-12` | 3.2rem | **32** |
| `p-13` | 3.6rem | 36 |
| `p-14` | 4.0rem | **40** |
| `p-15` | 4.4rem | 44 (touch target) |
| `p-16` | 4.8rem | **48** |
| `p-17` | 5.6rem | 56 |
| `p-18` | 6.4rem | **64** |
| `p-19` | 7.2rem | 72 |
| `p-20` | 8.0rem | 80 |
| `p-21` | 9.6rem | 96 |
| `p-max` | 100rem | 1000 |

**Tailwind 임의 값(`p-[20px]`) 사용 금지.** 위 토큰만.

### Semantic spacing (gap-/padding-/size-height-)

| 유틸 | KRDS 의미 |
|------|----------|
| `gap-{1..12}` | 시맨틱 gap (요소 간 간격) |
| `p-padding-{1..10}` | 시맨틱 padding (입력박스 안 패딩 등) |
| `h-size-height-{1..11}` | 시맨틱 높이 (버튼/입력 등 컴포넌트) |

---

## 폰트 사이즈 (`text-*`)

### Display (페이지 메인 타이틀)
- `text-display-large` (60px) / `text-display-medium` (44px) / `text-display-small` (36px)

### Heading (섹션 제목)
- `text-heading-xlarge` (40px) — h1
- `text-heading-large` (32px) — h2
- `text-heading-medium` (24px) — h3
- `text-heading-small` (19px) — h4
- `text-heading-xsmall` (17px) — h5
- `text-heading-xxsmall` (15px) — h6

### Body (본문)
- `text-body-large` (19px), `text-body-large-bold`
- **`text-body-medium` (17px) — 기본 본문**, `text-body-medium-bold`
- `text-body-small` (15px), `text-body-small-bold`
- `text-body-xsmall` (13px), `text-body-xsmall-bold`

### Label (UI 레이블)
- `text-label-{large|medium|small|xsmall}` (19/17/15/13)

### Navigation (메뉴)
- `text-navigation-title-{medium|small}`
- `text-navigation-depth-{medium|medium-bold|small|small-bold}`

> 모바일에서는 같은 클래스가 **자동으로 모바일 사이즈로 덮어써짐** (예: `text-display-large` PC 60 → Mobile 44).

---

## 폰트 패밀리

- `font-sans` → `'Pretendard GOV', 'Malgun Gothic', sans-serif`
- 직접 `font-family: ...` 작성 금지

---

## 폰트 두께

KRDS는 **400(regular)와 700(bold)만 정의**. Tailwind 기본 medium/semibold도 무효화됨.

- `font-weight-regular` (400) — 또는 그냥 안 쓰면 기본
- `font-weight-bold` (700) — 또는 `font-bold` (Tailwind v4 기본 utility)

---

## 반경 (`rounded-*`)

KRDS Shape 가이드 그룹:

| 유틸 | 값 | 사용 |
|------|-----|------|
| `rounded-xsmall1` `xsmall2` `xsmall3` | 2px | 인디케이터, 배지, 프로그레스 |
| `rounded-small1` `small2` `small3` | 4px | 칩, 체크박스, 라디오, 스위치, 태그 |
| `rounded-medium1` `medium2` | 6px | 버튼 small/medium, 입력 |
| `rounded-medium3` `medium4` | 8px | 버튼 large/xlarge, 셀렉트 |
| `rounded-large1` `large2` | 10px | 카드, 다이얼로그 |
| `rounded-xlarge1` `xlarge2` | 12px | 배너, 다이얼로그 (큰 것), 바텀 시트 |
| `rounded-max` | 100rem | 완전 원형 (pill, 알림 점) |

**Tailwind 기본 `rounded` `rounded-md` `rounded-lg` 등 비활성.** 위 KRDS 토큰만.

---

## 그림자 (`shadow-*`)

INFOMIND 추상 elevation (KRDS 컴포넌트별 그림자 패턴):

- `shadow-1` — alert, banner, dropdown (subtle)
- `shadow-2` — popover, help-panel, side-panel, tooltip (medium)
- `shadow-3` — modal, dialog (deep)

**Tailwind 기본 `shadow-sm` `shadow-md` `shadow-xl` 비활성.**

---

## Z-index (`z-*`)

| 유틸 | 값 | 용도 |
|------|-----|------|
| `z-dropdown` | 1000 | 드롭다운 메뉴 |
| `z-sticky` | 1020 | sticky 헤더 |
| `z-fixed` | 1030 | fixed 요소 |
| `z-modal-backdrop` | 1040 | 모달 백드롭 |
| `z-modal` | 1050 | 모달 콘텐츠 |
| `z-popover` | 1060 | 팝오버 |
| `z-toast` | 1070 | 토스트 |
| `z-tooltip` | 1080 | 툴팁 |

**Tailwind 기본 `z-10` `z-50` 등 비활성.** 임의 z-index 값 사용 금지.

---

## 브레이크포인트 (반응형 prefix)

| Prefix | 기준 | 디바이스 |
|--------|------|----------|
| `small:` | 360px+ | 작은 모바일 |
| `medium:` | 768px+ | 태블릿 |
| `large:` | 1024px+ | 데스크탑 |
| `xlarge:` | 1280px+ | 큰 데스크탑 |
| `xxlarge:` | 1440px+ | 와이드 |

```html
<div class="p-8 large:p-16">모바일 16px / 데스크탑 48px</div>
```

**Tailwind 기본 `sm: md: lg: xl:` 비활성.** 위 5개만.

---

## 모션 (`transition-*` / `duration-*`)

- `duration-fast` (0.15s)
- `duration-base` (0.4s) — KRDS 표준
- `duration-slow` (0.6s)
- `easing-standard` (ease-in-out — KRDS 표준)
- `easing-decelerate` (cubic-bezier(0.0, 0.0, 0.2, 1))
- `easing-accelerate` (cubic-bezier(0.4, 0.0, 1, 1))
- `easing-linear`

직접 CSS:
```css
.btn {
  transition: background-color var(--duration-fast) var(--easing-standard);
}
```

---

## 사용 안 하는 Tailwind 유틸 (`--*: initial`로 무효화됨)

- 색상: `bg-red-*`, `bg-blue-*`, `text-gray-*`, `bg-white`(시맨틱은 `bg-bg`), `bg-black` 등 모든 raw 색
- spacing: 임의 값 `p-[20px]`, `m-[1.5rem]`
- 폰트: `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl` 등 Tailwind 기본 스케일
- 폰트 두께: `font-medium`, `font-semibold` (KRDS는 400/700만)
- 반경: `rounded-md`, `rounded-lg` (Tailwind 기본)
- 그림자: `shadow-sm`, `shadow-md`, `shadow-xl` (Tailwind 기본)
- z-index: `z-10`, `z-20`, `z-50` (Tailwind 기본)
- 브레이크포인트: `sm:`, `md:`, `lg:`, `xl:`, `2xl:` (Tailwind 기본)

위 사용 시 작동하지 않거나 의도와 다르게 렌더링됨. **반드시 KRDS/INFOMIND 토큰 유틸 사용.**
