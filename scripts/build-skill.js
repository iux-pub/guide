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
 *   skill/references/krds-tokens.md     (자동 생성 — 토큰 카탈로그)
 *   skill/references/krds-components.md (자동 생성 — 컴포넌트 카탈로그)
 *
 * 직접 작성하는 파일 (이 스크립트는 건드리지 않음):
 *   skill/SKILL.md
 *   skill/references/forbidden-patterns.md
 *   skill/references/accessibility.md
 *   skill/references/tailwind-mapping.md
 *   skill/references/guide-import.md
 *
 * 사용법: node scripts/build-skill.js
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

// 빌드 버전 — git commit hash (같은 SHA = 같은 빌드 결과 보장)
// dirty 작업 트리는 -dirty 접미사. CI에선 깨끗한 체크아웃이라 SHA만 출력.
function buildVersion() {
  try {
    return execSync('git describe --always --dirty', { cwd: __dirname + '/..' }).toString().trim()
  } catch {
    return 'unknown'
  }
}

const ROOT = path.resolve(__dirname, '..')
const FOUNDATION_PATH = path.join(ROOT, 'tokens', 'foundation.json')
const SNIPPETS_DIR = path.join(ROOT, 'src', 'snippets')
// eslint-disable-next-line no-unused-vars
const _COMPONENTS_DIR = path.join(ROOT, 'src', 'styles', '6-components')
const SKILL_REFS_DIR = path.join(ROOT, 'skill', 'references')

if (!fs.existsSync(SKILL_REFS_DIR)) fs.mkdirSync(SKILL_REFS_DIR, { recursive: true })

const foundation = JSON.parse(fs.readFileSync(FOUNDATION_PATH, 'utf-8'))

// ─────────────────────────────────────────────────────
// 1. krds-tokens.md — 토큰 카탈로그
// ─────────────────────────────────────────────────────

function buildKrdsTokensMd() {
  const lines = []
  const w = (s) => lines.push(s)

  w('# INFOUX 파운데이션 토큰 카탈로그')
  w('')
  w('> 자동 생성됨. 직접 수정 금지.')
  w('> 출처: `tokens/foundation.json`')
  w('> 빌드: ' + buildVersion())
  w('')
  w('색상과 기본 폰트는 이 문서의 토큰을 사용한다. 임의 hex/rgb/hsl 색상 작성은 금지한다. 간격·크기·타이포 스케일·모션·z-index는 토큰 카탈로그 대상이 아니며 CSS/Tailwind 직접값으로 작성한다.')
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
    const tokenGroup = cat === 'information' ? 'info' : cat
    for (const [stage, t] of Object.entries(foundation.primitive.color.light[cat])) {
      w(`| ${stage} | \`--color-${tokenGroup}-${stage}\` | \`${t.value}\` |`)
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
  w(`| \`--font-mono\` | \`${foundation.font.family.mono.value}\` | 코드/고정폭 텍스트 |`)
  w('')
  w('---')
  w('')
  w('## 사용 원칙')
  w('')
  w('- 색상은 `--color-*` 시맨틱 토큰을 우선 사용한다.')
  w('- 단계 색상은 예외적으로 명도가 필요한 경우에만 `--color-{group}-{step}`을 사용한다.')
  w('- 폰트 패밀리는 `--font-sans`, `--font-mono`만 사용한다.')
  w('- 간격, 크기, 타이포 스케일, 반경, 그림자, 모션, z-index는 토큰화하지 않는다.')
  w('- 해당 값들은 `@apply`의 Tailwind 유틸리티 또는 명확한 CSS 직접값으로 작성한다.')
  w('- `tokens/build/tokens.css`는 자동 생성물이므로 직접 수정하지 않는다.')
  w('')

  fs.writeFileSync(path.join(SKILL_REFS_DIR, 'krds-tokens.md'), lines.join('\n') + '\n')
  console.log(`✓ skill/references/krds-tokens.md`)
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
    'C — 내비게이션': ['breadcrumb', 'header', 'main-menu', 'pagination'],
    'D — 피드백': ['alert', 'badge', 'progress', 'spinner', 'step-indicator', 'tag', 'toast', 'tooltip'],
    'E — 콘텐츠/표현': ['calendar', 'carousel', 'list', 'table']
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
  console.log(`✓ skill/references/krds-components.md`)
}

// ─────────────────────────────────────────────────────
// 실행
// ─────────────────────────────────────────────────────

console.log('스킬 빌드 시작...')
buildKrdsTokensMd()
buildKrdsComponentsMd()
console.log('완료. skill/ 폴더 검토 후 ~/.claude/skills/info-design/ 으로 배포하세요.')
console.log('')
console.log('배포 명령:')
console.log('  rsync -av --delete skill/ ~/.claude/skills/info-design/')
