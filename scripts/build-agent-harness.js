#!/usr/bin/env node

const fs = require('node:fs')
const path = require('node:path')

const ROOT = path.resolve(__dirname, '..')
const SOURCE_DIR = path.join(ROOT, '.agents', 'skills')
const CLAUDE_DIR = path.join(ROOT, '.claude', 'skills')

if (!fs.existsSync(SOURCE_DIR)) {
  console.error('[build-agent-harness] .agents/skills 원본이 없습니다.')
  process.exit(1)
}

fs.rmSync(CLAUDE_DIR, { recursive: true, force: true })
fs.cpSync(SOURCE_DIR, CLAUDE_DIR, { recursive: true })

const skills = fs.readdirSync(SOURCE_DIR, { withFileTypes: true })
  .filter(entry => entry.isDirectory())
  .map(entry => entry.name)
  .sort()

console.log(`✓ Claude 스킬 ${skills.length}개 동기화: ${skills.join(', ')}`)
