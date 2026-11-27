# INFOMIND UX 팀 규칙 — KRDS 원칙 + Tailwind v4 (압축 버전)

대상: ChatGPT, Gemini, Claude 웹 — 시스템 프롬프트 또는 첫 메시지로 주입

> 손으로 관리하는 파일이다(`npm run build:prompts`가 만들지 않는다). 기준이 바뀌면 `CLAUDE.md`·`rules.json`·`references/`에 맞춰 직접 고친다. KRDS가 언제나 우선한다.

---

CSS: BEM(Block__Element--Modifier) + Tailwind v4 + ITCSS 5레이어(3-generic/4-elements/5-objects/6-components/7-utilities). **SCSS 사용 금지.** 표준 CSS nesting과 Tailwind v4 `@apply`/`@theme`/`@utility`는 허용.

토큰: 색은 `var(--color-*)`만 쓴다(R-01). 서체는 `var(--font-sans)`(본문)·`var(--font-heading)`(제목)·`var(--font-mono)`(고정폭)로만 쓴다(R-26). 간격·크기·글자 크기·반경·그림자·모션은 토큰이 아니다 — CSS 직접값이나 Tailwind rem 임의값(`p-[2.4rem]`, `text-[1.7rem]`)으로 쓴다. 루트 글자 크기는 62.5%로 고정이다(1rem = 10px, R-31). 그래서 Tailwind 기본 스케일(`p-4`, `text-sm`)은 37.5% 작게 렌더돼 쓰지 않는다(R-37). 토큰 출처는 `tokens/foundation.json`(불변) + `tokens/brand.json`(프로젝트가 고치는 유일한 파일) → `tokens/build/tokens.css`.

반응형: 모바일 퍼스트. 브레이크포인트는 4단계다 — 모바일 360 기준 / `tablet:` 768 / `laptop:` 1024 / `pc:` 1280. 글자 크기의 모바일→PC 전환은 768, 메인 메뉴↔전체메뉴 전환은 1024다. 단순 속성 변경은 CSS에서도 `@apply tablet:*` / `@apply laptop:*` / `@apply pc:*`를 우선하고, 복잡한 중첩 선택자나 여러 하위 요소 동시 제어만 관련 선택자 내부 중첩 `@media`로 작성한다. 파일 하단에 `@media`를 몰아두지 않는다.

컴포넌트는 기존 카탈로그 패턴을 우선 사용한다. 카탈로그 밖 패턴은 프로젝트 필요성과 공통화 가능성을 판단해 확장한다. 카탈로그: 폼/액션 `btn`·`check-radio`·`file-upload`·`form`·`select`·`switch` / 컨테이너 `accordion`·`card`·`disclosure`·`modal`·`side-panel`·`tab` / 내비게이션 `breadcrumb`·`footer`·`header`·`main-menu`·`mobile-menu`·`pagination` / 피드백 `alert`·`badge`·`notice-bar`·`progress`·`spinner`·`step-indicator`·`tag`·`toast`·`tooltip` / 콘텐츠 `calendar`·`carousel`·`error-page`·`list`·`table`.

메인·랜딩 페이지(`pageType: main`)는 `references/design-intelligence.md` 절차를 거친다. ① 대상에서 나온 컨셉 한 문장과 시그니처 장면을 정한다. ② 방향 라운드 — 구도·색 전략·표제 서체·장면 매체 가운데 두 축 이상이 다른 세 안의 첫 화면을 만들어 하나를 고른다. ③ `docs/design-plan.md`(서식 `contracts/design-plan.md`)에 색 면 지도, 서체, 블록별 형식을 적는다. ④ 구현한 뒤 360·768·1024·1280·1440 폭 캡처로 렌더 비평을 받는다 — 만든 에이전트는 자기 화면을 평가하지 않는다. 기계 검사를 통과한 캡처와 평가자 지시문(`contracts/render-critique-evaluator.md`)만 별도 평가자에게 주어 결함 문항의 예·아니오와 순서를 바꾼 두 번의 짝 비교를 받고, 직전 최고안을 이길 때만 채택한다. 평가자를 따로 둘 수 없으면 통과를 선언하지 않고 「사람 판정 필요」로 남긴다. 마지막 판정은 사람이 한다. 레시피 블록을 기본 모양 그대로 쌓은 화면은 규칙 검사를 통과해도 「전형적」 판정을 받는다. 서브·폼·게시판은 ①②를 생략하고 사이트의 기존 계획을 따른다.

콘텐츠와 카피: 채움 문구·자리값 제목·지어낸 연락처와 수치를 남기지 않는다(R-23). 링크는 실제 목적지와 그 목적지를 말하는 이름을 가진다 — `href="#"`·`javascript:` 금지(R-30). 문체는 합쇼체 사실 서술이고 버튼은 동사형(「신청하기」)이다 — 번역투·2인칭 「당신」·「~하세요」 버튼·공공 화면의 느낌표 금지(R-43·R-44). placeholder에는 예시만 둔다(R-50). 제목 위 분류 표지(eyebrow), 순서가 아닌 01·02 번호, 모든 섹션 등장 효과, 굵은 색 옆선은 템플릿 서명이다(R-51). 장식 그라데이션·글래스·색 글로(R-34), 이모지 아이콘(R-36), 1.2rem 넘는 반경(R-35), 화면 높이 히어로와 스크롤 유도 표시(R-42)를 쓰지 않는다. 영상은 자동 재생하지 않고 무한 반복은 로딩 표시에만 쓴다(R-22·R-33).

HTML 기본 골격은 큰 영역을 심플하게 잡고, `main` 안은 `section > .container` 구조로 둔다. HTML 컴포넌트화는 페이지 전체가 아니라 `main` 내부의 section 단위로 분리한다. 각 section은 `.container`를 직접 포함하고, heading 또는 `aria-labelledby`/`aria-label`로 접근 가능한 이름을 제공한다.

```html
<a href="#main" class="skip-to-content">본문 바로가기</a>

<header id="header" class="site-header">
  <div class="container">...</div>
</header>
<main id="main">
  <section class="section section--content" aria-labelledby="section-title">
    <div class="container">
      <h1 id="section-title">공지사항</h1>
      ...
    </div>
  </section>
</main>
<footer id="footer" class="site-footer">
  <div class="container">
    <nav aria-label="약관 및 정책"><a class="site-footer__link site-footer__link--important" href="/privacy">개인정보 처리방침</a></nav>
  </div>
</footer>
```

버튼 KRDS variant(4종): `--primary` `--secondary` `--tertiary` `--text`. KRDS size(5종): `--xsmall`(32) `--small`(40) medium(48, 기본) `--large`(56) `--xlarge`(64). 모바일은 medium 이상 권장.

클래스 이름: modifier는 허용 어휘(크기 `--xsmall`~`--xlarge`, 위계 `--primary`/`--secondary`/`--tertiary`/`--text`, 상태색 `--info`/`--success`/`--warning`/`--danger`/`--neutral` 등)에서만 고르고 `--blue`·`--big`·`--rounded` 같은 시각 단어는 쓰지 않는다. 카탈로그 블록의 클래스는 CSS에 정의된 것만 쓴다 — `card--featured`·`card__media`처럼 그럴듯한 변형·부품을 지어내지 않는다. 상태는 ARIA·hidden 속성을 먼저 쓴다(`aria-expanded`·`aria-current`·`aria-selected`·`hidden`·`disabled` — CSS가 속성 선택자로 모양을 바꾼다). ARIA로 표현할 수 없을 때만 BEM modifier(예: 단계 표시의 완료 `--done`)를 쓰고, `.is-*`·`.has-*`는 쓰지 않는다.

접근성 (KWCAG/WCAG 2.1 AA): 대비 4.5:1 (큰 텍스트 3:1), 터치 ≥44×44px (모바일 medium=48px 권장), `:focus-visible` (reset.css 전역 4px primary 외곽선 — 컴포넌트에서 제거 금지), skip-to-content 필수, `<img alt>` 필수, `<label for>+id` 필수, `div/span 클릭 핸들러 패턴` 금지.

하네스 없는 프로젝트의 자체 검증: 개발팀 기존 프로젝트처럼 infoUX 전용 `npm run check`, `scripts/check-violations.js`, `scripts/check-html-structure.js`가 없어도 검증을 생략하지 않는다. 먼저 프로젝트의 `package.json`, CI 설정, README에서 기존 `lint`/`build`/`test`/`a11y` 명령을 찾아 실행한다. 자동 하네스가 없으면 변경 파일을 직접 점검한다: raw 색상, Tailwind raw 컬러, SCSS 문법, `!important`, 핵심 CSS `:has()`, focus outline 제거, BEM 위반, 비-BEM 상태 클래스, 시각적 modifier, `div/span` 클릭, `alt`/`label`/ARIA 누락, skip link/page shell, 모바일 360px 터치 영역과 overflow. 최종 보고에는 자동 검증, 수동 대체 검증, 남은 수동 QA 항목을 구분해 적는다.

절대 금지: SCSS 파일/`@use`/`@forward`/SCSS 변수, raw hex/rgb/hsl 색상, Tailwind 기본 팔레트 raw 컬러, 옛 버튼 variant(`--ghost`/`--outline`/`--link`/`--sm`/`--lg`), `!important` (사유 주석 없을 시), 인라인 `style="..."` (CSS 변수 주입 외), BEM element 2단계 중첩(`.card__body__title`), 기존 인포마인드 HTML 골격을 무시한 임의 구조.

코딩: 2 spaces, single quote, 한국어 주석. 세미콜론 — CSS 사용, JS/HTML 미사용.

폰트: `--font-sans` 기본값은 Pretendard GOV → Apple SD Gothic Neo → Noto Sans KR → Malgun Gothic → system-ui → sans-serif(`tokens/brand.json`). 본문 1.7rem·행간 1.7, 제목 행간 1.5, 1.3rem 미만 글자 금지(R-24·R-38). `font-family` 직접값과 외부 폰트 호스트는 쓰지 않는다(R-26).
