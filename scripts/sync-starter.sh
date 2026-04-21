#!/bin/bash
# guide → starter 동기화 스크립트
# 사용법: npm run sync:starter

set -e

GUIDE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
STARTER_DIR="$GUIDE_DIR/starter"
STARTER_REPO="/tmp/starter-sync"

echo "=== guide → starter 동기화 ==="

# 1. SCSS 동기화 (1-settings ~ 7-utilities + style.scss + _project-overrides.scss)
echo "[1/6] SCSS 동기화..."
for dir in 1-settings 2-tools 3-generic 4-elements 5-objects 6-components 7-utilities; do
  cp -r "$GUIDE_DIR/src/scss/$dir/"* "$STARTER_DIR/src/scss/$dir/"
done
cp "$GUIDE_DIR/src/scss/style.scss" "$STARTER_DIR/src/scss/style.scss"

# 2. JS 동기화
echo "[2/6] JS 동기화..."
cp "$GUIDE_DIR/src/js/"*.js "$STARTER_DIR/src/js/"

# 3. 스니펫 동기화 (CLAUDE.md에서 참조 — LLM 컨텍스트)
echo "[3/6] 스니펫 동기화..."
mkdir -p "$STARTER_DIR/src/snippets"
cp "$GUIDE_DIR/src/snippets/"*.md "$STARTER_DIR/src/snippets/"

# 4. LLM 프롬프트 동기화 (빌드된 스냅샷 — 스타터에서 재생성 불필요)
echo "[4/6] LLM 프롬프트 동기화..."
mkdir -p "$STARTER_DIR/prompts"
cp "$GUIDE_DIR/prompts/"*.md "$STARTER_DIR/prompts/"

# 5. 훅 + 설정 파일 동기화
echo "[5/6] 설정 파일 동기화..."
cp "$GUIDE_DIR/.stylelintrc.json" "$STARTER_DIR/.stylelintrc.json"
cp "$GUIDE_DIR/CLAUDE.md" "$STARTER_DIR/CLAUDE.md"
mkdir -p "$STARTER_DIR/scripts"
cp "$GUIDE_DIR/scripts/check-violations.js" "$STARTER_DIR/scripts/check-violations.js"
mkdir -p "$STARTER_DIR/.claude"
cp "$GUIDE_DIR/.claude/settings.json" "$STARTER_DIR/.claude/settings.json"

# 6. starter 독립 저장소에도 푸시
echo "[6/6] starter 저장소 동기화..."
rm -rf "$STARTER_REPO"
git clone https://github.com/iux-pub/starter.git "$STARTER_REPO" 2>/dev/null
cp -r "$STARTER_DIR/"* "$STARTER_REPO/"
cp "$STARTER_DIR/.gitignore" "$STARTER_REPO/" 2>/dev/null
cp "$STARTER_DIR/.stylelintrc.json" "$STARTER_REPO/"
cp -r "$STARTER_DIR/.claude" "$STARTER_REPO/"
cd "$STARTER_REPO"
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
