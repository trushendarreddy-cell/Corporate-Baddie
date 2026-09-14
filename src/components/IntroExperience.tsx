import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export interface IntroExperienceProps {
  onEnter: () => void;
}

type NodeKey = 'DATA' | 'ANALYSIS' | 'MARKET' | 'EVIDENCE' | 'RISK' | 'DECISION';

const NODE_ORDER: NodeKey[] = ['DATA', 'ANALYSIS', 'MARKET', 'EVIDENCE', 'RISK', 'DECISION'];
const NODE_COPY: Record<NodeKey, { title: string; detail: string; description: string }> = {
  DATA: { 
    title: 'DATA', 
    detail: 'Your business data',
    description: 'Internal records and analytics.'
  },
  ANALYSIS: { 
    title: 'ANALYSIS', 
    detail: 'Pattern recognition',
    description: 'Statistical analysis and trends.'
  },
  MARKET: { 
    title: 'MARKET', 
    detail: "What's happening outside",
    description: 'External market conditions.'
  },
  EVIDENCE: { 
    title: 'EVIDENCE', 
    detail: 'What supports the decision',
    description: 'Sources and claims.'
  },
  RISK: { 
    title: 'RISK', 
    detail: 'What could go wrong',
    description: 'Uncertainty and downside.'
  },
  DECISION: { 
    title: 'DECISION', 
    detail: 'What we should do',
    description: 'Recommended action.'
  },
};

const NODE_COLORS: Record<NodeKey, number> = {
  DATA: 0x9aa39b,
  ANALYSIS: 0xa0a8a1,
  MARKET: 0xaab0a8,
  EVIDENCE: 0x8eb397,
  RISK: 0xb47d78,
  DECISION: 0x8eb397,
};

export const IntroExperience: React.FC<IntroExperienceProps> = ({ onEnter }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const onEnterRef = useRef(onEnter);
  const [activeNode, setActiveNode] = useState<NodeKey | null>(null);
  const [ready, setReady] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [convergenceActive, setConvergenceActive] = useState(false);
  const [labelPositions, setLabelPositions] = useState<Record<NodeKey, { x: number; y: number; z: number }>>({} as any);
  const convergenceStateRef = useRef({ active: false, progress: 0, duration: 1200 });

  useEffect(() => { onEnterRef.current = onEnter; }, [onEnter]);

  const handleSkip = () => {
    if (exiting) return;
    setExiting(true);
    window.setTimeout(() => onEnterRef.current(), 300);
  };

  const enter = () => {
    if (exiting || convergenceActive) return;
    setExiting(true);
    setConvergenceActive(true);
    convergenceStateRef.current = { active: true, progress: 0, duration: 1200 };
    window.setTimeout(() => onEnterRef.current(), 1400);
  };

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const width = Math.max(1, mount.clientWidth);
    const height = Math.max(1, mount.clientHeight);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0.8, 12);

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true, 
      powerPreference: 'low-power' 
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const world = new THREE.Group();
    scene.add(world);

    // Lighting - soft and analytical
    scene.add(new THREE.AmbientLight(0xb0bab4, 0.6));
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(5, 7, 9);
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0x7ea889, 0.4);
    fillLight.position.set(-6, -2, 5);
    scene.add(fillLight);
    const backLight = new THREE.DirectionalLight(0x94a3b8, 0.3);
    backLight.position.set(0, -3, -6);
    scene.add(backLight);

    // ========== CENTRAL SPHERE - COLORFUL WIREFRAME GEODESIC ==========
    const sphereGroup = new THREE.Group();
    world.add(sphereGroup);

    // Main wireframe sphere - colorful geodesic structure with gradient colors
    const mainWireframeGeo = new THREE.IcosahedronGeometry(3.2, 4);
    
    // Create gradient effect with vertex colors
    const positionAttribute = mainWireframeGeo.attributes.position;
    const colors = [];
    const color1 = new THREE.Color(0x8eb397); // Sage green
    const color2 = new THREE.Color(0x6fa0d9); // Blue
    const color3 = new THREE.Color(0xb47d78); // Terracotta
    
    for (let i = 0; i < positionAttribute.count; i++) {
      const y = positionAttribute.getY(i);
      let color: THREE.Color;
      
      if (y > 1) {
        color = color1; // Top: green
      } else if (y > -1) {
        color = color2; // Middle: blue
      } else {
        color = color3; // Bottom: terracotta
      }
      
      colors.push(color.r, color.g, color.b);
    }
    
    mainWireframeGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    
    const mainWireframeMat = new THREE.MeshBasicMaterial({
      wireframe: true,
      transparent: true,
      opacity: 0.6,
      vertexColors: true
    });
    const mainWireframe = new THREE.Mesh(mainWireframeGeo, mainWireframeMat);
    sphereGroup.add(mainWireframe);

    // Inner wireframe with different color
    const innerWireframeGeo = new THREE.IcosahedronGeometry(2.8, 3);
    const innerWireframeMat = new THREE.MeshBasicMaterial({
      color: 0x9cb3a8,
      wireframe: true,
      transparent: true,
      opacity: 0.3
    });
    const innerWireframe = new THREE.Mesh(innerWireframeGeo, innerWireframeMat);
    sphereGroup.add(innerWireframe);

    // Core with colorful emission
    const coreGeo = new THREE.IcosahedronGeometry(2.4, 2);
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: 0x4a7c6f,
      metalness: 0.2,
      roughness: 0.1,
      transmission: 0.5,
      thickness: 1.2,
      transparent: true,
      opacity: 0.25,
      emissive: 0x6fa0d9,
      emissiveIntensity: 0.15,
      side: THREE.DoubleSide
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    sphereGroup.add(core);

    // Colorful connection beams from center
    const beamColors = [
      0x8eb397, // Green
      0x6fa0d9, // Blue
      0xb47d78, // Terracotta
      0x9cb3a8, // Light green
      0x7a9cc6, // Light blue
      0xc48e87, // Light terracotta
    ];
    
    const beamPositions = [
      [0, 0, 0, 0, 3.2, 0],
      [0, 0, 0, 0, -3.2, 0],
      [0, 0, 0, 3.2, 0, 0],
      [0, 0, 0, -3.2, 0, 0],
      [0, 0, 0, 0, 0, 3.2],
      [0, 0, 0, 0, 0, -3.2],
    ];
    
    beamPositions.forEach((coords, index) => {
      const points = [
        new THREE.Vector3(coords[0], coords[1], coords[2]),
        new THREE.Vector3(coords[3], coords[4], coords[5])
      ];
      const beamGeo = new THREE.BufferGeometry().setFromPoints(points);
      const beamMat = new THREE.LineBasicMaterial({
        color: beamColors[index % beamColors.length],
        transparent: true,
        opacity: 0.25
      });
      const beam = new THREE.Line(beamGeo, beamMat);
      sphereGroup.add(beam);
    });

    // Colorful vertex markers
    const vertexColors = [0x8eb397, 0x6fa0d9, 0xb47d78];
    const vertexPositions = [
      [0, 3.2, 0], [0, -3.2, 0], [3.2, 0, 0], [-3.2, 0, 0],
      [2.2, 2.2, 0], [-2.2, 2.2, 0], [2.2, -2.2, 0], [-2.2, -2.2, 0],
      [0, 2.2, 2.2], [0, -2.2, 2.2], [0, 2.2, -2.2], [0, -2.2, -2.2],
      [2.2, 0, 2.2], [-2.2, 0, 2.2], [2.2, 0, -2.2], [-2.2, 0, -2.2]
    ];
    
    vertexPositions.forEach(([x, y, z], index) => {
      const vertexGeo = new THREE.SphereGeometry(0.08, 8, 8);
      const vertexMat = new THREE.MeshBasicMaterial({
        color: vertexColors[index % vertexColors.length],
        transparent: true,
        opacity: 0.8
      });
      const vertex = new THREE.Mesh(vertexGeo, vertexMat);
      vertex.position.set(x, y, z);
      sphereGroup.add(vertex);
    });

    // ========== VISIBLE ORBITAL RINGS (CLEAR MOON-LIKE PATHS) ==========
    const createOrbitRing = (radius: number, tiltX: number, tiltY: number, tiltZ: number, color: number, opacity: number, thickness: number = 0.01) => {
      const curve = new THREE.EllipseCurve(
        0, 0,
        radius, radius * 0.8, // More elliptical
        0, 2 * Math.PI,
        false,
        0
      );
      
      const points = curve.getPoints(128);
      const points3D = points.map(p => new THREE.Vector3(p.x, 0, p.y));
      
      const geo = new THREE.BufferGeometry().setFromPoints(points3D);
      const mat = new THREE.LineBasicMaterial({ 
        color, 
        transparent: true, 
        opacity,
        linewidth: thickness
      });
      const ring = new THREE.Line(geo, mat);
      ring.rotation.x = tiltX;
      ring.rotation.y = tiltY;
      ring.rotation.z = tiltZ;
      return ring;
    };

    // Create 6 CLEARLY visible orbital rings with better spacing
    const orbitalRings = [
      { radius: 6.5, tiltX: Math.PI / 6, tiltY: 0, tiltZ: 0, color: 0x8eb397, opacity: 0.5, speed: 0.0005 },
      { radius: 7.2, tiltX: Math.PI / 4, tiltY: Math.PI / 3, tiltZ: 0, color: 0x6fa0d9, opacity: 0.45, speed: -0.0004 },
      { radius: 6.8, tiltX: Math.PI / 8, tiltY: Math.PI / 2, tiltZ: 0, color: 0xb47d78, opacity: 0.5, speed: 0.0006 },
      { radius: 7.5, tiltX: Math.PI / 3, tiltY: Math.PI / 6, tiltZ: Math.PI / 12, color: 0x7a9cc6, opacity: 0.4, speed: -0.0003 },
      { radius: 7.0, tiltX: Math.PI / 5, tiltY: Math.PI / 4, tiltZ: -Math.PI / 12, color: 0x9cb3a8, opacity: 0.45, speed: 0.0007 },
      { radius: 7.8, tiltX: Math.PI / 2.5, tiltY: Math.PI / 1.5, tiltZ: 0, color: 0xc48e87, opacity: 0.4, speed: -0.0005 },
    ];
    
    const allRings: THREE.Line[] = [];
    orbitalRings.forEach(config => {
      const ring = createOrbitRing(config.radius, config.tiltX, config.tiltY, config.tiltZ, config.color, config.opacity);
      ring.userData.speed = config.speed;
      world.add(ring);
      allRings.push(ring);
    });

    // ========== 6 ORBITING NODES (CLEARLY VISIBLE WITH TRAILS) ==========
    const nodeMeshes = new Map<NodeKey, THREE.Group>();
    const connectorLines = new Map<NodeKey, THREE.Line>();
    const nodeTrails = new Map<NodeKey, THREE.Points>();
    
    // Orbital configurations matching the ring radii
    const nodeOrbitalData: Record<NodeKey, { 
      angle: number; 
      radius: number; 
      tiltX: number; 
      tiltY: number;
      tiltZ: number;
      speed: number;
    }> = {
      DATA: { 
        angle: 0, 
        radius: 6.5,
        tiltX: Math.PI / 6, 
        tiltY: 0,
        tiltZ: 0,
        speed: 0.4
      },
      ANALYSIS: { 
        angle: Math.PI / 3, 
        radius: 7.2,
        tiltX: Math.PI / 4, 
        tiltY: Math.PI / 3,
        tiltZ: 0,
        speed: 0.5
      },
      MARKET: { 
        angle: Math.PI * 2 / 3, 
        radius: 6.8,
        tiltX: Math.PI / 8, 
        tiltY: Math.PI / 2,
        tiltZ: 0,
        speed: 0.35
      },
      EVIDENCE: { 
        angle: Math.PI, 
        radius: 7.5,
        tiltX: Math.PI / 3, 
        tiltY: Math.PI / 6,
        tiltZ: Math.PI / 12,
        speed: 0.6
      },
      RISK: { 
        angle: Math.PI * 4 / 3, 
        radius: 7.0,
        tiltX: Math.PI / 5, 
        tiltY: Math.PI / 4,
        tiltZ: -Math.PI / 12,
        speed: 0.45
      },
      DECISION: { 
        angle: Math.PI * 5 / 3, 
        radius: 7.8,
        tiltX: Math.PI / 2.5, 
        tiltY: Math.PI / 1.5,
        tiltZ: 0,
        speed: 0.5
      },
    };

    NODE_ORDER.forEach((name) => {
      const orbital = nodeOrbitalData[name];
      const color = NODE_COLORS[name];
      
      const nodeGroup = new THREE.Group();
      nodeGroup.userData.nodeKey = name;
      nodeGroup.userData.orbital = orbital;
      nodeGroup.userData.trailHistory = [];
      
      // MUCH larger, more visible nodes
      const nodeGeo = name === 'DECISION' 
        ? new THREE.SphereGeometry(0.45, 16, 16)
        : new THREE.SphereGeometry(0.38, 16, 16);
      
      const nodeMat = new THREE.MeshStandardMaterial({ 
        color, 
        metalness: 0.4, 
        roughness: 0.1,
        emissive: color,
        emissiveIntensity: 0.6
      });
      
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      nodeGroup.add(nodeMesh);
      
      // Larger glowing halo
      const haloGeo = new THREE.SphereGeometry(0.8, 16, 16);
      const haloMat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.2,
        side: THREE.BackSide
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.userData.isHalo = true;
      nodeGroup.add(halo);
      
      // Particle trail system
      const trailCount = 30;
      const trailPositions = new Float32Array(trailCount * 3);
      const trailGeo = new THREE.BufferGeometry();
      trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
      const trailMat = new THREE.PointsMaterial({
        color,
        size: 0.15,
        transparent: true,
        opacity: 0.6,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending
      });
      const trail = new THREE.Points(trailGeo, trailMat);
      world.add(trail);
      nodeTrails.set(name, trail);
      
      // Calculate initial position
      const calcPosition = (angle: number) => {
        const baseX = Math.cos(angle) * orbital.radius;
        const baseY = 0;
        const baseZ = Math.sin(angle) * orbital.radius * 0.8; // Elliptical
        
        const pos = new THREE.Vector3(baseX, baseY, baseZ);
        pos.applyEuler(new THREE.Euler(orbital.tiltX, orbital.tiltY, orbital.tiltZ));
        return pos;
      };
      
      const initialPos = calcPosition(orbital.angle);
      nodeGroup.position.copy(initialPos);
      
      world.add(nodeGroup);
      nodeMeshes.set(name, nodeGroup);
      
      // Colorful connector line
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        initialPos.clone(),
        new THREE.Vector3(0, 0, 0)
      ]);
      const lineMat = new THREE.LineBasicMaterial({ 
        color, 
        transparent: true, 
        opacity: 0.15
      });
      const line = new THREE.Line(lineGeo, lineMat);
      line.userData.nodeKey = name;
      world.add(line);
      connectorLines.set(name, line);
    });

    // Sparse dust field
    const dustCount = 200;
    const dustPos = new Float32Array(dustCount * 3);
    const dustColors = new Float32Array(dustCount * 3);
    const dustSizes = new Float32Array(dustCount);
    
    for (let i = 0; i < dustCount; i++) {
      const r = 8 + Math.random() * 8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      dustPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      dustPos[i * 3 + 1] = r * Math.cos(phi) * 0.5;
      dustPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
      
      // Random colors
      const colorChoice = Math.random();
      if (colorChoice < 0.33) {
        dustColors[i * 3] = 0.56; dustColors[i * 3 + 1] = 0.7; dustColors[i * 3 + 2] = 0.59; // Green
      } else if (colorChoice < 0.66) {
        dustColors[i * 3] = 0.44; dustColors[i * 3 + 1] = 0.63; dustColors[i * 3 + 2] = 0.85; // Blue
      } else {
        dustColors[i * 3] = 0.71; dustColors[i * 3 + 1] = 0.49; dustColors[i * 3 + 2] = 0.47; // Terracotta
      }
      
      dustSizes[i] = Math.random() * 0.05 + 0.02;
    }
    
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    dustGeo.setAttribute('color', new THREE.BufferAttribute(dustColors, 3));
    dustGeo.setAttribute('size', new THREE.BufferAttribute(dustSizes, 1));
    
    const dust = new THREE.Points(
      dustGeo, 
      new THREE.PointsMaterial({ 
        size: 0.025,
        transparent: true, 
        opacity: 0.6, 
        sizeAttenuation: true,
        vertexColors: true,
        blending: THREE.AdditiveBlending
      })
    );
    world.add(dust);

    // ========== INTERACTION & CAMERA CONTROLS ==========
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2(-10, -10);
    let rafId = 0;
    let visible = true;
    let lastHover: NodeKey | null = null;
    
    // Drag state
    const dragState = {
      isDragging: false,
      previousX: 0,
      previousY: 0,
      velocityX: 0,
      velocityY: 0,
      inertia: 0.95
    };
    
    // Target rotation for smooth camera movement
    const targetRotation = { x: 0, y: 0 };
    const currentRotation = { x: 0, y: 0 };

    const findNodeKey = (obj: THREE.Object3D | null): NodeKey | null => {
      let o: THREE.Object3D | null = obj;
      while (o) {
        if (o.userData.nodeKey) return o.userData.nodeKey as NodeKey;
        o = o.parent;
      }
      return null;
    };

    const handlePointerMove = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      if (dragState.isDragging) {
        const deltaX = event.clientX - dragState.previousX;
        const deltaY = event.clientY - dragState.previousY;
        
        dragState.velocityX = deltaX * 0.005;
        dragState.velocityY = deltaY * 0.005;
        
        targetRotation.y += dragState.velocityX;
        targetRotation.x += dragState.velocityY;
        
        // Clamp X rotation
        targetRotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, targetRotation.x));
        
        dragState.previousX = event.clientX;
        dragState.previousY = event.clientY;
        
        renderer.domElement.style.cursor = 'grabbing';
      } else {
        // Gentle parallax when not dragging
        targetRotation.x = -pointer.y * 0.1;
        targetRotation.y = pointer.x * 0.15;
      }
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (convergenceActive) return;
      dragState.isDragging = true;
      dragState.previousX = event.clientX;
      dragState.previousY = event.clientY;
      dragState.velocityX = 0;
      dragState.velocityY = 0;
      renderer.domElement.style.cursor = 'grabbing';
    };

    const handlePointerUp = () => {
      dragState.isDragging = false;
      renderer.domElement.style.cursor = 'grab';
    };

    const handlePointerLeave = () => {
      dragState.isDragging = false;
      targetRotation.x = 0;
      targetRotation.y = 0;
      renderer.domElement.style.cursor = 'default';
      if (lastHover) {
        lastHover = null;
        setActiveNode(null);
      }
    };

    const selectNode = () => {
      if (convergenceActive) return;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(world.children, true);
      const node = hits.length ? findNodeKey(hits[0].object) : null;
      if (node) setActiveNode(node);
    };

    renderer.domElement.addEventListener('pointermove', handlePointerMove);
    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    renderer.domElement.addEventListener('pointerup', handlePointerUp);
    renderer.domElement.addEventListener('pointerleave', handlePointerLeave);
    renderer.domElement.addEventListener('click', selectNode);
    renderer.domElement.style.cursor = 'grab';

    const resize = () => {
      const w = Math.max(1, mount.clientWidth);
      const h = Math.max(1, mount.clientHeight);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', resize);

    const observer = new IntersectionObserver(([entry]) => { 
      visible = entry.isIntersecting; 
    });
    observer.observe(mount);

    // ========== ANIMATION LOOP ==========
    const clock = new THREE.Clock();

    const animate = () => {
      if (visible) {
        const delta = Math.min(clock.getDelta(), 0.05);
        const t = clock.elapsedTime;
        const amp = reducedMotion ? 0 : 1;

        // Convergence animation
        const conv = convergenceStateRef.current;
        if (conv.active) {
          conv.progress = Math.min(1, conv.progress + delta / (conv.duration / 1000));
          
          // Ease function for smooth acceleration
          const easeProgress = 1 - Math.pow(1 - conv.progress, 3);
          
          // Nodes converge toward sphere
          nodeMeshes.forEach((nodeGroup, name) => {
            const orbital = nodeGroup.userData.orbital;
            const targetPos = new THREE.Vector3(0, 0, 0);
            nodeGroup.position.lerp(targetPos, easeProgress * 0.95);
            
            // Increase emissive as they converge
            nodeGroup.children.forEach(child => {
              if (child instanceof THREE.Mesh && !child.userData.isHalo) {
                const mat = child.material as THREE.MeshStandardMaterial;
                mat.emissiveIntensity = 0.1 + easeProgress * 0.4;
              }
            });
            
            // Scale up slightly
            const targetScale = 1 + easeProgress * 0.5;
            nodeGroup.scale.setScalar(targetScale);
          });
          
          // Orbital rings tighten and fade
          allRings.forEach(ring => {
            ring.scale.setScalar(1 - easeProgress * 0.6);
            const mat = ring.material as THREE.LineBasicMaterial;
            mat.opacity = (mat.userData.initialOpacity || mat.opacity) * (1 - easeProgress * 0.8);
            if (!mat.userData.initialOpacity) mat.userData.initialOpacity = mat.opacity;
          });
          
          // Sphere reacts - compress then expand
          const sphereScale = conv.progress < 0.7 
            ? 1 - easeProgress * 0.15 
            : 0.85 + (conv.progress - 0.7) / 0.3 * 0.25;
          sphereGroup.scale.setScalar(sphereScale);
          
          // Increase sphere brightness
          mainWireframeMat.opacity = 0.35 + easeProgress * 0.2;
        } else {
          // Normal orbital animation with smooth camera
          
          // Apply inertia to drag velocity
          if (!dragState.isDragging) {
            dragState.velocityX *= dragState.inertia;
            dragState.velocityY *= dragState.inertia;
            targetRotation.y += dragState.velocityX;
            targetRotation.x += dragState.velocityY;
          }
          
          // Smooth interpolation to target rotation
          currentRotation.x += (targetRotation.x - currentRotation.x) * 0.08;
          currentRotation.y += (targetRotation.y - currentRotation.y) * 0.08;
          
          world.rotation.x = currentRotation.x;
          world.rotation.y = currentRotation.y + (amp * t * 0.00005);

          // Sphere slow rotation
          sphereGroup.rotation.y += amp * 0.001;
          sphereGroup.rotation.x += amp * 0.0004;
          mainWireframe.rotation.y += amp * 0.0015;
          innerWireframe.rotation.x += amp * 0.001;
          core.rotation.z += amp * 0.0008;
          
          // Ambient particle rotation
          dust.rotation.y += amp * 0.0001;

          // Orbital rings rotation - visible movement
          allRings.forEach((ring) => {
            ring.rotation.z += amp * ring.userData.speed;
          });

          // Node orbital motion with particle trails
          nodeMeshes.forEach((nodeGroup, name) => {
            const orbital = nodeGroup.userData.orbital;
            
            // Calculate orbital position
            const orbitAngle = orbital.angle + t * 0.15 * orbital.speed * amp;
            
            const baseX = Math.cos(orbitAngle) * orbital.radius;
            const baseY = 0;
            const baseZ = Math.sin(orbitAngle) * orbital.radius * 0.8;
            
            const pos = new THREE.Vector3(baseX, baseY, baseZ);
            pos.applyEuler(new THREE.Euler(orbital.tiltX, orbital.tiltY, orbital.tiltZ));
            
            nodeGroup.position.copy(pos);
            nodeGroup.rotation.y += delta * 0.5 * amp;
            
            // Pulse animation
            const pulse = 1 + Math.sin(t * 3 + orbital.angle) * 0.08;
            nodeGroup.scale.setScalar(pulse);
            
            // Update particle trail
            const trail = nodeTrails.get(name);
            if (trail) {
              const history = nodeGroup.userData.trailHistory as THREE.Vector3[];
              history.push(pos.clone());
              if (history.length > 30) history.shift();
              
              const positions = trail.geometry.attributes.position.array as Float32Array;
              history.forEach((p, i) => {
                positions[i * 3] = p.x;
                positions[i * 3 + 1] = p.y;
                positions[i * 3 + 2] = p.z;
              });
              trail.geometry.attributes.position.needsUpdate = true;
            }
            
            // Update connector line
            const line = connectorLines.get(name);
            if (line) {
              line.geometry.setFromPoints([pos.clone(), new THREE.Vector3(0, 0, 0)]);
            }
          });

          // Hover interaction
          raycaster.setFromCamera(pointer, camera);
          const hits = raycaster.intersectObjects(world.children, true);
          const hovered = hits.length ? findNodeKey(hits[0].object) : null;
          
          if (hovered !== lastHover) {
            lastHover = hovered || null;
            setActiveNode(hovered || null);
          }

          nodeMeshes.forEach((nodeGroup, name) => {
            const selected = name === lastHover;
            const targetScale = selected ? 1.28 : 1;
            nodeGroup.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.15);
            
            nodeGroup.children.forEach(child => {
              if (child instanceof THREE.Mesh && !child.userData.isHalo) {
                const mat = child.material as THREE.MeshStandardMaterial;
                const targetIntensity = selected ? 0.25 : 0.1;
                mat.emissiveIntensity += (targetIntensity - mat.emissiveIntensity) * 0.12;
              }
            });
            
            const line = connectorLines.get(name);
            if (line) {
              const lineMat = line.material as THREE.LineBasicMaterial;
              const targetOpacity = selected ? 0.35 : 0.12;
              lineMat.opacity += (targetOpacity - lineMat.opacity) * 0.12;
            }
          });
        }

        renderer.render(scene, camera);

        // Project node positions for floating labels
        if (!convergenceActive && Math.round(t * 8) % 2 === 0) {
          const v = new THREE.Vector3();
          const positions: Record<NodeKey, { x: number; y: number; z: number }> = {} as any;
          nodeMeshes.forEach((nodeGroup, key) => {
            v.setFromMatrixPosition(nodeGroup.matrixWorld);
            v.project(camera);
            const x = (v.x * 0.5 + 0.5) * mount.clientWidth;
            const y = (-v.y * 0.5 + 0.5) * mount.clientHeight;
            positions[key] = { x, y, z: v.z };
          });
          setLabelPositions(positions);
        }
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
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.domElement.removeEventListener('pointerup', handlePointerUp);
      renderer.domElement.removeEventListener('pointerleave', handlePointerLeave);
      renderer.domElement.removeEventListener('click', selectNode);
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.Points) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach((material) => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [convergenceActive]);

  const activeCopy = activeNode ? NODE_COPY[activeNode] : null;

  return (
    <div className={`cb-intro fixed inset-0 z-[100] overflow-hidden bg-[#0f1210] text-[#e7e9e4] ${exiting ? 'cb-intro-exit' : ''}`}>
      {/* Ambient Background Grid */}
      <div className="absolute inset-0 opacity-[0.15]" style={{
        backgroundImage: `
          linear-gradient(rgba(142, 179, 151, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(142, 179, 151, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '80px 80px',
        backgroundPosition: 'center center'
      }} />
      
      {/* Radial Gradient Overlay */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(circle at 60% 50%, rgba(78, 95, 87, 0.08) 0%, transparent 50%)'
      }} />
      
      {/* Top Header */}
      <header className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between border-b border-[#1a1f1c]/50 bg-[#0a0c0b]/90 px-6 py-4 backdrop-blur-sm sm:px-10 sm:py-5">
        <div className="flex items-center gap-3">
          <span className="h-1.5 w-1.5 rounded-full bg-[#8eb397]" />
          <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-[#9da79f]">CORPORATEBADDIE</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="hidden font-mono text-[8.5px] uppercase tracking-[0.2em] text-[#68716b] sm:inline">DECISION INTELLIGENCE / 01</span>
          <button 
            type="button" 
            onClick={handleSkip}
            className="group flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.18em] text-[#7f8981] transition-colors hover:text-[#b8d4bd]"
          >
            SKIP INTRO
            <span className="text-[#8eb397] transition-transform group-hover:translate-x-1">→</span>
          </button>
        </div>
      </header>

      {/* Main Two-Column Layout */}
      <div className="absolute inset-0 flex items-center">
        <div className="mx-auto grid w-full max-w-[1400px] grid-cols-1 items-center gap-8 px-6 py-20 lg:grid-cols-2 lg:gap-16 lg:px-16">
          
          {/* Left Column - Content */}
          <div className={`transition-all duration-700 ${ready ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'}`}>
            <p className="cb-kicker mb-4 text-[#7e8c82]">DECISION SYSTEM / ENTRY</p>
            
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[#7a847c]">
              Making Sense of Corporate Nonsense.
            </p>
            
            <h1 className="cb-display mb-5 text-[clamp(2.2rem,4.5vw,3.4rem)] leading-[1.1] text-[#edf0eb]">
              Turn business<br />
              questions into<br />
              <span className="text-[#8eb397]">evidence-backed</span><br />
              decisions.
            </h1>
            
            <p className="mb-6 max-w-[480px] text-[13px] leading-relaxed text-[#9da79f] sm:text-[14px]">
              It investigates your data, checks the market, tests<br className="hidden sm:inline" /> assumptions and shows you why a recommendation can be<br className="hidden sm:inline" /> trusted.
            </p>

            {/* Example Question */}
            <div className="mb-6">
              <p className="cb-meta mb-2.5 text-[#6a736d]">QUESTION</p>
              <div className="flex items-center border border-[#2a322c] bg-[#0f1210] px-4 py-2.5 text-[13px] text-[#c5cec7]">
                <span className="flex-1">"Why are our margins falling?"</span>
                <span className="text-[#8eb397]">→</span>
              </div>
            </div>

            {/* Primary CTA */}
            <button 
              type="button" 
              onClick={enter}
              disabled={convergenceActive}
              className="group inline-flex items-center gap-2.5 border border-[#7ea889] bg-[#7ea889] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#172019] transition-all hover:-translate-y-0.5 hover:bg-[#91b99a] active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0"
            >
              ENTER DECISION INTELLIGENCE
              <span className="text-[#2a3b2e] transition-transform group-hover:translate-x-0.5">↗</span>
            </button>
          </div>

          {/* Right Column - 3D Sphere */}
          <div className={`relative transition-all duration-700 ${ready ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}`}>
            {/* Ambient Glow Behind Sphere */}
            <div className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 opacity-20 blur-[100px]" style={{
              background: 'radial-gradient(circle, rgba(142, 179, 151, 0.3) 0%, transparent 70%)'
            }} />
            
            <div 
              ref={mountRef} 
              className="relative mx-auto aspect-square w-full max-w-[600px]" 
              aria-label="Interactive CorporateBaddie decision intelligence system"
            >
              {/* Floating Node Labels */}
              {!convergenceActive && NODE_ORDER.map((nodeKey) => {
                const pos = labelPositions[nodeKey];
                if (!pos || pos.z > 1) return null; // Don't show if behind camera
                
                const isActive = activeNode === nodeKey;
                const nodeCopy = NODE_COPY[nodeKey];
                
                return (
                  <div
                    key={nodeKey}
                    className="pointer-events-none absolute transition-opacity duration-300"
                    style={{
                      left: `${pos.x}px`,
                      top: `${pos.y}px`,
                      transform: 'translate(-50%, -50%)',
                      opacity: isActive ? 1 : 0.7,
                    }}
                  >
                    <div className={`rounded px-2 py-1 text-center transition-all duration-200 ${
                      isActive ? 'bg-[#8eb397]/20 border border-[#8eb397]/40' : 'bg-[#0f1210]/80 border border-[#2a322c]/80'
                    }`}>
                      <p className={`font-mono text-[9px] font-semibold uppercase tracking-[0.18em] ${
                        isActive ? 'text-[#8eb397]' : 'text-[#9da79f]'
                      }`}>
                        {nodeKey}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Node Detail Overlay */}
            {activeCopy && (
              <div className="absolute bottom-8 left-8 right-8 border border-[#2a322c] bg-[#0f1210]/95 p-4 backdrop-blur-sm">
                <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.2em] text-[#8eb397]">{activeCopy.title}</p>
                <p className="mb-1.5 text-[13px] font-medium text-[#dce2dc]">{activeCopy.detail}</p>
                <p className="text-[11px] leading-relaxed text-[#7a847c]">{activeCopy.description}</p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Bottom Intelligence System */}
      <div className="absolute bottom-0 left-0 right-0 z-10 border-t border-[#1a1f1c]/50 bg-[#0a0c0b]/90 px-6 py-3 backdrop-blur-sm sm:px-10 sm:py-4">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="cb-kicker text-[#6a736d]">INTELLIGENCE SYSTEM</span>
            <div className="hidden items-center gap-4 sm:flex">
              {['DATA', 'ANALYSIS', 'MARKET', 'EVIDENCE', 'RISK', 'DECISION'].map((step, i) => (
                <span 
                  key={step} 
                  className={`font-mono text-[8.5px] uppercase tracking-[0.14em] transition-colors ${
                    i === 0 ? 'text-[#8eb397]' : 'text-[#5a615c]'
                  }`}
                >
                  {step}
                </span>
              ))}
            </div>
          </div>
          <span className="hidden font-mono text-[8px] uppercase tracking-[0.18em] text-[#5a615c] lg:inline">
            — EVIDENCE OVER ELOQUENCE.
          </span>
        </div>
      </div>

      <style>{`
        .cb-intro { 
          opacity: 1; 
          transition: opacity 600ms cubic-bezier(0.22, 1, 0.36, 1); 
        }
        .cb-intro-exit { 
          opacity: 0; 
          pointer-events: none; 
        }
        @media (prefers-reduced-motion: reduce) { 
          .cb-intro, .cb-intro-exit { 
            transition: opacity 200ms ease; 
          } 
        }
      `}</style>
    </div>
  );
};

export default IntroExperience;
