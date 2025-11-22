'use client'

import { useClerk } from "@clerk/nextjs"
import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

export function HardSignOut() {
  const { signOut } = useClerk()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      // 1. Clear all browser storage FIRST
      localStorage.clear()
      sessionStorage.clear()
      
      // 2. Clear all cookies (Clerk stores session in cookies)
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
      })
      
      // 3. Sign out from Clerk (this clears their session)
      await signOut()
      
      // 4. Wait a moment for Clerk to fully clear
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // 5. Force hard redirect to welcome page (bypasses any auth checks)
      window.location.href = '/welcome'
    } catch (error) {
      console.error("Sign out error:", error)
      // Force redirect if Clerk fails
      window.location.href = '/welcome'
    }
  }

  return (
    <button 
      onClick={handleSignOut}
      className="h-14 w-14 flex-shrink-0 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200 hover:scale-105"
    >
      <LogOut className="w-6 h-6" />
    </button>
  )
}

