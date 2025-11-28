"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Rocket, Plus, Download, Users, TrendingUp, Sparkles } from "lucide-react"
import { LeadMagnetBuilder } from "@/components/growth/lead-magnet-builder"

interface LeadMagnet {
  id: string
  title: string
  description: string
  format: string
  landingPageUrl: string
  downloads: number
  leads: number
  isActive: boolean
  createdAt: string
}

export default function GrowthPage() {
  const [leadMagnets, setLeadMagnets] = useState<LeadMagnet[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showBuilder, setShowBuilder] = useState(false)

  useEffect(() => {
    fetchLeadMagnets()
  }, [])

  const fetchLeadMagnets = async () => {
    try {
      const response = await fetch('/api/gia/generate-lead-magnet')
      if (!response.ok) throw new Error('Failed to fetch')

      const data = await response.json()
      setLeadMagnets(data.leadMagnets || [])
    } catch (error) {
      console.error('Failed to fetch lead magnets:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLeadMagnetCreated = () => {
    setShowBuilder(false)
    fetchLeadMagnets()
  }

  if (showBuilder) {
    return <LeadMagnetBuilder onClose={() => setShowBuilder(false)} onCreated={handleLeadMagnetCreated} />
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
            <Rocket className="h-8 w-8 text-primary" />
            Gia Growth Engine
          </h1>
          <p className="text-muted-foreground mt-2">
            AI-powered client acquisition on autopilot
          </p>
        </div>
        <Button onClick={() => setShowBuilder(true)} size="lg" className="gap-2">
          <Plus className="h-4 w-4" />
          Create Lead Magnet
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Download className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Downloads</p>
                <p className="text-2xl font-bold">
                  {leadMagnets.reduce((sum, lm) => sum + lm.downloads, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Leads Generated</p>
                <p className="text-2xl font-bold">
                  {leadMagnets.reduce((sum, lm) => sum + lm.leads, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold">
                  {leadMagnets.reduce((sum, lm) => sum + lm.downloads, 0) > 0
                    ? ((leadMagnets.reduce((sum, lm) => sum + lm.leads, 0) /
                      leadMagnets.reduce((sum, lm) => sum + lm.downloads, 0)) * 100).toFixed(1)
                    : '0'}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lead Magnets List */}
      {isLoading ? (
        <Card className="glass border-border/50">
          <CardContent className="pt-6 flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      ) : leadMagnets.length === 0 ? (
        <Card className="glass border-border/50 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Sparkles className="h-16 w-16 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Start Growing Your Business</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Create your first AI-generated lead magnet in 60 seconds. Gia will handle everything from content creation to lead nurturing.
              </p>
              <Button onClick={() => setShowBuilder(true)} size="lg" className="gap-2">
                <Plus className="h-4 w-4" />
                Create Your First Lead Magnet
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Your Lead Magnets</h2>
          <div className="grid gap-4">
            {leadMagnets.map((magnet) => (
              <Card key={magnet.id} className="glass border-border/50 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{magnet.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{magnet.description}</p>
                    </div>
                    <Badge variant={magnet.isActive ? "default" : "secondary"}>
                      {magnet.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div>
                        <p className="text-sm text-muted-foreground">Downloads</p>
                        <p className="text-2xl font-bold">{magnet.downloads}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Leads</p>
                        <p className="text-2xl font-bold text-green-500">{magnet.leads}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Conversion</p>
                        <p className="text-2xl font-bold">
                          {magnet.downloads > 0
                            ? ((magnet.leads / magnet.downloads) * 100).toFixed(1)
                            : '0'}%
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        View Landing Page
                      </Button>
                      <Button variant="outline" size="sm">
                        Share
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
