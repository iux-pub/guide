#!/bin/bash
# guide → starter 동기화 스크립트
# 사용법: npm run sync:starter
#
# 로컬 starter/ : LLM 하네스 포함 (CLAUDE.md, prompts/, .claude/, scripts/, src/snippets/)
# 원격 starter  : 코드만 (LLM 하네스 제외 — 팀원 프로젝트 저장소에 노출 안 됨)

set -e

GUIDE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
STARTER_DIR="$GUIDE_DIR/starter"
STARTER_REPO="/tmp/starter-sync"

# 원격 저장소에서 제외할 LLM 하네스 파일 목록
LLM_FILES=(
  "CLAUDE.md"
  ".claudeignore"
  ".claude"
  "prompts"
  "scripts"
  "rules.json"
  "src/snippets"
)

echo "=== guide → starter 동기화 ==="

# 1. SCSS 동기화
echo "[1/5] SCSS 동기화..."
for dir in 1-settings 2-tools 3-generic 4-elements 5-objects 6-components 7-utilities; do
  cp -r "$GUIDE_DIR/src/scss/$dir/"* "$STARTER_DIR/src/scss/$dir/"
done
cp "$GUIDE_DIR/src/scss/style.scss" "$STARTER_DIR/src/scss/style.scss"

# 2. JS 동기화
echo "[2/5] JS 동기화..."
cp "$GUIDE_DIR/src/js/"*.js "$STARTER_DIR/src/js/"

# 3. 스니펫 동기화 (로컬 전용 — LLM 참조용)
echo "[3/5] 스니펫 동기화..."
mkdir -p "$STARTER_DIR/src/snippets"
cp "$GUIDE_DIR/src/snippets/"*.md "$STARTER_DIR/src/snippets/"

# 4. LLM 하네스 동기화 (로컬 전용)
echo "[4/5] LLM 하네스 동기화..."
mkdir -p "$STARTER_DIR/prompts"
cp "$GUIDE_DIR/prompts/"*.md "$STARTER_DIR/prompts/"
cp "$GUIDE_DIR/.stylelintrc.json" "$STARTER_DIR/.stylelintrc.json"
cp "$GUIDE_DIR/CLAUDE.md" "$STARTER_DIR/CLAUDE.md"
mkdir -p "$STARTER_DIR/scripts"
cp "$GUIDE_DIR/scripts/check-violations.js" "$STARTER_DIR/scripts/check-violations.js"
mkdir -p "$STARTER_DIR/.claude"
cp "$GUIDE_DIR/.claude/settings.json" "$STARTER_DIR/.claude/settings.json"

# 5. 원격 저장소 동기화 (코드만 푸시)
echo "[5/5] starter 저장소 동기화..."
rm -rf "$STARTER_REPO"
git clone https://github.com/iux-pub/starter.git "$STARTER_REPO" 2>/dev/null

# 코드 파일만 복사
cp -r "$STARTER_DIR/src/scss" "$STARTER_REPO/src/"
cp -r "$STARTER_DIR/src/js" "$STARTER_REPO/src/"
cp "$STARTER_DIR/index.html" "$STARTER_REPO/"
cp "$STARTER_DIR/package.json" "$STARTER_REPO/"
cp "$STARTER_DIR/.gitignore" "$STARTER_REPO/"
cp "$STARTER_DIR/.stylelintrc.json" "$STARTER_REPO/"
cp "$STARTER_DIR/README.md" "$STARTER_REPO/" 2>/dev/null || true

# LLM 하네스 파일이 원격에 남아 있으면 삭제
cd "$STARTER_REPO"
for f in "${LLM_FILES[@]}"; do
  if [ -e "$f" ]; then
    git rm -r --cached "$f" 2>/dev/null || true
    rm -rf "$f"
  fi
done

git add -A
if git diff --cached --quiet; then
  echo "변경 없음 — 이미 최신"
else
  git commit -m "sync: guide 저장소에서 동기화"
  git push
  echo "✓ iux-pub/starter 푸시 완료"
fi

rm -rf "$STARTER_REPO"
echo "=== 동기화 완료 ==="
