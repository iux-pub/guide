# inSTACK 작업 가이드 (2-트랙)

인포마인드 UX팀이 퍼블리싱 결과물을 **정적 HTML/CSS로 넘길지(트랙 A)**, **inSTACK CMS에 Puck 컴포넌트로 직접 반영할지(트랙 B)** 를 선택해 작업하기 위한 가이드다. 두 트랙은 **같은 infoUX 기준(공통 코어)** 을 공유하므로, 트랙 A로 익힌 규약이 트랙 B에서 그대로 통한다.

> 이 문서는 실전 사례(인포마인드 홈페이지 리뉴얼, inSTACK CMS)를 분석해 도출했다. 결정 근거·미결 항목은 위키 [[CMS inSTACK STATUS]]와 결정 로그를 함께 본다.

---

## 0. 트랙 판정 — 이 작업은 A인가 B인가

| 조건 | 트랙 |
|---|---|
| 외부 정적 납품, npm 없는 개발자에게 전달, inSTACK 미사용 | **A (정적 퍼블리싱)** |
| inSTACK CMS로 운영되는 사이트, 편집자가 CMS에서 콘텐츠를 조립 | **B (inSTACK 직접)** |
| 준비/성격이 애매 | **A로 시작** — 코어가 같아 나중에 B로 승급 가능 |

핵심: **강제가 아니라 선택**이다. 프로젝트 성격과 퍼블리셔 준비도에 따라 고른다.

---

## 1. 공통 코어 (A·B 공유) — 먼저 지킨다

두 트랙 모두 infoUX 규약을 따른다. 이건 트랙과 무관하게 항상 적용된다.

- **색상은 시맨틱 토큰**(`var(--color-*)`), 간격·크기·타이포는 프로젝트 맥락값
- **접근성**: WCAG/KRDS — alt·label·ARIA·포커스·대비·터치 44px
- **시맨틱 마크업 + 이유 없는 wrapper 최소화** → `.claude/skills/info-design/references/html-semantics.md` §6.6
- **BEM**(5-objects·6-components), 표준 CSS nesting + Tailwind v4 `@apply`
- **cascade layer** 우선순위: `base, components, utilities`

상세 규약의 단일 원본은 `iux-pub/guide`의 `rules.json`(→ CLAUDE.md·AGENTS.md·site/conventions 자동 생성)이다. 위키에 복제하지 않는다.

---

## 2. 트랙 A — 정적 퍼블리싱

현재 starter 워크플로우 그대로다. `src/styles/`에서 편집하고 `npm run build`로 `dist/`를 생성해 HTML에 연결한다. 상세는 [PUBLISHER_GUIDE.md](PUBLISHER_GUIDE.md).

- 원본: `src/styles/**` (BEM + `@apply`)
- 산출물: `dist/css/style.css` (커밋 대상 — 수동 개발자 전달용, 커밋 전 `npm run build` 필수)
- 결과물(HTML/CSS)을 개발팀이 받아 이식

---

## 3. 트랙 B — inSTACK 직접 적용

inSTACK CMS에 Puck 컴포넌트로 콘텐츠를 반영한다. UX팀은 **퍼블리싱(마크업·스타일)까지 커밋**하고, 개발팀이 **기능 코드를 얹어 배포**한다.

### 3.1 아키텍처 — 3-repo 구조

| repo | 역할 | 스택 | UX팀 관여 |
|---|---|---|---|
| **CMS** (`INFO_INSTACK_CMS_WORK`) | 어드민 + Puck 페이지 빌더 | Next 16 / React 19 / Puck 0.20 / Tiptap / krds-react | **Puck config·마크업** |
| **PORTAL** (`INFO_INSTACK_PORTAL_WORK`) | 방문자용 최종 표시 | Next 16 / React 19 / krds-react | **콘텐츠 CSS(edtr.css 원본)** |
| **API** (`INFO_INSTACK_API_WORK`) | 백엔드·DB·렌더 프록시 | Spring Boot / eGovFrame / Oracle | **없음** (개발팀 전담) |

**데이터 흐름:**
```
[제작] CMS Puck 에디터로 페이지 작성 (config.krds.tsx 블록)
   → Puck JSON
[저장] API → Oracle (cttDesc 컬럼)
[표시] 포털 방문 → API → CMS /api/puck/render (JSON→HTML) → 포털에 주입
```
렌더 실체(JSON→HTML)는 **CMS**가, 최종 스타일은 **포털 CSS**가 담당한다. API는 저장·프록시만.

**작업 경계:**
- ✅ UX팀: CMS `puck/config.tsx`·`config.krds.tsx`·`infomindPuckComponents.tsx`·`InfomindCompanyIntro.tsx`(마크업), 포털 `src/styles/6-components/*.css`(스타일), 토큰
- ❌ 건드리지 않음: `actions.ts`·인증/권한·`proxy.ts`·빌드설정·API 전체·iframe 방어코드(`KrdsEditorIframe.tsx`)

### 3.2 로컬 셋업

퍼블리셔는 **CMS + Portal 프론트 2개만** 로컬 실행한다. Java/DB/백엔드는 몰라도 된다.

**최초 1회 셋업** — 각 repo에서 `.env.example`을 `.env.local`로 복사하고, **개발팀이 안내하는 dev API 주소**를 넣는다(CMS `API_URL`, Portal `PORTAL_API_URL`). 로컬 `yarn dev`는 `.env.local`을 읽으며, 이 파일은 gitignore라 개인 로컬 설정으로 유지된다.

```bash
cp .env.example .env.local   # 각 repo, API 주소 입력(개발팀 안내값) — 최초 1회
cd INFO_INSTACK_CMS_WORK    && yarn dev   # :3000
cd INFO_INSTACK_PORTAL_WORK && yarn dev   # :3001
```
> 개발팀이 dev API에 localhost origin 허용(CORS) + 퍼블리셔 로컬 계정을 제공한다. (`.env.dev`는 dev **배포**용이라 로컬 `dev`가 읽지 않는다 — 로컬은 `.env.local` 기준.)

**디자인 확인은 CMS 에디터 미리보기까지 로컬**로 한다(프론트 완결). 포털 최종화면은 dev 배포 후 확인한다(시나리오 A). 로컬 포털에서 최종확인이 필요하면 개발팀과 렌더 프록시 오버라이드를 협의한다(시나리오 B).

### 3.3 Puck 컴포넌트 작성법

**config 3계층:**
- `config.tsx` — 기본 블록(Heading/Paragraph/Image 등). 외부 의존 0, **인라인 style만**
- `config.krds.tsx` — 기본 + infomind + KRDS 블록 병합. **실사용 전부 이걸 씀**
- `infomindPuckComponents.tsx` — 회사소개 블록 config(얇은 래퍼). 실제 마크업은 `InfomindCompanyIntro.tsx`에 BEM으로

**표준 패턴** (컴포넌트 = `components` 객체의 키 하나):
```tsx
InfomindSomething: {
  label: "블록 이름(한국어)",
  fields: { title: { type: "text", label: "제목" } },
  defaultProps: { title: "기본값" },
  render: (props) => <InfomindSomething {...props} />,  // BEM 마크업은 별도 컴포넌트에
},
```

**fields 6종만 사용**: `text` / `textarea` / `radio` / `select` / `number` / `array`. 커스텀 UI는 `type:"custom"`.

**새 블록 추가 체크리스트:**
1. 외부 의존 없는 인라인 style 블록 → `config.tsx`, KRDS/BEM 의존 → `config.krds.tsx`
2. `label` + `fields` + `defaultProps` + `render` 정의
3. **`categories` 배열에 키 등록** (안 하면 팔레트에 안 뜸)
4. 반복 항목은 `array` + `arrayFields` + `defaultItemProps` + `getItemSummary`
5. BEM 마크업은 `InfomindCompanyIntro.tsx`(또는 신규)에, **대응 CSS는 포털 `infomind-company.css`에** (§3.4)
6. 이미지는 `PuckImageField` 재사용(업로드 전용)

**함정 (모르면 막히는 것들):**
- **boolean 필드 없음** → `radio`의 `"true"/"false"` + render에서 `=== "true"`
- **`categories` 등록 누락** → 에디터에 안 보임
- **이미지 URL 직접입력 불가** → 업로드 전용, 저장값은 상대경로
- **URL은 `isSafeUrl()` 통과 필수** (`javascript:` 차단)
- **textarea 줄바꿈이 데이터 구조** (셀/태그 구분자)
- `resolveData` 미사용 — 도입은 팀 합의

### 3.4 CSS 규칙 (트랙 B의 핵심)

**single-source 메커니즘:** Puck 에디터·미리보기·포털이 **같은 CSS 한 벌**을 공유한다.
```
포털 콘텐츠 CSS (infomind-company.css) → 포털 빌드 → edtr.css
   → 백엔드 저장 → CMS same-origin 프록시(/api/user/site/{siteCd}/edtr.css)
   → Puck iframe <link> 로 주입
```
그래서 "에디터에서 보는 것 = 포털 결과"가 성립한다. **CMS는 CSS를 소유하지 않고 프록시만** 한다.

**🚨 제1규칙 — className과 CSS는 두 repo에 분리되어 있다:**
- 마크업(className): CMS `InfomindCompanyIntro.tsx`
- 스타일(CSS): 포털 `src/styles/6-components/infomind-company.css`
- **새 element/modifier는 반드시 양쪽 동시 추가.** 한쪽만 하면 스타일이 조용히 빠진다.

**UX팀 Puck 블록 스타일 수정 지점 = 포털 `infomind-company.css`.** 수정 후 포털 재빌드 → edtr.css 픽업 → CMS 프리뷰 반영. (신규 블록은 `6-components/index.css`에 `@import` 유지)

**admin CSS는 별개:** CMS `globals.css`·`tokens.css`는 어드민 UI 전용이고 Puck 블록엔 안 쓴다. iframe에 새면 오염원(`KrdsEditorIframe`이 제거) — UX가 `globals.css` 헤더 주석/구조를 바꾸면 방어 로직이 깨질 수 있으니 주의.

**토큰:** CMS `tokens.css`(관리자용)와 포털 토큰이 값이 갈라져 있다(drift). iframe 격리로 렌더는 안전하나, 토큰을 바꿀 땐 어느 쪽(관리자/포털)인지 구분한다. → [[CMS inSTACK STATUS]] "개발 원본 반영 대기" 참조.

### 3.5 알려진 이슈 (개발 원본 반영 대기)

CSS 정합성 점검(2026-07-08)에서 확인된 미세 드리프트. 렌더 붕괴는 없고 개발 원본에 반영 예정. 상세는 [[CMS inSTACK STATUS]]:
1. `infomind-ai-service__map-node--source` 모디파이어 미정의 (포털이 `:nth-of-type`로 대체 — DOM 순서 의존)
2. `infomind-history__container` 등 container 2건 미정의 (`.container`가 커버, 무해)
3. 토큰 drift (관리자 slate ↔ 포털 KRDS gray)

### 3.6 트러블슈팅

- **에디터가 포털과 다르게 보임** → iframe에 admin `<html>`/`<body>`/`globals.css`가 섞였는지 먼저 확인. 블록별 보정 CSS 추가 금지. → 위키 [[CMS Puck iframe portal CSS mismatch]]
- **CSS가 구버전** → `edtr.css` 응답에 최신 선택자가 있는지, 포털 재빌드/캐시 확인
- **저장했는데 포털에 안 나옴** → dev API에 `cttDesc` 저장됐는지 → CMS dev 서버 재시작

---

## 4. 개발팀과 맞물리는 항목

- **API 접근** ✅ — `.env.example`→`.env.local` 복사 + 개발팀 안내 dev 주소. 개발팀이 CORS(localhost) 허용 + 퍼블리셔 로컬 계정 제공
- **렌더 프록시** — 시나리오 A 기본(에디터 미리보기까지 로컬, 포털 확정은 dev). 로컬 포털 확인이 필요하면 B(`Globals.Cms.SiteUrl` 오버라이드) 협의
- **포털 CSS 재컴파일 흐름·주체** — UX가 `infomind-company.css` 수정 후 dev 반영 절차
- **Git 브랜치/핸드오프** — 개발팀 주관 (UX는 퍼블리싱 커밋까지)
- **config 양-repo 동기화** — 개발팀 배포 시 담당

---

**작성 근거**: 인포마인드 홈페이지 리뉴얼 + inSTACK CMS 소스 분석 (2026-07-08~09). 상세·미결은 위키 [[CMS inSTACK STATUS]] 기준.
