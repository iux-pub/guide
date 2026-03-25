# 테이블 접근성 가이드

> 스니펫 코드는 `src/snippets/table.md` 참조. 이 문서는 접근성 심화 가이드(왜/언제/주의사항).

## 필수 ARIA 속성

| 속성 | 대상 요소 | 값 | 설명 |
|------|----------|-----|------|
| `scope="col"` | `<th>` (열 헤더) | `col` | 이 헤더가 열(세로) 방향 데이터를 설명함을 명시 |
| `scope="row"` | `<th>` (행 헤더) | `row` | 이 헤더가 행(가로) 방향 데이터를 설명함을 명시 |
| `aria-sort` | 정렬 가능한 `<th>` | `ascending` / `descending` / `none` | 현재 정렬 상태를 스크린리더에 전달 |
| `aria-label` | `.table__wrapper` (스크롤 컨테이너) | 테이블 설명 | 모바일에서 가로 스크롤 힌트 제공 |
| `tabindex="0"` | `.table__wrapper` | `0` | 키보드로 스크롤 컨테이너에 포커스 가능하게 함 |
| `role="region"` | `.table__wrapper` | - | 스크롤 가능 영역을 랜드마크로 인식 |

## 키보드 상호작용

| 키 | 동작 |
|----|------|
| `Tab` | 테이블 래퍼(스크롤 영역)로 포커스 이동, 이후 테이블 내 링크/버튼으로 이동 |
| `ArrowLeft` / `ArrowRight` | 스크롤 컨테이너 포커스 시 가로 스크롤 |
| `Enter` | 정렬 버튼 활성화, 링크 이동 |

## caption의 역할과 처리

**왜 필수인가:** 스크린리더는 테이블에 진입할 때 `<caption>` 텍스트를 먼저 읽는다. "직원 목록, 표, 5행 3열"처럼 테이블의 목적을 안내한다.

**시각적으로 숨기는 방법:** 디자인상 캡션이 불필요할 때 `.sr-only` 클래스를 적용한다. 스크린리더는 계속 읽지만 화면에는 보이지 않는다.

```html
<table class="table">
  <caption class="sr-only">2024년 분기별 매출 현황</caption>
  ...
</table>
```

## scope 속성의 중요성

**왜 필수인가:** scope 없이 `<th>`만 사용하면 스크린리더가 데이터 셀과 헤더 셀의 관계를 추측해야 한다. 단순 테이블에서는 보통 맞지만, 복잡한 테이블에서는 실패한다.

**복잡한 테이블 (2차원 헤더):** `scope`만으로 부족하면 `<th id="">` + `<td headers="">` 패턴을 사용한다.

```html
<!-- 2차원 헤더 테이블 -->
<th id="q1" scope="col">1분기</th>
<th id="sales" scope="row">매출</th>
<td headers="q1 sales">1,200만원</td>
```

## 반응형 테이블 접근성

**문제:** 모바일에서 테이블이 잘려 내용을 볼 수 없다.
**해결:** `.table__wrapper`로 감싸 가로 스크롤을 제공하되, 접근성 속성을 추가한다.

```html
<div class="table__wrapper" tabindex="0" role="region"
     aria-label="직원 목록 테이블, 좌우로 스크롤할 수 있습니다">
  <table class="table">...</table>
</div>
```

**왜 `tabindex="0"`이 필요한가:** 키보드 사용자가 스크롤 컨테이너에 포커스하여 화살표 키로 스크롤할 수 있어야 한다. `tabindex="0"` 없이는 포커스가 불가능하다.

## Do / Don't

### Do (올바른 예)

```html
<div class="table__wrapper" tabindex="0" role="region"
     aria-label="회원 목록 테이블, 좌우로 스크롤할 수 있습니다">
  <table class="table">
    <caption class="sr-only">등록 회원 목록</caption>
    <thead class="table__head">
      <tr>
        <th scope="col" class="table__th">이름</th>
        <th scope="col" class="table__th">이메일</th>
        <th scope="col" class="table__th">가입일</th>
      </tr>
    </thead>
    <tbody class="table__body">
      <tr class="table__row">
        <td class="table__td">홍길동</td>
        <td class="table__td">hong@example.com</td>
        <td class="table__td">2024-01-15</td>
      </tr>
    </tbody>
  </table>
</div>
```

**왜:** caption으로 테이블 목적 전달, scope로 헤더-데이터 관계 명시, wrapper로 모바일 스크롤 지원.

### Don't (잘못된 예)

```html
<!-- caption 없음, scope 없음 -->
<table class="table">
  <tr>
    <td><strong>이름</strong></td>
    <td><strong>이메일</strong></td>
  </tr>
  <tr>
    <td>홍길동</td>
    <td>hong@example.com</td>
  </tr>
</table>
```

**왜 잘못인가:**
- `<th>` 대신 `<td><strong>`을 사용하면 스크린리더가 헤더를 인식하지 못한다
- caption 없으면 테이블 목적을 파악하기 어렵다
- scope 없으면 복잡한 테이블에서 셀-헤더 연결이 깨진다

## 스크린리더 테스트 노트

- **NVDA:** 테이블 진입 시 "등록 회원 목록, 표, 5행 3열" -> 셀 이동 시 "이름 열, 홍길동"
- **VoiceOver (macOS):** "표, 3개 열, 5개 행, 등록 회원 목록" -> Ctrl+Option+화살표로 셀 이동
- **빈 상태:** "데이터가 없습니다, 열 1부터 3 병합" (colspan 적용 시)

## KWCAG 2.2 관련 검사항목

| 항목 번호 | 항목명 | 이 컴포넌트에서의 확인 방법 |
|-----------|--------|--------------------------|
| 5.3.1 | 표의 구성 | `<caption>`, `<th scope>` 사용 여부 확인. 레이아웃 목적 테이블 사용 금지 |
| 5.4.4 | 콘텐츠 간의 구분 | 스트라이프 행 배경색이 텍스트 대비 기준을 충족하는지 확인 |
| 6.1.1 | 키보드 사용 보장 | 스크롤 래퍼에 `tabindex="0"`, 정렬 버튼 키보드 접근 가능 확인 |
