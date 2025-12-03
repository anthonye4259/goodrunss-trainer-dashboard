"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Sparkles, 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  MessageSquare,
  Target,
  ChevronRight,
  Lightbulb,
  Rocket,
  Clock,
  BarChart3,
  Megaphone,
  ClipboardList,
  X
} from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface FeatureRecommendation {
  id: string
  title: string
  description: string
  path: string
  icon: React.ReactNode
  priority: "essential" | "recommended" | "advanced"
  forGoals: string[]
  timeToSetup: string
}

const allFeatures: FeatureRecommendation[] = [
  // ESSENTIAL - Everyone needs these
  {
    id: "clients",
    title: "Client Management",
    description: "Add and track all your clients in one place",
    path: "/dashboard/clients",
    icon: <Users className="h-5 w-5" />,
    priority: "essential",
    forGoals: ["get-clients", "save-time", "organization", "scale"],
    timeToSetup: "5 min"
  },
  {
    id: "calendar",
    title: "Calendar & Scheduling",
    description: "Manage sessions and prevent double-booking",
    path: "/dashboard/calendar",
    icon: <Calendar className="h-5 w-5" />,
    priority: "essential",
    forGoals: ["save-time", "organization", "scale"],
    timeToSetup: "3 min"
  },
  {
    id: "gia",
    title: "GIA - AI Assistant",
    description: "Your personal AI that knows your business",
    path: "/dashboard",
    icon: <Sparkles className="h-5 w-5" />,
    priority: "essential",
    forGoals: ["save-time", "better-plans", "marketing", "get-clients"],
    timeToSetup: "1 min"
  },
  
  // GET MORE CLIENTS
  {
    id: "leads",
    title: "Daily Leads",
    description: "Get matched with potential clients every day",
    path: "/dashboard/client-leads",
    icon: <Target className="h-5 w-5" />,
    priority: "recommended",
    forGoals: ["get-clients", "scale"],
    timeToSetup: "2 min"
  },
  {
    id: "referrals",
    title: "Referral Program",
    description: "Turn happy clients into new client sources",
    path: "/dashboard/referrals",
    icon: <Users className="h-5 w-5" />,
    priority: "recommended",
    forGoals: ["get-clients", "scale"],
    timeToSetup: "5 min"
  },
  {
    id: "marketing",
    title: "Marketing & Social",
    description: "AI-generated content for social media",
    path: "/dashboard/marketing",
    icon: <Megaphone className="h-5 w-5" />,
    priority: "recommended",
    forGoals: ["get-clients", "marketing"],
    timeToSetup: "10 min"
  },
  
  // SAVE TIME
  {
    id: "reminders",
    title: "Auto Reminders",
    description: "Never chase clients for sessions again",
    path: "/dashboard/reminders",
    icon: <Clock className="h-5 w-5" />,
    priority: "recommended",
    forGoals: ["save-time", "organization"],
    timeToSetup: "3 min"
  },
  {
    id: "auto-crm",
    title: "Auto CRM",
    description: "Automated follow-ups and check-ins",
    path: "/dashboard/auto-crm",
    icon: <MessageSquare className="h-5 w-5" />,
    priority: "advanced",
    forGoals: ["save-time", "organization", "scale"],
    timeToSetup: "10 min"
  },
  
  // BETTER PROGRAMS
  {
    id: "workouts",
    title: "Workout Builder",
    description: "Create and assign training programs",
    path: "/dashboard/workouts",
    icon: <ClipboardList className="h-5 w-5" />,
    priority: "recommended",
    forGoals: ["better-plans", "save-time"],
    timeToSetup: "15 min"
  },
  {
    id: "session-planner",
    title: "Session Planner",
    description: "Plan individual sessions with AI help",
    path: "/dashboard/session-planner",
    icon: <Lightbulb className="h-5 w-5" />,
    priority: "recommended",
    forGoals: ["better-plans"],
    timeToSetup: "5 min"
  },
  
  // GROW REVENUE
  {
    id: "payments",
    title: "Payments & Invoicing",
    description: "Track payments and automate invoicing",
    path: "/dashboard/payments",
    icon: <DollarSign className="h-5 w-5" />,
    priority: "essential",
    forGoals: ["organization", "scale"],
    timeToSetup: "10 min"
  },
  {
    id: "packages",
    title: "Session Packages",
    description: "Sell multi-session packages",
    path: "/dashboard/packages",
    icon: <Rocket className="h-5 w-5" />,
    priority: "recommended",
    forGoals: ["scale", "get-clients"],
    timeToSetup: "5 min"
  },
  
  // ANALYTICS
  {
    id: "analytics",
    title: "Business Analytics",
    description: "Track revenue, retention, and growth",
    path: "/dashboard/analytics",
    icon: <BarChart3 className="h-5 w-5" />,
    priority: "advanced",
    forGoals: ["scale", "organization"],
    timeToSetup: "2 min"
  },
  {
    id: "retention",
    title: "Client Retention",
    description: "Identify at-risk clients before they churn",
    path: "/dashboard/retention",
    icon: <TrendingUp className="h-5 w-5" />,
    priority: "advanced",
    forGoals: ["scale", "organization"],
    timeToSetup: "2 min"
  },
]

const goalLabels: Record<string, string> = {
  "get-clients": "Get More Clients",
  "save-time": "Save Time",
  "better-plans": "Better Programs",
  "marketing": "Improve Marketing",
  "organization": "Get Organized",
  "scale": "Scale Business",
}

export function FeatureGuide() {
  const router = useRouter()
  const [primaryGoal, setPrimaryGoal] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDismissed, setIsDismissed] = useState(false)
  const [viewAll, setViewAll] = useState(false)

  useEffect(() => {
    // Check if dismissed
    const dismissed = localStorage.getItem("feature_guide_dismissed")
    if (dismissed === "true") {
      setIsDismissed(true)
    }

    // Fetch user's primary goal from settings
    async function fetchGoal() {
      try {
        const response = await fetch("/api/settings")
        const data = await response.json()
        if (data.settings?.primaryGoal) {
          setPrimaryGoal(data.settings.primaryGoal)
        }
      } catch (error) {
        console.error("Error fetching user goal:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchGoal()
  }, [])

  const handleDismiss = () => {
    setIsDismissed(true)
    localStorage.setItem("feature_guide_dismissed", "true")
  }

  if (isDismissed || isLoading) return null

  // Filter and sort features based on goal
  const recommendedFeatures = allFeatures
    .filter(f => !primaryGoal || f.forGoals.includes(primaryGoal) || f.priority === "essential")
    .sort((a, b) => {
      // Sort by priority: essential > recommended > advanced
      const priorityOrder = { essential: 0, recommended: 1, advanced: 2 }
      const aPriority = a.forGoals.includes(primaryGoal || "") ? -1 : priorityOrder[a.priority]
      const bPriority = b.forGoals.includes(primaryGoal || "") ? -1 : priorityOrder[b.priority]
      return aPriority - bPriority
    })

  const displayFeatures = viewAll ? recommendedFeatures : recommendedFeatures.slice(0, 6)

  return (
    <Card className="border-2 border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Lightbulb className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                Recommended For You
                {primaryGoal && (
                  <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                    {goalLabels[primaryGoal]}
                  </Badge>
                )}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Start with these features based on your goals
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleDismiss}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {displayFeatures.map((feature) => (
            <button
              key={feature.id}
              onClick={() => router.push(feature.path)}
              className={cn(
                "flex items-start gap-3 p-4 rounded-lg border text-left transition-all hover:border-primary/50 hover:bg-primary/5 group",
                feature.priority === "essential" 
                  ? "border-primary/30 bg-primary/5" 
                  : "border-border/50 bg-card/50"
              )}
            >
              <div className={cn(
                "h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
                feature.priority === "essential" 
                  ? "bg-primary/20 text-primary" 
                  : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
              )}>
                {feature.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-white truncate">{feature.title}</h4>
                  {feature.priority === "essential" && (
                    <Badge variant="outline" className="text-[10px] h-4 border-primary/30 text-primary">
                      Essential
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                  {feature.description}
                </p>
                <p className="text-[10px] text-muted-foreground/70 mt-1">
                  ~{feature.timeToSetup} to setup
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
            </button>
          ))}
        </div>

        {recommendedFeatures.length > 6 && (
          <div className="mt-4 text-center">
            <Button 
              variant="ghost" 
              onClick={() => setViewAll(!viewAll)}
              className="text-muted-foreground hover:text-white"
            >
              {viewAll ? "Show Less" : `View All ${recommendedFeatures.length} Features`}
            </Button>
          </div>
        )}

        {!primaryGoal && (
          <div className="mt-4 p-3 rounded-lg bg-muted/30 border border-border/50">
            <p className="text-sm text-muted-foreground text-center">
              💡 <strong>Tip:</strong> Complete your{" "}
              <button 
                onClick={() => router.push("/onboarding")}
                className="text-primary hover:underline"
              >
                onboarding goals
              </button>{" "}
              to get personalized feature recommendations!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
