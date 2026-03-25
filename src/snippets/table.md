# 테이블 (Table)

## 기본 마크업

```html
<div class="table__wrapper">
  <table class="table">
    <caption class="sr-only">회원 목록</caption>
    <thead class="table__head">
      <tr>
        <th class="table__th" scope="col">이름</th>
        <th class="table__th" scope="col">이메일</th>
        <th class="table__th" scope="col">가입일</th>
      </tr>
    </thead>
    <tbody class="table__body">
      <tr class="table__row">
        <td class="table__td">홍길동</td>
        <td class="table__td">hong@example.com</td>
        <td class="table__td">2026-01-15</td>
      </tr>
      <tr class="table__row">
        <td class="table__td">김영희</td>
        <td class="table__td">kim@example.com</td>
        <td class="table__td">2026-02-20</td>
      </tr>
    </tbody>
  </table>
</div>
```

## Variant 목록

| Variant | 클래스 | 용도 |
|---------|--------|------|
| 기본 | `.table` | 시맨틱 테이블 (caption + thead + tbody) |
| Striped | `.table--striped` | 짝수 행 배경색 (가독성 향상) |
| Bordered | `.table--bordered` | 모든 셀 테두리 |
| Responsive 래퍼 | `.table__wrapper` | 모바일 가로 스크롤 |
| 헤더 영역 | `.table__head` | thead 스타일 |
| 헤더 셀 | `.table__th` | th 스타일 (bold, nowrap) |
| 본문 영역 | `.table__body` | tbody 스타일 |
| 행 | `.table__row` | tr 스타일 |
| 데이터 셀 | `.table__td` | td 스타일 |
| 빈 상태 | `.table__empty` | 데이터 없음 안내 |

### Striped 테이블

```html
<table class="table table--striped">
  <caption class="sr-only">주문 내역</caption>
  <!-- thead, tbody 동일 구조 -->
</table>
```

### Bordered 테이블

```html
<table class="table table--bordered">
  <caption class="sr-only">가격표</caption>
  <!-- thead, tbody 동일 구조 -->
</table>
```

### 빈 상태

```html
<table class="table">
  <caption class="sr-only">검색 결과</caption>
  <thead class="table__head">
    <tr>
      <th class="table__th" scope="col">제목</th>
      <th class="table__th" scope="col">날짜</th>
    </tr>
  </thead>
  <tbody class="table__body">
    <tr class="table__row">
      <td class="table__empty" colspan="2">검색 결과가 없습니다.</td>
    </tr>
  </tbody>
</table>
```

## 접근성 주의사항

- `<caption>` 필수 제공 (시각적으로 숨길 경우 `.sr-only` 클래스 사용)
- 헤더 셀에 `scope="col"` 또는 `scope="row"` 필수 지정
- 빈 상태 시 `<td colspan="전체컬럼수">` 안내 텍스트 제공
- 반응형 래퍼 `.table__wrapper`로 모바일 가로 스크롤 지원
- 복잡한 테이블은 `<th id="">` + `<td headers="">` 패턴 사용
- 정렬 가능한 컬럼은 `aria-sort` 속성 추가 (`ascending` / `descending` / `none`)

## SCSS 파일

`src/scss/6-components/_table.scss`
