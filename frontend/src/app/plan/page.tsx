'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
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
  FlameIcon
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
  { id: 'Relaxed', label: 'Relaxed', desc: '2 activities/day • Plenty of free time' },
  { id: 'Balanced', label: 'Balanced', desc: '3 activities/day • Optimal exploration' },
  { id: 'Packed', label: 'Packed', desc: '4 activities/day • Maximum sight-seeing' },
];

const INTERESTS = [
  { id: 'Culture', label: 'Culture', icon: LandmarkIcon },
  { id: 'Food', label: 'Food & Dining', icon: UtensilsIcon },
  { id: 'History', label: 'History', icon: CameraIcon },
  { id: 'Nature', label: 'Nature', icon: TreesIcon },
  { id: 'Shopping', label: 'Shopping', icon: ShoppingIcon },
  { id: 'Adventure', label: 'Adventure', icon: FlameIcon },
];

function PlanTripForm() {
  const searchParams = useSearchParams();
  const initialCity = searchParams?.get('city') || '';

  const [destination, setDestination] = useState(initialCity);
  const [durationDays, setDurationDays] = useState(3);
  const [persona, setPersona] = useState<Persona>('Explorer');
  const [pace, setPace] = useState<TravelPace>('Balanced');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['Culture', 'Food']);
  const [customPreferences, setCustomPreferences] = useState('');

  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialCity && !destination) {
      setDestination(initialCity);
    }
  }, [initialCity]);

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
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
      // Step 1: Geocoding
      setLoadingStep(1);
      const geoResult = await geocodeCity(destination.trim());

      if (!geoResult) {
        setError(`Could not locate "${destination}". Please enter a valid city name (e.g., Delhi, Paris, Tokyo).`);
        setLoading(false);
        return;
      }

      // Step 2: Fetch Weather Forecast
      setLoadingStep(2);
      await new Promise((r) => setTimeout(r, 600));
      const forecasts = await fetchWeatherForecast(geoResult.lat, geoResult.lon, durationDays);

      // Step 3: Generate Itinerary Engine
      setLoadingStep(3);
      await new Promise((r) => setTimeout(r, 600));
      const { days, weatherSummary, healthScore } = generateItinerary(
        geoResult.name,
        durationDays,
        persona,
        pace,
        selectedInterests,
        forecasts,
        geoResult.lat,
        geoResult.lon,
        customPreferences
      );

      // Step 4: Finalize & Save
      setLoadingStep(4);
      await new Promise((r) => setTimeout(r, 500));

      const tripId = `trip-${Date.now()}`;
      const shareId = `share-${Math.random().toString(36).substring(2, 9)}`;

      const newTrip: Trip = {
        id: tripId,
        shareId: shareId,
        destination: geoResult.name,
        latitude: geoResult.lat,
        longitude: geoResult.lon,
        durationDays,
        persona,
        pace,
        interests: selectedInterests,
        customPreferences: customPreferences.trim() || undefined,
        weatherSummary,
        days,
        healthScore,
        createdAt: new Date().toISOString(),
      };

      // Save to LocalStorage
      let existing: Trip[] = [];
      try {
        const stored = localStorage.getItem('tripwise_saved_trips');
        if (stored) existing = JSON.parse(stored);
      } catch (e) {}

      localStorage.setItem('tripwise_saved_trips', JSON.stringify([newTrip, ...existing]));

      // Save to Supabase if logged in
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('trips').insert({
            id: newTrip.id,
            user_id: user.id,
            share_id: newTrip.shareId,
            destination: newTrip.destination,
            latitude: newTrip.latitude,
            longitude: newTrip.longitude,
            duration: newTrip.durationDays,
            persona: newTrip.persona,
            travel_pace: newTrip.pace,
            interests: newTrip.interests,
            itinerary: newTrip.days,
            weather_summary: newTrip.weatherSummary,
            trip_score: newTrip.healthScore,
          });
        }
      } catch (e) {
        console.log('Saved to LocalStorage');
      }

      window.location.href = `/trip/${shareId}`;
    } catch (err: any) {
      setError(err?.message || 'An error occurred while generating your trip.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Title Header */}
      <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
        <span className="tw-badge tw-badge-amber">
          <SparklesIcon size={14} className="text-amber-600" /> Real Places & Weather Engine
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold font-display text-[#131314]">
          Create Adaptive Itinerary
        </h1>
        <p className="text-[var(--muted)] text-xs sm:text-sm">
          Select your destination city to build a custom travel plan with Open-Meteo weather intelligence and nearest metro routing.
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-3">
          <span className="text-base">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Main Form Container */}
      <div className="tw-card p-6 sm:p-10 relative overflow-hidden">
        {loading ? (
          /* Animated Step Progress Loader */
          <div className="py-12 text-center space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center mx-auto text-[#131314] shadow-md">
              <CompassIcon size={28} className="animate-spin text-[#131314]" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-extrabold font-display text-[#131314]">Constructing Itinerary...</h3>
              <p className="text-xs text-[var(--muted)] max-w-md mx-auto">
                Processing Open-Meteo weather forecasts, real place landmarks, and nearest metro stations.
              </p>
            </div>

            <div className="max-w-md mx-auto space-y-2 pt-3 text-left text-xs font-semibold">
              <div className={`p-3.5 rounded-xl flex items-center gap-3 transition-all ${loadingStep >= 1 ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-[var(--surface)] text-[var(--muted)]'}`}>
                <CheckIcon size={16} className={loadingStep >= 1 ? 'text-emerald-600' : 'text-slate-400'} />
                <span>Geocoding coordinates for {destination}...</span>
              </div>
              <div className={`p-3.5 rounded-xl flex items-center gap-3 transition-all ${loadingStep >= 2 ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-[var(--surface)] text-[var(--muted)]'}`}>
                <CheckIcon size={16} className={loadingStep >= 2 ? 'text-emerald-600' : 'text-slate-400'} />
                <span>Analyzing rain risk & Open-Meteo weather forecast...</span>
              </div>
              <div className={`p-3.5 rounded-xl flex items-center gap-3 transition-all ${loadingStep >= 3 ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-[var(--surface)] text-[var(--muted)]'}`}>
                <CheckIcon size={16} className={loadingStep >= 3 ? 'text-emerald-600' : 'text-slate-400'} />
                <span>Matching real {destination} places & metro transit...</span>
              </div>
              <div className={`p-3.5 rounded-xl flex items-center gap-3 transition-all ${loadingStep >= 4 ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-[var(--surface)] text-[var(--muted)]'}`}>
                <CheckIcon size={16} className={loadingStep >= 4 ? 'text-emerald-600' : 'text-slate-400'} />
                <span>Applying Nearest-Neighbor route optimization...</span>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleGenerate} className="space-y-8">
            {/* Field 1: Destination */}
            <div>
              <label className="block tw-eyebrow mb-2">
                Destination City
              </label>
              <div className="relative">
                <div className="absolute left-4 top-3.5 text-amber-600">
                  <MapPinIcon size={20} />
                </div>
                <input
                  type="text"
                  required
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Delhi, London, Paris, Tokyo, New York"
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-[var(--border)] rounded-xl text-[#131314] placeholder:text-[var(--muted)] text-sm font-semibold focus:outline-none focus:border-[#131314] transition"
                />
              </div>
              <p className="text-[11px] text-[var(--muted)] mt-1.5 font-medium">
                Supports Delhi, Tokyo, Paris, London, Kyoto, New York, Rome, Barcelona and major global destinations.
              </p>
            </div>

            {/* Field 2: Duration */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="tw-eyebrow">
                  Trip Duration
                </label>
                <span className="tw-badge tw-badge-amber">
                  {durationDays} {durationDays === 1 ? 'Day' : 'Days'}
                </span>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setDurationDays(num)}
                    className={`py-3 rounded-xl font-bold text-xs border transition-all ${
                      durationDays === num
                        ? 'bg-[#131314] text-white border-[#131314] shadow-sm'
                        : 'bg-[var(--surface)] text-[#131314] border-[var(--border)] hover:bg-[var(--surface-2)]'
                    }`}
                  >
                    {num} {num === 1 ? 'Day' : 'D'}
                  </button>
                ))}
              </div>
            </div>

            {/* Field 3: Traveler Persona */}
            <div>
              <label className="block tw-eyebrow mb-2">
                Traveler Persona
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {PERSONAS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPersona(p.id)}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      persona === p.id
                        ? 'bg-[#131314] text-white border-[#131314] shadow-sm'
                        : 'bg-[var(--surface)] border-[var(--border)] text-[#131314] hover:bg-[var(--surface-2)]'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{p.icon}</span>
                      <span className="font-extrabold text-xs font-display">{p.label}</span>
                    </div>
                    <p className={`text-[11px] leading-relaxed ${persona === p.id ? 'text-slate-300' : 'text-[var(--muted)]'}`}>
                      {p.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Field 4: Travel Pace */}
            <div>
              <label className="block tw-eyebrow mb-2">
                Travel Pace
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {PACES.map((pc) => (
                  <button
                    key={pc.id}
                    type="button"
                    onClick={() => setPace(pc.id)}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      pace === pc.id
                        ? 'bg-[#131314] text-white border-[#131314] shadow-sm'
                        : 'bg-[var(--surface)] border-[var(--border)] text-[#131314] hover:bg-[var(--surface-2)]'
                    }`}
                  >
                    <div className="font-extrabold text-xs font-display mb-0.5">{pc.label}</div>
                    <p className={`text-[11px] ${pace === pc.id ? 'text-slate-300' : 'text-[var(--muted)]'}`}>
                      {pc.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Field 5: Optional Interests */}
            <div>
              <label className="block tw-eyebrow mb-2">
                Travel Interests
              </label>
              <div className="flex flex-wrap gap-2.5">
                {INTERESTS.map((item) => {
                  const IconComp = item.icon;
                  const isSelected = selectedInterests.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleInterest(item.id)}
                      className={`px-4 py-2.5 rounded-full border text-xs font-bold flex items-center gap-2 transition-all ${
                        isSelected
                          ? 'bg-[#131314] text-white border-[#131314]'
                          : 'bg-[var(--surface)] border-[var(--border)] text-[var(--muted)] hover:text-[#131314]'
                      }`}
                    >
                      <IconComp size={14} className={isSelected ? 'text-amber-400' : 'text-[var(--muted)]'} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Field 6: Custom Requirements / Special Preferences */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="tw-eyebrow">
                  Custom Preferences & Special Requirements (Optional)
                </label>
                <span className="tw-badge tw-badge-amber text-[10px]">
                  ✨ AI Customized
                </span>
              </div>
              <textarea
                rows={3}
                value={customPreferences}
                onChange={(e) => setCustomPreferences(e.target.value)}
                placeholder="e.g. Include pure vegetarian / Halal dining spots, wheelchair accessible places, pet-friendly cafes, photography spots, budget under ₹10k, or specific landmarks like Qutub Minar..."
                className="w-full p-4 bg-white border border-[var(--border)] rounded-2xl text-xs text-[#131314] placeholder:text-[var(--muted)] font-medium focus:outline-none focus:border-[#131314] transition leading-relaxed"
              />
              <p className="text-[11px] text-[var(--muted)] mt-1.5 font-medium">
                TripWise AI will adapt activity recommendations and dining venues to match your exact requests.
              </p>
            </div>

            {/* Generate CTA Button */}
            <button
              type="submit"
              className="tw-btn-primary w-full !py-4 text-sm"
            >
              <SparklesIcon size={18} />
              <span>Generate Adaptive Itinerary</span>
              <ArrowRightIcon size={18} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function CreateTripPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-[#131314] font-sans">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<div className="py-20 text-center text-xs font-bold">Loading planner...</div>}>
          <PlanTripForm />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
