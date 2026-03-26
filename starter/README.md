# 인포마인드 프로젝트 스타터 킷

ITCSS + BEM + 디자인 토큰 기반 SCSS 프로젝트 시작 템플릿

## 시작하기

1. 이 디렉토리를 프로젝트 폴더로 복사
2. npm install
3. npm run build:css

dist/css/style.css가 생성되면 성공!

## 프로젝트 커스터마이징

### Primary 색상 변경
src/scss/_project-overrides.scss 파일에서 주석을 해제하고 브랜드 색상으로 변경

### 새 컴포넌트 추가
1. src/scss/6-components/_컴포넌트명.scss 생성
2. src/scss/6-components/_index.scss에 @forward 추가

## 사용 가능한 스크립트

| 명령어 | 설명 |
|--------|------|
| npm run build:css | SCSS 빌드 |
| npm run watch:css | SCSS 변경 감지 자동 빌드 |
| npm run lint:css | Stylelint 검사 |
| npm run lint:css:fix | Stylelint 자동 수정 |

## 포함된 컴포넌트

버튼, 폼, 카드, 테이블, 모달, 탭, 페이지네이션, 브레드크럼

## 참고 문서

전체 가이드: [인포마인드 UX 가이드 사이트] 참조
