import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[var(--surface)] border-t border-[var(--border)] mt-auto py-12 px-6 sm:px-12 text-[#131314]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand & Mission */}
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-xl bg-[#131314] text-white flex items-center justify-center font-extrabold text-sm">
              T
            </div>
            <span className="font-extrabold text-lg font-display tracking-tight">TRIPWISE</span>
          </div>
          <p className="text-xs text-[var(--muted)] leading-relaxed mb-4">
            Next-generation AI travel itinerary engine. Adaptive weather intelligence, real local places, and optimal route generation for effortless exploration.
          </p>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 bg-white border border-[var(--border)] rounded-full text-[#131314]">
            GDG Dev Project
          </div>
        </div>

        {/* Travelers */}
        <div>
          <h4 className="font-bold text-xs uppercase tracking-wider text-[var(--muted)] mb-3 font-display">Travelers</h4>
          <ul className="space-y-2 text-xs font-semibold">
            <li><Link href="/plan" className="hover:underline">Plan Itinerary</Link></li>
            <li><Link href="/dashboard" className="hover:underline">My Saved Trips</Link></li>
            <li><Link href="/#how-it-works" className="hover:underline">How It Works</Link></li>
            <li><Link href="/#features" className="hover:underline">Platform Features</Link></li>
          </ul>
        </div>

        {/* Popular Destinations */}
        <div>
          <h4 className="font-bold text-xs uppercase tracking-wider text-[var(--muted)] mb-3 font-display">Destinations</h4>
          <ul className="space-y-2 text-xs text-[var(--muted)]">
            <li><Link href="/plan?city=Delhi" className="hover:text-[#131314]">New Delhi, India</Link></li>
            <li><Link href="/plan?city=Tokyo" className="hover:text-[#131314]">Tokyo, Japan</Link></li>
            <li><Link href="/plan?city=Paris" className="hover:text-[#131314]">Paris, France</Link></li>
            <li><Link href="/plan?city=London" className="hover:text-[#131314]">London, United Kingdom</Link></li>
          </ul>
        </div>

        {/* Admin & System */}
        <div>
          <h4 className="font-bold text-xs uppercase tracking-wider text-[var(--muted)] mb-3 font-display">System</h4>
          <ul className="space-y-2 text-xs font-semibold">
            <li><Link href="/admin" className="hover:underline">Admin Analytics</Link></li>
            <li><Link href="/login" className="hover:underline">Account Access</Link></li>
            <li><span className="text-[var(--muted)]">Supabase Auth & Database</span></li>
            <li><span className="text-[var(--muted)]">Open-Meteo Weather Integration</span></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[var(--muted)] gap-4">
        <span>© {new Date().getFullYear()} TRIPWISE. Built with Space Grotesk design system.</span>
        <div className="flex gap-4 font-medium">
          <Link href="/#features" className="hover:underline">Privacy Policy</Link>
          <Link href="/#features" className="hover:underline">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
