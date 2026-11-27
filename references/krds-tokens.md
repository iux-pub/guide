# INFOUX 파운데이션 토큰 카탈로그

> 자동 생성됨. 직접 수정 금지.
> 출처: `tokens/build/tokens.css` (`tokens/foundation.json` + `tokens/brand.json` 합성 결과)
> 기준 버전: 4.0.0

색상, 기본 폰트, 브레이크포인트는 이 문서의 토큰을 사용한다. 임의 hex/rgb/hsl 색상 작성은 금지한다. 간격·크기·타이포 스케일·모션·z-index는 토큰 카탈로그 대상이 아니다 — 간격·크기·타이포는 rem 임의값(`p-[1.6rem]`, Tailwind 기본 스케일은 62.5% 루트에서 37.5% 작아 R-37 금지), 모션·z-index는 CSS 값이나 Tailwind 임의값(`duration-[200ms]`, `z-[1050]`)으로 작성한다.

이 문서는 `tokens.css`의 `--color-*` 166개와 `--font-*`·`--breakpoint-*` 전량을 싣는다. 여기 없는 이름은 없는 토큰이다 — 지어내지 않는다.

---

## 색상 — 시맨틱 (먼저 쓴다)

「참조」는 라이트 모드에서 같은 값을 가진 단계 토큰이다. 「고대비」는 `[data-color-mode="high-contrast"]`에서 바뀌는 값이다.

### 시맨틱 — 브랜드

| 토큰 | 값 | 고대비 | 참조 | 용도 |
|------|----|--------|------|------|
| `--color-primary` | `#256ef4` | `#256ef4` | primary-50 | 브랜드·주요 액션 |
| `--color-primary-hover` | `#0b50d0` | `#0b50d0` | primary-60 | 주요 액션 hover |
| `--color-primary-pressed` | `#083891` | `#083891` | primary-70 | 주요 액션 pressed |
| `--color-secondary` | `#346fb2` | `#268097` | secondary-50 | 보조 브랜드 |
| `--color-point` | `#d63d4a` | `#d63d4a` | point-50 | 강조(포인트) |

### 시맨틱 — 링크

| 토큰 | 값 | 고대비 | 참조 | 용도 |
|------|----|--------|------|------|
| `--color-link` | `#256ef4` | `#86aff9` | primary-50 | 링크 기본 |
| `--color-link-hover` | `#0b50d0` | `#b1cefb` | primary-60 | 링크 hover |
| `--color-link-pressed` | `#083891` | `#d8e5fd` | primary-70 | 링크 pressed |
| `--color-link-visited` | `#5917b8` | `#c49ff9` | — | 방문한 링크 |

### 시맨틱 — 버튼

| 토큰 | 값 | 고대비 | 참조 | 용도 |
|------|----|--------|------|------|
| `--color-button-primary-fill` | `#0b50d0` | `#86aff9` | primary-60 | primary 버튼 채움 |
| `--color-button-primary-fill-hover` | `#083891` | `#b1cefb` | primary-70 | primary 버튼 채움 (hover) |
| `--color-button-primary-fill-pressed` | `#052561` | `#d8e5fd` | primary-80 | primary 버튼 채움 (pressed) |
| `--color-button-secondary-fill` | `#ecf2fe` | `#020f27` | primary-5 | secondary 버튼 채움 |
| `--color-button-secondary-fill-hover` | `#d8e5fd` | `#03163a` | primary-10 | secondary 버튼 채움 (hover) |
| `--color-button-secondary-fill-pressed` | `#b1cefb` | `#052561` | primary-20 | secondary 버튼 채움 (pressed) |
| `--color-button-secondary-border` | `#256ef4` | `#256ef4` | primary-50 | secondary 버튼 테두리 |
| `--color-button-tertiary-fill` | `#ffffff00` | `#00000000` | — | tertiary 버튼 채움 |
| `--color-button-tertiary-fill-hover` | `#f4f5f6` | `#131416` | gray-5 | tertiary 버튼 채움 (hover) |
| `--color-button-tertiary-fill-pressed` | `#e6e8ea` | `#33363d` | gray-10 | tertiary 버튼 채움 (pressed) |
| `--color-button-tertiary-border` | `#58616a` | `#8a949e` | gray-60 | tertiary 버튼 테두리 |
| `--color-button-text-fill` | `#ffffff00` | `#00000000` | — | text 버튼 채움 |
| `--color-button-text-fill-hover` | `#eef2f7` | `#091f25` | secondary-5 | text 버튼 채움 (hover) |
| `--color-button-text-fill-pressed` | `#d6e0eb` | `#0e3139` | secondary-10 | text 버튼 채움 (pressed) |
| `--color-button-text-border` | `#00000000` | `#ffffff80` | — | text 버튼 테두리 |
| `--color-button-disabled-fill` | `#cdd1d5` | `#33363d` | gray-20 | 비활성 버튼 채움 |
| `--color-button-disabled-border` | `#b1b8be` | `#464c53` | gray-30 | 비활성 버튼 테두리 |

### 시맨틱 — 입력

| 토큰 | 값 | 고대비 | 참조 | 용도 |
|------|----|--------|------|------|
| `--color-input-surface` | `#ffffff` | `#1e2124` | gray-0 | 입력 표면 |
| `--color-input-surface-disabled` | `#cdd1d5` | `#131416` | gray-20 | 비활성 입력 표면 |
| `--color-input-border` | `#58616a` | `#8a949e` | gray-60 | 입력 테두리 |
| `--color-input-border-active` | `#256ef4` | `#256ef4` | primary-50 | 입력 테두리 (focus) |
| `--color-input-border-disabled` | `#b1b8be` | `#464c53` | gray-30 | 비활성 입력 테두리 |
| `--color-input-border-error` | `#de3412` | `#de3412` | danger-50 | 입력 오류 테두리 |

### 시맨틱 — 텍스트

| 토큰 | 값 | 고대비 | 참조 | 용도 |
|------|----|--------|------|------|
| `--color-text` | `#1e2124` | `#f4f5f6` | gray-90 | 본문 (기본) |
| `--color-text-bolder` | `#131416` | `#e6e8ea` | gray-95 | 가장 진한 텍스트 |
| `--color-text-subtle` | `#464c53` | `#cdd1d5` | gray-70 | 보조 텍스트 |
| `--color-text-disabled` | `#8a949e` | `#58616a` | gray-40 | 비활성 텍스트 |
| `--color-text-inverse` | `#ffffff` | `#1e2124` | gray-0 | 다크 배경 위 텍스트 |
| `--color-text-primary` | `#0b50d0` | `#b1cefb` | primary-60 | 브랜드색 텍스트 (활성 메뉴·강조) |
| `--color-danger-text` | `#bd2c0f` | `#f7afa1` | danger-60 | 오류 텍스트 |
| `--color-warning-text` | `#8a5c00` | `#ffc95c` | warning-60 | 경고 텍스트 |
| `--color-success-text` | `#267337` | `#a9dab4` | success-60 | 성공 텍스트 |
| `--color-info-text` | `#096ab3` | `#9ed2fa` | information-60 | 정보 텍스트 |

### 시맨틱 — 배경

| 토큰 | 값 | 고대비 | 참조 | 용도 |
|------|----|--------|------|------|
| `--color-bg` | `#ffffff` | `#000000` | gray-0 | 페이지 기본 배경 |
| `--color-bg-subtler` | `#f4f5f6` | `#131416` | gray-5 | 보조 배경 (헤더 띠 등) |
| `--color-bg-subtle` | `#e6e8ea` | `#1e2124` | gray-10 | 더 진한 보조 배경 |
| `--color-bg-inverse` | `#1e2124` | `#e6e8ea` | gray-90 | 다크 배경 |
| `--color-bg-dim` | `#000000bf` | `#000000bf` | alpha-black-75 | 모달 dim |

### 시맨틱 — 표면

| 토큰 | 값 | 고대비 | 참조 | 용도 |
|------|----|--------|------|------|
| `--color-surface` | `#ffffff` | `#000000` | gray-0 | 카드/패널 표면 |
| `--color-surface-subtler` | `#f4f5f6` | `#131416` | gray-5 | 보조 표면 |
| `--color-surface-disabled` | `#cdd1d5` | `#464c53` | gray-20 | 비활성 표면 |
| `--color-surface-primary-subtler` | `#ecf2fe` | `#020f27` | primary-5 | 옅은 primary 표면 |
| `--color-surface-information-subtler` | `#e7f4fe` | `#021a2c` | information-5 | 옅은 정보 표면 |
| `--color-surface-success-subtler` | `#eaf6ec` | `#0e2012` | success-5 | 옅은 성공 표면 |
| `--color-surface-warning-subtler` | `#fff3db` | `#241800` | warning-5 | 옅은 경고 표면 |
| `--color-surface-danger-subtler` | `#fdefec` | `#260903` | danger-5 | 옅은 오류 표면 |
| `--color-danger-surface` | `#fdefec` | `#260903` | danger-5 | 오류 알림 배경 |
| `--color-warning-surface` | `#fff3db` | `#241800` | warning-5 | 경고 알림 배경 |
| `--color-success-surface` | `#eaf6ec` | `#0e2012` | success-5 | 성공 알림 배경 |
| `--color-info-surface` | `#e7f4fe` | `#021a2c` | information-5 | 정보 알림 배경 |

### 시맨틱 — 보더

| 토큰 | 값 | 고대비 | 참조 | 용도 |
|------|----|--------|------|------|
| `--color-border` | `#b1b8be` | `#6d7882` | gray-30 | 기본 테두리 |
| `--color-border-light` | `#cdd1d5` | `#33363d` | gray-20 | 옅은 구분선 |
| `--color-border-dark` | `#58616a` | `#8a949e` | gray-60 | 진한 테두리 (hover) |
| `--color-border-control` | `#6d7882` | `#8a949e` | gray-50 | 폼 컨트롤 테두리 (배경 대비 3:1) |
| `--color-border-primary` | `#256ef4` | `#256ef4` | primary-50 | 강조 테두리 (focus·선택) |
| `--color-border-primary-light` | `#d8e5fd` | `#03163a` | primary-10 | 옅은 primary 테두리 |
| `--color-border-information-light` | `#d3ebfd` | `#03253f` | information-10 | 옅은 정보 테두리 |
| `--color-border-success-light` | `#d8eedd` | `#122b18` | success-10 | 옅은 성공 테두리 |
| `--color-border-warning-light` | `#ffe0a3` | `#2e1f00` | warning-10 | 옅은 경고 테두리 |
| `--color-border-danger-light` | `#fcdfd9` | `#390d05` | danger-10 | 옅은 오류 테두리 |
| `--color-border-disabled` | `#b1b8be` | `#464c53` | gray-30 | 비활성 테두리 |

### 시맨틱 — 상태

| 토큰 | 값 | 고대비 | 참조 | 용도 |
|------|----|--------|------|------|
| `--color-danger` | `#de3412` | `#de3412` | danger-50 | 오류 상태색 (아이콘·강조) |
| `--color-warning` | `#9e6a00` | `#9e6a00` | warning-50 | 경고 상태색 (아이콘·강조) |
| `--color-success` | `#228738` | `#228738` | success-50 | 성공 상태색 (아이콘·강조) |
| `--color-info` | `#0b78cb` | `#0b78cb` | information-50 | 정보 상태색 (아이콘·강조) |

## 색상 — 단계 (명도가 필요할 때만)

### Primary (브랜드 / 액션 강조)

| 단계 | 토큰 | hex | 고대비 |
|------|------|-----|--------|
| 5 | `--color-primary-5` | `#ecf2fe` | `#ecf2fe` |
| 10 | `--color-primary-10` | `#d8e5fd` | `#d8e5fd` |
| 20 | `--color-primary-20` | `#b1cefb` | `#b1cefb` |
| 30 | `--color-primary-30` | `#86aff9` | `#86aff9` |
| 40 | `--color-primary-40` | `#4c87f6` | `#4c87f6` |
| 50 | `--color-primary-50` | `#256ef4` | `#256ef4` |
| 60 | `--color-primary-60` | `#0b50d0` | `#0b50d0` |
| 70 | `--color-primary-70` | `#083891` | `#083891` |
| 80 | `--color-primary-80` | `#052561` | `#052561` |
| 90 | `--color-primary-90` | `#03163a` | `#03163a` |
| 95 | `--color-primary-95` | `#020f27` | `#020f27` |

### Secondary (보조 브랜드)

| 단계 | 토큰 | hex | 고대비 |
|------|------|-----|--------|
| 5 | `--color-secondary-5` | `#eef2f7` | `#edf6f8` |
| 10 | `--color-secondary-10` | `#d6e0eb` | `#d5ebf1` |
| 20 | `--color-secondary-20` | `#bacbde` | `#abd8e3` |
| 30 | `--color-secondary-30` | `#90b0d5` | `#75c0d1` |
| 40 | `--color-secondary-40` | `#6b96c7` | `#3d9fb8` |
| 50 | `--color-secondary-50` | `#346fb2` | `#268097` |
| 60 | `--color-secondary-60` | `#1c589c` | `#1f687a` |
| 70 | `--color-secondary-70` | `#063a74` | `#17505e` |
| 80 | `--color-secondary-80` | `#052b57` | `#113b45` |
| 90 | `--color-secondary-90` | `#031f3f` | `#0e3139` |
| 95 | `--color-secondary-95` | `#02162c` | `#091f25` |

### Gray (무채색 — 텍스트/배경/보더)

| 단계 | 토큰 | hex | 고대비 |
|------|------|-----|--------|
| 0 | `--color-gray-0` | `#ffffff` | `#ffffff` |
| 5 | `--color-gray-5` | `#f4f5f6` | `#f4f5f6` |
| 10 | `--color-gray-10` | `#e6e8ea` | `#e6e8ea` |
| 20 | `--color-gray-20` | `#cdd1d5` | `#cdd1d5` |
| 30 | `--color-gray-30` | `#b1b8be` | `#b1b8be` |
| 40 | `--color-gray-40` | `#8a949e` | `#8a949e` |
| 50 | `--color-gray-50` | `#6d7882` | `#6d7882` |
| 60 | `--color-gray-60` | `#58616a` | `#58616a` |
| 70 | `--color-gray-70` | `#464c53` | `#464c53` |
| 80 | `--color-gray-80` | `#33363d` | `#33363d` |
| 90 | `--color-gray-90` | `#1e2124` | `#1e2124` |
| 95 | `--color-gray-95` | `#131416` | `#131416` |
| 100 | `--color-gray-100` | `#000000` | `#000000` |

### Danger (오류/삭제)

| 단계 | 토큰 | hex | 고대비 |
|------|------|-----|--------|
| 5 | `--color-danger-5` | `#fdefec` | `#fdefec` |
| 10 | `--color-danger-10` | `#fcdfd9` | `#fcdfd9` |
| 20 | `--color-danger-20` | `#f7afa1` | `#f7afa1` |
| 30 | `--color-danger-30` | `#f48771` | `#f48771` |
| 40 | `--color-danger-40` | `#f05f42` | `#f05f42` |
| 50 | `--color-danger-50` | `#de3412` | `#de3412` |
| 60 | `--color-danger-60` | `#bd2c0f` | `#bd2c0f` |
| 70 | `--color-danger-70` | `#8a240f` | `#8a240f` |
| 80 | `--color-danger-80` | `#5c180a` | `#5c180a` |
| 90 | `--color-danger-90` | `#390d05` | `#390d05` |
| 95 | `--color-danger-95` | `#260903` | `#260903` |

### Warning (경고)

| 단계 | 토큰 | hex | 고대비 |
|------|------|-----|--------|
| 5 | `--color-warning-5` | `#fff3db` | `#fff3db` |
| 10 | `--color-warning-10` | `#ffe0a3` | `#ffe0a3` |
| 20 | `--color-warning-20` | `#ffc95c` | `#ffc95c` |
| 30 | `--color-warning-30` | `#ffb114` | `#ffb114` |
| 40 | `--color-warning-40` | `#c78500` | `#c78500` |
| 50 | `--color-warning-50` | `#9e6a00` | `#9e6a00` |
| 60 | `--color-warning-60` | `#8a5c00` | `#8a5c00` |
| 70 | `--color-warning-70` | `#614100` | `#614100` |
| 80 | `--color-warning-80` | `#422c00` | `#422c00` |
| 90 | `--color-warning-90` | `#2e1f00` | `#2e1f00` |
| 95 | `--color-warning-95` | `#241800` | `#241800` |

### Success (성공)

| 단계 | 토큰 | hex | 고대비 |
|------|------|-----|--------|
| 5 | `--color-success-5` | `#eaf6ec` | `#eaf6ec` |
| 10 | `--color-success-10` | `#d8eedd` | `#d8eedd` |
| 20 | `--color-success-20` | `#a9dab4` | `#a9dab4` |
| 30 | `--color-success-30` | `#7ec88e` | `#7ec88e` |
| 40 | `--color-success-40` | `#3fa654` | `#3fa654` |
| 50 | `--color-success-50` | `#228738` | `#228738` |
| 60 | `--color-success-60` | `#267337` | `#267337` |
| 70 | `--color-success-70` | `#285d33` | `#285d33` |
| 80 | `--color-success-80` | `#1f4727` | `#1f4727` |
| 90 | `--color-success-90` | `#122b18` | `#122b18` |
| 95 | `--color-success-95` | `#0e2012` | `#0e2012` |

### Information (정보)

| 단계 | 토큰 | hex | 고대비 |
|------|------|-----|--------|
| 5 | `--color-information-5` | `#e7f4fe` | `#e7f4fe` |
| 10 | `--color-information-10` | `#d3ebfd` | `#d3ebfd` |
| 20 | `--color-information-20` | `#9ed2fa` | `#9ed2fa` |
| 30 | `--color-information-30` | `#5fb5f7` | `#5fb5f7` |
| 40 | `--color-information-40` | `#2098f3` | `#2098f3` |
| 50 | `--color-information-50` | `#0b78cb` | `#0b78cb` |
| 60 | `--color-information-60` | `#096ab3` | `#096ab3` |
| 70 | `--color-information-70` | `#085691` | `#085691` |
| 80 | `--color-information-80` | `#053961` | `#053961` |
| 90 | `--color-information-90` | `#03253f` | `#03253f` |
| 95 | `--color-information-95` | `#021a2c` | `#021a2c` |

### Point (강조)

| 단계 | 토큰 | hex | 고대비 |
|------|------|-----|--------|
| 5 | `--color-point-5` | `#fbeff0` | `#fbeff0` |
| 10 | `--color-point-10` | `#f5d6d9` | `#f5d6d9` |
| 20 | `--color-point-20` | `#ebadb2` | `#ebadb2` |
| 30 | `--color-point-30` | `#e0858c` | `#e0858c` |
| 40 | `--color-point-40` | `#d65c66` | `#d65c66` |
| 50 | `--color-point-50` | `#d63d4a` | `#d63d4a` |
| 60 | `--color-point-60` | `#ab2b36` | `#ab2b36` |
| 70 | `--color-point-70` | `#7a1f26` | `#7a1f26` |
| 80 | `--color-point-80` | `#521419` | `#521419` |
| 90 | `--color-point-90` | `#310c0f` | `#310c0f` |
| 95 | `--color-point-95` | `#21080a` | `#21080a` |

### Alpha (검정 알파 — dim)

| 단계 | 토큰 | hex | 고대비 |
|------|------|-----|--------|
| 50 | `--color-alpha-black-50` | `#00000080` | `#00000080` |
| 75 | `--color-alpha-black-75` | `#000000bf` | `#000000bf` |

정보색의 단계 토큰 분류는 `information`이다(`--color-information-60`). 시맨틱 별칭(`--color-info`, `--color-info-text`, `--color-info-surface`)만 `info`를 쓴다.

## 기본 폰트

| 토큰 | 값 | 용도 |
|------|----|------|
| `--font-sans` | `'Pretendard GOV', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', system-ui, sans-serif` | 본문/컴포넌트 기본 폰트 |
| `--font-heading` | `'Pretendard GOV', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', system-ui, sans-serif` | 제목 차등 서체 — brand에 heading 슬롯이 없으면 sans 값 폴백 |
| `--font-mono` | `'JetBrains Mono', 'D2Coding', SFMono-Regular, Consolas, monospace` | 코드/고정폭 텍스트 |

## 브레이크포인트

| 토큰 | 값 | 용도 | Tailwind variant |
|------|----|------|------------------|
| `--breakpoint-mobile` | `360px` | 모바일 기준 뷰포트 | `mobile:` |
| `--breakpoint-tablet` | `768px` | 태블릿 이상 — 글자 크기 mobile→pc 전환 | `tablet:` |
| `--breakpoint-laptop` | `1024px` | 노트북 이상 — 메인 메뉴↔전체메뉴, 서브 LNB 2단, 레이아웃 간격 | `laptop:` |
| `--breakpoint-pc` | `1280px` | PC 이상 | `pc:` |

---

## 사용 원칙

- 색상은 `--color-*` 시맨틱 토큰을 우선 사용한다.
- 단계 색상은 예외적으로 명도가 필요한 경우에만 `--color-{group}-{step}`을 사용한다.
- 폰트 패밀리는 `--font-sans`, `--font-heading`, `--font-mono`만 사용한다.
- 브레이크포인트는 KRDS 표준형 360 / 768 / 1024 / 1280 네 단계만 사용한다. 글자 크기의 mobile→pc 전환은 768, 메인 메뉴↔전체메뉴·서브 LNB 2단·레이아웃 간격 전환은 1024다.
- Tailwind 반응형 variant는 `mobile:` / `tablet:` / `laptop:` / `pc:`만 사용하고 `sm:` / `md:` / `lg:` / `xl:` / `2xl:`는 사용하지 않는다.
- 단순 반응형 속성 변경은 CSS 파일 내부에서도 `@apply tablet:*`, `@apply pc:*`를 우선 사용한다.
- 복잡한 중첩 선택자나 여러 하위 요소를 동시에 제어해야 할 때만 `@media`를 사용하고, 관련 선택자 내부에 중첩한다.
- 파일 하단에 브레이크포인트별 `@media` 블록을 몰아두지 않는다.
- 순수 CSS `@media (min-width: var(--breakpoint-*))`는 표준으로 쓰지 않는다. 직접 `@media`가 필요하면 `768px`, `1280px` 값을 명시한다.
- 간격, 크기, 타이포 스케일, 반경, 그림자, 모션, z-index는 토큰화하지 않는다.
- 해당 값들은 `@apply`의 Tailwind 유틸리티 또는 명확한 CSS 직접값으로 작성한다.
- `tokens/build/tokens.css`는 자동 생성물이므로 직접 수정하지 않는다.

