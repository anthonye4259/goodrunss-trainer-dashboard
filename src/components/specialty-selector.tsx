"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface Specialty {
  id: string
  name: string
  emoji: string
}

const specialties: Specialty[] = [
  { id: "basketball", name: "Basketball", emoji: "🏀" },
  { id: "pickleball", name: "Pickleball", emoji: "🏓" },
  { id: "tennis", name: "Tennis", emoji: "🎾" },
  { id: "volleyball", name: "Volleyball", emoji: "🏐" },
  { id: "yoga", name: "Yoga", emoji: "🧘‍♀️" },
  { id: "pilates", name: "Pilates", emoji: "🤸‍♀️" },
  { id: "barre", name: "Barre", emoji: "💃" },
  { id: "strength_training", name: "Strength Training", emoji: "💪" },
  { id: "hiit", name: "HIIT", emoji: "⚡" },
  { id: "crossfit", name: "CrossFit", emoji: "🏋️‍♀️" },
  { id: "running", name: "Running", emoji: "🏃‍♀️" },
  { id: "cycling", name: "Cycling", emoji: "🚴‍♀️" },
  { id: "swimming", name: "Swimming", emoji: "🏊‍♀️" },
  { id: "martial_arts", name: "Martial Arts", emoji: "🥋" },
  { id: "boxing", name: "Boxing", emoji: "🥊" },
  { id: "dance", name: "Dance", emoji: "💃" },
  { id: "soccer", name: "Soccer", emoji: "⚽" },
  { id: "golf", name: "Golf", emoji: "⛳" },
  { id: "nutrition", name: "Nutrition", emoji: "🥗" },
  { id: "wellness", name: "Wellness", emoji: "🌿" },
]

interface SpecialtySelectorProps {
  selectedSpecialty?: string
  onSelect?: (specialtyId: string) => void
  value?: string
  onChange?: (specialtyId: string) => void
}

export function SpecialtySelector({
  selectedSpecialty,
  onSelect,
  value,
  onChange,
}: SpecialtySelectorProps) {
  const selected = value || selectedSpecialty
  const handleSelect = onChange || onSelect || (() => {})
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {specialties.map((specialty) => (
        <Card
          key={specialty.id}
          className={cn(
            "p-4 cursor-pointer transition-all hover:border-primary",
            selected === specialty.id &&
              "border-primary bg-primary/5"
          )}
          onClick={() => handleSelect(specialty.id)}
        >
          <div className="text-center">
            <div className="text-3xl mb-2">{specialty.emoji}</div>
            <div className="text-sm font-medium text-foreground">
              {specialty.name}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}









