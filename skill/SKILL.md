---
name: info-design
description: INFOMIND UX 팀의 디자인·퍼블리싱 컨트랙트. KRDS(범정부 UI/UX 디자인 시스템) 베이스 + INFOMIND 오버라이드. 트리거 — 사용자가 "info-design 스킬 기준으로 가자" 또는 "infomind 디자인 기준으로" 같이 말하면 즉시 활성화. UI/CSS/HTML 코드 생성, 디자인 토큰 결정, 컴포넌트 마크업, 색상·타이포·간격 선택, 접근성 검증, 피그마 컨벤션 적용 시 모두 사용. 활성화된 이상 정의된 토큰·컴포넌트 외 임의 생성은 절대 금지된다.
---

# info-design — INFOMIND UX 컨트랙트

> **이 스킬은 권장이 아니라 컨트랙트다.**
> 활성화된 이상 아래 명시된 규정 외의 결정을 LLM이 임의로 할 수 없다.
> 위반 발견 시 **즉시 작업을 중단하고 사용자에게 보고**한다.

---

## 0. 컨트랙트 발효 조건

다음 트리거 문구가 사용자 메시지에 등장하면 이 컨트랙트가 발효된다:

- "info-design 스킬 기준으로 가자"
- "infomind 디자인 기준"
- "ux 가이드대로"
- 또는 사용자가 명시적으로 이 스킬을 호출

**발효 즉시 LLM은 아래 모든 규정을 무조건 따른다.** 발효된 후에는 LLM 자신의 판단으로 규정을 우회·예외 처리하지 않는다.

---

## 1. 절대 금지 (MUST NOT)

다음을 **위반하면 코드를 작성하지 않고 작업을 중단**한다:

| 항목 | 금지 사유 |
|------|----------|
| 색상 raw hex/rgb/hsl 직접 작성 (`#fff`, `rgb(0,0,0)`) | KRDS 토큰만 허용 |
| 간격/크기 px·rem 직접 작성 (`padding: 16px`, `margin: 1rem`) | KRDS spacing 토큰만 허용 |
| 폰트 크기 직접 작성 (`font-size: 16px`) | KRDS text-* 토큰만 허용 |
| Tailwind raw 컬러 유틸리티 (`bg-red-500`, `text-gray-700`, `bg-white`) | 시맨틱 토큰만 (`bg-primary`, `text-text`, `bg-surface`) |
| Tailwind raw 폰트 사이즈 (`text-xs`, `text-base`, `text-lg`) | KRDS 스케일만 (`text-body-medium`, `text-heading-large` 등) |
| `!important` (정당한 사유 주석 없을 시) | 토큰 시스템 우회 위험 |
| 인라인 `style="..."` (CSS 변수 주입 외) | 토큰 추적 불가 |
| 컴포넌트 임의 생성 — KRDS·infoUX 컴포넌트 카탈로그에 없는 새 컴포넌트 | UX팀 승인 필요 — § 7 절차 따름 |
| 옛 variant 이름 사용 (`btn--ghost`, `btn--outline`, `btn--link`) | KRDS 4 variant만: `--primary` / `--secondary` / `--tertiary` / `--text` |
| BEM 미준수 클래스명 — Block_Element--Modifier 형식 외 | 일관성 |
| BEM element 2단계 중첩 (`.card__body__title`) | 평탄화 — `.card__title` 또는 `.card__body-title` |
| `:focus { outline: none }` | 접근성 위반. focus-visible은 reset.css 전역 처리 |
| `<div onclick>` 같이 div를 인터랙티브로 | 시맨틱 HTML 사용 (button/a) |
| 이미지 `alt` 누락 | KRDS R-09 |
| 폼 요소 `<label>` 누락 (placeholder만 사용) | 접근성 위반 |
| 터치 영역 44×44px 미만 인터랙티브 요소 (모바일 컨텍스트) | WCAG · INFOMIND 정책 |

**모호한 케이스는 사용자에게 질문한다.** 자체 판단으로 우회하지 않는다.

---

## 2. 절대 준수 (MUST)

| 항목 | 규정 |
|------|------|
| html `font-size` | **반드시 62.5% (1rem = 10px)** — KRDS 트릭 |
| 색상 | `var(--krds-light-color-*)` 또는 `@theme` 별칭 (`--color-primary` 등)만 사용 |
| 간격/크기 | `var(--krds-number-N)` / `var(--krds-gap-N)` / `var(--krds-padding-N)` / `var(--krds-size-height-N)` 또는 `--spacing-N` Tailwind 유틸 |
| 폰트 | `Pretendard GOV` (`var(--font-sans)`) — 직접 폰트 패밀리 작성 금지 |
| 폰트 사이즈 | KRDS 스케일만 (display-{large/medium/small}, heading-{xlarge..xxsmall}, body-{large/medium/small/xsmall} ± `-bold`, label-*, navigation-*) |
| line-height | 최소 150% (1.5) — KRDS 접근성 강제 |
| 반경 | `var(--krds-radius-{xsmall|small|medium|large|xlarge}{1..4})` 또는 `--radius-max` |
| 그림자 | INFOMIND `--shadow-{1|2|3}` 또는 KRDS 컴포넌트별 토큰 |
| z-index | `var(--z-{dropdown|sticky|fixed|modal-backdrop|modal|popover|toast|tooltip})` |
| 모션 duration | `var(--duration-{fast|base|slow})` |
| 모션 easing | `var(--easing-{standard|decelerate|accelerate|linear})` |
| 터치 영역 | `var(--touch-target-min)` (4.4rem = 44px) — 모바일 인터랙티브 요소 강제 |
| 브레이크포인트 | 360 / 768 / 1024 / 1280 / 1440 (5단계, KRDS 정의) |
| 컨테이너 max-width | 1200px (KRDS contents-size) |
| BEM | `.block__element--modifier` (소문자, 하이픈) — 5-objects · 6-components 레이어에만 |
| ITCSS | 7-layer 순서: 1-settings → 3-generic → 4-elements → 5-objects → 6-components → 7-utilities |
| @import (CSS) | Tailwind v4 `@import` 사용. SCSS `@use/@forward` 또는 `@import` 사용 금지 (SCSS 자체가 폐기됨) |
| 다크/고대비 | `[data-color-mode="high-contrast"]` 어트리뷰트로 자동 대응 — 컴포넌트 코드에 색 수동 분기 작성 금지 |

---

## 3. references — 작업 맥락별 로드 순서

**필요한 파일만 로드**한다. 전체를 한꺼번에 읽지 않는다.

| 작업 맥락 | 로드 |
|-----------|------|
| 토큰 결정 (색·타이포·간격·반경·그림자·모션) | `references/krds-tokens.md` |
| 컴포넌트 마크업 작성 | `references/krds-components.md` |
| Tailwind 유틸리티 사용 | `references/tailwind-mapping.md` |
| 접근성 검증 | `references/accessibility.md` |
| 코드 검토 — 무엇을 막을지 | `references/forbidden-patterns.md` |
| 이 스킬을 개발팀 레포에 임포트 | `references/guide-import.md` |

---

## 4. 작업 시작 전 자가 점검

코드를 한 줄이라도 작성하기 전에:

1. ✅ 사용하려는 색상은 `--color-*` (시맨틱) 또는 `--krds-light-color-*` 인가?
2. ✅ 간격은 `var(--krds-number-N)` / `var(--krds-gap-N)` / `--spacing-N` 인가?
3. ✅ 폰트 사이즈는 KRDS 스케일 토큰인가?
4. ✅ 컴포넌트 BEM은 `references/krds-components.md` 카탈로그에 있는가?
5. ✅ 인터랙티브 요소는 `<button>`/`<a>`/시맨틱 HTML인가?
6. ✅ 이미지 `alt`, 폼 `<label>`, focus 처리 모두 충족했는가?
7. ✅ 모바일 터치 영역 44px 이상인가?

위 7개 중 하나라도 No면 **작성 중단 → 사용자에게 어느 항목이 막히는지 보고** + 어떻게 해결할지 옵션 제시.

---

## 5. 옛 시스템 흔적 발견 시

이전 infoUX (KRDS 미적용 시절) 흔적을 발견하면:

- 옛 토큰명 (`--color-text-secondary`, `--font-size-base`, `--spacing-md`, `--radius-base`, `--transition-fast`, `--leading-tight`) → KRDS 토큰으로 교체 권장
- 옛 variant (`btn--ghost`, `btn--outline`, `btn--link`) → KRDS 4 variant로 매핑
- SCSS 파일 (`*.scss`, `@use`, `@forward`) → CSS로 마이그레이션 필요 (SCSS 폐기됨)

**자동 마이그레이션은 하지 말고, 사용자에게 어디를 바꿀지 보고**한 후 명시적 지시받고 진행한다.

---

## 6. 모호함 해소 — 사용자에게 질문할 케이스

다음은 자체 판단 금지. 사용자에게 묻는다:

- 새 컴포넌트가 필요한 것 같다 (카탈로그에 없음)
- KRDS 토큰으로 표현하기 애매한 디자인 요구
- 두 토큰 중 어느 쪽이 적절한지 모호 (예: `--color-text` vs `--color-text-bolder`)
- 옛 시스템 흔적을 발견 — 어떻게 처리할지
- 모바일/PC에서 다른 동작이 필요한데 어느 브레이크포인트에서 분기할지 모호

---

## 7. 카탈로그에 없는 컴포넌트 요구 시

`references/krds-components.md`에 정의된 22개 컴포넌트 외에 새 컴포넌트가 필요해 보이면:

1. **즉시 작성 중단**
2. 사용자에게 보고 — "카탈로그에 없는 컴포넌트가 필요합니다"
3. 옵션 제시:
   - (a) 기존 컴포넌트 조합으로 구현 (가능하면 우선)
   - (b) UX팀에 신규 컴포넌트 제안 (인포마인드 UX팀 GitHub 이슈 또는 직접 문의)
4. 사용자가 (b)를 택하면 일회성 인라인 구현은 가능하되, 코드 주석으로 `/* TODO: UX팀 정식 컴포넌트화 필요 */` 명시

---

## 8. 출처 — 단일 소스

이 스킬의 콘텐츠는 자동 생성된다. 직접 수정 금지.

- 토큰 출처: `tokens/krds-base.json` (KRDS-uiux v1.0.0) + `tokens/infomind-overrides.json`
- 컴포넌트 출처: `src/styles/6-components/*.css` + `src/snippets/*.md`
- 빌드: `node scripts/build-skill.js` → `skill/` 폴더 갱신
- 배포: `skill/` → `~/.claude/skills/info-design/` (UX팀장이 수동 배포)

---

## 9. 분쟁 시 우선순위

여러 규정이 충돌하면 다음 순서로 우선:

1. **접근성 (WCAG/KWCAG AA)** — 양보 불가
2. **KRDS 정본** — `tokens/krds-base.json`
3. **INFOMIND 오버라이드** — `tokens/infomind-overrides.json`
4. **프로젝트 오버라이드** — `_project-overrides.css` (있을 경우)
5. **사용자 명시 지시** — 단, 위 1~3을 깨면 사용자에게 확인

---

> 이 스킬이 활성화된 이상, 모든 LLM 출력은 위 규정의 적용 대상이다.
> 규정에 모호한 부분이 있으면 자체 판단하지 말고 사용자에게 묻는다.
