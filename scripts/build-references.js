/**
 * info-design 스킬 빌더
 *
 * 입력:
 *   tokens/foundation.json
 *   tokens/build/tokens.css (이미 빌드되어 있어야 함)
 *   src/styles/6-components/*.css
 *   src/snippets/*.md
 *
 * 출력:
 *   references/krds-tokens.md     (자동 생성 — 토큰 카탈로그)
 *   references/krds-components.md (자동 생성 — 컴포넌트 카탈로그)
 *   references/class-naming.md    (마커 사이 표만 — 정본 contracts/class-naming.json, 나머지는 직접 작성)
 *
 * 직접 작성하는 파일 (이 스크립트는 건드리지 않음):
 *   references/CONTRACT.md
 *   references/forbidden-patterns.md
 *   references/accessibility.md
 *   references/tailwind-mapping.md
 *   references/guide-import.md
 *
 * 사용법: node scripts/build-references.js
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

// 빌드 버전 — git commit hash (같은 SHA = 같은 빌드 결과 보장)
// 작업 중 생성물을 커밋할 때 불필요한 -dirty diff가 남지 않도록 HEAD만 기록한다.
function buildVersion() {
  try {
    return execSync('git rev-parse --short HEAD', { cwd: __dirname + '/..' }).toString().trim()
  } catch {
    return 'unknown'
  }
}

const { loadTokenSource } = require('./lib/token-source')

const ROOT = path.resolve(__dirname, '..')
const SNIPPETS_DIR = path.join(ROOT, 'src', 'snippets')
const _COMPONENTS_DIR = path.join(ROOT, 'src', 'styles', '6-components')
const SKILL_REFS_DIR = path.join(ROOT, 'references')

if (!fs.existsSync(SKILL_REFS_DIR)) fs.mkdirSync(SKILL_REFS_DIR, { recursive: true })

// 스킬 카탈로그는 프로젝트가 실제로 보는 값을 실어야 한다 — foundation + brand 합성 결과.
const foundation = loadTokenSource(ROOT)

// ─────────────────────────────────────────────────────
// 1. krds-tokens.md — 토큰 카탈로그
// ─────────────────────────────────────────────────────

function buildKrdsTokensMd() {
  const lines = []
  const w = (s) => lines.push(s)

  w('# INFOUX 파운데이션 토큰 카탈로그')
  w('')
  w('> 자동 생성됨. 직접 수정 금지.')
  w('> 출처: `tokens/foundation.json` + `tokens/brand.json` (합성 결과)')
  w('> 빌드: ' + buildVersion())
  w('')
  w('색상, 기본 폰트, 브레이크포인트는 이 문서의 토큰을 사용한다. 임의 hex/rgb/hsl 색상 작성은 금지한다. 간격·크기·타이포 스케일·모션·z-index는 토큰 카탈로그 대상이 아니다 — 간격·크기·타이포는 rem 임의값(`p-[1.6rem]`, Tailwind 기본 스케일은 62.5% 루트에서 37.5% 작아 R-37 금지), 모션·z-index는 CSS 값이나 Tailwind 임의값(`duration-[200ms]`, `z-[1050]`)으로 작성한다.')
  w('')
  w('---')
  w('')

  w('## 색상')
  w('')
  w('### Primary (브랜드 / 액션 강조)')
  w('')
  w('| 단계 | 토큰 | hex |')
  w('|------|------|-----|')
  for (const [stage, t] of Object.entries(foundation.primitive.color.light.primary)) {
    w(`| ${stage} | \`--color-primary-${stage}\` | \`${t.value}\` |`)
  }
  w('')
  w('**시맨틱 별칭**: `--color-primary` = primary-50 / `--color-primary-hover` = 60 / `--color-primary-pressed` = 70')
  w('')

  w('### Gray (무채색 — 텍스트/배경/보더)')
  w('')
  w('| 단계 | 토큰 | hex |')
  w('|------|------|-----|')
  for (const [stage, t] of Object.entries(foundation.primitive.color.light.gray)) {
    w(`| ${stage} | \`--color-gray-${stage}\` | \`${t.value}\` |`)
  }
  w('')

  for (const cat of ['danger', 'warning', 'success', 'information', 'point']) {
    if (!foundation.primitive.color.light[cat]) continue
    const labelMap = { danger: 'Danger (오류/삭제)', warning: 'Warning (경고)', success: 'Success (성공)', information: 'Information (정보)', point: 'Point (강조 — 빨강)' }
    w(`### ${labelMap[cat]}`)
    w('')
    w('| 단계 | 토큰 | hex |')
    w('|------|------|-----|')
    // 단계 토큰의 실제 이름은 --color-<분류>-<단계> 이고 정보색의 분류는 information 이다.
    // 시맨틱 별칭(--color-info, --color-info-surface, --color-info-text)만 info 를 쓴다.
    for (const [stage, t] of Object.entries(foundation.primitive.color.light[cat])) {
      w(`| ${stage} | \`--color-${cat}-${stage}\` | \`${t.value}\` |`)
    }
    w('')
  }

  w('### 시맨틱 — 텍스트')
  w('')
  w('| 토큰 (시맨틱 별칭) | 참조 | 용도 |')
  w('|-------------------|------|------|')
  w('| `--color-text` | gray-90 | 본문 (기본) |')
  w('| `--color-text-bolder` | gray-95 | 가장 진한 텍스트 |')
  w('| `--color-text-subtle` | gray-70 | 보조 텍스트 |')
  w('| `--color-text-disabled` | gray-40 | 비활성 텍스트 |')
  w('| `--color-text-inverse` | gray-0 | 다크 배경 위 텍스트 |')
  w('| `--color-danger-text` | danger-60 | 오류 텍스트 |')
  w('| `--color-warning-text` | warning-60 | 경고 텍스트 |')
  w('| `--color-success-text` | success-60 | 성공 텍스트 |')
  w('| `--color-info-text` | information-60 | 정보 텍스트 |')
  w('')

  w('### 시맨틱 — 배경/표면')
  w('')
  w('| 토큰 | 참조 | 용도 |')
  w('|------|------|------|')
  w('| `--color-bg` | gray-0 | 페이지 기본 배경 (흰색) |')
  w('| `--color-bg-subtler` | gray-5 | 보조 배경 (헤더 띠 등) |')
  w('| `--color-bg-subtle` | gray-10 | 더 진한 보조 배경 |')
  w('| `--color-bg-inverse` | gray-90 | 다크 배경 |')
  w('| `--color-bg-dim` | alpha-black-75 | 모달 dim |')
  w('| `--color-surface` | gray-0 | 카드/패널 표면 |')
  w('| `--color-surface-subtler` | gray-5 | 보조 표면 |')
  w('| `--color-surface-disabled` | gray-20 | 비활성 표면 |')
  w('| `--color-danger-surface` | danger-5 | 오류 알림 배경 |')
  w('| `--color-warning-surface` | warning-5 | 경고 알림 배경 |')
  w('| `--color-success-surface` | success-5 | 성공 알림 배경 |')
  w('| `--color-info-surface` | information-5 | 정보 알림 배경 |')
  w('')

  w('### 시맨틱 — 보더')
  w('')
  w('| 토큰 | 참조 |')
  w('|------|------|')
  w('| `--color-border` | gray-30 (default) |')
  w('| `--color-border-light` | gray-20 |')
  w('| `--color-border-dark` | gray-60 (active hover) |')
  w('| `--color-border-primary` | primary-50 (focus) |')
  w('| `--color-border-disabled` | gray-30 |')
  w('')
  w('### 기본 폰트')
  w('')
  w('| 토큰 | 값 | 용도 |')
  w('|------|----|------|')
  w(`| \`--font-sans\` | \`${foundation.font.family.sans.value}\` | 본문/컴포넌트 기본 폰트 |`)
  w(`| \`--font-heading\` | \`${(foundation.font.family.heading ?? foundation.font.family.sans).value}\` | 제목 차등 서체 — brand에 heading 슬롯이 없으면 sans 값 폴백 |`)
  w(`| \`--font-mono\` | \`${foundation.font.family.mono.value}\` | 코드/고정폭 텍스트 |`)
  w('')
  w('### 브레이크포인트')
  w('')
  w('| 토큰 | 값 | 용도 | Tailwind variant |')
  w('|------|----|------|------------------|')
  w(`| \`--breakpoint-mobile\` | \`${foundation.breakpoint.mobile.value}\` | 모바일 기준 뷰포트 | \`mobile:\` |`)
  w(`| \`--breakpoint-tablet\` | \`${foundation.breakpoint.tablet.value}\` | 태블릿 이상 — 글자 크기 mobile→pc 전환 | \`tablet:\` |`)
  w(`| \`--breakpoint-laptop\` | \`${foundation.breakpoint.laptop.value}\` | 노트북 이상 — 메인 메뉴↔전체메뉴, 서브 LNB 2단, 레이아웃 간격 | \`laptop:\` |`)
  w(`| \`--breakpoint-pc\` | \`${foundation.breakpoint.pc.value}\` | PC 이상 | \`pc:\` |`)
  w('')
  w('---')
  w('')
  w('## 사용 원칙')
  w('')
  w('- 색상은 `--color-*` 시맨틱 토큰을 우선 사용한다.')
  w('- 단계 색상은 예외적으로 명도가 필요한 경우에만 `--color-{group}-{step}`을 사용한다.')
  w('- 폰트 패밀리는 `--font-sans`, `--font-heading`, `--font-mono`만 사용한다.')
  w('- 브레이크포인트는 KRDS 표준형 360 / 768 / 1024 / 1280 네 단계만 사용한다. 글자 크기의 mobile→pc 전환은 768, 메인 메뉴↔전체메뉴·서브 LNB 2단·레이아웃 간격 전환은 1024다.')
  w('- Tailwind 반응형 variant는 `mobile:` / `tablet:` / `laptop:` / `pc:`만 사용하고 `sm:` / `md:` / `lg:` / `xl:` / `2xl:`는 사용하지 않는다.')
  w('- 단순 반응형 속성 변경은 CSS 파일 내부에서도 `@apply tablet:*`, `@apply pc:*`를 우선 사용한다.')
  w('- 복잡한 중첩 선택자나 여러 하위 요소를 동시에 제어해야 할 때만 `@media`를 사용하고, 관련 선택자 내부에 중첩한다.')
  w('- 파일 하단에 브레이크포인트별 `@media` 블록을 몰아두지 않는다.')
  w('- 순수 CSS `@media (min-width: var(--breakpoint-*))`는 표준으로 쓰지 않는다. 직접 `@media`가 필요하면 `768px`, `1280px` 값을 명시한다.')
  w('- 간격, 크기, 타이포 스케일, 반경, 그림자, 모션, z-index는 토큰화하지 않는다.')
  w('- 해당 값들은 `@apply`의 Tailwind 유틸리티 또는 명확한 CSS 직접값으로 작성한다.')
  w('- `tokens/build/tokens.css`는 자동 생성물이므로 직접 수정하지 않는다.')
  w('')

  fs.writeFileSync(path.join(SKILL_REFS_DIR, 'krds-tokens.md'), lines.join('\n') + '\n')
  console.log(`✓ references/krds-tokens.md`)
}

// ─────────────────────────────────────────────────────
// 2. krds-components.md — 컴포넌트 카탈로그
// ─────────────────────────────────────────────────────

function buildKrdsComponentsMd() {
  const lines = []
  const w = (s) => lines.push(s)

  w('# KRDS 컴포넌트 카탈로그')
  w('')
  w('> 자동 생성됨. 직접 수정 금지.')
  w('> 출처: `src/snippets/*.md`')
  w('> 빌드: ' + buildVersion())
  w('')
  w('아래 카탈로그에 없는 컴포넌트는 임의 생성 금지. § "카탈로그에 없는 컴포넌트 요구 시" 절차 따름.')
  w('')
  w('---')
  w('')

  // 그룹 정의
  const groups = {
    'A — 폼/액션': ['btn', 'check-radio', 'file-upload', 'form', 'select', 'switch'],
    'B — 컨테이너/레이아웃': ['accordion', 'card', 'disclosure', 'modal', 'side-panel', 'tab'],
    'C — 내비게이션': ['breadcrumb', 'footer', 'header', 'main-menu', 'mobile-menu', 'pagination'],
    'D — 피드백': ['alert', 'badge', 'notice-bar', 'progress', 'spinner', 'step-indicator', 'tag', 'toast', 'tooltip'],
    'E — 콘텐츠/표현': ['calendar', 'carousel', 'error-page', 'icon', 'list', 'table']
  }

  // 인덱스
  w('## 인덱스')
  w('')
  for (const [groupName, comps] of Object.entries(groups)) {
    w(`- **그룹 ${groupName}**: ${comps.map(c => `[${c}](#${c})`).join(' · ')}`)
  }
  w('')
  w('---')
  w('')

  // 각 컴포넌트 — 스니펫 본문 임포트
  for (const [groupName, comps] of Object.entries(groups)) {
    w(`## 그룹 ${groupName}`)
    w('')
    for (const comp of comps) {
      const snippetPath = path.join(SNIPPETS_DIR, `${comp}.md`)
      if (!fs.existsSync(snippetPath)) {
        w(`### ${comp}`)
        w(`> 스니펫 파일 없음 (\`src/snippets/${comp}.md\`).`)
        w('')
        continue
      }
      const snippetContent = fs.readFileSync(snippetPath, 'utf-8')
      // 첫 H1을 H3으로 강등
      const adapted = snippetContent
        .replace(/^# (.+)$/m, `### $1 {#${comp}}`)
        .replace(/^## /gm, '#### ')
        .replace(/^### /gm, '##### ')
      w(adapted)
      w('')
      w('---')
      w('')
    }
  }

  fs.writeFileSync(path.join(SKILL_REFS_DIR, 'krds-components.md'), lines.join('\n') + '\n')
  console.log(`✓ references/krds-components.md`)
}

// ─────────────────────────────────────────────────────
// 실행
// ─────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────
// class-naming.md — contracts/class-naming.json의 표를 마커 사이에 채운다
// ─────────────────────────────────────────────────────

// 폐기 대상의 대체가 클래스면 .이름으로, 속성 조합(aria-current="page" 등)이면 그대로 적는다
function formatReplacement(replacement) {
  return /^[a-z][a-z0-9_-]*$/.test(replacement) ? `\`.${replacement}\`` : `\`${replacement}\``
}

// 계약 → 마커 사이 표. 파일을 쓰지 않는 순수 함수라 테스트가 현재 문서와 비교한다(손으로 고친 표가 남지 않게)
function renderClassNamingMd(spec, doc) {
  const vocabulary = [
    '| 축 | 어휘 | 근거 |',
    '|----|------|------|',
    ...spec.vocabulary.map(a => `| ${a.label} | ${a.words.map(w => `\`--${w}\``).join(' · ')} | ${a.source} |`),
    ...Object.entries(spec.blockModifiers || {}).map(([block, v]) => `| \`${block}\` 고유 | ${v.words.map(w => `\`--${w}\``).join(' · ')} | ${v.note} |`)
  ].join('\n')

  const forbidden = [
    `금지어(error): ${spec.forbiddenWords.map(w => `\`${w}\``).join(' · ')}`,
    '',
    '| 폐기 예정 | 대신 | 메모 |',
    '|-----------|------|------|',
    ...(spec.deprecated || []).map(d => `| \`.${d.class}\` | ${formatReplacement(d.replacement)} | ${d.note} |`)
  ].join('\n')

  const fileBlocks = [
    '| 컴포넌트 | 파일 | 블록 | 이유 |',
    '|----------|------|------|------|',
    ...spec.fileBlocks.map(f => `| \`${f.component}\` | \`${f.file}\` | ${f.blocks.map(b => `\`.${b}\``).join(' · ')} | ${f.why} |`),
    ...(spec.blockAliases || []).map(a => `| (오기) \`${a.alias}\` | — | \`.${a.block}\` | ${a.why} |`)
  ].join('\n')

  let out = doc
  for (const [id, body] of [['vocabulary', vocabulary], ['forbidden', forbidden], ['file-blocks', fileBlocks]]) {
    const re = new RegExp(`(<!-- class-naming:${id}:begin[^>]*-->)[\\s\\S]*?(<!-- class-naming:${id}:end -->)`)
    if (!re.test(out)) throw new Error(`references/class-naming.md에 class-naming:${id} 마커가 없다`)
    out = out.replace(re, `$1\n${body}\n$2`)
  }
  return out
}

function buildClassNamingMd() {
  const specPath = path.join(ROOT, 'contracts', 'class-naming.json')
  const target = path.join(SKILL_REFS_DIR, 'class-naming.md')
  if (!fs.existsSync(specPath) || !fs.existsSync(target)) return
  const spec = JSON.parse(fs.readFileSync(specPath, 'utf-8'))
  fs.writeFileSync(target, renderClassNamingMd(spec, fs.readFileSync(target, 'utf-8')))
  console.log('✓ references/class-naming.md — 어휘·금지어·파일 대응 표')
}

module.exports = { renderClassNamingMd }

if (require.main === module) {
  console.log('스킬 빌드 시작...')
  buildKrdsTokensMd()
  buildKrdsComponentsMd()
  buildClassNamingMd()
  console.log('완료. references/ 갱신본은 npm run build:mcp로 MCP 번들에 반영된다.')
  console.log('')
}
