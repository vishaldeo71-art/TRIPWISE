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
  const [hoveredFeatureName, setHoveredFeatureName] = useState<string | null>(null);

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
      scene.background = new THREE.Color(0x07090e);
      scene.fog = new THREE.FogExp2(0x07090e, 0.01);

      // 2. Camera Setup
      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
      camera.position.set(0, 15, 28);
      camera.lookAt(0, 3.5, 0);

      // 3. Renderer
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.3;

      mountRef.current.innerHTML = '';
      mountRef.current.appendChild(renderer.domElement);

      // 4. High-Contrast Studio Lighting System
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
      scene.add(ambientLight);

      // Main Sun Key Light
      const keyLight = new THREE.DirectionalLight(0xfffaed, 2.3);
      keyLight.position.set(25, 45, 20);
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.width = 2048;
      keyLight.shadow.mapSize.height = 2048;
      scene.add(keyLight);

      // Cyan Tech Rim Light
      const cyanRim = new THREE.DirectionalLight(0x38bdf8, 1.8);
      cyanRim.position.set(-25, 15, -25);
      scene.add(cyanRim);

      // Amber Gold Accent Spot Light
      const goldAccent = new THREE.SpotLight(0xf59e0b, 4.0, 55, Math.PI / 4, 0.5);
      goldAccent.position.set(0, 2, 20);
      scene.add(goldAccent);

      // 5. Dark Glossy Showroom Grid Floor
      const floorRadius = 20;
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

      // Tech Grid Rings
      const ringGeo1 = new THREE.RingGeometry(19.8, 20.0, 64);
      const ringMat1 = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
      const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
      ring1.rotation.x = Math.PI / 2;
      ring1.position.y = 0.02;
      scene.add(ring1);

      const gridHelper = new THREE.GridHelper(36, 36, 0xf59e0b, 0x1e293b);
      gridHelper.position.y = 0.01;
      scene.add(gridHelper);

      // 6. BUILD AUTHENTIC PROCEDURAL 3D ARCHITECTURE
      const monumentGroup = new THREE.Group();
      scene.add(monumentGroup);

      const raycastTargets: THREE.Object3D[] = [];
      const explodedParts: { mesh: THREE.Object3D; origY: number; targetOffset: number; featureId?: string }[] = [];

      // Color Materials
      const redSandstoneMat = new THREE.MeshStandardMaterial({ color: 0x8b1a1a, roughness: 0.65, metalness: 0.15 });
      const darkSandstoneMat = new THREE.MeshStandardMaterial({ color: 0x6b1111, roughness: 0.7, metalness: 0.1 });
      const whiteMarbleMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2, metalness: 0.1 });
      const grassMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8, metalness: 0.1 }); // Grassy Ramparts
      const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.1 });
      const metallicDarkMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.85, roughness: 0.2 });

      if (monument.id === 'red-fort' || monument.cityName === 'Delhi') {
        // =========================================================
        // AUTHENTIC LAHORI GATE MODEL MATCHING THE USER'S PHOTO
        // =========================================================

        const lahoriGateGroup = new THREE.Group();
        lahoriGateGroup.userData = { featureId: 'lahori-gate', featureName: 'Lahori Gate' };

        // 1. Long Fortified Side Walls (Matching the photo's red sandstone ramparts)
        [-13, 13].forEach((xPos) => {
          const sideWallGeo = new THREE.BoxGeometry(10, 5, 4);
          const sideWall = new THREE.Mesh(sideWallGeo, redSandstoneMat);
          sideWall.position.set(xPos, 2.5, -2);
          sideWall.castShadow = true;
          sideWall.userData = { featureId: 'lahori-gate' };
          lahoriGateGroup.add(sideWall);
          raycastTargets.push(sideWall);
        });

        // 2. Slanted Green Grassy Rampart Embankments (Matching photo green slope)
        [-7.5, 7.5].forEach((xPos) => {
          const grassSlopeGeo = new THREE.PrismGeometry ? new THREE.BoxGeometry(4.5, 3.5, 6) : new THREE.BoxGeometry(4.5, 3.5, 6);
          const grassSlope = new THREE.Mesh(grassSlopeGeo, grassMat);
          grassSlope.position.set(xPos, 1.75, 2);
          grassSlope.rotation.x = -0.25;
          grassSlope.userData = { featureId: 'lahori-gate' };
          lahoriGateGroup.add(grassSlope);
          raycastTargets.push(grassSlope);
        });

        // 3. Central Lahori Main Gatehouse Block
        const gatehouseGeo = new THREE.BoxGeometry(8.5, 6.0, 5.5);
        const gatehouseMesh = new THREE.Mesh(gatehouseGeo, darkSandstoneMat);
        gatehouseMesh.position.set(0, 5.0, 0);
        gatehouseMesh.castShadow = true;
        gatehouseMesh.userData = { featureId: 'lahori-gate' };
        lahoriGateGroup.add(gatehouseMesh);
        raycastTargets.push(gatehouseMesh);
        explodedParts.push({ mesh: gatehouseMesh, origY: 5.0, targetOffset: 1.5, featureId: 'lahori-gate' });

        // 4. Pointed Mughal Archway Entrance Portal (Matching photo entrance vault)
        const archPortalGeo = new THREE.BoxGeometry(3.6, 4.2, 5.8);
        const archPortalMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });
        const archPortal = new THREE.Mesh(archPortalGeo, archPortalMat);
        archPortal.position.set(0, 3.8, 0);
        archPortal.userData = { featureId: 'lahori-gate' };
        lahoriGateGroup.add(archPortal);
        raycastTargets.push(archPortal);

        // White Marble Arch Frame Trim
        const archFrameGeo = new THREE.BoxGeometry(4.2, 4.5, 0.4);
        const archFrame = new THREE.Mesh(archFrameGeo, whiteMarbleMat);
        archFrame.position.set(0, 4.0, 2.9);
        archFrame.userData = { featureId: 'lahori-gate' };
        lahoriGateGroup.add(archFrame);
        raycastTargets.push(archFrame);

        // 5. Twin Octagonal Flanking Towers (Matching photo octagonal towers)
        [-5.0, 5.0].forEach((xPos) => {
          const towerGeo = new THREE.CylinderGeometry(1.9, 2.1, 8.5, 8);
          const towerMesh = new THREE.Mesh(towerGeo, redSandstoneMat);
          towerMesh.position.set(xPos, 5.25, 0);
          towerMesh.castShadow = true;
          towerMesh.userData = { featureId: 'lahori-gate' };
          lahoriGateGroup.add(towerMesh);
          raycastTargets.push(towerMesh);
          explodedParts.push({ mesh: towerMesh, origY: 5.25, targetOffset: 1.2, featureId: 'lahori-gate' });

          // Tower Top White Marble Chhatri Pavilions (Matching photo corner domed pavilions)
          const chhatriGeo = new THREE.SphereGeometry(1.3, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
          const chhatriMesh = new THREE.Mesh(chhatriGeo, whiteMarbleMat);
          chhatriMesh.position.set(xPos, 9.8, 0);
          chhatriMesh.castShadow = true;
          chhatriMesh.userData = { featureId: 'lahori-gate' };
          lahoriGateGroup.add(chhatriMesh);
          raycastTargets.push(chhatriMesh);
          explodedParts.push({ mesh: chhatriMesh, origY: 9.8, targetOffset: 3.0, featureId: 'lahori-gate' });

          // Slender Minaret Spire Pillars
          const spireGeo = new THREE.CylinderGeometry(0.15, 0.2, 2.5, 8);
          const spireMesh = new THREE.Mesh(spireGeo, redSandstoneMat);
          spireMesh.position.set(xPos, 11.2, 0);
          lahoriGateGroup.add(spireMesh);
        });

        // 6. Arcade Gallery with 7 White Marble Cupolas / Chhatris (Matching photo roof line)
        for (let i = -3; i <= 3; i++) {
          const miniChhatriGeo = new THREE.SphereGeometry(0.6, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2);
          const miniChhatri = new THREE.Mesh(miniChhatriGeo, whiteMarbleMat);
          miniChhatri.position.set(i * 1.1, 8.3, 2.6);
          miniChhatri.userData = { featureId: 'lahori-gate' };
          lahoriGateGroup.add(miniChhatri);
          raycastTargets.push(miniChhatri);
          explodedParts.push({ mesh: miniChhatri, origY: 8.3, targetOffset: 2.2, featureId: 'lahori-gate' });
        }

        // 7. Flag Pole (Matching photo national flag on top)
        const flagPoleGeo = new THREE.CylinderGeometry(0.08, 0.08, 3.5, 8);
        const flagPole = new THREE.Mesh(flagPoleGeo, metallicDarkMat);
        flagPole.position.set(0, 10.0, 0);
        lahoriGateGroup.add(flagPole);

        const flagGeo = new THREE.BoxGeometry(1.2, 0.7, 0.05);
        const flagMat = new THREE.MeshStandardMaterial({ color: 0xf97316 }); // Tricolor Saffron
        const flag = new THREE.Mesh(flagGeo, flagMat);
        flag.position.set(0.6, 11.2, 0);
        lahoriGateGroup.add(flag);

        monumentGroup.add(lahoriGateGroup);

        // Diwan-i-Am (Hall of Public Audience)
        const diwanAmGroup = new THREE.Group();
        diwanAmGroup.position.set(0, 1.0, -9.5);
        diwanAmGroup.userData = { featureId: 'diwan-i-am', featureName: 'Diwan-i-Am' };

        const diwanAmRoof = new THREE.Mesh(new THREE.BoxGeometry(10, 0.7, 6), redSandstoneMat);
        diwanAmRoof.position.y = 3.2;
        diwanAmRoof.userData = { featureId: 'diwan-i-am' };
        diwanAmGroup.add(diwanAmRoof);
        raycastTargets.push(diwanAmRoof);

        for (let px = -4.2; px <= 4.2; px += 2.1) {
          for (let pz = -2.2; pz <= 2.2; pz += 2.2) {
            const col = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 3.2, 8), redSandstoneMat);
            col.position.set(px, 1.6, pz);
            col.userData = { featureId: 'diwan-i-am' };
            diwanAmGroup.add(col);
            raycastTargets.push(col);
          }
        }
        monumentGroup.add(diwanAmGroup);
        explodedParts.push({ mesh: diwanAmGroup, origY: 1.0, targetOffset: 2.5, featureId: 'diwan-i-am' });

        // Diwan-i-Khas (Hall of Private Audience - Pure White Marble)
        const diwanKhasGroup = new THREE.Group();
        diwanKhasGroup.position.set(10.0, 1.0, -5.0);
        diwanKhasGroup.userData = { featureId: 'diwan-i-khas', featureName: 'Diwan-i-Khas' };

        const diwanKhasRoof = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.6, 5.0), whiteMarbleMat);
        diwanKhasRoof.position.y = 3.0;
        diwanKhasRoof.userData = { featureId: 'diwan-i-khas' };
        diwanKhasGroup.add(diwanKhasRoof);
        raycastTargets.push(diwanKhasRoof);

        const khasChhatri = new THREE.Mesh(new THREE.SphereGeometry(1.1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), whiteMarbleMat);
        khasChhatri.position.set(0, 3.8, 0);
        khasChhatri.userData = { featureId: 'diwan-i-khas' };
        diwanKhasGroup.add(khasChhatri);
        raycastTargets.push(khasChhatri);

        monumentGroup.add(diwanKhasGroup);
        explodedParts.push({ mesh: diwanKhasGroup, origY: 1.0, targetOffset: 2.8, featureId: 'diwan-i-khas' });

      } else if (monument.id === 'qutub-minar') {
        const minarGroup = new THREE.Group();
        minarGroup.userData = { featureId: 'minaret-column', featureName: 'Qutub Minar Victory Tower' };
        const storeyHeights = [4.0, 3.5, 3.0, 2.5, 2.0];
        const radii = [2.4, 2.0, 1.6, 1.3, 1.0, 0.7];
        let currentY = 0;

        for (let s = 0; s < 5; s++) {
          const h = storeyHeights[s];
          const mat = s >= 3 ? whiteMarbleMat : redSandstoneMat;
          const cylGeo = new THREE.CylinderGeometry(radii[s + 1], radii[s], h, 24);
          const storeyMesh = new THREE.Mesh(cylGeo, mat);
          storeyMesh.position.y = currentY + h / 2;
          storeyMesh.userData = { featureId: 'minaret-column' };
          minarGroup.add(storeyMesh);
          raycastTargets.push(storeyMesh);

          const balconyGeo = new THREE.CylinderGeometry(radii[s] + 0.35, radii[s] + 0.35, 0.35, 24);
          const balconyMesh = new THREE.Mesh(balconyGeo, goldMat);
          balconyMesh.position.y = currentY + h;
          balconyMesh.userData = { featureId: 'minaret-column' };
          minarGroup.add(balconyMesh);
          raycastTargets.push(balconyMesh);

          currentY += h;
        }

        minarGroup.position.set(-2, 0, 0);
        monumentGroup.add(minarGroup);
        explodedParts.push({ mesh: minarGroup, origY: 0, targetOffset: 1.5, featureId: 'minaret-column' });

        // Rustless Iron Pillar
        const pillarGeo = new THREE.CylinderGeometry(0.22, 0.28, 5.5, 16);
        const pillarMesh = new THREE.Mesh(pillarGeo, metallicDarkMat);
        pillarMesh.position.set(5, 2.75, 3);
        pillarMesh.userData = { featureId: 'iron-pillar', featureName: 'Rustless Iron Pillar' };
        monumentGroup.add(pillarMesh);
        raycastTargets.push(pillarMesh);
        explodedParts.push({ mesh: pillarMesh, origY: 2.75, targetOffset: 2.0, featureId: 'iron-pillar' });

      } else {
        const landmarkGroup = new THREE.Group();
        const baseGeo = new THREE.BoxGeometry(11, 3.5, 8.5);
        const baseMesh = new THREE.Mesh(baseGeo, redSandstoneMat);
        baseMesh.position.y = 1.75;
        landmarkGroup.add(baseMesh);

        const domeGeo = new THREE.SphereGeometry(3.2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const domeMesh = new THREE.Mesh(domeGeo, whiteMarbleMat);
        domeMesh.position.y = 3.5;
        landmarkGroup.add(domeMesh);

        monumentGroup.add(landmarkGroup);
        explodedParts.push({ mesh: landmarkGroup, origY: 0, targetOffset: 2.0 });
      }

      // 7. HOTSPOTS & FLOATING 3D CALLOUT MARKERS
      const hotspotGroup = new THREE.Group();
      scene.add(hotspotGroup);

      filteredFeatures.forEach((feat, idx) => {
        let pos = new THREE.Vector3();
        if (feat.id === 'lahori-gate') pos.set(0, 6.0, 4.0);
        else if (feat.id === 'diwan-i-am') pos.set(0, 4.0, -9.5);
        else if (feat.id === 'diwan-i-khas') pos.set(10.0, 4.0, -5.0);
        else if (feat.id === 'moti-masjid') pos.set(5.0, 5.0, -2.0);
        else if (feat.id === 'minaret-column') pos.set(-2, 12.0, 0);
        else if (feat.id === 'iron-pillar') pos.set(5, 4.5, 3);
        else {
          const angle = (idx / Math.max(1, filteredFeatures.length)) * Math.PI * 2;
          pos.set(Math.cos(angle) * 8, 4.5, Math.sin(angle) * 8);
        }

        const isSelected = selectedFeature?.id === feat.id;

        const markerGeo = new THREE.SphereGeometry(0.65, 24, 24);
        const markerMat = new THREE.MeshStandardMaterial({
          color: isSelected ? 0xf59e0b : feat.isMustSee ? 0x10b981 : 0x38bdf8,
          emissive: isSelected ? 0xd97706 : 0x0284c7,
          emissiveIntensity: isSelected ? 1.2 : 0.6,
          roughness: 0.1
        });
        const marker = new THREE.Mesh(markerGeo, markerMat);
        marker.position.copy(pos);
        marker.userData = { featureId: feat.id, feature: feat };
        hotspotGroup.add(marker);
        raycastTargets.push(marker);

        const points = [pos.clone(), new THREE.Vector3(pos.x, 0.1, pos.z)];
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
        const lineMat = new THREE.LineDashedMaterial({ color: isSelected ? 0xf59e0b : 0x38bdf8, dashSize: 0.3, gapSize: 0.2 });
        const line = new THREE.Line(lineGeo, lineMat);
        line.computeLineDistances();
        hotspotGroup.add(line);
      });

      // 8. THREE.JS RAYCASTER FOR DIRECT 3D MESH & HOTSPOT CLICKING (Fixes Issue 2)
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();

      const handleCanvasClick = (e: MouseEvent) => {
        if (!mountRef.current) return;
        const rect = mountRef.current.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(raycastTargets, true);

        if (intersects.length > 0) {
          let hit: THREE.Object3D | null = intersects[0].object;
          while (hit) {
            if (hit.userData && hit.userData.featureId) {
              const feat = monument.features.find((f) => f.id === hit!.userData.featureId);
              if (feat) {
                onSelectFeature(feat);
                return;
              }
            }
            hit = hit.parent;
          }
        }
      };

      const handleCanvasPointerMove = (e: MouseEvent) => {
        if (!mountRef.current) return;
        const rect = mountRef.current.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(raycastTargets, true);

        if (intersects.length > 0) {
          let hit: THREE.Object3D | null = intersects[0].object;
          while (hit) {
            if (hit.userData && hit.userData.featureId) {
              const feat = monument.features.find((f) => f.id === hit!.userData.featureId);
              if (feat) {
                setHoveredFeatureName(feat.name);
                mountRef.current.style.cursor = 'pointer';
                return;
              }
            }
            hit = hit.parent;
          }
        }
        setHoveredFeatureName(null);
        mountRef.current.style.cursor = 'grab';
      };

      // 9. INTERACTIVE ORBIT CONTROLS
      let isDragging = false;
      let previousMousePosition = { x: 0, y: 0 };
      let targetRotationY = 0.4;
      let targetRotationX = 0.35;

      const onMouseDown = (e: MouseEvent) => {
        isDragging = true;
        previousMousePosition = { x: e.clientX, y: e.clientY };
      };

      const onMouseMove = (e: MouseEvent) => {
        handleCanvasPointerMove(e);
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
      domEl.addEventListener('click', handleCanvasClick);
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

      // 10. ANIMATION LOOP & EXPLODED VIEW MOTION
      let clock = new THREE.Clock();

      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();

        if (!isDragging && !selectedFeature) {
          targetRotationY += 0.0015;
        }

        const distance = 26;
        camera.position.x = Math.sin(targetRotationY) * Math.cos(targetRotationX) * distance;
        camera.position.z = Math.cos(targetRotationY) * Math.cos(targetRotationX) * distance;
        camera.position.y = Math.sin(targetRotationX) * distance + 3.5;
        camera.lookAt(0, 3.5, 0);

        // Exploded View Interpolation
        explodedParts.forEach((part) => {
          const shouldExplode = isExplodedView || (selectedFeature && part.featureId === selectedFeature.id);
          const targetY = shouldExplode ? part.origY + part.targetOffset : part.origY;
          part.mesh.position.y += (targetY - part.mesh.position.y) * 0.08;
        });

        // Pulsing Hotspots
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
        domEl.removeEventListener('click', handleCanvasClick);
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

      {/* Top Left Status & Exploded View Toggle */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2">
        <div className="px-3.5 py-1.5 rounded-full bg-slate-900/90 backdrop-blur-md border border-slate-700/80 text-white text-[11px] font-extrabold flex items-center gap-2 shadow-lg">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>TripWise Architectural 3D Studio</span>
        </div>

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

      {/* Hover Tooltip / Hover Banner for Direct Mesh Clicking */}
      {hoveredFeatureName ? (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-full bg-amber-500 text-slate-950 text-xs font-black shadow-2xl animate-bounce flex items-center gap-1.5">
          <span>👇</span> Click to view <strong>"{hoveredFeatureName}"</strong> details!
        </div>
      ) : (
        <div className="absolute top-16 left-4 z-20 text-[10px] text-amber-300 font-bold bg-slate-900/80 px-3 py-1 rounded-full border border-amber-500/30">
          💡 Click directly on any 3D arch, dome, tower, or hotspot marker to open details!
        </div>
      )}

      {/* Top Right Studio Orbit Tips */}
      <div className="absolute top-4 right-4 z-20 hidden sm:flex items-center gap-2">
        <div className="px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-slate-300 text-[10px] font-semibold">
          🖱️ Click 3D Mesh • Rotate 360°
        </div>
      </div>

      {/* Floating 3D Callout Hotspots Bar */}
      <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-center gap-2 overflow-x-auto py-2.5 px-4 bg-slate-950/90 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl scrollbar-none">
        <span className="text-[10px] uppercase font-black tracking-wider text-amber-400 shrink-0 flex items-center gap-1">
          <span>📍</span> CLICK ARCHITECTURAL HOTSPOT:
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

      {/* Fallback */}
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
