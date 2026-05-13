# HTML 보일러플레이트 (Boilerplate)

## 기본 마크업

기본 마크업은 민간, 사내, CMS, 공공 사이트 모두에 적용 가능한 공통 골격이다. 공식 배너, 정부 상징, 운영기관 식별자, 공공 푸터 필수 링크는 프로젝트 프로파일에서 적용 대상이 확인된 경우에만 추가한다.

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
      <!-- 브랜드, GNB, 유틸리티 -->
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
      <!-- 로고, 연락처, 저작권, 주요 링크 -->
    </div>
  </footer>
</body>
</html>
```

## 필수 요소 체크리스트

| 요소 | 코드 | 용도 |
|------|------|------|
| 문서 언어 | `lang="ko"` | 스크린리더 언어 설정 |
| 뷰포트 | `<meta name="viewport" content="width=device-width, initial-scale=1.0">` | 반응형 대응 |
| 본문 바로가기 | `<a href="#main" class="skip-to-content">본문 바로가기</a>` | 키보드/스크린리더 사용자 편의 |
| Header 랜드마크 | `<header id="header">` | 페이지 헤더 영역 |
| Main 랜드마크 | `<main id="main">` | 주요 콘텐츠 영역 (skip-to-content 타겟) |
| Footer 랜드마크 | `<footer id="footer">` | 페이지 푸터 영역 |
| 콘텐츠 래퍼 | `.container` | 최대 너비 제한 + 중앙 정렬 |

## 프로젝트 유형별 추가 요소

| 유형 | 추가 검토 요소 |
|------|----------------|
| 민간/브랜드 | 브랜드 로고, 주요 링크, 연락처, 개인정보처리방침 등 자체 운영 정보 |
| CMS/사내 시스템 | 서비스명, 사용자 메뉴, 로그아웃, 업무 내비게이션. 정부 아이덴티티 요소 제외 |
| 공공 산하기관 | 기관 정책에 따른 로고/푸터 정보. 공식 배너와 정부 상징은 요구 확인 후 |
| 정부 상징 사용 서비스 | 공식 배너, 정부 상징 로고, 운영기관 식별자, 공공 푸터 필수 링크 |

## 레이아웃 크기 기준

| 영역 | 모바일 | 태블릿 | PC |
|------|--------|--------|-----|
| 헤더 높이 | 최소 56px | 최소 64px | **최소 100px** |
| 푸터 높이 | 자동 | 자동 | 자동 |
| 컨테이너 max-width | 100% | 100% | 1200px |
| 컨테이너 좌우 패딩 | 16px | 24px | 40px |

```css
.site-header {
  min-height: 5.6rem; // 모바일 56px

  @media (min-width: 768px) {
    min-height: 6.4rem; // 태블릿 64px
  }

  @media (min-width: 1280px) {
    min-height: 10rem; // PC 100px
  }
}
```

## 접근성 주의사항

- `skip-to-content` 링크: `<body>` 바로 뒤 첫 번째 요소로 배치. 평소 화면에서 숨겨지고 포커스 시 표시
- `header/main/footer`는 암묵적 랜드마크가 있으므로 기본적으로 role을 중복 작성하지 않는다
- `id="main"`: 본문 바로가기 링크의 타겟
- 페이지당 `<main>` 태그는 1개만 사용
- `lang="ko"` 필수: 스크린리더가 한국어로 콘텐츠를 읽도록 설정
- 페이지 `<title>`은 고유하고 설명적인 텍스트 사용

## 참고 파일

미리보기: `src/playground/boilerplate.html`
