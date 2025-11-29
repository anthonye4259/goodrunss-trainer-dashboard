"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Home,
  Calendar,
  Users,
  DollarSign,
  BarChart3,
  MessageSquare,
  Settings,
  Dumbbell,
  Library,
  Bell,
  FileText,
  Layers,
  CreditCard,
  Share2,
  Megaphone,
  Zap,
  Gift,
  AlertTriangle,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useLanguage } from "@/contexts/language-context"

export function Sidebar() {
  const pathname = usePathname()
  const { t } = useLanguage()

  // ✅ SIMPLIFIED NAVIGATION - Only Core Trainer Features (8 items)
  const navigation = [
    { name: t("dashboard"), href: "/dashboard", icon: Home },
    { name: t("calendar"), href: "/dashboard/calendar", icon: Calendar },
    { name: t("clients"), href: "/dashboard/clients", icon: Users },
    { name: t("messages"), href: "/dashboard/messages", icon: MessageSquare },
    { name: t("payments"), href: "/dashboard/payments", icon: DollarSign },
    { name: t("analytics"), href: "/dashboard/analytics", icon: BarChart3 },
    { name: t("gia"), href: "/dashboard/gia", icon: Zap },
    { name: t("settings"), href: "/dashboard/settings", icon: Settings },
  ]

  // 🔧 MOVED TO SETTINGS:
  // - Billing → Settings > Subscription & Billing
  // - AI Persona → Settings > AI Persona (Beta)
  // - Marketing → Settings > Marketing Tools
  // - Social → Settings > Social Media
  // - Referrals → Settings > Referral Program
  // - Workouts/Exercises/Programs → Combined into dashboard or removed
  // - Conflicts → Auto-handled in calendar
  // - Reminders → Settings > Notifications
  // - Reports → Removed (consumer feature)

  return (
    <div className="hidden md:flex fixed left-0 top-0 h-screen w-20 bg-card border-r border-border flex-col items-center py-4 gap-2 z-50">
      <Link href="/dashboard" className="mb-2 group flex-shrink-0">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-xl blur-lg opacity-0 group-hover:opacity-75 transition-opacity duration-300" />
          <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center shadow-lg shadow-primary/25 group-hover:shadow-primary/50 transition-all duration-300 group-hover:scale-110">
            <Zap className="w-7 h-7 text-background" fill="currentColor" />
          </div>
        </div>
      </Link>

      <TooltipProvider>
        <nav className="flex-1 flex flex-col gap-1 overflow-y-auto overflow-x-visible w-full px-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
            return (
              <Tooltip key={item.name}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "h-14 w-14 flex-shrink-0 rounded-xl flex items-center justify-center transition-all duration-200",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                        : "text-primary hover:bg-secondary hover:text-primary hover:scale-105",
                    )}
                  >
                    <item.icon className="w-6 h-6" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-card border-primary/20">
                  <p className="font-medium">{item.name}</p>
                </TooltipContent>
              </Tooltip>
            )
          })}
        </nav>
      </TooltipProvider>
    </div>
  )
}

export function MobileNav() {
  const pathname = usePathname()
  const { t } = useLanguage()

  // 📱 MOBILE NAVIGATION - 5 Most Important Features
  const mobileNavItems = [
    { name: t("dashboard"), href: "/dashboard", icon: Home },
    { name: t("calendar"), href: "/dashboard/calendar", icon: Calendar },
    { name: t("clients"), href: "/dashboard/clients", icon: Users },
    { name: t("messages"), href: "/dashboard/messages", icon: MessageSquare },
    { name: t("more"), href: "/dashboard/settings", icon: Settings },
  ]

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border flex items-center justify-around px-2 z-50">
      {mobileNavItems.map((item) => {
        const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 min-w-[60px]",
              isActive ? "bg-primary text-primary-foreground" : "text-primary hover:bg-secondary",
            )}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{item.name}</span>
          </Link>
        )
      })}
    </div>
  )
}
