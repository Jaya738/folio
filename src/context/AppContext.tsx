import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppContextType } from '../types';
import { translations } from '../config/translations';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState(localStorage.getItem('folio-theme') || 'dark');
  const [language, setLanguage] = useState(localStorage.getItem('folio-language') || 'en');

  useEffect(() => {
    localStorage.setItem('folio-theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('folio-language', language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language]?.[key] || key;
  };

  const contextValue: AppContextType = {
    t,
    theme,
    setTheme,
    language,
    setLanguage
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}; 