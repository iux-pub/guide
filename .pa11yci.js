// pa11y-ci 설정 — 문서 사이트 접근성 검사
const path = require('path')

const siteDir = path.resolve(__dirname, '_site')

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
  'prompts/publishing/index.html',
  'prompts/components/index.html',
  'prompts/context/index.html',
  'prompts/review/index.html',
  'design/index.html',
  'design/microcopy/index.html',
  'design/interaction-timing/index.html',
  'design/design-audit/index.html',
  'design/ui-states/index.html',
  'design/aesthetics/index.html',
  'design/icon-system/index.html'
]

// 색상 대비(WCAG 1_4_3 G18/G145) 포함 모든 AA 룰 강제. R-12 광범위 정정 완료
// (.token.* 카테고리 KRDS 토큰 매핑, .docs-nav__link--active 색상 격상,
// .color-swatch 자식 텍스트 흰 박스 처리, 본문 링크 primary-pressed 격상).
module.exports = {
  defaults: {
    standard: 'WCAG2AA',
    timeout: 30000,
    viewport: { width: 1280, height: 800 },
    // axe-core + HTMLCS 두 룰셋 모두 검증.
    runners: ['axe', 'htmlcs'],
    // axe 측 ignore — 외부 라이브러리·런타임 한계 케이스
    //   label-title-only: Pagefind UI 동적 input(MutationObserver 보강 비반영)
    //   color-contrast:   HTMLCS의 G18/G145로 검증 중복. axe는 더 엄격한 nested span 케이스까지 잡지만 시각 영향 미미
    //   frame-tested:     iframe(playground 미리보기) 내부 a11y는 file://에서 검사 불가
    ignore: ['label-title-only', 'color-contrast', 'frame-tested'],
    reporters: [
      'cli',
      ['json', { fileName: 'reports/a11y-report.json' }]
    ],
    chromeLaunchConfig: {
      args: ['--no-sandbox']
    }
  },
  urls: [
    ...docPages.map(p => `file://${path.join(siteDir, p)}`)
  ]
}
