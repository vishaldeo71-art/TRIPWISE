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
          setError(
            'Your email address has not been confirmed yet. Please check your inbox for the confirmation link, or turn off "Confirm email" in Supabase Authentication settings.'
          );
        } else if (msg.includes('invalid login credentials')) {
          setError(
            'Invalid email or password. If you just created this account, please check if Supabase requires email confirmation, or verify your email and password.'
          );
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
        } catch (pErr) {
          console.log('Profile sync fallback handled by DB');
        }

        setSuccess('Welcome back! Redirecting to your dashboard...');
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1000);
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred during login.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#131314] font-sans">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-10">
        <div className="w-full max-w-md tw-card p-6 sm:p-8 relative overflow-hidden">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-[#131314] text-white mx-auto flex items-center justify-center font-extrabold text-xl font-display mb-4 shadow-sm">
              T
            </div>
            <h1 className="text-2xl font-extrabold font-display text-[#131314]">Log In to TRIPWISE</h1>
            <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">
              Access your saved trips and weather-adaptive itineraries
            </p>
          </div>

          {/* Feedback Banners */}
          {error && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertIcon size={16} className="text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
              <CheckIcon size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block tw-eyebrow mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <MailIcon size={16} className="text-[var(--muted)] absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-[var(--border)] rounded-xl text-[#131314] placeholder:text-[var(--muted)] text-sm font-semibold focus:outline-none focus:border-[#131314] transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block tw-eyebrow mb-1.5">
                Password
              </label>
              <div className="relative">
                <LockIcon size={16} className="text-[var(--muted)] absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-[var(--border)] rounded-xl text-[#131314] placeholder:text-[var(--muted)] text-sm font-semibold focus:outline-none focus:border-[#131314] transition"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="tw-btn-primary w-full !py-3.5 text-sm"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Logging In...</span>
                </>
              ) : (
                <>
                  <span>Log In</span>
                  <ArrowRightIcon size={16} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-[var(--muted)] mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-[#131314] font-extrabold hover:underline">
              Create one now
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
