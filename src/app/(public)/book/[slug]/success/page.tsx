"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Calendar, Mail } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

export default function BookingSuccessPage() {
  const params = useParams()
  const slug = params.slug as string

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="text-green-600" size={32} />
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-2">Booking Confirmed!</h1>
          <p className="text-muted-foreground mb-8">
            Your payment was successful and your session has been booked.
          </p>
          
          <div className="bg-card rounded-lg p-6 mb-8 text-left border border-border">
            <h2 className="font-semibold text-lg mb-4 text-white">What's Next?</h2>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <Mail className="text-primary flex-shrink-0 mt-0.5" size={18} />
                <div>
                  <p className="font-medium text-white">Check Your Email</p>
                  <p className="text-muted-foreground">
                    You'll receive a confirmation email with all the details.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Calendar className="text-primary flex-shrink-0 mt-0.5" size={18} />
                <div>
                  <p className="font-medium text-white">Add to Calendar</p>
                  <p className="text-muted-foreground">
                    Mark your calendar so you don't miss your session.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href={`/book/${slug}`}>
              <Button variant="outline" size="lg">
                Book Another Session
              </Button>
            </Link>
            
            <Link href="/">
              <Button size="lg" className="bg-primary text-black hover:bg-primary/90">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  )
}
