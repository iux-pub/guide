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

1. **SCSS 파일 생성**: `src/scss/6-components/_컴포넌트명.scss`
2. **_index.scss에 추가**: `@forward '컴포넌트명'`
3. **스니펫 작성**: `src/snippets/컴포넌트명.md`
4. **플레이그라운드 작성**: `src/playground/컴포넌트명.html`
5. **문서 페이지**: `site/components/컴포넌트명.md`
6. **린트 확인**: `npm run lint:css`
7. **접근성 테스트**: `npm run test:a11y`

## 새 토큰 추가 절차

1. **토큰 파일 수정**: `src/scss/1-settings/_tokens-*.scss`
2. **문서 업데이트**: `site/tokens/` 관련 페이지
3. **CLAUDE.md 업데이트**: 토큰 목록 반영
4. **거버넌스 승인**: 팀 리뷰 후 반영

## 커밋 메시지 규칙

```
feat(컴포넌트): 설명    # 새 기능/컴포넌트
fix(컴포넌트): 설명     # 버그 수정
docs(영역): 설명        # 문서 변경
chore(영역): 설명       # 빌드/설정 변경
```

- 한국어, 명령형으로 작성
- 예: `feat(tab): 수직 탭 variant 추가`
