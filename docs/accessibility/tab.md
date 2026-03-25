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
| `Shift+Tab` | tablist에서 이전 포커스 가능 요소로 이동 |

## 자동 활성화 vs 수동 활성화

**이 프로젝트는 자동 활성화 패턴을 사용한다.**

| 패턴 | 동작 | 적합한 상황 |
|------|------|-----------|
| 자동 활성화 (채택) | 화살표 키로 이동하면 즉시 해당 탭 활성화 | 탭 전환 비용이 낮은 경우 (로컬 콘텐츠) |
| 수동 활성화 | 화살표로 이동 후 Enter/Space로 활성화 | 탭 전환 시 서버 요청이 필요한 경우 |

**왜 자동 활성화를 선택했는가:** 이 프로젝트의 탭은 이미 로드된 콘텐츠를 전환하므로 지연이 없다. 수동 활성화는 불필요한 단계를 추가하여 키보드 사용자의 효율을 떨어뜨린다.

## tabindex 관리 원리 (Roving tabindex)

**왜 이렇게 하는가:** tablist 내부에 탭이 5개라면, Tab 키로 5번 눌러야 tablist를 벗어난다. Roving tabindex 패턴은 활성 탭에만 `tabindex="0"`을 주고, 나머지는 `tabindex="-1"`로 설정하여 Tab 키 1번으로 tablist를 통과할 수 있게 한다.

**동작:**
- 활성 탭: `tabindex="0"` + `aria-selected="true"`
- 비활성 탭: `tabindex="-1"` + `aria-selected="false"`
- 화살표 키로 탭 전환 시 tabindex 값도 함께 업데이트

## aria-controls / aria-labelledby 양방향 연결

**왜 양방향인가:** 탭 버튼에서 패널을 참조하고(`aria-controls`), 패널에서 탭 버튼을 참조한다(`aria-labelledby`). 이 양방향 연결로 스크린리더가 탭-패널 관계를 완전히 파악할 수 있다.

```html
<button role="tab" id="tab-1" aria-controls="panel-1">탭 1</button>
<div role="tabpanel" id="panel-1" aria-labelledby="tab-1">...</div>
```

## Do / Don't

### Do (올바른 예)

```html
<!-- 완전한 탭 구조 -->
<div class="tab">
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
  <div class="tab__panel" role="tabpanel" id="panel-review"
       aria-labelledby="tab-review" hidden>
    <p>리뷰 내용...</p>
  </div>
</div>
```

**왜:** role, aria-selected, aria-controls, aria-labelledby, tabindex가 모두 올바르게 연결되어 스크린리더가 탭의 구조와 상태를 완전히 전달할 수 있다.

### Don't (잘못된 예)

```html
<!-- ARIA 속성 없는 탭 -->
<div class="tab">
  <div class="tab__list">
    <a href="#tab1" class="tab__button active">탭 1</a>
    <a href="#tab2" class="tab__button">탭 2</a>
  </div>
  <div id="tab1" class="tab__panel">내용 1</div>
  <div id="tab2" class="tab__panel" style="display:none;">내용 2</div>
</div>
```

**왜 잘못인가:**
- `role` 속성 없이는 스크린리더가 탭 패턴을 인식하지 못한다. 일반 링크 목록으로 읽힌다
- `<a>` 태그는 탭 키보드 패턴(화살표 이동)에 적합하지 않다
- `display:none`은 작동하지만 `hidden` 속성이 더 시맨틱하다
- 화살표 키 네비게이션이 없으면 키보드 사용자가 모든 탭을 Tab 키로 순회해야 한다

## 스크린리더 테스트 노트

- **NVDA:** 탭리스트 진입 시 "상품 정보, 탭 목록" -> "상품 설명, 탭, 2개 중 1번째, 선택됨" -> 화살표 시 "리뷰, 탭, 2개 중 2번째, 선택됨"
- **VoiceOver (macOS):** "상품 정보, 탭 그룹" -> "선택됨, 상품 설명, 탭, 2개의 탭 중 1번" -> 패널: "상품 설명, 탭 패널"
- **패널 전환:** 화살표로 탭 전환 시 패널 내용이 바뀌어도 포커스는 탭 버튼에 유지됨 확인

## KWCAG 2.2 관련 검사항목

| 항목 번호 | 항목명 | 이 컴포넌트에서의 확인 방법 |
|-----------|--------|--------------------------|
| 6.1.1 | 키보드 사용 보장 | 화살표 키로 탭 전환, Tab 키로 패널 진입/이탈 동작 확인 |
| 6.1.3 | 조작 가능 | 모든 탭에 화살표/Home/End로 접근 가능한지 확인 |
| 6.4.2 | 제목 제공 | tablist에 `aria-label`로 그룹 목적이 설명되는지 확인 |
| 8.2.1 | 웹 애플리케이션 접근성 준수 | role="tablist"/"tab"/"tabpanel" + aria-selected + roving tabindex가 WAI-ARIA 패턴에 맞는지 확인 |
