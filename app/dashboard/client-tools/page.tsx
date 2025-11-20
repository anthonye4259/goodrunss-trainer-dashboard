"use client"

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Clock, TrendingDown, AlertTriangle, Bell, UserCheck } from "lucide-react"
import Link from "next/link"

const clientTools = [
  {
    title: "Check-ins",
    description: "Track client progress and check-ins",
    icon: CheckCircle2,
    href: "/dashboard/check-ins",
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  {
    title: "Waitlist",
    description: "Manage waiting lists for sessions",
    icon: Clock,
    href: "/dashboard/waitlist",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    title: "Retention",
    description: "Monitor client retention and engagement",
    icon: TrendingDown,
    href: "/dashboard/retention",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    title: "Conflicts",
    description: "Resolve scheduling conflicts",
    icon: AlertTriangle,
    href: "/dashboard/conflicts",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  {
    title: "Reminders",
    description: "Set up automated client reminders",
    icon: Bell,
    href: "/dashboard/reminders",
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
  },
  {
    title: "Group Classes",
    description: "Manage group training sessions",
    icon: UserCheck,
    href: "/dashboard/group-classes",
    color: "text-pink-500",
    bg: "bg-pink-500/10",
  },
]

export default function ClientToolsPage() {
  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Client Tools</h1>
        <p className="text-muted-foreground mt-2">
          Tools to manage, engage, and retain your clients
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {clientTools.map((tool) => (
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

