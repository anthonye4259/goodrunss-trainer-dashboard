import { Card } from "@/components/ui/card"
import { CheckCircle2, Sparkles } from "lucide-react"

interface BenefitsCardProps {
  benefits?: string[]
}

export function BenefitsCard({ benefits }: BenefitsCardProps) {
  const defaultBenefits = [
    "AI-generated content matches your sport's terminology",
    "Workout plans include sport-specific exercises and drills",
    "Social media posts use relevant hashtags and language",
  ]

  const displayBenefits = benefits || defaultBenefits

  return (
    <Card className="bg-primary/5 border-primary/10 p-4">
      <div className="flex items-start gap-3">
        <Sparkles className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="font-semibold text-white mb-2">What this means for you:</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {displayBenefits.map((benefit, index) => (
              <li key={index} className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  )
}
