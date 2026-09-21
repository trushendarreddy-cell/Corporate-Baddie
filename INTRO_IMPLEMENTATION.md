# Intro Experience Implementation Specification

This document provides a technical specification for the initial 3D onboarding experience implemented in `src/components/IntroExperience.tsx` and its integration with the core CorporateBaddie application lifecycle.

---

## 1. Architectural Role & Lifecycle Integration

The intro experience introduces users to CorporateBaddie's core philosophy—*Evidence Over Eloquence*—through an interactive visualization of the decision intelligence system before transitioning into the workspace.

### Mount & Handoff Lifecycle
1. **Initial Mount**: `src/main.tsx` checks `sessionStorage.getItem('corporatebaddie:intro-completed')`. If absent or not `'1'`, the `IntroExperience` component renders.
2. **Interactive Exploration**: Users can rotate the intelligence core, inspect orbiting nodes, and read the introductory mission briefing.
3. **Transition**:
   - **Enter Action**: Triggers the 1.2-second convergence animation sequence. Upon completion, `onEnter()` sets the session flag and renders `<App />`.
   - **Skip Action**: Immediately fades out in 300ms, bypassing the convergence choreography.
4. **Replay Ability**: Removing the `corporatebaddie:intro-completed` key in browser developer tools restores the intro on the next page reload.

---

## 2. 3D Scene Composition (`Three.js`)

The visualization is rendered in a dedicated WebGL canvas managed via a React `useRef` hook.

### Core Geometries
- **Outer Wireframe Sphere**: `THREE.IcosahedronGeometry(3.2, 4)` configured with dynamic vertex coloring transitioning from sage green at the top, sky blue in the center, and terracotta at the base.
- **Inner Depth Lattice**: `THREE.IcosahedronGeometry(2.8, 3)` with low opacity (`0.15`) providing parallax structure during user-driven rotation.
- **Translucent Body**: `THREE.IcosahedronGeometry(2.4, 2)` rendered with `THREE.MeshPhysicalMaterial` (`transmission: 0.8`, `opacity: 0.1`) to provide light refraction without visual obstruction.
- **Structural Axial Beams**: Six vector segments originating from `[0, 0, 0]` to cardinal poles.
- **Vertex Markers**: Sixteen miniature octahedron meshes positioned at primary lattice coordinates.

### Six Orbital Satellite Nodes
Nodes orbit the core along individual elliptical paths:

| Node Key | Semantic Meaning | Orbit Radius | Inclination (Tilt X, Tilt Y) | Base Speed Multiplier | Node Hex Color |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **DATA** | Internal datasets & records | 5.2 | `[0.3, 0.0]` | 0.80 | `#9aa39b` |
| **ANALYSIS** | Statistical pattern detection | 5.4 | `[0.6, 0.8]` | 1.10 | `#a0a8a1` |
| **MARKET** | External market signals | 5.6 | `[0.8, 0.4]` | 0.65 | `#aab0a8` |
| **EVIDENCE** | Verified facts & claims | 5.0 | `[0.2, 1.4]` | 1.30 | `#8eb397` |
| **RISK** | Uncertainty & failure modes | 5.3 | `[0.4, 1.0]` | 0.90 | `#b47d78` |
| **DECISION** | Strategic recommendations | 5.5 | `[0.5, 1.8]` | 1.00 | `#8eb397` |

---

## 3. Real-Time Label Projection Engine

Rather than rendering heavy 3D billboard textures into the WebGL scene graph, node labels are standard HTML DOM badges pinned to projected 2D coordinates:

```typescript
const vector = new THREE.Vector3();
const positions: Record<string, { x: number; y: number; z: number }> = {};

nodeMeshes.forEach((meshGroup, key) => {
  vector.setFromMatrixPosition(meshGroup.matrixWorld);
  vector.project(camera);

  const screenX = (vector.x * 0.5 + 0.5) * containerWidth;
  const screenY = (-vector.y * 0.5 + 0.5) * containerHeight;

  positions[key] = { x: screenX, y: screenY, z: vector.z };
});

// Update state every 2 animation frames to minimize DOM reconciliation overhead
if (frameCounter % 2 === 0) {
  setLabelCoordinates(positions);
}
```

Badges where `z > 1.0` (behind the camera horizon) are visually occluded via CSS `opacity: 0` to prevent unnatural visual overlap.

---

## 4. Convergence Transition Sequence

When the user activates **"ENTER DECISION INTELLIGENCE"**, the animation loop enters convergence mode:

- **0 - 700 ms**: Node orbit radii scale rapidly to zero using cubic ease-out acceleration:
  $$r(t) = r_0 \times (1 - (t / 700)^3)$$
- **700 - 1000 ms**: Satellite nodes merge into the central core origin. The wireframe sphere compresses to `0.85x` scale, and wireframe opacity elevates by `+0.2`.
- **1000 - 1200 ms**: The core expands outward to `1.1x` scale as global canvas opacity fades to zero.
- **1200 - 1400 ms**: The transition callback triggers, unmounting the intro and presenting the executive workspace.

---

## 5. Accessibility & Responsive Adaptation

### Motion Sensitivity (`prefers-reduced-motion`)
The component listens for the `prefers-reduced-motion` media query:
- Halts all autonomous rotation and orbital motion.
- Positions nodes statically along their elliptical orbits.
- Replaces the multi-phase convergence animation with an instantaneous 200ms opacity fade.

### Keyboard & Screen Reader Support
- Interactive controls and CTA triggers support standard `Tab`, `Enter`, and `Space` activation.
- Pressing `Escape` clears active node selection.
- All primary interactive elements provide semantic ARIA roles and descriptive labels.

### Memory & GPU Teardown
When the component unmounts, all Three.js geometries, materials, textures, and requestAnimationFrame handles are explicitly released, ensuring no dangling contexts remain.
