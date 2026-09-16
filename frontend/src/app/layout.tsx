import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TRIPWISE — Intelligent Destination-Specific Itinerary Planner',
  description: 'Dynamic weather-adaptive travel itineraries built with real local places, smart route optimization, and transit intelligence.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-white text-[#131314] min-h-screen flex flex-col font-sans selection:bg-[#131314] selection:text-white">
        {children}
      </body>
    </html>
  );
}
