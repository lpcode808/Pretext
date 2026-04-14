# Pretext EdTech Projects — Agent Context

## What this is
Four projects that use [Pretext](https://github.com/chenglou/pretext) — a pure TypeScript library for text measurement without DOM reflow — applied to education, interactive learning, and conference demos.

## Who's building this
An educator (not a professional webdev) who builds single-file HTML apps using AI-assisted vibe coding tools (Cursor, Claude Code, etc.). These apps are used in classrooms, at EdTech conferences, and as student learning experiences. The workflow is: prompt AI → get working code → tweak locally → deploy to GitHub Pages.

## Design philosophy
These projects follow the Bret Victor / explorable explanations tradition:
- **Immediate feedback**: readers/students interact and see results instantly
- **Progressive disclosure**: concepts build from intuition to technical detail
- **Single-file simplicity**: each project is one HTML file with embedded CSS/JS
- **No build step**: must work when opened locally AND when deployed to GitHub Pages
- **Accessible**: text is real DOM text (selectable, screen-reader friendly), not canvas

## The four PRDs

| # | Project | Pretext APIs | Complexity | Build order |
|---|---------|-------------|------------|-------------|
| 01 | [Explorable: How Text Layout Works](./PRD-01-explorable-text-layout.md) | prepare, layout, prepareWithSegments, layoutWithLines, walkLineRanges | Medium | Third — best once the simpler demos feel familiar |
| 02 | [Student App Showcase (Masonry)](./PRD-02-student-showcase-masonry.md) | prepare, layout | Easiest | Start here — simplest API surface |
| 03 | [Socratic Chat Learning Guide](./PRD-03-socratic-chat-learning.md) | prepareWithSegments, walkLineRanges, layout | Medium | Second — shrinkwrap is the hook |
| 04 | [Storybook Engine](./PRD-04-storybook-engine.md) | prepareWithSegments, layoutNextLine, layout | Medium | Last — obstacle-aware flow plus pagination |

**Recommended build order**: Start with PRD 02 (masonry showcase) because it uses the simplest Pretext API (just `prepare` + `layout`) and builds confidence. Then PRD 03 (chat) because the shrinkwrap algorithm is a single function and the visual payoff is high. Then PRD 01 (explorable) because it requires exposing Pretext internals to the reader, which demands deeper understanding. Finish with PRD 04 (storybook) once line-by-line routing and pagination feel comfortable.

## Critical technical constraints

### Font matching
Pretext's `prepare(text, font)` font string MUST exactly match your CSS font declaration. If your CSS says `font: 16px Inter`, your Pretext call must be `prepare(text, '16px Inter')`. Mismatch = wrong measurements = wrong line breaks.

### No system-ui
Do NOT use `system-ui` as the font. On macOS, Canvas and DOM resolve `system-ui` to different font variants at certain sizes (documented in Pretext's RESEARCH.md). Use a named font: Inter, Helvetica Neue, Arial.

### CDN import
```html
<script type="module">
import { prepare, layout, prepareWithSegments, layoutWithLines, walkLineRanges } from 'https://esm.sh/@chenglou/pretext'
</script>
```
If esm.sh has issues, try `https://cdn.jsdelivr.net/npm/@chenglou/pretext/+esm` or bundle locally.

As of v0.0.3, the npm package ships built ESM JavaScript (not raw TypeScript), so CDN imports should work more reliably.

### New APIs (v0.0.4)
- `measureNaturalWidth(prepared)` returns the widest forced line width — useful for intrinsic sizing and shrinkwrap.
- `@chenglou/pretext/inline-flow` is an alpha sidecar for mixed inline runs (different fonts, atomic pills like chips, collapsed boundary spaces). Relevant for PRD-03's rich chat bubbles if inline formatting is needed. Intentionally narrow: no nested markup, no `pre-wrap`.

### Current upstream main (not yet published to npm)
- The local upstream clone is already ahead of the `v0.0.4` npm release. On `main`, the earlier `inline-flow` work has evolved into `@chenglou/pretext/rich-inline`, and `prepare()` / `prepareWithSegments()` now also accept `{ wordBreak: 'keep-all' }`.
- For GitHub Pages experiments that depend on CDN imports, stay pinned to the published `@0.0.4` surface until a new package version ships. If you prototype against the local upstream clone instead, read the current upstream README first.

### Single-file constraint
Each project must be a single HTML file (or at most HTML + a JSON data file). No React, no Webpack, no Vite, no npm in production. The build artifact is just files you push to a GitHub repo.

## Reference material
- **Pretext repo**: https://github.com/chenglou/pretext (READ THE README — it documents the current upstream API, including the richer `rich-inline` helper on `main`)
- **Pretext RESEARCH.md**: in the repo — extraordinary documentation of every design decision and rejected approach
- **Official demos**: https://chenglou.me/pretext/ (bubbles, masonry, dynamic-layout, editorial-engine, rich-note, markdown-chat, justification-comparison)
- **Community demos**: https://somnai-dreams.github.io/pretext-demos/ (calligram-engine, shrinkwrap-showdown, fluid-smoke, editorial-engine)
- **Bret Victor references**: Explorable Explanations (worrydream.com), Up and Down the Ladder of Abstraction, Learnable Programming
- **Latest release**: v0.0.4 (April 2, 2026) — ships built ESM, adds inline-flow alpha, measureNaturalWidth, justification comparison demo. The local upstream clone is newer than this release.

## Deployment target
GitHub Pages. Each project gets its own repo (or they share a monorepo with separate HTML files at the root). No CI/CD needed — just push HTML files and GitHub Pages serves them.

## Testing approach
1. Open the HTML file locally in Chrome and Safari
2. Resize the browser window — layout should reflow smoothly at 60fps+
3. Check that text wrapping matches between the Pretext measurement and the actual DOM rendering
4. Test on mobile (or Chrome DevTools device emulation)
5. Deploy to GitHub Pages and verify it works served over HTTPS
