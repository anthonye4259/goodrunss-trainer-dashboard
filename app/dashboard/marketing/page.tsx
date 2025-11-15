"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Sparkles,
  Target,
  DollarSign,
  Eye,
  MousePointerClick,
  Users,
  Calendar,
  MapPin,
  Zap,
  Edit3,
  Send,
  BarChart3,
  RefreshCw,
  Check,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"

export default function MarketingPage() {
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedAd, setGeneratedAd] = useState<any>(null)
  const [canvaDesignId, setCanvaDesignId] = useState<string | null>(null)
  const [isCanvaOpen, setIsCanvaOpen] = useState(false)
  const [designCompleted, setDesignCompleted] = useState(false)
  const { toast } = useToast()

  const handleGenerateAd = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a description for your ad",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    // Simulate AI generation
    setTimeout(() => {
      setGeneratedAd({
        headline: "Join Our Women's Pickleball Class This Saturday!",
        body: "Perfect for all levels — meet new players and have fun on the courts. Only 6 spots left!",
        budget: 20,
        duration: 3,
        targeting: {
          gender: "Women",
          ageRange: "25-50",
          location: "Atlanta",
          radius: 10,
          interests: ["Pickleball", "Fitness", "Social Sports"],
        },
        canvaTemplateId: "DAGBvF_aBCd",
      })
      setIsGenerating(false)
      setCanvaDesignId(null)
      setIsCanvaOpen(false)
      setDesignCompleted(false)
      toast({
        title: "Ad Generated!",
        description: "Your ad copy and targeting have been created by GIA",
      })
    }, 2000)
  }

  const handleOpenCanva = () => {
    if (!generatedAd) return

    setIsCanvaOpen(true)
    setCanvaDesignId(generatedAd.canvaTemplateId)

    // Simulate design completion after some time
    setTimeout(() => {
      setDesignCompleted(true)
      toast({
        title: "Design Ready!",
        description: "Your ad creative is ready to launch",
      })
    }, 3000)
  }

  const handleDesignComplete = () => {
    setDesignCompleted(true)
    setIsCanvaOpen(false)
  }

  const handleLaunchCampaign = () => {
    toast({
      title: "Campaign Launching!",
      description: "Your ad will be live on Facebook & Instagram shortly",
    })
  }

  const activeCampaigns = [
    {
      id: 1,
      name: "Weekend Pickleball Class",
      status: "active",
      spend: 18.5,
      budget: 20,
      impressions: 2847,
      clicks: 142,
      conversions: 8,
      ctr: 4.99,
      costPerBooking: 2.31,
    },
    {
      id: 2,
      name: "Morning Yoga Sessions",
      status: "active",
      spend: 45.2,
      budget: 50,
      impressions: 5234,
      clicks: 287,
      conversions: 15,
      ctr: 5.48,
      costPerBooking: 3.01,
    },
  ]

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 md:h-12 md:w-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white">
            Marketing <span className="text-primary">Suite</span>
          </h1>
        </div>
        <p className="text-white/60 mt-2 text-sm md:text-base">
          Create, design, and publish paid ads to Facebook & Instagram in minutes using AI
        </p>
      </div>

      <Tabs defaultValue="create" className="space-y-6">
        <TabsList className="bg-card/50 border border-border/50 w-full md:w-auto">
          <TabsTrigger
            value="create"
            className="data-[state=active]:bg-primary data-[state=active]:text-white flex-1 md:flex-none"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">AI Ad Builder</span>
            <span className="sm:hidden">Create</span>
          </TabsTrigger>
          <TabsTrigger
            value="performance"
            className="data-[state=active]:bg-primary data-[state=active]:text-white flex-1 md:flex-none"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Performance
          </TabsTrigger>
        </TabsList>

        {/* AI Ad Builder Tab */}
        <TabsContent value="create" className="space-y-6">
          {/* AI Prompt Section */}
          <Card className="bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-orange-500/10 border-purple-500/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2 text-lg md:text-xl">
                <Sparkles className="h-5 w-5 text-purple-400" />
                Describe Your Ad Goal
              </CardTitle>
              <CardDescription className="text-sm">
                Tell GIA what you want to promote and let AI generate your ad copy, targeting, and design
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="prompt" className="text-white">
                  What do you want to promote?
                </Label>
                <Textarea
                  id="prompt"
                  placeholder='Example: "Promote my 6PM pickleball class this weekend in Atlanta for $25"'
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[100px] bg-black/20 border-white/10 text-white placeholder:text-white/40"
                />
              </div>
              <Button
                onClick={handleGenerateAd}
                disabled={!prompt || isGenerating}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating with AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Ad with GIA
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Generated Ad Preview */}
          {generatedAd && (
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Ad Copy & Targeting */}
              <div className="space-y-6">
                <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Generated Ad Copy</CardTitle>
                    <CardDescription>AI-generated headline and description for your ad</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-white">Headline</Label>
                      <Input value={generatedAd.headline} className="bg-black/20 border-white/10 text-white" readOnly />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Body Text</Label>
                      <Textarea
                        value={generatedAd.body}
                        className="min-h-[100px] bg-black/20 border-white/10 text-white"
                        readOnly
                      />
                    </div>
                    <Button variant="outline" className="w-full bg-transparent" size="sm">
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit Copy
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2 text-lg">
                      <Target className="h-5 w-5 text-primary" />
                      Suggested Targeting
                    </CardTitle>
                    <CardDescription>AI-recommended audience for your ad</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-white/60 text-xs">Gender</Label>
                        <p className="text-white font-medium">{generatedAd.targeting.gender}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-white/60 text-xs">Age Range</Label>
                        <p className="text-white font-medium">{generatedAd.targeting.ageRange}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-white/60 text-xs">Location</Label>
                        <p className="text-white font-medium flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {generatedAd.targeting.location}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-white/60 text-xs">Radius</Label>
                        <p className="text-white font-medium">{generatedAd.targeting.radius} miles</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/60 text-xs">Interests</Label>
                      <div className="flex flex-wrap gap-2">
                        {generatedAd.targeting.interests.map((interest: string) => (
                          <Badge key={interest} variant="secondary" className="bg-primary/20 text-primary">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button variant="outline" className="w-full bg-transparent" size="sm">
                      <Edit3 className="h-4 w-4 mr-2" />
                      Customize Targeting
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2 text-lg">
                      <DollarSign className="h-5 w-5 text-primary" />
                      Budget & Duration
                    </CardTitle>
                    <CardDescription>Suggested campaign budget and timeline</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white">Daily Budget</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                          <Input
                            type="number"
                            value={generatedAd.budget}
                            className="pl-9 bg-black/20 border-white/10 text-white"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white">Duration (days)</Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                          <Input
                            type="number"
                            value={generatedAd.duration}
                            className="pl-9 bg-black/20 border-white/10 text-white"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                      <div className="flex items-center justify-between">
                        <span className="text-white/80 text-sm md:text-base">Total Campaign Cost</span>
                        <span className="text-xl md:text-2xl font-bold text-primary">
                          ${(generatedAd.budget * generatedAd.duration).toFixed(2)}
                        </span>
                      </div>
                      <p className="text-xs text-white/60 mt-2">
                        Includes 15% GoodRunss platform fee • Charged to your Stripe account
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Design & Launch */}
              <div className="space-y-6">
                <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white flex items-center gap-2 text-lg">
                        <Edit3 className="h-5 w-5 text-blue-400" />
                        Design Your Ad Creative
                      </CardTitle>
                      {designCompleted && (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                          <Check className="h-3 w-3 mr-1" />
                          Design Ready
                        </Badge>
                      )}
                    </div>
                    <CardDescription>
                      {isCanvaOpen
                        ? "Customize your design in Canva - changes sync automatically"
                        : "Create stunning ad visuals with Canva integration powered by GIA"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Canva Embed/Preview */}
                    {isCanvaOpen ? (
                      <div className="space-y-4">
                        {/* Simulated Canva Editor Embed */}
                        <div className="aspect-square rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-1 relative overflow-hidden">
                          <div className="w-full h-full bg-black/90 rounded-xl flex flex-col">
                            {/* Canva Editor Header */}
                            <div className="flex items-center justify-between p-4 border-b border-white/10">
                              <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                                  <span className="text-white font-bold text-sm">C</span>
                                </div>
                                <span className="text-white text-sm font-medium hidden sm:inline">Canva Editor</span>
                              </div>
                              <Badge className="bg-green-500/20 text-green-400 border-0 text-xs">
                                <div className="h-2 w-2 rounded-full bg-green-400 mr-1 animate-pulse"></div>
                                Live
                              </Badge>
                            </div>

                            {/* Canva Canvas Area */}
                            <div className="flex-1 p-4 md:p-8 flex items-center justify-center">
                              <div className="aspect-square w-full max-w-[300px] rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 p-4 md:p-6 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-2xl">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.1),transparent)]"></div>
                                <div className="relative space-y-3">
                                  <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto">
                                    <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-white" />
                                  </div>
                                  <div className="space-y-2">
                                    <h3 className="text-lg md:text-xl font-bold text-white leading-tight">
                                      {generatedAd.headline}
                                    </h3>
                                    <p className="text-white/90 text-xs leading-relaxed">{generatedAd.body}</p>
                                  </div>
                                  <Badge className="bg-white/20 text-white border-0 text-xs">
                                    Powered by GoodRunss
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            {/* Canva Editor Footer */}
                            <div className="p-4 border-t border-white/10 flex items-center justify-between">
                              <p className="text-xs text-white/60 hidden sm:block">Design ID: {canvaDesignId}</p>
                              <Button
                                size="sm"
                                onClick={handleDesignComplete}
                                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white ml-auto"
                              >
                                <Check className="h-3 w-3 mr-1" />
                                Done Editing
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                          <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                            <Sparkles className="h-4 w-4 text-blue-400" />
                          </div>
                          <p className="text-xs text-white/80">
                            GIA pre-filled your ad copy and branding. Customize colors, fonts, and images as needed.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Preview before opening Canva */}
                        <div className="aspect-square rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 p-6 md:p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.1),transparent)]"></div>
                          <div className="relative space-y-4">
                            <div className="h-12 w-12 md:h-16 md:w-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto">
                              <Sparkles className="h-6 w-6 md:h-8 md:w-8 text-white" />
                            </div>
                            <div className="space-y-2">
                              <h3 className="text-xl md:text-2xl font-bold text-white">{generatedAd.headline}</h3>
                              <p className="text-white/80 text-sm">{generatedAd.body}</p>
                            </div>
                            <Badge className="bg-white/20 text-white border-0">Powered by GoodRunss</Badge>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Button
                            onClick={handleOpenCanva}
                            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                            size="lg"
                          >
                            <Edit3 className="h-4 w-4 mr-2" />
                            Open in Canva Editor
                          </Button>
                          <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
                            <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
                            <p className="text-xs text-white/80">
                              GIA has prepared a custom template with your ad copy, colors, and branding ready to go
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card
                  className={`bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20 backdrop-blur-sm transition-opacity ${!designCompleted ? "opacity-50" : ""}`}
                >
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2 text-lg">
                      <Send className="h-5 w-5 text-green-400" />
                      Launch Your Campaign
                    </CardTitle>
                    <CardDescription>
                      {designCompleted ? "Publish to Facebook & Instagram" : "Complete your design in Canva first"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <Label className="text-white">Select Platforms</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          variant="outline"
                          className="h-auto py-4 flex-col gap-2 bg-transparent"
                          disabled={!designCompleted}
                        >
                          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">f</span>
                          </div>
                          <span className="text-white text-sm">Facebook</span>
                        </Button>
                        <Button
                          variant="outline"
                          className="h-auto py-4 flex-col gap-2 bg-transparent"
                          disabled={!designCompleted}
                        >
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">IG</span>
                          </div>
                          <span className="text-white text-sm">Instagram</span>
                        </Button>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/60">Campaign Budget</span>
                        <span className="text-white font-medium">${generatedAd.budget * generatedAd.duration}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/60">Platform Fee (15%)</span>
                        <span className="text-white font-medium">
                          ${(generatedAd.budget * generatedAd.duration * 0.15).toFixed(2)}
                        </span>
                      </div>
                      <div className="h-px bg-white/10 my-2"></div>
                      <div className="flex items-center justify-between">
                        <span className="text-white font-medium">Total Charge</span>
                        <span className="text-xl md:text-2xl font-bold text-primary">
                          ${(generatedAd.budget * generatedAd.duration * 1.15).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <Button
                      disabled={!designCompleted}
                      onClick={handleLaunchCampaign}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      size="lg"
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      {designCompleted ? "Launch Campaign Now" : "Complete Design First"}
                    </Button>

                    <p className="text-xs text-white/60 text-center">
                      By launching, you agree to be charged via your connected Stripe account
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Quick Tips */}
          {!generatedAd && (
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-white">Pro Tips for Better Ads</h3>
                    <ul className="text-sm text-white/70 space-y-1 list-disc list-inside">
                      <li>Be specific about your target audience (age, location, interests)</li>
                      <li>Include pricing and time details to attract serious bookings</li>
                      <li>Mention limited spots or urgency to drive faster conversions</li>
                      <li>Start with a small budget ($15-25) to test what works</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          {/* Performance Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20 backdrop-blur-sm">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                  <Eye className="h-5 w-5 text-blue-400" />
                  <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
                    +12.5%
                  </Badge>
                </div>
                <p className="text-sm text-white/60 mb-1">Total Impressions</p>
                <p className="text-2xl md:text-3xl font-bold text-white">8,081</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20 backdrop-blur-sm">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                  <MousePointerClick className="h-5 w-5 text-purple-400" />
                  <Badge variant="secondary" className="bg-purple-500/20 text-purple-400">
                    +8.3%
                  </Badge>
                </div>
                <p className="text-sm text-white/60 mb-1">Total Clicks</p>
                <p className="text-2xl md:text-3xl font-bold text-white">429</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20 backdrop-blur-sm">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                  <Users className="h-5 w-5 text-green-400" />
                  <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                    +15.2%
                  </Badge>
                </div>
                <p className="text-sm text-white/60 mb-1">Conversions</p>
                <p className="text-2xl md:text-3xl font-bold text-white">23</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 border-orange-500/20 backdrop-blur-sm">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                  <DollarSign className="h-5 w-5 text-orange-400" />
                  <Badge variant="secondary" className="bg-orange-500/20 text-orange-400">
                    -5.1%
                  </Badge>
                </div>
                <p className="text-sm text-white/60 mb-1">Cost per Booking</p>
                <p className="text-2xl md:text-3xl font-bold text-white">$2.77</p>
              </CardContent>
            </Card>
          </div>

          {/* Active Campaigns */}
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Active Campaigns</CardTitle>
              <CardDescription>Monitor and manage your running ad campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeCampaigns.map((campaign) => (
                  <Card key={campaign.id} className="bg-black/20 border-white/10">
                    <CardContent className="p-4 md:p-6">
                      <div className="flex flex-col sm:flex-row items-start justify-between mb-4 gap-3">
                        <div>
                          <h3 className="font-semibold text-white mb-1">{campaign.name}</h3>
                          <Badge className="bg-green-500/20 text-green-400 border-0">Active</Badge>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="text-sm text-white/60">Spend</p>
                          <p className="text-xl font-bold text-white">
                            ${campaign.spend} / ${campaign.budget}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-white/60 mb-1">Impressions</p>
                          <p className="text-base md:text-lg font-semibold text-white">
                            {campaign.impressions.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-white/60 mb-1">Clicks</p>
                          <p className="text-base md:text-lg font-semibold text-white">{campaign.clicks}</p>
                        </div>
                        <div>
                          <p className="text-xs text-white/60 mb-1">Conversions</p>
                          <p className="text-base md:text-lg font-semibold text-white">{campaign.conversions}</p>
                        </div>
                        <div>
                          <p className="text-xs text-white/60 mb-1">CTR</p>
                          <p className="text-base md:text-lg font-semibold text-primary">{campaign.ctr}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-white/60 mb-1">Cost/Booking</p>
                          <p className="text-base md:text-lg font-semibold text-primary">${campaign.costPerBooking}</p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                          <Edit3 className="h-3 w-3 mr-2" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                          <RefreshCw className="h-3 w-3 mr-2" />
                          Boost Again
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-400 hover:text-red-300 bg-transparent">
                          Pause
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
