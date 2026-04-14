# PRD 04: Storybook Engine — Interactive Picture Book Pages with Pretext

## One-liner
A single-page reading engine that renders children's book text around illustration zones, paginates without DOM measurement, and offers a read-along mode with line-by-line word highlighting — all powered by Pretext's obstacle-aware line layout.

## Who this is for
- **Primary:** Young readers (K-5) and their teachers/parents who want an engaging on-screen reading experience
- **Secondary:** Educators building or curating digital picture book libraries for classroom use
- **Builder:** Non-webdev educator using AI-assisted tools to create learning content

## Why this matters
Children's picture books are defined by the interplay of text and image. Digital versions almost always compromise: either text is baked into page images (not accessible, not resizable) or it's rendered as a plain block below the image (boring, loses the editorial feel). Pretext's `layoutNextLine()` can flow text around illustration zones line by line with a different available width per row, producing real editorial layout without CSS floats, shapes, or grid hacks — and with instant re-pagination when font size changes.

## Core experience
A book-like page with a warm illustration zone (placeholder colored area or image) occupying a portion of the page. Story text flows elegantly around it. The reader navigates page by page. A slider adjusts font size and the text instantly re-paginates (no DOM measurement needed). A "Read Along" toggle highlights the current line with a subtle wash, advancing on click or tap.

## Feature spec

### Page layout
- Each "page" is a viewport-height panel with a left/right illustration zone and flowing text
- Text wraps around the illustration using `layoutNextLine()` with variable widths per line
- Pages are predicted ahead of time: Pretext knows exactly how many lines fit and where page breaks fall
- Smooth page transitions (slide or fade)

### Story data
- Simple JSON array: `{ title, author, pages: [{ text, illustration: { position, color, label } }] }`
- Pre-loaded with 2-3 short original placeholder stories (not copyrighted material)
- Easy for an educator to replace with any book text

### Font size slider
- Range from 16px to 32px (accessibility)
- Changing font size re-runs `prepare()` once, then `layoutNextLine()` re-paginates instantly
- Live page count updates: "Page 2 of 5" adjusts in real time

### Read-along mode
- Toggle on: the current line gets a soft highlight background
- Tap/click advances to the next line
- Uses `layoutWithLines()` to know exact line boundaries
- At end of page, automatically advances to next page

### Navigation
- Left/right arrows or swipe for page turns
- Page indicator dots
- Keyboard support (arrow keys)

## Technical spec

### Key Pretext APIs used
```
prepare(text, font)                     → re-run when font size changes
prepareWithSegments(text, font)         → for read-along line access
layoutNextLine(prepared, cursor, width) → flow text around illustration obstacles
layoutWithLines(prepared, maxWidth, lh) → for read-along line boundaries
layout(prepared, maxWidth, lineHeight)  → for quick page-height prediction
```

### Obstacle-aware layout (pseudo)
```js
function layoutPage(prepared, pageWidth, pageHeight, illustration, lineHeight) {
  let cursor = { segmentIndex: 0, graphemeIndex: 0 }
  let y = 0
  const lines = []

  while (y + lineHeight <= pageHeight) {
    const width = getAvailableWidth(y, lineHeight, pageWidth, illustration)
    const line = layoutNextLine(prepared, cursor, width)
    if (line === null) break
    lines.push({ ...line, x: getLineX(y, lineHeight, pageWidth, illustration), y })
    cursor = line.end
    y += lineHeight
  }

  return { lines, nextCursor: cursor, linesUsed: lines.length }
}
```

### Architecture
- Single HTML file, inline CSS and JS
- Import Pretext from CDN (`@0.0.4`)
- No framework, vanilla JS
- Story data as a `const STORIES = [...]` at the top
- Must work locally and on GitHub Pages

### Font
- Use Inter for body text: `'500 20px "Inter", Arial, sans-serif'` (default size)
- Fraunces for title/headers
- DO NOT use system-ui

### Responsive
- Desktop: landscape book spread feel
- Mobile: single panel, illustration above text, still paginated

## Design direction
- Warm, inviting — picture book feel, not clinical
- Soft paper-like background
- Illustration zones are rounded rectangles with gentle gradients (placeholder for real images)
- Text has generous line height for young readers (1.8-2.0)
- Page turn transitions should feel physical but not gimmicky
- Navigation arrows are large and friendly

## What success looks like
- A teacher opens this on a classroom screen, picks a story, and students follow along as the highlighted line advances
- A parent adjusts the font size larger for an early reader; the pages re-paginate instantly
- Text hugs the illustration zone beautifully — it looks like a real picture book, not a web page
- Swapping in new story content is as simple as editing a JSON object

## Connections to other PRDs
- Uses the same obstacle-aware `layoutNextLine()` that PRD 01's "Why should you care?" section references
- Could appear as a student project in PRD 02's masonry showcase
- The read-along mode is a natural extension of PRD 03's progressive-reveal pattern

## Stretch goals
- Real image support (illustration zones accept image URLs)
- Audio narration sync (timestamp array maps to line positions)
- Vocabulary mode: tap a word to see a definition tooltip
- Multiple layout templates (illustration left, right, top, or full-bleed)
- Print-friendly CSS for physical classroom copies
