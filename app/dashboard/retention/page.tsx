"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, AlertCircle, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function RetentionPage() {
  const [retention, setRetention] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchRetention()
  }, [])

  const fetchRetention = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/retention')
      if (!response.ok) throw new Error('Failed to fetch retention data')
      const data = await response.json()
      setRetention(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Client Retention</h1>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Client Retention</h1>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p className="font-semibold">Failed to load retention data</p>
            </div>
            <Button onClick={fetchRetention} className="mt-4">Try Again</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Client Retention</h1>
        <p className="text-muted-foreground mt-1">Track client engagement and at-risk clients</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Retention Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{retention?.retentionRate || 0}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">At-Risk Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{retention?.atRiskCount || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Active Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{retention?.activeCount || 0}</div>
          </CardContent>
        </Card>
      </div>

      {retention?.atRiskClients && retention.atRiskClients.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>At-Risk Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {retention.atRiskClients.map((client: any) => (
                <div key={client.id} className="flex justify-between items-center p-4 rounded-lg bg-secondary/50">
                  <div>
                    <p className="font-semibold">{client.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Last session: {client.daysSinceLastSession} days ago
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
