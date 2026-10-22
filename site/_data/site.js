// 사이트 공통 정보 — 버전은 package.json에서 읽는다.
// 손으로 적어 두면 릴리스 때 놓친다(4.0.0을 올리고도 메뉴가 v3.4.0을 보였다).
const { version } = require('../../package.json')

module.exports = {
  title: 'INFOMIND UX 가이드',
  description: '인포마인드 UX팀 디자인/퍼블리싱 가이드 시스템',
  version: `v${version}`,
  url: ''
}
