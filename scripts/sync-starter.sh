#!/bin/bash
# guide → starter 동기화 스크립트
# 사용법: npm run sync:starter
#
# 원격 starter 저장소에는 모든 파일을 포함한다 (LLM 하네스 포함).
# 팀원이 clone 후 자신의 프로젝트 저장소에 커밋할 때만 .gitignore가 LLM 파일을 제외한다.

set -e

GUIDE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
STARTER_DIR="$GUIDE_DIR/starter"
STARTER_REPO="/tmp/starter-sync"

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

# 3. 스니펫 동기화 (LLM 참조용)
echo "[3/5] 스니펫 동기화..."
mkdir -p "$STARTER_DIR/src/snippets"
cp "$GUIDE_DIR/src/snippets/"*.md "$STARTER_DIR/src/snippets/"

# 4. LLM 하네스 동기화
echo "[4/5] LLM 하네스 동기화..."
mkdir -p "$STARTER_DIR/prompts"
cp "$GUIDE_DIR/prompts/"*.md "$STARTER_DIR/prompts/"
cp "$GUIDE_DIR/.stylelintrc.json" "$STARTER_DIR/.stylelintrc.json"
cp "$GUIDE_DIR/CLAUDE.md" "$STARTER_DIR/CLAUDE.md"
# 명령어 섹션을 스타터용으로 치환 (가이드 전용 명령어 제거)
python3 - "$STARTER_DIR/CLAUDE.md" <<'PYEOF'
import sys, re
path = sys.argv[1]
text = open(path).read()
starter_cmds = """## 명령어

```bash
npm run check           # 위반 패턴 전체 스캔 (훅에서도 자동 실행)
npm run lint:css        # SCSS 린트 전체 검사
npm run lint:css:fix    # 자동 수정
npm run build:css       # CSS 빌드
npm run watch:css       # CSS 감시 빌드
```
"""
text = re.sub(r'## 명령어\n.*?(?=\n## |\Z)', starter_cmds, text, flags=re.DOTALL)
open(path, 'w').write(text)
PYEOF
mkdir -p "$STARTER_DIR/scripts"
cp "$GUIDE_DIR/scripts/check-violations.js" "$STARTER_DIR/scripts/check-violations.js"
# .claude/settings.json은 starter 전용으로 별도 관리 — guide 파일을 덮어쓰지 않음

# 5. 원격 저장소 동기화 (전체 푸시)
echo "[5/5] starter 저장소 동기화..."
rm -rf "$STARTER_REPO"
git clone https://github.com/iux-pub/starter.git "$STARTER_REPO" 2>/dev/null
cp -r "$STARTER_DIR/"* "$STARTER_REPO/"
cp "$STARTER_DIR/.gitignore" "$STARTER_REPO/" 2>/dev/null
cp "$STARTER_DIR/.stylelintrc.json" "$STARTER_REPO/"
cp -r "$STARTER_DIR/.claude" "$STARTER_REPO/"
cd "$STARTER_REPO"
git add -A
# .gitignore가 LLM 파일을 제외하므로 강제 추가 (팀원 프로젝트에서는 .gitignore가 보호)
git add -f CLAUDE.md .claude/ prompts/ scripts/ src/snippets/ 2>/dev/null || true
if git diff --cached --quiet; then
  echo "변경 없음 — 이미 최신"
else
  git commit -m "sync: guide 저장소에서 동기화"
  git push
  echo "✓ iux-pub/starter 푸시 완료"
fi

rm -rf "$STARTER_REPO"
echo "=== 동기화 완료 ==="
