---
title: 크로스 브라우저 테스트
order: 2
---

모든 프로젝트는 아래 타겟 브라우저와 뷰포트에서 정상 동작해야 한다. 브라우저별 렌더링 차이를 사전에 파악하고 대응하여 사용자 경험 편차를 최소화한다.

## 타겟 브라우저 목록

| 브라우저 | 엔진 | 버전 | 비고 |
|----------|------|------|------|
| Chrome | Blink | 최신 2개 버전 | 데스크탑 + 모바일 (Android) |
| Safari | WebKit | 최신 2개 버전 | macOS + iOS (iPhone/iPad) |
| Firefox | Gecko | 최신 2개 버전 | 데스크탑 위주 |
| Edge | Blink | 최신 2개 버전 | Chromium 기반 |
| Samsung Internet | Blink | 최신 버전 | Android 삼성 기기 기본 브라우저 |

**IE (Internet Explorer): 미지원.** Microsoft가 2022년 6월 지원을 종료했다. 공공기관 사이트도 Edge 전환이 완료된 상태이므로 IE 대응은 하지 않는다.

## 테스트 뷰포트

| 뷰포트 | 너비 | 대상 기기 | 확인 포인트 |
|--------|------|----------|------------|
| 모바일 | 360px | 스마트폰 (Galaxy S, iPhone SE) | 모바일 레이아웃, 터치 인터랙션, 가로 스크롤 없음 |
| 태블릿 | 768px | iPad, Galaxy Tab | 태블릿 레이아웃 전환, 터치+마우스 혼합 |
| PC | 1280px | 노트북, 모니터 | PC 레이아웃, 마우스 hover, 키보드 네비게이션 |
| 와이드 | 1920px | 대형 모니터 | 콘텐츠 최대 너비 제한, 여백 처리 |

## 브라우저별 주요 차이점

아래 이슈는 프로젝트마다 반복적으로 발생하는 항목이다. 사전에 인지하고 대응 코드를 적용한다.

| 브라우저 | 이슈 | 증상 | 대응 방법 |
|----------|------|------|----------|
| Safari | flexbox gap 미지원 (구버전) | flex 아이템 간 간격 없음 | `gap` 대신 `margin`으로 대체하거나 `@supports (gap: 1px)` 분기 |
| Safari | 100vh 문제 | 모바일 Safari에서 주소창 포함한 높이 계산 | `100dvh` 사용 또는 `-webkit-fill-available` |
| Safari | `position: sticky` + overflow | 부모에 `overflow: hidden` 시 sticky 무시 | 부모 overflow 제거 또는 구조 변경 |
| Firefox | `:focus-visible` 스타일 차이 | 포커스 링 모양이 다름 | 커스텀 포커스 스타일 적용으로 통일 |
| Firefox | `scrollbar-width` 지원 | 스크롤바 너비가 다름 | `scrollbar-width: thin` 명시 |
| Samsung Internet | CSS `backdrop-filter` 미지원 | 블러 배경 효과 없음 | `@supports` 분기로 대체 배경색 제공 |
| Samsung Internet | 일부 CSS 논리 속성 미지원 | `inline-size` 등 무시 | 물리 속성(`width`)과 병행 사용 |

## 테스트 체크리스트

### 레이아웃

- [ ] 4개 뷰포트(360/768/1280/1920)에서 레이아웃 깨짐 없음
- [ ] 반응형 전환 지점(breakpoint)에서 콘텐츠 겹침 없음
- [ ] 가로 스크롤 발생하지 않음 (모바일)
- [ ] `max-width` 제한이 와이드 뷰포트에서 정상 동작

### 타이포그래피

- [ ] 폰트 로딩 완료 전/후 텍스트 정상 표시 (FOUT 최소화)
- [ ] `rem` 기반 폰트 크기가 브라우저 설정 변경 시 반응
- [ ] 긴 텍스트 말줄임(`ellipsis`) 정상 동작

### 색상/시각

- [ ] CSS Custom Properties(토큰) 값이 모든 브라우저에서 동일 렌더링
- [ ] `box-shadow`, `border-radius` 일관된 표현
- [ ] 그라데이션 정상 렌더링

### 인터랙션

- [ ] hover/focus/active 상태 전환 정상
- [ ] transition/animation 부드럽게 동작
- [ ] 모달, 탭, 드롭다운 등 JS 연동 컴포넌트 정상

### 폼

- [ ] input, select, textarea 기본 스타일 통일
- [ ] placeholder 색상 일관성
- [ ] date/number 등 특수 input 타입 브라우저별 확인
- [ ] 유효성 검사 스타일(`:invalid`, `:valid`) 동작

## 테스트 도구

### 브라우저 개발자 도구 디바이스 모드

가장 기본적인 테스트 도구다. Chrome DevTools > Device Toolbar (Cmd+Shift+M)로 뷰포트 크기를 변경하며 확인한다.

```
1. Chrome DevTools 열기 (Cmd+Option+I / F12)
2. Device Toolbar 토글 (Cmd+Shift+M)
3. 상단에서 뷰포트 크기 직접 입력 또는 기기 프리셋 선택
4. 360 / 768 / 1280 / 1920 순서로 확인
```

### 실제 기기 테스트

디바이스 모드는 터치 이벤트, 실제 렌더링 엔진을 완전히 재현하지 못한다. 최소한 아래 조합은 실기기에서 확인한다.

| 기기 | 브라우저 | 확인 사항 |
|------|----------|----------|
| iPhone (iOS) | Safari | 100vh 이슈, 스크롤 바운스, 고정 요소 |
| Android 폰 | Chrome | 터치 타겟, 소프트 키보드 대응 |
| iPad | Safari | 태블릿 레이아웃, 멀티태스킹 분할 뷰 |

### 외부 도구 (선택)

- **BrowserStack** -- 클라우드 기반 실제 브라우저/기기 테스트. 팀 계정이 있다면 활용
- **LambdaTest** -- BrowserStack 대안. 스크린샷 비교 기능 제공
- **Can I Use** (caniuse.com) -- CSS 속성별 브라우저 지원 현황 확인
