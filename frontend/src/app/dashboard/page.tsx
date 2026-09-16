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
  SparklesIcon
} from '@/components/Icons';
import TripReminderBanner from '@/components/TripReminderBanner';
import { supabase } from '@/lib/supabase';

export default function DashboardPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    setLoading(true);
    let localSaved: Trip[] = [];

    // Load from LocalStorage first
    try {
      const stored = localStorage.getItem('tripwise_saved_trips');
      if (stored) {
        localSaved = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error reading local trips:', e);
    }

    // Try loading from Supabase if logged in
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
            persona: item.persona,
            pace: item.travel_pace,
            interests: item.interests || [],
            weatherSummary: item.weather_summary,
            days: item.itinerary,
            healthScore: item.trip_score,
            createdAt: item.created_at,
          }));

          const combined = [...remoteTrips];
          localSaved.forEach((local) => {
            if (!combined.some((t) => t.id === local.id)) {
              combined.push(local);
            }
          });
          setTrips(combined);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
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

    try {
      await supabase.from('trips').delete().eq('id', id);
    } catch (e) {
      console.log('Local delete complete');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#080B10] text-slate-100 font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Trip Reminder Banner */}
        {trips.length > 0 && (
          <TripReminderBanner
            destination={trips[0].destination}
            startDateText="Tomorrow"
            tripId={trips[0].id}
          />
        )}

        {/* Top Header Banner */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/[0.08] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden shadow-2xl">
          <div className="space-y-1.5 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-extrabold">
              <SparklesIcon size={14} className="text-amber-400" /> Personal Dashboard
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
              Where are you going next?
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm font-medium">
              Manage your saved destination-specific itineraries and plan new trips.
            </p>
          </div>

          <Link
            href="/plan"
            className="px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 shrink-0 z-10"
          >
            <PlusIcon size={16} />
            <span>Create New Trip</span>
          </Link>
        </div>

        {/* Section Heading */}
        <div className="flex items-center justify-between pt-2">
          <h2 className="text-base font-extrabold text-white flex items-center gap-2">
            <CompassIcon size={18} className="text-amber-400" /> My Saved Trips
          </h2>
          <span className="text-xs text-amber-300 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 font-bold">{trips.length} Saved</span>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-panel p-6 rounded-3xl border border-white/[0.07] animate-pulse h-52" />
            ))}
          </div>
        ) : trips.length === 0 ? (
          /* Empty State */
          <div className="glass-panel rounded-3xl p-12 text-center border border-white/[0.08] max-w-lg mx-auto my-8 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-slate-500 mx-auto mb-4">
              <SunIcon size={28} className="text-amber-400" />
            </div>
            <h3 className="text-lg font-extrabold text-white mb-2">No trips saved yet.</h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed font-medium">
              Create your first destination-specific, weather-adapted itinerary for any city.
            </p>
            <Link
              href="/plan"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs transition shadow-md"
            >
              <PlusIcon size={16} /> Create your first trip
            </Link>
          </div>
        ) : (
          /* Trips Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => (
              <div
                key={trip.id || Math.random()}
                className="glass-panel glass-card-hover rounded-3xl p-6 border border-white/[0.07] flex flex-col justify-between relative group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-1.5 text-[11px] text-amber-400 font-extrabold uppercase tracking-wider mb-1">
                        <MapPinIcon size={12} /> {trip.destination}
                      </div>
                      <h3 className="text-xl font-extrabold text-white group-hover:text-amber-200 transition-colors">
                        {trip.destination}
                      </h3>
                    </div>

                    <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-extrabold shrink-0">
                      {trip.durationDays} {trip.durationDays === 1 ? 'Day' : 'Days'}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs text-slate-400 mb-4">
                    <span className="px-2.5 py-1 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300 flex items-center gap-1 font-semibold text-[11px]">
                      <UserIcon size={12} className="text-amber-400" /> {trip.persona}
                    </span>
                    <span className="px-2.5 py-1 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300 font-semibold text-[11px]">
                      ⚡ {trip.pace}
                    </span>
                    {trip.healthScore && (
                      <span className="px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-extrabold text-[11px]">
                        Score {trip.healthScore.score}/100
                      </span>
                    )}
                  </div>

                  {trip.weatherSummary && (
                    <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 mb-4 text-xs text-slate-300 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 font-semibold text-[11px]">
                        <SunIcon size={14} className="text-amber-400" />
                        {trip.weatherSummary.avgTempC}°C • {trip.weatherSummary.overallCondition}
                      </span>
                      <span className="text-slate-400 font-bold text-[11px]">Outdoor: {trip.weatherSummary.suitabilityScore}</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1 font-medium text-[11px]">
                    <CalendarIcon size={12} />
                    {trip.createdAt ? new Date(trip.createdAt).toLocaleDateString() : 'Recent'}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDeleteTrip(trip.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition"
                      title="Delete Trip"
                    >
                      <TrashIcon size={14} />
                    </button>
                    <Link
                      href={`/trip/${trip.shareId || trip.id}`}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 transition shadow-sm"
                    >
                      <span>Open</span> <ExternalLinkIcon size={12} />
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
