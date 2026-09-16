'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  SparklesIcon,
  CloudRainIcon,
  UserIcon,
  ShareIcon,
  ArrowRightIcon,
  CompassIcon,
  SunIcon,
  ShieldIcon,
  CalendarIcon,
  NavigationIcon,
  TrainIcon,
  CheckIcon
} from '@/components/Icons';

export default function LandingPage() {
  useEffect(() => {
    const scrollToHash = () => {
      if (typeof window !== 'undefined' && window.location.hash) {
        const id = window.location.hash.substring(1);
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    const timer = setTimeout(scrollToHash, 150);
    window.addEventListener('hashchange', scrollToHash);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('hashchange', scrollToHash);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#080B10] text-slate-100 font-sans selection:bg-amber-500/20 selection:text-amber-200">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative pt-16 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
          {/* Subtle Ambient Lighting (No AI Slop Glow) */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-amber-500/10 via-amber-600/5 to-sky-600/10 blur-[120px] rounded-full pointer-events-none -z-10" />

          <div className="text-center max-w-4xl mx-auto space-y-7">
            {/* Architectural Pill Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-900/90 border border-amber-500/20 text-amber-300 text-xs sm:text-sm font-semibold shadow-xl backdrop-blur-xl">
              <SparklesIcon size={16} className="text-amber-400" />
              <span>Weather-Aware Adaptive Travel Platform</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
              Your itinerary doesn&apos;t just plan your trip.{' '}
              <span className="gradient-text-amber">It adapts to it.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
              Build destination-specific travel plans with live Open-Meteo weather forecasts, nearest metro stations, and Nearest-Neighbor route optimization.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                href="/plan"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-extrabold text-base shadow-xl shadow-amber-500/10 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2.5 group"
              >
                <span>Plan My Trip</span>
                <ArrowRightIcon size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#how-it-works"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                  window.history.pushState(null, '', '/#how-it-works');
                }}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 font-semibold text-base border border-slate-800 shadow-md transition-all duration-300 flex items-center justify-center gap-2"
              >
                Explore How It Works
              </a>
            </div>

            {/* Interactive Preview Card Mockup */}
            <div className="pt-10">
              <div className="glass-panel rounded-3xl p-6 sm:p-8 max-w-3xl mx-auto border border-white/[0.08] shadow-2xl relative group text-left">
                <div className="flex flex-wrap items-center justify-between border-b border-white/[0.06] pb-4 mb-6 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-extrabold text-xs shadow-inner">
                      DEL
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-white">Delhi • 3 Days Itinerary</h3>
                      <p className="text-xs text-slate-400">Explorer Persona • Balanced Pace</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold shadow-sm">
                    <SunIcon size={14} className="text-emerald-400" /> Outdoor Suitability: High (95/100)
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition">
                    <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider">Morning</span>
                    <h4 className="font-extrabold text-xs text-slate-100 mt-1">Red Fort & Heritage Walk</h4>
                    <p className="text-[11px] text-slate-400 mt-1">🚇 Near Lal Qila Metro</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition">
                    <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider">Afternoon</span>
                    <h4 className="font-extrabold text-xs text-slate-100 mt-1">Humayun’s Tomb Gardens</h4>
                    <p className="text-[11px] text-slate-400 mt-1">🚇 Near JL Nehru Stadium</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-amber-500/30 bg-amber-500/5 relative">
                    <span className="text-[10px] font-extrabold text-amber-300 uppercase tracking-wider flex items-center justify-between">
                      Evening
                      <span className="text-[9px] bg-amber-500/10 px-2 py-0.5 rounded-md text-amber-300 border border-amber-500/20 font-bold">Plan B Ready</span>
                    </span>
                    <h4 className="font-extrabold text-xs text-slate-100 mt-1">Chandni Chowk Food Tour</h4>
                    <p className="text-[11px] text-slate-400 mt-1">🌧️ Indoor Alt: Haveli Dharampura</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* VISUAL EXPLANATION (STEP FLOW) */}
        <section id="how-it-works" className="scroll-mt-24 py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/[0.06]">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-amber-400">Simple 4-Step Process</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white">How TRIPWISE Adapts Your Journey</p>
            <p className="text-slate-400 text-sm sm:text-base">From destination selection to live weather adjustments in seconds.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-panel glass-card-hover p-6 rounded-3xl flex flex-col items-start relative group border border-white/[0.07]">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-extrabold text-sm mb-4">
                01
              </div>
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 mb-1">Step 1</div>
              <h3 className="text-lg font-extrabold text-white mb-2">DESTINATION & PERSONA</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Choose your city (Delhi, London, Paris, Tokyo, etc.), travel dates, pace, and persona (Backpacker, Family, Luxury, Explorer).
              </p>
            </div>

            <div className="glass-panel glass-card-hover p-6 rounded-3xl flex flex-col items-start relative group border border-white/[0.07]">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 font-extrabold text-sm mb-4">
                02
              </div>
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-sky-400 mb-1">Step 2</div>
              <h3 className="text-lg font-extrabold text-white mb-2">OPEN-METEO WEATHER</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                We query Open-Meteo live forecasts to evaluate precipitation probabilities and outdoor suitability.
              </p>
            </div>

            <div className="glass-panel glass-card-hover p-6 rounded-3xl flex flex-col items-start relative group border border-white/[0.07]">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-300 font-extrabold text-sm mb-4">
                03
              </div>
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-purple-300 mb-1">Step 3</div>
              <h3 className="text-lg font-extrabold text-white mb-2">NEAREST NEIGHBOR ROUTE</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Activities are ordered by geographical proximity, and matched to nearest city metro stations.
              </p>
            </div>

            <div className="glass-panel glass-card-hover p-6 rounded-3xl flex flex-col items-start relative group border border-white/[0.07]">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-extrabold text-sm mb-4">
                04
              </div>
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 mb-1">Step 4</div>
              <h3 className="text-lg font-extrabold text-white mb-2">PLAN B & AI ASSISTANT</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Toggle Plan B rain mode for indoor museum fallbacks and ask TripWise AI contextual questions.
              </p>
            </div>
          </div>
        </section>

        {/* CORE FEATURES */}
        <section id="features" className="scroll-mt-24 py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/[0.06]">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-amber-400">Core Features</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white">Engineered for Unpredictable Journeys</p>
            <p className="text-slate-400 text-sm sm:text-base">Everything needed to plan structured, weather-adaptive itineraries.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-panel p-6 rounded-3xl border border-white/[0.07] hover:border-amber-500/30 transition-all hover:-translate-y-1">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
                <CloudRainIcon size={20} />
              </div>
              <h3 className="text-base font-extrabold text-white mb-2">Real Destination Places</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Zero generic templates. Places are specific to your selected city with zero cross-city contamination.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-3xl border border-white/[0.07] hover:border-amber-500/30 transition-all hover:-translate-y-1">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-4">
                <TrainIcon size={20} />
              </div>
              <h3 className="text-base font-extrabold text-white mb-2">Metro & Transit Engine</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Matches attractions to nearest metro stations and provides direct Google Maps transit route links.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-3xl border border-white/[0.07] hover:border-amber-500/30 transition-all hover:-translate-y-1">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-300 mb-4">
                <NavigationIcon size={20} />
              </div>
              <h3 className="text-base font-extrabold text-white mb-2">Smart Route Optimization</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Nearest-Neighbor distance calculation groups nearby stops together to reduce transit back-and-forth.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-3xl border border-white/[0.07] hover:border-amber-500/30 transition-all hover:-translate-y-1">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
                <ShieldIcon size={20} />
              </div>
              <h3 className="text-base font-extrabold text-white mb-2">Trip Health & Plan B</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Deterministic Trip Health score (0-100) and instant Plan B rain toggle for indoor museum fallbacks.
              </p>
            </div>
          </div>
        </section>

        {/* BOTTOM CTA BANNER */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
          <div className="glass-panel rounded-3xl p-10 sm:p-14 border border-amber-500/20 relative overflow-hidden shadow-2xl">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
              Ready to create your adaptive itinerary?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto mb-8 leading-relaxed">
              Build your destination-specific, weather-aware travel plan in seconds.
            </p>
            <Link
              href="/plan"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-base shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Start Planning Now</span>
              <ArrowRightIcon size={18} />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
