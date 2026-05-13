---
title: 파운데이션 토큰
order: 1
---

INFOUX 토큰은 프로젝트 공통 기준 중 실제로 재사용 가치가 높은 항목만 남긴다.

## 단일 소스

| 파일 | 역할 |
|------|------|
| `tokens/foundation.json` | 색상 + 기본 폰트 단일 소스 |
| `tokens/build/tokens.css` | 자동 생성 CSS 변수 + Tailwind v4 `@theme` |

## 공개 토큰

| 범위 | 토큰 |
|------|------|
| 색상 | `--color-*` |
| 기본 폰트 | `--font-sans`, `--font-mono` |

간격, 크기, 타이포 스케일, 반경, 그림자, 모션, z-index는 토큰화하지 않는다.
프로젝트의 정보 밀도와 사용성에 맞게 Tailwind v4 `@apply` 또는 CSS 직접값으로 작성한다.

## 예시

```css
.card {
  @apply bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border-light)] p-[2.4rem] rounded-[0.6rem];
}

code {
  @apply [font-family:var(--font-mono)];
}
```

## 관련 문서

- [색상 토큰](/tokens/color/)
- [토큰 카탈로그](https://github.com/iux-pub/guide/blob/main/skill/references/krds-tokens.md)
