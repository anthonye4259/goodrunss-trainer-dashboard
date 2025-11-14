"use client"

import { Card } from "@/components/ui/card"
import { Check, Sparkles } from 'lucide-react'

interface BenefitsCardProps {
  specialty: string
}

export function BenefitsCard({ specialty }: BenefitsCardProps) {
  const benefits: Record<string, string[]> = {
    "basketball": [
      "Court drill templates and play diagrams",
      "Player development tracking and stats",
      "Game prep and strategy content",
    ],
    "pickleball": [
      "Paddle technique videos and drills",
      "Court positioning strategy guides",
      "Tournament prep and match analysis",
    ],
    "tennis": [
      "Stroke mechanics and footwork drills",
      "Match strategy and mental game tips",
      "Tournament preparation content",
    ],
    "volleyball": [
      "Serve and spike technique breakdowns",
      "Team rotation and positioning guides",
      "Game strategy and play calling",
    ],
    "yoga": [
      "Flow sequence builders and variations",
      "Breathwork (pranayama) guides",
      "Meditation and mindfulness content",
    ],
    "pilates": [
      "Mat and reformer exercise libraries",
      "Core engagement cue cards",
      "Postural alignment guides",
    ],
    "barre": [
      "Ballet-inspired movement sequences",
      "Isometric hold variations",
      "Flexibility and grace training",
    ],
    "strength_training": [
      "Progressive overload programming",
      "Compound lift form guides",
      "Periodization and deload planning",
    ],
    "hiit": [
      "High-intensity interval templates",
      "Work-to-rest ratio calculators",
      "Metabolic conditioning circuits",
    ],
    "crossfit": [
      "WOD (Workout of the Day) generators",
      "Olympic lift technique breakdowns",
      "Functional movement assessments",
    ],
    "running": [
      "Interval and tempo run plans",
      "Form and cadence optimization",
      "Race preparation strategies",
    ],
    "cycling": [
      "Power zone training guides",
      "Hill and interval workouts",
      "Bike fit and positioning tips",
    ],
    "swimming": [
      "Stroke technique video analysis",
      "Pool workout interval sets",
      "Open water training guides",
    ],
    "martial_arts": [
      "Kata and form instruction guides",
      "Sparring technique breakdowns",
      "Belt progression curriculum",
    ],
    "boxing": [
      "Punch combination drills",
      "Footwork and defensive moves",
      "Pad work and conditioning routines",
    ],
    "dance": [
      "Choreography creation tools",
      "Rhythm and musicality exercises",
      "Performance preparation guides",
    ],
    "soccer": [
      "Ball control and passing drills",
      "Tactical positioning guides",
      "Game fitness and conditioning",
    ],
    "golf": [
      "Swing mechanics video analysis",
      "Short game practice routines",
      "Course management strategies",
    ],
    "nutrition": [
      "Meal planning templates",
      "Macro tracking and calculations",
      "Sport-specific nutrition guides",
    ],
    "wellness": [
      "Holistic health assessments",
      "Stress management techniques",
      "Lifestyle balance strategies",
    ],
    "sports_performance": [
      "Athletic performance testing",
      "Speed and agility protocols",
      "Injury prevention programs",
    ],
    "general_fitness": [
      "Balanced workout programming",
      "Form and safety guides",
      "Goal-based training plans",
    ],
  }

  const specialtyBenefits = benefits[specialty] || benefits["general_fitness"]

  return (
    <Card className="border-2 border-dashed border-border bg-card/30 backdrop-blur-sm p-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">What you'll get:</h3>
          <p className="text-sm text-muted-foreground">
            GIA will be customized for {specialty.replace(/_/g, " ")} training
          </p>
        </div>
      </div>
      
      <div className="space-y-2">
        {specialtyBenefits.map((benefit, index) => (
          <div key={index} className="flex items-start gap-2">
            <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-sm text-white">{benefit}</p>
          </div>
        ))}
      </div>
    </Card>
  )
}




