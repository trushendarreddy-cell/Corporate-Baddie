# 3D Decision Core: Orbital Kinematics & Color Architecture

This specification documents the visual geometry, mathematical orbital kinematics, and interactive controls implemented for the 3D Decision Core (`DecisionCore3D.tsx` and `IntroExperience.tsx`).

---

## 1. Central Geometry & Vertex Color System

The decision sphere uses an `IcosahedronGeometry` with custom vertex coloring rather than flat textured materials, ensuring high rendering efficiency and deep visual hierarchy.

### Vertex Color Gradient
The wireframe vertex colors transition along the vertical Y-axis:
- **Top Elevation (Y > 1.0)**: Sage green (`#8eb397`, RGB `[0.557, 0.702, 0.592]`) — represents verified intelligence and affirmative decisions.
- **Mid Elevation (-1.0 <= Y <= 1.0)**: Sky blue (`#6fa0d9`, RGB `[0.435, 0.627, 0.851]`) — represents objective analytical operations.
- **Bottom Elevation (Y < -1.0)**: Terracotta (`#b47d78`, RGB `[0.706, 0.490, 0.471]`) — denotes critical risk factors, downside variance, and warning thresholds.

### Internal Structural Architecture
- **Cardinal Structural Beams**: Six radial vectors extending from the coordinate center `[0, 0, 0]` to cardinal poles, lending structural architectural depth.
- **Vertex Anchor Markers**: Sixteen octahedron markers positioned at structural intersections, reinforcing the sense of an engineered intelligence lattice rather than a hollow mesh.
- **Physical Inner Core**: Low-opacity inner volume providing ambient occlusion and light diffusion from within the wireframe.

---

## 2. Orbital Ring Configurations

The 3D scene features six distinct orbital tracks calibrated to prevent visual clipping while maintaining clear separation across three-dimensional planes:

| Track | Visual Color | Radius | Inclination (Tilt X) | Azimuth (Tilt Y) | Opacity | Rotation Direction |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Ring 1 | Sage Green (`#8eb397`) | 5.2 | 0.30 rad | 0.00 rad | 0.35 | Clockwise |
| Ring 2 | Sky Blue (`#6fa0d9`) | 5.4 | 0.60 rad | 0.80 rad | 0.30 | Counter-Clockwise |
| Ring 3 | Terracotta (`#b47d78`) | 5.0 | 0.20 rad | 1.40 rad | 0.35 | Clockwise |
| Ring 4 | Light Blue (`#7a9cc6`) | 5.6 | 0.80 rad | 0.40 rad | 0.25 | Counter-Clockwise |
| Ring 5 | Light Green (`#9cb3a8`) | 5.3 | 0.40 rad | 1.00 rad | 0.30 | Clockwise |
| Ring 6 | Light Terracotta (`#c48e87`) | 5.5 | 0.50 rad | 1.80 rad | 0.25 | Counter-Clockwise |

All orbital rings are rendered as continuous segmented circle geometries with a 15% vertical elliptical compression to reflect perspective foreshortening.

---

## 3. Orbital Mechanics & Mathematical Model

Each orbiting node moves according to a deterministic parametric formula combining elliptical trajectory, 3D Euler inclination, and periodic harmonic wobble:

```typescript
// 1. Compute baseline angle and oscillation
const currentAngle = initialAngle + elapsedTime * baseSpeed * nodeSpeedMultiplier;
const harmonicWobble = Math.sin(elapsedTime * 0.5 * nodeSpeedMultiplier) * wobbleAmplitude;

// 2. Compute elliptical position in local plane
const localX = Math.cos(currentAngle) * radius;
const localY = Math.sin(currentAngle) * radius * 0.15 + harmonicWobble;
const localZ = Math.sin(currentAngle) * radius;

// 3. Transform through 3D orientation matrix
const orbitalPosition = new THREE.Vector3(localX, localY, localZ);
orbitalPosition.applyEuler(new THREE.Euler(tiltX, tiltY, 0));

nodeMesh.position.copy(orbitalPosition);
```

### Node Parameters

- **DATA**: Speed `0.80`, Inclination `[0.3, 0.0]`, Color `#9aa39b` (Objective ledger).
- **ANALYSIS**: Speed `1.10`, Inclination `[0.6, 0.8]`, Color `#a0a8a1` (Pattern detection).
- **MARKET**: Speed `0.65`, Inclination `[0.8, 0.4]`, Color `#aab0a8` (External context).
- **EVIDENCE**: Speed `1.30`, Inclination `[0.2, 1.4]`, Color `#8eb397` (Validated facts).
- **RISK**: Speed `0.90`, Inclination `[0.4, 1.0]`, Color `#b47d78` (Failure boundaries).
- **DECISION**: Speed `1.00`, Inclination `[0.5, 1.8]`, Color `#8eb397` (Strategic action).

---

## 4. Drag Interaction & Momentum Physics

The scene supports intuitive mouse and touch drag controls that allow users to inspect the intelligence core from any angle:

- **Direct Tracking**: Pointer movement immediately translates to pitch (X-axis) and yaw (Y-axis) rotation deltas.
- **Velocity Accumulation**: Pointer movement speed updates rotational velocity variables `velocityX` and `velocityY`.
- **Inertial Momentum**: Upon release, the rotation continues with smooth exponential decay:
  $$\text{velocity} \leftarrow \text{velocity} \times 0.95$$
- **Pitch Clamping**: Rotations on the pitch axis are clamped to prevent inversion disorientation.
- **Cursor Feedback**: Updates dynamically between `grab` and `grabbing` states to communicate interaction affordance.

---

## 5. Performance & GPU Resource Management

- **Buffer Geometry**: All vertices and colors reside in compact typed float arrays (`Float32Array`), minimizing memory overhead.
- **GPU Optimization**: Standard shaders and minimal draw calls ensure consistent 60fps performance across desktop and mobile devices.
- **Lifecycle Cleanup**: All mesh geometries, wireframe materials, and renderer contexts are explicitly disposed on unmount, preventing GPU memory leaks during navigation.
