'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  SparklesIcon,
  CloudRainIcon,
  ShareIcon,
  ArrowRightIcon,
  CompassIcon,
  SunIcon,
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
    <div className="min-h-screen bg-[#F7F5F0] dark:bg-[#07090F] text-slate-900 dark:text-[#F0F4FF] flex flex-col transition-colors">
      <Navbar />

      <main className="flex-1">

        {/* ── HERO ── */}
        <section className="relative pt-20 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">

          {/* Ambient background glows */}
          <div className="tw-hero-glow tw-hero-glow-amber w-[600px] h-[600px] top-[-100px] left-[-150px] pointer-events-none" />
          <div className="tw-hero-glow tw-hero-glow-amber w-[400px] h-[400px] bottom-[-60px] right-[-80px] opacity-20 pointer-events-none" />

          <div className="relative flex flex-col items-center text-center">
            {/* Eyebrow pill */}
            <div className="animate-fade-in-up inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full tw-badge-amber tw-badge mb-6">
              <SparklesIcon size={13} />
              Weather-Adaptive Travel Engine
            </div>

            {/* Headline */}
            <h1 className="animate-fade-in-up text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] max-w-4xl text-balance"
              style={{ animationDelay: '60ms' }}>
              <span className="text-slate-900 dark:text-white">Your Trip,</span>{' '}
              <span className="tw-gradient-text">Built Around the Weather</span>
            </h1>

            {/* Sub-headline */}
            <p className="animate-fade-in-up mt-5 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed font-medium"
              style={{ animationDelay: '120ms' }}>
              Destination-specific itineraries with real landmarks, live forecasts, metro routing, and instant Plan B rain swaps.
            </p>

            {/* CTAs */}
            <div className="animate-fade-in-up mt-8 flex flex-col sm:flex-row items-center gap-3 w-full justify-center"
              style={{ animationDelay: '180ms' }}>
              <Link
                href="/plan"
                className="tw-btn-primary w-full sm:w-auto px-8 py-4 rounded-2xl text-sm flex items-center justify-center gap-2.5"
              >
                <SparklesIcon size={16} />
                <span>Plan My Trip</span>
                <ArrowRightIcon size={15} />
              </Link>
              <Link
                href="/dashboard"
                className="tw-btn-ghost w-full sm:w-auto px-7 py-4 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2"
              >
                <CompassIcon size={15} className="text-amber-500" />
                <span>My Saved Trips</span>
              </Link>
            </div>

            {/* Social proof micro-line */}
            <div className="animate-fade-in-up mt-5 flex items-center gap-2 text-[12px] text-slate-500 dark:text-slate-400 font-medium"
              style={{ animationDelay: '240ms' }}>
              <div className="flex -space-x-1.5">
                {['#F59E0B','#10B981','#3B82F6','#EC4899'].map((c) => (
                  <div key={c} className="w-5 h-5 rounded-full border-2 border-white dark:border-[#07090F]" style={{ background: c }} />
                ))}
              </div>
              <span>4,000+ adaptive itineraries generated</span>
            </div>
          </div>

          {/* Interactive Preview Card */}
          <div className="animate-fade-in-up mt-14 tw-card tw-search-bar max-w-3xl mx-auto p-1"
            style={{ animationDelay: '300ms' }}>
            <div className="tw-card p-5 sm:p-6"
              style={{ background: 'transparent', border: 'none', boxShadow: 'none', backdropFilter: 'none' }}>
              {/* Card header */}
              <div className="flex items-center justify-between pb-4 border-b tw-divider">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center">
                    <MapPinIcon size={16} className="text-amber-500" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900 dark:text-white">Delhi, India</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">3-Day Adaptive Itinerary</div>
                  </div>
                </div>
                <div className="tw-badge tw-badge-emerald">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-slow" />
                  94% Clear Skies
                </div>
              </div>

              {/* Activity rows */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 stagger-children">
                <div className="p-3.5 rounded-xl bg-stone-100 dark:bg-white/[0.04] border border-stone-200 dark:border-white/[0.06]">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Morning</div>
                  <h4 className="text-xs font-extrabold text-slate-900 dark:text-white mt-1">Humayun&apos;s Tomb</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">📍 Nizamuddin East · 🚇 JLN Stadium Metro</p>
                </div>
                <div className="p-3.5 rounded-xl bg-stone-100 dark:bg-white/[0.04] border border-stone-200 dark:border-white/[0.06]">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Afternoon</div>
                  <h4 className="text-xs font-extrabold text-slate-900 dark:text-white mt-1">National Gallery of Modern Art</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">📍 Jaipur House · 🚇 Khan Market Metro</p>
                </div>
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Evening</div>
                  <h4 className="text-xs font-extrabold text-slate-900 dark:text-white mt-1">India Gate &amp; Kartavya Path</h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">📍 Central Hexagon · 🚇 Central Secretariat</p>
                </div>
              </div>

              {/* Bottom bar */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t tw-divider text-[11px] text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5 font-medium">
                  <SunIcon size={12} className="text-amber-500" />
                  28°C · Mostly Clear
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <TrainIcon size={12} className="text-sky-500" />
                  Delhi Metro Optimized
                </span>
                <span className="hidden sm:flex items-center gap-1.5 font-medium">
                  <CalendarIcon size={12} />
                  Day 1 of 3
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t tw-divider">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              4 Steps to a Smarter Trip
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 leading-relaxed">
              From geocoding your destination to real-time rain displacement — all in under 30 seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 stagger-children">
            {[
              { num: '01', title: 'Destination Geocoding', desc: 'City inputs resolve to precise coordinates via OpenStreetMap Nominatim.', icon: MapPinIcon },
              { num: '02', title: 'Open-Meteo Forecast', desc: 'Live temperature & precipitation data determines outdoor activity safety.', icon: CloudRainIcon },
              { num: '03', title: 'Route Optimization', desc: 'Nearest-neighbor clustering minimizes transit time between places.', icon: NavigationIcon },
              { num: '04', title: 'Plan B Rain Swap', desc: 'One tap replaces all outdoor visits with curated indoor alternatives.', icon: CompassIcon },
            ].map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.num} className="tw-card tw-card-lift p-6 cursor-default">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                      <Icon size={18} className="text-amber-500" />
                    </div>
                    <span className="text-3xl font-black text-amber-500/20 dark:text-amber-500/15 leading-none select-none">{step.num}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">{step.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── FEATURES BENTO ── */}
        <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t tw-divider">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Engineered Travel Intelligence
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 leading-relaxed">
              Every feature is purpose-built around real destinations, live weather, and your travel style.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Tile 1: Wide — Real Destinations */}
            <div className="md:col-span-2 tw-tile-accent p-7 rounded-3xl">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center mb-4">
                <NavigationIcon size={18} className="text-amber-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">0% Cross-City Contamination</h3>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed max-w-lg">
                Every destination uses verified landmark data. Delhi shows Qutub Minar and Chandni Chowk. London shows Big Ben and Borough Market. Tokyo shows Senso-ji and Shibuya Crossing. Zero generic placeholders.
              </p>
              {/* Destination pills */}
              <div className="flex flex-wrap gap-2 mt-5">
                {['🇮🇳 Delhi', '🇬🇧 London', '🇯🇵 Tokyo', '🇫🇷 Paris', '🇺🇸 New York', '🇦🇪 Dubai'].map((city) => (
                  <span key={city} className="px-3 py-1 rounded-full bg-white/60 dark:bg-white/[0.06] border border-stone-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {city}
                  </span>
                ))}
              </div>
            </div>

            {/* Tile 2: Metro Transit */}
            <div className="tw-card p-6 rounded-3xl">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mb-4">
                <TrainIcon size={18} className="text-sky-500" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Metro Transit Engine</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Connects every place to its nearest transit station with walk time estimates and station-to-station directions.
              </p>
              <div className="mt-4 p-3 rounded-xl bg-sky-500/8 dark:bg-sky-500/5 border border-sky-500/15 text-[11px] text-sky-700 dark:text-sky-300 font-semibold">
                🚇 JLN Stadium → Khan Market · ~12 min
              </div>
            </div>

            {/* Tile 3: Weather */}
            <div className="tw-card p-6 rounded-3xl">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                <CloudRainIcon size={18} className="text-emerald-500" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Open-Meteo Live Sync</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Checks real precipitation probabilities for each day of your trip before suggesting any outdoor activity.
              </p>
              <div className="mt-4 flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full bg-stone-200 dark:bg-white/10 overflow-hidden">
                  <div className="h-full w-[22%] rounded-full bg-emerald-400" />
                </div>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">22% rain</span>
              </div>
            </div>

            {/* Tile 4: Wide — TripWise AI */}
            <div className="md:col-span-2 tw-tile-dark text-white p-7 rounded-3xl">
              <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/25 flex items-center justify-center mb-4">
                <SparklesIcon size={18} className="text-amber-300" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">TripWise AI Assistant</h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
                Ask contextual questions like &quot;Where can I try local food near Chandni Chowk?&quot; or &quot;What if it rains at 3 PM?&quot; with full itinerary context automatically injected.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {['"Best time for Qutub Minar?"', '"Indoor options if rainy?"', '"Metro from Red Fort?"'].map((q) => (
                  <span key={q} className="px-3 py-1.5 rounded-xl bg-white/[0.08] border border-white/[0.1] text-[11px] font-medium text-slate-300">
                    {q}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── STATS STRIP ── */}
        <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t tw-divider">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: '50+', label: 'Global Destinations' },
              { value: '4k+', label: 'Itineraries Generated' },
              { value: '100%', label: 'Destination-Specific' },
              { value: '<30s', label: 'Generation Time' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl sm:text-4xl font-black tw-gradient-text">{stat.value}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA SECTION ── */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <div className="tw-card relative overflow-hidden rounded-3xl p-10 sm:p-14 text-center">
            {/* Glow accent */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 rounded-full bg-amber-400/15 dark:bg-amber-400/10 blur-3xl pointer-events-none" />

            <div className="relative">
              <div className="tw-badge tw-badge-amber inline-flex mx-auto mb-5">
                <CheckIcon size={11} />
                Free to Use · No Account Required
              </div>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight text-balance">
                Ready for Weather-Adaptive Travel?
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-4 max-w-md mx-auto leading-relaxed">
                Build your custom itinerary in under 30 seconds with destination-specific places, real metro routing, and live weather integration.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/plan"
                  className="tw-btn-primary px-8 py-4 rounded-2xl text-sm flex items-center gap-2.5"
                >
                  <SparklesIcon size={16} />
                  <span>Start Planning Now</span>
                  <ArrowRightIcon size={15} />
                </Link>
                <Link
                  href="/signup"
                  className="tw-btn-ghost px-7 py-4 rounded-2xl text-sm font-semibold"
                >
                  Create Free Account
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
