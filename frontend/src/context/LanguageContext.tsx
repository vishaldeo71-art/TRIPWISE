'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language =
  | 'en' | 'hi' | 'es' | 'fr' | 'de' | 'ja' | 'zh-CN' | 'ar'
  | 'pt' | 'ru' | 'ko' | 'it' | 'nl' | 'tr' | 'sv' | 'pl'
  | 'el' | 'vi' | 'th' | 'id' | 'bn' | 'pa' | 'gu' | 'mr'
  | 'ta' | 'te';

export interface LanguageOption {
  code: Language;
  name: string;
  flag: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'हिंदी (Hindi)', flag: '🇮🇳' },
  { code: 'es', name: 'Español (Spanish)', flag: '🇪🇸' },
  { code: 'fr', name: 'Français (French)', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch (German)', flag: '🇩🇪' },
  { code: 'ja', name: '日本語 (Japanese)', flag: '🇯🇵' },
  { code: 'zh-CN', name: '中文 (Chinese)', flag: '🇨🇳' },
  { code: 'ar', name: 'العربية (Arabic)', flag: '🇸🇦' },
  { code: 'pt', name: 'Português (Portuguese)', flag: '🇵🇹' },
  { code: 'ru', name: 'Русский (Russian)', flag: '🇷🇺' },
  { code: 'ko', name: '한국어 (Korean)', flag: '🇰🇷' },
  { code: 'it', name: 'Italiano (Italian)', flag: '🇮🇹' },
  { code: 'nl', name: 'Nederlands (Dutch)', flag: '🇳🇱' },
  { code: 'tr', name: 'Türkçe (Turkish)', flag: '🇹🇷' },
  { code: 'sv', name: 'Svenska (Swedish)', flag: '🇸🇪' },
  { code: 'pl', name: 'Polski (Polish)', flag: '🇵🇱' },
  { code: 'el', name: 'Ελληνικά (Greek)', flag: '🇬🇷' },
  { code: 'vi', name: 'Tiếng Việt (Vietnamese)', flag: '🇻🇳' },
  { code: 'th', name: 'ไทย (Thai)', flag: '🇹🇭' },
  { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'bn', name: 'বাংলা (Bengali)', flag: '🇧🇩' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ (Punjabi)', flag: '🇮🇳' },
  { code: 'gu', name: 'ગુજરાતી (Gujarati)', flag: '🇮🇳' },
  { code: 'mr', name: 'मराठी (Marathi)', flag: '🇮🇳' },
  { code: 'ta', name: 'தமிழ் (Tamil)', flag: '🇮🇳' },
  { code: 'te', name: 'తెలుగు (Telugu)', flag: '🇮🇳' },
];

const TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    planTrip: 'Plan Trip',
    inspiration: 'Inspiration',
    travelVault: 'Travel Vault',
    myTrips: 'My Trips',
    admin: 'Admin',
    logIn: 'Log In',
    signUp: 'Sign Up',
    startPlanning: 'Start Planning →',
    howItWorks: 'How It Works',
    features: 'Features',
    tagline: 'Travel planning that adapts to the real world.',
    createItinerary: 'Create Adaptive Itinerary',
    askAI: 'Ask TripWise AI',
    shareTrip: 'Share Trip',
    feedbackTitle: 'How was your trip itinerary experience?',
    feedbackPrompt: 'We would love to know how we can improve! What could be better?',
    submitFeedback: 'Submit Feedback',
    thankYouFeedback: 'Thank you for your feedback! Happy travels!'
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  currentLanguageOption: LanguageOption;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('tripwise_language') as Language;
      if (saved && LANGUAGES.some(l => l.code === saved)) {
        setLanguageState(saved);
        applyTranslateCookie(saved);
      }
    } catch (e) {}
  }, []);

  const applyTranslateCookie = (langCode: string) => {
    if (typeof window === 'undefined') return;
    try {
      const hostname = window.location.hostname;
      if (langCode === 'en') {
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${hostname};`;
      } else {
        const val = `/en/${langCode}`;
        document.cookie = `googtrans=${val}; path=/;`;
        document.cookie = `googtrans=${val}; path=/; domain=${hostname};`;
      }
    } catch (e) {}
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('tripwise_language', lang);
      applyTranslateCookie(lang);

      // Programmatically trigger Google Translate element if initialized
      const googleSelect = document.querySelector('.goog-te-combo') as HTMLSelectElement;
      if (googleSelect) {
        googleSelect.value = lang;
        googleSelect.dispatchEvent(new Event('change'));
      } else {
        window.location.reload();
      }
    } catch (e) {}
  };

  const t = (key: string): string => {
    return TRANSLATIONS.en[key] || key;
  };

  const currentLanguageOption = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, currentLanguageOption }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      language: 'en' as Language,
      setLanguage: () => {},
      t: (key: string) => key,
      currentLanguageOption: LANGUAGES[0]
    };
  }
  return context;
}
