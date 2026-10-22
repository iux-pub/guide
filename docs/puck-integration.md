# inSTACK Puck 대응 설계안

- 상태: 초안(검토 전). 정본이 아니다. 채택되면 계약(`contracts/`)과 기준 문서(`references/`)로 옮긴다
- 작성: 2026-10-22, infoUX 하네스 4.0.0 기준
- 근거 저장소(읽기만 함): `infomind-corp/INFO_INSTACK_CMS_WORK` main `2dba128`, `infomind-corp/INFO_INSTACK_PORTAL_WORK` main `212b10a`

inSTACK 콘텐츠는 CMS의 Puck 에디터에서 만들어 DB에 JSON으로 저장되고, 포털은 그 결과를 HTML로 받아 화면에 넣는다. 이 콘텐츠는 저장소 파일이 아니라서 `npm run check`가 한 번도 보지 못한다. infoUX가 막는 AI 슬롭·KRDS 위반이 에디터 경로로는 그대로 들어간다. 이 문서는 그 경로에 하네스를 거는 방법을 다룬다.

## 1. 현재 구조 (확인한 사실)

| 항목 | 현재 |
|---|---|
| 프레임워크 | CMS·포털 모두 Next.js 16.3.8, React 19.2.3, Tailwind v4 |
| Puck | CMS만 `@measured/puck` ^0.20.2 (현행 패키지 이름은 `@puckeditor/core`). 포털에는 puck 의존성이 없다 |
| 저장 | `CMS_CONTENT.CTT_DESC`에 Puck 데이터 JSON 문자열 |
| 포털 렌더 | 포털 `fetchRenderedContentHtml` → 백엔드 `GET /api/asset/site/{siteCd}/content/{cttId}/html`(`AssetSiteController`, CMS로 중계) → CMS `GET /api/puck/render/{siteCd}/{cttId}` → `htmlRenderer.ts`(약 1630줄)가 블록마다 HTML 문자열을 만든다 → 포털이 `sanitizeContentBody`를 거쳐 `.sub-page__body--puck` 안에 넣는다 |
| 에디터 렌더 | 각 블록의 React `render`. 캔버스 iframe에 사이트별 포털 CSS(`edtr.css`)를 넣는다 |
| 블록 | 기본 7종(`config.tsx`, 인라인 style) · KRDS 8종(`config.krds.tsx`, `krds-react`) · 회사소개 19종(`infomindPuckComponents`) · 사이트 커스텀(`entities/custom/puck`) |
| 계층 | 없다. `content` 배열 한 줄로 쌓는다(slot·DropZone 미사용). 탭·아코디언 항목은 `array` 필드의 textarea |
| 포털 CSS | `globals.css` → `../styles/style.css`(infoUX 기반) |
| 포털 보강 | `CmsRenderedContentEnhancer.tsx`가 렌더 뒤 gsap ScrollTrigger·Embla 자동 스크롤 캐러셀·카카오맵을 붙인다 |

## 2. 문제

### 2.1 렌더가 두 벌이고, KRDS 블록은 포털에서 사라진다

블록마다 에디터용 React `render`와 포털용 `htmlRenderer` 문자열 함수가 따로 있다. 둘은 손으로 맞춰야 하고, 이미 어긋나 있다.

- `htmlRenderer.ts`에는 `Krds*` 분기가 하나도 없다. `renderItem`은 모르는 타입에 빈 문자열을 돌려주고, 커스텀 렌더러(`renderCustomPuckItem`)의 기본값은 `null`이다. 그래서 KRDS 배지·디스클로저·아코디언·탭·긴급 공지·단계 표시·목록·표는 에디터 미리보기에는 보이고 포털에서는 빈 자리가 된다.
- 확인 범위(2026-10-22):
  - 코드 경로: 포털 → 백엔드 중계 → CMS `htmlRenderer`까지 다른 렌더 경로가 없다. `htmlRenderer.ts`는 2026-06-25 이후 6번 바뀌었고 `Krds*`가 들어간 적이 없다. `config.krds.tsx`의 KRDS 블록은 그 전부터 있었다. 렌더러 테스트에도 `Krds*` 사례가 없다.
  - 같은 유형의 결함이 이미 났다: `c9553d8`(2026-09-28) 「[TTA 2차 결함26] Puck Embed 블록이 포털 화면에 표시되지 않던 문제 — 서버 렌더러 Embed 지원」. 서버 렌더러에 분기가 없는 블록은 포털에서 사라진다.
  - 포크: inSTACK 기반 CMS 저장소 중 커스텀 렌더러를 덮어쓴 곳은 `INFO_ENCYNET_CMS_WORK` 하나이고, 거기에도 `Krds*` 분기가 없다(`AI_AIEC_CMS`·`EGOV_5_0_CMS_WORK`는 기본값).
  - 운영(`www.infomind.co.kr`, 사이트 `IN`): 공개 페이지 23개 중 Puck 본문 페이지 17개가 모두 인포마인드 회사소개 블록만 출력하고 `krds-` 마크업은 0건이다. 저장된 JSON에 KRDS 블록이 들어 있는지는 확인하지 못했다 — 사용자 콘텐츠 API(`/api/user/site/IN/…`)가 내부 토큰 없이 403을 돌려준다. 즉 **코드상 확정, 운영에서 지금 사라지고 있는지는 CMS 데이터 확인 필요**다.
- 부수 발견: 운영 메뉴의 `/product/agenticai/ai-chatbot` 링크가 404다.
- Puck 폴더의 `CLAUDE.md`는 포털에도 `config.krds.tsx`를 둔다고 쓰고, 같은 문서의 CSS 절과 포털 `package.json`은 포털에 Puck이 없다고 말한다. 문서가 실제와 어긋난다.

### 2.2 기본 블록이 하네스 규칙을 어긴다

| 블록 | 문제 | 규칙 |
|---|---|---|
| Heading | `h1`~`h4`를 자유롭게 고른다. 포털 페이지 제목이 이미 `h1`이라 본문에 `h1`이 또 생긴다. 크기를 인라인 `font-size: 1.1rem~2rem`으로 준다(62.5% 루트에서 11~20px) | R-39·R-41·R-38·R-07 |
| Button | 기본 `href`가 `#`, 기본 레이블이 '버튼'. 배경 `#2563eb` 직접값, `outline` 변형(폐기된 variant) | R-30·R-23·R-01·R-06 |
| Image | `alt`가 선택 입력이다 | R-09 |
| 공통 | 정렬(`align`)을 블록마다 고른다 — 가운데 정렬 남발이 쉽다. `Spacer`가 섹션 여백 체계 밖에서 간격을 만든다 | R-49·R-25 |

### 2.3 계층이 없다

평면 목록이라 `section > .container` 골격, 섹션 archetype, 섹션 제목 단계가 없다. 탭·아코디언 패널에는 글 한 덩어리만 들어가고 목록·표·이미지는 못 넣는다. 카드 그리드 같은 반복 구조도 만들 수 없다.

### 2.4 검사가 닿지 않는다

DB 콘텐츠는 저장소 밖이다. 포털 보강 스크립트의 스크롤 트리거·자동 스크롤도 검사 범위 밖이다(R-22·R-33).

## 3. 원칙

1. **정본은 infoUX 하네스다.** Puck 블록은 카탈로그(컴포넌트·섹션 archetype·클래스 어휘)를 소비만 한다. 블록이 새 디자인을 만들지 않는다.
2. **블록 마크업은 한 벌이다.** 블록마다 순수 함수 `toHtml(props, ctx)` 하나를 정본으로 둔다. 포털용 `htmlRenderer`는 이 함수를 그대로 부르고, 에디터 `render`도 같은 함수의 결과를 쓴다. 두 벌을 손으로 맞추지 않는다.
3. **스타일 값 필드를 두지 않는다.** 색·크기·여백·정렬을 자유롭게 고르는 필드는 없다. 변형은 `contracts/class-naming.json` 어휘의 select로만 고른다.
4. **마크업은 infoUX 클래스를 쓴다.** 포털 CSS가 infoUX 기반이므로 블록도 infoUX BEM 마크업(`btn btn--primary`, `section section--list`)을 낸다. `krds-react` 클라이언트 컴포넌트는 정적 HTML로 렌더되지 않고(2.1의 원인 중 하나), 포털 CSS와 다른 체계다.
5. **제목 단계는 계산한다.** 블록에 `level` 필드를 두지 않는다. 깊이에서 정한다(섹션 `h2`, 그 안 `h3`, 패널 안 `h4`).
6. **초안은 막지 않고 발행만 막는다.** 저장(autosave)은 자유, `onPublish`에서 게이트를 건다.

## 4. 블록 매핑

세 층으로 나눈다. 링크·이미지·배지처럼 작은 것은 블록이 아니라 필드로 받아 깊이를 줄인다.

### 4.1 층 구조

| 층 | 들어가는 곳 | 블록 |
|---|---|---|
| L0 루트(페이지) | — | 루트 필드: `pageType`(K-16 유형). `h1`은 포털 페이지 제목이 소유하므로 루트에 제목 필드를 두지 않는다 |
| L1 섹션 | 루트 `content` | archetype마다 섹션 블록 하나 + 섹션 변주 |
| L2 콘텐츠 | 섹션의 `body` slot | 컴포넌트 카탈로그 블록 |
| L3 패널 내용 | 탭·아코디언·카드의 slot | 글·목록·표·그림·링크만 |

### 4.2 섹션 블록 (L1)

`contracts/html-page-contract.json` `sectionArchetypes` 8종을 블록으로 낸다. 모두 같은 골격을 렌더한다.

```html
<section class="section section--{archetype}" aria-labelledby="{id}">
  <div class="container">
    <h2 id="{id}">{title}</h2>
    {body slot}
  </div>
</section>
```

| 블록 | archetype | 필수 필드 | 비고 |
|---|---|---|---|
| `SectionIntro` | intro | title, lead | 메인 페이지 첫 섹션 전용 |
| `SectionContent` | content | title | 기본 섹션 |
| `SectionList` | list | title | 공지·자료 목록 |
| `SectionForm` | form | title | 개인정보 폼이면 R-47 고지 블록 필수 |
| `SectionData` | data | title | 표·통계 |
| `SectionSearch` | search | title | |
| `SectionProcess` | process | title | 단계 표시·절차 |
| `SectionNotice` | notice | title | 안내·유의사항 |
| `SectionMedia` | (section-media 오브젝트) | title, 이미지(alt 필수) | 이미지-텍스트 교차 변주(R-25) |

### 4.3 콘텐츠 블록 (L2) — 현재 블록에서 옮기는 표

| 현재 | 새 블록 | 마크업(infoUX) | 바뀌는 점 |
|---|---|---|---|
| Heading | `Subheading` | `h3`/`h4` (깊이로 계산) | 섹션 제목은 섹션 블록이 가진다. `h1`·크기·정렬 필드 삭제 |
| Paragraph | `Text` | `p` | 정렬 필드 삭제 |
| Image | `Figure` | `figure > img + figcaption` | `alt` 필수, 또는 '장식 이미지' 선택 시 `alt=""` |
| Button | `ActionLink` | `a.btn.btn--{primary\|secondary\|tertiary\|text}` | `href` 필수(빈 값·`#` 불가), 레이블 기본값 없음, 변형은 KRDS 4종 |
| Embed | `VideoEmbed` | `iframe[title]` | `title` 필수 |
| Divider | `Divider` | `hr` | 그대로 |
| Spacer | 삭제 | — | 섹션 여백은 `.section` 오브젝트가 소유한다(R-49) |
| KrdsBadge | `Badge` | `badge` | 변형은 class-naming 어휘 |
| KrdsDisclosure | `Disclosure` | `disclosure` | 내용 = slot |
| KrdsAccordion | `Accordion` → `AccordionItem` | `accordion` | 항목 패널 = slot(글만이 아니라 목록·표도) |
| KrdsTab | `Tab` → `TabPanel` | `tab` | 패널 = slot |
| KrdsCriticalAlerts | `Alert` | `alert` | |
| KrdsStepIndicator | `StepIndicator` | `step-indicator` | |
| KrdsTextList | `List` | `list` | |
| KrdsTable | `Table` | `table` (caption 필수) | 데이터 표는 `caption` 필수 |
| (없음) | `CardGrid` → `Card` | `card` | 카드 반복 구조 |
| Infomind* 19종 | 사이트 커스텀으로 이동 | 각 블록 | 회사소개 전용이라 base에서 빼서 `entities/custom/puck`(사이트 fork)로 옮긴다. 같은 게이트를 통과해야 한다 |

## 5. slot 계층 조합 규칙

`@measured/puck` 0.20은 `slot` 필드를 지원한다(업그레이드 없이 가능). 규칙은 두 층으로 건다. 편집할 때 `allow`/`disallow`로 막을 수 있는 것은 편집기에서 막고, 순서·개수처럼 slot이 표현하지 못하는 것은 발행 게이트에서 막는다.

### 5.1 slot 허용 표 (편집기에서 막는다)

| 부모 slot | 허용 | 금지 | 근거 |
|---|---|---|---|
| 루트 `content` | 섹션 블록(L1)만 | 콘텐츠 블록 직접 배치 | R-15 `section > .container` |
| 섹션 `body` | 콘텐츠 블록(L2) | 섹션 블록 | 섹션 중첩 금지 |
| `CardGrid.items` | `Card`만 | — | |
| `Card.body` | `Text`·`Figure`·`ActionLink`·`Badge`·`List` | `Card`·`CardGrid`·`Tab`·`Accordion` | R-25 카드 중첩 금지 |
| `TabPanel.body`·`AccordionItem.body`·`Disclosure.body` | `Text`·`List`·`Table`·`Figure`·`ActionLink`·`Subheading` | `Tab`·`Accordion`·`Disclosure`·`CardGrid` | 위젯 안 위젯 금지(키보드·스크린리더 탐색이 꼬인다) |

`slot` 필드의 `allow`/`disallow`는 필드 정의에 둔다. Puck 문서에 따르면 렌더 함수의 `allow` prop은 아웃라인 드래그에서 지켜지지 않는다.

루트 `content`를 섹션만으로 제한하는 방법은 0.20에서 확인해야 한다(루트 설정의 slot 지원 여부). 안 되면 루트 제한은 5.2 게이트가 맡는다.

### 5.2 순서·개수 규칙 (발행 게이트에서 막는다)

| 규칙 | 판정 | 근거 |
|---|---|---|
| 섹션 깊이 | 루트 → 섹션 → 콘텐츠 → 패널 내용, 4단 초과 금지 | 탐색 단순성 |
| 제목 단계 | 렌더러가 깊이로 계산하므로 건너뛰기가 생기지 않는다. 데이터에 `level`이 남아 있으면 오류 | R-39 |
| `SectionIntro` | 메인 페이지(`pageType: main`)의 첫 섹션 하나만. 서브 페이지 금지, 기능형 프로필(cms-admin) 금지 | R-41·R-42 |
| 같은 archetype | 3연속 금지 | R-25 |
| 카드 그리드 섹션 | 연속 2개 경고, 3연속·페이지당 3개 이상 오류 | R-25 |
| 필수 필드 | 섹션 title, Figure alt(또는 장식 표시), ActionLink href·label, Table caption, VideoEmbed title | R-09·R-30·R-15 |
| 알 수 없는 블록 | 렌더러가 없는 블록 타입(2.1의 KRDS 누락 같은 사고) | — |

## 6. 발행 게이트

### 6.1 흐름

```
편집(onChange → 초안 저장, 막지 않음)
  └ 발행(onPublish)
      └ CMS 서버 액션 validatePuckPublish(siteCd, data)
          1) 데이터 검사 — 5.2 규칙을 JSON 트리에서 본다 (빠르고 블록 id를 바로 안다)
          2) 렌더 검사 — renderPuckHtml(data)를 포털과 같은 껍데기로 감싸 infoUX 검사 엔진에 넣는다
          3) 결과: 오류 → 발행 차단, 경고 → 확인 후 발행
```

렌더 검사의 입력은 포털이 실제로 받는 `htmlRenderer` 출력이다. 에디터 React 렌더가 아니라 이 출력을 검사해야 시민이 보는 화면을 검사하게 된다. 껍데기는 포털 서브 페이지와 같게 둔다.

```html
<main id="main"><div class="sub-page__body sub-page__body--puck">{renderPuckHtml 결과}</div></main>
```

### 6.2 렌더 출력에 거는 규칙

이미 하네스에 있는 라이브러리는 HTML 문자열을 받는 순수 함수라 그대로 쓸 수 있다.

| 라이브러리 | 규칙 |
|---|---|
| `content-quality.js` | R-09 alt 품질, R-30 링크 이름, R-50 placeholder |
| `copy-rules.js` | R-23 가짜·자리 콘텐츠, R-43 카피 톤, R-44 최상급·해요체 |
| `page-rules.js` (일부) | R-30 목적지 없는 링크, R-33 자동 전환, R-45 언어, R-47 개인정보 폼 |
| `visual-signature.js` | R-01 인라인 style의 raw 색, R-34 장식 효과, R-36 이모지 |
| `type-floor.js` | R-38 최소 글자, R-24 한글 조판 |
| `shape-motion.js` | R-35 반경, R-22 모션 |
| `icon-usage.js` | R-27 아이콘 |

뺄 규칙: 페이지 껍데기 규칙(R-14 건너뛰기 링크, R-32 푸터, R-40 헤더 통합검색, R-41 브레드크럼)은 포털 레이아웃이 소유한다. 이 규칙은 포털 저장소의 `npm run check`가 맡는다.

### 6.3 결과를 블록에 돌려 주기

렌더러가 각 블록 최상위 요소에 `data-puck-id="{item.props.id}"`를 붙인다. 검사 결과의 줄에서 가장 가까운 `data-puck-id`를 찾아 블록으로 되짚고, 에디터에서 그 블록을 강조한다. 포털 출력에서는 속성을 지우거나 남겨도 무해하다.

### 6.4 우회 막기

- 발행 상태 전환은 CMS 서버 액션만 할 수 있게 한다. 백엔드(INSTACK API)가 발행 전환 API를 따로 열어 두면 같은 검사를 거기서도 부른다.
- 사이트 단위 `contentSources`·`exceptions`(CT-03)는 `CMS_SITE` 설정에 둔다. `infoux.json`과 같은 형식이고, 만료된 예외는 인정하지 않는다.

### 6.5 infoUX 쪽에서 할 일

- 검사 엔진을 패키지로 낸다. 지금 검사기는 파일을 읽는 CLI다. 라이브러리 묶음을 `checkHtmlFragment(html, ctx)` 한 진입점으로 감싸 npm 패키지(가칭 `@infomind-ux/infoux-checks`)로 발행한다. 판정 자료(`contracts/*.json`)를 함께 담는다.
- 블록 등록부를 계약으로 둔다. `contracts/puck-blocks.json`에 블록 id·archetype·slot 허용 목록·필수 필드·클래스 변형 어휘를 적는다. Puck 설정의 뼈대와 데이터 검사기가 이 파일 하나에서 나오게 한다.

## 7. 단계

| 단계 | 내용 | 효과 |
|---|---|---|
| P0 사고 막기 | KRDS 블록 포털 누락 확인·수정. Button 기본 `href="#"`·레이블 '버튼' 제거, 기본 블록의 raw 색 제거. Heading에서 `h1` 선택지 제거 | 지금 있는 콘텐츠의 깨짐·위반을 멈춘다 |
| P1 발행 게이트 | 검사 엔진 패키지화 + `validatePuckPublish`(데이터·렌더 검사). 평면 구조 그대로 건다 | 블록을 바꾸기 전에 슬롭 유입을 막는다 |
| P2 블록 재정의 | 4장 매핑대로 블록을 infoUX 마크업·단일 렌더 정본으로 바꾸고 섹션 slot 계층을 넣는다 | 렌더 두 벌 문제와 계층 부재를 없앤다 |
| P3 레시피 | `references/korean-web-patterns.md` 서브 골격을 Puck 초기 데이터 템플릿으로 낸다 | 빈 화면에서 시작하지 않는다 |

### 데이터 이전 (P2)

기존 `CTT_DESC`는 평면 목록이다. 이전 스크립트가 다음처럼 바꾼다.

- 블록 전체를 `SectionContent` 하나로 감싼다. 첫 `Heading`이 있으면 그 글을 섹션 제목으로 쓴다
- 이후 `Heading`은 새 섹션의 경계로 쓴다(`h2`급) 또는 `Subheading`(`h3`급)으로 바꾼다
- `Spacer`는 지운다. `Krds*`는 4.3 표의 새 블록으로 바꾼다
- 이전 결과에 발행 게이트를 돌려, 오류가 남는 콘텐츠 목록을 담당자에게 넘긴다

## 8. 열린 질문

1. 저장된 콘텐츠(`CMS_CONTENT.CTT_DESC`) 중 `Krds*` 블록을 쓰는 것이 있는가 — 있으면 지금 포털에서 빠지고 있다. CMS 관리자나 DB 조회로 확인한다
2. 블록 마크업을 `krds-react`에서 infoUX BEM으로 바꿔도 되는가(포털 CSS가 infoUX 기반이라는 전제 확인)
3. `@measured/puck` → `@puckeditor/core` 이전 시점
4. 발행 상태 전환이 CMS 서버 액션 말고 다른 경로(백엔드 API·일괄 처리)로도 일어나는가
5. 회사소개 19종을 base에서 사이트 커스텀으로 옮겨도 되는가
6. GS 인증 대응으로 기본 블록을 일부 원복한 건(2026-10-16 주간보고)과 P0 수정이 겹치는가
7. 포털 보강 스크립트의 스크롤 트리거·자동 스크롤 캐러셀을 R-22·R-33 기준으로 손볼지
