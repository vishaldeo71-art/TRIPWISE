'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Trip } from '@/types/trip';
import {
  Plus,
  Compass,
  MapPin,
  Calendar,
  Sun,
  User,
  Trash2,
  ExternalLink,
  Share2,
  CloudSun,
  Sparkles
} from 'lucide-react';
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
          // Merge Supabase trips
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

          // Combine with unique IDs
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

    // Delete locally
    const updated = trips.filter((t) => t.id !== id);
    setTrips(updated);
    localStorage.setItem('tripwise_saved_trips', JSON.stringify(updated));

    // Delete from Supabase if present
    try {
      await supabase.from('trips').delete().eq('id', id);
    } catch (e) {
      console.log('Local delete complete');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Header Banner */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-sky-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" /> Personal Travel Dashboard
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
              Where are you going next?
            </h1>
            <p className="text-slate-400 text-sm">
              Manage your weather-adapted itineraries and plan new destinations.
            </p>
          </div>

          <Link
            href="/plan"
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 via-sky-500 to-indigo-600 hover:from-brand-500 hover:to-sky-400 text-white font-bold text-sm shadow-xl shadow-brand-500/20 transition hover:scale-105 flex items-center gap-2 shrink-0"
          >
            <Plus className="w-5 h-5" />
            <span>Create New Trip</span>
          </Link>
        </div>

        {/* Section Heading */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-sky-400" /> My Saved Trips
          </h2>
          <span className="text-xs text-slate-500 font-medium">{trips.length} Saved</span>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card p-6 rounded-2xl border border-slate-800 animate-pulse h-48" />
            ))}
          </div>
        ) : trips.length === 0 ? (
          /* Empty State */
          <div className="glass-card rounded-3xl p-12 text-center border border-slate-800 max-w-lg mx-auto my-8">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mx-auto mb-4">
              <CloudSun className="w-8 h-8 text-sky-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">You haven&apos;t planned a trip yet.</h3>
            <p className="text-sm text-slate-400 mb-6">
              Create your first weather-aware itinerary for any city in the world.
            </p>
            <Link
              href="/plan"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm transition"
            >
              <Plus className="w-4 h-4" /> Create your first trip
            </Link>
          </div>
        ) : (
          /* Trips Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => (
              <div
                key={trip.id || Math.random()}
                className="glass-card glass-card-hover rounded-2xl p-6 border border-slate-800 flex flex-col justify-between relative group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-sky-400 font-semibold uppercase tracking-wider mb-0.5">
                        <MapPin className="w-3.5 h-3.5" /> {trip.destination}
                      </div>
                      <h3 className="text-xl font-extrabold text-white group-hover:text-brand-300 transition">
                        {trip.destination}
                      </h3>
                    </div>

                    <span className="px-2.5 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-bold shrink-0">
                      {trip.durationDays} {trip.durationDays === 1 ? 'Day' : 'Days'}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs text-slate-400 mb-4">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-1">
                      <User className="w-3 h-3 text-purple-400" /> {trip.persona}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
                      ⚡ {trip.pace}
                    </span>
                    {trip.healthScore && (
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold">
                        Score {trip.healthScore.score}/100
                      </span>
                    )}
                  </div>

                  {trip.weatherSummary && (
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 mb-4 text-xs text-slate-300 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Sun className="w-4 h-4 text-amber-400" />
                        {trip.weatherSummary.avgTempC}°C • {trip.weatherSummary.overallCondition}
                      </span>
                      <span className="text-slate-500">Outdoor: {trip.weatherSummary.suitabilityScore}</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {trip.createdAt ? new Date(trip.createdAt).toLocaleDateString() : 'Recent'}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDeleteTrip(trip.id)}
                      className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                      title="Delete Trip"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <Link
                      href={`/trip/${trip.shareId || trip.id}`}
                      className="px-3.5 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold flex items-center gap-1 transition shadow"
                    >
                      Open <ExternalLink className="w-3 h-3" />
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
