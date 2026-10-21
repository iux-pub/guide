---
title: 카드
order: 7
---

# 카드 접근성 가이드

> 스니펫 코드는 `src/snippets/card.md` 참조. 이 문서는 접근성 심화 가이드(왜/언제/주의사항).

## 필수 ARIA 속성

| 속성 | 대상 요소 | 값 | 설명 |
|------|----------|-----|------|
| `alt` | 카드 내 `<img>` | 이미지 설명 텍스트 | 장식용 이미지는 `alt=""` (빈 값). 정보 전달 이미지는 내용을 설명 |
| `aria-labelledby` | 링크 카드(`<a class="card">`) | 카드 제목의 `id` | 카드 전체가 링크면 안의 텍스트 전체가 링크 이름이 된다. 길어지면 제목을 가리켜 이름을 제목으로 줄인다 (보이는 텍스트를 포함하므로 레이블과 네임이 일치한다) |

## 카드 이미지 alt 작성 원칙

| 이미지 유형 | alt 처리 | 예시 |
|------------|---------|------|
| 정보 전달 (제품 사진) | 구체적 설명 | `alt="흰색 러닝화 측면 사진"` |
| 장식용 (배경 패턴) | 빈 alt | `alt=""` |
| 아이콘 (카테고리 표시) | 의미 설명 | `alt="뉴스 카테고리"` |
| 썸네일 (블로그 글) | 글 내용 요약 또는 빈 alt | 제목이 충분하면 `alt=""` |

## 링크 카드의 클릭 영역 처리

카드가 한 곳으로만 이동하는지, 안에 동작이 여럿인지에 따라 둘 중 하나를 고른다. 두 패턴 모두 `card.css`에 정의된 클래스만 쓴다.

**1. 카드 전체가 한 곳으로 가는 링크** — 카드 루트를 `<a class="card card--link">`로 둔다. `card.css`의 `a.card`·`.card--link`가 블록 표시와 호버를 맡는다. 카드 안에 다른 링크·버튼을 두지 않는다 (링크 안 인터랙티브 요소 중첩 금지).

```html
<a class="card card--link" href="/notice/a11y-checklist" aria-labelledby="card-a11y-title">
  <header class="card__header">
    <h3 class="card__title" id="card-a11y-title">웹 접근성 체크리스트 개정</h3>
  </header>
  <div class="card__body">
    <p>KWCAG 2.2 기준으로 고친 점검 항목을 확인하세요.</p>
  </div>
</a>
```

**2. 카드 안에 동작이 여럿** — `<article class="card">`로 두고 제목에만 링크를 건다. 나머지 동작은 `card__footer`의 버튼·링크로 분리한다. 이미지는 감싸는 부품 클래스 없이 `card__body` 안에 둔다.

```html
<article class="card">
  <header class="card__header">
    <h3 class="card__title"><a href="/notice/a11y-checklist">웹 접근성 체크리스트 개정</a></h3>
  </header>
  <div class="card__body">
    <img src="/images/notice/a11y-checklist.png" alt="개정 체크리스트 33개 항목을 인식·운용·이해·견고성 4분류로 나눈 표">
    <p>KWCAG 2.2 기준으로 고친 점검 항목을 확인하세요.</p>
  </div>
  <footer class="card__footer">
    <a class="btn btn--text btn--small" href="/files/a11y-checklist.pdf">체크리스트 내려받기 (PDF)</a>
  </footer>
</article>
```

> 제목 링크를 `::after`로 카드 전체 클릭 영역까지 넓히는 방식은 `card.css`가 제공하지 않는다. 카드 전체가 링크여야 하면 1번 패턴을 쓴다. `card__image`·`card__link`·`card__desc` 같은 부품 클래스는 CSS에 없으므로 만들지 않는다 (R-29).

## KWCAG 2.2 관련 검사항목

| 항목 번호 | 항목명 | 이 컴포넌트에서의 확인 방법 |
|-----------|--------|--------------------------|
| 5.1.1 | 적절한 대체 텍스트 제공 | 카드 이미지에 적절한 alt 속성이 있는지, 장식 이미지는 alt=""인지 확인 |
| 5.4.4 | 콘텐츠 간의 구분 | 카드 간 시각적 구분(보더, 간격)이 색상에만 의존하지 않는지 확인 |
| 6.4.3 | 적절한 링크 텍스트 | 카드 링크 텍스트가 목적지를 설명하는지 확인. "더보기"만 사용하지 않는다 |
