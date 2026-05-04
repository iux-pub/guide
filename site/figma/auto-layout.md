---
title: Auto Layout 규칙
order: 5
---

피그마 Auto Layout의 패딩·갭 값을 KRDS 토큰 스케일에 맞춰 사용하는 규칙. 토큰 스케일을 준수하면 퍼블리싱에서 CSS Custom Properties로 1:1 변환되어 일관된 간격을 유지할 수 있다.

## 패딩·갭 토큰 매핑 (KRDS + INFOMIND)

KRDS는 정량 스케일(`--krds-padding-1` ~ `--krds-padding-8`, `--krds-gap-1` ~ `--krds-gap-6`)을 발행한다. INFOMIND 시맨틱 별칭(`--spacing-N`, N=4px 단위)도 사용 가능하다.

| 피그마 px | KRDS 정본 | INFOMIND 시맨틱 별칭 | 권장 용도 |
|-----------|----------|--------------------|----------|
| 2px | `--krds-gap-1` | `--spacing-0_5` | 아이콘 정렬 보정 |
| 4px | `--krds-padding-1` | `--spacing-1` | 최소 간격, 아이콘-텍스트 사이 |
| 8px | `--krds-padding-3` | `--spacing-2` | 작은 간격, 인라인 요소 사이 |
| 10px | `--krds-padding-4` | — | 버튼 xsmall padding-x |
| 12px | `--krds-padding-5` | `--spacing-3` | 버튼 small padding-x · 라벨-입력 간격 |
| 16px | `--krds-padding-6` | `--spacing-4` | 기본 간격, 카드 내부 패딩 |
| 20px | `--krds-padding-7` | `--spacing-5` | 버튼 large padding-x |
| 24px | `--krds-padding-8` | `--spacing-6` | 컨테이너 내부, 섹션 내부 |
| 32px | (KRDS 스케일 외) | `--spacing-8` | 섹션 간 간격 (모바일) |
| 48px | (KRDS 스케일 외) | `--spacing-12` | 큰 섹션 간격 |
| 64px | (KRDS 스케일 외) | `--spacing-16` | 페이지 상하 여백 (PC) |

**금지:** KRDS 스케일에 없는 값(예: 5px, 7px, 11px, 14px, 22px). 가장 가까운 토큰 값을 선택한다.

## 컴포넌트별 Auto Layout 패턴 (KRDS 정의)

### 버튼 (Button)

KRDS 정의 — 5 size × 4 variant.

| Size | Height | Horizontal padding | Item spacing | Border radius |
|------|--------|--------------------|--------------|---------------|
| xsmall | 32px (`--krds-size-height-5`) | 10px (`--krds-padding-4`) | 2px | `--krds-radius-small3` (4px) |
| small | 40px (`--krds-size-height-6`) | 12px (`--krds-padding-5`) | 2px | `--krds-radius-medium1` (6px) |
| **medium (기본)** | **48px (`--krds-size-height-7`)** | **16px (`--krds-padding-6`)** | **4px** | `--krds-radius-medium2` (6px) |
| large | 56px (`--krds-size-height-8`) | 20px (`--krds-padding-7`) | 4px | `--krds-radius-medium3` (8px) |
| xlarge | 64px (`--krds-size-height-9`) | 24px (`--krds-padding-8`) | 4px | `--krds-radius-medium4` (8px) |

> 모바일 컨텍스트는 medium(48) 이상 사용. xsmall(32)·small(40)은 데스크탑 dense UI 한정.

### 카드 (Card)

| 속성 | 값 | 토큰 |
|------|----|------|
| Padding (전체) | 16px | `--krds-padding-6` (`--spacing-4`) |
| Header-Body 간격 | 16px | `--krds-padding-6` |
| Body-Footer 간격 | 16px | `--krds-padding-6` |
| Direction | Vertical | — |

### 폼 그룹 (Form Group)

| 속성 | 값 | 토큰 |
|------|----|------|
| Label-Input 간격 | 8px | `--krds-padding-3` (`--spacing-2`) |
| Input 내부 padding-x | 16px | `--krds-padding-6` |
| Input 내부 padding-y | 8px | `--krds-padding-3` |
| Form Group 간 간격 | 24px | `--krds-padding-8` (`--spacing-6`) |

### 네비게이션 (Navigation)

| 속성 | 값 | 토큰 |
|------|----|------|
| Item spacing | 8px | `--krds-padding-3` |
| Item padding | 8px 16px | `--krds-padding-3` / `--krds-padding-6` |
| Direction | Horizontal | — |

### 리스트 (List)

| 속성 | 값 | 토큰 |
|------|----|------|
| Item spacing | 8px | `--krds-padding-3` |
| Item padding | 16px | `--krds-padding-6` |
| Direction | Vertical | — |

## 반응형 Auto Layout 동작

### 컨테이너 패딩

| 해상도 | 좌우 패딩 | 토큰 |
|--------|----------|------|
| Mobile (0~767) | 16px | `--krds-padding-6` (`--spacing-4`) |
| Tablet (768~1279) | 24px | `--krds-padding-8` (`--spacing-6`) |
| PC (1280~) | 40px | `--spacing-10` 또는 자동 마진 |

### 그리드 거터

| 해상도 | 거터 값 | 토큰 |
|--------|--------|------|
| Mobile | 16px | `--krds-gap-5` |
| Tablet+ | 24px | `--krds-gap-6` |

### 섹션 간격

| 해상도 | 섹션 간 간격 | 토큰 |
|--------|------------|------|
| Mobile | 32px | `--spacing-8` |
| Tablet | 48px | `--spacing-12` |
| PC | 64px | `--spacing-16` |

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

- [ ] 모든 Padding 값이 KRDS 스케일(2/4/8/10/12/16/20/24px)에 해당하는가
- [ ] 모든 Gap(Item spacing) 값이 KRDS 스케일에 해당하는가
- [ ] 5px, 7px, 11px, 14px, 22px 같은 비-KRDS 값 0건
- [ ] 버튼이 KRDS 5 size 안에 매핑되는가
- [ ] 모바일 변형이 medium(48) 이상 사용하는가
- [ ] 반응형 변형(Mobile/Tablet/PC)에서 간격이 토큰 규칙에 맞는가
- [ ] Resizing 설정이 의도한 레이아웃 동작과 일치하는가

## 관련 문서

- [간격 토큰](/tokens/spacing/) -- KRDS padding/gap/size-height 스케일
- [그리드 토큰](/tokens/grid/) -- KRDS 표준 그리드와 컨테이너 규격
- [Variable 네이밍](/figma/variables/) -- 피그마 Variable과 KRDS 토큰 매핑
