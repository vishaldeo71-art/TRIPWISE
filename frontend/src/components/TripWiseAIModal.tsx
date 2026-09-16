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

export default function TripWiseAIModal({ trip, isOpen, onClose }: TripWiseAIModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'ai',
      text: `Hello! I'm TripWise AI. Ask me anything about your itinerary in ${trip.destination}!`,
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const quickPrompts = [
    'Why did you choose this activity?',
    'What should I do on Day 1?',
    'Make my trip more relaxed.',
    'What can I do if it rains?',
    'Give me food recommendations.',
    'Suggest cultural activities.',
  ];

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
        setMessages((prev) => [
          ...prev,
          { sender: 'ai', text: data.answer || 'I have analyzed your itinerary request!' },
        ]);
      } else {
        throw new Error('API request failed');
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `TripWise AI is currently running in offline mode for ${trip.destination}. All itinerary activities, weather advice, and metro stations remain available!`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-[#080B10]/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg overflow-hidden bg-white dark:bg-[#0F141E] rounded-3xl border border-stone-200 dark:border-[#1E2638] shadow-2xl flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-white/[0.06] bg-stone-50 dark:bg-slate-900/80">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-400/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <SparklesIcon size={18} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                TripWise AI
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-800 dark:text-amber-300 border border-amber-500/20">
                  Assistant
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Contextual guide for {trip.destination}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-stone-200 dark:hover:bg-slate-800/80 transition-colors"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        {/* Chat Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[50vh]">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 ${
                msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 ${
                  msg.sender === 'user'
                    ? 'bg-amber-400 text-slate-950 font-bold'
                    : 'bg-stone-100 dark:bg-slate-900 text-amber-600 dark:text-amber-400 border border-stone-200 dark:border-slate-800'
                }`}
              >
                {msg.sender === 'user' ? <UserIcon size={14} /> : <BotIcon size={14} />}
              </div>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed font-medium ${
                  msg.sender === 'user'
                    ? 'bg-amber-400/20 text-slate-900 dark:text-amber-100 border border-amber-500/30 rounded-tr-none'
                    : 'bg-stone-100 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 border border-stone-200 dark:border-slate-800/80 rounded-tl-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 font-semibold animate-pulse">
              <SparklesIcon size={14} className="animate-spin" />
              TripWise AI is analyzing...
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        <div className="px-6 py-2.5 border-t border-stone-200 dark:border-white/[0.06] bg-stone-50 dark:bg-slate-950/60">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 font-bold">Quick suggestions:</p>
          <div className="flex flex-wrap gap-1.5">
            {quickPrompts.slice(0, 4).map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                className="text-xs px-2.5 py-1 rounded-full bg-stone-200 dark:bg-slate-900 hover:bg-amber-400/20 text-slate-700 dark:text-slate-300 hover:text-amber-800 dark:hover:text-amber-200 border border-stone-300 dark:border-slate-800 transition-colors font-medium"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-stone-200 dark:border-white/[0.06] bg-white dark:bg-slate-900/90">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask anything about your trip..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-stone-100 dark:bg-slate-950 border border-stone-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-400/60"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || loading}
              className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-slate-950 font-extrabold text-xs shadow-md transition-all active:scale-95"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
