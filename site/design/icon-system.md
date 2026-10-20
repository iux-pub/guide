---
title: 아이콘 시스템
order: 6
---

아이콘 크기, 출처, 접근성 규칙을 정의한다. 아이콘 시스템의 일관성은 UI 품질에 직접적 영향을 미치므로 이 규칙을 엄격히 따른다.

## 아이콘 카탈로그

아이콘은 infoUX 아이콘 카탈로그(`assets/icons/sprite.svg`)에서만 가져온다(R-27). 세트에 들어가는 출처는 `contracts/icon-contract.json`이 정한다.

| 출처 | 쓰임 |
|------|------|
| **Google Material Symbols** (Outlined 1종) | 공통 세트의 씨앗 |
| **인포마인드 자체 제작** | Material에 없는 업무 도메인 아이콘 — 사람이 승인한 것만 |
| **발주처 제공** | 발주처 CI·전용 심볼 — 해당 프로젝트 번들에만 넣는다 |

외부 라이브러리의 SVG를 붙여 넣거나 path를 직접 그리지 않는다. 카탈로그에 없는 아이콘은 [아이콘 스튜디오](/onboarding/icon-studio/)에서 찾거나 요청한다.

### 핵심 원칙

- **세트 1종만 사용**: 출처가 다른 아이콘을 섞으면 획 굵기, 광학 비율, 모서리가 달라 통일감이 깨진다
- **표정 혼용 금지**: 슬림·레귤러·볼드·필 표정은 스프라이트 파일(`sprite-slim.svg`·`sprite.svg`·`sprite-bold.svg`·`sprite-fill.svg`)로 갈린다. 한 제품 안에서 표정을 통일한다
- **같은 아이콘 = 같은 의미**: 한 제품에서 ★이 "즐겨찾기"이면, 다른 곳에서 ★을 "평점"으로 사용하지 않는다

## 스프라이트 사용법

아이콘은 `<svg class="icon">` 안에서 스프라이트를 `<use>`로 참조한다. `<img>` 태그나 CSS background 대신 `<use>`를 써야 `currentColor` 색 상속과 접근성 처리가 가능하다. 색은 아이콘에 박지 않는다 — 부모의 `color`를 따라간다.

### 장식용 아이콘 (텍스트와 함께)

텍스트와 함께 사용되어 의미를 보충하는 아이콘은 장식용으로 처리한다. `aria-hidden="true"`로 스크린 리더에서 숨긴다.

```html
<!-- 장식용: 텍스트가 의미를 전달하므로 아이콘은 숨긴다 -->
<!-- 아이콘은 카탈로그 스프라이트에서 가져온다(R-27) — SVG를 직접 그리지 않는다 -->
<button type="button" class="btn btn--secondary">
  <svg class="icon" aria-hidden="true" focusable="false"><use href="/assets/icons/sprite.svg#delete"></use></svg>
  삭제하기
</button>
```

### 의미 있는 아이콘 (단독 사용)

텍스트 없이 단독으로 사용되는 아이콘은 반드시 버튼·링크에 `aria-label`을 제공한다. 아이콘 자체는 여전히 `aria-hidden="true"`로 숨기고, 버튼·링크가 의미를 전달한다. 아이콘 버튼을 따로 만들지 않고 카탈로그의 `.btn`을 쓴다.

```html
<!-- 의미 있는 아이콘: 버튼에 aria-label 필수 -->
<button type="button" class="btn btn--text" aria-label="대화상자 닫기">
  <svg class="icon" aria-hidden="true" focusable="false"><use href="/assets/icons/sprite.svg#close"></use></svg>
</button>

<!-- 링크 안 단독 아이콘 -->
<a class="btn btn--text" href="/settings" aria-label="설정 페이지로 이동">
  <svg class="icon" aria-hidden="true" focusable="false"><use href="/assets/icons/sprite.svg#settings"></use></svg>
</a>
```

### 상태 표시 아이콘 (인라인)

텍스트와 함께 상태를 나타내는 아이콘은 상태색을 가진 카탈로그 컴포넌트(`tag`·`alert` 등) 안에 둔다. 아이콘은 `currentColor`로 컴포넌트의 글자색을 따라가므로 색을 따로 정하지 않는다. 상태는 색만이 아니라 텍스트로도 전한다.

```html
<span class="tag tag--success">
  <svg class="icon icon--inherit" aria-hidden="true" focusable="false"><use href="/assets/icons/sprite.svg#success"></use></svg>
  승인 완료
</span>
```

## 8pt 그리드 기반 크기

### 허용 크기

크기는 `.icon`의 KRDS 사이즈 어휘 클래스로 정한다(`src/styles/6-components/icon.css`). `width`·`height` 속성을 직접 쓰지 않는다.

| 크기 | 클래스 | 용도 |
|------|--------|------|
| 16px | `.icon--xsmall` | 밀집된 UI, 소형 텍스트(12~14px) 옆 |
| 20px | `.icon--small` | 본문(16px) 옆 |
| 24px | `.icon` (기본) · `.icon--medium` | 표준 아이콘 버튼, Nav 항목, 리스트 행 |
| 32px | `.icon--large` | 기능 아이콘, 섹션 헤딩 |
| 40px | `.icon--xlarge` | Empty State 아이콘, 카드 장식 |
| 1em | `.icon--inherit` | 글자 크기를 따라간다 — 본문·태그 안에서 텍스트와 섞일 때 |

이 밖의 크기가 꼭 필요하면 UX팀과 정한다. `--xxlarge`·`--big` 같은 modifier를 새로 만들지 않는다(R-18·R-29).

### 컨텍스트별 크기

| 컨텍스트 | 아이콘 크기 | 클래스 | 비고 |
|----------|------------|--------|------|
| 버튼 내 아이콘 | **16px** | `.icon--xsmall` | 텍스트와 함께, `.btn`의 gap이 간격을 확보 |
| 네비게이션 항목 | **20px** | `.icon--small` | 메뉴 텍스트 옆, 본문 크기와 균형 |
| 독립 아이콘 버튼 | **24px** | `.icon` (기본) | 터치 타겟 44px 확보 필수 |
| 대형 기능 아이콘 | **32px** | `.icon--large` | 섹션 헤딩, 기능 소개 카드 |
| Empty State | **40px** | `.icon--xlarge` | 시각적 포인트, 빈 상태 안내 |

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
| 12~14px | 16px (`.icon--xsmall`) |
| 16px | 20px (`.icon--small`) |
| 17~20px | 24px (`.icon`) |
| 24px+ | 32px (`.icon--large`) |

## 모호한 아이콘 판별

| 범용 아이콘 (레이블 불필요) | 모호한 아이콘 (레이블 필수) |
|---------------------------|---------------------------|
| X 닫기, 메뉴, 검색, + 추가, 확인 | 즐겨찾기/평점, 알림/리마인더, 설정/구성, 파일/프로젝트 |

모호한 아이콘에는 반드시 **텍스트 레이블** 또는 **툴팁**을 함께 제공한다.

## 터치 타겟

아이콘 자체가 24px이라도 인터랙티브할 경우 **44x44px** 터치 타겟을 필수로 확보한다(R-13). 아이콘 버튼은 `.btn`으로 만든다 — 기본 크기(medium)가 48px 높이라 터치 영역을 채운다. 모바일에서는 44px보다 작은 `.btn--xsmall`(32px)·`.btn--small`(40px)을 아이콘 단독 버튼에 쓰지 않는다.

```html
<!-- 기본 크기 .btn = 높이 48px — 24px 아이콘이어도 터치 영역은 버튼이 확보한다 -->
<button type="button" class="btn btn--text" aria-label="검색 열기">
  <svg class="icon" aria-hidden="true" focusable="false"><use href="/assets/icons/sprite.svg#search"></use></svg>
</button>
```

## 정렬

정렬은 카탈로그 CSS가 이미 처리한다. 아이콘마다 정렬 CSS를 새로 만들지 않는다.

- `.icon`은 `vertical-align: -0.125em`과 `flex-shrink: 0`을 가진다 — 텍스트 흐름 안에서 글자 기준선에 맞고, flex 안에서 줄어들지 않는다
- `.btn`·`.tag`는 `inline-flex` + `align-items: center` + `gap`으로 아이콘과 텍스트를 가운데 맞춘다
- 텍스트 흐름 안에서 글자 크기를 따라가야 하면 `.icon--inherit`(1em)를 쓴다

## Do / Don't

| Do | Don't |
|----|-------|
| 카탈로그 세트 1종, 표정 1종 | 출처·표정 혼용 |
| 크기: 16/20/24/32/40px (`.icon` 사이즈 클래스) | 18/22/26/28/36px 사용, `width`·`height` 직접 지정 |
| 터치 타겟 44x44px 확보 (`.btn`) | 24px 아이콘을 그냥 버튼으로 |
| 모호한 아이콘에 레이블/툴팁 | 레이블 없는 애매한 아이콘 |
| `aria-label` 아이콘 버튼 전체 | aria-label 없는 아이콘 버튼 |
| 같은 아이콘 = 같은 의미 | 맥락마다 다른 의미로 재사용 |
| 스프라이트 `<use>` + `aria-hidden="true"` | `<img>` 태그로 아이콘 삽입, path를 직접 그린 SVG |
| `currentColor`로 색상 상속 | 아이콘에 하드코딩 색상 |

## 관련 문서

- [디자인 감사 - 아이콘그래피](/design/design-audit/) -- 감사 체크리스트 15번
- [접근성](/accessibility/) -- KWCAG/WCAG AA 요구사항
- [디자인 전달 체크리스트](/onboarding/handoff/) -- 아이콘 전달 및 접근성 확인 기준
- [아이콘 스튜디오](/onboarding/icon-studio/) -- 카탈로그 검색·새 아이콘 요청
