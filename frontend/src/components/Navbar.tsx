'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { useTheme } from '@/context/ThemeContext';
import {
  CompassIcon,
  SparklesIcon,
  UserIcon,
  LogOutIcon,
  CloseIcon,
  SunIcon,
  MoonIcon,
} from '@/components/Icons';

export default function Navbar() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
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

  const navLinkClass = (active: boolean) =>
    `transition-all px-3 py-1.5 rounded-xl text-xs font-semibold border ${
      active
        ? 'bg-amber-400/10 dark:bg-amber-400/10 text-amber-700 dark:text-amber-300 border-amber-500/25 font-bold'
        : 'border-transparent text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
    }`;

  return (
    <nav className={`sticky top-0 z-50 tw-navbar backdrop-blur-xl h-16 flex items-center transition-all ${scrolled ? 'shadow-lg shadow-black/5' : ''}`}>
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-8 flex items-center justify-between">

        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center shadow-sm group-hover:scale-105 transition-all duration-200">
            <CompassIcon size={18} className="text-amber-500" />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-extrabold text-[15px] tracking-tight text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors duration-200">
              TRIPWISE
            </span>
            <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 -mt-0.5">
              Adaptive Travel
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1 text-xs font-semibold">
          <Link href="/plan" className={`${navLinkClass(pathname === '/plan')} flex items-center gap-1.5`}>
            <SparklesIcon size={13} className="text-amber-500" />
            Plan Trip
          </Link>
          <Link href="/dashboard" className={navLinkClass(pathname === '/dashboard')}>
            My Trips
          </Link>
          <Link href="/admin" className={navLinkClass(pathname === '/admin')}>
            Admin
          </Link>
          <Link
            href="/#how-it-works"
            onClick={(e) => handleSectionClick(e, 'how-it-works')}
            className={navLinkClass(false)}
          >
            How It Works
          </Link>
          <Link
            href="/#features"
            onClick={(e) => handleSectionClick(e, 'features')}
            className={navLinkClass(false)}
          >
            Features
          </Link>
        </div>

        {/* Right cluster */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl tw-btn-ghost border text-slate-600 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 transition"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <SunIcon size={16} className="text-amber-400" />
            ) : (
              <MoonIcon size={16} />
            )}
          </button>

          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className="tw-btn-ghost flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition"
              >
                <UserIcon size={13} className="text-amber-500" />
                <span className="max-w-[100px] truncate">{user.email?.split('@')[0]}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl tw-btn-ghost border text-slate-500 hover:text-rose-500 hover:border-rose-500/30 hover:bg-rose-500/8 transition"
                title="Log Out"
              >
                <LogOutIcon size={14} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="tw-btn-primary px-4 py-2 rounded-xl text-xs"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile controls */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl tw-btn-ghost border"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <SunIcon size={17} className="text-amber-400" /> : <MoonIcon size={17} />}
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl tw-btn-ghost border"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? (
              <CloseIcon size={19} />
            ) : (
              <div className="space-y-1.5 w-5">
                <div className="h-0.5 bg-current rounded" />
                <div className="h-0.5 bg-current rounded w-4" />
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 tw-navbar border-b tw-divider p-4 flex flex-col gap-2 shadow-xl animate-fade-in-up">
          <Link
            href="/plan"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-bold"
          >
            <SparklesIcon size={15} className="text-amber-500" />
            Plan My Trip
          </Link>
          <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-slate-800 dark:text-slate-200 text-xs font-semibold">My Saved Trips</Link>
          <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-slate-800 dark:text-slate-200 text-xs font-semibold">Admin Dashboard</Link>
          <Link href="/#how-it-works" onClick={(e) => handleSectionClick(e, 'how-it-works')} className="px-4 py-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 text-xs">How It Works</Link>
          <Link href="/#features" onClick={(e) => handleSectionClick(e, 'features')} className="px-4 py-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 text-xs">Features</Link>

          <div className="pt-2 border-t tw-divider flex flex-col gap-2">
            {user ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 text-rose-500 text-xs font-semibold border border-rose-500/20"
              >
                <LogOutIcon size={14} />
                Log Out ({user.email?.split('@')[0]})
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-center py-2.5 rounded-xl tw-btn-ghost border text-xs font-semibold">Log In</Link>
                <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)} className="text-center py-2.5 rounded-xl tw-btn-primary text-xs">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
