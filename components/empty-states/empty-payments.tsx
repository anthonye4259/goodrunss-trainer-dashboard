"use client"

import { DollarSign } from "lucide-react"
import { EmptyState } from "./empty-state"
import { useRouter } from "next/navigation"

export function EmptyPayments() {
    const router = useRouter()

    return (
        <EmptyState
            icon={DollarSign}
            title="No payments yet"
            description="Track client payments and invoices in one place"
            actionLabel="Record Payment"
            onAction={() => router.push("/dashboard/payments?action=add")}
            tip="💡 Connect Stripe for automatic payment tracking through your booking link"
        />
    )
}
