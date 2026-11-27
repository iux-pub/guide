# infoUX — INFOMIND UX 작업 컨트랙트

> 이 문서는 권장이 아니라 컨트랙트다.
> infoUX 기준을 쓰는 작업에서 LLM은 아래 규정 밖의 결정을 임의로 하지 않는다.
> 오류 규칙 위반을 발견하면 작업을 중단하고 사용자에게 보고한다.

---

## 0. 컨트랙트 발효 조건

별도 트리거 문구는 없다. 이 저장소, 또는 infoUX MCP를 등록한 프로젝트에서 CSS·HTML·UI 작업을 시작하면 컨트랙트가 발효된다.

- 구현 전에 `contracts/task-contract.md` 형식으로 사이트 유형, 핵심 과업, 페이지 패턴, 재사용 컴포넌트, 위젯, 예외를 선언한다.
- 작업 절차는 infoUX MCP `get_workflow`로, 기준 문서는 `get_reference`로 받는다.
- 수정 파일과 가장 가까운 `AGENTS.md`를 읽는다.

발효된 뒤에는 LLM이 자기 판단으로 규정을 우회하거나 예외로 처리하지 않는다.

---

## 1. 금지 (MUST NOT)

규칙 번호와 심각도의 정본은 `rules.json`이다(MCP `get_rules`). 아래 표는 자주 걸리는 항목을 추린 것이다.

### 1.1 오류 규칙 — 위반하면 작업을 중단한다

코드를 더 쓰지 않고 사용자에게 보고한다.

| 규칙 | 항목 | 금지 사유 |
|------|------|----------|
| **R-01** | 색상 raw hex/rgb/hsl 직접 작성 (`#fff`, `rgb(0,0,0)`) | KRDS 토큰만 허용 |
| **R-01** | Tailwind 기본 팔레트·흑백 유틸(`bg-gray-50`, `text-white`), 임의값·style 속성·var 폴백 안의 raw 색 | 색은 어디에 쓰든 `var(--color-*)` — 그림자의 KRDS 검정 알파 3값만 한시 허용 |
| **R-34** | 장식 효과 — 장식 그라데이션·그라데이션 글자·글래스(`backdrop-*`)·4px 이상 블러·컬러 글로우 그림자 | AI 슬롭 서명(AP-3·AP-4), KRDS에 없는 효과. 스크림과 검정 알파 그림자만 |
| **R-36** | 이모지를 아이콘·불릿·배지·제목 장식으로 사용 | 토큰·고대비를 따르지 못한다 — 아이콘은 카탈로그(R-27) |
| **R-37** | Tailwind 기본 타입·행간·간격·컨테이너 스케일(`text-sm`, `leading-6`, `p-4`, `max-w-md`) | 62.5% 루트에서 37.5% 작게 렌더된다 — rem 임의값(`p-[1.6rem]`) |
| **R-23** | 가짜·자리 콘텐츠 — 채움 문구, placeholder 핫링크, '자주 묻는 질문 1·2' 연번 레이블, '새 프로젝트'·'페이지 제목' 같은 자리값 제목, 064-000-0000·○○·example 도메인 같은 비실재 표기를 납품 페이지에 남김 | 검수 신뢰가 깨진다 — 실제 문안은 `contentSources`에서 |
| **R-30** | 실제 목적지 없는 링크(빈 값·`#`·`#none`·`javascript:`) | 이동은 실제 주소의 a, 동작은 button |
| **R-33** | 정지 버튼 없는 자동 전환·자동 재생, 무한 롤링 마키 | KRDS 캐러셀·WCAG 2.2.2 |
| **R-35** | 1.2rem 넘는 반경, 지정 블록 밖 알약(pill) 반경 | KRDS Shape(최대 12px) |
| **R-42** | 히어로 여러 개·중간 히어로, 화면 높이 히어로, 스크롤 유도 화살표 | 공공·업무 hero는 화면 1/2 이하(AP-7) |
| **R-38** | 1.3rem 미만 글자, body 1.6rem·설명 요소 1.5rem 미만 | KRDS 최소 13px·본문 16px |
| **R-39** | main 안 h1 여러 개, 제목 단계 건너뛰기 | 제목 구조(WCAG 1.3.1) |
| **R-32** | 푸터에 '개인정보 처리방침' 링크가 없거나 주소가 비었음, 옛 명칭(개인정보취급방침) | KRDS 필수 명칭·공개 의무 |
| **R-40** | 공공 화면 헤더에 통합검색 진입이 없음 | KRDS 검색 [필수] — 모든 화면에서 통합검색 |
| **R-41** | 브레드크럼·사이드 메뉴를 본문 바로가기 목적지 안에 둠, main 첫 제목이 h1이 아님 | KRDS component_03_01 · 페이지 제목 h1 |
| **R-45** | 영문 전용 UI 레이블(VIEW MORE), lang 없는 언어 링크, 선택만으로 이동하는 select | KRDS 국문 레이블·WCAG 3.1.2·3.2.2 |
| **R-46** | publicIdentity 미확정 상태에서 공식 배너·운영기관 식별자·정부 상징 생성 | 공식 정부서비스 사칭 방지 |
| **R-47** | 개인정보 동의에 목적·항목·보유 기간·거부권 고지 없음, 동의 미리 체크, 주민등록번호 수집 | 개인정보 보호법 |
| **R-48** | 모바일에서 360px 넘는 고정 폭, 모바일 기본 열 없는 다열 그리드 | 모바일 우선(KRDS 반응형) |
| **R-43** | 번역투·2인칭 마케팅 카피('당신', '~을 경험하세요', '지금 바로'), '~하세요'로 끝나는 버튼, 공공 화면의 느낌표 | 합쇼체 사실 서술 — 버튼은 KRDS 동사형('신청하기') |
| **R-03** | SCSS 사용 (`*.scss`, `@use`, `@forward`, `$var`) | Tailwind v4 + CSS Custom Properties만 허용 |
| **R-05** | BEM element 2단계 중첩 (`.card__body__title`) | 평탄화 — `.card__title` |
| **R-06** | 시각적 modifier(`--blue`, `--gray`)와 옛 버튼 variant(`btn--ghost`, `btn--outline`, `btn--link`, `btn--sm`, `btn--lg`) | 의미적 이름을 쓴다. 버튼은 KRDS 4 유형(`--primary`·`--secondary`·`--tertiary`·`--text`)과 5 크기(`--xsmall`~`--xlarge`)만 |
| **R-09** | 이미지 `alt` 누락 | WCAG 1.1.1 |
| **R-10** | `div/span 클릭 핸들러 패턴` 처럼 div를 인터랙티브로 쓰는 패턴 | 시맨틱 HTML 사용 (button/a) |
| **R-11** | `:focus { outline: none }` | 접근성 위반. focus-visible은 reset.css 전역 처리 |
| **R-12** | 색상 대비 부족 (일반 4.5:1 / 큰 텍스트 3:1 미만) | WCAG 1.4.3 — pa11y-ci 자동 검증 |
| **R-13** | 터치 영역 44×44px 미만 인터랙티브 요소 (모바일 컨텍스트) | WCAG 2.5.5 · INFOMIND 정책 |
| **R-14** | 페이지에 `.skip-to-content` 건너뛰기 링크 누락 | WCAG 2.4.1 — `<body>` 진입 직후 필수 |
| **R-15** | 기존 인포마인드 HTML 기본 골격을 무시한 임의 구조 | 유지보수 패턴 단절 |
| **R-16** | 인터랙티브 컴포넌트(modal/tab/accordion/tooltip/disclosure/carousel/calendar) 필수 ARIA 누락 | 스크린리더 접근 불가 |
| **R-17** | 비-BEM 상태 클래스 (`.is-active`, `.has-error`, `.is-open` 등) | 상태는 ARIA·hidden 속성을 먼저 쓴다. ARIA로 표현할 수 없을 때만 BEM modifier |
| **R-18** | 허용 어휘 밖·시각적 단어 modifier (`--blue`, `--red`, `--big`, `--rounded`, `--shadow` 등) | `contracts/class-naming.json` 허용 어휘에서만 고른다 (`references/class-naming.md`) |
| **R-29** | CSS에 없는 BEM 클래스 (`.card--featured`, `.card__media` 등 지어낸 변형·부품) | 카탈로그 블록의 클래스는 CSS에 정의된 것만 쓴다 |
| — | 폼 요소 `<label>` 누락 (placeholder만 사용) | WCAG 3.3.2 |

### 1.2 경고·안내 규칙 — 작업을 멈추지 않고 보고한 뒤 고친다

검사기가 경고(R-04는 안내)로 알린다. 납품 전에 고치거나 사유를 남긴다.

| 규칙 | 항목 | 사유 |
|------|------|----------|
| **R-02** | `!important` (정당한 사유 주석 없을 시) | 토큰 시스템 우회 위험 |
| **R-04** | BEM 형식(`.block__element--modifier`)을 벗어난 클래스명 — 5-objects·6-components 한정(안내) | 일관성 |
| **R-07** | 인라인 `style="..."` (CSS 변수 주입 외) | 토큰 추적 불가 |
| **R-08** | HTML 클래스 BEM 2단계 element 중첩 | R-05 HTML 적용 |
| **R-31** | 루트 글자 크기를 62.5% 밖으로 바꿈(축소·vw) | 사용자 글자 크기 설정과 rem 단계가 무너진다 |
| **R-44** | 근거 없는 최상급, 공공 화면 홍보 어조·해요체, 경어 혼용 | 합쇼체 사실 서술 |
| **R-49** | 공공·관리자 섹션 여백이 밀도 기준의 1.5배 초과 | 정보 밀도(profiles.json density) |

**모호한 케이스는 사용자에게 질문한다.** 자체 판단으로 우회하지 않는다.

---

## 2. 준수 (MUST)

| 항목 | 규정 |
|------|------|
| 사이트 유형 판정 | 코드 생성 전 `references/project-profiles.md` 기준으로 일반사이트/공공서비스/공공기관/CMS·관리자/커머스·예약 중 먼저 판정 |
| 색상 | `var(--color-*)` 시맨틱 토큰만 사용 |
| 간격/크기 | CSS 직접값 또는 Tailwind rem 임의값(`p-[2.4rem]`). 루트가 62.5%라 Tailwind 기본 스케일(`p-4`, `gap-2`, `max-w-md`)은 37.5% 작게 렌더돼 쓰지 않는다(R-37). CMS·관리자 화면은 정보 밀도에 맞게 조정 |
| 폰트 | `var(--font-sans)`, `var(--font-mono)` — 직접 폰트 패밀리 작성 금지 |
| 폰트 사이즈 | KRDS 타이포 표의 단계 값만 쓴다(R-38, `references/korean-web-patterns.md` §5). 토큰으로 만들지 않고 `text-[1.7rem]`처럼 rem 임의값으로 쓴다. `text-sm` 등 Tailwind 기본 크기는 쓰지 않는다(R-37) |
| CSS 작성 | 표준 CSS nesting 허용. Tailwind v4 `@apply`, `@theme`, `@utility` 사용 가능 |
| 반응형 작성 | 단순 속성 변경은 `@apply tablet:*` / `@apply pc:*` 우선. 복잡한 중첩 선택자만 관련 선택자 내부 `@media` 사용 |
| line-height | 본문 1.6~1.7(기본 1.7, 고밀도 1.6), 제목 1.5. 모든 텍스트는 150% 이상이다(R-24). `line-height: 1` 금지. 정본은 `references/art-direction.md` §2 |
| 반경/그림자 | CSS 직접값 또는 rem 임의값(`rounded-[0.8rem]`). 그림자는 KRDS 3단계 검정 알파(`#0000000d`·`#00000014`·`#0000001f`) 조합만 — 색 있는 글로우 금지(R-34) |
| z-index | CSS 값 또는 Tailwind 임의값(`z-[1050]`). 레이어 의미가 보이도록 주석 또는 클래스명으로 관리 |
| 모션 | CSS 값 또는 Tailwind 임의값(`duration-[200ms]`). 접근성 `prefers-reduced-motion` 고려 |
| 터치 영역 | 44px 이상 — 모바일 인터랙티브 요소 강제 |
| 브레이크포인트 | 360 / 768 / 1024 / 1280 (4단계, KRDS 표준형 small·medium·large·xlarge) — 글자 크기 전환 768, 메인 메뉴↔전체메뉴·서브 LNB 2단 1024 |
| 컨테이너 max-width | 1200px (KRDS contents-size) |
| BEM | `.block__element--modifier` (소문자, 하이픈) — 5-objects · 6-components 레이어에만 |
| ITCSS | 5-layer 순서: 3-generic → 4-elements → 5-objects → 6-components → 7-utilities (`tokens/`는 외부 소스) |
| @import (CSS) | Tailwind v4 `@import` 사용. SCSS `@use/@forward` 또는 `@import` 사용 금지 (SCSS 자체가 폐기됨) |
| 다크/고대비 | `[data-color-mode="high-contrast"]` 어트리뷰트로 자동 대응 — 컴포넌트 코드에 색 수동 분기 작성 금지 |
| HTML 기본 구조 | 큰 영역은 `header/main/footer`, `main` 안은 `section > .container` 구조 |
| HTML 컴포넌트화 | 페이지 전체가 아니라 `main` 내부의 section 단위로 분리 |
| 조건부 정부/공공 요소 | 공식 배너, 정부 상징, 운영기관 식별자, 공공 푸터 필수 링크는 적용 대상이 확인된 경우에만 생성. 민간·사내·일반 CMS에서는 N/A |
| Page shell | `<a href="#main" class="skip-to-content">` → `header#header` → `main#main` → `footer#footer` 순서. `main` 직계 자식은 section |
| Section 구조 | 각 `section`은 `.container`를 직접 포함하고 heading 또는 `aria-labelledby`/`aria-label`로 접근 가능한 이름 제공 |
| 컴포넌트 root 태그 | `references/html-semantics.md`는 참고 기준. 기존 패턴 위에 시맨틱/ARIA 보강 |
| 인터랙티브 위젯 ARIA | WAI-ARIA 1.2 APG 패턴 + KRDS 보강 — modal `aria-modal`+`aria-labelledby`, tab `role`+`aria-selected`+`aria-controls`, accordion `aria-expanded`+`aria-controls` 등 |
| 상태 표현 | ARIA·hidden 속성 먼저 — CSS가 `[aria-selected="true"]`·`[aria-current="page"]`·`[hidden]`으로 모양을 바꾼다. ARIA로 표현할 수 없을 때만 BEM modifier(`.step-indicator__item--done`) (R-17) |
| modifier 어휘 | `contracts/class-naming.json` 허용 어휘에서만 고른다 — 크기 `--xsmall..--xlarge`, 위계 `--primary/--secondary/--tertiary/--text`, 상태색 `--info/--success/--warning/--danger/--neutral` 등. 카탈로그 블록의 변형은 CSS에 정의된 것만 쓴다(R-18·R-29). section 목적 modifier(`--intro/--content/--list/--form/--data/--search/--process/--notice`)는 `html-page-contract.json`. 결정 순서는 `references/class-naming.md` |

---

## 3. references — 작업 맥락별 로드 순서

필요한 문서만 읽는다. 전체를 한꺼번에 읽지 않는다. MCP에서는 `get_reference("문서 이름")`으로 받는다.

| 작업 맥락 | 로드 |
|-----------|------|
| 코드 생성 전 사이트 유형 판정 | `references/project-profiles.md` |
| 메인·랜딩(`pageType: main`) 설계 — 컨셉, 방향 라운드, 블록별 형식, 렌더 비평 | `references/design-intelligence.md` |
| 시선·클릭·피로·답답함·선호의 실증 근거와 거기서 나온 화면 기준 | `references/user-behavior.md` |
| 한국형 메인 레시피, 서브·헤더·푸터 관행, 캐러셀 규칙, 한글 타이포 규칙 | `references/korean-web-patterns.md` |
| 표현 등급·타이포 페어링·팔레트 프리셋·한글 조판 판단, 납품 전 리뷰 | `references/art-direction.md` |
| 토큰 결정 (색상·기본 폰트·브레이크포인트) | `references/krds-tokens.md` |
| 컴포넌트 마크업 작성 — 시각/스타일 카탈로그 | `references/krds-components.md` |
| 컴포넌트 마크업 작성 — 인포마인드 기본 골격·ARIA·키보드 | 기존 인포마인드 구축 사이트 HTML + `references/html-semantics.md` |
| 클래스 이름·modifier 어휘 결정 | `references/class-naming.md` |
| Tailwind 유틸리티 사용 | `references/tailwind-mapping.md` |
| 접근성 검증 | `references/accessibility.md` |
| 코드 검토 — 무엇을 막을지 | `references/forbidden-patterns.md` |
| 원칙이 서로 충돌할 때 | `references/trade-off-rules.md` |
| 배포·납품 전 점검 | `references/release-checklist.md` |
| 개발팀 레포에 infoUX 기준 붙이기(MCP 등록) | `references/guide-import.md` |

---

## 4. 작업 시작 전 자가 점검

코드를 한 줄이라도 작성하기 전에:

1. ✅ 사이트 유형을 일반사이트, 공공서비스, 공공기관, CMS·관리자, 커머스·예약 중 하나로 판정했는가?
2. ✅ 정부 상징/공식 배너/운영기관 식별자 적용 여부가 확인됐는가? 확인되지 않았으면 생성하지 않았는가?
3. ✅ 사용하려는 색상은 `--color-*` 시맨틱 토큰인가?
4. ✅ 폰트는 `--font-sans` 또는 `--font-mono` 기준인가?
5. ✅ CSS nesting과 `@apply`를 쓰더라도 결과 구조가 읽기 쉬운가?
6. ✅ 기존 컴포넌트 패턴으로 해결 가능한가?
7. ✅ `main` 직계는 section이고 각 section에 `.container`와 접근 가능한 이름이 있는가?
8. ✅ 인터랙티브 요소는 `<button>`/`<a>`/시맨틱 HTML인가?
9. ✅ 이미지 `alt`, 폼 `<label>`, focus 처리 모두 충족했는가?
10. ✅ 모바일 터치 영역 44px 이상인가?

위 10개 중 하나라도 No면 **작성 중단 → 사용자에게 어느 항목이 막히는지 보고** + 어떻게 해결할지 옵션 제시.

---

## 5. 옛 시스템 흔적 발견 시

이전 infoUX (KRDS 미적용 시절) 흔적을 발견하면:

- 옛 토큰명 (`--color-text-secondary`, 옛 spacing/font-size/radius/transition/leading 토큰) → 현행 토큰 또는 프로젝트 규칙으로 교체 권장
- 옛 variant (`btn--ghost`, `btn--outline`, `btn--link`) → KRDS 4 variant로 매핑
- SCSS 파일 (`*.scss`, `@use`, `@forward`) → CSS로 마이그레이션 필요 (SCSS 폐기됨)

**자동 마이그레이션은 하지 말고, 사용자에게 어디를 바꿀지 보고**한 후 명시적 지시받고 진행한다.

---

## 6. 작업 후 검증

infoUX 하네스가 설치된 프로젝트에서는 가능한 범위에서 다음을 실행한다:

```bash
npm run check
npm run lint
npm run build
npm run test
```

외부 개발팀 프로젝트처럼 infoUX 하네스가 없는 경우에도 자체 검증을 생략하지 않는다.

1. 프로젝트의 `package.json`, CI 설정, README에서 기존 `check`/`lint`/`build`/`test`/`a11y` 명령을 먼저 찾아 실행한다.
2. `scripts/check-violations.js`, `scripts/check-html-structure.js`, `pa11y`/`axe` 설정이 없으면 변경 파일을 직접 점검한다.
3. 직접 점검 최소 항목:
   - raw `hex`/`rgb`/`hsl`, Tailwind raw 컬러 유틸, SCSS 문법, `!important`
   - 핵심 CSS의 `:has()` 의존, `:focus { outline: none }`
   - BEM 2단계 element, 비-BEM 상태 클래스, 시각적 modifier
   - `div/span` 클릭 핸들러, 이미지 `alt`, 폼 `label`, 필수 ARIA, skip link/page shell
   - 모바일 360px 기준 터치 영역 44px 이상, 텍스트 겹침, 가로 overflow
4. 최종 보고에는 실행한 자동 검증, 대체한 수동 검증, 남은 수동 QA 항목을 구분해 적는다.

위반 발견 시 **즉시 작업을 중단하고 사용자에게 위반 항목·근거·수정 옵션을 보고**한다.

---

## 7. 모호함 해소 — 사용자에게 질문할 케이스

다음은 자체 판단 금지. 사용자에게 묻는다:

- 새 컴포넌트를 공통화할지 일회성 프로젝트 패턴으로 둘지 모호
- 사이트가 일반사이트/공공서비스/공공기관/CMS·관리자/커머스·예약 중 무엇인지 모호
- 공공기관 프로젝트지만 공식 배너, 정부 상징, 운영기관 식별자 적용 여부가 확인되지 않음
- 간격·밀도를 프로젝트에 맞게 얼마나 조정할지 모호 (본문·제목 크기와 자간·행간은 KRDS 타이포 표 값만 쓰므로 조정 대상이 아니다 — R-38, `references/korean-web-patterns.md` §5)
- 두 토큰 중 어느 쪽이 적절한지 모호 (예: `--color-text` vs `--color-text-bolder`)
- 옛 시스템 흔적을 발견 — 어떻게 처리할지
- 모바일/PC에서 다른 동작이 필요한데 어느 브레이크포인트에서 분기할지 모호

---

## 8. 카탈로그에 없는 컴포넌트 요구 시

카탈로그(`references/krds-components.md`)에 없는 컴포넌트가 필요해 보이면:

1. 기존 컴포넌트 조합으로 해결 가능한지 먼저 확인
2. 새 패턴이 더 적절하면 사용자에게 근거 보고
3. 옵션 제시:
   - (a) 일회성 프로젝트 패턴으로 구현
   - (b) 공통 컴포넌트 후보로 등록
4. 공통화 가치가 있으면 코드 주석이나 문서에 `/* TODO: UX팀 정식 컴포넌트화 검토 */` 명시

---

## 9. 출처 — 단일 소스

기준 본체는 이 저장소의 `references/`다. 직접 쓰는 문서와 생성물이 함께 있다. 생성물은 원본을 고친 뒤 다시 만든다.

- 토큰 출처: `tokens/foundation.json`(불변 계층) + `tokens/brand.json`(프로젝트가 고치는 유일한 토큰 파일)
- 컴포넌트 출처: `src/styles/6-components/*.css` + `src/snippets/*.md`
- 규칙 출처: `rules.json`
- 생성물: `references/krds-tokens.md`, `references/krds-components.md`, 문서 안의 자동 생성 구간. 직접 고치지 않고 `npm run build:references`로 다시 만든다
- 배포: `npm run build:mcp` → MCP 번들(`mcp/data/`) → infoUX MCP. 팀원은 서버 등록만 하면 최신 기준을 받는다

---

## 10. 분쟁 시 우선순위

규정이 충돌하면 위에서부터 따른다. 정본은 `references/korean-web-patterns.md` KP-02이고, 판단 방법은 `references/trade-off-rules.md`에 있다.

1. **접근성(WCAG 2.1 AA·KWCAG) = KRDS 컴포넌트·패턴 지침** — 둘은 같은 최상위다. 양보하지 않는다. KRDS가 금지하거나 권장하지 않는 패턴은 관찰 빈도나 절충안으로 허용하지 않는다
2. **과업 완수** — 프로젝트 목적과 사용성. CMS·관리자 화면은 업무 밀도와 반복 효율이 먼저다
3. **한국 관행** — `references/korean-web-patterns.md`의 레시피와 관행. 관행이 과업을 해치면 근거를 갖춰 바꾼다
4. **브랜드 표현** — 프로젝트 스타일과 CSS 확장. 표현 등급 안에서 쓴다

서열과 별개로 지키는 전제:

- 사이트 유형 판정 — 정부 아이덴티티 요소는 적용 조건이 확인된 경우에만 만든다
- 토큰 — `tokens/foundation.json`은 프로젝트에서 고치지 않는다. 브랜드 색과 기본 폰트는 `tokens/brand.json`에서 바꾼다
- 사용자 명시 지시가 1번과 부딪히면 진행하지 않고 사용자에게 확인한다

---

> 컨트랙트가 발효된 이상 모든 LLM 출력은 위 규정의 적용 대상이다.
> 규정에 모호한 부분이 있으면 자체 판단하지 말고 사용자에게 묻는다.
