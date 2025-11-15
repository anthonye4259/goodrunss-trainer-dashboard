import { cn } from "@/lib/utils"

const specialtyEmojis: Record<string, string> = {
  basketball: "🏀",
  pickleball: "🏓",
  tennis: "🎾",
  volleyball: "🏐",
  yoga: "🧘‍♀️",
  pilates: "🤸‍♀️",
  barre: "💃",
  strength: "💪",
  hiit: "⚡",
  crossfit: "🏋️‍♀️",
  running: "🏃‍♀️",
  cycling: "🚴‍♀️",
  swimming: "🏊‍♀️",
  "martial-arts": "🥋",
  boxing: "🥊",
  dance: "💃",
  soccer: "⚽",
  golf: "⛳",
  nutrition: "🥗",
  wellness: "🌿",
  performance: "🎯",
  general: "💪",
}

const specialtyLabels: Record<string, string> = {
  basketball: "Basketball Coach",
  pickleball: "Pickleball Instructor",
  tennis: "Tennis Instructor",
  volleyball: "Volleyball Coach",
  yoga: "Yoga Instructor",
  pilates: "Pilates Instructor",
  barre: "Barre Instructor",
  strength: "Strength & Conditioning",
  hiit: "HIIT Trainer",
  crossfit: "CrossFit Coach",
  running: "Running Coach",
  cycling: "Cycling Coach",
  swimming: "Swimming Coach",
  "martial-arts": "Martial Arts Instructor",
  boxing: "Boxing Coach",
  dance: "Dance Instructor",
  soccer: "Soccer Coach",
  golf: "Golf Instructor",
  nutrition: "Nutrition Coach",
  wellness: "Wellness Coach",
  performance: "Sports Performance",
  general: "General Training",
}

interface SpecialtyBadgeProps {
  specialty: string
  variant?: "default" | "large" | "compact"
  className?: string
}

export function SpecialtyBadge({ specialty, variant = "default", className }: SpecialtyBadgeProps) {
  const emoji = specialtyEmojis[specialty] || "💪"
  const label = specialtyLabels[specialty] || specialty

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 font-medium text-primary",
        variant === "large" && "px-4 py-2 text-base",
        variant === "default" && "px-3 py-1.5 text-sm",
        variant === "compact" && "px-2 py-1 text-xs",
        className,
      )}
    >
      <span className={cn(variant === "large" && "text-xl", variant === "compact" && "text-sm")}>{emoji}</span>
      <span>{label}</span>
    </div>
  )
}
