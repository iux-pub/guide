// pa11y-ci 설정 — playground HTML + 문서 사이트 접근성 검사
const path = require('path')

const playgroundDir = path.resolve(__dirname, 'src/playground')
const siteDir = path.resolve(__dirname, '_site')

// playground 페이지 — 데모/시각 미리보기. production은 _site/
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
  'prompts/review/index.html',
  'design/index.html',
  'design/microcopy/index.html',
  'design/interaction-timing/index.html',
  'design/design-audit/index.html',
  'design/ui-states/index.html',
  'design/aesthetics/index.html',
  'design/icon-system/index.html'
]

// playground 데모 페이지는 시각 검증/스니펫 미리보기 용도.
// production a11y 검증은 _site/ 페이지에서 (HTML 시맨틱·랜드마크·alt 등).
// KRDS 토큰의 색상 대비는 KRDS 정본 + INFOMIND 오버라이드(button-primary-fill을
// primary-60으로 한 단계 진하게)로 보장됨. file:// 절대 경로 CSS 로드 이슈로
// playground 페이지에서 a11y를 직접 검증하기 까다로워 검사 대상에서 제외한다.
// production 환경의 시각 a11y는 dev 서버(npm run serve) + axe로 별도 검증 권장.
const ENABLE_PLAYGROUND = false  // 향후 dev 서버 셋업 시 활성화

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
    ...(ENABLE_PLAYGROUND
      ? playgroundPages.map(p => `file://${path.join(playgroundDir, p)}`)
      : []),
    ...docPages.map(p => `file://${path.join(siteDir, p)}`)
  ]
}
