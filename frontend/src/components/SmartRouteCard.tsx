'use client';

import { useState } from 'react';
import { Activity } from '@/types/trip';
import { optimizeDayRoute, RouteOptimizationResult } from '@/lib/routeOptimizer';
import { Compass, Navigation, ArrowRight, CheckCircle2, RefreshCw, Clock } from 'lucide-react';

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
    <div className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-slate-700 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              Smart Route Optimization
              {optimizedApplied && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Optimized
                </span>
              )}
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Reorder daily activities using Nearest-Neighbor distance to minimize transit time.
            </p>
          </div>
        </div>

        <button
          onClick={handleOptimize}
          className="flex items-center space-x-2 text-xs px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white font-medium shadow-md transition-all active:scale-95"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{optimizedApplied ? 'Re-Optimize Route' : 'Optimize Route'}</span>
        </button>
      </div>

      {optimization && (
        <div className="mt-4 pt-4 border-t border-slate-800/80 animate-fade-in">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-3">
            <div className="bg-slate-900/60 rounded-xl p-2.5">
              <span className="text-slate-500 block text-[10px] uppercase">Stops Analyzed</span>
              <span className="text-white font-semibold mt-0.5 block">
                {optimization.locationCount} locations
              </span>
            </div>
            <div className="bg-slate-900/60 rounded-xl p-2.5">
              <span className="text-slate-500 block text-[10px] uppercase">Route Distance</span>
              <span className="text-white font-semibold mt-0.5 block">
                {optimization.optimizedDistanceKm} km
              </span>
            </div>
            <div className="bg-slate-900/60 rounded-xl p-2.5">
              <span className="text-slate-500 block text-[10px] uppercase">Distance Saved</span>
              <span className="text-emerald-400 font-semibold mt-0.5 block">
                ~{optimization.distanceSavedKm} km saved
              </span>
            </div>
            <div className="bg-slate-900/60 rounded-xl p-2.5">
              <span className="text-slate-500 block text-[10px] uppercase">Est. Travel Time</span>
              <span className="text-sky-400 font-semibold mt-0.5 block">
                ~{optimization.estimatedTravelTimeMins} mins
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>
              Activities arranged to reduce unnecessary travel across {optimization.locationCount}{' '}
              stops.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
