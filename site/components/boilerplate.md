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
  <a href="#main-content" class="skip-to-content">본문 바로가기</a>

  <header class="site-header" role="banner">
    <div class="container">
      <!-- 로고, GNB -->
    </div>
  </header>

  <main id="main-content" class="site-main" role="main">
    <div class="container">
      <!-- 페이지 콘텐츠 -->
    </div>
  </main>

  <footer class="site-footer" role="contentinfo">
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
| Header 랜드마크 | `<header role="banner">` | 페이지 헤더 영역 |
| Main 랜드마크 | `<main id="main-content" role="main">` | 주요 콘텐츠 영역 |
| Footer 랜드마크 | `<footer role="contentinfo">` | 페이지 푸터 영역 |
| 콘텐츠 래퍼 | `.container` | 최대 너비 제한 + 중앙 정렬 |

## 접근성 주의사항

- `skip-to-content` 링크: `<body>` 바로 뒤 첫 번째 요소로 배치
- `role="banner"` / `role="main"` / `role="contentinfo"`: ARIA 랜드마크 역할 명시
- 페이지당 `<main>` 태그는 1개만 사용
- `lang="ko"` 필수: 스크린리더가 한국어로 읽도록 설정
- `<title>`은 고유하고 설명적인 텍스트 사용
