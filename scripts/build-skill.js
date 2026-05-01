/**
 * info-design 스킬 빌더
 *
 * 입력:
 *   tokens/krds-base.json + tokens/infomind-overrides.json
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

const ROOT = path.resolve(__dirname, '..')
const KRDS_PATH = path.join(ROOT, 'tokens', 'krds-base.json')
const OVERRIDES_PATH = path.join(ROOT, 'tokens', 'infomind-overrides.json')
const SNIPPETS_DIR = path.join(ROOT, 'src', 'snippets')
const COMPONENTS_DIR = path.join(ROOT, 'src', 'styles', '6-components')
const SKILL_REFS_DIR = path.join(ROOT, 'skill', 'references')

if (!fs.existsSync(SKILL_REFS_DIR)) fs.mkdirSync(SKILL_REFS_DIR, { recursive: true })

const krds = JSON.parse(fs.readFileSync(KRDS_PATH, 'utf-8'))
const overrides = JSON.parse(fs.readFileSync(OVERRIDES_PATH, 'utf-8'))

// ─────────────────────────────────────────────────────
// 1. krds-tokens.md — 토큰 카탈로그
// ─────────────────────────────────────────────────────

function buildKrdsTokensMd() {
  const lines = []
  const w = (s) => lines.push(s)

  w('# KRDS 토큰 카탈로그')
  w('')
  w('> 자동 생성됨. 직접 수정 금지.')
  w('> 출처: `tokens/krds-base.json` (KRDS-uiux v1.0.0) + `tokens/infomind-overrides.json`')
  w('> 빌드 일시: ' + new Date().toISOString())
  w('')
  w('이 문서의 토큰만 사용해야 한다. 임의 hex/px/rem 작성은 금지.')
  w('')
  w('---')
  w('')

  // 색상 — Primary
  w('## 색상')
  w('')
  w('### Primary (브랜드 / 액션 강조)')
  w('')
  w('| 단계 | 토큰 | hex |')
  w('|------|------|-----|')
  for (const [stage, t] of Object.entries(krds.primitive.color.light.primary)) {
    w(`| ${stage} | \`--krds-light-color-primary-${stage}\` | \`${t.value}\` |`)
  }
  w('')
  w('**시맨틱 별칭**: `--color-primary` = primary-50 / `--color-primary-hover` = 60 / `--color-primary-pressed` = 70')
  w('')

  // Gray
  w('### Gray (무채색 — 텍스트/배경/보더)')
  w('')
  w('| 단계 | 토큰 | hex |')
  w('|------|------|-----|')
  for (const [stage, t] of Object.entries(krds.primitive.color.light.gray)) {
    w(`| ${stage} | \`--krds-light-color-gray-${stage}\` | \`${t.value}\` |`)
  }
  w('')

  // Semantic colors
  for (const cat of ['danger', 'warning', 'success', 'information', 'point']) {
    if (!krds.primitive.color.light[cat]) continue
    const labelMap = { danger: 'Danger (오류/삭제)', warning: 'Warning (경고)', success: 'Success (성공)', information: 'Information (정보)', point: 'Point (강조 — 빨강)' }
    w(`### ${labelMap[cat]}`)
    w('')
    w('| 단계 | 토큰 | hex |')
    w('|------|------|-----|')
    for (const [stage, t] of Object.entries(krds.primitive.color.light[cat])) {
      w(`| ${stage} | \`--krds-light-color-${cat}-${stage}\` | \`${t.value}\` |`)
    }
    w('')
  }

  // 시맨틱 텍스트/배경/보더
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

  // 타이포그래피
  w('---')
  w('')
  w('## 타이포그래피')
  w('')
  w('### 폰트 패밀리')
  w('')
  w('- **`--font-sans`** = `\'Pretendard GOV\', \'Malgun Gothic\', \'apple sd gothic neo\', sans-serif`')
  w('- 직접 `font-family: ...` 작성 금지')
  w('')

  w('### 1rem = 10px 트릭 (KRDS 명시 채택)')
  w('')
  w('- `html { font-size: 62.5% }` 적용 → 1rem = 10px')
  w('- 모든 KRDS 토큰이 0.1rem 단위로 정의됨 (예: 1.6rem = 16px)')
  w('- `reset.css`에서 자동 처리. 제거하면 시스템 깨짐')
  w('')

  w('### 폰트 사이즈 — KRDS 스케일 (PC 기준, Mobile 자동 분기)')
  w('')
  // PC 폰트
  if (krds['responsive-pc'] && krds['responsive-pc']['font-size']) {
    w('| 카테고리 | 토큰 | PC | Mobile (자동) |')
    w('|---------|------|-----|---------------|')
    for (const [cat, sizes] of Object.entries(krds['responsive-pc']['font-size'])) {
      for (const [sz, t] of Object.entries(sizes)) {
        if (typeof t !== 'object' || !('value' in t)) continue
        const pcVal = t.value
        const mobVal = krds['responsive-mobile']?.['font-size']?.[cat]?.[sz]?.value || pcVal
        w(`| ${cat}-${sz} | \`--text-${cat}-${sz}\` | ${pcVal} | ${mobVal} |`)
      }
    }
  }
  w('')

  w('### 폰트 두께')
  w('')
  w('- `--font-weight-regular` (400) — 본문')
  w('- `--font-weight-bold` (700) — 강조/제목')
  w('- KRDS는 medium/semibold를 정의하지 않는다. 사용 시 가독성·접근성 위해 두께 선택은 위 둘로 한정.')
  w('')

  w('### line-height')
  w('')
  w('- 기본: 1.5 (150%) — KRDS 접근성 강제 최소값')
  w('- 모든 KRDS 텍스트 토큰이 1.5로 통일')
  w('')

  // 간격
  w('---')
  w('')
  w('## 간격 (Spacing)')
  w('')
  w('### Number primitive (1rem = 10px 베이스)')
  w('')
  w('| 토큰 | rem | px |')
  w('|------|-----|-----|')
  if (krds.primitive.number) {
    for (const [k, t] of Object.entries(krds.primitive.number)) {
      const px = t.value === '0' || t.value === '0rem' ? '0' : (parseFloat(t.value) * 10).toFixed(0)
      w(`| \`--krds-number-${k}\` (= \`--spacing-${k}\`) | ${t.value} | ${px} |`)
    }
  }
  w('')

  w('### Semantic — gap (요소 간 간격)')
  w('')
  if (krds.semantic.gap) {
    w('| 토큰 | 참조 | px |')
    w('|------|------|-----|')
    for (const [k, t] of Object.entries(krds.semantic.gap)) {
      if (typeof t !== 'object' || !('value' in t)) continue
      const ref = t.value.match(/\{primitive\.number\.(\w+)\}/)
      const refKey = ref ? ref[1] : '?'
      const refToken = krds.primitive.number[refKey]
      const px = refToken ? (parseFloat(refToken.value) * 10).toFixed(0) : '?'
      w(`| \`--krds-gap-${k}\` | number-${refKey} | ${px} |`)
    }
  }
  w('')

  w('### Semantic — padding (입력박스 안 패딩 등)')
  w('')
  if (krds.semantic.padding) {
    w('| 토큰 | 참조 | px |')
    w('|------|------|-----|')
    for (const [k, t] of Object.entries(krds.semantic.padding)) {
      if (typeof t !== 'object' || !('value' in t)) continue
      const ref = t.value.match(/\{primitive\.number\.(\w+)\}/)
      const refKey = ref ? ref[1] : '?'
      const refToken = krds.primitive.number[refKey]
      const px = refToken ? (parseFloat(refToken.value) * 10).toFixed(0) : '?'
      w(`| \`--krds-padding-${k}\` | number-${refKey} | ${px} |`)
    }
  }
  w('')

  w('### Semantic — size-height (버튼/입력 등 컴포넌트 높이)')
  w('')
  if (krds.semantic['size-height']) {
    w('| 토큰 | 참조 | px |')
    w('|------|------|-----|')
    for (const [k, t] of Object.entries(krds.semantic['size-height'])) {
      if (typeof t !== 'object' || !('value' in t)) continue
      const ref = t.value.match(/\{primitive\.number\.(\w+)\}/)
      const refKey = ref ? ref[1] : '?'
      const refToken = krds.primitive.number[refKey]
      const px = refToken ? (parseFloat(refToken.value) * 10).toFixed(0) : '?'
      w(`| \`--krds-size-height-${k}\` | number-${refKey} | ${px} |`)
    }
  }
  w('')

  // Radius
  w('---')
  w('')
  w('## 반경 (Border Radius)')
  w('')
  if (krds.semantic.radius) {
    w('| 토큰 | 참조 | px | KRDS Shape 그룹 |')
    w('|------|------|-----|-------------------|')
    const shapeGroup = (k) => {
      if (k.startsWith('xsmall')) return 'Xsmall (인디케이터/배지)'
      if (k.startsWith('small')) return 'Small (체크박스/태그)'
      if (k.startsWith('medium')) return 'Medium (버튼/입력)'
      if (k.startsWith('large')) return 'Large (카드)'
      if (k.startsWith('xlarge')) return 'XLarge (모달)'
      if (k === 'max') return 'Max (pill)'
      return ''
    }
    for (const [k, t] of Object.entries(krds.semantic.radius)) {
      if (typeof t !== 'object' || !('value' in t)) continue
      const ref = t.value.match(/\{primitive\.number\.(\w+)\}/)
      const refKey = ref ? ref[1] : '?'
      const refToken = krds.primitive.number[refKey]
      const px = refToken ? (parseFloat(refToken.value) * 10).toFixed(0) : '?'
      w(`| \`--krds-radius-${k}\` | number-${refKey} | ${px} | ${shapeGroup(k)} |`)
    }
  }
  w('')

  // 그림자
  w('---')
  w('')
  w('## 그림자 (Elevation) — INFOMIND 추상 토큰')
  w('')
  w('| 토큰 | 용도 |')
  w('|------|------|')
  w('| `--shadow-1` | alert, banner, dropdown — subtle |')
  w('| `--shadow-2` | popover, help-panel, side-panel, tooltip — medium |')
  w('| `--shadow-3` | modal, dialog — deep |')
  w('')

  // z-index
  w('---')
  w('')
  w('## Z-index — INFOMIND 표준')
  w('')
  w('| 토큰 | 값 | 용도 |')
  w('|------|-----|------|')
  if (overrides['infomind-z-index']) {
    for (const [k, t] of Object.entries(overrides['infomind-z-index'])) {
      if (typeof t !== 'object' || !('value' in t)) continue
      w(`| \`--z-${k}\` | ${t.value} | ${k} |`)
    }
  }
  w('')

  // 모션
  w('---')
  w('')
  w('## 모션 — INFOMIND 표준')
  w('')
  w('### Duration')
  w('')
  if (overrides['infomind-motion']?.duration) {
    for (const [k, t] of Object.entries(overrides['infomind-motion'].duration)) {
      if (typeof t !== 'object' || !('value' in t)) continue
      w(`- \`--duration-${k}\` = ${t.value}${t.$comment ? ` (${t.$comment})` : ''}`)
    }
  }
  w('')
  w('### Easing')
  w('')
  if (overrides['infomind-motion']?.easing) {
    for (const [k, t] of Object.entries(overrides['infomind-motion'].easing)) {
      if (typeof t !== 'object' || !('value' in t)) continue
      w(`- \`--easing-${k}\` = \`${t.value}\`${t.$comment ? ` (${t.$comment})` : ''}`)
    }
  }
  w('')

  // 터치 영역
  w('---')
  w('')
  w('## 터치 영역 — INFOMIND 강제')
  w('')
  w('- **`--touch-target-min`** = 4.4rem (44px)')
  w('- 모바일 컨텍스트에서 모든 인터랙티브 요소의 최소 크기')
  w('- WCAG 2.1 AA 권장 충족')
  w('')

  // 브레이크포인트
  w('---')
  w('')
  w('## 반응형 브레이크포인트 (KRDS 정의 — 5단계)')
  w('')
  w('| 토큰 | 값 | 디바이스 |')
  w('|------|-----|----------|')
  w('| `--breakpoint-small` | 360px | 작은 모바일 |')
  w('| `--breakpoint-medium` | 768px | 태블릿 |')
  w('| `--breakpoint-large` | 1024px | 데스크탑 |')
  w('| `--breakpoint-xlarge` | 1280px | 큰 데스크탑 |')
  w('| `--breakpoint-xxlarge` | 1440px | 와이드 |')
  w('')
  w('Tailwind prefix: `small:` / `medium:` / `large:` / `xlarge:` / `xxlarge:`')
  w('')

  // 그리드
  w('---')
  w('')
  w('## 그리드 / 컨테이너')
  w('')
  w('- **콘텐츠 max-width**: 1200px (KRDS contents-size)')
  w('- **컨테이너 좌우 padding**: Mobile 16px / PC 24px')
  w('- **컬럼 (INFOMIND 결정)**: Mobile 4 / Tablet 8 / PC 12')
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
  w('> 빌드 일시: ' + new Date().toISOString())
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
