"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, ArrowRight, Sparkles } from "lucide-react"

export default function AmbassadorLogin() {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)
    const [error, setError] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const res = await fetch("/api/ambassador/auth/send-magic-link", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            })

            const data = await res.json()

            if (res.ok) {
                setSent(true)
            } else {
                setError(data.error || "Failed to send magic link")
            }
        } catch (error) {
            setError("Failed to send magic link. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    if (sent) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
                <Card className="max-w-md w-full border-none shadow-2xl bg-slate-800/50 backdrop-blur">
                    <CardContent className="p-12 text-center">
                        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Mail className="h-10 w-10 text-green-400" />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-3">Check Your Email!</h2>
                        <p className="text-slate-300 mb-2">
                            We sent a magic link to:
                        </p>
                        <p className="text-blue-400 font-semibold mb-6">{email}</p>
                        <p className="text-sm text-slate-400">
                            Click the link in the email to access your dashboard. The link expires in 15 minutes.
                        </p>
                        <Button
                            onClick={() => {
                                setSent(false)
                                setEmail("")
                            }}
                            variant="outline"
                            className="mt-6 border-slate-700 bg-slate-800 hover:bg-slate-700 text-white"
                        >
                            Send Another Link
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
            <Card className="max-w-md w-full border-none shadow-2xl bg-slate-800/50 backdrop-blur">
                <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="h-8 w-8 text-purple-400" />
                    </div>
                    <CardTitle className="text-3xl text-white">Ambassador Login</CardTitle>
                    <p className="text-slate-400 mt-2">Enter your email to receive a magic link</p>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="email" className="text-slate-300">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="your@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="bg-slate-900/50 border-slate-700 text-white mt-2"
                            />
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                                <p className="text-sm text-red-400">{error}</p>
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold"
                            disabled={loading}
                        >
                            {loading ? (
                                "Sending..."
                            ) : (
                                <>
                                    Send Magic Link
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-slate-400">
                            Don't have an account?{" "}
                            <a href="/ambassador/join" className="text-purple-400 hover:text-purple-300 font-semibold">
                                Sign up here
                            </a>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
