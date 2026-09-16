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
  CheckIcon,
  MapPinIcon,
} from '@/components/Icons';

export default function LandingPage() {
  useEffect(() => {
    const scrollToHash = () => {
      if (typeof window !== 'undefined' && window.location.hash) {
        const id = window.location.hash.substring(1);
        const el = document.getElementById(id);
        if (el) {
          setTimeout(() => {
            el.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }
      }
    };

    scrollToHash();
    window.addEventListener('hashchange', scrollToHash);
    return () => window.removeEventListener('hashchange', scrollToHash);
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF9F5] dark:bg-[#080B10] text-slate-900 dark:text-[#E2E8F0] flex flex-col justify-between selection:bg-amber-400/20 selection:text-amber-800 dark:selection:text-amber-200 transition-colors">
      <Navbar />

      <main className="flex-1">
        {/* Section 1: Hero (Fits in Initial Viewport: Top padding capped pt-16 md:pt-20, Headline <=2 lines, Subtext <=20 words) */}
        <section className="relative pt-14 md:pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
          {/* Eyebrow 1 of 3 (Eyebrow Restraint: max 1 per 3 sections) */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 dark:bg-amber-400/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-[11px] font-bold uppercase tracking-wider mb-6">
            <SparklesIcon size={14} className="text-amber-500 dark:text-amber-400" />
            Adaptive Travel Engine
          </div>

          {/* Headline (Max 2 lines) */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.1] max-w-4xl">
            Weather-Aware Itineraries Built for Real Places
          </h1>

          {/* Subtext (Max 20 words) */}
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
            Generate custom travel plans synced with Open-Meteo forecasts, Metro transit routing, and Plan B indoor rain swaps.
          </p>

          {/* CTAs (No Duplicate Intent) */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
            <Link
              href="/plan"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-sm shadow-xl shadow-amber-400/10 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2.5"
            >
              <span>Plan Your Trip</span>
              <ArrowRightIcon size={16} />
            </Link>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-7 py-4 rounded-xl bg-white dark:bg-[#0F141E] hover:bg-stone-100 dark:hover:bg-[#161D2B] text-slate-800 dark:text-slate-200 text-sm font-semibold border border-stone-200 dark:border-[#1E2638] transition shadow-sm flex items-center justify-center gap-2"
            >
              <CompassIcon size={16} className="text-amber-500 dark:text-amber-400" />
              <span>Explore My Saved Trips</span>
            </Link>
          </div>

          {/* Interactive Preview Mockup Box */}
          <div className="mt-12 w-full max-w-4xl rounded-2xl bg-white/90 dark:bg-[#0F141E]/90 border border-stone-200/80 dark:border-[#1E2638] p-5 shadow-2xl backdrop-blur-xl text-left">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-[#1E2638]">
              <div className="flex items-center gap-2">
                <MapPinIcon size={16} className="text-amber-500 dark:text-amber-400" />
                <span className="font-bold text-sm text-slate-900 dark:text-white">Delhi, India — 3 Day Exploration</span>
              </div>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Weather Score: 94% Clear Skies
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
              <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-[#121620] border border-stone-200/80 dark:border-[#1E2638]">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Morning</span>
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-white mt-1">Humayun&apos;s Tomb</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">📍 Nizamuddin East • 🚇 JLN Stadium Metro</p>
              </div>
              <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-[#121620] border border-stone-200/80 dark:border-[#1E2638]">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Afternoon</span>
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-white mt-1">National Gallery of Modern Art</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">📍 Jaipur House • 🚇 Khan Market Metro</p>
              </div>
              <div className="p-3.5 rounded-xl bg-amber-400/10 dark:bg-amber-400/10 border border-amber-500/20">
                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider">Evening</span>
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-white mt-1">India Gate & Kartavya Path</h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">📍 Central Hexagon • 🚇 Central Secretariat</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: How It Works (No Eyebrow - Eyebrow restraint rule) */}
        <section id="how-it-works" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-stone-200/80 dark:border-[#1E2638]">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              4 Steps to Weather-Proof Travel
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2">
              From instant destination geocoding to automatic rain displacement.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/80 dark:bg-[#0F141E]/80 backdrop-blur-xl p-6 rounded-2xl border border-stone-200/80 dark:border-[#1E2638] shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 dark:text-amber-400 flex items-center justify-center font-extrabold text-sm mb-4">
                01
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">Destination Geocoding</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Inputs are resolved into precise coordinates via OpenStreetMap Nominatim engine.
              </p>
            </div>

            <div className="bg-white/80 dark:bg-[#0F141E]/80 backdrop-blur-xl p-6 rounded-2xl border border-stone-200/80 dark:border-[#1E2638] shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 dark:text-amber-400 flex items-center justify-center font-extrabold text-sm mb-4">
                02
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">Open-Meteo Forecast</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Real-time temperature and precipitation probabilities determine outdoor safety.
              </p>
            </div>

            <div className="bg-white/80 dark:bg-[#0F141E]/80 backdrop-blur-xl p-6 rounded-2xl border border-stone-200/80 dark:border-[#1E2638] shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 dark:text-amber-400 flex items-center justify-center font-extrabold text-sm mb-4">
                03
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">Smart Route Optimization</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Nearest-neighbor spatial clustering orders places to minimize travel time.
              </p>
            </div>

            <div className="bg-white/80 dark:bg-[#0F141E]/80 backdrop-blur-xl p-6 rounded-2xl border border-stone-200/80 dark:border-[#1E2638] shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 dark:text-amber-400 flex items-center justify-center font-extrabold text-sm mb-4">
                04
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">Plan B Rain Swap</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                One-tap toggle automatically swaps outdoor monuments for museums & markets.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Feature Bento Grid (Bento Background Diversity rule) */}
        <section id="features" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-stone-200/80 dark:border-[#1E2638]">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Engineered Travel Intelligence
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2">
              Everything required to plan, navigate, and adapt your journeys.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bento Tile 1: Real Destination Database (Tinted Accent background for diversity) */}
            <div className="bg-amber-400/10 dark:bg-amber-400/10 p-6 rounded-2xl border border-amber-500/20 shadow-sm md:col-span-2">
              <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-600 dark:text-amber-300 flex items-center justify-center mb-4">
                <NavigationIcon size={18} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                0% Cross-City Contamination
              </h3>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed max-w-xl">
                Every destination uses verified landmark data—Delhi itinerary shows Qutub Minar and Chandni Chowk, London shows Big Ben and Borough Market.
              </p>
            </div>

            {/* Bento Tile 2: Metro Transit Engine */}
            <div className="bg-white/80 dark:bg-[#0F141E]/80 backdrop-blur-xl p-6 rounded-2xl border border-stone-200/80 dark:border-[#1E2638] shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-4">
                <TrainIcon size={18} />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Metro Transit Engine</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Connects places to nearest transit stations with direct walk times.
              </p>
            </div>

            {/* Bento Tile 3: Open-Meteo Sync */}
            <div className="bg-white/80 dark:bg-[#0F141E]/80 backdrop-blur-xl p-6 rounded-2xl border border-stone-200/80 dark:border-[#1E2638] shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                <CloudRainIcon size={18} />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Open-Meteo Weather</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Live forecast integration checks rain probabilities before suggesting walking tours.
              </p>
            </div>

            {/* Bento Tile 4: TripWise AI Context Modal (Tinted slate background for diversity) */}
            <div className="bg-slate-900 text-white dark:bg-[#121620] p-6 rounded-2xl border border-slate-800 dark:border-[#1E2638] shadow-sm md:col-span-2">
              <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center mb-4">
                <SparklesIcon size={18} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">TripWise Assistant Modal</h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
                Ask contextual questions like &quot;Where can I try local food nearby?&quot; or &quot;What if it rains at 3 PM?&quot; with automatic itinerary context injection.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: Final Call to Action */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
          <div className="bg-white/90 dark:bg-[#0F141E]/90 backdrop-blur-xl rounded-3xl p-8 sm:p-12 border border-stone-200/80 dark:border-[#1E2638] shadow-2xl">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Ready for Weather-Adaptive Travel?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-3 max-w-md mx-auto">
              Build your custom itinerary in under 30 seconds with destination-specific places and transit routes.
            </p>
            <div className="mt-8 flex justify-center">
              <Link
                href="/plan"
                className="px-8 py-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-sm shadow-xl shadow-amber-400/10 transition duration-200 flex items-center gap-2"
              >
                <span>Plan Your Trip Now</span>
                <ArrowRightIcon size={16} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
