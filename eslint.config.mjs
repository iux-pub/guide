// ESLint flat config — INFOMIND UX 가이드 시스템
// 대상: scripts/(Node·CJS) · eleventy.config.js · mcp/bin · cli/bin(Node·CJS) · studio(서버 ESM·화면 브라우저)
// 파일 이름이 .mjs인 이유: 루트 package.json에 "type"이 없어 .js 설정은 Node가 매번
// MODULE_TYPELESS_PACKAGE_JSON 경고를 내고 ES 모듈로 다시 읽는다.
import js from '@eslint/js'
import globals from 'globals'

// 공통 규칙 — 폴더마다 같은 기준을 쓴다
const rules = {
  'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
  'no-console': 'off',
  'prefer-const': 'error',
  'no-var': 'error',
  'eqeqeq': ['error', 'smart'],
  'comma-dangle': ['warn', 'never'],
  // 정규식 안의 BOM(/^﻿/를 글자 그대로 적은 것)은 의도한 표기다 — 문자열·주석의 불규칙 공백만 막는다
  'no-irregular-whitespace': ['error', { skipRegExps: true }]
}

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
    rules: { ...rules, 'no-multi-spaces': 'warn' }
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
    // MCP 서버·CLI — npx로 도는 독립 패키지(CommonJS, Node)
    files: ['mcp/bin/**/*.js', 'cli/bin/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: {
        ...globals.node
      }
    },
    rules
  },
  {
    // 스튜디오 서버·워커 (ESM, Node)
    files: ['studio/**/*.mjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node
      }
    },
    rules
  },
  {
    // 스튜디오 화면 (브라우저)
    files: ['studio/public/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'script',
      globals: {
        ...globals.browser
      }
    },
    rules
  },
  {
    ignores: [
      'node_modules/**',
      '**/node_modules/**',
      'dist/**',
      '_site/**',
      'tokens/build/**',
      'mcp/data/**',
      'studio/library/**',
      'starter/**', // 스타터 사본 — 원본(scripts/)을 본다
      'src/playground/**', // 정적 HTML — 별도 검증
      'site/assets/js/clipboard.min.js',
      'site/assets/js/**.min.js'
    ]
  }
]
