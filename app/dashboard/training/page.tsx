"use client"

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ClipboardList, Library, Layers, FileText, Video } from "lucide-react"
import Link from "next/link"

const trainingTools = [
  {
    title: "Workouts",
    description: "Create and manage workout sessions",
    icon: ClipboardList,
    href: "/dashboard/workouts",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  {
    title: "Exercises",
    description: "Browse and create exercise library",
    icon: Library,
    href: "/dashboard/exercises",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    title: "Programs",
    description: "Design long-term training programs",
    icon: Layers,
    href: "/dashboard/programs",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    title: "Training Plans",
    description: "Create structured training schedules",
    icon: FileText,
    href: "/dashboard/training-plans",
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  {
    title: "Video Library",
    description: "Manage training videos and demos",
    icon: Video,
    href: "/dashboard/video-library",
    color: "text-pink-500",
    bg: "bg-pink-500/10",
  },
]

export default function TrainingPage() {
  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Training Hub</h1>
        <p className="text-muted-foreground mt-2">
          Create and manage all your training content and programs
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {trainingTools.map((tool) => (
          <Link key={tool.href} href={tool.href}>
            <Card className="hover:border-primary/50 transition-all cursor-pointer h-full">
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg ${tool.bg} flex items-center justify-center mb-4`}>
                  <tool.icon className={`h-6 w-6 ${tool.color}`} />
                </div>
                <CardTitle>{tool.title}</CardTitle>
                <CardDescription>{tool.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

