"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

export default function AmbassadorLoginPage() {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            // Verify ambassador exists
            const res = await fetch(`/api/ambassador/stats?email=${encodeURIComponent(email)}`)
            const data = await res.json()

            if (res.ok && data.stats) {
                // Redirect to dashboard with email parameter
                router.push(`/ambassador?email=${encodeURIComponent(email)}`)
            } else {
                alert("No ambassador account found with this email. Please sign up first.")
            }
        } catch (error) {
            console.error("Error:", error)
            alert("Failed to access dashboard")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
            <Card className="max-w-md w-full border-slate-700 shadow-2xl bg-slate-800/50 backdrop-blur">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl text-white">
                        <Mail className="inline h-6 w-6 text-blue-400 mr-2" />
                        Ambassador Dashboard
                    </CardTitle>
                    <p className="text-slate-400 text-sm mt-2">
                        Enter your email to access your stats
                    </p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="email" className="text-slate-300">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-slate-900/50 border-slate-700 text-white"
                                placeholder="your@email.com"
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                        >
                            {loading ? "Accessing..." : (
                                <>
                                    Access Dashboard
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-slate-400">
                            Don't have an account?{" "}
                            <a href="/ambassador/join" className="text-blue-400 hover:text-blue-300">
                                Join the program
                            </a>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
