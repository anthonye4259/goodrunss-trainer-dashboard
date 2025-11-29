"use client"

import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sparkles } from "lucide-react"

const specialties = [
  { value: "basketball", label: "Basketball Coach", emoji: "🏀" },
  { value: "pickleball", label: "Pickleball Instructor", emoji: "🏓" },
  { value: "tennis", label: "Tennis Instructor", emoji: "🎾" },
  { value: "volleyball", label: "Volleyball Coach", emoji: "🏐" },
  { value: "yoga", label: "Yoga Instructor", emoji: "🧘‍♀️" },
  { value: "pilates", label: "Pilates Instructor", emoji: "🤸‍♀️" },
  { value: "barre", label: "Barre Instructor", emoji: "💃" },
  { value: "strength", label: "Strength & Conditioning", emoji: "💪" },
  { value: "hiit", label: "HIIT Trainer", emoji: "⚡" },
  { value: "crossfit", label: "CrossFit Coach", emoji: "🏋️‍♀️" },
  { value: "running", label: "Running Coach", emoji: "🏃‍♀️" },
  { value: "cycling", label: "Cycling Coach", emoji: "🚴‍♀️" },
  { value: "swimming", label: "Swimming Coach", emoji: "🏊‍♀️" },
  { value: "martial-arts", label: "Martial Arts Instructor", emoji: "🥋" },
  { value: "boxing", label: "Boxing Coach", emoji: "🥊" },
  { value: "dance", label: "Dance Instructor", emoji: "💃" },
  { value: "soccer", label: "Soccer Coach", emoji: "⚽" },
  { value: "golf", label: "Golf Instructor", emoji: "⛳" },
  { value: "nutrition", label: "Nutrition Coach", emoji: "🥗" },
  { value: "wellness", label: "Wellness Coach", emoji: "🌿" },
  { value: "performance", label: "Sports Performance", emoji: "🎯" },
  { value: "general", label: "General Fitness Trainer", emoji: "💪" },
]

interface SpecialtySelectorProps {
  value: string
  onValueChange: (value: string) => void
}

export function SpecialtySelector({ value, onValueChange }: SpecialtySelectorProps) {
  return (
    <div className="space-y-2">
      <Label>Your Specialty</Label>
      <p className="text-sm text-muted-foreground">
        Select your primary training focus. This helps GIA generate content specific to your sport.
      </p>

      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="h-12">
          <SelectValue placeholder="Select your specialty..." />
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {specialties.map((spec) => (
            <SelectItem key={spec.value} value={spec.value}>
              <span className="flex items-center gap-2">
                <span>{spec.emoji}</span>
                <span>{spec.label}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
        <Sparkles className="h-3 w-3" />
        <span>This affects all AI-generated content, workouts, and suggestions</span>
      </div>
    </div>
  )
}
