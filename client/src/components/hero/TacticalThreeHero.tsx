import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

// ─── Color constants ──────────────────────────────────────────────────────────
const ACCENT_HEX = 0x22d3ee; // #22D3EE — unified accent
const BG_HEX = 0x060a12;

// ─── Layered sine-wave heightmap (approximates natural terrain) ───────────────
const terrainHeight = (x: number, z: number): number =>
  Math.sin(x * 0.09) * Math.cos(z * 0.09) * 4.5 +
  Math.sin(x * 0.22 + 1.4) * Math.cos(z * 0.18 + 0.6) * 2.2 +
  Math.sin(x * 0.05 + 2.1) * Math.cos(z * 0.07 + 1.8) * 6.5 +
  Math.cos(x * 0.15 + 0.5) * Math.sin(z * 0.12 + 2.3) * 1.8;

export const TacticalThreeHero: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // ─── Renderer ─────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(BG_HEX, 1);
    container.appendChild(renderer.domElement);

    // ─── Scene ────────────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(BG_HEX, 0.016);

    // ─── Camera — slight landscape tilt, not top-down ─────────────────────────
    const camera = new THREE.PerspectiveCamera(
      44,
      container.clientWidth / container.clientHeight,
      0.1,
      400
    );
    camera.position.set(0, 24, 32);
    camera.lookAt(0, 1, -6);

    // ─── Minimal ambient ──────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0x0a1525, 3));

    // ─── TERRAIN MESH ─────────────────────────────────────────────────────────
    const T_W = 90;
    const T_D = 90;
    const T_SEG = 65; // 65×65 = 4225 quads — good balance of detail vs perf

    const terrainGeo = new THREE.PlaneGeometry(T_W, T_D, T_SEG, T_SEG);
    terrainGeo.rotateX(-Math.PI / 2);

    // Displace Y of every vertex using heightmap
    const posAttr = terrainGeo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const z = posAttr.getZ(i);
      posAttr.setY(i, terrainHeight(x, z));
    }
    posAttr.needsUpdate = true;
    terrainGeo.computeVertexNormals();

    // Dark solid fill — sits below wireframe so water is visible through gaps
    const solidMesh = new THREE.Mesh(
      terrainGeo,
      new THREE.MeshBasicMaterial({ color: 0x050c18 })
    );
    scene.add(solidMesh);

    // Wireframe overlay — topographic contour lines feel
    const wireMesh = new THREE.LineSegments(
      new THREE.WireframeGeometry(terrainGeo),
      new THREE.LineBasicMaterial({
        color: 0x1a3a5c,
        transparent: true,
        opacity: 0.55,
      })
    );
    scene.add(wireMesh);

    // ─── WATER PLANE ──────────────────────────────────────────────────────────
    // Sits at ~valley level, slowly rises and recedes to suggest flooding
    const waterGeo = new THREE.PlaneGeometry(T_W, T_D, 1, 1);
    waterGeo.rotateX(-Math.PI / 2);
    const waterMat = new THREE.MeshBasicMaterial({
      color: ACCENT_HEX,
      transparent: true,
      opacity: 0.16,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const waterPlane = new THREE.Mesh(waterGeo, waterMat);
    // Base resting level — roughly at mid-terrain, valley elevation
    waterPlane.position.y = 0.8;
    scene.add(waterPlane);

    // ─── BEACON PILLARS ───────────────────────────────────────────────────────
    // Placed at four terrain surface points to represent incident/shelter pins
    const beaconDefs = [
      { x: -20, z: -10 },
      { x: 14, z: -18 },
      { x: -6, z: 12 },
      { x: 24, z: 6 },
    ];

    interface Beacon {
      position: THREE.Vector3; // top of pillar (world)
      ring: THREE.Mesh;
      light: THREE.PointLight;
      phaseOffset: number;
    }

    const beacons: Beacon[] = [];

    beaconDefs.forEach(({ x, z }, i) => {
      const groundY = terrainHeight(x, z);
      const pillarH = 5.5 + Math.random() * 3.5;
      const topY = groundY + pillarH;

      // Pillar
      const pillar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.16, pillarH, 8),
        new THREE.MeshBasicMaterial({ color: ACCENT_HEX, transparent: true, opacity: 0.9 })
      );
      pillar.position.set(x, groundY + pillarH / 2, z);
      scene.add(pillar);

      // Top glow sphere
      const top = new THREE.Mesh(
        new THREE.SphereGeometry(0.28, 12, 12),
        new THREE.MeshBasicMaterial({ color: ACCENT_HEX })
      );
      top.position.set(x, topY + 0.28, z);
      scene.add(top);

      // Pulse ring (flat on terrain surface)
      const ringMat = new THREE.MeshBasicMaterial({
        color: ACCENT_HEX,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.5, 0.65, 32),
        ringMat
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(x, groundY + 0.12, z);
      scene.add(ring);

      // Point light for ambient beacon glow
      const light = new THREE.PointLight(ACCENT_HEX, 1.0, 16);
      light.position.set(x, groundY + pillarH * 0.6, z);
      scene.add(light);

      beacons.push({
        position: new THREE.Vector3(x, topY, z),
        ring,
        light,
        phaseOffset: i * (Math.PI / 2),
      });
    });

    // ─── ANIMATED ROUTE ARC ───────────────────────────────────────────────────
    const ARC_SEG = 80;
    const arcPairs = [[0, 1], [1, 2], [2, 3], [3, 0], [0, 2], [1, 3]] as const;
    let arcPairIdx = 0;
    let arcProgress = 0;
    let arcPhase: 'draw' | 'fade' = 'draw';
    let arcAlpha = 1.0;
    let arcLastSpawn = -1;
    const ARC_CYCLE = 5.0;       // total seconds per arc cycle
    const ARC_DRAW_FRAC = 0.55;  // fraction of cycle spent drawing

    let arcFrom = beacons[0].position.clone();
    let arcTo = beacons[1].position.clone();

    const buildArcPos = (
      from: THREE.Vector3,
      to: THREE.Vector3,
      progress: number
    ): Float32Array => {
      const pts: number[] = [];
      const h = from.distanceTo(to) * 0.42;
      const n = Math.max(2, Math.floor(ARC_SEG * progress));
      for (let i = 0; i <= n; i++) {
        const t = i / ARC_SEG;
        const p = new THREE.Vector3().lerpVectors(from, to, t);
        pts.push(p.x, p.y + 4 * t * (1 - t) * h, p.z);
      }
      return new Float32Array(pts);
    };

    const arcMat = new THREE.LineBasicMaterial({
      color: ACCENT_HEX,
      transparent: true,
      opacity: 1,
    });
    const arcGeo = new THREE.BufferGeometry();
    arcGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3));
    scene.add(new THREE.Line(arcGeo, arcMat));

    const advanceArc = (t: number) => {
      arcPairIdx = (arcPairIdx + 1) % arcPairs.length;
      const [ai, bi] = arcPairs[arcPairIdx];
      arcFrom = beacons[ai].position.clone();
      arcTo = beacons[bi].position.clone();
      arcProgress = 0;
      arcPhase = 'draw';
      arcAlpha = 1.0;
      arcLastSpawn = t;
    };

    // ─── WIND / MIST PARTICLES ────────────────────────────────────────────────
    // Low-count diagonal drifters suggesting storm wind
    const P_COUNT = 130;
    const pPos = new Float32Array(P_COUNT * 3);
    const pVX = new Float32Array(P_COUNT); // per-particle velocity X
    const pVZ = new Float32Array(P_COUNT); // per-particle velocity Z
    const BOUNDS = 46;

    for (let i = 0; i < P_COUNT; i++) {
      pPos[i * 3]     = (Math.random() - 0.5) * BOUNDS * 2;
      pPos[i * 3 + 1] = 1 + Math.random() * 22;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * BOUNDS * 2;
      // Diagonal drift: primarily +X, slight ±Z
      pVX[i] = 0.04 + Math.random() * 0.03;
      pVZ[i] = (Math.random() - 0.45) * 0.018;
    }

    const partGeo = new THREE.BufferGeometry();
    const partPosAttr = new THREE.BufferAttribute(pPos, 3);
    partGeo.setAttribute('position', partPosAttr);

    const partMat = new THREE.PointsMaterial({
      color: 0x4a7a98,
      size: 0.3,
      transparent: true,
      opacity: 0.26,
    });
    scene.add(new THREE.Points(partGeo, partMat));

    // ─── MOUSE PARALLAX ───────────────────────────────────────────────────────
    let mNX = 0, mNY = 0, cTX = 0, cTY = 0;
    const onMouseMove = (e: MouseEvent) => {
      mNX = ((e.clientX / window.innerWidth) * 2 - 1) * 0.45;
      mNY = ((e.clientY / window.innerHeight) * 2 - 1) * 0.22;
    };
    window.addEventListener('mousemove', onMouseMove);

    // ─── RESIZE ───────────────────────────────────────────────────────────────
    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', onResize);

    // ─── ANIMATION LOOP ───────────────────────────────────────────────────────
    const clock = new THREE.Clock();
    let rafId: number;

    // Water oscillation constants
    const WATER_BASE_Y   = 0.8;  // resting level
    const WATER_AMP      = 2.4;  // ± rise/fall from base
    const WATER_PERIOD   = 10;   // seconds for one full cycle

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // — Camera: mouse parallax + very slow autonomous drift —
      cTX += (mNX - cTX) * 0.035;
      cTY += (mNY - cTY) * 0.035;
      camera.position.x = cTX * 3.5 + Math.sin(t * 0.05) * 1.2;
      camera.position.y = 24 + cTY * 2 + Math.sin(t * 0.08) * 0.4;
      camera.lookAt(0, 1, -6);

      // — Water level: gentle 10-second sine oscillation —
      const waterCycle = Math.sin((t / WATER_PERIOD) * Math.PI * 2);
      waterPlane.position.y = WATER_BASE_Y + waterCycle * WATER_AMP;
      waterMat.opacity = 0.13 + waterCycle * 0.04; // 0.09 … 0.17

      // — Beacon pulses —
      beacons.forEach((b) => {
        const pulse = 0.7 + 0.3 * Math.sin(t * 2.0 + b.phaseOffset);
        const rs = 1 + 2.2 * (Math.sin(t * 1.6 + b.phaseOffset) * 0.5 + 0.5);
        b.ring.scale.setScalar(rs);
        (b.ring.material as THREE.MeshBasicMaterial).opacity = 0.55 / rs;
        b.light.intensity = 1.0 * pulse;
      });

      // — Arc draw/fade cycle —
      if (arcLastSpawn < 0) arcLastSpawn = t;
      const arcElapsed = t - arcLastSpawn;

      if (arcPhase === 'draw') {
        arcProgress = Math.min(1, arcElapsed / (ARC_CYCLE * ARC_DRAW_FRAC));
        if (arcProgress >= 1) arcPhase = 'fade';
      } else {
        arcAlpha = Math.max(
          0,
          1 - (arcElapsed - ARC_CYCLE * ARC_DRAW_FRAC) / (ARC_CYCLE * 0.35)
        );
        if (arcAlpha <= 0) advanceArc(t);
      }

      arcMat.opacity = arcAlpha;
      const drawn = arcPhase === 'draw' ? arcProgress : 1;
      const posArr = buildArcPos(arcFrom, arcTo, drawn);
      arcGeo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
      arcGeo.attributes.position.needsUpdate = true;

      // — Wind particles: diagonal drift with wrap-around —
      for (let i = 0; i < P_COUNT; i++) {
        let px = partPosAttr.getX(i) + pVX[i];
        let py = partPosAttr.getY(i) + Math.sin(t * 0.6 + i) * 0.003;
        let pz = partPosAttr.getZ(i) + pVZ[i];

        if (px >  BOUNDS) px = -BOUNDS;
        if (pz >  BOUNDS) pz = -BOUNDS;
        if (pz < -BOUNDS) pz =  BOUNDS;

        partPosAttr.setXYZ(i, px, py, pz);
      }
      partPosAttr.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // ─── CLEANUP ──────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      if (container && renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 z-0 overflow-hidden"
      style={{
        // Radial vignette — edges fade to page background, center stays clear for text
        maskImage:
          'radial-gradient(ellipse 95% 85% at 50% 50%, rgba(0,0,0,1) 25%, rgba(0,0,0,0.65) 60%, rgba(0,0,0,0) 100%)',
        WebkitMaskImage:
          'radial-gradient(ellipse 95% 85% at 50% 50%, rgba(0,0,0,1) 25%, rgba(0,0,0,0.65) 60%, rgba(0,0,0,0) 100%)',
      }}
    />
  );
};
