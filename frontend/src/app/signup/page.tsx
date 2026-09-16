'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CompassIcon, UserIcon, MailIcon, LockIcon, AlertIcon, CheckIcon, ArrowRightIcon } from '@/components/Icons';
import { supabase } from '@/lib/supabase';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name.trim()) { setError('Please enter your full name.'); return; }
    if (!email.trim() || !email.includes('@')) { setError('Please enter a valid email address.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters long.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match. Please check and try again.'); return; }

    setLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: { data: { full_name: name.trim() } },
      });

      if (signUpError) { setError(signUpError.message); setLoading(false); return; }

      if (data.user) {
        try {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            full_name: name.trim(),
            updated_at: new Date().toISOString(),
          });
        } catch {
          console.log('Profile upsert fallback handled by database trigger');
        }

        if (data.session) {
          setSuccess('Account created successfully! Redirecting to dashboard...');
          setTimeout(() => { window.location.href = '/dashboard'; }, 1200);
        } else {
          setSuccess('Account created! Check your email to confirm your account before logging in.');
          setLoading(false);
        }
      }
    } catch (err: unknown) {
      setError((err as Error)?.message || 'An unexpected error occurred during signup.');
      setLoading(false);
    }
  };

  const inputClass = "tw-input w-full pl-10 pr-4 py-3 rounded-xl text-sm placeholder-slate-400";
  const labelClass = "block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5";

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F5F0] dark:bg-[#07090F] text-slate-900 dark:text-[#F0F4FF] transition-colors">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 py-14">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="tw-card p-7 sm:p-9 relative overflow-hidden">
            {/* Ambient glow */}
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-amber-400/10 dark:bg-amber-400/8 blur-3xl pointer-events-none" />

            <div className="relative text-center mb-7">
              <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 mx-auto flex items-center justify-center text-amber-500 mb-4 shadow-inner" style={{ width: 52, height: 52 }}>
                <CompassIcon size={24} />
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Create Account</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1.5">
                Start planning weather-aware travel itineraries
              </p>
            </div>

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
              <div>
                <label className={labelClass}>Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Alex Sharma" className={inputClass} />
                </div>
              </div>

              <div>
                <label className={labelClass}>Email Address</label>
                <div className="relative">
                  <MailIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="alex@example.com" className={inputClass} />
                </div>
              </div>

              <div>
                <label className={labelClass}>Password</label>
                <div className="relative">
                  <LockIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" className={inputClass} />
                </div>
              </div>

              <div>
                <label className={labelClass}>Confirm Password</label>
                <div className="relative">
                  <LockIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter password" className={inputClass} />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="tw-btn-primary w-full py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRightIcon className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-xs text-slate-600 dark:text-slate-400 mt-6 relative">
              Already have an account?{' '}
              <Link href="/login" className="text-amber-600 dark:text-amber-400 font-semibold hover:underline">
                Log in here
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
