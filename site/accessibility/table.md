---
title: 테이블
order: 8
---

# 테이블 접근성 가이드

> 스니펫 코드는 `src/snippets/table.md` 참조. 이 문서는 접근성 심화 가이드(왜/언제/주의사항).

## 필수 ARIA 속성

| 속성 | 대상 요소 | 값 | 설명 |
|------|----------|-----|------|
| `scope="col"` | `<th>` (열 헤더) | `col` | 이 헤더가 열(세로) 방향 데이터를 설명함을 명시 |
| `scope="row"` | `<th>` (행 헤더) | `row` | 이 헤더가 행(가로) 방향 데이터를 설명함을 명시 |
| `aria-sort` | 정렬 가능한 `<th>` | `ascending` / `descending` / `none` | 현재 정렬 상태를 스크린리더에 전달 |
| `aria-labelledby` | `.table-wrap` (스크롤 컨테이너) | 캡션의 id | 스크롤 영역의 이름을 표 캡션으로 준다(같은 제목을 두 번 쓰지 않는다) |
| `tabindex="0"` | `.table-wrap` | `0` | 키보드로 스크롤 컨테이너에 포커스 가능하게 함 |
| `role="region"` | `.table-wrap` | - | 스크롤 가능 영역을 랜드마크로 인식 |

## caption의 역할과 처리

**왜 필수인가:** 스크린리더는 테이블에 진입할 때 `<caption>` 텍스트를 먼저 읽는다. "직원 목록, 표, 5행 3열"처럼 테이블의 목적을 안내한다.

**기본:** `<caption class="table__caption">`으로 표 제목을 화면과 스크린리더에 함께 전달한다.

**시각적으로 숨기는 방법:** 표 바로 위에 같은 제목이 이미 보여 캡션이 중복될 때만 `.sr-only` 클래스를 적용한다.

```html
<!-- 기본: 보이는 캡션 -->
<table class="table">
  <caption class="table__caption">2024년 분기별 매출 현황</caption>
  ...
</table>

<!-- 표 위에 같은 제목이 이미 있을 때: 시각적으로만 숨김 -->
<table class="table">
  <caption class="sr-only">2024년 분기별 매출 현황</caption>
  ...
</table>
```

## 반응형 테이블 접근성

표가 좁은 화면에서 가로로 넘칠 수 있으면 `.table-wrap`에 `tabindex="0"`·`role="region"`·`aria-labelledby`(캡션 id)를 더해 키보드로도 스크롤할 수 있게 한다(스니펫 `src/snippets/table.md`와 같은 형태). 한 페이지에 표가 여럿이면 캡션도 서로 다르게 쓴다 — 같은 이름의 영역 랜드마크가 생기지 않게.

```html
<div class="table-wrap" tabindex="0" role="region" aria-labelledby="staff-caption">
  <table class="table">
    <caption id="staff-caption" class="table__caption">직원 목록</caption>
    ...
  </table>
</div>
```

## KWCAG 2.2 관련 검사항목

| 항목 번호 | 항목명 | 이 컴포넌트에서의 확인 방법 |
|-----------|--------|--------------------------|
| 5.3.1 | 표의 구성 | `<caption>`, `<th scope>` 사용 여부 확인. 레이아웃 목적 테이블 사용 금지 |
| 5.4.4 | 콘텐츠 간의 구분 | 스트라이프 행 배경색이 텍스트 대비 기준을 충족하는지 확인 |
| 6.1.1 | 키보드 사용 보장 | 스크롤 래퍼에 `tabindex="0"`, 정렬 버튼 키보드 접근 가능 확인 |
