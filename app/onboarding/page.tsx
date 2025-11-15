"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Sparkles, Users, TrendingUp } from "lucide-react"

const specialties = [
  { value: "basketball", label: "Basketball Coach", emoji: "🏀" },
  { value: "pickleball", label: "Pickleball Instructor", emoji: "🏓" },
  { value: "tennis", label: "Tennis Instructor", emoji: "🎾" },
  { value: "volleyball", label: "Volleyball Coach", emoji: "🏐" },
  { value: "yoga", label: "Yoga Instructor", emoji: "🧘‍♀️" },
  { value: "pilates", label: "Pilates Instructor", emoji: "🤸‍♀️" },
  { value: "barre", label: "Barre Instructor", emoji: "💃" },
  { value: "strength", label: "Strength & Conditioning", emoji: "💪" },
  { value: "hiit", label: "HIIT Trainer", emoji: "⚡" },
  { value: "crossfit", label: "CrossFit Coach", emoji: "🏋️‍♀️" },
  { value: "running", label: "Running Coach", emoji: "🏃‍♀️" },
  { value: "cycling", label: "Cycling Coach", emoji: "🚴‍♀️" },
  { value: "swimming", label: "Swimming Coach", emoji: "🏊‍♀️" },
  { value: "martial-arts", label: "Martial Arts Instructor", emoji: "🥋" },
  { value: "boxing", label: "Boxing Coach", emoji: "🥊" },
  { value: "dance", label: "Dance Instructor", emoji: "💃" },
  { value: "soccer", label: "Soccer Coach", emoji: "⚽" },
  { value: "golf", label: "Golf Instructor", emoji: "⛳" },
  { value: "nutrition", label: "Nutrition Coach", emoji: "🥗" },
  { value: "wellness", label: "Wellness Coach", emoji: "🌿" },
  { value: "performance", label: "Sports Performance", emoji: "🎯" },
  { value: "general", label: "General Training", emoji: "💪" },
]

const timezones = [
  { value: "EST", label: "Eastern Time (EST)" },
  { value: "CST", label: "Central Time (CST)" },
  { value: "MST", label: "Mountain Time (MST)" },
  { value: "PST", label: "Pacific Time (PST)" },
  { value: "UTC", label: "UTC" },
]

const languages = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "pt", label: "Portuguese" },
  { value: "ar", label: "Arabic" },
  { value: "zh", label: "Chinese" },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [specialty, setSpecialty] = useState("")
  const [timezone, setTimezone] = useState("")
  const [language, setLanguage] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")

  const progress = (step / 4) * 100

  const handleNext = () => {
    if (step === 4) {
      localStorage.setItem("onboarding_complete", "true")
      localStorage.setItem("trainer_specialty", specialty)
      router.push("/dashboard")
    } else {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    setStep(step - 1)
  }

  const handleSkip = () => {
    localStorage.setItem("onboarding_complete", "true")
    router.push("/dashboard")
  }

  const canProceed = () => {
    if (step === 1) return specialty !== ""
    if (step === 2) return timezone !== "" && language !== ""
    return true
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">Step {step} of 4</span>
            <span className="text-sm font-semibold text-primary">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Main Card */}
        <Card className="border-2 border-border/50 bg-card/80 backdrop-blur-xl p-8">
          {/* Step 1: Specialty Selection */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Choose Your Specialty</h2>
                <p className="text-muted-foreground">This helps us customize your experience</p>
              </div>

              <div className="space-y-2">
                <Label>Primary Training Focus</Label>
                <Select value={specialty} onValueChange={setSpecialty}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select your specialty..." />
                  </SelectTrigger>
                  <SelectContent>
                    {specialties.map((spec) => (
                      <SelectItem key={spec.value} value={spec.value}>
                        <span className="flex items-center gap-2">
                          <span>{spec.emoji}</span>
                          <span>{spec.label}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {specialty && (
                <Card className="bg-primary/5 border-primary/10 p-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-white mb-2">What this means for you:</h3>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>AI-generated content matches your sport's terminology</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>Workout plans include sport-specific exercises and drills</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>Social media posts use relevant hashtags and language</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Step 2: Preferences */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Set Your Preferences</h2>
                <p className="text-muted-foreground">Customize your dashboard experience</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select your timezone..." />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select your language..." />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Profile */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Complete Your Profile</h2>
                <p className="text-muted-foreground">Optional - you can skip this step</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Enter your first name"
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Enter your last name"
                    className="h-12"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Complete */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in duration-500 text-center">
              <div className="mb-8">
                <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-10 w-10 text-primary" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">You're All Set! 🎉</h2>
                <p className="text-muted-foreground">Your dashboard is ready to use</p>
              </div>

              <div className="grid gap-4 md:grid-cols-3 text-left">
                <Card className="bg-muted/50 border-0 p-4">
                  <Sparkles className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-semibold text-white mb-1">AI Assistant</h3>
                  <p className="text-sm text-muted-foreground">Get help with content and planning</p>
                </Card>

                <Card className="bg-muted/50 border-0 p-4">
                  <Users className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-semibold text-white mb-1">Client Management</h3>
                  <p className="text-sm text-muted-foreground">Track progress and schedules</p>
                </Card>

                <Card className="bg-muted/50 border-0 p-4">
                  <TrendingUp className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-semibold text-white mb-1">Marketing Tools</h3>
                  <p className="text-sm text-muted-foreground">Grow your training business</p>
                </Card>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-border">
            <Button variant="ghost" onClick={handleBack} disabled={step === 1} className="text-muted-foreground">
              Back
            </Button>

            <Button onClick={handleNext} disabled={!canProceed()} className="min-w-32">
              {step === 4 ? "Launch Dashboard" : "Continue"}
            </Button>
          </div>

          {step < 4 && (
            <div className="text-center mt-4">
              <Button variant="link" onClick={handleSkip} className="text-muted-foreground">
                I'll do this later
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
