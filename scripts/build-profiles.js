#!/usr/bin/env node
/**
 * 사이트 유형 프리셋 → 문서 표 생성
 *
 * `contracts/profiles.json`이 단일 원본이다. 산문 문서의 표를 손으로도 고칠 수
 * 있게 두면 기계가 읽는 값과 사람이 읽는 값이 갈라진다. 표만 이 스크립트가
 * 덮어쓰고 나머지 산문은 손대지 않는다.
 *
 * 입력:  contracts/profiles.json
 * 출력:  references/project-profiles.md (마커 사이 구간만)
 *
 * 사용법: node scripts/build-profiles.js
 */

const fs = require('node:fs')
const path = require('node:path')

const ROOT = path.resolve(__dirname, '..')
const SOURCE = path.join(ROOT, 'contracts', 'profiles.json')
const TARGET = path.join(ROOT, 'references', 'project-profiles.md')

const BEGIN = '<!-- profiles:begin — contracts/profiles.json에서 자동 생성. 직접 수정 금지. npm run build:profiles -->'
const END = '<!-- profiles:end -->'

const spec = JSON.parse(fs.readFileSync(SOURCE, 'utf8'))

function flow(profile) {
  const main = profile.sectionFlow.map(s => `\`section--${s}\``).join(' → ')
  if (!profile.sectionFlowAlt) return main
  return `${main}<br>또는 ${profile.sectionFlowAlt.map(s => `\`section--${s}\``).join(' → ')}`
}

const lines = []
const w = (s) => lines.push(s)

w(BEGIN)
w('')
w('## 사이트 유형')
w('')
w('| 유형 | id | 적용 대상 | 기본 생성 | 정부 아이덴티티 |')
w('|------|----|-----------|-----------|-----------------|')
for (const p of spec.profiles) {
  const identity = p.governmentIdentity === 'excluded' ? '제외' : '조건부 — 과업·기관 정책 확인 시만'
  w(`| ${p.label} | \`${p.id}\` | ${p.appliesTo} | ${p.focus} | ${identity} |`)
}
w('')
w('## 유형별 Page Shell')
w('')
w('사이트 유형 판정은 HTML 구조 선택으로 이어져야 한다. 정부/공공 아이덴티티 요소는 조건부 생성 항목이며 아래 shell에 기본 포함하지 않는다.')
w('')
w('| 유형 | 기본 section 흐름 | 우선 컴포넌트 | 밀도 | 표현 등급 |')
w('|------|-------------------|---------------|------|-----------|')
for (const p of spec.profiles) {
  const density = spec.density[p.density]
  const expression = spec.expressionLevels[p.expression]
  w(`| ${p.label} | ${flow(p)} | ${p.priorityComponents.join(', ')} | ${density.label} | ${expression.label} |`)
}
w('')
w('## 밀도 기준')
w('')
w('간격은 토큰이 아니라 직접값이다. 아래는 유형별 출발점이며, 프로젝트 맥락에서 조정할 수 있다.')
w('')
w('| 밀도 | section 패딩 (PC / 모바일) | 폼 행 간격 | 표 셀 패딩 | 기준 |')
w('|------|---------------------------|------------|------------|------|')
for (const [, d] of Object.entries(spec.density)) {
  w(`| ${d.label} | ${d.sectionPaddingPc} / ${d.sectionPaddingMobile} | ${d.formRowGap} | ${d.tableCellPadding} | ${d.note} |`)
}
w('')
w('## 표현 등급 기준')
w('')
w('등급은 상한이지 목표가 아니다. 아래는 유형별 기본값이며, task contract의 expression 필드로 덮어쓸 수 있다.')
w('모션 수치는 장식·스크롤 진입 모션 한정이다. 컴포넌트 피드백 모션(모달·토스트·인풋 전환)은 interaction-timing.md 소유로 등급 무관이다.')
w('')
w('| 등급 | 정의 | hero | 시그니처 | 모션 | 제목 폰트 | 레이아웃 |')
w('|------|------|------|----------|------|-----------|----------|')
for (const [id, level] of Object.entries(spec.expressionLevels)) {
  const signature = level.signature.maxCount === 0
    ? '없음'
    : `최대 ${level.signature.maxCount} — ${level.signature.types.join(', ')}`
  const motion = `${level.motion.effects.join(', ')} · ${level.motion.durationMs[0]}~${level.motion.durationMs[1]}ms`
  w(`| ${level.label} (\`${id}\`) | ${level.definition} | ${level.hero.join(', ')} | ${signature} | ${motion} | ${level.displayFont} | ${level.layout} |`)
}
w('')
for (const [, level] of Object.entries(spec.expressionLevels)) {
  w(`- **${level.label}** — ${level.note}`)
}
w('')
w('## 조건부 생성')
w('')
w('| 항목 | 생성 조건 | 생성하지 않는 경우 |')
w('|------|-----------|--------------------|')
for (const c of spec.conditional) {
  w(`| ${c.item} | ${c.generateWhen} | ${c.skipWhen} |`)
}
w('')
w('## 유형별 주의')
w('')
for (const p of spec.profiles) {
  w(`- **${p.label}** — ${p.note}`)
}
w('')
w(END)

const generated = lines.join('\n')
const current = fs.readFileSync(TARGET, 'utf8')

if (!current.includes(BEGIN) || !current.includes(END)) {
  throw new Error(
    `${path.relative(ROOT, TARGET)}에 마커가 없다.\n` +
    `  ${BEGIN}\n  ${END}\n  두 줄 사이에 표가 들어간다.`
  )
}

const before = current.slice(0, current.indexOf(BEGIN))
const after = current.slice(current.indexOf(END) + END.length)
fs.writeFileSync(TARGET, before + generated + after)

console.log(`✓ references/project-profiles.md — 프로필 ${spec.profiles.length}종, 표현 등급 ${Object.keys(spec.expressionLevels).length}종, 조건부 ${spec.conditional.length}건`)
