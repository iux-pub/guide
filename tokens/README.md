# Tokens — KRDS 베이스 + INFOMIND 오버라이드

이 폴더는 인포마인드 UX팀의 토큰 단일 소스다.
**토큰 변경은 반드시 이 폴더에서만** 한다. 출력물(`build/`)은 절대 수정 금지.

## 파일 구조

```
tokens/
├── krds-base.json          ← KRDS 정본 (KRDS-uiux/krds-uiux v1.0.0). 수정 금지.
├── infomind-overrides.json ← UX팀 결정. KRDS 공백 보완 + 인포마인드 추가.
├── README.md               ← 이 파일.
└── build/                  ← 자동 생성. 절대 직접 수정 금지.
    ├── merged.json         ← 병합 결과 (디버그/검증용)
    └── tokens.css          ← Tailwind v4 @theme + KRDS 변수 + 모드/반응형
```

## 빌드

```bash
node scripts/build-tokens.js
# 또는
npm run build:tokens
```

## 우선순위 규칙

`infomind-overrides.json`이 `krds-base.json`보다 우선한다.

1. **KRDS 같은 경로 덮어쓰기** — 같은 키 경로면 overrides 값 채택
2. **`infomind-*` 네임스페이스 추가** — KRDS에 없는 항목은 별도 네임스페이스로 추가
3. **`null`로 명시적 삭제** — overrides에서 `null` 값을 주면 해당 KRDS 토큰은 출력에서 제외

## KRDS 정본 갱신

KRDS가 새 버전을 내면 이 명령으로 정본만 갱신:

```bash
curl -sSL https://raw.githubusercontent.com/KRDS-uiux/krds-uiux/main/tokens/transformed_tokens.json \
  -o tokens/krds-base.json
node scripts/build-tokens.js
```

`infomind-overrides.json`은 건드리지 않는다.

## 1rem = 10px 트릭

KRDS는 `font-size-base: 62.5%` (1rem = 10px)를 명시 채택한다.
이 시스템도 그대로 따른다. **`reset.css`에서 `html { font-size: 62.5% }` 적용 필수.**

Tailwind v4의 기본 spacing 스케일(`0.25rem` 베이스)은 사용하지 않는다.
KRDS의 `primitive.number.0~21,max` 토큰을 `--spacing-0~21,max`로 노출한다.

## 출력 토큰 카테고리 (`build/tokens.css`)

### `:root` (Light 모드 — 기본)
- KRDS 변수 전체: `--krds-light-color-*`, `--krds-typo-*`, `--krds-number-*`, `--krds-pc-*`, `--krds-radius-*`, `--krds-gap-*`, `--krds-padding-*`, `--krds-size-height-*`
- INFOMIND 추가: `--krds-infomind-*` (grid, z-index, motion, touch-target, elevation, brand)

### `@media (max-width: 1023px)`
- 모바일 폰트 사이즈, 레이아웃 간격 — 같은 변수명을 PC 값으로부터 덮어씀

### `[data-color-mode="high-contrast"]`
- 고대비 모드 색상 — 시스템 환경설정 또는 토글 어트리뷰트로 활성화

### `@theme` (Tailwind v4 시맨틱 별칭)
- 시맨틱 컬러: `--color-primary`, `--color-text`, `--color-bg`, `--color-surface`, `--color-border`, `--color-danger/warning/success/info`
- 컬러 단계별 escape hatch: `--color-{group}-{5|10|...|95}`
- Spacing: `--spacing-0~21,max` (KRDS number primitive)
- Semantic spacing: `--gap-{1~12}`, `--padding-{1~10}`, `--size-height-{1~11}`
- Typography: `--font-sans`, `--text-{display|heading|body|label|navigation}-*`
- Breakpoints: `--breakpoint-{small|medium|large|xlarge|xxlarge}`
- Radius: `--radius-{xsmall|small|medium|large|xlarge}{1~4}`, `--radius-max`
- Shadow (INFOMIND): `--shadow-{1|2|3}`
- Z-index (INFOMIND): `--z-{dropdown|sticky|fixed|modal|...}`
- Motion (INFOMIND): `--duration-{fast|base|slow}`, `--easing-{standard|decelerate|accelerate|linear}`
- Touch target: `--touch-target-min: 4.4rem`

## INFOMIND 오버라이드 항목

`infomind-overrides.json`이 채우는 KRDS 공백:

| 카테고리 | 사유 |
|---------|------|
| `infomind-grid` | KRDS는 컬럼 수 강제 안 함. UX팀이 12-col 명시 |
| `infomind-z-index` | KRDS는 z-index 추상 토큰 없이 raw 값 사용. UX팀 표준화 |
| `infomind-motion` | KRDS는 0.4s 단일값. UX팀이 fast/base/slow 3단계 정의 |
| `infomind-touch-target` | KRDS는 명시적 터치 영역 수치 없음. WCAG 권장 44px 강제 |
| `infomind-elevation` | KRDS는 컴포넌트별 그림자만. UX팀이 추상 elevation 정의 |
| `infomind-brand` | 프로젝트별 브랜드 색상 슬롯 (기본 비어 있음, KRDS primary 사용) |
