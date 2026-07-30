# AGENTS.md — Pretext Workspace

## On Entry

1. Read `README.md` (project overview, experiment index)
2. Read `PRDs/PRD-00-agent-context.md` (API constraints, font rules, CDN import pattern, build order)

## What This Workspace Is

Research and EdTech prototype workspace built around Cheng Lou's `pretext` library. The upstream library lives in `upstream/chenglou-pretext/` (read-only reference). All local work goes in `experiments/`.

## Workspace Layout

```
upstream/chenglou-pretext/   ← clean upstream clone, do not edit
experiments/                 ← local prototypes, one folder per experiment
PRDs/                        ← product specs for the four projects
references/                  ← live demo snapshots, reference links
```

## Current State (as of 2026-04-08)

| Experiment | PRD | Status |
|---|---|---|
| 2026-03-28-student-showcase-masonry | PRD-02 | MVP complete |
| 2026-03-28-socratic-chat-shrinkwrap | PRD-03 | MVP complete |
| 2026-04-02-explorable-text-layout | PRD-01 | MVP complete |
| 2026-04-02-storybook-engine | PRD-04 | First pass complete, needs real book content |

Upstream: synced to `08a5ba0` on 2026-04-08 (`main` is ahead of the latest published npm tag `v0.0.4`). Run `bun install && bun test && bun run check` in `upstream/chenglou-pretext/` to verify.

## Critical Rules (always follow these)

### Font strings
Every `prepare()` / `prepareWithSegments()` call must use the **exact same font string** as the CSS `font` declaration for that text. Mismatch = wrong measurements = wrong line breaks with no error.

```js
// CSS: font: 500 16px "Inter", Arial, sans-serif
// Pretext call must be:
prepare(text, '500 16px "Inter", Arial, sans-serif')
```

### Never use system-ui
`system-ui` is unsafe on macOS — canvas and DOM resolve to different font variants at some sizes. Always use a named font: Inter, "Helvetica Neue", Arial. This is documented in `upstream/chenglou-pretext/RESEARCH.md`.

### CDN version pin
All experiments currently pin `@0.0.4`. When upstream releases a new version, grep for the version string across all experiments and update together:
```sh
grep -r "@chenglou/pretext@" experiments/
```

### Single-file constraint
Each experiment is one `index.html` (sometimes + a data JSON). No build step, no node_modules, no framework. Must work when opened locally AND deployed to GitHub Pages.

## Testing

A pnpm + Playwright test suite lives in `experiments/tests/`. It:
1. Builds the upstream dist locally (for CDN request interception)
2. Spins up a local static server for the HTML files
3. Verifies each experiment loads, Pretext initializes, and core interactions work

```sh
cd experiments/tests
pnpm install
pnpm test
```

Prereq: `cd upstream/chenglou-pretext && bun run build:package` (builds `dist/` once).

Upstream unit tests (library invariants only):
```sh
cd upstream/chenglou-pretext && bun test
```

## Open Work

- **Real book content for PRD-04**: user hasn't specified which books yet. The storybook engine is generic — drop in any `STORIES` JSON.
- **Illustration images for PRD-04**: currently colored placeholder divs. Add real image URLs when content is chosen.
- **`rich-inline` / `keep-all` are upstream-only for now**: upstream `main` has moved beyond the published `@0.0.4` release with `@chenglou/pretext/rich-inline` and `{ wordBreak: 'keep-all' }`. Keep deployable experiments pinned to `@0.0.4`, but study those newer APIs for future PRD-03 rich bubbles or PRD-04 vocabulary callouts.
- **PRD stretch goals**: thumbnails/QR codes (PRD-02), AI-powered responses / branching (PRD-03), audio sync / vocabulary mode (PRD-04).

## Handoff Protocol

When finishing a session, note what changed, what remains, and any risks/gotchas in a brief comment or commit message so the next session has context.

## Common Pitfalls

- `layoutNextLine()` requires `prepareWithSegments()`, not `prepare()`. Several experiments use both for different purposes.
- `layout()` (the fast path) accepts `prepare()` output. Don't mix them.
- The storybook `layoutNextLine()` loop must guard against infinite loops when `availWidth < 1`. Add a minimum (40px) or a fallback.
- After a font-size change, `prepare()` must be re-run (it is font-dependent). `layout()` is the cheap resize path — only re-run it on resize, not on every frame.
- Pretext `prepare()` is sync and relatively fast (~2-20ms for a paragraph). Safe to call in user event handlers. `layout()` is sub-millisecond — safe to call in `requestAnimationFrame`.

## Questions for Justin — `ASK.md`

<!-- ask-convention:v1 · propagated by ~/Coding/_scripts/propagate-ask-convention.sh.
     Edit the script, not this block — a re-run won't overwrite local edits, it just skips. -->

When you hit a decision that is genuinely Justin's to make, and you can't resolve it from this repo,
the request, or a sensible default: append it to `ASK.md` at this repo's root (create the file if it
doesn't exist), then keep going on everything that doesn't depend on the answer.

    - [ ] YYYY-MM-DD · **The question, one sentence, in bold.**
          Context: why it came up. One or two lines.
          Options: (a) the one you'd pick and why (b) the real alternative
          Blocks: what's stalled — or "nothing, I proceeded with (a)"
          Asked-by: <harness>

Append at the bottom. Never delete, reorder, or check your own box. Always draft the options — a
question with no options is homework; a question with two named options and a recommendation is a
fifteen-second decision.

Justin's laptop sweeps every repo's `ASK.md` on a schedule and he answers them in one sitting. The
answer comes back into this same file as a checked item with an `**Answer (date):**` line, so a
later session reads it as settled rather than re-asking.

Ask sparingly — one or two real asks per session is a lot. Routine judgment calls, file moves,
cleanups, and merge conflicts are inside the assignment, not asks. If you could proceed under an
assumption, proceed under it and say which one you took.
