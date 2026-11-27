# 디자인 토큰 레퍼런스 — INFOUX Foundation

> 손으로 관리하는 파일이다(`npm run build:prompts`가 만들지 않는다). 토큰 이름은 `tokens/build/tokens.css`가 정본이다 — 어긋나면 이 파일을 고친다.

이 문서는 프로젝트에서 사용하는 공개 토큰의 범위와 사용 패턴을 안내한다.

| 단계 | 파일 | 정책 |
|------|------|------|
| 불변 계층 | `tokens/foundation.json` | gray·상태색·의미 토큰·브레이크포인트·`--font-mono`. 프로젝트에서 고치지 않는다 |
| 교체 계층 | `tokens/brand.json` | 브랜드 팔레트(primary·secondary·point)와 `--font-sans`·`--font-heading`. **프로젝트가 고치는 유일한 토큰 파일** |
| 빌드 산출물 | `tokens/build/tokens.css` | `npm run build:tokens`가 만든다. 직접 고치지 않는다 |

- `brand.json`은 light와 high-contrast 두 모드 값을 모두 정의한다. 다크 모드는 없다.
- 브랜드를 바꾸면 `npm run check:contrast`로 WCAG 2.1 AA 대비를 확인한다. 팔레트 프리셋은 `tokens/presets/`에 있다.
- 카탈로그: `references/krds-tokens.md`

## 공개 토큰 범위

```txt
tokens/foundation.json + tokens/brand.json
       │
       └─ tokens/build/tokens.css
            ├─ --color-*        색상/상태 토큰
            ├─ --font-sans      기본 본문 폰트
            ├─ --font-heading   제목 폰트(brand.json에 heading 슬롯이 없으면 sans 값)
            ├─ --font-mono      코드/고정폭 폰트(JetBrains Mono)
            └─ --breakpoint-*   mobile · tablet · laptop · pc
```

간격, 크기, 타이포 스케일, 반경, 그림자, 모션, z-index는 토큰화하지 않는다.
프로젝트 화면 밀도와 사용성에 맞게 Tailwind v4 `@apply`의 rem 임의값(`p-[2.4rem]`) 또는 CSS 직접값으로 작성한다. 루트 글자 크기는 62.5%(1rem = 10px)로 고정이라(R-31) Tailwind 기본 스케일(`p-4`, `text-sm`)은 37.5% 작게 렌더되므로 쓰지 않는다(R-37).

## 색상 토큰

| 토큰 | 의미 |
|------|------|
| `--color-primary` | 브랜드/주요 액션 |
| `--color-primary-hover` | 주요 액션 hover |
| `--color-primary-pressed` | 주요 액션 active |
| `--color-text` | 본문 텍스트 |
| `--color-text-bolder` | 강조 텍스트 |
| `--color-text-subtle` | 보조 텍스트 |
| `--color-text-disabled` | 비활성 텍스트 |
| `--color-text-inverse` | 어두운 배경 위 텍스트 |
| `--color-bg` | 기본 배경 |
| `--color-bg-subtle` / `--color-bg-subtler` | 보조 배경 |
| `--color-bg-inverse` | 짙은 배경 |
| `--color-surface` | 카드/패널 표면 |
| `--color-border` / `--color-border-light` / `--color-border-dark` | 테두리 |
| `--color-border-control` | 사용자가 조작하는 요소의 테두리 |
| `--color-border-primary` | 초점 링 |
| `--color-secondary` / `--color-point` | 보조 브랜드색 / 강조색 |
| `--color-link` / `--color-link-hover` / `--color-link-pressed` / `--color-link-visited` | 링크 |
| `--color-button-{variant}-fill` · `-fill-hover` · `-fill-pressed` | 버튼 상태(primary·secondary·tertiary·text) |
| `--color-input-border` · `-active` · `-error` · `-disabled` | 입력 필드 테두리 |
| `--color-danger` / `--color-warning` / `--color-success` / `--color-info` | 상태 색상 |

단계 색상은 명도 조정이 필요한 예외에만 `--color-primary-50`, `--color-gray-20`처럼 사용한다.

## 폰트 토큰

| 토큰 | 용도 |
|------|------|
| `--font-sans` | 본문/컴포넌트 기본 폰트. `brand.json`의 `font.family.sans` |
| `--font-heading` | 제목 폰트. `brand.json`의 `font.family.heading` — 표현 등급이 허용하는 프로젝트만 카탈로그 페어링(`references/art-direction.md` §3)으로 바꾼다. 스택은 `'표시 폰트', var(--font-sans)` 순서 |
| `--font-mono` | 코드, kbd, pre 등 고정폭 텍스트. 숫자가 세로로 정렬되는 표에도 쓴다 |

폰트 지정은 전역 `body`에서 `var(--font-sans)`로 한 번 적용한다. `font-family` 직접값은 쓰지 않는다(R-26).

## 브레이크포인트

| 토큰 | 값 | variant |
|------|-----|---------|
| `--breakpoint-mobile` | 360px | `mobile:` |
| `--breakpoint-tablet` | 768px | `tablet:` |
| `--breakpoint-laptop` | 1024px | `laptop:` |
| `--breakpoint-pc` | 1280px | `pc:` |

`@media (min-width: var(--breakpoint-*))`는 쓰지 않는다. variant를 쓰거나 값을 직접 적는다.
