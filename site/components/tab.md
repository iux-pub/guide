---
title: 탭
order: 12
playground_src: /playground/tab.html
preview_height: 500
---

KRDS 정의 컴포넌트. 권위 있는 소스는 `src/snippets/tab.md`이며, BEM·접근성·토큰 매핑 카탈로그는 [references/krds-components.md](https://github.com/iux-pub/guide/blob/main/references/krds-components.md#tab)에 있다.

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

## KRDS 사용 조건·동작

- 탭은 6개 이하, 비활성(disabled) 탭은 쓰지 않는다. 비교·순서가 중요한 콘텐츠와 페이지 이동 링크 묶음에는 쓰지 않는다
- 좁은 화면에서 넘치면 `.tab__list`가 가로로 스크롤된다. 좌우 이동 버튼·숨은 탭 팝업 같은 넘침 컨트롤은 카탈로그에 없으며, 필요하면 UX팀이 프로젝트 확장으로 결정한다
- `Tab`/`Shift+Tab`으로 **모든 탭**에 닿는다(`tabindex="-1"`로 빼지 않는다). `Enter`·`Space`·클릭으로 선택한다. `←→`·`Home`/`End`는 초점만 옮긴다

## 접근성 핵심

- `role="tablist"` + 각 탭에 `role="tab"`, 패널에 `role="tabpanel"`
- 탭 ↔ 패널 연결: `aria-controls` (탭 → 패널 id), `aria-labelledby` (패널 → 탭 id)
- 선택 표시는 `aria-selected="true"` — CSS가 색과 탭 바닥 밑줄로 함께 보인다. 초점 링은 탭 안쪽에 그려 가로 스크롤에 잘리지 않는다
- `aria-label` 또는 `aria-labelledby`로 탭 그룹의 목적 명시 권장

## 파일

- 마크업: `src/snippets/tab.md`
- CSS: `src/styles/6-components/tab.css`
- JS: `src/js/tab.js`
- 기준: KRDS 탭 https://www.krds.go.kr/html/site/component/component_04_10.html
- 카탈로그: [krds-components.md#tab](https://github.com/iux-pub/guide/blob/main/references/krds-components.md#tab)
