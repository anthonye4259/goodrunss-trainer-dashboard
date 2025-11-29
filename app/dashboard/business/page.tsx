"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, BarChart3, FileText } from "lucide-react"
import Link from "next/link"

const businessTools = [
  {
    title: "Payments",
    description: "Manage payments, invoices, and transactions",
    icon: DollarSign,
    href: "/dashboard/payments",
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  {
    title: "Analytics",
    description: "Track performance metrics and insights",
    icon: BarChart3,
    href: "/dashboard/analytics",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    title: "Reports",
    description: "Generate business reports and summaries",
    icon: FileText,
    href: "/dashboard/reports",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
]

export default function BusinessPage() {
  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Business Hub</h1>
        <p className="text-muted-foreground mt-2">
          Manage your finances, track performance, and analyze your business
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {businessTools.map((tool) => (
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

