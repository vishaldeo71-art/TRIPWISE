'use client';

import { useState } from 'react';
import { Trip } from '@/types/trip';
import { Sparkles, Send, X, Bot, User, Loader2 } from 'lucide-react';

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
      text: `Hello! I'm TripWise AI. Ask me anything about your trip to ${trip.destination}!`,
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

    // Add user message
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
      // Friendly fallback message
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `TripWise AI is currently running in offline assistant mode for ${trip.destination}. Check back soon for expanded suggestions!`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg overflow-hidden glass-panel rounded-2xl border border-sky-500/20 shadow-2xl flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/20">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                TripWise AI
                <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 font-normal">
                  Assistant
                </span>
              </h3>
              <p className="text-xs text-slate-400">Contextual guide for {trip.destination}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
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
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs shrink-0 ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-tl-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-xs text-sky-400 animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin" />
              TripWise AI is thinking...
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        <div className="px-6 py-2 border-t border-slate-800/60 bg-slate-950/40">
          <p className="text-[11px] text-slate-400 mb-2 font-medium">Quick suggestions:</p>
          <div className="flex flex-wrap gap-1.5">
            {quickPrompts.slice(0, 4).map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                className="text-xs px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-sky-500/20 text-slate-300 hover:text-sky-300 border border-slate-700/60 hover:border-sky-500/40 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80">
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
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500/50"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || loading}
              className="p-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white font-medium shadow-md transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
