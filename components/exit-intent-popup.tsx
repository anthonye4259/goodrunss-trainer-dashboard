"use client"

import { useState, useEffect } from "react"
import { X, Gift, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export function ExitIntentPopup() {
    const [isVisible, setIsVisible] = useState(false)
    const [hasShown, setHasShown] = useState(false)
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        const handleMouseLeave = (e: MouseEvent) => {
            if (e.clientY <= 0 && !hasShown) {
                setIsVisible(true)
                setHasShown(true)
            }
        }

        document.addEventListener("mouseleave", handleMouseLeave)

        return () => {
            document.removeEventListener("mouseleave", handleMouseLeave)
        }
    }, [hasShown])

    const handleCopy = () => {
        navigator.clipboard.writeText("FIRST50")
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    if (!isVisible) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <Card className="w-full max-w-md relative overflow-hidden border-primary/50 shadow-2xl scale-100 animate-in zoom-in-95 duration-300">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary animate-gradient"></div>

                <button
                    onClick={() => setIsVisible(false)}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <CardContent className="p-8 text-center space-y-6">
                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <Gift className="w-8 h-8 text-primary animate-bounce" />
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-2xl font-bold">Wait! Don't go yet...</h3>
                        <p className="text-muted-foreground">
                            We really want you to try GoodRunss. Here's a special offer just for you.
                        </p>
                    </div>

                    <div className="bg-secondary/50 p-4 rounded-xl border border-border space-y-2">
                        <p className="text-sm font-medium text-primary">GET 50% OFF YOUR FIRST MONTH</p>
                        <div className="flex items-center gap-2">
                            <code className="flex-1 bg-background py-2 px-4 rounded-lg border border-border font-mono text-lg font-bold tracking-wider">
                                FIRST50
                            </code>
                            <Button size="icon" variant="outline" onClick={handleCopy}>
                                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">Valid for the next 24 hours only</p>
                    </div>

                    <div className="space-y-3">
                        <Button
                            className="w-full h-12 text-lg font-bold"
                            onClick={() => setIsVisible(false)}
                        >
                            Claim Offer & Continue Signup
                        </Button>
                        <button
                            onClick={() => setIsVisible(false)}
                            className="text-sm text-muted-foreground hover:text-foreground hover:underline"
                        >
                            No thanks, I'll pay full price
                        </button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
