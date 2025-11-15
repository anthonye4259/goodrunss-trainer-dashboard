"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Calendar, TrendingUp, Users, Dumbbell, DollarSign, Target } from "lucide-react"

const agents = [
  {
    title: "BOOKING AGENT",
    description:
      "Showing player feedback and frustration signals. To help everyone maintain good energy and fairness as well as promote top rated courts and communities.",
    icon: Calendar,
    color: "text-[#A4FF4D]",
  },
  {
    title: "FACILITY OPS AGENT",
    description:
      "Showing player feedback and frustration signals. To help everyone maintain good energy and fairness as well as promote top rated courts and communities.",
    icon: Target,
    color: "text-[#A4FF4D]",
  },
  {
    title: "COMMUNITY AGENT",
    description:
      "Showing player feedback and frustration signals. To help everyone maintain good energy and fairness as well as promote top rated courts and communities.",
    icon: Users,
    color: "text-[#A4FF4D]",
  },
  {
    title: "GOLF AGENTS",
    description:
      "Showing player feedback and frustration signals. To help everyone maintain good energy and fairness as well as promote top rated courts and communities.",
    icon: Dumbbell,
    color: "text-[#A4FF4D]",
  },
  {
    title: "REVENUE AGENT",
    description:
      "Showing player feedback and frustration signals. To help everyone maintain good energy and fairness as well as promote top rated courts and communities.",
    icon: DollarSign,
    color: "text-[#A4FF4D]",
  },
  {
    title: "RUNSS PREDICT AGENT",
    description:
      "Showing player feedback and frustration signals. To help everyone maintain good energy and fairness as well as promote top rated courts and communities.",
    icon: TrendingUp,
    color: "text-[#A4FF4D]",
  },
]

export default function GIAPage() {
  return (
    <div className="min-h-screen bg-[hsl(215,30%,12%)] p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-wider text-white mb-6">GOODRUNSS INTELLIGENCE AGENTS</h1>

        {/* Greeting Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-2">
            <span className="text-xl text-white">Hi ! It's</span>
            <span className="text-xl font-bold text-[#A4FF4D]">GIA</span>
          </div>
          <Button
            variant="outline"
            className="bg-[hsl(215,25%,25%)] border-[hsl(215,20%,35%)] text-white hover:bg-[hsl(215,25%,30%)] rounded-full px-6"
          >
            <span className="mr-2">💡</span>
            SHOULD WE RUN FACILITY OPS FOR YOU?
          </Button>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl">
        {agents.map((agent, index) => (
          <Card
            key={index}
            className="bg-[hsl(215,25%,22%)] border-[hsl(215,20%,30%)] hover:border-[#A4FF4D]/30 transition-all duration-300"
          >
            <CardHeader>
              <CardTitle className="text-[#A4FF4D] text-lg font-bold tracking-wide">{agent.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-300 text-sm leading-relaxed">{agent.description}</p>
              <Button
                variant="ghost"
                className="text-[#A4FF4D] hover:text-[#A4FF4D] hover:bg-[#A4FF4D]/10 p-0 h-auto font-semibold"
              >
                Manage
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
