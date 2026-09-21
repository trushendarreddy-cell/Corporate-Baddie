# Immersive 3D Experience Architecture & Implementation Summary

This document summarizes the architecture, design specifications, and implementation details of the 3D Intro Experience (`src/components/IntroExperience.tsx`) and the interactive 3D Decision Core (`src/components/DecisionCore3D.tsx`).

---

## 1. Scene Architecture & Visual Structure

The 3D intelligence core serves as a visual metaphor for CorporateBaddie: multi-layered, structured, and evidence-grounded rather than a decorative black box.

### Geometry Hierarchy
- **Outer Structural Wireframe**: `IcosahedronGeometry` (radius `3.2`, subdivision level `4`) with vertex colors transitioning between sage green, sky blue, and terracotta.
- **Inner Depth Lattice**: Nested `IcosahedronGeometry` (radius `2.8`, subdivision level `3`) providing parallax depth during rotation.
- **Central Core**: Physical material sphere with high transmission and subtle emissive diffusion, creating volumetric body within the wireframe.
- **Radial Structural Beams**: Six vector lines extending from the center origin to cardinal coordinates, reinforcing structural integrity.
- **Vertex Anchor Markers**: Sixteen octahedron markers positioned at structural intersections.

### Three-Point Lighting Model
- **Ambient Light**: Balanced at `0.6` intensity to ensure all wireframe facets remain legible regardless of orientation.
- **Key Light**: Positioned at `(5, 7, 9)` with `1.2` intensity, casting crisp highlights across active node faces.
- **Fill Light**: Positioned at `(-6, -2, 5)` with `0.4` intensity to soften contrast in shadowed quadrants.
- **Back Light**: Positioned at `(0, -3, -6)` with `0.3` intensity, separating the sphere silhouette from the obsidian background.

---

## 2. Six Intelligence Satellite Nodes

Six intelligence nodes orbit the core along calibrated elliptical planes, reflecting the six stages of comprehensive strategic decision-making:

1. **DATA**: Internal enterprise ledger, transaction history, and operational records.
2. **ANALYSIS**: Statistical distributions, variance metrics, and trend lines.
3. **MARKET**: Real-time industry benchmarks, competitor signals, and macroeconomic telemetry.
4. **EVIDENCE**: Empirically verified causal assertions and citation chains.
5. **RISK**: Downside sensitivity, compliance guardrails, and failure mode analysis.
6. **DECISION**: Defensible executive recommendations with clear falsification boundaries.

### Real-Time Label Projection
To keep node labels legible without 3D texture distortion, the scene uses standard DOM badge elements positioned via real-time 3D-to-2D screen coordinate projection:
- World matrix positions are projected through the active camera matrix.
- Normalized device coordinates (NDC) are converted to viewport pixel offsets `(left, top)`.
- Labels occluded behind the camera horizon (`z > 1.0`) are automatically hidden to prevent visual clutter.

---

## 3. Physics & Interaction Model

### Drag-to-Rotate Controls
- **Pointer Down**: Locks pointer coordinates and halts passive camera drift.
- **Pointer Move**: Calculates horizontal ($\Delta x$) and vertical ($\Delta y$) deltas, feeding rotational velocity buffers.
- **Inertial Decay**: On release, rotation continues with smooth exponential damping:
  $$v_{t+1} = v_t \times 0.95$$
- **Parallax Feedback**: When idle, subtle cursor tracking provides gentle depth parallax without altering the primary orbit orientation.

### Node Exploration
- **Hover**: Scales node geometry by `1.3x`, raises emissive intensity, and displays the contextual summary card.
- **Click**: Locks node selection, allowing detailed examination of the analytical scope and underlying data dependencies.

---

## 4. Convergence Transition Choreography

When the user selects **"ENTER DECISION INTELLIGENCE"**, the interface initiates a four-phase convergence sequence into the workspace:

1. **Phase 1: Inward Acceleration (0 - 700 ms)**: All six nodes break orbit and accelerate toward coordinate origin `(0, 0, 0)` along cubic easing curves.
2. **Phase 2: Core Compression (700 - 1000 ms)**: Satellite nodes merge into the central sphere; the wireframe briefly compresses to `0.85x` scale while emissive luminance peaks.
3. **Phase 3: Radial Expansion (1000 - 1200 ms)**: The central sphere expands outward to `1.1x` scale as the canvas smoothly fades to zero opacity.
4. **Phase 4: Workspace Hand-off (1200 - 1400 ms)**: The intro component unmounts, updates `sessionStorage` (`corporatebaddie:intro-completed`), and activates the main executive workspace.

Users wishing to bypass the animation can click **"SKIP INTRO"**, which triggers an immediate 300ms linear fade into the dashboard.

---

## 5. WebGL Lifecycle & GPU Resilience

To ensure stability across long user sessions and multiple workspace transitions, the component implements strict resource lifecycle management:

- **Context Loss Handling**: Subscribes to `webglcontextlost` and `webglcontextrestored` events on the canvas element, pausing animation frames gracefully and rebuilding materials upon recovery.
- **Deterministic Disposal**: Every geometry, material, buffer attribute, and render target is explicitly disposed in the `useEffect` unmount cleanup handler, preventing memory leaks in browser V8 and GPU heaps.
- **Responsive Adaptability**: Automatically tracks resize events, recalculates camera aspect ratios, and caps device pixel ratio at `2.0` to preserve 60fps performance on high-density displays.
