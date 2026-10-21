# 클래스 이름 짓기 — 한 장 규칙

infoUX의 CSS 클래스 이름은 이 순서대로 정한다. 어휘·대응 표의 정본은 `contracts/class-naming.json`이며, 아래 표는 `npm run build:references`가 그 파일에서 다시 만든다(마커 사이를 직접 고치지 않는다).

## 공식

`block__element--modifier` — 소문자와 하이픈만 쓴다.

- element는 **한 단계**만 둔다. `card__body__title`이 아니라 `card__title`(R-05·R-08).
- BEM은 `5-objects`·`6-components` 레이어에만 쓴다(R-04). 리셋·요소 기본값(3·4 레이어)은 클래스를 만들지 않는다.

## 결정 순서

| 순서 | 물음 | 정한다 |
|------|------|--------|
| ① | 카탈로그에 있는 컴포넌트인가? | 있으면 그 **블록**을 쓴다(MCP `list_components`). 파일 이름과 블록 이름이 다르거나 한 파일에 블록이 여럿인 곳은 아래 대응표를 본다(`header__*`·`form__*`·`table-wrapper`는 없는 블록이다) |
| ② | 블록 안의 부품인가? | `블록__부품` 한 단계로 짓는다. 다른 블록 안에서도 쓰이는 독립 부품이면 새 블록으로 만든다. **스타일이 필요 없는 구조 요소에는 클래스를 달지 않는다** |
| ③ | 같은 블록의 변형인가? | `--변형`은 아래 **허용 어휘**에서만 고른다. 카탈로그 블록의 변형은 CSS에 정의된 것만 쓴다 — 없는 변형을 지어내지 않는다(R-29) |
| ④ | 상태인가? | **ARIA·hidden 속성이 먼저**다. CSS는 `[aria-expanded="true"]`, `[aria-current="page"]`, `[hidden]`, `:disabled`로 모양을 바꾼다. ARIA에 대응하는 상태가 없을 때만 `--상태` modifier를 쓴다. `.is-*`·`.has-*` 금지(R-17) |
| ⑤ | JS가 잡아야 하나? | 동작을 붙이는 시작점은 `data-*` 속성(`data-modal-open`, `data-carousel`)이나 ARIA 역할(`role="tablist"`)로 잡는다. 컴포넌트 안 범위 찾기(`closest('.modal')`)에는 블록 클래스를 써도 된다. JS가 상태 클래스를 붙이거나 떼지 않는다 — 상태는 ARIA·`hidden`으로 바꾼다 |
| ⑥ | 간격·정렬만 조금 바꾸나? | 컴포넌트 CSS 안에서 Tailwind `@apply`로 처리한다. HTML에 유틸리티 클래스를 늘어놓지 않는다(스니펫의 실제 관행) |

## 허용 modifier 어휘

<!-- class-naming:vocabulary:begin (자동 생성 — contracts/class-naming.json) -->
| 축 | 어휘 | 근거 |
|----|------|------|
| 크기 | `--xsmall` · `--small` · `--medium` · `--large` · `--xlarge` | KRDS 크기 어휘(xsmall~xlarge). --sm·--lg·--xl·--xxl은 KRDS 어휘가 아니다 |
| 위계 | `--primary` · `--secondary` · `--tertiary` · `--text` | KRDS 버튼 유형(기본·보조·3차·텍스트) |
| 상태색 | `--info` · `--success` · `--warning` · `--danger` · `--critical` · `--error` · `--neutral` | KRDS 시스템 색상(정보·성공·경고·위험) + 입력 오류. neutral은 상태 없음 |
| 밀도 | `--compact` · `--comfortable` | 표·목록·푸터의 간격 단계 |
| 바탕 | `--inverse` · `--scrim` | 어두운 바탕 반전, 이미지 위 글자 대비용 덮개 |
| 배치·형식 | `--block` · `--reverse` · `--mega` · `--ordered` · `--structured` · `--bottom` | 컴포넌트 고유 형식 |
| 상태 | `--current` · `--done` · `--selected` · `--active` · `--open` · `--show` · `--disabled` · `--today` · `--other-month` | ARIA·hidden 속성으로 표현할 수 없을 때만 쓴다(R-17). current·selected·disabled는 대응 속성(aria-current·aria-selected·disabled)이 같은 요소에 없으면 경고한다. open·show·active는 기존 CSS 별칭으로 남은 이름이다 — 새 블록은 aria-expanded·hidden을 쓴다 |
| 역할·강조 | `--prev` · `--next` · `--required` · `--important` · `--elevated` · `--link` · `--clickable` · `--dot` · `--inherit` | 구성 요소의 역할 |
| `table` 고유 | `--striped` · `--hover` | 표 행 구분(줄무늬)·행 강조. 기존 API라 유지한다. 새 블록에는 쓰지 않는다 |
<!-- class-naming:vocabulary:end -->

## 금지어 · 폐기 예정

<!-- class-naming:forbidden:begin (자동 생성 — contracts/class-naming.json) -->
금지어(error): `big` · `huge` · `tiny` · `mini` · `red` · `blue` · `green` · `yellow` · `orange` · `purple` · `pink` · `black` · `white` · `gray` · `grey` · `dark` · `light` · `rounded` · `circle` · `square` · `shadow` · `glow` · `flat` · `bold` · `italic` · `underline` · `wide` · `narrow` · `thick` · `thin`

| 폐기 예정 | 대신 | 메모 |
|-----------|------|------|
| `.badge--gray` | `.badge--neutral` | 시각 단어(R-18). CSS에는 이행 기간 동안 별칭으로 남긴다. 마크업에 쓰면 경고한다 |
| `.pagination__item--current` | `pagination__item + aria-current="page"` | ARIA로 표현할 수 있는 상태(R-17). CSS는 [aria-current="page"]로 그린다. 이미 납품한 마크업 때문에 CSS 별칭은 남긴다 |
<!-- class-naming:forbidden:end -->

## 파일 이름 ↔ 블록 이름 대응

컴포넌트 CSS 파일 이름이 곧 블록 이름이다. 예외는 아래뿐이다 — 파일 이름과 블록 이름이 다른 곳, 한 파일에 보조 블록(감싸개 등)이 함께 있는 곳, 자주 틀리는 이름. 이미 납품한 사이트가 이 이름을 쓰므로 블록 이름은 바꾸지 않는다. 검사(R-29)는 왼쪽 이름으로 지은 클래스(`header__inner`, `form__group`, `table-wrapper`)를 오류로 잡고 오른쪽 블록을 알려 준다.

<!-- class-naming:file-blocks:begin (자동 생성 — contracts/class-naming.json) -->
| 컴포넌트 | 파일 | 블록 | 이유 |
|----------|------|------|------|
| `header` | `src/styles/6-components/header.css` | `.site-header` | `<header>` 요소·KRDS 헤더와 구분해 사이트 공통 헤더를 site-header로 쓴다 |
| `footer` | `src/styles/6-components/footer.css` | `.site-footer` | `<footer>` 요소와 구분해 사이트 공통 푸터를 site-footer로 쓴다 |
| `check-radio` | `src/styles/6-components/check-radio.css` | `.check` · `.radio` | KRDS 체크박스·라디오 버튼을 한 파일에 두고 블록은 둘로 나눈다 |
| `form` | `src/styles/6-components/form.css` | `.form-field` · `.input` · `.textarea` | KRDS 텍스트 입력 계열(레이블·입력·여러 줄 입력)을 한 파일에 둔다 |
| `table` | `src/styles/6-components/table.css` | `.table` · `.table-wrap` | 좁은 화면에서 가로로 스크롤되는 감싸개는 별도 블록이다(표 자체와 역할이 다르다) |
| `toast` | `src/styles/6-components/toast.css` | `.toast` · `.toast-stack` | 여러 토스트를 쌓는 화면 고정 영역은 별도 블록이다 |
| `tooltip` | `src/styles/6-components/tooltip.css` | `.tooltip` · `.tooltip-wrap` | 트리거와 툴팁을 묶어 위치를 잡는 감싸개는 별도 블록이다 |
| (오기) `table-wrapper` | — | `.table-wrap` | 흔한 오기. 감싸개 블록 이름은 table-wrap이다 |
<!-- class-naming:file-blocks:end -->

## 상태 표현 예 (R-17)

| 상태 | 쓴다 | 쓰지 않는다 |
|------|------|-------------|
| 펼침·접힘 | `<button aria-expanded="true">` + CSS `[aria-expanded="true"]` | `.menu--open`, `.is-open` |
| 현재 페이지·현재 항목 | `aria-current="page"` / `aria-current="true"` | `.pagination__item--current`(폐기 예정 별칭), `.is-active` |
| 오늘 날짜 | `aria-current="date"` (+ 기존 `calendar__day--today`) | `.today` |
| 선택 | `aria-selected="true"`(탭·목록) / `aria-pressed`(토글 버튼) | `.tab__item--selected` |
| 숨김 | `hidden` 속성 | `.modal--open`, `.is-hidden` |
| 비활성 | `disabled` (+ 링크면 `aria-disabled="true"`) | `.btn--disabled` |
| 오류 입력 | `aria-invalid="true"` (+ 기존 `--error` 변형) | `.has-error` |
| ARIA 대응이 없는 상태 | `step-indicator__item--done` | `.done` |

`--current`·`--selected`·`--disabled` modifier를 쓰면 같은 요소에 대응 속성(`aria-current`·`aria-selected`·`disabled`)이 있어야 한다 — 없으면 검사가 경고한다(R-17). 클래스만으로는 상태가 색으로만 보인다.

## 이름이 헷갈릴 때

- 「크게」는 `--large`, 「넓게」는 변형이 아니라 레이아웃 문제다(`container` 폭·그리드). `--wide`·`--big`은 쓰지 않는다.
- 「회색」「진하게」처럼 모양을 말하고 싶으면 그 모양을 쓰는 **이유**를 이름으로 쓴다: 상태 없음 → `--neutral`, 어두운 바탕 → `--inverse`, 강조 → `--primary`·`--important`.
- 화면 크기에 따라 숨기기(`--mobile-hidden`)는 변형이 아니다. 컴포넌트 CSS 안에서 `@apply hidden tablet:flex`처럼 처리한다.
- 블록 고유 변형이 꼭 필요하면 CSS에 먼저 정의하고 `contracts/class-naming.json` `blockModifiers`에 등록한다(그래야 검사가 안다).

## 검사

| 규칙 | 무엇을 잡나 | 어디서 |
|------|-------------|--------|
| R-05 · R-08 | element 2단계 중첩, `&__`·`&--` nesting(이름이 이어 붙지 않는다) | CSS · HTML |
| R-17 | `.is-*` · `.has-*` 상태 클래스(error) · 대응 속성 없는 `--current`·`--selected`·`--disabled`(warn) | HTML |
| R-18 | 금지어가 든 modifier(`--gray-dark`처럼 조각에 있어도 error) · 어휘 밖 modifier(CSS warn) · 폐기 예정 modifier(HTML warn) | CSS · HTML |
| R-29 | 카탈로그 블록인데 CSS에 없는 modifier(error) · element(warn) · 파일 이름·오기로 지은 블록(error) | HTML (스니펫·playground·문서·references·prompts·프로젝트 마크업) |
| stylelint `selector-class-pattern` | `block__element--modifier` 형식 | CSS |
