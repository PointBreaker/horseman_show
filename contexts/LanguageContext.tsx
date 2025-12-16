import React, { createContext, useContext, useState, ReactNode } from 'react';
import { translations, Translations } from '../i18n/translations';

type Language = 'en' | 'zh';

interface LanguageContextType {
  language: Language;
  t: Translations;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const value = {
    language,
    t: translations[language],
    setLanguage
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};