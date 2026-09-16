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
    if (onApplyOptimization) {
      onApplyOptimization(result.optimizedActivities);
    }
  };

  return (
    <div className="bg-white/80 dark:bg-[#0F141E]/80 backdrop-blur-xl rounded-2xl p-5 border border-stone-200/80 dark:border-[#1E2638] shadow-sm transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 shrink-0 mt-0.5">
            <NavigationIcon size={20} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-300">Smart Route Optimization</h4>
              {optimizedApplied && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-500/20">
                  Optimized
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-xl leading-relaxed">
              Reorder daily activities using Nearest-Neighbor distance calculation to minimize transit times.
            </p>
          </div>
        </div>

        <button
          onClick={handleOptimize}
          className="flex items-center space-x-2 text-xs px-4 py-2.5 rounded-xl bg-stone-100 dark:bg-slate-900 hover:bg-stone-200 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold border border-stone-200 dark:border-slate-800 transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0 justify-center shadow-sm"
        >
          <NavigationIcon size={14} className="text-sky-600 dark:text-sky-400" />
          <span>{optimizedApplied ? 'Re-Optimize Route' : 'Optimize Route'}</span>
        </button>
      </div>

      {optimization && (
        <div className="mt-4 pt-4 border-t border-stone-200/80 dark:border-white/[0.06] animate-fade-in">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-3">
            <div className="bg-stone-100 dark:bg-slate-950/60 rounded-xl p-2.5 border border-stone-200/80 dark:border-slate-800/80 text-center sm:text-left">
              <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Stops Analyzed</span>
              <span className="text-slate-900 dark:text-white font-extrabold mt-0.5 block">
                {optimization.locationCount} locations
              </span>
            </div>
            <div className="bg-stone-100 dark:bg-slate-950/60 rounded-xl p-2.5 border border-stone-200/80 dark:border-slate-800/80 text-center sm:text-left">
              <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Route Distance</span>
              <span className="text-slate-900 dark:text-white font-extrabold mt-0.5 block">
                {optimization.optimizedDistanceKm} km
              </span>
            </div>
            <div className="bg-stone-100 dark:bg-slate-950/60 rounded-xl p-2.5 border border-stone-200/80 dark:border-slate-800/80 text-center sm:text-left">
              <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Distance Saved</span>
              <span className="text-emerald-700 dark:text-emerald-300 font-extrabold mt-0.5 block">
                ~{optimization.distanceSavedKm} km saved
              </span>
            </div>
            <div className="bg-stone-100 dark:bg-slate-950/60 rounded-xl p-2.5 border border-stone-200/80 dark:border-slate-800/80 text-center sm:text-left">
              <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Est. Travel Time</span>
              <span className="text-sky-700 dark:text-sky-300 font-extrabold mt-0.5 block">
                ~{optimization.estimatedTravelTimeMins} mins
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-emerald-800 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2.5">
            <CheckIcon size={14} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>
              Activities reordered geographically across {optimization.locationCount} stops to eliminate transit overlap.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
