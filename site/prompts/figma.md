---
title: 피그마 AI 프롬프트
order: 3
---

## 대상 AI 도구

Figma AI, Figma Make

## 사용법

아래 내용을 복사하여 AI 도구의 시스템 프롬프트(또는 첫 메시지)에 붙여넣는다.

## 프롬프트

````markdown
# 피그마 AI 프롬프트

> **목적:** 피그마 AI 도구에서 인포마인드 UX팀 피그마 컨벤션을 적용하기 위한 프롬프트
> **대상 AI:** Figma AI, Figma Make

---

## 컴포넌트 네이밍

### 계층 구조

슬래시(`/`)를 구분자로 사용하여 계층을 표현하라.

```
카테고리 / 컴포넌트명 / Variant
```

### 대소문자 규칙

| 대상 | 규칙 | 예시 |
|------|------|------|
| 카테고리 | PascalCase | `Button`, `Form`, `Card` |
| 컴포넌트명 | PascalCase | `Primary`, `Secondary`, `Input` |
| Variant | PascalCase | `Small`, `Large`, `Error` |
| Property 이름 | camelCase | `size`, `state`, `variant` |
| Property 값 | camelCase | `small`, `large`, `error` |

### 컴포넌트 예시

```
Button / Primary
Button / Primary / Small
Button / Secondary
Button / Outline
Card / Default
Card / Featured
Card / Horizontal
Form / Input
Form / Input / Error
Form / Select
Form / Checkbox
Form / Radio
Table / Default
Table / Striped
Modal / Default
Tab / Default
Pagination / Default
Breadcrumb / Default
```

### Property 네이밍

| Property 유형 | 네이밍 규칙 | 예시 |
|---------------|------------|------|
| Variant | camelCase, 의미적 이름 | `variant`, `size`, `state` |
| Boolean | `has` 또는 `show` 접두사 | `hasIcon`, `showLabel`, `hasClose` |
| Instance Swap | 대상 이름 | `leadingIcon`, `trailingIcon` |
| Text | 역할 이름 | `label`, `title`, `description` |

### 금지 패턴

| 잘못된 네이밍 | 올바른 네이밍 | 이유 |
|-------------|-------------|------|
| `btn-primary` | `Button / Primary` | 슬래시 계층 구조 사용 필수 |
| `button_primary` | `Button / Primary` | 언더스코어 금지 |
| `BUTTON/PRIMARY` | `Button / Primary` | 전체 대문자 금지, PascalCase 사용 |
| `Button/파란버튼` | `Button / Primary` | 시각적 속성 이름 금지, 의미적 이름 사용 |
| `btn` | `Button` | 축약 금지, 전체 이름 사용 |

### BEM 클래스 매핑

| 피그마 계층 | BEM 결과 |
|------------|----------|
| `Button` | `.btn` |
| `Button / Primary` | `.btn--primary` |
| `Button / Primary / Small` | `.btn--primary.btn--sm` |
| `Card` | `.card` |
| `Card / Featured` | `.card--featured` |
| `Form / Input` | `.form__input` |
| `Form / Input / Error` | `.form__input--error` |

### 공개 vs 내부 컴포넌트

| 구분 | 접두사 | 예시 |
|------|--------|------|
| 공개 | 없음 | `Button / Primary` |
| 내부 | `.` (마침표) | `.Icon / Arrow` |
| 내부 | `_` (언더스코어) | `_Slot / Content` |

---

## Variable Collection 구조

### Collection 구성

| Collection | 포함 Variable | Mode |
|------------|--------------|------|
| `Color` | Primary, Gray, Semantic, Text, Bg, Border, White/Black | Default (Light) |
| `Typography` | Font Size, Font Weight, Leading | Default |
| `Spacing` | xs ~ 3xl (7단계) | Default |
| `Misc` | Radius, Shadow | Default |

### 색상 Variable

**네이밍:** `Color / 그룹 / 이름` (PascalCase + 슬래시)

| 피그마 Variable | CSS Custom Property | 값 |
|----------------|---------------------|-----|
| `Color / Primary` | `--color-primary` | #256ef4 |
| `Color / Primary / Light` | `--color-primary-light` | #6a9df7 |
| `Color / Primary / Dark` | `--color-primary-dark` | #083891 |
| `Color / Gray / 900` | `--color-gray-900` | #222 |
| `Color / Gray / 800` | `--color-gray-800` | #333 |
| `Color / Gray / 700` | `--color-gray-700` | #555 |
| `Color / Gray / 600` | `--color-gray-600` | #666 |
| `Color / Gray / 500` | `--color-gray-500` | #999 |
| `Color / Gray / 400` | `--color-gray-400` | #b1b8be |
| `Color / Gray / 300` | `--color-gray-300` | #ccc |
| `Color / Gray / 200` | `--color-gray-200` | #ddd |
| `Color / Gray / 100` | `--color-gray-100` | #efefef |
| `Color / Gray / 50` | `--color-gray-50` | #f8f8f8 |
| `Color / Danger` | `--color-danger` | #de3412 |
| `Color / Warning` | `--color-warning` | #c78500 |
| `Color / Success` | `--color-success` | #228738 |
| `Color / Info` | `--color-info` | #0b78cb |
| `Color / Text` | `--color-text` | #1e2124 |
| `Color / Text / Secondary` | `--color-text-secondary` | #666 |
| `Color / Text / Disabled` | `--color-text-disabled` | #999 |
| `Color / Bg` | `--color-bg` | #fff |
| `Color / Bg / Secondary` | `--color-bg-secondary` | #f8f8f8 |
| `Color / Border` | `--color-border` | #ccc |
| `Color / Border / Light` | `--color-border-light` | #efefef |

### 타이포그래피 Variable

피그마에서는 px 단위로 입력한다. 퍼블리싱에서 62.5% REM 트릭으로 rem 변환된다.

| 피그마 Variable | CSS Custom Property | 피그마 값 (px) |
|----------------|---------------------|---------------|
| `Typography / Font Size / 2xl` | `--font-size-2xl` | 32px |
| `Typography / Font Size / xl` | `--font-size-xl` | 28px |
| `Typography / Font Size / lg` | `--font-size-lg` | 24px |
| `Typography / Font Size / md` | `--font-size-md` | 20px |
| `Typography / Font Size / base` | `--font-size-base` | 16px |
| `Typography / Font Size / sm` | `--font-size-sm` | 14px |
| `Typography / Font Size / xs` | `--font-size-xs` | 12px |
| `Typography / Font Weight / regular` | `--font-weight-regular` | 400 |
| `Typography / Font Weight / medium` | `--font-weight-medium` | 500 |
| `Typography / Font Weight / semibold` | `--font-weight-semibold` | 600 |
| `Typography / Font Weight / bold` | `--font-weight-bold` | 700 |
| `Typography / Leading / tight` | `--leading-tight` | 120% |
| `Typography / Leading / base` | `--leading-base` | 160% |
| `Typography / Leading / loose` | `--leading-loose` | 180% |

### 간격 Variable

| 피그마 Variable | CSS Custom Property | 피그마 값 (px) |
|----------------|---------------------|---------------|
| `Spacing / xs` | `--spacing-xs` | 4px |
| `Spacing / sm` | `--spacing-sm` | 8px |
| `Spacing / md` | `--spacing-md` | 16px |
| `Spacing / lg` | `--spacing-lg` | 24px |
| `Spacing / xl` | `--spacing-xl` | 32px |
| `Spacing / 2xl` | `--spacing-2xl` | 48px |
| `Spacing / 3xl` | `--spacing-3xl` | 64px |

### 기타 Variable

| 피그마 Variable | CSS Custom Property | 값 |
|----------------|---------------------|-----|
| `Radius / sm` | `--radius-sm` | 4px |
| `Radius / base` | `--radius-base` | 8px |
| `Radius / lg` | `--radius-lg` | 12px |
| `Radius / xl` | `--radius-xl` | 16px |
| `Radius / full` | `--radius-full` | 9999px |

### 변환 규칙

1. 슬래시(`/`)를 하이픈(`-`)으로 변환하라
2. PascalCase를 소문자(kebab-case)로 변환하라
3. `--` 접두사를 붙이라
4. 중간 카테고리가 불필요하면 생략하라 (`Typography / Font Size / base` -> `--font-size-base`)

---

## Auto Layout 규칙

### 허용 간격 값

패딩과 갭(Item spacing) 값은 반드시 토큰 스케일 값만 사용하라.

| 토큰 | 피그마 값 | 용도 |
|------|----------|------|
| `Spacing / xs` | 4px | 최소 간격, 아이콘-텍스트 사이 |
| `Spacing / sm` | 8px | 작은 간격, 인라인 요소 |
| `Spacing / md` | 16px | 기본 간격, 카드 내부 패딩 |
| `Spacing / lg` | 24px | 넓은 간격, 섹션 내부 패딩 |
| `Spacing / xl` | 32px | 섹션 간 간격 |
| `Spacing / 2xl` | 48px | 큰 섹션 간 간격 |
| `Spacing / 3xl` | 64px | 최대 간격, 페이지 상하 여백 |

**금지 값:** 5px, 10px, 15px, 20px, 30px 등 스케일에 없는 값을 사용하지 않는다.

**허용 예외:** 0px (밀착), 1px (구분선), 2px (미세 정렬)

### 컴포넌트별 Auto Layout

**버튼:**

| 크기 | H-padding | V-padding | Item spacing |
|------|-----------|-----------|--------------|
| Small | 8px | 4px | 4px |
| Medium | 16px | 8px | 4px |
| Large | 24px | 16px | 4px |

**카드:** Padding 16px, 내부 간격 16px, Vertical

**폼 그룹:** Label-Input 간격 8px, Input 패딩 16px/8px, 그룹 간 24px

### 반응형 간격

| 속성 | 모바일 | 태블릿 | PC |
|------|--------|--------|------|
| 컨테이너 패딩 | 16px | 24px | 40px |
| 그리드 거터 | 16px | 24px | 24px |
| 섹션 간격 | 32px | 48px | 64px |

---

## 레이어/프레임 구조

### 페이지 구성 순서

| 순서 | 이름 | 용도 | 필수 |
|------|------|------|------|
| 1 | Cover | 프로젝트 표지 | 필수 |
| 2 | Guide | 컬러/타이포 토큰 정리 | 필수 |
| 3 | Components | 마스터 컴포넌트 | 필수 |
| 4 | Icons | 아이콘 세트 | 선택 |
| 5~ | PC - 메인 | PC 시안 | 프로젝트별 |
| 6~ | Tablet - 메인 | 태블릿 시안 | 프로젝트별 |
| 7~ | Mobile - 메인 | 모바일 시안 | 프로젝트별 |
| 마지막 | Archive | 이전 시안 보관 | 선택 |

### 프레임 네이밍

- 최상위 프레임: `[해상도] 페이지명 - 상태` (예: `PC 메인`, `Mobile 서브 - 목록`)
- 프레임 이름은 역할 기반으로 작성하라: `Header`, `Content`, `Footer`, `Sidebar`, `Modal`
- 자동 생성 이름(`Frame 427`, `Group 12`)을 그대로 두지 않는다

### 프레임 크기

| 해상도 | 프레임 너비 | 콘텐츠 영역 |
|--------|-----------|------------|
| PC | 1920px | 1200px (max-width) |
| Tablet | 768px | 100% (padding 24px) |
| Mobile | 360px | 100% (padding 16px) |

### 레이어 규칙

1. **깊이 제한:** 레이어 중첩은 최대 5단계를 유지하라 (Frame > Section > Component > Element > Sub-element)
2. **자동 이름 금지:** `Frame 427`, `Group 12`, `Rectangle 5` 등을 의미 있는 이름으로 변경하라
3. **불필요한 그룹 제거:** 단일 요소만 포함하는 그룹을 만들지 않는다
4. **레이어 순서:** 시각적 순서와 레이어 순서를 일치시키라 (위에 보이는 것이 레이어에서도 위)
5. **숨김 레이어:** 사용하지 않는 숨김 레이어는 삭제하라. 참조용이면 `[OLD]` 접두사를 붙이라
6. **컴포넌트 인스턴스:** 반복 요소는 반드시 컴포넌트 인스턴스를 사용하라. 독립 프레임으로 복사하지 않는다
````
