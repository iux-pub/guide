---
title: 타이포그래피 토큰
order: 3
---

타이포그래피 토큰은 KRDS 정량 스케일과 INFOMIND 시맨틱 별칭으로 발행한다. 폰트는 KRDS 표준 — Pretendard GOV 우선. 62.5% REM 트릭 적용으로 1rem = 10px이다.

토큰 출처:
- KRDS 정본: `tokens/krds-base.json` (`--krds-font-size-*`)
- INFOMIND 시맨틱 별칭: `tokens/infomind-overrides.json` (`--text-*`)
- 빌드: `tokens/build/tokens.css`

전체 카탈로그 — [skill/references/krds-tokens.md](https://github.com/iux-pub/guide/blob/main/skill/references/krds-tokens.md)

## 62.5% REM 트릭

`html { font-size: 62.5% }` 설정으로 **1rem = 10px**이 된다. KRDS가 명시 채택한 방식이며 `reset.css`에서 전역 적용한다.

| px | rem | 계산 |
|----|-----|------|
| 12px | 1.2rem | 12 / 10 |
| 14px | 1.4rem | 14 / 10 |
| 16px | 1.6rem | 16 / 10 |
| 20px | 2rem | 20 / 10 |
| 24px | 2.4rem | 24 / 10 |
| 32px | 3.2rem | 32 / 10 |

## Font Family

KRDS 표준 폰트 스택. 한글 가독성을 위해 시스템 폰트와 Pretendard GOV를 병기한다.

```css
--font-sans: 'Pretendard GOV', 'SUIT-V', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;
```

## KRDS Font Size 스케일 (`--krds-font-size-1` ~ `--krds-font-size-15`)

KRDS 정량 스케일. 인덱스가 클수록 큰 폰트.

| 토큰 | 값 | 권장 용도 |
|------|-----|----------|
| `--krds-font-size-3` | 13px | 캡션·라벨 |
| `--krds-font-size-5` | 15px | 보조 본문 |
| `--krds-font-size-7` | 17px | **본문 (medium)** |
| `--krds-font-size-9` | 19px | 큰 본문·소제목 |
| `--krds-font-size-11` | 24px | 제목 |
| `--krds-font-size-13` | 32px | 섹션 제목 |
| `--krds-font-size-15` | 48px | 디스플레이 (히어로) |

## INFOMIND 시맨틱 별칭

의미 기반 alias. 컴포넌트 작성 시 권장.

| 토큰 | KRDS 매핑 | 용도 |
|------|----------|------|
| `--text-body-xsmall` | `--krds-font-size-3` (13px) | 캡션·라벨 |
| `--text-body-small` | `--krds-font-size-5` (15px) | 보조 본문 |
| `--text-body-medium` | `--krds-font-size-7` (17px) | **기본 본문** |
| `--text-body-large` | `--krds-font-size-9` (19px) | 큰 본문 |
| `--text-heading-small` | `--krds-font-size-9` (19px) | 작은 제목 (h4~h6) |
| `--text-heading-medium` | `--krds-font-size-11` (24px) | 제목 (h3) |
| `--text-heading-large` | `--krds-font-size-13` (32px) | 큰 제목 (h2) |
| `--text-heading-xlarge` | `--krds-font-size-14` (40px) | 페이지 제목 (h1) |
| `--text-display-small` | `--krds-font-size-14` (40px) | 디스플레이 |
| `--text-display-medium` | `--krds-font-size-15` (48px) | 큰 디스플레이 |
| `--text-display-large` | `--krds-font-size-15`+ | 히어로 |

## Font Weight

KRDS 표준 weight. Pretendard GOV는 100~900 전체 weight 지원.

| 토큰 | 값 | 용도 |
|------|-----|------|
| `--font-weight-regular` | 400 | 본문 |
| `--font-weight-medium` | 500 | 강조 본문 |
| `--font-weight-semibold` | 600 | 소제목 |
| `--font-weight-bold` | 700 | 제목·강한 강조 |

## Line Height

| 토큰 | 값 | 용도 |
|------|-----|------|
| `--leading-tight` | 1.2 | 제목·짧은 텍스트 |
| `--leading-base` | 1.6 | **본문** (한글 가독성 표준) |
| `--leading-loose` | 1.8 | 긴 본문 |

## 사용 예시

```css
/* INFOMIND 시맨틱 별칭 (권장) */
.heading {
  font-family: var(--font-sans);
  font-size: var(--text-heading-large);
  font-weight: var(--font-weight-bold);
  line-height: var(--leading-tight);
}

.body-text {
  font-size: var(--text-body-medium);
  font-weight: var(--font-weight-regular);
  line-height: var(--leading-base);
}

.caption {
  font-size: var(--text-body-xsmall);
  color: var(--color-text-secondary);
  line-height: var(--leading-base);
}

/* KRDS 정본으로 작성 */
.hero-title {
  font-size: var(--krds-font-size-15);
  font-weight: 800;
  line-height: 1.0;
}
```

## 절대 금지

- 옛 시맨틱 토큰 (`--font-size-xs`, `--font-size-sm`, `--font-size-base`, `--font-size-md`, `--font-size-lg`, `--font-size-xl`, `--font-size-2xl`) — KRDS 마이그레이션에서 폐기
- Raw px (`font-size: 14px`) — KRDS 토큰만
- Tailwind 비활성 스케일 (`text-base`, `text-lg`, `text-xl` 등) — KRDS 시맨틱 사용
