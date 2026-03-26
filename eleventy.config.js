// Eleventy ESM 설정 -- INFOMIND UX 가이드 문서 사이트
import syntaxHighlight from '@11ty/eleventy-plugin-syntaxhighlight'

export default function(eleventyConfig) {
  // 코드 하이라이팅 플러그인
  eleventyConfig.addPlugin(syntaxHighlight)

  // 정적 자원 passthrough copy
  eleventyConfig.addPassthroughCopy('site/assets')
  // dist/css를 그대로 복사 -- 문서 사이트와 playground iframe 모두 /dist/css/ 경로 사용
  eleventyConfig.addPassthroughCopy({ 'dist/css': 'dist/css' })
  // Prism.js 코드 하이라이팅 테마
  eleventyConfig.addPassthroughCopy({ 'node_modules/prismjs/themes/prism-tomorrow.min.css': 'assets/css/prism-tomorrow.css' })
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
