"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Brain, TrendingUp, TrendingDown, AlertTriangle, DollarSign, Users, ArrowRight, MessageSquare, Zap } from "lucide-react"
import Link from "next/link"
import { MessageDraftModal } from "@/components/message-draft-modal"

interface DailyBriefingData {
    summary: {
        atRiskClients: number
        highRiskClients: number
        revenueGrowth: number
        upsellOpportunities: number
        criticalActions: number
    }
    clientRisks: Array<{
        clientId: string
        clientName: string
        riskLevel: 'low' | 'medium' | 'high'
        reasons: string[]
    }>
    revenue: {
        currentMRR: number
        growth: number
        upsellOpportunities: Array<{
            clientName: string
            potentialRevenue: number
        }>
    }
    recommendations: Array<{
        id: string
        priority: 'critical' | 'important' | 'info'
        title: string
        description: string
        actionUrl: string
        actionLabel: string
    }>
}

export function DailyBriefing() {
    const [data, setData] = useState<DailyBriefingData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [leads, setLeads] = useState<any[]>([])
    const [modalOpen, setModalOpen] = useState(false)
    const [selectedRecipient, setSelectedRecipient] = useState<{
        id: string
        name: string
        phone?: string
        type: 'lead_intro' | 'churn_reengagement'
        context?: any
    } | null>(null)

    useEffect(() => {
        fetchInsights()
        fetchLeads()
    }, [])

    const fetchInsights = async () => {
        try {
            const response = await fetch('/api/gia/insights')
            if (!response.ok) throw new Error('Failed to fetch insights')

            const result = await response.json()
            setData(result.insights)
        } catch (err: any) {
            console.error('Failed to fetch insights:', err)
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    const fetchLeads = async () => {
        try {
            const response = await fetch('/api/gia/match-leads')
            if (!response.ok) throw new Error('Failed to fetch leads')

            const result = await response.json()
            setLeads(result.data?.matches?.slice(0, 2) || [])
        } catch (err: any) {
            console.error('Failed to fetch leads:', err)
        }
    }

    const openDraftModal = (recipient: typeof selectedRecipient) => {
        setSelectedRecipient(recipient)
        setModalOpen(true)
    }

    if (isLoading) {
        return (
            <Card className="glass border-border/50">
                <CardContent className="pt-6 flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </CardContent>
            </Card>
        )
    }

    if (error || !data) {
        return (
            <Card className="glass border-border/50">
                <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">Unable to load daily briefing</p>
                </CardContent>
            </Card>
        )
    }

    const { summary, clientRisks, revenue, recommendations } = data

    return (
        <div className="space-y-4">
            {/* Header Card */}
            <Card className="glass border-border/50 bg-gradient-to-br from-primary/5 to-accent/5">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5 text-primary" />
                        Gia's Daily Briefing
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                        Good {new Date().getHours() < 12 ? 'morning' : 'afternoon'}! Here's what I found:
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {/* At-Risk Clients */}
                        <div className="bg-background/50 rounded-lg p-3 border border-border/50">
                            <div className="flex items-center gap-2 mb-1">
                                <AlertTriangle className="h-4 w-4 text-orange-500" />
                                <span className="text-xs text-muted-foreground">At Risk</span>
                            </div>
                            <p className="text-2xl font-bold">{summary.atRiskClients}</p>
                            <p className="text-xs text-muted-foreground">clients need attention</p>
                        </div>

                        {/* Revenue Growth */}
                        <div className="bg-background/50 rounded-lg p-3 border border-border/50">
                            <div className="flex items-center gap-2 mb-1">
                                {revenue.growth >= 0 ? (
                                    <TrendingUp className="h-4 w-4 text-green-500" />
                                ) : (
                                    <TrendingDown className="h-4 w-4 text-red-500" />
                                )}
                                <span className="text-xs text-muted-foreground">Revenue</span>
                            </div>
                            <p className="text-2xl font-bold">
                                {revenue.growth >= 0 ? '+' : ''}{revenue.growth.toFixed(1)}%
                            </p>
                            <p className="text-xs text-muted-foreground">vs last month</p>
                        </div>

                        {/* Upsell Opportunities */}
                        <div className="bg-background/50 rounded-lg p-3 border border-border/50">
                            <div className="flex items-center gap-2 mb-1">
                                <DollarSign className="h-4 w-4 text-green-500" />
                                <span className="text-xs text-muted-foreground">Upsells</span>
                            </div>
                            <p className="text-2xl font-bold">{summary.upsellOpportunities}</p>
                            <p className="text-xs text-muted-foreground">opportunities</p>
                        </div>

                        {/* Critical Actions */}
                        <div className="bg-background/50 rounded-lg p-3 border border-border/50">
                            <div className="flex items-center gap-2 mb-1">
                                <Users className="h-4 w-4 text-primary" />
                                <span className="text-xs text-muted-foreground">Actions</span>
                            </div>
                            <p className="text-2xl font-bold">{summary.criticalActions}</p>
                            <p className="text-xs text-muted-foreground">need attention</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* ⚡ SMART NURTURE (NEW) - Consistency Engine for Acquisition */}
            {leads.length > 0 && (
                <Card className="glass border-primary/20 bg-primary/5">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Zap className="h-4 w-4 text-primary" />
                            Smart Nurture
                            <Badge variant="secondary" className="ml-auto text-xs font-normal">
                                {leads.length} New Lead{leads.length > 1 ? 's' : ''}
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {leads.map((match) => (
                            <div key={match.id} className="flex items-center justify-between p-3 rounded-lg bg-background/60 border border-primary/10">
                                <div>
                                    <p className="font-semibold text-sm">{match.lead.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {match.lead.preferredSport} • {match.lead.experienceLevel} • {match.overallScore}% Match
                                    </p>
                                </div>
                                <Button
                                    size="sm"
                                    className="gap-2 bg-primary text-black hover:bg-primary/90"
                                    onClick={() => openDraftModal({
                                        id: match.clientLeadId,
                                        name: match.lead.name,
                                        phone: match.lead.phone,
                                        type: 'lead_intro',
                                        context: {
                                            sport: match.lead.preferredSport,
                                            level: match.lead.experienceLevel,
                                            goals: match.lead.fitnessGoals?.join(', ')
                                        }
                                    })}
                                >
                                    <MessageSquare className="h-3 w-3" />
                                    Draft Intro
                                </Button>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* 🛡️ CHURN INTERCEPTOR (NEW) - Consistency Engine for Retention */}
            {clientRisks.length > 0 && (
                <Card className="glass border-orange-500/20 bg-orange-500/5">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-orange-500" />
                                Churn Interceptor
                            </CardTitle>
                            <Link href="/dashboard/clients">
                                <Button variant="ghost" size="sm" className="gap-1 text-orange-500 hover:text-orange-600 hover:bg-orange-500/10">
                                    View All
                                    <ArrowRight className="h-3 w-3" />
                                </Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {clientRisks.slice(0, 3).map((client) => (
                            <div
                                key={client.clientId}
                                className="flex items-center justify-between p-3 rounded-lg bg-background/60 border border-orange-500/10"
                            >
                                <div className="flex-1">
                                    <p className="font-semibold text-sm">{client.clientName}</p>
                                    <p className="text-xs text-muted-foreground">{client.reasons[0]}</p>
                                </div>
                                <Button size="sm" variant="outline" className="gap-2 border-orange-500/20 text-orange-500 hover:bg-orange-500/10" onClick={() => openDraftModal({
                                    id: client.clientId,
                                    name: client.clientName,
                                    type: 'churn_reengagement',
                                    context: {
                                        missedSessions: 2,
                                        lastSession: '2 weeks ago'
                                    }
                                })}>
                                    <MessageSquare className="h-3 w-3" />
                                    Re-engage
                                </Button>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Recommendations */}
            {recommendations.length > 0 && (
                <Card className="glass border-border/50">
                    <CardHeader>
                        <CardTitle className="text-base">Other Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {recommendations.slice(0, 3).map((rec) => (
                            <div
                                key={rec.id}
                                className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-border/50 hover:bg-accent/5 transition-colors"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Badge
                                            variant={rec.priority === 'critical' ? 'destructive' : 'secondary'}
                                            className="text-xs"
                                        >
                                            {rec.priority === 'critical' ? '🔴' : rec.priority === 'important' ? '🟡' : '🟢'}
                                            {rec.priority.toUpperCase()}
                                        </Badge>
                                        <p className="font-semibold text-sm">{rec.title}</p>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{rec.description}</p>
                                </div>
                                <Link href={rec.actionUrl}>
                                    <Button size="sm" variant="ghost" className="gap-1">
                                        {rec.actionLabel}
                                        <ArrowRight className="h-3 w-3" />
                                    </Button>
                                </Link>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}
            {/* Message Draft Modal */}
            {selectedRecipient && (
                <MessageDraftModal
                    open={modalOpen}
                    onOpenChange={setModalOpen}
                    recipientName={selectedRecipient.name}
                    recipientId={selectedRecipient.id}
                    recipientPhone={selectedRecipient.phone}
                    messageType={selectedRecipient.type}
                    context={selectedRecipient.context}
                    onSent={() => {
                        fetchLeads()
                        fetchInsights()
                    }}
                />
            )}
        </div>
    )
}
