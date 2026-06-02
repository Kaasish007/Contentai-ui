import React, { createContext, useContext, useState, useEffect } from 'react';
import translations from '../translations';

const LanguageContext = createContext({
  language: 'en',
  changeLanguage: () => {},
  l: translations['en']
});

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('creaze-language') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('creaze-language', language);
  }, [language]);

  const l = translations[language] || translations['en'];

  const changeLanguage = (lang) => {
    setLanguage(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, l }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    return { language: 'en', changeLanguage: () => {}, l: translations['en'] };
  }
  return context;
}