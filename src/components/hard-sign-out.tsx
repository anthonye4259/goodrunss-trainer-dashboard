'use client'

import { useClerk } from "@clerk/nextjs"
import { LogOut } from "lucide-react"

export function HardSignOut() {
  const { signOut } = useClerk()

  const handleSignOut = () => {
    // Clear all browser storage
    localStorage.clear()
    sessionStorage.clear()
    
    // Let Clerk handle the signout and redirect
    // This is the proper way - don't try to manually redirect
    signOut({ redirectUrl: '/welcome' })
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
