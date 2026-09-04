'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Compass, CloudSun, User, LogOut, Menu, X, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';

export default function Navbar() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Check initial auth state
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <nav className="sticky top-0 z-50 glass-card border-b border-slate-800/80 px-4 sm:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-sky-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-500/25 group-hover:scale-105 transition-transform duration-300">
            <Compass className="w-5 h-5 text-white animate-spin-slow" />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-extrabold text-xl tracking-tight text-white group-hover:text-brand-300 transition-colors">
              TRIPWISE
            </span>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-sky-400 -mt-1 flex items-center gap-1">
              <CloudSun className="w-2.5 h-2.5" /> Adaptive Travel
            </span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <Link href="/plan" className="hover:text-brand-300 transition flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-sky-400" /> Plan Trip
          </Link>
          {user && (
            <Link href="/dashboard" className="hover:text-brand-300 transition">
              My Trips
            </Link>
          )}
          <a href="#how-it-works" className="hover:text-brand-300 transition">
            How It Works
          </a>
          <a href="#features" className="hover:text-brand-300 transition">
            Features
          </a>
        </div>

        {/* Auth CTA Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-sm font-medium border border-slate-700/60 transition"
              >
                <User className="w-4 h-4 text-sky-400" />
                <span className="max-w-[120px] truncate">{user.email?.split('@')[0]}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg bg-slate-800/50 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 text-sm border border-slate-800 transition"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                href="/login"
                className="px-4 py-2 rounded-xl text-slate-300 hover:text-white text-sm font-semibold transition"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-sky-500 hover:from-brand-500 hover:to-sky-400 text-white text-sm font-semibold shadow-md shadow-brand-500/20 transition hover:scale-[1.02]"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 text-slate-300 hover:text-white"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-slate-800/80 flex flex-col gap-3 pb-2 animate-fadeIn">
          <Link
            href="/plan"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-200 text-sm font-medium"
          >
            <Sparkles className="w-4 h-4 text-sky-400" /> Plan My Trip
          </Link>
          {user && (
            <Link
              href="/dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-200 text-sm font-medium"
            >
              My Saved Trips
            </Link>
          )}
          <a
            href="#how-it-works"
            onClick={() => setIsMobileMenuOpen(false)}
            className="px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-300 text-sm"
          >
            How It Works
          </a>
          <a
            href="#features"
            onClick={() => setIsMobileMenuOpen(false)}
            className="px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-300 text-sm"
          >
            Features
          </a>
          <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
            {user ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-rose-500/10 text-rose-400 text-sm font-medium"
              >
                <LogOut className="w-4 h-4" /> Log Out ({user.email?.split('@')[0]})
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-center py-2 rounded-lg bg-slate-800 text-slate-200 text-sm font-semibold"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-center py-2 rounded-lg bg-brand-600 text-white text-sm font-semibold"
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
