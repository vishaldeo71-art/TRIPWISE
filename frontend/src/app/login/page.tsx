'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CompassIcon, MailIcon, LockIcon, AlertIcon, CheckIcon, ArrowRightIcon } from '@/components/Icons';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (signInError) {
        const msg = signInError.message.toLowerCase();
        if (msg.includes('email not confirmed')) {
          setError('Your email has not been confirmed yet. Check your inbox for the confirmation link.');
        } else if (msg.includes('invalid login credentials')) {
          setError('Invalid email or password. Please check your credentials and try again.');
        } else {
          setError(signInError.message || 'Invalid email or password.');
        }
        setLoading(false);
        return;
      }

      if (data.user) {
        try {
          await supabase.from('profiles').upsert(
            {
              id: data.user.id,
              full_name: data.user.user_metadata?.full_name || email.trim().split('@')[0],
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'id' }
          );
        } catch {
          console.log('Profile sync fallback handled by DB');
        }

        setSuccess('Welcome back! Redirecting to your dashboard...');
        setTimeout(() => { window.location.href = '/dashboard'; }, 1000);
      }
    } catch (err: unknown) {
      setError((err as Error)?.message || 'An unexpected error occurred during login.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F5F0] dark:bg-[#07090F] text-slate-900 dark:text-[#F0F4FF] transition-colors">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 py-16">
        <div className="w-full max-w-md animate-fade-in-up">
          {/* Card */}
          <div className="tw-card p-7 sm:p-9 relative overflow-hidden">
            {/* Subtle glow */}
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-amber-400/10 dark:bg-amber-400/8 blur-3xl pointer-events-none" />

            <div className="relative text-center mb-7">
              <div className="w-13 h-13 rounded-2xl bg-amber-500/10 border border-amber-500/20 mx-auto flex items-center justify-center text-amber-500 mb-4 shadow-inner" style={{ width: 52, height: 52 }}>
                <CompassIcon size={24} />
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Welcome back</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1.5">
                Log in to access your saved itineraries
              </p>
            </div>

            {/* Feedback */}
            {error && (
              <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5 animate-fade-in-up">
                <AlertIcon className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="mb-5 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs flex items-start gap-2.5 animate-fade-in-up">
                <CheckIcon className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 relative">
              {/* Email */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <MailIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@example.com"
                    className="tw-input w-full pl-10 pr-4 py-3 rounded-xl text-sm placeholder-slate-400"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <LockIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="tw-input w-full pl-10 pr-4 py-3 rounded-xl text-sm placeholder-slate-400"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="tw-btn-primary w-full py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                    <span>Logging In...</span>
                  </>
                ) : (
                  <>
                    <span>Log In</span>
                    <ArrowRightIcon className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-xs text-slate-600 dark:text-slate-400 mt-6 relative">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-amber-600 dark:text-amber-400 font-semibold hover:underline">
                Create one now
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
