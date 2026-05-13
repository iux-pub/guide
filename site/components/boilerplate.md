---
title: 보일러플레이트
order: 9
layout: layouts/page.njk
section: components
tags: component
---

새 프로젝트를 시작할 때 이 HTML 템플릿을 복사하여 사용합니다. 웹 접근성 필수 요소가 미리 포함되어 있습니다.

## HTML 기본 구조

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>페이지 제목</title>
  <link rel="stylesheet" href="../../dist/css/style.css">
</head>
<body>
  <a href="#main" class="skip-to-content">본문 바로가기</a>

  <header id="header" class="site-header">
    <div class="container">
      <!-- 로고, GNB -->
    </div>
  </header>

  <main id="main">
    <section class="section">
      <div class="container">
        <!-- 페이지 콘텐츠 -->
      </div>
    </section>
  </main>

  <footer id="footer" class="site-footer">
    <div class="container">
      <!-- 푸터 -->
    </div>
  </footer>
</body>
</html>
```

## 필수 요소 체크리스트

| 요소 | 코드 | 용도 |
|------|------|------|
| 문서 언어 | `lang="ko"` | 스크린리더 언어 설정 |
| 뷰포트 | `<meta name="viewport">` | 반응형 대응 |
| 본문 바로가기 | `.skip-to-content` | 키보드/스크린리더 사용자 편의 |
| Header 랜드마크 | `<header id="header">` | 페이지 헤더 영역 |
| Main 랜드마크 | `<main id="main">` | 주요 콘텐츠 영역 |
| Footer 랜드마크 | `<footer id="footer">` | 페이지 푸터 영역 |
| 콘텐츠 래퍼 | `.container` | 최대 너비 제한 + 중앙 정렬 |

## 접근성 주의사항

- `skip-to-content` 링크: `<body>` 바로 뒤 첫 번째 요소로 배치
- `header/main/footer`는 암묵적 랜드마크가 있으므로 기본적으로 role을 중복 작성하지 않는다
- 페이지당 `<main>` 태그는 1개만 사용
- `lang="ko"` 필수: 스크린리더가 한국어로 읽도록 설정
- `<title>`은 고유하고 설명적인 텍스트 사용
