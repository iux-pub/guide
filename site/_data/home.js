// 홈 화면 수치 — 소스에서 계산해 문서와 어긋나지 않게 한다.
// 손으로 적은 숫자는 규칙이나 컴포넌트가 늘 때마다 낡는다(홈이 규칙을 19개/18개로 제각각 적고 있었다).
const fs = require('node:fs')
const path = require('node:path')

const ROOT = path.resolve(__dirname, '..', '..')

// 컴포넌트 카탈로그 = site/components 의 개별 문서. 목록·템플릿·조합 안내는 제외한다
const NOT_COMPONENT = new Set(['index', 'boilerplate', 'combo-patterns'])

function countComponents() {
  return fs
    .readdirSync(path.join(ROOT, 'site', 'components'))
    .filter(name => name.endsWith('.md') && !NOT_COMPONENT.has(name.replace(/\.md$/, '')))
    .length
}

function countRules() {
  const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'rules.json'), 'utf8'))
  return (data.rules || data).length
}

function countProfiles() {
  const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'contracts', 'profiles.json'), 'utf8'))
  return data.profiles.length
}

module.exports = () => ({
  components: countComponents(),
  rules: countRules(),
  profiles: countProfiles()
})
