# 2026-03-28 Socratic Chat Shrinkwrap

## Goal

Build the first local PRD 03 prototype: a chat-style learning guide where tutor messages, choices, and reaction bubbles shrinkwrap to the tightest multiline width instead of staying as wide as normal CSS would leave them.

## Commands

Serve the experiment from its folder with any static server. One simple option:

```sh
cd /Users/justinlai/Coding/Pretext/experiments/2026-03-28-socratic-chat-shrinkwrap
python3 -m http.server 8030
```

Then open `http://localhost:8030/`.

## Fonts And Browser Assumptions

- Bubble text is measured with the same stack used by the CSS: `"Inter", Arial, sans-serif`.
- The key font strings are `500 15px "Inter", Arial, sans-serif`, `600 15px "Inter", Arial, sans-serif`, and `700 13px "Inter", Arial, sans-serif`.
- The page loads Inter from Google Fonts and imports Pretext from a CDN.
- `system-ui` is intentionally avoided because the upstream research notes document macOS measurement mismatches.
- This prototype should be checked in Chrome and Safari.

## Findings

- The core shrinkwrap logic follows the upstream bubbles demo pattern: collect wrap metrics, binary-search the tightest width that preserves line count, then render either the tight width or the CSS-comparison width.
- The current page ships with three topic templates: two-step equations, how the internet works, and a design-thinking loop.
- The first pass includes progressive reveal, choice gates, a slider widget, a packet-route widget, and a reorder widget.
- A comparison toggle switches between `Pretext shrinkwrap` and `CSS comparison` so the visual payoff is easy to show in person.
- The engine is still intentionally local and lightweight: one HTML file, inline data, and no build step.

## Upstream Or Local?

Keep this local for now.

Reason:
- The shrinkwrap helpers are clearly inspired by the upstream bubbles demo, but the lesson flow, widget gating, and presentation are specific to the EdTech chat use case.
- If a future pass produces reusable bubble-measurement utilities that fit the upstream demos, extract those separately later.
