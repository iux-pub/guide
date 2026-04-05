---
title: 인터랙션 타이밍
order: 3
---

피그마 Prototype 패널 설정과 개발 핸드오프를 위한 인터랙션 명세. 모든 전환 효과는 토큰 기반으로 정의하며, 접근성(prefers-reduced-motion)을 필수로 대응한다.

## 전환 시간 토큰

| 토큰 | 값 | 용도 |
|------|-----|------|
| `duration/fast` | 100ms | 호버, 색상 변경 등 즉각 피드백 |
| `duration/normal` | 200ms | 드롭다운, 탭 전환, 토스트 |
| `duration/slow` | 300ms | 모달, 사이드바, 페이지 전환 |

## 이징 함수

| 토큰 | 값 | 용도 |
|------|-----|------|
| `easing/default` | Ease Out | 기본 전환 (등장) |
| `easing/spring` | Spring (Damping 20 / Stiffness 150) | 모달, 토스트 등장 |
| Ease In | -- | 닫기, 퇴장 전환 |

**원칙**: 등장은 Ease Out, 퇴장은 Ease In을 사용한다. 모달과 토스트는 Spring으로 생동감을 부여한다.

## 컴포넌트별 전환 매핑

| 컴포넌트 | 전환 유형 | Duration | Easing | 비고 |
|----------|-----------|----------|--------|------|
| 버튼 Hover | Fill Color 변경 | 200ms | Ease Out | Smart Animate |
| 모달 열림 | Scale + Opacity | 300ms | Spring | Scale 0.95 → 1, Opacity 0 → 100% |
| 모달 닫힘 | Opacity | 200ms | Ease In | Opacity → 0 |
| 드롭다운 열림 | translateY + Opacity | 200ms | Ease Out | -8px → 0 |
| Toast 등장 | translateX | 200ms | Spring | 우측 외부 → 0 |
| Toast 퇴장 | Opacity | 200ms | Ease In | Opacity → 0, 자동 닫힘 3초 |
| 사이드바 접기 | Width 변경 | 300ms | Ease Out | 210px → 70px |
| 탭 전환 | Indicator 이동 | 200ms | Ease Out | Smart Animate |
| 페이지 전환 | Dissolve | 300ms | Ease Out | |
| 드로어 열림 | Slide In | 300ms | Ease Out | 방향: 좌측 또는 우측 |
| 아코디언 | Height 변경 | 200ms | Ease Out | Smart Animate |

## Hover 상태

피그마에서 Hover는 **Component Variant**로 구현한다.

| 컴포넌트 | Default → Hover 변화 |
|----------|----------------------|
| Button Primary | Fill: `brand/500` → `brand/700` |
| Button Secondary | Fill: Transparent → `brand/50` |
| Button Ghost | Fill: Transparent → `neutral/900` 8% Opacity |
| Card (Interactive) | Shadow: `shadow/md` → `shadow/lg` + translateY -2px |
| Icon Button | Fill: Transparent → `neutral/900` 8% (Circle) |
| Link 텍스트 | Color: `brand/500` → `brand/700` + Underline |
| Table Row | Fill: None → `neutral/50` |

## Focus Ring 규격

모든 인터랙티브 컴포넌트에 **Focus Variant**를 필수로 설계한다.

- **기본**: Stroke 3px, `brand/500` 35% Opacity → `shadow/focus` 토큰 참조
- **어두운 배경** (사이드바 등): Stroke 3px, White 50% Opacity

## Active / Pressed 상태

| 컴포넌트 | 변화 |
|----------|------|
| Button | Scale: 97% (0.97) |
| Card Interactive | Shadow: `shadow/sm`, translateY: 0 |

## Disabled 상태

- **Opacity**: 40% (`opacity/disabled`)
- 모든 Hover/Focus 인터랙션 비활성
- **Cursor**: `not-allowed` (개발자 전달 명세)
- **`pointer-events: none`** 적용

## prefers-reduced-motion 대응

시스템에서 애니메이션 줄이기를 설정한 사용자의 경우, 모든 전환 효과를 즉시(0ms) 또는 최소화로 처리해야 한다. 자동 재생 애니메이션은 사용자 제어 옵션을 반드시 제공한다.

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;  /* stylelint-disable-line -- 접근성 필수 오버라이드 */
    animation-iteration-count: 1 !important;  /* stylelint-disable-line -- 접근성 필수 오버라이드 */
    transition-duration: 0.01ms !important;  /* stylelint-disable-line -- 접근성 필수 오버라이드 */
    scroll-behavior: auto !important;  /* stylelint-disable-line -- 접근성 필수 오버라이드 */
  }
}
```

**핸드오프 시 반드시 명시**: 디자인 핸드오프 문서에 `prefers-reduced-motion` 대응이 필수임을 기재한다.

## 애니메이션 성능 규칙

- `transform`과 `opacity`만 애니메이션하라 (GPU 합성 레이어)
- `top`, `left`, `width`, `height` 직접 애니메이션 금지 (레이아웃 리플로우 발생)
- 스크롤 감지는 `IntersectionObserver` 사용. `window.addEventListener('scroll')` 직접 바인딩 금지
- 전체 높이에 `height: 100vh` 금지 → `min-height: 100dvh` 사용 (iOS Safari 주소창 대응, `100vh` 폴백 병기)

## Do / Don't

| Do | Don't |
|----|-------|
| 모든 인터랙티브 컴포넌트에 Hover/Focus Variant 설계 | Focus 상태 없이 납품 |
| Smart Animate로 자연스러운 상태 전환 | 모든 전환을 Dissolve 처리 |
| Spring easing으로 모달/토스트에 생동감 부여 | 500ms 이상 긴 Duration 사용 |
| 터치 타겟 44px 이상 확보 (Mobile) | 작은 아이콘 버튼을 터치 영역 없이 배치 |
| Prototype Flow로 주요 사용자 흐름 연결 | Prototype 없이 정적 화면만 납품 |
| `transform`/`opacity`로 애니메이션 | `top`/`left`/`width`/`height` 애니메이션 |
| `IntersectionObserver`로 스크롤 감지 | `scroll` 이벤트 직접 바인딩 |
| `min-height: 100dvh` (폴백 병기) | `height: 100vh` 단독 사용 |

## 관련 문서

- [디자인 토큰 - Transition](/tokens/) -- `--transition-fast`, `--transition-base`, `--transition-slow`
- [디자인 감사 - 모션](/design/design-audit/) -- 감사 체크리스트 8번 (모션 & 애니메이션)
- [접근성](/accessibility/) -- KWCAG/WCAG AA 요구사항
