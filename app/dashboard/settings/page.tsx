"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { User, Bell, CreditCard, Shield, Save, Globe, LinkIcon, Upload, Pointer as Spinner } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/contexts/language-context"
import { MemorySettings } from "@/components/settings/memory-settings"

export default function SettingsPage() {
  const { toast } = useToast()
  const { language, setLanguage } = useLanguage()
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProfileSaving, setIsProfileSaving] = useState(false)
  const [isNotificationsSaving, setIsNotificationsSaving] = useState(false)
  const [isPasswordSaving, setIsPasswordSaving] = useState(false)
  const [isPreferencesSaving, setIsPreferencesSaving] = useState(false)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [sessionReminders, setSessionReminders] = useState(true)
  const [marketingEmails, setMarketingEmails] = useState(false)
  const [weeklyReports, setWeeklyReports] = useState(true)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/profile')
      if (!response.ok) throw new Error('Failed to fetch profile')
      const data = await response.json()
      setProfile(data.profile)
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast({
        title: "Error loading profile",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setIsProfileSaving(true)

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          phoneNumber: formData.get('phone'),
          bio: formData.get('bio'),
          specialty: formData.get('specialty'),
          yearsExperience: Number(formData.get('experience')),
          timezone: formData.get('timezone'),
        }),
      })

      if (!response.ok) throw new Error('Failed to update profile')

      await fetchProfile()

      toast({
        title: "Profile updated",
        description: "Your profile information has been saved successfully.",
      })
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: "Error updating profile",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsProfileSaving(false)
    }
  }

  const handleSaveNotifications = async () => {
    setIsNotificationsSaving(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsNotificationsSaving(false)
    toast({
      title: "Notifications updated",
      description: "Your notification preferences have been saved.",
    })
  }

  const handleStripeConnect = () => {
    toast({
      title: "Stripe Connect",
      description: "Redirecting to Stripe to connect your account...",
    })
  }

  const handleSavePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsPasswordSaving(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsPasswordSaving(false)
    toast({
      title: "Password updated",
      description: "Your password has been changed successfully.",
    })
  }

  const handleSavePreferences = async () => {
    setIsPreferencesSaving(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsPreferencesSaving(false)
    toast({
      title: "Preferences saved",
      description: "Your preferences have been updated.",
    })
  }

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Settings</h1>
        <p className="mt-2 text-muted-foreground">Manage your account and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-card">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="billing" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Billing
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="integrations" className="gap-2">
            <LinkIcon className="h-4 w-4" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="preferences" className="gap-2">
            <Globe className="h-4 w-4" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="memory" className="gap-2">
            <Brain className="h-4 w-4" />
            Memory
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details and contact information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="space-y-2">
                  <Label>Profile Photo</Label>
                  <div className="flex items-center gap-4">
                    <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="h-10 w-10 text-primary" />
                    </div>
                    <Button type="button" variant="outline" className="gap-2 bg-transparent">
                      <Upload className="h-4 w-4" />
                      Upload Photo
                    </Button>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" defaultValue="Alex" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" defaultValue="Coach" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="alex@goodrunss.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" type="tel" defaultValue="+1 (555) 123-4567" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea id="bio" defaultValue="Professional sports trainer with 10+ years of experience" rows={4} />
                </div>
                <Button
                  type="submit"
                  className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={isProfileSaving}
                >
                  {isProfileSaving && <Spinner className="h-4 w-4" />}
                  {isProfileSaving ? (
                    "Saving..."
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                </div>
                <Switch id="email-notifications" checked={emailNotifications} onCheckedChange={setEmailNotifications} />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-notifications">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive push notifications on your device</p>
                </div>
                <Switch id="push-notifications" checked={pushNotifications} onCheckedChange={setPushNotifications} />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="session-reminders">Session Reminders</Label>
                  <p className="text-sm text-muted-foreground">Get reminders before scheduled sessions</p>
                </div>
                <Switch id="session-reminders" checked={sessionReminders} onCheckedChange={setSessionReminders} />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="weekly-reports">Weekly Reports</Label>
                  <p className="text-sm text-muted-foreground">Receive weekly performance summaries</p>
                </div>
                <Switch id="weekly-reports" checked={weeklyReports} onCheckedChange={setWeeklyReports} />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="marketing-emails">Marketing Emails</Label>
                  <p className="text-sm text-muted-foreground">Receive tips and product updates</p>
                </div>
                <Switch id="marketing-emails" checked={marketingEmails} onCheckedChange={setMarketingEmails} />
              </div>
              <Button
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleSaveNotifications}
                disabled={isNotificationsSaving}
              >
                {isNotificationsSaving && <Spinner className="h-4 w-4" />}
                {isNotificationsSaving ? (
                  "Saving..."
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Preferences
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing">
          <div className="space-y-6">
            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle>Payment Processing</CardTitle>
                <CardDescription>Connect your Stripe account to receive payments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border border-border/50 bg-card/50 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Stripe Account</p>
                      <p className="text-sm text-muted-foreground">Not connected</p>
                    </div>
                    <Button
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={handleStripeConnect}
                    >
                      Connect Stripe
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Connect your Stripe account to accept payments from clients directly through the platform.
                </p>
              </CardContent>
            </Card>

            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle>Subscription</CardTitle>
                <CardDescription>Manage your GoodRunss subscription</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border border-primary/30 bg-primary/10 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-primary">Pro Plan</p>
                      <p className="text-sm text-muted-foreground">$49/month • Unlimited clients</p>
                    </div>
                    <Button variant="outline">Manage</Button>
                  </div>
                </div>
                <div className="rounded-lg border border-border/50 bg-card/50 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Payment Method</p>
                      <p className="text-sm text-muted-foreground">Visa ending in 4242</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Update
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <div className="space-y-6">
            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your password to keep your account secure</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSavePassword} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input id="current-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input id="confirm-password" type="password" />
                  </div>
                  <Button
                    type="submit"
                    className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={isPasswordSaving}
                  >
                    {isPasswordSaving && <Spinner className="h-4 w-4" />}
                    {isPasswordSaving ? (
                      "Updating..."
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Update Password
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle>Two-Factor Authentication</CardTitle>
                <CardDescription>Add an extra layer of security to your account</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">2FA Status</p>
                    <p className="text-sm text-muted-foreground">Not enabled</p>
                  </div>
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Enable 2FA</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations">
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle>Connected Integrations</CardTitle>
              <CardDescription>Manage your connected apps and services</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: "Instagram", status: "Connected", description: "Share content to Instagram" },
                { name: "Twitter/X", status: "Not connected", description: "Post updates to Twitter" },
                { name: "Snapchat", status: "Not connected", description: "Share stories on Snapchat" },
                { name: "Canva", status: "Connected", description: "Create designs with Canva" },
                { name: "Meta Ads", status: "Not connected", description: "Run ads on Facebook & Instagram" },
              ].map((integration) => (
                <div key={integration.name} className="rounded-lg border border-border/50 bg-card/50 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{integration.name}</p>
                      <p className="text-sm text-muted-foreground">{integration.description}</p>
                    </div>
                    <Button
                      variant={integration.status === "Connected" ? "outline" : "default"}
                      className={
                        integration.status === "Connected"
                          ? ""
                          : "bg-primary text-primary-foreground hover:bg-primary/90"
                      }
                    >
                      {integration.status === "Connected" ? "Disconnect" : "Connect"}
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences">
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle>General Preferences</CardTitle>
              <CardDescription>Customize your experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select value={language} onValueChange={(value) => setLanguage(value as any)}>
                  <SelectTrigger id="language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español (Spanish)</SelectItem>
                    <SelectItem value="fr">Français (French)</SelectItem>
                    <SelectItem value="pt">Português (Portuguese)</SelectItem>
                    <SelectItem value="ar">عربي (Arabic)</SelectItem>
                    <SelectItem value="zh">中国人 (Chinese)</SelectItem>
                    <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
                    <SelectItem value="bn">বাংলা (Bengali)</SelectItem>
                    <SelectItem value="ru">Русский (Russian)</SelectItem>
                    <SelectItem value="ur">اردو (Urdu)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select defaultValue="est">
                  <SelectTrigger id="timezone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="est">Eastern Time (ET)</SelectItem>
                    <SelectItem value="cst">Central Time (CT)</SelectItem>
                    <SelectItem value="mst">Mountain Time (MT)</SelectItem>
                    <SelectItem value="pst">Pacific Time (PT)</SelectItem>
                    <SelectItem value="utc">UTC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date-format">Date Format</Label>
                <Select defaultValue="mdy">
                  <SelectTrigger id="date-format">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                    <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                    <SelectItem value="ymd">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleSavePreferences}
                disabled={isPreferencesSaving}
              >
                {isPreferencesSaving && <Spinner className="h-4 w-4" />}
                {isPreferencesSaving ? (
                  "Saving..."
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Preferences
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        {/* Memory Tab */}
        <TabsContent value="memory">
          <MemorySettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}
