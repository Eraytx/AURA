"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import tr from "../../../../messages/tr.json";
import en from "../../../../messages/en.json";

const dictionaries: any = { tr, en };

interface LocaleContextType {
  locale: "tr" | "en";
  setLocale: (lang: "tr" | "en") => void;
  t: (keyPath: string) => string;
}

const LocaleContext = createContext<LocaleContextType>({
  locale: "tr",
  setLocale: () => {},
  t: (key) => key,
});

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<"tr" | "en">("tr");

  // Read initial locale from browser path
  useEffect(() => {
    if (typeof window !== "undefined") {
      const segment = window.location.pathname.split("/")[1];
      if (segment === "en" || segment === "tr") {
        setLocaleState(segment);
      }
    }
  }, []);

  const setLocale = (lang: "tr" | "en") => {
    setLocaleState(lang);
    
    // Update cookie
    document.cookie = `NEXT_LOCALE=${lang}; max-age=${30 * 24 * 60 * 60}; path=/`;

    // Persist to user profile in DB (mock call, handles db preference save)
    const token = localStorage.getItem("access_token");
    if (token) {
      fetch("/api/auth/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ language: lang }),
      }).catch(() => {});
    }

    // Re-route URL path to reflect locale change
    const pathParts = window.location.pathname.split("/");
    pathParts[1] = lang;
    const newPath = pathParts.join("/");
    window.history.pushState({}, "", newPath + window.location.search);
  };

  const t = (keyPath: string): string => {
    const dict = dictionaries[locale] || tr;
    const keys = keyPath.split(".");
    
    let result = dict;
    for (const key of keys) {
      if (result && result[key] !== undefined) {
        result = result[key];
      } else {
        return keyPath; // fallback to key path
      }
    }

    return typeof result === "string" ? result : keyPath;
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useTranslation() {
  return useContext(LocaleContext);
}
