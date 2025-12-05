"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Sparkles, 
  ChevronRight, 
  Users, 
  Calendar, 
  Target, 
  Settings,
  TrendingUp,
  MessageSquare,
  X,
  Lightbulb
} from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface AccountState {
  hasClients: boolean
  clientCount: number
  hasSessionsThisWeek: boolean
  sessionCount: number
  hasSpecialties: boolean
  specialties: string[]
  hasCity: boolean
  city: string | null
  primaryGoal: string | null
  hasLeads: boolean
  leadCount: number
  atRiskClients: number
  overduePayments: number
}

interface Suggestion {
  id: string
  icon: React.ReactNode
  iconBg: string
  title: string
  description: string
  action: string
  path: string
  priority: number // Lower = higher priority
}

export function GiaSmartSuggestions() {
  const router = useRouter()
  const [accountState, setAccountState] = useState<AccountState | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dismissedSuggestions, setDismissedSuggestions] = useState<string[]>([])

  useEffect(() => {
    // Load dismissed suggestions
    const dismissed = localStorage.getItem("gia_dismissed_suggestions")
    if (dismissed) {
      setDismissedSuggestions(JSON.parse(dismissed))
    }

    // Fetch account state
    async function fetchAccountState() {
      try {
        const [statsRes, settingsRes] = await Promise.all([
          fetch("/api/dashboard/stats"),
          fetch("/api/settings")
        ])

        const stats = await statsRes.json()
        const settings = await settingsRes.json()

        setAccountState({
          hasClients: (stats.clients?.total || 0) > 0,
          clientCount: stats.clients?.total || 0,
          hasSessionsThisWeek: (stats.sessions?.thisWeek || 0) > 0,
          sessionCount: stats.sessions?.thisWeek || 0,
          hasSpecialties: (settings.settings?.specialties?.length || 0) > 0,
          specialties: settings.settings?.specialties || [],
          hasCity: !!settings.settings?.city,
          city: settings.settings?.city,
          primaryGoal: settings.settings?.primaryGoal,
          hasLeads: false, // Will check leads endpoint
          leadCount: 0,
          atRiskClients: stats.clients?.atRisk || 0,
          overduePayments: stats.payments?.overdue || 0,
        })
      } catch (error) {
        console.error("Error fetching account state:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAccountState()
  }, [])

  const dismissSuggestion = (id: string) => {
    const newDismissed = [...dismissedSuggestions, id]
    setDismissedSuggestions(newDismissed)
    localStorage.setItem("gia_dismissed_suggestions", JSON.stringify(newDismissed))
  }

  const openGia = () => {
    // Dispatch event to open the floating GIA chat
    window.dispatchEvent(new CustomEvent("openGIA"))
  }

  if (isLoading || !accountState) return null

  // Generate suggestions based on account state
  const suggestions: Suggestion[] = []

  // Priority 1: Profile setup
  if (!accountState.hasSpecialties) {
    suggestions.push({
      id: "setup-specialty",
      icon: <Settings className="h-4 w-4" />,
      iconBg: "bg-amber-500/20 text-amber-500",
      title: "Set your specialty",
      description: "I can find better leads when I know what you teach",
      action: "Add Specialty",
      path: "/settings",
      priority: 1,
    })
  }

  if (!accountState.hasCity) {
    suggestions.push({
      id: "setup-city",
      icon: <Target className="h-4 w-4" />,
      iconBg: "bg-blue-500/20 text-blue-500",
      title: "Add your city",
      description: "This helps me find local clients for you",
      action: "Add Location",
      path: "/settings",
      priority: 1,
    })
  }

  // Priority 2: First actions
  if (!accountState.hasClients) {
    suggestions.push({
      id: "add-first-client",
      icon: <Users className="h-4 w-4" />,
      iconBg: "bg-primary/20 text-primary",
      title: "Add your first client",
      description: "Start tracking clients to unlock powerful features",
      action: "Add Client",
      path: "/dashboard/clients?action=add",
      priority: 2,
    })
  }

  if (accountState.hasClients && !accountState.hasSessionsThisWeek) {
    suggestions.push({
      id: "schedule-session",
      icon: <Calendar className="h-4 w-4" />,
      iconBg: "bg-green-500/20 text-green-500",
      title: "Schedule a session",
      description: `You have ${accountState.clientCount} client${accountState.clientCount > 1 ? 's' : ''} but no sessions this week`,
      action: "Schedule",
      path: "/dashboard/calendar",
      priority: 2,
    })
  }

  // Priority 3: Growth actions based on goal
  if (accountState.primaryGoal === "get-clients" || !accountState.primaryGoal) {
    suggestions.push({
      id: "check-leads",
      icon: <Target className="h-4 w-4" />,
      iconBg: "bg-purple-500/20 text-purple-500",
      title: "Check today's leads",
      description: "I found potential clients that match your profile",
      action: "View Leads",
      path: "/dashboard/client-leads",
      priority: 3,
    })
  }

  // Priority 4: Alerts
  if (accountState.atRiskClients > 0) {
    suggestions.push({
      id: "at-risk-clients",
      icon: <TrendingUp className="h-4 w-4" />,
      iconBg: "bg-orange-500/20 text-orange-500",
      title: `${accountState.atRiskClients} client${accountState.atRiskClients > 1 ? 's' : ''} at risk`,
      description: "Reach out before they churn",
      action: "View",
      path: "/dashboard/retention",
      priority: 4,
    })
  }

  if (accountState.overduePayments > 0) {
    suggestions.push({
      id: "overdue-payments",
      icon: <MessageSquare className="h-4 w-4" />,
      iconBg: "bg-red-500/20 text-red-500",
      title: `${accountState.overduePayments} overdue payment${accountState.overduePayments > 1 ? 's' : ''}`,
      description: "Send a friendly reminder",
      action: "View",
      path: "/dashboard/payments",
      priority: 4,
    })
  }

  // Filter out dismissed suggestions and sort by priority
  const activeSuggestions = suggestions
    .filter(s => !dismissedSuggestions.includes(s.id))
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 3) // Show max 3 suggestions

  if (activeSuggestions.length === 0) return null

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 via-transparent to-transparent">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
          </div>
          <span className="font-medium text-sm">GIA's Suggestions</span>
          <Badge variant="secondary" className="text-[10px] h-5 bg-primary/10 text-primary border-primary/20">
            {activeSuggestions.length} tips
          </Badge>
        </div>

        <div className="space-y-2">
          {activeSuggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-card/50 border border-border/50 hover:border-primary/30 transition-colors group"
            >
              <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0", suggestion.iconBg)}>
                {suggestion.icon}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-white">{suggestion.title}</p>
                <p className="text-xs text-muted-foreground truncate">{suggestion.description}</p>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => dismissSuggestion(suggestion.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  onClick={() => router.push(suggestion.path)}
                  className="h-7 px-3 text-xs"
                >
                  {suggestion.action}
                  <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 pt-3 border-t border-border/50">
          <button
            onClick={openGia}
            className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <Lightbulb className="h-4 w-4" />
            Ask GIA for personalized advice
          </button>
        </div>
      </CardContent>
    </Card>
  )
}


