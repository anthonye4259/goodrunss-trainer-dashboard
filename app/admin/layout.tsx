"use client"

import { Inter } from "next/font/google"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, Users, DollarSign, Settings, ArrowLeft, Loader2 } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import { useEffect } from "react"

const inter = Inter({ subsets: ["latin"] })

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isLoaded, isSignedIn } = useUser()

  useEffect(() => {
    if (isLoaded) {
      if (!isSignedIn) {
        router.push("/login")
        return
      }

      // Check for admin email
      const email = user?.primaryEmailAddress?.emailAddress
      const isAdmin = email === 'anthony@goodrunss.com' || email === 'anthonyedwards@goodrunss.com' // Added variation just in case

      if (!isAdmin) {
        router.push("/dashboard")
      }
    }
  }, [isLoaded, isSignedIn, user, router])

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Double check render protection
  const email = user?.primaryEmailAddress?.emailAddress
  const isAdmin = email === 'anthony@goodrunss.com' || 
                 email === 'anthonyedwards@goodrunss.com' || 
                 email === 'anthonye@andrew.cmu.edu'
  
  if (!isAdmin) {
    return null
  }

  return (
    <div className={`min-h-screen bg-background ${inter.className}`}>
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-card border-r border-border flex flex-col">
          <div className="p-6 border-b border-border">
            <h1 className="text-2xl font-bold text-primary">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">GoodRunss Control Panel</p>
          </div>
          
          <nav className="flex-1 p-4 space-y-2">
            <AdminNavLink href="/admin" icon={LayoutDashboard} active={pathname === '/admin'}>
              Overview
            </AdminNavLink>
            <AdminNavLink href="/admin/trainers" icon={Users} active={pathname === '/admin/trainers'}>
              Trainers
            </AdminNavLink>
            <AdminNavLink href="/admin/revenue" icon={DollarSign} active={pathname === '/admin/revenue'}>
              Revenue
            </AdminNavLink>
            <AdminNavLink href="/admin/settings" icon={Settings} active={pathname === '/admin/settings'}>
              Settings
            </AdminNavLink>
          </nav>

          <div className="p-4 border-t border-border">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

function AdminNavLink({ 
  href, 
  icon: Icon, 
  children,
  active 
}: { 
  href: string
  icon: any
  children: React.ReactNode
  active?: boolean
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
        active 
          ? 'text-primary bg-accent font-medium' 
          : 'text-muted-foreground hover:text-primary hover:bg-accent'
      }`}
    >
      <Icon className="h-5 w-5" />
      <span>{children}</span>
    </Link>
  )
}
