# Feature Landscape

**Domain:** Design System Documentation & Publishing Guide
**Researched:** 2026-03-25

## Table Stakes

Features users (team members) expect. Missing = guide feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| BEM naming convention guide with examples | Team has inconsistent BEM usage (hyphen vs __ in practice) | Low | Include do/don't examples |
| SCSS variable/mixin reference | Team uses shared mixins (flex, fsize, ellipse, etc.) | Low | Document existing + improved versions |
| Design token documentation (color, typography, spacing) | Foundation of visual consistency | Med | Style Dictionary JSON -> visual swatches |
| Responsive breakpoint guide | Team uses 360/768/1200 but inconsistently | Low | Define 3-4 breakpoints clearly |
| Component HTML+SCSS snippets | Core deliverable per PROJECT.md | Med | btn, form-group, card, tab, modal, pagination, breadcrumb |
| Accessibility checklist (KWCAG/WCAG AA) | Legal requirement for public sector projects | Med | Checkable list, not just guidelines |
| Copy-to-clipboard for code examples | Expected UX in any code documentation | Low | clipboard.js integration |
| Search within documentation | Find components/guidelines quickly | Med | Eleventy has search plugins |
| Boilerplate HTML page template | Team needs ready-to-use starting point | Low | lang="ko", viewport, skip-to-content, semantic structure |
| SCSS file structure guide | Developers need to know where things go | Low | ITCSS layer explanation with file mapping |

## Differentiators

Features that set this guide apart from a generic style guide. Not expected, but highly valued.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Live component preview alongside code | See rendered output next to HTML/SCSS source | Med | Eleventy + iframe or inline rendering |
| Figma-to-code handoff rules | Bridge design-dev gap (PROJECT.md requirement) | Med | Naming conventions, spacing tokens mapping |
| Automated a11y testing of guide pages | Prove the guide itself is accessible | Low | pa11y-ci in build pipeline |
| Dark/light mode toggle on guide site | Demonstrates theming capability of token system | Med | CSS custom properties + JS toggle |
| Project starter kit generator | Download pre-configured SCSS + HTML boilerplate for new project | High | ZIP download or npm init script |
| Design token visual playground | Interactive token visualization (color palettes, type scale) | Med | Generated HTML pages from Style Dictionary output |
| BEM linting integration guide | Show how to add Stylelint + BEM enforcement to any project | Low | .stylelintrc config template |

## Anti-Features

Features to explicitly NOT build.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| JavaScript framework component library | Out of scope per PROJECT.md. Team's JS varies by project. | Provide HTML/CSS only. JS behavior is project-specific. |
| Figma UI Kit / component library | Separate effort per PROJECT.md. This is documentation, not design tooling. | Document naming conventions and handoff rules instead. |
| CI/CD pipeline configuration | Varies by project per PROJECT.md. | Provide lint/test scripts; let projects integrate them. |
| Backend API integration guides | Outside scope. This is front-end markup/styling. | N/A |
| Complex theming engine | Over-engineering. Most projects just change $color-main. | CSS custom properties + Style Dictionary for simple theme overrides. |
| Multi-language (i18n) for guide itself | Team is Korean-speaking. Guide is internal. | Write all documentation in Korean. |

## Feature Dependencies

```
Design Tokens (JSON) -> SCSS Variables & CSS Custom Properties -> Component Styles
ITCSS Structure -> Component Organization -> Component Snippets
BEM Convention Rules -> Stylelint Config -> Linting Guide
HTML Boilerplate -> Component HTML -> Accessibility Checklist
Eleventy Setup -> Component Preview Pages -> Search -> Full Documentation Site
```

## MVP Recommendation

Prioritize (Phase 1-2):
1. ITCSS SCSS architecture + design tokens (foundation everything else builds on)
2. BEM naming convention guide with do/don't examples
3. Core component HTML+SCSS snippets (btn, form, card, table, modal)
4. Accessibility checklist
5. Eleventy documentation site with code preview

Defer:
- **Project starter kit generator**: High complexity, build after guide is stable
- **Dark/light mode toggle**: Nice showcase but not essential for team productivity
- **Search**: Can use browser Ctrl+F initially; add proper search after content is written
- **Figma handoff rules**: Requires design team input; can be added incrementally

## Sources

- PROJECT.md requirements analysis
- Existing SCSS patterns from team codebase (webstyleguide, gitCode)
- W3C Design System: https://design-system.w3.org/
- USWDS (US Web Design System): https://designsystem.digital.gov/
