# Pretext EdTech Experiments

Four single-file interactive prototypes exploring [Pretext](https://github.com/chenglou/pretext) — Cheng Lou's library for text measurement without DOM reflow — applied to K-12 education and maker learning.

## Experiments

| Experiment | What it shows |
|------------|--------------|
| [Explorable: How Text Layout Works](experiments/2026-04-02-explorable-text-layout/) | Interactive explainer: `prepare()` once, `layout()` many times |
| [Student App Showcase](experiments/2026-03-28-student-showcase-masonry/) | Masonry card feed with virtualized heights from Pretext measurements |
| [Socratic Chat](experiments/2026-03-28-socratic-chat-shrinkwrap/) | Shrinkwrapped chat bubbles that find their tight multiline width before render |
| [Storybook Engine](experiments/2026-04-02-storybook-engine/) | Text flowing around moving obstacles — animated tide wave, draggable robot, 60fps paper plane |

Each experiment is a **single HTML file** with embedded CSS and JS. No build step, no framework, no dependencies.

## Running locally

Most experiments open directly in a browser. The Storybook Engine needs a static server for ES module imports:

```sh
cd experiments/2026-04-02-storybook-engine
python3 -m http.server 8050
# open http://localhost:8050
```

If you use Claude Code desktop, `.claude/launch.json` has the server config — the preview panel will start it automatically.

## Why Pretext?

DOM measurement (`getBoundingClientRect`, layout-flush-read cycles) forces the browser to serialize layout before returning values — expensive and impossible to batch.

Pretext separates text work into two phases:

- **`prepare(text, font)`** — runs once per text+font pair. Does the real measurement (Canvas API). Result is serializable and reusable.
- **`layout(prepared, width)`** — purely arithmetic. Sub-millisecond. Safe to call in `requestAnimationFrame` on every resize, pointer event, or animation frame.

This separation unlocks UI patterns that are impractical with standard DOM measurement: shrinkwrapped bubbles, masonry from predicted heights, obstacle-aware text flow at 60fps.

## Project specs

Design specs for each experiment live in [`PRDs/`](PRDs/). [`PRD-00`](PRDs/PRD-00-agent-context.md) covers shared technical constraints and the Pretext API surface. The specs are written for AI-assisted development (Claude Code, Cursor).

## Tests

A Playwright suite in [`experiments/tests/`](experiments/tests/) verifies each experiment loads, Pretext initializes, and core interactions work.

```sh
cd experiments/tests
pnpm install
pnpm test
```

The tests intercept CDN requests with a local Pretext build. Prerequisite: clone the upstream library and build it once:

```sh
git clone https://github.com/chenglou/pretext upstream/chenglou-pretext
cd upstream/chenglou-pretext
bun install && bun run build:package
```

## Upstream reference

The Pretext library itself lives at [github.com/chenglou/pretext](https://github.com/chenglou/pretext). This repo pins experiments to `@chenglou/pretext@0.0.4` via CDN import. The upstream repo is not vendored here — clone it separately if you want to study the source or run the library's own tests.
