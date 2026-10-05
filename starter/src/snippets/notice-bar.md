# 공지 띠 (Notice Bar) — infoUX

페이지 최상단에서 사이트 방문자 모두에게 한 번 알리는 공지. 점검·휴무·운영 변경처럼 **기간이 있는 안내**에 쓴다.

## 기본 마크업

페이지 shell에서 **건너뛰기 링크(`.skip-to-content`) 다음, `header#header` 앞**에 둔다.

```html
<section class="notice-bar notice-bar--info" aria-label="사이트 공지" data-notice-id="2026-10-maintenance">
  <div class="container notice-bar__inner">
    <span class="notice-bar__label">점검</span>
    <p class="notice-bar__message">
      <a class="notice-bar__link" href="/notice/maintenance">10월 12일 새벽 0시부터 6시까지 시스템 점검이 있습니다</a>
    </p>
    <button type="button" class="notice-bar__close" aria-label="공지 닫기">
      <svg class="icon" aria-hidden="true"><use href="/assets/icons/sprite.svg#close"></use></svg>
    </button>
  </div>
</section>
```

## 시맨틱 구조

- **Root 태그**: `<section class="notice-bar" aria-label="사이트 공지">` — 이름 있는 영역(region)이 되어 스크린리더 랜드마크 탐색에 잡힌다
- **자식**: `.container` → `__label`(분류 텍스트) · `__message`(문장 + 링크) · `__close`(닫기 버튼)
- **필수 ARIA**: `aria-label` (영역 이름) · 닫기 버튼 `aria-label="공지 닫기"`
- **라이브 영역을 쓰지 않는다**: `role="alert"` · `aria-live`는 붙이지 않는다. 페이지 로드 때 이미 있는 정적 안내이고, 낭독을 강제하면 매 페이지마다 방해가 된다

> 상세: `references/html-semantics.md#notice-bar`

## Variant

| Variant | 클래스 | 용도 | 라벨 예 |
|---------|--------|------|---------|
| 정보 | `.notice-bar--info` | 일반 안내 (기본) | 공지 |
| 주의 | `.notice-bar--warning` | 점검·휴무·일정 변경 | 점검 |
| 긴급 | `.notice-bar--danger` | 서비스 중단·장애·재난 | 긴급 |

톤은 색만으로 전하지 않는다 — 라벨 텍스트가 같은 뜻을 전한다 (WCAG 1.4.1).

## 동작 (JS)

`src/js/notice-bar.js`

- 닫기 버튼 → 띠에 `hidden` 부여. `data-notice-id`가 있으면 `localStorage`에 닫은 기록을 남긴다
- 다음 방문에는 같은 `data-notice-id`의 띠를 로드 때 숨긴다. **공지 내용이 바뀌면 `data-notice-id`도 바꾼다** — 그래야 새 공지가 다시 보인다
- 닫은 뒤 초점은 헤더의 첫 링크·버튼으로 옮긴다 (사라진 버튼에 초점이 남지 않게)
- 저장소를 못 쓰는 환경(시크릿 모드·차단)에서도 닫기 자체는 동작한다. 다음 방문에 다시 보일 뿐이다

## 사용 조건

- **한 번에 하나만** 둔다. 여러 공지가 있으면 가장 중요한 하나를 띄우고 나머지는 공지사항 목록으로 안내한다
- **자동으로 넘어가거나 굴러가는 형태(롤링·마키)로 만들지 않는다.** 5초 넘게 움직이는 콘텐츠는 멈출 수 있어야 하고(WCAG 2.2.2), 읽기 어려운 사용자를 만든다
- 장문의 본문을 띠에 넣지 않는다. 한 줄 요약 + 상세 페이지 링크로 둔다
- 만료일이 지난 공지는 내린다. 기간 없는 상시 안내(약관 변경 등)에 쓰지 않는다
- 쿠키·개인정보 동의 배너와 다르다 — 동의 요청은 이 컴포넌트로 만들지 않는다
- 사이트 유형: 공공서비스·공공기관·일반사이트·커머스에서 쓴다. CMS·관리자는 시스템 공지를 `alert`로 화면 안에 둔다

### 다른 알림 컴포넌트와의 구분

| | 공지 띠 | Alert | Toast |
|---|---------|-------|-------|
| 위치 | 페이지 최상단 | 해당 콘텐츠 영역 안 | 화면 모서리 |
| 성격 | 사이트 전체 안내 (정적) | 이 화면의 상태 메시지 | 방금 한 동작의 결과 |
| 사라짐 | 사용자가 닫음 | 상태가 바뀔 때 | 몇 초 뒤 자동 |
| 라이브 영역 | 쓰지 않음 | `role="alert"`/`status` | `role="status"`/`alert` |

## 접근성

- 영역 이름 `aria-label="사이트 공지"` — 페이지에 비슷한 영역이 더 있으면 서로 다른 이름으로 구분한다
- 링크는 밑줄로 구분한다. 색 차이만으로 링크임을 전하지 않는다
- 닫기 버튼은 아이콘만 있으므로 `aria-label` 필수. 아이콘은 `aria-hidden="true"`
- 터치 영역: 닫기 버튼 44×44px, 링크 `min-h-[4.4rem]` (R-13)
- 대비: 본문 텍스트 `--color-text`, 라벨은 `--color-text-inverse` on `--color-information-60`/`--color-warning-60`/`--color-danger-60` (4.5:1 이상)
- 닫은 뒤 초점이 문서 처음으로 날아가지 않도록 헤더로 옮긴다 (WCAG 2.4.3)
- 동적으로 삽입하는 긴급 안내(장애 발생 직후 등)는 이 컴포넌트가 아니라 [alert](alert.md)의 `role="alert"`를 쓴다

## 출처

- 색상은 `--color-info-surface` · `--color-information-20` · `--color-information-60` (톤별 warning/danger 동일 구조)
- 간격·타이포는 프로젝트 밀도에 맞는 CSS/Tailwind 직접값 사용
- CSS: `src/styles/6-components/notice-bar.css`
- JS: `src/js/notice-bar.js`
- 아이콘: `close` 스프라이트 — `/assets/icons/sprite.svg` (아이콘 카탈로그, R-27)
