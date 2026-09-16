import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';

export const metadata: Metadata = {
  title: 'TRIPWISE — Weather-Aware Adaptive Travel Platform',
  description:
    'Dynamic weather-adaptive travel itineraries built with destination-specific places, smart route optimization, and metro transit intelligence.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col font-sans selection:bg-amber-500/20 selection:text-amber-700 dark:selection:text-amber-200">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
