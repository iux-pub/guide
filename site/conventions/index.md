---
title: 컨벤션
order: 1
---

인포마인드 UX팀이 합의한 코드 작성 규칙이다. 소스는 `rules.json`이며 `npm run build:rules`로 각 페이지가 자동 생성된다.

## 페이지 목록

| 페이지 | 설명 |
|--------|------|
| [CSS 규칙](/conventions/css-rules/) | 토큰 사용, !important, SCSS 사용 금지 |
| [BEM 네이밍](/conventions/bem/) | CSS 클래스 명명 규칙 |
| [CSS 구조](/conventions/css-structure/) | ITCSS 5레이어 + Tailwind v4 + 토큰 분리 |
| [HTML/마크업 규칙](/conventions/html-rules/) | inline style, alt, 시맨틱 HTML |
| [접근성 규칙](/conventions/a11y-rules/) | 포커스, 대비, 터치 영역 |

## 전체 규칙 목록

<!-- RULES_TABLE_START -->
| ID | 규칙 | 심각도 | 카테고리 |
|----|------|--------|----------|
| R-01 | 색은 어디에 쓰든 var(--color-*)만 — 선언 값·Tailwind 팔레트·흑백·임의값·style 속성 안까지. 간격·크기는 rem 임의값(R-37) | error | [CSS 규칙](/conventions/css-rules/) |
| R-02 | !important 사용 금지 — 부득이한 경우 주석으로 사유 필수 | warning | [CSS 규칙](/conventions/css-rules/) |
| R-03 | SCSS 사용 금지 — 표준 CSS nesting + Tailwind v4 문법 허용 | error | [CSS 규칙](/conventions/css-rules/) |
| R-04 | BEM 사용 (5-objects, 6-components 레이어에만 적용) | info | [BEM 네이밍](/conventions/bem/) |
| R-05 | element 2단계 중첩 금지 — 평탄화 | error | [BEM 네이밍](/conventions/bem/) |
| R-06 | 시각적 modifier 금지 — 의미적 이름 사용 | error | [BEM 네이밍](/conventions/bem/) |
| R-07 | inline style 금지 — CSS 커스텀 프로퍼티 style="--var: val"은 허용 | warning | [HTML/마크업 규칙](/conventions/html-rules/) |
| R-08 | HTML 클래스에도 BEM 2단계 element 금지 (R-05 연동) | warning | [HTML/마크업 규칙](/conventions/html-rules/) |
| R-09 | img alt 속성 필수 | error | [HTML/마크업 규칙](/conventions/html-rules/) |
| R-10 | 인터랙티브 요소는 시맨틱 HTML 사용 — div onclick 금지 | error | [HTML/마크업 규칙](/conventions/html-rules/) |
| R-11 | 포커스 스타일 필수 — :focus { outline: none } 금지 | error | [접근성 규칙](/conventions/a11y-rules/) |
| R-12 | 색상 대비 — 일반 텍스트 4.5:1 이상, 큰 텍스트 3:1 이상 | error | [접근성 규칙](/conventions/a11y-rules/) |
| R-13 | 터치 영역 최소 44×44px — 터치 입력 기기 기준 | error | [접근성 규칙](/conventions/a11y-rules/) |
| R-14 | 건너뛰기 링크 필수 — .skip-to-content | error | [접근성 규칙](/conventions/a11y-rules/) |
| R-15 | HTML 기본 구조는 기존 인포마인드 사이트 패턴을 우선 유지한다 | error | [HTML/마크업 규칙](/conventions/html-rules/) |
| R-16 | 인터랙티브 컴포넌트는 필수 ARIA 속성을 누락할 수 없다 | error | [접근성 규칙](/conventions/a11y-rules/) |
| R-17 | 상태는 ARIA·hidden 속성을 먼저 — ARIA로 표현할 수 없을 때만 BEM modifier, .is-* / .has-* 금지 | error | [BEM 네이밍](/conventions/bem/) |
| R-18 | modifier 이름은 허용 어휘(contracts/class-naming.json)에서 — 시각적 단어 금지 | error | [BEM 네이밍](/conventions/bem/) |
| R-19 | 스타일 CSS는 Tailwind v4 @apply 우선 — 토큰 값은 var(--token) 유지 | error | [CSS 규칙](/conventions/css-rules/) |
| R-20 | 호환성 위험 CSS 선택자 금지 — 핵심 CSS에서 :has() 사용 금지 | error | [CSS 규칙](/conventions/css-rules/) |
| R-21 | html lang 속성 필수 — 문서 기본 언어 명시 | error | [접근성 규칙](/conventions/a11y-rules/) |
| R-22 | 모션 최소화 선호 존중 — prefers-reduced-motion 가드 | warning | [접근성 규칙](/conventions/a11y-rules/) |
| R-23 | 가짜·자리 콘텐츠 금지 — 채움 문구·placeholder 핫링크·'질문 1' 연번 레이블·자리값 제목·지어낸 연락처 | error | [HTML/마크업 규칙](/conventions/html-rules/) |
| R-24 | 한글 조판 하한 — keep-all 존재 필수·leading-none 금지·line-height 1.5 미만 경고 | error | [CSS 규칙](/conventions/css-rules/) |
| R-25 | 섹션 리듬 — 동일 archetype 3연속·카드 중첩 금지, 카드 그리드 남발 경고 | error | [HTML/마크업 규칙](/conventions/html-rules/) |
| R-26 | 폰트 스택 한글 fallback 필수 — --font-sans·--font-heading에 한글 가용 폰트 포함 | error | [CSS 규칙](/conventions/css-rules/) |
| R-27 | 아이콘은 카탈로그에서 가져온다 — 임의 SVG 삽입 금지 | error | [HTML/마크업 규칙](/conventions/html-rules/) |
| R-28 | 확대 차단 금지 — viewport에 user-scalable=no·0 또는 maximum-scale 2 미만 금지 | error | [접근성 규칙](/conventions/a11y-rules/) |
| R-29 | 마크업의 BEM 클래스는 CSS에 실재해야 한다 — 없는 modifier 금지, 없는 element 경고 | error | [HTML/마크업 규칙](/conventions/html-rules/) |
| R-30 | 링크는 실제 목적지가 있어야 한다 — 빈 값·#·#none·#;·javascript: 금지 | error | [HTML/마크업 규칙](/conventions/html-rules/) |
| R-31 | 루트 글자 크기는 62.5%로 고정한다 — 다른 값·vw 금지(경고) | warn | [CSS 규칙](/conventions/css-rules/) |
| R-32 | 푸터에 KRDS 명칭 '개인정보 처리방침' 링크를 실제 주소로 둔다 — 옛 명칭 금지, 강조는 그 링크에만 | error | [HTML/마크업 규칙](/conventions/html-rules/) |
| R-34 | 장식 효과 금지 — 장식 그라데이션·그라데이션 글자·글래스(backdrop)·큰 블러·컬러 글로우 그림자 | error | [CSS 규칙](/conventions/css-rules/) |
| R-36 | 이모지를 아이콘·불릿·배지·제목 장식으로 쓰지 않는다 — 아이콘은 카탈로그(R-27) | error | [HTML/마크업 규칙](/conventions/html-rules/) |
| R-37 | Tailwind 기본 타입·행간·간격·컨테이너 스케일 금지 — 62.5% 루트에서 37.5% 작아진다, rem 임의값을 쓴다 | error | [CSS 규칙](/conventions/css-rules/) |
| R-38 | KRDS 최소 글자 — 1.3rem 미만 금지, body 1.6rem·본문 성격 요소 1.5rem 이상, 단계 밖 크기 경고 | error | [CSS 규칙](/conventions/css-rules/) |
| R-39 | main 안 h1은 하나, 제목 단계를 건너뛰지 않는다 | error | [HTML/마크업 규칙](/conventions/html-rules/) |
| R-40 | 공공 화면은 모든 페이지 헤더에 통합검색을 두고, 공공 메인은 첫 화면에 과업 진입을 두며 마케팅 템플릿 섹션을 쓰지 않는다 | error | [HTML/마크업 규칙](/conventions/html-rules/) |
| R-41 | 브레드크럼·사이드 메뉴는 본문 바로가기 목적지 밖, main 첫 제목은 h1, 3단계 이상 서브는 브레드크럼, 서브 첫 섹션은 비주얼 히어로가 아니다 | error | [HTML/마크업 규칙](/conventions/html-rules/) |
| R-43 | 카피 톤 — 번역투·2인칭 마케팅 문구 금지, 버튼은 '~하세요'가 아닌 동사형, 공공 화면 느낌표 금지 | error | [HTML/마크업 규칙](/conventions/html-rules/) |
<!-- RULES_TABLE_END -->

## 검증 도구

```bash
npm run check           # 위반 패턴 전체 스캔 (check-violations.js)
npm run lint:css        # Stylelint (src/styles/**/*.css)
npm run lint:css:fix    # 자동 수정 가능한 항목 처리
npm run build:rules     # rules.json → 이 페이지들 재생성
```

저장소에 Husky pre-commit 훅이 깔리면 커밋 시 `check-violations.js` + Stylelint가 자동 실행된다(예정).
