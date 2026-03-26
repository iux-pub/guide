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
| `aria-selected` | 각 탭 버튼 | `true` / `false` | 현재 활성화된 탭을 표시 |
| `aria-controls` | 각 탭 버튼 | 연결된 패널 id | 탭이 제어하는 패널을 연결 |
| `aria-labelledby` | 각 탭 패널 | 연결된 탭 버튼 id | 패널을 설명하는 탭 버튼을 연결 |
| `aria-label` | tablist 컨테이너 | 탭 그룹 설명 | 탭 그룹의 목적을 설명 (예: "상품 정보") |
| `tabindex="-1"` | 비활성 탭 버튼 | `-1` | Tab 키 순서에서 제외, 화살표 키로만 접근 |

## 키보드 상호작용

| 키 | 동작 |
|----|------|
| `Tab` | tablist에 진입 (활성 탭에 포커스) -> 다시 Tab 시 탭 패널 내부로 이동 |
| `ArrowRight` | 다음 탭으로 이동 + 활성화 (마지막에서 첫 번째로 순환) |
| `ArrowLeft` | 이전 탭으로 이동 + 활성화 (첫 번째에서 마지막으로 순환) |
| `Home` | 첫 번째 탭으로 이동 + 활성화 |
| `End` | 마지막 탭으로 이동 + 활성화 |

## Roving tabindex 패턴

활성 탭에만 `tabindex="0"`, 나머지는 `tabindex="-1"`. Tab 키 1번으로 tablist를 통과할 수 있다.

```html
<div class="tab__list" role="tablist" aria-label="상품 정보">
  <button class="tab__button tab__button--active" role="tab"
          id="tab-desc" aria-selected="true" aria-controls="panel-desc"
          tabindex="0">상품 설명</button>
  <button class="tab__button" role="tab"
          id="tab-review" aria-selected="false" aria-controls="panel-review"
          tabindex="-1">리뷰</button>
</div>
<div class="tab__panel" role="tabpanel" id="panel-desc"
     aria-labelledby="tab-desc">
  <p>상품 설명 내용...</p>
</div>
```

## KWCAG 2.2 관련 검사항목

| 항목 번호 | 항목명 | 이 컴포넌트에서의 확인 방법 |
|-----------|--------|--------------------------|
| 6.1.1 | 키보드 사용 보장 | 화살표 키로 탭 전환, Tab 키로 패널 진입/이탈 동작 확인 |
| 6.1.3 | 조작 가능 | 모든 탭에 화살표/Home/End로 접근 가능한지 확인 |
| 6.4.2 | 제목 제공 | tablist에 `aria-label`로 그룹 목적이 설명되는지 확인 |
| 8.2.1 | 웹 애플리케이션 접근성 준수 | role="tablist"/"tab"/"tabpanel" + aria-selected + roving tabindex가 WAI-ARIA 패턴에 맞는지 확인 |
