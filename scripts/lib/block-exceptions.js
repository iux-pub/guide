// 블록 예외 — 카탈로그에 등록된 블록의 스타일·마크업에 한해 규칙 위반을 통과시킨다.
//
// 단일 원본: src/blocks/<id>/block.json의 exceptions. 생성 대상: contracts/block-exceptions.json
//   (scripts/build-blocks.js가 만든다). 검사기는 계약 파일만 읽는다 — 프로젝트가 블록 폴더를 새로 만들어도
//   예외는 생기지 않는다. 계약 파일은 가이드가 소유하고 스타터로 그대로 간다(check-harness가 사본을 대조한다).
// 쓰는 곳: scripts/check-violations.js(CSS), scripts/check-html-structure.js(마크업), scripts/build-blocks.js
//
// 통과 조건(CSS) — 넷이 모두 맞아야 한다. 하나라도 어긋나면 위반을 그대로 보고한다.
//   ① 위반이 난 파일이 예외에 적힌 블록 스타일 파일이다
//   ② 규칙 id가 같다
//   ③ 위반이 난 줄을 감싼 규칙의 선택자 목록에 예외의 선택자가 있다
//   ④ 위반이 난 줄에 예외의 match 문자열이 그대로 있다 — 값을 바꾸면(더 큰 반경·더 긴 모션) 예외가 풀린다
// 통과 조건(마크업) — R-27 「직접 그린 인라인 svg」 경고에 한해, svg의 class에 예외에 적힌 클래스가 있다.
//
// 자가 면제를 막으려는 장치다. 예외를 늘리려면 블록 정본을 고쳐 가이드 저장소의 검토를 거친다.

const fs = require('node:fs')
const path = require('node:path')

const CONTRACT_FILE = 'contracts/block-exceptions.json'
const RULE_RE = /^R-\d{2}$/
const POLICY =
  '블록 예외의 기계용 정본. scripts/build-blocks.js가 src/blocks/<id>/block.json의 exceptions에서 만든다 — 직접 고치지 않는다. ' +
  '검사기(check-violations.js·check-html-structure.js)는 여기 적힌 「파일 + 규칙 + 선택자 + 값」이 모두 맞는 위반만 통과시키고, ' +
  '적용 건수를 검사 출력에 한 줄로 보인다. 여기 없는 위반은 블록 파일 안에서도 그대로 잡는다. ' +
  '프로젝트가 이 파일이나 블록 스타일을 고쳐 범위를 넓히지 않는다 — 필요한 표현은 UX팀에 블록 변형으로 요청한다.'

const toPosix = file => String(file).replace(/\\/g, '/').replace(/^\.?\//, '')
const squeeze = text => String(text).replace(/\s+/g, ' ').trim()

// ─── 형식 ──────────────────────────────────────────────

/**
 * block.json의 exceptions 한 건이 형식을 지키는지 본다. 문제를 글로 돌려준다.
 *   CSS 예외:    { rule, file, selector, match, reason, krds? }  — file은 그 블록의 styles 안에 있어야 한다
 *   마크업 예외: { rule: 'R-27', markup: 'svg.<class>', reason }
 */
function validateException(entry, styles = []) {
  const problems = []
  if (!entry || typeof entry !== 'object') return ['객체가 아니다']
  if (!RULE_RE.test(entry.rule || '')) problems.push('rule은 R-NN 형식이다')
  if (typeof entry.reason !== 'string' || entry.reason.trim().length < 10) problems.push('reason(왜 필요한지)을 한 문장 이상 적는다')
  if (entry.krds !== undefined && entry.krds !== 'pending' && entry.krds !== 'approved') problems.push('krds는 pending(운영자 승인 대기)·approved 중 하나다')
  if (entry.markup !== undefined) {
    if (entry.rule !== 'R-27') problems.push('마크업 예외는 R-27(인라인 svg)만 받는다')
    if (!/^svg\.[a-z][a-z0-9-]*$/.test(entry.markup)) problems.push('markup은 svg.<클래스> 형식이다')
    if (entry.file !== undefined || entry.selector !== undefined || entry.match !== undefined) problems.push('마크업 예외에는 file·selector·match를 적지 않는다')
    return problems
  }
  if (!styles.includes(entry.file)) problems.push('file은 이 블록의 styles에 등록된 파일이어야 한다')
  if (typeof entry.selector !== 'string' || !/^[.[]/.test(entry.selector.trim())) problems.push('selector(대상 선택자)를 적는다')
  if (typeof entry.match !== 'string' || entry.match.trim().length < 4) problems.push('match(위반 줄에 그대로 있는 값 문자열)를 적는다 — 값이 바뀌면 예외가 풀린다')
  return problems
}

/** 블록 목록의 exceptions가 모두 형식을 지키는지 본다 — 문제를 「src/blocks/<id>: exceptions[n] …」 줄로 돌려준다 */
function exceptionProblems(blocks) {
  return blocks.flatMap(block => (block.exceptions || []).flatMap((entry, i) =>
    validateException(entry, block.styles || []).map(p => `src/blocks/${block.id}: exceptions[${i}] ${p}`)))
}

/** 블록 목록(메타데이터)에서 계약 파일 내용을 만든다 — 순서는 블록 id, 적힌 순서 */
function buildContract(blocks) {
  const css = []
  const markup = []
  for (const block of [...blocks].sort((a, b) => a.id.localeCompare(b.id))) {
    for (const e of block.exceptions || []) {
      if (e.markup !== undefined) markup.push({ block: block.id, rule: e.rule, element: e.markup, reason: e.reason })
      else css.push({ block: block.id, rule: e.rule, file: e.file, selector: squeeze(e.selector), match: squeeze(e.match), reason: e.reason, ...(e.krds ? { krds: e.krds } : {}) })
    }
  }
  return { name: 'INFOUX Block Exceptions', version: '1.0.0', policy: POLICY, generated: 'scripts/build-blocks.js', css, markup }
}

/** 계약 파일을 읽는다. 없으면 빈 등록부 — 예외가 하나도 없는 것과 같다 */
function loadRegistry(root) {
  const file = path.join(root, CONTRACT_FILE)
  if (!fs.existsSync(file)) return { css: [], markup: [] }
  const data = JSON.parse(fs.readFileSync(file, 'utf8').replace(/^﻿/, ''))
  return { css: Array.isArray(data.css) ? data.css : [], markup: Array.isArray(data.markup) ? data.markup : [] }
}

// ─── CSS: 줄 → 선택자 ──────────────────────────────────

/**
 * CSS에서 그 줄(1부터)을 감싼 가장 안쪽 스타일 규칙의 선택자 목록을 돌려준다.
 * @media·@supports 같은 at-규칙은 건너뛴다. 규칙 밖이면 빈 배열.
 */
function selectorsAt(css, line) {
  const text = css.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '))
  const stack = []
  const blocks = []
  let lineNo = 1
  let prelude = ''
  let preludeLine = 1
  for (const ch of text) {
    if (ch === '{') {
      stack.push({ prelude: squeeze(prelude), start: preludeLine, end: null })
      prelude = ''
      preludeLine = lineNo
    } else if (ch === '}') {
      const block = stack.pop()
      if (block) { block.end = lineNo; blocks.push(block) }
      prelude = ''
      preludeLine = lineNo
    } else if (ch === ';') {
      prelude = ''
      preludeLine = lineNo
    } else {
      if (!prelude.trim() && ch.trim()) preludeLine = lineNo
      prelude += ch
    }
    if (ch === '\n') lineNo += 1
  }
  const inner = blocks
    .filter(b => !b.prelude.startsWith('@') && b.start <= line && line <= b.end)
    .sort((a, b) => (b.start - a.start) || (a.end - b.end))[0]
  return inner ? inner.prelude.split(',').map(squeeze).filter(Boolean) : []
}

/**
 * CSS 위반 한 건이 등록된 예외에 해당하면 그 예외를, 아니면 null을 돌려준다.
 *   relFile  프로젝트 루트 기준 경로(역슬래시도 받는다)   rule  'R-35'   line  위반 줄(1부터)   css  그 파일의 원문
 */
function matchCss(registry, relFile, rule, line, css) {
  if (!registry?.css?.length || !line || typeof css !== 'string') return null
  const file = toPosix(relFile)
  const candidates = registry.css.filter(e => e.file === file && e.rule === rule)
  if (!candidates.length) return null
  const lineText = squeeze(css.split('\n')[line - 1] || '')
  const selectors = selectorsAt(css, line)
  return candidates.find(e => selectors.includes(squeeze(e.selector)) && lineText.includes(squeeze(e.match))) || null
}

// ─── 마크업 ────────────────────────────────────────────

/**
 * 마크업 위반 한 건(R-27 「직접 그린 인라인 svg」)이 등록된 예외에 해당하면 그 예외를 돌려준다.
 *   code  위반 요소의 여는 태그 앞부분(검사기가 싣는 근거 조각)
 */
function matchMarkup(registry, rule, message, code) {
  if (!registry?.markup?.length || rule !== 'R-27' || !/직접 그린 인라인 svg/.test(message || '')) return null
  const m = /^<svg\b[^>]*\bclass="([^"]*)"/.exec(String(code || '').trim())
  if (!m) return null
  const classes = m[1].split(/\s+/)
  return registry.markup.find(e => e.rule === rule && classes.includes(e.element.replace(/^svg\./, ''))) || null
}

// ─── 적용 기록 ─────────────────────────────────────────

/** 적용한 예외를 모아 검사 출력 한 줄로 만든다. 하나도 없으면 빈 문자열 */
function summaryLine(applied) {
  if (!applied.length) return ''
  const byRule = new Map()
  for (const e of applied) byRule.set(e.rule, (byRule.get(e.rule) || 0) + 1)
  const rules = [...byRule].sort((a, b) => a[0].localeCompare(b[0])).map(([rule, n]) => `${rule} ${n}건`).join(' · ')
  const blocks = [...new Set(applied.map(e => e.block))].sort().join(', ')
  const pending = applied.filter(e => e.krds === 'pending').length
  return `블록 예외 ${applied.length}건 적용 — ${rules} (블록: ${blocks}${pending ? ` · KRDS 기준 밖·운영자 승인 대기 ${pending}건` : ''}) · 근거 ${CONTRACT_FILE}`
}

module.exports = { CONTRACT_FILE, validateException, exceptionProblems, buildContract, loadRegistry, selectorsAt, matchCss, matchMarkup, summaryLine }
