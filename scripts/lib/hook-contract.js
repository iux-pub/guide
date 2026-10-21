// 편집 훅 설정 판정 — check-harness.js가 루트·스타터 × Claude·Codex 네 파일에 쓴다(HX-06)
//
// 금지 문자열만 보면 통과하는 결함이 있었다: 'cv; …; hs'처럼 마지막 명령의 종료 코드만 남는 셸 구조,
// jq가 없으면 조용히 exit 0. 그래서 PostToolUse 명령 목록이 정해진 목록과 정확히 같은지 본다.

const CANONICAL_HOOK_COMMANDS = ['node ./scripts/hooks/post-edit.js']

// raw: 훅 설정 파일 내용(JSON 문자열). 문제 목록을 돌려준다(빈 배열이면 통과)
function validateHookConfig(raw) {
  let parsed
  try {
    parsed = JSON.parse(raw)
  } catch (error) {
    return [`JSON 오류: ${error.message}`]
  }
  const problems = []
  const commands = (parsed?.hooks?.PostToolUse || []).flatMap(group => (group.hooks || []).map(h => h.command))
  if (JSON.stringify(commands) !== JSON.stringify(CANONICAL_HOOK_COMMANDS)) {
    problems.push(`PostToolUse 명령이 정해진 목록(${CANONICAL_HOOK_COMMANDS.join(', ')})과 다르다: ${JSON.stringify(commands)}`)
  }
  if (raw.includes('sync:starter')) problems.push('starter 동기화를 훅에서 자동 실행하면 안 된다')
  if (raw.includes('|| true') || raw.includes('2>/dev/null')) problems.push('검사 실패를 숨기고 있다(|| true, 2>/dev/null)')
  return problems
}

module.exports = { CANONICAL_HOOK_COMMANDS, validateHookConfig }
