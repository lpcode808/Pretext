# PRD 03: Socratic Chat — A Learning Guide with Shrinkwrapped Bubbles

## One-liner
An interactive learning guide presented as a chat conversation with perfectly tight message bubbles (no wasted space), progressive reveal of concepts, and inline explorable widgets — powered by Pretext's shrinkwrap measurement that CSS literally cannot do.

## Who this is for
- **Primary:** Students (middle school through adult) working through a concept at their own pace
- **Secondary:** Educators who want a more engaging format than static text or bullet-point slides for their learning guides
- **Builder:** Non-webdev educator using AI-assisted tools to create learning content

## Why this matters
You already build interactive learning guides — two-step equation explorables, stylized wikis, concept explainers. The format is usually a single-page app with sections. Chat is a more natural format for learning: it's a dialogue, it's paced, and students are already fluent in chat interfaces from iMessage/Discord/etc.

The Pretext angle: chat bubbles in every messaging app have an annoying problem — they're too wide. CSS `fit-content` sizes the bubble to the widest line, leaving ugly dead space when the last line is short. Pretext's `walkLineRanges()` can binary-search the *exact* tightest width that still wraps to the same number of lines. The result: bubbles that hug their text perfectly. This is a real visual improvement that makes the chat feel polished and professional.

See the shrinkwrap-showdown demo for the exact comparison: https://somnai-dreams.github.io/pretext-demos/shrinkwrap-showdown.html

## Core experience
The page looks like a chat thread. A "tutor" persona asks questions and explains concepts. The student reads along, and at key moments:
- **Multiple choice appears** as tappable bubble options ("Which of these is the next step?")
- **Explorable widgets appear inline** as special "media" messages (a draggable number line, a toggleable diagram, a mini calculator)
- **Reveals happen progressively** — the next batch of messages appears after the student interacts (tap a choice, drag a slider, scroll to a trigger point)

Every message bubble is shrinkwrapped to its tightest possible width. The visual effect is subtle but professional — it looks *better* than iMessage/WhatsApp without the reader knowing why.

## Feature spec

### Message types

**Tutor message** (left-aligned, light background)
```
┌──────────────────────┐
│ Let's think about    │  ← shrinkwrapped to tightest
│ what happens when    │     width that preserves
│ you multiply both    │     the same line count
│ sides of an equation │
│ by -1.               │
└──────────────────────┘
```

**Student choice** (right-aligned, colored background, tappable)
```
              ┌──────────────────┐
              │ The inequality   │
              │ sign flips!      │
              └──────────────────┘
              ┌──────────────────┐
              │ Nothing changes  │
              └──────────────────┘
```

**Explorable widget** (full-width, embedded inline)
```
┌─────────────────────────────────┐
│  ◄──────●──────────────►        │
│  x = 3                         │
│                                 │
│  2x + 4 = 10                   │
│  2(3) + 4 = 10  ✓              │
└─────────────────────────────────┘
```

**Reaction/feedback** (small, centered)
```
         ┌────────────┐
         │ ✓ Correct! │
         └────────────┘
```

### Conversation data structure
The conversation is defined as a simple array — easy for an educator to edit:

```js
const CONVERSATION = [
  {
    type: "tutor",
    text: "Hey! Let's figure out how to solve two-step equations. Ready?"
  },
  {
    type: "tutor",
    text: "Here's one: 2x + 4 = 10. The goal is to get x alone. What would you do first?"
  },
  {
    type: "choice",
    options: [
      { text: "Subtract 4 from both sides", correct: true },
      { text: "Divide both sides by 2", correct: false, feedback: "That would work, but convention says deal with addition/subtraction first. Try again!" },
      { text: "Subtract 10 from both sides", correct: false, feedback: "That would give us a negative number on the right. Let's keep it simple." }
    ]
  },
  {
    type: "tutor",
    text: "Yes! Subtract 4 from both sides: 2x + 4 - 4 = 10 - 4, which gives us 2x = 6."
  },
  {
    type: "widget",
    widget: "equation-slider",
    config: { equation: "2x + 4 = 10", variable: "x", min: 0, max: 10, answer: 3 }
  },
  {
    type: "tutor",
    text: "Drag the slider to find the value of x that makes 2x = 6 true."
  },
  // ... more conversation steps
]
```

### Progressive reveal
- Messages appear in batches, not all at once
- Each batch ends at a `choice` or `widget` interaction point
- After the student interacts, the next batch animates in (slide up, like real chat)
- A subtle typing indicator ("...") appears before tutor messages for 300-500ms
- Scroll automatically follows the newest message

### Shrinkwrap algorithm (the Pretext magic)
For every text message, instead of just setting CSS `max-width`, we find the optimal width:

```js
import { prepareWithSegments, walkLineRanges, layout } from '@chenglou/pretext'

function shrinkwrap(text, font, maxWidth, lineHeight) {
  const prepared = prepareWithSegments(text, font)

  // Get line count at max width
  const { lineCount: targetLines } = layout(prepared, maxWidth, lineHeight)

  // Binary search for tightest width that still produces same line count
  let lo = 0, hi = maxWidth
  while (hi - lo > 1) {
    const mid = (lo + hi) / 2
    const { lineCount } = layout(prepared, mid, lineHeight)
    if (lineCount <= targetLines) {
      hi = mid  // still fits, try tighter
    } else {
      lo = mid  // too tight, broke to more lines
    }
  }

  return hi  // tightest width that preserves line count
}
```

Alternatively, use `walkLineRanges()` to find the widest line directly:
```js
function shrinkwrap(text, font, maxWidth, lineHeight) {
  const prepared = prepareWithSegments(text, font)
  let maxLineWidth = 0
  walkLineRanges(prepared, maxWidth, line => {
    if (line.width > maxLineWidth) maxLineWidth = line.width
  })
  return Math.ceil(maxLineWidth)  // tightest container = widest line
}
```

The second approach is simpler and more direct. Use it.

### Topic templates
The conversation data is the content — the engine is generic. Include 2-3 example topics:

1. **Two-step equations** (math) — with an equation-solver slider widget
2. **How does the internet work?** (CS/CT) — with a packet-routing diagram widget
3. **Design thinking process** (general) — with a drag-to-reorder steps widget

The educator swaps topics by changing the CONVERSATION array. The engine stays the same.

## Technical spec

### Architecture
- Single HTML file, inline CSS and JS
- Import Pretext from CDN
- No framework. Vanilla JS with template literals.
- Conversation data at the top of the script — clearly commented as "EDIT THIS SECTION"
- Widget components defined as functions that return HTML strings

### Key Pretext APIs used
```
prepareWithSegments(text, font)  → for shrinkwrap measurement
walkLineRanges(prepared, maxWidth, onLine) → find widest line width
layout(prepared, maxWidth, lineHeight) → for height prediction (scroll management)
```

### Rendering
- Messages are `<div>` elements with inline `style="width: ${shrinkwrappedWidth}px"`
- Tutor messages: left-aligned, light gray background, rounded corners (not bottom-left)
- Student choices: right-aligned, blue/teal background, rounded corners (not bottom-right)
- Widgets: full-width cards with a subtle border
- Progressive reveal: messages start with `opacity: 0; transform: translateY(20px)` and animate in

### Typing indicator
```html
<div class="typing-indicator">
  <span></span><span></span><span></span>
</div>
```
Three dots that pulse with CSS animation. Shown for 300-500ms before each tutor message batch.

### Widget system
Each widget type is a function:
```js
const WIDGETS = {
  'equation-slider': (config) => `
    <div class="widget-card">
      <div class="equation">${config.equation}</div>
      <input type="range" min="${config.min}" max="${config.max}" value="${config.min}"
             oninput="updateEquation(this, ${JSON.stringify(config)})">
      <div class="result" id="eq-result">x = ${config.min}</div>
    </div>
  `,
  // more widget types...
}
```

Keep widgets simple — sliders, toggles, drag-to-reorder. Not full applications.

### Font
- Use `'15px Inter'` for message text (slightly smaller than PRD 01 — chat convention)
- Pretext font string: `'15px Inter'`
- Load Inter from Google Fonts
- DO NOT use system-ui

### Scroll behavior
- Container is a scrollable `<div>` with `scroll-behavior: smooth`
- After each new message batch, scroll to the newest message
- Use Pretext's `layout()` to predict total content height for scroll calculations

### Mobile
- Chat interface should feel natural on mobile (it's already a chat layout)
- Max bubble width: 80% of viewport on mobile, 60% on desktop
- Tap targets for choices: minimum 44px height
- No horizontal scrolling ever

## Design direction
- Looks like a real chat app, not a "learning management system"
- Clean, minimal — white background, light gray tutor bubbles, soft blue student bubbles
- Tutor avatar: a small circle with an icon or emoji (📚 or 🤖 or a custom initial)
- Rounded corners on bubbles: 16px, with the "tail" corner at 4px (like iMessage)
- Feedback messages (correct/incorrect) are small, centered, with a ✓ or ✗ icon
- Widgets have a subtle card style — thin border, slight background tint
- "Powered by Pretext" footer, very subtle

### Comparison callout (optional but impactful)
A toggle at the top: "Show CSS comparison" that switches all bubbles between CSS `fit-content` (with visible wasted space highlighted in pink) and Pretext shrinkwrap. This is the demo moment at a conference — toggle it and watch bubbles tighten up.

## Deployment
- Single `index.html` file
- GitHub Pages
- Educator forks the repo, edits the CONVERSATION array, pushes, done
- Keep the default version as one HTML file with 2-3 built-in topic presets (equations, internet, design thinking) switched by tabs or a selector.
- If someone later wants separate topical forks, duplicate the same single-file engine and swap only the conversation data; do not turn the core project into a multi-page app unless there is a strong reason.

## What success looks like
- Student opens on their phone, taps through a two-step equation lesson in 5 minutes
- It feels like texting with a smart friend, not reading a textbook
- Educator shows it at a conference, toggles the CSS comparison, audience sees the bubbles tighten — "wait, CSS can't do that?"
- Another teacher asks "can I make one for my subject?" — the answer is "yes, just edit the JSON array"

## The ADEPT connection
This format naturally maps to the ADEPT learning method:
- **Analogy**: tutor messages can set up analogies conversationally ("Think of an equation like a balanced scale...")
- **Diagram**: widget messages embed interactive diagrams inline
- **Example**: the progressive reveal IS the worked example
- **Plain English**: the chat format forces plain language (nobody writes formal prose in chat)
- **Technical**: final messages can introduce formal notation after the intuition is built

## Stretch goals
- **Branching conversations**: wrong answers lead to remediation branches, then rejoin the main path
- **AI-powered responses**: instead of pre-written conversation, use the Anthropic API (Claude) to generate tutor responses dynamically. The shrinkwrap still works because Pretext measures whatever text comes back.
- **Progress persistence**: save which conversation steps the student has completed (localStorage)
- **Conversation editor**: a simple UI where the educator types tutor messages and defines choices, exporting the CONVERSATION JSON
- **Multilingual support**: Pretext handles CJK, Arabic, Thai, etc. — the same engine works for conversations in any language

## Connections to other PRDs
- PRD 01's explorable explanation could be embedded as a widget message in this chat ("Let me show you how text wrapping works — drag this slider")
- PRD 02's showcase could feature this chat as one of the student/teacher projects on display
- The CSS comparison toggle in this PRD echoes the side-by-side approach in PRD 01
