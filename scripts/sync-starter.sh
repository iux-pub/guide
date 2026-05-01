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
echo "[6/6] config 동기화..."
cp "$GUIDE_DIR/postcss.config.mjs" "$STARTER_DIR/"
cp "$GUIDE_DIR/.stylelintrc.json" "$STARTER_DIR/"

echo ""
echo "✓ 동기화 완료. starter/ 검토 후 npm 패키지 또는 git 저장소에 배포하세요."
echo ""
echo "starter 단독 빌드 검증:"
echo "  cd $STARTER_DIR"
echo "  npm install --legacy-peer-deps"
echo "  npm run build"
