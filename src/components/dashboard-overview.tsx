"use client"

import { useState } from "react"
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
  Dumbbell,
  FileText,
  Layers,
  Bell,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ShareToSocial } from "@/components/share-to-social"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export function DashboardOverview() {
  const [copied, setCopied] = useState(false)

  const referralLink = "goodrunss.com/ref/coach-mike"
  const referralStats = {
    totalInvites: 12,
    activeReferrals: 8,
    creditsEarned: 120,
    freeMonthsEarned: 3,
  }

  const milestones = [
    { count: 5, reward: '"Pro Verified" Badge', achieved: true },
    { count: 10, reward: "10% Lifetime Discount", achieved: false, progress: 8 },
    { count: 25, reward: "Free Annual Plan", achieved: false, progress: 8 },
  ]

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
    <div className="max-w-[1600px] mx-auto space-y-8 p-6 md:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
            Welcome back, <span className="text-primary">Coach Alex</span>
          </h1>
          <div className="mt-3 flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
              <Star className="h-4 w-4 fill-primary text-primary" />
              <span className="text-sm font-semibold text-primary">4.7 Rating</span>
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
                  <p className="font-semibold text-white">5 clients haven't booked in 2+ weeks</p>
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
                  <p className="font-semibold text-white">3 payments overdue ($450 total)</p>
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

      {/* Quick Actions */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Quick Actions
        </h2>
        <Card className="glass border-border/50">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-3 hover:bg-primary/10 hover:border-primary transition-all"
                onClick={() => window.location.href = '/dashboard/workouts/new'}
              >
                <div className="p-3 rounded-xl bg-primary/20">
                  <Dumbbell className="h-6 w-6 text-primary" />
                </div>
                <div className="text-center">
                  <p className="font-semibold">New Workout</p>
                  <p className="text-xs text-muted-foreground mt-1">Create workout plan</p>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-3 hover:bg-blue-500/10 hover:border-blue-500 transition-all"
                onClick={() => window.location.href = '/dashboard/training-plans'}
              >
                <div className="p-3 rounded-xl bg-blue-500/20">
                  <FileText className="h-6 w-6 text-blue-500" />
                </div>
                <div className="text-center">
                  <p className="font-semibold">Training Plans</p>
                  <p className="text-xs text-muted-foreground mt-1">View all plans</p>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-3 hover:bg-green-500/10 hover:border-green-500 transition-all"
                onClick={() => window.location.href = '/dashboard/programs'}
              >
                <div className="p-3 rounded-xl bg-green-500/20">
                  <Layers className="h-6 w-6 text-green-500" />
                </div>
                <div className="text-center">
                  <p className="font-semibold">Programs</p>
                  <p className="text-xs text-muted-foreground mt-1">Manage programs</p>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-3 hover:bg-orange-500/10 hover:border-orange-500 transition-all"
                onClick={() => window.location.href = '/dashboard/reminders'}
              >
                <div className="p-3 rounded-xl bg-orange-500/20">
                  <Bell className="h-6 w-6 text-orange-500" />
                </div>
                <div className="text-center">
                  <p className="font-semibold">Reminders</p>
                  <p className="text-xs text-muted-foreground mt-1">Set reminders</p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
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
              value: "$12,450",
              subtitle: "+18% vs last month",
              gradient: "bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600",
            }}
            platform="both"
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
                <p className="text-4xl font-bold text-white">$12,450</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="h-3 w-3 text-white" />
                  <p className="text-sm text-white/90">+18% vs last month</p>
                </div>
              </div>
              <div className="pt-2 border-t border-white/20">
                <p className="text-xs text-white/70">Forecast: $14,200 next month</p>
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
                <p className="text-4xl font-bold text-white">3.2%</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingDown className="h-3 w-3 text-white" />
                  <p className="text-sm text-white/90">+0.8% vs last month</p>
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
                <p className="text-4xl font-bold text-white">$2,840</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="h-3 w-3 text-white" />
                  <p className="text-sm text-white/90">+12% vs last quarter</p>
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
                <p className="text-4xl font-bold text-white">$450</p>
                <div className="flex items-center gap-1 mt-2">
                  <Clock className="h-3 w-3 text-white" />
                  <p className="text-sm text-white/90">3 clients overdue</p>
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
                <p className="text-5xl font-bold text-white">42</p>
                <p className="text-sm text-white/70 mt-2">Clients (68% of total)</p>
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
                <p className="text-5xl font-bold text-white">15</p>
                <p className="text-sm text-white/70 mt-2">Clients (24% of total)</p>
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
                <p className="text-5xl font-bold text-white">5</p>
                <p className="text-sm text-white/70 mt-2">Clients (8% of total)</p>
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
                  <div className="absolute inset-y-0 left-0 bg-white rounded-full" style={{ width: "87%" }}></div>
                </div>
                <p className="text-5xl font-bold text-white">87%</p>
              </div>
              <p className="text-sm font-medium text-white/80">42/48 slots filled</p>
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
