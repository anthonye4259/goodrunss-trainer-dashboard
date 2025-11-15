"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { TrendingUp, Users, Calendar, DollarSign, Award, Target, Download } from "lucide-react"
import {
  Line,
  LineChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Pie,
  PieChart,
  Cell,
} from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"

// Mock analytics data
const revenueData = [
  { month: "Jul", revenue: 4200, sessions: 28 },
  { month: "Aug", revenue: 5100, sessions: 34 },
  { month: "Sep", revenue: 4800, sessions: 32 },
  { month: "Oct", revenue: 6200, sessions: 41 },
  { month: "Nov", revenue: 7100, sessions: 47 },
  { month: "Dec", revenue: 8400, sessions: 56 },
  { month: "Jan", revenue: 9850, sessions: 67 },
]

const sessionCompletionData = [
  { week: "Week 1", completed: 12, cancelled: 2 },
  { week: "Week 2", completed: 15, cancelled: 1 },
  { week: "Week 3", completed: 18, cancelled: 3 },
  { week: "Week 4", completed: 22, cancelled: 1 },
]

const clientGrowthData = [
  { month: "Jul", clients: 18 },
  { month: "Aug", clients: 22 },
  { month: "Sep", clients: 25 },
  { month: "Oct", clients: 31 },
  { month: "Nov", clients: 38 },
  { month: "Dec", clients: 45 },
  { month: "Jan", clients: 52 },
]

const popularProgramsData = [
  { name: "Strength Training", sessions: 145, color: "hsl(var(--primary))" },
  { name: "Cardio Blast", sessions: 98, color: "hsl(var(--chart-2))" },
  { name: "HIIT Workout", sessions: 87, color: "hsl(var(--chart-3))" },
  { name: "Flexibility", sessions: 56, color: "hsl(var(--chart-4))" },
  { name: "Sports Specific", sessions: 42, color: "hsl(var(--chart-5))" },
]

const retentionData = [
  { month: "Jul", retained: 95, churned: 5 },
  { month: "Aug", retained: 93, churned: 7 },
  { month: "Sep", retained: 96, churned: 4 },
  { month: "Oct", retained: 94, churned: 6 },
  { month: "Nov", retained: 97, churned: 3 },
  { month: "Dec", retained: 95, churned: 5 },
  { month: "Jan", retained: 98, churned: 2 },
]

export default function AnalyticsPage() {
  const [timePeriod, setTimePeriod] = useState("6months")

  const handleExport = () => {
    console.log("[v0] Exporting analytics data...")
  }

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Analytics</h1>
          <p className="mt-2 text-muted-foreground">Track your performance and growth</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timePeriod} onValueChange={setTimePeriod}>
            <SelectTrigger className="w-[180px] bg-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2 bg-transparent" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="glass border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">$45,650</div>
            <p className="text-xs text-primary mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +24% from last period
            </p>
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
            <div className="text-3xl font-bold">52</div>
            <p className="text-xs text-primary mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +15% from last period
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
            <div className="text-3xl font-bold">305</div>
            <p className="text-xs text-primary mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +18% from last period
            </p>
          </CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4" />
              Avg Session Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$149</div>
            <p className="text-xs text-primary mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +8% from last period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trend */}
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

      {/* Session Completion & Client Growth */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Session Completion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                completed: {
                  label: "Completed",
                  color: "hsl(var(--primary))",
                },
                cancelled: {
                  label: "Cancelled",
                  color: "hsl(var(--destructive))",
                },
              }}
              className="h-[250px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sessionCompletionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="completed" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="cancelled" fill="hsl(var(--destructive))" radius={[8, 8, 0, 0]} />
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
                  color: "hsl(var(--chart-2))",
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
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--chart-2))", r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Popular Programs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                sessions: {
                  label: "Sessions",
                },
              }}
              className="h-[250px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={popularProgramsData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="sessions"
                  >
                    {popularProgramsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Client Retention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                retained: {
                  label: "Retained",
                  color: "hsl(var(--primary))",
                },
                churned: {
                  label: "Churned",
                  color: "hsl(var(--destructive))",
                },
              }}
              className="h-[250px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={retentionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={(props: any) => <ChartLegendContent {...props} />} />
                  <Bar dataKey="retained" stackId="a" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="churned" stackId="a" fill="hsl(var(--destructive))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
