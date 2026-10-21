#!/usr/bin/env node
// CT-03 납품 게이트 — contentSources 없이 쓴 카피는 초안이다
//   node scripts/check-contract.js            개발 중: 경고만(실패하지 않는다). infoux.json이 없으면 건너뛴다
//   node scripts/check-contract.js --release  납품 전(npm run check:release): 아래가 남으면 실패한다
//     - infoux.json 없음, contentSources 비었거나 자리값
//     - 납품 페이지의 data-content-pending 자리 표기, '<!-- contentSources: … -->' 형식 예시 주석
//     - 규칙 예외(exceptions)의 형식 오류·만료
// 판독: scripts/lib/contract-exceptions.js, 납품 페이지 범위: scripts/lib/page-scope.js

const fs = require('fs')
const path = require('path')
const { readConfig, checkContentSources, checkExceptions } = require('./lib/contract-exceptions')

const ROOT = process.cwd()
const RELEASE = process.argv.includes('--release')
let errors = 0
let warnings = 0
const report = (severity, where, message) => {
  if (severity === 'error') { errors++; console.error(`[CT-03] ${where}\n  ${message}`) } else { warnings++; console.warn(`[CT-03] ${where}\n  ${message}`) }
}

let config
try {
  config = readConfig(ROOT)
} catch (e) {
  report('error', 'infoux.json', `읽지 못했다(${e.message}).`)
}

if (!config) {
  if (RELEASE && !errors) report('error', 'infoux.json', '프로젝트 계약이 없다 — create-infomind-ux --profile로 만들거나 profile·contentSources를 적는다.')
  else if (!errors) {
    console.log('infoux.json 없음 — 계약 검사를 건너뛴다(납품 전에는 npm run check:release).')
    process.exit(0)
  }
} else {
  for (const f of checkContentSources(config, ROOT, { release: RELEASE })) report(f.severity, 'infoux.json', f.message)
  for (const f of checkExceptions(config, { release: RELEASE })) report(f.severity, 'infoux.json', f.message)

  // 납품 페이지의 자리 표기 — 주석을 지운 뒤 요소의 data-content-pending만 본다
  let pages = []
  try {
    pages = require('./lib/page-scope').collectPageFiles(ROOT).files
  } catch (e) {
    if (e.code !== 'MODULE_NOT_FOUND') throw e
  }
  for (const file of pages) {
    const html = fs.readFileSync(file, 'utf8')
    const rel = path.relative(ROOT, file)
    const noComments = html.replace(/<!--[\s\S]*?-->/g, m => m.replace(/[^\n]/g, ' '))
    for (const m of noComments.matchAll(/<[a-z][\w-]*\b[^>]*\sdata-content-pending\b[^>]*>/gi)) {
      const line = html.slice(0, m.index).split('\n').length
      report(RELEASE ? 'error' : 'warn', `${rel}:${line}`, '자리 표기(data-content-pending)가 남아 있다 — 발주처 확인 문구로 바꾸고 속성을 지운다.')
    }
    if (RELEASE) {
      for (const m of html.matchAll(/<!--\s*contentSources\s*:/gi)) {
        const line = html.slice(0, m.index).split('\n').length
        report('error', `${rel}:${line}`, "형식 예시 주석('<!-- contentSources: … -->')이 남아 있다 — 실제 값으로 바꿨는지 확인하고 주석을 지운다.")
      }
    }
  }
}

if (errors) {
  console.error(`\n계약 검사 오류 ${errors}건${warnings ? `, 경고 ${warnings}건` : ''}`)
  process.exit(2)
}
console.log(warnings ? `계약 검사 경고 ${warnings}건(납품 전 npm run check:release로 확인)` : `✓ 계약 검사 통과${RELEASE ? ' (납품)' : ''}`)
