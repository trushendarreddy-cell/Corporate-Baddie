import React, { useRef, useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { ScenarioResult, UnifiedInvestigationState } from '../../types';
import { DECISION_ROOM_OPTIONS } from '../../mockData';

export type CoreNodeAction = 'data' | 'evidence' | 'market' | 'risk' | 'scenario';

interface DecisionCore3DProps {
  state: UnifiedInvestigationState;
  onOpenNode: (action: CoreNodeAction) => void;
  scenarioOverride?: ScenarioResult;
  /** Reduced-motion flag: freezes ambient animation, keeps static depth. */
  reducedMotion?: boolean;
}

interface NodeSpec {
  key: CoreNodeAction;
  /** Position on the orbit ring (radians). */
  angle: number;
  /** Semantic accent. */
  color: THREE.Color;
  label: string;
}

interface DecisionCoreDimension {
  label: string;
  detail: string;
  score: number;
  available: boolean;
}

interface DecisionCoreState {
  data: DecisionCoreDimension;
  evidence: DecisionCoreDimension;
  market: DecisionCoreDimension;
  risk: DecisionCoreDimension;
  scenario: DecisionCoreDimension;
  recommendation: { confidence: number; optionName: string };
}

const NODE_ACCENTS: Record<CoreNodeAction, number> = {
  data: 0x9aa39b, // neutral data
  evidence: 0x8eb397, // muted green
  market: 0xaab0a8, // neutral market
  risk: 0xb47d78, // restrained risk
  scenario: 0xb8b39a, // restrained warning
};

/**
 * DECISION CORE — genuine WebGL centerpiece (Three.js).
 *
 * Composition: a central crystalline decision object (two nested translucent
 * icosahedra with a wireframe shell), five orbiting nodes (one per
 * intelligence stream), thin orbital rings, and a sparse dust field.
 * All motion is slow and ambient; cursor parallax is gentle.
 * Each node is raycast-interactive and opens a real module.
 *
 * Performance: one shared renderer, capped DPR of 2, no postprocessing,
 * no bloom, static geometry, paused when offscreen or reduced-motion.
 */
export const DecisionCore3D: React.FC<DecisionCore3DProps> = ({
  state,
  onOpenNode,
  scenarioOverride,
  reducedMotion = false,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameRef = useRef<number>(0);
  const hoveredRef = useRef<CoreNodeAction | null>(null);
  const pointerRef = useRef({ x: 0, y: 0, active: false });
  const dragRef = useRef({ active: false, moved: false, x: 0, y: 0 });
  const nodeMeshesRef = useRef<Map<CoreNodeAction, THREE.Object3D>>(new Map());
  const nodeMaterialsRef = useRef<Map<CoreNodeAction, THREE.MeshStandardMaterial>>(new Map());
  const lineRefs = useRef<THREE.Line[]>([]);
  const groupRef = useRef<THREE.Group | null>(null);
  const targetRotationRef = useRef({ x: 0, y: 0 });
  const rotationVelocityRef = useRef({ x: 0, y: 0 });
  const focusedRef = useRef<CoreNodeAction | null>(null);
  const targetConfidenceRef = useRef(0);
  const displayedConfidenceRef = useRef(0);
  const dimensionScoresRef = useRef<Record<CoreNodeAction, number>>({ data: 0, evidence: 0, market: 0, risk: 0, scenario: 0 });
  const confidence = state.recommendationConfidence.overallScore;
  const [hovered, setHovered] = useState<CoreNodeAction | null>(null);
  const [focused, setFocused] = useState<CoreNodeAction | null>(null);
  const [displayedConfidence, setDisplayedConfidence] = useState(confidence);
  const [labelPos, setLabelPos] = useState<Record<string, { x: number; y: number }>>({});
  const [stageSize, setStageSize] = useState({ width: 480, height: 480 });
  const [webGlError, setWebGlError] = useState(false);

  const nodes: NodeSpec[] = useMemo(
    () => [
      { key: 'data', angle: (Math.PI / 180) * -60, color: new THREE.Color(NODE_ACCENTS.data), label: 'DATA' },
      { key: 'evidence', angle: (Math.PI / 180) * 120, color: new THREE.Color(NODE_ACCENTS.evidence), label: 'EVIDENCE' },
      { key: 'market', angle: (Math.PI / 180) * 12, color: new THREE.Color(NODE_ACCENTS.market), label: 'MARKET' },
      { key: 'risk', angle: (Math.PI / 180) * 192, color: new THREE.Color(NODE_ACCENTS.risk), label: 'RISK' },
      { key: 'scenario', angle: (Math.PI / 180) * -132, color: new THREE.Color(NODE_ACCENTS.scenario), label: 'SCENARIO' },
    ],
    []
  );

  if (targetConfidenceRef.current === 0) {
    targetConfidenceRef.current = confidence;
    displayedConfidenceRef.current = confidence;
  }
  const decisionCoreState = useMemo<DecisionCoreState>(() => {
    const sources = state.activeDataSources.filter((source) => source.selected);
    const records = sources.reduce((total, source) => total + source.recordsCount, 0);
    const verified = state.claims.filter((claim) => claim.verified).length;
    const marketSignals = state.marketIntelligence.length;
    const scenarios = state.scenarioResults.length;
    const selectedOption = DECISION_ROOM_OPTIONS.find((option) => option.id === state.selectedOptionId) || DECISION_ROOM_OPTIONS.find((option) => option.isRecommended);
    const optionName = selectedOption?.name.toLowerCase() || '';
    const riskIssues = state.issues?.filter((issue) => issue.status === 'EVIDENCE CONFLICT' || issue.status === 'TOOL FAILURE').length || 0;
    const optionEmphasis = {
      market: optionName.includes('marketing') ? 18 : 0,
      risk: optionName.includes('do nothing') ? 22 : optionName.includes('pricing') ? 10 : 0,
      scenario: optionName.includes('scenario') || optionName.includes('intervention') ? 14 : 0,
      data: optionName.includes('product') ? 12 : 0,
    };
    return {
      data: { label: 'Your business data', detail: `${sources.length} sources · ${(records / 1000).toFixed(0)}K records · ${state.dataQuality.overallPercent}% quality`, score: Math.min(100, state.dataQuality.overallPercent + optionEmphasis.data), available: sources.length > 0 },
      evidence: { label: 'What supports the answer', detail: `${verified} verified claims · ${state.claims.length} total`, score: state.claims.length ? (verified / state.claims.length) * 100 : 0, available: verified > 0 },
      market: { label: 'What is happening outside', detail: marketSignals ? `${marketSignals} market signals · external research available` : 'No market research selected', score: Math.min(100, (marketSignals ? 70 : 0) + optionEmphasis.market), available: marketSignals > 0 },
      risk: { label: 'What could go wrong', detail: riskIssues ? `${riskIssues} active risk${riskIssues === 1 ? '' : 's'} · review evidence conflict` : '1 high · 2 medium · downside monitored', score: Math.min(100, riskIssues * 25 + 35 + optionEmphasis.risk), available: true },
      scenario: { label: 'What happens if we change the plan', detail: scenarioOverride ? `What-If: revenue ${scenarioOverride.revenueDelta >= 0 ? '+' : ''}${scenarioOverride.revenueDelta}% · margin ${scenarioOverride.grossMarginDelta >= 0 ? '+' : ''}${scenarioOverride.grossMarginDelta}% · risk ${scenarioOverride.riskLevel}` : `${scenarios} strategies tested · sensitivity available`, score: scenarioOverride ? Math.max(0, 100 - (scenarioOverride.riskLevel === 'High' ? 35 : scenarioOverride.riskLevel === 'Medium' ? 18 : 8)) : Math.min(100, (scenarios ? 72 : 0) + optionEmphasis.scenario), available: scenarios > 0 || !!scenarioOverride },
      recommendation: { confidence, optionName: selectedOption?.name || 'Current recommendation' },
    };
  }, [confidence, scenarioOverride, state]);

  useEffect(() => {
    hoveredRef.current = hovered;
  }, [hovered]);

  useEffect(() => {
    focusedRef.current = focused;
  }, [focused]);

  useEffect(() => {
    const clearFocus = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setFocused(null);
    };
    window.addEventListener('keydown', clearFocus);
    return () => window.removeEventListener('keydown', clearFocus);
  }, []);

  useEffect(() => {
    targetConfidenceRef.current = decisionCoreState.recommendation.confidence;
    dimensionScoresRef.current = {
      data: decisionCoreState.data.score,
      evidence: decisionCoreState.evidence.score,
      market: decisionCoreState.market.score,
      risk: decisionCoreState.risk.score,
      scenario: decisionCoreState.scenario.score,
    };
  }, [decisionCoreState]);

  // Build scene once
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth;
    const height = mount.clientHeight;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    } catch {
      setWebGlError(true);
      return;
    }

    const onContextLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(frameRef.current);
    };
    renderer.domElement.addEventListener('webglcontextlost', onContextLost);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0.6, 10.5);

    const world = new THREE.Group();
    scene.add(world);
    groupRef.current = world;

    // ---- Lighting: soft key/fill/rim, no bloom ----
    const keyLight = new THREE.DirectionalLight(0xffffff, 0.85);
    keyLight.position.set(4, 6, 8);
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0x94a3b8, 0.28);
    fillLight.position.set(-6, -2, 4);
    scene.add(fillLight);
    const rimLight = new THREE.DirectionalLight(0x7ea889, 0.12);
    rimLight.position.set(0, -6, -6);
    scene.add(rimLight);
    scene.add(new THREE.AmbientLight(0x404860, 0.55));

    // ---- Central decision object: crystalline nested shells ----
    const coreGroup = new THREE.Group();
    world.add(coreGroup);

    const innerGeo = new THREE.IcosahedronGeometry(1.05, 1);
    const innerMat = new THREE.MeshPhysicalMaterial({
      color: 0x78957e,
      metalness: 0.1,
      roughness: 0.22,
      transmission: 0.65,
      thickness: 1.4,
      ior: 1.25,
      transparent: true,
      opacity: 0.55,
      clearcoat: 0.6,
      clearcoatRoughness: 0.35,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    coreGroup.add(innerMesh);

    const outerGeo = new THREE.IcosahedronGeometry(1.55, 1);
    const outerMat = new THREE.MeshPhysicalMaterial({
      color: 0x334155,
      metalness: 0.05,
      roughness: 0.4,
      transmission: 0.85,
      thickness: 0.6,
      ior: 1.15,
      transparent: true,
      opacity: 0.16,
      side: THREE.DoubleSide,
      clearcoat: 0.4,
      clearcoatRoughness: 0.5,
    });
    const outerMesh = new THREE.Mesh(outerGeo, outerMat);
    coreGroup.add(outerMesh);

    const wireGeo = new THREE.IcosahedronGeometry(1.56, 1);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x64748b,
      wireframe: true,
      transparent: true,
      opacity: 0.14,
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    coreGroup.add(wireMesh);

    // ---- Orbital rings (thin, tilted) ----
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x94a3b8,
      transparent: true,
      opacity: 0.16,
      side: THREE.DoubleSide,
    });
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(3.1, 0.006, 8, 128), ringMat);
    ring1.rotation.x = Math.PI / 2.15;
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(3.45, 0.004, 8, 128), ringMat);
    ring2.rotation.x = Math.PI / 1.85;
    ring2.rotation.y = 0.35;
    world.add(ring1, ring2);

    // ---- Node spheres + halo + connector lines ----
    const nodeGeo = new THREE.SphereGeometry(0.22, 24, 24);
    const haloGeo = new THREE.SphereGeometry(0.34, 24, 24);
    const orbitRadius = 3.28;

    nodes.forEach((spec) => {
      const nodeGroup = new THREE.Group();
      const x = orbitRadius * Math.cos(spec.angle);
      const z = orbitRadius * Math.sin(spec.angle);
      nodeGroup.position.set(x, 0, z);

      const mat = new THREE.MeshStandardMaterial({
        color: spec.color,
        metalness: 0.15,
        roughness: 0.3,
        emissive: spec.color,
        emissiveIntensity: 0.08,
      });
      const sphere = new THREE.Mesh(nodeGeo, mat);
      sphere.userData.nodeKey = spec.key;
      nodeGroup.add(sphere);

      const haloMat = new THREE.MeshBasicMaterial({
        color: spec.color,
        transparent: true,
        opacity: 0.08,
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.userData.isHalo = true;
      nodeGroup.add(halo);

      // Thin connector: node → core
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        nodeGroup.position.clone().multiplyScalar(0.72),
      ]);
      const lineMat = new THREE.LineBasicMaterial({
        color: spec.color,
        transparent: true,
        opacity: 0.1,
      });
      const line = new THREE.Line(lineGeo, lineMat);
      line.userData.nodeKey = spec.key;
      world.add(line);
      lineRefs.current.push(line);

      world.add(nodeGroup);
      nodeMeshesRef.current.set(spec.key, nodeGroup);
      nodeMaterialsRef.current.set(spec.key, mat);
    });

    // ---- Minimal reference points: structure first, decoration second ----
    const dustCount = 72;
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      const r = 2.2 + Math.random() * 3.4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      dustPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      dustPos[i * 3 + 1] = r * Math.cos(phi) * 0.5;
      dustPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0x87928a,
      size: 0.015,
      transparent: true,
      opacity: 0.16,
      sizeAttenuation: true,
    });
    const dust = new THREE.Points(dustGeo, dustMat);
    world.add(dust);

    // ---- Raycaster for node hover/click ----
    const raycaster = new THREE.Raycaster();
    const pointerNDC = new THREE.Vector2();

    const findNodeKey = (obj: THREE.Object3D | null): CoreNodeAction | null => {
      let o: THREE.Object3D | null = obj;
      while (o) {
        if (o.userData.nodeKey) return o.userData.nodeKey as CoreNodeAction;
        o = o.parent;
      }
      return null;
    };

    const handlePointerMove = (e: PointerEvent) => {
      const rect = mount.getBoundingClientRect();
      const px = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const py = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      pointerNDC.set(px, py);
      pointerRef.current = { x: px, y: py, active: true };
      if (dragRef.current.active) {
        const dx = e.clientX - dragRef.current.x;
        const dy = e.clientY - dragRef.current.y;
        dragRef.current.x = e.clientX;
        dragRef.current.y = e.clientY;
        dragRef.current.moved = dragRef.current.moved || Math.abs(dx) + Math.abs(dy) > 2;
        targetRotationRef.current.y += dx * 0.004;
        targetRotationRef.current.x += dy * 0.003;
      } else {
        targetRotationRef.current = { x: -py * 0.08, y: px * 0.12 };
      }

      raycaster.setFromCamera(pointerNDC, camera);
      const hits = raycaster.intersectObjects(world.children, true);
      const hitNode = hits.length ? findNodeKey(hits[0].object) : null;
      if (hitNode !== hoveredRef.current) {
        hoveredRef.current = hitNode;
        setHovered(hitNode);
        mount.style.cursor = hitNode ? 'pointer' : 'default';
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (dragRef.current.moved) {
        dragRef.current.moved = false;
        return;
      }
      const rect = mount.getBoundingClientRect();
      pointerNDC.set(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      raycaster.setFromCamera(pointerNDC, camera);
      const hits = raycaster.intersectObjects(world.children, true);
      const hitNode = hits.length ? findNodeKey(hits[0].object) : null;
      if (hitNode) {
        setFocused(hitNode);
        onOpenNode(hitNode);
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      dragRef.current = { active: true, moved: false, x: e.clientX, y: e.clientY };
      mount.setPointerCapture?.(e.pointerId);
    };

    const handlePointerUp = (e: PointerEvent) => {
      dragRef.current.active = false;
      mount.releasePointerCapture?.(e.pointerId);
    };

    const handlePointerLeave = () => {
      pointerRef.current.active = false;
      targetRotationRef.current = { x: 0, y: 0 };
      if (hoveredRef.current) {
        hoveredRef.current = null;
        setHovered(null);
        mount.style.cursor = 'default';
      }
    };

    mount.addEventListener('pointermove', handlePointerMove);
    mount.addEventListener('pointerdown', handlePointerDown);
    mount.addEventListener('pointerup', handlePointerUp);
    mount.addEventListener('click', handleClick);
    mount.addEventListener('pointerleave', handlePointerLeave);

    // ---- Render loop ----
    const clock = new THREE.Clock();
    let visible = true;
    const io = new IntersectionObserver(
      (entries) => {
        visible = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0.05 }
    );
    io.observe(mount);

    const nodeGroups = nodes.map((n) => ({
      spec: n,
      group: nodeMeshesRef.current.get(n.key)!,
      baseY: 0,
      phase: n.angle,
    }));

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      if (!visible) return;

      const delta = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;
      const amp = reducedMotion ? 0 : 1;

      // Ambient core rotation (very slow)
      coreGroup.rotation.y += delta * 0.08 * amp;
      wireMesh.rotation.y += delta * -0.05 * amp;
      wireMesh.rotation.x += delta * 0.02 * amp;
      ring1.rotation.z += delta * 0.03 * amp;
      ring2.rotation.z += delta * -0.02 * amp;

      // Node float: gentle bob + slow orbital drift
      nodeGroups.forEach(({ spec, group, phase }, i) => {
        const lit = hoveredRef.current === spec.key;
        group.position.y = Math.sin(t * 0.6 + phase) * 0.12 * amp;
        group.rotation.y += delta * 0.16 * amp;

        const mat = nodeMaterialsRef.current.get(spec.key);
        if (mat) {
          const stateStrength = dimensionScoresRef.current[spec.key] / 100;
          const target = lit || focusedRef.current === spec.key ? 0.2 + stateStrength * 0.12 : 0.035 + stateStrength * 0.035;
          mat.emissiveIntensity += (target - mat.emissiveIntensity) * 0.12;
        }
        // Scale pulse on hover
        const targetScale = lit || focusedRef.current === spec.key ? 1.18 : 1;
        const cur = group.scale.x;
        group.scale.setScalar(cur + (targetScale - cur) * Math.min(1, delta * 8));
      });

      // Connector illumination
      lineRefs.current.forEach((line) => {
        const mat = line.material as THREE.LineBasicMaterial;
        const lit = hoveredRef.current === (line.userData.nodeKey as CoreNodeAction);
        const target = hoveredRef.current || focused ? (lit ? 0.25 : 0.02) : 0.05;
        mat.opacity += (target - mat.opacity) * Math.min(1, delta * 7);
      });

      // Confidence-driven inner shell breathing
      const breathe = 1 + Math.sin(t * 0.45) * 0.02 * amp;
      innerMesh.scale.setScalar(breathe);

      displayedConfidenceRef.current += (targetConfidenceRef.current - displayedConfidenceRef.current) * Math.min(1, delta * 5);
      if (Math.round(t * 10) % 3 === 0) setDisplayedConfidence(Math.round(displayedConfidenceRef.current));

      // Cursor parallax (subtle)
      const targetX = targetRotationRef.current.x;
      const targetY = targetRotationRef.current.y;
      rotationVelocityRef.current.x += (targetX - world.rotation.x) * delta * 3.5;
      rotationVelocityRef.current.y += (targetY - world.rotation.y) * delta * 3.5;
      rotationVelocityRef.current.x *= Math.pow(0.08, delta);
      rotationVelocityRef.current.y *= Math.pow(0.08, delta);
      world.rotation.x += rotationVelocityRef.current.x * delta;
      world.rotation.y += rotationVelocityRef.current.y * delta;

      renderer.render(scene, camera);

      // Project node positions for HTML labels using the current stage size.
      // This keeps labels aligned after responsive resize, not just at mount time.
      const v = new THREE.Vector3();
      const next: Record<string, { x: number; y: number }> = {};
      const currentWidth = mount.clientWidth;
      const currentHeight = mount.clientHeight;
      nodes.forEach((spec) => {
        const g = nodeMeshesRef.current.get(spec.key);
        if (!g) return;
        v.setFromMatrixPosition(g.matrixWorld);
        v.project(camera);
        next[spec.key] = { x: (v.x * 0.5 + 0.5) * currentWidth, y: (-v.y * 0.5 + 0.5) * currentHeight };
      });
      if (Math.round(t * 12) % 2 === 0) setLabelPos(next);
    };
    animate();

    // ---- Resize handling ----
    const resize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      setStageSize({ width: w, height: h });
    };
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    return () => {
      cancelAnimationFrame(frameRef.current);
      io.disconnect();
      ro.disconnect();
      mount.removeEventListener('pointermove', handlePointerMove);
      mount.removeEventListener('pointerdown', handlePointerDown);
      mount.removeEventListener('pointerup', handlePointerUp);
      mount.removeEventListener('click', handleClick);
      mount.removeEventListener('pointerleave', handlePointerLeave);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      renderer.dispose();
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const m = mesh.material as THREE.Material | THREE.Material[];
        if (Array.isArray(m)) m.forEach((x) => x.dispose());
        else if (m) m.dispose();
      });
      if (renderer.domElement.parentElement === mount) {
        mount.removeChild(renderer.domElement);
      }
      rendererRef.current = null;
      nodeMeshesRef.current.clear();
      nodeMaterialsRef.current.clear();
      lineRefs.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);

  // Hover info (2D, outside canvas) — plain-English: what it means + live numbers
  const hoverInfo = useMemo(() => {
    if (!hovered) return null;
    const sources = state.activeDataSources.filter((s) => s.selected);
    const records = sources.reduce((a, s) => a + s.recordsCount, 0);
    const verified = state.claims.filter((c) => c.verified).length;
    switch (hovered) {
      case 'data':
        return {
          label: 'Your business data',
          detail: `${sources.length} source${sources.length === 1 ? '' : 's'} · ${(records / 1000).toFixed(0)}K records`,
        };
      case 'evidence':
        return {
          label: 'What supports this decision',
          detail: `${verified} verified claim${verified === 1 ? '' : 's'}`,
        };
      case 'market':
        return {
          label: "What's happening outside",
          detail: state.marketIntelligence.length
            ? `${state.marketIntelligence.length} market signals`
            : 'No market sources selected',
        };
      case 'risk': {
        const highRiskCount = state.issues?.filter((issue) => issue.status === 'EVIDENCE CONFLICT' || issue.status === 'TOOL FAILURE').length || 0;
        return {
          label: 'What could go wrong',
          detail: state.issues?.some((issue) => issue.status === 'EVIDENCE CONFLICT')
            ? `${highRiskCount || 1} active risk${highRiskCount === 1 ? '' : 's'} · evidence conflict`
            : '1 high · 2 medium · review the downside',
        };
      }
      case 'scenario': {
        const rec = state.scenarioResults.find((s) => s.isRecommended);
        return {
          label: 'What happens if we change the plan',
          detail: rec
            ? `${state.scenarioResults.length} strategies tested · best: +${rec.modeledOutputs.revenueDelta}%`
            : `${state.scenarioResults.length} strategies tested`,
        };
      }
    }
  }, [hovered, state]);

  return (
    <div
      className="relative w-full"
      style={{ aspectRatio: '1 / 1', maxWidth: 480, margin: '0 auto' }}
    >
      <div ref={mountRef} className="cb-core-stage absolute inset-0" aria-label="Decision Core 3D visualization" role="img" />

      {/* Floating node labels — projected from 3D positions.
          Collision-safe: hidden on very small stages, clamped inside the box,
          and flipped to the left side when the node sits past 60% width. */}
      {nodes.map((spec) => {
        const pos = labelPos[spec.key];
        if (!pos) return null;
        const { width: w, height: h } = stageSize;
        const offsetMap: Record<CoreNodeAction, { x: number; y: number }> = {
          data: { x: 18, y: -20 },
          evidence: { x: -18, y: -26 },
          market: { x: 24, y: 8 },
          risk: { x: -22, y: 18 },
          scenario: { x: 10, y: 28 },
        };
        const offset = offsetMap[spec.key] ?? { x: 0, y: 0 };
        const baseX = pos.x + offset.x;
        const baseY = pos.y + offset.y;
        const flip = baseX > w * 0.68;
        const labelWidth = 72;
        const clampedX = Math.min(
          Math.max(baseX + (flip ? -labelWidth - 10 : 10), 8),
          Math.max(8, w - labelWidth - 8)
        );
        const clampedY = Math.min(Math.max(baseY, 12), Math.max(12, h - 24));
        return (
          <button
            key={spec.key}
            className="cb-core-label"
            data-lit={hovered === spec.key}
            type="button"
            aria-label={`${spec.label} layer. ${decisionCoreState[spec.key].detail}`}
            onFocus={() => setFocused(spec.key)}
            onBlur={() => setFocused(null)}
            onClick={() => {
              setFocused(spec.key);
              onOpenNode(spec.key);
            }}
            style={{
              transform: `translate(${clampedX}px, ${clampedY}px)`,
              fontSize: '8.4px',
              letterSpacing: '0.14em',
              maxWidth: '90px',
              color: hovered === spec.key || focused === spec.key ? '#b8d4bd' : undefined,
            }}
          >
            {spec.label}
          </button>
        );
      })}

      {/* Center confidence overlay (HTML for crisp text) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center px-4">
          <div
            className="cb-metric text-white"
            style={{ fontSize: 'clamp(28px, 9vw, 40px)', textShadow: '0 2px 18px rgba(0,0,0,0.45)' }}
          >
            {displayedConfidence}
            <span style={{ fontSize: '0.5em', opacity: 0.55 }}>%</span>
          </div>
          <div className="cb-meta mt-1.5" style={{ color: 'rgba(148,163,184,0.75)' }}>
            How confident we are
          </div>
        </div>
      </div>

      {/* Hover explanation — plain English, clamped to two lines, never covers center */}
      <div className="absolute left-0 right-0 bottom-0 flex justify-center pointer-events-none px-2">
        <div
          className="text-center max-w-full transition-opacity duration-200"
          style={{ opacity: hoverInfo ? 1 : 0, transform: `translateY(${hoverInfo ? 0 : 4}px)` }}
        >
          {hoverInfo && (
            <span
              className="text-[11px] font-medium leading-snug inline-block max-w-[280px]"
              style={{ color: 'rgba(226,232,240,0.9)' }}
            >
              <span className="text-slate-300 font-semibold block truncate">{hoverInfo.label}</span>
              <span className="text-slate-400 block">{hoverInfo.detail}</span>
              <span className="text-slate-500 block mt-1">Click to open this workspace</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
