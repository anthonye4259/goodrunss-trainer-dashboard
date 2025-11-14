"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Check, Loader2, AlertCircle, ExternalLink, DollarSign, Shield, Zap } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@clerk/nextjs"

interface StripeAccountStatus {
  exists: boolean
  accountId?: string
  status?: 'not_created' | 'pending' | 'incomplete' | 'complete'
  detailsSubmitted?: boolean
  chargesEnabled?: boolean
  payoutsEnabled?: boolean
  requirements?: {
    currentlyDue: string[]
    eventuallyDue: string[]
    pastDue: string[]
    pendingVerification: string[]
  }
}

export default function PaymentsSetupPage() {
  const { user } = useUser()
  const [loading, setLoading] = useState(true)
  const [onboarding, setOnboarding] = useState(false)
  const [accountStatus, setAccountStatus] = useState<StripeAccountStatus | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (user?.id) {
      fetchAccountStatus()
    }
  }, [user])

  const fetchAccountStatus = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/stripe/connect/onboard?userId=${user?.id}`)
      const data = await response.json()
      setAccountStatus(data)
    } catch (error) {
      console.error('Error fetching account status:', error)
      toast({
        title: "Error",
        description: "Failed to load payment setup status.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStartOnboarding = async () => {
    try {
      setOnboarding(true)

      const response = await fetch('/api/stripe/connect/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          email: user?.emailAddresses[0]?.emailAddress,
          country: 'US',
          returnUrl: `${window.location.origin}/dashboard/payments-setup?success=true`,
          refreshUrl: `${window.location.origin}/dashboard/payments-setup`,
        })
      })

      if (!response.ok) throw new Error('Failed to start onboarding')

      const data = await response.json()

      // Redirect to Stripe onboarding
      window.location.href = data.onboardingUrl
    } catch (error) {
      console.error('Error starting onboarding:', error)
      toast({
        title: "Error",
        description: "Failed to start Stripe onboarding. Please try again.",
        variant: "destructive"
      })
      setOnboarding(false)
    }
  }

  const handleRefreshStatus = async () => {
    await fetchAccountStatus()
    toast({
      title: "Status Refreshed",
      description: "Your payment setup status has been updated.",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const isComplete = accountStatus?.status === 'complete' && 
                     accountStatus?.chargesEnabled && 
                     accountStatus?.payoutsEnabled

  const hasRequirements = accountStatus?.requirements && (
    accountStatus.requirements.currentlyDue.length > 0 ||
    accountStatus.requirements.pastDue.length > 0
  )

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Payment Setup</h1>
        <p className="text-muted-foreground mt-1">Connect your Stripe account to receive payments</p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={`glass-card ${isComplete ? 'border-primary/50' : ''}`}>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              {isComplete ? <Check className="w-4 h-4 text-primary" /> : <Shield className="w-4 h-4" />}
              Account Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isComplete ? 'text-primary' : 'text-foreground'}`}>
              {accountStatus?.status === 'complete' ? 'Active' : 
               accountStatus?.status === 'pending' ? 'Pending' :
               accountStatus?.status === 'incomplete' ? 'Incomplete' :
               'Not Set Up'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {isComplete ? 'Ready to receive payments' : 'Complete setup to get paid'}
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Charges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${accountStatus?.chargesEnabled ? 'text-primary' : 'text-muted-foreground'}`}>
              {accountStatus?.chargesEnabled ? 'Enabled' : 'Disabled'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {accountStatus?.chargesEnabled ? 'Can accept payments' : 'Cannot accept payments yet'}
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Payouts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${accountStatus?.payoutsEnabled ? 'text-primary' : 'text-muted-foreground'}`}>
              {accountStatus?.payoutsEnabled ? 'Enabled' : 'Disabled'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {accountStatus?.payoutsEnabled ? 'Funds are deposited automatically' : 'Cannot receive payouts yet'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Requirements Alert */}
      {hasRequirements && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Action Required</AlertTitle>
          <AlertDescription>
            You have {accountStatus?.requirements?.currentlyDue.length || 0} requirements to complete.
            {accountStatus?.requirements?.pastDue && accountStatus.requirements.pastDue.length > 0 && (
              <span className="font-semibold"> {accountStatus.requirements.pastDue.length} are overdue.</span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Setup Card */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Stripe Connect</CardTitle>
          <CardDescription>
            {isComplete 
              ? 'Your Stripe account is fully set up and verified'
              : 'Set up your Stripe account to receive payments from your clients'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!accountStatus?.exists ? (
            <>
              {/* Not Started */}
              <div className="space-y-4">
                <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    Why Stripe?
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Secure payments with industry-leading fraud protection</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Fast payouts - funds deposited to your bank in 2 business days</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Transparent pricing - 2.9% + $0.30 per transaction</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Automatic invoicing and tax reporting</span>
                    </li>
                  </ul>
                </div>

                <Button 
                  onClick={handleStartOnboarding}
                  disabled={onboarding}
                  className="w-full bg-primary hover:bg-primary/90"
                  size="lg"
                >
                  {onboarding ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Redirecting to Stripe...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      Connect Stripe Account
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  By clicking "Connect Stripe Account", you'll be redirected to Stripe to complete a secure onboarding process. 
                  This typically takes 5-10 minutes.
                </p>
              </div>
            </>
          ) : !isComplete ? (
            <>
              {/* Started but not complete */}
              <div className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Setup In Progress</AlertTitle>
                  <AlertDescription>
                    Your Stripe account setup is not complete. Click below to continue where you left off.
                  </AlertDescription>
                </Alert>

                {accountStatus?.requirements && (
                  <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
                    <h3 className="font-semibold text-foreground">Required Information:</h3>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {accountStatus.requirements.currentlyDue.map((req) => (
                        <li key={req} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                          {formatRequirement(req)}
                        </li>
                      ))}
                      {accountStatus.requirements.pastDue.map((req) => (
                        <li key={req} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-destructive" />
                          {formatRequirement(req)} (Overdue)
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button 
                    onClick={handleStartOnboarding}
                    disabled={onboarding}
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    {onboarding ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Redirecting...
                      </>
                    ) : (
                      <>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Continue Setup
                      </>
                    )}
                  </Button>
                  <Button 
                    onClick={handleRefreshStatus}
                    variant="outline"
                  >
                    Refresh Status
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Complete */}
              <div className="space-y-4">
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                    <Check className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">All Set!</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your Stripe account is fully connected and verified. You can now accept payments from clients.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    onClick={handleRefreshStatus}
                    variant="outline"
                  >
                    Refresh Status
                  </Button>
                  <Button 
                    onClick={() => window.open('https://dashboard.stripe.com/dashboard', '_blank')}
                    variant="outline"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Stripe Dashboard
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg">How Payments Work</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-primary font-semibold">
              1
            </div>
            <div>
              <p className="font-medium text-foreground">Client Books & Pays</p>
              <p>When a client books a session, they pay through the GoodRunss app using Stripe.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-primary font-semibold">
              2
            </div>
            <div>
              <p className="font-medium text-foreground">Platform Fee</p>
              <p>GoodRunss takes a 15% platform fee. Stripe charges 2.9% + $0.30 for payment processing.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-primary font-semibold">
              3
            </div>
            <div>
              <p className="font-medium text-foreground">Automatic Payout</p>
              <p>After the session, funds are automatically transferred to your bank account within 2 business days.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function formatRequirement(req: string): string {
  // Convert snake_case to readable format
  return req
    .split('.')
    .map(part => part.replace(/_/g, ' '))
    .join(' - ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

