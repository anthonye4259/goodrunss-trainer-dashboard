"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, AlertCircle, ClipboardCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export default function CheckInsPage() {
  const [checkIns, setCheckIns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchCheckIns()
  }, [])

  const fetchCheckIns = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/checkins')
      if (!response.ok) throw new Error('Failed to fetch check-ins')
      const data = await response.json()
      setCheckIns(data.checkins || [])
    } catch (err: any) {
      setError(err.message || 'Failed to load check-ins')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Client Check-ins</h1>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Client Check-ins</h1>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <div>
                <p className="font-semibold">Failed to load check-ins</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
            </div>
            <Button onClick={fetchCheckIns} className="mt-4">Try Again</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Client Check-ins</h1>
        <p className="text-muted-foreground mt-1">Track client progress and measurements</p>
      </div>

      {checkIns.length === 0 ? (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <ClipboardCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No check-ins yet</h3>
            <p className="text-sm text-muted-foreground">Client check-ins will appear here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {checkIns.map((checkin) => (
            <Card key={checkin.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{checkin.clientName}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(checkin.date).toLocaleDateString()}
                    </p>
                  </div>
                  {checkin.notes && (
                    <p className="text-sm">{checkin.notes}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
