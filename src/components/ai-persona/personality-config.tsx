"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Brain, Zap, MessageSquare, Heart } from "lucide-react"

interface PersonalityConfigProps {
    personality: any
    onChange: (personality: any) => void
}

export function PersonalityConfig({ personality, onChange }: PersonalityConfigProps) {
    const handleSliderChange = (trait: string, value: number[]) => {
        onChange({
            ...personality,
            [trait]: value[0]
        })
    }

    // Default values if not set
    const traits = {
        strictness: personality?.strictness || 50, // Strict vs Relaxed
        energy: personality?.energy || 70,         // High Energy vs Calm
        verbosity: personality?.verbosity || 50,   // Detailed vs Concise
        empathy: personality?.empathy || 80        // Empathetic vs Objective
    }

    return (
        <div className="space-y-6">
            <Card className="glass border-border/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5 text-primary" />
                        Personality Tuner
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">

                    {/* Strictness */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label className="text-base">Coaching Style</Label>
                            <span className="text-sm text-muted-foreground font-medium">
                                {traits.strictness < 30 ? "Relaxed & Flexible" :
                                    traits.strictness > 70 ? "Strict & Disciplined" : "Balanced"}
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-xs text-muted-foreground w-16 text-right">Relaxed</span>
                            <Slider
                                value={[traits.strictness]}
                                onValueChange={(val) => handleSliderChange('strictness', val)}
                                max={100}
                                step={1}
                                className="flex-1"
                            />
                            <span className="text-xs text-muted-foreground w-16">Strict</span>
                        </div>
                    </div>

                    {/* Energy */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label className="text-base">Energy Level</Label>
                            <span className="text-sm text-muted-foreground font-medium">
                                {traits.energy < 30 ? "Calm & Zen" :
                                    traits.energy > 70 ? "High Voltage" : "Moderate"}
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-xs text-muted-foreground w-16 text-right">Calm</span>
                            <Slider
                                value={[traits.energy]}
                                onValueChange={(val) => handleSliderChange('energy', val)}
                                max={100}
                                step={1}
                                className="flex-1"
                            />
                            <span className="text-xs text-muted-foreground w-16">Hype</span>
                        </div>
                    </div>

                    {/* Verbosity */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label className="text-base">Communication Style</Label>
                            <span className="text-sm text-muted-foreground font-medium">
                                {traits.verbosity < 30 ? "Concise & Direct" :
                                    traits.verbosity > 70 ? "Detailed & Educational" : "Standard"}
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-xs text-muted-foreground w-16 text-right">Concise</span>
                            <Slider
                                value={[traits.verbosity]}
                                onValueChange={(val) => handleSliderChange('verbosity', val)}
                                max={100}
                                step={1}
                                className="flex-1"
                            />
                            <span className="text-xs text-muted-foreground w-16">Detailed</span>
                        </div>
                    </div>

                    {/* Empathy */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label className="text-base">Emotional Intelligence</Label>
                            <span className="text-sm text-muted-foreground font-medium">
                                {traits.empathy < 30 ? "Objective & Factual" :
                                    traits.empathy > 70 ? "Highly Empathetic" : "Balanced"}
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-xs text-muted-foreground w-16 text-right">Objective</span>
                            <Slider
                                value={[traits.empathy]}
                                onValueChange={(val) => handleSliderChange('empathy', val)}
                                max={100}
                                step={1}
                                className="flex-1"
                            />
                            <span className="text-xs text-muted-foreground w-16">Empathetic</span>
                        </div>
                    </div>

                </CardContent>
            </Card>
        </div>
    )
}
