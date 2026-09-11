'use client';

import { Activity, DayRouteSummary } from '@/types/trip';
import { MapPin, Navigation, Clock, ExternalLink } from 'lucide-react';

interface DayRouteSummaryCardProps {
  destination: string;
  dayNumber: number;
  routeSummary?: DayRouteSummary;
  activities: Activity[];
}

export default function DayRouteSummaryCard({
  destination,
  dayNumber,
  routeSummary,
  activities,
}: DayRouteSummaryCardProps) {
  if (!activities || activities.length === 0) return null;

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800 bg-slate-900/60 shadow-lg space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Day {dayNumber} Route Flow • {destination}
            </h4>
            <p className="text-[11px] text-slate-400">
              Compact transit itinerary & nearest metro stations
            </p>
          </div>
        </div>

        {routeSummary && (
          <div className="flex items-center gap-3 text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              Est. Transit: ~{routeSummary.estTransitTimeMin} mins
            </span>
            <span className="flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              ~{routeSummary.totalDistanceKm} km
            </span>
          </div>
        )}
      </div>

      {/* Route Flow Sequence */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none text-xs">
        {activities.map((act, idx) => {
          const placeName = act.placeName || act.name.split('&')[0].trim();
          const metroName = act.nearestMetro ? act.nearestMetro.stationName : null;

          return (
            <div key={act.id || idx} className="flex items-center gap-1.5 shrink-0">
              {/* Attraction Step */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 shadow-sm">
                <span className="text-rose-400 font-bold">📍</span>
                <span className="font-extrabold text-white text-xs">{placeName}</span>
                {metroName && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-sky-500/10 text-sky-300 border border-sky-500/20 font-medium">
                    🚇 {metroName}
                  </span>
                )}
              </div>

              {/* Transit Step to Next */}
              {idx < activities.length - 1 && (
                <div className="flex items-center gap-1 text-slate-500 px-1 font-bold text-xs">
                  <span>→</span>
                  {act.transitToNext && (
                    <span className="text-[10px] text-slate-400 font-normal">
                      (~{act.transitToNext.approxTransitMin}m)
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
