// Eleventy ESM 설정 -- INFOMIND UX 가이드 문서 사이트
import syntaxHighlight from '@11ty/eleventy-plugin-syntaxhighlight'
import { HtmlBasePlugin } from '@11ty/eleventy'
import fs from 'node:fs'
import path from 'node:path'

export default function(eleventyConfig) {
  // 코드 하이라이팅 플러그인
  eleventyConfig.addPlugin(syntaxHighlight)

  // HTML Base 플러그인 — 절대 URL(/dist/css/...)을 페이지 깊이별 상대 경로로 자동 변환.
  // file:// 프로토콜에서도 CSS/JS가 정상 로드되어 빌드된 _site/를 직접 열거나
  // pa11y-ci로 시각 a11y 검증할 수 있다.
  eleventyConfig.addPlugin(HtmlBasePlugin)

  // 자체 transformer: 절대 경로 href/src 를 페이지 깊이별 상대 경로로 변환.
  // (HtmlBasePlugin은 pathPrefix가 명시된 경우만 동작 — file:// 검증을 위해 직접 처리)
  eleventyConfig.addTransform('relativeAssets', function(content) {
    if (!this.page.outputPath || !this.page.outputPath.endsWith('.html')) return content
    // _site/ 기준 페이지 깊이 계산. 예: _site/components/btn/index.html → depth 2
    const rel = this.page.outputPath.replace(/^.*?_site\//, '')
    const depth = rel.split('/').length - 1
    const prefix = depth === 0 ? './' : '../'.repeat(depth)
    return content
      .replace(/(href|src)="\/(?!\/)([^"]*)"/g, (_, attr, path) => `${attr}="${prefix}${path}"`)
  })

  // 정적 자원 passthrough copy
  eleventyConfig.addPassthroughCopy('site/assets')
  // dist/css를 그대로 복사 -- 문서 사이트와 playground iframe 모두 /dist/css/ 경로 사용
  eleventyConfig.addPassthroughCopy({ 'dist/css': 'dist/css' }).addWatchTarget('dist/css/')
  eleventyConfig.addPassthroughCopy({ 'src/playground': 'playground' })
  eleventyConfig.addPassthroughCopy({ 'node_modules/clipboard/dist/clipboard.min.js': 'assets/js/clipboard.min.js' })

  // 동일 섹션 내 이전/다음 페이지 필터
  eleventyConfig.addFilter('prevNextInSection', (pageUrl, navigation) => {
    if (!navigation || !navigation.sections) return { prev: null, next: null }
    for (const section of navigation.sections) {
      const items = section.items || []
      const idx = items.findIndex(item => item.url === pageUrl)
      if (idx !== -1) {
        return {
          prev: idx > 0 ? items[idx - 1] : null,
          next: idx < items.length - 1 ? items[idx + 1] : null
        }
      }
    }
    return { prev: null, next: null }
  })

  // pagefind 빌드 후 인덱싱
  eleventyConfig.on('eleventy.after', async () => {
    const { execSync } = await import('child_process')
    execSync('npx -y pagefind --site _site --glob "**/*.html"', {
      stdio: 'inherit'
    })
  })

  // ─── llms.txt 발행 ───────────────────────────────────
  // 문서를 사람용 HTML과 AI용 텍스트 두 형태로 낸다. "문서만 공개" 결정에 따라
  // 발주처·협력사 AI가 우리 기준을 읽고 코드를 짜게 하는 경로다(2026-07-29).

  /** 섹션별로 문서를 묶는다. 섹션 키는 각 디렉토리 데이터 파일의 `section`이다. */
  eleventyConfig.addCollection('llmSections', (collectionApi) => {
    const bySection = new Map()

    for (const item of collectionApi.getAll()) {
      const section = item.data.section
      // 섹션이 없는 것(홈 등)과 HTML이 아닌 산출물은 제외한다.
      if (typeof section !== 'string' || !item.outputPath || !item.outputPath.endsWith('.html')) continue
      if (!bySection.has(section)) bySection.set(section, [])
      bySection.get(section).push(item)
    }

    return [...bySection.entries()]
      .map(([key, pages]) => ({
        key,
        pages: pages.sort((a, b) =>
          (a.data.order ?? 99) - (b.data.order ?? 99) ||
          String(a.data.title).localeCompare(String(b.data.title)))
      }))
      .sort((a, b) => a.key.localeCompare(b.key))
  })

  /**
   * 페이지 원본 마크다운을 프론트매터 없이 돌려준다.
   * 렌더된 HTML을 주면 LLM이 태그를 걷어내야 해서 손해다.
   */
  eleventyConfig.addFilter('sourceBody', (inputPath) => {
    if (!inputPath) return ''
    const filePath = path.resolve(inputPath)
    if (!fs.existsSync(filePath)) return ''
    return fs.readFileSync(filePath, 'utf8')
      .replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '')
      .trim()
  })

  /**
   * 원본 본문에서 맨 앞 h1을 뺀다.
   * 사이트 페이지는 레이아웃이 프론트매터 title로 h1을 이미 그리므로,
   * 문서 자체의 h1을 그대로 넣으면 h1이 둘이 된다.
   */
  eleventyConfig.addFilter('sourceBodyAsSection', (inputPath) => {
    if (!inputPath) return ''
    const filePath = path.resolve(inputPath)
    if (!fs.existsSync(filePath)) return ''
    return fs.readFileSync(filePath, 'utf8')
      .replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '')
      .replace(/^\s*#\s+.*\r?\n/, '')
      .trim()
  })

  /** 본문 첫 문단 한 줄 요약. 목록만 보고 무엇인지 알 수 있어야 한다. */
  eleventyConfig.addFilter('sourceSummary', (inputPath) => {
    if (!inputPath) return ''
    const filePath = path.resolve(inputPath)
    if (!fs.existsSync(filePath)) return ''
    const body = fs.readFileSync(filePath, 'utf8')
      .replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '')
    const line = body.split('\n').map(l => l.trim())
      .find(l => l && !l.startsWith('#') && !l.startsWith('>') && !l.startsWith('|') && !l.startsWith('```'))
    if (!line) return ''
    return line.length > 160 ? `${line.slice(0, 157)}...` : line
  })

  return {
    dir: {
      input: 'site',
      output: '_site',
      includes: '_includes',
      data: '_data'
    },
    templateFormats: ['md', 'njk', 'html'],
    markdownTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk'
  }
}
