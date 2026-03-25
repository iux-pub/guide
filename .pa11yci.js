// pa11y-ci 설정 — playground HTML 접근성 검사
const path = require('path')

const playgroundDir = path.resolve(__dirname, 'src/playground')

const pages = [
  'index.html',
  'btn.html',
  'form.html',
  'card.html',
  'table.html',
  'modal.html',
  'tab.html',
  'pagination.html',
  'breadcrumb.html',
  'a11y-checklist.html'
]

module.exports = {
  defaults: {
    standard: 'WCAG2AA',
    timeout: 30000,
    viewport: { width: 1280, height: 800 },
    reporters: [
      'cli',
      ['json', { fileName: 'reports/a11y-report.json' }]
    ],
    chromeLaunchConfig: {
      args: ['--no-sandbox']
    }
  },
  urls: pages.map(p => `file://${path.join(playgroundDir, p)}`)
}
