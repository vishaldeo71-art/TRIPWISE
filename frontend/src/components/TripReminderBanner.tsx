'use client';

import { Bell, Calendar, MapPin, ArrowRight, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface TripReminderBannerProps {
  destination?: string;
  startDateText?: string;
  tripId?: string;
  onViewTrip?: () => void;
}

export default function TripReminderBanner({
  destination = 'Delhi',
  startDateText = 'Tomorrow',
  tripId,
  onViewTrip,
}: TripReminderBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleViewTrip = (e: React.MouseEvent) => {
    if (onViewTrip) {
      e.preventDefault();
      onViewTrip();
      return;
    }

    const itineraryEl = document.getElementById('itinerary-section');
    if (itineraryEl) {
      e.preventDefault();
      itineraryEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-sky-900/40 via-indigo-900/30 to-purple-900/40 border border-sky-500/20 p-4 sm:p-5 shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 shrink-0 mt-0.5">
            <Bell className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-semibold border border-sky-500/30">
                Upcoming Trip Reminder
              </span>
            </div>
            <h4 className="text-sm font-bold text-white mt-1">
              Your trip to <span className="text-sky-300">{destination}</span> starts {startDateText}!
            </h4>
            <p className="text-xs text-slate-300 mt-0.5">
              Check your weather-aware itinerary forecast and smart route before departure.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <Link
            href={tripId ? `/trip/${tripId}#itinerary-section` : '#itinerary-section'}
            onClick={handleViewTrip}
            className="flex items-center space-x-1.5 text-xs px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-medium shadow-md transition-colors cursor-pointer"
          >
            <span>View Trip</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={() => setDismissed(true)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
