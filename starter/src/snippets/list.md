# 목록 (List) — KRDS Text list / Structured list

두 가지 변형 — 텍스트 목록과 구조화 목록(정의 목록).

## 텍스트 목록 (List — Text)

```html
<!-- 글머리표 -->
<ul class="list--text">
  <li>첫 번째 항목</li>
  <li>두 번째 항목
    <ul>
      <li>중첩 항목</li>
    </ul>
  </li>
</ul>

<!-- 번호 -->
<ol class="list--text list--ordered">
  <li>1단계</li>
  <li>2단계</li>
</ol>
```

## 구조화 목록 (List — Structured / Definition)

KRDS 정의 목록 패턴. 라벨 + 값 쌍 (예: 사양, 상세 정보).

```html
<dl class="list--structured">
  <div class="list__row">
    <dt>제품명</dt>
    <dd>예시 제품</dd>
  </div>
  <div class="list__row">
    <dt>출시일</dt>
    <dd>2026년 4월 30일</dd>
  </div>
  <div class="list__row">
    <dt>가격</dt>
    <dd>10,000원</dd>
  </div>
</dl>
```

## 접근성

- 순서 의미 — `<ol>` (있음) / `<ul>` (없음)
- 정의 목록 — `<dl>/<dt>/<dd>` 시맨틱 사용
- 모바일에선 정의 목록이 자동으로 1열로 변환

## 출처

- CSS: `src/styles/6-components/list.css`
