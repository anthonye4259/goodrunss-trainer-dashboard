"use client"

import type React from "react"
import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { Inter } from "next/font/google"
import { Sidebar, MobileNav } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Toaster } from "@/components/ui/toaster"
import { LanguageProvider } from "@/contexts/language-context"
import { SportProvider } from "@/contexts/sport-context"
import { GiaChatbot } from "@/components/gia-chatbot"

const inter = Inter({ subsets: ["latin"] })

const unauthenticatedRoutes = ["/", "/language-select", "/welcome", "/login", "/signup", "/checkout", "/onboarding"]

export function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()

  const isUnauthenticatedRoute = unauthenticatedRoutes.some((route) => pathname === route)

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.message.includes("ResizeObserver loop")) {
        event.stopImmediatePropagation()
        event.preventDefault()
      }
    }

    window.addEventListener("error", handleError)
    return () => window.removeEventListener("error", handleError)
  }, [])

  if (isUnauthenticatedRoute) {
    return (
      <>
        <div className={inter.className}>{children}</div>
        <Toaster />
      </>
    )
  }

  return (
    <LanguageProvider>
      <SportProvider>
        <div className={`flex h-screen overflow-hidden ${inter.className}`}>
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden md:pl-20 pb-16 md:pb-0">
            <Header />
            <main className="flex-1 overflow-y-auto">{children}</main>
          </div>
          <MobileNav />
          <GiaChatbot />
        </div>
        <Toaster />
      </SportProvider>
    </LanguageProvider>
  )
}

export default ClientLayout
