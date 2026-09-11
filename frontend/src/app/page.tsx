'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  Sparkles,
  CloudRain,
  UserCheck,
  Zap,
  Share2,
  ArrowRight,
  Compass,
  CheckCircle2,
  Sun,
  ShieldCheck,
  Calendar,
  Layers
} from 'lucide-react';

export default function LandingPage() {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const id = window.location.hash.substring(1);
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, []);
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-brand-500 selection:text-white">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative pt-16 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
          {/* Ambient Glows */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-brand-600/20 via-sky-500/15 to-purple-600/20 blur-[120px] rounded-full pointer-events-none -z-10" />

          <div className="text-center max-w-4xl mx-auto space-y-8">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-sky-300 text-xs sm:text-sm font-medium backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-sky-400 animate-pulse" />
              <span>Next-Gen Travel Engine • Weather-Aware Adaptation</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
              Your itinerary doesn&apos;t just plan your trip.{' '}
              <span className="gradient-text">It adapts to it.</span>
            </h1>

            {/* Supporting Subtitle */}
            <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
              Build smarter trips around your destination, travel style, and the weather — with an itinerary that adapts when conditions change.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                href="/plan"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-600 via-sky-500 to-indigo-600 hover:from-brand-500 hover:to-sky-400 text-white font-bold text-lg shadow-xl shadow-brand-500/25 transition-all duration-300 hover:scale-[1.03] flex items-center justify-center gap-3 group"
              >
                <span>Plan My Trip</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#how-it-works"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                  window.history.pushState(null, '', '/#how-it-works');
                }}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-semibold text-lg border border-slate-800 transition-all duration-300 flex items-center justify-center gap-2"
              >
                Explore How It Works
              </a>
            </div>

            {/* Interactive Preview Card Mockup */}
            <div className="pt-12">
              <div className="glass-card rounded-2xl p-6 sm:p-8 max-w-3xl mx-auto border border-slate-800/90 shadow-2xl relative">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6 text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold">
                      DEL
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-white">Delhi • 3 Days Itinerary</h3>
                      <p className="text-xs text-slate-400">Backpacker Persona • Balanced Pace</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                    <Sun className="w-3.5 h-3.5" /> Outdoor Suitability: High
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider">Morning</span>
                    <h4 className="font-bold text-sm text-slate-100 mt-1">Humayun&apos;s Tomb & Gardens</h4>
                    <p className="text-xs text-slate-400 mt-1">🚶 15 min walk • Outdoor Heritage</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Afternoon</span>
                    <h4 className="font-bold text-sm text-slate-100 mt-1">Old Delhi Food & Spice Tour</h4>
                    <p className="text-xs text-slate-400 mt-1">🍲 Persona Match: Backpacker</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-brand-500/40 bg-brand-500/5 relative">
                    <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider flex items-center justify-between">
                      Evening
                      <span className="text-[10px] bg-brand-500/20 px-1.5 py-0.5 rounded text-brand-300">Plan B Ready</span>
                    </span>
                    <h4 className="font-bold text-sm text-slate-100 mt-1">Akshardham Light Show</h4>
                    <p className="text-xs text-slate-400 mt-1">🌧️ Rain protection backup</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* VISUAL EXPLANATION (STEP FLOW) */}
        <section id="how-it-works" className="scroll-mt-24 py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/60">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-sky-400">Simple 4-Step Process</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white">How TRIPWISE Adapts Your Journey</p>
            <p className="text-slate-400 text-base">From destination selection to live weather adjustments in seconds.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* Step 1 */}
            <div className="glass-card glass-card-hover p-6 rounded-2xl flex flex-col items-start relative group">
              <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400 font-extrabold text-lg mb-4 group-hover:scale-110 transition-transform">
                01
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-brand-400 mb-1">Step 1</div>
              <h3 className="text-xl font-bold text-white mb-2">PLAN</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Choose your destination, dates (1–7 days), travel pace, and persona (Backpacker, Family, Luxury, Explorer).
              </p>
            </div>

            {/* Step 2 */}
            <div className="glass-card glass-card-hover p-6 rounded-2xl flex flex-col items-start relative group">
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 font-extrabold text-lg mb-4 group-hover:scale-110 transition-transform">
                02
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-sky-400 mb-1">Step 2</div>
              <h3 className="text-xl font-bold text-white mb-2">CHECK WEATHER</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                We fetch real-time public weather forecasts for your destination to evaluate outdoor suitability and rain risks.
              </p>
            </div>

            {/* Step 3 */}
            <div className="glass-card glass-card-hover p-6 rounded-2xl flex flex-col items-start relative group">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-extrabold text-lg mb-4 group-hover:scale-110 transition-transform">
                03
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-1">Step 3</div>
              <h3 className="text-xl font-bold text-white mb-2">ADAPT</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Activities are dynamically scheduled. Rain expected in the afternoon? Outdoor visits move to morning with indoor Plan B.
              </p>
            </div>

            {/* Step 4 */}
            <div className="glass-card glass-card-hover p-6 rounded-2xl flex flex-col items-start relative group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-extrabold text-lg mb-4 group-hover:scale-110 transition-transform">
                04
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">Step 4</div>
              <h3 className="text-xl font-bold text-white mb-2">TRAVEL</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Save your itinerary to your personal dashboard, share with trip partners, and switch between days seamlessly.
              </p>
            </div>
          </div>
        </section>

        {/* FEATURE CARDS */}
        <section id="features" className="scroll-mt-24 py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/60">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-brand-400">Core Features</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white">Built for Unpredictable Journeys</p>
            <p className="text-slate-400 text-base">Everything you need to plan memorable, stress-free travel.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="glass-card p-6 rounded-2xl border border-slate-800 hover:border-brand-500/40 transition">
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 mb-5">
                <CloudRain className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Weather-Aware Planning</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Real weather forecast integration ensures outdoor activities take place during optimal sunlight and dry conditions.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass-card p-6 rounded-2xl border border-slate-800 hover:border-brand-500/40 transition">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-5">
                <UserCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Personalized Itineraries</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Whether you travel as a Backpacker, Family, Luxury seeker, or Explorer, your recommendations match your budget and vibe.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass-card p-6 rounded-2xl border border-slate-800 hover:border-brand-500/40 transition">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-5">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Instant Plan B</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                🌧️ What if it rains? One click transforms rain-threatened outdoor activities into top-rated indoor alternatives.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="glass-card p-6 rounded-2xl border border-slate-800 hover:border-brand-500/40 transition">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-5">
                <Share2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Save & Share Trips</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Store your itineraries securely in your account dashboard and share clean, private-ready links with friends.
              </p>
            </div>
          </div>
        </section>

        {/* BOTTOM CTA BANNER */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
          <div className="glass-card rounded-3xl p-10 sm:p-14 border border-brand-500/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 blur-[90px] rounded-full pointer-events-none" />

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Ready to create your adaptive itinerary?
            </h2>
            <p className="text-slate-300 text-lg max-w-xl mx-auto mb-8">
              No more getting stranded in the rain. Build your customized travel plan in less than 30 seconds.
            </p>
            <Link
              href="/plan"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-600 via-sky-500 to-indigo-600 hover:from-brand-500 hover:to-sky-400 text-white font-bold text-lg shadow-xl shadow-brand-500/25 transition hover:scale-105"
            >
              <span>Start Planning Now</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
