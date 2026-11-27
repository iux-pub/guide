---
title: UI 상태 패턴
order: 5
---

로딩·오류·빈 상태·폼 검증을 어떻게 만들지 정한 기준. 모든 화면은 기본 상태 말고도 진행 중·성공·실패·빈 상태를 실물 마크업으로 갖춘다(`references/release-checklist.md` §3, 필수 100%).

> **정본 관계** — KRDS → `references/art-direction.md` §9 상태 완결성 항목 → 이 문서. 상태 셋의 명세는 이 문서가 맡는다. 값은 `src/styles/6-components/`와 `src/snippets/`에서 확인한 것이다.

## 컴포넌트별 상태 셋

납품 전에 아래 상태를 컴포넌트마다 실물로 확인한다. 상태는 ARIA·`hidden`·`disabled` 속성으로 먼저 표현하고 `.is-*`·`.has-*` 클래스는 쓰지 않는다(R-17).

| 컴포넌트 | 갖출 상태 | 마크업·클래스 |
|----------|-----------|----------------|
| `btn` | default · hover · focus-visible · active · disabled · loading | hover·active는 `--color-button-{variant}-fill-hover`·`-pressed`, 초점 링은 전역(`reset.css`), 비활성은 `disabled`. loading은 전용 클래스가 없다 — 아래 「로딩 상태」 |
| `form`(`input`·`textarea`·`select`) | default · hover · focus · disabled · read-only · error | error는 `input--error` 또는 `aria-invalid="true"` + `form-field__message--error`를 `aria-describedby`로 연결 |
| `check`·`radio`·`switch` | default · hover · focus-visible · checked · disabled | `input`의 `:checked`·`:disabled`가 모양을 바꾼다. 별도 클래스 없음 |
| `table`·`list` | empty · loading · error | 전용 클래스가 없다 — 빈 상태는 사실 문장, 로딩은 `spinner`, 오류는 `alert alert--danger` |
| `alert` | 4톤 | `alert--info` · `alert--success` · `alert--warning` · `alert--danger` |
| `badge` | 4톤 | `badge`(기본 = danger 색) · `badge--info` · `badge--success` · `badge--warning`. 그 밖에 `badge--primary`·`badge--neutral`·`badge--dot` |
| `pagination` | 양끝 disabled, 현재 페이지 | 첫·마지막 페이지의 `pagination__nav`에 `disabled` + `aria-disabled="true"`, 현재 페이지는 `aria-current="page"` |
| `tab` | default · hover · focus-visible · selected | 선택은 `aria-selected="true"`. 비활성 탭은 만들지 않는다(KRDS) |

버튼의 상태별 토큰:

| 상태 | `btn--primary` | 그 밖의 variant |
|------|----------------|-----------------|
| default | `--color-button-primary-fill` | `--color-button-{variant}-fill` |
| hover | `--color-button-primary-fill-hover` | `--color-button-{variant}-fill-hover` |
| active | `--color-button-primary-fill-pressed` | `--color-button-{variant}-fill-pressed` |
| focus-visible | `outline: 0.4rem solid var(--color-border-primary)`, `outline-offset: 2px` | 같음 |
| disabled | `--color-button-disabled-fill` · `--color-text-disabled` · `--color-button-disabled-border` | 같음 |

전환 시간은 [인터랙션 타이밍](/design/interaction-timing/)을 따른다.

## 로딩 상태

### 의사결정 트리

| 상황 | 쓰는 컴포넌트 | 이유 |
|------|---------------|------|
| 걸리는 시간을 알 수 없다(목록·표 불러오기, 저장) | `spinner` | 진행 중임을 알린다 |
| 진행률을 알 수 있다(파일 올리기·내려받기) | `progress` | 얼마나 남았는지 숫자로 보인다 |
| 버튼을 누른 뒤 처리 중 | `btn` + `spinner spinner--small` | 중복 제출을 막는다 |

뼈대 화면(Skeleton)은 카탈로그에 없다. `spinner`와 `progress`를 쓴다.

### spinner · progress

| 컴포넌트 | 크기 | 색 | 접근성 |
|----------|------|-----|--------|
| `spinner` | `spinner--small` 1.6rem · 기본 2.4rem · `spinner--large` 4rem | 트랙 `--color-bg-subtle`, 회전부 `--color-primary` | `role="status"` + `aria-label="로딩 중"` |
| `progress` | 막대 높이 0.8rem | 트랙 `--color-bg-subtle`, 채움 `--color-primary`. `progress--success`·`--warning`·`--danger` | `<progress value max>` + `aria-label`, 레이블 줄에 퍼센트를 글자로 쓴다 |

```html
<span class="spinner" role="status" aria-label="로딩 중"></span>

<div class="progress">
  <div class="progress__label">
    <span>업로드 중</span>
    <span>60%</span>
  </div>
  <progress class="progress__bar" value="60" max="100" aria-label="업로드 진행률">60%</progress>
</div>
```

### 버튼 로딩

전용 클래스가 없다. `disabled`로 잠그고 레이블 앞에 작은 스피너를 둔다. 레이블은 지우지 않는다.

```html
<button type="submit" class="btn btn--primary" disabled>
  <span class="spinner spinner--small" role="status" aria-label="처리 중"></span>
  신청하기
</button>
```

### 상태 전환 흐름

```
기본 → 진행 중 → 완료 또는 오류
```

- 진행 중: 제출 버튼을 `disabled`로 바꿔 중복 클릭을 막는다.
- 완료: `toast toast--success`(`role="status"`) 또는 `alert alert--success`로 알린다.
- 오류: 원인과 다음에 할 일을 알리고 다시 시도할 경로를 둔다. 입력값은 지우지 않는다.

## 에러 상태

### 3단계 심각도

| 심각도 | 표시 방식 | 컴포넌트 |
|--------|-----------|----------|
| 입력 오류 | 필드 아래 메시지, 첫 오류 필드로 초점 이동 | `input--error` + `form-field__message--error` |
| 요청 실패(네트워크·시간 초과) | 해당 영역 위 알림 + 「다시 시도」 버튼 | `alert alert--danger` |
| 페이지를 보여 줄 수 없음(404·403·500) | 전체 화면 오류 페이지 | `error-page` |

### alert 4톤

| 클래스 | 배경 | 테두리 | 아이콘 색 |
|--------|------|--------|-----------|
| `alert--info` | `--color-surface-information-subtler` | `--color-border-information-light` | `--color-info` |
| `alert--success` | `--color-surface-success-subtler` | `--color-border-success-light` | `--color-success` |
| `alert--warning` | `--color-surface-warning-subtler` | `--color-border-warning-light` | `--color-warning` |
| `alert--danger` | `--color-surface-danger-subtler` | `--color-border-danger-light` | `--color-danger` |

글자는 네 톤 모두 `--color-text`다. 색만으로 상태를 전하지 않는다 — 제목과 메시지에 상태를 글자로 쓴다.

```html
<div class="alert alert--danger" role="alert">
  <div class="alert__body">
    <p class="alert__title">목록을 불러오지 못했습니다</p>
    <p class="alert__message">네트워크 연결을 확인한 뒤 다시 시도해 주십시오.</p>
  </div>
</div>
```

- 즉시 알려야 하는 오류는 `role="alert"`, 정보성 알림은 `role="status"`다(`src/snippets/alert.md`).
- 오류 페이지 문구와 다음 행동은 `src/snippets/error-page.md`의 표를 쓴다. 오류 페이지의 제목은 `role="alert"`로 낭독시키지 않는다.

### 오류 유형별 처리

| 오류 유형 | 표시 방식 |
|-----------|-----------|
| 입력 검증 실패 | 필드 아래 `form-field__message--error` |
| 네트워크 오류·시간 초과 | `alert alert--danger` + 「다시 시도」 버튼 |
| 접근 권한 없음 | `error-page`(403) — 로그인·권한 신청 경로 |
| 서버 오류 | `error-page`(500) — 새로고침·문의 경로 |

## 빈 상태

빈 상태 전용 컴포넌트는 없다. 아래 구성으로 만든다. 문구 기준은 [마이크로카피](/design/microcopy/) 「빈 상태 구조」와 같다.

| 요소 | 필수 여부 | 기준 |
|------|-----------|------|
| 제목 | 필수 | 사실을 알리는 문장(「등록된 공지가 없습니다」) |
| 설명 | 선택 | 왜 비었는지, 언제 채워지는지 한 문장 |
| 버튼 | 다음 행동이 있을 때만 | 검색어 지우기, 필터 초기화, 다시 시도, 새로 등록. 할 수 있는 행동이 없으면 두지 않는다 |
| 아이콘 | 선택 | 카탈로그 아이콘 `icon--xlarge`(4rem), `aria-hidden="true"`. 원·사각 배경에 넣지 않는다 |

- 표가 비었으면 표 머리(`thead`)는 남기고 본문 자리에 문장을 둔다. 화면을 통째로 비우지 않는다.
- 검색 결과가 없으면 검색어 입력 필드를 그대로 두고 검색어를 문장에 넣는다(`references/korean-web-patterns.md` KR-S13).

### 유형별 빈 상태

| 유형 | 구성 |
|------|------|
| 데이터 없음 | 제목 + (권한이 있으면) 등록 버튼 |
| 검색 결과 없음 | 검색어를 넣은 제목 + 검색어 지우기 |
| 필터 결과 없음 | 제목 + 필터 초기화 |
| 불러오기 실패 | `alert alert--danger` + 다시 시도 — 빈 상태로 보이게 두지 않는다 |
| 권한 없음 | `error-page`(403) |

## 폼 유효성 타이밍

| 시점 | 대상 | 설명 |
|------|------|------|
| `blur`(필드를 떠날 때) | 형식 오류 | 이메일, 전화번호 같은 형식 |
| `change`(값이 바뀔 때) | 즉시 알려야 하는 조건 | 비밀번호 조건 충족 여부 |
| `submit`(제출) | 필수 입력 | 비어 있는 필드를 표시하고 첫 오류 필드로 초점을 옮긴다 |
| 글자를 칠 때마다 | 쓰지 않는다 | 입력 중에 오류를 띄우지 않는다 |

### 폼 입력 필드 상태

`form.css`·`select.css`의 값이다.

| 상태 | 테두리 | 그 밖 |
|------|--------|-------|
| default | `--color-input-border` | 배경 `--color-input-surface` |
| hover | `--color-border-dark` | — |
| focus | `--color-input-border-active` | 외곽선 대신 테두리 색이 바뀐다 |
| disabled | `--color-input-border-disabled` | 배경 `--color-input-surface-disabled`, 글자 `--color-text-disabled`, `cursor: not-allowed` |
| read-only | `--color-input-border` | 배경 `--color-bg-subtler` |
| error | `--color-input-border-error` | 메시지 `form-field__message--error`(`--color-danger-text`) |
| 성공 안내 | 테두리 변화 없음 | 메시지 `form-field__message--success`(`--color-success-text`) |

```html
<div class="form-field">
  <label for="email" class="form-field__label">이메일</label>
  <input type="email" id="email" class="input input--error" aria-invalid="true" aria-describedby="email-error" value="invalid">
  <p id="email-error" class="form-field__message form-field__message--error">올바른 이메일 형식이 아닙니다</p>
</div>
```

## 관련 문서

- [마이크로카피](/design/microcopy/) -- 오류 메시지, 빈 상태 문구 기준
- [인터랙션 타이밍](/design/interaction-timing/) -- 상태 전환 시간
- [디자인 감사 - 상태](/design/design-audit/) -- 감사 체크리스트 11번
- [폼 컴포넌트](/components/form/) -- 폼 스니펫
