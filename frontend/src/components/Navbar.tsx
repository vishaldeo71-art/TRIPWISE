'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
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
    <nav className="sticky top-0 z-50 bg-[#0F141E]/80 dark:bg-[#0F141E]/80 light:bg-white/90 backdrop-blur-xl border-b border-stone-200/80 dark:border-[#1E2638] px-4 sm:px-8 py-3 transition-colors h-16 flex items-center">
      <div className="max-w-7xl w-full mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shadow-sm group-hover:scale-105 transition-all">
            <CompassIcon size={18} className="text-amber-500 dark:text-amber-400" />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors">
              TRIPWISE
            </span>
            <span className="text-[9px] uppercase font-bold tracking-widest text-slate-500 dark:text-slate-400 -mt-0.5">
              Adaptive Travel
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-6 text-xs font-semibold tracking-wide text-slate-600 dark:text-slate-300">
          <Link
            href="/plan"
            className={`transition-all flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${
              pathname === '/plan'
                ? 'bg-amber-400/10 text-amber-700 dark:text-amber-300 border-amber-500/30 font-bold'
                : 'border-transparent hover:text-slate-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-slate-900/60'
            }`}
          >
            <SparklesIcon size={14} className="text-amber-500 dark:text-amber-400" /> Plan Trip
          </Link>

          <Link
            href="/dashboard"
            className={`transition-all px-3 py-1.5 rounded-xl border ${
              pathname === '/dashboard'
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 font-bold'
                : 'border-transparent hover:text-slate-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-slate-900/60'
            }`}
          >
            My Trips
          </Link>

          <Link
            href="/admin"
            className={`transition-all px-3 py-1.5 rounded-xl border ${
              pathname === '/admin'
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 font-bold'
                : 'border-transparent hover:text-slate-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-slate-900/60'
            }`}
          >
            Admin
          </Link>

          <Link
            href="/#how-it-works"
            onClick={(e) => handleSectionClick(e, 'how-it-works')}
            className="hover:text-slate-900 dark:hover:text-white transition px-2 py-1"
          >
            How It Works
          </Link>

          <Link
            href="/#features"
            onClick={(e) => handleSectionClick(e, 'features')}
            className="hover:text-slate-900 dark:hover:text-white transition px-2 py-1"
          >
            Features
          </Link>
        </div>

        {/* Right Action Cluster: Theme Toggle + Auth */}
        <div className="hidden md:flex items-center gap-3">
          {/* Light / Dark Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-stone-100 dark:bg-[#121620] border border-stone-200 dark:border-[#1E2638] text-slate-700 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 transition shadow-sm"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <SunIcon size={16} className="text-amber-400" />
            ) : (
              <MoonIcon size={16} className="text-slate-700" />
            )}
          </button>

          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-[#121620] hover:bg-stone-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-stone-200 dark:border-[#1E2638] transition shadow-sm"
              >
                <UserIcon size={14} className="text-amber-500 dark:text-amber-400" />
                <span className="max-w-[110px] truncate">{user.email?.split('@')[0]}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl bg-stone-100 dark:bg-[#121620] hover:bg-rose-500/10 hover:text-rose-500 text-slate-500 dark:text-slate-400 text-xs border border-stone-200 dark:border-[#1E2638] transition"
                title="Log Out"
              >
                <LogOutIcon size={14} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3.5 py-1.5 rounded-xl text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-semibold transition hover:bg-stone-100 dark:hover:bg-slate-900/50"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md shadow-amber-400/10 transition duration-200"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu & Theme Controls */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-stone-100 dark:bg-[#121620] border border-stone-200 dark:border-[#1E2638] text-slate-700 dark:text-slate-300"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <SunIcon size={18} className="text-amber-400" /> : <MoonIcon size={18} className="text-slate-700" />}
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-stone-100 dark:hover:bg-slate-900"
          >
            {isMobileMenuOpen ? (
              <CloseIcon size={20} />
            ) : (
              <div className="space-y-1.5 w-5">
                <div className="h-0.5 bg-current rounded"></div>
                <div className="h-0.5 bg-current rounded"></div>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white dark:bg-[#0F141E] border-b border-stone-200 dark:border-[#1E2638] p-4 flex flex-col gap-2.5 shadow-xl animate-fade-in">
          <Link
            href="/plan"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-amber-400/10 text-amber-700 dark:text-amber-300 text-xs font-bold border border-amber-500/20"
          >
            <SparklesIcon size={16} className="text-amber-500 dark:text-amber-400" /> Plan My Trip
          </Link>
          <Link
            href="/dashboard"
            onClick={() => setIsMobileMenuOpen(false)}
            className="px-3.5 py-2 rounded-xl hover:bg-stone-100 dark:hover:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-semibold"
          >
            My Saved Trips
          </Link>
          <Link
            href="/admin"
            onClick={() => setIsMobileMenuOpen(false)}
            className="px-3.5 py-2 rounded-xl hover:bg-stone-100 dark:hover:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-semibold"
          >
            Admin Dashboard
          </Link>
          <Link
            href="/#how-it-works"
            onClick={(e) => handleSectionClick(e, 'how-it-works')}
            className="px-3.5 py-2 rounded-xl hover:bg-stone-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs"
          >
            How It Works
          </Link>
          <Link
            href="/#features"
            onClick={(e) => handleSectionClick(e, 'features')}
            className="px-3.5 py-2 rounded-xl hover:bg-stone-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs"
          >
            Features
          </Link>
          <div className="pt-2 border-t border-stone-200 dark:border-[#1E2638] flex flex-col gap-2">
            {user ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-500/10 text-rose-500 text-xs font-semibold"
              >
                <LogOutIcon size={14} /> Log Out ({user.email?.split('@')[0]})
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-center py-2 rounded-xl bg-stone-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-stone-200 dark:border-slate-800"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-center py-2 rounded-xl bg-amber-400 text-slate-950 text-xs font-extrabold shadow-md"
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
