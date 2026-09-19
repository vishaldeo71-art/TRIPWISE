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
  } | null>(null);

  if (!isOpen) return null;

  const emojis = [
    { rating: 1, symbol: '😡', label: 'Angry' },
    { rating: 2, symbol: '🙁', label: 'Sad' },
    { rating: 3, symbol: '😐', label: 'Neutral' },
    { rating: 4, symbol: '🙂', label: 'Happy' },
    { rating: 5, symbol: '😁', label: 'Very Happy' },
  ];

  const handleRatingClick = async (rating: number) => {
    setSelectedRating(rating);

    // If rating is 5 (Very Happy), submit immediately!
    if (rating === 5) {
      setSubmitting(true);
      await sendFeedback(5, 'Rated 5/5 Very Happy');
      setSubmitting(false);
      setSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 2500);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRating) return;

    setSubmitting(true);
    setAiAnalysis(null);

    const feedbackText = commentText.trim() || 'No specific comment';
    await sendFeedback(selectedRating, feedbackText);

    // Call Gemini AI Feedback Processing Route
    try {
      const res = await fetch('/api/feedback/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trip,
          rating: selectedRating,
          feedbackText
        })
      });

      if (res.ok) {
        const data = await res.json();
        setAiAnalysis({
          isFeasible: data.isFeasible,
          explanation: data.explanation
        });

        // If feasible and updated days returned, update trip state!
        if (data.isFeasible && data.updatedDays && trip && onTripUpdated) {
          const updatedTrip: Trip = {
            ...trip,
            days: data.updatedDays
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
    }

    setSubmitting(false);
    setSubmitted(true);
  };

  const sendFeedback = async (rating: number, comment: string) => {
    const feedbackRecord = {
      id: `fb-${Date.now()}`,
      tripId,
      destination,
      rating,
      comment,
      createdAt: new Date().toISOString()
    };

    // Save locally
    try {
      const stored = localStorage.getItem('tripwise_user_feedback');
      let existing = stored ? JSON.parse(stored) : [];
      existing.unshift(feedbackRecord);
      localStorage.setItem('tripwise_user_feedback', JSON.stringify(existing));
    } catch (e) {}

    // Save to Express Backend
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
          className="absolute top-4 right-4 text-[var(--muted)] hover:text-[#131314] p-1 rounded-lg hover:bg-[var(--surface)]"
        >
          <CloseIcon size={16} />
        </button>

        {submitted ? (
          <div className="py-4 text-center space-y-3 animate-fade-in">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto font-bold ${
              aiAnalysis?.isFeasible === false ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {aiAnalysis?.isFeasible === false ? <AlertIcon size={24} /> : <CheckIcon size={24} />}
            </div>

            <div className="space-y-1">
              <h4 className="font-extrabold text-sm text-[#131314] font-display">
                {aiAnalysis?.isFeasible === false ? 'Feedback Evaluated — Not Feasible' : t('thankYouFeedback')}
              </h4>
              {aiAnalysis?.explanation && (
                <p className="text-xs text-[var(--muted)] leading-relaxed p-3 bg-[var(--surface)] rounded-xl border border-[var(--border)] text-left font-medium">
                  {aiAnalysis.explanation}
                </p>
              )}
            </div>

            <button
              onClick={onClose}
              className="tw-btn-primary text-xs w-full !py-2"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-1 pr-6">
              <span className="tw-badge tw-badge-amber">
                <SparklesIcon size={12} className="text-amber-600" /> Gemini AI Trip Evaluator
              </span>
              <h4 className="font-extrabold text-sm text-[#131314] font-display">
                {t('feedbackTitle')}
              </h4>
            </div>

            {submitting ? (
              <div className="py-6 text-center space-y-3">
                <CompassIcon size={28} className="animate-spin text-amber-600 mx-auto" />
                <div className="space-y-1">
                  <h5 className="font-extrabold text-xs text-[#131314] font-display">Processing Feedback with Gemini AI...</h5>
                  <p className="text-[11px] text-[var(--muted)]">Evaluating feasibility and generating adaptive plan updates.</p>
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
                          ? 'bg-[#131314] text-white border-[#131314] scale-110 shadow-md'
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

                {/* ASK FOR DETAILED FEEDBACK IF RATING IS OTHER THAN 5 */}
                {selectedRating !== null && selectedRating !== 5 && (
                  <form onSubmit={handleCommentSubmit} className="space-y-3 pt-2 animate-fade-in">
                    <label className="block text-xs font-bold text-[#131314]">
                      {t('feedbackPrompt')}
                    </label>

                    <textarea
                      required
                      rows={3}
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="e.g. Too exhausting, add more relaxed cafes OR include historical monuments..."
                      className="w-full p-3 bg-white border border-[var(--border)] rounded-xl text-xs text-[#131314] placeholder:text-[var(--muted)] focus:outline-none focus:border-[#131314]"
                    />

                    <button
                      type="submit"
                      disabled={submitting}
                      className="tw-btn-primary w-full text-xs !py-2.5"
                    >
                      <SparklesIcon size={14} className="text-amber-400" />
                      <span>Process & Adapt Plan with AI</span>
                    </button>
                  </form>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
