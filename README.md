# INFOMIND UX Guide System

인포마인드 UX팀의 디자인 및 퍼블리싱 가이드 시스템.
피그마 디자인 단계부터 HTML/CSS 퍼블리싱까지의 컨벤션을 문서화하고, 신규 프로젝트에 바로 적용 가능한 코드 템플릿을 제공한다.

## 주요 산출물

| 산출물 | 설명 |
|--------|------|
| **디자인 토큰** | 색상, 타이포, 간격, 그리드 등 CSS Custom Properties |
| **ITCSS + BEM** | 7레이어 SCSS 아키텍처 + BEM 네이밍 + Stylelint 자동 검증 |
| **컴포넌트 8종** | 버튼, 폼, 카드, 테이블, 모달, 탭, 페이지네이션, 브레드크럼 |
| **접근성** | KWCAG/WCAG 2.1 AA 체크리스트 + pa11y-ci 자동 테스트 |
| **문서 사이트** | Eleventy 기반 — 토큰/컨벤션/컴포넌트/접근성 가이드 열람, 검색 |
| **스타터 킷** | `starter/` — clone 후 바로 시작 가능한 프로젝트 보일러플레이트 |

## 시작하기

```bash
# 의존성 설치
npm install --legacy-peer-deps

# CSS 빌드
npm run build:css

# 문서 사이트 실행
npm run serve
```

http://localhost:8080 에서 문서 사이트를 열람할 수 있다.

## 새 프로젝트 시작 (스타터 킷)

```bash
cp -r starter/ ../my-new-project
cd ../my-new-project
npm install
npm run build:css
```

`_project-overrides.scss`에서 Primary 색상을 프로젝트에 맞게 변경한다.

## 프로젝트 구조

```
src/scss/               ITCSS 7레이어 SCSS 소스
  1-settings/           토큰, 변수, 브레이크포인트
  2-tools/              믹스인, 함수
  3-generic/            리셋, 노멀라이즈
  4-elements/           HTML 태그 기본 스타일
  5-objects/            레이아웃 패턴 (container, grid)
  6-components/         UI 컴포넌트 (btn, form, card 등)
  7-utilities/          유틸리티 클래스 (sr-only, visibility)
src/snippets/           컴포넌트 HTML 마크업 스니펫
src/playground/         컴포넌트 미리보기 HTML
site/                   Eleventy 문서 사이트 소스
starter/                프로젝트 스타터 킷
docs/                   BEM 가이드, SCSS 구조 가이드, 접근성 가이드
```

## 주요 명령어

| 명령어 | 설명 |
|--------|------|
| `npm run build:css` | SCSS 컴파일 |
| `npm run watch:css` | SCSS 워치 모드 |
| `npm run lint:css` | Stylelint BEM 검사 |
| `npm run lint:css:fix` | 자동 수정 |
| `npm run build:site` | 문서 사이트 빌드 |
| `npm run serve` | 문서 사이트 개발 서버 |
| `npm run test:a11y` | pa11y-ci 접근성 테스트 |

## 기술 스택

- **CSS 방법론**: BEM (Block__Element--Modifier)
- **전처리기**: SCSS (dart-sass)
- **SCSS 아키텍처**: ITCSS (Inverted Triangle CSS)
- **문서 사이트**: Eleventy 3.x + Nunjucks
- **린팅**: Stylelint + stylelint-selector-bem-pattern
- **접근성 테스트**: pa11y-ci (WCAG 2.1 AA)
- **검색**: Pagefind

## 접근성 기준

- KWCAG/WCAG 2.1 AA 이상
- 색상 대비 4.5:1 이상
- 키보드 네비게이션 지원
- 스크린 리더 호환 (aria-*, role, sr-only)

## 라이선스

Internal use only — INFOMIND UX Team
