"use client"

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingBag, Clock, Package } from "lucide-react"
import Link from "next/link"

const servicesTools = [
  {
    title: "Services & Pricing",
    description: "Manage your services and pricing",
    icon: ShoppingBag,
    href: "/dashboard/services",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    title: "Availability",
    description: "Set your schedule and availability",
    icon: Clock,
    href: "/dashboard/availability",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    title: "Packages",
    description: "Create service packages and bundles",
    icon: Package,
    href: "/dashboard/packages",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
]

export default function ServicesHubPage() {
  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Services Hub</h1>
        <p className="text-muted-foreground mt-2">
          Configure your services, pricing, and availability
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {servicesTools.map((tool) => (
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

