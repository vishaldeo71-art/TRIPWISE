'use client';

import { WeatherSummary, ItineraryDay } from '@/types/trip';
import { UmbrellaIcon, SunIcon, SparklesIcon } from '@/components/Icons';

interface WeatherAdvisorCardProps {
  weatherSummary?: WeatherSummary;
  activeDay?: ItineraryDay;
  onAskAI?: () => void;
}

export default function WeatherAdvisorCard({ weatherSummary, activeDay, onAskAI }: WeatherAdvisorCardProps) {
  const rainProb = activeDay?.weatherForecast?.rainProbability ?? weatherSummary?.maxRainProbability ?? 0;
  const condition = activeDay?.weatherForecast?.condition ?? weatherSummary?.overallCondition ?? 'Clear';
  const tempC = activeDay?.weatherForecast?.tempC ?? weatherSummary?.avgTempC ?? 24;

  const isRainExpected = rainProb >= 35 || condition.toLowerCase().includes('rain');
  const isExtremeHeat = tempC >= 36;
  const isCold = tempC <= 10;

  let advisorTitle = 'Optimal Weather';
  let advisorMessage = 'Conditions look great for outdoor sightseeing and exploration today.';
  let badgeClass = 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20';

  if (isRainExpected) {
    advisorTitle = 'Rain Advisory';
    advisorMessage = `Rain probability at ${rainProb}%. Consider replacing outdoor activities with indoor museum or cultural alternatives.`;
    badgeClass = 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/20';
  } else if (isExtremeHeat) {
    advisorTitle = 'High Heat Warning';
    advisorMessage = `Temperatures reaching ${tempC}°C. Plan outdoor sightseeing early in the morning and stay hydrated.`;
    badgeClass = 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20';
  } else if (isCold) {
    advisorTitle = 'Cool Climate Advisory';
    advisorMessage = `Expect cooler temperatures around ${tempC}°C. Layer clothing comfortably for outdoor strolls.`;
    badgeClass = 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20';
  }

  return (
    <div className="tw-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3.5">
          <div className={`p-2.5 rounded-xl border shrink-0 ${isRainExpected ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
            {isRainExpected ? <UmbrellaIcon size={19} /> : <SunIcon size={19} />}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">Weather Advisor</h4>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${badgeClass}`}>{advisorTitle}</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm">{advisorMessage}</p>
          </div>
        </div>
        {onAskAI && (
          <button
            onClick={onAskAI}
            className="hidden sm:flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl tw-btn-ghost border text-amber-700 dark:text-amber-300 font-semibold shrink-0 transition"
          >
            <SparklesIcon size={13} className="text-amber-500" />
            Ask AI
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2.5 mt-4 pt-4 border-t tw-divider text-xs">
        {[
          { label: 'Temperature', value: `${tempC}°C` },
          { label: 'Rain Risk', value: `${rainProb}%` },
          { label: 'Condition', value: condition },
        ].map((stat) => (
          <div key={stat.label} className="bg-stone-100 dark:bg-white/[0.04] rounded-xl p-2.5 text-center border border-stone-200 dark:border-white/[0.07]">
            <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold tracking-wider">{stat.label}</span>
            <span className="text-slate-900 dark:text-white font-extrabold mt-0.5 block truncate">{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
