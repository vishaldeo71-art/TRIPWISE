'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Compass, Mail, Lock, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
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
        // Ensure profile row exists in public.profiles
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
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-8">
        <div className="w-full max-w-md glass-panel rounded-3xl p-6 sm:p-8 border border-slate-700/80 shadow-2xl relative overflow-hidden">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600/20 to-sky-500/20 border border-sky-500/30 mx-auto flex items-center justify-center text-sky-400 mb-3 shadow-inner">
              <Compass className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-white">Log In to TRIPWISE</h1>
            <p className="text-sm text-slate-400 mt-1">
              Access your saved trips and weather-adaptive itineraries
            </p>
          </div>

          {/* Feedback Banners */}
          {error && (
            <div className="mb-4 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-start gap-2.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/90 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 transition shadow-inner"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/90 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 transition shadow-inner"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 via-sky-500 to-indigo-600 hover:from-brand-500 hover:to-sky-400 text-white font-extrabold text-sm shadow-xl shadow-sky-500/20 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Logging In...</span>
                </>
              ) : (
                <>
                  <span>Log In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-sky-400 font-semibold hover:underline">
              Create one now
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
