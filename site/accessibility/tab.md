---
title: 탭
order: 10
---

# 탭 접근성 가이드

> 스니펫 코드는 `src/snippets/tab.md` 참조. 이 문서는 접근성 심화 가이드(왜/언제/주의사항).

## 필수 ARIA 속성

| 속성 | 대상 요소 | 값 | 설명 |
|------|----------|-----|------|
| `role="tablist"` | 탭 목록 컨테이너 | - | 탭 그룹의 시작을 스크린리더에 알림 |
| `role="tab"` | 각 탭 버튼 | - | 탭 목록 내 개별 탭임을 명시 |
| `role="tabpanel"` | 탭 패널 (콘텐츠 영역) | - | 탭에 연결된 콘텐츠 영역임을 명시 |
| `aria-selected` | 각 탭 버튼 | `true` / `false` | 현재 선택된 탭을 표시. 선택 스타일도 이 속성으로 적용한다 (상태 클래스 없음) |
| `aria-controls` | 각 탭 버튼 | 연결된 패널 id | 탭이 제어하는 패널을 연결 |
| `aria-labelledby` | 각 탭 패널 | 연결된 탭 버튼 id | 패널을 설명하는 탭 버튼을 연결 |
| `aria-label` | tablist 컨테이너 | 탭 그룹 설명 | 탭 그룹의 목적을 설명 (예: "상품 정보") |
| `hidden` | 선택되지 않은 탭 패널 | 속성 유무 | 보이지 않는 패널을 화면과 스크린리더에서 제거 |

## 키보드 상호작용

동작은 `src/js/tab.js`가 담당한다.

| 키 | 동작 |
|----|------|
| `Tab` / `Shift+Tab` | **모든 탭**을 차례로 지난 뒤 탭 패널로 이동 (KRDS) |
| `Enter` / `Space` / 클릭 | 초점이 있는 탭을 고르고 연결된 패널을 보여 줌 (수동 활성화, KRDS) |
| `ArrowRight` | 다음 탭으로 초점만 이동 (마지막에서 첫 번째로 순환). 고르지 않는다 — infoUX 보완 |
| `ArrowLeft` | 이전 탭으로 초점만 이동 (첫 번째에서 마지막으로 순환). 고르지 않는다 — infoUX 보완 |
| `Home` | 첫 번째 탭으로 초점만 이동 — infoUX 보완 |
| `End` | 마지막 탭으로 초점만 이동 — infoUX 보완 |

## 모든 탭을 Tab 순서에 둔다 (KRDS)

KRDS는 「모든 탭에 접근할 수 있어야 함」을 요구한다. 그래서 WAI-ARIA APG의 roving tabindex(선택된 탭만 `tabindex="0"`, 나머지 `tabindex="-1"`)를 쓰지 않는다. 탭 버튼에 `tabindex`를 주지 않고 모두 기본 Tab 순서에 둔다. 방향키는 보조 수단으로 초점만 옮긴다.

```html
<div class="tab">
  <div class="tab__list" role="tablist" aria-label="상품 정보">
    <button type="button" class="tab__item" role="tab"
            id="tab-desc" aria-selected="true" aria-controls="panel-desc">상품 설명</button>
    <button type="button" class="tab__item" role="tab"
            id="tab-review" aria-selected="false" aria-controls="panel-review">리뷰</button>
  </div>
  <div class="tab__panel" role="tabpanel" id="panel-desc" aria-labelledby="tab-desc">
    <p>제품 규격, 구성품, 사용 방법을 안내합니다.</p>
  </div>
  <div class="tab__panel" role="tabpanel" id="panel-review" aria-labelledby="tab-review" hidden>
    <p>구매자가 남긴 리뷰를 최신순으로 보여 줍니다.</p>
  </div>
</div>
```

## KWCAG 2.2 관련 검사항목

| 항목 번호 | 항목명 | 이 컴포넌트에서의 확인 방법 |
|-----------|--------|--------------------------|
| 6.1.1 | 키보드 사용 보장 | Tab 키로 모든 탭을 지나고, Enter·Space로 탭을 고르며, 패널로 진입/이탈하는지 확인 |
| 6.1.3 | 조작 가능 | 탭에 `tabindex="-1"`이 없어 모든 탭이 Tab 순서에 있는지 확인 |
| 6.4.2 | 제목 제공 | tablist에 `aria-label`로 그룹 목적이 설명되는지 확인 |
| 8.2.1 | 웹 애플리케이션 접근성 준수 | role="tablist"/"tab"/"tabpanel" + aria-selected + aria-controls/aria-labelledby 연결이 맞는지 확인 |
