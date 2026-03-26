---
title: SCSS 구조
order: 3
---

ITCSS(Inverted Triangle CSS) 7레이어 구조를 사용한다. Harry Roberts가 BEM과 함께 사용하도록 설계한 아키텍처로, 특이도(specificity) 순서대로 레이어를 배치하여 캐스케이드 충돌을 방지한다.

## ITCSS 7레이어

```
src/scss/
  style.scss              # 메인 진입점 (@use로 각 레이어 로드)
  _project-overrides.scss # 프로젝트별 토큰 오버라이드 (맨 마지막)
  1-settings/             # 토큰, 변수, 브레이크포인트 (CSS 출력 없음)
  2-tools/                # 믹스인, 함수 (CSS 출력 없음)
  3-generic/              # 리셋, 노멀라이즈 (요소 선택자만)
  4-elements/             # HTML 태그 기본 스타일 (h1, a, p 등)
  5-objects/              # 레이아웃 패턴 (BEM 필수)
  6-components/           # UI 컴포넌트 (BEM 필수)
  7-utilities/            # 유틸리티 클래스
```

## 레이어별 역할

| 레이어 | 역할 | 특이도 | 예시 파일 |
|--------|------|--------|----------|
| 1-settings | 토큰, 변수, 브레이크포인트 | 없음 (CSS 출력 없음) | `_tokens-color.scss`, `_breakpoints.scss` |
| 2-tools | 믹스인, 함수 | 없음 (CSS 출력 없음) | `_responsive.scss`, `_mixins.scss` |
| 3-generic | 리셋, 노멀라이즈 | 요소 선택자 | `_normalize.scss`, `_box-sizing.scss` |
| 4-elements | HTML 태그 기본 스타일 | 요소 선택자 | `_base.scss`, `_headings.scss`, `_links.scss` |
| 5-objects | 레이아웃 패턴 | 클래스 선택자 | `_container.scss`, `_grid.scss` |
| 6-components | UI 컴포넌트 | 클래스 선택자 | `_btn.scss`, `_card.scss`, `_form.scss` |
| 7-utilities | 유틸리티 클래스 | 클래스 선택자 | `_sr-only.scss`, `_visibility.scss` |

## 모듈 시스템

`@use`/`@forward`를 사용한다. `@import`는 금지한다.

```scss
// style.scss (메인 진입점)
@use '1-settings' as settings;
@use '2-tools' as tools;
@use '3-generic';
@use '4-elements';
@use '5-objects';
@use '6-components';
@use '7-utilities';
```

숫자 접두사 폴더는 `@use` 시 `as` 별칭이 필수이다 (숫자 시작 네임스페이스 불가).

각 레이어의 `_index.scss`에서 `@forward`로 내부 파일을 공개한다.

```scss
// 1-settings/_index.scss
@forward 'tokens-color';
@forward 'tokens-typography';
@forward 'tokens-spacing';
@forward 'tokens-grid';
@forward 'tokens-misc';
@forward 'breakpoints';
```

## 새 파일 추가 규칙

### 새 컴포넌트 추가

1. `src/scss/6-components/_컴포넌트명.scss` 파일 생성
2. `6-components/_index.scss`에 `@forward '컴포넌트명'` 추가
3. `style.scss`에 `@use '6-components'` 확인 (이미 있으면 생략)

### 새 유틸리티 추가

1. `src/scss/7-utilities/_유틸리티명.scss` 파일 생성
2. `7-utilities/_index.scss`에 `@forward '유틸리티명'` 추가

## 반응형 작성

모바일 퍼스트 접근을 사용한다.

```scss
@use '../2-tools/responsive' as resp;

.card {
  padding: var(--spacing-sm);          // 모바일 기본

  @include resp.respond-to('tablet') {
    padding: var(--spacing-md);        // 태블릿 (768px ~ 1279px)
  }

  @include resp.respond-to('pc') {
    padding: var(--spacing-lg);        // PC (1280px ~)
  }
}
```

## 공용 믹스인

```scss
@use '../2-tools/mixins' as mix;

@include mix.flex-center;              // flex 센터 정렬 (row)
@include mix.flex-center(column);      // flex 센터 정렬 (column)
@include mix.full;                     // width + height 100%
@include mix.ellipsis;                 // 한 줄 말줄임
@include mix.ellipsis-multiline(3);    // 3줄 말줄임
@include mix.bg-cover;                 // 배경 이미지 커버
@include mix.placeholder(var(--color-gray-500)); // placeholder 스타일
```
