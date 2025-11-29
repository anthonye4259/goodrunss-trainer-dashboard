"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, DollarSign, Users, Star, Edit, Eye, EyeOff, BarChart3 } from "lucide-react"
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"

export default function MyPersonaPage() {
  const [isDiscoverable, setIsDiscoverable] = useState(true)

  // Mock data
  const personaData = {
    name: "Coach Mike's Speed Training AI",
    specialty: "Basketball",
    tone: "Motivational & Energetic",
    drillFocus: "Speed, Agility, Explosiveness",
    totalSessions: 247,
    totalEarnings: 864.5,
    avgRating: 4.8,
    activeUsers: 42,
  }

  const earningsData = [
    { month: "Jan", earnings: 120 },
    { month: "Feb", earnings: 180 },
    { month: "Mar", earnings: 240 },
    { month: "Apr", earnings: 324.5 },
  ]

  const usageData = [
    { day: "Mon", sessions: 8 },
    { day: "Tue", sessions: 12 },
    { day: "Wed", sessions: 15 },
    { day: "Thu", sessions: 10 },
    { day: "Fri", sessions: 14 },
    { day: "Sat", sessions: 18 },
    { day: "Sun", sessions: 16 },
  ]

  const recentFeedback = [
    { user: "Player #1234", rating: 5, comment: "Amazing AI coach! Feels like training with a real person." },
    { user: "Player #5678", rating: 5, comment: "The drills are perfect for my skill level. Love it!" },
    { user: "Player #9012", rating: 4, comment: "Great experience, very motivating coaching style." },
  ]

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">My AI Persona</h1>
            <p className="text-muted-foreground">Manage your AI coaching persona and track performance</p>
          </div>
          <Button>
            <Edit className="w-4 h-4 mr-2" />
            Edit Persona
          </Button>
        </div>

        {/* Persona Overview Card */}
        <Card className="p-6 mb-8 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <User className="w-10 h-10 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2">{personaData.name}</h2>
              <div className="flex flex-wrap gap-4 text-sm">
                <span className="text-primary font-medium">{personaData.specialty}</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">{personaData.tone}</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">{personaData.drillFocus}</span>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-medium text-white">{personaData.avgRating}</span>
                </div>
                <span className="text-sm text-muted-foreground">({personaData.totalSessions} sessions)</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Label htmlFor="discoverable" className="text-sm text-muted-foreground">
                {isDiscoverable ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </Label>
              <Switch id="discoverable" checked={isDiscoverable} onCheckedChange={setIsDiscoverable} />
              <span className="text-sm font-medium text-white">{isDiscoverable ? "Discoverable" : "Hidden"}</span>
            </div>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total Earnings</span>
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <p className="text-3xl font-bold text-white">${personaData.totalEarnings}</p>
            <p className="text-xs text-muted-foreground mt-1">+$324.50 this month</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total Sessions</span>
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <p className="text-3xl font-bold text-white">{personaData.totalSessions}</p>
            <p className="text-xs text-muted-foreground mt-1">+93 this month</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Active Users</span>
              <Users className="w-5 h-5 text-primary" />
            </div>
            <p className="text-3xl font-bold text-white">{personaData.activeUsers}</p>
            <p className="text-xs text-muted-foreground mt-1">+12 this month</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Avg Rating</span>
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            </div>
            <p className="text-3xl font-bold text-white">{personaData.avgRating}</p>
            <p className="text-xs text-muted-foreground mt-1">Based on {personaData.totalSessions} reviews</p>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-3 gap-2">
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Weekly Session Activity</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={usageData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="sessions" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </TabsContent>

          <TabsContent value="earnings" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Earnings Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={earningsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="earnings"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--primary))", r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Earnings Breakdown</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Per Session Rate</span>
                  <span className="text-sm font-medium text-white">$3.50 (70%)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Platform Fee</span>
                  <span className="text-sm font-medium text-white">$1.50 (30%)</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-border">
                  <span className="text-sm font-semibold text-white">Total This Month</span>
                  <span className="text-lg font-bold text-primary">$324.50</span>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="feedback" className="space-y-6">
            <div className="space-y-4">
              {recentFeedback.map((feedback, index) => (
                <Card key={index} className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-sm font-medium text-white">{feedback.user}</span>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < feedback.rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{feedback.comment}</p>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
