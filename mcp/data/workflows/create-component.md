# create-component

> **언제 쓰나** — BEM 컴포넌트 일괄 생성. 컴포넌트명 입력 시 CSS + 스니펫 + playground HTML + site 문서 페이지를 생성한다. "컴포넌트 추가", "새 컴포넌트", "create component" 요청 시 사용.

INFOUX 카탈로그를 먼저 확인한 뒤 재사용 가치가 있는 BEM 컴포넌트를 추가한다.

## 사전 판단

1. `references/project-profiles.md`에서 사이트 유형을 판정한다.
2. `references/krds-components.md`에서 기존 컴포넌트 조합으로 해결 가능한지 확인한다.
3. 신규 패턴이면 일회성 프로젝트 패턴인지 공통 컴포넌트 후보인지 사용자에게 보고한다.
4. 공통 컴포넌트로 확정된 경우에만 아래 파일을 생성한다.

## 생성 파일

| 파일 | 용도 |
|------|------|
| `src/styles/6-components/{name}.css` | Tailwind v4 + 표준 CSS nesting 스타일 |
| `src/snippets/{name}.md` | HTML, variant, 접근성, 키보드 동작 |
| `src/playground/{name}.html` | 브라우저 미리보기 |
| `site/components/{name}.md` | 문서 사이트 페이지 |

## CSS 기준

```css
/* {name} 컴포넌트 */
@layer components {
  .{name} {
    @apply relative text-[var(--color-text)];
  }

  .{name}__body {
    @apply flex flex-col gap-[1.6rem] pc:flex-row;
  }

  .{name}__item {
    @apply border border-[var(--color-border)];

    /* 상태는 ARIA 속성으로 그린다(R-17) */
    &[aria-selected="true"] {
      @apply border-[var(--color-border-primary)];
    }
  }

  .{name}__panel[hidden] {
    @apply [display:none];
  }

  /* 크기 변형 — contracts/class-naming.json 허용 어휘에서만 고른다(R-18) */
  .{name}--large {
    @apply p-[4rem];
  }
}
```

- SCSS, `@use`, `@forward`, 믹스인을 사용하지 않는다.
- element·modifier는 `.{name}__body`·`.{name}--large`처럼 **전체 선택자**로 쓴다. 표준 CSS nesting의 `&`는 이름을 이어 붙이지 않으므로 `&__body`·`&--large`는 SCSS처럼 `.{name}__body`가 되지 않는다 — `__body`라는 요소를 찾는 선택자(`__body.{name}`)로 풀려 아무 데도 적용되지 않는다. 중첩은 `&:hover`·`&[aria-expanded="true"]`처럼 같은 요소의 상태에만 쓴다.
- 레이아웃·정렬·표시 속성은 `@apply`를 우선한다. 반응형은 `@apply pc:*`처럼 variant로 처리한다.
- 색상은 `var(--color-*)`, 기본 폰트는 `var(--font-sans)`를 사용한다.
- 간격·크기·타이포·반경은 프로젝트 맥락의 직접값을 허용한다.
- 상태는 ARIA·hidden 속성을 먼저 쓴다 — CSS는 `[aria-selected="true"]`·`[aria-expanded="true"]`·`[aria-current="page"]`·`[hidden]`·`:disabled`로 모양을 바꾼다. ARIA로 표현할 수 없는 상태(예: 단계 표시의 완료)만 BEM modifier를 쓰고, `.is-*`·`.has-*`는 쓰지 않는다(R-17). 결정 순서는 `references/class-naming.md`를 따른다.
- modifier 이름은 `contracts/class-naming.json` 허용 어휘에서 고른다(R-18). 블록 고유 변형이 필요하면 CSS에 먼저 정의하고 `blockModifiers`에 등록한다.
- 컴포넌트 파일을 `src/styles/6-components/index.css`에 `@import`한다.

## 마크업 기준

- root 태그와 ARIA는 `references/html-semantics.md`를 따른다.
- 인터랙티브 요소는 `button`, `a`, native form control을 사용한다.
- 이미지 `alt`, 폼 label, 키보드 조작, 44px 터치 영역을 확인한다.
- 위젯은 WAI-ARIA APG 관계 속성과 연결 대상 id까지 작성한다.
- 스니펫·playground·문서에 쓰는 BEM 클래스는 위 CSS에 정의한 것만 쓴다(R-29).

## 검증

```bash
npm run check
npm run lint
npm run build
npm run test:unit
```

위반이나 기존 카탈로그와의 중복이 있으면 생성 완료로 보고하지 않는다.
