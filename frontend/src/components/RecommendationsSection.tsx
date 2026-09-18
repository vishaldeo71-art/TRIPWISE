'use client';

import { useState, useEffect } from 'react';
import { SparklesIcon, MapPinIcon, PlusIcon, CheckIcon, CompassIcon } from '@/components/Icons';
import { Trip, Activity } from '@/types/trip';

interface Recommendation {
  id: string;
  name: string;
  category: string;
  description: string;
  distanceKm: string;
  whyRecommended: string;
  isOutdoor: boolean;
  lat?: number;
  lon?: number;
  durationMinutes?: number;
  bestTime?: 'Morning' | 'Afternoon' | 'Evening' | 'Night';
}

interface RecommendationsSectionProps {
  destination: string;
  persona: string;
  lat?: number;
  lon?: number;
  onAddActivity?: (activity: Activity) => void;
}

export default function RecommendationsSection({
  destination,
  persona,
  lat,
  lon,
  onAddActivity
}: RecommendationsSectionProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [addedIds, setAddedIds] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    fetchRecommendations();
  }, [destination, persona]);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        destination,
        persona,
        lat: lat ? lat.toString() : '28.6139',
        lon: lon ? lon.toString() : '77.2090'
      });

      const res = await fetch(`/api/recommendations?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.recommendations && data.recommendations.length > 0) {
          setRecommendations(data.recommendations);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn('Backend recommendation fetch error:', e);
    }

    // Fallback recommendation items if API unreachable
    setRecommendations([
      {
        id: 'rec-1',
        name: `${destination} Heritage Center`,
        category: 'culture',
        description: `Authentic historical cultural landmark located in ${destination}.`,
        distanceKm: '1.2',
        whyRecommended: `Tailored for ${persona} seeking authentic heritage spots.`,
        isOutdoor: true
      },
      {
        id: 'rec-2',
        name: `${destination} Local Spice Market`,
        category: 'food',
        description: `Popular local market and dining experience in ${destination}.`,
        distanceKm: '2.0',
        whyRecommended: `Recommended food experience for ${persona} travelers.`,
        isOutdoor: true
      }
    ]);
    setLoading(false);
  };

  const handleAdd = (rec: Recommendation) => {
    const newActivity: Activity = {
      id: `act-rec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: rec.name,
      category: rec.category as any || 'culture',
      isOutdoor: rec.isOutdoor,
      durationMinutes: rec.durationMinutes || 90,
      bestTime: rec.bestTime || 'Afternoon',
      description: rec.description,
      estimatedTravelTime: `${rec.distanceKm} km`,
      weatherSuitability: 'High',
      personaSuitability: [persona as any],
      whySelectedReason: rec.whyRecommended,
      lat: rec.lat,
      lng: rec.lon,
      placeName: rec.name
    };

    if (onAddActivity) {
      onAddActivity(newActivity);
    }

    setAddedIds(prev => ({ ...prev, [rec.id]: true }));
    setTimeout(() => {
      setAddedIds(prev => ({ ...prev, [rec.id]: false }));
    }, 2500);
  };

  if (loading) {
    return (
      <div className="tw-card p-6 border border-[var(--border)] animate-pulse">
        <div className="flex items-center gap-2 text-xs font-bold text-[var(--muted)] mb-3">
          <CompassIcon size={16} className="animate-spin text-amber-600" />
          <span>Fetching Geoapify places & Gemini personalization for {destination}...</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-28 rounded-xl bg-[var(--surface)]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="tw-card p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
        <div>
          <span className="tw-badge tw-badge-amber mb-1">
            <SparklesIcon size={12} className="text-amber-600" /> Geoapify + Gemini Engine
          </span>
          <h3 className="text-lg font-extrabold font-display text-[#131314]">
            Recommended for You in {destination}
          </h3>
        </div>
        <span className="text-xs text-[var(--muted)] font-medium">
          Tailored for <strong className="text-[#131314]">{persona}</strong> persona
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map((rec) => (
          <div key={rec.id} className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-2.5 flex flex-col justify-between hover:border-[#131314] transition">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2 text-[11px] font-bold">
                <span className="tw-badge tw-badge-sky uppercase text-[10px]">
                  {rec.category}
                </span>
                <span className="text-[var(--muted)] flex items-center gap-1">
                  <MapPinIcon size={12} className="text-amber-600" /> {rec.distanceKm} km away
                </span>
              </div>

              <h4 className="font-extrabold text-sm text-[#131314] font-display">
                {rec.name}
              </h4>

              <p className="text-xs text-[var(--muted)] leading-relaxed line-clamp-2">
                {rec.description}
              </p>

              <div className="p-2.5 rounded-xl bg-white border border-[var(--border)] text-[11px] text-amber-900 font-medium">
                ✨ {rec.whyRecommended}
              </div>
            </div>

            <button
              onClick={() => handleAdd(rec)}
              className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                addedIds[rec.id]
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#131314] text-white hover:bg-black'
              }`}
            >
              {addedIds[rec.id] ? (
                <>
                  <CheckIcon size={14} />
                  <span>Added to Itinerary!</span>
                </>
              ) : (
                <>
                  <PlusIcon size={14} />
                  <span>Add to Trip</span>
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
