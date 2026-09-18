'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { SparklesIcon, UserIcon, LogOutIcon, CloseIcon, GlobeIcon } from '@/components/Icons';
import { useLanguage, LANGUAGES, Language } from '@/context/LanguageContext';

export default function Navbar() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [langSearch, setLangSearch] = useState('');
  const pathname = usePathname();
  const { language, setLanguage, t, currentLanguageOption } = useLanguage();
  const filteredLanguages = LANGUAGES.filter((l: any) =>
    l.name.toLowerCase().includes(langSearch.toLowerCase()) ||
    l.code.toLowerCase().includes(langSearch.toLowerCase())
  );

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
            {t('planTrip')}
          </Link>

          <Link
            href="/inspiration"
            className={`px-3.5 py-1.5 rounded-full transition-all ${
              pathname === '/inspiration'
                ? 'bg-[#131314] text-white shadow-sm'
                : 'hover:bg-white/60 text-[#131314]'
            }`}
          >
            {t('inspiration')}
          </Link>

          <Link
            href="/vault"
            className={`px-3.5 py-1.5 rounded-full transition-all ${
              pathname === '/vault'
                ? 'bg-[#131314] text-white shadow-sm'
                : 'hover:bg-white/60 text-[#131314]'
            }`}
          >
            {t('travelVault')}
          </Link>

          <Link
            href="/dashboard"
            className={`px-3.5 py-1.5 rounded-full transition-all ${
              pathname === '/dashboard'
                ? 'bg-[#131314] text-white shadow-sm'
                : 'hover:bg-white/60 text-[#131314]'
            }`}
          >
            {t('myTrips')}
          </Link>

          <Link
            href="/admin"
            className={`px-3 py-1.5 rounded-full transition-all text-[11px] font-bold ${
              pathname === '/admin'
                ? 'bg-[#131314] text-white'
                : 'text-[var(--muted)] hover:text-[#131314]'
            }`}
          >
            {t('admin')}
          </Link>
        </div>

        {/* Top Right Action Buttons + Language Selector Icon */}
        <div className="hidden md:flex items-center gap-2.5">
          {/* Top Right Language Picker Globe Icon */}
          <div className="relative">
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--surface)] border border-[var(--border)] text-xs font-bold text-[#131314] hover:bg-[var(--surface-2)] transition"
              title="Select Language"
            >
              <GlobeIcon size={16} className="text-amber-600" />
              <span>{currentLanguageOption.flag}</span>
              <span className="uppercase text-[11px] font-extrabold">{currentLanguageOption.code}</span>
            </button>

            {isLangOpen && (
              <div className="absolute right-0 mt-2 w-64 max-h-96 overflow-y-auto bg-white border border-[var(--border)] rounded-2xl shadow-2xl py-2 z-50 text-xs font-semibold animate-fade-in scrollbar-thin">
                <div className="px-3 py-1.5 border-b border-[var(--border)] mb-1 sticky top-0 bg-white z-10 space-y-1.5">
                  <div className="text-[10px] uppercase font-bold text-[var(--muted)] flex items-center justify-between">
                    <span>Select Language ({LANGUAGES.length})</span>
                    <span className="text-[9px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded font-bold">100% Page Translate</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Search language..."
                    value={langSearch}
                    onChange={(e) => setLangSearch(e.target.value)}
                    className="w-full p-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-xs text-[#131314] focus:outline-none"
                    autoFocus
                  />
                </div>

                <div className="py-1">
                  {filteredLanguages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setIsLangOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-[var(--surface)] transition ${
                        language === lang.code ? 'font-extrabold text-amber-600 bg-amber-50/50' : 'text-[#131314]'
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <span className="text-base">{lang.flag}</span>
                        <span className="truncate">{lang.name}</span>
                      </span>
                      {language === lang.code && <span className="text-xs font-bold text-amber-600">✓</span>}
                    </button>
                  ))}
                  {filteredLanguages.length === 0 && (
                    <div className="px-3 py-4 text-center text-[var(--muted)] text-xs">
                      No language found matching "{langSearch}"
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

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
                {t('logIn')}
              </Link>
              <Link
                href="/plan"
                className="tw-btn-primary text-xs !py-2 !px-4"
              >
                {t('startPlanning')}
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
          {/* Mobile Language Selector */}
          <div className="flex items-center justify-between px-4 py-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-xs font-bold">
            <span className="flex items-center gap-2">
              <GlobeIcon size={16} className="text-amber-600" />
              <span>Language:</span>
            </span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="bg-transparent text-xs font-extrabold text-[#131314] focus:outline-none"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.name}
                </option>
              ))}
            </select>
          </div>

          <Link
            href="/plan"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#131314] text-white text-xs font-bold"
          >
            <SparklesIcon size={16} className="text-amber-400" /> {t('planTrip')}
          </Link>
          <Link
            href="/inspiration"
            onClick={() => setIsMobileMenuOpen(false)}
            className="px-4 py-2 rounded-xl hover:bg-[var(--surface)] text-[#131314] text-xs font-semibold"
          >
            {t('inspiration')}
          </Link>
          <Link
            href="/vault"
            onClick={() => setIsMobileMenuOpen(false)}
            className="px-4 py-2 rounded-xl hover:bg-[var(--surface)] text-[#131314] text-xs font-semibold"
          >
            {t('travelVault')}
          </Link>
          <Link
            href="/dashboard"
            onClick={() => setIsMobileMenuOpen(false)}
            className="px-4 py-2 rounded-xl hover:bg-[var(--surface)] text-[#131314] text-xs font-semibold"
          >
            {t('myTrips')}
          </Link>
          <Link
            href="/admin"
            onClick={() => setIsMobileMenuOpen(false)}
            className="px-4 py-2 rounded-xl hover:bg-[var(--surface)] text-[#131314] text-xs font-semibold"
          >
            {t('admin')}
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
                  {t('logIn')}
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-center py-2 rounded-xl bg-[#131314] text-white text-xs font-bold"
                >
                  {t('signUp')}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
