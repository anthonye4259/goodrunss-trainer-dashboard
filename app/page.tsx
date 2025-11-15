"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function RootPage() {
  const router = useRouter()

  useEffect(() => {
    const languageSelected = localStorage.getItem("language_selected")
    const isAuthenticated = localStorage.getItem("trainer_authenticated")

    if (!languageSelected) {
      // First time visitor - show language selection
      router.push("/language-select")
    } else if (!isAuthenticated) {
      // Language selected but not logged in - show welcome page
      router.push("/welcome")
    } else {
      // Authenticated - go to dashboard
      router.push("/dashboard")
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>
  )
}
