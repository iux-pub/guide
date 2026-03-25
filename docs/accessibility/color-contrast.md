# 색상 대비 가이드

> 토큰값 기준: `src/scss/1-settings/_tokens-color.scss`

## WCAG 2.1 AA 대비 기준

| 대상 | 최소 대비 비율 | 기준 |
|------|--------------|------|
| 일반 텍스트 | 4.5:1 이상 | 18px 미만 일반 두께 텍스트 |
| 대형 텍스트 | 3:1 이상 | 18px 이상 또는 14px bold 이상 |
| 비텍스트 UI (보더, 아이콘 등) | 3:1 이상 | 인접 배경과의 대비 |

**대형 텍스트 기준 (이 프로젝트 토큰):**
- `var(--font-size-md)` (2rem = 20px) 이상이면 대형 텍스트
- `var(--font-size-sm)` (1.4rem = 14px) + `var(--font-weight-bold)` (700) 이상이면 대형 텍스트
- `var(--font-size-base)` (1.6rem = 16px) 일반 두께는 일반 텍스트 기준 적용

## 프로젝트 토큰 대비 표

| # | 전경 토큰 | 전경 값 | 배경 토큰 | 배경 값 | 대비 비율 | AA 일반 | AA 대형 |
|---|----------|--------|----------|--------|-----------|---------|---------|
| 1 | `--color-text` | #1e2124 | `--color-bg` | #fff | 16.2:1 | PASS | PASS |
| 2 | `--color-text-secondary` | #666 | `--color-bg` | #fff | 5.7:1 | PASS | PASS |
| 3 | `--color-text-disabled` | #999 | `--color-bg` | #fff | 2.8:1 | FAIL | FAIL |
| 4 | `--color-white` | #fff | `--color-primary` | #256ef4 | 4.6:1 | PASS | PASS |
| 5 | `--color-white` | #fff | `--color-primary-dark` | #083891 | 10.6:1 | PASS | PASS |
| 6 | `--color-white` | #fff | `--color-primary-light` | #6a9df7 | 2.7:1 | FAIL | FAIL |
| 7 | `--color-danger` | #de3412 | `--color-bg` | #fff | 4.6:1 | PASS | PASS |
| 8 | `--color-warning` | #c78500 | `--color-bg` | #fff | 3.1:1 | FAIL | PASS |
| 9 | `--color-success` | #228738 | `--color-bg` | #fff | 4.6:1 | PASS | PASS |
| 10 | `--color-info` | #0b78cb | `--color-bg` | #fff | 4.6:1 | PASS | PASS |
| 11 | `--color-gray-900` | #222 | `--color-bg-secondary` | #f8f8f8 | 15.0:1 | PASS | PASS |
| 12 | `--color-gray-700` | #555 | `--color-bg` | #fff | 7.5:1 | PASS | PASS |
| 13 | `--color-gray-800` | #333 | `--color-bg` | #fff | 12.6:1 | PASS | PASS |
| 14 | `--color-gray-400` | #b1b8be | `--color-bg` | #fff | 2.0:1 | FAIL | FAIL |
| 15 | `--color-gray-300` | #ccc | `--color-bg` | #fff | 1.6:1 | FAIL | FAIL |
| 16 | `--color-text` | #1e2124 | `--color-gray-100` | #efefef | 14.1:1 | PASS | PASS |
| 17 | `--color-text` | #1e2124 | `--color-bg-secondary` | #f8f8f8 | 15.2:1 | PASS | PASS |
| 18 | `--color-primary` | #256ef4 | `--color-bg` | #fff | 4.6:1 | PASS | PASS |
| 19 | `--color-black` | #000 | `--color-bg` | #fff | 21.0:1 | PASS | PASS |

## FAIL 항목 사용 가이드

| 조합 | 대비 비율 | 허용 범위 | 대안 |
|------|-----------|----------|------|
| `--color-text-disabled` (#999) / `--color-bg` (#fff) | 2.8:1 | disabled 상태 전용 (WCAG 예외: 비활성 UI는 대비 요건 면제) | 없음 (의도된 비활성 표현) |
| `--color-white` (#fff) / `--color-primary-light` (#6a9df7) | 2.7:1 | 장식적 배경만 허용, 텍스트 배치 금지 | `--color-primary` (#256ef4) 배경 사용 |
| `--color-warning` (#c78500) / `--color-bg` (#fff) | 3.1:1 | 대형 텍스트(18px+, 14px bold+)만 허용 | 아이콘 + 텍스트 조합 권장, 또는 더 어두운 경고색 사용 |
| `--color-gray-400` (#b1b8be) / `--color-bg` (#fff) | 2.0:1 | 장식용 보더만 허용, 텍스트 불가 | 텍스트에는 `--color-gray-700` (#555) 이상 사용 |
| `--color-gray-300` (#ccc) / `--color-bg` (#fff) | 1.6:1 | 구분선(divider)만 허용, 텍스트 불가 | 텍스트에는 `--color-gray-700` (#555) 이상 사용 |

### FAIL 조합의 WCAG 예외 근거

- **비활성 UI 요소:** WCAG 2.1 SC 1.4.3에서 "비활성 사용자 인터페이스 구성요소"는 대비 요건에서 제외된다. `--color-text-disabled`는 이 예외에 해당한다.
- **장식적 요소:** 정보 전달 목적이 아닌 순수 장식(배경 그라데이션, 구분선 등)은 대비 요건 대상이 아니다.
- **대형 텍스트:** 3:1 이상이면 PASS. `--color-warning`은 대형 텍스트에만 사용 시 적합하다.

## 색상 선택 원칙

### 텍스트 색상 안전 조합 (흰색 배경 기준)

| 용도 | 안전한 토큰 | 대비 비율 |
|------|-----------|-----------|
| 본문 텍스트 | `--color-text` (#1e2124) | 16.2:1 |
| 보조 텍스트 | `--color-text-secondary` (#666) | 5.7:1 |
| 강조 텍스트 | `--color-primary` (#256ef4) | 4.6:1 |
| 제목 텍스트 | `--color-gray-900` (#222) | 15.4:1 |
| 부제목 텍스트 | `--color-gray-800` (#333) | 12.6:1 |
| 캡션/소텍스트 | `--color-gray-700` (#555) | 7.5:1 |

### 배경색 + 텍스트 조합 규칙

1. **흰색 배경 (`--color-bg`):** `--color-gray-700` (#555) 이상 어두운 색상만 텍스트로 사용
2. **연한 배경 (`--color-bg-secondary`, `--color-gray-100`):** `--color-text` (#1e2124) 사용 권장 (14:1 이상)
3. **색상 배경 (`--color-primary` 등):** 흰색 텍스트 사용 시 배경 대비 4.6:1 확인
4. **어두운 배경 (`--color-primary-dark`):** 흰색 텍스트 안전 (10.6:1)

## 대비 확인 도구

| 도구 | URL | 특징 |
|------|-----|------|
| WebAIM Contrast Checker | https://webaim.org/resources/contrastchecker/ | 가장 널리 사용. 전경/배경 색상 입력 시 즉시 PASS/FAIL 판정 |
| APCA Contrast Calculator | https://www.myndex.com/APCA/ | WCAG 3.0 초안 기준 (APCA 알고리즘). 글자 크기별 세밀한 판정 |
| Chrome DevTools 접근성 패널 | 브라우저 내장 | 요소 검사 시 색상 대비 비율 표시. 가장 빠른 확인 방법 |
| Figma Contrast Plugin | 피그마 플러그인 | 디자인 단계에서 대비 확인. "Stark" 또는 "A11y - Color Contrast Checker" |
| axe DevTools 확장 | 브라우저 확장 | 페이지 전체 대비 문제를 자동 스캔 |

## 대비 실패 시 대안 색상 찾기

### 단계별 방법

**1단계: 같은 색조(Hue)에서 명도(Lightness) 조절**

색상의 느낌을 유지하면서 대비를 높이려면 HSL 모델에서 L(명도) 값만 조절한다.

예시: `--color-warning` (#c78500) 대비 부족 시
- 원본: HSL(38, 100%, 39%) -> 대비 3.1:1
- 조절: HSL(38, 100%, 33%) -> 대비 약 4.5:1
- 결과: #a86e00 (더 어두운 경고색)

**2단계: 도구로 최소 4.5:1 확인**

WebAIM Contrast Checker에서 조절한 색상과 배경색을 입력하여 4.5:1 이상인지 확인한다.

**3단계: 토큰 변수로 적용**

확인된 색상을 프로젝트 오버라이드 파일(`_project-overrides.scss`)에서 토큰을 재정의한다.

```scss
// _project-overrides.scss
:root {
  // warning 색상 대비 보강 (기본 #c78500 -> #a86e00)
  --color-warning: #a86e00;
}
```

### 빠른 참조: 최소 대비를 충족하는 밝기 한계

흰색 배경(#fff) 기준, 4.5:1을 충족하는 가장 밝은 회색:
- **#767676** (4.54:1) -- 흰색 배경에서 일반 텍스트에 사용 가능한 가장 밝은 회색

## 관련 KWCAG 항목

| 항목 번호 | 항목명 | 확인 방법 |
|-----------|--------|----------|
| 5.4.3 | 텍스트 콘텐츠의 명도 대비 | 모든 텍스트-배경 조합이 위 대비 표의 PASS 항목에 해당하는지 확인 |
| 5.4.1 | 색에 무관한 콘텐츠 인식 | 색상만으로 정보를 전달하지 않는지 확인 (에러=빨강만, 성공=초록만 금지) |
