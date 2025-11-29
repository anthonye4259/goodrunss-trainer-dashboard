"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, AlertCircle, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ConflictsPage() {
  const [conflicts, setConflicts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchConflicts()
  }, [])

  const fetchConflicts = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/conflicts')
      if (!response.ok) throw new Error('Failed to fetch conflicts')
      const data = await response.json()
      setConflicts(data.conflicts || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Schedule Conflicts</h1>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Schedule Conflicts</h1>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p className="font-semibold">Failed to load conflicts</p>
            </div>
            <Button onClick={fetchConflicts} className="mt-4">Try Again</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Schedule Conflicts</h1>
        <p className="text-muted-foreground mt-1">Detect and resolve scheduling conflicts</p>
      </div>

      {conflicts.length === 0 ? (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No conflicts detected</h3>
            <p className="text-sm text-muted-foreground">Your schedule looks good!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {conflicts.map((conflict) => (
            <Card key={conflict.id} className="border-destructive">
              <CardContent className="pt-6">
                <p className="font-semibold text-destructive">{conflict.type}</p>
                <p className="text-sm text-muted-foreground mt-1">{conflict.message}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
