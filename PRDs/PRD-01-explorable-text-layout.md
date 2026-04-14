# PRD 01: "How Your Browser Lays Out Text" — An Explorable Explanation

## One-liner
A single-page interactive essay that lets readers drag a slider and watch text reflow in real time, with Pretext's measurements visible alongside the browser's rendering — teaching how text layout actually works under the hood.

## Who this is for
- **Primary:** Educators, students, and curious people who use the web daily but have no idea what happens when text wraps to the next line
- **Secondary:** Conference demo audience (EdTech presentations) — this should be impressive on a projector
- **Builder:** Non-webdev educator who builds single-file HTML apps via AI-assisted vibe coding (Cursor, Claude Code, etc.)

## Why this matters
Every website you visit runs a text layout algorithm. Nobody teaches how it works. Bret Victor's principle: "Creators should have an immediate, visual connection to what they're creating." This applies to *understanding* too — readers should have an immediate, visual connection to the systems they use every day.

Pretext makes this teachable because it exposes what the browser hides: segment widths, line break decisions, cached measurements, and the pure arithmetic that turns a string into wrapped lines.

## Core experience (the "aha moment")
The reader drags a width slider. Two panels update simultaneously:
1. **Left panel: "The browser's way"** — a real `<div>` with CSS doing text wrapping. It Just Works™ but you can't see anything happening.
2. **Right panel: "Pretext's way"** — the same text, same font, same width, but now you can see: each word's measured width annotated above it, the running line-width sum, the exact pixel where a line break fires, and a counter showing "layout() took 0.003ms — no DOM touched."

When the reader resizes, the left panel flickers slightly (it's reflowing). The right panel is instant (pure math). That's the feeling.

## Feature spec

### Section 1: "What happens when text wraps?"
- Static paragraph of text (use something engaging, not lorem ipsum — maybe a passage about Hawai'i or a fun science fact)
- Width slider (200px – 800px)
- Side-by-side panels as described above
- Right panel shows word segments with widths annotated (small text above each word like "42.5px")
- A running "line width" bar that fills up as words accumulate, with a red threshold line at maxWidth
- When the bar exceeds the threshold → line break fires → bar resets → next line starts
- Real-time counters: `prepare(): ran once, 2.1ms` / `layout(): 0.003ms` / `DOM reads: 0`

### Section 2: "The prepare/layout split"
- Interactive demo: a "Prepare" button that visibly segments the text and measures each piece (animated, maybe 1 second, showing canvas.measureText being called per word)
- Then a "Resize" loop that calls only layout() — showing it's just addition and comparison, no measurement
- Key insight displayed: "prepare() runs once. layout() runs every time you resize. That's why it's fast."

### Section 3: "What about emoji? What about Arabic?"
- Toggle buttons to switch the demo text to: English, English+Emoji, CJK (Chinese/Japanese), Arabic (RTL), Mixed
- Shows how Pretext handles each — different segmentation, different break rules
- Brief plain-English annotations for each: "Emoji are wider on Canvas than in the DOM on Chrome. Pretext auto-corrects." / "Arabic reads right-to-left. Pretext handles bidirectional text."
- This section exists for the "whoa" factor and to show the engineering depth

### Section 4: "Why should you care?"
- Three clickable cards showing real use cases:
  1. **Virtual scrolling** — "Know the height of 10,000 items without rendering them"
  2. **Shrinkwrap** — "Find the tightest chat bubble width. CSS can't do this." (link to shrinkwrap-showdown demo)
  3. **Custom layout** — "Flow text around an image without CSS" (link to editorial-engine demo)

## Technical spec

### Architecture
- **Single HTML file** with embedded CSS and JS (matches the educator's vibe-coding workflow and deployment model)
- Import Pretext from CDN: `<script type="module">` with `import { prepare, layout, prepareWithSegments, layoutWithLines } from 'https://esm.sh/@chenglou/pretext'`
- If CDN import doesn't work cleanly, fall back to a local bundle (copy from node_modules)
- No React, no build step, no framework
- Must work when opened as a local file AND when deployed to GitHub Pages

### Key Pretext APIs used
```
prepare(text, font)           → opaque handle for height-only measurement
layout(prepared, maxWidth, lineHeight) → { height, lineCount }
prepareWithSegments(text, font) → richer handle exposing segment data
layoutWithLines(prepared, maxWidth, lineHeight) → { lines: [...] }
walkLineRanges(prepared, maxWidth, onLine) → callback per line with width info
```

### Rendering approach
- Left panel: plain DOM (`<div>` with `max-width` and real CSS text wrapping)
- Right panel: DOM-rendered but positioned using Pretext's line data. Each line is a `<span>` positioned absolutely using Pretext's computed positions. Word-width annotations are small `<span>` elements positioned above each word.
- DO NOT use Canvas rendering — keep it DOM so text is selectable and accessible
- Use `requestAnimationFrame` for smooth slider interaction

### Font
- Use `'16px Inter'` as the demo font (or `'16px "Helvetica Neue"'` as fallback)
- Load Inter from Google Fonts CDN
- IMPORTANT: Pretext's `font` param must match the CSS `font` declaration exactly. If CSS says `font: 16px Inter`, Pretext's prepare() must get `'16px Inter'`.
- DO NOT use `system-ui` — it causes measurement mismatches on macOS (documented in Pretext's RESEARCH.md)

### Responsive behavior
- On desktop: side-by-side panels
- On mobile/narrow: stacked panels, slider still works
- The page itself should be a clean, readable essay — text between the interactive sections, not just a raw demo

### Performance targets
- Slider interaction must feel instant (< 16ms per frame)
- No visible jank when dragging
- layout() should never take more than 1ms for the demo text

## Design direction
- Clean, editorial feel — like a Bartosz Ciechanowski or Bret Victor essay
- White/light background, good typography
- Annotations and measurements in a muted color (gray or light blue) so they don't overwhelm the text
- The "line width bar" visualization should be simple — a thin horizontal bar that fills, like a loading bar
- No flashy animations. The interactivity IS the wow factor.
- Include a "Read more" footer linking to: Pretext repo, Pretext RESEARCH.md, Bret Victor's Explorable Explanations essay

## Deployment
- Single `index.html` file
- Host in a GitHub repo under `/docs` or use GitHub Pages from root
- No build step required — just push and it's live
- Include a `README.md` in the repo explaining what this is

## What success looks like
- A teacher can open this on a projector at a conference and drag the slider. The audience goes "ohhh."
- A student can read through it in 5 minutes and understand what text reflow is
- A developer can look at the source and understand how Pretext works
- The page loads fast, works offline (after first load), and runs at 120fps

## Reference material
- Pretext repo: https://github.com/chenglou/pretext
- Pretext README (API docs): in the repo
- Pretext RESEARCH.md: extensive documentation of how it works internally
- Community demos: https://somnai-dreams.github.io/pretext-demos/ (especially shrinkwrap-showdown for walkLineRanges usage)
- Official demos: https://chenglou.me/pretext/ (bubbles, masonry, dynamic-layout)
- Bret Victor's "Explorable Explanations": https://worrydream.com/ExplorableExplanations/
- Bret Victor's "Up and Down the Ladder of Abstraction": https://worrydream.com/LadderOfAbstraction/

## Stretch goals (not MVP)
- "Try your own text" input box where readers paste their own paragraph and see it measured
- Performance comparison: a "Stress test" button that measures 1000 paragraphs and shows timing
- A "View source" panel that shows the actual JS code running each demo inline
