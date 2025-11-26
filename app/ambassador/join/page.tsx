"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Globe, DollarSign, TrendingUp, Users, Check, Sparkles } from "lucide-react"

export default function AmbassadorJoinPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        payoutEmail: ""
    })
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [referralCode, setReferralCode] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch("/api/ambassador/join", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })

            const data = await res.json()

            if (res.ok) {
                setSuccess(true)
                setReferralCode(data.referralCode)
            } else {
                alert(data.error || "Failed to join ambassador program")
            }
        } catch (error) {
            console.error("Error joining:", error)
            alert("Failed to join ambassador program")
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
                <Card className="max-w-2xl w-full border-none shadow-2xl bg-slate-800/50 backdrop-blur">
                    <CardContent className="p-12 text-center">
                        <div className="mb-6">
                            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Check className="h-10 w-10 text-green-400" />
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-2">Welcome to the Team!</h2>
                            <p className="text-slate-300">
                                You're now a GoodRunss Ambassador
                            </p>
                        </div>

                        <div className="bg-slate-900/50 rounded-lg p-6 mb-6">
                            <p className="text-sm text-slate-400 mb-2">Your Referral Code</p>
                            <p className="text-2xl font-bold text-green-400 font-mono">{referralCode}</p>
                        </div>

                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
                            <p className="text-sm text-blue-300">
                                📧 Check your email for your unique referral link and next steps!
                            </p>
                        </div>

                        <Button
                            onClick={() => window.location.href = "/ambassador"}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            Go to Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
            {/* Hero Section */}
            <div className="container mx-auto px-4 py-16">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 bg-blue-500/20 px-4 py-2 rounded-full mb-6">
                        <Globe className="h-4 w-4 text-blue-400" />
                        <span className="text-blue-300 text-sm font-medium">Global Ambassador Program</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
                        Earn While You Share
                    </h1>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                        Join thousands of ambassadors earning passive income by sharing GoodRunss with trainers worldwide
                    </p>
                </div>

                {/* Stats */}
                <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
                    <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
                        <DollarSign className="h-8 w-8 text-green-400 mb-3" />
                        <div className="text-3xl font-bold text-white mb-1">50%</div>
                        <p className="text-slate-400 text-sm">First Month Commission</p>
                    </div>
                    <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
                        <TrendingUp className="h-8 w-8 text-blue-400 mb-3" />
                        <div className="text-3xl font-bold text-white mb-1">10%</div>
                        <p className="text-slate-400 text-sm">Recurring Monthly</p>
                    </div>
                    <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
                        <Users className="h-8 w-8 text-purple-400 mb-3" />
                        <div className="text-3xl font-bold text-white mb-1">Global</div>
                        <p className="text-slate-400 text-sm">PayPal Payouts</p>
                    </div>
                </div>

                {/* Signup Form */}
                <Card className="max-w-md mx-auto border-none shadow-2xl bg-slate-800/50 backdrop-blur">
                    <CardHeader>
                        <CardTitle className="text-2xl text-center text-white">
                            <Sparkles className="inline h-6 w-6 text-yellow-400 mr-2" />
                            Become an Ambassador
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="name" className="text-slate-300">Full Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="bg-slate-900/50 border-slate-700 text-white"
                                    placeholder="John Doe"
                                />
                            </div>

                            <div>
                                <Label htmlFor="email" className="text-slate-300">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="bg-slate-900/50 border-slate-700 text-white"
                                    placeholder="john@example.com"
                                />
                            </div>

                            <div>
                                <Label htmlFor="payoutEmail" className="text-slate-300">
                                    PayPal Email
                                    <span className="text-slate-500 text-xs ml-2">(for receiving payments)</span>
                                </Label>
                                <Input
                                    id="payoutEmail"
                                    type="email"
                                    required
                                    value={formData.payoutEmail}
                                    onChange={(e) => setFormData({ ...formData, payoutEmail: e.target.value })}
                                    className="bg-slate-900/50 border-slate-700 text-white"
                                    placeholder="paypal@example.com"
                                />
                            </div>

                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                                <p className="text-xs text-blue-300">
                                    ✓ No credit card required<br />
                                    ✓ Instant approval<br />
                                    ✓ Start earning immediately
                                </p>
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
                            >
                                {loading ? "Joining..." : "Join Ambassador Program"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* How It Works */}
                <div className="max-w-4xl mx-auto mt-16">
                    <h2 className="text-3xl font-bold text-white text-center mb-8">How It Works</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl font-bold text-green-400">1</span>
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">Sign Up</h3>
                            <p className="text-slate-400 text-sm">
                                Create your ambassador account in seconds
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl font-bold text-blue-400">2</span>
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">Share Your Link</h3>
                            <p className="text-slate-400 text-sm">
                                Get your unique referral link and start sharing
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl font-bold text-purple-400">3</span>
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">Earn Commissions</h3>
                            <p className="text-slate-400 text-sm">
                                Get paid automatically via PayPal every month
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
