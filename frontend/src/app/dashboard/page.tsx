'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Trip } from '@/types/trip';
import {
  PlusIcon,
  CompassIcon,
  MapPinIcon,
  CalendarIcon,
  SunIcon,
  UserIcon,
  TrashIcon,
  ExternalLinkIcon,
  SparklesIcon,
} from '@/components/Icons';
import TripReminderBanner from '@/components/TripReminderBanner';
import { supabase } from '@/lib/supabase';

export default function DashboardPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadTrips(); }, []);

  const loadTrips = async () => {
    setLoading(true);
    let localSaved: Trip[] = [];

    try {
      const stored = localStorage.getItem('tripwise_saved_trips');
      if (stored) localSaved = JSON.parse(stored);
    } catch (e) {
      console.error('Error reading local trips:', e);
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase.from('trips').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          const remoteTrips: Trip[] = data.map((item) => ({
            id: item.id, shareId: item.share_id, destination: item.destination,
            latitude: item.latitude, longitude: item.longitude, durationDays: item.duration,
            persona: item.persona, pace: item.travel_pace, interests: item.interests || [],
            weatherSummary: item.weather_summary, days: item.itinerary, healthScore: item.trip_score,
            createdAt: item.created_at,
          }));
          const combined = [...remoteTrips];
          localSaved.forEach((local) => { if (!combined.some((t) => t.id === local.id)) combined.push(local); });
          setTrips(combined);
          setLoading(false);
          return;
        }
      }
    } catch {
      console.log('Supabase read fallback to local storage');
    }

    setTrips(localSaved);
    setLoading(false);
  };

  const handleDeleteTrip = async (id?: string) => {
    if (!id) return;
    if (!confirm('Are you sure you want to delete this trip?')) return;
    const updated = trips.filter((t) => t.id !== id);
    setTrips(updated);
    localStorage.setItem('tripwise_saved_trips', JSON.stringify(updated));
    try { await supabase.from('trips').delete().eq('id', id); } catch { console.log('Local delete complete'); }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F5F0] dark:bg-[#07090F] text-slate-900 dark:text-[#F0F4FF] transition-colors">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Trip Reminder Banner */}
        {trips.length > 0 && (
          <TripReminderBanner destination={trips[0].destination} startDateText="Tomorrow" tripId={trips[0].id} />
        )}

        {/* Header */}
        <div className="tw-card p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-amber-400/8 dark:bg-amber-400/5 blur-3xl pointer-events-none" />
          <div className="space-y-1.5 relative">
            <div className="tw-badge tw-badge-amber inline-flex">
              <SparklesIcon size={11} />
              Personal Dashboard
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              Where are you going next?
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
              Manage your destination-specific itineraries and plan new adventures.
            </p>
          </div>
          <Link
            href="/plan"
            className="tw-btn-primary px-6 py-3.5 rounded-2xl text-sm flex items-center gap-2 shrink-0 relative"
          >
            <PlusIcon size={16} />
            <span>Create New Trip</span>
          </Link>
        </div>

        {/* Section heading */}
        <div className="flex items-center justify-between pt-1">
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <CompassIcon size={16} className="text-amber-500" />
            My Saved Trips
          </h2>
          <span className="tw-badge tw-badge-amber">{trips.length} Saved</span>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="tw-card h-56 tw-shimmer" />
            ))}
          </div>
        ) : trips.length === 0 ? (
          /* Empty */
          <div className="tw-card rounded-3xl p-12 text-center max-w-md mx-auto my-8">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
              <SunIcon size={26} className="text-amber-500" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-2">No trips yet</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-6 leading-relaxed font-medium">
              Create your first destination-specific, weather-adapted itinerary for any city in the world.
            </p>
            <Link
              href="/plan"
              className="tw-btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm"
            >
              <PlusIcon size={15} />
              Create your first trip
            </Link>
          </div>
        ) : (
          /* Trip grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {trips.map((trip) => (
              <div
                key={trip.id || Math.random()}
                className="tw-card tw-card-lift p-6 flex flex-col justify-between group cursor-default"
              >
                <div>
                  {/* Destination header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400 font-extrabold uppercase tracking-wider mb-1">
                        <MapPinIcon size={11} />
                        {trip.destination}
                      </div>
                      <h3 className="text-xl font-extrabold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors">
                        {trip.destination}
                      </h3>
                    </div>
                    <span className="tw-badge tw-badge-amber shrink-0">
                      {trip.durationDays} {trip.durationDays === 1 ? 'Day' : 'Days'}
                    </span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    <span className="px-2.5 py-1 rounded-xl bg-stone-100 dark:bg-white/[0.05] border border-stone-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 text-[11px] font-semibold flex items-center gap-1">
                      <UserIcon size={11} className="text-amber-500" />
                      {trip.persona}
                    </span>
                    <span className="px-2.5 py-1 rounded-xl bg-stone-100 dark:bg-white/[0.05] border border-stone-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 text-[11px] font-semibold">
                      ⚡ {trip.pace}
                    </span>
                    {trip.healthScore && (
                      <span className="tw-badge tw-badge-emerald">
                        Score {trip.healthScore.score}/100
                      </span>
                    )}
                  </div>

                  {/* Weather */}
                  {trip.weatherSummary && (
                    <div className="p-3 rounded-xl bg-stone-100 dark:bg-white/[0.04] border border-stone-200 dark:border-white/[0.07] mb-4 text-xs text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 font-semibold">
                        <SunIcon size={13} className="text-amber-500" />
                        {trip.weatherSummary.avgTempC}°C · {trip.weatherSummary.overallCondition}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 font-bold text-[11px]">
                        {trip.weatherSummary.suitabilityScore}
                      </span>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="pt-3 border-t tw-divider flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium text-[11px]">
                    <CalendarIcon size={11} />
                    {trip.createdAt ? new Date(trip.createdAt).toLocaleDateString() : 'Recent'}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDeleteTrip(trip.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition"
                      title="Delete Trip"
                    >
                      <TrashIcon size={13} />
                    </button>
                    <Link
                      href={`/trip/${trip.shareId || trip.id}`}
                      className="tw-btn-primary px-4 py-2 rounded-xl text-xs flex items-center gap-1.5"
                    >
                      <span>View Trip</span>
                      <ExternalLinkIcon size={11} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
