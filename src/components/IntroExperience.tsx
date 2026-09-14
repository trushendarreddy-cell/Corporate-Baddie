import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export interface IntroExperienceProps { onEnter: () => void; }
type NodeKey = 'DATA' | 'ANALYSIS' | 'MARKET' | 'EVIDENCE' | 'RISK' | 'DECISION';

const NODES: Array<{ key: NodeKey; detail: string; description: string; color: number }> = [
  { key: 'DATA', detail: 'Your business data', description: 'Internal records and analytics.', color: 0x9caf9e },
  { key: 'ANALYSIS', detail: 'Pattern recognition', description: 'Statistical analysis and trends.', color: 0xaab2aa },
  { key: 'MARKET', detail: "What's happening outside", description: 'External market conditions.', color: 0xaab2aa },
  { key: 'EVIDENCE', detail: 'What supports the decision', description: 'Sources and verified claims.', color: 0x9caf9e },
  { key: 'RISK', detail: 'What could go wrong', description: 'Uncertainty and downside.', color: 0xc18a80 },
  { key: 'DECISION', detail: 'What we should do', description: 'Recommended action.', color: 0x9caf9e },
];

const ORBITS = [
  { radius: 4.7, yScale: 0.72, tiltX: 0.32, tiltY: -0.18, tiltZ: 0, speed: 0.075 },
  { radius: 5.15, yScale: 0.66, tiltX: -0.22, tiltY: 0.55, tiltZ: 0.25, speed: -0.052 },
  { radius: 5.45, yScale: 0.56, tiltX: 0.5, tiltY: -0.48, tiltZ: -0.16, speed: 0.042 },
  { radius: 5, yScale: 0.82, tiltX: -0.52, tiltY: 0.2, tiltZ: 0.18, speed: -0.035 },
  { radius: 5.55, yScale: 0.62, tiltX: 0.18, tiltY: 0.72, tiltZ: -0.22, speed: 0.028 },
  { radius: 4.95, yScale: 0.74, tiltX: 0.68, tiltY: -0.12, tiltZ: 0.32, speed: -0.024 },
];

function createOrbit(config: typeof ORBITS[number], color: number) {
  const curve = new THREE.EllipseCurve(0, 0, config.radius, config.radius * config.yScale, 0, Math.PI * 2, false, 0);
  const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(180).map((p) => new THREE.Vector3(p.x, 0, p.y)));
  const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.34, depthWrite: false, depthTest: false });
  const line = new THREE.LineLoop(geometry, material);
  line.renderOrder = 20;
  line.rotation.set(config.tiltX, config.tiltY, config.tiltZ);
  return line;
}

export default function IntroExperience({ onEnter }: IntroExperienceProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const enterRef = useRef(onEnter);
  const [active, setActive] = useState<NodeKey | null>(null);
  const [exiting, setExiting] = useState(false);
  const [labels, setLabels] = useState<Record<string, { x: number; y: number; visible: boolean }>>({});

  useEffect(() => { enterRef.current = onEnter; }, [onEnter]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, Math.max(1, mount.clientWidth) / Math.max(1, mount.clientHeight), 0.1, 100);
    camera.position.set(0, 0.15, 13.5);
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' }); } catch { return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setSize(mount.clientWidth, mount.clientHeight, false);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const root = new THREE.Group();
    root.position.x = 0.35;
    scene.add(root);
    scene.add(new THREE.AmbientLight(0xc4cec7, 0.75));
    const key = new THREE.DirectionalLight(0xf1f3ef, 1.15); key.position.set(5, 6, 8); scene.add(key);
    const fill = new THREE.DirectionalLight(0x8eaa98, 0.35); fill.position.set(-6, -2, 4); scene.add(fill);

    const sphere = new THREE.Group(); root.add(sphere);
    const outer = new THREE.Mesh(new THREE.IcosahedronGeometry(3.25, 3), new THREE.MeshBasicMaterial({ color: 0xa6b3aa, wireframe: true, transparent: true, opacity: 0.34, depthWrite: false, depthTest: false }));
    sphere.add(outer);
    const inner = new THREE.Mesh(new THREE.IcosahedronGeometry(2.75, 2), new THREE.MeshBasicMaterial({ color: 0xc2cbc4, wireframe: true, transparent: true, opacity: 0.22, depthWrite: false }));
    sphere.add(inner);
    const core = new THREE.Mesh(new THREE.SphereGeometry(2.35, 32, 20), new THREE.MeshPhysicalMaterial({ color: 0x71867b, roughness: 0.72, metalness: 0.05, transmission: 0.24, transparent: true, opacity: 0.22, thickness: 1.2, clearcoat: 0.15 }));
    sphere.add(core);

    const bars = new THREE.Group();
    for (let i = 0; i < 15; i += 1) {
      const height = 0.8 + ((i * 17) % 9) * 0.22;
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.11, height, 0.11), new THREE.MeshBasicMaterial({ color: 0xd1d8d1, transparent: true, opacity: 0.26, depthWrite: false }));
      bar.position.set((i - 7) * 0.22, -0.35 + height / 2, 0.15 * Math.sin(i)); bars.add(bar);
    }
    sphere.add(bars);

    const orbitLines = ORBITS.map((config, index) => { const line = createOrbit(config, index === 4 ? 0xc18a80 : 0x9caf9e); root.add(line); return line; });
    const nodeGroups = NODES.map((node) => {
      const group = new THREE.Group();
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.24, 18, 18), new THREE.MeshPhysicalMaterial({ color: node.color, roughness: 0.42, metalness: 0.1, transmission: 0.12, transparent: true, opacity: 0.94, clearcoat: 0.45 }));
      mesh.userData.node = node.key; group.add(mesh);
      group.add(new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 16), new THREE.MeshBasicMaterial({ color: node.color, transparent: true, opacity: 0.06, depthWrite: false })));
      root.add(group); return { group, mesh };
    });
    const connectors = NODES.map((node) => {
      const geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
      const material = new THREE.LineBasicMaterial({ color: node.color, transparent: true, opacity: 0.11, depthWrite: false, depthTest: false });
      const line = new THREE.Line(geometry, material); line.renderOrder = 21; root.add(line); return line;
    });

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2(10, 10);
    let pointerX = 0, pointerY = 0, hovered: NodeKey | null = null, frame = 0, time = 0, visible = true, converging = false, convergenceStart = 0;
    let observer: IntersectionObserver | null = null;

    const onMove = (event: PointerEvent) => { const rect = renderer.domElement.getBoundingClientRect(); pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1; pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1; pointerX = pointer.x; pointerY = pointer.y; };
    const onLeave = () => { pointer.set(10, 10); };
    renderer.domElement.addEventListener('pointermove', onMove);
    renderer.domElement.addEventListener('pointerleave', onLeave);
    window.addEventListener('resize', () => { const w = Math.max(1, mount.clientWidth), h = Math.max(1, mount.clientHeight); camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h, false); });
    if ('IntersectionObserver' in window) { observer = new IntersectionObserver((entries) => { visible = entries[0]?.isIntersecting ?? true; }); observer.observe(mount); }

    const projectLabels = () => {
      const next: Record<string, { x: number; y: number; visible: boolean }> = {};
      nodeGroups.forEach((item, index) => { const p = item.group.position.clone().project(camera); next[NODES[index].key] = { x: (p.x * 0.5 + 0.5) * mount.clientWidth, y: (-p.y * 0.5 + 0.5) * mount.clientHeight, visible: p.z < 1 && Math.abs(p.x) < 1.2 && Math.abs(p.y) < 1.15 }; });
      setLabels(next);
    };

    const clock = new THREE.Clock();
    const animate = () => {
      frame = requestAnimationFrame(animate); if (!visible) return;
      const delta = Math.min(clock.getDelta(), 0.05); time += delta;
      if (!converging && !reduced) { sphere.rotation.y += delta * 0.055; sphere.rotation.x = Math.sin(time * 0.18) * 0.035; root.rotation.y = Math.sin(time * 0.12) * 0.035; orbitLines.forEach((line, i) => { line.rotation.z += delta * ORBITS[i].speed; }); }
      const raw = converging ? Math.min(1, (performance.now() - convergenceStart) / 1050) : 0; const eased = raw * raw * (3 - 2 * raw);
      nodeGroups.forEach((item, index) => {
        const config = ORBITS[index]; const t = time * config.speed + index * (Math.PI * 2 / NODES.length);
        const target = new THREE.Vector3(Math.cos(t) * config.radius, Math.sin(t * 0.9 + index) * 1.2, Math.sin(t) * config.radius * config.yScale);
        if (converging) target.multiplyScalar(1 - eased);
        item.group.position.lerp(target, 0.16);
        const lit = hovered === NODES[index].key; const scale = (lit ? 1.22 : 1) * (converging ? 1 - eased * 0.28 : 1); item.group.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.16);
        const positions = connectors[index].geometry.attributes.position as THREE.BufferAttribute; positions.setXYZ(0, item.group.position.x, item.group.position.y, item.group.position.z); positions.setXYZ(1, 0, 0, 0); positions.needsUpdate = true; (connectors[index].material as THREE.LineBasicMaterial).opacity = lit ? 0.38 : 0.11;
      });
      raycaster.setFromCamera(pointer, camera); const hit = raycaster.intersectObjects(nodeGroups.map((item) => item.mesh), false)[0]; const nextHover = hit?.object.userData.node as NodeKey | undefined;
      if (hovered !== (nextHover ?? null)) { hovered = nextHover ?? null; setActive(hovered); }
      root.position.x = 0.35 + pointerX * 0.12; root.position.y = pointerY * 0.06; renderer.render(scene, camera);
      if (Math.floor(time * 20) % 2 === 0) projectLabels();
    };
    animate();

    const startConvergence = () => { if (converging) return; converging = true; convergenceStart = performance.now(); setExiting(true); window.setTimeout(() => enterRef.current(), 1120); };
    (mount as HTMLDivElement & { __startConvergence?: () => void }).__startConvergence = startConvergence;

    return () => {
      cancelAnimationFrame(frame); observer?.disconnect(); renderer.domElement.removeEventListener('pointermove', onMove); renderer.domElement.removeEventListener('pointerleave', onLeave); renderer.dispose();
      scene.traverse((object) => { if (object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.LineLoop) { object.geometry.dispose(); const material = object.material; if (Array.isArray(material)) material.forEach((item) => item.dispose()); else material.dispose(); } });
      mount.innerHTML = '';
    };
  }, []);

  const start = () => { if (exiting) return; const mount = mountRef.current as (HTMLDivElement & { __startConvergence?: () => void }) | null; mount?.__startConvergence?.(); };
  const skip = () => { if (exiting) return; setExiting(true); window.setTimeout(() => enterRef.current(), 260); };

  return <main className={`cb-intro-v2 ${exiting ? 'is-exiting' : ''}`} aria-label="CorporateBaddie introduction">
    <header className="cb-intro-v2__header"><div className="cb-intro-v2__brand"><span className="cb-intro-v2__dot"/><strong>CORPORATEBADDIE</strong><span className="cb-intro-v2__divider">|</span><span>INTRO</span></div><div className="cb-intro-v2__section">DECISION INTELLIGENCE / 01</div><button className="cb-intro-v2__skip" type="button" onClick={skip}>SKIP INTRO <span>→</span></button></header>
    <section className="cb-intro-v2__body"><div className="cb-intro-v2__copy"><div className="cb-intro-v2__kicker">MAKING SENSE OF CORPORATE NONSENSE.</div><h1>Turn business<br/>questions into<br/><em>evidence-backed</em><br/>decisions.</h1><p>It investigates your data, checks the market, tests assumptions and shows you why a recommendation can be trusted.</p><div className="cb-intro-v2__example-label">EXAMPLE QUESTION</div><button className="cb-intro-v2__question" type="button" onClick={start}>Why are our margins falling? <span>→</span></button><div className="cb-intro-v2__actions"><button className="cb-intro-v2__enter" type="button" onClick={start} disabled={exiting}>ENTER DECISION INTELLIGENCE <span>↗</span></button><button className="cb-intro-v2__secondary" type="button" onClick={skip}>SKIP INTRO</button></div></div>
      <div className="cb-intro-v2__visual"><div ref={mountRef} className="cb-intro-v2__canvas"/>{NODES.map((node) => { const position = labels[node.key]; const selected = active === node.key; return position ? <button key={node.key} type="button" className={`cb-intro-v2__node-label ${selected ? 'is-active' : ''}`} style={{ left: position.x, top: position.y, opacity: position.visible ? 1 : 0 }} onClick={() => setActive(node.key)} aria-label={`${node.key}: ${node.description}`}><span>{node.key}</span>{selected && <small>{node.detail}</small>}</button> : null; })}{active && <div className="cb-intro-v2__node-info"><span>{active}</span><strong>{NODES.find((node) => node.key === active)?.detail}</strong><p>{NODES.find((node) => node.key === active)?.description}</p></div>}</div></section>
    <footer className="cb-intro-v2__footer"><div><div className="cb-intro-v2__footer-kicker">INTELLIGENCE SYSTEM</div><div className="cb-intro-v2__steps">{NODES.map((node, index) => <span key={node.key} className={index === 0 ? 'is-current' : ''}>{String(index + 1).padStart(2, '0')} {node.key}</span>)}</div></div><div className="cb-intro-v2__principle">— EVIDENCE OVER ELOQUENCE.</div></footer>
    <style>{` .cb-intro-v2{position:fixed;inset:0;z-index:1000;background:#0a0d0c;color:#e7e9e4;overflow:hidden;font-family:'Plus Jakarta Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;transition:opacity .28s ease,transform .5s cubic-bezier(.22,1,.36,1)}.cb-intro-v2.is-exiting{opacity:0;transform:scale(1.025)}.cb-intro-v2__header{height:66px;border-bottom:1px solid rgba(196,205,196,.1);display:flex;align-items:center;justify-content:space-between;padding:0 3vw;position:relative;z-index:2;font:600 10px/1 'JetBrains Mono',monospace;letter-spacing:.13em;color:#89938b;text-transform:uppercase}.cb-intro-v2__brand{display:flex;align-items:center;gap:9px}.cb-intro-v2__brand strong{font:700 16px/1 'Plus Jakarta Sans',sans-serif;letter-spacing:-.04em;color:#edf0eb}.cb-intro-v2__dot{width:7px;height:7px;border-radius:50%;background:#91aa95;box-shadow:0 0 0 3px rgba(145,170,149,.08)}.cb-intro-v2__divider{opacity:.3}.cb-intro-v2__section{position:absolute;left:50%;transform:translateX(-50%);color:#6f7b73}.cb-intro-v2__skip{border:0;background:none;color:#8c968e;font:600 10px 'JetBrains Mono',monospace;letter-spacing:.12em;cursor:pointer}.cb-intro-v2__skip span{font-size:15px;margin-left:7px}.cb-intro-v2__body{height:calc(100% - 156px);min-height:520px;display:grid;grid-template-columns:minmax(380px,.82fr) minmax(620px,1.35fr);gap:1vw;align-items:center;padding:0 6vw;position:relative}.cb-intro-v2__copy{position:relative;z-index:3;max-width:530px}.cb-intro-v2__kicker,.cb-intro-v2__example-label,.cb-intro-v2__footer-kicker{font:600 10px 'JetBrains Mono',monospace;letter-spacing:.17em;color:#87a08d}.cb-intro-v2 h1{font-size:clamp(44px,4.15vw,70px);line-height:.97;letter-spacing:-.055em;margin:26px 0;font-weight:650}.cb-intro-v2 h1 em{font-style:normal;color:#a9c0ad}.cb-intro-v2__copy>p{font-size:14px;line-height:1.7;color:#98a49c;max-width:470px;margin:0 0 34px}.cb-intro-v2__example-label{color:#78847c;margin-bottom:9px}.cb-intro-v2__question{width:min(410px,100%);display:flex;justify-content:space-between;align-items:center;border:1px solid rgba(196,205,196,.14);background:rgba(17,21,19,.68);color:#d9ded9;padding:13px 15px;text-align:left;font-size:13px;cursor:pointer}.cb-intro-v2__question span{color:#9caf9e;font-size:18px}.cb-intro-v2__actions{display:flex;gap:26px;align-items:center;margin-top:22px}.cb-intro-v2__enter{border:0;background:#91a993;color:#152019;padding:14px 18px;font:700 10px 'JetBrains Mono',monospace;letter-spacing:.12em;cursor:pointer}.cb-intro-v2__secondary{border:0;background:none;color:#7e8a82;font:600 10px 'JetBrains Mono',monospace;letter-spacing:.12em;cursor:pointer;text-decoration:underline;text-underline-offset:5px}.cb-intro-v2__visual{height:min(720px,calc(100vh - 170px));min-height:520px;position:relative}.cb-intro-v2__canvas{position:absolute;inset:0}.cb-intro-v2__canvas canvas{width:100%;height:100%;display:block}.cb-intro-v2__node-label{position:absolute;transform:translate(-50%,-50%);pointer-events:auto;border:0!important;background:transparent!important;color:#7f8b83;padding:4px;text-align:left;cursor:pointer;font:600 10px 'JetBrains Mono',monospace;letter-spacing:.12em;text-shadow:0 1px 10px #0a0d0c;transition:color .16s ease,opacity .2s ease}.cb-intro-v2__node-label:hover,.cb-intro-v2__node-label.is-active{color:#b6ccb9}.cb-intro-v2__node-label small{display:block;margin-top:5px;font-size:9px;letter-spacing:.04em;color:#88958c;text-transform:none;white-space:nowrap}.cb-intro-v2__node-info{position:absolute;right:2%;bottom:9%;width:210px;border-left:1px solid rgba(142,179,151,.45);padding:5px 0 5px 14px;background:transparent}.cb-intro-v2__node-info span{font:600 9px 'JetBrains Mono',monospace;letter-spacing:.15em;color:#91aa95}.cb-intro-v2__node-info strong{display:block;font-size:12px;margin-top:7px;font-weight:600}.cb-intro-v2__node-info p{font-size:11px;line-height:1.5;color:#7f8a82;margin:6px 0 0}.cb-intro-v2__footer{position:absolute;bottom:0;left:0;right:0;height:90px;border-top:1px solid rgba(196,205,196,.09);display:flex;justify-content:space-between;align-items:center;padding:0 6vw;z-index:2}.cb-intro-v2__steps{display:flex;gap:34px;margin-top:13px;font:600 9px 'JetBrains Mono',monospace;letter-spacing:.1em;color:#737e76}.cb-intro-v2__steps span.is-current{color:#d4ddd5}.cb-intro-v2__principle{font:600 9px 'JetBrains Mono',monospace;letter-spacing:.13em;color:#67736b}@media(max-width:1050px){.cb-intro-v2__body{grid-template-columns:1fr 1fr;padding:0 4vw}.cb-intro-v2 h1{font-size:clamp(40px,5.5vw,58px)}.cb-intro-v2__steps{gap:16px}}@media(max-width:760px){.cb-intro-v2__section{display:none}.cb-intro-v2__body{height:calc(100% - 136px);display:flex;flex-direction:column;justify-content:center;padding:34px 7vw 20px;overflow:auto}.cb-intro-v2 h1{font-size:clamp(40px,10vw,58px);margin:17px 0}.cb-intro-v2__copy>p{font-size:13px;margin-bottom:20px}.cb-intro-v2__visual{height:45vh;min-height:300px;order:-1}.cb-intro-v2__footer{height:70px;padding:0 7vw}.cb-intro-v2__steps{gap:9px;overflow:hidden;white-space:nowrap}.cb-intro-v2__steps span{font-size:8px}.cb-intro-v2__principle,.cb-intro-v2__node-info{display:none}.cb-intro-v2__actions{margin-top:16px}}@media(prefers-reduced-motion:reduce){.cb-intro-v2,.cb-intro-v2 *{transition:none!important}.cb-intro-v2.is-exiting{transform:none}} `}</style>
  </main>;
}
