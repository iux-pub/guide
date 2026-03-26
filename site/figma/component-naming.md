---
title: 컴포넌트 네이밍
order: 2
---

피그마 컴포넌트의 네이밍 규칙을 정의한다. 일관된 네이밍은 컴포넌트 검색, 인스턴스 교체, 퍼블리싱 매핑을 쉽게 만든다.

## 계층 구조

슬래시(`/`)를 구분자로 사용하여 계층을 표현한다.

```
카테고리 / 컴포넌트명 / Variant
```

**예시:**

```
Button / Primary
Button / Primary / Small
Button / Primary / Large
Button / Secondary
Button / Outline
Button / Text
Card / Default
Card / Featured
Form / Input
Form / Input / Error
Form / Select
Form / Checkbox
Form / Radio
Table / Default
Table / Striped
```

## 대소문자 규칙

| 대상 | 규칙 | 예시 |
|------|------|------|
| 카테고리 | PascalCase | `Button`, `Form`, `Card` |
| 컴포넌트명 | PascalCase | `Primary`, `Secondary`, `Input` |
| Variant | PascalCase | `Small`, `Large`, `Error`, `Striped` |
| Property 이름 | camelCase | `size`, `state`, `variant` |
| Property 값 | camelCase | `small`, `large`, `error` |

## 컴포넌트 Property 네이밍

컴포넌트 Property(Variant, Boolean, Instance Swap)의 이름 규칙이다.

| Property 유형 | 네이밍 규칙 | 예시 |
|---------------|------------|------|
| Variant | camelCase, 의미적 이름 | `variant`, `size`, `state` |
| Boolean | `has` 또는 `show` 접두사 | `hasIcon`, `showLabel`, `hasClose` |
| Instance Swap | `icon` 또는 대상 이름 | `leadingIcon`, `trailingIcon` |
| Text | 역할 이름 | `label`, `title`, `description` |

**Variant Property 값 예시:**

| Property | 값 | 설명 |
|----------|----|------|
| `variant` | `primary`, `secondary`, `outline`, `text` | 버튼 스타일 변형 |
| `size` | `sm`, `md`, `lg` | 크기 변형 |
| `state` | `default`, `hover`, `active`, `focus`, `disabled` | 인터랙션 상태 |

## 금지 패턴

| 잘못된 네이밍 | 올바른 네이밍 | 이유 |
|-------------|-------------|------|
| `btn-primary` | `Button / Primary` | 슬래시 계층 구조 사용 필수 |
| `button_primary` | `Button / Primary` | 언더스코어 금지, 슬래시 사용 |
| `BUTTON/PRIMARY` | `Button / Primary` | 전체 대문자 금지, PascalCase 사용 |
| `Button/파란버튼` | `Button / Primary` | 시각적 속성 이름 금지, 의미적 이름 사용 |
| `btn` | `Button` | 축약 금지, 전체 이름 사용 |
| `Btn Group / Horizontal` | `ButtonGroup / Horizontal` | 공백 단어 분리 금지, PascalCase로 연결 |

## BEM 클래스 매핑

피그마 컴포넌트 이름이 어떤 BEM 클래스로 변환되는지 참조한다.

| 피그마 계층 | 매핑 규칙 | BEM 결과 |
|------------|----------|----------|
| `Button` | 카테고리 = Block | `.btn` |
| `Button / Primary` | Variant = Modifier | `.btn--primary` |
| `Button / Primary / Small` | 복합 Variant = 복합 Modifier | `.btn--primary.btn--sm` |
| `Card` | 카테고리 = Block | `.card` |
| `Card / Featured` | Variant = Modifier | `.card--featured` |
| `Form / Input` | 하위 구조 = Element | `.form__input` |
| `Form / Input / Error` | Element + Variant = Element + Modifier | `.form__input--error` |

**매핑 규칙 요약:**

1. 최상위 카테고리는 BEM Block에 대응한다
2. 슬래시 다음 첫 번째 레벨은 Variant(Modifier) 또는 Element이다
3. Element 아래의 Variant는 Element Modifier에 대응한다
4. 복합 Variant(크기 + 스타일)는 복수 Modifier 클래스로 변환한다

상세 매핑 테이블은 [피그마→코드 핸드오프](/onboarding/handoff/)를 참조한다.

## 컴포넌트 정리 규칙

### 공개 컴포넌트 vs 내부 컴포넌트

| 구분 | 접두사 | 예시 | 설명 |
|------|--------|------|------|
| 공개 컴포넌트 | 없음 | `Button / Primary` | Asset 패널에서 검색/사용 가능 |
| 내부 컴포넌트 | `.` (마침표) | `.Icon / Arrow` | Asset 패널에서 숨김 처리 |
| 내부 컴포넌트 | `_` (언더스코어) | `_Slot / Content` | Asset 패널에서 숨김 처리 |

### 컴포넌트 설명

모든 공개 컴포넌트에는 Description을 작성한다.

```
용도: 기본 버튼 컴포넌트
Variant: primary, secondary, outline, text
Size: sm, md, lg
State: default, hover, active, focus, disabled
```
