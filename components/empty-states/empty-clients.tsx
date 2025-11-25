"use client"

import { Users } from "lucide-react"
import { EmptyState } from "./empty-state"
import { useRouter } from "next/navigation"

export function EmptyClients() {
    const router = useRouter()

    return (
        <EmptyState
            icon={Users}
            title="No clients yet"
            description="Start building your client base and track their progress"
            actionLabel="Add Your First Client"
            onAction={() => router.push("/dashboard/clients?action=add")}
            tip="💡 Tip: Share your booking link to let clients sign up automatically"
        />
    )
}
