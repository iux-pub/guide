#!/bin/bash
# guide → starter 동기화 (KRDS + Tailwind v4 시스템)
# 사용법: npm run sync:starter
#
# 동기화 대상:
#   - src/styles/             → starter/src/styles/
#   - src/snippets/           → starter/src/snippets/
#   - src/js/                 → starter/src/js/
#   - tokens/                 → starter/tokens/ (krds-base + overrides — build/ 제외)
#   - scripts/build-tokens.js → starter/scripts/
#   - scripts/check-violations.js → starter/scripts/
#   - postcss.config.mjs      → starter/
#   - .stylelintrc.json       → starter/
#
# starter/CLAUDE.md, starter/package.json, starter/README.md는 starter 전용으로 별도 관리.

set -e

GUIDE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
STARTER_DIR="$GUIDE_DIR/starter"

echo "=== guide → starter 동기화 (KRDS + Tailwind v4) ==="

# 1. styles
echo "[1/6] src/styles/ 동기화..."
rm -rf "$STARTER_DIR/src/styles"
cp -r "$GUIDE_DIR/src/styles" "$STARTER_DIR/src/styles"

# 2. snippets
echo "[2/6] src/snippets/ 동기화..."
rm -rf "$STARTER_DIR/src/snippets"
cp -r "$GUIDE_DIR/src/snippets" "$STARTER_DIR/src/snippets"

# 3. js
echo "[3/6] src/js/ 동기화..."
if [ -d "$GUIDE_DIR/src/js" ]; then
  mkdir -p "$STARTER_DIR/src/js"
  cp "$GUIDE_DIR/src/js/"*.js "$STARTER_DIR/src/js/" 2>/dev/null || true
fi

# 4. tokens (build/ 제외 — starter에서 자체 빌드)
echo "[4/6] tokens/ 동기화..."
mkdir -p "$STARTER_DIR/tokens"
cp "$GUIDE_DIR/tokens/krds-base.json" "$STARTER_DIR/tokens/"
cp "$GUIDE_DIR/tokens/infomind-overrides.json" "$STARTER_DIR/tokens/"
cp "$GUIDE_DIR/tokens/README.md" "$STARTER_DIR/tokens/"

# 5. scripts (build-tokens, check-violations)
echo "[5/6] scripts 동기화..."
mkdir -p "$STARTER_DIR/scripts"
cp "$GUIDE_DIR/scripts/build-tokens.js" "$STARTER_DIR/scripts/"
cp "$GUIDE_DIR/scripts/check-violations.js" "$STARTER_DIR/scripts/"

# 6. config files
echo "[6/7] config 동기화..."
cp "$GUIDE_DIR/postcss.config.mjs" "$STARTER_DIR/"
cp "$GUIDE_DIR/.stylelintrc.json" "$STARTER_DIR/"

# 6.5. info-design 스킬 (Claude Code가 자동 인식하도록 .claude/skills/에 포함)
echo "[7/7] info-design 스킬 동봉..."
mkdir -p "$STARTER_DIR/.claude/skills/info-design"
rm -rf "$STARTER_DIR/.claude/skills/info-design/references"
cp -r "$GUIDE_DIR/skill/SKILL.md" "$STARTER_DIR/.claude/skills/info-design/"
cp -r "$GUIDE_DIR/skill/references" "$STARTER_DIR/.claude/skills/info-design/"

echo ""
echo "✓ 로컬 starter/ 동기화 완료"
echo ""

# 7. iux-pub/starter 원격 저장소로 push (개발팀 clone 대상)
STARTER_REPO="/tmp/starter-sync"
echo "[7/7] iux-pub/starter 원격 저장소 동기화..."
rm -rf "$STARTER_REPO"
git clone https://github.com/iux-pub/starter.git "$STARTER_REPO" 2>&1 | tail -3

# 기존 내용 모두 제거 후 새로 복사 (.git 제외)
find "$STARTER_REPO" -mindepth 1 -maxdepth 1 ! -name '.git' -exec rm -rf {} + 2>/dev/null
cp -R "$STARTER_DIR/." "$STARTER_REPO/"

cd "$STARTER_REPO"
git add -A 2>&1 | tail -3
if git diff --cached --quiet; then
  echo "  변경 없음 — 이미 최신"
else
  git commit -m "sync: KRDS + Tailwind v4 시스템 동기화 (guide repo에서)" 2>&1 | tail -3
  git push 2>&1 | tail -3
  echo "  ✓ iux-pub/starter 푸시 완료"
fi

cd "$GUIDE_DIR"
rm -rf "$STARTER_REPO"

echo ""
echo "=== 완료 ==="
echo "개발팀이 시작할 때:"
echo "  git clone https://github.com/iux-pub/starter.git my-project"
echo "  cd my-project && npm install --legacy-peer-deps && npm run build"
