"use client"

import { Calendar } from "lucide-react"
import { EmptyState } from "./empty-state"
import { useRouter } from "next/navigation"

export function EmptySessions() {
    const router = useRouter()

    return (
        <EmptyState
            icon={Calendar}
            title="No sessions scheduled"
            description="Schedule your first training session with a client"
            actionLabel="Create Session"
            onAction={() => router.push("/dashboard/sessions?action=create")}
            tip="💡 Tip: Use your booking link to let clients schedule automatically"
        />
    )
}
