"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, Users, DollarSign, Calendar, Target, Award } from "lucide-react"
import { Line, LineChart, Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const revenueData = [
  { month: "Jan", revenue: 8500 },
  { month: "Feb", revenue: 9200 },
  { month: "Mar", revenue: 8800 },
  { month: "Apr", revenue: 10500 },
  { month: "May", revenue: 11200 },
  { month: "Jun", revenue: 12800 },
]

const sessionData = [
  { month: "Jan", sessions: 52 },
  { month: "Feb", sessions: 58 },
  { month: "Mar", sessions: 54 },
  { month: "Apr", sessions: 67 },
  { month: "May", sessions: 72 },
  { month: "Jun", sessions: 81 },
]

const clientGrowthData = [
  { month: "Jan", clients: 18 },
  { month: "Feb", clients: 22 },
  { month: "Mar", clients: 24 },
  { month: "Apr", clients: 28 },
  { month: "May", clients: 32 },
  { month: "Jun", clients: 36 },
]

export default function AnalyticsPage() {
  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-balance">Analytics & Insights</h1>
          <p className="mt-2 text-muted-foreground">Track your performance and business growth</p>
        </div>
        <Select defaultValue="6months">
          <SelectTrigger className="w-[180px] bg-card">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30days">Last 30 Days</SelectItem>
            <SelectItem value="3months">Last 3 Months</SelectItem>
            <SelectItem value="6months">Last 6 Months</SelectItem>
            <SelectItem value="1year">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="glass border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-3xl font-bold text-primary">$61,000</p>
                <p className="text-xs text-green-500 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +18% from last period
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Sessions</p>
                <p className="text-3xl font-bold">384</p>
                <p className="text-xs text-green-500 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +24% from last period
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20">
                <Calendar className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Active Clients</p>
                <p className="text-3xl font-bold">36</p>
                <p className="text-xs text-green-500 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +14 new this period
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/20">
                <Users className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Revenue Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              revenue: {
                label: "Revenue",
                color: "hsl(var(--primary))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--primary))", r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Sessions and Client Growth */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Sessions Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                sessions: {
                  label: "Sessions",
                  color: "hsl(var(--primary))",
                },
              }}
              className="h-[250px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sessionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="sessions" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Client Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                clients: {
                  label: "Clients",
                  color: "hsl(var(--primary))",
                },
              }}
              className="h-[250px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={clientGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="clients"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--primary))", r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Performance Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Monthly Revenue Goal</span>
                <span className="font-semibold">$12,800 / $15,000</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: "85%" }} />
              </div>
              <p className="text-xs text-muted-foreground">85% complete</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Session Goal</span>
                <span className="font-semibold">81 / 90</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: "90%" }} />
              </div>
              <p className="text-xs text-muted-foreground">90% complete</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">New Clients Goal</span>
                <span className="font-semibold">14 / 20</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: "70%" }} />
              </div>
              <p className="text-xs text-muted-foreground">70% complete</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Top Performing Sports
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-card/50 border border-border/50">
              <div>
                <p className="font-semibold">Basketball</p>
                <p className="text-sm text-muted-foreground">128 sessions</p>
              </div>
              <p className="text-2xl font-bold text-primary">$19,200</p>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-card/50 border border-border/50">
              <div>
                <p className="font-semibold">Tennis</p>
                <p className="text-sm text-muted-foreground">96 sessions</p>
              </div>
              <p className="text-2xl font-bold">$14,400</p>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-card/50 border border-border/50">
              <div>
                <p className="font-semibold">Running</p>
                <p className="text-sm text-muted-foreground">84 sessions</p>
              </div>
              <p className="text-2xl font-bold">$15,120</p>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-card/50 border border-border/50">
              <div>
                <p className="font-semibold">Soccer</p>
                <p className="text-sm text-muted-foreground">76 sessions</p>
              </div>
              <p className="text-2xl font-bold">$11,400</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
