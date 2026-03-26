---
title: Variable 네이밍
order: 4
---

피그마 Variable의 네이밍 규칙과 CSS Custom Property와의 매핑을 정의한다. Variable을 일관되게 관리하면 디자인 토큰과 코드 토큰이 1:1로 연결되어 디자인-퍼블리싱 간 오차가 줄어든다.

## Variable 네이밍 규칙

### 기본 구조

슬래시(`/`)를 구분자로 사용하여 계층을 표현한다.

```
카테고리 / 그룹 / 이름
```

### 대소문자 규칙

| 대상 | 규칙 | 예시 |
|------|------|------|
| 카테고리 | PascalCase | `Color`, `Spacing`, `Typography` |
| 그룹 | PascalCase | `Primary`, `Gray`, `Font` |
| 이름 | camelCase 또는 숫자 | `900`, `base`, `light`, `dark` |

## 색상 Variable 매핑

### Primary 색상

| 피그마 Variable | CSS Custom Property | 값 | 용도 |
|----------------|---------------------|----|----|
| `Color / Primary` | `--color-primary` | #256ef4 | 기본 브랜드 색상 |
| `Color / Primary / Light` | `--color-primary-light` | #6a9df7 | 밝은 브랜드 색상 |
| `Color / Primary / Dark` | `--color-primary-dark` | #083891 | 어두운 브랜드 색상 |

### Gray 스케일

| 피그마 Variable | CSS Custom Property | 값 | 용도 |
|----------------|---------------------|----|----|
| `Color / Gray / 900` | `--color-gray-900` | #222 | 가장 어두운 회색 |
| `Color / Gray / 800` | `--color-gray-800` | #333 | |
| `Color / Gray / 700` | `--color-gray-700` | #555 | |
| `Color / Gray / 600` | `--color-gray-600` | #666 | |
| `Color / Gray / 500` | `--color-gray-500` | #999 | |
| `Color / Gray / 400` | `--color-gray-400` | #b1b8be | |
| `Color / Gray / 300` | `--color-gray-300` | #ccc | |
| `Color / Gray / 200` | `--color-gray-200` | #ddd | |
| `Color / Gray / 100` | `--color-gray-100` | #efefef | |
| `Color / Gray / 50` | `--color-gray-50` | #f8f8f8 | 가장 밝은 회색 |

### Semantic 색상

| 피그마 Variable | CSS Custom Property | 값 | 용도 |
|----------------|---------------------|----|----|
| `Color / Danger` | `--color-danger` | #de3412 | 에러, 삭제 |
| `Color / Warning` | `--color-warning` | #c78500 | 경고 |
| `Color / Success` | `--color-success` | #228738 | 성공, 완료 |
| `Color / Info` | `--color-info` | #0b78cb | 정보 |

### 기능별 색상

| 피그마 Variable | CSS Custom Property | 값 | 용도 |
|----------------|---------------------|----|----|
| `Color / Text` | `--color-text` | #1e2124 | 본문 텍스트 |
| `Color / Text / Secondary` | `--color-text-secondary` | #666 | 보조 텍스트 |
| `Color / Text / Disabled` | `--color-text-disabled` | #999 | 비활성 텍스트 |
| `Color / Bg` | `--color-bg` | #fff | 기본 배경 |
| `Color / Bg / Secondary` | `--color-bg-secondary` | #f8f8f8 | 보조 배경 |
| `Color / Border` | `--color-border` | #ccc | 기본 테두리 |
| `Color / Border / Light` | `--color-border-light` | #efefef | 밝은 테두리 |
| `Color / White` | `--color-white` | #fff | 흰색 |
| `Color / Black` | `--color-black` | #000 | 검정 |

## 타이포그래피 Variable 매핑

### 폰트 크기

| 피그마 Variable | CSS Custom Property | 값 | px 환산 |
|----------------|---------------------|----|----|
| `Typography / Font Size / 2xl` | `--font-size-2xl` | 3.2rem | 32px |
| `Typography / Font Size / xl` | `--font-size-xl` | 2.8rem | 28px |
| `Typography / Font Size / lg` | `--font-size-lg` | 2.4rem | 24px |
| `Typography / Font Size / md` | `--font-size-md` | 2rem | 20px |
| `Typography / Font Size / base` | `--font-size-base` | 1.6rem | 16px |
| `Typography / Font Size / sm` | `--font-size-sm` | 1.4rem | 14px |
| `Typography / Font Size / xs` | `--font-size-xs` | 1.2rem | 12px |

**피그마에서의 값:** 피그마에서는 px 단위로 입력한다 (32, 28, 24, 20, 16, 14, 12). 퍼블리싱에서 62.5% REM 트릭에 의해 rem으로 변환된다.

### 폰트 굵기

| 피그마 Variable | CSS Custom Property | 값 |
|----------------|---------------------|-------|
| `Typography / Font Weight / regular` | `--font-weight-regular` | 400 |
| `Typography / Font Weight / medium` | `--font-weight-medium` | 500 |
| `Typography / Font Weight / semibold` | `--font-weight-semibold` | 600 |
| `Typography / Font Weight / bold` | `--font-weight-bold` | 700 |

### 줄 간격

| 피그마 Variable | CSS Custom Property | 값 |
|----------------|---------------------|-------|
| `Typography / Leading / tight` | `--leading-tight` | 1.2 (120%) |
| `Typography / Leading / base` | `--leading-base` | 1.6 (160%) |
| `Typography / Leading / loose` | `--leading-loose` | 1.8 (180%) |

**피그마에서의 값:** Line Height를 퍼센트(%)로 설정한다 (120%, 160%, 180%).

## 간격 Variable 매핑

| 피그마 Variable | CSS Custom Property | 값 | px 환산 |
|----------------|---------------------|----|----|
| `Spacing / xs` | `--spacing-xs` | 0.4rem | 4px |
| `Spacing / sm` | `--spacing-sm` | 0.8rem | 8px |
| `Spacing / md` | `--spacing-md` | 1.6rem | 16px |
| `Spacing / lg` | `--spacing-lg` | 2.4rem | 24px |
| `Spacing / xl` | `--spacing-xl` | 3.2rem | 32px |
| `Spacing / 2xl` | `--spacing-2xl` | 4.8rem | 48px |
| `Spacing / 3xl` | `--spacing-3xl` | 6.4rem | 64px |

**피그마에서의 값:** 피그마에서는 px 단위로 입력한다 (4, 8, 16, 24, 32, 48, 64).

## 기타 Variable 매핑

### Border Radius

| 피그마 Variable | CSS Custom Property | 값 |
|----------------|---------------------|-------|
| `Radius / sm` | `--radius-sm` | 4px |
| `Radius / base` | `--radius-base` | 8px |
| `Radius / lg` | `--radius-lg` | 12px |
| `Radius / xl` | `--radius-xl` | 16px |
| `Radius / full` | `--radius-full` | 9999px |

### Box Shadow

| 피그마 Variable | CSS Custom Property | 피그마 설정 |
|----------------|---------------------|------------|
| `Shadow / sm` | `--shadow-sm` | Y: 1, Blur: 2, Opacity: 5% |
| `Shadow / base` | `--shadow-base` | Y: 1, Blur: 3, Opacity: 10% |
| `Shadow / lg` | `--shadow-lg` | Y: 10, Blur: 15, Opacity: 10% |

## Variable Collection 구성

피그마 Variable Collection을 다음과 같이 구성한다.

| Collection 이름 | 포함 Variable | Mode |
|----------------|--------------|------|
| `Color` | 색상 전체 (Primary, Gray, Semantic, 기능별) | Default (Light) |
| `Typography` | 폰트 크기, 굵기, 줄 간격 | Default |
| `Spacing` | 간격 스케일 | Default |
| `Misc` | Radius, Shadow | Default |

**Collection 네이밍 규칙:**

- 영문 PascalCase를 사용한다
- 역할 기반으로 구분한다 (시각적 속성이 아닌 기능적 분류)

## 변환 규칙 요약

| 피그마 표기 | CSS 변환 규칙 |
|------------|-------------|
| `Color / Primary` | `--color-primary` (슬래시 → 하이픈, 소문자) |
| `Color / Gray / 900` | `--color-gray-900` |
| `Spacing / md` | `--spacing-md` |
| `Typography / Font Size / base` | `--font-size-base` (카테고리 생략 가능) |
| `Radius / base` | `--radius-base` |

**변환 패턴:**

1. 슬래시(`/`)를 하이픈(`-`)으로 변환한다
2. PascalCase를 소문자(kebab-case)로 변환한다
3. `--` 접두사를 붙인다
4. 중간 카테고리가 불필요하면 생략한다 (`Typography / Font Size / base` → `--font-size-base`)

## 관련 문서

- [색상 토큰](/tokens/color/) -- CSS Custom Properties 색상 정의
- [타이포그래피 토큰](/tokens/typography/) -- 폰트 크기, 굵기, 줄 간격 정의
- [간격 토큰](/tokens/spacing/) -- 간격 스케일 정의
- [그리드 토큰](/tokens/grid/) -- 그리드 시스템과 컨테이너 규격
- [Auto Layout 규칙](/figma/auto-layout/) -- 피그마 Auto Layout과 토큰 매핑
