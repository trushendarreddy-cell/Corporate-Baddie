# Intro Layout & Responsive Grid Architecture

This specification details the structural layout, responsive breakpoint behaviors, and typographic system implemented in the CorporateBaddie onboarding interface.

---

## 1. Grid Composition & Spatial Hierarchy

The interface organizes the onboarding flow into an asymmetric two-column grid that balances editorial context with interactive 3D exploration:

```text
┌─────────────────────────────────────────────────────────────┐
│ Header: Brand Identifier | Mode Indicator | Skip Action      │
├──────────────────────────────┬──────────────────────────────┤
│ Left Column (Editorial)      │ Right Column (Visual)        │
│                              │                              │
│ - Category Kicker            │ - WebGL 3D Decision Core     │
│ - Primary Strategic Headline │ - Six Orbiting Nodes         │
│ - Platform Description       │ - Projected Screen Badges    │
│ - Sample Investigation Input │ - Contextual Detail Overlay  │
│ - Primary Action Button      │                              │
├──────────────────────────────┴──────────────────────────────┤
│ Bottom Bar: Six-Phase Pipeline Indicator | Epistemic Ethos  │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Responsive Breakpoint Matrix

The layout dynamically adjusts across three principal viewport tiers:

### Desktop Viewports ($\ge 1024\text{px}$)
- **Structure**: Asymmetric CSS Grid with `grid-template-columns: minmax(360px, 480px) 1fr`.
- **Left Column**: Max-width capped at $480\text{px}$ to maintain comfortable reading measure ($55$–$75$ characters per line).
- **Right Column**: Flexible canvas area centered around the $600\text{px}$ 3D decision core.
- **Detail Overlay**: Positioned beneath the 3D sphere as a semi-transparent floating card.

### Tablet Viewports ($768\text{px} \le \text{width} < 1024\text{px}$)
- **Structure**: Two-column layout with reduced horizontal margins ($24\text{px}$).
- **Canvas Scaling**: Camera distance adjusts automatically to preserve full orbit visibility without clipping text.
- **Detail Overlay**: Compact single-line summary displayed when nodes are tapped or focused.

### Mobile Viewports ($< 768\text{px}$)
- **Structure**: Single-column vertical stack with `flex-direction: column`.
- **Stack Order**:
  1. Header and skip action.
  2. Headline and platform description.
  3. 3D Decision Core canvas ($320\text{px}$–$380\text{px}$ height).
  4. Sample question prompt.
  5. Full-width primary CTA button.
  6. Compact bottom pipeline bar.
- **Touch Targets**: All interactive elements maintain a minimum $44\text{px} \times 44\text{px}$ tap target area.

---

## 3. Typographic Hierarchy & Token Scale

The design uses a restrained, high-contrast typographic system pairing Plus Jakarta Sans for editorial clarity with JetBrains Mono for technical metadata:

| Element | Font Family | Size / Leading | Weight | Letter Spacing | Styling |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Kicker** | Plus Jakarta Sans | 10px / 14px | Semi-Bold (600) | 0.32em | Uppercase, sage green (`#8eb397`) |
| **Main Headline** | Plus Jakarta Sans | 38px / 44px | Bold (700) | -0.04em | Off-white (`#edf0eb`) with sage accent |
| **Body Description**| Plus Jakarta Sans | 14px / 22px | Regular (400) | -0.01em | Muted gray (`#9da79f`) |
| **Sample Input** | Plus Jakarta Sans | 13px / 18px | Medium (500) | Normal | Dark container with border accent |
| **Action CTA** | Plus Jakarta Sans | 13px / 16px | Semi-Bold (600) | 0.08em | Uppercase, arrow glyph suffix |
| **Node Badges** | JetBrains Mono | 9px / 12px | Medium (500) | 0.18em | Uppercase, high-contrast monospace |
| **Pipeline Steps** | JetBrains Mono | 9px / 12px | Regular (400) | 0.14em | Horizontal numbered track |

---

## 4. Workspace Transition Integration

Activating **"ENTER DECISION INTELLIGENCE"** triggers an integrated handover to the executive analytics workspace:
- **Choreographed Convergence**: The six orbiting nodes collapse into the central core, followed by a unified canvas fade.
- **State Hand-off**: The `onEnter` callback sets `sessionStorage.setItem('corporatebaddie:intro-completed', '1')`.
- **Zero Rerender Latency**: The root component mounts `<App />` with the selected workspace already initialized, avoiding duplicate API queries or layout jumps.
