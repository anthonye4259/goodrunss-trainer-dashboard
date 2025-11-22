"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShareToSocial } from "@/components/share-to-social"
import { Button } from "@/components/ui/button"
import { TrendingUp, Users, DollarSign, Target, Calendar, Activity, Award, CheckCircle2 } from "lucide-react"

export default function SocialPage() {
  const shareableStats = [
    {
      title: "Monthly Revenue",
      value: "$12,450",
      subtitle: "+18% vs last month",
      gradient: "bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600",
      icon: DollarSign,
    },
    {
      title: "Total Clients",
      value: "62",
      subtitle: "Active members",
      gradient: "bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500",
      icon: Users,
    },
    {
      title: "Session Completion",
      value: "87%",
      subtitle: "This week",
      gradient: "bg-gradient-to-br from-purple-500 via-violet-500 to-purple-700",
      icon: Target,
    },
    {
      title: "Client Satisfaction",
      value: "4.7★",
      subtitle: "Average rating",
      gradient: "bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500",
      icon: Award,
    },
    {
      title: "Sessions This Week",
      value: "42",
      subtitle: "48 slots filled",
      gradient: "bg-gradient-to-br from-pink-400 via-rose-500 to-red-600",
      icon: Calendar,
    },
    {
      title: "Client Retention",
      value: "96.8%",
      subtitle: "Last 3 months",
      gradient: "bg-gradient-to-br from-cyan-400 via-blue-400 to-indigo-600",
      icon: Activity,
    },
    {
      title: "Program Completion",
      value: "78%",
      subtitle: "All programs avg",
      gradient: "bg-gradient-to-br from-violet-400 via-purple-500 to-indigo-600",
      icon: CheckCircle2,
    },
    {
      title: "Revenue Growth",
      value: "+18%",
      subtitle: "Month over month",
      gradient: "bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600",
      icon: TrendingUp,
    },
  ]

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 p-6 md:p-8">
      <div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
          Share to <span className="text-primary">Social Media</span>
        </h1>
        <p className="text-white/60 mt-2">
          Share your achievements and stats with your followers on Twitter, Instagram, and Snapchat
        </p>
      </div>

      <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">How it works</CardTitle>
          <CardDescription>Select any stat below to create a shareable graphic for social media</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-primary">1</span>
            </div>
            <div>
              <p className="font-medium text-white">Choose a stat to share</p>
              <p className="text-sm text-white/60">Click any card below to preview your shareable graphic</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-primary">2</span>
            </div>
            <div>
              <p className="font-medium text-white">Choose your platform</p>
              <p className="text-sm text-white/60">
                Share to Twitter, Instagram, or Snapchat directly, or download the image to post manually
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-primary">3</span>
            </div>
            <div>
              <p className="font-medium text-white">Post to your story</p>
              <p className="text-sm text-white/60">Share your success with followers and attract new clients</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-white">Your Shareable Stats</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {shareableStats.map((stat, index) => (
            <Card
              key={index}
              className={`relative overflow-hidden border-0 rounded-3xl ${stat.gradient} cursor-pointer hover:scale-105 transition-transform duration-300`}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.1),transparent)]"></div>
              <CardContent className="relative p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-white/80">{stat.title}</p>
                  <stat.icon className="h-4 w-4 text-white/60" />
                </div>
                <div>
                  <p className="text-4xl font-bold text-white">{stat.value}</p>
                  {stat.subtitle && <p className="text-sm text-white/70 mt-2">{stat.subtitle}</p>}
                </div>
                <ShareToSocial
                  data={{
                    title: stat.title,
                    value: stat.value,
                    subtitle: stat.subtitle,
                    gradient: stat.gradient,
                  }}
                  platform="all"
                  trigger={
                    <Button
                      size="sm"
                      variant="secondary"
                      className="w-full bg-white/20 hover:bg-white/30 text-white border-0"
                    >
                      Share to Social
                    </Button>
                  }
                />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Award className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-white">Pro Tip: Share Consistently</h3>
              <p className="text-sm text-white/70">
                Posting your achievements regularly helps build credibility and attract new clients. Share your weekly
                stats every Monday to show your business growth and client success stories.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
