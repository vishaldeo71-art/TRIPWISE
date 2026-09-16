'use client';

import { Activity, DayRouteSummary } from '@/types/trip';
import { NavigationIcon, ClockIcon, MapPinIcon } from '@/components/Icons';

interface DayRouteSummaryCardProps {
  destination: string;
  dayNumber: number;
  routeSummary?: DayRouteSummary;
  activities: Activity[];
}

export default function DayRouteSummaryCard({ destination, dayNumber, routeSummary, activities }: DayRouteSummaryCardProps) {
  if (!activities || activities.length === 0) return null;

  return (
    <div className="tw-card p-4 sm:p-5 space-y-3">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b tw-divider">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <NavigationIcon size={15} />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              Day {dayNumber} Route · {destination}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Sequential route order &amp; transit links
            </p>
          </div>
        </div>

        {routeSummary && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1.5 bg-stone-100 dark:bg-white/[0.04] px-3 py-1.5 rounded-xl border border-stone-200 dark:border-white/[0.07] text-xs font-semibold text-slate-700 dark:text-slate-300">
              <ClockIcon size={12} className="text-sky-500" />
              ~{routeSummary.estTransitTimeMin} min transit
            </span>
            <span className="flex items-center gap-1.5 bg-stone-100 dark:bg-white/[0.04] px-3 py-1.5 rounded-xl border border-stone-200 dark:border-white/[0.07] text-xs font-semibold text-slate-700 dark:text-slate-300">
              <MapPinIcon size={12} className="text-emerald-500" />
              ~{routeSummary.totalDistanceKm} km
            </span>
          </div>
        )}
      </div>

      {/* Route sequence */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none text-xs">
        {activities.map((act, idx) => {
          const placeName = act.placeName || act.name.split('&')[0].trim();
          const metroName = act.nearestMetro?.stationName;

          return (
            <div key={act.id || idx} className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-white/[0.04] border border-stone-200 dark:border-white/[0.07]">
                <span className="text-amber-500 font-bold">📍</span>
                <span className="font-bold text-slate-900 dark:text-white text-[11px]">{placeName}</span>
                {metroName && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-lg bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20 font-medium">
                    🚇 {metroName}
                  </span>
                )}
              </div>

              {idx < activities.length - 1 && (
                <div className="flex items-center gap-0.5 text-slate-400 dark:text-slate-500 font-bold shrink-0">
                  <span>→</span>
                  {act.transitToNext && (
                    <span className="text-[10px] text-slate-500 font-medium">({act.transitToNext.approxTransitMin}m)</span>
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
