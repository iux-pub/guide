---
title: Auto Layout 규칙
order: 5
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

## 관련 문서

- [간격 토큰](/tokens/spacing/) -- CSS Custom Properties 간격 정의
- [그리드 토큰](/tokens/grid/) -- 그리드 시스템과 컨테이너 규격
- [Variable 네이밍](/figma/variables/) -- 피그마 Variable과 CSS 매핑
