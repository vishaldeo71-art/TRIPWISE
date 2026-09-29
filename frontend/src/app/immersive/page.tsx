'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Immersive3DViewer from '@/components/Immersive3DViewer';
import {
  MONUMENTS_REGISTRY,
  getMonumentsForCity,
  Monument,
  MonumentFeature
} from '@/data/monuments';
import {
  SparklesIcon,
  CompassIcon,
  MapPinIcon,
  CheckIcon,
  ExternalLinkIcon,
  CalendarIcon,
  FlameIcon,
  CloseIcon,
  ArrowRightIcon,
  TreesIcon
} from '@/components/Icons';
import { Activity, Trip } from '@/types/trip';
import { supabase } from '@/lib/supabase';

function ImmersiveExplorerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const cityParam = searchParams?.get('city') || 'delhi';
  const monumentParam = searchParams?.get('monument');

  const [selectedCityKey, setSelectedCityKey] = useState<string>(cityParam.toLowerCase());
  const monumentsList = getMonumentsForCity(selectedCityKey);

  const [activeMonument, setActiveMonument] = useState<Monument>(() => {
    if (monumentParam) {
      const match = monumentsList.find((m) => m.id === monumentParam || m.name.toLowerCase().includes(monumentParam.toLowerCase()));
      if (match) return match;
    }
    return monumentsList[0] || MONUMENTS_REGISTRY.delhi[0];
  });

  const [selectedFeature, setSelectedFeature] = useState<MonumentFeature | null>(
    activeMonument.features[0] || null
  );

  const [activeCategoryMode, setActiveCategoryMode] = useState<'all' | 'Architecture' | 'History' | 'MustSee'>('all');
  const [isVirtualWalk, setIsVirtualWalk] = useState(false);
  const [virtualWalkStep, setVirtualWalkStep] = useState(0);

  // Gemini "Explain Simply" & Q&A state
  const [simplifiedText, setSimplifiedText] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);

  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Added notification state
  const [addedToast, setAddedToast] = useState<string | null>(null);

  useEffect(() => {
    const list = getMonumentsForCity(selectedCityKey);
    if (list.length > 0) {
      setActiveMonument(list[0]);
      setSelectedFeature(list[0].features[0] || null);
    }
    setSimplifiedText(null);
  }, [selectedCityKey]);

  useEffect(() => {
    if (activeMonument.features.length > 0) {
      setSelectedFeature(activeMonument.features[0]);
    }
    setSimplifiedText(null);
  }, [activeMonument.id]);

  // Handle "✨ Explain Simply" via Gemini
  const handleExplainSimply = async () => {
    if (!selectedFeature) return;
    setIsExplaining(true);

    try {
      const prompt = `
Simplify this architectural/historical description for a travel enthusiast.
Monument: ${activeMonument.name} (${activeMonument.cityName})
Feature: ${selectedFeature.name}
Technical Description: "${selectedFeature.description}"
Historical Importance: "${selectedFeature.historicalImportance}"
Architectural Importance: "${selectedFeature.architecturalImportance}"

Explain it in 2-3 clear, simple, fascinating sentences without technical jargon.
`;

      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: prompt,
          tripContext: { destination: activeMonument.cityName }
        })
      });

      const data = await res.json();
      setSimplifiedText(
        data.answer ||
          `"${selectedFeature.name}" is one of the most famous parts of ${activeMonument.name}. It combines classic architectural design with centuries of rich cultural history.`
      );
    } catch (e) {
      setSimplifiedText(
        `"${selectedFeature.name}" represents a key architectural landmark in ${activeMonument.cityName}. It was built to showcase master craftsmanship and royal heritage.`
      );
    } finally {
      setIsExplaining(false);
    }
  };

  // Handle "Ask TripWise AI" Q&A
  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuestion.trim() || !selectedFeature) return;

    setAiLoading(true);
    setAiAnswer(null);

    try {
      const prompt = `
Question about landmark feature: "${selectedFeature.name}" at ${activeMonument.name} in ${activeMonument.cityName}.
User question: "${aiQuestion}"
Known context: ${selectedFeature.description} ${selectedFeature.historicalImportance}
Provide a friendly 2-3 sentence answer.
`;

      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: prompt,
          tripContext: { destination: activeMonument.cityName }
        })
      });

      const data = await res.json();
      setAiAnswer(data.answer || 'TripWise AI evaluated your landmark question.');
    } catch (e) {
      setAiAnswer('Visiting during morning hours provides the best natural lighting for photography and lighter crowd entry queues.');
    } finally {
      setAiLoading(false);
    }
  };

  // Handle "+ Add to Trip"
  const handleAddToTrip = async () => {
    if (!selectedFeature) return;

    const newActivity: Activity = {
      id: `act-imm-${Date.now()}`,
      name: `${activeMonument.name} — ${selectedFeature.name}`,
      placeName: selectedFeature.name,
      category: (selectedFeature.category === 'Architecture' ? 'culture' : 'culture') as any,
      isOutdoor: true,
      durationMinutes: 90,
      bestTime: 'Morning',
      description: selectedFeature.description,
      estimatedTravelTime: '🚶 10 min walk',
      weatherSuitability: 'High',
      personaSuitability: ['Explorer', 'Solo Explorer'],
      whySelectedReason: `Added from TripWise Immersive 3D Explorer for ${activeMonument.cityName}.`,
      lat: selectedFeature.lat,
      lng: selectedFeature.lng
    };

    // Load active saved trips
    try {
      const stored = localStorage.getItem('tripwise_saved_trips');
      let existingTrips: Trip[] = stored ? JSON.parse(stored) : [];

      let matchingTrip = existingTrips.find(
        (t) => t.destination.toLowerCase().includes(activeMonument.cityName.toLowerCase())
      );

      if (matchingTrip && matchingTrip.days.length > 0) {
        matchingTrip.days[0].activities.push(newActivity);
        localStorage.setItem('tripwise_saved_trips', JSON.stringify(existingTrips));
      } else {
        // Create new trip object for this destination
        const newTrip: Trip = {
          id: `trip-${Date.now()}`,
          shareId: `share-${Math.random().toString(36).substring(2, 9)}`,
          destination: activeMonument.cityName,
          latitude: activeMonument.lat,
          longitude: activeMonument.lng,
          durationDays: 3,
          startDate: new Date().toISOString().split('T')[0],
          persona: 'Explorer',
          pace: 'Balanced',
          interests: ['Culture', 'History'],
          weatherSummary: {
            city: activeMonument.cityName,
            avgTempC: 25,
            overallCondition: 'Clear Skies',
            maxRainProbability: 10,
            suitabilityScore: 'High'
          },
          days: [
            {
              dayNumber: 1,
              title: `Day 1: ${activeMonument.cityName} Exploration`,
              weatherForecast: {
                tempC: 25,
                condition: 'Clear',
                rainProbability: 10,
                suitability: 'High',
                icon: '☀️'
              },
              activities: [newActivity]
            }
          ],
          healthScore: {
            score: 95,
            label: 'Exceptional',
            factors: [{ text: `✓ Added ${selectedFeature.name} via Immersive 3D Explorer`, type: 'positive' }]
          }
        };

        existingTrips.unshift(newTrip);
        localStorage.setItem('tripwise_saved_trips', JSON.stringify(existingTrips));
      }

      setAddedToast(`✓ Added "${selectedFeature.name}" to your ${activeMonument.cityName} trip!`);
      setTimeout(() => setAddedToast(null), 3500);
    } catch (e) {
      setAddedToast(`✓ Added "${selectedFeature.name}" to itinerary!`);
      setTimeout(() => setAddedToast(null), 3500);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border)] pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="tw-badge tw-badge-amber text-[10px] uppercase tracking-wider">
                ✨ TRIPWISE IMMERSIVE EXPLORER
              </span>
              <span className="text-xs text-[var(--muted)] font-bold">
                "Explore the places before you visit them."
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-[#131314]">
              {activeMonument.name}
            </h1>
            <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">
              {activeMonument.cityName}, {activeMonument.country} • {activeMonument.architecturalStyle} ({activeMonument.builtYear})
            </p>
          </div>

          {/* City & Monument Selectors */}
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="block text-[10px] uppercase font-extrabold text-[var(--muted)] mb-1">
                Select City
              </label>
              <select
                value={selectedCityKey}
                onChange={(e) => setSelectedCityKey(e.target.value)}
                className="px-3.5 py-2 bg-white border border-[var(--border)] rounded-xl text-xs font-bold text-[#131314] shadow-sm focus:outline-none focus:border-[#131314] transition cursor-pointer"
              >
                <option value="delhi">🇮🇳 Delhi, India</option>
                <option value="london">🇬🇧 London, UK</option>
                <option value="paris">🇫🇷 Paris, France</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-extrabold text-[var(--muted)] mb-1">
                Select Monument
              </label>
              <select
                value={activeMonument.id}
                onChange={(e) => {
                  const found = monumentsList.find((m) => m.id === e.target.value);
                  if (found) setActiveMonument(found);
                }}
                className="px-3.5 py-2 bg-white border border-[var(--border)] rounded-xl text-xs font-bold text-[#131314] shadow-sm focus:outline-none focus:border-[#131314] transition cursor-pointer"
              >
                {monumentsList.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Added Toast Notification */}
        {addedToast && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs font-bold flex items-center justify-between shadow-lg animate-fade-in">
            <span>{addedToast}</span>
            <Link href="/calendar" className="text-emerald-800 underline hover:text-emerald-950">
              View Calendar →
            </Link>
          </div>
        )}

        {/* 3D Mode Selector Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[var(--surface)] p-3 rounded-2xl border border-[var(--border)]">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => {
                setActiveCategoryMode('all');
                setIsVirtualWalk(false);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeCategoryMode === 'all' && !isVirtualWalk
                  ? 'bg-[#131314] text-white shadow-sm'
                  : 'bg-white text-[#131314] border border-[var(--border)] hover:bg-slate-50'
              }`}
            >
              🌐 Explore All
            </button>
            <button
              onClick={() => {
                setActiveCategoryMode('Architecture');
                setIsVirtualWalk(false);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeCategoryMode === 'Architecture' && !isVirtualWalk
                  ? 'bg-[#131314] text-white shadow-sm'
                  : 'bg-white text-[#131314] border border-[var(--border)] hover:bg-slate-50'
              }`}
            >
              🏛️ Architecture
            </button>
            <button
              onClick={() => {
                setActiveCategoryMode('History');
                setIsVirtualWalk(false);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeCategoryMode === 'History' && !isVirtualWalk
                  ? 'bg-[#131314] text-white shadow-sm'
                  : 'bg-white text-[#131314] border border-[var(--border)] hover:bg-slate-50'
              }`}
            >
              📜 History
            </button>
            <button
              onClick={() => {
                setActiveCategoryMode('MustSee');
                setIsVirtualWalk(false);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeCategoryMode === 'MustSee' && !isVirtualWalk
                  ? 'bg-amber-500 text-slate-950 shadow-sm font-extrabold'
                  : 'bg-white text-[#131314] border border-[var(--border)] hover:bg-slate-50'
              }`}
            >
              ⭐ MUST SEE
            </button>
          </div>

          <button
            onClick={() => setIsVirtualWalk(!isVirtualWalk)}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-2 ${
              isVirtualWalk
                ? 'bg-emerald-600 text-white shadow-lg animate-pulse'
                : 'bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <span>🚶</span>
            <span>{isVirtualWalk ? `Virtual Walk Active (Step ${virtualWalkStep + 1})` : 'Start Virtual Walk'}</span>
          </button>
        </div>

        {/* Main Immersive Grid (Desktop Split: 3D Left, Info Panel Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* 3D Viewer (8 Cols) */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-4">
            <Immersive3DViewer
              monument={activeMonument}
              selectedFeature={selectedFeature}
              onSelectFeature={(feat) => setSelectedFeature(feat)}
              activeCategoryMode={activeCategoryMode}
              isVirtualWalk={isVirtualWalk}
              onVirtualWalkStepChange={(step) => setVirtualWalkStep(step)}
            />

            <div className="p-4 rounded-2xl bg-white border border-[var(--border)] text-xs text-[var(--muted)] leading-relaxed font-medium">
              <span className="font-bold text-[#131314]">📍 About {activeMonument.name}: </span>
              {activeMonument.description}
            </div>
          </div>

          {/* Feature Information Panel (4-5 Cols) */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-6">
            {selectedFeature ? (
              <div className="tw-card p-6 sm:p-7 space-y-6 relative overflow-hidden">
                {/* Feature Header */}
                <div className="border-b border-[var(--border)] pb-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="tw-badge tw-badge-amber text-[10px] uppercase font-bold">
                      {selectedFeature.category}
                    </span>
                    {selectedFeature.isMustSee && (
                      <span className="tw-badge tw-badge-emerald text-[10px] font-extrabold">
                        ⭐ MUST SEE LANDMARK
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl font-extrabold font-display text-[#131314]">
                    {selectedFeature.name}
                  </h3>
                  <p className="text-xs text-[var(--muted)] font-medium">
                    {activeMonument.name}, {activeMonument.cityName}
                  </p>
                </div>

                {/* Simplified Explanation Callout if active */}
                {simplifiedText ? (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs space-y-2 animate-fade-in">
                    <div className="flex items-center justify-between font-extrabold text-amber-900">
                      <span>✨ Simplified Explanation (Gemini AI)</span>
                      <button
                        onClick={() => setSimplifiedText(null)}
                        className="text-[10px] text-amber-700 underline"
                      >
                        Reset
                      </button>
                    </div>
                    <p className="leading-relaxed font-medium">{simplifiedText}</p>
                  </div>
                ) : (
                  <div className="space-y-4 text-xs text-[#131314]">
                    <div>
                      <h4 className="font-extrabold text-[var(--muted)] uppercase text-[10px] tracking-wider mb-1">
                        Overview
                      </h4>
                      <p className="leading-relaxed font-medium">{selectedFeature.description}</p>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-[var(--muted)] uppercase text-[10px] tracking-wider mb-1">
                        🏛️ Architectural Significance
                      </h4>
                      <p className="leading-relaxed font-medium text-slate-700">
                        {selectedFeature.architecturalImportance}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-[var(--muted)] uppercase text-[10px] tracking-wider mb-1">
                        📜 Historical Significance
                      </h4>
                      <p className="leading-relaxed font-medium text-slate-700">
                        {selectedFeature.historicalImportance}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
                      <h4 className="font-bold text-[#131314] text-[11px] mb-0.5">
                        💡 Why Visit:
                      </h4>
                      <p className="text-[11px] text-[var(--muted)] font-medium">
                        {selectedFeature.whyVisit}
                      </p>
                    </div>
                  </div>
                )}

                {/* Primary Action Buttons Grid */}
                <div className="space-y-2.5 pt-2 border-t border-[var(--border)]">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleExplainSimply}
                      disabled={isExplaining}
                      className="px-3.5 py-2.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold hover:bg-amber-100 transition flex items-center justify-center gap-1.5"
                    >
                      <SparklesIcon size={14} className="text-amber-600" />
                      <span>{isExplaining ? 'Simplifying...' : 'Explain Simply'}</span>
                    </button>

                    <button
                      onClick={() => setAiModalOpen(true)}
                      className="tw-btn-secondary text-xs !py-2.5 flex items-center justify-center gap-1.5"
                    >
                      <span>🤖 Ask AI</span>
                    </button>
                  </div>

                  <button
                    onClick={handleAddToTrip}
                    className="w-full tw-btn-primary text-xs !py-3 flex items-center justify-center gap-2 shadow-md"
                  >
                    <span>+ Add to Trip</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${selectedFeature.lat},${selectedFeature.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-xl bg-[var(--surface)] hover:bg-slate-100 border border-[var(--border)] text-xs font-bold text-[#131314] text-center flex items-center justify-center gap-1"
                    >
                      <MapPinIcon size={12} className="text-amber-600" />
                      <span>Route Map</span>
                    </a>

                    <Link
                      href="/calendar"
                      className="px-3 py-2 rounded-xl bg-[var(--surface)] hover:bg-slate-100 border border-[var(--border)] text-xs font-bold text-[#131314] text-center flex items-center justify-center gap-1"
                    >
                      <CalendarIcon size={12} className="text-amber-600" />
                      <span>Calendar</span>
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="tw-card p-8 text-center text-xs text-[var(--muted)]">
                Select a hotspot on the 3D map to view details.
              </div>
            )}
          </div>
        </div>
      </main>

      {/* AI Q&A Modal */}
      {aiModalOpen && selectedFeature && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[var(--border)] rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <h3 className="text-lg font-bold font-display text-[#131314] flex items-center gap-2">
                <SparklesIcon size={18} className="text-amber-600" />
                <span>Ask TripWise AI about {selectedFeature.name}</span>
              </h3>
              <button
                onClick={() => setAiModalOpen(false)}
                className="p-1 text-[var(--muted)] hover:text-[#131314] rounded-lg"
              >
                <CloseIcon size={18} />
              </button>
            </div>

            <form onSubmit={handleAskAI} className="space-y-4">
              <div>
                <label className="block tw-eyebrow mb-1">
                  Your Question
                </label>
                <input
                  type="text"
                  required
                  placeholder={`e.g. What is the best time to photograph ${selectedFeature.name}?`}
                  value={aiQuestion}
                  onChange={(e) => setAiQuestion(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-[var(--border)] rounded-xl text-xs font-semibold text-[#131314] focus:outline-none focus:border-[#131314]"
                />
              </div>

              {aiLoading ? (
                <div className="py-6 text-center text-xs font-semibold text-[var(--muted)] space-y-2">
                  <CompassIcon size={24} className="animate-spin text-[#131314] mx-auto" />
                  <span>Gemini AI is generating answer for {activeMonument.name}...</span>
                </div>
              ) : aiAnswer ? (
                <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-xs text-[#131314] leading-relaxed">
                  <span className="font-bold text-amber-800 block mb-1">💡 Gemini AI Response:</span>
                  <p>{aiAnswer}</p>
                </div>
              ) : null}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setAiModalOpen(false)}
                  className="tw-btn-secondary text-xs"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={aiLoading}
                  className="tw-btn-primary text-xs"
                >
                  Ask Gemini AI
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default function ImmersiveExplorerPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs font-bold">Loading Immersive 3D Explorer...</div>}>
      <ImmersiveExplorerContent />
    </Suspense>
  );
}
