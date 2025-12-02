"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, TrendingUp, ExternalLink, Mail, MessageCircle, ArrowRight } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

interface DailyLead {
    id: string
    name: string | null
    email: string | null
    company: string | null
    title: string | null
    source: string
    sourceUrl: string | null
    content: string
    context: string | null
    matchScore: number
    status: string
    createdAt: string
}

export function DailyLeadsWidget() {
    const [leads, setLeads] = useState<DailyLead[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [todayCount, setTodayCount] = useState(0)

    useEffect(() => {
        fetchTodayLeads()
    }, [])

    const fetchTodayLeads = async () => {
        try {
            setIsLoading(true)
            const response = await fetch('/api/daily-leads?limit=5&status=new')
            if (!response.ok) throw new Error('Failed to fetch leads')
            const data = await response.json()
            setLeads(data.leads || [])
            setTodayCount(data.todayCount || 0)
        } catch (error) {
            console.error('Error fetching daily leads:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const getSourceIcon = (source: string) => {
        switch (source) {
            case 'reddit':
                return <MessageCircle className="h-4 w-4" />
            case 'apollo':
                return <TrendingUp className="h-4 w-4" />
            case 'twitter':
                return <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
            default:
                return <Mail className="h-4 w-4" />
        }
    }

    const getSourceColor = (source: string) => {
        switch (source) {
            case 'reddit':
                return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
            case 'apollo':
                return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
            case 'twitter':
                return 'bg-sky-500/10 text-sky-500 border-sky-500/20'
            default:
                return 'bg-green-500/10 text-green-500 border-green-500/20'
        }
    }

    if (isLoading) {
        return (
            <Card className="glass border-border/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        Today's Leads
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">Loading...</div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="glass border-border/50">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-primary" />
                            Today's Leads
                            {todayCount > 0 && (
                                <Badge className="bg-primary/20 text-primary">{todayCount} new</Badge>
                            )}
                        </CardTitle>
                        <CardDescription>Fresh opportunities delivered daily</CardDescription>
                    </div>
                    <Link href="/dashboard/client-leads">
                        <Button variant="ghost" size="sm" className="gap-2">
                            View All <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {leads.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-20" />
                        <p>No new leads today. Check back tomorrow!</p>
                    </div>
                ) : (
                    leads.map((lead) => (
                        <div
                            key={lead.id}
                            className="p-4 rounded-lg border border-border/50 bg-card/30 hover:bg-card/50 transition-colors"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className={getSourceColor(lead.source)}>
                                            {getSourceIcon(lead.source)}
                                            <span className="ml-1 capitalize">{lead.source}</span>
                                        </Badge>
                                        <Badge variant="secondary" className="text-xs">
                                            {lead.matchScore}% match
                                        </Badge>
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">
                                            {lead.name || 'Anonymous'}
                                            {lead.company && <span className="text-muted-foreground"> • {lead.company}</span>}
                                        </p>
                                        {lead.title && (
                                            <p className="text-xs text-muted-foreground">{lead.title}</p>
                                        )}
                                    </div>
                                    <p className="text-sm text-foreground/80 line-clamp-2">
                                        {lead.content}
                                    </p>
                                    {lead.context && (
                                        <p className="text-xs text-muted-foreground italic">
                                            {lead.context}
                                        </p>
                                    )}
                                </div>
                                {lead.sourceUrl && (
                                    <Button variant="ghost" size="icon" asChild>
                                        <a href={lead.sourceUrl} target="_blank" rel="noopener noreferrer">
                                            <ExternalLink className="h-4 w-4" />
                                        </a>
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </CardContent>
            {leads.length > 0 && (
                <CardFooter>
                    <Link href="/dashboard/client-leads" className="w-full">
                        <Button className="w-full gap-2">
                            View All {todayCount} Leads <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </CardFooter>
            )}
        </Card>
    )
}
