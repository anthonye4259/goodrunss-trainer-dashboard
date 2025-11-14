"use client"

import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft } from 'lucide-react'

export default function TermsPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Button
          onClick={() => router.back()}
          variant="ghost"
          className="mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Card className="p-8 md:p-12">
          <h1 className="text-4xl font-bold text-white mb-4">Terms of Service</h1>
          <p className="text-muted-foreground mb-8">Last updated: November 13, 2025</p>

          <div className="space-y-6 text-muted-foreground">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing and using the GoodRunss Trainer Dashboard ("Service"), you accept and agree to be bound by the terms and provision of this agreement.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">2. Use License</h2>
              <p>
                Permission is granted to temporarily access the Service for personal, non-transferable use. This is the grant of a license, not a transfer of title.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">3. Early Access Program</h2>
              <p>
                By participating in our early access program, you understand that the Service is in active development and may contain bugs or incomplete features. Early access pricing is locked in for the duration of your subscription period.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">4. Payment Terms</h2>
              <p>
                Early access subscriptions are one-time payments for the specified duration (3, 6, or 12 months). All payments are processed securely through Stripe. Refunds are available within 30 days of purchase.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">5. User Data & Privacy</h2>
              <p>
                Your use of the Service is also governed by our Privacy Policy. We collect and process data as described in our Privacy Policy to provide and improve the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">6. AI-Generated Content</h2>
              <p>
                The Service includes AI-powered content generation features. While we strive for accuracy and quality, you are responsible for reviewing and approving all AI-generated content before using it with your clients.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">7. Prohibited Uses</h2>
              <p>
                You may not use the Service for any illegal purposes, to harass others, to distribute spam, or to violate any applicable laws or regulations.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">8. Modifications</h2>
              <p>
                We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">9. Contact</h2>
              <p>
                For questions about these Terms, please contact us at anthony@goodrunss.com
              </p>
            </section>
          </div>
        </Card>
      </div>
    </div>
  )
}

