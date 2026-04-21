---
title: 디자인 AI 프롬프트
order: 2
---

## 대상 AI 도구

Google Stitch, Galileo, Lovable, v0

## 사용법

아래 내용을 복사하여 AI 도구의 시스템 프롬프트(또는 첫 메시지)에 붙여넣는다.

## 프롬프트

````markdown
# 디자인 AI 프롬프트

> **목적:** 디자인 AI 도구에서 인포마인드 UX팀 디자인 시스템 규칙을 적용하기 위한 프롬프트
> **대상 AI:** Google Stitch, Galileo, Lovable, v0

---

## 색상 토큰

### Primary (프로젝트별 오버라이드 가능)

| 토큰 | 값 | 용도 |
|----|----|----|
| `--color-primary` | #256ef4 | 기본 브랜드 색상 |
| `--color-primary-light` | #6a9df7 | 밝은 브랜드 색상 |
| `--color-primary-dark` | #083891 | 어두운 브랜드 색상 |
| `--color-primary-alpha-8` | color-mix(in srgb, var(--color-primary) 8%, transparent) | 기본 브랜드 색상 |
| `--color-primary-alpha-6` | color-mix(in srgb, var(--color-primary) 6%, transparent) | 기본 브랜드 색상 |

### Gray 스케일

| 토큰 | 값 |
|----|----|
| `--color-gray-900` | #222 |
| `--color-gray-800` | #333 |
| `--color-gray-700` | #555 |
| `--color-gray-600` | #666 |
| `--color-gray-500` | #999 |
| `--color-gray-400` | #b1b8be |
| `--color-gray-300` | #ccc |
| `--color-gray-200` | #ddd |
| `--color-gray-100` | #efefef |
| `--color-gray-50` | #f8f8f8 |

### Semantic (KRDS 기준)

| 토큰 | 값 | 용도 |
|----|----|----|
| `--color-danger` | #de3412 | 에러, 삭제 |
| `--color-warning` | #c78500 | 경고 |
| `--color-success` | #228738 | 성공, 완료 |
| `--color-info` | #0b78cb | 정보 |

### Text

| 토큰 | 값 | 용도 |
|----|----|----|
| `--color-text` | #1e2124 | 본문 텍스트 |
| `--color-text-secondary` | #666 | 보조 텍스트 |
| `--color-text-disabled` | #999 | 비활성 텍스트 |

### Background

| 토큰 | 값 | 용도 |
|----|----|----|
| `--color-bg` | #fff | 기본 배경 |
| `--color-bg-secondary` | #f8f8f8 | 보조 배경 |

### Border

| 토큰 | 값 | 용도 |
|----|----|----|
| `--color-border` | #ccc | 기본 테두리 |
| `--color-border-light` | #efefef | 밝은 테두리 |

### 기본

| 토큰 | 값 |
|----|----|
| `--color-white` | #fff |
| `--color-black` | #000 |

---

## 타이포그래피 토큰

### 폰트

- 기본 폰트: `'Pretendard GOV', 'Malgun Gothic', 'apple sd gothic neo', sans-serif`
- 62.5% REM 트릭 적용: `html { font-size: 62.5% }` -- 1rem = 10px

### 폰트 크기

| 토큰 | rem | px |
|----|----|----|
| `--font-size-2xl` | 3.2rem | 32px |
| `--font-size-xl` | 2.8rem | 28px |
| `--font-size-lg` | 2.4rem | 24px |
| `--font-size-md` | 2rem | 20px |
| `--font-size-base` | 1.6rem | 16px |
| `--font-size-sm` | 1.4rem | 14px |
| `--font-size-xs` | 1.2rem | 12px |

### 폰트 굵기

| 토큰 | 값 |
|----|----|
| `--font-weight-regular` | 400 |
| `--font-weight-medium` | 500 |
| `--font-weight-semibold` | 600 |
| `--font-weight-bold` | 700 |

### 줄 간격

| 토큰 | 값 |
|----|----|
| `--leading-tight` | 1.2 |
| `--leading-base` | 1.6 |
| `--leading-loose` | 1.8 |

---

## 간격 토큰

4px 기반 스케일. 이 스케일에 없는 값(5px, 10px, 15px, 20px, 30px)을 사용하지 않는다.

| 토큰 | px |
|----|----|
| `--spacing-xs` | 4px |
| `--spacing-sm` | 8px |
| `--spacing-md` | 16px |
| `--spacing-lg` | 24px |
| `--spacing-xl` | 32px |
| `--spacing-2xl` | 48px |
| `--spacing-3xl` | 64px |

---

## 기타 토큰

### Border Radius

| 토큰 | 값 |
|----|----|
| `--radius-sm` | 4px |
| `--radius-base` | 8px |
| `--radius-lg` | 12px |
| `--radius-xl` | 16px |
| `--radius-full` | 9999px |

### Box Shadow

| 토큰 | 값 |
|----|----|
| `--shadow-sm` | 0 1px 2px rgb(0 0 0 / 5%) |
| `--shadow-base` | 0 1px 3px rgb(0 0 0 / 10%), 0 1px 2px rgb(0 0 0 / 6%) |
| `--shadow-lg` | 0 10px 15px rgb(0 0 0 / 10%), 0 4px 6px rgb(0 0 0 / 5%) |

---

## 브레이크포인트

| 해상도 | 범위 | 기본 시안 너비 |
|----|----|----|
| 모바일 | 0 ~ 767px | 360px |
| 태블릿 | 768px ~ 1279px | 768px |
| PC | 1280px ~ | 1920px (콘텐츠 max-width: 1200px) |

### 그리드

| 해상도 | 컬럼 | 거터 | 좌우 여백 |
|----|----|----|----------|
| 모바일 | 4 | 16px | 16px |
| 태블릿 | 12 | 24px | 24px |
| PC | 12 | 24px | 40px (max-width: 1200px) |

---

## 컴포넌트 구조

### 버튼 (btn)

```
.btn--primary           -- 주요 동작 (제출, 저장)
.btn--secondary         -- 보조 동작
.btn--outline           -- 테두리만, 덜 강조
.btn--text              -- 배경/테두리 없음
.btn--ghost             -- 투명, 호버 시 배경 표시
.btn--link              -- 링크 스타일 (밑줄)
.btn--sm                -- 높이 32px (min-height: 4.4rem으로 터치 영역 44px 보장), `--font-size-sm`
.btn--lg                -- 높이 48px, `--font-size-md`
:disabled 속성            -- `opacity: 0.5`, `cursor: not-allowed`
```

### 폼 (form)

```
.form__group            -- label + input 래퍼
.form__label            -- 입력 필드 레이블 (폰트 16px, `--font-size-base`)
.form__label--required  -- 필수 항목 표시 (* 추가)
.form__input            -- 텍스트, 이메일, 패스워드 등
.form__select           -- 드롭다운 선택
.form__textarea         -- 여러 줄 입력
.form__checkbox         -- 체크박스 + 레이블 래퍼
.form__checkbox-input   -- 체크박스 입력
.form__checkbox-label   -- 체크박스 텍스트
.form__radio            -- 라디오 + 레이블 래퍼
.form__radio-input      -- 라디오 입력
.form__radio-label      -- 라디오 텍스트
.form__help             -- 입력 안내 텍스트
.form__input--error     -- 빨간 테두리
.form__message--error   -- 빨간 에러 텍스트
.form__input--success   -- 초록 테두리
.form__message--success -- 초록 성공 텍스트
:disabled 속성            -- 비활성 스타일
.form--inline           -- tablet-up에서 가로 배치
```

### 카드 (card)

```
.card                   -- 세로 레이아웃 (header/body/footer)
.card--horizontal       -- tablet-up에서 이미지 좌측 + 콘텐츠 우측
.card--image            -- 상단 이미지 + 콘텐츠
.card--featured         -- accent 테두리 강조 (2px primary)
.card__header           -- 상단 영역
.card__title            -- 제목
.card__body             -- 본문 영역
.card__text             -- 본문 텍스트
.card__footer           -- 하단 영역 (액션 버튼 등)
.card__media            -- 미디어(이미지) 래퍼
.card__image            -- 이미지 요소
```

### 테이블 (table)

```
.table                  -- 시맨틱 테이블 (caption + thead + tbody)
.table--striped         -- 짝수 행 배경색 (가독성 향상)
.table--bordered        -- 모든 셀 테두리
.table__wrapper         -- 모바일 가로 스크롤
.table__head            -- thead 스타일
.table__th              -- th 스타일 (bold, nowrap)
.table__body            -- tbody 스타일
.table__row             -- tr 스타일
.table__td              -- td 스타일
.table__empty           -- 데이터 없음 안내
```

### 모달 (modal)

```
.modal                  -- `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
.modal__overlay         -- 반투명 배경 (클릭 시 닫기)
.modal__container       -- 실제 대화상자 (모바일: 전체화면, tablet-up: max-width 56rem)
.modal__header          -- 제목 + 닫기 버튼
.modal__title           -- 모달 제목 (`aria-labelledby` 타겟)
.modal__body            -- 본문 콘텐츠
.modal__footer          -- 액션 버튼 영역
.modal__close           -- 닫기 버튼 (`aria-label="닫기"`) -- 44x44px 터치 타겟 보장
.modal--active          -- JS가 열 때 추가. 열림 애니메이션 트리거
```

### 탭 (tab)

```
.tab                    -- 탭 전체 래퍼
.tab__list              -- `role="tablist"`, 탭 버튼 목록 (모바일: 가로 스크롤)
.tab__button            -- `role="tab"`, 패딩 12px/20px (모바일), 반응형 확대
.tab__panel             -- `role="tabpanel"`, 탭 콘텐츠 영역
```

### 페이지네이션 (pagination)

```
.pagination             -- `<nav aria-label="페이지 네비게이션">`
.pagination__list       -- `<ul>` 목록
.pagination__item       -- `<li>` 항목
.pagination__item--mobile-hidden-- 모바일에서 숨김, tablet-up에서 표시
.pagination__link       -- `<a>` 페이지 링크 -- 최소 44x44px 터치 타겟
.pagination__link--current-- 현재 페이지 (primary 배경색)
.pagination__link--prev -- "이전" 버튼
.pagination__link--next -- "다음" 버튼
.pagination__link--disabled-- 첫/마지막 페이지에서 비활성
```

### 브레드크럼 (breadcrumb)

```
.breadcrumb             -- `<nav aria-label="현재 위치">`
.breadcrumb__list       -- `<ol>` 순서 있는 목록
.breadcrumb__item       -- `<li>` 항목
.breadcrumb__item--mobile-hidden-- 모바일에서 숨김, tablet-up에서 표시
.breadcrumb__link       -- 이전 페이지 링크
.breadcrumb__current    -- 현재 위치 (링크 아님, 텍스트)
CSS ::before            -- `/` 구분자 (스크린리더 자동 무시)
```

---

## 접근성 핵심 규칙

1. **색상 대비:** 일반 텍스트 4.5:1 이상, 큰 텍스트(24px/18px bold) 3:1 이상을 유지하라
2. **터치 영역:** 모든 인터랙티브 요소의 최소 터치 영역은 44px x 44px을 보장하라
3. **포커스 표시:** `focus-visible` 스타일을 제공하라 -- `outline: 2px solid var(--color-primary); outline-offset: 2px`
4. **건너뛰기 링크:** 페이지 최상단에 `<a href="#main-content" class="skip-to-content">본문 바로가기</a>`를 제공하라
5. **대체 텍스트:** 이미지에 `alt` 속성을 필수로 제공하라. 장식용은 `alt=""`을 사용하라
6. **레이블:** 인터랙티브 요소에 `aria-label` 또는 텍스트 레이블을 필수로 제공하라
````
