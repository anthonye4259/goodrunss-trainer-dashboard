"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Copy, DollarSign, Users, TrendingUp, Check, ExternalLink, Globe } from "lucide-react"

interface AmbassadorStats {
    totalEarnings: number
    pendingEarnings: number
    paidEarnings: number
    totalReferrals: number
    activeReferrals: number
    referralCode: string
    referralLink: string
}

interface Referral {
    id: string
    referredUserName: string
    status: string
    convertedAt: string | null
    totalCommissions: number
}

export default function AmbassadorDashboard() {
    const [stats, setStats] = useState<AmbassadorStats | null>(null)
    const [referrals, setReferrals] = useState<Referral[]>([])
    const [loading, setLoading] = useState(true)
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        fetchAmbassadorData()
    }, [])

    const fetchAmbassadorData = async () => {
        try {
            const res = await fetch("/api/ambassador/stats")
            if (res.ok) {
                const data = await res.json()
                setStats(data.stats)
                setReferrals(data.referrals || [])
            }
        } catch (error) {
            console.error("Error fetching ambassador data:", error)
        } finally {
            setLoading(false)
        }
    }

    const copyReferralLink = () => {
        if (stats?.referralLink) {
            navigator.clipboard.writeText(stats.referralLink)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!stats) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="max-w-md">
                    <CardContent className="p-8 text-center">
                        <h2 className="text-2xl font-bold mb-4">Join the Ambassador Program</h2>
                        <p className="text-muted-foreground mb-6">
                            Earn 50% commission on first month sales and 10% recurring commissions!
                        </p>
                        <Button onClick={() => window.location.href = "/api/ambassador/register"}>
                            Become an Ambassador
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <h1 className="text-4xl font-bold tracking-tight">Ambassador Dashboard</h1>
                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                            <Globe className="h-3 w-3" /> Global Program
                        </span>
                    </div>
                    <p className="text-muted-foreground">Track your referrals and earnings worldwide (USD)</p>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-none shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Earnings
                            </CardTitle>
                            <DollarSign className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-green-600">
                                ${stats.totalEarnings.toFixed(2)}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Pending
                            </CardTitle>
                            <TrendingUp className="h-4 w-4 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-yellow-600">
                                ${stats.pendingEarnings.toFixed(2)}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Referrals
                            </CardTitle>
                            <Users className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats.totalReferrals}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {stats.activeReferrals} active
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Paid Out
                            </CardTitle>
                            <Check className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">${stats.paidEarnings.toFixed(2)}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Referral Link */}
                <Card className="border-none shadow-xl bg-gradient-to-r from-green-50 to-emerald-50">
                    <CardHeader>
                        <CardTitle>Your Referral Link</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <Input
                                value={stats.referralLink}
                                readOnly
                                className="flex-1 bg-white"
                            />
                            <Button onClick={copyReferralLink} variant="outline" className="gap-2">
                                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                {copied ? "Copied!" : "Copy"}
                            </Button>
                            <Button
                                onClick={() => window.open(stats.referralLink, "_blank")}
                                variant="outline"
                                size="icon"
                            >
                                <ExternalLink className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="bg-white rounded-lg p-4 border">
                            <h3 className="font-semibold mb-2">Commission Structure</h3>
                            <ul className="space-y-1 text-sm text-muted-foreground">
                                <li>• <strong className="text-green-600">50%</strong> commission on first month sales</li>
                                <li>• <strong className="text-green-600">10%</strong> recurring commission every month after</li>
                                <li>• Instant tracking and transparent reporting</li>
                                <li>• <strong className="text-blue-600">Global Payouts</strong> via Wise & PayPal (USD)</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>

                {/* Referrals Table */}
                <Card className="border-none shadow-lg">
                    <CardHeader>
                        <CardTitle>Your Referrals</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {referrals.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No referrals yet. Share your link to get started!</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left p-4 font-medium">Name</th>
                                            <th className="text-left p-4 font-medium">Status</th>
                                            <th className="text-left p-4 font-medium">Joined</th>
                                            <th className="text-right p-4 font-medium">Commissions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {referrals.map((referral) => (
                                            <tr key={referral.id} className="border-b hover:bg-gray-50">
                                                <td className="p-4">{referral.referredUserName}</td>
                                                <td className="p-4">
                                                    <span
                                                        className={`px-2 py-1 rounded-full text-xs font-medium ${referral.status === "ACTIVE"
                                                            ? "bg-green-100 text-green-700"
                                                            : referral.status === "CONVERTED"
                                                                ? "bg-blue-100 text-blue-700"
                                                                : "bg-gray-100 text-gray-700"
                                                            }`}
                                                    >
                                                        {referral.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-sm text-muted-foreground">
                                                    {referral.convertedAt
                                                        ? new Date(referral.convertedAt).toLocaleDateString()
                                                        : "Pending"}
                                                </td>
                                                <td className="p-4 text-right font-semibold text-green-600">
                                                    ${referral.totalCommissions.toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
