"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  primaryAction?: {
    label: string
    onClick: () => void
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon: Icon, title, description, primaryAction, secondaryAction }: EmptyStateProps) {
  return (
    <Card className="border-2 border-dashed border-border bg-card/50 backdrop-blur-sm p-12">
      <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4">
          <Icon className="h-8 w-8 text-primary" />
        </div>

        <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
        <p className="text-muted-foreground mb-6">{description}</p>

        {(primaryAction || secondaryAction) && (
          <div className="flex gap-3">
            {primaryAction && <Button onClick={primaryAction.onClick}>{primaryAction.label}</Button>}
            {secondaryAction && (
              <Button variant="outline" onClick={secondaryAction.onClick}>
                {secondaryAction.label}
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}
