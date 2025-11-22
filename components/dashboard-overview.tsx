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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ShareToSocial } from "@/components/share-to-social"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { BookingLinkCard } from "@/components/booking-link-card"
import { SportSelectorModal } from "@/components/sport-selector-modal"
import { useSport } from "@/contexts/sport-context"

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

  // Show error state - but with empty data instead of error
  if (error) {
    // Return empty stats instead of showing error
    const emptyStats = {
      trainer: { name: "Trainer", rating: 5.0, totalSessions: 0 },
      revenue: { thisMonth: 0, lastMonth: 0, change: 0, forecast: 0 },
      clients: { total: 0, atRisk: 0, atRiskList: [], highEngagement: 0, mediumEngagement: 0, ltv: 0 },
      payments: { overdue: 0, overdueTotal: 0, overdueList: [] },
      sessions: { thisWeek: 0, completed: 0, utilization: 0 },
      churn: { rate: 0, previousRate: 0 },
      referrals: { totalInvites: 0, activeReferrals: 0, creditsEarned: 0, freeMonthsEarned: 0 }
    }
    setStats(emptyStats)
    setError(null)
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
      <SportSelectorModal />
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
            Welcome back, <span className="text-primary">{stats.trainer.name}</span>
          </h1>
          <div className="mt-3 flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
              <Star className="h-4 w-4 fill-primary text-primary" />
              <span className="text-sm font-semibold text-primary">{stats.trainer.rating.toFixed(1)} Rating • {getSportDisplayName()}</span>
            </div>
          </div>
        </div>
        <Select defaultValue="7days">
          <SelectTrigger className="w-full sm:w-[180px] bg-card/50 border-border/50 backdrop-blur-sm">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 Days</SelectItem>
            <SelectItem value="30days">Last 30 Days</SelectItem>
            <SelectItem value="90days">Last 90 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Booking Link Card - PROMINENT */}
      <BookingLinkCard />

      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-400" />
          Action Required
        </h2>
        <div className="grid gap-3">
          <Card className="bg-gradient-to-r from-red-500/10 to-red-600/5 border-red-500/20 hover:border-red-500/40 transition-colors">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-red-500/20 flex items-center justify-center">
                  <XCircle className="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <p className="font-semibold text-white">{stats.clients.atRisk} {terminology.clientPlural.toLowerCase()} haven't booked in 2+ weeks</p>
                  <p className="text-sm text-white/60">At risk of churning - reach out today</p>
                </div>
              </div>
              <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white">
                View Clients
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500/10 to-orange-600/5 border-orange-500/20 hover:border-orange-500/40 transition-colors">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-orange-400" />
                </div>
                <div>
                  <p className="font-semibold text-white">{stats.payments.overdue} payments overdue (${stats.payments.overdueTotal.toFixed(0)} total)</p>
                  <p className="text-sm text-white/60">Send payment reminders to collect revenue</p>
                </div>
              </div>
              <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
                Send Reminders
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 hover:border-primary/40 transition-colors">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-white">"HIIT Bootcamp" has 92% completion rate</p>
                  <p className="text-sm text-white/60">Your best performing program - promote it more</p>
                </div>
              </div>
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-black">
                View Program
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Revenue Intelligence
          </h2>
          <ShareToSocial
            data={{
              title: "Monthly Recurring Revenue",
              value: `$${stats.revenue.thisMonth.toFixed(0)}`,
              subtitle: `${stats.revenue.change >= 0 ? '+' : ''}${stats.revenue.change.toFixed(1)}% vs last month`,
              gradient: "bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600",
            }}
            platform="all"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="relative overflow-hidden border-0 rounded-3xl bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.1),transparent)]"></div>
            <CardContent className="relative p-6 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-white/80">Monthly Recurring Revenue</p>
                <TrendingUp className="h-4 w-4 text-white/60" />
              </div>
              <div>
                <p className="text-4xl font-bold text-white">${stats.revenue.thisMonth.toFixed(0)}</p>
                <div className="flex items-center gap-1 mt-2">
                  {stats.revenue.change >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-white" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-white" />
                  )}
                  <p className="text-sm text-white/90">{stats.revenue.change >= 0 ? '+' : ''}{stats.revenue.change.toFixed(1)}% vs last month</p>
                </div>
              </div>
              <div className="pt-2 border-t border-white/20">
                <p className="text-xs text-white/70">Forecast: ${stats.revenue.forecast.toFixed(0)} next month</p>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 rounded-3xl bg-gradient-to-br from-red-500 via-rose-500 to-pink-600">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.1),transparent)]"></div>
            <CardContent className="relative p-6 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-white/80">Churn Rate</p>
                <TrendingDown className="h-4 w-4 text-white/60" />
              </div>
              <div>
                <p className="text-4xl font-bold text-white">{stats.churn.rate.toFixed(1)}%</p>
                <div className="flex items-center gap-1 mt-2">
                  {(stats.churn.rate - stats.churn.previousRate) >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-white" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-white" />
                  )}
                  <p className="text-sm text-white/90">{(stats.churn.rate - stats.churn.previousRate) >= 0 ? '+' : ''}{(stats.churn.rate - stats.churn.previousRate).toFixed(1)}% vs last month</p>
                </div>
              </div>
              <div className="pt-2 border-t border-white/20">
                <p className="text-xs text-white/70">Industry avg: 5-7%</p>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 rounded-3xl bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.1),transparent)]"></div>
            <CardContent className="relative p-6 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-white/80">Avg Client Lifetime Value</p>
                <Users className="h-4 w-4 text-white/60" />
              </div>
              <div>
                <p className="text-4xl font-bold text-white">${stats.clients.ltv.toFixed(0)}</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="h-3 w-3 text-white" />
                  <p className="text-sm text-white/90">Based on current data</p>
                </div>
              </div>
              <div className="pt-2 border-t border-white/20">
                <p className="text-xs text-white/70">Avg retention: 8.2 months</p>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 rounded-3xl bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.1),transparent)]"></div>
            <CardContent className="relative p-6 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-white/80">Outstanding Payments</p>
                <AlertTriangle className="h-4 w-4 text-white/60" />
              </div>
              <div>
                <p className="text-4xl font-bold text-white">${stats.payments.overdueTotal.toFixed(0)}</p>
                <div className="flex items-center gap-1 mt-2">
                  <Clock className="h-3 w-3 text-white" />
                  <p className="text-sm text-white/90">{stats.payments.overdue} clients overdue</p>
                </div>
              </div>
              <div className="pt-2 border-t border-white/20">
                <p className="text-xs text-white/70">Collection rate: 96.8%</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Referral Rewards Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            Referral Rewards
          </h2>
        </div>

        {/* Referral Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-gradient-to-br from-card to-card/50 border-primary/20 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-primary" />
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs">
                Total
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-primary">{referralStats.totalInvites}</p>
              <p className="text-xs text-muted-foreground">Invites Sent</p>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-card to-card/50 border-accent/20 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-accent" />
              <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20 text-xs">
                Active
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-accent">{referralStats.activeReferrals}</p>
              <p className="text-xs text-muted-foreground">Active Referrals</p>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-card to-card/50 border-primary/20 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-primary" />
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs">
                Credits
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-primary">${referralStats.creditsEarned}</p>
              <p className="text-xs text-muted-foreground">Credits Earned</p>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-card to-card/50 border-accent/20 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-5 h-5 text-accent" />
              <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20 text-xs">
                Free
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-accent">{referralStats.freeMonthsEarned}</p>
              <p className="text-xs text-muted-foreground">Free Months</p>
            </div>
          </Card>
        </div>

        {/* Referral Link & Milestones */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-primary/20 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-foreground mb-4">Your Referral Link</h3>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={referralLink}
                  readOnly
                  className="bg-background/50 border-primary/20 text-foreground font-mono text-sm"
                />
                <Button onClick={copyToClipboard} className="bg-primary hover:bg-primary/90 flex-shrink-0">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Quick Share</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => shareToSocial("instagram")}
                    className="border-primary/20 hover:bg-primary/10"
                  >
                    <Instagram className="w-4 h-4 mr-2" />
                    Instagram
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => shareToSocial("threads")}
                    className="border-primary/20 hover:bg-primary/10"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Threads
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => shareToSocial("whatsapp")}
                    className="border-primary/20 hover:bg-primary/10"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    WhatsApp
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => shareToSocial("email")}
                    className="border-primary/20 hover:bg-primary/10"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-primary/20 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Multiplier Bonuses</h3>
            </div>
            <div className="space-y-3">
              {milestones.map((milestone, index) => (
                <div
                  key={index}
                  className={cn(
                    "p-3 rounded-lg border transition-all duration-300",
                    milestone.achieved ? "bg-primary/10 border-primary/30" : "bg-card/50 border-border",
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge
                      variant={milestone.achieved ? "default" : "secondary"}
                      className={cn(
                        "text-xs",
                        milestone.achieved
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground",
                      )}
                    >
                      {milestone.count} Referrals
                    </Badge>
                    {milestone.achieved && <Award className="w-4 h-4 text-primary" />}
                  </div>

                  <p className="text-sm font-medium text-foreground mb-2">{milestone.reward}</p>

                  {!milestone.achieved && milestone.progress !== undefined && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span>
                          {milestone.progress}/{milestone.count}
                        </span>
                      </div>
                      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                          style={{ width: `${(milestone.progress / milestone.count) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {milestone.achieved && (
                    <div className="flex items-center gap-2 text-xs text-primary">
                      <Check className="w-3 h-3" />
                      <span>Unlocked!</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Client Health & Engagement
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="relative overflow-hidden border-0 rounded-3xl bg-gradient-to-br from-purple-500 via-violet-500 to-purple-700">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.1),transparent)]"></div>
            <CardContent className="relative p-6 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-white/80">High Engagement</p>
                <CheckCircle2 className="h-4 w-4 text-white/60" />
              </div>
              <div>
                <p className="text-5xl font-bold text-white">{stats.clients.highEngagement}</p>
                <p className="text-sm text-white/70 mt-2">Clients ({stats.clients.total > 0 ? ((stats.clients.highEngagement / stats.clients.total) * 100).toFixed(0) : 0}% of total)</p>
              </div>
              <div className="pt-2 border-t border-white/20 space-y-1">
                <p className="text-xs text-white/70">• 3+ sessions/week</p>
                <p className="text-xs text-white/70">• 90%+ attendance rate</p>
                <p className="text-xs text-white/70">• Active in last 48 hours</p>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 rounded-3xl bg-gradient-to-br from-yellow-500 via-orange-400 to-orange-600">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.1),transparent)]"></div>
            <CardContent className="relative p-6 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-white/80">Medium Engagement</p>
                <AlertTriangle className="h-4 w-4 text-white/60" />
              </div>
              <div>
                <p className="text-5xl font-bold text-white">{stats.clients.mediumEngagement}</p>
                <p className="text-sm text-white/70 mt-2">Clients ({stats.clients.total > 0 ? ((stats.clients.mediumEngagement / stats.clients.total) * 100).toFixed(0) : 0}% of total)</p>
              </div>
              <div className="pt-2 border-t border-white/20 space-y-1">
                <p className="text-xs text-white/70">• 1-2 sessions/week</p>
                <p className="text-xs text-white/70">• 60-80% attendance</p>
                <p className="text-xs text-white/70">• Check in weekly</p>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 rounded-3xl bg-gradient-to-br from-red-500 via-red-600 to-rose-700">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.1),transparent)]"></div>
            <CardContent className="relative p-6 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-white/80">At Risk</p>
                <XCircle className="h-4 w-4 text-white/60" />
              </div>
              <div>
                <p className="text-5xl font-bold text-white">{stats.clients.atRisk}</p>
                <p className="text-sm text-white/70 mt-2">Clients ({stats.clients.total > 0 ? ((stats.clients.atRisk / stats.clients.total) * 100).toFixed(0) : 0}% of total)</p>
              </div>
              <div className="pt-2 border-t border-white/20 space-y-1">
                <p className="text-xs text-white/70">• No sessions in 2+ weeks</p>
                <p className="text-xs text-white/70">• &lt;50% attendance rate</p>
                <p className="text-xs text-white/70">• Immediate action needed</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Operational Insights
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="relative overflow-hidden border-0 rounded-3xl aspect-square group hover:scale-105 transition-transform duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 via-blue-400 to-indigo-600 opacity-90"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.1),transparent)]"></div>
            <CardContent className="relative h-full flex flex-col justify-between p-6">
              <div>
                <p className="text-sm font-medium text-white/80">Session Utilization</p>
                <p className="text-xs text-white/60 mt-0.5">This Week</p>
              </div>
              <div className="space-y-2">
                <div className="relative h-2 w-full bg-white/20 rounded-full overflow-hidden">
                  <div className="absolute inset-y-0 left-0 bg-white rounded-full" style={{ width: `${stats.sessions.utilization}%` }}></div>
                </div>
                <p className="text-5xl font-bold text-white">{stats.sessions.utilization.toFixed(0)}%</p>
              </div>
              <p className="text-sm font-medium text-white/80">{stats.sessions.completed}/{stats.sessions.thisWeek} slots filled</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 rounded-3xl aspect-square group hover:scale-105 transition-transform duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600 opacity-90"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.1),transparent)]"></div>
            <CardContent className="relative h-full flex flex-col justify-between p-6">
              <div>
                <p className="text-sm font-medium text-white/80">Avg Completion Rate</p>
                <p className="text-xs text-white/60 mt-0.5">All Programs</p>
              </div>
              <div className="space-y-2">
                <svg className="w-full h-12 opacity-60" viewBox="0 0 100 50" preserveAspectRatio="none">
                  <path d="M0,40 L25,35 L50,25 L75,20 L100,15" fill="none" stroke="white" strokeWidth="2" />
                </svg>
                <p className="text-5xl font-bold text-white">78%</p>
              </div>
              <p className="text-sm font-medium text-white/80">+5% vs last month</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 rounded-3xl aspect-square group hover:scale-105 transition-transform duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-400 via-rose-500 to-red-600 opacity-90"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.1),transparent)]"></div>
            <CardContent className="relative h-full flex flex-col justify-between p-6">
              <div>
                <p className="text-sm font-medium text-white/80">Peak Booking Time</p>
                <p className="text-xs text-white/60 mt-0.5">Most Popular</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-end justify-center gap-1 h-12">
                  {[3, 4, 5, 7, 11, 9, 6, 4, 3, 2].map((height, i) => (
                    <div
                      key={i}
                      className={`w-2 rounded-t ${i === 4 ? "bg-white" : "bg-white/40"}`}
                      style={{ height: `${height * 4}px` }}
                    ></div>
                  ))}
                </div>
                <p className="text-5xl font-bold text-white">6PM</p>
              </div>
              <p className="text-sm font-medium text-white/80">Mon-Thu evenings</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 rounded-3xl aspect-square group hover:scale-105 transition-transform duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-400 via-purple-500 to-indigo-600 opacity-90"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.1),transparent)]"></div>
            <CardContent className="relative h-full flex flex-col justify-between p-6">
              <div>
                <p className="text-sm font-medium text-white/80">Capacity Available</p>
                <p className="text-xs text-white/60 mt-0.5">Next 7 Days</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-center items-center h-12">
                  <Calendar className="w-12 h-12 text-white/40" />
                </div>
                <p className="text-5xl font-bold text-white">18</p>
              </div>
              <p className="text-sm font-medium text-white/80">Open slots</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
