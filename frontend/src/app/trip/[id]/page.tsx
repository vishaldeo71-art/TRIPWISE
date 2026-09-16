'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Trip, Activity } from '@/types/trip';
import WeatherAdvisorCard from '@/components/WeatherAdvisorCard';
import SmartRouteCard from '@/components/SmartRouteCard';
import TripWiseAIModal from '@/components/TripWiseAIModal';
import TripReminderBanner from '@/components/TripReminderBanner';
import DayRouteSummaryCard from '@/components/DayRouteSummaryCard';
import { supabase } from '@/lib/supabase';
import {
  CompassIcon,
  MapPinIcon,
  UserIcon,
  SunIcon,
  UmbrellaIcon,
  ClockIcon,
  SparklesIcon,
  ShareIcon,
  CheckIcon,
  ArrowLeftIcon,
  HelpIcon,
  ExternalLinkIcon,
  TrainIcon,
  ShieldIcon,
  CloseIcon
} from '@/components/Icons';

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
      <div className="min-h-screen flex flex-col bg-[#080B10] text-slate-100">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-4">
            <CompassIcon size={32} className="text-amber-400 animate-spin mx-auto" />
            <p className="text-slate-400 text-xs font-semibold">Loading your itinerary...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex flex-col bg-[#080B10] text-slate-100">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-4 max-w-md">
            <h2 className="text-2xl font-extrabold text-white">Trip Not Found</h2>
            <p className="text-xs text-slate-400">
              This itinerary link may be invalid or was deleted from local storage.
            </p>
            <Link
              href="/plan"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-extrabold"
            >
              Plan A New Trip
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
    <div className="min-h-screen flex flex-col bg-[#080B10] text-slate-100 font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
        {/* Trip Reminder Banner */}
        <TripReminderBanner destination={trip.destination} startDateText="Soon" tripId={trip.id} />

        {/* Navigation Toolbar */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-200 transition"
          >
            <ArrowLeftIcon size={14} /> Back to My Trips
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAIModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold flex items-center gap-2 transition shadow-md"
            >
              <SparklesIcon size={14} className="text-slate-950" />
              <span>Ask TripWise AI</span>
            </button>

            <button
              onClick={copyShareUrl}
              className="px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold flex items-center gap-2 transition"
            >
              {copied ? (
                <>
                  <CheckIcon size={14} className="text-emerald-400" />
                  <span className="text-emerald-400">Link Copied!</span>
                </>
              ) : (
                <>
                  <ShareIcon size={14} className="text-amber-400" />
                  <span>Share Trip</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* TRIP HERO HEADER & WEATHER SUMMARY */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/[0.08] relative overflow-hidden shadow-2xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-extrabold text-amber-400 uppercase tracking-wider">
                <MapPinIcon size={16} /> {trip.destination} • {trip.durationDays} Days Itinerary
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
                {trip.destination} Adaptive Plan
              </h1>
              <div className="flex flex-wrap gap-2 pt-1 text-xs">
                <span className="px-3 py-1 rounded-full bg-slate-950/80 border border-slate-800 text-slate-300 font-semibold flex items-center gap-1.5 shadow-sm">
                  <UserIcon size={14} className="text-amber-400" /> {trip.persona}
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-950/80 border border-slate-800 text-slate-300 font-semibold shadow-sm">
                  ⚡ Pace: {trip.pace}
                </span>
              </div>
            </div>

            {/* Weather & Trip Health Badges */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 bg-slate-950/80 p-4 rounded-2xl border border-slate-800 shadow-inner">
              {trip.weatherSummary && (
                <div className="pr-4 border-r border-slate-800">
                  <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Forecast</span>
                  <div className="flex items-center gap-2.5 mt-0.5">
                    <span className="text-2xl">{currentDay.weatherForecast.icon}</span>
                    <div>
                      <div className="font-extrabold text-white text-base">
                        {currentDay.weatherForecast.tempC}°C
                      </div>
                      <div className="text-xs text-slate-400 font-medium">
                        {currentDay.weatherForecast.condition}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {trip.healthScore && (
                <div>
                  <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Trip Health</span>
                  <div className="flex items-center gap-2.5 mt-0.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-extrabold text-emerald-300 text-sm shadow-sm">
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
        <div id="itinerary-section" className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none scroll-mt-6">
          {trip.days.map((d, idx) => (
            <button
              key={d.dayNumber}
              onClick={() => setActiveDayIdx(idx)}
              className={`px-5 py-3 rounded-2xl font-extrabold text-xs border whitespace-nowrap transition-all ${
                activeDayIdx === idx
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-extrabold scale-[1.02]'
                  : 'bg-slate-950/80 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <span>Day {d.dayNumber}</span>
              <span className="text-xs opacity-80 font-normal ml-1.5">{d.weatherForecast.icon} {d.weatherForecast.tempC}°C</span>
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
            destinationName={trip.destination}
            baseLat={trip.latitude}
            baseLng={trip.longitude}
            onApplyOptimization={(reordered) => {
              const updatedDays = [...trip.days];
              updatedDays[activeDayIdx].activities = reordered;
              setTrip({ ...trip, days: updatedDays });
            }}
          />
        </div>

        {/* WEATHER ADAPTATION & PLAN B BANNER */}
        <div className="glass-panel rounded-3xl p-5 border border-white/[0.07] space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-inner">
                <SunIcon size={20} />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-sm">
                  Day {currentDay.dayNumber} Weather Outlook: {currentDay.weatherForecast.condition}
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  Precipitation Risk: <span className="font-bold text-amber-300">{currentDay.weatherForecast.rainProbability}%</span> • {currentDay.weatherForecast.note}
                </p>
              </div>
            </div>

            <button
              onClick={() => togglePlanB(activeDayIdx)}
              className={`px-4 py-3 rounded-2xl font-extrabold text-xs flex items-center gap-2 transition-all border shadow-md ${
                isCurrentPlanB
                  ? 'bg-amber-500 text-slate-950 border-amber-400 scale-[1.02]'
                  : 'bg-slate-900/90 text-amber-300 border-amber-500/30 hover:bg-slate-800'
              }`}
            >
              <UmbrellaIcon size={16} />
              <span>{isCurrentPlanB ? '🌧️ Plan B Active (Indoor Mode)' : '🌧️ What if it rains?'}</span>
            </button>
          </div>

          {isCurrentPlanB && (
            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-xs space-y-2 animate-fade-in shadow-inner">
              <div className="flex items-center gap-2 font-extrabold text-amber-300">
                <span>Why did we change this?</span>
              </div>
              <p className="text-slate-300 leading-relaxed font-medium">
                Rain risk is expected during peak afternoon hours ({currentDay.weatherForecast.rainProbability}% probability). Outdoor visits have been replaced with curated indoor alternatives.
              </p>
              <div className="flex items-center gap-2 text-[11px] text-amber-400 font-bold pt-1">
                <span>PLAN A (Outdoor)</span> → <span className="text-emerald-400">PLAN B (Indoor Experience)</span>
              </div>
            </div>
          )}
        </div>

        {/* COMPACT DAY ROUTE SUMMARY */}
        <DayRouteSummaryCard
          destination={trip.destination}
          dayNumber={currentDay.dayNumber}
          routeSummary={currentDay.routeSummary}
          activities={currentDay.activities}
        />

        {/* ITINERARY ACTIVITIES TIMELINE */}
        <div className="space-y-4">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <ClockIcon size={18} className="text-amber-400" /> Scheduled Activities ({isCurrentPlanB ? 'Plan B Indoor Mode' : 'Plan A Original'})
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
              const mapsUrl = act.transitToNext?.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(displayActivityName + ' ' + trip.destination)}`;

              return (
                <div key={act.id || actIdx} className="space-y-3">
                  <div
                    className={`glass-panel rounded-3xl p-6 border transition-all relative ${
                      isReplacedByPlanB
                        ? 'border-amber-500/40 bg-amber-950/10'
                        : 'border-white/[0.07] hover:border-white/[0.12]'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                          <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold text-[11px]">
                            {act.bestTime}
                          </span>
                          <span className="text-slate-500">•</span>
                          <span className="text-slate-400 text-xs">{act.durationMinutes} min visit</span>
                          
                          {act.nearestMetro && (
                            <span className="px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-sky-300 font-medium flex items-center gap-1 text-[11px]">
                              <TrainIcon size={12} className="text-sky-400" />
                              Near {act.nearestMetro.stationName} Metro ({act.nearestMetro.walkTimeMin} min walk)
                            </span>
                          )}
                        </div>

                        <h4 className="text-lg font-bold text-white flex items-center gap-2">
                          {displayActivityName}
                          {isReplacedByPlanB && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                              Indoor Plan B
                            </span>
                          )}
                        </h4>

                        <p className="text-xs text-slate-300 max-w-2xl leading-relaxed font-medium">
                          {displayDescription}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex sm:flex-col items-center gap-2 shrink-0">
                        <button
                          onClick={() => setSelectedWhyActivity(act)}
                          className="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition shadow-sm w-full justify-center"
                        >
                          <HelpIcon size={14} className="text-amber-400" />
                          <span>Why this?</span>
                        </button>

                        <a
                          href={mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 text-xs font-semibold flex items-center gap-1.5 transition w-full justify-center"
                        >
                          <ExternalLinkIcon size={14} />
                          <span>Open Route</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Inter-Activity Transit Connector Card */}
                  {act.transitToNext && actIdx < currentDay.activities.length - 1 && (
                    <div className="mx-4 p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-amber-400 font-bold">🚇 Transit:</span>
                        <span className="font-semibold text-slate-300">
                          {act.transitToNext.fromStation} → {act.transitToNext.toStation}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-400 text-[11px] font-medium">
                        <span>~{act.transitToNext.approxTransitMin} min metro</span>
                        <span>•</span>
                        <span>~{act.transitToNext.approxWalkMin} min walk</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* TRIP HEALTH FACTORS */}
        {trip.healthScore && (
          <div className="glass-panel rounded-3xl p-6 border border-white/[0.07] space-y-3 shadow-xl">
            <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
              <ShieldIcon size={18} className="text-emerald-400" /> Trip Health Factors ({trip.healthScore.score}/100)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {trip.healthScore.factors.map((f, i) => (
                <div key={i} className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 font-medium">
                  {f.text}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* "WHY THIS ACTIVITY?" MODAL */}
      {selectedWhyActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080B10]/85 backdrop-blur-md animate-fade-in">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-white/[0.09] space-y-4 relative shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-2 font-extrabold text-white text-base">
                <SparklesIcon size={18} className="text-amber-400" /> Why this activity?
              </div>
              <button
                onClick={() => setSelectedWhyActivity(null)}
                className="text-slate-400 hover:text-white text-xs p-1.5 rounded-xl hover:bg-slate-800"
              >
                <CloseIcon size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <h5 className="font-extrabold text-amber-300 text-sm">{selectedWhyActivity.name}</h5>
              <p className="text-slate-300 text-xs leading-relaxed bg-slate-950/90 p-4 rounded-2xl border border-slate-800 font-medium">
                {selectedWhyActivity.whySelectedReason || `Selected based on your ${trip.persona} traveler persona and ${trip.pace} pacing preferences.`}
              </p>
              <div className="flex flex-wrap gap-2 text-[11px] text-slate-400 pt-1 font-medium">
                <span>Category: {selectedWhyActivity.category}</span>
                <span>•</span>
                <span>Outdoor: {selectedWhyActivity.isOutdoor ? 'Yes' : 'No'}</span>
                <span>•</span>
                <span>Weather Suitability: {selectedWhyActivity.weatherSuitability}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedWhyActivity(null)}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-md"
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
