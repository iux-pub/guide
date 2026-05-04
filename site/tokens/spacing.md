---
title: 간격 토큰
order: 4
---

간격 토큰은 KRDS 정량 스케일을 따른다. KRDS는 padding/gap/size-height을 별개의 정수 스케일로 정의한다. 62.5% REM 트릭이 적용된다 (1rem = 10px).

토큰 출처:
- KRDS 정본: `tokens/krds-base.json` (`--krds-padding-*`, `--krds-gap-*`, `--krds-size-height-*`)
- INFOMIND 시맨틱 별칭: `tokens/infomind-overrides.json` (`--spacing-N`)
- 빌드: `tokens/build/tokens.css`

전체 카탈로그 — [skill/references/krds-tokens.md](https://github.com/iux-pub/guide/blob/main/skill/references/krds-tokens.md)

## KRDS Padding 스케일 (`--krds-padding-1` ~ `--krds-padding-8`)

컨테이너·컴포넌트 내부 패딩.

| 토큰 | 권장 용도 |
|------|----------|
| `--krds-padding-1` ~ `--krds-padding-3` | 작은 컴포넌트 (배지, 칩, 작은 버튼) |
| `--krds-padding-4` | 버튼 xsmall(32px) padding-x |
| `--krds-padding-5` | 버튼 small(40px) padding-x · form 필드 padding |
| `--krds-padding-6` | **버튼 medium(48px) padding-x · 카드 본문 패딩** |
| `--krds-padding-7` | 버튼 large(56px) padding-x · 컨테이너 내부 |
| `--krds-padding-8` | 버튼 xlarge(64px) padding-x · 큰 컨테이너 |

## KRDS Gap 스케일 (`--krds-gap-1` ~ `--krds-gap-6`)

flex/grid의 `gap` 또는 인접 요소 간 마진.

| 토큰 | 권장 용도 |
|------|----------|
| `--krds-gap-1` | 아이콘과 텍스트 사이 (2px) |
| `--krds-gap-2` | 인접 작은 요소 간 (4px) |
| `--krds-gap-3` | form 라벨과 입력 사이 (8px) |
| `--krds-gap-4` | 카드 그리드 간격 (12px) |
| `--krds-gap-5` | 섹션 내부 (16px) |
| `--krds-gap-6` | 큰 그룹 사이 (24px) |

## KRDS Size Height 스케일 (`--krds-size-height-1` ~ `--krds-size-height-9`)

컴포넌트 높이 정량 스케일.

| 토큰 | 값 | 용도 |
|------|-----|------|
| `--krds-size-height-5` | 32px | 버튼 xsmall (모바일 부적합) |
| `--krds-size-height-6` | 40px | 버튼 small (모바일 부적합) |
| `--krds-size-height-7` | **48px** | **버튼 medium = 모바일 권장 최소** |
| `--krds-size-height-8` | 56px | 버튼 large |
| `--krds-size-height-9` | 64px | 버튼 xlarge / 히어로 CTA |

> 모바일 컨텍스트는 medium(48) 이상 사용 — WCAG 권장 터치 영역 44×44px 보장 (R-13).

## INFOMIND 시맨틱 별칭

| 토큰 | KRDS 매핑 (예시) | 용도 |
|------|--------------|------|
| `--spacing-1` ~ `--spacing-12` | KRDS 정수 단위 (4px 단위) | 의미 기반 간격 |
| `--gap-1` ~ `--gap-6` | `--krds-gap-*` | gap alias |
| `--padding-card` | `--krds-padding-6` | 카드 내부 패딩 |
| `--padding-section` | `--krds-padding-8` | 섹션 패딩 |

## 사용 원칙

- **KRDS 스케일만 사용** — 토큰에 정의된 정수 인덱스만. 임의의 px 값(5/7/14/22 등) 금지
- **일관된 리듬** — 같은 계층의 요소에는 같은 토큰 사용
- **반응형 조정** — 모바일에서 작은 인덱스, PC에서 큰 인덱스

## 사용 예시

```css
/* KRDS 정본 */
.card {
  padding: var(--krds-padding-3);  /* 모바일 기본 */
  gap: var(--krds-gap-4);
}

@media (min-width: 768px) {
  .card {
    padding: var(--krds-padding-5);  /* 태블릿 */
  }
}

@media (min-width: 1280px) {
  .card {
    padding: var(--krds-padding-7);  /* PC */
  }
}

/* INFOMIND 시맨틱 별칭 */
.card {
  padding: var(--spacing-4);
  gap: var(--spacing-3);
}

.section {
  margin-bottom: var(--spacing-8);
}

@media (min-width: 1280px) {
  .section {
    margin-bottom: var(--spacing-12);
  }
}
```

## 절대 금지

- Raw px (`padding: 16px`) — KRDS 토큰만
- 옛 시맨틱 토큰 (`--spacing-xs`, `--spacing-sm`, `--spacing-md`, `--spacing-lg`, `--spacing-xl`, `--spacing-2xl`, `--spacing-3xl`) — KRDS 마이그레이션에서 폐기
- Tailwind 비활성 스케일 (`p-4`, `gap-2` 등 raw 인덱스)
