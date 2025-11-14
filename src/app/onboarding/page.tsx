"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Check, ArrowRight, ArrowLeft, Sparkles, Globe, Rocket, Zap, Users } from 'lucide-react'
import { SpecialtySelector } from "@/components/specialty-selector"
import { BenefitsCard } from "@/components/benefits-card"
import { useToast } from "@/hooks/use-toast"

const specialties = [
  { value: "basketball", label: "Basketball Coach", emoji: "🏀" },
  { value: "pickleball", label: "Pickleball Instructor", emoji: "🏓" },
  { value: "tennis", label: "Tennis Instructor", emoji: "🎾" },
  { value: "volleyball", label: "Volleyball Coach", emoji: "🏐" },
  { value: "yoga", label: "Yoga Instructor", emoji: "🧘" },
  { value: "pilates", label: "Pilates Instructor", emoji: "🤸" },
  { value: "barre", label: "Barre Instructor", emoji: "💃" },
  { value: "strength_training", label: "Strength & Conditioning", emoji: "💪" },
  { value: "hiit", label: "HIIT Trainer", emoji: "⚡" },
  { value: "crossfit", label: "CrossFit Coach", emoji: "🏋️" },
  { value: "running", label: "Running Coach", emoji: "🏃" },
  { value: "cycling", label: "Cycling Coach", emoji: "🚴" },
  { value: "swimming", label: "Swimming Coach", emoji: "🏊" },
  { value: "martial_arts", label: "Martial Arts Instructor", emoji: "🥋" },
  { value: "boxing", label: "Boxing Coach", emoji: "🥊" },
  { value: "dance", label: "Dance Instructor", emoji: "💃" },
  { value: "soccer", label: "Soccer Coach", emoji: "⚽" },
  { value: "golf", label: "Golf Instructor", emoji: "⛳" },
  { value: "nutrition", label: "Nutrition Coach", emoji: "🥗" },
  { value: "wellness", label: "Wellness Coach", emoji: "🌿" },
  { value: "sports_performance", label: "Sports Performance", emoji: "🎯" },
  { value: "general_fitness", label: "General Fitness Trainer", emoji: "💪" },
]

export default function OnboardingPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  // Form data
  const [businessName, setBusinessName] = useState("")
  const [specialty, setSpecialty] = useState("")
  const [bio, setBio] = useState("")
  const [timezone, setTimezone] = useState("est")
  const [language, setLanguage] = useState("en")

  const totalSteps = 4
  const progress = (step / totalSteps) * 100

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleComplete = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: businessName.split(' ')[0] || businessName,
          lastName: businessName.split(' ').slice(1).join(' ') || '',
          specialties: specialty ? [specialty] : [],
          timezone: timezone,
          language: language,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Welcome to GoodRunss! 🎉",
          description: "Your account is all set up. Let's get started!",
        })
        
        // Small delay for toast to show
        setTimeout(() => {
          router.push("/dashboard")
        }, 500)
      } else {
        throw new Error(data.error || "Failed to complete onboarding")
      }
    } catch (error: any) {
      console.error("Onboarding error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to complete onboarding. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const selectedSpecialty = specialties.find((s) => s.value === specialty)

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl border-2 border-border bg-card/50 backdrop-blur-sm p-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-muted-foreground">
              Step {step} of {totalSteps}
            </h2>
            <span className="text-sm font-semibold text-primary">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step 1: Specialty Selection */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Choose Your Specialty</h1>
              <p className="text-muted-foreground">
                This helps GIA personalize your dashboard and recommendations
              </p>
            </div>

            <SpecialtySelector value={specialty} onChange={setSpecialty} />

            {specialty && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <BenefitsCard specialty={specialty} />
              </div>
            )}

            <div className="flex justify-end pt-4">
              <Button
                onClick={handleNext}
                disabled={!specialty}
                className="bg-primary hover:bg-primary/90 text-black"
              >
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Timezone & Language Preferences */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Set Your Preferences</h1>
              <p className="text-muted-foreground">Configure your timezone and language settings</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger id="timezone" className="mt-1">
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

              <div>
                <Label htmlFor="language">Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger id="language" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español (Spanish)</SelectItem>
                    <SelectItem value="fr">Français (French)</SelectItem>
                    <SelectItem value="pt">Português (Portuguese)</SelectItem>
                    <SelectItem value="ar">عربي (Arabic)</SelectItem>
                    <SelectItem value="zh">中国人 (Chinese)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button onClick={handleBack} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button onClick={handleNext} className="bg-primary hover:bg-primary/90 text-black">
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Business Info */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Welcome to GoodRunss! 👋</h1>
              <p className="text-muted-foreground">Let's set up your trainer profile</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="businessName">Business/Trainer Name *</Label>
                <Input
                  id="businessName"
                  placeholder="e.g., Elite Fitness Training"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell clients about yourself and your training philosophy..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="mt-1 min-h-[100px]"
                />
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button onClick={handleBack} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button
                onClick={handleNext}
                disabled={!businessName.trim()}
                className="bg-primary hover:bg-primary/90 text-black"
              >
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Welcome & Complete */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">You're All Set!</h1>
              <p className="text-muted-foreground">Your GoodRunss account is ready. Let's get started!</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-card/50 border border-border/50 text-center">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm font-semibold text-white">AI Assistant (GIA)</p>
                <p className="text-xs text-muted-foreground mt-1">Generate content & manage clients</p>
              </div>

              <div className="p-4 rounded-xl bg-card/50 border border-border/50 text-center">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm font-semibold text-white">Client Management</p>
                <p className="text-xs text-muted-foreground mt-1">Track progress & schedule sessions</p>
              </div>

              <div className="p-4 rounded-xl bg-card/50 border border-border/50 text-center">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Rocket className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm font-semibold text-white">Marketing Tools</p>
                <p className="text-xs text-muted-foreground mt-1">Grow with AI-powered content</p>
              </div>
            </div>

            {selectedSpecialty && (
              <Card className="bg-muted/30 border-border p-6 space-y-3">
                <p className="text-xs text-muted-foreground mb-1">Your Specialty</p>
                <p className="font-semibold text-white text-lg">
                  {selectedSpecialty.emoji} {selectedSpecialty.label}
                </p>
                <p className="text-sm text-muted-foreground">
                  GIA is now optimized for {selectedSpecialty.label.toLowerCase()} training!
                </p>
              </Card>
            )}

            <div className="flex justify-between pt-4">
              <Button onClick={handleBack} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button
                onClick={handleComplete}
                disabled={loading}
                className="bg-primary hover:bg-primary/90 text-black"
              >
                {loading ? "Setting up..." : "Complete Setup"}
                {!loading && <Check className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
