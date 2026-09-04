'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Trip, Activity } from '@/types/trip';
import {
  Compass,
  MapPin,
  Calendar,
  Sun,
  CloudRain,
  Share2,
  Check,
  Zap,
  HelpCircle,
  ArrowLeft,
  Info,
  ShieldCheck,
  User,
  Clock,
  Sparkles,
  RefreshCw,
  Umbrella
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function TripViewPage({ params }: { params: { id: string } }) {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [activeDayIdx, setActiveDayIdx] = useState(0);
  const [planBActive, setPlanBActive] = useState<{ [dayIdx: number]: boolean }>({});
  const [selectedWhyActivity, setSelectedWhyActivity] = useState<Activity | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTripData();
  }, [params.id]);

  const loadTripData = async () => {
    setLoading(true);

    // Check LocalStorage
    try {
      const stored = localStorage.getItem('tripwise_saved_trips');
      if (stored) {
        const parsed: Trip[] = JSON.parse(stored);
        const match = parsed.find((t) => t.id === params.id || t.shareId === params.id);
        if (match) {
          setTrip(match);
          setLoading(false);
          return;
        }
      }
    } catch (e) {}

    // Check Supabase database
    try {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .or(`id.eq.${params.id},share_id.eq.${params.id}`)
        .single();

      if (!error && data) {
        const fetchedTrip: Trip = {
          id: data.id,
          shareId: data.share_id,
          destination: data.destination,
          latitude: data.latitude,
          longitude: data.longitude,
          durationDays: data.duration,
          persona: data.persona,
          pace: data.travel_pace,
          interests: data.interests || [],
          weatherSummary: data.weather_summary,
          days: data.itinerary,
          healthScore: data.trip_score,
          createdAt: data.created_at,
        };
        setTrip(fetchedTrip);
        setLoading(false);
        return;
      }
    } catch (e) {}

    setLoading(false);
  };

  const togglePlanB = (dayIdx: number) => {
    setPlanBActive((prev) => ({
      ...prev,
      [dayIdx]: !prev[dayIdx],
    }));
  };

  const copyShareUrl = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-4">
            <Compass className="w-10 h-10 text-sky-400 animate-spin mx-auto" />
            <p className="text-slate-400 text-sm">Loading your itinerary...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
        <Navbar />
        <main className="flex-1 max-w-xl mx-auto px-4 py-16 text-center">
          <div className="glass-card rounded-3xl p-8 border border-slate-800 space-y-4">
            <h2 className="text-2xl font-bold text-white">Trip Not Found</h2>
            <p className="text-slate-400 text-sm">
              The itinerary you requested does not exist or may have been removed.
            </p>
            <Link
              href="/plan"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 text-white font-bold text-sm"
            >
              Plan a New Trip
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const currentDay = trip.days[activeDayIdx] || trip.days[0];
  const isCurrentPlanB = !!planBActive[activeDayIdx];

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Navigation Toolbar */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Back to My Trips
          </Link>

          <button
            onClick={copyShareUrl}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold flex items-center gap-2 transition"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-sky-400" />
                <span>Share Trip</span>
              </>
            )}
          </button>
        </div>

        {/* TRIP HERO HEADER & WEATHER SUMMARY */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 uppercase tracking-wider">
                <MapPin className="w-4 h-4" /> {trip.destination} • {trip.durationDays} Days Itinerary
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
                {trip.destination} Adaptive Plan
              </h1>
              <div className="flex flex-wrap gap-2 pt-1 text-xs">
                <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 font-medium flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-purple-400" /> {trip.persona}
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 font-medium">
                  ⚡ Pace: {trip.pace}
                </span>
              </div>
            </div>

            {/* Weather & Trip Health Badges */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
              {/* Weather Summary */}
              {trip.weatherSummary && (
                <div className="pr-4 border-r border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Forecast</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-2xl">{currentDay.weatherForecast.icon}</span>
                    <div>
                      <div className="font-extrabold text-white text-base">
                        {currentDay.weatherForecast.tempC}°C
                      </div>
                      <div className="text-xs text-slate-400">
                        {currentDay.weatherForecast.condition}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Trip Health Score */}
              {trip.healthScore && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Trip Health</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-extrabold text-emerald-400 text-sm">
                      {trip.healthScore.score}
                    </div>
                    <div>
                      <div className="font-bold text-white text-xs">
                        {trip.healthScore.label}
                      </div>
                      <div className="text-[10px] text-slate-400">Deterministic Score</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* DAY SELECTOR TABS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {trip.days.map((d, idx) => (
            <button
              key={d.dayNumber}
              onClick={() => setActiveDayIdx(idx)}
              className={`px-5 py-3 rounded-2xl font-bold text-sm border whitespace-nowrap transition flex items-center gap-2 ${
                activeDayIdx === idx
                  ? 'bg-brand-600 text-white border-brand-400 shadow-lg shadow-brand-500/20'
                  : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              <span>Day {d.dayNumber}</span>
              <span className="text-xs opacity-75">{d.weatherForecast.icon} {d.weatherForecast.tempC}°C</span>
            </button>
          ))}
        </div>

        {/* WEATHER ADAPTATION & PLAN B BANNER */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">
                  Day {currentDay.dayNumber} Weather Outlook: {currentDay.weatherForecast.condition}
                </h3>
                <p className="text-xs text-slate-400">
                  Precipitation Risk: <span className="font-semibold text-slate-200">{currentDay.weatherForecast.rainProbability}%</span> • {currentDay.weatherForecast.note}
                </p>
              </div>
            </div>

            {/* 🔥 "🌧️ What if it rains?" Plan B Toggle Button */}
            <button
              onClick={() => togglePlanB(activeDayIdx)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition border shadow-md ${
                isCurrentPlanB
                  ? 'bg-purple-600 text-white border-purple-400 shadow-purple-500/20'
                  : 'bg-slate-900 text-sky-300 border-sky-500/40 hover:bg-slate-800'
              }`}
            >
              <Umbrella className="w-4 h-4 text-purple-300" />
              <span>{isCurrentPlanB ? '🌧️ Plan B Active (Indoor Mode)' : '🌧️ What if it rains?'}</span>
            </button>
          </div>

          {/* Plan B Explanation Banner when active */}
          {isCurrentPlanB && (
            <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs space-y-2 animate-fadeIn">
              <div className="flex items-center gap-2 font-bold text-purple-300">
                <Info className="w-4 h-4 text-purple-400" />
                <span>Why did we change this?</span>
              </div>
              <p className="text-slate-300">
                Rain risk is expected during peak afternoon hours ({currentDay.weatherForecast.rainProbability}% probability). Outdoor visits have been replaced with curated, climate-controlled indoor attractions.
              </p>
              <div className="flex items-center gap-2 text-[11px] text-purple-400 font-semibold pt-1">
                <span>PLAN A (Outdoor)</span> → <span className="text-emerald-400">PLAN B (Indoor Experience)</span>
              </div>
            </div>
          )}
        </div>

        {/* ITINERARY ACTIVITIES TIMELINE */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-sky-400" /> Scheduled Activities ({isCurrentPlanB ? 'Plan B Indoor Mode' : 'Plan A Original'})
          </h3>

          <div className="grid grid-cols-1 gap-4">
            {currentDay.activities.map((act, actIdx) => {
              const displayActivityName = isCurrentPlanB && act.isOutdoor && act.indoorAlternative
                ? act.indoorAlternative.name
                : act.name;

              const displayDescription = isCurrentPlanB && act.isOutdoor && act.indoorAlternative
                ? act.indoorAlternative.description
                : act.description;

              const isReplacedByPlanB = isCurrentPlanB && act.isOutdoor && act.indoorAlternative;

              return (
                <div
                  key={act.id}
                  className={`glass-card rounded-2xl p-6 border transition relative ${
                    isReplacedByPlanB
                      ? 'border-purple-500/40 bg-purple-950/20'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-semibold">
                        <span className="px-2.5 py-0.5 rounded-full bg-brand-500/10 text-sky-400 border border-brand-500/20">
                          {act.bestTime}
                        </span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-400">{act.durationMinutes} min</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-400 font-normal">{act.estimatedTravelTime}</span>
                      </div>

                      <h4 className="text-xl font-bold text-white flex items-center gap-2">
                        {displayActivityName}
                        {isReplacedByPlanB && (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            Indoor Plan B
                          </span>
                        )}
                      </h4>

                      <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                        {displayDescription}
                      </p>
                    </div>

                    {/* "Why this?" Button */}
                    <button
                      onClick={() => setSelectedWhyActivity(act)}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1.5 shrink-0 transition"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
                      <span>Why this?</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* TRIP HEALTH FACTORS */}
        {trip.healthScore && (
          <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-3">
            <h4 className="font-bold text-white text-base flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" /> Trip Health Factors ({trip.healthScore.score}/100)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {trip.healthScore.factors.map((f, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
                  {f.text}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* "WHY THIS ACTIVITY?" MODAL */}
      {selectedWhyActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="glass-card rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-800 space-y-4 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 font-bold text-white text-lg">
                <Sparkles className="w-5 h-5 text-sky-400" /> Why this activity?
              </div>
              <button
                onClick={() => setSelectedWhyActivity(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <h5 className="font-bold text-sky-300 text-base">{selectedWhyActivity.name}</h5>
              <p className="text-slate-300 text-sm leading-relaxed bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
                {selectedWhyActivity.whySelectedReason || `Selected based on your ${trip.persona} traveler persona and ${trip.pace} pacing preferences.`}
              </p>
              <div className="flex flex-wrap gap-2 text-xs text-slate-400 pt-1">
                <span>Category: {selectedWhyActivity.category}</span>
                <span>•</span>
                <span>Outdoor: {selectedWhyActivity.isOutdoor ? 'Yes' : 'No'}</span>
                <span>•</span>
                <span>Weather Suitability: {selectedWhyActivity.weatherSuitability}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedWhyActivity(null)}
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-bold text-sm"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
