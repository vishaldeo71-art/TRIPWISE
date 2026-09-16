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
    if (onViewTrip) { e.preventDefault(); onViewTrip(); return; }
    const el = document.getElementById('itinerary-section');
    if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth' }); }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-amber-500/10 border border-amber-500/25 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/25 shrink-0">
            <span className="text-base">🔔</span>
          </div>
          <div>
            <span className="tw-badge tw-badge-amber mb-1.5 inline-flex">Upcoming Trip Reminder</span>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Your trip to <span className="text-amber-700 dark:text-amber-300 font-extrabold">{destination}</span> starts {startDateText}!
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Review your weather-adapted itinerary, smart route, and metro connections before departure.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={tripId ? `/trip/${tripId}#itinerary-section` : '#itinerary-section'}
            onClick={handleViewTrip}
            className="tw-btn-primary flex items-center gap-1.5 text-xs px-3.5 py-2 rounded-xl"
          >
            <span>View Trip</span>
            <ArrowRightIcon size={13} />
          </Link>
          <button
            onClick={() => setDismissed(true)}
            className="p-1.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition"
            aria-label="Dismiss reminder"
          >
            <CloseIcon size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
