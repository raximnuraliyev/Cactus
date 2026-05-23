import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

import en from "./en.json";
import ru from "./ru.json";
import uz from "./uz.json";

type Language = "en" | "ru" | "uz";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Translations = Record<string, any>;

const translations: Record<Language, Translations> = { en, ru, uz };

interface I18nContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem("rf_lang") as Language | null;
    return saved && ["en", "ru", "uz"].includes(saved) ? saved : "en";
  });

  const setLang = useCallback((l: Language) => {
    setLangState(l);
    localStorage.setItem("rf_lang", l);
  }, []);

  const t = useCallback(
    (key: string): string => {
      const keys = key.split(".");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let current: any = translations[lang];
      for (const k of keys) {
        if (current && typeof current === "object" && k in current) {
          current = current[k];
        } else {
          // Fallback to English
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          let fallback: any = translations.en;
          for (const fk of keys) {
            if (fallback && typeof fallback === "object" && fk in fallback) {
              fallback = fallback[fk];
            } else {
              return key; // Key not found at all
            }
          }
          return typeof fallback === "string" ? fallback : key;
        }
      }
      return typeof current === "string" ? current : key;
    },
    [lang]
  );

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
