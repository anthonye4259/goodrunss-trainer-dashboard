'use client'

import { useClerk } from "@clerk/nextjs"
import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

export function HardSignOut() {
  const { signOut } = useClerk()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      // 1. Clear local storage
      localStorage.clear()
      sessionStorage.clear()
      
      // 2. Clear specific Clerk keys if any remain
      // (This is redundant with clear() but safe)
      
      // 3. Sign out from Clerk
      await signOut({ redirectUrl: '/login' })
      
      // 4. Hard reload to ensure clean state if redirect doesn't happen
      // (Clerk usually handles the redirect, but this is a fallback)
    } catch (error) {
      console.error("Sign out error:", error)
      // Force redirect if Clerk fails
      window.location.href = '/login'
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

