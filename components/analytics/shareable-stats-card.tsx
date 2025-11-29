"use client"

import { useState, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Star, Users, TrendingUp } from "lucide-react"
import html2canvas from "html2canvas"

export function ShareableStatsCard() {
    const [isDownloading, setIsDownloading] = useState(false)
    const cardRef = useRef<HTMLDivElement>(null)

    const handleDownload = async () => {
        if (!cardRef.current) return

        setIsDownloading(true)
        try {
            const canvas = await html2canvas(cardRef.current)
            const link = document.createElement("a")
            link.download = "trainer-stats.png"
            link.href = canvas.toDataURL()
            link.click()
        } catch (error) {
            console.error("Error generating image:", error)
        } finally {
            setIsDownloading(false)
        }
    }

    return (
        <div className="space-y-4">
            <div ref={cardRef} className="bg-gradient-to-br from-primary via-purple-600 to-pink-600 rounded-2xl p-8 text-white">
                <div className="space-y-6">
                    {/* Header */}
                    <div className="text-center">
                        <h2 className="text-3xl font-bold mb-2">My Training Impact</h2>
                        <p className="text-white/80">Powered by GoodRunss</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Total Sessions */}
                        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                            <CardContent className="p-4 text-center">
                                <Users className="w-8 h-8 mx-auto mb-2 text-white" />
                                <p className="text-4xl font-bold">247</p>
                                <p className="text-sm text-white/80 mt-1">Sessions Completed</p>
                            </CardContent>
                        </Card>

                        {/* Client Satisfaction */}
                        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                            <CardContent className="p-4 text-center">
                                <Star className="w-8 h-8 mx-auto mb-2 text-yellow-300 fill-yellow-300" />
                                <p className="text-4xl font-bold">4.9</p>
                                <p className="text-sm text-white/80 mt-1">Client Rating</p>
                            </CardContent>
                        </Card>

                        {/* Completion Rate */}
                        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                            <CardContent className="p-4 text-center">
                                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-300" />
                                <p className="text-4xl font-bold">92%</p>
                                <p className="text-sm text-white/80 mt-1">Completion Rate</p>
                            </CardContent>
                        </Card>

                        {/* Active Clients */}
                        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                            <CardContent className="p-4 text-center">
                                <Users className="w-8 h-8 mx-auto mb-2 text-blue-300" />
                                <p className="text-4xl font-bold">34</p>
                                <p className="text-sm text-white/80 mt-1">Active Clients</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Footer */}
                    <div className="text-center pt-4 border-t border-white/20">
                        <p className="text-sm text-white/60">
                            Transforming lives through fitness
                        </p>
                    </div>
                </div>
            </div>

            {/* Download Button */}
            <Button
                onClick={handleDownload}
                disabled={isDownloading}
                className="w-full"
                size="lg"
            >
                <Download className="mr-2 h-4 w-4" />
                {isDownloading ? "Generating..." : "Download Image"}
            </Button>
        </div>
    )
}
