"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Copy, DollarSign, Users, TrendingUp, Check, ExternalLink, Globe, CreditCard, History, MessageCircle, Link as LinkIcon } from "lucide-react"
import { translations, currencies } from "@/lib/translations"

interface AmbassadorStats {
    id: string
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

interface PayoutRequest {
    id: string
    amount: number
    currency: string
    status: string
    requestedAt: string
    payoutMethod: string
}

type Language = "en" | "es" | "pt" | "fr" | "ar"
type Currency = "USD" | "EUR" | "GBP" | "CAD" | "AUD" | "BRL" | "AED"

export default function AmbassadorDashboard() {
    const [stats, setStats] = useState<AmbassadorStats | null>(null)
    const [referrals, setReferrals] = useState<Referral[]>([])
    const [payouts, setPayouts] = useState<PayoutRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [copied, setCopied] = useState(false)
    const [language, setLanguage] = useState<Language>("en")
    const [currency, setCurrency] = useState<Currency>("USD")
    const [requestingPayout, setRequestingPayout] = useState(false)

    const t = translations[language]
    const cur = currencies[currency]

    useEffect(() => {
        fetchAmbassadorData()
    }, [])

    const fetchAmbassadorData = async () => {
        try {
            // Get email from URL parameter
            const urlParams = new URLSearchParams(window.location.search)
            const email = urlParams.get('email')

            if (!email) {
                // No email provided - redirect to join page
                window.location.href = "/ambassador/join"
                return
            }

            console.log('[Ambassador Dashboard] Loading data for email:', email)

            // Fetch stats directly with email (no auth required)
            const res = await fetch(`/api/ambassador/stats?email=${encodeURIComponent(email)}`)
            if (res.ok) {
                const data = await res.json()
                setStats(data.stats)
                setReferrals(data.referrals || [])

                // Fetch payouts if we have an ID
                if (data.stats?.id) {
                    fetchPayouts(data.stats.id)
                }
            } else {
                console.error('[Ambassador Dashboard] Failed to fetch stats:', await res.text())
                alert('Ambassador not found. Please sign up first.')
                window.location.href = "/ambassador/join"
            }
        } catch (error) {
            console.error("Error fetching ambassador data:", error)
            alert('Failed to load dashboard. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const fetchPayouts = async (ambassadorId: string) => {
        try {
            const res = await fetch(`/api/ambassador/request-payout?ambassadorId=${ambassadorId}`)
            if (res.ok) {
                const data = await res.json()
                setPayouts(data.payoutRequests || [])
            }
        } catch (error) {
            console.error("Error fetching payouts:", error)
        }
    }

    const handleRequestPayout = async () => {
        if (!stats) return

        try {
            setRequestingPayout(true)
            const res = await fetch("/api/ambassador/request-payout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ambassadorId: stats.id })
            })

            const data = await res.json()

            if (res.ok) {
                alert(t.payoutRequested)
                fetchAmbassadorData() // Refresh data
            } else {
                alert(data.error || t.payoutError)
            }
        } catch (error) {
            console.error("Error requesting payout:", error)
            alert(t.payoutError)
        } finally {
            setRequestingPayout(false)
        }
    }

    const handleLogout = async () => {
        try {
            await fetch("/api/ambassador/auth/logout", {
                method: "POST"
            })
            window.location.href = "/ambassador/login"
        } catch (error) {
            console.error("Logout error:", error)
            // Force redirect anyway
            window.location.href = "/ambassador/login"
        }
    }

    const copyReferralLink = () => {
        if (stats?.referralLink) {
            navigator.clipboard.writeText(stats.referralLink)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const formatMoney = (amount: number) => {
        // Simple conversion for display (in real app, use real rates)
        const converted = amount * cur.rate
        return `${cur.symbol}${converted.toFixed(2)}`
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            </div>
        )
    }

    if (!stats) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
                <Card className="max-w-md bg-slate-800 border-slate-700">
                    <CardContent className="p-8 text-center">
                        <h2 className="text-2xl font-bold mb-4">Join the Ambassador Program</h2>
                        <p className="text-slate-400 mb-6">
                            Earn 50% commission on first month sales and 10% recurring commissions!
                        </p>
                        <Button
                            onClick={() => window.open("https://join.slack.com/t/goodrunssai/shared_invite/zt-3k170i8hs-m~IqYKwSwfn01SscPQqGqQ", "_blank")}
                            className="bg-white text-purple-900 hover:bg-slate-100 font-bold px-8"
                        >
                            Become an Ambassador
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const hasPendingPayout = payouts.some(p => p.status === "PENDING" || p.status === "PROCESSING")
    const canRequestPayout = stats.pendingEarnings >= 50 && !hasPendingPayout

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 md:p-8" dir={language === "ar" ? "rtl" : "ltr"}>
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header with Controls */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">{t.dashboardTitle}</h1>
                            <span className="bg-blue-500/20 text-blue-300 text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1 border border-blue-500/30">
                                <Globe className="h-3 w-3" /> {t.globalProgram}
                            </span>
                        </div>
                        <p className="text-slate-300">{t.subtitle}</p>
                    </div>

                    <div className="flex gap-2">
                        <Select value={language} onValueChange={(v: Language) => setLanguage(v)}>
                            <SelectTrigger className="w-[140px] bg-slate-800 border-slate-700 text-white">
                                <SelectValue placeholder="Language" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700 text-white">
                                <SelectItem value="en">🇺🇸 English</SelectItem>
                                <SelectItem value="es">🇪🇸 Español</SelectItem>
                                <SelectItem value="pt">🇧🇷 Português</SelectItem>
                                <SelectItem value="fr">🇫🇷 Français</SelectItem>
                                <SelectItem value="ar">🇸🇦 العربية</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={currency} onValueChange={(v: Currency) => setCurrency(v)}>
                            <SelectTrigger className="w-[100px] bg-slate-800 border-slate-700 text-white">
                                <SelectValue placeholder="Currency" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700 text-white">
                                <SelectItem value="USD">🇺🇸 USD</SelectItem>
                                <SelectItem value="EUR">🇪🇺 EUR</SelectItem>
                                <SelectItem value="GBP">🇬🇧 GBP</SelectItem>
                                <SelectItem value="CAD">🇨🇦 CAD</SelectItem>
                                <SelectItem value="AUD">🇦🇺 AUD</SelectItem>
                                <SelectItem value="BRL">🇧🇷 BRL</SelectItem>
                                <SelectItem value="AED">🇦🇪 AED</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button
                            onClick={handleLogout}
                            variant="outline"
                            className="border-red-700 bg-red-900/20 hover:bg-red-900/40 text-red-400 hover:text-red-300"
                        >
                            Logout
                        </Button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-slate-700 shadow-lg bg-slate-800/50 backdrop-blur">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-300">
                                {t.totalEarnings}
                            </CardTitle>
                            <DollarSign className="h-4 w-4 text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-green-400">
                                {formatMoney(stats.totalEarnings)}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-700 shadow-lg bg-slate-800/50 backdrop-blur">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-300">
                                {t.pending}
                            </CardTitle>
                            <TrendingUp className="h-4 w-4 text-yellow-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-yellow-400">
                                {formatMoney(stats.pendingEarnings)}
                            </div>
                            <div className="mt-4">
                                <Button
                                    onClick={handleRequestPayout}
                                    disabled={!canRequestPayout || requestingPayout}
                                    size="sm"
                                    className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {requestingPayout ? t.processing : t.requestPayout}
                                </Button>
                                <p className="text-xs text-slate-500 mt-2 text-center">
                                    {t.minPayout}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-700 shadow-lg bg-slate-800/50 backdrop-blur">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-300">
                                {t.totalReferrals}
                            </CardTitle>
                            <Users className="h-4 w-4 text-blue-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-white">{stats.totalReferrals}</div>
                            <p className="text-xs text-slate-400 mt-1">
                                {stats.activeReferrals} {t.active}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-700 shadow-lg bg-slate-800/50 backdrop-blur">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-300">
                                {t.paidOut}
                            </CardTitle>
                            <Check className="h-4 w-4 text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-white">{formatMoney(stats.paidEarnings)}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Referral Link */}
                <Card className="border-slate-700 shadow-xl bg-gradient-to-r from-green-900/20 to-emerald-900/20 backdrop-blur">
                    <CardHeader>
                        <CardTitle className="text-white">{t.referralLink}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <Input
                                value={stats.referralLink}
                                readOnly
                                className="flex-1 bg-slate-900/50 border-slate-700 text-white"
                            />
                            <Button onClick={copyReferralLink} variant="outline" className="gap-2 border-slate-700 bg-slate-800 hover:bg-slate-700 text-white">
                                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                {copied ? t.copied : t.copy}
                            </Button>
                            <Button
                                onClick={() => window.open(stats.referralLink, "_blank")}
                                variant="outline"
                                size="icon"
                                className="border-slate-700 bg-slate-800 hover:bg-slate-700 text-white"
                            >
                                <ExternalLink className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                            <h3 className="font-semibold mb-2 text-white">{t.commissionStructure}</h3>
                            <ul className="space-y-1 text-sm text-slate-300">
                                <li>• <strong className="text-green-400">{t.commission1}</strong></li>
                                <li>• <strong className="text-green-400">{t.commission2}</strong></li>
                                <li>• {t.commission3}</li>
                                <li>• <strong className="text-blue-400">{t.commission4}</strong></li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>

                {/* Community Section */}
                <Card className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-slate-700">
                    <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                                <Users className="h-6 w-6 text-purple-400" />
                                {t.communityTitle}
                            </h3>
                            <p className="text-slate-300">
                                {t.communitySubtitle}
                            </p>
                        </div>
                        <Button
                            onClick={() => window.open("https://join.slack.com/t/goodrunssai/shared_invite/zt-3k170i8hs-m~IqYKwSwfn01SscPQqGqQ", "_blank")}
                            className="bg-white text-purple-900 hover:bg-slate-100 font-bold px-8"
                        >
                            <MessageCircle className="h-5 w-5 mr-2" />
                            {t.joinSlack}
                        </Button>
                    </CardContent>
                </Card>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Referrals Table */}
                    <Card className="border-slate-700 shadow-lg bg-slate-800/50 backdrop-blur">
                        <CardHeader>
                            <CardTitle className="text-white">{t.yourReferrals}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {referrals.length === 0 ? (
                                <div className="text-center py-12 text-slate-400">
                                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>{t.noReferrals}</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-slate-700">
                                                <th className="text-left p-4 font-medium text-slate-300">{t.name}</th>
                                                <th className="text-left p-4 font-medium text-slate-300">{t.status}</th>
                                                <th className="text-left p-4 font-medium text-slate-300">{t.joined}</th>
                                                <th className="text-right p-4 font-medium text-slate-300">{t.commissions}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {referrals.map((referral) => (
                                                <tr key={referral.id} className="border-b border-slate-700 hover:bg-slate-700/30">
                                                    <td className="p-4 text-white">{referral.referredUserName}</td>
                                                    <td className="p-4">
                                                        <span
                                                            className={`px-2 py-1 rounded-full text-xs font-medium ${referral.status === "ACTIVE"
                                                                ? "bg-green-500/20 text-green-400"
                                                                : referral.status === "CONVERTED"
                                                                    ? "bg-blue-500/20 text-blue-400"
                                                                    : "bg-slate-500/20 text-slate-400"
                                                                }`}
                                                        >
                                                            {referral.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-sm text-slate-400">
                                                        {referral.convertedAt
                                                            ? new Date(referral.convertedAt).toLocaleDateString()
                                                            : "Pending"}
                                                    </td>
                                                    <td className="p-4 text-right font-semibold text-green-400">
                                                        {formatMoney(referral.totalCommissions)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Payout History */}
                    <Card className="border-slate-700 shadow-lg bg-slate-800/50 backdrop-blur">
                        <CardHeader>
                            <CardTitle className="text-white">{t.payoutHistory}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {payouts.length === 0 ? (
                                <div className="text-center py-12 text-slate-400">
                                    <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No payouts yet</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-slate-700">
                                                <th className="text-left p-4 font-medium text-slate-300">{t.date}</th>
                                                <th className="text-left p-4 font-medium text-slate-300">{t.amount}</th>
                                                <th className="text-left p-4 font-medium text-slate-300">{t.status}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {payouts.map((payout) => (
                                                <tr key={payout.id} className="border-b border-slate-700 hover:bg-slate-700/30">
                                                    <td className="p-4 text-sm text-slate-400">
                                                        {new Date(payout.requestedAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="p-4 font-semibold text-white">
                                                        {formatMoney(Number(payout.amount))}
                                                    </td>
                                                    <td className="p-4">
                                                        <span
                                                            className={`px-2 py-1 rounded-full text-xs font-medium ${payout.status === "COMPLETED"
                                                                ? "bg-green-500/20 text-green-400"
                                                                : payout.status === "PENDING"
                                                                    ? "bg-yellow-500/20 text-yellow-400"
                                                                    : "bg-red-500/20 text-red-400"
                                                                }`}
                                                        >
                                                            {payout.status}
                                                        </span>
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
        </div>
    )
}
