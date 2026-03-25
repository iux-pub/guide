# 모달 접근성 가이드

> 스니펫 코드는 `src/snippets/modal.md` 참조. 이 문서는 접근성 심화 가이드(왜/언제/주의사항).

## 필수 ARIA 속성

| 속성 | 대상 요소 | 값 | 설명 |
|------|----------|-----|------|
| `role="dialog"` | 모달 컨테이너 | - | 스크린리더에게 대화상자임을 알림 |
| `aria-modal="true"` | 모달 컨테이너 | `true` | 모달 뒤의 콘텐츠가 비활성임을 전달 |
| `aria-labelledby` | 모달 컨테이너 | 제목 요소의 id | 모달의 목적을 제목으로 전달 |
| `aria-describedby` | 모달 컨테이너 | 설명 요소의 id | (선택) 모달 내용 요약 연결 |
| `aria-hidden` | 모달 컨테이너 | `true` / `false` | 닫힌 상태에서 스크린리더 접근 차단 |
| `aria-label="닫기"` | 닫기 버튼 | 텍스트 | 아이콘만 있는 닫기 버튼에 필수 |

## 키보드 상호작용

| 키 | 동작 |
|----|------|
| `Escape` | 모달 닫기, 트리거 버튼으로 포커스 복귀 |
| `Tab` | 모달 내 다음 포커스 가능 요소 (내부에서만 순환) |
| `Shift+Tab` | 모달 내 이전 포커스 가능 요소 (내부에서만 순환) |

## 포커스 트랩 동작 원리

**왜 필수인가:** 포커스 트랩 없이 모달이 열리면 Tab 키로 모달 뒤의 콘텐츠에 도달할 수 있다. 시각 사용자에게는 반투명 배경 뒤의 콘텐츠가 보이지 않으므로, 스크린리더 사용자가 혼란에 빠진다.

**동작 순서:**

1. **모달 열림:** 트리거 버튼 클릭
2. **포커스 이동:** 모달 내 첫 번째 포커스 가능 요소로 자동 이동 (보통 닫기 버튼 또는 첫 입력 필드)
3. **포커스 순환:** Tab/Shift+Tab이 모달 내부에서만 순환
4. **모달 닫힘:** ESC 또는 닫기 버튼
5. **포커스 복귀:** 모달을 열었던 트리거 버튼으로 포커스 복원

**포커스 가능 요소 목록:** `a[href]`, `button:not([disabled])`, `input:not([disabled])`, `select:not([disabled])`, `textarea:not([disabled])`, `[tabindex]:not([tabindex="-1"])`

## 포커스 복원의 중요성

**왜 필수인가:** 모달이 닫힌 후 포커스가 `<body>` 최상단으로 돌아가면, 키보드 사용자가 현재 작업 위치를 잃는다. 트리거 버튼으로 복원해야 사용자가 중단한 곳에서 계속할 수 있다.

**예외 상황:** 모달에서 삭제를 확인한 경우처럼, 트리거 요소가 사라질 수 있다. 이때는 논리적으로 다음에 올 요소(예: 목록의 다음 항목)로 포커스를 이동한다.

## `aria-modal="true"`의 역할

**브라우저별 지원:** `aria-modal="true"`를 지원하는 스크린리더는 모달 외부 콘텐츠를 자동으로 무시한다. 그러나 완벽하지 않으므로 **JS 포커스 트랩을 항상 함께 구현**해야 한다.

**`aria-hidden`과의 관계:** 모달이 열릴 때 배경에 `aria-hidden="true"`를 추가하는 방식도 있지만, `aria-modal="true"`가 이를 대체한다. 다만, 모달 컨테이너 자체의 `aria-hidden`은 닫힌 상태에서 `"true"`여야 한다.

## Do / Don't

### Do (올바른 예)

```html
<!-- 완전한 모달 구조 -->
<div class="modal" role="dialog" aria-modal="true"
     aria-labelledby="modal-title" aria-hidden="true">
  <div class="modal__backdrop" data-modal-close></div>
  <div class="modal__container">
    <div class="modal__header">
      <h2 id="modal-title" class="modal__title">회원 정보 수정</h2>
      <button type="button" class="modal__close" data-modal-close
              aria-label="닫기">
        <svg>...</svg>
      </button>
    </div>
    <div class="modal__body">
      <!-- 모달 내용 -->
    </div>
    <div class="modal__footer">
      <button type="button" class="btn btn--secondary" data-modal-close>취소</button>
      <button type="button" class="btn btn--primary">저장</button>
    </div>
  </div>
</div>
```

**왜:** `role="dialog"` + `aria-modal="true"` + `aria-labelledby`로 스크린리더에게 완전한 맥락을 전달한다. 닫기 버튼에 `aria-label="닫기"`로 아이콘 버튼의 목적을 명시한다.

### Don't (잘못된 예)

```html
<!-- role/aria 속성 없음 -->
<div class="modal" style="display:none;">
  <div class="modal__container">
    <h2>알림</h2>
    <p>저장되었습니다.</p>
    <button onclick="closeModal()">확인</button>
  </div>
</div>

<!-- 포커스 관리 없는 모달 -->
<div class="modal">
  <!-- Tab 키로 모달 뒤 콘텐츠에 접근 가능 -->
</div>
```

**왜 잘못인가:**
- `role="dialog"` 없이는 스크린리더가 일반 콘텐츠로 인식한다
- `display:none`으로만 숨기면 `aria-hidden` 상태 관리가 빠진다
- 포커스 트랩 없이 Tab 키로 모달 뒤 콘텐츠에 접근하면 시각 장애 사용자가 혼란에 빠진다

## 스크린리더 테스트 노트

- **NVDA:** 모달 열림 시 "회원 정보 수정, 대화상자" -> 첫 포커스 요소 읽기 -> ESC 시 트리거로 복귀
- **VoiceOver (macOS):** "회원 정보 수정, 대화상자, 웹" -> 모달 내부로 포커스 제한됨 확인 -> 닫기 시 "닫기, 버튼"
- **배경 읽기 차단:** `aria-modal="true"` 지원 시 VO 로터로 모달 외부 heading 탐색 불가 확인

## KWCAG 2.2 관련 검사항목

| 항목 번호 | 항목명 | 이 컴포넌트에서의 확인 방법 |
|-----------|--------|--------------------------|
| 5.3.2 | 콘텐츠의 선형구조 | 모달 DOM 위치가 논리적 읽기 순서에 맞는지 확인 (body 끝에 배치 권장) |
| 6.1.1 | 키보드 사용 보장 | ESC 닫기, Tab 포커스 트랩, Enter로 버튼 활성화 모두 동작 확인 |
| 6.1.3 | 조작 가능 | 닫기 버튼/배경 클릭으로 닫기 가능 확인. 닫을 방법이 2개 이상 |
| 7.2.1 | 사용자 요구에 따른 실행 | 모달이 사용자 동작(클릭) 없이 자동으로 열리지 않는지 확인 |
| 8.2.1 | 웹 애플리케이션 접근성 준수 | role="dialog", aria-modal, 포커스 관리가 WAI-ARIA 패턴에 맞는지 확인 |
