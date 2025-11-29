"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Sparkles, Users, TrendingUp, MapPin, Target, Briefcase, Loader2 } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

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
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "America/Phoenix", label: "Arizona (MST)" },
  { value: "America/Anchorage", label: "Alaska (AKT)" },
  { value: "Pacific/Honolulu", label: "Hawaii (HST)" },
]

const businessTypes = [
  { value: "solo", label: "Solo Trainer/Coach", emoji: "👤" },
  { value: "studio", label: "Studio Owner", emoji: "🏢" },
  { value: "gym", label: "Gym Owner", emoji: "🏋️" },
  { value: "facility", label: "Sports Facility", emoji: "🏟️" },
  { value: "online", label: "Online Only", emoji: "💻" },
  { value: "mobile", label: "Mobile/In-Home", emoji: "🚗" },
]

const clientCounts = [
  { value: "0-5", label: "0-5 clients (Just starting)" },
  { value: "6-20", label: "6-20 clients (Growing)" },
  { value: "21-50", label: "21-50 clients (Established)" },
  { value: "51+", label: "51+ clients (Scaling)" },
]

const goals = [
  { value: "get-clients", label: "Get more clients", emoji: "📈", description: "Grow my client base" },
  { value: "save-time", label: "Save time on admin", emoji: "⏱️", description: "Automate repetitive tasks" },
  { value: "better-plans", label: "Create better plans", emoji: "📋", description: "Improve program quality" },
  { value: "marketing", label: "Improve marketing", emoji: "📱", description: "Better social media presence" },
  { value: "organization", label: "Get organized", emoji: "📊", description: "Manage clients better" },
  { value: "scale", label: "Scale my business", emoji: "🚀", description: "Grow beyond 1-on-1" },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  
  // Step 1: Specialty & Business
  const [specialty, setSpecialty] = useState("")
  const [businessType, setBusinessType] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [clientCount, setClientCount] = useState("")
  
  // Step 2: Goals
  const [primaryGoal, setPrimaryGoal] = useState("")
  const [secondaryGoal, setSecondaryGoal] = useState("")
  
  // Step 3: Preferences
  const [timezone, setTimezone] = useState("")

  const progress = (step / 3) * 100

  const handleNext = async () => {
    if (step === 3) {
      // Save all onboarding data to database
      setIsLoading(true)
      setError("")
      
      try {
        const response = await fetch("/api/onboarding", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            specialty,
            businessType,
            city,
            state,
            clientCount,
            primaryGoal,
            secondaryGoal,
            timezone,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to save onboarding data")
        }

        // Success! Redirect to dashboard
        router.push("/dashboard")
      } catch (err: any) {
        console.error("Onboarding save error:", err)
        setError(err.message || "Failed to save. Please try again.")
        setIsLoading(false)
      }
    } else {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    setError("")
    setStep(step - 1)
  }

  const handleSkip = async () => {
    // Still save minimal data even if skipped
    setIsLoading(true)
    try {
      await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          specialty: specialty || "general",
          businessType: businessType || "solo",
          city: "",
          state: "",
          clientCount: "",
          primaryGoal: "",
          secondaryGoal: "",
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      })
    } catch (err) {
      console.error("Skip onboarding error:", err)
    }
    router.push("/dashboard")
  }

  const canProceed = () => {
    if (step === 1) return specialty !== "" && businessType !== "" && city !== "" && state !== ""
    if (step === 2) return primaryGoal !== ""
    if (step === 3) return timezone !== ""
    return true
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">Step {step} of 3</span>
            <span className="text-sm font-semibold text-primary">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Main Card */}
        <Card className="border-2 border-border/50 bg-card/80 backdrop-blur-xl p-8">
          {/* Step 1: Specialty & Business Info */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Tell us about your business</h2>
                <p className="text-muted-foreground">Help us customize your experience</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label>What's your specialty?</Label>
                  <Select value={specialty} onValueChange={setSpecialty}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select your specialty..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px] z-50">
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

                <div className="space-y-2 md:col-span-2">
                  <Label>Business type</Label>
                  <Select value={businessType} onValueChange={setBusinessType}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select your business type..." />
                    </SelectTrigger>
                    <SelectContent className="z-50">
                      {businessTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <span className="flex items-center gap-2">
                            <span>{type.emoji}</span>
                            <span>{type.label}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>City</Label>
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Los Angeles"
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label>State</Label>
                  <Input
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="CA"
                    className="h-12"
                    maxLength={2}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Current client count</Label>
                  <Select value={clientCount} onValueChange={setClientCount}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="How many clients do you have?" />
                    </SelectTrigger>
                    <SelectContent className="z-50">
                      {clientCounts.map((count) => (
                        <SelectItem key={count.value} value={count.value}>
                          {count.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {specialty && businessType && (
                <Card className="bg-primary/5 border-primary/10 p-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white mb-2">We'll personalize:</h3>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="flex-1">AI content for your specific sport/training style</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="flex-1">Dashboard features based on your business type</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="flex-1">Local marketing suggestions for {city || "your area"}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Step 2: Goals */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">What are your goals?</h2>
                <p className="text-muted-foreground">We'll prioritize features that help you achieve them</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Primary goal</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {goals.map((goal) => (
                      <button
                        key={goal.value}
                        onClick={() => setPrimaryGoal(goal.value)}
                        className={`p-4 rounded-lg border-2 text-left transition-all hover:border-primary/50 ${
                          primaryGoal === goal.value
                            ? "border-primary bg-primary/10"
                            : "border-border/50 bg-card/50"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{goal.emoji}</span>
                          <div>
                            <h3 className="font-semibold text-white mb-1">{goal.label}</h3>
                            <p className="text-xs text-muted-foreground">{goal.description}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {primaryGoal && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <Label>Secondary goal (optional)</Label>
                    <Select value={secondaryGoal} onValueChange={setSecondaryGoal}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Choose another goal..." />
                      </SelectTrigger>
                      <SelectContent className="z-50">
                        {goals
                          .filter((g) => g.value !== primaryGoal)
                          .map((goal) => (
                            <SelectItem key={goal.value} value={goal.value}>
                              <span className="flex items-center gap-2">
                                <span>{goal.emoji}</span>
                                <span>{goal.label}</span>
                              </span>
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {primaryGoal && (
                <Card className="bg-primary/5 border-primary/10 p-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="flex items-start gap-3">
                    <Target className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white mb-2">We'll help you:</h3>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        {primaryGoal === "get-clients" && (
                          <>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                              <span>Generate social media content to attract new clients</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                              <span>Match with leads from our marketplace</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                              <span>Track referrals and conversion rates</span>
                            </li>
                          </>
                        )}
                        {primaryGoal === "save-time" && (
                          <>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                              <span>Auto-generate workout plans with AI</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                              <span>Automated scheduling and reminders</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                              <span>Quick document parsing for intake forms</span>
                            </li>
                          </>
                        )}
                        {primaryGoal === "better-plans" && (
                          <>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                              <span>Sport-specific AI workout generator (Gia)</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                              <span>Program templates and progressions</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                              <span>Track client results and adapt programs</span>
                            </li>
                          </>
                        )}
                        {(primaryGoal === "marketing" || primaryGoal === "organization" || primaryGoal === "scale") && (
                          <>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                              <span>Access tools tailored to your goal</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                              <span>Get personalized recommendations</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                              <span>Track progress toward your objectives</span>
                            </li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Step 3: Final Setup */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Almost done!</h2>
                <p className="text-muted-foreground">Just one more thing</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select your timezone..." />
                    </SelectTrigger>
                    <SelectContent className="z-50">
                      {timezones.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Card className="bg-primary/5 border-primary/10 p-6">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                    <CheckCircle2 className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">You're all set! 🎉</h3>
                    <p className="text-sm text-muted-foreground">
                      Your dashboard is customized for <strong>{specialty ? specialties.find(s => s.value === specialty)?.label : "your specialty"}</strong>
                      {city && ` in ${city}, ${state}`}
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-3 pt-4">
                    <div className="bg-card/50 rounded-lg p-3">
                      <Sparkles className="h-6 w-6 text-primary mx-auto mb-2" />
                      <p className="text-xs font-medium">AI Assistant</p>
                    </div>
                    <div className="bg-card/50 rounded-lg p-3">
                      <Users className="h-6 w-6 text-primary mx-auto mb-2" />
                      <p className="text-xs font-medium">Client Management</p>
                    </div>
                    <div className="bg-card/50 rounded-lg p-3">
                      <TrendingUp className="h-6 w-6 text-primary mx-auto mb-2" />
                      <p className="text-xs font-medium">Growth Tools</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive mt-4">
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-border">
            <Button 
              variant="ghost" 
              onClick={handleBack} 
              disabled={step === 1 || isLoading} 
              className="text-muted-foreground"
            >
              Back
            </Button>

            <Button 
              onClick={handleNext} 
              disabled={!canProceed() || isLoading} 
              className="min-w-32"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </div>
              ) : (
                step === 3 ? "Launch Dashboard" : "Continue"
              )}
            </Button>
          </div>

          {step < 3 && (
            <div className="text-center mt-4">
              <Button 
                variant="link" 
                onClick={handleSkip} 
                disabled={isLoading}
                className="text-muted-foreground text-sm"
              >
                I'll do this later
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
