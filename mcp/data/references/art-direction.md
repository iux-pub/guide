# 아트 디렉션 — 자연스러움의 판단 기준

brand.json과 `--font-*` 토큰에 무엇을 넣을지, 표현 수위를 어디까지 열지 판단하는 기준. 수치 정본은 `contracts/art-direction.json`, 팔레트 hex 정본은 `tokens/presets/`이며, 이 문서의 표는 build-art-direction.js가 생성한다.

---

## 1. 표현 등급

<!-- art-direction:expression:begin — contracts/art-direction.json + contracts/profiles.json에서 자동 생성. 직접 수정 금지. npm run build:art-direction -->
| 등급 | 정의 | hero | 시그니처 | 모션 | 제목 폰트 | 레이아웃 |
|------|------|------|----------|------|-----------|----------|
| 기능형 (`utility`) | 반복 업무 화면. 표현 요소가 과업 효율을 침해하지 않는 최소 수준. | none, text | 없음 | fade · 100~200ms | body-only | symmetric-grid |
| 절제형 (`restrained`) | 신뢰가 우선인 공공 톤. 브랜드는 색·서체 수준에서 드러나고 장식은 절제한다. | text, image, carousel | 최대 1 — 그래픽 패턴, 포토 톤 통일, 커스텀 일러스트 | fade, translate-16, scroll-fade-in-once · 150~300ms | body-first | alternating |
| 표현형 (`expressive`) | 브랜드 개성이 기억에 남아야 하는 사이트. 시그니처·타이포·섹션 리듬으로 정체성을 만든다. | text, image, carousel, video | 최대 3 — 그래픽 패턴, 커스텀 일러스트, 포토 트리트먼트, 타이포 모티프, 커스텀 불릿·구분선 | fade, translate-24, scale-2pct, stagger-50-80 · 200~400ms | heading-pairing | asymmetric |

| 유형 | 기본 등급 | 타이포 후보 | 팔레트 후보 | 섹션 리듬 | 카피 톤 |
|------|-----------|-------------|-------------|-----------|---------|
| 일반사이트 (`general-site`) | 표현형 (`expressive`) | standard-gov, product-modern, formal-serif, retro-display | coast-teal, market-terracotta | 풀블리드 인트로(hero-bleed)→이미지-텍스트 교차(section-media)→리스트 변주 허용 | 합쇼체 기본. 명사형 버튼 레이블. 직역체·2인칭 '당신' 금지 |
| 공공서비스 (`public-service`) | 절제형 (`restrained`) | standard-gov | trust-blue, coast-teal | 과업 진입(search) 우선. 장식 hero는 화면 1/2 이하 | 합쇼체 고정. 느낌표 금지. KRDS 용어 우선 |
| 공공기관 (`public-institution`) | 절제형 (`restrained`) | standard-gov, formal-serif | trust-blue | 기관 정체성+공지 결합형 인트로. 슬라이더는 정지 컨트롤 필수 | 합쇼체 고정. 성과 홍보 어조 금지 — 사실 서술 |
| CMS·관리자 (`cms-admin`) | 기능형 (`utility`) | standard-gov, technical-global | trust-blue | hero 없음(profiles 소유 참조). 첫 화면은 검색/필터+데이터 | 명사형·개조식. 문장 최소화 |
| 커머스·예약 (`commerce-reservation`) | 표현형 (`expressive`) | standard-gov, product-modern | market-terracotta, trust-blue | 상품·프로모션 중심, 전환 CTA 1개 원칙. 결제 플로우는 utility 강등 | 합쇼체 기본. 근거 없는 최상급 금지. 가격·기간 사실 정보 우선 |
<!-- art-direction:expression:end -->

등급 운용은 다섯 원칙을 따른다.

1. 등급은 상한이지 목표가 아니다 — "허용되니까"는 근거가 아니다.
2. 상향은 task contract `expression` 필드로만 하고, 근거 기록이 필수다. 하향은 언제나 자유다.
3. 페이지 단위 강등 — 폼·결제·인증·오류·검색결과는 사이트 등급 무관 utility~restrained 수위로 작성한다. 운반체는 페이지 단위 task contract, 확인은 납품 전 리뷰 체크리스트(§9)다.
4. 축 단위 예외 — 등급 묶음에서 축 하나만 열 때는 `exceptions[]`에 `"rule": "expression.hero"` 형식으로 근거와 함께 기록한다(예: 공공기관 메인 영상 배경 발주 요구). 통째 상향보다 이 경로를 우선한다.
5. publicIdentity 캡 — `required` 확정 시 상한은 restrained다(task contract 스키마가 강제). `unconfirmed` 상태에서는 상향을 보류한다.

컴포넌트 피드백 모션(모달·토스트·인풋 전환)은 interaction-timing 소유로 등급 무관이다. 위 표의 모션 수치는 장식·스크롤 진입 모션에만 적용된다.

point 색 사용 수위 — point는 시선을 한 곳으로 모으는 색이다. 섹션당 1~2회, 화면 면적의 10% 이내 감각을 지키고, utility 등급에서는 상태·배지·필수 표시 등 기능적 용도 외에 쓰지 않는다. 이 수치는 계약이 아니라 저작 감각 기준이다.

## 2. 한글 조판

<!-- art-direction:hangul:begin — contracts/art-direction.json에서 자동 생성. 직접 수정 금지. npm run build:art-direction -->
| 항목 | 값 |
|------|-----|
| word-break / overflow-wrap | `keep-all` / `break-word` |
| 본문 line-height | 1.6~1.7 (기본 1.7, 고밀도 기본 1.6, lint 하한 1.5) |
| 제목 line-height | 1.2~1.45 |
| 제목 letter-spacing | -0.03em~0 (2.4rem 이상부터) |
| 제목 최대 줄수 | 2 |
| weight | 본문 기본 400 · 인라인 강조 상한 700 · 제목 상한 700 · 화면당 4종 이하 |

> lintFloor는 R-24 검출기의 warn 임계(이 값 미만이 warn), min~max는 저작 기준값. bodyEmphasisMax 700은 인라인 강조 한정 — 연속 문단 볼드 금지. headingMax 700은 h1~h2급 한정. 상세 산문: references/art-direction.md §2.
<!-- art-direction:hangul:end -->

- 본문 줄길이는 28~42자(공백 포함)를 권장한다. 게시판 목록·약관·표처럼 문서형 콘텐츠는 예외다 — 줄길이를 맞추려고 컨테이너를 쪼개지 않는다.
- 숫자가 정렬되는 화면(표·가격·통계)은 `font-variant-numeric: tabular-nums` 또는 `--font-mono`를 쓴다.
- 폰트 로딩 — `font-display: swap` 기본. preload는 본문 400 + 제목 대표 1종만 한다. 서브셋 기준은 KS X 1001 완성형 2,350자다.
- WCAG 1.4.12 텍스트 간격 내성 — 사용자가 행간·자간을 키워도 잘리거나 겹치지 않아야 한다. 고정 높이 컨테이너에 본문 텍스트를 담지 않는다.
- 단어가 어색하게 갈라지면 `&nbsp;` 강제 병기 대신 카피를 고친다.

## 3. 타이포 페어링

<!-- art-direction:typography:begin — contracts/art-direction.json에서 자동 생성. 직접 수정 금지. npm run build:art-direction -->
| id | 라벨 | 무드 | 제목 | 본문 | 등급 | 라이선스 | 파일 |
|----|------|------|------|------|------|----------|------|
| `standard-gov` | 표준 관청체 | 중립·신뢰·표준 | `var(--font-sans)` 600/700 · ls -0.02em · lh 1.35 | 400/500 · lh 1.7 | utility, restrained, expressive | OFL-1.1 | 4건 입수 완료 |
| `product-modern` | 프로덕트 산세리프 | 친근·현대적·제품 | `'Wanted Sans', var(--font-sans)` 600/700 · ls -0.02em · lh 1.3 | 400/500 · lh 1.7 | expressive | OFL-1.1 | 2건 입수 완료 |
| `formal-serif` | 격식 명조 | 격식·기록·전통 | `'Noto Serif KR', var(--font-sans)` 600 · ls -0.01em · lh 1.4 | 400/500 · lh 1.7 | restrained, expressive | OFL-1.1 | 1건 입수 완료 |
| `retro-display` | 레트로 디스플레이 | 레트로·문화·독립 | `'Hahmlet', var(--font-sans)` 500/600 · ls 0 · lh 1.3 | 400/500 · lh 1.7 | expressive | OFL-1.1 | 1건 입수 완료 |
| `technical-global` | 테크니컬 고딕 | 테크·국제·데이터 | `'IBM Plex Sans KR', var(--font-sans)` 600 · ls -0.01em · lh 1.3 | 400/500 · lh 1.7 | utility, restrained, expressive | OFL-1.1 | 1건 입수 완료 |

- **standard-gov** [warn] 단독으로는 무개성 — 크기 대비(본문 1.7rem ↔ h1 4rem)와 여백으로 위계를 만든다.
- **standard-gov** [info] 민간 프로젝트는 일반 Pretendard도 무방. 전 프로필 안전 기본값.
- **product-modern** [error] 본문까지 Wanted Sans로 바꾸지 않는다 — 본문 축은 --font-sans 고정이 카탈로그 전제.
- **formal-serif** [error] 2rem 미만 크기 사용 금지 — 명조 가는 획이 뭉개진다.
- **formal-serif** [warn] CJK 명조는 용량이 크다 — 서브셋 필수, heading 전용 weight 1종(600)만 로드.
- **retro-display** [error] hero·배너·섹션 타이틀 전용 — 본문·폼·표 사용 금지.
- **retro-display** [warn] 글리프 커버리지 검수 — 프로젝트 실제 카피(기관명·고유명사)로 누락 음절을 확인한 뒤 채택한다.
- **technical-global** [warn] 한글 글리프가 완성형 중심 — 실제 카피로 누락 음절 검수.
- **technical-global** [info] foundation의 --font-mono(Plex Mono 계열)와 가족 정합 — 데이터 화면에서 강점. admin에서는 standard-gov 단일 서체도 유효한 대안.
<!-- art-direction:typography:end -->

- 입수 원칙 — 원 배포처가 공식 woff2를 제공하는 폰트만 카탈로그에 들어온다. TTF만 배포되는 폰트는 포맷 변환의 라이선스(RFN)·품질 문제가 있어 후보 풀(부록)에 남긴다. CI는 외부 URL을 fetch하지 않는다 — 라이선스 판단은 원 배포처 페이지 기준으로 사람이 확정하고, 파일은 라이선스 전문과 함께 `assets/fonts/<pairing-id>/`에 벤더링한다.
- 폴백 스택 구조 — 제목 폰트는 반드시 `'표시 폰트', var(--font-sans)` 순서를 지킨다. 한글 글리프가 없는 표시 폰트를 단독으로 두면 한글이 시스템 기본 서체로 떨어진다. 토큰 계층에서는 R-26이 한글 가용 폰트 미포함 스택을 잡는다.
- 숫자 전략 — 표·가격·통계는 tabular-nums 또는 `--font-mono`. 영문 display 폰트를 숫자·라틴에만 얹는 unicode-range 오버레이는 v2 검토 항목이다.
- 적용 경로 — brand.json `font.family.heading`에 스택을 적고 `npm run build:tokens`. 본문 축은 `--font-sans` 고정이 카탈로그 전제다.

## 4. 팔레트 프리셋

<!-- art-direction:palettes:begin — contracts/art-direction.json + tokens/presets/*.json에서 자동 생성. 직접 수정 금지. npm run build:art-direction -->
| id | 라벨 | 무드 | primary 50 | secondary 50 | point 50 | 등급 | 프로필 |
|----|------|------|------------|--------------|----------|------|--------|
| `trust-blue` | 공공 신뢰 블루 | 관공서·금융 신뢰, 현행 기본 승계 | `#256ef4` | `#346fb2` | `#d63d4a` | utility, restrained, expressive | public-service, public-institution, cms-admin |
| `coast-teal` | 관광 청록 | 바다·환경·청량 | `#00818c` | `#54789e` | `#a75d88` | restrained, expressive | general-site, public-service |
| `market-terracotta` | 커머스 웜 테라코타 | 온기·식욕·프로모션 | `#ba5929` | `#946d57` | `#008287` | expressive | commerce-reservation, general-site |

- **trust-blue** — `pointException: krds-heritage` — 용법 제한은 아래 산문 참조.
<!-- art-direction:palettes:end -->

적용은 세 줄이다.

```bash
cp tokens/presets/coast-teal.json tokens/brand.json
npm run build:tokens
npm run check:contrast
```

저작 규칙(신규 프리셋 생성 시) — 상수 전량이 각 프리셋 `$meta.preset.generation`에 기록돼 있어 생성기 없이도 재현할 수 있다.

- 정준 Y 사다리(WCAG 상대휘도): 5=.885, 10=.777, 20=.605, 30=.426, 40=.255, 50=.178, 60=.104, 70=.049, 80=.022, 90=.009, 95=.005 — 대비 사전통과를 구조로 만드는 기둥이다.
- 채도 곡선: 50 정점 종형(5=0.08 → 50=1.00 → 95=0.25).
- hue는 스케일 전체 상수. L은 hex 양자화 후의 Y로 이분탐색하고, sRGB 감마 밖은 C만 축소한다. 50·60은 흰 배경 4.5:1 하드 스냅.
- 관계 규칙: secondary C = primary C50×0.4~0.7, hue ±45° 이내 또는 중성. point는 primary와 hue 거리 ≥60°, 상태색(danger/warning/success/info) hue ±25° 금지 밴드를 지킨다.
- hc 모드: light와 동일 사다리 기본. ΔH(primary, secondary)<40°면 hc secondary를 ΔH≥40° 위치로 재생성한다.

krds-heritage 용법 제한 — trust-blue의 크림슨 point는 금지 밴드·ΔE 위반이지만 KRDS 원본 승계 예외다. 그 대가로 용법을 제한한다: 삭제·취소 등 위험 액션 버튼에 쓰지 않고, danger 알림 인접 40px 안에 배치하지 않는다.

청록 계열 주의 — coast-teal의 40단계는 sRGB 감마 경계라 채도 클리핑이 걸려 있다. 파생 색을 손으로 만들 때는 40~50 구간 대비를 다시 검증한다.

## 5. 섹션 리듬 변주

동일 archetype 연속 상한은 2다 — 3연속이면 리듬이 죽는다(R-25 검출 근거). "중앙 제목 + 카드 그리드" 3연속이 규정 준수형 무개성의 최빈 패턴이다.

- 교차 원칙 — 이미지-텍스트 교차(section-media)·풀블리드 인트로(hero-bleed) 같은 변주 패턴을 사이에 끼운다. zigzag는 1왕복이면 충분하다 — 전 섹션 교차는 그 자체로 단조롭다.
- 첫 콘텐츠 섹션은 1순위 과업이 차지한다. 장식이 과업 진입을 밀어내지 않는다.
- 배경 리듬 — 흰 배경 연속 구간에 옅은 배경 섹션을 끼워 단원을 만든다. 매 섹션 배경 교차는 금지 수준의 과잉이다.
- 프로필별 hero 원칙·기본 section 흐름·밀도는 profiles 소유다 — §1 프로필 기본값 표의 리듬 열과 get_profile(id)를 참조하고, 여기서 반복하지 않는다.

## 6. 시그니처 요소

시그니처는 "이 사이트만의 것"으로 기억되는 반복 장치다. 등급별 상한(maxCount)은 §1 표가 정본이다.

- 선정 기준 — 브랜드 자산(CI·일러스트·포토 톤)에서 출발한 장치 1개를 여러 곳에 반복하는 편이, 서로 다른 장치 여럿보다 강하다.
- 실물 3패턴 — 타이포 모티프·커스텀 구분선·배경 패턴(SVG data-uri)은 `src/snippets/signature.md`에 스니펫으로 제공한다.
- 배치 — hero·인트로·섹션 경계 같은 구조 지점에 둔다. 본문 문단 사이에 끼워 넣지 않는다.

## 7. 이미지 트리트먼트

이미지 톤은 사이트당 1규칙이다 — duotone 또는 명도·채도 대역 중 하나를 정해 전 이미지에 적용한다. 페이지마다 톤이 다른 사진 묶음이 "조립한 티"의 주범이다.

- 권장 비율 — hero 21:9·16:9, 카드 4:3·1:1. 비율 혼용은 같은 그리드 안에서만 한다.
- 텍스트 오버레이 — 단색 스크림 40~60% 또는 그라데이션 스크림 위에서만 텍스트를 얹고, 대비 4.5:1은 스크림 위에서 실측한다.
- 시안 이미지 소싱 — 확보 라이선스 소스를 우선한다. 미확보 시 회색 박스로 두지 않는다 — 실제 비율의 명시적 이미지 자리 표기 + 교체 목록을 동봉한다.

## 8. 카피 톤

프로필별 종결어미·금지선은 §1 프로필 기본값 표의 카피 톤 열이 정본이다. 공통 원칙:

- 버튼 레이블은 명사형("신청", "다운로드")을 기본으로 한다.
- 근거 없는 최상급·성과 홍보 어조·느낌표 남발을 금지한다. 사실 서술이 기본이다.
- 번역투 금지 — "지금 시작하세요", 2인칭 "당신", "~을 경험하세요" 류.
- 문장 공식·에러 메시지 3-part 구조는 microcopy 소유다(site/design/microcopy.md).
- 실제 기관 용어·메뉴명은 task contract의 `contentSources`에서 가져온다. 출처가 비어 있으면 카피는 임시 초안 신분을 벗어날 수 없다.

## 9. 납품 전 리뷰 체크리스트

납품 전 1회, 페이지 전량을 대상으로 실행한다. `release-checklist.md`의 게이트와 연결된다.

- [ ] 안티패턴 색인(§10) 10건 각각에 대해 해당 없음을 확인했다.
- [ ] 섹션 교차 리듬 — "중앙 제목+그리드" 3연속이 없다. 좌정렬·교차·풀블리드 변주가 있다.
- [ ] 카드화 필요성 — 카드가 아니어도 되는 콘텐츠를 카드로 감싸지 않았다. 카드 안 카드 중첩이 없다.
- [ ] 결제·인증·폼 페이지의 task contract가 utility로 강등돼 있다.
- [ ] 상태 완결성 — btn: default/hover/focus-visible/active/disabled/loading, form: +error 마크업 실물, table·list: empty/loading/error, alert·badge: 4톤 전부, pagination: 양끝 disabled. 명세 수치는 ui-states 소유다.
- [ ] 실제 기관 용어 정합 — `contentSources`와 대조했다. 임시 카피·가짜 콘텐츠가 남아 있지 않다(R-23).
- [ ] 이미지 라이선스 — 전 이미지의 출처·라이선스가 교체 목록 또는 크레딧으로 정리돼 있다.

## 10. 안티패턴 색인

기계 검출 4종은 rules.json이 정본이다 — R-23 가짜 콘텐츠, R-24 한글 조판 하한, R-25 섹션 리듬, R-26 폰트 한글 fallback. 아래 10건은 산문 판정 목록이며 이 문서가 유일한 등재처다.

1. AI 에디토리얼 룩 — 크림 오프화이트+세리프+테라코타 조합 서명. brand 저작 시점에 판정한다. [owner: art-direction]
2. AI 다크테크 룩 — 니어블랙+애시드그린+소문자 mono. [owner: art-direction]
3. 보라→파랑 그라데이션 CTA·히어로. [owner: art-direction / 버튼 체계는 krds-components]
4. 전면 글래스모피즘·전 요소 과대 라운딩. [owner: art-direction]
5. 근거 없는 통계 히어로·가짜 후기 캐러셀. [owner: art-direction / 수치 근거는 수동 검수]
6. 직역 마케팅 카피 — "지금 시작하세요"·"당신"·느낌표 남발. [owner: microcopy — 세부 위임]
7. 어두운 오버레이+중앙 흰 문구+스크롤 화살표 히어로. [owner: art-direction]
8. 무한 롤링 로고 마키·scroll-jacking·overshoot easing·500ms 초과 장식 모션. [owner: interaction-timing / R-22]
9. 요구에 없는 다크모드 토글 — infoUX는 high-contrast 2모드 체계다. [owner: tokens]
10. weight 700 남발·영문 display 폰트의 한글 fallback 미설계. [owner: art-direction hangul / R-26]

## 부록. 검증 대기 후보 풀

아래는 삭제가 아니라 입고 유예다. 라이선스 근거는 원 배포처 원문 재확인 전까지 전부 unverified로 둔다.

폰트 후보 8종 — 공식 woff2 미제공 또는 원 배포처 재확인 필요:

| 폰트 | 라이선스 근거 | 상태 |
|------|---------------|------|
| SUIT | sunn.us/suit | unverified — OFL 추정 |
| Freesentation | 원 배포처 재확인 필요 | unverified |
| 나눔스퀘어 네오 | hangeul.naver.com | unverified — 네이버 공식 원문 재확인 필요 |
| Paperlogy | 원 배포처 재확인 필요 | unverified |
| Gowun Batang | fonts.google.com/specimen/Gowun+Batang | unverified — OFL 추정 |
| MaruBuri | hangeul.naver.com | unverified — 네이버 공식 원문 재확인 필요 |
| Spoqa Han Sans Neo | spoqa.github.io/spoqa-han-sans | unverified — OFL 추정 |
| Gmarket Sans | 원 배포처 재확인 필요 | unverified — 조건부·TTF 전용 |

프리셋 seed 후보 4종 — culture-violet·care-green·deep-navy·slate-neutral. 자동 생성기(generate-preset.js)·게이트 3종(Y 대역·point 밴드·ΔE)과 함께 v2에서 재평가한다.

v2 검출기 후보 — 모션 수치·이모지·상태 셀렉터·카피 금지 문자열. §9 체크리스트로 대신 운용하고, 오탐 데이터가 쌓이면 기계화를 재평가한다.

## 관련

- 표현 등급 운용·판정 예시: `project-profiles.md`
- 프로필 구조·밀도·section 흐름: `contracts/profiles.json`
- 기계 정본: `contracts/art-direction.json` / 팔레트 hex 정본: `tokens/presets/`
- 모션 수치: site/design/interaction-timing.md / 카피 문장 공식: site/design/microcopy.md
- 상태 셋 명세: site/design/ui-states.md / 납품 게이트: `release-checklist.md`
