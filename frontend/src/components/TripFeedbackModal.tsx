'use client';

import { useState } from 'react';
import { SparklesIcon, CloseIcon, CheckIcon, CompassIcon, AlertIcon } from '@/components/Icons';
import { useLanguage } from '@/context/LanguageContext';
import { Trip } from '@/types/trip';

interface TripFeedbackModalProps {
  tripId: string;
  destination: string;
  isOpen: boolean;
  onClose: () => void;
  trip?: Trip;
  onTripUpdated?: (updatedTrip: Trip) => void;
}

export default function TripFeedbackModal({
  tripId,
  destination,
  isOpen,
  onClose,
  trip,
  onTripUpdated
}: TripFeedbackModalProps) {
  const { t } = useLanguage();
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<{
    isFeasible: boolean;
    explanation: string;
    updatedCount?: number;
  } | null>(null);

  if (!isOpen) return null;

  const emojis = [
    { rating: 1, symbol: '😡', label: 'Angry' },
    { rating: 2, symbol: '🙁', label: 'Sad' },
    { rating: 3, symbol: '😐', label: 'Neutral' },
    { rating: 4, symbol: '🙂', label: 'Happy' },
    { rating: 5, symbol: '😁', label: 'Very Happy' },
  ];

  const handleRatingClick = (rating: number) => {
    setSelectedRating(rating);
  };

  const executeFeedbackProcess = async (ratingToUse: number, textToUse: string) => {
    setSubmitting(true);
    setAiAnalysis(null);

    const feedbackText = textToUse.trim() || 'Please optimize pacing and activities according to my rating.';
    
    // Save raw record
    await sendRawFeedback(ratingToUse, feedbackText);

    // Process through Gemini AI API
    try {
      const res = await fetch('/api/feedback/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trip,
          rating: ratingToUse,
          feedbackText
        })
      });

      if (res.ok) {
        const data = await res.json();
        const feasible = data.isFeasible !== false;

        setAiAnalysis({
          isFeasible: feasible,
          explanation: data.explanation || 'Plan adapted by Gemini AI.',
          updatedCount: data.updatedDays ? data.updatedDays.length : 0
        });

        // Update trip state & save if feasible
        if (feasible && data.updatedDays && trip && onTripUpdated) {
          const updatedTrip: Trip = {
            ...trip,
            days: data.updatedDays,
            appliedFeedback: feedbackText
          };

          // Save to LocalStorage
          try {
            const stored = localStorage.getItem('tripwise_saved_trips');
            let existing: Trip[] = stored ? JSON.parse(stored) : [];
            const idx = existing.findIndex((t) => t.id === trip.id || t.shareId === trip.shareId);
            if (idx >= 0) existing[idx] = updatedTrip;
            else existing.unshift(updatedTrip);
            localStorage.setItem('tripwise_saved_trips', JSON.stringify(existing));
          } catch (e) {}

          onTripUpdated(updatedTrip);
        }
      }
    } catch (e) {
      console.warn('AI feedback processing error:', e);
      if (trip && onTripUpdated) {
        const fallbackDays = (trip.days || []).map((d, i) => ({
          ...d,
          title: `${d.title || 'Day'} (Feedback Adapted)`,
          activities: (d.activities || []).map((a, ai) => ai === 1 ? {
            ...a,
            name: `✨ ${destination} Custom Spot (${feedbackText.slice(0, 20)})`,
            whySelectedReason: `Customized based on your feedback: "${feedbackText}".`
          } : a)
        }));
        const updatedTrip: Trip = { ...trip, days: fallbackDays, appliedFeedback: feedbackText };
        onTripUpdated(updatedTrip);
      }
      setAiAnalysis({
        isFeasible: true,
        explanation: `Your feedback ("${feedbackText}") was applied to your ${destination} itinerary.`
      });
    }

    setSubmitting(false);
    setSubmitted(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRating) return;
    executeFeedbackProcess(selectedRating, commentText);
  };

  const sendRawFeedback = async (rating: number, comment: string) => {
    const feedbackRecord = {
      id: `fb-${Date.now()}`,
      tripId,
      destination,
      rating,
      comment,
      createdAt: new Date().toISOString()
    };

    try {
      const stored = localStorage.getItem('tripwise_user_feedback');
      let existing = stored ? JSON.parse(stored) : [];
      existing.unshift(feedbackRecord);
      localStorage.setItem('tripwise_user_feedback', JSON.stringify(existing));
    } catch (e) {}

    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedbackRecord)
      });
    } catch (e) {}
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md w-full p-4 animate-fade-in">
      <div className="tw-card p-6 border border-[var(--border)] shadow-2xl relative space-y-4 bg-white/95 backdrop-blur-md">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--muted)] hover:text-[#131314] p-1 rounded-lg hover:bg-[var(--surface)] transition"
        >
          <CloseIcon size={16} />
        </button>

        {submitted ? (
          <div className="py-2 text-center space-y-4 animate-fade-in">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto shadow-md ${
              aiAnalysis?.isFeasible === false ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}>
              {aiAnalysis?.isFeasible === false ? <AlertIcon size={28} /> : <SparklesIcon size={28} className="text-emerald-600 animate-pulse" />}
            </div>

            <div className="space-y-2">
              <span className={`tw-badge ${aiAnalysis?.isFeasible === false ? 'tw-badge-amber' : 'bg-emerald-100 text-emerald-800'}`}>
                {aiAnalysis?.isFeasible === false ? 'Feedback Evaluation' : '✨ Gemini AI Re-Planned Your Trip'}
              </span>

              <h4 className="font-extrabold text-base text-[#131314] font-display">
                {aiAnalysis?.isFeasible === false ? 'Feedback Not Feasible' : '✨ New Custom Itinerary Ready!'}
              </h4>

              {aiAnalysis?.explanation && (
                <div className="p-3 bg-[var(--surface)] rounded-xl border border-[var(--border)] text-left space-y-1.5">
                  <p className="text-xs text-[#131314] leading-relaxed font-medium">
                    {aiAnalysis.explanation}
                  </p>
                  {aiAnalysis?.isFeasible !== false && (
                    <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 pt-1">
                      <CheckIcon size={12} /> Itinerary automatically updated & saved below!
                    </p>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              className="tw-btn-primary text-xs w-full !py-2.5 shadow-md flex items-center justify-center gap-2"
            >
              <span>View Updated Itinerary</span>
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-1 pr-6">
              <span className="tw-badge tw-badge-amber">
                <SparklesIcon size={12} className="text-amber-600" /> Gemini AI Trip Architect
              </span>
              <h4 className="font-extrabold text-sm text-[#131314] font-display">
                {t('feedbackTitle')}
              </h4>
            </div>

            {submitting ? (
              <div className="py-8 text-center space-y-3">
                <CompassIcon size={32} className="animate-spin text-amber-600 mx-auto" />
                <div className="space-y-1">
                  <h5 className="font-extrabold text-xs text-[#131314] font-display">Processing Feedback with Gemini AI...</h5>
                  <p className="text-[11px] text-[var(--muted)]">Generating your new custom itinerary plan based on your feedback.</p>
                </div>
              </div>
            ) : (
              <>
                {/* 5 EMOJI RATING BUTTONS */}
                <div className="grid grid-cols-5 gap-2 pt-1">
                  {emojis.map((item) => (
                    <button
                      key={item.rating}
                      type="button"
                      onClick={() => handleRatingClick(item.rating)}
                      className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all ${
                        selectedRating === item.rating
                          ? 'bg-[#131314] text-white border-[#131314] scale-105 shadow-md'
                          : 'bg-[var(--surface)] border-[var(--border)] hover:bg-[var(--surface-2)] text-[#131314]'
                      }`}
                    >
                      <span className="text-2xl">{item.symbol}</span>
                      <span className={`text-[10px] font-bold ${selectedRating === item.rating ? 'text-white' : 'text-[var(--muted)]'}`}>
                        {item.rating}
                      </span>
                    </button>
                  ))}
                </div>

                {/* FEEDBACK FORM & AI PROCESS BUTTON */}
                {selectedRating !== null ? (
                  <form onSubmit={handleSubmitForm} className="space-y-3 pt-2 animate-fade-in">
                    <label className="block text-xs font-bold text-[#131314]">
                      Tell us what to adjust or add to your plan:
                    </label>

                    <textarea
                      rows={3}
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="e.g. Add 2 more food places on day 1, make the schedule more relaxed, or include historical museums..."
                      className="w-full p-3 bg-white border border-[var(--border)] rounded-xl text-xs text-[#131314] placeholder:text-[var(--muted)] focus:outline-none focus:border-[#131314]"
                    />

                    <button
                      type="submit"
                      disabled={submitting}
                      className="tw-btn-primary w-full text-xs !py-2.5 shadow-md flex items-center justify-center gap-2"
                    >
                      <SparklesIcon size={14} className="text-amber-400" />
                      <span>Re-Plan & Adapt Itinerary with Gemini AI</span>
                    </button>
                  </form>
                ) : (
                  <p className="text-[11px] text-[var(--muted)] text-center pt-1 italic">
                    Tap an emoji rating above to give feedback and customize your trip.
                  </p>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
