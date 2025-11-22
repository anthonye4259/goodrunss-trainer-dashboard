"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { User, Save, Loader2, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    location: "",
    city: "",
    state: "",
    country: "US",
    timezone: "America/New_York",
  })

  // Load settings on mount
  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/settings")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to load settings")
      }

      setProfile({
        name: data.settings.name || "",
        email: data.settings.email || "",
        phone: data.settings.phone || "",
        bio: data.settings.bio || "",
        location: data.settings.location || "",
        city: data.settings.city || "",
        state: data.settings.state || "",
        country: data.settings.country || "US",
        timezone: data.settings.timezone || "America/New_York",
      })
    } catch (err: any) {
      console.error("Load settings error:", err)
      setError(err.message || "Failed to load settings")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    setIsSaving(true)
    setError("")

    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to save settings")
      }

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      })
    } catch (err: any) {
      console.error("Save settings error:", err)
      setError(err.message || "Failed to save settings")
      toast({
        title: "Error",
        description: err.message || "Failed to save settings",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    )
  }

  const initials = profile.name
    ? profile.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "U"

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-balance">Settings</h1>
        <p className="mt-2 text-muted-foreground">Manage your account and preferences</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive">
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

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
              <AvatarFallback className="bg-primary/20 text-primary text-2xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <p className="text-sm font-medium">{profile.name || "No name set"}</p>
              <p className="text-xs text-muted-foreground">{profile.email}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                placeholder="Your full name"
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                disabled
                className="bg-muted cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
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
                placeholder="(555) 123-4567"
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Input
                id="timezone"
                value={profile.timezone}
                onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                placeholder="America/New_York"
                disabled={isSaving}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={profile.city}
                onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                placeholder="San Francisco"
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={profile.state}
                onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                placeholder="CA"
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={profile.country}
                onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                placeholder="US"
                disabled={isSaving}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Full Location (Optional)</Label>
            <Input
              id="location"
              value={profile.location}
              onChange={(e) => setProfile({ ...profile, location: e.target.value })}
              placeholder="San Francisco, CA"
              disabled={isSaving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              rows={4}
              placeholder="Tell us about yourself and your training experience..."
              disabled={isSaving}
            />
            <p className="text-xs text-muted-foreground">
              This will be displayed on your public profile
            </p>
          </div>

          <Button onClick={handleSaveProfile} disabled={isSaving} className="gap-2">
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Profile
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Additional Settings Info */}
      <Card className="glass border-border/50 bg-muted/30">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Settings are saved to database</p>
              <p className="text-xs text-muted-foreground">
                Your profile information is securely stored and will persist across sessions.
                Changes are saved immediately when you click "Save Profile".
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
