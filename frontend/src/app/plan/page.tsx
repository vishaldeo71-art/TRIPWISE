'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Persona, TravelPace, Trip, FamilyMembers } from '@/types/trip';
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
  UserIcon
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
  const [customDaysInput, setCustomDaysInput] = useState('');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [persona, setPersona] = useState<Persona>('Explorer');
  const [pace, setPace] = useState<TravelPace>('Balanced');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['Culture', 'Food']);
  const [customPreferences, setCustomPreferences] = useState('');

  // Family Members State
  const [adultsCount, setAdultsCount] = useState(2);
  const [kidsCount, setKidsCount] = useState(2);

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

  // Calculate endDate helper
  const getEndDate = (start: string, days: number) => {
    const d = new Date(start || Date.now());
    d.setDate(d.getDate() + Math.max(0, days - 1));
    return d.toISOString().split('T')[0];
  };

  const handleCustomDaysChange = (val: string) => {
    setCustomDaysInput(val);
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= 30) {
      setDurationDays(parsed);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!destination.trim()) {
      setError('Please enter a destination city (e.g. Delhi, Tokyo, Paris, London).');
      return;
    }

    if (durationDays < 1 || durationDays > 30) {
      setError('Trip duration must be between 1 and 30 days.');
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

      // Step 2: Fetch Weather Forecast (handles 1-30 days)
      setLoadingStep(2);
      await new Promise((r) => setTimeout(r, 600));
      const forecasts = await fetchWeatherForecast(geoResult.lat, geoResult.lon, durationDays);

      // Family members & Travelers object
      const totalTravelers = adultsCount + kidsCount;
      const familyMembersObj: FamilyMembers = {
        adults: adultsCount,
        kids: kidsCount,
        total: totalTravelers,
      };

      const groupMembersTextStr = `${totalTravelers} Traveler${totalTravelers > 1 ? 's' : ''} (${adultsCount} Adult${adultsCount > 1 ? 's' : ''}${kidsCount > 0 ? `, ${kidsCount} Kid${kidsCount > 1 ? 's' : ''}` : ''})`;

      // Step 3: Generate Itinerary Engine
      setLoadingStep(3);
      await new Promise((r) => setTimeout(r, 600));
      const calculatedEndDate = getEndDate(startDate, durationDays);
      const { days, weatherSummary, healthScore } = generateItinerary(
        geoResult.name,
        durationDays,
        persona,
        pace,
        selectedInterests,
        forecasts,
        geoResult.lat,
        geoResult.lon,
        customPreferences,
        startDate,
        familyMembersObj,
        totalTravelers
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
        travelersCount: totalTravelers,
        startDate,
        endDate: calculatedEndDate,
        persona,
        pace,
        interests: selectedInterests,
        customPreferences: customPreferences.trim() || undefined,
        familyMembers: familyMembersObj,
        groupMembersText: groupMembersTextStr,
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
                Processing Open-Meteo weather forecasts, real place landmarks, custom requests, and nearest metro stations.
              </p>
            </div>

            <div className="max-w-md mx-auto space-y-2 pt-3 text-left text-xs font-semibold">
              <div className={`p-3.5 rounded-xl flex items-center gap-3 transition-all ${loadingStep >= 1 ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-[var(--surface)] text-[var(--muted)]'}`}>
                <CheckIcon size={16} className={loadingStep >= 1 ? 'text-emerald-600' : 'text-slate-400'} />
                <span>Geocoding coordinates for {destination}...</span>
              </div>
              <div className={`p-3.5 rounded-xl flex items-center gap-3 transition-all ${loadingStep >= 2 ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-[var(--surface)] text-[var(--muted)]'}`}>
                <CheckIcon size={16} className={loadingStep >= 2 ? 'text-emerald-600' : 'text-slate-400'} />
                <span>Analyzing forecast for {durationDays} Days...</span>
              </div>
              <div className={`p-3.5 rounded-xl flex items-center gap-3 transition-all ${loadingStep >= 3 ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-[var(--surface)] text-[var(--muted)]'}`}>
                <CheckIcon size={16} className={loadingStep >= 3 ? 'text-emerald-600' : 'text-slate-400'} />
                <span>Matching real {destination} places & custom preferences...</span>
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

            {/* Field: Trip Start & End Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block tw-eyebrow mb-2">
                  Trip Start Date 📅
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-[var(--border)] rounded-xl text-[#131314] text-xs font-bold focus:outline-none focus:border-[#131314] transition"
                />
              </div>
              <div>
                <label className="block tw-eyebrow mb-2">
                  Calculated End Date
                </label>
                <div className="w-full px-4 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[#131314] text-xs font-extrabold flex items-center justify-between">
                  <span>{getEndDate(startDate, durationDays)}</span>
                  <span className="text-[10px] text-amber-600 uppercase tracking-wide">({durationDays} {durationDays === 1 ? 'Day' : 'Days'})</span>
                </div>
              </div>
            </div>

            {/* Field 2: Duration Selector (Supports > 7 Days up to 30 Days) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="tw-eyebrow">
                  Trip Duration (1 to 30 Days)
                </label>
                <span className="tw-badge tw-badge-amber font-extrabold">
                  {durationDays} {durationDays === 1 ? 'Day' : 'Days'} Itinerary
                </span>
              </div>

              <div className="space-y-3">
                {/* Standard & Multi-Week Preset Buttons */}
                <div className="grid grid-cols-3 sm:grid-cols-9 gap-2">
                  {[
                    { days: 1, label: '1 Day' },
                    { days: 2, label: '2 Days' },
                    { days: 3, label: '3 Days' },
                    { days: 5, label: '5 Days' },
                    { days: 7, label: '7 Days (1 Wk)' },
                    { days: 10, label: '10 Days' },
                    { days: 14, label: '14 Days (2 Wks)' },
                    { days: 21, label: '21 Days (3 Wks)' },
                    { days: 30, label: '30 Days (1 Mo)' },
                  ].map((preset) => (
                    <button
                      key={preset.days}
                      type="button"
                      onClick={() => {
                        setDurationDays(preset.days);
                        setCustomDaysInput('');
                      }}
                      className={`py-2.5 px-2 rounded-xl font-extrabold text-[11px] border transition-all ${
                        durationDays === preset.days && !customDaysInput
                          ? 'bg-[#131314] text-white border-[#131314] shadow-sm'
                          : 'bg-[var(--surface)] text-[#131314] border-[var(--border)] hover:bg-[var(--surface-2)]'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Custom Days Direct Input */}
                <div className="flex items-center gap-3 p-3.5 bg-[var(--surface)] border border-[var(--border)] rounded-2xl">
                  <span className="text-xs font-bold text-[#131314] shrink-0">Custom Days (1–30):</span>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    placeholder="Enter custom days (e.g. 8, 12, 18, 25)"
                    value={customDaysInput}
                    onChange={(e) => handleCustomDaysChange(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-[var(--border)] rounded-xl text-xs font-bold text-[#131314] focus:outline-none focus:border-[#131314]"
                  />
                  {durationDays > 7 && (
                    <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-full shrink-0">
                      ✨ Extended {durationDays}-Day Plan
                    </span>
                  )}
                </div>

                {/* Informative banner for trips > 7 days */}
                {durationDays > 7 && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs font-medium text-emerald-900 space-y-1">
                    <div className="font-extrabold text-emerald-950 flex items-center gap-1.5 font-display">
                      <span>✨ Extended Trip Feature Active ({durationDays} Days)</span>
                    </div>
                    <p className="text-[11px] text-emerald-800 leading-relaxed">
                      TripWise AI structures multi-week itineraries into balanced weekly themes, neighborhood clusters, and 30-day projected weather forecasts to ensure a seamless long trip experience.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Field 3: Number of People Traveling (Travelers Count) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="tw-eyebrow">
                  Number of People Traveling (Travelers) 👥
                </label>
                <span className="tw-badge tw-badge-amber text-[10px] font-extrabold">
                  Total: {adultsCount + kidsCount} {adultsCount + kidsCount === 1 ? 'Person' : 'People'}
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-4">
                {/* Quick Presets */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { label: '👤 Solo (1)', adults: 1, kids: 0 },
                    { label: '👫 Duo (2)', adults: 2, kids: 0 },
                    { label: '👨‍👩‍👧 Family / Group (4)', adults: 2, kids: 2 },
                    { label: '👨‍👩‍👧‍👦 Large Party (6)', adults: 4, kids: 2 },
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setAdultsCount(preset.adults);
                        setKidsCount(preset.kids);
                      }}
                      className={`py-2.5 px-3 rounded-xl font-bold text-xs border transition-all ${
                        adultsCount === preset.adults && kidsCount === preset.kids
                          ? 'bg-[#131314] text-white border-[#131314] shadow-sm'
                          : 'bg-white text-[#131314] border-[var(--border)] hover:bg-slate-100'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Fine-grained Counter Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Adults Selector */}
                  <div className="bg-white p-3.5 rounded-xl border border-[var(--border)] flex items-center justify-between">
                    <div>
                      <div className="text-xs font-extrabold text-[#131314]">Adults (12+ yrs)</div>
                      <div className="text-[10px] text-[var(--muted)]">Primary travelers</div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => setAdultsCount(Math.max(1, adultsCount - 1))}
                        className="w-8 h-8 rounded-lg bg-[var(--surface)] border border-[var(--border)] font-bold text-sm flex items-center justify-center hover:bg-slate-200 transition text-[#131314]"
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-extrabold text-sm text-[#131314]">{adultsCount}</span>
                      <button
                        type="button"
                        onClick={() => setAdultsCount(adultsCount + 1)}
                        className="w-8 h-8 rounded-lg bg-[var(--surface)] border border-[var(--border)] font-bold text-sm flex items-center justify-center hover:bg-slate-200 transition text-[#131314]"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Children Selector */}
                  <div className="bg-white p-3.5 rounded-xl border border-[var(--border)] flex items-center justify-between">
                    <div>
                      <div className="text-xs font-extrabold text-[#131314]">Children / Kids (0-11 yrs)</div>
                      <div className="text-[10px] text-[var(--muted)]">Kid & stroller pacing</div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => setKidsCount(Math.max(0, kidsCount - 1))}
                        className="w-8 h-8 rounded-lg bg-[var(--surface)] border border-[var(--border)] font-bold text-sm flex items-center justify-center hover:bg-slate-200 transition text-[#131314]"
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-extrabold text-sm text-[#131314]">{kidsCount}</span>
                      <button
                        type="button"
                        onClick={() => setKidsCount(kidsCount + 1)}
                        className="w-8 h-8 rounded-lg bg-[var(--surface)] border border-[var(--border)] font-bold text-sm flex items-center justify-center hover:bg-slate-200 transition text-[#131314]"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-[var(--muted)] font-medium leading-relaxed">
                  💡 TripWise AI will customize daily attraction order, group transit options, rest breaks, and group dining options for your party of <strong>{adultsCount + kidsCount} traveler{adultsCount + kidsCount > 1 ? 's' : ''}</strong> ({adultsCount} Adult{adultsCount > 1 ? 's' : ''}{kidsCount > 0 ? `, ${kidsCount} Kid${kidsCount > 1 ? 's' : ''}` : ''}).
                </p>
              </div>
            </div>

            {/* Field 4: Traveler Persona */}
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

            {/* Field 5: Travel Pace */}
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
                TripWise AI will adapt activity recommendations, specific landmarks, and dining venues to match your exact requests.
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
