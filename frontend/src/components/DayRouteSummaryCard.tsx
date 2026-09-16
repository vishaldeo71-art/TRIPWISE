'use client';

import { Activity, DayRouteSummary } from '@/types/trip';
import { NavigationIcon, ClockIcon, MapPinIcon } from '@/components/Icons';

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
    <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-white/[0.07] bg-[#0E121A]/80 shadow-xl space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <NavigationIcon size={16} />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-slate-200 uppercase tracking-wider">
              Day {dayNumber} Route Flow • {destination}
            </h4>
            <p className="text-[11px] text-slate-400">
              Sequential route order & public transport links
            </p>
          </div>
        </div>

        {routeSummary && (
          <div className="flex items-center gap-3 text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5 bg-slate-950/80 px-3 py-1 rounded-xl border border-slate-800/80">
              <ClockIcon size={14} className="text-sky-400" />
              Est. Transit: ~{routeSummary.estTransitTimeMin} mins
            </span>
            <span className="flex items-center gap-1.5 bg-slate-950/80 px-3 py-1 rounded-xl border border-slate-800/80">
              <MapPinIcon size={14} className="text-emerald-400" />
              ~{routeSummary.totalDistanceKm} km
            </span>
          </div>
        )}
      </div>

      {/* Route Flow Sequence */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none text-xs">
        {activities.map((act, idx) => {
          const placeName = act.placeName || act.name.split('&')[0].trim();
          const metroName = act.nearestMetro ? act.nearestMetro.stationName : null;

          return (
            <div key={act.id || idx} className="flex items-center gap-2 shrink-0">
              {/* Attraction Step */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 shadow-sm">
                <span className="text-amber-400 font-bold">📍</span>
                <span className="font-extrabold text-white text-xs">{placeName}</span>
                {metroName && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-lg bg-sky-500/10 text-sky-300 border border-sky-500/20 font-medium">
                    🚇 {metroName}
                  </span>
                )}
              </div>

              {/* Transit Step to Next */}
              {idx < activities.length - 1 && (
                <div className="flex items-center gap-1 text-slate-500 px-1 font-bold text-xs">
                  <span>→</span>
                  {act.transitToNext && (
                    <span className="text-[10px] text-slate-400 font-medium">
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
