"use client"

import { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface EmptyStateProps {
    icon: LucideIcon
    title: string
    description: string
    actionLabel: string
    onAction: () => void
    secondaryActionLabel?: string
    onSecondaryAction?: () => void
    tip?: string
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    actionLabel,
    onAction,
    secondaryActionLabel,
    onSecondaryAction,
    tip,
}: EmptyStateProps) {
    return (
        <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                <div className="rounded-full bg-muted p-6 mb-4">
                    <Icon className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{title}</h3>
                <p className="text-muted-foreground mb-6 max-w-sm">{description}</p>
                <Button onClick={onAction} size="lg">
                    {actionLabel}
                </Button>
                {secondaryActionLabel && onSecondaryAction && (
                    <Button
                        variant="ghost"
                        onClick={onSecondaryAction}
                        className="mt-2"
                    >
                        {secondaryActionLabel}
                    </Button>
                )}
                {tip && (
                    <p className="text-sm text-muted-foreground mt-6 max-w-md">
                        {tip}
                    </p>
                )}
            </CardContent>
        </Card>
    )
}
