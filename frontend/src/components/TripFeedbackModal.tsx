'use client';

import { useState } from 'react';
import { SparklesIcon, CloseIcon, CheckIcon } from '@/components/Icons';
import { useLanguage } from '@/context/LanguageContext';

interface TripFeedbackModalProps {
  tripId: string;
  destination: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function TripFeedbackModal({
  tripId,
  destination,
  isOpen,
  onClose
}: TripFeedbackModalProps) {
  const { t } = useLanguage();
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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
      }, 2000);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRating) return;

    setSubmitting(true);
    await sendFeedback(selectedRating, commentText.trim() || 'No comment provided');
    setSubmitting(false);
    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 2000);
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
          <div className="py-4 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto font-bold">
              <CheckIcon size={20} />
            </div>
            <h4 className="font-extrabold text-sm text-[#131314] font-display">
              {t('thankYouFeedback')}
            </h4>
          </div>
        ) : (
          <>
            <div className="space-y-1 pr-6">
              <span className="tw-badge tw-badge-amber">
                <SparklesIcon size={12} className="text-amber-600" /> Trip Feedback
              </span>
              <h4 className="font-extrabold text-sm text-[#131314] font-display">
                {t('feedbackTitle')}
              </h4>
            </div>

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
                  placeholder="Tell us what could be improved..."
                  className="w-full p-3 bg-white border border-[var(--border)] rounded-xl text-xs text-[#131314] placeholder:text-[var(--muted)] focus:outline-none focus:border-[#131314]"
                />

                <button
                  type="submit"
                  disabled={submitting}
                  className="tw-btn-primary w-full text-xs !py-2.5"
                >
                  {submitting ? 'Submitting...' : t('submitFeedback')}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
