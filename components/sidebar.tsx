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
  ClipboardList,
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
  Package,
  Clock,
  CheckCircle2,
  Video,
  UserCheck,
  TrendingDown,
  ShoppingBag,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useLanguage } from "@/contexts/language-context"

export function Sidebar() {
  const pathname = usePathname()
  const { t } = useLanguage()

  const navigation = [
    { name: t("dashboard"), href: "/dashboard", icon: Home },
    { name: t("clients"), href: "/dashboard/clients", icon: Users },
    { name: "Services & Pricing", href: "/services", icon: ShoppingBag },
    { name: "Availability", href: "/availability", icon: Clock },
    { name: t("calendar"), href: "/dashboard/calendar", icon: Calendar },
    { name: t("conflicts"), href: "/dashboard/conflicts", icon: AlertTriangle },
    { name: t("messages"), href: "/dashboard/messages", icon: MessageSquare },
    { name: t("workouts"), href: "/dashboard/workouts", icon: ClipboardList },
    { name: t("exercises"), href: "/dashboard/exercises", icon: Library },
    { name: t("programs"), href: "/dashboard/programs", icon: Layers },
    { name: t("trainingPlans"), href: "/dashboard/training-plans", icon: FileText },
    { name: "Packages", href: "/dashboard/packages", icon: Package },
    { name: "Waitlist", href: "/dashboard/waitlist", icon: Clock },
    { name: "Check-ins", href: "/dashboard/check-ins", icon: CheckCircle2 },
    { name: "Video Library", href: "/dashboard/video-library", icon: Video },
    { name: "Group Classes", href: "/dashboard/group-classes", icon: UserCheck },
    { name: "Retention", href: "/dashboard/retention", icon: TrendingDown },
    { name: t("reminders"), href: "/dashboard/reminders", icon: Bell },
    { name: t("reports"), href: "/dashboard/reports", icon: FileText },
    { name: t("payments"), href: "/dashboard/payments", icon: DollarSign },
    { name: t("analytics"), href: "/dashboard/analytics", icon: BarChart3 },
    { name: t("aiPersona"), href: "/dashboard/ai-persona", icon: Zap },
    { name: t("referrals"), href: "/dashboard/referrals", icon: Gift },
    { name: t("marketing"), href: "/dashboard/marketing", icon: Megaphone },
    { name: t("social"), href: "/dashboard/social", icon: Share2 },
    { name: t("settings"), href: "/dashboard/settings", icon: Settings },
  ]

  return (
    <div className="hidden md:flex fixed left-0 top-0 h-screen w-20 bg-card border-r border-border flex-col items-center py-4 gap-2 z-50">
      <Link href="/dashboard" className="mb-2 group flex-shrink-0">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-xl blur-lg opacity-0 group-hover:opacity-75 transition-opacity duration-300" />
          <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center shadow-lg shadow-primary/25 group-hover:shadow-primary/50 transition-all duration-300 group-hover:scale-110">
            <Zap className="w-7 h-7 text-black fill-black" />
          </div>
        </div>
      </Link>

      <TooltipProvider delayDuration={300}>
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

  const mobileNavItems = [
    { name: t("dashboard"), href: "/dashboard", icon: Home },
    { name: t("clients"), href: "/dashboard/clients", icon: Users },
    { name: t("calendar"), href: "/dashboard/calendar", icon: Calendar },
    { name: t("conflicts"), href: "/dashboard/conflicts", icon: AlertTriangle },
    { name: t("messages"), href: "/dashboard/messages", icon: MessageSquare },
    { name: "More", href: "/dashboard/settings", icon: Settings },
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
