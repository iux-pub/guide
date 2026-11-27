# design-page

> **언제 쓰나** — INFOUX 기준으로 새 페이지, 화면, 랜딩, 상세, 목록, 관리자 화면을 설계하거나 구현할 때 사용. 코드 작성 전에 사이트 유형, 사용자 핵심 과업, page shell, section 패턴과 재사용 컴포넌트를 확정한다.

페이지 코드를 바로 작성하지 않는다. 먼저 `contracts/task-contract.md` 형식으로 Task Contract를 선언한다.

## 절차

1. `references/project-profiles.md`에서 사이트 유형과 기본 section 흐름을 판정한다. 메인이면 `references/korean-web-patterns.md`(`get_reference("korean-web-patterns")`) §2에서 한국형 메인 레시피를, 서브면 §4 서브 골격을 고른다. 페이지 유형은 Task Contract `pageType`과 `infoux.json` `pageTypes`에 함께 적는다.
2. `get_art_direction(profile)`로 표현 등급, 섹션 리듬 변주, 카피 톤을 확정하고, 실제 기관 용어·콘텐츠·사진의 출처(`contentSources`)를 확보한다. 등급 상향은 Task Contract의 `expression` 필드에 근거와 함께 기록한다.
3. 사용자의 핵심 과업을 한 문장으로 쓴다.
4. `references/krds-components.md`에서 재사용할 컴포넌트를 고른다.
5. `contracts/html-page-contract.json`으로 page shell과 section 구조를 확정한다.
6. 인터랙티브 위젯이 있으면 `design-widget` 절차를 함께 적용한다.
7. Task Contract의 필수 항목이 채워진 뒤에만 구현한다.

## 메인·랜딩이면 생성은 자유롭게, 하네스는 바닥만

`pageType: main`이거나 랜딩이면 위 4·5번(카탈로그·page shell 확정)을 생성 전에 강제하지 않는다. `references/design-intelligence.md`(`get_reference("design-intelligence")`) 절차를 따른다.

1. **재료 확보** — 실제 메뉴·콘텐츠(`contentSources`)와 기관 사진(출처·라이선스)을 모은다. 사진이 없으면 실제 비율의 이미지 자리와 교체 목록을 둔다. SVG 그림으로 장면을 지어 메우지 않는다.
2. **짧은 브리프** — 기관, 1순위 과업, 사용자, 기준 수준, 피할 것을 다섯 줄 이내로 쓴다.
3. **자유 생성** — 브리프와 재료만으로 디자인한다. 구도·색·서체 크기와 굵기·사진 처리·섹션 구성은 생성 모델이 정한다. 옛 형식표·블록 카탈로그·견본·결함 문항을 생성 맥락에 넣지 않는다. 표현 등급은 메인 생성의 상한으로 쓰지 않는다.
4. **바닥 교정** — `npm run check`·`npm run lint` 오류, 접근성·과업 흐름, KRDS 대조, 카피 사실성만 고친다. 위반한 지점만 가장 좁게 고치고 디자인을 다시 하지 않는다. 검사 규칙과 디자인이 정면으로 부딪치면 지우기 전에 `exceptions[]`에 예외로 올리고 사람에게 넘긴다. 바꾼 것을 `docs/design-plan.md` 「교정 기록」에 적는다.
5. **사람 수정과 판정** — 생성 결과는 디자이너가 수정하는 출발점이다. 운영자·발주자가 「승인」 또는 「불통과」와 사유 원문을 `docs/design-plan.md` 「사람 판정」에 적는다. 「승인」이 없으면 `npm run check:release`가 실패한다.

서브·게시판·폼·검색 결과는 위 기본 절차를 따른다. 등급은 기능형~절제형 수위로 낮춘다(`art-direction.md` §1).

## 생성 원칙

- `main` 직계 자식은 목적 기반 `section`이다.
- 각 section은 `.container`와 접근 가능한 이름을 가진다.
- 정부·공공 요소는 `publicIdentity: required`일 때만 생성한다.
- 서브 페이지는 기존 section·컴포넌트 조합으로 해결할 수 있으면 새 block을 만들지 않는다. 메인·랜딩은 카탈로그 조합을 강제하지 않는다.
- 구현 후 검사는 선택을 대신하는 단계가 아니라 마지막 확인 단계다. 검사를 통과한 화면이 좋은 화면이라는 뜻은 아니다.
