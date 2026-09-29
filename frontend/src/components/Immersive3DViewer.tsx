'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Monument, MonumentFeature } from '@/data/monuments';
import { CompassIcon, MapPinIcon, SparklesIcon } from '@/components/Icons';

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
  const [webglError, setWebglError] = useState(false);
  const [hoveredFeature, setHoveredFeature] = useState<MonumentFeature | null>(null);

  // Filter features based on mode
  const filteredFeatures = monument.features.filter((f) => {
    if (activeCategoryMode === 'MustSee') return !!f.isMustSee;
    if (activeCategoryMode === 'Architecture') return f.category === 'Architecture';
    if (activeCategoryMode === 'History') return f.category === 'History';
    return true;
  });

  // Check if optional Google 3D Maps API Key is set in env
  const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!mountRef.current) return;

    let renderer: THREE.WebGLRenderer;
    let animationFrameId: number;

    try {
      // Setup Three.js WebGL 3D Scene
      const width = mountRef.current.clientWidth || 800;
      const height = mountRef.current.clientHeight || 500;

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0b0f19);

      const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
      camera.position.set(0, 12, 22);
      camera.lookAt(0, 0, 0);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;

      // Clear container and append canvas
      mountRef.current.innerHTML = '';
      mountRef.current.appendChild(renderer.domElement);

      // Add Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
      scene.add(ambientLight);

      const dirLight = new THREE.DirectionalLight(0xfffaed, 1.4);
      dirLight.position.set(20, 40, 20);
      dirLight.castShadow = true;
      scene.add(dirLight);

      const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.6);
      rimLight.position.set(-20, 10, -20);
      scene.add(rimLight);

      // Create 3D Ground Terrain Base
      const groundGeo = new THREE.CylinderGeometry(14, 15, 1.2, 64);
      const groundMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.7,
        metalness: 0.2
      });
      const ground = new THREE.Mesh(groundGeo, groundMat);
      ground.position.y = -0.6;
      ground.receiveShadow = true;
      scene.add(ground);

      // Grid helper ring
      const grid = new THREE.GridHelper(26, 26, 0xf59e0b, 0x334155);
      grid.position.y = 0.01;
      scene.add(grid);

      // Create Central Monument 3D Stylized Platform
      const monumentGroup = new THREE.Group();

      // Main base structure
      const baseGeo = new THREE.BoxGeometry(7, 3.5, 7);
      const baseMat = new THREE.MeshStandardMaterial({
        color: monument.cityName === 'Delhi' ? 0x991b1b : monument.cityName === 'London' ? 0x334155 : 0xd97706,
        roughness: 0.4,
        metalness: 0.3
      });
      const baseMesh = new THREE.Mesh(baseGeo, baseMat);
      baseMesh.position.y = 1.75;
      baseMesh.castShadow = true;
      monumentGroup.add(baseMesh);

      // Dome / Tower Top
      const topGeo = new THREE.SphereGeometry(2.2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
      const topMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, metalness: 0.6, roughness: 0.2 });
      const topMesh = new THREE.Mesh(topGeo, topMat);
      topMesh.position.y = 3.5;
      monumentGroup.add(topMesh);

      scene.add(monumentGroup);

      // Render 3D Hotspot Nodes
      const hotspotGroup = new THREE.Group();
      scene.add(hotspotGroup);

      const featureCoordsMap = new Map<string, THREE.Vector3>();

      filteredFeatures.forEach((feat, idx) => {
        const angle = (idx / Math.max(1, filteredFeatures.length)) * Math.PI * 2;
        const radius = 6 + (idx % 2 === 0 ? 1 : -1);
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = 2.5;

        const pos = new THREE.Vector3(x, y, z);
        featureCoordsMap.set(feat.id, pos);

        // Marker mesh
        const markerGeo = new THREE.SphereGeometry(0.5, 16, 16);
        const isSelected = selectedFeature?.id === feat.id;
        const markerMat = new THREE.MeshStandardMaterial({
          color: isSelected ? 0xf59e0b : feat.isMustSee ? 0x10b981 : 0x38bdf8,
          emissive: isSelected ? 0xd97706 : 0x0284c7,
          emissiveIntensity: 0.6,
          roughness: 0.2
        });
        const marker = new THREE.Mesh(markerGeo, markerMat);
        marker.position.copy(pos);
        marker.userData = { featureId: feat.id, feature: feat };
        hotspotGroup.add(marker);

        // Ring pulses
        const ringGeo = new THREE.RingGeometry(0.6, 0.8, 32);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.copy(pos);
        ring.rotation.x = Math.PI / 2;
        hotspotGroup.add(ring);
      });

      // Interactive Orbit & Drag State
      let isDragging = false;
      let previousMousePosition = { x: 0, y: 0 };
      let targetRotationY = 0;
      let targetRotationX = 0.3;

      const onMouseDown = (e: MouseEvent) => {
        isDragging = true;
        previousMousePosition = { x: e.clientX, y: e.clientY };
      };

      const onMouseMove = (e: MouseEvent) => {
        if (!isDragging) return;
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;

        targetRotationY += deltaX * 0.008;
        targetRotationX += deltaY * 0.008;
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

      // Handle Window Resize
      const handleResize = () => {
        if (!mountRef.current) return;
        const w = mountRef.current.clientWidth;
        const h = mountRef.current.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener('resize', handleResize);

      // Animation Loop
      let clock = new THREE.Clock();

      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();

        // Slow ambient rotation when not dragging
        if (!isDragging && !selectedFeature) {
          targetRotationY += 0.002;
        }

        // Camera positioning based on orbit angles
        const distance = 20;
        camera.position.x = Math.sin(targetRotationY) * Math.cos(targetRotationX) * distance;
        camera.position.z = Math.cos(targetRotationY) * Math.cos(targetRotationX) * distance;
        camera.position.y = Math.sin(targetRotationX) * distance + 3;
        camera.lookAt(0, 1.5, 0);

        // Animate Hotspot Rings
        hotspotGroup.children.forEach((child, i) => {
          if (child instanceof THREE.Mesh && child.geometry instanceof THREE.RingGeometry) {
            const scale = 1 + Math.sin(elapsedTime * 3 + i) * 0.2;
            child.scale.set(scale, scale, scale);
          }
        });

        // Rotate central monument slowly
        monumentGroup.rotation.y = elapsedTime * 0.1;

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
      console.warn('WebGL 3D Context Warning:', err);
      setWebglError(true);
      setProviderMode('geoapify_fallback');
    }
  }, [monument.id, filteredFeatures.length, selectedFeature?.id]);

  // Handle Virtual Walk auto-camera steps
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
    <div className="relative w-full h-[480px] sm:h-[540px] rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl group">
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Provider Mode Badge Header */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <div className="px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-white text-[11px] font-extrabold flex items-center gap-2 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>
            {googleApiKey && providerMode === 'google_3d' ? 'Google Photorealistic 3D Tiles' : 'TripWise Free 3D Engine (CesiumJS Compatible)'}
          </span>
        </div>

        {googleApiKey && (
          <button
            onClick={() => setProviderMode(providerMode === 'google_3d' ? 'free_3d' : 'google_3d')}
            className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold hover:bg-amber-500/30 transition"
          >
            Switch to {providerMode === 'google_3d' ? 'Free Engine' : 'Google Mode'}
          </button>
        )}
      </div>

      {/* Top Right Control Tips */}
      <div className="absolute top-4 right-4 z-20 hidden sm:flex items-center gap-2">
        <div className="px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-slate-300 text-[10px] font-semibold">
          🖱️ Drag to rotate • Scroll to zoom
        </div>
      </div>

      {/* Hotspots Overlay Buttons Container */}
      <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-center gap-2 overflow-x-auto py-2 px-3 bg-slate-900/85 backdrop-blur-lg border border-slate-800 rounded-2xl scrollbar-none">
        <span className="text-[10px] uppercase font-bold text-amber-400 shrink-0">
          📍 Click Hotspot:
        </span>
        {filteredFeatures.map((feat) => {
          const isSelected = selectedFeature?.id === feat.id;
          return (
            <button
              key={feat.id}
              onClick={() => onSelectFeature(feat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                isSelected
                  ? 'bg-amber-500 text-slate-950 shadow-lg scale-105 font-extrabold'
                  : 'bg-slate-800/80 text-slate-200 border border-slate-700/60 hover:bg-slate-700'
              }`}
            >
              <span>{feat.category === 'Architecture' ? '🏛️' : feat.category === 'History' ? '📜' : '✨'}</span>
              <span>{feat.name}</span>
              {feat.isMustSee && <span className="text-[9px] text-emerald-400 font-bold">⭐</span>}
            </button>
          );
        })}
      </div>

      {/* WebGL Fallback Notification if needed */}
      {webglError && (
        <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center p-6 text-center text-white space-y-3">
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
