# 2026-04-02 Explorable Text Layout

## Goal

Build the first local PRD 01 prototype: a small explorable explanation that shows how Pretext turns text wrapping into a two-step process.

The teaching target is simple:
- prepare once
- layout many times

## Commands

Serve the experiment from its folder with any static server. One simple option:

```sh
cd /Users/justinlai/Coding/Pretext/experiments/2026-04-02-explorable-text-layout
python3 -m http.server 8040
```

Then open `http://localhost:8040/`.

## Fonts And Browser Assumptions

- Paragraph text is measured with the same stack used by the CSS: `"Inter", Arial, sans-serif`.
- The key font string is `500 16px "Inter", Arial, sans-serif`.
- The page loads Inter from Google Fonts and prefers the CDN copy of Pretext, but it also includes a built-in local fallback so the explainer still runs when the CDN is unavailable.
- `system-ui` is intentionally avoided because the upstream research notes document macOS measurement mismatches.
- This prototype should be checked in Chrome and Safari.

## Findings

- The main lesson is the side-by-side comparison: a normal DOM paragraph on the left and a Pretext line visualizer on the right.
- The prepare step now uses `prepareWithSegments()` once per preset change, then the width slider reuses that prepared handle for `layout()`.
- The live timing row is intentionally narrow in scope: it shows the fast arithmetic path from `layout()`, not the extra rendering work needed to draw the explainer UI.
- The right panel uses cached segment ranges from the prepared data so the annotations do not secretly re-measure the text on every slider move.
- If the remote ESM import fails, the page falls back to a small built-in explainer engine so the local demo still works.
- The current pass still includes multilingual presets because they make the invisible work more concrete in demos, but the page is still structured around one paragraph and one slider.

## Upstream Or Local?

Keep this local for now.

Reason:
- The educational framing, copy, and side-by-side narration are specific to this workspace's PRD 01 goal.
- If the explanatory rendering helpers become broadly useful across future demos, extract them later.
