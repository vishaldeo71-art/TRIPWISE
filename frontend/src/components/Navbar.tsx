'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';
import {
  CompassIcon,
  SparklesIcon,
  UserIcon,
  LogOutIcon,
  CloseIcon
} from '@/components/Icons';

export default function Navbar() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const handleSectionClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);

    if (pathname === '/') {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState(null, '', `/#${sectionId}`);
      }
    } else {
      window.location.href = `/#${sectionId}`;
    }
  };

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-white/[0.07] px-4 sm:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 via-amber-600/30 to-sky-600/20 border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-500/10 group-hover:scale-105 group-hover:border-amber-400/50 transition-all duration-300">
            <CompassIcon size={20} className="text-amber-400" />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-extrabold text-lg tracking-tight text-white group-hover:text-amber-200 transition-colors">
              TRIPWISE
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 -mt-0.5 flex items-center gap-1">
              Adaptive Travel Platform
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-7 text-xs font-semibold tracking-wide text-slate-300">
          <Link
            href="/plan"
            className={`transition-all flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border ${
              pathname === '/plan'
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 font-bold shadow-sm'
                : 'border-transparent hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <SparklesIcon size={15} className="text-amber-400" /> Plan Trip
          </Link>

          <Link
            href="/dashboard"
            className={`transition-all px-3 py-1.5 rounded-xl border ${
              pathname === '/dashboard'
                ? 'bg-slate-800/80 text-white border-slate-700 font-bold'
                : 'border-transparent hover:text-white hover:bg-slate-900/60'
            }`}
          >
            My Trips
          </Link>

          <Link
            href="/admin"
            className={`transition-all px-3 py-1.5 rounded-xl border ${
              pathname === '/admin'
                ? 'bg-slate-800/80 text-white border-slate-700 font-bold'
                : 'border-transparent hover:text-white hover:bg-slate-900/60'
            }`}
          >
            Admin
          </Link>

          <Link
            href="/#how-it-works"
            onClick={(e) => handleSectionClick(e, 'how-it-works')}
            className="hover:text-white transition px-2 py-1"
          >
            How It Works
          </Link>

          <Link
            href="/#features"
            onClick={(e) => handleSectionClick(e, 'features')}
            className="hover:text-white transition px-2 py-1"
          >
            Features
          </Link>
        </div>

        {/* Auth CTA Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2.5">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-800 transition shadow-sm"
              >
                <UserIcon size={14} className="text-amber-400" />
                <span className="max-w-[120px] truncate">{user.email?.split('@')[0]}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl bg-slate-900/80 hover:bg-rose-500/10 hover:text-rose-400 text-slate-400 text-xs border border-slate-800 transition"
                title="Log Out"
              >
                <LogOutIcon size={14} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                href="/login"
                className="px-4 py-2 rounded-xl text-slate-300 hover:text-white text-xs font-semibold transition hover:bg-slate-900/50"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-extrabold text-xs shadow-md shadow-amber-500/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-900"
        >
          {isMobileMenuOpen ? <CloseIcon size={20} /> : <div className="space-y-1.5 w-5"><div className="h-0.5 bg-white rounded"></div><div className="h-0.5 bg-white rounded"></div></div>}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-white/[0.08] flex flex-col gap-2.5 pb-2 animate-fade-in">
          <Link
            href="/plan"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-amber-500/10 text-amber-300 text-xs font-bold border border-amber-500/20"
          >
            <SparklesIcon size={16} className="text-amber-400" /> Plan My Trip
          </Link>
          <Link
            href="/dashboard"
            onClick={() => setIsMobileMenuOpen(false)}
            className="px-3.5 py-2 rounded-xl hover:bg-slate-900 text-slate-200 text-xs font-semibold"
          >
            My Saved Trips
          </Link>
          <Link
            href="/admin"
            onClick={() => setIsMobileMenuOpen(false)}
            className="px-3.5 py-2 rounded-xl hover:bg-slate-900 text-slate-200 text-xs font-semibold"
          >
            Admin Dashboard
          </Link>
          <Link
            href="/#how-it-works"
            onClick={(e) => handleSectionClick(e, 'how-it-works')}
            className="px-3.5 py-2 rounded-xl hover:bg-slate-900 text-slate-300 text-xs"
          >
            How It Works
          </Link>
          <Link
            href="/#features"
            onClick={(e) => handleSectionClick(e, 'features')}
            className="px-3.5 py-2 rounded-xl hover:bg-slate-900 text-slate-300 text-xs"
          >
            Features
          </Link>
          <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
            {user ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-500/10 text-rose-400 text-xs font-semibold"
              >
                <LogOutIcon size={14} /> Log Out ({user.email?.split('@')[0]})
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-center py-2 rounded-xl bg-slate-900 text-slate-200 text-xs font-semibold border border-slate-800"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-center py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-extrabold shadow-md"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
