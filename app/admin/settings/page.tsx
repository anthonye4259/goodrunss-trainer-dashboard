"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function AdminSettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Settings</h1>
        <p className="text-muted-foreground mt-1">Platform configuration and admin info</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Admin Access</CardTitle>
          <CardDescription>Authorized admin emails</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">anthony@goodrunss.com</Badge>
            <span className="text-xs text-muted-foreground">(You)</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Platform Information</CardTitle>
          <CardDescription>Current platform configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium">Environment</p>
              <p className="text-muted-foreground">Production</p>
            </div>
            <div>
              <p className="text-sm font-medium">Database</p>
              <p className="text-muted-foreground">PostgreSQL (Supabase)</p>
            </div>
            <div>
              <p className="text-sm font-medium">Authentication</p>
              <p className="text-muted-foreground">Clerk</p>
            </div>
            <div>
              <p className="text-sm font-medium">Payments</p>
              <p className="text-muted-foreground">Stripe</p>
            </div>
            <div>
              <p className="text-sm font-medium">AI Provider</p>
              <p className="text-muted-foreground">Google Gemini</p>
            </div>
            <div>
              <p className="text-sm font-medium">Email Service</p>
              <p className="text-muted-foreground">Resend</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Trial Settings</CardTitle>
          <CardDescription>Current trial configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium">Trial Length</p>
              <p className="text-muted-foreground">7 days</p>
            </div>
            <div>
              <p className="text-sm font-medium">Trial Type</p>
              <p className="text-muted-foreground">Card-locked</p>
            </div>
            <div>
              <p className="text-sm font-medium">6-Month Plan</p>
              <p className="text-muted-foreground">$75</p>
            </div>
            <div>
              <p className="text-sm font-medium">1-Year Plan</p>
              <p className="text-muted-foreground">$100</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

