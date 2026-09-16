import Link from 'next/link';
import { CompassIcon } from '@/components/Icons';

export default function Footer() {
  return (
    <footer className="mt-auto py-8 px-4 sm:px-8 border-t tw-divider transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <CompassIcon size={15} className="text-amber-500" />
          </div>
          <div>
            <span className="font-extrabold text-sm text-slate-900 dark:text-white tracking-tight">TRIPWISE</span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Weather-Aware Adaptive Travel</p>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex flex-wrap items-center justify-center gap-5 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <Link href="/plan" className="hover:text-amber-600 dark:hover:text-amber-300 transition-colors">Plan Trip</Link>
          <Link href="/dashboard" className="hover:text-amber-600 dark:hover:text-amber-300 transition-colors">My Trips</Link>
          <Link href="/#how-it-works" className="hover:text-amber-600 dark:hover:text-amber-300 transition-colors">How It Works</Link>
          <Link href="/#features" className="hover:text-amber-600 dark:hover:text-amber-300 transition-colors">Features</Link>
        </nav>

        {/* Credit */}
        <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 px-3.5 py-1.5 rounded-full bg-stone-100 dark:bg-white/[0.04] border border-stone-200 dark:border-white/[0.07]">
          GDG Society NSUT · 2025
        </div>
      </div>
    </footer>
  );
}
