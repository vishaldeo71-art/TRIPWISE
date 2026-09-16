'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  SparklesIcon,
  CloudRainIcon,
  ArrowRightIcon,
  SunIcon,
  ShieldIcon,
  NavigationIcon,
  TrainIcon,
  CompassIcon,
  MapPinIcon,
  CheckIcon
} from '@/components/Icons';

export default function LandingPage() {
  const [cityInput, setCityInput] = useState('');
  const router = useRouter();

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

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cityInput.trim()) {
      router.push(`/plan?city=${encodeURIComponent(cityInput.trim())}`);
    } else {
      router.push('/plan');
    }
  };

  const fillCity = (cityName: string) => {
    setCityInput(cityName);
    router.push(`/plan?city=${encodeURIComponent(cityName)}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#131314] font-sans">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="pt-12 sm:pt-16 pb-20 px-4 sm:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--surface)] border border-[var(--border)] text-xs font-semibold text-[#131314]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>TRIPWISE INTELLIGENT TRAVEL ENGINE</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-extrabold font-display tracking-tight text-[#131314] leading-[1.08]">
                Travel planning that adapts to the <span className="underline decoration-amber-400 decoration-4 underline-offset-4">real world</span>.
              </h1>

              <p className="text-base sm:text-lg text-[var(--muted)] leading-relaxed max-w-xl">
                Build destination-specific itineraries using real places from Delhi, Tokyo, Paris, London, and beyond. Weather-aware with instant rain Plan B fallbacks.
              </p>

              {/* Destination Pills */}
              <div className="space-y-2">
                <span className="text-[11px] uppercase font-bold text-[var(--muted)] tracking-wider">Popular Destinations:</span>
                <div className="flex flex-wrap gap-2">
                  {['Delhi', 'Tokyo', 'Paris', 'London', 'Kyoto'].map((c) => (
                    <button
                      key={c}
                      onClick={() => fillCity(c)}
                      className="px-3 py-1 rounded-full bg-[var(--surface)] hover:bg-[var(--surface-2)] border border-[var(--border)] text-xs font-semibold transition-all hover:scale-105 flex items-center gap-1"
                    >
                      <MapPinIcon size={12} className="text-amber-600" />
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Action Input */}
              <form onSubmit={handleHeroSubmit} className="pt-2">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2 bg-[var(--surface)] border border-[var(--border)] rounded-2xl sm:rounded-full shadow-sm max-w-xl">
                  <div className="flex items-center gap-2 px-4 py-2 flex-1">
                    <CompassIcon size={18} className="text-[var(--muted)]" />
                    <input
                      type="text"
                      placeholder="Where do you want to go? (e.g. Delhi, Tokyo)"
                      value={cityInput}
                      onChange={(e) => setCityInput(e.target.value)}
                      className="w-full bg-transparent border-none text-sm font-medium text-[#131314] placeholder:text-[var(--muted)] focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="tw-btn-primary text-xs !py-3 !px-6"
                  >
                    <span>Plan Itinerary</span>
                    <ArrowRightIcon size={14} />
                  </button>
                </div>
              </form>
            </div>

            {/* Right Visual Stage */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-[28px] overflow-hidden border border-[var(--border)] shadow-2xl bg-slate-900 group">
                <img
                  src="https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1000&q=80"
                  alt="Delhi Humayun's Tomb"
                  className="w-full h-[420px] object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Floating Badge 1: Weather Suitability */}
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/20 shadow-lg flex items-center gap-2 text-xs font-bold text-[#131314]">
                  <SunIcon size={16} className="text-amber-500" />
                  <div>
                    <div className="text-[10px] text-[var(--muted)] uppercase">Outdoor Score</div>
                    <div>94/100 • Clear Sky</div>
                  </div>
                </div>

                {/* Floating Badge 2: Real Place Card */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-white/20 shadow-xl space-y-2 text-left">
                  <div className="flex items-center justify-between">
                    <span className="tw-badge tw-badge-amber">Delhi Heritage Stop</span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">🚇 Lal Qila Metro</span>
                  </div>
                  <h4 className="font-extrabold text-sm font-display text-[#131314]">Red Fort & Jama Masjid Walk</h4>
                  <p className="text-xs text-[var(--muted)] line-clamp-1">Real historical landmark with indoor rain alternative ready.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* MARQUEE DESTINATIONS STRIP */}
        <div className="py-6 bg-[var(--surface)] border-y border-[var(--border)] overflow-hidden">
          <div className="animate-marquee whitespace-nowrap flex items-center gap-8 text-xs font-bold text-[var(--muted)] uppercase tracking-wider">
            {['Delhi', 'Tokyo', 'Paris', 'London', 'Kyoto', 'Rome', 'New York', 'Sydney', 'Dubai', 'Barcelona', 'Delhi', 'Tokyo', 'Paris', 'London', 'Kyoto', 'Rome'].map((c, i) => (
              <span key={i} className="flex items-center gap-8">
                <span className="hover:text-[#131314] cursor-pointer transition" onClick={() => fillCity(c)}>
                  {c}
                </span>
                <span className="text-amber-500 font-extrabold">•</span>
              </span>
            ))}
          </div>
        </div>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="scroll-mt-24 py-20 px-4 sm:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="tw-eyebrow">Seamless Process</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-[#131314]">
              How TRIPWISE Powers Your Journey
            </h2>
            <p className="text-sm text-[var(--muted)]">
              Real places, live Open-Meteo weather forecasts, and smart metro routing in 4 simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="tw-card p-6 flex flex-col justify-between space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center font-extrabold text-sm font-display">
                01
              </div>
              <div>
                <span className="tw-badge tw-badge-amber mb-2">Destination & Persona</span>
                <h3 className="font-extrabold text-base font-display text-[#131314] mt-1 mb-2">Real Local Places</h3>
                <p className="text-xs text-[var(--muted)] leading-relaxed">
                  Select your destination city. TRIPWISE queries authentic, verified attractions specific to that location.
                </p>
              </div>
            </div>

            <div className="tw-card p-6 flex flex-col justify-between space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center font-extrabold text-sm font-display">
                02
              </div>
              <div>
                <span className="tw-badge tw-badge-sky mb-2">Open-Meteo API</span>
                <h3 className="font-extrabold text-base font-display text-[#131314] mt-1 mb-2">Live Weather Intelligence</h3>
                <p className="text-xs text-[var(--muted)] leading-relaxed">
                  Queries real-time temperature, rain probability, and outdoor suitability scores for your travel dates.
                </p>
              </div>
            </div>

            <div className="tw-card p-6 flex flex-col justify-between space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center font-extrabold text-sm font-display">
                03
              </div>
              <div>
                <span className="tw-badge tw-badge-emerald mb-2">Metro & Transit</span>
                <h3 className="font-extrabold text-base font-display text-[#131314] mt-1 mb-2">Smart Route Optimiser</h3>
                <p className="text-xs text-[var(--muted)] leading-relaxed">
                  Nearest-Neighbor distance calculation groups nearby stops and links directly to city metro stations.
                </p>
              </div>
            </div>

            <div className="tw-card p-6 flex flex-col justify-between space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center font-extrabold text-sm font-display">
                04
              </div>
              <div>
                <span className="tw-badge mb-2">Plan B Rain Swap</span>
                <h3 className="font-extrabold text-base font-display text-[#131314] mt-1 mb-2">Instant Indoor Swap</h3>
                <p className="text-xs text-[var(--muted)] leading-relaxed">
                  If rain is detected, toggle Plan B with 1-click to swap outdoor parks with indoor museums and galleries.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* BENTO GRID FEATURES */}
        <section id="features" className="scroll-mt-24 py-20 px-4 sm:px-8 max-w-7xl mx-auto border-t border-[var(--border)]">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="tw-eyebrow">Engineered Architecture</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-[#131314]">
              Built for Real Travelers
            </h2>
            <p className="text-sm text-[var(--muted)]">
              No generic template placeholders. Every place is real, verified, and mapped.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="tw-card-sand p-8 md:col-span-2 space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-white border border-[var(--border)] flex items-center justify-center text-amber-600">
                <MapPinIcon size={20} />
              </div>
              <h3 className="text-xl font-extrabold font-display text-[#131314]">Destination-Specific Real Places</h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed max-w-lg">
                Whether you select Delhi (Red Fort, Qutub Minar, Chandni Chowk), London (Tower Bridge, British Museum), or Tokyo (Senso-ji, Shibuya Crossing), TRIPWISE returns authentic places with zero cross-city errors.
              </p>
            </div>

            <div className="tw-card-dark p-8 space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-amber-400">
                <CloudRainIcon size={20} />
              </div>
              <h3 className="text-xl font-extrabold font-display text-white">Weather Adaptive Score</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Open-Meteo forecast API generates an outdoor suitability score (0-100) and warning alerts for extreme weather.
              </p>
            </div>

            <div className="tw-card-dark p-8 space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-emerald-400">
                <TrainIcon size={20} />
              </div>
              <h3 className="text-xl font-extrabold font-display text-white">Nearest Metro Stations</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Every stop features nearest metro connections (e.g. Lal Qila, JL Nehru Stadium) with direct Google Maps route links.
              </p>
            </div>

            <div className="tw-card-sand p-8 md:col-span-2 space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-white border border-[var(--border)] flex items-center justify-center text-sky-600">
                <ShieldIcon size={20} />
              </div>
              <h3 className="text-xl font-extrabold font-display text-[#131314]">1-Click Rain Plan B Fallbacks</h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed max-w-lg">
                Rainy day? Toggle Plan B to immediately replace outdoor walking tours with indoor food halls, art galleries, and historic havelis without recalculating your entire day.
              </p>
            </div>
          </div>
        </section>

        {/* POPULAR DESTINATIONS COVERFLOW CAROUSEL */}
        <section className="py-20 px-4 sm:px-8 max-w-7xl mx-auto border-t border-[var(--border)]">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4">
            <div>
              <span className="tw-eyebrow">Explore Destinaton Catalogs</span>
              <h2 className="text-3xl font-extrabold font-display text-[#131314] mt-1">
                Featured World Cities
              </h2>
            </div>
            <Link href="/plan" className="tw-btn-secondary text-xs">
              View All Cities →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="tw-card-lift overflow-hidden group cursor-pointer" onClick={() => fillCity('Delhi')}>
              <div className="h-48 relative overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80"
                  alt="Delhi"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 tw-badge tw-badge-amber">Delhi, India</div>
              </div>
              <div className="p-5 space-y-2">
                <h3 className="font-extrabold text-base font-display text-[#131314]">Delhi Heritage & Spice Trails</h3>
                <p className="text-xs text-[var(--muted)]">Red Fort, Humayun’s Tomb, Qutub Minar, Akshardham, Chandni Chowk</p>
                <div className="pt-2 text-xs font-bold text-[#131314] flex items-center gap-1">
                  <span>Generate Plan</span>
                  <ArrowRightIcon size={12} />
                </div>
              </div>
            </div>

            <div className="tw-card-lift overflow-hidden group cursor-pointer" onClick={() => fillCity('Tokyo')}>
              <div className="h-48 relative overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80"
                  alt="Tokyo"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 tw-badge tw-badge-sky">Tokyo, Japan</div>
              </div>
              <div className="p-5 space-y-2">
                <h3 className="font-extrabold text-base font-display text-[#131314]">Tokyo Future & Culture</h3>
                <p className="text-xs text-[var(--muted)]">Senso-ji, Shibuya Crossing, Meiji Shrine, Akihabara, teamLab</p>
                <div className="pt-2 text-xs font-bold text-[#131314] flex items-center gap-1">
                  <span>Generate Plan</span>
                  <ArrowRightIcon size={12} />
                </div>
              </div>
            </div>

            <div className="tw-card-lift overflow-hidden group cursor-pointer" onClick={() => fillCity('Paris')}>
              <div className="h-48 relative overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80"
                  alt="Paris"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 tw-badge tw-badge-emerald">Paris, France</div>
              </div>
              <div className="p-5 space-y-2">
                <h3 className="font-extrabold text-base font-display text-[#131314]">Paris Art & Architecture</h3>
                <p className="text-xs text-[var(--muted)]">Eiffel Tower, Louvre Museum, Montmartre, Notre-Dame, Seine Cruise</p>
                <div className="pt-2 text-xs font-bold text-[#131314] flex items-center gap-1">
                  <span>Generate Plan</span>
                  <ArrowRightIcon size={12} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BOTTOM DARK PANEL CTA */}
        <section className="py-16 px-4 sm:px-8 max-w-5xl mx-auto">
          <div className="tw-card-dark p-10 sm:p-14 text-center space-y-6 relative overflow-hidden shadow-2xl">
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-white">
              Ready to plan your adaptive trip?
            </h2>
            <p className="text-slate-300 text-sm max-w-xl mx-auto leading-relaxed">
              Create weather-adaptive itineraries with real local places, metro routes, and instant rain backups in seconds.
            </p>
            <Link
              href="/plan"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-[#131314] font-extrabold text-sm hover:bg-slate-100 transition-all hover:scale-105 shadow-lg"
            >
              <span>Create Your Trip Now</span>
              <ArrowRightIcon size={16} />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
