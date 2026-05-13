---
title: 표
order: 28
playground_src: /playground/table.html
preview_height: 500
---

KRDS 정의 컴포넌트. 권위 있는 소스는 `src/snippets/table.md`이며, BEM·접근성·토큰 매핑 카탈로그는 [skill/references/krds-components.md](https://github.com/iux-pub/guide/blob/main/skill/references/krds-components.md#table)에 있다.

## 기본 마크업

```html
<div class="table-wrap">
  <table class="table">
    <caption class="table__caption">2026년 1분기 신청 현황</caption>
    <thead>
      <tr>
        <th scope="col">번호</th>
        <th scope="col">신청자</th>
        <th scope="col">신청일</th>
        <th scope="col">상태</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>1</td>
        <td>홍길동</td>
        <td>2026-04-01</td>
        <td><span class="tag tag--success">완료</span></td>
      </tr>
    </tbody>
  </table>
</div>
```

## 접근성 핵심

- `<th scope="col">` 또는 `scope="row">` 필수
- `<caption>`으로 표 제목 명시
- 정렬 헤더는 `aria-sort="ascending|descending|none"`
- 선택 행은 `aria-selected="true"`
- 모바일 가로 스크롤은 `<div class="table-wrap">` 래퍼로 감싸기

## 파일

- 마크업: `src/snippets/table.md`
- CSS: `src/styles/6-components/table.css`
- 카탈로그: [krds-components.md#table](https://github.com/iux-pub/guide/blob/main/skill/references/krds-components.md#table)
