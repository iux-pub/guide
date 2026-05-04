---
title: 달력
order: 25
---

KRDS 정의 컴포넌트. 권위 있는 소스는 `src/snippets/calendar.md`이며, BEM·접근성·토큰 매핑 카탈로그는 [skill/references/krds-components.md](https://github.com/iux-pub/guide/blob/main/skill/references/krds-components.md#calendar)에 있다.

## 기본 마크업

```html
<div class="calendar" role="application" aria-label="날짜 선택">
  <div class="calendar__head">
    <button type="button" class="calendar__nav" aria-label="이전 달">‹</button>
    <h2 class="calendar__title" aria-live="polite">2026년 4월</h2>
    <button type="button" class="calendar__nav" aria-label="다음 달">›</button>
  </div>

  <table class="calendar__grid" role="grid">
    <thead>
      <tr>
        <th scope="col" abbr="일요일">일</th>
        <th scope="col" abbr="월요일">월</th>
        <th scope="col" abbr="화요일">화</th>
        <th scope="col" abbr="수요일">수</th>
        <th scope="col" abbr="목요일">목</th>
        <th scope="col" abbr="금요일">금</th>
        <th scope="col" abbr="토요일">토</th>
      </tr>
    </thead>
    <tbody>
      <tr role="row">
        <td role="gridcell">
          <button type="button" class="calendar__day calendar__day--other-month" aria-label="2026년 3월 30일">30</button>
        </td>
        <td role="gridcell">
          <button type="button" class="calendar__day" aria-label="2026년 4월 1일">1</button>
        </td>
        <td role="gridcell">
          <button type="button" class="calendar__day calendar__day--today" aria-label="2026년 4월 2일 (오늘)">2</button>
        </td>
        <td role="gridcell">
          <button type="button" class="calendar__day calendar__day--selected" aria-selected="true" aria-label="2026년 4월 3일 (선택됨)">3</button>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

## 접근성 핵심

- 컨테이너 `role="application"` + `aria-label`
- `<table role="grid">` 그리드 ARIA
- 일자 버튼은 전체 날짜 컨텍스트로 `aria-label="YYYY년 M월 D일"` (그래야 스크린리더가 "1"이 아닌 "4월 1일"로 읽음)
- 선택 상태: `aria-selected="true"`
- 키보드: 화살표(일 단위), Page Up/Down(월), Home/End(주 시작/끝)

## 파일

- 마크업: `src/snippets/calendar.md`
- CSS: `src/styles/6-components/calendar.css`
- 카탈로그: [krds-components.md#calendar](https://github.com/iux-pub/guide/blob/main/skill/references/krds-components.md#calendar)
