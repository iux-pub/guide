---
title: 디자인 토큰
order: 1
---

디자인 토큰은 색상·타이포그래피·간격·그리드 등 프로젝트 전반에서 사용되는 스타일 값을 CSS Custom Properties로 정의한 것이다. 하드코딩 대신 토큰을 사용하여 일관성을 유지하고 KRDS 정본과 INFOMIND 결정을 분리 관리한다.

## 토큰 시스템 개요

```
KRDS 정본 토큰 (--krds-*)        INFOMIND 시맨틱 별칭 (--color-*, --spacing-*, ...)
       │                                     │
       └─────────── 같은 값을 가리킴 ────────┘
```

- **KRDS 정본** — 5/10/20/30/40/50/60/70/80/90/95 등 정량 스케일 (`--krds-light-color-primary-50` 등)
- **INFOMIND 시맨틱 별칭** — 의미 기반 alias (`--color-text`, `--color-primary` 등)

컴포넌트 작성 시 가독성을 위해 시맨틱 별칭을 우선 권장한다.

## 토큰 사용 원칙

- **하드코딩 금지** (R-01) — 색상/크기/간격 직접 입력 금지
- **CSS Custom Properties 사용** — `var(--token-name)` 형태
- **프로젝트별 오버라이드** — `tokens/infomind-overrides.json`에서 `infomind-*` 네임스페이스 또는 KRDS 같은 경로 덮어쓰기
- **빌드** — `npm run build:tokens` 실행 시 `tokens/build/tokens.css` 자동 갱신

## 토큰 카테고리

| 카테고리 | 페이지 | KRDS prefix | 시맨틱 별칭 prefix |
|----------|------|-----------|------------------|
| [색상](/tokens/color/) | 색상 토큰 | `--krds-light-color-*` (다크: `--krds-dark-color-*`) | `--color-*` |
| [타이포그래피](/tokens/typography/) | 타이포 토큰 | `--krds-font-size-*` | `--text-*` (`text-body-medium` 등) |
| [간격](/tokens/spacing/) | 간격 토큰 | `--krds-padding-*`, `--krds-gap-*`, `--krds-size-height-*` | `--spacing-N` (정수 N=4px 단위) |
| [그리드](/tokens/grid/) | 그리드 토큰 | — | KRDS 표준 브레이크포인트 |
| 반경·그림자·z-index | (별도 페이지 없음) | `--krds-radius-*` | `--z-{dropdown,sticky,modal,...}` |

전체 카탈로그(상세 + 시맨틱 매핑) — [skill/references/krds-tokens.md](https://github.com/iux-pub/guide/blob/main/skill/references/krds-tokens.md)

## 하드코딩 vs 토큰 비교

```css
/* 잘못된 예 (하드코딩 금지) */
.card {
  color: #222;
  padding: 16px;
  font-size: 14px;
  border-radius: 8px;
}

/* 올바른 예 — KRDS 정본 */
.card {
  color: var(--krds-light-color-gray-90);
  padding: var(--krds-padding-6);
  font-size: var(--krds-font-size-7);
  border-radius: var(--krds-radius-medium2);
}

/* 올바른 예 — INFOMIND 시맨틱 별칭 */
.card {
  color: var(--color-text);
  padding: var(--spacing-4);
  font-size: var(--text-body-medium);
  border-radius: var(--radius-medium2);
}
```

## 토큰 파일 위치

| 파일 | 역할 | 갱신 정책 |
|------|------|----------|
| `tokens/krds-base.json` | KRDS 정본 (KRDS-uiux v1.0.0) | **수정 금지** — 외부 갱신만 동기화 |
| `tokens/infomind-overrides.json` | UX팀 결정 | KRDS 공백 채움 + `infomind-*` 네임스페이스 추가 |
| `tokens/build/tokens.css` | 빌드 산출물 | `npm run build:tokens` 자동 생성 — 직접 수정 금지 |
| `tokens/build/merged.json` | 머지 결과 (디버그용) | 자동 생성 |

ITCSS 구조에서 `tokens/`는 별도 디렉토리로 분리되어 있다 (옛 `1-settings` 레이어가 폐기되고 토큰이 외부화됨).
