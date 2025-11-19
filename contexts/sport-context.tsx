"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"

type SportType =
  | "PERSONAL_TRAINING"
  | "PICKLEBALL"
  | "BASKETBALL"
  | "TENNIS"
  | "GOLF"
  | "YOGA"
  | "PILATES"
  | "BARRE"
  | "STRENGTH_CONDITIONING"
  | "OTHER"

interface SportTerminology {
  sessionSingular: string // "Session", "Lesson", "Class", "Round"
  sessionPlural: string // "Sessions", "Lessons", "Classes", "Rounds"
  clientSingular: string // "Client", "Student", "Player", "Golfer"
  clientPlural: string // "Clients", "Students", "Players", "Golfers"
  workoutSingular: string // "Workout", "Practice", "Flow", "Round"
  workoutPlural: string // "Workouts", "Practices", "Flows", "Rounds"
  verb: string // "Training", "Instructing", "Coaching", "Teaching"
  location: string // "Gym", "Court", "Studio", "Course"
}

const sportTerminology: Record<SportType, SportTerminology> = {
  PERSONAL_TRAINING: {
    sessionSingular: "Session",
    sessionPlural: "Sessions",
    clientSingular: "Client",
    clientPlural: "Clients",
    workoutSingular: "Workout",
    workoutPlural: "Workouts",
    verb: "Training",
    location: "Gym",
  },
  PICKLEBALL: {
    sessionSingular: "Lesson",
    sessionPlural: "Lessons",
    clientSingular: "Student",
    clientPlural: "Students",
    workoutSingular: "Practice",
    workoutPlural: "Practices",
    verb: "Instructing",
    location: "Court",
  },
  BASKETBALL: {
    sessionSingular: "Session",
    sessionPlural: "Sessions",
    clientSingular: "Player",
    clientPlural: "Players",
    workoutSingular: "Practice",
    workoutPlural: "Practices",
    verb: "Coaching",
    location: "Court",
  },
  TENNIS: {
    sessionSingular: "Lesson",
    sessionPlural: "Lessons",
    clientSingular: "Student",
    clientPlural: "Students",
    workoutSingular: "Practice",
    workoutPlural: "Practices",
    verb: "Instructing",
    location: "Court",
  },
  GOLF: {
    sessionSingular: "Lesson",
    sessionPlural: "Lessons",
    clientSingular: "Golfer",
    clientPlural: "Golfers",
    workoutSingular: "Round",
    workoutPlural: "Rounds",
    verb: "Coaching",
    location: "Course",
  },
  YOGA: {
    sessionSingular: "Class",
    sessionPlural: "Classes",
    clientSingular: "Student",
    clientPlural: "Students",
    workoutSingular: "Flow",
    workoutPlural: "Flows",
    verb: "Teaching",
    location: "Studio",
  },
  PILATES: {
    sessionSingular: "Class",
    sessionPlural: "Classes",
    clientSingular: "Client",
    clientPlural: "Clients",
    workoutSingular: "Session",
    workoutPlural: "Sessions",
    verb: "Instructing",
    location: "Studio",
  },
  BARRE: {
    sessionSingular: "Class",
    sessionPlural: "Classes",
    clientSingular: "Student",
    clientPlural: "Students",
    workoutSingular: "Class",
    workoutPlural: "Classes",
    verb: "Teaching",
    location: "Studio",
  },
  STRENGTH_CONDITIONING: {
    sessionSingular: "Session",
    sessionPlural: "Sessions",
    clientSingular: "Athlete",
    clientPlural: "Athletes",
    workoutSingular: "Training",
    workoutPlural: "Training Sessions",
    verb: "Conditioning",
    location: "Gym",
  },
  OTHER: {
    sessionSingular: "Session",
    sessionPlural: "Sessions",
    clientSingular: "Client",
    clientPlural: "Clients",
    workoutSingular: "Workout",
    workoutPlural: "Workouts",
    verb: "Training",
    location: "Location",
  },
}

interface SportContextType {
  sportType: SportType
  setSportType: (type: SportType) => void
  terminology: SportTerminology
  getSportDisplayName: () => string
}

const SportContext = createContext<SportContextType | undefined>(undefined)

export function SportProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser()
  const [sportType, setSportTypeState] = useState<SportType>("PERSONAL_TRAINING")

  // Load sport type from localStorage or user metadata
  useEffect(() => {
    const savedSport = localStorage.getItem("trainerSportType") as SportType
    if (savedSport && sportTerminology[savedSport]) {
      setSportTypeState(savedSport)
    } else if (user?.publicMetadata?.sportType) {
      setSportTypeState(user.publicMetadata.sportType as SportType)
    }
  }, [user])

  const setSportType = (type: SportType) => {
    setSportTypeState(type)
    localStorage.setItem("trainerSportType", type)
    // TODO: Also save to database/Clerk metadata
  }

  const getSportDisplayName = () => {
    const names: Record<SportType, string> = {
      PERSONAL_TRAINING: "Personal Training",
      PICKLEBALL: "Pickleball",
      BASKETBALL: "Basketball",
      TENNIS: "Tennis",
      GOLF: "Golf",
      YOGA: "Yoga",
      PILATES: "Pilates",
      BARRE: "Barre",
      STRENGTH_CONDITIONING: "Strength & Conditioning",
      OTHER: "Fitness/Wellness",
    }
    return names[sportType]
  }

  return (
    <SportContext.Provider
      value={{
        sportType,
        setSportType,
        terminology: sportTerminology[sportType],
        getSportDisplayName,
      }}
    >
      {children}
    </SportContext.Provider>
  )
}

export function useSport() {
  const context = useContext(SportContext)
  if (!context) {
    throw new Error("useSport must be used within SportProvider")
  }
  return context
}

