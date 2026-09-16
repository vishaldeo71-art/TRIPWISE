'use client';

import { useState } from 'react';
import { Activity } from '@/types/trip';
import { optimizeDayRoute, RouteOptimizationResult } from '@/lib/routeOptimizer';
import { NavigationIcon, CheckIcon } from '@/components/Icons';

interface SmartRouteCardProps {
  activities: Activity[];
  destinationName?: string;
  baseLat?: number;
  baseLng?: number;
  onApplyOptimization?: (optimizedActivities: Activity[]) => void;
}

export default function SmartRouteCard({
  activities,
  destinationName = 'Delhi',
  baseLat,
  baseLng,
  onApplyOptimization,
}: SmartRouteCardProps) {
  const [optimization, setOptimization] = useState<RouteOptimizationResult | null>(null);
  const [optimizedApplied, setOptimizedApplied] = useState(false);

  const handleOptimize = () => {
    const result = optimizeDayRoute(activities, destinationName, baseLat, baseLng);
    setOptimization(result);
    setOptimizedApplied(true);
    if (onApplyOptimization) onApplyOptimization(result.optimizedActivities);
  };

  return (
    <div className="tw-card p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-500 border border-sky-500/20 shrink-0">
            <NavigationIcon size={19} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">Smart Route</h4>
              {optimizedApplied && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-500/20">
                  Optimized ✓
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm">
              Reorder activities using Nearest-Neighbor clustering to minimize transit time.
            </p>
          </div>
        </div>

        <button
          onClick={handleOptimize}
          className="tw-btn-ghost flex items-center gap-2 text-xs px-4 py-2.5 rounded-xl border font-semibold shrink-0 justify-center transition"
        >
          <NavigationIcon size={13} className="text-sky-500" />
          <span>{optimizedApplied ? 'Re-Optimize' : 'Optimize Route'}</span>
        </button>
      </div>

      {optimization && (
        <div className="mt-4 pt-4 border-t tw-divider animate-fade-in-up">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs mb-3">
            {[
              { label: 'Stops', value: `${optimization.locationCount}`, color: 'text-slate-900 dark:text-white' },
              { label: 'Route Dist.', value: `${optimization.optimizedDistanceKm} km`, color: 'text-slate-900 dark:text-white' },
              { label: 'Saved', value: `~${optimization.distanceSavedKm} km`, color: 'text-emerald-700 dark:text-emerald-300' },
              { label: 'Travel Time', value: `~${optimization.estimatedTravelTimeMins}m`, color: 'text-sky-700 dark:text-sky-300' },
            ].map((s) => (
              <div key={s.label} className="bg-stone-100 dark:bg-white/[0.04] rounded-xl p-2.5 border border-stone-200 dark:border-white/[0.07] text-center">
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold tracking-wider">{s.label}</span>
                <span className={`${s.color} font-extrabold mt-0.5 block`}>{s.value}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-emerald-800 dark:text-emerald-300 bg-emerald-500/8 border border-emerald-500/20 rounded-xl p-2.5 font-medium">
            <CheckIcon size={13} className="shrink-0 text-emerald-500" />
            Activities reordered geographically across {optimization.locationCount} stops to eliminate transit overlap.
          </div>
        </div>
      )}
    </div>
  );
}
