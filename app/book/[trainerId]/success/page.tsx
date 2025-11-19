"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Calendar, Clock, Mail } from "lucide-react"

export default function BookingSuccessPage() {
  const searchParams = useSearchParams()
  const params = useParams()
  const sessionId = searchParams.get("session_id")
  const trainerId = params.trainerId as string

  const [bookingDetails, setBookingDetails] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function verifyPayment() {
      if (!sessionId) return

      try {
        const res = await fetch(`/api/verify-payment?session_id=${sessionId}`)
        if (res.ok) {
          const data = await res.json()
          setBookingDetails(data)
        }
      } catch (error) {
        console.error("Error verifying payment:", error)
      } finally {
        setLoading(false)
      }
    }

    verifyPayment()
  }, [sessionId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Confirming your booking...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <Card className="p-8 text-center">
          <div className="mb-6">
            <CheckCircle className="h-20 w-20 text-green-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Booking Confirmed! 🎉
            </h1>
            <p className="text-lg text-gray-600">
              Your training session has been successfully booked and paid for.
            </p>
          </div>

          {bookingDetails && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
              <h3 className="font-semibold mb-4 text-center">Booking Details</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Date & Time</p>
                    <p className="text-gray-600">
                      {bookingDetails.date} at {bookingDetails.time}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Service</p>
                    <p className="text-gray-600">{bookingDetails.serviceName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Confirmation Email</p>
                    <p className="text-gray-600">
                      Sent to {bookingDetails.clientEmail}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-800">
              <strong>What's Next?</strong><br />
              You'll receive a confirmation email with session details and the trainer's contact information.
            </p>
          </div>

          <Button
            onClick={() => window.location.href = `/book/${trainerId}`}
            className="bg-green-600 hover:bg-green-700"
          >
            Book Another Session
          </Button>
        </Card>
      </div>
    </div>
  )
}

