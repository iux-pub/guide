---
title: 기여 가이드
order: 5
---

가이드 시스템에 기여하는 방법을 안내한다.

## 기여 방법

### 1. 이슈 등록

변경이 필요한 경우 GitHub 이슈를 먼저 등록한다.

| 이슈 유형 | 템플릿 | 용도 |
|-----------|--------|------|
| 버그 리포트 | `bug-report.md` | 문서 오류, 빌드 실패, 스타일 깨짐 |
| 컴포넌트 제안 | `component-proposal.md` | 새 컴포넌트 추가 요청 |
| 토큰 변경 요청 | `token-change.md` | 토큰 값 변경, 새 토큰 추가 |

### 2. 브랜치 생성

```bash
# 기능/문서 추가
git checkout -b feat/컴포넌트-이름

# 버그 수정
git checkout -b fix/이슈-설명

# 문서 수정
git checkout -b docs/문서-설명
```

### 3. 작업 규칙

- [ ] BEM 네이밍 준수 (`npm run lint:css`로 확인)
- [ ] 토큰 사용 (하드코딩 금지)
- [ ] 접근성 확인 (`npm run test:a11y`)
- [ ] 한국어 주석
- [ ] 2 spaces 들여쓰기, single quote

### 4. PR 제출

PR 템플릿에 따라 변경 요약, 영향 범위, 체크리스트를 작성한다.

## 새 컴포넌트 추가 절차

> KRDS 28컴포넌트 카탈로그 외 신설은 UX팀 결정 + `skill/references/krds-components.md` 등재가 선행되어야 한다.

1. **CSS 파일 생성**: `src/styles/6-components/{컴포넌트명}.css`
2. **index.css에 등록**: `@import "./{컴포넌트명}.css"`
3. **스니펫 작성**: `src/snippets/{컴포넌트명}.md` (KRDS 정합 마크업·variant·접근성)
4. **플레이그라운드 작성**: `src/playground/{컴포넌트명}.html`
5. **문서 페이지**: `site/components/{컴포넌트명}.md`
6. **카탈로그 등재**: `skill/references/krds-components.md`에 BEM·접근성·토큰 매핑 추가
7. **검증**: `npm run check && npm run lint:css && npm run test:a11y`

> `/create-component {컴포넌트명}` 스킬을 사용하면 1~5번 파일이 일괄 생성된다.

## 새 토큰 추가 절차

1. **KRDS 정본 갱신은 직접 수정 금지** — `tokens/krds-base.json`은 KRDS-uiux 외부 갱신만 동기화
2. **INFOMIND 결정**: `tokens/infomind-overrides.json`에서 KRDS 같은 경로 덮어쓰기 또는 `infomind-*` 네임스페이스 추가
3. **빌드**: `npm run build:tokens` 실행 → `tokens/build/tokens.css` 갱신
4. **문서 업데이트**: `site/tokens/` 관련 페이지 + `skill/references/krds-tokens.md`
5. **CLAUDE.md 업데이트**: 필요 시 토큰 카테고리 반영
6. **거버넌스 승인**: 팀 리뷰 후 반영

## 커밋 메시지 규칙

```
feat(컴포넌트): 설명    # 새 기능/컴포넌트
fix(컴포넌트): 설명     # 버그 수정
docs(영역): 설명        # 문서 변경
chore(영역): 설명       # 빌드/설정 변경
```

- 한국어, 명령형으로 작성
- 예: `feat(tab): 수직 탭 variant 추가`
