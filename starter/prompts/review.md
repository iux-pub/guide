# 코드 리뷰 체크리스트 프롬프트 — KRDS+Tailwind v4

대상: 모든 AI (코드 리뷰 용도)

> 손으로 관리하는 파일이다(`npm run build:prompts`가 만들지 않는다). 기준이 바뀌면 `CLAUDE.md`·`rules.json`·`references/`에 맞춰 직접 고친다. KRDS가 언제나 우선한다.

아래 체크리스트로 이 코드를 리뷰하라. 위반 항목을 구체적으로 지적하라.

## 검증 환경

- [ ] 프로젝트의 `package.json`, CI 설정, README에서 사용 가능한 `check`/`lint`/`build`/`test`/`a11y` 명령을 확인했는가
- [ ] infoUX 하네스(`scripts/check-violations.js`, `scripts/check-html-structure.js`)가 있으면 실행했는가
- [ ] 하네스가 없으면 변경 파일을 직접 스캔하고, 대체한 수동 검증 항목을 리뷰 결과에 명시했는가

## CSS 시스템 (R-03)

- [ ] **SCSS 사용 없음** — `.scss` 파일, `@use`, `@forward`, `$variable` 모두 0건
- [ ] CSS는 표준 CSS nesting과 Tailwind v4 `@apply` 사용 가능 (`.css` 파일, `@import "tailwindcss"`, CSS Custom Property)
- [ ] Tailwind v4 기본 팔레트 raw 컬러 유틸 없음
- [ ] Tailwind 기본 스케일 0건 — 62.5% 루트에서 37.5% 작게 렌더된다(R-37, 오류). `text-base`, `leading-6`, `p-4`, `gap-2`, `max-w-md` 대신 rem 임의값(`p-[1.6rem]`)을 쓴다
- [ ] Tailwind 기본 반경·그림자·z-index·브레이크포인트 없음(R-01 경고) — `rounded-lg`(62.5% 루트에서 5px) 대신 `rounded-[0.8rem]`, `shadow-md` 대신 KRDS 검정 알파 그림자, `z-10` 대신 레이어 의미가 보이는 값, `sm:` 대신 INFOUX 브레이크포인트(`tablet:` 등)

## BEM (R-04, R-05, R-06, R-17, R-18, R-29)

- [ ] 클래스명이 Block__Element--Modifier 패턴
- [ ] Element 2단계 중첩 0건
- [ ] Modifier에 `--` 사용 (`.btn-primary` 금지 → `.btn--primary`)
- [ ] 요소 선택자 의존 없음 (`.card h4` 금지 → `.card__title`)
- [ ] modifier는 `contracts/class-naming.json` 허용 어휘 안에 있음 — 시각 단어(`--blue`, `--gray`, `--big`, `--rounded`) 금지, 크기는 KRDS 어휘(`--xsmall`~`--xlarge`)만 (`references/class-naming.md`)
- [ ] 카탈로그 블록의 클래스는 CSS에 정의된 것만 씀 — `card--featured`·`card__media`처럼 지어낸 변형·부품 0건 (R-29)
- [ ] 상태는 ARIA·hidden 속성 먼저 (`aria-expanded`·`aria-current`·`aria-selected`·`hidden`·`disabled`) — ARIA로 표현할 수 없을 때만 BEM modifier, `.is-*`·`.has-*` 0건 (R-17)
- [ ] 옛 버튼 variant 이름 없음

## 토큰 (R-01)

- [ ] 색 하드코딩 0건 (`#222`, `rgb(...)`, `hsl(...)` 금지 → `var(--color-*)`) — Tailwind 임의값과 `style` 속성 안까지
- [ ] 서체는 `--font-sans`·`--font-heading`·`--font-mono` 토큰으로만 — `font-family` 직접값·외부 폰트 호스트 0건(R-26)
- [ ] 간격/크기/반경/그림자/모션/z-index는 CSS 직접값 또는 Tailwind rem 임의값(`p-[2.4rem]`)으로 직접 관리
- [ ] `tokens/build/tokens.css`에 없는 토큰 이름 0건
- [ ] 프로젝트가 고친 토큰 파일은 `tokens/brand.json`뿐 — `foundation.json`과 빌드 산출물은 그대로

## CSS 규칙 (R-02, R-07)

- [ ] `!important` 사용 시 사유 주석 명시
- [ ] 인라인 `style="..."` 0건 (CSS 변수 주입 `style="--var: val"`은 허용)
- [ ] 선택자 깊이 3단계 이하

## ITCSS 5레이어

- [ ] 파일이 올바른 레이어에 위치 (컴포넌트 → `src/styles/6-components/`)
- [ ] `src/styles/6-components/index.css`에 `@import "./{name}.css"` 등록
- [ ] BEM은 5-objects, 6-components 레이어에만 적용

## HTML/마크업 (R-07~R-10, R-15, R-39)

- [ ] 큰 영역은 `header/main/footer`, `main` 안은 `section > .container` 구조
- [ ] HTML 컴포넌트화는 페이지 전체가 아니라 `main` 내부 section 단위
- [ ] `main` 직계 자식은 `section`이고, 각 `section`은 `.container`를 직접 포함
- [ ] 각 `section`은 heading 또는 `aria-labelledby`/`aria-label`로 접근 가능한 이름 제공
- [ ] `<img>`에 `alt` 속성 (장식용은 `alt=""`)
- [ ] 인터랙티브 요소에 `aria-label` 또는 텍스트 레이블
- [ ] `div`/`span` 클릭 핸들러 패턴 없음 — `<button>`/`<a>` 시맨틱 HTML 사용
- [ ] 폼 요소에 `<label for>` + `id` 연결
- [ ] `main` 안 `h1`은 하나, 제목 단계를 건너뛰지 않음(R-39)
- [ ] 이유 없는 wrapper 없음 — 자식 하나만 감싸는 `div` 0건

## 접근성 (R-11~R-14, R-16, R-21, R-22, R-28, R-33)

- [ ] reset.css 전역 초점 링(`0.4rem solid var(--color-border-primary)`) 유지
- [ ] `:focus { outline: none }` 0건
- [ ] 색상만으로 정보 전달하지 않음 (아이콘 또는 텍스트 병행)
- [ ] 색상 대비 4.5:1 이상 (큰 텍스트 24px/18.67px bold 3:1)
- [ ] `prefers-reduced-motion` 대응. 로딩 표시 밖 무한 반복 0건, 기능형 화면의 스크롤 진입 모션 0건(R-22)
- [ ] 자동 전환에는 정지 버튼(첫 초점), 무한 롤링 마키·자동 재생 영상 0건(R-33)
- [ ] `html lang` 있음(R-21), viewport 확대 차단 없음(R-28)
- [ ] 인터랙티브 컴포넌트의 필수 ARIA 속성(R-16)
- [ ] 터치 타겟 ≥ 44×44px (모바일 medium=48px 권장)
- [ ] `<a href="#main" class="skip-to-content">본문 바로가기</a>` 존재

## 반응형

- [ ] 모바일 퍼스트 작성 (기본 360 → tablet 768+ → laptop 1024+ → pc 1280+)
- [ ] 단순 속성 변경은 `@apply tablet:*` / `@apply laptop:*` / `@apply pc:*` 우선
- [ ] 직접 `@media`는 복잡한 중첩 선택자나 여러 하위 요소 동시 제어에만 사용
- [ ] 직접 `@media`는 관련 선택자 내부에 중첩되어 있고, 파일 하단에 브레이크포인트별로 몰려 있지 않음
- [ ] Tailwind 기본 브레이크포인트(`sm:`/`md:`/`lg:`/`xl:`/`2xl:`) 또는 `@media (min-width: var(--breakpoint-*))` 사용 없음
- [ ] 루트 글자 크기 62.5% 고정 — 다른 값·vw 0건(R-31)
- [ ] 360px 넘는 모바일 고정 폭 0건, 360px에서 가로 스크롤 없음(R-48)
- [ ] 글자 1.3rem 미만 0건, body 1.6rem·본문 성격 요소 1.5rem 이상(R-38), 행간 1.5 이상·음수 자간 0건(R-24)

## 컴포넌트 카탈로그

- [ ] 기존 컴포넌트 카탈로그를 먼저 확인했는가
- [ ] 카탈로그 밖 패턴은 일회성 프로젝트 패턴인지, 공통 컴포넌트 후보인지 판단했는가
- [ ] 버튼은 KRDS 정의 4 variant (`--primary` `--secondary` `--tertiary` `--text`) × 5 size (`--xsmall` `--small` medium `--large` `--xlarge`) 안에 있음

## 콘텐츠·링크·카피 (R-23, R-30, R-32, R-43~R-47, R-50)

- [ ] 가짜·자리 콘텐츠 0건 — 채움 문구, placeholder 이미지 핫링크, 「질문 1」 연번 레이블, 「페이지 제목」 자리값, 지어낸 연락처·출처 없는 수치(R-23)
- [ ] 링크마다 실제 목적지 — `href="#"`·빈 값·`javascript:` 0건, 「더보기」만인 링크 이름 없음(R-30)
- [ ] 푸터에 「개인정보 처리방침」 링크가 실제 주소로 있음(R-32)
- [ ] 카피 톤 — 번역투·2인칭 「당신」·「지금 바로」 0건, 버튼은 「~하세요」가 아닌 동사형, 공공 화면 느낌표 0건(R-43)
- [ ] 근거 없는 최상급·공공 화면의 성과 홍보 어조·해요체 혼용 없음(R-44)
- [ ] 한국어 화면의 영문 전용 UI 레이블 0건, 언어 링크에 `lang`, 고르기만 해도 이동하는 select 0건(R-45)
- [ ] 확정되지 않은 공식 배너·정부 상징·운영기관 식별자 0건(R-46)
- [ ] 개인정보 수집 폼 — 목적·항목·보유 기간·거부권 고지, 미리 체크 없음, 주민등록번호 수집 없음(R-47)
- [ ] placeholder에는 예시만(R-50)

## 형태·템플릿 서명 (R-25, R-27, R-34~R-36, R-40~R-42, R-49, R-51)

- [ ] 장식 그라데이션·그라데이션 글자·글래스(`backdrop-*`)·큰 블러·색 글로 그림자 0건(R-34)
- [ ] 반경 1.2rem 이하, 알약 버튼 없음, 그림자 blur 2.4rem 이하(R-35)
- [ ] 이모지를 아이콘·불릿·배지·제목 장식으로 쓰지 않음(R-36), 아이콘은 카탈로그 스프라이트(R-27)
- [ ] 같은 section archetype 3연속 없음, 카드 안 카드 없음(R-25)
- [ ] 메인 히어로는 첫 섹션 하나 — 화면 높이·스크롤 유도 표시 없음, 기능형은 히어로 없음(R-42)
- [ ] 공공 화면: 모든 페이지 헤더에 통합검색, 메인 첫 화면에 과업 진입(R-40). 서브: 3단계 이상이면 브레드크럼, 첫 섹션이 비주얼 히어로가 아님(R-41)
- [ ] 공공·관리자 화면의 섹션 세로 여백이 밀도 프리셋의 1.5배 이하(R-49)
- [ ] 템플릿 서명 없음 — 제목 위 분류 표지(eyebrow), 순서가 아닌 01·02 번호, 모든 섹션 등장 효과, 굵은 색 옆선(R-51)
- [ ] 메인·랜딩: `docs/design-plan.md`가 있고 `references/design-intelligence.md` §8 렌더 비평 기록이 있다 — 만든 에이전트가 아닌 별도 평가자, 기계 검사 통과, 무거운 결함 문항 「예」 없음, 순서를 바꾼 두 번의 짝 비교, 사람 판정 「승인」

## 코딩 스타일

- [ ] 들여쓰기 2 spaces
- [ ] 따옴표 single quote
- [ ] 세미콜론 — CSS 사용, JS/HTML 미사용
- [ ] 주석 한국어
