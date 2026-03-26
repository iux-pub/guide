# Research Summary: INFOMIND UX Design/Publishing Guide System

**Domain:** Design System Documentation & HTML/CSS Publishing Guide
**Researched:** 2026-03-25
**Overall confidence:** HIGH

## Executive Summary

The INFOMIND UX team needs a documentation site and reusable SCSS/HTML template system for their publishing workflow. The team already has established patterns (BEM, SCSS with dart-sass, specific mixins and color variables) but these are scattered across projects without formal documentation. The existing webstyleguide project provides the closest reference point.

The recommended stack centers on **Eleventy 3.x** for the documentation site (pure HTML output, no JS framework dependency), **ITCSS** for SCSS architecture (designed to work with BEM, manages specificity ordering), and **Style Dictionary 5.x** for design tokens (JSON source of truth generating both SCSS variables and CSS custom properties). This stack is deliberately lightweight -- no React, no bundler, no complex build pipeline -- because the team works in HTML/CSS and the project explicitly excludes JS frameworks.

The biggest risk is not technical but organizational: the team has documented BEM inconsistency (using hyphens where `__` and `--` should be). Automated enforcement via Stylelint with BEM pattern plugin is critical from the start. Without it, the guide will codify rules that nobody follows.

Accessibility (KWCAG/WCAG 2.1 AA) is a legal requirement for the team's public sector projects, not a nice-to-have. pa11y-ci provides automated testing against built documentation pages, catching roughly 50% of issues. The remaining 50% requires manual testing and checklists, which the guide must include.

## Key Findings

**Stack:** Eleventy 3.x + ITCSS + Style Dictionary 5.x + Stylelint 17.x + pa11y-ci. All npm-based, no framework dependencies.

**Architecture:** Two deliverables -- (1) ITCSS-structured SCSS template system with design tokens, (2) Eleventy documentation site rendering component previews and guides. Token pipeline: JSON -> SCSS variables + CSS custom properties.

**Critical pitfall:** Building documentation before stabilizing the underlying SCSS system. Components must be code-complete before they get documentation pages.

## Implications for Roadmap

Based on research, suggested phase structure:

1. **Foundation: Tokens + SCSS Architecture** - Set up Style Dictionary pipeline, ITCSS folder structure, port existing mixins/variables to new architecture
   - Addresses: Design tokens, SCSS structure, breakpoints
   - Avoids: Over-engineering tokens (Pitfall 4), @import debt (Pitfall 2)

2. **Conventions: BEM + Linting** - Define strict BEM rules, configure Stylelint with BEM enforcement, create convention documentation
   - Addresses: BEM naming guide, linting config
   - Avoids: BEM inconsistency (Pitfall 3)

3. **Components: HTML+SCSS Snippets** - Build core components (btn, form, card, modal, tab, table, pagination, breadcrumb) following ITCSS + BEM
   - Addresses: Component snippets, HTML boilerplate
   - Avoids: Accessibility afterthought (Pitfall 5) -- each component includes a11y from start

4. **Accessibility: Checklist + Testing** - Create KWCAG/WCAG AA checklist, integrate pa11y-ci, validate all components
   - Addresses: Accessibility checklist, automated testing
   - Avoids: Bolted-on accessibility

5. **Documentation Site: Eleventy** - Build the documentation site with component previews, guides, and search
   - Addresses: Documentation site, live previews, code copying
   - Avoids: Building docs too early (Pitfall 1)

6. **Rollout: Handoff + Onboarding** - Figma handoff rules, new team member guide, project starter kit
   - Addresses: Handoff rules, onboarding guide
   - Avoids: Ignoring existing patterns (Pitfall 7)

**Phase ordering rationale:**
- Tokens and SCSS architecture must come first because everything else depends on them
- BEM conventions before components so components are built correctly from the start
- Components before documentation so docs reflect actual, tested code
- Accessibility integrated throughout but gets dedicated phase for checklist and validation
- Documentation site last because it consumes all prior work
- Rollout after everything is stable

**Research flags for phases:**
- Phase 1: May need deeper research into Style Dictionary 5.x DTCG format configuration specifics
- Phase 3: Standard patterns, unlikely to need additional research
- Phase 5: Eleventy plugin ecosystem for search and syntax highlighting may need phase-specific investigation
- Phase 6: Figma handoff rules need input from design team, not just technical research

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All versions verified on npm within last week. Mature, well-documented tools. |
| Features | HIGH | Based directly on PROJECT.md requirements and team's existing patterns. |
| Architecture | HIGH | ITCSS + BEM is a proven, well-documented combination used by multiple government design systems. |
| Pitfalls | HIGH | Key pitfalls identified from PROJECT.md (BEM inconsistency) and known SCSS migration issues (@import deprecation). |

## Gaps to Address

- **Style Dictionary 5.x DTCG format**: Version jumped from 4.x to 5.x recently. Exact v5 configuration syntax for SCSS output should be verified during Phase 1 implementation.
- **Eleventy search plugins**: Several options exist (eleventy-search, pagefind). Need to evaluate during Phase 5.
- **KWCAG-specific rules**: pa11y and axe-core cover WCAG 2.1 AA but may not have Korea-specific rules. Manual checklist needed for KWCAG-only requirements.
- **sass-rem compatibility with @use**: Team uses sass-rem package. Need to verify it works with `@use` (not just `@import`) during Phase 1.
- **Figma token export**: If team wants to export tokens directly from Figma, tools like Tokens Studio need evaluation. Not researched here because Figma UI Kit is out of scope.
