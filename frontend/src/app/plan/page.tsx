'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Persona, TravelPace, Trip } from '@/types/trip';
import { geocodeCity, fetchWeatherForecast, generateItinerary } from '@/lib/itineraryEngine';
import {
  Compass,
  MapPin,
  Calendar,
  User,
  Zap,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Sun,
  Camera,
  Utensils,
  Landmark,
  Trees,
  ShoppingBag,
  Flame
} from 'lucide-react';
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
  { id: 'Culture', label: 'Culture', icon: Landmark },
  { id: 'Food', label: 'Food & Dining', icon: Utensils },
  { id: 'History', label: 'History', icon: Camera },
  { id: 'Nature', label: 'Nature', icon: Trees },
  { id: 'Shopping', label: 'Shopping', icon: ShoppingBag },
  { id: 'Adventure', label: 'Adventure', icon: Flame },
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
      await new Promise((r) => setTimeout(r, 600)); // Smooth UI transition
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
        forecasts
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

      // Redirect to view trip
      window.location.href = `/trip/${shareId}`;
    } catch (err: any) {
      setError(err?.message || 'An error occurred while generating your trip.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-sky-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Weather & Persona Engine
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white">
            Build Your <span className="gradient-text">Adaptive Trip</span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">
            Tell us where you want to go and we&apos;ll build an itinerary that adapts to the weather.
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Main Form */}
        <div className="glass-card rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-2xl relative">
          {loading ? (
            /* Loading Experience Modal */
            <div className="py-12 text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-brand-600/20 border border-brand-500/40 flex items-center justify-center mx-auto text-sky-400 animate-bounce">
                <Compass className="w-8 h-8 animate-spin" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-extrabold text-white">Generating Your Itinerary...</h3>
                <p className="text-sm text-slate-400 max-w-md mx-auto">
                  Connecting to weather APIs and structuring your persona recommendations.
                </p>
              </div>

              {/* Progress Steps */}
              <div className="max-w-md mx-auto space-y-3 pt-4 text-left text-xs font-semibold">
                <div className={`p-3 rounded-xl flex items-center gap-3 transition ${loadingStep >= 1 ? 'bg-brand-500/10 text-sky-300 border border-brand-500/30' : 'text-slate-600'}`}>
                  <CheckCircle2 className={`w-4 h-4 ${loadingStep >= 1 ? 'text-sky-400' : 'text-slate-700'}`} />
                  <span>Finding places in {destination}...</span>
                </div>
                <div className={`p-3 rounded-xl flex items-center gap-3 transition ${loadingStep >= 2 ? 'bg-brand-500/10 text-sky-300 border border-brand-500/30' : 'text-slate-600'}`}>
                  <CheckCircle2 className={`w-4 h-4 ${loadingStep >= 2 ? 'text-sky-400' : 'text-slate-700'}`} />
                  <span>Checking weather forecast & rain probability...</span>
                </div>
                <div className={`p-3 rounded-xl flex items-center gap-3 transition ${loadingStep >= 3 ? 'bg-brand-500/10 text-sky-300 border border-brand-500/30' : 'text-slate-600'}`}>
                  <CheckCircle2 className={`w-4 h-4 ${loadingStep >= 3 ? 'text-sky-400' : 'text-slate-700'}`} />
                  <span>Building {persona} itinerary & Plan B backups...</span>
                </div>
                <div className={`p-3 rounded-xl flex items-center gap-3 transition ${loadingStep >= 4 ? 'bg-brand-500/10 text-sky-300 border border-brand-500/30' : 'text-slate-600'}`}>
                  <CheckCircle2 className={`w-4 h-4 ${loadingStep >= 4 ? 'text-sky-400' : 'text-slate-700'}`} />
                  <span>Optimizing daily activities & travel pace...</span>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleGenerate} className="space-y-8">
              {/* Field 1: Destination */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Destination City
                </label>
                <div className="relative">
                  <MapPin className="w-5 h-5 text-sky-400 absolute left-4 top-3.5" />
                  <input
                    type="text"
                    required
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g. Delhi, Tokyo, Paris, London, Goa"
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-500 text-base focus:outline-none focus:border-brand-500 transition shadow-inner"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1.5">
                  Enter any global city. Geocoding will resolve coordinates automatically.
                </p>
              </div>

              {/* Field 2: Duration */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Trip Duration
                  </label>
                  <span className="text-xs font-bold text-brand-300 px-2.5 py-0.5 rounded-full bg-brand-500/10 border border-brand-500/30">
                    {durationDays} {durationDays === 1 ? 'Day' : 'Days'}
                  </span>
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setDurationDays(num)}
                      className={`py-2.5 rounded-xl font-bold text-sm border transition ${
                        durationDays === num
                          ? 'bg-brand-600 text-white border-brand-400 shadow-md shadow-brand-500/20'
                          : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {num} {num === 1 ? 'Day' : 'D'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Field 3: Traveler Persona */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Traveler Persona
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {PERSONAS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPersona(p.id)}
                      className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between ${
                        persona === p.id
                          ? 'bg-brand-500/10 border-brand-500/50 text-white shadow-lg shadow-brand-500/10'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{p.icon}</span>
                        <span className="font-bold text-sm text-slate-200">{p.label}</span>
                      </div>
                      <p className="text-xs text-slate-500 leading-snug">{p.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Field 4: Travel Pace */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Travel Pace
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {PACES.map((pc) => (
                    <button
                      key={pc.id}
                      type="button"
                      onClick={() => setPace(pc.id)}
                      className={`p-3.5 rounded-2xl border text-left transition ${
                        pace === pc.id
                          ? 'bg-sky-500/10 border-sky-500/50 text-white'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-bold text-sm text-slate-200 mb-0.5">{pc.label}</div>
                      <p className="text-xs text-slate-500">{pc.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Field 5: Optional Interests */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Travel Interests (Select all that apply)
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
                        className={`px-4 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 transition ${
                          isSelected
                            ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <IconComp className="w-3.5 h-3.5" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Generate CTA Button */}
              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-600 via-sky-500 to-indigo-600 hover:from-brand-500 hover:to-sky-400 text-white font-extrabold text-lg shadow-xl shadow-brand-500/25 transition hover:scale-[1.01] flex items-center justify-center gap-3"
              >
                <Sparkles className="w-5 h-5" />
                <span>Generate My Adaptive Itinerary</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
