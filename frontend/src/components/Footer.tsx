import Link from 'next/link';
import { Compass, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="glass-card border-t border-slate-800/80 mt-auto py-10 px-4 sm:px-8 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-600/20 border border-brand-500/30 flex items-center justify-center">
            <Compass className="w-4 h-4 text-sky-400" />
          </div>
          <div>
            <span className="font-bold text-slate-200 tracking-tight">TRIPWISE</span>
            <p className="text-xs text-slate-500">Weather-Aware Adaptive Travel Itineraries</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
          <Link href="/plan" className="hover:text-sky-400 transition">Plan Trip</Link>
          <Link href="/dashboard" className="hover:text-sky-400 transition">My Trips</Link>
          <a href="#how-it-works" className="hover:text-sky-400 transition">How It Works</a>
          <a href="#features" className="hover:text-sky-400 transition">Features</a>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20 inline" /> for GDG NSUT Recruitment Project
        </div>
      </div>
    </footer>
  );
}
