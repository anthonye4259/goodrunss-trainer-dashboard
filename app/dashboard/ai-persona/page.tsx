"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Upload, Mic, Video, User, CheckCircle, ArrowRight, ArrowLeft, Play } from "lucide-react"
import { useRouter } from "next/navigation"

export default function AIPersonaStudioPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [voiceFile, setVoiceFile] = useState<File | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const [personaData, setPersonaData] = useState({
    name: "",
    sportsSpecialty: "",
    tone: "",
    drillFocus: "",
    teachingStyle: "",
    experience: "",
    bio: "",
  })

  const totalSteps = 5
  const progress = (currentStep / totalSteps) * 100

  const handleVoiceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setVoiceFile(file)
      toast({
        title: "Voice sample uploaded",
        description: `${file.name} has been uploaded successfully.`,
      })
    }
  }

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setVideoFile(file)
      toast({
        title: "Video uploaded",
        description: `${file.name} has been uploaded successfully.`,
      })
    }
  }

  const handleRecording = () => {
    setIsRecording(!isRecording)
    if (!isRecording) {
      toast({
        title: "Recording started",
        description: "Speak clearly for at least 30 seconds.",
      })
      // Simulate recording
      setTimeout(() => {
        setIsRecording(false)
        setVoiceFile(new File([], "recorded-voice.mp3"))
        toast({
          title: "Recording complete",
          description: "Your voice sample has been captured.",
        })
      }, 3000)
    }
  }

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handlePublish = async () => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "AI Persona Published!",
        description: "Your AI persona is now live and discoverable.",
      })
      router.push("/dashboard/ai-persona/my-persona")
    }, 2000)
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Record Your Voice</h2>
              <p className="text-muted-foreground">
                Upload a voice sample or record directly. We need at least 30 seconds of clear speech.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="p-6 border-2 border-dashed border-border hover:border-primary/50 transition-colors">
                <div className="flex flex-col items-center justify-center gap-4 min-h-[200px]">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Upload className="w-8 h-8 text-primary" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold text-white mb-2">Upload Audio File</h3>
                    <p className="text-sm text-muted-foreground mb-4">MP3, WAV, or M4A (max 10MB)</p>
                    <Input
                      type="file"
                      accept="audio/*"
                      onChange={handleVoiceUpload}
                      className="hidden"
                      id="voice-upload"
                    />
                    <Label htmlFor="voice-upload">
                      <Button variant="outline" className="cursor-pointer bg-transparent" asChild>
                        <span>Choose File</span>
                      </Button>
                    </Label>
                    {voiceFile && <p className="text-sm text-primary mt-2">✓ {voiceFile.name}</p>}
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-2 border-dashed border-border hover:border-primary/50 transition-colors">
                <div className="flex flex-col items-center justify-center gap-4 min-h-[200px]">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center ${isRecording ? "bg-red-500/20 animate-pulse" : "bg-primary/10"}`}
                  >
                    <Mic className={`w-8 h-8 ${isRecording ? "text-red-500" : "text-primary"}`} />
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold text-white mb-2">Record Now</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {isRecording ? "Recording in progress..." : "Click to start recording"}
                    </p>
                    <Button onClick={handleRecording} variant={isRecording ? "destructive" : "default"}>
                      {isRecording ? "Stop Recording" : "Start Recording"}
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Add Video or Teaching Style</h2>
              <p className="text-muted-foreground">
                Upload a training video or select your teaching style preferences.
              </p>
            </div>

            <Card className="p-6 border-2 border-dashed border-border hover:border-primary/50 transition-colors mb-6">
              <div className="flex flex-col items-center justify-center gap-4 min-h-[200px]">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Video className="w-8 h-8 text-primary" />
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-white mb-2">Upload Training Video</h3>
                  <p className="text-sm text-muted-foreground mb-4">MP4, MOV, or AVI (max 100MB)</p>
                  <Input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                    id="video-upload"
                  />
                  <Label htmlFor="video-upload">
                    <Button variant="outline" className="cursor-pointer bg-transparent" asChild>
                      <span>Choose Video</span>
                    </Button>
                  </Label>
                  {videoFile && <p className="text-sm text-primary mt-2">✓ {videoFile.name}</p>}
                </div>
              </div>
            </Card>

            <div className="space-y-4">
              <div>
                <Label htmlFor="teaching-style">Teaching Style</Label>
                <Select
                  value={personaData.teachingStyle}
                  onValueChange={(value) => setPersonaData({ ...personaData, teachingStyle: value })}
                >
                  <SelectTrigger id="teaching-style">
                    <SelectValue placeholder="Select your teaching style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="motivational">Motivational & Energetic</SelectItem>
                    <SelectItem value="technical">Technical & Detailed</SelectItem>
                    <SelectItem value="supportive">Supportive & Encouraging</SelectItem>
                    <SelectItem value="disciplined">Disciplined & Structured</SelectItem>
                    <SelectItem value="adaptive">Adaptive & Flexible</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="experience">Years of Experience</Label>
                <Select
                  value={personaData.experience}
                  onValueChange={(value) => setPersonaData({ ...personaData, experience: value })}
                >
                  <SelectTrigger id="experience">
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-3">1-3 years</SelectItem>
                    <SelectItem value="3-5">3-5 years</SelectItem>
                    <SelectItem value="5-10">5-10 years</SelectItem>
                    <SelectItem value="10+">10+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Define Your Persona Traits</h2>
              <p className="text-muted-foreground">Tell us about your expertise and coaching approach.</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="persona-name">Persona Name</Label>
                <Input
                  id="persona-name"
                  placeholder="e.g., Coach Mike's Speed Training AI"
                  value={personaData.name}
                  onChange={(e) => setPersonaData({ ...personaData, name: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="sports-specialty">Sports Specialty</Label>
                <Select
                  value={personaData.sportsSpecialty}
                  onValueChange={(value) => setPersonaData({ ...personaData, sportsSpecialty: value })}
                >
                  <SelectTrigger id="sports-specialty">
                    <SelectValue placeholder="Select your specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basketball">Basketball</SelectItem>
                    <SelectItem value="football">Football</SelectItem>
                    <SelectItem value="soccer">Soccer</SelectItem>
                    <SelectItem value="baseball">Baseball</SelectItem>
                    <SelectItem value="track">Track & Field</SelectItem>
                    <SelectItem value="tennis">Tennis</SelectItem>
                    <SelectItem value="golf">Golf</SelectItem>
                    <SelectItem value="general">General Training</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="tone">Coaching Tone</Label>
                <Select
                  value={personaData.tone}
                  onValueChange={(value) => setPersonaData({ ...personaData, tone: value })}
                >
                  <SelectTrigger id="tone">
                    <SelectValue placeholder="Select coaching tone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="friendly">Friendly & Casual</SelectItem>
                    <SelectItem value="professional">Professional & Formal</SelectItem>
                    <SelectItem value="intense">Intense & Demanding</SelectItem>
                    <SelectItem value="calm">Calm & Patient</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="drill-focus">Primary Drill Focus</Label>
                <Input
                  id="drill-focus"
                  placeholder="e.g., Speed, Agility, Strength, Endurance"
                  value={personaData.drillFocus}
                  onChange={(e) => setPersonaData({ ...personaData, drillFocus: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="bio">Bio / Description</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell players about your coaching philosophy and what makes your training unique..."
                  value={personaData.bio}
                  onChange={(e) => setPersonaData({ ...personaData, bio: e.target.value })}
                  rows={4}
                />
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Review Your AI Persona</h2>
              <p className="text-muted-foreground">Preview how your AI persona will appear to players.</p>
            </div>

            <Card className="p-6 bg-muted/50">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-1">{personaData.name || "Your Persona Name"}</h3>
                  <p className="text-sm text-primary mb-2">{personaData.sportsSpecialty || "Sports Specialty"}</p>
                  <p className="text-sm text-muted-foreground">{personaData.bio || "Your bio will appear here..."}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Teaching Style</p>
                  <p className="text-sm font-medium text-white">{personaData.teachingStyle || "Not set"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Experience</p>
                  <p className="text-sm font-medium text-white">{personaData.experience || "Not set"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Coaching Tone</p>
                  <p className="text-sm font-medium text-white">{personaData.tone || "Not set"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Drill Focus</p>
                  <p className="text-sm font-medium text-white">{personaData.drillFocus || "Not set"}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">Voice sample uploaded</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">Teaching style configured</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">Persona traits defined</span>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-primary/10 border-primary/20">
              <div className="flex items-start gap-3">
                <Play className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-white mb-1">Test Your AI Persona</p>
                  <p className="text-xs text-muted-foreground">
                    Once published, you can test your AI persona in the GIA chat interface.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Ready to Publish!</h2>
              <p className="text-muted-foreground">
                Your AI persona is ready to go live. Players will be able to discover and train with your AI clone.
              </p>
            </div>

            <Card className="p-6 bg-muted/50">
              <h3 className="font-semibold text-white mb-4">What happens next?</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">1</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">AI Processing</p>
                    <p className="text-xs text-muted-foreground">
                      We'll process your voice and video to create your AI clone (takes 5-10 minutes)
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">2</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Marketplace Listing</p>
                    <p className="text-xs text-muted-foreground">
                      Your persona will appear in the AI Coach marketplace
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">3</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Start Earning</p>
                    <p className="text-xs text-muted-foreground">
                      Earn royalties every time a player trains with your AI persona
                    </p>
                  </div>
                </li>
              </ul>
            </Card>

            <Card className="p-4 bg-primary/10 border-primary/20">
              <p className="text-sm text-white">
                <strong>Pricing:</strong> Players pay $5/session with your AI persona. You earn 70% ($3.50) per session.
              </p>
            </Card>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">AI Persona Studio</h1>
          <p className="text-muted-foreground">Create your AI coaching persona in 5 simple steps</p>
        </div>

        {/* Progress Bar */}
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-white">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-4">
            {["Voice", "Video", "Traits", "Review", "Publish"].map((step, index) => (
              <div key={step} className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-1 ${
                    index + 1 <= currentStep ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {index + 1}
                </div>
                <span className="text-xs text-muted-foreground hidden md:block">{step}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Step Content */}
        <Card className="p-6 md:p-8 mb-6">{renderStep()}</Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={handleBack} disabled={currentStep === 1}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {currentStep < totalSteps ? (
            <Button onClick={handleNext}>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handlePublish} disabled={isLoading}>
              {isLoading ? "Publishing..." : "Publish Persona"}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
