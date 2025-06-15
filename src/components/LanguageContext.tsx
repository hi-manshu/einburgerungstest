
import React, { createContext, useContext, useState } from 'react';

type LanguageContextType = {
  translationLang: string;
  setTranslationLang: (lang: string) => void;
  showTranslation: boolean;
  setShowTranslation: (show: boolean) => void;
};

const LanguageContext = createContext<LanguageContextType>({
  translationLang: '',
  setTranslationLang: () => {},
  showTranslation: false,
  setShowTranslation: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [translationLang, setTranslationLang] = useState<string>('');
  const [showTranslation, setShowTranslation] = useState<boolean>(false);

  return (
    <LanguageContext.Provider value={{ translationLang, setTranslationLang, showTranslation, setShowTranslation }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
