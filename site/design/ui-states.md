---
title: UI 상태 패턴
order: 5
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

## 관련 문서

- [마이크로카피](/design/microcopy/) -- 에러 메시지, 빈 상태 카피 작성 기준
- [인터랙션 타이밍](/design/interaction-timing/) -- 상태 전환 모션 명세
- [디자인 감사 - 상태](/design/design-audit/) -- 감사 체크리스트 11번
- [폼 컴포넌트](/components/form/) -- 폼 HTML/SCSS 스니펫
