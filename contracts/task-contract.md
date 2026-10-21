# INFOUX Task Contract

UI/CSS/HTML 구현 전에 아래 판단을 먼저 확정한다. 단순 수정은 작업 응답에 짧게 선언하고, 페이지·기능 단위 작업은 이 형식의 파일을 프로젝트에 남긴다.

```yaml
profile: general-site
primaryTask: 사용자가 수행할 핵심 과업
pagePattern: content
pageType: sub-content
reuse:
  - 기존 컴포넌트명
interactive: []
tokens:
  - semantic-color
publicIdentity: not-applicable
expression: expressive
contentSources:
  - 과업 문서 경로·용어집·기존 사이트 URL
exceptions: []
```

## 진행 조건

1. `profile`은 `references/project-profiles.md`의 다섯 유형 중 하나로 판정한다.
2. `reuse`는 `references/krds-components.md`를 검색한 결과다.
3. `interactive`가 있으면 `references/html-semantics.md`의 ARIA·키보드 패턴을 지정한다.
4. 공공 아이덴티티가 확인되지 않았으면 `unconfirmed`로 두고 생성하지 않는다.
5. `exceptions`는 규칙을 무시하는 목록이 아니다. 불가피한 예외의 규칙, 이유, 소유자, 만료일을 기록한다.
6. `expression`은 표현 등급 override다. 생략하면 `contracts/profiles.json`의 profile 기본값을 따른다. 상향은 근거 기록이 필수고, `publicIdentity: required`면 상한은 restrained다(스키마가 강제한다). 결제·인증·폼 페이지는 utility로 강등해 작성한다.
7. 등급 묶음에서 축 하나만 열 때는 통째 상향 대신 `exceptions`에 `rule: "expression.hero"` 형식의 축 단위 예외를 근거와 함께 기록한다.
8. `contentSources`는 실제 기관 용어·메뉴명·콘텐츠의 출처다(과업 문서 경로, 용어집, 기존 사이트 URL). 비어 있으면 카피는 임시 초안 신분을 벗어날 수 없다.
9. `pageType`은 페이지 유형이다(main, sub-content, board-list, board-detail, form, search-result, error). 같은 값을 `infoux.json`의 `pageTypes`에 파일 글롭으로 선언해야 검사기가 안다 — `{ "index.html": "main", "pages/notice/*.html": { "type": "board-list", "depth": 3 } }`. `depth`는 홈을 1로 센 메뉴 단계다(홈>알림마당>공지사항 = 3). 선언이 있으면 R-40(공공 메인의 과업 진입·마케팅 섹션)과 R-41(3단계 이상 브레드크럼·서브 첫 섹션 히어로 금지)이 그 페이지에 켜진다. `recipe`는 main일 때만 쓴다(references/korean-web-patterns.md).
10. 필수 판단이 비어 있으면 코드 생성을 시작하지 않는다.
