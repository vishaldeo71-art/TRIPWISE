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
    <div className="min-h-screen flex flex-col bg-white text-[#131314] font-sans">
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
        <div className="tw-card p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-1.5 z-10">
            <span className="tw-badge tw-badge-amber">
              <SparklesIcon size={14} className="text-amber-600" /> Saved Travel Plans
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold font-display text-[#131314]">
              Where are you going next?
            </h1>
            <p className="text-[var(--muted)] text-xs sm:text-sm font-medium">
              Manage your saved destination-specific itineraries or generate a new custom plan.
            </p>
          </div>

          <Link
            href="/plan"
            className="tw-btn-primary text-xs shrink-0 z-10 !py-3 !px-5"
          >
            <PlusIcon size={16} />
            <span>Create New Trip</span>
          </Link>
        </div>

        {/* Section Heading */}
        <div className="flex items-center justify-between pt-2">
          <h2 className="text-base font-extrabold font-display text-[#131314] flex items-center gap-2">
            <CompassIcon size={18} className="text-amber-600" /> My Saved Trips
          </h2>
          <span className="tw-badge tw-badge-amber font-bold">{trips.length} Saved</span>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="tw-card p-6 animate-pulse h-52 bg-[var(--surface)]" />
            ))}
          </div>
        ) : trips.length === 0 ? (
          /* Empty State */
          <div className="tw-card p-12 text-center max-w-lg mx-auto my-8">
            <div className="w-14 h-14 rounded-2xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-[var(--muted)] mx-auto mb-4">
              <SunIcon size={28} className="text-amber-600" />
            </div>
            <h3 className="text-lg font-extrabold font-display text-[#131314] mb-2">No trips saved yet</h3>
            <p className="text-xs text-[var(--muted)] mb-6 leading-relaxed font-medium">
              Create your first destination-specific, weather-adapted itinerary for Delhi, Tokyo, Paris, or any city.
            </p>
            <Link
              href="/plan"
              className="tw-btn-primary text-xs"
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
                className="tw-card-lift p-6 flex flex-col justify-between relative group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-1.5 text-[11px] text-amber-600 font-bold uppercase tracking-wider mb-0.5">
                        <MapPinIcon size={12} /> {trip.destination}
                      </div>
                      <h3 className="text-xl font-extrabold font-display text-[#131314]">
                        {trip.destination}
                      </h3>
                    </div>

                    <span className="tw-badge tw-badge-amber shrink-0 font-bold">
                      {trip.durationDays} {trip.durationDays === 1 ? 'Day' : 'Days'}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs text-[var(--muted)] mb-4">
                    <span className="tw-badge">
                      <UserIcon size={12} className="text-amber-600" /> {trip.persona}
                    </span>
                    <span className="tw-badge">
                      ⚡ {trip.pace}
                    </span>
                    {trip.healthScore && (
                      <span className="tw-badge tw-badge-emerald font-bold">
                        Score {trip.healthScore.score}/100
                      </span>
                    )}
                  </div>

                  {trip.weatherSummary && (
                    <div className="p-3.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] mb-4 text-xs text-[#131314] flex items-center justify-between">
                      <span className="flex items-center gap-1.5 font-semibold text-[11px]">
                        <SunIcon size={14} className="text-amber-600" />
                        {trip.weatherSummary.avgTempC}°C • {trip.weatherSummary.overallCondition}
                      </span>
                      <span className="text-[var(--muted)] font-bold text-[11px]">Outdoor: {trip.weatherSummary.suitabilityScore}</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs">
                  <span className="text-[var(--muted)] flex items-center gap-1 font-medium text-[11px]">
                    <CalendarIcon size={12} />
                    {trip.createdAt ? new Date(trip.createdAt).toLocaleDateString() : 'Recent'}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDeleteTrip(trip.id)}
                      className="p-2 rounded-xl text-[var(--muted)] hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Delete Trip"
                    >
                      <TrashIcon size={14} />
                    </button>
                    <Link
                      href={`/trip/${trip.shareId || trip.id}`}
                      className="tw-btn-primary text-xs !py-1.5 !px-3"
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
