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

## 키보드 상호작용

| 키 | 동작 |
|----|------|
| `Tab` | 페이지네이션 내 다음 링크/버튼으로 포커스 이동 |
| `Shift+Tab` | 이전 링크/버튼으로 포커스 이동 |
| `Enter` | 해당 페이지로 이동 |

## 현재 페이지 표시: `aria-current="page"`

**왜 필수인가:** 시각 사용자는 현재 페이지를 강조 스타일(배경색, 볼드 등)로 파악한다. 스크린리더 사용자에게는 `aria-current="page"`가 "현재 페이지"임을 알려주는 유일한 방법이다.

**주의:** 현재 페이지는 `<a>` 대신 `<span>`이나 `<strong>`을 사용하는 것도 고려할 수 있다. 이미 해당 페이지에 있으므로 링크가 불필요하기 때문이다. 단, 프로젝트 관례에 따라 `<a>` + `aria-current="page"`도 허용된다.

## 비활성 이전/다음 버튼 처리

**왜 주의해야 하는가:** 첫 페이지에서 "이전" 버튼, 마지막 페이지에서 "다음" 버튼은 비활성이어야 한다.

| 방식 | 장점 | 단점 |
|------|------|------|
| `<span>` + `aria-disabled="true"` (권장) | 시맨틱하게 비활성 표현 | CSS로 비활성 스타일 별도 필요 |
| `<a>` + `aria-disabled="true"` + JS 차단 | 포커스 가능, 상태 전달 | JS 없으면 클릭 가능 |
| `<a>` + `disabled` 클래스만 | 간단 | 스크린리더가 비활성을 인식 못함 |

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

**왜:** `<nav>` + `aria-label`로 목적 전달, `aria-current="page"`로 현재 위치, 비활성 버튼은 `<span>`으로 변경하여 클릭 불가 + `aria-disabled` 전달.

### Don't (잘못된 예)

```html
<!-- nav 없음, aria 속성 없음 -->
<div class="pagination">
  <a href="#" class="disabled">이전</a>
  <a href="#" class="active">1</a>
  <a href="#">2</a>
  <a href="#">다음</a>
</div>

<!-- "더보기" 텍스트 없이 아이콘만 -->
<a href="#" class="pagination__link">
  <svg>...</svg>
</a>
```

**왜 잘못인가:**
- `<nav>` 없이는 스크린리더가 이 영역이 네비게이션임을 알 수 없다
- `class="active"`만으로는 스크린리더가 현재 페이지를 인식하지 못한다
- `class="disabled"`만으로는 클릭이 가능하고 스크린리더도 비활성을 인식하지 못한다
- 아이콘만 있는 링크에 `aria-label` 없으면 스크린리더가 빈 링크로 읽는다

## 스크린리더 테스트 노트

- **NVDA:** "페이지 네비게이션, 네비게이션" -> "이전 페이지, 사용할 수 없음" -> "페이지 1, 현재 페이지, 링크" -> "페이지 2, 링크"
- **VoiceOver (macOS):** "페이지 네비게이션, 탐색" -> "현재 페이지, 페이지 1, 링크" -> "페이지 2, 링크" -> "다음 페이지, 링크"
- **페이지 전환 후:** 새 페이지에서 `aria-current="page"` 위치가 올바르게 변경되었는지 확인

## KWCAG 2.2 관련 검사항목

| 항목 번호 | 항목명 | 이 컴포넌트에서의 확인 방법 |
|-----------|--------|--------------------------|
| 6.1.1 | 키보드 사용 보장 | Tab 키로 모든 페이지 링크에 접근 가능, Enter로 이동 확인 |
| 6.4.3 | 적절한 링크 텍스트 | 이전/다음 버튼에 `aria-label`이 있는지, "여기를 클릭" 같은 모호한 텍스트가 없는지 확인 |
| 5.1.1 | 적절한 대체 텍스트 제공 | 화살표 아이콘 버튼에 `aria-label`로 대체 텍스트가 있는지 확인 |
