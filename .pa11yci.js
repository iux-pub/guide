// pa11y-ci 설정 — playground HTML + 문서 사이트 접근성 검사
const path = require('path')

const playgroundDir = path.resolve(__dirname, 'src/playground')
const siteDir = path.resolve(__dirname, '_site')

// playground 페이지
const playgroundPages = [
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

// 문서 사이트 주요 페이지
const docPages = [
  'index.html',
  'tokens/index.html',
  'tokens/color/index.html',
  'conventions/index.html',
  'conventions/bem/index.html',
  'components/index.html',
  'components/btn/index.html',
  'accessibility/index.html',
  'accessibility/checklist/index.html',
  'testing/index.html',
  'testing/browser-testing/index.html',
  'testing/mobile-testing/index.html',
  'testing/css-regression/index.html',
  'governance/index.html',
  'governance/lifecycle/index.html',
  'governance/versioning/index.html',
  'governance/governance-process/index.html',
  'prompts/index.html',
  'prompts/design/index.html',
  'prompts/figma/index.html',
  'prompts/publishing/index.html',
  'prompts/components/index.html',
  'prompts/context/index.html',
  'prompts/review/index.html'
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
  urls: [
    ...playgroundPages.map(p => `file://${path.join(playgroundDir, p)}`),
    ...docPages.map(p => `file://${path.join(siteDir, p)}`)
  ]
}
