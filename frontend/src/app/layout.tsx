import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TRIPWISE — Weather-Aware Adaptive Travel Itineraries',
  description: "Your itinerary doesn't just plan your trip. It adapts to it. Personalized travel plans tailored to your persona and real-time weather forecasts.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-slate-950 text-slate-100 min-h-screen flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}
