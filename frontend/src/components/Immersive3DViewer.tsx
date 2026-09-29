'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Monument, MonumentFeature } from '@/data/monuments';
import { CompassIcon, MapPinIcon, SparklesIcon, FlameIcon } from '@/components/Icons';

interface Immersive3DViewerProps {
  monument: Monument;
  selectedFeature: MonumentFeature | null;
  onSelectFeature: (feature: MonumentFeature) => void;
  activeCategoryMode: 'all' | 'Architecture' | 'History' | 'MustSee';
  isVirtualWalk: boolean;
  onVirtualWalkStepChange?: (stepIdx: number) => void;
}

export default function Immersive3DViewer({
  monument,
  selectedFeature,
  onSelectFeature,
  activeCategoryMode,
  isVirtualWalk,
  onVirtualWalkStepChange
}: Immersive3DViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [providerMode, setProviderMode] = useState<'free_3d' | 'google_3d' | 'geoapify_fallback'>('free_3d');
  const [isExplodedView, setIsExplodedView] = useState(false);
  const [webglError, setWebglError] = useState(false);

  // Filter features based on mode
  const filteredFeatures = monument.features.filter((f) => {
    if (activeCategoryMode === 'MustSee') return !!f.isMustSee;
    if (activeCategoryMode === 'Architecture') return f.category === 'Architecture';
    if (activeCategoryMode === 'History') return f.category === 'History';
    return true;
  });

  const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!mountRef.current) return;

    let renderer: THREE.WebGLRenderer;
    let animationFrameId: number;

    try {
      const width = mountRef.current.clientWidth || 800;
      const height = mountRef.current.clientHeight || 520;

      // 1. Scene & Dark High-Contrast Studio Environment
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x07090e); // Deep slate contrast background
      scene.fog = new THREE.FogExp2(0x07090e, 0.012);

      // 2. Camera Setup
      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
      camera.position.set(0, 14, 26);
      camera.lookAt(0, 3, 0);

      // 3. High-Performance Renderer
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.25;

      mountRef.current.innerHTML = '';
      mountRef.current.appendChild(renderer.domElement);

      // 4. High-Contrast Studio Lighting System (Porsche Showroom Style)
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
      scene.add(ambientLight);

      // Main Sun Key Light
      const keyLight = new THREE.DirectionalLight(0xfff5ea, 2.2);
      keyLight.position.set(25, 45, 20);
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.width = 2048;
      keyLight.shadow.mapSize.height = 2048;
      keyLight.shadow.bias = -0.0001;
      scene.add(keyLight);

      // Cyan Tech Rim Light (Adds high-contrast blue edge highlights)
      const cyanRim = new THREE.DirectionalLight(0x38bdf8, 1.8);
      cyanRim.position.set(-25, 15, -25);
      scene.add(cyanRim);

      // Amber Gold Accent Light (Underneath/side glow)
      const goldAccent = new THREE.SpotLight(0xf59e0b, 3.5, 50, Math.PI / 4, 0.5);
      goldAccent.position.set(0, 2, 18);
      scene.add(goldAccent);

      // 5. Dark Glossy Showroom Grid Floor
      const floorRadius = 18;
      const floorGeo = new THREE.CylinderGeometry(floorRadius, floorRadius + 1, 0.8, 64);
      const floorMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.25,
        metalness: 0.8,
      });
      const floor = new THREE.Mesh(floorGeo, floorMat);
      floor.position.y = -0.4;
      floor.receiveShadow = true;
      scene.add(floor);

      // Circular Glowing Tech Grid Rings
      const ringGeo1 = new THREE.RingGeometry(17.8, 18.0, 64);
      const ringMat1 = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
      const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
      ring1.rotation.x = Math.PI / 2;
      ring1.position.y = 0.02;
      scene.add(ring1);

      const gridHelper = new THREE.GridHelper(34, 34, 0xf59e0b, 0x1e293b);
      gridHelper.position.y = 0.01;
      scene.add(gridHelper);

      // 6. BUILD HIGH-REALISM PROCEDURAL MONUMENT 3D MODELS
      const monumentGroup = new THREE.Group();
      scene.add(monumentGroup);

      // References for Exploded View Animations
      const explodedParts: { mesh: THREE.Object3D; origY: number; targetOffset: number; featureId?: string }[] = [];

      // Color Palette Materials
      const redSandstoneMat = new THREE.MeshStandardMaterial({ color: 0x8b1a1a, roughness: 0.65, metalness: 0.15 }); // Red Fort Sandstone
      const darkSandstoneMat = new THREE.MeshStandardMaterial({ color: 0x6b1111, roughness: 0.7, metalness: 0.1 });
      const whiteMarbleMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2, metalness: 0.1 }); // Pure Marble Chhatris
      const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.1 });
      const metallicDarkMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.85, roughness: 0.2 });

      if (monument.id === 'red-fort' || monument.cityName === 'Delhi') {
        // ==========================================
        // REALISTIC LAHORI GATE & RED FORT 3D LAYOUT
        // ==========================================

        // Main Rampart Platform Base
        const rampartGeo = new THREE.BoxGeometry(16, 2, 10);
        const rampartMesh = new THREE.Mesh(rampartGeo, redSandstoneMat);
        rampartMesh.position.set(0, 1, 0);
        rampartMesh.castShadow = true;
        rampartMesh.receiveShadow = true;
        monumentGroup.add(rampartMesh);

        // Central Lahori Gatehouse Block
        const gatehouseGeo = new THREE.BoxGeometry(7, 4.5, 6);
        const gatehouseMesh = new THREE.Mesh(gatehouseGeo, darkSandstoneMat);
        gatehouseMesh.position.set(0, 4.25, 0);
        gatehouseMesh.castShadow = true;
        monumentGroup.add(gatehouseMesh);
        explodedParts.push({ mesh: gatehouseMesh, origY: 4.25, targetOffset: 1.5, featureId: 'lahori-gate' });

        // Central Recessed Mughal Arched Gateway Portal (White Marble Contrast)
        const archPortalGeo = new THREE.BoxGeometry(3.2, 3.2, 6.2);
        const archPortalMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });
        const archPortal = new THREE.Mesh(archPortalGeo, archPortalMat);
        archPortal.position.set(0, 3.2, 0);
        monumentGroup.add(archPortal);

        const archFrameGeo = new THREE.BoxGeometry(3.6, 3.6, 0.4);
        const archFrame = new THREE.Mesh(archFrameGeo, whiteMarbleMat);
        archFrame.position.set(0, 3.4, 3.1);
        monumentGroup.add(archFrame);

        // Twin Octagonal Flanking Towers (Lahori Gate Towers)
        [-4.2, 4.2].forEach((xPos) => {
          const towerGeo = new THREE.CylinderGeometry(1.6, 1.8, 6.5, 8);
          const towerMesh = new THREE.Mesh(towerGeo, redSandstoneMat);
          towerMesh.position.set(xPos, 4.25, 0);
          towerMesh.castShadow = true;
          monumentGroup.add(towerMesh);
          explodedParts.push({ mesh: towerMesh, origY: 4.25, targetOffset: 1.2, featureId: 'lahori-gate' });

          // Tower White Marble Chhatris (Miniature Domes)
          const chhatriGeo = new THREE.SphereGeometry(1.1, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
          const chhatriMesh = new THREE.Mesh(chhatriGeo, whiteMarbleMat);
          chhatriMesh.position.set(xPos, 7.8, 0);
          chhatriMesh.castShadow = true;
          monumentGroup.add(chhatriMesh);
          explodedParts.push({ mesh: chhatriMesh, origY: 7.8, targetOffset: 3.0, featureId: 'lahori-gate' });
        });

        // 7 Parapet White Marble Chhatris (Line of miniature cupolas across roof)
        for (let i = -3; i <= 3; i++) {
          const miniChhatriGeo = new THREE.SphereGeometry(0.55, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2);
          const miniChhatri = new THREE.Mesh(miniChhatriGeo, whiteMarbleMat);
          miniChhatri.position.set(i * 1.0, 6.6, 3.0);
          monumentGroup.add(miniChhatri);
          explodedParts.push({ mesh: miniChhatri, origY: 6.6, targetOffset: 2.2, featureId: 'lahori-gate' });
        }

        // Diwan-i-Am (Hall of Public Audience - Red Sandstone Pillared Pavilion)
        const diwanAmGroup = new THREE.Group();
        diwanAmGroup.position.set(0, 1.0, -7.5);

        const diwanAmRoof = new THREE.Mesh(new THREE.BoxGeometry(9, 0.6, 5), redSandstoneMat);
        diwanAmRoof.position.y = 3.0;
        diwanAmGroup.add(diwanAmRoof);

        for (let px = -3.8; px <= 3.8; px += 1.9) {
          for (let pz = -1.8; pz <= 1.8; pz += 1.8) {
            const col = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 3, 8), redSandstoneMat);
            col.position.set(px, 1.5, pz);
            diwanAmGroup.add(col);
          }
        }
        monumentGroup.add(diwanAmGroup);
        explodedParts.push({ mesh: diwanAmGroup, origY: 1.0, targetOffset: 2.5, featureId: 'diwan-i-am' });

        // Diwan-i-Khas (Hall of Private Audience - Pure White Marble Pavilion)
        const diwanKhasGroup = new THREE.Group();
        diwanKhasGroup.position.set(8.5, 1.0, -4.0);

        const diwanKhasRoof = new THREE.Mesh(new THREE.BoxGeometry(5.5, 0.5, 4.5), whiteMarbleMat);
        diwanKhasRoof.position.y = 2.8;
        diwanKhasGroup.add(diwanKhasRoof);

        const khasChhatri = new THREE.Mesh(new THREE.SphereGeometry(0.9, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), whiteMarbleMat);
        khasChhatri.position.set(0, 3.5, 0);
        diwanKhasGroup.add(khasChhatri);

        monumentGroup.add(diwanKhasGroup);
        explodedParts.push({ mesh: diwanKhasGroup, origY: 1.0, targetOffset: 2.8, featureId: 'diwan-i-khas' });

      } else if (monument.id === 'qutub-minar') {
        // ==========================================
        // REALISTIC QUTUB MINAR 5-TIER TAPERED TOWER
        // ==========================================

        const minarGroup = new THREE.Group();
        const storeyHeights = [3.5, 3.0, 2.5, 2.0, 1.8];
        const radii = [2.2, 1.8, 1.5, 1.2, 0.9, 0.6];
        let currentY = 0;

        for (let s = 0; s < 5; s++) {
          const h = storeyHeights[s];
          const mat = s >= 3 ? whiteMarbleMat : redSandstoneMat;
          const cylGeo = new THREE.CylinderGeometry(radii[s + 1], radii[s], h, 24);
          const storeyMesh = new THREE.Mesh(cylGeo, mat);
          storeyMesh.position.y = currentY + h / 2;
          storeyMesh.castShadow = true;
          minarGroup.add(storeyMesh);

          // Balcony overhang ring
          const balconyGeo = new THREE.CylinderGeometry(radii[s] + 0.3, radii[s] + 0.3, 0.3, 24);
          const balconyMesh = new THREE.Mesh(balconyGeo, goldMat);
          balconyMesh.position.y = currentY + h;
          minarGroup.add(balconyMesh);

          currentY += h;
        }

        minarGroup.position.set(-2, 0, 0);
        monumentGroup.add(minarGroup);
        explodedParts.push({ mesh: minarGroup, origY: 0, targetOffset: 1.5, featureId: 'minaret-column' });

        // Rustless Iron Pillar of Delhi
        const pillarGeo = new THREE.CylinderGeometry(0.2, 0.25, 5, 16);
        const pillarMesh = new THREE.Mesh(pillarGeo, metallicDarkMat);
        pillarMesh.position.set(4, 2.5, 3);
        monumentGroup.add(pillarMesh);
        explodedParts.push({ mesh: pillarMesh, origY: 2.5, targetOffset: 2.0, featureId: 'iron-pillar' });

      } else {
        // Generic High-Contrast Landmark Structure (Tower Bridge / Eiffel / Louvre / Humayun)
        const landmarkGroup = new THREE.Group();

        const baseGeo = new THREE.BoxGeometry(10, 3, 8);
        const baseMesh = new THREE.Mesh(baseGeo, redSandstoneMat);
        baseMesh.position.y = 1.5;
        landmarkGroup.add(baseMesh);

        const domeGeo = new THREE.SphereGeometry(3.0, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const domeMesh = new THREE.Mesh(domeGeo, whiteMarbleMat);
        domeMesh.position.y = 3.0;
        landmarkGroup.add(domeMesh);

        monumentGroup.add(landmarkGroup);
        explodedParts.push({ mesh: landmarkGroup, origY: 0, targetOffset: 2.0 });
      }

      // 7. HOTSPOTS & FLOATING 3D CALLOUT LINES (Porsche Explorer Style)
      const hotspotGroup = new THREE.Group();
      scene.add(hotspotGroup);

      const feature3DPositions = new Map<string, THREE.Vector3>();

      filteredFeatures.forEach((feat, idx) => {
        let pos = new THREE.Vector3();
        if (feat.id === 'lahori-gate') pos.set(0, 5.0, 3.5);
        else if (feat.id === 'diwan-i-am') pos.set(0, 3.0, -7.5);
        else if (feat.id === 'diwan-i-khas') pos.set(8.5, 3.0, -4.0);
        else if (feat.id === 'moti-masjid') pos.set(4.0, 4.0, -2.0);
        else if (feat.id === 'minaret-column') pos.set(-2, 11.0, 0);
        else if (feat.id === 'iron-pillar') pos.set(4, 4.0, 3);
        else {
          const angle = (idx / Math.max(1, filteredFeatures.length)) * Math.PI * 2;
          pos.set(Math.cos(angle) * 7, 4.0, Math.sin(angle) * 7);
        }

        feature3DPositions.set(feat.id, pos);

        const isSelected = selectedFeature?.id === feat.id;

        // Glowing 3D Orb Marker
        const markerGeo = new THREE.SphereGeometry(0.55, 24, 24);
        const markerMat = new THREE.MeshStandardMaterial({
          color: isSelected ? 0xf59e0b : feat.isMustSee ? 0x10b981 : 0x38bdf8,
          emissive: isSelected ? 0xd97706 : 0x0284c7,
          emissiveIntensity: isSelected ? 1.0 : 0.6,
          roughness: 0.1
        });
        const marker = new THREE.Mesh(markerGeo, markerMat);
        marker.position.copy(pos);
        marker.userData = { featureId: feat.id, feature: feat };
        hotspotGroup.add(marker);

        // Leader Line connecting marker down to base
        const points = [pos.clone(), new THREE.Vector3(pos.x, 0.1, pos.z)];
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
        const lineMat = new THREE.LineDashedMaterial({ color: isSelected ? 0xf59e0b : 0x38bdf8, dashSize: 0.3, gapSize: 0.2 });
        const line = new THREE.Line(lineGeo, lineMat);
        line.computeLineDistances();
        hotspotGroup.add(line);
      });

      // 8. INTERACTIVE ORBIT CONTROLS
      let isDragging = false;
      let previousMousePosition = { x: 0, y: 0 };
      let targetRotationY = 0.4;
      let targetRotationX = 0.35;

      const onMouseDown = (e: MouseEvent) => {
        isDragging = true;
        previousMousePosition = { x: e.clientX, y: e.clientY };
      };

      const onMouseMove = (e: MouseEvent) => {
        if (!isDragging) return;
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;

        targetRotationY += deltaX * 0.007;
        targetRotationX += deltaY * 0.007;
        targetRotationX = Math.max(0.1, Math.min(Math.PI / 3, targetRotationX));

        previousMousePosition = { x: e.clientX, y: e.clientY };
      };

      const onMouseUp = () => {
        isDragging = false;
      };

      const domEl = mountRef.current;
      domEl.addEventListener('mousedown', onMouseDown);
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);

      const handleResize = () => {
        if (!mountRef.current) return;
        const w = mountRef.current.clientWidth;
        const h = mountRef.current.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener('resize', handleResize);

      // 9. ANIMATION LOOP & EXPLODED VIEW MOTION
      let clock = new THREE.Clock();

      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();

        if (!isDragging && !selectedFeature) {
          targetRotationY += 0.0015;
        }

        // Camera Orbit Math
        const distance = 24;
        camera.position.x = Math.sin(targetRotationY) * Math.cos(targetRotationX) * distance;
        camera.position.z = Math.cos(targetRotationY) * Math.cos(targetRotationX) * distance;
        camera.position.y = Math.sin(targetRotationX) * distance + 3;
        camera.lookAt(0, 3, 0);

        // Exploded View Interpolation (Smooth component separation)
        explodedParts.forEach((part) => {
          const shouldExplode = isExplodedView || (selectedFeature && part.featureId === selectedFeature.id);
          const targetY = shouldExplode ? part.origY + part.targetOffset : part.origY;
          part.mesh.position.y += (targetY - part.mesh.position.y) * 0.08;
        });

        // Pulsing Hotspot Animations
        hotspotGroup.children.forEach((child) => {
          if (child instanceof THREE.Mesh) {
            const scale = 1 + Math.sin(elapsedTime * 4) * 0.12;
            child.scale.set(scale, scale, scale);
          }
        });

        renderer.render(scene, camera);
      };

      animate();

      return () => {
        cancelAnimationFrame(animationFrameId);
        domEl.removeEventListener('mousedown', onMouseDown);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
        window.removeEventListener('resize', handleResize);
        if (renderer && renderer.domElement) {
          renderer.dispose();
        }
      };
    } catch (err) {
      console.warn('WebGL Context Warning:', err);
      setWebglError(true);
      setProviderMode('geoapify_fallback');
    }
  }, [monument.id, filteredFeatures.length, selectedFeature?.id, isExplodedView]);

  // Virtual Walk Steps Auto-Transition
  useEffect(() => {
    if (isVirtualWalk && filteredFeatures.length > 0) {
      let stepIdx = 0;
      const interval = setInterval(() => {
        onSelectFeature(filteredFeatures[stepIdx % filteredFeatures.length]);
        if (onVirtualWalkStepChange) onVirtualWalkStepChange(stepIdx % filteredFeatures.length);
        stepIdx++;
      }, 4500);
      return () => clearInterval(interval);
    }
  }, [isVirtualWalk, filteredFeatures.length]);

  return (
    <div className="relative w-full h-[520px] sm:h-[580px] rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl group">
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Left Status & Mode Header */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2">
        <div className="px-3.5 py-1.5 rounded-full bg-slate-900/90 backdrop-blur-md border border-slate-700/80 text-white text-[11px] font-extrabold flex items-center gap-2 shadow-lg">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>TripWise Architectural 3D Studio</span>
        </div>

        {/* Exploded Component View Toggle (Porsche Style) */}
        <button
          onClick={() => setIsExplodedView(!isExplodedView)}
          className={`px-3 py-1.5 rounded-full text-[11px] font-extrabold transition-all flex items-center gap-1.5 shadow-lg ${
            isExplodedView
              ? 'bg-amber-500 text-slate-950 scale-105 shadow-amber-500/30'
              : 'bg-slate-900/90 text-amber-300 border border-amber-500/40 hover:bg-slate-800'
          }`}
        >
          <span>💥</span>
          <span>{isExplodedView ? 'Exploded View Active' : 'Explode Components'}</span>
        </button>
      </div>

      {/* Top Right Studio Orbit Tips */}
      <div className="absolute top-4 right-4 z-20 hidden sm:flex items-center gap-2">
        <div className="px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-slate-300 text-[10px] font-semibold">
          🖱️ Rotate 360° • Scroll Zoom
        </div>
      </div>

      {/* Floating 3D Pointer Hotspot Callout Bar (Porsche Car Callout Style) */}
      <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-center gap-2 overflow-x-auto py-2.5 px-4 bg-slate-950/90 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl scrollbar-none">
        <span className="text-[10px] uppercase font-black tracking-wider text-amber-400 shrink-0 flex items-center gap-1">
          <span>📍</span> STRUCTURAL COMPONENTS:
        </span>
        {filteredFeatures.map((feat) => {
          const isSelected = selectedFeature?.id === feat.id;
          return (
            <button
              key={feat.id}
              onClick={() => onSelectFeature(feat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 shrink-0 ${
                isSelected
                  ? 'bg-amber-500 text-slate-950 shadow-lg scale-105 font-black ring-2 ring-amber-300'
                  : 'bg-slate-900 text-slate-200 border border-slate-700/80 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span>{feat.category === 'Architecture' ? '🏛️' : feat.category === 'History' ? '📜' : '✨'}</span>
              <span>{feat.name}</span>
              {feat.isMustSee && <span className="text-[9px] text-emerald-400 font-black">⭐ MUST SEE</span>}
            </button>
          );
        })}
      </div>

      {/* WebGL Fallback Notification */}
      {webglError && (
        <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center text-white space-y-3">
          <MapPinIcon size={36} className="text-amber-400" />
          <h4 className="text-lg font-bold">Immersive View Fallback</h4>
          <p className="text-xs text-slate-300 max-w-md">
            WebGL 3D acceleration is limited on this device. Displaying interactive destination coordinates map.
          </p>
        </div>
      )}
    </div>
  );
}
