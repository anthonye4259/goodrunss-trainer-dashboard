"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, CheckCircle, XCircle } from "lucide-react"

function VerifyContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying")
    const [message, setMessage] = useState("")

    useEffect(() => {
        const token = searchParams.get("token")
        if (!token) {
            setStatus("error")
            setMessage("No token provided")
            return
        }

        verifyToken(token)
    }, [searchParams])

    const verifyToken = async (token: string) => {
        try {
            const res = await fetch("/api/ambassador/auth/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token })
            })

            const data = await res.json()

            if (res.ok) {
                // Set session cookie
                document.cookie = `ambassador_session=${data.sessionToken}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`

                setStatus("success")
                setMessage("Login successful! Redirecting...")

                // Redirect to dashboard after 1 second
                setTimeout(() => {
                    router.push("/ambassador")
                }, 1000)
            } else {
                setStatus("error")
                setMessage(data.error || "Invalid or expired link")
            }
        } catch (error) {
            setStatus("error")
            setMessage("Failed to verify link. Please try again.")
        }
    }

    return (
        <>
            {status === "verifying" && (
                <>
                    <Loader2 className="h-16 w-16 mx-auto mb-6 text-blue-500 animate-spin" />
                    <h2 className="text-2xl font-bold text-white mb-2">Verifying...</h2>
                    <p className="text-slate-400">Please wait while we log you in</p>
                </>
            )}

            {status === "success" && (
                <>
                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="h-10 w-10 text-green-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Success!</h2>
                    <p className="text-slate-400">{message}</p>
                </>
            )}

            {status === "error" && (
                <>
                    <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <XCircle className="h-10 w-10 text-red-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Verification Failed</h2>
                    <p className="text-slate-400 mb-6">{message}</p>
                    <a
                        href="/ambassador/login"
                        className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold"
                    >
                        Try Again
                    </a>
                </>
            )}
        </>
    )
}

export default function VerifyMagicLink() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
            <Card className="max-w-md w-full border-none shadow-2xl bg-slate-800/50 backdrop-blur">
                <CardContent className="p-12 text-center">
                    <Suspense fallback={
                        <>
                            <Loader2 className="h-16 w-16 mx-auto mb-6 text-blue-500 animate-spin" />
                            <h2 className="text-2xl font-bold text-white mb-2">Loading...</h2>
                        </>
                    }>
                        <VerifyContent />
                    </Suspense>
                </CardContent>
            </Card>
        </div>
    )
}
