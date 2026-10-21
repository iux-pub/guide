---
title: 페이지네이션
order: 12
---

# 페이지네이션 접근성 가이드

> 스니펫 코드는 `src/snippets/pagination.md` 참조. 이 문서는 접근성 심화 가이드(왜/언제/주의사항).

## 필수 ARIA 속성

| 속성 | 대상 요소 | 값 | 설명 |
|------|----------|-----|------|
| `aria-label="페이지 내비게이션"` | `<nav>` | 텍스트 | 스크린리더에게 이 내비게이션의 목적을 알림 |
| `aria-current="page"` | 현재 페이지 링크 (`pagination__item`) | `page` | 현재 보고 있는 페이지를 명시. CSS가 이 속성(`.pagination__item[aria-current="page"]`)으로 현재 페이지를 그린다 — 상태 클래스를 따로 달지 않는다 (R-17) |
| `aria-label="N페이지"` | 각 페이지 번호 링크 | 텍스트 | 숫자만으로는 맥락이 부족할 때 보완 |
| `aria-label="이전 페이지"` | 이전 버튼 (`pagination__nav`) | 텍스트 | 화살표 기호만 있는 경우 필수 |
| `aria-label="다음 페이지"` | 다음 버튼 (`pagination__nav`) | 텍스트 | 화살표 기호만 있는 경우 필수 |
| `aria-disabled="true"` + `disabled` | 비활성 이전/다음 버튼 | `true` | 첫 페이지의 "이전", 마지막 페이지의 "다음"에 함께 적용 |

## Do / Don't

### Do (올바른 예)

```html
<nav class="pagination" aria-label="페이지 내비게이션">
  <button type="button" class="pagination__nav" aria-label="이전 페이지"
    aria-disabled="true" disabled>‹</button>
  <ol class="pagination__list">
    <li><a class="pagination__item" href="/list?page=1"
      aria-current="page" aria-label="1페이지">1</a></li>
    <li><a class="pagination__item" href="/list?page=2" aria-label="2페이지">2</a></li>
    <li><a class="pagination__item" href="/list?page=3" aria-label="3페이지">3</a></li>
  </ol>
  <button type="button" class="pagination__nav" aria-label="다음 페이지">›</button>
</nav>
```

### Don't (잘못된 예)

```html
<!-- 금지 예시: nav·aria 속성 없음
     현재 페이지를 클래스(pagination__item--current, 이미 납품한 마크업을 위한 별칭)로만 구분하고 aria-current가 없다.
     첫 페이지인데 '이전'이 비활성 처리 없이 같은 페이지 링크로 남아 있다 -->
<div class="pagination">
  <a href="/list?page=1" class="pagination__nav">이전</a>
  <a href="/list?page=1" class="pagination__item pagination__item--current">1</a>
  <a href="/list?page=2" class="pagination__item">2</a>
  <a href="/list?page=2" class="pagination__nav">다음</a>
</div>
```

## KWCAG 2.2 관련 검사항목

| 항목 번호 | 항목명 | 이 컴포넌트에서의 확인 방법 |
|-----------|--------|--------------------------|
| 6.1.1 | 키보드 사용 보장 | Tab 키로 모든 페이지 링크에 접근 가능, Enter로 이동 확인 |
| 6.4.3 | 적절한 링크 텍스트 | 이전/다음 버튼에 `aria-label`이 있는지 확인 |
| 5.1.1 | 적절한 대체 텍스트 제공 | 화살표 아이콘 버튼에 `aria-label`로 대체 텍스트가 있는지 확인 |
