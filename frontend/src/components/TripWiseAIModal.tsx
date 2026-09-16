'use client';

import { useState } from 'react';
import { Trip } from '@/types/trip';
import { SparklesIcon, BotIcon, UserIcon, CloseIcon } from '@/components/Icons';

interface TripWiseAIModalProps {
  trip: Trip;
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

const QUICK_PROMPTS = [
  'What should I do on Day 1?',
  'What if it rains?',
  'Food recommendations?',
  'Best photo spots?',
];

export default function TripWiseAIModal({ trip, isOpen, onClose }: TripWiseAIModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: 'ai', text: `Hi! I'm TripWise AI. Ask me anything about your itinerary in ${trip.destination} — activities, weather, food, metro routes, and more.` },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || loading) return;

    const newMessages: ChatMessage[] = [...messages, { sender: 'user', text: query }];
    setMessages(newMessages);
    setInputQuery('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: query,
          tripContext: {
            destination: trip.destination,
            durationDays: trip.durationDays,
            persona: trip.persona,
            pace: trip.pace,
            weatherSummary: trip.weatherSummary,
            itinerary: trip.days?.map((d) => ({
              dayNumber: d.dayNumber,
              activities: d.activities?.map((a) => ({
                name: a.name,
                placeName: a.placeName,
                metro: a.nearestMetro?.stationName,
                why: a.whySelectedReason,
              })),
            })),
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [...prev, { sender: 'ai', text: data.answer || "Here's what I found for your itinerary!" }]);
      } else {
        throw new Error('API request failed');
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `TripWise AI is running in offline mode for ${trip.destination}. All itinerary activities, weather advice, and metro info remain available in your plan!`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 tw-modal-overlay animate-fade-in-up">
      <div className="relative w-full max-w-lg overflow-hidden tw-card flex flex-col max-h-[88vh]" style={{ borderRadius: '1.5rem' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b tw-divider bg-stone-50 dark:bg-white/[0.03]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-400/10 text-amber-500 border border-amber-500/20">
              <SparklesIcon size={17} />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                TripWise AI
                <span className="tw-badge tw-badge-amber">Assistant</span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Contextual guide for {trip.destination}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="tw-btn-ghost p-1.5 rounded-xl border text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
            aria-label="Close AI modal"
          >
            <CloseIcon size={16} />
          </button>
        </div>

        {/* Chat Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                msg.sender === 'user'
                  ? 'bg-amber-400 text-slate-950'
                  : 'bg-stone-100 dark:bg-white/[0.07] text-amber-500 border border-stone-200 dark:border-white/[0.1]'
              }`}>
                {msg.sender === 'user' ? <UserIcon size={13} /> : <BotIcon size={13} />}
              </div>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed font-medium ${
                msg.sender === 'user'
                  ? 'bg-amber-400/15 text-slate-900 dark:text-amber-100 border border-amber-500/25 rounded-tr-sm'
                  : 'bg-stone-100 dark:bg-white/[0.06] text-slate-800 dark:text-slate-200 border border-stone-200 dark:border-white/[0.08] rounded-tl-sm'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 font-semibold">
              <SparklesIcon size={13} className="animate-spin-smooth" />
              TripWise AI is thinking…
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        <div className="px-5 py-3 border-t tw-divider bg-stone-50 dark:bg-white/[0.02]">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 font-bold">Suggestions</p>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                className="text-[11px] px-2.5 py-1 rounded-full bg-stone-200 dark:bg-white/[0.07] hover:bg-amber-400/15 text-slate-700 dark:text-slate-300 hover:text-amber-800 dark:hover:text-amber-200 border border-stone-300 dark:border-white/[0.1] transition font-medium"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t tw-divider bg-white dark:bg-white/[0.03]">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask anything about your trip…"
              className="tw-input flex-1 px-4 py-2.5 rounded-xl text-xs placeholder-slate-400"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || loading}
              className="tw-btn-primary px-4 py-2.5 rounded-xl text-xs disabled:opacity-40 disabled:hover:transform-none"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
