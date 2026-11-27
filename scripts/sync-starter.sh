#!/bin/bash
# guide → starter 동기화 (INFOUX + Tailwind v4 시스템)
# 사용법:
#   npm run sync:starter       # 로컬 starter/만 갱신 — node scripts/sync-starter.js (Windows에서도 돈다)
#   npm run sync:starter:push  # 로컬 갱신 후 iux-pub/starter 푸시 (작업 사본에서 설치·빌드·검사 통과 시에만) — 이 스크립트(bash)
#   DRY_RUN=1 npm run sync:starter:push   # 빌드·검사까지 하고 커밋·푸시 직전에 변경 요약만 본다
#   STARTER_SYNC_DIR=<경로>               # 푸시용 작업 사본 위치(기본 /tmp/starter-sync)
#
# 로컬 갱신은 scripts/sync-starter.js가 한다 — 복사 목록의 정본은 그 파일 하나다(이 스크립트는 목록을 갖지 않는다).
# 아래는 읽는 사람을 위한 요약이다. 항목을 더하거나 빼려면 sync-starter.js를 고친다.
#
# 동기화 대상:
#   - src/styles/             → starter/src/styles/
#   - src/snippets/           → starter/src/snippets/
#   - src/js/                 → starter/src/js/
#   - tokens/                 → starter/tokens/ (foundation + brand + presets + README — build/ 제외)
#   - scripts/build-tokens.js → starter/scripts/
#   - scripts/check-*.js      → starter/scripts/
#   - contracts/             → starter/contracts/
#   - assets/icons/          → starter/assets/icons/ (스프라이트·폰트·CSS·낱개 SVG)
#   - scripts/check-icons.js → starter/scripts/ (+ build-icon-sheet.js, lib/svg-*.js)
#   - scripts/hooks/         → starter/scripts/hooks/ (편집 직후 검사 훅 — HX-06)
#   - scripts/lib/page-scope.js → starter/scripts/lib/ (납품 페이지 범위 — HX-06)
#   - scripts/lib/{visual-signature,html-tree,copy-rules}.js → starter/scripts/lib/ (시각 서명·카피 검사)
#   - scripts/lib/template-signature.js → starter/scripts/lib/ (R-51 템플릿 장식 서명 — 빠지면 스타터의 R-51 검사가 조용히 꺼진다)
#   - scripts/lib/design-plan.js → starter/scripts/lib/ (CT-04 디자인 계획 판독 — check-contract.js가 쓴다)
#   - scripts/lib/*.js 나머지 → 스타터로 가는 스크립트가 require로 부르는 파일 전부(sync-starter.js가 따라가며 모은다)
#   - .claude/settings.json, .codex/hooks.json → starter/ (루트와 같은 훅 — check-harness가 정합을 본다)
#   - prompts/               → starter/prompts/
#   - postcss.config.mjs      → starter/
#   - .stylelintrc.json       → starter/
#   - .npmrc                  → starter/
#
# starter/AGENTS.md, starter/CLAUDE.md, starter/.cursorrules, starter/package.json,
# starter/README.md는 starter 전용으로 별도 관리.

set -e
# 파이프의 앞 명령이 실패해도 잡는다 — 'npm run check | tail'이 검사 실패를 삼키면 깨진 스타터가 푸시된다
set -o pipefail

PUSH_REMOTE=false
if [ "${1:-}" = "--push" ]; then
  PUSH_REMOTE=true
fi

GUIDE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
STARTER_DIR="$GUIDE_DIR/starter"

# 1~6. 로컬 starter/ 갱신 — 복사 목록은 scripts/sync-starter.js에 있다(npm run sync:starter와 같은 코드).
#       여기에 cp 줄을 다시 적지 않는다 — 두 벌이 되면 한쪽에만 파일이 늘어난다.
#       기본 명령은 로컬 생성물만 갱신한다. 원격 push는 명시적 --push에서만 실행한다.
if [ "$PUSH_REMOTE" != true ]; then
  node "$GUIDE_DIR/scripts/sync-starter.js"
  exit 0
fi
node "$GUIDE_DIR/scripts/sync-starter.js" --before-push
echo ""

# 7. iux-pub/starter 원격 저장소로 push (개발팀 clone 대상)
#    작업 사본 위치는 STARTER_SYNC_DIR 로 바꿀 수 있다(기본 /tmp/starter-sync).
#    DRY_RUN=1 이면 빌드·검사까지 하고 커밋·푸시 직전에 멈춘 뒤 변경 요약만 보여 준다.
STARTER_REPO="${STARTER_SYNC_DIR:-/tmp/starter-sync}"
echo "[8/8] iux-pub/starter 원격 저장소 동기화..."
rm -rf "$STARTER_REPO"
git clone https://github.com/iux-pub/starter.git "$STARTER_REPO" 2>&1 | tail -3

# 기존 내용 모두 제거 후 새로 복사 (.git 제외)
find "$STARTER_REPO" -mindepth 1 -maxdepth 1 ! -name '.git' -exec rm -rf {} + 2>/dev/null
cp -R "$STARTER_DIR/." "$STARTER_REPO/"

# 7.5. dist/ 는 커밋 대상이다 — npm 을 안 쓰는 수동 개발자에게 완성 CSS를 함께 전달하기 위함.
#      guide 저장소는 루트 .gitignore 가 dist/ 를 무시하므로 starter/ 사본에는 dist 가 없다.
#      위에서 기존 내용을 모두 지웠으니 여기서 다시 만들지 않으면 원격의 dist 가 사라진다.
#      starter 자체로 설치·빌드·검사가 돌아야 개발팀이 clone 해서 바로 쓸 수 있으므로
#      이 단계가 실패하면 푸시하지 않는다(set -e).
echo "[8/8] starter 작업 사본에서 설치·빌드·검사..."
(
  cd "$STARTER_REPO"
  if [ -f package-lock.json ]; then npm ci --no-audit --no-fund 2>&1 | tail -2; else npm install --no-audit --no-fund 2>&1 | tail -2; fi
  npm run build 2>&1 | tail -3
  npm run check 2>&1 | tail -8
)
[ -f "$STARTER_REPO/dist/css/style.css" ] || { echo "dist/css/style.css 가 만들어지지 않았다 — 푸시를 중단한다"; exit 1; }

cd "$STARTER_REPO"
git add -A 2>&1 | tail -3
if git diff --cached --quiet; then
  echo "  변경 없음 — 이미 최신"
elif [ "${DRY_RUN:-}" = "1" ]; then
  echo "  DRY_RUN=1 — 커밋·푸시하지 않는다. 변경 요약:"
  git diff --cached --stat | tail -4
  git diff --cached --name-status | awk '{print $1}' | sort | uniq -c | sed 's/^/    /'
  echo "  dist/css/style.css: $(git diff --cached --name-status -- dist/css/style.css | awk '{print $1}')"
else
  GUIDE_SHA="$(git -C "$GUIDE_DIR" rev-parse --short HEAD)"
  git commit -m "sync: KRDS + Tailwind v4 시스템 동기화 (guide repo ${GUIDE_SHA}에서)" 2>&1 | tail -3
  git push 2>&1 | tail -3
  echo "  ✓ iux-pub/starter 푸시 완료"
fi

cd "$GUIDE_DIR"
[ "${DRY_RUN:-}" = "1" ] || rm -rf "$STARTER_REPO"

echo ""
echo "=== 완료 ==="
echo "개발팀이 시작할 때:"
echo "  git clone https://github.com/iux-pub/starter.git my-project"
echo "  cd my-project && npm install && npm run build"
