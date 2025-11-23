"use client"

import { Brain, Dumbbell, Apple, Heart, TrendingUp, Trophy, Flower2 } from "lucide-react"

export type GIAMode = 'programming' | 'nutrition' | 'rehab' | 'business' | 'psychology' | 'sports' | 'wellness'

interface GIAModeSelectorProps {
  selectedMode: GIAMode
  onModeChange: (mode: GIAMode) => void
}

const MODES = [
  {
    id: 'wellness' as GIAMode,
    name: 'Wellness',
    icon: Flower2,
    description: 'Yoga, Pilates, Barre & mindfulness',
    color: 'text-teal-500',
    bgColor: 'bg-teal-500/10',
  },
  {
    id: 'sports' as GIAMode,
    name: 'Sports',
    icon: Trophy,
    description: 'Sport-specific training',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
  },
  {
    id: 'nutrition' as GIAMode,
    name: 'Nutrition',
    icon: Apple,
    description: 'Meal plans & macros',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  {
    id: 'programming' as GIAMode,
    name: 'Programming',
    icon: Dumbbell,
    description: 'Workout plans & periodization',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    id: 'rehab' as GIAMode,
    name: 'Rehab',
    icon: Heart,
    description: 'Injury prevention & recovery',
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
  },
  {
    id: 'business' as GIAMode,
    name: 'Business',
    icon: TrendingUp,
    description: 'Growth & marketing',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
  {
    id: 'psychology' as GIAMode,
    name: 'Psychology',
    icon: Brain,
    description: 'Client motivation & habits',
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10',
  },
]

export function GIAModeSelector({ selectedMode, onModeChange }: GIAModeSelectorProps) {
  return (
    <div className="border-b bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <div className="px-4 py-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            GIA Expert Mode:
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {MODES.map((mode) => {
            const Icon = mode.icon
            const isSelected = selectedMode === mode.id
            
            return (
              <button
                key={mode.id}
                onClick={() => onModeChange(mode.id)}
                className={`
                  flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all
                  ${isSelected 
                    ? `${mode.bgColor} border-current ${mode.color}` 
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }
                `}
              >
                <Icon className={`h-5 w-5 ${isSelected ? mode.color : 'text-gray-500'}`} />
                <span className={`text-xs font-medium ${isSelected ? mode.color : 'text-gray-600 dark:text-gray-400'}`}>
                  {mode.name}
                </span>
              </button>
            )
          })}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          {MODES.find(m => m.id === selectedMode)?.description}
        </p>
      </div>
    </div>
  )
}

