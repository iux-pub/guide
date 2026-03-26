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
|------|----|------|
| `--color-primary` | #256ef4 | 기본 브랜드 색상 |
| `--color-primary-light` | #6a9df7 | 밝은 브랜드 색상 |
| `--color-primary-dark` | #083891 | 어두운 브랜드 색상 |

### Gray 스케일

| 토큰 | 값 |
|------|----|
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
|------|----|------|
| `--color-danger` | #de3412 | 에러, 삭제 |
| `--color-warning` | #c78500 | 경고 |
| `--color-success` | #228738 | 성공, 완료 |
| `--color-info` | #0b78cb | 정보 |

### Text

| 토큰 | 값 | 용도 |
|------|----|------|
| `--color-text` | #1e2124 | 본문 텍스트 |
| `--color-text-secondary` | #666 | 보조 텍스트 |
| `--color-text-disabled` | #999 | 비활성 텍스트 |

### Background

| 토큰 | 값 | 용도 |
|------|----|------|
| `--color-bg` | #fff | 기본 배경 |
| `--color-bg-secondary` | #f8f8f8 | 보조 배경 |

### Border

| 토큰 | 값 | 용도 |
|------|----|------|
| `--color-border` | #ccc | 기본 테두리 |
| `--color-border-light` | #efefef | 밝은 테두리 |

### 기본

| 토큰 | 값 |
|------|----|
| `--color-white` | #fff |
| `--color-black` | #000 |

---

## 타이포그래피 토큰

### 폰트

- 기본 폰트: `'Pretendard GOV', 'Malgun Gothic', 'apple sd gothic neo', sans-serif`
- 62.5% REM 트릭 적용: `html { font-size: 62.5% }` -- 1rem = 10px

### 폰트 크기

| 토큰 | rem | px |
|------|-----|----|
| `--font-size-2xl` | 3.2rem | 32px |
| `--font-size-xl` | 2.8rem | 28px |
| `--font-size-lg` | 2.4rem | 24px |
| `--font-size-md` | 2rem | 20px |
| `--font-size-base` | 1.6rem | 16px |
| `--font-size-sm` | 1.4rem | 14px |
| `--font-size-xs` | 1.2rem | 12px |

### 폰트 굵기

| 토큰 | 값 |
|------|----|
| `--font-weight-regular` | 400 |
| `--font-weight-medium` | 500 |
| `--font-weight-semibold` | 600 |
| `--font-weight-bold` | 700 |

### 줄 간격

| 토큰 | 값 |
|------|----|
| `--leading-tight` | 1.2 |
| `--leading-base` | 1.6 |
| `--leading-loose` | 1.8 |

---

## 간격 토큰

4px 기반 스케일. 이 스케일에 없는 값(5px, 10px, 15px, 20px, 30px)을 사용하지 않는다.

| 토큰 | px |
|------|----|
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
|------|----|
| `--radius-sm` | 4px |
| `--radius-base` | 8px |
| `--radius-lg` | 12px |
| `--radius-xl` | 16px |
| `--radius-full` | 9999px |

### Box Shadow

| 토큰 | 값 |
|------|----|
| `--shadow-sm` | 0 1px 2px rgba(0,0,0,0.05) |
| `--shadow-base` | 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06) |
| `--shadow-lg` | 0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05) |

---

## 브레이크포인트

| 해상도 | 범위 | 기본 시안 너비 |
|--------|------|--------------|
| 모바일 | 0 ~ 767px | 360px |
| 태블릿 | 768px ~ 1279px | 768px |
| PC | 1280px ~ | 1920px (콘텐츠 max-width: 1200px) |

### 그리드

| 해상도 | 컬럼 | 거터 | 좌우 여백 |
|--------|------|------|----------|
| 모바일 | 4 | 16px | 16px |
| 태블릿 | 12 | 24px | 24px |
| PC | 12 | 24px | 40px (max-width: 1200px) |

---

## 컴포넌트 구조

### 버튼 (btn)

```
.btn                    -- Block
.btn--primary           -- 주요 동작
.btn--secondary         -- 보조 동작
.btn--outline           -- 테두리만
.btn--text              -- 배경/테두리 없음
.btn--ghost             -- 투명, 호버 시 배경
.btn--sm                -- 작은 크기 (높이 32px, 터치 영역 44px 보장)
.btn--lg                -- 큰 크기 (높이 48px)
```

### 폼 (form)

```
.form__group            -- label + input 래퍼
.form__label            -- 레이블
.form__label--required  -- 필수 항목 (*)
.form__input            -- 텍스트 입력
.form__input--error     -- 에러 상태
.form__input--success   -- 성공 상태
.form__select           -- 드롭다운
.form__textarea         -- 여러 줄 입력
.form__checkbox         -- 체크박스 래퍼
.form__radio            -- 라디오 래퍼
.form__help             -- 도움말 텍스트
.form__message--error   -- 에러 메시지
.form__message--success -- 성공 메시지
```

### 카드 (card)

```
.card                   -- Block
.card__header           -- 상단 영역
.card__title            -- 제목
.card__body             -- 본문 영역
.card__text             -- 본문 텍스트
.card__footer           -- 하단 영역
.card__media            -- 이미지 래퍼
.card__image            -- 이미지
.card--horizontal       -- 가로형 (tablet-up)
.card--image            -- 이미지형
.card--featured         -- 강조 (accent 테두리)
```

### 테이블 (table)

```
.table                  -- Block
.table__wrapper         -- 반응형 스크롤 래퍼
.table__head            -- thead
.table__th              -- th (bold, nowrap)
.table__body            -- tbody
.table__row             -- tr
.table__td              -- td
.table__empty           -- 데이터 없음
.table--striped         -- 줄무늬
.table--bordered        -- 전체 테두리
```

### 모달 (modal)

```
.modal                  -- Block (role="dialog")
.modal__overlay         -- 반투명 배경
.modal__container       -- 대화상자
.modal__header          -- 제목 + 닫기
.modal__title           -- 제목
.modal__body            -- 본문
.modal__footer          -- 액션 버튼
.modal__close           -- 닫기 버튼
```

### 탭 (tab)

```
.tab                    -- Block
.tab__list              -- 탭 버튼 목록 (role="tablist")
.tab__button            -- 탭 버튼 (role="tab")
.tab__panel             -- 콘텐츠 패널 (role="tabpanel")
```

### 페이지네이션 (pagination)

```
.pagination             -- Block (<nav>)
.pagination__list       -- 목록
.pagination__item       -- 항목
.pagination__link       -- 페이지 링크
.pagination__link--current  -- 현재 페이지
.pagination__link--prev     -- 이전
.pagination__link--next     -- 다음
.pagination__link--disabled -- 비활성
```

### 브레드크럼 (breadcrumb)

```
.breadcrumb             -- Block (<nav>)
.breadcrumb__list       -- 순서 목록 (<ol>)
.breadcrumb__item       -- 항목
.breadcrumb__link       -- 링크
.breadcrumb__current    -- 현재 위치 (텍스트)
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
