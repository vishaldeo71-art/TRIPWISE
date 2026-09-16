'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowRightIcon, CloseIcon } from '@/components/Icons';

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
    <div className="relative overflow-hidden rounded-2xl bg-amber-500/10 dark:bg-[#121622]/90 border border-amber-500/30 p-4 sm:p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 shrink-0 mt-0.5">
            <span className="text-base">🔔</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 font-extrabold border border-amber-500/30">
                Upcoming Trip Reminder
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
              Your trip to <span className="text-amber-700 dark:text-amber-300 font-extrabold">{destination}</span> starts {startDateText}!
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              Review your weather-adapted itinerary, smart route, and metro connections before departure.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <Link
            href={tripId ? `/trip/${tripId}#itinerary-section` : '#itinerary-section'}
            onClick={handleViewTrip}
            className="flex items-center space-x-1.5 text-xs px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <span>View Trip</span>
            <ArrowRightIcon size={14} />
          </Link>
          <button
            onClick={() => setDismissed(true)}
            className="p-1.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-stone-200 dark:hover:bg-slate-800/80 transition-colors"
          >
            <CloseIcon size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
