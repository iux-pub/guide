---
title: 색상 토큰
order: 2
---

색상 토큰은 `src/scss/1-settings/_tokens-color.scss`에 정의되어 있다. KRDS(한국형 디자인 시스템) 기반 시맨틱 색상과 중립 팔레트로 구성된다.

## Primary

프로젝트별 `:root` 오버라이드로 변경 가능한 주 색상이다.

| 토큰 | 값 | 용도 |
|------|-----|------|
| `--color-primary` | `#256ef4` | 주 강조 색상 |
| `--color-primary-light` | `#6a9df7` | 밝은 강조 (장식용, 텍스트 배치 금지) |
| `--color-primary-dark` | `#083891` | 어두운 강조 (흰색 텍스트 안전) |

## Gray Scale

기존 프로젝트 값 기반의 중립 팔레트이다.

| 토큰 | 값 | 용도 |
|------|-----|------|
| `--color-gray-900` | `#222` | 가장 어두운 회색 |
| `--color-gray-800` | `#333` | 부제목 텍스트 |
| `--color-gray-700` | `#555` | 캡션, 소텍스트 |
| `--color-gray-600` | `#666` | 보조 텍스트 |
| `--color-gray-500` | `#999` | 비활성 텍스트 |
| `--color-gray-400` | `#b1b8be` | 장식용 보더 (텍스트 불가) |
| `--color-gray-300` | `#ccc` | 구분선 (텍스트 불가) |
| `--color-gray-200` | `#ddd` | 연한 보더 |
| `--color-gray-100` | `#efefef` | 연한 배경 |
| `--color-gray-50` | `#f8f8f8` | 가장 연한 배경 |

## Semantic

KRDS 기준 상태 표시 색상이다.

| 토큰 | 값 | 용도 |
|------|-----|------|
| `--color-danger` | `#de3412` | 오류, 삭제, 위험 |
| `--color-warning` | `#c78500` | 경고 (대형 텍스트만 사용) |
| `--color-success` | `#228738` | 성공, 완료 |
| `--color-info` | `#0b78cb` | 정보, 안내 |

## Text

텍스트 전용 색상 토큰이다.

| 토큰 | 값 | 용도 |
|------|-----|------|
| `--color-text` | `#1e2124` | 본문 텍스트 (대비 16.2:1) |
| `--color-text-secondary` | `#666` | 보조 텍스트 (대비 5.7:1) |
| `--color-text-disabled` | `#999` | 비활성 텍스트 (WCAG 예외) |

## Background

배경 색상 토큰이다.

| 토큰 | 값 | 용도 |
|------|-----|------|
| `--color-bg` | `#fff` | 기본 배경 |
| `--color-bg-secondary` | `#f8f8f8` | 보조 배경 |

## Border

테두리 색상 토큰이다.

| 토큰 | 값 | 용도 |
|------|-----|------|
| `--color-border` | `#ccc` | 기본 테두리 |
| `--color-border-light` | `#efefef` | 연한 테두리 |

## 기본

| 토큰 | 값 |
|------|-----|
| `--color-white` | `#fff` |
| `--color-black` | `#000` |

## 사용 예시

```scss
// 카드 컴포넌트에 색상 토큰 적용
.card {
  color: var(--color-text);
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);

  &__title {
    color: var(--color-gray-900);
  }

  &--featured {
    border-color: var(--color-primary);
  }
}
```

## 프로젝트별 오버라이드

`_project-overrides.scss`에서 Primary 색상을 변경할 수 있다.

```scss
// _project-overrides.scss
:root {
  --color-primary: #0066cc;
  --color-primary-light: #4d99e6;
  --color-primary-dark: #004c99;
}
```
