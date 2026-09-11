'use client';

import { WeatherSummary, ItineraryDay } from '@/types/trip';
import { CloudRain, Sun, ShieldAlert, Sparkles, Umbrella, Thermometer } from 'lucide-react';

interface WeatherAdvisorCardProps {
  weatherSummary?: WeatherSummary;
  activeDay?: ItineraryDay;
  onAskAI?: () => void;
}

export default function WeatherAdvisorCard({
  weatherSummary,
  activeDay,
  onAskAI,
}: WeatherAdvisorCardProps) {
  const rainProb = activeDay?.weatherForecast?.rainProbability ?? weatherSummary?.maxRainProbability ?? 0;
  const condition = activeDay?.weatherForecast?.condition ?? weatherSummary?.overallCondition ?? 'Clear';
  const tempC = activeDay?.weatherForecast?.tempC ?? weatherSummary?.avgTempC ?? 24;

  const isRainExpected = rainProb >= 35 || condition.toLowerCase().includes('rain');
  const isExtremeHeat = tempC >= 36;
  const isCold = tempC <= 10;

  let advisorTitle = 'Optimal Weather Ahead';
  let advisorMessage = 'Weather conditions look great for outdoor sightseeing and outdoor exploration.';
  let badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';

  if (isRainExpected) {
    advisorTitle = 'Rain Advisory Detected';
    advisorMessage = `Rain probability is around ${rainProb}%. Consider replacing outdoor activities with indoor museum or cultural alternatives.`;
    badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  } else if (isExtremeHeat) {
    advisorTitle = 'High Temperature Warning';
    advisorMessage = `Temperatures reaching ${tempC}°C. Plan outdoor sightseeing early in the morning and stay hydrated.`;
    badgeColor = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
  } else if (isCold) {
    advisorTitle = 'Cooler Climate Advisory';
    advisorMessage = `Expect cooler temperatures around ${tempC}°C. Layer clothing comfortably for evening strolls.`;
    badgeColor = 'bg-sky-500/10 text-sky-400 border-sky-500/20';
  }

  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-slate-700 transition-all">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div
            className={`p-2.5 rounded-xl border ${
              isRainExpected
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                : 'bg-sky-500/20 text-sky-400 border-sky-500/30'
            }`}
          >
            {isRainExpected ? (
              <Umbrella className="w-5 h-5" />
            ) : isExtremeHeat ? (
              <Thermometer className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="text-sm font-semibold text-white">Weather Advisor</h4>
              <span className={`text-[11px] px-2 py-0.5 rounded-full border ${badgeColor}`}>
                {advisorTitle}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">{advisorMessage}</p>
          </div>
        </div>

        {onAskAI && (
          <button
            onClick={onAskAI}
            className="hidden sm:flex items-center space-x-1.5 text-xs px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-sky-500/20 text-slate-300 hover:text-sky-300 border border-slate-700 hover:border-sky-500/30 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ask Advisor</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-slate-800/60 text-xs">
        <div className="bg-slate-900/60 rounded-xl p-2.5 text-center">
          <span className="text-slate-500 block text-[10px] uppercase font-medium">Temperature</span>
          <span className="text-slate-200 font-semibold mt-0.5 block">{tempC}°C</span>
        </div>
        <div className="bg-slate-900/60 rounded-xl p-2.5 text-center">
          <span className="text-slate-500 block text-[10px] uppercase font-medium">Rain Risk</span>
          <span className="text-slate-200 font-semibold mt-0.5 block">{rainProb}%</span>
        </div>
        <div className="bg-slate-900/60 rounded-xl p-2.5 text-center">
          <span className="text-slate-500 block text-[10px] uppercase font-medium">Condition</span>
          <span className="text-slate-200 font-semibold mt-0.5 block truncate">{condition}</span>
        </div>
      </div>
    </div>
  );
}
