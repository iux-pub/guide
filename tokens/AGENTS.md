# Token Scope

이 경로의 원본은 **두 파일**이다. 어느 쪽을 고칠지 먼저 판단한다.

- `tokens/brand.json` — 프로젝트 브랜드 팔레트(primary/secondary/point)와 `--font-sans`. **프로젝트에서 바꾸는 것은 이 파일뿐이다.**
- `tokens/foundation.json` — gray 스케일, 상태색, 의미 토큰, 브레이크포인트, `--font-mono`. KRDS 기반 접근성 기준이므로 **프로젝트 사정으로 고치지 않는다.** 팀 표준 변경일 때만 UX팀 판단으로 수정한다.

1. 변경 전 `.agents/skills/change-token/SKILL.md` 절차를 따른다.
2. 기존 semantic token으로 해결 가능한지 먼저 확인한다.
3. primitive와 semantic alias의 역할을 섞지 않는다. semantic은 값이 아니라 `{primitive.color.light.*}` 참조로 쓴다.
4. 브랜드 팔레트는 `light`와 `high-contrast` 두 모드를 모두 채운다. 한쪽만 채우면 빌드가 실패한다.
5. 상태색(danger/warning/success/information)을 브랜드색으로 재정의하지 않는다. 발주처 CI 요구는 `point`로 받는다.
6. `tokens/build/tokens.css`는 직접 수정하지 않는다.
7. 변경 후 `npm run build:tokens` → `npm run check:contrast` → 사용처 검색을 수행한다.
8. `tokens/contrast-baseline.json`에 항목을 **추가하지 않는다.** 새 위반은 기준선에 넣어 덮는 것이 아니라 색을 고쳐서 없앤다.
