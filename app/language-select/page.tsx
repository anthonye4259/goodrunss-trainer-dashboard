"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { Globe, Search, Check, Zap } from "lucide-react"

const LANGUAGES = [
  { code: "ar", name: "Arabic", native: "عربي", region: "Saudi Arabia" },
  { code: "bn", name: "Bengali", native: "বাংলা", region: "Bangladesh" },
  { code: "zh", name: "Chinese (Simplified)", native: "中国人", region: "China" },
  { code: "en", name: "English", native: "English", region: "United Kingdom" },
  { code: "fr", name: "French", native: "Français", region: "France" },
  { code: "hi", name: "Hindi", native: "हिंदी", region: "India" },
  { code: "pt", name: "Portuguese", native: "Português", region: "Portugal" },
  { code: "ru", name: "Russian", native: "Русский", region: "Russia" },
  { code: "es", name: "Spanish", native: "Español", region: "Spain" },
  { code: "ur", name: "Urdu", native: "اردو", region: "Pakistan" },
]

export default function LanguageSelectPage() {
  const [selectedLanguage, setSelectedLanguage] = useState("en")
  const [searchQuery, setSearchQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const selectedLang = LANGUAGES.find((lang) => lang.code === selectedLanguage)

  const filteredLanguages = LANGUAGES.filter(
    (lang) =>
      lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.native.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleContinue = () => {
    localStorage.setItem("preferred_language", selectedLanguage)
    localStorage.setItem("language_selected", "true")

    router.push("/welcome")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl opacity-20 animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary via-primary to-accent flex items-center justify-center shadow-lg shadow-primary/50 border border-primary/20">
                <Zap className="h-10 w-10 text-background" fill="currentColor" />
              </div>
              <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-accent flex items-center justify-center animate-pulse">
                <Globe className="h-3 w-3 text-background" />
              </div>
            </div>
          </div>

          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient-shift">
                GOODRUNSS
              </span>
            </h1>
            <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">
              Global Training Platform
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Choose Your Language</h2>
            <p className="text-muted-foreground">Available in 10 languages worldwide</p>
          </div>
        </div>

        <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-xl">
          <CardContent className="p-6 space-y-4">
            <Button
              variant="outline"
              className="w-full h-16 justify-between text-left font-normal bg-background/50 hover:bg-background/80 border-border/50 hover:border-primary/50 transition-all duration-200"
              onClick={() => setIsOpen(!isOpen)}
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Globe className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">{selectedLang?.name}</div>
                  <div className="text-sm text-muted-foreground">{selectedLang?.region}</div>
                </div>
              </div>
              <Check className="h-5 w-5 text-primary" />
            </Button>

            {isOpen && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search languages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-background/50 border-border/50 focus:border-primary/50"
                  />
                </div>

                <div className="max-h-[400px] overflow-y-auto space-y-1 rounded-lg border border-border/50 p-2 bg-background/30">
                  {filteredLanguages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setSelectedLanguage(lang.code)
                        setIsOpen(false)
                        setSearchQuery("")
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-md transition-all duration-200 hover:bg-primary/10 hover:border-primary/20 border border-transparent ${
                        selectedLanguage === lang.code ? "bg-primary/10 border-primary/20" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-left">
                          <div className="font-medium text-foreground">{lang.name}</div>
                          <div className="text-sm text-muted-foreground">{lang.region}</div>
                        </div>
                      </div>
                      <div className="text-lg font-medium text-primary">{lang.native}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Button
              onClick={handleContinue}
              className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-background font-semibold shadow-lg shadow-primary/30 transition-all duration-200 hover:shadow-xl hover:shadow-primary/40"
            >
              Continue
            </Button>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
              <Globe className="h-3 w-3" />
              <span>Trusted by trainers in 50+ countries</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
