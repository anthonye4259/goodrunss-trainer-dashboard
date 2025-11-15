"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Copy,
  Check,
  QrCode,
  Gift,
  Users,
  TrendingUp,
  Award,
  Instagram,
  MessageCircle,
  Mail,
  Share2,
  DollarSign,
  Calendar,
  Trophy,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function ReferralsPage() {
  const [copied, setCopied] = useState(false)
  const [showQR, setShowQR] = useState(false)

  // Mock data - replace with real data from your backend
  const referralLink = "goodrunss.com/ref/coach-mike"
  const stats = {
    totalInvites: 12,
    activeReferrals: 8,
    creditsEarned: 120,
    freeMonthsEarned: 3,
  }

  const referralHistory = [
    { name: "Sarah Johnson", type: "Trainer", status: "Active", reward: "$40", date: "2025-10-28" },
    { name: "Mike Chen", type: "Player", status: "Active", reward: "$10", date: "2025-10-25" },
    { name: "Elite Fitness Center", type: "Facility", status: "Pending", reward: "$80", date: "2025-10-22" },
    { name: "Alex Rivera", type: "Trainer", status: "Active", reward: "$40", date: "2025-10-20" },
    { name: "Emma Davis", type: "Player", status: "Active", reward: "$10", date: "2025-10-18" },
  ]

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
      instagram: `https://www.instagram.com/`, // Instagram doesn't support direct sharing URLs
      whatsapp: `https://wa.me/?text=${text}%20${url}`,
      email: `mailto:?subject=Join%20GoodRunss&body=${text}%20${url}`,
      threads: `https://www.threads.net/`, // Threads doesn't support direct sharing URLs
    }

    if (platform === "instagram" || platform === "threads") {
      copyToClipboard()
      alert(`Link copied! Paste it in your ${platform} post.`)
    } else {
      window.open(urls[platform], "_blank")
    }
  }

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25">
            <Gift className="w-6 h-6 text-background" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Referral Rewards
            </h1>
            <p className="text-muted-foreground">Turn every connection into growth. Earn rewards for every referral.</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-primary/20 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-5 h-5 text-primary" />
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              Total
            </Badge>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold text-primary">{stats.totalInvites}</p>
            <p className="text-sm text-muted-foreground">Invites Sent</p>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-accent/20 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-accent" />
            <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
              Active
            </Badge>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold text-accent">{stats.activeReferrals}</p>
            <p className="text-sm text-muted-foreground">Active Referrals</p>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-primary/20 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-5 h-5 text-primary" />
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              Credits
            </Badge>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold text-primary">${stats.creditsEarned}</p>
            <p className="text-sm text-muted-foreground">Credits Earned</p>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-accent/20 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-5 h-5 text-accent" />
            <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
              Free
            </Badge>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold text-accent">{stats.freeMonthsEarned}</p>
            <p className="text-sm text-muted-foreground">Free Months</p>
          </div>
        </Card>
      </div>

      {/* Referral Link & QR Code */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6 bg-gradient-to-br from-card to-card/50 border-primary/20 backdrop-blur-sm">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">Your Referral Link</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowQR(!showQR)}
                className="border-primary/20 hover:bg-primary/10"
              >
                <QrCode className="w-4 h-4 mr-2" />
                {showQR ? "Hide" : "Show"} QR
              </Button>
            </div>

            <div className="flex gap-2">
              <Input
                value={referralLink}
                readOnly
                className="bg-background/50 border-primary/20 text-foreground font-mono"
              />
              <Button onClick={copyToClipboard} className="bg-primary hover:bg-primary/90 flex-shrink-0">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>

            {showQR && (
              <div className="flex justify-center p-6 bg-background/50 rounded-lg border border-primary/20">
                <div className="w-48 h-48 bg-white rounded-lg flex items-center justify-center">
                  <div className="text-center text-sm text-gray-600">
                    <QrCode className="w-32 h-32 mx-auto mb-2" />
                    <p>QR Code</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Share on Social Media</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => shareToSocial("instagram")}
                  className="flex-1 border-primary/20 hover:bg-primary/10"
                >
                  <Instagram className="w-4 h-4 mr-2" />
                  Instagram
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => shareToSocial("threads")}
                  className="flex-1 border-primary/20 hover:bg-primary/10"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Threads
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => shareToSocial("whatsapp")}
                  className="flex-1 border-primary/20 hover:bg-primary/10"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => shareToSocial("email")}
                  className="flex-1 border-primary/20 hover:bg-primary/10"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Reward Rules */}
        <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-primary/20 backdrop-blur-sm">
          <h2 className="text-xl font-semibold text-foreground mb-4">Reward Rules</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Users className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground">New Trainer</p>
                <p className="text-xs text-muted-foreground">1 free month or $40 credit</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/5 border border-accent/10">
              <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                <Users className="w-4 h-4 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground">Player/Client</p>
                <p className="text-xs text-muted-foreground">$10 credit or half-month</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Zap className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground">Facility</p>
                <p className="text-xs text-muted-foreground">2 free months or $80 credit</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Multiplier Bonuses */}
      <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-primary/20 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-6">
          <Trophy className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Multiplier Bonuses</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {milestones.map((milestone, index) => (
            <div
              key={index}
              className={cn(
                "p-4 rounded-lg border transition-all duration-300",
                milestone.achieved
                  ? "bg-primary/10 border-primary/30 shadow-lg shadow-primary/10"
                  : "bg-card/50 border-border hover:border-primary/20",
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <Badge
                  variant={milestone.achieved ? "default" : "secondary"}
                  className={cn(
                    milestone.achieved
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground",
                  )}
                >
                  {milestone.count} Referrals
                </Badge>
                {milestone.achieved && <Award className="w-5 h-5 text-primary" />}
              </div>

              <p className="font-medium text-foreground mb-3">{milestone.reward}</p>

              {!milestone.achieved && milestone.progress !== undefined && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span>
                      {milestone.progress}/{milestone.count}
                    </span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                      style={{ width: `${(milestone.progress / milestone.count) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {milestone.achieved && (
                <div className="flex items-center gap-2 text-sm text-primary">
                  <Check className="w-4 h-4" />
                  <span>Unlocked!</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Referral History */}
      <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-primary/20 backdrop-blur-sm">
        <h2 className="text-xl font-semibold text-foreground mb-4">Referral History</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Name</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Type</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Reward</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody>
              {referralHistory.map((referral, index) => (
                <tr key={index} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                  <td className="py-3 px-4 text-sm text-foreground">{referral.name}</td>
                  <td className="py-3 px-4">
                    <Badge variant="outline" className="border-primary/20 text-primary">
                      {referral.type}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Badge
                      variant={referral.status === "Active" ? "default" : "secondary"}
                      className={cn(
                        referral.status === "Active"
                          ? "bg-primary/20 text-primary border-primary/30"
                          : "bg-secondary text-secondary-foreground",
                      )}
                    >
                      {referral.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-sm font-medium text-primary">{referral.reward}</td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">{referral.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
