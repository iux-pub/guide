// ESLint flat config — INFOMIND UX 가이드 시스템
// scripts/* (Node) + Eleventy config + 인라인 JS(site/_includes/) 검증
import js from '@eslint/js'
import globals from 'globals'

export default [
  js.configs.recommended,
  {
    files: ['scripts/**/*.js', 'eleventy.config.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node
      }
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-console': 'off',
      'prefer-const': 'error',
      'no-var': 'error',
      'eqeqeq': ['error', 'smart'],
      'no-multi-spaces': 'warn',
      'comma-dangle': ['warn', 'never']
    }
  },
  {
    // CommonJS 스크립트 (build-*.js 일부 + .pa11yci.js 등)
    files: ['scripts/build-*.js', '.pa11yci.js', '.commitlintrc.json'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: {
        ...globals.node
      }
    }
  },
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      '_site/**',
      'tokens/build/**',
      'src/playground/**', // 정적 HTML — 별도 검증
      'site/assets/js/clipboard.min.js',
      'site/assets/js/**.min.js'
    ]
  }
]
