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
import WeatherAdvisorCard from '@/components/WeatherAdvisorCard';
import SmartRouteCard from '@/components/SmartRouteCard';
import TripWiseAIModal from '@/components/TripWiseAIModal';
import TripReminderBanner from '@/components/TripReminderBanner';
import { supabase } from '@/lib/supabase';

export default function TripViewPage({ params }: { params: { id: string } }) {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [activeDayIdx, setActiveDayIdx] = useState(0);
  const [planBActive, setPlanBActive] = useState<{ [dayIdx: number]: boolean }>({});
  const [selectedWhyActivity, setSelectedWhyActivity] = useState<Activity | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

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
        {/* Trip Reminder Banner */}
        <TripReminderBanner destination={trip.destination} startDateText="Soon" tripId={trip.id} />

        {/* Navigation Toolbar */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Back to My Trips
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAIModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-semibold flex items-center gap-2 transition shadow-md"
            >
              <Sparkles className="w-4 h-4 text-sky-200 animate-pulse" />
              <span>Ask TripWise AI</span>
            </button>

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
        </div>

        {/* TRIP HERO HEADER & WEATHER SUMMARY */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-700/80 relative overflow-hidden shadow-2xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider">
                <MapPin className="w-4 h-4" /> {trip.destination} • {trip.durationDays} Days Itinerary
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
                {trip.destination} Adaptive Plan
              </h1>
              <div className="flex flex-wrap gap-2 pt-1 text-xs">
                <span className="px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-slate-300 font-semibold flex items-center gap-1.5 shadow-sm">
                  <User className="w-3.5 h-3.5 text-purple-400" /> {trip.persona}
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-slate-300 font-semibold shadow-sm">
                  ⚡ Pace: {trip.pace}
                </span>
              </div>
            </div>

            {/* Weather & Trip Health Badges */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-inner">
              {/* Weather Summary */}
              {trip.weatherSummary && (
                <div className="pr-4 border-r border-slate-800">
                  <span className="text-[10px] uppercase font-extrabold text-slate-500 tracking-wider">Forecast</span>
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
                  <span className="text-[10px] uppercase font-extrabold text-slate-500 tracking-wider">Trip Health</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center font-extrabold text-emerald-400 text-sm shadow-sm">
                      {trip.healthScore.score}
                    </div>
                    <div>
                      <div className="font-bold text-white text-xs">
                        {trip.healthScore.label}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">Deterministic Score</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* DAY SELECTOR TABS */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
          {trip.days.map((d, idx) => (
            <button
              key={d.dayNumber}
              onClick={() => setActiveDayIdx(idx)}
              className={`px-5 py-3.5 rounded-2xl font-extrabold text-sm border whitespace-nowrap transition-all ${
                activeDayIdx === idx
                  ? 'bg-gradient-to-r from-brand-600 to-sky-500 text-white border-sky-400 shadow-lg shadow-sky-500/20 scale-[1.02]'
                  : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <span>Day {d.dayNumber}</span>
              <span className="text-xs opacity-80 font-normal">{d.weatherForecast.icon} {d.weatherForecast.tempC}°C</span>
            </button>
          ))}
        </div>

        {/* WEATHER ADVISOR & SMART ROUTE CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <WeatherAdvisorCard
            weatherSummary={trip.weatherSummary}
            activeDay={currentDay}
            onAskAI={() => setIsAIModalOpen(true)}
          />
          <SmartRouteCard
            activities={currentDay.activities}
            baseLat={trip.latitude}
            baseLng={trip.longitude}
            onApplyOptimization={(reordered) => {
              // Update local active day activities with optimized route sequence
              const updatedDays = [...trip.days];
              updatedDays[activeDayIdx].activities = reordered;
              setTrip({ ...trip, days: updatedDays });
            }}
          />
        </div>

        {/* WEATHER ADAPTATION & PLAN B BANNER */}
        <div className="glass-panel rounded-3xl p-5 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-inner">
                <Sun className="w-5.5 h-5.5" />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-base">
                  Day {currentDay.dayNumber} Weather Outlook: {currentDay.weatherForecast.condition}
                </h3>
                <p className="text-xs text-slate-400">
                  Precipitation Risk: <span className="font-bold text-sky-300">{currentDay.weatherForecast.rainProbability}%</span> • {currentDay.weatherForecast.note}
                </p>
              </div>
            </div>

            {/* 🔥 "🌧️ What if it rains?" Plan B Toggle Button */}
            <button
              onClick={() => togglePlanB(activeDayIdx)}
              className={`px-4 py-3 rounded-2xl font-extrabold text-xs flex items-center gap-2 transition-all border shadow-lg ${
                isCurrentPlanB
                  ? 'bg-purple-600 text-white border-purple-400 shadow-purple-500/25 scale-[1.02]'
                  : 'bg-slate-900/90 text-sky-300 border-sky-500/40 hover:bg-slate-800 hover:border-sky-400'
              }`}
            >
              <Umbrella className="w-4 h-4 text-purple-300" />
              <span>{isCurrentPlanB ? '🌧️ Plan B Active (Indoor Mode)' : '🌧️ What if it rains?'}</span>
            </button>
          </div>

          {/* Plan B Explanation Banner when active */}
          {isCurrentPlanB && (
            <div className="p-4.5 rounded-2xl bg-purple-950/40 border border-purple-500/30 text-xs space-y-2 animate-fadeIn shadow-inner">
              <div className="flex items-center gap-2 font-extrabold text-purple-300">
                <Info className="w-4 h-4 text-purple-400" />
                <span>Why did we change this?</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Rain risk is expected during peak afternoon hours ({currentDay.weatherForecast.rainProbability}% probability). Outdoor visits have been replaced with curated, climate-controlled indoor attractions.
              </p>
              <div className="flex items-center gap-2 text-[11px] text-purple-400 font-bold pt-1">
                <span>PLAN A (Outdoor)</span> → <span className="text-emerald-400">PLAN B (Indoor Experience)</span>
              </div>
            </div>
          )}
        </div>

        {/* ITINERARY ACTIVITIES TIMELINE */}
        <div className="space-y-4">
          <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
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
                  className={`glass-panel rounded-3xl p-6 border transition-all relative ${
                    isReplacedByPlanB
                      ? 'border-purple-500/50 bg-purple-950/20 shadow-purple-500/10'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-semibold">
                        <span className="px-3 py-1 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30 font-bold">
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
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
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
                      className="px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-bold flex items-center gap-1.5 shrink-0 transition shadow-sm"
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
          <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-3 shadow-xl">
            <h4 className="font-extrabold text-white text-base flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" /> Trip Health Factors ({trip.healthScore.score}/100)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {trip.healthScore.factors.map((f, i) => (
                <div key={i} className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 text-xs text-slate-300 font-medium">
                  {f.text}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* "WHY THIS ACTIVITY?" MODAL */}
      {selectedWhyActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-700/80 space-y-4 relative shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 font-extrabold text-white text-lg">
                <Sparkles className="w-5 h-5 text-sky-400 animate-pulse" /> Why this activity?
              </div>
              <button
                onClick={() => setSelectedWhyActivity(null)}
                className="text-slate-400 hover:text-white text-sm w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <h5 className="font-extrabold text-sky-300 text-base">{selectedWhyActivity.name}</h5>
              <p className="text-slate-300 text-sm leading-relaxed bg-slate-900/90 p-4.5 rounded-2xl border border-slate-800 shadow-inner">
                {selectedWhyActivity.whySelectedReason || `Selected based on your ${trip.persona} traveler persona and ${trip.pace} pacing preferences.`}
              </p>
              <div className="flex flex-wrap gap-2 text-xs text-slate-400 pt-1 font-medium">
                <span>Category: {selectedWhyActivity.category}</span>
                <span>•</span>
                <span>Outdoor: {selectedWhyActivity.isOutdoor ? 'Yes' : 'No'}</span>
                <span>•</span>
                <span>Weather Suitability: {selectedWhyActivity.weatherSuitability}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedWhyActivity(null)}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-sky-500 text-white font-extrabold text-sm shadow-md"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* TripWise AI Assistant Modal */}
      {trip && (
        <TripWiseAIModal
          trip={trip}
          isOpen={isAIModalOpen}
          onClose={() => setIsAIModalOpen(false)}
        />
      )}

      <Footer />
    </div>
  );
}
