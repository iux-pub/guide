# 디자인 토큰 레퍼런스 — KRDS+INFOMIND

이 문서는 프로젝트에서 사용하는 디자인 토큰의 카테고리와 사용 패턴을 안내한다.

**전체 토큰 권위 있는 소스:**
- KRDS 정본: `tokens/krds-base.json` (KRDS-uiux v1.0.0 — 수정 금지)
- INFOMIND 오버라이드: `tokens/infomind-overrides.json` (UX팀 결정)
- 빌드 산출물: `tokens/build/tokens.css` (자동 생성, 1124+ 줄, Tailwind v4 `@theme` + CSS Custom Properties)
- 카탈로그: `skill/references/krds-tokens.md`

`npm run build:tokens`로 산출물을 재생성한다.

## 토큰 시스템 개요

```
KRDS 정본 토큰 (--krds-*)        INFOMIND 시맨틱 별칭 (--color-*, --spacing-*, ...)
       │                                     │
       └─────────── 같은 값을 가리킴 ────────┘
```

KRDS 정본은 5/10/20/30/40/50/60/70/80/90/95 스텝 등 정량적 척도. INFOMIND 별칭은 의미 기반 alias로 컴포넌트 작성 시 가독성 향상.

## 색상 토큰

### KRDS 정본

- `--krds-light-color-primary-{5..95}` — Primary 11스텝 (50이 기본 강조)
- `--krds-light-color-secondary-{5..95}` — Secondary 11스텝
- `--krds-light-color-gray-{0..100}` — Gray 스케일
- `--krds-light-color-success-{5..95}`, `--krds-light-color-warning-*`, `--krds-light-color-danger-*`, `--krds-light-color-info-*` — Semantic
- `--krds-light-color-button-{primary,secondary,tertiary,text}-{fill,fill-hover,fill-pressed,border,border-hover}` — 버튼 컴포넌트 토큰
- 다크 모드: `--krds-dark-color-*` (자동 적용 — 데이터 속성 또는 `prefers-color-scheme`)

### INFOMIND 시맨틱 별칭

| 토큰 | 의미 |
|------|------|
| `--color-primary` | 브랜드 강조 (KRDS primary-50를 가리킴) |
| `--color-text` | 본문 텍스트 |
| `--color-text-secondary` | 보조 텍스트 |
| `--color-text-disabled` | 비활성 텍스트 |
| `--color-text-inverse` | 어두운 배경 위 텍스트 |
| `--color-bg` | 기본 배경 |
| `--color-bg-secondary` | 보조 배경 |
| `--color-border` | 기본 테두리 |
| `--color-border-light` | 옅은 테두리 |
| `--color-danger` / `--color-warning` / `--color-success` / `--color-info` | 시맨틱 |

## 타이포그래피 토큰

- `--krds-font-size-{1..15}` — KRDS 정량 스케일
- `--text-body-{xsmall,small,medium,large,xlarge}` — 시맨틱 본문 사이즈
- `--text-display-{small,medium,large}` — 디스플레이 (히어로) 사이즈
- `--text-heading-{small,medium,large,xlarge}` — 제목
- `--font-sans` — `'Pretendard GOV', 'SUIT-V', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif`
- 62.5% REM 트릭 적용 — `1rem = 10px` (KRDS 명시 채택)

## 간격·크기 토큰

### Padding (KRDS 스케일)

`--krds-padding-{1..8}` — 컨테이너/컴포넌트 내부 패딩 정량 스케일.

| 토큰 | 권장 용도 |
|------|----------|
| `--krds-padding-1` ~ `--krds-padding-3` | 작은 컴포넌트 (버튼 small, 배지) |
| `--krds-padding-4` ~ `--krds-padding-6` | 폼 필드, 카드 본문, medium 버튼 |
| `--krds-padding-7` ~ `--krds-padding-8` | 대형 컴포넌트, large/xlarge 버튼 |

### Gap·Margin

`--krds-gap-{1..6}` — flex/grid gap 스케일
`--spacing-N` — INFOMIND 시맨틱 별칭 (정수 N=4px 단위)

### Size·Height

`--krds-size-height-{1..9}` — 컴포넌트 높이 스케일 (5=32px, 6=40px, 7=48px=KRDS medium, 8=56px, 9=64px)

### Border Radius

| 토큰 | 값 |
|------|-----|
| `--krds-radius-small1` ~ `--krds-radius-small3` | 2~4px (배지, 작은 칩) |
| `--krds-radius-medium1` ~ `--krds-radius-medium4` | 6~10px (버튼, 카드) |
| `--krds-radius-large1` ~ `--krds-radius-large3` | 12~16px (모달, 대형 카드) |
| `--krds-radius-full` | 9999px (라운드 칩) |

## 그리드·반응형

| 해상도 | 컬럼 | 거터 | 좌우 여백 | 컨테이너 |
|--------|------|------|----------|---------|
| 모바일 (0~767) | 4 | 16px | 16px | 100% |
| 태블릿 (768~1279) | 12 | 24px | 24px | 100% |
| PC (1280+) | 12 | 24px | 40px | max-width 1200px |

KRDS 표준 브레이크포인트.

## 모션·전환

- `--duration-fast` (0.15s), `--duration-base` (0.25s), `--duration-slow` (0.4s)
- `--easing-standard` (`cubic-bezier(0.16, 1, 0.3, 1)` 계열)
- `prefers-reduced-motion` 대응 — 모션 감소 설정 시 transition/animation 자동 비활성

## z-index

| 토큰 | 값 |
|------|-----|
| `--z-dropdown` | 100 |
| `--z-sticky` | 200 |
| `--z-fixed` | 300 |
| `--z-modal-backdrop` | 400 |
| `--z-modal` | 500 |
| `--z-toast` | 600 |

## 절대 금지

- Raw hex/rgb/hsl 색상 (`#256ef4`, `rgb(37, 110, 244)` 등)
- Raw px/rem (KRDS 스케일 외 — `padding: 20px` 같은 임의 값 금지)
- Tailwind raw 컬러 유틸 (`bg-red-500`, `text-gray-700` 등)
- Tailwind 비활성 스케일 (`text-base`, `rounded-lg`, `shadow-md`, `z-10`, `sm:` 등)
- 옛 시맨틱 토큰 (`--color-primary-light`, `--font-size-2xl`, `--spacing-xs` 등 — KRDS 마이그레이션에서 제거됨)
