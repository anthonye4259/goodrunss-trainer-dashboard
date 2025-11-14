"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Calendar, DollarSign, TrendingUp, Plus, MessageSquare } from 'lucide-react'
import Link from "next/link"
import { Line, LineChart, Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface DashboardStats {
  totalClients: number
  clientsThisMonth: number
  sessionsThisWeek: number
  sessionsChange: number
  revenueThisMonth: number
  revenueChange: number
  completionRate: number
  completionRateChange: number
}

interface ChartData {
  revenueByDay: Array<{ day: string; amount: number }>
  sessionsByDay: Array<{ day: string; sessions: number }>
}

const getSpecialtyEmoji = (specialty: string): string => {
  const emojiMap: Record<string, string> = {
    basketball: '🏀',
    pickleball: '🏓',
    tennis: '🎾',
    volleyball: '🏐',
    yoga: '🧘‍♀️',
    pilates: '🤸‍♀️',
    barre: '💃',
    strength_training: '💪',
    hiit: '⚡',
    crossfit: '🏋️‍♀️',
    running: '🏃‍♀️',
    cycling: '🚴‍♀️',
    swimming: '🏊‍♀️',
    martial_arts: '🥋',
    boxing: '🥊',
    dance: '💃',
    soccer: '⚽',
    golf: '⛳',
    nutrition: '🥗',
    wellness: '🌿',
  }
  return emojiMap[specialty.toLowerCase().replace(/\s+/g, '_')] || '💪'
}

const formatSpecialtyName = (specialty: string): string => {
  return specialty
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export default function DashboardPage() {
  const [userName, setUserName] = useState("Coach")
  const [userSpecialty, setUserSpecialty] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    clientsThisMonth: 0,
    sessionsThisWeek: 0,
    sessionsChange: 0,
    revenueThisMonth: 0,
    revenueChange: 0,
    completionRate: 0,
    completionRateChange: 0,
  })
  const [charts, setCharts] = useState<ChartData>({
    revenueByDay: [],
    sessionsByDay: []
  })
  
  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // Fetch user profile
        const userResponse = await fetch('/api/user/profile')
        const userData = await userResponse.json()
        
        if (userData.success && userData.user) {
          setUserName(userData.user.name || "Coach")
          setUserSpecialty(userData.user.specialties?.[0] || "")
        }

        // Fetch dashboard stats
        const statsResponse = await fetch('/api/dashboard/stats')
        const statsData = await statsResponse.json()
        
        if (statsData.success) {
          setStats(statsData.stats)
          setCharts(statsData.charts)
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchDashboardData()
  }, [])
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome Back, <span className="text-primary">{userName}</span>!
          </h1>
          <div className="flex items-center gap-2 mt-2">
            {userSpecialty && (
              <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 flex items-center gap-1.5">
                <span className="text-lg">{getSpecialtyEmoji(userSpecialty)}</span>
                <span className="text-sm font-semibold text-primary">
                  {formatSpecialtyName(userSpecialty)} Specialist
                </span>
              </div>
            )}
            <p className="text-muted-foreground">Here's what's happening with your training business</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/calendar">
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Schedule Session
            </Button>
          </Link>
          <Link href="/dashboard/clients">
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Client
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                <div className="h-4 w-4 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2" />
                <div className="h-3 w-20 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Clients</CardTitle>
              <Users className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.totalClients}</div>
              <p className={`text-xs mt-1 ${stats.clientsThisMonth >= 0 ? 'text-primary' : 'text-destructive'}`}>
                +{stats.clientsThisMonth} this month
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Sessions This Week</CardTitle>
              <Calendar className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.sessionsThisWeek}</div>
              <p className={`text-xs mt-1 ${stats.sessionsChange >= 0 ? 'text-primary' : 'text-destructive'}`}>
                {stats.sessionsChange >= 0 ? '+' : ''}{stats.sessionsChange}% from last week
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Revenue This Month</CardTitle>
              <DollarSign className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                ${stats.revenueThisMonth.toLocaleString()}
              </div>
              <p className={`text-xs mt-1 ${stats.revenueChange >= 0 ? 'text-primary' : 'text-destructive'}`}>
                {stats.revenueChange >= 0 ? '+' : ''}{stats.revenueChange}% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completion Rate</CardTitle>
              <TrendingUp className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.completionRate}%</div>
              <p className={`text-xs mt-1 ${stats.completionRateChange >= 0 ? 'text-primary' : 'text-destructive'}`}>
                {stats.completionRateChange >= 0 ? '+' : ''}{stats.completionRateChange}% from last week
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-foreground">Revenue This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                amount: {
                  label: "Revenue",
                  color: "hsl(var(--primary))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.revenueByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <ChartTooltip content={<ChartTooltipContent /> as any} />
                  <Line type="monotone" dataKey="amount" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-foreground">Sessions This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                sessions: {
                  label: "Sessions",
                  color: "hsl(var(--primary))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.sessionsByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <ChartTooltip content={<ChartTooltipContent /> as any} />
                  <Bar dataKey="sessions" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-foreground">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/dashboard/calendar">
            <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
              <Calendar className="w-6 h-6 text-primary" />
              <span>Schedule Session</span>
            </Button>
          </Link>
          <Link href="/dashboard/clients">
            <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
              <Users className="w-6 h-6 text-primary" />
              <span>Manage Clients</span>
            </Button>
          </Link>
          <Link href="/dashboard/gia">
            <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
              <MessageSquare className="w-6 h-6 text-primary" />
              <span>Ask GIA</span>
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
