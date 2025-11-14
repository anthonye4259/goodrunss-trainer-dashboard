"use client"

import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPage() {
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
          <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: November 13, 2025</p>

          <div className="space-y-6 text-muted-foreground">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">1. Information We Collect</h2>
              <p className="mb-3">We collect information you provide directly to us, including:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Account information (name, email, business name)</li>
                <li>Client data you add to the platform</li>
                <li>Payment information (processed securely through Stripe)</li>
                <li>Usage data and analytics</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">2. How We Use Your Information</h2>
              <p className="mb-3">We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Provide, maintain, and improve our services</li>
                <li>Process your transactions and send related information</li>
                <li>Send you technical notices and support messages</li>
                <li>Respond to your comments and questions</li>
                <li>Generate AI-powered content tailored to your specialty</li>
                <li>Analyze usage patterns to improve the platform</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">3. Data Security</h2>
              <p>
                We implement industry-standard security measures to protect your data. All data is encrypted in transit and at rest. Payment processing is handled securely by Stripe, and we never store your full credit card information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">4. Third-Party Services</h2>
              <p className="mb-3">We use third-party services to operate our platform:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Stripe</strong> - Payment processing</li>
                <li><strong>Clerk</strong> - User authentication</li>
                <li><strong>Supabase</strong> - Database and storage</li>
                <li><strong>Anthropic Claude</strong> - AI content generation</li>
                <li><strong>Firebase</strong> - Push notifications</li>
                <li><strong>Sentry</strong> - Error tracking</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">5. AI Processing</h2>
              <p>
                When you use our AI features, your prompts and related data are sent to Anthropic Claude for processing. We do not use your data to train AI models. All AI-generated content is private to your account.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">6. Your Rights</h2>
              <p className="mb-3">You have the right to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Export your data</li>
                <li>Opt-out of marketing communications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">7. Data Retention</h2>
              <p>
                We retain your data for as long as your account is active or as needed to provide you services. If you close your account, we will delete your data within 30 days, except where we are required to retain it for legal purposes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">8. Children's Privacy</h2>
              <p>
                Our Service is not directed to children under 18. We do not knowingly collect personal information from children under 18.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">9. Changes to Privacy Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">10. Contact Us</h2>
              <p>
                For any questions about this Privacy Policy or our data practices, please contact us at anthony@goodrunss.com
              </p>
            </section>
          </div>
        </Card>
      </div>
    </div>
  )
}

