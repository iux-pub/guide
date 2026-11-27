# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- 장면 그림의 도해 층 · 일러스트 층(`design-intelligence.md` §5-10) — 직접 그린 첫 화면 장면을 「읽게 하는」 도해 층(강조색 하나, 선 두 단계, 4px 격자, 글자는 HTML)과 「보게 하는」 일러스트 층(바탕 · 중경 · 전경 세 무리, 대기 원근 · 물속 감쇠, 빛 방향 하나, 실측 형상)으로 나누고, 과학 일러스트 관례(절단면 해칭 · 치수선 끝 표시 · 축척 과장 표기), 글자 제거 시험, 렌더 후 원본 직접 수정, 한 장면 안 사진 · 그림의 결 맞추기를 적었다. 근거는 2026-11-25 공개 디자인 스킬 조사와 해양과학기술원 시안 s13 · s14 평가.
- R-34 그림 자산 검사 — img · picture로 넣은 독립 .svg 안 그라데이션은 빛 · 깊이 · 재질을 그릴 때만 쓰고, 보라 · 남색 계열은 그림 안에서도 오류다. `check-violations.js`가 인자로 받은 .svg와 납품 페이지가 넣은 SVG를 읽는다(로고 · 아이콘 · 스프라이트 제외, `svgAssetFindings` · `svgAssetRefs` · `isMarkAsset`, 단위 테스트).
- 렌더 비평 보강(`design-intelligence.md` §8, 평가자 지시문) — 계획 대조(과제 3: 계획의 시각 결정을 화면 서술로 바꿔 결함 · 짝 비교를 맡지 않은 평가자가 원본 크기로 눈으로 보이는지 답한다), 짝 비교 다섯 차원 답(장면 · 위계 · 면과 색 · 조판 · 마감 — 판정은 전체 답으로만), 회차마다 다듬기 · 전환 선택 기록(D01 · D02 · D03 · D17이 「예」면 전환이 기본), 이유가 반대로 갈린 짝 비교는 평가자를 늘리지 않고 갈린 차원과 함께 사람에게 묻고 견본 색인 `calibration`에 「짝 판정」으로 남긴다. 계획 서식에 「짝 비교 1·2 차원」「계획 대조」「다음 회차」 줄.
- 결함 문항 D17(디자인이 아니라 와이어프레임인가)과 §5-9 「와이어프레임과 디자인」, 렌더 관문 줄(1920×1080 첫 화면 다음 섹션 걸쳐 보임, 본문 선 밖 글자 0곳), `references/user-behavior.md`(사용자 행동 근거).
- 반슬롭 지침 반영 — §7-3 과교정 표(금지가 낳는 다음 기본값), §8-6 제거 테스트와 「고치는 회차에는 새 장치를 더하지 않는다」, R-44 대비 구문 표어 경고, 기본 CSS `scroll-padding-top` · `::selection` · 고정폭 숫자.
- 공기업·기관 메인 기준 — `design-intelligence.md` §3-4 레퍼런스 고르기(같은 분야 안에서 갤러리 평점·완성도가 높은 곳, 기준 갤러리 디비컷), §3-5 공기업·기관 메인(업무 자리 먼저 — 첫 화면 검색·자주 찾는 서비스, 두 번째 자리 알림마당, 정보공개·대표전화 — 그 위에 실적 수치 장면·사업영역 사진 판·넓은 브랜드 색 면·자기 부품 언어), §5-5 재료 원칙(실적 수치·기관 사진은 지어내지 않고 사람에게 요청, 생성 이미지는 분위기 사진에만), §8-1 그래픽 가속·화면 단위 스크롤 캡처. 2026-11-13 제주관광공사 공기업 메인 시안의 운영자 판정 원문과 분리 평가자 짝 비교 결과를 근거로 적었다.
- 블록 카탈로그에 공기업 메인 블록 4종(`service-gate` 업무 판 첫 화면 — 입체 아이콘 이미지·스프라이트 아이콘 둘 다 받는다, `notice-board` 알림마당 + 접수 중 색 면 상자, `field-accordion` 사업영역 사진 아코디언 — :has() 없이 키보드 초점으로도 펼친다, `open-panel` 짙은 정보공개 판 + 대표전화)과 견본 조합 `public-enterprise`를 더했다. 출처는 「견본 — 운영자 판정 대기」다.
- `scripts/capture.js`(`npm run capture`, 스타터 동기화) — `shots`(그래픽 가속 전체 페이지 구간 캡처 + 가로 넘침 측정), `scroll`(스크롤 연출 사이트를 화면 단위로), `alpha`(흰 바탕 그림 → 투명 PNG). 단위 테스트 `scripts/__tests__/capture.test.js`.
- 기준 견본 색인에 E-04~E-07(제주관광공사 메인 E·H·I·J안 판정 이력)을 더하고 `verdict` 「대기」, 선택 칸 `case`·`reference`·`notes`·캡처 `source`를 받게 했다. 평가자 지시문에 「짝 비교 상대는 같은 분야 고평점 선정작」과 운영자 판정 사례 세 건을 더했다.
- 블록 카탈로그에 장면형 쇼케이스 블록 5종(`scene`·`news-deck`·`field-shore`·`link-lines`·`logo-row`)과 견본 조합(`src/blocks/sets.json` — `scene-showcase`·`split-cover`, MCP `compose_page({ set })`)을 더했다. 블록 예외 장치 — `block.json`의 `exceptions`(규칙 + 선택자 + 값 + 사유)를 `npm run build:blocks`가 `contracts/block-exceptions.json`으로 모으고, `check-violations.js`·`check-html-structure.js`는 등록된 조합만 통과시키며 적용 건수를 출력에 보인다(`scripts/lib/block-exceptions.js`). 표제 크기 상한·제목 행간 150%를 넘는 다섯 곳은 「KRDS 기준 밖 — 운영자 승인 대기」로 표시했다.
- 블록 카탈로그 — 메인·랜딩의 섹션 단위 실물 6종(`cover`·`task-index`·`bulletin`·`field-list`·`link-rows`·`partner-row`)을 `src/blocks/<id>/`(메타데이터·마크업 틀)와 `src/styles/6-components/`(스타일)에 두고, MCP `list_blocks`·`get_block`·`compose_page`로 찾기 → 가져오기 → 조립 → 순서 점검을 제공한다. 미리보기는 `npm run build:blocks`가 `src/playground/block-*.html`·`blocks.html`로 만든다.
- `references/design-intelligence.md` — 디자인 판단 순서 8단계, 디자인 다이얼(변화도·모션·밀도)과 등급별 상한, KRDS 호환 스타일 허용표, 규칙 검사가 못 잡는 전문가 품질 점검, 충돌 우선순위. ui-ux-pro-max 스킬(MIT)을 infoUX 맥락으로 옮겨 썼고 KRDS가 우선한다.
- Task Contract `designDials` 선택 필드(스키마·문서·스타터 사본).
- design-page 절차에 판단 순서·다이얼 단계, 아트 디렉션 납품 전 체크리스트에 전문가 품질 점검 항목.
- design-intelligence에 Impeccable(Apache 2.0)·Anthropic frontend-design 스킬을 반영: 디자인 계획 산출물(`docs/design-plan.md`: 소재·색·서체·레이아웃·원칙), 템플릿 자가 점검, 「과감함은 한 곳에」, 색 전략 4종, 템플릿 서명 금지표, 렌더 품질 점검(나란한 단 윗선·넓은 화면 빈 절반·브라우저 표면), 장신구 하나 빼기.
- 디자인 디렉션 절차(메인·랜딩) — `references/design-intelligence.md`를 「금지 목록」에서 「만드는 순서」로 다시 썼다. 2026-10-23 제주관광공사 시안이 규칙 검사를 모두 통과하고도 「심심하고 전형적」 판정을 받은 것이 계기다. 레시피는 무엇을 실을지만 정하고 형식은 매번 설계한다.
  - 컨셉 한 문장과 시그니처 장면(§2), 두 축 이상에서 다른 세 방향의 첫 화면을 만들어 고르는 방향 라운드(§3).
  - 구성 기본기(§5): KRDS 타이포 단계로 본 역할별 크기와 「한 단계 건너뛰기」, 색 전략과 면 지도, 열 비율·빈 칸 없는 벤토 배치표, 여백 세 종류, 사진, 실데이터 그림.
  - 블록별 형식(§6): 메인 비주얼 6형, 자주 찾는 서비스 4형, 공지·소식 4형, 사업 소개 4형.
  - 전형 조립 서명(§7-1)과 열 항목 20점 렌더 비평 채점표(§8) — 16점 이상, 0점 항목 없음.
  - 3D·캔버스·스크롤 연동 장면을 쓸 때의 조건 아홉 가지(§9-3).
- `contracts/design-plan.md` 계획 서식과 납품 게이트 CT-04 — 메인 페이지가 있는 프로젝트는 `docs/design-plan.md`의 일곱 칸과 통과한 비평 기록이 없으면 `npm run check:release`가 실패한다(`scripts/lib/design-plan.js`).
- `contracts/agent-workflow.json` version 3 — 폐기된 스킬 경로를 `get_workflow`로 바꾸고 `design-direction`·`render-critique` 단계를 넣었다.
- MCP: 서버 지시문에 메인·랜딩 절차 안내, `get_reference("design-plan")`·`get_reference("task-contract")`.

### Changed

- 렌더 비평(`design-intelligence.md` §8)을 열 항목 20점 자기 채점에서 근거 있는 평가로 바꿨다. 만든 에이전트가 후한 점수를 주고 통과해도 화면은 그대로였다. 이제 계산되는 항목은 기계 검사 관문으로 돌리고, 만든 맥락을 모르는 별도 평가자가 결함 문항 D01~D16(예·아니오, 전형·심심함 문항에 무게)과 순서를 바꾼 두 번의 짝 비교를 맡으며, 고친 안은 직전 최고안을 이길 때만 채택하고, 마지막 판정은 사람이 한다.
  - 평가자 지시문 `contracts/render-critique-evaluator.md`(MCP `get_reference("render-critique-evaluator")`), 기준 견본 자리 `assets/exemplars/`와 색인 `index.json`(MCP `get_reference("exemplars")`, 스타터 동기화). 운영자 판정 세 건을 첫 견본으로 적었고 캡처는 대기다.
  - `contracts/design-plan.md` 「비평 기록」 서식과 CT-04 검사(`scripts/lib/design-plan.js`) — 평가자 분리, 기계 검사, 결함 문항, 두 번의 짝 비교, 채택, 사람 판정을 본다. 납품 검사는 사람 판정 「승인」이 없으면 실패한다. BREAKING(검사): 옛 「합계: NN/20」 기록은 받지 않고 새 서식을 안내한다.
  - `contracts/agent-workflow.json` — `render-critique` 단계를 새 절차로 바꾸고 `human-verdict` 단계와 중단 조건 두 개를 더했다.
- 렌더 확인 폭을 360·768·1024·1280·1440으로 통일했다.
- `src/snippets/hero-bleed.md` 기본 마크업의 버튼을 하나로 줄이고, 이 패턴이 여섯 형식 가운데 하나임을 밝혔다.
- `site/design/aesthetics.md` — 영문 웹 기준 안티패턴(Inter·Space Grotesk)과 「독특한 폰트를 고르라」를 걷어 내고 한국어 화면의 징후와 카탈로그 서체 기준으로 바꿨다. 메인과 서브·업무 화면의 수위 표를 넣었다.
- `korean-web-patterns.md` — 레시피와 형식의 역할 구분, KR-M30 전형 조립, 영문 eyebrow 불허(KR-T09·KR-M23).

## [4.0.0] - 2026-10-21

3.4.0 이후 석 달 치 변경(아트 디렉션·아이콘 계층·KRDS 정합·안티슬롭 검사 R-23~R-50)을 한 번에 묶은 릴리스다. 함께 올린 패키지: MCP `@infomind-ux/infoux-mcp` 0.5.0, `create-infomind-ux` 0.3.0, 스타터 4.0.0(이 버전부터 가이드 릴리스 번호를 따른다).

### 업그레이드 안내 (파생 프로젝트)
- BREAKING(검사): 새 error 규칙이 기존 화면을 새로 실패시킬 수 있다 — R-28 확대 차단, R-29 CSS에 없는 BEM 클래스, R-30 목적지 없는 링크, R-32 푸터 개인정보 처리방침, R-33 정지 없는 자동 전환, R-34 장식 효과, R-35 반경 1.2rem 상한, R-36 이모지 아이콘, R-37 Tailwind 기본 스케일, R-38 최소 글자, R-39 제목 구조, R-40~R-42 한국형 골격·히어로, R-43 카피 톤, R-45~R-48, R-24·R-26·R-27 확장. 스타터를 받은 뒤 `npm run check`를 돌려 위반을 고친다. 규칙 근거와 고치는 법은 MCP `get_rules`.
- BREAKING(외관): 브레이크포인트를 KRDS 표준형 4단계(360·768·1024·1280)와 1200px 콘텐츠 컨테이너로 바꿨다. 제목·디스플레이 크기·행간·자간을 KRDS 타이포그래피 표에 맞췄다. 레이아웃·제목이 긴 페이지의 시각 회귀를 확인한다.
- `infoux.json`에 `pageTypes`(K-16)·`publicIdentity`(R-46)·`contentSources`·`exceptions`(CT-03)를 적는다. 납품 전에는 `npm run check:release`를 돌린다.

### Added
- **KRDS 정합과 한국형 웹 패턴** — 한국형 메인 레시피·서브·헤더·푸터 기준(`references/korean-web-patterns.md`, K-01), 페이지 유형 선언(K-16), 공공 통합검색·서브 골격·푸터 개인정보 처리방침 검사(R-32·R-40·R-41), 섹션 세로 여백 오브젝트(`.section`, 밀도별)와 헤더 통합검색 스니펫, KRDS 캐러셀·푸터·탭·모달·긴급 공지·표 재정비, 푸터·모바일 메뉴·공지 띠·오류 페이지 컴포넌트와 메가 메뉴 변형.
- **시각 서명·카피·골격 검사** — R-01 색 확장·R-34 장식 효과·R-36 이모지·R-37 기본 스케일, 클래스 이름 계약과 R-29, 상태 표현 ARIA 우선(R-17), R-23 가짜·자리 콘텐츠 확장과 R-43 카피 톤(요소 트리), R-28 viewport 확대 차단, R-30·R-31·R-33·R-35·R-38·R-39·R-42·R-44~R-49. 검사가 납품 페이지(루트 `*.html`·`pages/**`·`infoux.json` `pages`)까지 닿고 편집 훅이 실패를 숨기지 않는다(HX-06).
- **아이콘 계층** — 아이콘 규격·대장(`contracts/icon-codepoints.json`)·스프라이트·아이콘 폰트·CSS 출력과 검사, 표정 4단계(슬림·레귤러·볼드·필), 구글 아이콘 전량 카탈로그의 한국어 검색·채택 도구, 아이콘 스튜디오(`/guide/_icons/`).
- **토큰 도구** — seed hex로 brand.json을 만드는 생성기, OKLCH 변환·색역 클리핑·휘도 역산 유틸, 한글 웹폰트 실제 배포와 맑은 고딕 폴백.
- **이름의 질·조판·모션 예산 검사** (안티슬롭 후속 묶음 1)
  - R-09 품질 경고 — 일반 어휘('메인 이미지'·'hero image')·파일명·연번·카메라 원본 이름 alt. 여러 줄 `<img>`의 alt 누락은 트리 파서가 오류로 보완한다(`scripts/lib/content-quality.js`).
  - R-30 이름 경고 — '더보기'·'자세히'·'VIEW MORE'만인 링크, 같은 이름이 서로 다른 목적지로 가는 링크.
  - R-50(신규, 경고) — '내용을 입력하세요' 같은 빈 placeholder와 레이블 반복. 스니펫·플레이그라운드의 해당 5곳을 예시 형식으로 고쳤다.
  - R-24 확장 — 음수 자간·전역 자간·pre/code 밖 `word-break: break-all·normal·break-word` 오류, 마크업의 1.5 미만 행간 오류, CSS 행간 경고를 선언·`@apply` 단위로 본다. 단행 예외는 `contracts/art-direction.json` `hangul.singleLineSelectors`와 `whitespace-nowrap`.
  - R-22 모션 예산 — 표현 등급별로 로더 밖 무한 반복·기능형 화면의 스크롤 진입 모션(오류), 500ms 초과·등급 상한 초과·튕기는 easing·restrained의 data-aos 예산 초과(경고). `@apply [transition:…]` 표기를 읽는다.
  - 문서 사이트에 한국형 웹 패턴(K-01) 페이지를 노출했다.
- **섹션 리듬·폰트 스택·아이콘 사용처 검사** (안티슬롭 후속 묶음 2)
  - R-25 확장 — `-card`·`-tile` 블록까지 카드형으로 보고 중첩을 막는다. li 래퍼 안의 카드도 그리드로 센다. main 직계 section의 archetype 선언이 없으면 납품 페이지 오류·그 밖 경고, 납품 페이지는 그리드 3연속·페이지당 3개부터 오류.
  - R-26 확장 — 토큰 스택 1순위는 카탈로그 한글 폰트, `font-family` 직접값·`font-serif`·임의 `font-[…]`·새 서체 변수 금지, 외부 폰트 호스트(link·@import·@font-face 절대 URL) 금지. 타입 표기 없는 `font-[var(--font-*)]`가 font-weight로 생성되는 함정을 잡는다(`scripts/lib/font-rules.js`).
  - R-27 확장 — `<use href>`를 대장 스프라이트의 실제 symbol과 대조(표정 보유 포함), icon-font 클래스 조합, 아이콘 aria-hidden 누락은 오류. 직접 그린 인라인 svg와 같은 목록 안 표정 혼용은 경고(`scripts/lib/icon-usage.js`).
- **납품 게이트와 기준 문서 정합** (안티슬롭 후속 묶음 3)
  - `npm run check:release`(CT-03, `scripts/check-contract.js --release`) — `infoux.json` `contentSources`가 비었거나 자리값이면, 납품 페이지에 `data-content-pending`·형식 예시 주석이 남았으면, 규칙 예외가 만료·형식 오류면 납품을 막는다. 평소 `npm run check`는 경고만 낸다. `create-infomind-ux`가 `contentSources`·`exceptions` 빈 칸을 만든다.
  - R-47 법령 예외 — `exceptions`에 `{ rule: 'R-47', legalBasis, owner, expires }`가 있으면 주민등록번호 입력을 경고로 낮춘다. 근거 조항 없는 예외는 인정하지 않는다.
  - HX-07 — 정본과 모순되는 처방(여백 40%·글래스모피즘 권장·스크롤 스토리텔링·linear/ease 구식 등)을 `contracts/copy-lexicon.json` `prescriptions` 사전으로 `references`·`site/design`·`prompts`에서 막는다(`check-harness.js`).
- **아트 디렉션 계층 v1** — "규정 준수형 무개성"을 벗어나기 위한 표현 판단 기준을 계약·카탈로그·검사로 도입했다.
  - 표현 등급(expression) 축 — `contracts/profiles.json` 1.1.0에 `utility`(기능형) / `restrained`(절제형) / `expressive`(표현형) 3등급과 프로필별 기본 등급을 정의했다. 등급은 상한이지 목표가 아니며, Task Contract 스키마의 `expression` 필드로만 상향한다(`publicIdentity: required`면 상한 restrained — 스키마가 강제). `contentSources` 필드로 실제 기관 용어·콘텐츠 출처를 운반한다.
  - `contracts/art-direction.json` — 한글 조판 수치(keep-all·행간·자간·weight 상한), 타이포 페어링 카탈로그(원 배포처가 공식 woff2를 제공하는 폰트만 — 파일은 입수 대기), 팔레트 인덱스, 프로필별 리듬·카피 톤의 기계용 정본. 산문 해설·안티패턴 색인·납품 전 리뷰 체크리스트는 `references/art-direction.md`에 있다.
  - 팔레트 프리셋 `tokens/presets/` — trust-blue(현행 승계)·coast-teal(관광 청록)·market-terracotta(커머스 웜 테라코타). 정준 Y 사다리 기반으로 생성해 **대비 검사 위반 0건이 입고 조건**이며 `check-presets.js`가 강제한다. 적용은 `cp` → `build:tokens` → `check:contrast` 3줄.
  - 규칙 R-23(가짜 콘텐츠 금지)·R-24(한글 조판 하한)·R-25(섹션 리듬)·R-26(폰트 스택 한글 fallback) — 전부 표현 등급과 무관한 전역 하한만 기계 검출한다. 검출과 함께 대체 공급 패턴(`section-media` 이미지-텍스트 교차, `hero-bleed` 풀블리드 인트로, 시그니처 요소 스니펫)을 같은 버전에 입고했다.
  - `tokens/brand.json`에 `font.family.heading` 슬롯 → `--font-heading` 토큰 발행. 슬롯이 없으면 `--font-sans`로 폴백해 기존 파생 사이트는 무중단이다.
  - MCP `get_art_direction` 도구 — 프로필별 표현 등급 상세·타이포 후보·팔레트 후보·한글 조판 공통값·안티패턴 색인을 답한다. 구조·밀도는 `get_profile` 소유로 반복하지 않는다.
  - `contracts/agent-workflow.json` version 2 — task-contract step에 표현 등급 선언을 추가하고, 패턴 조합 전에 아트 디렉션 확정 step을 넣었다. `design-page`·`init-project` 워크플로에 등급 확정·contentSources 확보·프리셋 적용·`--font-heading` 절차를 연결했다.

### Changed
- 고정 높이 컨트롤(calendar·file-upload·main-menu·pagination·step-indicator)의 `leading-none`을 `leading-[1.5]`로 바꿨다 — 렌더는 같고 R-24 하한을 지킨다. 문서 사이트 히어로 제목의 음수 자간을 0.1rem으로 바꿨다.
- 플레이그라운드 코드 표시 서체(18개 파일의 Consolas 직접 지정)를 `var(--font-mono)`로 바꿨다 — mono 스택에 Consolas가 있어 Windows 렌더는 같다.
- 미학 가이드(`site/design/aesthetics.md`)의 모션·레이아웃 원칙을 R-22 모션 예산·R-25 섹션 리듬·표현 등급 기준으로 다시 썼다. 한국어 행간 하한 서술을 1.2에서 R-24 정본 1.5로 바로잡았다.

### Removed
- `prompts/beauty-score.md`(스타터 사본 포함) — 생성기·인바운드 링크가 없는 고아 파일이고, 히어로 72~160px·행간 1.0·여백 40% 같은 처방이 모두 정본과 충돌했다.
- BREAKING(파생 사이트 외관): 한글 조판 기본값을 base 계층에 도입했다. `3-generic/reset.css`의 body에 `word-break: keep-all`·`overflow-wrap: break-word`를 추가하고(`pre`·`code`는 `word-break: normal` 예외), 본문 line-height를 1.5 → 1.7로 올렸다. `4-elements/base.css`의 h1~h6 line-height는 1.5 → 1.3으로 내렸다. font-weight는 바뀌지 않는다.
- 영향 범위: 이 저장소의 reset/base를 상속하는 모든 파생 사이트에서 ① 자체 `line-height`가 없는 본문 문단·목록의 행간이 커져 페이지 세로 길이가 늘고 ② 제목 행간이 줄어 여러 줄 제목이 조밀해지며 ③ keep-all로 한글 줄바꿈 위치가 단어 경계로 바뀐다. `leading-*`을 직접 지정한 컴포넌트(btn·badge·form·alert 등 6-components)는 영향이 없다. 파생 사이트는 업데이트 후 본문·제목이 긴 페이지의 시각 회귀를 확인해야 한다.

### Fixed
- 마크다운 html 블록의 위반 줄 번호가 한 줄 앞으로 보고되던 문제(펜스 줄을 1행으로 셌다).

## [3.4.0] - 2026-07-29

### Added
- `contracts/profiles.json` — 사이트 유형 5종의 실행 프리셋. section 흐름, 우선 컴포넌트, 밀도(여유/고밀도) 수치, 정부 아이덴티티 조건을 기계가 읽을 수 있게 정의한다. 산문으로만 있던 판정 기준을 옮긴 것이다.
- MCP `get_profile` 도구(9종째). 유형을 판정한 직후 프리셋을 가져가 구조를 잡는다. 서버 지시문에도 넣어 `infoux.json`이 있으면 재판정하지 않도록 했다.
- `npm run build:profiles` — `references/project-profiles.md`의 표를 `profiles.json`에서 생성한다. 산문은 손대지 않고 표 구간만 덮어쓴다.

### Changed
- 사이트 유형 정의가 세 곳(CLI · Task Contract 스키마 · profiles.json)에서 일치하는지 단위 테스트가 강제한다. 프리셋이 가리키는 컴포넌트와 section archetype이 실제로 존재하는지도 검사한다.

## [3.3.0] - 2026-07-29

### Added
- `references/trade-off-rules.md` — 원칙이 충돌할 때의 우선순위 6단계. 1순위는 접근성이다. 자동검사가 잡지 못하는 설계 판단을 다룬다.
- `references/release-checklist.md` — 배포 전 점검 7개 구분 26항목. 접근성·과업 흐름·품질은 100%, 전체 85% 통과가 조건이다.
- 문서 사이트에 두 문서를 노출한다(`/governance/trade-off-rules/`, `/design-qa/release-checklist/`). 사이트 페이지는 `references/` 원본을 읽는 래퍼이며 내용을 복사하지 않는다.
- MCP 서버 지시문에 두 문서를 넣었다. 원칙 충돌 시 우선순위를 따르고, 화면을 마무리하면 체크리스트로 점검하도록 건다.

## [3.2.0] - 2026-07-29

### Added
- 문서 사이트가 `llms.txt` / `llms-full.txt`를 발행한다. 루트에 전체 목차와 전문, 섹션(11개)마다 요약과 전문을 낸다. MCP를 붙이기 어려운 발주처·협력사에 문서를 텍스트로 전달하는 경로다.
- `create-infomind-ux` 0.2.0 — `--profile`(사이트 유형 기록) / `--brand`(브랜드 팔레트 주입) / `--deliver`(사내 문서 제외).

### Fixed
- 링크 안 인라인 코드의 대비. 링크색이 코드 배경 위에서 4.17:1로 떨어졌다(흰 배경에서는 4.55:1로 통과). `--color-text-primary`로 6.26:1 확보.

## [3.1.0] - 2026-07-29

### Added
- `--color-border-control` 신설. 사용자가 조작하는 요소의 경계·상태를 나타내는 테두리로, WCAG 1.4.11에 따라 배경 대비 3:1 이상을 유지한다. 표 구분선 같은 장식은 `--color-border`를 그대로 쓴다.
- `--color-text-primary` 노출. 소스에 있었으나 발행되지 않아 secondary 버튼이 `--color-primary`로 대신 쓰다 4.05:1로 AA 미달이었다.
- `check-violations.js`가 `<style>` 블록 안의 raw 색상도 검사한다. 인라인 `style` 속성만 보느라 사각지대였다.

### Fixed
- BREAKING(고대비 모드 외관): 고대비 모드가 색상 변수 74개 중 21개만 덮어 링크·버튼·상태 텍스트가 라이트 값을 유지했다. `build-tokens.js`가 라이트·고대비 두 블록을 같은 목록에서 생성하도록 바꿔 모드 누락이 구조적으로 생기지 않게 했다(고대비 21 → 164개). 라이트 모드 출력은 한 줄도 바뀌지 않는다.
- 고대비 primary 버튼 채움을 밝은 파랑으로 뒤집었다. 어두운 테마인데 라이트와 같은 진한 파랑이라 어두운 레이블이 읽히지 않았다(2.37:1 → 7.33:1).
- 고대비 기본 테두리를 gray.50으로 올렸다(2.42:1 → 4.66:1).
- 플레이그라운드 12개 파일의 raw hex를 토큰으로 교체했다. 고대비에서 흰 배경에 옅은 글씨가 되어 미리보기가 깨져 있었다.
- `check-html-structure.js`가 플레이그라운드를 page shell 검사에서 면제한다. `check-violations.js`와 판단이 어긋나 pre-commit에서만 실패했다.

### Changed
- 대비 검사 대상이 40 → 48건으로 늘었다(버튼 레이블·입력 필드·컨트롤 테두리 추가, 장식 테두리와 투명 배경 조합 제외).
- `tokens/contrast-baseline.json`이 비었다. 예외 없이 전량 통과한다.

## [3.0.0] - 2026-07-29

### Added
- 토큰 브랜드 계층 `tokens/brand.json` 신설. 프로젝트는 이 파일만 갈아끼우면 사이트 전체 색이 따라온다.
- 대비 자동검증 `scripts/check-contrast.js`를 `npm run check`에 편입. 라이트·고대비 두 모드에서 전경/배경 40건의 WCAG 2.1 AA 대비를 계산한다.
- `tokens/contrast-baseline.json` 래칫. 기존 위반 6건을 고정하고 새 위반만 차단한다. 기준선 항목이 고쳐지면 목록을 지우도록 실패시킨다.
- infoUX MCP 서버 `@infomind-ux/infoux-mcp`. 도구 8종(get_contract / list_components / get_component / get_tokens / get_rules / get_reference / get_workflow / search_docs)으로 기준을 제공하며, 접속 시 지시문을 넘겨 준수 순서를 자동으로 건다.
- 문서 사이트에 `/onboarding/mcp/` 신설.

### Changed
- BREAKING: 토큰 원본이 두 파일로 갈렸다. `tokens/foundation.json`은 gray·상태색·의미 토큰만 갖는 불변 계층이 되고, 브랜드 팔레트(primary/secondary/point)와 `--font-sans`는 `tokens/brand.json`이 소유한다. 생성되는 `tokens/build/tokens.css`의 변수명과 값은 이전과 동일하다.
- BREAKING: 스킬 계층을 폐기했다. `.agents/skills`·`.claude/skills`와 스타터 사본을 제거하고 전달 경로를 MCP 하나로 모았다. 작업 절차 7종은 `references/workflows/`로 옮겨 `get_workflow`로 제공한다.
- BREAKING: `skill/`을 `references/`로 통합하고 `skill/SKILL.md`를 `references/CONTRACT.md`로 옮겼다.
- `check-harness.js`가 스킬 4벌 동일성 대신 MCP 번들과 원본의 동기화를 검사한다.
- 문서 사이트와 스타터 안내에서 "info-design 스킬 발화"를 MCP 등록 안내로 교체했다.

### Removed
- `scripts/build-agent-harness.js`, `npm run build:agents`, `npm run deploy:skill`.

## [2.0.0] - 2026-06-01

### Added
- HTML Page Shell 계약 추가: `.skip-to-content`, `header#header`, `main#main`, `footer#footer`, `section > .container`, section accessible name 검증.
- R-20 호환성 규칙 추가: 핵심 CSS에서 `:has()` 의존 금지 및 `check-violations.js` 자동 검출.
- `browserslist` 기준 추가: Chrome/Safari/Firefox/Edge 최신 2개 버전, Samsung Internet 최신, IE 기본 미지원.

### Changed
- BREAKING: R-15 HTML 기본 구조 규칙을 error로 승격하고 `check-html-structure.js` page shell 검사를 강화.
- info-design 스킬, AGENTS/CLAUDE, prompts, 문서 사이트를 page shell 및 section 단위 컴포넌트화 기준으로 갱신.
- check/rules 문서 범위를 R-01~R-20으로 확장.

### Fixed
- `:focus` fallback을 추가해 `:focus-visible` 미지원 브라우저에서도 포커스 링이 유지되도록 보강.
- check/radio, switch, file-upload 컴포넌트의 `:has()` 의존을 sibling selector 기반 상태 스타일로 교체.
- 브라우저 테스트 문서의 IE 지원 기준 불일치를 정리.

## [0.9.0] - 2026-03-26

### Added
- 거버넌스 문서 (컴포넌트 라이프사이클, 버전 정책, 변경 승인 프로세스)

## [0.8.0] - 2026-03-25

### Added
- ITCSS 7레이어 + BEM SCSS 아키텍처
- 디자인 토큰 (색상, 타이포그래피, 간격, 그리드, 기타)
- 반응형 믹스인 (모바일/태블릿/PC 브레이크포인트)
- 공용 믹스인 (flex-center, ellipsis, bg-cover 등)
- 8개 UI 컴포넌트 HTML+SCSS 스니펫 (btn, form, card, table, modal, tab, pagination, breadcrumb)
- KWCAG/WCAG AA 접근성 체크리스트 및 컴포넌트별 접근성 가이드
- Eleventy 기반 문서 사이트
- 신규 팀원 온보딩 가이드
- 프로젝트 보일러플레이트 (HTML 시작 템플릿)
- Stylelint BEM 검증 설정
- pa11y-ci 접근성 자동 검사 설정
