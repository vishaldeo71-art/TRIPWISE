'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Script from 'next/script';
import { Monument, MonumentFeature } from '@/data/monuments';
import { CompassIcon, MapPinIcon, SparklesIcon } from '@/components/Icons';

// ========================== TYPE DECLARATIONS ==========================
/* eslint-disable @typescript-eslint/no-explicit-any */
declare const google: any;
declare global {
  interface Window {
    google: any;
    initGoogleMaps: () => void;
  }
}

// ========================== COMPONENT PROPS ==========================
interface Immersive3DViewerProps {
  monument: Monument;
  selectedFeature: MonumentFeature | null;
  onSelectFeature: (feature: MonumentFeature) => void;
  activeCategoryMode: 'all' | 'Architecture' | 'History' | 'MustSee';
  isVirtualWalk: boolean;
  onVirtualWalkStepChange?: (stepIdx: number) => void;
}

// ========================== IMAGE BANKS ==========================
// Curated real web images for CSS 3D fallback mode (when no API key)
const MONUMENT_IMAGE_BANK: Record<string, string[]> = {
  'red-fort': [
    'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1585135497273-1a86b09fe707?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80',
  ],
  'qutub-minar': [
    'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80',
  ],
  'humayun-tomb': [
    'https://images.unsplash.com/photo-1585135497273-1a86b09fe707?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80',
  ],
  'akshardham': [
    'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80',
  ],
  'tower-bridge': [
    'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1486299267070-83823f5448dd?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1520986606214-8b456906c813?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?auto=format&fit=crop&w=1200&q=80',
  ],
  'british-museum': [
    'https://images.unsplash.com/photo-1565060169194-1a65d5ef07ee?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1574958269340-fa927503f3dd?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1580674285054-bed31e145f59?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?auto=format&fit=crop&w=1200&q=80',
  ],
  'eiffel-tower': [
    'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1543349689-9a4d426bee8e?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1431274172761-fca41d930114?auto=format&fit=crop&w=1200&q=80',
  ],
  'louvre-museum': [
    'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1541264161754-445bbdd7de52?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1503917988258-f87a78e3c995?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1471623320832-752e8bbf8413?auto=format&fit=crop&w=1200&q=80',
  ],
};

function getMonumentImages(monumentId: string, overviewImage: string): string[] {
  return MONUMENT_IMAGE_BANK[monumentId] || [overviewImage, overviewImage, overviewImage, overviewImage];
}

// ========================== GOOGLE MAPS VIEWER ==========================
function GoogleMapsViewer({
  monument,
  selectedFeature,
  filteredFeatures,
  onSelectFeature,
  apiKey,
}: {
  monument: Monument;
  selectedFeature: MonumentFeature | null;
  filteredFeatures: MonumentFeature[];
  onSelectFeature: (f: MonumentFeature) => void;
  apiKey: string;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const streetViewRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<'streetview' | 'satellite' | 'hybrid'>('streetview');
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [streetViewAvailable, setStreetViewAvailable] = useState(true);
  const mapInstanceRef = useRef<any>(null);
  const streetViewInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // Check if Google Maps is loaded
  useEffect(() => {
    const check = () => {
      if (window.google && window.google.maps) {
        setMapsLoaded(true);
      }
    };
    check();
    window.initGoogleMaps = () => setMapsLoaded(true);
  }, []);

  // Initialize Street View
  useEffect(() => {
    if (!mapsLoaded || !streetViewRef.current || viewMode !== 'streetview') return;

    const lat = selectedFeature?.lat || monument.lat;
    const lng = selectedFeature?.lng || monument.lng;
    const heading = selectedFeature?.cameraHeading || 90;
    const pitch = selectedFeature?.cameraPitch || -10;

    const streetViewService = new google.maps.StreetViewService();
    const location = new google.maps.LatLng(lat, lng);

    streetViewService.getPanorama(
      { location, radius: 200, preference: google.maps.StreetViewPreference.NEAREST },
      (data: any, status: any) => {
        if (status === google.maps.StreetViewStatus.OK && data?.location?.latLng) {
          setStreetViewAvailable(true);
          streetViewInstanceRef.current = new google.maps.StreetViewPanorama(
            streetViewRef.current!,
            {
              position: data.location.latLng,
              pov: { heading, pitch: pitch + 10 },
              zoom: 1,
              motionTracking: false,
              motionTrackingControl: false,
              linksControl: true,
              panControl: true,
              zoomControl: true,
              fullscreenControl: false,
              addressControl: false,
              enableCloseButton: false,
              showRoadLabels: false,
            }
          );
        } else {
          setStreetViewAvailable(false);
          // Fallback to satellite view
          setViewMode('satellite');
        }
      }
    );

    return () => {
      streetViewInstanceRef.current = null;
    };
  }, [mapsLoaded, monument.id, selectedFeature?.id, viewMode]);

  // Initialize Satellite/Hybrid Map
  useEffect(() => {
    if (!mapsLoaded || !mapRef.current || viewMode === 'streetview') return;

    const lat = selectedFeature?.lat || monument.lat;
    const lng = selectedFeature?.lng || monument.lng;

    const map = new google.maps.Map(mapRef.current, {
      center: { lat, lng },
      zoom: 18,
      mapTypeId: viewMode === 'satellite' ? 'satellite' : 'hybrid',
      tilt: 45,
      heading: selectedFeature?.cameraHeading || 0,
      disableDefaultUI: true,
      zoomControl: true,
      mapTypeControl: false,
      gestureHandling: 'greedy',
      mapId: 'tripwise_immersive',
    });

    mapInstanceRef.current = map;

    // Clear old markers
    markersRef.current.forEach((m) => (m.map = null));
    markersRef.current = [];

    // Add feature markers
    filteredFeatures.forEach((feat) => {
      const isSelected = selectedFeature?.id === feat.id;

      const markerEl = document.createElement('div');
      markerEl.innerHTML = `
        <div style="
          display: flex; align-items: center; gap: 6px;
          background: ${isSelected ? '#f59e0b' : feat.isMustSee ? '#10b981' : '#0ea5e9'};
          color: ${isSelected ? '#0f172a' : '#ffffff'};
          padding: 6px 12px; border-radius: 20px;
          font-size: 11px; font-weight: 800;
          box-shadow: 0 4px 20px ${isSelected ? 'rgba(245,158,11,0.5)' : 'rgba(0,0,0,0.3)'};
          border: 2px solid ${isSelected ? '#fbbf24' : 'rgba(255,255,255,0.3)'};
          cursor: pointer; white-space: nowrap;
          transform: scale(${isSelected ? '1.15' : '1'});
          transition: all 0.2s ease;
        ">
          <span>${feat.category === 'Architecture' ? '🏛️' : feat.category === 'History' ? '📜' : '✨'}</span>
          <span>${feat.name}</span>
          ${feat.isMustSee ? '<span style="font-size:9px">⭐</span>' : ''}
        </div>
      `;

      try {
        const marker = new google.maps.marker.AdvancedMarkerElement({
          map,
          position: { lat: feat.lat, lng: feat.lng },
          content: markerEl,
          title: feat.name,
        });

        marker.addListener('click', () => onSelectFeature(feat));
        markersRef.current.push(marker);
      } catch {
        // Fallback: use basic Marker if AdvancedMarkerElement is not available
        const marker = new google.maps.Marker({
          map,
          position: { lat: feat.lat, lng: feat.lng },
          title: feat.name,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: isSelected ? 12 : 8,
            fillColor: isSelected ? '#f59e0b' : feat.isMustSee ? '#10b981' : '#0ea5e9',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          },
        });
        marker.addListener('click', () => onSelectFeature(feat));
      }
    });

    return () => {
      markersRef.current.forEach((m) => (m.map = null));
      markersRef.current = [];
    };
  }, [mapsLoaded, monument.id, selectedFeature?.id, viewMode, filteredFeatures.length]);

  // Pan to selected feature
  useEffect(() => {
    if (!selectedFeature || !mapsLoaded) return;

    if (viewMode === 'streetview' && streetViewInstanceRef.current) {
      const streetViewService = new google.maps.StreetViewService();
      streetViewService.getPanorama(
        {
          location: { lat: selectedFeature.lat, lng: selectedFeature.lng },
          radius: 200,
          preference: google.maps.StreetViewPreference.NEAREST,
        },
        (data: any, status: any) => {
          if (status === google.maps.StreetViewStatus.OK && data?.location?.latLng && streetViewInstanceRef.current) {
            streetViewInstanceRef.current.setPosition(data.location.latLng);
            streetViewInstanceRef.current.setPov({
              heading: selectedFeature.cameraHeading || 90,
              pitch: (selectedFeature.cameraPitch || -10) + 10,
            });
          }
        }
      );
    } else if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo({ lat: selectedFeature.lat, lng: selectedFeature.lng });
      mapInstanceRef.current.setZoom(19);
      if (selectedFeature.cameraHeading !== undefined) {
        mapInstanceRef.current.setHeading(selectedFeature.cameraHeading);
      }
    }
  }, [selectedFeature?.id, mapsLoaded]);

  return (
    <>
      {/* Google Maps Script */}
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=marker&callback=initGoogleMaps&v=weekly`}
        strategy="afterInteractive"
      />

      {/* View Mode Toggle */}
      <div className="absolute top-4 right-4 z-30 flex items-center gap-1.5 bg-slate-950/90 backdrop-blur-xl rounded-2xl p-1 border border-slate-700/80 shadow-xl">
        <button
          onClick={() => setViewMode('streetview')}
          className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
            viewMode === 'streetview'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          📸 360° Street View
        </button>
        <button
          onClick={() => setViewMode('satellite')}
          className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
            viewMode === 'satellite'
              ? 'bg-cyan-500 text-white shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          🛰️ Satellite
        </button>
        <button
          onClick={() => setViewMode('hybrid')}
          className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
            viewMode === 'hybrid'
              ? 'bg-emerald-500 text-white shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          🗺️ Hybrid 3D
        </button>
      </div>

      {/* Street View Container */}
      <div
        ref={streetViewRef}
        className={`w-full h-full ${viewMode === 'streetview' ? 'block' : 'hidden'}`}
      />

      {/* Satellite / Hybrid Map Container */}
      <div
        ref={mapRef}
        className={`w-full h-full ${viewMode !== 'streetview' ? 'block' : 'hidden'}`}
      />

      {/* Loading Spinner */}
      {!mapsLoaded && (
        <div className="absolute inset-0 z-40 bg-slate-950/95 flex flex-col items-center justify-center gap-3">
          <CompassIcon size={36} className="text-amber-400 animate-spin" />
          <div className="text-white text-sm font-bold">Loading Google Maps Immersive View...</div>
          <div className="text-slate-400 text-xs">Connecting to Google Earth Satellite & Street View</div>
        </div>
      )}

      {/* Street View Unavailable Notice */}
      {viewMode === 'streetview' && !streetViewAvailable && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-xl bg-amber-500/90 text-slate-950 text-xs font-bold shadow-xl">
          ⚠️ Street View not available here — switching to Satellite View
        </div>
      )}
    </>
  );
}

// ========================== CSS 3D FALLBACK VIEWER ==========================
function CSS3DFallbackViewer({
  monument,
  selectedFeature,
  filteredFeatures,
  onSelectFeature,
}: {
  monument: Monument;
  selectedFeature: MonumentFeature | null;
  filteredFeatures: MonumentFeature[];
  onSelectFeature: (f: MonumentFeature) => void;
}) {
  const [rotateY, setRotateY] = useState(0);
  const [rotateX, setRotateX] = useState(10);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [autoRotate, setAutoRotate] = useState(true);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const images = getMonumentImages(monument.id, monument.overviewImage);

  useEffect(() => {
    if (!autoRotate || isDragging) return;
    const interval = setInterval(() => setRotateY((p) => p + 0.3), 30);
    return () => clearInterval(interval);
  }, [autoRotate, isDragging]);

  useEffect(() => {
    if (selectedFeature) {
      setAutoRotate(false);
      const t = setTimeout(() => setAutoRotate(true), 6000);
      return () => clearTimeout(t);
    }
  }, [selectedFeature?.id]);

  const onDown = useCallback((x: number, y: number) => {
    setIsDragging(true);
    setDragStart({ x, y });
    setAutoRotate(false);
  }, []);

  const onMove = useCallback((x: number, y: number) => {
    if (!isDragging) return;
    setRotateY((p) => p + (x - dragStart.x) * 0.3);
    setRotateX((p) => Math.max(-30, Math.min(40, p + (y - dragStart.y) * 0.2)));
    setDragStart({ x, y });
  }, [isDragging, dragStart]);

  const onUp = useCallback(() => {
    setIsDragging(false);
    setTimeout(() => setAutoRotate(true), 3000);
  }, []);

  const cubeSize = 280;
  const tz = cubeSize / 2;

  const faces = [
    { label: 'Front View', color: 'amber', transform: `translateZ(${tz}px)`, imgIdx: 0 },
    { label: 'Rear View', color: 'cyan', transform: `rotateY(180deg) translateZ(${tz}px)`, imgIdx: 1 },
    { label: 'East View', color: 'emerald', transform: `rotateY(90deg) translateZ(${tz}px)`, imgIdx: 2 },
    { label: 'West View', color: 'purple', transform: `rotateY(-90deg) translateZ(${tz}px)`, imgIdx: 3 },
    { label: 'Aerial View', color: 'amber', transform: `rotateX(90deg) translateZ(${tz}px)`, imgIdx: 4 % images.length },
  ];

  return (
    <div
      className="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
      style={{ perspective: '1200px' }}
      onMouseDown={(e) => onDown(e.clientX, e.clientY)}
      onMouseMove={(e) => onMove(e.clientX, e.clientY)}
      onMouseUp={onUp}
      onMouseLeave={onUp}
      onTouchStart={(e) => onDown(e.touches[0].clientX, e.touches[0].clientY)}
      onTouchMove={(e) => onMove(e.touches[0].clientX, e.touches[0].clientY)}
      onTouchEnd={onUp}
    >
      <div
        className="relative transition-transform duration-100"
        style={{
          width: `${cubeSize}px`,
          height: `${cubeSize}px`,
          transformStyle: 'preserve-3d',
          transform: `rotateX(${-rotateX}deg) rotateY(${rotateY}deg)`,
        }}
      >
        {faces.map((face, i) => (
          <div
            key={i}
            className={`absolute inset-0 rounded-2xl overflow-hidden border-2 border-${face.color}-500/30 shadow-2xl`}
            style={{ transform: face.transform, backfaceVisibility: 'hidden' }}
          >
            <img src={images[face.imgIdx]} alt={`${monument.name} - ${face.label}`} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 right-3">
              <div className={`text-${face.color}-400 text-[10px] font-extrabold uppercase tracking-widest`}>{face.label}</div>
              <div className="text-white text-sm font-bold truncate">{monument.name}</div>
            </div>
          </div>
        ))}

        {/* Bottom face */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden border-2 border-slate-500/30"
          style={{ transform: `rotateX(-90deg) translateZ(${tz}px)`, backfaceVisibility: 'hidden' }}
        >
          <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)' }}>
            <div className="text-center">
              <MapPinIcon size={32} className="text-amber-500 mx-auto mb-2" />
              <div className="text-amber-400 text-xs font-bold">{monument.cityName}, {monument.country}</div>
              <div className="text-slate-400 text-[10px] mt-1">{monument.builtYear}</div>
            </div>
          </div>
        </div>

        {/* Floating Hotspot Markers */}
        {filteredFeatures.map((feat, idx) => {
          const angle = (idx / Math.max(1, filteredFeatures.length)) * Math.PI * 2;
          const radius = tz + 70;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          const isSelected = selectedFeature?.id === feat.id;
          const isHovered = hoveredId === feat.id;

          return (
            <div
              key={feat.id}
              className="absolute cursor-pointer transition-all duration-300"
              style={{
                left: '50%', top: '50%',
                transform: `translate(-50%, -50%) translate3d(${x}px, ${-20 + idx * 8}px, ${z}px)`,
                transformStyle: 'preserve-3d', zIndex: isSelected ? 50 : 10,
              }}
              onClick={(e) => { e.stopPropagation(); onSelectFeature(feat); }}
              onMouseEnter={() => setHoveredId(feat.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div className={`relative flex items-center justify-center transition-all duration-300 ${isSelected ? 'scale-125' : isHovered ? 'scale-110' : ''}`}>
                <div className={`absolute inset-0 rounded-full animate-ping opacity-30 ${isSelected ? 'bg-amber-500' : feat.isMustSee ? 'bg-emerald-500' : 'bg-cyan-500'}`}
                  style={{ width: '44px', height: '44px', margin: '-6px' }} />
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-xl border-2 font-black text-[10px] ${
                  isSelected ? 'bg-amber-500 border-amber-300 text-slate-950'
                    : feat.isMustSee ? 'bg-emerald-500 border-emerald-300 text-white'
                      : 'bg-cyan-500 border-cyan-300 text-white'
                }`}>
                  {feat.category === 'Architecture' ? '🏛' : feat.category === 'History' ? '📜' : '✨'}
                </div>
                {(isSelected || isHovered) && (
                  <div className={`absolute top-full mt-1 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full whitespace-nowrap text-[10px] font-extrabold shadow-lg border ${
                    isSelected ? 'bg-amber-500 text-slate-950 border-amber-300' : 'bg-slate-900/95 text-white border-slate-700'
                  }`} style={{ backdropFilter: 'blur(8px)' }}>
                    {feat.name}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ========================== MAIN COMPONENT ==========================
export default function Immersive3DViewer({
  monument,
  selectedFeature,
  onSelectFeature,
  activeCategoryMode,
  isVirtualWalk,
  onVirtualWalkStepChange,
}: Immersive3DViewerProps) {
  const [isExplodedView, setIsExplodedView] = useState(false);
  const [hoveredFeatureName, setHoveredFeatureName] = useState<string | null>(null);

  const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  const hasGoogleMaps = googleApiKey.length > 10;

  // Filter features based on mode
  const filteredFeatures = monument.features.filter((f) => {
    if (activeCategoryMode === 'MustSee') return !!f.isMustSee;
    if (activeCategoryMode === 'Architecture') return f.category === 'Architecture';
    if (activeCategoryMode === 'History') return f.category === 'History';
    return true;
  });

  // Virtual Walk Auto-Transition
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
    <div
      className="relative w-full h-[520px] sm:h-[580px] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl group select-none"
      style={{ background: 'linear-gradient(135deg, #07090e 0%, #0f172a 40%, #1e1b4b 70%, #07090e 100%)' }}
    >
      {/* Animated Background Particles (only visible in fallback mode) */}
      {!hasGoogleMaps && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full opacity-20 animate-pulse"
              style={{
                width: `${2 + Math.random() * 4}px`,
                height: `${2 + Math.random() * 4}px`,
                background: i % 3 === 0 ? '#f59e0b' : i % 3 === 1 ? '#38bdf8' : '#a78bfa',
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* MAIN VIEWER: Google Maps or CSS 3D Fallback */}
      {hasGoogleMaps ? (
        <GoogleMapsViewer
          monument={monument}
          selectedFeature={selectedFeature}
          filteredFeatures={filteredFeatures}
          onSelectFeature={onSelectFeature}
          apiKey={googleApiKey}
        />
      ) : (
        <CSS3DFallbackViewer
          monument={monument}
          selectedFeature={selectedFeature}
          filteredFeatures={filteredFeatures}
          onSelectFeature={onSelectFeature}
        />
      )}

      {/* ============= OVERLAY UI (shared by both modes) ============= */}

      {/* Top Left Status Badge */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2">
        <div className="px-3.5 py-1.5 rounded-full bg-slate-900/90 backdrop-blur-md border border-slate-700/80 text-white text-[11px] font-extrabold flex items-center gap-2 shadow-lg">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>{hasGoogleMaps ? 'Google Earth Immersive View' : 'TripWise 3D Photo Explorer'}</span>
        </div>

        {!hasGoogleMaps && (
          <button
            onClick={() => setIsExplodedView(!isExplodedView)}
            className={`px-3 py-1.5 rounded-full text-[11px] font-extrabold transition-all flex items-center gap-1.5 shadow-lg ${
              isExplodedView
                ? 'bg-amber-500 text-slate-950 scale-105 shadow-amber-500/30'
                : 'bg-slate-900/90 text-amber-300 border border-amber-500/40 hover:bg-slate-800'
            }`}
          >
            <span>💥</span>
            <span>{isExplodedView ? 'Exploded Active' : 'Explode'}</span>
          </button>
        )}
      </div>

      {/* Instruction hint (CSS3D mode) */}
      {!hasGoogleMaps && (
        <div className="absolute top-16 left-4 z-20 text-[10px] text-amber-300 font-bold bg-slate-900/80 px-3 py-1 rounded-full border border-amber-500/30">
          💡 Drag to rotate 360° • Click hotspot markers to view details
        </div>
      )}

      {/* Bottom Hotspot Navigation Bar */}
      <div
        className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-center gap-2 overflow-x-auto py-2.5 px-4 bg-slate-950/90 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl"
        style={{ scrollbarWidth: 'none' }}
      >
        <span className="text-[10px] uppercase font-black tracking-wider text-amber-400 shrink-0 flex items-center gap-1">
          <span>📍</span> EXPLORE FEATURE:
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
              {feat.isMustSee && <span className="text-[9px] text-emerald-400 font-black">⭐</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
