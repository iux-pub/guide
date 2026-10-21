# Script Scope

1. 검사기는 예방형 계약을 보조하는 마지막 안전망이다.
2. 새 검사를 추가하기 전에 어떤 생성 계약·스킬이 올바른 선택을 안내하는지 확인한다.
3. 구조화된 파일은 JSON parser 등 구조화 API로 처리한다.
4. false positive를 막는 단위 테스트를 함께 추가한다.
5. 생성 스크립트는 단일 원본과 생성 대상을 주석으로 명시한다.
6. 검사 실패를 `|| true`나 stderr 폐기로 숨기지 않는다.
7. **HX-06 검사 범위·훅** — 검사는 실제 납품 페이지까지 닿아야 한다.
   - 인자 없는 `check-violations.js`·`check-html-structure.js`는 `lib/page-scope.js`로 납품 페이지(루트 `*.html`, `pages/**/*.html` + `infoux.json` `pages`에 더한 글롭)를 모아 page 계약으로 검사한다. `pages`는 기본 범위에 더하는 것이라 빈 배열로 검사를 끌 수 없다. 제외는 폴더 이름 단위(`node_modules`·`dist`·`_site`·`.git`)이고, 건너뛰기 규칙도 프로젝트 루트 기준 상대 경로로 판정한다(상위 폴더 이름이 판정을 바꾸지 않게).
   - 편집 훅은 `.claude/settings.json`·`.codex/hooks.json`(루트·스타터 네 곳)이 모두 `node ./scripts/hooks/post-edit.js` 하나만 부른다. Claude의 `file_path`와 Codex `apply_patch` 본문의 파일 경로를 모두 읽고, 다른 infoUX 프로젝트(예: `starter/`)의 파일은 그쪽 훅에 넘긴다. 셸 훅(jq·파이프·`;` 연결)으로 되돌리지 않는다 — jq가 없거나 마지막 명령만 성공하면 실패가 조용히 사라졌다.
   - `check-harness.js`가 네 훅 파일의 명령 목록, 스타터 사본 정합, 스타터 stylelint 플러그인 설치 목록, `sync-starter.sh`의 `set -o pipefail`을 본다. 단위 테스트: `__tests__/starter-scope.test.js`.
