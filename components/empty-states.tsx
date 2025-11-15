import {
  Users,
  Calendar,
  Dumbbell,
  CreditCard,
  MessageSquare,
  FileText,
  TrendingUp,
  Video,
  Bell,
  Package,
} from "lucide-react"
import { EmptyState } from "./empty-state"

export function NoClientsState({ onAddClient }: { onAddClient?: () => void }) {
  return (
    <EmptyState
      icon={Users}
      title="No Clients Yet"
      description="Start building your client roster by adding your first client"
      primaryAction={onAddClient ? { label: "Add First Client", onClick: onAddClient } : undefined}
    />
  )
}

export function NoSessionsState({ onScheduleSession }: { onScheduleSession?: () => void }) {
  return (
    <EmptyState
      icon={Calendar}
      title="No Sessions Scheduled"
      description="Your calendar is empty. Schedule your first training session to get started"
      primaryAction={onScheduleSession ? { label: "Schedule Session", onClick: onScheduleSession } : undefined}
    />
  )
}

export function NoWorkoutsState({ onCreateWorkout }: { onCreateWorkout?: () => void }) {
  return (
    <EmptyState
      icon={Dumbbell}
      title="No Workouts Created"
      description="Build your first workout plan to start training your clients"
      primaryAction={onCreateWorkout ? { label: "Create Workout", onClick: onCreateWorkout } : undefined}
    />
  )
}

export function NoPaymentsState({ onCreateInvoice }: { onCreateInvoice?: () => void }) {
  return (
    <EmptyState
      icon={CreditCard}
      title="No Payments Yet"
      description="Start tracking your income by creating your first invoice"
      primaryAction={onCreateInvoice ? { label: "Create Invoice", onClick: onCreateInvoice } : undefined}
    />
  )
}

export function NoMessagesState() {
  return (
    <EmptyState
      icon={MessageSquare}
      title="No Messages"
      description="You're all caught up! No new messages at this time"
    />
  )
}

export function NoReportsState({ onCreateReport }: { onCreateReport?: () => void }) {
  return (
    <EmptyState
      icon={FileText}
      title="No Reports Available"
      description="Generate your first report to track client progress and performance"
      primaryAction={onCreateReport ? { label: "Generate Report", onClick: onCreateReport } : undefined}
    />
  )
}

export function NoAnalyticsState() {
  return (
    <EmptyState
      icon={TrendingUp}
      title="Not Enough Data"
      description="Add clients and sessions to see analytics and insights about your business"
    />
  )
}

export function NoVideosState({ onUploadVideo }: { onUploadVideo?: () => void }) {
  return (
    <EmptyState
      icon={Video}
      title="No Videos Uploaded"
      description="Share exercise demonstrations and form tips with your clients"
      primaryAction={onUploadVideo ? { label: "Upload Video", onClick: onUploadVideo } : undefined}
    />
  )
}

export function NoRemindersState({ onCreateReminder }: { onCreateReminder?: () => void }) {
  return (
    <EmptyState
      icon={Bell}
      title="No Reminders Set"
      description="Create reminders to stay on top of important tasks and follow-ups"
      primaryAction={onCreateReminder ? { label: "Create Reminder", onClick: onCreateReminder } : undefined}
    />
  )
}

export function NoProgramsState({ onCreateProgram }: { onCreateProgram?: () => void }) {
  return (
    <EmptyState
      icon={Package}
      title="No Programs Created"
      description="Build structured training programs to offer to your clients"
      primaryAction={onCreateProgram ? { label: "Create Program", onClick: onCreateProgram } : undefined}
    />
  )
}
