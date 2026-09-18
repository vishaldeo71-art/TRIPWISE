'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'hi' | 'es' | 'fr' | 'de' | 'ja';

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
];

const TRANSLATIONS: Record<Language, Record<string, string>> = {
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
  },
  hi: {
    planTrip: 'यात्रा की योजना बनाएं',
    inspiration: 'प्रेरणा (Inspiration)',
    travelVault: 'रसीद वॉल्ट (Vault)',
    myTrips: 'मेरी यात्राएं',
    admin: 'एडमिन',
    logIn: 'लॉग इन',
    signUp: 'साइन अप',
    startPlanning: 'शुरू करें →',
    howItWorks: 'यह कैसे काम करता है',
    features: 'विशेषताएं',
    tagline: 'यात्रा योजना जो वास्तविक दुनिया के अनुकूल होती है।',
    createItinerary: 'अनुकूलनीय यात्रा कार्यक्रम बनाएं',
    askAI: 'TripWise AI से पूछें',
    shareTrip: 'शेयर करें',
    feedbackTitle: 'आपका यात्रा अनुभव कैसा रहा?',
    feedbackPrompt: 'हम जानना चाहते हैं कि हम कैसे सुधार कर सकते हैं! क्या बेहतर हो सकता है?',
    submitFeedback: 'प्रतिक्रिया भेजें',
    thankYouFeedback: 'आपकी प्रतिक्रिया के लिए धन्यवाद! आपकी यात्रा मंगलमय हो!'
  },
  es: {
    planTrip: 'Planificar Viaje',
    inspiration: 'Inspiración',
    travelVault: 'Bóveda de Recibos',
    myTrips: 'Mis Viajes',
    admin: 'Administración',
    logIn: 'Iniciar Sesión',
    signUp: 'Registrarse',
    startPlanning: 'Comenzar →',
    howItWorks: 'Cómo Funciona',
    features: 'Características',
    tagline: 'Planificación de viajes que se adapta al mundo real.',
    createItinerary: 'Crear Itinerario Adaptativo',
    askAI: 'Preguntar a TripWise AI',
    shareTrip: 'Compartir Viaje',
    feedbackTitle: '¿Cómo fue tu experiencia con el itinerario?',
    feedbackPrompt: '¡Nos encantaría saber cómo mejorar! ¿Qué podría ser mejor?',
    submitFeedback: 'Enviar Comentarios',
    thankYouFeedback: '¡Gracias por tus comentarios! ¡Buen viaje!'
  },
  fr: {
    planTrip: 'Planifier Voyage',
    inspiration: 'Inspiration',
    travelVault: 'Coffre Recettes',
    myTrips: 'Mes Voyages',
    admin: 'Admin',
    logIn: 'Connexion',
    signUp: 'Inscription',
    startPlanning: 'Commencer →',
    howItWorks: 'Comment ça marche',
    features: 'Fonctionnalités',
    tagline: 'Planification de voyage qui s’adapte au monde réel.',
    createItinerary: 'Créer un Itinéraire Adaptatif',
    askAI: 'Demander à TripWise AI',
    shareTrip: 'Partager',
    feedbackTitle: 'Comment s’est passée votre expérience d’itinéraire ?',
    feedbackPrompt: 'Nous aimerions savoir comment nous améliorer ! Qu’est-ce qui pourrait être mieux ?',
    submitFeedback: 'Soumettre des commentaires',
    thankYouFeedback: 'Merci pour vos commentaires ! Bon voyage !'
  },
  de: {
    planTrip: 'Reise Planen',
    inspiration: 'Inspiration',
    travelVault: 'Tresor',
    myTrips: 'Meine Reisen',
    admin: 'Admin',
    logIn: 'Anmelden',
    signUp: 'Registrieren',
    startPlanning: 'Jetzt Starten →',
    howItWorks: 'Wie es funktioniert',
    features: 'Funktionen',
    tagline: 'Reiseplanung, die sich an die reale Welt anpasst.',
    createItinerary: 'Adaptiven Reiseplan Erstellen',
    askAI: 'TripWise AI Fragen',
    shareTrip: 'Teilen',
    feedbackTitle: 'Wie war Ihre Reiseplan-Erfahrung?',
    feedbackPrompt: 'Wir würden gerne wissen, wie wir uns verbessern können! Was könnte besser sein?',
    submitFeedback: 'Feedback Senden',
    thankYouFeedback: 'Vielen Dank für Ihr Feedback! Gute Reise!'
  },
  ja: {
    planTrip: '旅行を計画',
    inspiration: 'インスピレーション',
    travelVault: '領収書保管庫',
    myTrips: 'マイ旅行',
    admin: '管理者',
    logIn: 'ログイン',
    signUp: '新規登録',
    startPlanning: '計画を始める →',
    howItWorks: '使いかた',
    features: '特徴',
    tagline: '現実世界に適応するスマートな旅行計画。',
    createItinerary: '適応型旅程を作成',
    askAI: 'TripWise AIに質問',
    shareTrip: '旅行を共有',
    feedbackTitle: '旅程の作成体験はいかがでしたか？',
    feedbackPrompt: '改善点をお聞かせください！どのような点が高まればよいですか？',
    submitFeedback: 'フィードバックを送信',
    thankYouFeedback: 'フィードバックありがとうございます！良い旅を！'
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
      if (saved && TRANSLATIONS[saved]) {
        setLanguageState(saved);
      }
    } catch (e) {}
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('tripwise_language', lang);
    } catch (e) {}
  };

  const t = (key: string): string => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS.en[key] || key;
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
