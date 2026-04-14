# Live Demo Snapshot

Last updated: April 2, 2026.

These are the public demo indexes that were live when this workspace was last synced. They may drift from the cloned upstream checkout over time.

## Official Demo Index

Source: [chenglou.me/pretext](https://chenglou.me/pretext/)

- `Accordion`
  - Expand/collapse sections with heights calculated from Pretext
- `Bubbles`
  - Tight multiline message bubbles with less wasted area
- `Dynamic Layout`
  - Fixed-height editorial spread with obstacle-aware title routing
- `Variable Typographic ASCII`
  - Particle-driven ASCII using proportional glyph measurement
- `Editorial Engine`
  - Animated orbs, live text reflow, pull quotes, and multi-column flow
- `Rich Text`
  - Inline text, code spans, links, and chips laid out together
- `Masonry`
  - Text-card occlusion/virtualization from predicted heights instead of DOM reads
- `Justification Comparison` (new in v0.0.4)
  - Native CSS justification, greedy hyphenation, and Knuth-Plass-style paragraph layout side by side

## Additional Demo Index

Source: [somnai-dreams.github.io/pretext-demos](https://somnai-dreams.github.io/pretext-demos/)

- `The Editorial Engine`
  - Multi-column editorial layout with draggable orbs and real-time text reflow
- `Fluid Smoke`
  - Full-screen fluid simulation rendered as proportional typographic ASCII
- `Wireframe Torus`
  - Rotating 3D torus rendered through a proportional character grid
- `Variable Typographic ASCII`
  - Particle system mapped to characters by brightness and width across 3 weights
- `Calligram Engine`
  - A typed word rendered as a shape using its own letters
- `Shrinkwrap Showdown`
  - CSS `fit-content` versus Pretext for exact tight multiline width

## Why Keep This

- The official upstream clone contains code and docs, but not necessarily every public experiment.
- The live demos are a good map of the design space this work is opening up.
- Several of the most interesting experiments are about layout and interaction patterns, not just raw text measurement.
- The justification comparison demo is a strong conference artifact on its own — worth showing alongside the PRD experiments.
