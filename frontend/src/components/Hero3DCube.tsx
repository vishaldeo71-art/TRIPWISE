'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { SunIcon, MapPinIcon, CompassIcon } from '@/components/Icons';

interface LandmarkFace {
  id: string;
  name: string;
  city: string;
  country: string;
  badge: string;
  image: string;
  rotX: number;
  rotY: number;
}

const LANDMARKS: LandmarkFace[] = [
  {
    id: 'taj-mahal',
    name: 'Taj Mahal',
    city: 'Agra',
    country: 'India',
    badge: 'Wonder of World',
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80',
    rotX: 0,
    rotY: 0, // Front
  },
  {
    id: 'lal-qila',
    name: 'Red Fort (Lal Qila)',
    city: 'Delhi',
    country: 'India',
    badge: 'Mughal Heritage',
    image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80',
    rotX: 0,
    rotY: -90, // Right / East
  },
  {
    id: 'eiffel-tower',
    name: 'Eiffel Tower',
    city: 'Paris',
    country: 'France',
    badge: 'Iconic Architecture',
    image: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=800&q=80',
    rotX: 0,
    rotY: -180, // Back
  },
  {
    id: 'qutub-minar',
    name: 'Qutub Minar',
    city: 'Delhi',
    country: 'India',
    badge: 'UNESCO Heritage',
    image: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80',
    rotX: 0,
    rotY: 90, // Left / West
  },
  {
    id: 'kyoto-shrine',
    name: 'Fushimi Inari Shrine',
    city: 'Kyoto',
    country: 'Japan',
    badge: 'Historic Sanctuary',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
    rotX: -90, // Top
    rotY: 0,
  },
  {
    id: 'tower-bridge',
    name: 'Tower Bridge',
    city: 'London',
    country: 'UK',
    badge: 'Victorian Landmark',
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80',
    rotX: 90, // Bottom
    rotY: 0,
  },
];

interface Hero3DCubeProps {
  onSelectCity?: (cityName: string) => void;
}

export default function Hero3DCube({ onSelectCity }: Hero3DCubeProps) {
  const [rotateY, setRotateY] = useState(-15);
  const [rotateX, setRotateX] = useState(12);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [autoRotate, setAutoRotate] = useState(true);
  const [activeLandmark, setActiveLandmark] = useState<LandmarkFace>(LANDMARKS[0]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto rotation loop
  useEffect(() => {
    if (!autoRotate || isDragging) return;
    const interval = setInterval(() => {
      setRotateY((prev) => (prev + 0.4) % 360);
    }, 30);
    return () => clearInterval(interval);
  }, [autoRotate, isDragging]);

  // Update active landmark based on angle
  useEffect(() => {
    if (isDragging) return;
    // Normalize rotateY to 0-360 range
    let normY = (rotateY % 360 + 360) % 360;
    if (normY > 180) normY -= 360;

    // Estimate front face
    if (Math.abs(normY) < 45) {
      setActiveLandmark(LANDMARKS[0]); // Taj Mahal (Front)
    } else if (normY <= -45 && normY > -135) {
      setActiveLandmark(LANDMARKS[1]); // Red Fort (Right)
    } else if (Math.abs(normY) >= 135) {
      setActiveLandmark(LANDMARKS[2]); // Eiffel Tower (Back)
    } else if (normY >= 45 && normY < 135) {
      setActiveLandmark(LANDMARKS[3]); // Qutub Minar (Left)
    }
  }, [rotateY, isDragging]);

  const onDown = useCallback((x: number, y: number) => {
    setIsDragging(true);
    setDragStart({ x, y });
    setAutoRotate(false);
  }, []);

  const onMove = useCallback((x: number, y: number) => {
    if (!isDragging) return;
    const deltaX = x - dragStart.x;
    const deltaY = y - dragStart.y;

    setRotateY((prev) => prev + deltaX * 0.4);
    setRotateX((prev) => Math.max(-40, Math.min(40, prev + deltaY * 0.3)));
    setDragStart({ x, y });
  }, [isDragging, dragStart]);

  const onUp = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    // Resume auto-rotation after 4 seconds idle
    setTimeout(() => {
      setAutoRotate(true);
    }, 4000);
  }, [isDragging]);

  const snapToLandmark = (landmark: LandmarkFace) => {
    setAutoRotate(false);
    setActiveLandmark(landmark);
    setRotateX(landmark.rotX === 0 ? 10 : landmark.rotX);
    setRotateY(landmark.rotY);
    setTimeout(() => setAutoRotate(true), 6000);
  };

  // Dimensions of cube tailored to fit inside hero section card
  const cubeSize = 220; // 220px size fits perfectly in 440px container
  const tz = cubeSize / 2; // 110px depth offset

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[440px] rounded-[28px] overflow-hidden border border-slate-800 shadow-2xl bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0b0f19] to-slate-950 select-none group"
    >
      {/* Dynamic Ambient Background Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl animate-pulse" />
        <div className="absolute top-1/4 right-1/4 w-48 h-48 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-48 h-48 rounded-full bg-indigo-500/10 blur-3xl" />

        {/* Ambient Floating Particle Dots */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-amber-400/30 animate-pulse"
            style={{
              width: `${2 + (i % 3) * 2}px`,
              height: `${2 + (i % 3) * 2}px`,
              top: `${(i * 23) % 90 + 5}%`,
              left: `${(i * 37) % 90 + 5}%`,
              animationDuration: `${2 + (i % 4)}s`,
            }}
          />
        ))}
      </div>

      {/* Top Floating Badge 1: 3D Explorer & Controls */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <div className="bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-700/80 shadow-lg flex items-center gap-2 text-xs font-extrabold text-white">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>3D Interactive Cube</span>
        </div>
      </div>

      {/* Top Floating Badge 2: Outdoor Weather Score */}
      <div className="absolute top-4 right-4 z-20 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/20 shadow-lg flex items-center gap-2 text-xs font-bold text-[#131314]">
        <SunIcon size={16} className="text-amber-500" />
        <div className="text-left">
          <div className="text-[10px] text-[var(--muted)] uppercase font-semibold">Outdoor Score</div>
          <div className="font-extrabold">94/100 • Clear Sky</div>
        </div>
      </div>

      {/* Drag & Rotate Instruction Overlay (Fades out when dragging) */}
      <div className="absolute top-16 left-4 z-20 pointer-events-none transition-opacity duration-300">
        <span className="text-[10px] font-bold text-amber-300 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-amber-500/30 flex items-center gap-1.5 shadow-md">
          <CompassIcon size={12} className="text-amber-400 animate-spin" />
          <span>Drag cube to rotate 360°</span>
        </span>
      </div>

      {/* 3D CUBE STAGE */}
      <div
        className="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
        style={{ perspective: '1000px' }}
        onMouseDown={(e) => onDown(e.clientX, e.clientY)}
        onMouseMove={(e) => onMove(e.clientX, e.clientY)}
        onMouseUp={onUp}
        onMouseLeave={onUp}
        onTouchStart={(e) => onDown(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchMove={(e) => onMove(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchEnd={onUp}
      >
        <div
          className="relative transition-transform duration-75"
          style={{
            width: `${cubeSize}px`,
            height: `${cubeSize}px`,
            transformStyle: 'preserve-3d',
            transform: `rotateX(${-rotateX}deg) rotateY(${rotateY}deg)`,
          }}
        >
          {/* Front Face: Taj Mahal */}
          <div
            className="absolute inset-0 rounded-2xl overflow-hidden border-2 border-amber-400/40 shadow-2xl bg-slate-950 group/face"
            style={{ transform: `translateZ(${tz}px)`, backfaceVisibility: 'hidden' }}
          >
            <img src={LANDMARKS[0].image} alt="Taj Mahal" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 text-left">
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-500/40">
                ✨ {LANDMARKS[0].badge}
              </span>
              <h4 className="text-white font-extrabold text-sm font-display mt-1">{LANDMARKS[0].name}</h4>
              <p className="text-[11px] text-slate-300 font-medium">{LANDMARKS[0].city}, {LANDMARKS[0].country}</p>
            </div>
          </div>

          {/* Right (East) Face: Red Fort (Lal Qila) */}
          <div
            className="absolute inset-0 rounded-2xl overflow-hidden border-2 border-rose-400/40 shadow-2xl bg-slate-950"
            style={{ transform: `rotateY(90deg) translateZ(${tz}px)`, backfaceVisibility: 'hidden' }}
          >
            <img src={LANDMARKS[1].image} alt="Red Fort" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 text-left">
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-rose-300 bg-rose-950/80 px-2 py-0.5 rounded-full border border-rose-500/40">
                🏛️ {LANDMARKS[1].badge}
              </span>
              <h4 className="text-white font-extrabold text-sm font-display mt-1">{LANDMARKS[1].name}</h4>
              <p className="text-[11px] text-slate-300 font-medium">{LANDMARKS[1].city}, {LANDMARKS[1].country}</p>
            </div>
          </div>

          {/* Back Face: Eiffel Tower */}
          <div
            className="absolute inset-0 rounded-2xl overflow-hidden border-2 border-cyan-400/40 shadow-2xl bg-slate-950"
            style={{ transform: `rotateY(180deg) translateZ(${tz}px)`, backfaceVisibility: 'hidden' }}
          >
            <img src={LANDMARKS[2].image} alt="Eiffel Tower" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 text-left">
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-500/40">
                🗼 {LANDMARKS[2].badge}
              </span>
              <h4 className="text-white font-extrabold text-sm font-display mt-1">{LANDMARKS[2].name}</h4>
              <p className="text-[11px] text-slate-300 font-medium">{LANDMARKS[2].city}, {LANDMARKS[2].country}</p>
            </div>
          </div>

          {/* Left (West) Face: Qutub Minar */}
          <div
            className="absolute inset-0 rounded-2xl overflow-hidden border-2 border-emerald-400/40 shadow-2xl bg-slate-950"
            style={{ transform: `rotateY(-90deg) translateZ(${tz}px)`, backfaceVisibility: 'hidden' }}
          >
            <img src={LANDMARKS[3].image} alt="Qutub Minar" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 text-left">
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/40">
                🕌 {LANDMARKS[3].badge}
              </span>
              <h4 className="text-white font-extrabold text-sm font-display mt-1">{LANDMARKS[3].name}</h4>
              <p className="text-[11px] text-slate-300 font-medium">{LANDMARKS[3].city}, {LANDMARKS[3].country}</p>
            </div>
          </div>

          {/* Top Face: Kyoto Shrine */}
          <div
            className="absolute inset-0 rounded-2xl overflow-hidden border-2 border-purple-400/40 shadow-2xl bg-slate-950"
            style={{ transform: `rotateX(90deg) translateZ(${tz}px)`, backfaceVisibility: 'hidden' }}
          >
            <img src={LANDMARKS[4].image} alt="Kyoto Shrine" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 text-left">
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-purple-300 bg-purple-950/80 px-2 py-0.5 rounded-full border border-purple-500/40">
                ⛩️ {LANDMARKS[4].badge}
              </span>
              <h4 className="text-white font-extrabold text-sm font-display mt-1">{LANDMARKS[4].name}</h4>
              <p className="text-[11px] text-slate-300 font-medium">{LANDMARKS[4].city}, {LANDMARKS[4].country}</p>
            </div>
          </div>

          {/* Bottom Face: Tower Bridge */}
          <div
            className="absolute inset-0 rounded-2xl overflow-hidden border-2 border-indigo-400/40 shadow-2xl bg-slate-950"
            style={{ transform: `rotateX(-90deg) translateZ(${tz}px)`, backfaceVisibility: 'hidden' }}
          >
            <img src={LANDMARKS[5].image} alt="Tower Bridge" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 text-left">
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-indigo-300 bg-indigo-950/80 px-2 py-0.5 rounded-full border border-indigo-500/40">
                🌉 {LANDMARKS[5].badge}
              </span>
              <h4 className="text-white font-extrabold text-sm font-display mt-1">{LANDMARKS[5].name}</h4>
              <p className="text-[11px] text-slate-300 font-medium">{LANDMARKS[5].city}, {LANDMARKS[5].country}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Floating Interactive Card: Active Landmark Info & Quick Jump Pills */}
      <div className="absolute bottom-3 left-3 right-3 z-20 bg-slate-950/90 backdrop-blur-md p-3.5 rounded-2xl border border-slate-800/90 shadow-xl space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-400 bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-500/40 flex items-center gap-1">
              <MapPinIcon size={12} className="text-amber-400" />
              {activeLandmark.city}, {activeLandmark.country}
            </span>
            <span className="text-[11px] text-slate-400 font-medium truncate hidden sm:inline">
              Featured Landmark
            </span>
          </div>

          {onSelectCity && (
            <button
              onClick={() => onSelectCity(activeLandmark.city)}
              className="text-[11px] font-bold text-amber-400 hover:text-amber-300 hover:underline flex items-center gap-1"
            >
              <span>Explore {activeLandmark.city}</span> →
            </button>
          )}
        </div>

        {/* Quick Jump Buttons for Cube Faces */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          {LANDMARKS.map((lm) => {
            const isActive = activeLandmark.id === lm.id;
            return (
              <button
                key={lm.id}
                onClick={(e) => {
                  e.stopPropagation();
                  snapToLandmark(lm);
                }}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold whitespace-nowrap transition-all border ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-md font-black scale-105'
                    : 'bg-slate-900 text-slate-300 border-slate-700/70 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {lm.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
