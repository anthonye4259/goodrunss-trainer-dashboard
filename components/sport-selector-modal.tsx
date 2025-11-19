"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useSport } from "@/contexts/sport-context"
import {
  Dumbbell,
  Users,
  Heart,
  Trophy,
  Target,
  Activity,
} from "lucide-react"

const sportOptions = [
  { id: "PERSONAL_TRAINING", label: "Personal Training", icon: Dumbbell, color: "bg-blue-500" },
  { id: "PICKLEBALL", label: "Pickleball", icon: Activity, color: "bg-green-500" },
  { id: "BASKETBALL", label: "Basketball", icon: Trophy, color: "bg-orange-500" },
  { id: "TENNIS", label: "Tennis", icon: Target, color: "bg-yellow-500" },
  { id: "GOLF", label: "Golf", icon: Target, color: "bg-emerald-500" },
  { id: "YOGA", label: "Yoga", icon: Heart, color: "bg-purple-500" },
  { id: "PILATES", label: "Pilates", icon: Activity, color: "bg-pink-500" },
  { id: "BARRE", label: "Barre", icon: Users, color: "bg-red-500" },
  { id: "STRENGTH_CONDITIONING", label: "Strength & Conditioning", icon: Dumbbell, color: "bg-gray-500" },
  { id: "OTHER", label: "Other Fitness/Wellness", icon: Heart, color: "bg-slate-500" },
]

export function SportSelectorModal() {
  const [showModal, setShowModal] = useState(false)
  const { sportType, setSportType } = useSport()

  useEffect(() => {
    // Show modal if sport not selected
    const hasSport = localStorage.getItem("trainerSportType")
    if (!hasSport) {
      setShowModal(true)
    }
  }, [])

  const handleSelect = (sportId: string) => {
    setSportType(sportId as any)
    setShowModal(false)
  }

  if (!showModal) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <Card className="max-w-4xl w-full p-8 bg-gray-900 border-gray-700">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            What do you specialize in?
          </h2>
          <p className="text-gray-400">
            This helps us customize your dashboard with the right terminology
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {sportOptions.map((sport) => {
            const Icon = sport.icon
            return (
              <button
                key={sport.id}
                onClick={() => handleSelect(sport.id)}
                className="flex flex-col items-center gap-3 p-6 rounded-lg border-2 border-gray-700 hover:border-green-500 hover:bg-gray-800 transition-all group"
              >
                <div className={`${sport.color} w-16 h-16 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <span className="text-sm font-medium text-white text-center">
                  {sport.label}
                </span>
              </button>
            )
          })}
        </div>

        <div className="mt-8 text-center text-sm text-gray-400">
          You can change this anytime in Settings
        </div>
      </Card>
    </div>
  )
}

