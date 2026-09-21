# Intro Background & Atmosphere Architecture

This specification outlines the multi-layered visual atmosphere, background styling, and CSS performance design implemented for the CorporateBaddie onboarding and intro experience.

---

## 1. Visual Hierarchy & Layer Stack

The intro environment uses a composite backdrop designed to convey an analytical, high-tech decision environment while preserving high contrast for typography and wireframe nodes.

The visual stack consists of eight composited layers, ordered from back to front:

1. **Base Background**: Solid deep obsidian tint (`#0f1210`).
2. **Analytical Coordinate Grid**: Repeating $80\text{px} \times 80\text{px}$ linear gradient grid rendered at 3% opacity in sage green (`rgba(142, 179, 151, 0.03)`).
3. **Asymmetric Ambient Gradient**: Subtle radial gradient positioned at 60% horizontal offset to provide directional lighting behind the 3D sphere.
4. **Core Diffusion Halo**: $400\text{px}$ radial glow centered directly behind the decision core, softly blurred at $100\text{px}$ to create an atmospheric silhouette.
5. **Three.js WebGL Canvas**: Transparent canvas rendering the icosahedron lattice, structural beams, and orbital nodes.
6. **Projected Dynamic DOM Labels**: Real-time 2D coordinate-pinned badges tracking orbiting nodes.
7. **Contextual Detail Cards**: Semi-transparent backdrop-filtered panels displaying active node descriptions.
8. **Navigation & Action Chrome**: Fixed header, example question prompt, CTA buttons, and the bottom six-phase intelligence bar.

---

## 2. CSS Grid & Lighting Specifications

### Coordinate Grid Overlay
The technical grid provides visual scale without distracting from data readouts:

```css
background-image: 
  linear-gradient(rgba(142, 179, 151, 0.03) 1px, transparent 1px),
  linear-gradient(90deg, rgba(142, 179, 151, 0.03) 1px, transparent 1px);
background-size: 80px 80px;
opacity: 0.15;
```

### Ambient Directional Lighting
An asymmetric radial light source adds dimensional depth to the right-hand viewport where the 3D core resides:

```css
background: radial-gradient(
  circle at 60% 50%, 
  rgba(78, 95, 87, 0.08) 0%, 
  transparent 50%
);
```

### Core Silhouette Diffusion
A localized glow centered behind the decision core creates subtle visual emphasis:

```css
background: radial-gradient(
  circle, 
  rgba(142, 179, 151, 0.3) 0%, 
  transparent 70%
);
filter: blur(100px);
opacity: 0.20;
```

---

## 3. UI Component Theming & Palette Integration

All overlay elements are styled to harmonize with the deep obsidian canvas:

| Component | Background Token | Border Treatment | Purpose |
| :--- | :--- | :--- | :--- |
| **Top Navigation Header** | `rgba(10, 12, 11, 0.90)` | `rgba(26, 31, 28, 0.50)` | Branding, mode badge, and skip action |
| **Bottom Intelligence Bar** | `rgba(10, 12, 11, 0.90)` | `rgba(26, 31, 28, 0.50)` | Six-phase pipeline indicator and ethos |
| **Example Question Box** | `#0f1210` | `#2a322c` | Illustrative prompt framing |
| **Node Detail Panel** | `rgba(15, 18, 16, 0.95)` | `#2a322c` | Focused node data and investigative role |
| **Projected Node Badges** | `rgba(15, 18, 16, 0.80)` | `rgba(42, 50, 44, 0.80)` | Orbiting spatial labels |

---

## 4. Performance & Rendering Efficiency

- **Zero Image Assets**: All background textures, gradients, and grids are generated purely via CSS gradients, eliminating external asset download overhead.
- **Hardware Acceleration**: Background layers use fixed positioning and opacity transitions handled directly by browser compositing engines, avoiding layout recalculations or paint thrashing.
- **Pointer Event Isolation**: Background glows and grid overlays apply `pointer-events: none`, ensuring zero interference with mouse or touch drag gestures on the 3D canvas.
