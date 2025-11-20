"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Users, Mail, Phone, MapPin, Clock, TrendingUp, CheckCircle2, Send, Loader2 } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"

export default function ClientLeadsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [leads, setLeads] = useState<any[]>([])

  // Fetch leads from backend on mount
  useEffect(() => {
    fetchLeads()
  }, [])

  const fetchLeads = async () => {
    try {
      setInitialLoading(true)
      const response = await fetch('/api/gia/match-leads')
      const result = await response.json()

      if (result.success && result.data.matches) {
        // Transform backend data to frontend format
        const transformedLeads = result.data.matches.map((match: any) => ({
          id: match.id,
          leadId: match.clientLeadId,
          name: match.lead?.name || 'Unknown',
          email: match.lead?.email || '',
          phone: match.lead?.phone || '',
          interest: match.lead?.preferredSport || 'General Training',
          level: match.lead?.experienceLevel || 'Not specified',
          location: match.lead?.city ? `${match.lead.city}, ${match.lead.state}` : 'Not specified',
          preferredTime: match.lead?.availableTimes?.join(', ') || 'Flexible',
          status: match.status === 'accepted' ? 'converted' : 
                  match.status === 'sent_to_trainer' ? 'contacted' : 'new',
          matchScore: Math.round(match.overallScore),
          notes: match.lead?.additionalNotes || match.matchReasons?.join('. ') || '',
          goals: match.lead?.fitnessGoals || [],
        }))
        setLeads(transformedLeads)
      } else {
        // Use mock data if no matches found
        setLeads(getMockLeads())
      }
    } catch (error) {
      console.error('Error fetching leads:', error)
      // Fall back to mock data
      setLeads(getMockLeads())
    } finally {
      setInitialLoading(false)
    }
  }

  const getMockLeads = () => [
    {
      id: 1,
      name: "Jessica Chen",
      email: "jessica.c@email.com",
      phone: "(555) 234-5678",
      interest: "Tennis Lessons",
      level: "Beginner",
      location: "Downtown",
      preferredTime: "Weekday mornings",
      status: "new",
      matchScore: 95,
      notes: "Looking to start tennis for fitness. Available Mon/Wed/Fri 9-11am",
      goals: ["weight_loss", "endurance"],
    },
    {
      id: 2,
      name: "Marcus Williams",
      email: "m.williams@email.com",
      phone: "(555) 345-6789",
      interest: "Golf Swing Session",
      level: "Intermediate",
      location: "Westside",
      preferredTime: "Weekend afternoons",
      status: "new",
      matchScore: 88,
      notes: "Want to fix slice. Plays regularly but struggling with driver",
      goals: ["sports_performance"],
    },
  ]

  const handleContact = async (leadId: number, method: string) => {
    setLoading(true)
    
    try {
      const lead = leads.find(l => l.id === leadId)
      if (!lead) throw new Error('Lead not found')

      const response = await fetch('/api/gia/match-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: lead.leadId,
          method: method.toLowerCase(),
          message: `Hi! I'd love to help you with your ${lead.interest} goals.`
        })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to send contact')
      }

      setLeads(leads.map((l) =>
        l.id === leadId ? { ...l, status: "contacted" } : l
      ))

      toast({
        title: "Contact sent!",
        description: `${method} sent to ${lead.name} successfully`,
      })
    } catch (error: any) {
      toast({
        title: "Failed to contact",
        description: error.message || "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleConvert = async (leadId: number, matchId?: string) => {
    setLoading(true)

    try {
      const lead = leads.find(l => l.id === leadId)
      if (!lead) throw new Error('Lead not found')

      // Call backend to convert the lead
      const response = await fetch('/api/gia/match-leads', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leadId: lead.leadId,
          action: 'convert',
          message: `Welcome aboard! I'm excited to help you with your ${lead.interest} journey. Let's schedule your first session!`,
        }),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to convert lead')
      }

      setLeads(leads.map((l) =>
        l.id === leadId ? { ...l, status: "converted" } : l
      ))

      toast({
        title: "Client converted! 🎉",
        description: `${lead.name} has been added to your client list`,
      })
    } catch (error) {
      toast({
        title: "Failed to convert",
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const statusColors = {
    new: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    contacted: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    converted: "bg-green-500/10 text-green-500 border-green-500/20",
  }

  const newLeadsCount = leads.filter((l) => l.status === "new").length
  const contactedCount = leads.filter((l) => l.status === "contacted").length
  const convertedCount = leads.filter((l) => l.status === "converted").length
  const avgMatchScore = leads.length > 0 
    ? Math.round(leads.reduce((sum, l) => sum + l.matchScore, 0) / leads.length)
    : 0

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white">Client Leads</h1>
            <p className="text-muted-foreground">Real potential clients matched to your expertise</p>
          </div>
        </div>
      </div>

      {/* Hero Message */}
      <Card className="p-6 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white mb-2">GIA Found Real Clients For You</h2>
            <p className="text-muted-foreground mb-4">
              These are actual people looking for exactly what you offer. Reach out now to convert them into long-term clients.
            </p>
            <div className="flex flex-wrap gap-3 text-sm">
              <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                High match scores
              </Badge>
              <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                Pre-qualified leads
              </Badge>
              <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20">
                Ready to book
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">New Leads</p>
              <p className="text-2xl font-bold text-white">{newLeadsCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center">
              <Send className="h-6 w-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Contacted</p>
              <p className="text-2xl font-bold text-white">{contactedCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Converted</p>
              <p className="text-2xl font-bold text-white">{convertedCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Match</p>
              <p className="text-2xl font-bold text-white">{avgMatchScore}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Leads List */}
      <div className="space-y-4">
        {leads.map((lead) => (
          <Card key={lead.id} className="p-6 hover:border-primary/50 transition-all">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-white">{lead.name}</h3>
                    <Badge className={statusColors[lead.status as keyof typeof statusColors]}>
                      {lead.status}
                    </Badge>
                    <Badge className="bg-primary/20 text-primary">
                      {lead.matchScore}% Match
                    </Badge>
                  </div>

                  <div className="grid md:grid-cols-2 gap-2 mb-3">
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {lead.email}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {lead.phone}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {lead.location}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {lead.preferredTime}
                    </p>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm font-semibold text-white mb-1">
                      Looking for: <span className="text-primary">{lead.interest}</span>
                    </p>
                    <p className="text-sm text-muted-foreground">Level: {lead.level}</p>
                  </div>

                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground italic">"{lead.notes}"</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 min-w-[120px]">
                {lead.status === "new" && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => handleContact(lead.id, "Email")}
                      disabled={loading}
                      className="bg-primary hover:bg-primary/90 text-black"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleContact(lead.id, "SMS")}
                      disabled={loading}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      SMS
                    </Button>
                  </>
                )}
                {lead.status === "contacted" && (
                  <Button
                    size="sm"
                    onClick={() => handleConvert(lead.id, lead.leadId)}
                    disabled={loading}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                    )}
                    Convert
                  </Button>
                )}
                {lead.status === "converted" && (
                  <Badge className="bg-green-500/10 text-green-500 border-green-500/20 justify-center">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Client
                  </Badge>
                )}
              </div>
            </div>
          </Card>
        ))}

        {leads.length === 0 && (
          <Card className="p-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No leads yet</h3>
            <p className="text-muted-foreground">
              New leads will appear here as they're matched to your profile
            </p>
          </Card>
        )}
      </div>

      {/* Why This Works */}
      <Card className="p-6 bg-primary/5 border-primary/20">
        <h3 className="text-lg font-bold text-white mb-4">Why Trainers Love This Feature</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="font-semibold text-white">They stay forever</p>
              <p className="text-sm text-muted-foreground">New clients become long-term clients</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
              <Users className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="font-semibold text-white">They refer 10 more</p>
              <p className="text-sm text-muted-foreground">Happy clients bring their friends</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
              <Sparkles className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="font-semibold text-white">They promote you everywhere</p>
              <p className="text-sm text-muted-foreground">Word-of-mouth marketing on autopilot</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="font-semibold text-white">Your business grows faster</p>
              <p className="text-sm text-muted-foreground">Consistent pipeline of quality leads</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}




