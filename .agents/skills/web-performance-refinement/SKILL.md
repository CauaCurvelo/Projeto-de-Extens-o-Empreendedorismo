---
name: web-performance-refinement
description: "Web performance and frontend optimization guidelines for zero-jank 60fps animations, Core Web Vitals optimization, minimal repaints, and asset efficiency."
---

# Web Performance & Frontend Optimization

Guidelines to guarantee lightning-fast load times, zero layout shifts (CLS = 0), and silky smooth 60fps interactions.

---

## 1. Zero-Jank Rendering & Paint Budget

- **Compositor-Only Animations**:
  - NEVER animate layout triggers (`width`, `height`, `top`, `left`, `margin`, `padding`).
  - ALWAYS animate composite triggers (`transform: translate3d/scale`, `opacity`).
- **Will-Change Restraint**:
  - Use `will-change: transform` only on active elements during transitions, removing it when idle to conserve GPU memory.

---

## 2. Core Web Vitals Safeguards

- **Cumulative Layout Shift (CLS)**:
  - Pre-allocate space for dynamic content, badges, and counters.
  - Reserve aspect ratios for images and SVG containers.
- **First Input Delay & Interaction to Next Paint (INP)**:
  - Debounce search input handlers (100ms–150ms) to prevent main thread blocking while filtering large data objects.
  - Defer non-critical DOM updates using `requestAnimationFrame` when batch-rendering cards.
