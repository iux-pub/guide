# Domain Pitfalls

**Domain:** Design System Documentation & Publishing Guide
**Researched:** 2026-03-25

## Critical Pitfalls

Mistakes that cause rewrites or major issues.

### Pitfall 1: Building documentation before the system

**What goes wrong:** Team starts writing guide pages before the SCSS architecture, tokens, and components are solid. Documentation becomes out of sync with code immediately.
**Why it happens:** Natural instinct to "document first." Guide site is more visible/exciting than token JSON files.
**Consequences:** Constant documentation rewrites. Team loses trust in the guide's accuracy.
**Prevention:** Build token pipeline and SCSS architecture FIRST. Documentation site is the LAST phase. Components should be code-complete before they get a documentation page.
**Detection:** If you're writing documentation for a component that doesn't have finalized SCSS, stop.

### Pitfall 2: @import migration debt

**What goes wrong:** Team continues using `@import` (deprecated in Dart Sass) because existing projects use it. Guide teaches `@use/@forward` but team can't apply it.
**Why it happens:** `@import` is familiar. `@use` has different scoping rules (no global variables by default).
**Consequences:** Guide becomes aspirational rather than practical. Future Sass versions will remove `@import` entirely, forcing emergency migration.
**Prevention:** Guide must use `@use/@forward` exclusively. Include a migration cheat-sheet (@import -> @use equivalents). Existing projects can migrate incrementally.
**Detection:** Any `@import` in new SCSS files is a red flag.

### Pitfall 3: BEM naming inconsistency (the existing problem)

**What goes wrong:** PROJECT.md already identifies this: team uses hyphens where BEM expects `__` and `--`. Guide defines strict BEM but team falls back to old habits.
**Why it happens:** Muscle memory. No automated enforcement.
**Consequences:** Inconsistent codebase. Guide becomes ignored.
**Prevention:** Ship Stylelint config with `stylelint-selector-bem-pattern` from Day 1. Make linting a required step, not optional. Provide VS Code settings for auto-lint on save.
**Detection:** Run `stylelint` on any new SCSS file. Violations = incomplete adoption.

### Pitfall 4: Over-engineering the token system

**What goes wrong:** Creating deeply nested token hierarchies (primitive -> semantic -> component -> state) when the team just needs colors, spacing, and typography.
**Why it happens:** Design token articles/tools encourage enterprise-scale architecture.
**Consequences:** Token system becomes harder to use than hardcoded values. Team bypasses it.
**Prevention:** Start with flat, simple tokens: color, typography, spacing, breakpoints. Add semantic layers only when genuine need arises (e.g., actual multi-theme requirement). Team's existing variables ($color-main, $color-black) are already near-ideal simplicity.
**Detection:** If a developer has to look up 3 levels of token indirection to find the right color, it's too complex.

## Moderate Pitfalls

### Pitfall 5: Accessibility as afterthought

**What goes wrong:** Components are built for visual correctness first, then accessibility is "added" later. Results in bolted-on aria attributes that don't actually work.
**Prevention:** Each component must include accessibility requirements BEFORE visual styling. Use the team's existing accessible patterns (sr-only, skip-to-content, role="tablist") as the starting point. Test with pa11y-ci on every build.

### Pitfall 6: Documentation site becomes a maintenance burden

**What goes wrong:** Guide site requires its own maintenance cycle. Team builds it, then nobody updates it when conventions change.
**Prevention:** Keep documentation as close to code as possible. Component SCSS files should contain usage comments. Eleventy pages should pull from data files (tokens.json, component metadata) rather than hardcoded content. Fewer things to manually update = fewer things that go stale.

### Pitfall 7: Ignoring existing codebase patterns

**What goes wrong:** Guide creates "ideal" patterns that don't match any existing project. Team can't bridge the gap between guide and reality.
**Prevention:** The guide should evolve FROM existing patterns (PROJECT.md documents these: .btn, .form-group, .card, etc.), not impose alien patterns. Improve incrementally. The webstyleguide project is a good reference -- start there.

### Pitfall 8: CSS Custom Properties scope confusion

**What goes wrong:** Mixing SCSS variables and CSS custom properties without clear rules on when to use which.
**Prevention:** Define clear rule: SCSS variables for compile-time calculations (mixins, functions, math). CSS custom properties for values that change at runtime (theming, responsive, project overrides). Document this distinction prominently.

## Minor Pitfalls

### Pitfall 9: Forgetting Korean font fallback chains

**What goes wrong:** Font stack doesn't include proper Korean fallback fonts. Some systems don't have Pretendard GOV installed.
**Prevention:** Always define full fallback: `'Pretendard GOV', 'Pretendard', -apple-system, 'Malgun Gothic', sans-serif`. Include @font-face declarations in the template.

### Pitfall 10: Normalize.css version mismatch

**What goes wrong:** Different projects use different normalize versions, causing subtle rendering differences.
**Prevention:** Pin normalize version in the template. Consider modern-normalize (smaller, drops IE support) if IE is not required.

### Pitfall 11: rem() function edge cases

**What goes wrong:** Team uses sass-rem with 16px base but some projects might have different base font sizes.
**Prevention:** Make base font size a token/setting, not hardcoded. Document the 16px assumption clearly.

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Token system setup | Over-engineering (Pitfall 4) | Start flat, add layers when proven need |
| SCSS architecture (ITCSS) | @import vs @use confusion (Pitfall 2) | Enforce @use from start, provide migration guide |
| Component development | BEM inconsistency (Pitfall 3) | Stylelint enforcement from Day 1 |
| Accessibility integration | Afterthought pattern (Pitfall 5) | A11y requirements before visual design |
| Documentation site | Building too early (Pitfall 1) | Build site AFTER components are stable |
| Team rollout | Ignoring existing patterns (Pitfall 7) | Evolve from existing code, don't replace |

## Sources

- PROJECT.md: Existing BEM inconsistency documented
- PROJECT.md: Existing SCSS structure and patterns
- Sass deprecation notice: https://sass-lang.com/documentation/at-rules/import/
- ITCSS common mistakes: https://www.xfive.co/blog/itcss-scalable-maintainable-css-architecture/
- Design token anti-patterns: https://styledictionary.com/info/tokens/
