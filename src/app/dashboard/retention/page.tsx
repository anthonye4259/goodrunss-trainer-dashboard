"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, TrendingDown, Users, Target, Mail, MessageSquare, CheckCircle } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"

export default function RetentionPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [alerts, setAlerts] = useState<any[]>([])

  // Fetch retention alerts on mount
  useEffect(() => {
    async function fetchAlerts() {
      try {
        const response = await fetch('/api/retention')
        const data = await response.json()
        
        if (data.success && data.alerts) {
          setAlerts(data.alerts)
        }
      } catch (error) {
        console.error("Failed to fetch retention alerts:", error)
        toast({
          title: "Error",
          description: "Failed to load retention alerts",
          variant: "destructive",
        })
      } finally {
        setIsLoadingData(false)
      }
    }

    fetchAlerts()
  }, [])

  const handleDismissAlert = async (id: string) => {
    setLoading(true)

    try {
      const response = await fetch(`/api/retention?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'dismissed' }),
      })

      const data = await response.json()

      if (data.success) {
        setAlerts(alerts.filter((alert) => alert.id !== id))
        toast({
          title: "Success",
          description: "Alert dismissed",
        })
      } else {
        throw new Error(data.error || "Failed to dismiss alert")
      }
    } catch (error: any) {
      console.error("Dismiss alert error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to dismiss alert",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleResolveAlert = async (id: string, action: string) => {
    setLoading(true)

    try {
      const response = await fetch(`/api/retention?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'resolved', action_taken: action }),
      })

      const data = await response.json()

      if (data.success) {
        setAlerts(alerts.filter((alert) => alert.id !== id))
        toast({
          title: "Success",
          description: `Alert resolved with action: ${action}`,
        })
      } else {
        throw new Error(data.error || "Failed to resolve alert")
      }
    } catch (error: any) {
      console.error("Resolve alert error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to resolve alert",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const riskColors = {
    high: "text-red-500 bg-red-500/10 border-red-500/20",
    medium: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
    low: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  }

  const severityColors = {
    critical: "text-red-500 bg-red-500/10 border-red-500/20",
    warning: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
    info: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  }

  const highRiskCount = alerts.filter(a => a.severity === 'critical').length
  const mediumRiskCount = alerts.filter(a => a.severity === 'warning').length

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading retention alerts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Client Retention</h1>
        <p className="text-muted-foreground mt-1">Monitor client engagement and prevent churn</p>
      </div>

      {/* Summary Alert */}
      {alerts.length > 0 && (
        <Alert className="border-primary/30 bg-gradient-to-r from-primary/10 to-accent/10">
          <AlertTriangle className="h-4 w-4 text-primary" />
          <AlertDescription>
            You have <strong>{highRiskCount}</strong> high-priority alerts and <strong>{mediumRiskCount}</strong> medium-priority alerts requiring attention.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Critical Alerts</p>
              <p className="text-2xl font-bold text-white">{highRiskCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center">
              <TrendingDown className="h-6 w-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Warning Alerts</p>
              <p className="text-2xl font-bold text-white">{mediumRiskCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Alerts</p>
              <p className="text-2xl font-bold text-white">{alerts.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Alerts List */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Active Retention Alerts</h2>
        {alerts.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
            <p className="text-white font-semibold mb-2">All Clients Are Engaged! 🎉</p>
            <p className="text-muted-foreground">No retention alerts at the moment. Great work!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <Card key={alert.id} className="p-6 bg-muted/30 border-l-4" style={{
                borderLeftColor: alert.severity === 'critical' ? '#ef4444' : 
                                 alert.severity === 'warning' ? '#eab308' : '#3b82f6'
              }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-white text-lg">Client At Risk</h3>
                      <Badge className={severityColors[alert.severity as keyof typeof severityColors] || severityColors.info}>
                        {alert.severity}
                      </Badge>
                      <Badge variant="outline">{alert.alert_type}</Badge>
                    </div>
                    <p className="text-muted-foreground mb-3">{alert.message}</p>
                    {alert.action_suggested && (
                      <div className="mb-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
                        <p className="text-sm text-primary font-medium">💡 Suggested Action:</p>
                        <p className="text-sm text-muted-foreground mt-1">{alert.action_suggested}</p>
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      Triggered {new Date(alert.triggered_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleResolveAlert(alert.id, "sent_message")}
                    disabled={loading}
                    className="bg-primary hover:bg-primary/90 text-black"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleResolveAlert(alert.id, "contacted")}
                    disabled={loading}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Mark Contacted
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDismissAlert(alert.id)}
                    disabled={loading}
                    className="text-muted-foreground hover:text-white"
                  >
                    Dismiss
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      {/* Tips Section */}
      <Card className="p-6 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
        <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Retention Best Practices
        </h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>Reach out to clients who haven't booked in 2+ weeks</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>Send personalized check-ins to show you care</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>Offer special incentives for clients at risk of churning</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>Celebrate client milestones and progress</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>Act quickly on high-priority alerts for best results</span>
          </li>
        </ul>
      </Card>
    </div>
  )
}
