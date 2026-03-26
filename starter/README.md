# 인포마인드 프로젝트 스타터 킷

ITCSS + BEM + 디자인 토큰 기반 SCSS 프로젝트 시작 템플릿

## 퀵스타트

6단계로 프로젝트를 시작할 수 있습니다.

```bash
# 1. 스타터 킷 복사
git clone <저장소 URL> 프로젝트명
cd 프로젝트명

# 2. 의존성 설치
npm install

# 3. SCSS 빌드
npm run build:css

# 4. 빌드 결과 확인
# dist/css/style.css 파일이 생성되면 성공!
ls dist/css/style.css

# 5. 프로젝트 커스터마이징 (아래 "커스터마이징" 섹션 참조)
# src/scss/_project-overrides.scss 수정

# 6. 린트 검사
npm run lint:css
```

## 빌드 출력 경로

| 입력 | 출력 | 설명 |
|------|------|------|
| `src/scss/style.scss` | `dist/css/style.css` | 메인 CSS 번들 (모든 토큰 + 컴포넌트 포함) |

`dist/css/style.css`를 HTML에서 `<link rel="stylesheet" href="path/to/style.css">`로 연결하면 됩니다.

## 커스터마이징

### Primary 색상 변경

`src/scss/_project-overrides.scss` 파일에서 주석을 해제하고 브랜드 색상으로 변경합니다.

```scss
// src/scss/_project-overrides.scss
:root {
  --color-primary: #0a7b4f;       // 브랜드 메인 색상
  --color-primary-light: #3da87a;  // 밝은 변형
  --color-primary-dark: #065535;   // 어두운 변형
}
```

### 폰트 변경

```scss
// src/scss/_project-overrides.scss
:root {
  --font-family-base: 'Noto Sans KR', 'Malgun Gothic', sans-serif;
}
```

### 간격 스케일 조정

```scss
// src/scss/_project-overrides.scss
:root {
  --spacing-md: 2rem;   // 기본 16px → 20px으로 변경
  --spacing-lg: 3.2rem; // 기본 24px → 32px으로 변경
}
```

### 불필요한 컴포넌트 삭제

사용하지 않는 컴포넌트는 `src/scss/6-components/_index.scss`에서 해당 `@forward` 줄을 삭제하면 빌드에서 제외됩니다.

```scss
// src/scss/6-components/_index.scss
@forward 'btn';
@forward 'form';
@forward 'card';
// @forward 'table';        // 사용하지 않으면 주석 처리 또는 삭제
// @forward 'modal';        // 사용하지 않으면 주석 처리 또는 삭제
@forward 'tab';
@forward 'pagination';
@forward 'breadcrumb';
```

### 새 컴포넌트 추가

1. `src/scss/6-components/_컴포넌트명.scss` 파일 생성
2. `src/scss/6-components/_index.scss`에 `@forward '컴포넌트명'` 추가
3. `npm run build:css`로 빌드

## playground 미리보기

`src/playground/` 디렉토리에 각 컴포넌트의 HTML 미리보기 파일이 있습니다. 브라우저에서 직접 열어 마크업과 스타일을 확인할 수 있습니다.

| 파일 | 컴포넌트 |
|------|----------|
| `src/playground/btn.html` | 버튼 |
| `src/playground/form.html` | 폼 |
| `src/playground/card.html` | 카드 |
| `src/playground/table.html` | 테이블 |
| `src/playground/modal.html` | 모달 |
| `src/playground/tab.html` | 탭 |
| `src/playground/pagination.html` | 페이지네이션 |
| `src/playground/breadcrumb.html` | 브레드크럼 |
| `src/playground/boilerplate.html` | 보일러플레이트 |
| `src/playground/a11y-checklist.html` | 접근성 체크리스트 |

## 사용 가능한 스크립트

| 명령어 | 설명 |
|--------|------|
| `npm run build:css` | SCSS 빌드 |
| `npm run watch:css` | SCSS 변경 감지 자동 빌드 |
| `npm run lint:css` | Stylelint 검사 |
| `npm run lint:css:fix` | Stylelint 자동 수정 |

## 포함된 컴포넌트

버튼, 폼, 카드, 테이블, 모달, 탭, 페이지네이션, 브레드크럼

## SCSS 구조 (ITCSS)

```
src/scss/
  style.scss              # 메인 진입점
  _project-overrides.scss # 프로젝트별 토큰 오버라이드
  1-settings/             # 디자인 토큰 (색상, 타이포, 간격, 그리드)
  2-tools/                # 믹스인, 함수 (반응형, flex-center 등)
  3-generic/              # 리셋, 노멀라이즈
  4-elements/             # HTML 태그 기본 스타일
  5-objects/              # 레이아웃 패턴 (컨테이너, 그리드)
  6-components/           # UI 컴포넌트 (BEM 필수)
  7-utilities/            # 유틸리티 클래스 (sr-only, visibility)
```

## 참고 문서

전체 가이드: [인포마인드 UX 가이드 사이트] 참조
