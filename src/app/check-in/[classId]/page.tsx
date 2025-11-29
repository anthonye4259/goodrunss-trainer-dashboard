"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, Calendar, Clock, MapPin } from "lucide-react"

export default function CheckInPage() {
  const params = useParams()
  const router = useRouter()
  const classId = params.classId as string
  const { toast } = useToast()
  
  const [classInfo, setClassInfo] = useState<any>(null)
  const [clientEmail, setClientEmail] = useState("")
  const [loading, setLoading] = useState(true)
  const [checkingIn, setCheckingIn] = useState(false)
  const [checkedIn, setCheckedIn] = useState(false)

  useEffect(() => {
    fetchClassInfo()
  }, [classId])

  const fetchClassInfo = async () => {
    try {
      // Fetch class details from the public classes API
      const res = await fetch(`/api/group-classes/${classId}/info`)
      if (res.ok) {
        const data = await res.json()
        setClassInfo(data.class)
      } else {
        toast({ 
          title: "Error", 
          description: "Class not found",
          variant: "destructive" 
        })
      }
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Failed to load class info",
        variant: "destructive" 
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCheckIn = async () => {
    if (!clientEmail) {
      toast({ 
        title: "Error", 
        description: "Please enter your email",
        variant: "destructive" 
      })
      return
    }

    setCheckingIn(true)
    try {
      const res = await fetch('/api/group-classes/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId,
          clientEmail,
          checkInMethod: 'qr'
        })
      })

      const data = await res.json()
      
      if (res.ok && data.success) {
        setCheckedIn(true)
        toast({ 
          title: "Success!", 
          description: data.message,
        })
      } else {
        toast({ 
          title: "Error", 
          description: data.error || "Check-in failed",
          variant: "destructive" 
        })
      }
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Failed to check in",
        variant: "destructive" 
      })
    } finally {
      setCheckingIn(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (checkedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">You're Checked In!</h1>
          <p className="text-muted-foreground mb-6">
            Welcome to {classInfo?.name}. Enjoy your session!
          </p>
          {classInfo?.location && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <MapPin size={16} />
              <span>{classInfo.location}</span>
            </div>
          )}
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">Check In</h1>
        
        {classInfo && (
          <div className="mb-6 space-y-3">
            <h2 className="text-xl font-semibold text-white">{classInfo.name}</h2>
            {classInfo.description && (
              <p className="text-sm text-muted-foreground">{classInfo.description}</p>
            )}
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>{new Date(classInfo.scheduledAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span>
                  {new Date(classInfo.scheduledAt).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })} ({classInfo.duration} minutes)
                </span>
              </div>
              {classInfo.location && (
                <div className="flex items-center gap-2">
                  <MapPin size={16} />
                  <span>{classInfo.location}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Enter your email to check in</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCheckIn()}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Use the email you used when booking
            </p>
          </div>

          <Button
            onClick={handleCheckIn}
            disabled={checkingIn || !clientEmail}
            className="w-full bg-primary text-black hover:bg-primary/90"
            size="lg"
          >
            {checkingIn ? "Checking In..." : "Check In Now"}
          </Button>
        </div>
      </Card>
    </div>
  )
}

