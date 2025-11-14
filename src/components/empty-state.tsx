"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { type LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  secondaryActionLabel?: string
  onSecondaryAction?: () => void
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}: EmptyStateProps) {
  return (
    <Card className="border-2 border-dashed border-border bg-card/30 backdrop-blur-sm p-12">
      <div className="flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Icon className="h-8 w-8 text-primary" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          <p className="text-muted-foreground max-w-md">{description}</p>
        </div>
        {(actionLabel || secondaryActionLabel) && (
          <div className="flex gap-3 pt-2">
            {actionLabel && onAction && (
              <Button onClick={onAction} className="bg-primary hover:bg-primary/90 text-black">
                {actionLabel}
              </Button>
            )}
            {secondaryActionLabel && onSecondaryAction && (
              <Button onClick={onSecondaryAction} variant="outline">
                {secondaryActionLabel}
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}




