# create-infomind-ux

INFOMIND UX 스타터 키트로 새 프로젝트를 생성한다. KRDS(범정부 UI/UX 디자인 시스템)의 접근성·구조 원칙 + INFOMIND 실무 표준이 적용된 상태로 즉시 시작.

## 사용

```bash
npx create-infomind-ux my-project
cd my-project
npm run build        # 토큰 + CSS 빌드 (dist/css/style.css)
npm run watch:css    # CSS 변경 감시
npm run check        # 컨트랙트·HTML 구조·대비·아이콘 검사
```

스타터에는 개발 서버가 없다. `index.html`을 브라우저나 쓰는 도구의 미리보기로 연다.

## 옵션

```bash
npx create-infomind-ux <project-name> [옵션]

--profile <type>     사이트 유형 지정
--brand <path>       브랜드 토큰 파일 주입 (tokens/brand.json 교체)
--deliver            납품본 생성 — 사내 운영 문서 제외
--skip-install       의존성 설치 건너뛰기
--no-git             git init 건너뛰기
--help, -h           도움말
--version, -v        버전
```

`--profile`·`--brand`는 값을 반드시 준다. 값이 빠지거나 모르는 옵션이 오면 프로젝트를 만들지 않고 오류로 끝난다.

### `--profile`

사이트 유형을 프로젝트에 기록한다. AI 도구가 매번 유형을 되묻지 않고, `infoux.json`과 `CLAUDE.md`/`AGENTS.md` 머리말에서 읽는다. 값은 `contracts/task-contract.schema.json`의 `profile` enum을 따른다.

`general-site` · `public-service` · `public-institution` · `cms-admin` · `commerce-reservation`

### `--brand`

발주처 브랜드 팔레트를 주입한다. `tokens/brand.json` 구조를 그대로 따르며, **라이트와 고대비 두 모드를 모두 채워야 한다** — 한쪽만 있으면 생성이 중단된다(가장 흔한 사고다).

주입 후 반드시 검사한다. 브랜드색이 접근성을 깨면 여기서 잡힌다.

```bash
cd <project> && npm run build && npm run check
```

### `--deliver`

발주처에 넘길 산출물을 만든다. 사내 운영 문서(`AGENTS.md`·`CLAUDE.md`·`PUBLISHER_GUIDE.md`·`INSTACK_GUIDE.md`·`.cursorrules`·`.github`·`prompts`)를 제외한다.

`contracts`·`scripts`·`tokens`는 **남긴다.** 검사기가 `contracts/html-page-contract.json`에서 section archetype을 읽기 때문에, 빼면 발주처가 빌드·검증을 못 한다.

납품본에는 infoUX 버전을 새기지 않는다. 파생 버전 대응표는 UX팀 원장(위키)이 관리한다.

## 자동 동봉되는 것

- ✅ KRDS 기반 컴포넌트 CSS (BEM + ITCSS 5-layer)
- ✅ INFOUX 색상/기본 폰트 토큰
- ✅ Tailwind v4 + CSS nesting + `@apply`
- ✅ `infoux.json` — 사이트 유형 기록과 납품 페이지 범위 `pages`(기본 `*.html`, `pages/**/*.html`) (`--profile` 지정 시). `npm run check`가 이 범위의 페이지를 page 계약으로 검사한다
- ✅ 편집 직후 검사 훅 — `.claude/settings.json`·`.codex/hooks.json`이 `scripts/hooks/post-edit.js`를 부른다(stylelint·컨트랙트·HTML 구조, 실패는 숨기지 않는다)
- ✅ `AGENTS.md` + `.cursorrules` — Cursor/Aider/Codex 자동 인식
- ✅ Stylelint + 정적 검사기 5종(`npm run check` — 컨트랙트 위반·HTML 구조·대비·아이콘·계약)

## 다음 단계

1. 브랜드 색상 정의: `tokens/brand.json` 편집(`foundation.json`은 고치지 않는다) → `npm run build` → `npm run check`
2. AI 기준 연결: `claude mcp add infoux -- npx -y @infomind-ux/infoux-mcp`
3. 자세한 가이드: `README.md`, `CLAUDE.md`, https://footer.kr/guide/

## 출처

본 CLI는 `iux-pub/starter` 저장소를 GitHub tarball로 다운로드하고 초기화한다.

표준 정의 저장소: https://github.com/iux-pub/guide
스타터 키트 저장소: https://github.com/iux-pub/starter

## 라이선스

ISC — Internal use only (INFOMIND UX Team)
