# 2026-03-28 Student Showcase Masonry

## Goal

Build the first local PRD implementation in this workspace: a student app showcase that uses Pretext to predict card heights before rendering.

## Commands

Serve the experiment from its folder with any static server. One simple option:

```sh
cd /Users/justinlai/Coding/Pretext/experiments/2026-03-28-student-showcase-masonry
python3 -m http.server 8020
```

Then open `http://localhost:8020/`.

## Fonts And Browser Assumptions

- Card text is measured with the same stack used by the CSS: `"Inter", Arial, sans-serif`.
- The relevant font strings are `700 18px "Inter", Arial, sans-serif`, `500 13px "Inter", Arial, sans-serif`, and `400 14px "Inter", Arial, sans-serif`.
- The page loads Inter from Google Fonts and loads Pretext from a CDN.
- This prototype is meant to be checked in Chrome and Safari.
- `system-ui` is intentionally avoided because the upstream research notes document macOS measurement mismatches.

## Findings

- The first pass follows the PRD 02 recommendation and stays inside the simple `prepare()` + `layout()` API surface.
- The implementation also measures title and byline text with Pretext, not just the description, so card heights stay predictable when project names get longer.
- The wall uses absolute positioning and lightweight viewport virtualization so the DOM only mounts nearby cards.
- Filters and sorting are included, but the content is still inline data for easy editing.
- The page now includes a plain-language responsiveness explainer: one live relayout number measured on the current device, plus a clearly labeled upstream benchmark snapshot for comparison context.

## Upstream Or Local?

Keep this local for now.

Reason:
- The structure borrows heavily from the upstream masonry demo, but the content model, controls, and presentation are specific to the EdTech showcase use case.
- If the layout utilities become broadly reusable across more experiments, extract them later.
