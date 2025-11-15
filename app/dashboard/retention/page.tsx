"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, TrendingDown, Users, MessageSquare, Calendar, CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface RetentionAlert {
  id: string
  clientName: string
  riskLevel: "high" | "medium" | "low"
  lastSession: string
  daysSinceLastSession: number
  sessionsThisMonth: number
  engagementScore: number
  issues: string[]
  recommendation: string
}

export default function RetentionPage() {
  const { toast } = useToast()
  const [alerts] = useState<RetentionAlert[]>([
    {
      id: "1",
      clientName: "Sarah Johnson",
      riskLevel: "high",
      lastSession: "2025-01-05",
      daysSinceLastSession: 7,
      sessionsThisMonth: 1,
      engagementScore: 35,
      issues: ["Low session frequency", "Missed last 2 scheduled sessions", "No check-in responses"],
      recommendation: "Schedule a check-in call to understand barriers",
    },
    {
      id: "2",
      clientName: "Mike Chen",
      riskLevel: "medium",
      lastSession: "2025-01-10",
      daysSinceLastSession: 2,
      sessionsThisMonth: 3,
      engagementScore: 65,
      issues: ["Declining session frequency", "Recent goal progress stalled"],
      recommendation: "Review and adjust training program",
    },
  ])

  const handleReach = (clientName: string) => {
    toast({
      title: "Reaching out",
      description: `Automated message sent to ${clientName}`,
    })
  }

  const highRisk = alerts.filter((a) => a.riskLevel === "high").length
  const mediumRisk = alerts.filter((a) => a.riskLevel === "medium").length
  const avgEngagement = Math.round(alerts.reduce((sum, a) => sum + a.engagementScore, 0) / alerts.length)

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Client Retention Alerts</h1>
          <p className="text-muted-foreground mt-1">Monitor client engagement and prevent churn</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-6 border-red-500/50 bg-red-500/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">High Risk</p>
                <p className="text-2xl font-bold text-white">{highRisk}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 border-yellow-500/50 bg-yellow-500/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Medium Risk</p>
                <p className="text-2xl font-bold text-white">{mediumRisk}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Engagement</p>
                <p className="text-2xl font-bold text-white">{avgEngagement}%</p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="border-2 border-border">
          <div className="p-4 border-b border-border">
            <h2 className="text-lg font-semibold text-white">At-Risk Clients</h2>
          </div>
          <div className="divide-y divide-border">
            {alerts.map((alert) => (
              <div key={alert.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-lg">{alert.clientName}</h3>
                      <p className="text-sm text-muted-foreground">
                        Last session: {alert.lastSession} ({alert.daysSinceLastSession} days ago)
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      alert.riskLevel === "high"
                        ? "destructive"
                        : alert.riskLevel === "medium"
                          ? "default"
                          : "secondary"
                    }
                    className="capitalize"
                  >
                    {alert.riskLevel} Risk
                  </Badge>
                </div>

                <div className="grid gap-4 md:grid-cols-2 mb-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Engagement Score</span>
                      <span className="text-sm font-semibold text-white">{alert.engagementScore}%</span>
                    </div>
                    <Progress value={alert.engagementScore} />
                  </div>
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-xs text-muted-foreground">Sessions This Month</p>
                      <p className="text-2xl font-bold text-white">{alert.sessionsThisMonth}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Days Since Last</p>
                      <p className="text-2xl font-bold text-white">{alert.daysSinceLastSession}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/30 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" /> Identified Issues
                  </h4>
                  <ul className="space-y-1">
                    {alert.issues.map((issue, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-red-500 mt-1">•</span>
                        <span>{issue}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" /> Recommended Action
                  </h4>
                  <p className="text-sm text-muted-foreground">{alert.recommendation}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => handleReach(alert.clientName)}
                    className="bg-primary hover:bg-primary/90 text-black"
                  >
                    <MessageSquare className="mr-2 h-4 w-4" /> Send Check-in
                  </Button>
                  <Button variant="outline">
                    <Calendar className="mr-2 h-4 w-4" /> Schedule Session
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
