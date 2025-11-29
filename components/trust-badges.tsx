"use client"

import { Shield, Lock, CreditCard, Award } from "lucide-react"

export function TrustBadges() {
    return (
        <div className="flex flex-wrap items-center justify-center gap-6 py-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="w-5 h-5 text-primary" />
                <span>SSL Secured</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Lock className="w-5 h-5 text-primary" />
                <span>256-bit Encryption</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CreditCard className="w-5 h-5 text-primary" />
                <span>Powered by Stripe</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Award className="w-5 h-5 text-primary" />
                <span>30-Day Money-Back Guarantee</span>
            </div>
        </div>
    )
}
