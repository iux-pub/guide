# 탭 (Tab) — KRDS

KRDS 탭(component_04_10) — 같은 영역 안에서 상호배타적인 콘텐츠 섹션을 버튼으로 전환한다. 동작은 `src/js/tab.js`.

## 사용 조건

- 대부분의 사용자에게 첫 번째 섹션이 가장 중요하고, 한 번에 두 섹션을 볼 필요가 없을 때 쓴다.
- 서로 비교해야 하는 정보, 순서가 중요한 절차(→ step-indicator)에는 쓰지 않는다.
- 탭은 **6개 이하**로 둔다(KRDS). 더 필요하면 탭을 늘리지 말고 콘텐츠를 나누거나 묶는다.
- 좁은 화면에서 탭이 넘치면 `.tab__list`가 가로로 스크롤된다. 스크롤에 가려지는 탭이 생기지 않도록 탭 이름을 짧게 쓰고 개수를 먼저 줄인다.
- 좌우 이동 버튼·숨은 탭 팝업 같은 **넘침 컨트롤은 카탈로그에 없다.** 필요하면 프로젝트 확장으로 UX팀이 결정한다 — 이 스니펫에 없는 클래스(`tab__prev` 등)를 지어내지 않는다(R-29).
- **비활성(disabled) 탭을 쓰지 않는다.** 보일 콘텐츠가 없으면 탭을 빼거나, 패널에서 없는 이유를 설명한다.
- 다른 **페이지**로 가는 링크 묶음에는 탭을 쓰지 않는다 — `nav` 링크 목록 + `aria-current="page"`로 만든다.
- 탭을 중첩하지 않는다.

## 기본 마크업

```html
<div class="tab">
  <div class="tab__list" role="tablist" aria-label="이용 안내">
    <button type="button" class="tab__item" role="tab" aria-selected="true" aria-controls="panel-1" id="tab-1">
      관람 시간
    </button>
    <button type="button" class="tab__item" role="tab" aria-selected="false" aria-controls="panel-2" id="tab-2">
      관람료
    </button>
    <button type="button" class="tab__item" role="tab" aria-selected="false" aria-controls="panel-3" id="tab-3">
      오시는 길
    </button>
  </div>
  <div class="tab__panel" role="tabpanel" id="panel-1" aria-labelledby="tab-1">
    <p>화요일~일요일 09:00~18:00, 매주 월요일 휴관</p>
  </div>
  <div class="tab__panel" role="tabpanel" id="panel-2" aria-labelledby="tab-2" hidden>
    <p>성인 2,000원, 청소년·어린이 1,000원</p>
  </div>
  <div class="tab__panel" role="tabpanel" id="panel-3" aria-labelledby="tab-3" hidden>
    <p>제주시 ○○로 00 — 시내버스 000번 ○○ 정류장 하차</p>
  </div>
</div>
```

- 예시 문구·요금·주소는 형식 예시다. 실제 값은 `contentSources`에서 가져온다(R-23).

## 사이즈

- `.tab__list--small` (40px height) — 보조 컨텍스트
- 기본 (48px) — 표준
- `.tab__list--large` (56px height) — 강조

## 동작 (src/js/tab.js)

| 키·조작 | 동작 | 근거 |
|---------|------|------|
| `Tab` / `Shift+Tab` | **모든 탭**을 차례로 지난다. 탭에 `tabindex="-1"`을 주지 않는다 | KRDS |
| 클릭 · `Enter` · `Space` | 초점이 있는 탭을 고르고 패널을 바꾼다(수동 활성화) | KRDS |
| `←` `→` `Home` `End` | 보조 수단 — 초점만 옮긴다. 고르지 않는다 | infoUX 보완 |

## 접근성 (KRDS + WAI-ARIA)

- `role="tablist"` + 각 탭에 `role="tab"`, 패널에 `role="tabpanel"`
- 탭 ↔ 패널 연결: `aria-controls` (탭 → 패널 id), `aria-labelledby` (패널 → 탭 id)
- 선택은 `aria-selected="true"` — CSS는 색에 더해 탭 바닥의 밑줄 인디케이터(`::after`)로 보인다(색만으로 구분하지 않는다)
- 초점이 간 탭은 탭 안쪽 초점 링으로 분명히 보인다 — 밑줄·초점 링 모두 탭 상자 안에 그려 목록의 가로 스크롤에 잘리지 않는다
- `aria-label` 또는 `aria-labelledby`로 탭 그룹의 목적을 밝힌다

## 출처

- CSS: `src/styles/6-components/tab.css`
- JS: `src/js/tab.js`
- 기준: KRDS 탭 https://www.krds.go.kr/html/site/component/component_04_10.html
