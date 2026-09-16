'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Persona, TravelPace, Trip } from '@/types/trip';
import { geocodeCity, fetchWeatherForecast, generateItinerary } from '@/lib/itineraryEngine';
import {
  SparklesIcon,
  MapPinIcon,
  CompassIcon,
  CheckIcon,
  ArrowRightIcon,
  LandmarkIcon,
  UtensilsIcon,
  CameraIcon,
  TreesIcon,
  ShoppingIcon,
  FlameIcon,
} from '@/components/Icons';
import { supabase } from '@/lib/supabase';

const PERSONAS: { id: Persona; label: string; desc: string; icon: string }[] = [
  { id: 'Backpacker', label: 'Backpacker', desc: 'Affordable, street markets, cultural walking tours', icon: '🎒' },
  { id: 'Family', label: 'Family', desc: 'Kid-friendly, relaxed pace, indoor safety fallbacks', icon: '👨‍👩‍👧‍👦' },
  { id: 'Luxury', label: 'Luxury', desc: 'Fine dining, premium comfort, private experiences', icon: '✨' },
  { id: 'Explorer', label: 'Explorer', desc: 'Hidden gems, local heritage, diverse activities', icon: '🧭' },
  { id: 'Solo Explorer', label: 'Solo Explorer', desc: 'Flexible pacing, photo spots, coffee & culture', icon: '📸' },
];

const PACES: { id: TravelPace; label: string; desc: string }[] = [
  { id: 'Relaxed', label: 'Relaxed', desc: '2 activities/day · Plenty of free time' },
  { id: 'Balanced', label: 'Balanced', desc: '3 activities/day · Optimal exploration' },
  { id: 'Packed', label: 'Packed', desc: '4 activities/day · Maximum sight-seeing' },
];

const INTERESTS = [
  { id: 'Culture', label: 'Culture', icon: LandmarkIcon },
  { id: 'Food', label: 'Food & Dining', icon: UtensilsIcon },
  { id: 'History', label: 'History', icon: CameraIcon },
  { id: 'Nature', label: 'Nature', icon: TreesIcon },
  { id: 'Shopping', label: 'Shopping', icon: ShoppingIcon },
  { id: 'Adventure', label: 'Adventure', icon: FlameIcon },
];

const LOADING_STEPS = [
  'Geocoding coordinates for destination...',
  'Fetching Open-Meteo precipitation data...',
  'Matching real places & metro stations...',
  'Applying Nearest-Neighbor route optimization...',
];

export default function CreateTripPage() {
  const [destination, setDestination] = useState('');
  const [durationDays, setDurationDays] = useState(3);
  const [persona, setPersona] = useState<Persona>('Explorer');
  const [pace, setPace] = useState<TravelPace>('Balanced');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['Culture', 'Food']);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const toggleInterest = (interest: string) => {
    setSelectedInterests(selectedInterests.includes(interest)
      ? selectedInterests.filter((i) => i !== interest)
      : [...selectedInterests, interest]);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!destination.trim()) {
      setError('Please enter a destination city (e.g. Delhi, Tokyo, Paris, London).');
      return;
    }

    setLoading(true);

    try {
      setLoadingStep(1);
      const geoResult = await geocodeCity(destination.trim());
      if (!geoResult) {
        setError(`Could not locate "${destination}". Please enter a valid city name.`);
        setLoading(false);
        return;
      }

      setLoadingStep(2);
      await new Promise((r) => setTimeout(r, 600));
      const forecasts = await fetchWeatherForecast(geoResult.lat, geoResult.lon, durationDays);

      setLoadingStep(3);
      await new Promise((r) => setTimeout(r, 600));
      const { days, weatherSummary, healthScore } = generateItinerary(
        geoResult.name, durationDays, persona, pace, selectedInterests, forecasts, geoResult.lat, geoResult.lon
      );

      setLoadingStep(4);
      await new Promise((r) => setTimeout(r, 500));

      const tripId = `trip-${Date.now()}`;
      const shareId = `share-${Math.random().toString(36).substring(2, 9)}`;

      const newTrip: Trip = {
        id: tripId, shareId, destination: geoResult.name,
        latitude: geoResult.lat, longitude: geoResult.lon,
        durationDays, persona, pace, interests: selectedInterests,
        weatherSummary, days, healthScore, createdAt: new Date().toISOString(),
      };

      let existing: Trip[] = [];
      try {
        const stored = localStorage.getItem('tripwise_saved_trips');
        if (stored) existing = JSON.parse(stored);
      } catch { /* empty */ }
      localStorage.setItem('tripwise_saved_trips', JSON.stringify([newTrip, ...existing]));

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('trips').insert({
            id: newTrip.id, user_id: user.id, share_id: newTrip.shareId,
            destination: newTrip.destination, latitude: newTrip.latitude, longitude: newTrip.longitude,
            duration: newTrip.durationDays, persona: newTrip.persona, travel_pace: newTrip.pace,
            interests: newTrip.interests, itinerary: newTrip.days,
            weather_summary: newTrip.weatherSummary, trip_score: newTrip.healthScore,
          });
        }
      } catch { console.log('Saved to LocalStorage'); }

      window.location.href = `/trip/${shareId}`;
    } catch (err: unknown) {
      setError((err as Error)?.message || 'An error occurred while generating your trip.');
      setLoading(false);
    }
  };

  const sectionLabelClass = "block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2.5";

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F5F0] dark:bg-[#07090F] text-slate-900 dark:text-[#F0F4FF] transition-colors">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-10 space-y-3">
          <div className="tw-badge tw-badge-amber inline-flex mx-auto">
            <SparklesIcon size={11} />
            Weather & Persona Engine
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Build Your Adaptive Trip
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            Enter your destination and we&apos;ll construct a weather-adapted, destination-specific itinerary.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-start gap-3 animate-fade-in-up">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Form card */}
        <div className="tw-card p-6 sm:p-9 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-amber-400/8 dark:bg-amber-400/5 blur-3xl pointer-events-none" />

          {loading ? (
            /* Loading state */
            <div className="py-10 text-center space-y-6 relative">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto">
                <CompassIcon size={28} className="animate-spin-smooth text-amber-500" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Constructing Your Itinerary…</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                  Processing forecasts, real landmarks, and metro routing for {destination}.
                </p>
              </div>
              <div className="max-w-md mx-auto space-y-2.5 text-left">
                {LOADING_STEPS.map((step, i) => {
                  const active = loadingStep > i;
                  return (
                    <div
                      key={i}
                      className={`p-3 rounded-xl flex items-center gap-3 text-xs font-semibold transition-all ${
                        active
                          ? 'bg-amber-400/10 border border-amber-500/20 text-amber-800 dark:text-amber-300'
                          : 'text-slate-400 border border-transparent'
                      }`}
                    >
                      <CheckIcon size={15} className={active ? 'text-amber-500' : 'text-slate-300 dark:text-slate-600'} />
                      <span>{step.replace('destination', destination || 'destination')}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <form onSubmit={handleGenerate} className="space-y-8 relative">

              {/* Destination */}
              <div>
                <label className={sectionLabelClass}>Destination City</label>
                <div className="relative">
                  <div className="absolute left-4 top-3.5 text-amber-500">
                    <MapPinIcon size={19} />
                  </div>
                  <input
                    type="text"
                    required
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g. Delhi, London, Paris, Tokyo, New York"
                    className="tw-input w-full pl-12 pr-4 py-3.5 rounded-2xl text-sm font-medium placeholder-slate-400"
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
                  Supports 50+ global cities with curated landmarks and metro routing.
                </p>
              </div>

              {/* Duration */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <label className={sectionLabelClass} style={{ marginBottom: 0 }}>Trip Duration</label>
                  <span className="tw-badge tw-badge-amber">{durationDays} {durationDays === 1 ? 'Day' : 'Days'}</span>
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setDurationDays(num)}
                      className={`py-3 rounded-xl font-extrabold text-xs border transition-all ${
                        durationDays === num
                          ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-md scale-[1.04]'
                          : 'bg-stone-100 dark:bg-white/[0.04] border-stone-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-400 hover:border-amber-400/40 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      {num}{num > 1 ? 'D' : ''}
                    </button>
                  ))}
                </div>
              </div>

              {/* Persona */}
              <div>
                <label className={sectionLabelClass}>Traveler Persona</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {PERSONAS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPersona(p.id)}
                      className={`p-4 rounded-2xl border text-left transition-all flex flex-col ${
                        persona === p.id
                          ? 'tw-selected bg-amber-400/10 shadow-md scale-[1.02]'
                          : 'bg-stone-100 dark:bg-white/[0.03] border-stone-200 dark:border-white/[0.07] hover:border-amber-400/30 hover:bg-white dark:hover:bg-white/[0.06]'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-lg">{p.icon}</span>
                        <span className="font-extrabold text-xs text-slate-900 dark:text-slate-100">{p.label}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{p.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Pace */}
              <div>
                <label className={sectionLabelClass}>Travel Pace</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {PACES.map((pc) => (
                    <button
                      key={pc.id}
                      type="button"
                      onClick={() => setPace(pc.id)}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        pace === pc.id
                          ? 'tw-selected bg-amber-400/10 shadow-md scale-[1.02]'
                          : 'bg-stone-100 dark:bg-white/[0.03] border-stone-200 dark:border-white/[0.07] hover:border-amber-400/30 hover:bg-white dark:hover:bg-white/[0.06]'
                      }`}
                    >
                      <div className="font-extrabold text-xs text-slate-900 dark:text-slate-100 mb-0.5">{pc.label}</div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{pc.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Interests */}
              <div>
                <label className={sectionLabelClass}>Travel Interests</label>
                <div className="flex flex-wrap gap-2.5">
                  {INTERESTS.map((item) => {
                    const IconComp = item.icon;
                    const isSelected = selectedInterests.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleInterest(item.id)}
                        className={`px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                          isSelected
                            ? 'tw-selected bg-sky-500/12 border-sky-500/35 text-sky-800 dark:text-sky-300 shadow-sm'
                            : 'bg-stone-100 dark:bg-white/[0.03] border-stone-200 dark:border-white/[0.07] text-slate-600 dark:text-slate-400 hover:border-sky-400/30 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                      >
                        <IconComp size={13} className="text-sky-500 dark:text-sky-400" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* CTA */}
              <button
                type="submit"
                className="tw-btn-primary w-full py-4 rounded-2xl text-base flex items-center justify-center gap-2.5"
              >
                <SparklesIcon size={18} />
                <span>Generate Adaptive Itinerary</span>
                <ArrowRightIcon size={17} />
              </button>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
