"use client"

import { Target } from "lucide-react"
import { EmptyState } from "./empty-state"
import { useRouter } from "next/navigation"

export function EmptyPrograms() {
    const router = useRouter()

    return (
        <EmptyState
            icon={Target}
            title="No training programs"
            description="Create structured programs to help your clients reach their goals"
            actionLabel="Create Program"
            onAction={() => router.push("/dashboard/programs?action=create")}
            tip="💡 Example: '12-Week Marathon Prep' or '30-Day Core Challenge'"
        />
    )
}
