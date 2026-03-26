# Technology Stack

**Project:** INFOMIND UX Design/Publishing Guide System
**Researched:** 2026-03-25

## Recommended Stack

### Documentation Site Generator

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Eleventy (11ty) | ^3.1.5 | Documentation site generator | Framework-agnostic, Nunjucks/Markdown templates produce pure HTML. No React/Vue dependency. Perfect for HTML/CSS publishing team. Zero JS shipped by default. Active maintenance (177 releases in 2025, v3.1.5 latest). |
| Nunjucks | ^3.2.4 | Template engine for Eleventy | Jinja2-style syntax familiar to HTML publishers. Supports template inheritance, macros for component previews. |

**Confidence:** HIGH - Eleventy is the de facto choice for non-framework documentation sites. Verified: v3.1.5 published within the last week, 51% YoY npm download growth.

**Why NOT alternatives:**
- **Storybook** - Designed for JS component libraries (React/Vue/Angular). Overkill and wrong paradigm for HTML/CSS snippets. Heavy JS dependency.
- **Astro** - Good but adds unnecessary abstraction layer. Team works in HTML/CSS directly, not .astro components. Eleventy lets you write plain HTML.
- **Docusaurus** - React-based. Wrong ecosystem for a non-JS team.
- **Fractal** - Viable alternative but less active community. Eleventy has broader ecosystem and plugin support.
- **VitePress** - Vue-based. Same problem as Docusaurus.

### CSS Preprocessor & Architecture

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| sass (Dart Sass) | ^1.98.0 | SCSS compilation | Team standard. `sass` is the correct npm package (NOT `dart-sass` which is deprecated at v1.25.0). Uses @use/@forward (NOT deprecated @import). |
| PostCSS | ^8.5.0 | Post-processing | Autoprefixer for vendor prefixes. Pairs with sass output. |
| Autoprefixer | ^10.4.0 | Vendor prefixes | Required for public sector browser support (IE edge cases). |

**Confidence:** HIGH - sass v1.98.0 verified on npm. Team already uses dart-sass.

### SCSS Architecture Pattern

| Pattern | Why |
|---------|-----|
| **ITCSS (Inverted Triangle CSS)** | Best fit for BEM methodology. Designed by Harry Roberts specifically to work with BEM. Organizes by specificity, not file type. Prevents cascade conflicts that 7-1 pattern allows. |

**ITCSS layers for this project:**
```
1. Settings   - Design tokens as SCSS variables ($color-main, $spacing-unit, etc.)
2. Tools      - Mixins and functions (flex, fsize, ellipse, etc.)
3. Generic    - Normalize, box-sizing, reset
4. Elements   - Base HTML element styles (h1-h6, a, table, etc.)
5. Objects    - Layout patterns (grid, container, inner-conts)
6. Components - BEM components (btn, card, form-group, modal, tab)
7. Utilities  - Helper classes (sr-only, text-center, visually-hidden)
```

**Why NOT 7-1 pattern:** 7-1 organizes by type (abstracts, base, components...) which doesn't enforce specificity ordering. ITCSS explicitly manages the cascade, reducing `!important` usage to zero -- aligning with team's CLAUDE.md rule prohibiting `!important`.

**Confidence:** HIGH - ITCSS + BEM is a well-documented, proven combination. Multiple government design systems use this approach.

### Design Token Management

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Style Dictionary | ^5.4.0 | Design token pipeline | Transforms JSON tokens into SCSS variables AND CSS custom properties simultaneously. Single source of truth for colors, spacing, typography. DTCG format compatible. |

**Confidence:** HIGH - Style Dictionary v5.4.0 verified on npm (published within last week). Industry standard for design tokens.

**Token strategy:**
- Define tokens in JSON (DTCG format with `$value`, `$type`)
- Generate SCSS variables for compile-time use in mixins
- Generate CSS custom properties for runtime theming (dark mode, project-specific overrides)
- This matches team's existing pattern: webstyleguide already uses CSS Custom Properties (`--primary-color`, `--gray-900`)

### Linting & Code Quality

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Stylelint | ^17.5.0 | CSS/SCSS linting | Industry standard. Enforces team conventions automatically. |
| stylelint-scss | latest | SCSS-specific rules | SCSS-specific linting rules (no-duplicate-mixins, etc.) |
| stylelint-selector-bem-pattern | latest | BEM enforcement | Validates BEM naming convention in selectors. Critical for enforcing consistent BEM usage (team's existing codebase has inconsistent BEM application). |
| stylelint-config-standard-scss | latest | Standard SCSS config | Base config extending standard rules for SCSS. |

**Confidence:** HIGH - Stylelint v17.5.0 verified on npm. BEM plugin actively maintained.

### Accessibility Testing

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| pa11y-ci | latest | CI accessibility testing | CLI-based, tests against URL lists. Supports WCAG 2.1 AA. Catches ~50% of issues automatically. Perfect for testing built guide pages. |
| axe-core | ^4.11.0 | Accessibility engine | Powers pa11y's checks. Industry-standard ruleset from Deque. |
| @axe-core/cli | latest | Quick CLI a11y checks | For developer-side quick checks during development. |

**Confidence:** HIGH - pa11y actively maintained (copyright 2016-2025). axe-core v4.11.1 verified.

**Why NOT alternatives:**
- **Lighthouse** - Good but general-purpose (performance, SEO, etc.). pa11y is focused on accessibility with better WCAG rule coverage.
- **WAVE** - Browser extension only. Not scriptable for CI.

### Build Tools

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| npm scripts | - | Task runner | Team standard (npm). No need for gulp/grunt overhead. npm scripts can chain sass compilation, PostCSS, and Eleventy build. |
| concurrently | latest | Parallel npm scripts | Run sass --watch and eleventy --serve simultaneously during development. |
| live-server or Eleventy's built-in | - | Dev server | Eleventy includes BrowserSync-like dev server with hot reload. |

**Confidence:** HIGH - npm scripts are sufficient for this project scope. No JS bundling needed (project explicitly excludes JS frameworks).

**Why NOT gulp/webpack/vite:**
- No JavaScript to bundle
- No framework compilation needed
- SCSS compilation + static HTML generation = npm scripts are more than enough
- Fewer dependencies = fewer maintenance headaches

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| sass-rem | latest | REM conversion | Team already uses this. `rem(16px)` function for rem values with 16px base. |
| markdown-it | latest | Markdown parsing | Eleventy default. For writing guide content in Markdown. |
| Prism.js | latest | Code syntax highlighting | For displaying HTML/SCSS code examples in the guide. |
| clipboard.js | latest | Copy to clipboard | For "copy code" buttons on code snippets. |

**Confidence:** MEDIUM - sass-rem confirmed in team's existing projects. Others are standard choices but versions not individually verified.

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Doc Site | Eleventy | Fractal | Less active community, steeper learning curve, Eleventy plugins cover same use cases |
| Doc Site | Eleventy | Storybook | React-centric, ships heavy JS, wrong paradigm for HTML/CSS publishing team |
| Doc Site | Eleventy | Astro | Adds .astro abstraction when team works in plain HTML. Good tool, wrong fit. |
| SCSS Pattern | ITCSS | 7-1 Pattern | Doesn't enforce specificity ordering, allows cascade conflicts |
| Tokens | Style Dictionary | Manual SCSS variables | No single source of truth, no automated CSS custom property generation |
| Tokens | Style Dictionary | Token CSS | Newer, smaller community, less SCSS integration |
| Linting | Stylelint | CSS-only manual review | Inconsistent enforcement, team already has BEM compliance issues |
| A11y | pa11y-ci | Lighthouse CI | pa11y has better WCAG-focused rules; Lighthouse is general-purpose |
| Build | npm scripts | Gulp | Unnecessary abstraction for this scope (no JS bundling) |

## Installation

```bash
# Documentation site
npm install -D @11ty/eleventy@^3.1.5 nunjucks

# SCSS compilation
npm install -D sass@^1.98.0 postcss autoprefixer postcss-cli

# Design tokens
npm install -D style-dictionary@^5.4.0

# Linting
npm install -D stylelint@^17.5.0 stylelint-scss stylelint-selector-bem-pattern stylelint-config-standard-scss

# Accessibility testing
npm install -D pa11y-ci @axe-core/cli

# Build utilities
npm install -D concurrently

# Existing team dependencies
npm install -D sass-rem
```

## Key npm Scripts

```json
{
  "scripts": {
    "dev": "concurrently \"npm:watch:*\"",
    "watch:scss": "sass --watch src/scss:dist/css --style=expanded",
    "watch:site": "eleventy --serve",
    "build": "npm run build:tokens && npm run build:scss && npm run build:site",
    "build:tokens": "style-dictionary build",
    "build:scss": "sass src/scss:dist/css --style=compressed && postcss dist/css/**/*.css --replace",
    "build:site": "eleventy",
    "lint:scss": "stylelint 'src/**/*.scss'",
    "lint:fix": "stylelint 'src/**/*.scss' --fix",
    "test:a11y": "pa11y-ci"
  }
}
```

## Sources

- Eleventy official: https://www.11ty.dev/ (v3.1.5, verified 2026-03-25)
- sass npm: https://www.npmjs.com/package/sass (v1.98.0, verified 2026-03-25)
- Style Dictionary: https://styledictionary.com/ (v5.4.0, verified 2026-03-25)
- Stylelint: https://stylelint.io/ (v17.5.0, verified 2026-03-25)
- ITCSS: https://www.xfive.co/blog/itcss-scalable-maintainable-css-architecture/
- pa11y: https://pa11y.org/ (maintained 2016-2025)
- stylelint-selector-bem-pattern: https://github.com/simonsmith/stylelint-selector-bem-pattern
- Sass Guidelines (7-1 & architecture): https://sass-guidelin.es/
