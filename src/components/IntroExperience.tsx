import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export interface IntroExperienceProps {
  onEnter: () => void;
}

type NodeKey = 'DATA' | 'MARKET' | 'EVIDENCE' | 'RISK' | 'DECISION';

const NODE_ORDER: NodeKey[] = ['DATA', 'MARKET', 'EVIDENCE', 'RISK', 'DECISION'];
const NODE_COPY: Record<NodeKey, { title: string; detail: string }> = {
  DATA: { title: 'Your business data', detail: 'What the company already knows' },
  MARKET: { title: 'Market signals', detail: 'What is happening outside' },
  EVIDENCE: { title: 'Evidence', detail: 'What supports the conclusion' },
  RISK: { title: 'Risk', detail: 'What could go wrong' },
  DECISION: { title: 'Decision', detail: 'What management can act on' },
};

export const IntroExperience: React.FC<IntroExperienceProps> = ({ onEnter }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const onEnterRef = useRef(onEnter);
  const [activeNode, setActiveNode] = useState<NodeKey | null>(null);
  const [ready, setReady] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => { onEnterRef.current = onEnter; }, [onEnter]);

  const enter = () => {
    if (exiting) return;
    setExiting(true);
    window.setTimeout(() => onEnterRef.current(), 520);
  };

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const width = Math.max(1, mount.clientWidth);
    const height = Math.max(1, mount.clientHeight);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0.45, 11.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const world = new THREE.Group();
    scene.add(world);
    scene.add(new THREE.AmbientLight(0xb8c4bb, 0.52));
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.15);
    keyLight.position.set(4, 5, 8);
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0x78957e, 0.32);
    fillLight.position.set(-5, 1, 3);
    scene.add(fillLight);

    const core = new THREE.Group();
    world.add(core);
    core.add(new THREE.Mesh(
      new THREE.BoxGeometry(1.7, 1.7, 1.7),
      new THREE.MeshPhysicalMaterial({ color: 0x6f8875, metalness: 0.18, roughness: 0.28, transmission: 0.42, thickness: 0.8, ior: 1.22, transparent: true, opacity: 0.68, clearcoat: 0.55 })
    ));
    const coreFrame = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(2.02, 2.02, 2.02)),
      new THREE.LineBasicMaterial({ color: 0xaab5ad, transparent: true, opacity: 0.34 })
    );
    core.add(coreFrame);

    const bars = new THREE.Group();
    const barMaterial = new THREE.MeshStandardMaterial({ color: 0xc5cec7, metalness: 0.05, roughness: 0.55 });
    [0.42, 0.76, 0.58, 0.92].forEach((scale, index) => {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.16, scale, 0.16), barMaterial);
      bar.position.set(-0.48 + index * 0.32, -0.32 + scale / 2, 0.88);
      bars.add(bar);
    });
    core.add(bars);

    const ringMaterial = new THREE.LineBasicMaterial({ color: 0x8c9b91, transparent: true, opacity: 0.2 });
    const makeRing = (scale: number, rotationY: number, opacity: number) => {
      const geometry = new THREE.BufferGeometry().setFromPoints(Array.from({ length: 96 }, (_, index) => {
        const angle = (index / 96) * Math.PI * 2;
        return new THREE.Vector3(Math.cos(angle) * 3.05 * scale, Math.sin(angle) * 0.72 * scale, Math.sin(angle) * 0.95 * scale);
      }));
      const material = ringMaterial.clone();
      material.opacity = opacity;
      const ring = new THREE.LineLoop(geometry, material);
      ring.rotation.x = 0.35;
      ring.rotation.y = rotationY;
      world.add(ring);
      return ring;
    };
    const ringA = makeRing(1, 0, 0.2);
    const ringB = makeRing(1.14, 0.75, 0.12);

    const nodeMeshes = new Map<NodeKey, THREE.Mesh>();
    const connectorLines = new Map<NodeKey, THREE.Line>();
    const nodePositions: Record<NodeKey, THREE.Vector3> = {
      DATA: new THREE.Vector3(-3.35, 1.65, 0.35),
      MARKET: new THREE.Vector3(3.35, 1.45, -0.2),
      EVIDENCE: new THREE.Vector3(-3.55, -1.45, -0.2),
      RISK: new THREE.Vector3(3.45, -1.55, 0.35),
      DECISION: new THREE.Vector3(0, 3.05, 0.1),
    };

    NODE_ORDER.forEach((name, index) => {
      const material = new THREE.MeshStandardMaterial({ color: name === 'DECISION' ? 0x8eb397 : 0x9ba59d, metalness: 0.18, roughness: 0.34, emissive: name === 'DECISION' ? 0x526b59 : 0x343a36, emissiveIntensity: 0.08 });
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(name === 'DECISION' ? 0.27 : 0.2, 20, 20), material);
      mesh.position.copy(nodePositions[name]);
      mesh.userData.nodeKey = name;
      mesh.scale.setScalar(reducedMotion ? 1 : 0.82 + index * 0.035);
      world.add(mesh);
      nodeMeshes.set(name, mesh);

      const line = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([nodePositions[name].clone(), nodePositions[name].clone().multiplyScalar(0.32)]),
        new THREE.LineBasicMaterial({ color: name === 'DECISION' ? 0x8eb397 : 0x7e8b82, transparent: true, opacity: 0.16 })
      );
      world.add(line);
      connectorLines.set(name, line);
    });

    const points = new Float32Array(90 * 3);
    for (let index = 0; index < 90; index += 1) {
      const radius = 4.1 + Math.random() * 3.1;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      points[index * 3] = radius * Math.sin(phi) * Math.cos(theta);
      points[index * 3 + 1] = radius * Math.cos(phi) * 0.6;
      points[index * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }
    const pointGeometry = new THREE.BufferGeometry();
    pointGeometry.setAttribute('position', new THREE.BufferAttribute(points, 3));
    world.add(new THREE.Points(pointGeometry, new THREE.PointsMaterial({ color: 0x9ca79f, size: 0.026, transparent: true, opacity: 0.34, sizeAttenuation: true })));

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2(-10, -10);
    const pointerTarget = { x: 0, y: 0 };
    const pointerCurrent = { x: 0, y: 0 };
    let rafId = 0;
    let visible = true;
    let lastHover: NodeKey | null = null;

    const handlePointerMove = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      pointerTarget.x = pointer.x * 0.18;
      pointerTarget.y = pointer.y * 0.12;
    };
    const handlePointerLeave = () => {
      pointer.set(-10, -10);
      pointerTarget.x = 0;
      pointerTarget.y = 0;
    };
    const selectNode = () => {
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(Array.from(nodeMeshes.values()))[0];
      const node = hit?.object.userData.nodeKey as NodeKey | undefined;
      if (node) setActiveNode(node);
    };
    renderer.domElement.addEventListener('pointermove', handlePointerMove);
    renderer.domElement.addEventListener('pointerleave', handlePointerLeave);
    renderer.domElement.addEventListener('click', selectNode);

    const resize = () => {
      const w = Math.max(1, mount.clientWidth);
      const h = Math.max(1, mount.clientHeight);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', resize);
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    observer.observe(mount);

    const animate = () => {
      if (visible) {
        pointerCurrent.x += (pointerTarget.x - pointerCurrent.x) * 0.045;
        pointerCurrent.y += (pointerTarget.y - pointerCurrent.y) * 0.045;
        world.rotation.y = pointerCurrent.x + (reducedMotion ? 0 : performance.now() * 0.000025);
        world.rotation.x = pointerCurrent.y;
        core.rotation.y += reducedMotion ? 0 : 0.0022;
        core.rotation.x += reducedMotion ? 0 : 0.0008;
        ringA.rotation.z += reducedMotion ? 0 : 0.00055;
        ringB.rotation.z -= reducedMotion ? 0 : 0.0004;
        raycaster.setFromCamera(pointer, camera);
        const hit = raycaster.intersectObjects(Array.from(nodeMeshes.values()))[0];
        const hovered = hit?.object.userData.nodeKey as NodeKey | undefined;
        if (hovered !== lastHover) {
          lastHover = hovered || null;
          setActiveNode(hovered || null);
        }
        nodeMeshes.forEach((mesh, name) => {
          const selected = name === lastHover;
          const targetScale = selected ? 1.32 : name === 'DECISION' ? 1.05 : 1;
          mesh.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.12);
          const material = mesh.material as THREE.MeshStandardMaterial;
          material.emissiveIntensity += ((selected ? 0.22 : 0.07) - material.emissiveIntensity) * 0.12;
          const line = connectorLines.get(name);
          if (line) {
            const lineMaterial = line.material as THREE.LineBasicMaterial;
            lineMaterial.opacity += ((selected ? 0.42 : 0.14) - lineMaterial.opacity) * 0.12;
          }
        });
        renderer.render(scene, camera);
      }
      rafId = requestAnimationFrame(animate);
    };
    animate();
    setReady(true);

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener('resize', resize);
      renderer.domElement.removeEventListener('pointermove', handlePointerMove);
      renderer.domElement.removeEventListener('pointerleave', handlePointerLeave);
      renderer.domElement.removeEventListener('click', selectNode);
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.Points) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose());
          else object.material.dispose();
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  const activeCopy = activeNode ? NODE_COPY[activeNode] : null;

  return (
    <div className={`cb-intro fixed inset-0 z-[100] overflow-hidden bg-[#191b1a] text-[#e7e9e4] ${exiting ? 'cb-intro-exit' : ''}`}>
      <div ref={mountRef} className="absolute inset-0" aria-label="Interactive CorporateBaddie intelligence network" />
      <header className="absolute left-6 top-6 flex items-center gap-3 sm:left-10 sm:top-8">
        <span className="h-2 w-2 rounded-full bg-[#8eb397]" />
        <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#9da79f]">CORPORATEBADDIE</span>
      </header>
      <div className="absolute right-6 top-6 font-mono text-[9px] uppercase tracking-[0.2em] text-[#68716b] sm:right-10 sm:top-8">DECISION INTELLIGENCE / 01</div>

      <section className={`absolute left-6 right-6 top-[18%] mx-auto max-w-3xl text-center transition-all duration-700 ${ready ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'}`}>
        <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.32em] text-[#7e8c82]">Making Sense of Corporate Nonsense</p>
        <h1 className="text-[clamp(2.35rem,6vw,5.25rem)] font-medium leading-[0.94] tracking-[-0.055em] text-[#edf0eb]">Better questions.<br />Better decisions.</h1>
        <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-[#8d968f] sm:text-base">Investigate business data, market signals, risk and evidence before deciding what to do next.</p>
      </section>

      <div className={`absolute left-6 top-1/2 hidden -translate-y-1/2 transition-all duration-500 sm:block ${activeCopy ? 'opacity-100' : 'opacity-0'}`}>
        <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#7f8a82]">{activeNode}</p>
        <p className="mt-2 text-sm text-[#dce2dc]">{activeCopy?.title}</p>
        <p className="mt-1 max-w-[180px] text-xs leading-5 text-[#737d76]">{activeCopy?.detail}</p>
      </div>

      <div className="absolute bottom-8 left-6 right-6 flex flex-col gap-5 sm:bottom-10 sm:left-10 sm:right-10 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-md">
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#657069]">Question → Investigation → Evidence → Decision</p>
          <p className="mt-2 text-xs leading-5 text-[#737d76]">Hover the intelligence streams. Click one to inspect what it contributes.</p>
        </div>
        <button type="button" onClick={enter} className="group flex items-center gap-4 self-start border border-[#69756d] bg-[#222522] px-5 py-3 text-[11px] font-medium uppercase tracking-[0.18em] text-[#dfe5df] transition-all duration-150 hover:-translate-y-0.5 hover:border-[#8eb397] hover:bg-[#292d2a] active:translate-y-0">Enter Decision Intelligence<span className="text-[#8eb397] transition-transform duration-150 group-hover:translate-x-1">→</span></button>
      </div>

      <div className="pointer-events-none absolute bottom-8 left-1/2 hidden -translate-x-1/2 font-mono text-[8px] uppercase tracking-[0.22em] text-[#56605a] md:block">{activeNode ? `${activeNode} selected` : 'Move to explore'}</div>
      <style>{`
        .cb-intro { opacity: 1; transition: opacity 520ms ease, transform 520ms ease; }
        .cb-intro-exit { opacity: 0; transform: scale(1.015); pointer-events: none; }
        @media (prefers-reduced-motion: reduce) { .cb-intro, .cb-intro-exit { transition: none; } }
      `}</style>
    </div>
  );
};

export default IntroExperience;
