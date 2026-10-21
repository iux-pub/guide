---
title: 긴급 공지
order: 32
playground_src: /playground/notice-bar.html
preview_height: 320
---

KRDS 긴급 공지(Critical alerts). 지금 대부분의 사용자가 알아야 하는 **한시적 사실 하나**를 본문 맨 위에 띠로 알린다. 블록 이름은 `notice-bar`이고, 권위 있는 소스는 `src/snippets/notice-bar.md`다.

## 기본 마크업

본문 콘텐츠의 첫 요소 — `main#main`의 첫 `section`(메인 메뉴 다음, 히어로 앞)에 화면 폭 전체로 둔다. `header#header` 앞에 두지 않는다.

```html
<section class="notice-bar notice-bar--danger" aria-label="사이트 공지">
  <div class="container notice-bar__inner">
    <svg class="notice-bar__icon icon" aria-hidden="true"><use href="/assets/icons/sprite.svg#error"></use></svg>
    <span class="notice-bar__label">긴급</span>
    <p class="notice-bar__message">
      <a class="notice-bar__link" href="/notice/typhoon-closure">태풍으로 10월 12일 전 시설을 임시 휴관합니다</a>
    </p>
  </div>
</section>
```

- 예시 문구·날짜는 형식 예시다. 실제 값은 `contentSources`에서 가져온다(R-23).
- 링크는 하나까지다. 자세한 안내 페이지가 없으면 문장만 쓴다.

## 긴급도 (KRDS 상·중·하)

| 긴급도 | 상황 | 클래스 | 라벨 | 아이콘 |
|--------|------|--------|------|--------|
| 상 | 국가 재난·비상 상황, 갑작스러운 서비스 장애 | `.notice-bar--danger` | 긴급 | `error` |
| 중 | 서비스 중단 사전 예고 | `.notice-bar--warning` | 예고 | `warning` |
| 하 | 대부분의 사용자가 알아야 하지만 큰 영향은 없는 상황 | (클래스 없음 — 기본) | 안내 | `info` |

## 사용 조건 (KRDS)

- **닫기·숨기기·접기 버튼을 두지 않는다.** 상황이 끝나면 운영자가 내린다 — JS가 없다
- **한 번에 하나만** 둔다. 문장은 한 줄(좁은 화면에서도 두 줄 이내)로 짧게 쓴다
- 상황이 유효한 동안만 둔다. 홍보·일반 공지·폼 결과 안내에는 쓰지 않는다

## 접근성 핵심

- `section` + `aria-label="사이트 공지"` — 이름 있는 영역(region)이 되어 랜드마크 탐색에 잡힌다. main의 section 규칙(`.container` 직계 자식 + 접근 가능한 이름)을 그대로 만족한다
- **라이브 영역(`role="alert"`·`aria-live`)을 쓰지 않는다.** 로드 때 이미 있는 정적 안내이고, 낭독을 강제하면 매 페이지마다 방해가 된다
- **자동으로 넘어가거나 굴러가는 형태(롤링·마키)로 만들지 않는다** (WCAG 2.2.2)
- 긴급도는 색만으로 전하지 않는다 — 라벨 텍스트가 같은 뜻을 전한다 (WCAG 1.4.1). 아이콘은 장식(`aria-hidden="true"`)
- 링크는 밑줄로 구분한다

## 파일

- 마크업: `src/snippets/notice-bar.md`
- CSS: `src/styles/6-components/notice-bar.css` (JS 없음)
- 기준: KRDS 긴급 공지 https://www.krds.go.kr/html/site/component/component_04_02.html
