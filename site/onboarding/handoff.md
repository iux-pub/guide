---
title: "디자인 전달 체크리스트"
order: 3
---

디자인 의도를 퍼블리싱으로 넘길 때 확인할 항목을 정리한다. 특정 디자인 도구를 전제로 하지 않고, 화면 구조·색상 토큰·컴포넌트 패턴·접근성 기준을 기준으로 전달한다.

## 기본 HTML 구조

큰 영역은 단순하게 잡고, 실제 폭과 정렬은 내부 `.container`가 담당한다. `main` 안의 콘텐츠는 section 단위로 분리한다.

```html
<header id="header">
  <div class="container">...</div>
</header>

<main id="main">
  <section class="section">
    <div class="container">...</div>
  </section>
</main>

<footer id="footer">
  <div class="container">...</div>
</footer>
```

HTML 컴포넌트화는 페이지 전체가 아니라 `main` 내부의 section 단위로 진행한다.

## 전달 항목 체크리스트

- [ ] **페이지 구조:** `header/main/footer`, `main > section > .container` 골격이 확인된다
- [ ] **섹션 단위:** 반복·교체 가능한 콘텐츠는 section 단위로 나뉜다
- [ ] **색상:** 사용 색상이 KRDS 정본 또는 INFOMIND 시맨틱 별칭에 매핑된다. raw hex/rgb/hsl이 필요하면 UX팀과 협의한다
- [ ] **간격/정렬:** 반복되는 패딩/갭은 토큰 또는 공통 스타일로 정리한다. 프로젝트 고유 보정값은 의도와 근거가 명확하다
- [ ] **타이포그래피:** 반복되는 제목/본문/캡션 계층은 공통 타입 스케일로 정리한다
- [ ] **컴포넌트:** 기존 컴포넌트 카탈로그를 먼저 확인한다. 카탈로그 밖 패턴은 일회성 프로젝트 패턴인지 공통 컴포넌트 후보인지 판단한다
- [ ] **버튼:** 역할이 primary/secondary/tertiary/text 중 어디에 해당하는지 명확하다
- [ ] **반응형:** 모바일, 태블릿, PC에서 섹션 순서와 컨테이너 폭 변화가 설명된다
- [ ] **인터랙션:** hover, focus, pressed, disabled, loading, error 상태가 필요한 요소에 정의되어 있다
- [ ] **접근성:** 대체 텍스트, 키보드 조작, 포커스 순서, 색상 대비 4.5:1, 터치 영역 44×44px 이상을 확인한다

## 참고 문서

- [컴포넌트 개요](/components/) — 사용 가능한 KRDS 기반 패턴
- [토큰 개요](/tokens/) — KRDS 정본 + INFOMIND 시맨틱 별칭
- [BEM 네이밍](/conventions/bem/) — BEM 네이밍 규칙 상세
- [접근성 개요](/accessibility/) — 접근성 체크리스트와 가이드
