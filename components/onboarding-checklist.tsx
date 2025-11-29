"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Circle, X, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface ChecklistItem {
    id: string
    label: string
    description: string
    action: () => void
    actionLabel: string
}

interface OnboardingProgress {
    [key: string]: boolean
}

const STORAGE_KEY = "onboarding_progress"
const DISMISSED_KEY = "onboarding_dismissed"

export function OnboardingChecklist() {
    const router = useRouter()
    const [progress, setProgress] = useState<OnboardingProgress>({})
    const [isDismissed, setIsDismissed] = useState(false)
    const [showConfetti, setShowConfetti] = useState(false)

    const checklistItems: ChecklistItem[] = [
        {
            id: "profile",
            label: "Complete your profile",
            description: "Add your bio and specialties",
            action: () => router.push("/dashboard/settings"),
            actionLabel: "Edit Profile",
        },
        {
            id: "client",
            label: "Add your first client",
            description: "Start tracking client progress",
            action: () => router.push("/dashboard/clients?action=add"),
            actionLabel: "Add Client",
        },
        {
            id: "session",
            label: "Schedule your first session",
            description: "Create a training session",
            action: () => router.push("/dashboard/sessions?action=create"),
            actionLabel: "Create Session",
        },
        {
            id: "booking",
            label: "Set up your booking link",
            description: "Let clients book automatically",
            action: () => router.push("/dashboard/booking"),
            actionLabel: "View Booking Link",
        },
        {
            id: "gia",
            label: "Try GIA (AI Assistant)",
            description: "Ask GIA to help with your tasks",
            action: () => router.push("/dashboard/gia"),
            actionLabel: "Open GIA",
        },
    ]

    // Load progress from localStorage
    useEffect(() => {
        const savedProgress = localStorage.getItem(STORAGE_KEY)
        const dismissed = localStorage.getItem(DISMISSED_KEY)

        if (savedProgress) {
            setProgress(JSON.parse(savedProgress))
        }

        if (dismissed === "true") {
            setIsDismissed(true)
        }
    }, [])

    // Save progress to localStorage
    const updateProgress = (itemId: string, completed: boolean) => {
        const newProgress = { ...progress, [itemId]: completed }
        setProgress(newProgress)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress))

        // Check if all items are complete
        const allComplete = checklistItems.every((item) => newProgress[item.id])
        if (allComplete && !showConfetti) {
            setShowConfetti(true)
            setTimeout(() => setShowConfetti(false), 3000)
        }
    }

    const handleDismiss = () => {
        setIsDismissed(true)
        localStorage.setItem(DISMISSED_KEY, "true")
    }

    const handleReopen = () => {
        setIsDismissed(false)
        localStorage.removeItem(DISMISSED_KEY)
    }

    const completedCount = checklistItems.filter((item) => progress[item.id]).length
    const totalCount = checklistItems.length
    const progressPercentage = (completedCount / totalCount) * 100
    const allComplete = completedCount === totalCount

    // If dismissed, show a small button to reopen
    if (isDismissed) {
        return (
            <Button
                variant="outline"
                size="sm"
                onClick={handleReopen}
                className="mb-4"
            >
                <Sparkles className="mr-2 h-4 w-4" />
                Show Getting Started Checklist
            </Button>
        )
    }

    return (
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent relative overflow-hidden">
            {showConfetti && (
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-pink-400/20 to-purple-400/20 animate-pulse" />
                </div>
            )}

            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="h-5 w-5 text-primary" />
                            <h3 className="text-xl font-semibold">
                                {allComplete ? "🎉 You're all set!" : "Get Started"}
                            </h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {allComplete
                                ? "Great job! You've completed all the essential setup steps."
                                : `Complete these steps to get the most out of your dashboard`}
                        </p>
                        <div className="mt-3">
                            <div className="flex items-center justify-between text-sm mb-2">
                                <span className="text-muted-foreground">
                                    {completedCount} of {totalCount} complete
                                </span>
                                <span className="font-semibold text-primary">
                                    {Math.round(progressPercentage)}%
                                </span>
                            </div>
                            <Progress value={progressPercentage} className="h-2" />
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDismiss}
                        className="ml-4"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>

            <CardContent>
                <div className="space-y-3">
                    {checklistItems.map((item) => {
                        const isComplete = progress[item.id]

                        return (
                            <div
                                key={item.id}
                                className={cn(
                                    "flex items-start gap-3 p-3 rounded-lg border transition-all",
                                    isComplete
                                        ? "bg-primary/5 border-primary/20"
                                        : "bg-card border-border hover:border-primary/30"
                                )}
                            >
                                <button
                                    onClick={() => updateProgress(item.id, !isComplete)}
                                    className="mt-0.5 flex-shrink-0"
                                >
                                    {isComplete ? (
                                        <CheckCircle2 className="h-5 w-5 text-primary" />
                                    ) : (
                                        <Circle className="h-5 w-5 text-muted-foreground" />
                                    )}
                                </button>

                                <div className="flex-1 min-w-0">
                                    <p
                                        className={cn(
                                            "font-medium",
                                            isComplete && "line-through text-muted-foreground"
                                        )}
                                    >
                                        {item.label}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {item.description}
                                    </p>
                                </div>

                                {!isComplete && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={item.action}
                                        className="flex-shrink-0"
                                    >
                                        {item.actionLabel}
                                    </Button>
                                )}
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}
