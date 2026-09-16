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
  CloseIcon,
} from '@/components/Icons';

export default function TripViewPage({ params }: { params: { id: string } }) {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [activeDayIdx, setActiveDayIdx] = useState(0);
  const [planBActive, setPlanBActive] = useState<{ [dayIdx: number]: boolean }>({});
  const [selectedWhyActivity, setSelectedWhyActivity] = useState<Activity | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  useEffect(() => { loadTripData(); }, [params.id]);

  const loadTripData = async () => {
    setLoading(true);
    try {
      const stored = localStorage.getItem('tripwise_saved_trips');
      if (stored) {
        const parsed: Trip[] = JSON.parse(stored);
        const match = parsed.find((t) => t.id === params.id || t.shareId === params.id);
        if (match) { setTrip(match); setLoading(false); return; }
      }
    } catch { /* empty */ }

    try {
      const { data, error } = await supabase.from('trips').select('*').or(`id.eq.${params.id},share_id.eq.${params.id}`).single();
      if (!error && data) {
        setTrip({
          id: data.id, shareId: data.share_id, destination: data.destination,
          latitude: data.latitude, longitude: data.longitude, durationDays: data.duration,
          persona: data.persona, pace: data.travel_pace, interests: data.interests || [],
          weatherSummary: data.weather_summary, days: data.itinerary,
          healthScore: data.trip_score, createdAt: data.created_at,
        });
        setLoading(false);
        return;
      }
    } catch { /* empty */ }

    setLoading(false);
  };

  const togglePlanB = (dayIdx: number) => {
    setPlanBActive((prev) => ({ ...prev, [dayIdx]: !prev[dayIdx] }));
  };

  const copyShareUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F7F5F0] dark:bg-[#07090F]">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-4">
            <CompassIcon size={32} className="text-amber-500 animate-spin-smooth mx-auto" />
            <p className="text-slate-600 dark:text-slate-400 text-xs font-semibold">Loading your itinerary…</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F7F5F0] dark:bg-[#07090F]">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="tw-card p-10 text-center space-y-4 max-w-sm w-full">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Trip Not Found</h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              This itinerary link may be invalid or was deleted from local storage.
            </p>
            <Link href="/plan" className="tw-btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs">
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
    <div className="min-h-screen flex flex-col bg-[#F7F5F0] dark:bg-[#07090F] text-slate-900 dark:text-[#F0F4FF] transition-colors">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Reminder Banner */}
        <TripReminderBanner destination={trip.destination} startDateText="Soon" tripId={trip.id} />

        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
          >
            <ArrowLeftIcon size={14} />
            Back to My Trips
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAIModalOpen(true)}
              className="tw-btn-primary px-4 py-2 rounded-xl text-xs flex items-center gap-2"
            >
              <SparklesIcon size={13} />
              <span>Ask TripWise AI</span>
            </button>
            <button
              onClick={copyShareUrl}
              className="tw-btn-ghost px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border"
            >
              {copied ? (
                <>
                  <CheckIcon size={13} className="text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <ShareIcon size={13} className="text-amber-500" />
                  <span>Share Trip</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Hero Header */}
        <div className="tw-card p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-72 h-72 rounded-full bg-amber-400/8 dark:bg-amber-400/5 blur-3xl pointer-events-none" />
          <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                <MapPinIcon size={14} />
                {trip.destination} · {trip.durationDays} Days Itinerary
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                {trip.destination} Adaptive Plan
              </h1>
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="tw-badge tw-badge-amber flex items-center gap-1.5">
                  <UserIcon size={11} />
                  {trip.persona}
                </span>
                <span className="px-3 py-1 rounded-full bg-stone-100 dark:bg-white/[0.06] border border-stone-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 text-[11px] font-semibold">
                  ⚡ {trip.pace}
                </span>
              </div>
            </div>

            {/* Weather + Health badges */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 bg-stone-100 dark:bg-white/[0.04] p-4 rounded-2xl border border-stone-200 dark:border-white/[0.07]">
              {trip.weatherSummary && (
                <div className="pr-4 border-r border-stone-300 dark:border-white/[0.08]">
                  <span className="text-[10px] uppercase font-extrabold text-slate-500 tracking-wider">Forecast</span>
                  <div className="flex items-center gap-2.5 mt-0.5">
                    <span className="text-2xl">{currentDay.weatherForecast.icon}</span>
                    <div>
                      <div className="font-extrabold text-slate-900 dark:text-white text-base">{currentDay.weatherForecast.tempC}°C</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">{currentDay.weatherForecast.condition}</div>
                    </div>
                  </div>
                </div>
              )}
              {trip.healthScore && (
                <div>
                  <span className="text-[10px] uppercase font-extrabold text-slate-500 tracking-wider">Trip Health</span>
                  <div className="flex items-center gap-2.5 mt-0.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-extrabold text-emerald-700 dark:text-emerald-300 text-sm">
                      {trip.healthScore.score}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white text-xs">{trip.healthScore.label}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">Deterministic Score</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Day Tabs */}
        <div id="itinerary-section" className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none scroll-mt-6">
          {trip.days.map((d, idx) => (
            <button
              key={d.dayNumber}
              onClick={() => setActiveDayIdx(idx)}
              className={`px-5 py-3 rounded-2xl font-extrabold text-xs border whitespace-nowrap transition-all ${
                activeDayIdx === idx
                  ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-md scale-[1.03]'
                  : 'tw-btn-ghost border text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Day {d.dayNumber}
              <span className="opacity-75 font-normal ml-1.5">{d.weatherForecast.icon} {d.weatherForecast.tempC}°C</span>
            </button>
          ))}
        </div>

        {/* Weather Advisor + Smart Route */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <WeatherAdvisorCard weatherSummary={trip.weatherSummary} activeDay={currentDay} onAskAI={() => setIsAIModalOpen(true)} />
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

        {/* Plan B Banner */}
        <div className="tw-card p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <SunIcon size={19} className="text-amber-500" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">
                  Day {currentDay.dayNumber}: {currentDay.weatherForecast.condition}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  Rain risk: <span className="font-bold text-amber-600 dark:text-amber-300">{currentDay.weatherForecast.rainProbability}%</span>
                  {' '}· {currentDay.weatherForecast.note}
                </p>
              </div>
            </div>
            <button
              onClick={() => togglePlanB(activeDayIdx)}
              className={`px-4 py-3 rounded-2xl font-extrabold text-xs flex items-center gap-2 transition-all border ${
                isCurrentPlanB
                  ? 'bg-amber-400 text-slate-950 border-amber-400 scale-[1.02] shadow-md'
                  : 'tw-btn-ghost border-amber-500/25 text-amber-700 dark:text-amber-300 hover:border-amber-500/40'
              }`}
            >
              <UmbrellaIcon size={15} />
              {isCurrentPlanB ? '🌧️ Plan B Active (Indoor Mode)' : '🌧️ What if it rains?'}
            </button>
          </div>

          {isCurrentPlanB && (
            <div className="p-4 rounded-2xl bg-amber-500/8 border border-amber-500/25 text-xs space-y-2 animate-fade-in-up">
              <div className="font-extrabold text-amber-800 dark:text-amber-300">Outdoor visits replaced with indoor alternatives</div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                Rain risk expected during peak hours ({currentDay.weatherForecast.rainProbability}% probability). Monuments replaced with curated indoor experiences.
              </p>
              <div className="flex items-center gap-2 text-[11px] text-amber-700 dark:text-amber-400 font-bold pt-1">
                <span>PLAN A (Outdoor)</span>
                <span>→</span>
                <span className="text-emerald-700 dark:text-emerald-400">PLAN B (Indoor)</span>
              </div>
            </div>
          )}
        </div>

        {/* Day Route Summary */}
        <DayRouteSummaryCard
          destination={trip.destination}
          dayNumber={currentDay.dayNumber}
          routeSummary={currentDay.routeSummary}
          activities={currentDay.activities}
        />

        {/* Activities Timeline */}
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <ClockIcon size={16} className="text-amber-500" />
            Scheduled Activities
            <span className="tw-badge tw-badge-amber ml-1">
              {isCurrentPlanB ? 'Plan B · Indoor Mode' : 'Plan A · Original'}
            </span>
          </h3>

          <div className="space-y-3">
            {currentDay.activities.map((act, actIdx) => {
              const displayName = isCurrentPlanB && act.isOutdoor && act.indoorAlternative ? act.indoorAlternative.name : act.name;
              const displayDesc = isCurrentPlanB && act.isOutdoor && act.indoorAlternative ? act.indoorAlternative.description : act.description;
              const isReplacedByPlanB = isCurrentPlanB && act.isOutdoor && act.indoorAlternative;
              const mapsUrl = act.transitToNext?.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(displayName + ' ' + trip.destination)}`;

              return (
                <div key={act.id || actIdx} className="space-y-2">
                  <div className={`tw-card p-5 sm:p-6 transition-all ${isReplacedByPlanB ? 'border-amber-500/30 dark:border-amber-500/25' : ''}`}>
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-2 flex-1 min-w-0">
                        {/* Meta row */}
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="tw-badge tw-badge-amber">{act.bestTime}</span>
                          <span className="text-slate-500 dark:text-slate-400 font-medium">{act.durationMinutes} min</span>
                          {act.nearestMetro && (
                            <span className="px-2.5 py-1 rounded-full bg-sky-500/8 border border-sky-500/20 text-sky-700 dark:text-sky-300 text-[11px] font-medium flex items-center gap-1">
                              <TrainIcon size={11} className="text-sky-500" />
                              {act.nearestMetro.stationName} Metro ({act.nearestMetro.walkTimeMin} min walk)
                            </span>
                          )}
                          {isReplacedByPlanB && (
                            <span className="tw-badge tw-badge-amber">Indoor Plan B</span>
                          )}
                        </div>

                        {/* Name */}
                        <h4 className="text-base font-bold text-slate-900 dark:text-white">{displayName}</h4>

                        {/* Description */}
                        <p className="text-xs text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                          {displayDesc}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex sm:flex-col gap-2 shrink-0">
                        <button
                          onClick={() => setSelectedWhyActivity(act)}
                          className="tw-btn-ghost px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border justify-center"
                        >
                          <HelpIcon size={13} className="text-amber-500" />
                          Why this?
                        </button>
                        <a
                          href={mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-2 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-800 dark:text-amber-300 border border-amber-500/20 text-xs font-semibold flex items-center gap-1.5 transition justify-center"
                        >
                          <ExternalLinkIcon size={13} />
                          Open Map
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Transit connector */}
                  {act.transitToNext && actIdx < currentDay.activities.length - 1 && (
                    <div className="mx-5 p-3 rounded-xl bg-stone-100 dark:bg-white/[0.03] border border-stone-200 dark:border-white/[0.06] flex flex-wrap items-center justify-between text-xs gap-2">
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <span className="text-amber-600 dark:text-amber-400 font-bold">🚇</span>
                        <span className="font-semibold">{act.transitToNext.fromStation} → {act.transitToNext.toStation}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-[11px] font-medium">
                        <span>~{act.transitToNext.approxTransitMin} min metro</span>
                        <span>·</span>
                        <span>~{act.transitToNext.approxWalkMin} min walk</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Trip Health Factors */}
        {trip.healthScore && (
          <div className="tw-card p-6 space-y-4">
            <h4 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <ShieldIcon size={16} className="text-emerald-500" />
              Trip Health Factors ({trip.healthScore.score}/100)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {trip.healthScore.factors.map((f, i) => (
                <div key={i} className="p-3.5 rounded-2xl bg-stone-100 dark:bg-white/[0.04] border border-stone-200 dark:border-white/[0.07] text-xs text-slate-700 dark:text-slate-300 font-medium">
                  {f.text}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Why This Activity Modal */}
      {selectedWhyActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 tw-modal-overlay animate-fade-in-up">
          <div className="tw-card p-6 sm:p-8 max-w-lg w-full space-y-4 relative">
            <div className="flex items-center justify-between border-b tw-divider pb-3">
              <div className="flex items-center gap-2 font-extrabold text-slate-900 dark:text-white text-base">
                <SparklesIcon size={17} className="text-amber-500" />
                Why this activity?
              </div>
              <button
                onClick={() => setSelectedWhyActivity(null)}
                className="tw-btn-ghost p-1.5 rounded-xl border text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <CloseIcon size={15} />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <h5 className="font-extrabold text-amber-700 dark:text-amber-300 text-sm">{selectedWhyActivity.name}</h5>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed bg-stone-100 dark:bg-white/[0.04] p-4 rounded-2xl border border-stone-200 dark:border-white/[0.07] font-medium">
                {selectedWhyActivity.whySelectedReason || `Selected based on your ${trip.persona} persona and ${trip.pace} pacing preferences.`}
              </p>
              <div className="flex flex-wrap gap-3 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                <span>Category: {selectedWhyActivity.category}</span>
                <span>·</span>
                <span>Outdoor: {selectedWhyActivity.isOutdoor ? 'Yes' : 'No'}</span>
                <span>·</span>
                <span>Weather Fit: {selectedWhyActivity.weatherSuitability}</span>
              </div>
            </div>
            <button
              onClick={() => setSelectedWhyActivity(null)}
              className="tw-btn-primary w-full py-3 rounded-xl text-xs"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* TripWise AI Modal */}
      {trip && (
        <TripWiseAIModal trip={trip} isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} />
      )}

      <Footer />
    </div>
  );
}
