---
title: 인터랙션 규칙
order: 6
---

웹 인터페이스의 터치, 네비게이션, 상태 관리, 다크모드 규칙을 정의한다. Vercel Web Interface Guidelines 기반.

## 터치 & 인터랙션

| 규칙 | 코드 |
|------|------|
| 더블탭 줌 지연 제거 | `touch-action: manipulation` |
| 탭 하이라이트 제어 | `-webkit-tap-highlight-color: transparent` (또는 의도적 색상) |
| 모달/드로어 내부 스크롤 고립 | `overscroll-behavior: contain` |
| 드래그 중 텍스트 선택 방지 | `user-select: none` + 드래그 종료 시 복원 |
| `autoFocus` | 데스크탑 단일 입력에만 사용. 모바일에서는 사용 금지 |

```css
/* 모달/드로어 */
.modal__container {
  overscroll-behavior: contain;
}

/* 터치 최적화 */
button, a {
  touch-action: manipulation;
}
```

## 네비게이션 & 상태

| 규칙 | 설명 |
|------|------|
| URL = 상태 | 필터, 탭, 페이지네이션, 패널 상태를 query params에 반영 |
| 링크 = `<a>` | Cmd/Ctrl+클릭, 중간 버튼 클릭 지원. `<div onClick>` 금지 |
| 파괴적 작업 | 확인 모달 또는 undo 제공. 즉시 삭제 금지 |

```html
<!-- DO: 상태를 URL에 반영 -->
<a href="/users?page=2&sort=name">2페이지</a>

<!-- DON'T: 상태를 JS에만 저장 -->
<button onclick="setPage(2)">2페이지</button>
```

## 포커스 상태

| 규칙 | 설명 |
|------|------|
| `:focus-visible` 사용 | `:focus` 대신 사용 (클릭 시 링 방지, 키보드 시만 표시) |
| `outline: none` 금지 | 반드시 대체 포커스 스타일 제공 |
| `:focus-within` | 복합 컨트롤(드롭다운, 검색바)에 그룹 포커스 |

```scss
// DO
.btn:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

// DON'T
.btn:focus {
  outline: none; // 절대 금지
}
```

## 다크모드 & 테마

| 규칙 | 설명 |
|------|------|
| `color-scheme: dark` | `<html>`에 설정 — 스크롤바, input 기본 스타일 자동 대응 |
| `<meta name="theme-color">` | 페이지 배경색과 일치 (브라우저 주소창 색상) |
| `<select>` 다크모드 | Windows에서 `background-color`와 `color` 명시적 지정 필요 |

```html
<html lang="ko" data-theme="dark" style="color-scheme: dark">
<head>
  <meta name="theme-color" content="#1a1a1a">
</head>
```

## Safe Area & 레이아웃

| 규칙 | 설명 |
|------|------|
| 노치 대응 | `padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)` |
| 가로 스크롤 방지 | 컨테이너에 `overflow-x: hidden` 또는 콘텐츠 너비 확인 |
| 레이아웃 | JS 측정 대신 flex/grid 사용 |

## 타이포그래피 디테일

| 규칙 | 예시 |
|------|------|
| 말줄임표 | `…` 사용 (`...` 아님) |
| 따옴표 | `"` `"` 사용 (직선 `"` 아님) |
| 비분리 공백 | `10&nbsp;MB`, `⌘&nbsp;K` — 숫자+단위, 단축키 |
| 로딩 텍스트 | `로딩 중…`, `저장 중…` — `…`으로 끝냄 |
| 숫자 정렬 | `font-variant-numeric: tabular-nums` — 숫자 열/비교에 필수 |

## 성능

| 규칙 | 설명 |
|------|------|
| 대량 리스트 (50개+) | 가상화 사용 (`content-visibility: auto` 또는 라이브러리) |
| 렌더 중 레이아웃 읽기 금지 | `getBoundingClientRect`, `offsetHeight` 등 렌더 루프에서 사용 금지 |
| DOM 읽기/쓰기 분리 | 읽기 일괄 → 쓰기 일괄 (인터리빙 금지) |

## 국제화

| 규칙 | 설명 |
|------|------|
| 날짜/시간 | `Intl.DateTimeFormat` 사용 (하드코딩 포맷 금지) |
| 숫자/통화 | `Intl.NumberFormat` 사용 |
| 언어 감지 | `Accept-Language` / `navigator.languages` (IP 기반 금지) |

## 체크리스트

- [ ] 인터랙티브 요소에 `:focus-visible` 스타일이 있는가
- [ ] `outline: none` 없이 포커스가 보이는가
- [ ] 모달/드로어에 `overscroll-behavior: contain` 적용했는가
- [ ] `touch-action: manipulation` 설정했는가
- [ ] URL이 UI 상태를 반영하는가 (필터, 탭, 페이지)
- [ ] 파괴적 작업에 확인/undo가 있는가
- [ ] `<img>`에 `width`/`height` 명시했는가
- [ ] 숫자 열에 `tabular-nums` 적용했는가
- [ ] `transition: all` 대신 속성을 명시했는가
- [ ] 비분리 공백이 필요한 곳에 `&nbsp;` 사용했는가
