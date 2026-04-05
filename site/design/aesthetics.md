---
title: 프론트엔드 미학
order: 7
---

AI가 생성하는 프론트엔드 코드가 generic하지 않고, 맥락에 맞는 독창적 미학을 갖도록 하기 위한 가이드. 인포마인드 디자인 시스템 위에 적용하며, 제품 UI와 랜딩/마케팅 페이지의 적용 수준을 구분한다.

## AI 슬롭 안티패턴

아래 패턴은 "AI가 만든 티"가 나는 대표적 징후다. 반드시 피한다.

| 안티패턴 | 왜 문제인가 |
|----------|------------|
| Inter / Roboto / Arial / 시스템 폰트 기본 사용 | 어디서나 볼 수 있는 generic한 인상 |
| 보라색 그라디언트 + 흰 배경 | AI 생성물의 가장 흔한 클리셰 |
| 예측 가능한 레이아웃/컴포넌트 패턴 | 맥락 없는 틀에 박힌 구성 |
| 매번 같은 폰트 수렴 (예: Space Grotesk) | 생성 간 다양성 부족 |
| 맥락 무시한 쿠키커터 디자인 | 프로젝트 정체성이 없는 결과물 |
| 단색 배경에 분위기/깊이감 없음 | 시각적 풍부함 부재 |

**대안**: 매번 새로운 선택을 한다. 폰트, 색상, 레이아웃, 테마를 프로젝트 맥락에 맞게 변주한다.

### Before / After 비교: 카드 컴포넌트

**Before -- AI 슬롭 카드 (generic)**

```scss
// 문제: 토큰 미사용, 하드코딩, 개성 없음
.card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  font-family: 'Inter', sans-serif;

  h3 {
    font-size: 18px;         // 요소 선택자 의존
    color: #333;             // 하드코딩 색상
    margin-bottom: 12px;
  }

  p {
    font-size: 14px;
    color: #666;
    line-height: 1.5;
  }

  .btn {                     // BEM 미준수
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);  // 보라색 그라디언트
    color: white;
    border-radius: 8px;
    padding: 12px 24px;
  }
}
```

**After -- 의도적 카드 (inCMS 대시보드용)**

```scss
// inCMS 대시보드: Flat + Minimalism, 토큰 기반
.card {
  background-color: var(--color-bg);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-base);
  padding: var(--spacing-lg);
  transition: box-shadow var(--transition-fast);

  &:hover {
    box-shadow: var(--shadow-base);
  }

  &__title {
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text);
    margin-bottom: var(--spacing-sm);
  }

  &__description {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    line-height: var(--leading-base);
  }

  &__action {
    margin-top: var(--spacing-md);
  }
}
```

핵심 차이점:

| 항목 | AI 슬롭 | 의도적 설계 |
|------|---------|------------|
| 색상 | 하드코딩 `#333`, `#666` | 토큰 `var(--color-text)` |
| 레이아웃 | 매직넘버 `24px`, `12px` | 토큰 `var(--spacing-lg)`, `var(--spacing-sm)` |
| 네이밍 | `.btn`, `h3`, `p` | BEM `.card__title`, `.card__action` |
| 버튼 | 보라색 그라디언트 | 제품 토큰 기반 Primary |
| 폰트 | `Inter` 기본값 | 시스템 `PretendardGOV` |
| 모션 | 없음 | 토큰 기반 hover 트랜지션 |

### Before / After 비교: 히어로 섹션

**Before -- AI 슬롭 히어로**

```html
<!-- 문제: 보라색 그라디언트, generic 문구, 맥락 없음 -->
<section style="background: linear-gradient(135deg, #667eea, #764ba2); padding: 80px 20px; text-align: center;">
  <h1 style="color: white; font-size: 48px;">Welcome to Our Platform</h1>
  <p style="color: rgba(255,255,255,0.8);">The best solution for your needs</p>
</section>
```

**After -- SmartFarm 랜딩 히어로 (Organic Biophilic)**

```html
<section class="hero hero--biophilic">
  <div class="container">
    <h1 class="hero__title">스마트팜 통합 모니터링</h1>
    <p class="hero__subtitle">온실 환경부터 생육 데이터까지, 한 화면에서 확인하세요</p>
    <a href="#demo" class="btn btn--primary btn--lg">데모 체험하기</a>
  </div>
</section>
```

```scss
.hero {
  &--biophilic {
    background-color: #f0f7f0;           // 자연 감성 확장 색상
    background-image:
      radial-gradient(ellipse at 20% 50%, rgba(34, 135, 56, 0.08) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 20%, rgba(37, 110, 244, 0.05) 0%, transparent 50%);
    padding: var(--spacing-3xl) 0;
  }

  &__title {
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-text);
  }

  &__subtitle {
    font-size: var(--font-size-md);
    color: var(--color-text-secondary);
    margin-top: var(--spacing-sm);
  }
}
```

## 5트랙 디자인 사고

새 프로젝트 또는 랜딩페이지 UI를 설계할 때 **5가지를 동시에** 검토한다. 5트랙 검토 없이 바로 코딩하지 않는다.

| Track | 질문 |
|-------|------|
| **Product** | 어떤 산업/도메인인가? 사용자는 누구인가? |
| **Style** | 어떤 UI 스타일이 맥락에 맞는가? |
| **Color** | 도메인 감성에 맞는 팔레트는? |
| **Layout** | 어떤 페이지 구조 패턴이 목적에 맞는가? |
| **Typography** | 어떤 폰트 페어링이 톤앤매너에 맞는가? |

### 프로젝트 시작 체크리스트

새 프로젝트를 시작할 때 아래 체크리스트를 반드시 완성한 뒤 코딩에 들어간다.

#### Product Track

- [ ] 산업/도메인을 명확히 정의했는가 (공공, 금융, 농업, 유통 등)
- [ ] 주요 사용자 페르소나를 1~2개 설정했는가
- [ ] 사용자의 기술 숙련도를 파악했는가 (전문가/일반인/고령자)
- [ ] 경쟁 제품/유사 서비스의 UI를 조사했는가
- [ ] 제품 유형을 결정했는가 (대시보드/랜딩/관리자/공공포털)

#### Style Track

- [ ] 아래 제품별 스타일 매핑 테이블에서 권장 스타일을 확인했는가
- [ ] 금지 스타일을 확인하고 팀에 공유했는가
- [ ] 레퍼런스 사이트를 3개 이상 수집했는가
- [ ] 스타일 키워드를 2~3개로 압축했는가 (예: "깔끔한 + 신뢰감 + 데이터 중심")

#### Color Track

- [ ] 토큰 시스템의 Primary 색상을 프로젝트에 맞게 오버라이드했는가
- [ ] `_project-overrides.scss`에 프로젝트 색상을 정의했는가
- [ ] 색상 대비 4.5:1 (WCAG AA)을 검증했는가
- [ ] 시맨틱 컬러(danger/warning/success/info)를 그대로 사용하는가, 조정이 필요한가
- [ ] Dark Mode가 필요한 제품인가 (BigData, inPOS 등)

#### Layout Track

- [ ] 주요 페이지의 와이어프레임을 그렸는가
- [ ] 그리드 시스템(12컬럼)을 기본으로 사용하는가, 커스텀이 필요한가
- [ ] 반응형 브레이크포인트(모바일/태블릿/PC)별 레이아웃을 설계했는가
- [ ] 정보 밀도를 결정했는가 (고밀도 대시보드 vs 여유 있는 마케팅)
- [ ] 네비게이션 패턴을 결정했는가 (사이드바/탑바/탭)

#### Typography Track

- [ ] 제품 UI는 `PretendardGOV` + `JetBrains Mono` 기본 조합을 사용하는가
- [ ] 랜딩/마케팅이라면 디스플레이 폰트를 선정했는가
- [ ] 폰트 크기 스케일이 토큰과 일치하는가 (xs~2xl)
- [ ] line-height를 콘텐츠 유형에 맞게 설정했는가 (tight/base/loose)
- [ ] 웹폰트 로딩 전략을 결정했는가 (font-display: swap)

### 디자인 씽킹 4항목

코드를 작성하기 전에 아래 4가지를 반드시 명확히 한다.

| 항목 | 질문 |
|------|------|
| **목적** | 이 인터페이스가 해결하는 문제는? 사용자는 누구인가? |
| **톤/미학** | 어떤 미학 방향인가? (미니멀, 맥시멀, 레트로퓨처, 유기적, 럭셔리 등) |
| **기술 제약** | 프레임워크, 성능, 접근성 요구사항은? |
| **차별화** | 사용자가 기억할 **단 하나**의 포인트는 무엇인가? |

## 미학 원칙 5가지

### 1. 타이포그래피 개성

- 독특하고 아름다운 폰트를 선택한다. generic 폰트를 기본값으로 사용하지 않는다
- 디스플레이 + 본문 페어링: 개성 있는 디스플레이 폰트와 가독성 높은 본문 폰트를 조합한다
- **인포마인드 제품 UI**: `PretendardGOV` + `JetBrains Mono`는 제품 UI의 표준이다. 랜딩/마케팅 페이지에서는 맥락에 맞는 디스플레이 폰트를 추가할 수 있다
- **한국어 줄바꿈**: 모든 한국어 텍스트 블록에 `word-break: keep-all; overflow-wrap: break-word;` 적용하라. 단어 중간 줄바꿈은 가독성을 크게 해친다
- **한국어 행간**: `line-height: 1`(leading-none) 사용 금지. 한국어는 라틴보다 글자 높이가 커서 최소 `--leading-tight`(1.2) 이상이 필요하다

### 2. 색상 의도성

- 일관된 미학을 유지한다. CSS 변수를 사용해 통일감을 확보한다
- **지배적 색상 + 날카로운 악센트**: 하나의 주조색에 강한 포인트 색을 더하는 전략이 효과적이다
- **인포마인드 제품 UI**: 토큰 팔레트를 우선 사용한다. 랜딩 페이지에서는 토큰 기반으로 확장된 색상 표현이 가능하다

### 3. 모션 집중

- CSS 기반 애니메이션을 우선한다
- **고임팩트 순간에 집중**: 잘 설계된 페이지 로드 시퀀스(스태거드 리빌)가 흩어진 마이크로인터랙션보다 효과적이다
- 스크롤 트리거 애니메이션과 예상치 못한 호버 효과로 인터랙션에 놀라움을 더한다

### 4. 비대칭 레이아웃

- 좌우 대칭에 안주하지 않는다
- 오버랩 & 대각선 흐름: 요소 간 겹침, 대각선 방향성으로 시각적 긴장감을 만든다
- 그리드 브레이킹: 일부 요소를 의도적으로 그리드 밖에 배치한다
- 여백 활용: 넉넉한 네거티브 스페이스 또는 통제된 밀도 -- 둘 다 유효하다

### 5. 배경 깊이

단색 배경을 기본으로 사용하지 않는다. 분위기와 깊이감을 만든다.

- 그라디언트 메시 / 미묘한 그라디언트
- 노이즈 텍스처 / 그레인 오버레이
- 기하학 패턴 / 장식적 보더
- 레이어 투명도 / 드라마틱한 그림자
- 커스텀 커서 등 맥락적 효과

## INFOMIND 제품별 UI 스타일 매핑

| 제품/프로젝트 | 권장 스타일 | 색상 방향 | 레이아웃 특성 | 금지 스타일 |
|-------------|------------|----------|-------------|------------|
| **inCMSv3** | Flat + Minimalism + Glassmorphism(모달) | Primary Blue(`--color-primary`) + 넓은 White 여백 | 사이드바 네비게이션, 12컬럼 컨텐츠 그리드 | Brutalism, Claymorphism, Cyberpunk |
| **inPOS** | Flat + Dark Mode(선택) | 고대비 Dark(`#1a1a2e`) + Accent Green | 고밀도 POS 레이아웃, 큰 터치 타겟(48px+) | 과도한 Motion-Driven |
| **in_S / inSWING** | Minimalism + Flat | Primary Blue 계열, 깔끔한 Gray 스케일 | 탑바 네비게이션, 폼 중심 레이아웃 | Neubrutalism, Y2K |
| **BigData 플랫폼** | Data-Dense + Dark Mode + Glassmorphism | Dark Navy(`#0d1117`) + Cyan/Green 데이터 강조 | 다중 패널 대시보드, 차트 그리드 3~4열 | Organic Biophilic, Claymorphism |
| **SmartFarm** | Organic Biophilic + Minimalism | Green 계열(`#228738`) + Earth tone 보조 | 카드 기반 모니터링, 지도 중심 레이아웃 | Cyberpunk, HUD |
| **면세 플랫폼** | Glassmorphism + Feature-Rich Showcase | Luxury Gold(`#b8860b`) + 깊은 Navy 배경 | 상품 그리드, 풀스크린 히어로 | Brutalism |
| **랜딩/마케팅** | Aurora UI + Hero-Centric + Storytelling | 프로젝트별 자유, 그라디언트 적극 활용 | 풀스크린 섹션, 스크롤 스토리텔링 | (제약 없음, 맥락 우선) |
| **WEB/SI** | Flat + Minimalism | 기관 CI 색상 기반, 토큰 오버라이드 | 공공 웹 표준 레이아웃, 본문 건너뛰기 필수 | 감성/트렌드 스타일 (클라이언트 확인 후) |

### 제품별 SCSS 오버라이드 예시

```scss
// _project-overrides.scss -- BigData 플랫폼
:root {
  --color-primary: #00b4d8;
  --color-primary-light: #48cae4;
  --color-primary-dark: #0077b6;
  --color-bg: #0d1117;
  --color-bg-secondary: #161b22;
  --color-text: #e6edf3;
  --color-text-secondary: #8b949e;
  --color-border: #30363d;
  --color-border-light: #21262d;
}

// _project-overrides.scss -- SmartFarm
:root {
  --color-primary: #228738;
  --color-primary-light: #4caf50;
  --color-primary-dark: #1b5e20;
  --color-bg: #fafdf7;
  --color-bg-secondary: #f0f7f0;
}
```

### 주요 스타일 설명

| 스타일 | 특징 |
|--------|------|
| **Flat Design** | 그림자 없음, 솔리드 컬러. 깊이감 부재는 타이포로 보완 |
| **Minimalism** | 여백, 그리드, 타이포 중심. 지루해지지 않도록 타이포 강조 |
| **Glassmorphism** | `backdrop-filter: blur`, 반투명 레이어. 저사양 기기 성능 고려 |
| **Dark Mode (OLED)** | 순수 검정(#000), 고대비. 라이트 모드 대응 병행 필수 |
| **Data-Dense Dashboard** | 정보 압축, 고밀도 레이아웃. 실시간 모니터링에 적합 |
| **Aurora UI** | 흐르는 그라디언트, 빛 번짐. 랜딩/마케팅 전용 |
| **Organic Biophilic** | 자연 형태, 둥근 모서리. 환경/지속가능성 제품에 적합 |

### 인포마인드 디자인 시스템 연계

**제품 UI** (inPOS, in_S, inCMS 등):
- 토큰 시스템을 그대로 적용한다
- 폰트: `PretendardGOV` + `JetBrains Mono`
- 이 가이드의 미학 원칙은 레이아웃, 모션, 공간 활용에서 참고한다

**랜딩/마케팅/프로모션 페이지**:
- 토큰 시스템을 기반으로 하되 독창적 미학을 얹는다
- 디스플레이 폰트 추가, 확장 색상 팔레트, 대담한 레이아웃 등 자유도가 높다
- 5가지 미학 원칙을 적극 활용한다

## 관련 문서

- [토큰 개요](/tokens/) -- CSS Custom Properties 정의 및 사용법
- [디자인 감사](/design/design-audit/) -- 디자인 품질 평가 체크리스트
- [인터랙션 타이밍](/design/interaction-timing/) -- 모션 & 전환 명세
