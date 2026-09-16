'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { UserIcon, MailIcon, LockIcon, AlertIcon, CheckIcon, ArrowRightIcon } from '@/components/Icons';
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

    // Validation
    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please check and try again.');
      return;
    }

    setLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            full_name: name.trim(),
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        try {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            full_name: name.trim(),
            updated_at: new Date().toISOString(),
          });
        } catch (pErr) {
          console.log('Profile upsert fallback handled by database trigger');
        }

        if (data.session) {
          setSuccess('Account created successfully! Redirecting to dashboard...');
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 1200);
        } else {
          setSuccess(
            'Account created! Please check your email to confirm your account before logging in (or disable "Confirm email" in Supabase Dashboard > Authentication > Settings for instant login).'
          );
          setLoading(false);
        }
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred during signup.');
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
            <h1 className="text-2xl font-extrabold font-display text-[#131314]">Create Your Account</h1>
            <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">
              Start planning weather-aware adaptive travel itineraries
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
            {/* Full Name */}
            <div>
              <label className="block tw-eyebrow mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <UserIcon size={16} className="text-[var(--muted)] absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Sharma"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-[var(--border)] rounded-xl text-[#131314] placeholder:text-[var(--muted)] text-sm font-semibold focus:outline-none focus:border-[#131314] transition"
                />
              </div>
            </div>

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
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-[var(--border)] rounded-xl text-[#131314] placeholder:text-[var(--muted)] text-sm font-semibold focus:outline-none focus:border-[#131314] transition"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block tw-eyebrow mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <LockIcon size={16} className="text-[var(--muted)] absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
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
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Sign Up</span>
                  <ArrowRightIcon size={16} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-[var(--muted)] mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-[#131314] font-extrabold hover:underline">
              Log in here
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
