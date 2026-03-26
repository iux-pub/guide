---
title: 모바일/터치 테스트
order: 3
---

모바일 기기는 마우스가 아닌 터치로 상호작용한다. hover 상태, 터치 타겟 크기, 제스처 충돌 등 데스크탑과 다른 점을 인지하고 대응해야 한다.

## hover 상태 대응

### 규칙: hover는 보조 효과만

hover는 마우스 사용자에게 추가 피드백을 제공하는 **보조 효과**로만 사용한다. hover에 의존해야만 접근 가능한 기능이나 콘텐츠가 있어서는 안 된다.

```scss
// DO: hover는 보조 시각 효과만
.card {
  transition: var(--transition-base);

  @media (hover: hover) {
    &:hover {
      box-shadow: var(--shadow-lg);
      transform: translateY(-2px);
    }
  }
}

// DO: hover 없이도 클릭/탭으로 동작하는 구조
.dropdown {
  // 버튼 클릭으로 열림 (JS)
  &__menu {
    display: none;

    &.is-open {
      display: block;
    }
  }
}
```

```scss
// DON'T: hover에서만 콘텐츠 노출
.tooltip {
  display: none;

  .trigger:hover & {
    display: block; // 모바일에서 접근 불가
  }
}

// DON'T: hover 없이 동작하지 않는 네비게이션
.nav__submenu {
  display: none;

  .nav__item:hover & {
    display: flex; // 터치 기기에서 서브메뉴 접근 불가
  }
}
```

### `@media (hover: hover)` 사용법

hover를 지원하는 기기에서만 hover 스타일을 적용한다. 터치 전용 기기에서는 무시된다.

```scss
@use '../2-tools/responsive' as resp;

.btn {
  // 기본 스타일 (모든 기기)
  background-color: var(--color-primary);

  // hover 지원 기기에서만 적용
  @media (hover: hover) {
    &:hover {
      background-color: var(--color-primary-dark);
    }
  }

  // 터치/클릭 피드백은 :active로
  &:active {
    background-color: var(--color-primary-dark);
  }
}
```

## 터치 타겟 규격

### 최소 44x44px (WCAG 2.5.5)

모든 인터랙티브 요소(버튼, 링크, 체크박스, 라디오 등)의 터치 영역은 **최소 44x44px**이어야 한다. 인접한 터치 타겟 간 **최소 8px** 간격을 확보한다.

```scss
// DO: 최소 터치 타겟 보장
.btn {
  min-height: 44px;
  min-width: 44px;
  padding: var(--spacing-sm) var(--spacing-md);
}

// DO: 작은 아이콘 버튼도 터치 영역 확보
.btn--icon {
  width: 44px;
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 20px;
    height: 20px;
  }
}

// DO: 인접 링크 간격 확보
.list__item + .list__item {
  margin-top: var(--spacing-sm); // 8px 이상
}
```

```scss
// DON'T: 터치 타겟 부족
.btn--tiny {
  height: 24px;   // 44px 미만
  padding: 2px 8px;
}

// DON'T: 인접 링크 간격 없음
.tag-list {
  .tag + .tag {
    margin-left: 2px; // 터치 시 잘못된 요소 탭 가능
  }
}
```

### 터치 타겟 크기 확인 방법

Chrome DevTools에서 요소를 선택하고 Computed 탭에서 실제 렌더링 크기(width/height)를 확인한다. padding을 포함한 box 크기가 44px 이상인지 검증한다.

## 제스처 주의사항

### 스와이프 뒤로가기 충돌 방지

iOS Safari와 일부 Android 브라우저는 화면 좌측 엣지에서 우측으로 스와이프하면 뒤로가기가 실행된다. **좌측 엣지 영역(약 20px)에 커스텀 스와이프 제스처를 배치하지 않는다.**

```scss
// DON'T: 좌측 엣지에 스와이프 영역
.sidebar--swipeable {
  position: fixed;
  left: 0;
  width: 20px; // 브라우저 뒤로가기와 충돌
}
```

### pinch-to-zoom 차단 금지

`user-scalable=no` 또는 `maximum-scale=1`로 확대/축소를 차단하면 **WCAG 1.4.4 위반**이다. 저시력 사용자의 접근성을 침해한다.

```html
<!-- DON'T: 확대 차단 (접근성 위반) -->
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">

<!-- DO: 확대 허용 -->
<meta name="viewport" content="width=device-width, initial-scale=1">
```

### 커스텀 제스처 시 대체 UI 필수

스와이프로 삭제, 당겨서 새로고침 등 커스텀 제스처를 구현할 경우 반드시 **버튼 등 대체 UI**를 함께 제공한다. 제스처만으로 접근 가능한 기능이 있어서는 안 된다.

## 모바일 테스트 체크리스트

### 터치 타겟

- [ ] 모든 버튼/링크의 터치 영역이 최소 44x44px 이상
- [ ] 인접한 터치 타겟 간 최소 8px 간격 확보
- [ ] 체크박스/라디오 버튼의 라벨도 터치 영역에 포함

### hover 대체

- [ ] hover에서만 노출되는 콘텐츠가 없음
- [ ] 드롭다운/툴팁이 클릭/탭으로 동작
- [ ] `@media (hover: hover)` 분기 적용

### 가로 스크롤

- [ ] 360px 뷰포트에서 가로 스크롤 없음
- [ ] 테이블은 `overflow-x: auto` 래퍼 적용
- [ ] 이미지/동영상이 `max-width: 100%` 적용

### 소프트 키보드

- [ ] input 포커스 시 레이아웃 깨짐 없음
- [ ] 고정 요소(`position: fixed`)가 키보드에 가려지지 않음
- [ ] submit 버튼이 키보드 위에 접근 가능

### 화면 회전

- [ ] 세로→가로 전환 시 레이아웃 정상
- [ ] 가로→세로 전환 시 콘텐츠 잘림 없음
- [ ] 가로 모드에서 고정 헤더 높이가 과도하지 않음

## 실기기 테스트 권장

에뮬레이터와 Chrome DevTools 디바이스 모드는 실제 기기의 터치 이벤트, 렌더링 엔진, 성능을 완전히 재현하지 못한다.

### 최소 테스트 조합

| 기기 | 브라우저 | 주요 확인 사항 |
|------|----------|---------------|
| iPhone (iOS) | Safari | 100vh 이슈, 스크롤 바운스, 고정 요소, notch 대응 |
| Android 폰 | Chrome | 터치 타겟, 소프트 키보드, Samsung Internet 호환 |

### 에뮬레이터의 한계

- **터치 압력/제스처**: 에뮬레이터는 멀티터치, 3D Touch 등을 재현하지 못함
- **성능**: 저사양 기기의 렌더링 지연을 확인할 수 없음
- **Safari 렌더링**: macOS Safari와 iOS Safari는 동작이 다를 수 있음
- **소프트 키보드**: 키보드 높이와 viewport 변화를 정확히 재현하지 못함
