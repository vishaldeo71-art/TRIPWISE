'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { SparklesIcon, UserIcon, LogOutIcon, CloseIcon } from '@/components/Icons';

export default function Navbar() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

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
    <nav className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-[var(--border)] px-4 sm:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Mark */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-[#131314] text-white flex items-center justify-center font-extrabold text-base tracking-tight shadow-sm group-hover:scale-105 transition-transform">
            T
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg tracking-tight font-display text-[#131314]">
              TRIPWISE
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--muted)] -mt-1">
              AI Itinerary Engine
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-1.5 p-1 bg-[var(--surface)] border border-[var(--border)] rounded-full text-xs font-semibold text-[#131314]">
          <Link
            href="/plan"
            className={`px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
              pathname === '/plan'
                ? 'bg-[#131314] text-white shadow-sm'
                : 'hover:bg-white/60 text-[#131314]'
            }`}
          >
            <SparklesIcon size={14} className={pathname === '/plan' ? 'text-amber-400' : 'text-amber-600'} />
            Plan Trip
          </Link>

          <Link
            href="/inspiration"
            className={`px-3.5 py-1.5 rounded-full transition-all ${
              pathname === '/inspiration'
                ? 'bg-[#131314] text-white shadow-sm'
                : 'hover:bg-white/60 text-[#131314]'
            }`}
          >
            Inspiration
          </Link>

          <Link
            href="/vault"
            className={`px-3.5 py-1.5 rounded-full transition-all ${
              pathname === '/vault'
                ? 'bg-[#131314] text-white shadow-sm'
                : 'hover:bg-white/60 text-[#131314]'
            }`}
          >
            Travel Vault
          </Link>

          <Link
            href="/dashboard"
            className={`px-3.5 py-1.5 rounded-full transition-all ${
              pathname === '/dashboard'
                ? 'bg-[#131314] text-white shadow-sm'
                : 'hover:bg-white/60 text-[#131314]'
            }`}
          >
            My Trips
          </Link>

          <Link
            href="/admin"
            className={`px-3 py-1.5 rounded-full transition-all text-[11px] font-bold ${
              pathname === '/admin'
                ? 'bg-[#131314] text-white'
                : 'text-[var(--muted)] hover:text-[#131314]'
            }`}
          >
            Admin
          </Link>
        </div>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-2.5">
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--surface)] text-[#131314] text-xs font-semibold border border-[var(--border)] hover:bg-[var(--surface-2)] transition"
              >
                <UserIcon size={14} className="text-amber-600" />
                <span className="max-w-[110px] truncate">{user.email?.split('@')[0]}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 rounded-full bg-[var(--surface)] hover:bg-rose-50 hover:text-rose-600 text-[var(--muted)] text-xs border border-[var(--border)] transition"
                title="Log Out"
              >
                <LogOutIcon size={14} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="tw-btn-ghost text-xs"
              >
                Log In
              </Link>
              <Link
                href="/plan"
                className="tw-btn-primary text-xs !py-2 !px-4"
              >
                Start Planning →
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 text-[#131314] hover:bg-[var(--surface)] rounded-xl"
        >
          {isMobileMenuOpen ? <CloseIcon size={20} /> : <div className="space-y-1 w-5"><div className="h-0.5 bg-[#131314] rounded"></div><div className="h-0.5 bg-[#131314] rounded"></div></div>}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-[var(--border)] flex flex-col gap-2 pb-2">
          <Link
            href="/plan"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#131314] text-white text-xs font-bold"
          >
            <SparklesIcon size={16} className="text-amber-400" /> Plan My Trip
          </Link>
          <Link
            href="/inspiration"
            onClick={() => setIsMobileMenuOpen(false)}
            className="px-4 py-2 rounded-xl hover:bg-[var(--surface)] text-[#131314] text-xs font-semibold"
          >
            Inspiration Library
          </Link>
          <Link
            href="/vault"
            onClick={() => setIsMobileMenuOpen(false)}
            className="px-4 py-2 rounded-xl hover:bg-[var(--surface)] text-[#131314] text-xs font-semibold"
          >
            Travel Vault (Receipts)
          </Link>
          <Link
            href="/dashboard"
            onClick={() => setIsMobileMenuOpen(false)}
            className="px-4 py-2 rounded-xl hover:bg-[var(--surface)] text-[#131314] text-xs font-semibold"
          >
            My Saved Trips
          </Link>
          <Link
            href="/admin"
            onClick={() => setIsMobileMenuOpen(false)}
            className="px-4 py-2 rounded-xl hover:bg-[var(--surface)] text-[#131314] text-xs font-semibold"
          >
            Admin Dashboard
          </Link>
          <div className="pt-2 border-t border-[var(--border)] flex flex-col gap-2">
            {user ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-50 text-rose-600 text-xs font-semibold"
              >
                <LogOutIcon size={14} /> Log Out ({user.email?.split('@')[0]})
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-center py-2 rounded-xl bg-[var(--surface)] text-[#131314] text-xs font-semibold border border-[var(--border)]"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-center py-2 rounded-xl bg-[#131314] text-white text-xs font-bold"
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
