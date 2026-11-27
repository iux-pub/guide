# HTML Snippet Scope

1. 작업 전 `contracts/task-contract.md` 판단을 완료한다.
2. `references/krds-components.md`에서 기존 컴포넌트를 먼저 찾는다.
3. root 태그, ARIA, 키보드는 `references/html-semantics.md`를 따른다.
4. 페이지 예시는 `contracts/html-page-contract.json`의 shell과 section 구조를 따른다.
5. 폼은 `references/workflows/design-form.md`, 인터랙티브 위젯은 `references/workflows/design-widget.md` 절차를 따른다(MCP `get_workflow("design-form")`·`get_workflow("design-widget")`).
6. 예시는 기본 마크업, 허용 variant, 사용 조건, 금지 조건, 접근성 동작을 함께 문서화한다.
