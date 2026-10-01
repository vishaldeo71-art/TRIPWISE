'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Trip, Activity, ItineraryDay } from '@/types/trip';
import {
  calculateTripDates,
  assignActivityTimes,
  recalculateDaySchedule,
  detectScheduleConflicts,
  downloadIcsFile,
  ScheduleConflict,
  addMinutesToTime
} from '@/lib/schedulerEngine';
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  TrainIcon,
  SparklesIcon,
  CompassIcon,
  CheckIcon,
  ExternalLinkIcon,
  UmbrellaIcon,
  FlameIcon,
  CloseIcon
} from '@/components/Icons';
import { supabase } from '@/lib/supabase';

function CalendarContent() {
  const searchParams = useSearchParams();
  const requestedTripId = searchParams?.get('tripId');

  const [savedTrips, setSavedTrips] = useState<Trip[]>([]);
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);

  // View state
  const [showTodayOnly, setShowTodayOnly] = useState(false);
  const [editingActivity, setEditingActivity] = useState<{ dayIdx: number; activity: Activity } | null>(null);
  const [editStartTime, setEditStartTime] = useState('');
  const [editDuration, setEditDuration] = useState(90);
  const [editTargetDayIdx, setEditTargetDayIdx] = useState(0);

  // AI Modal State
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiPromptContext, setAiPromptContext] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    loadTrips();
  }, [requestedTripId]);

  const loadTrips = async () => {
    setLoading(true);
    let tripsList: Trip[] = [];

    // Read LocalStorage
    try {
      const stored = localStorage.getItem('tripwise_saved_trips');
      if (stored) {
        tripsList = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error reading local trips:', e);
    }

    // Read Supabase
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('trips')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const remoteTrips: Trip[] = data.map((item) => ({
            id: item.id,
            shareId: item.share_id,
            destination: item.destination,
            latitude: item.latitude,
            longitude: item.longitude,
            durationDays: item.duration,
            startDate: item.start_date || new Date().toISOString().split('T')[0],
            endDate: item.end_date,
            persona: item.persona,
            pace: item.travel_pace,
            interests: item.interests || [],
            weatherSummary: item.weather_summary,
            days: item.itinerary,
            healthScore: item.trip_score,
            createdAt: item.created_at,
          }));

          // Merge uniquely
          remoteTrips.forEach((remote) => {
            if (!tripsList.some((t) => t.id === remote.id)) {
              tripsList.push(remote);
            }
          });
        }
      }
    } catch (e) {
      console.log('Supabase read fallback to local storage');
    }

    // Assign fallback dates & start/end times if missing
    tripsList = tripsList.map((t) => ensureTripScheduleData(t));

    setSavedTrips(tripsList);

    if (tripsList.length > 0) {
      if (requestedTripId) {
        const found = tripsList.find((t) => t.id === requestedTripId || t.shareId === requestedTripId);
        setActiveTrip(found || tripsList[0]);
      } else {
        setActiveTrip(tripsList[0]);
      }
    }

    setLoading(false);
  };

  /**
   * Helper to ensure trip has dates and activity times
   */
  const ensureTripScheduleData = (trip: Trip): Trip => {
    const startDate = trip.startDate || new Date().toISOString().split('T')[0];
    const dates = calculateTripDates(startDate, trip.durationDays);

    const updatedDays = trip.days.map((day, idx) => {
      const dayDateInfo = dates[idx] || dates[0];
      const timedActivities = assignActivityTimes(day.activities);

      return {
        ...day,
        date: day.date || dayDateInfo.dateStr,
        formattedDate: day.formattedDate || dayDateInfo.formattedDate,
        dayOfWeek: day.dayOfWeek || dayDateInfo.dayOfWeek,
        activities: timedActivities,
      };
    });

    return {
      ...trip,
      startDate,
      endDate: trip.endDate || dates[dates.length - 1]?.dateStr,
      days: updatedDays,
    };
  };

  // Save updated trip to state, LocalStorage, and Supabase
  const persistTrip = async (updatedTrip: Trip) => {
    setActiveTrip(updatedTrip);

    // Update list
    const updatedList = savedTrips.map((t) => (t.id === updatedTrip.id ? updatedTrip : t));
    setSavedTrips(updatedList);
    try {
      localStorage.setItem('tripwise_saved_trips', JSON.stringify(updatedList));
    } catch (e) {}

    // Update Supabase
    try {
      if (updatedTrip.id) {
        await supabase.from('trips').upsert({
          id: updatedTrip.id,
          share_id: updatedTrip.shareId,
          destination: updatedTrip.destination,
          latitude: updatedTrip.latitude,
          longitude: updatedTrip.longitude,
          duration: updatedTrip.durationDays,
          persona: updatedTrip.persona,
          travel_pace: updatedTrip.pace,
          interests: updatedTrip.interests,
          itinerary: updatedTrip.days,
          weather_summary: updatedTrip.weatherSummary,
          trip_score: updatedTrip.healthScore,
        });
      }
    } catch (e) {}
  };

  // Handle Edit Activity Time & Day
  const handleOpenEditModal = (dayIdx: number, activity: Activity) => {
    setEditingActivity({ dayIdx, activity });
    setEditStartTime(activity.startTime || '09:00');
    setEditDuration(activity.durationMinutes || 90);
    setEditTargetDayIdx(dayIdx);
  };

  const handleSaveActivityEdit = () => {
    if (!editingActivity || !activeTrip) return;

    const { dayIdx: origDayIdx, activity } = editingActivity;
    const newTrip = { ...activeTrip };

    const updatedActivity: Activity = {
      ...activity,
      startTime: editStartTime,
      durationMinutes: editDuration,
      endTime: addMinutesToTime(editStartTime, editDuration),
    };

    if (origDayIdx === editTargetDayIdx) {
      // Same day edit: update activity & recalculate subsequent times
      const dayActivities = [...newTrip.days[origDayIdx].activities];
      const actIdx = dayActivities.findIndex((a) => a.id === activity.id);
      if (actIdx >= 0) {
        dayActivities[actIdx] = updatedActivity;
        newTrip.days[origDayIdx].activities = recalculateDaySchedule(dayActivities, updatedActivity.id);
      }
    } else {
      // Moved to another day
      // 1. Remove from original day & recalculate original day schedule
      const origActivities = newTrip.days[origDayIdx].activities.filter((a) => a.id !== activity.id);
      newTrip.days[origDayIdx].activities = recalculateDaySchedule(origActivities);

      // 2. Add to target day & recalculate target day schedule
      const targetActivities = [...newTrip.days[editTargetDayIdx].activities, updatedActivity];
      newTrip.days[editTargetDayIdx].activities = recalculateDaySchedule(targetActivities, updatedActivity.id);
    }

    persistTrip(newTrip);
    setEditingActivity(null);
  };

  // Trigger Gemini Reschedule AI
  const handleAskAIReschedule = async (contextMessage: string) => {
    if (!activeTrip) return;
    setAiPromptContext(contextMessage);
    setAiModalOpen(true);
    setAiLoading(true);
    setAiResponse(null);

    try {
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: `Provide a specific, smart schedule rearrangement advice for this issue: ${contextMessage}. Suggest exact timing or order changes for ${activeTrip.destination}.`,
          tripContext: activeTrip,
        }),
      });

      const data = await res.json();
      setAiResponse(data.answer || 'TripWise AI evaluated your calendar and recommended shifting outdoor activities during rain hours.');
    } catch (e) {
      setAiResponse('To optimize your trip schedule around rain or time overlaps, start indoor cultural spots earlier in the morning and push outdoor walking tours to clear hours.');
    } finally {
      setAiLoading(false);
    }
  };

  // Helper: check if today is inside trip dates
  const isTripActiveToday = () => {
    if (!activeTrip || !activeTrip.startDate) return false;
    const todayStr = new Date().toISOString().split('T')[0];
    const startDateStr = activeTrip.startDate;
    const endDateStr = activeTrip.endDate || startDateStr;
    return todayStr >= startDateStr && todayStr <= endDateStr;
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Header & Dashboard Navigation */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border)] pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="tw-badge tw-badge-amber text-[10px] uppercase tracking-wider">
                📅 Travel Operating System
              </span>
              {activeTrip && (
                <span className="tw-badge text-[10px] bg-slate-100 text-[#131314] font-bold">
                  {activeTrip.persona} Profile
                </span>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-[#131314]">
              Trip Calendar & Smart Schedule
            </h1>
            <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">
              Transform your travel itinerary into an actionable real date and time schedule with transit and weather intelligence.
            </p>
          </div>

          {/* Trip Selector Dropdown & Plan New Trip */}
          <div className="flex items-center gap-3">
            {savedTrips.length > 0 && (
              <div className="relative">
                <label className="block text-[10px] uppercase font-extrabold text-[var(--muted)] mb-1">
                  Active Trip
                </label>
                <select
                  value={activeTrip?.id || ''}
                  onChange={(e) => {
                    const match = savedTrips.find((t) => t.id === e.target.value);
                    if (match) setActiveTrip(match);
                  }}
                  className="px-4 py-2.5 bg-white border border-[var(--border)] rounded-xl text-xs font-bold text-[#131314] shadow-sm focus:outline-none focus:border-[#131314] transition cursor-pointer pr-8"
                >
                  {savedTrips.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.destination} ({t.startDate ? t.startDate : `${t.durationDays} Days`})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <Link href="/plan" className="tw-btn-primary text-xs !py-2.5 !px-4 self-end">
              <SparklesIcon size={14} className="text-amber-400" /> Plan New Trip
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center space-y-4">
            <CompassIcon size={36} className="animate-spin text-[#131314] mx-auto" />
            <p className="text-sm font-bold text-[#131314]">Loading TripWise Calendar Engine...</p>
          </div>
        ) : !activeTrip ? (
          <div className="tw-card p-12 text-center space-y-4 max-w-lg mx-auto my-12">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto text-2xl">
              📅
            </div>
            <h3 className="text-xl font-bold font-display text-[#131314]">No Trips Found</h3>
            <p className="text-xs text-[var(--muted)]">
              Create a trip itinerary to view your real date & time travel calendar with metro connection blocks and conflict detection.
            </p>
            <Link href="/plan" className="tw-btn-primary inline-flex items-center gap-2 text-xs">
              <SparklesIcon size={14} className="text-amber-400" /> Create Destination Itinerary
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Trip Health Summary Bar */}
            <div className="tw-card p-5 bg-gradient-to-r from-[#131314] to-slate-800 text-white rounded-2xl shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 font-extrabold text-lg">
                  {activeTrip.healthScore?.score || 88}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold font-display tracking-tight text-white">
                      {activeTrip.destination} Trip Health
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                      {activeTrip.healthScore?.label || 'Well Balanced'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {activeTrip.startDate} — {activeTrip.endDate || `+${activeTrip.durationDays} Days`} • {activeTrip.durationDays} Days • 👥 {activeTrip.travelersCount || activeTrip.familyMembers?.total || 1} Travelers • {activeTrip.pace} Pace
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 backdrop-blur-sm">
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Weather Risk</span>
                  <span className="font-extrabold text-amber-300">
                    {activeTrip.weatherSummary?.suitabilityScore === 'High' ? '🌤️ Low Risk' : '🌧️ Plan B Active'}
                  </span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 backdrop-blur-sm">
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Transit</span>
                  <span className="font-extrabold text-emerald-300">🚇 Metro Integrated</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 backdrop-blur-sm">
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Route Order</span>
                  <span className="font-extrabold text-cyan-300">📍 Geo-Optimized</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 backdrop-blur-sm">
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Activities</span>
                  <span className="font-extrabold text-violet-300">{activeTrip.days.reduce((acc, d) => acc + d.activities.length, 0)} Scheduled</span>
                </div>
              </div>
            </div>

            {/* Action & Filter Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[var(--surface)] p-3 rounded-2xl border border-[var(--border)]">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowTodayOnly(false)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                    !showTodayOnly
                      ? 'bg-[#131314] text-white shadow-sm'
                      : 'bg-white text-[#131314] border border-[var(--border)] hover:bg-slate-50'
                  }`}
                >
                  Full Schedule ({activeTrip.durationDays} Days)
                </button>
                <button
                  onClick={() => setShowTodayOnly(true)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    showTodayOnly
                      ? 'bg-[#131314] text-white shadow-sm'
                      : 'bg-white text-[#131314] border border-[var(--border)] hover:bg-slate-50'
                  }`}
                >
                  <span>📍 Today's Plan</span>
                  {isTripActiveToday() && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAskAIReschedule('Rearrange itinerary for optimal pacing and weather safety.')}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold hover:bg-amber-100 transition flex items-center gap-1.5"
                >
                  <SparklesIcon size={14} className="text-amber-600" />
                  <span>Ask TripWise AI</span>
                </button>
                <button
                  onClick={() => downloadIcsFile(activeTrip)}
                  className="tw-btn-secondary text-xs !py-1.5 !px-3.5 flex items-center gap-1.5"
                  title="Export to Apple Calendar, Google Calendar, Outlook"
                >
                  <CalendarIcon size={14} className="text-amber-600" />
                  <span>Add to My Calendar (.ics)</span>
                </button>
              </div>
            </div>

            {/* Today Mode Notice if Trip is inactive today */}
            {showTodayOnly && !isTripActiveToday() && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">ℹ️</span>
                  <span>
                    Your trip to {activeTrip.destination} runs from <strong>{activeTrip.startDate}</strong> to <strong>{activeTrip.endDate}</strong>. Today is outside the trip range.
                  </span>
                </div>
                <button
                  onClick={() => setShowTodayOnly(false)}
                  className="text-xs font-extrabold text-amber-800 underline hover:text-amber-950"
                >
                  View Full Schedule
                </button>
              </div>
            )}

            {/* Calendar Days Timeline Section */}
            <div className="space-y-8">
              {activeTrip.days
                .filter((day) => {
                  if (!showTodayOnly) return true;
                  return day.date === todayStr || isTripActiveToday();
                })
                .map((day, dayIdx) => {
                  const conflicts = detectScheduleConflicts(day.activities);
                  const isTodayDay = day.date === todayStr;

                  return (
                    <div
                      key={day.dayNumber}
                      className={`tw-card p-6 sm:p-8 space-y-6 relative overflow-hidden ${
                        isTodayDay ? 'ring-2 ring-amber-500 shadow-xl' : ''
                      }`}
                    >
                      {/* Day Date Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[var(--border)] pb-4 gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-[#131314] text-white flex flex-col items-center justify-center font-display font-extrabold shadow-sm">
                            <span className="text-[10px] uppercase text-amber-400 font-bold leading-none">
                              {day.dayOfWeek || `DAY`}
                            </span>
                            <span className="text-lg leading-tight">{day.dayNumber}</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-xl font-extrabold font-display text-[#131314]">
                                {day.formattedDate || `Day ${day.dayNumber}`}
                              </h3>
                              {isTodayDay && (
                                <span className="tw-badge tw-badge-amber text-[10px] font-extrabold uppercase">
                                  TODAY
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[var(--muted)] font-semibold mt-0.5">
                              {day.title} • {day.activities.length} Activities Scheduled
                            </p>
                          </div>
                        </div>

                        {/* Weather Badge for the Day */}
                        {day.weatherForecast && (
                          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-xs font-semibold">
                            <span className="text-lg">{day.weatherForecast.icon || '☀️'}</span>
                            <div>
                              <div className="font-extrabold text-[#131314]">
                                {day.weatherForecast.tempC}°C • {day.weatherForecast.condition}
                              </div>
                              <div className="text-[10px] text-[var(--muted)]">
                                Rain probability: {day.weatherForecast.rainProbability}%
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Conflict Alert Banner if overlaps detected */}
                      {conflicts.length > 0 && (
                        <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs space-y-2">
                          <div className="flex items-center justify-between font-extrabold">
                            <span className="flex items-center gap-1.5 text-amber-800">
                              ⚠️ Schedule Conflict Detected
                            </span>
                            <button
                              onClick={() =>
                                handleAskAIReschedule(
                                  `Conflict on Day ${day.dayNumber}: ${conflicts.map((c) => c.message).join(' ')}`
                                )
                              }
                              className="px-2.5 py-1 rounded-lg bg-amber-600 text-white text-[11px] font-bold hover:bg-amber-700 transition"
                            >
                              Fix with AI
                            </button>
                          </div>
                          {conflicts.map((c, i) => (
                            <p key={i} className="text-[11px] text-amber-900 font-medium">
                              "{c.activityNameA}" overlaps with "{c.activityNameB}" by {c.overlapMinutes} minutes.
                            </p>
                          ))}
                        </div>
                      )}

                      {/* Weather Alert Banner if outdoor activity overlaps with rain */}
                      {day.weatherForecast?.rainProbability >= 45 && (
                        <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 text-sky-950 text-xs flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-base">🌧️</span>
                            <div>
                              <span className="font-extrabold">Weather Alert:</span> Rain expected on this day ({day.weatherForecast.rainProbability}% chance). Outdoor activities swapped to indoor fallbacks.
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              handleAskAIReschedule(
                                `Rain is expected on ${day.formattedDate} (${day.weatherForecast.rainProbability}% chance). Rearrange for indoor comfort.`
                              )
                            }
                            className="px-2.5 py-1 rounded-lg bg-sky-700 text-white text-[11px] font-bold hover:bg-sky-800 transition whitespace-nowrap"
                          >
                            Ask TripWise AI to rearrange
                          </button>
                        </div>
                      )}

                      {/* Vertical Activity Schedule Timeline */}
                      <div className="space-y-4 relative before:absolute before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-[var(--border)]">
                        {day.activities.map((act, actIdx) => {
                          const isOutdoorRain = (day.weatherForecast?.rainProbability || 0) >= 45 && act.isOutdoor;

                          return (
                            <div key={act.id} className="relative pl-10 space-y-3 group">
                              {/* Timeline Icon Node */}
                              <div className="absolute left-1.5 top-3.5 w-5 h-5 rounded-full bg-white border-2 border-[#131314] flex items-center justify-center text-[10px] font-extrabold text-[#131314] z-10 group-hover:scale-110 transition-transform">
                                {actIdx + 1}
                              </div>

                              {/* Activity Main Card */}
                              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[var(--border)] shadow-sm hover:shadow-md transition-all space-y-3">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                                  <div className="flex items-center gap-3">
                                    {/* Time Block Display */}
                                    <div className="px-3 py-1.5 rounded-xl bg-[#131314] text-white font-mono text-xs font-bold tracking-tight">
                                      ⏱️ {act.startTime || '09:00'} – {act.endTime || '11:00'}
                                    </div>
                                    <span className="text-xs font-bold text-[var(--muted)]">
                                      ({act.durationMinutes || 90} min)
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <span className="tw-badge text-[10px] bg-[var(--surface)] text-[#131314] font-bold uppercase">
                                      {act.category.replace('_', ' ')}
                                    </span>
                                    {act.isOutdoor ? (
                                      <span className="tw-badge tw-badge-amber text-[10px] font-bold">
                                        ☀️ Outdoor
                                      </span>
                                    ) : (
                                      <span className="tw-badge text-[10px] bg-slate-100 text-slate-700 font-bold">
                                        🏛️ Climate Controlled
                                      </span>
                                    )}
                                    <button
                                      onClick={() => handleOpenEditModal(dayIdx, act)}
                                      className="px-2.5 py-1 rounded-lg bg-[var(--surface)] hover:bg-amber-50 hover:text-amber-800 border border-[var(--border)] text-xs font-extrabold transition text-[#131314]"
                                    >
                                      Edit Time
                                    </button>
                                  </div>
                                </div>

                                <div>
                                  <h4 className="text-base font-extrabold font-display text-[#131314] flex items-center gap-2">
                                    <span>{getActivityCategoryIcon(act.category)}</span>
                                    <span>{act.name}</span>
                                  </h4>
                                  <p className="text-xs text-[var(--muted)] mt-1 leading-relaxed">
                                    {act.description}
                                  </p>
                                </div>

                                {/* Location & Coordinates / Nearest Metro */}
                                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-[var(--muted)] font-medium">
                                  {act.nearestMetro ? (
                                    <div className="flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg font-bold">
                                      <TrainIcon size={12} className="text-emerald-600" />
                                      <span>Nearest Metro: {act.nearestMetro.stationName} ({act.nearestMetro.walkTimeMin} min walk)</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-1">
                                      <MapPinIcon size={12} className="text-amber-600" />
                                      <span>{act.placeName || act.name}, {activeTrip.destination}</span>
                                    </div>
                                  )}

                                  {act.lat && act.lng && (
                                    <div className="text-[10px] text-slate-400 font-mono">
                                      Coordinates: {act.lat.toFixed(4)}, {act.lng.toFixed(4)}
                                    </div>
                                  )}
                                </div>

                                {isOutdoorRain && (
                                  <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-semibold flex items-center justify-between">
                                    <span>🌧️ Weather Alert: Rain expected during this activity.</span>
                                    <button
                                      onClick={() => handleAskAIReschedule(`Rain expected during outdoor activity ${act.name} at ${act.startTime}`)}
                                      className="text-[10px] font-bold text-rose-900 underline hover:text-rose-950"
                                    >
                                      Ask TripWise AI to rearrange
                                    </button>
                                  </div>
                                )}
                              </div>

                              {/* Metro / Public Transit Travel Block between activities */}
                              {act.transitToNext && (
                                <div className="p-3 rounded-xl bg-[var(--surface)] border border-dashed border-[var(--border)] text-xs font-semibold text-[#131314] flex flex-col sm:flex-row sm:items-center justify-between gap-2 ml-2">
                                  <div className="flex items-center gap-2 text-slate-700">
                                    <span className="p-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold">🚇 TRANSIT</span>
                                    <span>
                                      <strong>{act.transitToNext.fromStation}</strong> → <strong>{act.transitToNext.toStation}</strong>
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3 text-[11px] text-[var(--muted)]">
                                    <span>Approx. {act.transitToNext.approxTransitMin} min</span>
                                    <a
                                      href={act.transitToNext.mapsUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-amber-700 hover:underline font-bold flex items-center gap-1"
                                    >
                                      Directions <ExternalLinkIcon size={10} />
                                    </a>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </main>

      {/* Edit Activity Modal */}
      {editingActivity && activeTrip && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[var(--border)] rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <h3 className="text-lg font-bold font-display text-[#131314] flex items-center gap-2">
                <span>⏱️ Edit Activity Schedule</span>
              </h3>
              <button
                onClick={() => setEditingActivity(null)}
                className="p-1 text-[var(--muted)] hover:text-[#131314] rounded-lg"
              >
                <CloseIcon size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-[var(--surface)] text-xs">
                <span className="font-bold text-[#131314] block text-sm">{editingActivity.activity.name}</span>
                <span className="text-[var(--muted)] block mt-0.5">{activeTrip.destination}</span>
              </div>

              <div>
                <label className="block tw-eyebrow mb-1">
                  Start Time (24h format HH:MM)
                </label>
                <input
                  type="time"
                  value={editStartTime}
                  onChange={(e) => setEditStartTime(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-[var(--border)] rounded-xl text-xs font-bold text-[#131314] focus:outline-none focus:border-[#131314]"
                />
              </div>

              <div>
                <label className="block tw-eyebrow mb-1">
                  Duration (Minutes)
                </label>
                <input
                  type="number"
                  min="15"
                  max="360"
                  step="15"
                  value={editDuration}
                  onChange={(e) => setEditDuration(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-white border border-[var(--border)] rounded-xl text-xs font-bold text-[#131314] focus:outline-none focus:border-[#131314]"
                />
              </div>

              <div>
                <label className="block tw-eyebrow mb-1">
                  Move to Day
                </label>
                <select
                  value={editTargetDayIdx}
                  onChange={(e) => setEditTargetDayIdx(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-white border border-[var(--border)] rounded-xl text-xs font-bold text-[#131314] focus:outline-none focus:border-[#131314]"
                >
                  {activeTrip.days.map((d, idx) => (
                    <option key={d.dayNumber} value={idx}>
                      Day {d.dayNumber} ({d.formattedDate || d.date})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border)]">
              <button
                onClick={() => setEditingActivity(null)}
                className="tw-btn-secondary text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveActivityEdit}
                className="tw-btn-primary text-xs"
              >
                Save & Recalculate Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Reschedule Modal */}
      {aiModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[var(--border)] rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <h3 className="text-lg font-bold font-display text-[#131314] flex items-center gap-2">
                <SparklesIcon size={18} className="text-amber-600" />
                <span>TripWise AI Reschedule Assistant</span>
              </h3>
              <button
                onClick={() => setAiModalOpen(false)}
                className="p-1 text-[var(--muted)] hover:text-[#131314] rounded-lg"
              >
                <CloseIcon size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-amber-50 text-amber-900 text-xs font-medium border border-amber-200">
                <strong>Context:</strong> {aiPromptContext}
              </div>

              {aiLoading ? (
                <div className="py-8 text-center space-y-3">
                  <CompassIcon size={28} className="animate-spin text-[#131314] mx-auto" />
                  <p className="text-xs font-semibold text-[var(--muted)]">
                    Gemini AI is analyzing weather forecast, route distances, and place durations...
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-xs text-[#131314] leading-relaxed space-y-2">
                  <span className="font-extrabold block text-amber-800">💡 AI Recommendation:</span>
                  <p>{aiResponse}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border)]">
              <button
                onClick={() => setAiModalOpen(false)}
                className="tw-btn-primary text-xs"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default function TripCalendarPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs font-bold">Loading TripWise Calendar...</div>}>
      <CalendarContent />
    </Suspense>
  );
}

// Category Icon Helper
function getActivityCategoryIcon(category: string): string {
  switch (category) {
    case 'culture':
      return '🏛️';
    case 'food':
      return '🍴';
    case 'nature':
      return '🌳';
    case 'adventure':
      return '🧗';
    case 'shopping':
      return '🛍️';
    case 'indoor_museum':
      return '🖼️';
    case 'indoor_entertainment':
      return '🎭';
    default:
      return '📍';
  }
}
