---
title: "피그마→코드 핸드오프"
order: 3
---

디자이너가 피그마에서 작업한 시안을 퍼블리셔에게 전달할 때의 규칙을 정의한다. 컴포넌트 네이밍 매핑, 토큰 연결, 전달 항목 체크리스트를 통해 핸드오프 과정을 표준화한다.

## 피그마 컴포넌트 ↔ BEM 클래스 매핑

피그마에서 사용하는 컴포넌트 이름과 퍼블리싱에서 사용하는 BEM 클래스의 매핑 테이블이다.

### 버튼

| Figma 컴포넌트 | BEM 클래스 | 비고 |
|----------------|-----------|------|
| Button/Primary | `.btn.btn--primary` | Primary 버튼 |
| Button/Secondary | `.btn.btn--secondary` | Secondary 버튼 |
| Button/Outline | `.btn.btn--outline` | 아웃라인 버튼 |
| Button/Text | `.btn.btn--text` | 텍스트 버튼 |
| Button/Primary/Small | `.btn.btn--primary.btn--sm` | 작은 버튼 |
| Button/Primary/Large | `.btn.btn--primary.btn--lg` | 큰 버튼 |

### 카드

| Figma 컴포넌트 | BEM 클래스 | 비고 |
|----------------|-----------|------|
| Card | `.card` | 카드 컴포넌트 |
| Card/Featured | `.card.card--featured` | 강조 카드 |

### 폼

| Figma 컴포넌트 | BEM 클래스 | 비고 |
|----------------|-----------|------|
| Form/Input | `.form__input` | 입력 필드 |
| Form/Select | `.form__select` | 선택 필드 |
| Form/Checkbox | `.form__checkbox` | 체크박스 |
| Form/Radio | `.form__radio` | 라디오 버튼 |
| Form/Input/Error | `.form__input.form__input--error` | 에러 상태 |

### 테이블

| Figma 컴포넌트 | BEM 클래스 | 비고 |
|----------------|-----------|------|
| Table | `.table` | 테이블 |
| Table/Striped | `.table.table--striped` | 스트라이프 테이블 |

### 기타 컴포넌트

| Figma 컴포넌트 | BEM 클래스 | 비고 |
|----------------|-----------|------|
| Modal | `.modal` | 모달 |
| Tab | `.tab` | 탭 |
| Pagination | `.pagination` | 페이지네이션 |
| Breadcrumb | `.breadcrumb` | 브레드크럼 |

## 피그마 Variable ↔ CSS Custom Property 매핑

피그마에서 정의한 Variable과 코드에서 사용하는 CSS Custom Property의 매핑이다.

### 색상

| Figma Variable | CSS Custom Property | 용도 |
|----------------|---------------------|------|
| Primary | `--color-primary` | 기본 브랜드 색상 |
| Primary/Light | `--color-primary-light` | 밝은 브랜드 색상 |
| Primary/Dark | `--color-primary-dark` | 어두운 브랜드 색상 |
| Gray/900 | `--color-gray-900` | 가장 어두운 회색 |
| Gray/800 | `--color-gray-800` | 본문 텍스트 |
| Gray/700 | `--color-gray-700` | 보조 텍스트 |
| Gray/500 | `--color-gray-500` | 비활성 텍스트 |
| Gray/300 | `--color-gray-300` | 테두리 |
| Gray/100 | `--color-gray-100` | 배경 강조 |
| Danger | `--color-danger` | 에러, 삭제 |
| Warning | `--color-warning` | 경고 |
| Success | `--color-success` | 성공, 완료 |
| Info | `--color-info` | 정보, 안내 |

### 간격

| Figma Variable | CSS Custom Property | 값 |
|----------------|---------------------|------|
| Spacing/XS | `--spacing-xs` | 0.4rem (4px) |
| Spacing/SM | `--spacing-sm` | 0.8rem (8px) |
| Spacing/MD | `--spacing-md` | 1.6rem (16px) |
| Spacing/LG | `--spacing-lg` | 2.4rem (24px) |
| Spacing/XL | `--spacing-xl` | 3.2rem (32px) |
| Spacing/2XL | `--spacing-2xl` | 4.8rem (48px) |

### 타이포그래피

| Figma Variable | CSS Custom Property | 값 |
|----------------|---------------------|------|
| Font Size/Base | `--font-size-base` | 1.6rem (16px) |
| Font Size/SM | `--font-size-sm` | 1.4rem (14px) |
| Font Size/LG | `--font-size-lg` | 2.4rem (24px) |
| Font Size/XL | `--font-size-xl` | 2.8rem (28px) |
| Font Weight/Regular | `--font-weight-regular` | 400 |
| Font Weight/Bold | `--font-weight-bold` | 700 |

### 기타

| Figma Variable | CSS Custom Property | 값 |
|----------------|---------------------|------|
| Radius/Base | `--radius-base` | 8px |
| Radius/SM | `--radius-sm` | 4px |
| Radius/LG | `--radius-lg` | 12px |
| Shadow/Base | `--shadow-base` | 0 1px 3px rgba(0,0,0,0.1) |

## 핸드오프 전달 항목 체크리스트

디자이너가 퍼블리셔에게 시안을 전달할 때 다음 항목을 확인한다.

- [ ] **토큰 확인:** 사용된 색상이 정의된 토큰에 있는지 확인한다. 토큰에 없는 색상이 필요하면 팀과 협의한다.
- [ ] **컴포넌트 variant 명시:** 어떤 variant(modifier)를 사용하는지 시안에 표기한다. (예: Button/Primary, Card/Featured)
- [ ] **간격/정렬 기준:** 요소 간 간격이 토큰 스케일(xs~3xl)에 맞는지 확인한다. 임의의 간격 값을 사용하지 않는다.
- [ ] **타이포그래피:** 사용된 폰트 크기/굵기가 토큰에 정의된 값인지 확인한다. (예: Font Size/Base = 16px, Font Weight/Bold = 700)
- [ ] **반응형 브레이크포인트별 시안:** 모바일(~767px), 태블릿(768~1279px), PC(1280px~) 각각의 시안을 제공한다.
- [ ] **인터랙션 명세:** hover, focus, active, disabled 상태를 정의한다.
- [ ] **접근성 요구사항:** 대체 텍스트, 키보드 조작 방식, 포커스 순서를 명시한다.
- [ ] **새 컴포넌트 여부:** 기존 컴포넌트로 조합 가능한지, 신규 제작이 필요한지 판단하여 표기한다.

## 참고 문서

- [컴포넌트 개요](/components/) -- 사용 가능한 컴포넌트 목록
- [토큰 개요](/tokens/) -- 전체 토큰 목록과 값
- [BEM 네이밍](/conventions/bem/) -- BEM 네이밍 규칙 상세
- [접근성 개요](/accessibility/) -- 접근성 체크리스트와 가이드
