"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Star,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  DollarSign,
  Users,
  Calendar,
  Activity,
  Target,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Gift,
  Copy,
  Check,
  Instagram,
  MessageCircle,
  Mail,
  Share2,
  Trophy,
  Award,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ShareToSocial } from "@/components/share-to-social"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { BookingLinkCard } from "@/components/booking-link-card"
import { SportSelectorModal } from "@/components/sport-selector-modal"
import { useSport } from "@/contexts/sport-context"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { ShareableStatsCard } from "@/components/analytics/shareable-stats-card"
import { OnboardingChecklist } from "@/components/onboarding-checklist"
import { EmptyClients } from "@/components/empty-states/empty-clients"
import { EmptySessions } from "@/components/empty-states/empty-sessions"
import { EmptyPrograms } from "@/components/empty-states/empty-programs"
import { EmptyPayments } from "@/components/empty-states/empty-payments"
import { DailyBriefing } from "@/components/gia/daily-briefing"

interface DashboardStats {
  trainer: {
    name: string
    rating: number
    totalSessions: number
  }
  revenue: {
    thisMonth: number
    lastMonth: number
    change: number
    forecast: number
  }
  clients: {
    total: number
    atRisk: number
    atRiskList: Array<{ id: string; name: string }>
    highEngagement: number
    mediumEngagement: number
    ltv: number
  }
  payments: {
    overdue: number
    overdueTotal: number
    overdueList: Array<{ id: string; amount: number; client: { name: string } | null }>
  }
  sessions: {
    thisWeek: number
    completed: number
    utilization: number
  }
  churn: {
    rate: number
    previousRate: number
  }
  referrals: {
    totalInvites: number
    activeReferrals: number
    creditsEarned: number
    freeMonthsEarned: number
  }
}

export function DashboardOverview() {
  const { terminology, getSportDisplayName } = useSport()
  const [copied, setCopied] = useState(false)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true)
        const response = await fetch('/api/dashboard/stats')

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard stats')
        }

        const data = await response.json()

        if (data.error) {
          throw new Error(data.error)
        }

        if (!data.trainer) {
          throw new Error('Invalid data format')
        }

        setStats(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        console.error('Error fetching dashboard stats:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  // Use stats or default values
  const referralLink = "goodrunss.com/ref/coach-mike"
  const referralStats = stats?.referrals || {
    totalInvites: 0,
    activeReferrals: 0,
    creditsEarned: 0,
    freeMonthsEarned: 0,
  }

  const milestones = [
    { count: 5, reward: '"Pro Verified" Badge', achieved: true },
    { count: 10, reward: "10% Lifetime Discount", achieved: false, progress: referralStats.activeReferrals },
    { count: 25, reward: "Free Annual Plan", achieved: false, progress: referralStats.activeReferrals },
  ]

  // Show loading state
  if (loading) {
    return (
      <div className="max-w-[1600px] mx-auto space-y-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-white/60">Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-[1600px] mx-auto space-y-8">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-destructive mb-2">Failed to load dashboard</h3>
          <p className="text-destructive/80 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

  // No stats available
  if (!stats) {
    return null
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`https://${referralLink}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareToSocial = (platform: string) => {
    const text = encodeURIComponent("Join me on GoodRunss - the best platform for trainers! 🏃‍♂️")
    const url = encodeURIComponent(`https://${referralLink}`)

    const urls: Record<string, string> = {
      instagram: `https://www.instagram.com/`,
      whatsapp: `https://wa.me/?text=${text}%20${url}`,
      email: `mailto:?subject=Join%20GoodRunss&body=${text}%20${url}`,
      threads: `https://www.threads.net/`,
    }

    if (platform === "instagram" || platform === "threads") {
      copyToClipboard()
      alert(`Link copied! Paste it in your ${platform} post.`)
    } else {
      window.open(urls[platform], "_blank")
    }
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            Welcome back, {stats.trainer.name.split(' ')[0]}
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Here's what's happening with your business today.
          </p>
        </div>
        <div className="flex gap-3">
          <ShareToSocial
            data={{
              title: "Join me on GoodRunss",
              value: "Train with the best",
              subtitle: "Get 10% off your first month",
              gradient: "bg-gradient-to-br from-primary via-primary/80 to-accent"
            }}
            trigger={
              <Button variant="outline" className="gap-2 bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white w-full md:w-auto">
                <Share2 className="h-4 w-4" />
                Share Profile
              </Button>
            }
          />
          <Button className="gap-2 shadow-lg shadow-primary/20" onClick={() => window.location.href = '/dashboard/sessions'}>
            <Calendar className="h-4 w-4" />
            Schedule Session
          </Button>
        </div>
      </div>

      {/* Gia's Daily Briefing - AI-Powered Insights */}
      <DailyBriefing />

      {/* 🚀 GROWTH ENGINE SECTION (NEW) */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* 1. Hot Leads Card */}
        <Card className="glass border-primary/20 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-6 relative">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="default" className="bg-primary/20 text-primary hover:bg-primary/30 border-primary/20">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Growth Engine
                  </Badge>
                </div>
                <h3 className="text-2xl font-bold text-white">New Client Opportunities</h3>
                <p className="text-muted-foreground">2 high-value leads match your profile</p>
              </div>
              <Button variant="outline" className="gap-2 bg-white/5 border-white/10 text-white hover:bg-white/10" onClick={() => window.location.href = '/dashboard/client-leads'}>
                View All Leads
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3">
              {/* Mock Lead 1 */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-background/40 border border-white/5 hover:border-primary/20 transition-colors cursor-pointer group/lead">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    JC
                  </div>
                  <div>
                    <div className="font-semibold text-white flex items-center gap-2">
                      Jessica Chen
                      <Badge variant="secondary" className="text-[10px] h-5 bg-green-500/10 text-green-500 border-green-500/20">95% Match</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">Tennis • Beginner • Downtown</div>
                  </div>
                </div>
                <Button size="sm" className="opacity-0 group-hover/lead:opacity-100 transition-opacity bg-primary text-black hover:bg-primary/90">
                  Message
                </Button>
              </div>

              {/* Mock Lead 2 */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-background/40 border border-white/5 hover:border-primary/20 transition-colors cursor-pointer group/lead">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    MW
                  </div>
                  <div>
                    <div className="font-semibold text-white flex items-center gap-2">
                      Marcus Williams
                      <Badge variant="secondary" className="text-[10px] h-5 bg-green-500/10 text-green-500 border-green-500/20">88% Match</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">Golf • Intermediate • Westside</div>
                  </div>
                </div>
                <Button size="sm" className="opacity-0 group-hover/lead:opacity-100 transition-opacity bg-primary text-black hover:bg-primary/90">
                  Message
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. Viral Referral Stats */}
        <Card className="glass border-border/50 relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="border-white/10 text-white/70">
                    <Users className="h-3 w-3 mr-1" />
                    Referral Network
                  </Badge>
                </div>
                <h3 className="text-2xl font-bold text-white">Viral Growth</h3>
                <p className="text-muted-foreground">Your referral loop is active</p>
              </div>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={() => {
                navigator.clipboard.writeText(referralLink)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
              }}>
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-center">
                <div className="text-2xl font-bold text-primary">{referralStats.activeReferrals}</div>
                <div className="text-xs text-muted-foreground">Active Referrals</div>
              </div>
              <div className="p-3 rounded-lg bg-background/40 border border-white/5 text-center">
                <div className="text-2xl font-bold text-white">{referralStats.totalInvites}</div>
                <div className="text-xs text-muted-foreground">Invites Sent</div>
              </div>
              <div className="p-3 rounded-lg bg-background/40 border border-white/5 text-center">
                <div className="text-2xl font-bold text-white">${referralStats.creditsEarned}</div>
                <div className="text-xs text-muted-foreground">Credits Earned</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Next Reward: 10% Lifetime Discount</span>
                <span className="font-medium text-white">{referralStats.activeReferrals}/10 Referrals</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-purple-500 transition-all duration-500"
                  style={{ width: `${(referralStats.activeReferrals / 10) * 100}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Onboarding Checklist - Show for new users or users with < 3 clients */}
      {stats.clients.total < 3 && (
        <OnboardingChecklist />
      )}

      {/* Main Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Revenue Card */}
        <Card className="glass border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-bold">${stats.revenue.thisMonth.toLocaleString()}</div>
              {stats.revenue.change !== 0 && (
                <Badge variant={stats.revenue.change > 0 ? "default" : "destructive"} className="ml-2">
                  {stats.revenue.change > 0 ? "+" : ""}{stats.revenue.change}%
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Forecast: ${stats.revenue.forecast.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        {/* Active Clients Card */}
        <Card className="glass border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-muted-foreground">Active Clients</p>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-bold">{stats.clients.total}</div>
              <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary">
                {stats.clients.highEngagement} highly active
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.clients.atRisk} clients at risk of churn
            </p>
          </CardContent>
        </Card>

        {/* Sessions Card */}
        <Card className="glass border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-muted-foreground">Sessions This Week</p>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-bold">{stats.sessions.thisWeek}</div>
              <Badge variant="outline" className="ml-2">
                {stats.sessions.utilization}% utilization
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.sessions.completed} completed so far
            </p>
          </CardContent>
        </Card>

        {/* Churn Rate Card */}
        <Card className="glass border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-muted-foreground">Churn Rate</p>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-bold">{stats.churn.rate}%</div>
              {stats.churn.rate !== stats.churn.previousRate && (
                <div className={`flex items-center text-xs ${stats.churn.rate < stats.churn.previousRate ? 'text-green-500' : 'text-red-500'}`}>
                  {stats.churn.rate < stats.churn.previousRate ? (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  )}
                  {Math.abs(stats.churn.rate - stats.churn.previousRate)}%
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              vs {stats.churn.previousRate}% last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <BookingLinkCard />

        {/* Share Stats Card */}
        <ShareableStatsCard />

        {/* Onboarding Checklist */}
        <OnboardingChecklist />
      </div>

      {/* Empty States (Conditional) */}
      {stats.clients.total === 0 && <EmptyClients />}
      {stats.sessions.thisWeek === 0 && stats.clients.total > 0 && <EmptySessions />}
    </div>
  )
}
