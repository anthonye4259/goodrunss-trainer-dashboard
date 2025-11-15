"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Bell, Shield, Palette, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const { toast } = useToast()
  const [profile, setProfile] = useState({
    name: "Coach Alex",
    email: "alex@goodrunss.com",
    phone: "(555) 123-4567",
    bio: "Professional sports trainer with 10+ years of experience",
    location: "San Francisco, CA",
  })

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    sessionReminders: true,
    paymentAlerts: true,
    clientMessages: true,
  })

  const handleSaveProfile = () => {
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated.",
    })
  }

  const handleSaveNotifications = () => {
    toast({
      title: "Notifications Updated",
      description: "Your notification preferences have been saved.",
    })
  }

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-balance">Settings</h1>
        <p className="mt-2 text-muted-foreground">Manage your account and preferences</p>
      </div>

      {/* Profile Settings */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Profile Information
          </CardTitle>
          <CardDescription>Update your personal information and profile details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src="/placeholder.svg?height=96&width=96" />
              <AvatarFallback className="bg-primary/20 text-primary text-2xl font-bold">CA</AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <Button variant="outline">Change Photo</Button>
              <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max size 2MB.</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={profile.location}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              rows={4}
            />
          </div>

          <Button onClick={handleSaveProfile} className="gap-2">
            <Save className="h-4 w-4" />
            Save Profile
          </Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Notifications
          </CardTitle>
          <CardDescription>Manage how you receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive notifications via email</p>
            </div>
            <Switch
              checked={notifications.emailNotifications}
              onCheckedChange={(checked) => setNotifications({ ...notifications, emailNotifications: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>SMS Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive notifications via text message</p>
            </div>
            <Switch
              checked={notifications.smsNotifications}
              onCheckedChange={(checked) => setNotifications({ ...notifications, smsNotifications: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Session Reminders</Label>
              <p className="text-sm text-muted-foreground">Get reminders before upcoming sessions</p>
            </div>
            <Switch
              checked={notifications.sessionReminders}
              onCheckedChange={(checked) => setNotifications({ ...notifications, sessionReminders: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Payment Alerts</Label>
              <p className="text-sm text-muted-foreground">Notifications for payments and transactions</p>
            </div>
            <Switch
              checked={notifications.paymentAlerts}
              onCheckedChange={(checked) => setNotifications({ ...notifications, paymentAlerts: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Client Messages</Label>
              <p className="text-sm text-muted-foreground">Notifications when clients send messages</p>
            </div>
            <Switch
              checked={notifications.clientMessages}
              onCheckedChange={(checked) => setNotifications({ ...notifications, clientMessages: checked })}
            />
          </div>

          <Button onClick={handleSaveNotifications} className="gap-2">
            <Save className="h-4 w-4" />
            Save Preferences
          </Button>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            Appearance
          </CardTitle>
          <CardDescription>Customize the look and feel of your dashboard</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Theme</Label>
            <Select defaultValue="dark">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Security
          </CardTitle>
          <CardDescription>Manage your account security settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full justify-start bg-transparent">
            Change Password
          </Button>
          <Button variant="outline" className="w-full justify-start bg-transparent">
            Enable Two-Factor Authentication
          </Button>
          <Button variant="outline" className="w-full justify-start text-destructive bg-transparent">
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
