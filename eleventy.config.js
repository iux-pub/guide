// Eleventy ESM 설정 -- INFOMIND UX 가이드 문서 사이트
import syntaxHighlight from '@11ty/eleventy-plugin-syntaxhighlight'

export default function(eleventyConfig) {
  // 코드 하이라이팅 플러그인
  eleventyConfig.addPlugin(syntaxHighlight)

  // 정적 자원 passthrough copy
  eleventyConfig.addPassthroughCopy('site/assets')
  eleventyConfig.addPassthroughCopy({ 'dist/css': 'assets/css' })
  eleventyConfig.addPassthroughCopy({ 'src/playground': 'playground' })
  eleventyConfig.addPassthroughCopy({ 'node_modules/clipboard/dist/clipboard.min.js': 'assets/js/clipboard.min.js' })

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
