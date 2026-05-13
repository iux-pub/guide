# 인포마인드 프로젝트 스타터 킷

KRDS(범정부 UI/UX 디자인 시스템) + INFOMIND UX팀 표준이 적용된 Tailwind v4 기반 프로젝트 시작 템플릿.

---

## 🚀 시작하기 (3단계)

### 1. 클론 + 의존성 설치

```bash
git clone https://github.com/iux-pub/starter.git my-project
cd my-project

# 새 프로젝트로 origin 변경
rm -rf .git
git init
git remote add origin https://github.com/YOUR_ORG/YOUR_REPO.git

# 의존성 설치
npm install --legacy-peer-deps
```

### 2. 빌드

```bash
npm run build       # 토큰 + CSS 한 번에
npm run watch:css   # 개발 시 CSS 변경 감지
```

### 3. AI 코드 생성 시 (Claude Code 사용 시)

작업 시작 시 한 줄 발화:
> **"info-design 스킬 기준으로 가자"**

이 트리거 후 모든 CSS·HTML 코드 생성이 INFOUX 토큰·INFOMIND 컴포넌트 패턴을 우선 사용하도록 강제됩니다.
스킬은 `.claude/skills/info-design/`에 동봉되어 있어 자동 인식됩니다.

---

## 📁 디렉토리 구조

```
my-project/
├── .claude/skills/info-design/   ← AI 컨트랙트 (자동 인식)
│   ├── SKILL.md
│   └── references/
├── tokens/
│   ├── foundation.json          ← 색상 + 기본 폰트 단일 소스
│   └── build/tokens.css         ← 자동 생성
├── src/
│   ├── styles/
│   │   ├── style.css            ← 메인 진입점
│   │   ├── 3-generic/reset.css  ← 1rem=10px 트릭 적용
│   │   ├── 4-elements/          ← HTML 태그 베이스
│   │   ├── 5-objects/           ← 레이아웃 (BEM)
│   │   ├── 6-components/        ← KRDS UI 컴포넌트 22개 (BEM)
│   │   └── 7-utilities/
│   ├── snippets/                ← 컴포넌트 마크업 예시
│   └── js/
├── scripts/
│   ├── build-tokens.js          ← foundation 토큰 → CSS 변환
│   └── check-violations.js      ← 컨트랙트 위반 검출
└── dist/css/style.css           ← 빌드 산출물
```

---

## 🛠 명령어

| 명령 | 용도 |
|------|------|
| `npm run build:tokens` | `tokens/foundation.json` → `tokens/build/tokens.css` |
| `npm run build:css` | Tailwind v4 컴파일 → `dist/css/style.css` |
| `npm run watch:css` | CSS 워치 모드 |
| `npm run build` | 전체 빌드 (tokens + CSS) |
| `npm run lint:css` | Stylelint 검사 |
| `npm run check` | info-design 컨트랙트 위반 검출 |

---

## 🎨 사용 예시

### HTML

```html
<link rel="stylesheet" href="dist/css/style.css">

<!-- 버튼 (KRDS 4 variant × 5 size) -->
<button class="btn btn--primary">저장</button>
<button class="btn btn--secondary btn--small">취소</button>

<!-- 폼 -->
<div class="form-field">
  <label for="name" class="form-field__label">이름</label>
  <input type="text" id="name" class="input">
</div>

<!-- 카드 -->
<article class="card card--medium">
  <header class="card__header">
    <h3 class="card__title">제목</h3>
  </header>
  <div class="card__body">내용</div>
</article>
```

### Tailwind 유틸리티

```html
<div class="bg-primary text-text-inverse p-[2.4rem] rounded-[0.6rem]">
  bg-primary = INFOUX primary
  p-[2.4rem] = 프로젝트 직접값
  rounded-[0.6rem] = 프로젝트 직접값
</div>
```

> ⚠ **Tailwind 기본 팔레트 raw 컬러 유틸리티 사용 금지.** `--color-*` 기반 색상만 허용됩니다.

---

## 🔧 프로젝트 커스터마이징

### 브랜드 색상/기본 폰트 변경

`tokens/foundation.json` 편집:

```json
{
  "font": {
    "family": {
      "sans": { "value": "'Pretendard GOV', system-ui, sans-serif" }
    }
  }
}
```

저장 후 `npm run build` 실행.

### 새 컴포넌트 필요 시

기존 컴포넌트 카탈로그를 먼저 확인한다. 카탈로그 밖 패턴은 프로젝트 필요성과 공통화 가능성을 판단해 UX팀 결정으로 확장한다.

---

## 🚫 절대 금지 (요약)

전체 규정은 `.claude/skills/info-design/references/forbidden-patterns.md` 참조.

- Raw hex/rgb/hsl 색상
- Raw px/rem은 반복 패턴이면 토큰화 권장. 프로젝트 고유 레이아웃 값은 허용
- Tailwind 기본 팔레트 raw 컬러 유틸
- 옛 버튼 variant (`btn--ghost`, `btn--outline`, `btn--link`, `btn--sm`)
- `:focus { outline: none }`
- `div/span 클릭 핸들러 패턴` (시맨틱 HTML 사용)
- 이미지 `alt` 누락, 폼 `<label>` 누락

빌드 시 `npm run check`이 위반 자동 검출합니다.

---

## 📚 더 알아보기

- **KRDS 공식**: https://www.krds.go.kr
- **info-design 스킬**: `.claude/skills/info-design/SKILL.md` (전체 컨트랙트)
- **토큰 카탈로그**: `.claude/skills/info-design/references/krds-tokens.md`
- **컴포넌트 카탈로그**: `.claude/skills/info-design/references/krds-components.md`
- **가이드 저장소**: https://github.com/iux-pub/guide

---

## 🔄 갱신

KRDS가 새 버전을 내거나 INFOMIND 결정이 바뀌면 UX팀이 가이드 저장소를 갱신합니다.
이 starter도 가이드 저장소에서 자동 sync됩니다.

```bash
# 새 버전 받기
git pull upstream main  # upstream = iux-pub/starter
npm install --legacy-peer-deps
npm run build
```

---

## 🆘 문제 해결

**빌드 실패** → `rm -rf node_modules && npm install --legacy-peer-deps`

**iCloud Drive에서 hang** → 프로젝트를 iCloud 외부 위치로 이동 (`~/Documents/`가 아닌 `~/projects/` 같은 곳)

**스타일이 안 보임** → `npm run build` 실행 + HTML에서 `<link rel="stylesheet" href="dist/css/style.css">` 확인

**컨트랙트 위반 검출** → 메시지가 안내하는 KRDS 토큰으로 교체

---

내부 사용 — INFOMIND UX Team
