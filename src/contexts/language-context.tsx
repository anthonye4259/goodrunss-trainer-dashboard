"use client"

import { createContext, useContext, useState, ReactNode } from "react"

interface LanguageContextType {
  language: string
  setLanguage: (lang: string) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState("en")
  
  // Simple translation function (returns key if no translation)
  const t = (key: string) => key

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    // Return default values if context is not available (e.g., in server components)
    return { language: "en", setLanguage: () => {}, t: (key: string) => key }
  }
  return context
}

