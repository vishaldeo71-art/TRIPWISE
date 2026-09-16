import Link from 'next/link';
import { CompassIcon } from '@/components/Icons';

export default function Footer() {
  return (
    <footer className="bg-white/80 dark:bg-[#0F141E]/80 border-t border-stone-200/80 dark:border-[#1E2638] mt-auto py-8 px-4 sm:px-8 text-slate-500 dark:text-slate-400 text-xs transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <CompassIcon size={16} className="text-amber-500 dark:text-amber-400" />
          </div>
          <div>
            <span className="font-extrabold text-slate-900 dark:text-slate-200 tracking-tight text-sm">TRIPWISE</span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Weather-Aware Adaptive Travel Platform</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-400">
          <Link href="/plan" className="hover:text-amber-600 dark:hover:text-amber-300 transition">Plan Trip</Link>
          <Link href="/dashboard" className="hover:text-amber-600 dark:hover:text-amber-300 transition">My Trips</Link>
          <Link href="/#how-it-works" className="hover:text-amber-600 dark:hover:text-amber-300 transition">How It Works</Link>
          <Link href="/#features" className="hover:text-amber-600 dark:hover:text-amber-300 transition">Features</Link>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600 dark:text-slate-400 bg-stone-100 dark:bg-[#121620] px-3.5 py-1.5 rounded-full border border-stone-200 dark:border-[#1E2638]">
          GDG Society NSUT Project
        </div>
      </div>
    </footer>
  );
}
