---
title: 접근성 규칙
order: 6
---

<!-- 자동 생성 — rules.json에서 생성됨. 직접 수정 금지. npm run build:rules로 갱신. -->

WCAG 2.1 AA 기반 접근성 필수 규칙이다.

## 규칙 요약

| ID | 규칙 | 심각도 | 검증 |
|----|------|--------|------|
| R-11 | 포커스 스타일 필수 — :focus { outline: none } 금지 | error | check-violations.js |
| R-12 | 색상 대비 — 일반 텍스트 4.5:1 이상, 큰 텍스트 3:1 이상 | error | pa11y-ci |
| R-13 | 터치/클릭 영역 최소 44×44px | error | manual |
| R-14 | 건너뛰기 링크 필수 — .skip-to-content | error | manual |

---

## R-11 — 포커스 스타일 필수 — :focus { outline: none } 금지

**심각도:** 🔴 error &nbsp; **검증:** check-violations.js

> 키보드만 사용하는 사용자가 현재 포커스 위치를 파악할 수 없다. WCAG 2.4.7 Focus Visible (AA).

**❌ 금지**

```scss
:focus { outline: none; }   // 포커스 제거 — 절대 금지
*:focus { outline: 0; }   // 전역 포커스 제거 — 절대 금지
```

**✅ 올바른 형식**

```scss
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}   // 마우스 클릭은 포커스 표시 안 함, 키보드는 표시
```

---

## R-12 — 색상 대비 — 일반 텍스트 4.5:1 이상, 큰 텍스트 3:1 이상

**심각도:** 🔴 error &nbsp; **검증:** pa11y-ci

> 시력이 약한 사용자와 밝은 환경에서도 콘텐츠를 인식할 수 있어야 한다. WCAG 1.4.3 Contrast Minimum (AA). 큰 텍스트 기준: 24px 이상 또는 18.67px bold 이상.

**❌ 금지**

```scss
color: var(--color-gray-400); /* #b1b8be — 흰 배경 대비 2.7:1 */   // 대비 부족
```

**✅ 올바른 형식**

```scss
color: var(--color-text-secondary); /* #666 — 흰 배경 대비 5.7:1 */   // AA 기준 통과
```

---

## R-13 — 터치/클릭 영역 최소 44×44px

**심각도:** 🔴 error &nbsp; **검증:** manual

> 손가락으로 정확히 터치하기 어려운 작은 버튼은 오작동을 유발한다. 시각적 크기는 작더라도 padding으로 터치 영역을 확보한다. WCAG 2.5.5 Target Size (AAA) / iOS/Android HIG 권장.

**❌ 금지**

```scss
.icon-btn {
  width: 24px;
  height: 24px;
}   // 터치 영역 너무 작음
```

**✅ 올바른 형식**

```scss
.icon-btn {
  width: 24px;
  height: 24px;
  padding: var(--spacing-sm); /* 터치 영역 40px+ */
}   // padding으로 터치 영역 확보
```

---

## R-14 — 건너뛰기 링크 필수 — .skip-to-content

**심각도:** 🔴 error &nbsp; **검증:** manual

> 키보드 사용자가 반복 네비게이션을 건너뛰고 본문으로 바로 이동할 수 있어야 한다. WCAG 2.4.1 Bypass Blocks (A).

**❌ 금지**

```html
<!-- 건너뛰기 링크 없음 -->   // 키보드 사용자는 nav를 전부 탭해야 함
```

**✅ 올바른 형식**

```html
<a href="#main-content" class="skip-to-content">본문 바로가기</a>   // body 최상단에 배치
```

---
