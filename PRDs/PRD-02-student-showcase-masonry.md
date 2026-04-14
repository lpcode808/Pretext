# PRD 02: Student App Showcase — A Masonry Wall Powered by Pretext

## One-liner
A responsive Pinterest-style masonry grid that showcases student-built apps, where every card's height is predicted by Pretext (no DOM measurement), the whole thing virtualizes for buttery 120fps scrolling, and it deploys as a single page to GitHub Pages.

## Who this is for
- **Primary:** The educator presenting "here's what my students built" at conferences, faculty meetings, or on a class website
- **Secondary:** Students themselves — seeing their work in a polished, professional showcase is motivating
- **Builder:** Non-webdev educator building via AI-assisted coding tools

## Why this matters
You already build single-file apps with your students — conference trackers, carnival calculators, ideation timers, comparison tools. Right now those live as scattered links or screenshots in a slide deck. A masonry showcase turns them into something that *feels* like a real product gallery.

The Pretext angle: masonry layouts are notoriously hard because every card has a different height (different description length, different tags). Traditional approaches either guess heights (janky), measure the DOM (slow), or use CSS columns (wrong order). Pretext solves this by predicting every card's text height with pure arithmetic before anything renders.

This is also a meta-teaching artifact: the showcase itself demonstrates the computational thinking principle of "decomposition" — breaking the layout problem into measurement (prepare) and positioning (layout), just like breaking an app idea into research → generate → tweak → deploy.

## Core experience
A clean grid of project cards. Each card has: project name, student name(s), a 1-3 sentence description, category tags, and a link to the live app. Cards have variable heights because descriptions vary. The grid reflows smoothly on resize. Scrolling through 50-200 cards feels instant.

At the bottom: a small "Powered by Pretext — zero DOM measurements" badge, linking to the explorable explanation (PRD 01) for curious visitors.

## Feature spec

### The card
```
┌─────────────────────────┐
│  🏷️ Category tag        │
│                         │
│  Project Name           │  ← bold, 18px
│  by Student Name        │  ← muted, 14px
│                         │
│  Description text that  │  ← 14px, variable length
│  wraps to multiple      │     THIS is what Pretext
│  lines depending on     │     measures for height
│  the content...         │     prediction
│                         │
│  [View App →]           │  ← link to live demo
└─────────────────────────┘
```

### Data source
- A simple JSON array at the top of the file (or a separate `projects.json`)
- Each entry: `{ name, student, description, category, url, color? }`
- Pre-populated with 10-15 example projects (use real-ish names and descriptions from the vibe coding workflow)
- Easy for the educator to edit — just change the JSON, no code knowledge needed

Example entries:
```json
[
  {
    "name": "Wa'er",
    "student": "Team Mālama",
    "description": "Earn points for sustainable actions like recycling and composting. Redeem in a virtual store. Built to encourage environmental stewardship in our school community.",
    "category": "sustainability",
    "url": "#"
  },
  {
    "name": "Carnival Scrip Calculator",
    "student": "Justin L.",
    "description": "Calculate exactly how much scrip you need for the school carnival. No more waiting in line twice.",
    "category": "utility",
    "url": "#"
  },
  {
    "name": "Conference Follow-up Tracker",
    "student": "Demo App",
    "description": "Capture names, notes, and follow-up actions during a conference. Copy everything to clipboard when you're done. No accounts needed.",
    "category": "productivity",
    "url": "#"
  }
]
```

### Layout engine
- Column count adapts to viewport: 1 col on mobile, 2 on tablet, 3-4 on desktop
- Card width = (viewport width - gaps) / columns
- Card height = fixed padding + title height + student name height + **Pretext-predicted description height** + tag height + link height
- The Pretext call: `prepare(description, '14px Inter')` → `layout(prepared, cardContentWidth, 20)` → gives `{ height }`
- Cards are positioned absolutely using calculated x/y coordinates — NOT CSS grid, NOT CSS columns
- On resize: recalculate column count → re-run layout() for all cards (should take <1ms total) → reposition

### Filtering and sorting
- Category filter buttons at the top (show all / sustainability / utility / productivity / game / learning)
- When filtering, cards animate out/in smoothly
- Sort by: name (A-Z) or newest first (if dates are added later)

### Virtualization (stretch but achievable)
- If >50 cards, only render cards visible in the viewport + a buffer above/below
- Pretext makes this trivial because all heights are known without rendering
- Scroll position drives which cards are in the DOM
- This is the Pretext masonry demo's core trick

## Technical spec

### Architecture
- Single HTML file, inline CSS and JS
- Import Pretext from CDN: `import { prepare, layout } from 'https://esm.sh/@chenglou/pretext'`
- Project data as a `const PROJECTS = [...]` at the top of the `<script>` section
- No framework. Vanilla JS. Template literals for card HTML.

### Key Pretext APIs used
```
prepare(text, font)           → one-time measurement per description
layout(prepared, maxWidth, lineHeight) → { height } for card sizing
```

This project uses only Use Case 1 from the Pretext API — the simplest path. No line-level APIs needed.

### Card height calculation (pseudo)
```js
const CARD_PADDING = 24          // top + bottom padding
const TITLE_HEIGHT = 28          // project name line
const STUDENT_HEIGHT = 20        // "by Student Name" line
const TAG_HEIGHT = 28            // category tag
const LINK_HEIGHT = 24           // "View App →" link
const GAP_TOTAL = 32             // vertical gaps between elements
const LINE_HEIGHT = 20           // for description text

function cardHeight(project, cardWidth) {
  const contentWidth = cardWidth - 32  // horizontal padding
  const prepared = prepare(project.description, '14px Inter')
  const { height: descHeight } = layout(prepared, contentWidth, LINE_HEIGHT)
  return CARD_PADDING + TITLE_HEIGHT + STUDENT_HEIGHT + descHeight + TAG_HEIGHT + LINK_HEIGHT + GAP_TOTAL
}
```

### Masonry positioning (pseudo)
```js
function positionCards(projects, containerWidth, columnCount) {
  const gap = 16
  const colWidth = (containerWidth - gap * (columnCount - 1)) / columnCount
  const colHeights = new Array(columnCount).fill(0)  // running height per column

  return projects.map(project => {
    const shortestCol = colHeights.indexOf(Math.min(...colHeights))
    const x = shortestCol * (colWidth + gap)
    const y = colHeights[shortestCol]
    const h = cardHeight(project, colWidth)
    colHeights[shortestCol] = y + h + gap
    return { project, x, y, width: colWidth, height: h }
  })
}
```

### Rendering
- Cards rendered as absolutely-positioned `<div>` elements inside a relatively-positioned container
- Container height = max(colHeights)
- On resize: debounce 100ms → recalculate → reposition with `transform: translate(x, y)` for GPU acceleration
- Category colors: use a small palette (teal for sustainability, amber for utility, purple for learning, coral for games, gray for other)

### Font
- Use Inter from Google Fonts CDN (same as PRD 01 for consistency)
- Pretext font string must match CSS exactly: `'14px Inter'`
- Fallback: `'14px -apple-system, sans-serif'` but with a console warning about potential measurement mismatch

### Responsive breakpoints
- `< 480px`: 1 column
- `480-768px`: 2 columns
- `768-1024px`: 3 columns
- `> 1024px`: 4 columns

## Design direction
- Clean, modern card design — subtle border-radius, light shadows, not heavy Material Design
- Cards have a thin left border in the category color (like a colored tab)
- Hover effect: slight lift (translateY -2px) + shadow increase
- Category filter buttons: pill-shaped, outlined when inactive, filled when active
- Background: light neutral. Cards: white.
- Mobile: cards go full-width, single column, still looks polished
- Header: "Student App Showcase" with school/class name, customizable

## Deployment
- Single `index.html` (or `index.html` + `projects.json` for cleaner data editing)
- GitHub Pages from repo root
- No build step
- Educator updates the showcase by editing the JSON and pushing to GitHub (or editing directly on github.com)

## What success looks like
- Educator opens the page at a conference: "Here's what my students built this semester." Audience sees a polished, professional grid.
- Drag the browser window narrow → cards reflow smoothly into fewer columns. No jank.
- Someone asks "how does the layout work?" → educator points to the Pretext badge → opens PRD 01's explorable explanation
- A student sees their project on the wall and feels like they shipped something real

## Stretch goals
- Screenshot/thumbnail per project (static images, not live embeds)
- "Add your project" form that appends to the JSON (requires a tiny backend or GitHub API — probably too much for MVP)
- Animated entrance: cards fade/slide in as they enter the viewport during scroll
- QR code generator: click a card → get a QR code to the live app URL (great for conferences)
- Dark mode toggle

## Connections to other PRDs
- Links to PRD 01 (the explorable explanation) via the "Powered by Pretext" badge
- Could embed PRD 03's chat-style learning dialogue cards as a project type in the showcase
