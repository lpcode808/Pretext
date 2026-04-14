# 2026-04-02 Storybook Engine

## Goal

Build the first local PRD 04 prototype: an interactive picture book reading engine where text flows around illustration zones using Pretext's obstacle-aware `layoutNextLine()` API. The reader can adjust font size with instant re-pagination and follow along with line-by-line highlighting.

## Commands

```sh
cd /Users/justinlai/Coding/Pretext/experiments/2026-04-02-storybook-engine
python3 -m http.server 8050
```

Then open `http://localhost:8050/`.

## Fonts And Browser Assumptions

- Body text is measured with the same stack used by the CSS: `"Inter", Arial, sans-serif`.
- The default font string is `500 20px "Inter", Arial, sans-serif` (adjustable via slider from 16px to 32px).
- The page loads Inter from Google Fonts and imports Pretext from a CDN.
- `system-ui` is intentionally avoided because the upstream research notes document macOS measurement mismatches.
- This prototype should be checked in Chrome and Safari.

## Findings

- The core layout uses `layoutNextLine()` to flow text around illustration obstacle zones, computing a different available width for each line based on whether it overlaps the illustration.
- Font size changes re-run `prepare()` once, then the pure-arithmetic page layout re-paginates instantly without touching the DOM.
- Read-along mode uses the line positions already computed by the layout pass; no additional measurement needed.
- Story data is a plain JSON-like object at the top of the script for easy content swapping.
- Illustration zones are placeholder colored areas with labels; real images can be swapped in later.

## Upstream Or Local?

Keep this local for now.

Reason:
- The obstacle-aware flow pattern follows the upstream dynamic-layout demo, but the storybook framing, pagination, read-along mode, and content model are specific to this EdTech use case.
- If the pagination or read-along utilities become broadly useful, extract them later.
