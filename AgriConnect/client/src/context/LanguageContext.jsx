import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, SUPPORTED_LANGUAGES } from '../i18n/translations';

const LanguageContext = createContext();

function getInitialLanguage() {
  if (typeof window !== 'undefined') {
    try {
      const savedLanguage = window.localStorage.getItem('agriconnect_lang');
      if (savedLanguage && translations[savedLanguage]) return savedLanguage;
    } catch (error) {
      console.warn('Could not read the saved language preference:', error);
    }
  }

  const browserLanguage = typeof navigator !== 'undefined' ? navigator.language?.split('-')[0] : null;
  return translations[browserLanguage] ? browserLanguage : 'en';
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(getInitialLanguage);

  const setLanguage = (langCode) => {
    if (translations[langCode]) {
      setLanguageState(langCode);
      try {
        window.localStorage.setItem('agriconnect_lang', langCode);
      } catch (error) {
        console.warn('Could not save the language preference:', error);
      }
    }
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = SUPPORTED_LANGUAGES.find((item) => item.code === language)?.speechCode || language;
    }
  }, [language]);

  const t = (key, defaultText = '', values = {}) => {
    const langDict = translations[language] || translations.en;
    let translatedText;
    if (langDict && langDict[key] !== undefined) {
      translatedText = langDict[key];
    } else if (translations.en && translations.en[key] !== undefined) {
      translatedText = translations.en[key];
    } else {
      translatedText = defaultText || key;
    }

    return Object.entries(values).reduce(
      (text, [name, value]) => text.replaceAll(`{{${name}}}`, String(value ?? '')),
      translatedText
    );
  };

  const currentLanguageObj =
    SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        supportedLanguages: SUPPORTED_LANGUAGES,
        currentLanguageObj
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    // Graceful fallback if used outside provider
    return {
      language: 'en',
      setLanguage: () => {},
      t: (key, def = '') => def || key,
      supportedLanguages: SUPPORTED_LANGUAGES,
      currentLanguageObj: SUPPORTED_LANGUAGES[0]
    };
  }
  return context;
}

export default LanguageContext;
