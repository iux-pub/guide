# Tokens — INFOUX Foundation + Brand

이 폴더는 인포마인드 UX팀의 토큰 단일 소스다. 출력물(`build/`)은 직접 수정하지 않는다.

토큰은 **두 계층**이다. 프로젝트가 갈아끼우는 것과, 갈아끼우면 안 되는 것을 파일로 갈랐다.

## 파일 구조

```txt
tokens/
├── foundation.json          ← 불변 계층. 프로젝트에서 수정하지 않는다
├── brand.json               ← 교체 계층. 프로젝트가 이 파일만 고친다
├── contrast-baseline.json   ← 기존 대비 위반 기준선 (래칫)
├── README.md
└── build/                   ← 자동 생성
    └── tokens.css           ← 공개 CSS 변수 + Tailwind v4 @theme
```

## 두 계층의 경계

| | foundation.json | brand.json |
|---|---|---|
| 소유 | gray 스케일, 상태색(danger/warning/success/information), surface·border·input·button 등 의미 토큰, 브레이크포인트, `--font-mono` | 브랜드 팔레트(primary / secondary / point), `--font-sans` |
| 프로젝트에서 | **수정 금지** | **교체 대상** |
| 이유 | KRDS 기반 접근성 기준이다. 프로젝트마다 흔들리면 보증이 깨진다 | 발주처 CI는 프로젝트마다 다르다 |

의미 토큰은 값을 직접 갖지 않고 `{primitive.color.light.primary.50}` 형태로 팔레트를 **참조**한다. 그래서 `brand.json`의 팔레트만 바꾸면 링크·버튼·테두리까지 전부 따라온다.

**상태색은 브랜드가 아니다.** 발주처가 "우리 CI가 초록이니 성공색도 우리 초록으로" 요구하면 `point`로 받고 `success`는 건드리지 않는다. 빨강=오류, 초록=성공이 프로젝트마다 달라지면 사용자가 매번 다시 배워야 하고 접근성 검증도 매번 다시 해야 한다.

## 새 프로젝트에서 브랜드 바꾸기

1. `tokens/brand.json`의 `primary` / `secondary` / `point` 팔레트를 프로젝트 색으로 바꾼다.
2. **`light`와 `high-contrast` 두 모드를 모두 채운다.** 라이트만 채우고 고대비를 잊는 것이 가장 흔한 사고이며, 빌드가 이를 막는다.
3. `npm run build:tokens`
4. `npm run check` — 대비 검사가 WCAG 2.1 AA 위반을 잡는다.

## 대비 검사

```bash
npm run check:contrast
```

생성된 `build/tokens.css`를 읽어 라이트·고대비 두 모드에서 전경/배경 조합 40건을 계산한다. 기준은 일반 텍스트 4.5:1, 비텍스트 UI 요소 3:1이다.

`contrast-baseline.json`은 **이미 알고 있는 위반**을 기록한 래칫이다. 기준선에 없는 새 위반이 생기면 실패하고, 기준선 항목이 고쳐지면 "기준선이 낡았다"로 실패해 목록을 지우게 만든다. 이 파일은 위반을 승인하는 문서가 아니라 고칠 목록이다.

## 빌드

```bash
npm run build:tokens
```

## 공개 토큰 범위

`tokens/build/tokens.css`는 다음만 발행한다.

- 색상: `--color-*`
- 폰트 패밀리: `--font-sans`, `--font-mono`
- 브레이크포인트: `--breakpoint-mobile` / `-tablet` / `-pc`

간격, 크기, 타이포 스케일, 반경, 그림자, 모션, z-index는 토큰화하지 않는다.
해당 값은 CSS/Tailwind 직접값으로 작성한다.

## 사용 원칙

- 컴포넌트/페이지 색상은 `--color-*` 시맨틱 토큰을 우선 사용한다.
- 단계 색상은 명도 조정이 필요한 예외에만 `--color-primary-50`, `--color-gray-20`처럼 사용한다.
- 폰트 지정은 전역 `body`에서 `var(--font-sans)`로 한 번 적용한다.
- 코드 영역은 `var(--font-mono)`를 사용한다.
- 공개 사용 규칙에는 `--color-*`, `--font-*`만 포함한다.

## 갱신

- 브랜드 색·본문 폰트가 바뀌면 `brand.json`만 수정한다.
- 접근성 기준·상태색·의미 토큰 구조가 바뀌면 `foundation.json`을 수정한다. 이는 팀 표준 변경이므로 UX팀 판단이 필요하다.
