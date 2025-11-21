"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Users, Calendar, DollarSign, Target, Download, Loader2, AlertCircle } from "lucide-react"

interface AnalyticsData {
  summary: {
    totalRevenue: number
    activeClients: number
    totalSessions: number
    completionRate: number
  }
  growth: {
    revenueGrowth: number
    sessionGrowth: number
  }
  financial: {
    avgRevenuePerSession: number
    avgRevenuePerClient: number
  }
}

export default function AnalyticsPage() {
  const [timePeriod, setTimePeriod] = useState("30")
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = async (range: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/analytics?range=${range}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics')
      }
      
      const data = await response.json()
      setAnalytics(data.analytics)
    } catch (err: any) {
      console.error('Analytics fetch error:', err)
      setError(err.message || 'Failed to load analytics')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics(timePeriod)
  }, [timePeriod])

  const handleExport = async () => {
    try {
      const response = await fetch(`/api/reports?type=summary&range=${timePeriod}&format=csv`)
      
      if (!response.ok) {
        throw new Error('Export failed')
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `analytics_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export error:', error)
      alert('Failed to export analytics')
    }
  }

  const getTimePeriodLabel = (period: string) => {
    const labels: Record<string, string> = {
      '7': 'Last 7 Days',
      '30': 'Last 30 Days',
      '90': 'Last 3 Months',
      '180': 'Last 6 Months',
      '365': 'Last Year'
    }
    return labels[period] || `Last ${period} days`
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Analytics</h1>
            <p className="mt-2 text-muted-foreground">Track your performance and growth</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (error || !analytics) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Analytics</h1>
            <p className="mt-2 text-muted-foreground">Track your performance and growth</p>
          </div>
        </div>
        <Card className="glass border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <div>
                <p className="font-semibold">Failed to load analytics</p>
                <p className="text-sm text-muted-foreground">{error || 'Unknown error'}</p>
              </div>
            </div>
            <Button onClick={() => fetchAnalytics(timePeriod)} className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Analytics</h1>
          <p className="mt-2 text-muted-foreground">Track your performance and growth</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timePeriod} onValueChange={setTimePeriod}>
            <SelectTrigger className="w-[180px] bg-card">
              <SelectValue>{getTimePeriodLabel(timePeriod)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="90">Last 3 Months</SelectItem>
              <SelectItem value="180">Last 6 Months</SelectItem>
              <SelectItem value="365">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2 bg-transparent" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              ${analytics.summary.totalRevenue.toLocaleString()}
            </div>
            {analytics.growth.revenueGrowth !== 0 && (
              <p className={`text-xs mt-1 flex items-center gap-1 ${analytics.growth.revenueGrowth > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {analytics.growth.revenueGrowth > 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {analytics.growth.revenueGrowth > 0 ? '+' : ''}{analytics.growth.revenueGrowth}% from last period
              </p>
            )}
          </CardContent>
        </Card>
        
        <Card className="glass border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Active Clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {analytics.summary.activeClients}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Clients with sessions
            </p>
          </CardContent>
        </Card>
        
        <Card className="glass border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Total Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {analytics.summary.totalSessions}
            </div>
            {analytics.growth.sessionGrowth !== 0 && (
              <p className={`text-xs mt-1 flex items-center gap-1 ${analytics.growth.sessionGrowth > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {analytics.growth.sessionGrowth > 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {analytics.growth.sessionGrowth > 0 ? '+' : ''}{analytics.growth.sessionGrowth}% from last period
              </p>
            )}
          </CardContent>
        </Card>
        
        <Card className="glass border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4" />
              Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {analytics.summary.completionRate}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Sessions completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle>Financial Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-4 rounded-lg bg-secondary/50">
              <div>
                <p className="text-sm text-muted-foreground">Avg Revenue per Session</p>
                <p className="text-2xl font-bold text-primary">
                  ${analytics.financial.avgRevenuePerSession.toFixed(2)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-primary/50" />
            </div>
            <div className="flex justify-between items-center p-4 rounded-lg bg-secondary/50">
              <div>
                <p className="text-sm text-muted-foreground">Avg Revenue per Client</p>
                <p className="text-2xl font-bold text-primary">
                  ${analytics.financial.avgRevenuePerClient.toFixed(2)}
                </p>
              </div>
              <Users className="h-8 w-8 text-primary/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle>Performance Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Revenue Growth</span>
                <span className={`font-semibold ${analytics.growth.revenueGrowth > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {analytics.growth.revenueGrowth > 0 ? '+' : ''}{analytics.growth.revenueGrowth}%
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-primary rounded-full h-2 transition-all"
                  style={{ width: `${Math.min(Math.abs(analytics.growth.revenueGrowth), 100)}%` }}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Session Growth</span>
                <span className={`font-semibold ${analytics.growth.sessionGrowth > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {analytics.growth.sessionGrowth > 0 ? '+' : ''}{analytics.growth.sessionGrowth}%
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-primary rounded-full h-2 transition-all"
                  style={{ width: `${Math.min(Math.abs(analytics.growth.sessionGrowth), 100)}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Completion Rate</span>
                <span className="font-semibold text-primary">
                  {analytics.summary.completionRate}%
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-primary rounded-full h-2 transition-all"
                  style={{ width: `${analytics.summary.completionRate}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button 
              variant="outline" 
              className="w-full justify-start gap-3 h-auto py-4"
              onClick={() => window.location.href = '/dashboard/reports'}
            >
              <Download className="h-5 w-5" />
              <div className="text-left">
                <p className="font-semibold">Generate Report</p>
                <p className="text-xs text-muted-foreground">Create detailed report</p>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start gap-3 h-auto py-4"
              onClick={() => window.location.href = '/dashboard/clients'}
            >
              <Users className="h-5 w-5" />
              <div className="text-left">
                <p className="font-semibold">View Clients</p>
                <p className="text-xs text-muted-foreground">Manage your clients</p>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start gap-3 h-auto py-4"
              onClick={() => window.location.href = '/dashboard/sessions'}
            >
              <Calendar className="h-5 w-5" />
              <div className="text-left">
                <p className="font-semibold">Schedule Session</p>
                <p className="text-xs text-muted-foreground">Book a new session</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
