# 인포마인드 UX 디자인 가이드

> 디자인 작업(피그마 시안, 컴포넌트 설계) 시 참조하라.
> 퍼블리싱 규칙은 prompts/publishing.md 를 참조하라.

---

# 피그마 컨벤션

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

상세 매핑 테이블은 피그마→코드 핸드오프를 참조한다.

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

---

피그마 파일의 페이지 구성, 프레임 네이밍, 레이어 정리 원칙을 정의한다. 체계적인 파일 구조는 다른 팀원이 파일을 쉽게 이해하고 디자인을 정확히 파악할 수 있게 한다.

## 페이지 구성

피그마 파일의 페이지(Page)는 다음 순서와 이름으로 구성한다.

| 순서 | 페이지 이름 | 용도 | 필수 |
|------|------------|------|------|
| 1 | Cover | 프로젝트 표지 (프로젝트명, 상태, 날짜) | 필수 |
| 2 | Guide | 파일 사용 가이드, 컬러/타이포 토큰 정리 | 필수 |
| 3 | Components | 로컬 컴포넌트 정의 (마스터 컴포넌트) | 필수 |
| 4 | Icons | 아이콘 세트 | 선택 |
| 5~ | PC - 메인 | PC 해상도 시안 | 프로젝트별 |
| 6~ | PC - 서브 | PC 서브 페이지 시안 | 프로젝트별 |
| 7~ | Tablet - 메인 | 태블릿 해상도 시안 | 프로젝트별 |
| 8~ | Mobile - 메인 | 모바일 해상도 시안 | 프로젝트별 |
| 마지막 | Archive | 사용하지 않는 이전 시안 보관 | 선택 |

**페이지 이름 규칙:**

- 영문 + 한국어 혼용 가능 (예: `PC - 메인`, `Mobile - 서브`)
- 해상도 접두사를 사용하여 반응형 구분: `PC`, `Tablet`, `Mobile`
- 하이픈(`-`)으로 해상도와 페이지 구분: `PC - 메인`, `PC - 서브`

## 프레임 네이밍 규칙

### 최상위 프레임 (시안 단위)

시안 페이지 내 최상위 프레임은 해당 화면의 이름을 명시한다.

```
[해상도] 페이지명 - 상태
```

**예시:**

```
PC 메인
PC 서브 - 목록
PC 서브 - 상세
PC 서브 - 글쓰기
Tablet 메인
Mobile 메인
PC 팝업 - 로그인
```

### 섹션 프레임

최상위 프레임 내부의 섹션은 역할 기반으로 네이밍한다.

| 프레임 이름 | 용도 | 예시 |
|------------|------|------|
| `Header` | 상단 영역 | 로고, GNB |
| `Visual` | 메인 비주얼 배너 | 슬라이더, 히어로 |
| `Content` | 본문 콘텐츠 영역 | 게시판, 카드 목록 |
| `Sidebar` | 좌측/우측 사이드바 | 메뉴, 필터 |
| `Footer` | 하단 영역 | 주소, 링크 |
| `Modal` | 모달/팝업 | 로그인, 확인 |

## 레이어 정리 원칙

### 네이밍 규칙

| 대상 | 규칙 | 좋은 예 | 나쁜 예 |
|------|------|---------|---------|
| 프레임 | 역할 기반 한국어/영문 | `Header`, `검색 영역` | `Frame 427`, `Group 12` |
| 그룹 | 내용 설명 | `로고 영역`, `버튼 그룹` | `Group 1`, `Group 2` |
| 텍스트 | 역할 또는 내용 | `페이지 제목`, `본문 텍스트` | `Text 1`, `T` |
| 이미지 | 내용 설명 | `메인 배너`, `프로필 이미지` | `Rectangle 5`, `Image` |
| 아이콘 | `icon/` 접두사 + 이름 | `icon/arrow-right` | `Vector`, `Union` |

### 정리 필수 사항

1. **자동 생성 이름 금지**: `Frame 427`, `Group 12`, `Rectangle 5` 등 피그마가 자동으로 붙이는 이름을 그대로 두지 않는다
2. **불필요한 그룹 제거**: 단일 요소만 포함하는 그룹을 만들지 않는다
3. **레이어 순서**: 시각적 순서와 레이어 순서를 일치시킨다 (위에 보이는 것이 레이어에서도 위)
4. **숨김 레이어 정리**: 사용하지 않는 숨김 레이어는 삭제한다. 참조용으로 남겨야 하면 `[OLD]` 접두사를 붙인다
5. **컴포넌트 인스턴스**: 반복 요소는 반드시 컴포넌트 인스턴스를 사용한다. 독립된 프레임으로 복사하지 않는다

### 레이어 깊이 제한

레이어 중첩은 최대 5단계를 권장한다.

```
Frame (최상위)
  └─ Section (섹션)
       └─ Component (컴포넌트)
            └─ Element (요소)
                 └─ Sub-element (하위 요소)
```

5단계를 초과하면 컴포넌트로 분리하는 것을 고려한다.

## 프레임 크기 기준

시안 작성 시 사용하는 프레임 너비 기준이다.

| 해상도 | 프레임 너비 | 콘텐츠 영역 | 비고 |
|--------|-----------|------------|------|
| PC | 1920px | 1200px (max-width) | 가장 일반적인 모니터 |
| Tablet | 768px | 100% (padding 24px) | iPad 세로 기준 |
| Mobile | 360px | 100% (padding 16px) | 안드로이드 기본 |

이 값은 퍼블리싱 브레이크포인트와 연결된다.

## 파일 정리 체크리스트

시안 작업 완료 후, 핸드오프 전에 다음 항목을 점검한다.

- [ ] 모든 페이지가 정해진 순서와 이름으로 구성되어 있는가
- [ ] 최상위 프레임에 의미 있는 이름이 부여되어 있는가
- [ ] `Frame 427`, `Group 12` 같은 자동 이름이 남아있지 않은가
- [ ] 불필요한 숨김 레이어가 정리되었는가
- [ ] 반복 요소가 컴포넌트 인스턴스로 연결되어 있는가
- [ ] 레이어 순서가 시각적 순서와 일치하는가

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

---

피그마 Auto Layout의 패딩, 갭 값을 디자인 토큰 스케일에 맞춰 사용하는 규칙을 정의한다. 토큰 스케일을 준수하면 퍼블리싱에서 CSS Custom Properties로 1:1 변환되어 일관된 간격을 유지할 수 있다.

## 패딩/갭 토큰 매핑

Auto Layout의 Padding과 Gap(Item spacing) 값은 반드시 토큰 스케일 값만 사용한다.

### 간격 토큰 스케일

| 토큰 이름 | 피그마 값 (px) | CSS Custom Property | 용도 |
|----------|---------------|---------------------|------|
| `Spacing / xs` | 4px | `--spacing-xs` | 최소 간격, 아이콘-텍스트 사이 |
| `Spacing / sm` | 8px | `--spacing-sm` | 작은 간격, 인라인 요소 간격 |
| `Spacing / md` | 16px | `--spacing-md` | 기본 간격, 카드 내부 패딩 |
| `Spacing / lg` | 24px | `--spacing-lg` | 넓은 간격, 섹션 내부 패딩 |
| `Spacing / xl` | 32px | `--spacing-xl` | 섹션 간 간격 |
| `Spacing / 2xl` | 48px | `--spacing-2xl` | 큰 섹션 간 간격 |
| `Spacing / 3xl` | 64px | `--spacing-3xl` | 최대 간격, 페이지 상하 여백 |

**금지:** 위 스케일에 없는 값(예: 5px, 10px, 15px, 20px, 30px)을 사용하지 않는다. 가장 가까운 토큰 값을 선택한다.

### 허용 예외 값

| 값 | 용도 | 비고 |
|----|------|------|
| 0px | 간격 없음 | 요소 밀착 배치 |
| 1px | 구분선 두께 | border 표현용 |
| 2px | 미세 간격 | 아이콘 정렬 보정 등 극히 제한적 |

## 컴포넌트별 Auto Layout 패턴

### 버튼 (Button)

| 속성 | 값 | 토큰 |
|------|----|------|
| Horizontal padding | 16px | `Spacing / md` |
| Vertical padding | 8px | `Spacing / sm` |
| Item spacing (아이콘-텍스트) | 4px | `Spacing / xs` |
| Resizing | Hug contents | - |

**크기 변형:**

| 크기 | Horizontal padding | Vertical padding |
|------|--------------------|------------------|
| Small (`sm`) | 8px (`Spacing / sm`) | 4px (`Spacing / xs`) |
| Medium (`md`) | 16px (`Spacing / md`) | 8px (`Spacing / sm`) |
| Large (`lg`) | 24px (`Spacing / lg`) | 16px (`Spacing / md`) |

### 카드 (Card)

| 속성 | 값 | 토큰 |
|------|----|------|
| Padding (전체) | 16px | `Spacing / md` |
| Header-Body 간격 | 16px | `Spacing / md` |
| Body-Footer 간격 | 16px | `Spacing / md` |
| Direction | Vertical | - |

### 폼 그룹 (Form Group)

| 속성 | 값 | 토큰 |
|------|----|------|
| Label-Input 간격 | 8px | `Spacing / sm` |
| Input 내부 Horizontal padding | 16px | `Spacing / md` |
| Input 내부 Vertical padding | 8px | `Spacing / sm` |
| Form Group 간 간격 | 24px | `Spacing / lg` |

### 네비게이션 (Navigation)

| 속성 | 값 | 토큰 |
|------|----|------|
| Item spacing | 8px | `Spacing / sm` |
| Item padding | 8px 16px | `Spacing / sm` / `Spacing / md` |
| Direction | Horizontal | - |

### 리스트 (List)

| 속성 | 값 | 토큰 |
|------|----|------|
| Item spacing | 8px | `Spacing / sm` |
| Item padding | 16px | `Spacing / md` |
| Direction | Vertical | - |

## 반응형 Auto Layout 동작

해상도별로 Auto Layout 값이 변경되는 패턴을 정의한다.

### 컨테이너 패딩

| 해상도 | 좌우 패딩 | 토큰 |
|--------|----------|------|
| Mobile (360px) | 16px | `Spacing / md` |
| Tablet (768px) | 24px | `Spacing / lg` |
| PC (1280px~) | 40px 또는 auto | `Spacing / 2xl` 이상 또는 자동 |

### 그리드 거터

| 해상도 | 거터 값 | 토큰 |
|--------|--------|------|
| Mobile | 16px | `Spacing / md` |
| Tablet+ | 24px | `Spacing / lg` |

### 섹션 간격

| 해상도 | 섹션 간 간격 | 토큰 |
|--------|------------|------|
| Mobile | 32px | `Spacing / xl` |
| Tablet | 48px | `Spacing / 2xl` |
| PC | 64px | `Spacing / 3xl` |

## Auto Layout 설정 규칙

### Resizing 규칙

| 유형 | Resizing | 예시 |
|------|----------|------|
| 텍스트 버튼 | Hug contents | 내용에 맞게 크기 조절 |
| 고정 너비 버튼 | Fixed width | 폼 제출 버튼 등 |
| 카드 | Fill container (가로) | 그리드 컬럼에 맞춤 |
| 입력 필드 | Fill container (가로) | 폼 너비에 맞춤 |
| 페이지 컨테이너 | Fixed width | 시안 프레임 너비 |

### Alignment 규칙

| 상황 | Alignment | 설명 |
|------|-----------|------|
| 텍스트 + 아이콘 | Center (수직) | 아이콘과 텍스트 수직 정렬 |
| 폼 라벨 + 입력 | Top (수직) | 라벨이 입력 상단에 정렬 |
| 푸터 내부 요소 | Space between (수평) | 좌우 균등 배치 |
| 카드 내부 | Stretch (수평) | 카드 너비에 맞춤 |

## Auto Layout 체크리스트

시안 작업 시 다음 항목을 점검한다.

- [ ] 모든 Padding 값이 토큰 스케일(4, 8, 16, 24, 32, 48, 64px)에 해당하는가
- [ ] 모든 Gap(Item spacing) 값이 토큰 스케일에 해당하는가
- [ ] 5px, 10px, 15px, 20px 같은 비토큰 값을 사용하지 않았는가
- [ ] 반응형 변형(Mobile/Tablet/PC)에서 간격이 토큰 규칙에 맞는가
- [ ] Resizing 설정이 의도한 레이아웃 동작과 일치하는가
- [ ] 컴포넌트 내부 Auto Layout이 일관된 패턴을 따르는가

---

# 디자인 가이드

UI 내 모든 텍스트(버튼, 오류 메시지, 플레이스홀더, 툴팁, 빈 화면 카피 등)의 작성 기준. 코드나 피그마 작업 시 카피가 필요한 모든 상황에 적용한다.

## 에러 메시지 3-Part 공식

**무엇이 잘못됐는지 + (왜) + 어떻게 해결하는지**

모든 오류 메시지는 이 세 부분을 포함해야 한다. "왜"는 원인이 불분명할 때 생략할 수 있다.

| 잘못된 예 | 올바른 예 |
|-----------|-----------|
| "오류가 발생했습니다" | "저장에 실패했습니다. 연결을 확인하고 다시 시도해주세요." |
| "잘못된 입력입니다" | "유효한 이메일 주소를 입력해주세요 (예: name@company.com)" |
| "에러" | "파일이 너무 큽니다. 10MB 이하 파일을 업로드해주세요." |

### 작성 원칙

- **사용자를 탓하지 않는다** -- 수동태 활용 ("업로드할 수 없었습니다" vs "잘못 업로드했습니다")
- **기술 용어 금지** -- Error 500, null reference 같은 내부 오류 코드를 노출하지 않는다
- **재시도 액션 제공** -- 가능한 경우 "다시 시도" 버튼을 포함한다
- **1~2문장 이내** 유지
- **사용자 입력 유지** -- 오류 시 폼 입력값을 초기화하지 않는다

## 버튼 텍스트 규칙

버튼은 **동사** 또는 **동사+목적어**로 작성한다. 2~4단어 이내로 유지한다.

| 금지 | 대체 |
|------|------|
| OK, 확인 | 저장, 적용, 닫기 |
| Submit | 제출하기, 메시지 보내기 |
| Yes / No | 삭제하기 / 취소 |
| Delete | 프로젝트 삭제 (무엇을 삭제하는지 명시) |

### 추가 규칙

- **결과를 명확히**: "저장"보다 "변경사항 저장"이 더 명확하다
- **Sentence case** 적용: "계정 만들기" (O)
- **비파괴적 액션**과 **파괴적 액션** 버튼을 시각+텍스트로 구분한다

### 삭제 확인 다이얼로그 패턴

```
제목: [프로젝트명] 삭제
내용: 이 작업은 되돌릴 수 없습니다. 관련 데이터가 모두 삭제됩니다.

[취소]  [프로젝트 삭제]  -- 구체적 레이블, 빨간색
```

## 톤 매핑 테이블

제품 유형에 따라 톤을 일관되게 적용한다.

| 제품 유형 | 톤 | 예시 |
|-----------|-----|------|
| **B2B 관리 도구** (inCMSv3, inPOS) | 전문적, 간결 | "변경사항이 저장되었습니다." |
| **소비자 앱 / 모바일** | 친근, 따뜻 | "저장됐어요" |
| **공공/행정 시스템** | 중립, 명확 | "처리가 완료되었습니다." |
| **랜딩/마케팅** | 브랜드 보이스 | 클라이언트 가이드라인 우선 |

### 일관성 규칙

- **동일 개념 = 동일 단어**: "삭제"와 "제거"를 혼용하지 않는다
- **경어 레벨 통일**: 한 화면 내 "하세요" / "해주세요" 혼용을 금지한다
- **성공 메시지**: 진짜 중요한 순간에만 축하 표현을 사용한다 (일상적 저장은 간결하게)

## 플레이스홀더 규칙

플레이스홀더는 **라벨을 대체하지 않는다**. 보조적 예시와 힌트 역할만 한다.

### 허용 사용

| 사용 목적 | 예시 |
|-----------|------|
| 형식 예시 | `name@company.com` |
| 짧은 힌트 | `프로젝트명을 입력하세요` |
| 샘플 값 | `예: 2024년 1분기 보고서` |

### 금지 사용

| 금지 패턴 | 이유 |
|-----------|------|
| 라벨 대신 플레이스홀더만 사용 | 필드 클릭 시 사라져 혼란 |
| 긴 설명문 | 입력 중 보이지 않음 |
| 필수 정보 포함 | 포커스 시 사라짐 |

- 대비: 최소 3:1 (WCAG AA) -- 완전 연한 색 주의
- `"예:"` 접두사로 예시임을 명확히 한다

## 빈 상태 구조

빈 화면은 반드시 **아이콘 + 제목 + 설명 + CTA** 구조를 따른다.

```
[아이콘/일러스트]

제목: 아직 [콘텐츠]가 없습니다
설명: [콘텐츠]를 추가하면 여기에 표시됩니다. (선택)

[+ 첫 번째 만들기]  -- CTA 필수
```

### 유형별 카피

| 유형 | 제목 예시 | CTA |
|------|-----------|-----|
| **첫 사용** | "프로젝트를 시작해보세요" | 프로젝트 만들기 |
| **검색 결과 없음** | "'키워드'에 대한 결과가 없습니다" | 검색어 지우기 |
| **필터 결과 없음** | "조건에 맞는 항목이 없습니다" | 필터 초기화 |
| **오류로 인한 빈 화면** | "데이터를 불러오지 못했습니다" | 다시 시도 |
| **권한 없음** | "이 콘텐츠를 볼 권한이 없습니다" | 관리자에게 요청 |

## 숫자 포맷

| 유형 | 권장 형식 | 비고 |
|------|-----------|------|
| 날짜 | `2025년 1월 15일` 또는 `Jan 15, 2025` | 지역에 따라 선택 |
| 상대 시간 | `2시간 전` (hover 시 전체 날짜 표시) | |
| 큰 숫자 | `1,200,000` 또는 `120만` | 콘텍스트에 따라 선택 |
| 파일 크기 | `1.4 MB`, `320 KB` | |
| 진행률 | `75% 완료` | 퍼센트가 더 친근함 |

---

피그마 Prototype 패널 설정과 개발 핸드오프를 위한 인터랙션 명세. 모든 전환 효과는 토큰 기반으로 정의하며, 접근성(prefers-reduced-motion)을 필수로 대응한다.

## 전환 시간 토큰

| 토큰 | 값 | 용도 |
|------|-----|------|
| `duration/fast` | 100ms | 호버, 색상 변경 등 즉각 피드백 |
| `duration/normal` | 200ms | 드롭다운, 탭 전환, 토스트 |
| `duration/slow` | 300ms | 모달, 사이드바, 페이지 전환 |

## 이징 함수

| 토큰 | 값 | 용도 |
|------|-----|------|
| `easing/default` | Ease Out | 기본 전환 (등장) |
| `easing/spring` | Spring (Damping 20 / Stiffness 150) | 모달, 토스트 등장 |
| Ease In | -- | 닫기, 퇴장 전환 |

**원칙**: 등장은 Ease Out, 퇴장은 Ease In을 사용한다. 모달과 토스트는 Spring으로 생동감을 부여한다.

## 컴포넌트별 전환 매핑

| 컴포넌트 | 전환 유형 | Duration | Easing | 비고 |
|----------|-----------|----------|--------|------|
| 버튼 Hover | Fill Color 변경 | 200ms | Ease Out | Smart Animate |
| 모달 열림 | Scale + Opacity | 300ms | Spring | Scale 0.95 → 1, Opacity 0 → 100% |
| 모달 닫힘 | Opacity | 200ms | Ease In | Opacity → 0 |
| 드롭다운 열림 | translateY + Opacity | 200ms | Ease Out | -8px → 0 |
| Toast 등장 | translateX | 200ms | Spring | 우측 외부 → 0 |
| Toast 퇴장 | Opacity | 200ms | Ease In | Opacity → 0, 자동 닫힘 3초 |
| 사이드바 접기 | Width 변경 | 300ms | Ease Out | 210px → 70px |
| 탭 전환 | Indicator 이동 | 200ms | Ease Out | Smart Animate |
| 페이지 전환 | Dissolve | 300ms | Ease Out | |
| 드로어 열림 | Slide In | 300ms | Ease Out | 방향: 좌측 또는 우측 |
| 아코디언 | Height 변경 | 200ms | Ease Out | Smart Animate |

## Hover 상태

피그마에서 Hover는 **Component Variant**로 구현한다.

| 컴포넌트 | Default → Hover 변화 |
|----------|----------------------|
| Button Primary | Fill: `brand/500` → `brand/700` |
| Button Secondary | Fill: Transparent → `brand/50` |
| Button Ghost | Fill: Transparent → `neutral/900` 8% Opacity |
| Card (Interactive) | Shadow: `shadow/md` → `shadow/lg` + translateY -2px |
| Icon Button | Fill: Transparent → `neutral/900` 8% (Circle) |
| Link 텍스트 | Color: `brand/500` → `brand/700` + Underline |
| Table Row | Fill: None → `neutral/50` |

## Focus Ring 규격

모든 인터랙티브 컴포넌트에 **Focus Variant**를 필수로 설계한다.

- **기본**: Stroke 3px, `brand/500` 35% Opacity → `shadow/focus` 토큰 참조
- **어두운 배경** (사이드바 등): Stroke 3px, White 50% Opacity

## Active / Pressed 상태

| 컴포넌트 | 변화 |
|----------|------|
| Button | Scale: 97% (0.97) |
| Card Interactive | Shadow: `shadow/sm`, translateY: 0 |

## Disabled 상태

- **Opacity**: 40% (`opacity/disabled`)
- 모든 Hover/Focus 인터랙션 비활성
- **Cursor**: `not-allowed` (개발자 전달 명세)
- **`pointer-events: none`** 적용

## prefers-reduced-motion 대응

시스템에서 애니메이션 줄이기를 설정한 사용자의 경우, 모든 전환 효과를 즉시(0ms) 또는 최소화로 처리해야 한다. 자동 재생 애니메이션은 사용자 제어 옵션을 반드시 제공한다.

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;  /* stylelint-disable-line -- 접근성 필수 오버라이드 */
    animation-iteration-count: 1 !important;  /* stylelint-disable-line -- 접근성 필수 오버라이드 */
    transition-duration: 0.01ms !important;  /* stylelint-disable-line -- 접근성 필수 오버라이드 */
    scroll-behavior: auto !important;  /* stylelint-disable-line -- 접근성 필수 오버라이드 */
  }
}
```

**핸드오프 시 반드시 명시**: 디자인 핸드오프 문서에 `prefers-reduced-motion` 대응이 필수임을 기재한다.

## 애니메이션 성능 규칙

- `transform`과 `opacity`만 애니메이션하라 (GPU 합성 레이어)
- `top`, `left`, `width`, `height` 직접 애니메이션 금지 (레이아웃 리플로우 발생)
- 스크롤 감지는 `IntersectionObserver` 사용. `window.addEventListener('scroll')` 직접 바인딩 금지
- 전체 높이에 `height: 100vh` 금지 → `min-height: 100dvh` 사용 (iOS Safari 주소창 대응, `100vh` 폴백 병기)

## Do / Don't

| Do | Don't |
|----|-------|
| 모든 인터랙티브 컴포넌트에 Hover/Focus Variant 설계 | Focus 상태 없이 납품 |
| Smart Animate로 자연스러운 상태 전환 | 모든 전환을 Dissolve 처리 |
| Spring easing으로 모달/토스트에 생동감 부여 | 500ms 이상 긴 Duration 사용 |
| 터치 타겟 44px 이상 확보 (Mobile) | 작은 아이콘 버튼을 터치 영역 없이 배치 |
| Prototype Flow로 주요 사용자 흐름 연결 | Prototype 없이 정적 화면만 납품 |
| `transform`/`opacity`로 애니메이션 | `top`/`left`/`width`/`height` 애니메이션 |
| `IntersectionObserver`로 스크롤 감지 | `scroll` 이벤트 직접 바인딩 |
| `min-height: 100dvh` (폴백 병기) | `height: 100vh` 단독 사용 |

---

## 디자인 감사 (17개 카테고리)

### 1. 타이포그래피
### 2. 색상 & 대비
### 3. 간격 & 레이아웃
### 4. 시각 위계
### 5. 일관성
### 6. 접근성
### 7. 폼 & 입력
### 8. 모션 & 애니메이션
### 9. 다크 모드
### 10. 반응형 디자인
### 11. 상태 (States)
### 12. 마이크로카피
### 13. i18n & RTL
### 14. 엘리베이션 & 그림자
### 15. 아이콘그래피
### 16. 내비게이션 패턴
### 17. 디자인 토큰 & 변수

## Quick 5 -- 납품 전 최소 점검

모든 납품에서 반드시 확인하는 5가지 항목.

- [ ] 텍스트 대비율 4.5:1 이상
- [ ] 인터랙티브 요소에 Hover/Focus 상태 존재
- [ ] 하드코딩 값 없음 (토큰 사용)
- [ ] 모바일 터치 타겟 44px 이상
- [ ] Loading/Empty/Error 상태 설계 완료

---

로딩, 에러, 빈 상태, 폼 유효성 등 UI가 가질 수 있는 모든 상태에 대한 처리 기준. 사용자 경험의 빈틈을 없애기 위해 모든 화면은 Default 외에 Loading/Error/Empty/Success 상태를 설계해야 한다.

## 로딩 상태

### 의사결정 트리

| 상황 | 권장 컴포넌트 | 이유 |
|------|--------------|------|
| 페이지 최초 로딩 | **Skeleton** | 레이아웃 유지, 콘텐츠 위치 예측 가능 |
| 버튼 클릭 후 처리 | **Spinner** (버튼 내장) | 즉각적 피드백, 중복 클릭 방지 |
| 파일 업로드/다운로드 | **ProgressBar** | 진행 상황 정량 표시 |
| 인라인 데이터 갱신 | **Spinner** (sm) | 비침해적, 부분 영역 표시 |
| 긴 작업 (5초 이상) | **ProgressBar** + 예상 시간 텍스트 | 대기 시간 예측 가능 |

### Skeleton vs Spinner vs ProgressBar

| 컴포넌트 | 특징 | 피그마 구성 |
|----------|------|------------|
| **Skeleton** | 실제 콘텐츠 레이아웃과 동일한 형태의 회색 플레이스홀더 | `neutral/100` Fill, 좌 → 우 반짝임 효과 |
| **Spinner** | 회전 인디케이터, 크기별 sm(16px)/md(24px)/lg(40px) | `brand/500` Active, `neutral/200` Track |
| **ProgressBar** | 가로 바 + Fill 채움, 퍼센트 표시 | Width 퍼센트로 조절 |

### 상태 전환 흐름

```
Default → Loading → Complete 또는 Error
```

- 로딩 중: 버튼/입력창을 **Disabled** 상태로 전환한다
- 완료: Success Toast 또는 인라인 메시지를 표시한다
- 오류: Error 메시지 + 재시도 액션을 제공한다

## 에러 상태

### 3단계 심각도

| 심각도 | 표시 방식 | 색상 | 사용자 안내 |
|--------|-----------|------|------------|
| **경미** (입력 오류) | 필드 하단 인라인 메시지 | `error/500` | 수정 포커스 이동 |
| **중간** (API 오류) | Toast 또는 인라인 Banner | `error/500` 또는 `warning/500` | 재시도 버튼 |
| **심각** (서버 오류) | 전체 화면 오류 페이지 | `neutral/500` | 새로고침 안내 |

### Alert 배너 구조

```
Alert [Frame, Auto Layout 가로, Padding: 16px 20px]
  |-- Icon [16px, 상태별 색상]
  |-- Message [Text, body-sm, flex: 1]
  |-- Button/Ghost [선택적 재시도]
```

Fill & 색상 매핑:

| 상태 | 배경 | 텍스트 & 아이콘 |
|------|------|----------------|
| Error | `error/50` | `error/700` |
| Warning | `warning/50` | `warning/700` |
| Success | `success/50` | `success/700` |
| Info | `info/50` | `info/700` |

### 오류 유형별 처리

| 오류 유형 | 표시 방식 |
|-----------|-----------|
| 네트워크 오류 | 인라인 오류 + 재시도 버튼 |
| 입력 유효성 | 필드 하단 오류 텍스트 |
| 권한 없음 | 전체 화면 오류 페이지 |
| 서버 오류 | 오류 배너 + 새로고침 유도 |
| 타임아웃 | Toast 알림 + 재시도 |

## 빈 상태

아이콘 + 제목 + 설명 + CTA 템플릿을 따른다.

### 피그마 구성

```
Empty State [Frame, Auto Layout 세로, Align: Center, Gap: 16px]
  |-- Icon (48px) 또는 일러스트
  |-- Title [Text, heading-md, center]
  |-- Description [Text, body-sm, secondary, center, max-width: 320px]
  |-- CTA Button [Button/Primary, 선택적]
```

Padding: 64px 상하

### 유형별 빈 상태

| 유형 | 구성 |
|------|------|
| 데이터 없음 | 일러스트 + 안내 텍스트 + CTA 버튼 |
| 검색 결과 없음 | 아이콘 + "검색 결과가 없습니다" + 검색어 수정 유도 |
| 권한 없음 | 잠금 아이콘 + 설명 텍스트 |
| 첫 진입 | 온보딩 가이드 또는 예시 데이터 |

## 폼 유효성 타이밍

| 시점 | 대상 | 설명 |
|------|------|------|
| `blur` (필드 이탈) | 형식 오류 | 이메일, 전화번호 등 형식 검증 |
| `change` (값 변경) | 실시간 피드백 | 비밀번호 강도 등 |
| `submit` (제출) | 필수 입력 | 미기재 필드 → 첫 번째 오류에 포커스 |
| ~~키스트로크~~ | **사용하지 않음** | 입력 중 방해 -- 형식 오류에 키입력 검증 금지 |

### 폼 입력 필드 상태

| State | Stroke 색상 | 추가 요소 |
|-------|------------|-----------|
| Default | `border/default` | -- |
| Focused | `border/focus` (`brand/500`) + `shadow/focus` | -- |
| Filled | `border/default` | 텍스트: `text/primary` |
| Disabled | `border/default` | `opacity/disabled` (0.4) |
| Error | `error/500` | 하단 Error Message |
| Success | `success/500` | -- |

---

아이콘 크기, 라이브러리 선택, 접근성 규칙을 정의한다. 아이콘 시스템의 일관성은 UI 품질에 직접적 영향을 미치므로 이 규칙을 엄격히 따른다.

## 표준 라이브러리

### 권장 라이브러리

| 라이브러리 | 공식 URL | 스타일 | 적합한 제품 |
|-----------|---------|--------|------------|
| **Lucide** | [lucide.dev](https://lucide.dev) | 2px stroke, 깔끔한 outline | 현대적 SaaS, 개발자 도구 |
| **Phosphor** | [phosphoricons.com](https://phosphoricons.com) | 멀티웨이트, 범용 | 유연성 최고, 어디든 |
| **Tabler Icons** | [tabler.io/icons](https://tabler.io/icons) | Outline, 매우 풍부 | Enterprise, 관리 도구 |

**인포마인드 권장**: Lucide 또는 Tabler Icons (현재 프로젝트 선택을 따르되, **혼용은 금지**한다)

### 핵심 원칙

- **라이브러리 1종만 사용**: 라이브러리가 다르면 획 굵기, 광학 비율, 모서리가 달라 통일감이 깨진다
- **Outline/Filled 스타일 혼용 금지**: 한 제품 내에서 스타일을 통일한다
- **같은 아이콘 = 같은 의미**: 한 제품에서 ★이 "즐겨찾기"이면, 다른 곳에서 ★을 "평점"으로 사용하지 않는다

## SVG 인라인 사용법

아이콘은 SVG 인라인으로 삽입한다. `` 태그나 CSS background 대신 인라인 SVG를 사용해야 색상 제어와 접근성 처리가 가능하다.

### 장식용 아이콘 (텍스트와 함께)

텍스트와 함께 사용되어 의미를 보충하는 아이콘은 장식용으로 처리한다. `aria-hidden="true"`로 스크린 리더에서 숨긴다.

```html

  
    
    
    
  
  삭제하기

```

### 의미 있는 아이콘 (단독 사용)

텍스트 없이 단독으로 사용되는 아이콘은 반드시 버튼에 `aria-label`을 제공한다. 아이콘 자체는 여전히 `aria-hidden="true"`로 숨기고, 버튼이 의미를 전달한다.

```html

  
    
    
  

  
    
    
  

```

### 상태 표시 아이콘 (인라인)

텍스트 흐름 안에서 상태를 나타내는 인라인 아이콘은 `vertical-align`으로 정렬한다.

```html

  
    
  
  승인 완료

```

```scss
.status {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-sm);

  &__icon {
    flex-shrink: 0;
  }

  &--success {
    color: var(--color-success);
  }

  &--danger {
    color: var(--color-danger);
  }
}
```

## 8pt 그리드 기반 크기

### 허용 크기

| 크기 | 용도 |
|------|------|
| 12px | 아주 작은 인라인 인디케이터 |
| 16px | 밀집된 UI, 소형 텍스트(12~13px) 옆 |
| 20px | 기본 -- 본문(14~16px) 옆 |
| 24px | 표준 아이콘 버튼, Nav 항목, 리스트 행 |
| 32px | 기능 아이콘, 섹션 헤딩 |
| 40px | Empty State 아이콘, 카드 장식 |
| 48px | 대형 Empty State, 온보딩 |

### 컨텍스트별 크기

| 컨텍스트 | 아이콘 크기 | SVG 속성 | 비고 |
|----------|------------|----------|------|
| 버튼 내 아이콘 | **16px** | `width="16" height="16"` | 텍스트와 함께, gap으로 간격 확보 |
| 네비게이션 항목 | **20px** | `width="20" height="20"` | 메뉴 텍스트 옆, 본문 크기와 균형 |
| 독립 아이콘 버튼 | **24px** | `width="24" height="24"` | 터치 타겟 44px 확보 필수 |
| 대형 기능 아이콘 | **32px** | `width="32" height="32"` | 섹션 헤딩, 기능 소개 카드 |
| Empty State | **40~48px** | `width="48" height="48"` | 시각적 포인트, 빈 상태 안내 |

### 금지 크기와 이유

아래 크기는 **8pt 그리드에 정렬되지 않아** 시각적 불일치를 만든다. 사용을 금지한다.

| 금지 크기 | 이유 | 대체 크기 |
|----------|------|----------|
| 18px | 16px과 20px 사이에서 어중간 | 16px 또는 20px |
| 22px | 20px과 24px 사이에서 어중간 | 20px 또는 24px |
| 26px | 24px과 32px 사이, 8pt 미정렬 | 24px 또는 32px |
| 28px | 24px과 32px 사이, 8pt 미정렬 | 24px 또는 32px |
| 36px | 32px과 40px 사이, 8pt 미정렬 | 32px 또는 40px |

### 텍스트 크기와 아이콘 크기 페어링

| 텍스트 | 아이콘 |
|--------|--------|
| 12px | 12~14px |
| 14px | 16px |
| 16px | 20px |
| 18~20px | 24px |
| 24px+ | 28~32px |

## 모호한 아이콘 판별

| 범용 아이콘 (레이블 불필요) | 모호한 아이콘 (레이블 필수) |
|---------------------------|---------------------------|
| X 닫기, 메뉴, 검색, + 추가, 확인 | 즐겨찾기/평점, 알림/리마인더, 설정/구성, 파일/프로젝트 |

모호한 아이콘에는 반드시 **텍스트 레이블** 또는 **툴팁**을 함께 제공한다.

## 터치 타겟

아이콘 자체가 24px이라도 인터랙티브할 경우 **44x44px** 터치 타겟을 필수로 확보한다.

```scss
.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: var(--radius-base);
  transition: background-color var(--transition-fast);

  &:hover {
    background-color: var(--color-bg-secondary);
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }

  &__svg {
    width: 24px;
    height: 24px;
    color: var(--color-text-secondary);
  }
}
```

## 정렬

아이콘과 텍스트를 함께 쓸 때 Flexbox로 정렬한다.

```scss
// 아이콘 + 텍스트 정렬 (Flexbox)
.icon-label {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);

  &__icon {
    flex-shrink: 0;
    width: 20px;
    height: 20px;
  }
}

// 인라인 아이콘 (텍스트 흐름 내)
.inline-icon {
  display: inline-block;
  vertical-align: -0.125em;
  width: 1em;
  height: 1em;
}
```

## Do / Don't

| Do | Don't |
|----|-------|
| 라이브러리 1종만 사용 | Outline/Filled 혼용 |
| 크기: 12/16/20/24/32/40/48px | 18/22/26/28/36px 사용 |
| 터치 타겟 44x44px 확보 | 24px 아이콘을 그냥 버튼으로 |
| 모호한 아이콘에 레이블/툴팁 | 레이블 없는 애매한 아이콘 |
| `aria-label` 아이콘 버튼 전체 | aria-label 없는 아이콘 버튼 |
| 같은 아이콘 = 같은 의미 | 맥락마다 다른 의미로 재사용 |
| SVG 인라인 + `aria-hidden="true"` | `` 태그로 아이콘 삽입 |
| `currentColor`로 색상 상속 | 아이콘에 하드코딩 색상 |

---

AI가 생성하는 프론트엔드 코드가 generic하지 않고, 맥락에 맞는 독창적 미학을 갖도록 하기 위한 가이드. 인포마인드 디자인 시스템 위에 적용하며, 제품 UI와 랜딩/마케팅 페이지의 적용 수준을 구분한다.

## AI 슬롭 안티패턴

아래 패턴은 "AI가 만든 티"가 나는 대표적 징후다. 반드시 피한다.

| 안티패턴 | 왜 문제인가 |
|----------|------------|
| Inter / Roboto / Arial / 시스템 폰트 기본 사용 | 어디서나 볼 수 있는 generic한 인상 |
| 보라색 그라디언트 + 흰 배경 | AI 생성물의 가장 흔한 클리셰 |
| 예측 가능한 레이아웃/컴포넌트 패턴 | 맥락 없는 틀에 박힌 구성 |
| 매번 같은 폰트 수렴 (예: Space Grotesk) | 생성 간 다양성 부족 |
| 맥락 무시한 쿠키커터 디자인 | 프로젝트 정체성이 없는 결과물 |
| 단색 배경에 분위기/깊이감 없음 | 시각적 풍부함 부재 |

**대안**: 매번 새로운 선택을 한다. 폰트, 색상, 레이아웃, 테마를 프로젝트 맥락에 맞게 변주한다.

### Before / After 비교: 카드 컴포넌트

**Before -- AI 슬롭 카드 (generic)**

```scss
// 문제: 토큰 미사용, 하드코딩, 개성 없음
.card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  font-family: 'Inter', sans-serif;

  h3 {
    font-size: 18px;         // 요소 선택자 의존
    color: #333;             // 하드코딩 색상
    margin-bottom: 12px;
  }

  p {
    font-size: 14px;
    color: #666;
    line-height: 1.5;
  }

  .btn {                     // BEM 미준수
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);  // 보라색 그라디언트
    color: white;
    border-radius: 8px;
    padding: 12px 24px;
  }
}
```

**After -- 의도적 카드 (inCMS 대시보드용)**

```scss
// inCMS 대시보드: Flat + Minimalism, 토큰 기반
.card {
  background-color: var(--color-bg);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-base);
  padding: var(--spacing-lg);
  transition: box-shadow var(--transition-fast);

  &:hover {
    box-shadow: var(--shadow-base);
  }

  &__title {
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text);
    margin-bottom: var(--spacing-sm);
  }

  &__description {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    line-height: var(--leading-base);
  }

  &__action {
    margin-top: var(--spacing-md);
  }
}
```

핵심 차이점:

| 항목 | AI 슬롭 | 의도적 설계 |
|------|---------|------------|
| 색상 | 하드코딩 `#333`, `#666` | 토큰 `var(--color-text)` |
| 레이아웃 | 매직넘버 `24px`, `12px` | 토큰 `var(--spacing-lg)`, `var(--spacing-sm)` |
| 네이밍 | `.btn`, `h3`, `p` | BEM `.card__title`, `.card__action` |
| 버튼 | 보라색 그라디언트 | 제품 토큰 기반 Primary |
| 폰트 | `Inter` 기본값 | 시스템 `PretendardGOV` |
| 모션 | 없음 | 토큰 기반 hover 트랜지션 |

### Before / After 비교: 히어로 섹션

**Before -- AI 슬롭 히어로**

```html

  Welcome to Our Platform
  The best solution for your needs

```

**After -- SmartFarm 랜딩 히어로 (Organic Biophilic)**

```html

  
    스마트팜 통합 모니터링
    온실 환경부터 생육 데이터까지, 한 화면에서 확인하세요
    데모 체험하기
  

```

```scss
.hero {
  &--biophilic {
    background-color: #f0f7f0;           // 자연 감성 확장 색상
    background-image:
      radial-gradient(ellipse at 20% 50%, rgba(34, 135, 56, 0.08) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 20%, rgba(37, 110, 244, 0.05) 0%, transparent 50%);
    padding: var(--spacing-3xl) 0;
  }

  &__title {
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-text);
  }

  &__subtitle {
    font-size: var(--font-size-md);
    color: var(--color-text-secondary);
    margin-top: var(--spacing-sm);
  }
}
```

## 5트랙 디자인 사고

새 프로젝트 또는 랜딩페이지 UI를 설계할 때 **5가지를 동시에** 검토한다. 5트랙 검토 없이 바로 코딩하지 않는다.

| Track | 질문 |
|-------|------|
| **Product** | 어떤 산업/도메인인가? 사용자는 누구인가? |
| **Style** | 어떤 UI 스타일이 맥락에 맞는가? |
| **Color** | 도메인 감성에 맞는 팔레트는? |
| **Layout** | 어떤 페이지 구조 패턴이 목적에 맞는가? |
| **Typography** | 어떤 폰트 페어링이 톤앤매너에 맞는가? |

### 프로젝트 시작 체크리스트

새 프로젝트를 시작할 때 아래 체크리스트를 반드시 완성한 뒤 코딩에 들어간다.

#### Product Track

- [ ] 산업/도메인을 명확히 정의했는가 (공공, 금융, 농업, 유통 등)
- [ ] 주요 사용자 페르소나를 1~2개 설정했는가
- [ ] 사용자의 기술 숙련도를 파악했는가 (전문가/일반인/고령자)
- [ ] 경쟁 제품/유사 서비스의 UI를 조사했는가
- [ ] 제품 유형을 결정했는가 (대시보드/랜딩/관리자/공공포털)

#### Style Track

- [ ] 아래 제품별 스타일 매핑 테이블에서 권장 스타일을 확인했는가
- [ ] 금지 스타일을 확인하고 팀에 공유했는가
- [ ] 레퍼런스 사이트를 3개 이상 수집했는가
- [ ] 스타일 키워드를 2~3개로 압축했는가 (예: "깔끔한 + 신뢰감 + 데이터 중심")

#### Color Track

- [ ] 토큰 시스템의 Primary 색상을 프로젝트에 맞게 오버라이드했는가
- [ ] `_project-overrides.scss`에 프로젝트 색상을 정의했는가
- [ ] 색상 대비 4.5:1 (WCAG AA)을 검증했는가
- [ ] 시맨틱 컬러(danger/warning/success/info)를 그대로 사용하는가, 조정이 필요한가
- [ ] Dark Mode가 필요한 제품인가 (BigData, inPOS 등)

#### Layout Track

- [ ] 주요 페이지의 와이어프레임을 그렸는가
- [ ] 그리드 시스템(12컬럼)을 기본으로 사용하는가, 커스텀이 필요한가
- [ ] 반응형 브레이크포인트(모바일/태블릿/PC)별 레이아웃을 설계했는가
- [ ] 정보 밀도를 결정했는가 (고밀도 대시보드 vs 여유 있는 마케팅)
- [ ] 네비게이션 패턴을 결정했는가 (사이드바/탑바/탭)

#### Typography Track

- [ ] 제품 UI는 `PretendardGOV` + `JetBrains Mono` 기본 조합을 사용하는가
- [ ] 랜딩/마케팅이라면 디스플레이 폰트를 선정했는가
- [ ] 폰트 크기 스케일이 토큰과 일치하는가 (xs~2xl)
- [ ] line-height를 콘텐츠 유형에 맞게 설정했는가 (tight/base/loose)
- [ ] 웹폰트 로딩 전략을 결정했는가 (font-display: swap)

### 디자인 씽킹 4항목

코드를 작성하기 전에 아래 4가지를 반드시 명확히 한다.

| 항목 | 질문 |
|------|------|
| **목적** | 이 인터페이스가 해결하는 문제는? 사용자는 누구인가? |
| **톤/미학** | 어떤 미학 방향인가? (미니멀, 맥시멀, 레트로퓨처, 유기적, 럭셔리 등) |
| **기술 제약** | 프레임워크, 성능, 접근성 요구사항은? |
| **차별화** | 사용자가 기억할 **단 하나**의 포인트는 무엇인가? |

## 미학 원칙 5가지

### 1. 타이포그래피 개성

- 독특하고 아름다운 폰트를 선택한다. generic 폰트를 기본값으로 사용하지 않는다
- 디스플레이 + 본문 페어링: 개성 있는 디스플레이 폰트와 가독성 높은 본문 폰트를 조합한다
- **인포마인드 제품 UI**: `PretendardGOV` + `JetBrains Mono`는 제품 UI의 표준이다. 랜딩/마케팅 페이지에서는 맥락에 맞는 디스플레이 폰트를 추가할 수 있다
- **한국어 줄바꿈**: 모든 한국어 텍스트 블록에 `word-break: keep-all; overflow-wrap: break-word;` 적용하라. 단어 중간 줄바꿈은 가독성을 크게 해친다
- **한국어 행간**: `line-height: 1`(leading-none) 사용 금지. 한국어는 라틴보다 글자 높이가 커서 최소 `--leading-tight`(1.2) 이상이 필요하다

### 2. 색상 의도성

- 일관된 미학을 유지한다. CSS 변수를 사용해 통일감을 확보한다
- **지배적 색상 + 날카로운 악센트**: 하나의 주조색에 강한 포인트 색을 더하는 전략이 효과적이다
- **인포마인드 제품 UI**: 토큰 팔레트를 우선 사용한다. 랜딩 페이지에서는 토큰 기반으로 확장된 색상 표현이 가능하다

### 3. 모션 집중

- CSS 기반 애니메이션을 우선한다
- **고임팩트 순간에 집중**: 잘 설계된 페이지 로드 시퀀스(스태거드 리빌)가 흩어진 마이크로인터랙션보다 효과적이다
- 스크롤 트리거 애니메이션과 예상치 못한 호버 효과로 인터랙션에 놀라움을 더한다

### 4. 비대칭 레이아웃

- 좌우 대칭에 안주하지 않는다
- 오버랩 & 대각선 흐름: 요소 간 겹침, 대각선 방향성으로 시각적 긴장감을 만든다
- 그리드 브레이킹: 일부 요소를 의도적으로 그리드 밖에 배치한다
- 여백 활용: 넉넉한 네거티브 스페이스 또는 통제된 밀도 -- 둘 다 유효하다

### 5. 배경 깊이

단색 배경을 기본으로 사용하지 않는다. 분위기와 깊이감을 만든다.

- 그라디언트 메시 / 미묘한 그라디언트
- 노이즈 텍스처 / 그레인 오버레이
- 기하학 패턴 / 장식적 보더
- 레이어 투명도 / 드라마틱한 그림자
- 커스텀 커서 등 맥락적 효과

## INFOMIND 제품별 UI 스타일 매핑

| 제품/프로젝트 | 권장 스타일 | 색상 방향 | 레이아웃 특성 | 금지 스타일 |
|-------------|------------|----------|-------------|------------|
| **inCMSv3** | Flat + Minimalism + Glassmorphism(모달) | Primary Blue(`--color-primary`) + 넓은 White 여백 | 사이드바 네비게이션, 12컬럼 컨텐츠 그리드 | Brutalism, Claymorphism, Cyberpunk |
| **inPOS** | Flat + Dark Mode(선택) | 고대비 Dark(`#1a1a2e`) + Accent Green | 고밀도 POS 레이아웃, 큰 터치 타겟(48px+) | 과도한 Motion-Driven |
| **in_S / inSWING** | Minimalism + Flat | Primary Blue 계열, 깔끔한 Gray 스케일 | 탑바 네비게이션, 폼 중심 레이아웃 | Neubrutalism, Y2K |
| **BigData 플랫폼** | Data-Dense + Dark Mode + Glassmorphism | Dark Navy(`#0d1117`) + Cyan/Green 데이터 강조 | 다중 패널 대시보드, 차트 그리드 3~4열 | Organic Biophilic, Claymorphism |
| **SmartFarm** | Organic Biophilic + Minimalism | Green 계열(`#228738`) + Earth tone 보조 | 카드 기반 모니터링, 지도 중심 레이아웃 | Cyberpunk, HUD |
| **면세 플랫폼** | Glassmorphism + Feature-Rich Showcase | Luxury Gold(`#b8860b`) + 깊은 Navy 배경 | 상품 그리드, 풀스크린 히어로 | Brutalism |
| **랜딩/마케팅** | Aurora UI + Hero-Centric + Storytelling | 프로젝트별 자유, 그라디언트 적극 활용 | 풀스크린 섹션, 스크롤 스토리텔링 | (제약 없음, 맥락 우선) |
| **WEB/SI** | Flat + Minimalism | 기관 CI 색상 기반, 토큰 오버라이드 | 공공 웹 표준 레이아웃, 본문 건너뛰기 필수 | 감성/트렌드 스타일 (클라이언트 확인 후) |

### 제품별 SCSS 오버라이드 예시

```scss
// _project-overrides.scss -- BigData 플랫폼
:root {
  --color-primary: #00b4d8;
  --color-primary-light: #48cae4;
  --color-primary-dark: #0077b6;
  --color-bg: #0d1117;
  --color-bg-secondary: #161b22;
  --color-text: #e6edf3;
  --color-text-secondary: #8b949e;
  --color-border: #30363d;
  --color-border-light: #21262d;
}

// _project-overrides.scss -- SmartFarm
:root {
  --color-primary: #228738;
  --color-primary-light: #4caf50;
  --color-primary-dark: #1b5e20;
  --color-bg: #fafdf7;
  --color-bg-secondary: #f0f7f0;
}
```

### 주요 스타일 설명

| 스타일 | 특징 |
|--------|------|
| **Flat Design** | 그림자 없음, 솔리드 컬러. 깊이감 부재는 타이포로 보완 |
| **Minimalism** | 여백, 그리드, 타이포 중심. 지루해지지 않도록 타이포 강조 |
| **Glassmorphism** | `backdrop-filter: blur`, 반투명 레이어. 저사양 기기 성능 고려 |
| **Dark Mode (OLED)** | 순수 검정(#000), 고대비. 라이트 모드 대응 병행 필수 |
| **Data-Dense Dashboard** | 정보 압축, 고밀도 레이아웃. 실시간 모니터링에 적합 |
| **Aurora UI** | 흐르는 그라디언트, 빛 번짐. 랜딩/마케팅 전용 |
| **Organic Biophilic** | 자연 형태, 둥근 모서리. 환경/지속가능성 제품에 적합 |

### 인포마인드 디자인 시스템 연계

**제품 UI** (inPOS, in_S, inCMS 등):
- 토큰 시스템을 그대로 적용한다
- 폰트: `PretendardGOV` + `JetBrains Mono`
- 이 가이드의 미학 원칙은 레이아웃, 모션, 공간 활용에서 참고한다

**랜딩/마케팅/프로모션 페이지**:
- 토큰 시스템을 기반으로 하되 독창적 미학을 얹는다
- 디스플레이 폰트 추가, 확장 색상 팔레트, 대담한 레이아웃 등 자유도가 높다
- 5가지 미학 원칙을 적극 활용한다
