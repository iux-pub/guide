---
title: CSS 회귀 테스트
order: 4
---

CSS 회귀(regression)란 스타일 변경 시 의도하지 않은 다른 컴포넌트나 페이지에 영향이 발생하는 것이다. SCSS 파일 하나를 수정했는데 전혀 다른 페이지의 레이아웃이 깨지는 상황을 방지하기 위한 검증 프로세스를 정리한다.

## 회귀 테스트란

CSS는 전역 스코프(global scope)를 가진다. 클래스명이 충돌하거나, 공통 토큰 값을 변경하거나, 상위 레이어(3-generic, 4-elements) 스타일을 수정하면 예상치 못한 곳에 영향을 준다.

**BEM + ITCSS 구조가 회귀 위험을 줄여주지만**, 완전히 방지하지는 못한다. 변경 후 검증이 필수다.

## 3단계 검증 프로세스

### 1단계: Stylelint 린트 검사

코드 품질과 컨벤션 준수를 자동 검사한다. 문법 오류, 중복 선택자, BEM 위반 등을 잡아낸다.

```bash
# 전체 SCSS 린트 검사
npm run lint:css

# 변경한 파일만 검사 (빠른 확인)
npx stylelint "src/scss/6-components/_btn.scss"

# 특정 폴더만 검사
npx stylelint "src/scss/6-components/**/*.scss"

# 자동 수정 가능한 항목 처리
npm run lint:css:fix
```

**통과 기준:** 에러 0건. warning은 확인 후 의도적이면 허용.

### 2단계: CSS 파일 크기 비교

빌드 전후 CSS 파일 크기를 비교하여 예상치 못한 변화를 감지한다.

```bash
# 변경 전 크기 기록
ls -la dist/css/style.css
# 또는 바이트 단위로
wc -c dist/css/style.css

# SCSS 수정 후 빌드
npm run build:css

# 변경 후 크기 확인
ls -la dist/css/style.css
wc -c dist/css/style.css
```

**판단 기준:**

| 변화량 | 조치 |
|--------|------|
| 5% 이내 증가/감소 | 정상 범위, 변경 내용과 일치하는지 확인 |
| 5~10% 변화 | 원인 분석 필요 -- 의도한 변경인지 확인 |
| 10% 이상 증가 | 경고 -- 불필요한 코드 추가, 중복 스타일 의심 |
| 10% 이상 감소 | 주의 -- 필요한 스타일이 누락되었을 수 있음 |

### 3단계: 시각적 점검

브라우저에서 직접 확인하는 최종 검증이다. 자동화 도구로 잡지 못하는 시각적 문제를 발견한다.

```
1. 변경한 컴포넌트 페이지를 3개 뷰포트(360/768/1280)에서 확인
2. 해당 컴포넌트를 사용하는 다른 페이지도 확인
3. modifier/variant가 있다면 전부 확인
4. 문서 사이트(site)에서 가이드 페이지 전체 훑기
```

## 컴포넌트 변경 시 체크리스트

SCSS 파일을 수정한 후 아래 항목을 순서대로 확인한다.

### 필수 확인

- [ ] 변경한 컴포넌트 자체가 정상 렌더링되는가
- [ ] 해당 컴포넌트를 사용하는 다른 페이지에서 깨짐이 없는가
- [ ] 모든 modifier/variant가 정상인가 (예: `.btn--primary`, `.btn--secondary`, `.btn--outline` 전부)
- [ ] 반응형 3개 뷰포트(360px / 768px / 1280px)에서 정상인가
- [ ] Stylelint 검사를 통과하는가 (`npm run lint:css`)

### 토큰 변경 시 추가 확인

토큰(CSS Custom Property) 값을 변경하면 해당 토큰을 사용하는 **모든 컴포넌트**에 영향이 간다.

- [ ] 변경한 토큰을 사용하는 파일을 전체 검색했는가
- [ ] 검색된 모든 컴포넌트에서 의도대로 반영되었는가
- [ ] `_project-overrides.scss`에 오버라이드가 있다면 충돌 없는가

```bash
# 토큰 사용처 검색 (예: --spacing-md 변경 시)
grep -r "spacing-md" src/scss/
```

### 전역 스타일 변경 시 추가 확인

`3-generic/` 또는 `4-elements/` 레이어를 수정하면 사이트 전체에 영향이 간다.

- [ ] 모든 주요 페이지 타입(메인, 목록, 상세, 폼)에서 확인했는가
- [ ] 기존 컴포넌트가 의도치 않게 변경되지 않았는가
- [ ] playground 전체 페이지를 훑었는가

## 예방 전략

### BEM 스코핑으로 영향 범위 제한

BEM은 컴포넌트별로 고유한 네임스페이스를 제공한다. `.card__title`은 `.card` 블록 내에서만 의미를 가지므로 다른 컴포넌트에 영향을 주지 않는다.

```scss
// 안전: BEM 스코핑
.card__title {
  font-size: var(--font-size-lg);
}

// 위험: 범용 클래스
.title {
  font-size: var(--font-size-lg); // 어디에서든 영향
}
```

### ITCSS 레이어 순서 준수

레이어 순서를 바꾸면 특이성(specificity) 계산이 달라져 기존 스타일이 깨질 수 있다. `style.scss`의 `@use` 순서를 임의로 변경하지 않는다.

```scss
// style.scss -- 순서 변경 금지
@use '1-settings' as settings;
@use '2-tools' as tools;
@use '3-generic';
@use '4-elements';
@use '5-objects';
@use '6-components';
@use '7-utilities';
```

### 전역 스타일 변경 시 전체 회귀 테스트 필수

아래 파일을 수정할 경우 사이트 전체 시각적 점검이 필요하다.

| 파일 | 영향 범위 | 회귀 테스트 수준 |
|------|----------|----------------|
| `1-settings/_tokens-*.scss` | 토큰 사용처 전체 | 토큰 사용처 검색 + 해당 컴포넌트 점검 |
| `3-generic/_normalize.scss` | 모든 HTML 요소 | 전체 페이지 점검 필수 |
| `4-elements/_base.scss` | body, html 등 기본 요소 | 전체 페이지 점검 필수 |
| `4-elements/_headings.scss` | 모든 제목 요소 | 제목이 있는 주요 페이지 점검 |
| `5-objects/_grid.scss` | 그리드 레이아웃 전체 | 모든 레이아웃 유형 점검 |
| `6-components/_btn.scss` | 버튼 컴포넌트만 | 버튼 사용 페이지 점검 |

**핵심 원칙:** 수정 범위가 넓을수록(레이어 번호가 낮을수록) 회귀 테스트 범위도 넓어진다.
