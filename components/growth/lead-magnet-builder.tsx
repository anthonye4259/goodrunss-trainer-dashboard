"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, ArrowLeft, ArrowRight, Sparkles, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface LeadMagnetBuilderProps {
    onClose: () => void
    onCreated: () => void
}

export function LeadMagnetBuilder({ onClose, onCreated }: LeadMagnetBuilderProps) {
    const [step, setStep] = useState(1)
    const [isGenerating, setIsGenerating] = useState(false)
    const [generatedContent, setGeneratedContent] = useState<any>(null)
    const { toast } = useToast()

    const [formData, setFormData] = useState({
        format: '',
        specialty: '',
        targetClient: '',
    })

    const handleGenerate = async () => {
        if (!formData.format || !formData.specialty || !formData.targetClient) {
            toast({
                title: "Missing Information",
                description: "Please fill in all fields",
                variant: "destructive"
            })
            return
        }

        setIsGenerating(true)

        try {
            const response = await fetch('/api/gia/generate-lead-magnet', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (!response.ok) throw new Error('Failed to generate')

            const data = await response.json()
            setGeneratedContent(data.leadMagnet)
            setStep(2)

            toast({
                title: "Lead Magnet Created! ✨",
                description: "Gia generated your lead magnet in 60 seconds",
            })
        } catch (error) {
            console.error('Failed to generate:', error)
            toast({
                title: "Generation Failed",
                description: "Please try again",
                variant: "destructive"
            })
        } finally {
            setIsGenerating(false)
        }
    }

    const handlePublish = () => {
        toast({
            title: "Lead Magnet Published! 🚀",
            description: "Your lead magnet is now live and ready to capture leads",
        })
        onCreated()
    }

    return (
        <div className="max-w-[1000px] mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={onClose}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">Create Lead Magnet</h1>
                    <p className="text-muted-foreground">Gia will generate everything in 60 seconds</p>
                </div>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-4">
                <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                        {step > 1 ? <Check className="h-4 w-4" /> : '1'}
                    </div>
                    <span className="font-medium">Configure</span>
                </div>
                <div className="h-px w-16 bg-border" />
                <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                        2
                    </div>
                    <span className="font-medium">Review</span>
                </div>
            </div>

            {/* Step 1: Configure */}
            {step === 1 && (
                <Card className="glass border-border/50">
                    <CardHeader>
                        <CardTitle>Configure Your Lead Magnet</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Format Selection */}
                        <div className="space-y-2">
                            <Label>Format</Label>
                            <Select value={formData.format} onValueChange={(value) => setFormData({ ...formData, format: value })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose a format" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="workout-plan">7-Day Workout Plan</SelectItem>
                                    <SelectItem value="nutrition-guide">7-Day Nutrition Guide</SelectItem>
                                    <SelectItem value="challenge">30-Day Challenge</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Specialty */}
                        <div className="space-y-2">
                            <Label>Your Specialty</Label>
                            <Input
                                placeholder="e.g., HIIT for busy moms, Strength training for beginners"
                                value={formData.specialty}
                                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                            />
                        </div>

                        {/* Target Client */}
                        <div className="space-y-2">
                            <Label>Target Client</Label>
                            <Textarea
                                placeholder="e.g., Working mothers 30-45 who want to get fit but have limited time"
                                value={formData.targetClient}
                                onChange={(e) => setFormData({ ...formData, targetClient: e.target.value })}
                                rows={3}
                            />
                        </div>

                        {/* Generate Button */}
                        <Button
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            size="lg"
                            className="w-full gap-2"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Gia is generating...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-4 w-4" />
                                    Generate with AI
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Step 2: Review */}
            {step === 2 && generatedContent && (
                <div className="space-y-4">
                    <Card className="glass border-border/50">
                        <CardHeader>
                            <CardTitle>{generatedContent.title}</CardTitle>
                            <p className="text-sm text-muted-foreground">{generatedContent.description}</p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Preview Content */}
                            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                                <h3 className="font-semibold">Content Preview</h3>
                                <p className="text-sm text-muted-foreground">
                                    {generatedContent.content.introduction}
                                </p>
                                <div className="grid grid-cols-2 gap-2">
                                    {Object.keys(generatedContent.content.content || {}).slice(0, 4).map((day) => (
                                        <div key={day} className="bg-background/50 rounded p-2">
                                            <p className="text-xs font-medium">{day.toUpperCase()}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {generatedContent.content.content[day]?.title}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Landing Page Preview */}
                            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                                <h3 className="font-semibold">Landing Page</h3>
                                <p className="text-sm font-medium">{generatedContent.landingPageCopy?.headline}</p>
                                <p className="text-xs text-muted-foreground">{generatedContent.landingPageCopy?.subheadline}</p>
                            </div>

                            {/* Email Sequence Preview */}
                            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                                <h3 className="font-semibold">Email Nurture Sequence</h3>
                                <p className="text-sm text-muted-foreground">
                                    7-day automated email sequence ready to convert leads
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-3 pt-4">
                                <Button variant="outline" onClick={() => setStep(1)}>
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Edit
                                </Button>
                                <Button onClick={handlePublish} className="flex-1 gap-2">
                                    Publish Lead Magnet
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
