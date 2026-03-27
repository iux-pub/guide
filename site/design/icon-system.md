---
title: 아이콘 시스템
order: 6
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

아이콘은 SVG 인라인으로 삽입한다. `<img>` 태그나 CSS background 대신 인라인 SVG를 사용해야 색상 제어와 접근성 처리가 가능하다.

### 장식용 아이콘 (텍스트와 함께)

텍스트와 함께 사용되어 의미를 보충하는 아이콘은 장식용으로 처리한다. `aria-hidden="true"`로 스크린 리더에서 숨긴다.

```html
<!-- 장식용: 텍스트가 의미를 전달하므로 아이콘은 숨긴다 -->
<button class="btn btn--danger">
  <svg class="btn__icon" aria-hidden="true" width="16" height="16" viewBox="0 0 24 24"
       fill="none" stroke="currentColor" stroke-width="2"
       stroke-linecap="round" stroke-linejoin="round">
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </svg>
  삭제하기
</button>
```

### 의미 있는 아이콘 (단독 사용)

텍스트 없이 단독으로 사용되는 아이콘은 반드시 버튼에 `aria-label`을 제공한다. 아이콘 자체는 여전히 `aria-hidden="true"`로 숨기고, 버튼이 의미를 전달한다.

```html
<!-- 의미 있는 아이콘: 버튼에 aria-label 필수 -->
<button class="icon-btn" aria-label="다이얼로그 닫기">
  <svg class="icon-btn__svg" aria-hidden="true" width="24" height="24" viewBox="0 0 24 24"
       fill="none" stroke="currentColor" stroke-width="2"
       stroke-linecap="round" stroke-linejoin="round">
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
</button>

<!-- 링크 내 단독 아이콘 -->
<a href="/settings" class="icon-link" aria-label="설정 페이지로 이동">
  <svg class="icon-link__svg" aria-hidden="true" width="20" height="20" viewBox="0 0 24 24"
       fill="none" stroke="currentColor" stroke-width="2"
       stroke-linecap="round" stroke-linejoin="round">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
</a>
```

### 상태 표시 아이콘 (인라인)

텍스트 흐름 안에서 상태를 나타내는 인라인 아이콘은 `vertical-align`으로 정렬한다.

```html
<span class="status status--success">
  <svg class="status__icon" aria-hidden="true" width="16" height="16" viewBox="0 0 24 24"
       fill="none" stroke="currentColor" stroke-width="2"
       stroke-linecap="round" stroke-linejoin="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
  승인 완료
</span>
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
| SVG 인라인 + `aria-hidden="true"` | `<img>` 태그로 아이콘 삽입 |
| `currentColor`로 색상 상속 | 아이콘에 하드코딩 색상 |

## 관련 문서

- [디자인 감사 - 아이콘그래피](/design/design-audit/) -- 감사 체크리스트 15번
- [접근성](/accessibility/) -- KWCAG/WCAG AA 요구사항
- [피그마 컨벤션](/figma/) -- 피그마 아이콘 컴포넌트 관리 규칙
