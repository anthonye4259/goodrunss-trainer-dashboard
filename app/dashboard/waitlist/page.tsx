"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, AlertCircle, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function WaitlistPage() {
  const [waitlist, setWaitlist] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchWaitlist()
  }, [])

  const fetchWaitlist = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/waitlist')
      if (!response.ok) throw new Error('Failed to fetch waitlist')
      const data = await response.json()
      setWaitlist(data.waitlist || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Waitlist</h1>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Waitlist</h1>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p className="font-semibold">Failed to load waitlist</p>
            </div>
            <Button onClick={fetchWaitlist} className="mt-4">Try Again</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Waitlist</h1>
        <p className="text-muted-foreground mt-1">Manage client waiting lists</p>
      </div>

      {waitlist.length === 0 ? (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No one on waitlist</h3>
            <p className="text-sm text-muted-foreground">Waitlist entries will appear here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {waitlist.map((entry) => (
            <Card key={entry.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{entry.clientName}</p>
                    <p className="text-sm text-muted-foreground">
                      Added: {new Date(entry.addedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge>{entry.status}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
