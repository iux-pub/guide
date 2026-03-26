---
title: 브레드크럼
order: 11
---

# 브레드크럼 접근성 가이드

> 스니펫 코드는 `src/snippets/breadcrumb.md` 참조. 이 문서는 접근성 심화 가이드(왜/언제/주의사항).

## 필수 ARIA 속성

| 속성 | 대상 요소 | 값 | 설명 |
|------|----------|-----|------|
| `aria-label="현재 위치"` | `<nav>` | 텍스트 | 브레드크럼 네비게이션의 목적을 명시 |
| `aria-current="page"` | 마지막 항목 (현재 페이지) | `page` | 현재 보고 있는 페이지임을 스크린리더에 전달 |

## 구분자 처리

**CSS `::before` pseudo-element (권장):** DOM에 구분자가 없으므로 스크린리더가 자동으로 무시한다. 이 프로젝트의 `_breadcrumb.scss`가 이 방식을 사용한다.

## Do / Don't

### Do (올바른 예)

```html
<nav class="breadcrumb" aria-label="현재 위치">
  <ol class="breadcrumb__list">
    <li class="breadcrumb__item">
      <a href="/" class="breadcrumb__link">홈</a>
    </li>
    <li class="breadcrumb__item">
      <a href="/board" class="breadcrumb__link">게시판</a>
    </li>
    <li class="breadcrumb__item">
      <span class="breadcrumb__current" aria-current="page">공지사항</span>
    </li>
  </ol>
</nav>
```

### Don't (잘못된 예)

```html
<!-- nav 없음, 구분자가 DOM에 직접 삽입 -->
<div class="breadcrumb">
  <a href="/">홈</a>
  <span>></span>
  <a href="/board">게시판</a>
  <span>></span>
  <span>공지사항</span>
</div>
```

## KWCAG 2.2 관련 검사항목

| 항목 번호 | 항목명 | 이 컴포넌트에서의 확인 방법 |
|-----------|--------|--------------------------|
| 6.4.3 | 적절한 링크 텍스트 | 각 링크 텍스트가 목적지를 명확히 설명하는지 확인 |
| 5.3.2 | 콘텐츠의 선형구조 | `<ol>` 순서 목록으로 계층 구조가 논리적 순서대로 읽히는지 확인 |
| 6.1.1 | 키보드 사용 보장 | Tab 키로 브레드크럼 링크 순회 가능, Enter로 이동 확인 |
