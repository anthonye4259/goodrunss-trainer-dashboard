"use client"

import { Calendar, Users, ShoppingBag, Sparkles, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"

export function EmptyCalendar() {
  return (
    <Card className="p-12 text-center">
      <div className="inline-flex p-4 bg-primary/10 rounded-full mb-4">
        <Calendar className="h-12 w-12 text-primary" />
      </div>
      <h3 className="text-2xl font-bold mb-2">No Sessions Yet</h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        Start scheduling sessions with your clients. Add your first session to get started!
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button asChild className="bg-primary hover:bg-primary/90">
          <Link href="/dashboard/availability">
            Set Availability <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard">Share Booking Link</Link>
        </Button>
      </div>
      <div className="mt-8 bg-primary/5 border border-primary/20 rounded-lg p-4 max-w-lg mx-auto">
        <p className="text-sm text-muted-foreground">
          💡 <span className="font-semibold text-foreground">Quick Tip:</span> Set up your availability first, then share your booking link with clients. They can book sessions directly!
        </p>
      </div>
    </Card>
  )
}

export function EmptyClients() {
  return (
    <Card className="p-12 text-center">
      <div className="inline-flex p-4 bg-primary/10 rounded-full mb-4">
        <Users className="h-12 w-12 text-primary" />
      </div>
      <h3 className="text-2xl font-bold mb-2">No Clients Yet</h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        Start building your client roster. Share your booking link to get your first clients!
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button asChild className="bg-primary hover:bg-primary/90">
          <Link href="/dashboard">
            Get Booking Link <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard/clients/new">Add Client Manually</Link>
        </Button>
      </div>
      <div className="mt-8 bg-primary/5 border border-primary/20 rounded-lg p-4 max-w-lg mx-auto">
        <p className="text-sm text-muted-foreground">
          💡 <span className="font-semibold text-foreground">Quick Tip:</span> Share your booking link on social media, your website, or in your bio. Clients can book and pay automatically!
        </p>
      </div>
    </Card>
  )
}

export function EmptyServices() {
  return (
    <Card className="p-12 text-center">
      <div className="inline-flex p-4 bg-primary/10 rounded-full mb-4">
        <ShoppingBag className="h-12 w-12 text-primary" />
      </div>
      <h3 className="text-2xl font-bold mb-2">No Services Created</h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        Define your training packages, pricing, and what you offer. Clients can see these when booking!
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button asChild className="bg-primary hover:bg-primary/90">
          <Link href="/dashboard/services">
            Create First Service <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
      <div className="mt-8 bg-primary/5 border border-primary/20 rounded-lg p-4 max-w-lg mx-auto">
        <p className="text-sm text-muted-foreground">
          💡 <span className="font-semibold text-foreground">Examples:</span> 1-on-1 Training ($50/hr), Group Sessions ($25/person), Monthly Package ($400/month)
        </p>
      </div>
    </Card>
  )
}

export function EmptyAIContent() {
  return (
    <Card className="p-12 text-center">
      <div className="inline-flex p-4 bg-primary/10 rounded-full mb-4">
        <Sparkles className="h-12 w-12 text-primary" />
      </div>
      <h3 className="text-2xl font-bold mb-2">Start Creating with AI</h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        Generate social media posts, workout plans, and marketing content in seconds with GIA, your AI assistant.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button asChild className="bg-primary hover:bg-primary/90">
          <Link href="/dashboard/gia">
            Try AI Generator <Sparkles className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard/ai-persona">Create AI Persona</Link>
        </Button>
      </div>
      <div className="mt-8 bg-primary/5 border border-primary/20 rounded-lg p-4 max-w-lg mx-auto">
        <p className="text-sm text-muted-foreground">
          ✨ <span className="font-semibold text-foreground">AI can create:</span> Instagram captions, workout programs, email campaigns, client check-ins, and more!
        </p>
      </div>
    </Card>
  )
}
