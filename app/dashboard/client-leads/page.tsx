"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Sparkles, Users, Mail, Phone, MapPin, Clock, TrendingUp,
  CheckCircle2, Send, Loader2, MessageCircle, Trash2, ExternalLink,
  MoreHorizontal, Filter
} from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "date-fns"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DailyLead {
  id: string
  name: string | null
  email: string | null
  phone: string | null
  company: string | null
  title: string | null
  location: string | null
  source: string
  sourceUrl: string | null
  content: string
  context: string | null
  matchScore: number
  status: string
  draftReply: string | null
  createdAt: string
}

export default function ClientLeadsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [leads, setLeads] = useState<DailyLead[]>([])
  const [selectedLeads, setSelectedLeads] = useState<string[]>([])
  const [filter, setFilter] = useState<string>('all') // 'all', 'new', 'contacted', 'converted'

  // Fetch leads from backend on mount
  useEffect(() => {
    fetchLeads()
  }, [])

  const fetchLeads = async () => {
    try {
      setInitialLoading(true)
      const response = await fetch('/api/daily-leads?limit=50')
      if (!response.ok) throw new Error('Failed to fetch leads')
      const data = await response.json()
      setLeads(data.leads || [])
    } catch (error) {
      console.error('Error fetching leads:', error)
      toast({
        title: "Failed to load leads",
        description: "Could not fetch your daily leads",
        variant: "destructive",
      })
    } finally {
      setInitialLoading(false)
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLeads(filteredLeads.map(l => l.id))
    } else {
      setSelectedLeads([])
    }
  }

  const handleSelectLead = (leadId: string, checked: boolean) => {
    if (checked) {
      setSelectedLeads(prev => [...prev, leadId])
    } else {
      setSelectedLeads(prev => prev.filter(id => id !== leadId))
    }
  }

  const handleBulkAction = async (action: 'contact' | 'dismiss' | 'contacted') => {
    if (selectedLeads.length === 0) return

    setLoading(true)
    try {
      const response = await fetch('/api/daily-leads/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadIds: selectedLeads,
          action
        })
      })

      if (!response.ok) throw new Error('Failed to perform bulk action')

      const result = await response.json()

      // Optimistic update
      setLeads(prev => prev.map(lead => {
        if (selectedLeads.includes(lead.id)) {
          return { ...lead, status: result.status }
        }
        return lead
      }))

      toast({
        title: "Bulk action successful",
        description: `Updated ${result.count} leads`,
      })

      setSelectedLeads([])
    } catch (error) {
      console.error('Error performing bulk action:', error)
      toast({
        title: "Action failed",
        description: "Could not update leads",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'reddit': return <MessageCircle className="h-4 w-4" />
      case 'apollo': return <TrendingUp className="h-4 w-4" />
      case 'twitter': return <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
      default: return <Mail className="h-4 w-4" />
    }
  }

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'reddit': return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
      case 'apollo': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'twitter': return 'bg-sky-500/10 text-sky-500 border-sky-500/20'
      default: return 'bg-green-500/10 text-green-500 border-green-500/20'
    }
  }

  const filteredLeads = leads.filter(lead => {
    if (filter === 'all') return lead.status !== 'dismissed'
    return lead.status === filter
  })

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-primary" />
            Daily Leads
          </h1>
          <p className="text-muted-foreground mt-1">
            Automated opportunities from Reddit, Twitter, and Corporate Wellness
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => fetchLeads()} disabled={loading}>
            Refresh
          </Button>
          <Button onClick={() => window.location.href = '/dashboard/client-leads/social'} className="gap-2">
            <MessageCircle className="h-4 w-4" />
            Social Scanner
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4 bg-card/50 border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">New Today</p>
              <p className="text-2xl font-bold text-white">
                {leads.filter(l => l.status === 'new' && new Date(l.createdAt).toDateString() === new Date().toDateString()).length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-card/50 border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Users className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Active</p>
              <p className="text-2xl font-bold text-white">
                {leads.filter(l => l.status === 'new').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-card/50 border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Send className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Contacted</p>
              <p className="text-2xl font-bold text-white">
                {leads.filter(l => l.status === 'contacted').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-card/50 border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Converted</p>
              <p className="text-2xl font-bold text-white">
                {leads.filter(l => l.status === 'converted').length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Bulk Action Bar */}
      {selectedLeads.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-card border border-primary/20 shadow-2xl shadow-primary/10 rounded-full px-6 py-3 flex items-center gap-4 animate-in slide-in-from-bottom-4 fade-in duration-300">
          <span className="text-sm font-medium text-white">
            {selectedLeads.length} selected
          </span>
          <div className="h-4 w-px bg-border" />
          <Button
            size="sm"
            onClick={() => handleBulkAction('contacted')}
            disabled={loading}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <CheckCircle2 className="h-4 w-4" />
            Mark Contacted
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleBulkAction('dismiss')}
            disabled={loading}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Dismiss
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSelectedLeads([])}
            className="text-muted-foreground hover:text-white"
          >
            Cancel
          </Button>
        </div>
      )}

      {/* Filters & List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All Active
            </Button>
            <Button
              variant={filter === 'new' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilter('new')}
            >
              New
            </Button>
            <Button
              variant={filter === 'contacted' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilter('contacted')}
            >
              Contacted
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0}
              onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
            />
            <span className="text-sm text-muted-foreground">Select All</span>
          </div>
        </div>

        <div className="grid gap-4">
          {filteredLeads.length === 0 ? (
            <Card className="p-12 text-center border-dashed border-border/50 bg-card/30">
              <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
              <h3 className="text-xl font-semibold text-white mb-2">No leads found</h3>
              <p className="text-muted-foreground">
                {filter === 'all'
                  ? "Wait for the daily cron job to run at 6 AM!"
                  : `No leads with status '${filter}'`}
              </p>
            </Card>
          ) : (
            filteredLeads.map((lead) => (
              <Card
                key={lead.id}
                className={`p-6 transition-all border-border/50 hover:border-primary/30 ${selectedLeads.includes(lead.id) ? 'bg-primary/5 border-primary/50' : 'bg-card/30'
                  }`}
              >
                <div className="flex items-start gap-4">
                  <Checkbox
                    checked={selectedLeads.includes(lead.id)}
                    onCheckedChange={(checked) => handleSelectLead(lead.id, checked as boolean)}
                    className="mt-1"
                  />

                  <div className="flex-1 space-y-3">
                    {/* Header Row */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className={getSourceColor(lead.source)}>
                          {getSourceIcon(lead.source)}
                          <span className="ml-1 capitalize">{lead.source}</span>
                        </Badge>
                        <Badge variant="secondary" className="bg-secondary/50">
                          {lead.matchScore}% Match
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleSelectLead(lead.id, true)}>
                            Select
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setSelectedLeads([lead.id])
                            handleBulkAction('contacted')
                          }}>
                            Mark Contacted
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => {
                            setSelectedLeads([lead.id])
                            handleBulkAction('dismiss')
                          }}>
                            Dismiss
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Content */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">
                        {lead.name || 'Anonymous Lead'}
                        {lead.company && <span className="text-muted-foreground font-normal"> • {lead.company}</span>}
                      </h3>
                      <p className="text-sm text-foreground/80 line-clamp-2 mb-2">
                        {lead.content}
                      </p>
                      {lead.context && (
                        <p className="text-xs text-muted-foreground italic bg-muted/30 p-2 rounded">
                          Context: {lead.context}
                        </p>
                      )}
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      {lead.email && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-3 w-3" /> {lead.email}
                        </div>
                      )}
                      {lead.location && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-3 w-3" /> {lead.location}
                        </div>
                      )}
                      {lead.title && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Users className="h-3 w-3" /> {lead.title}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2">
                      {lead.sourceUrl && (
                        <Button variant="outline" size="sm" asChild className="gap-2">
                          <a href={lead.sourceUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3" />
                            View Source
                          </a>
                        </Button>
                      )}
                      {lead.draftReply && (
                        <Button
                          variant="default"
                          size="sm"
                          className="gap-2"
                          onClick={() => {
                            navigator.clipboard.writeText(lead.draftReply!)
                            toast({ title: "Copied draft reply!" })
                          }}
                        >
                          <Sparkles className="h-3 w-3" />
                          Copy Gia's Draft
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
