"use client"

import { useEffect, useState } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, CreditCard } from "lucide-react"

export default function CheckoutPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const trainerId = params.trainerId as string
  const serviceId = searchParams.get("service")
  const date = searchParams.get("date")
  const time = searchParams.get("time")

  const [clientName, setClientName] = useState("")
  const [clientEmail, setClientEmail] = useState("")
  const [clientPhone, setClientPhone] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [serviceDetails, setServiceDetails] = useState<any>(null)

  useEffect(() => {
    async function fetchService() {
      try {
        const res = await fetch(`/api/public/trainer/${trainerId}`)
        if (res.ok) {
          const data = await res.json()
          const service = data.services.find((s: any) => s.id === serviceId)
          setServiceDetails(service)
        }
      } catch (error) {
        console.error("Error fetching service:", error)
      }
    }
    fetchService()
  }, [trainerId, serviceId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trainerId,
          serviceId,
          serviceName: serviceDetails?.name,
          servicePrice: serviceDetails?.price,
          date,
          time,
          clientEmail,
          clientName,
        }),
      })

      const data = await response.json()

      if (data.error) {
        setError(data.error)
        setLoading(false)
        return
      }

      // Redirect to Stripe Checkout URL
      if (data.url) {
        window.location.href = data.url
      } else {
        setError("Failed to get checkout URL")
        setLoading(false)
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong")
      setLoading(false)
    }
  }

  if (!serviceDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <Card className="p-8">
          <div className="text-center mb-8">
            <CreditCard className="h-12 w-12 mx-auto text-green-600 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">Complete Your Booking</h1>
            <p className="text-gray-600 mt-2">Enter your details to proceed to payment</p>
          </div>

          {/* Booking Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold mb-2">Booking Summary</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p><strong>Service:</strong> {serviceDetails.name}</p>
              <p><strong>Duration:</strong> {serviceDetails.duration} minutes</p>
              <p><strong>Date:</strong> {new Date(date!).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {time}</p>
              <p className="text-lg font-bold text-gray-900 mt-3">
                Total: ${serviceDetails.price}
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                required
                placeholder="John Doe"
              />
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                required
                placeholder="john@example.com"
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone Number (Optional)</Label>
              <Input
                id="phone"
                type="tel"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-lg py-6"
              disabled={loading}
            >
              {loading ? (
                <>Processing...</>
              ) : (
                <>Continue to Payment</>
              )}
            </Button>
          </form>

          <p className="text-xs text-gray-500 text-center mt-4">
            Secure payment powered by Stripe
          </p>
        </Card>
      </div>
    </div>
  )
}

