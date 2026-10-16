---
name: frontend-design
description: "Design and implement high-craft, distinctive, production-grade frontend interfaces that avoid generic AI slop, adhering strictly to intentional aesthetic directions, accessibility, and visual memorability."
---

# Frontend Design & Visual Craftsmanship

You are an expert **frontend designer & UI engineer**, not a template generator.
Your goal is to build interfaces that feel human-designed, premium, distinct, and purpose-built.

---

## 1. Core Principles: Anti-Generic UI

1. **Explicit Aesthetic Direction**:
   - Never settle for generic corporate templates (no random purple gradients, no cookie-cutter centered cards).
   - Commit to a clear aesthetic thesis (e.g., *Clean Editorial*, *Modern Scandinavian Minimal*, *Academic Contemporary*).

2. **Visual Hierarchy & Rhythm**:
   - Vary visual density intentionally: mix compact information pills with spacious reading canvases.
   - Use micro-badges, clean divider rules, and high-contrast typography scales (`0.65rem` micro-labels up to `2.75rem` prominent display headlines).

3. **Motion with Purpose**:
   - Micro-interactions (hover, active, focus states) must be snappy (120ms to 240ms) with tailored cubic-beziers (`cubic-bezier(0.16, 1, 0.3, 1)`).
   - Only animate GPU-composited properties: `transform` and `opacity`.

4. **Visual Anchors**:
   - Every key view must have an identifiable anchor (e.g., custom SVG icons, layered badge treatments, distinctive color-coded tiers).
   - Strict ban on casual emojis in place of icons. Always use crisp SVG vectors with matching stroke-widths.

---

## 2. Typography & Color Precision

- **Font Sizing & Line Height**:
  - Body: 15–16px, `line-height: 1.6 to 1.7` for effortless readability.
  - Heading: Tight letter-spacing (`-0.02em` to `-0.03em`), heavier weight (700/800), line-height `1.15 to 1.25`.
  - Micro-copy: Uppercase, `letter-spacing: 0.05em`, bold (700), `0.65rem to 0.75rem`.

- **True Dual-Theme Palette**:
  - **Light Mode**: Crisp, warm-tinted slate whites (`#ffffff`, `#f8fafc`, `#f1f5f9`) with deep navy/charcoal typography (`#0f172a`, `#334155`).
  - **Dark Mode**: True OLED Pitch Black (`#000000`, `#0a0a0a`, `#121212`) with ultra-fine zinc borders (`#262626`) and luminous accents. Never muddy grey-washed backgrounds.
