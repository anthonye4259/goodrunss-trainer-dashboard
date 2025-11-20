"use client"

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Megaphone, Share2, Gift } from "lucide-react"
import Link from "next/link"

const growthTools = [
  {
    title: "Marketing",
    description: "Create marketing campaigns and strategies",
    icon: Megaphone,
    href: "/dashboard/marketing",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  {
    title: "Social Media",
    description: "Manage social media content and posts",
    icon: Share2,
    href: "/dashboard/social",
    color: "text-pink-500",
    bg: "bg-pink-500/10",
  },
  {
    title: "Referrals",
    description: "Track and manage referral programs",
    icon: Gift,
    href: "/dashboard/referrals",
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
]

export default function GrowthPage() {
  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Growth Hub</h1>
        <p className="text-muted-foreground mt-2">
          Grow your business with marketing, social media, and referrals
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {growthTools.map((tool) => (
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

