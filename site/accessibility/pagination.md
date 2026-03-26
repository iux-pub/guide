---
title: 페이지네이션
order: 12
---

# 페이지네이션 접근성 가이드

> 스니펫 코드는 `src/snippets/pagination.md` 참조. 이 문서는 접근성 심화 가이드(왜/언제/주의사항).

## 필수 ARIA 속성

| 속성 | 대상 요소 | 값 | 설명 |
|------|----------|-----|------|
| `aria-label="페이지 네비게이션"` | `<nav>` | 텍스트 | 스크린리더에게 이 네비게이션의 목적을 알림 |
| `aria-current="page"` | 현재 페이지 링크 | `page` | 현재 보고 있는 페이지를 명시 |
| `aria-label="페이지 N"` | 각 페이지 번호 링크 | 텍스트 | 숫자만으로는 맥락이 부족할 때 보완 |
| `aria-label="이전 페이지"` | 이전 버튼 | 텍스트 | 화살표 아이콘만 있는 경우 필수 |
| `aria-label="다음 페이지"` | 다음 버튼 | 텍스트 | 화살표 아이콘만 있는 경우 필수 |
| `aria-disabled="true"` | 비활성 이전/다음 | `true` | 첫 페이지의 "이전", 마지막 페이지의 "다음"에 적용 |

## Do / Don't

### Do (올바른 예)

```html
<nav class="pagination" aria-label="페이지 네비게이션">
  <ul class="pagination__list">
    <li class="pagination__item">
      <span class="pagination__link pagination__link--disabled"
            aria-disabled="true" aria-label="이전 페이지">
        <svg>...</svg>
      </span>
    </li>
    <li class="pagination__item">
      <a href="/list?page=1" class="pagination__link pagination__link--active"
         aria-current="page" aria-label="페이지 1">1</a>
    </li>
    <li class="pagination__item">
      <a href="/list?page=2" class="pagination__link"
         aria-label="페이지 2">2</a>
    </li>
    <li class="pagination__item">
      <a href="/list?page=2" class="pagination__link"
         aria-label="다음 페이지">
        <svg>...</svg>
      </a>
    </li>
  </ul>
</nav>
```

### Don't (잘못된 예)

```html
<!-- nav 없음, aria 속성 없음 -->
<div class="pagination">
  <a href="#" class="disabled">이전</a>
  <a href="#" class="active">1</a>
  <a href="#">2</a>
  <a href="#">다음</a>
</div>
```

## KWCAG 2.2 관련 검사항목

| 항목 번호 | 항목명 | 이 컴포넌트에서의 확인 방법 |
|-----------|--------|--------------------------|
| 6.1.1 | 키보드 사용 보장 | Tab 키로 모든 페이지 링크에 접근 가능, Enter로 이동 확인 |
| 6.4.3 | 적절한 링크 텍스트 | 이전/다음 버튼에 `aria-label`이 있는지 확인 |
| 5.1.1 | 적절한 대체 텍스트 제공 | 화살표 아이콘 버튼에 `aria-label`로 대체 텍스트가 있는지 확인 |
