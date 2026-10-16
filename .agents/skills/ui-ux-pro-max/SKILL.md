---
name: ui-ux-pro-max
description: "Comprehensive UI/UX design intelligence guide covering WCAG accessibility standards, touch interaction ergonomics, layout rhythm, responsive breakpoints, and micro-interactions."
---

# UI/UX Pro Max — Design Intelligence & Ergonomics

Benchmark rules for refining web interfaces to professional, institutional, and consumer standards.

---

## 1. Ergonomics & Touch Targets (Critical)

- **Interactive Targets**: Minimum touch area of `44x44px` on mobile/tablet (or `padding: 0.5rem 1rem` with visible bounding box).
- **Interactive Feedback**:
  - All clickable items must have explicit `:hover`, `:active`, and `:focus-visible` styles.
  - Buttons must show instantaneous tactile feedback (`transform: translateY(-1px)` on hover, `translateY(1px)` on active).
- **Navigation Usability**: Sticky headers must stay lightweight, blur backdrop backgrounds smoothly, and keep page content from shifting underneath.

---

## 2. Accessibility (WCAG 2.2 AA)

- **Contrast Ratios**:
  - Text to background: minimum `4.5:1` for body text, `3:1` for bold display headings.
  - Interactive elements & badges: clear distinction from parent backgrounds.
- **Form Controls & Inputs**:
  - Always pair icons with descriptive labels or `aria-label`.
  - Search inputs must have a clear search button, instant feedback, and accessible `aria-expanded` / `aria-controls` where applicable.

---

## 3. Responsive Layout & Spacing Rhythm

- **Fluid Containment**:
  - Use `clamp()` for dynamic padding and fluid typography: `padding-left: clamp(1rem, 3.5vw, 2.5rem)`.
  - Grid columns must collapse gracefully using `repeat(auto-fit, minmax(300px, 1fr))` instead of arbitrary media breakpoints.
- **Scroll Alignment**:
  - Horizontal tab navigation must include scroll snapping (`scroll-snap-type: x mandatory`), smooth scrolling, and visual scroll indicators.
