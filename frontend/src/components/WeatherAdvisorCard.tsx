'use client';

import { WeatherSummary, ItineraryDay } from '@/types/trip';
import { UmbrellaIcon, SunIcon, SparklesIcon } from '@/components/Icons';

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
  let advisorMessage = 'Weather conditions look great for outdoor sightseeing and exploration.';
  let badgeColor = 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20';

  if (isRainExpected) {
    advisorTitle = 'Rain Advisory Detected';
    advisorMessage = `Rain probability is around ${rainProb}%. Consider replacing outdoor activities with indoor museum or cultural alternatives.`;
    badgeColor = 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/20';
  } else if (isExtremeHeat) {
    advisorTitle = 'High Temperature Warning';
    advisorMessage = `Temperatures reaching ${tempC}°C. Plan outdoor sightseeing early in the morning and stay hydrated.`;
    badgeColor = 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20';
  } else if (isCold) {
    advisorTitle = 'Cooler Climate Advisory';
    advisorMessage = `Expect cooler temperatures around ${tempC}°C. Layer clothing comfortably for evening strolls.`;
    badgeColor = 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20';
  }

  return (
    <div className="bg-white/80 dark:bg-[#0F141E]/80 backdrop-blur-xl rounded-2xl p-5 border border-stone-200/80 dark:border-[#1E2638] shadow-sm transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <div
            className={`p-2.5 rounded-xl border shrink-0 mt-0.5 ${
              isRainExpected
                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
            }`}
          >
            {isRainExpected ? (
              <UmbrellaIcon size={20} />
            ) : (
              <SunIcon size={20} />
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-300">Weather Advisor</h4>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${badgeColor}`}>
                {advisorTitle}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-xl leading-relaxed">{advisorMessage}</p>
          </div>
        </div>

        {onAskAI && (
          <button
            onClick={onAskAI}
            className="hidden sm:flex items-center space-x-1.5 text-xs px-3.5 py-2 rounded-xl bg-stone-100 dark:bg-slate-900 hover:bg-stone-200 dark:hover:bg-slate-800 text-amber-700 dark:text-amber-300 border border-stone-200 dark:border-slate-800 transition-colors shrink-0 font-semibold"
          >
            <SparklesIcon size={14} className="text-amber-500 dark:text-amber-400" />
            <span>Ask Advisor</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-stone-200/80 dark:border-white/[0.06] text-xs">
        <div className="bg-stone-100 dark:bg-slate-950/60 rounded-xl p-2.5 text-center border border-stone-200/80 dark:border-slate-800/80">
          <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Temperature</span>
          <span className="text-slate-900 dark:text-slate-100 font-extrabold mt-0.5 block">{tempC}°C</span>
        </div>
        <div className="bg-stone-100 dark:bg-slate-950/60 rounded-xl p-2.5 text-center border border-stone-200/80 dark:border-slate-800/80">
          <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Rain Risk</span>
          <span className="text-slate-900 dark:text-slate-100 font-extrabold mt-0.5 block">{rainProb}%</span>
        </div>
        <div className="bg-stone-100 dark:bg-slate-950/60 rounded-xl p-2.5 text-center border border-stone-200/80 dark:border-slate-800/80">
          <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Condition</span>
          <span className="text-slate-900 dark:text-slate-100 font-extrabold mt-0.5 block truncate">{condition}</span>
        </div>
      </div>
    </div>
  );
}
