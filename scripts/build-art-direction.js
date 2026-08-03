#!/usr/bin/env node
/**
 * 아트 디렉션 정본 → 문서 표 생성
 *
 * `contracts/art-direction.json`이 단일 원본이다. 표현 등급 정의는
 * `contracts/profiles.json`, 팔레트 대표색은 `tokens/presets/*.json`에서 읽는다 —
 * 값을 문서에 복사해 두면 프리셋을 고칠 때 갈라진다. 마커 사이 구간만 이
 * 스크립트가 덮어쓰고 나머지 산문은 손대지 않는다.
 *
 * 입력:  contracts/art-direction.json + contracts/profiles.json + tokens/presets/*.json
 * 출력:  references/art-direction.md (마커 사이 구간만)
 *
 * 사용법: node scripts/build-art-direction.js
 */

const fs = require('node:fs')
const path = require('node:path')

const ROOT = path.resolve(__dirname, '..')
const SOURCE = path.join(ROOT, 'contracts', 'art-direction.json')
const PROFILES = path.join(ROOT, 'contracts', 'profiles.json')
const TARGET = path.join(ROOT, 'references', 'art-direction.md')

const spec = JSON.parse(fs.readFileSync(SOURCE, 'utf8'))
const profileSpec = JSON.parse(fs.readFileSync(PROFILES, 'utf8'))

/** 프리셋 파일에서 라이트 모드 50단계 대표색을 읽는다 — hex 정본은 프리셋이다. */
function representative(file) {
  const preset = JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'))
  const pick = group => preset.primitive.color.light[group]['50'].value
  return {
    primary: pick('primary'),
    secondary: pick('secondary'),
    point: pick('point'),
    pointException: preset.$meta?.preset?.pointException
  }
}

function renderExpression() {
  const lines = []
  lines.push('| 등급 | 정의 | hero | 시그니처 | 모션 | 제목 폰트 | 레이아웃 |')
  lines.push('|------|------|------|----------|------|-----------|----------|')
  for (const [id, level] of Object.entries(profileSpec.expressionLevels)) {
    const signature = level.signature.maxCount === 0
      ? '없음'
      : `최대 ${level.signature.maxCount} — ${level.signature.types.join(', ')}`
    const motion = `${level.motion.effects.join(', ')} · ${level.motion.durationMs[0]}~${level.motion.durationMs[1]}ms`
    lines.push(`| ${level.label} (\`${id}\`) | ${level.definition} | ${level.hero.join(', ')} | ${signature} | ${motion} | ${level.displayFont} | ${level.layout} |`)
  }
  lines.push('')
  lines.push('| 유형 | 기본 등급 | 타이포 후보 | 팔레트 후보 | 섹션 리듬 | 카피 톤 |')
  lines.push('|------|-----------|-------------|-------------|-----------|---------|')
  for (const p of profileSpec.profiles) {
    const map = spec.profiles[p.id]
    if (!map) throw new Error(`art-direction.json profiles에 "${p.id}"가 없다.`)
    const level = profileSpec.expressionLevels[p.expression]
    lines.push(`| ${p.label} (\`${p.id}\`) | ${level.label} (\`${p.expression}\`) | ${map.typography.join(', ')} | ${map.palettes.join(', ')} | ${map.rhythm} | ${map.copyTone} |`)
  }
  return lines.join('\n')
}

function renderHangul() {
  const h = spec.hangul
  const body = h.bodyLineHeight
  const heading = h.headingLineHeight
  const ls = h.headingLetterSpacing
  const w = h.weights
  const lines = []
  lines.push('| 항목 | 값 |')
  lines.push('|------|-----|')
  lines.push(`| word-break / overflow-wrap | \`${h.wordBreak}\` / \`${h.overflowWrap}\` |`)
  lines.push(`| 본문 line-height | ${body.min}~${body.max} (기본 ${body.default}, 고밀도 기본 ${body.compactDefault}, lint 하한 ${body.lintFloor}) |`)
  lines.push(`| 제목 line-height | ${heading.min}~${heading.max} |`)
  lines.push(`| 제목 letter-spacing | ${ls.min}~${ls.max} (${ls.appliesFromRem}rem 이상부터) |`)
  lines.push(`| 제목 최대 줄수 | ${h.headingMaxLines} |`)
  lines.push(`| weight | 본문 기본 ${w.bodyBase} · 인라인 강조 상한 ${w.bodyEmphasisMax} · 제목 상한 ${w.headingMax} · 화면당 ${w.maxPerScreen}종 이하 |`)
  lines.push('')
  lines.push(`> ${h.note}`)
  return lines.join('\n')
}

function renderTypography() {
  const lines = []
  lines.push('| id | 라벨 | 무드 | 제목 | 본문 | 등급 | 라이선스 | 파일 |')
  lines.push('|----|------|------|------|------|------|----------|------|')
  for (const entry of spec.typography) {
    const heading = `\`${entry.heading.stack}\` ${entry.heading.weights.join('/')} · ls ${entry.heading.letterSpacing} · lh ${entry.heading.lineHeight}`
    const body = `${entry.body.weights.join('/')} · lh ${entry.body.lineHeight}`
    const licenses = [...new Set(entry.fonts.map(f => f.license.type))].join(', ')
    const pending = entry.fonts.some(f => f.sha256 === '입수 대기')
    const files = `${entry.fonts.reduce((n, f) => n + f.files.length, 0)}건 ${pending ? '입수 대기' : '입수 완료'}`
    lines.push(`| \`${entry.id}\` | ${entry.label} | ${entry.mood.join('·')} | ${heading} | ${body} | ${entry.expression.join(', ')} | ${licenses} | ${files} |`)
  }
  lines.push('')
  for (const entry of spec.typography) {
    for (const caution of entry.cautions) {
      lines.push(`- **${entry.id}** [${caution.severity}] ${caution.text}`)
    }
  }
  return lines.join('\n')
}

function renderPalettes() {
  const lines = []
  lines.push('| id | 라벨 | 무드 | primary 50 | secondary 50 | point 50 | 등급 | 프로필 |')
  lines.push('|----|------|------|------------|--------------|----------|------|--------|')
  const exceptions = []
  for (const palette of spec.palettes) {
    const rep = representative(palette.file)
    lines.push(`| \`${palette.id}\` | ${palette.label} | ${palette.mood} | \`${rep.primary}\` | \`${rep.secondary}\` | \`${rep.point}\` | ${palette.expression.join(', ')} | ${palette.profiles.join(', ')} |`)
    if (rep.pointException) {
      exceptions.push(`- **${palette.id}** — \`pointException: ${rep.pointException}\` — 용법 제한은 아래 산문 참조.`)
    }
  }
  if (exceptions.length > 0) {
    lines.push('', ...exceptions)
  }
  return lines.join('\n')
}

const SECTIONS = [
  { id: 'expression', render: renderExpression },
  { id: 'hangul', render: renderHangul },
  { id: 'typography', render: renderTypography },
  { id: 'palettes', render: renderPalettes }
]

let content = fs.readFileSync(TARGET, 'utf8')

for (const section of SECTIONS) {
  const beginRe = new RegExp(`<!-- art-direction:${section.id}:begin[^>]*-->`)
  const endMarker = `<!-- art-direction:${section.id}:end -->`
  const beginMatch = content.match(beginRe)
  if (!beginMatch || !content.includes(endMarker)) {
    throw new Error(
      `${path.relative(ROOT, TARGET)}에 ${section.id} 마커가 없다.\n` +
      `  <!-- art-direction:${section.id}:begin ... -->\n  ${endMarker}\n  두 줄 사이에 표가 들어간다.`
    )
  }
  const begin = beginMatch[0]
  const before = content.slice(0, content.indexOf(begin) + begin.length)
  const after = content.slice(content.indexOf(endMarker))
  content = `${before}\n${section.render()}\n${after}`
}

fs.writeFileSync(TARGET, content)

console.log(
  `✓ references/art-direction.md — 타이포 ${spec.typography.length}쌍, 팔레트 ${spec.palettes.length}종, ` +
  `프로필 매핑 ${Object.keys(spec.profiles).length}건`
)
