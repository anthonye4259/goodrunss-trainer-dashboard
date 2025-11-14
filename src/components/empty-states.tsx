"use client"

import { Users, Calendar, Dumbbell, CreditCard, MessageSquare, TrendingUp, Award, FileText, Target, Bell } from 'lucide-react'
import { EmptyState } from "./empty-state"

export const EmptyStates = {
  NoClients: ({ onAction }: { onAction?: () => void }) => (
    <EmptyState
      icon={Users}
      title="No clients yet"
      description="Start building your client base by adding your first client. Track their progress and help them achieve their fitness goals."
      actionLabel="Add First Client"
      onAction={onAction}
    />
  ),

  NoSessions: ({ onAction }: { onAction?: () => void }) => (
    <EmptyState
      icon={Calendar}
      title="No sessions scheduled"
      description="Your calendar is empty. Schedule your first session with a client to get started."
      actionLabel="Schedule Session"
      onAction={onAction}
    />
  ),

  NoWorkouts: ({ onAction }: { onAction?: () => void }) => (
    <EmptyState
      icon={Dumbbell}
      title="No workouts created"
      description="Build your workout library to quickly assign training plans to clients."
      actionLabel="Create Workout"
      onAction={onAction}
    />
  ),

  NoPayments: () => (
    <EmptyState
      icon={CreditCard}
      title="No payments yet"
      description="Once clients start making payments, you'll see all transactions here."
    />
  ),

  NoMessages: ({ onAction }: { onAction?: () => void }) => (
    <EmptyState
      icon={MessageSquare}
      title="No messages"
      description="Your inbox is empty. Start a conversation with a client to stay connected."
      actionLabel="New Message"
      onAction={onAction}
    />
  ),

  NoAnalytics: () => (
    <EmptyState
      icon={TrendingUp}
      title="Not enough data"
      description="Add clients and schedule sessions to see your performance analytics."
    />
  ),

  NoPrograms: ({ onAction }: { onAction?: () => void }) => (
    <EmptyState
      icon={Award}
      title="No programs created"
      description="Create structured training programs to offer clients comprehensive fitness plans."
      actionLabel="Create Program"
      onAction={onAction}
    />
  ),

  NoReports: () => (
    <EmptyState
      icon={FileText}
      title="No reports available"
      description="Generate your first report to track business performance and client progress."
    />
  ),

  NoGoals: ({ onAction }: { onAction?: () => void }) => (
    <EmptyState
      icon={Target}
      title="No goals set"
      description="Set performance goals to track your progress and stay motivated."
      actionLabel="Set Goal"
      onAction={onAction}
    />
  ),

  NoReminders: ({ onAction }: { onAction?: () => void }) => (
    <EmptyState
      icon={Bell}
      title="No reminders"
      description="Create reminders to stay on top of important tasks and follow-ups."
      actionLabel="Add Reminder"
      onAction={onAction}
    />
  ),
}
