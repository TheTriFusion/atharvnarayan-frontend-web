import { createContext, useContext, useState, useEffect } from 'react';
import { translations, setLanguage as setI18nLanguage, getLanguage } from '../utils/i18n';

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(getLanguage());

  useEffect(() => {
    const handleLanguageChange = () => {
      setLanguageState(getLanguage());
    };

    window.addEventListener('languagechange', handleLanguageChange);
    return () => window.removeEventListener('languagechange', handleLanguageChange);
  }, []);

  const setLanguage = (lang) => {
    setI18nLanguage(lang);
    setLanguageState(lang);
  };

  const t = (key) => {
    if (!key || typeof key !== 'string') return key || '';
    
    const keys = key.split('.');
    let value = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };

  const value = {
    language,
    setLanguage,
    t,
    translations: translations[language],
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

