---
name: init-project
description: 인포마인드 스타터킷 기반 새 프로젝트 초기화. 프로젝트명, 브랜드 색상, 타겟 브라우저 등을 반영한 맞춤 CLAUDE.md와 _project-overrides.scss를 생성한다. "새 프로젝트", "프로젝트 시작", "init project" 등 요청 시 사용.
---

# init-project

인포마인드 스타터킷(`https://github.com/iux-pub/starter`)을 기반으로 새 프로젝트를 초기화한다.

## 사용법

`/init-project [프로젝트명]` (예: `/init-project visitjeju-renewal`)

## 수집 정보

사용자에게 아래 정보를 질문한다 (AskUserQuestion 사용):

| 항목 | 필수 | 기본값 |
|------|------|--------|
| 프로젝트명 | 필수 | — |
| 브랜드 Primary 색상 | 선택 | `#256ef4` |
| 브랜드 Primary Light | 선택 | `#6a9df7` |
| 브랜드 Primary Dark | 선택 | `#083891` |
| 폰트 패밀리 | 선택 | `Pretendard GOV` |
| 타겟 브라우저 | 선택 | Chrome, Safari, Edge 최신 2 |
| 공공기관 여부 | 선택 | 아니오 |
| 컨테이너 max-width | 선택 | `1200px` |

## 실행 절차

### 1. 스타터킷 클론

```bash
git clone https://github.com/iux-pub/starter.git {프로젝트명}
cd {프로젝트명}
rm -rf .git
git init
```

### 2. _project-overrides.scss 생성

`src/scss/_project-overrides.scss`에 브랜드 색상/폰트 오버라이드:

```scss
// {프로젝트명} 프로젝트 오버라이드
:root {
  --color-primary: {primary};
  --color-primary-light: {primary-light};
  --color-primary-dark: {primary-dark};
  --font-family-base: '{font}', 'Malgun Gothic', 'apple sd gothic neo', sans-serif;
  --container-max-width: {max-width};
}
```

### 3. CLAUDE.md 생성

프로젝트 루트에 CLAUDE.md 생성:

```markdown
# {프로젝트명}

## 가이드 저장소

- **저장소**: https://github.com/iux-pub/guide
- **용도**: 디자인 토큰, BEM 컨벤션, 컴포넌트 스니펫, 접근성 규칙
- **참조**: 토큰 값/컴포넌트 마크업/접근성 패턴이 불확실할 때 위 저장소 참조

## 핵심 규칙

- **CSS 방법론**: BEM(Block__Element--Modifier) 필수
- **전처리기**: SCSS(dart-sass)
- **접근성**: {공공기관이면 "KWCAG/WCAG 2.1 AA 필수 (공공기관)", 아니면 "WCAG 2.1 AA 권장"}
- **코딩 스타일**: 2 spaces, single quote, 세미콜론 없음 (SCSS는 세미콜론)
- **주석**: 한국어
- **토큰**: CSS Custom Properties 우선, 하드코딩 금지
- **반응형**: 모바일 퍼스트 (모바일 0~767px, 태블릿 768~1279px, PC 1280px~)

## 프로젝트 오버라이드

- **Primary**: {primary}
- **폰트**: {font}
- **컨테이너**: {max-width}
- **타겟 브라우저**: {browsers}

## 토큰/컴포넌트 참조

토큰 정의: `src/scss/1-settings/` 디렉토리
컴포넌트 스니펫: 가이드 저장소 `src/snippets/` 참조
```

### 4. npm install + 빌드

```bash
npm install
npm run build:css
```

### 5. 결과 안내

```
✓ {프로젝트명} 프로젝트 초기화 완료

생성된 파일:
- CLAUDE.md — AI 프로젝트 지시문
- src/scss/_project-overrides.scss — 브랜드 오버라이드
- dist/css/style.css — 빌드된 CSS

다음 단계:
1. index.html에 dist/css/style.css 연결
2. src/playground/ 예제 참고하여 마크업 작성
3. npm run watch:css로 실시간 빌드
```

## 규칙

- 스타터킷의 기존 SCSS 구조를 변경하지 말 것 (ITCSS 7레이어)
- 오버라이드는 반드시 `_project-overrides.scss`에서만 할 것
- 가이드 저장소 URL은 항상 최신으로 유지
