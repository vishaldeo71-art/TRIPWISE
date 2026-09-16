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
      <div className="min-h-screen flex flex-col bg-white text-[#131314]">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-4">
            <CompassIcon size={32} className="text-[#131314] animate-spin mx-auto" />
            <p className="text-[var(--muted)] text-xs font-semibold">Loading itinerary details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex flex-col bg-white text-[#131314]">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-4 max-w-md">
            <h2 className="text-2xl font-extrabold font-display text-[#131314]">Trip Not Found</h2>
            <p className="text-xs text-[var(--muted)]">
              This itinerary link may be invalid or was deleted from local storage.
            </p>
            <Link
              href="/plan"
              className="tw-btn-primary text-xs"
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
    <div className="min-h-screen flex flex-col bg-white text-[#131314] font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
        {/* Trip Reminder Banner */}
        <TripReminderBanner destination={trip.destination} startDateText="Soon" tripId={trip.id} />

        {/* Navigation Toolbar */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-xs font-bold text-[var(--muted)] hover:text-[#131314] transition"
          >
            <ArrowLeftIcon size={14} /> Back to My Trips
          </Link>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsAIModalOpen(true)}
              className="tw-btn-primary text-xs !py-2 !px-4"
            >
              <SparklesIcon size={14} className="text-amber-400" />
              <span>Ask TripWise AI</span>
            </button>

            <button
              onClick={copyShareUrl}
              className="tw-btn-secondary text-xs !py-2 !px-4"
            >
              {copied ? (
                <>
                  <CheckIcon size={14} className="text-emerald-600" />
                  <span className="text-emerald-600">Link Copied!</span>
                </>
              ) : (
                <>
                  <ShareIcon size={14} />
                  <span>Share Trip</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* TRIP HERO HEADER & WEATHER SUMMARY */}
        <div className="tw-card p-6 sm:p-8 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider">
                <MapPinIcon size={16} /> {trip.destination} • {trip.durationDays} Days Itinerary
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-[#131314]">
                {trip.destination} Adaptive Plan
              </h1>
              <div className="flex flex-wrap gap-2 pt-1 text-xs">
                <span className="tw-badge">
                  <UserIcon size={14} className="text-amber-600" /> {trip.persona}
                </span>
                <span className="tw-badge">
                  ⚡ Pace: {trip.pace}
                </span>
              </div>
            </div>

            {/* Weather & Trip Health Badges */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 bg-[var(--surface)] p-4 rounded-2xl border border-[var(--border)]">
              {trip.weatherSummary && (
                <div className="pr-4 border-r border-[var(--border)]">
                  <span className="text-[10px] uppercase font-bold text-[var(--muted)] tracking-wider">Forecast</span>
                  <div className="flex items-center gap-2.5 mt-0.5">
                    <span className="text-2xl">{currentDay.weatherForecast.icon}</span>
                    <div>
                      <div className="font-extrabold text-[#131314] text-base font-display">
                        {currentDay.weatherForecast.tempC}°C
                      </div>
                      <div className="text-xs text-[var(--muted)] font-medium">
                        {currentDay.weatherForecast.condition}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {trip.healthScore && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-[var(--muted)] tracking-wider">Trip Health</span>
                  <div className="flex items-center gap-2.5 mt-0.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center justify-center font-extrabold font-display text-sm">
                      {trip.healthScore.score}
                    </div>
                    <div>
                      <div className="font-bold text-[#131314] text-xs">
                        {trip.healthScore.label}
                      </div>
                      <div className="text-[10px] text-[var(--muted)] font-medium">Deterministic Score</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* DAY SELECTOR TABS */}
        <div id="itinerary-section" className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none scroll-mt-6">
          {trip.days.map((d, idx) => (
            <button
              key={d.dayNumber}
              onClick={() => setActiveDayIdx(idx)}
              className={`px-5 py-2.5 rounded-full font-bold text-xs border whitespace-nowrap transition-all ${
                activeDayIdx === idx
                  ? 'bg-[#131314] text-white border-[#131314] shadow-sm'
                  : 'bg-[var(--surface)] text-[#131314] border-[var(--border)] hover:bg-[var(--surface-2)]'
              }`}
            >
              <span>Day {d.dayNumber}</span>
              <span className="text-xs opacity-75 font-normal ml-1.5">{d.weatherForecast.icon} {d.weatherForecast.tempC}°C</span>
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
        <div className="tw-card p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-amber-600">
                <SunIcon size={20} />
              </div>
              <div>
                <h3 className="font-extrabold text-[#131314] text-sm font-display">
                  Day {currentDay.dayNumber} Weather Outlook: {currentDay.weatherForecast.condition}
                </h3>
                <p className="text-xs text-[var(--muted)] font-medium">
                  Precipitation Risk: <span className="font-bold text-amber-600">{currentDay.weatherForecast.rainProbability}%</span> • {currentDay.weatherForecast.note}
                </p>
              </div>
            </div>

            <button
              onClick={() => togglePlanB(activeDayIdx)}
              className={`px-4 py-2.5 rounded-full font-bold text-xs flex items-center gap-2 transition-all border ${
                isCurrentPlanB
                  ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                  : 'bg-[var(--surface)] text-[#131314] border-[var(--border)] hover:bg-[var(--surface-2)]'
              }`}
            >
              <UmbrellaIcon size={16} />
              <span>{isCurrentPlanB ? '🌧️ Plan B Active (Indoor Mode)' : '🌧️ What if it rains?'}</span>
            </button>
          </div>

          {isCurrentPlanB && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-900">
                <span>Why did we change this?</span>
              </div>
              <p className="text-amber-800 leading-relaxed font-medium">
                Rain risk is expected during peak afternoon hours ({currentDay.weatherForecast.rainProbability}% probability). Outdoor visits have been replaced with curated indoor alternatives.
              </p>
              <div className="flex items-center gap-2 text-[11px] text-amber-900 font-bold pt-1">
                <span>PLAN A (Outdoor)</span> → <span className="text-emerald-700">PLAN B (Indoor Experience)</span>
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
          <h3 className="text-base font-extrabold font-display text-[#131314] flex items-center gap-2">
            <ClockIcon size={18} className="text-amber-600" /> Scheduled Activities ({isCurrentPlanB ? 'Plan B Indoor Mode' : 'Plan A Original'})
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
                    className={`tw-card-lift p-6 transition-all ${
                      isReplacedByPlanB ? 'border-amber-300 bg-amber-50/40' : ''
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                          <span className="tw-badge tw-badge-amber">
                            {act.bestTime}
                          </span>
                          <span className="text-[var(--muted)]">•</span>
                          <span className="text-[var(--muted)] text-xs">{act.durationMinutes} min visit</span>
                          
                          {act.nearestMetro && (
                            <span className="tw-badge tw-badge-sky">
                              <TrainIcon size={12} />
                              Near {act.nearestMetro.stationName} Metro ({act.nearestMetro.walkTimeMin} min walk)
                            </span>
                          )}
                        </div>

                        <h4 className="text-lg font-extrabold font-display text-[#131314] flex items-center gap-2">
                          {displayActivityName}
                          {isReplacedByPlanB && (
                            <span className="tw-badge tw-badge-amber">
                              Indoor Plan B
                            </span>
                          )}
                        </h4>

                        <p className="text-xs text-[var(--muted)] max-w-2xl leading-relaxed font-medium">
                          {displayDescription}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex sm:flex-col items-center gap-2 shrink-0">
                        <button
                          onClick={() => setSelectedWhyActivity(act)}
                          className="tw-btn-secondary text-xs !py-2 !px-3 w-full justify-center"
                        >
                          <HelpIcon size={14} className="text-amber-600" />
                          <span>Why this?</span>
                        </button>

                        <a
                          href={mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="tw-btn-primary text-xs !py-2 !px-3 w-full justify-center"
                        >
                          <ExternalLinkIcon size={14} />
                          <span>Open Route</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Inter-Activity Transit Connector Card */}
                  {act.transitToNext && actIdx < currentDay.activities.length - 1 && (
                    <div className="mx-4 p-3 rounded-2xl bg-[var(--surface)] border border-[var(--border)] flex flex-wrap items-center justify-between text-xs text-[#131314] gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-amber-600 font-bold">🚇 Transit:</span>
                        <span className="font-semibold">
                          {act.transitToNext.fromStation} → {act.transitToNext.toStation}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[var(--muted)] text-[11px] font-medium">
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
          <div className="tw-card p-6 space-y-3">
            <h4 className="font-extrabold font-display text-[#131314] text-sm flex items-center gap-2">
              <ShieldIcon size={18} className="text-emerald-600" /> Trip Health Factors ({trip.healthScore.score}/100)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {trip.healthScore.factors.map((f, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-xs text-[var(--muted)] font-medium">
                  {f.text}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* "WHY THIS ACTIVITY?" MODAL */}
      {selectedWhyActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="tw-card p-6 sm:p-8 max-w-lg w-full space-y-4 relative shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <div className="flex items-center gap-2 font-extrabold font-display text-[#131314] text-base">
                <SparklesIcon size={18} className="text-amber-600" /> Why this activity?
              </div>
              <button
                onClick={() => setSelectedWhyActivity(null)}
                className="text-[var(--muted)] hover:text-[#131314] text-xs p-1.5 rounded-lg hover:bg-[var(--surface)]"
              >
                <CloseIcon size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <h5 className="font-extrabold font-display text-[#131314] text-sm">{selectedWhyActivity.name}</h5>
              <p className="text-[var(--muted)] text-xs leading-relaxed bg-[var(--surface)] p-4 rounded-xl border border-[var(--border)] font-medium">
                {selectedWhyActivity.whySelectedReason || `Selected based on your ${trip.persona} traveler persona and ${trip.pace} pacing preferences.`}
              </p>
              <div className="flex flex-wrap gap-2 text-[11px] text-[var(--muted)] pt-1 font-medium">
                <span>Category: {selectedWhyActivity.category}</span>
                <span>•</span>
                <span>Outdoor: {selectedWhyActivity.isOutdoor ? 'Yes' : 'No'}</span>
                <span>•</span>
                <span>Weather Suitability: {selectedWhyActivity.weatherSuitability}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedWhyActivity(null)}
              className="tw-btn-primary w-full text-xs"
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
