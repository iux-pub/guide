---
title: 공지 띠
order: 32
playground_src: /playground/notice-bar.html
preview_height: 320
---

페이지 최상단에서 사이트 방문자 모두에게 한 번 알리는 공지. 권위 있는 소스는 `src/snippets/notice-bar.md`이며, 점검·휴무·운영 변경처럼 **기간이 있는 안내**에 쓴다.

## 기본 마크업

건너뛰기 링크 다음, `header#header` 앞에 둔다.

```html
<section class="notice-bar notice-bar--info" aria-label="사이트 공지" data-notice-id="2026-10-maintenance">
  <div class="container notice-bar__inner">
    <span class="notice-bar__label">점검</span>
    <p class="notice-bar__message">
      <a class="notice-bar__link" href="/notice/maintenance">10월 12일 새벽 0시부터 6시까지 시스템 점검이 있습니다</a>
    </p>
    <button type="button" class="notice-bar__close" aria-label="공지 닫기">
      <svg class="icon" aria-hidden="true"><use href="/assets/icons/sprite.svg#close"></use></svg>
    </button>
  </div>
</section>
```

## 변형

| Variant | 클래스 | 용도 | 라벨 예 |
|---------|--------|------|---------|
| 정보 | `.notice-bar--info` | 일반 안내 (기본) | 공지 |
| 주의 | `.notice-bar--warning` | 점검·휴무·일정 변경 | 점검 |
| 긴급 | `.notice-bar--danger` | 서비스 중단·장애·재난 | 긴급 |

## 접근성 핵심

- `section` + `aria-label` — 이름 있는 영역(region)이 되어 랜드마크 탐색에 잡힌다
- **라이브 영역(`role="alert"`·`aria-live`)을 쓰지 않는다.** 로드 때 이미 있는 정적 안내이고, 낭독을 강제하면 매 페이지마다 방해가 된다
- 한 번에 하나만 둔다. **자동으로 넘어가거나 굴러가는 형태(롤링·마키)로 만들지 않는다** (WCAG 2.2.2)
- 톤은 색만으로 전하지 않는다 — 라벨 텍스트가 같은 뜻을 전한다 (WCAG 1.4.1)
- 링크는 밑줄로 구분하고, 닫은 뒤 초점은 헤더로 옮긴다 (WCAG 2.4.3)
- `data-notice-id`는 공지 내용이 바뀌면 함께 바꾼다 — 그래야 새 공지가 다시 보인다

## 파일

- 마크업: `src/snippets/notice-bar.md`
- CSS: `src/styles/6-components/notice-bar.css`
- JS: `src/js/notice-bar.js`
